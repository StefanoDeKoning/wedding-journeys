import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Heart, ListChecks } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import { Countdown } from "@/wedding/Countdown";
import { WishlistSection } from "@/wedding/WishlistSection";
import { Button } from "@/components/ui/button";

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
    <div>
      {/* Hero — couple, date, location */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sunset" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
          <p className="font-script text-3xl md:text-4xl text-primary">together with their families</p>
          <h1 className="mt-4 font-display text-5xl md:text-7xl text-balance">
            {wedding.bride_name}
            <span className="font-script text-primary mx-3 align-baseline">&</span>
            {wedding.groom_name}
          </h1>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm md:text-base text-muted-foreground">
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
            <div className="mt-12">
              <Countdown target={target} label={countdownLabel} />
            </div>
          )}
        </div>
      </section>




      {/* Envelope + Parchment */}
      <section className="mx-auto max-w-3xl px-6 py-20">
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
      <section className="mx-auto max-w-4xl px-6 pb-24">

        <div className="divider-script">
          <span className="font-script text-2xl">the details</span>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="rounded-[1.5rem] border border-border bg-card p-7 shadow-soft">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="mt-3 font-display text-2xl">When</h3>
            <p className="mt-2 text-foreground">{formatLongDate(wedding.wedding_date)}</p>
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

          <div className="rounded-[1.5rem] border border-border bg-card p-7 shadow-soft">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="mt-3 font-display text-2xl">Where</h3>
            <p className="mt-2 text-foreground">{wedding.location_name}</p>
            {wedding.location_address && (
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                {wedding.location_address}
              </p>
            )}
            {wedding.maps_url && (
              <a
                href={wedding.maps_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8 shadow-warm">
            <Link to="/$slug/rsvp" params={{ slug }}>
              <ListChecks className="w-4 h-4 mr-2" /> Reply with your wishes
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8">
            <Link to="/$slug/timeline" params={{ slug }}>
              <Heart className="w-4 h-4 mr-2" /> See the day
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
