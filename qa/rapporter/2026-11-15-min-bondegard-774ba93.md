# EVN Game QA: Min Bondegård (min-bondegard) 0.15.11, med forsiden og E-coins-regeltabellen
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 774ba930407f96567ae1d804badef4728c6a7e92
Testkvittering: evn1 commit=774ba930407f96567ae1d804badef4728c6a7e92 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – kontrollen gjøres før publisering, og et nytt spill skal ut på nettsiden. 774ba93 slår sammen main (9eaa454) inn i grenen. `spill/min-bondegard`, `index.html`, `bilder`, `ecoins`, `statistikk.js`, `test` og `.claude` har samme trehash som på 3f46a28. `spill/morkeskogen` har samme trehash som på main. Alle kjøringer under er likevel gjort på nytt mot 774ba93.
Testet:
- **Klone:** En ren klone av 774ba93 i `/tmp/qa-mb774`, servert på port 8831. I klonen peker `origin/main` på 9eaa454, som er main i det ekte repoet. For F3 ble uttrekk av 0.15.0 (port 8832) og 0.15.8 (port 8833) brukt.
- **Nettleser:** Chrome headless med SwiftShader, styrt over DevTools-protokollen. Tastatur, mus og berøring var syntetiske hendelser. Testtilstanden ble satt opp med `window.__spill` i egne, midlertidige profiler, og `localStorage` ble tømt før og etter.
- **Størrelser:** 1280×800 med mus. 375×812, 740×360, 320×568 og 568×320 med emulert berøring. Forsiden er testet i 1280×800, 375×812 og 320×568.
- **Node:**
  - `test/kjor.mjs` ga 99 ok, 0 feil og 0 varsler.
  - `logikk.test.mjs` ga 111 ok og 0 feil.
  - `sim.mjs 100 11` nådde nivå 10 etter 35,1 min (aktiv spiller) og 38,0 min (barn), i 100 av 100 kjøringer, med 0 fastlåst.
  - Lokalt gir `publiseringssjekk.mjs` bare de forventede feilene (rapporten for 774ba93 mangler, og PR-en endrer `test/`). Den nevner ikke lenger Mørkeskogen.

## Oppfylte krav
- **F1:**
  - Tab går til Start, og Enter starter spillet. P åpner pausen, Esc lukker den, og Fortsett virker.
  - Avslutt spør først, og «Nei, spill videre» blir i spillet.
  - På nivå 1 gir klikk på varebilen en forklaring. På nivå 4 åpner klikket tavla, og en levering setter bilen i gang.
  - Bilen står stille i pause (z = 2,91 før og etter).
  - Hele bilturen er simulert ved 30, 60 og 144 bilder per sekund. Den tar 28, 28 og 27,9 s, ender på (−5,5; 1,7) og treffer ingenting.
- **F2:** Lagringen er den samme etter omlasting. Nullstilling spør «Starte helt på nytt?» med fokus på «Nei, behold alt». «Nei» beholder lagringen, og «Ja» sletter alle nøklene. Testet i 1280×800 og 375×812.
- **F3:**
  - **Lagring fra 0.15.0 og 0.15.8 på nivå 10:** Nivå, XP, 48 200 mynter, lager og områder er beholdt. E-coins er 60, også etter ny omlasting. Tavla står på (−2,3; 4,6). Ingen overlapp, ingen feilkort og tom konsoll.
  - **Gåte uten varen på lager:** Feil svar gir «Nei, det er ikke …». Riktig svar gir mynter (13 og 16).
  - **Ødelagt JSON:** Spillet starter med en melding, og originalen er tatt vare på.
  - **Felt med feil type:** Spillet starter uten feilkort.
  - **Kjøkkenplassen:** En lagring fra 0.15.0 der den ligger oppå siloen, får `x = null`. Etter kjøp av Enga og omlasting kommer plassen på (20; 7,7), og kjøkkenet kan kjøpes.
- **Gåtene:** Det ble laget 525 gåtekort. Svaret var alltid med, det var ingen dubletter, og svaret var aldri den eneste varen spilleren manglet.
- **U1:** Startkortet har mål, Start, «Tilbake» og «Versjon 0.15.11». I 568×320 kan kortet rulles, og Tab når «Tilbake» på andre trykk.
- **T1 (emulert):** Ingen synlige knapper under 44×44 px på startkortet, gården på nivå 10, tavla eller gåten, i alle fem størrelsene. Ingen sideveis rulling, og ingen overlapp mellom ting på nivå 10.
- **T2:** Tab går rundt i pausen (Slik styrer du → Avslutt → E-shop → Fortsett). På forsiden når Tab spillkortet etter 6 trykk, med fokusramme (3 px).
- **T3:**
  - Zoom er OK i den statiske suiten.
  - Med emulert `prefers-reduced-motion: reduce` har startkortet `animation: none`, og spillet starter uten feil.
- **K1:** Røyktesten er OK for alle seks spillene. Konsollen var tom, bortsett fra feil jeg kastet med vilje. Ingen 404 og ingen eksterne forespørsler fra spillet.
- **K2:** Etter en kastet feil vises «Oi, noe gikk galt 🐔» etter cirka 1 s, med fokus på «Last på nytt», og Tab blir der. Testet i 1280×800 og 375×812.
- **K3:** Startkortet, `&lt;title&gt;` og raden i `ENDRINGSLOGG.md` sier alle 0.15.11. Sammenslåingen beholdt alle radene fra main.
- **S1:** Den statiske suiten er OK. CSP tillater bare `self` og GoatCounter.
- **S2:** Ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK (EC1).
- **S3:** Spillet har ingen fritekst.
- **ST1, ST3, ST5 og ST6:** Testet med evnstudio.no omdirigert til den lokale serveren og GoatCounter byttet ut med en stubb. Ingen ekte forespørsler gikk ut.
  - Ingen hendelse før Start.
  - `start-min-bondegard` kommer én gang, også med en ekstra `evn-start` og etter en levering.
  - `document.cookie` er tom, og det kom ingen andre forespørsler.
  - `data-spill="min-bondegard"` er satt, og `evn-start` sendes (`spill.js:1444`).
  - `statistikk.js` linje 24 sender bare på evnstudio.no.
- **Forsiden:**
  - Min Bondegård er det første av seks spillkort, og bildet lastes i alle tre bredder.
  - Klikk på kortet åpner `/spill/min-bondegard/`.
  - Nyhetene viser 15.11, 5.11 og 3.11.
  - Ingen sideveis rulling.
- **E-shop:** Lommeboka viser «Min Bondegård 0 av 2 klart, 60 E-coins igjen å tjene».
- **Rettet siden forrige rapport:** PR-en tar ikke lenger med Mørkeskogen. `spill/morkeskogen` på 774ba93 er lik main (9eaa454), og `git diff origin/main HEAD` utenfor `qa/` gjelder bare filene som er nevnt i oppdraget.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST2, kjent avvik i felles kode (uendret):** Spilletiden teller også pause, fordi EVN-PAUSE v3 ikke finnes.
- **ST4 og ST7, kjent avvik i felles kode (uendret, kun kodelest):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.15.11`.
- **Publiseringssjekken (lokal), ikke et brudd på standarden:** PR-en endrer tester (`test/ecoins/index.html`, `test/index.html` og `test/min-bondegard/*`). Eieren må gå gjennom dem og eventuelt slå sammen med unntak.

## Anbefalte forbedringer
- **Rekkefølgen i `ENDRINGSLOGG.md`:** Etter sammenslåingen står raden for Mørkeskogen 2.0.9 (15.11) under Min Bondegård-raden fra 9.11. Lista er derfor ikke lenger i datorekkefølge.
- **Rebus går i kjørefeltene (uendret):** Ruta hans går i z = 13,8 og 11,3, mens bilene kjører i 13,5 og 11,6.
- **Ingen nettlesertester i `test/`** for varebilen, gåtene, flyttingen av byggeplasser og E-coins i spillet. Kontrollene i denne rapporten er gjort med mine egne skript utenfor repoet.
- **Standardens oversikt mangler Min Bondegård.** B3 er lagt til grunn, som før. Publiseringssjekken varsler om det samme.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil, og SwiftShader sier ikke noe om bildefrekvens.
- **Y2:** Ekte fanebytte er ikke kjørt.
- **F1, delvis:** Bilturen i ekte tid ble ikke ferdig innen 560 s i SwiftShader. Den er dekket med simulert `dt`. Ny tur mens bilen er ute er ikke kjørt.
- **T3, delvis:** Bilens og kundens kortere vei med redusert bevegelse er bare kodelest (`spill.js:342` og `565`).
- **T4:** Ikke testet, og den automatiske testen (A) mangler.
- **T1 og T3 (E):** Krever ekte berøring og zoom med to fingre på iPhone og Android.
- **U2 og U3 (V):** Om barn forstår gåtene og tavla, må Even teste.
- **S4:** Kun kodelest. Ingen nye nøkler eller domener.
- **ST7:** Versjonshendelsen mangler (se avvik).
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Jeg brukte en stubb i stedet, og milepælene er ikke testet. Om hendelsene kommer frem i GoatCounter, må en voksen med innlogging kontrollere.
- **B3:** Kun kodelest (`MB_INGEN_WEBGL`). Test på svak enhet (E) er ikke gjort.
- **B1, B2 og B4–B7:** Ikke relevante. Spillet har ingen lyd, kart, kamp, læringsfakta, app-installasjon eller fritekst.
- **V (Even):** Spillopplevelsen og om spillet er morsomt etter 10, 30 og 60 minutter.
- **Kode A uten automatisk test:** T1, T2, T3, T4, F2, F3, K2 og Y2 har ingen automatisk test utover røyktesten og den statiske suiten.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet, og klarspråk har status forslag.
- **Mørkeskogen 2.0.9:** Ikke kontrollert her. Den er lik main og har sin egen rapport der.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. F1–F3, med lagring fra 0.15.0 og 0.15.8, er kjørt på nytt på 774ba93, og PR-en tar ikke lenger med Mørkeskogen. Ytelse, kontrast og ekte berøring er ikke testet. Vurderingen gjelder bare 774ba930407f96567ae1d804badef4728c6a7e92 og er ingen godkjenning av publisering.

---

Testserverne på 8831–8833 og alle testnettleserne er stoppet, og de midlertidige profilene er slettet. Repoet er ikke endret: HEAD er 774ba93, og arbeidstreet er rent. Ingenting i rapporten bygger på lagret minne.

Filene ligger her:
- Klonen: `/tmp/qa-mb774`
- Skript og logger: `/tmp/qa-mb774-arb/`
- Loggen fra `kjor.mjs`: `/tmp/qa-mb774-kjor.log`
