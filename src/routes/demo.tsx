import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import {
  MailOpen,
  CalendarClock,
  MailCheck,
  MapPin,
  Camera,
  Music2,
  Gift,
  ExternalLink,
} from "lucide-react";
import demoCouple from "@/assets/demo-couple.jpg";
import featureInvites from "@/assets/feature-invites.jpg";

const DEMO_SLUG = "jan-sophie";
const DEMO_NAMES = "Jan & Sophie";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: `Demo Wedding — ${DEMO_NAMES} — OurJourney` },
      {
        name: "description",
        content: `Step inside a live OurJourney wedding. Browse the invitation, timeline, RSVP, location, gallery, playlist and wishlist for ${DEMO_NAMES}.`,
      },
      { property: "og:title", content: `Demo Wedding — ${DEMO_NAMES}` },
      { property: "og:description", content: "See a real OurJourney wedding in action." },
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
    to: `/${DEMO_SLUG}` as const,
  },
  {
    icon: CalendarClock,
    t: "Timeline",
    d: "Ceremony · cocktails · dinner · dancing — hour by hour.",
    to: `/${DEMO_SLUG}/timeline` as const,
  },
  {
    icon: MailCheck,
    t: "RSVP",
    d: "Elegant response form with meal choices and dietary needs.",
    to: `/${DEMO_SLUG}/rsvp` as const,
  },
  {
    icon: MapPin,
    t: "Location",
    d: "Directions and everything guests need to arrive on time.",
    to: `/${DEMO_SLUG}/location` as const,
  },
  {
    icon: Camera,
    t: "Gallery",
    d: "A growing memory book, with guest uploads.",
    to: `/${DEMO_SLUG}/gallery` as const,
  },
  {
    icon: Music2,
    t: "Playlist",
    d: "The evening's soundtrack, built together.",
    to: `/${DEMO_SLUG}/playlist` as const,
  },
];

const highlights = [
  { label: "Guests invited", value: "128" },
  { label: "RSVPs received", value: "96" },
  { label: "Photos in gallery", value: "342" },
  { label: "Days to go", value: "42" },
];

function DemoPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="font-script text-3xl text-primary">welcome to</p>
          <h1 className="text-5xl md:text-6xl text-balance">
            <span className="italic text-primary">{DEMO_NAMES}</span>
          </h1>
          <p className="text-sm text-muted-foreground font-display italic">
            ourjourney.com/{DEMO_SLUG}
          </p>
          <p className="text-lg text-muted-foreground text-pretty">
            Step inside a fully-built OurJourney wedding. Everything a real couple and their guests
            see and use — invitations, RSVP, timeline, gallery, and more.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-8">
              <Link to="/$slug" params={{ slug: DEMO_SLUG }}>
                Enter demo wedding <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 px-8">
              <Link to="/features">See all features</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-warm opacity-20 blur-3xl rounded-[3rem]" aria-hidden />
          <div className="relative rounded-[2rem] overflow-hidden shadow-warm border border-border/60">
            <img
              src={demoCouple}
              alt={`${DEMO_NAMES} — demo wedding couple`}
              width={1280}
              height={960}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {highlights.map((h) => (
            <div key={h.label} className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="font-display text-4xl text-primary">{h.value}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sections grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="divider-script text-xs uppercase tracking-[0.3em]">Explore the wedding</p>
          <h2 className="mt-6 text-4xl md:text-5xl text-balance">Every corner, open to visit.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((s) => (
            <Link
              key={s.t}
              to={s.to}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="h-11 w-11 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center mb-4 shadow-warm">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl flex items-center gap-2">
                {s.t}
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Behind the scenes */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-[2rem] overflow-hidden shadow-soft border border-border">
            <img
              src={featureInvites}
              alt="Behind the scenes admin dashboard"
              width={1024}
              height={1024}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          <div className="space-y-5">
            <p className="font-script text-3xl text-primary">behind the scenes</p>
            <h2 className="text-4xl md:text-5xl text-balance">
              Every guest, every euro, every song.
            </h2>
            <p className="text-lg text-muted-foreground">
              The demo wedding also ships with a fully populated admin — RSVP dashboard, budget
              planner, timeline editor, guest list and gallery moderation. Create your own wedding
              to explore it end to end.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><Gift className="w-4 h-4 text-primary mt-0.5" /> Wishlist previews (coming soon)</li>
              <li className="flex gap-2"><Music2 className="w-4 h-4 text-primary mt-0.5" /> Guest playlist suggestions</li>
              <li className="flex gap-2"><Camera className="w-4 h-4 text-primary mt-0.5" /> Guest photo uploads</li>
            </ul>
            <Button asChild size="lg" className="mt-4 rounded-full bg-primary hover:bg-primary/90 px-8">
              <Link to="/create">Create your own wedding</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-28 text-center">
        <p className="divider-script text-xs uppercase tracking-[0.3em]">your turn</p>
        <h2 className="mt-6 text-4xl text-balance">Ready to write your own?</h2>
        <Button asChild size="lg" className="mt-8 rounded-full bg-primary hover:bg-primary/90 px-8">
          <Link to="/create">Create your wedding</Link>
        </Button>
      </section>
    </SiteShell>
  );
}
