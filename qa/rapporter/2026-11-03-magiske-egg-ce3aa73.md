# EVN Game QA: Magiske egg (magiske-egg) 0.9.1
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1, S2 etter 1.2a) (55d5794116fb74ae842b6d60fed4e7b160157472), commit ce3aa739989256d0a239e4bfb17084dbc3f79ae7
Testkvittering: evn1 commit=ce3aa739989256d0a239e4bfb17084dbc3f79ae7 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full. Versjonen skal foreslås publisert. Selve endringen er på nivå liten: `git diff main...HEAD` endrer 3 linjer i `spill/magiske-egg/index.html` (`<title>`, `#versjon` og `const VERSJON`) og legger til 1 rad i `ENDRINGSLOGG.md`. Ingenting annet er endret.
Testet: lokal server fra repoets rot på 127.0.0.1:8715. `main` (0.9.0) ble eksportert med `git archive` til `/tmp/qa-egg/main` og kjørt på 127.0.0.1:8716. Begge serverne er stoppet. Headless Chromium (Playwright, Node) med SwiftShader, som ga omtrent 1 bilde per sekund. Størrelser: 1280×800, og 375×812, 740×360, 320×568 og 568×320 med emulert berøring (DPR 2). Metoder: Start med Enter på fokusert knapp, `element.click()` via `page.evaluate`, og berøring via CDP `Input.dispatchTouchEvent` (Playwrights `tap` hang på grunn av den lave bildefrekvensen). Jeg brukte ekte tastetrykk for P, Esc, M, E, Tab og piltaster. Testtilstand ble satt med `localStorage` fra en annen side på samme opphav og med `window.__spill` (teleportering). Hver test fikk egen nettleserkontekst. Jeg kjørte ikke testsuiten på nytt, slik oppdraget sa. Kvitteringen og utskriften er hentet fra `/home/claude/kvitt/ui-magiske-egg-trinn2.txt`, og ingen av kontrollene der har FEIL eller VARSEL.

## Oppfylte krav
- **K3:** «Versjon 0.9.1» står i rå HTML (sjekket med JavaScript slått av), etter at skriptet har kjørt, i `<title>` («Magiske egg 0.9.1 – EVN Studio») og i `VERSJON`. `ENDRINGSLOGG.md` har en rad for 0.9.1 som beskriver endringen riktig. Røyktesten viser 0.9.1. Ellers finnes ingen versjonstekst for Magiske egg i repoet.
- **U1:** Startkortet har mål, Start, «Versjon 0.9.1», «← Tilbake til EVN Studio» (`../../`) og «Start helt på nytt».
- **F1:** Spillet starter med Enter og ved berøring. P åpner pausen og Esc fortsetter. Piltasten flytter roboten. Den flyttet seg bare 0,49 enheter på 4 s, fordi `dt` har et tak og bildefrekvensen var omtrent 1 per sekund. Ved E-tasten i eggbutikken ble et egg kjøpt (137 → 108 mynter). Røyktesten ga OK.
- **F2:** Mynter, dyr og eggkø er like etter omlasting (108 mynter, 2 dyr og 2 egg). E-coins-saldoen er stabil etter omlasting (40 → 40), så ingenting deles ut to ganger. «Start helt på nytt» spør først. «Nei, behold alt» beholder lagringen. «Ja, slett alt» fjerner `evn-magiske-egg-v1`, og spillet starter med 0 dyr og 25 mynter.
- **F3:**
  - Lagringen fra 0.9.0 ble laget ved å spille `main`. Den ble lest helt riktig i 0.9.1: 137 mynter, Glitterkanin nivå 3 og Lynkatt nivå 2, eggkø `["vanlig"]`, frø og mat. Det ble ikke laget noen `-kopi`.
  - Ugyldig JSON, `dyr:[null]`, `v:2`, en streng og `funnet` som liste ga ingen sidefeil. Spillet startet, og pausen virket.
- **T1 (emulert):** Start er 180–187×69–71 px og «Tilbake» er 44 px høy i alle fire mobilstørrelser. I spillet er ingen synlige trykkflater under 44×44 px, og det er ingen sideveis rulling.
- **K1:** Under start, pause, kart, kjøp, omlasting, nullstilling og mobilstart kom ingen sidefeil, ingen konsollfeil og ingen svar på 400 eller høyere. Røyktesten ga OK.
- **S1:** Den statiske suiten ga OK. CSP er uendret i diffen. Under kjøring gikk ingen forespørsler utenfor 127.0.0.1.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. E-coins-kjøp er tillatt etter 1.2a. Diffen endrer ingenting her.
- **S3:** Spillet har ingen fritekst (uendret).
- **B2:** M åpner kartet og Esc lukker det. Roboten flyttet seg 0,00 mens piltasten ble holdt med kartet åpent. Målingen er svak fordi bildefrekvensen var lav.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle punktene under er kjente fra tidligere rapporter (`qa/rapporter/2026-11-03-magiske-egg-*.md`). Koden er lik 0.9.0 på `main`, bortsett fra versjonstekstene. Ingen er rettet, og ingen er blitt verre.
1. **T2, verifisert feil (kjent):** Fokus blir ikke inne i dialogene.
   - Pausekortet: Tab gikk `evnPauseStyrKnapp → evnPauseAvslutt → BODY → bokKnapp → evnAvslutt` (bak dialogen) og tilbake.
   - Eggbutikken: Tab gikk `BODY → bokKnapp → evnAvslutt → vanlig → lukkEggbutikk → BODY`.
   - Slik gjenskapes feilen: start spillet, trykk P (eller E ved butikken) og trykk Tab.
2. **K2 (kjent, alle spill):** Spillet har ingen global feilfanger. Uten WebGL kommer én ufanget feil («Error creating WebGL context.»). Barnet får likevel en melding (se B3).
3. **B1, kodelest (kjent):** Spillet lager lyd med WebAudio (`pip()`), men har ingen lydbryter.
4. **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke. Lavere grafikk på svake enheter er bare en grense på DPR 1,5 ved berøring. Meldingen ved manglende WebGL virker (se under).
5. **ST1, ST2, ST4, ST7 og ST8, kodelest (felles og kjent):**
   - `statistikk.js` er uendret siden f6702fd og lastes med `defer` (ST1).
   - Den sender ikke `versjon-…` eller `feil-…`.
   - `EVN-PAUSE v3` og `window.EVNAktivTid` finnes ikke. Spillet bruker v2, og `aktiv` er bare `spillTilstand === 'spill'`.
   - `test/statistikk/` er ikke innført (ST8, kjent).
6. **T3, mulig problem (kjent):** `gesturestart` blokkeres under spilling uten at `modalApen()` sjekkes (linje 5455). Med redusert bevegelse er animasjonen på Start `none` (målt), men `bump` og 3D-effektene fortsetter (kodelest).
7. **Dokumentasjon (kjent):** Oversikten «Hvilke krav gjelder for hvert spill» i standarden mangler fortsatt Magiske egg. Ut fra koden gjelder B1, B2 og B3. B4–B7 gjelder ikke.
   - Tittelen har mappenavnet i parentes («Magiske egg (magiske-egg)»). Siden spillet mangler i oversikten, sammenligner publiseringssjekken (`test/publiseringssjekk.mjs`, linje 170–174) tittelen med mappenavnet. Det er den eneste endringen fra forrige utgave av rapporten. Commit og testresultater er de samme.

## Anbefalte forbedringer
- Når 0.9.1 publiseres, retter det at 0.9.0 på `main` viser «Versjon 0.8.1» før skriptet har kjørt.
- Fra tidligere rapporter, ikke testet på nytt:
  - `evn-magiske-egg-v1-kopi` står ikke i `nokler` for nullstillingen.
  - Lagring med ugyldig JSON eller `v` ulik 1 forkastes uten kopi.
  - Meldingen uten 3D kan få med «Spør en voksen».
  - Samleboka er høyere enn skjermen på mobil.
  - Prikkene på kartet skilles bare med farge.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader ga omtrent 1 bilde per sekund, og det sier ingenting om ekte enheter.
- **Y2:** En skjult fane (simulert `visibilitychange`) åpner pausen. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (`dt` har et tak på 0,05). Status: delvis, ikke oppfylt.
- **T4:** Ikke testet i denne kontrollen, og det finnes ingen automatisk test. Status: ikke testet.
- **U2 og U3:** QA-delen er kodelest. Styringshjelp står på startkortet og under «Slik styrer du» i pausen (knappen `evnPauseStyrKnapp` er sett), og teksten er uendret. Om barnet forstår spillet, må Even teste (V).
- **S4:** Kodelest. Personvernsiden beskriver lokal lagring, `evn-ecoins-v1` og GoatCounter. Diffen berører ikke dette.
- **B3:** Testet med `--disable-webgl --disable-3d-apis`: Start er deaktivert og viser «3D virker ikke her», med en forklaring i `role="alert"`. Status for hele kravet er delvis. Tapt kontekst og ytelse på en svak enhet krever test på enhet (E).
- **T1, T3, B1 og B3 på enhet (E):** Ekte berøring og styrespak, knipe-zoom på iOS og Android, lyd, og svak enhet.
- **ST1–ST8 med testsiden:** `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). ST3 og ST6 er bare kodelest denne gangen: ingen forespørsler gikk ut lokalt, og `statistikk.js` er uendret. Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging se.
- **UI1–UI10 og UI8a–c:** Status er godkjent hovedløsning, men de er ikke tatt i bruk for spillet. De er derfor ikke kontrollert, og UI-suiten er ikke innført.
- **B4, B5, B6 og B7:** Gjelder ikke. Spillet har ikke kamp eller skrekk, ikke faktainnhold, ikke app-installasjon og ikke fritekst.
- **Automatiske tester (A) som mangler:** F2, F3, T2 (fokus), T4, Y2, K2, B1, B2, B3, S2 og S3.
- Lange økter, minnelekkasje og opplevelsen av Evens spill (V) er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD. F1, F2 og F3 er testet på denne committen, også med lagring fra 0.9.0. Endringen gjør bare versjonsteksten lik overalt, og ingen kritiske feil ble funnet. De kjente avvikene står fortsatt åpne: T2, K2, B1, B3 (tapt kontekst) og statistikkgrunnlaget som er felles for alle spill (ST1, ST2, ST4, ST7 og ST8). Y1 og alle tester på enhet mangler.
