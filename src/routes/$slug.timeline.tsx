import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { illustrationFor } from "@/wedding/timelineCategories";
import { canGuestSeeEvent } from "@/wedding/timelineVisibility";
import {
  PageCanvas,
  Section,
  ThemedCard,
  Badge,
  Divider,
} from "@/design-system";
import { DecorMotifArt } from "@/design-system/decor/Illustrations";

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
    <PageCanvas density="regular">
      <Section size="hero" width="prose">
        <div className="flex flex-col items-center gap-stack text-center">
          <p className="type-script animate-ds-fade">how the day unfolds</p>
          <h1 className="type-hero animate-ds-reveal">Wedding timeline</h1>
          {isEvening && (
            <p className="type-body text-muted-foreground animate-ds-reveal" style={{ animationDelay: "120ms" }}>
              You're invited from the evening onwards — but you're welcome to arrive a little earlier.
            </p>
          )}
        </div>
      </Section>

      {loading ? (
        <Section size="compact">
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        </Section>
      ) : visibleEvents.length === 0 ? (
        <Section size="compact">
          <div className="py-16 text-center text-sm text-muted-foreground">
            The schedule is being prepared. Check back soon.
          </div>
        </Section>
      ) : (
        <Section size="spacious" width="wide">
          <div className="relative">
            {/* Center spine — desktop only, aligned with badge column below */}
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-linear-to-b from-transparent via-primary/30 to-transparent lg:block"
              aria-hidden
            />
            <ol className="relative flex flex-col gap-block lg:gap-section">
              {visibleEvents.map((e, i) => {
                const isNext = i === nextIdx;
                const isLeft = i % 2 === 0;
                return (
                  <li key={e.id}>
                    <TimelineChapter event={e} isNext={isNext} isLeft={isLeft} />
                  </li>
                );
              })}
            </ol>
          </div>
          <Divider className="mt-section" />
        </Section>
      )}
    </PageCanvas>
  );
}

function TimelineChapter({
  event: e,
  isNext,
  isLeft,
}: {
  event: TEvent;
  isNext: boolean;
  isLeft: boolean;
}) {
  const motif = illustrationFor(e.category, e.title);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] lg:items-start lg:gap-x-6">
      <span
        className={`relative z-10 mx-auto mb-4 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full surface-veil border-gilded shadow-elev-2 lg:col-start-2 lg:row-start-1 lg:mb-0 ${
          isNext ? "shadow-elev-4 ring-2 ring-primary/40" : ""
        }`}
      >
        <DecorMotifArt motif={motif} size="sm" intensity={0.95} />
      </span>

      <ThemedCard
        variant={isNext ? "framed" : "paper"}
        ornament={isNext}
        interactive
        className={`${isNext ? "shadow-elev-3" : ""} ${
          isLeft
            ? "lg:col-start-1 lg:row-start-1 animate-ds-reveal-left"
            : "lg:col-start-3 lg:row-start-1 animate-ds-reveal-right"
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="type-card-title text-primary tabular-nums">{e.event_time.slice(0, 5)}</span>
          <h3 className="type-card-title">{e.title}</h3>
          {isNext && <Badge tone="primary">Up next</Badge>}
        </div>
        {e.description && <p className="type-body mt-2 text-muted-foreground">{e.description}</p>}
        {e.location && (
          <p className="type-caption mt-3 inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {e.location}
          </p>
        )}
      </ThemedCard>
    </div>
  );
}
