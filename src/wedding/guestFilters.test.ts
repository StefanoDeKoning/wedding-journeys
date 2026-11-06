import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { matchesGuestFilters } from "./guestFilters";

describe("guest list filters", () => {
  for (const type of ["day", "evening", "full_day"]) {
    test(`filters by ${type} invitation type`, () => {
      for (const guestType of ["day", "evening", "full_day"]) {
        assert.equal(matchesGuestFilters(guestType, false, type, "all"), guestType === type);
      }
    });
  }
  test("responded includes both accepted and declined responses", () => {
    for (const status of ["yes", "no", null]) {
      assert.equal(matchesGuestFilters("day", status !== null, "all", "responded"), status !== null);
    }
  });
  test("not responded includes only guests without a response", () => {
    assert.equal(matchesGuestFilters("evening", false, "all", "not_responded"), true);
    assert.equal(matchesGuestFilters("evening", true, "all", "not_responded"), false);
  });
  test("type and response filters combine and all clears either restriction", () => {
    assert.equal(matchesGuestFilters("full_day", true, "full_day", "responded"), true);
    assert.equal(matchesGuestFilters("day", true, "full_day", "responded"), false);
    assert.equal(matchesGuestFilters("full_day", false, "full_day", "responded"), false);
    assert.equal(matchesGuestFilters("day", false, "all", "all"), true);
  });
});