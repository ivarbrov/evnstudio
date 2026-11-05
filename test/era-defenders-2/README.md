# Era Defenders 2 – testverktøy

- `balanse.mjs`: simulerer bølge 1–10 med tre strategier (ingenting, bare lasertårn, blandet) via `__spill.steg()`. Krever Playwright og Chrome. Stiene er satt for Claude-arbeidsmappen og må justeres lokalt.

Resultat 5.11.2026 (v0.2.0, roboten står stille ved basen): ingenting = slått ut på bølge 5; bare lasertårn = vinner; blandet = vinner. Ca. 3–4 minutter simulert spilletid; en ekte spiller bruker lengre tid på å bygge mellom bølgene.
