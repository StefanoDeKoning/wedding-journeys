import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/auth/AuthProvider";
import { ThemedButton } from "@/design-system";

const nav = [
  { to: "/" as const, label: "Home" },
  { to: "/features" as const, label: "Features" },
  { to: "/demo" as const, label: "Demo" },
  { to: "/create" as const, label: "Create" },
];

const NAV_LINK =
  "type-nav text-foreground/75 hover:text-primary focus-ring-elegant transition-colors duration-[var(--ds-dur-fast)] ease-[var(--ease-soft)]";

export function SiteHeader() {
  const { isPlatformOwner } = useAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-gutter h-16 sm:h-20 md:flex md:justify-between md:gap-6">
        <div className="min-w-0 truncate">
          <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-stack">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={NAV_LINK}
              activeProps={{ className: "type-nav text-primary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
          {isPlatformOwner && (
            <Link to="/admin/platform" className={`${NAV_LINK} flex items-center gap-1`} activeProps={{ className: "type-nav text-primary flex items-center gap-1" }}>
              <Crown aria-hidden="true" className="w-3.5 h-3.5" /> Platform
            </Link>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/login" className={`${NAV_LINK} whitespace-nowrap`}>
            Login
          </Link>
          <ThemedButton asChild size="sm" className="whitespace-nowrap">
            <Link to="/create">
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start your story</span>
            </Link>
          </ThemedButton>
        </div>
      </div>
    </header>
  );
}
