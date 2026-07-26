import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Logo />
          <p className="font-script text-2xl text-primary leading-none">
            Your story. Beautifully shared.
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            A romantic home for every wedding — from the first save-the-date to the last dance.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link to="/demo" className="hover:text-primary transition-colors">Demo wedding</Link></li>
            <li><Link to="/create" className="hover:text-primary transition-colors">Create yours</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-4">Couples</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-primary transition-colors">Sign in</Link></li>
            <li><span className="text-muted-foreground">Guest invitation</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} OurJourney. Made with warmth.</p>
          <p className="font-script text-base text-primary/80">— et toujours —</p>
        </div>
      </div>
    </footer>
  );
}
