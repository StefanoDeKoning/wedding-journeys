/**
 * Returns the URL only if it uses a safe http(s) scheme.
 * Prevents XSS via `javascript:`, `data:`, etc. when rendering as href.
 */
export function safeHttpUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return undefined;
  return trimmed;
}
