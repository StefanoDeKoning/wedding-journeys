import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type GuestType } from "@/wedding/timelineVisibility";
import { guestTimelineWindow, type GuestWindow, type TimelineSlot } from "@/wedding/calendarInvite";

/**
 * Resolves the part of the wedding day that matters to this guest, from the
 * first to the last timeline event of their part (see `guestTimelineWindow`).
 *
 * `event_time` is stored as a bare "HH:MM:SS" wall time; the window is expressed
 * in minutes since the start of the wedding day and is null while loading, when
 * the timeline is not released yet, or when it holds no events for this guest.
 */
export function useGuestTimelineWindow(
  weddingId: string,
  guestType: GuestType | null | undefined,
): GuestWindow | null {
  const [timelineWindow, setTimelineWindow] = useState<GuestWindow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("timeline_events")
        .select("event_time, visibility")
        .eq("wedding_id", weddingId)
        .order("position")
        .order("event_time");
      if (cancelled) return;
      setTimelineWindow(guestTimelineWindow((data ?? []) as TimelineSlot[], guestType));
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId, guestType]);

  return timelineWindow;
}
