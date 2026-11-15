# EVN Game QA: Mørkeskogen 2.0.7
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c95b3aa1ef934bd26cd472493bd82da54a5921d2
Testkvittering: evn1 commit=c95b3aa1ef934bd26cd472493bd82da54a5921d2 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om det. `statistikk.js` er felles kode, og publiseringssjekken krever full rapport per spill. Endret mot origin/main (43aa7b9): `statistikk.js` lytter nå på `evn-start` (7 linjer); Mørkeskogen har fått versjon 2.0.7 (bare én linje på startkortet); `ENDRINGSLOGG.md` har en ny rad; QA-rapporter er lagt til. Ingenting er overført fra tidligere rapporter; alt er kjørt på nytt på c95b3aa.
Testet: Lokal server 127.0.0.1:8942 (`python -m http.server`), stoppet etterpå. Playwright med Chromium headless (SwiftShader, ingen GPU). Funksjon i 1000×650; oppsett i 1280×800, 375×812, 740×360, 320×568 og 568×320 (mobilstørrelsene emulert med `is_mobile` og berøring). Ekte mus- og tastehendelser fra Playwright; klikk med `force=True`, fordi startknappen pulserer og bildene kommer sakte; `tap` på mobil. Spillets tilstand ble lest gjennom en krok lagt til `spill.js` via ruting, bare i testnettleseren. evnstudio.no ble simulert ved å rute til den lokale serveren; `gc.zgo.at/count.js` ble erstattet med en lokal etterligning, og alle andre eksterne forespørsler ble stoppet. Ingen ekte tellinger er sendt. Spillet ga bare omtrent 0,3 bilder per sekund i SwiftShader. Testskriptene og resultatene ligger i `/tmp/qa-mork-84d/`, utenfor repoet. Arbeidstreet er rent på c95b3aa, og testserveren på port 8942 er stoppet.

## Oppfylte krav
- Selve endringen (`evn-start`): Klikk på Start ga `start-morkeskogen` én gang. To `evn-start` etter klikket ga ingen ny telling. På en ny side ga `evn-start` alene én start, og et klikk på Start etterpå ga ingen dobbel telling. Mørkeskogen sender ikke `evn-start` selv, så oppførselen i spillet er uendret.
- F1: Start (klikk), pause (P), fortsett (Esc), kart (M) som setter spillet i pause, sekk (I), gange (W, roboten flyttet seg 16 enheter) og Avslutt med «Nei, spill videre», som gir `play`, virker uten sidefeil. Røyktesten i `kjor.mjs` er OK.
- F2: XP 160 overlever en ny innlasting. «Start helt på nytt» spør først, med fokus på «Nei, behold alt». Nei beholder lagringen. Ja sletter `mork3d.helt`, `.verden` og `.helt.kopi`, men beholder grafikkvalget.
- F3: Uleselig JSON i helt og verden gir et spill som kan spilles, og kopien `{ugyldig` tas vare på. Lagring i v1-formatet (sverd, bue, XP 420, oppdrag, fiskebok, frø 12345 og én hytte) beholdes uendret.
- U1: Startkortet har mål, styring, «Versjon 2.0.7 · 3D» og «← Tilbake».
- U2 (Q): «Tips og styring» på startkortet og «Slik styrer du» i pausen.
- K1: I `kjor.mjs` er alle tre K1-kontrollene OK. Kjøringene for lagring, oppsett, feil og statistikk hadde ingen sidefeil, konsollfeil eller svar med status 400 eller høyere, med unntak av feilene som ble laget med vilje (se ST4).
- K2: En kastet feil fra `spill.js` under spilling gir kortet «Oi! Spillet stoppet», med fokus på «Last på nytt».
- K3: Versjonen er hevet til 2.0.7 både på startkortet og i røyktesten. `ENDRINGSLOGG.md` har en rad for PR #53 som stemmer med koden og med det som ble målt: starten telles én gang, og de kjente avvikene i ST2, ST4 og versjonshendelsen står der.
- S1: Statisk kontroll av CSP er OK. Lokalt var det ingen eksterne forespørsler. På simulert evnstudio.no ble bare `gc.zgo.at` forespurt.
- S2: Ingen konto, chat eller betaling.
- S3: Det finnes ingen `input`, `textarea`, `contenteditable` eller `prompt()`.
- S4: Personvernsiden nevner start og spilletid, og at spilletiden «kan også telle pauser». Det stemmer med det som ble målt.
- B2: Kartet setter spillet i pause.
- B3 (meldingsdelen): Tapt WebGL-kontekst under spilling gir en vennlig melding.
- T3 (zoom): Viewport sperrer ikke zoom.
- ST3: Lokalt lastes ikke GoatCounter (`window.goatcounter` er undefined), og ingenting sendes.
- ST4 (første setning): Spillet startet og gikk videre både når `count()` kastet feil og når `count.js` var blokkert. Feilkortet ble ikke vist.
- ST5: Bare `start-morkeskogen` og `spilletid-morkeskogen-01min` ble sendt, én gang hver, uten fritekst.
- ST6: Ingen informasjonskapsler. `statistikk.js` legger ikke til nøkler i localStorage og lager ingen ID-er.
- Oppsett: Ingen sideveis rulling i noen av de fem størrelsene. Start er synlig uten rulling. Knappene under spilling er minst 44 px og overlapper ikke. Pause og Fortsett virker med berøring i alle fire mobilstørrelser. I 568×320 kan pausekortet rulles, og Avslutt kan nås.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen av disse kommer fra PR #53. ST2, ST4 og versjonshendelsen står som kjente avvik i den nye raden i endringsloggen. ST1, ST2, ST4 og ST7 finnes også på origin/main.

- ST2, verifisert feil (kjent i endringsloggen): `spilletid-morkeskogen-01min` sendes mens spillet står i pause. Gjenskapes: Start, trykk P, og vent med siden synlig. I en egen kjøring kom hendelsen etter omtrent 67 s i pause, med `visibilityState` `visible` og tilstanden `pause` hele tiden. I scenario B kom ikke hendelsen innen 130 s; årsaken er ukjent, trolig at tidtakerne gikk sakte i headless. Koden teller synlig fanetid. `window.EVNAktivTid` finnes ikke, og spillet bruker EVN-PAUSE v2, ikke v3.
- ST1, verifisert feil (statisk): `statistikk.js` lastes nederst i `<body>` (linje 572), etter `spill.js`, ikke i `<head>`. Spillet sender ikke `evn-start`; starten telles via klikk-oppdageren.
- ST4 (andre setning), verifisert feil (statisk): `statistikk.js` sender ingen `feil-<spill>-oppstart` eller `feil-<spill>-spill`.
- Godkjente hendelser: `versjon-morkeskogen-2.0.7` sendes ikke sammen med start (verifisert, og kjent i endringsloggen). Endringsloggen knytter dette til ST7; etter standarden hører det til tabellen «Godkjente hendelser» og dermed ST1.
- ST7: Avvik som følge av ST1, ST2 og ST4.
- T1, verifisert feil: Grafikkvalget «Lav», «Middels» og «Høy» under «Tips og styring» er 29 px høyt (46×29, 74×29 og 50×29). Gjenskapes ved å åpne «Tips og styring» i 375×812 og måle `#qrow button`; knappene er synlige. Funnet ble også gjort på 84d959c og står ikke blant de kjente funnene i standarden.
- T2 (kjent funn, uendret): Tab går ut av pausekortet. Rekkefølgen var Styring → h2NyVerden → Avslutt → BODY → h2Hjelp → evnAvslutt. Fokus i Avslutt-dialogen og i dialogen for å starte på nytt er riktig.
- B1 (kjent funn, uendret): Det finnes fortsatt ingen lydbryter.

## Anbefalte forbedringer
- Gi grafikkvalget minst 44 px høyde, for eksempel med `min-height:44px` på `.card .qrow button`.
- `tell()` i `statistikk.js` bør ha `try/catch` rundt `goatcounter.count()`. Når `count()` kaster, blir det en ufanget feil i konsollen, selv om spillet går videre.
- Lytteren teller `evn-start` også mens startskjermen vises. Nye spill bør sende hendelsen først når spillingen faktisk begynner, slik kommentaren sier.
- Pausekortet er høyere enn skjermen i 740×360 og 568×320, så Avslutt må rulles fram.

## Kontroller som ikke kunne utføres
- ST8: `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Testsiden ble erstattet med egne kjøringer mot simulert evnstudio.no. Bare 01-minuttsmilepælen er sett; 05–60 min er ikke testet. Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging kontrollere.
- Y1 (E): Referansemobil er ikke valgt, og det er ingen GPU.
- Y2: Ikke testet. Bildefrekvensen var omtrent 0,3 bilder per sekund i SwiftShader.
- F1, styrken i beviset: `g.time` endret seg ikke målbart, heller ikke mens spillet var i gang. At spillet står stille i pause, kart og sekk, er derfor vist gjennom tilstanden (`pause` og `menu`), ikke gjennom tid. Det bør bekreftes på ekte PC.
- T1, T3 (`prefers-reduced-motion`) og ekte berøring (E): Krever enhet. Reduced-motion er bare kodelest.
- T4: Ikke testet.
- U3: Kun kodelest. Delen som krever Even (V), er ikke testet.
- U2 (V-delen): Ikke testet.
- B3: «Uten WebGL» og lavere grafikk på svake enheter (E) er ikke testet.
- B1 og B4 (V): Ikke testet.
- UI1–UI10: Ikke tatt i bruk for Mørkeskogen. Status: godkjent hovedløsning.
- Lyd og lange økter: Ikke testet.
- Evens spilltest (V): Ikke relevant, fordi spillet bare har fått nytt versjonsnummer.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. F1, lagring og endringen i `statistikk.js` virker uten dobbel telling i Mørkeskogen. Forbeholdene: statistikken avviker fortsatt fra ST1, ST2, ST4 og ST7 (kjent og dokumentert), grafikkvalget bryter T1, og Y1/Y2 kunne ikke måles.
