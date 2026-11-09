# EVN Game QA: Testoppsett og publiseringssjekk (spillregistrering isolert, ny kontroll etter retting), ingen spillversjon
Grunnlag: agent 2.2, standard 1.2 (utkast; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 4d4be6168d35ab3186addffaa8c3b05ffc827139
Testkvittering: evn1 commit=4d4be6168d35ab3186addffaa8c3b05ffc827139 tester=3109befa0fff arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok sikkerhet=ok
Nivå: høy – endringen gjelder felles testkode og publiseringssjekken, som avgjør om alle spill kan publiseres. Ingen spillkode eller spillversjon er endret (diff 693c432..4d4be61 gjelder bare test/, .claude/arbeidsflyt.md og en QA-rapport). Derfor er det ikke valgt fullt nivå for noe spill.
Testet: Windows 11 med headless Chrome. Jeg kjørte `node test/kjor.mjs --base origin/main` på 4d4be61. Resultatet var 120 ok, 0 feil og 2 ikke innført. Sikkerhetssuiten har 47 rader, og røyktesten har 8 rader per spill for alle fire spill. `node test/publiseringssjekk.mjs --base origin/main` er kjørt lokalt. Rensefunksjonen `ren` er prøvd med kanttilfeller i et eget skript. I en klon i scratchpad har jeg i tillegg prøvd et eget juksespill som åpner vinduer, og jeg har flettet main inn og kjørt statisk og røyk. Klonen og skriptet er slettet. Jeg startet ingen server selv, og kjor.mjs stopper sin egen server og nettleser. Arbeidstreet er fortsatt rent. Nettleserpanelet er ikke brukt.

## Oppfylte krav
- **Avvik 1 (ecoins/ ble ikke regnet som felles kode) er rettet.**
  - I koden: `felles` i test/publiseringssjekk.mjs omfatter nå `ecoins/`.
  - Ved kjøring: N37 er OK. En endring i `ecoins/ecoins.js` ble avvist med «Dyrepatruljen: mangler QA-rapport på fullt nivå».
  - Restrisikoen i .claude/arbeidsflyt.md stemmer nå med koden: `ecoins/`, `statistikk.js`, `vendor/` og `fonter/` regnes som felles kode. Teksten sier også at `prototype/ui/` ikke brukes av spillene, og det har jeg bekreftet med grep i spill/.
- **Avvik 2 (isolasjonen hvilte på popup-blokkering) er rettet.**
  - I koden: hver fane får sin egen kontekst (`Target.createBrowserContext` med `disposeOnDetach`), og fanen lages i den (`createTarget` med `browserContextId`). Konteksten fjernes i `lukk()`. Isolasjonen avhenger dermed ikke lenger av at popup-vinduer blokkeres.
  - Ved kjøring i klonen, med juksespillet `popup` (window.open ved innlasting og ved klikk på Start):
    - Med vanlig oppsett blokkeres vinduene. Det kommer ingen F1-vindu-rad, og det er riktig, for det finnes ikke noe nytt vindu.
    - I en kopi av kjor.mjs med `--disable-popup-blocking` gir røyktesten «F1-vindu FEIL». Oppdagelsen virker altså når et vindu faktisk åpnes.
- **Rettingene har ikke svekket noe.**
  - B1–B4 er OK. Det ærlige spillet består 13 av 13 kontroller. toppnav avvises fordi det navigerer bort. forelder lurer ikke F1-start. Kjøringen blir rød med kode 1.
  - N35, N36, P5 og P6 er fortsatt OK.
  - Røyktesten har de samme 8 kontrollene for alle fire spill som før, og alle er OK: dyrepatruljen 0.11.6, eventyrspill 0.21.4, fiskespillet 0.9.3 og morkeskogen 2.0.7.
- **Rensing av tekst i Actions:** `ren` fjerner \r, \n, andre kontrolltegn og U+2028/2029, og bytter ut «::». Det gjelder i begge filene, både i tabellen, i tittelen og i meldingen. `"a\r::error::x"` blir én linje uten kommando.
- **TILGANG-søket gjelder nå bare .js-, .mjs-, .htm- og .html-filer.** Det falske varselet på .claude/arbeidsflyt.md er borte ved lokal kjøring.
- **Dokumentasjonen stemmer med koden.** KJENTE gjelder bare testsiden, nettleserkontekst er beskrevet, og tallene stemmer: 43 scenarier (6 + 37) pluss B1–B4 gir 47 rader.
- **Bestillingen:**
  - Punkt 1 (nye spill blir med automatisk) er vist igjen. magiske-egg fra main ble oppdaget og røyktestet uten registreringsfil i den flettede klonen, med 13 av 13 OK (versjon 0.9.0).
  - Punkt 3 og 6: endringer i test/ gir fortsatt FEIL i publiseringssjekken, også for dette PR-et. .github/ er uendret.
  - Punkt 4 (et spill kan ikke forfalske resultatet) er dekket av B2–B4 og av at hver fane har sin egen kontekst.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **Til informasjon, viktig før PR-en: grenen ligger bak main.**
   - Lokal `origin/main` er 6c05b36, ikke 1f32ee0. Main har fått Magiske egg tilbake, med en endring i `ecoins/ecoins.js` og ny `SPILL`-linje i `test/index.html`.
   - Fletting gir konflikt i `test/index.html`. I klonen løste jeg den ved å beholde grenens versjon, der spillene finnes automatisk. Da besto alle fem spill statisk og røyk (65 ok, 0 feil).
   - Flettingen blir en ny kodeendring. Denne rapporten gjelder da ikke lenger for siste kodeendring. Det trengs ny kjøring av `test/kjor.mjs` og ny QA av flettecommiten før PR-en legges fram.
2. **Til informasjon: overgangen gjelder fortsatt (som før).**
   - Publiseringssjekken gir FEIL for test/-endringene og for registreringene til dyrepatruljen og eventyrspill.
   - Det trengs et engangsunntak fra eieren, og det bør stå i PR-en.

## Anbefalte forbedringer
- `bilder/` og `favicon.png` lastes av alle spill (`../../bilder/robot-start-*.webp`), men regnes ikke som felles kode.
  - En fil som mangler, fanges av K1-404 i røyktesten.
  - Et bilde som byttes ut med noe annet, gir derimot ingen QA av spillene. Det er uendret fra main.
  - Vurder å ta med disse stiene i `felles`, eller nevn dem i restrisikoen.
- Detaljene i F1-vindu viser «nytt vindu» og ikke adressen, fordi `targetInfo.url` er tom når `targetCreated` kommer. Les også `Target.targetInfoChanged` for å få adressen.
- Det finnes ikke noe juksespill i `test/sikkerhet/juksespill/` for den nye F1-vindu-kontrollen. Fordi popup-vinduer blokkeres, er kontrollen vanskelig å utløse i vanlig kjøring. Vurder en negativ test som bevisst lager et mål i konteksten, så kontrollen ikke kan fjernes ubemerket.
- `ren(':::')` gir `': ::'`. Det er ufarlig, fordi teksten ikke har linjeskift og en kommando bare kan begynne en linje. Ren kosmetikk.
- TILGANG-søket kan også ta med `.svg` og `.xhtml`, som kan inneholde skript. Søket gir bare varsel.

## Kontroller som ikke kunne utføres
- Kjøring i GitHub Actions er ikke testet herfra. Det gjelder workflow_run, artefakten, statusen og at `Target.createBrowserContext` og `setDiscoverTargets` virker likt i headless Chrome på Linux med `--no-sandbox`. Om main sin gamle sjekk stopper PR-et, er bare kodelest.
- Statistikksuiten (ST1–ST8) er «ikke innført», fordi `test/statistikk/` ikke finnes her eller på main.
- UI-suiten er «ikke innført» og ikke relevant.
- Tidsvinduet mellom siste `sjekkBort()` og `lukk()` er ikke prøvd. Med egen kontekst per fane kan en navigasjon der ikke lenger påvirke andre faner, så det vurderes nå som uten betydning.
- Spillkrav som må testes på faktisk enhet (E) eller hos Even (V), er ikke relevante, fordi ingen spillkode er endret.
- Flettecommiten med main (avvik 1 over) finnes ikke ennå og er ikke kontrollert. Klonkjøringen er bare en indikasjon.

## Klar for testing hos Even?
JA MED FORBEHOLD – ingen spill er endret. F1 er testet og grønt for alle fire spill på grenen, og for magiske-egg i en flettet klon. Avvik 1 og 2 fra 693c432 er rettet uten at noe er svekket, og løsningen oppfyller bestillingen. Før den legges fram til godkjenning, må main flettes inn (konflikt i test/index.html), og flettecommiten må testes og kontrolleres på nytt. Actions-kjøringen er ikke verifisert herfra.

Filer det gjelder:
- C:\Users\sss480\evnstudio-kvalitet\test\kjor.mjs
- C:\Users\sss480\evnstudio-kvalitet\test\publiseringssjekk.mjs
- C:\Users\sss480\evnstudio-kvalitet\test\sikkerhet\manipulering.test.mjs
- C:\Users\sss480\evnstudio-kvalitet\.claude\arbeidsflyt.md
- C:\Users\sss480\evnstudio-kvalitet\test\index.html (flettekonflikt med main)
- Testutskrift: C:\Users\sss480\AppData\Local\Temp\claude\b1ad4f01722a3e7a\e6e8d332-0f44-45a4-aef6-2201f900bad2\scratchpad\kjor-4d4be61.txt
