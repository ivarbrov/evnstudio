# EVN Game QA: Forsiden (nettside), gren `nettside/dyrepatruljen-kortbilde`

Grunnlag: agent 2.2, standard 1.2 utkast (gjeldende 1.1) (55d5794116fb74ae842b6d60fed4e7b160157472), commit 2abcf4552bdca042114f0cf944e3a94c585c55d2
Testkvittering: evn1 commit=2abcf4552bdca042114f0cf944e3a94c585c55d2 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: liten – endringen er bare CSS i `.spillkort .tekst` på forsiden pluss én rad i ENDRINGSLOGG.md. Den rører ikke spillogikk, felles kode, lagring, CSP eller domener.
Testet: Linux, `node test/kjor.mjs` med Playwright Chromium 1243 (CI=true): 85 ok, 0 feil, 0 varsel, 1 kjent, 2 ikke innført. Jeg har lest `git diff origin/main..HEAD` og CSS-en i `index.html`, og sammenlignet filer med `git archive origin/main` og `cmp`. Jeg startet lokale servere for grenen og for main (port 8731 og 8732), men pikselsammenligningen i Chromium fikk ikke tillatelse og ble aldri kjørt (se under). Begge serverne er stoppet, og arbeidstreet er rent.

## Oppfylte krav
- **K3** (endringslogg): Den nye raden i ENDRINGSLOGG.md stemmer med diffen. Den sier «Kun CSS (`.spillkort .tekst`)», og det er det eneste som er endret i `index.html`. Raden sier også ærlig at feilen ikke er gjenskapt i Chromium og ikke testet i Safari. Forsiden har ikke eget versjonsnummer.
- **S1** (forsiden): Diffen endrer ikke CSP, og den legger ikke til eksterne domener eller skript.
- **Testsuiten**: Alle kontroller er OK. Den eneste KJENT er T3 for Fossil Zoo (`user-scalable=no`), som står under kjente funn i standarden og er uendret. Statistikk og UI er «ikke innført» både her og på main.

Disse rammene har jeg kontrollert ved å lese kode og sammenligne filer, ikke ved å se siden i nettleser:
- **Mørkeskogen-bildet fra PR #17 er uendret.** `bilder/morkeskogen.jpg` er byte-identisk med origin/main, og diffen inneholder ingen filer under `bilder/` eller `spill/`.
- **Markup er uendret.** Spillkort, lenker (`href`), `src`/`srcset`, alt-tekster og maskot er de samme.
- **Oppsettet er uendret.** Ut fra CSS-en gir den nye utregningen samme margin som før: `calc(-1 * var(--overlapp))` blir −64 px på PC og −40 px under 681 px, akkurat som på main.
- **Fargene i kortet er uendret.** Kortet har ensfarget `background: var(--flate)` (linje 83–84), så det tette `--flate`-feltet i tekstdelen skal ikke synes. Overgangen til tett farge ligger 1–5 px over bildets nederste kant.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen verifiserte avvik.

- **Mulig problem (forutsetningen i oppdraget):** I skjermbildet fra iPhone (`/mnt/user-data/uploads/6a9a1774-image.jpg`) ser bildets nederste del bare delvis mørklagt ut rett over streken. Etter PR #14 skal toningen være helt tett nederst. Det kan bety at skjermbildet viser en bufret versjon fra før PR #14. **Slik avgjøres det:** Ta et nytt skjermbilde på iPhone av publisert main, med tømt buffer eller privat fane. Da vet vi om streken faktisk overlevde PR #14 før denne rettingen vurderes.

## Anbefalte forbedringer
- Kommentaren på linje 95 forklarer årsaken som sikker («kantutjevnes hver for seg»). ENDRINGSLOGG kaller den «sannsynlig». Kommentaren bør bruke samme forbehold til rettingen er bekreftet på iPhone.

## Kontroller som ikke kunne utføres
- **Visuell regresjon i Chromium** (piksel-diff av spillkort, main mot gren, i 375×812@3, 390×844@3, 412×915@2.625, 740×360 og 1280×800@1/1.25, i tillegg til sideveis rulling, trykkflater og konsollfeil på forsiden): Skriptet ble stoppet fordi ingen svarte på tillatelsesforespørselen. Rammene «uendret oppsett og bilder» er derfor bare kodelest, ikke kjørt. Dette er det viktigste hullet i kontrollen.
- **K1 på forsiden**: Røyktesten dekker spillene. Konsollfeil og manglende filer på forsiden er ikke kjørt.
- **T1 og T4 på forsiden**: Ikke målt (kun kodelest: knappene har `min-height: 52px` på mobil).
- **E: Om streken faktisk er borte på iPhone/Safari.** Det finnes ikke WebKit eller ekte enheter her, og ifølge endringsloggen er feilen heller ikke gjenskapt i Chromium. Selve formålet med endringen kan derfor bare bekreftes på en ekte iPhone.
- **F1–F3, U1–U3, T2, T3, Y1, Y2, K2, S2–S4, ST1–ST8 og UI1–UI10**: Ikke relevant. Forsiden er ikke et spill, og endringen berører verken start, pause, lagring eller statistikk.
- **V**: Even må vurdere om kortene ser like ut som før.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil, og koden tyder på at kortene ser ut og er bygget opp som før. Men den visuelle sammenligningen i Chromium ble ikke kjørt, og om streken faktisk er borte, kan bare vises på en ekte iPhone. F1 gjelder ikke, fordi forsiden ikke er et spill.
