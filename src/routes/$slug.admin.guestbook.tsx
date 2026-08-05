import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MessageCircleHeart, Trash2, Eye, EyeOff } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";

export const Route = createFileRoute("/$slug/admin/guestbook")({
  component: AdminGuestbook,
});

interface Message {
  id: string;
  guest_id: string | null;
  author_name: string;
  message: string;
  status: "visible" | "hidden";
  created_at: string;
}

function AdminGuestbook() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("guestbook_messages")
      .select("id, guest_id, author_name, message, status, created_at")
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

  const toggleStatus = async (m: Message) => {
    const next = m.status === "visible" ? "hidden" : "visible";
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
    const { error } = await supabase.from("guestbook_messages").update({ status: next }).eq("id", m.id);
    if (error) {
      toast.error(error.message);
      void load();
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: next === "hidden" ? "guestbook.hidden" : "guestbook.shown",
        targetType: "guestbook_message",
        targetId: m.id,
      });
    }
  };

  const remove = async (m: Message) => {
    if (!confirm(`Delete this message from ${m.author_name}?`)) return;
    const { error } = await supabase.from("guestbook_messages").delete().eq("id", m.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "guestbook.removed",
        targetType: "guestbook_message",
        targetId: m.id,
        details: { author: m.author_name },
      });
    }
    toast.success("Removed.");
    void load();
  };

  if (!wedding) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <MessageCircleHeart className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">Guestbook</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {messages.length} message{messages.length === 1 ? "" : "s"} from your guests. Hide anything
          you don't want shown on the public wall.
        </p>
      </section>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : messages.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No messages yet.
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors ${
                m.status === "hidden" ? "opacity-60" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{m.author_name}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{m.message}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStatus(m)}
                title={m.status === "visible" ? "Hide from guests" : "Show to guests"}
              >
                {m.status === "visible" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(m)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
