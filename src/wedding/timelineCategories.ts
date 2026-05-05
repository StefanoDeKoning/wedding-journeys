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
  /** Tailwind utility for the icon dot accent */
  accent: string;
}[] = [
  { value: "ceremony", label: "Ceremony", Icon: Heart, accent: "bg-rose-500/90 text-white" },
  { value: "reception", label: "Reception", Icon: Sparkles, accent: "bg-amber-500/90 text-white" },
  { value: "dinner", label: "Dinner", Icon: UtensilsCrossed, accent: "bg-emerald-600/90 text-white" },
  { value: "party", label: "Party", Icon: Music, accent: "bg-violet-600/90 text-white" },
  { value: "custom", label: "Custom", Icon: GlassWater, accent: "bg-primary text-primary-foreground" },
];

export function categoryMeta(c: string | null | undefined) {
  return TIMELINE_CATEGORIES.find((x) => x.value === c) ?? TIMELINE_CATEGORIES[4];
}
