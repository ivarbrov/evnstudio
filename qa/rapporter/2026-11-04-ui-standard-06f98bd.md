# EVN Game QA: EVN UI-standard 1.1 (dokumentasjon, ingen spillversjon)
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, gjeldende 1.1) med 1.2b (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 06f98bd482d0d1ca71a1efe0dd824f7dce376d32
Testkvittering: `evn1 commit=06f98bd482d0d1ca71a1efe0dd824f7dce376d32 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok` (oppgitt i oppdraget med 85 ok og 0 feil. Jeg har ikke kjørt suiten på nytt, slik oppdraget ba om.)
Nivå: liten – Commit 06f98bd endrer bare dokumentasjon (`.claude/evn-ui-standard.md`, `.claude/vedtak.md`, `CLAUDE.md`). Sammenslåingen 9702b68 tar inn kode fra `main` som allerede er kontrollert der, og den endrer ikke koden. `git diff ff61022 9702b68` viser bare grenens egne filer.
Testet: Statisk kontroll med git på Linux. Jeg har lest diffene, sammenlignet standarden med `origin/main` og søkt etter Avslutt-elementene i `spill/*/index.html` på `origin/main` (ff61022). Jeg har ikke kjørt spillene i nettleser.

## Oppfylte krav
- **Commit:** `git rev-parse HEAD` gir 06f98bd482d0d1ca71a1efe0dd824f7dce376d32, som forventet. Agentfila i repoet er versjon 2.2.
- **Standarden er identisk med `main`:** `.claude/evn-game-standard.md` har samme blob-hash (119ac87) på HEAD og på `origin/main` (ff61022), og `git diff origin/main HEAD` gir ingen forskjell. Versjonshistorikken inneholder 1.2b. Merk: den lokale grenen `main` står på det gamle punktet 048eb04, og mot den er det en forskjell (1.2b mangler). Sammenligningen er derfor gjort mot `origin/main`, som er den faktiske `main` etter PR #23.
- **Vedtaket er gjengitt riktig:** `.claude/vedtak.md` gjengir «Enig. Iverksette» ordrett. Anbefalingen er gjengitt som «🚪 Avslutt» i toppraden, ✕ bare for Lukk og byttet i trinn 3. Dette stemmer med oppdraget.
- **KS4 og ikonordboka henger sammen:** KS4 sier «🚪 Avslutt», og bare 🚪 der plassen er liten. Ikonordboka sier at ✕ betyr Lukk og ikke Avslutt, og at 🚪 betyr Avslutt og ikke Lukk. KS1, KS5, KS10 og KS11 omtaler Avslutt som funksjon uten symbol, så de er ikke i konflikt. Komponenttabellen legger byttet til trinn 3 sammen med EVN-PAUSE v3, i tråd med vedtaket.
- **KS6 i bruddlistene:** KS6 er lagt til for alle fem spill. Påstanden om at alle bruker ✕ for Avslutt i toppraden stemmer på `origin/main`:
  - Era Defenders: `#avsluttKnapp` «✕ Avslutt»
  - Mørkeskogen, Fossil Zoo og Magiske egg: `#evnAvslutt` «✕ Avslutt», med teksten skjult på små skjermer
  - Dyrepatruljen: `#evnAvslutt` med bare «✕»
  
  I tillegg bruker pausen i alle fem (EVN-PAUSE v2, `#evnPauseAvslutt`) allerede «🚪 Avslutt». I dag har altså Avslutt to symboler i hvert spill, så KS6 er brutt. Det bekrefter at bruddlistene er riktige.
- **Versjonen er oppdatert overalt:** Overskriften i UI-standarden (1.1, 4.11.2026), versjonshistorikken og `CLAUDE.md` er oppdatert. Ingen spillkode er endret.
- **K3:** Gjelder ikke direkte, siden ingen spillversjon publiseres. UI-standarden har sin egen versjonshistorikk, og `ENDRINGSLOGG.md` har heller ikke tidligere hatt oppføringer for standardene.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **Mulig problem (vedtak.md):** Setningen «Even kan fortsatt be om å endre valget før trinn 3 bygges.» står rett etter det ordrette vedtaket. Den står ikke i eierens svar, og den er ikke merket som Claude Codes tillegg. Andre presiseringer i fila er merket «må bekreftes av eieren». Eieren må bekrefte setningen, eller den må merkes som Claude Codes kommentar.

## Anbefalte forbedringer
- `.claude/vedtak.md` linje 84 (under 3.11.2026) sier fortsatt «Ikke avgjort: symbolet for Avslutt i HUD (Evens valg)». Linja er historisk riktig, men en kort henvisning som «avgjort 4.11.2026, se under» gjør fila lettere å lese.
- Ikonordboka sier at 🚪 også gjelder «tap- og valgskjermer». Det går litt lenger enn den ordrette anbefalingen («i toppraden»), men det følger av at ✕ bare skal bety Lukk. Hvilket symbol Avslutt har på tap- og valgskjermene i spillene i dag, er ikke kartlagt her. Ta det med i sjekklista for trinn 3.
- Oppdater eventuelt den lokale `main` (`git fetch`/fast-forward i hovedarbeidsmappa) så den ikke gir feil sammenligning senere. Jeg har ikke gjort det, fordi agenten ikke endrer repoet.

## Kontroller som ikke kunne utføres
- **Testsuiten:** Ikke kjørt på nytt av meg, etter oppdraget. Kvitteringen over er den oppgitte.
- **Symbolet i spillene i kjøring:** Kontrollen er bare gjort i kildekoden på `origin/main`. Jeg har ikke sett på hva som faktisk vises i nettleseren.
- **KS6 og ikonordboka (Q), og om barn forstår 🚪 mot ✕ (V):** Krever Evens vurdering, og det står åpent i vedtaket.

## Klar for testing hos Even?
JA – Endringen er ren dokumentasjon og stemmer med vedtaket og med koden på `main`. Det eneste funnet er en setning i `vedtak.md` som ikke er merket. Den bør bekreftes av eieren eller merkes, men hindrer ikke videre arbeid.
