import { Link } from "@tanstack/react-router";
import {
  Mail,
  BookHeart,
  CalendarHeart,
  Image as ImageIcon,
  Music,
  MessageCircleHeart,
  MapPin,
  LogOut,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { ThemedButton } from "@/design-system";
import { cn } from "@/lib/utils";

const TAB_BASE =
  "type-nav flex min-h-11 items-center gap-2 rounded-full whitespace-nowrap px-4 py-2 border border-transparent " +
  "transition-[color,background-color,border-color,transform] duration-[var(--ds-dur-fast)] ease-[var(--ease-soft)] " +
  "focus-ring-elegant";
const TAB_INACTIVE = "text-muted-foreground hover:text-primary hover:bg-primary/8 hover:-translate-y-0.5";
const TAB_ACTIVE = "text-primary bg-primary/10 border-gilded shadow-elev-1";

const tabs = [
  { to: "/$slug" as const, label: "Invitation", icon: Mail, exact: true, feature: null },
  { to: "/$slug/story" as const, label: "Story", icon: BookHeart, exact: false, feature: "story" as const },
  { to: "/$slug/timeline" as const, label: "Timeline", icon: CalendarHeart, exact: false, feature: null },
  { to: "/$slug/gallery" as const, label: "Gallery", icon: ImageIcon, exact: false, feature: "gallery" as const },
  { to: "/$slug/playlist" as const, label: "Playlist", icon: Music, exact: false, feature: "playlist" as const },
  { to: "/$slug/guestbook" as const, label: "Guestbook", icon: MessageCircleHeart, exact: false, feature: "guestbook" as const },
  { to: "/$slug/location" as const, label: "Location", icon: MapPin, exact: false, feature: null },
];

export interface EnabledFeatures {
  story: boolean;
  gallery: boolean;
  playlist: boolean;
  guestbook: boolean;
}

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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/75 border-b border-paper shadow-elev-1">
      <div className="mx-auto max-w-6xl px-gutter">
        <div className="h-20 flex items-center justify-between gap-6">
          <Link
            to="/$slug"
            params={{ slug }}
            className="flex items-baseline gap-2 min-w-0 hover-gild"
          >
            <span className="type-script-sm truncate">{title}</span>
          </Link>
          <div className="flex items-center gap-4 shrink-0">
            {guestFirstName && (
              <span className="hidden sm:inline type-caption">
                Hi, <span className="text-foreground font-medium">{guestFirstName}</span>
              </span>
            )}
            {isAdmin && (
              <ThemedButton asChild variant="gilded" size="sm">
                <Link to="/$slug/admin" params={{ slug }} aria-label="Admin">
                  <Settings aria-hidden="true" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </ThemedButton>
            )}
            <ThemedButton
              variant="ghost"
              size="sm"
              aria-label="Sign out"
              onClick={async () => {
                await signOut();
                window.location.href = `/${slug}`;
              }}
            >
              <LogOut aria-hidden="true" className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </ThemedButton>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto -mx-gutter px-gutter pb-4 scrollbar-thin">
          {tabs
            .filter((t) => !t.feature || !features || features[t.feature])
            .map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                params={{ slug }}
                activeOptions={{ exact: t.exact }}
                className={cn(TAB_BASE, TAB_INACTIVE)}
                activeProps={{ className: cn(TAB_BASE, TAB_ACTIVE) }}
              >
                <Icon aria-hidden="true" className="w-3.5 h-3.5" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function WeddingShell({
  slug,
  title,
  guestFirstName,
  isAdmin = false,
  features,
  children,
}: {
  slug: string;
  title: string;
  guestFirstName?: string;
  isAdmin?: boolean;
  features?: EnabledFeatures;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-wash-page">
      <WeddingHeader
        slug={slug}
        title={title}
        guestFirstName={guestFirstName}
        isAdmin={isAdmin}
        features={features}
      />
      <main className="flex-1">{children}</main>
      <footer className="text-center type-caption py-block">
        Made with love on{" "}
        <Link to="/" className="text-primary hover-gild">
          OurJourney
        </Link>
      </footer>
    </div>
  );
}
