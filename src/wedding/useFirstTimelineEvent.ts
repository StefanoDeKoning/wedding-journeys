import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { canGuestSeeEvent, type GuestType } from "@/wedding/timelineVisibility";

/**
 * Resolves the timestamp of the first timeline event that matters to this guest:
 * - evening guests → the first "evening" event
 * - day / full_day / unknown guests (incl. admins) → the first event of the day
 *
 * `event_time` is stored as a bare "HH:MM:SS" wall time, so it is combined with
 * the wedding date to produce a full local ISO timestamp the Countdown can parse.
 */
export function useFirstTimelineEventTime(
  weddingId: string,
  guestType: GuestType | null | undefined,
  weddingDate: string | null | undefined,
): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("timeline_events")
        .select("event_time, visibility")
        .eq("wedding_id", weddingId)
        .order("event_time");
      if (cancelled) return;
      const rows = (data ?? []) as { event_time: string; visibility: "all" | "day" | "evening" }[];
      const pick =
        guestType === "evening"
          ? rows.find((r) => r.visibility === "evening") ??
            rows.find((r) => canGuestSeeEvent(guestType, r.visibility))
          : rows.find((r) => canGuestSeeEvent(guestType, r.visibility));

      if (!pick || !weddingDate) {
        setTime(null);
        return;
      }
      // wedding_date may be a full timestamp; keep just the calendar day.
      const day = weddingDate.slice(0, 10);
      setTime(`${day}T${pick.event_time}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId, guestType, weddingDate]);

  return time;
}
