# EVN Game Standard

Versjon 1.2 (utkast, ikke godkjent). Gjeldende versjon er 1.1: godkjent 1. november 2026, med statistikkravene ST1–ST8 godkjent 2. november 2026.

Felles grunnleggende kvalitet for nettleserspill for barn mellom 7 og 12 år på evnstudio.no.
Standarden gjelder kvalitet. Den skal ikke styre spillmekanikk eller kreativ identitet.
Endringer i standarden krever ny godkjenning fra en voksen.

## Status for kravene

Status for dette avsnittet og «Kontrollmetode»: forslag (del av utkast 1.2).

Hvert avsnitt med krav har én status. Bare **gjeldende** krav kan gi avvik som stopper en versjon.

| Status | Betyr |
|---|---|
| Gjeldende | Obligatorisk. Brudd er avvik. |
| Godkjent hovedløsning | Retningen er godkjent, men kravet er ikke obligatorisk for et spill før en voksen har godkjent det for det spillet. Brudd rapporteres som forbedringsforslag. |
| Forslag | Ikke godkjent. Brukes ikke i kontroller før det er godkjent. |

## Kontrollmetode

Kolonnen «Kontroll» viser hvordan kravet kan kontrolleres fullt ut. Den endrer ikke kravet, og den endrer ikke når et krav kan rapporteres som oppfylt. Krav vurderes som før. Deler som krever faktisk enhet (E) eller Even (V), føres opp som kontroller som ikke kunne utføres. Finnes ikke den automatiske testen (A) ennå, kontrolleres kravet på samme måte som før.

| Kode | Metode |
|---|---|
| A | Automatisk og objektiv test. Målet er å kjøre den i GitHub Actions. Til det er på plass, kjøres den lokalt av EVN Game QA. |
| Q | EVN Game QA, med nettleser, kodelesing og skjønn. |
| E | Manuell test på faktisk enhet (mobil, nettbrett eller PC med berøring). |
| V | Even tester spillopplevelsen. |

## Felles og spillspesifikt

**Felles:** startkort, pause, kart, avslutning, nullstilling, spilletid, styringshjelp, personvern, sikkerhetsregler (CSP), versjonsvisning og endringslogg.

**Spillspesifikt:** spillmekanikk, tema, maskotens rolle, vanskelighetsgrad, bygging, læringsinnhold og 3D-grafikk.

## Obligatoriske krav for alle spill

Status: gjeldende (versjon 1.0).

| ID | Område | Krav | Kontroll |
|---|---|---|---|
| F1 | Funksjon | Spillet kan startes, spilles, pauses, fortsettes og avsluttes uten å henge | A, Q |
| F2 | Funksjon | Fremgang overlever omlasting, og nullstilling krever bekreftelse | A, Q |
| F3 | Funksjon | Ødelagt eller gammel lagring krasjer ikke spillet, og eldre lagring beholdes ved oppdatering | A, Q |
| U1 | Brukeropplevelse | Startkortet har felles oppbygging, mål, styring, versjon og vei tilbake | Q |
| U2 | Brukeropplevelse | Barnet kan alltid se hva som skal gjøres og finne styringshjelp | Q, V |
| U3 | Brukeropplevelse | Tekst er på enkel norsk, og tap føles ikke straffende eller skremmende for målgruppen | Q, V |
| T1 | Tilgjengelighet | Trykkflater er minst 44×44 px | A, E |
| T2 | Tilgjengelighet | Spillet kan brukes med tastatur på PC, og fokus blir i åpne dialoger | A, Q |
| T3 | Tilgjengelighet | Zoom er ikke sperret på menysider og i dialoger, og `prefers-reduced-motion` respekteres | A, E |
| T4 | Tilgjengelighet | Viktig informasjon formidles ikke bare med farge, og teksten har god kontrast | A, Q |
| Y1 | Ytelse | Ingen merkbar treghet på en definert referansemobil, med målt bildefrekvens | E |
| Y2 | Ytelse | Spillet oppfører seg riktig etter fanebytte, og hastigheten er uavhengig av skjermfrekvens | A, Q |
| K1 | Teknisk | Ingen ufangede feil i konsollen og ingen manglende filer (404) under normal bruk | A |
| K2 | Teknisk | Uventede feil gir en vennlig melding med mulighet til å laste på nytt | A, Q |
| K3 | Teknisk | Versjonsnummer og endringslogg oppdateres ved hver publisering | A |
| S1 | Sikkerhet | CSP er på plass, uten `eval` og uten nye eksterne domener uten voksen godkjenning | A |
| S2 | Sikkerhet | Ingen konto, chat, kjøp, reklame eller innsamling av personopplysninger | A, Q |
| S3 | Sikkerhet | Fritekst fra barnet lagres bare lokalt, sendes ikke ut og vises trygt | A, Q |
| S4 | Sikkerhet | Personvern- og sikkerhetssidene stemmer med det spillet faktisk gjør | Q |

## Statistikk (obligatorisk for alle spill)

Status: gjeldende (versjon 1.1).

GoatCounter er godkjent statistikkløsning. En annen løsning krever egen godkjenning fra en voksen.

| ID | Krav | Kontroll |
|---|---|---|
| ST1 | Alle spill bruker felles `statistikk.js`, lastet i `<head>` før spillets egne skript, med `data-spill="<mappe>"`. Spillet sender `evn-start` når spillingen faktisk begynner. Ingen spill lager sin egen statistikk. | A |
| ST2 | Aktiv spilletid kommer fra felles pause (EVN-PAUSE v3, `window.EVNAktivTid`). Den teller ikke i pause, med kartet eller en meny i spillet åpen, i skjult fane, uten aktivitet siste 3 minutter eller når spillet ikke er i gang. | A |
| ST3 | Hendelser sendes bare fra evnstudio.no, aldri fra lokal testing eller forhåndsvisning. | A, Q |
| ST4 | Feil i statistikken skal aldri stoppe spillet. Uventede feil telles som `feil-<spill>-oppstart` eller `feil-<spill>-spill`, høyst én gang hver. | A |
| ST5 | Bare godkjente hendelsesnavn, hver høyst én gang per sidebesøk. Ingen fritekst, feilmeldinger, navn eller spillerdata. | A |
| ST6 | Ingen informasjonskapsler, bruker-ID, fingeravtrykk av enheten eller sporing av enkeltpersoner. | A, Q |
| ST7 | Et spill uten godkjent statistikk er et avvik. | A |
| ST8 | Statistikken kontrolleres med `test/statistikk/` før hver publisering. | A |

Merknad (ikke et krav, kopiert fra agentfilen): At hendelsene faktisk kommer fram i GoatCounter etter publisering, kan bare kontrolleres av en voksen med innlogging.

**Godkjente hendelser** (`<spill>` er mappenavnet, for eksempel `fossilspillet`):

| Hendelse | Når |
|---|---|
| Sidevisning | Automatisk på alle sider |
| `start-<spill>` | Én gang per sidebesøk, når spillet faktisk starter |
| `spilletid-<spill>-01min`, `05min`, `15min`, `30min`, `60min` | Én gang hver ved aktiv spilletid |
| `versjon-<spill>-<versjon>` | Én gang, sammen med start. Versjonen leses fra «Versjon x.y.z» på startkortet |
| `feil-<spill>-oppstart`, `feil-<spill>-spill` | Høyst én gang hver |

Eksisterende navn endres ikke uten en dokumentert overgangsplan i `ENDRINGSLOGG.md`.

## Grensesnitt under spilling (UI1–UI10)

Status: godkjent hovedløsning 2. november 2026. Statusen er definert i dette utkastet. Til 1.2 er godkjent, er UI1–UI10 ikke en del av gjeldende standard. Originaltekst og godkjenning står i `.claude/vedtak.md`. Ordlyden er overført uendret, unntatt UI8. Kravene brukes i UI-prototypen (`prototype/ui/`, som ligger på grenen `feature/morkeskogen-ui`) og er tenkt for Mørkeskogen 2.0. De blir obligatoriske for et spill først når Even har prøvd løsningen og en voksen har godkjent den for det spillet. Eksisterende spill skal ikke bygges om på grunn av dem.

Kravene bygger på vanlige prinsipper fra Roblox: én menyinngang, styrespak til venstre og handlinger til høyre, hurtiglinje på midten og handlinger som dukker opp når du står ved noe. Utseendet er EVN Studios eget.

| ID | Krav | Kontroll |
|---|---|---|
| UI1 | Oppsettet bytter etter siste måte spilleren styrte på: berøring, tastatur og mus eller kontroller. Skjermbredde avgjør ikke dette alene. | A, E |
| UI2 | Mobil: styrespak nederst til venstre, hovedhandling og hopp nederst til høyre, hurtiglinje nederst på midten. | A, E |
| UI3 | Én inngang til alt annet: ☰ på mobil, ☰ eller Esc på PC. Menyen er et rutenett med ikon og kort tekst, ikke en lang liste. | A, Q |
| UI4 | Handlinger som er knyttet til et sted, vises bare når de kan brukes, for eksempel bål, kiste og byggested. Knapper som ikke kan brukes nå, skjules. | A, Q |
| UI5 | Status vises kompakt øverst til venstre: bare det spilleren må følge med på hele tiden. | Q, V |
| UI6 | PC viser hurtigtasten på knappen og ved handlingen som kan brukes. Hurtigtastene står ikke i en fast linje. | A, Q |
| UI7 | Trykkflater er minst 44 × 44 px, med minst 8 px mellomrom, og ingen overlapper. Trygge områder (safe area) respekteres. | A, E |
| UI8a | Se under. | A, Q |
| UI8b | Se under. | A, Q, E |
| UI8c | Se under. | A, Q, E |
| UI9 | Alle funksjoner er tilgjengelige på både mobil og PC. Spillogikk og lagring er de samme. | A, Q |
| UI10 | Menyer åpnes og lukkes med samme knapp, ✕ eller Esc. Spillet står stille mens menyen er åpen. | A |

### Hvor mye av spillverdenen som dekkes (UI8a–UI8c)

Status: som UI1–UI10, godkjent hovedløsning. Prinsippet og tolkningen under er godkjent 2. november 2026 (se vedtaket «UI8a–c: tolkning» i `.claude/vedtak.md`) og erstatter den tidligere UI8 («Faste elementer under aktiv spilling dekker høyst 15 % av skjermen på mobil og 10 % på PC»). Grunnen er at én prosent for alt blandet informasjon, nødvendig styring og midlertidige elementer, og at prosenten for knapper med fast størrelse stiger av seg selv på små skjermer. Tallene under er foreløpige.

**Kjernesonen** er foreløpig området fra 25 til 75 % av bredden og fra 30 til 70 % av høyden. Der foregår spillet. Menyer og dialoger som setter spillet på pause, er unntatt fra UI8a–c.

Kolonnen «Tall» sier hvilken vekt tallet har. Den er ikke en status.

- **Foreløpig kvalitetskrav:** brudd er avvik når UI-kravene er gjeldende for spillet. At kravet holdes, er ikke alene nok til å godkjenne.
- **Foreløpig testmål:** målt verdi rapporteres mot målet. Overskridelse alene gir ikke automatisk avvik. Det blir avvik bare hvis en vurdering av faktisk brukervennlighet viser et problem. Målet evalueres etter testing på faktiske enheter.

| ID | Krav | Tall |
|---|---|---|
| UI8a | **Faste informasjonsfelt** (status, klokke og annet som bare viser informasjon) dekker høyst 15 % av skjermen på mobil og høyst 10 % på PC. | Foreløpig kvalitetskrav |
| UI8b | **Styringskontroller** prioriterer funksjonell styring og en mest mulig fri kjernesone. De plasseres hovedsakelig langs kanter og i hjørner. Berøringsstørrelse, tilgjengelighet og faktisk brukervennlighet går foran et prosentmål. Dekket andel rapporteres, men det er ingen absolutt grense for samlet areal. | Ingen tallgrense |
| UI8c | **Midlertidige og kontekstbaserte elementer** (stedshandlinger, Spis, meldinger) vises bare når de kan brukes. Meldinger forsvinner av seg selv. Til sammen dekker de høyst 10 % av hele skjermen og høyst 15 % av kjernesonen. | Foreløpig testmål |

Ingen av tallene skal brukes som eneste grunnlag for å godkjenne et grensesnitt.

**Måling:** Elementene merkes med kategori (informasjon, styring eller kontekst). Dekket areal måles med elementenes virkelige form, slik at runde kontroller ikke telles som firkanter og overlapp ikke telles to ganger. Usynlige elementer telles ikke. Det måles i 1280×800, 375×812, 740×360, 320×568 og 568×320, og i de tilstandene der kontekstelementene vises.

## Klarspråk i grensesnittet

Status: forslag.

Tekst og informasjon i grensesnittet vurderes etter de fire prinsippene i NS-ISO 24495-1:2023 (Klarspråk – Del 1: Styrende prinsipper og retningslinjer):

| Prinsipp | Slik brukes det i spill |
|---|---|
| Relevant | Spilleren ser det som trengs nå, ikke alt som finnes. |
| Lett å finne | Det som trengs, står på samme sted hver gang. |
| Forståelig | Knapper og meldinger bruker korte, kjente ord for 7–12 år, og handlinger begynner med et verb. |
| Brukbart | Spilleren kan gjøre det teksten sier, uten å lete eller gjette. |

Gjelder startkort, menyer, knapper, meldinger, feilmeldinger og styringshjelp. Henger sammen med U2, U3, UI4 og UI5. Kontroll: Q og V.

NS-ISO 24495-1 handler om skriftlig kommunikasjon. Den dekker ikke spillfølelse, styring, trykkflater, ytelse eller hvor mye av skjermen som dekkes. Det dekkes av egne krav i denne standarden.

## Betingede krav

Status: gjeldende (versjon 1.0).

| ID | Gjelder | Krav | Kontroll |
|---|---|---|---|
| B1 | Spill med lyd | Lyd kan slås av, og valget huskes | A, E |
| B2 | Spill med stor verden | Kartet viser hvor spilleren er, og spillet står stille mens det er åpent | A, Q |
| B3 | 3D-spill | Tydelig melding hvis 3D ikke virker, og lavere grafikk på svake enheter | A, E |
| B4 | Spill med kamp eller skrekk | Innholdet passer for 7-åringer, og minst ett valg er lett nok for dem | Q, V |
| B5 | Spill med læringsinnhold | Fakta er kontrollert mot en pålitelig kilde | Q |
| B6 | Spill med app-installasjon | Oppdateringer når frem, og spillet virker som lovet uten nett | A, E |
| B7 | Spill med fritekst | Lengden er begrenset, og teksten er omtalt på personvernsiden | A, Q |

## Anbefalte forbedringer

Disse kan prioriteres senere og er ikke krav:

- Automatiske røyktester i Playwright for alle tre spillene.
- Eget testmiljø før publisering.
- Felles lagringsformat med versjonsnummer.
- Felles lydinnstilling på tvers av spillene.
- Ytelsesbudsjett for Mørkeskogen.
- Skjermleservennlige menyer.

## Hvilke krav gjelder for hvert spill

Spillmapper: Era Defenders = `spill/eventyrspill`, Mørkeskogen = `spill/morkeskogen`, Fossil Zoo = `spill/fossilspillet`.

| Spill | Betingede krav som gjelder | UI1–UI10 |
|---|---|---|
| Era Defenders | B2, B4, B6, B7 | Ikke tatt i bruk |
| Mørkeskogen | B1, B2, B3, B4 | Ikke tatt i bruk i 5.6.x. Tenkt for 2.0 |
| Fossil Zoo | B1, B2, B5 | Ikke tatt i bruk |

Oversikten oppdateres når et spill får eller mister en funksjon.

## Kjente funn ved vedtak

Funnene er fra kartleggingen 1. november 2026. De er ikke rettet, og publiserte spill skal ikke endres automatisk på grunn av dem.

**Verifiserte avvik**

- T2, alle spill: Tab-tasten kan gå ut av pausekortet. Testet i Fossil Zoo v0.7.2, og koden er felles.
- T1, Fossil Zoo: «Tidsepoker» og «Dyreparken» er 29 px høye på mobil.
- T3, Fossil Zoo: `user-scalable=no` sperrer zoom.
- K2, alle spill: ingen global feilfanger i koden.
- B1, Mørkeskogen og Fossil Zoo: ingen lydbryter funnet i koden.

**Mulige problemer som må kontrolleres**

- B2 og spilletid, Fossil Zoo: tiden teller trolig mens kartet er åpent.
- B3, Mørkeskogen: tapt WebGL-kontekst ser ikke ut til å være håndtert.
- S3, S4 og B7, Era Defenders: basenavnet er ikke omtalt på personvernsiden, og visningen av navnet er ikke kontrollert.

**Referansemobil til Y1 er ennå ikke valgt.** Til den er valgt, kan Y1 ikke rapporteres som oppfylt.

## Versjonshistorikk

| Versjon | Dato | Endring | Status |
|---|---|---|---|
| 1.0 | 1. november 2026 | Første felles standard | Godkjent |
| 1.1 | 2. november 2026 | Statistikk ST1–ST8 og godkjente hendelser | Godkjent |
| 1.2 | 2. november 2026 | UI1–UI10 skrevet inn (godkjent som hovedløsning), og UI8 erstattet av UI8a–c. Statusnivåer og kontrollmetode per krav (forslag). Klarspråk etter NS-ISO 24495-1:2023 (forslag). Merknad om GoatCounter kopiert fra agentfilen til ST-avsnittet. Ny fil `.claude/vedtak.md` med originaltekst og godkjenninger. Kolonnen «UI1–UI10» lagt til i oversikten per spill. Ingen eksisterende krav er endret eller fjernet. | Utkast |
