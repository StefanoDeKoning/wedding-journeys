import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2, MessageCircleHeart } from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  ThemedCard,
  ThemedButton,
  ThemedTextarea,
  FormPanel,
  Hero,
  EmptyState,
  ConfirmDialog,
} from "@/design-system";

export const Route = createFileRoute("/$slug/guestbook")({
  head: () => ({
    meta: [
      { title: "Guestbook" },
      { name: "description", content: "Leave a message for the couple." },
    ],
  }),
  component: GuestbookPage,
});

interface Message {
  id: string;
  guest_id: string | null;
  author_name: string;
  message: string;
  created_at: string;
}

function GuestbookPage() {
  const { wedding, guest, isAdmin } = useWeddingContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("guestbook_messages")
      .select("id, guest_id, author_name, message, created_at")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setMessages((data ?? []) as Message[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) {
      toast.error("Only signed-in guests can sign the guestbook.");
      return;
    }
    if (!text.trim()) {
      toast.error("Write a little something first.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("guestbook_messages").insert({
      wedding_id: wedding.id,
      guest_id: guest.id,
      author_name: `${guest.first_name} ${guest.last_name}`,
      message: text.trim().slice(0, 1000),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
    toast.success("Thank you for the kind words!");
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("guestbook_messages").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed.");
    void load();
  };

  return (
    <PageCanvas density="regular">
      <Container width="prose">
        <Hero
          script="a wall of wishes"
          title="Guestbook"
          subtitle="Leave the couple a note, a memory, or your best wishes for the road ahead."
        />
      </Container>

      <Section size="compact" width="prose">
        {guest ? (
          <FormPanel>
            <form onSubmit={post} className="space-y-gutter">
              <ThemedTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Wishing you both a lifetime of love and laughter…"
                rows={4}
                maxLength={1000}
                disabled={submitting}
              />
              <ThemedButton type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? "Sending…" : "Sign the guestbook"}
              </ThemedButton>
            </form>
          </FormPanel>
        ) : (
          <ThemedCard className="mx-auto max-w-prose text-center">
            <p className="type-body text-muted-foreground">
              Sign in with your invitation code to leave a message.
            </p>
          </ThemedCard>
        )}
      </Section>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this message?"
        description="This can't be undone."
        onConfirm={() => {
          if (pendingDeleteId) void remove(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />

      <Section size="spacious" width="content">
        <SectionHeader
          eyebrow="from the heart"
          title={`${messages.length} message${messages.length === 1 ? "" : "s"} so far`}
        />

        <div className="mt-block">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              motif="rose"
              title="Be the first to leave a message"
              description="Your note will appear here for the couple to treasure."
            />
          ) : (
            <div className="grid gap-gutter sm:grid-cols-2">
              {messages.map((m, i) => {
                const mine = guest && m.guest_id === guest.id;
                const canDelete = mine || isAdmin;
                return (
                  <ThemedCard
                    key={m.id}
                    variant="paper"
                    interactive
                    className={i % 2 === 0 ? "animate-ds-reveal-left" : "animate-ds-reveal-right"}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <MessageCircleHeart aria-hidden="true" className="w-5 h-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="type-body text-muted-foreground whitespace-pre-line">{m.message}</p>
                        <p className="type-caption mt-3">
                          {m.author_name}
                          {mine && " · you"}
                        </p>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(m.id)}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-destructive focus-ring-elegant"
                          aria-label="Delete message"
                        >
                          <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </ThemedCard>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </PageCanvas>
  );
}
