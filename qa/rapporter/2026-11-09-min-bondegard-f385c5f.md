# EVN Game QA: Min Bondegård 0.8.3
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit f385c5f0564c2374b86bf44c21cab78fe7dd6907
Testkvittering: evn1 commit=f385c5f0564c2374b86bf44c21cab78fe7dd6907 tester=7ea9bc1e4c9d arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full. Spillet er nytt og ikke publisert, og endringene treffer lagringsformatet (siloen flyttes fra gammel plass), tastatur og dialoger, feilhåndtering og robotens bevegelse. Dette er ikke en publiseringskontroll.
Testet: Lokalt i Chrome headless (`/usr/bin/google-chrome`, WebGL via SwiftShader, ca. 1,5 bilder/s), styrt over DevTools-protokollen. Tastetrykk, musklikk og berøring var syntetiske hendelser fra nettleseren, ikke DOM-`click()`. Testtilstand ble satt opp med `window.__spill` i egne testprofiler, og `localStorage` ble tømt før og etter testene. Skjermstørrelser: 1280×800, 375×812, 740×360, 320×568 og 568×320 (emulert mobil med berøring). Kjøretidstestene ble kjørt mot en uttrekket kopi av f385c5f (`git archive` til `/tmp/qa-mb-f385c5f`, port 8767). `test/kjor.mjs` ble kjørt i en ren klon (`/tmp/qa-mb-klon`, `--base` = origin/main 193ff88). Den første kjøringen i repoet regnes ikke med, fordi arbeidstreet ble endret til 0.8.4 mens den gikk. HEAD er nå de04f59 (0.8.4), og den er ikke kontrollert. I tillegg kjørte `logikk.test.mjs` (49 ok, 0 feil) og `sim.mjs` (nivå 4 etter 7,0–8,3 min, 0 fastlåst).

## Oppfylte krav
- **F1:** Spillet startet med Tab+Enter, med musklikk og med trykk i alle fem størrelsene. Jeg plantet, matet høner, åpnet byggemenyen, XP-oversikten, lageret og markedsbua. Pause virket med P, Esc og knappen, og Fortsett virket. Avslutt viser spørsmålet: «Nei, spill videre» blir i spillet, og «Ja, avslutt» går til forsiden. Spillet hang ikke.
- **F2:** Seks plantede åkre var der fortsatt etter omlasting. Nullstilling krever bekreftelse: «Nei, behold alt» beholder lagringen, og «Ja, slett alt» sletter både hovedlagringen og `-kopi`.
- **F3 (rettet siden d582ecd):** Med en eldre `-kopi` og en ødelagt hovedlagring (nivå 3, 777 mynter) ble den ødelagte lagringen tatt vare på i `-kopi`, også etter `pagehide`. Lagring fra en nyere versjon (`v:2`, 4242 mynter) ble også tatt vare på. Spillet krasjet ikke. Lagring fra 0.8.0–0.8.2 med siloen på gammel standardplass (11,95; −2,4) ble flyttet til låven (−13,6; −1,75) og lagret der. En silo som spilleren hadde flyttet selv (10; −4), ble stående.
- **U1:** Startkortet har mål, styring (med «B: bygg»), Start, «← Tilbake til EVN Studio» og «Versjon 0.8.3». På 740×360, 320×568 og 568×320 kan kortet rulles (for eksempel 435/320 px).
- **U2 (Q-delen):** Opplæringen med Nysgjerrig vises, og styringshjelpen i pausen har med B. Handlingskortene viser nå XP.
- **U3 (Q-delen):** Teksten i byggemenyen og XP-oversikten er på enkel norsk, og ingenting kan tapes.
- **T1:** Ingen synlig knapp var mindre enn 44×44 px på startkortet, i spillet, i byggemenyen eller i XP-kortet, i alle fem størrelsene (bare emulert). I byggemenyen ligger noen «Vis»-knapper utenfor skjermen på lave skjermer, men lista kan rulles (`#byggListe` 587/166 px).
- **T3:** Zoom er ikke sperret (statisk suite). Med emulert `prefers-reduced-motion` er animasjonen på startknappen av.
- **T4:** Stikkprøve: byggemenyen viser 🔒 og «Nivå N» som tekst, så fargen er ikke eneste signal. Kontrasten er den samme mørkebrune teksten på krem som før.
- **Y2:** I skjult fane går spillet til pause. Etter 35 s var alle seks åkre modne, og Fortsett virket. At hastigheten ikke avhenger av skjermfrekvensen, er bare kodelest.
- **K1:** Ingen konsollfeil, ingen 404 og ingen eksterne forespørsler i noen av mine kjøringer under normal bruk. Røyktesten var også OK.
- **K2 (rettet):** En feil på startkortet før Start ga feilkortet øverst, med fokus på «Last på nytt», og omlasting virket. Et avvist løfte (`unhandledrejection`) etter Start ga også feilkortet.
- **B3 (meldingsdelen er rettet):** Uten WebGL er Start skjult. Startkortet sier: «Gården trenger 3D-grafikk, og den virker ikke i denne nettleseren. Spør en voksen …». «Tilbake» er synlig, og det generelle feilkortet kommer ikke.
- **K3:** «Versjon 0.8.3» står på startkortet og i tittelen, og raden i `ENDRINGSLOGG.md` nevner 0.8.1–0.8.3.
- **S1:** Den statiske suiten er OK (CSP, ingen eval, bare godkjente domener), og ingen eksterne forespørsler ble gjort.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger.
- **S3:** Spillet har ingen fritekst og ingen input-felt.
- **S4:** Lagringsnøklene er de samme som før (`evn-min-bondegard-v1` og `-kopi`). Personvernsiden stemmer.
- **ST1:** Kjørt med evnstudio.no omdirigert til den lokale kopien og GoatCounter erstattet av en stubb. Ingen hendelse før Start, og `start-min-bondegard` ble sendt én gang, også med en ekstra `evn-start`.
- **ST3:** Ingen forespørsler mot statistikk på localhost.
- **ST5:** Bare godkjente navn ble observert.
- **ST6:** `document.cookie` er tom, og koden har ingen ID.
- **ST7:** Spillet har felles statistikk.
- **Borte-meldingen (rettet):** Med `sist` 10 minutter tilbake viste spillet «Mens du var borte: 6 åkre er modne. 🌞».
- **Esc (delvis rettet):** Esc lukker nå handlingskortet, byggemenyen og lageret uten å åpne pausen. Esc uten noe åpent gir pause.
- **Veifinning til jobbene:** Alle mål på gården har en vei. Ingen planlagt jobbvei gikk gjennom bygg, gjerder eller binger (kontrollert med en krok på `gaaTil`). Siloens nye plass overlapper ikke faste hindringer.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2, verifisert feil (ny form av det mulige problemet fra forrige rapport):** P åpner pausen over en åpen dialog. To måter å gjenskape det på:
  1. Åpne markedsbua og trykk P, så Fortsett. Markedsbua er fortsatt åpen, men fokus er utenfor den, og Tab går til ⭐, 🔨, 📦 og ⏸ i HUD.
  2. Trykk B, så P, så Esc. Den nye Esc-lytteren (capture) lukker byggemenyen *under* pausen, og pausen blir stående. `EVNPauseInert(null)` fjerner beskyttelsen, så Tab går ut av pausekortet til HUD mens spillet er pauset.

  Esc-lytteren sjekker ikke om pausen er åpen.
- **ST2, kjent avvik i felles kode (uendret):** `spilletid-min-bondegard-01min` ble sendt etter 70 s med pausen åpen. Avviket står nå i endringsloggen.
- **ST4 og versjonshendelsen, kjent avvik i felles kode (uendret, statisk):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.8.3`.
- **Mulig problem, to faner (fra forrige rapport, ikke testet på nytt):** Når begge fanene har samme `seq`, vinner den som lagrer sist.

## Anbefalte forbedringer
- **Verifisert feil i 0.8.1-funksjonen (ikke et standardkrav):** Venteturen finner bare vei til det *første* punktet. De rette strekningene etter det følger ikke veifinningen, og det gjør heller ikke `ut`-veien. Spilleren kan sette bygg på disse strekningene.
  - Gjenskap (planlagt rute beregnet med spillets egne funksjoner): sett siloen på (−14; 4,75). Da går VENT[2] «Wave» gjennom siloen ved (−12,65; 5,95).
  - Sett fôrkverna på (−2,25; 0,75). Da går VENT[1] og VENT[3] gjennom den.
  - Selve gangen er ikke sett på skjermen, fordi headless gir ca. 1,5 bilder/s.
- Lagertall kuttes nå til 9999, men ikke til kapasiteten. Med 1e9 hvete fikk spilleren 9999 i en silo med plass til 50.
- På 320×568 dekker revetipset (fra 110 px) de nederste ca. 14 px av myntpillen (70–124 px). Tallet kan fortsatt leses. Pillen havnet på ny linje fordi 🔨 kom i tillegg.
- Feilkortet før Start sier «Gården din er lagret», selv om ingenting er lagret i denne økten.
- `-kopi` overskrives nå ved hver ødelagte lagring. En tidligere reddet lagring, for eksempel fra en nyere versjon, kan da gå tapt ved en ny ødeleggelse. Vurder flere kopier eller å ikke overskrive en gyldig kopi.
- Pauseteksten «Spillet står stille. Ingenting er borte.» stemmer fortsatt ikke, siden avlingene vokser videre.
- Endringsloggraden har fortsatt «B1, B3 og B4» uten prefiks. Koden og README har fått prefiks.
- Det er ikke kommet automatiske tester for rettingene (F3-kopi, K2, B3, Esc, siloflytting, veifinning). `logikk.test.mjs` har fortsatt 49 tester.
- Oversikten «Hvilke krav gjelder for hvert spill» mangler fortsatt Min Bondegård. Jeg har lagt B3 til grunn. B1 (ingen lyd i koden), B2 og B4–B7 er vurdert som ikke relevante.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt, og headless med SwiftShader sier ingenting om ytelse. Hvor tung veifinningen er på mobil, er ikke målt.
- **ST8:** `test/statistikk/` finnes ikke (kjor: «ikke innført»). Jeg brukte en erstatning med omdirigert vert og GoatCounter-stubb. Milepælene 5–60 min er ikke testet. Om hendelsene faktisk kommer fram i GoatCounter, krever en voksen med innlogging.
- **B3, lavere grafikk på svake enheter:** bare kodelest (`KVAL = 'mobil'`), og det krever enhet (E).
- **E (faktisk enhet):** T1, T3 (knipezoom) og B3, ekte berøring på iPhone og Android, rulling i byggemenyen med finger og trygge områder.
- **V (Even):** U2 og U3: om barn forstår byggemenyen, XP-oversikten og opplæringen, og opplevd tempo.
- **T4:** Ingen fullstendig kontrastberegning, bare stikkprøver. Den automatiske testen (A) mangler.
- **T1, T2, T3, F2, F3, K2, Y2 og B3:** Kravene har kode A, men det finnes ingen automatiske tester for dem utover røyktesten og den statiske suiten.
- **UI1–UI10:** Gjelder ikke for spillet (ikke godkjent for det) og er ikke kontrollert.
- **Commit etter f385c5f:** de04f59 (0.8.4, «dra for å flytte åkre og bygg») er ikke kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD. F1 er testet uten kritiske feil, og F3, K2, B3 og borte-meldingen fra forrige rapport er rettet. T2 er fortsatt et verifisert avvik når pausen åpnes over en dialog, venteturen kan gå gjennom flyttede bygg, og ytelse og ekte berøring er ikke testet på enhet. Vurderingen gjelder f385c5f, ikke 0.8.4.

Testserveren på 8767 og testnettleserne er stoppet. Testskript og skjermbilder ligger i `/tmp/qa-mb2/`, uttrekket i `/tmp/qa-mb-f385c5f/` og klonen i `/tmp/qa-mb-klon/`, alt utenfor repoet. Repoet er ikke endret av meg.
