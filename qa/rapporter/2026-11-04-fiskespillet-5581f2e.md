# EVN Game QA: Fiskespillet 0.3.0
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 5581f2ea8de5235b0cade3be7e6778ec2c401de0
Testkvittering: evn1 commit=5581f2ea8de5235b0cade3be7e6778ec2c401de0 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – ny kontroll etter retting, og dette er siste commit før versjonen eventuelt foreslås publisert. Diffen mot 5e15600 er én linje i `spill/fiskespillet/index.html` (`kanPause` sjekker `#feil`) og én rad i `ENDRINGSLOGG.md`. Hele spillet er likevel kontrollert på nytt. `test/kjor.mjs` ga 98 OK, 0 FEIL, 0 VARSEL og 1 KJENT (Fossil Zoo T3 `user-scalable=no`, kjent funn i standarden, ikke dette spillet). To suiter er ikke innført (`test/statistikk/`, `prototype/ui/`).
Testet: Lokal `python3 -m http.server` på 127.0.0.1:8780 (HEAD) og 127.0.0.1:8781 (`git archive` av ed88ba1, 0.2.1, brukt til ekte lagring fra forrige versjon). Begge er stoppet, og Chrome er lukket (0 prosesser). Nettleser: headless /usr/bin/google-chrome via puppeteer-core, WebGL via SwiftShader (omtrent 5 bilder/s). Størrelser: 1280×800 med mus og tastatur, og 375×812, 740×360, 320×568 og 568×320 med emulert berøring og DPR 2. Jeg brukte ekte tastetrykk og musklikk via CDP, trykk via `touchscreen.tap` og fingerdrag via `Input.dispatchTouchEvent`. Fanebytte ble gjort med en ekte ekstra fane (`bringToFront`, `visibilityState` ble `hidden`). `blur` ble sendt som syntetisk hendelse. Testtilstand ble satt opp med `#test`, `window.__spill` (flytting av båten, stang 4 for Kraken) og lagringer skrevet fra en annen side på samme opprinnelse. I akvarietesten ble `sistAktiv` satt tilbake i tid. Uventede feil ble laget med et innebygd skript (`setTimeout(()=>{throw …})`). Statistikk som på evnstudio.no ble testet ved avskjæring: `https://evnstudio.no/…` ble servert fra disk, `gc.zgo.at/count.js` ble byttet med en stubb, og alt annet eksternt ble stoppet. `setInterval(…, 5000)` ble kjørt med 50 ms. Skriptene ligger i `/home/claude/qa-tmp4`. Hver nettleser hadde egen profil, og localStorage ble tømt etter hver økt. `git status` er tom. Ingen resultater fra eldre commits er brukt som bevis.

## Oppfylte krav
- **F1:** Start med musklikk og trykk virker, og `evn-start` sendes én gang. Båten kjører med piltaster (4,1 enheter på 4 s ved lav bildefrekvens på PC) og med fingerdrag på mobil (12–13 enheter på 4 s, styrespaken vises). Fisking: normal modus ga 5/5 fisk på 72 s og `#test` på 32 s, med «📦 Båten er full» til slutt. I Havna virker Akvariet, Selg alle (20 000 → 20 027) og kjøp av stang og båt (→ 19 627, stang 1, båt 1, ingen NaN). Havna lukkes med Esc, ✕, trykk utenfor og Lukk. Fiskeboka åpnes med I og 📖 og lukkes med Esc og ✕. Pausen virker med P, Esc, ⏸ og Fortsett, og båten står stille mens den er åpen. Kartet virker med M, 🗺️, ✕ og Esc, og båten står stille. Avslutt: Nei fra 🚪 (knapp og Esc) og fra pausen, og spillet går videre uten `inert` igjen. «Ja, avslutt» går til forsiden, og lagringen beholdes. Kraken fanges med 21 trykk og gir +10 000 og «OPPDRAGET ER KLART!». Uten trykk slipper den unna (29 s) med «Prøv igjen» og et tips. Samme flyt (start, Havna, Fiskeboka, kart, pause, Avslutt → Nei) virker med trykk i alle fire mobilstørrelser.
- **F2:** Tilstanden er lik felt for felt etter kjøp, pause og omlasting. «Start helt på nytt» vises bare med fremgang. Nei og Esc beholder lagringen. Ja sletter bare `evn-fiskespillet-v1`, mens `evn-fiskespillet-lyd` og `evn-spilletid-fiskespillet` beholdes, og lenken skjules etterpå.
- **F2 / testmodus:** Med ekte lagring i `-v1` starter `#test` med 20 000 og «Versjon 0.3.0 · testmodus». Fisking, salg, kjøp, pause, omlasting og nullstilling i testmodus skrev og slettet bare `evn-fiskespillet-test`. En ødelagt testlagring ga `evn-fiskespillet-test-kopi`. `-v1` var lik tegn for tegn etter hvert trinn, og normal modus leste den uendret (777, stang 1, båt 1, plass 10, `last`, `akv`, `rest` 0,25).
- **F3:** Ugyldig JSON, `v:2` og `[]` gir kopi i `-v1-kopi`. `null`, `"tekst"`, feil typer og `1e400` gir ingen feil og ingen NaN eller undefined i HUD og butikk. Plass 7 og akvarieplass 8 blir 5/5. Båt 1 med plass 13 og akvarieplass 12 blir 10/10. En ekte lagring laget i 0.2.1 (ed88ba1) leses likt felt for felt i 0.3.0 og gir ingen kopi.
- **U1:** Startkortet har EVN STUDIO, tittel, mål, oppdrag, styring, ▶ Start, «← Tilbake til EVN Studio», «Start helt på nytt» (4 px under, uten overlapp) og «Versjon 0.3.0». Start er synlig, og det er ingen sideveis rulling i noen av de fem størrelsene.
- **U2 (Q):** Handlingsknappen sier hva man kan gjøre («🎣 Fisk», «⚓ Havna», «📦 Båten er full», «🐙 Fang Kraken»). Pausen har «Slik styrer du», med egen tekst for PC og for berøring.
- **U3 (Q):** Tekstene er korte og på enkel norsk. Tap er mildt. Akvarieteksten («… hvert minutt mens du spiller») stemmer med oppførselen.
- **T1 (emulert):** Alle synlige knapper og lenker er minst 44×44 px i alle fem størrelsene, i tilstandene start, nullstill, spill, Havna (Lever og Butikk), Fiskeboka, kart, pause og Avslutt. Se forbedringen om 🔊 og 📖 ved 740×360.
- **T3:** `prefers-reduced-motion` gir 0 kamerarist per bilde i Kraken-kampen, mot 0,028 uten. Viewport sperrer ikke zoom (statisk kontroll og `test/kjor.mjs`).
- **T4 (Q):** Sjeldenhet vises med navn og stjerner, og HUD bruker tekst. Teksten er hvit på mørkeblått.
- **K1:** Ingen ufangede feil, ingen konsollfeil og ingen svar med status 400 eller høyere fra spillet i noen økt. De eneste 404-ene i serverloggen er `/favicon.ico`, som nettleseren hentet til hjelpesiden `fonter.css` jeg brukte til å skrive lagringer. Røyktesten er OK.
- **K2 (det tidligere funnet er rettet):** Når feilkortet vises, åpner verken `blur`, ekte fanebytte, P, Esc eller M pausen eller kartet. `#feil` er ikke `inert`, fokus står på «Last på nytt», midtpunktet treffer knappen, Tab og Shift+Tab blir på knappen, og klikk laster siden på nytt. Det samme gjelder trykk på 375×812. Kortet virker også når feilen kommer mens pausen, kartet, Havna eller «Vil du avslutte?» er åpent, og etter at pausen eller kartet lukkes med Esc eller M. Lagringen er riktig (4321 før og etter). Se T2-avviket.
- **K3:** 0.3.0 står i tittel, startkort og `VERSJON`. Raden i `ENDRINGSLOGG.md` (ikke publisert) er utvidet med pausen over feilkortet, og den stemmer med det jeg målte.
- **S1:** CSP er uendret og uten `unsafe-eval`, med `object-src 'none'`. Bare gc.zgo.at og evnstudio.goatcounter.com er nevnt. Ved kjøring var det ingen CSP-brudd. Lokalt var det ingen eksterne forespørsler, og med produksjonsoppsettet ble bare `gc.zgo.at/count.js` hentet.
- **S2 (Q):** Ingen konto, chat, reklame eller kjøp med ekte penger.
- **S3:** Ingen fritekst (0 treff på `input`, `textarea` og `contenteditable`).
- **S4 (Q):** Personvernsiden sier at spillstarter og grove spilletidsintervaller telles, og at spilletiden kan telle pauser. Det stemmer med det som skjer (se ST2).
- **ST1:** `statistikk.js` med `data-spill="fiskespillet"` står i `<head>` før spillets skript. `start-fiskespillet` kommer én gang, også når Start klikkes en gang til. Den automatiske testen (`test/statistikk/`) mangler.
- **ST3:** Skriptet stopper utenfor evnstudio.no. Lokalt ble verken `gc.zgo.at` lastet eller hendelser sendt.
- **ST5:** Bare godkjente navn ble sendt, hvert én gang: sidevisning, `start-fiskespillet`, `spilletid-fiskespillet-01min` og `-05min`. Ingen fritekst. Den automatiske testen mangler.
- **ST6:** `document.cookie` er tom, og koden har ingen ID. Lagringsnøklene er bare spillets egne.
- **B1 (av/på og lagring kjørt):** L og 🔊 slår lyden av og på, og valget lagres i `evn-fiskespillet-lyd` («av»/«pa»). Verdien overlever omlasting og nullstilling (F2). At knappen viser 🔇 etter omlasting, er i denne kontrollen bare kodelest (`settLyd(lydPa)` ved oppstart).
- **B2:** Kartet viser deg, havna, fiskesteder og Kraken, og båten står stille mens kartet er åpent. Kartkortet kan rulles ved 568×320 (377/290 px) og 740×360 (363/330 px).
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her» med forklaring, og Start er slått av.
- **B4 (Q):** Kraken-kampen er valgfri, og et tap er mildt med «Prøv igjen».
- **Akvariet (0.3.0):** Med aktivitet ga akvariet 6566 per minutt spilltid, likt `akvPerMinutt` (6566). Etter 180 s uten inndata kom det ingen inntekt (0 på 10 s, ledig 190–200 s). Etter ett tastetrykk kom inntekten igjen (+177 på 1,6 s spilltid). Musebevegelse nullstiller også tidtakeren.
- **Kjent funn i standarden:** «T2, alle spill: Tab går ut av pausekortet» gjelder ikke Fiskespillet. Tab blir i pausen (20 trykk, 0 ute). «K2: ingen global feilfanger» gjelder ikke Fiskespillet.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 – verifisert feil (nytt i denne kontrollen, ikke laget av 5581f2e):** Når en annen dialog lukkes etter at feilkortet vises, slipper Tab ut av feilkortet. Slik gjenskaper du feilen: Start, trykk P, kjør `setTimeout(()=>{throw new Error('x')},0)` som innebygd skript, og trykk Esc. Feilkortet vises fortsatt, og fokus står på «Last på nytt», men tre Tab gir fokus på 🔊 (`lydKnapp`) bak kortet, og Shift+Tab gir 📖. Det samme skjer etter M fra kartet og etter Esc fra «Vil du avslutte?». Årsaken er at `settInert(null)` i `lukk`, `lukkKart` og `nei` (og Esc-håndteringen nederst i fila) fjerner `inert` fra alt, også når `#feil` vises. Klikk og trykk treffer fortsatt feilkortet, som dekker skjermen, så K2 er oppfylt. Fremgangen er lagret. Ikke kritisk.
- **ST2 – verifisert feil (står fortsatt):** `window.EVNAktivTid` mangler (EVN-PAUSE v2). Med produksjonsoppsettet ble `spilletid-fiskespillet-01min` og `-05min` sendt mens pausen var åpen hele tiden etter start. Gjelder felles kode.
- **ST4 – verifisert feil (står fortsatt):** En uventet feil under spilling gir feilkortet, men ingen `feil-fiskespillet-spill`. `feil-fiskespillet-oppstart` finnes heller ikke.
- **ST7 – verifisert feil (står fortsatt):** `versjon-fiskespillet-0.3.0`, feilhendelser og aktiv tid mangler, så spillet har ikke den godkjente statistikken. `ENDRINGSLOGG.md` sier selv at den godkjente statistikken (`feature/statistikk`) ikke er tatt inn. Det må på plass før publisering.

## Anbefalte forbedringer
- **T2 / K2:** Når `#feil` vises, bør det å lukke en annen dialog sette `inert` på nytt rundt feilkortet, for eksempel `settInert($('feil'))` i stedet for `settInert(null)`.
- **Nytt (verifisert, ikke brudd på T1):** Ved 740×360 ligger 🔊 over høyre del av 📖-pillen når pengene har 3–5 sifre (målt ved 999 og 50 000). Da dekkes «… av 5000», og 21 % av pillen kan ikke trykkes (resten er omtrent 113×44 px). Ved 0 og 1 234 567 skjer det ikke, fordi pillen da får plass eller går til neste linje. Årsaken er at `#hud` har `right:250px`, mens `#hoyre` er 290 px bred når teksten «Avslutt» vises. Ingen av de andre fire størrelsene har problemet.
- Feil før Start (på startkortet) gir ikke feilkort (`spillTilstand === 'start'` hoppes over), og spillet kan startes som vanlig etterpå. Det er greit, men da telles heller ingen `feil-…-oppstart` når statistikken kommer.
- Står fortsatt fra før:
  - Fokus etter Start havner på BODY.
  - Meldingen dekker en del av 📖-pillen ved 375×812 (23×20 px) og 320×568 (8×46 px).
  - Den klistrede ✕ i Havna legger seg over «💰 Selg» ved rulling i 568×320 (22×32 px). Med to fisker i båten gjenskapte jeg det ikke ved 375×812 og 740×360.
  - Kartet ved 568×320 må rulles (377/290 px). I min måling var ✕ fortsatt innenfor skjermen etter rulling helt ned.
  - `-kopi`-nøkkelen slettes ikke ved nullstilling (`nokler: [LAGRING]`, kodelest).
  - `webglcontextlost` håndteres ikke (0 treff). Uten WebGL kommer `Error creating WebGL context` som en ufanget feil.
  - Testmodus skriver til felles `evn-spilletid-fiskespillet` (spilletid fra `#test` blandes med ekte spilletid) og `evn-fiskespillet-lyd`.
  - Fiskespillet bør stå i standardens oversikt «Hvilke krav gjelder for hvert spill». Jeg har brukt B1–B4.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes ikke på grenen eller på main, så `?auto` kunne ikke kjøres. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging etter publisering. Milepæler etter 15, 30 og 60 minutter er ikke testet.
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader på omtrent 5 bilder/s sier ingenting om ekte maskinvare.
- **Y2 – kun kodelest (delvis kjørt):** Fanebytte (ekte, `visibilityState: hidden`) og `blur` åpner pausen, og Esc fortsetter spillet. Det er kjørt og virker. At farten er uavhengig av skjermfrekvensen, er bare kodelest (dt-basert, med tak på 0,05 s). 60/120 Hz kunne ikke kjøres. Ved lav bildefrekvens går spillet saktere enn sanntid.
- **B1 – kun kodelest (delvis):** At spillet leser lydvalget og viser 🔇 etter omlasting, er ikke kjørt i denne kontrollen.
- **T1, T3, B1 (E):** Ekte berøring, klypezoom på iPhone og Android, rulling med fingeren og faktisk lyd er ikke testet. Mobil er emulert.
- **B3 (E):** Lavere grafikk og ytelse på svake enheter er ikke testet.
- **Akvariet (E/V):** At 3 minutter er riktig grense når et barn bare ser på eller venter på fisk, må prøves på ekte enhet og av Even. Musehjul (`wheel`) ble ikke prøvd i headless.
- **U2, U3, B4 (V):** Om Even og 7-åringer forstår spillet og synes Kraken-kampen er passe vanskelig, må Even teste.
- **B5–B7:** Gjelder ikke (ingen læringsfakta, app-installasjon eller fritekst).
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for dette spillet.
- Lange økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil, og F1 er testet med ekte tastetrykk, klikk og emulert berøring. K2-funnet fra 5e15600 er rettet: pausen legger seg ikke lenger over feilkortet. Før publisering må statistikken (ST2, ST4, ST7) på plass, og det gjenstår et lite T2-avvik (Tab slipper ut av feilkortet etter at en annen dialog lukkes). Y1, ekte berøring og spillopplevelsen er ikke testet.
