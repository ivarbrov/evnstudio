# EVN-roboten – felles kilde

Den gule roboten fra Mørkeskogen 2.0 er hovedkarakteren i EVN Studios spill og maskoten på evnstudio.no (Evens beslutning 2.11.2026).

## Én kilde

| Fil | Hva |
|---|---|
| `helt-robot.glb` | 3D-modellen. «RobotExpressive» av Tomás Laulhé (Quaternius), endret av Don McCurdy, fra three.js-eksemplene. **CC0 1.0.** Byte for byte lik `spill/morkeskogen-2/prototype/modeller/helt-robot.glb` på grenen `morkeskogen-2.0`. Modellen er ikke endret. |
| `robot-oppsett.js` | Gulfargen `#ffcc00` (materialet «Main») og lyset bildene tegnes med. Endres bare med Evens godkjenning. |
| `tegn.html`, `lag-bilder.mjs`, `server.mjs` | Tegner 2D-bilder av modellen i en nettleser uten skjerm (three.js r187, sRGB og ACES som Mørkeskogen 2.0). |
| `lag-web.py` | Beskjærer råbildene og lager WebP-filene til nettsiden. |

## Hvordan spillene bruker roboten

Fossil Zoo og Era Defenders får roboten på grenene `robot/fossil` og `robot/era`; nettsiden på `robot/nettside`. Tabellen viser målbildet når grenene er godkjent.

Spillene har ulik teknikk, så de får roboten på hver sin enkle måte. Ingen felles karakterkode.

| Spill | Teknikk | Bruk |
|---|---|---|
| Mørkeskogen 2.0 | three.js r187 | Laster GLB-filen direkte (`grafikk/helt.js`). 90 % størrelse. Ikke endret. |
| Dyrepatruljen | three.js r128 | GLB innebygd som base64, farge `#ffcc00`. Ikke endret. |
| Fossil Zoo | 2D canvas | Spritark `fossil-ark.webp` (26 bilder à 128 px, sett skrått fra høyre) som data-URI. |
| Era Defenders | 2D canvas, ovenfra | Spritark `era-ark.webp` (5 retninger × 12 bilder à 96 px, kamera 35° over bakken) som data-URI. Vest-retningene speiles i spillet. |
| evnstudio.no | HTML | `bilder/robot-*.webp` |

Bildene ligger som data-URI i 2D-spillene, fordi spillene også skal virke som Claude-artefakter uten tilgang til `bilder/`. CSP tillater `img-src data:`.

## Lage bildene på nytt

```
cd felles/robot
npm install
npx playwright install chromium   # bare hvis Chromium mangler
node lag-bilder.mjs ut
python3 lag-web.py ut ut/web
```

Etterpå: lim inn nytt spritark i spillet (data-URI) og kopier `ut/web/*.webp` til `bilder/`. Kontroller i spillet at føttene står på bakken.

## Senere

- Mørkeskogen 2.0 kan peke til `felles/robot/helt-robot.glb` når G1 er ferdig, i stedet for sin egen kopi. Ikke gjort nå, for å unngå konflikt med G1.
- Dyrepatruljen har modellen innebygd. Det er en bevisst kopi (artefakten må virke uten nettverk).
