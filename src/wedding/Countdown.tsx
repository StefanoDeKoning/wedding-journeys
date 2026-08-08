import { useEffect, useState } from "react";
import { ThemedCard } from "@/design-system";

interface CountdownProps {
  /** ISO timestamp to count down to */
  target: string;
  /** Optional label shown above the digits */
  label?: string;
  /** Compact layout for tight spaces (e.g. tucked under an invitation title). */
  compact?: boolean;
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
      <ThemedCard variant="framed" ornament className="mx-auto max-w-sm animate-ds-scale text-center">
        <p className="type-script">today is the day</p>
      </ThemedCard>
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
      {label && <p className="type-script-sm mb-4">{label}</p>}
      <div className="grid grid-cols-4 gap-gutter max-w-xl mx-auto">
        {items.map((i) => (
          <div
            key={i.label}
            className="surface-veil px-2 md:px-4 py-4 md:py-6"
          >
            <div
              className="type-card-title tabular-nums"
              aria-label={`${i.value} ${i.label}`}
            >
              {String(i.value).padStart(2, "0")}
            </div>
            <div className="type-label mt-1">{i.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
