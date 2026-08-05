import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { safeHttpUrl } from "@/lib/safeUrl";
import {
  PageCanvas,
  Section,
  ThemedCard,
  ThemedButton,
  IllustrationFrame,
} from "@/design-system";
import { DecorMotifArt } from "@/design-system/decor/Illustrations";

export const Route = createFileRoute("/$slug/location")({
  head: () => ({
    meta: [
      { title: "Location" },
      { name: "description", content: "How to find us on the day." },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  const { slug } = Route.useParams();
  const { wedding } = useWedding(slug);
  if (!wedding) return null;

  // Build an embed URL using a free Google Maps query — no API key needed.
  const query = encodeURIComponent(
    [wedding.location_name, wedding.location_address].filter(Boolean).join(", "),
  );
  const embedSrc = `https://www.google.com/maps?q=${query}&output=embed`;
  const mapsUrl = safeHttpUrl(wedding.maps_url);

  return (
    <PageCanvas density="regular">
      <Section size="hero" width="prose">
        <div className="flex flex-col items-center gap-stack text-center">
          <p className="type-script animate-ds-fade">find us here</p>
          <h1 className="type-hero animate-ds-reveal">{wedding.location_name}</h1>
          {wedding.location_address && (
            <p className="type-body text-muted-foreground whitespace-pre-line animate-ds-reveal" style={{ animationDelay: "120ms" }}>
              {wedding.location_address}
            </p>
          )}
        </div>
      </Section>

      <Section size="spacious" width="content">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <IllustrationFrame caption="Every road leads here">
            <iframe
              title="Map"
              src={embedSrc}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full"
            />
          </IllustrationFrame>

          <ThemedCard variant="veil" className="flex flex-col items-center gap-4 text-center lg:w-56">
            <DecorMotifArt motif="castle" size="sm" intensity={0.9} />
            <p className="type-body text-muted-foreground">
              We can't wait to welcome you at {wedding.location_name}.
            </p>
            {mapsUrl && (
              <ThemedButton asChild size="lg" className="w-full">
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </ThemedButton>
            )}
          </ThemedCard>
        </div>
      </Section>
    </PageCanvas>
  );
}
