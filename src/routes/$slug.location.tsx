import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { safeHttpUrl } from "@/lib/safeUrl";
import { WatercolorBlot, RoseVine, FloatingPetals, FloralDivider } from "@/wedding/FloralDecorations";

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
    <section className="relative mx-auto max-w-4xl px-6 py-16 sm:py-24">
      {/* Decorative side elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <WatercolorBlot color="rose" size="lg" className="absolute top-12 -right-16 opacity-35 rose-glow" />
        <WatercolorBlot color="sage" size="lg" className="absolute bottom-12 -left-16 opacity-30 rose-glow" style={{ animationDelay: "2s" }} />
        <RoseVine variant="corner-top-right" size="sm" color="sage" className="absolute top-6 right-6 opacity-50" />
        <RoseVine variant="corner-bottom-left" size="sm" color="sage" className="absolute bottom-6 left-6 opacity-50" />
        <FloatingPetals count={6} />
      </div>

      <header className="relative z-10 text-center mb-12">
        <p className="font-script text-3xl md:text-4xl text-primary">find us here</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{wedding.location_name}</h1>
        <FloralDivider className="mt-6" color="terracotta" />
        {wedding.location_address && (
          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
            {wedding.location_address}
          </p>
        )}
      </header>

      <div className="relative z-10 rounded-[2rem] overflow-hidden border border-border shadow-card mb-8">
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
        <div className="relative z-10 flex justify-center">
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
