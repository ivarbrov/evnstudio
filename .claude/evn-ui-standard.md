# EVN UI-standard

Versjon 1.0, godkjent 3. november 2026 (vedtak i `.claude/vedtak.md`).

Felles betjening, navigasjon og symboler på tvers av spillene på evnstudio.no. Målet er at et barn som kan ett EVN-spill, raskt forstår de andre.
Standarden supplerer EVN Game Standard (`.claude/evn-game-standard.md`). Den endrer ingen krav der. Den er ikke det samme som UI1–UI10 (vedtak 2. november 2026), som fortsatt har status godkjent hovedløsning.
Grunnlag: kartlegging av Era Defenders 0.21.0, Mørkeskogen 2.0.0, Fossil Zoo 0.8.0, Dyrepatruljen 0.11.0 og Magiske egg 0.9.0 (`main`, abca738), 3. november 2026.

**Grunnregel:** Lik funksjon har lik betjening, likt symbol og samme plass. Ulik spillmekanikk kan ha ulik betjening.

## Hvordan kravene gjelder

| Spill | KS1–KS15 |
|---|---|
| Nye spill fra 3. november 2026 | Gjeldende fra første versjon |
| Eksisterende spill | Et krav blir gjeldende for spillet når trinnet i planen som innfører det, er godkjent og publisert. Til da rapporteres brudd som forbedringsforslag |

Forhold til UI1–UI10: KS13 og KS14 gjør de tilsvarende delene av UI7 (safe area) og UI1 (oppsett etter siste inndata) obligatoriske for nye spill, etter vedtaket 3. november 2026. Resten av UI1–UI10 har uendret status. I spill der UI1–UI10 er tatt i bruk, går UI3 (én inngang ☰ til alt annet) foran KS5: da er ☰ pauseinngangen, og Avslutt og 🗺️ står ved siden av den. (Presisering skrevet av Claude Code, må bekreftes av eieren.)

KA1–KA9 er anbefalinger. Avvik fra dem begrunnes i spillets plan. Endringer som påvirker styring eller spillfølelse, prøves av Even før de bygges inn.

Status per spill står nederst og oppdateres når et trinn er publisert.

## Obligatorisk fellesstandard (KS1–KS15)

| ID | Krav | Bygger på | Kontroll |
|---|---|---|---|
| KS1 | Pause: P og Esc åpner og lukker. ⏸ står i topplinjen til høyre (Avslutt står ytterst, se KS5). Spillet står stille. | F1, UI10 | A |
| KS2 | Kart (spill med verden): M og 🗺️, rett til venstre for ⏸. | B2 | A |
| KS3 | Hjelp: «🎮 Slik styrer du» i pausen. Teksten viser bare det som faktisk virker, for den inndataen som brukes nå. | U2 | Q |
| KS4 | Vei ut: Avslutt er synlig under spilling og på alle skjermer der spilleren kan bli stående (valgskjermer, tap, seier). Bruker felles `#evnAvslutt` og `#evnSporsmal`. | U1 | A, Q |
| KS5 | Toppknapper, fra høyre hjørne: Avslutt, ⏸, 🗺️, deretter spillets egne (🔊, 📖, 🌍 …). Rekkefølgen og høyre hjørne beholdes på alle skjermstørrelser. | UI3 | A |
| KS6 | Symboler betyr det samme i alle spill (ikonordboka under). Ett symbol har én betydning. | Nytt krav (støtter U2 og U3) | Q |
| KS7 | Esc lukker alltid det øverste som er åpent (dialog, kart, undermeny, valgskjerm). Er ingenting åpent, åpner Esc pausen. Alt som kan lukkes med Esc, har også en synlig lukkeknapp. | UI10 | A |
| KS8 | Reserverte taster: Esc, P, M og Tab brukes aldri til noe annet. Tab flytter bare fokus. L er lyd i spill med lyd. | T2 | A |
| KS9 | Spill med lyd har lydbryter i pausen og tasten L. Valget huskes. | B1 | A |
| KS10 | Avslutt og sletting bekreftes med felles dialog, ikke «trykk to ganger». | F2 | A |
| KS11 | Lagring er automatisk. Avslutt lagrer før spillet forlates. Ingen lagre-knapp. | F2 | A |
| KS12 | Dialoger: fokus flyttes inn, holdes inne (`inert`) og settes tilbake ved lukking. Alle knapper har synlig `:focus-visible`. | T2 | A |
| KS13 | Faste elementer bruker `env(safe-area-inset-*)`, og viewport har `viewport-fit=cover`. | UI7 | A, E |
| KS14 | Mobil- eller PC-oppsett velges av felles inndatavelger etter siste inndata, og kan bytte tilbake. Ikke låst ved oppstart. | UI1 | A |
| KS15 | Uventet feil gir felles vennlig melding med «Last inn på nytt». | K2 | A |

## Anbefalt fellesstandard (KA1–KA9)

| ID | Anbefaling |
|---|---|
| KA1 | E = bruk eller gjør noe med det du står ved. Mellomrom = hopp i spill med hopp, ellers hovedhandling. |
| KA2 | I = samling eller sekk (dyrebok, samlebok, ryggsekk). B = bygg, bare i spill som bygger. |
| KA3 | Mobil styrespak: flytende innenfor nedre venstre sone (ca. venstre 45 %, nedre 55 %), synlig i hvile. Ikke hele skjermen. |
| KA4 | Handlingsknapper nede til høyre. Hovedhandlingen er størst (minst 80 px). Knapper som ikke kan brukes nå, skjules (UI4). Grå knapper skal ikke kunne trykkes. |
| KA5 | 3D-kamera: PC = dra med høyre museknapp (pekerlås er tillatt i actionspill), mobil = dra utenfor styrespaksonen. Venstre-dra flytter aldri helten. |
| KA6 | PC viser hurtigtasten på knappen (UI6). |
| KA7 | Start-knappen er synlig uten rulling i 740×360 og 375×812. Bare Start-knappen starter spillet, ikke hele kortet. |
| KA8 | E-coins-saldo vises i pausen. Ingen fast saldo i HUD før E-coins-prosjektet har bestemt det. |
| KA9 | Felles lydnøkkel `evn-lyd` for alle spill. Spill med egen nøkkel leser den gamle én gang og flytter verdien. |

## Spillspesifikke unntak

Skal ikke gjøres like: kameramodell (fast i Magiske egg, ingen i 2D-spillene), hopp, våpenvalg med tall, snik, grave ved å gå, epoke- og verdensvalg, statusinnhold i HUD, farger, skrift og knappeform, vanskelighetsgrad og hva som ligger i sekk eller samling.

## Ikonordbok

| Symbol | Betyr | Brukes ikke til |
|---|---|---|
| ⏸ | Pause | |
| 🗺️ | Kart over verdenen | Verdensvalg (bruk 🌍) |
| 🌍 | Velg verden eller tidsepoke | Kart |
| ✕ | Lukk det som er åpent | Ikke avgjort: Avslutt bruker i dag også ✕ i HUD. Even velger mellom 🚪 Avslutt og ✕ Avslutt med tekst |
| 🚪 | Avslutt spillet | |
| 🎮 / ❓ | Slik styrer du | |
| 🔊 / 🔇 | Lyd på / av | |
| ▶ | Start eller fortsett | |
| ← | Tilbake (til EVN Studio, eller ett steg tilbake) | |
| 🗑️ | Start helt på nytt (sletter) | |
| 📖 | Samling (dyrebok, samlebok) | |
| 🎒 | Sekk | |

## Felles komponenter

Felles grensesnittkode limes inn i hvert spill som merkede kopier (for eksempel `EVN-PAUSE v2`, `EVN-NULLSTILL v1`). Den lastes ikke fra en felles fil, fordi felles filer krever full QA av alle spill og ikke virker i artefaktene. Kopiene skal være uendret. Planlagt: én kilde i `felles/ui/` og en test som sammenligner kopiene med kilden.

| Komponent | Status |
|---|---|
| EVN-PAUSE v2, EVN-NULLSTILL v1, startkort, `#evnSporsmal` | I bruk i alle spill |
| `#evnAvslutt` | I bruk i alle spill unntatt Era Defenders, som har egen `#avsluttKnapp` |
| EVN-PAUSE v3 (lydbryter, `inert`-fokus, `EVNAktivTid`, Esc-stabel, fast toppknapperad) | Planlagt, trinn 3. Pilot i Magiske egg |
| EVN-AVSLUTT, EVN-INNDATA, EVN-FEIL | Planlagt |

## Innføringsplan

1. Standarden vedtas (denne versjonen).
2. Rettinger uten ny styring, én PR per spill.
3. EVN-PAUSE v3 og EVN-FEIL, pilot i ett spill, deretter ett spill om gangen.
4. Styring som Even prøver først: inndatavelger, styrespaksone, kamera på PC, tastebetydninger, topplinjen i Fossil Zoo.
5. Finpuss.
6. Kontrollområde «Konsistens» i EVN Game QA (krever egen godkjenning av QA-filene).

## Status per spill

| Spill | Publisert versjon | Trinn 2 | Kjente brudd på KS (forbedringsforslag til trinnet er publisert) |
|---|---|---|---|
| Era Defenders | 0.21.0 | PR åpnet 3.11.2026 | KS4, KS5, KS12, KS13, KS14, KS15 |
| Mørkeskogen | 2.0.0 | PR åpnet 3.11.2026 | KS4, KS5, KS8, KS9, KS10, KS12, KS14, KS15 |
| Fossil Zoo | 0.8.0 | PR åpnet 3.11.2026 | KS5, KS7, KS9, KS12, KS13, KS14, KS15 |
| Dyrepatruljen | 0.11.0 | PR åpnet 3.11.2026 | KS4, KS7, KS13, KS14, KS15 |
| Magiske egg | 0.9.0 | PR åpnet 3.11.2026 | KS9, KS12, KS14, KS15 |

## Versjonshistorikk

| Versjon | Dato | Endring |
|---|---|---|
| 1.0 | 3. november 2026 | Første versjon: KS1–KS15, KA1–KA9, ikonordbok, komponenter og plan |
