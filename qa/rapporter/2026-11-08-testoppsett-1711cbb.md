# EVN Game QA: Testoppsett og publiseringssjekk (automatisk spillregistrering), ingen spillversjon
Grunnlag: agent 2.2, standard 1.2 (utkast; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1711cbb3e072689be7a0247a227f8d59518d7284
Testkvittering: evn1 commit=1711cbb3e072689be7a0247a227f8d59518d7284 tester=39e3aefa15a2 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok sikkerhet=ok
Nivå: høy – endringen gjelder felles testkode og publiseringssjekken, som avgjør om alle fire spill kan publiseres. Ingen spillkode er endret, så spillkrav er bare kontrollert gjennom røyk- og statisktestene.
Testet: Windows 11, headless Chrome via `node test/kjor.mjs --base origin/main`. `node test/publiseringssjekk.mjs` er kjørt mot resultatet. For å prøve manipulering laget jeg en klon i scratchpad (utenfor repoet) med et manipulert spill. Der kjørte jeg kjor.mjs og publiseringssjekken med 1711cbb som «main». Klonen er slettet etterpå. Jeg testet ikke manuelt i nettleserpanelet.

## Oppfylte krav
- Røyk- og statisktestene på 1711cbb gir 111 ok og 0 feil. Alle fire spill er oppdaget og testet:
  - S1 (csp, domener, eksterne-filer, eval), T3-zoom, U1-versjon, F1 (startknapp, start, pause, fortsett) og K1 (404, feil, nettleser).
  - De to registreringsfilene gir samme klikk som den gamle SPILL-lista: eventyrspill bruker `menyStart`, og dyrepatruljen bruker `startBtn` pluss klikk på `.verden.aapen`.
- Alle 38 scenarier i suiten «sikkerhet» er OK.
- Punkt 1 (automatisk registrering) er oppfylt ved kjøring. I klonen ble et nytt spill oppdaget og testet uten endring i test/.
- Punkt 3 er oppfylt. Endringer i test/ og .github/ gir fortsatt FEIL (N1–N6), og sjekken flagger også dette PR-et selv.
- Kravunionen fra main virker. N34 viser at F1 fortsatt kreves når grenen fjerner det.
- .github/ er uendret (diff = 0 linjer). main-beskyttelsen og arbeidsflytene er urørt, så punkt 6 er oppfylt for selve koden.
- `returnByValue` og den låste gettteren er reelle forbedringer for et spill som ligger i rammen og ikke navigerer bort.

## Kritiske feil som må rettes
Ingen funnet etter definisjonen for spill: start, fremgang, personvern og innhold er uendret. Funnet under er likevel blokkerende for bestillingens punkt 4.

## Andre avvik fra felles standard / bestillingen
1. **Verifisert feil (punkt 4): et nytt spill kan forfalske hele testresultatet og passere [testoppsett] uten noen endring i test/.**
   - Slik gjenskapes det: legg til `spill/lurespill/` med tre filer.
     - `index.html` uten startknapp, CSP og versjon. Den har en `<a id="v" href="ferdig.html" target="_top">` og `<script src="spill.js">`.
     - `spill.js` inneholder `document.getElementById("v").click();`.
     - `ferdig.html` setter `window["EVN"+"Test"+"Resultat"] = {…ferdig resultat der alt er ok…}`.
   - Resultat: kjor.mjs ga «statisk=ok royk=ok … sikkerhet=ok, 124 ok, 0 feil». Alle 13 kontrollene for lurespill var OK, også F1-startknapp og S1-csp, selv om spillet har verken startknapp eller CSP.
   - Publiseringssjekken (versjonen fra 1711cbb, i rollen som main) ga «OK: Testoppsettet: 5 spill testes automatisk (nye: lurespill) …». Den feilet bare fordi QA-rapporten manglet.
   - Hvorfor det virker:
     - Testsiden og spillene har samme opphav (127.0.0.1:port), og rammen har ingen `sandbox`.
     - Spillet navigerer toppvinduet bort. Da forsvinner den låste getteren, fordi det er et nytt dokument.
     - kjor.mjs leser `window.EVNTestResultat` fra hvilken som helst side som ligger øverst, uten å sjekke at toppsiden fortsatt er `/test/`.
   - Lokal kvittering og Actions får det samme falske resultatet, så sammenligningen av kvitteringene stopper det ikke.
   - På main krevde et nytt spill endring i test/index.html og dermed særskilt gjennomgang. Det sperret dette indirekte. Endringen fjerner den sperren for nye spill, så den svekker main på dette punktet.
2. **Verifisert feil: skanningen etter tilgang til testsiden (TILGANG-regexene) er lett å omgå.** Skriptet `C:\Users\sss480\AppData\Local\Temp\claude\b1ad4f01722a3e7a\e6e8d332-0f44-45a4-aef6-2201f900bad2\scratchpad\regex.mjs` viser at disse linjene IKKE fanges:
   - `this.parent…`
   - `var w = window; w.parent.JSON…`
   - `window['par'+'ent']`
   - `document.defaultView.parent`
   - `const { parent: p } = window`
   - `window['EVN'+'TestResultat']`
   - `<a target="_top">`

   I tillegg holdes `qa/`, `.claude/` og alle `*.md` utenfor skanningen, men de serveres fra samme opphav. Et spill kan derfor laste for eksempel `/qa/x.js`, og endringer i qa/ teller heller ikke som kodeendring. Med tilgang til parent kan et spill også endre `Array.prototype`, `JSON` og `Object.freeze` i testsiden før resultatet lages. Getteren og frysingen beskytter da ikke. arbeidsflyt.md nevner restrisikoen, men beskriver den som «kode som er skjult med vilje». Funn 1 trenger ingen skjuling.
3. **Mulig problem: `evn-test.json` unntas fra spillendring via `f.endsWith('/evn-test.json')`.** Det gjelder også en fil med dette navnet i en undermappe, for eksempel `spill/x/data/evn-test.json`. Et spill som laster en slik fil som innhold, kan da endres uten ny versjon (K3) og uten full QA for spillet. Unntaket bør gjelde bare den eksakte stien `spill/<id>/evn-test.json`.
4. **Mulig problem (robusthet): suiten «sikkerhet» bruker det faste navnet `testspill` og PR-ens egen HEAD som basis.** I klonen, der `spill/testspill/` fantes, feilet P1 med «registreringen til et spill som finnes på main, er endret». Et ekte spill med dette navnet ville få sikkerhetssuiten til å feile. Det gir falsk rød status, ikke en svekkelse.
5. **Til informasjon (overgang):** Kjøres den nye publiseringssjekken mot dette PR-et selv, gir den FEIL for registreringene til eventyrspill og dyrepatruljen, fordi main ikke har dem. På GitHub kjører main sin gamle sjekk, så PR-et uansett krever én gjennomgang fra eieren og unntak (bypass), slik punkt 3 forutsetter. Dette er et engangsunntak, ikke et permanent unntak. Det bør stå tydelig i PR-en.

## Anbefalte forbedringer
- Kjør spillene fra et annet opphav enn testsiden, for eksempel en egen port eller `localhost` mot `127.0.0.1`, eller med `sandbox="allow-scripts allow-same-origin"` uten `allow-top-navigation`. Hvis samme opphav beholdes, må testsiden måle via CDP i stedet for i den samme JS-verdenen. Dette er den varige rettingen av funn 1 og 2. Regexskanningen kan da bli et varsel.
- La kjor.mjs kontrollere at toppsiden fortsatt er `/test/?auto…`, for eksempel med `Page.frameNavigated` på hovedrammen. Hvis toppsiden har navigert bort, skal resultatet avvises.
- Legg til negative tester for navigasjon til `_top`, tilgang til parent via alias eller sammensatte navn, og skript lagt i `qa/` eller `.claude/`.
- Gjør unntaket i funn 3 eksakt, og gi scenariospillet i sikkerhetssuiten et navn som ikke kan kollidere, for eksempel et tilfeldig suffiks.

## Kontroller som ikke kunne utføres
- Kjøring i GitHub Actions: workflow_run, artefakt og status er ikke testet herfra. Om main sin gamle sjekk faktisk stopper PR-et, er bare kodelest.
- Statistikksuiten (test/statistikk/) er «ikke innført», fordi filen ikke finnes her eller på main. ST1–ST8 er derfor ikke kjørt. Dette er ikke berørt av endringen.
- UI-suiten er «ikke innført» og ikke relevant.
- Spillkrav som krever faktisk enhet (E) eller Even (V), er ikke relevante, fordi ingen spillkode er endret.
- Om headless Chrome på Linux i Actions tillater navigasjon til `_top` på samme måte som Chrome på Windows, er ikke testet. Det er sannsynlig, fordi rammen har samme opphav.

## Klar for testing hos Even?
JA MED FORBEHOLD – ingen spill er endret, og F1 er testet og grønt for alle fire spill. Endringen i testoppsettet oppfyller likevel ikke punkt 4 (funn 1 og 2 er verifisert). Eieren bør ikke godkjenne den før spillene er skilt fra testsidens opphav, eller toppnavigasjon blir avvist.
