import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { PageCanvas, Section, ThemedButton } from "@/design-system";

export type GuestFeature = "story" | "gallery" | "playlist" | "guestbook";

const FIELD: Record<GuestFeature, "story_enabled" | "gallery_enabled" | "playlist_enabled" | "guestbook_enabled"> = {
  story: "story_enabled",
  gallery: "gallery_enabled",
  playlist: "playlist_enabled",
  guestbook: "guestbook_enabled",
};

export function isFeatureEnabled(
  wedding: Record<string, unknown>,
  feature: GuestFeature,
): boolean {
  return wedding[FIELD[feature]] !== false;
}

/**
 * Hides a guest-facing section when the couple switched it off in
 * Settings → Guest pages. Admins still see the page (with a notice) so they
 * can keep editing it while it's hidden from guests.
 */
export function TabGate({
  feature,
  children,
}: {
  feature: GuestFeature;
  children: ReactNode;
}) {
  const { wedding, isAdmin } = useWeddingContext();
  const enabled = isFeatureEnabled(wedding as unknown as Record<string, unknown>, feature);

  if (enabled) return <>{children}</>;

  if (isAdmin) {
    return (
      <>
        <div className="mx-auto max-w-3xl px-gutter pt-6">
          <p className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            This page is currently hidden from your guests. Turn it back on in
            Settings → Guest pages.
          </p>
        </div>
        {children}
      </>
    );
  }

  return (
    <PageCanvas density="quiet">
      <Section size="hero" width="prose">
        <div className="text-center">
          <h1 className="type-hero">Not part of this celebration</h1>
          <p className="type-body-lg mt-3 text-muted-foreground">
            The couple has chosen not to include this page.
          </p>
          <ThemedButton asChild variant="ghost" size="md" className="mt-6">
            <Link to="/$slug" params={{ slug: wedding.slug }}>
              Back to the invitation
            </Link>
          </ThemedButton>
        </div>
      </Section>
    </PageCanvas>
  );
}
