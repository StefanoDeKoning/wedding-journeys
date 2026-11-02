import { canGuestSeeEvent, type GuestType, type TimelineVisibility } from "./timelineVisibility";

export type TimelineSlot = { event_time: string; visibility: TimelineVisibility };

/** Minutes since midnight of the wedding day; may exceed 24h for events after midnight. */
export type GuestWindow = { start: number; end: number };

const DAY_MINUTES = 24 * 60;

/**
 * Converts bare "HH:MM[:SS]" wall times (in timeline order) into minutes since
 * the start of the wedding day. A time earlier than its predecessor is taken to
 * be after midnight, so "23:00 → 00:30" stays chronological.
 */
function toWeddingMinutes(rows: TimelineSlot[]) {
  let dayOffset = 0;
  let previous = -1;
  return rows.map((row) => {
    const [h, m] = row.event_time.split(":").map(Number);
    let minutes = h * 60 + m + dayOffset;
    if (minutes < previous) {
      dayOffset += DAY_MINUTES;
      minutes += DAY_MINUTES;
    }
    previous = minutes;
    return { ...row, minutes };
  });
}

/**
 * The part of the day this guest is invited to, from the timeline:
 * - day guests → first day event until the last day event
 * - evening guests → first evening event until the last evening event
 * - full-day / unknown guests (incl. admins) → first day event until the last evening event
 *
 * "all" events belong to whichever part they fall in, but only events marked for
 * the guest's own part decide where an evening starts or a day ends.
 */
export function guestTimelineWindow(
  rows: TimelineSlot[],
  guestType: GuestType | null | undefined,
): GuestWindow | null {
  const events = toWeddingMinutes(rows);
  const daySide = events.filter((e) => canGuestSeeEvent("day", e.visibility));
  const eveningSide = events.filter((e) => canGuestSeeEvent("evening", e.visibility));
  const ownPart = (side: typeof events, part: TimelineVisibility) => {
    const marked = side.filter((e) => e.visibility === part);
    return marked.length > 0 ? marked : side;
  };
  const either = (preferred: typeof events, other: typeof events) =>
    preferred.length > 0 ? preferred : other;

  const first = (
    guestType === "evening" ? ownPart(eveningSide, "evening") : either(daySide, eveningSide)
  )[0];
  const last = (guestType === "day" ? ownPart(daySide, "day") : either(eveningSide, daySide)).at(
    -1,
  );
  if (!first || !last) return null;
  return { start: first.minutes, end: Math.max(last.minutes, first.minutes) };
}

/** Calendar day (YYYY-MM-DD) shifted by whole days. */
function shiftDay(day: string, days: number) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Local ISO timestamp (no zone) for a minute offset on the wedding day. */
export function weddingMinutesToIso(weddingDate: string, minutes: number) {
  const day = shiftDay(weddingDate.slice(0, 10), Math.floor(minutes / DAY_MINUTES));
  const rest = minutes % DAY_MINUTES;
  const hh = String(Math.floor(rest / 60)).padStart(2, "0");
  const mm = String(rest % 60).padStart(2, "0");
  return `${day}T${hh}:${mm}:00`;
}

export type CalendarEvent = {
  uid: string;
  title: string;
  location?: string | null;
  description?: string | null;
  url?: string | null;
  /** Calendar day of the wedding (YYYY-MM-DD, or a timestamp starting with it). */
  date: string;
  /** Without a window the event blocks the whole day. */
  window?: GuestWindow | null;
};

/** RFC 5545 TEXT escaping. */
function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Folds content lines longer than 75 octets, as RFC 5545 requires. */
function fold(line: string) {
  const bytes = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;
    if (bytes.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const icsDate = (day: string) => day.replace(/-/g, "");
const icsDateTime = (iso: string) => iso.replace(/[-:]/g, "");

/**
 * Builds a single-event iCalendar file. Times are floating (no time zone), the
 * same wall-clock times the timeline shows, so the calendar keeps them as-is.
 */
export function buildIcs(event: CalendarEvent, now = new Date()) {
  const day = event.date.slice(0, 10);
  const timing = event.window
    ? [
        `DTSTART:${icsDateTime(weddingMinutesToIso(day, event.window.start))}`,
        `DTEND:${icsDateTime(
          weddingMinutesToIso(
            day,
            // A single moment would leave no block in the calendar; give it an hour.
            event.window.end > event.window.start ? event.window.end : event.window.start + 60,
          ),
        )}`,
      ]
    : [`DTSTART;VALUE=DATE:${icsDate(day)}`, `DTEND;VALUE=DATE:${icsDate(shiftDay(day, 1))}`];

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Our Journey//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    ...timing,
    `SUMMARY:${escapeText(event.title)}`,
    event.location ? `LOCATION:${escapeText(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
    event.url ? `URL:${event.url}` : null,
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
