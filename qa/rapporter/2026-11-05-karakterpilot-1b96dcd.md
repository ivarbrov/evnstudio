# EVN Game QA: Karakterpilot (prototype/figurer og verktoy/figurer), commit 1b96dcd (sammenslåing med main 86a6289)
Grunnlag: agent 2.2, standard 1.2 utkast med 1.2a og 1.2b (gjeldende 1.1 + S2 fra 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1b96dcdb5f0c0f619570d9580d489bfb515073a0
Testkvittering: evn1 commit=1b96dcdb5f0c0f619570d9580d489bfb515073a0 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget gjelder publisering, og da kreves fullt nivå. Selve endringen er avgrenset. `git diff origin/main 1b96dcd` utenom `prototype/figurer/`, `verktoy/figurer/` og `qa/rapporter/` er tom. `git diff fa4cede 1b96dcd -- prototype/figurer verktoy/figurer` er også tom, så figurfilene er byte-like med forrige kontroll.
Testet:
- **Grunnlaget:** Standarden og agentfilen er like i 1b96dcd, fa4cede og origin/main (standard 119ac87, agent d2b296a). Arbeidsmappa (`kvalitet/felles`, f80548d) har en eldre standard med hash dad89dd. Jeg har kontrollert mot 119ac87 fra commiten.
- **Testsuiten:** Commiten ble klonet til scratchpad og sjekket ut detached på 1b96dcd, med `refs/remotes/origin/main` satt til 86a6289. Der kjørte jeg `node test/kjor.mjs --base origin/main` med Chrome uten skjerm.
- **Nettleserpanelet (Chromium):** En `git archive`-kopi ble servert med et eget Node-skript på 127.0.0.1:8792. Jeg testet i skrivebordsstørrelse og emulert 375×812 og 740×360. Ekte klikk og Tab/Enter brukte jeg på for-etter.html. Gjennomgangen av alle visninger gjorde jeg med syntetiske `click()`.
- **Feiltester:** Eget CDP-skript i headless Chrome, uten WebGL og med blokkerte GLB-filer.
- `localStorage` og informasjonskapsler var tomme før og etter.

## Oppfylte krav
- **F1:**
  - Spillene: Røyktesten på 1b96dcd ga OK for start, pause og fortsett i alle fem spillene. Dyrepatruljen kjørte nå 0.11.4, som er versjonen fra main, så forbeholdet fra fa4cede om manglende fletting er løst.
  - Prototypesidene: Alle 13 visninger i for-etter.html lastet med riktige navnelapper, og alle 3 ytelsesvisningene viste 30 figurer. Alle 5 visninger i modell.html og alle 13 knapper i skisser.html virket. Ingenting hang.
- **K1:** Ingen konsollfeil og ingen svar med status 400 eller høyere ved normal bruk av de tre sidene. Røyktestens K1-kontroller ga OK for alle spill.
- **K2 og B3 i for-etter.html:** verifisert på nytt i tre tilfeller.
  - Uten WebGL vises meldingen «Klarte ikke å vise figurene …».
  - Blokkeres rev-v1.glb, vises meldingen, og alle 13 knappene forblir låst.
  - Blokkeres rev.glb ved klikk på «Med reven», vises meldingen og knappene låses opp.
- **S1:**
  - De tre sidene har CSP med `default-src 'self'`. Alle forespørsler gikk til 127.0.0.1, og nettleserkoden har ingen `eval`, `new Function` eller eksterne URL-er.
  - Den statiske suiten ga OK for spillene.
- **S2:** Sidene har ingen konto, chat, kjøp, reklame eller innsamling. Ingen informasjonskapsler, og `localStorage` var tom etter bruk.
- **S4:** Personvern- og sikkerhetssidene er uendret mot main. De nye sidene gjør ikke noe som sidene ikke dekker.
- **T1 (emulert):** Minste knapphøyde er 44 px på alle tre sidene i 375×812 og 740×360. Minste bredde er 57 px, i skisser.html.
- **T2:** Tab og Enter aktiverte «Nærbilde» i for-etter.html, med ekte tastetrykk. Sidene har ingen dialoger.
- **T3 (zoom):** viewport er `width=device-width, initial-scale=1` på alle tre sidene. Statisk suite ga OK for spillene, med unntak av det kjente funnet i Fossil Zoo (se under).
- **T4:** Kontrasten er uendret siden fa4cede, beregnet til omtrent 7,5:1 for brødtekst.
- **K3 for spillene:** Røyktesten viste versjonsnummer på alle startkortene (Era Defenders 0.21.0, Mørkeskogen 2.0.0, Dyrepatruljen 0.11.4, Magiske egg 0.9.0, Fossil Zoo 0.8.0). ENDRINGSLOGG har rad for Dyrepatruljen 0.11.4.
- **E-coins (EC0–EC12):** Alle 20 kontroller ga OK.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **K2/B3, mulig problem (kjent fra fa4cede, uendret):** `rev/modell.html` og `rev/skisser.html` viser ingen melding når WebGL mangler. Konsollen får det ufangede unntaket «Error: Error creating WebGL context.», og lerretet står tomt.
   - Gjenskapes i Chrome med `--disable-3d-apis --disable-webgl`.
   - Om K2 og B3 gjelder prototypesider som ikke er spill, må en voksen avgjøre.
2. **K3, mulig problem (kjent fra fa4cede, uendret):** ENDRINGSLOGG.md i 1b96dcd har ingen rad for de nye offentlige sidene under `/prototype/figurer/` og `/verktoy/figurer/`.
   - En tidligere rad sier at robotverktøyet (`felles/robot/`) «publiseres ikke». Denne publiseringen legger derimot figurverktøy og skript ut offentlig.
   - Om K3 gjelder for prototyper, må en voksen avgjøre.
3. **T3, Fossil Zoo: kjent funn i standarden, ikke nytt.** `user-scalable=no` sperrer fortsatt zoom. Suiten merker det som «kjent».

## Anbefalte forbedringer
Alle er uendret fra fa4cede, og kodelinjene er de samme.
- **for-etter.html, feil midt i en visning:** Etter at en visning har feilet, blir feilmeldingen stående i målefeltet også når neste visning virker. Verifisert på nytt: «Nærbilde» lastet etter blokkert rev.glb, men meldingen sto fortsatt.
- **for-etter.html uten WebGL:** Knappene er aktive, men gjør ingenting. De kan låses eller skjules.
- **Ugyldige adresseparametere:**
  - `skisser.html#vinkel=ukjent` gir et ufanget TypeError.
  - `for-etter.html#vis=%22` gir en misvisende WebGL-melding.
  - Jeg har ikke kjørt disse på nytt. Koden er byte-lik med fa4cede.
- **skisser.html ved 375 px:** 26 px sideveis rulling, målt på nytt.
- **CSP:** Prototypesidenes CSP mangler `object-src 'none'`, `base-uri 'self'` og `form-action 'none'`, som spillene har. De bør samkjøres med spillene.
- **Valgt knapp:** Den valgte knappen vises bare med fyllfarge. Kantlinje eller ikon i tillegg vil gjøre markeringen tydeligere.
- **hent-rev.cjs:** `verktoy/figurer/hent-rev.cjs` bruker `eval` i Node. Skriptet blir en offentlig fil ved publisering, så `vm.runInNewContext` eller `require` hadde vært ryddigere.

## Kontroller som ikke kunne utføres
- **F2, F3:** Ikke testet på denne commiten. Prototypesidene lagrer ingenting, og spillene er byte-like med main 86a6289, som fikk egen full kontroll i `qa/rapporter/2026-11-05-dyrepatruljen-b801a24.md`.
- **U1:** Ikke relevant, prototypesidene har ikke startkort. For spillene ga røyktesten OK for versjon på startkortet.
- **U2, U3 (V):** Ikke testet. Om figurene og tekstene fungerer for Even, må Even vurdere. Even har ikke godkjent figurene for bruk i spill.
- **T1 (E), T3 med prefers-reduced-motion (E):** Ikke testet på faktisk enhet, og sidene sjekker ikke `prefers-reduced-motion`. Animasjonen starter bare når brukeren trykker og varer 8 sekunder.
- **Y1 (E):** Ikke testet. Ingen referansemobil er valgt.
- **Y2:** Kun kodelest, siden animasjonen bruker `THREE.Clock`-delta. Bildefrekvens ble ikke målt, fordi panelet ble rendret i bakgrunnen og ett skjermbilde fikk tidsavbrudd.
- **K3:** Se avvik 2.
- **S3, B7:** Ikke relevant, sidene har ingen fritekst.
- **B1, B2, B4, B5, B6:** Ikke relevant for prototypesidene. Spillene er uendret mot main og ikke kontrollert ut over suiten.
- **B3, lavere grafikk på svake enheter (E):** Ikke testet. Sidene bruker skygge med 2048-kart og har ingen nedskalering utover pikselforhold maks 2.
- **ST1–ST8:** Ikke testet.
  - `test/statistikk/` finnes verken på 1b96dcd eller på origin/main, så ST8 kunne ikke kjøres.
  - `statistikk.js` og spillenes start og pause er byte-like med main.
  - Prototypesidene laster ikke statistikk, og det er riktig siden de ikke er spill.
  - Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **UI1–UI10:** Ikke kontrollert. Status er godkjent hovedløsning, og kravene er ikke tatt i bruk her. UI-suiten er «ikke innført».
- **Ekte berøring, iPhone, Android og Safari (E):** Ikke testet. Mobilstørrelsene var emulerte.
- **Testserveren:** Serveren jeg startte (Node, PID 48152, port 8792) er stoppet, og porten er fri.
  - Tre Python-servere fra tidligere økter lytter fortsatt på 127.0.0.1:8765 (PID 7176, 35648 og 39700, der 39700 er fra forrige QA-kjøring). Jeg brukte dem ikke, og de må stoppes manuelt.
- **Midlertidige filer:** De ligger i scratchpad: `C:\Users\sss480\AppData\Local\Temp\claude\b1ad4f01722a3e7a\e6e8d332-0f44-45a4-aef6-2201f900bad2\scratchpad\klon-1b96dcd`, `...\scratchpad\kode`, `...\scratchpad\qa-1b96dcd-skript\server.mjs` og `...\scratchpad\kjor-1b96dcd.json`. Repoet er uendret: `git status` er rent, og grenen er `kvalitet/felles`.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. F1 er testet for både spillene og prototypesidene på den flettede commiten, og alle automatiske suiter som finnes, ga OK. Forbeholdene er de samme som for fa4cede: ytelse og ekte mobil er ikke testet, modell.html og skisser.html mangler melding når 3D ikke virker, og endringsloggen har ingen rad for de nye offentlige sidene. Vurderingen er ikke en godkjenning av figurene eller av offentlig publisering.
