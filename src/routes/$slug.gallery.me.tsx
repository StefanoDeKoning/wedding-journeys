import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { signPhotoUrls } from "@/lib/photoUrl";
import { PhotoTile } from "@/wedding/PhotoTile";
import {
  PageCanvas,
  Container,
  Section,
  ThemedCard,
  ThemedButton,
  Hero,
  EmptyState,
  ConfirmDialog,
} from "@/design-system";

export const Route = createFileRoute("/$slug/gallery/me")({
  head: () => ({
    meta: [
      { title: "My photos" },
      { name: "description", content: "Photos you uploaded to this wedding." },
    ],
  }),
  component: MyPhotosPage,
});

interface Photo {
  id: string;
  storage_path: string;
  caption: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
}

function MyPhotosPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWeddingContext();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; path: string } | null>(null);

  const load = async () => {
    if (!guest) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select("id, storage_path, caption, status, created_at")
      .eq("wedding_id", wedding.id)
      .eq("guest_id", guest.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const list = (data ?? []) as Photo[];
    setPhotos(list);
    setUrls(await signPhotoUrls(list.map((p) => p.storage_path)));
    setLoading(false);
  };

  useEffect(() => {
    if (guest) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id, guest?.id]);

  const remove = async (id: string, path: string) => {
    await supabase.storage.from("wedding-photos").remove([path]);
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted.");
    void load();
  };

  if (!guest) {
    return (
      <PageCanvas density="quiet">
        <Section size="hero" width="prose">
          <ThemedCard className="text-center">
            <h1 className="type-section-title">Sign in as a guest</h1>
            <p className="type-body mt-2 text-muted-foreground">
              Your personal photo page is only available when you're signed in with your
              invitation code.
            </p>
            <ThemedButton asChild variant="secondary" className="mt-6">
              <Link to="/$slug/gallery" params={{ slug }}>
                <ArrowLeft aria-hidden="true" className="w-4 h-4" /> Back to gallery
              </Link>
            </ThemedButton>
          </ThemedCard>
        </Section>
      </PageCanvas>
    );
  }

  return (
    <PageCanvas density="regular">
      <Section size="compact" width="wide">
        <Link
          to="/$slug/gallery"
          params={{ slug }}
          className="type-caption inline-flex items-center hover-gild focus-ring-elegant"
        >
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5 mr-1" /> Back to gallery
        </Link>
      </Section>

      <Container width="wide">
        <Hero
          script="your moments"
          title={`${guest.first_name}'s photos`}
          subtitle="Everything you've uploaded — visible only to you and the couple."
        />
      </Container>

      <Section size="spacious" width="wide">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            motif="gold-leaf"
            title="You haven't uploaded any photos yet"
            description="Share a moment from the day — it'll appear here."
            action={
              <ThemedButton asChild>
                <Link to="/$slug/gallery" params={{ slug }}>
                  Upload your first photo
                </Link>
              </ThemedButton>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((p) => (
              <PhotoTile
                key={p.id}
                photo={p}
                url={urls[p.storage_path] ?? ""}
                canDelete
                onDelete={() => setPendingDelete({ id: p.id, path: p.storage_path })}
              />
            ))}
          </div>
        )}
      </Section>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this photo?"
        description="This removes it permanently — it can't be undone."
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete.id, pendingDelete.path);
          setPendingDelete(null);
        }}
      />
    </PageCanvas>
  );
}
