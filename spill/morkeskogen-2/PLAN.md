# Mørkeskogen 2.0 – plan for full grafisk oppgradering (til godkjenning)

**Versjon:** 1, 1.11.2026. **Status:** Ikke godkjent, og ingen integrering er startet.
**Gren:** `morkeskogen-2.0` @ 069974a. `main` er uendret (f88263c).
**Grunnlag:**
- Funksjonsoversikten for 5.6.2
- Prototypen v2.0-proto.2
- Migreringstesten
- Kodeanalyse av `spill/morkeskogen/index.html`

## 0. Faste beslutninger
- **Grafikk:** Stil 2, «stilisert naturalisme», er referansen.
- **Helt:** Roboten fra prototypen (RobotExpressive, CC0) brukes uten endringer i modell, farger eller logo. EVN-maskoten holdes utenfor Mørkeskogen 2.0 inntil videre.
- **Uendret:** Spillregler, progresjon, balanse, lagringsnøkler og lagringsformat.
- **Publisering:** Ingen før en voksen har godkjent det. 5.6.2 ligger på `main` og blir liggende som tilbakefall.

## 1. Hovedgrep: bytt bare grafikklaget
**Funn i koden:** 5.6.2 er allerede delt i to:
- `update(dt)` og `updateX()` styrer spillogikken via `g.*`.
- `draw(time)`, `renderX()`, `make*()` og `buildWorld()` tegner via `R3.*`.

Grafikken er ca. 4 000 linjer i 94 funksjoner. Spillogikken er ca. 2 300 linjer. Spillogikken leser grafikktilstand bare noen få steder (se pkt. 5).

**Kravene er utfordret:**

| Opprinnelig antakelse | Ny vurdering |
|---|---|
| Grafikk og spillogikk må skilles (stor omskriving) | Unødvendig. Skillet finnes. Spillogikken flyttes **ordrett** til egen fil, og bare `draw` og byggefunksjonene erstattes. |
| Alt må modelleres på nytt før noe kan testes | Nei. Gamle objekter vises først i en enkel overgangsversjon med nye materialer, og byttes ut område for område. Spillet er spillbart i hele perioden. |
| Hele spillet skal deles i moduler | Bare grafikklaget deles i moduler, slik prototypen er bygd. Spillogikken flyttes som én fil, og oppdeling vurderes senere. |
| Alt bør beholdes | Ubrukt kode (gammelt minikart og stort kart, skjult tørst, utviklerverktøy) påvirker ingen funksjoner. Den kan tas ut i fase 1 **hvis godkjent** (beslutning B4). |
| 3D-modeller må hentes utenfra | Bare dyr og fiender trenger det. Terreng, trær, vann, bygninger og effekter lages i kode, slik prototypen viser. |

## 2. Målarkitektur
```
spill/morkeskogen-2/
  index.html          startkort, HUD, EVN-blokk, statistikk (som 5.6.2)
  logikk.js           update(), g, lagring, oppdrag, våpen, dyr, fiender: ordrett fra 5.6.2
  visning-grensesnitt.js  felles tilstand logikk ↔ grafikk (kamera, kvalitet, effekter)
  grafikk/            fra prototypen: bakke, trær, vann, lys, bål, figurer, bygninger, effekter
  modeller/ teksturer/   GLB og teksturer (bare fra eget domene, CSP 'self')
```
- **Terreng:** `terrainH`/`groundH` er én felles kilde. Grafikken lager bakken fra de samme funksjonene, slik at føttene står på bakken og vann, lava og broer havner på samme sted som i logikken.
- **Bygg:** esbuild lager én JS-fil. three.js r187 er buntet inn, og bare én kommando trengs.

## 3. Utviklingsrekkefølge og godkjenningspunkter
Omfang i arbeidsøkter. Estimatene er usikre, ±50 %.

| Fase | Innhold | Avhenger av | Testkrav før neste fase | Godkjenning |
|---|---|---|---|---|
| **0 – Forberedelse** (1–2) | **FPS-måling** av prototypen på enhetene. **Logikktvilling:** automatisk test som kjører 5.6.2-logikken og 2.0-logikken med samme frø og samme tastesekvens i N minutter, og sammenligner `g` og lagring. **Lagringstester** med ekte lagringer fra 5.6.2 (alle fire nøkler). | – | FPS-tall fra minst én telefon. Logikktvillingen finner ingen avvik på 5.6.2 mot seg selv. | **G0 (voksen):** budsjett og minstekrav til enhet |
| **1 – Skjelett** (4–6) | **Spillogikken:** flyttes ordrett til `logikk.js`, og R3-koblingene byttes til grensesnittet. **Ny grafikkjerne:** terreng for alle biomer, himmel, døgn, tåke, kamera (begge), robot-helten med dagens fem klipp, HUD og startkort. **Overgangsversjon:** alle andre objekter vises med nye materialer. | G0 | Logikktvilling ✔. Gamle lagringer lastes ✔. Funksjonstest for start, pause, kart, avslutt, bygg, sekk og «Start helt på nytt» ✔. Ingen konsoll- eller CSP-feil. | **G1 (voksen):** at grunnmuren holder |
| **2 – Skogbiomet ferdig** (5–8) | Trær (gran, furu, løv, bjørk, kjempegran), busker, stein og jern, pynt, elv, bekk og innsjø, broer, bål nivå 1–10, hytter og de fire bygningene, nattmonstre, lyktestolper, hugging og felling | G1 | Funksjonstest for hugging, bygging, bål, natt, monstre og søvn. Ytelse innenfor budsjett. Skjermbilder fra faste punkter. | **G2 (Even):** skogen ser og føles riktig. **(Voksen):** ytelse. |
| **3 – Helt, våpen og animasjoner** (3–6) | Alle 10 våpen festet til hånden, animasjoner (pkt. 6), sekker, fiskeline og lasso fra håndleddet, prosjektiler og magi | G1 (kan gå parallelt med fase 2) | Hvert våpen: slag, treff, nedkjøling og oppgradering til nivå 3. Fiske fra kast til fangst. Lasso temmer dyr (maks 4). | **G3 (Even):** bevegelsene |
| **4 – Dyr og fiender** (6–10) | 23 dyrearter og tamme dyr. Fiendene: skjeletter, troll, T-rex, geit, heks, skurker, hai og triceratops, med Skjelett-T-rex-kongen som boss. | G1, CC0-ressurser (B5) | Hver art: synlig, animert, treffsone som i 5.6.2, gir kjøtt og skinn. Hver fiende: angrep, skade, nederlag. | **G4 (Even)** |
| **5 – Andre biomer og steder** (6–10) | Snø, jungel, lava og ørken. Skjelettslott, spøkelseshuset, vulkanen, pyramiden, T-rex-hjemmet, haidammen, Dinoverdenen og Beinslottet (3 etasjer), stasjon, tog og Kaktusbyen med 5 personer | Fase 2 | Alle 17 oppdrag kan fullføres i en automatisk gjennomkjøring (logikk) og ved stikkprøver (spilling). Kollisjon mot murer og etasjer stemmer. | **G5 (Even)** |
| **6 – Helhet og publisering** (3–5) | Kvalitetsnivåer og automatisk nedgradering (`mork3d.q` uendret). Felles startkort, pause, kart og avslutt. EVN-SIKKERHET/CSP, statistikk-ID-er (`startBtn`, `againBtn`). Ytelsespuss. EVN Game QA. | Fase 2–5 | Full kontrolliste (pkt. 8). axe uten funn. FPS på telefon, nettbrett og PC. 10 min varmetest. | **G6 (Even):** spillopplevelsen. **G7 (voksen):** publisering etter `arbeidsflyt-publisering.md` |

**Sum:** ca. 28–47 økter. Fasene 2–5 kan bygges i en annen rekkefølge uten risiko, fordi overgangsversjonen gjør spillet komplett hele veien.

## 4. Tekniske avhengigheter
- **`terrainH`, `groundH`, `surfaceH` og `dcSurf`:** Grafikken må bruke de samme funksjonene. Ved avvik svever figurer, eller de havner under bakken.
- **`TREE_W` (1,5) og `TREE_H` (1,9):** Brukes også i logikken, blant annet når prosjektiler treffer trær (linje 2193). Konstantene beholdes uansett hvordan trærne ser ut.
- **Kameratilstand (`camYaw`, `camMode`):** Brukes av styring, sikting (`nearestEnemyInCone`) og C-tasten. Flyttes til grensesnittet med samme navn og verdier.
- **Lagring:**
  - `mork3d.helt`, `mork3d.verden`, `mork3d.kart` og `mork3d.q` er uendret.
  - `mork3d.q` har fortsatt verdiene `lav`, `middels` og `hoy`.
  - `evn-spilletid-morkeskogen` er uendret.
- **Statistikk og EVN-blokken:**
  - ID-ene `startBtn` og `againBtn` beholdes.
  - Det samme gjelder `#evnAvslutt`, `#evnSporsmal` og felles startkort.
- **CSP:** Nye filer ligger på eget domene (`'self'`), så CSP trenger ingen endring.
- **Ressurser:** CC0 eller egenprodusert, og alt føres i `LISENSER.md`. Bladteksturene er MIT-lisensiert av EZ-Tree-forfatteren (repoets `textures/LICENSE.md`, commit dcf309b). Det gjenstår en voksen godkjenning (B6).

## 5. Funksjoner som kan bli ødelagt når grafikken byttes
| # | Funksjon | Kobling i 5.6.2 | Hva kan gå galt | Tiltak og test |
|---|---|---|---|---|
| 1 | Styring og sikting | `update` og `nearestEnemyInCone` leser `R3.camYaw` | Helten går feil vei, og autosikte bommer | Grensesnittet. Logikktvilling med kamerarotasjon. |
| 2 | Kamerabytte (C) | Tastehendelsen skriver `R3.camMode` | Knappen gjør ingenting | Funksjonstest |
| 3 | Lasso | Linja starter i armens verdensposisjon (`arms[1].el`) | Linja kommer fra feil sted, eller sidefeil | Festepunkt i robotens høyre hånd. Test: temme dyr. |
| 4 | Fiske | Snøret starter i stangtuppen (`rodTip`) | Snøret mangler. Napp og sveiving virker, men ser feil ut. | Festepunkt på stangen. Test: kast, napp, fangst og sekkplass. |
| 5 | Bygging | Pynt-instanser fjernes via `refs` når man bygger (linje 6272) | Gress og sopp står inne i hytta | Grafikken leser byggelisten. Test: bygg på gress. |
| 6 | Kjempegraner blir gjennomsiktige | `makeTree` har egne materialer for kjempegraner | Helten skjules bak trær | Gjennomsiktige trær som i prototypen, utvidet til kjempegran. Skjermbildetest. |
| 7 | Treff på trær med pil og magi | `treeWK` i prosjektilkollisjonen | Pilene treffer eller bommer annerledes | Konstantene beholdes. Logikktvilling med skudd. |
| 8 | Capsen av og på (`hero.cap`, meny) | Viser eller skjuler capsen på helten | Roboten har ingen caps, og menyvalget mister effekt | **Beslutning B1** |
| 9 | Sekker synlige på helten | `makeBackpack` per sekknivå | Sekk mangler, eller sitter feil på roboten | Festes til `Body`/`Torso`. **Beslutning B2.** |
| 10 | Øksenivå og motorsag | Fargen på øksa og motorsagen er synlige i hånden | Feil verktøy vises | Test per øksenivå |
| 11 | Beinslottet | Etasjer og vegger vises og skjules etter hvor helten er (`renderDino`) | Man ser gjennom vegger, eller etasjer mangler | Test per etasje |
| 12 | Etiketter og pekere på skjermen | `toScreen` bruker kameraet | Etiketter havner feil | Skjermbildetest |
| 13 | Automatisk nedgradering | `fpsWatch`, `mork3d.q`, `applyQuality` | Spillet senker ikke kvaliteten, eller overstyrer valget | Test med kunstig lav FPS |
| 14 | Hytter, lys og natt | Monstre holder seg unna lys (logikk), og lys tegnes (grafikk) | Lyset og «trygg sone» stemmer ikke | Lysradius tegnes fra logikkens verdier |
| 15 | Tog, tamme dyr, NPC-er | Synkroniseres per frame fra `g` | Figurer henger etter eller blinker | Funksjonstest: togtur og 4 tamme dyr |

## 6. Animasjonsplan for roboten
**Klipp roboten har:** Idle, Walking, Running, Jump, WalkJump, Punch, Death, Sitting, Standing, Wave, Yes, No, ThumbsUp og Dance.

| Handling i 5.6.2 | Våpen | Løsning |
|---|---|---|
| chop | Øks | Punch, som allerede virker i prototypen |
| thrust | Spyd | Punch, som er et rett støt |
| slash | Sverd | Punch og en kodestyrt sving av overarmen |
| smash | Flammehammer | Ny: slag over hodet med to armer |
| bow (trekk og slipp) | Pil og bue, skjelettbue | Ny holdning: armene holdes mens beina går. Farten er 0,6× som i 5.6.2. |
| cast | Magisk stav, heksas tryllestav | Ny: armen løftes og føres fram |
| lasso | Cowboy-lasso | Ny: armen sirkler over hodet, så kast. Linja går fra hånden. |
| rod | Fiskestang | Ny holdning: kast, vent, rist ved napp, sveiv |
| Spise, sove, snakke, oppdrag fullført, nederlag | – | Gjenbruk av Yes, Sitting, Wave, ThumbsUp og Death |

**Teknikk, i to trinn:**
1. **Trinn A (fase 3, 2–3 økter):** Klipp bare for overkroppen. Sporene filtreres til ledd fra Abdomen og oppover. Da kan armene slå, kaste og holde mens beina går og løper. I tillegg legges kodestyrte holdninger for overkroppen (bue, stang, stav, lasso) på klippene, blandet med vekter. Alle våpen blir dermed spillbare uten nye filer.
2. **Trinn B (valgfritt, 2–4 økter):** Ekte klipp for bue, hammer, stav, lasso og fiske, laget med skript i Blender (`bpy`) i skyen på robotens eget skjelett. Forhåndsvisning rendres som GIF til Even, og klippene eksporteres til samme GLB. Modellen endres ikke. Brukes der trinn A ikke ser godt nok ut.

**Mixamo anbefales ikke:** Skjelettet er ikke Mixamo-standard, og tjenesten krever en konto.

## 7. Testkrav
| Type | Hva | Når |
|---|---|---|
| Logikktvilling | Samme frø og tastesekvens i 5.6.2 og 2.0 gir lik `g`-tilstand og lik lagring | Hver commit fra fase 1 |
| Lagring | Lagringer fra 5.6.2 for nytt spill, midt i spillet og etter at Beinslottet er ryddet, lastes og spilles videre | Fase 1 og fase 6 |
| Funksjonstest | Én test per linje i kontrollisten (pkt. 8), med Playwright og logikksimulering | Per fase |
| Ytelse | Tegnekall, trekanter og skygge i faste scener, mot budsjett | Per fase |
| Ekte enheter | `#ytelsestest` og `#varmetest` på telefon, nettbrett og PC | G0, G2 og G6 |
| Visuell regresjon | Faste kameraposisjoner, dag og natt, før og etter | Per fase |
| Kvalitet | Ingen konsollfeil, ingen CSP-brudd, axe-core (WCAG 2.2 A/AA) på menyer | Fase 6 |
| Spilltest | Even spiller uten avbrudd og blir spurt etterpå, ett spørsmål om gangen | G2–G6 |

**Budsjett for startleiren:**

| | Mobil, Middels | PC, Høy |
|---|---|---|
| Tegnekall totalt | ≤ 250 | ≤ 400 |
| Trekanter | ≤ 0,6 M (skygge ≤ 0,2 M) | ≤ 1,5 M |
| FPS | ≥ 30 stabilt i 10 min | ≥ 60 |

Prototypen ligger i dag på 149 tegnekall og 0,38 M trekanter (mobil), og 213 tegnekall og 0,97 M trekanter (PC). FPS er ikke målt ennå.

## 8. Kontrolliste fra funksjonsoversikten
Hver linje må ha status «videreført og testet» før G7.

| Område (funksjonsoversikt) | Fase | Test |
|---|---|---|
| Fem biomer, verdensfrø, «Lag en helt ny verden» | 1, 5 | Lik verden fra samme frø. Ny verden beholder våpen, XP og oppdrag. |
| Steder (15, se kap. 2) | 2, 5 | Plassering lik logikken, og de kan besøkes |
| Døgnet (130/12/45/8 s), monstre unna lys | 1, 2 | Tidene er uendret i logikktvillingen |
| Bål nivå 1–10, ved, brenntid, matlaging (F) | 2 | Funksjonstest |
| Liv, mat, rått kjøtt, søvn i halmseng | 2 | Funksjonstest |
| Ressurser (ved, stein, jern, skinn, kjøtt, fisk) | 2, 4 | Mengdene i logikktvillingen |
| Hugging, felling, stubber, trær vokser sakte tilbake | 2 | 6 hugg, fallretning, stubbe |
| Bygninger (hytte, lykt, verksted, halmseng) og kostnader | 2 | Byggemeny og kostnader |
| Økser (4 + motorsag), sekker (4), ryggsekk (I) | 3 | Per nivå |
| Capsen av og på | 3 | **B1** |
| 10 våpen, oppgradering til nivå 3, XP-krav | 3 | Per våpen |
| Sikting (mus på PC, autosikte på mobil) | 1, 3 | Logikktvilling og funksjonstest |
| 23 dyr, aggressive dyr, kjøtt og skinn, lasso og tamme dyr (maks 4) | 4 | Per art |
| Fiender og Beinslottet (25 skjeletter, 3 triceratopser, bossen, lagring per etasje) | 4, 5 | Per etasje og boss |
| Fiske (3 typer vann, 8 fiskearter, sekkplass) | 3 | Kast til fangst |
| 17 oppdrag og XP | 2–5 | Automatisk gjennomkjøring |
| Kaktusbyen (5 personer), tog | 5 | Togtur, samtaler |
| Styring på PC og mobil, kamera (begge), zoom | 1 | Funksjonstest |
| HUD, kart (M), pause med spilletid, avslutt, «Start helt på nytt» | 1 | Funksjonstest |
| Kvalitetsvalg og automatisk nedgradering | 6 | Test med kunstig lav FPS |
| Lagring (4 nøkler + spilletid) | 1, 6 | Lagringstester |
| Statistikk, EVN-blokk, CSP | 6 | Arbeidsflyt-testene |

## 9. Beslutninger som trengs (før eller underveis)
| # | Spørsmål | Hvem | Før |
|---|---|---|---|
| B1 | Roboten har ingen caps. Skal caps-valget **(a)** fjernes for roboten, **(b)** beholdes og vise en caps oppå roboten (et tillegg på modellen), eller **(c)** gi noe annet? | Even, deretter voksen | Fase 3 |
| B2 | Sekker på ryggen (5.6.2 viser dem): godtas de som utstyr, som øksa? | Even | Fase 3 |
| B3 | Trehøyde. 5.6.2-grana er ca. 137–160 enheter (72–84 × 1,9), prototypen 165. Høyden kan beholdes. | Even | Fase 2 |
| B4 | Ta ut ubrukt kode (gamle kart, skjult tørst, utviklerverktøy)? | Voksen | Fase 1 |
| B5 | 3D-modeller av dyr og fiender: CC0-pakker (Quaternius, Kenney) lastes ned av en voksen, fordi nettstedene er sperret her. Alternativet er modeller laget i kode. | Voksen | Fase 4 |
| B6 | Bladteksturer under MIT (EZ-Tree): godkjennes de, eller skal de byttes? | Voksen | G7 |
| B7 | Minstekrav til enhet og FPS-mål etter målingene | Voksen | G0 |

## 10. Neste konkrete steg
1. FPS-test på enhetene (instruks under).
2. Godkjenning av denne planen. Svar på B4 og B7.
3. Fase 0: logikktvilling og lagringstester.

---
## Vedlegg: slik gjennomføres FPS-testen
Testkopi: https://claude.ai/artifact/6dmFZKdTZ7p4Gk4rBW5tDL (v2.0-proto.2).

1. **Forbered enheten:** Lad den til over 50 %, eller sett den i lader. Lukk andre apper. Skru av strømsparing. Telefonen skal ikke være varm fra før.
2. **Åpne og velg grafikk:** Åpne lenken. Velg Lav, Middels eller Høy under «Grafikk» på startkortet. Stil 2 er forhåndsvalgt.
3. **Kjør testen:** Trykk **📊 Ytelsestest (1 min)** og ikke rør skjermen. Testen kjører tre scener à 20 s etter 3 s oppvarming:
   - dag ved bålet
   - natt med tre monstre
   - dag i skogen sett ovenfra

   Helten går i sirkel av seg selv.
4. **Send resultatet:** Trykk **📋 Kopier resultat** og lim det inn i samtalen. Fungerer ikke kopiering, ta et skjermbilde av resultatkortet.
5. **Hvilke målinger:**
   - Telefon: kjør på **Middels**, deretter **Lav**.
   - PC: kjør på **Høy**.
   - Nettbrett: kjør på **Middels**.
6. **Varmetest:** Kjør **🔥 Varmetest (10 min)** én gang på telefonen på Middels. Den viser FPS per minutt, slik at vi ser om telefonen blir tregere når den blir varm.
7. **Lagring:** Resultatet lagres ikke i spillet. Testen skriver ikke til lagringen.

Måleoverlegg under vanlig spilling: legg `#maal` til i adressen. Det virker der adressen kan endres (for eksempel lokalt eller på GitHub Pages senere). Ytelsestesten trenger ikke dette.
