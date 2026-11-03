import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { TabGate } from "@/wedding/TabGate";
import { supabase } from "@/integrations/supabase/client";
import {
  PageCanvas,
  Section,
  ThemedCard,
  Divider,
  Badge,
  PageHero,
  EmptyState,
} from "@/design-system";
import { DecorMotifArt } from "@/design-system/decor/Illustrations";
import { resolveStoryImages } from "@/wedding/storyImage";
import type { DecorMotif } from "@/theme/types";
import { tHead, useI18n, useT } from "@/i18n";

export const Route = createFileRoute("/$slug/story")({
  head: () => ({
    meta: [
      { title: tHead("Our Story") },
      { name: "description", content: tHead("How it all began.") },
    ],
  }),
  component: () => (
    <TabGate feature="story">
      <StoryPage />
    </TabGate>
  ),
});

interface Chapter {
  id: string;
  position: number;
  chapter_label: string | null;
  title: string;
  body: string;
  event_date: string | null;
  illustration_motif: string | null;
  image_url: string | null;
}

function formatChapterDate(iso: string | null, locale: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

function StoryPage() {
  const { wedding } = useWeddingContext();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("story_chapters")
        .select("id, position, chapter_label, title, body, event_date, illustration_motif, image_url")
        .eq("wedding_id", wedding.id)
        .order("position");
      const rows = (data ?? []) as Chapter[];
      if (!cancelled) {
        setChapters(rows);
        setLoading(false);
      }
      const resolved = await resolveStoryImages(rows.map((r) => r.image_url));
      if (!cancelled) setImages(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [wedding.id]);

  return (
    <PageCanvas density="regular">
      <PageHero
        script={t("before happily ever after")}
        title={t("Our story")}
        subtitle={t("Every love story is beautiful, but ours is our favourite.")}
      />

      {loading ? (
        <Section size="compact">
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        </Section>
      ) : chapters.length === 0 ? (
        <Section size="compact">
          <EmptyState
            motif="flourish"
            title={t("The story is being written")}
            description={t("Check back soon — the couple is still adding chapters.")}
          />
        </Section>
      ) : (
        <Section size="spacious" width="wide">
          <div className="flex flex-col gap-section">
            {chapters.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <Divider motif={(c.illustration_motif as DecorMotif) ?? "flourish"} />}
                <StoryChapter chapter={c} imageSrc={c.image_url ? images[c.image_url] : undefined} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </PageCanvas>
  );
}

function StoryChapter({ chapter, imageSrc }: { chapter: Chapter; imageSrc?: string }) {
  const { locale } = useI18n();
  const dateLabel = formatChapterDate(chapter.event_date, locale);
  const motif = (chapter.illustration_motif as DecorMotif) ?? "flourish";

  return (
    <article className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <div className="w-full animate-ds-reveal-up">
        {imageSrc ? (
          <ThemedCard variant="veil" className="overflow-hidden p-0">
            <img
              src={imageSrc}
              alt={chapter.title}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </ThemedCard>
        ) : (
          <ThemedCard variant="veil" className="flex items-center justify-center py-12">
            <DecorMotifArt motif={motif} size="lg" intensity={0.85} />
          </ThemedCard>
        )}
      </div>

      <ThemedCard variant="framed" ornament className="mt-block w-full animate-ds-reveal-up">
        {chapter.chapter_label && <Badge tone="gold">{chapter.chapter_label}</Badge>}
        <h2 className="type-section-title mt-4">{chapter.title}</h2>
        {dateLabel && <p className="type-label mt-1">{dateLabel}</p>}
        <p className="type-body-lg mt-4 text-muted-foreground whitespace-pre-line text-left">
          {chapter.body}
        </p>
      </ThemedCard>
    </article>
  );
}
