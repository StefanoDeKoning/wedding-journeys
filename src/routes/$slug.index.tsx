import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Heart, ListChecks, Clock } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import { Countdown } from "@/wedding/Countdown";
import { WishlistSection } from "@/wedding/WishlistSection";
import { safeHttpUrl } from "@/lib/safeUrl";
import {
  PageCanvas,
  Section,
  SectionHeader,
  ThemedCard,
  ThemedButton,
  Badge,
  Divider,
} from "@/design-system";

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

  const mapsUrl = safeHttpUrl(wedding.maps_url);

  return (
    <PageCanvas density="lavish">
      {/* Hero — the visual centerpiece: names, date, venue, countdown */}
      <Section size="hero" width="content">
        <div className="flex flex-col items-center gap-stack text-center">
          <p className="type-script animate-ds-fade">together with their families</p>

          <h1 className="type-hero animate-ds-reveal" style={{ animationDelay: "80ms" }}>
            {wedding.bride_name}
            <span className="type-script mx-4 align-baseline">&</span>
            {wedding.groom_name}
          </h1>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 type-body text-muted-foreground animate-ds-reveal"
            style={{ animationDelay: "180ms" }}
          >
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

          <Divider className="w-full max-w-sm" />

          {target && (
            <div className="animate-ds-reveal" style={{ animationDelay: "280ms" }}>
              <Countdown target={target} label={countdownLabel} />
            </div>
          )}
        </div>
      </Section>

      {/* Envelope — the signature moment */}
      <Section size="regular" width="prose">
        <div className="animate-ds-scale" style={{ animationDelay: "120ms" }}>
          <EnvelopeLetter
            recipientFirstName={recipientFirst}
            recipientLastName={recipientLast}
            invitationTemplate={wedding.invitation_text ?? null}
            coupleSignature={coupleSignature}
          />
        </div>
      </Section>

      {/* Wishlist / gift registry */}
      {wedding.wishlist_enabled && (
        <>
          <Divider />
          <WishlistSection weddingId={wedding.id} />
        </>
      )}

      <Divider />

      {/* Practical info — alternating, asymmetric rhythm rather than matched cards */}
      <Section size="spacious" width="content">
        <SectionHeader
          eyebrow="save these moments"
          script="the details"
          title="When and where to find us"
          align="center"
        />

        <div className="mt-block grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ThemedCard variant="framed" ornament className="animate-ds-reveal-left">
            <Badge tone="primary">
              <CalendarDays className="w-3 h-3" /> When
            </Badge>
            <p className="type-card-title mt-4">{formatLongDate(wedding.wedding_date)}</p>
            <div className="mt-4 space-y-2 type-body text-muted-foreground">
              {wedding.ceremony_at && (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  Ceremony at {formatTime(wedding.ceremony_at)}
                </p>
              )}
              {wedding.reception_at && (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  Reception from {formatTime(wedding.reception_at)}
                </p>
              )}
            </div>
            {isEvening && (
              <p className="type-caption mt-4 text-primary">
                You're invited to the evening celebration.
              </p>
            )}
          </ThemedCard>

          <ThemedCard variant="framed" ornament className="animate-ds-reveal-right lg:mt-12">
            <Badge tone="leaf">
              <MapPin className="w-3 h-3" /> Where
            </Badge>
            <p className="type-card-title mt-4">{wedding.location_name}</p>
            {wedding.location_address && (
              <p className="mt-3 type-body text-muted-foreground whitespace-pre-line">
                {wedding.location_address}
              </p>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 type-label !normal-case !tracking-normal text-primary hover-gild"
              >
                Open in Google Maps →
              </a>
            )}
          </ThemedCard>
        </div>

        <div className="mt-block flex flex-col sm:flex-row gap-4 justify-center">
          <ThemedButton asChild size="lg">
            <Link to="/$slug/rsvp" params={{ slug }}>
              <ListChecks className="w-4 h-4" /> Reply with your wishes
            </Link>
          </ThemedButton>
          <ThemedButton asChild variant="gilded" size="lg">
            <Link to="/$slug/timeline" params={{ slug }}>
              <Heart className="w-4 h-4" /> See the day
            </Link>
          </ThemedButton>
        </div>
      </Section>
    </PageCanvas>
  );
}
