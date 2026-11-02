import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/auth/AuthProvider";
import { LanguageProvider, tHead, useT } from "@/i18n";
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
  const t = useT();
  return (
    <PageCanvas density="quiet">
      <Section size="hero" width="prose">
        <div className="text-center">
          <p className="type-script">{t("lost your way?")}</p>
          <h1 className="type-hero mt-2">404</h1>
          <p className="type-body-lg mt-4 text-muted-foreground">
            {t("The page you're looking for doesn't exist or has been moved.")}
          </p>
          <ThemedButton asChild size="lg" className="mt-6">
            <Link to="/">{t("Go home")}</Link>
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
      { title: tHead("OurJourney — Your story. Beautifully shared.") },
      {
        name: "description",
        content: tHead(
          "A romantic wedding website platform. Each couple gets their own private home — from RSVPs to the last dance.",
        ),
      },
      { name: "author", content: "OurJourney" },
      // Link previews (WhatsApp etc.) are fetched without JavaScript or a language
      // preference, so Open Graph tags stay in the default language (Dutch).
      { property: "og:title", content: "OurJourney — Jullie verhaal, prachtig gedeeld." },
      { property: "og:description", content: "Een romantisch thuis voor elke bruiloft." },
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
    <html lang="nl">
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
      <LanguageProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
