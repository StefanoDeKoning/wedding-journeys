/** "zaterdag 12 juni 2027" / "Saturday, June 12, 2027" — empty when there is no date. */
export function formatLongDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "14:30" / "02:30 PM" — empty when there is no time. */
export function formatTime(iso: string | null | undefined, locale: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
