/**
 * Theme contract for the public (guest-facing + marketing) experience.
 *
 * A theme is pure configuration: CSS custom properties plus a decorative
 * recipe. Components never read theme names — they read tokens and the
 * decorative recipe, so a new theme requires *no* component changes.
 */

export type ThemeId =
  | "romantic-garden"
  // Reserved ids for future themes — add a ThemeDefinition to the registry
  // and they light up everywhere automatically.
  | "modern-minimal"
  | "bridgerton"
  | "rustic-romance"
  | "autumn-romance"
  | "winter-elegance"
  | "black-gold-luxury"
  | "bohemian";

/** Illustration motifs available in the decorative library. */
export type DecorMotif =
  | "rose"
  | "peony"
  | "leaf"
  | "olive-branch"
  | "eucalyptus"
  | "vine"
  | "flourish"
  | "gold-leaf";

export type DecorPlacement =
  | "corner-top-left"
  | "corner-top-right"
  | "corner-bottom-left"
  | "corner-bottom-right"
  | "side-left"
  | "side-right";

export type DecorColor = "decor" | "decor-soft" | "decor-leaf" | "decor-gold";

export type ParticleKind = "petals" | "sparkles" | "leaves" | "none";

export interface ThemeDecor {
  /** Motifs used for corner ornaments, in priority order. */
  corners: DecorMotif[];
  /** Motifs used for the tall side compositions that frame content. */
  sides: DecorMotif[];
  /** Motif used inside dividers / small flourishes. */
  divider: DecorMotif;
  /** Ambient particle system for the page background. */
  particles: ParticleKind;
  /** Ambient particle density (0 disables). */
  particleCount: number;
  /** Whether to render the paper texture overlay on surfaces. */
  paperTexture: boolean;
  /** Whether to render the page vignette. */
  vignette: boolean;
  /** Envelope + wax styling flavour used by the invitation experience. */
  envelope: "wax-seal" | "gold-band" | "ribbon" | "plain";
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  /**
   * CSS custom properties applied to the theme root. Keys must be `--ds-*`
   * or semantic app tokens; values are plain CSS. Anything omitted falls
   * back to the base token layer in `src/styles.css`.
   */
  tokens: Record<string, string>;
  /** Google Fonts (or other) stylesheet hrefs this theme needs. */
  fontHrefs: string[];
  decor: ThemeDecor;
}
