# EVN Game QA: Vikinglandsby 0.3.2
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit b02afdec818ec72ef6c331a58e45dde2cad515c7
Testkvittering: evn1 commit=b02afdec818ec72ef6c331a58e45dde2cad515c7 tester=7d3c0337901d arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels – ny funksjon (hopp, øks) og endret tastetilordning i ett spill, med regresjon mot 0.2.0. Felles kode, lagringsformat og CSP er ikke endret (diff ea18829..b02afde: bare `spill/vikinglandsby/index.html` og QA-rapporten). Dette er ikke en publiseringskontroll.
Testet: Chrome headless (Playwright, swiftshader, `reducedMotion: 'reduce'`). Kjøretidstestene er gjort mot en `git archive` av b02afde i /tmp/qa3/b02afde, servert på 127.0.0.1:8770. HEAD sto på b02afde og arbeidstreet var rent under hele kontrollen. Testsuiten er kjørt fra repoet. PC 1280×800 med ekte tastetrykk og mus. Berøring er emulert (isMobile/hasTouch, DPR 2) i 375×812, 740×360, 320×568 og 568×320, med `tap` og CDP-berøring for styrespaken og for to fingre samtidig. En ekte 0.2.0-lagring er laget i ea18829 (servert på :8771). Testtilstand er satt med `window.__spill`, `window.__kamFri` og `#test`. `localStorage` er tømt før og etter. Skript og skjermbilder ligger i /tmp/qa3. Begge testserverne er stoppet.

Merknad: KS3 og KA1 (nevnt i oppdraget og i en kodekommentar) står ikke i standarden i repoet. Styringsteksten er derfor kontrollert under U1 og U2.

## Oppfylte krav
- **F1** PC: Tab til Start og Enter, gå, hogg, hakk, plukk og fisk med E (også E holdt inne). Fire hus er bygd med mus og tastatur, jobb er gitt med E, og pause (P/Esc), kart (M), ønskeliste og Avslutt → «Ja» (til forsiden) virker. Resultatene er like 0.2.0, felt for felt (pc.json). Med berøring i alle fire størrelser: start, styrespak, gul knapp, ⤴️, bygg med ↻ og ✔, jubelkort, pause og kart. Ingen heng.
- **Hopp (F1, ny funksjon):**
  - Mellomrom gir ett hopp (maks 1,82 m, Jump-klippet spilles), og roboten lander (`hoppY` = 0, `vy` = 0, tilbake til Idle).
  - Mellomrom i lufta gir ikke nytt hopp, fordi farten ikke settes på nytt.
  - Mellomrom holdt inne gir ett hopp.
  - Du kan gå mens du hopper (8,8 m forflytning), og E hogger midt i et hopp (+1 tre).
  - Pause og kart fryser hoppet: høyden sto stille i 1,5 s, og hoppet fortsatte og landet etter at spillet ble fortsatt.
  - B midt i et hopp åpner byggemodus. Roboten lander der. Mellomrom i byggemodus uten valgt hus gjør ingenting.
  - Mellomrom med fokus på den gule knappen hopper, og Enter hogger.
- **Mellomrom og E:** To trykk på mellomrom ved et tre ga 0 tre, og E ga +1.
- **F2** Lagring er lik etter omlasting. «Start helt på nytt»: Esc og «Nei» beholder lagringen, «Ja» sletter den.
- **F3** En ekte 0.2.0-lagring (5 hus, 4 vikinger, 3 jobber, ønske 8) lastes riktig, arbeiderne produserer, og formatet er uendret. Sju ødelagte lagringer krasjer ikke, og kopien `-kopi` lages ved ugyldig JSON, ukjent versjon og feil type.
- **U1** Startkortet har merke, mål, styring, ▶ Start, vei tilbake og «Versjon 0.3.2».
- **U2 og U3 (Q-delen, styringstekst):**
  - PC-startkortet sier «E for å hogge, plukke og fiske. Mellomrom for å hoppe.», og det stemmer med det som virker.
  - Startkortet på berøringsskjerm sier «Trykk på ⤴️ for å hoppe» (målt).
  - Styringen i pausen er oppdatert for begge (kun kodelest). Se avviket under om mellomrom etter lukket meny.
- **T1 (emulert)** ⤴️ er 72×72 px, med 12 px til «Hogg» og 12 px til «Bygg». Den overlapper ikke andre knapper og ligger innenfor skjermen i alle fire størrelser. Ingen synlige knapper er under 44×44 px i spill, handling, bygg, jubel og pause. På PC er ⤴️ `display:none` og kan ikke nås med Tab.
- **⤴️ på berøringsskjerm:** Trykk gir hopp og hogger ikke. Styrespak og ⤴️ med to fingre samtidig gir hopp mens roboten går (CDP).
- **T2** Spillet kan fortsatt brukes helt med tastatur. Pausen: se kjent funn.
- **T3 (zoom)** Viewport sperrer ikke zoom (testsuiten).
- **K1** Ingen ufangede feil og ingen 404 fra spillet i noen kjøring. Den eneste 404 var `favicon.ico` på testens nøytrale side.
- **S1** CSP er uendret, og testsuiten bestod.
- **B2** Kartet åpnes og lukkes, og spillet står stille med kartet åpent: 0 forflytning, og hoppet fryser.
- **Øksa:** Den finnes, er synlig og er hengt på beinet `Palm2R` (4 deler, skala 1,25). Den følger hånden i Wave/Idle, Running, Jump og Punch. Grepspunktet i hånden ligger 0–0,07 fra skaftets akse i alle målte bilder. Nærbilde: /tmp/qa3/oks2-idle-foran.png.
- **Vannspruten (funn fra 0.2.0 er rettet):** Fisking gir 9 nye objekter (8 partikler og flytetekst). De blir stående i omtrent 10 bilder og forsvinner gradvis over omtrent 25 bilder. I 0.2.0 ble alle fjernet i første bilde.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **Verifisert feil, ny funksjon. Mellomrom hopper ikke etter at byggemodus eller ønskelista er lukket.** Feilen bryter ikke et eget gjeldende krav, men gjør at styringsteksten «Mellomrom for å hoppe» ikke stemmer i en vanlig situasjon.
   - Gjenskapes på PC:
     - B → Esc (eller klikk 🔨 → «Ferdig») → mellomrom: byggemodus åpnes igjen (`bygg.aktiv = true`), og roboten hopper ikke.
     - 📜 → Esc → mellomrom: ønskelista åpnes igjen.
   - Årsak: `lukkBygg()` og `lukkLag()` setter fokus tilbake på 🔨 og 📜. Tastebehandleren slipper mellomrom videre til knapper som har fokus (`paKnapp`).
   - Samme logikk fantes i 0.2.0, men der var mellomrom «hogg». Nå er mellomrom den nye hoppetasten, og det å lukke byggemodus og så hoppe er en vanlig rekkefølge.
   - Etter pause og kart virker hoppet, fordi fokus går til `BODY`.
2. **ST2, ST4, ST5 (kjent og uendret, felles kode):** `statistikk.js` er lik den i ea18829 og main.
3. **T2 (kjent og uendret):** Tab går ut av pausekortet (felles EVN-PAUSE).

**Mulige problemer (uendret fra 0.2.0)**
- **Y1/Y2:** `dt` er begrenset til 0,05 s, så under 20 bilder/s går også hoppet i sakte film. Swiftshader ga 1,2 bilder/s på PC (med andre tester i gang samtidig) og 3,5 bilder/s i 375×812. Må måles på en ekte mobil.
- **Liggende format:** I 740×360 og 568×320 ligger «Lyd» og «Avslutt» i pausekortet under kanten (samme mål som i 0.2.0). Kartkortet er 339 px høyt i et 320 px vindu (568×320). Start-knappen ligger under kanten i 568×320. Byggepanelet dekker 50–56 % av høyden.

## Anbefalte forbedringer
- Rett avvik 1. Mellomrom kan alltid gi hopp under spilling, også når 🔨 eller 📜 har fokus. En annen løsning er å ikke sette fokus tilbake på knappen etter at menyen er lukket med tastatur. Enter aktiverer da fortsatt knappen.
- Hjelpeteksten i byggemodus sier «E eller Enter bygger». Mellomrom bygger også. Enten nevnes det, eller så fjernes mellomrom fra byggingen, slik at mellomrom bare betyr hopp.
- `#hoppKnapp` har klassen `bare-touch-knapp`, men det finnes ingen CSS-regel for den. Visningen styres av `html.touch #hoppKnapp`. Klassen kan fjernes eller tas i bruk.
- Fortsatt åpent fra tidligere: Legg Vikinglandsby inn i standardens oversikt (B1, B2, B3) og i `ENDRINGSLOGG.md` før publisering (K3). Avklar skygger på mobil når Y1 er målt.

## Kontroller som ikke kunne utføres
- **Støvet ved landing:** Kun kodelest. Målingen av antall objekter i scenen ble forstyrret av rester fra forrige hopp.
- **Y1 (E):** Ingen referansemobil, og swiftshader gir ikke meningsfull bildefrekvens.
- **Y2:** Ekte fanebytte er ikke testet. Hoppet bruker `dt` (kun kodelest).
- **T1, UI-nære forhold og to fingre (E):** Bare emulert. Om ⤴️ er lett å treffe med tommelen ved siden av den gule knappen, må prøves på en ekte telefon.
- **Øksas utseende og hoppfølelsen (V):** Om øksa ser ut til å ligge riktig i hånden, og om hopphøyde og hopptid føles bra, må Even vurdere.
- **B1:** Ikke kjørt på nytt. Ny lyd (`lydHopp`) bruker samme `pip` som de andre lydene (kun kodelest). Lyd på enhet (E).
- **B3, K2:** Ikke kjørt på nytt. Koden er uendret fra 0.2.0, der de ble testet (kun kodelest).
- **ST1, ST3, ST6:** Kun kodelest. `statistikk.js` og `evn-start` er uendret og ble ikke målt på nytt. `test/statistikk/` finnes ikke (suiten er «ikke innført»), så ST4, ST5 og ST8 er ikke testet. GoatCounter krever en voksen med innlogging.
- **T3 (redusert bevegelse), T4, S2–S4:** Ikke kontrollert på nytt. Ingen endring i de berørte delene.
- **K3:** Gjelder ved publisering. Spillet står ikke i `ENDRINGSLOGG.md`.
- Lange økter, iPhone og Android er ikke testet. UI1–UI10 er ikke kontrollert, fordi de ikke er tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. F1–F3 er testet, og hopp, øks og vannsprut virker. Mellomrom gir likevel ikke hopp rett etter at byggemodus eller ønskelista er lukket (avvik 1), og ytelse og berøring på ekte mobil er ikke testet. Rapporten gjelder bare b02afde.
