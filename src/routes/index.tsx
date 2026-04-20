import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import featureInvites from "@/assets/feature-invites.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OurJourney — Your story. Beautifully shared." },
      {
        name: "description",
        content:
          "OurJourney is a romantic wedding website platform. Share your story, manage RSVPs, timeline, gallery and more — all in one beautiful place.",
      },
      { property: "og:title", content: "OurJourney — Your story. Beautifully shared." },
      { property: "og:description", content: "A romantic home for every wedding." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sunset" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8 animate-fade-up">
            <p className="font-script text-3xl text-primary leading-none">
              Once upon a forever
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
              Your story.
              <br />
              <span className="italic text-primary">Beautifully</span> shared.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl text-pretty">
              OurJourney gives every couple their own private wedding website &
              admin dashboard — from save-the-dates and RSVPs to gallery,
              playlist and seating, all in one warm romantic home.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-12 shadow-warm"
              >
                <Link to="/create">Start your story</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 border-primary/30 text-foreground hover:bg-primary/5"
              >
                <Link to="/demo">See a live demo</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <span>✦ No design skills needed</span>
              <span>✦ Free to start</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-warm opacity-20 blur-3xl rounded-[3rem]" aria-hidden />
            <div className="relative rounded-[2rem] overflow-hidden shadow-warm border border-border/60">
              <img
                src={hero}
                alt="Romantic autumn wedding table with terracotta roses, pampas grass and gold candlesticks"
                width={1600}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-5 py-4 shadow-soft hidden md:block">
              <p className="font-script text-2xl text-primary leading-none">Jan & Sophie</p>
              <p className="text-xs text-muted-foreground mt-1">ourjourney.com/jan-sophie</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="divider-script text-xs uppercase tracking-[0.3em]">Everything in one place</p>
          <h2 className="mt-6 text-4xl md:text-5xl text-balance">
            A complete wedding, gracefully managed.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Guest list & RSVPs", d: "Invite, track and chase responses with a single elegant view." },
            { t: "Timeline & seating", d: "Plan the day and the room — drag, drop, done." },
            { t: "Gallery & playlist", d: "Collect memories from guests, curate the soundtrack together." },
          ].map((f) => (
            <article
              key={f.t}
              className="group rounded-2xl border border-border bg-card p-8 hover:shadow-soft transition-shadow"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-warm shadow-warm mb-6 flex items-center justify-center text-primary-foreground font-display text-xl">
                ✦
              </div>
              <h3 className="text-2xl mb-2">{f.t}</h3>
              <p className="text-muted-foreground">{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="rounded-[2rem] overflow-hidden shadow-soft border border-border">
          <img
            src={featureInvites}
            alt="Wedding invitations on cream linen with autumn florals"
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full h-auto"
          />
        </div>
        <div className="space-y-6">
          <p className="font-script text-3xl text-primary leading-none">For every couple</p>
          <h2 className="text-4xl md:text-5xl text-balance">
            One private link. Every detail of your day.
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Each wedding lives at its own gentle URL like{" "}
            <span className="font-display italic text-foreground">ourjourney.com/your-names</span> —
            with completely private guest data, two admins, and a beautiful
            public page to share.
          </p>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex gap-3"><span className="text-primary">✦</span> Primary & secondary admin roles</li>
            <li className="flex gap-3"><span className="text-primary">✦</span> Guests sign in with name + invitation code</li>
            <li className="flex gap-3"><span className="text-primary">✦</span> Strict per-wedding data isolation</li>
          </ul>
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-8 mt-2">
            <Link to="/features">Explore features</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-warm text-primary-foreground p-12 md:p-16 text-center shadow-warm">
          <p className="font-script text-3xl md:text-4xl opacity-90">à deux</p>
          <h2 className="mt-4 text-4xl md:text-5xl text-primary-foreground">
            Begin your journey today.
          </h2>
          <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto">
            Claim your wedding URL in under a minute. Free while you plan.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-full bg-cream text-foreground hover:bg-cream/90 px-8 h-12"
          >
            <Link to="/create">Create your wedding</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
