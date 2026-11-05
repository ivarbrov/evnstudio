# Era Defenders 2 – testverktøy

- `balanse.mjs`: simulerer bølge 1–10 med tre strategier (ingenting, bare lasertårn, blandet) via `__spill.steg()`. Krever Playwright og Chrome. Stiene er satt for Claude-arbeidsmappen og må justeres lokalt.

Resultat 5.11.2026 (v0.1.0): ingenting = taper bølge 4; bare lasertårn = vinner (base 39/150); blandet = vinner (base 158/230). Ca. 3–4 minutter simulert spilletid; en ekte spiller bruker lengre tid på å bygge mellom bølgene.
