import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Clock } from "lucide-react";
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

export const Route = createFileRoute("/$slug/admin/timeline")({
  component: AdminTimeline,
});

type Visibility = "all" | "day" | "evening";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_time: string;
  visibility: Visibility;
  position: number;
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
      .select("id, title, description, event_time, visibility, position")
      .eq("wedding_id", wedding.id)
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

  if (!wedding) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Build the wedding day schedule. Choose visibility per event.
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
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <span className="font-display text-lg text-primary tabular-nums w-16 shrink-0">
                {formatTime(e.event_time)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{e.title}</p>
                {e.description && (
                  <p className="text-xs text-muted-foreground truncate">{e.description}</p>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                {e.visibility === "all" ? "everyone" : e.visibility}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setEditing(e)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(e)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
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

function formatTime(t: string): string {
  // Postgres returns "HH:MM:SS"
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
  const [time, setTime] = useState(event ? formatTime(event.event_time) : "14:30");
  const [visibility, setVisibility] = useState<Visibility>(event?.visibility ?? "all");
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
    if (isNew) {
      const { data, error } = await supabase
        .from("timeline_events")
        .insert({
          wedding_id: weddingId,
          title: title.trim(),
          description: description.trim() || null,
          event_time: `${time}:00`,
          visibility,
          position: nextPosition,
        })
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
        details: { title: title.trim() },
      });
    } else if (event) {
      const { error } = await supabase
        .from("timeline_events")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          event_time: `${time}:00`,
          visibility,
        })
        .eq("id", event.id);
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
        details: { title: title.trim() },
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
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="day">Day guests only</SelectItem>
                  <SelectItem value="evening">Evening guests only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ti">Title</Label>
            <Input id="ti" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
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
