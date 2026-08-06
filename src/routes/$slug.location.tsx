import { createFileRoute } from "@tanstack/react-router";
import { Navigation, Clock } from "lucide-react";
import { useWeddingContext } from "@/wedding/WeddingContext";
import { safeHttpUrl } from "@/lib/safeUrl";
import {
  PageCanvas,
  Container,
  Section,
  SectionHeader,
  ThemedCard,
  ThemedButton,
  IllustrationFrame,
  InfoCard,
  Hero,
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

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function LocationPage() {
  const { wedding } = useWeddingContext();

  // Build an embed URL using a free Google Maps query — no API key needed.
  const query = encodeURIComponent(
    [wedding.location_name, wedding.location_address].filter(Boolean).join(", "),
  );
  const embedSrc = `https://www.google.com/maps?q=${query}&output=embed`;
  const mapsUrl = safeHttpUrl(wedding.maps_url);
  const hasTimes = wedding.ceremony_at || wedding.reception_at;

  return (
    <PageCanvas density="regular">
      <Container width="prose">
        <Hero
          script="find us here"
          title={wedding.location_name || "Venue to be announced"}
          subtitle={wedding.location_address}
        />
      </Container>

      <Section size="spacious" width="content">
        <SectionHeader eyebrow="every road leads here" title="Find your way" align="center" />

        <div className="mt-block grid gap-stack lg:grid-cols-[1fr_auto] lg:items-start">
          <IllustrationFrame>
            <iframe
              title="Map"
              src={embedSrc}
              width="100%"
              height="320"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/3] w-full sm:aspect-video lg:h-[420px] lg:aspect-auto"
            />
          </IllustrationFrame>

          <ThemedCard variant="veil" className="flex flex-col items-center gap-4 text-center lg:w-56">
            <DecorMotifArt motif="castle" size="sm" intensity={0.9} />
            <p className="type-body text-muted-foreground">
              We can't wait to welcome you at {wedding.location_name || "our venue"}.
            </p>
            {mapsUrl && (
              <ThemedButton asChild size="lg" className="w-full">
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  <Navigation aria-hidden="true" className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </ThemedButton>
            )}
          </ThemedCard>
        </div>

        {hasTimes && (
          <div className="mt-stack grid gap-gutter sm:grid-cols-2">
            {wedding.ceremony_at && (
              <InfoCard label="Ceremony" value={formatTime(wedding.ceremony_at)} hint={<Clock aria-hidden="true" className="mx-auto h-3.5 w-3.5" />} />
            )}
            {wedding.reception_at && (
              <InfoCard label="Reception" value={formatTime(wedding.reception_at)} hint={<Clock aria-hidden="true" className="mx-auto h-3.5 w-3.5" />} />
            )}
          </div>
        )}
      </Section>
    </PageCanvas>
  );
}
