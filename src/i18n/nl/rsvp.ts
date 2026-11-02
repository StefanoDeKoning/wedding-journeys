import { DEFAULT_INVITATION_TEMPLATE } from "@/wedding/invitationTemplate";

/** Guest invitation page, RSVP form and dietary options. */
const nl = {
  // Invitation page
  "Invitation — {slug}": "Uitnodiging — {slug}",
  "Your private digital wedding invitation.": "Jouw persoonlijke, digitale trouwuitnodiging.",
  Friend: "Lieve gast",
  "The happy couple": "Het gelukkige bruidspaar",
  "together with the people they love": "samen met de mensen van wie ze houden",
  "save these moments": "bewaar deze momenten",
  "the details": "de details",
  "When and where to find us": "Wanneer en waar je ons vindt",
  When: "Wanneer",
  "Date to be announced": "Datum volgt nog",
  "Ceremony at {time}": "Ceremonie om {time}",
  "Reception from {time}": "Receptie vanaf {time}",
  "You're invited to the evening celebration.": "Je bent uitgenodigd voor het avondfeest.",
  "until the evening celebration begins": "tot het avondfeest begint",
  "until the celebration begins": "tot het feest begint",
  "Add to calendar": "Zet in je agenda",
  "Wedding of {couple}": "Bruiloft van {couple}",
  Where: "Waar",
  "Venue to be announced": "Locatie volgt nog",
  "Open in Google Maps →": "Openen in Google Maps →",
  "Questions?": "Vragen?",
  "Our ceremony master": "Onze ceremoniemeester",
  "Ceremony master": "Ceremoniemeester",
  "— happy to help with anything about the day.": "— helpt je graag met alles rond de dag.",
  "Reply with your wishes": "Geef je antwoord door",
  "See the day": "Bekijk de dag",
  "Song requests": "Verzoeknummers",

  // Default letter text, shown when the couple has not written their own
  [DEFAULT_INVITATION_TEMPLATE]: `Lieve {FirstName} {LastName},

Je bent van harte uitgenodigd voor het meest magische feest van het jaar.

De locatie en alle details vind je op de achterkant van deze brief.

Stuur deze brief terug met eventuele dieetwensen of bijzondere verzoeken.

Liefs,
Het gelukkige bruidspaar.`,

  // RSVP form
  "Day only": "Alleen overdag",
  "Evening only": "Alleen 's avonds",
  Both: "Allebei",
  "Joyfully yes": "Graag, ja!",
  "Sadly no": "Helaas, nee",
  "Awaiting reply": "Nog geen antwoord",
  "Day & evening": "Dag & avond",
  "RSVP is closed.": "Reageren is niet meer mogelijk.",
  "Please choose Yes or No.": "Kies alsjeblieft ja of nee.",
  "Please choose which part of the day you'll attend.": "Kies alsjeblieft bij welk deel van de dag je erbij bent.",
  "Thank you — we've noted your reply.": "Dank je wel — we hebben je antwoord genoteerd.",
  "Thank you, {name}!": "Dank je wel, {name}!",
  "You replied": "Je antwoordde",
  "Dietary: {list}": "Dieetwensen: {list}",
  "Last updated by an admin.": "Voor het laatst aangepast door een beheerder.",
  "Edit my reply": "Mijn antwoord wijzigen",
  "RSVP deadline has passed": "De RSVP-deadline is verstreken",
  "Replies are now closed. Please reach out to the couple directly.":
    "Reageren kan niet meer. Neem gerust rechtstreeks contact op met het bruidspaar.",
  "My answer": "Mijn antwoord",
  "Which part of the day?": "Welk deel van de dag?",
  "Which part of the day": "Welk deel van de dag",
  "Will you bring a guest?": "Neem je iemand mee?",
  "Will you bring a guest": "Neem je iemand mee",
  "Yes, +1": "Ja, +1",
  "No, just me": "Nee, alleen ik",
  "Name of your guest (optional)": "Naam van je introducé (optioneel)",
  "Dietary restrictions": "Dieetwensen en allergieën",
  "Other (e.g. specific allergies)": "Anders (bijv. specifieke allergieën)",
  "Additional comments": "Opmerkingen",
  "A song you'd love to hear, an arrival note, anything…":
    "Een nummer dat je graag wilt horen, iets over je aankomst, wat dan ook…",
  "Sending…": "Versturen…",
  "Update my reply": "Mijn antwoord bijwerken",
  "Send my reply": "Mijn antwoord versturen",
  "Will you join us?": "Ben je erbij?",
  "Please respond by {date}.": "Laat het ons uiterlijk {date} weten.",
  "We can't wait to hear from you.": "We kijken uit naar je antwoord.",
  "Sign in with your invitation code to reply.": "Log in met je uitnodigingscode om te reageren.",
  Close: "Sluiten",

  // Dietary options
  Vegetarian: "Vegetarisch",
  Vegan: "Veganistisch",
  "Gluten-free": "Glutenvrij",
  "Lactose-free": "Lactosevrij",
  Halal: "Halal",
  Kosher: "Koosjer",
  "Nut allergy": "Notenallergie",
  "Fish allergy": "Visallergie",
} satisfies Record<string, string>;
export default nl;
