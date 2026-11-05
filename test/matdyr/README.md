# Matdyr-regn – tester og simulering

- `qa_regresjon.py` (30 kontroller) og `qa_090.py` (28 kontroller): Playwright + SwiftShader (headless). Kjøres mot artefaktvarianten servert på `http://localhost:8765/index.html`. Tidsavhengige kontroller kaller `step()` direkte fordi headless gir 1–2 FPS.
- `okonomi.js`: økonomisimulering (300 kjøringer × 3 profiler). Bruker spillets egne tall fra `data.js` (trukket ut av `index.html`). **Simulering, ikke spilltest.** Resultat: `resultat.md`.
- `bygg_artefakt.py`: byggeskriptet fra arbeidsområdet (for sporbarhet; stiene peker til arbeidsmappa).
