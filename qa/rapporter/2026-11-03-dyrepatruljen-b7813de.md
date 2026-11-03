# EVN Game QA: Dyrepatruljen 0.10.13
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (dad89dd22b82a893b3108c031a457e7dea4ba7ba), commit b7813deeb9827f0c7c5c120f30a775c4d75fcd4b
Testkvittering: evn1 commit=b7813deeb9827f0c7c5c120f30a775c4d75fcd4b tester=ce4104f6fbd1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort
Nivå: full – versjonen skal foreslås publisert. Commiten endrer også spillets kopi av felles kode (EVN-PAUSE v2) og legger til en ny lokal lagringsnøkkel (`evn-dyrepatruljen-lyd`).
Testet: Windows 11, gren feature/dyrepatruljen-0.10.11. `node test/kjor.mjs` (base origin/main) med Chrome: 51 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo), 2 ikke innført. Alle kjøretidstester er gjort på nytt mot b7813de, i hodeløs Chrome styrt med CDP og SwiftShader-WebGL (58 bilder/s). Siden ble servert fra repoet på 127.0.0.1 med en egen Node-server. Det var ingen forespørsler ut av localhost, og ingenting ble telt i GoatCounter. Nettleserpanelet ble bare brukt kort, fordi `requestAnimationFrame` stod stille der (panelet var skjult). Tastatur og mus er sendt som ekte inndata gjennom CDP (`Input.dispatchKeyEvent`/`dispatchMouseEvent`), og berøring som `dispatchTouchEvent`. Størrelser: PC 1280×800, og mobilemulering med berøring i 375×812, 812×375, 740×360, 320×568 og 568×320. Lagring fra v0.10.3 ble laget ved å kjøre v0.10.3 fra origin/main på samme origin. Ødelagt lagring ble testet med 9 varianter. WebGL ble slått av på to måter: `getContext('webgl')` ga null for alle lerret, eller bare for spillets lerret. Testoppsettet er satt opp med testkroken `__dyrespill.fang` (fangst av mange dyr). Én fangst er gjort med ekte håvsving. Repoet er ikke endret.

## Oppfylte krav
- **B1 (rettet, A-delen):** Lyden slås av med L og med 🔊, og da blir knappen 🔇, `aria-pressed="true"` og «Slå på lyden (L)». Valget lagres som `evn-dyrepatruljen-lyd` og huskes etter omlasting. Lyden kontrollerte jeg ved å telle oscillatorer. Med lyden på lagde plystringen 14 oscillatorer på 2,5 s. Med lyden av lagde plystring, håv og Start-pipet 0. Lyden kan også slås av ved trykk på 🔊 i alle mobilstørrelsene. «Start helt på nytt» sletter ikke lydvalget. På startkortet står «Lyd av/på: L eller 🔊».
- **T2 (rettet for pause, kart og «Vil du avslutte?»):**
  - **Pause:** Tab og Shift+Tab går rundt mellom Fortsett, Slik styrer du og Avslutt. Det gjelder også med styringen åpen og etter pause ved fanebytte. Resten av siden er `inert`. Dyreboka kan ikke åpnes bak pausen, verken med B eller klikk på 📖.
  - **Kart:** Fokus blir på ✕ for både Tab og Shift+Tab.
  - **«Vil du avslutte?»:** Fokus går rundt mellom «Nei, spill videre» og «Ja, avslutt», både når spørsmålet åpnes med ✕ i HUD og fra pausen. B, M og P virker ikke mens spørsmålet er åpent.
  - **Etter lukking:** `inert` blir fjernet hver gang, enten dialogen lukkes med Esc, M, P, ✕, Fortsett, «Nei» eller Enter.
  - **Ikke rettet:** «Start helt på nytt» og dyreboka, se avvik.
- **F1:** Dette virker: Start, så verdensvalget (mus, og berøring på mobil), så spill. Gange med W (Δz 5,6 på 1 s) og med styrespaken (Δz 4,7). Snik med Shift, C, PC-knappen og mobilknappen, der «🤫 Sniker» vises og noter vises. Håv med mellomrom, PC-knappen og mobilknappen. En ekte håvsving fanget et dyr.
  - **Pause:** P, Esc og ⏸ åpner pausen. Fortsett med knappen, Enter, P og Esc. Pausen åpnes ved blur og fanebytte. Spilleren står stille både i pausen, med kartet og med «Vil du avslutte?» åpent (Δ = 0).
  - **Fullføre og avslutte:** Verden 1 kan fullføres. Da kommer ferdigkortet, Byen blir låst opp, og Dyreparken virker med pause og kart. «Ja, avslutt» går til forsiden.
  - **Røyktesten:** OK.
- **F2:** Fangst er lagret, og lagringen er lik etter omlasting. Nullstilling spør først, med fokus på «Nei, behold alt». Nei og Esc beholder alt. Ja sletter `evn-dyrespillet-v1`, men beholder spilletid og lydvalg.
- **U1:** Startkortet har EVN-merke, mål, styring (nå med lyd), Start i full bredde, «← Tilbake til EVN Studio» og «Versjon 0.10.13».
- **U2 (Q-delen):** Styringen står på startkortet og under «Slik styrer du» i pausen. 🔊 viser hurtigtasten i `title` og `aria-label`.
- **U3 (Q-delen):** WebGL-meldingen er på enkel norsk og ikke skremmende. Den viser vei videre: annen nettleser, spør en voksen, de andre spillene.
- **T1 (A-delen):** Alle synlige trykkflater er minst 44×44 i alle fem mobilstørrelsene. 🔊 er 48×48. HUD-knappene står i to rader uten overlapp, også med den nye knappen.
- **T3 (A-delen):** Viewporten sperrer ikke zoom (statisk test). Med reduced-motion er `animation-name` på Start lik `none`.
- **K1:** Under normal bruk var det 0 ufangede feil, 0 konsollfeil, 0 manglende filer og 0 CSP-brudd. Det gjelder alle mine kjøringer og røyktesten.
- **K3:** «Versjon 0.10.13» står på startkortet og `VERSJON='v0.10.13'` i koden. ENDRINGSLOGG har en ny rad (dato «ikke publisert»), og innholdet stemmer med det jeg testet.
- **S1:** Den statiske testen ga OK, og det var 0 CSP-brudd. Ingen nye domener.
- **S2:** Spillet har ingen konto, chat, kjøp eller reklame. Ingen informasjonskapsler (`document.cookie` er tom). Den nye nøkkelen er bare lokal.
- **S3:** Spillet har ingen fritekst.
- **S4:** Personvernsiden sier at fremgang lagres lokalt og aldri sendes ut. Det gjelder også lydvalget.
- **B2:** M og 🗺️ viser «🔴 Du er her · 🏙️ Gata» eller «🦒 Dyreparken». Spillet står stille med kartet åpent.
- **ST3:** Koden teller bare på `evnstudio.no`. Ingen forespørsler utenfor localhost i noen kjøring.
- **ST6:** Ingen informasjonskapsler, og koden har ingen ID eller fingeravtrykk.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2, verifisert feil (ikke en del av rettingen), «Start helt på nytt»:** Fokus blir ikke i dialogen, og bakgrunnen er ikke `inert`.
  - Gjenskap: lag en lagring og åpne «🗑️ Start helt på nytt». Trykk Tab: fokus går fra «Ja, slett alt» til BODY og så til Start, tilbakelenken og «Start helt på nytt» bak boksen. Shift+Tab fra «Nei, behold alt» går rett ut til «Start helt på nytt».
  - Trykker man Enter når fokus står på Start, åpnes verdensvalget bak boksen, mens «Starte helt på nytt?» står åpen.
  - Et museklikk utenfor boksen treffer ikke Start.
  - Årsak: EVN-NULLSTILL bruker ikke `EVNPauseInert`.
- **T2, verifisert feil (fantes før, ikke rettet), dyreboka:** Når boka åpnes med B eller 📖, blir fokus stående på BODY eller 📖. Tab går videre til HUD-knappene bak boka (🔊, 📖, 🌍, ✕, Snik, Håv). Esc og ✕ lukker boka som før.
- **F3, verifisert feil (kjent, uendret som oppgitt):**
  - `{"v":1,"reddet":{"gata":null}}` gir TypeError ved Start. Verdensvalget vises ikke, og «Start helt på nytt» er skjult.
  - `{"gata":5}` gir `reddet.includes is not a function`.
  - `"reddet":"x"` og `{"gata":"katt1"}` feiler ved fangst.
  - Ugyldig JSON, `[]`, `null`, `{"v":1}` og `v:2` virker.
  - Lagring fra v0.10.3 virker: 3 dyr ble lest, og ny fangst ble lagt til.
- **K2, verifisert feil (kjent funn for alle spill, delvis rettet):** Mangler WebGL, får barnet nå en melding (se B3). Men det finnes fortsatt ingen global feilfanger. En kastet feil under spilling ga ingen melding og ingen «Last inn på nytt», og det samme gjelder F3-feilene over.
- **B3, mulig problem (oppstartsdelen er rettet):** Uten WebGL, og når bare spillets lerret feiler, kommer en gul melding med `role="alert"`. Start er slått av («3D virker ikke her»), og tilbakelenken virker. Det kommer ingen ufangede feil. Klikk og Enter på Start gir ingen klikkhendelse, så statistikken teller ikke en start.
  - Fortsatt uhåndtert: tapt WebGL-kontekst under spilling (`webglcontextlost` finnes ikke i koden). Om 3D faller ut midt i spillet, blir det trolig ingen melding. For å avgjøre det må man fremkalle `WEBGL_lose_context` under spilling.
  - Lavere grafikk på mobil er bare kodelest.
- **ST1, avvik (felles, uendret):** `statistikk.js` lastes nederst i `<body>` med `defer`. Spillet sender ikke `evn-start`, og starten telles ved klikk på `#startBtn`, som bare åpner verdensvalget.
- **ST2, avvik (felles, kodelest):** Verken spillet eller `statistikk.js` bruker `EVNAktivTid`. Spilletiden telles mens fanen er synlig, også i pause.
- **ST4, avvik (felles, kodelest):** `statistikk.js` har ingen hendelser for `feil-dyrepatruljen-*`.
- **ST7, avvik (felles):** Den godkjente statistikkløsningen er ikke på plass. `evn-start`, `versjon-dyrepatruljen-*`, feilhendelsene og `EVNAktivTid` mangler.
- **ST8, avvik:** `test/statistikk/` finnes verken på grenen eller på origin/main.
- **Felles kode, mulig problem:** EVN-PAUSE er ikke lenger lik i alle spill. Dyrepatruljen har fått `settInert`, Tab-fellen og `window.EVNPauseInert`. Kommentaren sier fortsatt «EVN-PAUSE v2 … samme kode i alle EVN-spill», men Fossil Zoo, Mørkeskogen og Era Defenders har den gamle v2 uten disse endringene. ENDRINGSLOGG nevner ikke at felles kode er endret. En voksen bør avgjøre om endringen skal få nytt versjonsnummer og tas inn i alle spill, eller være særkode for dette spillet.
- **Standardens oversikt, mulig problem (kjent):** Dyrepatruljen mangler fortsatt i «Hvilke krav gjelder for hvert spill». Etter koden gjelder B1, B2 og B3.

## Anbefalte forbedringer
- Bruk `EVNPauseInert` (eller tilsvarende) i EVN-NULLSTILL og for dyreboka. Flytt også fokus til ✕ når boka åpnes.
- Den deaktiverte Start-knappen uten 3D ser fortsatt helt aktiv ut: grønn, med skygge og pulsanimasjon. En grå stil for `:disabled` vil gjøre det tydelig at den ikke kan trykkes.
- Håndter `webglcontextlost` med samme melding og en «Last inn på nytt»-knapp, og legg inn en felles feilfanger (K2).
- `lastInn()` bør godta bare lister med tekst i `reddet` og rydde bort resten, uten å slette gyldige verdener (F3).
- `settLyd(lydPaa)` skriver `evn-dyrepatruljen-lyd='paa'` allerede ved første innlasting. Det er harmløst, men valget kan lagres først når spilleren endrer det.
- Lydvalget finnes ikke på startkortet eller i pausen. L er sperret mens pausen er åpen, og 🔊 er da `inert`. Det er greit, men en lydbryter i pausen vil være lett å finne.
- Fra før: På 320×568 overlapper styrespaken og Snik-knappen (målt med rektangler), og verdensvalget kan rulles sideveis (`scrollWidth` 370). I liggende format og på 320×568 ligger Start under bretten.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og jeg har ingen ekte enhet. Bildefrekvensen i SwiftShader sier ingenting om mobil.
- **Y2:** Fanebytte er bare simulert med `visibilitychange`, og da åpnes pausen. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (uendret).
- **T1, T3, B1 og B3 (E):** Ekte berøring, iPhone og Android er ikke testet. Lyden er ikke hørt på høyttaler, bare målt med oscillatorer. Lavere grafikk på svake enheter er ikke målt.
- **T4:** Bare kodelest. 🔊 og 🔇 har både tekstetikett og `aria-pressed`. WebGL-meldingen (mørk brun tekst på lys gul bakgrunn) ser ut til å ha god kontrast, men kontrasten er ikke målt med verktøy.
- **U2 og U3 (V):** Even har ikke prøvd lydbryteren, meldingen uten 3D eller den endrede pausen.
- **ST5:** Bare kodelest. Det sendes ingenting på localhost, og testsiden for statistikk finnes ikke.
- **ST1–ST8 etter publisering:** Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for dette spillet. Ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert.
- **B4, B5, B6 og B7:** Gjelder ikke, fordi spillet ikke har kamp eller skrekk, ikke har læringsinnhold med fakta, ikke kan installeres som app og ikke har fritekst. Det forutsetter at en voksen bekrefter oversikten.
- **Lange økter og alle 150 dyr i dyreparken på svake telefoner:** Ikke testet.
- **Testservere:** To lokale `python -m http.server` som jeg startet, kunne ikke stoppes («Ingen tilgang»): port 8791 (PID 46616) og port 8863 (PID 6384). Port 8791 var allerede i bruk av en annen prosess, og `localStorage` for 127.0.0.1:8791 i nettleserpanelet ble tømt ved en feil. Testene ble deretter kjørt med en egen Node-server, som er stoppet. Profilene til den hodeløse Chrome er slettet.

## Klar for testing hos Even?
JA MED FORBEHOLD – B1 og oppstartsdelen av B3 er rettet, og T2 er rettet for pause, kart og «Vil du avslutte?». F1, lagring fra v0.10.3, styring, snik, håv, plystring, kart og dyrebok virker som før, og jeg fant ingen kritisk feil. Forbehold: T2 er ikke oppfylt for «Start helt på nytt» og dyreboka. F3, K2 og ST1, ST2, ST4, ST7 og ST8 er fortsatt avvik som en voksen må ta stilling til før publisering. Y1 og test på ekte enhet mangler.
