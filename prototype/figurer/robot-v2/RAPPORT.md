# EVN-roboten v2: grafisk forbedring i Blender (før og etter)

Status: **utkast til Even** (5.11.2026). Originalen `ecoins/helt-robot.glb` (og kopiene i spillene) er **ikke endret** og er fortsatt referanse og tilbakestilling. Ingen spill bruker v2.
Se: `for-etter.html` (åpnes fra en lokal server i repoet), bilder i `bilder/`.

## Hva er gjort

| Område | Før | Etter (v2) | Hvorfor |
|---|---|---|---|
| Kanter og overganger | Skarpe kanter overalt | Smal avfasing (0,6 % av høyden) på kanter skarpere enn 40°. Store flater er fortsatt flate | Mykere lys på kantene, mer «leketøy», samme fasetterte stil |
| Øyne | Fasetterte | Runde og blanke (avfasing + myk skyggelegging) | Mer levende blikk. **Even vurderer** om dette er for stor endring |
| Deler (tegnekall) | 19 | **5** (hodet 3, kroppen 2) | Viktigste mobiltiltak. Målt: ca. 140 tegnekall holdt 30 FPS på iPhone, ca. 700 gjorde det ikke |
| Materialer | Matt (ruhet 0,9, metall 0,1) | `Main` ruhet 0,55. `Grey` metall 0,55 / ruhet 0,42 (blankere metall). `Black` ruhet 0,28 (blanke øyne). Samme farger, ingen teksturer | Overflate som skiller lakk, metall og glass |
| Silhuett og proporsjoner | – | Uendret (samme høyde 4,461 i modellenheter, samme ledd) | Krav |
| Farger | – | Uendret. Spillene farger `Main` gul som før | Krav |
| Skjelett, leddnavn, hvilestilling | – | **Byte for byte like** (43 ledd, avvik 0) | Våpen, håv og garderobe festes som før |
| Animasjoner | 14 | **Samme 14, uendrede verdier** | Krav: spillene bruker `Idle`, `Walking`, `Running`, `Jump`, `Punch`, `Wave` |
| Ansiktsuttrykk (morfmål) | `Angry`, `Surprised`, `Sad` | Beholdt, også avfaset | Spillene leser `morphTargetDictionary` |
| Navn spillene bruker | `Main`, `Head_3`, `Head_1`, `Palm2.R`, `Head`, `Torso` | Beholdt | Kontrollert: alle 15 garderobevarer sitter likt |
| Trekanter | 3 237 | 7 668 | Avfasingen. Godt innenfor budsjettet (≤ 8 000) |
| Filstørrelse | 464 kB | 475 kB (+2 %) | Færre hjørner (sammenslått), men flere trekanter og morfmål |

### Målt i nettleseren (én figur, uten skygge)

| | Tegnekall | Trekanter | Animasjoner | Fil |
|---|---|---|---|---|
| Robot før | 19 | 3 237 | 14 | 464 kB |
| Robot etter | 5 | 7 668 | 14 | 475 kB |
| Reven før (fasettert) | 5 | 2 152 | 7 | 296 kB |
| Reven etter (samme behandling som roboten) | 5 | 5 330 | 7 | 311 kB |

30 roboter som går: **571 tegnekall før**, beregnet **151 etter** (30 × 5 + bakke). Bildefrekvensen i den hodeløse testnettleseren (SwiftShader) sier ingenting om mobil og er ikke brukt.

**Mobil er ikke målt.** Ytelsesknappene på `for-etter.html` (30 roboter før, 30 etter, 30 rever) viser bilder per sekund etter 8 s og bør kjøres på Evens iPhone, samme måte som i Mørkeskogen 2.0 (lader, autolås av). Forventning ut fra tidligere iPhone-målinger: færre tegnekall gir bedre ytelse, mens flere trekanter betyr lite.

## Reven: samme forbedring

Reven er laget i Blender (`verktoy/figurer/bygg_rev.py`) fra godkjenningsmodellen og har fått samme behandling som roboten v2 (vedtak 5.11.2026: «forbedre reven også i Blender på samme måte»):

| Område | Før | Etter |
|---|---|---|
| Kanter | Skarpe, fasettert | Avfaset (0,6 % av høyden) på kanter skarpere enn 40°, hardede normaler |
| Øyne, poter, hale | Fasetterte | Runde og myke |
| Overflate | Pels ruhet 0,75, mørkt 0,45, halsbånd 0,5 | Pels 0,6, øyne og nese 0,32 (blanke), halsbånd 0,4 med litt metall |
| Form, farger, ledd, animasjoner, festepunkter | – | Uendret |
| Trekanter | 2 152 | 5 330 |
| Tegnekall | 5 | 5 |
| Fil | 296 kB | 311 kB |

Se «Reven før og etter» og «Reven nærbilde» i `for-etter.html`.

## Hvordan v2 lages (kan gjentas)

1. `verktoy/figurer/robot_geometri.py` (Blender 4.5 LTS i bakgrunnen): leser originalen, slår sammen like hjørner, merker kanter > 40°, avfaser med «hardede» normaler og regner ut ansiktsuttrykkene på nytt med samme topologi. Skriver bare geometri.
2. `verktoy/figurer/bygg-robot-v2.mjs` (Node): setter geometrien inn i **originalens** skjelett. Ledd, hvilestilling og animasjoner kopieres uendret. Delene slås sammen til én bøyelig kropp, og hodet beholdes for seg på hodeleddet.

Hvorfor ikke eksportere hele roboten fra Blender? Prøvd: Blenders glTF-import endrer leddenes retning (alle tre valgene for leddretning ga avvik). Da ville våpen, håv og annet som festes i hånda, pekt feil. Med denne metoden er skjelettet garantert likt.

## Ikke gjort, forslag

| Område | Vurdering | Forslag |
|---|---|---|
| Gange, løping, hopp og hvile | Beholdt uendret av hensyn til spillene. Svakheter: gangen er stiv i overkroppen, og hoppet har lite «fjær» ved landing | Nye klipp lages **i tillegg** med egne navn (for eksempel `Walking2`), prøves i ett spill og godkjennes av Even før de erstatter de gamle |
| Lys og skygger | Avhenger av spillet, ikke modellen. Sammenligningen bruker myke skygger (PCF) og samme lys som E-shop | Mørkeskogen 2.0 har allerede ACES og skygger. Dyrepatruljen og Magiske egg kan få kontaktskygge under figuren (billig) |
| Mindre fil | Ikke komprimert | `KHR_mesh_quantization` (trolig 30–40 % mindre geometri), må prøves i r128 og r187 |
| Garderobevarer | Sitter likt som før | Ingen endring nødvendig |
