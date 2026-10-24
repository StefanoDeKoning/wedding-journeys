import { describe, expect, test } from "bun:test";
import { canViewTimeline } from "./timelineAvailability";

describe("timeline release", () => {
  test("guests cannot see an unavailable timeline", () => {
    expect(canViewTimeline(false, false)).toBe(false);
  });
  test("guests see the timeline after explicit release", () => {
    expect(canViewTimeline(true, false)).toBe(true);
  });
  test("administrators preview before release", () => {
    expect(canViewTimeline(false, true)).toBe(true);
  });
  test("unresolved availability cannot flash timeline content", () => {
    expect(canViewTimeline(undefined, false)).toBe(false);
    expect(canViewTimeline(null, false)).toBe(false);
  });
});