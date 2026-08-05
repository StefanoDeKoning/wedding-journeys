import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import {
  PageCanvas,
  Section,
  ThemedCard,
  Divider,
  Badge,
} from "@/design-system";
import { DecorMotifArt } from "@/design-system/decor/Illustrations";
import type { DecorMotif } from "@/theme/types";

export const Route = createFileRoute("/$slug/story")({
  head: () => ({
    meta: [
      { title: "Our Story" },
      { name: "description", content: "How it all began." },
    ],
  }),
  component: StoryPage,
});

interface Chapter {
  id: string;
  position: number;
  chapter_label: string | null;
  title: string;
  body: string;
  event_date: string | null;
  illustration_motif: string | null;
}

function formatChapterDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function StoryPage() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wedding) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("story_chapters")
        .select("id, position, chapter_label, title, body, event_date, illustration_motif")
        .eq("wedding_id", wedding.id)
        .order("position");
      if (!cancelled) {
        setChapters((data ?? []) as Chapter[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wedding?.id]);

  if (!wedding) return null;

  return (
    <PageCanvas density="regular">
      <Section size="hero" width="prose">
        <div className="flex flex-col items-center gap-stack text-center">
          <p className="type-script animate-ds-fade">before happily ever after</p>
          <h1 className="type-hero animate-ds-reveal">Our story</h1>
          <p className="type-body-lg text-muted-foreground max-w-prose animate-ds-reveal" style={{ animationDelay: "120ms" }}>
            Every love story is beautiful, but ours is our favourite.
          </p>
        </div>
      </Section>

      {loading ? (
        <Section size="compact">
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        </Section>
      ) : chapters.length === 0 ? (
        <Section size="compact">
          <div className="py-16 text-center text-sm text-muted-foreground">
            The story is being written. Check back soon.
          </div>
        </Section>
      ) : (
        <Section size="spacious" width="wide">
          <div className="flex flex-col gap-section">
            {chapters.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <Divider motif={(c.illustration_motif as DecorMotif) ?? "flourish"} />}
                <StoryChapter chapter={c} reverse={i % 2 === 1} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </PageCanvas>
  );
}

function StoryChapter({ chapter, reverse }: { chapter: Chapter; reverse: boolean }) {
  const dateLabel = formatChapterDate(chapter.event_date);
  const motif = (chapter.illustration_motif as DecorMotif) ?? "flourish";

  return (
    <div className="grid items-center gap-block lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className={`flex justify-center ${reverse ? "lg:order-2" : "lg:order-1"}`}>
        <ThemedCard variant="veil" className="flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
          <DecorMotifArt motif={motif} size="lg" intensity={0.85} />
        </ThemedCard>
      </div>
      <ThemedCard
        variant="framed"
        ornament
        className={`${reverse ? "lg:order-1 animate-ds-reveal-right" : "lg:order-2 animate-ds-reveal-left"}`}
      >
        {chapter.chapter_label && <Badge tone="gold">{chapter.chapter_label}</Badge>}
        <h2 className="type-section-title mt-4">{chapter.title}</h2>
        {dateLabel && <p className="type-label mt-1">{dateLabel}</p>}
        <p className="type-body-lg mt-4 text-muted-foreground whitespace-pre-line">{chapter.body}</p>
      </ThemedCard>
    </div>
  );
}
