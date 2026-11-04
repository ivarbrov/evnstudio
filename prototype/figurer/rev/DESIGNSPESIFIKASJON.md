# EVN-reven: visuell designspesifikasjon

Status: **utkast til Even** (4.11.2026). **Hovedretning valgt 4.11.2026: reven går oppreist på to bein. Even har valgt forslag 2 «Nysgjerrig».**

## Vedtak 4.11.2026

- Reven «Nysgjerrig» blir EVN Studios første alternative spillbare karakter. Roboten er fortsatt gratis standard.
- Reven kan kjøpes i E-shop for **700 E-coins** (vedtak 5.11.2026, før 1 000), én gang, og eies for alltid. Kontrollert mot opptjeningen i `../TEKNISK-PLAN.md`, punkt 4.
- Reven er bygget i Blender (`rev.glb`, laget av `verktoy/figurer/bygg_rev.py` fra godkjenningsmodellen) og følger `../KARAKTERSTANDARD.md`. Hovedmaterialet heter `Pels`.
- Spilleren velger mellom roboten og reven i en felles karaktervelger i garderoben. Valget gjelder i alle spill som støtter karakterbytte.
- Samme spillmessige egenskaper som roboten (fart, kollisjon, skade, rekkevidde). Byttet endrer bare utseende og nødvendige animasjoner.
- Roboten, saldoen, kjøpte varer og lagrede spill skal ikke påvirkes.
- Raffinert modell til godkjenning: `modell.html`. Teknisk plan: `../TEKNISK-PLAN.md`. Ingenting er modellert, generert eller lagt inn i spill.
Even velger og godkjenner designet. Punkter merket **☐ Even velger** er åpne valg.
Hører til `../VURDERING-BLENDER.md` (pilot med reven, trinn 2a–3).

---

## 1. Grunnlag: slik er EVN-roboten bygget

Målt i `ecoins/helt-robot.glb` (hvilestilling, alle mål som andel av robotens høyde H):

| Del | Robot | Hva det betyr |
|---|---|---|
| Hode | 0,61–1,00 H (39 %), 0,59 H bredt | Svært stort hode: ca. 2,5 hoder høy. Hodet er bredere enn kroppen |
| Ansiktsflate (svart) | 0,72–0,96 H, 0,50 H bred | Øynene fyller nesten hele hodet i bredden |
| Overkropp | 0,29–0,65 H, 0,34 H bred | Kort og kantete |
| Bein | 0–0,32 H | Korte bein, ca. en tredjedel av høyden |
| Armer | tynne (0,05–0,10 H) med store hender | Tynne ledd, store «ender» |
| Føtter | store, grå støvler | Står stødig, synes godt |

**Utseende** (startkortbildene i `bilder/robot-start-*.webp`):
- Fasettert lavpoly med flat skyggelegging. Flatene synes, ingen glatte overganger.
- Tre farger: signaturfargen gul `#ffcc00` (`Main`), nøytral grå (`Grey`) og nesten svart (`Black`).
- Store, runde, mørke øyne og tykke mørke øyenbryn. Uttrykket kommer fra bryn, øyne og kropp. Roboten har ingen munn.
- Små detaljer som forteller hva den er: grått bånd med nagler rundt hodet, grå ledd.
- Vennlig og modig, aldri skummel.

---

## 2. EVN-figurenes felles kjennetegn (foreløpig)

Jeg har ikke funnet et eget dokument som heter «EVN Game Design DNA» i repoet, på grenene eller i de lokale arbeidsmappene. Listen under er derfor **utledet** av roboten, standarden og vedtakene, og må godkjennes før den gjelder. Finnes det et slikt dokument, skal denne spesifikasjonen kontrolleres mot det.

| # | Kjennetegn | Regel for nye figurer |
|---|---|---|
| D1 | **Stort hode, store øyne** | Hodet er 35–42 % av høyden. Øynene er det første man ser |
| D2 | **Fasettert lavpoly** | Flat skyggelegging, synlige flater, ingen malte teksturer |
| D3 | **Få farger** | Én signaturfarge (`Main`) + én lys eller nøytral + én mørk. Høyst 3 materialer |
| D4 | **Tynne ledd, store ender** | Hender og føtter er store og enkle. De kan holde håv og øks |
| D5 | **Lesbar på 50 px** | Silhuetten er gjenkjennelig på startkortet (40–70 px) og i spritark (96–128 px) |
| D6 | **Vennlig og modig** | Ingen skarpe tenner, klør eller sinte øyne. Passer for 7-åringer (B4) |
| D7 | **Uttrykk med bryn og kropp** | Følelser vises med bryn, øyne, ører og holdning |
| D8 | **Ett EVN-kjennetegn** | Noe i robotgul `#ffcc00` som knytter figuren til roboten og EVN Studio |
| D9 | **Samme høyde og grunnstilling** | Spillbare figurer er like høye som roboten, står med origo mellom føttene og ser mot +Z |
| D10 | **Garderobe-klar** | Har feste-punktene `EVN_hode`, `EVN_rygg`, `EVN_hand_H`, `EVN_hand_V` |

---

## 3. Reven

### Personlighet

Nysgjerrig, rask og lur, men snill. Liker å snike og finne ting. Robotens kamerat, ikke en kopi av den.
**☐ Even velger:** Navn på reven. Er reven gutt, jente eller ingen av delene?

### Kropp og proporsjoner (forslag)

Mål som andel av robotens høyde H. Reven skal være like høy som roboten uten ører.

| Del | Mål | Begrunnelse |
|---|---|---|
| Høyde uten ører | 1,00 H | D9: samme kamera, kollisjon og dører som roboten |
| Ører | rager 0,10–0,14 H over hodet | Revens viktigste kjennetegn i silhuetten. Holdes korte nok til at hatter og dører virker |
| Hode | 0,60–1,00 H (ca. 40 %), 0,50–0,55 H bredt | D1. Litt smalere enn roboten, men fortsatt stort |
| Snute | 0,12–0,16 H lang, butt spiss | Kort snute er søtere og lettere å lese forfra |
| Øyne | store, runde, mørke, med ett hvitt glanspunkt | D1. Samme familie som robotens øyne, men mer levende |
| Bryn | tykke, mørke, som roboten | D7 og familielikhet |
| Overkropp | 0,28–0,60 H, 0,30–0,34 H bred, litt pæreform | Som roboten, men mykere |
| Bein | 0–0,30 H, korte | D9 og samme stegtakt som roboten |
| Hender | store votteformede poter | D4. Kan holde håv, øks og bue |
| Føtter | store mørke poter | D4. Står stødig |
| Hale | stor og busket, ca. 0,5 H lang, hvit spiss | Revens andre kjennetegn. Synes fra alle vinkler |

**Valgt 4.11.2026: to bein.** Reven er oppreist, passer visuelt sammen med roboten og har tydelige revekjennetegn: store ører, kort snute, poter og busket hale.

### Rolle i spillene

- Reven er en **alternativ spillbar figur**, ikke en erstatning for roboten.
- Den har **samme spillmessige egenskaper som roboten**: samme høyde, kollisjon, fart, hopp, liv og bruk av utstyr. Valg av figur er bare utseende.
- Den skal kunne gå, løpe, hoppe og bruke utstyr (øks, håv, bue) med potene.
- **Kan senere låses opp med E-coins.** I dag har `ecoins/ecoins.js` bare varer for `hode` og `rygg`. En figur som kan låses opp, krever en ny type vare og et eget vedtak. Ingenting er endret.

### Animasjonssystem: gjenbruk og egne klipp

- Reven får **samme leddnavn som roboten** for kropp, armer og bein (`Hips`, `Abdomen`, `Torso`, `Neck`, `Head`, `UpperArm.L/R`, `LowerArm.L/R`, `Palm2.L/R`, `UpperLeg.L/R`, `LowerLeg.L/R`, `Foot.L/R`). Da kan spillkoden bruke samme `AnimationMixer`-oppsett og samme klippnavn, og robotens klipp kan prøves direkte på reven.
- Robotens klipp vil trolig ikke passe helt, fordi lemmene har andre lengder. De overføres og rettes i Blender, eller lages på nytt med samme navn.
- Ekstra ledd for hale (3–4) og ører (1 hver) har **egne reveklipp** som spilles oppå (for eksempel halevifting i `Idle`). Spill som ikke kjenner dem, virker likevel.
- Våpengrep og tilbehør følger samme feste-punkter som roboten (`Palm2.R` / `EVN_hand_H`, `EVN_hode`, `EVN_rygg`).

### Farger (tre materialer)

| Material | Bruk | Forslag |
|---|---|---|
| `Main` | Kropp, hode, hale | **☐ Even velger** mellom A «klassisk rev» `#e8742a`, B «lys rev» `#f39a3c` og C «dyp rev» `#c9552a`, som han valgte robotgult mellom A, B og C |
| `Lys` | Mage, snute, haletipp, innsiden av ørene | `#f3eadb` (samme kremhvit som i tilbehøret) |
| `Mork` | Poter, ørespisser, nese, bryn og øyne | `#2a1f1b` (nesten svart brun). Øynene får hvitt glanspunkt i `Lys` |

Alle materialer: MeshStandardMaterial, ruhet 0,8, metall 0, flat skyggelegging, ingen tekstur.

### EVN-kjennetegn (D8)

Forslag: et **skjerf eller halsbånd i robotgult `#ffcc00`**. Det knytter reven til roboten, og det skiller den spillbare reven fra de ville revene som allerede finnes i Mørkeskogen (oransje dyr bygget i kode).
**☐ Even velger:** skjerf, halsbånd, armbånd eller noe annet. Kjennetegnet skal ikke dekke feste-punktet på ryggen.

### Uttrykk

| Uttrykk | Bryn | Øyne | Ører | Hale |
|---|---|---|---|---|
| Glad (standard) | rolige | åpne | oppe | rolig vifting |
| Nysgjerrig | ett bryn opp | store | fram | stille |
| Konsentrert (snike) | ned | halvt lukket | bakover | lavt |
| Jubel | høyt | lukket i smil | oppe | stor vifting |
| Litt lei seg (`Fall`) | skrått | ned | ned | henger |

Løses med ledd i bryn, ører og hale. Eventuelt 3–4 morfmål i ansiktet (budsjettet tillater ≤ 4).
**☐ Even velger:** Skal reven ha munn som kan smile, eller bare uttrykk med bryn og øyne som roboten?

---

## 4. Bevegelse

Samme klippnavn som roboten (se vurderingen, punkt 2), så spillkoden kan bytte figur.

| Klipp | Revens særpreg |
|---|---|
| `Idle` | Halen vifter sakte, ørene rykker av og til |
| `Walking` | Lett og fjærende, halen svinger motsatt av hoftene |
| `Running` | Lener seg fram, halen strekkes bak |
| `Jump` | Spenstig, ørene bakover i lufta |
| `Punch` | Kort, rask handling med potene |
| `Wave` | Vinker med én pote, halen vifter |
| `Sneak` | På tå, lav, ører bakover. Revens «egen» bevegelse |
| `Fall` | Setter seg ned med ørene ned, aldri voldsomt (D6) |

30 bilder/s, løkker på 1–2 s. Halen har 3–4 ledd, hvert øre 1 ledd. Hele skjelettet ≤ 40 ledd.

---

## 5. Garderoben

Samme varer som roboten (`ecoins/ecoins.js`). Feste-punktet `EVN_hode` sitter **mellom ørene**, og skalaen på punktet er revens hodebredde.

| Varer | Forslag for reven |
|---|---|
| Faraokrone, gullkrone, trollmannshatt, pirathatt, steinhette | Sitter mellom ørene. Ørene synes |
| Vernehjelm, vikinghjelm, ridderhjelm | Dekker hodet. Ørene bøyes bakover under hjelmen eller stikker ut gjennom hull |
| Romhjelm | Ørene er inne i boblen. Boblen blir litt høyere |
| Ryggsekk, oksygentank | Sitter over halen |
| Rød kappe, svart kappe, stjernekappe | Kortere kappe, eller halen stikker ut under. Kappen må ikke dekke halen helt |
| Verktøybelte | I livet. Halen kommer ut under beltet |

Dette prøves i piloten (trinn 5). Varer som ikke kan løses pent, vises som «passer ikke på reven».
**☐ Even velger:** Er det greit at ørene bøyes eller skjules under noen hjelmer?

---

## 6. Tekniske rammer

Fra vurderingen, punkt 5 (foreløpige budsjetter):
- 2 500–5 000 trekanter, én mesh per material: 3 materialer gir 3 tegnekall. Det gule kjennetegnet (D8) er et eget lite material og regnes som tilbehør (budsjettet: ≤ 3 for figuren, ≤ 5 med tilbehør)
- ≤ 40 ledd, ingen teksturer, GLB ≤ 250 kB
- Origo mellom føttene, ansiktet mot +Z, Y opp, 1 enhet = 1 m

---

## 7. Slik prøves designet før Even godkjenner

| Prøve | Hva vi ser etter |
|---|---|
| Silhuett i svart på 50, 96 og 128 px | Gjenkjennes reven uten farger? (D5) |
| Gråtoner | Skiller kropp, mage og poter seg uten farge? (T4) |
| Ved siden av roboten, samme lys (`robot-oppsett.js`) | Hører de til samme familie? Er høyden lik? |
| Mot bakgrunnene i Mørkeskogen, Dyrepatruljen, Fossil Zoo og Era Defenders | Synes reven på grønn skog, sand og mørke huler? |
| Ved siden av en vill rev fra Mørkeskogen | Ser man med en gang hvilken som er spilleren? |
| Med to hatter og en kappe | Sitter tilbehøret pent? |

---

## 8. Hvor utkast og filer lagres

| Hva | Hvor |
|---|---|
| Evens tegninger | `kilde/figurer/rev/referanse/even/` |
| KI-utkast (bare etter at vilkår, rettigheter, personvern og kostnader er kontrollert) | `kilde/figurer/rev/referanse/ki/` |
| Blender-fila | `kilde/figurer/rev/rev.blend` |
| Ferdig figur som spillene kan bruke | `felles/figurer/rev/rev.glb`, bare etter Evens godkjenning |

KI-utkast flyttes aldri direkte til `felles/`.

---

## 9. Skisser

`skisser.html` viser tre forslag på to bein ved siden av den ekte robotmodellen, med visning forfra, skrått, fra siden, bakfra, ovenfra, silhuett, gråtoner, liten størrelse og fargevarianter (A, B, C, polarrev, sølvrev). Revene er grove skisser av enkle former, ikke spillmodeller. Faste bilder ligger i `skisser/`.

| | Forslag 1 «Klassisk» | Forslag 2 «Nysgjerrig» | Forslag 3 «Modig» |
|---|---|---|---|
| Farge | A `#e8742a` | B `#f39a3c` | C `#c9552a` |
| Uttrykk | Glad | Ett bryn opp, hodet på skrå, vinker | Bryn ned, armene ut |
| Hode og ører | 40 %, mellomstore ører | 42 %, størst øyne, brede ører | 38 %, lange spisse ører |
| Gult kjennetegn | Skjerf | Halsbånd med merke | Skjerf med lang flik |

Kjent feil i skissesiden: i silhuettvisningen tegnes robotens hender i utgangsstillingen (ut til siden). De andre visningene er riktige.

## 10. Evens godkjenning

| Hva | Valg | Dato |
|---|---|---|
| To eller fire bein | To bein (hovedretning) | 4.11.2026 |
| Navn | | |
| Hovedfarge (A, B, C eller annen) | B `#f39a3c` (følger forslag 2) | 4.11.2026 |
| EVN-kjennetegn | Halsbånd med merke (følger forslag 2) | 4.11.2026 |
| Munn eller bare bryn og øyne | | |
| Ører under hjelmer | | |
| Forslag (1, 2, 3 eller en blanding) | Forslag 2 «Nysgjerrig» | 4.11.2026 |
| Raffinert modell (`modell.html`) | | |
| Utkast som skal modelleres | | |
| Grovmodellen i Blender (trinn 2–3) | | |

En voksen fører inn Evens valg. Godkjent design betyr ikke at reven kan publiseres. Det krever egen godkjenning av en voksen.
