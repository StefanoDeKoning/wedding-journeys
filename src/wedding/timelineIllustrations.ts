import ceremonyTree from "@/assets/tl-ceremony-tree.png.asset.json";
import cake from "@/assets/tl-cake.png.asset.json";
import castle from "@/assets/tl-castle.png.asset.json";
import barbecue from "@/assets/tl-barbecue.png.asset.json";
import dancing from "@/assets/tl-dancing.png.asset.json";
import pizza from "@/assets/tl-pizza.png.asset.json";
import bouquet from "@/assets/tl-bouquet.png.asset.json";

/** Picture keys an admin can attach to a timeline event card. */
export type TimelinePicture =
  | "ceremony-tree"
  | "cake"
  | "castle"
  | "barbecue"
  | "dancing"
  | "pizza"
  | "bouquet";

export const TIMELINE_PICTURES: {
  value: TimelinePicture;
  label: string;
  url: string;
  alt: string;
}[] = [
  {
    value: "ceremony-tree",
    label: "Ceremony under a tree",
    url: ceremonyTree.url,
    alt: "Watercolour wedding ceremony under a large tree",
  },
  { value: "cake", label: "Wedding cake", url: cake.url, alt: "Watercolour tiered wedding cake" },
  { value: "castle", label: "Castle", url: castle.url, alt: "Watercolour wedding castle" },
  { value: "barbecue", label: "Barbecue", url: barbecue.url, alt: "Watercolour barbecue grill" },
  { value: "dancing", label: "Bride & groom dancing", url: dancing.url, alt: "Watercolour bride and groom dancing" },
  { value: "pizza", label: "Pizza", url: pizza.url, alt: "Watercolour pizza" },
  { value: "bouquet", label: "Wedding bouquet", url: bouquet.url, alt: "Watercolour bridal bouquet" },
];

export function pictureMeta(key: string | null | undefined) {
  return TIMELINE_PICTURES.find((p) => p.value === key) ?? null;
}

/** Keyword → picture guesses, used when an admin hasn't picked one. */
const KEYWORD_PICTURE: [RegExp, TimelinePicture][] = [
  [/cake|taart|proost/i, "cake"],
  [/pizza/i, "pizza"],
  [/bbq|barbecue|barbeque/i, "barbecue"],
  [/dans|danc|feest|party/i, "dancing"],
  [/kasteel|castle|slot|chateau|manor|aankomst/i, "castle"],
  [/ceremon|trouw|vows|huwelijk/i, "ceremony-tree"],
  [/bouquet|boeket|felicitat|flower|bloem/i, "bouquet"],
];

const CATEGORY_PICTURE: Record<string, TimelinePicture> = {
  ceremony: "ceremony-tree",
  reception: "bouquet",
  dinner: "barbecue",
  party: "dancing",
};

/** Resolves the picture shown on a timeline card. */
export function resolveTimelinePicture(
  illustration: string | null | undefined,
  category: string | null | undefined,
  title?: string | null,
) {
  const explicit = pictureMeta(illustration);
  if (explicit) return explicit;
  if (title) {
    const hit = KEYWORD_PICTURE.find(([re]) => re.test(title));
    if (hit) return pictureMeta(hit[1]);
  }
  const byCategory = category ? CATEGORY_PICTURE[category] : undefined;
  return byCategory ? pictureMeta(byCategory) : null;
}
