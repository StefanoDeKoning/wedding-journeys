/**
 * Public design system — single import surface.
 *
 * Pages should import *only* from here (plus `@/theme`) and never define
 * their own colors, spacing, shadows or animations.
 */

export { PageCanvas, Container, Section } from "./Layout";
export { useParallax } from "./hooks";
export {
  ThemedButton,
  ThemedCard,
  FeatureCard,
  InfoCard,
  TimelineCard,
  MediaCard,
  WishCard,
  FormPanel,
  SectionHeader,
  Divider,
  Badge,
  Tag,
  IllustrationFrame,
  DecorativeWrapper,
  Hero,
} from "./components";
export {
  DecorMotifArt,
  DecorCorner,
  DecorSideComposition,
  DecorParticles,
  WatercolorWash,
} from "./decor/Illustrations";
export type { DecorProps, DecorSize } from "./decor/Illustrations";

export { ThemeProvider, useTheme, themeFontLinks } from "@/theme/ThemeProvider";
export { getTheme, availableThemes, romanticGarden, DEFAULT_THEME_ID } from "@/theme/themes";
export type {
  ThemeDefinition,
  ThemeDecor,
  ThemeId,
  DecorMotif,
  DecorPlacement,
  DecorColor,
  ParticleKind,
} from "@/theme/types";
