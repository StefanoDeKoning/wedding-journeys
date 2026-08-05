import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, GripVertical, BookHeart } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DecorMotif } from "@/theme/types";

export const Route = createFileRoute("/$slug/admin/story")({
  component: AdminStory,
});

const STORY_MOTIFS: { value: DecorMotif; label: string }[] = [
  { value: "rose", label: "Rose" },
  { value: "peony", label: "Peony" },
  { value: "bouquet", label: "Bouquet" },
  { value: "ceremony-arch", label: "Ceremony arch" },
  { value: "toast", label: "Cocktails" },
  { value: "dinner", label: "Dinner" },
  { value: "cake", label: "Cake" },
  { value: "music-note", label: "Music" },
  { value: "dancing", label: "Dancing" },
  { value: "castle", label: "Venue" },
  { value: "fireworks", label: "Fireworks" },
  { value: "sunset", label: "Sunset" },
  { value: "flourish", label: "Flourish (default)" },
];

interface Chapter {
  id: string;
  position: number;
  chapter_label: string | null;
  title: string;
  body: string;
  event_date: string | null;
  illustration_motif: string | null;
}

function AdminStory() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("story_chapters")
      .select("id, position, chapter_label, title, body, event_date, illustration_motif")
      .eq("wedding_id", wedding.id)
      .order("position");
    if (error) toast.error(error.message);
    setChapters((data ?? []) as Chapter[]);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const remove = async (c: Chapter) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    const { error } = await supabase.from("story_chapters").delete().eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "story.removed",
        targetType: "story_chapter",
        targetId: c.id,
        details: { title: c.title },
      });
    }
    toast.success("Chapter removed.");
    void load();
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = async (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIdx = chapters.findIndex((c) => c.id === active.id);
    const newIdx = chapters.findIndex((c) => c.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(chapters, oldIdx, newIdx).map((c, i) => ({ ...c, position: i }));
    setChapters(next);
    const updates = next.map((c) =>
      supabase.from("story_chapters").update({ position: c.position }).eq("id", c.id),
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) {
      toast.error("Could not save order.");
      void load();
    }
  };

  if (!wedding) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Tell your story in chapters. Drag to reorder — guests see them in this sequence.
        </p>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add chapter
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : chapters.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No chapters yet — add the first moment of your story.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              {chapters.map((c) => (
                <SortableRow key={c.id} chapter={c} onEdit={() => setEditing(c)} onRemove={() => remove(c)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {(editing || adding) && (
        <ChapterDialog
          weddingId={wedding.id}
          chapter={editing}
          nextPosition={chapters.length}
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

function SortableRow({
  chapter,
  onEdit,
  onRemove,
}: {
  chapter: Chapter;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 bg-primary/10 text-primary">
        <BookHeart className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {chapter.chapter_label ? `${chapter.chapter_label} — ` : ""}
          {chapter.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{chapter.body}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </li>
  );
}

function ChapterDialog({
  weddingId,
  chapter,
  nextPosition,
  onClose,
  onSaved,
}: {
  weddingId: string;
  chapter: Chapter | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !chapter;
  const [chapterLabel, setChapterLabel] = useState(chapter?.chapter_label ?? "");
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [body, setBody] = useState(chapter?.body ?? "");
  const [eventDate, setEventDate] = useState(chapter?.event_date ?? "");
  const [motif, setMotif] = useState<string>(chapter?.illustration_motif ?? "flourish");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and story text are required.");
      return;
    }
    setSaving(true);
    const payload = {
      chapter_label: chapterLabel.trim() || null,
      title: title.trim(),
      body: body.trim(),
      event_date: eventDate || null,
      illustration_motif: motif,
    };
    if (isNew) {
      const { data, error } = await supabase
        .from("story_chapters")
        .insert({ ...payload, wedding_id: weddingId, position: nextPosition })
        .select("id")
        .single();
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId,
        action: "story.added",
        targetType: "story_chapter",
        targetId: data.id,
        details: { title: payload.title },
      });
    } else if (chapter) {
      const { error } = await supabase.from("story_chapters").update(payload).eq("id", chapter.id);
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId,
        action: "story.updated",
        targetType: "story_chapter",
        targetId: chapter.id,
        details: { title: payload.title },
      });
    }
    setSaving(false);
    toast.success(isNew ? "Chapter added." : "Chapter updated.");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add chapter" : "Edit chapter"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cl">Chapter label (optional)</Label>
              <Input id="cl" value={chapterLabel} onChange={(e) => setChapterLabel(e.target.value)} placeholder="Chapter One" maxLength={60} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed">Date (optional)</Label>
              <Input id="ed" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ti">Title</Label>
            <Input id="ti" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bd">Story text</Label>
            <Textarea id="bd" value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={2000} />
          </div>
          <div className="space-y-1.5">
            <Label>Illustration</Label>
            <Select value={motif} onValueChange={setMotif}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STORY_MOTIFS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "Saving…" : isNew ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
