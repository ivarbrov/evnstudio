# EVN Game QA: Mørkeskogen 2.0.6
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit b69be0ecd2c4e03bae681eac453b6a44860f3363
Testkvittering: evn1 commit=b69be0ecd2c4e03bae681eac453b6a44860f3363 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Rapporten er en ny kontroll etter at main (PR #52) er flettet inn. Mørkeskogens kode er uendret siden 6d4fb86.
Testet: Statisk kontroll med `git diff` og `git log` på b69be0e. Kvitteringen over er utviklerens (`/tmp/kjor206f.log`, kjørt alene). QA har ikke kjørt `test/kjor.mjs` på nytt, fordi tidsrammen var 10 minutter. Kjøretidsresultatene er overført fra 6d4fb86 og 81accc2: Playwright med Chromium headless (SwiftShader, ingen GPU), port 8798, stoppet.

Hva er kontrollert på hvilken commit:
- **b69be0e:**
  - **[nytt]** `git diff 6d4fb86 b69be0e -- spill/morkeskogen` er tom.
  - **[nytt]** Deltaet 6d4fb86..b69be0e inneholder:
    - `spill/eventyrspill/index.html` og `sw.js`
    - `spill/fiskespillet/index.html`
    - seks `bilder/robot-start-*.webp`
    - tre QA-rapporter for robot v2 og QA-rapporten for 6d4fb86
    - én rad i `ENDRINGSLOGG.md`
  - **[nytt]** `robot-start-*` brukes bare av Dyrepatruljen, Fiskespillet og Era Defenders, ikke av Mørkeskogen (grep).
  - **[nytt]** `origin/main` er en forfar til b69be0e. `git diff origin/main b69be0e` rører bare Mørkeskogen, ENDRINGSLOGG og Mørkeskogens QA-rapporter.
  - **[nytt]** K3: I `ENDRINGSLOGG.md` står 2.0.6-raden øverst, og deretter main sin robot v2-rad (PR #52). 2.0.5-raden har «ca. 07:00 (PR #55, c016515)». Mot main er det bare lagt til 2.0.6-raden og endret datoteksten for 2.0.5. Ingen av main sine rader har falt ut.
- **Overført fra 6d4fb86**, med koden for Mørkeskogen byte-lik: alt annet nedenfor. Det som er merket [6d4fb86], ble kontrollert på 6d4fb86. Det som ikke er merket, er overført fra 81accc2 eller tidligere, slik det står i rapporten for 6d4fb86.

## Oppfylte krav
- **[nytt] K3 og avgrensning:** Se over. Flettingen endrer ikke Mørkeskogen. Versjonen er fortsatt 2.0.6.
- **[nytt] K1, S1, F1 (røyktest), S2 og S3 for alle spill:** Utviklerens kvittering på b69be0e er `statisk=ok royk=ok ecoins=ok`. Den er ikke kjørt av QA.

- **[6d4fb86] F1, mulig problem 1 fra 81accc2 er rettet (kodelest):** Ved temming settes nå både `a.hp` og `a.max` til `A.hp`. Livslinja (`a.hp < (a.max || A.hp)`, delt på `a.max`) viser da riktig andel for tamme dyr. Et kjæledyr som slippes fri, beholder `max = A.hp`. Endringen berører ikke ville dyr, skade eller XP. Den er ikke kjørt med lasso.
- **[6d4fb86] K1, K3, S1 og F1 (røyktest):** `test/kjor.mjs` er kjørt av QA på 6d4fb86, se kvitteringen.

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

(Punktene over uten [6d4fb86] er overført fra 81accc2.)

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- Mulig problem 1 fra 81accc2 (livslinja for tamme rovdyr) er rettet i 6d4fb86, se over.
- **Mulig problem 2, testmetoden (overført):** Målt skade utenfor leiren natt 4 var 5,08 HP/s, mens ventet verdi er 15. `rovSkade()` returnerte likevel 1,0.
  - Det samme mønsteret ble sett i forrige kontroll: senere scenarier i samme side gir mindre spilltid. Dette tyder på testoppsettet (headless og `setInterval`), ikke spillet.
  - Full skade fra natt 4 er derfor bare kodelest og verdikontrollert, ikke målt.

## Anbefalte forbedringer
- **[nytt]** Datoteksten i robot v2-raden fra main sier fortsatt «publiseres ved sammenslåing av PR #52», men PR #52 er slått sammen. Raden kommer fra main og er ikke en feil i denne grenen. Den bør få publiseringstiden ved neste rettelse av endringsloggen.
- Skilt-linja i `lagSkilt` har to kommentarer etter hverandre («… ikke ved togsporet // ikke i leiren, og ikke flere skilt i klump»). Rydd den ved neste endring.
- **Balanse, ikke kontrollert (V):** Ved natt 0 gir rovdyr med halvt liv full XP, fullt kjøtt og fulle skinn. Det gjør tidlig jakt lettere. XP-reduksjonen per dag (`xpKills`) begrenser farming. Om dette er ønsket, avgjør Even eller Ivar.

## Kontroller som ikke kunne utføres
- **Skilt ved togsporet** (`trackDist < 90`, rettet mulig problem 3): Kun kodelest på 81accc2. Verden- og skiltskriptet er ikke kjørt på nytt.
- **Temming og drap med de nye tallene:** Kun kodelest (rettingen i 6d4fb86 er ikke kjørt med lasso).
- **ST1–ST8 (overført fra 6d4fb86; `statistikk.js` og startkoden er uendret):** `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). `statistikk.js` og startkoden er uendret. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
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
- **`test/kjor.mjs` på b69be0e:** Ikke kjørt av QA. Kvitteringen er utviklerens. QA kjørte den sist på 6d4fb86, med samme Mørkeskogen-kode.
- **Lånte tester:** Utviklerens `/tmp/t205/styrke.js` er ikke brukt.
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Mørkeskogen er byte-lik med 6d4fb86, og flettingen fra main rører ikke spillet. Endringsloggen er riktig. Forbeholdene er de samme som før: temming med lasso og full skade fra natt 4 er ikke målt, og statistikken er ikke testet.
