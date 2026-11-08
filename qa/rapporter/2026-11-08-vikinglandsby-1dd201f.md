# EVN Game QA: Vikinglandsby 0.3.3
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1dd201fcb6cf8402d059c7e3fd58c7a3056fee8a
Testkvittering: evn1 commit=1dd201fcb6cf8402d059c7e3fd58c7a3056fee8a tester=7d3c0337901d arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels – endret tastaturlogikk i ett spill. Diff b02afde..1dd201f gjelder bare `spill/vikinglandsby/index.html` (versjonsnummer, tastebehandleren og klassen på `#hoppKnapp`) og QA-rapporten. Felles kode, lagringsformat og CSP er uendret. Dette er ikke en publiseringskontroll.
Testet: Chrome headless (Playwright, swiftshader, `reducedMotion: 'reduce'`) mot en `git archive` av 1dd201f i /tmp/qa4/arkiv, servert på 127.0.0.1:8780. HEAD sto på 1dd201f og arbeidstreet var rent hele tiden. PC 1280×800 med ekte tastetrykk (`keyboard.press/down`) og museklikk. Berøring er emulert (isMobile/hasTouch, DPR 2) i 375×812 og 568×320 med `tap`. Testtilstand er satt med `window.__spill` og `focus()`. `localStorage` er tømt før og etter. Skript og resultater ligger i /tmp/qa4. Testserveren er stoppet.

## Oppfylte krav
- **Retting av avvik 1 fra 0.3.2 (verifisert rettet):**
  - B → Esc (fokus på 🔨) → mellomrom: roboten hopper, og byggemodus åpnes ikke.
  - Klikk 🔨 → «Ferdig» → mellomrom: hopp.
  - 📜 → Esc (fokus på 📜) → mellomrom: hopp, og ønskelista åpnes ikke.
  - 📜 → mellomrom på «Lukk» lukker lista, og neste mellomrom gir hopp.
- **Mellomrom under spilling:**
  - Mellomrom gir hopp også med fokus på 🔊, ⏸ og 🗺️. Lyden byttes ikke, og pause og kart åpnes ikke.
  - Mellomrom med fokus på den gule knappen ved et tre gir hopp og 0 tre. Enter gir +1 tre, og E gir +1 tre.
  - Mellomrom holdt inne gir ett hopp. To nye trykk gir to hopp til (3 talt per bilde).
- **Enter på fokuserte knapper (T2):** Enter på 🔨 åpner byggemodus, på 📜 åpner ønskelista, på 🔊 bytter lyden (av og på igjen), på ⏸ åpner pausen og på 🗺️ åpner kartet. Esc lukker og setter fokus tilbake på knappen.
- **Byggemodus:**
  - Med valgt langhus og gyldig plass gir mellomrom ikke bygging og ikke hopp. Huset er fortsatt valgt.
  - Enter bygger (+1 hus), og E bygger (+1 hus).
  - Enter på en fokusert husknapp i panelet aktiverer knappen (velger eller velger bort huset) og bygger ikke. Mellomrom på en husknapp velger huset (vanlig knappeaktivering).
  - Enter eller mellomrom på «Ferdig» lukker byggemodus, og neste mellomrom gir hopp.
  - Hjelpeteksten «E eller Enter bygger. R snur huset.» stemmer nå med det som virker.
- **Pause, kart og dialoger:**
  - P og Esc åpner pausen med fokus på «Fortsett». Mellomrom på «Fortsett» lukker pausen uten hopp. Mellomrom i pausen uten fokus gir ikke hopp. P lukker, og deretter gir mellomrom hopp.
  - M åpner kartet med fokus på lukkeknappen. Mellomrom lukker kartet uten hopp.
  - Jubelkortet: mellomrom på «Så bra!» lukker uten hopp. Enter uten fokus på knappen lukker kortet.
- **Oppstart:** Tab til ▶ Start og mellomrom starter spillet. Tab og Enter virker også.
- **F1 (det endrede området og regresjon):** Start, gå, hogg, hopp, bygg (to langhus), ønskeliste, pause og kart virker med tastatur. Ingen heng.
- **F2:** Lagringen er lik etter omlasting (tre 27, fem hus, fire vikinger, ønske 8). Formatet er uendret (`v,tre,stein,mat,samlet,onske,bygg,vikinger,sp`).
- **F3:** En ekte 0.2.0-lagring (fra forrige kontroll) lastes riktig. Ugyldig JSON gir ny start og kopien `evn-vikinglandsby-v1-kopi`, uten krasj.
- **U1 og K3 (startkortet):** «Versjon 0.3.3» vises (testsuiten). Tittel, `VERSJON` og startkortet er like.
- **T1 (emulert), ⤴️ etter at klassen er fjernet:** På PC er knappen `display:none`. På berøringsskjerm er den 72×72 px og innenfor skjermen i 375×812 og 568×320, og `tap` gir hopp.
- **K1:** Ingen ufangede feil og ingen 404 fra spillet. Den eneste 404 var `favicon.ico` på testens nøytrale side. Advarselen om ødelagt lagring var forventet.
- **S1:** CSP er uendret, og testsuiten bestod (99 OK, 0 FEIL, 0 VARSEL).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent og uendret, felles EVN-PAUSE):** Tab går ut av pausekortet. Etter «Avslutt» går fokus til BODY og videre til 📜 og 🔊 bak pausen. Verifisert på nytt.
- **ST2, ST4, ST5 (kjent og uendret, felles kode):** `statistikk.js` er ikke endret.

**Mulige problemer (uendret fra 0.3.2, ikke målt på nytt):** Y1/Y2 (lav bildefrekvens gir sakte hopp) og liggende format (pausekortet, kartkortet og Start under kanten i 568×320).

## Anbefalte forbedringer
- Variabelen `paKnapp` i tastebehandleren (linje 1755) brukes ikke lenger og kan fjernes.
- Mellomrom aktiverer ikke lenger 🔨, 📜, 🔊, ⏸ og 🗺️ når de har fokus under spilling, fordi mellomrom nå alltid er hopp. Enter virker, så T2 er oppfylt. Det avviker likevel fra vanlig knappeoppførsel og bør nevnes i hjelpen eller vurderes i felles styringsstandard.
- Fortsatt åpent: Legg Vikinglandsby inn i standardens oversikt (B1–B3) og i `ENDRINGSLOGG.md` før publisering.

## Kontroller som ikke kunne utføres
- **Y1 (E) og Y2:** Swiftshader gir ikke meningsfull bildefrekvens. Ekte fanebytte er ikke testet.
- **T1 og to fingre (E):** Bare emulert, og ikke målt på nytt i 740×360 og 320×568. Koden for berøring er uendret bortsett fra den fjernede klassen.
- **Ekte tastatur på berøringsenhet (E):** Ikke testet (for eksempel et nettbrett med tastatur).
- **Hoppfølelse og om barn forstår at mellomrom alltid hopper (V):** Må vurderes av Even.
- **B1–B3, K2, T3, T4, S2–S4:** Ikke kjørt på nytt. Ingen endring i de berørte delene (kun kodelest).
- **ST1, ST3, ST6:** Kun kodelest. Uendret. `test/statistikk/` er ikke innført, så ST4, ST5 og ST8 er ikke testet. GoatCounter krever en voksen med innlogging.
- **K3 (publisering):** Spillet står ikke i `ENDRINGSLOGG.md`.
- **UI1–UI10:** Ikke kontrollert, fordi de ikke er tatt i bruk for spillet. Lange økter, iPhone og Android er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Avvik 1 fra 0.3.2 er rettet, og tastaturstyringen ellers har ingen regresjoner (Enter på knapper, byggemodus, pause, kart og dialoger). Ytelse og berøring på ekte mobil er fortsatt ikke testet. Rapporten gjelder bare 1dd201f.
