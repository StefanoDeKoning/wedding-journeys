import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { tHead, useI18n, type MessageKey } from "@/i18n";

export const Route = createFileRoute("/admin/platform/todo-templates")({
  head: () => ({ meta: [{ title: tHead("ToDo Templates") }] }),
  component: TemplateManager,
});

type Priority = "low" | "medium" | "high";

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  relative_days_before: number | null;
  priority: Priority;
  position: number;
}

interface Draft {
  title: string;
  description: string;
  category: string;
  relative_days_before: string;
  priority: Priority;
  position: string;
}

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  category: "General",
  relative_days_before: "",
  priority: "medium",
  position: "0",
});

const PRIORITY_LABEL: Record<Priority, MessageKey> = { low: "low", medium: "medium", high: "high" };

function TemplateManager() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const { t, tx } = useI18n();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user || !auth.isPlatformOwner) {
      void navigate({ to: "/" });
    }
  }, [auth.loading, auth.user, auth.isPlatformOwner, navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("todo_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("position", { ascending: true });
    if (error) {
      toast.error(tx(error.message));
      return;
    }
    setTemplates((data ?? []) as Template[]);
  };

  useEffect(() => {
    if (auth.isPlatformOwner) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isPlatformOwner]);

  const openCreate = () => {
    setDraft(emptyDraft());
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (t: Template) => {
    setDraft({
      title: t.title,
      description: t.description ?? "",
      category: t.category,
      relative_days_before:
        t.relative_days_before == null ? "" : String(t.relative_days_before),
      priority: t.priority,
      position: String(t.position),
    });
    setEditing(t);
    setCreating(false);
  };

  const closeDialog = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error(t("Title is required"));
      return;
    }
    setSaving(true);
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      category: draft.category.trim() || "General",
      relative_days_before:
        draft.relative_days_before === ""
          ? null
          : Math.max(0, parseInt(draft.relative_days_before, 10) || 0),
      priority: draft.priority,
      position: parseInt(draft.position, 10) || 0,
    };
    if (editing) {
      const { error } = await supabase
        .from("todo_templates")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error(tx(error.message));
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("todo_templates").insert(payload);
      if (error) {
        toast.error(tx(error.message));
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    closeDialog();
    toast.success(editing ? t("Template updated") : t("Template added"));
    void load();
  };

  const remove = async (tpl: Template) => {
    if (!confirm(t('Delete template "{title}"?', { title: tpl.title }))) return;
    const { error } = await supabase.from("todo_templates").delete().eq("id", tpl.id);
    if (error) {
      toast.error(tx(error.message));
      return;
    }
    void load();
  };

  if (auth.loading || templates === null) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const grouped = new Map<string, Template[]>();
  templates.forEach((t) => {
    const list = grouped.get(t.category) ?? [];
    list.push(t);
    grouped.set(t.category, list);
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
      <Link
        to="/admin/platform"
        className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-3 h-3" /> {t("Back to platform")}
      </Link>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-script text-2xl text-primary">{t("global library")}</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">{t("ToDo templates")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Tasks defined here are copied into every newly created wedding.")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> {t("New template")}
        </Button>
      </header>

      {Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, list]) => (
          <section key={category} className="mb-6">
            <h2 className="font-display text-xl mb-2">{category}</h2>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border shadow-soft">
              {list.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{tpl.title}</span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {t(PRIORITY_LABEL[tpl.priority])}
                      </span>
                      {tpl.relative_days_before != null && (
                        <span className="text-xs text-muted-foreground">
                          · {t("{count} days before", { count: tpl.relative_days_before })}
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {tpl.description}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tpl)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(tpl)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ))}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("Edit template") : t("New template")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t("Title")}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <Textarea
              placeholder={t("Description (optional)")}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder={t("Category")}
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder={t("Days before wedding")}
                value={draft.relative_days_before}
                onChange={(e) =>
                  setDraft({ ...draft, relative_days_before: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={draft.priority}
                onValueChange={(v) =>
                  setDraft({ ...draft, priority: v as Priority })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("Low priority")}</SelectItem>
                  <SelectItem value="medium">{t("Medium priority")}</SelectItem>
                  <SelectItem value="high">{t("High priority")}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={t("Position")}
                value={draft.position}
                onChange={(e) =>
                  setDraft({ ...draft, position: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {t("Cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
