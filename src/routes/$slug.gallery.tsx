import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Loader2, QrCode, User, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signPhotoUrls } from "@/lib/photoUrl";
import { PhotoTile, type GalleryPhoto } from "@/wedding/PhotoTile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  FormPanel,
  ThemedButton,
  ThemedInput,
  Hero,
  EmptyState,
  ConfirmDialog,
} from "@/design-system";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export const Route = createFileRoute("/$slug/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery" },
      { name: "description", content: "Photos from the day." },
    ],
  }),
  component: GalleryPage,
});

interface Photo {
  id: string;
  guest_id: string | null;
  uploader_name: string;
  storage_path: string;
  caption: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
  size_bytes: number;
}

function GalleryPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWeddingContext();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; path: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select(
        "id, guest_id, uploader_name, storage_path, caption, status, created_at, size_bytes",
      )
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const list = (data ?? []) as Photo[];
    setPhotos(list);
    setUrls(await signPhotoUrls(list.map((p) => p.storage_path)));
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.id]);

  // Upload window: from ceremony start until +48h after reception (or ceremony)
  const uploadWindow = useMemo(() => {
    const now = Date.now();
    const start = wedding.ceremony_at ? new Date(wedding.ceremony_at).getTime() : null;
    const endRef = wedding.reception_at ?? wedding.ceremony_at;
    const end = endRef ? new Date(endRef).getTime() + 48 * 3600 * 1000 : null;
    if (!start || !end) return { open: true, label: "" };
    if (now < start)
      return {
        open: true,
        label: "Uploads open during the wedding and for 48h after.",
      };
    if (now > end)
      return {
        open: true,
        label: "The 48-hour upload window has passed — late uploads still welcome.",
      };
    return { open: true, label: "Uploads are open right now — share away!" };
  }, [wedding.ceremony_at, wedding.reception_at]);

  const visiblePhotos = useMemo(() => {
    return photos.filter((p) => p.status === "approved" || p.guest_id === guest?.id);
  }, [photos, guest?.id]);

  const viewPhoto = viewId ? (visiblePhotos.find((p) => p.id === viewId) ?? null) : null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!guest) {
      toast.error("Only signed-in guests can upload photos.");
      return;
    }

    setUploading(true);
    let uploaded = 0;
    let failed = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: only image files are allowed.`);
        failed++;
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: exceeds 20MB limit.`);
        failed++;
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const path = `${wedding.id}/${guest.id}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from("wedding-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (upErr) {
        toast.error(`${file.name}: ${upErr.message}`);
        failed++;
        continue;
      }
      const { error: dbErr } = await supabase.from("photos").insert({
        wedding_id: wedding.id,
        guest_id: guest.id,
        uploader_name: `${guest.first_name} ${guest.last_name}`,
        storage_path: path,
        caption: caption.trim() || null,
        size_bytes: file.size,
        status: "approved",
      });
      if (dbErr) {
        toast.error(`${file.name}: ${dbErr.message}`);
        failed++;
        continue;
      }
      uploaded++;
    }

    setUploading(false);
    setCaption("");
    if (fileInput.current) fileInput.current.value = "";
    if (uploaded > 0) {
      toast.success(`${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded!`);
      void load();
    }
    if (failed > 0 && uploaded === 0) {
      toast.error("No photos uploaded.");
    }
  };

  const remove = async (id: string, path: string) => {
    const { error: stErr } = await supabase.storage
      .from("wedding-photos")
      .remove([path]);
    if (stErr) {
      // Continue anyway to clean up DB
      console.warn("Storage delete failed:", stErr.message);
    }
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted.");
    void load();
  };

  const uploadUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}/gallery`
      : `/${slug}/gallery`;

  return (
    <PageCanvas density="regular">
      <Container width="prose">
        <Hero
          script="the day in pictures"
          title="Gallery"
          subtitle="Share your photos with us — every angle, every smile."
          extra={
            uploadWindow.label && <p className="type-caption text-center italic">{uploadWindow.label}</p>
          }
        />
      </Container>

      <Section size="compact" width="content">
        <FormPanel>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1 space-y-2">
              <ThemedInput
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add an optional caption…"
                maxLength={200}
                disabled={!guest || uploading}
              />
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <ThemedButton
                onClick={() => fileInput.current?.click()}
                disabled={!guest || uploading}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload photos (max 20MB each)
                  </>
                )}
              </ThemedButton>
            </div>
            <div className="flex gap-2">
              <ThemedButton variant="secondary" onClick={() => setQrOpen(true)}>
                <QrCode className="w-4 h-4" />
                QR code
              </ThemedButton>
              {guest && (
                <ThemedButton variant="secondary" asChild>
                  <Link to="/$slug/gallery/me" params={{ slug }}>
                    <User className="w-4 h-4" />
                    My photos
                  </Link>
                </ThemedButton>
              )}
            </div>
          </div>
          {!guest && (
            <p className="mt-3 type-caption text-center">
              Sign in as a guest to upload your own photos.
            </p>
          )}
        </FormPanel>
      </Section>

      <Section size="spacious" width="wide">
        <SectionHeader eyebrow="every angle" title="Moments captured" align="center" />
        <div className="mt-block">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : visiblePhotos.length === 0 ? (
            <EmptyState
              motif="gold-leaf"
              title="No photos yet"
              description="Be the first to share a moment from the day."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {visiblePhotos.map((p) => (
                <PhotoTile
                  key={p.id}
                  photo={p}
                  url={urls[p.storage_path] ?? ""}
                  canDelete={!!(guest && p.guest_id === guest.id)}
                  onView={() => setViewId(p.id)}
                  onDelete={() => setPendingDelete({ id: p.id, path: p.storage_path })}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* QR dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan to upload photos</DialogTitle>
            <DialogDescription>
              Show this QR code at the wedding so guests can jump straight to the
              upload page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* White background kept literal (not a token) — required for QR scan contrast regardless of theme. */}
            <div className="p-4 rounded-card bg-white">
              <QRCodeSVG value={uploadUrl} size={220} level="M" />
            </div>
            <a
              href={uploadUrl}
              target="_blank"
              rel="noreferrer"
              className="type-caption text-primary hover-gild focus-ring-elegant inline-flex items-center gap-1"
            >
              {uploadUrl}
              <ExternalLink aria-hidden="true" className="w-3 h-3" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!viewPhoto} onOpenChange={(open) => !open && setViewId(null)}>
        <DialogContent className="max-w-3xl p-2 sm:p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>{viewPhoto?.caption ?? "Photo"}</DialogTitle>
            <DialogDescription>Full-size photo</DialogDescription>
          </DialogHeader>
          {viewPhoto && (
            <figure>
              <img
                src={urls[viewPhoto.storage_path] ?? ""}
                alt={viewPhoto.caption ?? `Photo by ${viewPhoto.uploader_name}`}
                className="max-h-[75vh] w-full rounded-card object-contain"
              />
              {viewPhoto.caption && (
                <figcaption className="type-caption mt-2 text-center text-muted-foreground">
                  {viewPhoto.caption} — {viewPhoto.uploader_name}
                </figcaption>
              )}
            </figure>
          )}
        </DialogContent>
      </Dialog>

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
