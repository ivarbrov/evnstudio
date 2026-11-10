# Min Bondegård

Evens gårdsspill. Hay Day er kvalitetsreferanse for spillopplevelsen, men innhold og grafikk er våre egne.

- Plan: `claude/min-bondegard-spillbar-1-10-plan.md` (prosjektfil). Progresjon og tall: `claude/min-bondegard-progresjon.md`.
- Grafisk referanse og tilbakefall: testscene 0.7.4 på grenen `prototype/min-bondegard-testscene` (`prototype/min-bondegard/`). Den er ikke endret.
- Ikke publisert. Publisering krever voksen godkjenning av konkret versjon.

## Filer

| Fil | Innhold |
|---|---|
| `index.html` | Verden fra testscene 0.7.4 (terreng, bygg, dyr, robot, rev), grensesnitt, felles pause, nullstilling og feilkort |
| `data.js` | Alle tall for nivå 1–10: avlinger, dyr, oppskrifter, bygg, XP, lager og priser. Én kilde for spillet, testene og simuleringen |
| `logikk.js` | Spillreglene uten grafikk: plante, høste, mate, produsere, selge, nivå, tid og lagring |
| `spill.js` | Kobler reglene til verden: åkre og bygg som kan flyttes, robotens jobber, handlingskort, lager og markedsbu, opplæring |

## Tester

- `node test/min-bondegard/logikk.test.mjs`: spillreglene, tallene, lagring og tid (planens beslutning B1).
- `node test/min-bondegard/sim.mjs`: simulering på de ekte reglene. Måler tid til nivå 2–4, fastlåsing og venting.
- `node test/kjor.mjs`: felles røyktest (start, pause, versjon, CSP, ingen feil).

## Lagring

`evn-min-bondegard-v1` i `localStorage`, format `{v: 1, seq, sist, nivaa, xp, mynter, lager, akre, dyr, bygg, plasser, oppl, stat}`.
- Alle jobber har en fast slutt-tid. De blir ferdige mens spillet er lukket (planens beslutning B1), og venter til spilleren henter dem.
- Ting som hentes, fjernes fra tilstanden. Derfor kan ingenting hentes to ganger, uansett omlasting.
- Går klokka bakover, blir ingen ventetid lengre enn jobben selv.
- `seq` øker ved hver lagring. Har en annen fane lagret nyere fremgang, tas den i bruk.
- Ødelagt lagring, eller lagring fra en nyere versjon, tas vare på i `evn-min-bondegard-v1-kopi`. Den forrige kopien flyttes til `-kopi2`. Spillet starter en ny gård.
- `?test` i adressen gir egen lagring (`evn-min-bondegard-test`) og viser testmenyen fra testscenen.

## Versjoner

- **0.8.10** (ikke publisert): Benken står inntil låven, til venstre for gårdsveien, og ikke alene mellom veien og åkrene (Ivar 10.11). Robotens tur til benken er endret tilsvarende.
- **0.8.11** (ikke publisert): Rettinger etter QA av 0.8.9. Pause midt i et høste-drag gir ikke lenger feilkortet, og et slipp etter pausen høster ikke noe. Drar man frøet ut fra «Plant», plantes den valgte åkeren først, og åkre som lå skjult bak kortet, plantes ikke før fingeren har vært utenfor kortet.
- **0.8.12** (ikke publisert): Nivåtallet står midt i stjernen på alle enheter (stjernen er en tegnet form, ikke tegnet ★). Forslag til ny natur ligger bak `?tre=puff` og er ikke standard: løvdotter, roligere gress, lysere gran. På mobil kaster bare hovedklasene i kronen skygge (tiltak 1 etter måling på iPhone 10.11).
- **0.8.13** (ikke publisert): Bare testverktøy (`?test`). «Full gård» hang i evig løkke i spillet, fordi åkre og beiter ikke er bygd på forhånd. Langtesten viser treform og om kravene fra Ivar 10.11 er oppfylt (snitt ≥ 58, 1 % lav ≥ 45, hakk < 0,5 %).
- **0.8.14** (ikke publisert): Reven heter Rebus i Min Bondegård (Even 10.11). Før het han Nysgjerrig. Bare tekst er endret.
- **0.8.15** (ikke publisert): Korte meldinger («Mens du var borte …») legger seg under revens tips i stedet for oppå det.
- **0.9.0** (ikke publisert): Fase 2, nivå 3–5.
  - Bestillingstavle på nivå 4 med 3 bestillinger. Bestillingene ber bare om varer spilleren kan lage (F5), kan byttes gratis, og spillet foreslår bytte etter 15 minutter.
  - Lastebilen fra Elvedal kjører inn, laster og kjører ut. Mynter = 1,6 × verdi. XP = 0,6 × verdi^0,85, minst 3.
  - Erter på nivå 5 (3 frø, 2 min). 12 åkre fra nivå 5.
  - Lagringen har fått feltet `best: {nr, fro, liste[{id, varer, mynter, xp, siden}]}` og `stat.levert`. Formatet er fortsatt `v: 1`. Eldre lagringer får bestillinger når de lastes.
  - Toppfeltet tilpasser seg antall knapper. Nytt: knappen 📋 og tasten T.
  - E-coins på nivå 5 er ikke med. Beløpet er ikke godkjent (B2), og milepælen må inn i den felles regeltabellen.
- **0.9.1** (ikke publisert): Rettinger etter QA av 0.9.0. 📋-knappen er skjult før nivå 4. Bestillingene er lesbare på smale skjermer. Meldingen etter levering vises over dialogen. To raske trykk sender ikke to bestillinger. Fokus går til neste «Send». Tilfeldige bestillinger regnes med heltall (`Math.imul`). Med redusert bevegelse kjører ikke lastebilen over skjermen.
- **0.9.2** (ikke publisert): Lastebilen kjører saktere (høyst 8–9 m/s). Etter ett trykk på «Plant» står kortet klart på nærmeste tomme åker, så det går fort å så to sorter om hverandre (Ivar 11.11).
- **0.8.9** (ikke publisert): Rettinger etter QA av 0.8.7 (`qa/rapporter/2026-11-10-min-bondegard-7270d54.md`):
  - Et drag fra «Plant» begynner først etter 12 px, så et skjelvende trykk planter den valgte åkeren. Kortet lukkes så snart draget begynner, så ingen åker plantes i skjul bak det.
  - Pausen avbryter et drag.
  - Raske sveip sjekker også punktene mellom to bevegelser.
  - Flytting fra gamle standardplasser skjer én gang, styrt av et flagg i lagringen (`plasser.std`) i stedet for å sammenligne koordinater.
- **0.8.8** (ikke publisert): Ivar 10.11: Siloen står nærmere tunet (1,0; −8,4), og en silo på forrige standardplass flyttes dit. Gårdsveiene er egne flater med rette, myke kanter. Før var kantene trappete, fordi sandfargen lå i terrengnettet.
- **0.8.7** (ikke publisert): Rettinger etter QA av 0.8.5 (`qa/rapporter/2026-11-09-min-bondegard-21841a2.md`). Roboten blir stående når alle venteturene er sperret av bygg. Handlingskortet holder seg innenfor skjermen i liggende format. Revetipset dekker ikke myntene på 375 px. Lagringsavsnittet nevner `-kopi2`.
- **0.8.6** (ikke publisert):
  - Dra for å plante og høste (Even 10.11). Dra «Plant» fra handlingskortet ut over tomme åkre, eller trykk på en moden åker og dra over de andre. Et vanlig trykk høster fortsatt alt som er modent.
  - Ny plassering (Ivar 10.11): siloen står der fôrkverna sto, mellom låven og hønsehuset. Fôrkverna står foran låven, og bakeriet står på den åpne plassen ved markedsbua. Rundballene ved låven er tilbake. Bygg på gammel standardplass flyttes til den nye.
- **0.8.5** (ikke publisert): Rettinger etter EVN Game QA av 0.8.3 (`qa/rapporter/2026-11-09-min-bondegard-f385c5f.md`):
  - T2: pausen lukker åpne kort og dialoger før den åpner, og Esc rører ikke det som ligger under pausen.
  - Robotens ventetur går rundt hindringer på hver strekning, også veien ut fra benken. Turer til steder der spilleren har satt et bygg, hoppes over.
  - Lageret kuttes til plassen i silo og låve ved innlasting.
  - De to siste uleselige lagringene tas vare på (`-kopi` og `-kopi2`).
  - Feilkortet sier ikke lenger at gården er lagret før noe er lagret.
  - Revetipset ligger under HUD på 320 px.
- **0.8.4** (ikke publisert): Ting som flyttes, kan dras med finger eller mus. Før flyttet dra-bevegelsen kameraet, og bare trykk flyttet tingen (Even 9.11).
- **0.8.3** (ikke publisert): Rettinger etter EVN Game QA av 0.8.0 (`qa/rapporter/2026-11-09-min-bondegard-d582ecd.md`):
  - F3: ødelagt lagring tas alltid vare på i kopien.
  - K2: feilkortet vises også før Start og ved avviste løfter.
  - B3: uten WebGL sier startkortet at 3D ikke virker.
  - T2: Esc lukker kort og dialoger før pausen.
  - «Mens du var borte»-meldingen virker, urimelige lagertall kuttes, og revetipset havner ikke over HUD på smale skjermer.
  - XP vises i handlingskortene, og trykk på XP-stjerna viser hva som gir XP (Even 9.11).
  - Siloen står ved låven der rundballene sto (Ivar 9.11). Rundballene er tatt ut av spillet.
- **0.8.2** (ikke publisert): Bingene for ku, gris og sau er ikke ferdig bygd fra start (Ivar 9.11). De kommer som større dyrehus som spilleren bygger: fjøs og beite på nivå 6, grisebinge på nivå 10. Ny byggemeny (🔨, tast B) viser hva som er bygd, hva som kan bygges, og hva som kommer på neste nivå (Even 9.11).
- **0.8.1** (ikke publisert): Roboten finner veien rundt bygg, gjerder og binger og går ikke lenger gjennom gjerdet ved hønsegården (Even 9.11). Den kan gå over åkrene og gårdsveien. Mobil i høykant starter med hele tunet i bildet.
- **0.8.0** (fase 1, ikke publisert):
  - Spillbar kjernesløyfe for nivå 1–3: hvete og mais, høner og egg, fôrkvern, bakeri (kjøpes for 50), silo og låve, markedsbu, mynter, XP og nivåer.
  - Produksjonen fortsetter mens spillet er lukket.
  - Åkre, fôrkvern, bakeri og silo kan flyttes innenfor gården (planens beslutning B3).
  - Opplæring i fem steg med Rebus.
  - Felles pause (EVN-PAUSE v2) og statistikk (`evn-start`).
  - Kjente begrensninger:
    - Bestillinger og lastebil kommer i 0.9.0.
    - Låven, hønsehuset og markedsbua kan ikke flyttes ennå.
    - Ytelse på iPhone er ikke målt for spillversjonen.
