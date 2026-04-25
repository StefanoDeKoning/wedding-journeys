import { useState } from "react";
import { WaxSeal } from "./WaxSeal";
import { renderInvitationText } from "./invitationTemplate";

interface EnvelopeLetterProps {
  recipientFirstName: string;
  recipientLastName: string;
  invitationTemplate: string | null;
  coupleSignature: string;
}

/**
 * Click-to-open envelope. The wax seal cracks, the flap opens upwards,
 * and a parchment letter slides out and unfolds.
 */
export function EnvelopeLetter({
  recipientFirstName,
  recipientLastName,
  invitationTemplate,
  coupleSignature,
}: EnvelopeLetterProps) {
  const [opened, setOpened] = useState(false);
  const letterBody = renderInvitationText(
    invitationTemplate,
    recipientFirstName,
    recipientLastName,
  );

  return (
    <div className="relative w-full">
      {!opened && (
        <div className="flex flex-col items-center gap-6">
          <p className="font-script text-2xl md:text-3xl text-primary text-center">
            a letter awaits you
          </p>

          <button
            type="button"
            onClick={() => setOpened(true)}
            aria-label="Open invitation"
            className="group relative focus:outline-none"
          >
            {/* Envelope */}
            <div className="envelope-float relative" style={{ perspective: "1200px" }}>
              <div
                className="envelope-paper relative rounded-md overflow-hidden"
                style={{
                  width: "min(420px, 84vw)",
                  height: "min(280px, 56vw)",
                }}
              >
                {/* Body cross folds (subtle diagonals) */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg viewBox="0 0 420 280" className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M0,140 L210,260 L420,140"
                      fill="none"
                      stroke="oklch(0.55 0.04 40 / 0.18)"
                      strokeWidth="1"
                    />
                    <path
                      d="M0,0 L210,140 L420,0"
                      fill="none"
                      stroke="oklch(0.55 0.04 40 / 0.12)"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                {/* Centered name plate */}
                <div className="absolute inset-x-0 bottom-6 text-center px-6">
                  <p className="font-script text-xl md:text-2xl text-[oklch(0.32_0.06_40)]">
                    {recipientFirstName} {recipientLastName}
                  </p>
                </div>

                {/* Top flap (closed triangle) */}
                <div
                  className="envelope-flap absolute inset-x-0 top-0 origin-top"
                  style={{
                    height: "55%",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  }}
                />
              </div>

              {/* Wax seal pinned to the flap point */}
              <div
                className="absolute left-1/2 -translate-x-1/2 wax-pulse pointer-events-none"
                style={{ top: "44%" }}
              >
                <WaxSeal size={112} />
              </div>
            </div>

            <span className="block mt-6 text-sm text-muted-foreground group-hover:text-primary transition-colors">
              tap to break the seal
            </span>
          </button>
        </div>
      )}

      {opened && (
        <div className="flex justify-center">
          <article
            className="parchment letter-rise relative max-w-2xl w-full px-8 sm:px-12 md:px-16 py-14 md:py-20 rounded-sm"
            style={{
              transform: "rotate(-0.4deg)",
            }}
          >
            <header className="text-center mb-8">
              <p className="font-parchment-script text-3xl md:text-4xl">an invitation</p>
              <div className="mt-3 inline-block border-t border-b border-current/30 px-6 py-1">
                <span className="text-[0.65rem] tracking-[0.4em] uppercase">
                  Sealed with love
                </span>
              </div>
            </header>

            <div className="space-y-5 font-body text-base md:text-lg leading-relaxed whitespace-pre-line">
              {letterBody}
            </div>

            <div className="pt-6 text-center">
              <p className="font-parchment-script text-3xl md:text-4xl mt-2">
                {coupleSignature}
              </p>
            </div>

            {/* Tiny re-seal */}
            <div className="absolute -top-6 right-6 md:right-10">
              <div className="rotate-12">
                <WaxSeal size={56} />
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
