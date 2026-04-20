import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "primary_admin" | "secondary_admin";
export type PlatformRole = "platform_owner";

export interface WeddingMembership {
  wedding_id: string;
  wedding_slug: string;
  role: AdminRole;
}

export interface AuthState {
  loading: boolean;
  user: User | null;
  session: Session | null;
  /** "admin" = email/password user with weddings, "guest" = anonymous user scoped to one wedding */
  kind: "admin" | "guest" | null;
  isPlatformOwner: boolean;
  memberships: WeddingMembership[];
  /** For guests only — the wedding they're scoped to (from JWT app_metadata). */
  guestWeddingId: string | null;
  guestWeddingSlug: string | null;
  guestId: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function loadProfile(user: User) {
  const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const isAnonymous = (user as User & { is_anonymous?: boolean }).is_anonymous === true;
  const guestWeddingId = (meta.wedding_id as string | undefined) ?? null;
  const guestWeddingSlug = (meta.wedding_slug as string | undefined) ?? null;
  const guestId = (meta.guest_id as string | undefined) ?? null;

  if (isAnonymous && guestWeddingId) {
    return {
      kind: "guest" as const,
      isPlatformOwner: false,
      memberships: [],
      guestWeddingId,
      guestWeddingSlug,
      guestId,
    };
  }

  const [rolesRes, membersRes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase
      .from("wedding_members")
      .select("wedding_id, role, weddings!inner(slug)")
      .eq("user_id", user.id),
  ]);

  const isPlatformOwner =
    (rolesRes.data ?? []).some((r) => r.role === "platform_owner");

  type MemberRow = { wedding_id: string; role: AdminRole; weddings: { slug: string } | { slug: string }[] };
  const memberships: WeddingMembership[] = ((membersRes.data ?? []) as MemberRow[]).map((m) => {
    const slug = Array.isArray(m.weddings) ? m.weddings[0]?.slug : m.weddings?.slug;
    return { wedding_id: m.wedding_id, wedding_slug: slug ?? "", role: m.role };
  });

  return {
    kind: "admin" as const,
    isPlatformOwner,
    memberships,
    guestWeddingId: null,
    guestWeddingSlug: null,
    guestId: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    kind: "admin" | "guest" | null;
    isPlatformOwner: boolean;
    memberships: WeddingMembership[];
    guestWeddingId: string | null;
    guestWeddingSlug: string | null;
    guestId: string | null;
  }>({
    kind: null,
    isPlatformOwner: false,
    memberships: [],
    guestWeddingId: null,
    guestWeddingSlug: null,
    guestId: null,
  });

  const hydrate = async (s: Session | null) => {
    setSession(s);
    setUser(s?.user ?? null);
    if (!s?.user) {
      setProfile({
        kind: null,
        isPlatformOwner: false,
        memberships: [],
        guestWeddingId: null,
        guestWeddingSlug: null,
        guestId: null,
      });
      return;
    }
    const p = await loadProfile(s.user);
    setProfile(p);
  };

  useEffect(() => {
    let mounted = true;

    // Set up listener BEFORE getSession.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      // Defer Supabase calls out of the listener to avoid deadlocks.
      setTimeout(() => {
        void hydrate(s);
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      void hydrate(data.session).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = {
    loading,
    user,
    session,
    ...profile,
    refresh: async () => {
      const { data } = await supabase.auth.getSession();
      await hydrate(data.session);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function getAdminPermissions(role: AdminRole) {
  const base = {
    manageGuests: true,
    manageAdmins: true,
    editConfig: true,
    moderatePhotos: true,
    managePlaylist: true,
    manageSeating: true,
    editTimeline: true,
    exportData: true,
    deleteWedding: false,
    changePrimaryAdmin: false,
  };
  if (role === "primary_admin") {
    base.deleteWedding = true;
    base.changePrimaryAdmin = true;
  }
  return base;
}
