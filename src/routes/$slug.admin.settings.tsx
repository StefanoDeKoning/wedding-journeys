import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAudit } from "@/wedding/audit";
import { AdminsSection } from "@/wedding/admin/AdminsSection";
import { StorageSection } from "@/wedding/admin/StorageSection";
import { AuditSection } from "@/wedding/admin/AuditSection";

export const Route = createFileRoute("/$slug/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { slug } = Route.useParams();
  const { wedding, refresh } = useWedding(slug);

  if (!wedding) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl">Wedding settings</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your wedding configuration, admins, storage and activity history in one place.
        </p>
      </section>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab wedding={wedding} refresh={refresh} />
        </TabsContent>
        <TabsContent value="admins" className="mt-6">
          <AdminsSection weddingId={wedding.id} />
        </TabsContent>
        <TabsContent value="storage" className="mt-6">
          <StorageSection weddingId={wedding.id} />
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <AuditSection weddingId={wedding.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralTab({
  wedding,
  refresh,
}: {
  wedding: NonNullable<ReturnType<typeof useWedding>["wedding"]>;
  refresh: () => Promise<void> | void;
}) {
  const [weddingName, setWeddingName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [date, setDate] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [cmName, setCmName] = useState("");
  const [cmRole, setCmRole] = useState("");
  const [cmPhone, setCmPhone] = useState("");
  const [cmEmail, setCmEmail] = useState("");
  const [tabs, setTabs] = useState({
    story_enabled: true,
    gallery_enabled: true,
    playlist_enabled: true,
    guestbook_enabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWeddingName(wedding.wedding_name ?? "");
    setBrideName(wedding.bride_name ?? "");
    setGroomName(wedding.groom_name ?? "");
    setDate(wedding.wedding_date ?? "");
    setRsvpDeadline(wedding.rsvp_deadline ? wedding.rsvp_deadline.slice(0, 10) : "");
    setLocationName(wedding.location_name ?? "");
    setLocationAddress(wedding.location_address ?? "");
    setMapsUrl(wedding.maps_url ?? "");
    setCmName(wedding.ceremony_master_name ?? "");
    setCmRole(wedding.ceremony_master_role ?? "");
    setCmPhone(wedding.ceremony_master_phone ?? "");
    setCmEmail(wedding.ceremony_master_email ?? "");
    setTabs({
      story_enabled: wedding.story_enabled !== false,
      gallery_enabled: wedding.gallery_enabled !== false,
      playlist_enabled: wedding.playlist_enabled !== false,
      guestbook_enabled: wedding.guestbook_enabled !== false,
    });
  }, [wedding]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("weddings")
      .update({
        wedding_name: weddingName.trim() || null,
        bride_name: brideName.trim() || null,
        groom_name: groomName.trim() || null,
        wedding_date: date || null,
        rsvp_deadline: rsvpDeadline ? `${rsvpDeadline}T23:59:59Z` : null,
        location_name: locationName.trim() || null,
        location_address: locationAddress.trim() || null,
        maps_url: mapsUrl.trim() || null,
        ceremony_master_name: cmName.trim() || null,
        ceremony_master_role: cmRole.trim() || null,
        ceremony_master_phone: cmPhone.trim() || null,
        ceremony_master_email: cmEmail.trim() || null,
        ...tabs,
      })
      .eq("id", wedding.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved.");
    void logAudit({
      weddingId: wedding.id,
      action: "wedding.updated",
      targetType: "wedding",
      targetId: wedding.id,
      details: { field: "settings" },
    });
    void refresh();
  };

  const isPublished = wedding.status === "published";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Publish status</p>
          <p className="font-display text-lg mt-1">
            {isPublished ? "Published" : "Draft"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isPublished
              ? "Your wedding website is live for guests."
              : "Only admins can see your wedding website. Publish it from the Overview page."}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isPublished
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isPublished ? "Live" : "Draft"}
        </span>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
        <div>
          <Label htmlFor="wn">Wedding name</Label>
          <Input
            id="wn"
            value={weddingName}
            onChange={(e) => setWeddingName(e.target.value)}
            placeholder="Sophie & Jan"
            maxLength={120}
            className="mt-1"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bn">Partner one</Label>
            <Input
              id="bn"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              maxLength={80}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="gn">Partner two</Label>
            <Input
              id="gn"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              maxLength={80}
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dt">Wedding date</Label>
            <Input
              id="dt"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="rd">RSVP deadline</Label>
            <Input
              id="rd"
              type="date"
              value={rsvpDeadline}
              onChange={(e) => setRsvpDeadline(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
        <h3 className="font-display text-lg">Venue</h3>
        <div>
          <Label htmlFor="ln">Location name</Label>
          <Input
            id="ln"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            maxLength={200}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="la">Address</Label>
          <Textarea
            id="la"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            rows={2}
            maxLength={400}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="mu">Google Maps link</Label>
          <Input
            id="mu"
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.app.goo.gl/…"
            className="mt-1"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-5">
        <div>
          <h3 className="font-display text-lg">Ceremony master</h3>
          <p className="text-sm text-muted-foreground">
            The person guests can contact with questions. Shown on the invitation page.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cmn">Name</Label>
            <Input
              id="cmn"
              value={cmName}
              onChange={(e) => setCmName(e.target.value)}
              placeholder="Anna de Vries"
              maxLength={120}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cmr">Role (optional)</Label>
            <Input
              id="cmr"
              value={cmRole}
              onChange={(e) => setCmRole(e.target.value)}
              placeholder="Ceremony master"
              maxLength={120}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cmp">Phone</Label>
            <Input
              id="cmp"
              value={cmPhone}
              onChange={(e) => setCmPhone(e.target.value)}
              placeholder="+31 6 12345678"
              maxLength={40}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cme">Email</Label>
            <Input
              id="cme"
              type="email"
              value={cmEmail}
              onChange={(e) => setCmEmail(e.target.value)}
              placeholder="anna@example.com"
              maxLength={200}
              className="mt-1"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <div>
          <h3 className="font-display text-lg">Guest pages</h3>
          <p className="text-sm text-muted-foreground">
            Choose which pages your guests can see. Hidden pages disappear from the
            guest menu — you can still edit them as an admin.
          </p>
        </div>
        {GUEST_PAGES.map((page) => (
          <div key={page.field} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{page.label}</p>
              <p className="text-xs text-muted-foreground">{page.description}</p>
            </div>
            <Switch
              checked={tabs[page.field]}
              onCheckedChange={(v) => setTabs((prev) => ({ ...prev, [page.field]: v }))}
              aria-label={`Show ${page.label} to guests`}
            />
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-full">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

const GUEST_PAGES = [
  {
    field: "story_enabled" as const,
    label: "Our story",
    description: "The chapters of how you met.",
  },
  {
    field: "gallery_enabled" as const,
    label: "Gallery",
    description: "Photo sharing and uploads by guests.",
  },
  {
    field: "playlist_enabled" as const,
    label: "Playlist",
    description: "Song suggestions from your guests.",
  },
  {
    field: "guestbook_enabled" as const,
    label: "Guestbook",
    description: "Written messages and wishes.",
  },
];
