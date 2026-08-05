import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface BotanicalProps {
  className?: string;
  style?: CSSProperties;
  color?: "rose" | "sage" | "gold" | "peach" | "blush";
  opacity?: number;
}

const colorMap = {
  rose: { light: "#d49696", mid: "#c28888", deep: "#b07070" },
  sage: { light: "#9bb79e", mid: "#8fa392", deep: "#7fa382" },
  gold: { light: "#d4b97f", mid: "#bfa06b", deep: "#a68857" },
  peach: { light: "#e0a884", mid: "#d89870", deep: "#c98c64" },
  blush: { light: "#e8c4c4", mid: "#ddb0b0", deep: "#d29c9c" },
};

// ============================================================
// Rose Variations
// ============================================================

/**
 * Delicate rose bud — barely open, romantic and precious
 */
export function RoseBud({ className, color = "rose", opacity = 0.8 }: BotanicalProps) {
  const colors = colorMap[color];
  return (
    <svg
      viewBox="0 0 100 140"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id={`bud-${color}`} cx="40%" cy="40%">
          <stop offset="0%" stopColor={colors.light} stopOpacity={opacity} />
          <stop offset="100%" stopColor={colors.deep} stopOpacity={opacity * 0.9} />
        </radialGradient>
      </defs>

      {/* Sepals (outer green leaves) */}
      <ellipse cx="50" cy="50" rx="18" ry="22" fill="#8fa392" opacity={opacity * 0.6} transform="rotate(-25 50 50)" />
      <ellipse cx="50" cy="50" rx="18" ry="22" fill="#8fa392" opacity={opacity * 0.5} transform="rotate(25 50 50)" />
      <ellipse cx="50" cy="55" rx="16" ry="20" fill="#9bb79e" opacity={opacity * 0.4} transform="rotate(0 50 55)" />

      {/* Outer petals (3-4) */}
      <ellipse cx="42" cy="38" rx="8" ry="14" fill={colors.light} opacity={opacity * 0.8} transform="rotate(-35 42 38)" />
      <ellipse cx="58" cy="38" rx="8" ry="14" fill={colors.light} opacity={opacity * 0.75} transform="rotate(35 58 38)" />
      <ellipse cx="35" cy="50" rx="7" ry="13" fill={colors.mid} opacity={opacity * 0.7} transform="rotate(-60 35 50)" />

      {/* Center petals (hidden suggestion) */}
      <ellipse cx="50" cy="48" rx="10" ry="12" fill={colors.mid} opacity={opacity * 0.6} />
      <ellipse cx="48" cy="50" rx="6" ry="8" fill={colors.deep} opacity={opacity * 0.5} />

      {/* Stem */}
      <path d="M 50 62 Q 48 85 49 110" stroke="#8fa392" strokeWidth="1.5" fill="none" opacity={opacity * 0.7} />
      {/* Thorns */}
      <line x1="48" y1="75" x2="44" y2="73" stroke="#7fa382" strokeWidth="0.8" opacity={opacity * 0.6} />
      <line x1="52" y1="90" x2="56" y2="88" stroke="#7fa382" strokeWidth="0.8" opacity={opacity * 0.6} />
    </svg>
  );
}

/**
 * Blooming rose — mid-stage opening, romantic
 */
export function RoseBlooming({ className, color = "rose", opacity = 0.9 }: BotanicalProps) {
  const colors = colorMap[color];
  return (
    <svg
      viewBox="0 0 120 160"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id={`bloom-${color}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={colors.light} stopOpacity={opacity} />
          <stop offset="70%" stopColor={colors.mid} stopOpacity={opacity * 0.9} />
          <stop offset="100%" stopColor={colors.deep} stopOpacity={opacity * 0.8} />
        </radialGradient>
        <filter id={`petal-blur-${color}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
        </filter>
      </defs>

      {/* Outer petal layer (loose, romantic) */}
      <ellipse cx="50" cy="25" rx="14" ry="28" fill={colors.light} opacity={opacity * 0.6} transform="rotate(-45 50 25)" filter={`url(#petal-blur-${color})`} />
      <ellipse cx="90" cy="45" rx="14" ry="28" fill={colors.light} opacity={opacity * 0.55} transform="rotate(15 90 45)" filter={`url(#petal-blur-${color})`} />
      <ellipse cx="70" cy="75" rx="14" ry="28" fill={colors.light} opacity={opacity * 0.5} transform="rotate(65 70 75)" filter={`url(#petal-blur-${color})`} />
      <ellipse cx="30" cy="65" rx="14" ry="28" fill={colors.light} opacity={opacity * 0.55} transform="rotate(-65 30 65)" filter={`url(#petal-blur-${color})`} />

      {/* Mid petal layer */}
      <circle cx="60" cy="35" r="18" fill={`url(#bloom-${color})`} opacity={opacity * 0.8} />
      <ellipse cx="75" cy="55" rx="12" ry="22" fill={colors.mid} opacity={opacity * 0.75} transform="rotate(30 75 55)" />
      <ellipse cx="45" cy="55" rx="12" ry="22" fill={colors.mid} opacity={opacity * 0.7} transform="rotate(-30 45 55)" />

      {/* Inner petals */}
      <circle cx="60" cy="45" r="14" fill={colors.mid} opacity={opacity * 0.8} />
      <ellipse cx="60" cy="50" rx="8" ry="10" fill={colors.deep} opacity={opacity * 0.7} />

      {/* Center stamen */}
      <circle cx="60" cy="50" r="3" fill="#d4b97f" opacity={opacity * 0.8} />
      <circle cx="60" cy="50" r="1.5" fill="#bfa06b" opacity={opacity} />

      {/* Stem */}
      <path d="M 60 68 Q 58 100 60 145" stroke="#8fa392" strokeWidth="2" fill="none" opacity={opacity * 0.7} />
      {/* Leaves on stem */}
      <ellipse cx="52" cy="90" rx="8" ry="14" fill="#9bb79e" opacity={opacity * 0.6} transform="rotate(-45 52 90)" />
      <ellipse cx="68" cy="110" rx="8" ry="14" fill="#9bb79e" opacity={opacity * 0.6} transform="rotate(45 68 110)" />
      {/* Thorns */}
      <line x1="58" y1="80" x2="52" y2="78" stroke="#7fa382" strokeWidth="1" opacity={opacity * 0.5} />
      <line x1="62" y1="105" x2="68" y2="103" stroke="#7fa382" strokeWidth="1" opacity={opacity * 0.5} />
    </svg>
  );
}

/**
 * Full bloom rose — luxurious, voluptuous petals
 */
export function RoseFullBloom({ className, color = "rose", opacity = 1 }: BotanicalProps) {
  const colors = colorMap[color];
  return (
    <svg
      viewBox="0 0 160 200"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id={`full-${color}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={colors.light} stopOpacity={opacity} />
          <stop offset="50%" stopColor={colors.mid} stopOpacity={opacity * 0.95} />
          <stop offset="100%" stopColor={colors.deep} stopOpacity={opacity * 0.9} />
        </radialGradient>
        <filter id={`petal-soft-${color}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>

      {/* Outer petals — loose and airy */}
      <ellipse cx="80" cy="20" rx="20" ry="35" fill={colors.light} opacity={opacity * 0.5} filter={`url(#petal-soft-${color})`} />
      <ellipse cx="140" cy="50" rx="22" ry="38" fill={colors.light} opacity={opacity * 0.45} transform="rotate(45 140 50)" filter={`url(#petal-soft-${color})`} />
      <ellipse cx="140" cy="130" rx="22" ry="38" fill={colors.light} opacity={opacity * 0.5} transform="rotate(90 140 130)" filter={`url(#petal-soft-${color})`} />
      <ellipse cx="80" cy="160" rx="20" ry="35" fill={colors.light} opacity={opacity * 0.48} transform="rotate(135 80 160)" filter={`url(#petal-soft-${color})`} />
      <ellipse cx="20" cy="130" rx="22" ry="38" fill={colors.light} opacity={opacity * 0.55} transform="rotate(-90 20 130)" filter={`url(#petal-soft-${color})`} />
      <ellipse cx="20" cy="50" rx="22" ry="38" fill={colors.light} opacity={opacity * 0.5} transform="rotate(-45 20 50)" filter={`url(#petal-soft-${color})`} />

      {/* Mid-layer petals */}
      <circle cx="80" cy="50" r="32" fill={`url(#full-${color})`} opacity={opacity * 0.9} />
      <ellipse cx="110" cy="75" rx="18" ry="30" fill={colors.mid} opacity={opacity * 0.85} transform="rotate(35 110 75)" />
      <ellipse cx="50" cy="75" rx="18" ry="30" fill={colors.mid} opacity={opacity * 0.85} transform="rotate(-35 50 75)" />
      <ellipse cx="95" cy="110" rx="18" ry="28" fill={colors.mid} opacity={opacity * 0.8} transform="rotate(80 95 110)" />
      <ellipse cx="65" cy="110" rx="18" ry="28" fill={colors.mid} opacity={opacity * 0.8} transform="rotate(-80 65 110)" />

      {/* Inner petals */}
      <circle cx="80" cy="80" r="24" fill={colors.mid} opacity={opacity * 0.9} />
      <ellipse cx="80" cy="85" rx="14" ry="18" fill={colors.deep} opacity={opacity * 0.8} />

      {/* Center */}
      <circle cx="80" cy="85" r="6" fill="#d4b97f" opacity={opacity * 0.9} />
      <circle cx="80" cy="85" r="3" fill="#bfa06b" opacity={opacity} />

      {/* Stem */}
      <path d="M 80 130 Q 77 155 80 190" stroke="#8fa392" strokeWidth="2.5" fill="none" opacity={opacity * 0.8} />
      {/* Foliage */}
      <ellipse cx="65" cy="145" rx="10" ry="18" fill="#9bb79e" opacity={opacity * 0.65} transform="rotate(-50 65 145)" />
      <ellipse cx="95" cy="155" rx="10" ry="18" fill="#9bb79e" opacity={opacity * 0.65} transform="rotate(50 95 155)" />
    </svg>
  );
}

// ============================================================
// Leaves & Foliage
// ============================================================

/**
 * Rose leaf — elongated with soft veins
 */
export function RoseLeaf({ className, color = "sage", opacity = 0.7 }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 60 100"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9bb79e" stopOpacity={opacity} />
          <stop offset="50%" stopColor="#8fa392" stopOpacity={opacity * 0.9} />
          <stop offset="100%" stopColor="#7fa382" stopOpacity={opacity * 0.8} />
        </linearGradient>
      </defs>
      <path
        d="M 30 5 Q 20 25 18 50 Q 15 75 30 95 Q 45 75 42 50 Q 40 25 30 5 Z"
        fill="url(#leaf-grad)"
      />
      {/* Vein */}
      <path d="M 30 5 Q 30 30 30 95" stroke="#8fa392" strokeWidth="0.5" opacity={opacity * 0.4} />
      <path d="M 24 35 Q 20 50 22 70" stroke="#8fa392" strokeWidth="0.4" opacity={opacity * 0.3} />
      <path d="M 36 35 Q 40 50 38 70" stroke="#8fa392" strokeWidth="0.4" opacity={opacity * 0.3} />
    </svg>
  );
}

/**
 * Eucalyptus leaf — elongated, softer shape
 */
export function EucalyptusLeaf({ className, color = "sage", opacity = 0.6 }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 50 120"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M 25 10 Q 15 30 14 50 Q 13 75 25 110 Q 37 75 36 50 Q 35 30 25 10 Z"
        fill="#9bb79e"
        opacity={opacity}
      />
      <path d="M 25 10 Q 25 50 25 110" stroke="#7fa382" strokeWidth="0.3" opacity={opacity * 0.3} />
    </svg>
  );
}

/**
 * Fern frond — delicate, compound
 */
export function FernFrond({ className, opacity = 0.5 }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 80 140"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Main stem */}
      <path d="M 40 10 Q 38 50 40 130" stroke="#8fa392" strokeWidth="1" opacity={opacity * 0.7} />

      {/* Leaflets */}
      {[20, 35, 50, 65, 80, 95, 110].map((y) => (
        <g key={y}>
          <path
            d={`M 40 ${y} L ${25} ${y - 8}`}
            stroke="#9bb79e"
            strokeWidth="0.8"
            opacity={opacity * 0.6}
          />
          <path
            d={`M 40 ${y} L ${55} ${y - 8}`}
            stroke="#9bb79e"
            strokeWidth="0.8"
            opacity={opacity * 0.6}
          />
        </g>
      ))}
    </svg>
  );
}

// ============================================================
// Vines & Tendrils
// ============================================================

/**
 * Curling tendril — delicate, organic
 */
export function Tendril({ className, color = "sage", opacity = 0.6 }: BotanicalProps) {
  const leafColor = colorMap[color];
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M 20 20 Q 40 10 50 30 Q 60 50 45 70 Q 30 85 15 80"
        stroke={leafColor.light}
        strokeWidth="1.2"
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
      />
      {/* Tiny leaves along tendril */}
      <ellipse cx="35" cy="20" rx="3" ry="5" fill={leafColor.light} opacity={opacity * 0.6} transform="rotate(-30 35 20)" />
      <ellipse cx="55" cy="45" rx="3" ry="5" fill={leafColor.light} opacity={opacity * 0.6} transform="rotate(30 55 45)" />
      <ellipse cx="35" cy="70" rx="3" ry="5" fill={leafColor.light} opacity={opacity * 0.6} transform="rotate(60 35 70)" />
    </svg>
  );
}

// ============================================================
// Gold & Ornamental Accents
// ============================================================

/**
 * Gold leaf flourish — delicate, luxe accent
 */
export function GoldLeafAccent({ className, opacity = 0.7 }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse
        cx="30"
        cy="30"
        rx="18"
        ry="8"
        fill="#d4b97f"
        opacity={opacity}
        transform="rotate(35 30 30)"
      />
      <path
        d="M 20 30 Q 30 20 40 30"
        stroke="#bfa06b"
        strokeWidth="0.8"
        fill="none"
        opacity={opacity * 0.7}
      />
    </svg>
  );
}

/**
 * Delicate flourish line — minimal, elegant
 */
export function Flourish({ className, opacity = 0.5 }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 100 40"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M 10 20 Q 30 5 50 20 Q 70 35 90 20"
        stroke="#d4b97f"
        strokeWidth="1"
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
      />
      {/* Tiny accents */}
      <circle cx="50" cy="20" r="1.5" fill="#bfa06b" opacity={opacity * 0.8} />
      <circle cx="30" cy="5" r="1" fill="#bfa06b" opacity={opacity * 0.6} />
      <circle cx="70" cy="35" r="1" fill="#bfa06b" opacity={opacity * 0.6} />
    </svg>
  );
}

/**
 * Small decorative heart — romantic accent
 */
export function HeartAccent({ className, opacity = 0.6 }: BotanicalProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M 20 35 C 5 25 2 18 2 13 C 2 8 6 5 10 5 C 14 5 18 8 20 12 C 22 8 26 5 30 5 C 34 5 38 8 38 13 C 38 18 35 25 20 35 Z"
        fill="#c8857c"
        opacity={opacity}
      />
    </svg>
  );
}
