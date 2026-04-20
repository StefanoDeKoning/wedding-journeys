import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — OurJourney" },
      { name: "description", content: "Guest list, RSVPs, timeline, gallery, playlist, seating planner and admin dashboard — beautifully designed for every wedding." },
      { property: "og:title", content: "Features — OurJourney" },
      { property: "og:description", content: "Everything you need to plan and share your wedding day." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { t: "Guest List", d: "Add guests, track plus-ones, dietary needs and addresses in one warm view.", icon: "✦" },
  { t: "RSVP Responses", d: "Beautiful response forms — see who's coming at a glance.", icon: "❀" },
  { t: "Wedding Timeline", d: "Choreograph the day from ceremony to last dance.", icon: "⌛" },
  { t: "Photo Gallery", d: "Curate your own photos — invite guests to add theirs.", icon: "✿" },
  { t: "Music Playlist", d: "Build the soundtrack together. Guests suggest, you approve.", icon: "♪" },
  { t: "Seating Planner", d: "Visual drag-and-drop tables with conflict hints.", icon: "◇" },
  { t: "Admin Dashboard", d: "Two admins per wedding with full role control.", icon: "✦" },
  { t: "Private URL", d: "Each wedding at ourjourney.com/your-names — fully isolated data.", icon: "❀" },
];

function FeaturesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <p className="font-script text-3xl text-primary">tout ce qu'il faut</p>
        <h1 className="mt-4 text-5xl md:text-6xl text-balance">Every detail, lovingly handled.</h1>
        <p className="mt-6 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
          OurJourney is a complete wedding suite. One private home for everything from invitations to the after-party playlist.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <article
              key={f.t}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center mb-4 shadow-warm">
                <span aria-hidden>{f.icon}</span>
              </div>
              <h3 className="text-xl">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="rounded-[2rem] border border-border bg-gradient-soft p-10 md:p-14 text-center">
          <p className="font-script text-2xl text-primary">three roles, perfectly cast</p>
          <h2 className="mt-3 text-3xl md:text-4xl">A platform built for couples & their people.</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
            {[
              { t: "Platform Owner", d: "Oversees the platform — onboarding, billing, support." },
              { t: "Primary Admin", d: "The couple. Full control over their wedding instance." },
              { t: "Secondary Admin", d: "A trusted helper — planner, sibling, maid of honor." },
            ].map((r) => (
              <div key={r.t} className="rounded-xl bg-card border border-border p-6">
                <h3 className="text-lg">{r.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{r.d}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            Guests don't need an account — they sign in with their name & invitation code.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full bg-primary hover:bg-primary/90 px-8">
            <Link to="/create">Create your wedding</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
