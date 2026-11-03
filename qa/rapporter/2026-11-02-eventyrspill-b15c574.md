# EVN Game QA: Era Defenders 0.20.0
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (dad89dd22b82a893b3108c031a457e7dea4ba7ba), commit b15c5742deecb7b17b94159dbb812067f86156cb
Testkvittering: evn1 commit=b15c5742deecb7b17b94159dbb812067f86156cb tester=fe434a4ba778 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort
Nivå: full – endringen er i ett spill og skal bare være visuell (som alene ville gitt middels), men versjonen er en kandidat til publisering, og samtidig kommer det en ny felles mappe (`felles/robot/`) og en ny cache i service workeren. Ved tvil velges høyere nivå. Kontrollert mot de gjeldende kravene i 1.1 (F, U, T, Y, K, S, ST og B2, B4, B6, B7). UI1–UI10 er ikke tatt i bruk for spillet og er ikke kontrollert.
Testet: Lokal `python3 -m http.server` (127.0.0.1:8917) med `ny` (arbeidstreet) og `gammel` (`git archive origin/main`, v0.19.0) på samme origin. Testserveren er stoppet. Chromium 1243 headless via Playwright, ekte tastetrykk (`keyboard.down/up`), museklikk med `force` (Start-knappen pulserer og er aldri «stabil» for Playwright, men klikket er et ekte museklikk på knappen), `tap` og berøring via CDP `Input.dispatchTouchEvent` på styrespaken. Størrelser: 1280×800, og emulert mobil 375×812, 740×360, 320×568, 568×320. Robotens rute i spritarket ble lest ved å avlytte `drawImage` (rad, kolonne, speiling). Ny localStorage-kontekst i hver test, tømt etterpå. `test/kjor.mjs --base origin/main` kjørt.

## Oppfylte krav
Kontroll av at endringen bare er visuell: Diffen mot origin/main endrer bare tittel og versjonstekst, `tegnHelt`, ny `tegnRobotHelt` og `tegnVaapen`, sw-cachen og endringsloggen. `tegnVaapen` er linje for linje lik den gamle sverd-delen av `tegnHelt`. `tegnRobotHelt` skriver bare til sine egne variabler (`robotGaaSist`, `robotGaarTil`). Kjøring: 100 kall til `tegnHelt()` endret verken `helt` eller `tid`. `helt.fart` = 3 i både 0.19.0 og 0.20.0. Lagringsnøklene er uendret (`evn-eventyrspill-v1`, `evn-spilletid-eventyrspill`), og statistikkoden er uendret.

- **F1** Oppfylt: Start (klikk og Enter-vei uendret), gange i alle 8 retninger med WASD, slag med mellomrom, pause med P og ⏸, fortsett med Esc og ▶ Fortsett, avslutt-dialogen («Nei, spill videre» fortsetter, «Ja, avslutt» går til forsiden). På mobil virker trykk på Start og styrespaken (helten flyttet seg i alle fire størrelser). Spillet virker også med reservetegningen.
- **F2** Oppfylt: Penger (123) ble beholdt etter omlasting og etter Avslutt. «Start helt på nytt» åpner en bekreftelse med fokus på «Nei». Nei beholder lagringen. Ja sletter bare `evn-eventyrspill-v1`, og spilletiden beholdes.
- **F3** Oppfylt: Med `{oops` i lagringen startet spillet uten feil og lagret på nytt. En lagring fra v0.19.0 (nivå 3, 77 penger, basenavn «Testbase», Normal) ble lastet riktig i 0.20.0 med samme nøkkel.
- **U1** Oppfylt (skjermbilde): Startkortet viser tittel, mål, styring, vanskelighetsgrad, «Versjon 0.20.0 · 7 tidsepoker» og «← Tilbake til EVN Studio».
- **U2** Oppfylt for Q-delen: styring står på startkortet, i linja nederst og under «Slik styrer du» i pausen. Robotens retning følger bevegelsen (S→rad 0, SØ→1, Ø→2, NØ→3, N→4, og vest speiles).
- **U3** Oppfylt for Q-delen: ingen ny tekst i spillet. Endringen gjør ikke tap mer straffende.
- **T1** Oppfylt for DOM-knapper: ingen synlige knapper eller lenker under 44×44 px under spilling i de fire mobilstørrelsene. Styrespak og handlingsknapper tegnes på canvas og er ikke målt (de ser store ut på skjermbildet).
- **T3** Oppfylt: viewport uten zoomsperre (A). Med `prefers-reduced-motion: reduce` er animasjonen på Start-knappen `none`.
- **K1** Oppfylt: ingen pageerror, konsollfeil eller svar ≥400 i noen kjøring, og royk-suiten er OK. Siden gjorde ingen forespørsler utenfor localhost.
- **K3** Oppfylt: 0.20.0 står i `<title>` og på startkortet, sw-cachen er v0.30, og ENDRINGSLOGG har en rad merket «ikke publisert».
- **S1** Oppfylt (A): CSP er uendret, og spritarket er en `data:`-URI som `img-src` tillater. `felles/robot/tegn.html` laster three.js fra lokal `node_modules`, ikke fra CDN.
- **S2** Oppfylt (statisk): ingen konto, chat, kjøp, reklame, `fetch`/XHR/`sendBeacon` eller informasjonskapsler i spillet.
- **S3** Oppfylt: basenavnet ligger bare i localStorage (sett i lagringen), blir renset (`rensBasenavn`, 14 tegn) og vises bare med `ctx.fillText`.
- **B2** Oppfylt: M åpner kartet, spillet står stille (`tid` uendret mens D var holdt inne i 500 ms), og M lukker kartet og fortsetter spillet. I pause står `tid` også stille.
- **B4** Oppfylt for Q-delen: Lett finnes fortsatt. Den nye helten er en vennlig gul robot.
- **ST3** Oppfylt (kodekontroll): `statistikk.js` avslutter når vertsnavnet ikke er evnstudio.no. Ingen forespørsler ut ved lokal kjøring.
- **ST6** Oppfylt (kodekontroll): ingen informasjonskapsler, ID-er eller fingeravtrykk i `statistikk.js` eller i spillet.

Reservetegning: Da spritarket ble tvunget til å feile (data-URI erstattet i en init-script), var `robotKlar` false. Den gamle tegningen ble vist (skjermbilde), og spillet kunne spilles uten feil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen av disse kommer fra denne endringen. Alle er like på origin/main.

- **T2** Verifisert feil, kjent funn (uendret): Tab går ut av pausekortet. Gjenskapes slik: start, trykk P og trykk Tab tre ganger. Fokus går til BODY, `baseKnapp` og `avsluttKnapp`. I avslutt-dialogen og nullstillingsdialogen får riktig knapp fokus når de åpnes.
- **K2** Verifisert feil, kjent funn (uendret): ingen global feilfanger. `window.onerror` er null, og det finnes ingen lytter for `error` eller `unhandledrejection`.
- **S4 / B7** Verifisert feil, kjent funn (uendret): personvernsiden nevner ikke basenavnet (sjekket med grep i `personvern/index.html`). Lengden er begrenset (maxlength 14 og `slice(0,14)`).
- **ST1** Verifisert avvik (gjelder også main): `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start`, og start oppdages ved å lese `tilstand` hvert sekund. Det sendes ingen `versjon-eventyrspill-<versjon>`.
- **ST2** Verifisert avvik (kodelest, gjelder også main): spilletiden telles med et eget `setInterval` som bare sjekker synlig fane. Den teller derfor også i pause, med kartet åpent og uten aktivitet. Spillet bruker EVN-PAUSE v2, og `EVNAktivTid` (v3) finnes ikke.
- **ST4** Avvik (kodelest, gjelder også main): `feil-eventyrspill-oppstart` og `feil-eventyrspill-spill` sendes aldri. Statistikken ligger i et eget skript og kan ikke stoppe spillet.
- **ST7** Avvik: følger av ST1, ST2 og ST4. Spillet har ikke statistikk etter godkjent ST1–ST8. Felles statistikk etter 1.1 ser ikke ut til å være innført på main (testsuiten melder `statistikk=ikke-innfort`).

## Anbefalte forbedringer
- `felles/robot/` (GLB på 464 kB, `server.mjs`, `package.json`, `tegn.html`) blir offentlig tilgjengelig hvis hele repoet publiseres som nettsted. Det gjør ingen skade, men en voksen bør vurdere om verktøymappen skal unntas fra publisering.
- Roboten tegnes med føttene ved `helt.y + 14`, så figuren står litt over trefflaten. Even bør se om treff og kollisjon føles riktig. Det er ikke målt som feil.
- På 320×568 og 568×320 er Start under kanten av skjermen før man ruller, og menyen kan rulles (120 og 114 px). Dette er likt i 0.19.0.
- Startkortet viser fortsatt den gamle maskoten, mens helten nå er roboten. Det er et kreativt valg for Even.

## Kontroller som ikke kunne utføres
- **ST8 og ST5** Ikke testet: `test/statistikk/` finnes ikke, verken her eller på main. ST5 er bare kodelest: bare navnene `start-` og `spilletid-` brukes, og hver sendes én gang. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **Y1** Ikke testet: referansemobil er ikke valgt (E).
- **Y2** Kun kodelest: fast tidssteg (`STEG = 1000/60`, maks 5 steg), og robotanimasjonen bruker den logiske telleren `tid`. Fanebytte kan ikke testes i headless.
- **T4** Ikke testet: kontrast er ikke målt. Grensesnittets farger og tekst er uendret.
- **B6** Kun kodelest: service workeren registreres bare på https. Cachen er v0.30, og spritarket ligger inne i `index.html`, så frakoblet bruk trenger ingen nye filer. Oppdatering og frakoblet bruk på installert app krever enhet (E).
- **E**: T1, T3, Y1 og B6 på faktisk mobil. Ekte berøring på iPhone og Android er ikke testet, bare emulert.
- **V**: U2, U3 og B4, og om roboten ser riktig ut i alle retninger og under slag (Even). Lyd er ikke berørt og ikke testet.
- Bildefrekvens er ikke målt (headless).

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring uten feil, og endringen er bekreftet som bare visuell. Ingen kritiske feil er funnet. Forbeholdet gjelder kjente avvik som også finnes på main (T2, K2, S4/B7, ST1/ST2/ST4/ST7), ST8 som ikke kunne kjøres, og at ekte mobil og Evens vurdering gjenstår.
