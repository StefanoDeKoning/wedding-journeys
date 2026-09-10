import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Heart,
  ListChecks,
  Clock,
  Music,
  HelpCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import { Countdown } from "@/wedding/Countdown";
import { WishlistSection } from "@/wedding/WishlistSection";
import { RsvpDialog, type GuestType } from "@/wedding/RsvpForm";
import { safeHttpUrl } from "@/lib/safeUrl";
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  ThemedCard,
  ThemedButton,
  Badge,
  Divider,
  Hero,
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
  const { wedding, guest } = useWeddingContext();
  const [rsvpOpen, setRsvpOpen] = useState(false);


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
      <Container width="content">
        <Hero
          compact
          script="together with their families"
          title={
            <>
              {wedding.bride_name}
              <span className="type-script mx-4 align-baseline">&</span>
              {wedding.groom_name}
            </>
          }
          subtitle={
            (wedding.wedding_date || wedding.location_name) && (
              <span className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-block">
                {wedding.wedding_date && (
                  <span className="flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="w-4 h-4 text-primary" />
                    {formatLongDate(wedding.wedding_date)}
                  </span>
                )}
                {wedding.location_name && (
                  <span className="flex items-center gap-2">
                    <MapPin aria-hidden="true" className="w-4 h-4 text-primary" />
                    {wedding.location_name}
                  </span>
                )}
              </span>
            )
          }
          extra={
            <div className="flex flex-col items-center gap-4">
              <Divider className="w-full max-w-sm" />
              {target && <Countdown target={target} label={countdownLabel} compact />}
            </div>
          }
        />
      </Container>

      {/* Envelope — the signature moment */}
      <Section size="regular" width="prose" className="pt-0">
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

        <div className="mt-block grid gap-stack lg:grid-cols-2 lg:gap-block">
          <ThemedCard variant="framed" ornament className="animate-ds-reveal-left">
            <Badge tone="primary">
              <CalendarDays aria-hidden="true" className="w-3 h-3" /> When
            </Badge>
            <p className="type-card-title mt-4">
              {wedding.wedding_date ? formatLongDate(wedding.wedding_date) : "Date to be announced"}
            </p>
            <div className="mt-4 space-y-2 type-body text-muted-foreground">
              {wedding.ceremony_at && (
                <p className="flex items-center gap-2">
                  <Clock aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                  Ceremony at {formatTime(wedding.ceremony_at)}
                </p>
              )}
              {wedding.reception_at && (
                <p className="flex items-center gap-2">
                  <Clock aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                  Reception from {formatTime(wedding.reception_at)}
                </p>
              )}
            </div>
            {isEvening && (
              <p className="type-caption mt-4 text-primary">
                You're invited to the evening celebration.
              </p>
            )}
            {target && (
              <div className="mt-6 border-t border-paper pt-5">
                <Countdown target={target} label={countdownLabel} compact />
              </div>
            )}
          </ThemedCard>

          <ThemedCard variant="framed" ornament className="animate-ds-reveal-right lg:mt-12">
            <Badge tone="leaf">
              <MapPin aria-hidden="true" className="w-3 h-3" /> Where
            </Badge>
            <p className="type-card-title mt-4">{wedding.location_name || "Venue to be announced"}</p>
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
                className="type-nav mt-5 inline-flex items-center gap-1.5 text-primary hover-gild focus-ring-elegant"
              >
                Open in Google Maps →
              </a>
            )}
          </ThemedCard>
        </div>

        {(wedding.ceremony_master_name ||
          wedding.ceremony_master_phone ||
          wedding.ceremony_master_email) && (
          <ThemedCard variant="veil" className="mt-block animate-ds-reveal-left">
            <Badge tone="primary">
              <HelpCircle aria-hidden="true" className="w-3 h-3" /> Questions?
            </Badge>
            <p className="type-card-title mt-4">
              {wedding.ceremony_master_name || "Our ceremony master"}
            </p>
            <p className="type-caption mt-1">
              {wedding.ceremony_master_role || "Ceremony master"} — happy to help with anything
              about the day.
            </p>
            <div className="mt-4 space-y-2 type-body">
              {wedding.ceremony_master_phone && (
                <p className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`tel:${wedding.ceremony_master_phone.replace(/\s+/g, "")}`}
                    className="text-primary hover-gild focus-ring-elegant"
                  >
                    {wedding.ceremony_master_phone}
                  </a>
                </p>
              )}
              {wedding.ceremony_master_email && (
                <p className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`mailto:${wedding.ceremony_master_email}`}
                    className="text-primary hover-gild focus-ring-elegant break-all"
                  >
                    {wedding.ceremony_master_email}
                  </a>
                </p>
              )}
            </div>
          </ThemedCard>
        )}

        <div className="mt-block flex flex-col sm:flex-row gap-gutter justify-center">
          <ThemedButton size="lg" onClick={() => setRsvpOpen(true)}>
            <ListChecks className="w-4 h-4" /> Reply with your wishes
          </ThemedButton>
          <ThemedButton asChild variant="gilded" size="lg">
            <Link to="/$slug/timeline" params={{ slug }}>
              <Heart className="w-4 h-4" /> See the day
            </Link>
          </ThemedButton>
          {wedding.playlist_enabled && (
            <ThemedButton asChild variant="gilded" size="lg">
              <Link to="/$slug/playlist" params={{ slug }}>
                <Music className="w-4 h-4" /> Song requests
              </Link>
            </ThemedButton>
          )}
        </div>

        <RsvpDialog
          open={rsvpOpen}
          onOpenChange={setRsvpOpen}
          weddingId={wedding.id}
          rsvpDeadline={wedding.rsvp_deadline ?? null}
          guest={
            guest
              ? {
                  id: guest.id,
                  first_name: guest.first_name,
                  guest_type: guest.guest_type as GuestType,
                  plus_one_allowed: guest.plus_one_allowed,
                }
              : null
          }
        />
      </Section>
    </PageCanvas>
  );
}
