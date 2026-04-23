import { Link } from "@tanstack/react-router";
import { Mail, ListChecks, CalendarHeart, Image as ImageIcon, Music, MapPin, LogOut, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";

const tabs = [
  { to: "/$slug" as const, label: "Invitation", icon: Mail, exact: true },
  { to: "/$slug/rsvp" as const, label: "RSVP", icon: ListChecks, exact: false },
  { to: "/$slug/timeline" as const, label: "Timeline", icon: CalendarHeart, exact: false },
  { to: "/$slug/gallery" as const, label: "Gallery", icon: ImageIcon, exact: false },
  { to: "/$slug/playlist" as const, label: "Playlist", icon: Music, exact: false },
  { to: "/$slug/location" as const, label: "Location", icon: MapPin, exact: false },
];

export function WeddingHeader({
  slug,
  title,
  guestFirstName,
  isAdmin = false,
}: {
  slug: string;
  title: string;
  guestFirstName?: string;
  isAdmin?: boolean;
}) {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to="/$slug" params={{ slug }} className="flex items-baseline gap-2 min-w-0">
            <span className="font-script text-2xl text-primary truncate">{title}</span>
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            {guestFirstName && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Hi, <span className="text-foreground font-medium">{guestFirstName}</span>
              </span>
            )}
            {isAdmin && (
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/$slug/admin" params={{ slug }}>
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                window.location.href = `/${slug}`;
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 pb-2 scrollbar-thin">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                params={{ slug }}
                activeOptions={{ exact: t.exact }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                activeProps={{
                  className:
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
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
  children,
}: {
  slug: string;
  title: string;
  guestFirstName?: string;
  isAdmin?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-soft">
      <WeddingHeader slug={slug} title={title} guestFirstName={guestFirstName} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <footer className="text-center text-xs text-muted-foreground py-8">
        Made with love on{" "}
        <Link to="/" className="text-primary hover:underline">
          OurJourney
        </Link>
      </footer>
    </div>
  );
}
