import { Link } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Section, ThemedButton } from "@/design-system";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/i18n/LanguageToggle";
import { useI18n, useT } from "@/i18n";
import { WaxSeal, initialsFromCouple } from "./WaxSeal";
import { formatLongDate } from "./formatDate";

const TAB_BASE =
  "relative flex min-h-11 shrink-0 items-center whitespace-nowrap font-body text-[0.8125rem] uppercase tracking-[0.18em] " +
  "transition-colors duration-[var(--ds-dur-fast)] ease-[var(--ease-soft)] focus-ring-elegant";
const TAB_INACTIVE = "text-muted-foreground hover:text-foreground";
const TAB_ACTIVE =
  "text-gold-hi after:absolute after:inset-x-0 after:bottom-2 after:h-px after:bg-gold after:content-['']";

const tabs = [
  { to: "/$slug" as const, label: "Invitation", exact: true, feature: null },
  { to: "/$slug/story" as const, label: "Story", exact: false, feature: "story" as const },
  { to: "/$slug/timeline" as const, label: "Timeline", exact: false, feature: null },
  { to: "/$slug/gallery" as const, label: "Gallery", exact: false, feature: "gallery" as const },
  { to: "/$slug/playlist" as const, label: "Playlist", exact: false, feature: "playlist" as const },
  {
    to: "/$slug/guestbook" as const,
    label: "Guestbook",
    exact: false,
    feature: "guestbook" as const,
  },
] as const;

export interface EnabledFeatures {
  story: boolean;
  gallery: boolean;
  playlist: boolean;
  guestbook: boolean;
}

/**
 * Night-green header. On phones only the top row (seal, language, sign out)
 * sticks; the tab row scrolls away with the page so it doesn't eat the screen.
 */
export function WeddingHeader({
  slug,
  title,
  guestFirstName,
  isAdmin = false,
  features,
}: {
  slug: string;
  title: string;
  guestFirstName?: string;
  isAdmin?: boolean;
  features?: EnabledFeatures;
}) {
  const { signOut } = useAuth();
  const t = useT();

  return (
    <header className="tone-night max-sm:contents sm:sticky sm:top-0 sm:z-40 sm:border-b sm:border-[color-mix(in_oklab,var(--ds-gold)_25%,transparent)]">
      <div className="tone-night grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-gutter max-sm:sticky max-sm:top-0 max-sm:z-40 max-sm:border-b max-sm:border-[color-mix(in_oklab,var(--ds-gold)_20%,transparent)] sm:h-[4.75rem] sm:grid-cols-[1fr_auto_1fr] sm:px-block">
        {guestFirstName ? (
          <span className="type-body hidden text-muted-foreground sm:block">
            {t("Hi,")} <span className="font-medium text-foreground">{guestFirstName}</span>
          </span>
        ) : (
          <span className="hidden sm:block" />
        )}

        <Link
          to="/$slug"
          params={{ slug }}
          aria-label={title}
          className="flex min-w-0 items-center gap-2.5 focus-ring-elegant sm:justify-center"
        >
          <WaxSeal size={40} initials={initialsFromCouple(title)} />
          <span className="truncate font-display text-[1.1875rem] italic sm:hidden">{title}</span>
        </Link>

        <div className="flex items-center justify-end gap-1.5 sm:gap-4">
          <LanguageToggle />
          {isAdmin && (
            <ThemedButton asChild variant="gilded" size="sm">
              <Link to="/$slug/admin" params={{ slug }} aria-label={t("Admin")}>
                <Settings aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("Admin")}</span>
              </Link>
            </ThemedButton>
          )}
          <ThemedButton
            variant="ghost"
            size="sm"
            aria-label={t("Sign out")}
            className="h-11 w-11 px-0 sm:w-auto sm:px-2"
            onClick={async () => {
              await signOut();
              window.location.href = `/${slug}`;
            }}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Sign out")}</span>
          </ThemedButton>
        </div>
      </div>

      <nav
        aria-label={t("Pages")}
        className="tone-night scrollbar-thin flex h-12 items-center gap-7 overflow-x-auto px-gutter pr-12 max-sm:[mask-image:linear-gradient(90deg,#000_78%,transparent)] sm:justify-center sm:gap-9 sm:pr-gutter"
      >
        {tabs
          .filter((tab) => !tab.feature || !features || features[tab.feature])
          .map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              params={{ slug }}
              activeOptions={{ exact: tab.exact }}
              className={cn(TAB_BASE, TAB_INACTIVE)}
              activeProps={{ className: cn(TAB_BASE, TAB_ACTIVE) }}
            >
              {t(tab.label)}
            </Link>
          ))}
      </nav>
    </header>
  );
}

function WeddingFooter({
  title,
  weddingDate,
  locationName,
}: {
  title: string;
  weddingDate?: string | null;
  locationName?: string | null;
}) {
  const { t, locale } = useI18n();
  const meta = [formatLongDate(weddingDate, locale), locationName].filter(Boolean).join(" · ");
  return (
    <Section as="footer" tone="night" edge size="compact" width="prose">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <WaxSeal size={72} initials={initialsFromCouple(title)} />
        <p className="mt-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-light italic leading-tight">
          {title}
        </p>
        {meta && <p className="type-label !text-primary">{meta}</p>}
        <p className="type-caption mt-4">
          {t("Made with love on")}{" "}
          <Link to="/" className="link-ink !text-foreground">
            OurJourney
          </Link>
        </p>
      </div>
    </Section>
  );
}

export function WeddingShell({
  slug,
  title,
  guestFirstName,
  isAdmin = false,
  features,
  weddingDate,
  locationName,
  children,
}: {
  slug: string;
  title: string;
  guestFirstName?: string;
  isAdmin?: boolean;
  features?: EnabledFeatures;
  weddingDate?: string | null;
  locationName?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-wash-page">
      <WeddingHeader
        slug={slug}
        title={title}
        guestFirstName={guestFirstName}
        isAdmin={isAdmin}
        features={features}
      />
      <main className="flex-1">{children}</main>
      <WeddingFooter title={title} weddingDate={weddingDate} locationName={locationName} />
    </div>
  );
}
