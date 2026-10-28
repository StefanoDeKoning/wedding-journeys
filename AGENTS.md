# Architecture

- Keep section spacing centralized in the design-system `Section` wrapper so adjacent sections cannot accumulate duplicate vertical gaps.
- Store timeline availability on each wedding and gate all timeline SELECTs with a restrictive RLS policy; use the shared database administrator check for preview access so public endpoints cannot bypass release.
- Personal invitation-code routes must be non-nested public routes (`$slug_`), outside the wedding layout, so guest authentication runs before the layout requires an authenticated guest.- UI text is English in code wrapped in `t()` from `@/i18n`; Dutch lives in `src/i18n/nl/*.ts` dictionaries keyed by the English string (auto-merged), so new strings need a Dutch entry.
