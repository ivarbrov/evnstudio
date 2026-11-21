# EVN Game QA: Min Bondegård (min-bondegard) 0.20.1
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 31c4b693e90c369214f476b4813b9b6c28955770
Testkvittering: evn1 commit=31c4b693e90c369214f476b4813b9b6c28955770 tester=d24fad47679f arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – kontrollen gjelder en versjon som kan bli foreslått publisert, med nye lagringsfelt (`arr`, `skinn`), nytt innhold, nye områder og adminpanel.
Testet: Lokalt på 127.0.0.1 i Chrome headless (`/usr/bin/google-chrome`, WebGL via SwiftShader, ca. 1,3 bilder per sekund), styrt over DevTools-protokollen.
- **Arbeidstre:** Grenen `spill/min-bondegard-bursdag` sto på 31c4b69 og var ren før og etter kontrollen.
- **Metode:** Tastetrykk, museklikk og berøring var syntetiske hendelser fra nettleseren. Testtilstand ble satt opp med `window.__spill` i egne, midlertidige profiler.
- **Størrelser:** 1280×800 (mus) og 375×812, 740×360, 320×568 og 568×320 (emulert berøring).
- **Forrige versjon:** Lagringer ble laget i et uttrekk av `origin/main` b48b6d1 (0.15.11) og lastet i 0.20.1.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført. `logikk.test.mjs` ga 129 ok og 0 feil. `sim.mjs 100 11` nådde nivå 10 etter 35,1 min (aktiv) og 38,0 min (barn) i 100 av 100 kjøringer, med 0 fastlåst.
- **Betingede krav:** Standardens oversikt mangler Min Bondegård. Jeg har lagt B3 til grunn, som i forrige rapport.

## Oppfylte krav
- **F1:**
  - Tab og Enter starter spillet. P åpner pausen, Esc lukker den, og Esc åpner den igjen. Avslutt spør først. «Nei, spill videre» blir i spillet, og «Ja, avslutt» går til forsiden.
  - **Bursdagsfesten med klikk:** Nivå 3 gir meldingen «Bursdagsfesten har startet!» og en byggeplass for Festbordet. Bygging koster 150. En hatt tar 2 hvete og 1 mais og 60 s. Sending gir 16 mynter og 2 XP per hatt.
  - **Premiene:** De kom ved 5, 15, 30 og 50 hatter: hatter på de tre hønene, bursdagskake i bakeriet, Bursdagsbilen når bilen er hjemme igjen, og pynten. Ingen premie ble gitt to ganger.
  - **Salg:** Festhatter står i lageret, men ikke i markedsbua.
  - **Jordet:** Klikk på området gir kjøpskortet. Kjøp trekker 1000, gjerdet kommer, og trærne forsvinner. En åker kan flyttes dit, men ikke ut på veien. Roboten finner vei over veien og tilbake.
  - **Østjordet:** Kortet sier «kan kjøpes på nivå 16» på nivå 10. Med nivået satt til 16 for hånd virker «krever Jordet», kjøpet og gjerdet imellom.
  - **Rebus:** Ruten inn treffer ingen bygg eller hindringer.
- **F2:** Festen, skinnet, Festbordet, pynten, Jordet og den flyttede åkeren er like etter omlasting. Nullstilling spør med fokus på «Nei, behold alt». «Nei» beholder alt, og «Ja» sletter `evn-min-bondegard-v1` og `-kopi`.
- **F3:**
  - **Lagring fra 0.15.11 på nivå 10:** Nivå, mynter, lager, områder og alle plasseringer er uendret. Festen starter, ingen kopi lages, og konsollen er tom.
  - **Ødelagt JSON og `v: 2`:** Ny gård, melding til spilleren, og originalen ligger i `-kopi`.
  - **Feil typer i `arr`, `skinn`, `omrader` og `bygg.festbord`:** Spillet starter uten feilkort.
  - **Juks i lagringen:** Skinn og pynt uten nok sendte hatter fjernes. `levert: 1e99` kuttes til 9999.
- **U1:** Startkortet har mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.20.1».
- **T1 (emulert):** Ingen synlig knapp under 44×44 px på startkortet, i spillet, i festkortet, i Jordet-kortet eller i byggemenyen, i alle fem størrelsene. Ingen sideveis rulling og ingen overlapp i toppfeltet.
- **T3:** Zoom er OK i den statiske suiten. Med `prefers-reduced-motion` telles sendingen mens bilen står, og Rebus flyttes rett.
- **Y2 (delvis):** Blur og skjult fane gir pause og lagring. Rebus bruker 27,4, 27,2 og 27,1 s inn ved 30, 60 og 144 bilder per sekund (simulert `dt`).
- **K1:** Røyktesten er OK. Ingen ufangede feil, 404 eller eksterne forespørsler i mine kjøringer, bortsett fra feilen jeg kastet selv og kjøringen uten WebGL.
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt», og Tab blir der.
- **K3:** Tittelen, startkortet og `MB_VERSJON` viser 0.20.1. `ENDRINGSLOGG.md` har raden «0.16.0–0.20.1», og README har 0.16.0–0.20.1.
- **S1:** Den statiske suiten er OK. CSP er uendret.
- **S2:** Ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK. Testmodus gir ingen E-coins, heller ikke på nivå 10.
- **S3:** Spillet har ingen fritekst.
- **ST1, ST3, ST5 og ST6:** evnstudio.no ble omdirigert til lokal server, og GoatCounter ble erstattet av en stubb.
  - Ingen hendelse før Start.
  - `start-min-bondegard` kommer én gang, også etter en ekstra `evn-start` og en pause.
  - `document.cookie` er tom, og ingen andre forespørsler ble forsøkt.
  - På 127.0.0.1 lastes ikke GoatCounter.
- **B3 (første del):** Uten WebGL (`--disable-3d-apis`) skjules Start, og kortet sier at 3D ikke virker.
- **Admin:**
  - Knappen er skjult med vanlig adresse, `?admin`, `?test` og `?maned=12`. Den vises med `?test&admin`.
  - Alle åtte funksjonene virker uten konsollfeil.
  - Admin i testmodus rører ikke `evn-min-bondegard-v1`. Vanlig modus etterpå har vanlige plantenivåer og ingen skinn.

## Kritiske feil som må rettes
Ingen funnet i det som er testet. Se likevel første punkt under «Andre avvik», som blir blokkerende fra 1. desember.

## Andre avvik fra felles standard
- **F1, verifisert feil: festhatter fyller låven utenfor november.**
  - **Slik gjenskaper du:** Åpne `?test&maned=12` med Festbordet bygd og 48 festhatter på nivå 3. Lag to hatter til og hent dem.
  - **Resultat:** Låven har 0 ledige plasser. Egg og hønsefor kan ikke hentes (`lave-full`). Hattene står ikke i markedsbua, varebilen har ingen «Send», og hattene kan ikke kastes.
  - **Følge:** Låven er sperret til neste november. Festbordet lager fortsatt hatter i desember, og en hatt gir mer XP (3) enn brød (2), så barn vil trolig lage dem.
  - **Må avgjøres før publisering:** Enten kan Festbordet ikke lage hatter utenfor festen, eller så kan hattene selges eller sendes.
- **T2, verifisert feil: festen kan ikke brukes med tastatur.**
  - **Slik gjenskaper du:** Start med lagring på nivå 10 og trykk pil høyre 30 ganger. Åkre, bygg, Festbordet, lager, marked og tavle nås, men aldri varebilen. T åpner tavla uten noe om festen.
  - **Følge:** Hatter kan lages, men ikke sendes, og bilens utseende kan ikke velges uten mus. `velgbare()` i `spill.js:1445` mangler varebilen.
  - **Samme hull fra før:** Rebus, gaveeska og pynt mangler også i lista.
- **ST2, kjent avvik i felles kode (uendret):** Spillet har EVN-PAUSE v2. `statistikk.js` bruker ikke `EVNAktivTid` og teller også pause.
- **ST4 og ST5, kjent avvik i felles kode (uendret, statisk):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.20.1`.
- **ST3, verifisert: admin og testmodus telles som vanlig spillstart.** `https://evnstudio.no/spill/min-bondegard/?test&admin` (omdirigert) viser adminknappen og sender `start-min-bondegard`. README sier at vanlige spillere ikke har admin, men adressen virker for alle som kjenner den. Det påvirker bare testlagringen og gir ingen E-coins. En voksen bør avgjøre om dette er greit.

## Anbefalte forbedringer
- **Mulig problem: felt over høye kort.** Når handlingskortet må rulles, viser skjermbildene et svart felt (hvitt på emulert mobil) i kortets bredde over kortet. Jeg ser det samme i 0.15.11 med et kunstig høyt kort, så det er trolig en bivirkning av testnettleseren. Festkortet er det første kortet som alltid må rulles (632 px innhold mot 496 px i 1280×800), så dette bør ses i en vanlig nettleser.
- **«Send» ligger under premielista.** Kortet viser 198–223 px av 632 i liggende mobil og 352 av 798 i 320×568. Barnet må rulle for å finne hovedhandlingen. Forslag: «Send» øverst.
- **Rebus stopper ca. 1,2 m fra plassen sin, også når den er ledig.** Han ender på (−7,0; 1,95) i stedet for (−8,0; 1,3), ca. 0,4 m fra varebilens side. `finnVei` regner ham som framme 0,8 m fra målet.
- **Jeg fant ingen lovlig byggeplass i veien for Rebus** på en gård på nivå 10, så «går rundt byggene» er bare kontrollert uten hindring.
- **Et bygg kan stenge åpningen til Jordet.** Forkvernen kan settes på (−6 til −5; 16,8). Da finner ikke roboten vei dit og blir stående. Reglene virker fortsatt.
- **Østjordet kan ikke nås i denne versjonen.** Nivåtaket er 10, men «Til salgs»-skiltet står ute, og byggemenyen viser «🔒 Nivå 16 · 4000». Lagring over nivå 10 kuttes til 10 og mister Østjordet.
- **Fjøset får ikke plass på Jordet** (8,2 × 11,4 m mot 7,2 m dybde). Ingen lovlig plass i noen retning.
- **Startknappen i 320×568 med lagring:** «▶ Til gården» går over to linjer og ender 8 px under skjermkanten. Denne delen av kortet er uendret siden 0.15.11.
- **`mb-admin` slettes ikke av nullstillingen** og følger ikke `evn-`-navngivingen. README-avsnittet «Lagring» nevner ikke `arr`, `skinn` eller `mb-admin`.
- **Admin i privat forhåndsvisning (`window.MB_ADMIN`)** bruker den vanlige lagringen og er ikke testmodus. Etter koden vil «nivå opp» der gi E-coins på det opphavet. Ikke kjørt.
- **Voksen må godkjenne tallene,** slik koden og README selv sier: hatter per trinn, Festbordet 150, 16 mynter og 2 XP per hatt, Jordet 1000 og Østjordet 4000.
- **Festen er tidsbegrenset.** Kortet sier «åpen hele november», og det som er sendt, blir med til neste år. En voksen bør vurdere dette opp mot regelen om mekanikker som presser barn til å spille.
- **Ingen automatisk test i nettleser** for festen, områdene eller admin.
- **Standardens oversikt mangler fortsatt Min Bondegård.**

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt. Testnettleseren ga ca. 1,3 bilder per sekund, så bildefrekvens kan ikke måles her.
- **Y2:** Ekte fanebytte er ikke kjørt. Bare blur, simulert skjult fane og simulert `dt`.
- **T1 og T3 (E):** Trykkflater og knip med to fingre på faktisk enhet.
- **T4:** Ikke testet. Ingen kontrastberegning. Trinnene i festkortet bruker ✅ og 🎁 med tekst, ikke bare farge.
- **U2 og U3 (V):** Tekstene er korte og på enkel norsk etter min vurdering. Om barn finner festen via varebilen og forstår trinnene, må Even teste.
- **S4:** Kun kodelest. Personvernsiden er uendret og beskriver lagring generelt. Ingen nye domener.
- **ST7:** Felles statistikk er i bruk. Versjonshendelsen mangler (se avvik).
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Jeg brukte omdirigert vert og en stubb. Milepælene er ikke testet. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **B3 (andre del, E):** Lavere grafikk på svake enheter.
- **B1, B2 og B4–B7:** Vurdert som ikke relevante. Spillet har ingen lyd, kart, kamp, app eller fritekst. Gåtene er ikke kontrollert som læringsinnhold.
- **Hele bilturen i ekte tid:** Ikke kjørt. Bilen ble kjørt hjem med simulert `oppdaterBil(dt)`.
- **Kode A uten automatisk test:** T1, T2, T4, F2, F3, K2 og Y2 har ingen test utover røyktesten og den statiske suiten.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag. Ikke kontrollert.
- **V (Even):** Bursdagsbilen, hattene på dyrene, Festbordet, pynten, størrelsen på Jordet, Rebus' nye vei og om festen er morsom.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 med lagring fra 0.15.11 er testet uten kritiske feil, og festen virker i november. Festhattene som sperrer låven utenfor november, og tastaturhullet (T2), må rettes før versjonen foreslås publisert. Ytelse, kontrast og ekte berøring er ikke testet.

Testserverne på 8821 og 8822 og mine testnettlesere er stoppet. Skript, skjermbilder og uttrekket av 0.15.11 ligger i `/tmp/qa-mb201/` (`skript/`, `bilder/`, `v01511/`). Seks profilmapper `/tmp/evn-test-*` lå der fra tidligere kjøringer og er ikke rørt. Jeg har ikke endret repoet. Ingenting i rapporten bygger på lagret minne.
