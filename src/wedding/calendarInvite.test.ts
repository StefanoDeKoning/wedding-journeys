import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { buildIcs, guestTimelineWindow, type TimelineSlot } from "./calendarInvite";

const at = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const timeline: TimelineSlot[] = [
  { event_time: "11:00:00", visibility: "all" },
  { event_time: "13:30:00", visibility: "day" },
  { event_time: "17:00:00", visibility: "day" },
  { event_time: "20:00:00", visibility: "evening" },
  { event_time: "23:00:00", visibility: "all" },
  { event_time: "01:00:00", visibility: "evening" },
];

describe("guest calendar window", () => {
  test("day guests span the first to the last day event", () => {
    assert.deepEqual(guestTimelineWindow(timeline, "day"), {
      start: at("11:00"),
      end: at("17:00"),
    });
  });
  test("evening guests span the first to the last evening event, past midnight", () => {
    assert.deepEqual(guestTimelineWindow(timeline, "evening"), {
      start: at("20:00"),
      end: at("25:00"),
    });
  });
  test("full-day guests span the first day event to the last evening event", () => {
    assert.deepEqual(guestTimelineWindow(timeline, "full_day"), {
      start: at("11:00"),
      end: at("25:00"),
    });
  });
  test("an unreleased or empty timeline yields no window", () => {
    assert.equal(guestTimelineWindow([], "day"), null);
  });
});

describe("ics file", () => {
  const now = new Date("2026-11-02T12:00:00Z");

  test("timed events use floating local times and roll past midnight", () => {
    const ics = buildIcs(
      {
        uid: "x",
        title: "Bruiloft",
        date: "2027-06-12",
        window: { start: at("20:00"), end: at("25:00") },
      },
      now,
    );
    assert.match(ics, /\r\nDTSTART:20270612T200000\r\n/);
    assert.match(ics, /\r\nDTEND:20270613T010000\r\n/);
    assert.match(ics, /\r\nDTSTAMP:20261102T120000Z\r\n/);
  });
  test("without a timeline the whole day is blocked", () => {
    const ics = buildIcs({ uid: "x", title: "Bruiloft", date: "2027-06-30T00:00:00+00:00" }, now);
    assert.match(ics, /DTSTART;VALUE=DATE:20270630\r\nDTEND;VALUE=DATE:20270701/);
  });
  test("text is escaped and long lines are folded", () => {
    const ics = buildIcs(
      { uid: "x", title: "Anna, Bob; & co", location: "a".repeat(100), date: "2027-06-12" },
      now,
    );
    assert.match(ics, /SUMMARY:Anna\\, Bob\\; & co/);
    assert.ok(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75));
  });
});
