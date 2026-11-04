# Felles karakterstandard for EVN Studio (utkast)

Status: **forslag, ikke godkjent** (5.11.2026). Gjelder spillbare figurer: EVN-roboten og reven «Nysgjerrig», og senere figurer.
Visuelle kjennetegn (D1–D10) står i `rev/DESIGNSPESIFIKASJON.md`, punkt 2. Denne fila gjelder det tekniske.

Prinsipp: **Felles der det gjør integrasjonen enkel, eget der det gir figuren uttrykk.** Ingen figur får lik geometri eller lik animasjon med en annen bare for å passe inn.

## Hva deles, og hva er eget

| Område | Felles | Eget per figur | Robot | Rev |
|---|---|---|---|---|
| Format | GLB (glTF 2.0), Y opp, 1 enhet = robotens høyde i spillet etter skalering, origo mellom føttene, ansiktet mot +Z | – | Ja | Ja |
| Høyde | Samme høyde i spillet (D9) | Ører, antenner o.l. kan stikke over | 1,00 | 1,00 + ører |
| Ledd for kropp | Navnene `Hips`, `Torso`, `Neck`, `Head`, `UpperArm.L/R`, `Palm2.L/R`, `UpperLeg.L/R`, `LowerLeg.L/R` | Antall ledd, lengder og ekstra ledd | 43 (med fingre) | 17 |
| Ekstra ledd | – | Fritt navn | Fingre, `PoleTarget` | `Tail1–3`, `Ear.L/R` |
| Klippnavn | `Idle`, `Walking`, `Running`, `Jump`, `Punch`, `Wave` (de spillene bruker) | Bevegelsene selv. Ekstra klipp med egne navn | + `Dance`, `Death`, `Yes`, `No`, `Sitting`, `Standing`, `ThumbsUp`, `WalkJump` | + `Sneak` |
| Festepunkt hode | Ledd `Head` + mesh `Head_3` (garderoben måler hodet med den) | Hvor hodet er | `Head_3` = ansiktsflaten | `Head_3` = hodeformen |
| Festepunkt rygg | Ledd `Torso` | – | Ja | Ja |
| Festepunkt hånd | Ledd `Palm2.R` / `Palm2.L` (GLTFLoader gjør navnet til `Palm2R`) | Grepet | Ja | Ja |
| Kanter og skyggelegging | Avfasing 0,6 % av høyden på kanter > 40°, hardede normaler, myk skyggelegging mellom små fasetter (v2) | – | Ja | Ja |
| Materialprinsipp | Flate farger, ingen teksturer, ≤ 3 materialer + ett lite gult kjennetegn, PBR med ruhet 0,3–0,8 | Fargene | `Main`, `Grey`, `Black` | `Pels`, `Lys`, `Mork`, `Gul` |
| Hovedfarge | Figuren oppgir navnet på materialet som kan farges | – | `Main` (spillene farger det gult) | `Pels` (bevisst ikke `Main`, så spill som farger `Main` gult, ikke gjør reven gul) |
| Tegnekall | ≤ 5 per figur | – | 5 (v2) | 5 |
| Trekanter | ≤ 8 000 | – | 7 668 (v2) | 5 330 (v2) |
| Fil | Mål ≤ 250 kB, tak 500 kB | – | 475 kB | 311 kB |

Garderoben (`ecoins/tilbehor-3d.js`) virker på begge uten endring fordi begge har `Head`, `Torso` og `Head_3`. På sikt bør garderoben bruke egne festepunkter (`EVN_hode`, `EVN_rygg`) i stedet for å måle `Head_3`. Det er en egen endring i E-coins-arbeidet.

## Felles karaktervelger

Som i `TEKNISK-PLAN.md`: kjøpet i `kjopt["figur.rev"]`, valget i egen nøkkel `evn-figur-v1`, og en felles `felles/figurer/figur.js` som gir spillet riktig modell, hovedmateriale og høyde. Roboten v1 eller v2 velges der, ikke i hvert spill. Da kan v2 rulles ut og trekkes tilbake på ett sted.

## Kilder og verktøy

- Ingen `.blend`-filer i repoet foreløpig. Figurene lages av skript som kan kjøres på nytt (`verktoy/figurer/`). Det utsetter valget om Git LFS.
- Blender 4.5 LTS (offisiell, portabel) er brukt i bakgrunnen. Versjonen skal stå i rapporten for hver figur.
