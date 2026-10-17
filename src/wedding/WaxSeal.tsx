import { useEffect, useId, useMemo, useState, type ReactNode } from "react";

/** "Billy & Sophie" → "B & S" for the wax crest. */
export function initialsFromCouple(signature: string | null | undefined): string {
  if (!signature) return "&";
  const parts = signature
    // Whole words only: a bare /and/ would also cut "Sander", "Andrea" or "Brandon" in half.
    .split(/\s*(?:&|\+|\band\b|\ben\b)\s*/i)
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2);
  return parts.length ? parts.join(" & ") : "&";
}

export type WaxSealMotif = "rose" | "initials" | "monogram" | "custom";

interface WaxSealProps {
  size?: number;
  /** Which crest is pressed into the wax. Defaults to the initials. */
  motif?: WaxSealMotif;
  /** Used when motif="initials" or "monogram" — e.g. "S & J". */
  initials?: string;
  /** Used when motif="custom" — any inline SVG content, centered at (100,100).
   *  Draw it with fill="var(--ds-wax-crest)": whatever you fill becomes raised
   *  relief in the wax, so shapes need a solid fill, not just a thin stroke. */
  children?: ReactNode;
  /** Strength of the relief lighting. 0.75 = default, lower = flatter, higher = deeper. */
  relief?: number;
}

/* ------------------------------------------------------------------------ *
 * How this seal is built
 *
 * The wax is not painted: it is LIT. We draw a grey-scale height map (white =
 * high, black = low) of a poured disc — rounded bead around the edge, a
 * recessed stamped field in the middle, a raised stamp ring, and the raised
 * crest — then let SVG's lighting filters (feDiffuseLighting / feSpecular-
 * Lighting) turn that into shading, bevels and glossy highlights. That is what
 * makes the crest look pressed into real wax instead of a gradient with a drop
 * shadow.
 * ------------------------------------------------------------------------ */

/** Height (0–1) of the raised crest in the height map, as a grey. */
const CREST = "#ebebeb";
const grey = (h: number) => {
  const v = Math.round(h * 255);
  return `rgb(${v},${v},${v})`;
};

/* ---- Organic outlines --------------------------------------------------- */

type Harmonic = readonly [frequency: number, amplitude: number, phase: number];
type Flare = readonly [centreDeg: number, width: number, bump: number];

const HARMONICS: Harmonic[] = [
  [3, 2.2, 0.7],
  [5, 1.5, 2.1],
  [7, 0.9, 4.0],
  [11, 0.5, 1.3],
];
/** Little squeezed-out lobes where the wax ran over the stamp. */
const FLARES: Flare[] = [
  [200, 0.32, 6.5],
  [318, 0.28, 4.2],
  [84, 0.22, 3.0],
];
const FIELD_HARMONICS: Harmonic[] = [
  [2, 1.1, 0.4],
  [4, 0.8, 2.0],
  [6, 0.5, 1.0],
];

function organicPoints(
  r: number,
  harmonics: Harmonic[],
  flares: Flare[],
  flareScale: number,
  n = 72,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let rad = r;
    for (const [f, amp, ph] of harmonics) rad += amp * (r / 91) * Math.sin(f * a + ph);
    for (const [deg, w, bump] of flares) {
      let d = a - (deg * Math.PI) / 180;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      rad += bump * flareScale * Math.exp(-((d / w) ** 2));
    }
    pts.push([100 + rad * Math.cos(a), 100 + rad * Math.sin(a)]);
  }
  return pts;
}

/** Closed Catmull-Rom spline → cubic Bézier path. */
function smoothClosedPath(pts: [number, number][]): string {
  const n = pts.length;
  const f = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  let d = `M${f(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1)} ${f(c2)} ${f(p2)}`;
  }
  return `${d}Z`;
}

/** Stacked from the thin outer flange up to the top of the bead: [radius, height, flareScale]. */
const WAX_LAYERS = (
  [
    [91, 0.22, 1.0],
    [88.5, 0.36, 0.9],
    [85.5, 0.48, 0.7],
    [81.5, 0.57, 0.45],
    [76, 0.63, 0.2],
  ] as const
).map(([r, h, flareScale]) => ({ h, d: smoothClosedPath(organicPoints(r, HARMONICS, FLARES, flareScale)) }));

/** The recessed disc the stamp pressed flat. */
const WAX_FIELD = { h: 0.34, d: smoothClosedPath(organicPoints(64, FIELD_HARMONICS, [], 0)) };
/** The raised border ring of the stamp. */
const WAX_RING = { h: 0.66, w: 3, d: smoothClosedPath(organicPoints(57, FIELD_HARMONICS, [], 0)) };

/* ---- Crest text that always fits ---------------------------------------- */

interface Part {
  text: string;
  size: number;
  /** Baseline shift in crest units (negative = up). */
  dy?: number;
}
interface Placed {
  text: string;
  size: number;
  x: number;
  y: number;
}
interface Layout {
  placed: Placed[];
  box: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Lays the parts out left to right on one baseline, spaced by their real INK
 * edges (not font advance widths), and returns the ink box. Script fonts have
 * swashes that stick out past their advance width, so this is what makes the
 * initials sit centred inside the seal whichever font the theme uses.
 */
function layoutParts(parts: Part[], family: string, gap: number): Layout | null {
  if (typeof document === "undefined") return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  const placed: Placed[] = [];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  let inkRight = 0;
  parts.forEach((part, i) => {
    ctx.font = `${part.size}px ${family}`;
    const m = ctx.measureText(part.text);
    const inkL = -m.actualBoundingBoxLeft;
    const inkR = m.actualBoundingBoxRight;
    const x = i === 0 ? -inkL : inkRight + gap - inkL;
    const dy = part.dy ?? 0;
    inkRight = x + inkR;
    placed.push({ text: part.text, size: part.size, x, y: dy });
    x0 = Math.min(x0, x + inkL);
    x1 = Math.max(x1, x + inkR);
    y0 = Math.min(y0, dy - m.actualBoundingBoxAscent);
    y1 = Math.max(y1, dy + m.actualBoundingBoxDescent);
  });
  if (!Number.isFinite(x0) || x1 - x0 <= 0 || y1 - y0 <= 0) return null;
  return { placed, box: { x0, y0, x1, y1 } };
}

/** Bumps when web fonts finish loading, so the crest is measured again with the real font. */
function useFontsVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => alive && setVersion((v) => v + 1);
    document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener?.("loadingdone", bump);
    };
  }, []);
  return version;
}

function readFontFamily(cssVar: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value || fallback;
}

interface FittedCrestProps {
  parts: Part[];
  /** CSS custom property that holds the font stack, e.g. "--ds-font-script". */
  fontVar: string;
  fontFallback: string;
  fallbackText: string;
  gap: number;
  /** The crest is scaled to fit inside this box (it stays inside the stamp ring). */
  maxW: number;
  maxH: number;
  maxScale: number;
  stroke: number;
  /** Small rule beneath the text (monogram). */
  rule?: boolean;
}

function FittedCrest({
  parts,
  fontVar,
  fontFallback,
  fallbackText,
  gap,
  maxW,
  maxH,
  maxScale,
  stroke,
  rule = false,
}: FittedCrestProps) {
  const fontsVersion = useFontsVersion();
  const partsKey = JSON.stringify(parts);
  const layout = useMemo(
    () => layoutParts(parts, readFontFamily(fontVar, fontFallback), gap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partsKey, fontVar, fontFallback, gap, fontsVersion],
  );
  const textStyle = { fontFamily: `var(${fontVar})` };

  if (!layout) {
    return (
      <text x={100} y={116} textAnchor="middle" fontSize={44} fill={CREST} style={textStyle}>
        {fallbackText}
      </text>
    );
  }

  const { placed, box } = layout;
  const ruleY = box.y1 + 9;
  const ruleW = Math.min(56, (box.x1 - box.x0) * 0.8);
  const y1 = rule ? ruleY + 1.2 : box.y1;
  const w = box.x1 - box.x0;
  const h = y1 - box.y0;
  const s = Math.min(maxW / w, maxH / h, maxScale);
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + y1) / 2;

  return (
    <g
      transform={`translate(100 100) scale(${s}) translate(${-cx} ${-cy})`}
      fill={CREST}
      stroke={CREST}
      strokeWidth={stroke / s}
      strokeLinejoin="round"
    >
      {placed.map((p, i) => (
        <text key={i} x={p.x} y={p.y} fontSize={p.size} style={textStyle}>
          {p.text}
        </text>
      ))}
      {rule && <rect x={cx - ruleW / 2} y={ruleY - 1} width={ruleW} height={2} stroke="none" />}
    </g>
  );
}

/* ---- Crests ------------------------------------------------------------- */

/** Rose in bloom — three rings of petals, each a step higher than the last. */
function RoseCrest() {
  const outer = [0, 72, 144, 216, 288];
  const petal = "M0,-8 C14,-18 22,-5 15,10 C10,21 -3,25 -10,15 C-18,5 -13,-10 0,-8 Z";
  const line = { stroke: grey(0.5), strokeWidth: 1.1, strokeLinejoin: "round" as const };
  return (
    <g transform="translate(100 93) scale(0.95)">
      {/* stem and leaves */}
      <path d="M0,26 C0,38 0,46 0,56" fill="none" stroke={grey(0.72)} strokeWidth={2.8} strokeLinecap="round" />
      <path d="M0,40 C-9,36 -15,40 -17,49 C-8,50 -2,46 0,40 Z" fill={grey(0.74)} {...line} />
      <path d="M0,46 C9,42 15,46 17,55 C8,56 2,52 0,46 Z" fill={grey(0.74)} {...line} />
      {/* outer petals, inner petals, bud */}
      {outer.map((angle) => (
        <path key={angle} transform={`rotate(${angle})`} d={petal} fill={grey(0.72)} {...line} />
      ))}
      {outer.map((angle) => (
        <path key={`i${angle}`} transform={`rotate(${angle + 36}) scale(0.6)`} d={petal} fill={grey(0.82)} {...line} />
      ))}
      <circle r={6} fill={grey(0.92)} {...line} />
    </g>
  );
}

/** Script initials, e.g. "S & F". The ampersand is smaller and sits slightly higher. */
function InitialsCrest({ text }: { text: string }) {
  const clean = text.trim();
  let parts: Part[];
  if (clean.includes("&")) {
    const [a = "", b = ""] = clean.split("&").map((s) => s.trim());
    parts = [];
    if (a) parts.push({ text: a, size: 64 });
    parts.push({ text: "&", size: 38, dy: -3 });
    if (b) parts.push({ text: b, size: 64 });
  } else {
    parts = [{ text: clean || "&", size: 64 }];
  }
  return (
    <FittedCrest
      parts={parts}
      fontVar="--ds-font-script"
      fontFallback="cursive"
      fallbackText={clean || "&"}
      gap={5}
      maxW={84}
      maxH={50}
      maxScale={1.3}
      stroke={2.2}
    />
  );
}

/** Framed monogram — spaced capitals with a small rule beneath. */
function MonogramCrest({ text }: { text: string }) {
  const chars = text.replace(/\s/g, "").split("");
  const parts: Part[] = (chars.length ? chars : ["&"]).map((c) => ({ text: c, size: 44 }));
  return (
    <FittedCrest
      parts={parts}
      fontVar="--ds-font-display"
      fontFallback="Georgia, serif"
      fallbackText={text || "&"}
      gap={9}
      maxW={80}
      maxH={50}
      maxScale={1.2}
      stroke={1.4}
      rule
    />
  );
}

/* ---- The seal ----------------------------------------------------------- */

const ALPHA_FROM_RED = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0";
/** Turns the blurred height into a crisp-edged mask of the wax silhouette. */
const SILHOUETTE = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 14 -1.2";

/**
 * Sealing wax: a poured disc with a rounded bead, a stamped recess, a raised
 * ring and a raised crest. Shading, bevels and gloss all come from lighting
 * filters, so the relief reads correctly at any size.
 */
export function WaxSeal({ size = 96, motif = "initials", initials = "", children, relief = 0.75 }: WaxSealProps) {
  const uid = `wax-${useId().replace(/:/g, "")}`;
  // The lighting filter works in device pixels, so smaller seals need a gentler
  // surface scale to keep the same relief as the 120px reference.
  const surfaceScale = 6.2 * (size / 120) * relief;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        overflow: "visible",
        // Wax colour before lighting; the theme's --ds-wax-primary drives it.
        ["--wx-base" as string]: "color-mix(in oklab, var(--ds-wax-primary, #9b2335) 96%, white)",
        // Existing custom crests fill with this variable; it is the raised-relief grey.
        ["--ds-wax-crest" as string]: CREST,
      }}
    >
      <defs>
        {/* Soft contact shadow + longer cast shadow */}
        <filter id={`${uid}-drop`} filterUnits="userSpaceOnUse" x={-40} y={-40} width={280} height={290} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="b1" />
          <feOffset in="b1" dy={2.5} result="o1" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={7} result="b2" />
          <feOffset in="b2" dy={9} result="o2" />
          <feFlood floodColor="#2a0a07" floodOpacity={0.5} result="c1" />
          <feComposite in="c1" in2="o1" operator="in" result="s1" />
          <feFlood floodColor="#2a0a07" floodOpacity={0.28} result="c2" />
          <feComposite in="c2" in2="o2" operator="in" result="s2" />
          <feMerge>
            <feMergeNode in="s2" />
            <feMergeNode in="s1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Height map → lit wax */}
        <filter id={`${uid}-wax`} filterUnits="userSpaceOnUse" x={-15} y={-15} width={230} height={230} colorInterpolationFilters="sRGB">
          {/* grey height map → alpha channel, then soften the edges into bevels */}
          <feColorMatrix in="SourceGraphic" type="matrix" values={ALPHA_FROM_RED} result="h0" />
          <feGaussianBlur in="h0" stdDeviation={1.6} result="hb" />
          <feColorMatrix in="hb" type="matrix" values={SILHOUETTE} result="sil" />

          {/* very slight surface unevenness: fine grain + broad undulation */}
          <feTurbulence type="fractalNoise" baseFrequency={0.35} numOctaves={1} seed={4} result="nf" />
          <feColorMatrix in="nf" type="matrix" values={ALPHA_FROM_RED} result="nfa" />
          <feTurbulence type="fractalNoise" baseFrequency={0.05} numOctaves={2} seed={9} result="nc" />
          <feColorMatrix in="nc" type="matrix" values={ALPHA_FROM_RED} result="nca" />
          <feComposite in="hb" in2="nfa" operator="arithmetic" k1={0} k2={1} k3={0.035} k4={0} result="h1" />
          <feComposite in="h1" in2="nca" operator="arithmetic" k1={0} k2={1} k3={0.1} k4={0} result="h" />

          {/* diffuse shading × wax colour (light from the upper left) */}
          <feDiffuseLighting in="h" surfaceScale={surfaceScale} diffuseConstant={1} lightingColor="#ffffff" result="dif">
            <fePointLight x={48} y={36} z={170} />
          </feDiffuseLighting>
          <feFlood style={{ floodColor: "var(--wx-base)" }} result="base" />
          <feComposite in="base" in2="dif" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="lit" />

          {/* glossy highlight on the bevels */}
          <feSpecularLighting
            in="h"
            surfaceScale={surfaceScale}
            specularConstant={0.6}
            specularExponent={45}
            lightingColor="#fff1e6"
            result="spec"
          >
            <fePointLight x={48} y={36} z={170} />
          </feSpecularLighting>
          <feComposite in="lit" in2="spec" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="shaded" />
          <feComposite in="shaded" in2="sil" operator="in" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-drop)`}>
        <g filter={`url(#${uid}-wax)`}>
          {/* height map: black = table, white = highest */}
          <rect x={-20} y={-20} width={240} height={240} fill="#000" />
          {WAX_LAYERS.map((layer, i) => (
            <path key={i} d={layer.d} fill={grey(layer.h)} />
          ))}
          <path d={WAX_FIELD.d} fill={grey(WAX_FIELD.h)} />
          <path d={WAX_RING.d} fill="none" stroke={grey(WAX_RING.h)} strokeWidth={WAX_RING.w} />

          {motif === "rose" && <RoseCrest />}
          {motif === "initials" && <InitialsCrest text={initials || "&"} />}
          {motif === "monogram" && <MonogramCrest text={initials || "&"} />}
          {motif === "custom" && children}
        </g>
      </g>
    </svg>
  );
}
