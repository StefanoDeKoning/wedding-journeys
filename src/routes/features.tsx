import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
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
import { WatercolorBlot, RoseVine, FloatingPetals, FloralDivider } from "@/wedding/FloralDecorations";

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

type Feature = { icon: any; t: string; d: string; soon?: boolean };
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
    items: [
      { icon: Camera, t: "Guest photo uploads", d: "Guests add their moments to your gallery." },
    ],
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
    items: [
      { icon: Table2, t: "Table layout", d: "Visual seating with conflict hints." },
    ],
  },
  {
    title: "Wishlist",
    tagline: "Gentle wishes, no pressure.",
    items: [
      { icon: Gift, t: "Gift wishlist", d: "Curated wishes for your guests.", soon: true },
    ],
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

function FeaturesPage() {
  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <WatercolorBlot color="rose" size="xl" className="absolute -top-20 -right-20 opacity-30 rose-glow" />
          <WatercolorBlot color="sage" size="xl" className="absolute top-1/3 -left-24 opacity-25 rose-glow" style={{ animationDelay: "2s" }} />
          <FloatingPetals count={10} />
        </div>

        <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <p className="font-script text-3xl md:text-4xl text-primary">tout ce qu'il faut</p>
          <h1 className="mt-4 text-5xl md:text-6xl text-balance">Every detail, lovingly handled.</h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            OurJourney is a complete wedding platform. One private home for everything from
            invitations to the after-party playlist.
          </p>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 space-y-20">
          {categories.map((cat, idx) => (
            <div key={cat.title}>
              <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{String(idx + 1).padStart(2, "0")}</p>
                  <h2 className="text-3xl md:text-4xl">{cat.title}</h2>
                  <p className="text-muted-foreground mt-1">{cat.tagline}</p>
                </div>
                <div className="h-px flex-1 bg-border hidden md:block" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.items.map((f) => (
                  <article
                    key={f.t}
                    className="card-romantic p-6 hover:border-primary/40 hover:shadow-soft hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center shadow-warm">
                        <f.icon className="w-5 h-5" />
                      </div>
                      {f.soon && (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-primary/10 text-primary">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg">{f.t}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
          <div className="card-romantic p-10 md:p-14 bg-gradient-dream text-center">
            <p className="font-script text-2xl text-primary">three roles, perfectly cast</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Built for couples and their people.</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
              {[
                { t: "Platform Owner", d: "Oversees the platform — onboarding, billing, support." },
                { t: "Primary Admin", d: "The couple. Full control over their wedding." },
                { t: "Secondary Admin", d: "A trusted helper — planner, sibling, maid of honor." },
              ].map((r) => (
                <div key={r.t} className="card-romantic p-6">
                  <h3 className="text-lg">{r.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{r.d}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              Guests don't need an account — they sign in with their name and invitation code, or open
              their personal link.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full bg-primary hover:bg-primary/90 px-8">
              <Link to="/create">Create your wedding</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
