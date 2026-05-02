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

export const Route = createFileRoute("/admin/platform/todo-templates")({
  head: () => ({ meta: [{ title: "ToDo Templates" }] }),
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

function TemplateManager() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

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
      toast.error(error.message);
      return;
    }
    setTemplates((data ?? []) as Template[]);
  };

  useEffect(() => {
    if (auth.isPlatformOwner) void load();
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
      toast.error("Title is required");
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
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("todo_templates").insert(payload);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    closeDialog();
    toast.success(editing ? "Template updated" : "Template added");
    void load();
  };

  const remove = async (t: Template) => {
    if (!confirm(`Delete template "${t.title}"?`)) return;
    const { error } = await supabase.from("todo_templates").delete().eq("id", t.id);
    if (error) {
      toast.error(error.message);
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
        <ArrowLeft className="w-3 h-3" /> Back to platform
      </Link>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-script text-2xl text-primary">global library</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">ToDo templates</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tasks defined here are copied into every newly created wedding.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> New template
        </Button>
      </header>

      {Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, list]) => (
          <section key={category} className="mb-6">
            <h2 className="font-display text-xl mb-2">{category}</h2>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border shadow-soft">
              {list.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{t.title}</span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {t.priority}
                      </span>
                      {t.relative_days_before != null && (
                        <span className="text-xs text-muted-foreground">
                          · {t.relative_days_before} days before
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(t)}>
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
              {editing ? "Edit template" : "New template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Category"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Days before wedding"
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
                  <SelectItem value="low">Low priority</SelectItem>
                  <SelectItem value="medium">Medium priority</SelectItem>
                  <SelectItem value="high">High priority</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Position"
                value={draft.position}
                onChange={(e) =>
                  setDraft({ ...draft, position: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
