import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import {
  Globe,
  Smartphone,
  MailOpen,
  Clock,
  MapPin,
  CalendarClock,
  Users,
  UserPlus,
  Baby,
  KeyRound,
  LinkIcon,
  MailCheck,
  Utensils,
  CalendarX,
  Download,
  ListChecks,
  LayoutTemplate,
  TrendingUp,
  Wallet,
  CreditCard,
  Briefcase,
  Music2,
  Heart,
  Ban,
  FileMusic,
  Camera,
  Filter,
  Table2,
  Gift,
  ShieldCheck,
  UsersRound,
  Rocket,
  HardDrive,
  History,
} from "lucide-react";
import {
  PageCanvas,
  Container,
  Section,
  Hero,
  FeatureCard,
  ThemedCard,
  ThemedButton,
  Badge,
} from "@/design-system";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — OurJourney" },
      {
        name: "description",
        content:
          "Every OurJourney feature in one place: wedding website, RSVP, guest management, budget, timeline, seating, gallery, playlist and more.",
      },
      { property: "og:title", content: "Features — OurJourney" },
      {
        property: "og:description",
        content: "The complete wedding platform — beautifully organised by category.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://wedding-journeys.lovable.app/features" },
    ],
    links: [{ rel: "canonical", href: "https://wedding-journeys.lovable.app/features" }],
  }),
  component: FeaturesPage,
});

type Feature = { icon: LucideIcon; t: string; d: string; soon?: boolean };
type Category = { title: string; tagline: string; items: Feature[] };

const categories: Category[] = [
  {
    title: "Wedding Website",
    tagline: "A private, romantic home for your day.",
    items: [
      { icon: Globe, t: "Personal website", d: "Your own URL at ourjourney.com/your-names." },
      { icon: Smartphone, t: "Fully responsive", d: "Beautiful on every device your guests use." },
      { icon: MailOpen, t: "Invitation & story", d: "Share how you met and what to expect." },
      { icon: Clock, t: "Countdown", d: "A gentle nudge from today until the big day." },
      { icon: MapPin, t: "Location & travel", d: "Directions and everything guests need." },
      { icon: CalendarClock, t: "Public timeline", d: "The day's flow, elegantly presented." },
    ],
  },
  {
    title: "Guest Management",
    tagline: "Every guest, thoughtfully organised.",
    items: [
      { icon: Users, t: "Guest list", d: "One clean, warm view of everyone invited." },
      { icon: UsersRound, t: "Groups", d: "Families, friends, colleagues — grouped." },
      { icon: CalendarClock, t: "Day / evening", d: "Different invitations, one system." },
      { icon: Baby, t: "Kids & adults", d: "Track ages for catering and seating." },
      { icon: UserPlus, t: "Plus ones", d: "Optional per-guest, tracked automatically." },
      { icon: KeyRound, t: "Unique invitation codes", d: "Globally unique per guest." },
      { icon: LinkIcon, t: "Personal invitation links", d: "One-click sign-in for every guest." },
    ],
  },
  {
    title: "RSVP",
    tagline: "Responses that feel like a love letter.",
    items: [
      { icon: MailCheck, t: "RSVP dashboard", d: "See who's coming at a glance." },
      { icon: Utensils, t: "Dietary preferences", d: "Vegetarian, vegan, allergies — all handled." },
      { icon: CalendarX, t: "RSVP deadline", d: "Set the date and close politely." },
      { icon: UserPlus, t: "Plus one flow", d: "Guests bring their name and details." },
      { icon: Download, t: "CSV & PDF exports", d: "Perfect for caterers and planners." },
    ],
  },
  {
    title: "Planning",
    tagline: "From engagement to encore.",
    items: [
      { icon: ListChecks, t: "Todo planner", d: "Tasks, deadlines and reminders in one board." },
      { icon: LayoutTemplate, t: "Templates", d: "Curated starter lists so you never miss a step." },
      { icon: TrendingUp, t: "Progress tracking", d: "See momentum build week over week." },
    ],
  },
  {
    title: "Budget",
    tagline: "Every euro, kindly accounted for.",
    items: [
      { icon: Wallet, t: "Budget overview", d: "Estimated vs paid, per category." },
      { icon: CreditCard, t: "Payment status", d: "Track deposits, remainders and finals." },
      { icon: Briefcase, t: "Vendor info", d: "Contracts, contacts and notes." },
      { icon: ListChecks, t: "Linked tasks", d: "Budget items tie into your todo list." },
    ],
  },
  {
    title: "Music",
    tagline: "Build the soundtrack together.",
    items: [
      { icon: Music2, t: "Playlist", d: "Curate the flow of the evening." },
      { icon: Heart, t: "Guest suggestions", d: "Guests add their favourite songs.", soon: true },
      { icon: FileMusic, t: "DJ export", d: "One-click export for your DJ.", soon: true },
      { icon: Ban, t: "Blacklist", d: "Songs you don't want — ever.", soon: true },
    ],
  },
  {
    title: "Photography",
    tagline: "A gallery that grows with the night.",
    items: [{ icon: Camera, t: "Guest photo uploads", d: "Guests add their moments to your gallery." }],
  },
  {
    title: "Timeline",
    tagline: "Choreograph the day.",
    items: [
      { icon: CalendarClock, t: "Day schedule", d: "Ceremony, cocktails, dinner, dancing." },
      { icon: Filter, t: "Guest-type filtering", d: "Show the right schedule to the right people." },
    ],
  },
  {
    title: "Seating",
    tagline: "The room, before the room.",
    items: [{ icon: Table2, t: "Table layout", d: "Visual seating with conflict hints." }],
  },
  {
    title: "Wishlist",
    tagline: "Gentle wishes, no pressure.",
    items: [{ icon: Gift, t: "Gift wishlist", d: "Curated wishes for your guests.", soon: true }],
  },
  {
    title: "Admin tools",
    tagline: "The calm behind the scenes.",
    items: [
      { icon: UsersRound, t: "Multiple admins", d: "Primary and secondary admin per wedding." },
      { icon: Rocket, t: "Publish website", d: "Draft privately, publish when ready." },
      { icon: History, t: "Audit log", d: "See what changed, when and by whom." },
      { icon: HardDrive, t: "Storage", d: "Files, photos and documents in one place." },
      { icon: ShieldCheck, t: "Per-wedding isolation", d: "Strictly private data by design." },
    ],
  },
];

const roles = [
  { t: "Platform Owner", d: "Oversees the platform — onboarding, billing, support." },
  { t: "Primary Admin", d: "The couple. Full control over their wedding." },
  { t: "Secondary Admin", d: "A trusted helper — planner, sibling, maid of honor." },
];

function FeaturesPage() {
  return (
    <SiteShell>
      <PageCanvas density="regular">
        <Container width="prose">
          <Hero
            script="tout ce qu'il faut"
            title="Every detail, lovingly handled."
            subtitle="OurJourney is a complete wedding platform. One private home for everything from invitations to the after-party playlist."
          />
        </Container>

        <Section size="spacious" width="wide" className="space-y-section">
          {categories.map((cat, idx) => (
            <div key={cat.title}>
              <div className="flex items-end justify-between mb-block gap-4 flex-wrap">
                <div>
                  <p className="type-label">{String(idx + 1).padStart(2, "0")}</p>
                  <h2 className="type-section-title mt-1">{cat.title}</h2>
                  <p className="type-body text-muted-foreground mt-1">{cat.tagline}</p>
                </div>
                <div className="h-px flex-1 max-w-40 hidden md:block bg-linear-to-r from-primary/35 to-transparent" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {cat.items.map((f) => (
                  <FeatureCard
                    key={f.t}
                    icon={<f.icon aria-hidden="true" className="w-5 h-5" />}
                    title={
                      <span className="flex items-center justify-between gap-2">
                        {f.t}
                        {f.soon && <Badge tone="gold">Soon</Badge>}
                      </span>
                    }
                  >
                    {f.d}
                  </FeatureCard>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section size="spacious" width="content">
          <ThemedCard variant="framed" ornament className="p-block md:p-section text-center">
            <p className="type-script">three roles, perfectly cast</p>
            <h2 className="type-section-title mt-3">Built for couples and their people.</h2>
            <div className="grid md:grid-cols-3 gap-gutter mt-block text-left">
              {roles.map((r) => (
                <ThemedCard key={r.t} variant="veil">
                  <h3 className="type-card-title">{r.t}</h3>
                  <p className="type-body text-muted-foreground mt-1">{r.d}</p>
                </ThemedCard>
              ))}
            </div>
            <p className="type-body text-muted-foreground mt-block">
              Guests don't need an account — they sign in with their name and invitation code, or open
              their personal link.
            </p>
            <ThemedButton asChild size="lg" className="mt-8">
              <Link to="/create">Create your wedding</Link>
            </ThemedButton>
          </ThemedCard>
        </Section>
      </PageCanvas>
    </SiteShell>
  );
}
