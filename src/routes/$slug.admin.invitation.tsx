import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Mail, RotateCcw } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import {
  DEFAULT_INVITATION_TEMPLATE,
  renderInvitationText,
} from "@/wedding/invitationTemplate";
import { WishlistEditor } from "@/wedding/WishlistEditor";
import { useT } from "@/i18n";

export const Route = createFileRoute("/$slug/admin/invitation")({
  component: AdminInvitation,
});

function AdminInvitation() {
  const { slug } = Route.useParams();
  const { wedding, refresh } = useWedding(slug);

  const [text, setText] = useState("");
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);
  const t = useT();
  const defaultTemplate = t(DEFAULT_INVITATION_TEMPLATE);

  useEffect(() => {
    if (!wedding) return;
    const initialText = wedding.invitation_text ?? defaultTemplate;
    setText(initialText);
    setInitial(initialText);
  }, [wedding, defaultTemplate]);

  const dirty = useMemo(() => text !== initial, [text, initial]);

  if (!wedding) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const previewFirst = "Alex";
  const previewLast = "Morgan";
  const coupleSignature =
    wedding.bride_name && wedding.groom_name
      ? `${wedding.bride_name} & ${wedding.groom_name}`
      : (wedding.wedding_name ?? t("The happy couple"));

  const resetToDefault = () => setText(defaultTemplate);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("weddings")
      .update({ invitation_text: text })
      .eq("id", wedding.id);
    setSaving(false);
    if (error) {
      toast.error(t("Could not save invitation."));
      return;
    }
    setInitial(text);
    toast.success(t("Invitation saved."));
    void logAudit({
      weddingId: wedding.id,
      action: "wedding.updated",
      targetType: "wedding",
      targetId: wedding.id,
      details: { field: "invitation_text" },
    });
    void refresh();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-display text-xl">{t("Invitation letter")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={resetToDefault} className="rounded-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("Reset")}
            </Button>
            <Button onClick={handleSave} disabled={!dirty || saving} className="rounded-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {t("Save")}
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("This is the letter guests see when they open the envelope on the invitation page.")}{" "}
          {t("Use")} <code className="px-1 py-0.5 rounded bg-muted text-xs">{`{FirstName}`}</code> {t("and")}{" "}
          <code className="px-1 py-0.5 rounded bg-muted text-xs">{`{LastName}`}</code>{" "}
          {t("to personalize per guest.")}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            className="font-body text-base leading-relaxed"
            placeholder={defaultTemplate}
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg">{t("Live preview")}</h3>
            <span className="text-xs text-muted-foreground">
              {t("sample: {name}", { name: `${previewFirst} ${previewLast}` })}
            </span>
          </div>
          <EnvelopeLetter
            recipientFirstName={previewFirst}
            recipientLastName={previewLast}
            invitationTemplate={text}
            coupleSignature={coupleSignature}
          />
          <p className="mt-3 text-xs text-muted-foreground text-center">
            {t("Rendered preview text:")}
          </p>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground border border-dashed border-border rounded-lg p-3 bg-muted/30">
            {renderInvitationText(text, previewFirst, previewLast, defaultTemplate)}
          </pre>
        </section>
      </div>

      <WishlistEditor
        weddingId={wedding.id}
        wishlistEnabled={wedding.wishlist_enabled}
        onEnabledChange={() => void refresh()}
      />
    </div>
  );
}
