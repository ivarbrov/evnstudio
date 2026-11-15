# EVN Game QA: Fiskespillet 0.9.2
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit d38709eabc98f801f3fe2ed2e6b1ba40924b1fc3
Testkvittering: evn1 commit=d38709eabc98f801f3fe2ed2e6b1ba40924b1fc3 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert som oppdatering av publisert 0.6.2. Resultatet fra `kjor.mjs` var 73 OK, 0 FEIL, 0 VARSEL og 2 IKKE INNFØRT (statistikk og ui). Mot origin/main er det bare `spill/fiskespillet/index.html`, ENDRINGSLOGG og QA-rapporter som er ulike. Startbildene og eventyrspill er like som på main. Siden 798e83e er det i spillet bare endret én linje (`helt-robot.glb` er byttet med `helt-robot-v2.glb`). Alle kontrollene under er kjørt på nytt mot d38709e.
Testet:
- **Server:** egen `python3 -m http.server` på 127.0.0.1:8841. Roten er `/tmp/qa-fisk-d38/root`, laget med `git archive HEAD`. Til sammenligning lå 0.6.2 (origin/main), 0.7.0 (3fbb9bb) og 798e83e i egne mapper.
- **Nettleser:** headless Chrome med Playwright og SwiftShader. Bildefrekvensen er lav, så spilltiden går saktere enn ekte tid.
- **1280×800:** ekte tastetrykk (W, S, G, E, T, Shift, P, M, L, Esc, Tab, Enter, mellomrom) og ekte musklikk.
- **Mobil:** 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`touchscreen.tap`, styrespak med CDP).
- **Robot v2:** i testnettleseren var det en målekrok på `AnimationMixer.clipAction`. Den leste av hvilket klipp som var aktivt (vekt over 0,5).
- **Hjelpemidler:** `__spill` ble brukt til å flytte båten eller roboten. Torsdag-eventet ble tvunget.
- **Opprydding:** localStorage ble tømt før og etter hver økt. Serverne er stoppet (porten svarer 000), og `git status` er tom.
- **Skript og skjermbilder:** `/tmp/qa-fisk-d38/skript/` og `/tmp/qa-fisk-d38/bilder/`.

## Oppfylte krav
- **F1:**
  - Start med ekte klikk.
  - W kjører båten 7,9 enheter på 5 s.
  - Vanlig fisk («Liten rosa torsk med striper») og stort dyr («Liten rød hai med striper»).
  - Kraken vunnet: premien er 10 000, og fangstkortet vises. Kraken står i akvariet på (−3; 5,8; 40), også etter omlasting.
  - P pauser, og roboten flytter seg 0,00 på land i pause. Esc fortsetter.
  - «Ja, avslutt» går til forsiden, og lagringen beholdes.
  - Spillet hang ikke i noen kjøring.
- **F1, robot v2:**
  - `ecoins/helt-robot-v2.glb` gir HTTP 200. `helt-robot.glb` hentes ikke.
  - Det finnes to SkinnedMesh, så reservefiguren er byttet ut.
  - 14 klipp med de samme navnene som i v1, og noder og materialer har de samme navnene.
  - Aktive klipp: Idle i båten, Walking ved gange med W og Idle når roboten står stille. ThumbsUp ved fangst. Punch og deretter Dance ved Kraken.
  - Skjermbildet viser robot v2 på brygga (`robot-gaar-1280.png`).
- **F2:**
  - Det lagres automatisk, og lagringen overlever omlasting.
  - Nullstilling: Esc og Nei beholder lagringen, og Ja sletter den. En ny spiller ser ikke «Start helt på nytt».
- **F3:**
  - Lagring fra **0.6.2** (publisert) og 0.7.0 leses i 0.9.2 uten tap og uten `-kopi`.
  - En 0.9.2-lagring leses feilfritt i 0.6.2 og 0.7.0, så det går an å rulle tilbake.
  - Ugyldig JSON, `v:2`, `[]`, `null` og søppelverdier gir startverdier og ingen sidefeil. `-kopi` lages for ugyldig JSON, `v:2` og `[]`.
  - Omlasting mens roboten står på land gir start i båten.
- **U1:** Start er synlig uten rulling i alle fire mobilstørrelsene. Etter et sveip treffer `elementFromPoint` `startBtn` (740×360: 233–303, 320×568: 410–478, 568×320: 234–302). «Versjon 0.9.2» står på kortet, og det er ingen sideveis rulling.
- **U2:**
  - Ny spiller får bare startbeskjeden de første 10 s, og en spiller med lagring får bare «Velkommen tilbake, kaptein! ⚓».
  - G på land og G om bord gir «⛵ Du er om bord igjen.».
  - Havnehjelpen er stor ved innkjøring 1–3 og viser «⚓ Havna» ved innkjøring 4–5. Det gjelder både ny spiller og spiller med lagring.
- **U3:** Tekstene er korte og vennlige, og Kraken-kampen er uten straff.
- **T1 (emulert):** Alle knapper er minst 44×44 px, med minst 8 px mellomrom. Gjelder fire størrelser i tilstandene havna, land, butikk, sjø, event og kamp.
- **T2:**
  - Tab går gjennom 📖, 🔊, kart, pause, Avslutt, handling og 🚶.
  - Pausekortet holder fokus, og butikkortet fra land holder fokus (25 av 25 Tab).
  - Avslutt-dialogen gir fokus til `evnBli`.
- **T3:** Viewport sperrer ikke zoom (`kjor.mjs`).
- **K1:** Ingen sidefeil, konsollfeil, HTTP-svar på 400 eller høyere eller eksterne forespørsler i noen kjøring.
- **K2:** En kastet feil viser feilkortet. Testet som på evnstudio.no med avskjærte forespørsler.
- **K3:**
  - «0.9.2» står i tittel, startkort og `VERSJON`.
  - ENDRINGSLOGG-raden sier nå «oppdatering fra 0.6.2» og nevner `helt-robot-v2.glb`. Det stemmer med koden og det som er testet.
- **S1:** CSP er OK (`kjor.mjs`), og det er ingen nye domener.
- **S2, S3:** Lokalt er det ingen eksterne forespørsler. `document.cookie` er tom, og det finnes ingen fritekst og ingen kjøp med ekte penger.
- **S4:** Personvernsiden er uendret mot main. Observerte nøkler: `evn-fiskespillet-v1`, `evn-fiskespillet-lyd` og `evn-spilletid-fiskespillet`.
- **ST3, ST5, ST6:** Lokalt sendes ingenting (`goatcounter` er udefinert). Som på evnstudio.no ble bare én sidevisning sendt. Ingen informasjonskapsler og ingen ID-er.
- **B1:** L slår av lyden, og 🔇 huskes etter ny lasting.
- **B2:** Kartet åpnes med M, også på land.
- **B4:** Kraken-kampen er snill.
- **Regresjon på land:**
  - G gjør ingenting langt fra kaia, og T virker ikke på land.
  - 🛒 og 🐠 åpner riktig fane, og ⛵ går om bord.
  - Styrespaken flytter roboten 9,6–12,6 enheter på 6 s.
  - Fiskebåten kommer etter salg.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST1, ST2, ST4, ST7 og ST8, kjent forbehold (uendret):**
  - `statistikk.js` er lik main.
  - Som på evnstudio.no kom bare sidevisningen, uten `start-`, `versjon-` eller `spilletid-`, verken etter 70 s spill eller etter en feil.
  - Spillet har `data-spill="fiskespillet"` og sender `evn-start`.
  - Forbeholdet er det samme som for 0.6.x, og ENDRINGSLOGG sier at Ivar har godkjent det.

## Anbefalte forbedringer
- **Løpeanimasjonen brukes aldri (verifisert, ikke et brudd på noe krav):**
  - Med Shift og W er farten 10,7–11, men det aktive klippet er Walking. Det gjelder både fra stillstand og fra gange.
  - Årsak: `robotGaa()` (linje 2323–2327) bytter bare klipp når `land.gaar` skifter mellom true og false. Klippet velges mens farten er under 9.
  - Gjenskapes slik: gå i land med G, og hold Shift og W i 2,5 s. Da er Walking aktiv.
  - Koden er uendret siden 0.9.0 (b3cbfbe), så feilen kommer ikke fra robot v2. Oppdraget nevner «løpe», så Even bør vite det.
- **Kjent fra før, uendret:**
  - Meldinger ligger over knapper (`pointer-events:none`): 568×320 dekker 655 px² av 🚶, 320×568 dekker 672 px² av ⚓, og under eventet dekkes 📖 (595 px²).
  - Tilbake og versjon ligger under kanten på lave skjermer.
  - Turbo vises bare med farge.
  - Roboten går gjennom lyktestolper, tønner og fiskekasser.
  - Kartet viser båten på land.
  - `stang:99` gir Superstang.
- **Standarden:** Fiskespillet mangler fortsatt i oversikten per spill (kjent). Jeg har brukt B1–B4.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og SwiftShader sier ingenting om ekte mobil. v2-filen er 11 kB større enn v1 (475 460 mot 463 988 byte), og det er ikke målt i bildefrekvens.
- **Y2:** At blur pauser spillet er testet. 60 og 120 Hz er ikke målt.
- **T1, T3 og B1 (E):** Ekte berøring, klypezoom og ekte lyd er ikke testet.
- **B3 (E):** Tapt WebGL-kontekst og svake enheter er ikke kjørt (bare kodelest).
- **T4:** Kontrasten er ikke målt.
- **U2, U3 og B4 (V):** Even må vurdere om robot v2 på land og i feiringene, havnehjelpen og landmodus er forståelige og morsomme.
- **ST1, ST2, ST4, ST7 og ST8:** `test/statistikk/` finnes ikke (IKKE INNFØRT). Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging sjekke.
- **Tilbehør fra E-coins på robot v2 i Fiskespillet:** bare kodelest. Nodenavnene er like som i v1, og `ecoins`-suiten er OK.
- **Ikke fullført:**
  - De tilfeldige landvandringene (kollisjon) stoppet ved tidsgrensen. Landkoden er uendret siden 0b78d98.
  - Torsdag-eventet med ekte klokke (det ble tvunget i stedet).
  - Lange økter (15–60 min).
- **Testartefakt:** I én kjøring med fire nettlesere i parallell flyttet W båten 0 enheter etter at pausen ble åpnet og lukket. Dette ble ikke gjenskapt i 3 av 3 enkeltkjøringer, verken på d38709e eller på 798e83e. Jeg regner det ikke som et funn.
- **B5, B6 og B7:** Gjelder ikke spillet.
- **UI1–UI10 (UI8a–c inkludert):** Godkjent hovedløsning, men ikke tatt i bruk for spillet. Ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – Flettingen fra main virker: robot v2 lastes, og Idle, Walking, ThumbsUp, Punch og Dance spilles. F1–F3 virker, også med lagring fra publisert 0.6.2 begge veier, og jeg fant ingen kritiske feil. Ytelse på ekte mobil (Y1), ekte berøring og statistikkforbeholdet fra 0.6.x er fortsatt ikke testet. Løpeanimasjonen vises ikke, og den feilen er eldre enn denne versjonen.
