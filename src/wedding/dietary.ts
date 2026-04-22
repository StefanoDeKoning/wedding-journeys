export const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "lactose_free", label: "Lactose-free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "nut_allergy", label: "Nut allergy" },
] as const;

export type DietaryValue = (typeof DIETARY_OPTIONS)[number]["value"];

export function dietaryLabel(value: string): string {
  return DIETARY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
