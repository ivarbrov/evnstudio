# Era Defenders 2 – testverktøy

- `balanse.mjs`: simulerer bølge 1–10 i hver av de fire verdenene med to strategier (ingenting, blandet) via `__spill.steg()`. Krever Playwright og Chrome; stiene er satt for Claude-arbeidsmappen.
- `spilltest.mjs`: laserpistol (trykk og hold), kraftdytt, granat, at hindre stopper skudd, lava, verdensbytte og lagring, overgang fra gammel lagring (v1), og overlapp mellom knappene på mobil.



Resultat 5.11.2026 (v0.5.0, roboten står stille og slåss automatisk): uten bygging slått ut på bølge 9 (Isplaneten, Skogmånen) og bølge 5 (Kampstasjonen, Lavaplaneten); med bygging vinnes alle fire verdenene. 3–4 minutter simulert spilletid per verden.
