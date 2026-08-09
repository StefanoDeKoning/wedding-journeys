import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { WeddingProvider } from "@/wedding/WeddingContext";
import { WeddingShell } from "@/wedding/WeddingShell";
import { SiteShell } from "@/components/SiteShell";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { guestLogin } from "@/auth/guest.functions";
import { WaxSeal, initialsFromCouple } from "@/wedding/WaxSeal";
import { PageCanvas, Section, FormPanel, ThemedButton, ThemedInput } from "@/design-system";

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
      <PageCanvas decor={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </PageCanvas>
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
        <PageCanvas density="quiet">
          <Section size="hero" width="prose">
            <div className="text-center">
              <h1 className="type-hero">Coming soon</h1>
              <p className="type-body-lg mt-3 text-muted-foreground">
                The couple is still finishing their site. You'll be able to view it once
                they publish.
              </p>
              <ThemedButton asChild variant="ghost" size="md" className="mt-6">
                <Link to="/">Back to OurJourney</Link>
              </ThemedButton>
            </div>
          </Section>
        </PageCanvas>
      </SiteShell>
    );
  }

  return (
    <WeddingProvider value={{ wedding, guest, isAdmin, refresh }}>
      <WeddingShell
        slug={slug}
        title={wedding.wedding_name ?? slug}
        guestFirstName={guest?.first_name}
        isAdmin={isAdmin}
      >
        <Outlet />
      </WeddingShell>
    </WeddingProvider>
  );
}

function NotFoundForGuest({ slug }: { slug: string }) {
  return (
    <SiteShell>
      <PageCanvas density="quiet">
        <Section size="hero" width="prose">
          <div className="text-center">
            <h1 className="type-hero">We couldn't find that wedding</h1>
            <p className="type-body-lg mt-3 text-muted-foreground">
              The address <span className="font-mono">/{slug}</span> doesn't lead anywhere
              yet. Double-check the link from your invitation.
            </p>
            <ThemedButton asChild variant="ghost" size="md" className="mt-6">
              <Link to="/">Back to OurJourney</Link>
            </ThemedButton>
          </div>
        </Section>
      </PageCanvas>
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
    <PageCanvas density="lavish">
      <Section size="hero" width="prose">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block wax-pulse">
              <WaxSeal size={104} initials={initialsFromCouple(weddingTitle)} />
            </div>
            <p className="type-script mt-4">welcome</p>
            <h1 className="type-hero mt-2">{weddingTitle}</h1>
            <p className="type-body mt-3 text-muted-foreground">
              Enter your name and the invitation code from your envelope to open the
              letter.
            </p>
          </div>

          <FormPanel>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-gutter">
              <div className="grid grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <ThemedInput
                    id="firstName"
                    name="firstName"
                    placeholder="Sophie"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="type-caption text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <ThemedInput
                    id="lastName"
                    name="lastName"
                    placeholder="Laurent"
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="type-caption text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="invitationCode">Invitation code</Label>
                <ThemedInput
                  id="invitationCode"
                  name="invitationCode"
                  placeholder="ROSE-2026"
                  className="uppercase tracking-widest"
                  aria-invalid={!!errors.invitationCode}
                />
                {errors.invitationCode && (
                  <p className="type-caption text-destructive">{errors.invitationCode}</p>
                )}
              </div>

              <ThemedButton type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? "Opening…" : "Open my invitation"}
              </ThemedButton>
            </form>
          </FormPanel>
        </div>
      </Section>
    </PageCanvas>
  );
}
