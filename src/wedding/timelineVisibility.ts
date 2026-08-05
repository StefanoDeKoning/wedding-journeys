export type TimelineVisibility = "all" | "day" | "evening";
export type GuestType = "day" | "evening" | "full_day";

/**
 * Returns the set of timeline event visibilities a guest is allowed to view.
 * - "all" events are visible to everyone.
 * - "day" guests see day events.
 * - "evening" guests see evening events.
 * - "full_day" guests see both day and evening events.
 */
export function allowedVisibilities(
  guestType: GuestType | null | undefined,
): Set<TimelineVisibility> {
  const allowed = new Set<TimelineVisibility>(["all"]);
  if (!guestType) {
    allowed.add("day");
    allowed.add("evening");
    return allowed;
  }
  if (guestType === "day" || guestType === "full_day") allowed.add("day");
  if (guestType === "evening" || guestType === "full_day") allowed.add("evening");
  return allowed;
}

export function canGuestSeeEvent(
  guestType: GuestType | null | undefined,
  eventVisibility: TimelineVisibility,
): boolean {
  return allowedVisibilities(guestType).has(eventVisibility);
}
