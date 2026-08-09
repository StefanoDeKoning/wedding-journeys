import { useEffect, useState } from "react";
import { WaxSeal, initialsFromCouple, type WaxSealMotif } from "./WaxSeal";
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

  // The wax seal always carries the couple's initials, e.g. "B & S".
  const crestInitials = sealInitials || initialsFromCouple(coupleSignature);


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
                  viewBox="0 0 130 70"
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{ left: "11%", top: "56%", width: "27%", opacity: 0.75 }}
                >
                  <path
                    d="M4,64 C34,58 74,40 122,6"
                    fill="none"
                    stroke="var(--ds-wax-gold, #c9a227)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  {[0.12, 0.3, 0.48, 0.66, 0.82].map((t, i) => {
                    const x = 4 + 118 * t;
                    const y = 64 - 58 * (0.35 * t + 0.65 * t * t);
                    const up = i % 2 === 0;
                    return (
                      <ellipse
                        key={t}
                        cx={x + 9}
                        cy={y + (up ? -7 : 7)}
                        rx="11"
                        ry="4.4"
                        transform={`rotate(${up ? -52 : 32} ${x + 9} ${y + (up ? -7 : 7)})`}
                        fill="var(--ds-wax-gold, #c9a227)"
                        fillOpacity="0.5"
                        stroke="var(--ds-wax-gold, #c9a227)"
                        strokeWidth="0.9"
                      />
                    );
                  })}
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
