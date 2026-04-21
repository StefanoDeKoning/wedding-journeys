/**
 * Hogwarts-inspired wax seal: a quartered shield with four heraldic symbols
 * (lion, serpent, eagle, badger silhouettes), surrounded by a ribboned border
 * and crowned with a star. Rendered as inline SVG so it scales crisply.
 */
export function WaxSeal({ size = 140 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="wax" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.55 0.18 28)" />
          <stop offset="55%" stopColor="oklch(0.42 0.18 28)" />
          <stop offset="100%" stopColor="oklch(0.28 0.14 28)" />
        </radialGradient>
        <radialGradient id="waxRim" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="transparent" />
          <stop offset="100%" stopColor="oklch(0.22 0.12 28)" />
        </radialGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.86 0.13 80)" />
          <stop offset="100%" stopColor="oklch(0.62 0.11 70)" />
        </linearGradient>
      </defs>

      {/* Wax disc with irregular drips */}
      <path
        d="M100 8
           C 138 6, 178 28, 188 70
           C 196 100, 184 138, 168 162
           C 156 180, 130 192, 100 192
           C 70 192, 44 180, 32 162
           C 16 138, 4 100, 12 70
           C 22 28, 62 10, 100 8 Z"
        fill="url(#wax)"
      />
      <path
        d="M100 8
           C 138 6, 178 28, 188 70
           C 196 100, 184 138, 168 162
           C 156 180, 130 192, 100 192
           C 70 192, 44 180, 32 162
           C 16 138, 4 100, 12 70
           C 22 28, 62 10, 100 8 Z"
        fill="url(#waxRim)"
      />

      {/* Embossed inner ring */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="oklch(0.78 0.13 75)" strokeWidth="1.2" opacity="0.55" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="oklch(0.22 0.12 28)" strokeWidth="0.8" opacity="0.6" />

      {/* Tiny stars around the rim */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 82;
        const y = 100 + Math.sin(a) * 82;
        return (
          <circle key={i} cx={x} cy={y} r="1.2" fill="url(#gold)" opacity="0.85" />
        );
      })}

      {/* Quartered crest shield */}
      <g transform="translate(100 100)">
        <path
          d="M -42 -46
             L 42 -46
             L 42 12
             C 42 38, 22 56, 0 64
             C -22 56, -42 38, -42 12
             Z"
          fill="oklch(0.32 0.14 28)"
          stroke="url(#gold)"
          strokeWidth="2"
        />

        {/* Quarter divisions */}
        <line x1="-42" y1="-15" x2="42" y2="-15" stroke="url(#gold)" strokeWidth="1.2" opacity="0.85" />
        <line x1="0" y1="-46" x2="0" y2="55" stroke="url(#gold)" strokeWidth="1.2" opacity="0.85" />

        {/* Top-left: lion silhouette (rampant — abstract) */}
        <g transform="translate(-21 -30)">
          <path
            d="M -7 6 C -10 0 -8 -8 -2 -10 C 0 -12 2 -12 4 -10 C 9 -8 10 -2 8 4 C 10 6 11 9 9 10 L 5 10 L 4 7 L -4 7 L -5 10 L -9 10 C -11 9 -10 6 -7 6 Z"
            fill="url(#gold)"
          />
          <circle cx="2" cy="-6" r="0.9" fill="oklch(0.32 0.14 28)" />
        </g>

        {/* Top-right: eagle (V wings) */}
        <g transform="translate(21 -30)">
          <path
            d="M -10 4 L 0 -8 L 10 4 L 6 5 L 0 -2 L -6 5 Z"
            fill="url(#gold)"
          />
          <circle cx="0" cy="-4" r="1.1" fill="url(#gold)" />
        </g>

        {/* Bottom-left: serpent (S curve) */}
        <g transform="translate(-21 18)" stroke="url(#gold)" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M -10 8 C -10 -2, 10 -2, 10 -8" />
          <circle cx="-10" cy="8" r="1.4" fill="url(#gold)" stroke="none" />
        </g>

        {/* Bottom-right: badger (oval body + stripes) */}
        <g transform="translate(21 18)">
          <ellipse cx="0" cy="2" rx="9" ry="6" fill="url(#gold)" />
          <path d="M -6 0 L -2 0 M 2 0 L 6 0" stroke="oklch(0.32 0.14 28)" strokeWidth="1.4" />
        </g>
      </g>

      {/* Crowning star */}
      <g transform="translate(100 28)">
        <path
          d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z"
          fill="url(#gold)"
        />
      </g>

      {/* Banner ribbon below */}
      <g transform="translate(100 168)">
        <path d="M -38 0 L 38 0 L 32 8 L -32 8 Z" fill="oklch(0.32 0.14 28)" stroke="url(#gold)" strokeWidth="0.8" />
        <text x="0" y="6" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="6" fill="url(#gold)" letterSpacing="2">
          OURJOURNEY
        </text>
      </g>
    </svg>
  );
}
