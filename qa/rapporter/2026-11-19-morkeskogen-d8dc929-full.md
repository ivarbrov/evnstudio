# EVN Game QA: Mørkeskogen 2.0.12
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit d8dc9291d53399e5bb1a4a8bbf723316a0c9d987
Testkvittering: evn1 commit=d8dc9291d53399e5bb1a4a8bbf723316a0c9d987 tester=d2d370024a38 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – samlet kontroll av hele 2.0.12 (`git diff b48b6d1 d8dc929 -- spill/morkeskogen`) etter siste kodeendring (søvn på 3 s og nivåknappen slipper fokus). Alle gjeldende krav-ID-er for Mørkeskogen er gjort rede for under.
Testet:
- **`test/kjor.mjs`:** Kjørt av QA på nøyaktig d8dc929 i en egen detached worktree (`/tmp/qad8`), med 99 OK, 0 FEIL, 0 VARSEL og 2 ikke innført (`statistikk`, `ui`). Arbeidstreet var rent før og etter (`git status --short` tom). Kvitteringen over er QA sin egen. Worktreen er fjernet etterpå.
- **Lokal server:** 127.0.0.1:8798 (`python3 -m http.server`, fra worktreen), stoppet etterpå.
- **Nettleser:** Playwright med Chromium headless (SwiftShader: `--use-gl=angle`, `--use-angle=swiftshader`, `--enable-unsafe-swiftshader`). `statistikk.js` er rutet til tom fil. Vent på at `#h2Bygg` ikke er `hidden` (opptil 300 s).
- **Testkroker (bare lesing, spillkoden ellers uendret):**
  - Søvntesten: `spill.js` rutet inn med én linje rett etter første `(() => {` som gir `window.__g = () => g` og gettere for `state`, `hero`, `R3`, `phaseInfo`, `DAY`, `DUSK`, `NIGHT`, `CYCLE` og `SOVETID`.
  - Regresjonstesten: samme krok som i 08310a2-rapporten, til slutt i IIFE-en (`state`, `g`, `hero`, `keys`, `JOY`, `menuKind`, `R3`).
- **Enheter:** Mobil emulert (`isMobile`, `hasTouch`) i 390×844, 375×667, 320×568 (stående) og 844×390, 852×315, 667×375, 568×320 (liggende). PC i 1280×800 og 580×700 med ekte tastetrykk via Playwright. Søvntesten er kjørt på PC 1280×800. Én enhet per kjøring.
- **Testdata:** Hver kjøring har en ny, tom nettleserkontekst med en testhelt (230 XP). Ingen ekte spillerdata er brukt.
- **Metode:** Rektangler, `elementFromPoint`, beregnet stil og interne verdier. Ingen skjermbilder. Skriptene er `/tmp/qad8s/sove.js` (søvn) og `/tmp/qad8s/t.js` (alle enheter; `/tmp/qa0831/t.js` med nye stier og en ekstra kontroll av mellomrom etter nivåmenyen). Resultatene ligger i `/tmp/qad8s/res-*.json` og `log-*.txt`.
- **Tidspunkt:** 2026-11-19 ca. 20:35–21:27, mens HEAD på grenen var d8dc929.

Hva er kontrollert på hvilken commit:
- **[nytt] Endringen siden 08310a2:** `git diff 08310a2 d8dc929` endrer bare `spill/morkeskogen/spill.js` (+4/−1: `SOVETID = 3` i `goSleep`), `hud2.js` (én linje: `nv.blur()` i nivåknappens `apne`), `ENDRINGSLOGG.md` og to QA-rapporter. Ingen endring i `test/`, `.github/`, `.claude/`, `statistikk.js`, `vendor/` eller `fonter/`. Lagringskoden er uendret.
- **[nytt] Alle kjøretidsmålinger** i denne rapporten er gjort på d8dc929.
- **Overført fra 08310a2-rapporten (kode uendret, ikke målt på nytt):** «15/15» i full ressursbrikke på lave liggende skjermer (T4). Trykkflaten `::after` på nivåknappen (T1). Y2 skjult fane gir pause (`/tmp/qa0831/t2.js`). Pausekortets overløp målt nøyaktig på 568×320.

## Oppfylte krav
- **[nytt] F1, søvn i halmsenga (PC 1280×800, testlagring):**
  - **Metode:** Seng lagt i `g.buildings` ved helten, `g.time` satt til ønsket fase, E holdt nede til `g.sleep` ble satt. Rendering slått av (`R3.renderer.render = () => {}`). Hver nettleserramme er fulgt med `requestAnimationFrame`. Spilltid i senga er `g.sleep.t`, altså summen av `dt` som spillet selv bruker. Et monster er lagt 5 enheter fra helten (ikke på vei bort) under søvnen.
  - **Fra tidlig kveld (fase 116, rett etter grensen 115):** Morgen etter 3,00 s spilltid i senga. Tiden går 24,7 ganger fortere (74 spilltidsenheter).
  - **Fra midt på natten (fase 164,5):** Morgen etter 2,90 s spilltid i senga (8,5 ganger fortere, 25,4 enheter). Det er litt under 3 s fordi spilleren står opp når fasen når slutten av natten + 2, og tiden er satt til å nå + 3.
  - **Virkelig tid:** I headless gikk spillet med ca. 0,25–1,5 bilder/s også uten rendering, så søvnen tok 96 s og 109 s virkelig tid. Spillet begrenser `dt` til 0,05 s per bilde. Ved 20 bilder/s eller mer er spilltid lik virkelig tid, så søvnen tar da ca. 2,9–3,0 s. Det er ikke målt på ekte enhet.
  - **Ingen skade:** Laveste HP under søvnen var 50,31 (start 50), selv om monsteret sto 8–16 enheter unna. Monstre som fantes fra før, fikk `leave`.
  - **Stå opp:** Helten står 38 enheter til høyre og 10 ned fra senga (`S.b.x + 38`, `S.b.y + 10`) begge gangene.
  - **HP +30:** 56,04 → 86,08 og 55,70 → 85,73 i rammen der spilleren står opp.
  - **Oppdraget «God natt!» (`sovet`):** 0 → 1, fullført og lagret i `mork3d.helt` etter første søvn. Andre søvn gir det ikke på nytt.
  - **Dag-telleren:** `g.nights` 0 → 1 → 2, én natt per søvn. Statusfeltet viser nummer 2 og 3 etterpå (se «Andre avvik» om at det står «🌙 Natt» et øyeblikk).
  - **Om dagen:** Ved fase 60 og 114 vises «Du er ikke trøtt ennå 🙂 Kom tilbake når det blir kveld 🌙», og helten sover ikke.
  - Ingen konsollfeil under søvntesten.
- **[nytt] T2/F1, rettingen av nivåknappen (PC 1280×800 og 580×700, ekte tastetrykk):**
  - Tab når ⏸, kart, hjelp, Avslutt, hurtiglinja, 🎒 og nivåknappen. Enter åpner nivåmenyen (`menu`, `nivaa`). Esc lukker (`play`).
  - Etter Esc har `body` fokus, ikke nivåknappen.
  - Mellomrom gir nå hopp: `keys.jump` true mens den holdes, `state` play og ingen meny. Etter slipp er `keys.jump` false. Feilen fra 08310a2 er rettet.
- **[nytt] F1, oppstart og spilling:** Spillet starter fra `#startBtn` i alle 9 størrelser (`state` play, `#h2Bygg` synlig etter 39–190 s i headless). Hurtiglinja tegnes i alle 9.
- **[nytt] F1, pause, hjelp og avslutt (alle 9):** ⏸ åpner pausekortet (`state` pause). «🎮 Slik styrer du» viser mobiltekst på touch og tastaturtekst på PC. «▶ Fortsett» gir `play`. «🚪 Avslutt» viser «Vil du avslutte og gå tilbake til forsiden?». «Nei, spill videre» går tilbake til spillet. Avslutt-lenken peker til `../../`. «Ja» er ikke trykket.
- **[nytt] F1, Bygg-knappen (alle 9):** `elementFromPoint` treffer knappen. Klikk åpner «Bygg landsbyen 🏘️» (`build`), og Lukk gir `play`. I byggemodus avbryter et klikk byggingen (`g.build` null). 56×56 stående og på PC, 48×48 liggende med høyde ≤ 430.
- **[nytt] F1, nivåknappen og nivåmenyen (alle 9):** Klikk åpner «⭐ Nivå 2» med «130 av 150 XP · 20 XP igjen til nivå 3», samme som `heroLevel()`. 9 rader (nivå 2–10).
- **[nytt] F1/B2, Kart:** `#h2Kart` (mobil, 7 størrelser) og `#evnKartKnapp` (PC) åpner kartet (`state` pause). Fokus går til ✕, og ✕ lukker (`play`). M åpner og Esc lukker på PC.
- **[nytt] F1, ryggsekken (alle 9):** 🎒 i hurtiglinja åpner «Ryggsekk 🎒» (`weapons`). Fanene Sekk, Våpen og Lag kan velges.
- **[nytt] Menykortet (bygg, nivå, sekk med tre faner), alle 9:** Kortet er innenfor skjermen. ✕ og Lukk er synlige. Listen ruller alene, siste rad kan rulles frem, og fanene står øverst etter rulling. Listehøyder som i 08310a2: 163 (852×315), 168 (568×320), 223 (667×375), 238 (844×390), 292–330 (320×568), 429 (375×667), 606 (390×844), 462 (580×700) og 562 (1280×800).
- **[nytt] F1, samtidig styring på mobil (syntetiske PointerEvents), alle 7 mobilstørrelser:** Styrespak (id 11), Hopp (12), handling (13) og sverdet i hurtiglinja (14) holdt samtidig gir `keys.jump`, `keys.act` og `keys.ctx` true, `JOY.id` 11 med `mag` 0,91, våpenbytte til sverd og `state` play. Etter slipp er alle false og `JOY.id` null. Bevegelse i spillet er ikke bekreftet denne gangen, se «Kontroller som ikke kunne utføres».
- **[nytt] F2, lagring og gjenoppretting (390×844 og 1280×800):** `hero.xp` 241 lagret og beholdt etter omlasting, alle 10 våpen beholdt. «Start helt på nytt» viser bekreftelse, og «Nei, behold alt» lar lagringen være (alle 9). Søvntesten bekrefter i tillegg at oppdraget `sovet` lagres.
- **[nytt] F3, ødelagt lagring (390×844 og 1280×800):** `{ødelagt` og `x{` gir ny helt (øks, 0 XP), originalen i `mork3d.helt.kopi`, og spillet starter (`play`).
- **[nytt] U1 (alle 9):** «Mørkeskogen», «Versjon 2.0.12 · 3D», Start, `#evnTilbake` og «Start helt på nytt». `royk` bekrefter versjonen.
- **[nytt] U1/U2, hintet «Spillet er best liggende»:** Vises stående på touch (390×844, 375×667, 320×568), skjult liggende og på PC. Start synlig uten rulling stående (320×568 y 391–437, 375×667 y 547–608, 390×844 y 540–601).
- **[nytt] U2:** Dagen står i statusfeltet (`#h2Dag`, «☀️ Dag 1 🌲 Skogen») i alle 9. Styringshjelpen er i pausen.
- **[nytt] Layout uten overlapp, med lang toast, alle 9 størrelser, målt to ganger:** Ingen overlapp blant statusfeltet, ⏸, kart, Avslutt, Bygg, Kart, nivåknappen, våpenlinja, hurtiglinja, handlingsknappen, Hopp, styrespaken, toast, prompt og hint. Ingen knapp dekket i midtpunktet. Alt innenfor vinduet, unntatt hurtiglinja på PC 580×700 (eldre). Posisjonene er de samme som i 08310a2 (for eksempel 568×320: Kart 392–440, Bygg 448–496, ⏸ 504–548; stående Bygg y 68–124 og Kart y 132–188; PC 1280 Bygg x 1212–1268, y 62–118).
- **[nytt] T1:** ⏸ 44×44, Bygg og Kart 56 eller 48, handlingsknappen 96–104, Hopp 72. Menyens ✕ og Lukk på lave skjermer: se «Andre avvik».
- **[nytt] T2, PC (1280×800 og 580×700):** B åpner og lukker Bygg. I åpner ryggsekken, og Esc lukker. M åpner kartet, og Esc lukker. P åpner pausen, og Esc lukker. 2 bytter til sverd. Mellomrom etter nivåmenyen: se over.
- **[nytt] T3:** Zoom er ikke sperret (`statisk`). Endringen legger ikke til animasjoner eller overganger.
- **T4 (overført fra 08310a2, `hud2.css` og ressurskoden er uendret):** Fullt lager vises med «15/15» også på lave liggende skjermer. Denne kjøringen så «🪵 0» liggende og «🪵 0 /15» stående, som stemmer med regelen.
- **Y2 (overført fra 08310a2, pausekoden er uendret):** Simulert skjult fane åpner pausen.
- **[nytt] K1:** Ingen sidefeil, konsollfeil eller svar på 400 eller høyere i noen av de 9 størrelsene eller i søvntesten. `royk` K1 er OK.
- **[nytt] K3:** «Versjon 2.0.12 · 3D» på startkortet, og 2.0.12-raden i `ENDRINGSLOGG.md` beskriver søvnen og nivåknappen. Se «Andre avvik» om statusen.
- **[nytt] S1:** `statisk` S1 er OK.
- **[nytt] S2, S3:** Ingen konto, chat, kjøp, reklame, fritekst eller ny datainnsamling. Ingen nye `localStorage`-nøkler (målt: `mork3d.helt`, `evn-spilletid-morkeskogen`, `mork3d.kart`).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Mulig problem (lite, eldre, ikke regresjon), F1/U2 søvn:** Rett etter «God morgen» viser statusfeltet «🌙 Natt 2» (og «🌙 Natt 3» etter andre søvn), ikke «☀️ Dag 2».
  - Spilleren står opp ved fase 189–190, mens teksten bytter til «Dag» først når mørket er under halvparten (fase 191). Ved normal fart varer det ca. 1–2 s.
  - Telleren er riktig (én natt per søvn). Vilkåret for å stå opp er uendret fra 08310a2.
- **Mulig problem (lite, eldre), søvnmeldinger:** Første gang erstattes «☀️ God morgen!» og «Du overlevde natt 1!» i samme bilde av «📜 Oppdrag fullført: Første natt!» og «📜 Oppdrag fullført: God natt!!» (to utropstegn, fordi oppdragsnavnet slutter med «!»). Fra tidlig kveld vises også «🌙 Det blir mørkt! Hold bålet i gang!» mens helten sover.
- **Mulig problem (kodelest, ikke målt, eldre):** Legger du deg ved daggry (fase 189–195), står du opp med en gang og får +30 HP. Det kan gjentas. Vilkåret er uendret fra før 2.0.12.
- **T2 (kjent funn, uendret):** Tab går ut av pausekortet. Etter fem knapper i pausen gikk fokus ut av kortet (1280×800 og 580×700).
- **T1, mulig problem (kjent fra ca7114c):** Ved høyde ≤ 420 px er menyens ✕ 24 px høy og «Lukk» 37 px høy. Fanene er 36 px. Målt igjen i 852×315, 844×390, 667×375 og 568×320.
- **Mulig problem, eldre:** Pausekortet med styringshjelpen åpen går litt utenfor vinduet i 375×667, 320×568, de fire liggende størrelsene og 580×700 (innenfor i 390×844 og 1280×800). Innholdet ruller i kortet. `EVNPause` er uendret.
- **Eldre, ikke regresjon:** På PC 580×700 går hurtiglinja utenfor vinduet.
- **Eldre, ikke regresjon:** Liggende 852×315, 844×390 og 568×320: Start ligger rett ved skjermkanten (bunn 320–321).
- **Eldre, ikke regresjon:** Dokumentet er 8 px høyere enn vinduet i alle 9 størrelser.
- **K3, mulig problem:** 2.0.12-raden i `ENDRINGSLOGG.md` har fortsatt status «(ikke publisert)». Den bør oppdateres ved publisering.

## Anbefalte forbedringer
- Vis «☀️ Dag N» med en gang spilleren står opp, for eksempel ved å la søvnen gå til fase ≥ 191, eller ved å bruke `ph.night` for teksten.
- Vis «God morgen» etter oppdragsmeldingene (eller samle dem), og fjern det doble utropstegnet i «God natt!!».
- Ikke tillat søvn ved daggry (fase etter nattens slutt).
- Gi ✕, «Lukk» og fanene `min-height:44px` også ved lav liggende høyde, hvis det er plass.
- Hold pausekortet innenfor vinduet, og hold Tab inne i pausekortet.

## Kontroller som ikke kunne utføres
- **Søvn i virkelig tid på ekte enhet:** Ikke målt. Headless gikk med under 2 bilder/s. «Ca. 3 s» er utledet fra spilltiden (`g.sleep.t` = 2,9–3,0 s) og at `dt` er lik virkelig tid ved 20 bilder/s eller mer. Under 20 bilder/s tar søvnen lengre tid.
- **Bevegelse og hopp i spillet på mobil og PC:** Ikke bekreftet denne gangen. Ingen spilløkke-ramme kom med i måletiden i noen størrelse. Tastene, styrespaken og våpenbyttet er registrert riktig. Bevegelseskoden er uendret siden 08310a2, der bevegelse og hopp ble bekreftet på 390×844, 320×568, 852×315, 844×390 og 375×667.
- **Ekte berøring, flere fingre på fysisk skjerm og safe area (E):** Ikke testet.
- **Skjermbilder og visuell vurdering (V):** Ikke tatt, heller ikke av søvnen.
- **«Ja, avslutt» og «Ja, slett alt»:** Ikke trykket.
- **U3 (V):** Søvnmeldingene og nivåmenyen er lest og er enkel norsk. Opplevelsen er ikke vurdert av Even.
- **K2:** Ikke testet på nytt. `#evnFeil` er uendret.
- **S4:** Ikke kontrollert på nytt. Ingen ny datainnsamling.
- **Y1 (E):** Ingen GPU og ingen referansemobil.
- **Y2, hastighet uavhengig av skjermfrekvens:** Ikke testet. Søvnen er nå fast 3 s spilltid uavhengig av når du legger deg.
- **B1 (lyd):** Ikke testet på nytt. Lydkoden er uendret.
- **B2, at kartet viser hvor spilleren er:** Ikke vurdert visuelt. Kartkoden er uendret.
- **B3:** Ikke testet på nytt. `#no3d` og grafikkvalget er uendret.
- **B4 (V):** Ikke vurdert på nytt. Søvnen gjør natten kortere, men endrer ikke kamp eller skrekkinnhold.
- **ST1–ST8:** `statistikk.js`, `data-spill="morkeskogen"` og `evn-start` er uendret mot main. `test/statistikk/` finnes ikke (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter etter publisering, krever en voksen med innlogging.
  - ST1: Kun kodelest. `statistikk.js` er lastet med `data-spill="morkeskogen"` og er uendret. I testen var den rutet til tom fil.
  - ST2: Ikke testet. Testsiden mangler. Søvnen endrer ikke `state`, så aktiv spilletid telles som før mens du sover.
  - ST3: Ikke testet. Testsiden mangler.
  - ST4: Ikke testet. Testsiden mangler.
  - ST5: Ikke testet. Testsiden mangler.
  - ST6: Ikke testet. Testsiden mangler.
  - ST7: Ikke testet. Testsiden mangler.
  - ST8: Ikke testet. `test/statistikk/` finnes ikke.
- **UI1–UI10:** Ikke tatt i bruk for Mørkeskogen (`ui=ikke-innfort`).
- **Evens spilltest (V).**

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil på d8dc929. Søvnen virker: morgen etter 3 s spilltid både fra kvelden og midt på natten, ingen skade, +30 HP, oppdraget «sovet» og én dag frem. Mellomrom hopper nå etter nivåmenyen. Bygg, nivå, Kart, ryggsekk, pause, hjelp og avslutt virker i alle 9 størrelser, uten overlapp eller konsollfeil, og lagringen overlever omlasting og ødelagte data. Forbeholdene er at det står «🌙 Natt» et øyeblikk etter at du har stått opp, at 3 s ikke er målt i virkelig tid på ekte enhet, at ✕, Lukk og fanene er under 44 px på lave liggende skjermer, at Tab går ut av pausen (kjent), at alt på mobil er emulert, og at statistikken ikke er testet. Rapporten er ikke en publiseringsgodkjenning.
