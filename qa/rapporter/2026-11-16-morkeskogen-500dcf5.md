# EVN Game QA: Mørkeskogen 2.0.10
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 500dcf5d0b4962a3a565dd531402855c17cb187b
Testkvittering: evn1 commit=500dcf5d0b4962a3a565dd531402855c17cb187b tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og publiseringssjekken krever full merking. Kontrollen gjelder flettingen med main (bee1985). Mørkeskogen er byte-lik med 72a4cfb, så alle spillkrav er overført fra rapporten for 72a4cfb.
Testet: `git diff`, `git log` og `git merge-base` på 500dcf5. `test/kjor.mjs` er kjørt alene av QA i `/home/claude/evn-mork` (HEAD 500dcf5, rent arbeidstre før og etter), med 99 OK og ingen FEIL eller VARSEL. Testserveren til QA er ikke startet, fordi ingen spillfil er endret.

Hva er kontrollert på hvilken commit:
- **[nytt] Main er flettet inn:** `origin/main` (bee1985) er en forfar til 500dcf5. Det er ingen konfliktmarkører i `ENDRINGSLOGG.md`.
- **[nytt] Mørkeskogen er uendret:** `git diff 72a4cfb 500dcf5 -- spill/morkeskogen` er tom. Felles filer som Mørkeskogen laster, er også uendret: `statistikk.js`, `fonter/`, `favicon.png` og `bilder/maskot-staende-*.webp`. Disse er funnet fra `src` og `href` i `index.html`.
- **[nytt] Dette kom fra main:** `spill/min-bondegard/` (nytt spill), bilder for Min Bondegård, QA-rapporter, `index.html` (forsiden), `ecoins/ecoins.js`, `test/index.html`, `test/ecoins/index.html`, `test/min-bondegard/` og `ENDRINGSLOGG.md`.
- **Overført fra 72a4cfb:** Alle spillkrav for Mørkeskogen (layout på mobil, Hopp på 72 px, våpenraden i liggende format og PC uendret). Overført videre fra 2.0.9: spillogikk og lagring.

## Oppfylte krav
- **[nytt] `ecoins/ecoins.js` påvirker ikke Mørkeskogen:** Endringen legger bare til spillet `min-bondegard` (milepælene `bondegard.nivaa.5` = 20 og `bondegard.nivaa.10` = 40) etter Mørkeskogen-blokken. Mørkeskogens oppføringer (`mork.*`) er uendret. Mørkeskogen laster ikke `ecoins.js` (grep i `spill/morkeskogen`). Testen EC1 er oppdatert til 1773/2213/1585 og er OK (ecoins=ok).
- **[nytt] Forsiden (`index.html` i roten):** Diffen nevner ikke Mørkeskogen. Kortet og lenken til Mørkeskogen er uendret, og Avslutt i spillet går fortsatt til `../../`.
- **[nytt] K3, endringsloggen er riktig flettet:**
  - Mot main (`git diff bee1985 500dcf5 -- ENDRINGSLOGG.md`) er bare 2.0.10-raden lagt til, øverst i tabellen.
  - Mot 72a4cfb er bare main sine tre rader lagt til: Min Bondegård 0.15.11, E-coins med Min Bondegård og Min Bondegård 0.8.0.
  - Ingen rader har falt ut, og det er ingen konfliktmarkører.
- **[nytt] Kvitteringen stemmer:** QA fikk nøyaktig samme linje som utvikleren, med `commit=500dcf5…`, `tester=d2d370024a38` og 99 OK. Den nye tester-hashen og de 13 nye kontrollene kommer fra testene for Min Bondegård (`test/index.html` og `test/min-bondegard/`). Alle kontrollene for Mørkeskogen er OK:
  - Statisk: S1 (CSP, ingen eksterne filer, ingen eval) og T3.
  - Røyk: U1/K3 (versjon 2.0.10), F1 (start, pause, fortsett) og K1 (ingen filer mangler, ingen feil eller CSP-brudd).
- **Overført fra 72a4cfb:** T1, F1 på mobil og PC, layout uten overlapp, styrespaken på høyde med Hopp, S2 og S3.
- **Overført fra 2.0.9:** F1 (bossen, toget, handlingsknappen, flere fingre, pausen og Avslutt), F2/F3 (lagring), U1, U2 og T2 (Avslutt-lenken på mobil kan ikke nås med Tab).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.

## Anbefalte forbedringer
- Gjelder ikke Mørkeskogen: To av radene fra main i endringsloggen har status «ikke publisert» (E-coins med Min Bondegård og Min Bondegård 0.8.0), selv om de nå ligger på main. Det bør ryddes i en egen endring for Min Bondegård.

## Kontroller som ikke kunne utføres
- **Ny kjøretidstest av Mørkeskogen utover `kjor.mjs`:** Ikke kjørt. Spillmappen og de felles filene den bruker, er byte-like med 72a4cfb.
- **Ekte berøring, safe area og Hopp på 72 px på telefon og iPad (E):** Ikke testet (overført).
- **ST1–ST8 (overført fra 72a4cfb):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
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
- **Min Bondegård:** Ikke kontrollert. Det er utenfor oppdraget.
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Flettingen med main endrer ikke Mørkeskogen eller filene spillet bruker. Endringen i `ecoins.js` legger bare til Min Bondegård, endringsloggen er riktig flettet, og kvitteringen stemmer. Forbeholdene er de samme som for 72a4cfb: alt på mobil er emulert, og statistikken er ikke testet. Rapporten er ikke en publiseringsgodkjenning.
