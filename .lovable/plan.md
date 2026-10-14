# Visuele upgrade gastensite Stefano & Fleur

Alleen uiterlijk. Geen wijzigingen aan functies, routes, data, teksten, admin of backend.

## Stijl
- Palet: crème achtergrond met zachte gradiënt, zacht roze, saliegroen, goud accent, koraalrood voor de "&" en kleine accenten.
- Lettertypes: Great Vibes (script accenten), Playfair Display (titels), een goed leesbare sans-serif voor lopende tekst (Lora vervangen door bv. Nunito Sans / Karla).
- Centrale tokens voor kleuren, afrondingen, zachte schaduwen en spacing (uitbreiden van bestaande thema).

## Decoratie
- Nieuwe transparante waterverf-boeketten (rozen, pioenen, eucalyptus) in de hoeken die half over de schermrand vallen; op mobiel kleiner maar zichtbaar. Nooit over tekst.
- Subtiele goud/roze sparkles en confetti-stipjes, zachte zweef-animatie op bloemen.
- Dunne sierlijke scheidingslijn tussen secties.

## Uitnodigingspagina (hero)
- Namen groot gecentreerd, "&" in koraalrood, scriptregel erboven, datum + locatie met icoontjes eronder.
- Envelop dichter onder de namen; bestaande openanimatie (zegel breekt, flap opent, brief schuift eruit) verfijnen, werkt met touch en toetsenbord, plus reduced-motion variant.
- Wishlist: gelijke afgeronde kaarten met foto, zachte schaduw en hover-lift; op mobiel netjes gestapeld/scrollend.
- Wanneer/Waar/Contact kaarten: warmere kaartstijl, minder lege ruimte.

## Overige pagina's
- Story, Programma, Galerij, Playlist, Gastenboek krijgen dezelfde kopstijl (script boven serif), kaarten, scheidingslijnen en fade-in bij scrollen.
- Header dun en luchtig: naam links in script, Admin rechts.

## Mobiel en snelheid
- Ontworpen vanaf ~390px, daarna tablet/desktop.
- Afbeeldingen geoptimaliseerd en lazy geladen, alleen CSS-animaties.

## Toegankelijkheid
- Voldoende contrast, duidelijke focusstijl, decoratie verborgen voor schermlezers, alt-teksten.

## Technisch
- Tokens in `src/styles.css` en `romanticGarden` thema; decor via `PageCanvas` / `Illustrations.tsx`.
- Nieuwe hoekboeketten gegenereerd als transparante PNG en als asset opgeslagen.
- Componenten in `src/design-system/components.tsx` (Hero, SectionHeader, kaarten, Divider) bijgewerkt zodat alle pagina's automatisch meekomen.
- `EnvelopeLetter`, `WishlistSection`, `WeddingShell` header: alleen styling/animatie.
- Controle met screenshots op 390px en desktop.
