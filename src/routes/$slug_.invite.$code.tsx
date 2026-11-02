import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { guestLoginByCode } from "@/auth/guest.functions";
import { WaxSeal } from "@/wedding/WaxSeal";
import { PageCanvas, Section, ThemedCard, ThemedButton } from "@/design-system";
import { tHead, useI18n } from "@/i18n";

export const Route = createFileRoute("/$slug_/invite/$code")({
  head: () => ({
    meta: [
      { title: tHead("Your personal invitation — OurJourney") },
      {
        name: "description",
        content: tHead("Open your personal wedding invitation."),
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: tHead("Your personal invitation — OurJourney") },
      { property: "og:description", content: tHead("Open your personal wedding invitation.") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { slug, code } = Route.useParams();
  const navigate = useNavigate();
  const loginByCode = useServerFn(guestLoginByCode);
  const { refresh } = useAuth();
  const { t, tx } = useI18n();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const result = await loginByCode({
          data: { weddingSlug: slug, invitationCode: code },
        });
        if (!result.ok || !result.session) {
          setErrorMsg(result.error ? tx(result.error) : t("We couldn't open your invitation."));
          setStatus("error");
          return;
        }
        const { error } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        if (error) {
          setErrorMsg(tx(error.message));
          setStatus("error");
          return;
        }
        toast.success(t("Welcome, {name}!", { name: result.guest?.first_name ?? "" }));
        await refresh();
        void navigate({ to: "/$slug", params: { slug: result.guest?.wedding_slug ?? slug }, replace: true });
      } catch (err) {
        setErrorMsg(err instanceof Error ? tx(err.message) : t("Could not open invitation."));
        setStatus("error");
      }
    })();
  }, [slug, code, navigate, refresh, loginByCode, t, tx]);

  return (
    <SiteShell>
      <PageCanvas density="quiet">
        <Section size="hero" width="prose">
          {status === "loading" ? (
            <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
              <div className="wax-pulse">
                <WaxSeal size={80} />
              </div>
              <p className="type-script-sm">{t("a moment, please")}</p>
              <p className="type-body text-muted-foreground">{t("Opening your invitation…")}</p>
            </div>
          ) : (
            <ThemedCard variant="framed" className="mx-auto max-w-sm text-center" ornament>
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/12 text-destructive">
                <AlertTriangle aria-hidden="true" className="h-5 w-5" />
              </span>
              <h1 className="type-card-title mt-4">{t("This invitation link isn't working")}</h1>
              <p className="type-body mt-2 text-muted-foreground">{errorMsg}</p>
              <ThemedButton onClick={() => navigate({ to: "/login" })} size="lg" className="mt-6">
                {t("Sign in manually")}
              </ThemedButton>
            </ThemedCard>
          )}
        </Section>
      </PageCanvas>
    </SiteShell>
  );
}
