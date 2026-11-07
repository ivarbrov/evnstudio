# EVN Game QA: Dyrepatruljen 0.11.6 (pilot, EVN-PAUSE v3)
Grunnlag: agent 2.2 (utkast, fra arbeidstreet; avsnittet «Felles meny og styring» fra agent 2.3 på `kvalitet/ui-standard` er brukt som rådgivende tillegg), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1, og S2 etter 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit ce8bd02fcdd7456a2fb95713527d846f7224ce38
Testkvittering: evn1 commit=ce8bd02fcdd7456a2fb95713527d846f7224ce38 tester=675e701e13bf arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: full – oppdraget ber om det. Endringen er dessuten ny felles kode (EVN-PAUSE v3), som etter tabellen er høyt nivå.
Testet: Alt er kjørt mot ce8bd02, og ingen resultater fra tidligere commits er brukt.
- **Testsuite:** `node test/kjor.mjs` med /usr/bin/google-chrome ga 151 ok, 0 feil, 0 varsel og 2 ikke innført (`statistikk`, `ui`). Ingen kontroller ga FEIL eller VARSEL.
- **Testserver:** Serveren på 8765 svarte ikke. Jeg startet derfor en egen (`python3 -m http.server 8766`) og stoppet den etterpå.
- **Nettleser:** Headless Chrome styrt med egne CDP-skript i /tmp/qa-0116/. 3D ble tegnet med SwiftShader, og `localStorage` ble tømt før hver test.
- **PC:** 1280×800, med ekte tastetrykk og museklikk via CDP Input.
- **Mobil:** Bare emulert, i 375×812, 740×360, 320×568, 568×320 og 812×375. Knapper ble trykket med CDP-berøring, og styrespaken ble dratt. Safe area ble simulert med 47/34 px.
- **Base:** 0.11.5 (`git show 43aa7b9`) ble servert på samme origin for å teste lagring fra forrige versjon og tilbake.
- **Statistikk:** evnstudio.no ble omdirigert til den lokale serveren med Fetch-avskjæring, og GoatCounter ble stubbet. Ingen tellinger nådde den ekte tjenesten.

## Oppfylte krav
- **F1:**
  - Start → Gata og W flytter helten (0,83).
  - P, Esc, ☰, blur og fanebytte åpner menyen. Mens menyen er åpen, står helten stille (W gir 0,000).
  - Esc, P, ✕, Fortsett og klikk utenfor lukker menyen. Avslutt → «Ja, avslutt» går til `/`.
  - Dyreparken virker, med meny og kart.
  - På emulert mobil virker Start, Gata, styrespaken (1,25–1,50), ☰/Fortsett, 📖, 🗺️/✕ og Avslutt/Nei i alle fem størrelsene.
- **F2:**
  - Fangsten lagres, også med ekte mellomrom, og overlever omlasting.
  - «Start helt på nytt» spør først. Fokus står på Nei, og Esc beholder lagringen. Ja sletter bare `evn-dyrespillet-v1`.
- **F3 (del):**
  - Lagring fra 0.11.5 (2 dyr og lyd av) leses uendret, og en ny fangst legges til.
  - 0.11.5 leser lagringen fra 0.11.6, så tilbakeføring virker.
  - Ugyldig JSON, `null`, `[]`, `"tekst"` og `{"v":1}` gir ingen krasj, både i lagringen og i spilletiden.
- **U1:** Startkortet har mål, styring, Start, «← Tilbake» og «Versjon 0.11.6».
- **U2 og U3 (Q-delen):** Styringshjelpen står på startkortet og under «🎮 Slik styrer du» (H). Den nevner ☰, P/Esc, L, I/📖 og M/🗺️. Tekstene er korte og på enkel norsk.
- **T1 (emulert):**
  - ☰ er 48×48 (96×48 med tekst), snarveiene 48×48 og ✕ 48×48.
  - Menyrutene er minst 60 px høye, og Fortsett er 56 px (48 px i lave vinduer).
  - Ingen sideveis rulling.
- **T2:**
  - Tab holder seg i menyen, kartet, dyreboka og «Vil du avslutte?». Etter lukking er 0 elementer `inert`.
  - Enter på ☰ åpner menyen. Esc setter fokus tilbake på ☰, og mellomrom etterpå åpner ikke menyen igjen.
- **T3:** Den statiske testen er OK. Med `reduce` har både menyen og Start `animation: none`.
- **K1:** 0 sidefeil, 0 konsollfeil, 0 svar på 400 eller høyere og 0 eksterne forespørsler, unntatt de bevisste feilene i F3- og K2-testene. Røyktesten er OK.
- **K3:** «Versjon 0.11.6» på startkortet, `VERSJON = 'v0.11.6'` og ny rad i ENDRINGSLOGG, som stemmer med det som er målt.
- **S1:** CSP er uendret i diffen. Den statiske testen er OK, uten nye domener.
- **S2:** E-shop og Garderobe er interne lenker til `/butikk/` og bruker bare E-coins. `document.cookie` er tom.
- **S3:** Ingen fritekst er lagt til.
- **S4:** Lagringsnøklene er uendret (`evn-dyrespillet-v1`, `evn-dyrepatruljen-lyd`, `evn-spilletid-dyrepatruljen`), og personvernsiden er uendret.
- **B1:** L slår lyden av og på både i spillet og i menyen. Ruten viser «🔇 Lyd av», og valget fra 0.11.5 huskes.
- **B2:**
  - M, 🗺️, Kart-ruten og M i menyen åpner kartet. Det viser «🔴 Du er her · 🏙️ Gata» og «🦒 Dyreparken».
  - Helten står stille, og spilletiden øker med 0 ms mens kartet er åpent (også med menyen og dyreboka åpne).
- **B3 (oppstartsdelen):** Uten WebGL er Start slått av og viser «3D virker ikke her». Det kommer en `role="alert"`-melding, og 0 feil.
- **ST3:** Lokalt gikk det ingen forespørsler ut. Fra det emulerte evnstudio.no ble det sendt.
- **ST5 (det som er kjørt):** Ingen hendelse før Start. Etter Start → Esc → Start → Gata → Meny → Velg verden → Gata → M, I og L kom nøyaktig én `start-dyrepatruljen`.
- **ST6:** Ingen informasjonskapsler og ingen ID-er (kodelest og kjørt).
- **Rådgivende (UI-standard 1.1):**
  - **KM12 og kopikontroll:** Kopien mellom merkene er lik `felles/ui/evn-pause-v3.js` tegn for tegn (`cmp` og suiten).
  - **KM1:** ☰ står oppe til venstre innenfor safe area (x 57 med innfelling) og skjules mens menyen eller en dialog er åpen.
  - **KM2:** Bare to snarveier, 🗺️ og 📖, står oppe til høyre.
  - **KM3:** Rekkefølgen er Hjelp, Lyd, Kart, Dyreboka, Velg verden, E-shop, Garderobe og Avslutt. E-coins-saldoen vises.
  - **KM4:** Avslutt står ikke i HUD, og verdensvalget har fortsatt Avslutt (KS4). Avslutt bekreftes, og Esc gir «Nei» (KS10).
  - **KM5:** Status står øverst i midten.
  - **KM6:** Styrespaken står nede til venstre, og Håv nede til høyre (92 px).
  - **KM8:** I og B åpner dyreboka, H åpner hjelpen og L virker i menyen.
  - **KM9:** Hjørneknappene er 48 px med 14 px avrunding.
  - **KS7:** Esc lukker først hjelpen og så menyen.
  - **KS9:** Lydbryteren står i menyen og på tasten L.
  - **Uendret spill:** Spillmekanikk, lagringsformat, statistikkhendelser og E-coins-belønninger er uendret i diffen.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Status «Sniker» skjules av meldinger, verifisert feil (ny i 0.11.6, rådgivende: KM5, «ingen overlapp med status eller meldinger»):**
  - `#snikMerke` er flyttet til midten (top 66 px) og ligger nå under `#beskjed` (top 70 px). Meldingen dekker merket helt i 1280×800, 740×360, 568×320 og 812×375. Se skjermbildet /tmp/qa-0116/skjerm/snik-beskjed-1280.png.
  - **Gjenskap:** Trykk C i Gata og fang et dyr. «Du reddet …» dekker «🤫 Sniker» i 2,2 s.
  - I 375×812 og 320×568 overlapper de ikke, fordi meldingen flyttes ned.
- **Versjonsnavnet «EVN-PAUSE v3» er brukt to steder, mulig problem:**
  - Gjeldende ST2 (standard 1.1) sier at aktiv spilletid kommer fra «EVN-PAUSE v3, `window.EVNAktivTid`». Det er den planlagte pausen fra `feature/statistikk`.
  - Pilotens v3 har ikke `EVNAktivTid` (0 treff).
  - Hvis begge flettes inn, finnes det to ulike v3. Da kan kopikontrollen og ST2 ikke tolkes entydig.
  - **Hva som må til for å avgjøre det:** En voksen må bestemme hvilken av dem som er v3, og om den andre skal hete v4.
- **F3, verifisert feil (kjent, uendret):**
  - `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget kan ikke brukes.
  - **Gjenskap:** Legg verdien i `evn-dyrespillet-v1`, last siden på nytt og trykk Start.
- **K2, verifisert feil (kjent, alle spill):** En feil under spilling (`setTimeout(() => { throw … })`) gir ingen vennlig melding og ingen «Last inn på nytt».
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke (0 treff).
- **ST1, avvik (kjent):** `statistikk.js` lastes nederst i `<body>`, og spillet sender ikke `evn-start`. Starten telles ved klikk på `#startBtn`.
- **ST2, avvik (kjent):** `EVNAktivTid` finnes ikke. `statistikk.js` teller minutter mens fanen er synlig, også i pause (kodelest).
- **ST4, avvik (kjent):** Det sendes ingen `feil-dyrepatruljen-*`.
- **ST7, avvik (kjent):** Statistikken følger ikke 1.1, og `versjon-dyrepatruljen-0.11.6` sendes ikke.
- **ST8, avvik (kjent):** `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`).
- **KS12, verifisert feil (rådgivende):** Fokus går ikke tilbake etter en del dialoger.
  - Etter «Avslutt → Nei/Esc» fra menyen havner fokus på BODY, ikke på ☰. Det samme skjer etter «Velg verden» og «Dyreboka» fra menyen, og etter at dyreboka er lukket fra 📖-snarveien.
  - Fra verdensvalgets Avslutt havner fokus fortsatt på BODY (kjent fra 0.11.4).

## Anbefalte forbedringer
- **To veier til E-shop i menyen:** `ecoins.js` legger saldolinja «0 E-coins · E-shop» (en lenke) over Fortsett, i tillegg til 🛒-ruten.
  - Lenken lagrer ikke før den går til butikken, men ruten gjør det.
  - Linja gjør også at Fortsett ikke står først. KM3 sier «størst, først».
  - Vurder å vise saldoen uten lenke, eller under Fortsett.
- **Lave og smale vinduer:**
  - I 320×568 må menyen rulles for å nå nederste rad (Garderobe og Avslutt, y 540–612 i et kort som slutter på 534).
  - I 568×320 er nederste rad kuttet med 7 px.
  - Fortsett er synlig i alle størrelsene.
- **320×568:**
  - Statusen brytes som «🏙️ Gata / · 🐾 0/10», med punktet først på linje to.
  - Statusen berører «Sniker» med 1 px.
  - Styrespaken og Snik overlapper (kjent).
- **Hjelpeteksten (KS3):** Den viser tastene P, Esc, L, I og M også på mobil. Bør tilpasses den inndataen som brukes.
- **L virker ikke mens dyreboka er åpen.** Før 0.11.6 virket L så lenge HUD-en var synlig.
- **UI8a–c (målt med summen av rektangler og sirkler for styrespak og runde knapper, ikke gjeldende for spillet):**
  - **Informasjon:** 2,5 % i 1280×800, 2,0 % i 375×812 og 4,0 % i 320×568.
  - **Styring:** 2,4 % i 1280×800, 9,9 % i 375×812, 11,4 % i 740×360 og 16,6 % i 320×568 og 568×320.
  - **Kontekst, med en testmelding på to linjer:** 11,6 % av skjermen og 37,5 % av kjernesonen i 568×320, og 26 % av kjernesonen i 320×568. Dette er over testmålet, men plasseringen av meldingen er uendret fra 0.11.5.
- **Fra før:** validering i `lastInn()`, en global feilfanger og håndtering av `webglcontextlost`. Start ligger under bretten i 740×360, 812×375, 320×568 og 568×320.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og SwiftShader sier ingenting om bildefrekvens. Ikke testet.
- **Y2:** Fanebytte er bare simulert med blur og `visibilitychange`, og begge åpner menyen. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest. Kun kodelest.
- **T1, T3, B1 og B3 (E):**
  - Ekte berøring, safe area på iPhone med hakk og knipe-zoom er ikke testet.
  - Hørbar lyd er ikke testet.
  - Lavere grafikk på svake enheter er ikke testet.
- **T4:** Bare delvis målt (menyteksten #1d2440 på lys bakgrunn, tastemerker med opasitet 0,7). Ikke testet som helhet.
- **U2 og U3 (V):** Om Even forstår ☰ Meny, finner Avslutt i menyen og merker at 🔊 og 🌍 er flyttet, må han selv prøve.
- **KM6, KM10 og KS13 (E, V):** Gjelder tommelgrep, ikoner og safe area på ekte enheter.
- **ST2, ST4 og milepælene for spilletid:** `test/statistikk/` finnes ikke. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **B4–B7:** Gjelder ikke, etter oversikten i standarden.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for Dyrepatruljen. Målt bare som forbedringsforslag.
- **Klarspråk:** Status forslag, så det er ikke kontrollert.
- **Automatiske tester (A) som mangler:** F2, F3, T4, Y2, K2, B1, B2, B3, S2, S3 og ST2–ST8.
- **Annet som ikke er testet:**
  - Hele verdener med ekte håvsving i bakkete verdener.
  - At E-shop- og Garderobe-lenkene fører tilbake til spillet. Kodelest: `#garderobe` velger fanen.
- **Testserver:** 8766 er startet og stoppet. 8765 svarte ikke, og jeg har ikke rørt den. `git status` er tom.

## Klar for testing hos Even?
JA MED FORBEHOLD – ☰ Meny, snarveiene, tastene, pausen, lagringen fra 0.11.5 og statistikken for spillstart virker på PC og emulert mobil, uten konsollfeil eller kritiske feil. Forbehold: Det er ikke testet på ekte mobil (Y1, E). «Sniker»-merket skjules av meldinger (nytt). Versjonsnavnet v3 kolliderer med ST2. De kjente avvikene F3, K2, B3, ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne.
