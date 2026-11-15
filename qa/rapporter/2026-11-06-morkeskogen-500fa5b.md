# EVN Game QA: Mørkeskogen 2.0.6
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 500fa5b0ca4634d804b66f0d89e3ac57cea3ab23
Testkvittering: evn1 commit=500fa5b0ca4634d804b66f0d89e3ac57cea3ab23 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert (PR #57). Dette er en ny kontroll etter retting av mulig problem 1 i rapporten for 2d70378. Deltaet er kontrollert, og resten er overført fra 2d70378.
Testet: Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright med Chromium headless (SwiftShader, ingen GPU) i 800×500. Kroker er lagt inn ved å rute `spill.js`. Påstigning er gjort med `startRide()` via krok. Skriptet er `/tmp/qa206/tog500.js`.

Hva er kontrollert på hvilken commit:
- **500fa5b:**
  - **[nytt]** Deltaet `git diff 2d70378 500fa5b`: én linje i `spill/morkeskogen/spill.js`. Ved A er avstigningsstedet nå `trackPos(tr.s - CAR_COACH)`, ved vogna. Deltaet inneholder også én setning i `ENDRINGSLOGG.md` og QA-rapporten for 2d70378.
  - **[nytt]** `test/kjor.mjs` er kjørt alene av QA. 73 kontroller var OK, uten FEIL eller VARSEL, og kvitteringen er identisk med utviklerens.
  - **[nytt]** Fire togturer: A→B, B→A, og det samme fra den gamle tilstanden `s` = 150.
- **Overført fra 2d70378:** Sittestilling og tak (skjermbilder) og vogna synlig ved A. Det som var overført fra b69be0e og tidligere, er fortsatt overført.

## Oppfylte krav
- **[nytt] F1, mulig problem 1 fra 2d70378 er rettet:**
  - Etter avstigning ved A står spilleren 80 fra vognas midtpunkt (før 136, grense 140), og `target()` gir `board` med en gang.
  - Dette gjelder både etter vanlig tur og etter turen fra gammel tilstand.
- **[nytt] Avstigning på perrongen, ikke i sporet:**
  - **Ved A:** Spilleren står på (6243, 6016), 80 fra midtlinja på sporet. `platformH` gir perronggulv, ikke `-1e9`. Punktet ligger ca. 110 bak midten av perrongen. Perrongen er ±220 langs sporet og 42–110 til siden.
  - **Ved B:** Uendret. Spilleren står 80 fra sporet og på perrongen.
- **[nytt] F1, turer:** A→B og B→A fullføres. Det gjelder også fra den gamle tilstanden `s` = 150. Toget ender på 390 ved A og 2383 ved B. Spillet står i `play`, og det er ingen sidefeil.
- **[nytt] Animasjonen:** Under tur er bare `Sitting` aktiv, med vekt 1. 2,5 s etter hver avstigning er bare `Idle` aktiv, med vekt 1.
- **[nytt] K1:** Ingen sidefeil eller konsollfeil. Røyktesten i `kjor.mjs` er OK.
- **[nytt] K3:** Endringsloggen sier nå: «Ved stasjonen der du går på, går du av rett ved vogna, slik at «Gå om bord» vises med en gang.» Det stemmer med koden. Versjonen er 2.0.6.
- **[nytt] S1, S2, S3:** `index.html` og CSP er uendret (statisk=ok).
- **Overført fra 2d70378:**
  - Roboten sitter i vogna med hodet under taket.
  - Vogna er synlig ved perrongen A.
  - Toget har ingen kollisjon med spilleren, som før.
  - Togets tilstand lagres ikke (F2/F3).
- **Overført fra b69be0e:** F1 (trygg leir og rovdyrstyrke), F3 (samme frø gir samme verden, 5.6.2-lagring), F2, B2, B3, T1, U1, U2 og skiltene.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **Mulig problem 1 fra 2d70378, påstigning ved A:** Rettet i 500fa5b, se over.
- **Mulig problem 2, kosmetisk (overført fra 2d70378):** På skjermbildet fra siden under tur (`tur-side.jpg`) stikker den ene armen til roboten ut over sideveggen i vogna. Det er ett bilde fra ett øyeblikk i sitteklippet, og det kan være pendelen i animasjonen.
  - For å avgjøre det: Se på det hos Even eller på en ekte skjerm.
- **Mulig problem 3, testmetoden (overført):** Senere scenarier i samme side ga mindre spilltid i skadetestene. Full skade fra natt 4 er ikke målt.

## Anbefalte forbedringer
- Kommentaren i endringsloggen og koden sier «390 i stedet for 150». `ST_A_TOG` regnes ut fra `175 * 2 + 40`. Hvis `CAR_COACH` endres, følger ikke tallet med. Vurder `CAR_COACH + 40`.

## Kontroller som ikke kunne utføres
- **Påstigning med ekte tastetrykk eller berøring (E):** Ikke testet. Det er brukt `startRide()` via krok. At `target()` gir `board` etter avstigning ved A, er målt.
- **ST1–ST8 (overført fra 2d70378; `statistikk.js` og startkoden er uendret):** `statistikk.js` og startkoden er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` med `data-spill="morkeskogen"` er uendret.
  - ST2: Ikke testet. Testsiden mangler.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen.
- **Y1 (E):** Referansemobil er ikke valgt, og det er ingen GPU.
- **Y2:** Ikke testet.
- **K2:** Overført fra bd81266 (uendret kode).
- **B1 og B4 (V):** Ikke testet.
- **B3 (lavere grafikk), T1, T3 og ekte berøring (E):** Krever test på enhet.
- **U3, T4 og S4:** Ikke testet.
- **Temming med lasso og full skade fra natt 4:** Kun kodelest (overført).
- **Evens spilltest (V):** Om toget og sittestillingen ser riktig ut.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Avstigningen ved A skjer nå rett ved vogna og på perrongen, og «Gå om bord» vises med en gang. Forbeholdene er at påstigning med ekte tastetrykk ikke er testet, at armen over sideveggen må vurderes og at statistikken ikke er testet.
