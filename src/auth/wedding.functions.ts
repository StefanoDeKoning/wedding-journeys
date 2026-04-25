import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ---------- Slug helpers ----------

const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SlugInput = z.object({
  slug: z.string().trim().toLowerCase().min(3).max(60).regex(slugRegex),
});

function adminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Public: check whether a slug is available (true = free).
 * Uses the SECURITY DEFINER `is_slug_available` RPC so we don't leak rows.
 */
export const checkSlugAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SlugInput.parse(input))
  .handler(async ({ data }): Promise<{ available: boolean; slug: string }> => {
    const admin = adminClient();
    const { data: result, error } = await admin.rpc("is_slug_available", {
      _slug: data.slug,
    });
    if (error) {
      throw new Error("Could not check slug. Try again.");
    }
    return { available: !!result, slug: data.slug };
  });

/**
 * Suggest 3-5 alternative slugs given a base slug, year, and a few suffixes.
 * Returns slugs that are confirmed available.
 */
export const suggestSlugs = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        base: z.string().trim().toLowerCase().min(1).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<{ suggestions: string[] }> => {
    const admin = adminClient();
    const year = new Date().getFullYear();
    const candidates = [
      `${data.base}-${year + 1}`,
      `${data.base}-${year}`,
      `${data.base}-wedding`,
      `${data.base}-nl`,
      `${data.base}-day`,
      `${data.base}-forever`,
    ]
      .map((s) => s.replace(/--+/g, "-").replace(/^-|-$/g, ""))
      .filter((s) => slugRegex.test(s) && s.length >= 3 && s.length <= 60);

    const suggestions: string[] = [];
    for (const candidate of candidates) {
      if (suggestions.length >= 4) break;
      const { data: ok } = await admin.rpc("is_slug_available", { _slug: candidate });
      if (ok) suggestions.push(candidate);
    }
    return { suggestions };
  });

// ---------- Create wedding ----------

const WeddingFieldsInput = z.object({
  weddingName: z.string().trim().min(2).max(120),
  brideName: z.string().trim().min(1).max(80),
  groomName: z.string().trim().min(1).max(80),
  weddingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  locationName: z.string().trim().max(200).optional().or(z.literal("")),
  locationAddress: z.string().trim().max(400).optional().or(z.literal("")),
  mapsUrl: z
    .string()
    .trim()
    .max(500)
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  slug: z.string().trim().toLowerCase().min(3).max(60).regex(slugRegex),
  rsvpDeadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
});

export interface CreateWeddingResult {
  ok: boolean;
  error?: string;
  wedding?: {
    id: string;
    slug: string;
    adminUrl: string;
    publicUrl: string;
  };
}

export const createWedding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateWeddingInput.parse(input))
  .handler(async ({ data, context }): Promise<CreateWeddingResult> => {
    const userId = context.userId;
    const admin = adminClient();

    // Re-check slug atomically.
    const { data: free, error: rpcErr } = await admin.rpc("is_slug_available", {
      _slug: data.slug,
    });
    if (rpcErr) return { ok: false, error: "Could not verify slug." };
    if (!free) return { ok: false, error: "That URL was just taken. Pick another." };

    // Insert wedding (status defaults to 'draft').
    const { data: wedding, error: wErr } = await admin
      .from("weddings")
      .insert({
        slug: data.slug,
        wedding_name: data.weddingName,
        bride_name: data.brideName,
        groom_name: data.groomName,
        couple_name_one: data.brideName,
        couple_name_two: data.groomName,
        wedding_date: data.weddingDate ? data.weddingDate : null,
        location_name: data.locationName || null,
        location_address: data.locationAddress || null,
        maps_url: data.mapsUrl || null,
        rsvp_deadline: data.rsvpDeadline ? `${data.rsvpDeadline}T23:59:59Z` : null,
        primary_admin_id: userId,
        is_public: true,
      })
      .select("id, slug")
      .single();

    if (wErr || !wedding) {
      return { ok: false, error: wErr?.message ?? "Could not create the wedding." };
    }

    // Add primary_admin membership.
    const { error: mErr } = await admin
      .from("wedding_members")
      .insert({
        wedding_id: wedding.id,
        user_id: userId,
        role: "primary_admin",
      });

    if (mErr) {
      // Best effort cleanup
      await admin.from("weddings").delete().eq("id", wedding.id);
      return { ok: false, error: "Could not assign you as primary admin." };
    }

    return {
      ok: true,
      wedding: {
        id: wedding.id,
        slug: wedding.slug,
        adminUrl: `/${wedding.slug}/admin`,
        publicUrl: `/${wedding.slug}`,
      },
    };
  });

// ---------- Publish toggle ----------

export const setWeddingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        weddingId: z.string().uuid(),
        status: z.enum(["draft", "published"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // RLS ensures only admins can update.
    const { error } = await supabase
      .from("weddings")
      .update({ status: data.status })
      .eq("id", data.weddingId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
