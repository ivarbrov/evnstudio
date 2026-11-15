# EVN Game QA: Min Bondegård 0.15.11 (med forsiden og E-coins-regeltabellen)
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 34623bcf90ade8a66710b118e1e994006221bc67
Testkvittering: evn1 commit=34623bcf90ade8a66710b118e1e994006221bc67 tester=609754e6e8bc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – kontroll før publisering. Endringen gjelder et nytt spill på nettsiden, forsiden og den felles E-coins-tabellen.
Testet:
- **Commit:** SHA-en i oppdraget (34623bc2fe0d…) finnes ikke i repoet. Koordinatoren rettet den til 34623bcf90ad…, og den er lik HEAD på `spill/min-bondegard`.
- **Uttrekk:** Alt er kjørt mot en ren klone i `/tmp/qa-mb`, servert på port 8821. Til sammenligning ble uttrekk av 27d7f7b (0.15.0, port 8822) og 26c1539 (0.15.8, port 8823) brukt.
- **Nettleser:** Chrome headless med SwiftShader, styrt over DevTools-protokollen. Tastetrykk, mus og berøring var syntetiske hendelser. Testtilstanden ble satt opp med `window.__spill` i egne profiler, og `localStorage` ble tømt før og etter.
- **Størrelser:** 1280×800 (mus). 375×812, 740×360, 320×568 og 568×320 med emulert berøring. Forsiden er også testet i 1280×800, 375×812 og 320×568.
- **Node:** `test/kjor.mjs` ga 99 ok og 0 feil. `logikk.test.mjs` ga 111 ok og 0 feil. `sim.mjs 100 11` nådde nivå 10 etter 35,1 min (aktiv spiller) og 38,0 min (barn), i 100 av 100 kjøringer, med 0 fastlåst.

## Oppfylte krav
- **F1:**
  - Tab går til Start, og Enter starter spillet. P åpner pausen, Esc lukker den, og Fortsett virker.
  - Avslutt spør først, og «Nei, spill videre» blir i spillet.
  - På nivå 1 gir klikk på varebilen en forklaring. På nivå 4 åpner klikket tavla. En levering setter bilen i gang, og bilen står stille i pause (samme posisjon etter 3 s).
  - Hele bilturen er simulert ved 30, 60 og 144 bilder per sekund. Den tar 28,0, 28,0 og 27,9 s, ender på (−5,5; 1,7) og treffer ingenting.
- **F2:**
  - Nivå, mynter og XP er like etter omlasting.
  - Nullstilling spør «Starte helt på nytt?» med fokus på «Nei, behold alt». «Nei» beholder lagringen, og «Ja» sletter alle nøklene.
- **F3:**
  - **Lagring fra 0.15.0 og 0.15.8 på nivå 10:** Nivå, XP, 48 200 mynter, lager og områder er beholdt. E-coins er 60, også etter ny omlasting. Tavla står på (−2,3; 4,6). Ingen overlapp, ingen feilkort og tom konsoll.
  - **Gåte fra den gamle lagringen uten varen på lager:** Feil svar gir «Nei, det er ikke hvete. Prøv igjen!». Riktig svar virker.
  - **Ødelagt JSON:** Spillet starter, og spilleren får en melding. Originalen er tatt vare på.
  - **Felt med feil type:** Spillet starter uten feilkort.
- **Rettinger siden 0.15.8, verifisert:**
  - **Siloen:** En lagring fra 0.15.0 på nivå 9 har kjøkkenplassen på (0,45; −8,8) oppå siloen. I 0.15.11 får plassen `x = null`, og det er ingen overlapp. Etter kjøp av Enga og omlasting kommer plassen på (20; 7,7). Kjøkkenet kan kjøpes og står der etter omlasting, uten overlapp.
  - **Gåten:** På nivå 2, 3, 5 og 10 ble 525 gåtekort laget. Svaret var alltid med, og det var ingen dubletter. Svaret var aldri den eneste varen spilleren manglet. Rekkefølgen er den samme når kortet vises på nytt.
  - **Skjermleserteksten:** `aria-label` sier «Send bestilling N med varebilen» (`spill.js:1282`).
- **U1:** Startkortet har mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.15.11».
  - I 568×320, 740×360 og 320×568 ligger lenka «Tilbake» under kanten. Kortet kan rulles, og Tab når lenka på andre trykk.
- **T1 (emulert):** Ingen synlige knapper under 44×44 px. Kontrollert på startkortet, på gården på nivå 10, i tavla og i gåten, i alle fem størrelsene. Ingen størrelse gir sideveis rulling, og gåtekortet holder seg innenfor skjermen.
- **T2:** Tab går rundt i pausen (Slik styrer du → Avslutt → E-shop → Fortsett). På forsiden når Tab spillkortet etter 6 trykk, med synlig fokusramme (3 px).
- **T3:** Zoom er OK i den statiske suiten. Med `prefers-reduced-motion` blir varebilen stående mens leveringen telles, og Rebus flytter seg uten å gå.
- **K1:** Røyktesten er OK. Konsollen var tom i alle mine kjøringer, bortsett fra feilene jeg kastet med vilje. Ingen 404 og ingen eksterne forespørsler, heller ikke på forsiden eller i E-shop.
- **K2:** En kastet feil gir «Oi, noe gikk galt 🐔» med fokus på «Last på nytt», og Tab blir der. Testet i 1280×800 og 375×812.
- **S1:** Den statiske suiten er OK. Den eneste filen med nye ressurser er forsiden, som har fått to lokale bilder.
- **S2:** Ingen konto, chat, reklame eller ekte penger. E-coins-suiten er OK. EC1 gir 1773 publisert, 2213 totalt og 1585 i butikken.
- **S3:** Spillet har ingen fritekst.
- **ST1, ST3, ST5 og ST6:** Testet med evnstudio.no omdirigert til lokal server og GoatCounter byttet ut med en stubb.
  - Ingen hendelse før Start.
  - `start-min-bondegard` kommer én gang, også med en ekstra `evn-start`. En levering gir ingen ny hendelse.
  - `document.cookie` er tom, og det kom ingen andre forespørsler. `statistikk.js` er uendret.
- **Forsiden:**
  - Min Bondegård er det første av seks spillkort. Bildet lastes, og kortet virker med klikk.
  - Nyhetene viser 15.11, 5.11 og 3.11. Nyheten om Dyrepatruljen fra 2.11 er tatt ut.
  - Ingen sideveis rulling i 1280, 375 eller 320 bredde.
  - Bildene er 800×500 og 1200×750.
- **E-shop:** Lommeboka viser «Min Bondegård – 0 av 2 klart, 60 E-coins igjen å tjene».

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **K3, verifisert feil (ikke kritisk): endringsloggen oppgir feil versjon for publiseringen.**
  - **Slik gjenskaper du:** `ENDRINGSLOGG.md` linje 9 heter «Min Bondegård 0.15.10 på nettsiden». Startkortet, tittelen og `MB_VERSJON` sier 0.15.11.
  - `publiseringssjekk.mjs` vil likevel godta dette, fordi «0.15.11» står i den eldre raden («0.15.0–0.15.11»).
- **ST2, kjent avvik i felles kode (uendret):** Spilletiden teller også pause, fordi EVN-PAUSE v3 ikke finnes.
- **ST4 og versjonshendelsen (ST7), kjent avvik i felles kode (uendret, kodelest):** `statistikk.js` sender verken `feil-min-bondegard-*` eller `versjon-min-bondegard-0.15.11`.

## Anbefalte forbedringer
- **Mulig problem (visuelt, uendret): Rebus går i kjørefeltene.** Ruta hans går i z = 13,8 og z = 11,3, mens bilene kjører i 13,5 og 11,6. Dette er utledet av rutene, ikke sett i spillet.
- **To «Nytt»-merker på forsiden:** Både Min Bondegård og Fiskespillet har merket. Begge kortene har også `--i:0`, så de får samme forsinkelse i animasjonen.
- **Popkornmaskinen 750 og gaveeskene** står som godkjent av Ivar 15.11 i koden og i README. Godkjenningen er ikke kontrollert av meg.
- **Ingen automatisk test i nettleser** for varebilen, gåtene, flytting av byggeplasser vekk fra siloen eller E-coins i spillet.
- **Standarden mangler Min Bondegård** i oversikten «Hvilke krav gjelder for hvert spill». Jeg har lagt B3 til grunn, som i forrige rapport.
- **Liten ting i en test:** Den nye testen i `logikk.test.mjs` (linje 115) mangler innrykk.

## Kontroller som ikke kunne utføres
- **Y1:** Ingen referansemobil er valgt, og SwiftShader sier ikke noe om bildefrekvens.
- **Y2:** Ekte fanebytte er ikke kjørt. Bare blur (som gir pause) og simulert `dt` er testet.
- **F1, delvis:** Hele bilturen i ekte tid er ikke kjørt ferdig. Etter 261 s var bilen fortsatt ute, fordi SwiftShader går svært sakte. Ny tur ved levering mens bilen er ute er heller ikke kjørt på nytt. Koden for bilen er uendret siden 26c1539.
- **T4:** Ikke testet. Ingen kontrastberegning, og den automatiske testen (A) mangler.
- **T1 og T3 (E):** Trykk med ekte finger og knip med to fingre på iPhone og Android.
- **U2 og U3 (V):** Tekstene er korte og på enkel norsk etter min vurdering. Om barn forstår gåtene og tavla, må Even teste.
- **S4:** Kun kodelest. Personvernsiden er generell og dekker lokal lagring og E-coins. Ingen nye nøkler eller domener.
- **ST7:** Felles statistikk er i bruk, men versjonshendelsen mangler (se avvik).
- **ST8:** `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»). Jeg brukte en erstatning med stubb, og milepælene er ikke testet. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **B3:** Kun kodelest (`MB_INGEN_WEBGL`). Lavere grafikk på svake enheter krever test på enhet (E).
- **B1, B2 og B4–B7:** Vurdert som ikke relevante. Spillet har ingen lyd, kart, kamp, læringsfakta, app-installasjon eller fritekst.
- **V (Even):** Spillopplevelsen, gåtene med tilfeldige feilsvar, at kjøkkenplassen flyttes, og om spillet er morsomt etter 10, 30 og 60 minutter.
- **Kode A uten automatisk test:** T1, T2, T3, T4, F2, F3, K2 og Y2 har ingen automatisk test utover røyktesten og den statiske suiten.
- **UI1–UI10 og klarspråk:** UI1–UI10 er ikke tatt i bruk for spillet, og klarspråk har status forslag. Ingen av dem er kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1, F2 og F3 med lagring fra 0.15.0 og 0.15.8 er testet uten kritiske feil, og alle tre rettingene fra forrige rapport er verifisert. Endringsloggen bør rettes til 0.15.11, og ytelse, kontrast og ekte berøring er ikke testet. Vurderingen gjelder bare 34623bcf90ade8a66710b118e1e994006221bc67 og er ingen godkjenning av publisering.

Testserverne på 8821–8823 og alle mine testnettlesere er stoppet. Skript, logger, skjermbilder og uttrekk ligger i `/tmp/qa-mb1511/`, klonen i `/tmp/qa-mb` og loggen fra `kjor.mjs` i `/tmp/qa-mb-kjor.log`. Alt ligger utenfor repoet. Repoet er ikke endret: HEAD er uendret, og arbeidstreet er rent. Ingenting i rapporten bygger på lagret minne.
