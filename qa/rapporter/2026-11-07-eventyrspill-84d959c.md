# EVN Game QA: Era Defenders (spill/eventyrspill) 0.21.3
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 84d959cd56d7480819b126b6dc6ae2885c138281
Testkvittering: evn1 commit=84d959cd56d7480819b126b6dc6ae2885c138281 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – endringen er i felles kode (`statistikk.js`), og oppdraget ber om full kontroll. Spillmappen heter «eventyrspill», men standarden og startkortet kaller spillet Era Defenders 0.21.3. Spillets filer er identiske med origin/main (43aa7b9). Bare de gjeldende delene av standarden er brukt: F, U, T, Y, K, S, ST og B2, B4, B6, B7. UI1–UI10 er ikke tatt i bruk for spillet. Klarspråk har status forslag. Ingen av dem er kontrollert.
Testet: Lokal `python3 -m http.server` på 127.0.0.1:8944 fra repoets rot (stoppet etterpå). Playwright Chromium 1243 headless med swiftshader. Jeg brukte ekte tastetrykk (`keyboard.down/up/press`), museklikk (`force` på Start), `tap` og berøring via CDP `Input.dispatchTouchEvent`. Størrelser: 1280×800, 1024×700, og emulert mobil med DPR 2 i 375×812, 740×360, 320×568 og 568×320. Ny kontekst og tom localStorage i hver test. Statistikken ble testet med evnstudio.no emulert: `page.route` serverte filene fra repoet og en stubb i stedet for `gc.zgo.at/count.js`. Alt annet ble blokkert, og ingenting ble sendt til GoatCounter. Spilletid ble testet med raskere minutt: intervallet på 5000 ms ble satt til 40 ms med et init-skript. `node test/kjor.mjs` ga tidsavbrudd etter 15 minutter to ganger fordi fire kontroller kjørte samtidig på 2 CPU-er. Tredje kjøring ble fullført: 73 ok, 0 feil, 0 varsel, 2 ikke innført. Maskinen var tungt belastet, og requestAnimationFrame stoppet av og til helt (2 bilder på 1,5 s, også for en egen måleløkke). Det ga noen frosne målinger, som jeg har tatt ut etter at de ble kjørt på nytt.

(Merknad fra kontrollen: Under kontrollen stoppet jeg ved en feil en prosess som tilhørte en av de andre kontrollene, PID 4704/4702, `python3 -I t1.py` i `/tmp/qa-dp-84d/skript/` (Dyrepatruljen), ca. kl. 13:21. Ingen filer i repoet er endret.)

## Oppfylte krav
**PR-endringen (`evn-start`):** Med evnstudio.no emulert ble ingen hendelse sendt før start. Klikk på Start ga `start-eventyrspill` én gang. En `evn-start` sendt etterpå ga ingen ny start. På en ny side ga to `evn-start` uten klikk én start, og et klikk på Start etterpå ga ikke en til. Lytteren og oppdageren for Era teller altså ikke dobbelt. Era sender selv ikke `evn-start`.

- **F1** Oppfylt. Testet med ekte taster: Start, gange med WASD, slag med mellomrom (`sverdTid` 12), P gir pause (`tid` og helten står stille), og Esc eller P fortsetter. Også testet: M (kart), B (basen), og ✕ Avslutt med «Nei» via klikk, Enter og Esc (spillet fortsetter). «Ja, avslutt» går til forsiden. På mobil virker trykk på Start, styrespaken (helten flyttet seg) og ⏸ i 375×812, 740×360 og 320×568. I 568×320 virker Start etter rulling i menyen. Røyktesten er OK.
- **F2** Oppfylt. Penger 123, nivå 2 og basenavn ble beholdt etter omlasting («💾 Fortsetter der du slapp: nivå 2»). «Start helt på nytt» gir fokus på «Nei». Nei beholder lagringen. Ja sletter bare `evn-eventyrspill-v1`, og spilletiden beholdes.
- **F3** Oppfylt. `{oops`, `{}`, `null` og en lagring med epoke 9 starter i epoke 1 uten feil, og spillet lagrer en gyldig lagring på nytt. En lagring i formatet fra 0.19 (uten `epoker`, verden 5) ble lastet som verden 6 med nivå, penger, Normal og basenavn i behold. Spillet og lagringsformatet er uendret mot main.
- **U2** Q-delen er oppfylt. Styringen står på startkortet (tilpasset PC eller berøring) og under «Slik styrer du» i pausen.
- **U3** Q-delen er oppfylt. Ingen tekst er endret.
- **T3** Oppfylt. Viewport sperrer ikke zoom (testsuiten). Bare kodelest denne gangen: `prefers-reduced-motion` slår av animasjonen på Start.
- **K1** Oppfylt. Ingen pageerror, konsollfeil eller svar ≥ 400 i noen kjøring, og røyktesten (inkludert CSP-brudd) er OK.
- **S1** Oppfylt. Testsuiten sjekket CSP, domener og eval. CSP er uendret mot main.
- **S2** Oppfylt. Ingen konto, chat, kjøp eller reklame. Ingen forespørsler utenfor 127.0.0.1 ved lokal kjøring.
- **S3** Oppfylt. Basenavnet lagres bare i localStorage og renses (`rensBasenavn` fjerner `<>` og kontrolltegn og gir høyst 14 tegn). Det sendes ikke ut.
- **S4** Oppfylt. Personvernsiden nevner basenavnet og sier at spilletiden «kan også telle pauser». Det stemmer med det spillet gjør. **Kjent funn rettet:** S3, S4 og B7 om basenavnet på personvernsiden.
- **B2** Oppfylt. M åpner kartet med fokus på ✕, `tid` står stille med D holdt inne, og M eller Esc lukker.
- **B4** Q-delen er oppfylt. «Lett» finnes på startkortet.
- **B7** Oppfylt. `maxlength=14` og `slice(0,14)`, og personvernsiden omtaler navnet.
- **ST3** Oppfylt. `statistikk.js` avslutter når vertsnavnet ikke er evnstudio.no, og det gikk ingen forespørsler ut lokalt.
- **ST5** Oppfylt (emulert). Bare `start-` og `spilletid-` ble sendt, hver høyst én gang.
- **ST6** Oppfylt for `statistikk.js`. Ingen informasjonskapsler i den emulerte kjøringen, og ingen ID-er i koden. GoatCounters egen `count.js` ble ikke lastet, fordi den var byttet ut med en stubb.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen av disse kommer fra PR-endringen, unntatt K3.

- **K3** Verifisert feil (gjelder PR-en): `git diff origin/main..HEAD` endrer bare `statistikk.js`, og `ENDRINGSLOGG.md` har ingen rad for endringen. Den felles statistikken publiseres altså uten en rad i endringsloggen. Versjonen i spillet (0.21.3 i `<title>` og på startkortet) stemmer.
- **U1** Verifisert feil, ny (finnes på main siden 6783775, 0.20.0): `@media (max-height:700px)` setter `.evn-ver` til `display:none`. Versjonen vises derfor ikke på startkortet ved 740×360, 568×320 og 320×568, og heller ikke ved 1024×700, som er størrelsen røyktesten bruker. Gjenskapes slik: åpne spillet i et vindu som er høyst 700 px høyt. Røyktesten fanger det ikke, fordi den leser teksten og ikke om den er synlig.
- **T1** Verifisert feil, ny (finnes på main siden 6783775): `@media (max-height:500px) { #meny .vansk button { min-height:40px } }`. Lett, Normal og Vanskelig ble målt til 149×40 px i 740×360. Under spilling var ingen DOM-knapper under 44 px.
- **T2** Verifisert feil, kjent funn. Tab går ut av pausekortet: fokus går `evnPauseStyrKnapp` → `evnPauseAvslutt` → BODY → `baseKnapp`. Det samme skjer i avslutt-spørsmålet (`evnBli` → `evnGaa` → `avsluttKnapp` → BODY) og i «Starte helt på nytt?» (`evnNullstillJa` → BODY → …). Alle tre dialogene gir riktig knapp fokus når de åpnes.
- **K2** Verifisert feil ved kodelesing, kjent funn: ingen `window.onerror` og ingen lytter for `error` eller `unhandledrejection`.
- **ST1** Avvik (uendret mot main): `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>` før spillets skript. Spillet sender ikke `evn-start` og bruker fortsatt oppdageren som leser `tilstand`. `versjon-eventyrspill-0.21.3` ble aldri sendt i den emulerte kjøringen.
- **ST2** Verifisert feil: spilletiden kommer ikke fra `window.EVNAktivTid`, fordi spillet har EVN-PAUSE v2. Gjenskapes slik: kjør på emulert evnstudio.no med raskt minutt, start og trykk P. Mens spillet sto i `pause`, ble `spilletid-eventyrspill-01min`, `-05min`, `-15min` og `-30min` sendt.
- **ST4** Verifisert feil: etter en kastet feil under spilling ble ingen `feil-eventyrspill-spill` sendt. Spillet fortsatte (`tilstand` = spill), så statistikken stopper ikke spillet.
- **ST7** Avvik som følge av ST1, ST2, ST4 og ST8.
- **ST8** Avvik: `test/statistikk/` finnes verken her eller på main (testsuiten sier `statistikk=ikke-innfort`), så kravet kan ikke oppfylles. Testene over er en egen erstatning og gjelder ikke som ST8.

## Anbefalte forbedringer
- Hvis Era skal følge ST1 fullt ut, bør spillet selv sende `document.dispatchEvent(new Event('evn-start'))` i `startSpill()`, og oppdageren bør fjernes. Lytteren i denne PR-en gjør det mulig uten dobbel telling (verifisert).
- **Mulig problem** for nye spill, ikke Era: med `defer` kjører `statistikk.js` etter de innebygde skriptene. Et spill som sender `evn-start` mens siden ennå lastes, for eksempel ved automatisk start, mister hendelsen. Dokumenter at hendelsen må sendes etter brukerhandling, eller la `statistikk.js` sjekke et flagg som spillet setter. Det kan avgjøres med en test der spillet sender hendelsen fra et innebygd skript.
- Flytt `min-height:40px` og `.evn-ver{display:none}` ut av media-reglene for lave skjermer, eller gi versjonen en mindre skrift i stedet for å skjule den.
- Røyktesten bør sjekke at `.evn-ver` er synlig, ikke bare at teksten finnes.

## Kontroller som ikke kunne utføres
- **ST8** `test/statistikk/` finnes ikke (se over). Om hendelsene kommer frem i GoatCounter etter publisering, kan bare en voksen med innlogging sjekke. Milepæler er bare testet med forkortet minutt.
- **T4** Ikke testet: kontrasten er ikke målt.
- **Y1** Ikke testet: referansemobil er ikke valgt (E). Maskinen var for belastet til at bildefrekvens kunne måles.
- **Y2** Bare kodelest: fast tidssteg (`STEG = 1000/60`, høyst 5 steg). Fanebytte kunne ikke gjenskapes i headless, fordi `document.hidden` forble false.
- **B6** Bare kodelest: service workeren registreres bare på https, og cachen er `eventyrspill-v0.33`. Oppdatering og bruk uten nett i installert app krever enhet (E).
- **E:** T1 og T3 på faktisk mobil, ekte berøring på iPhone og Android, og B6.
- **V:** U2, U3 og B4 (om innholdet passer for 7-åringer, og om Lett er lett nok).

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring på 84d959c uten feil, og PR-endringen teller start én gang uten dobbel telling i Era. Forbeholdet gjelder ST1/ST2/ST4/ST7/ST8 og T2/K2, som også finnes på main. Det gjelder også de nye funnene U1 og T1 på lave skjermer, K3 (ingen rad i endringsloggen for PR-en), og at T4, Y1, Y2 og ekte mobil ikke er testet.
