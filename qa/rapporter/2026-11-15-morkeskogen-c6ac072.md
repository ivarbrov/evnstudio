# EVN Game QA: Mørkeskogen 2.0.10
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c6ac07204010b286d4aaf8a8d4209bdaadc38b08
Testkvittering: evn1 commit=c6ac07204010b286d4aaf8a8d4209bdaadc38b08 tester=a2c92037f5f1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Endringen er liten (bare CSS for mobil og versjonsnummer), men publiseringssjekken krever full merking. Det endrede området er kontrollert med kjøring. Resten er overført fra 2.0.9 (rapporten for 617b94e og tidligere).
Testet: Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright 1.63 med Chromium headless (SwiftShader, ingen GPU). Mobil er emulert med `isMobile` og `hasTouch` (`pointer: coarse` = sann) i 375×812, 812×375, 320×568, 568×320, 667×375 (iPhone SE liggende) og 375×667 (iPhone SE stående). Alle ti våpen er eid, og tilstandene start, Spis synlig og byggemodus er målt. PC er testet i 1280×800 med ekte tastetrykk og mus. Layouten er målt med rektangler, ikke med skjermbilder. `test/kjor.mjs` er kjørt alene av QA på c6ac072, med 86 OK og ingen FEIL eller VARSEL.

Hva er kontrollert på hvilken commit:
- **[nytt]** `git diff 9eaa454 c6ac072`: `hud2.css`, `index.html` (bare versjonslinja) og `ENDRINGSLOGG.md`. Alle endringene i CSS ligger under `body.touchui`. `spill.js` er byte-lik med 9eaa454 (`cmp`). Grenen bygger på main 9eaa454 (2.0.9 publisert).
- **[nytt]** Layout på mobil i 6 størrelser og 3 tilstander, og PC-sammenligning med 9eaa454. Skriptene er `/tmp/qa206/m10-layout.js` og `/tmp/qa206/m10-pc.js`.
- **Overført fra 2.0.9:** Spillogikk, lagring, toget, bossen, handlingsknappen, flere fingre og pausen. `spill.js` og `hud2.js` er uendret.

## Oppfylte krav
- **[nytt] T1, trykkflater:** Hopp er 72×72 i alle størrelser. Handlingsknappen er 104 (stående) og 96 (liggende), snarveiene 64, ⏸ 44 og våpenknappene 46. Ingen er under 44 px.
- **[nytt] Hopp, handling og snarvei** (minste avstand mellom kantene):
  - Stående (375×812, 375×667, 320×568): handling–Hopp 12 px, handling–Spis og handling–Bygg 12 px, Hopp–våpenrad 18 px. Ingen overlapp.
  - Liggende (812×375, 667×375, 568×320): handling–Hopp 10 px, handling–snarvei 14 px, Hopp–snarvei 33 px. Hopp–våpenrad er 115 px og handling–våpenrad 112 px. Ingen overlapp mellom knappene.
  - Hopp og handlingsknappen står loddrett over hverandre (samme midtlinje: `right` 30 + 36 = 14 + 52).
- **[nytt] Styrespaken:** Bunnen av hvileringen står 2 px fra bunnen av Hopp i alle seks størrelsene, så den står fortsatt på høyde med Hopp. `joyIdle()` bruker `jumpBtn.getBoundingClientRect().bottom`, og bunnen av Hopp (`--kb`) er uendret.
  - Stående er avstanden fra styrespaken til handlingsknappen 95 px (375 bred) og 40 px (320 bred), og fra styrespaken til Hopp 111 og 56 px.
  - Liggende er avstanden fra styrespaken til knappene over 290 px.
- **[nytt] Ingen sideveis rulling** og ingenting utenfor skjermen i noen størrelse.
- **[nytt] PC er uendret:** HUD-plasseringen er identisk med 9eaa454 i 1280×800. Tastene 1, 2, 4, C, M (Esc lukker), H, I, B og E holdt, og venstre musknapp, gir samme resultat i begge versjonene.
  - Unntak: E ved bålet la ved på i c6ac072, men ikke i 9eaa454. `spill.js` er byte-lik, så forskjellen skyldes tidsvariasjon i den trege headless-løkka, ikke koden.
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere.
- **[nytt] K3:** Versjonen er 2.0.10 i `index.html`, og endringsloggen har en rad for 2.0.10. Se «Andre avvik».
- **[nytt] S1, S2, S3:** CSP er uendret (statisk=ok). Ingen ny datainnsamling og ingen fritekst.
- **Overført fra 2.0.9 (617b94e/29e0b92 og tidligere):** F1 (bossen, toget, handlingsknappen, flere fingre, pausen og Avslutt), F2/F3 (lagring), U1, U2 og T2 (Avslutt-lenken på mobil kan ikke nås med Tab).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **K3, mulig problem:** Raden for 2.0.10 i `ENDRINGSLOGG.md` har datoen «2026-11-15 (forhåndsvisning, ikke publisert)». Siden versjonen nå skal publiseres, bør statusen endres til «publiseres ved sammenslåing», som for 2.0.9.
- **Mulig problem, eldre, ikke regresjon:** I liggende format med ti våpen overlapper rektangelet til våpenraden rektangelet til styrespakens hvilering med 25×54 px. Det gjelder 812×375, 667×375 og 568×320. Det samme er målt på 9eaa454 (568×320: 25×54). Det er altså ikke innført i 2.0.10, og det ble ikke oppdaget i 2.0.9-kontrollen, som målte med ett våpen. Det er bare rektanglene som overlapper. Hvileringen er rund, så den faktiske overlappen er trolig mindre.
  - For å avgjøre det: Se på en ekte telefon i liggende format med mange våpen om ringen og venstre del av våpenraden går inn i hverandre. Et trykk på et våpen stoppes av raden (`stopPropagation`), så det skal ikke starte styrespaken.

## Anbefalte forbedringer
- Våpenraden i liggende format kan få litt større avstand til venstre (for eksempel `max-width` med 2 × 200 px) for å unngå overlappen over. Det er ikke en del av denne endringen.

## Kontroller som ikke kunne utføres
- **Skjermbilder:** Ikke tatt. De henger i dette miljøet. Layouten er kontrollert med rektangler.
- **Ekte berøring, safe area og trykk på 72 px Hopp på telefon og iPad (E):** Ikke testet. `env(safe-area-inset-*)` brukes uendret (`--kb` og `--kr`).
- **Hopp med emulert berøring i 2.0.10:** Ikke kjørt på nytt. Handlingen og `data-k="jump"` er uendret. Flere fingre er overført fra 5e5b3b7.
- **ST1–ST8 (overført fra 2.0.9):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` med `data-spill="morkeskogen"` er uendret.
  - ST2: Ikke testet. Testsiden mangler.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen.
- **Y1 (E):** Ingen GPU og ingen referansemobil.
- **Y2:** Ikke testet på nytt.
- **K2, B1, B2, B3 (lavere grafikk), B4 (V), T3, T4, U3 (V) og S4:** Ikke testet på nytt (koden er uendret).
- **Evens spilltest (V):** Om Hopp på 72 px er lett å treffe.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Hopp er 72 px, og det er ingen overlapp mellom Hopp, handling og snarvei, med 10–33 px mellom knappene. Styrespaken står fortsatt på høyde med Hopp, og PC er uendret. Forbeholdene er statusen i endringsloggen, den eldre overlappen mellom våpenraden og styrespaken i liggende format, at alt på mobil er emulert og at statistikken ikke er testet. Rapporten er ikke en publiseringsgodkjenning.
