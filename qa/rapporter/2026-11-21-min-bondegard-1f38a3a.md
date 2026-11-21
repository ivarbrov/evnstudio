# EVN Game QA: Min Bondegård 0.39.1
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1f38a3ab861b2c2d249a2e9fd7eaee2f98b48d2b
Testkvittering: evn1 commit=1f38a3ab861b2c2d249a2e9fd7eaee2f98b48d2b tester=a2c245a8816b arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Den har nytt innhold, nye lagringsfelt (fiske, pynt, arr, skinn, kal), musikk og adminfunksjoner siden 0.15.11 på main.
Testet: Lokalt på 127.0.0.1:8791 med worktreet `/home/claude/wt-vinter` som rot. Chrome headless (`/usr/bin/google-chrome`, SwiftShader, svært lav bildefrekvens), styrt over DevTools-protokollen.
- **Metode:** Museklikk, tastetrykk og berøring var syntetiske. Testtilstanden ble satt opp med `window.__spill` i egne, midlertidige profiler. Datoene ble flyttet med en `Date`-overstyring i testprofilen.
- **Størrelser:** 1280×800 med mus. 375×812, 740×360, 320×568 og 568×320 med emulert berøring.
- **Ny commit underveis:** Kontrollen begynte på 021b12b. Da 1f38a3a kom, kjørte jeg `test/kjor.mjs`, `logikk.test.mjs`, `sim-jul.mjs` og alle nettleserskriptene (a1–a4, a5b, a6) på nytt på 1f38a3a. Statistikktestene (a7, a7b) gikk allerede mot 0.39.1. Alle resultater under gjelder 1f38a3a, bortsett fra der det står noe annet.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført (exit 0). Den gikk samtidig med mine nettleserskript. `logikk.test.mjs` ga 204 ok og 0 feil. `sim-jul.mjs` kjørte uten feil.
- **Forrige versjon:** Lagringen på nivå 10 fra 0.15.11 (fra `/tmp/qa-mb213/gml-n10.json`, laget fra main b48b6d1). Den er ikke laget på nytt.
- **Betingede krav:** Jeg har lagt B1 (spillet har nå musikk) og B3 til grunn.

## Oppfylte krav
- **F1:**
  - **Start, pause og avslutt:** Tab når Start, og Enter starter spillet. P åpner pausen, og Esc fortsetter. Avslutt spør først. «Nei, spill videre» blir i spillet, og «Ja, avslutt» går til forsiden.
  - **Vinter i Elvedal (`?test&amp;maned=12`, nivå 10):**
    - Gavepapirmaskinen (150) og Gavemaskinen (250) kan bygges.
    - 2 hvete gir 2 gavepapir. 1 gavepapir og 1 brød gir 1 julegave.
    - 12 gaver under juletreet gir 12 pepperkaker og premien «nisseluer».
    - Luke 1 i kalenderen gir 25 mynter. Med testdato 21. er lukene 22–24 låst.
    - Julenissen vises og svarer når den trykkes. Snømannen gir vintergåter.
  - **Snømannen i vanlig modus, med datoen flyttet:**
    - 20.11: ingen snømann.
    - 21.11: trinn 0, som er endringen i 0.39.1.
    - 25.11: trinn 2. 30.11: trinn 5.
    - 1.12: trinn 6 og gåter.
    - Nedtellingen vises ved trykk og telles ned mens kortet er åpent.
  - **1.12 i vanlig modus:** Bare luke 1 er åpen. Nisseluene er på høner, kyr og griser.
  - **Nivå 11–22:** Spillet går til nivå 22 og stopper der.
  - **Naboer (nivå 22, redusert bevegelse):** Med varer som mangler, svarer naboen «Du mangler …». Med alle varene får spilleren 66 mynter og «Takk, nabo!».
- **F2:**
  - **Omlasting:** Pepperkaker, kalender, bygg og lager er like etter omlasting.
  - **Ingen dobbel utbetaling:** En ny lasting i januar gir ingen ny utbetaling.
  - **Nullstilling:** Den spør med fokus på «Nei, behold alt». «Nei» beholder alt, og «Ja» sletter lagringen.
- **F3:**
  - **Lagring fra 0.15.11:** Nivå, mynter, lager, åkre, bygg, områder og dyr er uendret i november og i desember. Nye felt legges til, og ingen kopi lages. Konsollen er tom.
  - **Ødelagt JSON og `v:99`:** Begge gir ny gård, melding og kopi.
  - **Lagring med juks:** Feil typer, negative tall og `kal.apnet` med ugyldige verdier krasjer ikke.
- **0.39.0, opprydding etter festmåneden:** I januar ble 3 gavepapir og 2 julegaver i lageret hentet. Det samme ble én uferdig jobb i Gavepapirmaskinen og én ferdig jobb i Gavemaskinen. Til sammen var det 5 gavepapir og 3 julegaver, og spilleren fikk 79 mynter. Meldingen sier hva som ble hentet. XP og pepperkaker er uendret, og køene er tømt.
- **U1:** Startkortet har mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.39.1». Tittel og `MB_VERSJON` stemmer.
- **T1 (emulert):** Ingen synlige knapper under 44×44 px i de fem størrelsene, verken på startkortet eller i spillet. Kalenderlukene er cirka 62×48 px.
- **T2:** Tab blir i pausekortet og i avslutt-dialogen. Feilkortet holder fokus på «Last på nytt».
- **T3:** Zoom er OK i den statiske suiten. Med redusert bevegelse går naboen rett til plassen sin.
- **K1:** Ingen ufangede feil og ingen 404 i noen av kjøringene. Ingen forespørsler gikk til andre steder enn localhost.
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt».
- **K3:** Tittel, startkort, `MB_VERSJON`, README og `ENDRINGSLOGG.md` har med 0.39.1.
- **S1:** Den statiske suiten er OK. CSP er uendret fra main.
- **S2:**
  - Spillet har ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK.
  - Admin (med «premium») er skjult på evnstudio.no. Jeg testet det med omdirigering.
  - Bildeknappen lager bildet på enheten (`data:`-URL) og sender det ikke ut.
- **S3:** Spillet har ingen fritekst.
- **B1:**
  - Musikken kan slås av med 🎵-knappen («Ingen musikk»).
  - Valget lagres i `mb-musikk` og huskes etter omlasting (🔇).
  - Lydkonteksten er satt på pause når musikken er av og mens spillet er pauset.
- **ST1, ST3 og ST6:** evnstudio.no ble omdirigert lokalt, og GoatCounter ble byttet ut med en stubb.
  - `start-min-bondegard` kom én gang, også etter en ekstra `evn-start` og en pause.
  - `document.cookie` er tom.
  - På 127.0.0.1 lastes ikke GoatCounter.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST2, verifisert feil (ny verifisering, gjelder felles kode):** Spilletid teller mens spillet er pauset.
  - **Gjenskaping:** Åpne `https://evnstudio.no/spill/min-bondegard/` (omdirigert lokalt), trykk Start og så P. Vent 68 s med pausekortet oppe. Da sendes `spilletid-min-bondegard-01min`.
  - **Årsak:** `statistikk.js` teller bare på `visibilityState` og bruker ikke `EVNAktivTid`. Fila er uendret fra main, så dette gjelder trolig alle spill. Det er ikke innført i denne versjonen.
- **ST4, verifisert feil (felles kode):** En kastet feil under spilling gir ingen `feil-min-bondegard-spill`. Spillet stopper ikke.
- **ST5 og ST7, verifisert feil (kjent, ikke rettet):** `versjon-min-bondegard-0.39.1` sendes aldri.

## Anbefalte forbedringer
- **Maskinene i januar:** Gavepapirmaskinen og Gavemaskinen står synlige på gården i januar, mens juletreet og kalenderen er skjult. Om kortet viser låsemeldingen i januar, har jeg ikke sjekket.
- **Geitefjøset:** Det står i byggemenyen som «🔒 Nivå 26», men maksnivået er 22, så barnet kan ikke nå det.
- **Naboene:** En nabo kan be om honning før bikuben er bygd, så lenge spilleren har råd til den. Det er samme regel som for bestillinger.
- **Store tall i lagringen:** `mynter: 1e99` i en manipulert lagring godtas. Det krasjer ikke, men tallet kunne vært begrenset.
- **Tall som en voksen må bekrefte:** Koden kaller fortsatt flere ting «forslag», blant annet prisen på epletre og bikube, innholdet i kalenderlukene og nissens daglige gave. Endringsloggen sier «godkjent av Ivar 21.11». En voksen bør bekrefte at dette gjelder disse tallene.
- **Tidsbegrensede hendelser:** Vinter i Elvedal og kalenderen er tidsbegrenset. At luker kan åpnes senere, demper presset. En voksen bør vurdere dette mot regelen om press på barn.
- **Personvernsiden:** Den kan nevne at bildefunksjonen lager bildet bare på enheten.
- **Lageret åpnet seg:** Lagerdialogen sto åpen etter mine syntetiske nivåhopp. Årsaken er ikke undersøkt, og det kan skyldes testmetoden.
- **Kjente punkter som er uendret:**
  - I 320×568 ender Start 9 px under kanten.
  - I 740×360 og 568×320 ligger «← Tilbake» og «Nullstill» under kanten på startkortet.
  - `mb-admin` slettes ikke av nullstillingen.
  - `?test` på evnstudio.no teller som en vanlig start.
  - Tab ut av handlingskortet.
- **Ingen automatisk nettlesertest** for Vinter i Elvedal, snømannen, kalenderen, naboene eller oppryddingen.
- **Standardens oversikt mangler Min Bondegård.**

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen kan ikke måles med SwiftShader.
- **Y2:** Ikke testet i denne runden.
- **T1, T3 og UI-nære deler (E):** Ekte berøring og knip med to fingre krever faktisk enhet.
- **T4:** Ikke testet. Ingen kontrastberegning.
- **U2 og U3 (V):** Om barn forstår vinterhendelsen, snømannen, naboene og kalenderen, må Even teste.
- **B1 (E):** At lyden faktisk høres og høres riktig.
- **B3:** Melding uten WebGL og lavere grafikk på svake enheter er ikke testet på 1f38a3a. Fra før er det kjent at det da kommer to ufangede feil (`VEI_Z is not defined`).
- **S4:** Kun kodelest. Personvernsiden stemmer med lokal lagring og GoatCounter.
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging sjekke.
- **Epletreet:** Kjøp og høst (2 epler, ny tid 5:00) ble bare testet på 021b12b. Det er ikke bevis for 1f38a3a.
- **Visuelt:** Bilskinnet julesleden (250 pepperkaker), pepperkakehuset og trinn 40/100/250 er ikke kjørt i nettleseren. De er bare dekket av logikktestene.
- **Ekte månedsskifte:** Ikke testet. Måneden er bare etterlignet med `?maned` og flyttet dato.
- **Kode A uten automatisk test:** F2, F3, T1, T2, T4, K2, Y2, B1 og B3.
- **B2 og B4–B7:** Ikke relevante, fordi spillet ikke har kart, kamp, læringsfakta, app eller fritekst.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 er testet på 1f38a3a uten kritiske feil, med lagring fra 0.15.11 og med november, desember og januar. Endringen i 0.39.1 (snømannen fra 21.11) virker. Forbeholdene er tre:
- ST2, ST4 og ST5 er verifiserte avvik i den felles `statistikk.js`.
- Y1, T4, ekte berøring og B3 er ikke testet.
- Tallene som koden kaller «forslag», bør en voksen bekrefte.

Testserveren på 8791 er stoppet, og profilmappene er slettet. Jeg har ikke endret repoet, og arbeidstreet er rent på 1f38a3a. Skript, utdata og skjermbilder ligger i `/tmp/qa-mb39/`: `skript/`, `*-1f38.ut` for den nye committen og `bilder/`. Utskriften fra `test/kjor.mjs` for 1f38a3a ligger i `/tmp/qa-mb39/kjor-1f38a3a.log`. Ingenting i rapporten bygger på lagret minne.
