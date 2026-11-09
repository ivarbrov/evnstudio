# EVN Game QA: Min Bondegård 0.8.0
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit d582ecd5deeb95ea612bf4cd7d4688d8dddf7c25
Testkvittering: evn1 commit=d582ecd5deeb95ea612bf4cd7d4688d8dddf7c25 tester=7ea9bc1e4c9d arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – dette er et nytt spill, og agenten krever da fullt nivå. Kontrollen er ikke en publiseringskontroll.
Testet: Lokalt i Chrome headless (`/usr/bin/google-chrome`, WebGL via SwiftShader), styrt over DevTools-protokollen. Tastetrykk, musklikk og berøring var syntetiske hendelser fra nettleseren, ikke DOM-`click()`. Testtilstand ble satt opp med `window.__spill` i en egen testprofil, og `localStorage` ble tømt før hver test. Skjermstørrelser: 1280×800, 375×812, 740×360, 320×568 og 568×320 (emulert mobil med berøring). I tillegg kjørte `node test/kjor.mjs`, `test/min-bondegard/logikk.test.mjs` (49 ok, 0 feil) og `sim.mjs` (nivå 4 etter 7–8 min, 0 fastlåst).

**Viktig om commit:** HEAD flyttet seg mens kontrollen pågikk. Først kom 7fb5224 (0.8.1, 21:47), og senere 598b1c8. `test/kjor.mjs` kjørte mens arbeidstreet var rent på d582ecd. Alle kjøretidstester er kjørt på nytt mot en uttrekket kopi av d582ecd (`git archive` til `/tmp/qa-mb/snap`, servert på port 8766). Resultatene var de samme. 0.8.1 og senere commits er ikke kontrollert.

## Oppfylte krav
- **F1:** Spillet startet med klikk og med Tab+Enter, og kunne spilles: plante, mate, høste, produsere, kjøpe bakeri og selge. Pause virket med P, Esc og knappen. Fortsett virket. Avslutt (🚪) viser spørsmålet: «Nei» spiller videre, og «Ja» går til forsiden. Spillet hang ikke.
- **F2:** Fremgangen overlevde omlasting, også flyttet åker, kjøpt bakeri og køen. Nullstilling krever bekreftelse: «Nei» beholder alt, og «Ja» sletter hovedlagringen og kopien.
- **U1:** Startkortet har EVN-merke, mål, styring (egen tekst for PC og berøring), Start, «Tilbake» og «Versjon 0.8.0». Kortet kan rulles på små skjermer.
- **U2 (Q-delen):** Nysgjerrig viser fem steg med pil, og styringshjelpen ligger i pausen.
- **U3 (Q-delen):** Teksten er på enkel norsk, og det finnes ingen tap.
- **T1:** Ingen synlig knapp eller lenke var mindre enn 44×44 px i tilstandene start og spill med hønsehuskortet, i alle fem størrelsene. Bare målt i emulering.
- **T2:** Piltaster velger ting, Enter bruker, L åpner lageret og P/Esc gir pause. Tab går i ring i pausen, lageret og markedsbua, og «Start helt på nytt»-boksen får fokus. Se mulig problem under.
- **T3:** Zoom er ikke sperret (statisk kontroll). Med emulert `prefers-reduced-motion` var animasjonen på startknappen av.
- **T4:** Stikkprøver av kontrast var gode (hvit på mørk grønn, mørk brun på krem). Ved flytting vises grønt/rødt sammen med at «Sett her» blir deaktivert, så fargen er ikke eneste signal.
- **Y2:** Etter fanebytte går spillet til pause. En åker ble moden etter 31 s i skjult fane, og Fortsett virket. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (jobbene bruker `Date.now`).
- **K1:** Røyktesten og alle egne kjøringer var uten konsollfeil og uten 404.
- **K3:** Versjon 0.8.0 står på startkortet og i tittelen, og `ENDRINGSLOGG.md` har en rad for den.
- **S1:** Den statiske suiten er OK, og ingen eksterne forespørsler ble gjort lokalt.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. Myntene finnes bare i spillet.
- **S3:** Spillet har ingen fritekst og ingen input-felt.
- **S4:** Personvernsiden (localStorage, GoatCounter) stemmer med det spillet gjør.
- **ST1:** `statistikk.js` lastes i `<head>` før spillets skript, med `data-spill="min-bondegard"`. Dette ble kjørt med evnstudio.no omdirigert til den lokale kopien og GoatCounter erstattet av en stubb: ingen hendelse før start, og `start-min-bondegard` ble sendt én gang, selv med et ekstra Start-trykk og en ekstra `evn-start`.
- **ST3:** Ingen forespørsler mot statistikk på localhost.
- **ST5:** Bare godkjente navn ble observert.
- **ST6:** `document.cookie` er tom, og koden har ingen ID.
- **ST7:** Spillet har felles statistikk.
- **Lagring og tid:**
  - Etter 10 simulerte minutter borte var åker, egg og kø ferdige. De kunne hentes én gang, og ikke igjen etter omlasting.
  - Med en klokke som gikk bakover, ble ventetiden kortet ned til jobbens egen lengde.
  - Ødelagt lagring første gang og lagring fra en nyere versjon (`v:2`) ble tatt vare på i `-kopi`, og spillet viste en melding.
  - `?test` bruker egen lagring.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F3, verifisert feil:** Ødelagt lagring tas bare vare på hvis `evn-min-bondegard-v1-kopi` ikke finnes fra før. Gjenskap: legg en gammel kopi i `-kopi` og en ødelagt lagring (nivå 3, 777 mynter) i hovednøkkelen, åpne spillet og forlat siden. `pagehide` lagrer da en ny gård over hovednøkkelen, og 777-lagringen finnes ingen steder. Det samme vil gjelde lagring fra en nyere versjon. Jeg har ikke klassifisert dette som kritisk, fordi det krever en ny ødeleggelse etter en tidligere en. Vurder det likevel med tanke på regelen om tapt fremgang.
- **K2, verifisert feil:** Feilkortet vises bare etter Start (`if (... || !startet) return`). Disse feilene ga ikke noe kort: en feil på startkortet, og `Promise.reject` etter Start. Kortet vises riktig ved en vanlig feil etter Start, med fokus på «Last på nytt».
- **B3, verifisert feil:** Når WebGL ikke finnes (`getContext('webgl*')` returnerer null), vises startkortet som vanlig. Etter Start kommer det generelle feilkortet: «Gården din er lagret … Last på nytt». Det sier ikke at 3D ikke virker, og omlasting gir samme resultat hver gang. Lavere grafikk på svake enheter (`KVAL = 'mobil'`) er bare kodelest.
- **ST2, verifisert feil i felles kode:** `spilletid-min-bondegard-01min` ble sendt etter ca. 60 s med pausen åpen og siden synlig. EVN-PAUSE v3 og `window.EVNAktivTid` finnes ikke i repoet, og spillet bruker v2 som de andre spillene. Avviket er kjent fra de andre spillene, men raden for Min Bondegård i endringsloggen nevner det ikke.
- **ST4 og godkjente hendelser, avvik i felles kode (statisk):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.8.0`.
- **T2, mulig problem:** Esc lukker ikke handlingskortet, lageret eller markedsbua. Pausen åpnes over dem i stedet (verifisert). Kodelest: når pausen lukkes, nullstiller `EVNPauseInert(null)` inert-beskyttelsen til dialogen under, så fokus kan da trolig gå ut av markedsbua. For å avgjøre det: åpne markedsbua, trykk Esc og Fortsett, og trykk så Tab.
- **Mulig problem, to faner:** Lagret tilstand fikk aldri dobbel høsting. Men når begge fanene har samme `seq` og handler nesten samtidig, rapporterer begge at samme åker er høstet, og den som lagrer sist vinner. Den andre fanens handling kan da gå tapt. Sjansen er liten i praksis.

## Anbefalte forbedringer
- Meldingen «Mens du var borte …» vises aldri (verifisert). `valider` → `normaliserTid` setter `s.sist = naa` før `sistSett` leses.
- `valider` godtar lagertall over kapasiteten. 1e9 hvete ble lastet inn uten å bli kuttet.
- Planens ID-er (B1, B3, B4, F2, F3, F6) brukes i kode og endringslogg og blandes med standardens B1–B7 og F1–F3. Bruk et eget prefiks.
- Pauseteksten «Spillet står stille» stemmer ikke, siden avlingene vokser videre.
- På 320×568 havner myntene på en ny linje under revetipset, fordi revetipset ligger over HUD (z 7 over 6). På 740×360 og 568×320 dekker handlingskortet revetipset. En enkel sum av rektangler for HUD, tips og kort ga 44–87 % på mobil. Til informasjon: UI8 gjelder ikke for spillet.
- Oversikten «Hvilke krav gjelder for hvert spill» i standarden mangler Min Bondegård. Jeg har lagt B3 til grunn (3D). B1, B2 og B4–B7 er vurdert som ikke relevante: ingen lyd, ingen stor verden med kart, ingen kamp, ingen læringsinnhold, ingen app og ingen fritekst.
- Legg de kjente avvikene i ST2 og ST4 og den manglende versjonshendelsen inn i endringsloggraden.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt, og headless med SwiftShader (ca. 3 b/s) sier ingenting om ytelse.
- **ST8:** `test/statistikk/` finnes ikke (kjor: «ikke innført»). Jeg brukte en egen erstatning: omdirigert vert og en GoatCounter-stubb. Milepælene 5–60 min er ikke testet. Om hendelsene faktisk kommer fram i GoatCounter, krever en voksen med innlogging.
- **E (faktisk enhet):** T1, T3 og B3 (lavere grafikk), ekte berøring på iPhone og Android, knipezoom og trygge områder.
- **V (Even):** U2 og U3: om barn forstår opplæringen og målene, opplevd tempo og vanskelighet.
- **T4:** Ingen fullstendig kontrastberegning, bare stikkprøver. Den automatiske testen (A) mangler.
- **T1:** Lageret, markedsbua, nivåbanneret og flyttelinja er ikke målt på mobil.
- **T1, T2, T3, F2 og F3:** Kravene har kode A, men det finnes ingen automatiske tester for dem utover røyktesten.
- **Commits etter d582ecd:** 7fb5224 og 598b1c8 er ikke kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1 er testet uten kritiske feil. Men K2 og B3 (feil før start og manglende 3D) og F3 (ødelagt lagring når det finnes en kopi fra før) er verifiserte avvik, og ytelse og ekte berøring er ikke testet på enhet. Vurderingen gjelder d582ecd, ikke 0.8.1 eller senere commits.

Begge testserverne (8765 og 8766) er stoppet. Testskript og skjermbilder ligger i `/tmp/qa-mb/`, utenfor repoet. Repoet er ikke endret.
