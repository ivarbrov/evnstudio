# Reven «Rebus» som alternativ spillbar karakter: teknisk plan

Status: **forslag, ikke godkjent** (4.11.2026). Ingen kode i spill, E-shop eller E-coins er endret. Ingenting er publisert.
Grunnlag: `origin/main` (ff61022), `ecoins/ecoins.js` 1.0, `ecoins/tilbehor-3d.js`, `butikk/`, spillene på `main` og aktive grener per 4.11.2026.

## 1. Vedtak 4.11.2026 (eieren, etter Evens valg)

1. Den gule EVN-roboten er fortsatt gratis standardkarakter.
2. Reven «Rebus» kan kjøpes i E-shop for 1 000 E-coins.
3. Reven kjøpes én gang og eies for alltid.
4. Etter kjøp velger spilleren mellom roboten og reven i en felles karaktervelger i garderoben.
5. Valgt karakter lagres og brukes i alle EVN-spill som støtter karakterbytte.
6. Begge figurene har samme spillmessige egenskaper: fart, kollisjon, skade, rekkevidde og andre parametere.
7. Karakterbyttet endrer bare utseende og nødvendige animasjoner, ikke spillmekanikken.
8. Reven følger forslag 2 «Nysgjerrig», går på to bein og har de valgte revekjennetegnene.
9. Roboten, saldoen, kjøpte varer og lagrede spill skal ikke påvirkes negativt.

**Vedtak 5.11.2026 (eieren):** Prisen er **700 E-coins** (erstatter 1 000). Arbeidet utvides til en felles karakterpilot: EVN-roboten forbedres grafisk i Blender (v2), med originalen uendret som referanse. Reven bygges i Blender. Begge følger `KARAKTERSTANDARD.md`. Magiske egg er første pilotspill når begge er godkjent.

Even godkjenner utseendet før noe bygges inn. En voksen godkjenner publisering.

---

## 2. E-shop: karakter som egen varetype

### Slik virker E-coins i dag (målt i koden)

- Lagring: `evn-ecoins-v1` i `localStorage` med feltene `tjent`, `kjopt` og `antrekk` (`hode`, `rygg`).
- Saldoen lagres ikke. Den regnes ut som tjent minus summen av `kjopt[*].pris`.
- Når lagringen leses, «vaskes» den: **ukjente vare-ID-er i `kjopt` beholdes** (bare prisen sjekkes), men **ukjente felt fjernes**, og `antrekk` kan bare ha `hode` og `rygg`.
- Era Defenders bufrer `../../ecoins/ecoins.js` i sin service worker (`sw.js`). En eldre `ecoins.js` kan derfor kjøre i Era en stund etter at en ny er publisert.

### Forslag

| Del | Forslag | Hvorfor |
|---|---|---|
| Varen | Ny rad i `VARER`: `{"id": "figur.rev", "navn": "Reven Rebus", "type": "figur", "pris": 1000}`. Eksisterende varer får ingen endring (mangler `type` = tilbehør) | Samme kjøpsfunksjon `kjop(id)`, samme saldo |
| Kjøpet | Lagres som vanlig i `kjopt["figur.rev"]` | Overlever eldre `ecoins.js`, fordi ukjente ID-er i `kjopt` beholdes. Saldoen blir riktig i alle versjoner |
| Roboten | Er ingen vare. Alltid eid | Gratis standard (vedtak 1) |
| Valgt karakter | **Egen nøkkel** `evn-figur-v1`: `{ "v": 1, "valgt": "robot" \| "rev" }` | Et nytt felt i `evn-ecoins-v1` ville blitt slettet av en eldre `ecoins.js` (Era-bufferen) neste gang den lagrer. En egen nøkkel røres ikke av gammel kode |
| Lesing | `EVNEcoins.figur()` gir `"rev"` bare hvis `valgt === "rev"` og `eier("figur.rev")`. Ellers `"robot"` | Ødelagt eller ugyldig valg gir alltid roboten (F3) |
| Velge | `EVNEcoins.velgFigur(id)` skriver `evn-figur-v1` og varsler med samme hendelser som i dag (`pa`, `storage`) | Andre faner og spill oppdateres |
| Nullstilling | «Start helt på nytt» i et spill rører ikke `evn-figur-v1` eller `evn-ecoins-v1` (som i dag for E-coins) | Vedtak 9 |
| Garderoben | Egen fane eller rad «Karakter» øverst: Roboten (gratis, valgt) og Reven (1 000 E-coins / Velg). Hatter og ryggting vises på valgt karakter | Vedtak 4 |
| Antrekk | Felles for begge figurene (samme `antrekk`) | Enklest, og alle 15 varene passer (punkt 5). Eget antrekk per figur kan vurderes senere |
| Gamle sider | E-shop, `ecoins.js` og `tilbehor-3d.js` må publiseres samtidig. Spillene trenger ikke oppdateres for at kjøpet skal virke | Spill uten karakterbytte viser roboten, som i dag |

**Krever endring i:** `ecoins/ecoins.js`, `butikk/butikk.js`, `butikk/index.html`. Dette eies av E-coins-arbeidet (punkt 8). Bør dekkes av `test/ecoins/`, med en ny test for at en eldre `ecoins.js` ikke sletter kjøpet eller valget.

---

## 3. Deling av valgt karakter mellom spillene

- Alle spillene ligger på samme domene (evnstudio.no) og deler derfor `localStorage`. `evn-figur-v1` er synlig i alle spill, slik `evn-ecoins-v1` er det i dag.
- **Ny felles fil `felles/figurer/figur.js`** (forslag): leser valget via `EVNEcoins.figur()`, finner riktig modell og gir spillet ett grensesnitt:
  - `EVNFigur.valgt()` → `"robot"` eller `"rev"`
  - `EVNFigur.last(THREE, { hoyde })` → løfte med `{ modell, klipp, hand, settFarge }`, skalert til samme høyde som roboten i det spillet
- **Bare utseendet byttes.** Spillets egen figurlogikk (fart, kollisjonssirkler, skade, rekkevidde, hoppkraft) leser aldri fra modellen. Spillene skalerer i dag roboten etter modellens høyde (`Box3`), så `figur.js` må skalere reven til samme høyde. Det skal kontrolleres med en test som sammenligner spilltilstanden med robot og rev (som tvillingtestene i Mørkeskogen 2.0).
- **Claude-artefakter:** Dyrepatruljen og Magiske egg har roboten innebygd som base64. Reven må enten bygges inn på samme måte (ca. 1,33 × GLB-størrelsen per spill) eller lastes som fil bare på evnstudio.no. Forslag: innebygd i artefakt-kopien, fil på nettstedet.
- **Spill som ikke støtter karakterbytte** viser roboten. Garderoben sier hvilke spill som støtter reven.
- **2D-spillene** (Fossil Zoo, Era Defenders) trenger egne spritark av reven fra bildeverkstedet (`felles/robot/lag-bilder.mjs`, utvidet). Det kommer til slutt (punkt 7).

---

## 4. Kontroll av prisen: 1 000 E-coins mot opptjeningen

Regnet ut fra milepælene i `ecoins/ecoins.js` 1.0. Prisen er **ikke endret**.

| | E-coins |
|---|---|
| Dyrepatruljen (16 milepæler) | 475 |
| Era Defenders (14) | 495 |
| Fossil Zoo (16) | 375 |
| Magiske egg (21) | 368 |
| **Alt som kan tjenes i dag (67 milepæler)** | **1 713** |
| Mørkeskogen 2.0 (19, «kommer», gir ikke E-coins ennå) | 440 |
| Alt når Mørkeskogen er med | 2 153 |
| Alle 15 varer i E-shop | 1 585 |
| Reven (vedtak 5.11.2026) | 700 |
| **Alle varer + reven** | **2 285** |

### Funn med 700 E-coins (vedtak 5.11.2026)

- Reven koster **41 %** av alt som kan tjenes i dag (33 % når Mørkeskogen er med). Hele Era Defenders (495) eller hele Dyrepatruljen (475) og omtrent halvparten av et spill til er nok.
- Det går fortsatt ikke an å eie alt: 2 285 mot 1 713 i dag (mangler 572) og 2 153 med Mørkeskogen (mangler 132).
- Et barn som har kjøpt hatter for 500, må tjene 1 200 totalt (70 % av alt i dag).
- Vurdering: 700 er et mer realistisk mål enn 1 000 for 7–12 år. Forslaget om å vise «Du sparer til reven» gjelder fortsatt.

### Funn med 1 000 E-coins (opprinnelig pris)

1. **Reven koster 58 % av alt som kan tjenes i dag** (46 % når Mørkeskogen er med). Ingen enkelt spill gir 1 000. Barnet må fullføre nesten tre spill helt, for eksempel hele Era Defenders og Dyrepatruljen og litt av et tredje.
2. **Det går ikke an å eie alt.** Alle varer og reven koster 2 585, mens det finnes 1 713 E-coins i dag og 2 153 med Mørkeskogen. Mangler 872 i dag og 432 med Mørkeskogen.
3. **Konkurranse med hattene.** Et barn som allerede har kjøpt hatter, kan være langt fra reven. Eksempel: Har barnet kjøpt for 500, må det tjene 1 500 totalt. Det er 88 % av alt i dag.
4. **Ingen ubalanse i den andre retningen.** Reven løser overskuddet E-COINS-PLAN pekte på (å eie alt og ikke ha noe å bruke mynter på).
5. **Nye spill** (grenene `spill/vikinglandsby` og `spill/fiskespillet`) kan gi flere milepæler senere. Det er ikke regnet med.

**Vurdering:** 1 000 er mulig, men et langt mål for et barn på 7–12 år, og det går bare an hvis barnet sparer. Ubalansen gjelder særlig barn som har brukt mynter på hatter. Forslag til en voksen og Even: (a) beholde 1 000 og vise «Du sparer til reven: 640 av 1 000» i garderoben, (b) senke prisen, for eksempel til 600–750, eller (c) vente med salget til Mørkeskogen 2.0 gir E-coins. Prisen endres ikke uten vedtak.

---

## 5. Hvilke antrekk passer på reven

Kontrollert ved å feste de **ekte** varene fra `ecoins/tilbehor-3d.js` til den raffinerte revemodellen (`modell.html`, «Hatter» og «Ryggting»). Reven har ledd og mesh med samme navn som roboten (`Head`, `Torso`, `Head_3`), så koden fant festepunktene uten endring.

| Vare | Plass | Resultat | Merknad |
|---|---|---|---|
| Vernehjelm, steinhette, pirathatt, vikinghjelm, faraokrone, trollmannshatt, gullkrone | hode | Passer | Ørene stikker opp ved siden av |
| Ridderhjelm | hode | Passer | Ørene stikker gjennom kanten. Even vurderer |
| Romhjelm | hode | Passer | Ørene er inne i boblen |
| Ryggsekk, oksygentank | rygg | Passer | Sitter over halen |
| Rød kappe, svart kappe, stjernekappe | rygg | Passer delvis | Halen stikker ut gjennom kappen. Ser bevisst ut, men Even vurderer |
| Verktøybelte | rygg | Delvis skjult | Halen dekker beltet bakfra |

Ingen av varene påvirker spillmekanikken. Det finnes ingen kjøpte **skins** i dag. Even har tidligere bestemt at roboten ikke skal ha fargeskins, så alle E-coins-varene er hatter og ryggting.

---

## 6. Revemodellen til Evens godkjenning

`prototype/figurer/rev/modell.html` viser reven «Rebus» etter forslag 2 og designspesifikasjonen:
- **Rundt reven:** forfra, skrått, fra siden og bakfra, ved siden av den ekte roboten.
- **Uttrykk:** glad, nysgjerrig, jubel (med munn, åpent spørsmål), konsentrert (snike) og litt lei seg.
- **Stillinger:** står, går, vinker, hopper og holder håv.
- **Hatter og ryggting:** de ekte varene fra garderoben.

Modellen er laget av enkle former i three.js, med ledd som har samme navn som robotens. Den er **ikke** den ferdige spillmodellen. Den ferdige modellen lages i Blender etter Evens godkjenning, med tre materialer og innenfor budsjettet (≤ 3 tegnekall, ≤ 250 kB). Skissen er ikke optimalisert og har mange flere deler enn budsjettet tillater.

Faste bilder: `skisser/modell-*.png`.

---

## 7. Trinnvis plan

Hvert trinn er en egen gren og PR, med automatiske tester, EVN Game QA og Evens test. En voksen godkjenner publisering.

| # | Trinn | Filer | Eier | Godkjenning |
|---|---|---|---|---|
| 0 | Even godkjenner før og etter for roboten og reven fra Blender (`robot-v2/for-etter.html`). Pris: 700 (vedtatt) | – | Denne økta | **Even** |
| 0b | Ytelse på Evens iPhone med knappene «Ytelse» i `for-etter.html` | – | Even og en voksen | – |
| 1 | Ferdige modeller: `felles/figurer/robot/robot-v2.glb` (originalen beholdes) og `felles/figurer/rev/rev.glb` med `Idle`, `Walking`, `Running`, `Jump`, `Punch`, `Wave`, `Sneak`, ledd med robotens navn, feste-punkter. Kontroll mot budsjettet og alle 15 varer | `kilde/figurer/rev/`, `felles/figurer/rev/` | Denne økta | **Even**: den ferdige modellen |
| 2 | `felles/figurer/figur.js` og en testside som laster robot og rev i r128 og r187 med samme høyde | `felles/figurer/` | Denne økta | – |
| 3 | E-coins: varetypen `figur`, `figur.rev` til 700, `evn-figur-v1`, `figur()` og `velgFigur()`. Garderoben får «Karakter». Test for eldre `ecoins.js` | `ecoins/ecoins.js`, `butikk/`, `test/ecoins/` | **E-coins-økta** | Voksen: publisering |
| 4 | **Første spill: Magiske egg.** Bruker bare `Idle`, `Walking`, `Running` og `Wave`, og ingen redskaper i hånda. Minst risiko | `spill/magiske-egg/index.html` | **Magiske egg-økta** | Even: spilltest. Voksen: publisering |
| 5 | Dyrepatruljen: håven i begge poter, `Punch` og sniking | `spill/dyrepatruljen/index.html` | **Dyrepatruljen-økta** | Som over |
| 6 | Mørkeskogen 2.0: øks, våpen og `Jump`. Når Mørkeskogen får E-coins | `spill/morkeskogen/` | **Mørkeskogen-økta** | Som over |
| 7 | Fossil Zoo og Era Defenders: spritark av reven fra bildeverkstedet | `felles/robot/` (utvidet), `spill/fossilspillet/`, `spill/eventyrspill/` | Spilløktene | Som over |

**For hvert spill:**
- Samme spill, samme lagring: tvillingtest med robot og rev skal gi samme spilltilstand (posisjon, liv, treff, poeng).
- Gamle lagringer lastes uendret. Spillets lagringsnøkkel endres ikke.
- Statistikken endres ikke. Hvis det senere er ønske om å telle valg av rev, kreves en overgangsplan i `ENDRINGSLOGG.md`.
- Spillet virker som før hvis `figur.js` eller `rev.glb` ikke lastes: da vises roboten.

---

## 8. Koordinering med andre økter

Denne økta fant ingen E-coins-økt eller spilløkter i Claude-appen på denne maskinen. Bare QA-øktene synes. De andre øktene kjører trolig et annet sted. Jeg har derfor **ikke kunnet kontakte dem**. Eieren må videreformidle punktet under.

**Aktive grener som berører de samme filene (per 4.11.2026):**

| Fil eller mappe | Aktive grener |
|---|---|
| `butikk/` | `nettside/eshop-tom-lommebok` (slått sammen i PR #21) |
| `ecoins/` | Ingen åpne grener utenfor `main` |
| `spill/magiske-egg/` | `fix/magiske-egg-samlebok`, `ui/magiske-egg-trinn2` |
| `spill/dyrepatruljen/` | `fix/dyrepatruljen-fangsthoyde`, `fix/dyrepatruljen-hone`, `ui/dyrepatruljen-trinn2` |
| `spill/morkeskogen/` | `design/morkeskogen-tap-info`, `ui/morkeskogen-trinn2` |
| `spill/fossilspillet/` | `design/fossil-faktaboks`, `ui/fossilspillet-trinn2` |
| `spill/eventyrspill/` | `design/era-basen-rad`, `ui/eventyrspill-trinn2` |

**Regler (forslag):**
1. **Én eier per fil om gangen.** Denne økta skriver bare i `prototype/figurer/`, `kilde/figurer/` og `felles/figurer/`. E-coins-økta eier `ecoins/` og `butikk/`. Hver spilløkt eier sin `spill/<mappe>/`.
2. **Trinn 3 starter først når** E-coins-økta har bekreftet at den ikke har uslåtte endringer i `ecoins/` eller `butikk/`.
3. **Trinn 4–7 starter først når** spillets åpne grener er slått sammen eller avsluttet, og grenen er laget fra ny `main`.
4. Denne økta leverer bare filer i `felles/figurer/` og en kort beskrivelse av grensesnittet (`EVNFigur`). Spilløktene bygger det inn selv.
5. Hvem som er i gang med hva, føres i tabellen under før arbeidet starter.

| Trinn | Økt | Gren | Status |
|---|---|---|---|
| 0–2 | Figur/Blender (denne) | `figur/rev-pilot`, `figur/karakterpilot` | Trinn 0 venter på Even |
| 3 | E-coins | – | Ikke startet |
| 4 | Magiske egg | – | Ikke startet |

---

## 9. Åpne spørsmål

| Spørsmål | Hvem |
|---|---|
| Godkjenner Even revens utseende i `modell.html`? | Even |
| Skal reven ha munn ved jubel? | Even |
| Er det greit at halen stikker ut gjennom kappene, og at ørene stikker gjennom ridderhjelmen? | Even |
| Pris 1 000, lavere pris, eller vente til Mørkeskogen gir E-coins? | Voksen og Even |
| Skal garderoben vise «Du sparer til reven»? | Voksen og Even |
| Felles antrekk for begge figurene, eller eget antrekk per figur? | Even |
