import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Users,
  UserPlus,
  Calendar,
  Save,
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  FileText,
  Copy,
  Check,
  Tag,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { logAudit } from "@/wedding/audit";
import { downloadCsv, toCsv } from "@/wedding/csv";
import { dietaryLabel, DIETARY_OPTIONS, type DietaryValue } from "@/wedding/dietary";
import jsPDF from "jspdf";

export const Route = createFileRoute("/$slug/admin/rsvp")({
  head: () => ({
    meta: [
      { title: "Guests & RSVP" },
      { name: "description", content: "Manage guests, groups and RSVP responses." },
    ],
  }),
  component: AdminRsvpOverview,
});

type GuestType = "day" | "evening" | "full_day";
type AgeType = "adult" | "child";

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  invitation_code: string;
  guest_type: GuestType;
  age_type: AgeType;
  guest_group_id: string | null;
  notes: string | null;
  plus_one_allowed: boolean;
}

interface Group {
  id: string;
  name: string;
  color: string | null;
  position: number;
}

interface RsvpRow {
  guest_id: string;
  status: "yes" | "no";
  attendance: "day" | "evening" | "both" | null;
  plus_one_name: string | null;
  dietary_tags: string[];
  dietary_other: string | null;
  comments: string | null;
}

function AdminRsvpOverview() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rsvps, setRsvps] = useState<Map<string, RsvpRow>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const [g, gg, r] = await Promise.all([
      supabase
        .from("guests")
        .select(
          "id, first_name, last_name, email, invitation_code, guest_type, age_type, guest_group_id, notes, plus_one_allowed",
        )
        .eq("wedding_id", wedding.id)
        .order("last_name"),
      supabase
        .from("guest_groups")
        .select("id, name, color, position")
        .eq("wedding_id", wedding.id)
        .order("position"),
      supabase
        .from("rsvp_responses")
        .select(
          "guest_id, status, attendance, plus_one_name, dietary_tags, dietary_other, comments",
        )
        .eq("wedding_id", wedding.id),
    ]);
    setGuests((g.data ?? []) as Guest[]);
    setGroups((gg.data ?? []) as Group[]);
    const m = new Map<string, RsvpRow>();
    for (const row of (r.data ?? []) as RsvpRow[]) m.set(row.guest_id, row);
    setRsvps(m);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  // Realtime updates
  useEffect(() => {
    if (!wedding) return;
    const channel = supabase
      .channel(`admin-rsvp-${wedding.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvp_responses", filter: `wedding_id=eq.${wedding.id}` },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guests", filter: `wedding_id=eq.${wedding.id}` },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guest_groups", filter: `wedding_id=eq.${wedding.id}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const stats = useMemo(() => {
    const total = guests.length;
    let yes = 0;
    let no = 0;
    let plusOnes = 0;
    for (const g of guests) {
      const r = rsvps.get(g.id);
      if (!r) continue;
      if (r.status === "yes") yes++;
      else if (r.status === "no") no++;
      if (
        g.plus_one_allowed &&
        r.status === "yes" &&
        r.plus_one_name &&
        r.plus_one_name.trim().length > 0
      ) {
        plusOnes++;
      }
    }
    const responded = yes + no;
    const noResponse = total - responded;
    const pct = total === 0 ? 0 : Math.round((responded / total) * 100);
    return { total, yes, no, noResponse, responded, pct, plusOnes };
  }, [guests, rsvps]);

  const rows = useMemo(() => {
    return guests.map((g) => {
      const r = rsvps.get(g.id) ?? null;
      const group = groups.find((gr) => gr.id === g.guest_group_id) ?? null;
      const hasPlusOne =
        !!r &&
        r.status === "yes" &&
        g.plus_one_allowed &&
        !!r.plus_one_name &&
        r.plus_one_name.trim().length > 0;
      const attendees = r?.status === "yes" ? (hasPlusOne ? 2 : 1) : 0;
      return { g, r, group, hasPlusOne, attendees };
    });
  }, [guests, rsvps, groups]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ g }) => {
      if (filterGroup === "none" && g.guest_group_id) return false;
      if (filterGroup !== "all" && filterGroup !== "none" && g.guest_group_id !== filterGroup)
        return false;
      if (!q) return true;
      return (
        g.first_name.toLowerCase().includes(q) ||
        g.last_name.toLowerCase().includes(q) ||
        g.invitation_code.toLowerCase().includes(q) ||
        (g.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, search, filterGroup]);

  const removeGuest = async (g: Guest) => {
    if (!confirm(`Remove ${g.first_name} ${g.last_name}?`)) return;
    const { error } = await supabase.from("guests").delete().eq("id", g.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (wedding) {
      void logAudit({
        weddingId: wedding.id,
        action: "guest.removed",
        targetType: "guest",
        targetId: g.id,
        details: { name: `${g.first_name} ${g.last_name}` },
      });
    }
    toast.success("Guest removed.");
    void load();
  };

  const buildExportRows = () =>
    rows.map(({ g, r, group, attendees }) => ({
      first_name: g.first_name,
      last_name: g.last_name,
      invitation_code: g.invitation_code,
      email: g.email ?? "",
      rsvp_status: r?.status ?? "no reply",
      attendance: r?.attendance ?? "",
      guest_type: guestTypeLabel(g.guest_type),
      age_type: g.age_type,
      plus_one_allowed: g.plus_one_allowed ? "yes" : "no",
      plus_one_name: r?.plus_one_name ?? "",
      group: group?.name ?? "",
      attendees,
      dietary_tags: ((r?.dietary_tags ?? []) as DietaryValue[]).map(dietaryLabel).join("; "),
      dietary_other: r?.dietary_other ?? "",
      comments: r?.comments ?? "",
      notes: g.notes ?? "",
    }));

  const exportCsv = () => {
    if (!wedding) return;
    downloadCsv(`${wedding.slug}-guests.csv`, toCsv(buildExportRows()));
  };

  const exportPdf = () => {
    if (!wedding) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 32;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${wedding.wedding_name ?? wedding.slug} — Guest list`, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `${stats.total} guests · ${stats.yes} attending · ${stats.no} declined · ${stats.noResponse} no reply · ${stats.plusOnes} plus-ones · ${stats.yes + stats.plusOnes} attendees`,
      margin,
      y,
    );
    y += 18;
    doc.setTextColor(0);

    const headers = [
      "Name",
      "Code",
      "RSVP",
      "Type",
      "Age",
      "+1",
      "Group",
      "Attendees",
      "Dietary",
    ];
    const colWidths = [110, 60, 55, 55, 38, 70, 90, 50, 240];

    const drawRow = (cells: string[], bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(9);
      let x = margin;
      let rowHeight = 14;
      const wrapped = cells.map((c, i) => {
        const w = colWidths[i] - 4;
        return doc.splitTextToSize(c || "—", w) as string[];
      });
      rowHeight = Math.max(14, ...wrapped.map((w) => w.length * 11 + 4));
      if (y + rowHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      wrapped.forEach((lines, i) => {
        doc.text(lines, x + 2, y + 10);
        x += colWidths[i];
      });
      // bottom border
      doc.setDrawColor(220);
      doc.line(margin, y + rowHeight, margin + colWidths.reduce((a, b) => a + b, 0), y + rowHeight);
      y += rowHeight;
    };

    drawRow(headers, true);
    for (const { g, r, group, attendees, hasPlusOne } of rows) {
      const plusOneStr = g.plus_one_allowed
        ? hasPlusOne
          ? `+ ${r?.plus_one_name}`
          : "allowed"
        : "no";
      const dietary = [
        ...((r?.dietary_tags ?? []) as DietaryValue[]).map(dietaryLabel),
        r?.dietary_other ?? "",
      ]
        .filter(Boolean)
        .join(", ");
      drawRow([
        `${g.first_name} ${g.last_name}`,
        g.invitation_code,
        r?.status === "yes" ? "Attending" : r?.status === "no" ? "Declined" : "No reply",
        guestTypeLabel(g.guest_type),
        g.age_type,
        plusOneStr,
        group?.name ?? "",
        String(attendees),
        dietary,
      ]);
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pages} · Generated ${new Date().toLocaleDateString()}`,
        pageWidth - margin,
        pageHeight - 16,
        { align: "right" },
      );
    }

    doc.save(`${wedding.slug}-guests.pdf`);
  };

  if (!wedding) return null;

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-script text-xl text-primary">replies so far</p>
            <h2 className="font-display text-2xl">RSVP progress</h2>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl text-primary">{stats.pct}%</p>
            <p className="text-xs text-muted-foreground">
              {stats.responded} of {stats.total} guests
            </p>
          </div>
        </div>
        <Progress value={stats.pct} className="h-3" />
        <p className="mt-3 text-xs text-muted-foreground">
          {stats.noResponse} guest{stats.noResponse === 1 ? "" : "s"} still to reply.
        </p>
      </section>

      {/* Deadline */}
      <DeadlineCard weddingId={wedding.id} initialDeadline={wedding.rsvp_deadline} />

      {/* Stats cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckCircle2} label="Attending" value={stats.yes} tone="primary" />
        <StatCard icon={XCircle} label="Declined" value={stats.no} tone="muted" />
        <StatCard icon={CircleDashed} label="No response" value={stats.noResponse} tone="muted" />
      </section>

      {/* Attendees / plus-ones */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg">Total attendees</h3>
          </div>
          <p className="font-display text-4xl">{stats.yes + stats.plusOnes}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.yes} guest{stats.yes === 1 ? "" : "s"} + {stats.plusOnes} plus-one
            {stats.plusOnes === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg">Plus-ones confirmed</h3>
          </div>
          <p className="font-display text-4xl">{stats.plusOnes}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {guests.filter((g) => g.plus_one_allowed).length} guest
            {guests.filter((g) => g.plus_one_allowed).length === 1 ? "" : "s"} allowed to bring
            someone.
          </p>
        </div>
      </section>

      {/* Guest management */}
      <section className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex flex-col gap-3 p-5 border-b border-border">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-display text-lg">Guest list</h3>
              <p className="text-xs text-muted-foreground">
                Add, edit and track every guest in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-full">
                <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPdf} className="rounded-full">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setAdding(true)}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add guest
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, email…"
                className="pl-9"
              />
            </div>
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                <SelectItem value="none">No group</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Invitation code</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>+1 allowed</TableHead>
                <TableHead>+1 confirmed</TableHead>
                <TableHead className="text-center">Attendees</TableHead>
                <TableHead>Dietary notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {guests.length === 0
                      ? "No guests yet — add your first one."
                      : "No guests match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map(({ g, r, group, hasPlusOne, attendees }) => {
                  const dietary = [
                    ...((r?.dietary_tags ?? []) as DietaryValue[]).map(dietaryLabel),
                    r?.dietary_other ?? "",
                  ]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <TableRow key={g.id}>
                      <TableCell>
                        <div className="font-medium">
                          {g.first_name} {g.last_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{guestTypeLabel(g.guest_type)}</span>
                          {g.age_type === "child" && <span>· child</span>}
                          {group && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                              style={{
                                background: `color-mix(in oklab, ${group.color ?? "var(--primary)"} 15%, transparent)`,
                                color: group.color ?? undefined,
                              }}
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {group.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <CopyableCode code={g.invitation_code} />
                      </TableCell>
                      <TableCell>
                        <RsvpBadge status={r?.status ?? null} />
                      </TableCell>
                      <TableCell>
                        {g.plus_one_allowed ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasPlusOne ? (
                          <span className="text-sm">{r?.plus_one_name}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">{attendees}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {dietary || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(g)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGuest(g)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {(editing || adding) && (
        <GuestDialog
          weddingId={wedding.id}
          guest={editing}
          groups={groups}
          rsvp={editing ? (rsvps.get(editing.id) ?? null) : null}
          onGroupsChanged={() => void load()}
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

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border"
      title="Copy invitation code"
    >
      {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
      {code}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  tone: "primary" | "muted" | "amber";
}) {
  const toneCls =
    tone === "primary"
      ? "text-primary"
      : tone === "amber"
        ? "text-amber-500"
        : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <Icon className={`w-4 h-4 ${toneCls}`} />
      <p className="text-3xl font-display mt-3">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function RsvpBadge({ status }: { status: "yes" | "no" | null }) {
  if (status === "yes")
    return (
      <Badge className="bg-primary/15 text-primary border-0 hover:bg-primary/20">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Attending
      </Badge>
    );
  if (status === "no")
    return (
      <Badge variant="secondary" className="border-0">
        <XCircle className="w-3 h-3 mr-1" /> Declined
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CircleDashed className="w-3 h-3 mr-1" /> No reply
    </Badge>
  );
}

function DeadlineCard({
  weddingId,
  initialDeadline,
}: {
  weddingId: string;
  initialDeadline: string | null;
}) {
  const initial = initialDeadline ? initialDeadline.slice(0, 10) : "";
  const [date, setDate] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = date !== initial;
  const passed = !!initialDeadline && new Date(initialDeadline).getTime() < Date.now();

  const save = async () => {
    setSaving(true);
    const value = date ? `${date}T23:59:59Z` : null;
    const { error } = await supabase
      .from("weddings")
      .update({ rsvp_deadline: value })
      .eq("id", weddingId);
    setSaving(false);
    if (error) {
      toast.error("Could not save deadline.");
      return;
    }
    toast.success(date ? "Deadline saved." : "Deadline cleared.");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 text-primary p-2">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg">Respond before</h3>
            <p className="text-xs text-muted-foreground">
              After this date, guests can no longer submit or change their RSVP.
            </p>
            {passed && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Deadline has passed — RSVP is closed for guests.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
          <Button onClick={save} disabled={!dirty || saving} size="sm" className="rounded-full">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            Save
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- helpers ----------------------------- */

function guestTypeLabel(t: GuestType): string {
  if (t === "full_day") return "full day";
  return t;
}

function answerLabel(a: "yes" | "no" | null): string {
  if (a === "yes") return "Joyfully yes";
  if (a === "no") return "Sadly no";
  return "Awaiting reply";
}

function attendanceOptionsFor(
  gt: GuestType,
): { value: "day" | "evening" | "both"; label: string }[] {
  if (gt === "day") return [{ value: "day", label: "Day only" }];
  if (gt === "evening") return [{ value: "evening", label: "Evening only" }];
  return [
    { value: "day", label: "Day" },
    { value: "evening", label: "Evening" },
    { value: "both", label: "Both" },
  ];
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/* --------------------------- GuestDialog --------------------------- */

function GuestDialog({
  weddingId,
  guest,
  groups,
  rsvp,
  onClose,
  onSaved,
  onGroupsChanged,
}: {
  weddingId: string;
  guest: Guest | null;
  groups: Group[];
  rsvp: RsvpRow | null;
  onClose: () => void;
  onSaved: () => void;
  onGroupsChanged: () => void;
}) {
  const isNew = !guest;
  const [firstName, setFirstName] = useState(guest?.first_name ?? "");
  const [lastName, setLastName] = useState(guest?.last_name ?? "");
  const [email, setEmail] = useState(guest?.email ?? "");
  const [code, setCode] = useState(guest?.invitation_code ?? generateCode());
  const [guestType, setGuestType] = useState<GuestType>(guest?.guest_type ?? "day");
  const [ageType, setAgeType] = useState<AgeType>(guest?.age_type ?? "adult");
  const [groupId, setGroupId] = useState<string | null>(guest?.guest_group_id ?? null);
  const [notes, setNotes] = useState(guest?.notes ?? "");
  const [plusOneAllowed, setPlusOneAllowed] = useState<boolean>(guest?.plus_one_allowed ?? false);

  const [rsvpStatus, setRsvpStatus] = useState<"yes" | "no" | "none">(rsvp?.status ?? "none");
  const [attendance, setAttendance] = useState<"day" | "evening" | "both" | null>(
    rsvp?.attendance ?? null,
  );
  const [plusOne, setPlusOne] = useState(rsvp?.plus_one_name ?? "");
  const [tags, setTags] = useState<DietaryValue[]>(
    (rsvp?.dietary_tags ?? []) as DietaryValue[],
  );
  const [dietaryOther, setDietaryOther] = useState(rsvp?.dietary_other ?? "");
  const [rsvpComments, setRsvpComments] = useState(rsvp?.comments ?? "");

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }
    if (code.trim().length < 4) {
      toast.error("Invitation code is too short.");
      return;
    }
    setSaving(true);
    let savedId = guest?.id ?? null;
    if (isNew) {
      const { data, error } = await supabase
        .from("guests")
        .insert({
          wedding_id: weddingId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || null,
          invitation_code: code.trim().toUpperCase(),
          guest_type: guestType,
          age_type: ageType,
          guest_group_id: groupId,
          notes: notes.trim() || null,
          plus_one_allowed: plusOneAllowed,
        })
        .select("id")
        .single();
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      savedId = data.id;
      void logAudit({
        weddingId,
        action: "guest.added",
        targetType: "guest",
        targetId: savedId,
        details: { name: `${firstName} ${lastName}` },
      });
    } else if (guest) {
      const { error } = await supabase
        .from("guests")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || null,
          invitation_code: code.trim().toUpperCase(),
          guest_type: guestType,
          age_type: ageType,
          guest_group_id: groupId,
          notes: notes.trim() || null,
          plus_one_allowed: plusOneAllowed,
        })
        .eq("id", guest.id);
      if (error) {
        setSaving(false);
        toast.error(error.message);
        return;
      }
      void logAudit({
        weddingId,
        action: "guest.updated",
        targetType: "guest",
        targetId: guest.id,
        details: { name: `${firstName} ${lastName}` },
      });
    }

    if (savedId) {
      if (rsvpStatus === "none") {
        if (rsvp) {
          await supabase.from("rsvp_responses").delete().eq("guest_id", savedId);
        }
      } else {
        const { error: rErr } = await supabase.from("rsvp_responses").upsert(
          {
            wedding_id: weddingId,
            guest_id: savedId,
            status: rsvpStatus,
            attendance: rsvpStatus === "yes" ? attendance : null,
            plus_one_name: plusOne.trim() || null,
            dietary_tags: tags,
            dietary_other: dietaryOther.trim() || null,
            comments: rsvpComments.trim() || null,
            edited_by_admin: true,
          },
          { onConflict: "guest_id" },
        );
        if (rErr) {
          setSaving(false);
          toast.error(rErr.message);
          return;
        }
        void logAudit({
          weddingId,
          action: "rsvp.updated",
          targetType: "guest",
          targetId: savedId,
          details: { status: rsvpStatus },
        });
      }
    }

    setSaving(false);
    toast.success(isNew ? "Guest added." : "Guest updated.");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add a guest" : "Edit guest"}</DialogTitle>
          <DialogDescription>
            Manage details, group, and RSVP for this guest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fn">First name</Label>
              <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ln">Last name</Label>
              <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="em">Email (optional)</Label>
              <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd">Invitation code</Label>
              <div className="flex gap-2">
                <Input
                  id="cd"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                  maxLength={32}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => setCode(generateCode())}>
                  New
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Guest type</Label>
              <Select value={guestType} onValueChange={(v) => setGuestType(v as GuestType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day only</SelectItem>
                  <SelectItem value="evening">Evening only</SelectItem>
                  <SelectItem value="full_day">Full day (both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Select value={ageType} onValueChange={(v) => setAgeType(v as AgeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Group</Label>
            <GroupPicker
              weddingId={weddingId}
              groups={groups}
              value={groupId}
              onChange={setGroupId}
              onGroupsChanged={onGroupsChanged}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nt">Internal notes</Label>
            <Textarea id="nt" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 cursor-pointer">
            <Checkbox
              checked={plusOneAllowed}
              onCheckedChange={(c) => setPlusOneAllowed(c === true)}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Allow plus-one</p>
              <p className="text-xs text-muted-foreground">
                If enabled, this guest can bring a companion when they RSVP.
              </p>
            </div>
          </label>

          {rsvpStatus !== "none" && plusOne && !plusOneAllowed && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              A plus-one name is set but this guest isn't allowed to bring one. Either enable
              "Allow plus-one" above or clear the plus-one field below.
            </p>
          )}

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="font-display text-sm">RSVP</h4>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRsvpStatus(v)}
                  className={`text-xs rounded-lg border px-2 py-2 transition-colors ${
                    rsvpStatus === v
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  {v === "none" ? "No reply" : answerLabel(v)}
                </button>
              ))}
            </div>
            {rsvpStatus === "yes" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Attending</Label>
                <div className="grid grid-cols-3 gap-2">
                  {attendanceOptionsFor(guestType).map((opt) => {
                    const active = attendance === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAttendance(opt.value)}
                        className={`text-xs rounded-lg border px-2 py-2 transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {rsvpStatus !== "none" && (
              <>
                {plusOneAllowed && (
                  <Input
                    value={plusOne}
                    onChange={(e) => setPlusOne(e.target.value)}
                    placeholder="Plus-one name (optional)"
                    maxLength={120}
                  />
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {DIETARY_OPTIONS.map((opt) => {
                    const checked = tags.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs cursor-pointer ${
                          checked ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            setTags((prev) =>
                              prev.includes(opt.value)
                                ? prev.filter((t) => t !== opt.value)
                                : [...prev, opt.value],
                            )
                          }
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
                <Input
                  value={dietaryOther}
                  onChange={(e) => setDietaryOther(e.target.value)}
                  placeholder="Other dietary notes"
                  maxLength={200}
                />
                <Textarea
                  value={rsvpComments}
                  onChange={(e) => setRsvpComments(e.target.value)}
                  placeholder="Comments from guest"
                  rows={2}
                  maxLength={1000}
                />
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? "Saving…" : isNew ? "Add guest" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- GroupPicker --------------------------- */

const PRESET_COLORS = [
  "#C97A5A", "#C78C8C", "#D4B483", "#8FA9A2", "#7E5A8C", "#5A7A8C", "#A35E5E",
];

function GroupPicker({
  weddingId,
  groups,
  value,
  onChange,
  onGroupsChanged,
}: {
  weddingId: string;
  groups: Group[];
  value: string | null;
  onChange: (id: string | null) => void;
  onGroupsChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);

  const current = groups.find((g) => g.id === value) ?? null;

  const createGroup = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    const color = PRESET_COLORS[groups.length % PRESET_COLORS.length];
    const { data, error } = await supabase
      .from("guest_groups")
      .insert({ wedding_id: weddingId, name, color, position: groups.length })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logAudit({
      weddingId,
      action: "group.created",
      targetType: "group",
      targetId: data.id,
      details: { name },
    });
    setNewName("");
    onChange(data.id);
    onGroupsChanged();
  };

  const renameGroup = async (id: string) => {
    const name = renameValue.trim();
    if (!name) return;
    setBusy(true);
    const { error } = await supabase
      .from("guest_groups")
      .update({ name })
      .eq("id", id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logAudit({
      weddingId,
      action: "group.updated",
      targetType: "group",
      targetId: id,
      details: { name },
    });
    setRenamingId(null);
    setRenameValue("");
    onGroupsChanged();
  };

  const deleteGroup = async (g: Group) => {
    if (!confirm(`Delete group "${g.name}"? Guests in this group will become ungrouped.`)) return;
    setBusy(true);
    const { error } = await supabase.from("guest_groups").delete().eq("id", g.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logAudit({
      weddingId,
      action: "group.removed",
      targetType: "group",
      targetId: g.id,
      details: { name: g.name },
    });
    if (value === g.id) onChange(null);
    onGroupsChanged();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 h-9 text-sm hover:border-primary/40 transition-colors"
        >
          {current ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: current.color ?? "var(--primary)" }}
              />
              {current.name}
            </span>
          ) : (
            <span className="text-muted-foreground">No group</span>
          )}
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted ${
              value === null ? "bg-muted font-medium" : ""
            }`}
          >
            No group
          </button>
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-1 group rounded hover:bg-muted/60"
            >
              {renamingId === g.id ? (
                <div className="flex-1 flex items-center gap-1 p-1">
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void renameGroup(g.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="h-7 text-xs"
                    autoFocus
                    maxLength={80}
                  />
                  <Button
                    size="sm"
                    onClick={() => void renameGroup(g.id)}
                    disabled={busy}
                    className="h-7 px-2"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRenamingId(null)}
                    className="h-7 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(g.id);
                      setOpen(false);
                    }}
                    className={`flex-1 text-left text-xs px-2 py-1.5 inline-flex items-center gap-2 ${
                      value === g.id ? "font-medium" : ""
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: g.color ?? "var(--primary)" }}
                    />
                    <span className="truncate">{g.name}</span>
                    {value === g.id && <Check className="w-3 h-3 ml-auto text-primary" />}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      setRenamingId(g.id);
                      setRenameValue(g.name);
                    }}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={() => void deleteGroup(g)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-2 pt-2 flex items-center gap-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void createGroup();
            }}
            placeholder="New group name"
            className="h-8 text-xs"
            maxLength={80}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void createGroup()}
            disabled={busy || !newName.trim()}
            className="h-8"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
