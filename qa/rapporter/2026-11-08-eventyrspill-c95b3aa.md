# EVN Game QA: Era Defenders (spill/eventyrspill) 0.21.4
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c95b3aa1ef934bd26cd472493bd82da54a5921d2
Testkvittering: evn1 commit=c95b3aa1ef934bd26cd472493bd82da54a5921d2 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – PR #53 endrer felles kode (`statistikk.js`), og oppdraget ber om full kontroll. Endringer i spillet siden 84d959c: bare versjonen, 0.21.3 → 0.21.4 i `<title>` og på startkortet. I tillegg har `ENDRINGSLOGG.md` fått en ny rad, og QA-rapporter er lagt til. Bare de gjeldende delene av standarden er brukt: F, U, T, Y, K, S, ST og B2, B4, B6, B7. UI1–UI10 er ikke tatt i bruk for spillet, og Klarspråk har status forslag; ingen av dem er kontrollert. Alt er kjørt på nytt på c95b3aa, og ingen resultater er overført fra 84d959c.
Testet: Lokal `python3 -m http.server` på 127.0.0.1:8944 fra repoets rot; PID og mappe kontrollert, og serveren stoppet etterpå. Ingen andre prosesser ble stoppet. Playwright Chromium headless med swiftshader. Ekte tastetrykk (`keyboard.down/up/press`), museklikk (`force` på Start, som pulserer), `tap` og berøring via CDP `Input.dispatchTouchEvent`. Størrelser: 1280×800, 1366×650 og 1024×700, og emulert mobil med DPR 2 i 375×812, 740×360, 320×568 og 568×320. Ny kontekst og tom localStorage i hver test. Statistikken ble testet med evnstudio.no emulert: `page.route` serverte filene fra repoet og en stubb i stedet for `gc.zgo.at/count.js`. Alt annet ble blokkert, og ingenting ble sendt til GoatCounter. Spilletid ble testet med raskere minutt: intervallet på 5000 ms ble satt til 40 ms med et init-skript. `node test/kjor.mjs` ga 73 ok, 0 feil, 0 varsel og 2 ikke innført, og ingen kontroll fikk FEIL eller VARSEL. Testskript og resultater (utenfor repoet): `/tmp/qa-eventyr/c95/`.

## Oppfylte krav
**PR-endringen (`evn-start`):** Med evnstudio.no emulert ble ingen hendelse sendt før start. Klikk på Start ga `start-eventyrspill` én gang. En `evn-start` sendt etterpå ga ingen ny start. På en ny side ga to `evn-start` uten klikk én start, og et klikk på Start etterpå ga ikke en til. Lytteren og oppdageren for Era teller altså ikke dobbelt. Era sender selv ikke `evn-start`.

- **F1** Oppfylt. Testet med ekte taster i 1280×800: Start, gange med WASD, slag med mellomrom (`sverdTid` 3), P gir pause (`tid` og helten står stille), og Esc fortsetter (`tid` går igjen). Også testet: M (kart), B (basen), og ✕ Avslutt, der «Nei» og Esc (3 av 3) gir tilbake spillet. Avslutt i pausen og «Ja, avslutt» går til forsiden. På mobil virker trykk på Start, styrespaken (helten flyttet seg) og ⏸ i 375×812, 740×360 og 320×568. I 568×320 virker Start etter rulling i menyen. Røyktesten er OK.
- **F2** Oppfylt. Penger 123, nivå 2 og «Testbase» ble beholdt etter omlasting («💾 Fortsetter der du slapp: nivå 2»). «Start helt på nytt» gir fokus på «Nei». Nei beholder lagringen. Ja sletter bare `evn-eventyrspill-v1`, og `evn-spilletid-eventyrspill` beholdes.
- **F3** Oppfylt. `{oops`, `{}`, `null` og en lagring med epoke 9 starter i epoke 1 uten feil. En lagring i formatet fra 0.19 (verden 5, uten `epoker`) ble lastet som verden 6 med nivå 3, 77 penger, Normal og basenavn. En lagring fra 0.21.3 ble lastet uendret (verden 4, nivå 4, 200 penger, «Gammel»). Lagringsformatet er uendret.
- **U2** Q-delen er oppfylt. Styringen står på startkortet (tilpasset PC eller berøring) og under «Slik styrer du» i pausen.
- **U3** Q-delen er oppfylt. Ingen tekst er endret ut over versjonen.
- **T3** Oppfylt. Viewport sperrer ikke zoom (testsuiten). Med `prefers-reduced-motion: reduce` er animasjonen på Start `none` (målt).
- **K1** Oppfylt. Ingen pageerror, konsollfeil eller svar ≥ 400 i noen kjøring, og røyktesten (inkludert CSP-brudd) er OK.
- **K3** Oppfylt. 0.21.4 står i `<title>` og på startkortet, og `ENDRINGSLOGG.md` har en rad for `statistikk.js` og de nye versjonene. Avviket fra 84d959c er rettet.
- **S1** Oppfylt. Testsuiten sjekket CSP, domener og eval. CSP er uendret mot main.
- **S2** Oppfylt. Ingen konto, chat, kjøp eller reklame. Ingen forespørsler utenfor 127.0.0.1 og ingen informasjonskapsler ved kjøring.
- **S3** Oppfylt. Basenavnet lagres bare i localStorage, og `rensBasenavn` fjerner `<>` og kontrolltegn og gir høyst 14 tegn. Det sendes ikke ut.
- **S4** Oppfylt. Personvernsiden nevner basenavnet og sier at spilletiden kan telle pauser, noe som stemmer med ST2-funnet. **Kjent funn rettet:** S3, S4 og B7 om basenavnet på personvernsiden.
- **B2** Oppfylt. M åpner kartet med fokus på ✕, `tid` står stille med D holdt inne, og M lukker.
- **B4** Q-delen er oppfylt. «Lett» finnes på startkortet.
- **B7** Oppfylt. `maxlength=14` og `slice(0,14)`, og personvernsiden omtaler navnet.
- **ST3** Oppfylt. `statistikk.js` avslutter når vertsnavnet ikke er evnstudio.no, og det gikk ingen forespørsler ut lokalt.
- **ST5** Oppfylt (emulert). Bare `start-` og `spilletid-` ble sendt, hver høyst én gang.
- **ST6** Oppfylt for `statistikk.js`. Ingen informasjonskapsler i den emulerte kjøringen, og ingen ID-er i koden. GoatCounters egen `count.js` ble ikke lastet, fordi den var byttet ut med en stubb.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle disse finnes også på main, og ingen kommer fra PR #53.

- **U1** Verifisert feil, ikke under «Kjente funn» (finnes siden 6783775, 0.20.0): `@media (max-height:700px)` setter `.evn-ver` til `display:none`. Versjonen vises derfor ikke på startkortet ved 740×360, 568×320, 320×568 og 1366×650. Gjenskapes slik: åpne spillet i et vindu som er høyst 700 px høyt. Røyktesten fanger det ikke, fordi den leser teksten og ikke om den er synlig.
- **T1** Verifisert feil, ikke under «Kjente funn» (finnes siden 6783775): `@media (max-height:500px) { #meny .vansk button { min-height:40px } }`. Lett, Normal og Vanskelig ble målt til 149×40 px i 740×360. Under spilling var ingen DOM-knapper under 44 px.
- **T2** Verifisert feil, kjent funn. Tab går ut av pausekortet: fokus går `evnPauseStyrKnapp` → `evnPauseAvslutt` → BODY → `baseKnapp`. Det samme skjer i avslutt-spørsmålet (`evnGaa` → `avsluttKnapp` → BODY) og i «Starte helt på nytt?» (`evnNullstillJa` → BODY). Alle tre dialogene gir riktig knapp fokus når de åpnes.
- **K2** Verifisert feil, kjent funn: `window.onerror` er `null`, og ingen lytter for `error` eller `unhandledrejection` finnes. En kastet feil under spilling ga ingen vennlig melding, men spillet fortsatte.
- **ST1** Avvik: `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start` og bruker oppdageren som leser `tilstand`. `versjon-eventyrspill-0.21.4` ble aldri sendt.
- **ST2** Verifisert feil: spilletiden kommer ikke fra `window.EVNAktivTid`, fordi spillet har EVN-PAUSE v2. Gjenskapes slik: kjør på emulert evnstudio.no med raskt minutt, start og trykk P. Mens spillet sto i `pause`, ble `spilletid-eventyrspill-01min`, `-05min`, `-15min` og `-30min` sendt.
- **ST4** Verifisert feil: etter en kastet feil under spilling ble ingen `feil-eventyrspill-spill` sendt. Statistikken stoppet ikke spillet.
- **ST7** Avvik som følge av ST1, ST2, ST4 og ST8.
- **ST8** Avvik: `test/statistikk/` finnes verken her eller på main (testsuiten sier `statistikk=ikke-innfort`). Testene over er en egen erstatning og gjelder ikke som ST8.

## Anbefalte forbedringer
- `sw.js` har fortsatt cache `eventyrspill-v0.33`, mens kommentaren i filen sier at nummeret skal økes ved hver oppdatering. Service workeren henter fra nettet først, så 0.21.4 når likevel frem når enheten er på nett (bare kodelest). Øk cachen for å følge regelen.
- I den nye raden i endringsloggen står det «ingen `versjon-` (ST7)». `versjon-`-hendelsen hører til ST1 og listen over godkjente hendelser; ST7 er bare følgen av den.
- Hvis Era skal følge ST1 fullt ut, bør spillet selv sende `evn-start` i `startSpill()`, og oppdageren bør fjernes. Det gir ingen dobbel telling (verifisert).
- **Mulig problem** for nye spill, ikke Era: med `defer` kjører `statistikk.js` etter de innebygde skriptene. Et spill som sender `evn-start` mens siden ennå lastes, mister hendelsen. Det kan avgjøres med en test der spillet sender hendelsen fra et innebygd skript.
- Flytt `min-height:40px` og `.evn-ver{display:none}` ut av media-reglene for lave skjermer. Røyktesten bør sjekke at `.evn-ver` er synlig.

## Kontroller som ikke kunne utføres
- **ST8** `test/statistikk/` finnes ikke. Om hendelsene kommer frem i GoatCounter etter publisering, kan bare en voksen med innlogging sjekke. Milepælene er bare testet med forkortet minutt.
- **T4** Ikke testet: kontrasten er ikke målt.
- **Y1** Ikke testet: referansemobil er ikke valgt (E). Tall fra headless på utviklingsmaskin er ikke brukt.
- **Y2** Bare kodelest: fast tidssteg (`STEG = 1000/60`, høyst 5 steg). Fanebytte kunne ikke gjenskapes i headless, fordi `document.hidden` forble false.
- **B6** Bare kodelest: service workeren registreres bare på https, og cachen er `eventyrspill-v0.33`. Oppdatering og bruk uten nett i installert app krever enhet (E).
- **E:** T1 og T3 på faktisk mobil, ekte berøring på iPhone og Android, og B6.
- **V:** U2, U3 og B4 (om innholdet passer for 7-åringer, og om Lett er lett nok).

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring på c95b3aa uten feil, og PR-endringen teller start én gang uten dobbel telling. Forbeholdet gjelder ST1/ST2/ST4/ST7/ST8, T2 og K2, og de nye funnene U1 og T1 på lave skjermer, som alle også finnes på main. Det gjelder også at T4, Y1, Y2, B6 og ekte mobil ikke er testet.
