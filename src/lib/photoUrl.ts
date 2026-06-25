import { supabase } from "@/integrations/supabase/client";

/**
 * Generate short-lived signed URLs for objects in the private `wedding-photos`
 * bucket. Returns a map keyed by storage path.
 */
export async function signPhotoUrls(
  paths: string[],
  expiresInSeconds = 60 * 60,
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter((p) => !!p)));
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage
    .from("wedding-photos")
    .createSignedUrls(unique, expiresInSeconds);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}
