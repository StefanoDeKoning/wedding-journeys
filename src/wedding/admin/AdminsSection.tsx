import { useEffect, useState } from "react";
import { Loader2, Trash2, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { listAdmins, inviteCoAdmin, removeCoAdmin, type AdminMember } from "@/auth/admins.functions";
import { logAudit } from "@/wedding/audit";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";

export function AdminsSection({ weddingId }: { weddingId: string }) {
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const { t, tx } = useI18n();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listAdmins({ data: { weddingId } });
      setAdmins(res.admins);
    } catch (e) {
      toast.error(e instanceof Error ? tx(e.message) : t("Could not load admins."));
    }
    setLoading(false);
  };

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

  const isPrimary =
    currentUserId !== null &&
    admins.some((a) => a.user_id === currentUserId && a.role === "primary_admin");

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await inviteCoAdmin({ data: { weddingId, email: email.trim() } });
      if (!res.ok) {
        toast.error(res.error ? tx(res.error) : t("Could not invite."));
      } else {
        toast.success(
          res.member?.created
            ? t("Invite email sent. They'll get admin access after accepting.")
            : t("Co-admin added."),
        );
        void logAudit({
          weddingId,
          action: "admin.invited",
          targetType: "user",
          targetId: res.member?.user_id,
          details: { email: email.trim() },
        });
        setEmail("");
        void load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? tx(err.message) : t("Could not invite."));
    }
    setInviting(false);
  };

  const remove = async (m: AdminMember) => {
    if (m.role === "primary_admin") return;
    if (!confirm(t("Remove {name}?", { name: m.email ?? t("this co-admin") }))) return;
    try {
      const res = await removeCoAdmin({ data: { weddingId, userId: m.user_id } });
      if (!res.ok) {
        toast.error(res.error ? tx(res.error) : t("Could not remove."));
        return;
      }
      void logAudit({
        weddingId,
        action: "admin.removed",
        targetType: "user",
        targetId: m.user_id,
        details: { email: m.email },
      });
      toast.success(t("Removed."));
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? tx(err.message) : t("Could not remove."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">{t("Co-admins")}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("Co-admins can manage guests and RSVPs, but can't add or remove other admins.")}
        </p>
      </section>

      {isPrimary && (
        <form
          onSubmit={invite}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3"
        >
          <Label htmlFor="inv-email">{t("Invite by email")}</Label>
          <div className="flex gap-2">
            <Input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("friend@example.com")}
              maxLength={255}
              required
            />
            <Button type="submit" disabled={inviting || !email.trim()} className="rounded-full">
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("Invite")}
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("Existing accounts get access immediately. New ones receive an invite email.")}
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
                  {m.role === "primary_admin" ? t("Primary admin") : t("Co-admin")}
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
