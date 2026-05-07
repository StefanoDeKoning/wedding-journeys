import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function adminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

const InviteInput = z.object({
  weddingId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(255),
});

export interface InviteResult {
  ok: boolean;
  error?: string;
  member?: { user_id: string; email: string; created: boolean };
}

/**
 * Invite a co-admin by email. If the user already exists, add them as admin.
 * Otherwise send a Supabase invite email and add them as admin once created.
 * Caller must be primary_admin or platform_owner (enforced by RLS on insert).
 */
export const inviteCoAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InviteInput.parse(input))
  .handler(async ({ data, context }): Promise<InviteResult> => {
    const callerId = context.userId;
    const admin = adminClient();

    // Verify caller is primary_admin (or platform_owner)
    const { data: callerMember } = await admin
      .from("wedding_members")
      .select("role")
      .eq("wedding_id", data.weddingId)
      .eq("user_id", callerId)
      .maybeSingle();
    const { data: isOwner } = await admin.rpc("has_platform_role", {
      _user_id: callerId,
      _role: "platform_owner",
    });
    if (callerMember?.role !== "primary_admin" && !isOwner) {
      return { ok: false, error: "Only the primary admin can invite co-admins." };
    }

    // Find existing user by email
    let userId: string | null = null;
    let created = false;
    try {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
      if (found) userId = found.id;
    } catch (e) {
      console.error("[inviteCoAdmin] listUsers failed", e);
    }

    if (!userId) {
      const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(
        data.email,
      );
      if (invErr || !invited.user) {
        return { ok: false, error: invErr?.message ?? "Could not send invite." };
      }
      userId = invited.user.id;
      created = true;
    }

    // Idempotent: skip if already a member
    const { data: existing } = await admin
      .from("wedding_members")
      .select("id, role")
      .eq("wedding_id", data.weddingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      const { error: mErr } = await admin.from("wedding_members").insert({
        wedding_id: data.weddingId,
        user_id: userId,
        role: "secondary_admin",
      });
      if (mErr) return { ok: false, error: mErr.message };
    }

    return { ok: true, member: { user_id: userId, email: data.email, created } };
  });

const RemoveInput = z.object({
  weddingId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const removeCoAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RemoveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("wedding_members")
      .delete()
      .eq("wedding_id", data.weddingId)
      .eq("user_id", data.userId)
      .neq("role", "primary_admin");
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

const ListInput = z.object({ weddingId: z.string().uuid() });

export interface AdminMember {
  user_id: string;
  role: "primary_admin" | "secondary_admin";
  email: string | null;
  created_at: string;
}

export const listAdmins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListInput.parse(input))
  .handler(async ({ data, context }): Promise<{ admins: AdminMember[] }> => {
    const { supabase } = context;
    const { data: members } = await supabase
      .from("wedding_members")
      .select("user_id, role, created_at")
      .eq("wedding_id", data.weddingId);
    if (!members) return { admins: [] };

    // Resolve emails via admin client
    const admin = adminClient();
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const byId = new Map(list.users.map((u) => [u.id, u.email ?? null]));

    return {
      admins: members.map((m) => ({
        user_id: m.user_id,
        role: m.role as "primary_admin" | "secondary_admin",
        email: byId.get(m.user_id) ?? null,
        created_at: m.created_at,
      })),
    };
  });
