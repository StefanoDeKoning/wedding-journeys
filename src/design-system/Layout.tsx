import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import floralColumn from "@/assets/floral-column-gold.png.asset.json";
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
    density === "quiet"
      ? Math.round(theme.decor.particleCount / 2)
      : density === "lavish"
        ? Math.round(theme.decor.particleCount * 1.5)
        : theme.decor.particleCount;

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
          {/* Painted floral columns hugging both margins — pinned to the
              viewport so the flowers keep the same scale on long pages.
              On phones they scale down instead of disappearing. */}
          <div>
            <img
              src={floralColumn.url}
              alt=""
              loading="lazy"
              width={640}
              height={1920}
              className="fixed left-0 top-0 h-screen w-[clamp(4.5rem,26vw,20rem)] object-cover object-right decor-fade-x sm:w-[clamp(7rem,24vw,20rem)] lg:w-[clamp(11rem,20vw,20rem)]"
              style={{ opacity: intensity * 0.9 }}
            />
            <img
              src={floralColumn.url}
              alt=""
              loading="lazy"
              width={640}
              height={1920}
              className="fixed right-0 top-0 h-screen w-[clamp(4.5rem,26vw,20rem)] -scale-x-100 object-cover object-right decor-fade-x sm:w-[clamp(7rem,24vw,20rem)] lg:w-[clamp(11rem,20vw,20rem)]"
              style={{ opacity: intensity * 0.9 }}
            />
          </div>

          {/* Painted margins — softer and smaller on phones */}
          <div className="decor-fade-x hidden sm:block">
            <DecorSideComposition placement="side-left" intensity={intensity * 0.5} motifs={theme.decor.sides} />
            <DecorSideComposition placement="side-right" intensity={intensity * 0.5} motifs={theme.decor.sides} />
          </div>

          {/* Mobile keeps extra atmosphere with soft washes behind the columns */}
          <div className="lg:hidden">
            <WatercolorWash
              color="decor-soft"
              size="xl"
              intensity={intensity * 0.4}
              className="absolute -top-24 -right-28"
            />
            <WatercolorWash
              color="decor-leaf"
              size="lg"
              intensity={intensity * 0.3}
              className="absolute bottom-10 -left-24"
            />
          </div>
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
