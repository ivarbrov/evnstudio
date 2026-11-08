# EVN Game QA: felles testverktøy (ingen spill), gren kvalitet/automatisk-spillregistrering
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1a8448e6034a4f21b08a93d3ba100e1f01c7241e
Testkvittering: evn1 commit=1a8448e6034a4f21b08a93d3ba100e1f01c7241e tester=d6191fb6ba63 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: høy – Endringen gjelder felles testverktøy, publiseringssjekken og GitHub Actions. Det er sikkerhetskontrollen for alle spill. Fullt nivå trengs ikke, fordi ingen spillversjon foreslås publisert. `git diff origin/main HEAD -- spill/ index.html statistikk.js ecoins/ bilder/` er tom.
Testet: Linux, Node 22.23.4, Chromium uten skjerm via `test/kjor.mjs`. Røyktesten bruker 1024×700 og syntetiske klikk via CDP i en isolert verden. Jeg kjørte `node test/kjor.mjs --base origin/main`, `node test/publiseringssjekk.test.mjs` og `node test/manipulering.test.mjs` fra repoets rot. I tillegg kjørte jeg testene fra main (`git archive origin/main`, utpakket i /tmp) og sammenlignet radene med grenen. Resten er kodelesing av diffen mot main og mot c289789.

## Oppfylte krav
Alle fem spill er kjørt automatisk på denne commiten: dyrepatruljen 0.11.6, eventyrspill 0.21.4, fiskespillet 0.9.3, magiske-egg 0.9.0 og morkeskogen 2.0.7. Resultatet ble 86 OK, 0 FEIL, 0 VARSEL og 2 ikke innført.
- **F1** (start, pause, fortsett), **K1** (404, ufangede feil, nettleserfeil), **U1/K3** (versjon på startkortet), **S1** (CSP, domener, eksterne filer, eval) og **T3** (zoom): OK for alle fem spill i `statisk` og `royk`.
- **Magiske egg testes minst like strengt som på main:**
  - Main oppga `{ id: 'magiske-egg', start: 'startBtn' }`. Nå brukes standarden `#startBtn`. Spillet har ingen `evn-test.json` og står ikke i `OPPSETT`.
  - Spillet har 13 rader både på main og på grenen, med de samme kontroll-ID-ene og samme status (OK).
  - Den eneste forskjellen mellom main og grenen for alle spill er teksten i navnet på K1-feil.
  - K1-404 er strengere enn før. Fallbacken til «info» når statuskode mangler, er fjernet.
  - Ufangede feil fanges nå også av debuggeren.
  - Hvert spill kjøres i en egen fane med egen opprinnelse.
  - Publiseringssjekken krever i tillegg at alle `PAKREVDE_KONTROLLER` finnes for hvert spill i git. Det kravet fantes ikke på main.
- **Ingen kontroll er svekket sammenlignet med main:**
  - Ingen rad finnes bare på main.
  - Kontrollen av endringer i `test/` og `.github/` er beholdt og strammet inn med `--no-renames` (N4b).
  - `kvalitet.yml` har bare fått to nye steg.
  - `publisering.yml` er uendret.
  - `KJENTE` er tom både på main og på grenen.
- **Fletting av main:** `test/` og `.github/` er de samme på 1a8448e og c289789, bortsett fra kommentaren i `kjor.mjs`, `--no-renames` og N4b. Magiske egg ble registrert automatisk uten egen linje i `SPILL`.
- **Omgåelse, kontrollert ved kjøring:**
  - `publiseringssjekk.test.mjs` ga forventet utfall i 34 av 34 scenarioer, og alle 7 kontrollene av `evn-test.json` var OK. Scenarioene dekker endret og flyttet testkode (N2, N4b), en egen publiseringssjekk (N3), endret oppsett (N4, N18–N20), endret Actions (N5) og manipulert resultat (N6–N13b). De dekker også et spill fra main som er fjernet eller har fått nytt navn (N7, N22).
  - `manipulering.test.mjs` ga forventet utfall i 15 av 15 kontroller. Testen dekker forfalsket resultat, skjulte feil, spill som henger, omdirigering, lokkeside og service worker.
- **K3 og dokumentasjon:** ENDRINGSLOGG beskriver endringen, og tallet «34 scenarioer» stemmer med kjøringen. Arbeidsflyt.md stemmer med koden.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Mulig problem (latent, fantes før på main):** Publiseringssjekken sammenligner med merge-base, ikke med siste commit på main.
  - `const mb = git('merge-base', BASE, REF)` brukes både til kontrollen av `test/` og `.github/` og til `KJENTE` og testoppsett «fra main».
  - En PR som bygger på en eldre main-commit, kjører derfor de eldre testene sine i Actions uten rød sjekk, fordi `test/` er uendret mot merge-base. Den får også godtatt «kjent» for funn som senere er fjernet fra `KJENTE` på main.
  - Dette kan ikke utnyttes i dag. Eldre commits mangler `spill` i resultatfilen, så de avvises av N11, og `KJENTE` er tom.
  - Svakheten oppstår først når main senere strammer inn testene eller fjerner et kjent funn.
  - Slik avgjøres det: lag et scenario i `publiseringssjekk.test.mjs` der main får en ny commit i `test/index.html` etter at PR-grenen er laget. Sjekk også om grenregelen for `main` krever at grenen er oppdatert («Require branches to be up to date»). Det kunne jeg ikke kontrollere herfra.

## Anbefalte forbedringer
- La publiseringssjekken kreve at `test/` og `.github/` på REF er lik `BASE` (main), ikke bare uendret mot merge-base. Les `KJENTE` fra `BASE`, og legg til et negativt scenario for dette.
- Et spill lagt inn som git-submodul under `spill/` blir ikke funnet av `ls-tree`. Det blir da verken testet eller krevd. Vurder å avvise submoduler under `spill/` i publiseringssjekken. Dette er ikke en svekkelse sammenlignet med main.
- Restrisikoene står allerede i arbeidsflyt.md: et spill som oppdager at det testes, `evn-test.json` som peker mot en lokkeknapp, og felles kode (`ecoins/`, `statistikk.js`) i testsidens opprinnelse. De håndteres fortsatt av full QA av nye spill og av eieren.

## Kontroller som ikke kunne utføres
- **GitHub Actions og grenregler:** Kjøringen i Actions og om «QA før publisering» faktisk blir satt, er ikke testet herfra. Grenregelen for `main` er ikke lest. Ved PR må testkvitteringen sammenlignes med Actions.
- **ST1–ST8:** Ikke kjørt. `statistikk.js` og spillenes start og pause er uendret. Suiten `statistikk` er «ikke innført», fordi `test/statistikk/index.html` mangler både her og på main.
- **UI1–UI10:** Ikke relevant. `prototype/ui/` finnes ikke.
- **Kjøretidskrav utover røyktesten:** Lagring, mobilstørrelser, tastatur og fokus, lyd, Y1/Y2, ekte berøring (E) og spillopplevelse (V) er ikke testet. Spillkoden er uendret, så disse ble ikke valgt på dette nivået.
- **Første kjøring på merge-commiten i Actions:** Kan bare bekreftes når PR-en kjøres.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen spill er endret. Alle automatiske tester og de negative testene gir forventet resultat på 1a8448e, og Magiske egg testes minst like strengt som på main. Forbeholdet er at Actions og grenreglene ikke er kontrollert herfra, og at sammenligningen med merge-base bør strammes inn før testene på main gjøres strengere.
