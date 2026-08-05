import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2, X, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  checkSlugAvailability,
  createWeddingWithAccount,
  suggestSlugs,
} from "@/auth/wedding.functions";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create your wedding — OurJourney" },
      {
        name: "description",
        content:
          "Set up your private wedding website and admin dashboard in minutes. Pick your slug, add your details, invite your guests.",
      },
      { property: "og:title", content: "Create your wedding — OurJourney" },
      { property: "og:description", content: "Begin your OurJourney." },
    ],
  }),
  component: CreatePage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const formSchema = z.object({
  weddingName: z.string().trim().min(2, "Give your wedding a name").max(120),
  brideName: z.string().trim().min(1, "Required").max(80),
  groomName: z.string().trim().min(1, "Required").max(80),
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date").or(z.literal("")),
  locationName: z.string().trim().max(200).optional().or(z.literal("")),
  locationAddress: z.string().trim().max(400).optional().or(z.literal("")),
  mapsUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//.test(v), "Must start with http(s)://"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters")
    .max(60, "Max 60 characters")
    .regex(slugRegex, "Lowercase, numbers and dashes only"),
  rsvpDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
});

const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(100),
});

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function CreatePage() {
  const { user, refresh, loading } = useAuth();
  const navigate = useNavigate();

  const [weddingName, setWeddingName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");

  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Inline signup state (only used when no session)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-derive slug from names until user manually edits it.
  useEffect(() => {
    if (slugTouched) return;
    const derived = slugify([brideName, groomName].filter(Boolean).join("-"));
    setSlug(derived);
  }, [brideName, groomName, slugTouched]);

  // Auto-derive wedding name
  useEffect(() => {
    if (weddingName) return;
    if (brideName && groomName) {
      // intentionally not setting state to avoid loop; we only seed placeholder
    }
  }, [brideName, groomName, weddingName]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      setSuggestions([]);
      return;
    }
    if (!slugRegex.test(slug) || slug.length < 3) {
      setSlugStatus("invalid");
      setSuggestions([]);
      return;
    }
    setSlugStatus("checking");
    const id = setTimeout(async () => {
      try {
        const res = await checkSlugAvailability({ data: { slug } });
        if (res.available) {
          setSlugStatus("available");
          setSuggestions([]);
        } else {
          setSlugStatus("taken");
          const sug = await suggestSlugs({ data: { base: slug } });
          setSuggestions(sug.suggestions);
        }
      } catch {
        setSlugStatus("idle");
      }
    }, 400);
    return () => clearTimeout(id);
  }, [slug]);

  const placeholderName = useMemo(
    () => (brideName && groomName ? `${brideName} & ${groomName}` : "Our wedding"),
    [brideName, groomName],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const parsed = formSchema.safeParse({
      weddingName: weddingName || placeholderName,
      brideName,
      groomName,
      weddingDate,
      locationName,
      locationAddress,
      mapsUrl,
      slug,
      rsvpDeadline,
    });

    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[issue.path[0] as string] = issue.message;
      setErrors(fe);
      return;
    }
    if (slugStatus !== "available") {
      setErrors({ slug: "Pick an available URL before continuing." });
      return;
    }

    setSubmitting(true);
    try {
      // If the visitor is already signed in, they should use the dashboard
      // to create another wedding (future feature). For now, the atomic flow
      // requires fresh credentials so we always go through the same backend op.
      if (user) {
        toast.error(
          "You're already signed in. Sign out first to create a new wedding from a fresh account.",
        );
        setSubmitting(false);
        return;
      }

      const sParsed = signupSchema.safeParse({ email, password });
      if (!sParsed.success) {
        const fe: Record<string, string> = {};
        for (const issue of sParsed.error.issues) fe[issue.path[0] as string] = issue.message;
        setErrors(fe);
        setSubmitting(false);
        return;
      }

      // ATOMIC: backend creates user + wedding + admin membership in one call,
      // and rolls back any partial state on failure.
      let result;
      try {
        result = await createWeddingWithAccount({
          data: {
            ...parsed.data,
            email: sParsed.data.email,
            password: sParsed.data.password,
          },
        });
      } catch (callErr) {
        const message = callErr instanceof Error ? callErr.message : "Server error";
        console.error("[create] createWeddingWithAccount threw:", callErr);
        toast.error(`Could not create your wedding: ${message}`);
        setSubmitting(false);
        return;
      }

      if (!result.ok || !result.wedding) {
        const message = result.error ?? "Could not create your wedding.";
        console.error("[create] createWeddingWithAccount failed:", result);
        if (result.errorField) {
          setErrors({ [result.errorField]: message });
        }
        toast.error(message);
        setSubmitting(false);
        return;
      }

      // Sign the user in with the credentials we just provisioned.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: sParsed.data.email,
        password: sParsed.data.password,
      });
      if (signInErr) {
        toast.message("Wedding created. Please sign in to continue.", {
          description: signInErr.message,
        });
        void navigate({ to: "/login" });
        return;
      }

      toast.success("Your wedding home is ready.");
      await refresh();
      void navigate({ to: result.wedding.adminUrl });
    } catch (err) {
      console.error("[create] unexpected:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sunset" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
          <p className="font-script text-3xl text-primary">begin</p>
          <h1 className="mt-4 text-5xl md:text-6xl text-balance">Create your wedding home.</h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Your site starts in <span className="font-medium text-foreground">draft mode</span> —
            only you can see it until you're ready to share. Refine everything afterwards.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 -mt-6 pb-28">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[2rem] border border-border bg-card p-8 md:p-10 shadow-soft space-y-8"
        >
          {/* Couple */}
          <fieldset className="space-y-5">
            <legend className="font-display text-xl">The couple</legend>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="brideName">Bride name</Label>
                <Input
                  id="brideName"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="Sophie"
                  aria-invalid={!!errors.brideName}
                />
                {errors.brideName && <p className="text-xs text-destructive">{errors.brideName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="groomName">Groom name</Label>
                <Input
                  id="groomName"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="Jan"
                  aria-invalid={!!errors.groomName}
                />
                {errors.groomName && <p className="text-xs text-destructive">{errors.groomName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weddingName">Wedding name</Label>
              <Input
                id="weddingName"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                placeholder={placeholderName}
                aria-invalid={!!errors.weddingName}
              />
              {errors.weddingName && (
                <p className="text-xs text-destructive">{errors.weddingName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weddingDate">Wedding date</Label>
              <Input
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                aria-invalid={!!errors.weddingDate}
              />
              {errors.weddingDate && (
                <p className="text-xs text-destructive">{errors.weddingDate}</p>
              )}
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="space-y-5">
            <legend className="font-display text-xl">The venue</legend>
            <div className="space-y-2">
              <Label htmlFor="locationName">Location name</Label>
              <Input
                id="locationName"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Château de Tournelle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationAddress">Address</Label>
              <Textarea
                id="locationAddress"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="12 Rue des Vignes, 75016 Paris, France"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapsUrl">Google Maps link</Label>
              <Input
                id="mapsUrl"
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/…"
                aria-invalid={!!errors.mapsUrl}
              />
              {errors.mapsUrl && <p className="text-xs text-destructive">{errors.mapsUrl}</p>}
            </div>
          </fieldset>

          {/* Slug */}
          <fieldset className="space-y-3">
            <legend className="font-display text-xl">Your wedding URL</legend>
            <Label htmlFor="slug" className="sr-only">
              Wedding slug
            </Label>
            <div
              className={`flex items-center rounded-md border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring ${
                slugStatus === "taken" || slugStatus === "invalid"
                  ? "border-destructive/60"
                  : slugStatus === "available"
                    ? "border-primary/60"
                    : "border-input"
              }`}
            >
              <span className="px-3 py-2.5 text-sm text-muted-foreground bg-muted/40 border-r border-input">
                ourjourney.com/
              </span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="jan-sophie"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm font-display italic text-primary focus:outline-none"
              />
              <div className="px-3 text-muted-foreground" aria-live="polite">
                {slugStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
                {slugStatus === "available" && <Check className="h-4 w-4 text-primary" />}
                {(slugStatus === "taken" || slugStatus === "invalid") && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>

            {slugStatus === "available" && (
              <p className="text-xs text-primary">Available — this URL is yours.</p>
            )}
            {slugStatus === "invalid" && (
              <p className="text-xs text-destructive">
                Use 3–60 lowercase letters, numbers and dashes. No spaces.
              </p>
            )}
            {slugStatus === "taken" && (
              <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3">
                <p className="text-sm">
                  <span className="font-medium">{slug}</span> is already taken.
                </p>
                {suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3 w-3" /> Try one of these
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSlugTouched(true);
                            setSlug(s);
                          }}
                          className="text-xs px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers and dashes. You can change this later.
            </p>
          </fieldset>

          {/* RSVP */}
          <fieldset className="space-y-3">
            <legend className="font-display text-xl">RSVP deadline</legend>
            <div className="space-y-2">
              <Label htmlFor="rsvpDeadline">Last day guests can respond</Label>
              <Input
                id="rsvpDeadline"
                type="date"
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                After this date, guests can't change their answer. Optional — you can set it later.
              </p>
            </div>
          </fieldset>

          {/* Account */}
          {!loading && !user && (
            <fieldset className="space-y-5 border-t border-border pt-8">
              <legend className="font-display text-xl">Your admin account</legend>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in instead
                </Link>
                .
              </p>
            </fieldset>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting || slugStatus === "checking"}
            className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 shadow-warm"
          >
            {submitting ? "Creating…" : "Reserve our journey"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We'll set up your wedding website, admin dashboard and guest login in one go.
          </p>
        </form>
      </section>
    </SiteShell>
  );
}
