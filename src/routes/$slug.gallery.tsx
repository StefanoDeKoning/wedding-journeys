import { createFileRoute } from "@tanstack/react-router";
import { Camera, Upload } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$slug/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery" },
      { name: "description", content: "Photos from the day." },
    ],
  }),
  component: GalleryPage,
});

// Mock placeholders — real upload + storage in a follow-up turn.
const tiles = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  rotate: ((i % 5) - 2) * 0.8,
}));

function GalleryPage() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  if (!wedding) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">the day in pictures</p>
        <h1 className="mt-2 font-display text-4xl">Gallery</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Share your photos with us — every angle, every smile. The couple
          curates the full album after the wedding.
        </p>
      </header>

      <div className="flex justify-center mb-10">
        <Button size="lg" disabled className="rounded-full h-12 px-8">
          <Upload className="w-4 h-4 mr-2" />
          Upload coming soon
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div
            key={t.id}
            className="aspect-square rounded-2xl border border-border bg-card shadow-soft overflow-hidden flex items-center justify-center text-muted-foreground transition-transform hover:scale-105"
            style={{ transform: `rotate(${t.rotate}deg)` }}
          >
            <Camera className="w-7 h-7" />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10">
        Once the couple opens uploads, photos you add here appear instantly for
        everyone.
      </p>
    </section>
  );
}
