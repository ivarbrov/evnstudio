# Teknisk migrering: Mørkeskogen 5.6.2 på three.js r187

`index.html` er en kopi av `spill/morkeskogen/index.html` (f88263c) med disse endringene. Alle er merket `EVN-MIGRERING`:

1. three.js r187 lastes som en egen global build (`vendor/three-r187.global.js`), fordi r160+ ikke har UMD-bygg.
2. Et kompatibilitetslag: `ColorManagement.enabled = false`, lineær utdata, lysstyrke × π og den gamle avstandsdempingen (fjernet i r155/r165).
3. `PCFSoftShadowMap` → `PCFShadowMap`. PCFSoft er fjernet.
4. `skinning: true` er fjernet fra heltematerialet (r129).
5. Kantlyset på helten settes inn før `#include <opaque_fragment>` (r154). Tidligere ville det forsvunnet uten feilmelding.
6. Stiene er ett nivå dypere (`../../../`), og testkroken `window.__dbg` er lagt til.

Dette er en teknisk test, ikke en ny versjon. Lagring og spillmekanikk er uendret.

**Kjent feil i denne testkopien (funnet 2.11 i fase 1):** Elvas shader-tillegg (speiling, skum og solglimt) erstatter `gl_FragColor`-linja, som ikke finnes i r187. Effekten forsvinner derfor uten feilmelding her. Rettet i 2.0-bygget (`kilde/grafikk-2.js`), og `verktoy/sjekk-shader.mjs` stopper nå bygget hvis en shader-erstatning ikke treffer.
