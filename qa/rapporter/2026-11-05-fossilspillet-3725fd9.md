# EVN Game QA: Fossil Zoo (fossilspillet) 0.8.2
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 3725fd930fe70641b69ef938970427d88143841f
Testkvittering: evn1 commit=3725fd930fe70641b69ef938970427d88143841f tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Endringen gjelder bare `spill/fossilspillet/index.html` og ENDRINGSLOGG.md. Felles kode (statistikk.js, EVN-PAUSE, EVN-NULLSTILL), lagringsformat og CSP er uendret mot origin/main (b0bf569).
Testet: Frakoblet arbeidstre /home/claude/qa-fossilspillet på 3725fd9. `git status` var rent før og etter. Jeg kjørte `node test/kjor.mjs --base origin/main` med google-chrome (Chrome for Testing 153) headless: 85 OK, 0 feil, 0 varsler, 1 rettet (T3) og 2 ikke innført. Egne Playwright-skript (playwright-core, /usr/bin/google-chrome, `reducedMotion: 'reduce'`) ligger i /tmp/qa-fz-3725/skript/, og skjermbildene ligger i /tmp/qa-fz-3725/bilder/. Jeg serverte 3725fd9 med `python3 -m http.server` på 127.0.0.1:8871. origin/main (0.8.0) ble hentet ut med `git archive` og servert på 8872, slik at jeg kunne lage lagring der og sammenligne. Alle forespørsler utenfor 127.0.0.1 ble sperret og logget, og det kom ingen. Jeg testet med mus og tastatur i 1280×800 og 740×360. Med emulert berøring (`hasTouch`, `isMobile`) testet jeg i 375×812, 320×568, 740×360 og 568×320. Trygge skjermkanter ble emulert med CDP `Emulation.setSafeAreaInsetsOverride` i 375×812 (topp 47, bunn 34), 390×844 (topp 59, bunn 34) og 812×375 (venstre og høyre 47, bunn 21). Tastene var ekte tastetrykk fra Playwright. Klikk og trykk var `mouse.click` og `touchscreen.tap` på elementets koordinater, ikke `element.click()`. Dobbelttrykk-vakten og knipesperren testet jeg i tillegg med syntetiske `TouchEvent` (`touchend`, `touchmove` med to fingre) og zoomsperren med syntetiske `WheelEvent`/`KeyboardEvent` med Ctrl. Testtilstand satt med JS: lagring i localStorage, fokus på elementer og den lengste sonelinja i faktaboksen. Hver test kjørte i en ny nettleserkontekst, og localStorage ble tømt før og etter. Begge testserverne er stoppet.

## Oppfylte krav
- **Det som er endret (0.8.1 og 0.8.2 samlet):**
  - Viewport er `width=device-width,initial-scale=1,viewport-fit=cover` uten `maximum-scale` og `user-scalable=no`. kjor.mjs merker T3 som RETTET.
  - Zoom på startkortet, i tidsepokevalget og i pausen er ikke sperret: Ctrl+hjul og Ctrl++ ble ikke stoppet (`defaultPrevented` false), og knip med to fingre (`touchmove`) ble ikke stoppet i noen av de fire mobilstørrelsene. `html`, `body` og startkortet har `touch-action: manipulation`.
  - Under graving er Ctrl+hjul, Ctrl++ og knip med to fingre fortsatt sperret.
  - Dobbelttrykk-vakten etter sammenslåingen: et raskt nytt `touchend` på spillflaten blir stoppet. Det blir ikke stoppet når hendelsen ikke kan avbrytes (`e.cancelable`), og heller ikke på 📏 (`[role=button]`). Et raskt trykk nummer to på 📏 med `touchscreen.tap` (150 ms etter det første) viste faktaboksen i alle fire mobilstørrelsene. `visualViewport.scale` var fortsatt 1.
  - Safe area: HUD, meldingen, hjelpeteksten, pilknappene og ⏸ flytter seg med kantene: HUD y = 6 + 47, pilknappene slutter 14 px over bunnkanten (34) og 12 px innenfor høyre kant (47), hjelpeteksten x = 12 + 47. Se avviket om faktaboksen nedenfor.
  - 📏 viser teksten om gjeldende sone med mus, med berøring, med Enter og med mellomrom, for eksempel «🌿 Karbontiden» på 15 m. Dybden er den samme før og etter trykket.
  - 📏 gjør ingenting fra startkortet (Enter) eller i pausen (Enter etter fokus).
  - Teksten om ny sone ender med «(Trykk på 📏 for å lese igjen.)». Med graving sidelengs ble den stående i 9,95 s. 📏-teksten ble stående i 9,75 s (målt med 100 ms avlesning).
  - I lave, liggende vinduer med berøring står faktaboksen til venstre for pilknappene: høyre kant 484 mot 494 i 740×360, og 312 mot 322 i 568×320. Med den lengste sonelinja dekket boksen ingen knapper i noen av de fem størrelsene uten safe area, og den lå innenfor skjermen.
- **F1:**
  - Spillet startet med tastatur (Enter på Start og på «⛏️ Grav videre her»), med mus og med berøring.
  - Piltastene og pilknappene graver (0 til 23 m med tastatur, 0 til 2 m med fire trykk på ↓).
  - P åpner pausen, og graving er da stoppet. Esc lukker pausen. ⏸ og «▶ Fortsett» virker med trykk i alle størrelsene.
  - «🚪 Avslutt» åpner «Vil du avslutte?» med fokus på «Nei, spill videre», og etter Nei kan man spille videre.
  - Spillet hang ikke. kjor.mjs viser også OK for start, pause og fortsett.
- **F2:** Lagringsnøkkelen er `evn-fossilspillet-v04`, og formatet er uendret: v:5, med nøklene v, lvl, unlocked, worlds, found, alive, helper og seenZones. Etter omlasting står det «Fortsett!», og dybden er den samme (26 m). «🗑️ Start helt på nytt» setter fokus på «Nei, behold alt». Esc beholder lagringen, og «Ja, slett alt» gir «Start!».
- **F3 (de vanlige tilfellene):**
  - Lagring laget ved å spille 0.8.0 på main (35 m, Devontiden) ble lastet med «Fortsett!», samme dybde og samme seenZones. 📏 viste «🐟 Devontiden».
  - Lagring uten seenZones (merket v:4) ble lastet.
  - Lagring i v03-formatet ble flyttet til v04 (v:5, funnene beholdt), og v03 ble beholdt.
  - Ødelagt JSON og feil datatyper i alle felt gir en ny start uten sidefeil.
  - Se avviket om F3 nedenfor.
- **U1:** Startkortet har maskot, mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.8.2 • 3 tidsepoker • 13 dyr å vekke» (kjor.mjs: OK).
- **U2 (Q-delen):** Hjelpelinjen og «🎮 Slik styrer du» i pausen finnes. Sonefakta forteller hvordan teksten kan leses igjen.
- **U3 (Q-delen):** Den nye teksten er kort og enkel: «Trykk på 📏 for å lese igjen.» og title «Les om tiden du graver i».
- **T1 (emulert):** Alle synlige trykkflater er minst 44×44 i alle fem størrelsene: 📏 144–169×44, Tidsepoker og Dyreparken 110–133×44, 🗺️ og ⏸ 44–46×44, ✕ i faktaboksen 44×44 og pilknappene 74×74. Det kjente funnet «Tidsepoker og Dyreparken er 29 px høye på mobil» finnes ikke lenger.
- **T3 (emulert):** Se punktene om endringen over. `prefers-reduced-motion: reduce` gir `animation-name: none` på Start (ellers `evnPuls`). Det kjente funnet «user-scalable=no sperrer zoom» er rettet.
- **K1:** Ingen sidefeil, konsollfeil eller varsler, og ingen svar med status 400 eller høyere ved normal bruk i noen kjøring. kjor.mjs viser OK, også for CSP-brudd.
- **K3:** `<title>` er «Fossil Zoo v0.8.2 – EVN Studio», og startkortet viser 0.8.2. ENDRINGSLOGG.md har én rad for 0.8.2 og én for 0.8.1 («ikke publisert alene; med i 0.8.2»). Det radene sier om 10 s, 📏 som knapp på 44 px, Enter og mellomrom, plassering i lave vinduer, zoom bare sperret under graving, uendret lagring og uendret statistikk, stemmer med det jeg målte.
- **S1:** Den statiske suiten er OK. CSP er uendret mot main, og koden har ingen eval.
- **S2:** Ingen forespørsler gikk utenfor 127.0.0.1. Spillet har ingen konto, chat, reklame eller kjøp med ekte penger. E-coins brukes bare lokalt (`EVNEcoins.belonn` og `avstem`), og ecoins-suiten er OK.
- **S3:** Spillet har ingen fritekstfelt (ingen `input`, `textarea` eller `contenteditable`).
- **B2:** M og 🗺️ åpner kartet med «🔴 Du er her», og spillet står stille: piltastene graver ikke. Esc lukker kartet. Spilletiden med kartet åpent er et avvik under ST2.
- **ST3:** statistikk.js avslutter når siden ikke ligger på evnstudio.no (linje 22). Filen er uendret mot main, og ingenting ble sendt.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Verifisert feil, ny i 0.8.1-delen: faktaboksen dekker HUD-knappene på mobiler med hakk.** Feilen bryter ikke noe gjeldende krav direkte, men gjelder T1 og U2 (knappene kan ikke trykkes mens boksen vises). `showFact()` setter `top` i stilen til `hud.offsetHeight + 14` px. Det overstyrer CSS-regelen `top: calc(70px + env(safe-area-inset-top))` og regner ikke med at HUD-en nå er flyttet ned med safe-area-inset-top.
  - Gjenskap: 390×844 med berøring og topp-inset 59 (CDP `Emulation.setSafeAreaInsetsOverride`). Start spillet og trykk på 📏.
  - Resultat: HUD-en går fra 65 til 157, mens faktaboksen starter på 106. Den dekker Tidsepoker, Dyreparken, 🗺️ og ⏸ (113–157). `elementFromPoint` midt på disse knappene gir #fakta. I opptil 10 s fører det første trykket bare til at boksen lukkes. P og Esc virker fortsatt.
  - I 375×812 med topp-inset 47 traff boksen ingen knapper (HUD-en har da tre rader). Uten inset, og på main (der HUD-en ikke flyttes, kodelest), skjer det ikke.
  - Må bekreftes på ekte iPhone med hakk (E). Forslag: legg til samme inset i `showFact`, eller bruk `getBoundingClientRect().bottom` på HUD-en.
- **F3, verifisert, finnes også på main (ikke fra denne endringen):** Lagring med gyldig JSON og riktig form, men med `alive: null` eller `lvl: 9`, gir sidefeil: «Cannot read properties of null (reading '8')» og «… (reading 'tint')».
  - Med `alive: null` åpner ikke «Fortsett!» tidsepokevalget, så spillet kan ikke startes. «🗑️ Start helt på nytt» vises og er en vei ut.
  - Spillet skriver aldri slike verdier selv, så jeg regner det ikke som kritisk.
  - Gjenskap: spill litt, endre feltet i `evn-fossilspillet-v04` og last på nytt. Samme resultat på 0.8.0.
- **T2, kjent avvik (uendret):** Tab går ut av pausekortet: Slik styrer du, Avslutt, deretter BODY og videre til 📏, ropeBtn og lvlBtn bak kortet. På startskjermen kommer 📏, lvlBtn, parkBtn, evnAvslutt og det skjulte ✕ (#fClose) før Start.
- **K2, kjent avvik:** Spillet har ingen global feilfanger (ingen `error`- eller `unhandledrejection`-lytter, kodelest).
- **B1, kjent avvik:** Spillet har ingen lydbryter (kodelest).
- **ST1, kjent avvik (statisk):** statistikk.js lastes nederst i `<body>` med `defer` (linje 2045), ikke i `<head>`, og spillet sender ikke `evn-start`. Starten telles når man klikker på Start!, som bare åpner tidsepokevalget.
- **ST2, kjent avvik, verifisert på nytt:** Spillet bruker EVN-PAUSE v2 uten `window.EVNAktivTid`. `evn-spilletid-fossilspillet.totalt` økte med 13,0 s på cirka 12 s med kartet åpent, og med 13,0 s med tidsepokevalget åpent. Tidsepokevalget er ikke nevnt før, men `aktiv()` er uendret mot main. I pausen økte den bare 0,26 s. I tillegg teller minuttene i statistikk.js bare på synlig fane, ikke på pause (kodelest).
- **ST4, kjent avvik (kodelest):** Spillet sender ingen `feil-fossilspillet-*`-hendelser.
- **ST7:** Avvik som følger av ST1, ST2 og ST4.

## Anbefalte forbedringer
- `autoHideFact` virker ikke lenger i praksis, fordi grensen (10 000 ms) er den samme som nedtellingen. Fjern funksjonen, eller skriv i en kommentar at det er meningen.
- Faktaboksen dekker mye på små skjermer i 10 s mens barnet graver (295×155 i 375×812, 240×195 i 320×568). Det er godkjent, og UI8c er ikke tatt i bruk for Fossil Zoo. Even bør si om den er i veien.
- Uendret fra main: «Start!» slutter på 592 px i 320×568 og på 324 px i 568×320, så den er under skjermkanten til man ruller. Startkortet kan rulles. Det samme gjelder «⛏️ Grav videre her» i liggende format.
- Uendret fra main: Ødelagt lagring blir skrevet over med en tom start, uten en kopi av originalen. Valider `alive`, `lvl` og `unlocked` i `load()` (se F3).
- Fra før: Flytt statistikk.js til `<head>`, ta i bruk EVN-PAUSE v3 og `evn-start`, regn tidsepokevalget og kartet som ikke aktiv tid, og hold Tab inne i pausekortet.

## Kontroller som ikke kunne utføres
- **ST5:** Kun kodelest. Hendelsene heter `start-fossilspillet` og `spilletid-fossilspillet-NNmin`, uten fritekst eller spillerdata. `versjon-…` sendes ikke.
- **ST6:** Kun kodelest. statistikk.js bruker ingen informasjonskapsler, localStorage eller ID-er. GoatCounters eget skript kjører ikke lokalt.
- **ST8:** `test/statistikk/` finnes verken her eller på main (kjor.mjs: ikke-innfort). Om hendelsene kommer fram i GoatCounter etter publisering, må en voksen med innlogging kontrollere.
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen er ikke målt.
- **Y2:** Ikke testet. Et fanebytte i headless Chrome satte ikke `document.hidden`, og ulik skjermfrekvens er ikke testet. Spill-løkken er uendret bortsett fra linja for sonetekst.
- **T4:** Kun kodelest. Fargene er uendret, og kontrasten på fokusringen rundt 📏 er ikke målt.
- **S4:** Kun kodelest. Personvernsiden omtaler lokal lagring, E-coins og GoatCounter. Spillet lagrer ingen nye data.
- **B5:** Kun kodelest. Faktatekstene er uendret. Den eneste nye teksten er hjelpeteksten om 📏.
- **E:** Disse krever ekte iPhone og Android: T1, knip-zoom i menyene og sperren under graving (T3), dobbelttrykk på 📏, safe area med ekte hakk (inkludert faktaboks-feilen over), B1 (lyd) og Y1.
- **V:** U2 og U3, om barn forstår at 📏 kan trykkes, og om 10 s med faktaboks er bra eller i veien. Dette vurderer Even.
- Spillet er ikke fullført (ingen dyr vekket), og dyreparken er ikke åpnet med dyr i. Reise til en annen tidsepoke er ikke testet.
- UI1–UI10 er ikke tatt i bruk for Fossil Zoo, og klarspråk har status forslag. Ingen av dem er kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet uten kritiske feil, også med lagring fra 0.8.0. Zoom i menyene og dobbelttrykk-vakten virker etter sammenslåingen. Faktaboksen kan dekke HUD-knappene på mobiler med hakk (emulert, ikke kritisk). De kjente avvikene i ST1, ST2, ST4, T2, K2 og B1 gjelder fortsatt, og kravene som krever ekte enhet er ikke testet.
