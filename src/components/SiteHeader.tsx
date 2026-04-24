import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";

const nav = [
  { to: "/" as const, label: "Home" },
  { to: "/features" as const, label: "Features" },
  { to: "/demo" as const, label: "Demo" },
  { to: "/create" as const, label: "Create" },
];

export function SiteHeader() {
  const { isPlatformOwner } = useAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/75 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm tracking-wide text-foreground/75 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
          {isPlatformOwner && (
            <Link
              to="/admin/platform"
              className="text-sm tracking-wide text-foreground/75 hover:text-primary transition-colors flex items-center gap-1"
              activeProps={{ className: "text-primary" }}
            >
              <Crown className="w-3.5 h-3.5" /> Platform
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-foreground/75 hover:text-primary transition-colors">
            Login
          </Link>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
            <Link to="/create">Start your story</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

