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
