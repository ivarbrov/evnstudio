# EVN Game QA: Dyrepatruljen 0.11.5
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent. Gjeldende krav er 1.1, S2 etter 1.2a og oversikten per spill etter 1.2b) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 84d959cd56d7480819b126b6dc6ae2885c138281
Testkvittering: evn1 commit=84d959cd56d7480819b126b6dc6ae2885c138281 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – endringen er i felles kode (`statistikk.js`), og PR #53 skal til `main`. Oppdraget sa ingen standardversjon, så jeg har ikke kunnet sammenligne den.
Testet: Alle resultater er fra en ny kjøring mot 84d959c; ingen resultater fra tidligere commits er brukt. Testsuiten `node test/kjor.mjs --base origin/main` med /usr/bin/google-chrome ga 73 ok, 0 feil, 0 varsel og 2 ikke innført (statistikk og ui); ingen kontroller ga FEIL eller VARSEL. De tre første kjøringene stoppet ved grensen på 15 minutter fordi maskinen var svært belastet (load 15–18 på 2 kjerner, fire kontroller samtidig); den fjerde ble ferdig, og kvitteringen er fra den. Playwright for Python med Chromium og SwiftShader; testserver `python -m http.server` på 127.0.0.1:8943. 0.11.4 er hentet fra b801a24 med `git show` og servert på samme origin. Statistikk: evnstudio.no rutet til repoets filer og gc.zgo.at stubbet; ingen tellinger er sendt. PC 1280×800 med ekte tastetrykk og musklikk. Mobil bare emulert (`is_mobile`, `has_touch`, DPR 2) i 375×812, 812×375, 740×360, 320×568 og 568×320, med `touchscreen.tap`. Begrensninger: bildefrekvensen var bare 0–1 bilde i sekundet under målingene; navigering i samme fane hang, så hver lasting fikk en ny fane i samme kontekst; dyr flyttes foran helten, og `__dyrespill.fang` brukes til å fylle lagring. Skript og logger ligger i /tmp/qa-dp-84d/. Testserveren er stoppet, `localStorage` er tømt, og `git status` er tom.

## Oppfylte krav
- Endringen i `statistikk.js`: `evn-start` sendt to ganger uten klikk gir nøyaktig én `start-dyrepatruljen`. Klikk på Start etterpå gir ingen ny start. Klikk på Start og deretter `evn-start` gir også bare én start. Spillets egen oppdager (klikk på `#startBtn`) virker som før. Lokalt gir `evn-start` ingen feil og ingen forespørsler.
- F1: Tab gir fokus på Start, og Enter åpner verdensvalget; Gata starter. W flyttet helten 0,825 over 4 bilder. Ekte mellomrom fanget et dyr, og fangsten ble lagret. P, blur og ⏸ (tap) åpner pausen; helten flyttet seg 0 over 4 bilder med pausen åpen; Esc og Fortsett lukker den. «Vil du avslutte?» åpnes med fokus på «Nei»; Esc lukker dialogen, og «Ja, avslutt» går til `/`. Mobil: Start, verden, Håv-tap (1 fangst), ⏸ og Fortsett virker i alle fem størrelsene. Røyktesten er OK.
- F2: Lagringen er lik etter omlasting, og lydvalget huskes. «Start helt på nytt» starter med fokus på Nei, og Tab går rundt mellom de to knappene. Esc beholder lagringen. Ja sletter `evn-dyrespillet-v1` og beholder lyd og `evn-ecoins-v1`.
- F3 (del, se avvik): Lagring fra 0.11.4 leses uendret, og en ny fangst legges til. Ugyldig JSON, `null`, `[]`, `"tekst"`, `{"v":1}`, `{"v":2,…}` og `{"gata":5}` gir start og fangst uten feil.
- U1: Startkortet har mål, styring (6 linjer), Start, «← Tilbake til EVN Studio» og «Versjon 0.11.5».
- U2 og U3 (Q-delen): Styringshjelpen står på startkortet og i pausen. Tekstene er korte og på enkel norsk.
- T1 (A-delen, emulert): Ingen synlige trykkflater under 44×44 på startkortet eller under spilling i noen av de fem størrelsene. Ingen sideveis rulling.
- T2: Fokus holder seg i pausen (4 knapper i ring), i nullstillingsboksen og i «Vil du avslutte?». Tab-rekkefølgen i verdensvalget er Tilbake → Avslutt → Gata → Dyreparken.
- T3 (A-delen): Den statiske testen gir OK. Med `reduce` er Start-animasjonen `none`, og uten er den `puls`.
- K1: 0 sidefeil, 0 konsollfeil, 0 svar med status 400 eller høyere og 0 eksterne forespørsler i alle kjøringene, unntatt de bevisste feilene i F3- og K2-testene. Røyktesten gir OK.
- K3 (spillet): «Versjon 0.11.5» på startkortet stemmer med `VERSJON = 'v0.11.5'`. Spillkoden er uendret mot `main`. Se også mulig problem under.
- S1: Den statiske testen gir OK. CSP er uendret, uten `eval` og uten nye domener.
- S2: Ingen konto, chat, reklame eller kjøp med ekte penger. `document.cookie` er tom.
- S3: Spillet har ingen fritekst (0 `input`, `textarea` eller `prompt`).
- S4: Personvernsiden stemmer: fremgangen lagres bare lokalt.
- ST3: Lokalt gikk det 0 forespørsler til gc.zgo.at eller goatcounter. Koden returnerer for alle andre verter enn evnstudio.no.
- ST5 (det som er kjørt): Det kom ingen hendelse før Start. Etter Start → Tilbake → Start → Gata, pluss en ekstra `evn-start`, kom nøyaktig én `start-dyrepatruljen`. Det ble ingen doble hendelser.
- ST6: `document.cookie` er tom, og `statistikk.js` har ingen ID, fingeravtrykk eller lagring på enheten. Spillet lager ingen egen statistikk.
- B1 (A-delen): L gir 🔇, `aria-pressed="true"` og lagrer `av`. Valget huskes etter omlasting og fra 0.11.4.
- B2: M viser «🔴 Du er her · 🏙️ Gata», og tilstanden er `pause` mens kartet er åpent. Helten flyttet seg 0, men bare 1 bilde ble tegnet i den målingen. Pausestoppen ble målt over 4 bilder, og kartet bruker samme pause.
- B3 (oppstartsdelen): Uten WebGL er Start slått av og viser «3D virker ikke her». Det kommer en `role="alert"`-melding på enkel norsk, tilbakelenken vises, og det er 0 sidefeil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle avvikene under er kjente og uendret. Endringen i `statistikk.js` har ikke gjort noen av dem verre.
- F3, verifisert feil (kjent): Lagring med feil type krasjer spillet. `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget viser ingen åpen verden. `"reddet":"x"` og `{"gata":"katt1"}` feiler ved fangst («Cannot create property», «r.push is not a function»). Gjenskap: legg verdien i `evn-dyrespillet-v1`, last siden på nytt, og trykk Start og deretter Gata.
- K2, verifisert feil (kjent, alle spill): `setTimeout(() => { throw … })` under spilling gir ingen vennlig melding og ingen «Last inn på nytt».
- ST1, avvik (kjent): `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start`. Commiten gjør det nå mulig å rette dette, men Dyrepatruljen bruker det ikke ennå. Start → Tilbake telles fortsatt som start uten at barnet har spilt.
- ST2, verifisert feil (kjent fra kodelesing, nå sett ved kjøring): `spilletid-dyrepatruljen-01min` ble sendt mens pausen var åpen. `EVNAktivTid` brukes ikke, og tidtakingen i `statistikk.js` teller bare på om fanen er synlig. Gjenskap på evnstudio.no rutet lokalt: Start → Gata → P, og vent til ett minutt etter Start.
- ST4, avvik (kjent): Det sendes ingen `feil-dyrepatruljen-oppstart` eller `feil-dyrepatruljen-spill`.
- ST7, avvik (kjent): Statistikken er ikke godkjent etter 1.1, og `versjon-dyrepatruljen-0.11.5` sendes ikke.
- ST8, avvik (kjent): `test/statistikk/` finnes verken på grenen eller på `main` (`statistikk=ikke-innfort`).
- K3, mulig problem (gjelder PR-en, ikke spillets kode): ENDRINGSLOGG har ingen rad for denne endringen i `statistikk.js`. En eldre rad (Fiskespillet 0.6.1) sier at tillegget med `evn-start` ikke er publisert. Hvis PR #53 publiserer det, bør loggen få en rad før sammenslåing. Det må en voksen avgjøre.
- B3, mulig problem (kjent): `webglcontextlost` håndteres ikke. Ikke kontrollert på nytt.

## Anbefalte forbedringer
- Bruke den nye hendelsen: La Dyrepatruljen sende `evn-start` når en verden eller dyreparken faktisk starter, og flytt `statistikk.js` til `<head>`. Da rettes ST1, og Start → Tilbake blir ikke lenger telt som start.
- Lave vinduer (fra før): Start ligger under bretten i 812×375, 740×360, 320×568 og 568×320 (bunnen på y 460 eller 678). Knappen kan nås ved å rulle.
- Fra før, ikke målt på nytt: fokus etter «Vil du avslutte?» i verdensvalget, og at styrespaken og Snik overlapper i 320×568.
- Fra før: validering i `lastInn()` (F3), en global feilfanger (K2) og håndtering av `webglcontextlost`.

## Kontroller som ikke kunne utføres
- Y1 (E): Referansemobil er ikke valgt, og jeg har ingen ekte enhet. SwiftShader på en overbelastet maskin sier ingenting om bildefrekvens.
- Y2: Fanebytte er bare simulert med blur, og pausen åpnes. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (`dt = Math.min(0.05, …)`). Status: Ikke testet.
- T4: Delvis målt, så status er Ikke testet som helhet. Startkortet: versjon 5,5:1, styring 14:1, mål 14,6:1, Start 4,7:1 (stor fet tekst) og Tilbake 5,3:1. HUD-en og verdenskortene er ikke målt.
- T1, T3, B1 og B3 (E): Emulering er ikke ekte berøring. Knipe-zoom, hørbar lyd, tapt WebGL-kontekst og lavere grafikk på svake enheter er ikke testet.
- T2 (del): Dyreboka, kartet og ferdigkortet er ikke testet på nytt for fokusfelle i denne kjøringen.
- U2 og U3 (V): Om barnet forstår spillet og finner veien, må Even vurdere.
- ST2, ST4 og milepæler etter 5–60 minutter: `test/statistikk/` finnes ikke. Bare 01min ble observert. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- B4, B5, B6 og B7: Gjelder ikke, etter oversikten i standarden (1.2b).
- UI1–UI10 og UI8a–c: Status er godkjent hovedløsning, og kravene er ikke tatt i bruk for Dyrepatruljen, så de er ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert.
- Automatiske tester (A) som mangler: F2, F3, T2 fokus, T4, Y2, K2, B1, B2, B3, S2, S3 og ST2–ST8.
- Hele verdener med ekte håvsving i bakkete verdener: Ikke kjørt. Bare enkeltfangster i Gata er gjort.

## Klar for testing hos Even?
JA MED FORBEHOLD – Endringen i `statistikk.js` virker og gir ingen dobbel telling, og F1, F2, T2 og lagring fra 0.11.4 virker uten konsollfeil på PC og emulert mobil. Forbehold: det er ikke testet på ekte mobil (Y1, E), de kjente avvikene F3, K2, ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne, og ENDRINGSLOGG mangler en rad for endringen.
