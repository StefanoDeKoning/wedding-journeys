import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Armchair,
  Download,
  FileDown,
  Users,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { logAudit } from "@/wedding/audit";
import { downloadCsv, toCsv } from "@/wedding/csv";

export const Route = createFileRoute("/$slug/admin/seating")({
  component: AdminSeating,
});

interface SeatingTable {
  id: string;
  name: string;
  seat_count: number;
  position: number;
}

interface AttendingGuest {
  id: string;
  first_name: string;
  last_name: string;
  guest_type: "day" | "evening";
}

interface SeatAssignment {
  id: string;
  guest_id: string;
  table_id: string;
  seat_index: number;
}

const UNASSIGNED = "__unassigned__";

function AdminSeating() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<AttendingGuest[]>([]);
  const [assignments, setAssignments] = useState<SeatAssignment[]>([]);
  const [tableDialog, setTableDialog] = useState<{
    open: boolean;
    editing: SeatingTable | null;
    name: string;
    seats: number;
  }>({ open: false, editing: null, name: "", seats: 8 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const load = async () => {
    if (!wedding) return;
    setLoading(true);

    const [tablesRes, rsvpRes, assignmentsRes] = await Promise.all([
      supabase
        .from("seating_tables")
        .select("id, name, seat_count, position")
        .eq("wedding_id", wedding.id)
        .order("position", { ascending: true }),
      supabase
        .from("rsvp_responses")
        .select("guest_id, status, guests!inner(id, first_name, last_name, guest_type, wedding_id)")
        .eq("wedding_id", wedding.id)
        .eq("status", "yes"),
      supabase
        .from("seat_assignments")
        .select("id, guest_id, table_id, seat_index")
        .eq("wedding_id", wedding.id),
    ]);

    if (tablesRes.error) toast.error(tablesRes.error.message);
    if (rsvpRes.error) toast.error(rsvpRes.error.message);
    if (assignmentsRes.error) toast.error(assignmentsRes.error.message);

    setTables((tablesRes.data ?? []) as SeatingTable[]);
    type RsvpRow = { guests: AttendingGuest };
    const attending = ((rsvpRes.data ?? []) as unknown as RsvpRow[])
      .map((r) => r.guests)
      .filter((g): g is AttendingGuest => !!g);
    setGuests(attending);
    setAssignments((assignmentsRes.data ?? []) as SeatAssignment[]);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const assignmentByGuest = useMemo(() => {
    const m = new Map<string, SeatAssignment>();
    for (const a of assignments) m.set(a.guest_id, a);
    return m;
  }, [assignments]);

  const guestsByTable = useMemo(() => {
    const m = new Map<string, AttendingGuest[]>();
    for (const t of tables) m.set(t.id, []);
    for (const g of guests) {
      const a = assignmentByGuest.get(g.id);
      if (a && m.has(a.table_id)) m.get(a.table_id)!.push(g);
    }
    return m;
  }, [tables, guests, assignmentByGuest]);

  const unassigned = useMemo(
    () => guests.filter((g) => !assignmentByGuest.has(g.id)),
    [guests, assignmentByGuest],
  );

  const guestById = useMemo(() => {
    const m = new Map<string, AttendingGuest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  if (!wedding) return null;

  const openCreateTable = () =>
    setTableDialog({ open: true, editing: null, name: "", seats: 8 });

  const openEditTable = (t: SeatingTable) =>
    setTableDialog({ open: true, editing: t, name: t.name, seats: t.seat_count });

  const saveTable = async () => {
    const name = tableDialog.name.trim();
    if (!name) {
      toast.error("Name required.");
      return;
    }
    if (tableDialog.seats < 1 || tableDialog.seats > 30) {
      toast.error("Seats must be between 1 and 30.");
      return;
    }
    if (tableDialog.editing) {
      const { error } = await supabase
        .from("seating_tables")
        .update({ name, seat_count: tableDialog.seats })
        .eq("id", tableDialog.editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId: wedding.id,
        action: "table.updated",
        targetType: "seating_table",
        targetId: tableDialog.editing.id,
        details: { name, seat_count: tableDialog.seats },
      });
      toast.success("Table updated.");
    } else {
      const position = tables.length;
      const { data, error } = await supabase
        .from("seating_tables")
        .insert({ wedding_id: wedding.id, name, seat_count: tableDialog.seats, position })
        .select("id")
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId: wedding.id,
        action: "table.created",
        targetType: "seating_table",
        targetId: data?.id,
        details: { name, seat_count: tableDialog.seats },
      });
      toast.success("Table added.");
    }
    setTableDialog({ open: false, editing: null, name: "", seats: 8 });
    void load();
  };

  const deleteTable = async (t: SeatingTable) => {
    if (!confirm(`Delete "${t.name}"? Guests at this table will be unassigned.`)) return;
    const { error } = await supabase.from("seating_tables").delete().eq("id", t.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logAudit({
      weddingId: wedding.id,
      action: "table.removed",
      targetType: "seating_table",
      targetId: t.id,
      details: { name: t.name },
    });
    toast.success("Deleted.");
    void load();
  };

  const assignGuestToTable = async (guestId: string, tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const occupants = guestsByTable.get(tableId) ?? [];
    if (occupants.length >= table.seat_count) {
      toast.error(`"${table.name}" is full (${table.seat_count} seats).`);
      return;
    }
    const seat_index = nextFreeSeat(occupants.length, table.seat_count);

    const existing = assignmentByGuest.get(guestId);
    if (existing) {
      const { error } = await supabase
        .from("seat_assignments")
        .update({ table_id: tableId, seat_index })
        .eq("id", existing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("seat_assignments").insert({
        wedding_id: wedding.id,
        guest_id: guestId,
        table_id: tableId,
        seat_index,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    void logAudit({
      weddingId: wedding.id,
      action: "seat.assigned",
      targetType: "guest",
      targetId: guestId,
      details: { table_id: tableId },
    });
    void load();
  };

  const unassignGuest = async (guestId: string) => {
    const a = assignmentByGuest.get(guestId);
    if (!a) return;
    const { error } = await supabase.from("seat_assignments").delete().eq("id", a.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logAudit({
      weddingId: wedding.id,
      action: "seat.unassigned",
      targetType: "guest",
      targetId: guestId,
      details: {},
    });
    void load();
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const guestId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    if (overId === UNASSIGNED) {
      void unassignGuest(guestId);
      return;
    }
    void assignGuestToTable(guestId, overId);
  };

  const exportCsv = () => {
    const rows: Array<Record<string, unknown>> = [];
    for (const t of tables) {
      const occ = guestsByTable.get(t.id) ?? [];
      if (occ.length === 0) {
        rows.push({ table: t.name, seats: t.seat_count, guest: "(empty)" });
      } else {
        for (const g of occ) {
          rows.push({
            table: t.name,
            seats: t.seat_count,
            guest: `${g.first_name} ${g.last_name}`,
            guest_type: g.guest_type,
          });
        }
      }
    }
    for (const g of unassigned) {
      rows.push({
        table: "(unassigned)",
        seats: "",
        guest: `${g.first_name} ${g.last_name}`,
        guest_type: g.guest_type,
      });
    }
    downloadCsv(`${wedding.slug}-seating.csv`, toCsv(rows));
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 48;
    let y = 64;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Seating plan", marginX, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text(wedding.wedding_name ?? wedding.slug, marginX, y + 14);
    doc.setTextColor(0);
    y += 36;

    const ensureSpace = (need: number) => {
      if (y + need > pageHeight - 48) {
        doc.addPage();
        y = 64;
      }
    };

    for (const t of tables) {
      const occ = guestsByTable.get(t.id) ?? [];
      ensureSpace(40 + occ.length * 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`${t.name}`, marginX, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(110);
      doc.text(`${occ.length} / ${t.seat_count} seats`, pageWidth - marginX, y, {
        align: "right",
      });
      doc.setTextColor(0);
      y += 16;
      doc.setDrawColor(220);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 12;

      if (occ.length === 0) {
        doc.setTextColor(150);
        doc.setFont("helvetica", "italic");
        doc.text("(empty)", marginX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        y += 18;
      } else {
        for (let i = 0; i < occ.length; i++) {
          const g = occ[i];
          doc.setFontSize(11);
          doc.text(`${i + 1}.  ${g.first_name} ${g.last_name}`, marginX + 4, y);
          doc.setTextColor(150);
          doc.setFontSize(9);
          doc.text(g.guest_type, pageWidth - marginX, y, { align: "right" });
          doc.setTextColor(0);
          y += 14;
        }
        y += 6;
      }
      y += 10;
    }

    if (unassigned.length > 0) {
      ensureSpace(40 + unassigned.length * 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Unassigned", marginX, y);
      y += 16;
      doc.setDrawColor(220);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 12;
      for (const g of unassigned) {
        doc.setFontSize(11);
        doc.text(`• ${g.first_name} ${g.last_name}`, marginX + 4, y);
        doc.setTextColor(150);
        doc.setFontSize(9);
        doc.text(g.guest_type, pageWidth - marginX, y, { align: "right" });
        doc.setTextColor(0);
        y += 14;
      }
    }

    doc.save(`${wedding.slug}-seating.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Drag guests from the left into a table. Only guests who RSVP'd "yes" appear here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCreateTable} className="rounded-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1.5" /> Add table
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            className="rounded-full"
            disabled={tables.length === 0 && guests.length === 0}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPdf}
            className="rounded-full"
            disabled={tables.length === 0 && guests.length === 0}
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" /> PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <UnassignedColumn guests={unassigned} />

            <div>
              {tables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  <Armchair className="w-8 h-8 mx-auto opacity-40 mb-3" />
                  No tables yet. Add your first table to get started.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tables.map((t) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      occupants={guestsByTable.get(t.id) ?? []}
                      onEdit={() => openEditTable(t)}
                      onDelete={() => deleteTable(t)}
                      onUnseat={(gid) => void unassignGuest(gid)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DndContext>
      )}

      <Dialog
        open={tableDialog.open}
        onOpenChange={(open) =>
          setTableDialog((s) => ({ ...s, open }))
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {tableDialog.editing ? "Edit table" : "Add table"}
            </DialogTitle>
            <DialogDescription>
              Give the table a friendly name and number of seats.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-name" className="text-xs">Name</Label>
              <Input
                id="t-name"
                value={tableDialog.name}
                onChange={(e) =>
                  setTableDialog((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Table 1"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-seats" className="text-xs">Seats</Label>
              <Input
                id="t-seats"
                type="number"
                min={1}
                max={30}
                value={tableDialog.seats}
                onChange={(e) =>
                  setTableDialog((s) => ({
                    ...s,
                    seats: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() =>
                setTableDialog({ open: false, editing: null, name: "", seats: 8 })
              }
            >
              Cancel
            </Button>
            <Button onClick={saveTable} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            {/* Hidden helper for type-only reference */}
            <span className="hidden">
              {Array.from(guestById.keys()).length}
            </span>
    </div>
  );
}

function nextFreeSeat(currentCount: number, max: number): number {
  return Math.min(currentCount, max - 1);
}

function UnassignedColumn({ guests }: { guests: AttendingGuest[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: UNASSIGNED });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border bg-card p-4 shadow-soft h-fit lg:sticky lg:top-4 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="font-display text-base">Unassigned</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {guests.length}
        </span>
      </div>
      {guests.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          Everyone has a seat ✨
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {guests.map((g) => (
            <DraggableGuest key={g.id} guest={g} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DraggableGuest({ guest }: { guest: AttendingGuest }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({ id: guest.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-background text-sm cursor-grab active:cursor-grabbing transition-colors ${
        isDragging
          ? "border-primary shadow-lg opacity-80"
          : "border-border hover:border-primary/40"
      }`}
    >
      <span className="flex-1 truncate">
        {guest.first_name} {guest.last_name}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {guest.guest_type}
      </span>
    </li>
  );
}

function TableCard({
  table,
  occupants,
  onEdit,
  onDelete,
  onUnseat,
}: {
  table: SeatingTable;
  occupants: AttendingGuest[];
  onEdit: () => void;
  onDelete: () => void;
  onUnseat: (guestId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: table.id });
  const free = table.seat_count - occupants.length;
  const full = free <= 0;
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border bg-card p-4 shadow-soft transition-colors ${
        isOver
          ? "border-primary bg-primary/5"
          : full
            ? "border-amber-300/50"
            : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-base flex items-center gap-1.5">
            <Armchair className="w-4 h-4 text-primary" />
            {table.name}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {occupants.length} / {table.seat_count} seats
            {full && " · full"}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {occupants.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
          Drop a guest here
        </p>
      ) : (
        <ul className="space-y-1.5">
          {occupants.map((g, i) => (
            <li
              key={g.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 text-sm"
            >
              <span className="text-[10px] text-muted-foreground w-4 text-center">
                {i + 1}
              </span>
              <span className="flex-1 truncate">
                {g.first_name} {g.last_name}
              </span>
              <button
                type="button"
                onClick={() => onUnseat(g.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
