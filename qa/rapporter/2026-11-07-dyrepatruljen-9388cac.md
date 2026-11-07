# EVN Game QA: Dyrepatruljen 0.11.6 (pilot, EVN-PAUSE v3), ny kontroll etter retting
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 9388cac12368869e62494a1fc3b6a5b0ef049b1e
Testkvittering: evn1 commit=9388cac12368869e62494a1fc3b6a5b0ef049b1e tester=675e701e13bf arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: høy – endringen er i felles kode (`felles/ui/evn-pause-v3.js`). Den er liten: tre punkter og 10 linjer. Bare Dyrepatruljen bruker v3. De andre spillene har v2, se INFO-linjene i testsuiten. Derfor er bare Dyrepatruljen kontrollert.
Testet:
- **Commit:** HEAD er 9388cac. Den legger bare til forrige QA-rapport oppå ffb8c8f, som er siste kodeendring. Alt er kjørt på nytt mot denne committen. Ingen resultater fra 632a7fe er brukt som bevis.
- **Testsuite:** `node test/kjor.mjs` med google-chrome ga 151 ok, 0 feil, 0 varsel og 2 ikke innført.
- **Testserver:** egen server på 127.0.0.1:8768. Den er stoppet, testnettleserne er stoppet, og `git status` er tom.
- **Nettleser:** headless Chrome styrt med CDP-skript i /tmp/qa-0116c/. Tastetrykkene er ekte CDP-tastetrykk, og klikkene er CDP-museklikk. `localStorage` ble tømt før og etter hver test.
- **Størrelser:** 1280×800 på PC. 375×812, 320×568, 568×320, 740×360 og 812×375 er emulert mobil.
- **Unntak:** I liggende format ble Start og verdensvalget rullet inn i bildet med `scrollIntoView` før klikket. Dette var bare for å sette opp testen.

## Oppfylte krav
**De tre rettingene:**
- **L med kartet åpent (KS9, KM8):** Rettet.
  - Med kartet åpnet med M, 🗺️ og ruta Kart i menyen bytter L lyden (`paa` → `av` → `paa` → `av`). Kartet blir stående åpent, og lydruta i menyen viser «🔇 Lyd av» etterpå.
  - Holder man L inne, bytter lyden bare én gang.
  - Med kartet åpent var spilletiden uendret (0 ms) i omtrent 5 sekunder med L og W. Helten sto stille, med samme posisjon før og etter. Etter at kartet ble lukket, flyttet W helten igjen.
  - L virker fortsatt ikke mens «Vil du avslutte?» vises, og det er riktig.
- **Menyrutene i lave vinduer (KM9):** Rettet. `offsetHeight` er 60 px for alle åtte rutene i 740×360, 568×320 og 812×375. I 375×812 og 320×568 er de 64 px, og i 1280×800 er de 72 px.
- **Tab-rekkefølgen i høye vinduer:** Rettet. I DOM-en står saldolenka nå rett etter `.ruter`. Tab og visuell rekkefølge er like i 1280×800, 375×812 og 320×568: ✕ → Fortsett → åtte ruter → saldo → tilbake til ✕. Shift+Tab fra Fortsett går til ✕. Lave vinduer står under forbedringer.

**Meny og saldo:**
- **Menyen får plass (KM3, KS13):** Ingenting må rulles i menykortet, i bakgrunnen eller sideveis i noen av de seks størrelsene.
  - I 568×320 står kortet fra 12,33 til 556,287. Se skjermbildet /tmp/qa-0116c/skjerm/meny-568x320.png.
  - I 320×568 står kortet fra 12,34 til 308,534, og tipslinja får nå også plass. Det tidligere forslaget om rulling på 13 px er dermed løst. Se /tmp/qa-0116c/skjerm/meny-320x568.png.
- **E-coins-saldoen oppdateres:**
  - Før belønning viste den «0 E-coins · E-shop». Etter `EVNEcoins.belonn('dyrepatruljen.verden.1', true)` og ny åpning viste den «25 E-coins · E-shop», med riktig `aria-label`.
  - Etter fire nye åpninger finnes det fortsatt bare ett `#evnPauseEcoins`, rett etter `.ruter`.
  - Lenka går til `/butikk/`.
- **Kopikontrollen (KM12):** Testsuiten sier OK. Jeg kontrollerte også selv: `diff` mellom `felles/ui/evn-pause-v3.js` og linje 188–507 i `spill/dyrepatruljen/index.html` viser bare merkene start og slutt.

**Regresjon (testsuiten `meny` og egne tester):**
- **KS12 og T2:** Tab blir i menyen.
- **KS7:** Esc lukker menyen og kartet.
- **KS1:** P åpner og lukker menyen.
- **KS10:** Avslutt spør først.
- **UI7:** Menyknappene er minst 44 px og overlapper ikke.
- **K1:** 0 feil i konsollen, 0 svar på 400 eller høyere og 0 eksterne forespørsler i mine kjøringer. Røyktesten er OK for alle fire spill.
- **S1:** Den statiske CSP-testen er OK.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Fokus etter menyen → Kart → Esc. Mulig problem (rådgivende: KS12):**
  - Når kartet lukkes etter at det er åpnet fra menyruta Kart, havner fokus på BODY.
  - Koden i `lukkKart` er ikke endret i diffen, så dette er ikke en ny feil fra denne rettingen. Tilfellet sto likevel ikke i lista i forrige rapport.
  - **Gjenskap:** P → klikk Kart → Esc. `document.activeElement` er BODY.
  - **Hva som må til for å avgjøre det:** bestem om fokus skal tilbake til ☰ i dette tilfellet, som ved Avslutt → Nei.
- **Kjent og uendret (ikke testet på nytt utover regresjonen):**
  - **KS12:** Fokus havner på BODY i de fire tilfellene fra forrige rapport.
  - **F3:** `{"v":1,"reddet":{"gata":null}}` gir en TypeError.
  - **K2, B3 og ST1, ST2, ST4, ST7, ST8:** fortsatt åpne.
  - **Versjonsnummer:** `evn-pause-v3.js` er endret igjen, men heter fortsatt v3. Det er et mulig problem mot kopikontrollen i UI-standarden, og en voksen bør bekrefte at det er akseptabelt for upublisert pilot.
  - **Sniker i 568×320 med safe area:** mulig problem, som før.

## Anbefalte forbedringer
- **Tab-rekkefølgen i lave vinduer følger ikke det man ser.** I 568×320, 740×360 og 812×375 står saldoen øverst mellom «Meny» og ✕. I Tab-rekkefølgen kommer den likevel sist, etter Avslutt: ✕ → Fortsett → ruter → saldo. Shift+Tab fra Fortsett går ✕ → saldo → Avslutt. Dette er som oppdraget beskriver, men det er ikke helt rettet. Vurder ett av to:
  - flytt lenka i DOM-en til mellom h2 og ✕ i lave vinduer (for eksempel med `matchMedia` i `apne()`)
  - la saldoen stå under rutene også der, hvis det fortsatt får plass
- **«Slik styrer du» havner nå under saldoen.** Når hjelpen åpnes, står den under saldolenka. Saldoen står fra y 502 til 546 og hjelpen fra 554 til 704 i 1280×800. Før sto hjelpen rett under rutene. Det er kanskje bevisst, men Even bør se det.
- **Fra før, uendret:** L på startskjermen med «Start helt på nytt?» åpen, statuslinja og styrespaken i 320×568, Start under bretten i liggende format, og tastehjelp på mobil (KS3).

## Kontroller som ikke kunne utføres
- **T1, KM1, KM5, KS13 og KM9 (E):** Ekte berøring og safe area på telefon med hakk er ikke testet. Målene er bare fra emulering.
- **B1 og KS9 (E):** Hørbar lyd er ikke kontrollert. Bare den lagrede verdien og lydruta er kontrollert.
- **U2, U3, KM3 og KM10 (V):** Even må selv prøve om han finner saldoen og hjelpen i den nye plasseringen.
- **F3 med lagring fra 0.11.5:** Ikke kjørt på nytt. Diffen berører ikke lagring eller lagringsnøkler.
- **Statistikk (ST2, ST4, ST5) og spilletid i GoatCounter:** `test/statistikk/` finnes ikke (ikke innført). Diffen berører ikke statistikkoden. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **Y1 og Y2:** Bildefrekvensen kan ikke måles med SwiftShader.
- **UI8a–c:** Ikke målt. UI1–UI10 er ikke tatt i bruk for spillet.
- **Avgrensning:** Krav utenfor diffen og regresjonstestene over er ikke gjennomgått på nytt.

## Klar for testing hos Even?
JA MED FORBEHOLD – alle tre rettingene er bekreftet i nettleseren, kopien er lik kilden, og jeg fant ingen kritiske feil eller konsollfeil. Forbeholdene:
- Tab-rekkefølgen i lave vinduer følger fortsatt ikke det man ser.
- Det er ikke testet på ekte mobil.
- De kjente avvikene F3, K2 og ST er fortsatt åpne.

Testskript og skjermbilder ligger i /tmp/qa-0116c/, utenfor repoet.
