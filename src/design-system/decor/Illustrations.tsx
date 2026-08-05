import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { DecorColor, DecorMotif, DecorPlacement } from "@/theme/types";

/**
 * Illustration library — the single source of hand-painted artwork.
 *
 * Style guide (all motifs must follow it):
 *  - watercolour, soft blurred edges, layered translucent washes
 *  - muted palette taken *only* from theme tokens (--ds-decor*)
 *  - no flat icons, no outlines-only clipart, no cartoon shapes
 *  - every asset is inline SVG (no network cost) and aria-hidden
 */

const COLOR_VAR: Record<DecorColor, string> = {
  decor: "var(--ds-decor)",
  "decor-soft": "var(--ds-decor-soft)",
  "decor-leaf": "var(--ds-decor-leaf)",
  "decor-gold": "var(--ds-decor-gold)",
};

export type DecorSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE: Record<DecorSize, string> = {
  xs: "w-20 h-20",
  sm: "w-32 h-32",
  md: "w-48 h-48",
  lg: "w-72 h-72",
  xl: "w-[24rem] h-[24rem]",
  "2xl": "w-[34rem] h-[34rem]",
};

const PLACEMENT_TRANSFORM: Record<DecorPlacement, string> = {
  "corner-top-left": "",
  "corner-top-right": "-scale-x-100",
  "corner-bottom-left": "-scale-y-100",
  "corner-bottom-right": "-scale-x-100 -scale-y-100",
  "side-left": "",
  "side-right": "-scale-x-100",
};

export interface DecorProps {
  motif?: DecorMotif;
  color?: DecorColor;
  size?: DecorSize;
  placement?: DecorPlacement;
  /** 0–1, multiplied into every wash. Keep low for readability. */
  intensity?: number;
  className?: string;
  style?: CSSProperties;
}

function Svg({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("pointer-events-none select-none", className)} style={style} aria-hidden>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Primitive washes                                                    */
/* ------------------------------------------------------------------ */

/** Soft watercolour bleed — the base of every painted motif. */
export function WatercolorWash({
  color = "decor-soft",
  size = "lg",
  intensity = 0.4,
  className,
  style,
}: Omit<DecorProps, "motif" | "placement">) {
  const fill = COLOR_VAR[color];
  return (
    <Svg className={cn(SIZE[size], className)} style={style}>
      <g style={{ filter: "blur(16px)" }}>
        <path
          fill={fill}
          fillOpacity={intensity}
          d="M148,45c14,14,22,34,21,53c-1,19-11,37-25,50c-15,13-34,21-53,20c-19-1-38-11-51-26C27,127,20,108,22,89c2-19,13-37,28-49c15-12,34-19,52-17C120,25,134,31,148,45Z"
        />
        <path
          fill={fill}
          fillOpacity={intensity * 0.7}
          d="M120,35c18,6,33,22,40,40c7,18,6,39-3,56c-9,17-25,30-44,33c-19,3-40-4-54-18C45,132,37,111,40,92c3-19,17-37,34-46C90,37,102,29,120,35Z"
        />
      </g>
    </Svg>
  );
}

/** Layered watercolour rose — the signature motif. */
function RosePaint({ fill, soft, intensity }: { fill: string; soft: string; intensity: number }) {
  return (
    <g>
      <circle cx="100" cy="100" r="62" fill={soft} fillOpacity={intensity * 0.45} style={{ filter: "blur(14px)" }} />
      <path
        d="M100,42c26,0,48,20,50,45c2,26-17,50-43,54c-27,4-53-13-58-39C44,74,68,45,100,42Z"
        fill={fill}
        fillOpacity={intensity * 0.55}
        style={{ filter: "blur(3px)" }}
      />
      <path
        d="M100,58c19,0,35,14,37,32c2,19-12,36-31,39c-19,3-38-10-41-28C62,80,80,58,100,58Z"
        fill={fill}
        fillOpacity={intensity * 0.62}
      />
      <path
        d="M100,72c12,1,22,10,23,21c1,12-8,22-20,24c-12,1-23-7-25-18C76,86,87,72,100,72Z"
        fill={fill}
        fillOpacity={intensity * 0.78}
      />
      <path
        d="M100,84c7,0,13,6,13,13c0,7-6,13-13,13c-7,0-13-6-13-13C87,90,93,84,100,84Z"
        fill={fill}
        fillOpacity={intensity * 0.95}
      />
      <path
        d="M84,96c6-9,18-14,29-11"
        fill="none"
        stroke={fill}
        strokeOpacity={intensity * 0.55}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  );
}

function LeafPaint({
  fill,
  intensity,
  x,
  y,
  rotate,
  scale = 1,
}: {
  fill: string;
  intensity: number;
  x: number;
  y: number;
  rotate: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0,0C16,-6,34,-2,44,10C32,22,12,24,0,14C-4,10,-4,4,0,0Z"
        fill={fill}
        fillOpacity={intensity * 0.6}
        style={{ filter: "blur(1.5px)" }}
      />
      <path d="M2,7C14,5,28,7,40,11" fill="none" stroke={fill} strokeOpacity={intensity * 0.5} strokeWidth="1" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Motifs                                                              */
/* ------------------------------------------------------------------ */

export function DecorMotifArt({
  motif = "rose",
  color = "decor",
  size = "md",
  placement = "corner-top-left",
  intensity = 0.75,
  className,
  style,
}: DecorProps) {
  const fill = COLOR_VAR[color];
  const leaf = COLOR_VAR["decor-leaf"];
  const soft = COLOR_VAR["decor-soft"];
  const gold = COLOR_VAR["decor-gold"];

  const body = (() => {
    switch (motif) {
      case "rose":
      case "peony":
        return (
          <>
            <RosePaint fill={fill} soft={soft} intensity={intensity} />
            <LeafPaint fill={leaf} intensity={intensity} x={132} y={128} rotate={25} />
            <LeafPaint fill={leaf} intensity={intensity} x={46} y={132} rotate={155} scale={0.8} />
          </>
        );
      case "leaf":
        return (
          <>
            <path
              d="M40,160C60,110,100,70,160,44C150,104,116,150,60,168C50,170,42,166,40,160Z"
              fill={leaf}
              fillOpacity={intensity * 0.55}
              style={{ filter: "blur(2px)" }}
            />
            <path d="M52,160C80,124,116,90,158,48" fill="none" stroke={leaf} strokeOpacity={intensity * 0.6} strokeWidth="1.4" />
          </>
        );
      case "olive-branch":
        return (
          <>
            <path
              d="M16,182C58,150,96,112,178,26"
              fill="none"
              stroke={leaf}
              strokeOpacity={intensity * 0.7}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {[
              [46, 152, -30],
              [72, 128, -20],
              [100, 100, -25],
              [128, 74, -18],
              [152, 50, -28],
            ].map(([x, y, r], i) => (
              <LeafPaint key={i} fill={leaf} intensity={intensity} x={x} y={y} rotate={r} scale={0.7} />
            ))}
            <circle cx="88" cy="118" r="5" fill={fill} fillOpacity={intensity * 0.6} />
            <circle cx="140" cy="66" r="4" fill={fill} fillOpacity={intensity * 0.5} />
          </>
        );
      case "eucalyptus":
        return (
          <>
            <path
              d="M24,178C70,150,110,110,172,34"
              fill="none"
              stroke={leaf}
              strokeOpacity={intensity * 0.6}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const t = i / 5;
              const x = 24 + t * 148;
              const y = 178 - t * 144;
              return (
                <g key={i}>
                  <ellipse
                    cx={x + 14}
                    cy={y - 6}
                    rx="15"
                    ry="12"
                    fill={leaf}
                    fillOpacity={intensity * 0.45}
                    style={{ filter: "blur(2px)" }}
                  />
                  <ellipse cx={x - 12} cy={y + 8} rx="13" ry="10" fill={leaf} fillOpacity={intensity * 0.36} />
                </g>
              );
            })}
          </>
        );
      case "vine":
        return (
          <>
            <path
              d="M18,186C56,152,64,116,96,92C126,70,158,52,186,16"
              fill="none"
              stroke={leaf}
              strokeOpacity={intensity * 0.65}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M40,170C66,158,84,140,98,118"
              fill="none"
              stroke={leaf}
              strokeOpacity={intensity * 0.4}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <g transform="translate(58 46) scale(0.42)">
              <RosePaint fill={fill} soft={soft} intensity={intensity} />
            </g>
            <g transform="translate(-6 68) scale(0.3)">
              <RosePaint fill={fill} soft={soft} intensity={intensity * 0.85} />
            </g>
            <LeafPaint fill={leaf} intensity={intensity} x={70} y={140} rotate={-40} scale={0.7} />
            <LeafPaint fill={leaf} intensity={intensity} x={122} y={92} rotate={-25} scale={0.6} />
          </>
        );
      case "gold-leaf":
        return (
          <>
            <path
              d="M30,170C74,142,112,104,172,40"
              fill="none"
              stroke={gold}
              strokeOpacity={intensity * 0.8}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {[
              [60, 146, -30],
              [98, 112, -24],
              [138, 74, -20],
            ].map(([x, y, r], i) => (
              <LeafPaint key={i} fill={gold} intensity={intensity} x={x} y={y} rotate={r} scale={0.6} />
            ))}
          </>
        );
      case "flourish":
      default:
        return (
          <>
            <path
              d="M20,100C50,70,74,132,100,100C126,68,150,130,180,100"
              fill="none"
              stroke={gold}
              strokeOpacity={intensity * 0.85}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="4.5" fill={fill} fillOpacity={intensity * 0.85} />
            <circle cx="70" cy="100" r="2" fill={gold} fillOpacity={intensity * 0.7} />
            <circle cx="130" cy="100" r="2" fill={gold} fillOpacity={intensity * 0.7} />
          </>
        );
    }
  })();

  return (
    <Svg className={cn(SIZE[size], PLACEMENT_TRANSFORM[placement], className)} style={style}>
      {body}
    </Svg>
  );
}

/**
 * A tall painted composition used to fill the sides of the viewport so the
 * margins become storytelling space instead of empty whitespace.
 *
 * Enhanced with 6+ layers of botanical depth, accent elements, and motion
 * to create a premium, magical, handcrafted feeling.
 */
export function DecorSideComposition({
  placement = "side-left",
  color = "decor",
  motifs = ["rose", "vine", "eucalyptus"],
  intensity = 0.7,
  className,
}: {
  placement?: Extract<DecorPlacement, "side-left" | "side-right">;
  color?: DecorColor;
  motifs?: DecorMotif[];
  intensity?: number;
  className?: string;
}) {
  const flip = placement === "side-right";
  const gold = COLOR_VAR["decor-gold"];

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 h-full w-[22vw] max-w-[26rem] min-w-[9rem]",
        flip ? "right-0" : "left-0",
        className,
      )}
      aria-hidden
    >
      {/* Layer 1: Deep background wash — sets atmospheric depth */}
      <WatercolorWash
        color="decor-soft"
        size="2xl"
        intensity={intensity * 0.3}
        className={cn("absolute top-[10%] animate-ds-drift", flip ? "-right-32" : "-left-32")}
        style={{ animationDelay: "0s", animationDuration: "28s" }}
      />

      {/* Layer 2: Mid-tone wash — adds dimensional softness */}
      <WatercolorWash
        color="decor-leaf"
        size="xl"
        intensity={intensity * 0.35}
        className={cn("absolute top-[30%] animate-ds-drift", flip ? "-right-24" : "-left-24")}
        style={{ animationDelay: "2s", animationDuration: "32s" }}
      />

      {/* Layer 3: Bottom accent wash — grounds the composition */}
      <WatercolorWash
        color="decor"
        size="lg"
        intensity={intensity * 0.25}
        className={cn("absolute bottom-[5%] animate-ds-drift", flip ? "-right-16" : "-left-16")}
        style={{ animationDelay: "4s", animationDuration: "36s" }}
      />

      {/* Layer 4: Large primary motif — top anchor */}
      <DecorMotifArt
        motif={motifs[0] ?? "rose"}
        color={color}
        size="xl"
        intensity={intensity * 1.0}
        placement={flip ? "corner-top-right" : "corner-top-left"}
        className={cn("absolute top-[2%] animate-ds-float", flip ? "-right-8" : "-left-8")}
        style={{ animationDelay: "0.5s", animationDuration: "18s" }}
      />

      {/* Layer 5: Secondary motif — mid composition (largest for density) */}
      <DecorMotifArt
        motif={motifs[1] ?? "vine"}
        color={color}
        size="2xl"
        intensity={intensity * 0.95}
        placement={flip ? "corner-bottom-right" : "corner-bottom-left"}
        className={cn("absolute top-[28%] animate-ds-float", flip ? "-right-2" : "-left-2")}
        style={{ animationDelay: "1.2s", animationDuration: "22s" }}
      />

      {/* Layer 6: Tertiary motif — bottom anchor */}
      <DecorMotifArt
        motif={motifs[2] ?? "eucalyptus"}
        color="decor-leaf"
        size="lg"
        intensity={intensity * 0.88}
        placement={flip ? "corner-bottom-right" : "corner-bottom-left"}
        className={cn("absolute bottom-[3%] animate-ds-float", flip ? "-right-6" : "-left-6")}
        style={{ animationDelay: "2.8s", animationDuration: "24s" }}
      />

      {/* Layer 7: Additional detail motif — fills gaps, creates richness */}
      <DecorMotifArt
        motif="gold-leaf"
        color="decor-gold"
        size="md"
        intensity={intensity * 0.75}
        placement={flip ? "corner-top-right" : "corner-top-left"}
        className={cn("absolute top-[45%] animate-ds-float", flip ? "right-2" : "left-2")}
        style={{ animationDelay: "3.5s", animationDuration: "26s" }}
      />

      {/* Layer 8: Accent flourishes — delicate, luxury touch */}
      <svg
        viewBox="0 0 100 300"
        className={cn(
          "pointer-events-none absolute top-[15%] h-[70vh] w-[8vw]",
          flip ? "right-0" : "left-0",
          "opacity-60 animate-ds-float"
        )}
        style={{ animationDelay: "1s", animationDuration: "20s" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Delicate connecting lines between florals */}
        <path
          d="M 50 20 Q 40 80 50 140 Q 60 180 50 260"
          stroke={gold}
          strokeWidth="0.8"
          fill="none"
          opacity={intensity * 0.4}
          strokeLinecap="round"
        />
        {/* Tiny accent dots */}
        <circle cx="50" cy="50" r="1.5" fill={gold} opacity={intensity * 0.6} />
        <circle cx="35" cy="100" r="1" fill={gold} opacity={intensity * 0.5} />
        <circle cx="65" cy="160" r="1.2" fill={gold} opacity={intensity * 0.55} />
        <circle cx="50" cy="220" r="1" fill={gold} opacity={intensity * 0.5} />
      </svg>

      {/* Layer 9: Additional floating wash — creates misty edges */}
      <WatercolorWash
        color="decor-soft"
        size="lg"
        intensity={intensity * 0.2}
        className={cn("absolute top-[60%]", flip ? "-right-20" : "-left-20", "animate-ds-drift")}
        style={{ animationDelay: "6s", animationDuration: "40s" }}
      />
    </div>
  );
}

/** Corner ornament, for framing cards, sections and paper surfaces. */
export function DecorCorner({
  placement = "corner-top-left",
  motif = "rose",
  color = "decor",
  size = "sm",
  intensity = 0.55,
  className,
}: DecorProps) {
  const pos: Record<string, string> = {
    "corner-top-left": "top-0 left-0 -translate-x-1/4 -translate-y-1/4",
    "corner-top-right": "top-0 right-0 translate-x-1/4 -translate-y-1/4",
    "corner-bottom-left": "bottom-0 left-0 -translate-x-1/4 translate-y-1/4",
    "corner-bottom-right": "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
    "side-left": "top-1/2 left-0 -translate-y-1/2 -translate-x-1/3",
    "side-right": "top-1/2 right-0 -translate-y-1/2 translate-x-1/3",
  };
  return (
    <DecorMotifArt
      motif={motif}
      color={color}
      size={size}
      intensity={intensity}
      placement={placement}
      className={cn("absolute", pos[placement], className)}
    />
  );
}

/** Ambient particles: petals, sparkles or drifting leaves. */
export function DecorParticles({
  kind = "petals",
  count = 14,
  className,
}: {
  kind?: "petals" | "sparkles" | "leaves" | "none";
  count?: number;
  className?: string;
}) {
  if (kind === "none" || count <= 0) return null;
  const items = Array.from({ length: count }, (_, i) => {
    const seed = (i * 37) % 100;
    return {
      left: `${(seed * 1.01) % 100}%`,
      delay: `${(i * 1.7) % 14}s`,
      duration: `${16 + ((i * 5) % 14)}s`,
      scale: 0.5 + ((i % 5) * 0.16),
      driftX: `${((i % 2 === 0 ? 1 : -1) * (20 + (i % 6) * 14)).toString()}px`,
    };
  });

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className={cn("absolute top-0 block", kind === "sparkles" ? "animate-ds-shimmer" : "animate-ds-drift")}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `scale(${p.scale})`,
            ["--ds-drift-x" as string]: p.driftX,
          }}
        >
          {kind === "sparkles" ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M5,0L6,4L10,5L6,6L5,10L4,6L0,5L4,4Z" fill="var(--ds-decor-gold)" fillOpacity="0.75" />
            </svg>
          ) : kind === "leaves" ? (
            <svg width="16" height="12" viewBox="0 0 16 12">
              <path d="M0,6C5,0,12,-1,16,3C11,9,4,11,0,6Z" fill="var(--ds-decor-leaf)" fillOpacity="0.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M7,0C11,2,14,6,12,10C10,14,4,14,2,10C0,6,3,2,7,0Z"
                fill="var(--ds-decor)"
                fillOpacity="0.45"
              />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
