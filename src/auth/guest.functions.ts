import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const GuestLoginInput = z.object({
  weddingSlug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Invalid wedding URL"),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  invitationCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(4)
    .max(32)
    .regex(/^[A-Z0-9-]+$/, "Codes use letters, numbers and dashes"),
});

export type GuestLoginPayload = z.infer<typeof GuestLoginInput>;

export interface GuestLoginResult {
  ok: boolean;
  error?: string;
  session?: {
    access_token: string;
    refresh_token: string;
  };
  guest?: {
    id: string;
    wedding_id: string;
    wedding_slug: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Validates a guest against the guests table for a specific wedding,
 * then signs the visitor in anonymously and stamps wedding_id/guest_id/wedding_slug
 * into the JWT's app_metadata so RLS can scope access via current_guest_wedding_id().
 */
export const guestLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestLoginInput.parse(input))
  .handler(async ({ data }): Promise<GuestLoginResult> => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return { ok: false, error: "Server is not configured for auth." };
    }

    const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Find the wedding by slug.
    const { data: wedding, error: wErr } = await admin
      .from("weddings")
      .select("id, slug")
      .eq("slug", data.weddingSlug)
      .maybeSingle();

    if (wErr) return { ok: false, error: "Lookup failed. Please try again." };
    if (!wedding) return { ok: false, error: "We couldn't find that wedding." };

    // 2. Match the guest row by name + code, scoped to this wedding.
    const { data: guest, error: gErr } = await admin
      .from("guests")
      .select("id, first_name, last_name, wedding_id")
      .eq("wedding_id", wedding.id)
      .ilike("first_name", data.firstName)
      .ilike("last_name", data.lastName)
      .eq("invitation_code", data.invitationCode)
      .maybeSingle();

    if (gErr) return { ok: false, error: "Lookup failed. Please try again." };
    if (!guest) {
      return {
        ok: false,
        error: "We couldn't match your name and invitation code for this wedding.",
      };
    }

    // 3. Create an anonymous user using the publishable client.
    const anonClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: anon, error: anonErr } = await anonClient.auth.signInAnonymously();
    if (anonErr || !anon.user || !anon.session) {
      return { ok: false, error: "Could not start a guest session." };
    }

    // 4. Stamp wedding_id / guest_id / wedding_slug into app_metadata
    //    (admin API — clients cannot modify app_metadata themselves).
    const { error: updErr } = await admin.auth.admin.updateUserById(anon.user.id, {
      app_metadata: {
        wedding_id: wedding.id,
        wedding_slug: wedding.slug,
        guest_id: guest.id,
        kind: "guest",
      },
    });
    if (updErr) return { ok: false, error: "Could not finalize guest session." };

    // 5. Refresh the session so the JWT carries the new app_metadata claims.
    const { data: refreshed, error: refErr } = await anonClient.auth.refreshSession({
      refresh_token: anon.session.refresh_token,
    });
    if (refErr || !refreshed.session) {
      return { ok: false, error: "Could not refresh guest session." };
    }

    return {
      ok: true,
      session: {
        access_token: refreshed.session.access_token,
        refresh_token: refreshed.session.refresh_token,
      },
      guest: {
        id: guest.id,
        wedding_id: wedding.id,
        wedding_slug: wedding.slug,
        first_name: guest.first_name,
        last_name: guest.last_name,
      },
    };
  });
