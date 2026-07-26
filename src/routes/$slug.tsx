import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { WeddingShell } from "@/wedding/WeddingShell";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { guestLogin } from "@/auth/guest.functions";
import { WaxSeal } from "@/wedding/WaxSeal";
import { WatercolorBlot, RoseCluster, FloatingPetals } from "@/wedding/FloralDecorations";

export const Route = createFileRoute("/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — A wedding on OurJourney` },
      {
        name: "description",
        content: "A private wedding home for friends and family.",
      },
    ],
  }),
  component: WeddingLayout,
});

const guestSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  invitationCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, "Code is too short")
    .max(32)
    .regex(/^[A-Z0-9-]+$/, "Letters, numbers and dashes only"),
});

function WeddingLayout() {
  const { slug } = Route.useParams();
  const { loading, wedding, guest, isAdmin, notAuthorized, refresh } = useWedding(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notAuthorized || !wedding) {
    return <NotFoundForGuest slug={slug} />;
  }

  // Has a wedding row. Determine access:
  // - Admins of this wedding always get in (drafts included).
  // - Guests of this wedding get in.
  // - Otherwise (published, but caller is not signed in / wrong wedding), require guest login.
  if (!guest && !isAdmin) {
    return (
      <SiteShell>
        <GuestLoginGate
          slug={slug}
          weddingTitle={wedding.wedding_name ?? slug}
          onSuccess={() => void refresh()}
        />
      </SiteShell>
    );
  }

  // If the wedding is in draft and the visitor is only a guest, hide it.
  if (wedding.status === "draft" && !isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md text-center px-6 py-24">
          <h1 className="font-display text-3xl">Coming soon</h1>
          <p className="mt-3 text-muted-foreground">
            The couple is still finishing their site. You'll be able to view it once
            they publish.
          </p>
        </div>
      </SiteShell>
    );
  }

  return (
    <WeddingShell
      slug={slug}
      title={wedding.wedding_name ?? slug}
      guestFirstName={guest?.first_name}
      isAdmin={isAdmin}
    >
      <Outlet />
    </WeddingShell>
  );
}

function NotFoundForGuest({ slug }: { slug: string }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md text-center px-6 py-24">
        <h1 className="font-display text-3xl">We couldn't find that wedding</h1>
        <p className="mt-3 text-muted-foreground">
          The address <span className="font-mono">/{slug}</span> doesn't lead anywhere
          yet. Double-check the link from your invitation.
        </p>
      </div>
    </SiteShell>
  );
}

function GuestLoginGate({
  slug,
  weddingTitle,
  onSuccess,
}: {
  slug: string;
  weddingTitle: string;
  onSuccess: () => void;
}) {
  const { refresh: refreshAuth } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const parsed = guestSchema.safeParse({
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      invitationCode: form.get("invitationCode"),
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[issue.path[0] as string] = issue.message;
      setErrors(fe);
      return;
    }

    setSubmitting(true);
    try {
      const result = await guestLogin({
        data: { ...parsed.data, weddingSlug: slug },
      });
      if (!result.ok || !result.session) {
        toast.error(result.error ?? "Could not sign you in.");
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
      if (error) {
        toast.error(error.message);
        setSubmitting(false);
        return;
      }
      toast.success(`Welcome, ${result.guest?.first_name}!`);
      await refreshAuth();
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12 sm:py-16 overflow-hidden">
      {/* Dreamy side florals framing the gate */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <WatercolorBlot color="rose" size="2xl" className="absolute -top-20 right-0 opacity-60 rose-glow" />
        <WatercolorBlot color="sage" size="2xl" className="absolute -bottom-32 left-0 opacity-55 rose-glow" style={{ animationDelay: "2s" }} />
        <WatercolorBlot color="peach" size="xl" className="absolute top-1/3 -left-12 opacity-35" style={{ animationDelay: "4s" }} />
        <RoseCluster variant="side-right" size="lg" color="rose" className="absolute top-20 right-0 opacity-95" />
        <RoseCluster variant="side-left" size="lg" color="sage" className="absolute bottom-20 left-0 opacity-90" />
        <FloatingPetals count={12} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block wax-pulse">
            <WaxSeal size={96} />
          </div>
          <p className="font-script text-3xl text-primary mt-4">welcome</p>
          <h1 className="mt-2 text-3xl font-display">{weddingTitle}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter your name and the invitation code from your envelope to open the
            letter.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[1.5rem] border border-border/70 bg-card/80 backdrop-blur-sm p-7 shadow-soft space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Sophie"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Laurent"
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invitationCode">Invitation code</Label>
            <Input
              id="invitationCode"
              name="invitationCode"
              placeholder="ROSE-2026"
              className="uppercase tracking-widest"
              aria-invalid={!!errors.invitationCode}
            />
            {errors.invitationCode && (
              <p className="text-xs text-destructive">{errors.invitationCode}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary hover:bg-primary/90 h-11"
          >
            {submitting ? "Opening…" : "Open my invitation"}
          </Button>
        </form>
      </div>
    </section>
  );
}
