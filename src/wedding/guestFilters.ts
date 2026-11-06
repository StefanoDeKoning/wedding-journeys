export function matchesGuestFilters(
  guestType: string,
  hasResponse: boolean,
  typeFilter: string,
  responseFilter: string,
): boolean {
  if (typeFilter !== "all" && guestType !== typeFilter) return false;
  if (responseFilter === "responded" && !hasResponse) return false;
  if (responseFilter === "not_responded" && hasResponse) return false;
  return true;
}