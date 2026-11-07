# EVN Game QA: Mørkeskogen 2.0.6
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 81accc22028e8feec750695e1e4c02331e215caa
Testkvittering: evn1 commit=81accc22028e8feec750695e1e4c02331e215caa tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og balansen er endret (rovdyrstyrke per natt). Denne kontrollen kommer etter rettingene av mulige problemer 1 og 3 i rapporten for 4c7721d.
Testet: Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright med Chromium headless (SwiftShader, ingen GPU) i 800×500. Kroker er lagt inn ved å rute `spill.js`. Alle tall er headless-målinger.

Hva er kontrollert på hvilken commit:
- **81accc2:**
  - Deltaet `git diff 4c7721d 81accc2`, lest i sin helhet: `spill.js` (4 steder), `ENDRINGSLOGG.md` og QA-rapporten for 4c7721d. `index.html` er uendret.
  - `test/kjor.mjs` er kjørt alene av QA og ga kvitteringen over, uten FEIL eller VARSEL.
  - QA-skriptet `/tmp/qa206/styrke.js`: skade i og utenfor leiren, og liv ved fødsel for nettene 0, 1, 2, 4 og 7.
- **Overført fra 4c7721d:**
  - Samme frø gir samme verden. Deltaet bruker ingen nye tilfeldige tall, og `rovLiv` er deterministisk.
  - Skiltenes plassering, retning og tegnekall.
  - At rovdyr går ut av leiren, ikke oppstår innenfor 760, og at leiren ikke gjelder når bålet er slukket. Den logikken er uendret.
  - Nattmonstrene.
- **Overført fra bd81266**, der innholdet er byte-likt: lagring (F2/F3), B2, B3, T1, T2, U1 og U2.

## Oppfylte krav
- **F1, rettet mulig problem 1 (berøringsskade i leiren):**
  - Spilleren står 350 fra bålet, og ulven holdes fast 8 unna i 3 s.
  - HP-tap natt 0: 0. HP-tap natt 4: 0.
  - Utenfor leiren (1400 fra bålet) gir samme oppsett skade, se under.
- **F1, ny balanse:**
  - **Skade:** `rovSkade()` gir 0,4 natt 0 og 1,0 natt 4. Målt utenfor leiren natt 0: 5,95 HP/s. Det stemmer med ulvens 15 × 0,4 = 6.
  - **Liv ved fødsel:** 600 dyr per natt og 3000 totalt. Ingen avvik fra `max(2, round(hp·min(1, 0,5 + 0,125·netter)))`, og `a.max` er lik `a.hp`.
    - Natt 0: ulv 3/6, bjørn 6/12, moskus 8/16.
    - Natt 1: ulv 4/6.
    - Natt 2: ulv 5/6.
    - Natt 4 og 7: fullt liv for alle ni rovdyrtypene.
  - **Fredelige dyr:** 1732 opprettet, med liv lik `ANIMALS[type].hp` uten unntak. Skaleringen treffer altså bare rovdyr.
  - **Ved start** (natt 0) har rovdyrene halvt liv, for eksempel ulv 3/3 (av 6).
- **Kun kodelest, ikke kjørt:** At XP, kjøtt og skinn er uendret ved drap. `enemyXP` bruker `XP_BASE[type]`, ikke liv, og kjøtt og skinn kommer fra `A.meat` og `A.skin`.
- **Ingenting annet i spilløkka er endret.** Deltaet i `update` er bare skadelinja (`!iLeir(p.x, p.y)` og `* rovSkade()`). `spawnAnimal` er det eneste stedet dyr lages.
- **K1:** Ingen sidefeil eller konsollfeil i QA-kjøringen. Røyktesten i `kjor.mjs` er OK.
- **K3:** Endringsloggen beskriver balansen, leiren og skiltene. Versjonen er 2.0.6, uendret fra 4c7721d.
- **S1, S2, S3:** `index.html` og CSP er uendret (statisk=ok). Ingen ny datainnsamling og ingen fritekst.
- **Overført fra 4c7721d:** F3 (samme frø gir samme verden, og stier, trær og bygninger er identiske med main), skiltene og ytelse headless (tegnekall ved bålet på nivå med main).
- **Overført fra bd81266:** F2, F3 (lagring fra 5.6.2, rensing, kopi), B2, B3 (melding uten WebGL), T1, U1 og U2.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **Mulig problem 1, livslinja for tamme rovdyr (kodelest):**
  - Ved temming settes `a.hp = A.hp` (fullt), men `a.max` beholder det lave tallet fra fødselen. Eksempel: ulv natt 0 har `max` 3 og `hp` 6.
  - Livslinja vises da ikke før livet er under 3, og den viser 2/3 når dyret har 2 av 6.
  - Det gjelder også et kjæledyr som slippes fri (`tame = false`). Det får fullt liv, men `max` er fortsatt lav.
  - Ingen krasj og ingen tap av fremgang. Avgjøres ved å teste temming med lasso natt 0, eller rettes med `a.max = A.hp` ved temming.
- **Mulig problem 2, testmetoden:** Målt skade utenfor leiren natt 4 var 5,08 HP/s, mens ventet verdi er 15. `rovSkade()` returnerte likevel 1,0.
  - Det samme mønsteret ble sett i forrige kontroll: senere scenarier i samme side gir mindre spilltid. Dette tyder på testoppsettet (headless og `setInterval`), ikke spillet.
  - Full skade fra natt 4 er derfor bare kodelest og verdikontrollert, ikke målt.

## Anbefalte forbedringer
- Skilt-linja i `lagSkilt` har to kommentarer etter hverandre («… ikke ved togsporet // ikke i leiren, og ikke flere skilt i klump»). Rydd den ved neste endring.
- **Balanse, ikke kontrollert (V):** Ved natt 0 gir rovdyr med halvt liv full XP, fullt kjøtt og fulle skinn. Det gjør tidlig jakt lettere. XP-reduksjonen per dag (`xpKills`) begrenser farming. Om dette er ønsket, avgjør Even eller Ivar.

## Kontroller som ikke kunne utføres
- **Skilt ved togsporet** (`trackDist < 90`, rettet mulig problem 3): Kun kodelest på 81accc2. Verden- og skiltskriptet er ikke kjørt på nytt.
- **Temming og drap med de nye tallene:** Kun kodelest, se mulig problem 1.
- **ST1–ST8:** `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). `statistikk.js` og startkoden er uendret. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` med `data-spill="morkeskogen"` er uendret.
  - ST2: Ikke testet. Testsiden mangler.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen.
- **Y1 (E):** Referansemobil er ikke valgt, og det er ingen GPU.
- **Y2:** Ikke testet.
- **K2:** Overført fra bd81266 (uendret kode).
- **B1 (V):** Ikke testet.
- **B4 (V):** Ikke testet. Rovdyrene er svakere tidlig, og leiren er trygg. Vanskelighetsgraden må vurderes hos Even.
- **B3 (lavere grafikk), T1, T3 og ekte berøring (E):** Krever test på enhet.
- **U3, T4 og S4:** Ikke testet.
- **Lånte tester:** Utviklerens `/tmp/t205/styrke.js` er ikke brukt.
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Leiren gir nå ingen skade, og skaleringen treffer bare rovdyr med riktige verdier. Det gjenstår en kosmetisk feil i livslinja for tamme rovdyr, full skade fra natt 4 er ikke målt, og statistikken er ikke testet.
