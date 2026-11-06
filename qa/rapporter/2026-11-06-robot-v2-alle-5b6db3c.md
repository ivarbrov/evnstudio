# EVN Game QA: Era Defenders 0.21.3 og Fiskespillet 0.6.2 (EVN-roboten v2 og startbildene)
Grunnlag: agent 2.2, standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 5b6db3c715271e6ae60b2602c0c9b8e3079d1ee5
Testkvittering: evn1 commit=5b6db3c715271e6ae60b2602c0c9b8e3079d1ee5 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert. Siden 7cd0f34 er bare ENDRINGSLOGG.md (én rad) og `qa/` endret. Likevel er F1–F3, mobil og startbildene kjørt på nytt på denne commiten, fordi resultater fra en tidligere commit ikke kan brukes som bevis.
Testet:
- Miljø: Windows 11. Arbeidstreet var rent på 5b6db3c før og etter testene. origin/main (c016515) er en forfar av HEAD.
- Diff 7cd0f34..5b6db3c: bare ENDRINGSLOGG.md (1 linje flyttet og endret) og `qa/rapporter/2026-11-06-robot-v2-alle-7cd0f34.md`. Ingen spillfil, felles fil, `test/` eller `.claude/` er endret.
- Automatiske tester: `node test/kjor.mjs --base origin/main` i headless Chrome ga 73 ok, 0 feil, 0 varsel og 2 ikke innført.
- Manuell test: `python -m http.server` på 127.0.0.1:8975, nettleserpanelet (Chromium) i 800×600, og emulert 375×812 og 740×360.
- Metode: ekte museklikk og ekte tastetrykk (Space, P, Enter, Esc, M, Tab og W). `javascript_tool` ble bare brukt til å måle og til å sette opp lagring. Lagringen ble skrevet fra `/test/` på samme opphav.
- `localStorage` ble tømt før og etter testene.

Merk om grunnlaget: Oppdraget nevner ingen standardversjon. Jeg har kontrollert mot de gjeldende kravene (1.0, 1.1 og S2). UI1–UI10 er ikke tatt i bruk i spillene, og klarspråk har status forslag. Ingen av dem er kontrollert. Fiskespillet mangler fortsatt i standardens oversikt per spill (kjent). B1, B2 og B3 er gjort rede for, fordi spillet har lyd, kart og 3D.

## Oppfylte krav
- **ENDRINGSLOGG.md (endringen i denne commiten):**
  - Grenens rad står nå øverst, over Mørkeskogen 2.0.5.
  - Datoen er 2026-11-06 med merknad om publisering ved PR #52.
  - Innholdet ellers er identisk med forrige rad.
  - Ingen konfliktmarkører. Dette retter anbefalingen fra forrige rapport.
- **F1:**
  - Era Defenders: start med klikk og slag med Space. P pauser og Enter fortsetter. «Avslutt» og «Ja, avslutt» går til forsiden.
  - Fiskespillet: start med klikk og kjøring med W. Esc og P pauser, og Enter fortsetter. «Avslutt» i pausekortet og «Ja, avslutt» går til forsiden.
  - Røyktesten er OK for alle fire spillene.
- **F2:**
  - Era Defenders: Piratskipet, nivå 3 og 123 mynter var der etter omlasting («Fortsetter der du slapp»), også etter Avslutt. «Nei, behold alt» beholdt lagringen (verden 4). «Ja, slett alt» satte `evn-eventyrspill-v1` til null, og spillet startet i Steinalderen.
  - Fiskespillet: 777 penger og lyd av var der etter omlasting. «Nei, behold alt» beholdt 777. «Ja, slett alt» slettet både `evn-fiskespillet-v1` og `-kopi`, og lydvalget ble beholdt.
  - «Start helt på nytt» er riktig skjult når det ikke finnes noen fremgang (`harLagring`).
- **F3:**
  - `{ødelagt` i Era Defenders: spillet starter i Steinalderen uten konsollfeil.
  - `{ødelagt` i Fiskespillet: spillet starter, originalen er tatt vare på i `evn-fiskespillet-v1-kopi`, og det er ingen konsollfeil.
- **Robot v2:**
  - Fiskespillet henter `ecoins/helt-robot-v2.glb` med 200, og roboten står på flåten (skjermbilde).
  - Era Defenders viser piratutstyret (hatt og sverd) på den nye roboten i tidsepoke 4.
- **Startbildene:**
  - Era Defenders viser `robot-start-kamp-260` og Fiskespillet `robot-start-vink-260` i 375×812.
  - Dyrepatruljen viser `robot-start-vink-260`.
  - Alle er lastet (`complete`) uten konsollfeil.
- **B1 (FS):** Lyd av (`evn-fiskespillet-lyd`=av) huskes etter omlasting og etter nullstilling. Ikonet viser at lyden er av.
- **B2:**
  - Era Defenders: M åpner kartet med spiller, monstre og base. `tilstand` er «pause» mens det er åpent, og Esc lukker det.
  - Fiskespillet: M åpner kartet med markør for spilleren.
- **U1 og K3:**
  - Startkortene og fanetitlene viser 0.21.3 og 0.6.2.
  - Røyktesten fant versjonene 0.21.3, 2.0.5, 0.11.5 og 0.6.2.
  - Endringsloggen stemmer med innholdet.
- **K1:** Røyktesten fant ingen feil, CSP-brudd eller 404. Konsollen var tom for feil i alle mine kjøringer.
- **S1:** Den statiske testen er OK for alle spillene. Det er ingen nye domener.
- **T3 (zoom):** Den statiske testen er OK.
- **Mobil (emulert):** Ingen sideveis rulling (scrollWidth = innerWidth).
  - 375×812: Start er synlig i Era Defenders (553–620 px) og i Fiskespillet (479–552 px).
  - 740×360: Start er synlig i Era Defenders (293–347 px) og i Fiskespillet (248–319 px).
- **ST3:** `statistikk.js` linje 22 sender bare fra evnstudio.no (kode).
- **ST6:** Ingen cookie, Storage eller ID i `statistikk.js` (kode).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **ST1, ST2, ST4 og ST7, begge spillene. Kjent og ikke innført av grenen.** `statistikk.js` (112 linjer) er uendret fra main. Den lytter ikke på `evn-start`, kobler ikke spilletiden til pausen og sender ingen versjons- eller feilhendelser. ST8 kan ikke kjøres, fordi `test/statistikk/` mangler («ikke-innfort» i kvitteringen).
2. **T2, Era Defenders. Kjent, verifisert på nytt.** Åpne «Avslutt» og trykk Tab 3 ganger. Fokus havner på `#baseKnapp` utenfor dialogen. Dette er ikke verre enn før.
3. **Kjente funn, uendret og ikke testet på nytt:**
   - K2: global feilfanger mangler i Era Defenders.
   - S3, S4 og B7 i Era Defenders: basenavnet (mulig problem).
4. **Mulig problem i standarden (kjent):** Oversikten per spill mangler Fiskespillet og viser fortsatt Fossil Zoo og Magiske egg.

## Anbefalte forbedringer
- **Kjent, uendret:**
  - `robot-start-jubel-130` og `robot-start-vink-260` er 1 px bredere enn før.
  - WebP-lagene i Era Defenders har en ICC-profil som kan fjernes.
  - Versjonen hopper fra 0.21.0 til 0.21.3. Det er nå forklart i loggraden, så dette er løst.

## Kontroller som ikke kunne utføres
Status per gjeldende krav. ED = Era Defenders (B2, B4, B6, B7) og FS = Fiskespillet (B1, B2, B3, uavklart).
- **F1:** Oppfylt i begge spillene. Lang spilling, tap og fullført epoke er ikke testet i denne kjøringen.
- **F2:** Oppfylt i begge spillene.
- **F3:** Ødelagt lagring er Oppfylt i begge. «Lagring fra forrige versjon» er Kun kodelest, fordi lagringsformatet ikke er endret.
- **U1:** Oppfylt.
- **U2 og U3:** Ikke testet utover startkortet (V).
- **T1:** Ikke testet. Trykkflatene er ikke målt (A, E).
- **T2:** Avvik (kjent) i ED. FS er ikke testet på nytt.
- **T3:** Zoom er Oppfylt. `prefers-reduced-motion` er Kun kodelest.
- **T4:** Ikke testet.
- **Y1:** Ikke testet. Referansemobil er ikke valgt (E).
- **Y2:** Ikke testet.
- **K1:** Oppfylt.
- **K2:** Avvik (kjent) i ED. Kun kodelest i FS.
- **K3:** Oppfylt.
- **S1:** Oppfylt.
- **S2:** Kun kodelest. Ingen endring.
- **S3:** Kun kodelest. Ingen endring.
- **S4:** Ikke testet (ikke berørt).
- **ST1:** Avvik (fantes før).
- **ST2:** Avvik (fantes før).
- **ST3:** Oppfylt (kode).
- **ST4:** Avvik (fantes før).
- **ST5:** Kun kodelest.
- **ST6:** Oppfylt (kode).
- **ST7:** Avvik (fantes før).
- **ST8:** Kunne ikke utføres, fordi `test/statistikk/` mangler.
- **GoatCounter:** Om hendelsene kommer frem, krever en voksen med innlogging.
- **B1 (FS):** Husking av lydvalget er Oppfylt. Faktisk lyd krever manuell test (E).
- **B2:** Oppfylt i ED. I FS er kartet sett, men at spillet står stille med kartet åpent er Kun kodelest.
- **B3 (FS):** Ikke testet. Meldingen uten WebGL og lavere grafikk krever test på enhet (E).
- **B4 (ED):** Ikke testet (V).
- **B6 (ED):** Kun kodelest (sw-cache v0.33). Service workeren registreres bare på https (E).
- **B7 (ED):** Ikke testet (kjent mulig problem).
- **Utstyr i spillet:** Bare tidsepoke 4 er sett i spillet i denne kjøringen. Spritarket er byte-likt med 7cd0f34, så bildeanalysen er ikke gjentatt.
- **Krever Even (V) og ekte enhet (E):**
  - v2-roboten i bevegelse og i alle epoker
  - roboten på flåten
  - berøring på iPhone og Android
- **Testservere:**
  - Serveren min på 127.0.0.1:8975 (python.exe, PID 41792) kunne ikke stoppes. Både `taskkill` og `Stop-Process` ga «Ingen tilgang». Den må stoppes manuelt.
  - Serveren fra forrige kontroll på 127.0.0.1:8973 (PID 28676) kjører også fortsatt.

## Klar for testing hos Even?
JA MED FORBEHOLD – Commiten endrer bare rekkefølge og dato i ENDRINGSLOGG.md, og det stemmer nå. F1, F2 og F3 er testet på nytt på 5b6db3c i begge spillene uten nye feil. Forbeholdene er de kjente statistikkavvikene (ST8 kunne ikke kjøres), T2 og K2 i Era Defenders, og at Y1, Y2, B3, B6 og test på ekte enhet ikke er utført.
