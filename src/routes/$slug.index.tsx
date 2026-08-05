import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Heart, ListChecks } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import { Countdown } from "@/wedding/Countdown";
import { WishlistSection } from "@/wedding/WishlistSection";
import { Button } from "@/components/ui/button";
import { safeHttpUrl } from "@/lib/safeUrl";
import { WatercolorBlot, RoseCluster, FloatingPetals, FloralDivider } from "@/wedding/FloralDecorations";

export const Route = createFileRoute("/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: `Invitation — ${params.slug}` },
      { name: "description", content: "Your private digital wedding invitation." },
    ],
  }),
  component: InvitationPage,
});

function formatLongDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InvitationPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);

  if (!wedding) return null;

  const isEvening = guest?.guest_type === "evening";
  const target = isEvening
    ? (wedding.reception_at ?? wedding.ceremony_at)
    : (wedding.ceremony_at ?? wedding.reception_at);

  const countdownLabel = isEvening
    ? "until we celebrate together"
    : "until we say I do";

  const recipientFirst = guest?.first_name ?? "Friend";
  const recipientLast = guest?.last_name ?? "";

  const coupleSignature =
    wedding.bride_name && wedding.groom_name
      ? `${wedding.bride_name} & ${wedding.groom_name}`
      : (wedding.wedding_name ?? "The happy couple");

  return (
    <div className="relative overflow-hidden">
      {/* Side floral decorations — more prominent, like roses climbing the page edges */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <WatercolorBlot color="rose" size="2xl" className="absolute -top-24 right-0 opacity-60 rose-glow" />
        <WatercolorBlot color="sage" size="2xl" className="absolute -bottom-32 left-0 opacity-55 rose-glow" style={{ animationDelay: "2s" }} />
        <WatercolorBlot color="peach" size="xl" className="absolute top-1/2 -left-12 opacity-35" style={{ animationDelay: "4s" }} />
        <RoseCluster variant="side-right" size="lg" color="rose" className="absolute top-24 right-0 opacity-95" />
        <RoseCluster variant="side-left" size="lg" color="sage" className="absolute bottom-32 left-0 opacity-90" />
        <FloatingPetals count={14} />
      </div>

      {/* Hero — couple, date, location */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sunset" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <p className="font-script text-3xl md:text-4xl text-primary">together with their families</p>
          <h1 className="mt-5 font-display text-5xl md:text-7xl lg:text-8xl text-balance">
            {wedding.bride_name}
            <span className="font-script text-primary mx-4 align-baseline">&</span>
            {wedding.groom_name}
          </h1>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm md:text-base text-muted-foreground">
            {wedding.wedding_date && (
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                {formatLongDate(wedding.wedding_date)}
              </span>
            )}
            {wedding.location_name && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {wedding.location_name}
              </span>
            )}
          </div>

          {target && (
            <div className="mt-14">
              <Countdown target={target} label={countdownLabel} />
            </div>
          )}
        </div>
      </section>

      {/* Envelope + Parchment */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <EnvelopeLetter
          recipientFirstName={recipientFirst}
          recipientLastName={recipientLast}
          invitationTemplate={wedding.invitation_text ?? null}
          coupleSignature={coupleSignature}
        />
      </section>

      {/* Wishlist / gift registry */}
      {wedding.wishlist_enabled && <WishlistSection weddingId={wedding.id} />}

      {/* Reverse side — practical info */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <FloralDivider color="terracotta" />

        <div className="text-center mt-4 mb-12">
          <p className="font-script text-3xl md:text-4xl text-primary">the details</p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="card-romantic p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
              <WatercolorBlot color="rose" size="sm" />
            </div>
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="mt-4 font-display text-2xl">When</h3>
            <p className="mt-3 text-foreground">{formatLongDate(wedding.wedding_date)}</p>
            {wedding.ceremony_at && (
              <p className="mt-1 text-sm text-muted-foreground">
                Ceremony at {formatTime(wedding.ceremony_at)}
              </p>
            )}
            {wedding.reception_at && (
              <p className="text-sm text-muted-foreground">
                Reception from {formatTime(wedding.reception_at)}
              </p>
            )}
            {isEvening && (
              <p className="mt-3 text-xs text-primary">
                You're invited to the evening celebration.
              </p>
            )}
          </div>

          <div className="card-romantic p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
              <WatercolorBlot color="sage" size="sm" />
            </div>
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="mt-4 font-display text-2xl">Where</h3>
            <p className="mt-3 text-foreground">{wedding.location_name}</p>
            {wedding.location_address && (
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                {wedding.location_address}
              </p>
            )}
            {safeHttpUrl(wedding.maps_url) && (
              <a
                href={safeHttpUrl(wedding.maps_url)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8 shadow-warm">
            <Link to="/$slug/rsvp" params={{ slug }}>
              <ListChecks className="w-4 h-4 mr-2" /> Reply with your wishes
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 border-primary/30 hover:bg-primary/5">
            <Link to="/$slug/timeline" params={{ slug }}>
              <Heart className="w-4 h-4 mr-2" /> See the day
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
