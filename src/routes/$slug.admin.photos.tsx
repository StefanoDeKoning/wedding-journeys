import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, CheckCircle2, EyeOff, Trash2, Eye, Camera } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import { signPhotoUrls } from "@/lib/photoUrl";

export const Route = createFileRoute("/$slug/admin/photos")({
  component: AdminPhotos,
});

interface Photo {
  id: string;
  uploader_name: string;
  storage_path: string;
  caption: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
  size_bytes: number;
}

function AdminPhotos() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "hidden">("all");

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select("id, uploader_name, storage_path, caption, status, created_at, size_bytes")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPhotos((data ?? []) as Photo[]);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const filtered = useMemo(
    () => (filter === "all" ? photos : photos.filter((p) => p.status === filter)),
    [photos, filter],
  );

  const moderate = async (p: Photo, status: Photo["status"]) => {
    const { error } = await supabase.from("photos").update({ status }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: status === "approved" ? "photo.approved" : "photo.hidden",
        targetType: "photo",
        targetId: p.id,
        details: { uploader: p.uploader_name },
      });
    }
    toast.success(status === "approved" ? "Approved" : "Hidden");
    void load();
  };

  const remove = async (p: Photo) => {
    if (!confirm("Delete this photo permanently?")) return;
    await supabase.storage.from("wedding-photos").remove([p.storage_path]);
    const { error } = await supabase.from("photos").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "photo.deleted",
        targetType: "photo",
        targetId: p.id,
        details: { uploader: p.uploader_name },
      });
    }
    toast.success("Deleted.");
    void load();
  };

  if (!wedding) return null;

  const counts = {
    all: photos.length,
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    hidden: photos.filter((p) => p.status === "hidden").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "hidden"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            {f} <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          <Camera className="w-6 h-6 mx-auto mb-2 opacity-40" />
          No photos {filter === "all" ? "yet" : `with status "${filter}"`}.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <figure
              key={p.id}
              className={`group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-soft ${
                p.status === "hidden" ? "opacity-60" : ""
              }`}
            >
              <img
                src={publicUrl(p.storage_path)}
                alt={p.caption ?? `By ${p.uploader_name}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-background/90 backdrop-blur text-foreground border border-border">
                {p.status}
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px]">
                <p className="truncate">{p.caption ?? `By ${p.uploader_name}`}</p>
                <p className="opacity-70 text-[10px]">{formatBytes(p.size_bytes)}</p>
              </figcaption>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {p.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => moderate(p, "approved")}
                    className="p-1.5 rounded-full bg-background/95 hover:bg-primary hover:text-primary-foreground"
                    title="Approve"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {p.status !== "hidden" ? (
                  <button
                    type="button"
                    onClick={() => moderate(p, "hidden")}
                    className="p-1.5 rounded-full bg-background/95 hover:bg-foreground hover:text-background"
                    title="Hide"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => moderate(p, "approved")}
                    className="p-1.5 rounded-full bg-background/95 hover:bg-primary hover:text-primary-foreground"
                    title="Show"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(p)}
                  className="p-1.5 rounded-full bg-background/95 hover:bg-destructive hover:text-destructive-foreground"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
