# EVN Game QA: Era Defenders 0.20.0
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (dad89dd22b82a893b3108c031a457e7dea4ba7ba), commit ab5a2fb4b821ae180f6079e6c5db2d32fe9dfd4e
Testkvittering: evn1 commit=ab5a2fb4b821ae180f6079e6c5db2d32fe9dfd4e tester=fe434a4ba778 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort
Nivå: full – versjonen er kandidat til publisering. Endringen siden 6783775 er bare CSS for `.meny-maskot` og én rad i ENDRINGSLOGG, men hele endringen mot main (helt, utstyr, startkort, sw-cache) er kontrollert på nytt på denne commiten. Kontrollert mot de gjeldende kravene i 1.1 (F, U, T, Y, K, S, ST og B2, B4, B6, B7). UI1–UI10 er ikke tatt i bruk for spillet og er ikke kontrollert. Filen er 1.2 (utkast), og bare de gjeldende delene (1.0/1.1) er brukt. Oppdraget oppga ikke standardversjon.
Testet: Lokal `python3 -m http.server` (127.0.0.1:8932) med `ny` (`git archive ab5a2fb`) og `gammel` (`git archive origin/main`, v0.19.0) på samme origin. Chromium 1243 headless via Playwright: ekte tastetrykk (`keyboard.down/up/press`), museklikk med `force` på Start (knappen pulserer), `tap` og berøring via CDP `Input.dispatchTouchEvent` på styrespak og slagknapp. Størrelser: 1280×800, og emulert mobil (DPR 2) 375×812, 740×360, 320×568, 568×320, 360×640 og 412×915. Robotens og utstyrets rute i arkene ble lest ved å avlytte `drawImage`. Utstyr i alle sju epoker med `gaaTilVerden(1–7)` i testnettleseren. Logikk sammenlignet med 30 × `oppdater()` med samme taster i begge versjoner. Ny localStorage-kontekst i hver test. `test/kjor.mjs --base origin/main` kjørt på denne commiten (48 ok, 0 feil, 0 varsel, 3 kjent, 2 ikke innført; ingen FEIL eller VARSEL). Skript, logger og skjermbilder ligger i /home/claude/qa/era4. Testmiljøet ble startet på nytt underveis, og serveren kjører ikke lenger (ingen `http.server`-prosess). Ingen resultater fra 6783775 er brukt som bevis.

## Oppfylte krav
**Eiers krav: bare visuelt.** Diffen mot origin/main i `index.html` gjelder tittel, tre CSS-regler for `.meny-maskot`, bildet på startkortet, versjonsteksten og tegningen av helten (`ROBOT_UTSTYR_DATA`, `utstyrFor`, `tegnRobotHelt`, `tegnVaapen`). Ingen endring i styring, treff, fiender, forsvarsenheter, lagring, CSP eller statistikk. Ved kjøring ga 30 × `oppdater()` nøyaktig samme forflytning i 0.19.0 og 0.20.0 (Ø +90, SØ +63,64/+63,64, N −90, V −90), og `helt.fart` = 3 i begge. Lagringsnøklene (`evn-eventyrspill-v1`, `evn-spilletid-eventyrspill`) og alle 20 feltene i lagringen er identiske. 50 kall til `tegnHelt()` endret verken `helt` eller `tid`.

**Eiers krav: startkortet presser ikke sammen innholdet.** Målt i alle sju størrelser mot 0.19.0: målteksten har samme bredde og samme antall linjer som før (1280×800: 285 px, 2 linjer; 412×915: 266 px, 2 linjer; 375×812: 241 px, 3; 360×640: 226 px, 3; 320×568: 186 px, 3; liggende 240 px, 2). Styringslinjene har samme høyde, og Start har samme høyde (±2 px) og ligger 15–32 px høyere enn før. Roboten er 50×78 px (42×66 px på ≤380 px bredde), mot gutten 50×120 (42×100). Ingen overlapp med mål, styring eller Start. På 320×568 er Start nå synlig uten rulling (var ikke i 0.19.0), og på 360×640 trengs ingen rulling (29 px før). Forrige funn (ekstra linje på 412×915) er rettet.

**Eiers krav: roboten i alle sju epoker.** Alle sju lag er 1152×480. I hver epoke tegnes to lag (robot og utstyr) i samme rute og med samme speiling (7–30 par per epoke, alle like). Skjermbilder forfra, mot vest under slag og mot nord viser pelslue, hjelm med kam, ridderhjelm, piratlue, vernehjelm med verktøy, romhjelm og trollmannshatt på den gule roboten. Lagene lages først når epoken brukes (bare lag 1 før start). Første tegning etter epokebytte tok 0,0–0,1 ms.

- **F1** Oppfylt: Start med klikk, gange i alle 8 retninger med WASD, slag med mellomrom, pause med P (`tid` står stille), fortsett med Esc, avslutt-dialogen («Nei, spill videre» går tilbake til spillet). På mobil virker trykk på Start, styrespaken (helten flyttet seg i alle seks størrelser) og slagknappen (`sverdTid` > 0). Spillet virker også med reservetegningen. Røyktesten er OK.
- **F2** Oppfylt: Penger (123) og nivå 2 ble beholdt etter omlasting, og startkortet viser «💾 Fortsetter der du slapp: nivå 2». «Start helt på nytt» åpner en bekreftelse med fokus på «Nei». Nei beholder lagringen. Ja sletter bare `evn-eventyrspill-v1`, og spilletiden beholdes.
- **F3** Oppfylt: `{oops`, `{}`, `null` og en lagring med epoke 9 (lagt inn før sidelasting) gir start i epoke 1 uten feil, og spillet lagrer en gyldig lagring på nytt. En lagring fra v0.19.0 (nivå 3, 77 penger, basenavn «Testbase», epoke 4, Normal) ble lastet riktig i 0.20.0, og piratutstyret ble lagd.
- **U1** Oppfylt (skjermbilder og måling): Startkortet viser tittel, epoke, mål, styring, vanskelighetsgrad, Start, «← Tilbake til EVN Studio» og «Versjon 0.20.0 · 7 tidsepoker». Roboten overlapper ikke annet innhold i noen størrelse.
- **U2** Oppfylt for Q-delen: Styringen står på startkortet, i linja nederst og i pausen. Robotens retning følger bevegelsen (S→rad 0, SØ→1, Ø→2, NØ→3, N→4, vest speiles). Gange bruker bildene 2–7, slag bildene 8–11 og stillestående bildene 0–1.
- **U3** Oppfylt for Q-delen: Ingen ny tekst i spillet. Endringen gjør ikke tap mer straffende.
- **T1** Oppfylt for DOM-knapper: Ingen synlige knapper eller lenker under 44×44 px under spilling i de seks mobilstørrelsene. Ingen sideveis rulling. Styrespak og handlingsknapper er tegnet på canvas og er ikke endret.
- **T3** Oppfylt (A og kjøring): Viewport sperrer ikke zoom. Med `prefers-reduced-motion: reduce` er animasjonen på Start `none`.
- **K1** Oppfylt: Ingen pageerror, konsollfeil eller svar ≥ 400 i noen kjøring, også med reservetegning. Røyktesten (inkludert CSP-brudd) er OK. Ingen forespørsler utenfor localhost.
- **K3** Oppfylt: 0.20.0 står i `<title>` og på startkortet, sw-cachen er v0.30, og ENDRINGSLOGG-raden (merket «ikke publisert») beskriver nå startbildet som «samme bredde som gutten hadde», som stemmer med målingene.
- **S1** Oppfylt (A): CSP er uendret mot main. Robotark og utstyrslag er `data:`-URI-er, som `img-src` tillater. Startbildet ligger i `bilder/`. Ingen `eval` eller nye domener.
- **S2** Oppfylt (statisk): Ingen konto, chat, kjøp, reklame, `fetch`/XHR/`sendBeacon` eller informasjonskapsler i diffen eller spillet.
- **S3** Oppfylt: Basenavnet ligger bare i localStorage (sett i lagringen ved kjøring) og er uendret mot main (`rensBasenavn`, 14 tegn, `fillText`, kodelest).
- **B2** Oppfylt: M åpner kartet, `tid` står stille selv med D holdt inne, og M lukker kartet.
- **B4** Oppfylt for Q-delen: Lett finnes fortsatt. Helten er en vennlig gul robot, og utstyret er ikke skremmende.
- **ST3** Oppfylt (kodekontroll): `statistikk.js` er uendret og avslutter når vertsnavnet ikke er evnstudio.no. Ingen forespørsler ut ved lokal kjøring.
- **ST6** Oppfylt (kodekontroll): Ingen informasjonskapsler, ID-er eller fingeravtrykk i `statistikk.js` eller i spillet.

Reservetegning: Med alle store `data:image`-kilder gjort ugyldige var `robotKlar` false og ingen utstyrslag klare. Den gamle tegningen ble vist, og spillet kunne spilles uten feil.

Ytelse (headless på utviklingsmaskin, ikke referansemobil): Tegning av helten tok 0,004–0,08 ms per kall i 0.20.0 mot 0,0002–0,07 ms i 0.19.0. Bildefrekvensen varierer mye mellom kjøringer (gammel 34–48, ny 43–59 bilder/s, median rammetid 16,7 ms i begge), uten tegn til at 0.20.0 er tregere. Med 4× CPU-struping på 375×812: 40,5 bilder/s i 0.19.0 og 52,5 i 0.20.0. `index.html` er 514 kB mot 171 kB, og DOMContentLoaded lokalt med struping var 751 mot 763 ms. JS-heap 3–4 MB i begge.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen av disse kommer fra denne endringen. Alle finnes også på origin/main og er uendret.

- **T2** Verifisert feil, kjent funn: Tab går ut av pausekortet. Gjenskapes slik: start, trykk P og trykk Tab fire ganger. Fokus går `evnPauseStyrKnapp` → `evnPauseAvslutt` → BODY → `baseKnapp`. Avslutt- og nullstillingsdialogen gir riktig knapp fokus når de åpnes.
- **K2** Verifisert feil, kjent funn: Ingen global feilfanger (`window.onerror` er null, ingen lytter for `error` eller `unhandledrejection`).
- **S4 / B7** Verifisert feil, kjent funn: Personvernsiden nevner ikke basenavnet. Lengden er begrenset (maxlength 14 og `slice(0,14)`).
- **ST1** Avvik (kodelest, uendret mot main): `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start`, og start oppdages ved å lese `tilstand` hvert sekund. Ingen `versjon-eventyrspill-<versjon>`.
- **ST2** Avvik (kodelest, uendret mot main): Spilletiden telles med eget `setInterval` som bare sjekker synlig fane, og teller derfor også i pause, med kartet åpent og uten aktivitet.
- **ST4** Avvik (kodelest, uendret mot main): `feil-eventyrspill-oppstart` og `feil-eventyrspill-spill` sendes aldri. Statistikken kan ikke stoppe spillet.
- **ST7** Avvik: følger av ST1, ST2 og ST4. Testsuiten melder `statistikk=ikke-innfort`.

## Anbefalte forbedringer
- Regelen `width: 35px` i `@media (max-height: 700px)` har ingen virkning (kodelest): den står før grunnregelen `#meny .meny-maskot { width: 50px }` med samme spesifisitet, så grunnregelen vinner. Slik var det også i 0.19.0 (`height: 84px` ble overstyrt av `height: 120px`). På skjermer bredere enn 380 px og 501–700 px høye blir roboten derfor 50 px, ikke 35 px. Det gir ingen feil, men stemmer ikke med beskrivelsen i oppdraget. Flytt regelen etter grunnregelen eller fjern den.
- Roboten på startkortet er mye lavere enn gutten var (78 mot 120 px, 66 mot 100 px på smal mobil). Even bør se om den er stor nok til å kjennes igjen, særlig på mobil.
- Sett bakfra (mot nord) dekker kappene i epoke 1, 2, 3, 4 og 7 det meste av kroppen. Even bør vurdere om roboten kjennes igjen nok bakfra, særlig på mobil.
- `robot-start-kamp-260.webp` er 166×260. Ved 50 px bredde og DPR 3 trengs 150 px, så bildet er nå skarpt nok også der.
- Startbildet ligger ikke i `FILER` i sw.js. Det hentes og lagres i cachen første gang det lastes med nett, som den gamle maskoten. Mangler det uten nett, fjernes det (`onerror`).
- `felles/robot/` (blant annet GLB på 464 kB og verktøy) blir offentlig tilgjengelig hvis hele repoet publiseres som nettsted.

## Kontroller som ikke kunne utføres
- **ST8** Ikke testet: `test/statistikk/` finnes ikke, verken her eller på main. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **ST5** Kun kodelest: Bare `start-` og `spilletid-` brukes, og hver sendes én gang. Uendret mot main.
- **Y1** Ikke testet: Referansemobil er ikke valgt (E). Tallene over er fra headless Chromium på utviklingsmaskin, også med CPU-struping.
- **Y2** Kun kodelest: Fast tidssteg (`STEG = 1000/60`, maks 5 steg). Robotanimasjonen bruker `tid` og `helt.gaaTid`, ikke klokketid. Fanebytte er ikke testet i headless.
- **T4** Ikke testet: Kontrast er ikke målt. Grensesnittets farger og tekst er uendret.
- **B6** Kun kodelest: Service workeren registreres bare på https. Cachen er v0.30, og robotark og utstyr ligger i `index.html`. Oppdatering og frakoblet bruk på installert app krever enhet (E).
- **E**: T1, T3, Y1 og B6 på faktisk mobil. Ekte berøring på iPhone og Android er ikke testet, bare emulert.
- **V**: U2, U3 og B4, og Evens vurdering av om roboten kjennes igjen i alle sju epoker (særlig bakfra og på mobil), om animasjonen for å gå og slå ser riktig ut, og om den mindre roboten på startkortet passer. Lyd er ikke berørt og ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring på ab5a2fb uten feil, endringen er bekreftet bare visuell, og startkortet gir målteksten samme bredde og linjer som 0.19.0. Forbeholdet gjelder kjente avvik som også finnes på main (T2, K2, S4/B7, ST1/ST2/ST4/ST7), ST8 som ikke kunne kjøres, at Y1 og ekte mobil ikke er testet, og at Even må vurdere om roboten kjennes igjen.
