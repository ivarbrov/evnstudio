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
