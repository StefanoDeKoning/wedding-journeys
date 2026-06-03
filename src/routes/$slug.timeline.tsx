import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { categoryMeta } from "@/wedding/timelineCategories";
import { canGuestSeeEvent } from "@/wedding/timelineVisibility";

export const Route = createFileRoute("/$slug/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline" },
      { name: "description", content: "How the day unfolds." },
    ],
  }),
  component: TimelinePage,
});

interface TEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string;
  event_time: string;
  visibility: "all" | "day" | "evening";
  position: number;
}

function TimelinePage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);
  const [events, setEvents] = useState<TEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!wedding) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("timeline_events")
        .select("id, title, description, location, category, event_time, visibility, position")
        .eq("wedding_id", wedding.id)
        .order("position")
        .order("event_time");
      if (!cancelled) {
        setEvents((data ?? []) as TEvent[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wedding?.id]);

  const isEvening = guest?.guest_type === "evening";
  const visibleEvents = useMemo(
    () => events.filter((e) => canGuestSeeEvent(guest?.guest_type, e.visibility)),
    [events, guest?.guest_type],
  );

  // Determine the index of the "next" upcoming event today (only if wedding day)
  const nextIdx = useMemo(() => {
    if (!wedding?.wedding_date) return -1;
    const today = new Date();
    const wDate = new Date(wedding.wedding_date);
    if (
      today.getFullYear() !== wDate.getFullYear() ||
      today.getMonth() !== wDate.getMonth() ||
      today.getDate() !== wDate.getDate()
    ) {
      return -1;
    }
    return events.findIndex((e) => {
      const [h, m] = e.event_time.split(":").map(Number);
      const evDate = new Date(today);
      evDate.setHours(h, m, 0, 0);
      return evDate.getTime() >= now.getTime();
    });
  }, [events, wedding?.wedding_date, now]);

  if (!wedding) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <header className="text-center mb-12">
        <p className="font-script text-3xl text-primary">how the day unfolds</p>
        <h1 className="mt-2 font-display text-4xl">Wedding timeline</h1>
        {isEvening && (
          <p className="mt-3 text-sm text-muted-foreground">
            You're invited from the evening onwards — but you're welcome to arrive a little earlier.
          </p>
        )}
      </header>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          The schedule is being prepared. Check back soon.
        </div>
      ) : (
        <ol className="relative border-l-2 border-primary/20 ml-3 sm:ml-5 space-y-8">
          {events.map((e, i) => {
            const dimmed =
              (isEvening && e.visibility === "day") || (isDay && e.visibility === "evening");
            const isNext = i === nextIdx;
            const meta = categoryMeta(e.category);
            const Icon = meta.Icon;
            return (
              <li key={e.id} className={`pl-8 sm:pl-10 ${dimmed ? "opacity-50" : ""}`}>
                <span
                  className={`absolute -left-[16px] flex items-center justify-center w-8 h-8 rounded-full shadow-warm ${meta.accent} ${
                    isNext ? "ring-4 ring-primary/30 animate-pulse" : ""
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div
                  className={`rounded-2xl border p-5 transition-shadow ${
                    isNext
                      ? "border-primary/40 bg-primary/5 shadow-warm"
                      : "border-border bg-card/70"
                  }`}
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display text-xl text-primary tabular-nums">
                      {e.event_time.slice(0, 5)}
                    </span>
                    <h3 className="font-display text-lg">{e.title}</h3>
                    {isNext && (
                      <span className="text-[0.65rem] uppercase tracking-widest text-primary px-2 py-0.5 rounded-full bg-primary/10">
                        Up next
                      </span>
                    )}
                  </div>
                  {e.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{e.description}</p>
                  )}
                  {e.location && (
                    <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {e.location}
                    </p>
                  )}
                  {dimmed && (
                    <p className="mt-2 text-[0.7rem] uppercase tracking-widest text-muted-foreground/80">
                      {e.visibility === "day" ? "Day guests only" : "Evening guests only"}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
