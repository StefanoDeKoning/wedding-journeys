import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const FOOTER_LINK = "type-nav hover:text-primary focus-ring-elegant transition-colors duration-[var(--ds-dur-fast)]";

export function SiteFooter() {
  return (
    <footer className="relative mt-section-lg border-t border-paper bg-wash-page">
      <div className="mx-auto max-w-7xl px-gutter py-section grid gap-block md:grid-cols-4">
        <div className="md:col-span-2 space-y-gutter">
          <Logo />
          <p className="type-script-sm">Your story. Beautifully shared.</p>
          <p className="type-body text-muted-foreground max-w-sm">
            A romantic home for every wedding — from the first save-the-date to the last dance.
          </p>
        </div>
        <div>
          <h4 className="type-label mb-4">Platform</h4>
          <ul className="space-y-2">
            <li><Link to="/features" className={FOOTER_LINK}>Features</Link></li>
            <li><Link to="/demo" className={FOOTER_LINK}>Demo wedding</Link></li>
            <li><Link to="/create" className={FOOTER_LINK}>Create yours</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="type-label mb-4">Couples</h4>
          <ul className="space-y-2">
            <li><Link to="/login" className={FOOTER_LINK}>Sign in</Link></li>
            <li><span className="type-nav text-muted-foreground">Guest invitation</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper">
        <div className="mx-auto max-w-7xl px-gutter py-6 flex flex-col md:flex-row items-center justify-between gap-2 type-caption">
          <p>© {new Date().getFullYear()} OurJourney. Made with warmth.</p>
          <p className="font-script text-base text-primary/80">— et toujours —</p>
        </div>
      </div>
    </footer>
  );
}
