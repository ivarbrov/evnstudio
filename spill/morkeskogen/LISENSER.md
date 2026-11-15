# Mørkeskogen 2.0 – ressurser og lisenser

| Ressurs | Fil | Opphav | Lisens | Status |
|---|---|---|---|---|
| Helten (RobotExpressive) v2: ny geometri fra Blender (avfasede kanter, runde øyne, færre deler), skjelett og animasjoner uendret, hovedfarge gul | `modeller/helt-robot-v2.glb` (i bruk fra 2.0.3). Originalen `modeller/helt-robot.glb` er beholdt uendret | Tomás Laulhé (Quaternius), endret av Don McCurdy, fra three.js-eksemplene | CC0 1.0 | OK (beslutning 1.11.2026: roboten er helten) |
| three.js r187 | `three-r187.global.js`. Fra 2.0.8 er seks `static { this.prototype.isX = true }`-blokker skrevet om til vanlig JavaScript, slik at eldre Safari (iPadOS 15.0–16.3) kan lese filen. Ellers er filen uendret | three.js-forfatterne | MIT (`three-r187-LICENSE.txt`) | OK |
| GLTFLoader (i `grafikk2.js`) | `grafikk2.js` | three.js-forfatterne | MIT | OK |

Kreditering: begge lisensene krever ingen synlig kreditering i spillet. MIT-lisensen for three.js følger med i `three-r187-LICENSE.txt` i samme mappe.
