import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create your wedding — OurJourney" },
      { name: "description", content: "Claim your wedding URL on OurJourney in under a minute. Free while you plan." },
      { property: "og:title", content: "Create your wedding — OurJourney" },
      { property: "og:description", content: "Begin your OurJourney." },
    ],
  }),
  component: CreatePage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function CreatePage() {
  const [partnerA, setPartnerA] = useState("");
  const [partnerB, setPartnerB] = useState("");
  const slug = slugify([partnerA, partnerB].filter(Boolean).join("-")) || "your-names";

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sunset" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-24 text-center">
          <p className="font-script text-3xl text-primary">begin</p>
          <h1 className="mt-4 text-5xl md:text-6xl text-balance">Create your wedding home.</h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Pick your names — we'll set up your private wedding website and admin dashboard.
            You can refine everything afterwards.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 -mt-12 pb-28">
        <form
          className="rounded-[2rem] border border-border bg-card p-8 md:p-10 shadow-soft space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="a">Partner one</Label>
              <Input id="a" placeholder="Jan" value={partnerA} onChange={(e) => setPartnerA(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b">Partner two</Label>
              <Input id="b" placeholder="Sophie" value={partnerB} onChange={(e) => setPartnerB(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your wedding URL</Label>
            <div className="flex items-center rounded-md border border-input bg-background px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">ourjourney.com/</span>
              <span className="font-display italic text-primary ml-1">{slug}</span>
            </div>
            <p className="text-xs text-muted-foreground">You can change this later.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your email</Label>
            <Input id="email" type="email" placeholder="hello@example.com" required />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full bg-primary hover:bg-primary/90 h-12 shadow-warm"
          >
            Reserve our journey
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Backend coming next — this is a preview of the design.
          </p>
        </form>
      </section>
    </SiteShell>
  );
}
