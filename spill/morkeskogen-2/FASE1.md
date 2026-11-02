# Mørkeskogen 2.0 – fase 1: skjelett (arbeidslogg)

**Gren:** `morkeskogen-2.0`. Startet 2.11.2026 etter G0. Rapporteres ved **G1 (voksen)** før fase 2.

## Mål for fase 1 (fra PLAN.md, pkt. 3)
- **Spillogikken:** Den er flyttet i fase 0, og koblingspunktene skal dekkes av et grensesnitt.
- **Ny grafikkjerne:**
  - terreng for alle biomer
  - himmel, døgn og tåke
  - kamera (nært og fjernt)
  - robot-helten med dagens fem klipp
  - HUD og startkort
- **Overgangsversjon:** Alle andre objekter vises med nye materialer.
- **Krav ved G1:**
  - Logikktvillingen viser ingen avvik.
  - Gamle lagringer lastes.
  - Funksjonstest for start, pause, kart, avslutt, bygg, sekk og «Start helt på nytt».
  - Ingen konsoll- eller CSP-feil.

## Arkitekturvalg (tas med til G1)
**Grensesnittet mellom logikk og grafikk er `R3`-kontrakten. Ingen logikkblokk skrives om.**
- Logikken bruker bare disse delene av `R3`:
  - `camMode`, `camYaw`, `camPitch`, `camZoom`
  - `camera` (aspect, `updateProjectionMatrix`, projeksjon via `tmp`)
  - `renderer.setPixelRatio`, `renderer.setSize`
  - `player.head` (capsen)
  - `pool` (punktlys for kvalitetsnivå)
  - `sun.shadow` (størrelsen på skyggekartet)
- Den nye grafikken skal levere nøyaktig dette.
- **Fordelen:** Alle 407 logikkblokker forblir tegn for tegn like 5.6.2. Det kontrolleres ved hvert bygg.
- **Avvik fra planen:** Planen sa at de 12 koblingspunktene skulle skrives om. Det er ikke nødvendig, fordi kontrakten er liten og stabil.

**Kildefiler:**
- `kilde/logikk-5x.js` og `kilde/grafikk-5x.js` er låste kopier av 5.6.2. Bygget stopper hvis de endres.
- `kilde/grafikk-2.js` er grafikken som utvikles, med samme blokknumre.
- Ny grafikkjerne skrives som moduler og pakkes med esbuild til én fil. `three` er da en ekstern global (r187).

## Steg og status
| # | Steg | Status |
|---|---|---|
| 1 | 2.0 på three.js r187 med overgangslag (`kompat-r187.js`) | ✔ 2.11. Tvilling 12/12, bildetest lik original |
| 1b | Rettet: elvas shader-tillegg traff ikke i r187 (også feil i testkopien `migrering/`). `verktoy/sjekk-shader.mjs` stopper nå bygget ved slike feil | ✔ 2.11. |
| 2 | Lysmodell for stil 2: sRGB-utdata og ACES-tonemapping. Gamle farger gjøres om til lineære i overgangslaget (`kompat-r187.js`, `EVN2_OVERGANG`), også farger som `draw()` endrer underveis. Egne shadere regner som før og gjøres om rett før utdata | ✔ 2.11. Tvilling lik. Bilder: `tester/resultater/skudd-fase1-lysmodell` (mer kontrast og riktigere lys, ellers samme uttrykk). Ytelse ikke målt på iPhone ennå |
| 3 | Himmel, døgn og tåke fra prototypen, koblet til spillets klokke (`phaseInfo`) | |
| 4 | Terreng for alle biomer fra `terrainH`/`groundH`/`biomeAt`, med teksturer fra prototypen | |
| 5 | Kamera (nært og fjernt), samme styring | |
| 6 | Robot-helten (GLB) med fem klipp. `R3.player.head` uten caps til B1 er avgjort | |
| 7 | HUD og startkort i ny stil | |
| 8 | Overgangsmaterialer for resten av objektene | |
| 9 | G1-kontroll: tvilling, gamle lagringer, funksjonstest, konsoll og CSP, ytelse på iPhone | |

## Testverktøy
- **`tester/tvilling.js`:** Sammenligner logikken i original og 2.0, 12 scener. Mutantene `mutant` og `mutant2` viser at testen virker.
  - Unntakene er begrunnet i koden og gjelder bare visuelle effekter: `g.parts`, `g.shake` og tilfeldige trekk inne i three.js.
- **`tester/spill-skudd.js`:** Tar bilder fra faste punkter (dag, kveld, natt, ovenfra) for original og 2.0, og regner ut forskjellen. Resultater ligger i `tester/resultater/skudd-*`.
- **`verktoy/bygg-spill.mjs`:**
  - kontrollerer logikken og de låste kopiene
  - kjører shader-kontrollen
  - skriver `spill/`
