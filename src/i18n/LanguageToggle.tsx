import { useI18n } from "./index";
import type { Lang } from "./index";

const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "nl", label: "NL", name: "Nederlands" },
  { code: "en", label: "EN", name: "English" },
];

/**
 * "NL · EN" segmented switch. The active language is filled in; each option
 * names its language in that language, so it reads the same for everyone.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("Language")}
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border p-0.5 ${className}`}
    >
      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            title={l.name}
            aria-pressed={active}
            onClick={() => setLang(l.code)}
            className={
              "type-label inline-flex h-10 min-w-11 items-center justify-center rounded-full px-2 !tracking-[0.12em] " +
              "transition-colors duration-[var(--ds-dur-fast)] focus-ring-elegant sm:h-8 sm:min-w-10 " +
              (active
                ? "bg-foreground !text-[var(--section-bg,var(--background))]"
                : "!text-muted-foreground hover:!text-foreground")
            }
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
