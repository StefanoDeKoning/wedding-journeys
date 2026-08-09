import type { ReactNode } from "react";

/** "Billy & Sophie" → "B & S" for the wax crest. */
export function initialsFromCouple(signature: string | null | undefined): string {
  if (!signature) return "&";
  const parts = signature
    .split(/\s*(?:&|\+|and)\s*/i)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2);
  return parts.length ? parts.join(" & ") : "&";
}

export type WaxSealMotif = "rose" | "initials" | "monogram" | "custom";

interface WaxSealProps {
  size?: number;
  /** Which crest is embossed into the wax. Defaults to the engraved initials. */
  motif?: WaxSealMotif;
  /** Used when motif="initials" or "monogram" — e.g. "S & J". */
  initials?: string;
  /** Used when motif="custom" — any inline SVG content, drawn in the same
   *  pressed-wax styling as the built-in crests, centered at (100,100). */
  children?: ReactNode;
}

/** Engraved rose in bloom — pressed into the wax. */
function RoseCrest() {
  return (
    <g transform="translate(100 100)" filter="url(#wax-emboss)">
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d="M0,-8 C14,-18 22,-5 15,10 C10,21 -3,25 -10,15 C-18,5 -13,-10 0,-8 Z"
          fill="var(--ds-wax-crest)"
        />
      ))}
      <circle r="11" fill="var(--ds-wax-crest)" />
      <path
        d="M0,26 C0,38 0,48 0,58"
        fill="none"
        stroke="var(--ds-wax-crest)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M0,40 C-9,36 -15,40 -17,49 C-8,50 -2,46 0,40 Z" fill="var(--ds-wax-crest)" />
      <path d="M0,47 C9,43 15,47 17,56 C8,57 2,53 0,47 Z" fill="var(--ds-wax-crest)" />
    </g>
  );
}

/** Embossed script initials, e.g. "S & F". */
function InitialsCrest({ text }: { text: string }) {
  const long = text.replace(/\s/g, "").length > 4;
  return (
    <g filter="url(#wax-emboss)">
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fontSize={long ? 44 : 56}
        fill="var(--ds-wax-crest)"
        style={{ fontFamily: "var(--ds-font-script)" }}
      >
        {text}
      </text>
    </g>
  );
}

/** Framed monogram — tighter tracking, small rule beneath. */
function MonogramCrest({ text }: { text: string }) {
  return (
    <g filter="url(#wax-emboss)">
      <text
        x="100"
        y="106"
        textAnchor="middle"
        fontSize="34"
        letterSpacing="3"
        fill="var(--ds-wax-crest)"
        style={{ fontFamily: "var(--ds-font-display)" }}
      >
        {text}
      </text>
      <path d="M76,124 L124,124" stroke="var(--ds-wax-crest)" strokeWidth="2" />
    </g>
  );
}

/* Irregular poured-wax silhouette (slightly off-round, with soft lobes). */
const WAX_BLOB = `M100 6
  C132 6, 160 16, 176 38
  C190 57, 197 82, 193 104
  C189 127, 179 150, 161 168
  C143 186, 121 195, 99 194
  C77 193, 55 184, 39 166
  C22 148, 10 124, 8 100
  C6 76, 14 50, 30 32
  C46 14, 70 6, 100 6 Z`;

/**
 * Realistic sealing wax: a poured, slightly irregular disc of deep wax with a
 * pressed rim, embossed crest, glossy specular highlight, subtle grain, and a
 * cast shadow — rendered as inline SVG so it scales crisply.
 */
export function WaxSeal({ size = 96, motif = "initials", initials = "", children }: WaxSealProps) {
  const uid = `wax-${motif}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        overflow: "visible",
        ["--ds-wax-crest" as string]:
          "color-mix(in oklab, var(--ds-wax-primary, #a8362a) 55%, #ffe0cd)",
      }}
    >
      <defs>
        {/* Body of the wax: warm lit top-left falling to a deep crimson edge */}
        <radialGradient id={`${uid}-body`} cx="36%" cy="28%" r="82%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--ds-wax-primary, #a8362a) 62%, #ffd9c9)" />
          <stop offset="42%" stopColor="var(--ds-wax-primary, #a8362a)" />
          <stop offset="78%" stopColor="var(--ds-wax-primary-dark, #75201a)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--ds-wax-primary-dark, #75201a) 88%, black)" />
        </radialGradient>
        {/* Pressed rim: darker ring right at the edge */}
        <radialGradient id={`${uid}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="92%" stopColor="color-mix(in oklab, var(--ds-wax-primary-dark, #75201a) 55%, transparent)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--ds-wax-primary-dark, #75201a) 78%, black)" />
        </radialGradient>
        {/* Specular sheen, upper-left */}
        <radialGradient id={`${uid}-sheen`} cx="34%" cy="26%" r="46%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="60%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Wax grain — fine mottled surface */}
        <filter id={`${uid}-grain`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g" result="g2">
            <feFuncA type="table" tableValues="0 0.16" />
          </feComponentTransfer>
          <feComposite in="g2" in2="SourceAlpha" operator="in" />
        </filter>

        {/* Embossing: crest appears pressed into the wax */}
        <filter id="wax-emboss" x="-25%" y="-25%" width="150%" height="150%">
          <feOffset in="SourceAlpha" dx="0" dy="1.6" result="lo" />
          <feGaussianBlur in="lo" stdDeviation="1.2" result="lob" />
          <feFlood floodColor="rgba(0,0,0,0.55)" result="dark" />
          <feComposite in="dark" in2="lob" operator="in" result="shadow" />
          <feOffset in="SourceAlpha" dx="0" dy="-1.4" result="hi" />
          <feGaussianBlur in="hi" stdDeviation="1.1" result="hib" />
          <feFlood floodColor="rgba(255,222,200,0.6)" result="light" />
          <feComposite in="light" in2="hib" operator="in" result="highlight" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="highlight" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft cast shadow beneath the wax */}
        <filter id={`${uid}-drop`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(60,15,10,0.45)" />
        </filter>

        {/* Rough, hand-poured edge */}
        <filter id={`${uid}-rough`} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <clipPath id={`${uid}-clip`}>
          <path d={WAX_BLOB} />
        </clipPath>
      </defs>

      <g filter={`url(#${uid}-drop)`}>
        <g filter={`url(#${uid}-rough)`}>
          <path d={WAX_BLOB} fill={`url(#${uid}-body)`} />
          <path d={WAX_BLOB} fill={`url(#${uid}-rim)`} />
        </g>

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Pressed inner ring (the stamp shoulder) */}
          <circle
            cx="100"
            cy="100"
            r="74"
            fill="none"
            stroke="color-mix(in oklab, var(--ds-wax-primary-dark, #75201a) 80%, black)"
            strokeWidth="3"
            opacity="0.45"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="color-mix(in oklab, var(--ds-wax-primary, #a8362a) 50%, white)"
            strokeWidth="1.4"
            opacity="0.3"
          />

          {/* Crest */}
          {motif === "rose" && <RoseCrest />}
          {motif === "initials" && <InitialsCrest text={initials || "&"} />}
          {motif === "monogram" && <MonogramCrest text={initials || "&"} />}
          {motif === "custom" && children}

          {/* Surface grain + gloss */}
          <path d={WAX_BLOB} fill="#000" filter={`url(#${uid}-grain)`} opacity="0.22" />
          <ellipse cx="74" cy="60" rx="58" ry="44" fill={`url(#${uid}-sheen)`} opacity="0.55" />
        </g>
      </g>
    </svg>
  );
}
