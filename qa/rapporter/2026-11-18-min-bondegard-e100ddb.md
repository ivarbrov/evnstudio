# EVN Game QA: Min Bondegård (min-bondegard) 0.21.1
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit e100ddb46f3774f884ab213366d1fcf8c901ab5d
Testkvittering: evn1 commit=e100ddb46f3774f884ab213366d1fcf8c901ab5d tester=49301400e3a8 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen kan bli foreslått publisert, og den har nye lagringsfelt (`arr`, `skinn`, områder), nytt innhold og adminpanel.
Testet: Lokalt på 127.0.0.1 i Chrome headless (`/usr/bin/google-chrome`, WebGL via SwiftShader, svært lav bildefrekvens), styrt over DevTools-protokollen.
- **Metode:** Tastetrykk, museklikk og berøring var syntetiske hendelser fra nettleseren. Testtilstand ble satt opp med `window.__spill` i egne, midlertidige profiler.
- **Størrelser:** 1280×800 (mus) og 375×812, 740×360, 320×568 og 568×320 (emulert berøring).
- **Forrige versjon:** Lagringer på nivå 3 og 10 ble laget på nytt i et uttrekk av `origin/main` b48b6d1 (0.15.11) og lastet i 0.21.1. Uttrekket er sammenlignet byte for byte med `origin/main`.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført. `logikk.test.mjs` ga 131 ok og 0 feil. `sim.mjs 100 11` nådde nivå 10 etter 35,1 min (aktiv) og 38,0 min (barn) i 100 av 100 kjøringer, med 0 fastlåst.
- **Avbrudd:** Økten ble avbrutt én gang, og tre kjøringer døde underveis. De ble kjørt på nytt på samme commit. Alle resultater under er fra e100ddb.
- **Betingede krav:** Standardens oversikt mangler Min Bondegård. Jeg har lagt B3 til grunn, som i forrige rapport.
- **Standardversjon:** Oppdraget oppga ingen. Fila er 1.2 (utkast), og jeg har bare brukt krav med status gjeldende.

## Oppfylte krav
- **F1:**
  - Tab og Enter starter spillet. P åpner pausen, Esc lukker den, og Esc åpner den igjen. Avslutt spør først: «Nei, spill videre» blir i spillet, og «Ja, avslutt» går til forsiden.
  - **Bursdagsfesten med klikk:** Nivå 3 gir meldingen om festen og byggeplass for Festbordet. Bygging koster 150. En hatt tar 2 hvete og 1 mais og 60 s. Sending gir 16 mynter og 2 XP per hatt.
  - **Premiene:** De kom ved 5, 15, 30 og 50 hatter: hatter på hønene, bursdagskake i bakeriet, Bursdagsbilen når bilen er hjemme, og pynten. Festhatter står i lageret, men ikke i markedsbua.
  - **Bilknappen (ny):** Den er skjult før start og på nivå 1, og synlig i november fra nivå 3. Kortet viser bilene og resten av premiepakka. «Ta på» bytter mellom vanlig bil og Bursdagsbilen, og bilen på gården bytter.
  - **Jordet:** Kjøp trekker 1000, gjerdet kommer, og trærne forsvinner. En åker kan flyttes dit, men ikke ut på veien. Østjordet sier «kan kjøpes på nivå 16».
  - **Rebus:** Han bruker 27,1–27,4 s inn ved 30, 60 og 144 bilder per sekund (simulert `dt`), og gåtekortet åpnes.
- **Rettingene fra forrige QA (0.20.2):**
  - Festbordet er stengt i desember (`?test&maned=12`): «Lag» er av, og kortet sier at festen er over for i år.
  - Piltastene når varebilen. Enter på «Send 3» sendte hattene (30 til 33 sendt).
- **F2:** Fest, skinn, Festbordet, pynt, Jordet og flyttet åker er like etter omlasting. Nullstilling spør med fokus på «Nei, behold alt». «Nei» beholder alt, og «Ja» sletter lagringen og kopien.
- **F3:**
  - **Lagring fra 0.15.11 på nivå 10:** Nivå, mynter, lager, områder og alle plasseringer er uendret. Festen starter, ingen kopi lages, og konsollen er tom.
  - **Ødelagt JSON og `v: 2`:** Ny gård, melding til spilleren, og originalen ligger i `-kopi`.
  - **Feil typer i `arr`, `skinn`, `omrader` og `bygg.festbord`:** Spillet starter uten feilkort.
  - **Juks i lagringen:** Fest og skinn på nivå 2 fjernes, og `levert: 1e99` kuttes til 9999.
- **U1:** Startkortet har mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.21.1».
- **T1 (emulert):** Ingen synlig knapp under 44×44 px på startkortet, i spillet, i festkortet eller i Jordet-kortet i de fem størrelsene. Bilknappen er 48×48. Ingen sideveis rulling og ingen overlapp i toppfeltet.
- **T2:** Tab blir i pausekortet. Feilkortet holder fokus på «Last på nytt». Enter på bilknappen åpner kortet med fokus på «Ta på». Se likevel «Anbefalte forbedringer» om Tab ut av handlingskortet.
- **T3:** Zoom er OK i den statiske suiten. Med `prefers-reduced-motion` telles sendingen mens bilen står, og Rebus flyttes rett.
- **Y2 (delvis):** Blur og simulert skjult fane gir pause og lagring. Rebus er uavhengig av bildefrekvens (se F1).
- **K1:** Røyktesten er OK. Ingen ufangede feil, 404 eller eksterne forespørsler fra spillet i mine kjøringer, bortsett fra testfeilen jeg kastet selv og kjøringen uten WebGL.
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt».
- **S1:** Den statiske suiten er OK. CSP er uendret, uten nye domener.
- **S2:** Ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK. Testmodus på nivå 10 gir ingen E-coins.
- **S3:** Spillet har ingen fritekst (ingen `input`, `textarea` eller `prompt` i koden).
- **ST1, ST3, ST5 og ST6:** evnstudio.no ble omdirigert til lokal server, og GoatCounter ble erstattet av en stubb.
  - Ingen hendelse før Start. `start-min-bondegard` kommer én gang, også etter en ekstra `evn-start` og en pause.
  - `document.cookie` er tom, og ingen andre forespørsler ble forsøkt.
  - På 127.0.0.1 lastes ikke GoatCounter.
- **B3 (første del):** Uten WebGL (`--disable-3d-apis`) skjules Start, og kortet sier at 3D ikke virker.
- **Admin stengt på nett:**
  - På evnstudio.no (omdirigert) med `?test&admin` er adminknappen skjult. Lokalt er den skjult med vanlig adresse, `?admin`, `?test` og `?maned=12`.
  - En `mb-admin` lagt inn for hånd på evnstudio.no gir verken bil eller planter.
  - Lokalt med `?test&admin` virker myntregn, bilkaos, kjempedyr, «alt ferdig nå», 5 ganger mynter, Biler, Varer, Bygg, «lage uten råvarer», bursdagsting, planter, mynter og nivå uten konsollfeil.
  - «Slett» for bursdagstingene setter tilstanden tilbake til det spilleren hadde. Vanlig modus etterpå har vanlig lagring og vanlige plantenivåer.

## Kritiske feil som må rettes
Ingen funnet i det som er testet. Se likevel første punkt under «Andre avvik», som kan sperre låven fra 1. desember.

## Andre avvik fra felles standard
- **F1, verifisert feil (kjent fra forrige QA, delvis rettet): festhatter blir liggende i låven etter festen.**
  - **Slik gjenskaper du:** Åpne `?test&maned=12` med 40 festhatter i lageret og én ferdig hatt i køen på Festbordet. Åpne Festbordet.
  - **Resultat:** Låven har 41 hatter og 9 ledige plasser av 50. Hattene kan ikke selges, sendes eller kastes, og de står ikke i bestillinger.
  - **Følge:** Plassen er borte til neste november. Med 50 hatter ved månedsskiftet er låven full. Forrige QA viste at egg og hønsefor da ikke kan hentes.
  - **Status:** README sier selv «Ikke rettet». Må avgjøres før publisering, fordi det er 12 dager til desember.
- **K3, verifisert feil: `ENDRINGSLOGG.md` nevner ikke 0.21.1.** Raden heter «Min Bondegård 0.16.0–0.21.0» og mangler bilkaos-rettingen, «Kjempedyr» og «Alt ferdig nå». Tittel, startkort, `MB_VERSJON` og README viser 0.21.1.
- **ST5 og ST7, verifisert feil (kjent fra forrige QA, ikke rettet): versjonshendelsen sendes ikke.** Standarden krever `versjon-<spill>-<versjon>` sammen med start. Stubben fikk bare `start-min-bondegard`, og `statistikk.js` inneholder ikke ordet «versjon». Fila er felles og uendret fra `origin/main`, så dette gjelder trolig alle spill.

## Anbefalte forbedringer
- **Tab ut av handlingskortet setter spillet på pause.** Kortet er ikke en dialog og har ingen fokusfelle. I bilkortet med én aktiv knapp førte ett Tab-trykk til at pausen åpnet seg. Dette gjelder alle handlingskort og er ikke nytt.
- **Bilkortet i desember sier «Send 50 🥳»** for pynten, selv om ingenting kan sendes før neste november.
- **Admin «Varer» ser ikke på plassen i låven.** 30 trykk ga 150 egg og −111 ledige plasser. Bare admin.
- **Mulig problem, admin:** Etter «Slett» av bursdagstingene var pynten borte fra lagringen, men 3D-objektet var fortsatt merket synlig. Jeg har ikke sett på skjermbildet.
- **`mb-admin` slettes ikke av nullstillingen** og følger ikke `evn-`-navngivingen (kjent). README-avsnittet «Lagring» nevner ikke `arr`, `skinn`, `omrader` eller `mb-admin`.
- **`?test` virker på evnstudio.no** og sender `start-min-bondegard` som en vanlig start. Testtrafikk blir da talt som spillstart.
- **Uten WebGL kommer to ufangede feil i konsollen** (`Error creating WebGL context` og `VEI_Z is not defined`, `spill.js:322`). Barnet ser den vennlige 3D-meldingen.
- **Startknappen i 320×568 med lagring** ender 8 px under skjermkanten (kjent, uendret siden 0.15.11).
- **Østjordet kan ikke nås** med nivåtak 10, men står i byggemenyen som «🔒 Nivå 16 · 4000» (kjent).
- **Admin i privat forhåndsvisning (`window.MB_ADMIN`)** bruker den vanlige lagringen og er ikke testmodus (kjent, ikke kjørt). `MB_ADMIN` settes ikke noe sted i repoet.
- **Voksen må godkjenne tallene:** hatter per trinn, Festbordet 150, 16 mynter og 2 XP per hatt, Jordet 1000 og Østjordet 4000.
- **Festen er tidsbegrenset.** En voksen bør vurdere den opp mot regelen om mekanikker som presser barn til å spille.
- **Gåterettingen** («svaret trenger ikke være på lager») fant jeg ikke som egen endring i `git diff origin/main..HEAD`. Bare at gåtekortet åpnes, er kontrollert.
- **Ingen automatisk nettlesertest** for festen, bilknappen, områdene eller admin.
- **Standardens oversikt mangler fortsatt Min Bondegård.**

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt, og testnettleseren har for lav bildefrekvens til å måle.
- **Y2:** Ekte fanebytte er ikke kjørt. Bare blur, simulert skjult fane og simulert `dt`.
- **T1 og T3 (E):** Trykkflater og knip med to fingre på faktisk enhet. Knappene i bilkortet er ikke målt i mobilstørrelse, men de bruker samme knappestil som festkortet.
- **T4:** Ikke testet. Ingen kontrastberegning. Bilkortet bruker ✅ og 🔒 med tekst, ikke bare farge.
- **U2 og U3 (V):** Tekstene er korte og på enkel norsk etter min vurdering. Om barn finner bilknappen og forstår festen, må Even teste.
- **S4:** Kun kodelest. Personvernsiden er uendret og beskriver lokal lagring generelt.
- **ST2 og ST4:** Ikke testet. Milepæler for spilletid og feilhendelser ble ikke kjørt.
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **B3 (andre del, E):** Lavere grafikk på svake enheter.
- **B1, B2 og B4–B7:** Vurdert som ikke relevante: ingen lyd, kart, kamp, app eller fritekst. Gåtene er ikke kontrollert som læringsinnhold.
- **Robotens gange og hele bilturen i ekte tid:** Ikke kjørt. Bilen ble kjørt hjem med simulert `oppdaterBil(dt)`. Roboten flyttet seg bare 0,3 m på 9 s i testnettleseren, så gangen til Jordet er bare kontrollert som beregnet vei.
- **Pyntkortet:** Klikket mitt traff ikke pynten, så kortet er ikke kontrollert.
- **Bilkaos og kjempedyr:** Antall biler (8) og skalering (1 til 2,4 og tilbake) er lest fra tilstanden. At bilene ikke kjører gjennom hverandre, er ikke vurdert visuelt.
- **Admin i mobilstørrelse:** Kortet ruller, men Få og Slett er ikke trykket med berøring.
- **Kode A uten automatisk test:** T1, T2, T4, F2, F3, K2 og Y2 har ingen test utover røyktesten og den statiske suiten.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag. Ikke kontrollert.
- **V (Even):** Bilknappen, Bursdagsbilen, hattene på dyrene, pynten, Jordet, bilkaos, kjempedyr og om festen er morsom.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 med lagring fra 0.15.11 er testet uten kritiske feil, og rettingene fra forrige QA virker. Før versjonen foreslås publisert, må hattene som blir liggende i låven etter november, avgjøres, og endringsloggen må få med 0.21.1. Ytelse, kontrast og ekte berøring er ikke testet.

Testserveren på 8831 er stoppet, og serveren på 8832 døde ved omstarten. Jeg har ikke endret repoet. Skript, utdata og skjermbilder ligger i `/tmp/qa-mb211/` (`skript/`, `bilder/`, `*.ut`). Tre profilmapper `/tmp/qa-mb211-prof-*` ligger igjen etter kjøringene som døde. Testnettleseren prøvde selv å nå Google-tjenester, og proxyen avviste det. Ingenting i rapporten bygger på lagret minne.
