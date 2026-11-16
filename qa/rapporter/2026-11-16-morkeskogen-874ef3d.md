# EVN Game QA: Mørkeskogen 2.0.10
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 874ef3d2882c9c12c5bfe612c4aa36f0648a7161
Testkvittering: evn1 commit=874ef3d2882c9c12c5bfe612c4aa36f0648a7161 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og publiseringssjekken krever full merking. Kontrollen gjelder flettingen med main (f501900, PR #68). Mørkeskogen er byte-lik med 72a4cfb og 500dcf5, så alle spillkrav er overført.
Testet: `git diff`, `git log` og `git merge-base` på 874ef3d. `test/kjor.mjs` er kjørt alene av QA i `/home/claude/evn-mork` (HEAD 874ef3d, rent arbeidstre før og etter), med 99 OK og ingen FEIL eller VARSEL. Testserveren til QA er ikke startet, fordi ingen spillfil er endret.

Hva er kontrollert på hvilken commit:
- **[nytt] Main er flettet inn:** `origin/main` (f501900) er en forfar til 874ef3d. Det er ingen konfliktmarkører i `ENDRINGSLOGG.md`.
- **[nytt] Deltaet 500dcf5..874ef3d:** `index.html` (forsiden), `ENDRINGSLOGG.md` (én rad) og to QA-rapporter (nettsiden 0b94900 og Mørkeskogen 500dcf5).
  - `spill/morkeskogen/`, `statistikk.js`, `fonter/`, `favicon.png`, `bilder/` og `ecoins/` er uendret.
- **Overført fra 500dcf5 og 72a4cfb:** Alle spillkrav for Mørkeskogen.

## Oppfylte krav
- **[nytt] Forsiden påvirker ikke spillet:**
  - Kortet til Mørkeskogen har fortsatt `href="spill/morkeskogen/"`. Bare animasjonsrekkefølgen `--i` er endret fra 2 til 3.
  - Den nye nyheten «Mørkeskogen er enklere på mobil» lenker til `spill/morkeskogen/`.
  - Avslutt i spillet går fortsatt til `../../`, altså forsiden.
- **[nytt] K3, endringsloggen er riktig flettet:**
  - Mot main (`git diff f501900 874ef3d -- ENDRINGSLOGG.md`) er bare 2.0.10-raden lagt til, og den står øverst.
  - Mot 500dcf5 er bare main sin rad «Forsiden: ett «Nytt»-merke og nyhet om Mørkeskogen 2.0.9» lagt til, rett under 2.0.10.
  - Ingen rader har falt ut, og det er ingen konfliktmarkører.
- **[nytt] Kvitteringen stemmer:** QA fikk nøyaktig samme linje som utvikleren (`commit=874ef3d…`, `tester=d2d370024a38`, 99 OK). Tester-hashen er uendret fra 500dcf5. Alle kontrollene for Mørkeskogen er OK:
  - Statisk: S1 og T3.
  - Røyk: U1/K3 (versjon 2.0.10), F1 og K1.
- **Overført fra 500dcf5:** `ecoins.js` påvirker ikke Mørkeskogen (uendret siden 500dcf5).
- **Overført fra 72a4cfb:** T1, F1 på mobil og PC, layout uten overlapp, styrespaken på høyde med Hopp, S2 og S3.
- **Overført fra 2.0.9:** F1 (bossen, toget, handlingsknappen, flere fingre, pausen og Avslutt), F2/F3 (lagring), U1, U2 og T2 (Avslutt-lenken på mobil kan ikke nås med Tab).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.

## Anbefalte forbedringer
- Gjelder ikke Mørkeskogen: Raden fra main om forsiden har status «publiseres ved sammenslåing», selv om PR #68 er slått sammen. To rader for Min Bondegård står fortsatt som «ikke publisert» (overført fra 500dcf5). Det bør ryddes i en egen endring.

## Kontroller som ikke kunne utføres
- **Ny kjøretidstest av Mørkeskogen utover `kjor.mjs`:** Ikke kjørt. Spillmappen og de felles filene den bruker, er byte-like med 72a4cfb og 500dcf5.
- **Ekte berøring, safe area og Hopp på 72 px på telefon og iPad (E):** Ikke testet (overført).
- **ST1–ST8 (overført fra 500dcf5):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
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
- **K2, B1, B2, B3 (lavere grafikk), B4 (V), T4, U3 (V) og S4:** Ikke testet på nytt (koden er uendret).
- **Forsiden og Min Bondegård:** Ikke kontrollert utover lenkene til Mørkeskogen. Det er utenfor oppdraget.
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Flettingen med main endrer ikke Mørkeskogen eller filene spillet bruker. Lenkene på forsiden er riktige, endringsloggen er riktig flettet, og kvitteringen stemmer. Forbeholdene er de samme som før: alt på mobil er emulert, og statistikken er ikke testet. Rapporten er ikke en publiseringsgodkjenning.
