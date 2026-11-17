# EVN Game QA: Mørkeskogen 2.0.12
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit ca7114c2fc52f353893d1e49001bc3d815f9ce21
Testkvittering: evn1 commit=ca7114c2fc52f353893d1e49001bc3d815f9ce21 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – deltakontroll av f3fd856 og ca7114c mot af7fd78. Endringene gjelder HUD-oppsettet og menyen (`hud2.css` og `hud2.js`). Resten er overført fra af7fd78.
Testet:
- `test/kjor.mjs` er kjørt alene av QA på ca7114c (HEAD, rent arbeidstre før og etter), med 99 OK og ingen FEIL eller VARSEL.
- Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright 1.63 med Chromium headless (SwiftShader). `spill.js` er rutet inn med kroker, og `renderer.render` er slått av.
- Mobil er emulert (`isMobile`, `hasTouch`) i 390×844, 375×667, 320×568, 844×390 og 568×320. PC er testet i 1280×800 og 580×700.
- Helten eier alle våpen og har 230 XP. Ved og stein er satt til 7 og 3, og en lang toast vises.
- Alt er målt med rektangler og `elementFromPoint`, ikke med skjermbilder. Skriptet er `/tmp/qa206/m13.js`.

Hva er kontrollert på hvilken commit:
- **[nytt] Deltaet:** `git diff af7fd78 ca7114c` endrer `hud2.css`, `hud2.js`, `ENDRINGSLOGG.md` (bare raden fra f3fd856) og legger til QA-rapporten for af7fd78. `spill.js` og `index.html` er uendret.
- **[nytt] Alle målingene** er gjort på ca7114c, som inneholder f3fd856.
- **Overført fra af7fd78:** Bygg- og nivåmenyens innhold og tall, tastatur (Tab, Enter, mellomrom, Esc, B og I), Bygg avbryter byggemodus, og menyene i de andre størrelsene.

## Oppfylte krav
- **[nytt] Dagfeltet i statusfeltet:**
  - `#h2Dag` ligger inne i statusfeltet i alle 7 størrelsene.
  - Fasen oppdateres fra «☀️ Dag 1» til «🌙 Natt 1» etter `skipTime('natt')` i 6 av 7 kjøringer. På 1280 rakk den trege headless-løkka det ikke innen ventetiden.
  - Området viste «🌲 Skogen» også etter flytting. Bytte av område er ikke bekreftet, se «Kontroller som ikke kunne utføres».
  - Toasten står under statusfeltet i alle størrelser (y 153 og nedover). Plasseringen bruker fortsatt `#h2Dag`, nå inne i statusfeltet.
- **[nytt] Kart-knappen (`#h2Kart`, mobil):**
  - Den vises bare på touchui og er skjult på PC.
  - Med bredde 380 og over står den til venstre for Bygg (844×390: 704–760, 568×320: 428–484). Under 380 står den under Bygg (375×667 og 320×568: y 132–188).
  - Et trykk åpnet kartet i alle 5 mobilstørrelsene.
- **[nytt] Trykkflaten til nivåknappen (T1):** `::after` er 44 px høy. Knappen er 74×22 (mobil) og 79×24 (PC), og trykkboksen 86×44 og 91×44.
  - `elementFromPoint` i hele boksen traff bare nivåknappen (484 og 506 punkter).
  - Ingen andre knapper eller lenker ligger innenfor boksen i noen størrelse. `::after` tar dermed ikke trykk fra andre trykkflater. Den dekker bare kanten av statusfeltet, som ikke er en knapp.
- **[nytt] Menyen på lave skjermer** (`max-height: 420px`):
  - 568×320: listen er 168 px høy (før 82) for bygg, sekk, lag og nivå. Rader på 84–146 px får dermed plass. Kortet er innenfor skjermen, og Lukk er synlig.
  - 844×390: listen er 238 px. Kortet er innenfor, og Lukk er synlig.
- **[nytt] PC-toppraden:** Ingen overlapp mellom Bygg, ⏸, kart, hjelp, Avslutt og statusfeltet i 1280×800 og 580×700. Bygg står på samme sted som i af7fd78.
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere.
- **[nytt] S1, S2, S3:** CSP er uendret (statisk=ok).
- **Overført fra af7fd78:** F1 (Bygg og nivå åpner riktig meny, Bygg avbryter bygging), T2 (Tab, Enter, mellomrom og Esc), nivåtallene, B og I, F2/F3 (lagringskoden er uendret) og U2.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Verifisert feil, overlapp på 390×844 (iPhone 13):**
  - Kart-knappen (250–306, y 68–124) ligger oppå høyre del av statusfeltet (12–264, y 10–115), 14×47 px.
  - Statusfeltet er blitt bredere fordi dagfeltet nå ligger i det: 252 px, mot 175 px i af7fd78. Med ved 7 og stein 3 når det til x 264. Med flere ressurser i feltet blir det enda bredere.
  - Grensen 380 px for å legge Kart under Bygg tar ikke hensyn til dette. På 375 og 320 px er det ingen overlapp, fordi Kart står under Bygg der.
  - Gjenskaping: 390×844 med touch, start spillet og ha ved og stein. Kart-knappen dekker høyre kant av statusfeltet.
- **T1, mulig problem:** Ved høyde ≤ 420 px er menyens ✕ 24 px høy og «Lukk» 37 px høy. Det er under 44 px. Fanene er fortsatt 50 px.
  - For å avgjøre det: Prøv på en telefon i liggende format om ✕ og Lukk er lette å treffe, eller behold `min-height: 44px` på dem.
- **K3:** 2.0.12-raden har fortsatt status «(ikke publisert)», som oppdraget opplyser.
- **Eldre, ikke regresjon:** På PC i 580×700 går våpenraden med ti våpen utenfor vinduet (x −39 til 619). Det er likt i af7fd78.
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.

## Anbefalte forbedringer
- Plasser Kart ut fra den faktiske høyrekanten til statusfeltet, ikke bare bredden 380. For eksempel kan Kart legges under Bygg når `status.right + 8 > kart.left`.

## Kontroller som ikke kunne utføres
- **Bytte av område i dagfeltet:** Ikke bekreftet. Etter flytting på 3000 var området fortsatt Skogen. Teksten kommer fra samme `#biome`-node, som er flyttet, ikke endret.
- **Skjermbilder og visuell vurdering (V):** Ikke tatt. De henger i dette miljøet.
- **Ekte berøring og safe area (E):** Ikke testet.
- **Hint (`#h2Hint`):** Hintet er skjult på mobil og ble ikke vist på PC under målingen. Plasseringen er ikke testet.
- **Statusfeltet med alle ressurser** (ved, stein, jern, rått, stekt, skinn) **på 390 px:** Ikke målt. Det ventes å bli bredere og gi større overlapp.
- **ST1–ST8 (overført fra af7fd78):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` med `data-spill="morkeskogen"` er uendret.
  - ST2: Ikke testet. Testsiden mangler.
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
JA MED FORBEHOLD – Ingen kritiske feil. Kart-knappen åpner kartet, dagen står i statusfeltet og oppdateres, nivåknappens trykkflate tar ikke trykk fra andre knapper, og menylisten på 568×320 har fått plass (168 px). Forbeholdene er at Kart-knappen overlapper statusfeltet på 390 px (iPhone 13), at ✕ og Lukk er under 44 px på lave skjermer, at endringsloggen står som «ikke publisert», og at statistikken ikke er testet. Rapporten er ikke en publiseringsgodkjenning.
