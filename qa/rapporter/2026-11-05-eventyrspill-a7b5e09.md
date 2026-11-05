# EVN Game QA: Era Defenders (eventyrspill) 0.21.2
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit a7b5e0970a0824ddc4cbc0002aa3c38fc7598266
Testkvittering: evn1 commit=a7b5e0970a0824ddc4cbc0002aa3c38fc7598266 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om fullt nivå, og versjonen foreslås publisert. Dette er ny kontroll etter retting (f7c583d) og fletting av origin/main (a7b5e09). Alt er kjørt på nytt på a7b5e09. Resultater fra 4b88a0f er ikke brukt som bevis. Mot origin/main er bare `spill/eventyrspill/index.html`, `sw.js`, ENDRINGSLOGG og QA-rapporter endret. Kontrollert mot de gjeldende kravene i 1.1 (F, U, T, Y, K, S, ST) og B2, B4, B6 og B7. UI1–UI10 er ikke tatt i bruk i spillet og er ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert. Oppdraget oppga ikke standardversjon.
Testet: Lokal `python3 -m http.server`. Port 8883 serverte arbeidstreet (a7b5e09), og port 8884 serverte `git archive origin/main` i /tmp/qa-era-a7b5/main, til sammenligning. Nettleseren var Google Chrome headless via Playwright. Jeg brukte ekte tastetrykk (Enter, D, P, Esc, M, B, Tab) og klikk. Berøring ble testet i emulert mobil (`hasTouch`, `isMobile`, DPR 2) med `tap` og CDP `Input.dispatchTouchEvent`. Størrelser: 1280×800, 375×812, 740×360, 320×568 og 568×320. Hakk ble emulert med CDP `Emulation.setSafeAreaInsetsOverride`: portrett med 47/34 px oppe og nede, liggende med 47 px på sidene og 21 px nede. Testtilstand (penger, liv, lagringer) ble satt i testnettleseren. Hver test brukte en ny localStorage-kontekst. `node test/kjor.mjs --base origin/main`: 98 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3), 2 ikke innført. Begge testserverne er stoppet. Skript og skjermbilder ligger i /tmp/qa-era-a7b5/. Arbeidstreet er uendret (`git status` er tom).

## Oppfylte krav
**Rettingen i f7c583d (tidligere funn)**
- **Meldingen under Basen-knappen og hakket: rettet.** I 568×320 med 47 px hakk på sidene starter boksen nå på x = 63 (16 + `kant.l`), mot x = 16 i 4b88a0f. I 740×360 med hakk ligger den på x 267–567, innenfor 47–693. Se /tmp/qa-era-a7b5/568x320-insetL-spill.png.
- **Basen-knappen over statusfeltet i 740×360 med hakk: rettet.** Knappen ligger nå på x 336–498, og statusfeltet slutter på x ≈ 303. Liv- og Kraft-linjene er frie. Se /tmp/qa-era-a7b5/740x360-insetL-spill.png.
- Uten hakk er alle plasseringer like som i 4b88a0f, for eksempel Basen x 289–451 og meldingen x 220–520 i 740×360.

**Oppdragets endringer (0.21.1 og 0.21.2), kjørt på nytt**
- **Basen-merket:**
  - Med 200 penger viste merket «⬆ 3». `kjopbareBygg()` ga 3, og basen hadde 3 aktive kjøpsknapper.
  - Lagring fra før epokene ga ⬆ 13 og 13 kjøpbare. Lagring i 0.21.0-format ga ⬆ 8 og 8 kjøpbare.
  - Knappens tilgjengelige navn er «Basen (B). Du har råd til 3 ting.».
  - Med redusert bevegelse er `animationName` `none`.
- **Meldingen:**
  - Den skjules etter 4 s, straks basen åpnes og straks spilleren blir slått ut.
  - Den kom ikke igjen etter «Prøv igjen».
- **Trygge kanter:**
  - `kant` leser t47/b34 og l47/r47/b21 med hakk, og 0 uten.
  - Ekte berøring (CDP) på den tegnede sverdknappen ga `holdtKnapp.sverd = true` i alle 8 kombinasjoner av størrelse og hakk.
  - Styrespaken flyttet helten 104–110 px. Basen åpnes og Tilbake lukker med `tap` i alle 8.
  - Ingen sideveis rulling: `scrollWidth` er lik bredden i alle størrelser.

**Krav**
- **F1** Oppfylt:
  - Start med Enter og med trykk. D flytter helten 90 px.
  - P setter pause: `tid` står stille, og pausekortet vises. Esc fortsetter, og `tid` går igjen.
  - B åpner basen, og Esc lukker den.
  - Avslutt viser spørsmålet med fokus på «Bli» (`evnBli`), og spillet står stille. Enter gir tilbake til spillet.
  - Når spilleren blir slått ut, blir tilstanden `slutt`, og «Prøv igjen» starter på nytt med pengene beholdt.
  - Røyktesten er OK.
- **F2** Oppfylt:
  - 123 penger var beholdt etter omlasting.
  - «Start helt på nytt» gir fokus på «Nei, behold alt», og Nei beholder lagringen.
  - «Ja, slett alt» sletter bare `evn-eventyrspill-v1`. `evn-spilletid-eventyrspill` er igjen.
- **F3** Oppfylt:
  - `{ikke json` og `{"niva":"x","bygget":5}` gir ny start uten feil.
  - En lagring fra før epokene (verden 5) blir verden 6 med nivå 6 og 500 penger.
  - En lagring i 0.21.0-format beholder nivå 9, verden 3, 900 penger og Vanskelig.
- **U1** Oppfylt: Startkortet viser «Versjon 0.21.2 · 7 tidsepoker», mål, styring, vanskelighetsgrad, Start og Avslutt.
- **U2** Oppfylt for Q-delen: Merket og meldingen viser hva spilleren kan gjøre. Styringshjelpen ligger i pausekortet.
- **U3** Oppfylt for Q-delen: De nye tekstene er korte og positive. Tap gir «Prøv igjen», og pengene beholdes.
- **T3** Oppfylt for A-delen: Viewport sperrer ikke zoom (statisk test OK), og `prefers-reduced-motion` slår av animasjonen på merket.
- **K1** Oppfylt: Ingen pageerror, konsollfeil eller svar ≥ 400 i noen kjøring. Røyktesten (med CSP-brudd) er OK.
- **K3** Oppfylt: 0.21.2 står i `<title>` og på startkortet. sw-cache er `eventyrspill-v0.34`, og ENDRINGSLOGG har rader for 0.21.1 og 0.21.2. Raden for 0.21.2 omtaler rettingen etter QA av 4b88a0f, og innholdet stemmer med diffen.
- **S1** Oppfylt: Alle statiske S1-kontroller er OK, og CSP er uendret mot main. Siden sendte ingen forespørsler utenfor 127.0.0.1.
- **S2** Oppfylt (statisk): Ingen konto, chat, kjøp med ekte penger eller reklame. Kjøpene i basen bruker penger fra spillet.
- **S3** Oppfylt: Basenavnet lagres bare i localStorage. `<b>Min</b>` i lagringen ga ingen feil. Visningen er uendret mot 4b88a0f (`input.value` og canvas `fillText`).
- **B2** Oppfylt: M åpner kartet, `tid` står stille, og Esc lukker kartet.
- **B4** Oppfylt for Q-delen: Kamp og vanskelighetsgrader er uendret, og Lett finnes.
- **B7** Oppfylt: `maxlength="14"`, og personvernsiden nevner «navnet du gir basen i Era Defenders».
- **ST3** Oppfylt: `statistikk.js` avslutter når vertsnavnet ikke er evnstudio.no (linje 22). Ingen forespørsler gikk ut ved lokal kjøring.
- **ST6** Oppfylt (kodekontroll): Ingen informasjonskapsler, ID-er, fingeravtrykk eller lagring i `statistikk.js`. `statistikk.js` er uendret mot main.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen nye avvik fra endringene i 0.21.1 og 0.21.2. Begge funnene fra 4b88a0f er rettet (se over).

**Ikke fra denne endringen (CSS og kode uendret mot main, målt likt på begge):**
- **T1** Verifisert feil, ikke blant de kjente funnene i standarden, uendret fra forrige QA: Kjøpsknappene i basen er 154×31 px i 375×812 (14 knapper) og 105×31 eller 147×31 px i 320×568 (6 knapper). Main gir samme mål. Gjenskap: 375×812, start, trykk Basen og mål `button`.
- **T2** Verifisert feil, kjent funn, uendret: Tab går ut av pausekortet. Rekkefølgen er `evnPauseStyrKnapp` → `evnPauseAvslutt` → BODY → `baseKnapp` → `avsluttKnapp` → `evnPauseEcoins`. Gjenskap: start, trykk P, trykk Tab 3 ganger.
- **K2** Verifisert feil, kjent funn, uendret: Ingen global feilfanger (`window.onerror` er `null`).
- **ST1** Avvik (kodelest), kjent fra tidligere QA:
  - `statistikk.js` lastes nederst i `<body>` med `defer` (linje 3122), ikke i `<head>`.
  - Spillet sender ikke `evn-start`.
  - Det sendes ingen `versjon-eventyrspill-<versjon>`.
- **ST2** Avvik (kodelest), kjent fra tidligere QA: Spilletiden bruker ikke `window.EVNAktivTid` og teller også i pause og med kartet åpent.
- **ST4** Avvik (kodelest), kjent fra tidligere QA: `feil-eventyrspill-oppstart` og `feil-eventyrspill-spill` sendes aldri.
- **ST7** Avvik: følger av ST1, ST2 og ST4. Testsuiten melder `statistikk=ikke-innfort`.

## Anbefalte forbedringer
- I 568×320 med hakk på sidene dekker meldingen (x 63–363, y 202–256) fortsatt omtrent halve magi-knappen (sentrum 326,234, r 40) i 4 s. Knappen kan trykkes, fordi boksen har `pointer-events: none`. Uten hakk er det ingen overlapp. Vurder en smalere boks i lave liggende skjermer.
- I 740×360 dekker meldingen (y 70–124) den tomme høyre enden av Nivå- og myntlinjene i 4 s, med og uten hakk. Teksten i linjene dekkes ikke.
- I 740×360 med hakk står Basen-knappen 47 px til høyre for midten av det trygge området (sentrum x 417, midten 370), fordi `left` legger til venstre hakk men ikke trekker fra høyre. Det gir ingen overlapp i de målte størrelsene.
- I 320×568 overlapper Avslutt (x 204) og 🗺️ (x 199) høyre ende av Liv- og Kraft-linjene i statusfeltet (som slutter ved x ≈ 256). Det er likt på main. Se /tmp/qa-era-a7b5/ny-320x568-overlapp.png.
- I 568×320 ligger Start delvis under skjermkanten (y 281–334 av 320). Kortet kan rulles, og Enter starter spillet. Det er likt på main.
- En ødelagt lagring overskrives ved første lagring. Vurder å ta vare på originalen, slik E-coins gjør (EC11).
- Plassholderen i navnefeltet er «Skriv navnet ditt». Den kan oppfattes som barnets eget navn. Vurder «Skriv et navn på basen».

## Kontroller som ikke kunne utføres
- **ST5** Kun kodelest: Bare `start-eventyrspill` og `spilletid-eventyrspill-NNmin` brukes, og hver sendes én gang. Uendret mot main.
- **ST8** Ikke testet: `test/statistikk/` finnes verken her eller på main (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **Y1** Ikke testet: Referansemobil er ikke valgt (E).
- **Y2** Kun kodelest: Fast tidssteg på 1/60 s, høyst 5 steg etter en pause eller treg ramme. Fanebytte er ikke testet i headless.
- **B6** Kun kodelest: Service workeren registreres bare på https, så den kunne ikke kjøres lokalt. Strategien er nett først, cachen er v0.34, og gamle cacher slettes. Oppdatering og frakoblet bruk på installert app krever enhet (E).
- **T4** Delvis: Kontrasten i merket og meldingen (#3d2a17 på #ffd54a) er 9,64:1 (uendret farge), og tallet vises som tekst. Kontrasten i resten av grensesnittet er ikke målt.
- **S4** Delvis: Omtalen av basenavnet på personvernsiden stemmer. Resten av personvern- og sikkerhetssidene er ikke kontrollert på nytt.
- **E**:
  - T1, T3 og Y1 på faktisk mobil.
  - B6 på installert app.
  - Hakk og hjemlinje på ekte iPhone og Android. Her er bare CDP-emulering brukt.
  - Ekte berøring. Her er bare CDP-berøring brukt.
- **V**:
  - U2, U3 og B4: om Even forstår «⬆ N» og meldingen, og om han bruker basen tidligere.
  - Om knappene og statusfeltet føles riktig plassert på mobilen hans.
- **Ikke vurdert**: Lyd er ikke berørt. B1 gjelder ikke dette spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring på a7b5e09 uten feil, ingen kritiske feil ble funnet, og begge funnene fra 4b88a0f er rettet. Forbeholdene er de eldre avvikene T1, T2, K2 og ST1/ST2/ST4/ST7, at ST8 ikke kunne kjøres, og at Y1 og ekte mobil ikke er testet.
