# Matdyr-regn, fase 2 trinn 2: visuelle prototyper

Privat forhåndsvisning for Even: https://claude.ai/artifact/Apz1vbzisZvHr9qTHBwMFb

- `figurer.js`: fem testfigurer som ekte mathybrider, laget i kode med three.js r128: Donutku (ID 127), Burgersau (508), Pizzaskilpadde (700), Croissantrev (stilprøve, croissant er ikke blant de 25 matvarene) og Iskatt (259).
- `visning.js`: to faner.
  - **Matdyr:** forfra, siden, bakfra, ovenfra, nært, i spillstørrelse ved siden av EVN-roboten (spillets kameravinkel) og alle fem samlet. Mobilramme på PC.
  - **Gården:** gårdsnivå 1–10 med åpen gårdsbygning, etasje 2 (nivå 3), etasje 3 (nivå 6), takterrasse (nivå 9) og bygg på tunet. Neste nivå vises gjennomsiktig, og etasjene over roboten kan gjøres gjennomsiktige.
- Biblioteker (three.js r128, GLTFLoader og `helt-robot.js`) kopieres fra `/home/claude/matdyr` ved publisering. De ligger ikke her.
- Siden har ingen lagring, statistikk eller E-coins, og den rører ikke produksjonsspillet.

**Ytelse** (målt i Chrome uten skjerm med programvaregrafikk; FPS er ikke målt på ekte enheter):
- Én figur: 42–103 tegnekall og 11–36k trekanter.
- Gården på maks nivå med 40 matdyr: 396 tegnekall og 340k trekanter. Figurene er slått sammen per materiale og instansert, med halvt detaljnivå.
- Budsjettet for mobil (fra Mørkeskogen-planen) er høyst 400 tegnekall og 600k trekanter. FPS må måles på Evens telefon.

## Trinn 3, del 1: «🎮 Spill»-fanen

Roboten kan gå, hoppe og ta spiralrampa opp til takterrassen.

- PC: WASD eller piltaster for å gå, mellomrom for å hoppe, dra med musa for å snu kameraet.
- Mobil: styrespak nede til venstre, hoppknapp nede til høyre.
- Kollisjon: rekkverket på etasjene og langs rampa stopper roboten, også når den hopper. Rampa er åpen inn mot låven på hver repos, der den gule porten står. Roboten kan ikke gå inn under de lave delene av rampa.
- Etasjene over roboten blir gjennomsiktige.

`rutetest.mjs` lar roboten gå hele ruta automatisk. Testen sjekker høydene (6,05, 11,65 og 17,25), at roboten kommer inn i hver etasje, og at den ikke kommer ut over rekkverket.

Ingen lagring, E-coins eller statistikk ennå.

## Trinn 3, del 2: spill-løkka og Gårdsnivå

«🎮 Spill» er nå en spillbar prototype med egen lagring (`evn-matdyr-gard-proto`). Produksjonslagringen leses ikke. Prototypen har ingen E-coins og ingen statistikk.

- **Matdyrregn:** matdyrene regner ned på enga foran gården, aldri inne på tunet. Gjerdet har en port med sti ut til enga. Samme ID-er, sjeldenheter, priser og inntekter som produksjonsspillet (`matdyrdata.js`), med korte navn (B5). Bestillingsregnet er 15 %. I 🧪-menyen kan det settes til 0, 10 eller 15 %.
- **Figurer:** Donutku, Burgersau, Pizzaskilpadde og Iskatt har ferdige 3D-figurer. Alle andre vises som en kule i sjeldenhetsfargen med dyr og mat over.
- **Ta med og sett inn:**
  - Gå bort til et matdyr og trykk E eller handlingsknappen.
  - Bær matdyret til en ledig plass i hvilken som helst etasje. Du betaler når det settes inn.
  - Ved en full plass kan matdyret selges for halv pris.
- **Gårdsnivå-menyen:**
  - Menyen viser kravene, og forslaget er de svakeste matdyrene som passer. Et sjeldnere matdyr enn kravet velges aldri automatisk. Trykk på et matdyr for å bytte.
  - Før oppgraderingen kommer en bekreftelse med «Du leverer inn», «Du får» og «Du beholder».
- **Sikker oppgradering:**
  - Knappen låses straks den trykkes.
  - Alt kontrolleres på nytt rett før oppgraderingen, og en annen fane stoppes.
  - Ny tilstand lagres først og tas i bruk bare hvis lagringen lyktes.
- **Flere plasser:** kjøpes som i dag innenfor taket for gårdsnivået.
- **🧪 Testvalg:** bestillingsregn, testpenger, «Dyr til neste nivå» og nullstilling.

**Forenklinger i prototypen:**
- Legendary og bedre kan tas med uten fangst.
- Det finnes ikke bytte med det svakeste matdyret.

Matdyrboka og 🔍 Finn er neste del.

`spilltest.mjs` tester disse tilfellene:
- ta med og sett inn
- at forslaget aldri velger et sjeldnere matdyr enn kravet
- lagringsfeil
- endring i en annen fane
- dobbelttrykk
- at bare de innleverte matdyrene forsvinner
- gårdsnivå 1 → 10 i rekkefølge

## Ny grafikk (fase 2, 8.11.2026)

Ny grafikk er standard. `?grafikk=gammel` viser den forrige versjonen til sammenligning, og ⚙️ har en knapp for å bytte.

- **Fem nye hybrider** er modellert i Blender: Donutku, Burgersau, Pizzaskilpadde, Shakeand og Spagettipingvin.
  - Maten er selve kroppen.
  - Hver figur finnes i to versjoner: `modeller/<navn>.glb` (full) og `<navn>_lav.glb` (cirka 7 000 trekanter).
  - Animerte deler (hode, bein, hale og vinger) er egne noder.
  - Kildeskript: `blender/matdyr_hybrider.py`.
- **Miljøet** er også modellert i Blender: trær, busker, steiner, blomster, gress, låve, silo, hønsehus, mølle, drivhus, tårn, gjerde, høyball og kasse.
  - Kildeskript: `blender/miljo_ressurser.py`, som gir `modeller/miljo.glb`.
- **`miljo.js`** er en kandidat til felles EVN-komponent. Den har kvalitetsnivå, lys, terreng, spredning, instansering av GLB-ressurser og ytelsesmåling.
- **Åkeren** (60 × 32 m) ligger rett foran gården. Matdyrene regner ned der.
- **⚙️ Grafikk og ytelse:** velg Lav, Middels eller Høy, og mål FPS i 10 s på ekte PC eller mobil. Resultatet kan kopieres.
- **`nyefigurer.html`** viser figurene fra flere vinkler. Parametere:
  - `?vinkler=34,fram,side,bak,topp,spill`
  - `?lav=1` for lav detalj
  - `?figur=navn` for én figur
- **Iskatt** har fortsatt den gamle figuren. Matdyr uten ny figur vises som en farget kule.

Bygg modellene på nytt: `python3 blender/matdyr_hybrider.py modeller` og `python3 blender/miljo_ressurser.py modeller`. Begge krever bpy 5.x.

### Justering 8.11.2026 (etter Ivars vurdering)
- **Burgersau:** Sauehodet sitter inne i burgeren, under en brødlue som er strukket fram. Brødkanten er en ring av ulltotter, og en salatkrage går rundt halsen.
- **Shakeand:** Kroppen er et andeformet sundae-glass, med bryst foran og en glasskant som løfter seg til hale. Kremen danner ryggen og en kort hals, hodet vokser opp av kremen, og vingene er sprøytet krem. Sugerøret er halefjæren.
- **Spagettipingvin:** Hele kroppen er viklet av spagetti, med svart blekksprutpasta på ryggen og lys spagetti på magen. Vingene er nudelbunter.
- **Bakken:** Gresset har store, rolige flater. Tunet har grus, stiene er av jord, skogbunnen ligger under trærne, og det er tredekke (plankegang) fra porten. Gress og blomster vokser bare i kantene. Detaljteksturen har lav kontrast og en flis på 14 m.
- **Tonemapping:** ⚙️ → «Sammenlign tonemapping» (eller `?tonemap=sammenlign`) viser ACES til venstre og uten tonemapping til høyre, på samme skjerm.

### Gårdsbygningen med låvepreg (8.11.2026)
- `blender/gard_moduler.py` lager `modeller/gard.glb` med disse modulene:
  - stolpe med steinfot
  - rød bjelke med hvit list
  - knebånd
  - fjøsbue
  - hvitt rekkverk
  - lykt
  - blomsterkasse
  - portbue med skilt
  - steinheller
  - kjerre, tønne, firkantet høyball og værhane
- Modulene settes sammen langs den faste geometrien. Etasjer, plasser, ramper, åpninger og kollisjon er uendret, og spilltestene og rampetesten består.
- **1. etasje** har fjøsbuer mellom stolpene. De er åpne nedenfor, så matdyrene vises og roboten kan gå inn. De øvre etasjene er åpne, med knebånd, lykter og blomsterkasser utenpå rekkverket.
- **Plassene:** åpne plasser er høysenger med hvit kant. Låste plasser er dempet tredekke med hengelås.
- **Tunet** har steinheller mellom porten, fjøset, rampa, låven, siloen, hønsehuset og mølla. Det er også grus, jord, en kjerre med gulrøtter, høyballer, tønner og en værhane på låven. Siloen har fått steinfot, og i det fjerne er det fjell og en innsjø.
- **Kostnad på Høy** (gården på nivå 9, headless): 336 tegnekall og 1,06 mill. trekanter, inkludert skyggepasset. Før var det 190 tegnekall og 0,84 mill. trekanter. Kan reduseres med felles materialer og vertexfarger hvis målingene på mobil krever det.

### Justering etter Ivars vurdering (8.11.2026, 15:03)
- **Øverste nivåer:** De har et roligere rekkverk uten sprosser. Lykter og blomsterkasser finnes bare i nederste åpne etasje.
- **Plassene:**
  - Ledige plasser har lysegrønn ramme med pluss.
  - Opptatte plasser er lyse høysenger med hvit kant.
  - Låste plasser er mørk skifer med striper og hengelås.
- **Rampa:** Stolpene står loddrett. Bare håndløper og mellomlist følger helningen.
- **Bakgrunn:** Det er færre steiner, blomster og gresstuster, og de står bare i klynger ved gjerdet og åkerkanten. Detaljteksturen har svakere kontrast.
- **Optimalisering:** Enkle fargematerialer slås sammen til ett materiale med vertexfarger (`EVNMiljo.deler(..., { vf: true })`). Gården på nivå 9 på Høy har nå 189 tegnekall, mot 336 før denne endringen og 190 i forrige versjon.

## Min Bondegård-profilen (8. november 2026, prøve)

`?profil=mb` (eller ⚙️ → «🎨 Prøv Min Bondegård-profilen») gir Matdyr samme grafiske profil som Min Bondegård testscene 0.4. Uten parameteren er alt som før. Spillfunksjoner, ID-er, økonomi og lagring er uendret.

- Lys som dagsoppsettet i 0.4: ingen tonemapping, eksponering 0,93, himmel #d6ecff/bakke 0x41602a 0,55, sol #ffe8c4 1,55 fra samme kant, fyll 0,22, gradert himmel og tåke mot horisontfargen.
- Materialer etter navn fra Blender: planker, maling, stein, tak og høy får 0.4-teksturene som triplanar detalj i verdensrommet med svakt relieff. Fargen kommer fortsatt fra vertexfargene. Dekket bruker 0.4-plankene med bump.
- Gress i 0.4-grønt (kalibrert mot skjermbilde), korte gresstrå i teksturen, ingen grustun rundt gården, spredte gresstuster i grupper.
- Spagettipingvin er bygd om: én sammenhengende eggformet kropp med viklet spagetti som tekstur, normalkart og svakt relieff, og myke avrundede vinger. Animasjonsnodene er de samme.
- Ikke gjort ennå: trekroner som én flate (som 0.4), låve og bygninger på tunet, de tre andre figurene.

`sammenligning-mb-profil.png` viser Min Bondegård og Matdyr med samme kamera. Ytelse er ikke målt på ekte enheter (headless: 172 tegnekall på gårdsnivå 3 i oversikten, mot 171 før).

### Tilbakemelding fra Ivar 8.11 (neste grafikkrunde, ikke startet)
God retning, men ikke en endelig godkjenning av profilen. Prøven ligger bak flagget `?profil=mb`. Min Bondegård er fortsatt den visuelle referansen. Materialene og lyset fra prøven er utgangspunktet.
- Spagettipingvin: behold kroppen og de myke vingene. Gjør spagettien tydeligere med noen få myke pastastrenger som følger kroppen. Den skal leses som mat og dyr også på vanlig spilleavstand.
- Rampeplanker: for mørke og stripete. Tilpass teksturstørrelse og kontrast til treverket i Min Bondegård.
- Låste plasser: behold tydelig hengelås og forskjell mellom plassene. Demp stripene og tilpass materialet til gårdsmiljøet.
- Landskap: ta med de sammenhengende trekronene og landskapsuttrykket fra Min Bondegård. Behold rolige gressflater og naturlige overganger ved steinstier og bygninger.

## Figurpilot (MS5, 8. november 2026)

`blender/matdyr_modul.py` bygger matdyr av to moduler:
- **Dyresett:** hode, bein, hale og vinger, og plassen kroppen skal stå på.
- **Matkropp:** maten er selve kroppen, og den melder tilbake hvor hodet og halen skal festes.

Kroppen kan ligge, stå eller være en kuppel. Piloten har 4 arter (ku, pingvin, skilpadde, hval) og 4 matvarer (pizza, smultring, is, banan), til sammen 16 figurer. De ligger i `modeller/pilot_<art>_<mat>.glb` med `_lav`. Nodenavnene er de samme som for de håndlagde figurene.

- Kjør: `FIGURER=ku:pizza,pingvin:is python3 blender/matdyr_modul.py modeller` (uten FIGURER bygges alle 16). Kjør deretter pakkeskriptet for `.glb.js`.
- Visning:
  - `nyefigurer.html?figur=pilot_ku_pizza,pilot_hval_is&vinkler=34,fram,side,bak&profil=mb`
  - I spillet med `?pilot=1`. Piloten går da foran de håndlagde figurene med samme ID (Donutku 127, Pizzaskilpadde 700).
- Plassene i spillet: alt uten tekstur slås nå sammen til to felles materialer (matt og blankt) og til én mesh per etasje. Med 16 ulike figurer på 16 plasser ble det 98 tegnekall, mot 321 før sammenslåingen. Målt headless, ikke på ekte enhet.
- Trekanter: full 13–33 k, lav ≤ 7 k. Filstørrelse: lav 205 kB per figur, full 650 kB. Bilde: `figurpilot-kontaktark.png`.
- Ingen masseproduksjon før Even har godkjent piloten (MS5).

## Matdyrene går over åkeren (Ivar, 8.11.2026 kveld)
Før forsvant matdyrene etter 70 sekunder, uansett hvor de var. Nå skjer dette:
- De lander i starten av åkeren (vest).
- De vandrer østover over åkeren.
- Til slutt går de ut gjennom en port i østgjerdet og følger en sti bak en hekk, der de blir borte.

Roboten kan ikke gå ut gjennom porten.

### Kvalitetssikring av gangen (Ivar, 8.11.2026 kveld)
Ivar har bedt om kvalitetssikring av seks punkter. Status for hvert punkt:

1. **Gangbevegelser følger farten.** Bein, vugging, hale og vinger styres av tilbakelagt distanse. Ett skritt er ca. 0,9 m for firbeinte og 0,7 m for tobeinte. Når et matdyr venter, står det stille. Farten øker og avtar mykt.
2. **Ingen går gjennom hverandre, gjerdet eller roboten.** Hvert matdyr holder avstand (radius 1,05 m) og styrer unna. Gjerdet holder dem inne, og bare porten slipper dem ut.
3. **Ingen blokkerer hverandre ved porten.** Porten er utvidet fra 4,8 til 6,8 m, så det er tre felt gjennom den. Den som ligger bak, venter i stedet for å dytte. Rekkefølgen er entydig: den som er lengst øst, går først. Venter et matdyr mer enn 1,2 s, bytter det til feltet med færrest foran seg.
4. **Ingen forsvinner på åkeren.** Et matdyr blir bare borte bak hekken, 13,5 m utenfor porten. Sikkerhetsnettet på 4 minutter gjelder nå bare matdyr som roboten har sluppet på tunet. De krymper bort der. Har et matdyr vært 150 s på åkeren, går det rett mot porten.
5. **Tid til å fange.** Matdyrene kan tas med hele veien til porten. Vanlig gangfart gir disse tidene, fra landing til porten, i 600 simulerte sekunder: median 38 s, 10 % under 33 s, 90 % under 49 s, maks 57 s.
6. **Mobil og PC.** Testet i 1280×800 og som mobil med berøring i 390×844 og 844×390. Navneskiltene blir aldri større på skjermen enn et skilt ca. 16 m unna (22 m på stående mobil). De tones ut helt inntil kameraet. Bildefrekvens er ikke målt på ekte enhet.

Spilltest-sjekk 9 fyller 14 matdyr foran porten og simulerer 4 minutter med regn. Ingen får gå gjennom gjerdet, bli fjernet inne på åkeren eller stå fast mer enn 10 s.

Gangfart kan velges under ⚙️ (spilltest): 🐢 Rolig (0,7×), 🚶 Vanlig og 🐇 Rask (1,4×). Det samme kan settes med `?gangfart=0.7` eller `?gangfart=1.4`.

| Gangfart | Median på åkeren | 10–90 % | Matdyr per minutt |
|---|---|---|---|
| 🐢 Rolig | 55 s | 46–70 s | ca. 11 |
| 🚶 Vanlig | 38 s | 33–49 s | ca. 16 |
| 🐇 Rask | 29 s | 23–35 s | ca. 21 |

Det kan være høyst 14 matdyr på åkeren samtidig. Roligere gange gir derfor også færre nye matdyr per minutt.

## Levende matdyr og plassering i basen (Ivar, 8.11.2026 kl. 21.19)
Denne løsningen erstatter køen med tre felt som ble kvalitetssikret tidligere samme kveld.

**Åkeren**
- Matdyrene lander i vest. De vandrer fritt i 12–22 s mot tilfeldige mål over hele åkeren og stopper av og til for å beite.
- Deretter søker de gradvis mot porten i løpet av 8 s. Hvert matdyr har sitt eget mellompunkt, sitt eget punkt i portåpningen og sitt eget mål ute i landskapet.
- Utenfor porten går de inn mellom busker og krymper rolig bort i løpet av ca. 2 s, 9–20 m utenfor gjerdet.
- **Styring:** Hver frame prøver matdyret 11 retninger rundt den ønskede. Det velger den som gir minst kollisjon med andre matdyr (der de vil være om 0,4–1,6 s), roboten, portstolpene, buskene og gjerdet.
- **Lovlige områder:** Åkeren, portåpningen og landskapet øst for porten. Bare porten forbinder dem. Et matdyr som fortsatt vandrer, holder seg inne på åkeren.
- **Står fast mer enn 2 s:** Matdyret bytter side og velger ny rute.
- **Roboten i veien:** Har et matdyr som vil ut vært stoppet av roboten i mer enn 1,2 s, hopper det over roboten. Roboten flyttes ikke, og gjerdene gjelder fortsatt.
- **Navneskilt:** Skilt som ville dekke et viktigere skilt, tones ut. Viktigst er matdyret nærmest roboten, deretter det nærmest kameraet.

**Basen**
- Bærer roboten et matdyr utenfor åkeren, får hver ledige plass i alle etasjer en grønn ＋ med etasjenummer. Plasser i andre etasjer vises litt mindre.
- Trykk eller klikk på en ＋, så flyr matdyret i en kort bue til plassen (0,7 s). Betalingen skjer når det flytter inn, som før.
- Handlingsknappen viser «🏠 Plasser på første ledige plass» (E). Den velger første ledige plass på robotens etasje, ellers laveste plassnummer.
- Å gå rett bort på en ledig plass fungerer fortsatt. Andre matdyr flyttes aldri.

**Målt i simulering (headless, 300 s)**
| Scenario | Resultat |
|---|---|
| Vanlig regn | Median 49 s fra landing til porten (10–90 %: 39–58 s). Ingen gjerdebrudd, ingen fjernet inne. |
| 14 vil ut samtidig | Alle ute etter 22 s. |
| Roboten står midt i porten | Alle 14 ute etter 34–38 s. |
| Roboten jager matdyrene og stiller seg foran dem | Lengste stillstand 1 s, maks 91 s på åkeren. |

Spilltest-sjekk 9 (roboten i porten) og sjekk 10 (plassering i 2. etasje og «første ledige») er lagt til.

**Ikke løst:** 144 av 160 matdyr har ennå ingen ferdig figur og vises som kule med symboler. De byttes ut etter hvert som figurene godkjennes (MS5).

## Figurrettinger etter Ivars vurdering (8.11.2026 kl. 21.45)
Donutku, Burgersau, Pizzaskilpadde, Shakeand og Spagettipingvin er rettet i `blender/matdyr_hybrider.py`. Feilen i `forelder()` som plasserte siste del feil ved eksport er også rettet. Den ga en hale under Burgersau og for lave føtter på Shakeand og Spagettipingvin. Sammenligning: `figurer-for-etter.png`. Venter på Evens vurdering.

## Låvevarianter og gavlretting (Ivar, 8.11.2026 kl. 21.30 og 22.45)
- **Tre varianter til vurdering** (`blender/laave_varianter.py` → `modeller/laaver.glb`), vist med `?laave=a`, `?laave=b` eller `?laave=c`:
  - A: klassisk mansardlåve
  - B: norsk låve med saltak
  - C: koselig storlåve med høyhette, blomsterkasser og lykter
- **Felles for alle tre:**
  - én takform, der gavlveggen er laget av takets egen profil og derfor aldri stikker opp gjennom taket
  - hvite vindskier og hjørnebord
  - port med hvitt kryss, høyluke med høy og symmetriske vinduer
  - steinsokkel i samme stein som siloen
  - fronten vender mot tunet
- **Plassering med en variant:** Siloen flyttes inntil låvens østside, og stiene følger etter.
- **Uten flagget:** Gården er som før.
- **Sammenligning:** `laave-varianter.png`
- **Gavlfeil rettet i `blender/miljo_ressurser.py`:** Gavlen på dagens låve stakk opp til 0,6 m over taket, og hønsehuset hadde mansardgavl under saltak. Begge gavlene følger nå takets underside.
- **Ikke endret:** spillregler og progresjon.
- **Gjenstår (eldre problem):** Roboten kan gå gjennom låven fordi den ikke har kollisjon. Ytelse er ikke målt på ekte mobil. Hver låvevariant har ca. 11 000 trekanter.

### Rettinger etter QA av 221eb59 (9.11.2026)
1. **Ingen sprang etter hopp.** Når et hopp slutter, regnes roboten med som hindring i samme bilde. Et matdyr lander aldri oppå roboten eller et annet matdyr, fordi hoppet forlenges opptil tre ganger. Skyvet er begrenset til 3,5 m/s. Ved gjerdet og i porten skyves matdyret bare i en lovlig retning. Målt største flytting per bilde: 0,12–0,18 m, mot 1,15 m før.
2. **Fri utgang.** Ingen spredte trær, busker eller steiner står lenger øst for porten (x 29–62, z 22–58). Der står bare `UTBUSKER`, som navigasjonen kjenner.
3. **＋-merkene** er aldri lavere enn 56 px på skjermen. Trykk regnes som treff innenfor halve merkehøyden, minst 26 px fra midten. Målt 53–72 px på 1280×800 og 320×568. Trykk og slipp måles med `e.timeStamp`, grense 800 ms.
4. **Meldingen** ved fangst er kortere (3 s) og skjules når merkene vises. Merker under statuspanel og knapper på små skjermer er ikke løst. «Første ledige» og å gå bort til plassen virker alltid.
5. **Knappeteksten** er «🏠 Første ledige plass», så knappen blir smalere.
6. **Tilbudet av matdyr** er tilbake på ca. 16 per minutt når åkeren er i gang (målt 14,7 per minutt over 600 s, oppvarmingen medregnet). Den frie vandringen er kortet til 6–14 s. Median fra landing til porten er 44–45 s.

### Leveringsfelt (Ivar, 9.11.2026 kl. 01.02)
- Et gult felt, «🏠 Lever her», ligger i passasjen mellom gården og åkeren (|x| < 2,9, 3,4–0,3 m før åkergjerdet). Roboten går gjennom passasjen hver gang den bærer et matdyr hjem.
- Går roboten inn på feltet med et matdyr, flyr matdyret til første ledige plass, 1. etasje først. Spilleren trykker ikke på noe.
- Feltet reagerer bare idet roboten går inn på det, ikke hvert bilde. Uten ledig plass kommer en melding, og matdyret blir båret videre.
- Betalingen skjer ved innflytting, som før. Å velge plass selv med ＋ og «Første ledige plass» virker fortsatt.
- Flyturen varer lenger når avstanden er lang: 0,6 s + avstand/30.
- Spilltest-sjekk 11 dekker feltet.

### Rettinger etter QA av dd10e82 (9.11.2026)
- **Leveringsfeltet:** Det dekker nå hele passasjen (|x| < 3,3), så roboten ikke kan gå forbi det. Hvert matdyr som bæres, prøves levert én gang per besøk på feltet. Det gjelder også når roboten tar matdyret mens den allerede står på feltet.
- **Tilbudet av matdyr:** Taket på 14 teller bare matdyr som er på åkeren (`gaa` eller `fall`), ikke dem som er på vei bort i landskapet. Den frie vandringen er 10–19 s. Målt med samme metode (2 min oppvarming, deretter 10 min, roboten borte): 16,4 og 16,1 per minutt, mot 16,2 i a00a380.
- **Landingspunktet:** Det prøves inntil 24 punkter, og ett godtas med en gang det er minst 3,2 m til andre matdyr.
- **Spilltest-sjekk 11:** Gården fylles nå etter at matdyret er tatt med, så sjekken faktisk tester full gård.
- **Ikke løst:**
  - ＋-merker dekket av panelene på små mobilskjermer. Leveringsfeltet og «Første ledige plass» virker alltid.
  - Overlapp mellom handlingsknapp og styrespak i 320×568.
  - Ødelagt lagring overskrives (eldre funn).

### Bytte når gården er full (Ivar, 9.11.2026 kl. 17.31)
- Prototypen hadde ikke regelen fra Matdyr-regn 0.10.3, og den er nå overført.
  - Er gården full, kan et matdyr tas med hvis det tjener mer enn det svakeste på gården.
  - Et dårligere matdyr kan ikke tas med. Da viser knappen «🔒 Ikke bedre enn det svakeste».
- Ved levering spør spillet alltid før det bytter. Det skjer på leveringsfeltet, med knappen «🔁 Bytt ut et matdyr» eller med E.
  - Spørsmålet viser det nye matdyret, det svakeste på gården, forskjellen i inntekt og pengene.
  - Valgene er «🔁 Bytt med svakeste», «👉 Velg en annen» og «Avbryt».
- «Velg en annen» gir oransje 🔁 over alle opptatte plasser, i alle etasjer. Trykk på én, eller gå bort til matdyret og trykk «🔁 Bytt med …».
- Det gamle matdyret selges for halv pris. Det nye betales når det flytter inn. Andre matdyr flyttes aldri, og ingenting byttes automatisk.
- Spilltest-sjekk 12 dekker regelen. Sjekk 11 lukker nå spørsmålet som kommer på feltet når gården er full.
- **Rettinger etter QA av 65fa16c:**
  - **Fokusfelle i alle dialoger.** Tab og Shift+Tab går rundt blant knappene i dialogen. Escape lukker som før.
  - **«Avbryt» avslutter velg-modus.** Knappen nullstiller velg-modus, og 🔁-merkene forsvinner.
  - **Ingen melding over merkene.** I velg-modus viser handlingsknappen «✖ Avbryt bytte», og E avbryter. Teksten er kortet ned etter QA av 5e797ae, så knappen ikke går inn over styrespaken. Det gir ingen egen melding som kan dekke merkene.
  - **Strengere spilltest-sjekk 12.** Den sjekker nå hver for seg at halv pris kommer inn og at prisen trekkes ved innflytting. Den sjekker også fokusfellen og at «Avbryt» nullstiller.
- **Kjent:** Lukkes siden mens matdyret flyr (ca. 0,7 s), beholdes det gamle matdyret. Det nye forsvinner uten at noe er betalt. Ingen fremgang går tapt.

## Figurbolk 1: ku og gris × 10 matsorter (Ivar, 9.11.2026 kl. 20.24: «Én bolk først»)
- 20 figurer i pilotstilen, vist med `?pilot=1`. Uten flagget er spillet uendret.
- 16 er nye: ku med burger, spagetti, taco, sjoko, jordbær og milkshake, og gris med alle 10 matsortene. 4 er eldre ku-figurer fra piloten.
- ID-ene er hentet fra `COMBOS`. Ingen nye ID-er er laget, og sjeldenhet, pris og inntekt er uendret.
- Lav versjon har ca. 7 000 trekanter og 197–244 kB per figur.
- `blender/matdyr_modul.py` har fått matbyggere for burger, spagetti, taco, sjoko, jordbær og milkshake, og et dyresett for gris.
- Sammenligning: `figurbolk1-kontaktark.png`. Bolken venter på Evens vurdering. Resten lages art for art først når han har godkjent den.
- Kjente svakheter:
  - Forfra dekker hodet mye av maten.
  - Tacoskallet har kantete flekker.
  - Sjokoen er et hardt rektangel.
  - Spagettien ser ut som løkker fra siden.
  - Skallflikene på bananen henger flatt.
  - Grisesnuten står litt løst.

### Spilltest-tilbakemeldinger (Ivar, 9.11.2026 kl. 22.05–22.08)
- **Hoppet over roboten er mer naturlig.** Før valgte matdyret et sted å lande underveis og kunne bli hengende i lufta over roboten. Nå gjør det dette:
  - velger et ledig landingssted bak roboten før det hopper (lovlig hele veien, med margin)
  - setter seg ned (0,2 s)
  - hopper i en jevn bue (2,4 m høyt, 0,55 s + 0,06 s per meter) med beina i ro, nesa først opp og så ned
  - lander med en liten sammentrykking (0,22 s)
  - venter hvis det ikke finnes et ledig landingssted
  Målt: største flytting per bilde 0,21 m. Ingen gjerdebrudd eller fastlåsing, heller ikke når roboten jager matdyrene.
- **Leveringsfeltet er flyttet nærmere basen.** Det ligger nå rett utenfor porten i gårdsgjerdet, fra gjerdet og 3,3 m ut. På gårdsnivå 2 og høyere er passasjen kortere, og der er feltet ca. 1,6 m.
- **Bestillingsgaranti (G2, testverdi).** Har 6 matdyr i rad falt uten ett som neste gårdsnivå fortsatt trenger, blir det neste et slikt (riktig art og minst riktig sjeldenhet). Garantien slås av og på med 🧪 «🎯 Garanti». Den lagres ikke, og prisene er uendret.
  Målt på gårdsnivå 1 over 10 min: kuer gikk fra 13 til 22. Lengste opphold mellom kuer gikk fra 161 s til 57 s.
- **«Rare-kuene teller ikke» (22.36):** De teller. Gårdsnivå-vinduet velger med vilje ikke sjeldnere matdyr automatisk, så ingen sjeldne leveres ved et uhell. Derfor sto det 0/2. Vinduet sier nå tydelig fra:
  - «👆 Du har 2 som passer (sjeldnere enn nødvendig, derfor ikke valgt for deg). Trykk på dem for å levere.»
  - Matdyr som er sjeldnere enn kravet, merkes med ⭐.
  - Telleren viser «0/2 valgt».
  Regelen om ikke å velge automatisk er beholdt.

### Alternativ C bak `?fordeling=c` (godkjent som isolert prototype av Ivar 10.11.2026)
Uten flagget er fordelingen, lagringen og spillet som før. B3 (uendrede sjeldenheter) gjelder fortsatt produksjonsspillet.
- **Fordeling:** hver art har 6 Common, 5 Rare, 5 Epic, 4 Legendary, 3 Mythic, 1 Food God og 1 Secret. Vektene er uendret, og alle 1 000 ID-er beholdes. Samme regel som `test/matdyr/fordeling-c/stige.js`.
- **Egen testlagring:** `evn-matdyr-gard-proto-c`. Ved første start leses standardlagringen (`evn-matdyr-gard-proto`) og migreres. Den skrives aldri. En ødelagt testlagring tas vare på i `…-c-ugyldig`.
- **Streng bestefarsregel:** eide dyr beholder gammel kategori, pris og inntekt (`arv` per plass). Arven følger dyret og forsvinner når det selges, byttes eller leveres. Gårdsnivå-kravene bruker den arvede kategorien. ⏳ viser «eldre utgave» i salg, bytte og Gårdsnivå.
- **Bestillingsregn:** 0 % betyr ingen styring i det hele tatt, heller ikke garanti. Garantien løfter aldri over Legendary.
- **Óðinn-kallet (forslag):** Gårdsnivå 10 krever fortsatt Óðinn. På vei til nivå 10 viser Gårdsnivå-vinduet «🔔 Óðinn-kallet: x/3». Når 3 ulike Food God er funnet, blir neste Food God som faller av seg selv, Óðinn. Regelen er synlig og uavhengig av bestillingsregnet. Simulert (bestilling 0 %, ingen garanti), median/90-persentil til nivå 10: Vanlig barn 156/191 min (uten kall 186/380), Ny spiller 626/937 (uten kall 960/over 1 440).
- **Matdyrboka:** 📖-knappen. Én art om gangen, 25 ruter i stigen. Alle tidligere funn teller. Food God får gullramme, Secret er skjult (???) til den er funnet.
- **Toppsett (`toppsett.js`):** Food God og Secret får særpreg mens spillet kjører, uten egne modeller. 3 varianter av hvert sett. Sammenligning: `toppsett.html` og `toppsett-varianter.png`. I spillet: 🧪 → «✨ Food God: A/B/C», «✨ Secret: A/B/C», «⭐ Slipp Food God», «🌌 Slipp Secret».
- **Testknapper (🧪):** «🕰️ Gammel testlagring» lager og migrerer en typisk gammel lagring. «📥 Hent standardlagring» migrerer standardlagringen på nytt.
- **Spilltest:** `node spilltest-c.mjs` (32 kontroller: flagg, migrering, arv, salg, Gårdsnivå med arv, bestilling 0 %, garantitak, Óðinn-kallet, Matdyrboka, ødelagt lagring). Migreringstestene for begge lagringsformatene: `node --test test/matdyr/fordeling-c/migrering.test.js` (20).
- **Paninikanin, tre forslag** (`blender/paninikanin_forslag.py`, `paninikanin-forslag.png`, `nyefigurer.html?figur=paninikanin_a,paninikanin_b,paninikanin_c`): A Paninikropp, B Brødkanin, C Halvpanini. Ingen ID- eller kategoribytte før Even har valgt.

### Paninikanin: Evens valg (10.11.2026, kl. 20.31)
- Even valgte **forslag C, Halvpanini**, som visuelt utgangspunkt. A og B er lagt bort.
- Videreutviklet med detaljnivå C (`blender/paninikanin.py`, `modeller/paninikanin.glb`, kontaktark `paninikanin-c-kontaktark.png` med fire vinkler og spilleavstand). Mat og dyr er bakt sammen:
  - Brødsidene buler ut som lår.
  - Snittflaten er magen og viser lagene.
  - Ørene er paninistrimler med ostekant.
  - Ost har rent over panna og danner en krage.
  - Ostetråder går fra armene, og halen er en mozzarellakule.
- 24 728 trekanter i full versjon og 6 990 i lav versjon (budsjett 25 000 og 7 000).
- Ørene er egne noder (`ore_v`, `ore_h`), klare for øreanimasjon. Animasjonen er ikke lagt inn ennå.
- Ingen ID- eller kategoribytte. Det er fortsatt åpent om Paninikanin blir Food God eller Secret, og hvilket toppsett (A/B/C) de to kategoriene får.

### Kuer på to bein (`?tobein=1`, Even 10.11.2026 kl. 21.10)
- `blender/matdyr_tobein.py` bygger kua med oppreist matkropp, på samme måte som pingvinen. Hodet er det samme kuhodet. Kua har armer med klover (`vinge_v`, `vinge_h`) og to kubein (`bein_vf`, `bein_hf`), så spillets tobeinte gange virker uten ny kode.
- Prøve med fire matvarer: Donutku (127), Pizzaku (125), Isku (134) og Burgerku (133). Kontaktark: `ku-tobein-kontaktark.png`. I spillet: `ku-tobein-spill.png`.
- Bare utseendet endres. ID, sjeldenhet, pris og inntekt er uendret. Uten flagget er kuene som før.
- **Trekantbudsjett (rettet etter QA d859e4a):** Den fulle versjonen var 25 354–32 652 trekanter. Nå forenkler skriptet den tettest maskede delen (maten), så alle fire er 24 000 trekanter i full versjon og under 7 000 i lav. Utseendet er sammenlignet før og etter: `ku-tobein-budsjett.png`.
- **Evens valg (10.11.2026 kl. 21.19):** «Det er mye morsommere at de går på to bein.» Kuer på to bein er Evens foretrukne retning. Det er ennå ikke bestemt om andre arter også skal gå på to bein.

### Bare dyr på to bein (Even 10.11.2026 kl. 23.48: «Kun dyre med to bein»)
- Even vil at alle matdyrene skal gå på to bein. Retningen er notert, men den gjelder ikke produksjonsspillet før den er godkjent.
- Gris på to bein er lagt til bak `?tobein=1` (ID 2, 0, 9 og 8: Donut-, Pizza-, Is- og Burgergris), laget med `DYR=gris` i `matdyr_tobein.py`. Kontaktark: `gris-tobein-kontaktark.png`.
- Trekanter: 21 162–24 368 i full versjon og under 7 000 i lav.
- Pingvinen, anda og Paninikanin går allerede på to bein.
- Ikke avklart: sjødyr som hval og hai, og skilpadda. En oppreist pizzaskilpadde ligner for mye på en kjent figur og bør få en egen løsning.

### Hval på flodhestbein (Evens valg B, 11.11.2026)
- Even valgte forslag B, «flodhestbein». Forslaget bygger på urhvaler som gikk på land, og på flodhesten, som er hvalens nærmeste levende slektning. Bakgrunnen er AMNH, «A Walking Whale: Ambulocetus».
- Hvalen har korte, tjukke bein med tre tær og lys såle, luffene er armer, og den har vannsprut og en halefinne nede bak.
- `DYR=hval` i `matdyr_tobein.py` lager figurene. De ligger bak `?tobein=1` med ID 227, 225, 234 og 230 (Donut-, Pizza-, Is- og Bananhval). Kontaktark: `hval-tobein-kontaktark.png`.
- Hver figur har 24 000 trekanter i full versjon og under 7 000 i lav.
- Vi kopierer ikke meme-haien med joggesko: ingen sko og ingen tre bein.

### Hai på finnebein (Evens valg A, 11.11.2026)
- Bukfinnene er korte bein med brede, flate finneføtter, og brystfinnene er armer.
- Haien har en stor ryggfinne midt på ryggen, gjeller og et vennlig smil med små, runde tenner.
- Even 11.11.2026: «Det må være en haifine på ryggen» og «Du må fjerne halen». Finnen på hodet er flyttet til ryggen, og halefinnen er fjernet. Noden `hale` finnes ikke lenger. Det er trygt, fordi `animerNy` bare beveger noder som finnes.
- Inspirert av epaulett-haien, som kan «gå» på finnene sine.
- `DYR=hai` i `matdyr_tobein.py`. Bak `?tobein=1` gjelder dette ID 52, 50, 59 og 51 (Donut-, Pizza-, Is- og Tacohai).
- Kontaktark: `hai-tobein-kontaktark.png`.
- Trekanter: 23 530–24 000 i full versjon og under 7 000 i lav.

### Matdyr på to bein er standard i prototypen (11.11.2026)
- Even spurte om de nye dyrene kan legges inn i spillet. I prototypen vises de 16 tobeinte figurene (ku, gris, hval og hai) nå uten flagg. `?tobein=0` gir de gamle figurene. `?tobein=1` virker fortsatt.
- Bare utseendet endres. ID, sjeldenhet, verdi og lagring er uendret.
- Produksjonsspillet (`spill/matdyr`) er ikke endret. Det krever egen voksengodkjenning.
- **Etter QA 81c2fb8 (11.11.2026):**
  - De tobeinte modellene lastes først etter at spillet har startet. Oppstarten venter dermed på de samme 12 filene som med `?tobein=0`. Til modellene er klare, vises det spillet hadde før: Donutku (127) som den gamle figuren, og de 15 andre som enkle kuler med emoji, siden de ikke har noen egen figur uten flagg. Så tegnes gården på nytt (`evn-tobein-klar`). Et dyr som allerede faller eller står på tunet, beholder figuren sin til det er borte.
  - På lav og middels kvalitet hentes bare lav detalj (16 filer i stedet for 32), fordi spillet bare bruker lav detalj der.
  - Matdyr-fanen viser Donutku på to bein, slik den ser ut i spillet. På lav og middels kvalitet vises lav detalj også der. Fanen tegnes bare på nytt hvis Donutku eller «Alle» vises, og kameraet beholdes (rettet etter QA 11a7594). I «Nært» flyttes målpunktet til hodet på den nye figuren, mens vinkel og avstand beholdes (QA 6d388ab).
  - `spilltest.mjs` og `rutetest.mjs` lukker Chrome også når skriptet feiler eller avbrytes. `spilltest.mjs` kontrollerer innlastingen etter start.

### Ønsker fra Even 12.11.2026
- **Donuthull:** «det mangler hull i donuten». Den stående donuten (`mat_smultring`, modus `staa`) har nå større ring, tynnere deig og et tydelig hull. Den er gjort dypere, så den ikke blir flat. Halefestet (`bak`) sitter nede på ringen, så halen ikke stikker gjennom hullet. Ku, gris, hval og hai med donut er eksportert på nytt. Haiens ryggfinne plasseres etter kroppsdybden. Den gamle firbeinte pingvinpiloten med donut er ikke eksportert på nytt.
- **Armene til Donutkua:** «du må fikse armene til donutkua». Armene er tykkere, kommer ut fra siden av ringen og bøyer seg fram, så de syns forfra (`donut-hull-kontaktark.png`).
- **Gange:** «pizza kua går veldig rart». Dyr på to bein svinger nå armene fram og tilbake i takt med beina. Før ble begge armene løftet ut til sidene samtidig, som vinger. Ekte vinger (pingvin) flakser som før.
- **Rekkverk:** «Det mangler rekkverk». Enden av den øverste rampa lukkes med rekkverk, også som vegg for roboten. Veggen går fram til husveggen (0,25 m forbi innerkanten) og ikke inn i etasjen. På reposene regnes glipen på 0,25 m mot etasjegulvet som gulv, så roboten ikke faller gjennom døråpningen (QA c1ff190 og ef91746). `rutetest.mjs` prøver 42 måter å gå mot enden på (0–80° inn mot huset, lav og full fart, med og uten hopp) og går innvendig langs husveggen forbi døråpningen. Den siste biten av ytterkanten, som manglet rekkverk, har fått det.
- **Åkeren-skiltet** er tatt bort («Åker skilte kan tas bort»).
- **Grafikk som i Min Bondegård (12.11.2026):** Even: «jeg vil at grafikken i spillet skal være likt som grafikken i bondegård spillet». Min Bondegård-profilen (`miljo.js`: lys uten tonemapping, gradert himmel, kalibrerte farger og teksturerte materialer) er nå standard i prototypen. `?profil=standard` gir den gamle profilen. Trær, gjerder og gress er fortsatt Matdyrs egne. De er neste steg og krever avklaring om kopi eller felles modul.
