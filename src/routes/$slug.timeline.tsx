import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { categoryMeta } from "@/wedding/timelineCategories";
import { canGuestSeeEvent } from "@/wedding/timelineVisibility";
import { WatercolorBlot, RoseCluster, FloatingPetals, FloralDivider } from "@/wedding/FloralDecorations";

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
    return visibleEvents.findIndex((e) => {
      const [h, m] = e.event_time.split(":").map(Number);
      const evDate = new Date(today);
      evDate.setHours(h, m, 0, 0);
      return evDate.getTime() >= now.getTime();
    });
  }, [visibleEvents, wedding?.wedding_date, now]);

  if (!wedding) return null;

  return (
    <section className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
      {/* Decorative side elements — climbing roses */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <WatercolorBlot color="peach" size="xl" className="absolute top-20 right-0 opacity-60 rose-glow" />
        <WatercolorBlot color="sage" size="xl" className="absolute bottom-40 left-0 opacity-55 rose-glow" style={{ animationDelay: "2s" }} />
        <RoseCluster variant="side-right" size="lg" color="rose" className="absolute top-28 right-0 opacity-95" />
        <RoseCluster variant="side-left" size="lg" color="sage" className="absolute bottom-44 left-0 opacity-90" />
        <FloatingPetals count={10} />
      </div>

      <header className="relative z-10 text-center mb-16">
        <p className="font-script text-3xl md:text-4xl text-primary">how the day unfolds</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Wedding timeline</h1>
        <FloralDivider className="mt-6" color="terracotta" />
        {isEvening && (
          <p className="mt-4 text-sm text-muted-foreground">
            You're invited from the evening onwards — but you're welcome to arrive a little earlier.
          </p>
        )}
      </header>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          The schedule is being prepared. Check back soon.
        </div>
      ) : (
        <div className="relative z-10">
          {/* Decorative timeline spine */}
          <div className="absolute left-3 sm:left-5 top-0 bottom-0 w-0.5 rounded-full">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sage/20 to-transparent w-full blur-[1px]" />
          </div>

          <ol className="relative space-y-10">
            {visibleEvents.map((e, i) => {
              const isNext = i === nextIdx;
              const meta = categoryMeta(e.category);
              const Icon = meta.Icon;
              return (
                <li key={e.id} className="pl-10 sm:pl-14">
                  <span
                    className={`absolute -left-[11px] sm:-left-[9px] flex items-center justify-center w-9 h-9 rounded-full shadow-warm border-2 border-background transition-transform duration-500 hover:scale-110 ${meta.accent} ${
                      isNext ? "ring-4 ring-primary/20 animate-pulse" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div
                    className={`card-romantic p-6 transition-all duration-500 hover:-translate-y-1 ${
                      isNext
                        ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent shadow-warm"
                        : ""
                    }`}
                  >
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-display text-xl text-primary tabular-nums">
                        {e.event_time.slice(0, 5)}
                      </span>
                      <h3 className="font-display text-lg">{e.title}</h3>
                      {isNext && (
                        <span className="text-[0.65rem] uppercase tracking-widest text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                          Up next
                        </span>
                      )}
                    </div>
                    {e.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
                    )}
                    {e.location && (
                      <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {e.location}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <FloralDivider className="mt-16" color="terracotta" />
        </div>
      )}
    </section>
  );
}
