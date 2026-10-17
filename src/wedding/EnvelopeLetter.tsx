import "./letter-paper.css";
import { useEffect, useId, useState } from "react";
import { WaxSeal, initialsFromCouple, type WaxSealMotif } from "./WaxSeal";
import { renderInvitationText } from "./invitationTemplate";
import { cn } from "@/lib/utils";

interface EnvelopeLetterProps {
  recipientFirstName: string;
  recipientLastName: string;
  invitationTemplate: string | null;
  coupleSignature: string;
  /** Wax seal crest — defaults to the monogram. Future weddings can
   *  swap in the initials, the rose, or a fully custom emblem. */
  sealMotif?: WaxSealMotif;
  sealInitials?: string;
}

type Stage = "closed" | "opening" | "open";

/** Where the flap tip meets the folds, in the 620 × 400 envelope drawing. */
const TIP_Y = 208;

/**
 * SVG filters that make the envelope and the letter look like paper and ink
 * instead of flat boxes. Rendered once, hidden, and referenced from the layers
 * below. The styles that go with them live in letter-paper.css.
 */
function PaperFilters({ id }: { id: string }) {
  return (
    <svg width={0} height={0} aria-hidden style={{ position: "absolute" }}>
      <defs>
        {/* Envelope stock: smooth, very fine tooth and a little cloudy mottling. Edges stay straight. */}
        <filter id={`${id}-env`} colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.5} numOctaves={2} seed={6} result="grain" />
          <feDiffuseLighting in="grain" surfaceScale={0.5} diffuseConstant={1.13} lightingColor="#ffffff" result="tooth">
            <feDistantLight azimuth={225} elevation={62} />
          </feDiffuseLighting>
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves={3} seed={15} result="mott" />
          <feColorMatrix
            in="mott"
            type="matrix"
            values="0.10 0 0 0 0.90  0.10 0 0 0 0.88  0.10 0 0 0 0.84  0 0 0 0 1"
            result="cloud"
          />
          <feBlend in="SourceGraphic" in2="tooth" mode="multiply" result="m1" />
          <feBlend in="m1" in2="cloud" mode="multiply" result="m2" />
          <feComposite in="m2" in2="SourceAlpha" operator="in" />
        </filter>

        {/* Letter paper: the same grain, a little softer, plus a slightly irregular edge */}
        <filter id={`${id}-paper`} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.45} numOctaves={2} seed={3} result="grain" />
          <feDiffuseLighting in="grain" surfaceScale={0.55} diffuseConstant={1.13} lightingColor="#ffffff" result="tooth">
            <feDistantLight azimuth={225} elevation={62} />
          </feDiffuseLighting>
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.01" numOctaves={3} seed={12} result="mott" />
          <feColorMatrix
            in="mott"
            type="matrix"
            values="0.12 0 0 0 0.88  0.12 0 0 0 0.86  0.12 0 0 0 0.82  0 0 0 0 1"
            result="cloud"
          />
          <feBlend in="SourceGraphic" in2="tooth" mode="multiply" result="m1" />
          <feBlend in="m1" in2="cloud" mode="multiply" result="m2" />
          <feComposite in="m2" in2="SourceAlpha" operator="in" result="clipped" />
          <feTurbulence type="fractalNoise" baseFrequency={0.03} numOctaves={2} seed={8} result="wob" />
          <feDisplacementMap in="clipped" in2="wob" scale={16} xChannelSelector="R" yChannelSelector="G" result="d1" />
          <feTurbulence type="fractalNoise" baseFrequency={0.8} numOctaves={2} seed={2} result="fine" />
          <feDisplacementMap in="d1" in2="fine" scale={5} xChannelSelector="G" yChannelSelector="R" />
        </filter>

        {/* Ink: uneven density and slightly soft edges, like pressed or pen ink */}
        <filter id={`${id}-ink`} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feGaussianBlur in="rough" stdDeviation={0.3} result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves={2} seed={21} result="dens" />
          <feColorMatrix in="dens" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1.2 0 0 0.3" result="densA" />
          <feComposite in="soft" in2="densA" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * The back of the envelope: two side flaps, the bottom flap lying on top of them,
 * and the V where everything folds. Light comes from the upper left, so the left
 * edge of the bottom flap catches a highlight and the right side falls in shade.
 */
function EnvelopePanels({ id }: { id: string }) {
  return (
    <svg className="env-panels" viewBox="0 0 620 400" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-gl`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity={0.18} />
          <stop offset="1" stopColor="#fff" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id={`${id}-gr`} x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0" stopColor="#3c2814" stopOpacity={0.1} />
          <stop offset="1" stopColor="#3c2814" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id={`${id}-gb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.1} />
          <stop offset="1" stopColor="#3c2814" stopOpacity={0.1} />
        </linearGradient>
        <filter id={`${id}-b3`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <filter id={`${id}-b7`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
        <clipPath id={`${id}-sides`}>
          <polygon points={`0,0 310,${TIP_Y} 0,400`} />
          <polygon points={`620,0 310,${TIP_Y} 620,400`} />
        </clipPath>
        <clipPath id={`${id}-open`}>
          <polygon points={`0,0 620,0 310,${TIP_Y}`} />
        </clipPath>
      </defs>

      {/* the three folded-over panels */}
      <polygon points={`0,0 310,${TIP_Y} 0,400`} fill={`url(#${id}-gl)`} />
      <polygon points={`620,0 310,${TIP_Y} 620,400`} fill={`url(#${id}-gr)`} />
      <polygon points={`0,400 310,${TIP_Y} 620,400`} fill={`url(#${id}-gb)`} />

      {/* shadow the bottom flap casts on the side flaps */}
      <g clipPath={`url(#${id}-sides)`} fill="none" strokeLinecap="round">
        <path d={`M0,400 L310,${TIP_Y}`} stroke="#2a1608" strokeOpacity={0.14} strokeWidth={8} filter={`url(#${id}-b3)`} />
        <path d={`M620,400 L310,${TIP_Y}`} stroke="#2a1608" strokeOpacity={0.26} strokeWidth={9} filter={`url(#${id}-b3)`} />
      </g>

      {/* bottom flap edges: lit on the left, in shade on the right */}
      <path d={`M0,400 L310,${TIP_Y}`} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={1.2} />
      <path d={`M620,400 L310,${TIP_Y}`} fill="none" stroke="#3c2814" strokeOpacity={0.35} strokeWidth={1} />

      {/* the V of the opening, shaded by the side flaps (seen once the flap lifts) */}
      <g clipPath={`url(#${id}-open)`}>
        <path d={`M0,0 L310,${TIP_Y} L620,0`} fill="none" stroke="#1e0a0e" strokeOpacity={0.35} strokeWidth={12} filter={`url(#${id}-b7)`} />
      </g>

      {/* the shadow the closed flap casts on the body */}
      <polygon
        className="env-flap-shadow"
        points={`0,0 620,0 310,${TIP_Y}`}
        transform="translate(0 8)"
        fill="#2a1608"
        fillOpacity={0.34}
        filter={`url(#${id}-b7)`}
      />
    </svg>
  );
}

/**
 * Click-to-open envelope. The wax seal cracks, the flap lifts open in 3D,
 * and a folded cotton-paper letter rises into view — a small, handcrafted moment
 * rather than a flashy effect.
 */
export function EnvelopeLetter({
  recipientFirstName,
  recipientLastName,
  invitationTemplate,
  coupleSignature,
  sealMotif = "monogram",
  sealInitials,
}: EnvelopeLetterProps) {
  const [stage, setStage] = useState<Stage>("closed");
  const filterId = `paper-${useId().replace(/:/g, "")}`;
  const letterBody = renderInvitationText(
    invitationTemplate,
    recipientFirstName,
    recipientLastName,
  );

  // The wax seal always carries the couple's initials, e.g. "B & S".
  const crestInitials = sealInitials || initialsFromCouple(coupleSignature);

  useEffect(() => {
    if (stage !== "opening") return;
    // Under reduced motion the CSS flap animation collapses to ~0ms;
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
      <PaperFilters id={filterId} />

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
            <div className={cn("relative", stage === "closed" && "envelope-float gentle-breathe")}>
              {/* Ground shadow — grounds the envelope on the page */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 w-[70%] rounded-full blur-md"
                style={{ background: "color-mix(in oklab, var(--ds-envelope-shadow) 45%, transparent)" }}
                aria-hidden
              />

              <div className={cn("env-paper", stage === "opening" && "env-opening")}>
                <div className="env-body" style={{ filter: `url(#${filterId}-env)` }} aria-hidden />
                <div className="env-liner" style={{ filter: `url(#${filterId}-env)` }} aria-hidden />
                <EnvelopePanels id={filterId} />

                {/* Centered name plate, written in ink */}
                <div
                  className="absolute inset-x-0 bottom-6 text-center px-6"
                  style={{ filter: `url(#${filterId}-ink)` }}
                >
                  <p className="type-script-sm text-[var(--ds-parchment-ink)]">
                    {recipientFirstName} {recipientLastName}
                  </p>
                </div>

                {/* Top flap (closed triangle), lifts open in 3D on click */}
                <div className="env-flap">
                  <div className="env-flap-face" style={{ filter: `url(#${filterId}-env)` }} />
                  {/* lit edge on the left, shaded edge on the right */}
                  <svg className="env-flap-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <path d="M0,0 L50,100" fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
                    <path d="M100,0 L50,100" fill="none" stroke="#3c2814" strokeOpacity={0.4} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              </div>

              {/* Wax seal pinned to the flap point */}
              <div
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 pointer-events-none w-[19.354839%] [&>svg]:w-full [&>svg]:h-auto",
                  stage === "closed" && "wax-pulse",
                  stage === "opening" && "wax-break",
                )}
                style={{ top: "38%" }}
              >
                <WaxSeal size={120} motif={sealMotif} initials={crestInitials} />
              </div>
            </div>

            <span className="block mt-8 text-[22px] type-caption group-hover:text-primary transition-colors duration-[var(--ds-dur-fast)]">
              tap to break the seal
            </span>
          </button>
        </div>
      )}

      {opened && (
        <div className="flex justify-center">
          <article className="letter-paper letter-rise">
            {/* The paper itself: colour, aging, folds, grain and a slightly rough edge */}
            <div className="letter-sheet" aria-hidden style={{ filter: `url(#${filterId}-paper)` }}>
              <span className="letter-fold" style={{ top: "33.333%" }} />
              <span className="letter-fold" style={{ top: "66.666%" }} />
            </div>

            {/* The ink */}
            <div className="letter-content" style={{ filter: `url(#${filterId}-ink)` }}>
              <header>
                <p className="font-parchment-script text-[36px] md:text-[40px]">an invitation</p>
                <div className="letter-rule">
                  <span className="type-label !text-current">Sealed with love</span>
                </div>
              </header>

              <div className="letter-body space-y-5 type-body">{letterBody}</div>

              <div className="letter-signature">
                <p className="font-parchment-script text-3xl md:text-4xl mt-2">{coupleSignature}</p>
              </div>
            </div>

            {/* Tiny re-seal */}
            <div className="letter-seal">
              <WaxSeal size={52} motif={sealMotif} initials={crestInitials} />
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
