# EVN Game QA: Min Bondegård (min-bondegard) 0.15.11, med forsiden og E-coins-regeltabellen
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 3f46a28b4a7fd186eb5bf8f619c4ac47f72da381
Testkvittering: evn1 commit=3f46a28b4a7fd186eb5bf8f619c4ac47f72da381 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – kontrollen gjøres før publisering, og et nytt spill skal ut på nettsiden. Siden 34623bc er bare `ENDRINGSLOGG.md` og innrykket i én testlinje endret. Trærne for `spill/min-bondegard`, `index.html`, `bilder` og `statistikk.js` har samme hash som på 34623bc. Alle kjøringer under er likevel gjort på nytt mot 3f46a28.
Testet:
- **Klone:** En ren klone av 3f46a28 i `/tmp/qa-mb3f`, servert på port 8831. For F3 ble uttrekk av 27d7f7b (0.15.0, port 8832) og 26c1539 (0.15.8, port 8833) brukt.
- **Nettleser:** Chrome headless med SwiftShader, styrt over DevTools-protokollen. Tastatur, mus og berøring var syntetiske hendelser. Testtilstanden ble satt opp med `window.__spill` i egne, midlertidige profiler, og `localStorage` ble tømt før og etter.
- **Størrelser:** 1280×800 med mus. 375×812, 740×360, 320×568 og 568×320 med emulert berøring. Forsiden er testet i 1280×800, 375×812 og 320×568.
- **Node:** `test/kjor.mjs` ga 99 ok, 0 feil og 0 varsler. `logikk.test.mjs` ga 111 ok og 0 feil. `sim.mjs 100 11` nådde nivå 10 etter 35,1 min (aktiv spiller) og 38,0 min (barn), i 100 av 100 kjøringer, med 0 fastlåst.

## Oppfylte krav
- **F1:**
  - Tab går til Start, og Enter starter spillet. P åpner pausen, Esc lukker den, og Fortsett virker.
  - Avslutt spør først, og «Nei, spill videre» blir i spillet.
  - På nivå 1 gir klikk på varebilen en forklaring. På nivå 4 åpner klikket tavla, og en levering setter bilen i gang.
  - Bilen står stille i pause (z = 3,02 før og etter).
  - Hele bilturen er simulert ved 30, 60 og 144 bilder per sekund. Den tar 28, 28 og 27,9 s, ender på (−5,5; 1,7) og treffer ingenting.
- **F2:** Nullstilling spør «Starte helt på nytt?» med fokus på «Nei, behold alt». «Nei» beholder lagringen, og «Ja» sletter alle nøklene.
- **F3:**
  - **Lagring fra 0.15.0 og 0.15.8 på nivå 10:** Nivå, XP, 48 200 mynter, lager og områder er beholdt. E-coins er 60, også etter ny omlasting. Tavla står på (−2,3; 4,6). Ingen overlapp, ingen feilkort og tom konsoll.
  - **Gåte fra den gamle lagringen uten varen på lager:** Feil svar gir «Nei, det er ikke mais. Prøv igjen!». Riktig svar gir 18 mynter.
  - **Ødelagt JSON:** Spillet starter med en melding, og originalen er tatt vare på.
  - **Felt med feil type:** Spillet starter uten feilkort.
  - **Kjøkkenplassen:** En lagring fra 0.15.0 med kjøkkenplassen oppå siloen får `x = null`. Etter kjøp av Enga og omlasting kommer plassen på (20; 7,7), og kjøkkenet kan bygges uten overlapp.
- **Gåtene:** Det ble laget 525 gåtekort på nivå 2, 3, 5 og 10. Svaret var alltid med, det var ingen dubletter, og svaret var aldri den eneste varen spilleren manglet.
- **U1:** Startkortet har mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.15.11». I 568×320 kan kortet rulles, og Tab når «Tilbake» på andre trykk.
- **T1 (emulert):** Ingen synlige knapper under 44×44 px på startkortet, gården på nivå 10, tavla eller gåten, i alle fem størrelsene. Ingen størrelse gir sideveis rulling.
- **T2:** Tab går rundt i pausen (Slik styrer du → Avslutt → E-shop → Fortsett). På forsiden når Tab spillkortet etter 6 trykk, med synlig fokusramme (3 px).
- **T3:** Zoom er OK i den statiske suiten. Animasjonen for reduserte bevegelser er ikke kjørt på nytt (se under).
- **K1:** Røyktesten er OK for alle seks spillene. Konsollen var tom, bortsett fra feil jeg kastet med vilje. Ingen 404 og ingen eksterne forespørsler fra spillet.
- **K2:** Etter en kastet feil vises «Oi, noe gikk galt 🐔» etter cirka 1 s, med fokus på «Last på nytt», og Tab blir der. Testet i 1280×800 og 375×812.
- **K3 (rettet siden forrige rapport):** Raden i `ENDRINGSLOGG.md` linje 9 sier nå «Min Bondegård 0.15.11 på nettsiden». Det stemmer med startkortet, `&lt;title&gt;` og `MB_VERSJON`.
- **S1:** Den statiske suiten er OK. CSP tillater bare `self` og GoatCounter.
- **S2:** Ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK: EC1 gir 1773 publisert, 2213 totalt og 1585 i butikken.
- **S3:** Spillet har ingen fritekst.
- **ST1, ST3, ST5 og ST6:** Testet med evnstudio.no omdirigert til den lokale serveren og GoatCounter byttet ut med en stubb.
  - Ingen hendelse før Start.
  - `start-min-bondegard` kommer én gang, også med en ekstra `evn-start` og etter en levering.
  - `document.cookie` er tom, og det kom ingen andre forespørsler.
  - `data-spill="min-bondegard"` er satt, og `evn-start` sendes (`spill.js:1444`).
  - `statistikk.js` linje 24 sender bare på evnstudio.no.
- **Forsiden:**
  - Min Bondegård er det første av seks spillkort. Bildet lastes, og klikk på kortet åpner `/spill/min-bondegard/`.
  - Nyhetene viser 15.11, 5.11 og 3.11.
  - Ingen sideveis rulling i 1280, 375 eller 320 bredde.
- **E-shop:** Lommeboka viser «Min Bondegård 0 av 2 klart, 60 E-coins igjen å tjene».

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST2, kjent avvik i felles kode (uendret):** Spilletiden teller også pause, fordi EVN-PAUSE v3 ikke finnes.
- **ST4 og ST7, kjent avvik i felles kode (uendret, kun kodelest):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.15.11`.
- **Mulig problem i publiseringen: PR-en tar også med Mørkeskogen 2.0.8.**
  - `git diff origin/main...HEAD` viser endringer i `spill/morkeskogen/` (`index.html`, `spill.js`, `three-r187.global.js` og `LISENSER.md`), fra 387e378 og a9be5c1.
  - En sammenslåing publiserer dermed også Mørkeskogen 2.0.8, ikke bare Min Bondegård.
  - Mappetreet er identisk med a9be5c1, som har en rapport på fullt nivå: JA MED FORBEHOLD, ikke testet på ekte iPad.
  - Lokalt sier `publiseringssjekk.mjs` «Mørkeskogen: mangler QA-rapport på fullt nivå for 3f46a28».
  - Jeg har ikke kontrollert Mørkeskogen utover røyktesten, som er OK. Jeg har heller ikke kontrollert at en voksen har godkjent at 2.0.8 publiseres.
  - **Slik avgjøres det:** En voksen må bekrefte at Mørkeskogen 2.0.8 skal med, og eventuelt bestille en full kontroll av den på denne committen.
- **Publiseringssjekken (lokal):** Den sier at PR-en endrer tester (`test/ecoins/index.html`, `test/index.html` og `test/min-bondegard/*`). Eieren må gå gjennom dem. Dette er ikke et brudd på standarden.

## Anbefalte forbedringer
- **Rebus går i kjørefeltene (uendret, utledet av rutene):** Ruta hans går i z = 13,8 og z = 11,3, mens bilene kjører i 13,5 og 11,6.
- **Ingen nettlesertester i `test/`** for varebilen, gåtene, flyttingen av byggeplasser og E-coins i spillet. Kontrollene i denne rapporten er gjort med mine egne skript utenfor repoet.
- **Standardens oversikt mangler Min Bondegård.** B3 er lagt til grunn, som før. Publiseringssjekken varsler om det samme.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil, og SwiftShader sier ikke noe om bildefrekvens.
- **Y2:** Ekte fanebytte er ikke kjørt.
- **F1, delvis:** Bilturen i ekte tid ble ikke ferdig innen 560 s i SwiftShader. Den er dekket med simulert `dt` (se over). Ny tur mens bilen er ute er ikke kjørt.
- **T3, delvis:** `prefers-reduced-motion` er ikke kjørt på nytt på denne committen. Koden er uendret siden 34623bc, men det er ikke bevis.
- **T4:** Ikke testet, og den automatiske testen (A) mangler.
- **T1 og T3 (E):** Krever ekte berøring og zoom med to fingre på iPhone og Android.
- **U2 og U3 (V):** Om barn forstår gåtene og tavla, må Even teste.
- **S4:** Kun kodelest. Ingen nye nøkler eller domener.
- **ST7:** Felles statistikk er i bruk, men versjonshendelsen mangler (se avvik).
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Jeg brukte en stubb i stedet, og milepælene er ikke testet. Om hendelsene kommer frem i GoatCounter, må en voksen med innlogging kontrollere.
- **B3:** Kun kodelest (`MB_INGEN_WEBGL`). Test på svak enhet (E) er ikke gjort.
- **B1, B2 og B4–B7:** Ikke relevante. Spillet har ingen lyd, kart, kamp, læringsfakta, app-installasjon eller fritekst.
- **V (Even):** Spillopplevelsen og om spillet er morsomt etter 10, 30 og 60 minutter.
- **Kode A uten automatisk test:** T1, T2, T3, T4, F2, F3, K2 og Y2 har ingen automatisk test utover røyktesten og den statiske suiten.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag.
- **Mørkeskogen 2.0.8:** Ikke kontrollert i denne runden (se avvik).

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil i Min Bondegård. F1–F3, med lagring fra 0.15.0 og 0.15.8, er kjørt på nytt på 3f46a28, og K3 er rettet. Ytelse, kontrast og ekte berøring er ikke testet. PR-en tar også med Mørkeskogen 2.0.8, og det må en voksen ta stilling til før sammenslåing. Vurderingen gjelder bare 3f46a28b4a7fd186eb5bf8f619c4ac47f72da381 og er ingen godkjenning av publisering.

Testserverne på 8831–8833 og alle testnettleserne er stoppet, og de midlertidige profilene er slettet. Skript, logger og uttrekk ligger i `/tmp/qa-mb3f-arb/`, klonen i `/tmp/qa-mb3f` og loggen fra `kjor.mjs` i `/tmp/qa-mb3f-kjor.log`. Repoet er ikke endret: HEAD er 3f46a28, og arbeidstreet er rent. Ingenting i rapporten bygger på lagret minne.
