# EVN Game QA: Min Bondegård (min-bondegard) 0.39.3
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 7b112a5352033626d095ad8cc7f8f11cc06cfeef
Testkvittering: evn1 commit=7b112a5352033626d095ad8cc7f8f11cc06cfeef tester=a2c245a8816b arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. Endringen i 0.39.3 gjelder hvor festbyggene plasseres og hvordan meldinger vises etter pause. Lagringen fra 0.15.11 er testet på nytt. Oppdraget oppgir ingen standardversjon, så jeg har brukt den samme som i forrige kontroll.
Testet: Lokalt på 127.0.0.1:8794 med `/home/claude/wt-vinter` som rot (7b112a5, rent). Nettleseren var Chrome headless (`/usr/bin/google-chrome`, SwiftShader), styrt over DevTools-protokollen.
- **Metode:** Klikk, tastetrykk og berøring var syntetiske. Testtilstanden ble satt opp med `window.__spill` og spillets globale funksjoner, i egne midlertidige profiler.
- **Størrelser:** 1280×800 med mus. 375×812, 740×360, 320×568 og 568×320 med emulert berøring.
- **Skript:** Skriptene fra `/tmp/qa-mb393/skript/` er kopiert til `/tmp/qa-mb393c/skript/` og kjørt på nytt mot port 8794. Det gjelder a1–a4, a5b, a6–a10, a8b, a11 og a11b. Alle resultatene under er fra denne kjøringen. a10 ble i tillegg kjørt med `--disable-3d-apis`, fordi kjeden ellers ikke slår av WebGL.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført (exit 0). `logikk.test.mjs` ga 204 ok og 0 feil. `sim-jul.mjs` kjørte uten feil.
- **Forrige versjon:** Lagringen fra 0.15.11, nivå 10 (`/tmp/qa-mb213/gml-n10.json`).
- **Betingede krav:** B1 og B3.

## Oppfylte krav
- **F1:**
  - **Start, pause og avslutt (a1, a2):** Tab når Start, og Enter starter spillet. P pauser, og Esc fortsetter. Avslutt spør først med fokus på «Nei, spill videre». «Nei» blir i spillet, og «Ja» går til forsiden.
  - **Vinter i Elvedal (a3):** Begge maskinene kan bygges og produserer. 12 gaver gir premien nisseluer. Luke 1 gir 25 mynter, og lukene 22–24 er låst. Julenissen og snømannens gåte virker.
  - **Snømannen med flyttet dato (a4):** 20.11 gir ingen snømann. 21.11 gir trinn 0, 25.11 trinn 2 og 30.11 trinn 5, og nedtellingen virker. 1.12 gir gåte, luke 1 og nisseluer på dyrene.
  - **Nivå og naboer (a4, a5b):** Spillet stopper på nivå 22, og geitefjøset er ikke i menyen. Når varer mangler, svarer naboen «Du mangler …». Med alle varene gir salget +66 mynter.
  - **0.39.3, festbygg uten forbedringen fra 0.39.2 er rettet for maskinene (a8b, a8):** Popkornmaskinen ble flyttet til Gavemaskinens plass i januar. Etter omlasting i desember står Gavemaskinen på (-2,5; 3,2) uten overlapp, også etter en ny omlasting. I a8 får Gavemaskinen ny plass når bakeriet står der.
  - **0.39.3, festbygg mot lagrede plasser (a11):** Festbordet får ny plass når kjøkkenet er lagret på plassen, og ingenting overlapper. Det samme gjelder juletreet mot kornkverna og Gavemaskinen mot en åker. Uten konflikt blir festbyggene stående der de sto.
  - **Festbygg per måned (a8, a11):** I desember står bare julebyggene, i november bare Festbordet, og i januar ingen.
- **F2:** Gården er lik etter omlasting.
  - **Januar:** Den første lastingen henter rester for 79 mynter, og den neste gir ingen ny utbetaling.
  - **Nullstilling:** Den spør med fokus på «Nei, behold alt». «Nei» beholder alt, og «Ja» sletter lagringen.
- **F3:**
  - **Lagring fra 0.15.11:** Den lastes uendret i november og desember. Nye felt legges til, og konsollen er tom.
  - **Ødelagt JSON og `v:99`:** Begge gir ny gård, melding og kopi.
  - **Juks:** En lagring med juks krasjer ikke. `mynter: 1e99` blir 1 000 000 000, og `"tull"` gir startverdien 50.
- **U1:** Startkortet har mål, styring, Start, Tilbake og «Versjon 0.39.3». Tittelen og `MB_VERSJON` stemmer. Start og Tilbake synes uten rulling i 320×568, 568×320 og 740×360 (a9).
- **T1 (emulert):** Ingen synlige knapper er under 44×44 px i de fem størrelsene. Lukene er cirka 64×50 px.
- **T2:** Tab blir i pausekortet og i avslutt-dialogen. Feilkortet har fokus på «Last på nytt».
- **T3:** Den statiske suiten er OK for zoom.
- **K1:** Ingen ufangede feil og ingen 404 ved vanlig bruk. Ingen forespørsler gikk ut av localhost (a7).
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt».
- **K3:** Tittel, startkort, `MB_VERSJON`, README og `ENDRINGSLOGG.md` har med 0.39.3.
- **S1:** Den statiske suiten er OK. CSP er uendret fra main.
- **S2:**
  - Spillet har ingen konto, chat, reklame eller ekte penger, og E-coins-suiten er OK.
  - Admin er skjult på evnstudio.no. Det er testet med omdirigering.
  - Bildet lages som `data:`-URL og sendes ikke ut.
- **S3:** Spillet har ingen fritekst.
- **B1:** Musikken kan slås av, valget huskes etter omlasting, og lydkonteksten er satt på pause.
- **ST1, ST3 og ST6 (a7):** Testet med omdirigert evnstudio.no og en stubb for GoatCounter.
  - `start-min-bondegard` kom én gang, også etter en ekstra `evn-start` og en pause.
  - `document.cookie` er tom.
  - På localhost lastes ikke GoatCounter.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F1, verifisert feil (bare delvis rettet i 0.39.3):** Julekalenderen kan fortsatt bli stående oppå et annet bygg etter omlasting.
  - **Gjenskaping (a11b, `?test`, realistisk flytting):**
    1. I desember eier spilleren julekalenderen, og den står på (-10; 5).
    2. Last siden i januar (`?maned=1`). Flytt bakeriet til (-13; 2,75). Spillet svarer «Flyttet! ✋».
    3. Last siden i desember. Julekalenderen står på (-10; 5), og `overlapper()` gir `julekalender×bakeri`. Overlappet er der også etter en ny omlasting, og det synes i `/tmp/qa-mb393c/bilder/a11b-kalender.png`.
    4. a11 viser det samme når popkornmaskinen er lagret på kalenderens plass.
  - **Årsak:**
    - `festPlassOpptatt()` oppdager konflikten, og kalenderen får `sb.x = null`.
    - Den nye plassen hentes så med `finnLedigPlass(t, ...STANDARD[b])` (spill.js linje 763). Den bruker `erLedig()` (linje 722), som bare sjekker ting som allerede er plassert i `ting`.
    - Julekalenderen er først i `I_SPILLET.bygg`, så ingen andre bygg er plassert ennå. Derfor godtas standardplassen (-10; 5) igjen, og det er den samme plassen.
    - Maskinene, juletreet og Festbordet kommer sist i rekkefølgen og fikk riktig ny plass i testene.
  - **Konsekvens:** Fremgangen går ikke tapt. Jeg har ikke testet om spilleren kan flytte bort et av byggene.
  - **Metode:** Flyttingen ble gjort med spillets egen `sluttFlytt(true)` og ikke med en dra-gest. Kallet kastet til slutt en feil fordi `fotMesh` mangler utenfor flyttemodus, men lagringen var allerede gjort. Feilen er en følge av testmetoden.
- **ST2, verifisert feil (kjent, felles kode):** `spilletid-min-bondegard-01min` sendes etter 68 s med pausekortet oppe (a7b).
- **ST4, verifisert feil (kjent, felles kode):** En kastet feil under spilling gir ingen `feil-min-bondegard-spill` (a7b).
- **ST5 og ST7, verifisert feil (kjent, ikke rettet):** `versjon-min-bondegard-0.39.3` sendes aldri (a7).

## Anbefalte forbedringer
- **Meldinger etter pause, mulig problem (ny kode i 0.39.3):** Køen virket i a8 og a8b. På den trege testmaskinen gikk likevel meldinger tapt.
  - **a11b (logget med MutationObserver):**
    - Meldingen «A» var synlig da spillet ble pauset, men ble aldri vist igjen.
    - «B» og «C» ble vist i samme millisekund, slik at «C» straks erstattet «B».
    - Bare «D» ble vist en stund.
  - **a11:** «A» ble heller ikke sett igjen.
  - **Trolig årsak:** Alle tidtakerne settes i `fortsett` ut fra samme starttid (300 ms, så 300 + 3700 ms og så videre). De venter ikke på hverandre. Når hovedtråden er opptatt, for eksempel av `synk(true)` og `normaliserTid` etter pausen, kommer flere tidtakere rett etter hverandre.
  - **Å avgjøre:** Om dette skjer på en referansemobil. Et alternativ er å starte neste melding først når den forrige er skjult.
- **Rettet fra forrige rapport:**
  - Gavemaskinen og de andre festbyggene som kommer sist i rekkefølgen, får ny plass etter omlasting.
  - Køen tar vare på mer enn den siste meldingen. Se likevel punktet over.
- **Uendret:**
  - En nabo kan be om honning før bikuben er bygd.
  - Lagerdialogen sto åpen etter syntetiske nivåhopp (a5b), og Esc lukker den. Det kan skyldes testmetoden.
  - Tilbake-lenken og Nullstill overlapper som rektangler på startkortet i alle størrelser.
  - Knappene «Send» og «Bestillinger» ligger under skjermkanten i handlingskortet, i 740×360, 320×568, 568×320 og delvis 1280×800 (a6). Det er samme måling som før, og jeg har ikke testet om kortet kan rulles.
- **Ikke kontrollert på nytt:**
  - `mb-admin` slettes ikke av nullstillingen.
  - `?test` på evnstudio.no teller som en vanlig start.
  - Tab kan gå ut av handlingskortet.
- **Ingen automatisk nettlesertest** for plassering av festbygg eller for meldingskøen.
- **Standardens oversikt** mangler fortsatt Min Bondegård.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen kan ikke måles med SwiftShader.
- **Y2:** Bare delvis testet. En etterlignet skjult fane pauser spillet og skjuler meldingen (a8). At hastigheten er uavhengig av skjermfrekvensen, er ikke testet.
- **T1 og T3 (E):** Ekte berøring og knip krever en faktisk enhet.
- **T4:** Ikke testet. Det er ikke gjort noen kontrastberegning.
- **U2 og U3 (V):** Om barn forstår vinterinnholdet og at festbyggene forsvinner etter festmåneden, må Even teste.
- **B1 (E):** At lyden faktisk høres.
- **B3:**
  - Med `--disable-3d-apis` vises «Gården trenger 3D-grafikk …», og Start er skjult.
  - Det kommer fortsatt to ufangede feil: `Error creating WebGL context` og `VEI_Z is not defined`. Det er kjent og uendret.
  - Lavere grafikk på svake enheter (E) er ikke testet.
- **S4:** Kun kodelest.
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging sjekke.
- **Ekte månedsskifte:** Ikke testet. Måneden er etterlignet med `?maned` og flyttet dato.
- **Visuelt:** Julesleden, pepperkakehuset, trinn 40/100/250 og epletreet er ikke kjørt i nettleseren. De er bare dekket av logikktestene.
- **Kode A uten automatisk test:** F2, F3, T1, T2, T4, K2, Y2, B1 og B3.
- **B2 og B4–B7:** Ikke relevante, fordi spillet ikke har kart, kamp, læringsfakta, app eller fritekst.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 er testet på 7b112a5 uten kritiske feil, og plasseringen av maskiner og Festbordet er rettet. Forbeholdene er fire:
- Julekalenderen kan fortsatt havne oppå et bygg som er flyttet dit i en annen måned (F1, ikke kritisk).
- Meldingskøen mistet meldinger på den trege testmaskinen.
- ST2, ST4 og ST5 er kjente avvik i felles statistikk.
- Y1, T4, ekte berøring og B3 på svake enheter er ikke testet.

Testserveren på 8794 er stoppet, og ingen Chrome-prosesser eller profilmapper er igjen. Jeg har ikke endret repoet, og arbeidstreet er rent på 7b112a5. Utdata ligger i `/tmp/qa-mb393c/` (`*.ut`, `kjor.log`, `kjede.log`) og skjermbilder i `/tmp/qa-mb393c/bilder/`. Ingenting i rapporten bygger på lagret minne.
