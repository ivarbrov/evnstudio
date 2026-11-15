# EVN Game QA: Mørkeskogen 2.0.8
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 502e5fe3b1146b916ffe50a8a541d1e149fb9caa
Testkvittering: evn1 commit=502e5fe3b1146b916ffe50a8a541d1e149fb9caa tester=a2c92037f5f1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Versjonen skal foreslås publisert. Endringen gjelder three.js-motoren, som all 3D bruker, og sjekken som avgjør om Start vises. Siste kodecommit er a9be5c1. HEAD legger bare til forrige QA-rapport, så alt ble kontrollert på nytt og ingen resultater fra 387e378 er brukt som bevis.
Testet: Gren fiks/morkeskogen-ipad mot origin/main (6c05b36). Arbeidstreet var rent før og etter.
- Automatiske tester: `node test/kjor.mjs` ga 86 OK og 0 feil.
- Nettleser: Chrome 157 uten skjerm og med SwiftShader (ingen GPU), styrt med DevTools-protokollen. Klikk, berøring og taster ble sendt som ekte input-hendelser (`Input.dispatch*`).
- Server: lokal på localhost, stoppet etterpå. Ingenting ble kjørt mot evnstudio.no.
- 2.0.7 ble kjørt fra en kopi av origin/main utenfor repoet for å lage ekte lagring.
- Lesing av tilstand: i noen av kjøringene ble en lesekrok lagt til `spill.js` i testnettleseren ved ruting. Repoet er ikke endret.
- Skjermstørrelser: 1280×800 (PC). Med emulert berøring: 375×812, 812×375 og 320×568, og 768×1024 og 1024×768 med iPad-UA for Safari 15.2.
- Egne kjøringer: uten WebGL 2, med three.js blokkert, med `spill.js` blokkert, og et «Safari 15.2-lignende» miljø der `.at`, `findLast`, `Object.hasOwn`, `structuredClone`, `roundRect`, `OffscreenCanvas` med flere var fjernet før innlasting.
- Opprydding: `localStorage` er tømt etterpå.
- Nettleserpanelet var skjult, så bildefrekvensen kunne ikke måles der.

## Oppfylte krav
- **Selve endringen:**
  - Jeg skrev om de seks `static{this.prototype.isX=!0}`-blokkene maskinelt fra filen på origin/main. Resultatet er byte for byte likt `three-r187.global.js` i HEAD. Resten av filen er altså uendret. Forskjellen i linjeskift i arbeidstreet kommer bare av autocrlf.
  - Det finnes ingen `static {`-blokker igjen i noen av skriptene som lastes. Regex-lookbehind finnes heller ikke.
  - `isVector2/3/4` og `isMatrix2/3/4` er true på prototypen. Rotasjon med Matrix4 gir riktig svar.
- **Fjerningen av `.at()`-tillegget (a9be5c1):**
  - Alle `.at(`-kall i skriptene som lastes, er `Ray.at` i three.js. Ingen kall finnes i `spill.js`, `grafikk2.js`, `hud2.js`, `kompat-r187.js`, `index.html` eller `statistikk.js`.
  - I Safari 15.2-miljøet uten `.at` med flere startet spillet med berøring. Det gikk i 8 s og lastet robotmodellen (3 SkinnedMesh). Pause og Fortsett virket, uten en eneste feil i konsollen.
- **F1:**
  - Start med ekte museklikk ga tilstanden `play`.
  - W holdt inne i 3 s flyttet helten (y fra 5640 til 5633,2).
  - P åpner pausen med fokus på Fortsett, og Esc fortsetter. M åpner og lukker kartet, og I åpner sekken, som Esc lukker.
  - Avslutt: «Nei, spill videre» gir `play`, og «Ja, avslutt» går til forsiden.
  - Røyktesten er OK.
- **F2:**
  - Helt og verden er like etter omlasting (XP 420, tre våpen).
  - «Start helt på nytt» vises bare når det finnes lagring, og fokus står på «Nei, behold alt». Nei beholder alt.
  - Ja sletter `mork3d.helt`, `mork3d.verden` og `mork3d.kart`, men beholder `mork3d.q`.
- **F3:**
  - Lagring laget av den ekte 2.0.7-koden (helt og en bygning) ble lest i 2.0.8. Den lagrede teksten for helten var identisk etter start, og bygningen var med.
  - Med ødelagt JSON i helt og verden kan spillet startes uten feilkort, og `mork3d.helt.kopi` tar vare på `{ugyldig`.
- **U1:** Startkortet viser mål, styring, «Versjon 2.0.8 · 3D» og «← Tilbake».
- **K1:** Ingen ufangede feil, konsollfeil, svar med status 400 eller høyere eller eksterne forespørsler i flytene for PC, lagring, alle mobil- og iPad-størrelsene, Safari 15-miljøet og manglende WebGL 2. Unntakene er feil fremkalt med vilje, se B3 og K2. `kjor.mjs` har alle K1-kontrollene OK.
- **K2:** Tapt WebGL-kontekst under spilling (`loseContext()`) gir kortet «Oi! Spillet stoppet» med fokus på «Last på nytt».
- **K3:** Startkortet og røyktesten viser 2.0.8. `ENDRINGSLOGG.md` har en rad, og `LISENSER.md` beskriver endringen i three.js riktig.
- **S1:** Den statiske CSP-testen er OK, og CSP er uendret i diffen. Ingen eksterne forespørsler ved lokal kjøring.
- **ST3:** Ingenting ble sendt lokalt.
- **B2:** Med kartet åpent er tilstanden `pause`, og når kartet lukkes, er den `play` igjen.
- **B3 (meldingsdelen):**
  - Med `--disable-webgl2` (WebGL 1 finnes) skjules Start, og den nye meldingen vises uten feil i konsollen.
  - Med three.js blokkert skjules Start, og den nye teksten i `#no3d` vises. Feilkortet holdes skjult.
- **Oppsett og berøring:**
  - Ingen sideveis rulling på startskjermen eller under spilling, og Start er synlig uten rulling i alle fem berøringsstørrelsene.
  - Start, ⏸ (44×44) og Fortsett ble trykket med berøring og virket i alle fem.
  - Under spilling fantes ingen synlige trykkflater under 44 px.
- **Kjente funn i standarden som ikke lenger gjelder Mørkeskogen:** K2 («ingen global feilfanger») og B3 («tapt WebGL-kontekst ikke håndtert»). Begge var rettet før 2.0.8, og det er bekreftet ved kjøring nå.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen av disse kommer fra 2.0.8.
- **B3, mulig problem (finnes også i 2.0.7, men berører formålet med denne versjonen):**
  - `spill.js` bruker `?.` (linje 6373) og `??` (linje 5692). Safari kan lese dette først fra 13.1. Det gjelder blant annet iPadOS 12, som iPad Air 1 og iPad mini 2/3 ikke kan oppdateres forbi.
  - Hvis `spill.js` ikke kan leses, viser startskjermen Start, og et trykk gjør ingenting. Barnet får ingen melding.
  - Jeg gjenskapte oppførselen ved å blokkere `spill.js` med iPad-UA og trykke Start: startskjermen ble stående, uten melding og uten feilkort.
  - At iPadOS ≤ 13.3 faktisk stopper på syntaksen, er ikke testet på enhet.
  - For å avgjøre det: test på en iPad med iPadOS 12, eller legg inn en reserve som ikke avhenger av `spill.js`.
- **T2, verifisert feil (kjent funn, uendret):** Tab går ut av pausekortet. Rekkefølgen var evnPauseStyrKnapp → h2NyVerden → evnPauseAvslutt → BODY → h2Hjelp → evnAvslutt.
- **T2, verifisert feil (fra forrige rapport, ikke i standardens liste):** Tab går ut av «Starte helt på nytt?» (EVN-NULLSTILL). Gjenskapes slik: trykk «Start helt på nytt» og trykk Tab tre ganger. Rekkefølgen var evnNullstillJa → BODY → startBtn.
- **T1, verifisert feil:** Grafikkvalget under «Tips og styring» er 46×29, 74×29 og 50×29 px. Målt i alle fem berøringsstørrelsene.
- **ST1, avvik kontrollert statisk (kjent):** `statistikk.js` lastes nederst i `<body>` (linje 572), ikke i `<head>`.
- **B1 (kjent):** Ingen lydbryter. Lydkoden er ikke endret, og funnet er ikke kontrollert på nytt.

## Anbefalte forbedringer
- `visFeil(e, true)` i `spill.js` (rundt linje 6332) bruker fortsatt den gamle teksten «Denne nettleseren … slå på maskinvareakselerasjon». Den vises hvis WebGL 2-sjekken godtar enheten, men renderer-oppstarten feiler. Teksten bør bli lik de nye, enklere meldingene.
- Endringsloggen skriver årsaken som sikker og sier «Laveste støttede versjon er nå iPadOS/iOS 15». Ingen av delene er bekreftet på enhet. Skriv «sannsynlig årsak» til det er testet.
- Når three.js mangler, kaster `kompat-r187.js` og `grafikk2.js` ufangede feil. Meldingen vises likevel riktig. Begge kan avbryte stille med `if (!window.THREE) return`.
- Ved et dødt Start-trykk (se B3) teller statistikken likevel `start-morkeskogen` på evnstudio.no, fordi tellingen skjer ved klikk på `#startBtn`.
- På Safari 15.0–15.3 forkastes regler der `:focus-visible` står i selektorlisten, så fokusrammene blir borte. Det er bare kosmetisk.
- Grafikkvalget bør få `min-height:44px`, og EVN-PAUSE og EVN-NULLSTILL bør holde fokus inne i dialogen.
- `test/` bør få en syntakskontroll mot Safari 15 og eldre.

## Kontroller som ikke kunne utføres
- **Selve iPad-rettingen (E):** Ikke verifisert på ekte iPad. Chrome kan lese static-blokker, så testene viser bare at ingenting er ødelagt og at manglende `.at` med flere ikke gir feil. De viser ikke at spillet starter på iPadOS 15.0–16.3. Hvilken iPad og iPadOS-versjon meldingen gjaldt, er ukjent. Har iPaden 16.4 eller nyere, er feilen ikke forklart av denne endringen. Spillet bør testes på iPadOS 15.x og på den iPaden feilen ble meldt fra.
- **Full syntakskontroll mot Safari 15:** Ikke gjort, fordi det ikke finnes noen parser i repoet. En parser av ukjent opphav i det midlertidige området ble ikke brukt. Jeg søkte i stedet etter kjente nyere funksjoner i alle skript og CSS-filer som lastes. Søket fant ingen static-blokker, lookbehind, private klassemedlemmer, `findLast`, `structuredClone`, `Object.hasOwn`, `:has()`, `dvh`, `<dialog>` eller `inert`. `roundRect` i `spill.js` er en egen funksjon, ikke Canvas-API-et.
- **WebGL 2 i Safari 15 på faktisk maskinvare (E):** Ikke testet.
- **Y1 (E):** Referansemobil er ikke valgt, og det er ingen GPU. SwiftShader ga omtrent 0,5 bilder/s under spilling i 1280×800. Det sier ingenting om ekte enheter.
- **Y2:** Fanebytte og skjermfrekvens er ikke testet.
- **T1 og ekte berøring (E):** Berøring er bare emulert.
- **T3:** Viewport sperrer ikke zoom (statisk OK). `prefers-reduced-motion` er bare kodelest: én media-regel for startknappen.
- **T4:** Ikke testet.
- **U2 (V) og U3 (Q/V):** Bare de nye tekstene er lest. De er enklere enn før, se anmerkningen over om den gamle teksten i `visFeil`. Hvordan barn forstår dem, er ikke testet.
- **B3, lavere grafikk på svake enheter (E):** Ikke testet.
- **B1 og B4 (V):** Ikke testet.
- **S2, S3 og S4:** Bare kodelest at diffen ikke endrer datainnsamling, betaling, fritekst eller personvern- og sikkerhetssidene.
- **ST2 og ST4–ST8:** `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen.
- **Lyd, lange økter og Evens spilltest (V):** Ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. F1, lagring fra ekte 2.0.7, nullstilling og de nye 3D-meldingene virker i Chrome, og fjerningen av `.at()` gir ingen feil. Det viktigste forbeholdet er at formålet med versjonen, at spillet kan startes på eldre iPad, ikke er testet på ekte iPad. iPader som ikke kan oppdateres forbi iPadOS 12, får trolig et Start som ikke virker, uten noen melding.
