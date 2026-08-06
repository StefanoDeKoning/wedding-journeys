import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { guestLoginByCode } from "@/auth/guest.functions";
import { WaxSeal } from "@/wedding/WaxSeal";
import { PageCanvas, Section, ThemedCard, ThemedButton } from "@/design-system";

export const Route = createFileRoute("/$slug/invite/$code")({
  head: () => ({
    meta: [
      { title: "Your invitation" },
      {
        name: "description",
        content: "Open your personal wedding invitation.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { slug, code } = Route.useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const result = await guestLoginByCode({
          data: { weddingSlug: slug, invitationCode: code },
        });
        if (!result.ok || !result.session) {
          setErrorMsg(result.error ?? "We couldn't open your invitation.");
          setStatus("error");
          return;
        }
        const { error } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
          return;
        }
        toast.success(`Welcome, ${result.guest?.first_name}!`);
        await refresh();
        void navigate({ to: "/$slug", params: { slug: result.guest?.wedding_slug ?? slug } });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Could not open invitation.");
        setStatus("error");
      }
    })();
  }, [slug, code, navigate, refresh]);

  return (
    <SiteShell>
      <PageCanvas density="quiet">
        <Section size="hero" width="prose">
          {status === "loading" ? (
            <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center">
              <div className="wax-pulse">
                <WaxSeal size={80} />
              </div>
              <p className="type-script-sm">a moment, please</p>
              <p className="type-body text-muted-foreground">Opening your invitation…</p>
            </div>
          ) : (
            <ThemedCard variant="framed" className="mx-auto max-w-sm text-center" ornament>
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/12 text-destructive">
                <AlertTriangle aria-hidden="true" className="h-5 w-5" />
              </span>
              <h1 className="type-card-title mt-4">This invitation link isn't working</h1>
              <p className="type-body mt-2 text-muted-foreground">{errorMsg}</p>
              <ThemedButton onClick={() => navigate({ to: "/login" })} size="lg" className="mt-6">
                Sign in manually
              </ThemedButton>
            </ThemedCard>
          )}
        </Section>
      </PageCanvas>
    </SiteShell>
  );
}
