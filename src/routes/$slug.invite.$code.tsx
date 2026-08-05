import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { guestLoginByCode } from "@/auth/guest.functions";

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
      <section className="mx-auto max-w-md px-6 pt-24 pb-28 text-center">
        {status === "loading" ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="mt-6 text-muted-foreground">Opening your invitation…</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl mb-3">Invitation not valid</h1>
            <p className="text-muted-foreground mb-8">{errorMsg}</p>
            <Button
              onClick={() => navigate({ to: "/login" })}
              className="rounded-full bg-primary hover:bg-primary/90 h-11 px-8"
            >
              Sign in manually
            </Button>
          </>
        )}
      </section>
    </SiteShell>
  );
}
