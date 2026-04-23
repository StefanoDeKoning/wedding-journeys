import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Users } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/$slug/admin/groups")({
  component: AdminGroups,
});

interface Group {
  id: string;
  name: string;
  color: string | null;
  position: number;
}

const PRESET_COLORS = [
  "#C97A5A", "#C78C8C", "#D4B483", "#8FA9A2", "#7E5A8C", "#5A7A8C", "#A35E5E",
];

function AdminGroups() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [groups, setGroups] = useState<Group[]>([]);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Group | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const [g, gs] = await Promise.all([
      supabase.from("guest_groups").select("id, name, color, position").eq("wedding_id", wedding.id).order("position"),
      supabase.from("guests").select("guest_group_id").eq("wedding_id", wedding.id),
    ]);
    setGroups((g.data ?? []) as Group[]);
    const m = new Map<string, number>();
    for (const row of (gs.data ?? []) as { guest_group_id: string | null }[]) {
      if (row.guest_group_id) m.set(row.guest_group_id, (m.get(row.guest_group_id) ?? 0) + 1);
    }
    setCounts(m);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const remove = async (g: Group) => {
    const count = counts.get(g.id) ?? 0;
    if (count > 0) {
      if (!confirm(`Remove "${g.name}"? ${count} guest${count === 1 ? "" : "s"} will become ungrouped.`)) return;
    } else if (!confirm(`Remove "${g.name}"?`)) return;
    const { error } = await supabase.from("guest_groups").delete().eq("id", g.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "group.removed",
        targetType: "group",
        targetId: g.id,
        details: { name: g.name },
      });
    }
    toast.success("Group removed.");
    void load();
  };

  if (!wedding) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Organise guests into groups like Family Bride, Friends, Colleagues, Evening Guests…
        </p>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New group
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : groups.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No groups yet — create your first one.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li
              key={g.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <span
                className="w-3 h-10 rounded-full shrink-0"
                style={{ background: g.color ?? "var(--primary)" }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{g.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" /> {counts.get(g.id) ?? 0} guest
                  {(counts.get(g.id) ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(g)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(g)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {(editing || adding) && (
        <GroupDialog
          weddingId={wedding.id}
          group={editing}
          nextPosition={groups.length}
          onClose={() => {
            setEditing(null);
            setAdding(false);
          }}
          onSaved={() => {
            setEditing(null);
            setAdding(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function GroupDialog({
  weddingId,
  group,
  nextPosition,
  onClose,
  onSaved,
}: {
  weddingId: string;
  group: Group | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !group;
  const [name, setName] = useState(group?.name ?? "");
  const [color, setColor] = useState<string>(group?.color ?? PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    if (isNew) {
      const { data, error } = await supabase
        .from("guest_groups")
        .insert({ wedding_id: weddingId, name: name.trim(), color, position: nextPosition })
        .select("id")
        .single();
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId,
        action: "group.created",
        targetType: "group",
        targetId: data.id,
        details: { name: name.trim() },
      });
    } else if (group) {
      const { error } = await supabase
        .from("guest_groups")
        .update({ name: name.trim(), color })
        .eq("id", group.id);
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId,
        action: "group.updated",
        targetType: "group",
        targetId: group.id,
        details: { name: name.trim() },
      });
    }
    setSaving(false);
    toast.success(isNew ? "Group created." : "Group updated.");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isNew ? "New group" : "Edit group"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="gn">Name</Label>
            <Input
              id="gn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Family Bride"
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "Saving…" : isNew ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
