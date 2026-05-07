import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2, ShieldCheck, Send } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { listAdmins, inviteCoAdmin, removeCoAdmin, type AdminMember } from "@/auth/admins.functions";
import { logAudit } from "@/wedding/audit";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$slug/admin/admins")({
  component: AdminCoAdmins,
});

function AdminCoAdmins() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    try {
      const res = await listAdmins({ data: { weddingId: wedding.id } });
      setAdmins(res.admins);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load admins.");
    }
    setLoading(false);
  };

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  if (!wedding) return null;

  const isPrimary =
    currentUserId !== null &&
    admins.some((a) => a.user_id === currentUserId && a.role === "primary_admin");

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await inviteCoAdmin({ data: { weddingId: wedding.id, email: email.trim() } });
      if (!res.ok) {
        toast.error(res.error ?? "Could not invite.");
      } else {
        toast.success(
          res.member?.created
            ? "Invite email sent. They'll get admin access after accepting."
            : "Co-admin added.",
        );
        void logAudit({
          weddingId: wedding.id,
          action: "admin.invited",
          targetType: "user",
          targetId: res.member?.user_id,
          details: { email: email.trim() },
        });
        setEmail("");
        void load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite.");
    }
    setInviting(false);
  };

  const remove = async (m: AdminMember) => {
    if (m.role === "primary_admin") return;
    if (!confirm(`Remove ${m.email ?? "this co-admin"}?`)) return;
    try {
      const res = await removeCoAdmin({ data: { weddingId: wedding.id, userId: m.user_id } });
      if (!res.ok) {
        toast.error(res.error ?? "Could not remove.");
        return;
      }
      void logAudit({
        weddingId: wedding.id,
        action: "admin.removed",
        targetType: "user",
        targetId: m.user_id,
        details: { email: m.email },
      });
      toast.success("Removed.");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">Co-admins</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Co-admins can manage guests and RSVPs, but can't add or remove other admins.
        </p>
      </section>

      {isPrimary && (
        <form
          onSubmit={invite}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3"
        >
          <Label htmlFor="inv-email">Invite by email</Label>
          <div className="flex gap-2">
            <Input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              maxLength={255}
              required
            />
            <Button type="submit" disabled={inviting || !email.trim()} className="rounded-full">
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Invite
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Existing accounts get access immediately. New ones receive an invite email.
          </p>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {admins.map((m) => (
            <li key={m.user_id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.email ?? m.user_id}</p>
                <p className="text-xs text-muted-foreground">
                  {m.role === "primary_admin" ? "Primary admin" : "Co-admin"}
                </p>
              </div>
              {isPrimary && m.role !== "primary_admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(m)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
