import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Crown, Users, Image as ImageIcon, HardDrive, CalendarHeart, ScrollText, ArrowRight } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { getPlatformOverview, type PlatformOverview } from "@/auth/platform.functions";
import { describeAction } from "@/wedding/audit";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/platform")({
  head: () => ({
    meta: [
      { title: "Platform Owner Dashboard" },
      { name: "description", content: "OurJourney platform-wide stats and audit." },
    ],
  }),
  component: PlatformDashboard,
});

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function PlatformDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) {
      void navigate({ to: "/login" });
      return;
    }
    if (!auth.isPlatformOwner) {
      void navigate({ to: "/" });
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPlatformOverview()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: Error) => {
        console.error("getPlatformOverview failed", err);
        toast.error(err?.message ?? "Could not load platform overview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.loading, auth.user, auth.isPlatformOwner, navigate]);

  if (auth.loading || loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center text-muted-foreground">
        Could not load platform overview.
      </div>
    );
  }

  const { totals, weddings, recentAudit } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-script text-2xl text-primary flex items-center gap-2">
            <Crown className="w-5 h-5" /> platform owner
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">OurJourney overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cross-wedding stats, storage, and audit history.
          </p>
        </div>
        <Link
          to="/admin/platform/todo-templates"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted/60 transition-colors"
        >
          ToDo templates <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <StatCard label="Weddings" value={totals.weddings} sub={`${totals.published} published`} icon={CalendarHeart} />
        <StatCard label="Total guests" value={totals.guests} icon={Users} />
        <StatCard label="RSVP yes" value={totals.rsvp_yes} icon={Users} />
        <StatCard label="Photos" value={totals.photos} icon={ImageIcon} />
        <StatCard label="Storage used" value={formatBytes(totals.storage_bytes)} icon={HardDrive} />
        <StatCard label="Audit events" value={recentAudit.length} icon={ScrollText} sub="latest 50" />
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl mb-3">All weddings</h2>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Wedding</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Guests</th>
                  <th className="text-right px-4 py-3">Yes</th>
                  <th className="text-right px-4 py-3">Photos</th>
                  <th className="text-right px-4 py-3">Storage</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {weddings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No weddings yet.
                    </td>
                  </tr>
                ) : (
                  weddings.map((w) => {
                    const pct = w.storage_limit_bytes
                      ? Math.min(100, (w.storage_bytes / w.storage_limit_bytes) * 100)
                      : 0;
                    return (
                      <tr key={w.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{w.wedding_name ?? w.slug}</div>
                          <div className="text-xs text-muted-foreground">/{w.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {w.wedding_date
                            ? new Date(w.wedding_date).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              w.status === "published"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{w.guest_count}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{w.rsvp_yes_count}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{w.photo_count}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="tabular-nums">
                            {formatBytes(w.storage_bytes)}
                            <span className="text-muted-foreground">
                              {" "}
                              / {formatBytes(w.storage_limit_bytes)}
                            </span>
                          </div>
                          <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pct > 90 ? "bg-destructive" : "bg-primary"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to="/$slug/admin"
                            params={{ slug: w.slug }}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Open <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Recent activity</h2>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border shadow-soft">
          {recentAudit.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No audit events yet.
            </div>
          ) : (
            recentAudit.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate">
                    <span className="font-medium">{a.actor_label ?? "Someone"}</span>{" "}
                    <span className="text-muted-foreground">{describeAction(a.action)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.wedding_slug ? (
                      <Link
                        to="/$slug/admin"
                        params={{ slug: a.wedding_slug }}
                        className="hover:text-primary hover:underline"
                      >
                        {a.wedding_name ?? a.wedding_slug}
                      </Link>
                    ) : (
                      <span>Unknown wedding</span>
                    )}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(a.created_at).toLocaleString()}
                </time>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between text-muted-foreground mb-2">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="font-display text-2xl">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
