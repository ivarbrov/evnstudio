# EVN Game QA: Vikinglandsby 0.1.0
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1 + S2 fra 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit ac9622fc521ae67a1f1fedeca480bc4f1c3ec018
Testkvittering: evn1 commit=ac9622fc521ae67a1f1fedeca480bc4f1c3ec018 tester=b91281e73d9e arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: høy (med kontroll av alle gjeldende krav for spillet, men ikke publiseringsnivå) – nytt spill og endring i felles `statistikk.js`. Agentens tabell sier «full» for nye spill. Oppdraget avgrenser til vanlig kontroll av en prototype som ikke skal publiseres, så rapporten er ikke en publiseringskontroll. Kravene er likevel gått gjennom ett for ett.
Testet: lokal `python -m http.server` på 127.0.0.1:8765 (stoppet), Chrome headless (Playwright, swiftshader, `reducedMotion: 'reduce'`, omtrent 3,5 bilder/s). PC 1280×800 med ekte tastetrykk og mus. Berøring emulert (isMobile/hasTouch, DPR 2) i 375×812, 740×360, 320×568 og 568×320, med `tap` og CDP-berøring for styrespaken. Testtilstand satt med `window.__spill`. `#test` er brukt til arbeider- og ønskeløpet. `localStorage` er tømt før hver serie. Skript ligger i /tmp/qa (pc.mjs, pc2.mjs, mobil.mjs, ekstra.mjs) med skjermbilder.

Endringen i felles kode (`statistikk.js`: ny oppdager for `#startBtn`, samme mønster som Magiske egg) og i `test/index.html` (røyktest) er bare tillegg. Røyktest og statiske tester gikk OK for alle seks spillene.

## Oppfylte krav
- **F1** Start (Enter), gå (piltaster), hogg (E og hold E), pause (P/Esc/⏸), fortsett, kart (M), bygg langhus med tastatur (B, 1, E) og gi jobb (E) er kjørt på PC. Arbeideren samler tre (testmodus). Avslutt via pause går til forsiden. Med emulert berøring: start, handlingsknappen, styrespaken (dra) og bygging (trykk på bakken, så ✔ Bygg her) i alle fire mobilstørrelser. Alle ti ønskene oppfylles, med oppsett via API. Ingen heng.
- **F2** Ressurser, hus, vikinger og jobber overlever omlasting, også med full landsby (7 hus, 6 vikinger). Lagringen finnes etter Avslutt. «🗑️ Start helt på nytt» spør først. Esc og «Nei» beholder, «Ja» sletter.
- **F3** Sju ødelagte eller rare lagringer krasjer ikke: ugyldig JSON, streng, `null`, ukjent versjon, feil type på `vikinger`, verdier utenfor grensene og `__proto__`-nøkler. Ugyldig JSON og typefeil gir kopi i `evn-vikinglandsby-v1-kopi`. Det finnes ingen eldre versjon av spillet ennå, så delen om eldre lagring gjelder ikke.
- **U1** Startkortet har EVN-merke, mål, styring for berøring eller PC, ▶ Start, «← Tilbake til EVN Studio» og «Versjon 0.1.0».
- **U3 (Q-delen)** Teksten er på kort, enkel norsk. Spillet har ikke tap. Feilmeldingene er vennlige.
- **T2 (delvis)** Hele spillet kan spilles med tastatur på PC: Tab til Start, piltaster, E, B, 1–5, R, M, P, Esc og L. Fokus flyttes inn i og blir i jubelkortet og ønskelista, og pause og avslutt-spørsmål får fokus. Pausen: se kjent funn.
- **T1** Alle synlige knapper og lenker er minst 44×44 px i alle fem størrelser, i tilstandene start, spill, handlingsknapp, byggemodus, jubelkort og pause (emulert).
- **T3** `viewport` sperrer ikke zoom (statisk test). `prefers-reduced-motion` stopper puls, bump og overgangen på meldingen (kodelest og brukt i test).
- **K1** Ingen ufangede feil og ingen 404 under normal bruk (testsuiten og egne kjøringer).
- **K2** En kastet feil under spilling gir «Oi, noe gikk galt» med «🔄 Last på nytt», og fokus flyttes dit.
- **S1** CSP finnes, uten eval og uten nye domener (statisk test).
- **S2, S3** Ingen konto, chat, kjøp eller fritekst. E-coins brukes bare til robotens antrekk (kodelest).
- **S4** Personvernsiden dekker lokal lagring generelt og E-coins. Spillet lagrer ikke noe annet.
- **ST1** `statistikk.js` ligger i `<head>` med `data-spill="vikinglandsby"`. `evn-start` sendes én gang ved start (målt). Oppdageren for `#startBtn` er kodelest, fordi skriptet ikke teller lokalt.
- **B1** 🔊/🔇 i topplinja, i pausen og med tasten L. Valget huskes etter omlasting.
- **B2** Kartet åpnes med M og 🗺️, viser spilleren (gul pil) og hus, og spillet står stille mens det er åpent.
- **B3** Uten WebGL blir Start-knappen deaktivert, og det kommer en tydelig melding. Tapt WebGL-kontekst gir feilmeldingen. Mobil får lavere oppløsning og ingen skygger (kodelest).
- **Y2 (delvis)** Pause ved skjult fane og ved `blur` (syntetiske hendelser). Se mulig problem under om lav bildefrekvens.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **ST2, verifisert feil:** Spilletiden (EVN-PAUSE v2, «I dag/Totalt») teller mens ønskelista (og jubelkortet) er åpen, selv om spillet står stille. Gjenskapes slik: start, trykk 📜, beveg musa i 3 s. `__evnP.tid().iDag` økte med 3,7–5,1 s (målt tre ganger). Årsak: `aktiv: () => spillTilstand === 'spill'` tar ikke hensyn til `modalApen()`.
2. **U2, verifisert feil (berøring):** I byggemodus ligger hjelpeteksten («Trykk der huset skal stå, så ✔ Bygg her. ↻ snur huset.») delvis eller helt bak byggepanelet rett etter at du har valgt et hus. Sett i 375×812, 320×568, 740×360 (helt skjult) og 568×320. Ikke sett på PC. Gjenskapes slik: trykk 🔨 Bygg og velg Langhus (skjermbilder `*-bygg.png`). Årsak: `oppdaterByggHjelp()` beregner `bottom` før «✔ Bygg her» og «↻ Snu» blir synlige og panelet blir høyere. Teksten kan rette seg når plassen endrer gyldighet, men det er ikke kontrollert.
3. **T2, kjent funn (uendret):** Tab går ut av pausekortet (videre til `BODY`, 📜, 🔊, 🚪, 🔨). Gjelder felles EVN-PAUSE v2. Fokusfellen i spillets egne kort (jubel og ønsker) virker.

**Mulige problemer**
- **Y1/Y2:** `dt` begrenses til 0,05 s. Under 20 bilder/s går hele spillet i sakte film. Ved 3,5 bilder/s gikk roboten 1,4 enheter/s mot innstilt 13. Ved vanlige skjermfrekvenser er farten uavhengig av frekvensen. Må avgjøres med måling på en svak mobil.
- **U2:** På smal mobil blir dagens ønske kuttet i HUD: «🪵 Hogg 5 t…» i 375 og bare «📜 🪵 …» i 320. Hele lista er ett trykk unna.
- **B2:** I 568×320 går kartkortet utenfor skjermen nederst (339 px høyt i 320 px vindu), fordi forklaringsteksten brytes over fem linjer. Fjorden blir kuttet.
- **T3:** `gesturestart` stoppes så lenge `spillTilstand === 'spill'`, også når ønskelista eller jubelkortet er åpent. På iOS kan det sperre zoom i disse dialogene. Krever test på iPhone.
- **Lesbarhet, landskap:** I 740×360 og 568×320 dekker byggepanelet 50–56 % av høyden, og huset du plasserer, havner ved kanten av panelet. Velkomstmeldingen dekker delvis 📜-knappen i 568×320. UI8 gjelder ikke for spillet, så dette er en observasjon. Brukervennligheten må prøves på enhet.
- **Statistikk (felles, ikke innført av denne commiten):** `statistikk.js` på `main` lytter ikke på `evn-start`, sender ikke `versjon-…` eller `feil-…`, og teller spilletid for synlig fane, også i pause. Dermed kan ingen spill på `main` oppfylle ST2, ST4 og versjonshendelsen i ST5 fullt ut, og `test/statistikk/` finnes ikke. Bør avklares for seg, uavhengig av Vikinglandsby.

## Anbefalte forbedringer
- Rett ST2 med `aktiv: () => spillTilstand === 'spill' && !modalApen()`.
- Rett U2-feilen: beregn `bottom` for `#byggHjelp` etter at knappene i panelet er vist/skjult (eller kall den på nytt når `byggSnu` endres).
- F3: `lastInn` sjekker `HUS[b.t]` uten `Object.hasOwn`, så `__proto__` og `constructor` blir «hus» uten modell. Ufarlig i testen, men lett å tette. Halvveis innlesing (feil type på `vikinger`) gir en delvis landsby, og den overskriver originalen ved neste lagring. Kopien finnes. Lagring med ukjent versjon (`v` ≠ 1) overskrives uten kopi etter 5 s spilletid.
- Kartforklaringen: «🔺 Du» er rød, men pila er gul. «⚫ Stein» vises som grå prikker. Gjør symbolene like (T4/U2).
- Startkortet på PC nevner ikke pause (P/Esc). Den står bare i «Slik styrer du».
- `prefers-reduced-motion`: kameraet går fortsatt sakte rundt bak startkortet.
- I 568×320 er Start-knappen delvis under kanten, slik at kortet må rulles. KA7 krever bare 740×360 og 375×812, og der er den synlig.
- UI-standarden (rådgivende for nye spill): KS1–KS11, KS13 og KS14 virker eller er kodelest. KS12 brytes i den felles pausen (kjent). KA4: låste hus er grå, men kan trykkes (de gir en melding). KS15: spillet har egen feilboks, siden EVN-FEIL ikke finnes ennå.
- Legg Vikinglandsby inn i standardens tabell (forslag: B1, B2, B3, og ikke B4–B7) på en egen gren. Legg også inn en linje i `ENDRINGSLOGG.md` før publisering (K3).

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt. Swiftshader gir ikke meningsfull bildefrekvens.
- **T1, B1, B3 (E):** Ekte berøring, lyd på enhet og grafikknivå på svake enheter. Bare emulert.
- **ST3–ST8:** `test/statistikk/` finnes ikke (suiten er «ikke innført»), og `statistikk.js` teller ikke lokalt. ST3 og ST6 er bare kodelest (ingen informasjonskapsler eller ID-er i spillet). Om hendelsene kommer fram i GoatCounter, krever en voksen med innlogging.
- **T4:** Kontrasten er ikke målt (hvit tekst på mørke felt, kodelest).
- **T2:** Fokusfellen i kartet, i avslutt-spørsmålet og i nullstillingsboksen er ikke testet (felles kode).
- **Y2:** Ekte fanebytte i headless ga ikke `hidden`. Det er testet med syntetiske hendelser.
- **U2, U3, B2, flyten (V):** Om Even forstår ønskene og byggingen, tempoet (høvdinghallen koster 30/20/12 og krever 6 vikinger), og om spillet er morsomt.
- Lange økter, lydkvalitet og iPhone/Android er ikke testet.
- UI1–UI10/UI8a–c er ikke kontrollert, fordi de ikke er tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – ingen kritiske feil, og F1 og F2 er testet. Hjelpeteksten bak byggepanelet på mobil (avvik 2) bør helst rettes før Even prøver å bygge på nettbrett eller telefon, og Y1 og ekte berøring er ikke testet.
