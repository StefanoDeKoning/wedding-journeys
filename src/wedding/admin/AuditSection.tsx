import { useEffect, useMemo, useState } from "react";
import { Loader2, ScrollText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { describeAction } from "@/wedding/audit";
import type { Json } from "@/integrations/supabase/types";

interface AuditRow {
  id: string;
  action: string;
  actor_label: string | null;
  target_type: string | null;
  target_id: string | null;
  details: Json;
  created_at: string;
}

const PAGE_SIZE = 25;

export function AuditSection({ weddingId }: { weddingId: string }) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("audit_log")
        .select("id, action, actor_label, target_type, target_id, details, created_at")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data ?? []) as AuditRow[]);
      setLoading(false);
    })();
  }, [weddingId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const blob = [
        r.actor_label ?? "",
        describeAction(r.action),
        r.action,
        detailsLabel(r.details) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" />
          Recent activity
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Showing the latest {rows.length} admin actions across this wedding.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search by user, action or detail…"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          No activity matches your search.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium hidden sm:table-cell">Detail</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-medium">{r.actor_label ?? "Someone"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {describeAction(r.action)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                      {detailsLabel(r.details) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {safePage + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
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
