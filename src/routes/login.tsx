import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { guestLogin } from "@/auth/guest.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — OurJourney" },
      {
        name: "description",
        content:
          "Sign in to your OurJourney admin dashboard, or join a wedding as a guest with your invitation code.",
      },
      { property: "og:title", content: "Login — OurJourney" },
      { property: "og:description", content: "Sign in to OurJourney." },
    ],
  }),
  component: LoginPage,
});

const adminSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(100),
});

const guestSchema = z.object({
  weddingSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Wedding URL is too short")
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  invitationCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, "Code is too short")
    .max(32)
    .regex(/^[A-Z0-9-]+$/, "Codes use letters, numbers and dashes"),
});

function LoginPage() {
  const [tab, setTab] = useState<"admin" | "guest">("admin");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const parsed = adminSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    const userId = signInData.user?.id;
    let destination: { to: string; params?: Record<string, string> } = { to: "/" };

    if (userId) {
      try {
        // Check platform owner first.
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "platform_owner")
          .maybeSingle();

        if (roleRow) {
          destination = { to: "/admin/platform" };
        } else {
          const { data: memberships } = await supabase
            .from("wedding_members")
            .select("wedding_id, role, weddings!inner(slug)")
            .eq("user_id", userId);

          type Row = { wedding_id: string; role: string; weddings: { slug: string } | { slug: string }[] };
          const rows = (memberships ?? []) as Row[];
          const slugs = rows
            .map((r) => (Array.isArray(r.weddings) ? r.weddings[0]?.slug : r.weddings?.slug))
            .filter((s): s is string => !!s);

          if (slugs.length === 1) {
            destination = { to: "/$slug/admin", params: { slug: slugs[0] } };
          } else if (slugs.length > 1) {
            // Prefer last-used slug from localStorage if it matches one of the memberships.
            const last = typeof window !== "undefined" ? window.localStorage.getItem("ourjourney:lastWeddingSlug") : null;
            const chosen = last && slugs.includes(last) ? last : slugs[0];
            destination = { to: "/$slug/admin", params: { slug: chosen } };
          }
        }
      } catch (err) {
        console.error("Post-login redirect lookup failed", err);
      }
    }

    setSubmitting(false);
    toast.success("Welcome back");
    await refresh();
    if (destination.params) {
      try {
        window.localStorage.setItem("ourjourney:lastWeddingSlug", destination.params.slug);
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void navigate(destination as any);
  };

  const handleGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = new FormData(e.currentTarget);
    const parsed = guestSchema.safeParse({
      weddingSlug: form.get("weddingSlug"),
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      invitationCode: form.get("invitationCode"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await guestLogin({ data: parsed.data });
      if (!result.ok || !result.session) {
        toast.error(result.error ?? "Could not sign you in.");
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
      if (error) {
        toast.error(error.message);
        setSubmitting(false);
        return;
      }
      toast.success(`Welcome, ${result.guest?.first_name}!`);
      await refresh();
      const slug = result.guest?.wedding_slug ?? parsed.data.weddingSlug;
      void navigate({ to: "/$slug", params: { slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 pt-20 pb-28">
        <div className="text-center mb-10">
          <p className="font-script text-3xl text-primary">welcome back</p>
          <h1 className="mt-3 text-4xl">Sign in</h1>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-card shadow-soft overflow-hidden">
          <div className="grid grid-cols-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setTab("admin");
                setErrors({});
              }}
              className={`py-4 transition-colors ${
                tab === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Couple / Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("guest");
                setErrors({});
              }}
              className={`py-4 transition-colors ${
                tab === "guest"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Guest
            </button>
          </div>

          {tab === "admin" ? (
            <form className="p-8 space-y-5" onSubmit={handleAdmin} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="hello@example.com"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary hover:bg-primary/90 h-11"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Platform Owner setup?{" "}
                <Link to="/admin/platform/claim" className="text-primary hover:underline">
                  Bootstrap the first owner
                </Link>
                .
              </p>
            </form>
          ) : (
            <form className="p-8 space-y-5" onSubmit={handleGuest} noValidate>
              <div className="space-y-2">
                <Label htmlFor="weddingSlug">Wedding URL</Label>
                <div className="flex items-center rounded-md border border-input bg-transparent overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                  <span className="px-3 py-2 text-sm text-muted-foreground bg-muted/40 border-r border-input">
                    ourjourney.com/
                  </span>
                  <input
                    id="weddingSlug"
                    name="weddingSlug"
                    placeholder="jan-sophie"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                    aria-invalid={!!errors.weddingSlug}
                  />
                </div>
                {errors.weddingSlug && (
                  <p className="text-xs text-destructive">{errors.weddingSlug}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Sophie"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Laurent"
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invitationCode">Invitation code</Label>
                <Input
                  id="invitationCode"
                  name="invitationCode"
                  placeholder="ROSE-2026"
                  className="uppercase tracking-widest"
                  aria-invalid={!!errors.invitationCode}
                />
                {errors.invitationCode && (
                  <p className="text-xs text-destructive">{errors.invitationCode}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                No account needed — just your name and the code from your invite.
              </p>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary hover:bg-primary/90 h-11"
              >
                {submitting ? "Checking…" : "Enter wedding"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New here?{" "}
          <Link to="/create" className="text-primary hover:underline">
            Create your wedding
          </Link>
        </p>
      </section>
    </SiteShell>
  );
}
