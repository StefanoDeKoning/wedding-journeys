/**
 * Build the personal invitation URL for a guest.
 * URL contains only the wedding slug and the globally-unique invitation code —
 * no personal data. Designed to be reusable for future email / WhatsApp / QR flows.
 */
export function buildInvitationLink(slug: string, code: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "https://ourjourney.com");
  return `${base.replace(/\/$/, "")}/${slug}/invite/${encodeURIComponent(code)}`;
}
