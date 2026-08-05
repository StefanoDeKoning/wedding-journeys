import { useEffect, useState } from "react";

interface CountdownProps {
  /** ISO timestamp to count down to */
  target: string;
  /** Optional label shown above the digits */
  label?: string;
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: ms === 0 };
}

export function Countdown({ target, label }: CountdownProps) {
  const date = new Date(target);
  const [t, setT] = useState(() => diff(date));

  useEffect(() => {
    const id = setInterval(() => setT(diff(date)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (t.done) {
    return (
      <p className="font-script text-3xl text-primary text-center">today is the day</p>
    );
  }

  const items: { value: number; label: string }[] = [
    { value: t.days, label: "days" },
    { value: t.hours, label: "hours" },
    { value: t.minutes, label: "minutes" },
    { value: t.seconds, label: "seconds" },
  ];

  return (
    <div className="text-center">
      {label && (
        <p className="font-script text-2xl md:text-3xl text-primary mb-3">{label}</p>
      )}
      <div className="grid grid-cols-4 gap-3 md:gap-5 max-w-xl mx-auto">
        {items.map((i) => (
          <div
            key={i.label}
            className="rounded-2xl border border-border bg-card/70 backdrop-blur px-2 md:px-4 py-4 md:py-6"
          >
            <div
              className="font-display text-3xl md:text-5xl text-foreground tabular-nums"
              aria-label={`${i.value} ${i.label}`}
            >
              {String(i.value).padStart(2, "0")}
            </div>
            <div className="text-[0.65rem] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
              {i.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
