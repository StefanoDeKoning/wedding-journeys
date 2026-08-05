import {
  Heart,
  GlassWater,
  UtensilsCrossed,
  Music,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { DecorMotif } from "@/theme/types";

export type TimelineCategory = "ceremony" | "reception" | "dinner" | "party" | "custom";

export const TIMELINE_CATEGORIES: {
  value: TimelineCategory;
  label: string;
  Icon: LucideIcon;
  /** Theme-token-backed Tailwind utility for the icon dot accent — never a
   * literal palette color, so category colors shift with the active theme. */
  accent: string;
}[] = [
  { value: "ceremony", label: "Ceremony", Icon: Heart, accent: "bg-secondary/90 text-secondary-foreground" },
  { value: "reception", label: "Reception", Icon: Sparkles, accent: "bg-accent/90 text-accent-foreground" },
  { value: "dinner", label: "Dinner", Icon: UtensilsCrossed, accent: "bg-sage/90 text-foreground" },
  { value: "party", label: "Party", Icon: Music, accent: "bg-primary/90 text-primary-foreground" },
  { value: "custom", label: "Custom", Icon: GlassWater, accent: "bg-olive/90 text-cream" },
];

export function categoryMeta(c: string | null | undefined) {
  return TIMELINE_CATEGORIES.find((x) => x.value === c) ?? TIMELINE_CATEGORIES[4];
}

const CATEGORY_DEFAULT_MOTIF: Record<TimelineCategory, DecorMotif> = {
  ceremony: "ceremony-arch",
  reception: "toast",
  dinner: "dinner",
  party: "dancing",
  custom: "flourish",
};

/** Keyword → motif overrides, checked against the event title before falling
 * back to the category default. Keeps illustrations expressive without
 * needing a per-event schema field. */
const TITLE_KEYWORD_MOTIF: [RegExp, DecorMotif][] = [
  [/cake/i, "cake"],
  [/firework/i, "fireworks"],
  [/danc|first dance|party/i, "dancing"],
  [/pizza/i, "pizza"],
  [/sunset|golden hour/i, "sunset"],
  [/cocktail|drinks|toast|speech/i, "toast"],
  [/bouquet|flowers|florist/i, "bouquet"],
  [/music|band|dj/i, "music-note"],
  [/castle|chateau|manor/i, "castle"],
];

/** Picks a watercolor illustration motif for a timeline/story entry. */
export function illustrationFor(
  category: string | null | undefined,
  title?: string | null,
): DecorMotif {
  if (title) {
    const hit = TITLE_KEYWORD_MOTIF.find(([re]) => re.test(title));
    if (hit) return hit[1];
  }
  const meta = categoryMeta(category);
  return CATEGORY_DEFAULT_MOTIF[meta.value];
}
