import { useEffect, useRef } from "react";

/**
 * Scroll-linked parallax drift for decorative artwork — never for content.
 * Attach the returned ref to a `DecorMotifArt` / `WatercolorWash` wrapper (or
 * any purely decorative element); it applies a small `translateY` that
 * tracks scroll position toward/away from viewport center.
 *
 * - Max shift comes from the theme token `--ds-parallax-shift`, so a theme
 *   can widen or narrow the effect without touching this hook.
 * - `strength` (default 1) scales that shift per-instance, e.g. 0.5 for a
 *   subtler layer behind a bolder one.
 * - No-ops entirely under `prefers-reduced-motion: reduce`.
 * - rAF-throttled scroll/resize listener; never triggers layout (transform
 *   only).
 */
export function useParallax<T extends HTMLElement>(strength = 1) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const maxShift =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--ds-parallax-shift"),
      ) || 32;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      const elMid = rect.top + rect.height / 2;
      const progress = Math.max(-1, Math.min(1, (elMid - viewportMid) / viewportMid));
      el.style.transform = `translate3d(0, ${(progress * maxShift * strength).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);

  return ref;
}
