import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, PiggyBank, Briefcase, ListTodo } from "lucide-react";
import { toast } from "sonner";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/$slug/admin/budget")({
  component: BudgetPage,
});

interface BudgetItem {
  id: string;
  wedding_id: string;
  name: string;
  estimated_cost: number;
  actual_cost: number | null;
  notes: string | null;
  vendor_id: string | null;
  created_at: string;
}

interface VendorLite {
  id: string;
  name: string;
}

interface TodoLite {
  id: string;
  title: string;
  budget_item_id: string | null;
}

interface FormState {
  id?: string;
  name: string;
  estimated_cost: string;
  actual_cost: string;
  notes: string;
  vendor_id: string;
}

const emptyForm: FormState = {
  name: "",
  estimated_cost: "",
  actual_cost: "",
  notes: "",
  vendor_id: "",
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function BudgetPage() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [items, setItems] = useState<BudgetItem[] | null>(null);
  const [vendors, setVendors] = useState<VendorLite[]>([]);
  const [todos, setTodos] = useState<TodoLite[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wedding) return;
    void loadAll(wedding.id);
  }, [wedding]);

  const loadAll = async (weddingId: string) => {
    const [i, v, t] = await Promise.all([
      supabase
        .from("budget_items" as never)
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: true }),
      supabase
        .from("vendors" as never)
        .select("id,name")
        .eq("wedding_id", weddingId)
        .order("name", { ascending: true }),
      supabase
        .from("todo_tasks")
        .select("id,title,budget_item_id")
        .eq("wedding_id", weddingId),
    ]);
    if (i.error) {
      toast.error(i.error.message);
      return;
    }
    setItems(((i.data ?? []) as unknown) as BudgetItem[]);
    setVendors(((v.data ?? []) as unknown) as VendorLite[]);
    setTodos(((t.data ?? []) as unknown) as TodoLite[]);
  };
  const loadItems = (weddingId: string) => loadAll(weddingId);

  const totals = useMemo(() => {
    const list = items ?? [];
    const estimated = list.reduce((s, i) => s + Number(i.estimated_cost ?? 0), 0);
    const actual = list.reduce((s, i) => s + Number(i.actual_cost ?? 0), 0);
    const remaining = estimated - actual;
    const pct = estimated === 0 ? 0 : Math.min(200, (actual / estimated) * 100);
    return { estimated, actual, remaining, pct };
  }, [items]);

  const barColor =
    totals.pct > 100
      ? "bg-red-500"
      : totals.pct >= 85
      ? "bg-orange-500"
      : "bg-emerald-500";

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item: BudgetItem) => {
    setForm({
      id: item.id,
      name: item.name,
      estimated_cost: String(item.estimated_cost ?? ""),
      actual_cost: item.actual_cost == null ? "" : String(item.actual_cost),
      notes: item.notes ?? "",
      vendor_id: item.vendor_id ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!wedding) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const est = Number(form.estimated_cost);
    if (Number.isNaN(est) || est < 0) {
      toast.error("Estimated cost must be a positive number");
      return;
    }
    const act =
      form.actual_cost.trim() === "" ? null : Number(form.actual_cost);
    if (act !== null && (Number.isNaN(act) || act < 0)) {
      toast.error("Actual cost must be a positive number");
      return;
    }
    setSaving(true);
    const payload = {
      wedding_id: wedding.id,
      name: form.name.trim(),
      estimated_cost: est,
      actual_cost: act,
      notes: form.notes.trim() || null,
      vendor_id: form.vendor_id || null,
    };
    let error;
    if (form.id) {
      ({ error } = await supabase
        .from("budget_items" as never)
        .update(payload as never)
        .eq("id", form.id));
    } else {
      ({ error } = await supabase.from("budget_items" as never).insert(payload as never));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Item updated" : "Item added");
    setOpen(false);
    setForm(emptyForm);
    void loadItems(wedding.id);
  };

  const remove = async (id: string) => {
    if (!wedding) return;
    if (!confirm("Delete this budget item?")) return;
    const { error } = await supabase.from("budget_items" as never).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Item deleted");
    void loadItems(wedding.id);
  };

  if (!wedding || items === null) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  const overBudget = totals.remaining < 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="Total estimated"
          value={formatCurrency(totals.estimated)}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Total actual"
          value={formatCurrency(totals.actual)}
        />
        <SummaryCard
          icon={overBudget ? TrendingDown : PiggyBank}
          label={overBudget ? "Over budget" : "Remaining"}
          value={formatCurrency(Math.abs(totals.remaining))}
          tone={overBudget ? "danger" : "success"}
        />
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(totals.actual)} of {formatCurrency(totals.estimated)} spent
          </span>
          <span className="font-medium">
            {totals.estimated === 0 ? "—" : `${Math.round(totals.pct)}%`}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${barColor}`}
            style={{ width: `${Math.min(100, totals.pct)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {totals.estimated === 0
            ? "Add items to start tracking."
            : overBudget
            ? `You are ${formatCurrency(Math.abs(totals.remaining))} over your estimated budget.`
            : totals.pct >= 85
            ? "You are approaching your budget limit."
            : "You are comfortably within budget."}
        </p>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Budget items</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}>
                <Plus className="w-3.5 h-3.5" />
                Add item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit item" : "New budget item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Venue"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="est">Estimated</Label>
                    <Input
                      id="est"
                      type="number"
                      min="0"
                      step="1"
                      value={form.estimated_cost}
                      onChange={(e) =>
                        setForm({ ...form, estimated_cost: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="act">Actual (optional)</Label>
                    <Input
                      id="act"
                      type="number"
                      min="0"
                      step="1"
                      value={form.actual_cost}
                      onChange={(e) =>
                        setForm({ ...form, actual_cost: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Linked vendor (optional)</Label>
                  <Select
                    value={form.vendor_id || "__none__"}
                    onValueChange={(v) =>
                      setForm({ ...form, vendor_id: v === "__none__" ? "" : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No vendor</SelectItem>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {form.id ? "Save changes" : "Add item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No budget items yet. Add your first one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const est = Number(item.estimated_cost ?? 0);
                  const act = item.actual_cost == null ? null : Number(item.actual_cost);
                  const diff = act == null ? 0 : act - est;
                  const over = act != null && diff > 0;
                  return (
                    <TableRow
                      key={item.id}
                      className={over ? "bg-red-500/5" : undefined}
                    >
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        {item.notes && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {item.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(est)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {act == null ? "—" : formatCurrency(act)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          over
                            ? "text-red-600 font-medium"
                            : act != null && diff < 0
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {act == null
                          ? "—"
                          : `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => void remove(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "success"
      ? "text-emerald-600"
      : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className={`mt-3 text-3xl font-display ${toneClass}`}>{value}</p>
    </div>
  );
}
