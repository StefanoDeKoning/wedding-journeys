import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Loader2, Trash2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { signPhotoUrls } from "@/lib/photoUrl";
import { PageCanvas, Section, ThemedCard, ThemedButton } from "@/design-system";

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
  const { wedding, guest } = useWedding(slug);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!wedding || !guest) return;
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
    if (wedding && guest) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id, guest?.id]);

  const remove = async (id: string, path: string) => {
    if (!confirm("Delete this photo permanently?")) return;
    await supabase.storage.from("wedding-photos").remove([path]);
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted.");
    void load();
  };

  if (!wedding) return null;

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
                <ArrowLeft className="w-4 h-4" /> Back to gallery
              </Link>
            </ThemedButton>
          </ThemedCard>
        </Section>
      </PageCanvas>
    );
  }

  return (
    <PageCanvas density="regular">
      <Section size="hero" width="wide">
        <Link
          to="/$slug/gallery"
          params={{ slug }}
          className="type-caption inline-flex items-center hover-gild"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to gallery
        </Link>

        <div className="mt-stack flex flex-col items-center gap-stack text-center">
          <p className="type-script animate-ds-fade">your moments</p>
          <h1 className="type-hero animate-ds-reveal">{guest.first_name}'s photos</h1>
          <p className="type-body text-muted-foreground animate-ds-reveal" style={{ animationDelay: "120ms" }}>
            Everything you've uploaded — visible only to you and the couple.
          </p>
        </div>
      </Section>

      <Section size="spacious" width="wide">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-block rounded-card border-2 border-dashed border-primary/20">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
            <p className="mt-3 type-body text-muted-foreground">
              You haven't uploaded any photos yet.
            </p>
            <ThemedButton asChild className="mt-6">
              <Link to="/$slug/gallery" params={{ slug }}>
                Upload your first photo
              </Link>
            </ThemedButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="group relative aspect-square overflow-hidden rounded-card border-paper shadow-elev-2 hover-lift bg-muted"
              >
                <img
                  src={urls[p.storage_path] ?? ""}
                  alt={p.caption ?? "Your photo"}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-paper)] group-hover:scale-[1.04]"
                />
                {p.status !== "approved" && (
                  <div className="absolute top-2 left-2 type-caption px-2 py-0.5 rounded-full bg-background/90 backdrop-blur border-paper">
                    {p.status}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(p.id, p.storage_path)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/95 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity focus-ring-elegant"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </figure>
            ))}
          </div>
        )}
      </Section>
    </PageCanvas>
  );
}
