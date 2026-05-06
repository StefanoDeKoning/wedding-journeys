import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Search, Download, Copy, Check } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import { downloadCsv, toCsv } from "@/wedding/csv";
import { DIETARY_OPTIONS, type DietaryValue } from "@/wedding/dietary";
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

export const Route = createFileRoute("/$slug/admin/guests")({
  component: AdminGuests,
});

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  invitation_code: string;
  guest_type: "day" | "evening" | "full_day";
  age_type: "adult" | "child";
  guest_group_id: string | null;
  notes: string | null;
  plus_one_allowed: boolean;
}

interface Group {
  id: string;
  name: string;
  color: string | null;
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

function AdminGuests() {
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
    const [g, gg, rs] = await Promise.all([
      supabase
        .from("guests")
        .select("id, first_name, last_name, email, invitation_code, guest_type, age_type, guest_group_id, notes, plus_one_allowed")
        .eq("wedding_id", wedding.id)
        .order("last_name"),
      supabase.from("guest_groups").select("id, name, color").eq("wedding_id", wedding.id).order("position"),
      supabase
        .from("rsvp_responses")
        .select("guest_id, status, attendance, plus_one_name, dietary_tags, dietary_other, comments")
        .eq("wedding_id", wedding.id),
    ]);
    setGuests((g.data ?? []) as Guest[]);
    setGroups((gg.data ?? []) as Group[]);
    const m = new Map<string, RsvpRow>();
    for (const r of (rs.data ?? []) as RsvpRow[]) m.set(r.guest_id, r);
    setRsvps(m);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (filterGroup !== "all" && g.guest_group_id !== filterGroup) return false;
      if (filterGroup === "none" && g.guest_group_id) return false;
      if (!q) return true;
      return (
        g.first_name.toLowerCase().includes(q) ||
        g.last_name.toLowerCase().includes(q) ||
        g.invitation_code.toLowerCase().includes(q) ||
        (g.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [guests, search, filterGroup]);

  const remove = async (g: Guest) => {
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

  const exportCsv = () => {
    if (!wedding) return;
    const rows = guests.map((g) => {
      const r = rsvps.get(g.id);
      const groupName = groups.find((gr) => gr.id === g.guest_group_id)?.name ?? "";
      return {
        first_name: g.first_name,
        last_name: g.last_name,
        email: g.email ?? "",
        invitation_code: g.invitation_code,
        guest_type: g.guest_type,
        group: groupName,
        rsvp_status: r?.status ?? "",
        plus_one_allowed: g.plus_one_allowed ? "yes" : "no",
        plus_one_name: r?.plus_one_name ?? "",
        attendees: r?.status === "yes" ? (g.plus_one_allowed && r?.plus_one_name ? 2 : 1) : 0,
        dietary_tags: r?.dietary_tags?.join("; ") ?? "",
        dietary_other: r?.dietary_other ?? "",
        comments: r?.comments ?? "",
        notes: g.notes ?? "",
      };
    });
    downloadCsv(`${wedding.slug}-guests.csv`, toCsv(rows));
  };

  if (!wedding) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-full">
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
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

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No guests found.
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {filtered.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              group={groups.find((gr) => gr.id === g.guest_group_id) ?? null}
              rsvp={rsvps.get(g.id) ?? null}
              onEdit={() => setEditing(g)}
              onRemove={() => remove(g)}
            />
          ))}
        </ul>
      )}

      {(editing || adding) && (
        <GuestDialog
          weddingId={wedding.id}
          guest={editing}
          groups={groups}
          rsvp={editing ? (rsvps.get(editing.id) ?? null) : null}
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

function GuestRow({
  guest,
  group,
  rsvp,
  onEdit,
  onRemove,
}: {
  guest: Guest;
  group: Group | null;
  rsvp: RsvpRow | null;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    void navigator.clipboard.writeText(guest.invitation_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <li className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
      <StatusDot status={rsvp?.status ?? null} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate flex items-center gap-2">
          {guest.first_name} {guest.last_name}
          {guest.plus_one_allowed && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              +1 ok
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {answerLabel(rsvp?.status ?? null)}
          {rsvp?.plus_one_name && ` · +1 ${rsvp.plus_one_name}`}
          {group && ` · ${group.name}`}
          <span className="ml-1 opacity-70">· {guestTypeLabel(guest.guest_type)}{guest.age_type === "child" ? " · child" : ""}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={copyCode}
        className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border"
        title="Copy invitation code"
      >
        {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
        {guest.invitation_code}
      </button>
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

function StatusDot({ status }: { status: "yes" | "no" | null }) {
  const cls =
    status === "yes"
      ? "bg-primary"
      : status === "no"
        ? "bg-muted-foreground/60"
        : "bg-border";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${cls}`} />;
}

function answerLabel(a: "yes" | "no" | null): string {
  if (a === "yes") return "Joyfully yes";
  if (a === "no") return "Sadly no";
  return "Awaiting reply";
}

function guestTypeLabel(t: "day" | "evening" | "full_day"): string {
  if (t === "full_day") return "full day";
  return t;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function GuestDialog({
  weddingId,
  guest,
  groups,
  rsvp,
  onClose,
  onSaved,
}: {
  weddingId: string;
  guest: Guest | null;
  groups: Group[];
  rsvp: RsvpRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !guest;
  const [firstName, setFirstName] = useState(guest?.first_name ?? "");
  const [lastName, setLastName] = useState(guest?.last_name ?? "");
  const [email, setEmail] = useState(guest?.email ?? "");
  const [code, setCode] = useState(guest?.invitation_code ?? generateCode());
  const [guestType, setGuestType] = useState<"day" | "evening" | "full_day">(guest?.guest_type ?? "day");
  const [ageType, setAgeType] = useState<"adult" | "child">(guest?.age_type ?? "adult");
  const [groupId, setGroupId] = useState<string>(guest?.guest_group_id ?? "none");
  const [notes, setNotes] = useState(guest?.notes ?? "");
  const [plusOneAllowed, setPlusOneAllowed] = useState<boolean>(guest?.plus_one_allowed ?? false);

  const [rsvpStatus, setRsvpStatus] = useState<"yes" | "no" | "none">(
    rsvp?.status ?? "none",
  );
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
          guest_group_id: groupId === "none" ? null : groupId,
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
          guest_group_id: groupId === "none" ? null : groupId,
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

    // Save / clear RSVP
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
              <Label>Type</Label>
              <Select value={guestType} onValueChange={(v) => setGuestType(v as "day" | "evening")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day guest</SelectItem>
                  <SelectItem value="evening">Evening guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Group</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <div className="grid grid-cols-4 gap-2">
              {(["none", "yes", "maybe", "no"] as const).map((v) => (
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
