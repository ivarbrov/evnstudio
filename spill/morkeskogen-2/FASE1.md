# Mørkeskogen 2.0 – fase 1: skjelett (arbeidslogg)

**Gren:** `morkeskogen-2.0`. Startet 2.11.2026 etter G0. Rapporteres ved **G1 (voksen)** før fase 2.

## Mål for fase 1 (fra PLAN.md, pkt. 3)
- **Spillogikken:** Den er flyttet i fase 0, og koblingspunktene skal dekkes av et grensesnitt.
- **Ny grafikkjerne:**
  - terreng for alle biomer
  - himmel, døgn og tåke
  - kamera (nært og fjernt)
  - robot-helten med dagens fem klipp
  - HUD og startkort
- **Overgangsversjon:** Alle andre objekter vises med nye materialer.
- **Krav ved G1:**
  - Logikktvillingen viser ingen avvik.
  - Gamle lagringer lastes.
  - Funksjonstest for start, pause, kart, avslutt, bygg, sekk og «Start helt på nytt».
  - Ingen konsoll- eller CSP-feil.

## Arkitekturvalg (tas med til G1)
**Grensesnittet mellom logikk og grafikk er `R3`-kontrakten. Ingen logikkblokk skrives om.**
- Logikken bruker bare disse delene av `R3`:
  - `camMode`, `camYaw`, `camPitch`, `camZoom`
  - `camera` (aspect, `updateProjectionMatrix`, projeksjon via `tmp`)
  - `renderer.setPixelRatio`, `renderer.setSize`
  - `player.head` (capsen)
  - `pool` (punktlys for kvalitetsnivå)
  - `sun.shadow` (størrelsen på skyggekartet)
- Den nye grafikken skal levere nøyaktig dette.
- **Fordelen:** Alle 407 logikkblokker forblir tegn for tegn like 5.6.2. Det kontrolleres ved hvert bygg.
- **Avvik fra planen:** Planen sa at de 12 koblingspunktene skulle skrives om. Det er ikke nødvendig, fordi kontrakten er liten og stabil.

**Kildefiler:**
- `kilde/logikk-5x.js` og `kilde/grafikk-5x.js` er låste kopier av 5.6.2. Bygget stopper hvis de endres.
- `kilde/grafikk-2.js` er grafikken som utvikles, med samme blokknumre.
- Ny grafikkjerne skrives som moduler og pakkes med esbuild til én fil. `three` er da en ekstern global (r187).

## Steg og status
| # | Steg | Status |
|---|---|---|
| 1 | 2.0 på three.js r187 med overgangslag (`kompat-r187.js`) | ✔ 2.11. Tvilling 12/12, bildetest lik original |
| 1b | Rettet: elvas shader-tillegg traff ikke i r187 (også feil i testkopien `migrering/`). `verktoy/sjekk-shader.mjs` stopper nå bygget ved slike feil | ✔ 2.11. |
| 2 | Lysmodell for stil 2: sRGB-utdata og ACES-tonemapping. Gamle farger gjøres om til lineære i overgangslaget (`kompat-r187.js`, `EVN2_OVERGANG`), også farger som `draw()` endrer underveis. Egne shadere regner som før og gjøres om rett før utdata | ✔ 2.11. Tvilling lik. Bilder: `tester/resultater/skudd-fase1-lysmodell` (mer kontrast og riktigere lys, ellers samme uttrykk). Ytelse ikke målt på iPhone ennå |
| 3 | Himmel, døgn og tåke | **Vurdert: beholdes.** Himmelen i 5.6.2 er mer avansert enn prototypens. Den har sol og måne fra `skyClock`, stjerner som dreier, horisontfarge per biom, dalståke og dis mot sola. Den går nå i den nye lysmodellen. Fargene justeres til stil 2 sammen med Even ved G2 |
| 4 | Terreng for alle biomer fra `terrainH`/`groundH`/`biomeAt`, med teksturer fra prototypen | |
| 5 | Kamera (nært og fjernt), samme styring | |
| 6 | Robot-helten (GLB) med fem klipp | ✔ 2.11. `grafikk/helt.js`, pakket til `spill/grafikk2.js`.<br>• **Farge:** Modellen er uendret. Hovedfargen er gul (Evens valg 2.11, se beslutningen under).<br>• **Klipp:** Idle, Walking, Running, Jump og Punch velges ut fra fart, hopp og slag.<br>• **Høyde:** Den er ca. 80 som i 5.6.2.<br>• **Den gamle figuren** er usynlig rigg, og `R3.player.head` finnes fortsatt.<br>• **Våpen:** Våpen i høyre hånd er flyttet til robothånda, og lassoen starter fra robothånda.<br>• **Mangler (fase 3):** bue og skjold i venstre hånd, våpenstillinger og sekker (B2).<br>• **Til Even:** Det store hodet kan skjule litt av utsikten i nært kamera |
| 7 | HUD og startkort i ny stil | |
| 8 | Overgangsmaterialer for resten av objektene | |
| 9 | G1-kontroll: tvilling, gamle lagringer, funksjonstest, konsoll og CSP, ytelse på iPhone | |

## Testverktøy
- **`tester/tvilling.js`:** Sammenligner logikken i original og 2.0, 12 scener. Mutantene `mutant` og `mutant2` viser at testen virker.
  - Unntakene er begrunnet i koden og gjelder bare visuelle effekter: `g.parts`, `g.shake` og tilfeldige trekk inne i three.js.
- **`tester/spill-skudd.js`:** Tar bilder fra faste punkter (dag, kveld, natt, ovenfra) for original og 2.0, og regner ut forskjellen. Resultater ligger i `tester/resultater/skudd-*`.
- **`verktoy/bygg-spill.mjs`:**
  - kontrollerer logikken og de låste kopiene
  - kjører shader-kontrollen
  - skriver `spill/`

## Beslutning: robotens gulfarge (2.11.2026)
- **Valg:** Even valgte **B «klassisk robotgul»** (`#ffcc00`, sRGB) kl. 11:05. Testvisningen hadde også A «sitrongul» (`#ffe135`) og C «gyldengul» (`#f6d35b`), side om side i dag- og nattlys med samme kamera, bakgrunn og klipp.
  - Testvisning: `testvisning/robotfarge.html`. Bildene ligger i `tester/resultater/robotfarge/`.
- **Endring:** Bare fargen på materialet «Main» er endret (`grafikk/helt.js`, `FARGER`/`GUL`).
  - Den settes én gang ved lasting. Materialet deles av alle robotdelene, så det lages ingen kopier per bilde.
- **Årsaken til det oransje preget:** Det kom verken fra materialfargen, lyset eller ACES.
  - **Feil i overgangslaget:** Overgangslaget fargekonverterte robotens materialer **to ganger**. Det skjedde fordi GLB-en ble bygd med `add()` før den var merket som ny grafikk. Gul ble derfor mørk oransje, og grått ble nesten svart.
  - **ACES alene:** Med samme farge og målte dagslysverdier flytter ACES fargetonen litt mot gult og demper metningen. ACES gjør altså ikke fargen mer oransje.
  - **Rettet:** Overgangslaget gjør nå om nye objekter først når de henger i scenen, og hopper over alt som er merket `userData.evn2`.
- **Ikke endret:** Lyssetting, eksponering og tonemapping.
- **Kontroller:**
  - Tvillingen er 12/12 lik etter rettingen.
  - Ingen konsollfeil i spillet eller i testvisningen.
  - Alle 14 klipp lastes.
  - Bildene fra spillet ligger i `tester/resultater/robotfarge/spill-B.png` (dag, slag og natt).
  - **Ikke verifisert:** Om øksa sitter riktig i hånda, kan ikke avgjøres fra bildene. Det kontrolleres med et eget nærbilde fra siden før G1.

## Kontroll 2.11.2026 kl. 15–16: to kjøringer på samme gren
- **Hva skjedde:** Commitene 8d729a8 (12:24), 6d1fb43 (13:15) og 6a044d9 (13:56) har samme økt-ID.
  - Samme Claude Code-økt ble kjørt videre i to tråder i samme arbeidsmappe. Den ene tråden gjorde gressforsøket og robottesten. Den andre tråden visste ikke om det.
  - Nå kjører bare én prosess i mappa.
- **Commit 6a044d9:** Den har feil melding. Den inneholder **bare** arbeid fra den andre tråden:
  - `grafikk/helt.js`: våpenfestet er flyttet fra `Hand.R` (et mesh, ikke et ledd, så våpnene ble aldri flyttet) til leddet `Palm2.R` («Palm2R» etter GLTFLoader), med varsel hvis det mangler.
  - `spill/grafikk2.js` er bygget på nytt.
  - Ny test `tester/robot-animasjon.js`.
- **Fargetesten:** Fargetesten og den raskere fargesjekken var allerede committet identisk i 8d729a8.
- **Ingen tap:** Ingen arbeid er slettet eller tilbakestilt.
- **Robottesten avdekket en feil:**
  - **Feilen:** Ved raske bytter (står → går → løper) ble summen av klippvektene opptil 1,7. Årsaken er at `fadeIn`/`fadeOut` i three.js alltid starter fra 0 og 1.
  - **Rettet:** Vektene går nå mot målet fra dagens verdi og normaliseres (`grafikk/helt.js`).
  - **Testen er justert:** Den bruker `isScheduled`, fordi hopp og slag står stille på siste bilde og fortsatt påvirker stillingen.
- **Resultater (commit oppgitt under):**
  - `tester/robot-animasjon.js` er BESTÅTT. Den bruker klippene Idle, Walking, Running, Jump og Punch, uten rykk over 0,5 rad per bilde, og summen av vektene er ca. 1 i alle bilder.
  - Øksa sitter fast i hånda (samme avstand og vinkel gjennom hele slaget). Nærbilder: `tester/resultater/robot-animasjon/`.
  - **Merknad:** I slaget peker øksa oppover. Punch er et slag, ikke et hugg. Egen huggestilling kommer i fase 3.
  - Tvillingen er 12/12 lik (`tvilling-2.0-kontroll.json`).
  - `tester/fargekonvertering.js` er BESTÅTT.
- **Ved parallelt arbeid senere:** Bruk én `git worktree` og én gren per delarbeid, for eksempel `morkeskogen-2.0-gress`. Hver økt får sin egen mappe. Arbeidet slås sammen til `morkeskogen-2.0` etter at testene er kjørt. Hver gren eies av én økt.

## Målestokk for roboten (2.11.2026, til vurdering – ikke endret)
`tester/malestokk.js`. Rapport og bilder ligger i `tester/resultater/malestokk/`. Bare grafikken er skalert i testen (`R.rot.scale`).

**Mål i spillenheter:**

| Hva | Mål |
|---|---|
| Roboten (kropp uten våpen) | 80 høy; hodet 31 høyt og 48 bredt (39 % av høyden) |
| Gutten i 5.6.2 | 83 høy; hodet ca. 21 (25 %) |
| Hytte | vegg 40, takfot 41,5, totalt 72,5; **dør 28 × 16** |
| Trær (median) | gran 158, furu 145, løv 131, bjørk 139, kjempegran 318 |
| Dyr (eksempler) | elg 102, hjort 66, ulv 36, bjørn 50, hare 14 |

**Høyde på skjermen** (nært spillkamera, 960 × 540): robot 192 px mot gutten 193 px. Med fast kamera i tett skog: 174 mot 174.

**Vurdering:**
- **Høyden er ikke økt.** Roboten er like høy som gutten.
- **Inntrykket av størrelse** kommer av at roboten er mye bredere, særlig hodet.
- **Hytta er bygd liten i forhold til helten** allerede i 5.6.2. Døra er 28 høy mot en helt på ca. 80.
- **I tett skog trekkes nært kamera helt inn til helten** (kollisjonssjekk, ned til 16 % av avstanden). Da fyller helten skjermen. Det skjer også med gutten, og hører til kameraarbeidet i fase 1.

**Hvis størrelsen endres, må dette gjøres:**
- Sett `HOYDE` i `grafikk/helt.js`. Det er én verdi.
- Våpnene sitter i hånda og krymper sammen med roboten. Skal de beholde størrelsen, må våpenfestet skaleres tilbake (× 1/f).
- Logikken er uendret: treffsoner, fart, våpenrekkevidde og kollisjon. Rekkevidden til slaget blir da litt lengre enn armen ser ut.
- Kameraets siktehøyde (+40 til +45) og tekst over helten har faste høyder. De bør kontrolleres.
- Kjør `robot-animasjon.js`, `malestokk.js` og tvillingen på nytt.

## Beslutning: robotens størrelse 90 % (2.11.2026 kl. 20:31)
Even valgte 90 % etter sammenligningsbildene. Ivar godkjente endringen.
- **Gjennomført:** `STORRELSE = 0.9` i `grafikk/helt.js`. Roboten er 72 høy (var 80). Gutten i 5.6.2 var 83.
- **Uendret:** proporsjoner, modell, animasjoner og gulfarge.
- **Ikke endret i spillogikken:** kollisjon, fart, rekkevidde, interaksjonsavstander og lagring. Tvillingen er 12/12 lik (`tvilling-2.0-robot90.json`).
- **Kontroller:**
  - **Føttene:** Laveste punkt ligger 0,0 over bakken.
  - **Animasjon:** `robot-animasjon.js` BESTÅTT. Ingen rykk, vektsum ca. 1, og øksa sitter fast i hånda.
  - **Våpnene:** Våpenfestet regnes ut fra håndas verdensskala, så våpnene har samme størrelse som før (krymper ikke med roboten).
- **Rekkevidde:**
  - Øksebladet når 37 enheter ut fra heltens midtpunkt i slaget. Logikkens rekkevidde er 95, målt fra midtpunkt til midtpunkt med en bue på 1,3 rad, og den er uendret.
  - Det kan se ut som øksa treffer litt utenfor armen, særlig mot små mål. Tilsvarende måling for gutten i 5.6.2 er **ikke** gjort.
  - Logikken er ikke endret. Eventuell justering krever eget mandat.
- **Tekst over helten** (`g.fx`) starter ca. 115 over bakken, altså over hodet både før og nå. Siktepunktet til nært kamera (+40 foran helten) og startpunktet for kollisjonsstrålen (+45) er beholdt. Begge ligger under hodehøyden til både gutten og roboten.

## Kameraforsøk: trær gjør ikke kameraet kortere (til vurdering, ikke låst)
- **Bakgrunn:** I 5.6.2 trekkes nært kamera inn mot helten (ned til 16 % av avstanden) når et tre står mellom kameraet og hodet. I tett skog fyller helten da hele skjermen.
- **Forslaget (`grafikk-2.js`, `EVN2_KAM_TRAER`):**
  - Trær gjør ikke lenger kameraet kortere. Trær mellom kameraet og helten, og trær rett ved kameraet, tones ned til 30 %.
  - Terreng, hytter, bygninger, murer, slottet og kjempegraner trekker fortsatt kameraet inn, som før.
  - Kameramodusene (bak og ovenfra), mus, zoom og C-tasten er uendret.
- **Kostnad:**
  - Et tre som noen gang står i veien, får sine egne gjennomsiktige materialkopier én gang. De bruker samme shaderprogram.
  - Når treet ikke står i veien, får det de vanlige materialene tilbake.
- **Bryter:** `#kamera=original` i adressen gir 5.6.2-oppførselen.
- **Resultat** (`tester/resultater/kamera-ny/AB-*.png`, 960 × 540):

  | Kamera | Robotens høyde i tett skog |
  |---|---|
  | Som 5.6.2 | 1 257 px (bare bryst og hode synes) |
  | Nytt | 169 px, samme som på åpen mark |

  Ved hytta, bålet, i nattkamp og ovenfra er det ingen vesentlig forskjell.
- **Ikke testet:** Følelsen når man spiller (jevnhet når trær tones inn og ut) og ytelse på iPhone.

## Kamera med gjennomsiktige trær – godkjent som foreløpig løsning (Ivar 2.11 kl. 21:02). Låses ved G1.
**Endret etter godkjenningen (`kilde/grafikk-2.js`):**
- **Hvilke trær tones ned:** Bare trær som faktisk står i veien. Avstanden fra treets akse til hele siktlinja (fra hodet til kameraet) regnes eksakt, i stedet for i 14 punkter. Da faller tynne trær ikke inn og ut. Linja må gå under tretoppen, og det er litt ekstra rom rett ved kameraet.
- **Toning:** Mål 30 %. Treet tones ned med 7/s og opp igjen med 3,5/s, og holdes nede i 0,6 s etter at det sist stod i veien. Det hindrer blinking ved kanten.
- **Utenfor synsfeltet:** Et tonet tre får straks vanlig utseende igjen. Ellers dukket det opp halvt gjennomsiktig.
- **5.6.2-regelen er slått av i ny modus:** I 5.6.2 forsvinner trær foran helten helt (`visible = false`). Det ville gitt blink.
- **Uendret:** Kollisjon mot terreng, hytter, bygninger, murer, slottet og kjempegraner.
- **Bryteren:** `#kamera=original` eller `#kamera-original` (og `sessionStorage evnKamera` i testkopien) gir 5.6.2-kameraet.

**Test (`tester/kamera.js`, BESTÅTT, headless):**

| Scene | Tonet maks/snitt | Blink | Tonet uten å stå i veien | Kameraavstand min (ny / 5.6.2) | Tegnekall (ny / 5.6.2) |
|---|---|---|---|---|---|
| Tett skog (gå, løpe, snu kameraet, sidesteg) | 11 / 6,1 | 0 | 0 | 1,00 / 0,16 | 2 751 / 2 734 |
| Ved hytte | 0 / 0 | 0 | 0 | 0,78 / 0,78 (hytta trekker fortsatt inn) | 3 204 / 3 129 |
| Nattkamp (fire monstre, seks slag) | 3 / 3 | 0 | 0 | 1,00 / 0,16 | 3 190 / 2 988 |
| Ovenfra | 3 / 1,8 | 0 | 0 | 1,00 / 0,16 | 1 523 / 1 176 |

**Sortering og GPU:**
- **Tegnekall:** Toningen gir ingen ekstra tegnekall, fordi treet bytter material og ikke får flere mesher. Forskjellene i tegnekall kommer av at kameraet står lenger unna og ser mer.
- **Materialkopier:** Hvert tre som noen gang står i veien, får én gjennomsiktig materialkopi (samme shader).
- **Ekstra GPU-arbeid:** Gjennomsiktige piksler for 3–11 trær, ingen dybdeskriving for dem. Ingen sorteringsfeil er sett på bildene. Krone og stamme i samme tre kan i teorien tegnes i feil rekkefølge, men det er lite synlig ved 30 %.
- **Ytelse på iPhone:** Ikke målt ennå.

**Kjent begrensning:** Bare trær som dekker linja til **hodet**, tones ned. En bred løvkrone ved siden av linja kan fortsatt dekke beina eller kroppen.

## Øksas synlige rekkevidde (`tester/oks-rekkevidde.js`)
| | Øksebladet lengst ut fra heltens midtpunkt | Logikk |
|---|---|---|
| 5.6.2, gutten | 28,4 | rekkevidde 95, bue 1,3 rad |
| 2.0, roboten 90 % | 37,1 | uendret |

- Roboten når altså **lenger** enn gutten. Avstanden mellom det man ser og logikkens rekkevidde er mindre enn i 5.6.2.
- Logikken er ikke endret.

## Testkopi for iPhone
- **Lenke:** https://claude.ai/artifact/LeDf7MXuTKqDqCwAXtNYX5
- **Bygging:** Den bygges med `verktoy/lag-testkopi.mjs`.
- **Innhold:** Ingen statistikk. Egen nettleserlagring, så ekte lagringer berøres ikke.
- **Testpanel:** Bytt kamera, FPS, tegnekall og antall tonede trær, pluss knappen «Mål 60 s».
