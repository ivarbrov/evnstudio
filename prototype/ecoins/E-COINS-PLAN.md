# E-coins – beslutningsgrunnlag (fase 1–3)

Versjon 0.1 · 3. november 2026 · Status: **forslag, ikke godkjent**
Grunnlag: `main` 4474df5, `morkeskogen-2.0` 2b43319, `robot/felles` 7a836ee. Prototype: «E-shop – prototype · EVN Studio» (claude.ai-artefakt). Modell: `modell.py` → `modell-ut.json` (gren `ecoins/beslutningsgrunnlag`).

Merking: **[FINNES]** = verifisert i koden · **[MULIG]** = teknisk mulig, ikke bygget · **[FORSLAG]** = nytt forslag som krever beslutning.

---

## 1. Slik virker det for spilleren

1. Spilleren klarer noe stort første gang (en verden, en epoke, et nytt dyr). Det kommer en kort melding: «Du fikk 25 E-coins!»
2. Saldoen vises i E-shop på evnstudio.no og som et lite merke i spillenes pausemeny.
3. I E-shop prøver spilleren en hatt eller kappe på roboten og kjøper etter en tydelig bekreftelse.
4. I Garderoben velger spilleren én ting på hodet og én på ryggen. Roboten har dem på i alle spillene.
5. Det samme kan ikke gi E-coins to ganger. Ingen tidsbelønning, daglig innlogging, tilfeldige premier eller ekte penger.

Alt lagres i nettleseren på enheten. Bytter barnet enhet eller nettleser, starter E-coins på nytt der.

## 2. Kartlegging av spillene [FINNES]

| Spill | Teknikk | Progresjon som kan gi milepæler | Egen valuta | Lagring | Robot |
|---|---|---|---|---|---|
| Era Defenders v0.20.0 | 2D canvas, ovenfra | 7 epoker. Portal ved bølge 10. Boss hver 5. bølge. Sluttboss i epoke 7 (`vunnet()`). Bølgene fortsetter i det uendelige, og «Ny runde» starter på epoke 1 igjen | `penger` (💰), kalles «mynter» i tekst. Brukes til 25 bygninger | `evn-eventyrspill-v1`. Lagrer bare **nåværende** epoke og en samlet `bosser`-teller. Ingen høyeste epoke | Spritark 5 retninger × 12 bilder. Tilbehør per epoke legges over automatisk (7 lag) |
| Fossil Zoo v0.7.5 | 2D canvas, fra siden | 3 epoker, 13 dyr, 54 deler. Neste epoke åpnes når alle dyr er vekket | Ingen | `evn-fossilspillet-v04` med `alive[]`, `unlocked[]` og `found[][]`. Migrering fra v03/v05 | Spritark 26 bilder à 128 px. Ingen tilbehørslag |
| Dyrepatruljen v0.10.16 | three.js r128 | 15 spillbare verdener × 10 dyr. Låses opp én om gangen | Ingen | `evn-dyrespillet-v1` = `{v:1, reddet:{verden:[dyr]}}` | GLB innebygd. Hodebein `Head_1` er allerede i bruk |
| Magiske egg v0.8.2 | three.js r128 | 15 arter (sjeldenhet 0–3, Ilddrev = legendarisk), parknivå 1–6. Ikke noe «fullført» | **Mynter 🪙**, tjenes over tid uten tak | `evn-magiske-egg-v1` med `funnet{}`. Parknivået regnes ut | GLB innebygd. Ingen ankerpunkt brukt |
| Mørkeskogen 2.0 (ikke publisert, fase 1) | three.js r187, logikk = 5.6.2 | 17 oppdrag (`hero.qdone`, hvert én gang). Heltenivå 1–10. Beinslottet | Ingen (tre, stein, jern, skinn per runde) | `mork3d.helt` med mer. Testen av gamle lagringer er ikke gjort | GLB-fil. Har allerede capsen som kosmetisk valg (`hero.cap`) |

Viktige funn:
- **Ingen spill lagrer «belønning utbetalt».** E-coins trenger sin egen liste over utbetalte milepæler.
- **Era** har ingen varig «høyeste epoke». Epoker før nåværende epoke og seier kan avledes. Hvilke bosser som er slått kan ikke avledes fra eldre lagring.
- **Magiske egg** har en tidsbasert, ubegrenset valuta med mynt-ikon. E-coins må **aldri** kunne veksles fra den, og må ha et eget ikon.
- **Felles tilbehør finnes allerede:** `felles/robot/tilbehor.js` har 7 hatter og 7 rygg-ting fra Era, festet til hode- og overkroppsbeinet. Det er grunnlaget for butikken.
- Sidefunn: Dyrepatruljen sender ikke `evn-start` (CLAUDE.md krever det). Dette bør sjekkes separat.

## 3. Belønninger per milepæl [FORSLAG]

Hver milepæl har en fast ID og gis én gang. Spillet melder bare **hvilken** milepæl som er nådd. Beløpet står i én felles regeltabell.

| Spill | Milepæler | E-coins | Antall | Maks |
|---|---|---|---:|---:|
| Era Defenders | `era.boss.<1–7>` første boss i epoken | 15 | 7 | 105 |
| | `era.epoke.<1–6>` portalen åpnes (bølge 10) | 40 | 6 | 240 |
| | `era.seier` Tidsherren slått | 150 | 1 | 150 |
| Fossil Zoo | `fossil.dyr.<id>` dyr vekket | 15 | 13 | 195 |
| | `fossil.epoke.<1–3>` alle dyr i epoken | 40 / 40 / 100 | 3 | 180 |
| Dyrepatruljen | `dyrepatruljen.verden.<1–15>` alle 10 dyr reddet | 25 | 15 | 375 |
| | `dyrepatruljen.alle` alle 150 dyr | 100 | 1 | 100 |
| Magiske egg | `egg.art.<id>` første av arten | 8 / 12 / 20 / 40 etter sjeldenhet | 15 | 208 |
| | `egg.park.<2–6>` parknivå | 20 | 5 | 100 |
| | `egg.alle` alle 15 arter | 60 | 1 | 60 |
| Mørkeskogen 2.0 | `mork.oppdrag.<id>` 17 oppdrag | 10–50 | 17 | 380 |
| | `mork.niva.5`, `mork.niva.10` | 20 / 40 | 2 | 60 |

Hele lista med tekst ligger i `modell-ut.json` og i Lommebok-fanen i prototypen.

**Hvordan oppnåelsen bekreftes og dobbeltbelønning hindres**

| Spill | Krok i koden | Avstemming mot lagring (ved oppstart) |
|---|---|---|
| Era | `if (f.boss)` (med `verden`), `portalApen = true`, `vunnet()` | `verden = n` ⇒ epoke 1…n−1. `seiret` eller `runde > 1` ⇒ alt. Boss: bare fra nå av |
| Fossil | `collect()` når dyret blir levende, `levelDone(l)` | `alive[]` og `levelDone()` |
| Dyrepatruljen | `fang()` når `r.length >= 10` | `verdenFerdig(i)` for alle i |
| Magiske egg | `klekk()` med `ny`, `sjekkParkNiva()` | `funnet{}` og `parkNiva()` |
| Mørkeskogen 2.0 | `questAdd()` | `hero.qdone` og `hero.lvl` |

Dobbeltbelønning hindres på to måter. Utbetalingen lagres med milepæl-ID som nøkkel, og en ID som finnes fra før gir ingenting. Avstemmingen ved oppstart gjør at eldre lagring og avbrudd ikke gir tap. Den kan heller ikke gi dobbelt, fordi den bruker samme ID.

## 4. Opptjening per spill (modell)

Minutter er **antakelser** til kalibrering med Evens testing. Det finnes ingen målinger.

| Spill | Maks E-coins | Anslått tid til alt | Tid til første vare (40) |
|---|---:|---:|---:|
| Era Defenders | 495 | ~3 t | ~25 min |
| Fossil Zoo | 375 | ~2 t | ~30 min |
| Dyrepatruljen | 475 | ~3 t | ~25 min |
| Magiske egg | 368 | ~3 t | ~20 min |
| **Publisert i dag (4 spill)** | **1713** | ~11 t | |
| Mørkeskogen 2.0 | 440 | ~4 t | ~45 min |
| **Med Mørkeskogen 2.0** | **2153** | ~15 t | |

Ingen milepæl kan gjentas, så **samlet mengde E-coins har et fast tak** per spillinnhold. Inflasjon i vanlig forstand kan derfor ikke oppstå. Den reelle risikoen er overskudd når spilleren eier alt (se 7).

## 5. Butikkvarer og priser [FORSLAG – Even velger]

Prisene er satt lavere enn eksempeltabellen (50/100/150/250/400). Med de prisene ble butikken 23 % dyrere enn alt som kan tjenes, og en spiller som klarte alt, kunne ikke kjøpe alt. Nytt mål: alt som kan tjenes ≈ 1,1 × butikkverdi.

| Vare | Plass | Pris | Kilde |
|---|---|---:|---|
| Vernehjelm | hode | 40 | Era (fabrikk) |
| Steinalderhette | hode | 40 | Era (stein) |
| Ryggsekk | rygg | 40 | ny |
| Pirathatt | hode | 75 | Era (pirat) |
| Vikinghjelm | hode | 75 | ny |
| Rød kappe | rygg | 75 | Era (oldtid) |
| Svart kappe | rygg | 75 | Era (pirat) |
| Verktøybelte | rygg | 75 | Era (fabrikk) |
| Ridderhjelm | hode | 120 | Era (ridder) |
| Faraokrone | hode | 120 | Era (oldtid) |
| Romhjelm | hode | 120 | Era (rom) |
| Oksygentank | rygg | 120 | Era (rom) |
| Trollmannshatt | hode | 180 | Era (tid) |
| Stjernekappe | rygg | 180 | Era (tid) |
| Gullkrone | hode | 250 | ny |
| **Sum, 15 varer** | | **1585** | 12 finnes, 3 nye |
| *Reserve til Mørkeskogen 2.0:* Cowboyhatt 75, Sheriffkappe 120, Beinkrone 180 | | 375 | nye |

Endringer fra bestillingen, med begrunnelse:
- **Ingen «komplette antrekk» som egne varer.** De krever regler for halvt eide sett og rabatter. To plasser (hode og rygg) gir antrekk av seg selv.
- **Ingen fargeskins eller klær på kroppen.** Even har bestemt at roboten skal være som den er (farge og modell). Det dyreste nivået er derfor en spesiell hatt (Gullkrone), ikke et skin. Klær på kroppen kan vurderes senere og krever Evens valg.
- **Ingen effekter (glød, spor) i v1.** De har en ytelseskostnad i 3D-spillene.

## 6. Simulering av tre spillertyper (4 publiserte spill)

Spillerne tar milepælene i spillrekkefølge. Kjøpene er simulert 2000 ganger med tilfeldig ønskerekkefølge. 60 % sparer til favoritten, og resten kjøper det billigste først.

| | Ny spiller | Vanlig spiller | Svært aktiv |
|---|---|---|---|
| Spiller | Dyrepatruljen og Fossil, litt | 4 spill, 40–60 % | Alt i 4 spill |
| Milepæler | 4 | 33 | 67 |
| Tjent | 80 | 652 | 1713 |
| Anslått tid | ~40 min | ~5 t | ~11 t |
| Varer kjøpt (snitt) | 1,1 av 15 | 7,0 av 15 | 15 av 15 |
| Saldo igjen (snitt, min–maks) | 27 (0–80) | 56 (2–242) | 128 |
| Andel brukt | 66 % | 91 % | 93 % |
| Har fortsatt mål? | Ja, 14 varer | Ja, 8 varer | **Nei**, før nytt innhold |

**Utvidelse:** Når Mørkeskogen 2.0 kommer, gir den 440 nye E-coins. Med reservevarene (375) blir forholdet 2153 / 1960 = 1,10. En svært aktiv spiller får da nye mål. Regel for nye spill og verdener: **ny butikkverdi ≈ nye E-coins ÷ 1,1**, lagt ut samtidig som innholdet.

## 7. Risiko i økonomien

| Risiko | Vurdering | Tiltak |
|---|---|---|
| Inflasjon (mynter uten tak) | Lav. Taket er fast og det finnes ingen farming | Ingen gjentakbare belønninger i v1 |
| Overskudd når alt er eid | Middels for svært aktive spillere (128 igjen, ingen mål) | Nye varer følger nytt innhold (regelen over). Saldoen kan bare spares, og det er greit |
| For dyrt i starten | Lav. Første vare koster 40, nådd etter ~20–30 min | Kalibrer med Evens testing |
| For få attraktive varer | Ukjent. Det må Even avgjøre | Even velger varene. 3 nye modeller og 12 som finnes |
| Forveksling med 🪙 i Magiske egg og 💰 i Era | Høy hvis ikonet ligner | Eget ikon: blå-lilla sekskant med «E» (EVN-farger), aldri gult eller gull |
| Gammel fremgang gir mange E-coins på én gang | Avhenger av valg | Se beslutning V3 |
| Nye regler endrer beløp | Lav | Beløpet låses i lagringen ved utdeling og tas aldri tilbake |

Ingen kunstig pengebruk: ingen avgifter, ingen forfall, ingen daglige belønninger og ingen nedtelling.

## 8. Teknisk arkitektur [FORSLAG]

**Én felles modul:** `felles/ecoins/ecoins.js`, et vanlig skript med samme opprinnelse (tillatt av gjeldende CSP), lastet med `defer` i hvert spill og på butikksiden.

```
EVNEcoins.belonn(id)           // engangsutdeling. Ukjent id eller allerede utbetalt gir ingenting
EVNEcoins.avstem(spill, [ids]) // ved oppstart: utbetaler det lagringen viser er klart, uten melding per milepæl
EVNEcoins.saldo() / eier(vare) / antrekk() / kjop(vare) / taPa(plass, vare)
EVNEcoins.pa('endring', fn)    // også ved endring i en annen fane (storage-hendelsen)
```

**Lagring:** `localStorage['evn-ecoins-v1']`, ett JSON-objekt (under 10 KB):
```
{v:1, regler:1, tjent:{<milepæl>:{e,spill,t}}, kjopt:{<vare>:{pris,t}}, antrekk:{hode,rygg}}
```
- **Saldoen lagres ikke.** Den regnes ut som summen av `tjent` minus summen av `kjopt`. Et kjøp er én skriving av én nøkkel. Saldo og eierskap kan derfor ikke komme ut av takt, og et avbrutt kjøp har enten skjedd helt eller ikke i det hele tatt.
- Modulen leser alltid lagringen på nytt rett før den skriver. Den bruker `navigator.locks` der nettleseren har det, slik at to faner ikke overskriver hverandre.
- **localStorage fremfor IndexedDB:** alle spillene bruker det allerede, datamengden er liten, og et synkront grensesnitt er enklere å gjøre robust.
- Ødelagt data tas vare på som `…-kopi` (som Magiske egg gjør), og spillet går videre.
- «Start på nytt» i et spill sletter **ikke** E-coins. En egen nullstilling med bekreftelse ligger i E-shop.
- **Feiltoleranse:** Laster ikke modulen, gjør ikke spillet noe annet enn før (`window.EVNEcoins?.belonn(…)`). Butikken er aldri nødvendig for å starte et spill.

**Begrensninger, sagt rett ut:**
- Alt er lokalt. Den som kan bruke utviklerverktøy, kan endre saldoen. Det er ingen beskyttelse mot bevisst juks uten en betrodd server. Det er akseptert i v1.
- Safari kan slette lagring fra nettsider som ikke har vært besøkt på en stund. Det gjelder også spillenes egen fremgang i dag. Eksport og import av fremgang kan vurderes senere og bygges ikke nå.

**Standard og personvern:** S2 i EVN Game Standard sier «ingen … kjøp». Det må presiseres til «ingen kjøp med ekte penger» før dette kan publiseres. Det krever voksen godkjenning. Det sendes ingen nye statistikkhendelser i v1. Ingen persondata.

## 9. Skins i 2D og 3D [MULIG]

Tre ting holdes atskilt:

| Hva | Hvor |
|---|---|
| Eierskap (`pirathatt`) | `evn-ecoins-v1.kjopt` |
| Valgt antrekk (`hode: pirathatt`) | `evn-ecoins-v1.antrekk` |
| Utseende per spill | spillets egen tegning, laget fra **én 3D-kilde per vare** |

- **3D-spillene** (Dyrepatruljen, Magiske egg, Mørkeskogen 2.0): felles `tilbehor-3d.js` (videreført fra `tilbehor.js`) fester enkle former til benet `Head`/`Head_1` og `Torso_1`. Prototypen viser at det virker med r128. Mørkeskogen 2.0 bruker r187 med de samme geometriene. Kollisjon er sirkler eller ruter i alle spillene og påvirkes ikke. Fotplasseringen i Dyrepatruljen bruker bare skinnede mesh, så den påvirkes heller ikke. Ytelse: noen hundre trekanter per vare (lavpoly), uten nye teksturer.
- **2D-spillene** (Era, Fossil): `lag-bilder.mjs` tegner et overlegg per vare på samme rutenett som robotarket, slik Era gjør med epokeutstyret i dag. Fossil trenger én ny `drawImage` i `drawPlayer()`. Overleggene lastes først når varen er valgt, fra `felles/ecoins/2d/`, så spillfilene ikke blir tyngre. Mislykkes lastingen, tegnes roboten uten tilbehør.
- **Konflikt i Era:** Epokeutstyret settes automatisk i dag. Se beslutning E2.
- **Konflikt i Mørkeskogen 2.0:** capsen (`hero.cap`) skjules når en E-hatt er på.

## 10. Prototype

Artefakten «E-shop – prototype · EVN Studio» har Butikk, Garderobe og Lommebok, den ekte roboten (GLB, #ffcc00), alt tilbehøret i 3D, bekreftelse før kjøp, meldingen «Du fikk … E-coins!» og et testpanel. Testpanelet kan vise dobbeltbelønning, avbrutt kjøp og de tre spillertypene. Den lagrer ingenting.

Kontrollert i Chromium (headless, SwiftShader) på PC 1280×860 og mobil 390×844: kjøp, saldo, garderobe og dobbeltbelønning virker, og det er ingen konsollfeil. **Ikke testet:** ekte telefon og nettbrett, skjermleser, ytelse.

## 11. Implementeringsplan

| Fase | Innhold | Godkjenning før neste fase |
|---|---|---|
| 1–3 (denne leveransen) | Kartlegging, modell, prototype | Even: varer, ikon, E2. Voksen: modell, arkitektur, V1–V4 |
| 4 Pilot | `ecoins.js` og testsuite (`test/kjor.mjs`: utdeling, dobbel, kjøp, avbrudd, gammel lagring, to faner, modulen mangler). E-shop-siden. **Dyrepatruljen** som pilot: én krok i `fang()`, lagringen er lett å avstemme, 3D med hodebein som allerede er i bruk | Evens spilltest, EVN Game QA (full), voksen |
| 5a | Fossil Zoo: første 2D-spill, overlegg-løypa | Som over |
| 5b | Magiske egg, så Era Defenders (nytt varig felt for epoke og boss) | Som over |
| 5c | Mørkeskogen 2.0 med reservevarene, når 2.0 publiseres | Som over |
| 6 | Samlet regresjon, simulering på nytt med ekte tall, publiseringskontroll | Voksen godkjenner konkret versjon |

Arbeidet gjøres på egne greiner (`ecoins/…`). `main` og publiserte spill endres ikke uten godkjenning. Mørkeskogen 5.6.2 endres ikke.

## Beslutninger

**Even**
- E1: Hvilke varer skal være i butikken, og hva skal de hete? Er det noe han vil legge til?
- E2: Hva gjør roboten i Era Defenders? **A** (anbefalt): det spilleren har valgt, erstatter epokeutstyret, og uten valg brukes epokeutstyret som før. **B**: alltid epokeutstyr i Era. **C**: et valg i Era.
- E3: Ikonet for E-coins (forslag: blå-lilla sekskant med «E»).

**Voksne**
- V1: Økonomimodellen (beløp, priser, regelen ≈ 1,1).
- V2: Arkitekturen (felles modul, lokal lagring, saldo som regnes ut).
- V3: Gammel fremgang. Anbefalt: **ja, med én samlet melding** («Du har allerede klart mye – du får 175 E-coins!»). Alternativet er å telle bare fra lansering.
- V4: Presisering av S2 i standarden (ingen kjøp med ekte penger).
- V5: Pilotspill (anbefalt Dyrepatruljen).
