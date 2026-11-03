import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Deckled paper edge                                                   */
/* ------------------------------------------------------------------ */

/**
 * The torn top edge of a sheet of handmade paper. The path is generated
 * from a fixed seed at module load, so server and client render the same
 * markup.
 */
const DECKLE_PATH = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let d = "M0 24L0 12";
  for (let x = 0; x <= 1440; x += 5) {
    const y = 6 + rnd() * 9 + Math.sin(x / 37) * 2.5;
    d += `L${x} ${y.toFixed(1)}`;
  }
  return `${d}L1440 24Z`;
})();

/**
 * Sits on top of a toned `Section` and bites into the band above it. Its fill
 * is the section's own `--section-bg`, so it always matches the band it opens.
 */
export function DeckleEdge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 -top-[22px] z-[1] block h-6 w-full",
        className,
      )}
    >
      <path d={DECKLE_PATH} style={{ fill: "var(--section-bg, var(--background))" }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Arch frame                                                           */
/* ------------------------------------------------------------------ */

/** A garden-gate arch drawn in a double gold hairline, open at the bottom. */
export function ArchFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[42.5rem] rounded-t-[999px] border border-b-0 px-5 pt-[4.75rem] pb-8 sm:px-10 sm:pt-[7.5rem] sm:pb-12",
        "border-[color-mix(in_oklab,var(--ds-gold)_55%,transparent)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2.5 top-2.5 bottom-0 rounded-t-[999px] border border-b-0 border-[color-mix(in_oklab,var(--ds-gold)_22%,transparent)] sm:inset-x-3 sm:top-3"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fireflies                                                            */
/* ------------------------------------------------------------------ */

const FIREFLIES = [
  { left: "12%", top: "22%", delay: "0s" },
  { left: "19%", top: "48%", delay: "1.4s" },
  { left: "8%", top: "66%", delay: "2.6s" },
  { left: "84%", top: "18%", delay: "0.8s" },
  { left: "90%", top: "44%", delay: "2s" },
  { left: "79%", top: "62%", delay: "3.2s" },
  { left: "30%", top: "12%", delay: "3.8s" },
  { left: "68%", top: "30%", delay: "1.1s" },
];

/** A few slow, twinkling points of light for night-toned heroes. */
export function Fireflies({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {FIREFLIES.map((f) => (
        <span
          key={`${f.left}-${f.top}`}
          className="animate-ds-twinkle absolute block h-1 w-1 rounded-full bg-gold-hi shadow-[0_0_10px_3px_color-mix(in_oklab,var(--ds-gold-hi)_45%,transparent)]"
          style={{ left: f.left, top: f.top, animationDelay: f.delay }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Oak leaf                                                             */
/* ------------------------------------------------------------------ */

/** A small outlined oak leaf in gold — the ceremony tree as an ornament. */
export function OakLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 80" aria-hidden className={cn("h-7 w-3.5", className)}>
      <g fill="none" stroke="var(--ds-gold)" strokeWidth={1.3} strokeLinejoin="round">
        <path d="M20 72C26 66 30 62 28 58C34 58 37 52 32 48C38 46 40 40 34 36C39 32 39 26 33 24C36 18 30 8 20 4C10 8 4 18 7 24C1 26 1 32 6 36C0 40 2 46 8 48C3 52 6 58 12 58C10 62 14 66 20 72Z" />
        <path d="M20 79V12" />
      </g>
    </svg>
  );
}

/** Two fading gold hairlines with an oak leaf between them. */
export function LeafRule({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const vertical = orientation === "vertical";
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center gap-3.5",
        vertical ? "h-full flex-col" : "w-full",
        className,
      )}
    >
      <span
        className={cn(
          vertical
            ? "w-px flex-1 bg-linear-to-b from-transparent to-gold/80"
            : "h-px max-w-36 flex-1 bg-linear-to-r from-transparent to-gold/80",
        )}
      />
      <OakLeaf className={vertical ? undefined : "rotate-90"} />
      <span
        className={cn(
          vertical
            ? "w-px flex-1 bg-linear-to-t from-transparent to-gold/80"
            : "h-px max-w-36 flex-1 bg-linear-to-l from-transparent to-gold/80",
        )}
      />
    </div>
  );
}
