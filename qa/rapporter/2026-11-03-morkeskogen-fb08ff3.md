# EVN Game QA: Mørkeskogen 2.0.0
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1) (dad89dd22b82a893b3108c031a457e7dea4ba7ba), commit fb08ff345c9aa52e9439fce577246db41e7d1f78
Testkvittering: evn1 commit=fb08ff345c9aa52e9439fce577246db41e7d1f78 tester=bb26a7012030 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort
Nivå: full – versjonen skal foreslås publisert (ny 3D-motor, HUD og meny). Dette er ny kontroll etter at main (PR #10) ble slått sammen inn i grenen.
Testet: Sky-container uten GPU, Google Chrome via CDP og Playwright med SwiftShader.

**Hva som er kontrollert hvor:**
- **Egen kontroll på fb08ff3:**
  - Merge-commiten har foreldrene 4efcd49 og de3e446.
  - `git diff 5f82465 fb08ff3 -- spill/morkeskogen` er tom, så spillfilene er byte-like med 5f82465 og 0b02ed5.
  - Endret mot 5f82465: `personvern/index.html`, `sikkerhet/index.html`, `index.html` (forsiden), fire kortbilder, `ENDRINGSLOGG.md` og `qa/rapporter/2026-11-03-morkeskogen-5f82465.md`.
  - `.claude/`, `test/` og `statistikk.js` er uendret, og standardhashen er den samme.
  - I ENDRINGSLOGG.md står Mørkeskogen 2.0.0 øverst, og raden for forsiden (PR #10) står under.
  - Den lette statiske suiten (`--suiter statisk`) ga 24 ok, 1 kjent og EXIT 0, med kvitteringen `evn1 commit=fb08ff3… statisk=ok royk=ikke-kjort statistikk=ikke-kjort ui=ikke-kjort`.
- **Testkvitteringen over (lånt):** Den er fra koordinatorens kjøring av hele `test/kjor.mjs` på fb08ff3 (`/tmp/kjor2.log`: 64 ok, 0 feil, 1 kjent, 2 ikke innført, ingen Mørkeskogen-linjer med annet enn OK). Jeg har lest loggen, men ikke kjørt hele suiten på fb08ff3. Min egen fulle kjøring på 5f82465 ga identisk resultat, og spillfilene er byte-like.
- **Tunge nettlesertester er ikke kjørt på nytt**, fordi spillfilene er byte-like:
  - Egne spilltester ble kjørt på **0b02ed5**: PC 1280×800 med ekte taster, mobil 375×812 og 740×360, ødelagt lagring og uten WebGL. De er merket «egen, 0b02ed5».
  - Egen full `test/kjor.mjs` ble kjørt på **5f82465** og er merket «egen kjøring».
- **Utviklerens resultater (lånt):** `/tmp/funk.log` (funksjonstest.js, BESTÅTT, 34 OK-linjer på PC og høykant 390×844) er kjørt mot `evnstudio/spill/morkeskogen-2/spill/`. Spillkoden der er byte-lik med committen. `index.html` skiller seg bare i stier og versjonstekst.

## Oppfylte krav
- **S1** – Oppfylt. Egen statisk suite på fb08ff3 og egen full kjøring på 5f82465: alle fire statiske S1-kontroller er OK. Eget søk i alle `.js` i spillmappa: ingen `eval(` eller `new Function(` og ingen nye domener (egen, 0b02ed5).
- **S4** – Oppfylt (egen kontroll på fb08ff3). Sikkerhetssiden linje 68 har fortsatt «three.js (r128, og r187 i Mørkeskogen, lagt i nettstedet selv)». Domenetabellen (evnstudio.no, gc.zgo.at, evnstudio.goatcounter.com) stemmer med CSP-en i spillet. PR #10 endret dato og «Kort fortalt» på sikkerhetssiden. Personvernsiden sier nå at fremgang lagres i localStorage og aldri sendes ut, at spilletiden er omtrentlig og kan telle pauser, og hva GoatCounter registrerer. Dette stemmer med det spillet gjør: `statistikk.js` teller fanesynlig tid også i pause (se ST2), og Mørkeskogen har ingen fritekst. Ingenting i PR #10 motsier Mørkeskogen 2.0.0.
- **T3** – Oppfylt. Zoom er ikke sperret (egen statisk suite på fb08ff3). Start-pulsen er av ved `prefers-reduced-motion` (egen, 0b02ed5).
- **K3** – Oppfylt. Egen kjøring på 5f82465 og lånt kjøring på fb08ff3: «Versjon 2.0.0» på startkortet. ENDRINGSLOGG.md på fb08ff3 har raden for 2.0.0 øverst (egen kontroll).
- **U1** – Oppfylt. Egen kjøring: versjonen vises. Egen, 0b02ed5: startkortet har EVN-merke, mål, styring, Start, «Tilbake til EVN Studio» og versjon, uten sideveis rulling i 1280×800 og 375×812.
- **K1** – Oppfylt for innlasting, start og pause. Egen kjøring: ingen 404-er, ingen ufangede feil og ingen CSP-brudd. Dette gjelder ikke tilfellet uten WebGL, se B3.
- **F3** – Oppfylt:
  - Egen, 0b02ed5: lagring fra 5.6.2 ble lastet uendret på PC og mobil, og ødelagte verdier i alle fem nøklene ga ingen krasj.
  - Lånt: utviklerens funksjonstest viser det samme.
- **B2** – Oppfylt. Egen, 0b02ed5: M og 🗺️ åpner kartet, tilstanden blir `pause`, og Esc og ✕ lukker det. Lånt: kartet åpnes og lukkes.
- **S2** – Oppfylt (egen): ingen konto, kjøp eller reklame, og ingen forespørsler ut fra siden.
- **S3** – Oppfylt (egen): spillet har ingen fritekst.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle funnene under er egne og gjelder uendrede spillfiler. De står også i rapporten for 0b02ed5.
- **T2 – Verifisert feil (kjent funn i standarden, ikke rettet).** Tab går ut av pausekortet etter «Avslutt»: neste fokus er `BODY`, ❓, hurtiglinja og 🎒. Gjenskapes slik: start spillet, trykk P og trykk Tab fire ganger.
- **B3 – Verifisert feil, lik 5.6.2 etter kodelesing.** Uten WebGL kommer det en ufanget feil («Error creating WebGL context»). `#no3d` vises ikke, og etter Start blir skjermen svart med HUD og ingen forklaring. Gjenskapes ved å la `getContext('webgl*')` returnere `null`. Tapt WebGL-kontekst er fortsatt ikke håndtert (kjent mulig problem). Lavere grafikk på svake enheter virker: spillet trappet automatisk ned til «Lav» med melding.
- **K2 – Verifisert ved kodelesing (kjent funn i standarden, ikke rettet).** Det finnes ingen global feilfanger.
- **B1 – Verifisert ved kodelesing (kjent funn i standarden, ikke rettet).** Spillet har Web Audio-lyd, men ingen lydbryter.
- **ST1 – Avvik (systemisk, uendret fra 5.6.2).** `statistikk.js` lastes nederst på siden, ikke i `<head>`, og spillet sender ikke `evn-start`.
- **ST2 – Avvik (systemisk).** Spillet bruker EVN-PAUSE v2 og har ingen `window.EVNAktivTid`. `statistikk.js` teller tid når fanen er synlig, også i pause og meny.
- **ST5 – Avvik (systemisk).** Hendelsen `versjon-morkeskogen-2.0.0` sendes ikke.
- **ST7 og ST8 – Avvik (systemisk).** `test/statistikk/` finnes verken her eller på origin/main, og kvitteringen sier `statistikk=ikke-innfort`. Statistikken er ikke på godkjent nivå 1.1 for noen av spillene på main.

## Anbefalte forbedringer
- Pausekortet, kartet og dialogene har fortsatt `backdrop-filter: blur(3px)` (egen måling). Vurder å fjerne uskarpheten der også før iPhone-målingen (Y1).
- På mobil i høyformat 375×812 ligger hurtiglinja, hintet og våpenlinja midt på skjermen og dekker roboten (egen, skjermbilde). Ingen trykkflater var under 44 px, og ingen knapper overlappet. UI1–UI10 er ikke gjeldende, så dette er et forslag.
- Hjelpeteksten på mobil nevner ikke 🎒 og hopp. «Kart: trykk kartet» bør heller være «trykk 🗺️».
- Hurtiglinja reagerer bare på `pointerdown`, så 🎒 kan ikke brukes med tastatur. PC har I som alternativ.
- Kjør utviklerens funksjonstest mot den faktiske publiseringsmappa, eller la `test/kjor.mjs` få en Mørkeskogen-spesifikk suite. Da gjelder resultatet committen direkte.

## Kontroller som ikke kunne utføres
- **F1 (delvis):** Egen kjøring: start, pause og fortsett er OK. Egen, 0b02ed5: ryggsekk, kart, Avslutt-spørsmålet og «Nei, spill videre» virket. Lånt: faner, våpenvalg, Ny verden og lukkeknapp er BESTÅTT. Hele spilløkter (natt, død, «Prøv igjen», bygging, fiske) og gange er ikke spilt av noen i QA-grunnlaget. Status: oppfylt for det som er testet. At spillet står stille i pause og meny er ikke sikkert vist på PC, fordi SwiftShader nesten stopper bildeoppdateringen. På mobil sto tiden stille i pause og kart og gikk i spill.
- **F2 (delvis):**
  - Lånt: «Start helt på nytt» sletter lagringen, og valgt våpen skrives til `mork3d.helt`.
  - Kodelest: nullstilling spør i en egen dialog før den sletter.
  - Ikke testet: at fremgang overlever omlasting med de nye filene. Verken min test eller utviklerens laster siden på nytt og kontrollerer fremgangen etterpå.
- **U2, U3 og B4 (Q, V):** Tekst og tap er vurdert som greie ved kodelesing. Ulvebalansen og hattene i Kaktusbyen er uendret fra 5.6.2 (opplyst) og ikke kontrollert av meg. Krever Even.
- **T1 (E):** Egen: 375×812 og 740×360 er uten trykkflater under 44 px. Lånt: fanene er minst 44 px på 390×844. 320×568 og 568×320 er ikke målt. Ekte berøring er ikke testet.
- **T4:** Kontrast er ikke målt.
- **Y1 (E):** Ikke testet. Ingen referansemobil er valgt. Målingen fra iPhone (29 og 14 FPS) er fra før uskarpheten ble fjernet og er ikke gjentatt.
- **Y2:** Kun kodelest. `dt` er begrenset til 0,05, så spillet går saktere under 20 FPS. Fanebytte er ikke testet.
- **ST3 og ST6:** Kun kodelest. `statistikk.js` teller bare på evnstudio.no og bruker ingen informasjonskapsler eller ID-er. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **ST4:** Ikke testet, og testsiden mangler.
- **B1 (E):** Lyden er ikke hørt.
- **UI1–UI10:** Ikke gjeldende for spillet. UI8a–c er ikke målt med virkelig form.
- **Mobilkontrollene (V/E):** Even har ikke testet dem (opplyst), og de er ikke testet på faktisk enhet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. Sammenslåingen endrer ikke spillet, og S4 stemmer fortsatt. Hele testsuiten består på fb08ff3 (lånt kvittering) og på 5f82465 (egen kjøring). F2 etter omlasting, Y1 på iPhone, hele spilløkter og mobilkontroller på faktisk enhet er ikke verifisert.
