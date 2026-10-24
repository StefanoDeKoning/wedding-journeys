import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { canViewTimeline } from "./timelineAvailability";

describe("timeline release", () => {
  test("guests cannot see an unavailable timeline", () => {
    assert.equal(canViewTimeline(false, false), false);
  });
  test("guests see the timeline after explicit release", () => {
    assert.equal(canViewTimeline(true, false), true);
  });
  test("administrators preview before release", () => {
    assert.equal(canViewTimeline(false, true), true);
  });
  test("unresolved availability cannot flash timeline content", () => {
    assert.equal(canViewTimeline(undefined, false), false);
    assert.equal(canViewTimeline(null, false), false);
  });
});