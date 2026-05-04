import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  AlertTriangle,
  CalendarDays,
  Briefcase,
  Wallet,
} from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { logAudit } from "@/wedding/audit";

export const Route = createFileRoute("/$slug/admin/todo")({
  head: () => ({ meta: [{ title: "ToDo Planner" }] }),
  component: AdminTodo,
});

type Priority = "low" | "medium" | "high";
type Status = "todo" | "in_progress" | "done";

interface Task {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  category: string;
  deadline: string | null;
  status: Status;
  priority: Priority;
  created_from_template: boolean;
  position: number;
}

interface Draft {
  title: string;
  description: string;
  category: string;
  deadline: string;
  priority: Priority;
  status: Status;
}

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  category: "General",
  deadline: "",
  priority: "medium",
  status: "todo",
});

function AdminTodo() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "priority">("deadline");
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    if (!wedding) return;
    const { data, error } = await supabase
      .from("todo_tasks")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("position", { ascending: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTasks((data ?? []) as Task[]);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (tasks ?? []).forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = tasks ?? [];
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (categoryFilter !== "all") list = list.filter((t) => t.category === categoryFilter);
    const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    list = [...list].sort((a, b) => {
      if (sortBy === "priority") {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }
      const ad = a.deadline ?? "9999-12-31";
      const bd = b.deadline ?? "9999-12-31";
      return ad.localeCompare(bd);
    });
    return list;
  }, [tasks, statusFilter, categoryFilter, sortBy]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    filtered.forEach((t) => {
      const list = map.get(t.category) ?? [];
      list.push(t);
      map.set(t.category, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const total = tasks?.length ?? 0;
  const done = (tasks ?? []).filter((t) => t.status === "done").length;
  const inProgress = (tasks ?? []).filter((t) => t.status === "in_progress").length;
  const overdue = (tasks ?? []).filter(
    (t) => t.status !== "done" && t.deadline && new Date(t.deadline) < new Date(),
  ).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggleDone = async (task: Task) => {
    if (!wedding) return;
    const next: Status = task.status === "done" ? "todo" : "done";
    setTasks((prev) =>
      prev ? prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)) : prev,
    );
    const { error } = await supabase
      .from("todo_tasks")
      .update({ status: next })
      .eq("id", task.id);
    if (error) {
      toast.error(error.message);
      void load();
      return;
    }
    void logAudit({
      weddingId: wedding.id,
      action: "wedding.updated",
      details: { field: "todo_task", taskId: task.id, status: next },
    });
  };

  const openCreate = () => {
    setDraft(emptyDraft());
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (t: Task) => {
    setDraft({
      title: t.title,
      description: t.description ?? "",
      category: t.category,
      deadline: t.deadline ?? "",
      priority: t.priority,
      status: t.status,
    });
    setEditing(t);
    setCreating(false);
  };

  const closeDialog = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = async () => {
    if (!wedding) return;
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      category: draft.category.trim() || "General",
      deadline: draft.deadline || null,
      priority: draft.priority,
      status: draft.status,
    };
    if (editing) {
      const { error } = await supabase
        .from("todo_tasks")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("todo_tasks").insert({
        ...payload,
        wedding_id: wedding.id,
        created_from_template: false,
      });
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    closeDialog();
    toast.success(editing ? "Task updated" : "Task added");
    void load();
  };

  const remove = async (t: Task) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    const { error } = await supabase.from("todo_tasks").delete().eq("id", t.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void load();
  };

  const seedFromTemplates = async () => {
    if (!wedding) return;
    setSeeding(true);
    const { data, error } = await supabase.rpc("seed_todo_tasks_for_wedding", {
      _wedding_id: wedding.id,
    });
    setSeeding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Added ${data ?? 0} tasks from templates`);
    void load();
  };

  if (!wedding || tasks === null) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress + stats */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div>
            <p className="font-script text-xl text-primary">your planner</p>
            <h2 className="font-display text-2xl">
              {done} / {total} tasks completed
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={seedFromTemplates}
              disabled={seeding}
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Add missing template tasks
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4" /> New task
            </Button>
          </div>
        </div>
        <Progress value={pct} className="h-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
          <Stat label="Total" value={total} />
          <Stat label="In progress" value={inProgress} />
          <Stat label="Done" value={done} />
          <Stat
            label="Overdue"
            value={overdue}
            tone={overdue > 0 ? "danger" : "muted"}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | Status)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "deadline" | "priority")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Sort by deadline</SelectItem>
            <SelectItem value="priority">Sort by priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No tasks yet. Add one or load template tasks.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, list]) => (
            <section key={category}>
              <h3 className="font-display text-lg mb-2">{category}</h3>
              <div className="rounded-2xl border border-border bg-card divide-y divide-border shadow-soft">
                {list.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggle={() => toggleDone(t)}
                    onEdit={() => openEdit(t)}
                    onDelete={() => remove(t)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Edit / create dialog */}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
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
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              />
              <Input
                type="date"
                value={draft.deadline}
                onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
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
              <Select
                value={draft.status}
                onValueChange={(v) => setDraft({ ...draft, status: v as Status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
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

function Stat({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: number;
  tone?: "muted" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`font-display text-2xl mt-1 ${
          tone === "danger" && value > 0 ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOverdue =
    task.status !== "done" && task.deadline && new Date(task.deadline) < new Date();
  const priorityColor =
    task.priority === "high"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : task.priority === "medium"
        ? "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400"
        : "bg-muted text-muted-foreground border-border";

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 ${
        task.status === "done" ? "opacity-60" : ""
      }`}
    >
      <Checkbox
        checked={task.status === "done"}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium ${
              task.status === "done" ? "line-through" : ""
            }`}
          >
            {task.title}
          </span>
          <span
            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColor}`}
          >
            {task.priority}
          </span>
          {task.status === "in_progress" && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              in progress
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
          {task.deadline ? (
            <span
              className={`inline-flex items-center gap-1 ${
                isOverdue ? "text-destructive" : ""
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CalendarDays className="w-3 h-3" />
              )}
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          ) : (
            <span>No deadline</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
