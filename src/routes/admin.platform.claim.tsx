import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";
import {
  claimPlatformOwner,
  isPlatformOwnerBootstrapAvailable,
} from "@/auth/platform.functions";
import { tHead, useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/platform/claim")({
  head: () => ({
    meta: [
      { title: tHead("Claim platform owner — OurJourney") },
      { name: "description", content: tHead("Bootstrap the first platform owner account.") },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimPage,
});

function ClaimPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t, tx } = useI18n();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isPlatformOwnerBootstrapAvailable()
      .then((r) => {
        if (!cancelled) setAvailable(r.available);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaim = async () => {
    setSubmitting(true);
    try {
      const res = await claimPlatformOwner();
      if (!res.ok) {
        toast.error(tx(res.reason));
        setSubmitting(false);
        return;
      }
      toast.success(t("You are now the platform owner."));
      await auth.refresh();
      void navigate({ to: "/admin/platform" });
    } catch (err) {
      toast.error(err instanceof Error ? tx(err.message) : t("Could not complete claim."));
      setSubmitting(false);
    }
  };

  if (auth.loading || available === null) {
    return (
      <SiteShell>
        <section className="py-32 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 pt-20 pb-28">
        <div className="text-center mb-10">
          <p className="font-script text-3xl text-primary flex items-center gap-2 justify-center">
            <Crown className="w-6 h-6" /> {t("bootstrap")}
          </p>
          <h1 className="mt-3 text-4xl">{t("Platform owner")}</h1>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-card shadow-soft p-8 space-y-5">
          {!available ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t("A platform owner already exists.")}
              </div>
              <p className="text-sm">
                {t(
                  "The bootstrap window is closed. Existing platform owners can grant the role to other accounts from the database.",
                )}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full h-11"
              >
                <Link to="/login">{t("Back to sign in")}</Link>
              </Button>
            </>
          ) : !auth.user ? (
            <>
              <p className="text-sm">
                {t(
                  "No platform owner exists yet. Sign in (or create an account) first, then return to this page to claim the role.",
                )}
              </p>
              <Button asChild className="w-full rounded-full h-11 bg-primary hover:bg-primary/90">
                <Link to="/login">{t("Sign in to continue")}</Link>
              </Button>
            </>
          ) : auth.isPlatformOwner ? (
            <>
              <p className="text-sm">{t("You're already the platform owner.")}</p>
              <Button asChild className="w-full rounded-full h-11 bg-primary hover:bg-primary/90">
                <Link to="/admin/platform">{t("Open dashboard")}</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm">
                {t("You're signed in as")}{" "}
                <span className="font-medium text-foreground">{auth.user.email}</span>.{" "}
                {t(
                  "Click below to claim the platform owner role. This is only possible while no platform owner exists.",
                )}
              </p>
              <Button
                onClick={handleClaim}
                disabled={submitting}
                className="w-full rounded-full h-11 bg-primary hover:bg-primary/90"
              >
                {submitting ? t("Claiming…") : t("Claim platform owner")}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                {t("You won't be able to undo this from the UI.")}
              </p>
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
