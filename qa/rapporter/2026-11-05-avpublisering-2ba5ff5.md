# EVN Game QA: Fossil Zoo og Magiske egg (avpublisering), forside og E-shop
Grunnlag: agent 2.2, standard 1.2 utkast med 1.2a og 1.2b (gjeldende 1.1 + S2 fra 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 2ba5ff5e191e815aa28a8204ec3b4102cef7ea83
Testkvittering: evn1 commit=2ba5ff5e191e815aa28a8204ec3b4102cef7ea83 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal publiseres. Den sletter to spill og endrer felles E-coins-kode, forsiden, personvernsiden og røyktesten. Dette er en ny kontroll etter retting. Alt under er kjørt på 2ba5ff5 og bygger ikke på resultater fra 189f5ae.
Testet: 2ba5ff5 med forelder 189f5ae. Arbeidstreet var rent før og etter. `node test/kjor.mjs --base origin/main` i Chrome uten skjerm ga 73 ok, 0 feil og 2 ikke innført. Lokal `python -m http.server` på 127.0.0.1 i nettleserpanelet (Chromium), med emulerte størrelser 1280×800, 375×812 og 812×375. Tastatur ble testet med ekte tastetrykk (Tab, Enter, Escape). E-shop-knappene ble trykket med klikk på element-ref, altså syntetisk. Testlagringen ble lagt inn med `javascript_tool`, og `localStorage` ble tømt etterpå.

## Oppfylte krav
- **S4 (tidligere verifisert feil, nå rettet):** Slettedialogen i E-shop viser den nye setningen «E-coins fra spill som ikke er på nettsiden lenger, kommer ikke tilbake.» Personvernsiden har samme setning (kontrollert i `innerText`). Begge tekstene stemmer nå med koden.
- **Slettedialogen virker fortsatt (F2, T2):** Fokus står først på «Nei», og Escape lukker uten å slette. Saldoen var fortsatt 200. Tab til «Ja, slett» og Enter tømte `evn-ecoins-v1`, og saldoen ble 0.
- **F2 og F3 (E-shop):** Lagringen hadde E-coins fra Fossil Zoo (115), Magiske egg (100), Dyrepatruljen (25) og ett kjøp (40). E-shop viste saldo 200, tjent 240 og brukt 40, og det stemmer. Ødelagt lagring dekkes av EC11 (ok).
- **E-shop-lista:** Lista viser bare Dyrepatruljen og Era Defenders. Ingen tekst på siden nevner Fossil Zoo, Magiske egg eller milepælene deres (kontrollert med `textContent`).
- **Ingen døde lenker eller bilder:** Ingen HTML-, JS- eller CSS-fil viser til de slettede mappene eller bildene. Unntakene er uvirksomme oppdagere i `statistikk.js` og lagringsnøkler i `test/ecoins`. Alle bilder på forsiden svarte 200 og ble lastet. De gamle spilladressene og bildene gir 404. Forsiden, E-shop, personvern, sikkerhet og de fire spillene gir 200.
- **F1 (Era Defenders, Mørkeskogen, Dyrepatruljen, Fiskespillet):** Røyktesten viser at alle fire starter, pauser og fortsetter. Klikkene er syntetiske.
- **Forsideoppsett og T1:** Kortene står 2 + 2 i 1280×800 og 812×375, og i én kolonne i 375×812. Ingen av størrelsene ruller sideveis. «Spill nå» er 61 px høy på PC og 52 px på mobil.
- **T2 (forside):** Tab-rekkefølgen er logo, meny, de fire kortene og de tre nyhetene, og fokus er synlig (`:focus-visible`). Enter på Dyrepatruljen-nyheten åpner spillet.
- **T3:** Viewport sperrer ikke zoom på forsiden, i E-shop eller i de fire spillene (statisk og testsuite).
- **K1:** Ingen konsollfeil og ingen 404 på forsiden, i E-shop, på personvernsiden eller i de fire spillene.
- **K3:** Raden i `ENDRINGSLOGG.md` er oppdatert med rettingen. Ingen spillversjon er endret.
- **S1:** CSP er uendret, og det er ingen nye domener. De fire spillene består CSP-kontrollene.
- **S2:** Det er ingen nye skjemaer, kontoer eller kjøp med ekte penger.
- **ST3:** `statistikk.js` er uendret og teller bare på evnstudio.no.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **Oversikten i standarden, verifisert:** «Hvilke krav gjelder for hvert spill» og linja med spillmapper viser fortsatt Fossil Zoo og Magiske egg. Standarden sier at oversikten skal oppdateres. Endringen krever godkjenning fra en voksen.
2. **Kjente funn i standarden for Fossil Zoo:** T1 (29 px knapper), T3 (`user-scalable=no`), B1 og B2/spilletid med kartet åpent gjelder ikke lenger, fordi spillet er fjernet. De er ikke rettet. Kjent T2 (Tab ut av pausekortet) og K2 (ingen global feilfanger) gjelder fortsatt for de andre spillene. Jeg har ikke testet dem på nytt.
3. **Publiseringssjekken, mulig problem:** Lokalt gir `node test/publiseringssjekk.mjs` FEIL fordi PR-en endrer `test/index.html`, og eieren må slå sammen med unntak. Den gir også FEIL fordi rapporten ikke er lagt inn ennå. Når rapporten er lagt inn, vil K3-kontrollen lete etter «Versjon x.y.z» i `spill/fossilspillet/index.html` og `spill/magiske-egg/index.html`. Filene er slettet, så sjekken vil trolig alltid gi FEIL for disse to spillene. Det avgjøres ved å kjøre sjekken etter at rapporten er lagt inn.

## Anbefalte forbedringer
- På personvernsiden står det fortsatt «Sist oppdatert 3.11.2026», selv om teksten er endret.
- Lommeboka viser «Tjent totalt 240», mens lista bare forklarer 25. En linje om E-coins fra spill som er fjernet, hindrer forvirring.
- `sizes="… 400px"` på spillkortene passer ikke til kort som er 568 px brede. Skjermer med høy oppløsning får derfor bildet på 800 px i stedet for 1200 px.
- CSS-en for `.t-grav`, `.t-laer` og `.t-egg` og oppdagerne `fossilspillet` og `magiske-egg` i `statistikk.js` brukes ikke lenger. `statistikk.js` er felles kode, så oppdagerne bør eventuelt ryddes i en egen endring.

## Kontroller som ikke kunne utføres
- **Fossil Zoo og Magiske egg:** F1, F2, F3, U1, U2, U3, T1, T2, T3, T4, Y1, Y2, K1, K2, K3, S1, S3, ST1, ST2, ST4, ST5, ST6, ST7, B1, B2, B3 og B5 er ikke testet. Kravene gjelder ikke lenger, fordi spillene er fjernet (404 er bekreftet).
- **ST8:** `test/statistikk/` finnes ikke (ikke innført). ST1, ST2, ST4, ST5, ST6 og ST7 er ikke testet på nytt for de fire andre spillene. `statistikk.js` og spillfilene deres er uendret. Om hendelsene kommer fram i GoatCounter, krever en voksen med innlogging.
- **De fire andre spillene:** F1 avslutt, F2, F3, U1, U2, U3, T4, S3 og K2 er ikke testet på nytt. Spillfilene er uendret.
- **Y1 og Y2:** ikke målt. Det er ikke valgt noen referansemobil, og nettleserpanelet var skjult.
- **E (enhet):** T1, T3 og forsideoppsettet på ekte iPhone og Android med berøring.
- **V:** Om barn skjønner at de to spillene er borte, og om teksten i slettedialogen er lett å forstå.
- **Testserver:** Jeg fikk ikke tilgang til å stoppe den lokale serveren på port 8766. Den må stoppes manuelt. Repoet er ikke endret.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil, og S4-feilen fra forrige kontroll er rettet. Statistikktesten, test på ekte enhet og oppdatering av oversikten i standarden gjenstår.
