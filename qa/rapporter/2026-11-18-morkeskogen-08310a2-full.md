# EVN Game QA: Mørkeskogen 2.0.12
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 08310a230da8c1258401637678f2acb8d23877ae
Testkvittering: evn1 commit=08310a230da8c1258401637678f2acb8d23877ae tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – samlet kontroll av hele 2.0.12 (`git diff b48b6d1 08310a2 -- spill/morkeskogen`) før versjonen foreslås publisert. Alle gjeldende krav-ID-er for Mørkeskogen er gjort rede for under.
Testet:
- **`test/kjor.mjs`:** Kjørt av QA på nøyaktig 08310a2 i en egen detached worktree (`/tmp/qafull`), med 99 OK, 0 FEIL, 0 VARSEL og 2 ikke innført (`statistikk`, `ui`). Arbeidstreet var rent før og etter (`git status --short` tom). Kvitteringen over er QA sin egen. Worktreen er fjernet etterpå.
- **Lokal server:** 127.0.0.1:8798 (`python3 -m http.server`, fra worktreen), stoppet etterpå.
- **Nettleser:** Playwright med Chromium headless (SwiftShader: `--use-gl=angle`, `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`). `statistikk.js` er rutet til tom fil.
- **Testkrok:** `spill.js` er rutet inn med én tilføyd linje til slutt i IIFE-en som bare leser interne verdier (`state`, `g`, `hero`, `keys`, `JOY`, `menuKind`, `R3`) som `window`-gettere. Spillkoden ellers er uendret. Rendering er **på** under oppstart, layout og menyer. Bare under bevegelsestesten er `R3.renderer.render` midlertidig slått av og deretter satt tilbake, fordi spillet går med ca. 0,3 bilder/s i headless med rendering (målt).
- **Enheter:** Mobil emulert (`isMobile`, `hasTouch`) i 390×844, 375×667, 320×568 (stående) og 844×390, 852×315, 667×375, 568×320 (liggende). PC i 1280×800 og 580×700 med ekte tastetrykk og museklikk via Playwright. Én enhet per kjøring.
- **Testdata:** Hver kjøring har en ny, tom nettleserkontekst. Før første innlasting legges en testhelt inn (alle ti våpen eid, 230 XP). Ingen ekte spillerdata er brukt.
- **Metode:** Rektangler, `elementFromPoint` og beregnet stil. Ingen skjermbilder. Skriptene er `/tmp/qa0831/t.js` (alle enheter) og `/tmp/qa0831/t2.js` (PC-tastatur, pausekort med hjelp). Resultatene ligger i `/tmp/qa0831/res-*.json` og `log-*.txt`.
- **Tidspunkt:** 2026-11-18 ca. 21:00–22:10, mens HEAD på grenen var dbe12b3 (bare QA-rapport etter 08310a2).

Hva er kontrollert på hvilken commit:
- **[nytt] Hele 2.0.12 mot main:** `git diff b48b6d1 08310a2` endrer bare `spill/morkeskogen/hud2.css` (+75), `hud2.js` (+37/−5), `index.html` (hintet `.h2Snu` og versjonen), `spill.js` (+14: `menuKind 'nivaa'`, `EVN2_nivaa`, `EVN2_bygg`) og `ENDRINGSLOGG.md`. Ingen endring i `test/`, `.github/`, `statistikk.js`, `vendor/` eller `fonter/`. Lagringskoden (`SAVE_KEY`, `saveHero`, `WORLD_KEY`, `FOG_KEY`) er uendret mot main.
- **[nytt] Alle kjøretidsmålinger** i denne rapporten er gjort på 08310a2.
- **Overført (samme kode, ikke målt på nytt):** Visningen «15/15» i full ressursbrikke på lave liggende skjermer er målt i delta-rapporten for 08310a2 (samme commit). Trykkflaten `::after` på nivåknappen er målt i ca7114c, 8371452 og 36c44f7. Regelen er uendret siden ca7114c (`git diff ca7114c 08310a2` rører den ikke).

## Oppfylte krav
- **[nytt] F1, oppstart og spilling:**
  - Spillet starter fra `#startBtn` i alle 9 størrelser (`state` = play, `#h2Bygg` synlig etter 35–143 s i headless).
  - Hurtiglinja tegnes, men først 40–100 s etter start, fordi løkka går med 0,3 bilder/s i headless. Dette er en målebegrensning, ikke en feil i spillet.
- **[nytt] F1, pause, hjelp og avslutt (alle 9 størrelser):**
  - ⏸ åpner pausekortet (`state` pause).
  - «🎮 Slik styrer du» viser styringshjelpen: mobiltekst på touch («👆 Gå: dra med tommelen …»), tastaturtekst på PC.
  - «▶ Fortsett» lukker kortet (`state` play).
  - «🚪 Avslutt» viser «Vil du avslutte og gå tilbake til forsiden?». «Nei, spill videre» lukker spørsmålet og går tilbake til spillet. Avslutt-lenken peker til `../../`. «Ja» er ikke trykket.
- **[nytt] F1, Bygg-knappen (`#h2Bygg`):**
  - `elementFromPoint` midt på knappen treffer knappen i alle 9 størrelser.
  - Klikk åpner «Bygg landsbyen 🏘️» (`menuKind` build). Lukk gir `state` play.
  - I byggemodus avbryter et klikk byggingen (`g.build` → null, `state` play) i alle 9.
  - Størrelse: 56×56 stående og på PC, 48×48 (`.liten`) ved liggende høyde ≤ 430 (844×390, 852×315, 667×375, 568×320).
- **[nytt] F1, nivåknappen og nivåmenyen (alle 9):**
  - Klikk på «⭐ Nivå 2 ›» åpner menyen `nivaa` med tittelen «⭐ Nivå 2».
  - Med 230 XP: «130 av 150 XP · 20 XP igjen til nivå 3», samme tall som `heroLevel()` (L 2, x 130, need 150). Menyen har 9 rader (nivå 2–10).
- **[nytt] F1/B2, Kart:**
  - Mobil: `#h2Kart` åpner kartet (`#evnKart.vis`, `state` pause) i alle 7 mobilstørrelser.
  - PC: `#evnKartKnapp` åpner kartet. M åpner og Esc lukker.
  - Fokus går til ✕ (`evnKartLukk`). ✕ lukker kartet (`state` play).
  - Spillet står stille mens kartet er åpent (`state` = pause).
- **[nytt] F1, ryggsekken:** 🎒 i hurtiglinja (syntetisk `pointerdown`) åpner «Ryggsekk 🎒» (`menuKind` weapons) i alle 9. Fanene Sekk, Våpen og Lag kan velges.
- **[nytt] Menykortet (bygg, nivå, sekk med tre faner), alle 9 størrelser:**
  - Kortet er innenfor skjermen. ✕ og «Lukk» er synlige.
  - Listen ruller alene, og siste rad kan rulles helt frem.
  - Fanene står øverst i listen også etter rulling.
  - Listehøyde: 163 px (852×315), 168 (568×320), 223 (667×375), 238 (844×390), 292–330 (320×568), 429 (375×667), 606 (390×844), 462 (580×700) og 562 (1280×800).
- **[nytt] F1, samtidig styring på mobil (syntetiske PointerEvents, ikke CDP-touch), alle 7 mobilstørrelser:**
  - Fingrene holdes nede samtidig: styrespak (`pointerdown` og `pointermove` på `#game` i styrespakfeltet, id 11), Hopp (id 12), handling `#act` (id 13) og sverdet i hurtiglinja (id 14).
  - Mens de holdes: `keys.jump`, `keys.act` og `keys.ctx` er true. `JOY.id` = 11 med `mag` 0,91 (fremover). Våpenet byttet fra øks til sverd. `state` forble play.
  - Når fingrene slippes: alle taster er false, og `JOY.id` er null. Helten driver høyst 1 enhet etter slipp.
  - Effekt i spillet, med rendering slått av og 1–3 bilder/s: Helten flyttet seg (1110 og 1202 enheter) og hoppet (`z` til 395) på 390×844 og 320×568. På 852×315, 844×390 og 375×667 hoppet den (`z` 345) og flyttet seg 7 enheter. På 667×375 og 568×320 kom ingen spilløkke-ramme med i måletiden. Der er bare tastene og styrespaken bekreftet, se «Kontroller som ikke kunne utføres».
- **[nytt] F2, lagring og gjenoppretting** (390×844 og 1280×800, testkopi i egen kontekst):
  - `hero.xp` satt til 241 og lagret med `saveHero()`. Etter omlasting er `hero.xp` 241, og alle 10 våpen er beholdt.
  - «🗑️ Start helt på nytt» viser en bekreftelse. «Nei, behold alt» lukker den, og lagringen er urørt (alle 9 størrelser).
- **[nytt] F3, ødelagt lagring** (390×844 og 1280×800):
  - `mork3d.helt` er satt til `{ødelagt` og `mork3d.verden` til `x{`. Siden laster uten feil, og helten er ny (øks, 0 XP).
  - Den ødelagte teksten er tatt vare på i `mork3d.helt.kopi`. Spillet starter og kan spilles (`state` play).
- **[nytt] U1, startkortet (alle 9):** Tittelen «Mørkeskogen», «Versjon 2.0.12 · 3D», Start, vei tilbake (`#evnTilbake`) og «Start helt på nytt». `royk` bekrefter versjonen (U1, K3).
- **[nytt] U1/U2, hintet «📱↔️ Spillet er best liggende. Snu telefonen!» (`.h2Snu`):**
  - Det vises på touch i stående format (390×844, 375×667, 320×568) og er skjult liggende og på PC.
  - Start er synlig uten rulling stående: 320×568 y 391–438, 375×667 y 548–607, 390×844 y 541–600.
- **[nytt] U2:** Dagen står i statusfeltet (`#hud > .panel #h2Bunn #h2Dag`, «☀️ Dag 1 🌲 Skogen») i alle 9. Styringshjelpen er i pausen.
- **[nytt] Layout uten overlapp, med lang toast, alle 9 størrelser, målt to ganger** (rett etter start og etter alle menyene):
  - Ingen par overlapper blant statusfeltet, ⏸, kart (PC), Avslutt (PC), Bygg, Kart, nivåknappen, våpenlinja, hurtiglinja, handlingsknappen, Hopp, styrespaken, toast, prompt og hint.
  - Ingen knapp er dekket i midtpunktet (`elementFromPoint`).
  - Alt er innenfor vinduet, unntatt hurtiglinja på PC 580×700 (eldre, se «Andre avvik»).
  - Liggende (852×315, 844×390, 667×375, 568×320): ⏸, Bygg og Kart står på rad øverst (y 16–64). For eksempel 568×320: Kart 392–440, Bygg 448–496, ⏸ 504–548. Handlingsknappen og Hopp er fri.
  - Stående (390, 375, 320): Bygg står under ⏸ og Kart under Bygg (y 68–124 og 132–188).
  - PC: Bygg står under toppraden (1280: x 1212–1268, y 62–118).
- **[nytt] T1:**
  - ⏸ er 44×44, Bygg og Kart 56×56 eller 48×48, handlingsknappen 96–104, Hopp 72.
  - Knappene i pausen er minst 48 px høye.
  - Nivåknappen er 74×22 (mobil) og 79×24 (PC), med 44 px trykkflate (`::after`, overført).
  - Se «Andre avvik» for ✕, Lukk og fanene på lave skjermer.
- **[nytt] T2, PC 1280×800:**
  - B åpner og lukker Bygg. I åpner ryggsekken, og Esc lukker den. M åpner kartet, og Esc lukker det. P åpner pausen, og Esc lukker den.
  - Tab når ⏸, kart, hjelp, Avslutt, hurtiglinja, 🎒 og nivåknappen. Enter på nivåknappen åpner nivåmenyen.
  - Tallet 2 bytter til sverd, og E gir handling (`keys.act`).
- **[nytt] T3:** Zoom er ikke sperret (`statisk`: `width=device-width, initial-scale=1, viewport-fit=cover`). 2.0.12 legger ikke til animasjoner eller overganger (`git diff` av `hud2.css` har ingen `animation` eller `transition`).
- **[nytt] T4 (overført fra delta-rapporten for 08310a2, samme commit):** Fullt lager vises med «15/15» også på lave liggende skjermer. Ikke-fulle brikker viser bare tallet. Dermed skilles full og nylig ikke bare med farge. Denne kjøringen så bare «🪵 0» (liggende) og «🪵 0 /15» (stående), som stemmer med regelen.
- **[nytt] Y2:** Simulert skjult fane (`visibilitychange` med `document.hidden` true) åpner pausen (`state` pause) på 1280×800.
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere i noen av de 9 størrelsene, heller ikke under lagrings- og F3-testene. `royk` K1 er OK.
- **[nytt] K3:** «Versjon 2.0.12 · 3D» på startkortet, og 2.0.12 står i `ENDRINGSLOGG.md`. Se «Andre avvik» om statusen.
- **[nytt] S1:** `statisk` S1 er OK: CSP uten `unsafe-eval`, bare godkjente domener, ingen eksterne filer og ingen `eval`.
- **[nytt] S2, S3:** Ingen konto, chat, kjøp, reklame eller ny datainnsamling i diffen. Ingen fritekst. Nye `localStorage`-nøkler: ingen.
- **[nytt] B2:** Kartet åpnes og spillet står stille (`state` pause) mens det er åpent. Se ellers «Kontroller som ikke kunne utføres».

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Verifisert feil (liten), T2/F1, PC 1280×800:** Mellomrom åpner nivåmenyen igjen i stedet for å hoppe.
  - Når nivåknappen er nådd med Tab og åpnet med Enter, blir fokuset på knappen etter at menyen er lukket med Esc.
  - Neste trykk på mellomrom (hopp) åpner nivåmenyen igjen (`state` menu, `menuKind` nivaa).
  - Årsaken er at `keydown`-lytteren på `.h2NivaaKnapp` (i `hud2.js`) reagerer på mellomrom før spillets egen lytter på `window`.
  - Bygg-knappen har ikke dette problemet: med fokus på `#h2Bygg` gir mellomrom ingen meny. Med museklikk på nivåknappen blir ikke fokuset stående, så da skjer det ikke.
  - Gjenskaping: PC, Tab til «⭐ Nivå», Enter, Esc og deretter mellomrom.
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet. Etter fem knapper i pausen gikk fokus til nivåknappen, Bygg og `body`.
- **T1, mulig problem (kjent fra ca7114c):** Ved høyde ≤ 420 px er menyens ✕ 24 px høy og «Lukk» 37 px høy. Fanene er 36 px (`min-height:36px`). Det er under 44 px. Målt i 852×315, 844×390, 667×375 og 568×320. Prøv på telefon om de er lette å treffe.
- **Mulig problem, eldre (ikke regresjon):** Pausekortet med styringshjelpen åpen går litt utenfor vinduet i 375×667, 320×568, de fire liggende størrelsene og 580×700. I 390×844 og 1280×800 er det innenfor.
  - Målt nøyaktig på 568×320: kortet er y −2 til 322 (4 px for høyt). Innholdet ruller i kortet (`overflow:auto`), og «Avslutt» kan rulles frem.
  - `EVNPause` er ikke endret i 2.0.12.
- **Eldre, ikke regresjon:** På PC 580×700 går hurtiglinja med ti våpen utenfor vinduet (x −39 til 619).
- **Eldre, ikke regresjon:** Liggende 852×315, 844×390 og 568×320: Start på startkortet ligger rett ved eller under skjermkanten (bunn 321 og 320). Kortet må rulles for «Tilbake» og «Start helt på nytt».
- **Eldre, ikke regresjon:** Dokumentet er 8 px høyere enn vinduet i alle 9 størrelser (`scrollHeight` − `innerHeight` = 8). Ingen synlige elementer ligger utenfor.
- **K3, mulig problem:** 2.0.12-raden i `ENDRINGSLOGG.md` har fortsatt status «(ikke publisert)». Den bør oppdateres ved publisering.

## Anbefalte forbedringer
- La nivåknappens `keydown` bare reagere på Enter, eller flytt fokus bort (for eksempel `blur()`) når nivåmenyen lukkes, slik Bygg-knappen oppfører seg.
- Gi ✕, «Lukk» og fanene `min-height:44px` også ved lav liggende høyde, hvis det er plass.
- Hold pausekortet innenfor vinduet (for eksempel `max-height: calc(100dvh - 32px)` på `.kort`).

## Kontroller som ikke kunne utføres
- **Bevegelse og hopp på 667×375 og 568×320, og bevegelse med W på PC:** Ikke bekreftet. Spilløkka kom ikke frem til neste ramme i måletiden (0,3 bilder/s med rendering, 1 bilde/s uten). Tastene og styrespaken er registrert riktig. Bevegelse og hopp er bekreftet på andre mobilstørrelser.
- **Ekte berøring, flere fingre på fysisk skjerm og safe area (E):** Ikke testet. Bare syntetiske PointerEvents i emulert mobil.
- **Skjermbilder og visuell vurdering (V):** Ikke tatt. Alt er målt med rektangler og stil.
- **«Ja, avslutt» og «Ja, slett alt»:** Ikke trykket (ville forlatt siden eller slettet testdata). Bare at spørsmålet vises og «Nei» virker, er testet.
- **U3 (V):** Teksten i nivåmenyen og hintet er lest («130 av 150 XP · 20 XP igjen til nivå 3», «Spillet er best liggende. Snu telefonen!») og er enkel norsk. Opplevelsen er ikke vurdert av Even.
- **K2:** Ikke testet på nytt. `#evnFeil` med «Last på nytt» finnes og er uendret.
- **S4:** Ikke kontrollert på nytt. 2.0.12 samler ikke inn nye data, så personvernsiden trenger ingen endring.
- **Y1 (E):** Ingen GPU og ingen referansemobil. Headless-målingen (0,3 bilder/s) sier ingenting om ekte enheter.
- **Y2, hastighet uavhengig av skjermfrekvens:** Ikke testet.
- **B1 (lyd av/på og huskes):** Ikke testet på nytt. Lydkoden er ikke endret.
- **B2, at kartet viser hvor spilleren er:** Ikke vurdert visuelt. Kartkoden er ikke endret.
- **B3 (melding når 3D ikke virker, lavere grafikk):** Ikke testet på nytt. Meldingen (`#no3d`) og grafikkvalget er uendret.
- **B4 (V):** Ikke vurdert på nytt. 2.0.12 endrer ikke kamp eller skrekkinnhold.
- **ST1–ST8:** `statistikk.js`, `data-spill="morkeskogen"` og `evn-start` er uendret mot main (`git diff b48b6d1 08310a2` rører dem ikke). `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` er lastet med `data-spill="morkeskogen"` og er uendret. I testen var den rutet til tom fil.
  - ST2: Ikke testet. Testsiden mangler. Nivåmenyen setter `state = 'menu'` som de andre menyene, og kartet setter pause.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen (`ui=ikke-innfort`).
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil på 08310a2. Bygg, nivå, Kart, ryggsekk, pause, hjelp og avslutt virker i alle 9 størrelser, uten overlapp eller konsollfeil, og lagringen overlever både omlasting og ødelagte data. Forbeholdene er en liten tastaturfeil (mellomrom åpner nivåmenyen igjen når knappen har fokus), at ✕, Lukk og fanene er under 44 px på lave liggende skjermer, at Tab går ut av pausen (kjent), at alt på mobil er emulert, og at statistikken ikke er testet. Rapporten er ikke en publiseringsgodkjenning.
