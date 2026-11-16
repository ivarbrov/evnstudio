# EVN Game QA: Mørkeskogen 2.0.11
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit f1cf762b9c38fe91b55c9c5c01c730114dbe4947
Testkvittering: evn1 commit=f1cf762b9c38fe91b55c9c5c01c730114dbe4947 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og publiseringssjekken krever full merking. Endringen er bare dokumentasjon (statusen for 2.0.11 i `ENDRINGSLOGG.md`), så etter agentdefinisjonen er det nok å kontrollere K3 og innholdet. Alle andre krav er overført fra rapporten for 6bd5f2b.
Testet: `git diff`, `git diff --word-diff` og `git log` mellom 6bd5f2b og f1cf762. `test/kjor.mjs` er kjørt alene av QA på f1cf762 (HEAD, rent arbeidstre før og etter), med 99 OK og ingen FEIL eller VARSEL. Kvitteringen er identisk med utviklerens. Det er ikke startet noen testserver.

Hva er kontrollert på hvilken commit:
- **[nytt] f1cf762:** `git diff 6bd5f2b f1cf762` endrer `ENDRINGSLOGG.md` og legger til QA-rapporten for 6bd5f2b (commit 059bd8d). Med `--word-diff` er den eneste endringen i endringsloggen «(ikke publisert)» → «(publiseres ved sammenslåing)» i 2.0.11-raden. Utenom `qa/` og `ENDRINGSLOGG.md` er ingen filer endret.
- **Overført fra 6bd5f2b:** Alle krav som gjelder spillet. `spill/morkeskogen/` er byte-lik.

## Oppfylte krav
- **[nytt] K3:** 2.0.11-raden har status «publiseres ved sammenslåing». Funnet om K3 fra 6bd5f2b er rettet. Innholdet i raden er uendret, og versjonen i `index.html` er 2.0.11.
- **[nytt] K1, S1 og F1 (røyktest):** `test/kjor.mjs` på f1cf762: statisk=ok og royk=ok, med 99 OK.
- **Overført fra 6bd5f2b:**
  - U1/F1: Start er synlig på lave telefoner (320×568, 375×600, 414×620), og «Tips og styring» er synlig.
  - Toppraden på PC holder seg innenfor vinduet fra 500 til 1400 px.
  - T2/F1: Avslutt med bare ✕ har `aria-label="Avslutt"`, virker og vises i pausen.
  - Mobil under spilling er uendret (kodelest).
  - S2 og S3.
- **Overført fra 2.0.10:** T1, HUD på mobil, F1 (spillogikk), F2/F3 (lagring) og U2.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- Funnet om K3 fra 6bd5f2b er rettet.

## Anbefalte forbedringer
- Overført fra 6bd5f2b: Ved ≤ 760 px på PC skjules navnet på området i dagfeltet.

## Kontroller som ikke kunne utføres
- **Kjøretidstester for spillet:** Ikke kjørt på nytt. Ingen spillfil er endret siden 6bd5f2b.
- **«Start helt på nytt» (EVN-NULLSTILL) på det kompakte startkortet (overført fra 6bd5f2b):** Ikke testet. Knappen lages av `spill.js` bare når det finnes lagring. Målingen med `spill.js` og lagring ble avbrutt på grunn av tiden. «Tips og styring» er testet, se over.
- **Skjermbilder og visuell vurdering på iPhone 13 og PC (V):** Ikke tatt. De henger i dette miljøet. Målene er rektangler.
- **Ekte telefon og safe area (E):** Ikke testet.
- **Mobil under spilling med kjøring på 6bd5f2b:** Ikke kjørt. Kodelest at reglene ikke treffer touchui under spilling.
- **ST1–ST8 (overført fra 6bd5f2b):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
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
JA MED FORBEHOLD – Ingen kritiske feil. Endringen er bare statusen i endringsloggen, og den retter K3-funnet fra 6bd5f2b. Forbeholdene er de samme som for 6bd5f2b: «Start helt på nytt» på det kompakte startkortet er ikke testet, det finnes ikke skjermbilder, og statistikken er ikke testet. Rapporten er ikke en publiseringsgodkjenning.
