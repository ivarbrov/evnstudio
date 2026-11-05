# EVN Game QA: Fiskespillet 0.5.5
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 5ea366ee11e07cdbf3d2fbc4b0f5903b898cb60f
Testkvittering: evn1 commit=5ea366ee11e07cdbf3d2fbc4b0f5903b898cb60f tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels – Dette er en ny kontroll etter retting. Endringen gjelder feilhåndtering og spilllogikk i ett spill: WebGL-lytteren og tidssteget for Kraken-visningen. Felles kode, lagringsformat, CSP, statistikk og `start` er ikke endret, så høyt nivå trengs ikke. Fullt nivå er kjørt på c65ab42. Diffen inneholder bare de tre punktene i oppdraget og QA-rapporten for c65ab42. `test/kjor.mjs` ga 98 OK, 0 FEIL, 0 VARSEL og 1 KJENT (Fossil Zoo T3, ikke dette spillet). To suiter er ikke innført.
Testet: Jeg brukte min egen `python3 -m http.server` på 127.0.0.1:8792. Rota var `/tmp/qa-fisk055/root`, med en `git archive` av 5ea366e som er byte for byte lik arbeidstreet, og c65ab42 under `/v054` til sammenligning. Nettleseren var headless /usr/bin/google-chrome via Playwright med SwiftShader, med 5–12 bilder/s. Størrelser: 1280×800 med mus og tastatur, og 375×812 og 740×360 med emulert berøring og DPR 2. Jeg brukte ekte tastetrykk, musklikk og `touchscreen.tap`. Tapt WebGL ble laget med `WEBGL_lose_context`. Testtilstanden ble satt med `window.__spill`, og lagringen ble lagt inn fra en nøytral side. Hver størrelse fikk egen kontekst, og localStorage ble tømt etterpå. Serveren min er stoppet, og det kjører ingen Chrome-prosesser. Port 8765 (pid 195) er ikke min, og jeg har ikke rørt den. `git status` er tom.

## Oppfylte krav
- **B3/K2 (avviket fra c65ab42 er rettet):** Tapt WebGL mens startkortet vises gir nå feilkortet, med fokus på «Last på nytt» (267×67 px). Dette gjelder både 1280×800 og 375×812.
  - Tab og Shift+Tab blir på `feilLast` (5 av 5 tastetrykk).
  - Det går ikke an å starte bak kortet. Et klikk eller trykk midt på Start treffer `feilLast`, og Enter laster siden på nytt.
  - Lagringen blir stående: 777 før, og 777 etter «Last på nytt». Spillet starter normalt etter omlasting.
- **K2 (ingen regresjon):** Tapt WebGL under spilling gir fortsatt feilkortet, og lagringen skrives (penger 4321). Esc og P åpner ikke pausen over kortet, og fokus blir på `feilLast`.
- **Kraken-tiden (forslag fra c65ab42, rettet):** Med samme skript tok det fra fangst til kortet 8,9–10,1 s i 0.5.5, mot 34,4 s i 0.5.4. Begge tallene inkluderer 1,5 s pause og overhead fra målingen. Visningen står stille i pausen (t 1,85 → 1,85). Fremgangen lagres med en gang (`kraken:true`). Kortet «🏆 OPPDRAGET ER KLART! 🏆» kommer og lukkes med Enter, og kjøring virker etterpå.
- **F1:** Ved 1280×800, 375×812 og 740×360 virker start, kjøring med W (2,7–4,4 enheter), pause med P og Esc, kart med M og Esc, og «Ja, avslutt» tilbake til forsiden. Kraken ble fanget med tastatur (1280) og med trykk (375). `royk` i `kjor.mjs` er OK.
- **F2:** Lagringen overlever avslutning og ny lasting (2468 → 2468). `lagre()` og lagringsformatet er ikke endret.
- **U1:** Ingen sideveis rulling, og Start er synlig i alle tre størrelsene.
- **K1:** Ingen ufangede feil og ingen 404 i regresjonsøktene og Kraken-øktene. Se også mulig problem under.
- **K3:** «Versjon 0.5.5» står i tittel, startkort og `VERSJON`. Raden i `ENDRINGSLOGG.md` stemmer med diffen og med det jeg målte, bortsett fra funnet under om dans og plask.
- **S1:** `kjor.mjs` statisk er OK, og ingen nye domener er lagt til.
- **ST1–ST8:** Uendret. Statistikk, start og pause er ikke rørt i diffen, så de er ikke kontrollert på nytt.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Kraken-visningen ved lav bildefrekvens – verifisert feil (ny regresjon fra rettingen, ikke kritisk):** Øyeblikkene der Kraken lander i båten og plasker ned blir hoppet over av og til.
  - Øyeblikkene utløses bare når animasjonen er inne i et smalt tidsvindu. Landing med `lydMynt()` og robotdansen skjer når `a > 0.95` i hopp-fasen, et vindu på 45 ms. Plasket skjer når `a > 0.9` i ut-fasen, et vindu på 90 ms. Nå kan `ekteDt` være opptil 0,25 s per bilde. Under omtrent 22 bilder/s kan derfor ett bilde hoppe over vinduet. Før var steget begrenset til 0,05 s, og da ble vinduet alltid truffet.
  - Målt i 0.5.5 i tre kjøringer med 5–7 bilder/s: `landet` ble false, false og true, og `plasket` ble true, true og false. I 0.5.4 ble begge true.
  - Konsekvens: på trege mobiler danser ikke roboten, og myntlyden eller plasket kan mangle. Fremgang, premie og kort virker likevel.
  - Slik gjenskapes det: kjør `/tmp/qa-fisk055/skript/k.mjs` og les `__spill.krakenShow.landet` og `.plasket` når visningen er ferdig.
  - Mulig retting, til vurdering for hovedagenten: utløs hendelsene når fasen er passert, ikke inne i vinduet.
- **ST2, ST4 og ST7 – verifisert feil (kjent fra c65ab42, ikke rettet):** Spilletid i pause, `feil-fiskespillet-spill` og versjonshendelsen. Statistikken er ikke rørt, så avvikene står ifølge koden fortsatt.
- **B4/U3 – mulig problem (kjent):** Tidsgrensen for Kraken (cirka 3 trykk/s i 60 s) må prøves på ekte telefon.

## Anbefalte forbedringer
- **K1 – mulig problem (sett én gang):** Ved 1280×800 kom feilen «Cannot read properties of null (reading 'trim')» én gang, etter flere tap av WebGL og omlastinger på rad. Den kom ikke igjen i tre senere kjøringer, og jeg fikk ikke tak i stakken. Den eneste `.trim()` som kan være involvert, ligger i `three-r128.min.js`. Det tyder på at three.js prøver å lage en shader etter at WebGL er tapt. Feilkortet sto allerede, så barnet merker ikke noe. Det kan avgjøres ved å stoppe tegningen når konteksten er tapt, eller ved å fange stakken i en ny kjøring.
- **Feilkortet på startkortet** sier «Fiskene dine er lagret», også for en ny spiller som ikke har noe lagret. Det er en liten unøyaktighet.
- Forslagene fra c65ab42 som ikke er rørt, står fortsatt: HUD ved 568×320 og 320×568, `#test` som teller som vanlig trafikk, T2-vakten bør flyttes til felles EVN-PAUSE, og Fiskespillet mangler i standardens oversikt.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Jeg har ikke ekte maskinvare. SwiftShader med 5–12 bilder/s sier ingenting om en referansemobil.
- **Y2:** Ikke testet ved 60/120 Hz. Kodelest: `ekteDt` brukes bare av Kraken-visningen, og resten bruker fortsatt `dt` begrenset til 0,05.
- **B3 (E):** Ekte tap av WebGL, for eksempel når en mobil legger appen i bakgrunnen, er ikke testet. Her er det bare simulert.
- **T1, T3 og B1 (E):** Ekte berøring og lyd er ikke testet. Om myntlyden faktisk høres eller mangler, er bare utledet av flagget.
- **U2, U3 og B4 (V):** Even må vurdere om den kortere Kraken-visningen og en eventuell manglende dans merkes.
- **ST8:** `test/statistikk/` finnes ikke, og GoatCounter krever en voksen med innlogging.
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for spillet.
- F3 med lagringer fra 0.2.0–0.5.2 er ikke kjørt på nytt. `lastInn()` og `lagre()` er uendret siden c65ab42.

## Klar for testing hos Even?
JA MED FORBEHOLD – Begge funnene fra c65ab42 er rettet, F1 er testet, og jeg fant ingen kritiske feil. Rettingen av tiden gir en ny, mindre feil: på trege enheter kan robotdansen, myntlyden eller plasket i Kraken-visningen mangle. Statistikkavvikene ST2, ST4 og ST7 står fortsatt før publisering.

Skjermbilder og skript ligger i `/tmp/qa-fisk055/`, blant annet `webgl-start-1280x800.png`, `webgl-start-375x812.png` og `skript/k.mjs`. Hele utdataene fra `kjor.mjs` ligger i `/tmp/qa-fisk055-kjor.txt`.
