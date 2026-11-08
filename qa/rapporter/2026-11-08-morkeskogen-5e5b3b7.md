# EVN Game QA: Mørkeskogen 2.0.9
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 5e5b3b798e61d9f27c95fbf8b4b156cd2d44079d
Testkvittering: evn1 commit=5e5b3b798e61d9f27c95fbf8b4b156cd2d44079d tester=a2c92037f5f1 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om full kontroll av en forhåndsvisning. Grensesnittet på mobil og spillogikken for handlingsknappen er endret. Versjonen skal ikke publiseres.
Testet: Lokal server 127.0.0.1:8798, stoppet etterpå. Playwright 1.63 med Chromium headless (SwiftShader, ingen GPU). Mobil er emulert med `isMobile` og `hasTouch` (`pointer: coarse` = sann) i 375×812, 812×375, 320×568 og 568×320. PC er testet i 1280×800 med ekte tastetrykk og mus via Playwright. Berøring er sendt med CDP `Input.dispatchTouchEvent`, og det er emulering, ikke ekte berøring. Kroker er lagt inn ved å rute `spill.js`. Under målingene er `renderer.render` slått av, fordi rammene ellers tar flere sekunder i headless.

Grunnlag og avgrensning:
- Grenen `morkeskogen/mobil-rydding` er sammenlignet med 07f2d2d. Endret er `spill.js`, `hud2.css`, `hud2.js`, `index.html` og `ENDRINGSLOGG.md`. Raden i endringsloggen stemmer med diffen.
- **Arbeidstreet ble flyttet under kontrollen.** Commit `b1f6cc4` (lokomotiv i begge ender og veranda i Kaktusbyen) ble lagt på grenen kl. 21:07, mens kontrollen pågikk.
  - `test/kjor.mjs` ble kjørt 20:41–20:45, mens HEAD var 5e5b3b7. Den ga 86 OK og ingen FEIL eller VARSEL. Den gikk parallelt med en av QA-testene, ikke alene.
  - Funksjonstestene og PC-testen er kjørt med `spill.js` fra 5e5b3b7, hentet med `git show` og rutet inn.
  - Layoutmålingen på mobil leste `spill.js` fra b1f6cc4. `hud2.css`, `hud2.js` og `index.html` er like i de to commitene, og deltaet i `spill.js` gjelder bare toget og verandaen. Layoutresultatene gjelder derfor også 5e5b3b7.
  - b1f6cc4 er **ikke** kontrollert.

## Oppfylte krav
- **F1 på mobil, flere fingre samtidig** (375×812, CDP-berøring):
  - Styrespaken holdes (styrke 0,91, helten går).
  - Deretter Hopp (`jump`, z = 40), så handlingsknappen (`act` og `ctx`).
  - Deretter et trykk på 🏹 i våpenraden med en fjerde finger. Valgt våpen ble `bue`, mens styrespak, Hopp og handling fortsatt var aktive.
  - Når alle fingrene slippes, nullstilles alt.
- **F1, handlingsknappen (`act`) på mobil:**
  - **Tre med sverd valgt:** Knappen viser «🪓 Hugg». Holdt i 3 s ga treet 6 → 5 i liv med øksa, og valgt våpen forble sverd.
  - **Bue:** Knappen viser «🏹 Skyt». Hold og slipp ga trekk til 0,25 og én pil.
  - **Fiske:** Med stang ved vann startet et trykk fiskingen (`cast` → `wait`).
  - **Bygging:** Knappen viser «🔨 Bygg», og 🔨-knappen for å avbryte er synlig. Trykket kaller `placeBuilding`. Det kom meldingen «Det er ikke plass her», fordi teststedet var opptatt. Selve plasseringen er derfor ikke testet.
  - **Toget:** Ved vogna på perrong A viser knappen «Gå på». Et trykk gir `g.ride`.
  - **Spis-snarvei:** Med mat under 45 % og stekt mat vises «🍗 Spis». Et trykk ga mat 30 → 65 og stekt mat 2 → 1.
- **F1/B2, pausen på mobil:**
  - ⏸ åpner pausen. Kart, hjelp og avslutt er skjult i toppraden.
  - Pausen har ▶ Fortsett, 🗺️ Kart, 🎥 Bytt kamera, 🎮 Slik styrer du og 🚪 Avslutt.
  - 🎥 bytter kamera (`near` → `far`) og lukker pausen.
  - 🗺️ åpner kartet med ✕ synlig (44×44), og spillet står i `pause`. Escape lukket kartet. ✕ er ikke trykket.
- **Avslutt fra pausen på `/spill/morkeskogen/`:** 🚪 Avslutt viser spørsmålet, og «Ja, avslutt» går til `http://127.0.0.1:8798/` med status 200.
- **PC er uendret** (1280×800, 07f2d2d mot 5e5b3b7):
  - HUD-plasseringen er identisk for status, dag, ⏸, kart, hjelp, Avslutt, våpenrad, våpenlinje, hint og `#prompt`. Tastetallene 1–0 vises (10). `#touch` er skjult.
  - Tastene gir samme resultat i begge versjonene: 2 → sverd, 4 → bue, 1 → øks, C → kamerabytte, M → kart (Esc lukker), H → pause med «Slik styrer du», I → sekk, B → byggemeny, og E holdt → `keys.act`.
  - Mus: venstre knapp gir hugg og ikke `ctx`.
  - Ny på PC: sekken har snarveiene Spis og Bygg øverst. Det er ment slik.
- **T1:** Ingen av knappene act, Hopp, Spis, Bygg og ⏸ er under 44 px i de fire størrelsene. Handlingsknappen er 104/96, Hopp 96, snarveiene 64 og våpenknappene 46.
- **K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere i noen QA-kjøring på mobil eller PC.
- **K3:** Versjonen er 2.0.9 i `index.html`, og endringsloggen har en rad merket «forhåndsvisning, ikke publisert».
- **S1, S2, S3:** CSP og domener er uendret (statisk=ok). Ingen ny datainnsamling og ingen fritekst.
- **U2:** «Slik styrer du» på mobil og startkortet beskriver den nye knappen («Den store knappen gjør det den viser»).
- **Y2 (delvis):** Bildefrekvensen faller over tid i headless, men likt i 07f2d2d og 5e5b3b7 (mobil, render av: 66→34→17 mot 238→36→18 rAF per 5 s). Ingen regresjon er sett. Tallene sier ingenting om ekte enheter.
- **F2/F3, overført fra 2.0.8 (502e5fe):** Lagringskoden (`saveHero`, `SAVE_KEY`, `WORLD_KEY`) er uendret i deltaet.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet.
- **Mulig problem 1, U2:** Med fiskestanga valgt og et dyr i nærheten viser handlingsknappen «🎣 Angrip». Et trykk fisker likevel. I `mobilKnapper()` gir `ENEMY_K` (alle dyr er `animal`) «Angrip» før sjekken for stang. Det er sett én gang. At målet var et dyr, er ikke bekreftet.
  - For å avgjøre det: Velg stang, stå ved vann med et dyr innen rekkevidde, og les teksten på knappen.
- **Mulig problem 2, T2 og skjermleser:** På mobil er `#evnAvslutt` gjort 1×1 px og usynlig (`opacity:0`) øverst til venstre, slik at EVN-PAUSE fortsatt viser Avslutt. Lenken kan fortsatt nås med Tab og leses av skjermleser som en usynlig «Avslutt». Det er kodelest.
  - For å avgjøre det: Test med tastatur eller VoiceOver på nettbrett. Alternativt: gi EVN-PAUSE et eget flagg i stedet for synlighetssjekken.
- **Mulig problem 3, layout:** I alle fire mobilstørrelsene er siden 8 px høyere enn skjermen (`scrollHeight` = `innerHeight` + 8). Det er ikke sammenlignet med 2.0.8, og det kan være eldre. Hvis siden kan rulles vertikalt på iPhone, kan spillflaten flytte seg.
  - For å avgjøre det: Mål det samme på 07f2d2d, og prøv på ekte telefon.

## Anbefalte forbedringer
- Mobil i liggende 568×320: statusfeltet er 100 px høyt, og våpenlinja ligger under det. Til sammen er det 138 av 320 px på venstre side. Det er innenfor ingen gjeldende grense (UI8a er ikke tatt i bruk for spillet), men det bør prøves på ekte telefon.
- Den nye oppførselen med øks fra handlingsknappen ved tre og stein gjelder bare berøring. Det står i endringsloggen. Vurder om det skal stå i «Slik styrer du» på mobil.

## Kontroller som ikke kunne utføres
- **Skjermbilder:** `page.screenshot` hang i dette miljøet (ingen GPU, SwiftShader). Layouten er kontrollert ved måling av rektangler, ikke med bilder. Overlapp er målt mellom act, Hopp, Spis, Bygg, Bruk, kamera, ⏸, kart, hjelp, status, dag, våpenlinje, våpenrad og styrespak i tilstandene start, spis og bygg. Det er ingen overlapp, ingenting utenfor skjermen og ingen sideveis rulling. Våpenraden er bare målt med ett våpen. Med ti våpen og 375 px bredde lå øks og sverd til venstre utenfor skjermen ved første måling. Det er trolig rulleposisjonen i raden (sideveis rulling er ment), men det er ikke bekreftet.
- **Safe area (E):** Kun kodelest. `env(safe-area-inset-*)` brukes for knapper, våpenrad og styrespak, og `viewport-fit=cover` er satt. Headless Chromium har ikke innfelte kanter, så det krever iPhone.
- **Ekte berøring og flere fingre på telefon og iPad (E):** Ikke testet. Det er testet med emulert CDP-berøring.
- **Bildefrekvens (Y1, E):** Ikke testet. Det er ingen GPU.
- **Tretoning til 20 % langs tre siktlinjer og sterkere lys om natten:** Kun kodelest. Det er ingen bilder. Det må vurderes visuelt (V).
- **Plassering av bygning med handlingsknappen:** Ikke testet, fordi stedet var opptatt. Kallet til `placeBuilding` er verifisert.
- **F2/F3:** Overført fra 2.0.8 (uendret lagringskode). Ikke kjørt på nytt.
- **ST1–ST8 (overført fra 2.0.8):** `statistikk.js`, `data-spill` og `evn-start` er uendret i deltaet. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` med `data-spill="morkeskogen"` er uendret.
  - ST2: Ikke testet. Testsiden mangler.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen. Mobiloppsettet følger flere av prinsippene, men de er ikke kontrollert som krav.
- **K2, B1, B3 (lavere grafikk), B4 (V), T3, T4, U1, U3 og S4:** Ikke testet på nytt. K2, B3 og U1 er uendret siden 2.0.8.
- **Commit b1f6cc4** (toget med to lokomotiver og veranda): Ikke kontrollert.
- **Evens spilltest (V):** Om den ene handlingsknappen er lett å forstå.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. Flere fingre samtidig virker, handlingsknappen virker for tre, bue, fiske, tog og spis, pausen med Kart, Kamera og Avslutt virker, og PC er uendret. Forbeholdene er at alt på mobil er emulert, at safe area, bilder og bildefrekvens krever ekte enhet, at statistikken ikke er testet, og at b1f6cc4 kom til under kontrollen og ikke er kontrollert.
