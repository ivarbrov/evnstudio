# Era Defenders 2 – testverktøy

- `balanse.mjs`: simulerer bølge 1–10 med tre strategier (ingenting, bare lasertårn, blandet) via `__spill.steg()`. Krever Playwright og Chrome. Stiene er satt for Claude-arbeidsmappen og må justeres lokalt.
- `spilltest.mjs`: start, nedtelling til bølge, sverd, kraftdytt (tast og mus), sverdkast, at sverdet slår laserskudd tilbake, at våpenknappene bare vises på berøring, og overlapp mellom knappene på mobil (844×390 og 390×844).


Resultat 5.11.2026 (v0.4.0, roboten står stille og slåss automatisk i simuleringen): ingenting = slått ut på bølge 5; bare lasertårn = vinner; blandet = vinner. Ca. 3 minutter simulert spilletid.
