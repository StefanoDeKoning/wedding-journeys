import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import demoCouple from "@/assets/demo-couple.jpg";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo Wedding — OurJourney" },
      { name: "description", content: "Step inside a live OurJourney wedding website. Browse the guest list, RSVP, timeline and gallery of our demo couple." },
      { property: "og:title", content: "Demo Wedding — OurJourney" },
      { property: "og:description", content: "See a real OurJourney wedding in action." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="font-script text-3xl text-primary">a peek inside</p>
          <h1 className="text-5xl md:text-6xl text-balance">
            Meet <span className="italic text-primary">Jan & Sophie</span>.
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Our demo wedding lives at <span className="font-display italic text-foreground">ourjourney.com/jan-sophie</span>.
            Walk through every feature exactly the way real couples and guests experience it.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-8">
              <Link to="/demo">Enter demo wedding</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 px-8">
              <Link to="/features">See all features</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden shadow-warm border border-border/60">
          <img
            src={demoCouple}
            alt="Couple at autumn golden hour wedding"
            width={1280}
            height={960}
            className="w-full h-auto"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { t: "The Story", d: "How they met — a love letter on the homepage." },
            { t: "Schedule", d: "Ceremony · cocktails · dinner · dancing." },
            { t: "Travel & stay", d: "Curated hotels & directions for far-away guests." },
            { t: "RSVP", d: "Elegant response form with meal selection." },
            { t: "Gallery", d: "A growing memory book of moments." },
            { t: "Registry", d: "Gentle, curated wishes — no pressure." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-7">
              <h3 className="text-2xl">{s.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

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
