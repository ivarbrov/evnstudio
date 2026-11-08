# EVN Game QA: Dyrepatruljen 0.11.6
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent. Gjeldende krav er 1.1, S2 etter 1.2a og oversikten per spill etter 1.2b) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c95b3aa1ef934bd26cd472493bd82da54a5921d2
Testkvittering: evn1 commit=c95b3aa1ef934bd26cd472493bd82da54a5921d2 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – PR #53 til `main` endrer felles kode (`statistikk.js`). Mot 84d959c er bare versjonsnummeret endret i spillet (to linjer: startkortet og `VERSJON`), sammen med ENDRINGSLOGG og QA-rapporter; kontrollert med `git diff 84d959c HEAD`. Oppdraget sa ingen standardversjon, så jeg har ikke kunnet sammenligne den.
Testet: Ny kjøring mot c95b3aa; ingen resultater fra 84d959c er brukt. Testsuiten `node test/kjor.mjs --base origin/main` med /usr/bin/google-chrome ga 73 ok, 0 feil, 0 varsel og 2 ikke innført (statistikk og ui); ingen kontroller ga FEIL eller VARSEL. Playwright for Python med Chromium og SwiftShader; testserver `python -m http.server` på 127.0.0.1:8943. 0.11.5 er hentet fra 84d959c med `git show` og servert på samme origin. Statistikk: evnstudio.no rutet til repoets filer og gc.zgo.at stubbet; ingen tellinger er sendt. PC 1280×800 med ekte tastetrykk og musklikk. Mobil bare emulert (`is_mobile`, `has_touch`, DPR 2) i 375×812, 812×375, 740×360, 320×568 og 568×320, med `touchscreen.tap`. Hver lasting skjer i en ny fane i samme kontekst; dyr flyttes foran helten, og `__dyrespill.fang` brukes til å fylle lagring. Skript og logger ligger i /tmp/qa-dp-c95/. Testserveren er stoppet, `localStorage` er tømt, og `git status` er tom.

## Oppfylte krav
- Endringen i `statistikk.js`: `evn-start` sendt to ganger uten klikk gir nøyaktig én `start-dyrepatruljen`, og klikk på Start etterpå gir ingen ny start. Klikk på Start og deretter `evn-start` gir også bare én start. Spillets oppdager (klikk på `#startBtn`) virker som før. Lokalt gir `evn-start` ingen feil og ingen forespørsler.
- F1: Tab gir fokus på Start, og Enter åpner verdensvalget; Esc går tilbake med fokus på Start; Gata starter. W flyttet helten 0,366 og 0,55. Ekte mellomrom fanget 1 av 3 dyr som var flyttet foran helten (se «Kontroller som ikke kunne utføres»). P, blur og ⏸-klikk åpner pausen; helten flyttet seg 0 over 5 bilder med pausen åpen; Esc og Fortsett lukker den. «Vil du avslutte?» åpnes med fokus på «Nei»; Esc lukker dialogen, og «Ja, avslutt» går til `/`. Mobil: Start, verden, Håv-tap (1 fangst), ⏸ og Fortsett virker i alle fem størrelsene. Røyktest: OK.
- F2: Lagringen er lik etter omlasting, og lydvalget huskes. «Start helt på nytt» starter med fokus på Nei, og Tab går rundt mellom de to knappene. Esc beholder lagringen. Ja sletter `evn-dyrespillet-v1` og beholder lyd og `evn-ecoins-v1`.
- F3 (del, se avvik): Lagring fra 0.11.5 leses uendret av 0.11.6, og en ny fangst legges til. Ugyldig JSON, `null`, `[]`, `"tekst"`, `{"v":1}`, `{"v":2,…}` og `{"gata":5}` gir start og fangst uten feil.
- U1: Startkortet har mål, styring (6 linjer), Start, «← Tilbake til EVN Studio» og «Versjon 0.11.6».
- U2 og U3 (Q-delen): Styringshjelpen står på startkortet og i pausen, og tekstene er korte og på enkel norsk.
- T1 (A-delen, emulert): Ingen synlige trykkflater under 44×44 på startkortet eller under spilling i noen av de fem størrelsene. Ingen sideveis rulling.
- T2: Fokus holder seg i pausen (4 knapper i ring), dyreboka, kartet, nullstillingsboksen og «Vil du avslutte?». Etter lukking er 0 elementer `inert`. Tab-rekkefølgen i verdensvalget er Tilbake → Avslutt → Gata → Dyreparken.
- T3 (A-delen): Den statiske testen gir OK. Med `reduce` er Start-animasjonen `none`, og uten er den `puls`.
- K1: 0 sidefeil, 0 konsollfeil, 0 svar med status 400 eller høyere og 0 eksterne forespørsler i alle kjøringene, unntatt de bevisste feilene i F3- og K2-testene. Røyktesten gir OK.
- K3: «Versjon 0.11.6» står på startkortet og `VERSJON = 'v0.11.6'` i koden. ENDRINGSLOGG har en ny rad for PR #53 som nevner 0.11.6, og innholdet stemmer med det som er målt. Funnet om manglende rad ved 84d959c er dermed rettet.
- S1: Den statiske testen gir OK. CSP er uendret, uten `eval` og uten nye domener.
- S2: Ingen konto, chat, reklame eller kjøp med ekte penger. `document.cookie` er tom.
- S3: Spillet har ingen fritekst (0 `input`, `textarea` eller `prompt`).
- S4: Personvernsiden stemmer: fremgangen lagres bare lokalt. Den sier også at spilletiden «kan også telle pauser», som stemmer med det som er målt.
- ST3: Lokalt gikk det 0 forespørsler til gc.zgo.at eller goatcounter. Koden returnerer for alle andre verter enn evnstudio.no.
- ST5 (det som er kjørt): Det kom ingen hendelse før Start. Etter Start → Tilbake → Start → Gata, pluss en ekstra `evn-start`, kom nøyaktig én `start-dyrepatruljen`. Det ble ingen doble hendelser.
- ST6: `document.cookie` er tom, og `statistikk.js` har ingen ID, fingeravtrykk eller lagring på enheten. Spillet lager ingen egen statistikk.
- B1 (A-delen): L gir 🔇, `aria-pressed="true"` og lagrer `av`. Valget huskes etter omlasting og fra 0.11.5.
- B2: M viser «🔴 Du er her · 🏙️ Gata». Helten flyttet seg 0 over 3 bilder med kartet åpent, og fokus holder seg i kartet.
- B3 (oppstartsdelen): Uten WebGL er Start slått av og viser «3D virker ikke her». Det kommer en `role="alert"`-melding på enkel norsk, tilbakelenken vises, og det er 0 sidefeil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle avvikene under er kjente og uendret. Ingen er nye, og ingen er blitt verre.
- F3, verifisert feil (kjent): Lagring med feil type krasjer spillet. `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget viser ingen åpen verden. `"reddet":"x"` gir «Cannot create property 'gata' on string 'x'» ved fangst. `{"gata":"katt1"}` gir «r.push is not a function» ved fangst. Gjenskap: legg verdien i `evn-dyrespillet-v1`, last siden på nytt, og trykk Start og deretter Gata.
- K2, verifisert feil (kjent, alle spill): `setTimeout(() => { throw … })` under spilling gir ingen vennlig melding og ingen «Last inn på nytt».
- ST1, avvik (kjent): `statistikk.js` lastes nederst i `<body>` (linje 6846) med `defer`, og spillet sender ikke `evn-start`. Start → Tilbake telles fortsatt som start.
- ST2, verifisert feil (kjent): `spilletid-dyrepatruljen-01min` ble sendt mens pausen var åpen (50 s etter at pausen ble åpnet). `EVNAktivTid` brukes ikke. ENDRINGSLOGG og personvernsiden omtaler dette, men det er fortsatt brudd på ST2.
- ST4, avvik (kjent): Det sendes ingen `feil-dyrepatruljen-oppstart` eller `feil-dyrepatruljen-spill`.
- ST7, avvik (kjent): Statistikken er ikke godkjent etter 1.1, og `versjon-dyrepatruljen-0.11.6` sendes ikke.
- ST8, avvik (kjent): `test/statistikk/` finnes verken på grenen eller på `main` (`statistikk=ikke-innfort`).
- B3, mulig problem (kjent): `webglcontextlost` håndteres ikke. Ikke kontrollert på nytt.

## Anbefalte forbedringer
- Bruke den nye hendelsen: La Dyrepatruljen sende `evn-start` når en verden eller dyreparken faktisk starter, og flytt `statistikk.js` til `<head>`. Da rettes ST1.
- Lave vinduer (fra før): Start ligger under bretten i 812×375, 740×360, 320×568 og 568×320 (bunnen på y 460 eller 678). Knappen kan nås ved å rulle.
- Fra før, ikke målt på nytt: fokus etter «Vil du avslutte?» i verdensvalget, og at styrespaken og Snik overlapper i 320×568.
- Fra før: validering i `lastInn()` (F3), en global feilfanger (K2) og håndtering av `webglcontextlost`.

## Kontroller som ikke kunne utføres
- Y1 (E): Referansemobil er ikke valgt, og jeg har ingen ekte enhet. SwiftShader sier ingenting om bildefrekvens.
- Y2: Fanebytte er bare simulert med blur, og pausen åpnes. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (`dt = Math.min(0.05, …)`). Status: Ikke testet.
- T4: Delvis målt, så status er Ikke testet som helhet. Startkortet: versjon 5,5:1, styring 14:1, mål 14,6:1, Start 4,7:1 (stor fet tekst) og Tilbake 5,3:1. HUD-en og verdenskortene er ikke målt.
- T1, T3, B1 og B3 (E): Emulering er ikke ekte berøring. Knipe-zoom, hørbar lyd, tapt WebGL-kontekst og lavere grafikk på svake enheter er ikke testet.
- U2 og U3 (V): Om barnet forstår spillet og finner veien, må Even vurdere.
- ST2, ST4 og milepæler etter 5–60 minutter: `test/statistikk/` finnes ikke, og bare 01min ble observert. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- B4, B5, B6 og B7: Gjelder ikke, etter oversikten i standarden (1.2b).
- UI1–UI10 og UI8a–c: Status er godkjent hovedløsning, og kravene er ikke tatt i bruk for Dyrepatruljen, så de er ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert.
- Automatiske tester (A) som mangler: F2, F3, T2 fokus, T4, Y2, K2, B1, B2, B3, S2, S3 og ST2–ST8.
- Fangst med ekte mellomrom: Bare 1 av 3 forsøk ga fangst. Dyrene ble flyttet foran helten med et skript, og de to andre forsøkene ble ikke undersøkt nærmere. Fangsten virket med Håv-tap i alle fem mobilstørrelsene. Hele verdener og bakkete verdener er ikke kjørt.

## Klar for testing hos Even?
JA MED FORBEHOLD – Endringen i `statistikk.js` gir ingen dobbel telling, og F1, F2, T2 og lagring fra 0.11.5 virker uten konsollfeil på PC og emulert mobil. ENDRINGSLOGG-raden som manglet ved 84d959c, er lagt til. Forbehold: det er ikke testet på ekte mobil (Y1, E), og de kjente avvikene F3, K2, ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne.
