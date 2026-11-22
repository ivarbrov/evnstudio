# EVN Game QA: Min Bondegård (min-bondegard) 0.39.2
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 40ec33832033a73f3132818dc3f041fd080e804f
Testkvittering: evn1 commit=40ec33832033a73f3132818dc3f041fd080e804f tester=a2c245a8816b arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Endringen i 0.39.2 gjelder synlighet og plassering av festbygg, meldinger ved pause, startkortet og validering av lagringen. Lagringen fra 0.15.11 er testet på nytt.
Testet: Lokalt på 127.0.0.1:8792 med `/home/claude/wt-vinter` (40ec338, rent) som rot. Chrome headless (`/usr/bin/google-chrome`, SwiftShader) styrt over DevTools-protokollen.
- **Metode:** Klikk, tastetrykk og berøring var syntetiske. Testtilstanden ble satt opp med `window.__spill` og spillets globale funksjoner i egne, midlertidige profiler. En skjult fane ble etterlignet ved å overstyre `visibilityState`.
- **Størrelser:** 1280×800 med mus. 375×812, 740×360, 320×568 og 568×320 med emulert berøring.
- **Skript:** a1–a7b fra forrige kontroll er kjørt på nytt på 40ec338. a8, a8b, a9 og a10 er nye for 0.39.2.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført (exit 0). `logikk.test.mjs` ga 204 ok og 0 feil. `sim-jul.mjs` kjørte uten feil.
- **Forrige versjon:** Lagringen fra 0.15.11, nivå 10 (`/tmp/qa-mb213/gml-n10.json`, identisk med kopien i qa-mb39).
- **Betingede krav:** B1 og B3 er lagt til grunn.

## Oppfylte krav
- **F1:**
  - **Start, pause og avslutt:** Tab når Start, og Enter starter spillet. P åpner pausen, og Esc fortsetter. Avslutt spør først. «Nei, spill videre» blir i spillet, og «Ja, avslutt» går til forsiden.
  - **Vinter i Elvedal (`?maned=12`):** Begge maskinene kan bygges og produserer. 12 gaver gir premien nisseluer. Luke 1 gir 25 mynter, og lukene 22–24 er låst. Julenissen og snømannens gåter virker.
  - **Snømannen med flyttet dato:** 20.11 gir ingen snømann. 21.11 gir trinn 0, 25.11 trinn 2 og 30.11 trinn 5. Nedtellingen virker. 1.12 gir gåter, luke 1 og nisseluer på dyrene.
  - **Nivå og naboer:** Spillet stopper på nivå 22. Når varer mangler, svarer naboen «Du mangler …». Med alle varene får spilleren +66 mynter.
  - **0.39.2, festbygg i riktig måned (a8):**
    - **Desember:** Julebyggene vises, og Festbordet vises ikke.
    - **November:** Bare Festbordet vises, og bare det står i byggemenyen.
    - **Januar:** Ingen festbygg står på gården eller i byggemenyen.
    - **Treet eid (levert 100):** Bare juletreet står i januar.
  - **0.39.2, geitefjøset:** Det vises ikke i byggemenyen på nivå 10 eller nivå 22. Menyen har 30 rader mot 31 før.
  - **0.39.2, meldinger ved pause:** En synlig melding skjules når spillet pauses, også ved skjult fane. En melding som kommer under pausen, vises ikke. Etter Fortsett vises den, og den forsvinner av seg selv.
- **F2:**
  - **Omlasting:** Pepperkaker, kalender, bygg og lager er like etter omlasting.
  - **Januar:** Den første lastingen henter rester for 79 mynter. Den neste gir ingen ny utbetaling.
  - **Nullstilling:** Den spør med fokus på «Nei, behold alt». «Nei» beholder alt, og «Ja» sletter lagringen.
- **F3:**
  - **Lagring fra 0.15.11:** Uendret i november og desember. Nye felt legges til, og konsollen er tom.
  - **Ødelagt JSON og `v:99`:** Begge gir ny gård, melding og kopi.
  - **Lagring med juks:** Den krasjer ikke.
  - **0.39.2, mynter:** `mynter: 1e99` kuttes til 1 000 000 000. `"tull"` gir startverdien.
- **U1:** Startkortet har mål, styring, Start, Tilbake og «Versjon 0.39.2». Tittel og `MB_VERSJON` stemmer.
  - **320×568 (0.39.2):** Start (y 396–496) og Tilbake (y 500–564) synes uten rulling. Nullstill og versjonen kommer fram når startkortet rulles.
  - **740×360 og 568×320:** Start og Tilbake synes.
- **T1 (emulert):** Ingen synlige knapper under 44×44 px i de fem størrelsene. Kalenderlukene er cirka 62×48 px.
- **T2:** Tab blir i pausekortet og i avslutt-dialogen. Feilkortet holder fokus på «Last på nytt».
- **T3:** Zoom er OK i den statiske suiten. Med redusert bevegelse går naboen rett til plassen sin.
- **K1:** Ingen ufangede feil og ingen 404 ved vanlig bruk. Ingen forespørsler gikk ut av localhost.
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt».
- **K3:** Tittel, startkort, `MB_VERSJON`, README og `ENDRINGSLOGG.md` har med 0.39.2.
- **S1:** Den statiske suiten er OK. CSP er uendret fra main.
- **S2:**
  - Spillet har ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK.
  - Admin er skjult på evnstudio.no. Jeg testet det med omdirigering.
  - Bildet lages som `data:`-URL på enheten og sendes ikke ut.
- **S3:** Spillet har ingen fritekst.
- **B1:** Musikken kan slås av, og valget lagres i `mb-musikk` og huskes etter omlasting. Lydkonteksten er satt på pause når musikken er av.
- **ST1, ST3 og ST6:** evnstudio.no ble omdirigert lokalt, og GoatCounter ble byttet ut med en stubb.
  - `start-min-bondegard` kom én gang, også etter en ekstra `evn-start` og en pause.
  - `document.cookie` er tom.
  - På 127.0.0.1 lastes ikke GoatCounter.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F1, verifisert feil (ny i 0.39.2 for maskinene):** Et annet bygg kan bli stående oppå en skjult festmaskin. Den nye regelen («står noe der, får bygget ny plass») slår ikke inn etter omlasting.
  - **Gjenskaping (a8b, `?test`):**
    1. I desember eier spilleren Gavepapirmaskinen og Gavemaskinen. Gavemaskinen står på (-2,5; 5,95).
    2. Last siden i januar (`?maned=1`). `erLedig(popkorn, -2.5, 5.95)` gir `true`, og flytting av popkornmaskinen dit gir «Flyttet! ✋».
    3. Last siden i desember. `overlapper()` gir `popkorn×gavepapirmaskin` og `popkorn×gavemaskin`. Overlappet er der også etter en ny omlasting.
  - **Årsak:** Kontrollen i `plasserAlt()` (spill.js linje 757) krever at bygget allerede finnes i `ting` (`t &amp;&amp; !t.plassert`). Etter omlasting, eller når økta begynte i en annen måned, finnes ikke bygget der. Da plasseres det på den lagrede plassen uten kontroll.
  - **Konsekvens:** Det samme gjelder julekalenderen og juletreet, og Festbordet i november. Fremgang går ikke tapt, og jeg har ikke testet om bygget kan flyttes bort igjen.
  - **Metode:** Flyttingen ble utført med spillets egen `sluttFlytt(true)` og ikke med dra-gest. Kallet kastet til slutt en feil fordi `fotMesh` ikke var laget utenfor flyttemodus, men lagringen var allerede gjort. Dette er en følge av testmetoden.
- **ST2, verifisert feil (kjent fra forrige kontroll, felles kode):** `spilletid-min-bondegard-01min` sendes etter 68 s med pausekortet oppe.
- **ST4, verifisert feil (kjent, felles kode):** En kastet feil under spilling gir ingen `feil-min-bondegard-spill`.
- **ST5 og ST7, verifisert feil (kjent, ikke rettet):** `versjon-min-bondegard-0.39.2` sendes aldri.

## Anbefalte forbedringer
- **Meldinger under pause:** Bare den siste meldingen tas vare på. En melding som var synlig da spillet ble pauset, ble erstattet av en ny melding under pausen og ble aldri vist igjen (a8b: «A» gikk tapt, «B» ble vist).
- **Rettet fra forrige rapport:**
  - Maskinene står ikke lenger på gården i januar.
  - Geitefjøset er skjult.
  - Myntene er begrenset i lagringen.
  - Start synes på 320×568.
  - Tilbake synes i liggende format.
  - Koden kaller ikke lenger tallene «forslag», men «godkjent av Ivar 21.11». Selve godkjenningen kan jeg ikke bekrefte.
- **Uendret:**
  - En nabo kan be om honning før bikuben er bygd.
  - Lagerdialogen sto åpen etter syntetiske nivåhopp (a5b). Det kan skyldes testmetoden.
  - Tilbake-lenken og Nullstill overlapper som rektangler på startkortet i alle størrelser. Det er samme måling som før.
- **Ikke kontrollert på nytt:** Kjente punkter som ikke er kontrollert på nytt: `mb-admin` slettes ikke av nullstillingen, `?test` på evnstudio.no teller som en vanlig start, og Tab kan gå ut av handlingskortet.
- **Ingen automatisk nettlesertest** for festbygg per måned, plassering etter skjult periode eller meldinger ved pause.
- **Standardens oversikt** mangler fortsatt Min Bondegård.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen kan ikke måles med SwiftShader.
- **Y2:** Bare delvis. En skjult fane, etterlignet, pauser spillet og skjuler meldingen. At hastigheten er uavhengig av skjermfrekvensen, er ikke testet.
- **T1 og T3 (E):** Ekte berøring og knip krever faktisk enhet.
- **T4:** Ikke testet. Ingen kontrastberegning.
- **U2 og U3 (V):** Om barn forstår at festbyggene forsvinner etter festmåneden, og resten av vinterinnholdet, må Even teste.
- **B1 (E):** At lyden faktisk høres.
- **B3:**
  - Uten WebGL vises meldingen «Gården trenger 3D-grafikk …», og Start er skjult.
  - Det kommer fortsatt to ufangede feil (`Error creating WebGL context` og `VEI_Z is not defined`). Dette er kjent og uendret.
  - Lavere grafikk på svake enheter (E) er ikke testet.
- **S4:** Kun kodelest. Personvernsiden stemmer med lokal lagring og GoatCounter.
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging sjekke.
- **Ekte månedsskifte:** Ikke testet. Måneden er etterlignet med `?maned` og flyttet dato.
- **Visuelt:** Julesleden, pepperkakehuset og trinn 40/100/250 er ikke kjørt i nettleseren. De er bare dekket av logikktestene.
- **Epletreet:** Ikke kjørt i nettleseren på 40ec338.
- **Kode A uten automatisk test:** F2, F3, T1, T2, T4, K2, Y2, B1 og B3.
- **B2 og B4–B7:** Ikke relevante, fordi spillet ikke har kart, kamp, læringsfakta, app eller fritekst.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 er testet på 40ec338 uten kritiske feil, og endringene i 0.39.2 virker stort sett som beskrevet. Forbeholdene er tre:
- Et bygg kan bli stående oppå en festmaskin etter en måned der maskinen var skjult (F1, ikke kritisk).
- ST2, ST4 og ST5 er kjente avvik i felles `statistikk.js`.
- Y1, T4, ekte berøring og B3 på svake enheter er ikke testet.

Testserveren på 8792 er stoppet, og profilmappene er slettet. Jeg har ikke endret repoet, og arbeidstreet er rent på 40ec338. Skript og utdata ligger i `/tmp/qa-mb392/` (`skript/`, `*.ut`, `kjor.log`) og skjermbilder i `/tmp/qa-mb392/bilder/`. Ingenting i rapporten bygger på lagret minne.
