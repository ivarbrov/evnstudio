# EVN Game QA: Dyrepatruljen 0.12.0
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1, og S2 etter 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit ca2f1147d162bc2a1b3068d6ad005ebaf67fc58f
Testkvittering: evn1 commit=ca2f1147d162bc2a1b3068d6ad005ebaf67fc58f tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Oppdraget ber om full kontroll. Endringen er ny spillogikk (mynter, utstyr som stenger fangst, bod), nye felt i lagringen og ny tekst på startkortet og i nullstillingen. Diff mot origin/main (03f5df4): `spill/dyrepatruljen/index.html` (+252/−24) og `ENDRINGSLOGG.md` (1 rad). `statistikk.js`, `ecoins/` og CSP er ikke endret.
Testet:
- **Testsuite:** Jeg kjørte `node test/kjor.mjs --base origin/main` i `C:\Users\sss480\evnstudio-rev` med Chrome. Resultat: 73 OK, 0 FEIL, 0 VARSEL og 2 «ikke innført» (statistikk, ui).
- **Nettleser:** Egen headless Chrome via CDP (SwiftShader). Spillet ble hentet fra den eksisterende serveren på 127.0.0.1:8731, og jeg sjekket at den gir samme fil som commiten (md5 er lik).
- **Tastatur, mus og berøring:** Ekte tastetrykk og museklikk med `Input.dispatchKeyEvent` og `Input.dispatchMouseEvent`. Berøring med `Input.dispatchTouchEvent` og berøringsemulering.
- **Testoppsett:** Helten ble plassert direkte med `__dyrespill.spiller`, og lagring ble lagt inn i `localStorage` før omlasting.
- **Sammenligning med 0.11.5:** Hentet med `git show origin/main:…` og servert fra en egen midlertidig server på 127.0.0.1:8741. Den er stoppet.
- **Størrelser:** 1280×800 (PC) og emulert berøring i 375×812, 740×360, 320×568, 568×320, 667×375, 414×896, 768×1024 og 1024×768.
- **Bildefrekvens:** Headless gir ca. 8,5 bilder/s. Fordi `dt` er begrenset til 0,05, går spilltiden saktere enn sanntid, og ventetidene er justert etter det.
- **Lagring og repo:** `localStorage` ble tømt før og etter hver kjøring. `git status` er tom.
- **Skript og skjermbilder:** Mine skript og skjermbilder ligger i `C:\Users\sss480\AppData\Local\Temp\claude\b1ad4f01722a3e7a\7dd4693c-be5e-4780-8470-e694f0e790ce\scratchpad\qa\`. Andre skript i scratchpad-mappa (blant annet `patch-rev.mjs` og `t1.js`) er ikke mine og er ikke brukt som bevis.

## Oppfylte krav
- **Endringene i 0.12.0 (kjørt):**
  - **Boble fra reven:**
    - **Når den vises:** Med ekte mellomrom mot en due i Gata uten fuglefrø vises boblen «🦊 Nysgjerrig: Fugler flyr fra håven. Kjøp fuglefrø 🌻 … så kan du fange duer.» med knappen «🦊 Gå til reven R». Duen blir redd og fanges ikke.
    - **R:** Tar deg til parken og åpner boden. Den aktuelle varen er markert («trengs»), og knappen «↩ Tilbake til 🏙️ Gata» tar deg tilbake til Gata.
  - **Reven i parken:**
    - **Lasting:** Modellen lastes uten feil.
    - **Nær reven:** Knappen blir «🦊 Handle», og etiketten blir «Trykk mellomrom for å handle» på PC og «Trykk på Handle» på berøring.
    - **Åpne boden:** Mellomrom, E og museklikk på Handle-knappen åpner boden på PC.
  - **Mynter:**
    - **Fangst:** Nytt dyr gir +3 («Du reddet oransje katt! 🐱 +3 mynter»). Fuglefrø ble kjøpt for 10 mynter, og deretter ble duen fanget («🌻 Du reddet due! 🕊️ +3 mynter»).
    - **Kos:** Kos gir +1 én gang per dyr. Ved et nytt parkbesøk gir kos +1 igjen (13 → 14).
    - **HUD:** Myntene vises i HUD og oppdateres med en gang.
  - **Kjøp:**
    - **Med mus:** Trekker riktig beløp (23 → 13), varen blir «✅ Kjøpt», den lagres i `utstyr`, og fokus flyttes til Lukk.
    - **Med tastatur:** Enter og mellomrom på en kjøpsknapp etter Tab virker.
    - **For få mynter:** Uten nok mynter vises «Du trenger N mynter til», og det finnes ingen kjøpsknapp.
  - **Dyreboka og etiketten over dyr:** Dyreboka viser «Trenger 🥕/🪜/🌊» for dyr som mangler utstyr. Over en due 6 m unna vises «🌻 Fuglefrø».
  - **Reven i Byen (`rev1`):** Gir «… Det er fetteren til reven Nysgjerrig!», og boden takker for fetteren.
  - **Eierens krav om at ingen blir stående fast:** Gata har 6 dyr uten utstyr (18 mynter) mot fuglefrø til 10. Kos gir nye mynter ved hvert parkbesøk, så det finnes alltid en vei til mynter. Havet har 9 av 10 dyr med vannhåv, men den nås først etter 9 fullførte verdener.
- **F2:** Mynter og utstyr overlever omlasting. «Start helt på nytt» viser den nye teksten («… myntene og utstyret fra reven blir borte.»), med fokus på Nei. Esc og Nei beholder lagringen, og Ja sletter `evn-dyrespillet-v1` (spilletid og lyd beholdes).
- **F3 (de nye feltene):**
  - **Gammel lagring:** Lagring i 0.11.5-format (`{v:1,reddet:{gata:[6 dyr]}}`) gir 18 mynter, og `reddet` er uendret.
  - **Ugyldige verdier:** `mynter:"abc"` gir 3 (regnet ut). `mynter:-5` med `utstyr:["fuglefro","fuglefro","tull"]` gir 6 mynter og `["fuglefro"]`. `mynter:7.8` gir 7, `utstyr:"x"` gir `[]`, og `"{oops"` og `reddet:null` gir ren start.
  - **Ingen nye feil:** Ingen av disse krasjer.
- **U1:** Startkortet har mål (med den nye setningen om reven), 7 styringslinjer (ny: «Handle»), Start, vei tilbake og «Versjon 0.12.0». Pausens styringshjelp henter de samme linjene.
- **U2 og U3 (Q-delen):** Boble, etikett, bod og dyrebok forteller hva som trengs og hvor. Tekstene er korte og på enkel norsk. Det å mangle utstyr føles ikke som straff: dyret blir bare redd.
- **T1 (A-delen, emulert):** Bodens knapper er 48×48 (✕), 209×48 (Tilbake), 75×48 (Lukk) og 115×48 (Kjøp). «Gå til reven» er 131–153×44. Det er ingen sideveis rulling i 375×812, 740×360, 320×568 eller 568×320, og boden ruller loddrett (`overflow:auto`).
- **T2 (boden og nullstillingen):** Med boden åpen er 11 elementer `inert`, og Tab og Shift+Tab holder seg i boden. P, M og B åpner ingenting. Esc, ✕, Lukk og klikk på bakgrunnen lukker boden, og etterpå er 0 elementer `inert`. Hele flyten (start → Gata → boble → R → kjøp → tilbake) virker med tastatur.
- **T4 (nye elementer):** Kontrasten er 15,2 (snakkeboble), 14,3 (reveboble), 13,0 og 7,3 (vare), 4,7 (Kjøp, hvit på grønn), 5,5 (Lukk og «Gå til reven») og 8,3 (mynteforklaring). Det som trengs, vises med ramme og med teksten «Du trenger …», og dyreboka bruker ikon, ikke bare farge.
- **K1:** Ingen konsollfeil, unntak eller 404 i noen kjøring, unntatt den bevisste F3-testen. Røyktesten er OK.
- **K3:** Versjonen står i `<title>`, i `VERSJON = 'v0.12.0'` og på startkortet. ENDRINGSLOGG har en ny rad merket «ikke publisert», og innholdet stemmer med det som er målt.
- **S1:** Den statiske testen er OK. CSP er uendret, og reven er innebygd (base64), så det er ingen nye domener.
- **S2:** Mynter er spillets egne og kan ikke kjøpes for ekte penger. Det finnes ingen konto, chat eller reklame. `evn-ecoins-v1` blir ikke rørt (`null` etter fangst og kjøp).
- **S3:** Ingen fritekst. `innerHTML` i boden bygges bare av faste tekster i koden.
- **S4:** Personvernsiden sier at fremgangen lagres lokalt. Mynter og utstyr er en del av fremgangen, og sidene stemmer.
- **B1 (A-delen):** L gir 🔇 med `aria-pressed="true"` og lagres i `evn-dyrepatruljen-lyd`.
- **B2:** M i parken viser «🔴 Du er her · 🦒 Dyreparken», helten står stille (0,0000), og Esc lukker. Mens boden er åpen er `tilstand='pause'`, så `kanPause` og `aktiv` er falske.
- **ST6:** `document.cookie` er tom, og koden har ingen ID.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F1, verifisert feil (ny, emulert berøring): Handle-knappen åpner boden og lukker den straks i liggende format og på nettbrett.**
  - **Årsak:** `btnHav` reagerer på `pointerdown` og åpner boden. Klikket fra samme trykk kommer etterpå og treffer bodens bakgrunn (`#butikk`), og bakgrunnsklikk lukker boden. `preventDefault()` på `pointerdown` stopper ikke `click`.
  - **Logg i 740×360:** `butikk vist → pointerdown btnHav → click på butikk → butikk skjult`.
  - **Gjenskap:** Bruk berøringsemulering i 740×360, 667×375, 768×1024 eller 1024×768. Gå til parken, stå ved reven (knappen viser «🦊 Handle») og trykk på Handle. Boden blinker og lukkes.
  - **Hvor den virker:** I 375×812, 320×568, 414×896 og 568×320 dekker kortet knappen, så klikket havner i kortet og boden blir stående.
  - **Hvorfor ikke kritisk:** «🦊 Gå til reven» i boblen (et vanlig klikk) åpner boden også på berøring. Men på nettbrett og i liggende format kan barnet ikke handle direkte ved reven.
  - **Ekte enhet:** Må bekreftes på faktisk enhet (E).
- **F1, mulig problem (samme årsak):** Det samme klikket havner inne i kortet på små skjermer: på en vare (568×320, 320×568), på `SMALL` (375×812) og på `.tjen` (414×896). Det ble ikke noe utilsiktet kjøp i noen av de fem størrelsene med 40 mynter. Men hvis en «Kjøp»-knapp ligger under fingeren, kan et trykk på Handle kjøpe noe. For å avgjøre det: test på ekte telefoner i flere størrelser, eller rett årsaken over.
- **F3, verifisert feil (kjent, uendret):** `{"v":1,"reddet":{"gata":null}}` gir fortsatt «Cannot read properties of null (reading 'length')» i `antallReddet` når verdensvalget åpnes, med 0 verdener i lista. De nye feltene og `sikreMynter()` gjør det ikke verre, og oppstarten går fortsatt.
- **K2, avvik (kjent, kodelest):** Det finnes ingen global feilfanger. Spillet har bare `error`-lytteren for «ingen 3D».
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke. Ikke kontrollert på nytt.
- **ST1, ST2, ST4, ST7 og ST8, avvik (kjent, uendret):**
  - **ST1:** `statistikk.js` lastes nederst i `<body>` med `defer`, og spillet sender ikke `evn-start` (start telles ved klikk på `#startBtn`).
  - **ST2:** `EVNAktivTid` finnes ikke. Den gamle tidtakingen teller også mens boden er åpen.
  - **ST4:** Det sendes ingen `feil-…`-hendelser.
  - **ST7:** `versjon-…` sendes ikke.
  - **ST8:** `test/statistikk/` finnes verken her eller på `main`.

## Anbefalte forbedringer
- **Rett Handle-feilen:** Åpne boden først på `click` eller `pointerup` i parken, eller se bort fra bakgrunnsklikk de første ca. 400 ms etter at boden er åpnet.
- **HUD-en i to linjer:** Med mynter går HUD-en over to linjer i 375×812, 320×568 og 568×320 (61 px mot 37 px i 0.11.5).
  - I 568×320 overlapper reveboblen HUD-en med ca. 5 px og styrespaken med 1 px.
  - Mellomrommet ned til ikonraden er ca. 10 px i 375×812.
- **Start lenger ned (kjent problem som er blitt større):** Start lå under bretten også i 0.11.5, men nå ligger knappen lenger ned:
  - 320×568: bunnen av knappen på y 862 (0.11.5: 680).
  - 740×360 og 568×320: y 530 (0.11.5: 462).

  Knappen kan nås ved å rulle, og den virker.
- **Hvilket dyr kos treffer:** Kos treffer det første dyret i lista innenfor 3 m, ikke dyret helten ser på. I testen ga 6 kos-trykk mot 6 dyr bare 5 mynter, fordi et trykk traff et dyr som allerede var kost. Det kan forvirre barnet.
- **Hjelpelinja i parken:** Den står fortsatt «Mellomrom: håv». Bør si Kos eller Handle.
- **Fra før:** validering i `lastInn()` (F3), global feilfanger (K2) og håndtering av `webglcontextlost`.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil og ingen ekte enhet. Headless-tall sier ingenting om ytelsen.
- **Y2:** Fanebytte er ikke testet. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (`dt = Math.min(0.05, …)`, og revens animasjon bruker samme `dt`). Under 20 bilder/s går spillet saktere, noe som også ble sett i headless.
- **Boblens 8 sekunder:** Fordi headless-bildefrekvensen er lav, ble ikke forsvinningen observert (den måles i spilltid). Status: kun kodelest.
- **T1, T3, B1 og B3 (E):** Ekte berøring og safe area på iPhone er ikke testet, og heller ikke knipe-zoom, hørbar lyd, tapt WebGL-kontekst og lavere grafikk. Handle-feilen over må bekreftes på faktisk nettbrett og telefon i liggende format.
- **T2 (pause, kart og dyrebok):** Fokusfellen i disse er ikke testet på nytt i denne commiten. Bare boden og nullstillingen er testet.
- **T3 (`prefers-reduced-motion`):** Bare kodelest denne gangen (Start-pulsen er slått av med `reduce`). Revens vinking følger ikke `reduce`. Zoom-delen er OK i den statiske testen.
- **T4 (helhet):** HUD-en er ikke kontrastmålt.
- **B3:** Oppstarten uten WebGL er ikke testet på nytt (koden er uendret).
- **ST3:** Kun kodelest (`statistikk.js` returnerer hvis vertsnavnet ikke er evnstudio.no).
- **ST5:** Ikke testet, fordi hendelser ikke sendes lokalt og `test/statistikk/` mangler. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **U2 og U3 (V):** Om barn forstår utstyrsreglene, boblen og boden, og om prisene (8–15) og myntene gir god flyt, må Even vurdere.
- **B4, B5, B6 og B7:** Gjelder ikke, etter oversikten i standarden.
- **UI1–UI10 og UI8a–c:** Godkjent hovedløsning, men ikke tatt i bruk for Dyrepatruljen, så de er ikke kontrollert som krav. Klarspråk har status forslag og er ikke kontrollert.
- **Automatiske tester (A) som mangler:** F2, F3, T2 fokus, T4, Y2, K2, B1, B2, B3, S2, S3 og ST2–ST8, og ingen test dekker mynter, utstyr eller boden.
- **Hele verdener og senere verdener:** Ikke spilt gjennom. Fangster er bare testet i Gata og i Byen (`rev1`, via `__dyrespill.fang`).

## Klar for testing hos Even?
JA MED FORBEHOLD – Reven, mynter, utstyr, boden, lagringen og nullstillingen virker med tastatur, mus og emulert berøring uten konsollfeil, og ingen kan bli stående fast. Forbehold: På nettbrett og telefon i liggende format lukkes boden straks når Handle trykkes (bruk «Gå til reven» i boblen til det er rettet), og ekte enheter samt de kjente avvikene F3, K2, B3 og ST1, ST2, ST4, ST7 og ST8 er ikke avklart.
