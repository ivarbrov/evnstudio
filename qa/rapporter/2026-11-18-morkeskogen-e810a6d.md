# EVN Game QA: Mørkeskogen 2.0.12
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit e810a6d41773930123de50d9a0337244990a8733
Testkvittering: evn1 commit=e810a6d41773930123de50d9a0337244990a8733 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – deltakontroll av 9fcdcc6 og e810a6d mot ca7114c. Endringene gjelder plasseringen av HUD-knapper, statusfeltet i liggende format og et nytt hint på startkortet. Resten er overført fra ca7114c og af7fd78.
Testet:
- `test/kjor.mjs` er kjørt alene av QA på e810a6d (HEAD, rent arbeidstre før og etter), med 99 OK og ingen FEIL eller VARSEL.
- Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright 1.63 med Chromium headless (SwiftShader). `spill.js` er rutet inn med kroker, og `renderer.render` er slått av.
- Mobil er emulert (`isMobile`, `hasTouch`) i 852×315, 844×390, 667×375, 568×320, 390×844, 375×667 og 320×568. PC er testet i 1280×800 og 580×700.
- **Belastningstilfelle:** Alle seks ressursene vises i statusfeltet (ved, stein, jern, rått, stekt og skinn, alle 99), og en lang toast vises. Dette er det verste tilfellet. Med få ressurser blir statusfeltet smalere.
- Til sammenligning er 390×844 og 568×320 målt på samme måte med filene fra b48b6d1 (2.0.11, publisert) og ca7114c.
- Alt er målt med rektangler, ikke med skjermbilder. Skriptene er `/tmp/qa206/m15.js` og `/tmp/qa206/m15v.js`.

Hva er kontrollert på hvilken commit:
- **[nytt] Deltaet:** `git diff ca7114c e810a6d` endrer `hud2.js` (plasseringen av Kart og Bygg), `hud2.css` (hintet `.h2Snu`, `.liten` og et kompakt statusfelt ved liggende ≤ 430 px), `index.html` (hintet), `ENDRINGSLOGG.md` og QA-rapporten for ca7114c. `spill.js` er uendret.
- **[nytt]** Alle målinger av e810a6d er gjort på e810a6d, som inneholder 9fcdcc6. 9fcdcc6 er ikke målt separat.
- **Overført fra ca7114c og af7fd78:** Nivåmenyen, tastatur, menyene på små skjermer, nivåknappens trykkflate og dagfeltet.

## Oppfylte krav
- **[nytt] Liggende mobil, Bygg og Kart på rad med ⏸:**
  - **852×315:** ⏸ står på 788–832, Bygg på 732–780 og Kart på 676–724, alle på y 16–64 og 48 px store. Ingen overlapp med statusfeltet (som slutter på 505), handlingsknappen (742–838, y 121–217), Hopp, våpenraden eller toasten.
  - **844×390:** Samme oppsett, også 48 px. Ingen overlapp.
  - **667×375:** Her er det ikke plass på raden, så Bygg står under ⏸ og Kart til venstre for Bygg (y 68–116). Ingen overlapp.
- **[nytt] Bygg og Kart åpner riktig:**
  - Kart åpnet kartet, og Esc lukket det, i alle 7 mobilstørrelsene.
  - Bygg åpnet byggemenyen i 6 av 7 mobilstørrelsene. På 852×315 ga `tap` tidsavbrudd i headless (spilløkka var for treg), så Bygg er ikke bekreftet der.
- **[nytt] Hintet «📱↔️ Spillet er best liggende. Snu telefonen!»:**
  - Det vises bare på berøringsskjerm i stående format (390×844, 375×667, 320×568). Det er skjult i liggende format og på PC.
  - Start er fortsatt synlig uten rulling med hintet: 320×568 på y 392–437, 375×667 (iPhone SE) på 548–608, og 390×844 på 540–601.
- **[nytt] Stående: Kart under Bygg.** Kart står alltid under Bygg (390, 375 og 320). Kart overlapper ikke statusfeltet lenger. Overlappen mellom Kart og statusfeltet på 390×844 fra ca7114c er rettet, se likevel «Andre avvik» for Bygg.
- **[nytt] PC:** Ingen hint, ingen Kart-knapp og ingen overlapp i 1280×800 og 580×700.
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere.
- **[nytt] S1, S2, S3:** CSP er uendret (statisk=ok). Ingen ny datainnsamling og ingen fritekst.
- **[nytt] Nivåknappens trykkflate:** `::after` treffer fortsatt ingen andre knapper i noen størrelse.
- **Overført fra ca7114c og af7fd78:** F1 (Bygg avbryter bygging, nivåmenyen med riktige tall), T2 (Tab, Enter, mellomrom og Esc), B og I, menyene på lave skjermer, F2/F3 (lagringskoden er uendret) og U2.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Verifisert feil, 568×320 med mange ressurser:** Kart overlapper handlingsknappen.
  - Statusfeltet er 12–505 bredt, så det er ikke plass på raden med ⏸. Bygg legges under ⏸ (512–560, y 68–116), og fordi det heller ikke er plass til Kart til venstre, legges Kart under Bygg (512–560, y 124–172).
  - Der treffer Kart handlingsknappen (458–554, y 126–222) med ca. 42×46 px.
  - I ca7114c lå Kart i stedet oppå statusfeltet i samme situasjon. Overlappen er altså flyttet, ikke fjernet.
  - Med få ressurser (statusfeltet er da ca. 230 px bredt) gir regnestykket i koden plass på raden, så overlappen oppstår bare når statusfeltet er bredt. Dette er regnet ut fra koden, ikke målt.
  - Gjenskaping: 568×320 med touch, alle seks ressursene i statusfeltet.
- **Verifisert feil, stående med mange ressurser (390×844, 375×667, 320×568):** Statusfeltet blir 12–473 bredt, altså bredere enn skjermen. Bygg ligger oppå statusfeltet, og ⏸ havner utenfor skjermen (x 491).
  - **Dette er eldre, men verre i 2.0.12:** I 2.0.11 (b48b6d1) blir statusfeltet 12–375 bredt med de samme ressursene, og ⏸ havner også utenfor (x 493). I 2.0.12 er det ca. 100 px bredere fordi dagfeltet ligger i statusfeltet.
  - At ⏸ havner utenfor skjermen, betyr at spilleren ikke kan pause på mobil i stående format med mange ressurser. Det er en betydelig feil for F1, men den er ikke ny i 2.0.12.
  - Gjenskaping: 390×844 med touch, alle seks ressursene i statusfeltet.
- **Eldre, ikke regresjon:** I liggende 852×315 og 568×320 ligger Start på startkortet noen piksler under skjermkanten (273–321 og 273–321). Det er likt i 2.0.11 for 568×320.
- **Eldre, ikke regresjon:** På PC i 580×700 går våpenraden med ti våpen utenfor vinduet (x −39).
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **K3:** Statusen i 2.0.12-raden er ikke kontrollert på nytt i denne runden.

## Anbefalte forbedringer
- La statusfeltet bryte ressursene over to linjer eller begrense bredden (for eksempel `max-width` ut fra skjermbredden minus toppraden), slik at ⏸ alltid er synlig. Dette retter også overlappene med Bygg og Kart.
- Ved liggende format: Hvis verken raden med ⏸ eller plassen til venstre for Bygg er ledig, legg Kart under ⏸ til venstre for handlingsknappen, eller skjul den og bruk Kart i pausen.

## Kontroller som ikke kunne utføres
- **Bygg-knappen på 852×315:** Ikke bekreftet (tidsavbrudd i headless). Kart åpnet riktig der.
- **9fcdcc6 alene:** Ikke kontrollert. Endringene er med i e810a6d.
- **Få ressurser i 568×320 og 852×315 på e810a6d:** Ikke målt. Plasseringen er regnet ut fra koden.
- **Skjermbilder og visuell vurdering (V):** Ikke tatt. De henger i dette miljøet.
- **Ekte berøring og safe area (E):** Ikke testet.
- **ST1–ST8 (overført fra ca7114c):** `statistikk.js`, `data-spill` og `evn-start` er uendret. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
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
JA MED FORBEHOLD – Ingen kritiske feil. På Ivars skjerm (852×315) og på 844×390 står Bygg og Kart på rad med ⏸ uten overlapp, og hintet vises bare stående. Forbeholdene er at et bredt statusfelt med mange ressurser gir overlapp mellom Kart og handlingsknappen på 568×320, at Bygg overlapper statusfeltet stående, og at ⏸ kan havne utenfor skjermen stående (eldre, men verre enn i 2.0.11). Statistikken er ikke testet. Rapporten er ikke en publiseringsgodkjenning.
