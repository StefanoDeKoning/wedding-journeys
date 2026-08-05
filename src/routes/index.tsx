import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Globe,
  MailCheck,
  Users,
  CalendarClock,
  Wallet,
  Briefcase,
  Camera,
  Music2,
  Gift,
  ListChecks,
  HardDrive,
  Smartphone,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Clock,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import featureInvites from "@/assets/feature-invites.jpg";
import demoCouple from "@/assets/demo-couple.jpg";
import { WatercolorBlot, RoseVine, FloatingPetals, FloralDivider } from "@/wedding/FloralDecorations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OurJourney — Plan, manage & celebrate your wedding" },
      {
        name: "description",
        content:
          "OurJourney is the all-in-one wedding platform: invitation website, RSVP, guest management, timeline, budget, vendors, gallery, playlist and more.",
      },
      { property: "og:title", content: "OurJourney — Plan, manage & celebrate your wedding" },
      {
        property: "og:description",
        content:
          "Wedding website, RSVP, guest list, budget, timeline, gallery and playlist — all in one romantic home.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://wedding-journeys.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://wedding-journeys.lovable.app/" }],
  }),
  component: HomePage,
});

const features = [
  { icon: Globe, t: "Invitation Website", d: "Your own private wedding site with countdown, story and location." },
  { icon: MailCheck, t: "RSVP Management", d: "Elegant RSVP with meal choices, dietary needs and deadlines." },
  { icon: Users, t: "Guest Management", d: "Groups, day/evening, plus-ones, unique invitation codes." },
  { icon: CalendarClock, t: "Timeline", d: "Choreograph the day and share it beautifully with guests." },
  { icon: Wallet, t: "Budget Planner", d: "Track estimated vs paid, per category and per vendor." },
  { icon: Briefcase, t: "Vendor Management", d: "Keep every supplier, contract and payment in one place." },
  { icon: Camera, t: "Photo Sharing", d: "Guests upload their moments straight into your gallery." },
  { icon: Music2, t: "Playlist", d: "Build the soundtrack together — guests suggest, you approve." },
  { icon: Gift, t: "Gift Wishlist", d: "Curated wishes without the awkwardness.", soon: true },
  { icon: ListChecks, t: "Todo Planner", d: "Templates, progress and reminders from now to “I do”." },
  { icon: HardDrive, t: "Storage", d: "All your documents, photos and files — safely kept." },
  { icon: Smartphone, t: "Responsive", d: "Flawless on phone, tablet and desktop." },
];

const steps = [
  { t: "Create your wedding", d: "Claim your private URL in under a minute." },
  { t: "Customize your website", d: "Story, timeline, location, gallery — all yours." },
  { t: "Invite your guests", d: "Personal links & unique invitation codes." },
  { t: "Manage everything", d: "RSVPs, budget, vendors, seating — one dashboard." },
  { t: "Celebrate", d: "Live the day. Relive it in the gallery." },
];

const testimonials = [
  {
    q: "We replaced three spreadsheets, a WhatsApp group and a shared drive with OurJourney. Our sanity thanks us.",
    n: "Sophie & Jan",
    r: "Married in Autumn",
  },
  {
    q: "Guests actually enjoyed the RSVP. We've never seen responses come in so fast.",
    n: "Emma & Lucas",
    r: "Married in Spring",
  },
  {
    q: "The budget planner alone paid for the wedding twice over. Everything else was a bonus.",
    n: "Maya & Noah",
    r: "Married in Summer",
  },
];

const faqs = [
  {
    q: "How does RSVP work?",
    a: "Each guest gets a personal invitation link with a unique code. They respond in seconds — including meal choice and dietary needs.",
  },
  {
    q: "Can guests upload photos?",
    a: "Yes. Guests can add their own memories straight into your gallery, curated by you.",
  },
  {
    q: "Can I manage vendors and budget?",
    a: "Absolutely. Track every vendor, contract and payment, and see estimated vs paid at a glance.",
  },
  {
    q: "Is it mobile-friendly?",
    a: "Every page — public site and admin dashboard — is fully responsive.",
  },
  {
    q: "Do guests need an account?",
    a: "No. Guests sign in with their name and invitation code, or open their personal link.",
  },
];

function HomePage() {
  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        {/* Side decorations */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <WatercolorBlot color="rose" size="xl" className="absolute -top-20 -right-20 opacity-30 rose-glow" />
          <WatercolorBlot color="sage" size="xl" className="absolute top-1/3 -left-24 opacity-25 rose-glow" style={{ animationDelay: "2s" }} />
          <FloatingPetals count={12} />
        </div>

        {/* Hero */}
        <section className="relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-sunset" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-8 animate-fade-up">
              <p className="font-script text-3xl text-primary leading-none">Once upon a forever</p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
                Everything you need to <span className="italic text-primary">plan, manage</span> &amp; celebrate your wedding.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl text-pretty">
                OurJourney is your wedding website, RSVP platform, guest list, budget manager, timeline
                and gallery — all in one warm, romantic home.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 shadow-warm">
                  <Link to="/create">Create your wedding</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 border-primary/30 hover:bg-primary/5">
                  <Link to="/demo">View demo</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> No design skills needed</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Private &amp; secure</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-warm opacity-20 blur-3xl rounded-[3rem]" aria-hidden />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-warm border border-border/60">
                <img src={hero} alt="Romantic wedding table setting" width={1600} height={1200} className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-5 py-4 shadow-soft hidden md:block">
                <p className="font-script text-2xl text-primary leading-none">Jan &amp; Sophie</p>
                <p className="text-xs text-muted-foreground mt-1">ourjourney.com/jan-sophie</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="divider-script text-xs uppercase tracking-[0.3em]">One platform, every detail</p>
            <h2 className="mt-6 text-4xl md:text-5xl text-balance">Far more than a wedding website.</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From the first save-the-date to the last dance — OurJourney handles it all.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <article
                key={f.t}
                className="group relative card-romantic p-6 hover:border-primary/40 hover:shadow-soft hover:-translate-y-1 transition-all duration-500"
              >
                <div className="h-11 w-11 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center mb-4 shadow-warm">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl flex items-center gap-2">
                  {f.t}
                  {f.soon && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Soon
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Why OurJourney */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
          <div className="card-romantic p-10 md:p-14 bg-gradient-dream">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="font-script text-3xl text-primary">why OurJourney</p>
                <h2 className="mt-3 text-4xl md:text-5xl text-balance">
                  One home instead of ten spreadsheets.
                </h2>
                <p className="mt-5 text-muted-foreground text-lg">
                  Excel files, WhatsApp groups, shared docs and sticky notes make wedding planning
                  messier than it needs to be. OurJourney replaces all of it — beautifully.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: HeartHandshake, t: "Everything in one place", d: "Guests, budget, vendors, timeline — one login." },
                  { icon: Clock, t: "Less stress, more moments", d: "Automations, templates and reminders keep you ahead." },
                  { icon: Users, t: "Guests always informed", d: "One private link with everything they need to know." },
                  { icon: ShieldCheck, t: "Private &amp; secure", d: "Per-wedding data isolation. Only your admins see the details." },
                ].map((b) => (
                  <li key={b.t} className="flex gap-4 items-start card-romantic p-5">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <b.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg">{b.t}</h3>
                      <p className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: b.d }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="divider-script text-xs uppercase tracking-[0.3em]">How it works</p>
            <h2 className="mt-6 text-4xl md:text-5xl text-balance">From "yes" to "I do", gracefully.</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <div key={s.t} className="relative card-romantic p-6">
                <div className="font-script text-3xl text-primary leading-none">0{i + 1}</div>
                <h3 className="mt-3 text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase / screenshots */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="rounded-[2.5rem] overflow-hidden shadow-soft border border-border">
              <img src={featureInvites} alt="Wedding invitations mockup" loading="lazy" width={1024} height={1024} className="w-full h-auto" />
            </div>
            <div className="space-y-5">
              <p className="font-script text-3xl text-primary">a peek inside</p>
              <h2 className="text-4xl md:text-5xl text-balance">Beautiful on both sides of the invitation.</h2>
              <p className="text-lg text-muted-foreground">
                A romantic public site for your guests. A calm, powerful dashboard for you.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {["Wedding website", "RSVP dashboard", "Budget planner", "Timeline editor"].map((s) => (
                  <div key={s} className="rounded-xl card-romantic px-4 py-3 text-sm">
                    <span className="text-primary mr-2">✦</span>
                    {s}
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-8 mt-2">
                <Link to="/demo">Explore the demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="divider-script text-xs uppercase tracking-[0.3em]">Loved by couples</p>
            <h2 className="mt-6 text-4xl md:text-5xl text-balance">Real weddings, real relief.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.n} className="card-romantic p-7">
                <blockquote className="text-foreground/85 italic">"{t.q}"</blockquote>
                <figcaption className="mt-5">
                  <p className="font-script text-2xl text-primary leading-none">{t.n}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.r}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
          <div className="text-center mb-10">
            <p className="divider-script text-xs uppercase tracking-[0.3em]">FAQ</p>
            <h2 className="mt-6 text-4xl md:text-5xl text-balance">Everything you were wondering.</h2>
          </div>
          <Accordion type="single" collapsible className="card-romantic px-6">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`} className={i === faqs.length - 1 ? "border-b-0" : ""}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-warm text-primary-foreground p-12 md:p-16 text-center shadow-warm">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <FloatingPetals count={16} />
            </div>
            <p className="font-script text-3xl md:text-4xl opacity-90">à deux</p>
            <h2 className="mt-4 text-4xl md:text-5xl text-primary-foreground">Create your wedding today.</h2>
            <p className="mt-4 text-primary-foreground/85 max-w-xl mx-auto">
              Claim your private URL in under a minute. Free while you plan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="rounded-full bg-cream text-foreground hover:bg-cream/90 px-8 h-12">
                <Link to="/create">Create your wedding</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/demo">See the demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <img src={demoCouple} alt="" className="hidden" />
    </SiteShell>
  );
}
