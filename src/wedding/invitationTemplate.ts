export const DEFAULT_INVITATION_TEMPLATE = `Dear {FirstName} {LastName},

You are warmly invited to the most magical celebration of the year.

The location and all details can be found on the reverse side of this letter.

Please return this letter with any dietary wishes or special requests.

With love,
The happy couple.`;

/**
 * Replace {FirstName} / {LastName} placeholders with the actual guest names.
 * Case-insensitive, tolerates extra spaces inside the braces.
 */
export function renderInvitationText(
  template: string | null | undefined,
  firstName: string,
  lastName: string,
  /** Text used when the couple has not written their own (e.g. the translated default). */
  fallback: string = DEFAULT_INVITATION_TEMPLATE,
): string {
  const text = template && template.trim().length > 0 ? template : fallback;
  return text
    .replace(/\{\s*FirstName\s*\}/gi, firstName)
    .replace(/\{\s*LastName\s*\}/gi, lastName);
}
