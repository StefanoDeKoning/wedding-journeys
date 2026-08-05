import type { ReactNode } from "react";

export type WaxSealMotif = "rose" | "initials" | "monogram" | "custom";

interface WaxSealProps {
  size?: number;
  /** Which crest is embossed into the wax. Defaults to the engraved rose. */
  motif?: WaxSealMotif;
  /** Used when motif="initials" or "monogram" — e.g. "S & J". */
  initials?: string;
  /** Used when motif="custom" — any inline SVG content, drawn in the same
   *  gold-warm gradient as the built-in crests, centered at (100,100). */
  children?: ReactNode;
}

/** Engraved rose in bloom — the signature crest, pressed into the wax. */
function RoseCrest() {
  return (
    <g transform="translate(100 98)">
      {/* Outer petals */}
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d="M0,-6 C11,-14 17,-4 12,8 C8,17 -2,20 -8,12 C-14,4 -10,-8 0,-6 Z"
          fill="url(#gold-warm)"
          opacity="0.92"
        />
      ))}
      {/* Engraved petal grooves (shadow lines pressed into the wax) */}
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={`groove-${angle}`}
          transform={`rotate(${angle})`}
          d="M0,-4 C8,-9 11,-1 6,7"
          fill="none"
          stroke="var(--ds-wax-primary-dark)"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.45"
        />
      ))}
      {/* Inner swirl bud */}
      <circle r="9" fill="url(#gold-warm)" opacity="0.95" />
      <path
        d="M-5,0 C-5,-4 -1,-6 3,-4 C6,-2 6,2 2,4 C-2,6 -5,3 -5,0 Z"
        fill="none"
        stroke="var(--ds-wax-primary-dark)"
        strokeWidth="0.8"
        opacity="0.5"
      />
      {/* Shine highlight */}
      <path
        d="M-14,-20 C-10,-25 -3,-27 3,-24"
        fill="none"
        stroke="color-mix(in oklab, var(--ds-wax-gold) 60%, white)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Stem + leaves beneath the bloom */}
      <path
        d="M0,22 C0,34 0,44 0,52"
        fill="none"
        stroke="url(#gold-warm)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M0,36 C-8,32 -13,36 -15,44 C-7,45 -2,42 0,36 Z" fill="url(#gold-warm)" opacity="0.8" />
      <path d="M0,42 C8,38 13,42 15,50 C7,51 2,48 0,42 Z" fill="url(#gold-warm)" opacity="0.8" />
    </g>
  );
}

/** Elegant embossed initials, e.g. "S & J". */
function InitialsCrest({ text }: { text: string }) {
  return (
    <g transform="translate(100 104)">
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontSize="34"
        fill="url(#gold-warm)"
        style={{ fontFamily: "var(--ds-font-script)" }}
        opacity="0.95"
      >
        {text}
      </text>
    </g>
  );
}

/** Simple framed monogram — same crest, tighter tracking, small rule beneath. */
function MonogramCrest({ text }: { text: string }) {
  return (
    <g transform="translate(100 100)">
      <text
        x="0"
        y="8"
        textAnchor="middle"
        fontSize="26"
        letterSpacing="2"
        fill="url(#gold-warm)"
        style={{ fontFamily: "var(--ds-font-display)" }}
        opacity="0.95"
      >
        {text}
      </text>
      <path d="M-20,20 L20,20" stroke="url(#gold-warm)" strokeWidth="1" opacity="0.6" />
    </g>
  );
}

/**
 * Romantic wax seal: a soft warm-toned disc with an embossed crest,
 * delicate ring detailing, and a tiny banner. Rendered as inline SVG so
 * it scales crisply and matches the watercolor invitation aesthetic.
 *
 * The crest is swappable via `motif` so weddings can personalize their
 * seal (engraved rose by default, initials, a monogram, or fully custom
 * artwork) without changing the wax rendering itself.
 */
export function WaxSeal({ size = 96, motif = "rose", initials = "", children }: WaxSealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="wax-warm" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--ds-wax-primary) 70%, white)" />
          <stop offset="55%" stopColor="var(--ds-wax-primary)" />
          <stop offset="100%" stopColor="var(--ds-wax-primary-dark)" />
        </radialGradient>
        <radialGradient id="waxRim-warm" cx="50%" cy="50%" r="50%">
          <stop offset="82%" stopColor="transparent" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--ds-wax-primary-dark) 85%, black)" />
        </radialGradient>
        <linearGradient id="waxSheen-warm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--ds-wax-primary) 55%, white)" stopOpacity="0.55" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gold-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--ds-wax-gold) 70%, white)" />
          <stop offset="100%" stopColor="var(--ds-wax-gold)" />
        </linearGradient>
      </defs>

      {/* Wax disc with organic irregular edge, poured slightly off-round */}
      <path
        d="M100 9
           C 137 11, 175 31, 185 71
           C 193 99, 183 135, 167 159
           C 155 178, 130 191, 100 191
           C 70 191, 45 178, 33 159
           C 17 135, 7 99, 15 71
           C 25 31, 63 11, 100 9 Z"
        fill="url(#wax-warm)"
      />
      {/* Rim shading — depth toward the edge */}
      <path
        d="M100 9
           C 137 11, 175 31, 185 71
           C 193 99, 183 135, 167 159
           C 155 178, 130 191, 100 191
           C 70 191, 45 178, 33 159
           C 17 135, 7 99, 15 71
           C 25 31, 63 11, 100 9 Z"
        fill="url(#waxRim-warm)"
      />
      {/* Glossy pour sheen, upper-left */}
      <ellipse cx="76" cy="66" rx="46" ry="34" fill="url(#waxSheen-warm)" opacity="0.6" />

      {/* Embossed inner ring */}
      <circle cx="100" cy="100" r="76" fill="none" stroke="url(#gold-warm)" strokeWidth="1.1" opacity="0.55" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="var(--ds-wax-primary-dark)" strokeWidth="0.7" opacity="0.5" />

      {/* Tiny dots around the rim */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 84;
        const y = 100 + Math.sin(a) * 84;
        return <circle key={i} cx={x} cy={y} r="1.1" fill="url(#gold-warm)" opacity="0.7" />;
      })}

      {/* Crest */}
      {motif === "rose" && <RoseCrest />}
      {motif === "initials" && <InitialsCrest text={initials || "&"} />}
      {motif === "monogram" && <MonogramCrest text={initials || "&"} />}
      {motif === "custom" && children}

      {/* Banner ribbon below */}
      <g transform="translate(100 170)">
        <path d="M -36 0 L 36 0 L 31 8 L -31 8 Z" fill="var(--ds-wax-primary-dark)" stroke="url(#gold-warm)" strokeWidth="0.7" />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontSize="5"
          fill="url(#gold-warm)"
          letterSpacing="1.4"
          style={{ fontFamily: "var(--ds-font-display)" }}
        >
          OURJOURNEY
        </text>
      </g>
    </svg>
  );
}
