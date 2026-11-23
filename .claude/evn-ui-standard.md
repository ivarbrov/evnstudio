# EVN UI-standard

Versjon 1.1 (forslag), 7. november 2026. Bygger på 1.0 (revidert 4. november 2026, `.claude/vedtak.md` kl. 10:02) og eierens beslutning om felles meny og styring 7. november 2026 (`.claude/vedtak.md`). Den felles Roblox-inspirerte retningen er godkjent som designprinsipp. Ordlyden i 1.1 er skrevet av Claude Code og godkjennes av eieren når PR #18 slås sammen. Den er ikke slått sammen med `main` ennå.

Standarden gir felles betjening, navigasjon og symboler på tvers av spillene på evnstudio.no. Målet er at et barn som kan ett EVN-spill, raskt forstår de andre.
Grunnregel: Lik funksjon har lik betjening, likt symbol og samme plass. Ulik spillmekanikk kan ha ulik betjening.
Grunnlag: kartleggingen av Era Defenders 0.21.0, Mørkeskogen 2.0.0, Fossil Zoo 0.8.0, Dyrepatruljen 0.11.0 og Magiske egg 0.9.0. Den er gjort på `main` abca738 og kontrollert på nytt mot `main` ff61022 4. november 2026, uten endringer i spillkoden.

## Forhold til EVN Game Standard og UI1–UI10

Denne standarden lager ingen egne versjoner av krav som allerede finnes. Hvert KS-krav har én av tre roller:

- **Presiserer:** kravet sier *hvordan* et eksisterende krav skal oppfylles likt i alle spill. Det eksisterende kravet gjelder uendret og står over.
- **Tar i bruk:** kravet gjør en del av UI1–UI10 gjeldende for nye spill. For eksisterende spill har UI1–UI10 samme status som før: godkjent hovedløsning.
- **Nytt:** kravet finnes ikke fra før.

Har et krav både en presisering og en ny del, står begge i kolonnen «Rolle».

Ved motstrid gjelder EVN Game Standard. Fra 1.1 er ☰ Meny (UI3) pauseinngangen i alle spill, og KS1, KS2, KS4 og KS5 er skrevet om etter det. Motstrid som er funnet og løst, står i avsnittet «Motstrid som er løst i 1.1».

## Hvordan kravene gjelder

| Spill | KS1–KS15 | Kontrollstatus |
|---|---|---|
| Nye spill | Gjelder fra første versjon | Rådgivende. EVN Game QA rapporterer brudd, men de stopper ikke publisering |
| Eksisterende spill | Gjelder når trinnet i planen som innfører kravet, er godkjent og publisert | Rådgivende. Brudd før det rapporteres som forbedringsforslag |

Ingen krav i denne standarden er publiseringsblokkerende. `test/publiseringssjekk.mjs` leser bare `.claude/evn-game-standard.md`, og blokkerende kontroller derfra gjelder som før. Et KS-krav kan bli blokkerende først når to ting er på plass: kontrollen er prøvd på minst ett spill, og en voksen har godkjent kravet særskilt. Det skjer da ved å flytte kravet inn i EVN Game Standard. Ingen eksisterende kontroll svekkes.

## Felles krav (KS1–KS15, obligatoriske for nye spill, rådgivende i kontrollen)

| ID | Krav | Rolle | Kontroll |
|---|---|---|---|
| KS1 | P og Esc åpner og lukker menyen, og spillet står stille. ☰ Meny står oppe til venstre (KM1). Menyen er pausen. *(Endret i 1.1: før ⏸ oppe til høyre.)* | Presiserer F1, UI10. Tar i bruk UI3 | A |
| KS2 | Spill med kart: M og 🗺️ åpner kartet. 🗺️ er snarvei oppe til høyre (KM2) og rute i menyen. *(Endret i 1.1.)* | Presiserer B2 | A |
| KS3 | «🎮 Slik styrer du» står i pausen og viser bare det som faktisk virker, for inndataen som brukes nå. | Presiserer U2 | Q |
| KS4 | Vei ut: 🚪 Avslutt står i ☰ Meny og på alle skjermer der spilleren kan bli stående (valgskjermer, tap, seier). Under spilling står Avslutt ikke i HUD. Avslutt bruker felles `#evnAvslutt` og `#evnSporsmal`. *(Endret i 1.1 etter eierens valg «Bare i ☰ Meny».)* | Presiserer U1 og F1. Nytt: tap- og seiersskjermer | A, Q |
| KS5 | Plassering under spilling: ☰ Meny oppe til venstre, status øverst i midten og høyst to snarveier oppe til høyre (KM1, KM2, KM5). Plasseringen er den samme på alle skjermstørrelser. *(Endret i 1.1: før Avslutt, ⏸ og 🗺️ fra høyre hjørne.)* | Nytt. Endrer plasseringen i UI5 | A |
| KS6 | Ett symbol har én betydning i alle spill (ikonordboka). | Nytt (støtter U2, U3) | Q |
| KS7 | Esc lukker det øverste som er åpent: dialog, kart, undermeny eller valgskjerm. Er ingenting åpent, åpner Esc pausen. Alt som lukkes med Esc, har også en synlig lukkeknapp. | Presiserer UI10 | A |
| KS8 | Esc, P, M og Tab brukes aldri til noe annet. Tab flytter bare fokus. L slår lyden av og på. | Presiserer T2 | A |
| KS9 | Spill med lyd har en lydbryter 🔊/🔇 i pausen og tasten L. Valget huskes i spillet. | Presiserer B1 | A, E |
| KS10 | Avslutt og sletting bekreftes med felles dialog, ikke med «trykk to ganger». | Presiserer F2 (sletting). Nytt: bekreftelse ved Avslutt | A |
| KS11 | Lagringen er automatisk, Avslutt lagrer før spillet forlates, og det finnes ingen lagre-knapp. | Presiserer F2 | A |
| KS12 | Dialoger: fokus flyttes inn, holdes inne (`inert`) og settes tilbake ved lukking. Fokus er synlig med `:focus-visible`. | Presiserer T2 | A |
| KS13 | Faste elementer bruker `env(safe-area-inset-*)`, og viewport har `viewport-fit=cover`. | Tar i bruk UI7 (safe area) | A, E |
| KS14 | Oppsettet for mobil eller PC følger siste inndata og kan bytte tilbake. | Tar i bruk UI1 | A |
| KS15 | Uventet feil gir den felles meldingen (EVN-FEIL) med «Last inn på nytt». | Presiserer K2 | A |

## Felles meny og styring (KM1–KM13, ny i 1.1)

Gjelder som KS-kravene: obligatorisk for nye spill, rådgivende i kontrollen, og for eksisterende spill når trinnet som innfører kravet er godkjent og publisert. KM6–KM8 er prinsipper: avvik som spillmekanikken krever, begrunnes i spillets plan. Endringer i styring og kamera prøves av Even før de tas i bruk.

Prinsippskisse for 3D-spill med fri bevegelse (plassering og hierarki, ikke ferdig design):

```
┌────────────────────────────────────────────┐
│ [☰ Meny]       [status]        [🗺️] [🎒]   │
│                                            │
│          spillverden – dra for kamera      │
│                                     [Bruk] │
│  (styrespak)     [1][2][3][4][5]    (HOPP) │
└────────────────────────────────────────────┘
```

| ID | Krav | Rolle | Kontroll |
|---|---|---|---|
| KM1 | **☰ Meny** står oppe til venstre innenfor safe area, med ☰ og teksten «Meny» (bare ☰ når skjermen er smalere enn 400 px). Minst 48 × 48 px. Det er den eneste inngangen til alt som ikke trengs hele tiden. Knappen skjules når en meny eller dialog er åpen. | Tar i bruk UI3. Nytt: plassering | A |
| KM2 | **Snarveier:** høyst to, oppe til høyre: 🗺️ kart og 🎒 sekk eller 📖 samling, bare når spillet har dem. E-coins, innstillinger, lyd, verdensvalg og Avslutt er aldri snarveier. | Presiserer UI3. Eierens valg 7.11.2026 | A |
| KM3 | **Menyinnhold i fast rekkefølge**, bare det spillet har: ▶ Fortsett (størst, først), 🎮 Slik styrer du, 🔊/🔇 Lyd, 🗺️ Kart, 🎒/📖 Sekk eller samling, spillets egne (for eksempel 🌍 Velg verden), ⚙️ Innstillinger, 🛒 E-shop, 👕 Garderobe, 🚪 Avslutt. Rutenett med ikon og kort tekst. E-coins-saldoen vises i menyen (KA8). Lukkes med ✕, Esc, P eller Fortsett. | Presiserer UI3, UI10, KS3, KS9 | A, Q |
| KM4 | **Avslutt** står i menyen, ikke i HUD under spilling (se KS4). Avslutt går tilbake til evnstudio.no etter felles bekreftelse (KS10). | Presiserer KS4 | A |
| KM5 | **Status** står kompakt øverst i midten: bare det spilleren må følge med på hele tiden. Midlertidige meldinger står under den. | Endrer plasseringen i UI5. Eierens valg 7.11.2026 | Q, V |
| KM6 | **Mobil, 3D med fri bevegelse:** styrespak nede til venstre (fast eller startet i nedre venstre sone, KA3). Hopp nede til høyre og størst (minst 80 px). I spill uten hopp står hovedhandlingen der. Kontekstbasert Bruk-knapp over eller til venstre for hopp, synlig bare når den kan brukes (UI4). Hurtigfelt nede i midten når spillet bruker utstyr. Dra utenfor styrespaken og knappene for kamera (KA5). Alt annet ligger i menyen. Knapper overlapper ikke hverandre eller viktige spillobjekter (UI7, UI8b). | Presiserer UI2, UI4, KA3–KA5 | A, E, V |
| KM7 | **2D-, strategi- og byggespill:** samme hjørner for ☰ Meny, status og snarveier (KM1, KM2, KM5). Retningsstyring nede til venstre, handlinger nede til høyre, byggepanel eller hurtigfelt nede i midten. Markering med mus eller finger der spillet bygger eller velger. Resten tilpasses mekanikken. | Nytt | Q, V |
| KM8 | **PC-taster**, så langt det passer: se tastetabellen under. Esc, P, M, L og Tab brukes aldri til noe annet (KS8). I brukes bare til sekk eller samling. Tidligere taster for samme funksjon kan virke i tillegg til de felles (for eksempel B for dyreboka). | Presiserer KS8, KA1, KA2, KA6 | A |
| KM9 | **Felles visuelt uttrykk:** hjørneknapper 48 px med avrundede hjørner (14 px), menyruter minst 60 px høye, Fortsett i spillets knappefarge, synlig fokusring (3 px), menyer åpnes med en kort inntoning (ca. 160 ms) som slås av ved `prefers-reduced-motion`, felles bekreftelse (KS10) og feilmelding (KS15). Spillet velger farger og skrift gjennom `tema`, men ikke former, rekkefølge eller plassering. | Nytt | A, Q |
| KM10 | **Ikoner** har samme betydning i alle spill (ikonordboka, KS6). Grafikken skal ha EVN Studios egen identitet og skal ikke kopiere Roblox. Emojiene i ikonordboka gjelder til et eget EVN-ikonsett er tegnet og godkjent av Even. | Presiserer KS6 | Q, V |
| KM11 | **Ikke innført:** chat, byttehandel, rebirth og andre Roblox-funksjoner tas ikke inn bare fordi de finnes i referansespillet. | Nytt (avgrensning) | Q |
| KM12 | **Felleskomponent:** KM1–KM5 og KM13 leveres av EVN-MENY 1.0 (`felles/ui/evn-meny-1.0.js`). Menyen bygger på den felles pausen og lager ingen egen pause, spilletid eller dialoghåndtering: pause, fortsett, kart, spilletid, «Vil du avslutte?», `inert` og Tab i dialoger (KS1–KS3, KS7–KS10, KS12) kommer fra EVN-PAUSE (v2 i dag, `felles/ui/evn-pause-v2.js`). Navnet EVN-PAUSE v3 er reservert for den planlagte pausen med aktiv spilletid (ST2). Nye spill bruker begge fra første versjon gjennom EVN Game Template. Spillet lager ikke sin egen meny, pause eller lydbryter. | Presiserer kravene til EVN Game Template | A |
| KM13 | **Fokus og Tab:** når menyen, kartet, sekken eller en annen dialog som er åpnet fra menyen eller en snarvei lukkes, går fokus tilbake til knappen som åpnet (☰ eller snarveien). Tab-rekkefølgen i menyen er den samme som leserekkefølgen på skjermen. | Presiserer KS12 og T2 | A |

### Felles taster på PC (KM8)

| Tast | Funksjon | Merknad |
|---|---|---|
| WASD / piltaster | Bevegelse | |
| Mus | Kamera (3D) eller markering (2D, bygg) | Kamera etter KA5 |
| Mellomrom | Hopp. I spill uten hopp: hovedhandling | KA1 |
| E | Bruk eller samhandle | KA1 |
| 1–5 | Hurtigfelt | Spill med flere plasser kan bruke 6–0 i tillegg |
| I | Sekk eller samling | KA2 |
| M | Kart | KS2 |
| P / Esc | Meny (pause). Esc lukker det øverste som er åpent | KS1, KS7 |
| L | Lyd av/på, også når menyen er åpen | KS9 |
| H | Slik styrer du (i menyen) | Nytt, bare i menyen |
| Tab | Flytter bare fokus | KS8 |

Spillspesifikke taster (for eksempel B bygg, C snik, F granat) beholdes når de ikke kolliderer med tabellen.

### Motstrid som er løst i 1.1

| # | Krav før 1.1 | Ny retning (instruks 7.11.2026 og skissen) | Løsning |
|---|---|---|---|
| 1 | KS4: Avslutt synlig i HUD under spilling | Avslutt i menyen | Eierens valg: «Bare i ☰ Meny». KS4 endret |
| 2 | KS5: Avslutt, ⏸ og 🗺️ fra høyre hjørne | ☰ Meny øverst | KS5 endret. ⏸ som egen knapp utgår |
| 3 | UI5: status oppe til venstre | ☰ Meny oppe til venstre | Eierens valg: status øverst i midten (KM5) |
| 4 | UI3: én inngang til alt annet | Skissen har tre snarveier (sekk, E-coins, innstillinger) | Eierens valg: høyst to (kart, sekk). KM2 |
| 5 | KA8: saldo ikke fast i HUD | Skissen har E-coins oppe til høyre | KA8 uendret. Saldoen står i menyen |
| 6 | UI10: menyer åpnes og lukkes med samme knapp | ☰ åpner, ✕ lukker | **Godkjent av eieren 7.11.2026:** ☰ åpner hovedmenyen, ✕ lukker den, P og Esc åpner og lukker den på PC, Esc lukker først en åpen underdialog, spillet står stille mens menyen er åpen, og Avslutt står tydelig i menyen. Gjelder alle EVN-spill |
| 7 | Mørkeskogen: hurtigfelt 1–0 (10 våpen) | 1–5 | 1–5 er felles, 6–0 tillatt i tillegg (KM8) |
| 8 | Era Defenders: E skyter, Era Defenders 2: E er kraftdytt | E = bruk | Avvik 13 står fortsatt. Endres bare etter Evens prøving |
| 9 | Mørkeskogen: Hugg størst, Hopp mindre | Hopp størst nede til høyre | Prinsipp i KM6. Even prøver før endring |
| 10 | «Innstillinger, inkludert lyd» | Felles lagret lyd er ikke innført | Ingen konflikt: lyd lagres per spill. Lyd står som egen rute fordi den er eneste innstilling i de fleste spill |
| 11 | `CLAUDE.md`: ikke bygg om eksisterende spill etter UI1–UI10 uten Evens prøving og voksen godkjenning | Utrulling til alle spill | Uendret. Piloten er isolert, og hvert spill tas etter godkjenning |

## Anbefalt fellesstandard (KA1–KA8)

Avvik fra en anbefaling begrunnes i spillets plan. Endringer som påvirker styringen eller spillfølelsen, prøver Even før de bygges inn.

| ID | Anbefaling |
|---|---|
| KA1 | E = bruk eller gjør noe med det du står ved. Mellomrom = hopp i spill med hopp, ellers hovedhandling. |
| KA2 | I = samling eller sekk. B = bygg, bare i spill som bygger. |
| KA3 | Prinsipp for mobil styrespak: den starter i nedre venstre del av skjermen og er synlig i hvile. Fast plassert styrespak er også i tråd med prinsippet. Andre løsninger kan brukes når spillmekanikken krever det. |
| KA4 | Handlingsknapper står nede til høyre, og hovedhandlingen er størst (minst 80 px). Knapper som ikke kan brukes nå, skjules (UI4). Grå knapper skal ikke kunne trykkes. |
| KA5 | Prinsipp for 3D-kamera: på PC dras det med høyre museknapp (pekerlås er tillatt i actionspill). På mobil dras det utenfor styrespaksonen. Venstre-dra flytter ikke helten. Fast kamera er tillatt når spillet er laget for det. |
| KA6 | PC viser hurtigtasten på knappen (UI6). |
| KA7 | Start-knappen er synlig uten rulling i 740×360 og 375×812. Bare Start-knappen starter spillet, ikke hele kortet. |
| KA8 | E-coins-saldoen vises i pausen. Den vises ikke fast i HUD før E-coins-prosjektet har bestemt det. |

**Ikke innført:** felles lagret lydinnstilling på tvers av spillene. Konsekvensene skal vurderes først (vedtak 4. november 2026).

## Spillspesifikt

Disse skal ikke gjøres like:
- kameramodell (fast i Magiske egg, ingen i 2D-spillene)
- hopp, våpenvalg med tall, snik og graving
- epoke- og verdensvalg
- statusinnhold i HUD
- farger, skrift og knappeform
- vanskelighetsgrad
- innholdet i sekk og samling

## Ikonordbok

| Symbol | Betyr | Brukes ikke til |
|---|---|---|
| ☰ | Meny (pausen) | |
| ⏸ | Pause (brukes ikke som egen knapp fra 1.1) | |
| 🗺️ | Kart over verdenen | Verdensvalg (bruk 🌍) |
| 🌍 | Velg verden eller tidsepoke | Kart |
| ✕ | Lukk meny eller dialog | Avslutt spillet (foreløpig, se under) |
| 🚪 | Avslutt spillet (foreløpig, se under) | Lukk |
| 🎮 / ❓ | Slik styrer du | |
| 🔊 / 🔇 | Lyd på / av | |
| ▶ | Start eller fortsett | |
| ← | Tilbake | |
| 🗑️ | Start helt på nytt (sletter) | |
| 📖 | Samling | |
| 🎒 | Sekk | |
| ⚙️ | Innstillinger | Lyd (egen rute) |
| 🛒 | E-shop | |
| 👕 | Garderobe | |

**Foreløpig designvalg:** 🚪 for Avslutt og ✕ bare for Lukk. Even vurderer valget før spillene endres. Til da beholder spillene dagens symboler, og bruddet på KS6 rapporteres som et forbedringsforslag.

## Felles komponenter og kopikontroll

Felles grensesnittkode limes inn i hvert spill som versjonerte kopier. Den lastes ikke fra en felles fil, fordi en felles fil krever full QA av alle spill ved hver endring og ikke virker i artefaktene.

Slik hindres avvik mellom kopiene:

1. **Én kilde:** hver komponent har én kildefil i `felles/ui/`, for eksempel `felles/ui/evn-meny-1.0.js`. Kilden endres bare i standardiseringsøkta.
2. **Ny versjon ved endring:** en endring gir nytt versjonsnummer (v3 → v4). En kopi i et spill rettes aldri på stedet.
3. **Merkede kopier:** kopien står mellom faste merker, for eksempel `/* EVN-MENY 1.0 start */` og `/* EVN-MENY 1.0 slutt */`. Alt som er spillspesifikt, ligger utenfor merkene, i spillets eget oppsett.
4. **Register:** tabellen under viser hvilken versjon hvert spill har. Den oppdateres når et spill publiseres med en ny versjon.
5. **Kontroll:** et skript sammenligner hver merket kopi tegn for tegn med kilden for samme versjon. Kontrollen er rådgivende til den er godkjent (se «Hvordan kravene gjelder»). EVN Game QA rapporterer resultatet når skriptet finnes.
6. **Overgang:** punkt 1–5 gjelder fra de første kildefilene i `felles/ui/` (EVN-MENY 1.0 og EVN-PAUSE v2, på pilotgrenen). Dagens kopier av v2 og v1 har bare et startmerke i JS og sammenlignes ikke før de får kildefil.
7. **Spillsamtaler:** de flytter ikke kode inn i eller ut av merkene. Trengs en endring, meldes den til standardiseringsøkta.

| Komponent | Kilde | Era | Mørkeskogen | Fossil Zoo | Dyrepatruljen | Magiske egg |
|---|---|---|---|---|---|---|
| EVN-PAUSE | v2 (ingen kildefil ennå) | v2 | v2 | v2 | v2 | v2 |
| EVN-NULLSTILL | v1 (ingen kildefil ennå) | v1 | v1 | v1 | v1 | v1 |
| `#evnAvslutt` + `#evnSporsmal` | ingen kildefil ennå | egen `#avsluttKnapp` | ja | ja | ja | ja |
| EVN-MENY 1.0 (☰ Meny) | `felles/ui/evn-meny-1.0.js` (på pilotgrenen `ui/meny-pilot-dyrepatruljen`, ikke på `main`) | | | | pilot 0.11.6 | |
| EVN-PAUSE v2 (kildefil) | `felles/ui/evn-pause-v2.js` (samme sted). Lik kopien i Dyrepatruljen og Fiskespillet. Era Defenders og Mørkeskogen har en eldre v2 uten Tab-regelen (T2) | eldre v2 | eldre v2 | | merket kopi i piloten | |
| EVN-PAUSE v3 | Reservert navn for den planlagte pausen med aktiv spilletid (ST2, `window.EVNAktivTid`). Koden ligger ikke på GitHub | | | | | |
| EVN-FEIL, EVN-INNDATA | planlagt | | | | | |

## Innføring

Prioriteringen fra vedtaket 4. november 2026 gjelder fortsatt: konkrete problemer (vei ut, safe area, tastatur og dialogfokus) rettes først. Felles meny og styring (1.1) innføres slik:

1. **Pilot:** EVN-MENY 1.0 i Dyrepatruljen 0.11.6 på egen gren (PR #60). Even prøver den. Ivar godkjenner eventuell publisering særskilt. Når piloten er godkjent, blir EVN-MENY 1.0 en del av EVN Game Template og standard i nye spill.
2. **Nye spill og spill under utvikling** (Matdyr-regn, Vikinglandsby, Era Defenders 2) tar v3 i bruk neste gang økta deres endrer spillet, gjennom EVN Game Template.
3. **Publiserte spill**, ett om gangen, i anbefalt rekkefølge: Fiskespillet, Mørkeskogen, Era Defenders. Magiske egg og Fossil Zoo tas når de kommer tilbake på nettsiden.
4. Styring, kamera, hopp og hurtigfelt (KM6–KM8) endres per spill først etter at Even har prøvd dem.

Hvert trinn får egen gren og PR, `node test/kjor.mjs` (med suiten `meny`), EVN Game QA, Evens test og voksen godkjenning. Kartlegging, avvik per spill, risiko og testbehov står i prosjektfila `claude/evn-meny-og-styring-kartlegging.md`. Eldre oppgaver står i `claude/evn-ui-oppgaver.md`.

## Versjonshistorikk

| Versjon | Dato | Endring |
|---|---|---|
| 1.0 | 3. november 2026 | Plassering og kravnivå godkjent. Første tekst: KS1–KS15, KA1–KA9, ikonordbok, komponenter og plan |
| 1.0 utkast | 4. november 2026 kl. 07 | 🚪 for Avslutt og ✕ for Lukk (kalt 1.1 i PR #18) |
| 1.0 revidert | 4. november 2026 kl. 10 | Eierens ti beslutninger: rollen til hvert krav er gjort tydelig mot eksisterende standarder, kravene er rådgivende og ikke blokkerende, 🚪 er et foreløpig valg, felles lydnøkkel (KA9) er tatt ut, KA3 og KA5 er prinsipper, og kopikontrollen er beskrevet |
| 1.1 (forslag) | 7. november 2026 | Felles meny og styring etter eierens beslutning 7.11.2026: KM1–KM12, felles PC-taster, motstrid som er løst, og nye ikoner (☰, ⚙️, 🛒, 👕). KS1, KS2, KS4 og KS5 er skrevet om: ☰ Meny oppe til venstre, status i midten, høyst to snarveier, Avslutt i menyen. EVN-PAUSE v3 er første kildefil i `felles/ui/`. Nummeret 1.1 var trukket tilbake 4.11.2026 uten å ha vært i bruk, og brukes nå for denne versjonen |
| 1.1 (forslag, endret) | 7. november 2026 kl. 16 | Eierens beslutninger: menyen heter EVN-MENY 1.0 og bygger på den godkjente pauselogikken (EVN-PAUSE v2). EVN-PAUSE v3 er reservert for pausen med aktiv spilletid. UI10 med ☰ er godkjent (motstrid 6). Nytt krav KM13 om fokus og Tab |
