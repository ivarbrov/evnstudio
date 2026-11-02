# Mørkeskogen 2.0 – fase 0: status til gjennomgang (2.11.2026)

**Gren:** `morkeskogen-2.0`. `main` (f88263c) og evnstudio.no er uendret. G0 er godkjent. Forberedelsene til fase 1 er dokumentert og bestått (se pkt. 2 og 4).

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

**Første resultat (før G0):** 5 scener, 3 556 bilder. Original mot original 5/5, original mot 2.0 5/5, mutanten ble oppdaget i alle 5.

**Utvidet resultat (2.11.2026, etter G0):** 12 scener, 10 022 bilder (ca. 167 s spilltid). Etter hver scene lastes spillet på nytt fra en kopi av lagringen, og tilstanden sammenlignes igjen.

| Sammenligning | Scener med lik tilstand | Lik etter ny lasting fra lagringskopi | Konklusjon |
|---|---|---|---|
| Original mot 2.0 (flyttet logikk) | **12 av 12** | **12 av 12** | Ingen avvik i spillogikk eller lagring |
| Original mot mutant (fart 170 → 171) | 2 av 12 (avvik i 10) | – | Oppdaget overalt der helten går selv |
| Original mot mutant2 (togfart 300 → 301, verdensfrø +1) | 0 av 2 (tog, ny verden) | – | Dekker de to scenene den første mutanten ikke traff |

Den første mutanten ble ikke oppdaget i «tog» og «ny verden». Grunnen er at helten der flyttes direkte og ikke går selv. Derfor ble mutant2 laget med feil akkurat i de to systemene, og den ble oppdaget i begge.

**Hver scene er kontrollert for at handlingen faktisk skjedde.** Hendelsene leses fra originalen; 2.0 hadde samme tilstand.

| Scene | Bekreftet effekt |
|---|---|
| hugging_felling | Treet er felt, og ved er samlet (3) |
| hytte_seng_sovn | Hytte og halmseng er bygd fra byggemenyen; søvn er startet i senga (kveld); oppdrag fullført (2) |
| fiske | Fisk er fanget med stang ved innsjøen (1 art i fiskeboka, XP gitt) |
| lasso | Ett dyr er temmet med lasso og følger etter |
| beinslottet | Helten er inne i Beinslottet (etasje 0); kamp (liv 96); oppdrag fullført (1) |
| tog | Påstigning ved perrong A, tur, framme ved B, ute av toget. Helten endte med 0 liv etter ventetiden – likt på begge sider |
| ny_verden | «Lag en helt ny verden» er trykket to ganger (bekreftelse); nytt verdensfrø er lagret |
| bygging_og_sovn | Halmseng og bålnivå 2 |
| natt_og_monstre, vaapen, start_og_gange, hugging_og_baal | Som før |

**Kjent unntak:** `evn-spilletid-morkeskogen` skrives av en sanntidstimer i EVN-PAUSE, ikke av spillogikken. Den sammenlignes derfor ikke.

**Metode i de nye scenene:** For å komme raskt til riktig sted settes heltens plass og eventuelt ressurser eller XP direkte. Dette gjøres med nøyaktig samme verdier på begge sider. Selve handlingen (hugge, bygge, sove, kaste, fiske, gå om bord) utføres med vanlige tastetrykk og menyknapper, slik at spillets egen kode kjører.

**Gjenstående dekning (ikke krav for G1, foreslås senere):**
- oppdrag med bossen og samtaler i Kaktusbyen
- Beinslottet lenger inn (etasje 1–2, kister)
- ekte lagringer fra Evens enheter som testkopier (krever en voksen)

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

### Måling 2.11.2026 kl. 06:50 – ytelsestest v2, 1 min (gyldig)
iPhone (iOS 18.7, Claude-appen), stil 2, Middels, DPR 1,5. Skjermlås-hindring: **aktiv**. Ingen avbrudd. **Status: BESTÅTT** (mål 30 FPS).

| Scene | FPS | 1 % lav | Verste bilde | Hakk > 100 ms | Tegnekall | Trekanter / skygge |
|---|---|---|---|---|---|---|
| Dag ved bålet | 55,4 | 33,3 | 33 ms | 0 | 138 | 0,51 M / 0,16 M |
| Natt, 3 monstre | 45,8 | 32,3 | 34 ms | 0 | 140 | 0,48 M / 0,18 M |
| Ovenfra | 49,9 | 37,0 | 29 ms | 0 | 141 | 0,38 M / 0,06 M |

**Vurdering:**
- **Mot 30 FPS:** Oppfylt med margin. Ingen enkeltbilder var tregere enn 34 ms (ca. 29 FPS), og det var ingen hakk.
- **Bildene veksler mellom 16,7 og 33 ms.** iOS viser et bilde enten ved neste eller nest neste skjermoppdatering, så snittet blir et blandingstall mellom 60 og 30. Det betyr at mange bilder bruker litt mer enn 16,7 ms (grensen for 60 FPS), men godt under 33 ms (grensen for 30 FPS).
- **Lavere enn i går kveld** (60 i alle scener med v1, samme mengde geometri). Mulige årsaker, ingen er kontrollert:
  - Telefonen var varmere eller lå i lader. Lading gir varme.
  - Strømtilstanden var en annen.
  - Bakgrunnsaktivitet om morgenen.

  Målemetoden er ikke årsaken: v1 og v2 regner FPS likt når det ikke er avbrudd.
- **Konklusjon:** Ingen endring i grafikk eller kvalitet anbefales nå. Det avgjørende er om bildefrekvensen holder seg over 30 i 10 min. Det viser bare en gyldig varmetest.

### Varmetest 2.11.2026 kl. 06:51–07:01 – v2, 10 min (gyldig)
Samme iPhone, stil 2, Middels, DPR 1,5. Skjermlås-hindring aktiv. **600 s aktiv tid av 600, 0 avbrudd. Status: BESTÅTT.**

| | Hele testen | Svakeste minutt | Sterkeste minutt |
|---|---|---|---|
| FPS | 55,6 | 51,5 (min. 3) | 57,8 (min. 6 og 8) |
| 1 % lav | 37,0 | 32,3 (min. 3) | 40,0 |
| Verste bilde | 39 ms | – | – |
| Hakk > 100 ms | 0 | – | – |

**Vurdering:**
- **Ingen tegn til varmestruping.** FPS steg fra ca. 52 i minutt 1–3 til 56,6–57,8 i minutt 4–10. Testen startet rett etter 1-minuttstesten, så telefonen var ikke kald.
- **Laveste verdi:** Ingen hele minutter var under 51 FPS. Laveste «1 % lav» var 32,3, over målet på 30.
- **Hva testen dekker:**
  - Én scene (dag ved bålet) på én enhet. Natt med monstre var tyngst i 1-minuttstesten (45,8 FPS) og er ikke varmetestet.
  - Android, eldre telefoner og PC (60 FPS-målet) er ikke testet.
- **Minutt 11:** Hadde 1 bilde og 0 s. Det var et rest-minutt fra siste bilde. Fra nå vises rest-minutter under 1 s ikke.

**Forslag til B7 (endelig, for denne fasen):**
- Middels er standard på mobil.
- Kravet er ≥ 30 FPS i alle hele minutter av en 10-minutters varmetest, og «1 % lav» ≥ 30.
- Kravet gjentas ved G2 og G6 med representative scener (natt, biomer, steder). Varmetesten bør da veksle mellom scener i stedet for å bruke bare én.
- PC-måling (60 FPS) gjenstår.

## 4. G0 – godkjent 2.11.2026 (Ivar)
- **Tvillingen** er godkjent som grunnlag for fase 1. Dekningen er utvidet før G1 (se over).
- **B7 endelig:**
  - Stil 2, Middels er standard på mobil.
  - Mobil: minst 30 FPS i hvert hele minutt av en 10 minutters varmetest, og 1 % low ≥ 30 i testede representative scener.
  - PC: mål 60 FPS. Dette må verifiseres på en ekte PC.
  - Kravene gjelder den testede iPhonen. Eldre telefoner og Android vurderes separat.
  - Målet er høyest mulig grafisk kvalitet, ikke bare minstekravet.
- **Senere:** Varmetesten utvides til representativ last (natt, monstre, flere biomer, bygging). Prototypen alene er ikke bevis for at hele spillet oppfyller kravene.
