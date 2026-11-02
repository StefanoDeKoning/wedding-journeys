/**
 * Runtime messages shown through `tx()`: server function errors, Supabase
 * auth errors and zod validation messages. The English keys must match the
 * source strings exactly.
 */
const nl = {
  // zod validation messages (schemas keep English; shown via tx())
  "Enter a valid email": "Vul een geldig e-mailadres in",
  "At least 8 characters": "Minimaal 8 tekens",
  "At least 3 characters": "Minimaal 3 tekens",
  "Max 60 characters": "Maximaal 60 tekens",
  "Wedding URL is too short": "De bruiloft-URL is te kort",
  "Use lowercase letters, numbers and dashes": "Gebruik kleine letters, cijfers en streepjes",
  "Lowercase, numbers and dashes only": "Alleen kleine letters, cijfers en streepjes",
  "First name is required": "Vul je voornaam in",
  "Last name is required": "Vul je achternaam in",
  "Code is too short": "De code is te kort",
  "Codes use letters, numbers and dashes": "Een code bestaat uit letters, cijfers en streepjes",
  "Letters, numbers and dashes only": "Alleen letters, cijfers en streepjes",
  "Give your wedding a name": "Geef jullie bruiloft een naam",
  Required: "Verplicht",
  "Pick a date": "Kies een datum",
  "Must start with http(s)://": "Moet beginnen met http:// of https://",
  Invalid: "Ongeldig",
  "Invalid email": "Ongeldig e-mailadres",
  "Invalid url": "Ongeldige URL",

  // Server function errors
  "Could not check slug. Try again.": "De URL kon niet worden gecontroleerd. Probeer het opnieuw.",
  "Could not verify the URL. Try again.": "De URL kon niet worden gecontroleerd. Probeer het opnieuw.",
  "That URL was just taken. Pick another.": "Die URL is net bezet. Kies een andere.",
  "Could not verify your email. Try again.": "Je e-mailadres kon niet worden gecontroleerd. Probeer het opnieuw.",
  "An account with this email already exists. Sign in first, then create your wedding.":
    "Er bestaat al een account met dit e-mailadres. Log eerst in en maak daarna jullie bruiloft aan.",
  "Could not create your account.": "Je account kon niet worden aangemaakt.",
  "Could not create your wedding.": "Jullie bruiloft kon niet worden aangemaakt.",
  "Could not assign you as primary admin.": "Je kon niet als hoofdbeheerder worden ingesteld.",
  "Could not load wedding.": "De bruiloft kon niet worden geladen.",
  "Forbidden: platform_owner role required.": "Geen toegang: alleen voor de platformeigenaar.",
  "Only the primary admin can invite co-admins.": "Alleen de hoofdbeheerder kan mede-beheerders uitnodigen.",
  "Could not send invite.": "De uitnodiging kon niet worden verstuurd.",
  "Server is not configured for auth.": "De server is niet ingesteld om in te loggen.",
  "Lookup failed. Please try again.": "Opzoeken is mislukt. Probeer het opnieuw.",
  "We couldn't find that wedding.": "We konden deze bruiloft niet vinden.",
  "We couldn't match your name and invitation code for this wedding.":
    "We konden je naam en uitnodigingscode niet koppelen aan deze bruiloft.",
  "We couldn't match your invitation code for this wedding.":
    "We konden je uitnodigingscode niet koppelen aan deze bruiloft.",
  "Could not start a guest session.": "We konden je niet als gast aanmelden.",
  "Could not finalize guest session.": "Het aanmelden als gast kon niet worden afgerond.",
  "Could not refresh guest session.": "Je gastsessie kon niet worden vernieuwd.",
  "A platform owner already exists.": "Er is al een platformeigenaar.",

  // Common Supabase auth / network errors
  "Invalid login credentials": "Onjuist e-mailadres of wachtwoord.",
  "Email not confirmed": "Je e-mailadres is nog niet bevestigd.",
  "User already registered": "Er bestaat al een account met dit e-mailadres.",
  "A user with this email address has already been registered": "Er bestaat al een account met dit e-mailadres.",
  "Password should be at least 6 characters.": "Het wachtwoord moet minimaal 6 tekens lang zijn.",
  "Unable to validate email address: invalid format": "Dit e-mailadres is ongeldig.",
  "Email rate limit exceeded": "Te veel pogingen. Probeer het later nog eens.",
  "Request rate limit reached": "Te veel pogingen. Probeer het later nog eens.",
  "Failed to fetch": "Geen verbinding met de server. Controleer je internetverbinding.",
} satisfies Record<string, string>;
export default nl;
