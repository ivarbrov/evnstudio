# EVN Game QA: Mørkeskogen 2.0.2
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 7d6ec26649adc154d42769fa061b7dc646a48cf6
Testkvittering: evn1 commit=7d6ec26649adc154d42769fa061b7dc646a48cf6 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om det, og versjonen skal foreslås publisert. Selve endringen hører til nivå liten (fast tekst i ett spill, uten logikk).
Testet: Linux-container uten GPU. Google Chrome via Playwright med SwiftShader og egen server på 127.0.0.1:8873.
- `node test/kjor.mjs --base origin/main`: 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3), 2 ikke innført (statistikk, ui).
- **Kortet alene:** de tunge skriptene ble blokkert med `page.route`. `#overScreen` ble vist direkte med den lengste dødsårsaken, og fokus ble satt med `.focus()`, slik `gameOver()` gjør. Målt i 1280×800, 375×812, 320×568, 844×390, 740×360 og 568×320, med skjermbilde i hver størrelse og ekte Tab.
- **Hele spillet i 1280×800:** spill.js ble levert fra minnet med testkroken `window.__qa` lagt til på slutten. Repoet er ikke endret. Først ble det lagt inn lagring i formatet fra 2.0.0 (v1). Deretter: Start med ekte museklikk, ressurser, fisk, øks, sekk, bålnivå og et tamt dyr satt, game over, ekte Tab, «Prøv igjen» med ekte Enter, kontroll av `g` og `hero`, omlasting og til slutt ødelagt lagring med ny omlasting.
- `localStorage` ble tømt før og etter. Serveren er stoppet, port 8873 er fri, og arbeidstreet er rent.

**Teksten kontrollert mot spill.js** (spill.js er byte-lik med main):
- **Beholder:**
  - «nivå» er `hero.xp`, lagret med `saveHero()` ved hver XP-økning (linje 93).
  - «våpen» er `owned`, `sel` og `wlvl`.
  - «oppdrag» er `qdone` og `qprog`.
  - «fiskeboka» er `hero.fishBook`.
  - Alle disse ligger i `mork3d.helt` (`HERO_NEW`, `saveHero`).
  - «byggene dine» er `world.buildings` i `mork3d.verden`. De lagres med `saveWorld()` når noe bygges (linje 1250), og `newGame()` laster dem inn igjen. Jeg fant ingen kode som fjerner bygg under spilling. Bare «Ny verden» sletter dem, og den spør først.
- **Mister:** «Prøv igjen» kaller `start()`, så `newGame()` og så `newGameGen()`, som lager `g` på nytt (linje 1156). Det nullstiller:
  - `wood`, `stone`, `iron` og `skin` (ved, stein, jern, skinn)
  - `raw` og `cooked` (mat)
  - `fish` (fisk)
  - `axe` (den bedre øksa; vanlig øks ligger i `hero.owned` og beholdes)
  - `sack` (sekken)
  - `fireLvl` (settes til 1; bålnivået)
  - `animals` og `pets` (tamme dyr; `pets = []` i `lassoSetup`)
- **Bekreftet ved kjøring:** etter «Prøv igjen» var alle feltene over 0, `fireLvl` var 1, og det var 0 tamme dyr. `hero` var byte-lik den før døden, og byggene var 1 av 1.
- **Konklusjon:** alle tolv punkter teksten nevner, stemmer med koden. De to manglene fra forrige kontroll (skinn og fisk, og «øksa du har laget») er rettet.

**Diff mot main:** `git diff --name-only origin/main HEAD` gir `ENDRINGSLOGG.md`, `spill/morkeskogen/index.html` og `qa/rapporter/2026-11-04-morkeskogen-9b80b18.md`. Den siste er bare den forrige QA-rapporten. Ingen spillkode er endret utenom index.html. `spill.js`, `hud2.*`, `statistikk.js`, `test/` og `.claude/` er uendret. Merge-basen er ff61022, som er lik origin/main.

## Oppfylte krav
- **F1** – Oppfylt for det som er testet:
  - Røyktesten viser at Start, pause og fortsett virker.
  - I hele spillet virket Start med ekte klikk, og game over viste kortet med teksten.
  - Ekte Enter på «Prøv igjen» startet en ny runde: `state` ble `play`, og `#overScreen` ble skjult.
- **F2** – Oppfylt for omlasting. Etter omlasting var `mork3d.helt` og `mork3d.verden` uendret, `hero` i minnet var lik lagringen, og bygget sto der. At nullstilling krever bekreftelse, er bare kodelest (se under).
- **F3** – Oppfylt:
  - En lagring i v1-formatet fra 2.0.0 ble lastet uendret (våpen, våpennivå, XP, oppdrag, fiskebok og bygg).
  - Med ødelagt JSON i både `mork3d.helt` og `mork3d.verden` kom startkortet fram, uten feil, og `hero` falt tilbake til `HERO_NEW`.
- **U1** – Oppfylt. Startkortet viser «Versjon 2.0.2 · 3D» (røyktest og egen kjøring). Resten av startkortet er uendret fra main.
- **T1** – Oppfylt for game over-kortet (emulert). «Prøv igjen» er 49 px høy og 240–440 px bred i alle seks størrelsene.
- **T3** – Oppfylt. Den statiske suiten viser at zoom ikke er sperret (`width=device-width, initial-scale=1, viewport-fit=cover`). At `prefers-reduced-motion` respekteres, er kodelest og er uendret fra main.
- **T4** – Oppfylt for det nye avsnittet. Tap og behold vises med både ✅/❌ og ord. Teksten er rgb(243,234,214) på rgb(19,32,26), som gir omtrent 14:1 (beregnet). Kontrasten i resten av spillet er ikke målt.
- **K1** – Oppfylt. Røyktesten fant ingen 404-er, ufangede feil eller CSP-brudd. I hele spillet var det ingen `pageerror`, ingen konsollfeil, ingen status 400 eller høyere og ingen forespørsler til andre domener.
- **K3** – Oppfylt. Startkortet viser 2.0.2, og ENDRINGSLOGG.md har en rad for 2.0.2 med den nye teksten ordrett. Se også mulig problem om 2.0.1 under.
- **S1** – Oppfylt. Alle fire statiske S1-kontroller er OK. Den nye `style`-attributten er tillatt av CSP-en, og stilen brukes (font-size 14,72 px målt). CSP-en er uendret.
- **S2** – Oppfylt. Ingen konto, kjøp eller reklame, og ingen forespørsler ut av siden.
- **S3** – Oppfylt. Spillet har ingen fritekst, og det nye avsnittet er fast tekst.
- **S4** – Oppfylt (statisk). Personvern- og sikkerhetssidene er uendret, og endringen påvirker ikke hvilke data spillet lagrer eller sender.
- **B4** – Oppfylt for endringen (Q). Teksten er nøytral og ikke skremmende. Vurderingen hos Even står under.
- **Kortet i alle størrelsene:**
  - Ingen sideveis rulling og ingen overflyt i kortet.
  - «Prøv igjen» er helt synlig, og `document.activeElement` er `againBtn` i alle seks størrelsene.
  - Overlegget ruller 0 px i 1280×800, 375×812, 320×568 og 844×390, 27 px i 740×360 og 67 px i 568×320.
  - Avsnittet bruker 3 linjer i bred visning, 5 i 375×812 og 6 i 320×568.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 – Verifisert feil, kjent fra forrige rapport og fra main, ikke laget av denne endringen.** Tab går ut av game over-kortet. I hele spillet ga ekte Tab fra «Prøv igjen» denne rekkefølgen: `BODY` (utenfor kortet), `h2Hjelp` (utenfor), `againBtn`, `BODY`, `h2Hjelp`. Slik gjenskapes det: dø, og trykk Tab to ganger. Dette er samme type feil som det kjente T2-funnet for pausekortet.
- **K2 – Kjent funn, ikke rettet (kodelest).** Det finnes ingen global feilfanger.
- **B1 – Kjent funn, ikke rettet (kodelest).** Spillet har ingen lydbryter.
- **B3 – Kjent funn, ikke testet på nytt.** Tapt WebGL er ikke håndtert. spill.js er uendret.
- **ST1, ST2, ST5, ST7 og ST8 – Kjente systemiske avvik, uendret.**
  - `statistikk.js` lastes ikke i `&lt;head&gt;`, og spillet sender ikke `evn-start`.
  - Spillet bruker ikke EVN-PAUSE v3 og har ingen `EVNAktivTid`.
  - `versjon-morkeskogen-2.0.2` sendes ikke.
  - `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`).
- **K3 – Mulig problem, uendret siden forrige rapport.** Grenen `origin/ui/morkeskogen-trinn2` (44a6e67) bruker allerede «Versjon 2.0.1» og endrer også `#overScreen` og versjonslinja. Hvis den slås sammen etter denne, kan versjonen gå bakover, og det blir trolig konflikt i de samme linjene. En voksen må avgjøre rekkefølgen og hvilket nummer hver gren skal ha.

## Anbefalte forbedringer
- Behold-listen kan også nevne lassodelene, ryddede etasjer i Beinslottet og kartet. Alle lagres. Dette er ikke feil, bare ufullstendig.
- I 568×320 starter kortet 9 px over toppen når fokus settes, så toppen av «Åh nei!» er kuttet til spilleren ruller. Knappen er synlig. Avsnittet øker høyden på kortet, så dette er litt verre enn på main.
- I hele spillet (etter museklikk) vises ingen fokusring på «Prøv igjen» etter `.focus()`. I kortet alene, uten museklikk før, vises den. Tastaturbrukere som har brukt mus, ser derfor ikke hvor fokus er.

## Kontroller som ikke kunne utføres
- **F1 (del):** Døden kom ikke gjennom spill-løkka. `g.hp = 0` ga ikke game over innen 180 s under SwiftShader, så `gameOver()` ble kalt direkte via testkroken. Selve kortet, «Prøv igjen» og den nye runden er kjørt. Gange, natt, kamp, bygging, fiske og «Avslutt» er ikke spilt.
- **F2 (del):** At nullstillingen krever bekreftelse (`EVNNullstill`), er bare kodelest.
- **F3 (del):** Det er ikke kontrollert om den ødelagte lagringen beholdes eller overskrives ved neste lagring.
- **Game over på mobil:** I 375×812, 320×568, 844×390, 740×360 og 568×320 er bare kortet alene målt, uten hud2.js. Hele spillet er bare kjørt i 1280×800.
- **U2 og U3 (V):** Om barn forstår «beholder» og «mister», og om tap av øks og sekk føles straffende, må Even vurdere. Endringsloggen sier selv at dette skal vurderes senere.
- **B4 (V):** Om innholdet passer for 7-åringer, må Even vurdere.
- **T1 og T3 (E):** Ingen test på faktisk enhet. Mobilstørrelsene er emulert.
- **Y1 (E):** Ikke testet. Ingen referansemobil er valgt.
- **Y2:** Bare kodelest. spill.js er uendret.
- **B1 (E):** Lyden er ikke hørt.
- **B2:** Kartet er ikke testet på denne commiten.
- **B3:** Spillet uten WebGL er ikke testet på nytt.
- **ST3 og ST6:** Bare kodelest. `statistikk.js` er uendret.
- **ST4:** Ikke testet, fordi testsiden mangler.
- **Visning i GoatCounter:** Om hendelsene kommer frem etter publisering, krever en voksen med innlogging.
- **UI1–UI10:** Ikke gjeldende for spillet (godkjent hovedløsning, ikke tatt i bruk). Ikke målt.
- **Klarspråk:** Avsnittet har status forslag og er ikke vurdert som krav.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. Teksten stemmer nå med det spill.js lagrer og nullstiller, og «Prøv igjen» er synlig og har fokus i alle seks størrelsene. Døden er ikke kjørt gjennom spill-løkka, ingenting er testet på faktisk enhet, og den kjente T2-feilen gjelder også dette kortet.
