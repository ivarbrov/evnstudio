# Matdyr-regn, fase 2 trinn 2: visuelle prototyper

Privat forhåndsvisning for Even: https://claude.ai/artifact/Apz1vbzisZvHr9qTHBwMFb

- `figurer.js`: fem testfigurer som ekte mathybrider, laget i kode med three.js r128: Donutku (ID 127), Burgersau (508), Pizzaskilpadde (700), Croissantrev (stilprøve, croissant er ikke blant de 25 matvarene) og Iskatt (259).
- `visning.js`: to faner.
  - **Matdyr:** forfra, siden, bakfra, ovenfra, nært, i spillstørrelse ved siden av EVN-roboten (spillets kameravinkel) og alle fem samlet. Mobilramme på PC.
  - **Gården:** gårdsnivå 1–10 med åpen gårdsbygning, etasje 2 (nivå 3), etasje 3 (nivå 6), takterrasse (nivå 9) og bygg på tunet. Neste nivå vises gjennomsiktig, og etasjene over roboten kan gjøres gjennomsiktige.
- Biblioteker (three.js r128, GLTFLoader og `helt-robot.js`) kopieres fra `/home/claude/matdyr` ved publisering. De ligger ikke her.
- Siden har ingen lagring, statistikk eller E-coins, og den rører ikke produksjonsspillet.

**Ytelse** (målt i Chrome uten skjerm med programvaregrafikk; FPS er ikke målt på ekte enheter):
- Én figur: 42–103 tegnekall og 11–36k trekanter.
- Gården på maks nivå med 40 matdyr: 396 tegnekall og 340k trekanter. Figurene er slått sammen per materiale og instansert, med halvt detaljnivå.
- Budsjettet for mobil (fra Mørkeskogen-planen) er høyst 400 tegnekall og 600k trekanter. FPS må måles på Evens telefon.

## Trinn 3, del 1: «🎮 Spill»-fanen

Roboten kan gå, hoppe og ta spiralrampa opp til takterrassen.

- PC: WASD eller piltaster for å gå, mellomrom for å hoppe, dra med musa for å snu kameraet.
- Mobil: styrespak nede til venstre, hoppknapp nede til høyre.
- Kollisjon: rekkverket på etasjene og langs rampa stopper roboten, også når den hopper. Rampa er åpen inn mot låven på hver repos, der den gule porten står. Roboten kan ikke gå inn under de lave delene av rampa.
- Etasjene over roboten blir gjennomsiktige.

`rutetest.mjs` lar roboten gå hele ruta automatisk. Testen sjekker høydene (6,05, 11,65 og 17,25), at roboten kommer inn i hver etasje, og at den ikke kommer ut over rekkverket.

Ingen lagring, E-coins eller statistikk ennå.

## Trinn 3, del 2: spill-løkka og Gårdsnivå

«🎮 Spill» er nå en spillbar prototype med egen lagring (`evn-matdyr-gard-proto`). Produksjonslagringen leses ikke. Prototypen har ingen E-coins og ingen statistikk.

- **Matdyrregn:** matdyrene regner ned på enga foran gården, aldri inne på tunet. Gjerdet har en port med sti ut til enga. Samme ID-er, sjeldenheter, priser og inntekter som produksjonsspillet (`matdyrdata.js`), med korte navn (B5). Bestillingsregnet er 15 %. I 🧪-menyen kan det settes til 0, 10 eller 15 %.
- **Figurer:** Donutku, Burgersau, Pizzaskilpadde og Iskatt har ferdige 3D-figurer. Alle andre vises som en kule i sjeldenhetsfargen med dyr og mat over.
- **Ta med og sett inn:**
  - Gå bort til et matdyr og trykk E eller handlingsknappen.
  - Bær matdyret til en ledig plass i hvilken som helst etasje. Du betaler når det settes inn.
  - Ved en full plass kan matdyret selges for halv pris.
- **Gårdsnivå-menyen:**
  - Menyen viser kravene, og forslaget er de svakeste matdyrene som passer. Et sjeldnere matdyr enn kravet velges aldri automatisk. Trykk på et matdyr for å bytte.
  - Før oppgraderingen kommer en bekreftelse med «Du leverer inn», «Du får» og «Du beholder».
- **Sikker oppgradering:**
  - Knappen låses straks den trykkes.
  - Alt kontrolleres på nytt rett før oppgraderingen, og en annen fane stoppes.
  - Ny tilstand lagres først og tas i bruk bare hvis lagringen lyktes.
- **Flere plasser:** kjøpes som i dag innenfor taket for gårdsnivået.
- **🧪 Testvalg:** bestillingsregn, testpenger, «Dyr til neste nivå» og nullstilling.

**Forenklinger i prototypen:**
- Legendary og bedre kan tas med uten fangst.
- Det finnes ikke bytte med det svakeste matdyret.

Matdyrboka og 🔍 Finn er neste del.

`spilltest.mjs` tester disse tilfellene:
- ta med og sett inn
- at forslaget aldri velger et sjeldnere matdyr enn kravet
- lagringsfeil
- endring i en annen fane
- dobbelttrykk
- at bare de innleverte matdyrene forsvinner
- gårdsnivå 1 → 10 i rekkefølge

## Ny grafikk (fase 2, 8.11.2026)

Ny grafikk er standard. `?grafikk=gammel` viser den forrige versjonen til sammenligning, og ⚙️ har en knapp for å bytte.

- **Fem nye hybrider** er modellert i Blender: Donutku, Burgersau, Pizzaskilpadde, Shakeand og Spagettipingvin.
  - Maten er selve kroppen.
  - Hver figur finnes i to versjoner: `modeller/<navn>.glb` (full) og `<navn>_lav.glb` (cirka 7 000 trekanter).
  - Animerte deler (hode, bein, hale og vinger) er egne noder.
  - Kildeskript: `blender/matdyr_hybrider.py`.
- **Miljøet** er også modellert i Blender: trær, busker, steiner, blomster, gress, låve, silo, hønsehus, mølle, drivhus, tårn, gjerde, høyball og kasse.
  - Kildeskript: `blender/miljo_ressurser.py`, som gir `modeller/miljo.glb`.
- **`miljo.js`** er en kandidat til felles EVN-komponent. Den har kvalitetsnivå, lys, terreng, spredning, instansering av GLB-ressurser og ytelsesmåling.
- **Åkeren** (60 × 32 m) ligger rett foran gården. Matdyrene regner ned der.
- **⚙️ Grafikk og ytelse:** velg Lav, Middels eller Høy, og mål FPS i 10 s på ekte PC eller mobil. Resultatet kan kopieres.
- **`nyefigurer.html`** viser figurene fra flere vinkler. Parametere:
  - `?vinkler=34,fram,side,bak,topp,spill`
  - `?lav=1` for lav detalj
  - `?figur=navn` for én figur
- **Iskatt** har fortsatt den gamle figuren. Matdyr uten ny figur vises som en farget kule.

Bygg modellene på nytt: `python3 blender/matdyr_hybrider.py modeller` og `python3 blender/miljo_ressurser.py modeller`. Begge krever bpy 5.x.
