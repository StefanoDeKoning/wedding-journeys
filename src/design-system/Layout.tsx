import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";
import {
  DecorParticles,
  DecorSideComposition,
  WatercolorWash,
} from "./decor/Illustrations";

/**
 * PageCanvas — the atmospheric shell every public page sits in.
 *
 * It owns the "sides as storytelling space" philosophy: painted side
 * compositions, paper texture, vignette and ambient particles, all driven by
 * the active theme's decor recipe. Pages never place decorations themselves.
 */
export function PageCanvas({
  children,
  className,
  decor = true,
  density = "regular",
}: {
  children: ReactNode;
  className?: string;
  /** Disable to get a quiet canvas (forms, dense admin-like views). */
  decor?: boolean;
  density?: "quiet" | "regular" | "lavish";
}) {
  const theme = useTheme();
  const intensity = density === "quiet" ? 0.4 : density === "lavish" ? 0.95 : 0.7;
  const particleCount =
    density === "quiet" ? Math.round(theme.decor.particleCount / 2) : theme.decor.particleCount;

  return (
    <div
      className={cn(
        "relative isolate min-h-screen overflow-x-clip bg-wash-page",
        theme.decor.paperTexture && "texture-paper",
        theme.decor.vignette && "vignette",
        className,
      )}
    >
      {decor && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          {/* Desktop: Full side compositions with rich layering */}
          <div className="hidden lg:block decor-fade-x">
            <DecorSideComposition placement="side-left" intensity={intensity} motifs={theme.decor.sides} />
            <DecorSideComposition placement="side-right" intensity={intensity} motifs={theme.decor.sides} />
          </div>

          {/* Tablet: Partial side compositions with reduced intensity */}
          <div className="hidden md:block lg:hidden">
            <div className="absolute inset-0 overflow-hidden" style={{ opacity: intensity * 0.6 }}>
              <DecorSideComposition
                placement="side-left"
                intensity={intensity * 0.5}
                motifs={theme.decor.sides}
                className="w-[20vw]"
              />
              <DecorSideComposition
                placement="side-right"
                intensity={intensity * 0.5}
                motifs={theme.decor.sides}
                className="w-[20vw]"
              />
            </div>
          </div>

          {/* Mobile: Top and bottom botanical frames for balanced luxury feel */}
          <div className="md:hidden">
            {/* Top botanical frame */}
            <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
              <WatercolorWash
                color="decor-soft"
                size="xl"
                intensity={intensity * 0.4}
                className="absolute -top-16 left-1/2 -translate-x-1/2"
              />
              <div className="absolute top-0 left-0 right-0 h-20 flex justify-around px-2">
                {/* Mobile decorative accents */}
                <div className="w-16 h-16 opacity-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M50,20C60,30,65,45,60,60C55,70,45,75,50,85"
                      stroke="#d4b97f"
                      strokeWidth="2"
                      fill="none"
                      opacity={intensity * 0.6}
                      strokeLinecap="round"
                    />
                    <circle cx="55" cy="45" r="4" fill="#d4b97f" opacity={intensity * 0.5} />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom botanical frame */}
            <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden pointer-events-none">
              <WatercolorWash
                color="decor-leaf"
                size="lg"
                intensity={intensity * 0.35}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2"
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 flex justify-around px-2">
                {/* Mobile decorative accents mirror top */}
                <div className="w-14 h-14 opacity-35">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform scale-y-[-1]">
                    <path
                      d="M50,20C60,30,65,45,60,60C55,70,45,75,50,85"
                      stroke="#9bb79e"
                      strokeWidth="2"
                      fill="none"
                      opacity={intensity * 0.5}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient particles on all screens */}
          <DecorParticles kind={theme.decor.particles} count={particleCount} />
        </div>
      )}
      {children}
    </div>
  );
}

/** Content container widths — the only allowed measure values. */
export function Container({
  children,
  className,
  width = "content",
}: {
  children: ReactNode;
  className?: string;
  width?: "prose" | "content" | "wide" | "full";
}) {
  const widths = {
    prose: "max-w-prose",
    content: "max-w-content",
    wide: "max-w-wide",
    full: "max-w-full",
  } as const;
  return (
    <div className={cn("mx-auto w-full px-gutter", widths[width], className)}>{children}</div>
  );
}

/** Vertical rhythm wrapper for a page section. */
export function Section({
  children,
  className,
  containerClassName,
  width = "content",
  size = "regular",
  as: Tag = "section",
  id,
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  width?: "prose" | "content" | "wide" | "full";
  size?: "compact" | "regular" | "spacious" | "hero";
  as?: "section" | "div" | "article" | "header" | "footer";
  id?: string;
}) {
  const pad = {
    compact: "py-block",
    regular: "py-section",
    spacious: "py-section-lg",
    hero: "py-hero",
  } as const;
  return (
    <Tag id={id} className={cn("relative", pad[size], className)}>
      <Container width={width} className={containerClassName}>
        {children}
      </Container>
    </Tag>
  );
}
