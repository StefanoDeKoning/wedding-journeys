import { useEffect, useState } from "react";
import { ThemedCard } from "@/design-system";
import { cn } from "@/lib/utils";
import { useT, type MessageKey } from "@/i18n";

interface CountdownProps {
  /** ISO timestamp to count down to */
  target: string;
  /** Optional label shown above the digits */
  label?: string;
  /** Compact layout for tight spaces (e.g. tucked under an invitation title). */
  compact?: boolean;
  /** Show the seconds tile (default true). */
  showSeconds?: boolean;
  /**
   * "tiles" (default): each unit in its own veil card, label above.
   * "inline": large numerals divided by gold hairlines, label below — for heroes.
   */
  variant?: "tiles" | "inline";
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: ms === 0 };
}

export function Countdown({
  target,
  label,
  compact,
  showSeconds = true,
  variant = "tiles",
}: CountdownProps) {
  const tr = useT();

  const date = new Date(target);
  const valid = !Number.isNaN(date.getTime());
  const [t, setT] = useState(() => diff(date));

  useEffect(() => {
    if (!valid) return;
    const id = setInterval(() => setT(diff(date)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, valid]);

  if (!valid) return null;

  if (t.done) {
    if (variant === "inline") return <p className="type-script">{tr("today is the day")}</p>;
    return (
      <ThemedCard
        variant="framed"
        ornament
        className="mx-auto max-w-sm animate-ds-scale text-center"
      >
        <p className="type-script">{tr("today is the day")}</p>
      </ThemedCard>
    );
  }

  const items: { value: number; label: MessageKey }[] = [
    { value: t.days, label: "days" },
    { value: t.hours, label: "hours" },
    { value: t.minutes, label: "minutes" },
    ...(showSeconds ? [{ value: t.seconds, label: "seconds" as const }] : []),
  ];

  if (variant === "inline") {
    return (
      <div className="text-center">
        <div className="flex justify-center">
          {items.map((i, idx) => (
            <div
              key={i.label}
              className={cn(
                "grid gap-1.5 px-5 sm:px-10",
                idx > 0 && "border-l border-[color-mix(in_oklab,var(--ds-gold)_40%,transparent)]",
              )}
            >
              <span
                className="font-display text-[clamp(2.75rem,5vw,4.125rem)] font-light leading-none tabular-nums"
                aria-label={`${i.value} ${tr(i.label)}`}
              >
                {String(i.value).padStart(2, "0")}
              </span>
              <span className="type-label !text-primary" aria-hidden="true">
                {tr(i.label)}
              </span>
            </div>
          ))}
        </div>
        {label && <p className="type-script-sm mt-4 !text-muted-foreground">{label}</p>}
      </div>
    );
  }

  return (
    <div className="text-center">
      {label && <p className={cn("type-script-sm", compact ? "mb-2" : "mb-4")}>{label}</p>}
      <div
        className={cn(
          "grid gap-gutter max-w-xl mx-auto",
          showSeconds ? "grid-cols-4" : "grid-cols-3",
          compact && "max-w-sm",
        )}
      >
        {items.map((i) => (
          <div
            key={i.label}
            className={cn("surface-veil px-2 md:px-4", compact ? "py-2 md:py-3" : "py-4 md:py-6")}
          >
            <div
              className={cn("tabular-nums", compact ? "type-section-title" : "type-card-title")}
              aria-label={`${i.value} ${tr(i.label)}`}
            >
              {String(i.value).padStart(2, "0")}
            </div>
            <div className={cn("type-label", compact ? "mt-0" : "mt-1")}>{tr(i.label)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
