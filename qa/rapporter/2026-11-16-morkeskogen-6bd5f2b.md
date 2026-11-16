# EVN Game QA: Mørkeskogen 2.0.11
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 6bd5f2be76e1ca03292f6bcc19be1885a52ffe0b
Testkvittering: evn1 commit=6bd5f2be76e1ca03292f6bcc19be1885a52ffe0b tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og publiseringssjekken krever full merking. Endringen er bare CSS (en ny blokk nederst i `hud2.css`) og versjonsnummeret. Det endrede området er kontrollert med kjøring, og resten er overført fra 2.0.10.
Testet:
- `test/kjor.mjs` er kjørt alene av QA på 6bd5f2b, med 99 OK og ingen FEIL eller VARSEL.
- Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright 1.63 med Chromium headless (SwiftShader).
- `index.html`, `hud2.css` og `hud2.js` fra 366b122 (2.0.10 på main) og 6bd5f2b er rutet inn og sammenlignet.
- Startkortet er målt med tomt `spill.js`. Toppraden er målt under spilling med `spill.js` rutet inn og `renderer.render` slått av.
- Mobil er emulert (`isMobile`, `hasTouch`). Alt er målt med rektangler, ikke med skjermbilder.

Hva er kontrollert på hvilken commit:
- **[nytt] Deltaet:** `git diff 366b122 6bd5f2b` endrer `hud2.css` (+24 linjer), versjonslinja i `index.html` og én rad i `ENDRINGSLOGG.md`. `spill.js` og `hud2.js` er uendret. Grenen bygger på main 366b122.
- **[nytt]** Startkortet i 12 størrelser, toppraden på PC i 11 bredder (500–1400) og Avslutt på PC. Skriptet er `/tmp/qa206/m11.js`.
- **Overført fra 2.0.10 (0d92728/4b7559c og tidligere):** HUD på mobil under spilling, spillogikk og lagring.

## Oppfylte krav
- **[nytt] U1 og F1, startkortet på lave telefoner** (regelen gjelder høykant med høyde ≤ 620 px):
  - **320×568:** Start står på 341–386 (før 523–582, under kanten) og er nå synlig. Kortet er 509 px høyt (før 744). «Tips og styring» er synlig (før bare ved rulling).
  - **375×600:** Start står på 357–402 (før 468–527). Tips er synlig.
  - **414×620:** Start står på 356–402 (før 461–520). Tips er synlig.
  - **500×600, PC-vindu på høykant:** Regelen gjelder også her. Start står på 346–392, og Tips er synlig.
  - Overskriften er 30 px i disse størrelsene og 44 px ellers.
- **[nytt] Startkortet er uendret der regelen ikke gjelder:** 375×667, 360×640, 390×844 (iPhone 13), 1280×800, 1000×650, 500×900 og liggende 568×320 og 844×390 har samme mål som 366b122.
  - I 360×640 kan Tips fortsatt bare nås ved rulling, som før.
  - Ingen sideveis rulling i noen størrelse.
- **[nytt] Toppraden på PC** (500, 520, 580, 640, 700, 760, 800, 900, 1024, 1280 og 1400 px):
  - Det er ingen overlapp mellom statusfelt, dag, ⏸, kart, hjelp og Avslutt i noen bredde, og ingenting ligger utenfor vinduet.
  - Før lå Avslutt utenfor ved 500–580 (521–619), og ved 500 lå også hjelp utenfor.
  - Nå slutter Avslutt på 488 (500), 508 (520), 568 (580) og 628 (640).
  - Avslutt er 44 px bred med bare ✕ ved ≤ 760 px, og 98 px med tekst fra 800 px. Fra 800 px og oppover er toppraden identisk med 366b122.
- **[nytt] T2 og F1, Avslutt med bare ✕:**
  - `aria-label="Avslutt"` er beholdt, så det tilgjengelige navnet er «Avslutt».
  - Ved 520 px viser et klikk på ✕ spørsmålet om å avslutte. «Nei, spill videre» lukker det.
  - Pausen (P) viser 🚪 Avslutt, og et klikk der gir spørsmålet.
  - «Ja, avslutt» ga en forespørsel til forsiden `/` med status 200. URL-en hadde ikke rukket å endre seg da den ble lest i headless, så selve navigasjonen er ikke bekreftet. Koden (`location.href = '../../'`) er uendret.
- **[nytt] Mobil (touchui) under spilling er uendret (kodelest):** Alle de nye reglene for toppraden har `body:not(.touchui)`. Regelen for høykant ≤ 620 px gjelder bare `#startScreen` og `#startBtn`.
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere.
- **[nytt] S1, S2, S3:** CSP er uendret (statisk=ok).
- **[nytt] K3:** Versjonen er 2.0.11, og endringsloggen har fått en rad for 2.0.11. Se «Andre avvik».
- **Overført fra 2.0.10:** T1, HUD på mobil (Hopp, handling, våpenrad, styrespak), F1 (spillogikk), F2/F3 (lagring), U2 og bildet på startkortet med `onerror`.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **K3, mulig problem:** 2.0.11-raden i `ENDRINGSLOGG.md` har statusen «2026-11-16 (ikke publisert)». Før publisering bør den få «publiseres ved sammenslåing», som de tidligere versjonene.
- **Eldre funn fra 4b7559c er rettet:** Start under kanten i 320×568.

## Anbefalte forbedringer
- Ved ≤ 760 px på PC skjules navnet på området (`#biome`) i dagfeltet. Bare ikonet og fasen står igjen. Det er akseptabelt, men spilleren ser ikke lenger navnet på området i smale vinduer.

## Kontroller som ikke kunne utføres
- **«Start helt på nytt» (EVN-NULLSTILL) på det kompakte startkortet:** Ikke testet. Knappen lages av `spill.js` bare når det finnes lagring. Målingen med `spill.js` og lagring ble avbrutt på grunn av tiden. «Tips og styring» er testet, se over.
- **Skjermbilder og visuell vurdering på iPhone 13 og PC (V):** Ikke tatt. De henger i dette miljøet. Målene er rektangler.
- **Ekte telefon og safe area (E):** Ikke testet.
- **Mobil under spilling med kjøring på 6bd5f2b:** Ikke kjørt. Kodelest at reglene ikke treffer touchui under spilling.
- **ST1–ST8 (overført fra 2.0.10):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
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
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Start er nå synlig på lave telefoner (320×568, 375×600, 414×620). Toppraden på PC holder seg innenfor vinduet fra 500 px, og er uendret fra 800 px. Avslutt har fortsatt navnet «Avslutt» og virker, også i pausen. Forbeholdene er at «Start helt på nytt» på det kompakte kortet ikke er testet, at statusen i endringsloggen er «ikke publisert», at det ikke finnes skjermbilder og at statistikken ikke er testet. Rapporten er ikke en publiseringsgodkjenning.
