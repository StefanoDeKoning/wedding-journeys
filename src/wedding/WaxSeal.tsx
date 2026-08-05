/**
 * Romantic wax seal: a soft rose-gold disc with a heart motif,
 * delicate embossed ring, and a tiny banner. Rendered as inline SVG
 * so it scales crisply and matches the watercolor invitation aesthetic.
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
        <radialGradient id="wax-warm" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="oklch(0.62 0.14 28)" />
          <stop offset="55%" stopColor="oklch(0.48 0.16 28)" />
          <stop offset="100%" stopColor="oklch(0.35 0.12 28)" />
        </radialGradient>
        <radialGradient id="waxRim-warm" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="transparent" />
          <stop offset="100%" stopColor="oklch(0.28 0.10 28)" />
        </radialGradient>
        <linearGradient id="gold-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.10 80)" />
          <stop offset="100%" stopColor="oklch(0.68 0.09 70)" />
        </linearGradient>
      </defs>

      {/* Wax disc with organic irregular edge */}
      <path
        d="M100 10
           C 136 12, 174 32, 184 72
           C 192 100, 182 136, 166 160
           C 154 178, 130 190, 100 190
           C 70 190, 46 178, 34 160
           C 18 136, 8 100, 16 72
           C 26 32, 64 12, 100 10 Z"
        fill="url(#wax-warm)"
      />
      <path
        d="M100 10
           C 136 12, 174 32, 184 72
           C 192 100, 182 136, 166 160
           C 154 178, 130 190, 100 190
           C 70 190, 46 178, 34 160
           C 18 136, 8 100, 16 72
           C 26 32, 64 12, 100 10 Z"
        fill="url(#waxRim-warm)"
      />

      {/* Embossed inner ring */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="url(#gold-warm)" strokeWidth="1.2" opacity="0.6" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="oklch(0.22 0.10 28)" strokeWidth="0.8" opacity="0.5" />

      {/* Tiny dots around the rim */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 82;
        const y = 100 + Math.sin(a) * 82;
        return (
          <circle key={i} cx={x} cy={y} r="1.2" fill="url(#gold-warm)" opacity="0.75" />
        );
      })}

      {/* Heart crest */}
      <g transform="translate(100 100)">
        <path
          d="M 0 24
             C -18 8, -28 -2, -28 -14
             C -28 -26, -16 -34, 0 -24
             C 16 -34, 28 -26, 28 -14
             C 28 -2, 18 8, 0 24 Z"
          fill="url(#gold-warm)"
          opacity="0.9"
        />
        {/* Heart shine */}
        <path
          d="M -12 -18 C -8 -24, -2 -26, 2 -22"
          fill="none"
          stroke="oklch(0.98 0.05 80)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>

      {/* Banner ribbon below */}
      <g transform="translate(100 166)">
        <path d="M -40 0 L 40 0 L 34 9 L -34 9 Z" fill="oklch(0.28 0.10 28)" stroke="url(#gold-warm)" strokeWidth="0.8" />
        <text x="0" y="6.5" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="5.5" fill="url(#gold-warm)" letterSpacing="1.5">
          OURJOURNEY
        </text>
      </g>
    </svg>
  );
}
