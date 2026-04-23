import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Pencil,
  Users,
} from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DIETARY_OPTIONS, dietaryLabel, type DietaryValue } from "@/wedding/dietary";

export const Route = createFileRoute("/$slug/rsvp")({
  head: () => ({
    meta: [
      { title: "RSVP" },
      { name: "description", content: "Reply to your wedding invitation." },
    ],
  }),
  component: RsvpPage,
});

type Answer = "yes" | "no" | "maybe";

interface RsvpRow {
  id: string;
  guest_id: string;
  status: Answer;
  plus_one_name: string | null;
  dietary_tags: string[];
  dietary_other: string | null;
  comments: string | null;
  edited_by_admin: boolean;
}

interface AdminGuestRow {
  id: string;
  first_name: string;
  last_name: string;
  guest_type: "day" | "evening";
  rsvp: RsvpRow | null;
}

function RsvpPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);

  if (!wedding) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">your reply</p>
        <h1 className="mt-2 font-display text-4xl">Will you join us?</h1>
        {wedding.rsvp_deadline && (
          <p className="mt-3 text-sm text-muted-foreground">
            Please respond by{" "}
            <span className="text-foreground">
              {new Date(wedding.rsvp_deadline).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            .
          </p>
        )}
      </header>

      {guest ? (
        <GuestRsvpForm
          weddingId={wedding.id}
          guestId={guest.id}
          guestFirstName={guest.first_name}
          rsvpDeadline={wedding.rsvp_deadline}
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Sign in with your invitation code to reply.
        </p>
      )}
    </section>
  );
}

// ─────────────────────────── Guest form ───────────────────────────

function GuestRsvpForm({
  weddingId,
  guestId,
  guestFirstName,
  rsvpDeadline,
}: {
  weddingId: string;
  guestId: string;
  guestFirstName: string;
  rsvpDeadline: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<RsvpRow | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [plusOne, setPlusOne] = useState("");
  const [tags, setTags] = useState<DietaryValue[]>([]);
  const [dietaryOther, setDietaryOther] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const deadlinePassed = useMemo(() => {
    if (!rsvpDeadline) return false;
    return new Date(rsvpDeadline).getTime() < Date.now();
  }, [rsvpDeadline]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data } = await supabase
        .from("rsvp_responses")
        .select(
          "id, guest_id, status, plus_one_name, dietary_tags, dietary_other, comments, edited_by_admin",
        )
        .eq("guest_id", guestId)
        .maybeSingle();
      if (!mounted) return;
      if (data) {
        const row = data as RsvpRow;
        setExisting(row);
        setAnswer(row.status);
        setPlusOne(row.plus_one_name ?? "");
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
    if (!answer) {
      toast.error("Please choose Yes, No, or Maybe.");
      return;
    }
    setSubmitting(true);
    const payload = {
      wedding_id: weddingId,
      guest_id: guestId,
      status: answer,
      plus_one_name: plusOne.trim() || null,
      dietary_tags: tags,
      dietary_other: dietaryOther.trim() || null,
      comments: comments.trim() || null,
      edited_by_admin: false,
    };
    const { data, error } = await supabase
      .from("rsvp_responses")
      .upsert(payload, { onConflict: "guest_id" })
      .select(
        "id, guest_id, status, plus_one_name, dietary_tags, dietary_other, comments, edited_by_admin",
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
      <div className="rounded-[1.5rem] border border-border bg-card p-10 text-center shadow-soft">
        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  // Confirmation view
  if (existing && !editing) {
    return (
      <div className="rounded-[1.5rem] border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
        <h2 className="mt-4 font-display text-2xl">Thank you, {guestFirstName}!</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          You replied{" "}
          <span className="text-foreground font-medium">
            {answerLabel(existing.status)}
          </span>
          .
        </p>
        {existing.dietary_tags.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Dietary: {existing.dietary_tags.map(dietaryLabel).join(", ")}
          </p>
        )}
        {existing.edited_by_admin && (
          <p className="mt-2 text-[11px] text-muted-foreground italic">
            Last updated by an admin.
          </p>
        )}
        {!deadlinePassed && (
          <Button
            variant="outline"
            className="mt-6 rounded-full"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit my reply
          </Button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-9 shadow-soft space-y-7"
    >
      {deadlinePassed && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div className="text-sm">
            <p className="font-medium">RSVP deadline has passed</p>
            <p className="text-muted-foreground mt-1">
              Replies are now closed. Please reach out to the couple directly.
            </p>
          </div>
        </div>
      )}

      <fieldset disabled={deadlinePassed} className="space-y-3">
        <legend className="font-display text-xl mb-1">My answer</legend>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { v: "yes", label: "Joyfully yes", Icon: CheckCircle2 },
              { v: "maybe", label: "Maybe", Icon: HelpCircle },
              { v: "no", label: "Sadly no", Icon: XCircle },
            ] as const
          ).map(({ v, label, Icon }) => {
            const active = answer === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setAnswer(v)}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary shadow-warm"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <Icon className="w-6 h-6 mx-auto" />
                <span className="block mt-2 text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={deadlinePassed} className="space-y-2">
        <Label htmlFor="plusOne">Plus-one (optional)</Label>
        <Input
          id="plusOne"
          value={plusOne}
          onChange={(e) => setPlusOne(e.target.value)}
          placeholder="Name of your guest"
          maxLength={120}
        />
      </fieldset>

      <fieldset disabled={deadlinePassed} className="space-y-3">
        <Label>Dietary restrictions</Label>
        <div className="grid sm:grid-cols-2 gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const checked = tags.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleTag(opt.value)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
        <Input
          value={dietaryOther}
          onChange={(e) => setDietaryOther(e.target.value)}
          placeholder="Other (e.g. specific allergies)"
          maxLength={200}
        />
      </fieldset>

      <fieldset disabled={deadlinePassed} className="space-y-2">
        <Label htmlFor="comments">Additional comments</Label>
        <Textarea
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
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setEditing(false);
              setAnswer(existing.status);
              setPlusOne(existing.plus_one_name ?? "");
              setTags((existing.dietary_tags ?? []) as DietaryValue[]);
              setDietaryOther(existing.dietary_other ?? "");
              setComments(existing.comments ?? "");
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting || deadlinePassed}
          className="flex-1 rounded-full bg-primary hover:bg-primary/90 h-11"
        >
          {submitting ? "Sending…" : existing ? "Update my reply" : "Send my reply"}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────── Admin manager ───────────────────────────

function AdminRsvpManager({
  weddingId,
  hasGuestForm,
}: {
  weddingId: string;
  hasGuestForm: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminGuestRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [guestsRes, rsvpsRes] = await Promise.all([
      supabase
        .from("guests")
        .select("id, first_name, last_name, guest_type")
        .eq("wedding_id", weddingId)
        .order("last_name"),
      supabase
        .from("rsvp_responses")
        .select(
          "id, guest_id, status, plus_one_name, dietary_tags, dietary_other, comments, edited_by_admin",
        )
        .eq("wedding_id", weddingId),
    ]);
    const rsvpByGuest = new Map<string, RsvpRow>();
    for (const r of (rsvpsRes.data ?? []) as RsvpRow[]) {
      rsvpByGuest.set(r.guest_id, r);
    }
    setRows(
      ((guestsRes.data ?? []) as Omit<AdminGuestRow, "rsvp">[]).map((g) => ({
        ...g,
        rsvp: rsvpByGuest.get(g.id) ?? null,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

  const stats = useMemo(() => {
    const s = { yes: 0, no: 0, maybe: 0, none: 0 };
    for (const r of rows) {
      if (!r.rsvp) s.none++;
      else s[r.rsvp.status]++;
    }
    return s;
  }, [rows]);

  return (
    <div className={hasGuestForm ? "mt-12" : ""}>
      <div className="divider-script">
        <span className="font-script text-2xl">admin · all replies</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <StatCard label="Yes" value={stats.yes} tone="primary" />
        <StatCard label="Maybe" value={stats.maybe} tone="muted" />
        <StatCard label="No" value={stats.no} tone="muted" />
        <StatCard label="No reply" value={stats.none} tone="muted" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
          No guests yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <AdminRsvpRow
              key={row.id}
              weddingId={weddingId}
              row={row}
              expanded={editingId === row.id}
              onToggle={() =>
                setEditingId((cur) => (cur === row.id ? null : row.id))
              }
              onSaved={() => {
                setEditingId(null);
                void load();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "muted";
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        tone === "primary"
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <p className="text-2xl font-display">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  );
}

function AdminRsvpRow({
  weddingId,
  row,
  expanded,
  onToggle,
  onSaved,
}: {
  weddingId: string;
  row: AdminGuestRow;
  expanded: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const r = row.rsvp;
  return (
    <li className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
      >
        <StatusDot status={r?.status ?? null} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {answerLabel(r?.status ?? null)}
            {r?.plus_one_name && ` · +1: ${r.plus_one_name}`}
            {r && r.dietary_tags.length > 0 && ` · ${r.dietary_tags.length} dietary`}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {row.guest_type}
        </span>
      </button>
      {expanded && (
        <AdminEditForm
          weddingId={weddingId}
          guestId={row.id}
          existing={r}
          onSaved={onSaved}
        />
      )}
    </li>
  );
}

function AdminEditForm({
  weddingId,
  guestId,
  existing,
  onSaved,
}: {
  weddingId: string;
  guestId: string;
  existing: RsvpRow | null;
  onSaved: () => void;
}) {
  const [answer, setAnswer] = useState<Answer>(existing?.status ?? "yes");
  const [plusOne, setPlusOne] = useState(existing?.plus_one_name ?? "");
  const [tags, setTags] = useState<DietaryValue[]>(
    (existing?.dietary_tags ?? []) as DietaryValue[],
  );
  const [dietaryOther, setDietaryOther] = useState(existing?.dietary_other ?? "");
  const [comments, setComments] = useState(existing?.comments ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("rsvp_responses").upsert(
      {
        wedding_id: weddingId,
        guest_id: guestId,
        status: answer,
        plus_one_name: plusOne.trim() || null,
        dietary_tags: tags,
        dietary_other: dietaryOther.trim() || null,
        comments: comments.trim() || null,
        edited_by_admin: true,
      },
      { onConflict: "guest_id" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Reply updated.");
    onSaved();
  };

  return (
    <div className="border-t border-border bg-muted/20 p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(["yes", "maybe", "no"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAnswer(v)}
            className={`text-xs rounded-lg border px-2 py-2 transition-colors ${
              answer === v
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            {answerLabel(v)}
          </button>
        ))}
      </div>
      <Input
        value={plusOne}
        onChange={(e) => setPlusOne(e.target.value)}
        placeholder="Plus-one"
        maxLength={120}
      />
      <div className="flex flex-wrap gap-1.5">
        {DIETARY_OPTIONS.map((opt) => {
          const checked = tags.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() =>
                setTags((prev) =>
                  prev.includes(opt.value)
                    ? prev.filter((t) => t !== opt.value)
                    : [...prev, opt.value],
                )
              }
              className={`text-[11px] rounded-full px-2.5 py-1 border transition-colors ${
                checked
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <Input
        value={dietaryOther}
        onChange={(e) => setDietaryOther(e.target.value)}
        placeholder="Other dietary notes"
        maxLength={200}
      />
      <Textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comments"
        rows={2}
        maxLength={1000}
      />
      <Button
        type="button"
        size="sm"
        onClick={save}
        disabled={saving}
        className="rounded-full"
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

function StatusDot({ status }: { status: Answer | null }) {
  const cls =
    status === "yes"
      ? "bg-primary"
      : status === "maybe"
        ? "bg-amber-500"
        : status === "no"
          ? "bg-muted-foreground/60"
          : "bg-border";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
}

function answerLabel(a: Answer | null): string {
  if (a === "yes") return "Joyfully yes";
  if (a === "no") return "Sadly no";
  if (a === "maybe") return "Maybe";
  return "Awaiting reply";
}
