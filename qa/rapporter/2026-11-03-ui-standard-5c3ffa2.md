# EVN Game QA: EVN UI-standard 1.0 (dokumentasjon, gren `kvalitet/ui-standard`)
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (55d5794116fb74ae842b6d60fed4e7b160157472), commit 5c3ffa2debd0cddbd90ed5a811e6ef7d55034629
Testkvittering: evn1 commit=5c3ffa2debd0cddbd90ed5a811e6ef7d55034629 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok. Testene ble ikke kjørt på nytt, slik oppdraget sa. Commit i kvitteringen er den samme som HEAD.
Nivå: dokumentasjon (lavere enn liten). Bare `.claude/evn-ui-standard.md`, `.claude/vedtak.md`, `.claude/README.md` og `CLAUDE.md` er endret mot main. Ingen spillkode, felles kode eller lagring er endret.
Testet: statisk kontroll. Jeg leste `git diff main...HEAD` og `git diff b0822f1 HEAD`, sammenlignet ID-ene med `.claude/evn-game-standard.md` og søkte i `spill/*/index.html` med grep. Jeg brukte ingen nettleser, fordi ingen kjørbar kode er endret. `git status` viser at arbeidstreet er rent.

## Oppfylte krav
- **Funn 1 (Avslutt i Era):** Rettet. Komponenttabellen sier nå at `#evnAvslutt` er i bruk i alle spill unntatt Era Defenders, som har `#avsluttKnapp`. Grep stemmer med dette:
  - `spill/eventyrspill/index.html` har tittelen «Era Defenders – v0.21.0». Den har `avsluttKnapp` 6 ganger og `evnAvslutt` 0 ganger.
  - De fire andre spillene har `evnAvslutt` mellom 4 og 7 ganger og ingen `avsluttKnapp`.
  - KS4 står nå i bruddlisten for Era. Påstanden om at EVN-PAUSE v2, EVN-NULLSTILL v1 og `#evnSporsmal` er i bruk i alle fem spill, stemmer med grep.
- **Funn 2 (forholdet til UI1–UI10):** Rettet. Et nytt avsnitt beskriver hvordan KS13 og KS14 forholder seg til UI7 og UI1, og at UI3 går foran KS5. Avsnittet er merket som presisering som eieren må bekrefte. Status «godkjent hovedløsning 2. november 2026» stemmer med `evn-game-standard.md` linje 97.
- **Funn 3 (tolkningen av vedtaket):** Rettet. `vedtak.md` gjengir de tre svarene ordrett som i oppdraget. Teksten skiller nå mellom beskrivelsen av alternativet og hvordan Claude Code har tolket det, og sier at eieren må bekrefte tolkningen.
- **Funn 4 (ulik formulering):** Rettet. `CLAUDE.md` sier nå «godkjent og publisert», som standarden.
- **Funn 5 (KS6 viste til T4):** Rettet. KS6 bygger nå på «Nytt krav (støtter U2 og U3)». U2 og U3 finnes i standarden (linje 48–49).
- **Funn 6 (plasseringen av ⏸ i KS1):** Rettet. KS1 sier nå «i topplinjen til høyre (Avslutt står ytterst, se KS5)», og det stemmer med rekkefølgen i KS5.
- **Funn 7 (tom linje i `CLAUDE.md`):** Rettet. Grensesnittlisten er nå sammenhengende.
- **`.claude/evn-game-standard.md` er uendret:** `git diff main...HEAD` gir 0 linjer for filen, og hashen er den samme på main og i arbeidstreet (55d5794…).
- **Henvisningene i KS-tabellen stemmer:** F1, U1, U2, T2, K2, B1, B2, UI1, UI3, UI7 og UI10 finnes alle i standarden.
- **K3:** Gjelder ikke. Ingen spillversjon er endret.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen.

## Anbefalte forbedringer
- **Presiseringen om UI3 og KS5 bør også nevne KS1 og KS2 (forbedringsforslag).** Når ☰ er inngangen til pausen, finnes det kanskje ingen ⏸. Da peker KS1 («⏸ står i topplinjen til høyre») og KS2 («rett til venstre for ⏸») på en knapp som ikke finnes. Det bør stå at de da gjelder ☰. Eieren bør ta dette med når presiseringen bekreftes.
- **Teksten kan leses som selvmotsigende (forbedringsforslag).** Innledningen sier «Den endrer ingen krav der», mens det nye avsnittet sier at KS13 og KS14 «gjør de tilsvarende delene av UI7 og UI1 obligatoriske». For å unngå at noen leser det som en endring av UI-statusen, kan avsnittet si at dette skjer «gjennom egne krav KS13 og KS14, uten å endre status for UI1 og UI7».
- **Ordlyden er endret etter godkjenningen (forbedringsforslag).** KS1, grunnlaget for KS6 og komponenttabellen er endret etter godkjenningen 3.11.2026, men versjonshistorikken har fortsatt bare én rad for 1.0. Eieren bør bekrefte den endelige teksten før merge, eller historikken bør få en kort note om rettingene etter QA. Endringene i KS1 og KS6 er ikke merket som presiseringer slik som de andre.

## Kontroller som ikke kunne utføres
- Den automatiske testsuiten ble ikke kjørt på nytt, slik oppdraget sa. Kvitteringen er tatt med som oppgitt, og commit-SHA stemmer med HEAD.
- Krav om kjøring (F1, KS1–KS15 i spillene) er ikke testet i nettleser og er ikke relevante. Ingen kjørbar kode er endret, og KS-kravene er ennå ikke gjeldende for eksisterende spill.
- Bruddlistene for KS per spill ble kontrollert bare for Era KS4 og komponentene over. De andre bruddmarkeringene er ikke kontrollert på nytt mot koden.
- Om tolkningen av vedtaket og presiseringen om UI3 og KS5 er riktige, kan bare eieren avgjøre (V).

## Klar for testing hos Even?
JA MED FORBEHOLD – Endringen gjelder bare dokumentasjon. Ingen spill er endret, så Even har ikke noe nytt å teste, og F1 er ikke relevant. Før merge bør eieren bekrefte tolkningen av vedtaket og presiseringen om UI3 og KS5, og helst også ordlyden som er endret etter godkjenningen.
