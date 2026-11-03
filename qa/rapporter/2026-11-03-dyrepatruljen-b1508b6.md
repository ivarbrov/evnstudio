# EVN Game QA: Dyrepatruljen 0.11.1
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, gjeldende versjon er 1.1, S2 etter 1.2a) (55d5794116fb74ae842b6d60fed4e7b160157472), commit b1508b64cbd1dbcc4ecf26aa8832bfcd27be4e88
Testkvittering: evn1 commit=b1508b64cbd1dbcc4ecf26aa8832bfcd27be4e88 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full. Oppdraget ber om full kontroll, og versjonen skal foreslås publisert. Selve endringen er liten: én linje spillogikk, versjonsnummer og en rad i endringsloggen.
Testet: Linux, `node test/kjor.mjs --base origin/main` med /usr/bin/google-chrome (85 OK, 0 FEIL, 0 VARSEL, 1 KJENT, gjelder Fossil Zoo T3). Ellers Playwright Chromium med SwiftShader og reducedMotion `reduce`. Repoet ble servert via rute for https://evnstudio.no/**, og gc.zgo.at var erstattet med en stub som registrerer `goatcounter.count`. Til sammenligning ble origin/main (0.11.0) servert fra en kopi i /tmp/qa-hone/. Størrelser: 1280×800 og emulert mobil 375×812, 740×360, 812×375, 320×568 og 568×320. Jeg brukte ekte tastetrykk (W, P, Esc, M, B, L, Tab, Mellomrom) og Playwright-klikk og -tap. `__dyrespill` ble bare brukt til å plassere roboten og sette opp testtilstand. Bildefrekvensen var 2–3 per sekund i SwiftShader.

## Oppfylte krav
- **Endringen (fangst):** Jeg testet alle 15 verdener med ekte Mellomrom. 0.11.1 fanget og lagret 150 av 150 dyr. Samme test på 0.11.0 fanget 105, og alle som ikke ble fanget, sto over y = 1,6 i kuperte verdener, for eksempel sau1 i Gården (y = 1,86) og 8 av 10 i Jungelen. Feilen Even meldte er dermed gjenskapt på 0.11.0 og rettet i 0.11.1. Dyrenes y settes til `bakkeHoyde` hver ramme, så i verdener med terreng er forskjellen alltid 0. I flate verdener er resultatet det samme som før.
- **F1:** Start, verdensvalg, gåing (W), fangst, pause (P og Esc), Fortsett, dyreparken og Avslutt («Nei» fortsetter, «Ja» går til forsiden) virker. Spillet står stille i pause og mens «Vil du avslutte?» er åpen.
- **F2:** En fangst lagres med en gang og er der etter omlasting. Nullstilling spør først, Esc avbryter, og «Ja» sletter bare `evn-dyrespillet-v1`. Spilletid og lydvalg beholdes.
- **U1:** Startkortet har merke, mål, styring, Start, «Tilbake til EVN Studio» og «Versjon 0.11.1».
- **U2 (Q-delen):** Styringen står på startkortet og under «Slik styrer du» i pausen. HUD viser hvor mange dyr som er reddet.
- **U3 (Q-delen):** Teksten er enkel norsk. Lava sender roboten tilbake med «Au! Lava er varmt!», uten tap av fremgang.
- **T1:** Alle trykkflater på startkortet og i HUD er minst 44×44 i alle seks størrelser. HUD-knappene er 48, styrespaken 130, Håv 92 og Snik 66.
- **T2:** Tab og Shift+Tab blir værende i pausen, kartet, «Vil du avslutte?» og dyreboka. Det kjente funnet om at Tab går ut av pausekortet er **rettet i dette spillet**. Spillingen fungerer med tastatur.
- **T3:** Zoom er ikke sperret (statisk test). Start pulserer ikke ved `prefers-reduced-motion` (animasjon `none`).
- **T4:** Utvalgte tekstfarger har kontrast fra 4,72 til 12,9. Låste og ferdige verdener vises med ikon og tekst, ikke bare farge. Jeg beregnet kontrasten fra CSS-fargene, ikke målt på skjermen.
- **K1:** Røyktesten fant 0 konsollfeil, 0 manglende filer og 0 CSP-brudd. Ingen sidefeil under testen av alle 150 dyr.
- **K3:** Versjonen er 0.11.1 både på startkortet og i `VERSJON`, og endringsloggen har en ny rad. Det loggen sier, stemmer med diffen og med testene.
- **S1:** CSP-testene er OK, og ingen forespørsler gikk til andre domener.
- **S2:** Ingen konto, chat, kjøp med ekte penger eller reklame.
- **S3:** Spillet har ikke fritekst (0 felt for skriving).
- **S4:** Personvernsiden beskriver lokal lagring og grov spilletid («kan også telle pauser»). Det stemmer med det spillet faktisk gjør.
- **B1:** L og 🔊 slår lyden av, og valget huskes etter omlasting.
- **B2:** M åpner kartet med «Du er her», spillet står stille, og M lukker.
- **ST3:** På 127.0.0.1 ble det ikke sendt noen forespørsler til GoatCounter.
- **ST6:** Ingen informasjonskapsler, og ingen ID-er i koden.
- **F3 (delvis):** Lagring fra 0.11.0, laget av main-koden, leses riktig og bygges videre på. Lagring som ikke er gyldig JSON, `null`, `[]` og ukjent `v` krasjer ikke. Se avviket under for resten av F3.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F3, verifisert feil som finnes også i publisert 0.11.0:** Gyldig JSON med feil typer stopper spillet. `lastInn()` sjekker bare at `reddet` finnes. Gjenskapes ved å sette `evn-dyrespillet-v1` og trykke Start:
  - `{"v":1,"reddet":{"gata":null}}`: verdenskartet vises ikke (`null.length` i `antallReddet`), så spillet kan ikke startes.
  - `{"v":1,"reddet":{"gata":5}}`: Gata starter ikke (`reddet.includes is not a function`).
  - `{"v":1,"reddet":"abc"}`: håven gir TypeError, og fangsten lagres ikke.

  I de to første tilfellene er «Start helt på nytt» også skjult, så barnet kan ikke komme seg ut av det selv. Jeg har ikke regnet dette som kritisk, fordi spillet selv aldri skriver slike verdier og feilen er uendret fra 0.11.0.
- **K2, kjent funn, uendret:** Det finnes ingen global feilfanger. Jeg kastet en testfeil, og det kom ingen vennlig melding.
- **ST1, avvik:** `statistikk.js` lastes nederst i `&lt;body&gt;`, ikke i `&lt;head&gt;`, og spillet sender ikke `evn-start`. `start-dyrepatruljen` sendes ved klikk på Start, som bare åpner verdenskartet. Det er verifisert: tilstanden var `kart`.
- **ST2, verifisert feil:** Etter 66 s på verdenskartet, uten at noen verden var startet, ble `spilletid-dyrepatruljen-01min` sendt. Spillet bruker EVN-PAUSE v2 uten `EVNAktivTid`.
- **ST4, avvik:** `statistikk.js` sender aldri `feil-dyrepatruljen-*` (kodelest).
- **ST5, avvik:** `versjon-dyrepatruljen-0.11.1` sendes ikke. Ingen hendelse ble sendt to ganger, og ingen inneholdt fritekst.
- **ST7, avvik:** Følger av ST1, ST2, ST4 og ST5.

ST-avvikene skyldes felles kode. `statistikk.js` er byte-lik med origin/main, og ST1–ST8 er ifølge `.claude/README.md` implementert på `feature/statistikk`, som ikke er slått sammen med main. Endringen i 0.11.1 har ikke laget dem, og de gjelder også publisert 0.11.0.

## Anbefalte forbedringer
- Kontroller typene i `lastInn()` (`reddet` er et objekt med lister), eller ta vare på en kopi og start tomt. Da blir F3-avviket borte og «Start helt på nytt» synlig igjen.
- I 320×568 overlapper Snik-knappen styrespaken med 16 px (beregnet fra posisjonene). Det kan gi feil trykk på smale telefoner.
- Liggende format (740×360, 812×375, 568×320) og 320×568: Start-knappen er under skjermkanten, og startkortet må rulles. Den kan nås, men vises ikke uten rulling.
- Under 20 bilder/s går spillet saktere, fordi `dt` er begrenset til 0,05. Det ble målt 0,55 m/s mot 5,5 m/s ved 2–3 bilder/s i SwiftShader. Det har betydning på svake telefoner.
- Oversikten «Hvilke krav gjelder for hvert spill» i standarden mangler Dyrepatruljen og Magiske egg. Jeg har brukt B1, B2 og B3 ut fra koden: lyd, stor verden med kart og 3D. B4–B7 gjelder ikke.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes verken på grenen eller på origin/main («ikke-innfort» i kvitteringen). ST-kravene er kontrollert med stub og kodelesing i stedet. Om hendelsene faktisk kommer fram i GoatCounter, må en voksen med innlogging sjekke. Milepælene 5–60 min er ikke testet.
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen kan ikke måles meningsfullt i SwiftShader.
- **Y2:** Pause ved skjult fane er bare testet med syntetisk `visibilitychange`. At farten er uavhengig av skjermfrekvens (60/120 Hz), er bare kodelest (`dt`-basert).
- **B3:** Meldingen og den deaktiverte Start-knappen uten WebGL er kjørt og virker. Lavere grafikk på mobil er bare kodelest, og tapt WebGL-kontekst håndteres ikke. Ekte enheter (E) er ikke testet.
- **T1, T3 og B1 (E):** Ekte berøring, knipezoom og lyd på iPhone og Android er ikke testet. Mobil er bare emulert.
- **U2 og U3 (V):** Om barn forstår spillet og synes det er morsomt, er ikke testet. Det må Even prøve, også at høna i Gården nå kan fanges.
- **T4:** Teksten over 3D-scenen (tips og beskjeder) er ikke målt.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk i spillet, så de er ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD. Rettingen virker (150 av 150 dyr kan fanges, 105 på 0.11.0), og F1 er testet uten kritiske feil. Statistikken følger ikke ST1–ST8 (felles kode, også i 0.11.0), F3 feiler ved lagring med feil typer, og Y1 og ekte mobil er ikke testet.

Arbeidstreet er rent, og HEAD er b1508b6. Testserveren til `kjor.mjs` lukket seg selv, og jeg startet ingen annen server. Testskript og resultater ligger i /tmp/qa-hone/.
