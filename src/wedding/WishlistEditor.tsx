import { useEffect, useState } from "react";
import { Gift, Loader2, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Save, X, Pencil, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";

interface WishlistItem {
  id: string;
  wedding_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  price_text: string | null;
  position: number;
}

interface Props {
  weddingId: string;
  wishlistEnabled: boolean;
  onEnabledChange: (next: boolean) => void;
}

const emptyDraft = {
  title: "",
  description: "",
  image_url: "",
  external_url: "",
  price_text: "",
};

export function WishlistEditor({ weddingId, wishlistEnabled, onEnabledChange }: Props) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [saving, setSaving] = useState(false);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("id, wedding_id, title, description, image_url, external_url, price_text, position")
      .eq("wedding_id", weddingId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Could not load wishlist.");
    } else {
      setItems((data ?? []) as WishlistItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

  const openAdd = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft });
    setDialogOpen(true);
  };

  const openEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setDraft({
      title: item.title,
      description: item.description ?? "",
      image_url: item.image_url ?? "",
      external_url: item.external_url ?? "",
      price_text: item.price_text ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    setSaving(true);

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      image_url: draft.image_url.trim() || null,
      external_url: draft.external_url.trim() || null,
      price_text: draft.price_text.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("wishlist_items")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast.error("Could not save item.");
        setSaving(false);
        return;
      }
      void logAudit({
        weddingId,
        action: "wishlist.updated",
        targetType: "wishlist_item",
        targetId: editingId,
      });
    } else {
      const nextPos = items.length;
      const { data, error } = await supabase
        .from("wishlist_items")
        .insert({ wedding_id: weddingId, position: nextPos, ...payload })
        .select("id")
        .single();
      if (error) {
        toast.error("Could not add item.");
        setSaving(false);
        return;
      }
      void logAudit({
        weddingId,
        action: "wishlist.created",
        targetType: "wishlist_item",
        targetId: data?.id,
      });
    }

    setSaving(false);
    setDialogOpen(false);
    toast.success("Saved.");
    await load();
  };

  const remove = async (item: WishlistItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from("wishlist_items").delete().eq("id", item.id);
    if (error) {
      toast.error("Could not delete item.");
      return;
    }
    void logAudit({
      weddingId,
      action: "wishlist.deleted",
      targetType: "wishlist_item",
      targetId: item.id,
    });
    toast.success("Deleted.");
    await load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    const next = items.slice();
    next[index] = b;
    next[target] = a;
    // reassign positions
    const updates = next.map((it, i) => ({ id: it.id, position: i }));
    setItems(next.map((it, i) => ({ ...it, position: i })));
    for (const u of updates) {
      await supabase.from("wishlist_items").update({ position: u.position }).eq("id", u.id);
    }
  };

  const toggleEnabled = async (next: boolean) => {
    setTogglingEnabled(true);
    const { error } = await supabase
      .from("weddings")
      .update({ wishlist_enabled: next })
      .eq("id", weddingId);
    setTogglingEnabled(false);
    if (error) {
      toast.error("Could not update wishlist visibility.");
      return;
    }
    onEnabledChange(next);
    void logAudit({
      weddingId,
      action: "wedding.updated",
      targetType: "wedding",
      targetId: weddingId,
      details: { field: "wishlist_enabled", value: next },
    });
    toast.success(next ? "Wishlist shown to guests." : "Wishlist hidden from guests.");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">Wishlist / Gift registry</h2>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="wishlist-enabled" className="text-sm text-muted-foreground">
            Show to guests
          </Label>
          <Switch
            id="wishlist-enabled"
            checked={wishlistEnabled}
            disabled={togglingEnabled}
            onCheckedChange={(v) => void toggleEnabled(v)}
          />
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Add gift ideas, contributions or links. Guests see them on the invitation page when the
        wishlist is enabled and contains at least one item.
      </p>

      <div className="mt-5 flex justify-end">
        <Button onClick={openAdd} size="sm" className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Add gift
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            No gift items yet. Add your first wish above.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex flex-col items-center pt-1 text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                  <div className="flex flex-col mt-1">
                    <button
                      type="button"
                      className="p-0.5 disabled:opacity-30"
                      disabled={idx === 0}
                      onClick={() => void move(idx, -1)}
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-0.5 disabled:opacity-30"
                      disabled={idx === items.length - 1}
                      onClick={() => void move(idx, 1)}
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {item.price_text && <span>{item.price_text}</span>}
                    {item.external_url && (
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(item)}
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void remove(item)}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit gift" : "Add gift"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="w-title">Title *</Label>
              <Input
                id="w-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Airfryer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-desc">Description</Label>
              <Textarea
                id="w-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Help us upgrade our kitchen."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-image">Image URL</Label>
              <Input
                id="w-image"
                value={draft.image_url}
                onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                placeholder="https://…/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="w-price">Price indication</Label>
                <Input
                  id="w-price"
                  value={draft.price_text}
                  onChange={(e) => setDraft({ ...draft, price_text: e.target.value })}
                  placeholder="Approx. €120"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="w-url">External link</Label>
                <Input
                  id="w-url"
                  value={draft.external_url}
                  onChange={(e) => setDraft({ ...draft, external_url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
