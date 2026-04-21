import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SlugInput = z.object({
  slug: z.string().trim().toLowerCase().min(3).max(60).regex(slugRegex),
});

function adminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export interface PublicWedding {
  id: string;
  slug: string;
  wedding_name: string | null;
  bride_name: string | null;
  groom_name: string | null;
  wedding_date: string | null;
  ceremony_at: string | null;
  reception_at: string | null;
  location_name: string | null;
  location_address: string | null;
  maps_url: string | null;
  invitation_message: string | null;
  rsvp_deadline: string | null;
  status: "draft" | "published";
}

/**
 * Returns the wedding by slug if it is published, OR if the caller is its admin/guest.
 * For draft weddings we still return them when the caller's JWT proves access — that
 * lookup happens client-side via the user's authenticated supabase client.
 *
 * This server fn uses the admin client and only returns published weddings.
 * Drafts must be fetched via the client (RLS will gate them).
 */
export const getPublishedWedding = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SlugInput.parse(input))
  .handler(async ({ data }): Promise<{ wedding: PublicWedding | null }> => {
    const admin = adminClient();
    const { data: row, error } = await admin
      .from("weddings")
      .select(
        "id, slug, wedding_name, bride_name, groom_name, wedding_date, ceremony_at, reception_at, location_name, location_address, maps_url, invitation_message, rsvp_deadline, status",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error("Could not load wedding.");
    return { wedding: (row as PublicWedding | null) ?? null };
  });
