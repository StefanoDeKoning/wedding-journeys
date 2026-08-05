# OurJourney — Public Design System

A premium, themable visual language for every public (guest-facing and
marketing) page. Import from `@/design-system` only; never write page-specific
colors, spacing, shadows or animations.

## Where things live

| Concern | Location |
| --- | --- |
| Design tokens (colors, type, spacing, radius, elevation, motion) | `src/styles.css` — "DESIGN SYSTEM — token layer" |
| Theme contract (types) | `src/theme/types.ts` |
| Theme definitions + registry | `src/theme/themes.ts` |
| Theme runtime (`ThemeProvider`, `useTheme`) | `src/theme/ThemeProvider.tsx` |
| Layout system (`PageCanvas`, `Section`, `Container`) | `src/design-system/Layout.tsx` |
| Component library | `src/design-system/components.tsx` |
| Illustration / decoration library | `src/design-system/decor/Illustrations.tsx` |
| Motion hooks (`useParallax`) | `src/design-system/hooks.ts` |
| Public barrel | `src/design-system/index.ts` |

Nothing here touches admin routes, data access or business logic.

## Tokens

Every token is a CSS custom property. Themes redefine only `--ds-*`; the
`@theme`/`@theme inline` layers expose them as Tailwind utilities, and the
semantic shadcn variables (`--primary`, `--background`, …) are remapped onto
`--ds-*` so existing components inherit the active theme for free.

- **Color**: `--ds-ivory`, `--ds-cream`, `--ds-champagne`, `--ds-blush`,
  `--ds-dusty-rose`, `--ds-sage`, `--ds-olive`, `--ds-gold`, `--ds-terracotta`,
  `--ds-ink`, plus decorative roles `--ds-decor`, `--ds-decor-soft`,
  `--ds-decor-leaf`, `--ds-decor-gold`.
- **Typography**: utilities `type-hero`, `type-section-title`,
  `type-card-title`, `type-script`, `type-script-sm`, `type-body-lg`,
  `type-body`, `type-caption`, `type-label`, `type-nav`, `type-button`.
- **Spacing**: `gutter` · `stack` · `block` · `section` · `section-lg` · `hero`
  (`px-gutter`, `py-section`, `gap-stack`, …). No arbitrary spacing values.
- **Widths**: `max-w-prose` · `max-w-content` · `max-w-wide` · `max-w-full`.
- **Radius**: `rounded-paper` · `rounded-card` · `rounded-frame`.
- **Elevation**: `shadow-elev-1` … `shadow-elev-4` (soft, warm, never harsh).
- **Borders**: `border-paper` (paper hairline) · `border-gilded` (gold leaf).
- **Surfaces**: `surface-paper`, `surface-veil`, `texture-paper`, `vignette`,
  `bg-wash-page`, `decor-fade-x`.
- **Motion**: `animate-ds-fade`, `-reveal`, `-reveal-left`, `-reveal-right`,
  `-scale`, `-paper`, `-float`, `-drift`, `-shimmer`; interactions
  `hover-lift`, `hover-gild`; focus `focus-ring-elegant`; easings
  `--ease-paper`, `--ease-soft`; durations `--ds-dur-*`; scroll-linked
  `useParallax()` hook (reads `--ds-parallax-shift`, opt-in, decorative use only).

`prefers-reduced-motion: reduce` neutralises all animation globally while the
composition stays intact.

## Theming

```tsx
import { ThemeProvider } from "@/design-system";

<ThemeProvider themeId={wedding.theme}>
  <PageCanvas>…</PageCanvas>
</ThemeProvider>
```

`ThemeProvider` sets `data-theme`, inlines token overrides (SSR-safe, no
flash) and publishes the theme's *decor recipe* through `useTheme()`.

### Adding a theme

1. Add its id to `ThemeId` in `src/theme/types.ts` (reserved ids already exist).
2. Add a `ThemeDefinition` in `src/theme/themes.ts`: token overrides, font
   hrefs and a `decor` recipe (corner/side motifs, divider motif, particles,
   paper texture, vignette, envelope flavour).
3. Optionally add a `[data-theme="…"]` block in `src/styles.css` for larger
   overrides — every `--ds-*` token, including the legacy brand aliases
   (`--terracotta`, `--sage`, …) and the envelope/wax-seal/parchment tokens,
   lives in one block per theme, so a theme can override as little or as much
   as it needs.

No component changes are required — components read tokens and the recipe,
never theme names.

**Worked example** — a `modern-minimal` theme only needs to override the
tokens that change; anything omitted falls back to Romantic Garden's values
via the `[data-theme="modern-minimal"]` block picking up whatever isn't
redefined from `:root`:

```css
/* src/styles.css */
[data-theme="modern-minimal"] {
  --ds-ivory: oklch(0.99 0.002 90);
  --ds-cream: oklch(0.98 0.003 90);
  --ds-terracotta: oklch(0.35 0.01 40);   /* near-black accent instead of rust */
  --ds-gold: oklch(0.7 0.01 90);          /* desaturated instead of warm gold */
  --ds-font-display: "Cormorant", serif;
  --ds-font-script: "Cormorant", serif;   /* no script face — quieter */
  --ds-radius-card: 0.25rem;              /* sharp corners instead of soft */
  --ds-border-paper: 1px solid color-mix(in oklab, var(--ds-terracotta) 30%, transparent);
}
```

```ts
// src/theme/themes.ts
export const modernMinimal: ThemeDefinition = {
  id: "modern-minimal",
  name: "Modern Minimal",
  description: "Quiet, editorial, near-monochrome — 20% fairytale, 80% timeless luxury.",
  tokens: {},
  fontHrefs: ["https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600&display=swap"],
  decor: {
    corners: ["flourish"],
    sides: ["leaf"],
    divider: "flourish",
    particles: "none",
    particleCount: 0,
    paperTexture: false,
    vignette: false,
    envelope: "plain",
  },
};
// then: export const themes = { "romantic-garden": romanticGarden, "modern-minimal": modernMinimal };
```

This example is documentation only — `modern-minimal` is **not** registered
in `themes.ts` yet. Per this phase's brief, only Romantic Garden ships.

### Per-wedding theme selection (deferred)

`ThemeProvider` already accepts any `themeId`, so switching a wedding's theme
is a one-line change once a `theme` column exists on `weddings`:
`<ThemeProvider themeId={wedding.theme}>` at the `$slug` layout route instead
of the hardcoded `DEFAULT_THEME_ID` in `src/routes/__root.tsx`. That data-model
and admin-UI work is intentionally out of scope for this architecture phase —
it's a follow-up feature, not a visual-system change.

## Layout philosophy

`PageCanvas` owns the atmosphere: page wash, paper texture, vignette, ambient
particles and the tall painted side compositions. The wide margins become
storytelling space rather than empty whitespace, masked with `decor-fade-x` so
they fade toward the readable centre. On smaller viewports the side
compositions are replaced by repositioned watercolour washes — the mobile
experience stays equally premium instead of being stripped.

Pages compose `PageCanvas > Section > Container` and never place decorations
themselves; `density="quiet" | "regular" | "lavish"` tunes richness.

## Components

Buttons (`primary`, `secondary`, `ghost`, `gilded`), `ThemedCard`
(`paper`, `veil`, `framed`, `plain`), `FeatureCard`, `InfoCard`,
`TimelineCard`, `MediaCard`, `WishCard`, `FormPanel`, `SectionHeader`,
`Divider`, `Badge`, `Tag`, `IllustrationFrame`, `DecorativeWrapper`, `Hero`.

## Illustration style guide

All artwork is inline SVG (no network cost, themable, `aria-hidden`) and must be:
watercolour, hand-painted, layered translucent washes with soft blurred edges,
muted palette drawn only from `--ds-decor*` tokens. Never flat icons, clipart,
cartoon shapes or hard outlines.

Motifs: `rose`, `peony`, `leaf`, `olive-branch`, `eucalyptus`, `vine`,
`flourish`, `gold-leaf`. Compositions: `WatercolorWash`, `DecorCorner`,
`DecorSideComposition`, `DecorParticles`.

## Deliverables checklist

Maps every requirement from the design-system brief to what already satisfies
it, so the architecture can be audited at a glance instead of re-derived.

| Requirement | Satisfied by |
| --- | --- |
| Color tokens (ivory, cream, champagne, blush, dusty rose, sage, olive, gold, terracotta, ink) | `--ds-ivory/cream/champagne/blush/dusty-rose/sage/olive/gold/terracotta/ink` in `styles.css` |
| Typography scale (hero, section, script, body, caption, nav, button, label) | `type-hero`, `type-section-title`, `type-card-title`, `type-script[-sm]`, `type-body[-lg]`, `type-caption`, `type-label`, `type-nav`, `type-button` utilities |
| Spacing scale, no arbitrary values | `--spacing-gutter/stack/block/section/section-lg/hero` + `--container-prose/content/wide/full` |
| Radius scale | `--ds-radius-paper/card/frame` |
| Shadows (soft, elegant, warm) | `--ds-elev-1..4` |
| Borders (subtle, paper-like) | `--ds-border-hairline/paper/gilded` |
| Animation tokens: fade, slide/reveal, hover, scale, floating, parallax, paper motion | `animate-ds-fade/reveal[-left/-right]/scale/paper/float/drift/shimmer`, `hover-lift/hover-gild`, `useParallax()` |
| Buttons, cards, section headers/containers, dividers, hero, feature/info/timeline/gallery(media)/wishlist cards, form containers, decorative wrappers, badges, tags, illustration containers | `src/design-system/components.tsx` + `Layout.tsx` (see Components below) |
| Decorative system (roses, leaves, olive branch, eucalyptus, vines, flourishes, gold leaf, corners, side compositions, particles, washes) | `src/design-system/decor/Illustrations.tsx` |
| Illustration style guide | This README's "Illustration style guide" section — enforced by construction (every motif is built from `WatercolorWash`/`RosePaint`/`LeafPaint` primitives) |
| Layout philosophy (full-viewport, sides as storytelling space) | `PageCanvas` + `DecorSideComposition` in `Layout.tsx` |
| Accessibility (contrast, focus, reduced motion, touch targets) | See "Accessibility & performance" below |
| Theme architecture, scalable to new themes | `src/theme/*` + this file's "Adding a theme" section |

## Migrating a page (for the next phase)

Pages are **not** migrated yet — this phase only guarantees the tokens they'll
need are theme-correct. When a page is redesigned, the pattern is: replace
hand-rolled Tailwind with the matching primitive, nothing else changes.

```tsx
// Before — hand-rolled, theme-blind by construction
<div className="rounded-[1.5rem] border border-border bg-card shadow-soft p-6">
  <h3 className="text-lg font-display font-medium">{title}</h3>
  <p className="text-sm text-muted-foreground">{children}</p>
</div>

// After — themed, inherits any future theme automatically
import { ThemedCard } from "@/design-system";

<ThemedCard>
  <h3 className="type-card-title">{title}</h3>
  <p className="type-body text-muted-foreground">{children}</p>
</ThemedCard>
```

Same idea for the page shell: replace a bespoke `<div className="bg-gradient-soft min-h-screen">`
with `<PageCanvas><Section><Container>…</Container></Section></PageCanvas>`.

## Accessibility & performance

Decorations are `aria-hidden` and pointer-transparent; text sits on tokenised
surfaces that keep contrast; focus states use `focus-ring-elegant`; buttons are
≥36px tall (44px at `lg`); reduced motion is respected. Artwork is vector and
blur-based rather than large bitmaps, particle counts are theme-capped, photos
use `loading="lazy"` and `decoding="async"`, and ambient motion is limited to
compositor-friendly transform/opacity.
