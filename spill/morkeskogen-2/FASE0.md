# Mørkeskogen 2.0 – fase 0: status til gjennomgang (2.11.2026)

**Gren:** `morkeskogen-2.0`. `main` (f88263c) og evnstudio.no er uendret. Fase 1 er ikke startet.

## 1. Logikkflytting (grunnlaget for tvillingen)
- **Verktøy:** `verktoy/del-opp.mjs` deler hovedskriptet i 5.6.2 i 499 toppnivåblokker:
  - **407 logikkblokker** (2 716 linjer) i `kilde/logikk-5x.js`
  - **92 grafikkblokker** (3 680 linjer) i `kilde/grafikk-5x.js`
  - Blokkene er **ordrett** fra 5.6.2.
- **Bygg:** `verktoy/bygg-spill.mjs` setter blokkene sammen i opprinnelig rekkefølge til `spill/morkeskogen-2/spill/`. Byggingen **stopper** hvis en logikkblokk avviker fra originalen.
  - Status: alle 407 er uendret.
  - sha256 for hele hovedskriptet er lik originalen (10b3783b…).
- **12 koblingspunkter:** logikkblokker som leser grafikktilstand.
  - Kamera: `camAim`, `camRotate`, `camZoom`, C-tasten, kameraknappen, pointer lock
  - `update`, `menuAction`, `resize`, `toScreen`, `applyQuality`
  - Deklarasjonen `R3`

  Dette er de stedene grensesnittet i fase 1 må dekke (jf. plan pkt. 5).

## 2. Logikktvilling (`tester/tvilling.js`)
**Hvordan den virker:** Original 5.6.2 og 2.0 kjøres side om side i hver sin nettleserprofil. De får samme frø, samme klokke (fast 60 Hz) og samme tastetrykk, og spilltilstanden sammenlignes hvert 30. bilde:
- `g`, som inneholder posisjoner, kollisjoner, dyr, monstre, ressurser, bygninger, bål, tid og prosjektiler
- `hero`, som inneholder våpen, våpennivå, XP og oppdrag
- `world`
- `state`
- lagringsnøklene `mork3d.*`
- antall tilfeldige trekk i logikken

**Ved avvik:** De første 15 avvikene rapporteres med sti og kategori. Kategoriene er posisjon/kollisjon, oppdrag, våpen, progresjon, lagringsdata og spilltilstand. Visuelle forskjeller er ikke med, fordi grafikkobjekter holdes utenfor sammenligningen.

**Rammer for testen:**
- **Egne tallrekker:** Grafikken har egen tallrekke. Den merkes ved servering rundt `draw`, `buildWorld` og `initR3`. Ny grafikk i fase 1 kan dermed ikke forskyve spillogikkens tilfeldige tall.
- **Uten tegning:** WebGL-tegning er slått av. All annen kode kjører.
- **Lagring:** Lagringene testes som **kopier** i en midlertidig profil. Ingen ekte spillerfremgang berøres.
- **Original uendret:** Originalfilens sha256 kontrolleres før og etter.

**Resultat:** 5 scener, 3 556 bilder (ca. 59 s spilltid).

| Sammenligning | Scener med lik tilstand | Lik etter ny lasting fra lagringskopi | Konklusjon |
|---|---|---|---|
| Original mot original | 5 av 5 | 5 av 5 | Testen er deterministisk |
| Original mot 2.0 (flyttet logikk) | **5 av 5** | **5 av 5** | Ingen avvik i spillogikk eller lagring |
| Original mot mutant (fart 170 → 171) | 0 av 5 (avvik funnet etter 40–192 bilder) | – | Testen oppdager en liten logikkendring |

**Kjent unntak:** `evn-spilletid-morkeskogen` skrives av en sanntidstimer i EVN-PAUSE, ikke av spillogikken. Den sammenlignes derfor ikke. Det første kjøreforsøket viste at tidspunktet varierer.

**Dekningshull (rettes før G1):**
- **Hugging:** Scenen ga ikke felt tre. Plassering og sikte må justeres.
- **Bygging:** Hytta ble ikke bygd. Halmseng og bålnivå 2 ble bygd.
- **Søvn:** Søvn ble ikke utløst.
- **Ikke dekket ennå:** fiske, lasso og tamme dyr, Beinslottet, tog og Kaktusbyen, oppdrag med bossen, og «Lag en helt ny verden».
- **Ekte lagringer:** Lagringstesten bruker lagringer laget av testen selv. Ekte lagringer fra Evens enheter kan legges til som kopier (eksport fra nettleseren). Det krever en voksen.

## 3. Ytelsesmålinger (prototypen)
**iPhone (iOS 18.7, Claude-appen), stil 2, Middels, DPR 1,5**, ytelsestest v1 (1.11 kl. 23:18):

| Scene | FPS | 1 % lav | Tegnekall | Trekanter / skygge |
|---|---|---|---|---|
| Dag ved bålet | 60 | 58,8 | 136 | 0,53 M / 0,18 M |
| Natt, 3 monstre | 59,9 | 58,8 | 159 | 0,42 M / 0,12 M |
| Ovenfra | 60 | 58,8 | 141 | 0,37 M / 0,05 M |

**Vurdering mot målet (≥ 30 FPS på mobil):**
- **Kortvarig: oppfylt.** Alle scenene lå på skjermens tak på 60 Hz, så det er reserve. Hvor stor den er, kan ikke måles slik.
- **Over tid: ikke avgjort.** Det krever en gyldig varmetest.

**Varmetesten kl. 23:36 er UGYLDIG.** Feilen lå i testen v1, ikke i spillet:
1. **Bildeløkken stoppet:** Nettleseren sluttet å tegne etter ca. 2,7 min med 60 FPS, trolig på grunn av skjermlås eller at appen gikk i bakgrunnen. `requestAnimationFrame` stopper da helt. Etter ca. 14 min kom ett bilde.
2. **Pausen ble regnet som testtid:** Testen talte sanntid. Det ene bildet på ca. 14 min fylte opp «10 minutter».
3. **Minuttlisten ble feil:** Den ble indeksert på sanntid. Pausen hoppet over plassene 5–17, som ble `null`. Plass 18 ble pausebildet (0 FPS), og plass 4 var tregere bilder like før stoppen.
4. **Snitt og 1 % lav målte ulike ting:** Snittet (9,5 FPS) tok med pausen. «1 % lav» (58,8) så bort fra de 10 trege bildene blant 9 771. Derfor så tallene motstridende ut.
5. **Konklusjon:** Testen skilte ikke mellom lav bildefrekvens og at ingenting ble tegnet.
6. **Claude-appen:** Artefakten kjører i en iframe i Claude-appens nettleservindu. Skjermlås-hindring (Wake Lock) ble avvist i testnettleseren. På iPhone er det ikke kontrollert. Om iOS struper bildefrekvensen i iframe eller i strømsparingsmodus (30 Hz), er heller ikke kontrollert. Testen v2 melder fra om begge deler.

**Ytelsestest v2 (2.0-proto.3, publisert i testkopien):**
- **Bare aktiv tid teller.** FPS regnes som bilder delt på aktiv tid.
- **Avbrudd gir UGYLDIG TEST.** Testen stopper og viser delresultatet merket UFULLSTENDIG. Som avbrudd regnes:
  - skjult side eller `pagehide`
  - ett bilde over 5 s
  - ett bilde over 0,5 s etter normale bilder, uten at spillet selv jobbet
- **Ekte treghet** gir IKKE BESTÅTT, ikke UGYLDIG. Det gjelder vedvarende trege bilder, også når skjermkortet er flaskehalsen.
- **Rapporten viser:**
  - aktiv og planlagt testtid
  - antall gyldige målinger og avbrudd
  - hendelseslogg
  - hele og delvise minutter
  - status for skjermlås-hindring
  - merknad hvis FPS ligger på 60 Hz-taket eller ved 30 Hz
- **Status:** BESTÅTT, IKKE BESTÅTT eller UGYLDIG TEST.
- **11 enhetstester** med simulerte bildetider (`npm test`). Evens iPhone-mønster gir nå UGYLDIG TEST.
- **Grafikk og kvalitet er uendret.**

**Gjenta varmetesten slik:**
- **Før start:** Sett «Autolås» til «Aldri» og koble til lader. Ikke bruk strømsparingsmodus.
- **Under testen:** Ikke rør eller bytt app i 10 min.

## 4. Til godkjenning (G0)
1. Ta en ny varmetest med v2. Resultatet avgjør det endelige mobilkravet (B7).
2. Godta at tvillingen er grunnlaget for fase 1, med dekningshullene over lukket før G1.
3. Valgfritt: ekte lagringer fra Evens enheter som testkopier.
