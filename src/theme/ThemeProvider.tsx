import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DEFAULT_THEME_ID, getTheme } from "./themes";
import type { ThemeDefinition, ThemeId } from "./types";

interface ThemeContextValue {
  theme: ThemeDefinition;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getTheme(DEFAULT_THEME_ID),
});

/**
 * Applies a theme to a subtree.
 *
 * - sets `data-theme` so the CSS token layer switches
 * - inlines any token overrides declared by the theme (SSR-safe, no flash)
 * - exposes the decorative recipe through context
 *
 * Nest it anywhere: the whole public site, or a single wedding subtree that
 * later stores its own `theme` column.
 */
export function ThemeProvider({
  themeId,
  children,
  asPageRoot = false,
}: {
  themeId?: ThemeId | string | null;
  children: ReactNode;
  /** When true, also applies the theme to <html> (page-level theming). */
  asPageRoot?: boolean;
}) {
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  useEffect(() => {
    if (!asPageRoot || typeof document === "undefined") return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", theme.id);
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
      else root.removeAttribute("data-theme");
    };
  }, [asPageRoot, theme.id]);

  const style = useMemo(() => theme.tokens as CSSProperties, [theme.tokens]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div data-theme={theme.id} style={style} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeDefinition {
  return useContext(ThemeContext).theme;
}

/** Font <link> descriptors for a theme, for use in a route `head()`. */
export function themeFontLinks(themeId?: ThemeId | string | null) {
  return getTheme(themeId).fontHrefs.map((href) => ({ rel: "stylesheet", href }));
}
