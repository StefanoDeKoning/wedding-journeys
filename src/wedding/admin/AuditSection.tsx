import { useEffect, useMemo, useState } from "react";
import { Loader2, ScrollText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { describeAction } from "@/wedding/audit";
import { useI18n, type useT } from "@/i18n";
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
  const { t, tx, locale } = useI18n();

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
        tx(describeAction(r.action)),
        r.action,
        detailsLabel(r.details, t) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, query, t, tx]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" />
          {t("Recent activity")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Showing the latest {count} admin actions across this wedding.", { count: rows.length })}
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
          placeholder={t("Search by user, action or detail…")}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          {t("No activity matches your search.")}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("User")}</th>
                  <th className="px-3 py-2 font-medium">{t("Action")}</th>
                  <th className="px-3 py-2 font-medium hidden sm:table-cell">{t("Detail")}</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">{t("When")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-medium">{r.actor_label ?? t("Someone")}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {tx(describeAction(r.action))}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                      {detailsLabel(r.details, t) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("Page {page} of {pages}", { page: safePage + 1, pages: totalPages })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  {t("Previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("Next")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function detailsLabel(d: Json, t: ReturnType<typeof useT>): string | null {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const obj = d as Record<string, unknown>;
  if (typeof obj.name === "string") return obj.name;
  if (typeof obj.title === "string") return obj.title;
  if (typeof obj.uploader === "string") return t("by {name}", { name: obj.uploader });
  if (typeof obj.status === "string") return `→ ${obj.status}`;
  return null;
}
