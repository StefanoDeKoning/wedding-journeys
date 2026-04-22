import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, Loader2, Trash2 } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

function publicUrl(path: string): string {
  return supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;
}

function MyPhotosPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);
  const [photos, setPhotos] = useState<Photo[]>([]);
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
    setPhotos((data ?? []) as Photo[]);
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
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-display text-2xl">Sign in as a guest</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your personal photo page is only available when you're signed in with your
          invitation code.
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link to="/$slug/gallery" params={{ slug }}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to gallery
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <Link
        to="/$slug/gallery"
        params={{ slug }}
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to gallery
      </Link>

      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">your moments</p>
        <h1 className="mt-2 font-display text-4xl">
          {guest.first_name}'s photos
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Everything you've uploaded — visible only to you and the couple.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <Camera className="w-8 h-8 mx-auto text-muted-foreground opacity-40" />
          <p className="mt-3 text-sm text-muted-foreground">
            You haven't uploaded any photos yet.
          </p>
          <Button asChild className="mt-6 rounded-full bg-primary hover:bg-primary/90">
            <Link to="/$slug/gallery" params={{ slug }}>
              Upload your first photo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((p) => (
            <figure
              key={p.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-soft"
            >
              <img
                src={publicUrl(p.storage_path)}
                alt={p.caption ?? "Your photo"}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {p.status !== "approved" && (
                <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-background/90 backdrop-blur text-foreground border border-border">
                  {p.status}
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(p.id, p.storage_path)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/95 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
