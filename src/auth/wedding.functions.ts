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
  errorField?: "email" | "password" | "slug" | "weddingName" | "form";
  wedding?: {
    id: string;
    slug: string;
    adminUrl: string;
    publicUrl: string;
  };
  /** Returned by createWeddingWithAccount so the client can sign in with the new credentials. */
  signIn?: {
    email: string;
  };
}

const SignupCredentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(100),
});

const CreateWeddingWithAccountInput = WeddingFieldsInput.merge(SignupCredentials);

/**
 * Atomic backend operation:
 *   1. Verify slug is free.
 *   2. Verify email is not already registered.
 *   3. Create the auth user (admin API).
 *   4. Create the wedding row.
 *   5. Insert the wedding_members row (primary_admin).
 *   6. On ANY failure, roll back everything that was already created.
 *
 * Returns ok:true ONLY when all steps committed.
 */
export const createWeddingWithAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateWeddingWithAccountInput.parse(input))
  .handler(async ({ data }): Promise<CreateWeddingResult> => {
    const admin = adminClient();

    // 1. Slug must be free.
    const { data: slugFree, error: slugErr } = await admin.rpc("is_slug_available", {
      _slug: data.slug,
    });
    if (slugErr) {
      console.error("[createWeddingWithAccount] slug check failed", slugErr);
      return { ok: false, error: "Could not verify the URL. Try again." };
    }
    if (!slugFree) {
      return {
        ok: false,
        errorField: "slug",
        error: "That URL was just taken. Pick another.",
      };
    }

    // 2. Email must not be registered.
    //    listUsers does not support a server-side email filter, but we can ask for
    //    a small page and filter — for our scale this is acceptable. For larger
    //    deployments swap to admin.getUserByEmail when available.
    try {
      const { data: existing, error: listErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listErr) {
        console.error("[createWeddingWithAccount] listUsers failed", listErr);
        return { ok: false, error: "Could not verify your email. Try again." };
      }
      const lower = data.email.toLowerCase();
      if (existing.users.some((u) => (u.email ?? "").toLowerCase() === lower)) {
        return {
          ok: false,
          errorField: "email",
          error:
            "An account with this email already exists. Sign in first, then create your wedding.",
        };
      }
    } catch (e) {
      console.error("[createWeddingWithAccount] email pre-check threw", e);
      return { ok: false, error: "Could not verify your email. Try again." };
    }

    // 3. Create the auth user (auto-confirmed so they can sign in immediately).
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (userErr || !created.user) {
      console.error("[createWeddingWithAccount] createUser failed", userErr);
      const msg = userErr?.message ?? "Could not create your account.";
      return {
        ok: false,
        errorField: /email/i.test(msg) ? "email" : "form",
        error: msg,
      };
    }
    const userId = created.user.id;

    // 4. Create the wedding row.
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
      console.error("[createWeddingWithAccount] wedding insert failed", wErr);
      // Rollback: delete the user.
      await admin.auth.admin.deleteUser(userId).catch((e) => {
        console.error("[createWeddingWithAccount] rollback deleteUser failed", e);
      });
      return {
        ok: false,
        errorField: /slug|url/i.test(wErr?.message ?? "") ? "slug" : "form",
        error: wErr?.message ?? "Could not create your wedding.",
      };
    }

    // 5. Insert primary_admin membership.
    const { error: mErr } = await admin.from("wedding_members").insert({
      wedding_id: wedding.id,
      user_id: userId,
      role: "primary_admin",
    });

    if (mErr) {
      console.error("[createWeddingWithAccount] member insert failed", mErr);
      // Rollback: delete wedding, then user.
      try {
        const { error: delWErr } = await admin.from("weddings").delete().eq("id", wedding.id);
        if (delWErr) console.error("[createWeddingWithAccount] rollback delete wedding failed", delWErr);
      } catch (e) {
        console.error("[createWeddingWithAccount] rollback delete wedding threw", e);
      }
      try {
        const { error: delUErr } = await admin.auth.admin.deleteUser(userId);
        if (delUErr) console.error("[createWeddingWithAccount] rollback deleteUser failed", delUErr);
      } catch (e) {
        console.error("[createWeddingWithAccount] rollback deleteUser threw", e);
      }
      return { ok: false, error: "Could not assign you as primary admin." };
    }

    // 6. Seed default todo tasks from templates (best-effort, non-blocking).
    try {
      const weddingDate = data.weddingDate ? new Date(data.weddingDate) : null;
      const { data: templates } = await admin
        .from("todo_templates")
        .select("id, title, description, category, relative_days_before, priority, position");
      if (templates && templates.length > 0) {
        const rows = templates.map((t) => {
          let deadline: string | null = null;
          if (weddingDate && t.relative_days_before != null) {
            const d = new Date(weddingDate);
            d.setDate(d.getDate() - t.relative_days_before);
            deadline = d.toISOString().slice(0, 10);
          }
          return {
            wedding_id: wedding.id,
            title: t.title,
            description: t.description,
            category: t.category,
            deadline,
            priority: t.priority,
            created_from_template: true,
            template_id: t.id,
            position: t.position,
          };
        });
        const { error: seedErr } = await admin.from("todo_tasks").insert(rows);
        if (seedErr) console.error("[createWeddingWithAccount] seed todos failed", seedErr);
      }
    } catch (e) {
      console.error("[createWeddingWithAccount] seed todos threw", e);
    }

    return {
      ok: true,
      wedding: {
        id: wedding.id,
        slug: wedding.slug,
        adminUrl: `/${wedding.slug}/admin`,
        publicUrl: `/${wedding.slug}`,
      },
      signIn: { email: data.email },
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
