import { createFileRoute } from "@tanstack/react-router";
import { useWedding } from "@/wedding/useWedding";
import { Coffee, Sparkles, Music, GlassWater, UtensilsCrossed, Cake, Heart } from "lucide-react";

export const Route = createFileRoute("/$slug/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline" },
      { name: "description", content: "How the day unfolds." },
    ],
  }),
  component: TimelinePage,
});

const events = [
  { time: "13:30", title: "Welcome drinks", desc: "Arrive a little early — meet the family.", Icon: Coffee, kind: "day" as const },
  { time: "14:30", title: "Ceremony", desc: "We say our vows under the old oak.", Icon: Heart, kind: "day" as const },
  { time: "15:30", title: "Garden reception", desc: "Photos, canapés, golden hour.", Icon: Sparkles, kind: "day" as const },
  { time: "18:30", title: "Dinner", desc: "Long tables, candlelight, slow courses.", Icon: UtensilsCrossed, kind: "day" as const },
  { time: "20:30", title: "Cake & speeches", desc: "Evening guests join us here.", Icon: Cake, kind: "evening" as const },
  { time: "21:30", title: "First dance", desc: "And then everyone is on the floor.", Icon: Music, kind: "evening" as const },
  { time: "00:30", title: "Last dance", desc: "Until the candles burn low.", Icon: GlassWater, kind: "evening" as const },
];

function TimelinePage() {
  const { slug } = Route.useParams();
  const { wedding, guest } = useWedding(slug);
  if (!wedding) return null;

  const isEvening = guest?.guest_type === "evening";

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <header className="text-center mb-12">
        <p className="font-script text-3xl text-primary">how the day unfolds</p>
        <h1 className="mt-2 font-display text-4xl">Wedding timeline</h1>
        {isEvening && (
          <p className="mt-3 text-sm text-muted-foreground">
            You're invited from the cake & speeches onwards — but you're welcome
            to arrive a little earlier.
          </p>
        )}
      </header>

      <ol className="relative border-l-2 border-primary/20 ml-3 sm:ml-5 space-y-10">
        {events.map(({ time, title, desc, Icon, kind }) => {
          const dimmed = isEvening && kind === "day";
          return (
            <li key={time} className={`pl-8 sm:pl-10 ${dimmed ? "opacity-50" : ""}`}>
              <span className="absolute -left-[14px] flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-warm">
                <Icon className="w-3.5 h-3.5" />
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xl text-primary tabular-nums">
                  {time}
                </span>
                <h3 className="font-display text-lg">{title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              {dimmed && (
                <p className="mt-1 text-[0.7rem] uppercase tracking-widest text-muted-foreground/80">
                  Day guests only
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
