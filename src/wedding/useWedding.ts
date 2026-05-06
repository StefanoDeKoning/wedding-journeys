import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPublishedWedding, type PublicWedding } from "./wedding.functions";

export interface CurrentGuest {
  id: string;
  first_name: string;
  last_name: string;
  guest_type: "day" | "evening" | "full_day";
  age_type: "adult" | "child";
  email: string | null;
  plus_one_allowed: boolean;
}

export interface WeddingState {
  loading: boolean;
  wedding: PublicWedding | null;
  /** Current guest row, if the visitor is signed in as a guest of this wedding. */
  guest: CurrentGuest | null;
  /** True if visitor has admin access to this wedding (via wedding_members or platform owner). */
  isAdmin: boolean;
  /** True if the wedding exists but the caller has no access (draft + not authed). */
  notAuthorized: boolean;
  refresh: () => Promise<void>;
}

/**
 * Loads a wedding by slug. First tries the published path (public read).
 * If that returns nothing, tries the authenticated path (RLS lets in admins/guests).
 * Then resolves the current visitor's guest row, if any.
 */
export function useWedding(slug: string): WeddingState {
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<PublicWedding | null>(null);
  const [guest, setGuest] = useState<CurrentGuest | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotAuthorized(false);

    // 1. Try public read via server function (works for published weddings).
    let w: PublicWedding | null = null;
    try {
      const res = await getPublishedWedding({ data: { slug } });
      w = res.wedding;
    } catch {
      w = null;
    }

    // 2. If not found, try authenticated read via RLS (admin or guest of a draft).
    if (!w) {
      const { data } = await supabase
        .from("weddings")
        .select(
          "id, slug, wedding_name, bride_name, groom_name, wedding_date, ceremony_at, reception_at, location_name, location_address, maps_url, invitation_message, invitation_text, rsvp_deadline, status, invitation_title, invitation_content, invitation_template, invitation_visible",
        )
        .eq("slug", slug)
        .maybeSingle();
      w = (data as PublicWedding | null) ?? null;
    }

    if (!w) {
      setWedding(null);
      setGuest(null);
      setIsAdmin(false);
      setNotAuthorized(true);
      setLoading(false);
      return;
    }

    setWedding(w);

    // 3. Determine guest / admin context from the JWT + memberships.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setGuest(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
    const guestId = (meta.guest_id as string | undefined) ?? null;
    const guestWeddingId = (meta.wedding_id as string | undefined) ?? null;

    if (guestId && guestWeddingId === w.id) {
      const { data: g } = await supabase
        .from("guests")
        .select("id, first_name, last_name, guest_type, age_type, email, plus_one_allowed")
        .eq("id", guestId)
        .maybeSingle();
      if (g) setGuest(g as CurrentGuest);
    } else {
      setGuest(null);
    }

    // Admin check via wedding_members
    const { data: membership } = await supabase
      .from("wedding_members")
      .select("role")
      .eq("wedding_id", w.id)
      .eq("user_id", user.id)
      .maybeSingle();
    setIsAdmin(!!membership);

    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return {
    loading,
    wedding,
    guest,
    isAdmin,
    notAuthorized,
    refresh: load,
  };
}
