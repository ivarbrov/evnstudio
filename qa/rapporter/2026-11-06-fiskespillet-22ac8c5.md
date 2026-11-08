# EVN Game QA: Fiskespillet 0.9.2
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 22ac8c5116e0138aa1acf270a58c9d2dab84f904
Testkvittering: evn1 commit=22ac8c5116e0138aa1acf270a58c9d2dab84f904 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert som oppdatering av publisert 0.6.2.
- **Testsuiten:** `kjor.mjs` ga 73 OK, 0 FEIL, 0 VARSEL og 2 IKKE INNFØRT (statistikk og ui).
- **Siden d38709e:** `spill/fiskespillet/`, `statistikk.js`, `spill/felles`, personvern og `ecoins` er byte-like.
- **Mot origin/main:** bare `spill/fiskespillet/index.html`, ENDRINGSLOGG og QA-rapporter er ulike.
- **Mørkeskogen 2.0.6** (`spill/morkeskogen/*`) er byte-lik med origin/main. Den er kontrollert i sin egen QA-rapport (500fa5b) og er ikke testet på nytt her.
- **Publiseringssjekken** (`publiseringssjekk.mjs`) ga 2 FEIL, og begge gjelder bare at denne rapporten mangler for 22ac8c5. Den ga også VARSEL om at Fiskespillet mangler i standardens oversikt.
- **Kjøring:** alle kontrollene under er kjørt på nytt mot 22ac8c5.

Testet:
- **Server:** egen `python3 -m http.server` på 127.0.0.1:8851. Roten `/tmp/qa-fisk-22a/root` er laget med `git archive 22ac8c5`. 0.6.2 (origin/main) og 0.7.0 (3fbb9bb) lå i egne mapper.
- **Nettleser:** headless Chrome med Playwright og SwiftShader. Bildefrekvensen er lav.
- **1280×800:** ekte tastetrykk (W, S, G, E, T, Shift, P, M, L, Esc, Tab, Enter) og ekte musklikk.
- **Mobil:** 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`touchscreen.tap`, styrespak med CDP).
- **Hjelpemidler:** en målekrok på `AnimationMixer.clipAction` i testnettleseren. `__spill` ble brukt til å flytte båten eller roboten, og Torsdag-eventet ble tvunget.
- **Opprydding:**
  - Hver kjøring hadde en ny nettleserkontekst, og localStorage ble tømt.
  - Serveren er stoppet (porten svarer 000), og de headless Chrome-prosessene som var igjen, er avsluttet.
  - `git status` er tom.
- **Skript:** `/tmp/qa-fisk-22a/skript/`, med logger i `/tmp/qa-fisk-22a/*.txt`.

## Oppfylte krav
- **F1:**
  - Start med ekte klikk.
  - Vanlig fisk («Liten grå torsk») og stort dyr («Rød hai med striper») ble fanget.
  - Kraken vunnet: premien er 10 000, og fangstkortet vises. Kraken står i akvariet på (−3; 5,8; 40), også etter omlasting.
  - P pauser, og roboten flytter seg 0,00 på land i pause. Esc fortsetter.
  - «Ja, avslutt» går til forsiden, og lagringen beholdes.
  - Spillet hang ikke i noen kjøring der bare én nettleser kjørte.
- **F1, robot v2:**
  - `ecoins/helt-robot-v2.glb` gir HTTP 200. Det finnes to SkinnedMesh og 14 klipp.
  - Aktive klipp: Idle i båten og når roboten står stille, Walking ved gange med W, ThumbsUp ved fangst, og Punch og Dance ved Kraken.
- **F2:**
  - Automatisk lagring overlever omlasting (penger 55, last 2, fanget 2).
  - Nullstilling: Esc og Nei beholder lagringen, og Ja sletter den. En ny spiller ser ikke «Start helt på nytt».
- **F3:**
  - Lagring fra 0.6.2 (publisert) og 0.7.0 leses i 0.9.2 uten tap og uten `-kopi`. Bare feltene `funnet` og `rest` endres.
  - En 0.9.2-lagring leses feilfritt i 0.6.2 og 0.7.0, så det går an å rulle tilbake.
  - Ugyldig JSON, `v:2`, `[]`, `null` og søppelverdier gir startverdier, et synlig Start og 0 sidefeil. `-kopi` lages for de tre første.
  - Omlasting mens roboten står på land gir start i båten.
- **U1:**
  - Startkortet har mål, styring for PC og berøring, og «Versjon 0.9.2».
  - Start er synlig uten rulling i alle fire mobilstørrelsene, og det er ingen sideveis rulling.
  - Startkortet ruller med hjul og ved å dra med fingeren (scrollTop 55).
- **U2:**
  - Startbeskjeden står etter 1,5 s.
  - Havnehjelpen er stor ved innkjøring 1–3 og viser «⚓ Havna» etterpå.
  - På land står «🚶 Du er på land! …», og «⛵ Du er om bord igjen.» kommer etter E ved kaia.
  - Styringshjelpen finnes i pausekortet.
- **U3:** Tekstene er korte og vennlige, og Kraken-kampen er uten straff.
- **T1 (emulert):** Alle knapper er minst 44×44 px, med minst 8 px mellomrom. Gjelder fire størrelser i tilstandene havna, land, butikk, sjø, event og kamp.
- **T2:**
  - Tab går gjennom 📖, 🔊, kart, pause, Avslutt, handling og 🚶.
  - Pausekortet holder fokus, og butikkortet fra land holder fokus (25 av 25 Tab).
  - Avslutt-dialogen gir fokus til `evnBli`, og Esc lukker den.
- **T3:** Viewport sperrer ikke zoom (`kjor.mjs`). `prefers-reduced-motion` står 3 steder i koden, men er bare kodelest.
- **Y2 (delvis):** Blur pauser spillet.
- **K1:** Ingen sidefeil, konsollfeil, HTTP-svar på 400 eller høyere eller eksterne forespørsler (`LOGG []` i alle skriptene som ble fullført).
- **K2:** En kastet feil viser feilkortet. Testet som på evnstudio.no med avskjærte forespørsler.
- **K3:**
  - «0.9.2» står i tittel, startkort og `VERSJON`.
  - ENDRINGSLOGG-raden «Fiskespillet 0.9.2 publiseres (oppdatering fra 0.6.2)» stemmer med koden.
  - Ved flettingen er raden for Mørkeskogen 2.0.6 lagt til. Raden for 2.0.5 er som på main.
- **S1:** CSP er OK (`kjor.mjs`). Domenene er bare `gc.zgo.at` og `evnstudio.goatcounter.com`, altså ingen nye.
- **S2, S3:** `document.cookie` er tom. Ingen fritekst, konto eller kjøp med ekte penger.
- **S4:** Personvernsiden er uendret mot main. Observerte nøkler: `evn-fiskespillet-v1`, `evn-fiskespillet-lyd` og `evn-spilletid-fiskespillet`.
- **ST3, ST5, ST6:**
  - Lokalt sendes ingenting (0 eksterne forespørsler, og `goatcounter` er udefinert).
  - Som på evnstudio.no kom bare én sidevisning.
  - Ingen informasjonskapsler og ingen ID-er.
  - Koden har `data-spill="fiskespillet"` og sender `evn-start`.
- **B1:** L slår av lyden, og 🔇 huskes etter ny lasting.
- **B2:** Kartet åpnes med M, også på land.
- **B4:** Kraken-kampen er snill.
- **Regresjon på land:**
  - G gjør ingenting langt fra kaia, og T virker ikke på land.
  - 🛒 og 🐠 åpner riktig fane.
  - Styrespaken flytter roboten 7,2–9,5 enheter på 6 s.
  - Fiskebåten kommer etter salg (inn, laster og ut på 49 s) og kommer ikke uten salg.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST1, ST2, ST4, ST7 og ST8, kjent forbehold (uendret):**
  - `statistikk.js` er lik main.
  - Som på evnstudio.no kom bare sidevisningen, uten `start-`, `versjon-` eller `spilletid-`, verken etter 70 s spill eller etter en feil.
  - Forbeholdet er det samme som for 0.6.x, og ENDRINGSLOGG sier at Ivar har godkjent det.

## Anbefalte forbedringer
- **Løpeanimasjonen brukes aldri (kjent fra d38709e, uendret):** Med Shift og W er farten 10,7–11,0, men det aktive klippet er Walking, både fra stillstand og fra gange.
- **Kjent fra før, uendret:**
  - Meldinger ligger over knapper: 568×320 dekker 655 px² av 🚶, 320×568 dekker 672 px² av ⚓, og under eventet dekkes 📖 (595 px²).
  - Tilbake og versjon ligger under kanten på lave skjermer.
  - Turbo vises bare med farge.
  - Roboten går gjennom lyktestolper, tønner og fiskekasser.
  - Kartet viser båten på land.
  - `stang:99` gir Superstang.
- **Standarden:** Fiskespillet mangler fortsatt i oversikten per spill. Publiseringssjekken varsler om det. Jeg har brukt B1–B4.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og SwiftShader sier ingenting om ekte mobil.
- **Y2:**
  - 60 og 120 Hz er ikke målt.
  - Båten flyttet seg 3 enheter på 5 s med W, mot 7,9 i forrige kontroll i samme miljø. Det tyder på at farten avhenger av bildefrekvensen ved svært lav frekvens. Om det samme skjer på ekte maskinvare, er ikke avgjort.
- **T1, T3 og B1 (E):** Ekte berøring, klypezoom og ekte lyd er ikke testet. `prefers-reduced-motion` er bare kodelest.
- **T4:** Kontrasten er ikke målt.
- **B3 (E):** Tapt WebGL-kontekst og svake enheter er ikke kjørt (bare kodelest).
- **U2, U3 og B4 (V):** Even må vurdere om havnehjelpen, landmodus og robot v2 i feiringene er forståelige og morsomme.
- **ST1, ST2, ST4, ST7 og ST8:**
  - `test/statistikk/` finnes ikke (IKKE INNFØRT).
  - Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging sjekke.
- **Tilbehør fra E-coins på robot v2:** bare kodelest. `ecoins`-suiten er OK.
- **Ikke kjørt:**
  - Kollisjon ved tilfeldig landvandring.
  - Torsdag-eventet med ekte klokke (det ble tvunget i stedet).
  - Lange økter (15–60 min).
- **Mørkeskogen 2.0.6:** Filene er byte-like med origin/main og er ikke testet på nytt i denne kontrollen.
- **Testartefakter som ikke regnes som funn:**
  - Da pc.mjs kjørte samtidig med to andre nettlesere, flyttet W båten bare 1 enhet, og resten av flyten ble ugyldig. Kjørt alene gikk hele flyten gjennom, med `LOGG []`. Det samme mønsteret ble sett i forrige kontroll.
  - st.mjs krasjet med `ERR_FAILED` i steget for lokal kjøring, fordi skriptets egen ruting avbryter 127.0.0.1. Det steget ble i stedet kjørt med st2.mjs, uten feil.
- **B5, B6 og B7:** Gjelder ikke spillet.
- **UI1–UI10 (UI8a–c inkludert):** Godkjent hovedløsning, men ikke tatt i bruk for spillet. Ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – Spillet virker på 22ac8c5, og koden er byte-lik med den kontrollerte d38709e. Start, spilling, pause, avslutt og lagring virker, også med lagring fra publisert 0.6.2 begge veier, og jeg fant ingen kritiske feil. Ytelse på ekte mobil (Y1), ekte berøring og statistikkforbeholdet fra 0.6.x er fortsatt ikke testet.
