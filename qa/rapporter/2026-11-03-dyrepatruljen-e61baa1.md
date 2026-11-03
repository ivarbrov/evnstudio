# EVN Game QA: Dyrepatruljen 0.10.16
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (dad89dd22b82a893b3108c031a457e7dea4ba7ba), commit e61baa112f6df2302cd1ddd911f89881c8d71529
Testkvittering: evn1 commit=e61baa112f6df2302cd1ddd911f89881c8d71529 tester=ce4104f6fbd1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort
Nivå: full – versjonen er kandidat til publisering. Selve endringen er visuell (bilde, CSS, versjon), men 0.10.14 og 0.10.15 er ikke kontrollert av EVN Game QA før. Derfor er alt kjørt på nytt på denne committen.
Testet: Linux-container, arbeidstre /home/claude/wt-dyre (rent, gren robot/dyrepatruljen). `node test/kjor.mjs --base origin/main` kjørt selv med Chromium 1243: 51 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3), 2 ikke innført. Playwright med SwiftShader-WebGL og egen Node-server på 127.0.0.1. Serveren ble stoppet i skriptene. Samme origin serverte også v0.10.3 fra origin/main (`git archive` utenfor repoet), slik at jeg fikk ekte gammel lagring. Startkortet er sammenlignet med 0.10.15 (`git archive 8973700`) i 1280×800, 375×812, 812×375, 740×360, 320×568 og 568×320. PC er testet med ekte tastetrykk og musklikk fra Playwright. Mobil er emulert (`isMobile`, `hasTouch`), med `tap` og styrespak via CDP `Input.dispatchTouchEvent`. Statistikken er testet med evnstudio.no rutet til arbeidstreet og GoatCounter (gc.zgo.at) stubbet, så ingen tellinger ble sendt. Ingen forespørsler gikk ut av localhost. Repoet er ikke endret. Egne skript og skjermbilder ligger i /home/claude/qa/dyre3.

## Oppfylte krav
- **Eiers krav: bare visuelt, ingenting fra 0.10.15 overskrevet:** 8973700 er forelder til HEAD (`merge-base --is-ancestor`). `git diff 8973700..HEAD` endrer bare `spill/dyrepatruljen/index.html` (4 linjer: CSS for `.maal img`, `<img>`, «Versjon 0.10.16» og `VERSJON`) og `ENDRINGSLOGG.md` (1 ny rad, ingen fjernet). Resten er 12 nye filer (2 WebP og `felles/robot/`). Ingen fil er slettet. `LAGRE_NOKKEL` er uendret, og det samme gjelder fangst, lagring, `statistikk.js`, personvern og sikkerhet. Endringene i 0.10.14 (fokus i dyrebok og nullstilling) og 0.10.15 (ferdigkortet etter dyreboka) virker, se T2 og F1.
- **Påstanden om roboten:** Base64-dekodet `EVN_HELT_B64` er 463 988 byte og byte for byte lik `felles/robot/helt-robot.glb` (Python `==` gir True). Materialet «Main» settes til `0xffcc00` (linje 5942), samme farge som i `felles/robot/robot-oppsett.js`.
- **Eiers krav om at startkortet ikke presses sammen:** Målt mot 0.10.15 i alle seks størrelsene:
  - Teksten har samme bredde og like mange linjer: 390 px og 4 linjer på PC og i liggende format, 213 px og 6 linjer i 375×812, 158 px og 9 linjer i 320×568.
  - Styringsboksen har samme bredde og like mange linjer (10, 13 og 14).
  - Start er like stor og bred som før: 58 px høy og 472, 295 eller 240 px bred.
  - Roboten er 70×78 px, mens gutten var 70×167. Kortet blir 74 px lavere (588 → 514 på PC). Unntaket er 320×568, der teksten bestemmer høyden og ingenting endres.
  - Ingen overlapp mellom bilde og tekst og ingen sideveis rulling.
- **F1:**
  - **Start og bevegelse:** Start åpner verdensvalget, og Gata starter. W flytter helten. En ekte håvsving med mellomrom fanget katt1, og fangsten ble lagret.
  - **Pause:** P, Esc, ⏸ og simulert fanebytte åpner pausen. Med pausen åpen står helten stille selv om W holdes nede. P, Esc og Fortsett lukker den.
  - **Fullføring:** Gata er fullført med testkroken `__dyrespill.fang`. Ferdigkortet kom, Byen ble låst opp («10 av 150», 2 åpne), og Dyreparken virker med kart og pause.
  - **Retting i 0.10.15:** Dyreboka ble åpnet med B rett etter det tiende dyret. Etter 2 s vises ferdigkortet, dyreboka er lukket, ingenting er `inert`, og «til kartet» virker.
  - **Avslutning:** «Ja, avslutt» går til `/`.
  - **Mobil:** I alle fem mobilstørrelsene virker Start, verdensvalg, styrespak, pause og Fortsett, Håv, 🔊 og dyreboka med ✕.
  - **Røyktesten:** OK.
- **F2:** Lagringen er lik etter avslutning og omlasting. «Start helt på nytt» åpner en bekreftelse med fokus på «Nei, behold alt». Esc og Nei beholder alt. Ja sletter `evn-dyrespillet-v1` og beholder `evn-dyrepatruljen-lyd` og `evn-spilletid-dyrepatruljen`.
- **U1:** Startkortet har EVN-merke, tittel, mål med robot, styring, Start i full bredde, «← Tilbake til EVN Studio» og «Versjon 0.10.16» i alle seks størrelsene.
- **U2 og U3 (Q-delen):** Styringen står på startkortet og under «Slik styrer du» i pausen. Teksten på startkortet er uendret. Meldingen uten WebGL er på enkel norsk og viser vei videre.
- **T1 (A-delen, emulert):** I spillet var ingen synlige trykkflater mindre enn 44×44 i noen av de fem mobilstørrelsene. Det gjaldt heller ingen knapper i verdensvalget. Start er 58 px høy, og Tilbake er 44 px høy.
- **T2:**
  - **Pause:** Tab og Shift+Tab går rundt mellom Fortsett, Slik styrer du og Avslutt.
  - **Kart:** Fokus blir på ✕.
  - **«Vil du avslutte?»:** Tab går rundt mellom Nei og Ja, og fokus starter på Nei.
  - **Dyreboka (rettet i 0.10.14):** Fokus går til ✕, og Tab og Shift+Tab går rundt mellom ✕ og Lukk.
  - **«Start helt på nytt» (rettet i 0.10.14):** Fokus starter på Nei, og Tab og Shift+Tab går rundt mellom Nei og Ja.
  - **Etter lukking:** Ingen elementer er `inert`.
  - **Startkortet:** Tab går fra Start til Tilbake.
- **T3:** Den statiske testen viser at viewporten ikke sperrer zoom. Uten `reducedMotion` pulserer Start, og Playwright sier «element is not stable». Med `reduce` står Start stille.
- **K1:** I alle kjøringene og i røyktesten var det 0 ufangede feil, 0 konsollfeil og 0 svar med status 400 eller høyere under normal bruk. Det var heller ingen CSP-brudd. Startkortet laster `robot-start-vink-130.webp` med DPR 1 og `-260` med DPR 2 og 3.
- **K3:** «Versjon 0.10.16» står på startkortet og `VERSJON = 'v0.10.16'` i koden. ENDRINGSLOGG har en ny rad («ikke publisert»), og innholdet stemmer med det jeg målte (70 px bred, roboten i spillet uendret og byte for byte lik).
- **S1:** Den statiske testen ga OK på CSP, domener og eval. Ingen forespørsler gikk utenfor localhost, og ingen nye domener er lagt til.
- **S2:** Spillet har ingen konto, chat, kjøp eller reklame. Det ble ikke satt informasjonskapsler, og `document.cookie` er tom.
- **S3:** Spillet har ingen fritekst.
- **S4:** Personvernsiden sier at fremgang ligger lokalt og aldri sendes ut. Det stemmer, og siden er uendret siden 0.10.15.
- **B1 (A-delen):** L slår av lyden. Knappen blir 🔇 med `aria-pressed="true"`, og `evn-dyrepatruljen-lyd` blir «av». Valget huskes etter omlasting. På mobil virker trykk på 🔊.
- **B2:** M viser «🔴 Du er her · 🏙️ Gata» og «🦒 Dyreparken». Spilleren står stille med kartet åpent.
- **B3 (oppstartsdelen):** Uten WebGL kommer en melding med `role="alert"`. Start er slått av («3D virker ikke her»), og tilbakelenken er synlig. Ingen ufangede feil.
- **ST3:** Koden teller bare på evnstudio.no (`statistikk.js` linje 22). På 127.0.0.1 gikk ingen forespørsler ut.
- **ST5:** Med evnstudio.no rutet lokalt ble det ingen hendelse før Start. Etter Start kom nøyaktig én `start-dyrepatruljen`, og det samme ved neste sidebesøk. Ingen fritekst eller spillerdata.
- **ST6:** Ingen informasjonskapsler. Koden har ingen ID og ingen fingeravtrykk.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle avvikene er kjente fra tidligere rapporter (691e862 og b7813de) og er uendret. Ingen er nye.
- **F3, verifisert feil (kjent, uendret):** Lagring fra v0.10.3 virker. Den ble laget ved å kjøre v0.10.3 på samme origin: 3 dyr ble lest, og en ny fangst ble lagt til. Ugyldig JSON, `null`, `[]`, `{"v":1}` og `v:2` virker også. Lagring med feil type virker ikke:
  - `{"v":1,"reddet":{"gata":null}}` gir en TypeError, og verdensvalget kan ikke brukes. Spillet kan ikke startes før lagringen er slettet.
  - `{"gata":5}` gir `reddet.includes is not a function`.
  - `"reddet":"x"` og `{"gata":"katt1"}` feiler ved fangst.

  Gjenskap: legg en av verdiene i `evn-dyrespillet-v1`, last siden på nytt og trykk Start, og deretter Gata. Spillet lager ikke slike verdier selv.
- **K2, verifisert feil (kjent funn for alle spill):** En feil kastet under spilling (`setTimeout(()=>{throw …})`) ga ingen melding og ingen «Last inn på nytt». Det finnes ingen global feilfanger. Den eneste er for manglende 3D.
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke. Det kan avgjøres ved å fremkalle `WEBGL_lose_context` under spilling.
- **ST1, ST2, ST4, ST7 og ST8, avvik (felles, uendret):**
  - `statistikk.js` lastes nederst i `<body>` med `defer`.
  - Spillet sender ikke `evn-start`, og starten telles ved klikk på `#startBtn`. Verifisert på nytt: bare `start-dyrepatruljen` ble sendt, ingen `versjon-dyrepatruljen-0.10.16`.
  - `EVNAktivTid` og feilhendelser finnes ikke.
  - `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`).
- **Standardens oversikt, mulig problem (kjent):** Dyrepatruljen står ikke i «Hvilke krav gjelder for hvert spill». Etter koden gjelder B1, B2 og B3. En voksen må bekrefte det.

## Anbefalte forbedringer
- Roboten på startkortet er 70×78 px, under halvparten så høy som gutten (70×167). Teksten får nøyaktig like mye plass som før, men Even bør se om roboten er stor nok til å gjenkjennes. Skjermbilder ligger i /home/claude/qa/dyre3/bilder/kort-0.10.16-*.png.
- `felles/robot/tegn.html` og verktøyene blir offentlige på evnstudio.no når grenen slås sammen. Siden har ingen CSP, og den virker ikke der fordi `node_modules` ikke ligger i repoet. Vurder å holde verktøymappen utenfor det publiserte nettstedet, eller å nevne den i `.claude/README.md` over felles filer. Dette er ikke endret siden rapporten for 9e7d764.
- Disse forslagene fra før gjelder fortsatt:
  - Validering i `lastInn()` (F3) og en global feilfanger med «Last inn på nytt» (K2).
  - `webglcontextlost` håndteres ikke.
  - Grå stil for Start når den er slått av.
  - På 320×568 overlapper styrespaken og Snik-knappen, målt med rektangler.
  - I liggende format og på 320×568 ligger Start under bretten, både i 0.10.15 og i 0.10.16. Start er nå 75 px høyere i liggende format.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og jeg har ingen ekte enhet. SwiftShader sier ingenting om bildefrekvens. Helten flyttet seg bare 0,8 enheter på 2 s med W, fordi bildene kommer svært sjelden.
- **Y2:** Fanebytte er bare simulert med `visibilitychange`, og da åpnes pausen. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest.
- **T1, T3, B1 og B3 (E):** Ingen ekte mobil. Emulering, `tap` og CDP-berøring er ikke ekte berøring. Lyden er ikke hørt og ikke målt med oscillatorer denne gangen, bare tilstanden er sjekket. Lavere grafikk på svake enheter er ikke målt.
- **T2, delvis:** Tab-rekkefølgen på ferdigkortet er ikke testet. Det er bare sjekket at ingenting er `inert` og at knappen virker.
- **T4:** Kontrasten er ikke målt (kun kodelest). Bildet har `alt=""` (pynt), som før.
- **U2 og U3 (V):** Om Even og andre barn kjenner igjen og liker den vinkende roboten på startkortet, må Even vurdere.
- **ST2 og milepæler:** Ikke testet, fordi `test/statistikk/` ikke finnes. En ny Start i samme sidebesøk er ikke testet denne gangen.
- **ST1–ST8 etter publisering:** Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **B4, B5, B6 og B7:** Gjelder ikke. Spillet har ikke kamp eller skrekk, ikke læringsinnhold med fakta, ingen app-installasjon og ingen fritekst. Det forutsetter at en voksen bekrefter oversikten.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for dette spillet. Ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert.
- **«Byte for byte lik Mørkeskogen 2.0» (README i `felles/robot/`):** Ikke kontrollert, fordi grenen `morkeskogen-2.0` ikke ble brukt.
- **Lange økter og 150 dyr i dyreparken på svake telefoner:** Ikke testet.
- **Testservere:** Alle servere jeg startet, kjørte i skriptene og er stoppet. To `python -m http.server` (PID 5308 og 5310) og `node spill.mjs` (PID 7412) kjører fra andre mapper (wt-egg og qa/egg3). De er ikke mine, og jeg har ikke rørt dem.

## Klar for testing hos Even?
JA MED FORBEHOLD – Endringen er bare visuell, og ingenting fra 0.10.15 er overskrevet. Påstanden om roboten stemmer, og teksten, styringen og Start har nøyaktig samme plass som i 0.10.15. F1, F2, T2 og rettingene i 0.10.14 og 0.10.15 virker på PC og i emulert mobil uten feil. Forbehold: Det er ikke testet på ekte mobil, og de kjente avvikene F3, K2, B3 (tapt 3D under spilling), ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne. En voksen må ta stilling til dem før publisering.
