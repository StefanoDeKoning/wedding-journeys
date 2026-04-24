import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Bootstrap the very first platform owner.
 *
 * Auth: requires a signed-in user. The handler refuses to run unless the
 * `user_roles` table currently has zero `platform_owner` rows — making this a
 * one-shot self-claim flow. After the first owner exists, only existing owners
 * can grant the role to others (via RLS on the `user_roles` table).
 */
export const claimPlatformOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true } | { ok: false; reason: string }> => {
    const userId = context.userId;

    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "platform_owner");
    if (countErr) {
      return { ok: false, reason: countErr.message };
    }
    if ((count ?? 0) > 0) {
      return { ok: false, reason: "A platform owner already exists." };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "platform_owner" });
    if (error) {
      return { ok: false, reason: error.message };
    }
    return { ok: true };
  });

/**
 * Whether bootstrap is still available (no platform owner exists yet).
 * Public — callable without auth so the bootstrap CTA can show on /login.
 */
export const isPlatformOwnerBootstrapAvailable = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ available: boolean }> => {
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "platform_owner");
    if (error) return { available: false };
    return { available: (count ?? 0) === 0 };
  },
);

export interface PlatformWeddingSummary {
  id: string;
  slug: string;
  wedding_name: string | null;
  status: string;
  wedding_date: string | null;
  created_at: string;
  guest_count: number;
  rsvp_yes_count: number;
  photo_count: number;
  storage_bytes: number;
  storage_limit_bytes: number;
}

export interface PlatformOverview {
  totals: {
    weddings: number;
    published: number;
    guests: number;
    rsvp_yes: number;
    photos: number;
    storage_bytes: number;
  };
  weddings: PlatformWeddingSummary[];
  recentAudit: Array<{
    id: string;
    wedding_id: string;
    wedding_slug: string | null;
    wedding_name: string | null;
    actor_label: string | null;
    action: string;
    target_type: string | null;
    created_at: string;
  }>;
}

/**
 * Aggregate platform-wide stats for the platform owner dashboard.
 * Authorisation: caller must be a platform_owner.
 */
export const getPlatformOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlatformOverview> => {
    // Verify caller is a platform owner.
    const { data: roleRows, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "platform_owner")
      .limit(1);
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRows || roleRows.length === 0) {
      throw new Error("Forbidden: platform_owner role required.");
    }

    const [weddingsRes, guestsRes, rsvpRes, photosRes] = await Promise.all([
      supabaseAdmin
        .from("weddings")
        .select(
          "id, slug, wedding_name, status, wedding_date, created_at, storage_limit_bytes",
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("guests").select("wedding_id"),
      supabaseAdmin.from("rsvp_responses").select("wedding_id, status"),
      supabaseAdmin.from("photos").select("wedding_id, size_bytes"),
    ]);

    if (weddingsRes.error) throw new Error(weddingsRes.error.message);

    const weddings = weddingsRes.data ?? [];
    const guestCounts = new Map<string, number>();
    for (const g of guestsRes.data ?? []) {
      guestCounts.set(g.wedding_id, (guestCounts.get(g.wedding_id) ?? 0) + 1);
    }
    const rsvpYesCounts = new Map<string, number>();
    for (const r of rsvpRes.data ?? []) {
      if (r.status === "yes") {
        rsvpYesCounts.set(r.wedding_id, (rsvpYesCounts.get(r.wedding_id) ?? 0) + 1);
      }
    }
    const photoCounts = new Map<string, number>();
    const storageBytes = new Map<string, number>();
    for (const p of photosRes.data ?? []) {
      photoCounts.set(p.wedding_id, (photoCounts.get(p.wedding_id) ?? 0) + 1);
      storageBytes.set(
        p.wedding_id,
        (storageBytes.get(p.wedding_id) ?? 0) + (p.size_bytes ?? 0),
      );
    }

    const summaries: PlatformWeddingSummary[] = weddings.map((w) => ({
      id: w.id,
      slug: w.slug,
      wedding_name: w.wedding_name,
      status: w.status as string,
      wedding_date: w.wedding_date,
      created_at: w.created_at,
      guest_count: guestCounts.get(w.id) ?? 0,
      rsvp_yes_count: rsvpYesCounts.get(w.id) ?? 0,
      photo_count: photoCounts.get(w.id) ?? 0,
      storage_bytes: storageBytes.get(w.id) ?? 0,
      storage_limit_bytes: Number(w.storage_limit_bytes ?? 0),
    }));

    const totals = {
      weddings: summaries.length,
      published: summaries.filter((s) => s.status === "published").length,
      guests: summaries.reduce((acc, s) => acc + s.guest_count, 0),
      rsvp_yes: summaries.reduce((acc, s) => acc + s.rsvp_yes_count, 0),
      photos: summaries.reduce((acc, s) => acc + s.photo_count, 0),
      storage_bytes: summaries.reduce((acc, s) => acc + s.storage_bytes, 0),
    };

    // Recent platform-wide audit events
    const { data: auditRows, error: auditErr } = await supabaseAdmin
      .from("audit_log")
      .select("id, wedding_id, actor_label, action, target_type, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (auditErr) throw new Error(auditErr.message);

    const slugById = new Map(summaries.map((s) => [s.id, { slug: s.slug, name: s.wedding_name }]));
    const recentAudit = (auditRows ?? []).map((a) => ({
      id: a.id,
      wedding_id: a.wedding_id,
      wedding_slug: slugById.get(a.wedding_id)?.slug ?? null,
      wedding_name: slugById.get(a.wedding_id)?.name ?? null,
      actor_label: a.actor_label,
      action: a.action,
      target_type: a.target_type,
      created_at: a.created_at,
    }));

    return { totals, weddings: summaries, recentAudit };
  });
