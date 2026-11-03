import { cn } from "@/lib/utils";

/**
 * The venue as a gold line drawing: the old oak where the ceremony happens,
 * the three castle buildings around the courtyard, and the string lights
 * over the dinner tables. Used as the horizon under the invitation hero.
 *
 * Two crops of the same drawing: the full width on larger screens, and a
 * tighter frame around the oak and the castle on phones so the lines stay
 * legible. Strokes don't scale, so they stay hairline-thin in both.
 */
export function CastleSkyline({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("mx-auto w-full max-w-[75rem]", className)}>
      <svg viewBox="330 6 640 166" className="block h-auto w-full overflow-visible sm:hidden">
        <SkylineArt />
      </svg>
      <svg viewBox="0 0 1200 172" className="hidden h-auto w-full overflow-visible sm:block">
        <SkylineArt />
      </svg>
    </div>
  );
}

const LINE = {
  fill: "none",
  stroke: "var(--ds-gold)",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;
const SOFT = { ...LINE, strokeOpacity: 0.45 } as const;
const WINDOW = { fill: "color-mix(in oklab, var(--ds-gold-hi) 55%, transparent)" } as const;

const BULBS: [number, number][] = [
  [849, 95],
  [876, 99],
  [903, 97],
  [957, 97.5],
  [985, 100],
  [1012, 97.5],
];

function SkylineArt() {
  return (
    <>
      {/* ground */}
      <path style={SOFT} d="M120 160H300M900 160H1080" />
      <path style={LINE} d="M300 160H900" />

      {/* the old oak */}
      <path
        style={LINE}
        d="M352 96C334 92 332 66 352 62C350 40 376 30 392 40C402 22 434 22 444 40C462 32 484 46 476 64C494 70 490 96 470 98C458 108 438 106 428 100C414 108 392 108 384 100C372 106 358 104 352 96Z"
      />
      <path
        style={LINE}
        d="M404 160C406 140 402 125 398 106M418 160C416 140 420 125 426 106M398 106C390 100 380 98 372 92M426 106C434 100 446 98 452 90M411 112V88"
      />

      {/* left wing with a stepped gable */}
      <path style={LINE} d="M500 160V100H508V92H516V84H524V76H532V68H548V72H620M572 100H620" />
      <circle style={WINDOW} cx={540} cy={88} r={3.5} />
      <rect style={WINDOW} x={518} y={118} width={9} height={15} rx={1} />
      <rect style={WINDOW} x={584} y={116} width={9} height={15} rx={1} />

      {/* main house */}
      <path
        style={LINE}
        d="M612 100L650 52H750L788 100H612ZM620 100V160M780 100V160M736 52V40H744V52M690 70L700 60L710 70"
      />
      <path style={LINE} d="M692 160V134A8 8 0 0 1 708 134V160" />
      {[638, 664, 726, 752].map((x) => (
        <rect key={x} style={WINDOW} x={x} y={114} width={10} height={17} rx={1} />
      ))}

      {/* tower */}
      <path style={LINE} d="M780 68H822V160M774 68L801 24L828 68M801 24V10L812 13L801 16" />
      <path style={LINE} d="M796 102V93A5 5 0 0 1 806 93V102Z" />

      {/* right wing */}
      <path style={LINE} d="M822 106H920V160M818 106L840 84H904L926 106" />
      <rect style={WINDOW} x={846} y={122} width={9} height={15} rx={1} />
      <rect style={WINDOW} x={880} y={122} width={9} height={15} rx={1} />

      {/* string lights over the courtyard */}
      <path style={SOFT} d="M822 86Q876 110 930 90Q985 110 1040 90M930 160V88M1040 160V88" />
      {BULBS.map(([cx, cy]) => (
        <g key={cx}>
          <circle
            cx={cx}
            cy={cy}
            r={7}
            style={{ fill: "color-mix(in oklab, var(--ds-gold-hi) 22%, transparent)" }}
          />
          <circle cx={cx} cy={cy} r={2.6} style={{ fill: "var(--ds-gold-hi)" }} />
        </g>
      ))}
    </>
  );
}
