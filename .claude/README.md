# Felles kvalitetsfiler for EVN Studio

Denne mappen og `CLAUDE.md` i roten styrer kvalitetskontrollen for alle spill på evnstudio.no.

## Felles og autoritative filer

Når grenen `kvalitet/felles-qa` er godkjent og slått sammen, er den autoritative plassen `main` i `ivarbrov/evnstudio`. I dag har `main` ingen av disse filene.

Til da gjelder dette:
- Gjeldende krav er standard 1.1 (godkjent), som ligger på `feature/statistikk`.
- Grenen `kvalitet/felles-qa` har utkast 1.2 av standarden og utkast 2.0 av agenten. Det samme gjelder `CLAUDE.md`, der nye regler er merket «(utkast)». De samler alt fra grenene, men nye regler i dem gjelder ikke før en voksen har godkjent dem.

| Fil | Innhold | Hvem bruker den |
|---|---|---|
| `.claude/evn-game-standard.md` | EVN Game Standard: alle krav, status og kontrollmetode | EVN Game QA, utviklere og Claude Code |
| `.claude/agents/evn-game-qa.md` | Agentdefinisjonen for EVN Game QA | Claude Code laster den når en økt åpnes i repoet |
| `CLAUDE.md` | Arbeidsregler for Claude Code: kvalitetskontroll, statistikk, grensesnitt og godkjenning | Claude Code laster den i hver økt, også for EVN Game QA |
| `.claude/README.md` | Denne filen | Alle |
| `.claude/vedtak.md` | Originaltekst og godkjenninger for kravene | Alle som skal kontrollere hva som er vedtatt |
| `.claude/arbeidsflyt.md` | De fire lagene (tester, QA, Even og godkjenning), GitHub-flyten og testplanen (forslag) | Alle |
| `test/statistikk/` | Automatisk test av ST1–ST8 (finnes på `feature/statistikk`) | EVN Game QA, senere GitHub Actions |

Det finnes bare én standard og én agent for alle spill. Krav som bare gjelder enkelte spill, står i standardens oversikt over betingede krav, ikke i egne filer.

## Lokale kopier som blir overflødige

Disse kopiene er laget underveis. De skal ikke redigeres mer, og de kan slettes når grenen er slått sammen med `main`. Ingen av dem er slettet ennå.

| Kopi | Innhold | Hva som skjer |
|---|---|---|
| Eierens OneDrive, utenfor repoet | Sikkerhetskopi av utviklingsgrenene (filer og git-bundle) og de gamle 1.0-kopiene i `gammel-1.0/` | Beholdes etter eierens vedtak. Redigeres ikke. Kopieres på nytt fra repoet ved behov |
| Mappen Claude-appen laget for økta «EVN Game QA» | Standard 1.0 og agent 1.0 | Forsvinner når økta slettes |
| `.claude/` og `CLAUDE.md` på `chore/evn-game-qa` | Standard 1.0 og agent 1.0 | Erstattes av denne grenen |
| Samme filer på `feature/fossil-startkort` og `feature/morkeskogen-ui` | Standard 1.0 og agent 1.0 | Erstattes når grenen henter `main` |
| Samme filer på `feature/statistikk` | Standard 1.1 og agent med statistikk | Innholdet er tatt inn her. Erstattes når grenen henter `main` |

## Slik holdes filene like

1. Endringer i standarden, agenten og `CLAUDE.md` gjøres bare på en egen gren fra `main`, aldri direkte i en spillgren.
2. Endringen får nytt versjonsnummer og en rad i standardens versjonshistorikk eller agentens versjonslinje.
3. Krav som endres eller blir gjeldende, godkjennes av en voksen før grenen slås sammen med `main`.
4. Etter sammenslåing henter alle aktive spillgrener `main` (`git merge main`). Får en gren konflikt i disse filene, gjelder versjonen fra `main`.
5. Lag aldri en egen kopi av standarden eller agenten for ett spill. Mangler noe, foreslå det som endring i den felles filen.

## Slik kontrolleres det at Claude Code bruker riktig agent og standard

1. Åpne Claude Code i repoet, eller i en arbeidsmappe for en gren av det.
2. Kjør `claude agents` i terminalen. `evn-game-qa` skal stå under prosjektagenter. Det skal ikke finnes en `evn-game-qa` i `~/.claude/agents`, fordi den da kan skygge for prosjektets.
3. Hver QA-rapport har linja «Grunnlag» med agentversjon, standardversjon, hash og commit. Sammenlign med:
   - `git hash-object .claude/evn-game-standard.md`
   - `git rev-parse HEAD`
   - versjonslinja øverst i agentfilen
4. Stemmer ikke tallene, er kontrollen gjort mot feil grunnlag og må tas på nytt.

## Automatiske tester og andre kontroller

Standarden merker hvert krav med kontrollmetode: A (automatisk og objektiv), Q (EVN Game QA), E (faktisk enhet) og V (Even).

| Automatisk test | Krav | Status |
|---|---|---|
| `test/statistikk/` | ST1–ST5 (ST8 sier at den skal kjøres) | Finnes på `feature/statistikk`. Kjøres lokalt |
| `window.EVNUIMaal()` i `prototype/ui/` | UI7, deler av UI8 | Finnes på `feature/morkeskogen-ui`. Måler bare med rektangler. Brukes av suiten `ui` |
| `test/index.html` og `test/kjor.mjs`: suitene `statisk`, `royk`, `statistikk` og `ui` | S1, T3, F1, K1, U1, ST1–ST5, UI7 | Laget og prøvd lokalt (trinn 3). Kjøres med `node test/kjor.mjs` |
| `test/publiseringssjekk.mjs` | QA etter siste kodeendring, full QA, K3 | Laget og prøvd lokalt (trinn 3). Brukes ved PR til `main` |
| UI-måling per kategori og kjernesone | UI8a–c | Ikke laget. Krever at elementene i prototypen merkes med `data-ui` |
| GitHub Actions | Alle A-tester | Utkast i `.claude/utkast/kvalitet.yml`, ikke aktiv (trinn 4) |

Krav merket Q, E eller V kan ikke erstattes av automatiske tester. Even er hovedtester av spillopplevelsen.
