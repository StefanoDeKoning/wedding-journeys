import { useI18n } from "./index";

function FlagNL() {
  return (
    <svg viewBox="0 0 9 6" className="h-full w-full" aria-hidden="true">
      <rect width="9" height="2" y="0" fill="#AE1C28" />
      <rect width="9" height="2" y="2" fill="#FFFFFF" />
      <rect width="9" height="2" y="4" fill="#21468B" />
    </svg>
  );
}

function FlagUK() {
  return (
    <svg viewBox="0 0 60 30" className="h-full w-full" aria-hidden="true">
      <clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath="url(#uk-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

/** Shows the flag of the current language; tap to switch. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useI18n();
  const label = lang === "nl" ? "Switch to English" : "Schakel naar Nederlands";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-6 w-9 shrink-0 overflow-hidden rounded-sm border border-border shadow-elev-1 transition-transform hover:scale-105 focus-ring-elegant ${className}`}
    >
      {lang === "nl" ? <FlagNL /> : <FlagUK />}
    </button>
  );
}
