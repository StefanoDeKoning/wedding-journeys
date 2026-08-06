import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Pencil,
} from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DIETARY_OPTIONS, dietaryLabel, type DietaryValue } from "@/wedding/dietary";
import {
  PageCanvas,
  Container,
  Section,
  FormPanel,
  ThemedCard,
  ThemedButton,
  ThemedInput,
  ThemedTextarea,
  ThemedCheckbox,
  Hero,
} from "@/design-system";

export const Route = createFileRoute("/$slug/rsvp")({
  head: () => ({
    meta: [
      { title: "RSVP" },
      { name: "description", content: "Reply to your wedding invitation." },
    ],
  }),
  component: RsvpPage,
});

type Answer = "yes" | "no";
type Attendance = "day" | "evening" | "both";
type GuestType = "day" | "evening" | "full_day";

interface RsvpRow {
  id: string;
  guest_id: string;
  status: Answer;
  attendance: Attendance | null;
  plus_one_name: string | null;
  dietary_tags: string[];
  dietary_other: string | null;
  comments: string | null;
  edited_by_admin: boolean;
}

function attendanceOptionsFor(gt: GuestType): { value: Attendance; label: string }[] {
  if (gt === "day") return [{ value: "day", label: "Day only" }];
  if (gt === "evening") return [{ value: "evening", label: "Evening only" }];
  return [
    { value: "day", label: "Day only" },
    { value: "evening", label: "Evening only" },
    { value: "both", label: "Both" },
  ];
}

function RsvpPage() {
  const { wedding, guest } = useWeddingContext();

  return (
    <PageCanvas density="regular">
      <Container width="prose">
        <Hero
          script="your reply"
          title="Will you join us?"
          subtitle={
            wedding.rsvp_deadline && (
              <>
                Please respond by{" "}
                <span className="text-foreground font-medium">
                  {new Date(wedding.rsvp_deadline).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                .
              </>
            )
          }
        />
      </Container>

      <Section size="compact" width="prose">
        {guest ? (
          <GuestRsvpForm
            weddingId={wedding.id}
            guestId={guest.id}
            guestFirstName={guest.first_name}
            guestType={guest.guest_type}
            plusOneAllowed={guest.plus_one_allowed}
            rsvpDeadline={wedding.rsvp_deadline}
          />
        ) : (
          <ThemedCard className="mx-auto max-w-prose text-center">
            <p className="type-body text-muted-foreground">
              Sign in with your invitation code to reply.
            </p>
          </ThemedCard>
        )}
      </Section>
    </PageCanvas>
  );
}

function GuestRsvpForm({
  weddingId,
  guestId,
  guestFirstName,
  guestType,
  plusOneAllowed,
  rsvpDeadline,
}: {
  weddingId: string;
  guestId: string;
  guestFirstName: string;
  guestType: GuestType;
  plusOneAllowed: boolean;
  rsvpDeadline: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<RsvpRow | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [plusOne, setPlusOne] = useState("");
  const [bringingGuest, setBringingGuest] = useState<boolean>(false);
  const [tags, setTags] = useState<DietaryValue[]>([]);
  const [dietaryOther, setDietaryOther] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const deadlinePassed = useMemo(() => {
    if (!rsvpDeadline) return false;
    return new Date(rsvpDeadline).getTime() < Date.now();
  }, [rsvpDeadline]);

  const attendanceOptions = useMemo(() => attendanceOptionsFor(guestType), [guestType]);

  useEffect(() => {
    if (answer === "yes" && !attendance && attendanceOptions.length === 1) {
      setAttendance(attendanceOptions[0].value);
    }
  }, [answer, attendance, attendanceOptions]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data } = await supabase
        .from("rsvp_responses")
        .select(
          "id, guest_id, status, attendance, plus_one_name, dietary_tags, dietary_other, comments, edited_by_admin",
        )
        .eq("guest_id", guestId)
        .maybeSingle();
      if (!mounted) return;
      if (data) {
        const row = data as RsvpRow;
        setExisting(row);
        setAnswer(row.status);
        setAttendance(row.attendance);
        setPlusOne(row.plus_one_name ?? "");
        setBringingGuest(!!row.plus_one_name);
        setTags((row.dietary_tags ?? []) as DietaryValue[]);
        setDietaryOther(row.dietary_other ?? "");
        setComments(row.comments ?? "");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [guestId]);

  const toggleTag = (v: DietaryValue) => {
    setTags((prev) => (prev.includes(v) ? prev.filter((t) => t !== v) : [...prev, v]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deadlinePassed) {
      toast.error("RSVP is closed.");
      return;
    }
    if (!answer) {
      toast.error("Please choose Yes or No.");
      return;
    }
    if (answer === "yes" && !attendance) {
      toast.error("Please choose which part of the day you'll attend.");
      return;
    }
    setSubmitting(true);
    const payload = {
      wedding_id: weddingId,
      guest_id: guestId,
      status: answer,
      attendance: answer === "yes" ? attendance : null,
      plus_one_name:
        plusOneAllowed && answer === "yes" && bringingGuest ? plusOne.trim() || null : null,
      dietary_tags: tags,
      dietary_other: dietaryOther.trim() || null,
      comments: comments.trim() || null,
      edited_by_admin: false,
    };
    const { data, error } = await supabase
      .from("rsvp_responses")
      .upsert(payload, { onConflict: "guest_id" })
      .select(
        "id, guest_id, status, attendance, plus_one_name, dietary_tags, dietary_other, comments, edited_by_admin",
      )
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setExisting(data as RsvpRow);
    setEditing(false);
    toast.success("Thank you — we've noted your reply.");
  };

  if (loading) {
    return (
      <ThemedCard className="text-center py-block">
        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
      </ThemedCard>
    );
  }

  if (existing && !editing) {
    return (
      <ThemedCard variant="framed" ornament className="text-center animate-ds-scale">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
        <h2 className="type-section-title mt-4">Thank you, {guestFirstName}!</h2>
        <p className="type-body mt-2 text-muted-foreground">
          You replied{" "}
          <span className="text-foreground font-medium">{answerLabel(existing.status)}</span>
          {existing.attendance && existing.status === "yes" && (
            <> · {attendanceLabel(existing.attendance)}</>
          )}
          .
        </p>
        {existing.dietary_tags.length > 0 && (
          <p className="type-caption mt-1">
            Dietary: {existing.dietary_tags.map(dietaryLabel).join(", ")}
          </p>
        )}
        {existing.edited_by_admin && (
          <p className="type-caption mt-2 italic">Last updated by an admin.</p>
        )}
        {!deadlinePassed && (
          <ThemedButton variant="secondary" className="mt-6" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5" />
            Edit my reply
          </ThemedButton>
        )}
      </ThemedCard>
    );
  }

  const locked = deadlinePassed || submitting;

  return (
    <FormPanel>
      <form onSubmit={handleSubmit} className="space-y-stack">
        {deadlinePassed && (
          <div className="flex items-start gap-3 rounded-card border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle aria-hidden="true" className="w-5 h-5 text-destructive shrink-0" />
            <div className="type-body">
              <p className="font-medium">RSVP deadline has passed</p>
              <p className="text-muted-foreground mt-1">
                Replies are now closed. Please reach out to the couple directly.
              </p>
            </div>
          </div>
        )}

        <fieldset disabled={locked} className="space-y-3">
          <legend className="type-card-title mb-1">My answer</legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="My answer">
            {(
              [
                { v: "yes", label: "Joyfully yes", Icon: CheckCircle2 },
                { v: "no", label: "Sadly no", Icon: XCircle },
              ] as const
            ).map(({ v, label, Icon }) => {
              const active = answer === v;
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAnswer(v)}
                  className={`rounded-card p-4 text-center transition-all focus-ring-elegant ${
                    active
                      ? "border-gilded bg-primary/10 text-primary shadow-elev-2"
                      : "border-paper hover:border-primary/40"
                  }`}
                >
                  <Icon aria-hidden="true" className="w-6 h-6 mx-auto" />
                  <span className="type-nav mt-2 block">{label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {answer === "yes" && attendanceOptions.length > 1 && (
          <fieldset disabled={locked} className="space-y-3">
            <legend className="type-card-title mb-1">Which part of the day?</legend>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Which part of the day">
              {attendanceOptions.map((opt) => {
                const active = attendance === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setAttendance(opt.value)}
                    className={`rounded-card p-3 type-body transition-all focus-ring-elegant ${
                      active
                        ? "border-gilded bg-primary/10 text-primary shadow-elev-2"
                        : "border-paper hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {plusOneAllowed && answer === "yes" && (
          <fieldset disabled={locked} className="space-y-3">
            <legend className="type-card-title mb-1">Will you bring a guest?</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Will you bring a guest">
              {(
                [
                  { v: true, label: "Yes, +1" },
                  { v: false, label: "No, just me" },
                ] as const
              ).map(({ v, label }) => {
                const active = bringingGuest === v;
                return (
                  <button
                    key={String(v)}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setBringingGuest(v)}
                    className={`rounded-card p-3 text-center transition-all type-body focus-ring-elegant ${
                      active
                        ? "border-gilded bg-primary/10 text-primary shadow-elev-2"
                        : "border-paper hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {bringingGuest && (
              <ThemedInput
                id="plusOne"
                value={plusOne}
                onChange={(e) => setPlusOne(e.target.value)}
                placeholder="Name of your guest (optional)"
                maxLength={120}
              />
            )}
          </fieldset>
        )}

        <fieldset disabled={locked} className="space-y-3">
          <legend className="type-card-title mb-1">Dietary restrictions</legend>
          <div className="grid sm:grid-cols-2 gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const checked = tags.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 rounded-card border-paper px-3 py-2.5 cursor-pointer transition-colors ${
                    checked ? "border-gilded bg-primary/5" : "hover:border-primary/40"
                  }`}
                >
                  <ThemedCheckbox checked={checked} onCheckedChange={() => toggleTag(opt.value)} />
                  <span className="type-body">{opt.label}</span>
                </label>
              );
            })}
          </div>
          <ThemedInput
            value={dietaryOther}
            onChange={(e) => setDietaryOther(e.target.value)}
            placeholder="Other (e.g. specific allergies)"
            maxLength={200}
          />
        </fieldset>

        <fieldset disabled={locked} className="space-y-2">
          <Label htmlFor="comments">Additional comments</Label>
          <ThemedTextarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="A song you'd love to hear, an arrival note, anything…"
            rows={3}
            maxLength={1000}
          />
        </fieldset>

        <div className="flex gap-3">
          {existing && (
            <ThemedButton
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => {
                setEditing(false);
                setAnswer(existing.status);
                setAttendance(existing.attendance);
                setPlusOne(existing.plus_one_name ?? "");
                setBringingGuest(!!existing.plus_one_name);
                setTags((existing.dietary_tags ?? []) as DietaryValue[]);
                setDietaryOther(existing.dietary_other ?? "");
                setComments(existing.comments ?? "");
              }}
            >
              Cancel
            </ThemedButton>
          )}
          <ThemedButton type="submit" size="lg" disabled={submitting || deadlinePassed} className="flex-1">
            {submitting && <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />}
            {submitting ? "Sending…" : existing ? "Update my reply" : "Send my reply"}
          </ThemedButton>
        </div>
      </form>
    </FormPanel>
  );
}

function answerLabel(a: Answer | null): string {
  if (a === "yes") return "Joyfully yes";
  if (a === "no") return "Sadly no";
  return "Awaiting reply";
}

function attendanceLabel(a: Attendance): string {
  if (a === "day") return "Day only";
  if (a === "evening") return "Evening only";
  return "Day & evening";
}
