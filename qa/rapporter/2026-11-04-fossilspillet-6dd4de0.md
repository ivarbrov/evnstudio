# EVN Game QA: Fossil Zoo 0.8.2
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 6dd4de057bf59b6512b19557648f8a841dd29d59
Testkvittering: evn1 commit=6dd4de057bf59b6512b19557648f8a841dd29d59 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om fullt nivå, og 0.8.2 skal foreslås publisert. Kodeendringen gjelder bare ett spill. Den endrer HUD, berøringsperren og faktaboksen, men ikke lagringen eller statistikken.
Testet: Arbeidstreet /home/claude/qa-fossil, detached på 6dd4de0 (`git status` er ren før og etter). Jeg kjørte `node test/kjor.mjs --base origin/main` med google-chrome headless: 85 OK, 0 feil, 0 varsler, 1 kjent (T3) og 2 ikke innført. De egne Playwright-skriptene ligger i /home/claude/qa-tmp-fossil2/ og brukte /usr/bin/google-chrome med `reducedMotion:'reduce'`. 0.8.2 ble servert med `python3 -m http.server 8853`. origin/main (0.8.0) ble eksportert med `git archive` og servert på 8854 for å lage lagringen og måle tidene der til sammenligning. All trafikk utenfor 127.0.0.1 ble sperret og logget. Jeg testet med mus og tastatur i 1280×800 og 740×360, og med emulert berøring (`hasTouch`, `isMobile`) i 375×812, 320×568, 740×360 og 568×320. Tastene er ekte tastetrykk fra Playwright. Klikk og trykk er syntetiske hendelser fra Playwright (`mouse.click` og `touchscreen.tap`) på elementets koordinater, ikke `element.click()`. Testtilstand satt med JS: lagring i localStorage, fokus på 📏 i pausen, kartet og «Vil du avslutte?», og den lengste sonelinja lagt inn i faktaboksen for å måle overlapp. localStorage ble tømt før og etter hver test. Begge testserverne er stoppet.

## Oppfylte krav
- **Rettinger fra QA av 4217034 (kontrollert på 6dd4de0):**
  - Enter og mellomrom på 📏 fra startkortet viser ingen faktaboks. Det samme gjelder Enter fra tidsepokevalget, og trykk eller klikk der 📏 ligger mens startkortet vises. Kontrollert i alle seks størrelsene.
  - Et raskt trykk nummer to på 📏 virker med berøring i alle fire mobilstørrelser. Det gjelder etter ✕ (120 ms), etter et trykk på fjellet (150 ms) og ved et dobbelttrykk på 📏 (150 ms). `visualViewport.scale` var fortsatt 1.
  - Jeg har ikke gjenskapt feilene på 4217034. Jeg har bare kontrollert at de ikke finnes i 6dd4de0.
- **Endringen virker:**
  - 📏 åpner teksten om gjeldende sone med mus, med berøring, med Enter og med mellomrom, for eksempel «🦎 Permtiden» på 0 m og «🐚 Kambrium» etter omlasting på 73 m.
  - Dybden er den samme før og etter, så spilleren graver ikke. `scrollY` er 0.
  - 📏 gjør ingenting i pausen, med kartet åpent eller med «Vil du avslutte?» åpen. Jeg testet med trykk og med Enter, også når 📏 ble nådd med Tab i pausen. Pausen var fortsatt åpen etterpå.
  - Teksten om ny sone ender med «(Trykk på 📏 for å lese igjen.)».
  - Med graving sidelengs forsvant teksten om ny sone etter 10 264 ms (0.8.0: 3 763 ms). 📏-teksten forsvant etter 10 249 ms med graving og 10 156 ms uten. Et nytt trykk etter 6 s starter nedtellingen på nytt (10 429 ms).
- **Faktaboksen dekker ikke kontrollene.** Målt med den lengste sonelinja (Ordovicium og silur, med tillegget):

  | Størrelse | Faktaboks (x, y, b×h) | Overlapp |
  |---|---|---|
  | 375×812 | 6, 154, 295×155 | ingen |
  | 320×568 | 6, 154, 240×195 | ingen |
  | 740×360 | 6, 108, 478×138 | ingen |
  | 568×320 | 6, 106, 306×155 | ingen |
  | 740×360, mus | – | ingen |
  | 1280×800, mus | – | ingen |

  - I 740×360 og 568×320 med berøring står boksen til venstre for pilknappene (høyre kant 484 mot pilknapp 494, og 312 mot 322).
  - Boksen ligger alltid innenfor skjermen, og ingen størrelse fikk sideveis rulling.
  - Jeg sjekket også det tilfellet at boksen vises på 0 m og spilleren graver ned forbi 3 m, så tauknappen dukker opp. HUD-en ble ikke høyere, og boksen dekket fortsatt ingen kontroller.
  - Skjermbilder ligger i /home/claude/qa-tmp-fossil2/bilder/.
- **F1:**
  - Spillet startet med tastaturet (Enter på Start og deretter på «Grav videre her»), med mus og med berøring.
  - Piltastene og pilknappene graver.
  - P åpner pausen og Esc lukker den. ⏸ og 🗺️ virker med trykk.
  - «Vil du avslutte?» og «Nei, spill videre» gjør at spilleren blir i spillet.
  - Spillet hang ikke i noen størrelse. kjor.mjs viser også OK for start, pause og fortsett.
- **F2:** Lagringen bruker `evn-fossilspillet-v04`, og formatet er uendret: v:5, med nøklene v, lvl, unlocked, worlds, found, alive, helper og seenZones. Etter omlasting står det «Fortsett!», og dybden er den samme. «Start helt på nytt» setter fokus på Nei. Esc beholder lagringen, og «Ja» gir «Start!».
- **F3:**
  - En v:5-lagring fra 0.8.0, laget ved å spille main, ble lastet med «Fortsett!», samme dybde (16 m) og samme seenZones.
  - En lagring uten seenZones (merket v:4) ble lastet.
  - En lagring i v03-formatet (0.3–0.5.1) under nøkkelen v03 ble flyttet over (v04 er v:5 med funnet med), og v03 ble beholdt.
  - Ødelagt JSON og feil datatyper gir en ny start uten feil.
  - 📏 virker etter innlasting i alle tilfellene. Ingen sidefeil.
- **U1:** Startkortet har merket, målet, styringslinjene, Start, «← Tilbake til EVN Studio» og «Versjon 0.8.2» (kjor.mjs: OK).
- **U2 (Q-delen):** Hjelpelinjen og «Slik styrer du» i pausen finnes. Faktateksten forteller hvordan teksten kan leses igjen.
- **U3 (Q-delen):** Den nye teksten er kort og enkel: «Trykk på 📏 for å lese igjen.» og title «Les om tiden du graver i».
- **T1 (emulert):** 📏 er 141–169×44 px, ✕ i faktaboksen er 44×44, og alle målte HUD-knapper og pilknapper er minst 44×44 i alle seks størrelsene.
- **K1:** Ingen sidefeil, konsollfeil eller varsler, og ingen svar med status 400 eller høyere i noen kjøring. kjor.mjs viser OK, også for CSP-brudd.
- **K3:** `&lt;title&gt;` er «Fossil Zoo v0.8.2», startkortet viser 0.8.2, og ENDRINGSLOGG.md har en ny rad merket «ikke publisert». Raden stemmer med det jeg målte: 10 s mot 3,5 s før, og uendret lagring og statistikk.
- **S1:** Den statiske suiten er OK. CSP er uendret, og koden har ingen eval.
- **S2:** Ingen forespørsler gikk utenfor 127.0.0.1. Spillet har ingen konto, chat, kjøp eller reklame.
- **S3:** Spillet har ingen fritekstfelt.
- **B2:** M åpner kartet, og spillet står stille (📏 og graving virker ikke). Esc lukker kartet.
- **ST3:** statistikk.js avslutter når siden ikke ligger på evnstudio.no (linje 22). Den er uendret mot main, og ingenting ble sendt.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle avvikene under er kjente eller finnes også på main. Ingen av dem kommer fra 0.8.2.
- **T2, kjent avvik (uendret):** Tab går ut av pausekortet: Fortsett, Slik styrer du, Avslutt, deretter ut av siden og videre til 📏, lvlBtn og parkBtn bak kortet. På startskjermen kommer 📏, lvlBtn, parkBtn, evnAvslutt og det skjulte #fClose før Start.
  - Nytt i 0.8.2: 📏 er blitt et tabstopp i denne rekkefølgen. Det gjør ingenting fra startkortet eller i pausen, så feilen er ikke blitt verre.
  - Gjenskap: start spillet, trykk P og deretter Tab fire ganger.
- **T3, kjent avvik:** `user-scalable=no` (KJENT i kjor.mjs).
- **K2, kjent avvik:** Spillet har ingen global feilfanger.
- **B1, kjent avvik:** Spillet har ingen lydbryter (kodelest).
- **ST2 og B2, kjent avvik, verifisert på nytt:** Spilletiden teller med kartet åpent. `evn-spilletid-fossilspillet.totalt` økte fra 0 til 12 486 ms på 16 s med kartet åpent. I pausen sto den stille (20 236 ms før og etter 16 s). Gjenskap: start spillet, trykk M og les nøkkelen etter 15 s.
- **ST1, kjent avvik (statisk):** statistikk.js lastes nederst i `&lt;body&gt;` med `defer` (linje 2043), og spillet sender ikke `evn-start`.
- **ST4, kjent avvik (statisk):** Spillet sender ingen `feil-fossilspillet-*`-hendelser.
- **ST7:** Avvik som følger av ST1, ST2 og ST4.

## Anbefalte forbedringer
- **Faktaboksen dekker mye på små skjermer (Even bør vurdere):** I 568×320 og 320×568 dekker boksen omtrent 26 % av skjermen, og i 375×812 omtrent 15 %. Nå står den i 10 s også mens barnet graver. At den står lenger, er et godkjent valg. UI8c er ikke tatt i bruk for Fossil Zoo, så dette er ikke et avvik. Be Even si om boksen er i veien når han graver.
- **`autoHideFact` virker ikke lenger i praksis:** Grensen (10 000 ms) er den samme som nedtellingen (10 000 ms), så graving skjuler aldri boksen tidligere. Det er ufarlig. Fjern funksjonen, eller skriv i en kommentar at det er meningen.
- **Uendret fra main:** «Start!» ligger under skjermkanten før man ruller: bunnen er på 592 px i 320×568 og på 324 px i 568×320. Startkortet kan rulles, og Start virker etter rulling.
- **Uendret fra main:** I 320×568 blir hjelpeteksten en smal søyle (`max-width: calc(100vw - 270px)` = 50 px). Den skjules etter 15 s på berøringsskjerm.
- **Uendret fra main:** Ødelagt lagring blir skrevet over med en tom start, uten en kopi av originalen.
- Fra før: Flytt statistikk.js til `&lt;head&gt;`, ta i bruk EVN-PAUSE v3 og send `evn-start` når `feature/statistikk` flettes inn. Hold Tab inne i pausekortet.

## Kontroller som ikke kunne utføres
- **ST5, ST6:** Kun kodelest: godkjente navn, ingen ID-er og ingen informasjonskapsler. Skriptet kjører ikke lokalt.
- **ST8:** `test/statistikk/` finnes verken her eller på main (kjor.mjs: ikke-innfort). Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen er ikke målt.
- **Y2:** Ikke testet ved kjøring (fanebytte og ulik skjermfrekvens). Spill-løkken er uendret, bortsett fra linja for sonetekst.
- **T4:** Kun kodelest. Fargene er uendret. Fokusringen på 📏 er nettleserens standard (auto 1 px), og kontrasten mot den mørke HUD-pillen er ikke målt.
- **S4:** Kun kodelest. Spillet lagrer ingen nye data.
- **B5:** Kun kodelest. Faktatekstene er uendret, og den eneste nye teksten er hjelpeteksten om 📏.
- **E:** T1, T3 og berøring av 📏 og dobbelttrykksperren på ekte iPhone og Android (bare emulert her), B1 (lyd) og Y1.
- **V:** U2 og U3, om barn forstår at 📏 kan trykkes, og om 10 s med faktaboks er bra eller i veien når man graver. Dette vurderer Even.
- Spillet er ikke fullført (ingen dyr vekket). Jeg testet bare dyreparken og reisen i tid til en annen tidsepoke indirekte, gjennom tidsepokevalget.
- UI1–UI10 er ikke tatt i bruk for Fossil Zoo, og klarspråk har status forslag. Ingen av dem er kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – Begge funnene fra 4217034 er rettet, og 📏 virker med mus, tastatur og berøring uten å grave og uten å virke fra startkortet eller i pausen. F1–F3 er testet uten kritiske feil, også med lagring fra 0.8.0. De kjente avvikene i statistikk (ST1, ST2, ST4), T2, T3, K2 og B1 gjelder fortsatt, og krav som krever ekte enhet er ikke testet.
