# EVN Game QA: Karakterpilot (prototype/figurer og verktoy/figurer), commit fa4cede
Grunnlag: agent 2.2, standard 1.2 utkast med 1.2a og 1.2b (gjeldende 1.1 + S2 fra 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit fa4cede547cc77a4ae6d01b563eb46dbe099a321
Testkvittering: evn1 commit=fa4cede547cc77a4ae6d01b563eb46dbe099a321 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget gjelder publisering, og da er fullt nivå påkrevd. Endringen er avgrenset: `git diff ff61022 fa4cede` berører bare `prototype/figurer/` og `verktoy/figurer/`. Jeg har sjekket at `spill/`, `ecoins/`, `butikk/`, `statistikk.js`, `vendor/`, forsiden, `personvern/` og `sikkerhet/` ikke er endret.
Testet: Commiten ble klonet til en mappe i scratchpad utenfor repoet og sjekket ut detached på fa4cede. I klonen satt jeg refs/remotes/origin/main til 51d39e7. Så kjørte jeg `node test/kjor.mjs --base origin/main` med Chrome uten skjerm. En `git archive`-kopi ble servert med `python -m http.server` på 127.0.0.1:8765.
- Nettleserpanelet (Chromium): 1280-skrivebord, 375×812 og 740×360 (emulert). Ekte klikk og tastetrykk på for-etter.html. På modell.html og for å gå gjennom alle visninger brukte jeg syntetiske `click()`.
- Eget CDP-skript i scratchpad (headless Chrome) for feiltester: uten WebGL (`--disable-3d-apis --disable-webgl`) og med blokkerte GLB-filer via Fetch.failRequest.
- `localStorage` og informasjonskapsler var tomme før og etter.
- Grunnlaget: Standarden i fa4cede er lik den på origin/main (119ac87). Arbeidsmappa står på `kvalitet/felles`, og der har standarden en annen hash (dad89dd). Det er en eldre utgave uten 1.2a og 1.2b. Jeg har kontrollert mot 119ac87. Agentfilen er lik i HEAD, fa4cede og origin/main.

## Oppfylte krav
- **F1:** Prototypesidene og spillene ble kontrollert hver for seg.
  - Prototypesidene: Alle 13 visninger i for-etter.html lastet med riktige figurnavn. Det samme gjaldt alle 5 i modell.html og standardvisningen i skisser.html. Ingenting hang. «Ytelse: 30 rever» lastet 30 figurer, og visningen kunne avbrytes med en annen visning.
  - Spillene: Røyktesten på denne commiten ga OK for start, pause og fortsett i alle fem spillene, som er uendret.
- **Låsingen av knapper (ny i fa4cede):** verifisert. Mens «Med garderobevarer» lastet, ble alle 13 knappene satt til `disabled`. Et ekte klikk på «Begge med garderobevarer» i samme periode ble ignorert, og bare robotvisningen ble vist. Knappene ble låst opp igjen etter lasting.
- **K2 og B3 i for-etter.html (nytt i fa4cede):** verifisert i tre tilfeller.
  - Uten WebGL vises meldingen «Klarte ikke å vise figurene …».
  - Blokkeres rev-v1.glb ved oppstart, vises meldingen og knappene forblir låst.
  - Blokkeres rev.glb ved klikk på «Med reven», vises meldingen, knappene låses opp, og neste visning («Nærbilde») virker.
- **kB (1 000 byte):** Siden viser 464, 475, 344 og 379 kB. Det stemmer med filstørrelsene 463988, 475460, 344388 og 378644 byte og med tabellene i RAPPORT.md og KARAKTERSTANDARD.md.
- **K1:** Ingen konsollfeil og ingen svar med status 400 eller høyere ved normal bruk av de tre sidene, kontrollert med performance-oppføringer og konsollen. Røyktestens K1-kontroller for spillene ga OK.
- **S1:** Alle tre nye HTML-sider har CSP med `default-src 'self'`. Ingen eksterne domener, og alle forespørsler gikk til 127.0.0.1. Nettleserkoden bruker ingen `eval`. Den statiske suiten ga OK for spillene.
- **S2:** Ingen konto, chat, kjøp, reklame eller innsamling. Ingen informasjonskapsler eller lagring. Jeg søkte i dokumentene og fant ingen personopplysninger.
- **S4:** De nye sidene gjør ikke noe som personvern- og sikkerhetssidene ikke dekker, og de sidene er uendret.
- **T1 (emulert):** Alle knapper er minst 44 px høye ved 375 px bredde. Minste bredde var 57×44 i skisser.html.
- **T2:** Tab og Enter virker i for-etter.html. Når den fokuserte knappen låses, mister den fokus, men neste Tab går likevel videre til neste knapp. Sidene har ingen dialoger.
- **T3 (zoom):** viewport er `width=device-width, initial-scale=1` på alle tre sidene, så zoom er ikke sperret.
- **T4:** Kontrasten er beregnet til omtrent 7,5:1 for brødtekst (#a3add3 på #131a3a) og høyere for knappetekst.
- **ST (felles):** `statistikk.js` er lik origin/main, og hostnamesperren for evnstudio.no (linje 22) er på plass. Prototypesidene laster ikke statistikk, og det er riktig siden de ikke er spill.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **K2/B3, mulig problem:** `rev/modell.html` og `rev/skisser.html` viser ingen melding når WebGL mangler. Siden står med tomt lerret, og konsollen får det ufangede unntaket «Error creating WebGL context».
   - Gjenskapes ved å åpne sidene i Chrome startet med `--disable-3d-apis --disable-webgl`.
   - Filene er ikke endret i fa4cede, men de publiseres nå. Om K2 og B3 gjelder prototypesider som ikke er spill, må en voksen avgjøre.
2. **K3, mulig problem:** Publiseringen legger nye offentlige sider ut på evnstudio.no (`/prototype/figurer/…`, `/verktoy/figurer/…`), men commiten har ingen rad i ENDRINGSLOGG.md. Tidligere prototyper (`prototype/ecoins/`) står heller ikke i loggen. Om K3 gjelder for prototyper, må en voksen avgjøre.

## Anbefalte forbedringer
- **for-etter.html, feil midt i en visning:** Når en visning feiler, blir meldingen stående i målefeltet også etter at neste visning virker, og målingene kommer ikke tilbake før siden lastes på nytt. Samtidig er knappen for den feilede visningen markert som valgt, mens lerretet og navnelappene viser forrige visning.
- **for-etter.html uten WebGL:** Knappene er aktive, men gjør ingenting, fordi skriptet stopper før klikkhåndteringen settes opp. De kan låses eller skjules.
- **Ugyldige adresseparametere:**
  - `for-etter.html#vis=%22` gir et ugyldig CSS-selektor-unntak. Det fanges, men brukeren får den misvisende WebGL-meldingen.
  - `skisser.html#vinkel=ukjent` gir et ufanget TypeError (verifisert).
  - Det er ikke en sikkerhetsfeil, for verdien brukes bare i en selektor.
- **skisser.html ved 375 px bredde:** Tabellen med forslagene er 401 px bred og gir sideveis rulling (26 px).
- **Mobil:** På 375 px blir figurene små i for-etter.html, og navnelappene overlapper (5 av 6 i standardvisningen). Det er uproblematisk hvis sidene bare er ment for PC.
- **CSP:** Prototypesidenes CSP mangler `object-src 'none'`, `base-uri 'self'` og `form-action 'none'`, som spillene har. `default-src` dekker `object-src`, men ikke de to andre. De bør samkjøres med spillene.
- **Valgt visning:** Den valgte knappen vises bare med fyllfarge (T4 «ikke bare farge»). Den kan i tillegg markeres med kantlinje eller ikon.
- **hent-rev.cjs:** `verktoy/figurer/hent-rev.cjs` bruker `eval` på `rev-modell.js`. Skriptet kjøres bare i Node og lastes ikke av noen side, men `vm.runInNewContext` eller `require` hadde vært ryddigere. Skriptene i `verktoy/` blir offentlig tilgjengelige som filer når de publiseres.
- **Rebase eller flett med main:** Grenen mangler 51d39e7, og røyktesten kjørte derfor Dyrepatruljen 0.11.0, ikke 0.11.3. Testene bør kjøres på nytt på det flettede resultatet (Actions ved PR).

## Kontroller som ikke kunne utføres
- **F2, F3:** Ikke testet på denne commiten. Prototypesidene lagrer ingenting, og spillene er uendret.
- **U1:** Ikke relevant, sidene har ikke startkort. **U2, U3 (V):** Ikke testet. Om figurene og tekstene fungerer for Even, må Even vurdere. Even har ikke godkjent figurene.
- **T1, T3 (reduced-motion), Y1 (E):** Krever faktisk enhet. Y1 har heller ingen valgt referansemobil. Prototypesidene sjekker ikke `prefers-reduced-motion`. Animasjonen i ytelsesvisningen starter bare når brukeren trykker og varer 8 sekunder.
- **Y2:** Kun kodelest. Animasjonen bruker `THREE.Clock`-delta, så farten er uavhengig av skjermfrekvensen. Bildefrekvens ble ikke målt, fordi nettleserpanelet var skjult og tallene da ikke er pålitelige.
- **K3:** Se avvik 2.
- **S3, B7:** Ikke relevant, sidene har ikke fritekst.
- **B1, B2, B4, B5, B6:** Ikke relevant for prototypesidene. Spillene er uendret og ikke kontrollert på nytt utover røyktesten.
- **B3, «lavere grafikk på svake enheter» (E):** Ikke testet. Sidene har skygge med 2048-kart og ingen nedskalering utover pikselforhold maks 2.
- **ST1–ST8:** Ikke testet på denne commiten. `test/statistikk/` finnes verken på fa4cede eller origin/main (suiten er «ikke innført»), så ST8 kunne ikke kjøres. Spillenes start og pause og `statistikk.js` er uendret. Om hendelsene kommer fram i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **UI1–UI10:** Ikke kontrollert. Status er godkjent hovedløsning, og kravene er ikke tatt i bruk her.
- **Ekte berøring, iPhone, Android og Safari (E):** Ikke testet. Mobilstørrelsene er emulert.
- **Testserveren:** Python-serveren jeg startte (PID 39700, port 127.0.0.1:8765) kunne ikke stoppes, fordi `taskkill` og `Stop-Process` ga «Ingen tilgang». Den må stoppes manuelt.
  - To andre Python-prosesser lyttet på samme port fra før (PID 35648, startet 00:20, og PID 7176, startet 4.11 kl. 22:40). De er ikke startet av meg.
  - Siden flere prosesser lyttet på samme port, kan jeg ikke vise med sikkerhet hvilken av dem som svarte. Innholdet jeg fikk, var likevel fa4cede-versjonen: knappene ble låst under lasting og størrelsene ble vist i kB med deling på 1 000.
- **Midlertidige filer:** De ligger i scratchpad: `C:\Users\sss480\AppData\Local\Temp\claude\b1ad4f01722a3e7a\e6e8d332-0f44-45a4-aef6-2201f900bad2\scratchpad\klon-fa4cede`, `...\scratchpad\qa-fa4cede`, `...\scratchpad\qa-skript\feil.mjs` og `...\scratchpad\kjor-fa4cede.json`. Repoet er uendret: `git status` er rent, og HEAD er f80548d.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil, og endringene i fa4cede (låste knapper, feilmelding, kB) virker som beskrevet. Forbeholdet er at ytelse og ekte mobil ikke er testet, at modell.html og skisser.html ikke har melding når 3D ikke virker, og at grenen må flettes med main 51d39e7 før publisering. Vurderingen er ikke en godkjenning av figurene eller av offentlig publisering.
