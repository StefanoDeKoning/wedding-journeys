import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface FloralDecorationProps {
  className?: string;
  style?: CSSProperties;
  variant?: "corner-top-right" | "corner-bottom-left" | "side-left" | "side-right" | "corner-top-left" | "corner-bottom-right";
  color?: "rose" | "sage" | "gold" | "peach";
  opacity?: number;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  sm: { w: "w-32", h: "h-32" },
  md: { w: "w-48", h: "h-48" },
  lg: { w: "w-64", h: "h-64" },
  xl: { w: "w-80", h: "h-80" },
  "2xl": { w: "w-[28rem]", h: "h-[28rem]" },
};

/**
 * Colors are sourced from the active theme's decorative roles (`--ds-decor*`,
 * defined in styles.css) so this artwork re-themes automatically — never
 * hardcode a literal color here.
 */
const colorMap = {
  rose: "var(--ds-decor)",
  sage: "var(--ds-decor-leaf)",
  gold: "var(--ds-decor-gold)",
  peach: "var(--ds-decor-soft)",
};

const deepColorMap = {
  rose: "color-mix(in oklab, var(--ds-decor) 70%, var(--ds-ink) 30%)",
  sage: "color-mix(in oklab, var(--ds-decor-leaf) 70%, var(--ds-ink) 30%)",
  gold: "color-mix(in oklab, var(--ds-decor-gold) 70%, var(--ds-ink) 30%)",
  peach: "color-mix(in oklab, var(--ds-decor-soft) 70%, var(--ds-ink) 30%)",
};

export function WatercolorBlot({
  className,
  style,
  color = "rose",
  opacity = 0.35,
  size = "lg",
}: Omit<FloralDecorationProps, "variant">) {
  const { w, h } = sizeMap[size];
  return (
    <div className={cn("pointer-events-none", w, h, className)} style={style} aria-hidden>
      <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path
          fill={colorMap[color]}
          fillOpacity={opacity}
          d="M45,-77.2C58.1,-69.6,68.4,-57.3,76.5,-44.1C84.6,-30.9,90.4,-16.9,89.5,-3.1C88.6,10.7,81,24.3,72.4,36.9C63.8,49.5,54.1,61.1,41.9,69.5C29.7,77.9,14.8,83.1,-0.1,83.2C-15,83.3,-30.1,78.3,-43.8,70.5C-57.5,62.7,-69.9,52.1,-77.8,39C-85.7,25.9,-89.2,10.3,-87.3,-4.8C-85.4,-19.9,-78.2,-34.5,-68.1,-46.4C-58,-58.3,-45,-67.6,-31.6,-75.1C-18.2,-82.6,-4.4,-88.4,9.6,-87.4C23.6,-86.3,31.9,-84.8,45,-77.2Z"
          transform="translate(100 100)"
          filter="blur(12px)"
        />
      </svg>
    </div>
  );
}

export function RoseVine({
  className,
  variant = "corner-top-right",
  color = "sage",
  opacity = 0.55,
  size = "md",
}: FloralDecorationProps) {
  const { w, h } = sizeMap[size];
  const rotations = {
    "corner-top-right": "rotate-0",
    "corner-bottom-left": "rotate-180",
    "corner-top-left": "-scale-x-100",
    "corner-bottom-right": "rotate-180 -scale-x-100",
    "side-left": "rotate-90",
    "side-right": "-rotate-90",
  };

  return (
    <div
      className={cn("pointer-events-none", w, h, rotations[variant], className)}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`vine-${color}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colorMap[color]} />
            <stop offset="100%" stopColor={deepColorMap[color]} />
          </linearGradient>
        </defs>
        <path
          d="M20,180 C60,140 80,120 120,100 C150,86 180,60 190,20"
          fill="none"
          stroke={`url(#vine-${color})`}
          strokeWidth="2"
          strokeOpacity={opacity}
          strokeLinecap="round"
        />
        <path
          d="M40,170 C70,150 90,130 120,120"
          fill="none"
          stroke={`url(#vine-${color})`}
          strokeWidth="1.2"
          strokeOpacity={opacity * 0.7}
          strokeLinecap="round"
        />
        <circle cx="120" cy="100" r="10" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity} />
        <circle cx="118" cy="98" r="6" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity * 0.6} />
        <circle cx="190" cy="20" r="14" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity} />
        <circle cx="186" cy="16" r="8" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity * 0.6} />
        <ellipse cx="90" cy="125" rx="8" ry="4" fill="var(--ds-decor-leaf)" fillOpacity={opacity * 0.8} transform="rotate(-30 90 125)" />
        <ellipse cx="155" cy="65" rx="9" ry="5" fill="var(--ds-decor-leaf)" fillOpacity={opacity * 0.8} transform="rotate(20 155 65)" />
        <ellipse cx="60" cy="150" rx="7" ry="4" fill="var(--ds-decor-leaf)" fillOpacity={opacity * 0.7} transform="rotate(-45 60 150)" />
        <circle cx="80" cy="110" r="2" fill={colorMap[color]} fillOpacity={opacity} />
        <circle cx="140" cy="80" r="2" fill={colorMap[color]} fillOpacity={opacity} />
      </svg>
    </div>
  );
}

/**
 * Dense, upright rose cluster for framing the sides of a page.
 * Looks like a small watercolor bouquet climbing from the bottom edge.
 */
export function RoseCluster({
  className,
  variant = "side-right",
  color = "rose",
  opacity = 0.9,
  size = "lg",
}: FloralDecorationProps) {
  const { w, h } = sizeMap[size];
  const flip = variant === "side-left" || variant === "corner-bottom-left";
  const baseColor = colorMap[color];
  const deepColor = deepColorMap[color];
  const leafColor = "var(--ds-decor-leaf)";

  const roseGradientId = `roseGradient-${color}-${flip ? "flip" : "noflip"}`;

  return (
    <div
      className={cn("pointer-events-none", w, h, className)}
      aria-hidden
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <svg viewBox="0 0 220 320" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={roseGradientId} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="60%" stopColor={deepColor} />
            <stop offset="100%" stopColor={deepColor} stopOpacity={0.85} />
          </radialGradient>
        </defs>

        {/* Main vine curve */}
        <path
          d="M130,320 C110,260 170,230 140,170 C110,110 50,120 70,60"
          fill="none"
          stroke={leafColor}
          strokeWidth="2.5"
          strokeOpacity={opacity * 0.8}
          strokeLinecap="round"
        />
        {/* Secondary vine */}
        <path
          d="M150,320 C180,270 130,220 160,180 C190,140 230,150 210,100"
          fill="none"
          stroke={leafColor}
          strokeWidth="1.6"
          strokeOpacity={opacity * 0.55}
          strokeLinecap="round"
        />

        {/* Rose 1 (large, lower) */}
        <g transform="translate(100, 230) rotate(-10)">
          <circle r="30" fill={`url(#${roseGradientId})`} fillOpacity={opacity} />
          <path
            d="M-22,-5 C-25,-22 -5,-30 8,-22 C20,-14 22,5 10,18 C-2,26 -20,20 -24,8 C-26,-2 -24,-2 -22,-5Z"
            fill={baseColor}
            fillOpacity={opacity * 0.85}
          />
          <path
            d="M-8,-12 C-2,-22 12,-20 18,-10 C22,2 14,14 2,18 C-10,14 -16,2 -12,-8 C-10,-12 -10,-12 -8,-12Z"
            fill={deepColor}
            fillOpacity={opacity * 0.75}
          />
          <path
            d="M-2,-2 C6,-8 16,-4 14,6 C12,14 0,16 -6,10 C-12,4 -8,-4 -2,-2Z"
            fill={baseColor}
            fillOpacity={opacity * 0.9}
          />
        </g>

        {/* Rose 2 (mid) */}
        <g transform="translate(145, 145) rotate(20)">
          <circle r="24" fill={`url(#${roseGradientId})`} fillOpacity={opacity} />
          <path
            d="M-18,-4 C-20,-18 -4,-24 8,-18 C18,-12 20,4 10,14 C0,22 -16,16 -18,4 C-20,-4 -18,-4 -18,-4Z"
            fill={baseColor}
            fillOpacity={opacity * 0.85}
          />
          <path
            d="M-6,-10 C0,-18 14,-16 18,-8 C20,2 12,12 0,14 C-12,10 -16,-2 -10,-10 C-8,-12 -8,-12 -6,-10Z"
            fill={deepColor}
            fillOpacity={opacity * 0.75}
          />
          <path
            d="M0,0 C8,-6 16,-2 12,8 C10,14 -2,12 -6,6 C-10,0 -6,-4 0,0Z"
            fill={baseColor}
            fillOpacity={opacity * 0.9}
          />
        </g>

        {/* Rose 3 (top) */}
        <g transform="translate(65, 60) rotate(-15)">
          <circle r="18" fill={`url(#${roseGradientId})`} fillOpacity={opacity} />
          <path
            d="M-14,-3 C-16,-14 -2,-20 8,-14 C16,-10 18,4 8,12 C-2,18 -16,12 -14,2 C-16,-4 -14,-4 -14,-3Z"
            fill={baseColor}
            fillOpacity={opacity * 0.85}
          />
          <path
            d="M-4,-8 C0,-14 12,-12 14,-6 C16,2 8,10 -2,10 C-10,6 -12,-2 -6,-8 C-4,-10 -4,-10 -4,-8Z"
            fill={deepColor}
            fillOpacity={opacity * 0.75}
          />
        </g>

        {/* Rose 4 (secondary vine, upper right) */}
        <g transform="translate(195, 100) rotate(15)">
          <circle r="16" fill={`url(#${roseGradientId})`} fillOpacity={opacity * 0.9} />
          <path
            d="M-12,-2 C-14,-12 -2,-18 8,-12 C14,-8 16,4 8,10 C-2,16 -14,10 -12,0 C-14,-4 -12,-4 -12,-2Z"
            fill={baseColor}
            fillOpacity={opacity * 0.8}
          />
          <path
            d="M-4,-6 C0,-12 10,-10 12,-4 C14,4 6,10 -4,8 C-10,4 -10,-2 -6,-6 C-4,-8 -4,-8 -4,-6Z"
            fill={deepColor}
            fillOpacity={opacity * 0.7}
          />
        </g>

        {/* Leaves */}
        <ellipse cx="120" cy="190" rx="16" ry="8" fill={leafColor} fillOpacity={opacity * 0.75} transform="rotate(-30 120 190)" />
        <ellipse cx="170" cy="115" rx="14" ry="7" fill={leafColor} fillOpacity={opacity * 0.75} transform="rotate(20 170 115)" />
        <ellipse cx="80" cy="135" rx="13" ry="6" fill={leafColor} fillOpacity={opacity * 0.65} transform="rotate(-40 80 135)" />
        <ellipse cx="55" cy="90" rx="11" ry="6" fill={leafColor} fillOpacity={opacity * 0.65} transform="rotate(-10 55 90)" />
        <ellipse cx="155" cy="260" rx="14" ry="7" fill={leafColor} fillOpacity={opacity * 0.7} transform="rotate(30 155 260)" />
        <ellipse cx="100" cy="285" rx="12" ry="6" fill={leafColor} fillOpacity={opacity * 0.6} transform="rotate(-20 100 285)" />

        {/* Small buds */}
        <g transform="translate(175, 210)">
          <circle r="6" fill={deepColor} fillOpacity={opacity * 0.8} />
          <ellipse cx="-4" cy="0" rx="6" ry="3" fill={leafColor} fillOpacity={opacity * 0.7} transform="rotate(-35 -4 0)" />
        </g>
        <g transform="translate(85, 170)">
          <circle r="5" fill={deepColor} fillOpacity={opacity * 0.8} />
          <ellipse cx="-3" cy="1" rx="5" ry="3" fill={leafColor} fillOpacity={opacity * 0.7} transform="rotate(-20 -3 1)" />
        </g>
        <g transform="translate(125, 90)">
          <circle r="5" fill={deepColor} fillOpacity={opacity * 0.8} />
          <ellipse cx="-3" cy="0" rx="5" ry="3" fill={leafColor} fillOpacity={opacity * 0.7} transform="rotate(-45 -3 0)" />
        </g>

        {/* Soft watercolor backing */}
        <circle cx="130" cy="200" r="80" fill={baseColor} fillOpacity={0.14} filter="blur(18px)" />
        <circle cx="190" cy="130" r="55" fill={baseColor} fillOpacity={0.1} filter="blur(16px)" />
        <circle cx="70" cy="80" r="40" fill={baseColor} fillOpacity={0.08} filter="blur(14px)" />
      </svg>
    </div>
  );
}

export function SparkleField({ className, count = 12 }: { className?: string; count?: number }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/40 sparkle-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

export function FloralDivider({ className, color = "terracotta" }: { className?: string; color?: "terracotta" | "rose" | "gold" | "sage" }) {
  const colorValue = {
    terracotta: "var(--ds-terracotta)",
    rose: "var(--ds-decor)",
    gold: "var(--ds-decor-gold)",
    sage: "var(--ds-decor-leaf)",
  }[color];

  return (
    <div className={cn("flex items-center justify-center gap-3 py-4", className)} aria-hidden>
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-current/30" style={{ color: colorValue }} />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colorValue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c0-8-4-10-4-14s4-5 4-5 4 1 4 5-4 6-4 14" />
        <path d="M12 21c-5-2-6-6-6-10" />
        <path d="M12 21c5-2 6-6 6-10" />
      </svg>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-current/30" style={{ color: colorValue }} />
    </div>
  );
}

export function FloatingPetals({ className, count = 8 }: { className?: string; count?: number }) {
  // Deterministic pseudo-random so SSR and client markup match (no hydration mismatch).
  const rand = (i: number, salt: number) => {
    const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="absolute petal-float"
          width={12 + rand(i, 1) * 16}
          height={12 + rand(i, 2) * 16}
          viewBox="0 0 24 24"
          fill={colorMap["rose"]}
          fillOpacity={0.35}
          style={{
            left: `${rand(i, 3) * 100}%`,
            top: `${rand(i, 4) * 100}%`,
            animationDelay: `${rand(i, 5) * 6}s`,
            animationDuration: `${6 + rand(i, 6) * 6}s`,
          }}
        >
          <path d="M12 21C7 16 7 10 12 3C17 10 17 16 12 21Z" />
        </svg>
      ))}
    </div>
  );
}
