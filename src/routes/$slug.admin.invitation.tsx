import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  Mail,
} from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import { RichTextEditor } from "@/wedding/RichTextEditor";
import {
  INVITATION_TEMPLATES,
  DEFAULT_INVITATION_TEMPLATE_ID,
  getTemplate,
  renderInvitationHtml,
} from "@/wedding/invitationTemplates";

export const Route = createFileRoute("/$slug/admin/invitation")({
  component: AdminInvitation,
});

function AdminInvitation() {
  const { slug } = Route.useParams();
  const { wedding, refresh } = useWedding(slug);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [templateId, setTemplateId] = useState(DEFAULT_INVITATION_TEMPLATE_ID);
  const [visible, setVisible] = useState(true);
  const [initial, setInitial] = useState({ title: "", content: "", templateId: "", visible: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wedding) return;
    const tpl = getTemplate(wedding.invitation_template);
    const t = wedding.invitation_title ?? tpl.title;
    const c = wedding.invitation_content ?? tpl.content;
    const tid = wedding.invitation_template ?? DEFAULT_INVITATION_TEMPLATE_ID;
    const v = wedding.invitation_visible ?? true;
    setTitle(t);
    setContent(c);
    setTemplateId(tid);
    setVisible(v);
    setInitial({ title: t, content: c, templateId: tid, visible: v });
  }, [wedding]);

  const dirty = useMemo(
    () =>
      title !== initial.title ||
      content !== initial.content ||
      templateId !== initial.templateId ||
      visible !== initial.visible,
    [title, content, templateId, visible, initial],
  );

  if (!wedding) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const previewGuestName = "Alex Morgan";
  const previewPlusOne = "Jamie Lee";
  const previewHtml = renderInvitationHtml(content, previewGuestName, previewPlusOne);
  const coupleSignature =
    wedding.bride_name && wedding.groom_name
      ? `${wedding.bride_name} & ${wedding.groom_name}`
      : (wedding.wedding_name ?? "The happy couple");

  const applyTemplate = (id: string) => {
    const tpl = getTemplate(id);
    setTemplateId(id);
    setTitle(tpl.title);
    setContent(tpl.content);
  };

  const resetToTemplate = () => {
    const tpl = getTemplate(templateId);
    setTitle(tpl.title);
    setContent(tpl.content);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("weddings")
      .update({
        invitation_title: title,
        invitation_content: content,
        invitation_template: templateId,
        invitation_visible: visible,
      })
      .eq("id", wedding.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save invitation.");
      return;
    }
    setInitial({ title, content, templateId, visible });
    toast.success("Invitation saved.");
    void logAudit({
      weddingId: wedding.id,
      action: "wedding.updated",
      targetType: "wedding",
      targetId: wedding.id,
      details: { field: "invitation" },
    });
    void refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-display text-xl">Invitation editor</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {visible ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <span className={visible ? "text-foreground" : "text-muted-foreground"}>
                {visible ? "Visible on site" : "Hidden from guests"}
              </span>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>
            <Button onClick={handleSave} disabled={!dirty || saving} className="rounded-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Use <code className="px-1 py-0.5 rounded bg-muted text-xs">{`{{guest_name}}`}</code> and{" "}
          <code className="px-1 py-0.5 rounded bg-muted text-xs">{`{{plus_one_name}}`}</code> to personalize per guest.
        </p>
      </section>

      {/* Templates */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display text-lg">Templates</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {INVITATION_TEMPLATES.map((tpl) => {
            const active = tpl.id === templateId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl.id)}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active
                    ? "border-primary bg-primary/5 shadow-warm"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <div className="font-display text-base">{tpl.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{tpl.description}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Editor + Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
          <div>
            <Label htmlFor="inv-title">Title</Label>
            <Input
              id="inv-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="You're invited"
              maxLength={120}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Message</Label>
            <div className="mt-1">
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={resetToTemplate} className="rounded-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to template
            </Button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg">Live preview</h3>
            <span className="text-xs text-muted-foreground">
              sample: {previewGuestName} (+ {previewPlusOne})
            </span>
          </div>
          <article className="rounded-2xl border border-border bg-card p-8 shadow-soft">
            {!visible && (
              <div className="mb-4 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <EyeOff className="inline w-3 h-3 mr-1" />
                Currently hidden from guests.
              </div>
            )}
            <h2 className="font-display text-3xl text-center text-balance">{title}</h2>
            <div className="divider-script my-6">
              <span className="font-script text-xl">with love</span>
            </div>
            <div
              className="prose prose-sm sm:prose max-w-none text-foreground [&_h2]:font-display [&_a]:text-primary"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <p className="mt-8 text-center font-script text-2xl text-primary">{coupleSignature}</p>
          </article>
        </section>
      </div>
    </div>
  );
}
