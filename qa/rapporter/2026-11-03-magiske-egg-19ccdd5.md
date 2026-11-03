# EVN Game QA: Magiske egg 0.8.0
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1) (dad89dd22b82a893b3108c031a457e7dea4ba7ba), commit 19ccdd59d08f3ad0937e6e8b5d3a68bad822b7bf
Testkvittering: evn1 commit=19ccdd59d08f3ad0937e6e8b5d3a68bad822b7bf tester=f82063d20aae arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort
Nivå: full. Det er et nytt spill som skal foreslås publisert. Felles filer er også endret: forsiden, `statistikk.js` og testsiden.
Testet: lokalt på http://localhost:8765 (serveren kjørte fra før). Headless Chromium 1243 med Playwright (Python), SwiftShader uten GPU. Bildefrekvensen var omtrent 1 bilde per sekund, så alt som avhenger av spilltid gikk sakte. Størrelser: 1280×800, 1024×700 og 800×600 på PC, og 375×812, 740×360, 320×568 og 568×320 med emulert berøring. Ekte tastetrykk (Enter, piler, E, P, M, Esc, Tab), tvungne musklikk og tap. Testtilstand ble satt opp med `localStorage` og `window.__spill`: teleportering, bær og at hagen var ferdig. `localStorage` ble tømt før hver test, og hver test fikk egen nettleserprofil. Oppdraget nevner ingen standardversjon. Jeg har kontrollert mot de gjeldende avsnittene (1.0/1.1) i filen.

## Oppfylte krav
- **F1:** Start (Enter og klikk), spilling, pause, fortsett og avslutt virker. Spilt: kjøpe egg (25 → 10 mynter), klekke (Glitterkanin), mate (nivå 1 → 2), matbod (frø og mat), plante og høste, mate et sjeldent dyr med favorittmat, parknivå 2 låser opp blått egg, og sjeldent egg fra skogen til redet (klekket Stjerneugle). Røyktesten ga OK.
- **F2:** Dyr, nivå, mynter og samlebok er de samme etter omlasting. «Start helt på nytt» spør først. Esc og «Nei» beholder lagringen. «Ja» sletter bare `evn-magiske-egg-v1`, og spilletiden blir stående.
- **U1:** Startkortet har EVN-merke, mål, egen styringstekst for PC og berøring, «Versjon 0.8.0» og «← Tilbake til EVN Studio».
- **T1:** Ingen synlige trykkflater er under 44×44 px og ingen overlapper. Målt i fem størrelser på startkort, i spill, i matbod og med kart (emulert).
- **K1:** Ingen sidefeil og ingen svar på 400 eller høyere under normal bruk. Det kom bare SwiftShader-advarsler om «GPU stall». Røyktesten og K1-nettleser ga OK.
- **K3:** «Versjon 0.8.0» står på startkortet og i tittelen, og `ENDRINGSLOGG.md` har en linje for 0.8.0.
- **S1:** CSP har `object-src 'none'`, ingen `unsafe-eval`, ingen nye domener og ingen eksterne filer (statisk suite OK). three.js ligger i `vendor/`.
- **S2:** Ingen konto, chat, kjøp eller reklame (kode og kjøring).
- **S3:** Spillet har ingen fritekstfelt.
- **S4:** Personvernsiden beskriver lokal lagring og GoatCounter, og det stemmer med spillet.
- **B2:** Kartet (M og 🗺️) viser spilleren som en pil. Ingen spilletid ble lagt til mens kartet var åpent (0 ms på 2 s).
- **Y2 (delvis):** Når vinduet mister fokus (blur) eller fanen skjules, åpnes pausen med riktig tekst. Ingen spilletid i pause.
- **T4 (delvis):** Sjeldenhet vises både med tekst og farge. Kontrasten er god på knapper og piller (vurdert ut fra fargene i CSS).
- Forsiden: fem kort, tre kolonner ved 1300 px, to ved 1100 px og én ved 375 px. Ingen sideveis rulling og ingen feil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **F3, verifisert feil:** Lagring med feil struktur får spillet til å stoppe uten noen vei ut.
   - Slik gjenskapes feilen: sett `evn-magiske-egg-v1` til `{"v":1,"dyr":[null]}` eller `{"v":1,"dyr":{}}`, last siden og trykk Start. Resultatet er `TypeError` i `lastInn()` (linje 5120). Skjermen blir svart, og spillløkken, pausen og «Start helt på nytt» blir aldri satt opp. Barnet kan ikke rette dette selv.
   - Jeg har ikke klassifisert feilen som kritisk, fordi spillet selv bare skriver gyldig format, så den kan ikke oppstå ved vanlig spilling.
   - Disse virket: ugyldig JSON, et tall, v:2, ukjent dyr eller eggtype og lagring i 0.5.0-format (uten `fro`, `mat` og `hage`).
2. **K2, kjent funn («alle spill»):** Spillet har ingen global feilfanger. Feilen i punkt 1 viser at det ikke kommer noen vennlig melding eller tilbud om å laste på nytt. Feilen er ikke blitt verre.
3. **B3, verifisert feil:** Når Chromium kjøres med `--disable-webgl`, kaster `new THREE.WebGLRenderer` «Error creating WebGL context.» Startkortet blir stående, og Start gjør ingenting. Det kommer ingen melding. Lavere grafikk på svake enheter er bare delvis på plass: på berøringsskjerm er pikseltettheten begrenset til 1,5 og skyggekartet er 1024. Det er kun kodelest.
4. **B1, verifisert ved kodelesing:** Spillet lager lyd med WebAudio (`pip()`, linje 5128), men det finnes ingen lydbryter. Det er samme mangel som det kjente B1-funnet i Mørkeskogen og Fossil Zoo, men nytt for dette spillet.
5. **T2, verifisert feil:**
   - Spillet kan brukes fullt ut med tastatur.
   - Felles dialoger: Tab går ut av pausekortet (kjent funn), og også ut av «Start helt på nytt?» og «Vil du avslutte?». De to siste er felles kode av samme slag, men er ikke nevnt i det kjente funnet.
   - Nytt og spillspesifikt: Tab går ut av eggbutikken til `bokKnapp` og `evnAvslutt` bak dialogen. Eggbutikk, matbod, samlebok og klekkekort mangler `role="dialog"` og holder ikke på fokus.
6. **ST2, ST4, ST7 og ST8, verifisert ved kodelesing (felles, ikke innført av denne grenen):**
   - `statistikk.js` på grenen og på `main` er den gamle versjonen. Den lytter ikke på `evn-start` (spillet bruker en klikkoppdager). Den sender verken `versjon-…` eller `feil-…`.
   - Spilletiden teller bare på synlig fane, ikke på pause, kart, inaktivitet eller meny. `EVN-PAUSE v3` og `window.EVNAktivTid` finnes ikke i noe spill (alle bruker v2).
   - `test/statistikk/` finnes verken her eller på `origin/main` (suiten er «ikke innført»), så ST8 kan ikke kjøres.
   - Etter ST7 er dette et avvik for Magiske egg. Det gjelder trolig også de publiserte spillene.
   - Mulig problem i tillegg: `aktiv: () => spillTilstand === 'spill'` gjør at spilletiden teller mens eggbutikk, matbod eller samlebok er åpen. Det er kun kodelest.
7. **T3, mulig problem:** `gesturestart` blokkeres når `spillTilstand === 'spill'`, uten å sjekke `modalApen()` (linje 5429). På iOS kan knipe-zoom derfor være sperret i samlebok, butikk og matbod. Det må testes på iPhone.
   - Ved `prefers-reduced-motion` stopper pulsen på startknappen, men `bump`-animasjonen og 3D-effektene fortsetter.
8. **Dokumentasjon, avvik i oversikt:** Tabellen «Hvilke krav gjelder for hvert spill» i standarden mangler Magiske egg (og Dyrepatruljen). Ut fra koden gjelder **B1, B2 og B3** for Magiske egg.

## Anbefalte forbedringer
- Kontroller strukturen per felt i `lastInn()`, for eksempel med `Array.isArray(s.dyr)` og at hver `d` er et objekt. Ta en kopi av lagring som ikke kan leses, før den blir overskrevet. I dag overskriver `lagre()` den etter 5 sekunders spill (kun kodelest).
- Mobil (375 og 320): hjelpeteksten «Dra fingeren for å gå» dekkes delvis av den gule handlingsknappen de første 15 sekundene.
- `#hjelp` er tom men synlig som en grå klump nederst til venstre på startskjermen.
- Samleboka er høyere enn skjermen (947 px ved 812 px skjermhøyde). «Lukk» krever rulling på mobil.
- «Start helt på nytt» vises bare når det finnes dyr eller egg. Har man bare kjøpt frø eller mat, kan fremgangen ikke nullstilles.
- `index.html` er 870 kB, av det 619 kB base64 med roboten. En egen `.glb`-fil kan bufres og deles med andre spill. CSP tillater allerede `'self'`.
- Prikkene for bær og sjeldenhet i kartet skilles bare med farge. De er ikke kritiske.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt, og SwiftShader ga omtrent 1 bilde per sekund, som ikke sier noe om ekte enheter (E).
- **Y2, skjermfrekvens:** Koden bruker `dt` med tak på 0,05 s. Det er kun kodelest. Under 20 bilder per sekund går spillet langsommere med vilje.
- **T1, T3, B1 og B3 på enhet (E):** Ekte berøring med styrespak (dra), knipe-zoom på iOS og Android, lyd og lavere grafikk på svak enhet.
- **U2, U3 og opplevd vanskelighetsgrad (V):** Om barn forstår parknivå, stjerner og «spiser bare …», og om økonomien føles rettferdig. Det må Even teste.
- **ST1:** At spillet sender `evn-start` er kun kodelest (linje 5493). **ST3, ST5 og ST6** er kun kodelest: bare evnstudio.no, godkjente navn, start og milepæler én gang hver, ingen informasjonskapsler eller ID. Testsiden `test/statistikk/` mangler, så ingenting av dette er kjørt. Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging se.
- **UI1–UI10:** Ikke tatt i bruk for spillet (godkjent hovedløsning) og derfor ikke kontrollert. UI-suiten er «ikke innført».
- **B4–B7:** Gjelder ikke. Spillet har ikke kamp eller skrekk, ikke læringsinnhold med fakta, ikke app-installasjon og ikke fritekst.
- **Automatiske tester (A) som mangler:** F2, F3, T2 fokus, T4, Y2, K2, B1, B2, B3, S2 og S3 har ingen automatisk test ennå.
- Lange økter og lekkasje av minne eller teksturer er ikke testet.
- Testserveren på port 8765 var startet før kontrollen og ble ikke stoppet av meg. Testnettleserne er lukket, og arbeidstreet er rent.

## Klar for testing hos Even?
JA MED FORBEHOLD. F1 er testet og ingen kritiske feil ble funnet, så Even kan prøve spillet. Før publisering bør F3-krasjet, B3-meldingen, lydbryteren (B1) og statistikkgrunnlaget (ST2, ST4, ST7, ST8, felles) håndteres. Y1 og alle enhetstester mangler.
