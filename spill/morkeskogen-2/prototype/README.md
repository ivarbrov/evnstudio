# Mørkeskogen 2.0 – grafikkprototype (isolert testscene)

Ikke publisert. Ligger bare i grenen `morkeskogen-2.0`. `spill/morkeskogen/` (5.6.2) er ikke endret.

- **Åpne:** `index.html` via en lokal webserver, for eksempel `python3 -m http.server` i repo-roten og `/spill/morkeskogen-2/prototype/`.
- **Valg i adressen:** `?stil=1|2`, `?kvalitet=lav|middels|hoy`, `?maal=1` (måleoverlegg), `?tid=dag|kveld|natt`, `?auto=1` (tiden går).
- **Taster:** G stil, T tid, C kamera, Q kvalitet. Ellers som i 5.6.2.
- **Bygg:** `npm install && npm run bygg` gir `spill.js` (esbuild). Kildekoden ligger i `src/`.
- **Tester:** `tester/proto-funksjon.js` (funksjon) og `tester/proto-skudd.js` (skjermbilder og måling). Begge bruker Playwright mot `localhost:8765`.

## Struktur
- `src/verden.js` – spillogikkens verden (terreng, plassering, kollisjon). Ingen three.js.
- `src/helt.js`, `src/kamera.js`, `src/styring.js` – helt, kamera og styring med tallene fra 5.6.2.
- `src/grafikk/` – grafikklaget: bakke, trær, gress, lys/døgn, bål, hytte, monster, materialer, teksturer.
- `src/maal.js` – måleoverlegg (`window.__maal`).
