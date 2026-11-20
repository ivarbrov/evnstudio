# EVN Game QA: Mørkeskogen 2.0.12
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit af7fd783fc85652fd447c4ee06b2512aab7bc3b5
Testkvittering: evn1 commit=af7fd783fc85652fd447c4ee06b2512aab7bc3b5 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok (utviklerens; se «Testet»)
Nivå: full – oppdraget ber om full kontroll med full merking. Endringen gjelder ny HUD-knapp, en ny meny og menyoppsettet (`hud2.css`, `hud2.js` og `spill.js`).
Testet:
- **Lokal server og nettleser:** 127.0.0.1:8798, stoppet etterpå. Playwright 1.63 med Chromium headless (SwiftShader). `spill.js` er rutet inn med kroker, og `renderer.render` er slått av.
- **Mobil:** emulert (`isMobile`, `hasTouch`) i 390×844 (iPhone 13), 844×390, 375×667 (SE), 320×568 og 568×320.
- **PC:** 1280×800, 1000×650 og 580×700, med ekte tastetrykk og klikk via Playwright.
- **Data:** Helten eier alle våpen og har 230 XP. Alt er målt med rektangler, ikke med skjermbilder.
- **Tidspunkt:** Testene gikk 21:15–21:47, mens HEAD var af7fd78.
- **`test/kjor.mjs`:** QA kjørte den etterpå. Da var HEAD allerede flyttet til f3fd856 (commit 21:53), og kjøringen ga 99 OK og ingen FEIL eller VARSEL for f3fd856. QA endrer ikke repoet og har ikke sjekket ut af7fd78. Kvitteringen over er derfor utviklerens for af7fd78, ikke kjørt av QA.

Hva er kontrollert på hvilken commit:
- **[nytt] Deltaet:** `git diff b48b6d1 af7fd78` endrer `hud2.css` (+24), `hud2.js` (+12/−1), `spill.js` (+14, ny `menuKind 'nivaa'`, `EVN2_nivaa` og `EVN2_bygg`), versjonen i `index.html` og `ENDRINGSLOGG.md`. Lagringskoden (`saveHero`, `SAVE_KEY`) er uendret. Grenen bygger på main b48b6d1.
- **[nytt] Kjøretidstester på af7fd78:** `/tmp/qa206/m12.js` og `/tmp/qa206/m12b.js`.
- **Ikke kontrollert:** Commit **f3fd856** (Kart-knapp ved Bygg på mobil, dagfeltet flyttet til statusfeltet). Den kom på grenen under kontrollen og endrer `hud2.css` og `hud2.js`. Layoutresultatene for mobil under gjelder derfor ikke for f3fd856.

## Oppfylte krav
- **[nytt] F1, Bygg-knappen (`#h2Bygg`, 56×56):**
  - Den lages én gang (1 element) og står under `#evnRad` med samme høyrekant:
    - Mobil: y 68–124.
    - PC: y 62–118 (1280: x 1212–1268, 580: 512–568).
  - Ingen overlapp med status, dag, ⏸, kart, hjelp, Avslutt, toast (lang melding vist), våpenlinje, nivåknapp, handlingsknapp, Hopp, snarveier, våpenrad, styrespak, prompt eller hint. Dette gjelder i alle 8 størrelsene, og knappen er innenfor skjermen. Minikartet (`#minimap`) er ikke synlig i HUD-en og ble ikke målt.
  - Et klikk åpner byggemenyen. I byggemodus avbryter et klikk byggingen (`g.build` → null, `state` play).
- **[nytt] F1/T2, nivåknappen («⭐ Nivå 2 ›»):**
  - Den nås med Tab (rekkefølgen …, nivå, Bygg, …).
  - Enter og mellomrom åpner nivåmenyen, og Esc lukker den (`state` play). I første kjøring ga Enter ingen meny fordi pausen var åpen etter et klikk i testen. I en ren kjøring virket Enter.
  - Bygg nås også med Tab.
- **[nytt] Nivåmenyen viser riktige tall** (230 XP):
  - `heroLevel()` = nivå 2, 130 av 150.
  - Teksten er «130 av 150 XP · 20 XP igjen til nivå 3», og linja er 87 %.
  - Radene viser nivå 2–10 (9 rader). Nivå 2 er ✅, nivå 3–10 er 🔒, og nivå 3 har «· 20 XP igjen».
  - Våpnene på riktige nivåer: Spyd (2), Magisk stav (3) og Flammehammer (5), med «(du har den)».
- **[nytt] B, I og Esc er som før:** B åpner byggemenyen, og B igjen lukker. I åpner ryggsekken, og Esc lukker.
- **[nytt] Menyene på små skjermer:** Bygg, verksted, ryggsekk (fanene Sekk, Våpen og Lag) og nivå er målt i alle 8 størrelsene.
  - Kortet er innenfor skjermen, ✕ og «Lukk» nederst er synlige, og listen ruller alene (`#menuList`).
  - ✕ overlapper ikke listen.
  - Fanene (`.h2Faner`) ligger øverst inne i listen og blir stående med helt dekkende bakgrunn når listen rulles. Innholdet ruller under dem, ikke synlig oppå dem. Dette er målt som rektangler, ikke vurdert i bilde.
  - Kister er ikke en meny (de åpnes direkte).
- **[nytt] T1:** Bygg er 56×56. Nivåknappen er ca. 79×24 og dermed under 44 px høy. Se «Andre avvik».
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere i noen størrelse.
- **[nytt] K3:** Versjonen er 2.0.12, og endringsloggen har en rad for 2.0.12. Se «Andre avvik».
- **[nytt] S1, S2, S3:** CSP er uendret (statisk=ok i utviklerens kvittering og i QA-kjøringen på f3fd856). Ingen ny datainnsamling og ingen fritekst.
- **Overført fra 2.0.11 (f1cf762/6bd5f2b):** Startkortet, toppraden på PC, Avslutt, F1 (spillogikk), F2/F3 (lagring) og U2.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **T1, mulig problem:** Nivåknappen i våpenlinja er ca. 24 px høy (1280: 79×24, mobil: 74×22). Det er under 44×44 for en trykkflate på mobil.
  - For å avgjøre det: Prøv på telefon om Even treffer den. Ellers kan trykkflaten gjøres høyere med padding eller et usynlig trykkområde.
- **Mulig problem, 568×320 liggende (iPhone SE 1. generasjon):** Synlig listehøyde i menyene er bare 82 px, mens én rad er 122 px høy. Man kan rulle til bunnen (siste rad når listens bunn), men aldri se en hel rad. På 844×390 og alle andre størrelser er siste rad synlig.
  - For å avgjøre det: Vurder på en liten telefon i liggende format. Det kan løses ved å la tittelen og «Lukk» ta mindre plass ved lav høyde.
- **K3, mulig problem:** 2.0.12-raden har status «(ikke publisert)». Den bør få «publiseres ved sammenslåing» før publisering.

## Anbefalte forbedringer
- f3fd856 må kontrolleres separat før publisering: Kart-knappen ved Bygg på mobil, dagfeltet i statusfeltet, og plasseringen under Bygg ved bredde < 380.

## Kontroller som ikke kunne utføres
- **`test/kjor.mjs` på af7fd78 av QA:** Ikke kjørt. HEAD var flyttet til f3fd856, og QA sjekker ikke ut commits. Utviklerens kvittering er brukt. QA-kjøringen på f3fd856 ga 99 OK.
- **f3fd856:** Ikke kontrollert.
- **Skjermbilder og visuell vurdering av menyene, inkludert at fanene ikke legger seg oppå teksten (V):** Ikke tatt. De henger i dette miljøet. Det er målt med rektangler.
- **Oppdragslisten:** Den ligger i Sekk-fanen og er dekket av målingen av menyen der. Den er ikke vurdert visuelt.
- **Minikart/kart i HUD:** `#minimap` var ikke synlig og ble ikke målt. Kartdialogen er uendret.
- **Ekte berøring og safe area (E):** Ikke testet.
- **Lagring (F2/F3):** Kun kodelest. Ingen endring i lagringskoden, så resultatene er overført.
- **ST1–ST8 (overført fra 2.0.11):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` med `data-spill="morkeskogen"` er uendret.
  - ST2: Ikke testet. Testsiden mangler. Nivåmenyen setter `state = 'menu'` som de andre menyene.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen.
- **Y1 (E):** Ingen GPU og ingen referansemobil.
- **Y2:** Ikke testet på nytt.
- **K2, B1, B2, B3 (lavere grafikk), B4 (V), T3, T4, U3 (V) og S4:** Ikke testet på nytt.
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil på af7fd78. Bygg overlapper ikke noe, Bygg og nivå åpner riktig meny og nås med Tab, Enter og mellomrom, nivåtallene stemmer, og menyene har synlig Lukk og ruller riktig. Forbeholdene er den lave nivåknappen (T1), den svært lave listen på 568×320, statusen i endringsloggen, at QA ikke har egen kvittering for af7fd78, og at f3fd856 ikke er kontrollert. Rapporten er ikke en publiseringsgodkjenning.
