import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { NL, type MessageKey } from "./nl";

/**
 * Lightweight i18n. Source strings in code are English; `t("English")`
 * returns the Dutch translation when the language is "nl".
 * Dutch dictionaries live in src/i18n/nl/*.ts and are registered in
 * src/i18n/nl/index.ts. `t()` only accepts registered strings, so a missing
 * Dutch entry is a type error.
 * Interpolation: t("Hi {name}", { name }) — same {placeholders} in the Dutch value.
 * Runtime strings (server errors, zod messages) go through `tx()`, which
 * falls back to the English text and warns in development.
 */
export type Lang = "nl" | "en";
export type { MessageKey };
export const DEFAULT_LANG: Lang = "nl";
const STORAGE_KEY = "ourjourney-lang";
const DICT: Record<string, string> = NL;

type Vars = Record<string, string | number>;

function interpolate(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translate(lang: Lang, en: MessageKey, vars?: Vars) {
  return interpolate(lang === "nl" ? DICT[en] : en, vars);
}

// zod's built-in messages embed numbers, so they are matched by pattern.
const NL_PATTERNS: [RegExp, string][] = [
  [/^String must contain at most (\d+) character\(s\)$/, "Maximaal $1 tekens"],
  [/^String must contain at least (\d+) character\(s\)$/, "Minimaal $1 tekens"],
  [/^Number must be greater than or equal to (-?[\d.]+)$/, "Moet minimaal $1 zijn"],
  [/^Number must be less than or equal to (-?[\d.]+)$/, "Mag maximaal $1 zijn"],
];

/** Translate a string only known at runtime (e.g. a server error message). */
export function translateDynamic(lang: Lang, en: string, vars?: Vars) {
  if (lang === "nl" && !(en in DICT)) {
    const pattern = NL_PATTERNS.find(([re]) => re.test(en));
    if (pattern) return en.replace(pattern[0], pattern[1]);
    if (import.meta.env.DEV) console.warn(`[i18n] Missing Dutch translation: "${en}"`);
    return interpolate(en, vars);
  }
  return interpolate(lang === "nl" ? DICT[en] : en, vars);
}

/** BCP 47 locale for dates and numbers. English uses British conventions. */
export function localeFor(lang: Lang) {
  return lang === "nl" ? "nl-NL" : "en-GB";
}

/** Preferred browser language: nl → Dutch, en → English, anything else → Dutch. */
function detectBrowserLang(): Lang {
  const preferred = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase();
  if (preferred.startsWith("en")) return "en";
  return "nl";
}

function readStoredLang(): Lang | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "nl" ? stored : null;
  } catch {
    return null;
  }
}

// Route `head()` functions run outside React; they read the active language here.
let currentLang: Lang = DEFAULT_LANG;

/** Translate for route `head()` (tab title, meta description). */
export function tHead(en: MessageKey, vars?: Vars) {
  return translate(currentLang, en, vars);
}

type Ctx = {
  lang: Lang;
  locale: string;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (en: MessageKey, vars?: Vars) => string;
  tx: (en: string, vars?: Vars) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    setLangState(readStoredLang() ?? detectBrowserLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    if (currentLang !== lang) {
      currentLang = lang;
      // Re-run route head() so the tab title and description follow the language.
      void router.invalidate();
    }
  }, [lang, router]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page view.
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      locale: localeFor(lang),
      setLang,
      toggle: () => setLang(lang === "nl" ? "en" : "nl"),
      t: (en, vars) => translate(lang, en, vars),
      tx: (en, vars) => translateDynamic(lang, en, vars),
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
    locale: localeFor(DEFAULT_LANG),
    setLang: () => {},
    toggle: () => {},
    t: (en, vars) => translate(DEFAULT_LANG, en, vars),
    tx: (en, vars) => translateDynamic(DEFAULT_LANG, en, vars),
  };
}

export const useT = () => useI18n().t;
