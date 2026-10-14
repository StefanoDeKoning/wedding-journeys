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
  },
};

export const themes: Partial<Record<ThemeId, ThemeDefinition>> = {
  "romantic-garden": romanticGarden,
};

export const DEFAULT_THEME_ID: ThemeId = "romantic-garden";

export function getTheme(id?: ThemeId | string | null): ThemeDefinition {
  if (!id) return romanticGarden;
  return themes[id as ThemeId] ?? romanticGarden;
}

/** Themes that are implemented and safe to expose in a picker. */
export function availableThemes(): ThemeDefinition[] {
  return Object.values(themes).filter(Boolean) as ThemeDefinition[];
}
