import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Music, Trash2, ExternalLink, Trophy } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import { safeHttpUrl } from "@/lib/safeUrl";

export const Route = createFileRoute("/$slug/admin/playlist")({
  component: AdminPlaylist,
});

interface Song {
  id: string;
  guest_id: string | null;
  submitted_by_name: string;
  title: string;
  artist: string;
  spotify_url: string | null;
  vote_count: number;
  created_at: string;
}

function AdminPlaylist() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("playlist_songs")
      .select("id, guest_id, submitted_by_name, title, artist, spotify_url, vote_count, created_at")
      .eq("wedding_id", wedding.id)
      .order("vote_count", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setSongs((data ?? []) as Song[]);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const remove = async (s: Song) => {
    if (!confirm(`Remove "${s.title}" from the playlist?`)) return;
    const { error } = await supabase.from("playlist_songs").delete().eq("id", s.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "playlist.removed",
        targetType: "song",
        targetId: s.id,
        details: { title: s.title, artist: s.artist },
      });
    }
    toast.success("Removed.");
    void load();
  };

  if (!wedding) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">Guest playlist</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {songs.length} song{songs.length === 1 ? "" : "s"} suggested by your guests.
        </p>
      </section>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : songs.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No song requests yet.
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {songs.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="w-8 text-center text-sm font-display text-muted-foreground">
                {i === 0 ? <Trophy className="w-4 h-4 text-primary mx-auto" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {s.artist} · suggested by {s.submitted_by_name}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {s.vote_count} vote{s.vote_count === 1 ? "" : "s"}
              </span>
              {safeHttpUrl(s.spotify_url) && (
                <Button asChild variant="ghost" size="sm">
                  <a href={safeHttpUrl(s.spotify_url)} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(s)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
