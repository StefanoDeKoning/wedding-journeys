import { cn } from "@/lib/utils";

interface FloralDecorationProps {
  className?: string;
  variant?: "corner-top-right" | "corner-bottom-left" | "side-left" | "side-right" | "corner-top-left" | "corner-bottom-right";
  color?: "rose" | "sage" | "gold" | "peach";
  opacity?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: { w: "w-32", h: "h-32" },
  md: { w: "w-48", h: "h-48" },
  lg: { w: "w-64", h: "h-64" },
  xl: { w: "w-80", h: "h-80" },
};

const colorMap = {
  rose: "#eeb7b7",
  sage: "#d1e2d3",
  gold: "#e8d5a8",
  peach: "#f4c6a8",
};

export function WatercolorBlot({
  className,
  color = "rose",
  opacity = 0.35,
  size = "lg",
}: Omit<FloralDecorationProps, "variant">) {
  const { w, h } = sizeMap[size];
  return (
    <div className={cn("pointer-events-none", w, h, className)} aria-hidden>
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
            <stop offset="0%" stopColor={color === "sage" ? "#a8bba9" : color === "rose" ? "#d9a3a8" : "#d4b483"} />
            <stop offset="100%" stopColor={color === "sage" ? "#8fa392" : color === "rose" ? "#c58a91" : "#bfa06b"} />
          </linearGradient>
        </defs>
        {/* Curved vine path */}
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
        {/* Rose buds */}
        <circle cx="120" cy="100" r="10" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity} />
        <circle cx="118" cy="98" r="6" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity * 0.6} />
        <circle cx="190" cy="20" r="14" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity} />
        <circle cx="186" cy="16" r="8" fill={colorMap[color === "sage" ? "rose" : color]} fillOpacity={opacity * 0.6} />
        {/* Leaves */}
        <ellipse cx="90" cy="125" rx="8" ry="4" fill="#a8bba9" fillOpacity={opacity * 0.8} transform="rotate(-30 90 125)" />
        <ellipse cx="155" cy="65" rx="9" ry="5" fill="#a8bba9" fillOpacity={opacity * 0.8} transform="rotate(20 155 65)" />
        <ellipse cx="60" cy="150" rx="7" ry="4" fill="#a8bba9" fillOpacity={opacity * 0.7} transform="rotate(-45 60 150)" />
        {/* Small accent dots */}
        <circle cx="80" cy="110" r="2" fill={colorMap[color]} fillOpacity={opacity} />
        <circle cx="140" cy="80" r="2" fill={colorMap[color]} fillOpacity={opacity} />
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
    terracotta: "#c97a5a",
    rose: "#c78c8c",
    gold: "#d4b483",
    sage: "#9a7b4f",
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
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="absolute petal-float"
          width={12 + Math.random() * 16}
          height={12 + Math.random() * 16}
          viewBox="0 0 24 24"
          fill={colorMap["rose"]}
          fillOpacity={0.35}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
          }}
        >
          <path d="M12 21C7 16 7 10 12 3C17 10 17 16 12 21Z" />
        </svg>
      ))}
    </div>
  );
}
