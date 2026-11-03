import type { ThemeDefinition, ThemeId } from "./types";

/**
 * Theme registry.
 *
 * Adding a theme = adding one entry here. Components, decorations and
 * layouts read tokens + the decor recipe, never theme ids, so no
 * component has to change when a theme is introduced.
 */

const ROMANTIC_GARDEN_FONTS = [
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Great+Vibes&display=swap",
];

export const romanticGarden: ThemeDefinition = {
  id: "romantic-garden",
  name: "Romantic Garden",
  description:
    "Dreamy watercolour garden — blush, dusty rose, sage and warm gold on ivory paper. 60% fairytale, 40% timeless luxury.",
  // The base token layer in styles.css already *is* Romantic Garden, so the
  // default theme needs no overrides. Kept explicit for documentation value.
  tokens: {},
  fontHrefs: ROMANTIC_GARDEN_FONTS,
  decor: {
    corners: ["rose", "leaf", "flourish"],
    sides: ["rose", "vine", "eucalyptus"],
    divider: "flourish",
    particles: "petals",
    particleCount: 14,
    paperTexture: true,
    vignette: true,
    envelope: "wax-seal",
    canvas: "watercolor",
    horizon: "none",
    fireflies: false,
  },
};

const NIGHT_GARDEN_FONTS = [
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Jost:wght@400;500&family=Great+Vibes&display=swap",
];

export const nightGarden: ThemeDefinition = {
  id: "night-garden",
  name: "Night Garden",
  description:
    "A stationery suite on deep green velvet — paper cream, gold foil and a wax seal, with the castle courtyard drawn as the horizon.",
  // Tokens live in the `[data-theme="night-garden"]` block in styles.css.
  tokens: {},
  fontHrefs: NIGHT_GARDEN_FONTS,
  decor: {
    // No painted corners: night-garden cards are framed by hairlines instead.
    corners: [],
    sides: [],
    divider: "gold-leaf",
    particles: "none",
    particleCount: 0,
    paperTexture: false,
    vignette: false,
    envelope: "wax-seal",
    canvas: "plain",
    horizon: "castle-courtyard",
    fireflies: true,
  },
};

export const themes: Partial<Record<ThemeId, ThemeDefinition>> = {
  "romantic-garden": romanticGarden,
  "night-garden": nightGarden,
};

export const DEFAULT_THEME_ID: ThemeId = "romantic-garden";

/**
 * Theme for the guest-facing wedding pages (`/$slug`, invite links). Until
 * weddings store their own theme column, every wedding uses this one.
 */
export const WEDDING_THEME_ID: ThemeId = "night-garden";

export function getTheme(id?: ThemeId | string | null): ThemeDefinition {
  if (!id) return romanticGarden;
  return themes[id as ThemeId] ?? romanticGarden;
}

/** Themes that are implemented and safe to expose in a picker. */
export function availableThemes(): ThemeDefinition[] {
  return Object.values(themes).filter(Boolean) as ThemeDefinition[];
}
