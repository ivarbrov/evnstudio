# EVN Game QA: Era Defenders (eventyrspill) 0.21.2
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 4b88a0fb3127e569b5171e83771d5cff3e1c0337
Testkvittering: evn1 commit=4b88a0fb3127e569b5171e83771d5cff3e1c0337 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om fullt nivå, og versjonen foreslås publisert. Endringen mot origin/main er to versjoner samlet i én: trygge skjermkanter (0.21.1) og antall ting du har råd til på Basen-knappen (0.21.2). Begge berører grensesnittet under spilling, berøringsstyringen og tegningen av statusfeltet. Kontrollert mot de gjeldende kravene i 1.1 (F, U, T, Y, K, S, ST) og B2, B4, B6 og B7. UI1–UI10 er ikke tatt i bruk i spillet og er ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert. Oppdraget oppga ikke standardversjon.
Testet: Lokal `python3 -m http.server`. Port 8873 serverte denne commiten, og port 8874 serverte `git archive origin/main` i /tmp/qa-era-4b88/main, til sammenligning. Nettleseren var Google Chrome headless via Playwright. Jeg brukte ekte tastetrykk (Enter, D, P, Esc, M, B, Tab) og klikk. Berøring ble testet i emulert mobil (`hasTouch`, `isMobile`, DPR 2) med `tap` og CDP `Input.dispatchTouchEvent`. Størrelser: 1280×800, 375×812, 740×360, 320×568 og 568×320. Hakk ble emulert med CDP `Emulation.setSafeAreaInsetsOverride`: portrett med 47/34 px oppe og nede, liggende med 47 px på sidene og 21 px nede. Testtilstand (penger, liv, lagringer) ble satt i testnettleseren. Hver test brukte en ny localStorage-kontekst. `node test/kjor.mjs --base origin/main`: 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3), 2 ikke innført. Begge testserverne er stoppet. Skript og skjermbilder ligger i /tmp/qa-era-4b88/. Arbeidstreet er uendret.

## Oppfylte krav
**Oppdragets endringer**
- **Basen-merket (0.21.2):**
  - Med 200 penger viste merket «⬆ 3». `kjopbareBygg()` ga 3, og basen hadde 3 aktive kjøpsknapper.
  - Lagring fra før epokene ga ⬆ 13 og 13 kjøpbare. Lagring i 0.21.0-format ga ⬆ 8 og 8 kjøpbare.
  - Knappens tilgjengelige navn er «Basen (B). Du har råd til 3 ting.».
  - Med redusert bevegelse er `animationName` `none`.
- **Meldingen «💰 Du har råd til ⚒️ Smie! Trykk på Basen 🏰»:**
  - Den vises som en boks under Basen-knappen og er 300×54 px.
  - Den skjules etter 4 s, straks basen åpnes og straks spilleren blir slått ut.
  - Den kom ikke igjen etter «Prøv igjen».
  - Funnet fra forrige QA, at meldingen ble skjult på små og liggende skjermer, er **rettet**. Boksen er lesbar i alle fem størrelsene.
- **Trygge kanter (0.21.1):**
  - Med emulert hakk leser `kant` riktige verdier, for eksempel t47/b34 og l47/r47/b21.
  - Basen, Avslutt, ⏸, 🗺️, statusfeltet, «Dra her for å gå», handlingsknappene og Tilbake flyttes ut av hakket.
  - Uten hakk er `kant` 0, og plasseringen er lik main.
  - Ekte berøring (CDP) på den tegnede sverdknappen ga `holdtKnapp.sverd = true` i alle 8 kombinasjoner av størrelse og hakk. Treffområdet følger altså tegningen.
  - Styrespaken flyttet helten 104–120 px.
  - Ingen sideveis rulling: `scrollWidth` er lik bredden i alle størrelser.

**Krav**
- **F1** Oppfylt:
  - Start med Enter og med trykk. D flytter helten 90 px.
  - P setter pause: `tid` står stille, og pausekortet vises. Esc fortsetter, og `tid` går igjen.
  - B åpner basen, og Esc lukker den. Basen-knappen og Tilbake virker med trykk på mobil.
  - Avslutt viser spørsmålet med fokus på «Nei, spill videre», og spillet står stille. Enter gir tilbake til spillet.
  - Når spilleren blir slått ut, blir tilstanden `slutt`, og «Prøv igjen» starter på nytt.
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
- **U2** Oppfylt for Q-delen: Merket og meldingen viser hva spilleren kan gjøre. Styringshjelpen ligger i pausekortet («Slik styrer du»).
- **U3** Oppfylt for Q-delen: De nye tekstene er korte og positive. Tap gir «Prøv igjen», og pengene beholdes.
- **T3** Oppfylt for A-delen: Viewport sperrer ikke zoom (statisk test OK), og `prefers-reduced-motion` slår av animasjonen på merket.
- **K1** Oppfylt: Ingen pageerror, konsollfeil eller svar ≥ 400 i noen kjøring. Røyktesten (med CSP-brudd) er OK.
- **K3** Oppfylt: 0.21.2 står i `<title>` og på startkortet. sw-cache er `eventyrspill-v0.34`, og ENDRINGSLOGG har rader for både 0.21.1 og 0.21.2. Innholdet i radene stemmer med diffen.
- **S1** Oppfylt: Alle statiske S1-kontroller er OK, og CSP er uendret mot main. Siden sendte ingen forespørsler utenfor 127.0.0.1.
- **S2** Oppfylt (statisk): Ingen konto, chat, kjøp med ekte penger eller reklame. Kjøpene i basen bruker penger fra spillet.
- **S3** Oppfylt: Basenavnet lagres bare i localStorage. Det vises med `input.value` og canvas `fillText`, ikke som HTML. `<b>Min</b>` i lagringen ga ingen feil.
- **B2** Oppfylt: M åpner kartet, `tid` står stille, og Esc lukker kartet.
- **B4** Oppfylt for Q-delen: Kamp og vanskelighetsgrader er uendret, og Lett finnes.
- **B7** Oppfylt: `maxlength="14"`, og personvernsiden nevner «navnet du gir basen i Era Defenders». Det kjente funnet om S3/S4/B7 er dermed **rettet** når det gjelder omtalen på personvernsiden.
- **ST3** Oppfylt: `statistikk.js` avslutter når vertsnavnet ikke er evnstudio.no (linje 22). Ingen forespørsler gikk ut ved lokal kjøring.
- **ST6** Oppfylt (kodekontroll): Ingen informasjonskapsler, ID-er, fingeravtrykk eller lagring i `statistikk.js`. `statistikk.js` er uendret mot main.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
**Fra sammenslåingen av 0.21.1 og 0.21.2 (nytt):**
- **Meldingen under Basen-knappen holder seg ikke unna hakket (verifisert feil i emulering, mot beskrivelsen i 0.21.1).** `visBaseRadHint` begrenser venstrekanten med `Math.max(16, …)` og bruker ikke `kant.l`.
  - I 568×320 med 47 px hakk på sidene ligger boksen fra x = 16. Det er 31 px inn i hakket.
  - Boksen dekker også omtrent halve magi-knappen (sentrum 326,234, r 40) i 4 s.
  - Knappen kan fortsatt trykkes, fordi boksen har `pointer-events: none`.
  - Gjenskap: emuler 568×320 med safe-area-inset left/right 47, trykk Start og gi `helt.penger = 200`. Se /tmp/qa-era-4b88/568x320-insetL-spill.png.
- **Basen-knappen overlapper statusfeltet i liggende format med hakk på siden (verifisert feil i emulering).**
  - I 740×360 med 47 px venstre hakk flyttes statusfeltet til x 63–303. Basen-knappen står fortsatt midt på (x 289–451) og dekker høyre ende av Liv- og Kraft-linjene.
  - Meldingen (x 220–520, y 70–124) dekker i tillegg høyre ende av Nivå- og myntlinjene i 4 s, også uten hakk.
  - Gjenskap: 740×360 med inset left 47. Se /tmp/qa-era-4b88/740x360-insetL-spill.png.
  - Bredere telefoner i liggende format, for eksempel 812 eller 844 px, rammes trolig ikke, fordi knappen da ligger lenger til høyre. Det er ikke målt.

**Ikke fra denne endringen (CSS og kode uendret mot main):**
- **T1** Verifisert feil, ikke blant de kjente funnene i standarden: Kjøpsknappene i basen (`.kort button`) er 154×31 px i 375×812, 14 knapper. I tillegg er vanskelighetsknappene `min-height: 40px` når høyden er under 500 px (kodelest).
- **T2** Verifisert feil, kjent funn, uendret: Tab går ut av pausekortet. Rekkefølgen er `evnPauseStyrKnapp` → `evnPauseAvslutt` → BODY → `baseKnapp` → `avsluttKnapp`. Gjenskap: start, trykk P, trykk Tab 3 ganger.
- **K2** Verifisert feil, kjent funn, uendret: Ingen global feilfanger (`window.onerror` er `null`).
- **ST1** Avvik (kodelest), kjent fra tidligere QA:
  - `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`.
  - Spillet sender ikke `evn-start`. Starten oppdages ved å lese `tilstand` hvert sekund.
  - Det sendes ingen `versjon-eventyrspill-<versjon>`.
- **ST2** Avvik (kodelest), kjent fra tidligere QA: Spilletiden kommer fra et eget `setInterval` som bare sjekker om fanen er synlig. Den bruker ikke `window.EVNAktivTid` og teller også i pause og med kartet åpent.
- **ST4** Avvik (kodelest), kjent fra tidligere QA: `feil-eventyrspill-oppstart` og `feil-eventyrspill-spill` sendes aldri.
- **ST7** Avvik: følger av ST1, ST2 og ST4. Testsuiten melder `statistikk=ikke-innfort`.

## Anbefalte forbedringer
- Plasser meldingen etter `kant.l` og `kant.r`, for eksempel `Math.max(16 + kant.l, …)`. Hold den unna handlingsknappene i lave liggende skjermer, eller la den bli smalere der.
- Ta hensyn til `kant.l` når Basen-knappen plasseres midt på, eller flytt den under statusfeltet også når skjermen er under omtrent 800 px bred og har hakk på siden.
- I 568×320 ligger Start delvis under skjermkanten (y 281–334 av 320), og Avslutt dekker øverste høyre hjørne av startkortet. Kortet kan rulles, og Enter starter spillet. Det er likt på main.
- En ødelagt lagring overskrives ved første lagring. Vurder å ta vare på originalen, slik E-coins gjør (EC11).
- Plassholderen i navnefeltet er «Skriv navnet ditt». Den kan oppfattes som barnets eget navn. Vurder «Skriv et navn på basen».

## Kontroller som ikke kunne utføres
- **ST5** Kun kodelest: Bare `start-eventyrspill` og `spilletid-eventyrspill-NNmin` brukes, og hver sendes én gang (flagget `startet` og indeksen `neste`). Uendret mot main.
- **ST8** Ikke testet: `test/statistikk/` finnes verken her eller på main (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **Y1** Ikke testet: Referansemobil er ikke valgt (E).
- **Y2** Kun kodelest: Fast tidssteg på 1/60 s, høyst 5 steg etter en pause eller treg ramme. Merket oppdateres hver 15. oppdatering. Fanebytte er ikke testet i headless.
- **B6** Kun kodelest: Service workeren registreres bare på https, så den kunne ikke kjøres lokalt. Strategien er nett først, cachen er v0.34, og gamle cacher slettes. Oppdatering og frakoblet bruk på installert app krever enhet (E).
- **T4** Delvis: Kontrasten i merket og meldingen (#3d2a17 på #ffd54a) er beregnet til 9,64:1, og tallet vises som tekst. Kontrasten i resten av grensesnittet er ikke målt (uendret).
- **S4** Delvis: Omtalen av basenavnet på personvernsiden stemmer. Resten av personvern- og sikkerhetssidene er ikke kontrollert på nytt.
- **E**:
  - T1, T3 og Y1 på faktisk mobil.
  - B6 på installert app.
  - Hakk og hjemlinje på ekte iPhone og Android. Her er bare CDP-emulering brukt.
  - Ekte berøring. Her er bare CDP-berøring brukt.
- **V**:
  - U2, U3 og B4: om Even forstår «⬆ N» og meldingen, og om han bruker basen tidligere. Det er formålet med 0.21.2.
  - Om knappene og statusfeltet føles riktig plassert på mobilen hans.
- **Ikke vurdert**: Lyd er ikke berørt. B1 gjelder ikke dette spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring på 4b88a0f uten feil, og ingen kritiske feil ble funnet. Forbeholdene er at meldingen og Basen-knappen ikke tar hensyn til hakk på siden i liggende format, de eldre avvikene T1, T2, K2 og ST1/ST2/ST4/ST7, at ST8 ikke kunne kjøres, og at Y1 og ekte mobil ikke er testet.
