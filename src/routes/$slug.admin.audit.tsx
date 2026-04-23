import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ScrollText } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { describeAction } from "@/wedding/audit";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/$slug/admin/audit")({
  component: AdminAudit,
});

interface AuditRow {
  id: string;
  action: string;
  actor_label: string | null;
  target_type: string | null;
  target_id: string | null;
  details: Json;
  created_at: string;
}

function AdminAudit() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wedding) return;
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("audit_log")
        .select("id, action, actor_label, target_type, target_id, details, created_at")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data ?? []) as AuditRow[]);
      setLoading(false);
    })();
  }, [wedding]);

  if (!wedding) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" />
          Recent activity
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          The last 200 admin actions across this wedding.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No activity recorded yet.
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {rows.map((r) => (
            <li key={r.id} className="p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{r.actor_label ?? "Someone"}</span>{" "}
                  <span className="text-muted-foreground">{describeAction(r.action)}</span>
                  {detailsLabel(r.details) && (
                    <span className="text-muted-foreground"> — {detailsLabel(r.details)}</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function detailsLabel(d: Json): string | null {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const obj = d as Record<string, unknown>;
  if (typeof obj.name === "string") return obj.name;
  if (typeof obj.title === "string") return obj.title;
  if (typeof obj.uploader === "string") return `by ${obj.uploader}`;
  if (typeof obj.status === "string") return `→ ${obj.status}`;
  return null;
}
