export interface InvitationTemplate {
  id: string;
  name: string;
  description: string;
  title: string;
  /** HTML content. Supports {{guest_name}} and {{plus_one_name}} placeholders. */
  content: string;
}

export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Timeless and formal.",
    title: "You're cordially invited",
    content: `<p>Dear <strong>{{guest_name}}</strong>,</p>
<p>Together with our families, we joyfully invite you to share in our wedding celebration.</p>
<p>Your presence would be the greatest gift of all.</p>
<p><em>With love,<br/>The happy couple</em></p>`,
  },
  {
    id: "modern",
    name: "Modern minimal",
    description: "Clean lines, few words.",
    title: "We're getting married.",
    content: `<h2>{{guest_name}}, save the date.</h2>
<p>Two hearts. One day. Be part of it.</p>
<p>Details on the page below — RSVP when you're ready.</p>`,
  },
  {
    id: "romantic",
    name: "Romantic",
    description: "Soft and heartfelt.",
    title: "A love story continues",
    content: `<p>Dearest <strong>{{guest_name}}</strong>,</p>
<p>From whispered beginnings to forever — we'd be honored to have you by our side as we say <em>"I do"</em>.</p>
<p>Bring joy. Bring laughter. Bring <strong>{{plus_one_name}}</strong> if you wish.</p>
<p>With all our love.</p>`,
  },
  {
    id: "playful",
    name: "Playful",
    description: "Warm and informal.",
    title: "Let's party — we're tying the knot!",
    content: `<p>Hey <strong>{{guest_name}}</strong>! 🎉</p>
<p>We're finally doing it. Big day, big dance floor, big love.</p>
<p>Pull out something fancy and join us — and yes, bring <strong>{{plus_one_name}}</strong>.</p>`,
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined and graceful.",
    title: "An invitation",
    content: `<h2>To {{guest_name}}</h2>
<p>The pleasure of your company is requested at the marriage celebration of the happy couple.</p>
<p>Black tie optional. Joy mandatory.</p>`,
  },
];

export const DEFAULT_INVITATION_TEMPLATE_ID = "classic";

export function getTemplate(id: string | null | undefined): InvitationTemplate {
  return (
    INVITATION_TEMPLATES.find((t) => t.id === id) ?? INVITATION_TEMPLATES[0]
  );
}

export function renderInvitationHtml(
  html: string,
  guestName: string,
  plusOneName: string,
): string {
  return html
    .replace(/\{\{\s*guest_name\s*\}\}/gi, escapeHtml(guestName))
    .replace(/\{\{\s*plus_one_name\s*\}\}/gi, escapeHtml(plusOneName));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
