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

## 3. november 2026: E-coins (V1–V5)

Beslutningsgrunnlag: `prototype/ecoins/E-COINS-PLAN.md`. Godkjenning: «Dette godkjenes publiser løsningne», presisert med valget «Bygg alle fire spill».
Det gjelder V1 økonomimodellen, V2 arkitekturen, V3 at fremgang fra før gir E-coins med én samlet melding, V4 presiseringen av S2 (ingen kjøp med ekte penger) og V5 pilotspill. Publisering av den ferdige versjonen krever egen godkjenning etter Evens test og EVN Game QA.
Evens valg E1 (varer og navn), E2 (Era: valgt antrekk erstatter epokeutstyret, alternativ A brukes til han har valgt) og E3 (ikonet) er ikke tatt ennå.

## 3. november 2026: EVN UI-standard 1.0

Beslutningsgrunnlag: kartleggingen av de fem spillene (dokumentet «EVN Studio – kartlegging og forslag til felles UI-standard», 3.11.2026). Svar fra den voksne eieren, ordrett fra valgene i økta:

- Plassering og kravnivå: «Egen fil, KS for nye versjoner (Anbefalt)». Standarden ligger i `.claude/evn-ui-standard.md`. Alternativet som ble valgt, var beskrevet slik: «KS1–KS15 gjelder nye spill straks og eksisterende spill trinn for trinn». Claude Code har skrevet dette inn som at et krav gjelder et eksisterende spill når trinnet som innfører det, er godkjent og publisert. Tolkningen må bekreftes av eieren.
- Trinn 2: «Her, én PR per spill (Anbefalt)». Rettingene gjøres i standardiseringsøkta, med én PR per spill.
- Trinn 3: «Vent til trinn 2 er godkjent (Anbefalt)».

Ikke avgjort: symbolet for Avslutt i HUD (Evens valg), pilotspill for EVN-PAUSE v3 og felles lydnøkkel.

## 4. november 2026: Symbol for Avslutt (EVN UI-standard 1.1)

Anbefaling fra Claude Code: «🚪 Avslutt» i toppraden, og ✕ bare for å lukke noe som er åpent. Byttet i spillene tas sammen med felles pause i trinn 3.
Godkjenning fra den voksne eieren, ordrett: «Enig. Iverksette».
Spørsmålet var tidligere lagt til Even. Even kan fortsatt be om å endre valget før trinn 3 bygges.

## 4. november 2026 kl. 10:02: EVN UI-standard 1.0 revidert

Beslutninger fra den voksne eieren, gjengitt i kortform (fullt ordlyd i økta 4.11.2026):

1. EVN UI-standard 1.0 er en egen standard, tydelig koblet til EVN Game Standard og UI1–UI10, uten motstridende eller dupliserte krav.
2. 🚪 Avslutt er felles symbol for å avslutte spillet, og ✕ lukker menyer og dialoger. Valget er foreløpig. Even skal vurdere det før det endres i spillene.
3. Standarden gjelder nye spill. Eksisterende spill oppdateres gradvis etter godkjent plan.
4. Først rettes konkrete problemer: manglende tilbakeknapper, avslutningsmuligheter, safe area, tastaturnavigasjon og dialogfokus.
5. Magiske egg kan være pilot for EVN-PAUSE v3, koordinert med E-coins-prosjektet så øktene ikke endrer de samme komponentene.
6. Alle spill med lyd har en gjenkjennelig lydbryter og samme hurtigtast. Felles lagret lydinnstilling på tvers av spill innføres ikke før konsekvensene er vurdert.
7. Kamera og styrespak følger felles prinsipper der det passer, men tvinges ikke til å være like når spillmekanikken krever noe annet. Endringer i spillfølelsen testes av Even.
8. Versjonerte felles komponenter med kontrollerte kopier beholdes, og det dokumenteres hvordan avvik mellom kopiene hindres.
9. Nye publiseringsblokkerende QA-krav innføres ikke før de er kontrollert og godkjent. De innføres gradvis uten å svekke eksisterende kontroller.
10. Avvikene kontrolleres mot siste `main` før implementering.

Følger: Oppføringen «Symbol for Avslutt (1.1)» over er erstattet av punkt 2, og versjonsnummeret 1.1 er trukket tilbake. Tolkningen fra 3. november («gjelder når trinnet er godkjent og publisert») er beholdt, men kravene er rådgivende til de er godkjent særskilt.

## 7. november 2026: Felles meny og styring (EVN UI-standard 1.1)

Beslutning fra den voksne eieren, skriftlig instruks («EVN Studio – felles standard for meny og styring»), gjengitt i kortform:

1. Alle EVN-spill, eksisterende og nye, skal bruke en felles Roblox-inspirert standard for menyer, styring og navigasjon. Målet er at barn kjenner igjen grensesnittet når de bytter spill.
2. Eksisterende EVN UI-standard, UI1–UI10 og EVN Game Template utvides. Det lages ikke en ny, konkurrerende standard. Motstridende krav identifiseres.
3. Felles meny: ☰ Meny øverst, med Pause/Fortsett, Hjelp og styring, Innstillinger med lyd, Avslutt tilbake til evnstudio.no, E-shop og garderobe når relevant, inventar og kart når spillet har det. Ikonene har samme betydning i alle spill. Chat, byttehandel, rebirth og andre Roblox-funksjoner innføres ikke bare fordi de finnes i referansespillet.
4. Mobil i 3D-spill med fri bevegelse: styrespak nede til venstre, hopp nede til høyre, kontekstbasert handlingsknapp til høyre, dra for kamera, hurtigfelt nede i midten når utstyr brukes, sekundære funksjoner i menyen. 2D-, strategi- og byggespill følger samme prinsipper, tilpasset mekanikken.
5. PC, så langt det passer: WASD/piler bevegelse, mus kamera eller markering, Mellomrom hopp, E bruk, 1–5 hurtigfelt, I inventar, M kart, P/Esc pause eller meny, L lyd. Godkjente hurtigtaster og tilgjengelighetskrav kontrolleres før endring.
6. Felles visuelt uttrykk for knapper, ikoner, menyplassering, skrift og kontrast, bekreftelser, feilmeldinger og animasjoner. Inspirasjon fra Roblox, men EVN Studios egen grafikk og ikonbruk.
7. Felleskomponenter i EVN Game Template, så nye spill får standardfunksjonene automatisk og ingen funksjon implementeres på flere måter. Eksisterende spillmekanikk og lagring bevares. Endringer i felleskomponenter testes automatisk.
8. Alle spill kartlegges. Én spillbar pilot i ett egnet spill før full utrulling. Ikke alle spill samtidig. Even prøver piloten.
9. Den felles retningen er godkjent som designprinsipp. Teknisk implementering, større endringer i eksisterende spill og publisering følger den risikobaserte arbeidsflyten. Klarsignal til å oppdatere standardforslaget, kartlegge spillene og utvikle en isolert pilot. Ingen sammenslåing med `main` eller publisering uten særskilt godkjenning.

Eierens svar på tre motstridspunkter mellom prinsippskissen («Felles mobiloppsett – 3D-spill») og gjeldende krav, ordrett fra valgene i økta:

- Avslutt: «Bare i ☰ Meny (Anbefalt)». Avslutt ligger i menyen og på tap-, seiers- og valgskjermer, ikke i HUD under spilling. Endrer KS4 og KS5.
- Snarveier oppe til høyre: «Høyst to snarveier (Anbefalt)». Sekk og kart når spillet har dem. E-coins og innstillinger bare i menyen. UI3 og KA8 gjelder ellers uendret.
- Status: «Øverst i midten (Anbefalt)». Endrer plasseringen i UI5.

## Ikke vedtatt ennå

- Standard 1.2 og agent 2.0 som gjeldende versjoner (i dag utkast), med statusnivåer, kontrollmetode, klarspråkavsnittet og nye arbeidsregler i `CLAUDE.md`.
- Arbeidsflyten og testplanen i `.claude/arbeidsflyt.md` (forslag fra trinn 2).
- Evens vurdering av 🚪 og ✕.
- Felles lagret lydinnstilling på tvers av spill.
- Hvilke KS-krav som skal bli publiseringsblokkerende (flyttes i så fall inn i EVN Game Standard).
- EVN UI-standard 1.1 (felles meny og styring, KM1–KM12) som gjeldende versjon. Den felles retningen er godkjent som designprinsipp 7.11.2026, men ordlyden er et forslag.
- Tolkningen av UI10 med ☰ Meny: ☰ åpner, ✕, P eller Esc lukker (motstrid 6 i standarden).
- Eget EVN-ikonsett i stedet for emoji (Even velger).
