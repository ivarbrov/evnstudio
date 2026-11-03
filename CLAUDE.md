# EVN Studio

Nettleserspill for barn mellom 7 og 12 år. Felles kvalitetskrav står i `.claude/evn-game-standard.md`. Hvilke filer som er felles, og hvordan de holdes like, står i `.claude/README.md`.

Denne filen er et utkast på kvalitetsgrenene (`kvalitet/…`). Regler merket «(utkast)» er nye og gjelder ikke før en voksen har godkjent dem.

## Kvalitetskontroll

- Bruk subagenten `evn-game-qa` etter relevante endringer i et spill eller i felles kode.
- Bruk den alltid med fullt nivå før en versjon foreslås publisert.
- Ved rene dokumentasjonsendringer holder det med en liten kontroll. Agenten velger nivå etter risiko.
- (utkast) Commit før kontrollen, så rapporten gjelder en bestemt commit.
- (utkast) Kjør `node test/kjor.mjs` etter endringer i et spill eller i felles kode.
- (utkast) Lagre QA-rapporten uendret i `qa/rapporter/<dato>-<spill>-<kort-sha>.md` i en egen commit etter kontrollen. Ved PR til `main` sjekker `test/publiseringssjekk.mjs` at rapporten gjelder siste kodeendring.
- Gi agenten spill, versjon, commit (utkast) og hva som er endret, men ikke din egen vurdering av resultatet.
- Agenten endrer ikke kode. Hovedagenten retter feil og ber deretter om ny kontroll (utkast: av den nye committen).
- Vis rapporten uendret i sak, også kontrollene som ikke kunne utføres.
- (utkast) Automatiske tester, EVN Game QA, Evens spilltest og voksen godkjenning er fire ulike lag. Ett lag erstatter aldri et annet. Se `.claude/arbeidsflyt.md`.
- (utkast) Sjekk at linja «Grunnlag» i rapporten viser standarden og agenten fra repoet. Gjør den ikke det, er kontrollen gjort mot feil grunnlag og må tas på nytt.

## Statistikk

- Alle spill skal ha felles statistikk etter ST1–ST8 i standarden. Nye spill får den fra start, med `statistikk.js` i `<head>` og `document.dispatchEvent(new Event('evn-start'))` når spillingen begynner.
- Bevar statistikken ved videreutvikling. Kjør `test/statistikk/` lokalt etter endringer i start, pause eller `statistikk.js`.
- Statistikkontroll er et fast punkt før en versjon foreslås publisert.
- Endre aldri hendelsesnavn uten en dokumentert overgangsplan i `ENDRINGSLOGG.md`.

## Grensesnitt (utkast)

- Felles betjening, navigasjon og symboler på tvers av spillene står i `.claude/evn-ui-standard.md` (EVN UI-standard 1.0, godkjent 3. november 2026). KS1–KS15 gjelder nye spill fra første versjon, og eksisterende spill når trinnet som innfører kravet er godkjent og publisert.

- UI1–UI10 er godkjent hovedløsning for grensesnitt under spilling. De brukes i `prototype/ui/` og er tenkt for Mørkeskogen 2.0.
- Ikke bygg om grensesnittet i eksisterende spill etter UI1–UI10 uten at Even har prøvd løsningen og en voksen har godkjent det for spillet.
- Tallene i UI8a–c er foreløpige og skal aldri alene godkjenne et grensesnitt.

## Godkjenning

1. Kritiske avvik skal håndteres før videre godkjenning.
2. Even godkjenner den kreative spillopplevelsen og er hovedtester av den. (Presisert 2. november 2026: Even er også hovedtester.)
3. En voksen godkjenner offentlig publisering.

Publiser aldri uten at en voksen har godkjent den konkrete versjonen. En QA-rapport er ikke en godkjenning.

## Publiserte spill

Funn fra EVN Game QA skal ikke føre til automatiske endringer i publiserte spill. Rettinger foreslås først og følger samme godkjenning som andre versjoner.
