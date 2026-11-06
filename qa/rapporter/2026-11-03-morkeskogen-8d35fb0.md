# EVN Game QA: Mørkeskogen 2.0.1
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1, S2 presisert i 1.2a) (55d5794116fb74ae842b6d60fed4e7b160157472), commit 8d35fb05a3109f9cd0097f7551a916a25b611ba7
Testkvittering: evn1 commit=8d35fb05a3109f9cd0097f7551a916a25b611ba7 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert. Endringen gjelder bare HUD, tastatur og tekst i ett spill. `spill.js` er byte-lik med `main` (`git diff main...HEAD -- spill/morkeskogen/spill.js` er tom).
Testet: Sky-container uten GPU, Playwright med Chromium og SwiftShader, `reducedMotion: 'reduce'`. Lokal server fra repoets rot: port 8793 til hovedtestene, fordi serveren på 8712 ble stoppet utenfra, og port 8712 til siste kjøring. 2.0.0-lagring ble laget fra `main` (git archive) på port 8792. Den ble laget i `/tmp/qa-mork/`. Maskinen var svært belastet (load 4–11), så én innlasting tok 3–8 minutter. Klikk og trykk er gjort med `force: true`, fordi Playwright ellers venter på at elementet står stille, og det skjer ikke når bildene oppdateres så sjelden. Mobil er emulert med `isMobile` og `hasTouch` i 375×812. De andre mobilstørrelsene er målt ved å endre viewport etter start. Testsuiten er ikke kjørt på nytt. Den består (kvitteringen over, lest i `/home/claude/kvitt/ui-morkeskogen-trinn2.txt`). Serverne jeg startet, er stoppet. Arbeidstreet er rent.

## Oppfylte krav
- **S1** – Oppfylt. Testsuiten på 8d35fb0 gir OK på alle fire S1-kontrollene for morkeskogen. Diffen inneholder ingen nye domener og ingen `eval`.
- **T3** – Oppfylt. Zoom er ikke sperret (`viewport-fit=cover`, ingen `user-scalable=no`, testsuiten). Testene kjørte med redusert bevegelse uten feil.
- **K1** – Oppfylt. Testsuiten fant ingen 404, ingen ufangede feil og ingen CSP-brudd. Egne kjøringer på PC og mobil hadde tom feilliste for konsollfeil, pageerror og HTTP ≥ 400.
- **K3** – Oppfylt. Startkortet viser «Versjon 2.0.1 · 3D» (egen kjøring og testsuiten). `ENDRINGSLOGG.md` har raden for 2.0.1 øverst. Den beskriver endringene riktig, med unntak for hjelpeteksten (se U2). «2.0.0» står ingen andre steder i spillmappa.
- **U1** – Oppfylt. Startkortet har mål, styring, Start, vei tilbake og versjon. PC-linja er endret til «Hugg: klikk (første klikk lar musa styre kameraet) · Gjør ting: E». Den viser riktig i 1280×800, og berøringslinja viser riktig i 375×812. Ingen sideveis rulling (1280/1280 og 375/375), og Start er synlig uten rulling i 375×812.
- **F3** – Oppfylt:
  - Lagring fra 2.0.0 ble lastet uendret: `mork3d.kart` og `evn-spilletid-morkeskogen` er laget av 2.0.0. `mork3d.helt` og `mork3d.verden` er skrevet i 2.0.0-formatet etter koden, med xp 260, sverd valgt og våpnene øks, sverd og bue.
  - Etter Start viste HUD-en Nivå 3 og «Sverd», og hurtiglinja viste `oks,sverd,bue,invBtn`.
  - Ødelagt lagring ga ingen krasj på mobil: `mork3d.helt` var `{ødelagt`, `mork3d.verden` var `null` og `mork3d.kart` var `[1,2`. Feillista var tom, og spillet startet. Den ødelagte heltlagringen ble ikke overskrevet før det var nødvendig.
- **B2** – Oppfylt for det som er endret: 🗺️ står i toppraden i alle fem størrelsene. Selve kartet er ikke åpnet i denne kontrollen.
- **S2** – Oppfylt. Diffen legger ikke til konto, kjøp, reklame eller forespørsler ut. Mørkeskogen har ikke E-coins (`ecoins=ok`, og ENDRINGSLOGG sier at Mørkeskogen ikke er endret).
- **S3** – Oppfylt. Ingen fritekst. Den nye `innerHTML` i `hud2.js` bruker bare faste strenger.
- **S4** – Oppfylt (kodelest). Personvern- og sikkerhetssidene er ikke endret. Endringen påvirker ikke lagring, domener eller statistikk.
- **Endret område, verifisert ved kjøring:**
  - **HUD-raden** overlapper ikke dag/område-feltet eller andre elementer i noen av de fem størrelsene.
    - 1280×800: dag-feltet går fra x 845 til 1006, ⏸ står på x 1014, og avstanden mellom knappene er 8, 8 og 8 px. «✕ Avslutt» er 98×44 og ligger ytterst til høyre (x 1170–1268).
    - 375×812, 740×360, 568×320 og 320×568: Avslutt er 44×44 og viser bare «✕». Den er siste element i raden, avstanden er 8 px, og ingen trykkflate i raden er under 44×44.
  - **Avslutt i toppraden:**
    - PC: museklikk åpner «Vil du avslutte?», fokus står på «Nei, spill videre», og adressen er uendret.
    - Mobil: et trykk åpner spørsmålet, og «Nei» lukker det.
  - **Tab:** Når fokus står i HUD-en, flytter Tab fokus til 🗺️, ❓, ✕ Avslutt og hurtiglinja. Ryggsekken åpnes ikke og pausen åpnes ikke. I åpner sekken, I lukker den, og P åpner pausen med 🚪 Avslutt synlig.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **U2 – Verifisert feil (ny i 2.0.1, endringsloggen stemmer ikke).** Den nye teksten i «Slik styrer du» vises aldri. Pausen viser fortsatt den gamle teksten fra `spill.js`: «🪓 Hugg: klikk … 🖱️ Se rundt: flytt musa …», uten «Første klikk», høyre musknapp, 1–0, Q eller H.
  - **Gjenskapes slik:** Start, trykk P og klikk «🎮 Slik styrer du». Med H eller ❓ blir det samme resultat, testet på PC i siste kjøring på port 8712.
  - **Årsak etter kodelesing:** EVN-PAUSE legger `click`-lytteren med `stopPropagation()` på `#evnPause`. Den nye lytteren i `hud2.js` ligger på `document` i boblefasen og får derfor aldri klikket.
  - **Gjelder også mobil:** berøringsteksten «🗺️ Kart: trykk 🗺️ øverst» vises heller ikke.
- **T2 – Verifisert feil i testnettleseren (ny i 2.0.1).** Det første Tab-trykket etter Start flytter fokus ut av siden, og spillet går i pause med «Pause fordi du gikk ut av spillet.».
  - **Gjenskapes slik:** Start med musklikk og trykk Tab én gang.
  - **Årsak:** Fokus står igjen på det skjulte `#startBtn`. Det finnes ingen fokuserbare elementer etter det, så fokus går ut av dokumentet og `blur` åpner pausen. Før 2.0.1 stoppet `spill.js` Tab med `preventDefault`.
  - Spillet kan fortsettes, så feilen er ikke kritisk. At det går likt i vanlig Chrome eller Edge med adresselinje, er ikke kontrollert.
- **T2 – Verifisert feil (kjent funn i standarden, ikke rettet).** Tab går ut av pausekortet etter 🚪 Avslutt. Rekkefølgen er `h2NyVerden`, `evnPauseAvslutt`, `BODY(UTE)`, `h2Hjelp(UTE)`, `evnAvslutt(UTE)`, … Ryggsekken holder heller ikke på fokus: Tab der ga `BUTTON`. Fokus i «Vil du avslutte?» er ikke målt etter omstarten.
- **K2 – Verifisert ved kodelesing (kjent, ikke rettet).** Det finnes ingen global feilfanger.
- **B1 – Verifisert ved kodelesing (kjent, ikke rettet).** Spillet har ingen lydbryter.
- **B3 – Kjent fra QA av 2.0.0, ikke testet på nytt.** Spillet viser ingen melding uten WebGL, og tapt kontekst er ikke håndtert. Koden er uendret.
- **ST1, ST2, ST5 – Avvik (systemisk, kjent og uendret).** `statistikk.js` lastes nederst på siden, og spillet sender ikke `evn-start`. Spillet bruker EVN-PAUSE v2 uten `EVNAktivTid`, og `versjon-morkeskogen-2.0.1` sendes ikke.
- **ST7, ST8 – Avvik (systemisk, kjent).** `test/statistikk/` finnes ikke, og kvitteringen sier `statistikk=ikke-innfort`.

## Anbefalte forbedringer
- **Toppraden på 320×568:** Raden er nå bredere enn plassen. Dag-feltet starter på x 1, mens statusfeltet starter på x 12, og det er bare 4 px mellom dag-feltet og ⏸. Lengre tekst, som Dag 10 og over eller lange områdenavn, vil trolig skyve feltet ut av skjermen. Dette er et mulig problem som kommer av den nye ✕-knappen. Det kan avgjøres ved å måle med lengre tekst i `#phase` og `#biome`.
- **568×320:** `#h2Hint` dekker en del av 🔨-knappen (40×28 px), og `#h2Vapen` dekker 14×10 px. Hintet har `pointer-events:none`, så det hindrer ikke trykk, men det skjuler knappen. Midlertidige meldinger (`#toast`) kan også dekke 🎥. UI-kravene er ikke gjeldende for spillet. Feltene er ikke endret i 2.0.1.
- **`#joy` ved rotasjon:** Etter at størrelsen ble endret fra høykant til liggende, lå styrespaken fortsatt på y 618, utenfor skjermen. Den ble først plassert på nytt ved ny berøring. Dette er sett bare med emulert endring av størrelse og må prøves med ekte rotasjon.
- **Retting av U2:** Lytteren i `hud2.js` kan ligge i fangstfasen (`capture: true`), med teksten skrevet etter EVN-PAUSE (for eksempel med `setTimeout`). Den kan også legges direkte på `#evnPauseStyrKnapp`.
- **Retting av T2:** Flytt fokus til et element i spillet ved Start, eller blur `#startBtn` før startskjermen skjules.

## Kontroller som ikke kunne utføres
- **F1 (delvis):**
  - Oppfylt for det som er kjørt: start, pause med P, fortsett, I-sekken, H og ❓, og Avslutt med «Nei» (testsuiten og egne kjøringer).
  - Ikke kjørt etter omstarten av økta: «Nei» etter Avslutt på PC, Esc i spørsmålet og «Ja, avslutt». Nettleseren ble lukket under kjøringen.
  - Hele spilløkter (natt, død, bygging, fiske) er ikke spilt.
  - «Åh nei!»-skjermen og `#overAvslutt` er ikke kjørt, fordi testen ble avbrutt. Kodelest: knappen vises bare under `/spill/`, kaller `av.click()` og åpner `#evnSporsmal`.
- **F2:** Ikke kontrollert at fremgangen overlever omlasting med 2.0.1, fordi testen ble avbrutt. Nullstilling er kodelest og uendret.
- **U3, B4 (Q, V):** Tekstene er kodelest. Krever Even.
- **T1 (E):** Alle knapper i toppraden er minst 44×44 i fem emulerte størrelser. Ekte berøring er ikke testet.
- **T4:** Kontrast er ikke målt.
- **Y1 (E):** Ikke testet, og ingen referansemobil er valgt.
- **Y2:** Kun kodelest. Koden er uendret.
- **ST3, ST6:** Kun kodelest og uendret. GoatCounter krever en voksen med innlogging.
- **ST4:** Ikke testet, fordi testsiden mangler.
- **B1 (E):** Lyden er ikke hørt.
- **UI1–UI10:** Ikke gjeldende for spillet. UI8a–c er ikke målt.
- **Mobilkontrollene og Avslutt på mobil (E, V):** Testet bare emulert, ikke på faktisk enhet og ikke av Even.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. Toppraden og Avslutt-knappen virker og overlapper ikke. Den nye hjelpeteksten vises likevel ikke (U2), og første Tab etter Start setter spillet på pause (T2), så endringsloggen beskriver mer enn det som virker. «Åh nei!»-Avslutt, omlasting og «Ja, avslutt» ble ikke kjørt.
