/** Couple admin: settings, co-admins, storage and activity log. */
const nl = {
  // Settings
  "Wedding settings": "Instellingen van de bruiloft",
  "Manage your wedding configuration, admins, storage and activity history in one place.":
    "Beheer de instellingen, beheerders, opslag en activiteit van jullie bruiloft op één plek.",
  General: "Algemeen",
  // Kept short: four tabs share the width on mobile.
  Admins: "Team",
  Activity: "Logboek",
  "Settings saved.": "Instellingen opgeslagen.",
  "Publish status": "Publicatiestatus",
  "Your wedding website is live for guests.": "Jullie trouwwebsite is online voor gasten.",
  "Only admins can see your wedding website. Publish it from the Overview page.":
    "Alleen beheerders kunnen jullie trouwwebsite zien. Publiceer hem via de pagina Overzicht.",
  Live: "Online",
  "Partner one": "Partner 1",
  "Partner two": "Partner 2",
  "The person guests can contact with questions. Shown on the invitation page.":
    "De persoon bij wie gasten met vragen terechtkunnen. Wordt getoond op de uitnodigingspagina.",
  "Role (optional)": "Rol (optioneel)",
  "Guest pages": "Gastpagina's",
  "Choose which pages your guests can see. Hidden pages disappear from the guest menu — you can still edit them as an admin.":
    "Kies welke pagina's jullie gasten kunnen zien. Verborgen pagina's verdwijnen uit het gastmenu — als beheerder kun je ze nog steeds bewerken.",
  "Show {page} to guests": "{page} tonen aan gasten",
  "The chapters of how you met.": "De hoofdstukken over hoe jullie elkaar ontmoetten.",
  "Photo sharing and uploads by guests.": "Foto's delen en uploaden door gasten.",
  "Song suggestions from your guests.": "Muzieksuggesties van jullie gasten.",
  "Written messages and wishes.": "Geschreven berichten en wensen.",

  // Co-admins
  "Could not load admins.": "De beheerders konden niet worden geladen.",
  "Could not invite.": "Uitnodigen is niet gelukt.",
  "Invite email sent. They'll get admin access after accepting.":
    "Uitnodiging verstuurd. Na het accepteren krijgt deze persoon toegang als beheerder.",
  "Co-admin added.": "Mede-beheerder toegevoegd.",
  "this co-admin": "deze mede-beheerder",
  "Could not remove.": "Verwijderen is niet gelukt.",
  "Co-admins": "Mede-beheerders",
  "Co-admins can manage guests and RSVPs, but can't add or remove other admins.":
    "Mede-beheerders kunnen gasten en RSVP's beheren, maar geen andere beheerders toevoegen of verwijderen.",
  "Invite by email": "Uitnodigen via e-mail",
  "friend@example.com": "vriend@voorbeeld.nl",
  Invite: "Uitnodigen",
  "Existing accounts get access immediately. New ones receive an invite email.":
    "Bestaande accounts krijgen meteen toegang. Nieuwe accounts ontvangen een uitnodiging per e-mail.",
  "Primary admin": "Hoofdbeheerder",
  "Co-admin": "Mede-beheerder",

  // Storage
  "Storage used": "Gebruikte opslag",
  "Storage limit": "Opslaglimiet",
  "Files uploaded": "Geüploade bestanden",
  "Storage usage": "Opslaggebruik",
  "of {limit}": "van {limit}",
  "{pct}% full": "{pct}% vol",
  "You're close to your storage limit. Consider hiding or deleting older photos.":
    "Jullie opslag is bijna vol. Overweeg oudere foto's te verbergen of te verwijderen.",
  "By uploader": "Per uploader",
  "No photos uploaded yet.": "Er zijn nog geen foto's geüpload.",
  "1 photo": "1 foto",
  "{count} photos": "{count} foto's",

  // Activity log
  "Recent activity": "Recente activiteit",
  "Showing the latest {count} admin actions across this wedding.":
    "De laatste {count} acties van beheerders voor deze bruiloft.",
  "Search by user, action or detail…": "Zoek op gebruiker, actie of detail…",
  "No activity matches your search.": "Geen activiteit gevonden voor deze zoekopdracht.",
  User: "Gebruiker",
  Action: "Actie",
  Detail: "Detail",
  Someone: "Iemand",
  "Page {page} of {pages}": "Pagina {page} van {pages}",
  Previous: "Vorige",
  Next: "Volgende",
  "by {name}": "door {name}",

  // Activity descriptions (from describeAction in src/wedding/audit.ts)
  "added a guest": "heeft een gast toegevoegd",
  "edited a guest": "heeft een gast bewerkt",
  "removed a guest": "heeft een gast verwijderd",
  "assigned a guest to a group": "heeft een gast in een groep ingedeeld",
  "created a group": "heeft een groep aangemaakt",
  "renamed a group": "heeft een groep hernoemd",
  "removed a group": "heeft een groep verwijderd",
  "updated an RSVP": "heeft een RSVP bijgewerkt",
  "added a timeline event": "heeft een onderdeel aan de tijdlijn toegevoegd",
  "edited a timeline event": "heeft een onderdeel van de tijdlijn bewerkt",
  "removed a timeline event": "heeft een onderdeel van de tijdlijn verwijderd",
  "created a table": "heeft een tafel aangemaakt",
  "edited a table": "heeft een tafel bewerkt",
  "removed a table": "heeft een tafel verwijderd",
  "seated a guest": "heeft een gast een plek gegeven",
  "unseated a guest": "heeft een gast van een tafel gehaald",
  "approved a photo": "heeft een foto goedgekeurd",
  "hid a photo": "heeft een foto verborgen",
  "deleted a photo": "heeft een foto verwijderd",
  "updated wedding settings": "heeft de instellingen van de bruiloft bijgewerkt",
  "added a story chapter": "heeft een hoofdstuk aan het verhaal toegevoegd",
  "edited a story chapter": "heeft een hoofdstuk van het verhaal bewerkt",
  "removed a story chapter": "heeft een hoofdstuk van het verhaal verwijderd",
  "hid a guestbook message": "heeft een bericht in het gastenboek verborgen",
  "unhid a guestbook message": "heeft een bericht in het gastenboek weer zichtbaar gemaakt",
  "removed a guestbook message": "heeft een bericht uit het gastenboek verwijderd",
  "removed a song request": "heeft een verzoeknummer verwijderd",
  "invited a co-admin": "heeft een mede-beheerder uitgenodigd",
  "removed a co-admin": "heeft een mede-beheerder verwijderd",
  "added a gift": "heeft een cadeau toegevoegd",
  "edited a gift": "heeft een cadeau bewerkt",
  "removed a gift": "heeft een cadeau verwijderd",
} satisfies Record<string, string>;
export default nl;
