import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { tHead, useT } from "@/i18n";
import {
  MailOpen,
  CalendarClock,
  MailCheck,
  Camera,
  Music2,
  Gift,
  ExternalLink,
} from "lucide-react";
import demoCouple from "@/assets/demo-couple.jpg";
import featureInvites from "@/assets/feature-invites.jpg";
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  Hero,
  FeatureCard,
  InfoCard,
  ThemedButton,
} from "@/design-system";

const DEMO_SLUG = "jan-sophie";
const DEMO_NAMES = "Jan & Sophie";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: tHead("Demo Wedding — {names} — OurJourney", { names: DEMO_NAMES }) },
      {
        name: "description",
        content: tHead(
          "Step inside a live OurJourney wedding. Browse the invitation, timeline, RSVP, location, gallery, playlist and wishlist for {names}.",
          { names: DEMO_NAMES },
        ),
      },
      { property: "og:title", content: tHead("Demo Wedding — {names}", { names: DEMO_NAMES }) },
      { property: "og:description", content: tHead("See a real OurJourney wedding in action.") },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://wedding-journeys.lovable.app/demo" },
    ],
    links: [{ rel: "canonical", href: "https://wedding-journeys.lovable.app/demo" }],
  }),
  component: DemoPage,
});

const sections = [
  {
    icon: MailOpen,
    t: "Invitation",
    d: "A romantic letter opening with a countdown to the day.",
    to: "/$slug" as const,
  },
  {
    icon: CalendarClock,
    t: "Timeline",
    d: "Ceremony · cocktails · dinner · dancing — hour by hour.",
    to: "/$slug/timeline" as const,
  },
  {
    icon: MailCheck,
    t: "RSVP",
    d: "Elegant response form with meal choices and dietary needs.",
    to: "/$slug" as const,
  },
  {
    icon: Camera,
    t: "Gallery",
    d: "A growing memory book, with guest uploads.",
    to: "/$slug/gallery" as const,
  },
  {
    icon: Music2,
    t: "Playlist",
    d: "The evening's soundtrack, built together.",
    to: "/$slug/playlist" as const,
  },
] as const;

// Illustrative sample data — not this demo wedding's live figures.
const highlights = [
  { label: "Guests invited", value: "128" },
  { label: "RSVPs received", value: "96" },
  { label: "Photos in gallery", value: "342" },
  { label: "Days to go", value: "42" },
] as const;

function DemoPage() {
  const t = useT();
  return (
    <SiteShell>
      <PageCanvas density="regular">
        <Container width="wide">
          <Hero
            align="split"
            script={t("welcome to")}
            title={<span className="italic text-primary">{DEMO_NAMES}</span>}
            subtitle={
              <>
                <span className="block font-display italic text-sm text-muted-foreground mb-2">
                  ourjourney.com/{DEMO_SLUG}
                </span>
                {t(
                  "Step inside a fully-built OurJourney wedding. Everything a real couple and their guests see and use — invitations, RSVP, timeline, gallery, and more.",
                )}
              </>
            }
            actions={
              <>
                <ThemedButton asChild size="lg">
                  <Link to="/$slug" params={{ slug: DEMO_SLUG }}>
                    {t("Enter demo wedding")} <ExternalLink aria-hidden="true" className="w-4 h-4" />
                  </Link>
                </ThemedButton>
                <ThemedButton asChild variant="gilded" size="lg">
                  <Link to="/features">{t("See all features")}</Link>
                </ThemedButton>
              </>
            }
            media={
              <div className="overflow-hidden rounded-frame border-paper shadow-elev-4">
                <img
                  src={demoCouple}
                  alt={t("{names} — demo wedding couple", { names: DEMO_NAMES })}
                  width={1280}
                  height={960}
                  className="w-full h-auto"
                />
              </div>
            }
          />
        </Container>

        {/* Illustrative highlights strip */}
        <Section size="compact" width="wide">
          <p className="type-caption text-center italic mb-4">{t("Illustrative sample data")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {highlights.map((h) => (
              <InfoCard key={h.label} label={t(h.label)} value={h.value} />
            ))}
          </div>
        </Section>

        {/* Sections grid */}
        <Section size="spacious" width="wide">
          <SectionHeader eyebrow={t("explore the wedding")} title={t("Every corner, open to visit.")} />
          <div className="mt-block grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {sections.map((s) => (
              <Link key={s.t} to={s.to} params={{ slug: DEMO_SLUG }} className="focus-ring-elegant block rounded-card">
                <FeatureCard
                  icon={<s.icon aria-hidden="true" className="w-5 h-5" />}
                  title={
                    <span className="flex items-center gap-2">
                      {t(s.t)}
                      <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-muted-foreground" />
                    </span>
                  }
                >
                  {t(s.d)}
                </FeatureCard>
              </Link>
            ))}
          </div>
        </Section>

        {/* Behind the scenes */}
        <Section size="spacious" width="wide">
          <div className="grid lg:grid-cols-2 gap-block items-center">
            <div className="overflow-hidden rounded-frame border-paper shadow-elev-3">
              <img
                src={featureInvites}
                alt={t("Behind the scenes admin dashboard")}
                width={1024}
                height={1024}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-gutter">
              <p className="type-script">{t("behind the scenes")}</p>
              <h2 className="type-section-title">{t("Every guest, every euro, every song.")}</h2>
              <p className="type-body-lg text-muted-foreground">
                {t(
                  "The demo wedding also ships with a fully populated admin — RSVP dashboard, budget planner, timeline editor, guest list and gallery moderation. Create your own wedding to explore it end to end.",
                )}
              </p>
              <ul className="flex flex-col gap-2">
                <li className="flex gap-2 type-body">
                  <Gift aria-hidden="true" className="w-4 h-4 text-primary mt-0.5 shrink-0" />{" "}
                  {t("Wishlist previews (coming soon)")}
                </li>
                <li className="flex gap-2 type-body">
                  <Music2 aria-hidden="true" className="w-4 h-4 text-primary mt-0.5 shrink-0" />{" "}
                  {t("Guest playlist suggestions")}
                </li>
                <li className="flex gap-2 type-body">
                  <Camera aria-hidden="true" className="w-4 h-4 text-primary mt-0.5 shrink-0" />{" "}
                  {t("Guest photo uploads")}
                </li>
              </ul>
              <ThemedButton asChild size="lg" className="mt-2 self-start">
                <Link to="/create">{t("Create your own wedding")}</Link>
              </ThemedButton>
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section size="spacious" width="prose">
          <div className="text-center">
            <p className="type-label">{t("your turn")}</p>
            <h2 className="type-section-title mt-4">{t("Ready to write your own?")}</h2>
            <ThemedButton asChild size="lg" className="mt-8">
              <Link to="/create">{t("Create your wedding")}</Link>
            </ThemedButton>
          </div>
        </Section>
      </PageCanvas>
    </SiteShell>
  );
}
