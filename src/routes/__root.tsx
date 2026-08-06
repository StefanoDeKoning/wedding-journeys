import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/auth/AuthProvider";
import { installSupabaseAuthFetch } from "@/integrations/supabase/fetch-interceptor";
import {
  ThemeProvider,
  DEFAULT_THEME_ID,
  themeFontLinks,
  PageCanvas,
  Section,
  ThemedButton,
} from "@/design-system";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <PageCanvas density="quiet">
      <Section size="hero" width="prose">
        <div className="text-center">
          <p className="type-script">lost your way?</p>
          <h1 className="type-hero mt-2">404</h1>
          <p className="type-body-lg mt-4 text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <ThemedButton asChild size="lg" className="mt-6">
            <Link to="/">Go home</Link>
          </ThemedButton>
        </div>
      </Section>
    </PageCanvas>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OurJourney — Your story. Beautifully shared." },
      { name: "description", content: "A romantic wedding website platform. Each couple gets their own private home — from RSVPs to the last dance." },
      { name: "author", content: "OurJourney" },
      { property: "og:title", content: "OurJourney — Your story. Beautifully shared." },
      { property: "og:description", content: "A romantic home for every wedding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      ...themeFontLinks(DEFAULT_THEME_ID),
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    installSupabaseAuthFetch();
  }, []);
  return (
    <ThemeProvider themeId={DEFAULT_THEME_ID}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
