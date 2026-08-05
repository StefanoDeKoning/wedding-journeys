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
  `--ease-paper`, `--ease-soft`; durations `--ds-dur-*`.

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
   overrides.

No component changes are required — components read tokens and the recipe,
never theme names.

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

## Accessibility & performance

Decorations are `aria-hidden` and pointer-transparent; text sits on tokenised
surfaces that keep contrast; focus states use `focus-ring-elegant`; buttons are
≥36px tall (44px at `lg`); reduced motion is respected. Artwork is vector and
blur-based rather than large bitmaps, particle counts are theme-capped, photos
use `loading="lazy"` and `decoding="async"`, and ambient motion is limited to
compositor-friendly transform/opacity.
