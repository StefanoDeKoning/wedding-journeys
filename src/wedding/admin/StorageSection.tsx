import { useEffect, useState } from "react";
import { HardDrive, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBytes } from "@/routes/$slug.admin.index";

interface UploaderRow {
  uploader_name: string;
  count: number;
  bytes: number;
}

export function StorageSection({ weddingId }: { weddingId: string }) {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(2_147_483_648);
  const [photoCount, setPhotoCount] = useState(0);
  const [byUploader, setByUploader] = useState<UploaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [usedRes, limRes, photos] = await Promise.all([
        supabase.rpc("wedding_storage_used", { _wedding_id: weddingId }),
        supabase.from("weddings").select("storage_limit_bytes").eq("id", weddingId).maybeSingle(),
        supabase.from("photos").select("uploader_name, size_bytes").eq("wedding_id", weddingId),
      ]);
      setUsed(Number(usedRes.data ?? 0));
      setLimit(Number(limRes.data?.storage_limit_bytes ?? 2_147_483_648));
      const rows = (photos.data ?? []) as { uploader_name: string; size_bytes: number }[];
      setPhotoCount(rows.length);
      const map = new Map<string, { count: number; bytes: number }>();
      for (const r of rows) {
        const cur = map.get(r.uploader_name) ?? { count: 0, bytes: 0 };
        map.set(r.uploader_name, { count: cur.count + 1, bytes: cur.bytes + r.size_bytes });
      }
      setByUploader(
        Array.from(map.entries())
          .map(([uploader_name, v]) => ({ uploader_name, ...v }))
          .sort((a, b) => b.bytes - a.bytes),
      );
      setLoading(false);
    })();
  }, [weddingId]);

  const pct = Math.min(100, (used / limit) * 100);
  const danger = pct > 90;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-3">
        <InfoCard label="Storage used" value={formatBytes(used)} />
        <InfoCard label="Storage limit" value={formatBytes(limit)} />
        <InfoCard label="Files uploaded" value={String(photoCount)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg">Storage usage</h2>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${danger ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm">
            <span className="font-display text-2xl">{formatBytes(used)}</span>
            <span className="text-muted-foreground"> of {formatBytes(limit)}</span>
          </p>
          <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% full</p>
        </div>
        {danger && (
          <p className="mt-3 text-xs text-destructive">
            You're close to your storage limit. Consider hiding or deleting older photos.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">By uploader</h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : byUploader.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
            <Camera className="w-6 h-6 mx-auto mb-2 opacity-40" />
            No photos uploaded yet.
          </div>
        ) : (
          <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {byUploader.map((u) => (
              <li key={u.uploader_name} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.uploader_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.count} photo{u.count === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatBytes(u.bytes)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </div>
  );
}
