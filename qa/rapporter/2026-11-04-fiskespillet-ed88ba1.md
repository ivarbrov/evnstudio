# EVN Game QA: Fiskespillet 0.2.1
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit ed88ba12c560d849583987d39de5b222014a27b5
Testkvittering: evn1 commit=ed88ba12c560d849583987d39de5b222014a27b5 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – kontrollen skal vise om versjonen kan sendes videre, og `statistikk.js` er felles kode (høy risiko for alle spill). Fra `test/kjor.mjs`: 98 OK, 0 FEIL, 0 VARSEL. Én kontroll er KJENT (Fossil Zoo T3 `user-scalable=no`, et kjent funn i standarden og ikke fra denne endringen). To suiter er ikke innført: `test/statistikk/` og `prototype/ui/` finnes verken på grenen eller på `origin/main`.
Testet: Lokal `python3 -m http.server` (127.0.0.1:8766) og en eksport av 4c1deba (127.0.0.1:8767) for å lage lagringer med 0.2.0. Begge serverne er stoppet, og Chrome er lukket. Headless Google Chrome via puppeteer-core med SwiftShader, 1–4 bilder/s. Størrelser: 1280×800 (mus og tastatur), og 375×812, 740×360, 320×568 og 568×320 med emulert berøring og DPR 2. Jeg brukte ekte tastetrykk, musklikk og trykk via CDP. Tilstand ble satt opp med `#test` (spillets egen testmodus), `window.__spill` (flytte båten, gi stang og penger) og egne lagringer, som ble skrevet fra en annen side på samme opprinnelse slik at `pagehide` ikke skrev over dem. For statistikk på evnstudio.no avskar jeg forespørslene: `https://evnstudio.no/…` ble servert fra disk, og `gc.zgo.at/count.js` ble byttet ut med en stubb som registrerer `goatcounter.count`. Alle andre eksterne forespørsler ble stoppet. A/B-sammenligning: samme spill med `statistikk.js` fra HEAD og fra `origin/main`. For å teste spilletid fikk `setInterval` på 5000 ms 50 ms i stedet, så ett minutt tilsvarer 0,6 s. localStorage var tom før og etter hver økt. Klonen er urørt (`git status` er tom).

## Oppfylte krav
- **F1:** Start (musklikk og berøring), kjøring (piltaster og emulert styrespak, 16–21 enheter på 4 s) og fisking virker. I normal modus kom fisken etter 20 s, og med `#test` ble båten full (5/5). Havna virker: Lever, Selg alle (20 000 → 20 085), kjøp av stang og båt med riktig trekk (→ 4 600). Lukking virker med ✕, trykk utenfor, Esc og Lukk. Fiskeboka virker (I, knapp, ✕, trykk utenfor). Pause virker (P, Esc, ⏸, Fortsett), og båten står stille med ↑ holdt. Kartet virker (M, 🗺️, ✕), og båten står stille. Avslutt virker: Nei fra pausen og fra 🚪 (Esc og knapp), og spillet går videre etterpå. «Ja, avslutt» går til forsiden, og lagringen beholdes. Kraken: 22 trykk på E fanger den, og man får 10 000. Uten trykk slipper den unna etter 21 s med «Prøv igjen» og et tips.
- **F2:** Etter pause og omlasting er tilstanden lik (penger, stang, båt, fanget). «Start helt på nytt» vises bare når det finnes fremgang. Nei og Esc beholder alt, og Ja sletter `evn-fiskespillet-v1`. Lydvalg og spilletid beholdes.
- **F3 (tidligere funn rettet):** Lagring med `plass` 7 og `akvPlass` 8 rundes ned til 5/5, og med båt 1 blir plass 12/13 til 10/10. Butikken viser ingen NaN, og alle kjøp gir tall. Ugyldig JSON og `v:2` lagres i `evn-fiskespillet-v1-kopi`, `[]` også. `null`, `"tekst"`, feil typer og `1e400` gir ingen feil og ingen NaN. En gyldig lagring leses uendret, også feltene `last`, `akv`, `best` og `rest`. En ekte lagring laget med 0.2.0 (4c1deba) leses likt felt for felt i 0.2.1.
- **U1:** Startkortet har EVN STUDIO, tittel, mål og oppdrag, styring for PC eller berøring, ▶ Start, «← Tilbake til EVN Studio», «Start helt på nytt» og «Versjon 0.2.1». Det er ingen sideveis rulling i noen av de fem størrelsene. Tidligere funn rettet: «Tilbake» og «Start helt på nytt» overlapper ikke lenger (4 px mellomrom i alle størrelser).
- **U2 (Q):** Handlingsknappen viser hva som kan gjøres («🎣 Fisk», «⚓ Havna», «📦 Båten er full», «🐙 Fang Kraken», «💪 Dra!»). Pausen har «Slik styrer du», og det vises en melding ved start.
- **U3 (Q):** Tekstene er korte og på enkel norsk. Tap er mildt: «Kraken slapp unna! Prøv igjen», og ingenting går tapt.
- **T1:** Alle synlige knapper og lenker er minst 44×44 px i alle fem størrelsene og i tilstandene start, spill, Havna, Fiskeboka, kart, pause og Avslutt. Minste mål er 44 px. Den nye ✕ er 48×48.
- **T2 (tidligere funn rettet):** Tab og Shift+Tab går rundt inne i pausen (Fortsett, Slik styrer du, Avslutt, E-coins), i kartet (✕), i «Vil du avslutte?» fra pausen og fra 🚪 (Nei og Ja), i «Starte helt på nytt?» (Nei og Ja) og i Havna og Fiskeboka. Fokus står på første knapp når en dialog åpnes. Etter lukking er ingen elementer igjen med `inert`, og fokus går tilbake (nullstill → lenka).
- **T3 (tidligere funn rettet):** Med `prefers-reduced-motion: reduce` er kamerarist i Kraken-kampen 0,0001 per bilde, mot 0,068 uten. `gesturestart` stoppes ikke når Havna er åpen (syntetisk hendelse). Viewport sperrer ikke zoom (statisk OK).
- **T4 (Q):** Sjeldenhet vises med navn og stjerner, ikke bare farge. HUD bruker tekst («12/15», «16 av 5000»). Teksten er hvit på mørkeblått.
- **K1:** Ingen ufangede feil, ingen konsollfeil fra spillet og ingen 404 fra spillet i noen økt. Den eneste 404-en, `/favicon.ico`, kom fra testsiden min (`ENDRINGSLOGG.md`). Røyktesten er også OK.
- **K2:** En uventet feil under vanlig spilling viser feilkortet med fokus på «Last på nytt». Se avviket for pause og kart.
- **K3:** «0.2.1» står i tittel, startkort og `VERSJON`. `ENDRINGSLOGG.md` har en rad for 0.2.1 (ikke publisert), og det som står der, stemmer med det jeg målte.
- **S1:** Statisk CSP er OK. Ved kjøring var det ingen CSP-brudd og ingen forespørsler utenfor 127.0.0.1. Med produksjonsoppsettet ble bare `gc.zgo.at/count.js` forsøkt hentet.
- **S2 (Q):** Ingen konto, chat, reklame eller ekte kjøp. Penger og butikk finnes bare i spillet.
- **S3:** Ingen fritekst (0 felt av typen `input`, `textarea` eller `contenteditable`).
- **S4 (Q):** Personvernsiden sier at spillstarter og grove spilletidsintervaller telles, og at «Spilletiden … kan også telle pauser». Det stemmer med det som skjer.
- **ST1 (tidligere funn rettet for start):** `statistikk.js` med `data-spill="fiskespillet"` står i `<head>`. Spillet sender `evn-start` én gang. Med produksjonsoppsettet kommer `start-fiskespillet` én gang, også om Start klikkes en gang til. Med `statistikk.js` fra main kommer den ikke.
- **ST3:** Skriptet stopper utenfor evnstudio.no (linje 22). Lokalt ble det ikke lastet noe fra gc.zgo.at.
- **ST5:** Fiskespillet sender bare godkjente navn, hvert høyst én gang: sidevisning, `start-fiskespillet`, `spilletid-fiskespillet-01min` og `-05min`. Ingen fritekst. Den automatiske testen (`test/statistikk/`) mangler.
- **ST6:** `document.cookie` er tom i alle seks spillene, og koden har ingen ID.
- **Andre spill med den felles `statistikk.js`:** A/B med HEAD og `origin/main` gir like hendelser for eventyrspill, morkeskogen, fossilspillet, dyrepatruljen og magiske-egg: sidevisning, `start-<spill>` én gang (også ved et ekstra klikk på Start) og `spilletid-<spill>-01min/05min`. Det gjelder også Magiske egg, som både sender `evn-start` og har en egen oppdager. Forsiden og personvernsiden gir bare sidevisning. Ingen feil og ingen CSP-brudd.
- **B1:** L og 🔊 slår lyden av og på. «av» lagres i `evn-fiskespillet-lyd` og huskes etter omlasting (🔇).
- **B2:** Kartet viser spilleren, havna, fiskesteder og Kraken (skjermbilde), og båten står stille mens kartet er åpent. Tidligere funn rettet: Kartkortet kan rulles i lavt liggende format. Ved 568×320 er det 87 px å rulle, ved 740×360 33 px, og musehjulet når bunnen.
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her» med forklaring, og Start er slått av.
- **B4 (Q):** Kraken har lilla tegneserietentakler (skjermbilde), og kampen er valgfri. Taper man, er det mildt, og man kan prøve igjen.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST2 – verifisert feil (gjenstår fra 4c1deba):** Spillet bruker EVN-PAUSE v2, og `window.EVNAktivTid` mangler. `statistikk.js` teller synlig fane. Slik gjenskaper du feilen med produksjonsoppsettet: trykk Start og deretter P med en gang. `spilletid-fiskespillet-01min` og `-05min` sendes mens pausen er åpen. Dette gjelder alle spill på grenen og på main. ENDRINGSLOGG sier selv at den godkjente statistikken (`feature/statistikk`) ikke er tatt inn.
- **ST4 – verifisert feil (gjenstår):** En uventet feil under spilling gir feilkortet, men ingen `feil-fiskespillet-spill`. `statistikk.js` har ingen feilhendelser. At en feil i statistikken ikke stopper spillet, er bare kodelest. Lokalt, uten GoatCounter, går spillet som normalt.
- **ST7 – verifisert feil (gjenstår):** Fordi `versjon-<spill>-<versjon>` (ST1-tabellen), feilhendelser (ST4) og aktiv tid (ST2) mangler, har spillet ikke den godkjente statistikken. Det må på plass før publisering. Felles kode.
- **K2 – verifisert feil (ny, kommer av T2-rettingen):** Hvis det oppstår en uventet feil mens pausen eller kartet er åpent, vises feilkortet øverst (z-index 100001). Men `#feil` blir satt `inert` av `settInert`, så «Last på nytt» kan ikke trykkes eller få fokus. Klikket går gjennom til pausekortet eller kartet under, og siden blir ikke lastet på nytt. Fokus blir stående på Fortsett eller ✕. Slik gjenskaper du feilen: Start, trykk P (eller M), og kjør `setTimeout(()=>{throw new Error('x')},0)` som et innebygd skript. Feilkortet kan brukes igjen når pausen er lukket. Fremgangen er lagret (`lagre()` i feilfangeren), så feilen er ikke kritisk.

## Anbefalte forbedringer
- Ta feilkortet (`#feil`) ut av `settInert`, eller kall `EVNPauseInert(null)` når feilkortet vises (retter K2-avviket).
- Fokus etter Start havner fortsatt på BODY, fordi `#handling` er skjult når `focus()` kjøres. Ikke rettet siden 0.2.0. Etter ✕ i Havna går fokus derfor også til BODY.
- Mobil 375×812 og 320×568: meldingen dekker fortsatt en del av 📖-pillen (375: x 94–125, y 124–168), så «16 av 5000» blir delvis skjult. Ikke rettet.
- Mobil: ✕ i Havna og Fiskeboka er klistret til toppen (`sticky`). Ved rulling legger den seg over toppen av innholdet (fanen «Akvariet», 25×18 px ved 375×812, og «Selg» ved 740×360 og 568×320). Trykket treffer ✕ og ikke fanen, men vurder litt luft til høyre for fanene.
- Kart ved 568×320: overskriften blir høy («Du · Havna · Fiskested · Kraken» bryter over 5 linjer), så kartet kuttes og må rulles. ✕ i kartet ruller da ut av syne. Esc, M og trykk utenfor virker fortsatt.
- Lagring: `evn-fiskespillet-v1-kopi` slettes ikke ved «Start helt på nytt» og skrives over av neste ødelagte lagring. `null` og `"tekst"` gir ingen kopi.
- Fortsatt fra 0.2.0: `webglcontextlost` håndteres ikke, og uten WebGL sendes `Error creating WebGL context` videre som en ufanget feil. Lavere grafikk er bare et tak på DPR.
- Ta med Fiskespillet i standardens oversikt «Hvilke krav gjelder for hvert spill» (jeg har brukt B1–B4).

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes ikke på grenen eller på main, så `?auto` kunne ikke kjøres. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging etter publisering.
- **Y1 (E):** Ingen referansemobil er valgt. Headless SwiftShader (1–4 bilder/s) sier ikke noe om ekte maskinvare.
- **Y2 – kun kodelest (delvis):** Fanebytte (ny fane, `visibilityState: hidden`) og `blur` åpner pausen med forklaring, og spillet fortsetter med Esc. At farten er uavhengig av skjermfrekvens, er bare kodelest (dt-basert, tak 0,05 s). 60/120 Hz kunne ikke kjøres.
- **T1, T3, B1 (E):** Ekte berøring, klypezoom på iPhone og Android, rulling med fingeren i Havna og kartet (syntetisk sveip rullet ikke i headless, og det er ikke avgjort) og faktisk lyd er ikke testet. Mobil er emulert.
- **B3 (E):** Ytelse og grafikknivå på svake enheter.
- **U2, U3, B4 (V):** Om Even og 7-åringer forstår spillet og synes Kraken-kampen er passe vanskelig, må Even teste.
- **B5–B7:** Gjelder ikke (ingen læringsfakta, app-installasjon eller fritekst).
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for dette spillet.
- Spillmekanikk og balanse er kontrollert i diffen: INNST, priser og tabeller er uendret. Kraken trengte 22 trykk, som før. Lange økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil, og F1 er testet med ekte tastetrykk, klikk og emulert berøring. Fokus, lagring, mobilnavigasjon, startkortet og redusert bevegelse er rettet. Det nye K2-avviket (feilkortet kan ikke trykkes i pause eller kart) og statistikken (ST2, ST4, ST7) må rettes før publisering. Y1, ekte berøring og spillopplevelsen er ikke testet.
