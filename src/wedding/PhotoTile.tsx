import { Clock, EyeOff, Trash2 } from "lucide-react";
import { MediaCard } from "@/design-system";

export interface GalleryPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  status: "pending" | "approved" | "hidden";
  uploader_name?: string;
}

/**
 * Shared gallery tile — used by both the main gallery and "my photos" so the
 * two pages don't drift (the caption overlay was previously missing on one).
 */
export function PhotoTile({
  photo,
  url,
  canDelete = false,
  onView,
  onDelete,
}: {
  photo: GalleryPhoto;
  url: string;
  canDelete?: boolean;
  onView?: () => void;
  onDelete?: () => void;
}) {
  const caption = photo.caption ?? (photo.uploader_name ? `By ${photo.uploader_name}` : undefined);

  return (
    <MediaCard
      src={url}
      alt={photo.caption ?? (photo.uploader_name ? `Photo by ${photo.uploader_name}` : "Wedding photo")}
      onClick={onView}
      className={photo.status === "hidden" ? "opacity-50" : undefined}
      caption={caption}
      badge={
        photo.status !== "approved" ? (
          <span className="surface-veil inline-flex items-center gap-1 px-2 py-0.5 type-caption">
            {photo.status === "pending" ? (
              <Clock aria-hidden="true" className="w-2.5 h-2.5" />
            ) : (
              <EyeOff aria-hidden="true" className="w-2.5 h-2.5" />
            )}
            {photo.status}
          </span>
        ) : undefined
      }
      overlay={
        canDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/95 shadow-elev-1 hover:bg-destructive hover:text-destructive-foreground focus-ring-elegant"
            aria-label="Delete photo"
            title="Delete"
          >
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
    />
  );
}
