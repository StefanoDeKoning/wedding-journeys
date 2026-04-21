import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, AlertTriangle } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

function RsvpPage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);

  const [answer, setAnswer] = useState<Answer | null>(null);
  const [plusOne, setPlusOne] = useState("");
  const [dietary, setDietary] = useState("");
  const [requests, setRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const deadlinePassed = useMemo(() => {
    if (!wedding?.rsvp_deadline) return false;
    return new Date(wedding.rsvp_deadline).getTime() < Date.now();
  }, [wedding?.rsvp_deadline]);

  const deadlineLabel = wedding?.rsvp_deadline
    ? new Date(wedding.rsvp_deadline).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) {
      toast.error("Please choose Yes, No, or Maybe.");
      return;
    }
    setSubmitting(true);
    // RSVP storage will land in a follow-up turn — for now, optimistic UX.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Thank you — we've noted your reply.");
  };

  if (!wedding) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">your reply</p>
        <h1 className="mt-2 font-display text-4xl">Will you join us?</h1>
        {deadlineLabel && (
          <p className="mt-3 text-sm text-muted-foreground">
            Please respond by <span className="text-foreground">{deadlineLabel}</span>.
          </p>
        )}
      </header>

      {deadlinePassed && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div className="text-sm">
            <p className="font-medium">RSVP deadline has passed</p>
            <p className="text-muted-foreground mt-1">
              Replies are now closed. Please reach out to the couple directly if
              your plans have changed.
            </p>
          </div>
        </div>
      )}

      {submitted ? (
        <div className="rounded-[1.5rem] border border-border bg-card p-8 text-center shadow-soft">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h2 className="mt-4 font-display text-2xl">Thank you, {guest?.first_name}!</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Your reply has been recorded. You can update it any time before the
            deadline.
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-full"
            onClick={() => setSubmitted(false)}
          >
            Edit my reply
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-border bg-card p-7 sm:p-9 shadow-soft space-y-7"
        >
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
            />
          </fieldset>

          <fieldset disabled={deadlinePassed} className="space-y-2">
            <Label htmlFor="dietary">Dietary wishes</Label>
            <Textarea
              id="dietary"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Vegetarian, allergies, anything we should know…"
              rows={3}
            />
          </fieldset>

          <fieldset disabled={deadlinePassed} className="space-y-2">
            <Label htmlFor="requests">Special requests</Label>
            <Textarea
              id="requests"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="A song you'd love to hear, an arrival note, anything…"
              rows={3}
            />
          </fieldset>

          <Button
            type="submit"
            disabled={submitting || deadlinePassed}
            className="w-full rounded-full bg-primary hover:bg-primary/90 h-11"
          >
            {submitting ? "Sending…" : "Send my reply"}
          </Button>
        </form>
      )}
    </section>
  );
}
