# EVN Game QA: Min Bondegård (min-bondegard) 0.39.4
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit f5d538b5c22449527238ab57518e0a43305536c2
Testkvittering: evn1 commit=f5d538b5c22449527238ab57518e0a43305536c2 tester=a2c245a8816b arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert. 0.39.4 endrer rekkefølgen byggene plasseres i, og hvordan meldinger vises etter pause. Alle skriptene fra forrige kontroll er kjørt på nytt mot den nye committen. Oppdraget oppgir ingen standardversjon, så jeg har brukt den samme som i forrige kontroll.
Testet: Lokalt på 127.0.0.1:8796 med `/home/claude/wt-vinter` som rot (f5d538b, rent). Nettleseren var Chrome headless (`/usr/bin/google-chrome`, SwiftShader), styrt over DevTools-protokollen.
- **Metode:** Klikk, tastetrykk og berøring var syntetiske. Testtilstanden ble satt opp med `window.__spill` og spillets globale funksjoner, i egne midlertidige profiler.
- **Størrelser:** 1280×800 med mus. 375×812, 740×360, 320×568 og 568×320 med emulert berøring.
- **Skript:** Skriptene ble kopiert til `/tmp/qa-mb394/skript/`, og bare port og stier ble endret. Jeg kjørte a1–a4, a5b, a6–a9, a8b, a11 og a11b, og a10 med `--disable-3d-apis`. Det nye skriptet a12 tester meldingskøen.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført (exit 0). `logikk.test.mjs` ga 204 ok og 0 feil. `sim-jul.mjs` kjørte uten feil (exit 0).
- **Forrige versjon:** Lagringen fra 0.15.11, nivå 10.
- **Betingede krav:** B1 og B3.

## Oppfylte krav
- **F1:**
  - **Start, pause og avslutt (a1, a2):** Tab når Start, og Enter starter spillet. P pauser, og Esc fortsetter. Avslutt spør først med fokus på «Nei, spill videre». «Nei» blir i spillet, og «Ja» går til forsiden. Resultatene er like som på 7b112a5.
  - **Vinter i Elvedal (a3):** Maskinene, gavene, julekalenderen, julenissen og snømannens gåte virker som før. I januar henter bilen restene for 79 mynter.
  - **Snømannen (a4):** 21.11 gir trinn 0 og nedtelling, og 1.12 gir gåte, luke og julebygg. Se merknaden om datoene under «Kontroller som ikke kunne utføres».
  - **Nivå og naboer (a5b):** Utdataene er like som på 7b112a5.
  - **0.39.4, julekalenderen er rettet (a11b, a11):** Avviket fra forrige rapport er rettet.
    - **a11b:** Bakeriet ble flyttet i januar til (-13; 2,75). I desember får kalenderen ny plass på (-10; 5,2), og `overlapper()` viser ikke lenger `julekalender×bakeri`. Det gjelder også etter en ny omlasting.
    - **a11:** Med popkornmaskinen lagret på kalenderens plass flyttes kalenderen til (-12,75; 4,95), og `julekalender×popkorn` er borte.
    - **Andre festbygg:** Juletreet, Gavemaskinen og Festbordet får ny plass som før, og uten konflikt står festbyggene der de sto (a11, test 4). I januar står ingen festbygg.
  - **0.39.4, meldingskøen (a8, a8b, a11, a12):** Meldingene vises nå én om gangen på den trege maskinen, mens 0.39.3 mistet meldinger her.
    - **a11:** A, B, C og D vises etter hverandre.
    - **a12 T1:** A var synlig før pausen, og fem meldinger kom under pausen. Ved fortsett vises A først og deretter D, E og F. B og C faller bort, som beskrevet.
    - **a12 T2:** Pauses det midt i køen, vises ingenting i pausen. Resten av køen (K1–K3) vises etter fortsett.
    - **a12 T3:** Meldinger som kommer mens køen spilles, kommer bak i køen (Q1, N1, N2).
    - **a12 T4:** Uten pause erstatter en ny melding den forrige, som før.
    - **a12 T6:** En skjult fane pauser spillet og legger køen tilbake.
    - Konsollen var tom i alle tilfellene.
- **F2:** Gården er lik etter omlasting. Januar betaler ikke ut to ganger. Nullstilling spør med fokus på «Nei, behold alt», «Nei» beholder alt, og «Ja» sletter (a2).
- **F3:** Lagringen fra 0.15.11 lastes uendret, nye felt legges til, og konsollen er tom. Ødelagt JSON og `v:99` gir ny gård, melding og kopi. Juks gir øvre grense og startverdi (a2, a8).
- **U1:** Startkortet viser «Versjon 0.39.4», og tittelen og `MB_VERSJON` stemmer. Start og Tilbake synes i 320×568, 568×320 og 740×360 (a9).
- **T1 (emulert):** Synlige knapper er minst 44×44 px, og lukene er cirka 66×51 px (a3, a6).
- **T2:** Tab blir i pausekortet og i avslutt-dialogen. Feilkortet har fokus på «Last på nytt».
- **T3:** Den statiske suiten er OK for zoom.
- **K1:** Ingen ufangede feil og ingen 404 ved vanlig bruk. Ingen forespørsler gikk ut av localhost (a7).
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt» (a1).
- **K3:** Tittel, startkort, `MB_VERSJON`, README og `ENDRINGSLOGG.md` har med 0.39.4.
- **S1:** Den statiske suiten er OK. CSP er ikke endret siden 7b112a5.
- **S2:**
  - Spillet har ingen konto, chat, reklame eller ekte penger, og E-coins-suiten er OK.
  - Admin er skjult på evnstudio.no. Det er testet med omdirigering (a7).
  - Bildet lages som `data:`-URL.
- **S3:** Spillet har ingen fritekst.
- **B1:** Musikken kan slås av, og valget huskes etter omlasting. Lydkonteksten er `suspended` (a1).
- **ST1, ST3 og ST6 (a7, a7b):** Testet med omdirigert evnstudio.no og en stubb for GoatCounter.
  - Før start kommer ingen hendelse.
  - `start-min-bondegard` kom én gang, også etter en ekstra `evn-start` og en pause.
  - `document.cookie` er tom.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST2, verifisert feil (kjent, felles kode):** `spilletid-min-bondegard-01min` sendes etter 68 s med pausekortet oppe (a7b).
- **ST4, verifisert feil (kjent, felles kode):** En kastet feil under spilling gir ingen `feil-min-bondegard-spill` (a7b).
- **ST5 og ST7, verifisert feil (kjent, ikke rettet):** `versjon-min-bondegard-0.39.4` sendes aldri (a7).

## Anbefalte forbedringer
- **Meldingskøen har ingen øvre grense etter at den er startet (mulig problem, ny kode i 0.39.4):**
  - **Gjenskaping (a12 T5):** Pause og fortsett med én melding i pausen. Send så 10 meldinger mens køen spilles. Køen får lengde 10.
  - **Konsekvens:**
    - Hver melding står i cirka 3,7 s, så tilbakemeldinger på det barnet gjør, kan komme over 30 s for sent.
    - Så lenge nye meldinger kommer før køen er tom, slutter ikke køen. Da blir også vanlige meldinger forsinket.
    - Uten kø erstatter en ny melding den gamle med en gang (T4).
  - **Ikke avklart:** Hvor ofte vanlig spilling lager meldinger rett etter en pause.
  - **Forslag:** Begrens også køen under avspilling, for eksempel til de tre siste, eller la nye meldinger erstatte resten av køen.
- **Lange meldinger blir kortere i køen:** Meldinger som skal stå i 5000–6300 ms, blir kuttet til 3500 ms. Det gjelder «… har startet!» og «Den gamle lagringen kunne ikke leses», og det skjer også med meldinger som kommer mens køen spilles.
- **Rettet fra forrige rapport:**
  - Julekalenderen havner ikke lenger oppå et bygg som er flyttet dit i en annen måned.
  - Meldingskøen mister ikke lenger meldinger på den trege maskinen.
- **Uendret:**
  - En nabo kan be om honning før bikuben er bygd.
  - Tilbake-lenken og Nullstill overlapper som rektangler på startkortet.
  - «Send» og «Bestillinger» ligger under skjermkanten i handlingskortet på lave skjermer (a6). Jeg har ikke testet om kortet kan rulles.
  - `overlapper()` viser `varebil×hinder` i alle tilstander, også i kjøringen av 0.39.3. Jeg har ikke vurdert det.
- **Ikke kontrollert på nytt:**
  - `mb-admin` slettes ikke av nullstillingen.
  - `?test` på evnstudio.no teller som en vanlig start.
  - Tab kan gå ut av handlingskortet.
- **Ingen automatisk test** i `test/` for plassering av festbygg eller for meldingskøen. Skriptene a11b og a12 ligger bare i `/tmp/qa-mb394/skript/`.
- **Standardens oversikt** mangler fortsatt Min Bondegård.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen kan ikke måles med SwiftShader.
- **Y2:** Bare delvis testet. En etterlignet skjult fane pauser spillet (a8, a12). At hastigheten er uavhengig av skjermfrekvensen, er ikke testet.
- **T1 og T3 (E):** Ekte berøring og knip krever en faktisk enhet.
- **T4:** Ikke testet. Det er ikke gjort noen kontrastberegning.
- **U2 og U3 (V):** Om barn forstår vinterinnholdet, festbyggene og meldingene etter pause, må Even teste.
- **B1 (E):** At lyden faktisk høres.
- **B3:**
  - Med `--disable-3d-apis` er Start skjult, og startkortet sier at 3D ikke virker.
  - De to ufangede feilene `Error creating WebGL context` og `VEI_Z is not defined` kommer fortsatt. Det er kjent og uendret.
  - Lavere grafikk på svake enheter (E) er ikke testet.
- **S4:** Kun kodelest.
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging sjekke.
- **Snømannen 20.11 og 30.11:** a4 flytter datoen ut fra dagens dato, så denne kjøringen traff 21.11, 22.11, 26.11, 1.12 og 2.12. Tilfellet «ingen snømann 20.11» og trinn 5 30.11 er ikke kjørt på denne committen. Snømannskoden er ikke endret siden 7b112a5.
- **Ekte månedsskifte:** Ikke testet. Måneden er etterlignet med `?maned`.
- **Visuelt:** Julesleden, pepperkakehuset, trinn 40/100/250 og epletreet er bare dekket av logikktestene.
- **Kode A uten automatisk test:** F2, F3, T1, T2, T4, K2, Y2, B1 og B3.
- **B2 og B4–B7:** Ikke relevante, fordi spillet ikke har kart, kamp, læringsfakta, app eller fritekst.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 er testet på f5d538b uten kritiske feil, og begge funnene fra 7b112a5 er rettet. Forbeholdene er tre:
- Meldingskøen kan vokse uten grense etter en pause (mulig problem).
- ST2, ST4 og ST5 er kjente avvik i felles statistikk.
- Y1, T4, ekte berøring og B3 på svake enheter er ikke testet.

Testserveren på 8796 er stoppet, og ingen Chrome-prosesser fra denne kontrollen kjører. To eldre Playwright-profiler fra 8. og 15. november ligger i `/tmp`, men de er ikke fra denne kontrollen. Jeg har ikke endret repoet, og arbeidstreet er rent på f5d538b. Utdata ligger i `/tmp/qa-mb394/` (`*.ut`, `kjor.log`, `kjede.log`, `simjul.log`) og skjermbilder i `/tmp/qa-mb394/bilder/`. Ingenting i rapporten bygger på lagret minne.
