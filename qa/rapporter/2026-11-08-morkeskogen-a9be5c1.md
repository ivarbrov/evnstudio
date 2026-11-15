# EVN Game QA: Mørkeskogen 2.0.8
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit a9be5c1688fe12ef0fff8cabf6a4e5b1dd2947d4
Testkvittering: evn1 commit=a9be5c1688fe12ef0fff8cabf6a4e5b1dd2947d4 tester=a2c92037f5f1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Versjonen skal foreslås publisert. Endringen gjelder three.js-motoren, som all 3D bruker, og sjekken som avgjør om Start vises. a9be5c1 er siste kodeendring. Commitene etter (502e5fe, 07f2d2d) legger bare til QA-rapporter.
Testet: Gren fiks/morkeskogen-ipad mot origin/main (6c05b36).
- `test/kjor.mjs` er kjørt på a9be5c1 i en midlertidig klone utenfor repoet med rent arbeidstre.
- Testene i nettleseren er kjørt på et rent arbeidstre ved 502e5fe. Alt der er byte for byte likt a9be5c1 utenfor `qa/`, og det er kontrollert med trehash og `cmp` av alle spillfilene.
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
  - Jeg skrev om de seks `static{this.prototype.isX=!0}`-blokkene maskinelt fra filen på origin/main. Resultatet er byte for byte likt `three-r187.global.js` i a9be5c1. Resten av filen er altså uendret.
  - Det finnes ingen `static {`-blokker igjen i noen av skriptene som lastes. Regex-lookbehind finnes heller ikke.
  - `isVector2/3/4` og `isMatrix2/3/4` er true på prototypen. Rotasjon med Matrix4 gir riktig svar.
- **Fjerningen av `.at()`-tillegget:**
  - Alle `.at(`-kall i skriptene som lastes, er `Ray.at` i three.js.
  - I Safari 15.2-miljøet uten `.at` med flere startet spillet med berøring. Det gikk i 8 s og lastet robotmodellen. Pause og Fortsett virket, uten en eneste feil i konsollen.
- **F1:**
  - Start med ekte museklikk ga tilstanden `play`.
  - W holdt inne i 3 s flyttet helten.
  - P åpner pausen med fokus på Fortsett, og Esc fortsetter. M åpner og lukker kartet, og I åpner sekken, som Esc lukker.
  - Avslutt: «Nei, spill videre» gir `play`, og «Ja, avslutt» går til forsiden.
  - Røyktesten på a9be5c1 er OK.
- **F2:**
  - Helt og verden er like etter omlasting (XP 420, tre våpen).
  - «Start helt på nytt» vises bare når det finnes lagring, og fokus står på «Nei, behold alt». Nei beholder alt.
  - Ja sletter `mork3d.helt`, `mork3d.verden` og `mork3d.kart`, men beholder `mork3d.q`.
- **F3:**
  - Lagring laget av den ekte 2.0.7-koden (helt og en bygning) ble lest i 2.0.8. Den lagrede teksten for helten var identisk etter start, og bygningen var med.
  - Med ødelagt JSON kan spillet startes uten feilkort, og `mork3d.helt.kopi` tar vare på originalen.
- **U1:** Startkortet viser mål, styring, «Versjon 2.0.8 · 3D» og «← Tilbake».
- **K1:** Ingen ufangede feil, konsollfeil, svar med status 400 eller høyere eller eksterne forespørsler i de normale flytene. Det gjelder PC, lagring, alle mobil- og iPad-størrelsene, Safari 15-miljøet og manglende WebGL 2. `kjor.mjs` har alle K1-kontrollene OK.
- **K2:** Tapt WebGL-kontekst under spilling gir kortet «Oi! Spillet stoppet» med fokus på «Last på nytt».
- **K3:** Startkortet og røyktesten viser 2.0.8. `ENDRINGSLOGG.md` har en rad, og `LISENSER.md` beskriver endringen riktig.
- **S1:** Den statiske CSP-testen er OK, og CSP er uendret. Ingen eksterne forespørsler ved lokal kjøring.
- **ST3:** Ingenting ble sendt lokalt. Ingen forespørsler til andre verter enn localhost.
- **B2:** Med kartet åpent er tilstanden `pause`, og når kartet lukkes, er den `play` igjen.
- **B3 (meldingsdelen):**
  - Uten WebGL 2 skjules Start, og den nye meldingen vises.
  - Med three.js blokkert skjules Start, og den nye teksten i `#no3d` vises. Feilkortet holdes skjult.
- **Oppsett og berøring:**
  - Ingen sideveis rulling, og Start er synlig uten rulling i alle fem berøringsstørrelsene.
  - Start, ⏸ (44×44) og Fortsett ble trykket med berøring og virket i alle fem.
  - Under spilling fantes ingen synlige trykkflater under 44 px.
- **Kjente funn i standarden som ikke lenger gjelder Mørkeskogen:** K2 («ingen global feilfanger») og B3 («tapt WebGL-kontekst ikke håndtert»). Begge var rettet før 2.0.8 og er bekreftet ved kjøring.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen av disse kommer fra 2.0.8.
- **B3, mulig problem (finnes også i 2.0.7):**
  - `spill.js` bruker `?.` (linje 6373) og `??` (linje 5692). Safari kan lese dette først fra 13.1. Det gjelder blant annet iPadOS 12, som iPad Air 1 og iPad mini 2/3 ikke kan oppdateres forbi.
  - Hvis `spill.js` ikke kan leses, viser startskjermen Start, og et trykk gjør ingenting. Barnet får ingen melding.
  - Jeg gjenskapte oppførselen ved å blokkere `spill.js` med iPad-UA og trykke Start: startskjermen ble stående, uten melding og uten feilkort.
  - Det er ikke testet på en enhet med iPadOS 12.
- **T2, verifisert feil (kjent funn, uendret):** Tab går ut av pausekortet.
- **T2, verifisert feil (ikke i standardens liste):** Tab går ut av «Starte helt på nytt?» (EVN-NULLSTILL). Gjenskapes slik: trykk «Start helt på nytt» og trykk Tab tre ganger. Rekkefølgen var Ja → BODY → startBtn.
- **T1, verifisert feil:** Grafikkvalget under «Tips og styring» er 46×29, 74×29 og 50×29 px. Målt i alle fem berøringsstørrelsene.
- **ST1, avvik kontrollert statisk (kjent):** `statistikk.js` lastes nederst i `<body>` (linje 572), ikke i `<head>`. Spillet sender ikke `evn-start` selv. Starten fanges opp av den felles oppdageren i `statistikk.js`, som reagerer på klikk på `#startBtn` eller `#againBtn`.
- **B1 (kjent):** Ingen lydbryter. Funnet er ikke kontrollert på nytt.

## Anbefalte forbedringer
- `visFeil(e, true)` i `spill.js` (rundt linje 6332) bruker fortsatt den gamle teksten med «maskinvareakselerasjon». Den bør bli lik de nye meldingene.
- Endringsloggen skriver årsaken som sikker og sier «Laveste støttede versjon er nå iPadOS/iOS 15». Ingen av delene er bekreftet på enhet.
- Når three.js mangler, kaster `kompat-r187.js` og `grafikk2.js` ufangede feil. Begge kan avbryte stille med `if (!window.THREE) return`.
- Ved et dødt Start-trykk (se B3) teller statistikken likevel `start-morkeskogen`.
- På Safari 15.0–15.3 forkastes regler der `:focus-visible` står i selektorlisten, så fokusrammene blir borte.
- Grafikkvalget bør få `min-height:44px`, og EVN-PAUSE og EVN-NULLSTILL bør holde fokus inne i dialogen.
- `test/` bør få en syntakskontroll mot eldre Safari.

## Kontroller som ikke kunne utføres
- **Selve iPad-rettingen (E):** Ikke verifisert på ekte iPad. Chrome kan lese static-blokker, så testene viser at ingenting er ødelagt, men ikke at spillet starter på iPadOS 15.0–16.3. Hvilken iPad og iPadOS-versjon meldingen gjaldt, er ukjent. Spillet bør testes på iPadOS 15.x og på den iPaden feilen ble meldt fra.
- **Full syntakskontroll mot Safari 15:** Ikke gjort, fordi det ikke finnes noen parser i repoet. Jeg søkte i stedet etter kjente nyere funksjoner, og søket fant ingen.
- **WebGL 2 i Safari 15 på faktisk maskinvare (E):** Ikke testet.
- **Y1 (E):** Referansemobil er ikke valgt, og det er ingen GPU. SwiftShader ga omtrent 0,5 bilder/s under spilling, og det er ikke representativt.
- **Y2:** Ikke testet.
- **T1 og ekte berøring (E):** Berøring er bare emulert.
- **T3:** Viewport sperrer ikke zoom (statisk OK). `prefers-reduced-motion` er bare kodelest.
- **T4:** Ikke testet.
- **U2 (V) og U3:** Bare de nye tekstene er lest. Hvordan barn forstår dem, er ikke testet.
- **B3, lavere grafikk på svake enheter (E):** Ikke testet.
- **B1 og B4 (V):** Ikke testet.
- **S2:** Kun kodelest at diffen ikke endrer datainnsamling eller betaling.
- **S3:** Kun kodelest at diffen ikke legger til fritekst.
- **S4:** Kun kodelest at diffen ikke endrer personvern- eller sikkerhetssidene.
- **ST2:** Ikke testet. Aktiv spilletid er ikke målt mot kravet, og `test/statistikk/` finnes ikke.
- **ST4:** Ikke testet. Tellingen av `feil-morkeskogen-*` er ikke kontrollert.
- **ST5:** Ikke testet. Hendelsesnavn og antall per sidebesøk er ikke kontrollert, fordi `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`) og ingenting sendes lokalt.
- **ST6:** Ikke testet. Om det finnes informasjonskapsler, bruker-ID eller fingeravtrykk, er ikke kontrollert. `statistikk.js` er uendret i diffen.
- **ST7:** Ikke testet. Spillet laster `statistikk.js` med `data-spill="morkeskogen"` (statisk sett), men om statistikken virker som godkjent, er ikke kontrollert ved kjøring.
- **ST8:** Ikke utført, fordi `test/statistikk/` ikke finnes. Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen.
- **Lyd, lange økter og Evens spilltest (V):** Ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. F1, lagring fra ekte 2.0.7, nullstilling og de nye 3D-meldingene virker i Chrome. Det viktigste forbeholdet er at formålet med versjonen, at spillet kan startes på eldre iPad, ikke er testet på ekte iPad, og at iPader med iPadOS 12 trolig får et Start som ikke virker, uten noen melding.
