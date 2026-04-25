import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Mail } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import {
  DEFAULT_INVITATION_TEMPLATE,
  renderInvitationText,
} from "@/wedding/invitationTemplate";
import { WaxSeal } from "@/wedding/WaxSeal";

export const Route = createFileRoute("/$slug/admin/invitation")({
  component: AdminInvitation,
});

function AdminInvitation() {
  const { slug } = Route.useParams();
  const { wedding, refresh } = useWedding(slug);
  const [text, setText] = useState("");
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (wedding) {
      const current = wedding.invitation_text ?? DEFAULT_INVITATION_TEMPLATE;
      setText(current);
      setInitial(current);
    }
  }, [wedding]);

  if (!wedding) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const dirty = text !== initial;
  const sampleFirst = "John";
  const sampleLast = "Doe";
  const preview = renderInvitationText(text, sampleFirst, sampleLast);
  const coupleSignature =
    wedding.bride_name && wedding.groom_name
      ? `${wedding.bride_name} & ${wedding.groom_name}`
      : (wedding.wedding_name ?? "The happy couple");

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("weddings")
      .update({ invitation_text: text })
      .eq("id", wedding.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save invitation letter.");
      return;
    }
    setInitial(text);
    toast.success("Invitation letter updated.");
    void logAudit({
      weddingId: wedding.id,
      action: "invitation_text.update",
      targetType: "wedding",
      targetId: wedding.id,
    });
    void refresh();
  };

  const handleReset = () => {
    setText(DEFAULT_INVITATION_TEMPLATE);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Editor */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">Invitation letter</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This is the letter your guests read after breaking the wax seal. Use{" "}
          <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs">
            {`{FirstName}`}
          </code>{" "}
          and{" "}
          <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs">
            {`{LastName}`}
          </code>{" "}
          to personalize it for each guest.
        </p>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={18}
          className="font-mono text-sm leading-relaxed"
          placeholder="Write your invitation letter…"
        />

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to default
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-full bg-primary hover:bg-primary/90 shadow-warm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save changes
          </Button>
        </div>
      </section>

      {/* Live Preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Live preview</h2>
          <span className="text-xs text-muted-foreground">
            sample: {sampleFirst} {sampleLast}
          </span>
        </div>
        <div className="relative">
          <article
            className="parchment relative px-6 sm:px-10 py-10 md:py-14 rounded-sm"
            style={{ transform: "rotate(-0.4deg)" }}
          >
            <header className="text-center mb-6">
              <p className="font-parchment-script text-2xl md:text-3xl">an invitation</p>
              <div className="mt-2 inline-block border-t border-b border-current/30 px-5 py-1">
                <span className="text-[0.6rem] tracking-[0.4em] uppercase">
                  Sealed with love
                </span>
              </div>
            </header>

            <div className="space-y-4 font-body text-sm md:text-base leading-relaxed whitespace-pre-line">
              {preview}
            </div>

            <div className="pt-6 text-center">
              <p className="font-parchment-script text-2xl md:text-3xl mt-2">
                {coupleSignature}
              </p>
            </div>

            <div className="absolute -top-5 right-5 md:right-8">
              <div className="rotate-12">
                <WaxSeal size={48} />
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
