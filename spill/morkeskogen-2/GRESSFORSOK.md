# Mørkeskogen 2.0 – gressforsøk A/B (2.11.2026)

**Status:** Isolert forsøk i prototypen (`prototype/`, v2.0-proto.4). Spillet, spillogikken, `main` og evnstudio.no er ikke endret.

## Dagens gress
| | 5.6.2 og 2.0-spillet (`kilde/grafikk-2.js`) | Prototypen (A) |
|---|---|---|
| Oppbygging | `InstancedMesh` per verdensblokk (gress, blomster, bregner, sopp) | 1 tegnekall. Plasseres i vertex-shaderen fra høydekart og følger helten |
| Vind | Ja, ett sinusmønster (`R3.windU`), krymper på avstand | Ja, to sinuser med fase etter posisjon |
| Kontakt | Nei. Heltens posisjon brukes bare til uttoning | Skyver gresset bort innenfor 30 enheter, men retter det opp **momentant** |
| Fart, typer, av/på | – | Ingen fartsforskjell, én tusttype, ingen bryter |

## B (`prototype/src/grafikk/gress.js`, `#define GRESS_B`)
- **Typer:** Tre tusttyper per instans (hash): kort og stiv, middels, høy og myk. De har ulik høyde, stivhet og vindfase.
- **Vind:** Langsomme vindkast ruller over enga, med små skjelvinger oppå.
- **Spor:**
  - **Punktene:** De 12 siste posisjonene til helten (posisjon, alder og kraft) sendes som `uniform vec4[12]`.
  - **Bøyning:** Gresset bøyes bort fra punktene og retter seg gradvis opp (`exp(-alder × 1,6)`).
  - **Fart:** Kraften går fra 0,5 når helten står stille, til 1,0 i full fart. Løping gir altså bredere og kraftigere bøyning. Når helten er i lufta, bøyes ikke gresset.
  - **Kostnad:** Sporet regnes bare for tuster innenfor 260 enheter fra helten.
- **Kostnad:**
  - Tegnekall og trekanter er de samme som i A. Målt i prototypen på Middels: 119 og 119 tegnekall, og 0,49 M og 0,49 M trekanter.
  - På CPU er det 12 tall-oppdateringer per bilde, uansett hvor mye gress det er.
  - Ekstra GPU-arbeid i vertex-shaderen: en løkke over 12 punkter for tuster nær helten.
- **Bryter:** `settModus('A'|'B')`. Foreslått: A eller av på Lav, B på Middels og Høy.

## Målinger
- **Testmiljøet her (SwiftShader, programvaregrafikk):**
  - Tegnekall og trekanter er like i A og B.
  - FPS (under 1 her) og bilder sier ingenting om iPhone. Bildeserien ble dessuten delvis skjult av et tre, og er ikke god nok til å vurdere utseendet.
- **iPhone: ikke målt ennå.** Testkopien har knapper for A og B og «🌿 Gresstest A/B (3 min)».
  - Testen veksler A og B i samme tette gress: står stille, går og løper, to runder.
  - Den gir FPS, 1 % lav, tegnekall og trekanter per scene.
- **GPU-tid kan ikke måles i nettleseren på iOS.** `EXT_disjoint_timer_query` finnes ikke der.

## Forslag til integrering
Hvis iPhone-målingen viser liten kostnad (forslag: under ca. 3 FPS lavere snitt og 1 % lav fortsatt ≥ 30 på Middels), og Even synes B ser bedre ut:
- **Fase 2 (skogbiomet):** Integrer i fase 2. Der byttes gresset i spillet uansett ut med prototypens løsning med ett tegnekall.
- **Fase 1:** Ikke i fase 1. Spillets gress er fortsatt det gamle blokk-gresset der.
