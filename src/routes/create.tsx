import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Loader2, X, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  checkSlugAvailability,
  createWeddingWithAccount,
  suggestSlugs,
} from "@/auth/wedding.functions";
import {
  PageCanvas,
  Container,
  Section,
  Hero,
  FormPanel,
  ThemedButton,
  ThemedInput,
  ThemedTextarea,
  SlugInput,
} from "@/design-system";

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
  const { user, refresh, loading, signOut } = useAuth();
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

  if (!loading && user) {
    return (
      <SiteShell>
        <PageCanvas density="quiet">
          <Section size="hero" width="prose">
            <FormPanel
              title="You're already signed in"
              description="Creating a wedding needs a fresh account for now. Sign out first, or head back if you meant to visit your dashboard."
            >
              <div className="flex flex-wrap gap-3 justify-center">
                <ThemedButton size="lg" onClick={() => void signOut()}>
                  Sign out
                </ThemedButton>
                <ThemedButton asChild variant="gilded" size="lg">
                  <Link to="/">Back home</Link>
                </ThemedButton>
              </div>
            </FormPanel>
          </Section>
        </PageCanvas>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageCanvas density="regular">
        <Container width="prose">
          <Hero
            script="begin"
            title="Create your wedding home."
            subtitle={
              <>
                Your site starts in <span className="font-medium text-foreground">draft mode</span> —
                only you can see it until you're ready to share. Refine everything afterwards.
              </>
            }
          />
        </Container>

        <Section size="compact" width="prose">
        <FormPanel>
        <form onSubmit={handleSubmit} noValidate className="space-y-block">
          {/* Couple */}
          <fieldset className="space-y-5">
            <legend className="type-card-title">The couple</legend>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="brideName">Bride name</Label>
                <ThemedInput
                  id="brideName"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="Sophie"
                  aria-invalid={!!errors.brideName}
                />
                {errors.brideName && <p className="type-caption text-destructive">{errors.brideName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="groomName">Groom name</Label>
                <ThemedInput
                  id="groomName"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="Jan"
                  aria-invalid={!!errors.groomName}
                />
                {errors.groomName && <p className="type-caption text-destructive">{errors.groomName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weddingName">Wedding name</Label>
              <ThemedInput
                id="weddingName"
                value={weddingName}
                onChange={(e) => setWeddingName(e.target.value)}
                placeholder={placeholderName}
                aria-invalid={!!errors.weddingName}
              />
              {errors.weddingName && (
                <p className="type-caption text-destructive">{errors.weddingName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weddingDate">Wedding date</Label>
              <ThemedInput
                id="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                aria-invalid={!!errors.weddingDate}
              />
              {errors.weddingDate && (
                <p className="type-caption text-destructive">{errors.weddingDate}</p>
              )}
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="space-y-5">
            <legend className="type-card-title">The venue</legend>
            <div className="space-y-2">
              <Label htmlFor="locationName">Location name</Label>
              <ThemedInput
                id="locationName"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Château de Tournelle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationAddress">Address</Label>
              <ThemedTextarea
                id="locationAddress"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="12 Rue des Vignes, 75016 Paris, France"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapsUrl">Google Maps link</Label>
              <ThemedInput
                id="mapsUrl"
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/…"
                aria-invalid={!!errors.mapsUrl}
              />
              {errors.mapsUrl && <p className="type-caption text-destructive">{errors.mapsUrl}</p>}
            </div>
          </fieldset>

          {/* Slug */}
          <fieldset className="space-y-3">
            <legend className="type-card-title">Your wedding URL</legend>
            <Label htmlFor="slug" className="sr-only">
              Wedding slug
            </Label>
            <SlugInput
              id="slug"
              value={slug}
              onChange={(v) => {
                setSlugTouched(true);
                setSlug(slugify(v));
              }}
              placeholder="jan-sophie"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              inputClassName="font-display italic text-primary"
              tone={
                slugStatus === "taken" || slugStatus === "invalid"
                  ? "error"
                  : slugStatus === "available"
                    ? "success"
                    : "default"
              }
              aria-invalid={slugStatus === "taken" || slugStatus === "invalid"}
              aria-describedby="slug-status"
              status={
                <>
                  {slugStatus === "checking" && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
                  {slugStatus === "available" && <Check aria-hidden="true" className="h-4 w-4 text-primary" />}
                  {(slugStatus === "taken" || slugStatus === "invalid") && (
                    <X aria-hidden="true" className="h-4 w-4 text-destructive" />
                  )}
                </>
              }
            />

            <div id="slug-status">
              {slugStatus === "available" && (
                <p className="type-caption text-primary">Available — this URL is yours.</p>
              )}
              {slugStatus === "invalid" && (
                <p className="type-caption text-destructive">
                  Use 3–60 lowercase letters, numbers and dashes. No spaces.
                </p>
              )}
              {slugStatus === "taken" && (
                <p className="type-caption text-destructive">
                  <span className="font-medium">{slug}</span> is already taken.
                </p>
              )}
            </div>
            {slugStatus === "taken" && suggestions.length > 0 && (
              <div>
                <p className="type-caption flex items-center gap-1.5 mb-2">
                  <Sparkles aria-hidden="true" className="h-3 w-3" /> Try one of these
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
                      className="type-caption min-h-9 px-3 py-1.5 rounded-full bg-background border-paper hover:border-primary hover:text-primary transition-colors duration-[var(--ds-dur-fast)] focus-ring-elegant"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {errors.slug && <p className="type-caption text-destructive">{errors.slug}</p>}
            <p className="type-caption">
              Lowercase letters, numbers and dashes. You can change this later.
            </p>
          </fieldset>

          {/* RSVP */}
          <fieldset className="space-y-3">
            <legend className="type-card-title">RSVP deadline</legend>
            <div className="space-y-2">
              <Label htmlFor="rsvpDeadline">Last day guests can respond</Label>
              <ThemedInput
                id="rsvpDeadline"
                type="date"
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
              />
              <p className="type-caption">
                After this date, guests can't change their answer. Optional — you can set it later.
              </p>
            </div>
          </fieldset>

          {/* Account */}
          {!loading && !user && (
            <fieldset className="space-y-5 border-t border-paper pt-8">
              <legend className="type-card-title">Your admin account</legend>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <ThemedInput
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="type-caption text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <ThemedInput
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="type-caption text-destructive">{errors.password}</p>
                  )}
                </div>
              </div>
              <p className="type-caption">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover-gild focus-ring-elegant">
                  Sign in instead
                </Link>
                .
              </p>
            </fieldset>
          )}

          <div className="space-y-2">
            <ThemedButton
              type="submit"
              size="lg"
              disabled={submitting || slugStatus === "checking"}
              className="w-full"
            >
              {submitting && <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />}
              {submitting ? "Creating…" : slugStatus === "checking" ? "Checking your URL…" : "Reserve our journey"}
            </ThemedButton>
            {slugStatus === "checking" && (
              <p className="type-caption text-center">Just a moment while we confirm your URL is free.</p>
            )}
          </div>

          <p className="type-caption text-center">
            We'll set up your wedding website, admin dashboard and guest login in one go.
          </p>
        </form>
        </FormPanel>
        </Section>
      </PageCanvas>
    </SiteShell>
  );
}
