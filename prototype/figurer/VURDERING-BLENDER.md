# Blender, GLB og Three.js for EVN-figurer: teknisk vurdering og forslag til pilot med reven

Status: **forslag, ikke godkjent** (4.11.2026). Ingen spill, modeller eller sider er endret. Ingenting er publisert.
Even godkjenner figurens utseende. En voksen godkjenner planen og eventuell publisering.

Grunnlag: `origin/main` per 4.11.2026, grenene `robot/felles`, `ecoins/robot-verktoy` og `morkeskogen-2.0`, og ytelsesmålingene i `spill/morkeskogen-2/FASE0.md` og `FASE1.md` på `morkeskogen-2.0`.

---

## 1. Kartlegging: dagens figurer og hvilke spill som kan bruke GLB

### EVN-roboten

| Egenskap | Målt i `helt-robot.glb` |
|---|---|
| Kilde | «RobotExpressive», Tomás Laulhé (Quaternius), endret av Don McCurdy. CC0 1.0. Ikke laget av EVN, ikke endret |
| Størrelse | 464 kB: geometri 282 kB (61 %), JSON 83 kB, animasjoner 94 kB, skjelett 6 kB |
| Geometri | 3 237 trekanter, 7 214 hjørner, 14 mesher med 19 deler (primitiver), uten teksturer |
| Materialer | 3: `Main` (farges #ffcc00 i koden), `Grey`, `Black` |
| Skjelett | 43 ledd (to skins), morfmål i hodet (ansiktsuttrykk) |
| Animasjoner | 14: Dance, Death, Idle, Jump, No, Punch, Running, Sitting, Standing, ThumbsUp, Walking, WalkJump, Wave, Yes |

**Viktig for ytelsen:** 19 deler gir 19 tegnekall per robot, og omtrent like mange til i skyggen. Det er mye for én figur (se punkt 5). Robotens trekanttall er derimot lavt.

### Hvordan spillene bruker figurer i dag

| Spill / side | Teknikk | Roboten | Andre figurer | Kan bruke ekstern GLB? |
|---|---|---|---|---|
| Mørkeskogen 2.0 | three.js r187 | Laster `spill/morkeskogen/modeller/helt-robot.glb` med GLTFLoader | Alle dyr, monstre, troll, heks, cowboyer og tog er bygget i kode (`makeAnimal`, `makeTroll` osv. i `spill.js`). Reven finnes som dyr bygget av kuler | **Ja, allerede i bruk.** Kan også lese innebygd base64 (`EVN_HELT_B64`) i artefaktkopien |
| Dyrepatruljen | three.js r128 | GLB innebygd som base64 i `index.html`, med GLTFLoader | Dyrene bygget i kode (`lagDyr`) | **Ja teknisk** (CSP `connect-src 'self'` tillater filer fra eget domene). Innebygd med vilje, så spillet virker som Claude-artefakt |
| Magiske egg | three.js r128 | Som Dyrepatruljen | Kosedyr og egg bygget i kode | Som Dyrepatruljen |
| E-shop (`butikk/`) | three.js r128 | Laster `ecoins/helt-robot.glb` | – | **Ja, allerede i bruk** |
| Fossil Zoo | 2D canvas | Spritark laget fra GLB-en (`felles/robot/lag-bilder.mjs`) | Tegnet i 2D | **Indirekte**: GLB → bildeverkstedet → spritark |
| Era Defenders | 2D canvas, ovenfra | Spritark i 5 retninger, tilbehør som egne lag | Tegnet i 2D | **Indirekte**, som Fossil Zoo |
| evnstudio.no og startkort | HTML | WebP-bilder laget fra GLB-en | – | Indirekte |

### Funn: samme fil ligger mange steder

Den samme robotfila finnes byte for byte på minst fire steder: `ecoins/helt-robot.glb`, `spill/morkeskogen/modeller/helt-robot.glb`, base64 i Dyrepatruljen og base64 i Magiske egg (pluss `felles/robot/` og to kopier på `morkeskogen-2.0`). I dag holdes de like for hånd. Med flere figurer blir det fort feil. Se punkt 3 og 4.

---

## 2. Forslag til felles EVN-stil for figurer

Utgangspunktet er roboten, fordi Even har valgt den som hovedkarakter (2.11.2026). Nye figurer skal se ut som de hører til samme familie.

### Proporsjoner

| Regel | Forslag | Hvorfor |
|---|---|---|
| Hodestørrelse | Hodet er ca. 1/3 av høyden (2,5–3 hoder høy) | Som roboten. Ansiktet synes på mobil og i 96–128 px spritark |
| Silhuett | Tydelig fra siden og skrått ovenfra, uten tynne detaljer | Era ser figuren ovenfra, Fossil fra siden, startkortet viser den på 40–70 px |
| Lemmer | Korte, tykke armer og bein. Hender som enkle votter | Tåler lav oppløsning og enkel rigg |
| Høyde i spillet | Samme høyde som roboten (Mørkeskogen: ca. 72 enheter etter 90 %) for spillbare figurer | Kamera, kollisjon, dører og hatter er tilpasset den |
| Øyne | Store, mørke, med ett lyst glanspunkt | Vennlig uttrykk for 7–12 år, som roboten |
| Origo | Mellom føttene, ansiktet mot +Z, Y opp, 1 enhet = 1 m i Blender | Samme oppsett som roboten, så spillkoden kan behandle figurene likt |

### Materialer og farger

- **Flate farger, ingen bildetekstur** som hovedregel (som roboten). Flere farger på én figur løses med én liten fargepalett (256 × 256 px PNG) eller med fargeflater per material, ikke med malte teksturer.
- **MeshStandardMaterial**, ruhet 0,6–0,9, metall 0 (bare metalldeler får metall).
- **Hovedfargen skal hete `Main`** i alle figurer, så den kan farges i koden slik roboten farges i dag (`settFarge`). Det gir skins nesten gratis (punkt 6).
- Farger dokumenteres som sRGB-hex i figurens `oppsett.js`, som `felles/robot/robot-oppsett.js`. r128 og r187 håndterer farge ulikt, så omregningen gjøres i koden slik `tilbehor-3d.js` gjør i dag.
- Lys for forhåndsvisning og spritark: samme som roboten (ACES, eksponering 1,0).
- Forslag til reven (Even bestemmer): rødoransje `Main`, hvit mage, snutespiss og haletipp, mørkebrune poter og ørespisser.

### Animasjoner: felles klippnavn

Bruk robotens navn der de finnes, så kode som virker med roboten også virker med nye figurer:

| Klipp | Bruk | Løkke |
|---|---|---|
| `Idle` | Står | Ja |
| `Walking`, `Running` | Gå, løpe | Ja |
| `Jump` | Hopp | Én gang |
| `Punch` | Slag/handling (øks, håv) | Én gang |
| `Wave`, `ThumbsUp`, `Dance` | Startkort, jubel, seier | Ja / én gang |
| `Sneak` (nytt) | Sniking i Dyrepatruljen | Ja |
| `Fall` (nytt, mildt) | Erstatter `Death` for målgruppen: figuren setter seg ned, ikke «dør» | Én gang |

30 bilder/s i Blender, korte løkker (1–2 s). Røttene beveger seg ikke framover i klippene; spillet flytter figuren.

---

## 3. Organisering i GitHub

GitHub Pages publiserer alt som ligger på `main` direkte på evnstudio.no (det finnes ingen byggetrinn, `.nojekyll`). Kildefiler fra Blender bør derfor ikke ligge ved siden av spillfilene. Forslag:

```
kilde/figurer/                    ← arbeidsfiler, aldri lastet av spill
  rev/rev.blend                   ← Git LFS
  rev/referanse/                  ← Evens tegninger, skisser
  robot/                          ← tom til vi eventuelt endrer roboten
felles/figurer/                   ← det spillene bruker (vanlig git)
  rev/rev.glb                     ← den ene, kanoniske eksporten med alle klipp
  rev/oppsett.js                  ← farger, høyde, feste-punkter, lisens
  rev/LISENS.md
  robot/robot.glb                 ← senere: den ene robotfila (i dag 4+ kopier)
verktoy/figurer/
  eksporter.py                    ← Blender i bakgrunnen: .blend → .glb med faste innstillinger
  sjekk-glb.mjs                   ← måler fila mot budsjettet i punkt 5
  lag-variant.mjs                 ← lager spillvarianter (færre klipp, base64) fra den kanoniske fila
```

**Regler:**
1. **Én kanonisk GLB per figur.** Spillspesifikke varianter (for eksempel bare 5 klipp, eller base64 innebygd i Dyrepatruljen) lages av `lag-variant.mjs`, aldri for hånd.
2. **Variantene sjekkes automatisk.** En test i `test/kjor.mjs` kan kontrollere at innebygde kopier stemmer med den kanoniske fila (hash). Det er et forslag; testen er ikke laget.
3. **`.blend` i Git LFS** (`kilde/**/*.blend filter=lfs diff=lfs merge=lfs -text` i `.gitattributes`). Pages serverer ikke LFS-innhold, bare en liten pekerfil, så kildene havner ikke på nettsiden. GLB-filer skal **ikke** i LFS, ellers får spillene pekerfila i stedet for modellen. Git LFS 3.7.1 er installert på denne maskinen. Gratiskvoten hos GitHub er begrenset; lavpolyfigurer er små (anslått under 5 MB per `.blend`), så det holder lenge.
   Alternativ: egen privat repo for kildefiler. Bedre hvis kildene ikke skal være offentlige, men gir to steder å holde orden på. Avgjøres av en voksen. Repoet er trolig offentlig (Pages på gratiskonto krever det), så `.blend` i LFS blir også lesbar på GitHub.
4. **Lisens per figur** i `LISENS.md`, som `spill/morkeskogen/LISENSER.md`. Egen modell: EVN Studio. Bygget på CC0-grunnlag: navn på opphav.
5. Endringer i en figur følger samme vei som spill: egen gren, QA, Evens godkjenning av utseendet, voksen godkjenning før publisering.

---

## 4. Samme figur i flere spill uten dobbeltarbeid

| Lag | Felles | Spillspesifikt |
|---|---|---|
| Modell og skjelett | `rev.glb`, én fil | Ingenting |
| Animasjoner | Alle klipp ligger i den kanoniske fila, med felles navn | Hvilke klipp spillet tar med (variantskriptet) |
| Farge og skins | `Main`-materialet farges i koden | Spillet velger farge |
| Tilbehør | Feste-punkter i modellen, varene fra `tilbehor-3d.js` | – |
| Størrelse og fart | Høyde i `oppsett.js` | Spillet skalerer (Mørkeskogen 90 %) |
| 2D-spill | Bildeverkstedet (`felles/robot/lag-bilder.mjs`) utvides til å ta inn hvilken som helst figur | Kameravinkel og bildestørrelse per spill (finnes allerede) |
| Våpen/håv | Feste-punkt i hånda (`Palm2.R` hos roboten, `EVN_hand_H` hos nye) | Selve våpenet |

**Det som ikke kan deles:** Animasjoner kan ikke flyttes direkte mellom roboten og reven, fordi skjelettene er ulike. Det er derfor de felles klippnavnene er viktige: spillkoden spør etter `Walking`, og hver figur har sin egen versjon.

**Avgjørende valg for gjenbruk:** Skal reven gå på **to bein** (som roboten) eller **fire**?
- **To bein:** Kan bruke samme styring, kamera, håv/øks i hånda og de fleste hattene. Nesten fri gjenbruk i alle spill der roboten er helt. Anbefales for en spillbar figur.
- **Fire bein:** Mer naturlig rev, men trenger egne animasjoner, eget grep for redskaper og egen plassering av hatter, og passer dårlig i spill der helten bærer ting.

Dette er Evens valg.

---

## 5. Tekniske budsjetter

### Hva vi faktisk har målt

All måling på ekte mobil er fra **én iPhone (iOS 18.7, Claude-appen, DPR 1,5)** i Mørkeskogen 2.0. Android, eldre telefoner og PC er ikke målt. Referansemobil for Y1 er ikke valgt.

| Situasjon | FPS | 1 % lav | Tegnekall | Trekanter |
|---|---|---|---|---|
| Prototype, dag ved bålet (v2, 1 min) | 55,4 | 33,3 | 138 | 0,51 M |
| Prototype, natt med 3 monstre | 45,8 | 32,3 | 140 | 0,48 M |
| Prototype, varmetest 10 min | 55,6 (svakeste minutt 51,5) | 37,0 | ca. 140 | ca. 0,5 M |
| Spillet, Kaktusbyen (før uskarphet ble fjernet) | 29 | – | 709 | – |
| Spillet, ryggsekkmenyen (før uskarphet ble fjernet) | 14 | – | 694 | – |

**Hva tallene sier:** Med ca. 140 tegnekall og en halv million trekanter holder iPhonen kravet (≥ 30 FPS). Med ca. 700 tegnekall gjør den det ikke. Tallene viser altså at **antall tegnekall** betyr mer enn antall trekanter. Målingene ved 700 tegnekall er gjort mens uskarphet over WebGL fortsatt var på. Derfor er sammenhengen sannsynlig, men ikke bevist.

### Forslag til budsjett per figur (foreløpig)

Budsjettene er laget ut fra målingene over. De må prøves på nytt når en referansemobil er valgt, og er **ikke** godkjenningskrav.

| | Spillbar figur | Figur som går igjen mange ganger (dyr i dyreparken, fiender) | Robot i dag |
|---|---|---|---|
| Tegnekall per figur (uten skygge) | **≤ 3** (inkludert 2 tilbehør: ≤ 5) | **1** | 19 |
| Trekanter | 3 000–8 000 | ≤ 1 500, med enklere utgave på avstand | 3 237 |
| Materialer | ≤ 3 | 1 | 3 |
| Ledd | ≤ 40 | ≤ 20 | 43 |
| Teksturer | Ingen, eller én palett 256 × 256 PNG | Ingen | Ingen |
| Animasjoner | ≤ 12 klipp, ≤ 120 kB | ≤ 4 klipp | 14 klipp, 94 kB |
| GLB-fil | ≤ 250 kB (≤ 330 kB som base64) | ≤ 80 kB | 464 kB |
| Morfmål (ansikt) | Valgfritt, ≤ 4 | Nei | Ja, i hodet |

**Hele scenen på mobil:** ≤ 200 tegnekall som foreløpig tak, figurene til sammen ≤ 15 % av det.

### Hvordan vi når budsjettet

- **Slå sammen delene i Blender** til én mesh per material før eksport. Det er det største enkelttiltaket (roboten: 19 → 3 tegnekall ville vært mulig, men roboten skal ikke endres nå).
- **`KHR_mesh_quantization`** (lagrer posisjoner med færre bytes). GLTFLoader i både r128 (`ecoins/gltfloader-r128.js`) og r187 støtter det uten ekstra dekoder. Kan trolig halvere geometridelen. Må bekreftes i piloten.
- **Ikke Draco, Meshopt eller KTX2 i første omgang.** De trenger en dekoder, og dekoderne bruker WebAssembly. Dagens CSP tillater ikke det (`'wasm-unsafe-eval'` mangler), og en endring krever voksen godkjenning (S1). Gevinsten er liten for lavpolyfigurer.
- **Mange like figurer** (Dyrepatruljen har 150 dyr i parken, et kjent ytelsesrisiko): enklere modell på avstand og deling av geometri og materiale.

---

## 6. Klær og skins fra E-coins-garderoben

### Slik virker det i dag

`ecoins/ecoins.js` har 15 varer på to plasser: `hode` og `rygg`. `ecoins/tilbehor-3d.js` bygger hver vare av enkle former i kode og fester den til robotens ledd `Head` og `Torso`. Størrelsen regnes ut fra robotens hodemesh `Head_3`. Det er bare pynt og påvirker ikke kollisjon, fart eller animasjon. 2D-spillene får ferdige overlegg i `ecoins/2d/`.

**Begrensning:** Koden er laget for roboten. Den leter etter navnene `Head`, `Torso` og `Head_3`. En rev har andre ledd og et hode med ører og snute.

### Forslag

1. **Feste-punkter i modellen.** Hver figur får tomme punkter i Blender, festet til riktig ledd: `EVN_hode`, `EVN_rygg`, `EVN_hand_H`, `EVN_hand_V`. De eksporteres med i GLB-en. Punktet viser hvor og hvor stort tilbehøret skal være (skalaen på punktet = hodebredden). Da passer samme hatt på roboten og reven uten egen kode per figur.
2. **Samme varer og samme lagring.** Vare-ID-ene, plassene og lagringen `evn-ecoins-v1` er uendret. En hatt som er kjøpt, kan brukes av alle figurer.
3. **Når noe ikke passer** (revens ører under en ridderhjelm): `oppsett.js` for reven kan si at ørene skjules eller at en vare har en egen revevariant. Varer som ikke kan løses, vises som «passer ikke på reven» i garderoben i stedet for å se feil ut.
4. **Skins = farger.** Fordi hovedfargen heter `Main`, kan et skin være en ny farge (for eksempel polarrev) uten ny modell. Det koster ingen ekstra tegnekall eller filstørrelse. Det må bestemmes for seg om skins skal selges for E-coins.
5. **Klær som bøyer seg med kroppen** (jakke, bukse) krever samme skjelett og vekting som figuren, og må lages i Blender per figur. Anbefales ikke nå. Stive ting på feste-punkter dekker hatter, hjelmer, sekker, kapper og belter.
6. **Tilbehøret kan fortsatt lages i kode.** Formene i `tilbehor-3d.js` virker fint og er små. Blender trengs bare for tilbehør med myke former. Endringen i `tilbehor-3d.js` som trengs for feste-punkter, er et eget forslag til senere og er ikke gjort.

---

## 7. Blender + GLB sammenlignet med figurer bygget i Three.js-kode

| | Figurer bygget i kode (i dag for dyr og monstre) | Blender → GLB |
|---|---|---|
| Former | Kuler, bokser og sylindre. Bra for kantete ting, dårlig for myke dyr | Alle former |
| Animasjon | Deler som dreies hver for seg. Ingen huddeformasjon | Skjelett med myk deformasjon, ansiktsuttrykk |
| Even kan være med | Bare ved å be om endringer | Kan selv flytte, farge og prøve i Blender (med hjelp) |
| Gjenbruk | Hvert spill har sin egen kode for dyr (`makeAnimal`, `lagDyr`, `lagKoseDyr`) | Én fil i alle spill og i 2D-bildene |
| Endringer med Claude Code | Enkelt: tekst som kan leses, sammenlignes og testes | `.blend` er binær og kan ikke leses i en diff. Claude kan likevel kjøre Blender med Python-skript i bakgrunnen og lage forhåndsbilder, men forming «for hånd» gjør et menneske bedre |
| Filstørrelse | Svært liten | 50–250 kB per figur |
| Verktøy | Ingen | Blender må installeres (ikke installert på denne maskinen nå) |
| Artefakt-kompatibilitet | Alltid | Krever base64-variant (finnes i dag for roboten) |

**Anbefaling:** Bruk begge. Blender for figurer som betyr noe for spilleren (spillbare figurer, viktige personer, dyr som skal se levende ut). Kode for terreng, bygninger, enkle ting og tilbehør. Ikke bygg om eksisterende dyr eller monstre uten et eget vedtak.

---

## 8. Godot og Unreal Engine

Status er per kjent informasjon høsten 2026 og bør sjekkes på nytt før et eventuelt vedtak.

| | Godot 4 | Unreal Engine 5 |
|---|---|---|
| Nettleser | Kan eksportere til web (WebGL 2, egen motor i WebAssembly) | Ingen offisiell webeksport siden UE 4.24. Bare strømming fra egne servere (Pixel Streaming) |
| Nedlasting | Motoren alene er flere MB komprimert, før spillet starter. Dagens spill er 0,2–2,5 MB i alt (Mørkeskogen størst, med three.js) | – |
| CSP og nettsted | Krever `'wasm-unsafe-eval'` (voksen godkjenning, S1). Tråder krever spesielle HTTP-hoder som GitHub Pages ikke kan sette; Godot kan eksportere uten tråder, med svakere lyd og ytelse | Strømming krever servere, koster per spiller og sender video og input over nett (S2) |
| Felles EVN-kode | `statistikk.js`, felles pause, E-coins og startkort må bygges på nytt eller kobles via JavaScript | Samme, verre |
| Claude-artefakter | Virker trolig ikke | Nei |
| Fordeler | God editor for baner og animasjon. Leser glTF direkte | Høy grafikk på PC og konsoll |

**Vurdering:** Ingen av dem gir en konkret fordel så lenge nettleseren på mobil er hovedplattformen. Godot kan bli aktuelt hvis EVN Studio senere lager et spill som app eller for PC. Fordi glTF er standardformatet, kan figurene fra Blender tas med til Godot uten å lages på nytt. Valget av Blender og GLB låser oss altså ikke.

---

## 9. KI-verktøy for skisser: ForgeGUI

Lagt til 4.11.2026 etter ønske fra eieren. ForgeGUI er **ikke prøvd**. Vurderingen bygger på produktets nettside (forgegui.com) og omtaler på nett. En av omtalene er skrevet av en konkurrent (Nilo).

**Hva det er:** En lukket nettjeneste som lager spillgrafikk fra tekst eller referansebilder. Den er sterkest på 2D (ikoner, knapper, grensesnitt). For 3D lager den et bilde, bygger en modell av det og leverer en GLB med tekstur. Gratisnivå med kreditter, ellers betalte planer. Ingen spillmotor og ingen del av Blender.

| | Vurdering |
|---|---|
| Raske utkast | Kan gi mange forslag til hvordan reven kan se ut, som Even kan velge mellom |
| Ikoner til E-shop | Mulig, men E-shop har i dag ikoner laget fra de samme 3D-formene som tilbehøret. Det bør ikke blandes uten vedtak |
| Skjelett og animasjon | Ikke nevnt av leverandøren. Slike modeller har normalt rotete former og må bygges på nytt i Blender før de kan animeres |
| EVN-stilen | Leverer malte teksturer, mens EVN-stilen er flate farger (punkt 2) |
| Budsjettet | Trekanttall og teksturstørrelse er ikke oppgitt. Må måles med `sjekk-glb.mjs` |
| Personvern | Det som lages på gratisnivået, kan bli lagt ut i en offentlig samling. Evens idé kan bli synlig før han har godkjent den. Betalte planer er private som standard. Bruk av opplastede bilder og aldersgrense er ikke lest i vilkårene |
| Konto | Krever konto. En voksen må opprette og styre den |
| Rettigheter | Leverandøren sier at resultatet er brukerens og kan brukes kommersielt. En omtale nevner en påstand om at et eksempelbilde lignet mye på et eksisterende spill. Opphavet er altså ikke sikkert |

**Vurdering:** Kan brukes til **skisser og forslag**, på linje med Evens tegninger, men ikke som kilde til ferdige figurer i spillene. Den ferdige reven lages i Blender etter EVN-stilen og budsjettet. Hvis ForgeGUI prøves, har en voksen kontoen og bruker en privat plan, og utkastene lagres i `kilde/figurer/rev/referanse/` og ikke i `felles/`.

---

## 10. Forslag til pilot: reven

**Mål:** Finne ut om arbeidsflyten Blender → GLB → Three.js virker for EVN, med én figur, uten å røre noe spill.

**Utenfor piloten:** Roboten, spillene, `tilbehor-3d.js`, `ecoins.js`, forsiden og publisering.

### Beslutninger før start

| Hva | Hvem |
|---|---|
| Reven på to eller fire bein | Even |
| Bygge fra bunnen eller starte fra en CC0-modell (Quaternius, som roboten, har dyrepakker med rev; lisens og innhold sjekkes per fil) | Even og en voksen |
| Installere Blender (gratis, åpen kildekode) på maskinen | En voksen |
| `.blend` i Git LFS i samme repo, eller egen privat repo | En voksen |
| Hvem som former reven i Blender (Even med hjelp, en voksen, eller Claude med skript) | Even og en voksen |
| Om ForgeGUI skal prøves til utkast (trinn 2a), med hvilken plan og hvem som har kontoen | En voksen |

### Trinn

| # | Trinn | Resultat | Godkjennes av |
|---|---|---|---|
| 1 | Egen gren `figur/rev-pilot`. Oppsett av mappene i punkt 3, `eksporter.py` og `sjekk-glb.mjs` | Tom struktur og verktøy som virker | – |
| 2a | Valgfritt: 4–6 utkast fra ForgeGUI (eller Evens tegninger) som Even velger mellom. Én utkast-GLB måles med `sjekk-glb.mjs` for å se hvor langt den er fra budsjettet | Utkast og måling i `kilde/figurer/rev/referanse/` | **Even: retning** |
| 2 | Grovmodell i Blender (form og farger, ingen rigg). Bilder forfra, fra siden, skrått ovenfra, ved siden av roboten, og i 128, 96 og 50 px | Bildeark | **Even: utseende** |
| 3 | Rettinger etter Evens tilbakemelding, til Even er fornøyd | Godkjent form | **Even** |
| 4 | Rigg, feste-punkter og 5 klipp: `Idle`, `Walking`, `Running`, `Jump`, `Wave` | `felles/figurer/rev/rev.glb` | – |
| 5 | Testside `prototype/figurer/rev.html` (ikke lenket fra noe): reven i r128 og r187 med samme fil, roboten ved siden av, to hatter og en kappe fra garderoben, fargebytte, teller for tegnekall | Side som kan åpnes lokalt | – |
| 6 | Spritark med bildeverkstedet, for å vise at 2D-spillene kan få reven | Prøveark | Even ser |
| 7 | Måling på Evens iPhone (samme måte som FASE0): 1, 10 og 50 rever mot like mange roboter | Tabell med FPS og tegnekall | – |
| 8 | EVN Game QA (liten kontroll, ingen spill er endret) og rapport | Rapport i `qa/rapporter/` | – |
| 9 | Oppsummering og forslag om reven skal inn i et spill, og hvilket | Beslutningsgrunnlag | **Even og en voksen** |

### Slik vet vi om piloten lyktes

- Even har godkjent hvordan reven ser ut.
- Samme `rev.glb` virker uendret i r128 og r187.
- Fila holder budsjettet: ≤ 250 kB, ≤ 3 tegnekall, ≤ 40 ledd.
- Minst to av garderobens hatter og én ryggting sitter riktig, uten egen kode for reven.
- 50 rever er ikke tregere enn 50 roboter på iPhonen.
- Eksporten kan gjentas med ett skript og gir samme fil.

Hvis én av disse ikke holder, skriver vi hvorfor og foreslår å justere eller stoppe. Det er et gyldig resultat.

---

## Åpne spørsmål og forbehold

- **Referansemobil (Y1) er ikke valgt.** Budsjettene bygger på én iPhone.
- **Roboten skal ikke endres nå.** At den bruker 19 tegnekall, er bare notert. En retting ville vært et eget forslag med egen godkjenning.
- **Mørkeskogens `LISENSER.md`** kaller roboten «midlertidig helt – byttes ut med endelig helt», mens `felles/robot/README.md` sier at Even har valgt den som hovedkarakter. Teksten i `LISENSER.md` bør oppdateres en gang.
- ForgeGUI er ikke prøvd. Vilkår, personvernerklæring og aldersgrense er ikke lest.
- `KHR_mesh_quantization`, størrelsen på Godots webeksport og status for Unreal er ikke prøvd her. De er vurdert ut fra dokumentasjon og koden i repoet.
