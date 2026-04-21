import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Music, Plus, Trash2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/$slug/playlist")({
  head: () => ({
    meta: [
      { title: "Playlist" },
      { name: "description", content: "Suggest a song for the dance floor." },
    ],
  }),
  component: PlaylistPage,
});

interface Track {
  id: string;
  title: string;
  artist: string;
  by: string;
}

const initial: Track[] = [
  { id: "1", title: "At Last", artist: "Etta James", by: "Sophie" },
  { id: "2", title: "Dancing in the Moonlight", artist: "Toploader", by: "Marie" },
  { id: "3", title: "Valerie", artist: "Mark Ronson & Amy Winehouse", by: "Thomas" },
  { id: "4", title: "Marry You", artist: "Bruno Mars", by: "Jan" },
];

function PlaylistPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);
  const [tracks, setTracks] = useState<Track[]>(initial);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  if (!wedding) return null;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;
    setTracks((t) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        artist: artist.trim(),
        by: guest?.first_name ?? "Guest",
      },
      ...t,
    ]);
    setTitle("");
    setArtist("");
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">help us fill the floor</p>
        <h1 className="mt-2 font-display text-4xl">Playlist requests</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Drop a song you'd love to hear. The couple curates the final list.
        </p>
      </header>

      <form
        onSubmit={add}
        className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft mb-8 space-y-3"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
          />
          <Input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist"
          />
        </div>
        <Button
          type="submit"
          className="w-full rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Suggest this song
        </Button>
      </form>

      <ul className="space-y-2">
        {tracks.map((t) => {
          const mine = t.by === guest?.first_name;
          return (
            <li
              key={t.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t.artist} · suggested by {t.by}
                </p>
              </div>
              {mine && (
                <button
                  type="button"
                  onClick={() => setTracks((ts) => ts.filter((x) => x.id !== t.id))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
