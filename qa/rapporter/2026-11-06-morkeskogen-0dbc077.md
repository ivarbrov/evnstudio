# EVN Game QA: Mørkeskogen 2.0.5
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 0dbc07782e57517525bf8d7903c0e7d65a18eb3a
Testkvittering: evn1 commit=0dbc07782e57517525bf8d7903c0e7d65a18eb3a tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Endringene gjelder lagringsformat (rensing), feilhåndtering i spilløkka og HUD-fletting.
Testet: Lokal server (127.0.0.1:8798, og 8799 med `git archive origin/main` for sammenligning med 2.0.3). Playwright med Chromium headless og SwiftShader (ingen GPU). Størrelser: 1280×800, 1024×640, 375×812, 390×844, 320×568, 740×360 og 568×320 (emulert berøring). Tastetrykk er ekte tastetrykk fra Playwright. Klikk er dels Playwright-klikk og dels syntetiske `click()`. Krokene er lagt inn i `spill.js` via ruting, og `renderer.render` er slått av under kjøring. `statistikk.js` er rutet til en tom fil. Testkvitteringen er kjørt på nytt av QA og er identisk med utviklerens (`/tmp/kjor205.log`). Lånte resultater er merket «(lånt)».

## Oppfylte krav
- **F1:** Start og spilløkka går. Sekken (I), kartet (M), pause (P) og fortsett (Esc) virker, og spillet står stille i sekk, kart og pause. Røyktesten er OK. Se også mulig problem 2 under.
- **F2:** Gyldig lagring overlever innlasting (sammenlignet med 2.0.3). «Start helt på nytt» krever bekreftelse, og fokus står på «Nei, behold alt».
- **F3:** Kontrollert ved innlasting, i 2.0.3 og 2.0.5 side om side:
  - Gyldig 5.6.2/2.0.3-lagring er byte-lik i begge, både helt og verden med bygninger.
  - Feil innhold (`qdone:null`, `xp:'mye'`, `sel:42`, ugyldige `wlvl`/`qprog`, `fishBook:5`, `seed:'tull'`) renses uten feil.
  - `buildings` som objekt gir en ufanget feil i 2.0.3 og ingen i 2.0.5. Ugyldige bygninger filtreres bort, gyldige beholdes.
  - Uleselig JSON gir ny helt og kopi i `mork3d.helt.kopi`.
- **K2:** Uten WebGL vises en melding. Feil i spilløkka gir kortet «Oi! Spillet stoppet» med «Last på nytt» (lånt: utviklerens test C1, ikke gjenskapt av QA). Koden for tapt kontekst er lest.
- **K3:** Versjon 2.0.5 står på startkortet (røyktest), og ENDRINGSLOGG har en rad. Raden stemmer med diffen.
- **K1:** Ingen ufangede feil eller 404 i røyktesten, og ingen i QA-kjøringene i 2.0.5 (sekk, kart, pause, Avslutt, ugyldig lagring og ingen WebGL).
- **B2:** M åpner det felles kartet, og `g.time` står stille. Kartet bruker tilstanden `pause`, ikke `map`, og det er riktig.
- **B3 (melding):** Når `getContext('webgl*')` gir `null`, vises `#no3d` med 3D-teksten. Start er skjult, «Tilbake til EVN Studio» er synlig, Enter og mellomrom gjør ingenting, og det kommer ingen feil.
- **T1:** Ingen trykkflater under 44×44 px og ingen knapper utenfor skjermen i noen av de 7 størrelsene. Avslutt er 44×44 (✕) på berøring og 98×44 («✕ Avslutt») på PC.
- **T2 (endringen fra #49):** Tab åpner ikke lenger sekken. Fokus går til toppraden, I virker som før, og Avslutt-dialogen gir fokus på «Nei, spill videre». Se kjent funn under.
- **T3:** Viewport uten zoomsperre (statisk test).
- **U1:** Startkortet har mål, styring, versjon, «Tilbake til EVN Studio» og «Start helt på nytt».
- **U2:** «Slik styrer du» i pausen viser den nye PC-teksten («Første klikk: musa styrer kameraet …»), og ❓ er synlig.
- **S1:** CSP uten eval og uten nye domener (statisk test). Diffen legger ikke til eksterne domener.
- **S2, S3:** Diffen har ingen ny innsamling, fritekst eller konto. `console.error` i `visFeil` sender ikke noe ut.
- **Flettingen av #49 og #51:**
  - Høykant 375×812 og 390×844: ingen overlapp.
  - Liggende 740×360: ingen overlapp.
  - PC 1280×800 og 1024×640: ingen overlapp.
  - Avslutt er synlig ytterst til høyre i toppraden i alle størrelser.
  - Styrespaken følger med når skjermen snus (ny lytter). Med 2.0.3 ble den liggende utenfor skjermen etter størrelsesbytte.
  - Skjermbilder: `/tmp/qa205/hud-*.png`.
- **Spillmekanikk:** Diffen i `spill.js` er bare forsvarskode (heltrens, verdenrens, `draw`/`loop`-try, `visFeil`, WebGL-sjekk, lyttere og nøkkelen `.kopi` i EVNNullstill) og `joyIdle`-plasseringen. Ingen endringer i balanse, oppdrag eller lagringsnøkler.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet til `BODY`, deretter til ❓, Avslutt og ✕ i HUD-en og tilbake. Atferden er identisk med 2.0.3. Mørkeskogen har ingen Tab-felle i EVN-PAUSE. «Oi! Spillet stoppet» (`role=alertdialog`, `aria-modal`) har heller ingen Tab-felle (kodelest), så fokus kan gå til knappene bak.
- **Mulig problem 1:** Etter at kartet (M) er åpnet og lukket, slutter `requestAnimationFrame` å kjøres i headless Chromium med SwiftShader. Spillet står da i `play`, men `g.time` står stille.
  - Gjenskapes slik: start, trykk M, trykk M igjen, og vent (`/tmp/qa205/probe.js`).
  - Det samme skjer i 2.0.3 (full `origin/main`). Det er altså ikke en regresjon, og det er trolig en svakhet i testmiljøet (kartcanvas eller SwiftShader).
  - For å avgjøre det: test kart og lukk på ekte PC og mobil.
- **Mulig problem 2:** `unhandledrejection` under spilling viser feilkortet uansett kilde, også for avvisninger som ikke kommer fra spillets egne filer. `error`-lytteren er avgrenset til `/spill/morkeskogen/`, men denne er ikke det. Pointer lock og Promise-kall i `spill.js` er fanget. Andre kilder, som utvidelser og `statistikk.js`, er ikke kontrollert. Bør vurderes avgrenset på samme måte.

## Anbefalte forbedringer
- Liggende 568×320: hintet og våpenlinja dekker 🔨 (Bygg) delvis (19×28 og 14×10 px). Det samme er målt i 2.0.3, så det er ikke en regresjon.
- 320×568 høykant: hvileringen til styrespaken går 6 px inn under Hopp etter at skjermstørrelsen er endret. Ringen er ikke en knapp.
- Høykant: «🌲 Sko…» kuttes i dagfeltet.
- `wlvl` klemmes til `WUP_MAX + 1` (4), men nivået kan i spillet bare nå 3. Det har ingen betydning for gyldige lagringer.
- `mork3d.helt.kopi` skrives bare første gang. En ny ødelagt lagring overskriver ikke en gammel kopi. Det er greit, men bør nevnes i ENDRINGSLOGG.
- Utviklerens egen logg `/tmp/t205/log` viser «FEIL E1 5.6.2-lagring uendret». Loggen er fra 00:09, før committen kl. 00:22. Testen brukte våpen- og oppdrags-ID-er som ikke finnes. QA fant at gyldig lagring er uendret, men utvikleren bør kjøre testen sin på nytt og forklare resultatet.

## Kontroller som ikke kunne utføres
- **K2 feil i spilløkka (gjenskaping av QA):** Testen stoppet før dette trinnet, fordi rAF stoppet etter kartet (se mulig problem 1). Resultatet er lånt fra utviklerens C1. Status: kun kodelest av QA.
- **B3/K2 tapt WebGL-kontekst (`webglcontextlost`):** QA-testen ble ikke ferdig innen tidsrammen. Status: kun kodelest.
- **«Start helt på nytt» sletter `mork3d.helt.kopi`:** Dialogen og bekreftelsen er testet. Omlastingen etter «Ja, slett alt» ble ikke ferdig innen tidsrammen. At nøkkelen ligger i `nokler`, er kodelest.
- **F3 med `v:2`-lagring** (eldre eller ukjent versjon blir kopiert): ikke kjørt. Kun kodelest.
- **Lagring etter spilling og ny innlasting under spilling (F2), Avslutt etter tap (game over-kortet):** ikke kjørt i denne kontrollen. Game over-kortet er testet i QA av 2.0.2.
- **ST1–ST8:** `test/statistikk/` finnes ikke på grenen eller på main (`statistikk=ikke-innfort`). ST1 er statisk sett (`statistikk.js` med `data-spill="morkeskogen"` er uendret). ST2–ST8 er ikke testet. Om hendelsene kommer fram i GoatCounter, krever en voksen med innlogging.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen. `ui=ikke-innfort`. Kontrolleres ikke.
- **Y1** (referansemobil er ikke valgt, ingen GPU) og **Y2** (fanebytte og skjermfrekvens): ikke testet.
- **B1** (lydbryter, kjent funn) og **B4** (innhold for 7-åringer, V): ikke testet i denne kontrollen.
- **B3 (lavere grafikk på svake enheter), T1, T3 og UI på ekte berøring (E):** krever test på enhet.
- **U3, T4 og S4:** ikke testet i denne kontrollen. Diffen endrer ikke disse delene utover nye tekster, som er på enkel norsk.
- **Evens spilltest (V):** ikke del av QA.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil, og gyldige lagringer og flettingen av #49 og #51 er kontrollert uten regresjoner. K2 i spilløkka, tapt WebGL-kontekst, sletting av kopien ved nullstilling og statistikken er ikke gjenskapt av QA og må kontrolleres før publisering.
