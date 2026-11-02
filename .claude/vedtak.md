# Vedtak om kvalitetskravene

Her står godkjenninger og originaltekst for krav som ble vedtatt i arbeidsøkter med Claude Code. Godkjenningene er gitt av den voksne eieren av prosjektet. Sitatene er ordrette. De ble skrevet ned av Claude Code 2. november 2026 fra øktloggen og kan bekreftes av eieren.

## 1. november 2026: EVN Game Standard 1.0

Standarden og agenten EVN Game QA ble lagt fram etter kartlegging av de tre spillene.
Godkjenning: «Godkjenn standarden».

## 2. november 2026: Statistikk ST1–ST8 (standard 1.1)

Godkjenning: «Godkjenn standarden».
Presiseringer: «Nei, ikke tell» (menyer teller ikke som spilletid) og «Ja, likt overalt» (gjelder alle spill).

## 2. november 2026: EVN UI-standard UI1–UI10

Forslaget ble lagt fram sammen med kartleggingen av Mørkeskogen 5.6.2.
Godkjenning: «Godkjenn, lag prototype».
Senere presiseringer: «mørkeskogen vil blir ersattet med mørkeskogen 2.0 når det er ferdig» og «Egen prototypeside».

Originaltekst som ble godkjent:

| ID | Krav |
|---|---|
| UI1 | Oppsettet bytter etter siste måte spilleren styrte på: berøring, tastatur og mus eller kontroller. Skjermbredde avgjør ikke dette alene. |
| UI2 | Mobil: styrespak nederst til venstre, hovedhandling og hopp nederst til høyre, hurtiglinje nederst på midten. |
| UI3 | Én inngang til alt annet: ☰ på mobil, ☰ eller Esc på PC. Menyen er et rutenett med ikon og kort tekst, ikke en lang liste. |
| UI4 | Handlinger som er knyttet til et sted, vises bare når de kan brukes, for eksempel bål, kiste og byggested. Knapper som ikke kan brukes nå, skjules. |
| UI5 | Status vises kompakt øverst til venstre: bare det spilleren må følge med på hele tiden. |
| UI6 | PC viser hurtigtasten på knappen og ved handlingen som kan brukes. Hurtigtastene står ikke i en fast linje. |
| UI7 | Trykkflater er minst 44 × 44 px, med minst 8 px mellomrom, og ingen overlapper. Trygge områder (safe area) respekteres. |
| UI8 | Faste elementer under aktiv spilling dekker høyst 15 % av skjermen på mobil og 10 % på PC. |
| UI9 | Alle funksjoner er tilgjengelige på både mobil og PC. Spillogikk og lagring er de samme. |
| UI10 | Menyer åpnes og lukkes med samme knapp, ✕ eller Esc. Spillet står stille mens menyen er åpen. |

## 2. november 2026: UI8 vurderes på nytt

Da prototypen ikke nådde 15 %, ble grensen ikke hevet. Instruks: «Ikke endre UI8-grensen fra 15 % til 25 % bare for å få testen godkjent. Jeg ønsker at EVN Game QA først vurderer om målemetoden er hensiktsmessig for spill.» EVN Game QA foreslo å dele UI8 i UI8a–c.

## 2. november 2026: UI8a–c erstatter UI8 (prinsipp)

Godkjenning: «Jeg godkjenner prinsippet om å erstatte dagens UI8 med UI8a, UI8b og UI8c, med disse presiseringene:»

- «UI8a: Behold 15 % for faste informasjonsfelt på mobil og 10 % på PC som foreløpige kvalitetskrav.»
- «UI8b: Styringskontroller skal hovedsakelig plasseres langs kanter og hjørner. Kjernesonen skal som hovedregel holdes fri. Berøringsstørrelse, tilgjengelighet og faktisk brukervennlighet prioriteres fremfor et vilkårlig prosentmål.»
- «UI8c: Bruk de foreslåtte grensene på 10 % og 15 % som foreløpige testmål. Evaluer dem etter testing på faktiske enheter.»
- «Ingen av disse tallene skal brukes som eneste grunnlag for å godkjenne et grensesnitt.»

Samtidig: «Bruk NS-ISO 24495-1:2023 som referanse for klarspråk i brukergrensesnittet, uten å påstå at standarden i seg selv dekker alle aspekter av spill-UI.» og «Behold Even som kreativ beslutningstaker og hovedtester av spillopplevelsen.»

## 2. november 2026: UI8a–c, tolkning

Nytt vedtak, godkjent av den voksne eieren 2. november 2026. Det godkjenner tolkningen av UI8a–c som grunnlag for EVN Game Standard 1.2. Punktene under er et sammendrag av vedtaket, ikke ordrette sitater fra tidligere beslutninger. Der tolkningen er ulik presiseringene over, gjelder tolkningen.

- UI8a er et foreløpig kvalitetskrav med grensene 15 % på mobil og 10 % på PC.
- UI8b prioriterer funksjonell styring og en mest mulig fri kjernesone, uten en absolutt grense for samlet areal.
- UI8c bruker 10 % av hele skjermen og 15 % av kjernesonen som foreløpige testmål. Overskridelse alene gir ikke automatisk avvik uten vurdering av faktisk brukervennlighet.
- Kjernesonen er foreløpig 25–75 % av bredden og 30–70 % av høyden.
- Menyer og dialoger som setter spillet på pause, er unntatt.

## 2. november 2026: Trinn 1 godkjent

Nytt vedtak, godkjent av den voksne eieren. Sammendrag:

- Den felles strukturen på grenen `kvalitet/felles-qa` er godkjent: én standard, én agent, `CLAUDE.md`, `.claude/README.md` og denne filen.
- Agent 2.0 og standard 1.2 er kontrollert. De er fortsatt utkast.
- Sikkerhetskopien på eierens personlige OneDrive skal beholdes.
- Trinn 2 kan starte på en egen utviklingsgren.

## Ikke vedtatt ennå

- Standard 1.2 og agent 2.0 som gjeldende versjoner (i dag utkast), med statusnivåer, kontrollmetode, klarspråkavsnittet og nye arbeidsregler i `CLAUDE.md`.
- Arbeidsflyten og testplanen i `.claude/arbeidsflyt.md` (forslag fra trinn 2).
