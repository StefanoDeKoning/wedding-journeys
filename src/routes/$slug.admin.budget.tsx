import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  
  PiggyBank,
  Briefcase,
  ListTodo,
  Receipt,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useWedding } from "@/wedding/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { safeHttpUrl } from "@/lib/safeUrl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/$slug/admin/budget")({
  component: BudgetPage,
});

interface BudgetItem {
  id: string;
  wedding_id: string;
  name: string;
  category: string | null;
  estimated_cost: number;
  actual_cost: number | null;
  paid_amount: number;
  notes: string | null;
  vendor_name: string | null;
  vendor_contact_name: string | null;
  vendor_email: string | null;
  vendor_phone: string | null;
  vendor_website: string | null;
  vendor_notes: string | null;
  created_at: string;
}

interface TodoLite {
  id: string;
  title: string;
  status: string;
  budget_item_id: string | null;
}

interface FormState {
  id?: string;
  name: string;
  category: string;
  estimated_cost: string;
  actual_cost: string;
  paid_amount: string;
  notes: string;
  vendor_name: string;
  vendor_contact_name: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_website: string;
  vendor_notes: string;
}

const emptyForm: FormState = {
  name: "",
  category: "",
  estimated_cost: "",
  actual_cost: "",
  paid_amount: "",
  notes: "",
  vendor_name: "",
  vendor_contact_name: "",
  vendor_email: "",
  vendor_phone: "",
  vendor_website: "",
  vendor_notes: "",
};

function formatMoney(n: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function BudgetPage() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [items, setItems] = useState<BudgetItem[] | null>(null);
  const [todos, setTodos] = useState<TodoLite[]>([]);
  const [open, setOpen] = useState(false);
  const [showVendor, setShowVendor] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<BudgetItem | null>(null);
  const { t, tx, locale } = useI18n();
  const formatCurrency = (n: number) => formatMoney(n, locale);

  useEffect(() => {
    if (!wedding) return;
    void loadAll(wedding.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding]);

  const loadAll = async (weddingId: string) => {
    const [i, td] = await Promise.all([
      supabase
        .from("budget_items" as never)
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: true }),
      supabase
        .from("todo_tasks")
        .select("id,title,status,budget_item_id")
        .eq("wedding_id", weddingId),
    ]);
    if (i.error) {
      toast.error(tx(i.error.message));
      return;
    }
    setItems(((i.data ?? []) as unknown) as BudgetItem[]);
    setTodos(((td.data ?? []) as unknown) as TodoLite[]);
  };

  const totals = useMemo(() => {
    const list = items ?? [];
    const estimated = list.reduce((s, i) => s + Number(i.estimated_cost ?? 0), 0);
    const paid = list.reduce((s, i) => s + Number(i.paid_amount ?? 0), 0);
    const remaining = estimated - paid;
    return { estimated, paid, remaining, count: list.length };
  }, [items]);

  const openNew = () => {
    setForm(emptyForm);
    setShowVendor(false);
    setOpen(true);
  };

  const openEdit = (item: BudgetItem) => {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category ?? "",
      estimated_cost: String(item.estimated_cost ?? ""),
      actual_cost: item.actual_cost == null ? "" : String(item.actual_cost),
      paid_amount: String(item.paid_amount ?? "0"),
      notes: item.notes ?? "",
      vendor_name: item.vendor_name ?? "",
      vendor_contact_name: item.vendor_contact_name ?? "",
      vendor_email: item.vendor_email ?? "",
      vendor_phone: item.vendor_phone ?? "",
      vendor_website: item.vendor_website ?? "",
      vendor_notes: item.vendor_notes ?? "",
    });
    setShowVendor(Boolean(item.vendor_name));
    setOpen(true);
  };

  const submit = async () => {
    if (!wedding) return;
    if (!form.name.trim()) {
      toast.error(t("Name is required"));
      return;
    }
    const est = Number(form.estimated_cost || 0);
    if (Number.isNaN(est) || est < 0) {
      toast.error(t("Estimated cost must be a positive number"));
      return;
    }
    const act = form.actual_cost.trim() === "" ? null : Number(form.actual_cost);
    if (act !== null && (Number.isNaN(act) || act < 0)) {
      toast.error(t("Paid must be a positive number"));
      return;
    }
    const paid = Number(form.paid_amount || 0);
    if (Number.isNaN(paid) || paid < 0) {
      toast.error(t("Settled must be a positive number"));
      return;
    }
    setSaving(true);
    const useVendor = showVendor && form.vendor_name.trim();
    const payload = {
      wedding_id: wedding.id,
      name: form.name.trim(),
      category: form.category.trim() || null,
      estimated_cost: est,
      actual_cost: act,
      paid_amount: paid,
      notes: form.notes.trim() || null,
      vendor_name: useVendor ? form.vendor_name.trim() : null,
      vendor_contact_name: useVendor ? form.vendor_contact_name.trim() || null : null,
      vendor_email: useVendor ? form.vendor_email.trim() || null : null,
      vendor_phone: useVendor ? form.vendor_phone.trim() || null : null,
      vendor_website: useVendor ? form.vendor_website.trim() || null : null,
      vendor_notes: useVendor ? form.vendor_notes.trim() || null : null,
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
      toast.error(tx(error.message));
      return;
    }
    toast.success(form.id ? t("Item updated") : t("Item added"));
    setOpen(false);
    setForm(emptyForm);
    void loadAll(wedding.id);
  };

  const remove = async (id: string) => {
    if (!wedding) return;
    if (!confirm(t("Delete this budget item?"))) return;
    const { error } = await supabase.from("budget_items" as never).delete().eq("id", id);
    if (error) {
      toast.error(tx(error.message));
      return;
    }
    toast.success(t("Item deleted"));
    setSelected(null);
    void loadAll(wedding.id);
  };

  if (!wedding || items === null) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Wallet} label={t("Total budget")} value={formatCurrency(totals.estimated)} />
        <SummaryCard icon={CheckCircle2} label={t("Paid")} value={formatCurrency(totals.paid)} tone="success" />
        <SummaryCard
          icon={PiggyBank}
          label={t("Remaining")}
          value={formatCurrency(Math.max(0, totals.remaining))}
          tone={totals.remaining < 0 ? "danger" : undefined}
        />
        <SummaryCard icon={Receipt} label={t("Budget items")} value={String(totals.count)} />
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">{t("Budget items")}</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}>
                <Plus className="w-3.5 h-3.5" />
                {t("Add item")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{form.id ? t("Edit budget item") : t("New budget item")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{t("Name")}</Label>
                    <Input
                      id="name"
                      placeholder={t("e.g. Photographer")}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cat">{t("Category")}</Label>
                    <Input
                      id="cat"
                      placeholder={t("e.g. Ceremony")}
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="est">{t("Estimated")}</Label>
                    <Input
                      id="est"
                      type="number"
                      min="0"
                      step="1"
                      value={form.estimated_cost}
                      onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="paid">{t("Paid")}</Label>
                    <Input
                      id="paid"
                      type="number"
                      min="0"
                      step="1"
                      value={form.paid_amount}
                      onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">{t("Notes")}</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                {/* Optional vendor section */}
                <div className="rounded-xl border border-dashed border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <p className="font-medium text-sm">{t("Vendor information (optional)")}</p>
                    </div>
                    {showVendor ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowVendor(false);
                          setForm({
                            ...form,
                            vendor_name: "",
                            vendor_contact_name: "",
                            vendor_email: "",
                            vendor_phone: "",
                            vendor_website: "",
                            vendor_notes: "",
                          });
                        }}
                      >
                        <X className="w-3.5 h-3.5" /> {t("Remove")}
                      </Button>
                    ) : (
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowVendor(true)}>
                        <Plus className="w-3.5 h-3.5" /> {t("Add vendor")}
                      </Button>
                    )}
                  </div>

                  {showVendor && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>{t("Vendor name")}</Label>
                          <Input
                            value={form.vendor_name}
                            onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                            placeholder="Studio Moments"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("Contact person")}</Label>
                          <Input
                            value={form.vendor_contact_name}
                            onChange={(e) =>
                              setForm({ ...form, vendor_contact_name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>{t("Email")}</Label>
                          <Input
                            type="email"
                            value={form.vendor_email}
                            onChange={(e) => setForm({ ...form, vendor_email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("Phone")}</Label>
                          <Input
                            value={form.vendor_phone}
                            onChange={(e) => setForm({ ...form, vendor_phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("Website")}</Label>
                        <Input
                          placeholder="https://"
                          value={form.vendor_website}
                          onChange={(e) => setForm({ ...form, vendor_website: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("Vendor notes")}</Label>
                        <Textarea
                          rows={2}
                          value={form.vendor_notes}
                          onChange={(e) => setForm({ ...form, vendor_notes: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {form.id ? t("Save changes") : t("Add item")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {t("No budget items yet. Add your first one to get started.")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Item")}</TableHead>
                  <TableHead>{t("Category")}</TableHead>
                  <TableHead className="text-right">{t("Estimated")}</TableHead>
                  <TableHead className="text-right">{t("Paid")}</TableHead>
                  <TableHead className="text-right">{t("Remaining")}</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const est = Number(item.estimated_cost ?? 0);
                  const paid = Number(item.paid_amount ?? 0);
                  const remaining = est - paid;
                  const linkedTodos = todos.filter((td) => td.budget_item_id === item.id);
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(item)}
                    >
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {item.vendor_name && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {item.vendor_name}
                            </span>
                          )}
                          {linkedTodos.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <ListTodo className="w-3 h-3" />{" "}
                              {linkedTodos.length === 1
                                ? t("1 task")
                                : t("{count} tasks", { count: linkedTodos.length })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.category ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(est)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(paid)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          remaining < 0 ? "text-red-600 font-medium" : ""
                        }`}
                      >
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => void remove(item.id)}>
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

      {/* Detail sheet */}
      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <DetailView
              item={selected}
              todos={todos.filter((td) => td.budget_item_id === selected.id)}
              onEdit={() => {
                openEdit(selected);
                setSelected(null);
              }}
              onDelete={() => void remove(selected.id)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailView({
  item,
  todos,
  onEdit,
  onDelete,
}: {
  item: BudgetItem;
  todos: TodoLite[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, locale } = useI18n();
  const formatCurrency = (n: number) => formatMoney(n, locale);
  const est = Number(item.estimated_cost ?? 0);
  const paid = Number(item.paid_amount ?? 0);
  const remaining = est - paid;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display text-2xl">{item.name}</SheetTitle>
        {item.category && (
          <p className="text-xs uppercase tracking-wider text-primary">{item.category}</p>
        )}
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Budget details */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t("Budget details")}
          </h3>
          <div className="rounded-xl border border-border divide-y divide-border">
            <Row label={t("Estimated")} value={formatCurrency(est)} />
            <Row label={t("Paid")} value={formatCurrency(paid)} />


            <Row
              label={t("Remaining")}
              value={formatCurrency(remaining)}
              danger={remaining < 0}
            />
          </div>
          {item.notes && (
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{item.notes}</p>
          )}
        </section>

        {/* Vendor info */}
        {item.vendor_name ? (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t("Vendor")}
            </h3>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Briefcase className="w-4 h-4 text-primary" /> {item.vendor_name}
              </div>
              {item.vendor_contact_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" /> {item.vendor_contact_name}
                </div>
              )}
              {item.vendor_email && (
                <a
                  href={`mailto:${item.vendor_email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="w-3.5 h-3.5" /> {item.vendor_email}
                </a>
              )}
              {item.vendor_phone && (
                <a
                  href={`tel:${item.vendor_phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="w-3.5 h-3.5" /> {item.vendor_phone}
                </a>
              )}
              {safeHttpUrl(item.vendor_website) && (
                <a
                  href={safeHttpUrl(item.vendor_website)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground truncate"
                >
                  <Globe className="w-3.5 h-3.5" /> {item.vendor_website}
                </a>
              )}
              {item.vendor_notes && (
                <p className="text-sm text-muted-foreground whitespace-pre-line pt-2 border-t border-border">
                  {item.vendor_notes}
                </p>
              )}
            </div>
          </section>
        ) : (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t("Vendor")}
            </h3>
            <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-4 text-center">
              {t("No vendor attached. Edit this item to add one.")}
            </p>
          </section>
        )}

        {/* Linked todos */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t("Linked tasks")}
          </h3>
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-4 text-center">
              {t("No linked tasks. Create tasks in the ToDo planner and link them to this item.")}
            </p>
          ) : (
            <ul className="rounded-xl border border-border divide-y divide-border">
              {todos.map((td) => (
                <li key={td.id} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <ListTodo className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className={td.status === "done" ? "line-through text-muted-foreground" : ""}>
                    {td.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex gap-2 pt-2">
          <Button onClick={onEdit} className="flex-1">
            <Pencil className="w-3.5 h-3.5" /> {t("Edit")}
          </Button>
          <Button variant="outline" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" /> {t("Delete")}
          </Button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums font-medium ${danger ? "text-red-600" : ""}`}>{value}</span>
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
        <Icon className="w-4 h-4" />
        <p className="text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className={`font-display text-2xl mt-2 ${toneClass}`}>{value}</p>
    </div>
  );
}
