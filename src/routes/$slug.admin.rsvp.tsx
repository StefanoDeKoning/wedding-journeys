import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Users,
  UserPlus,
  ArrowRight,
  Calendar,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { dietaryLabel, type DietaryValue } from "@/wedding/dietary";

export const Route = createFileRoute("/$slug/admin/rsvp")({
  head: () => ({
    meta: [
      { title: "RSVP Overview" },
      { name: "description", content: "Track guest responses and plus-ones." },
    ],
  }),
  component: AdminRsvpOverview,
});

interface GuestLite {
  id: string;
  first_name: string;
  last_name: string;
  plus_one_allowed: boolean;
}

interface RsvpLite {
  guest_id: string;
  status: "yes" | "no";
  attendance: "day" | "evening" | "both" | null;
  plus_one_name: string | null;
  dietary_tags: string[];
  dietary_other: string | null;
}

function AdminRsvpOverview() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [guests, setGuests] = useState<GuestLite[]>([]);
  const [rsvps, setRsvps] = useState<Map<string, RsvpLite>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!wedding) return;
    setLoading(true);
    const [g, r] = await Promise.all([
      supabase
        .from("guests")
        .select("id, first_name, last_name, plus_one_allowed")
        .eq("wedding_id", wedding.id)
        .order("last_name"),
      supabase
        .from("rsvp_responses")
        .select("guest_id, status, attendance, plus_one_name, dietary_tags, dietary_other")
        .eq("wedding_id", wedding.id),
    ]);
    setGuests((g.data ?? []) as GuestLite[]);
    const m = new Map<string, RsvpLite>();
    for (const row of (r.data ?? []) as RsvpLite[]) m.set(row.guest_id, row);
    setRsvps(m);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding?.id]);

  // Realtime updates for RSVP changes
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

      {/* Detail table */}
      <section className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-display text-lg">Guest responses</h3>
            <p className="text-xs text-muted-foreground">
              Detailed view of every guest, plus-one and dietary need.
            </p>
          </div>
          <Link
            to="/$slug/admin/guests"
            params={{ slug }}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Manage guests <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>+1 allowed</TableHead>
                <TableHead>+1 confirmed</TableHead>
                <TableHead className="text-center">Attendees</TableHead>
                <TableHead>Dietary notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No guests yet.
                  </TableCell>
                </TableRow>
              ) : (
                guests.map((g) => {
                  const r = rsvps.get(g.id) ?? null;
                  const hasPlusOne =
                    !!r &&
                    r.status === "yes" &&
                    g.plus_one_allowed &&
                    !!r.plus_one_name &&
                    r.plus_one_name.trim().length > 0;
                  const attendees = r?.status === "yes" ? (hasPlusOne ? 2 : 1) : 0;
                  const dietary = [
                    ...((r?.dietary_tags ?? []) as DietaryValue[]).map(dietaryLabel),
                    r?.dietary_other ?? "",
                  ]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">
                        {g.first_name} {g.last_name}
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
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
