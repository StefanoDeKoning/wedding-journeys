import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Trophy,
} from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$slug/playlist")({
  head: () => ({
    meta: [
      { title: "Playlist" },
      { name: "description", content: "Suggest a song for the dance floor." },
    ],
  }),
  component: PlaylistPage,
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

function PlaylistPage() {
  const { slug } = Route.useParams();
  const { wedding, guest, isAdmin } = useWedding(slug);
  void isAdmin;
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [spotify, setSpotify] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("playlist_songs")
      .select(
        "id, guest_id, submitted_by_name, title, artist, spotify_url, vote_count, created_at",
      )
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setSongs((data ?? []) as Song[]);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const myCount = useMemo(
    () => (guest ? songs.filter((s) => s.guest_id === guest.id).length : 0),
    [songs, guest],
  );
  const remaining = Math.max(0, 3 - myCount);

  const top = useMemo(
    () =>
      [...songs]
        .sort((a, b) => b.vote_count - a.vote_count)
        .slice(0, 5)
        .filter((s) => s.vote_count > 0),
    [songs],
  );

  if (!wedding) return null;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) {
      toast.error("Only guests can submit songs.");
      return;
    }
    if (!title.trim() || !artist.trim()) {
      toast.error("Song title and artist are required.");
      return;
    }
    if (remaining <= 0) {
      toast.error("You've reached the 3-song limit.");
      return;
    }
    if (spotify.trim() && !/^https?:\/\/(open\.)?spotify\.com\//i.test(spotify.trim())) {
      toast.error("Spotify link must start with https://open.spotify.com/");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("playlist_songs").insert({
      wedding_id: wedding.id,
      guest_id: guest.id,
      submitted_by_name: guest.first_name,
      title: title.trim().slice(0, 200),
      artist: artist.trim().slice(0, 200),
      spotify_url: spotify.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setArtist("");
    setSpotify("");
    toast.success("Song added to the request list!");
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("playlist_songs").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed.");
    void load();
  };


  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">help us fill the floor</p>
        <h1 className="mt-2 font-display text-4xl">Playlist requests</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Drop up to <span className="text-foreground font-medium">3 songs</span> you'd
          love to hear. The couple curates the final list.
        </p>
      </header>

      {/* Top requests */}
      {top.length > 0 && (
        <div className="rounded-[1.5rem] border border-primary/30 bg-primary/5 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg">Top requests</h2>
          </div>
          <ol className="space-y-2">
            {top.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span className="font-display text-primary w-5 text-center">
                  {i + 1}
                </span>
                <span className="flex-1 truncate">
                  <span className="font-medium">{s.title}</span>{" "}
                  <span className="text-muted-foreground">— {s.artist}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {s.vote_count} {s.vote_count === 1 ? "vote" : "votes"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Guest submission form */}
      {guest && (
        <form
          onSubmit={add}
          className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft mb-8 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {remaining > 0
                ? `${remaining} of 3 song${remaining === 1 ? "" : "s"} left`
                : "You've used all 3 of your song requests."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">
                Song title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="At Last"
                disabled={remaining <= 0}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artist" className="text-xs">
                Artist
              </Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Etta James"
                disabled={remaining <= 0}
                maxLength={200}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spotify" className="text-xs">
              Spotify link (optional)
            </Label>
            <Input
              id="spotify"
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
              placeholder="https://open.spotify.com/track/…"
              disabled={remaining <= 0}
              maxLength={500}
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || remaining <= 0}
            className="w-full rounded-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Suggest this song
          </Button>
        </form>
      )}


      {/* All songs */}
      <div>
        <h2 className="font-display text-lg mb-3">All requests ({songs.length})</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground rounded-xl border border-dashed border-border">
            No songs yet — be the first!
          </div>
        ) : (
          <ul className="space-y-2">
            {songs.map((s) => {
              const mine = guest && s.guest_id === guest.id;
              const canDelete = mine || isAdmin;
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.artist} · suggested by {s.submitted_by_name}
                      {mine && " · you"}
                    </p>
                  </div>
                  {safeHttpUrl(s.spotify_url) && (
                    <a
                      href={safeHttpUrl(s.spotify_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary"
                      aria-label="Open in Spotify"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
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
        )}
      </div>
    </section>
  );
}
