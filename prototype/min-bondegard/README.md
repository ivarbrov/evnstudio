# Min Bondegård – grafisk testscene

Status: prototype, ikke spill. Ingen spillogikk, lagring, statistikk eller musikk. Skal ikke publiseres.

- 0.1.0 (commit 18e7220): tre stilretninger (A/B/C), enkle primitive former.
- 0.2.0: ny modellering etter Evens tilbakemelding om at grafikken skal ligne mer på Hay Day.
  - Låve med gambreltak, takstein, plankevegger, steinfot, kantlister, port med X-avstivning, vinduer med sprosser, høyloftsluke, takrytter med vindfløy og lykter.
  - Hønsehus på stylter med takstein, rampe, reirkasse, hjerte i gavlen og løpegård med netting. Tre avrundede høner som går, hakker og blunker.
  - Seks åkre med furet jord og trerammer: nysådd, spirer, grønn hvete, moden hvete, grønn mais og moden mais.
  - Markedsbod med stripet markise, eggkurv, brød, hvetebunt, fruktkasser og skilt.
  - Terreng med åser og elv, løv- og grantrær, busker, steiner, gresstuster, blomster, gjerder, grusvei, høyballer og tønne.
  - Teksturer (planker, takstein, jord, gress, grus, høy, netting) lages i nettleseren. Ingen eksterne bilder.
  - Lys: varm sol med myke skygger, himmelgradient, ACES-tonemapping. Dag, kveld og regn.
  - Kvalitet: «Høy» og «Mobil» (oppløsning, skyggekart, mengde gress og blomster). `?kval=hoy|mobil`.
- Faste deler av byggene slås sammen per materiale, og vegetasjonen er samlet geometri eller instanser, for å holde tegnekallene nede.
- Robot: `ecoins/helt-robot-v2.glb` (gjenbruk), med stråhatt. Klippene `Idle`, `Walking`, `Yes`, `Sitting`, `ThumbsUp`, `Wave` og `Dance` brukes.

Åpne lokalt fra en webserver i repoets rot, for eksempel `python3 -m http.server`, og gå til `/prototype/min-bondegard/`.
- 0.3.0: målrettede forbedringer av 0.2 (samme retning, ikke nytt redesign).
  - Vegetasjon: skogholt med fire tretyper (løv, gran, bjørk, epletre), busker langs gjerdet (runde, blomstrende, bær), sopp, nøkkeroser på elva, gress i klynger i stedet for jevnt mønster, blomster i fargeklynger og myke kontaktskygger under trær og bygg.
  - Dyr: hønene har kinn, øyelokk og glimt i øynene. De blunker, flakser med vingene, blir nysgjerrige på roboten, hopper og viser hjerte når du trykker eller roboten klapper. Høna har to kyllinger som følger etter henne.
  - Detaljer: markedsboden har vimpler, prisskilt, blomsterpotter, sekker og krakk. Hønsegården har port med skilt, eggkurv, fôrsekk, bøtte og halm. Ved låven står trillebår med høy, høygaffel, melkespann og blomster i vinduskassene.
  - Lys: uten ACES-tonemapping (den vasket ut de grønne fargene). Lysstyrken er kalibrert på nytt, med mettere bakke og mørkere bakkelys for mer dybde.
  - Ytelse:
    - Vegetasjonen er delt i ruter på 18 × 18 m, så det som er utenfor bildet ikke tegnes.
    - Trær langt unna har enklere geometri (LOD).
    - Enkle fargematerialer slås sammen til vertexfarger, slik at hver gruppe blir ett tegnekall.
    - Høner og kyllinger slås sammen per kroppsdel.
    - Jorda i alle åkrene er én mesh.
    - Små avlinger kaster ikke skygge, og avlingene har billigere geometri.
    - Bakken har færre polygoner.
    - Mobil bruker enklere skyggefiltrering.
    - Oppløsningen tilpasser seg automatisk: den går ned i trinn når bildefrekvensen faller under 50, og opp igjen over 58. `?fast` slår dette av.
  - `__testscene.profil()` måler kostnad per kategori.
- 0.3.1: rettinger etter Evens test.
  - Stråhatten er festet til robotens hodeledd og følger nå alle hodebevegelser.
  - Benken har fått robotens størrelse. `Sitting`-klippet ender med hoften 0,32 m over bakken, så det gamle setet på 0,58 m var for høyt. Roboten går rundt foran benken, snur seg, setter seg (klippet spilles én gang og blir sittende) og går ut foran benken igjen.
  - Reven Nysgjerrig står i skogkanten utenfor gjerdet. Modellen er gjenbrukt (`prototype/figurer/rev/rev.glb`), og han er ikke spillbar. Trykk på ham, så vinker han og sier hei. Roboten går også bort og vinker til ham.
- 0.4.0: landskap og utvidelse (samme grafiske retning, låve, åkre, bygg og robot er uendret).
  - Elva: bredden varierer på hver side, og kanten har små odder og viker. Vannet har egen shader: fargen følger den faktiske dybden (lyst grønnblått ved kanten, mørkere blått der det er dypt), strømmen og små glimt er animert, himmelen speiles svakt, og kanten har et lyst skumbånd. Terrenget går mykt ned i vannet med fuktig strand, stein, siv, dunkjevle og nøkkeroser. På gårdssiden ved x ≈ 4 er det en flat strand der en brygge kan bygges senere.
  - Trær: hver krone er én sammenhengende flate med myke lapper og bladklaser i stedet for sammensatte kuler. Løvnormalene er myke, så lyset faller jevnt over kronen. Det finnes eik, rundt løvtre, bjørk, gran (dreieflate i takkete lag), epletre og ungtre, i flere varianter og størrelser. Trærne står i grupper med åpne gressletter mellom, og de står ikke inni hverandre.
  - Utvidelsesområder (bare visuelt): område 2 «Skogkanten» (nivå 10, 1 500 mynter) og område 3 «Elvebredden» (nivå 18, 6 000 mynter). Områdene er gjengrodde, med trær, busker, stubber, en veltet stokk og stein. Grensen er en svak lys stripe med små stikker, og hvert område har et «Til salgs»-skilt med nivået. Trykk på området eller skiltet viser navn, nivå og pris, og grensen lyser gult. Det finnes ikke noe kjøpssystem.
  - Landskap: skogholt rundt hele gården, og skog på åsene langt unna (instansert, to tegnekall, uten skygge).
  - Ytelse: krone- og grangeometri lages én gang per variant og gjenbrukes. Trær nær gården har finere geometri enn trær langt unna. Bare vegetasjonsruter nær gården kaster skygge. Vannanimasjonen ligger i shaderen og krever ingen oppdatering av geometrien.
- 0.4.1: bildekvalitet, måling og meny. Ingen grafiske endringer.
  - Den gamle automatikken senket oppløsningen hver gang vist bildefrekvens var under 50 b/s, ned til 0,75×. Når nettleseren eller mobilen holder siden på 30 b/s, endte det alltid på 0,75×, og derfor ble bildet mykt. Automatikken er fjernet.
  - Ny «Auto» måler hvor lang tid ett bilde tar å tegne (render + `readPixels`, uavhengig av rAF). Den velger høyeste oppløsning under 14 ms, ellers under 28 ms, og går ikke under 1,0× med mindre ett bilde tar over 40 ms. Oppløsningen kan også velges manuelt (0,75×–2×, opp til `devicePixelRatio`).
  - Bildefrekvensen måles med rå rAF-intervaller. Før ble intervallene kappet ved 50 ms, så «1 % lav» kunne aldri vise under 20.
  - «Mål ytelse» måler vist bildefrekvens, den samme siden med tom scene (for å se om grensen ligger utenfor prototypen) og kapasitet per oppløsning. Den måler også skygge hvert 2. bilde og viser GPU. Resultatet kan kopieres.
  - På Mobil tegnes skyggekartet hvert 2. bilde, og alltid når kameraet flyttes. `?helskygge` slår dette av.
  - Testmenyen kan legges sammen, og den er lagt sammen fra start på mobil og i stående format. «Mål ytelse» og en liten bildefrekvensvisning er alltid synlige.
- 0.4.2: løpegården var åpen bak, mot hønsehuset. Den er nå lukket med netting, og en smal sluse fører fra åpningen opp til rampa og døra.
- 0.4.3: målingen er presisert. Ingen grafiske endringer.
  - Standard er nå fast oppløsning: Mobil 1,0×, Høy min(dpr, 2). Auto er et frivillig forsøk som bare kjøres når det velges. Fast oppløsning endres aldri underveis.
  - «Synkron tegnetid» er tiden for `render()` + `readPixels(1 px)`. Den inkluderer CPU, GPU og ventetid for synkronisering, og er ikke ren GPU-tid. GPU-tid måles med `EXT_disjoint_timer_query_webgl2` der nettleseren har utvidelsen.
  - Auto bruker ikke synkron tegnetid alene. En høyere oppløsning må også gi minst 90 % av den viste bildefrekvensen ved 1,0×.
  - «Mål ytelse» måler vist b/s, synkron tid og GPU-tid ved 1,0×, 1,5× og 2× med samme kamera, og viser tegneflate og skala mot dpr. Testen med tom scene omtales som en indikasjon.
