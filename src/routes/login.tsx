import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — OurJourney" },
      { name: "description", content: "Sign in to your OurJourney admin dashboard, or join a wedding as a guest with your invitation code." },
      { property: "og:title", content: "Login — OurJourney" },
      { property: "og:description", content: "Sign in to OurJourney." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [tab, setTab] = useState<"admin" | "guest">("admin");

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-6 pt-20 pb-28">
        <div className="text-center mb-10">
          <p className="font-script text-3xl text-primary">welcome back</p>
          <h1 className="mt-3 text-4xl">Sign in</h1>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-card shadow-soft overflow-hidden">
          <div className="grid grid-cols-2 text-sm">
            <button
              onClick={() => setTab("admin")}
              className={`py-4 transition-colors ${
                tab === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Couple / Admin
            </button>
            <button
              onClick={() => setTab("guest")}
              className={`py-4 transition-colors ${
                tab === "guest"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Guest
            </button>
          </div>

          <form
            className="p-8 space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            {tab === "admin" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="hello@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" placeholder="As written on your invitation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Invitation code</Label>
                  <Input id="code" placeholder="e.g. ROSE-2026" className="uppercase tracking-widest" />
                </div>
                <p className="text-xs text-muted-foreground">
                  No account needed — just your name and the code from your invite.
                </p>
              </>
            )}

            <Button
              type="submit"
              className="w-full rounded-full bg-primary hover:bg-primary/90 h-11"
            >
              {tab === "admin" ? "Sign in" : "Enter wedding"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New here?{" "}
          <Link to="/create" className="text-primary hover:underline">
            Create your wedding
          </Link>
        </p>
      </section>
    </SiteShell>
  );
}
