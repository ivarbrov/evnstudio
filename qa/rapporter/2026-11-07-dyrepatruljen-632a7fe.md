# EVN Game QA: Dyrepatruljen 0.11.6 (pilot, EVN-PAUSE v3), ny kontroll etter retting
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 632a7fe039607aa5e9c4e3ae0b0c915b78925f3f
Testkvittering: evn1 commit=632a7fe039607aa5e9c4e3ae0b0c915b78925f3f tester=675e701e13bf arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: høy – endringen gjelder felles kode (`felles/ui/evn-pause-v3.js`). Dyrepatruljen er det eneste spillet som bruker v3. De andre spillene har v2 og er ikke endret i diffen. Derfor er bare Dyrepatruljen kontrollert, med lagring fra 0.11.5.
Testet:
- **Commit:** HEAD er 632a7fe. Den legger bare til forrige QA-rapport oppå 8171ad0, så koden er den samme som i 8171ad0. Alt er kjørt på nytt. Ingen resultater fra ce8bd02 er brukt som bevis.
- **Testsuite:** `node test/kjor.mjs` med google-chrome ga 151 ok, 0 feil, 0 varsel og 2 ikke innført.
- **Testserver:** egen server på 127.0.0.1:8767. Den er stoppet, og `git status` er tom.
- **Nettleser:** headless Chrome styrt med CDP-skript i /tmp/qa-0116b/. 3D tegnes med SwiftShader, og `localStorage` ble tømt før hver test.
- **PC:** 1280×800, med ekte tastetrykk og museklikk via CDP Input.
- **Mobil:** bare emulert, i 375×812, 740×360, 320×568, 568×320 og 812×375, med CDP-berøring. Safe area ble simulert med 47/34 px på stående og 47/21 px på liggende skjerm.
- **Statistikk:** evnstudio.no ble omdirigert til den lokale serveren, og GoatCounter ble stubbet. Ingen tellinger nådde den ekte tjenesten.

## Oppfylte krav
**Funnene fra forrige rapport som skulle rettes:**
- **Sniker under meldinger (KM5):** Rettet i 1280×800, 375×812, 740×360, 320×568 og 812×375. Jeg viste fem ekte meldinger med «🤫 Sniker» på («Du reddet …», pinnsvin-teksten, lava, is og verdenstipset), og ingen av dem overlapper merket. Unntaket i 568×320 står under avvik.
- **Fokus etter Avslutt → Nei (KS12):** Rettet. Fokus havner på `#evnPauseKnapp` etter klikk på «Nei», etter Esc og etter berøring i alle seks størrelsene.
- **Saldolinja (KM3):**
  - Den står under rutene i 1280×800, 375×812 og 320×568.
  - I 740×360, 568×320 og 812×375 står den ved siden av tittelen.
  - Fortsett er første handling under spilletiden i alle størrelser.
- **Menyen i 568×320:** Kortet får plass uten rulling (scroll 0). Alle åtte rutene, Fortsett, ✕ og saldoen er synlige. Se skjermbildet /tmp/qa-0116b/skjerm/meny-568x320.png.
- **Menyen i 320×568:** Alle rutene, Avslutt, Fortsett og saldoen er synlige, med rutene i tre kolonner (64 px høye). Bare tipslinja nederst må rulles (13 px), se under forbedringer.
- **L med dyreboka åpen (KS9, KM8):** Rettet, både når dyreboka er åpnet med I og med 📖. Lydruta i menyen viser riktig verdi etterpå. L virker også i verdensvalget, i menyen, i hjelpen, i dyreparken og på startskjermen. L virker ikke mens «Vil du avslutte?» vises, og det er riktig.
- **Lagring fra menylenker (KS11):** Spilletiden ble skrevet før siden gikk til `/butikk/` via saldolenka. Jeg klarte ikke å skille om det var den nye klikklytteren eller sideskiftet som skrev. At lytteren lagrer, er bare kodelest. Dyrepatruljen har ingen `cfg.lagre`, fordi fangst lagres med en gang.

**Regresjon (ingenting er blitt dårligere i dette):**
- **F1:**
  - Start → Gata, og W flytter helten.
  - P, Esc, ☰, ✕, Fortsett og klikk utenfor åpner og lukker menyen.
  - Helten står stille i menyen og med kartet åpent.
  - Avslutt → «Ja, avslutt» går til `/`.
  - På mobil virker Fortsett, styrespaken (1,0–1,25), 📖, 🗺️ og Avslutt/Nei i alle størrelsene.
- **F2:** Fangst med mellomrom lagres og overlever omlasting. «Start helt på nytt» har fokus på Nei, Esc beholder lagringen, og Ja sletter bare `evn-dyrespillet-v1`.
- **F3 (del):** Lagring fra 0.11.5 (2 dyr og lyd av) leses, og 0.11.5 leser lagringen fra 0.11.6. Fem former for ødelagt lagring gir ingen feil. Unntaket er kjent, se under.
- **T2 og KS12:** Tab holder seg i menyen og i «Vil du avslutte?», og det er 0 elementer med `inert` etterpå. Enter på ☰ åpner menyen, Esc setter fokus tilbake på ☰, og mellomrom etterpå åpner ikke menyen.
- **T3:** Med `reduce` er `animation` satt til `none` for menyen og Start.
- **K1:** 0 feil i konsollen, 0 svar på 400 eller høyere og 0 eksterne forespørsler, unntatt de bevisste testfeilene. Røyktesten er OK.
- **K3:** «Versjon 0.11.6».
- **S1:** CSP er uendret, og den statiske testen er OK.
- **S2 og ST6:** `document.cookie` er tom.
- **S4:** Lagringsnøklene er uendret.
- **B2:** Kartet viser «🔴 Du er her · 🏙️ Gata». Spilletiden øker med 0 ms mens menyen, kartet eller dyreboka er åpen, og med 5,3 s på 5 s med spilling.
- **B3 (oppstart):** Uten WebGL er Start slått av, og det vises en `role="alert"`-melding.
- **ST5 (det som er kjørt):** Ingen hendelse før Start. Etter Start, meny, verdensvalg, M, I og L kom det nøyaktig én `start-dyrepatruljen`.
- **Kopikontroll (KM12):** Kopien i `index.html` er lik `felles/ui/evn-pause-v3.js` tegn for tegn innenfor merkene, og suiten `meny` er OK.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **L virker ikke når kartet er åpent. Verifisert feil (rådgivende: KS9, KM8):**
  - Grenen for `kartApen` i tastelytteren returnerer før L blir behandlet.
  - **Gjenskap:** Trykk M (eller 🗺️) i Gata, så L. `evn-dyrepatruljen-lyd` står uendret på `paa`.
- **Menyrutene er lavere enn 60 px i lave vinduer. Verifisert, ny i 8171ad0 (rådgivende: KM9, «menyruter minst 60 px høye»):**
  - `min-height` er endret fra 60 px til 56 px, og `offsetHeight` er 56 px i 740×360, 568×320 og 812×375.
  - Det er fortsatt over 44 og 48 px.
- **Sniker overlapper meldinger med safe area på liggende smal skjerm. Mulig problem, mye mindre enn før (KM5):**
  - I 568×320 med 47 px innfelling til venstre dekker meldinger på to eller tre linjer 7 px av høyre hjørne på merket. Merket står fra x 57 til 149, og meldingen begynner på x 142.
  - Teksten «🤫 Sniker» er fortsatt helt lesbar. Se /tmp/qa-0116b/skjerm/snik-568x320.png.
  - Uten innfelling er det etter målingene ingen overlapp.
  - **Hva som må til for å avgjøre det:** test på ekte telefon med hakk i liggende format.
- **KS12, kjent og delvis uendret:** Fokus havner fortsatt på BODY i fire tilfeller:
  - når dyreboka lukkes med Esc etter at den er åpnet med I
  - når dyreboka lukkes med ✕ etter at den er åpnet med 📖
  - etter «Velg verden» fra menyen
  - etter Avslutt → Esc fra verdensvalget

  Dette var ikke med i rettingen.
- **Kilden er endret uten nytt versjonsnummer. Mulig problem:** `felles/ui/evn-pause-v3.js` er endret, men heter fortsatt v3. Punkt 2 i kopikontrollen i UI-standarden sier at en endring skal gi nytt nummer. v3 er upublisert pilot, så det kan være akseptabelt. En voksen bør bekrefte det. Navnekollisjonen med ST2 (`EVNAktivTid`) er fortsatt åpen.
- **Kjent og uendret:**
  - **F3:** `{"v":1,"reddet":{"gata":null}}` gir en TypeError, og verdensvalget kan ikke brukes.
  - **K2:** En feil under spilling gir ingen vennlig melding.
  - **B3:** `webglcontextlost` håndteres ikke.
  - **ST1, ST2, ST4, ST7 og ST8:** Statistikken følger ikke 1.1.

## Anbefalte forbedringer
- **Tab-rekkefølgen følger ikke det man ser (ny, fordi CSS `order` brukes):**
  - Etter Avslutt går Tab til ✕ øverst, så til saldoen nederst og så til Fortsett.
  - Shift+Tab fra Fortsett hopper ned til saldoen.
  - I lave vinduer kommer ✕ før saldoen i Tab-rekkefølgen, selv om saldoen står til venstre for ✕.
  - Vurder å flytte saldolenka i DOM-en (for eksempel i `ecoins.js`) i stedet for bare med `order`.
- **Tipslinja i 320×568:** «Spillet står stille. Ingenting er borte.» kuttes nederst, så kortet må rulles 13 px.
- **L på startskjermen:** L bytter lyden også mens dialogen «Start helt på nytt?» er åpen, og uten at noe viser at lyden ble endret.
- **Fra før, uendret:**
  - Statusen brytes i 320×568, og den berører Sniker med 1 px.
  - Styrespaken og Snik overlapper i 320×568.
  - Start ligger under bretten i liggende format.
  - Hjelpeteksten viser taster også på mobil (KS3).

## Kontroller som ikke kunne utføres
- **Y1 (E) og Y2:** Bildefrekvensen kan ikke måles med SwiftShader, og referansemobil er ikke valgt.
- **T1, KM1, KM5, KM6 og KS13 (E):** Det er ikke testet med ekte berøring, safe area på iPhone med hakk eller knipe-zoom.
- **B1 og KS9 (E):** Hørbar lyd er ikke kontrollert. Bare den lagrede verdien og lydruta er kontrollert.
- **U2, U3, KM3 og KM10 (V):** Even må selv prøve om han finner saldoen og Fortsett i den nye rekkefølgen, og om ikonene er forståelige.
- **KS11:** Jeg fikk ikke isolert om det var klikklytteren eller sideskiftet som lagret, så klikklytteren er bare kodelest.
- **ST2, ST4 og milepælene for spilletid:** `test/statistikk/` finnes ikke. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **UI8a–c:** Ikke målt på nytt. Plasseringen av meldingene er uendret, og UI1–UI10 er ikke tatt i bruk for spillet.
- **Avgrensning:** Krav som ikke berøres av diffen, er ikke gjennomgått på nytt utover regresjonstestene over. Det gjelder T4, B4–B7 og hele verdener med ekte håvsving.

## Klar for testing hos Even?
JA MED FORBEHOLD – de fem funnene som skulle rettes, er rettet eller nesten rettet, og ingenting av det jeg testet er blitt dårligere. Det er ingen konsollfeil og ingen kritiske feil. Forbeholdene:
- L virker ikke med kartet åpent.
- Menyrutene i lave vinduer er 56 px.
- Det er ikke testet på ekte mobil.
- De kjente avvikene F3, K2 og ST er fortsatt åpne.
