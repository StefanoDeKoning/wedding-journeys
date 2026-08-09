import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Clock, MapPin, GripVertical, Eye, EyeOff } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  TIMELINE_PICTURES,
  resolveTimelinePicture,
  type TimelinePicture,
} from "@/wedding/timelineIllustrations";
import {
  TIMELINE_CATEGORIES,
  categoryMeta,
  type TimelineCategory,
} from "@/wedding/timelineCategories";

export const Route = createFileRoute("/$slug/admin/timeline")({
  component: AdminTimeline,
});

type Visibility = "all" | "day" | "evening";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: TimelineCategory;
  illustration: string | null;
  event_time: string;
  visibility: Visibility;
  position: number;
  is_visible: boolean;
}

function AdminTimeline() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Event | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("timeline_events")
      .select("id, title, description, location, category, illustration, event_time, visibility, position, is_visible")
      .eq("wedding_id", wedding.id)
      .order("position")
      .order("event_time");
    if (error) toast.error(error.message);
    setEvents((data ?? []) as Event[]);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const remove = async (e: Event) => {
    if (!confirm(`Delete "${e.title}"?`)) return;
    const { error } = await supabase.from("timeline_events").delete().eq("id", e.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "timeline.removed",
        targetType: "timeline_event",
        targetId: e.id,
        details: { title: e.title },
      });
    }
    toast.success("Event removed.");
    void load();
  };

  const toggleVisible = async (e: Event) => {
    const next = !e.is_visible;
    setEvents((prev) => prev.map((x) => (x.id === e.id ? { ...x, is_visible: next } : x)));
    const { error } = await supabase
      .from("timeline_events")
      .update({ is_visible: next })
      .eq("id", e.id);
    if (error) {
      toast.error(error.message);
      void load();
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = async (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIdx = events.findIndex((e) => e.id === active.id);
    const newIdx = events.findIndex((e) => e.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(events, oldIdx, newIdx).map((e, i) => ({ ...e, position: i }));
    setEvents(next);
    // persist
    const updates = next.map((e) =>
      supabase.from("timeline_events").update({ position: e.position }).eq("id", e.id),
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
          Build your wedding day. Drag to reorder, hide events from guests anytime.
        </p>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add event
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No events yet — add your first.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              {events.map((e) => (
                <SortableRow
                  key={e.id}
                  event={e}
                  onEdit={() => setEditing(e)}
                  onRemove={() => remove(e)}
                  onToggleVisible={() => toggleVisible(e)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {(editing || adding) && (
        <EventDialog
          weddingId={wedding.id}
          event={editing}
          nextPosition={events.length}
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
  event,
  onEdit,
  onRemove,
  onToggleVisible,
}: {
  event: Event;
  onEdit: () => void;
  onRemove: () => void;
  onToggleVisible: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const meta = categoryMeta(event.category);
  const Icon = meta.Icon;
  const picture = resolveTimelinePicture(event.illustration, event.category, event.title);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors ${
        !event.is_visible ? "opacity-60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${meta.accent}`}
      >
        <Icon className="w-4 h-4" />
      </span>
      {picture ? (
        <img
          src={picture.url}
          alt={picture.alt}
          loading="lazy"
          width={944}
          height={704}
          className="h-10 w-12 shrink-0 object-contain"
        />
      ) : (
        <span className="h-10 w-12 shrink-0" />
      )}
      <span className="font-display text-lg text-primary tabular-nums w-16 shrink-0">
        {formatTime(event.event_time)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{event.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" /> {event.location}
            </span>
          )}
          {event.description && <span className="truncate">· {event.description}</span>}
        </div>
      </div>
      <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full border border-border">
        {event.visibility === "all" ? "everyone" : event.visibility}
      </span>
      <Button variant="ghost" size="sm" onClick={onToggleVisible} title={event.is_visible ? "Hide from guests" : "Show to guests"}>
        {event.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </Button>
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

function formatTime(t: string): string {
  return t.slice(0, 5);
}

function EventDialog({
  weddingId,
  event,
  nextPosition,
  onClose,
  onSaved,
}: {
  weddingId: string;
  event: Event | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [category, setCategory] = useState<TimelineCategory>(event?.category ?? "custom");
  const [time, setTime] = useState(event ? formatTime(event.event_time) : "14:30");
  const [visibility, setVisibility] = useState<Visibility>(event?.visibility ?? "all");
  const [illustration, setIllustration] = useState<TimelinePicture | "auto">(
    (event?.illustration as TimelinePicture | null) ?? "auto",
  );
  const [isVisible, setIsVisible] = useState(event?.is_visible ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      toast.error("Time must be HH:MM.");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      category,
      illustration: illustration === "auto" ? null : illustration,
      event_time: `${time}:00`,
      visibility,
      is_visible: isVisible,
    };
    if (isNew) {
      const { data, error } = await supabase
        .from("timeline_events")
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
        action: "timeline.added",
        targetType: "timeline_event",
        targetId: data.id,
        details: { title: payload.title },
      });
    } else if (event) {
      const { error } = await supabase.from("timeline_events").update(payload).eq("id", event.id);
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId,
        action: "timeline.updated",
        targetType: "timeline_event",
        targetId: event.id,
        details: { title: payload.title },
      });
    }
    setSaving(false);
    toast.success(isNew ? "Event added." : "Event updated.");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add event" : "Edit event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tm">
                <Clock className="w-3 h-3 inline mr-1" /> Time
              </Label>
              <Input id="tm" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TimelineCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMELINE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ti">Title</Label>
            <Input id="ti" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lc">
              <MapPin className="w-3 h-3 inline mr-1" /> Location (optional)
            </Label>
            <Input id="lc" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds">Description (optional)</Label>
            <Textarea
              id="ds"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Picture on the card</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setIllustration("auto")}
                className={`flex h-16 items-center justify-center rounded-md border px-1 text-[10px] leading-tight text-muted-foreground ${
                  illustration === "auto" ? "border-primary ring-1 ring-primary" : "border-input"
                }`}
              >
                Automatic
              </button>
              {TIMELINE_PICTURES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  title={p.label}
                  onClick={() => setIllustration(p.value)}
                  className={`flex h-16 items-center justify-center rounded-md border p-1 ${
                    illustration === p.value ? "border-primary ring-1 ring-primary" : "border-input"
                  }`}
                >
                  <img
                    src={p.url}
                    alt={p.alt}
                    loading="lazy"
                    width={944}
                    height={704}
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="day">Day guests only</SelectItem>
                  <SelectItem value="evening">Evening guests only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center justify-between rounded-md border border-input px-3 py-2 h-9">
              <span className="text-sm">Visible to guests</span>
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
            </label>
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
