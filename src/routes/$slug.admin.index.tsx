import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  ListChecks,
  Image as ImageIcon,
  Music,
  HardDrive,
  Loader2,
  ArrowRight,
  Globe,
  EyeOff,
  ExternalLink,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { setWeddingStatus } from "@/auth/wedding.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$slug/admin/")({
  component: AdminOverview,
});

interface Stats {
  guests: number;
  rsvpYes: number;
  rsvpNo: number;
  rsvpNone: number;
  photos: number;
  pendingPhotos: number;
  songs: number;
  storageUsed: number;
  storageLimit: number;
  todoTotal: number;
  todoDone: number;
}

function AdminOverview() {
  const { slug } = Route.useParams();
  const { wedding, refresh } = useWedding(slug);
  const [stats, setStats] = useState<Stats | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [localStatus, setLocalStatus] = useState<"draft" | "published" | null>(null);

  useEffect(() => {
    if (!wedding) return;
    setLocalStatus(wedding.status);
    void (async () => {
      const [guests, rsvps, photos, songs, used, weddingRow, todos] = await Promise.all([
        supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
        supabase.from("rsvp_responses").select("status").eq("wedding_id", wedding.id),
        supabase.from("photos").select("status").eq("wedding_id", wedding.id),
        supabase.from("playlist_songs").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
        supabase.rpc("wedding_storage_used", { _wedding_id: wedding.id }),
        supabase.from("weddings").select("storage_limit_bytes").eq("id", wedding.id).maybeSingle(),
        supabase.from("todo_tasks").select("status").eq("wedding_id", wedding.id),
      ]);
      const rs = (rsvps.data ?? []) as { status: "yes" | "no" }[];
      const ps = (photos.data ?? []) as { status: "pending" | "approved" | "hidden" }[];
      const ts = (todos.data ?? []) as { status: "todo" | "in_progress" | "done" }[];
      setStats({
        guests: guests.count ?? 0,
        rsvpYes: rs.filter((r) => r.status === "yes").length,
        rsvpNo: rs.filter((r) => r.status === "no").length,
        rsvpNone: (guests.count ?? 0) - rs.length,
        photos: ps.length,
        pendingPhotos: ps.filter((p) => p.status === "pending").length,
        songs: songs.count ?? 0,
        storageUsed: Number(used.data ?? 0),
        storageLimit: Number(weddingRow.data?.storage_limit_bytes ?? 2147483648),
        todoTotal: ts.length,
        todoDone: ts.filter((t) => t.status === "done").length,
      });
    })();

    // Realtime updates for todo tasks
    const channel = supabase
      .channel(`admin-overview-${wedding.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todo_tasks", filter: `wedding_id=eq.${wedding.id}` },
        async () => {
          const { data } = await supabase
            .from("todo_tasks")
            .select("status")
            .eq("wedding_id", wedding.id);
          const ts = (data ?? []) as { status: "todo" | "in_progress" | "done" }[];
          setStats((prev) =>
            prev
              ? { ...prev, todoTotal: ts.length, todoDone: ts.filter((t) => t.status === "done").length }
              : prev,
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [wedding]);

  const handleTogglePublish = async () => {
    if (!wedding || publishing) return;
    const next = localStatus === "published" ? "draft" : "published";
    setPublishing(true);
    setLocalStatus(next);
    const res = await setWeddingStatus({ data: { weddingId: wedding.id, status: next } });
    setPublishing(false);
    if (!res.ok) {
      setLocalStatus(localStatus);
      toast.error(res.error ?? "Could not update status");
      return;
    }
    toast.success(next === "published" ? "Website published" : "Website unpublished");
    void refresh();
  };

  if (!wedding || !stats || !localStatus) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const pct = Math.min(100, (stats.storageUsed / stats.storageLimit) * 100);
  const todoPct = stats.todoTotal === 0 ? 0 : Math.round((stats.todoDone / stats.todoTotal) * 100);
  const todoRemaining = stats.todoTotal - stats.todoDone;
  const isPublished = localStatus === "published";

  return (
    <div className="space-y-6">
      {/* Publish section */}
      <div
        className={`rounded-2xl border p-6 shadow-soft ${
          isPublished
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-amber-500/30 bg-amber-500/5"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full p-2 ${
                isPublished
                  ? "bg-emerald-500/15 text-emerald-600"
                  : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg">Website status</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    isPublished
                      ? "bg-emerald-500/15 text-emerald-700"
                      : "bg-amber-500/15 text-amber-700"
                  }`}
                >
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPublished
                  ? "Your wedding website is live and visible to guests."
                  : "Your wedding website is private. Only you can see it."}
              </p>
              {isPublished && (
                <Link
                  to="/$slug"
                  params={{ slug }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  /{slug} <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
          <div className="flex gap-2 sm:flex-shrink-0">
            {isPublished && (
              <Button asChild variant="outline" size="sm">
                <Link to="/$slug" params={{ slug }}>
                  Open website
                </Link>
              </Button>
            )}
            <Button
              onClick={handleTogglePublish}
              disabled={publishing}
              variant={isPublished ? "outline" : "default"}
              size="sm"
            >
              {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPublished ? "Unpublish website" : "Publish website"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Guests"
          value={stats.guests}
          hint={`${stats.rsvpYes} yes · ${stats.rsvpNo} no · ${stats.rsvpNone} no reply`}
          to="/$slug/admin/rsvp"
          slug={slug}
        />
        <StatCard
          icon={ListChecks}
          label="RSVPs"
          value={stats.rsvpYes + stats.rsvpNo}
          hint={`${stats.rsvpNone} still pending`}
          to="/$slug/admin/rsvp"
          slug={slug}
        />
        <StatCard
          icon={ImageIcon}
          label="Photos"
          value={stats.photos}
          hint={stats.pendingPhotos > 0 ? `${stats.pendingPhotos} need review` : "All moderated"}
          to="/$slug/admin/photos"
          slug={slug}
        />
        <StatCard
          icon={Music}
          label="Song requests"
          value={stats.songs}
          hint="Curated by guests"
          to="/$slug/playlist"
          slug={slug}
        />
      </div>

      {/* ToDo overview */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg">Planning progress</h2>
          </div>
          <Link
            to="/$slug/admin/todo"
            params={{ slug }}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {stats.todoTotal === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks yet.{" "}
            <Link
              to="/$slug/admin/todo"
              params={{ slug }}
              className="text-primary hover:underline"
            >
              Add your first task
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">
                {stats.todoDone} of {stats.todoTotal} done
              </span>
              <span className="font-medium">{todoPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${todoPct}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <MiniStat label="Total" value={stats.todoTotal} />
              <MiniStat label="Completed" value={stats.todoDone} />
              <MiniStat label="Remaining" value={todoRemaining} />
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg">Storage</h2>
          </div>
          <Link
            to="/$slug/admin/storage"
            params={{ slug }}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Manage <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatBytes(stats.storageUsed)} of {formatBytes(stats.storageLimit)} used
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3 text-center">
      <p className="text-2xl font-display">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
  slug,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint: string;
  to: "/$slug/admin/photos" | "/$slug/playlist" | "/$slug/admin/rsvp";
  slug: string;
}) {
  return (
    <Link
      to={to}
      params={{ slug }}
      className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-3xl font-display">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </p>
      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{hint}</p>
    </Link>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
