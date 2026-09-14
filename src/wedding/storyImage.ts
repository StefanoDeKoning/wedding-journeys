import { supabase } from "@/integrations/supabase/client";

export const STORY_BUCKET = "story-images";

/**
 * Chapter images are stored either as a storage path inside the private
 * story-images bucket, or as an external https URL. Resolve both to a
 * displayable src.
 */
export async function resolveStoryImage(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data } = await supabase.storage.from(STORY_BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function resolveStoryImages(
  values: (string | null)[],
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  await Promise.all(
    values.map(async (v) => {
      if (!v) return;
      const url = await resolveStoryImage(v);
      if (url) map[v] = url;
    }),
  );
  return map;
}

export async function uploadStoryImage(weddingId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${weddingId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(STORY_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return path;
}

export async function removeStoryImage(value: string | null) {
  if (!value || /^https?:\/\//i.test(value)) return;
  await supabase.storage.from(STORY_BUCKET).remove([value]);
}
