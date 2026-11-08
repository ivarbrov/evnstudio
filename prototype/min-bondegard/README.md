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
