import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { useGuestTimelineWindow } from "@/wedding/useGuestTimelineWindow";
import { buildIcs, downloadIcs, weddingMinutesToIso } from "@/wedding/calendarInvite";
import { formatLongDate, formatTime } from "@/wedding/formatDate";

import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import { Countdown } from "@/wedding/Countdown";
import { WishlistSection } from "@/wedding/WishlistSection";
import { CastleSkyline } from "@/wedding/CastleSkyline";
import { WaxSeal, initialsFromCouple } from "@/wedding/WaxSeal";
import { RsvpDialog, type GuestType } from "@/wedding/RsvpForm";
import { safeHttpUrl } from "@/lib/safeUrl";
import { cn } from "@/lib/utils";
import {
  PageCanvas,
  Section,
  SectionHeader,
  ThemedButton,
  ArchFrame,
  Fireflies,
  LeafRule,
  useTheme,
} from "@/design-system";
import { tHead, useI18n } from "@/i18n";

export const Route = createFileRoute("/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: tHead("Invitation — {slug}", { slug: params.slug }) },
      { name: "description", content: tHead("Your private digital wedding invitation.") },
    ],
  }),
  component: InvitationPage,
});

/**
 * The invitation, laid out as a stationery suite: a night-green hero under a
 * garden arch with the venue drawn as the horizon, the envelope under a soft
 * spotlight, then the practical details and the wishlist on paper.
 */
function InvitationPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWeddingContext();
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const { t, locale } = useI18n();
  const theme = useTheme();

  const isEvening = guest?.guest_type === "evening";
  const guestWindow = useGuestTimelineWindow(wedding.id, guest?.guest_type ?? null);
  const target =
    (guestWindow && wedding.wedding_date
      ? weddingMinutesToIso(wedding.wedding_date, guestWindow.start)
      : null) ??
    (isEvening
      ? (wedding.reception_at ?? wedding.ceremony_at)
      : (wedding.ceremony_at ?? wedding.reception_at));

  const recipientFirst = guest?.first_name ?? t("Friend");
  const recipientLast = guest?.last_name ?? "";

  const coupleSignature =
    wedding.bride_name && wedding.groom_name
      ? `${wedding.bride_name} & ${wedding.groom_name}`
      : (wedding.wedding_name ?? t("The happy couple"));
  const crest = initialsFromCouple(coupleSignature);

  const mapsUrl = safeHttpUrl(wedding.maps_url);
  const longDate = formatLongDate(wedding.wedding_date, locale);
  const hasCeremonyMaster = !!(
    wedding.ceremony_master_name ||
    wedding.ceremony_master_phone ||
    wedding.ceremony_master_email
  );

  const downloadCalendarEvent = () => {
    if (!wedding.wedding_date) return;
    const ics = buildIcs({
      uid: `${wedding.id}-${guest?.guest_type ?? "full_day"}@our-journey`,
      title: t("Wedding of {couple}", { couple: coupleSignature }),
      location: [wedding.location_name, wedding.location_address].filter(Boolean).join(", "),
      url: `${window.location.origin}/${slug}`,
      date: wedding.wedding_date,
      window: guestWindow,
    });
    downloadIcs(`${slug}.ics`, ics);
  };

  const openRsvp = () => setRsvpOpen(true);

  return (
    <PageCanvas decor={false}>
      {/* Hero — names under the garden arch, the countdown, the reply, the venue as horizon */}
      <Section tone="night" size="compact" width="wide" className="overflow-hidden !pb-0">
        {theme.decor.fireflies && <Fireflies />}
        <header className="relative flex flex-col items-center text-center">
          <ArchFrame className="animate-ds-fade">
            <p className="type-script">{t("together with the people they love")}</p>
            <h1 className="mt-5 font-display font-light leading-[0.92] tracking-[-0.03em] text-[clamp(3.75rem,17vw,8rem)] [font-variation-settings:'opsz'_144] [overflow-wrap:anywhere]">
              {wedding.bride_name && wedding.groom_name ? (
                <>
                  <span className="block">{wedding.bride_name}</span>
                  <span className="text-foil my-1.5 block text-[0.62em] font-normal italic leading-none">
                    &amp;
                  </span>
                  <span className="block">{wedding.groom_name}</span>
                </>
              ) : (
                coupleSignature
              )}
            </h1>
            {(longDate || wedding.location_name) && (
              <p className="mt-stack font-body text-sm uppercase tracking-[0.2em] text-muted-foreground sm:text-[0.9375rem]">
                {longDate}
                {longDate && wedding.location_name && (
                  <span aria-hidden="true" className="mx-3 hidden text-primary sm:inline">
                    ·
                  </span>
                )}
                {wedding.location_name && (
                  <span className="mt-1 block sm:mt-0 sm:inline">{wedding.location_name}</span>
                )}
              </p>
            )}
          </ArchFrame>

          {target && (
            <div className="mt-block animate-ds-reveal" style={{ animationDelay: "120ms" }}>
              <Countdown
                variant="inline"
                target={target}
                showSeconds={false}
                label={
                  isEvening
                    ? t("until the evening celebration begins")
                    : t("until the celebration begins")
                }
              />
            </div>
          )}

          {theme.decor.horizon === "castle-courtyard" && <CastleSkyline className="mt-block" />}
        </header>
      </Section>

      {/* Envelope — the signature moment, under a soft spotlight */}
      <Section
        tone="night-deep"
        size="regular"
        width="prose"
        className="bg-[radial-gradient(42%_55%_at_50%_52%,color-mix(in_oklab,var(--ds-on-night)_13%,transparent),transparent_70%)]"
      >
        <div className="animate-ds-scale" style={{ animationDelay: "120ms" }}>
          <EnvelopeLetter
            recipientFirstName={recipientFirst}
            recipientLastName={recipientLast}
            invitationTemplate={wedding.invitation_text ?? null}
            coupleSignature={coupleSignature}
          />
        </div>
      </Section>

      {/* Practical info — one stationery card, then the reply card and the ceremony master */}
      <Section tone="paper" edge size="spacious" width="wide">
        <SectionHeader
          align="left"
          eyebrow={t("save these moments")}
          script={t("the details")}
          title={t("When and where to find us")}
        />

        <div className="stationery-card mt-block grid px-gutter py-block sm:px-block lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-block lg:px-[4.5rem] lg:py-16">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="type-label !text-gold-ink">{t("When")}</p>
            <p className="font-display text-[clamp(1.375rem,2vw,1.75rem)] font-light italic">
              {longDate || t("Date to be announced")}
            </p>
            {(wedding.ceremony_at || wedding.reception_at) && (
              <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 gap-y-1">
                {wedding.ceremony_at && (
                  <>
                    <span className="font-display text-[clamp(2.75rem,5vw,4rem)] font-light leading-[1.05] tabular-nums">
                      {formatTime(wedding.ceremony_at, locale)}
                    </span>
                    <span className="type-body text-muted-foreground">{t("Ceremony")}</span>
                  </>
                )}
                {wedding.reception_at && (
                  <>
                    <span className="font-display text-[clamp(2.75rem,5vw,4rem)] font-light leading-[1.05] tabular-nums">
                      {formatTime(wedding.reception_at, locale)}
                    </span>
                    <span className="type-body text-muted-foreground">{t("Reception")}</span>
                  </>
                )}
              </div>
            )}
            {isEvening && (
              <p className="type-body text-primary">
                {t("You're invited to the evening celebration.")}
              </p>
            )}
            {wedding.wedding_date && (
              <button
                type="button"
                onClick={downloadCalendarEvent}
                className="type-body link-ink mt-2 inline-flex items-center gap-2 self-start focus-ring-elegant"
              >
                <CalendarPlus aria-hidden="true" className="h-4 w-4" />
                {t("Add to calendar")}
              </button>
            )}
          </div>

          <LeafRule orientation="vertical" className="hidden lg:flex" />
          <LeafRule className="my-stack lg:hidden" />

          <div className="flex min-w-0 flex-col gap-3">
            <p className="type-label !text-gold-ink">{t("Where")}</p>
            <p className="font-display text-[clamp(2rem,3.4vw,2.875rem)] leading-[1.08] tracking-[-0.01em]">
              {wedding.location_name || t("Venue to be announced")}
            </p>
            {wedding.location_address && (
              <p className="type-body whitespace-pre-line text-muted-foreground">
                {wedding.location_address}
              </p>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="type-body link-ink mt-2 self-start focus-ring-elegant"
              >
                {t("Open in Google Maps →")}
              </a>
            )}
          </div>
        </div>

        <div
          className={cn(
            "mt-section grid gap-section lg:mt-block lg:gap-stack",
            hasCeremonyMaster && "lg:grid-cols-[1.25fr_1fr]",
          )}
        >
          {/* Reply card, sealed at the top */}
          <div className="relative flex flex-col items-center gap-5 rounded-card border-paper bg-card px-gutter pt-16 pb-stack text-center sm:px-block">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <WaxSeal size={58} initials={crest} />
            </div>
            <ThemedButton size="lg" className="w-full max-w-sm" onClick={openRsvp}>
              {t("Reply with your wishes")}
            </ThemedButton>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
              <Link
                to="/$slug/timeline"
                params={{ slug }}
                className="type-body link-ink focus-ring-elegant"
              >
                {t("See the day")}
              </Link>
              {wedding.playlist_enabled && (
                <Link
                  to="/$slug/playlist"
                  params={{ slug }}
                  className="type-body link-ink focus-ring-elegant"
                >
                  {t("Song requests")}
                </Link>
              )}
            </div>
          </div>

          {/* Ceremony master, as a calling card */}
          {hasCeremonyMaster && (
            <div className="flex flex-col justify-center gap-2 rounded-card border-gilded p-stack sm:p-10">
              <p className="type-label !text-gold-ink">{t("Questions?")}</p>
              <p className="type-card-title mt-1">
                {wedding.ceremony_master_name || t("Our ceremony master")}
              </p>
              <p className="type-body text-muted-foreground">
                {wedding.ceremony_master_role || t("Ceremony master")}{" "}
                {t("— happy to help with anything about the day.")}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {wedding.ceremony_master_phone && (
                  <a
                    href={`tel:${wedding.ceremony_master_phone.replace(/\s+/g, "")}`}
                    className="type-body link-ink self-start focus-ring-elegant"
                  >
                    {wedding.ceremony_master_phone}
                  </a>
                )}
                {wedding.ceremony_master_email && (
                  <a
                    href={`mailto:${wedding.ceremony_master_email}`}
                    className="type-body link-ink self-start break-all focus-ring-elegant"
                  >
                    {wedding.ceremony_master_email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Wishlist — after the practical info: first when and where, then gifts */}
      {wedding.wishlist_enabled && <WishlistSection weddingId={wedding.id} />}

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
    </PageCanvas>
  );
}
