# EVN Game QA: Min Bondegård 0.15.0
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 27d7f7b3329cab22ddeeb0f1eb97f7b918e2b2f4
Testkvittering: evn1 commit=27d7f7b3329cab22ddeeb0f1eb97f7b918e2b2f4 tester=23cdfc1be814 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full. Dette er kontrollen før publisering. Siden forrige rapport (0.9.0, 21511c3) er det kommet 36 commits med ny spillogikk, nye felt i lagringen (gaver, rebus, omrader, plasser), E-coins gjennom felles `ecoins.js` og en ny varebil.
Testet: Lokalt i Chrome headless (`/usr/bin/google-chrome`, WebGL via SwiftShader), styrt over DevTools-protokollen.
- **Grenen endret seg under kontrollen.** `spill/min-bondegard` fikk tre nye commits mens jeg testet: 5a9a025 (0.15.1), 6a2b182 (0.15.2) og f673b48. Alle kjøretidstester gikk derfor mot et uttrekk av 27d7f7b (`/tmp/qa-mb15/v0150`, port 8801), og jeg kontrollerte at tittelen viste 0.15.0. Lagring fra forrige versjon ble laget i et uttrekk av 35a212c (0.14.1, port 8802). `test/kjor.mjs` var ferdig før 0.15.1 ble committet. Én tidlig kjøring traff 0.15.2 i arbeidstreet, og den er forkastet.
- **Metode:** Mus, berøring og tastetrykk var syntetiske hendelser fra nettleseren. Testtilstanden ble satt opp med `window.__spill` i egne, midlertidige profiler, og `localStorage` ble tømt før og etter.
- **Størrelser:** 1280×800 (mus), og 375×812, 740×360, 320×568 og 568×320 (emulert berøring). Varebilens hele tur ble kjørt i 480×320 for å få raskere bilder.
- **Node:** `logikk.test.mjs` ga 109 ok og 0 feil. `sim.mjs 100 11` nådde nivå 10 etter 35,5 min (aktiv) og 38,7 min (barn) i 100 av 100 kjøringer, med 0 fastlåst.

## Oppfylte krav
- **F1:**
  - Tab går rett til Start, og Enter starter spillet. P og Esc åpner og lukker pausen, og Fortsett virker. Avslutt spør først, og «Nei, spill videre» blir i spillet. «Ja, avslutt» ble ikke trykket.
  - På nivå 4 åpner et klikk på varebilen bestillingstavla. På nivå 1 viser klikket «Dette er varebilen din. Fra nivå 4 …».
  - En levering sender bilen hele veien: ut gårdsveien, borte, inn og rygging tilbake til samme plass med rotasjon 0. Turen tok 721 s i SwiftShader.
  - Bilen står stille i pause (samme posisjon etter 3 s).
  - Gåten, tavla og gaveesken åpnes uten feil. Ingen kjøring hang.
- **F2:**
  - Nivå, mynter og XP er like etter omlasting, og knappen sier «▶ Til gården».
  - Nullstilling spør «Starte helt på nytt?» med fokus på «Nei, behold alt». «Nei» beholder alt. «Ja» sletter hovedlagringen, `-kopi` og `-kopi2`.
- **F3:**
  - **Lagring fra 0.14.1 på nivå 10, med Enga og Skogkanten:** nivå, XP, 48 200 mynter, lageret og områdene er beholdt. Ingen kopi lages, og konsollen er tom.
  - **Bakeriet flyttet til varebilens plass (0.14.1):** bakeriet blir stående. Varebilen får en ledig plass (−10; 2,45) uten overlapp.
  - **Ødelagt JSON:** spillet starter og gir en melding. Originalen ligger i `-kopi`.
  - **Feil typer** (`gaver`, `rebus`, `best` og `plasser.varebil` = 999/−999): spillet starter uten feilkort.
- **U1:** Startkortet har mål, styring for PC og berøring, Start, «← Tilbake til EVN Studio» og «Versjon 0.15.0». Alt er synlig i alle fem størrelsene.
- **T1 (emulert):** Ingen synlig knapp er under 44×44 px på startkortet, i spillet på nivå 10, i tavla eller i gåten, i alle fem størrelsene. Ingen størrelse gir sideveis rulling.
- **T2:** Tab går rundt i pausen (Slik styrer du → Avslutt → E-shop → Fortsett). Esc lukker tavla. T åpner tavla, og Enter leverer.
- **T3:**
  - Zoom er OK i den statiske suiten.
  - Med emulert `prefers-reduced-motion` spretter varebilen der den står i stedet for å kjøre, og leveringen telles. Rebus flytter seg rett hjem uten å gå.
- **K1:** Røyktesten er OK. Ingen ufangede feil, 404 eller eksterne forespørsler i noen av mine kjøringer, bortsett fra feilene jeg kastet med vilje.
- **K2:** En kastet feil etter Start gir «Oi, noe gikk galt» med fokus på «Last på nytt», og Tab blir der.
- **S1:** Den statiske suiten er OK. CSP er uendret siden 0.8.9. Det nye skriptet er `../../ecoins/ecoins.js` fra samme domene.
- **S2:** E-coins tjenes bare i spillet og lagres lokalt. Gaveeskene kan ikke kjøpes. Ingen konto, chat, reklame eller ekte penger.
- **S3:** Spillet har ingen fritekst.
- **E-coins (0.14.0):**
  - Lagring på nivå 10 gir 60 ved avstemming, og fortsatt 60 etter omlasting.
  - Nivå 9 gir 20. Nivå 10 nådd i spillet gir 40 til, og nivåkortet viser «🪙 40 E-coins til roboten».
  - `?test` gir ingen E-coins.
  - Regeltabellen i `ecoins.js` er lik den på `felles/ecoins-min-bondegard` (diff er tom). EC1–EC5 er OK.
- **ST1:** Statistikken ble kjørt med evnstudio.no omdirigert til lokal server og GoatCounter erstattet av en stubb.
  - Ingen hendelse før Start.
  - `start-min-bondegard` sendes én gang, også med en ekstra `evn-start`.
  - En levering gir ingen hendelse.
  - `statistikk.js` er uendret.
- **ST3:** Ingen statistikkforespørsler på 127.0.0.1.
- **ST5:** Bare godkjent navn ble observert.
- **ST6:** `document.cookie` er tom, og koden har ingen ID.
- **Rebus' gange (0.15.0):** Når han går, er klippet «Walking» med `timeScale` 1,3 og fart 1,2. `hilsRev` midt i gangen avbryter ham ikke.
- **Rettet fra forrige rapport (verifisert):**
  - 📋-knappen vises ikke på nivå 1 (skjermbilde 1280×800).
  - Tavla er lesbar i 320×568: kortet går fra 16 til 304 px, og hver bestilling har egne linjer.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **K3, verifisert feil: 0.15.0 mangler i `ENDRINGSLOGG.md` og i README.**
  - Versjonen står riktig i tittelen, på startkortet og i `MB_VERSJON`.
  - Raden for Min Bondegård i `ENDRINGSLOGG.md` slutter med «0.14.1 katten heter Blomst».
  - README-lista har ikke 0.15.0. 0.9.4–0.13.0 beskriver fortsatt «lastebilen».
  - **Slik gjenskaper du:** `git show 27d7f7b --stat` endrer bare `index.html` og `spill.js`.
- **ST2, kjent avvik i felles kode (uendret):** Spilletiden teller også pause, fordi EVN-PAUSE v3 ikke finnes. Spillets egen `aktiv` er usann med tavla åpen (verifisert).
- **ST4 og versjonshendelsen (ST7), kjent avvik i felles kode (uendret, statisk):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.15.0`.

## Anbefalte forbedringer
- **Verifisert feil (ikke et standardkrav): en byggeplass kan havne oppå siloen.**
  - **Slik gjenskaper du:** Ny gård, sett nivået til 9 i lagringen og last på nytt. Kjøkkenets byggeplass får (0,45; −8,8) og overlapper siloen på (−0,4; −10). Det samme skjer på nivå 10 og i alle fem størrelsene. På skjermbildet står 🔨 på siloen.
  - **Årsak:** `plasserAlt()` plasserer bygg med `x === null` før siloen er lagt i `ting` ved innlasting.
  - **Når det skjer:** Ved opp-nivå inne i spillet skjer det ikke (testet til nivå 7). Det kan skje med lagring fra en versjon før bygget fantes.
  - **Forslag:** opprett siloen før bygg-løkka.
- **Teksten på tavla sier fortsatt «Lastebilen henter dem. 🚚»** (`index.html:261`), mens meldingen sier «Varebilen kjører ut». Tekstene sier noe forskjellig.
- **Varebilens plass er ikke lagret og avhenger av hva som står på gården.** Bilen sto på (−10,05; 5,2) på nivå 1, (−12,8; 5,45) på nivå 4 og (−10; 2,45) med bakeriet på standardplassen. På skjermbildene står den tett bak markedsbua. Even bør se om det ser riktig ut.
- **En ny levering mens bilen er ute gir ingen ny tur.** `bilKo.n` nullstilles når bilen kommer hjem. Belønningen gis likevel (levert gikk til 2).
- **Gåtekortet går 9 px utenfor skjermen på hver side i 375 og 320 bredde** (−9 til 384 og −9 til 329). Innholdet kan leses.
- **Gaveesker med sjeldenhet, sjanser og daglig gave er godkjent av Ivar 14.11.** Det er ikke et brudd på standarden. Prosjektinstruksen sier likevel at gamblinglignende mekanikker skal unngås. En voksen bør se på det på nytt før offentlig publisering.
- **Fletting:** `git merge-tree` gir konflikt i `ENDRINGSLOGG.md` når `felles/ecoins-min-bondegard` flettes inn i 27d7f7b. `ecoins.js` og `test/ecoins` er like på begge grenene. Fletting mot `origin/main` går rent.
- **Ingen automatisk test i nettleser** for varebilen, gaveeskene, gåtene eller E-coins i spillet. Logikken har 109 tester.
- **Oversikten «Hvilke krav gjelder for hvert spill» i standarden mangler fortsatt Min Bondegård.** Jeg har lagt B3 til grunn.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt. SwiftShader ga 0,5–2 s per bilde.
- **Y2:** Blur gir pause (syntetisk). Ekte fanebytte er ikke kjørt. At hastigheten ikke avhenger av skjermfrekvensen, er kun kodelest (bil og Rebus bruker `dt`).
- **T3 (E):** Knip med to fingre på faktisk enhet.
- **T4:** Ikke testet. Ingen kontrastberegning, og den automatiske testen (A) mangler.
- **U2 og U3 (V):** Tekstene er korte og på enkel norsk etter min vurdering, bortsett fra lastebil-teksten over. Om barn forstår gåtene, gaveeskene og varebilen, må Even teste.
- **S4:** Kun kodelest. Personvernsiden omtaler lokal lagring og `evn-ecoins-v1` generelt, og spillet har ingen nye nøkler utover `evn-min-bondegard-v1`, `-kopi`, `-kopi2` og `-test`.
- **ST7:** Spillet bruker felles statistikk. Versjonshendelsen mangler, se avvik.
- **ST8:** `test/statistikk/` finnes ikke (kjor: «ikke-innfort»). Jeg brukte en erstatning med omdirigert vert og en stubb for GoatCounter. Milepælene er ikke testet. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **B3:** Kun kodelest (`MB_INGEN_WEBGL` og melding på startkortet). Lavere grafikk på svake enheter krever enhet (E).
- **B1, B2 og B4–B7:** Vurdert som ikke relevante. Spillet har ingen lyd, kart, kamp, læringsfakta, app eller fritekst. Gåtene er enkle hverdagsfakta og er ikke kontrollert som læringsinnhold.
- **E (faktisk enhet):** T1, T3 og B3, og trykk på varebilen og gåtekortet med ekte finger på iPhone og Android.
- **V (Even):** Varebilens kjøring og rygging, Rebus' nye gange, gaveeskene, gåtene, Enga, Skogkanten og grisene, og om spillet er morsomt etter 10, 30 og 60 minutter.
- **Kode A uten automatisk test:** T1, T2, T3, T4, F2, F3, K2 og Y2 har ingen automatisk test utover røyktesten og den statiske suiten.
- **UI1–UI10 og klarspråk:** UI1–UI10 er ikke tatt i bruk for spillet, og klarspråk har status forslag. Ingen av dem er kontrollert.
- **0.15.1, 0.15.2 og f673b48:** Committet under kontrollen. De er ikke kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1 er testet uten kritiske feil, og lagring fra 0.14.1 og E-coins virker. Før publisering må 0.15.0 inn i `ENDRINGSLOGG.md` og README (K3), og ytelse og ekte berøring er ikke testet på enhet. Vurderingen gjelder bare 27d7f7b, ikke 0.15.1 eller 0.15.2.

Testserverne på 8801 og 8802 og alle testnettleserne er stoppet. Skript, logger og skjermbilder ligger i `/tmp/qa-mb15/` (`skript/`, `*.log`, `bilder/`), og uttrekkene i `/tmp/qa-mb15/v0150` og `/tmp/qa-mb15/v0141`. Alt ligger utenfor repoet. Jeg har ikke endret repoet: `git status` er ren, og de nye commitene kom fra en annen økt. Ingenting i rapporten bygger på lagret minne.
