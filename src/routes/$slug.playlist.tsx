import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Music,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Trophy,
  Heart,
} from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { TabGate } from "@/wedding/TabGate";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { safeHttpUrl } from "@/lib/safeUrl";
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  FormPanel,
  ThemedCard,
  ThemedButton,
  ThemedInput,
  Badge,
  Hero,
  EmptyState,
  ConfirmDialog,
} from "@/design-system";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$slug/playlist")({
  head: () => ({
    meta: [
      { title: "Song requests" },
      { name: "description", content: "Suggest or vote for a song for the dance floor." },
    ],
  }),
  component: () => (
    <TabGate feature="playlist">
      <PlaylistPage />
    </TabGate>
  ),
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
  const { wedding, guest, isAdmin } = useWeddingContext();
  const [songs, setSongs] = useState<Song[]>([]);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [spotify, setSpotify] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("playlist_songs")
      .select(
        "id, guest_id, submitted_by_name, title, artist, spotify_url, vote_count, created_at",
      )
      .eq("wedding_id", wedding.id)
      .order("vote_count", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setSongs((data ?? []) as Song[]);

    if (guest) {
      const { data: votes } = await supabase
        .from("playlist_votes")
        .select("song_id")
        .eq("guest_id", guest.id);
      setMyVotes((votes ?? []).map((v) => v.song_id as string));
    } else {
      setMyVotes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id, guest?.id]);

  const mySongCount = useMemo(
    () => (guest ? songs.filter((s) => s.guest_id === guest.id).length : 0),
    [songs, guest],
  );
  const used = mySongCount + myVotes.length;
  const remaining = Math.max(0, 3 - used);

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
      toast.error("You've used all 3 of your song requests.");
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

  const toggleVote = async (songId: string) => {
    if (!guest) {
      toast.error("Only guests can vote.");
      return;
    }
    const voted = myVotes.includes(songId);
    if (!voted && remaining <= 0) {
      toast.error("You've used all 3 of your song requests — remove a vote to free one up.");
      return;
    }
    setVotingId(songId);
    if (voted) {
      const { error } = await supabase
        .from("playlist_votes")
        .delete()
        .eq("song_id", songId)
        .eq("guest_id", guest.id);
      setVotingId(null);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Vote removed.");
    } else {
      const { error } = await supabase.from("playlist_votes").insert({
        wedding_id: wedding.id,
        song_id: songId,
        guest_id: guest.id,
      });
      setVotingId(null);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Voted!");
    }
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
    <PageCanvas density="regular">
      <Container width="prose">
        <Hero
          script="help us fill the floor"
          title="Song requests"
          subtitle={
            <>
              You have <span className="text-foreground font-medium">3 requests</span> in total —
              use them to suggest songs or to vote for songs other guests suggested.
            </>
          }
        />
      </Container>

      {guest && (
        <Section size="compact" width="prose">
          <FormPanel>
            <form onSubmit={add} className="space-y-4">
              <p className="type-caption">
                {remaining > 0
                  ? `${remaining} of 3 request${remaining === 1 ? "" : "s"} left`
                  : "You've used all 3 of your requests."}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Song title</Label>
                  <ThemedInput
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="At Last"
                    disabled={remaining <= 0}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="artist">Artist</Label>
                  <ThemedInput
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
                <Label htmlFor="spotify">Spotify link (optional)</Label>
                <ThemedInput
                  id="spotify"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="https://open.spotify.com/track/…"
                  disabled={remaining <= 0}
                  maxLength={500}
                />
              </div>
              <ThemedButton type="submit" size="lg" disabled={submitting || remaining <= 0} className="w-full">
                <Plus aria-hidden="true" className="w-4 h-4" /> Suggest this song
              </ThemedButton>
            </form>
          </FormPanel>
        </Section>
      )}

      <Section size="spacious" width="content">
        <SectionHeader
          eyebrow="vote for your favourites"
          title={`Top requests (${songs.length})`}
          align="center"
        />
        <div className="mt-block">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : songs.length === 0 ? (
            <EmptyState motif="music-note" title="No songs yet" description="Be the first to request one!" />
          ) : (
            <ThemedCard variant="veil">
              <div className="flex items-center gap-2 mb-4">
                <Trophy aria-hidden="true" className="w-4 h-4 text-primary" />
                <h2 className="type-card-title">Most wanted on the dance floor</h2>
              </div>
              <ol className="space-y-3">
                {songs.map((s, i) => {
                  const mine = guest && s.guest_id === guest.id;
                  const voted = myVotes.includes(s.id);
                  const canDelete = mine || isAdmin;
                  const link = safeHttpUrl(s.spotify_url);
                  return (
                    <li key={s.id}>
                      <ThemedCard className="flex items-center gap-3 sm:gap-4">
                        <span className="type-card-title text-primary w-6 shrink-0 text-center tabular-nums">
                          {i + 1}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-primary/12 hidden sm:flex items-center justify-center text-primary shrink-0">
                          <Music aria-hidden="true" className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{s.title}</p>
                          <p className="type-caption truncate">
                            {s.artist} · suggested by {s.submitted_by_name}
                            {mine && " · you"}
                          </p>
                        </div>
                        <Badge tone="primary">
                          {s.vote_count} {s.vote_count === 1 ? "vote" : "votes"}
                        </Badge>
                        {guest && (
                          <button
                            type="button"
                            onClick={() => void toggleVote(s.id)}
                            disabled={votingId === s.id || (!voted && remaining <= 0)}
                            aria-pressed={voted}
                            aria-label={voted ? "Remove your vote" : "Vote for this song"}
                            className={cn(
                              "rounded-full p-2 focus-ring-elegant transition-colors disabled:opacity-40",
                              voted
                                ? "text-primary bg-primary/12"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/8",
                            )}
                          >
                            {votingId === s.id ? (
                              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart
                                aria-hidden="true"
                                className={cn("w-4 h-4", voted && "fill-current")}
                              />
                            )}
                          </button>
                        )}
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary focus-ring-elegant rounded-full p-1"
                            aria-label="Open in Spotify"
                          >
                            <ExternalLink aria-hidden="true" className="w-4 h-4" />
                          </a>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(s.id)}
                            className="text-muted-foreground hover:text-destructive focus-ring-elegant rounded-full p-1"
                            aria-label="Remove"
                          >
                            <Trash2 aria-hidden="true" className="w-4 h-4" />
                          </button>
                        )}
                      </ThemedCard>
                    </li>
                  );
                })}
              </ol>
            </ThemedCard>
          )}
        </div>
      </Section>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Remove this song request?"
        onConfirm={() => {
          if (pendingDeleteId) void remove(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </PageCanvas>
  );
}
