import { useEffect, useState } from "react";
import { WaxSeal, type WaxSealMotif } from "./WaxSeal";
import { renderInvitationText } from "./invitationTemplate";
import { DecorCorner, Divider } from "@/design-system";
import { cn } from "@/lib/utils";

interface EnvelopeLetterProps {
  recipientFirstName: string;
  recipientLastName: string;
  invitationTemplate: string | null;
  coupleSignature: string;
  /** Wax seal crest — defaults to the engraved rose. Future weddings can
   *  swap in initials, a monogram, or a fully custom emblem. */
  sealMotif?: WaxSealMotif;
  sealInitials?: string;
}

type Stage = "closed" | "opening" | "open";

/**
 * Click-to-open envelope. The wax seal cracks, the flap folds open in 3D,
 * and a parchment letter rises and unfolds — a small, handcrafted moment
 * rather than a flashy effect.
 */
export function EnvelopeLetter({
  recipientFirstName,
  recipientLastName,
  invitationTemplate,
  coupleSignature,
  sealMotif = "initials",
  sealInitials,
}: EnvelopeLetterProps) {
  const [stage, setStage] = useState<Stage>("closed");
  const letterBody = renderInvitationText(
    invitationTemplate,
    recipientFirstName,
    recipientLastName,
  );

  // "Billy & Sophie" → "B & S" so the wax seal always carries the couple's initials.
  const derivedInitials =
    sealInitials ??
    coupleSignature
      .split(/\s*(?:&|\+|and)\s*/i)
      .map((part) => part.trim().charAt(0).toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join(" & ");
  const crestInitials = derivedInitials || "&";


  useEffect(() => {
    if (stage !== "opening") return;
    // Under reduced motion the CSS flap-opening animation collapses to ~0ms;
    // without this check the letter would still wait the full 900ms behind a
    // visually-frozen (already-open-looking) flap.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setStage("open"), prefersReducedMotion ? 0 : 900);
    return () => clearTimeout(id);
  }, [stage]);

  const opened = stage === "open";

  return (
    <div className="relative w-full">
      {/* Decorative corner florals around the envelope area */}
      {!opened && (
        <>
          <DecorCorner placement="corner-top-left" motif="rose" size="sm" intensity={0.4} className="opacity-70" />
          <DecorCorner placement="corner-bottom-right" motif="leaf" size="sm" intensity={0.35} className="opacity-60" />
        </>
      )}

      {!opened && (
        <div className="flex flex-col items-center gap-6">
          <p className="type-script-sm text-center">a letter awaits you</p>

          <button
            type="button"
            onClick={() => stage === "closed" && setStage("opening")}
            aria-label={`Open invitation for ${recipientFirstName} ${recipientLastName}`}
            className="group relative focus-ring-elegant"
          >
            {/* Envelope */}
            <div
              className={cn("relative", stage === "closed" && "envelope-float gentle-breathe")}
              style={{ perspective: "1200px" }}
            >
              {/* Ground shadow — grounds the envelope on the page */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 w-[70%] rounded-full blur-md"
                style={{ background: "color-mix(in oklab, var(--ds-envelope-shadow) 45%, transparent)" }}
                aria-hidden
              />

              <div
                className="envelope-paper relative rounded-paper overflow-hidden border-paper"
                style={{
                  width: "min(620px, 92vw)",
                  aspectRatio: "620 / 400",
                }}
              >
                {/* Interior lining, revealed as the flap lifts */}
                <div
                  className="absolute inset-x-3 top-3 h-1/2 rounded-t-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, var(--ds-wax-primary) 10%, var(--ds-envelope-paper)) 0%, transparent 100%)",
                  }}
                  aria-hidden
                />

                {/* Body cross folds (subtle diagonals) */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg viewBox="0 0 620 400" className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M0,200 L310,376 L620,200"
                      fill="none"
                      stroke="color-mix(in oklab, var(--ds-envelope-shadow) 20%, transparent)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M0,0 L310,200 L620,0"
                      fill="none"
                      stroke="color-mix(in oklab, var(--ds-envelope-shadow) 13%, transparent)"
                      strokeWidth="1.2"
                    />
                    <rect x="1" y="1" width="618" height="398" fill="none" stroke="color-mix(in oklab, var(--ds-envelope-shadow) 10%, transparent)" strokeWidth="1" />
                  </svg>
                </div>

                {/* Engraved gold leaf sprig, lower-left of the seal */}
                <svg
                  viewBox="0 0 120 70"
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{ left: "16%", top: "60%", width: "22%", opacity: 0.85 }}
                >
                  <g
                    fill="none"
                    stroke="var(--ds-wax-gold, #c9a227)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M8,58 C36,50 72,32 110,10" />
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const t = 0.12 + i * 0.15;
                      const x = 8 + (102 * t);
                      const y = 58 - (48 * t * t + 12 * t);
                      return (
                        <g key={i}>
                          <path d={`M${x},${y} C${x - 4},${y - 12} ${x + 8},${y - 14} ${x + 6},${y - 3}`} />
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Centered name plate */}
                <div className="absolute inset-x-0 bottom-6 text-center px-6">
                  <p className="type-script-sm text-[var(--ds-parchment-ink)]">
                    {recipientFirstName} {recipientLastName}
                  </p>
                </div>

                {/* Top flap (closed triangle), flips open in 3D on click */}
                <div
                  className={cn(
                    "envelope-flap absolute inset-x-0 top-0 origin-top",
                    stage === "opening" && "flap-opening",
                  )}
                  style={{
                    height: "52%",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                />
              </div>

              {/* Wax seal pinned to the flap point */}
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 pointer-events-none",
                  stage === "closed" && "wax-pulse",
                  stage === "opening" && "wax-break",
                )}
                style={{ top: "38%" }}
              >
                <WaxSeal size={120} motif={sealMotif} initials={crestInitials} />
              </div>

            </div>

            <span className="block mt-8 type-caption group-hover:text-primary transition-colors duration-[var(--ds-dur-fast)]">
              tap to break the seal
            </span>
          </button>
        </div>
      )}

      {opened && (
        <div className="flex justify-center">
          <article
            className="parchment letter-rise texture-paper relative max-w-3xl w-full px-8 sm:px-14 md:px-20 py-16 md:py-24 rounded-card"
            style={{
              transform: "rotate(-0.4deg)",
            }}
          >
            {/* Internal decorative blots */}
            <DecorCorner placement="corner-top-right" motif="rose" size="xs" intensity={0.3} />
            <DecorCorner placement="corner-bottom-left" motif="leaf" size="xs" intensity={0.3} />

            <header className="text-center mb-8">
              <p className="font-parchment-script text-3xl md:text-4xl">an invitation</p>
              <div className="mt-3 inline-block border-t border-b border-current/30 px-6 py-1">
                <span className="type-label !text-current">Sealed with love</span>
              </div>
            </header>

            <div className="space-y-5 type-body whitespace-pre-line">{letterBody}</div>

            <div className="pt-6 text-center">
              <p className="font-parchment-script text-3xl md:text-4xl mt-2">{coupleSignature}</p>
            </div>

            <div className="mt-8">
              <Divider />
            </div>

            {/* Tiny re-seal */}
            <div className="absolute -top-6 right-6 md:right-10 rotate-12">
              <WaxSeal size={52} motif={sealMotif} initials={crestInitials} />
            </div>

          </article>
        </div>
      )}
    </div>
  );
}
