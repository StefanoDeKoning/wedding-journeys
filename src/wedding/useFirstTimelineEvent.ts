import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { canGuestSeeEvent, type GuestType } from "@/wedding/timelineVisibility";

/**
 * Resolves the timestamp of the first timeline event that matters to this guest:
 * - evening guests → the first "evening" event
 * - day / full_day / unknown guests → the first event they are allowed to see
 */
export function useFirstTimelineEventTime(
  weddingId: string,
  guestType: GuestType | null | undefined,
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
      setTime(pick?.event_time ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId, guestType]);

  return time;
}
