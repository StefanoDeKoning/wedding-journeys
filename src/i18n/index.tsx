import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Lightweight i18n. Source strings in code are English; `t("English")`
 * returns the Dutch translation when the language is "nl".
 * Dutch dictionaries live in src/i18n/nl/*.ts (each default-exports a
 * Record<english, dutch>) and are merged automatically.
 * Interpolation: t("Hi {name}", { name }) — same {placeholders} in the Dutch value.
 */
export type Lang = "nl" | "en";
export const DEFAULT_LANG: Lang = "nl";
const STORAGE_KEY = "ourjourney-lang";

const modules = import.meta.glob<{ default: Record<string, string> }>("./nl/*.ts", { eager: true });
const NL: Record<string, string> = Object.assign({}, ...Object.values(modules).map((m) => m.default));

function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translate(lang: Lang, en: string, vars?: Record<string, string | number>) {
  const s = lang === "nl" ? (NL[en] ?? en) : en;
  return interpolate(s, vars);
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (en: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "nl") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === "nl" ? "en" : "nl"),
      t: (en, vars) => translate(lang, en, vars),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  return {
    lang: DEFAULT_LANG,
    setLang: () => {},
    toggle: () => {},
    t: (en, vars) => translate(DEFAULT_LANG, en, vars),
  };
}

export const useT = () => useI18n().t;
