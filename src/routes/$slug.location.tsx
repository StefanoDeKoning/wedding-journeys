import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { safeHttpUrl } from "@/lib/safeUrl";

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

  return (
    <section className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <header className="text-center mb-10">
        <p className="font-script text-3xl text-primary">find us here</p>
        <h1 className="mt-2 font-display text-4xl">{wedding.location_name}</h1>
        {wedding.location_address && (
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
            {wedding.location_address}
          </p>
        )}
      </header>

      <div className="rounded-[1.5rem] overflow-hidden border border-border shadow-soft mb-8">
        <iframe
          title="Map"
          src={embedSrc}
          width="100%"
          height="420"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full"
        />
      </div>

      {safeHttpUrl(wedding.maps_url) && (
        <div className="flex justify-center">
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8 shadow-warm">
            <a href={safeHttpUrl(wedding.maps_url)} target="_blank" rel="noreferrer">
              <Navigation className="w-4 h-4 mr-2" />
              Open in Google Maps
            </a>
          </Button>
        </div>
      )}
    </section>
  );
}
