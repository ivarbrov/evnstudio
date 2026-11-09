# EVN Game QA: Testoppsett og publiseringssjekk (spillregistrering isolert, flettecommit med main), ingen spillversjon
Grunnlag: agent 2.2, standard 1.2 (utkast; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1156cdbc35cf31d5dcef9a23d4aa2658017ccf18
Testkvittering: evn1 commit=1156cdbc35cf31d5dcef9a23d4aa2658017ccf18 tester=5e9dee29e296 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok sikkerhet=ok
Nivå: høy – flettingen berører felles testkode og publiseringssjekken, og main tar med seg en endring i felles kode (`ecoins/ecoins.js`) og et spill som skal testes igjen (magiske-egg). Ingen spillkode er endret i forhold til main. Derfor har jeg ikke valgt fullt nivå for noe spill.
Testet: Windows 11 med headless Chrome. Jeg kjørte `node test/kjor.mjs --base origin/main` på 1156cdb og fikk 133 ok, 0 feil og 2 ikke innført. Røyktesten har 8 rader og statisktesten 5 rader for hvert av de fem spillene. Sikkerhetssuiten har 47 rader, og ecoins-suiten har 21. `node test/publiseringssjekk.mjs --base origin/main` er kjørt lokalt. Jeg sammenlignet git-trærne mot begge foreldrene (287c3e1 og 6c05b36) og mot flettebasen 1f32ee0. I en klon i scratchpad la jeg til et juksespill som åpner et vindu med `window.open`, og kjørte en kopi av kjor.mjs med `--disable-popup-blocking`. Klonen er slettet. Jeg startet ingen server selv, og kjor.mjs stopper sin egen server og nettleser. Arbeidstreet er fortsatt rent. Nettleserpanelet er ikke brukt.

## Oppfylte krav
- **Flettingen er riktig, og ingenting fra main har gått tapt.**
  - Main endret 11 filer siden flettebasen 1f32ee0. Ti av dem er byte for byte like i 1156cdb og på 6c05b36: ENDRINGSLOGG.md, de fire bildene i bilder/, ecoins/ecoins.js, index.html, de to QA-rapportene for magiske-egg og spill/magiske-egg/index.html. `git diff 6c05b36 1156cdb` viser ingen av dem.
  - Den ellevte filen er test/index.html. Der er grenens versjon beholdt, og main sin KJENTE-kommentar er tatt inn.
  - Fra grenens side (287c3e1 til 1156cdb) er det bare de tre endringene bestillingen beskriver: test/index.html (1 linje), test/kjor.mjs (F1-vindu) og .claude/arbeidsflyt.md (felles bilder). Ingenting fra grenen er falt ut.
  - Publiseringssjekken sier «Endrede spill: ingen». Magiske egg blir altså sett som uendret i forhold til main.
- **Magiske egg blir testet like godt som med main sin SPILL-linje, og bedre.**
  - Main sin linje var `{ id: 'magiske-egg', start: 'startBtn' }`. Det er det samme som `STANDARD` i test/spillregister.mjs, og spillet har `id="startBtn"`.
  - Ved kjøring består magiske-egg alle 5 statiske kontroller: S1-csp, S1-domener, S1-eksterne-filer, S1-eval og T3-zoom.
  - Det består også alle 8 røykkontroller: U1-versjon (0.9.0), F1-startknapp, F1-start, F1-pause, F1-fortsett, K1-404, K1-feil og K1-nettleser.
  - Main sin røyktest i test/index.html hadde de samme kontrollene, unntatt K1-nettleser, som kjor.mjs la til. Grenen har i tillegg F1-vindu og F1-registrering, og spillet kjøres i egen fane og nettleserkontekst.
  - `PAKREVDE_KONTROLLER` gjelder også magiske-egg, og spillet står i `spillPaMain`. Det kommer ingen falsk FEIL om registrering eller nytt spill.
- **Rettingene har ikke svekket noe.**
  - F1-vindu viser nå adressen til det nye vinduet. Klonkjøringen ga «F1-vindu FEIL /test/sikkerhet/juksespill/popup/nytt.html?x=1».
  - Logikken er strammere enn før. Den filtrerer først på kontekst, mål-ID og type, og deretter tar den bare `targetInfoChanged` for vinduer som allerede er sett. Et vindu som lukkes, blir stående i lista, slik det var før.
  - Alle 47 sikkerhetsrader er OK. Det gjelder blant annet:
    - B1–B4: det ærlige spillet består 13 av 13 kontroller, toppnav avvises, forelder lurer ikke målingen av Start, og kjøringen blir rød med kode 1.
    - ecoins/ regnes som felles kode.
    - evn-test.json i en undermappe regnes som endring i spillet.
  - Restrisikoen i .claude/arbeidsflyt.md om `bilder/` og `favicon.png` stemmer med `felles` i test/publiseringssjekk.mjs (linje 246). På main var det likt.
- **ecoins (main sin endring der `fjernet: true` er fjernet for magiske-egg):** alle 20 kontroller EC0–EC12 er OK.
- **Bestillingen, punkt 1–6:**
  - Punkt 1 er vist på selve flettecommiten, ikke bare i en klon: magiske-egg er oppdaget og testet uten registreringsfil.
  - Punkt 3 og 6: endringer i test/ gir fortsatt FEIL i publiseringssjekken, også for denne PR-en. .github/ er uendret.
  - Punkt 4 er dekket av sikkerhetssuiten, som er uendret og grønn.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **Til informasjon: overgangen gjelder fortsatt (kjent fra før).** Publiseringssjekken gir FEIL for test/-endringene og for registreringene til dyrepatruljen og eventyrspill. Det trengs et engangsunntak fra eieren, og det bør stå i PR-en. Sjekken gir også FEIL fordi QA-rapporten for 1156cdb mangler. Det retter seg når denne rapporten lagres.

## Anbefalte forbedringer
- Flettecommiten har også egne endringer: F1-vindu i kjor.mjs og teksten i arbeidsflyt.md. Det er beskrevet i commitmeldingen og kontrollert her. Neste gang er det lettere å gå gjennom hvis slike endringer ligger i en egen commit etter flettingen.
- Det mangler fortsatt et juksespill i `test/sikkerhet/juksespill/` som faktisk utløser F1-vindu (som før). Klonkjøringen viser at kontrollen virker, men bare med popup-blokkering slått av. Kontrollen kan derfor fjernes uten at noen test oppdager det.
- ENDRINGSLOGG.md har ikke noe innslag om det nye testoppsettet (automatisk spillregistrering og egen kontekst per fane). Vurder et kort innslag før PR-en.
- De øvrige forslagene fra forrige rapport gjelder fortsatt: `ren(':::')` og `.svg`/`.xhtml` i TILGANG-søket.

## Kontroller som ikke kunne utføres
- Kjøring i GitHub Actions er ikke testet herfra. Det gjelder workflow_run, artefakten, statusen, sammenligningen av kvitteringen med Actions, og at `Target.createBrowserContext` og `targetInfoChanged` virker likt i headless Chrome på Linux.
- Statistikksuiten (ST1–ST8) er «ikke innført», fordi `test/statistikk/` ikke finnes her eller på main.
- UI-suiten er «ikke innført» og ikke relevant.
- Magiske egg 0.9.0 har ikke fått QA på fullt nivå her. Spillet er uendret fra main og har egne QA-rapporter der (46091f4 og 37724f8). Denne kontrollen gjelder bare at testoppsettet tester det.
- Spillkrav som må testes på faktisk enhet (E) eller hos Even (V), er ikke relevante, fordi ingen spillkode er endret i forhold til main.

## Klar for testing hos Even?
JA MED FORBEHOLD – ingen spill er endret i forhold til main. F1 er testet og grønt for alle fem spill på flettecommiten, flettingen har ikke mistet noe fra main, og Magiske egg testes minst like godt som med SPILL-linja. Forbeholdene: Actions-kjøringen er ikke verifisert herfra, og PR-en trenger eierens engangsunntak for test/-endringene og de to registreringsfilene. Ellers kan endringen legges fram til godkjenning.

Filer det gjelder:
- C:\Users\sss480\evnstudio-kvalitet\test\index.html
- C:\Users\sss480\evnstudio-kvalitet\test\kjor.mjs
- C:\Users\sss480\evnstudio-kvalitet\test\publiseringssjekk.mjs
- C:\Users\sss480\evnstudio-kvalitet\test\spillregister.mjs
- C:\Users\sss480\evnstudio-kvalitet\.claude\arbeidsflyt.md
- Testutskrift: C:\Users\sss480\AppData\Local\Temp\claude\b1ad4f01722a3e7a\e6e8d332-0f44-45a4-aef6-2201f900bad2\scratchpad\kjor-1156cdb.txt
