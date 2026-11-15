# EVN Game QA: Mørkeskogen 2.0.10
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 72a4cfb4c0ea0ee229da9f594f20dedf6548019a
Testkvittering: evn1 commit=72a4cfb4c0ea0ee229da9f594f20dedf6548019a tester=a2c92037f5f1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og publiseringssjekken krever full merking. Dette er en ny kontroll etter retting av de to funnene i rapporten for c6ac072. Deltaet er kontrollert med kjøring, og resten er overført fra c6ac072.
Testet: `test/kjor.mjs` er kjørt alene av QA i den rene arbeidskopien `/tmp/w72` (detached på 72a4cfb), med 86 OK og ingen FEIL eller VARSEL. Arbeidstreet var rent før og etter. Layouten er målt med lokal server 127.0.0.1:8798 (stoppet etterpå), Playwright 1.63 og Chromium headless (SwiftShader). Mobil er emulert (`isMobile`, `hasTouch`, `pointer: coarse` = sann), med `index.html`, `hud2.css`, `hud2.js` og `spill.js` fra `/tmp/w72` rutet inn. Alle ti våpen er eid, og tilstandene start og Spis synlig er målt. Layouten er målt med rektangler, ikke med skjermbilder.

Hva er kontrollert på hvilken commit:
- **[nytt] Deltaet:** `git diff c6ac072 72a4cfb` endrer to filer med én linje hver.
  - `hud2.css`: `left:50%!important` er lagt til i den liggende regelen for `#hotbar`.
  - `ENDRINGSLOGG.md`: 2.0.10-raden har status «publiseres ved sammenslåing» og en setning om våpenraden.
  - `spill.js`, `hud2.js` og `index.html` er uendret.
- **[nytt]** Layout på mobil i 812×375, 667×375 (iPhone SE liggende), 568×320 og 375×812.
- **Overført fra c6ac072:** 320×568 og 375×667 stående (regelen gjelder bare liggende), PC uendret, T1 og hvileringen ved Hopp i de andre størrelsene.

## Oppfylte krav
- **[nytt] Overlappen mellom våpenraden og styrespaken i liggende format er rettet:**
  - 812×375: våpenraden står på x 177–635, og styrespaken slutter på 162.
  - 667×375: våpenraden 177–490.
  - 568×320: våpenraden 177–391.
  - Avstanden fra styrespaken til våpenraden er 15 px i alle tre størrelsene. Før var det en overlapp på 25×54 px.
  - Avstanden fra våpenraden til handlingsknappen er 74 px og til Hopp 75 px. Avstanden til Spis-snarveien er 46 px.
  - Ingen overlapp mellom noen av elementene, ingenting utenfor skjermen og ingen sideveis rulling. Raden kan fortsatt rulles (`scrollWidth` > `clientWidth`).
- **[nytt] Stående er uendret** (375×812): alle avstander er identiske med c6ac072. Handling–Hopp 12, Hopp–våpenrad 18, styrespak–våpenrad 14.
- **[nytt] Hvileringen står på høyde med Hopp** (2 px) i alle de målte størrelsene.
- **[nytt] T1:** Hopp er 72×72. Ingen trykkflate er under 44 px.
- **[nytt] K3:** 2.0.10-raden har status «publiseres ved sammenslåing», og den nye setningen stemmer med CSS-endringen. Mulig problem K3 fra c6ac072 er rettet. Versjonen er 2.0.10.
- **[nytt] K1, S1 og F1 (røyktest):** `test/kjor.mjs` på 72a4cfb: statisk=ok og royk=ok. Ingen sidefeil eller konsollfeil i layoutmålingene.
- **[nytt] S2, S3:** Ingen ny datainnsamling og ingen fritekst (diff).
- **Overført fra c6ac072:** PC uendret (HUD og taster mot 9eaa454; endringen ligger under `body.touchui` og en mediespørring for `pointer:coarse`), og stående 320×568 og 375×667.
- **Overført fra 2.0.9:** F1 (spillogikk), F2/F3 (lagring), U1, U2 og T2 (Avslutt-lenken på mobil kan ikke nås med Tab). `spill.js` er byte-lik med 9eaa454.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- Begge funnene fra c6ac072 (statusen i endringsloggen og overlappen mellom våpenraden og styrespaken) er rettet.

## Anbefalte forbedringer
Ingen nye.

## Kontroller som ikke kunne utføres
- **Skjermbilder:** Ikke tatt. De henger i dette miljøet.
- **Ekte berøring, safe area og Hopp på 72 px på telefon og iPad (E):** Ikke testet.
- **iPhone 13 liggende (844×390):** Ikke målt som egen størrelse. 812×375 og 667×375 er målt.
- **ST1–ST8 (overført fra c6ac072):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
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
JA MED FORBEHOLD – Ingen kritiske feil. Begge funnene fra c6ac072 er rettet. Våpenraden står 15 px fra styrespaken i liggende format, stående er uendret, og endringsloggen har riktig status. Forbeholdene er at alt på mobil er emulert og at statistikken ikke er testet. Rapporten er ikke en publiseringsgodkjenning.
