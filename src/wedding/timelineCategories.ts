import {
  Heart,
  GlassWater,
  UtensilsCrossed,
  Music,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

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
