import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Tags,
  Armchair,
  CalendarHeart,
  Image as ImageIcon,
  HardDrive,
  ScrollText,
  Mail,
  ClipboardCheck,
  ListTodo,
  Wallet,
} from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/$slug/admin")({
  head: () => ({
    meta: [
      { title: "Admin" },
      { name: "description", content: "Manage your wedding." },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/$slug/admin" as const, label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/$slug/admin/rsvp" as const, label: "RSVP", icon: ClipboardCheck, exact: false },
  { to: "/$slug/admin/todo" as const, label: "ToDo", icon: ListTodo, exact: false },
  { to: "/$slug/admin/budget" as const, label: "Budget", icon: Wallet, exact: false },
  { to: "/$slug/admin/guests" as const, label: "Guests", icon: Users, exact: false },
  { to: "/$slug/admin/groups" as const, label: "Groups", icon: Tags, exact: false },
  { to: "/$slug/admin/seating" as const, label: "Seating", icon: Armchair, exact: false },
  { to: "/$slug/admin/timeline" as const, label: "Timeline", icon: CalendarHeart, exact: false },
  { to: "/$slug/admin/invitation" as const, label: "Invitation", icon: Mail, exact: false },
  { to: "/$slug/admin/photos" as const, label: "Photos", icon: ImageIcon, exact: false },
  { to: "/$slug/admin/storage" as const, label: "Storage", icon: HardDrive, exact: false },
  { to: "/$slug/admin/audit" as const, label: "Audit", icon: ScrollText, exact: false },
];

function AdminLayout() {
  const { slug } = Route.useParams();
  const { loading, isAdmin, wedding } = useWedding(slug);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) return null;

  if (!isAdmin) {
    throw redirect({ to: "/$slug", params: { slug } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <header className="mb-6">
        <p className="font-script text-2xl text-primary">behind the scenes</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage guests, seating, timeline and more for{" "}
          <span className="text-foreground font-medium">{wedding.wedding_name ?? slug}</span>.
        </p>
      </header>

      <nav className="flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 mb-6 border-b border-border scrollbar-thin">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              params={{ slug }}
              activeOptions={{ exact: t.exact }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              activeProps={{
                className:
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
