import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
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
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  Hero as HeroSection,
  FeatureCard,
  ThemedCard,
  ThemedButton,
  Badge,
  Tag,
  Divider,
} from "@/design-system";

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
    links: [
      { rel: "canonical", href: "https://wedding-journeys.lovable.app/" },
      { rel: "preload", as: "image", href: demoCouple },
    ],
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

const benefits = [
  { icon: HeartHandshake, t: "Everything in one place", d: "Guests, budget, vendors, timeline — one login." },
  { icon: Clock, t: "Less stress, more moments", d: "Automations, templates and reminders keep you ahead." },
  { icon: Users, t: "Guests always informed", d: "One private link with everything they need to know." },
  { icon: ShieldCheck, t: "Private & secure", d: "Per-wedding data isolation. Only your admins see the details." },
];

const steps = [
  { t: "Create your wedding", d: "Claim your private URL in under a minute." },
  { t: "Customize your website", d: "Story, timeline, location, gallery — all yours." },
  { t: "Invite your guests", d: "Personal links & unique invitation codes." },
  { t: "Manage everything", d: "RSVPs, budget, vendors, seating — one dashboard." },
  { t: "Celebrate", d: "Live the day. Relive it in the gallery." },
];

const showcaseItems = ["Wedding website", "RSVP dashboard", "Budget planner", "Timeline editor"];

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
      <PageCanvas density="lavish">
        <Container width="wide">
          <HeroSection
            align="split"
            script="Once upon a forever"
            title={
              <>
                Everything you need to <span className="italic text-primary">plan, manage</span> &
                celebrate your wedding.
              </>
            }
            subtitle="OurJourney is your wedding website, RSVP platform, guest list, budget manager, timeline and gallery — all in one warm, romantic home."
            extra={
              <div className="flex items-center gap-6 type-caption">
                <span className="flex items-center gap-2">
                  <Sparkles aria-hidden="true" className="w-4 h-4 text-primary" /> No design skills needed
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="w-4 h-4 text-primary" /> Private & secure
                </span>
              </div>
            }
            actions={
              <>
                <ThemedButton asChild size="lg">
                  <Link to="/create">Create your wedding</Link>
                </ThemedButton>
                <ThemedButton asChild variant="gilded" size="lg">
                  <Link to="/demo">View demo</Link>
                </ThemedButton>
              </>
            }
            media={
              <div className="relative">
                <div className="overflow-hidden rounded-frame border-paper shadow-elev-4">
                  <img
                    src={hero}
                    alt="Romantic wedding table setting"
                    width={1600}
                    height={1200}
                    className="w-full h-auto"
                  />
                </div>
                <ThemedCard
                  variant="framed"
                  className="hidden md:block absolute -bottom-6 -left-6 p-4"
                >
                  <p className="type-script-sm">Jan & Sophie</p>
                  <p className="type-caption mt-1">ourjourney.com/jan-sophie</p>
                </ThemedCard>
              </div>
            }
          />
        </Container>

        {/* Feature highlights */}
        <Section size="spacious" width="wide">
          <SectionHeader
            eyebrow="one platform, every detail"
            title="Far more than a wedding website."
            description="From the first save-the-date to the last dance — OurJourney handles it all."
          />
          <div className="mt-block grid sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {features.map((f) => (
              <FeatureCard
                key={f.t}
                icon={<f.icon aria-hidden="true" className="w-5 h-5" />}
                title={
                  <span className="flex items-center gap-2">
                    {f.t}
                    {f.soon && <Badge tone="gold">Soon</Badge>}
                  </span>
                }
              >
                {f.d}
              </FeatureCard>
            ))}
          </div>
        </Section>

        {/* Why OurJourney */}
        <Section size="spacious" width="wide">
          <ThemedCard variant="framed" ornament className="p-block md:p-section">
            <div className="grid lg:grid-cols-2 gap-block items-center">
              <div>
                <p className="type-script">why OurJourney</p>
                <h2 className="type-section-title mt-3">One home instead of ten spreadsheets.</h2>
                <p className="type-body-lg mt-5 text-muted-foreground">
                  Excel files, WhatsApp groups, shared docs and sticky notes make wedding planning
                  messier than it needs to be. OurJourney replaces all of it — beautifully.
                </p>
              </div>
              <ul className="flex flex-col gap-gutter">
                {benefits.map((b) => (
                  <li key={b.t}>
                    <ThemedCard variant="veil" className="flex gap-4 items-start">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <b.icon aria-hidden="true" className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="type-card-title">{b.t}</h3>
                        <p className="type-body text-muted-foreground mt-1">{b.d}</p>
                      </div>
                    </ThemedCard>
                  </li>
                ))}
              </ul>
            </div>
          </ThemedCard>
        </Section>

        {/* How it works */}
        <Section size="spacious" width="wide">
          <SectionHeader eyebrow="how it works" title={'From "yes" to "I do", gracefully.'} />
          <div className="mt-block grid md:grid-cols-5 gap-gutter">
            {steps.map((s, i) => (
              <ThemedCard key={s.t} className={i % 2 === 0 ? "animate-ds-reveal-left" : "animate-ds-reveal-right"}>
                <div className="type-script text-3xl leading-none">0{i + 1}</div>
                <h3 className="type-card-title mt-3">{s.t}</h3>
                <p className="type-body text-muted-foreground mt-1">{s.d}</p>
              </ThemedCard>
            ))}
          </div>
        </Section>

        {/* Showcase / screenshots */}
        <Section size="spacious" width="wide">
          <div className="grid lg:grid-cols-2 gap-block items-center">
            <div className="overflow-hidden rounded-frame border-paper shadow-elev-3">
              <img
                src={featureInvites}
                alt="Wedding invitations mockup"
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-auto"
              />
            </div>
            <div className="flex flex-col gap-gutter">
              <p className="type-script">a peek inside</p>
              <h2 className="type-section-title">Beautiful on both sides of the invitation.</h2>
              <p className="type-body-lg text-muted-foreground">
                A romantic public site for your guests. A calm, powerful dashboard for you.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {showcaseItems.map((s) => (
                  <Tag key={s} className="justify-center py-2">
                    {s}
                  </Tag>
                ))}
              </div>
              <ThemedButton asChild size="lg" className="mt-2 self-start">
                <Link to="/demo">Explore the demo</Link>
              </ThemedButton>
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section size="spacious" width="wide">
          <SectionHeader eyebrow="loved by couples" title="Real weddings, real relief." />
          <div className="mt-block grid md:grid-cols-3 gap-gutter">
            {testimonials.map((t) => (
              <ThemedCard key={t.n} variant="paper" interactive>
                <blockquote className="type-body text-foreground/85 italic">"{t.q}"</blockquote>
                <figcaption className="mt-5">
                  <p className="type-script-sm">{t.n}</p>
                  <p className="type-caption mt-1">{t.r}</p>
                </figcaption>
              </ThemedCard>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section size="spacious" width="prose">
          <SectionHeader eyebrow="faq" title="Everything you were wondering." />
          <ThemedCard variant="framed" className="mt-block">
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`q-${i}`} className={i === faqs.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="type-body-lg text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="type-body text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ThemedCard>
        </Section>

        {/* CTA */}
        <Section size="spacious" width="content">
          <div className="relative overflow-hidden rounded-frame bg-gradient-warm text-primary-foreground p-block md:p-section text-center shadow-elev-4">
            <p className="type-script opacity-90">à deux</p>
            <h2 className="type-section-title mt-4 text-primary-foreground">Create your wedding today.</h2>
            <p className="type-body-lg mt-4 text-primary-foreground/85 max-w-xl mx-auto">
              Claim your private URL in under a minute. Free while you plan.
            </p>
            <Divider className="mx-auto max-w-xs opacity-70" />
            <div className="flex flex-wrap gap-3 justify-center">
              <ThemedButton asChild size="lg" className="!bg-card !text-foreground">
                <Link to="/create">Create your wedding</Link>
              </ThemedButton>
              <ThemedButton
                asChild
                size="lg"
                variant="gilded"
                className="!border-primary-foreground/40 !text-primary-foreground hover:!bg-primary-foreground/10"
              >
                <Link to="/demo">See the demo</Link>
              </ThemedButton>
            </div>
          </div>
        </Section>
      </PageCanvas>
    </SiteShell>
  );
}
