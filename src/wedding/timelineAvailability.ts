/** Fail closed until availability has been explicitly confirmed. */
export function canViewTimeline(
  available: boolean | null | undefined,
  isAdmin: boolean,
): boolean {
  return isAdmin || available === true;
}