import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2, MessageCircleHeart } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PageCanvas,
  Section,
  SectionHeader,
  ThemedCard,
  ThemedButton,
  FormPanel,
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
  const { slug } = Route.useParams();
  const { wedding, guest, isAdmin } = useWedding(slug);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!wedding) return;
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
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  if (!wedding) return null;

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
    if (!confirm("Delete this message?")) return;
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
      <Section size="hero" width="prose">
        <div className="flex flex-col items-center gap-stack text-center">
          <p className="type-script animate-ds-fade">a wall of wishes</p>
          <h1 className="type-hero animate-ds-reveal">Guestbook</h1>
          <p className="type-body-lg text-muted-foreground max-w-prose animate-ds-reveal" style={{ animationDelay: "120ms" }}>
            Leave the couple a note, a memory, or your best wishes for the road ahead.
          </p>
        </div>
      </Section>

      {guest && (
        <Section size="compact" width="prose">
          <FormPanel>
            <form onSubmit={post} className="space-y-gutter">
              <Textarea
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
        </Section>
      )}

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
            <div className="py-16 text-center text-sm text-muted-foreground">
              Be the first to leave a message.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
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
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <MessageCircleHeart className="w-4 h-4" />
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
                          onClick={() => remove(m.id)}
                          className="text-muted-foreground hover:text-destructive focus-ring-elegant rounded-full p-1"
                          aria-label="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
