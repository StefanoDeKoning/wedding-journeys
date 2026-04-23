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
} from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$slug/admin/")({
  component: AdminOverview,
});

interface Stats {
  guests: number;
  rsvpYes: number;
  rsvpMaybe: number;
  rsvpNo: number;
  rsvpNone: number;
  photos: number;
  pendingPhotos: number;
  songs: number;
  storageUsed: number;
  storageLimit: number;
}

function AdminOverview() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!wedding) return;
    void (async () => {
      const [guests, rsvps, photos, songs, used, weddingRow] = await Promise.all([
        supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
        supabase.from("rsvp_responses").select("status").eq("wedding_id", wedding.id),
        supabase.from("photos").select("status").eq("wedding_id", wedding.id),
        supabase.from("playlist_songs").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
        supabase.rpc("wedding_storage_used", { _wedding_id: wedding.id }),
        supabase.from("weddings").select("storage_limit_bytes").eq("id", wedding.id).maybeSingle(),
      ]);
      const rs = (rsvps.data ?? []) as { status: "yes" | "no" | "maybe" }[];
      const ps = (photos.data ?? []) as { status: "pending" | "approved" | "hidden" }[];
      setStats({
        guests: guests.count ?? 0,
        rsvpYes: rs.filter((r) => r.status === "yes").length,
        rsvpMaybe: rs.filter((r) => r.status === "maybe").length,
        rsvpNo: rs.filter((r) => r.status === "no").length,
        rsvpNone: (guests.count ?? 0) - rs.length,
        photos: ps.length,
        pendingPhotos: ps.filter((p) => p.status === "pending").length,
        songs: songs.count ?? 0,
        storageUsed: Number(used.data ?? 0),
        storageLimit: Number(weddingRow.data?.storage_limit_bytes ?? 2147483648),
      });
    })();
  }, [wedding]);

  if (!wedding || !stats) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const pct = Math.min(100, (stats.storageUsed / stats.storageLimit) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Guests"
          value={stats.guests}
          hint={`${stats.rsvpYes} yes · ${stats.rsvpMaybe} maybe · ${stats.rsvpNo} no · ${stats.rsvpNone} no reply`}
          to="/$slug/admin/guests"
          slug={slug}
        />
        <StatCard
          icon={ListChecks}
          label="RSVPs"
          value={stats.rsvpYes + stats.rsvpMaybe + stats.rsvpNo}
          hint={`${stats.rsvpNone} still pending`}
          to="/$slug/admin/guests"
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
  to: "/$slug/admin/guests" | "/$slug/admin/photos" | "/$slug/playlist";
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
