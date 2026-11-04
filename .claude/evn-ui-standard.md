# EVN UI-standard

Versjon 1.0, revidert 4. november 2026 etter eierens beslutninger (`.claude/vedtak.md`, 4. november 2026 kl. 10:02). Ikke slått sammen med `main` ennå.

Standarden gir felles betjening, navigasjon og symboler på tvers av spillene på evnstudio.no. Målet er at et barn som kan ett EVN-spill, raskt forstår de andre.
Grunnregel: Lik funksjon har lik betjening, likt symbol og samme plass. Ulik spillmekanikk kan ha ulik betjening.
Grunnlag: kartleggingen av Era Defenders 0.21.0, Mørkeskogen 2.0.0, Fossil Zoo 0.8.0, Dyrepatruljen 0.11.0 og Magiske egg 0.9.0. Den er gjort på `main` abca738 og kontrollert på nytt mot `main` ff61022 4. november 2026, uten endringer i spillkoden.

## Forhold til EVN Game Standard og UI1–UI10

Denne standarden lager ingen egne versjoner av krav som allerede finnes. Hvert KS-krav har én av tre roller:

- **Presiserer:** kravet sier *hvordan* et eksisterende krav skal oppfylles likt i alle spill. Det eksisterende kravet gjelder uendret og står over.
- **Tar i bruk:** kravet gjør en del av UI1–UI10 gjeldende for nye spill. For eksisterende spill har UI1–UI10 samme status som før: godkjent hovedløsning.
- **Nytt:** kravet finnes ikke fra før.

Ved motstrid gjelder EVN Game Standard. I spill der UI1–UI10 er tatt i bruk, går UI3 (én inngang ☰ til alt annet) foran KS1, KS2 og KS5. Da regnes ☰ som pauseinngangen, og 🚪 og 🗺️ står ved siden av den.

## Hvordan kravene gjelder

| Spill | KS1–KS15 | Kontrollstatus |
|---|---|---|
| Nye spill | Gjelder fra første versjon | Rådgivende. EVN Game QA rapporterer brudd, men de stopper ikke publisering |
| Eksisterende spill | Gjelder når trinnet i planen som innfører kravet, er godkjent og publisert | Rådgivende. Brudd før det rapporteres som forbedringsforslag |

Ingen krav i denne standarden er publiseringsblokkerende. `test/publiseringssjekk.mjs` leser bare `.claude/evn-game-standard.md`, og blokkerende kontroller derfra gjelder som før. Et KS-krav kan bli blokkerende først når to ting er på plass: kontrollen er prøvd på minst ett spill, og en voksen har godkjent kravet særskilt. Det skjer da ved å flytte kravet inn i EVN Game Standard. Ingen eksisterende kontroll svekkes.

## Obligatorisk fellesstandard (KS1–KS15)

| ID | Krav | Rolle | Kontroll |
|---|---|---|---|
| KS1 | P og Esc åpner og lukker pausen. ⏸ står i topplinjen til høyre. | Presiserer F1, UI10 | A |
| KS2 | Spill med kart: M og 🗺️ åpner kartet, og 🗺️ står rett til venstre for ⏸. | Presiserer B2 | A |
| KS3 | «🎮 Slik styrer du» står i pausen og viser bare det som faktisk virker, for inndataen som brukes nå. | Presiserer U2 | Q |
| KS4 | Vei ut: Avslutt er synlig under spilling og på alle skjermer der spilleren kan bli stående (valgskjermer, tap, seier). Avslutt bruker felles `#evnAvslutt` og `#evnSporsmal`. Symbolet er foreløpig 🚪 (se ikonordboka). | Presiserer U1 | A, Q |
| KS5 | Toppknapper fra høyre hjørne: Avslutt, ⏸, 🗺️, deretter spillets egne. Rekkefølgen og hjørnet er de samme på alle skjermstørrelser. | Nytt | A |
| KS6 | Ett symbol har én betydning i alle spill (ikonordboka). | Nytt (støtter U2, U3) | Q |
| KS7 | Esc lukker det øverste som er åpent: dialog, kart, undermeny eller valgskjerm. Er ingenting åpent, åpner Esc pausen. Alt som lukkes med Esc, har også en synlig lukkeknapp. | Presiserer UI10 | A |
| KS8 | Esc, P, M og Tab brukes ikke til spillhandlinger. Tab flytter bare fokus. | Presiserer T2 | A |
| KS9 | Spill med lyd har en lydbryter 🔊/🔇 i pausen og tasten L. Valget huskes i spillet. | Presiserer B1 | A, E |
| KS10 | Avslutt og sletting bekreftes med felles dialog, ikke med «trykk to ganger». | Presiserer F2 | A |
| KS11 | Lagringen er automatisk, Avslutt lagrer før spillet forlates, og det finnes ingen lagre-knapp. | Presiserer F2 | A |
| KS12 | Dialoger: fokus flyttes inn, holdes inne (`inert`) og settes tilbake ved lukking. Fokus er synlig med `:focus-visible`. | Presiserer T2 | A |
| KS13 | Faste elementer bruker `env(safe-area-inset-*)`, og viewport har `viewport-fit=cover`. | Tar i bruk UI7 (safe area) | A, E |
| KS14 | Oppsettet for mobil eller PC følger siste inndata og kan bytte tilbake. | Tar i bruk UI1 | A |
| KS15 | Uventet feil gir en vennlig melding med «Last inn på nytt». | Presiserer K2 | A |

## Anbefalt fellesstandard (KA1–KA8)

Avvik fra en anbefaling begrunnes i spillets plan. Endringer som påvirker styringen eller spillfølelsen, prøver Even før de bygges inn.

| ID | Anbefaling |
|---|---|
| KA1 | E = bruk eller gjør noe med det du står ved. Mellomrom = hopp i spill med hopp, ellers hovedhandling. |
| KA2 | I = samling eller sekk. B = bygg, bare i spill som bygger. |
| KA3 | Prinsipp for mobil styrespak: den starter i nedre venstre del av skjermen og er synlig i hvile. Fast plassert styrespak er også i tråd med prinsippet. Andre løsninger kan brukes når spillmekanikken krever det. |
| KA4 | Handlingsknapper står nede til høyre, og hovedhandlingen er størst. Knapper som ikke kan brukes nå, skjules (UI4). Grå knapper skal ikke kunne trykkes. |
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
| ⏸ | Pause | |
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

**Foreløpig designvalg:** 🚪 for Avslutt og ✕ bare for Lukk. Even vurderer valget før spillene endres. Til da beholder spillene dagens symboler, og bruddet på KS6 rapporteres som et forbedringsforslag.

## Felles komponenter og kopikontroll

Felles grensesnittkode limes inn i hvert spill som versjonerte kopier. Den lastes ikke fra en felles fil, fordi en felles fil krever full QA av alle spill ved hver endring og ikke virker i artefaktene.

Slik hindres avvik mellom kopiene:

1. **Én kilde:** hver komponent har én kildefil i `felles/ui/`, for eksempel `felles/ui/evn-pause-v3.js`. Kilden endres bare i standardiseringsøkta.
2. **Ny versjon ved endring:** en endring gir nytt versjonsnummer (v3 → v4). En kopi i et spill rettes aldri på stedet.
3. **Merkede kopier:** kopien står mellom faste merker, for eksempel `<!-- EVN-PAUSE v3 start -->` og `<!-- EVN-PAUSE v3 slutt -->`. Alt som er spillspesifikt, ligger utenfor merkene, i spillets eget oppsett.
4. **Register:** tabellen under viser hvilken versjon hvert spill har. Den oppdateres når et spill publiseres med en ny versjon.
5. **Kontroll:** et skript sammenligner hver merket kopi tegn for tegn med kilden for samme versjon. Kontrollen er rådgivende til den er godkjent (se «Hvordan kravene gjelder»). Til da sjekker EVN Game QA kopien ved hver kontroll.
6. **Spillsamtaler:** de flytter ikke kode inn i eller ut av merkene. Trengs en endring, meldes den til standardiseringsøkta.

| Komponent | Kilde | Era | Mørkeskogen | Fossil Zoo | Dyrepatruljen | Magiske egg |
|---|---|---|---|---|---|---|
| EVN-PAUSE | v2 (ingen kildefil ennå) | v2 | v2 | v2 | v2 | v2 |
| EVN-NULLSTILL | v1 (ingen kildefil ennå) | v1 | v1 | v1 | v1 | v1 |
| `#evnAvslutt` + `#evnSporsmal` | ingen kildefil ennå | egen `#avsluttKnapp` | ja | ja | ja | ja |
| EVN-PAUSE v3 | planlagt, pilot i Magiske egg | | | | | |
| EVN-FEIL, EVN-INNDATA | planlagt | | | | | |

## Innføring

Prioriteringen følger vedtaket 4. november 2026. Først rettes konkrete problemer som ikke krever ny spillopplevelse: manglende vei tilbake og ut, safe area, tastaturnavigasjon og fokus i dialoger. Deretter kommer felles pause v3, med pilot i Magiske egg. Endringer i styring, kamera, styrespak og symboler kommer etter at Even har prøvd dem.

Oppgaver per spill, pilot og testplan står i prosjektfila `claude/evn-ui-oppgaver.md`.

## Versjonshistorikk

| Versjon | Dato | Endring |
|---|---|---|
| 1.0 utkast | 3. november 2026 | Første utkast: KS1–KS15, KA1–KA9, ikonordbok, komponenter og plan |
| 1.0 utkast | 4. november 2026 kl. 07 | 🚪 for Avslutt og ✕ for Lukk (kalt 1.1 i PR #18) |
| 1.0 revidert | 4. november 2026 kl. 10 | Eierens ti beslutninger: rollen til hvert krav er gjort tydelig mot eksisterende standarder, kravene er rådgivende og ikke blokkerende, 🚪 er et foreløpig valg, felles lydnøkkel (KA9) er tatt ut, KA3 og KA5 er prinsipper, og kopikontrollen er beskrevet |
