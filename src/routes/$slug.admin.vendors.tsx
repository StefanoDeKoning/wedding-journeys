import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  Globe,
  Wallet,
  ListTodo,
} from "lucide-react";
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

export const Route = createFileRoute("/$slug/admin/vendors")({
  head: () => ({ meta: [{ title: "Vendors" }] }),
  component: VendorsPage,
});

interface Vendor {
  id: string;
  wedding_id: string;
  name: string;
  category: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
}

interface LinkedBudget {
  id: string;
  name: string;
  vendor_id: string | null;
}

interface LinkedTodo {
  id: string;
  title: string;
  vendor_id: string | null;
}

interface FormState {
  id?: string;
  name: string;
  category: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
}

const emptyForm: FormState = {
  name: "",
  category: "",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  notes: "",
};

function VendorsPage() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  const [vendors, setVendors] = useState<Vendor[] | null>(null);
  const [budgetItems, setBudgetItems] = useState<LinkedBudget[]>([]);
  const [todoItems, setTodoItems] = useState<LinkedTodo[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wedding) return;
    void load(wedding.id);
  }, [wedding]);

  const load = async (weddingId: string) => {
    const [v, b, t] = await Promise.all([
      supabase
        .from("vendors" as never)
        .select("*")
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: true }),
      supabase
        .from("budget_items" as never)
        .select("id,name,vendor_id")
        .eq("wedding_id", weddingId),
      supabase
        .from("todo_tasks")
        .select("id,title,vendor_id")
        .eq("wedding_id", weddingId),
    ]);
    if (v.error) toast.error(v.error.message);
    setVendors(((v.data ?? []) as unknown) as Vendor[]);
    setBudgetItems(((b.data ?? []) as unknown) as LinkedBudget[]);
    setTodoItems(((t.data ?? []) as unknown) as LinkedTodo[]);
  };

  const linksByVendor = useMemo(() => {
    const map = new Map<string, { budgets: LinkedBudget[]; todos: LinkedTodo[] }>();
    (vendors ?? []).forEach((v) =>
      map.set(v.id, { budgets: [], todos: [] }),
    );
    budgetItems.forEach((b) => {
      if (b.vendor_id && map.has(b.vendor_id)) map.get(b.vendor_id)!.budgets.push(b);
    });
    todoItems.forEach((t) => {
      if (t.vendor_id && map.has(t.vendor_id)) map.get(t.vendor_id)!.todos.push(t);
    });
    return map;
  }, [vendors, budgetItems, todoItems]);

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setForm({
      id: v.id,
      name: v.name,
      category: v.category ?? "",
      contact_name: v.contact_name ?? "",
      email: v.email ?? "",
      phone: v.phone ?? "",
      website: v.website ?? "",
      notes: v.notes ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!wedding) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    const payload = {
      wedding_id: wedding.id,
      name: form.name.trim(),
      category: form.category.trim() || null,
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      notes: form.notes.trim() || null,
    };
    let error;
    if (form.id) {
      ({ error } = await supabase
        .from("vendors" as never)
        .update(payload as never)
        .eq("id", form.id));
    } else {
      ({ error } = await supabase.from("vendors" as never).insert(payload as never));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Vendor updated" : "Vendor added");
    setOpen(false);
    setForm(emptyForm);
    void load(wedding.id);
  };

  const remove = async (id: string) => {
    if (!wedding) return;
    if (!confirm("Delete this vendor? Linked budget and tasks will be unlinked but kept.")) return;
    const { error } = await supabase.from("vendors" as never).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Vendor deleted");
    void load(wedding.id);
  };

  if (!wedding || vendors === null) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-script text-xl text-primary">your team</p>
          <h2 className="font-display text-2xl">Vendors</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <Plus className="w-3.5 h-3.5" />
              Add vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit vendor" : "New vendor"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe Photography"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Photography"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Contact name</Label>
                <Input
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
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
                {form.id ? "Save changes" : "Add vendor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {vendors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Users className="w-6 h-6 mx-auto mb-2 opacity-60" />
          No vendors yet. Add your first one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vendors.map((v) => {
            const links = linksByVendor.get(v.id) ?? { budgets: [], todos: [] };
            return (
              <div
                key={v.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg truncate">{v.name}</h3>
                    {v.category && (
                      <p className="text-xs uppercase tracking-wider text-primary mt-0.5">
                        {v.category}
                      </p>
                    )}
                    {v.contact_name && (
                      <p className="text-sm text-muted-foreground mt-1">{v.contact_name}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(v)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => void remove(v.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  {v.email && (
                    <a
                      href={`mailto:${v.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="w-3.5 h-3.5" /> {v.email}
                    </a>
                  )}
                  {v.phone && (
                    <a
                      href={`tel:${v.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="w-3.5 h-3.5" /> {v.phone}
                    </a>
                  )}
                  {v.website && (
                    <a
                      href={v.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground truncate"
                    >
                      <Globe className="w-3.5 h-3.5" /> {v.website}
                    </a>
                  )}
                </div>
                {v.notes && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{v.notes}</p>
                )}
                {(links.budgets.length > 0 || links.todos.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                    {links.budgets.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Wallet className="w-3 h-3" /> {b.name}
                      </div>
                    ))}
                    {links.todos.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <ListTodo className="w-3 h-3" /> {t.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
