# Arbeidsflyt og automatiske tester

Status: forslag. Testene i trinn 3 er laget og kan kjøres lokalt. Ingenting kjører automatisk ennå. Punkter som endrer autentisering, tillatelser eller GitHub-innstillinger, krever godkjenning fra eieren først.

Målet er en enklere og mer pålitelig utviklingsprosess, ikke mer administrasjon.

## Fire lag med hver sin rolle

| Lag | Hvem | Hva kontrolleres | Hvor resultatet står | Kan stoppe en versjon |
|---|---|---|---|---|
| 1. Automatiske tester | `test/kjor.mjs`, senere GitHub Actions | Objektive krav merket A i standarden | Testtabell og testkvittering. Senere en sjekk på committen og i PR-en | Ja, ved feil i gjeldende krav |
| 2. EVN Game QA | QA-agenten | Krav merket Q: skjønn, kodelesing og nettlesertest | `qa/rapporter/<dato>-<spill>-<kort-sha>.md` | Ja, ved kritiske feil |
| 3. Spilltest | Even | Spillopplevelsen (V) og test på faktisk enhet (E) | Avkrysning i PR-en | Ja, Even avgjør spillopplevelsen |
| 4. Godkjenning | En voksen | At den konkrete versjonen kan publiseres | Sammenslåing av PR-en til `main` | Ja. Sammenslåingen er publiseringen |

Ett lag erstatter aldri et annet. Grønne tester er ikke en QA-vurdering, og en QA-rapport er ikke en godkjenning.

## GitHub: push uten manuelt arbeid

**I dag:**
- Repoet hentes over https.
- Git Credential Manager 2.7.3 er installert, men ikke logget inn.
- PC-en har ingen SSH-nøkkel.
- GitHub kan nås over SSH både på port 22 og 443.
- Før trinn 4 fantes ingen av utviklingsgrenene på GitHub. De lå bare på PC-en og som sikkerhetskopi utenfor repoet.

**Alternativer:**

| Metode | Rekkevidde | Kan slå sammen PR-er via API | Vurdering |
|---|---|---|---|
| Git Credential Manager, innlogging i nettleser | Alle eierens repoer | Ja, tokenet er et vanlig OAuth-token | Enklest, men gir for vid tilgang |
| Fine-grained token for ett repo | Bare `ivarbrov/evnstudio` | Avhenger av tillatelsene | Godt, men tokenet må fornyes |
| **Deploy key (SSH) med skrivetilgang** | Bare `ivarbrov/evnstudio`, bare git | Nei | **Anbefalt.** Kan bare pushe, ikke godkjenne eller slå sammen |

**Anbefalt oppsett.** Hvert punkt krever godkjenning før det gjøres.

1. *Claude, etter godkjenning:* lage nøkkelen `~/.ssh/evnstudio_deploy` uten passord, et SSH-alias for GitHub og en egen push-adresse for repoet.
2. *Eieren:* legge den offentlige nøkkelen inn under Settings → Deploy keys, med «Allow write access».
3. *Eieren:* lage en regel (ruleset) for `main`. Regelen krever PR før sammenslåing, sperrer force push og sletting, og har ingen unntak for deploy keys. Grønne Actions-sjekker legges til som krav når de kjører.
4. *Eieren:* sjekke at Settings → Actions → Workflow permissions står på «Read».
5. *Eieren:* sjekke GitHub Pages (se under).
6. *Eieren:* gi en stående tillatelse: Claude kan pushe utviklingsgrener, men aldri `main`.

**Etterpå:** Claude pusher utviklingsgrenen og gir lenke til PR-en. Even tester, og eieren slår sammen. evnstudio.no oppdateres bare fra `main`.

**Risiko:**
- Nøkkelen ligger uten passord på denne PC-en. Den som har tilgang til PC-en, kan pushe utviklingsgrener og tagger, men ikke endre `main`. Tilgangen fjernes ved å slette deploy key på GitHub.
- Nøkkelen kan også pushe endrede filer i `.github/workflows/` på en utviklingsgren. En slik arbeidsflyt kan selv be om skrivetilgang med `permissions:`. Innstillingen «Read» gjelder bare standardverdien. Beskyttelsen ligger derfor i regelen for `main`, i at `github-pages` bare tillater `main`, og i at repoet ikke har hemmeligheter.
- PC-en er en jobb-PC. Eieren bør sjekke at en privat nøkkel for et personlig repo er i tråd med arbeidsgiverens regler.

## GitHub Pages og tagger

**Slik kontrolleres det at evnstudio.no bare publiserer fra `main`:**
1. *Én gang, eieren:* Settings → Pages skal vise «Deploy from a branch» med grenen `main` og mappen `/ (root)`.
2. *Når som helst, uten innlogging:* GitHubs offentlige liste over publiseringer viser gren og commit for hver publisering:
   ```bash
   curl -s "https://api.github.com/repos/ivarbrov/evnstudio/deployments?environment=github-pages&per_page=5"
   ```
   Hver rad skal ha `"ref": "main"`, og `sha` skal være en commit på `main`. 2. november 2026 var siste publisering `bd912fa` fra `main`.
3. *Godkjent innhold:* `main` endres i dag uten PR. Fossil Zoo v0.7.3 (`4dfe032` og `bd912fa`) ble pushet rett til `main` 2. november 2026. Det er derfor regelen for `main` (punkt 3 over) trengs: da kan ingenting komme på `main`, og dermed evnstudio.no, uten en PR som eieren slår sammen.

**Tagger:** Repoet har ingen tagger, og GitHub Pages publiserer ikke fra tagger. Tagger kan derfor ikke endre evnstudio.no. Hvis det senere brukes versjonstagger (for eksempel `v1.2.0`), bør det lages en regel for tagger som sperrer endring og sletting, uten unntak for deploy key. Det trengs ikke nå.

## Automatiske tester

Laget i trinn 3 på grenen `kvalitet/tester`. Det trengs ingen nye verktøy eller avhengigheter, bare Node 22 eller nyere og Chrome eller Edge, som allerede finnes på PC-en og på GitHubs maskiner. Playwright er ikke nødvendig.

| Fil | Hva den gjør |
|---|---|
| `test/index.html` | Testsiden. Kjører alle suitene i en ramme og legger resultatet i `window.EVNTestResultat`. Får spillisten fra `kjor.mjs` og virker derfor bare via skriptets server. `OPPSETT` er betrodd startoppsett for spill på `main` som ikke bruker `#startBtn`. |
| `test/kjor.mjs` | Finner spillene, starter en liten lokal server og Chrome eller Edge uten skjerm, kjører testsiden, fanger feil som bare nettleseren ser, og skriver tabell og testkvittering. Avslutter med kode 1 ved feil. |
| `test/spilloppsett.mjs` | Felles regler for spillregistrering: gyldige mappenavn, kontroll av `evn-test.json` og hvilke kontroller hvert spill må ha. |
| `test/publiseringssjekk.mjs` | Kontrollerer testkjøringen i Actions, dekningen, QA-rapporten og versjonen ved PR til `main` (se under). |
| `test/publiseringssjekk.test.mjs` | Tester publiseringssjekken i et midlertidig repo: nye spill godtas, og manipulert testkode, testresultat og testoppsett avvises. Kjøres i «Automatiske tester». |
| `.github/workflows/kvalitet.yml` og `publisering.yml` | De to kontrollene i GitHub Actions (se under). |

| Suite | Krav | Kontroller | Blokkerer |
|---|---|---|---|
| `statisk` | S1, T3 | CSP, godkjente domener, ingen eksterne filer, ingen `eval` eller `new Function`, zoom ikke sperret | Ja |
| `royk` | F1, K1, U1, K3 | Versjon på startkortet, Start virker, pause og fortsett, ingen manglende filer, ingen ufangede feil (også ved oppstart) | Ja |
| `statistikk` | ST1–ST5 | De 45 kontrollene i `test/statistikk/` (fra `feature/statistikk`) | Ja |
| `ui` | UI7, T1 | `EVNUIMaal()` i fem størrelser: `under44`, `avstandUnder8`, `overlapp` og `panelOverlapp`. Dekket andel vises som informasjon | Bare varsel, til UI-kravene er gjeldende |

**Nye spill registreres automatisk:** Hver mappe `spill/<id>/` med `index.html` er et spill og testes i `statisk` og `royk`. Det trengs ingen endring i `test/`. Røyktesten trykker på `#startBtn`. Har et nytt spill en annen startknapp, oppgis den i `spill/<id>/evn-test.json`, for eksempel `{ "start": "menyStart", "etterStart": { "klikk": ".verden.aapen" } }`. Filen er bare data med to tillatte nøkler. Den kan ikke slå av kontroller, merke funn som kjente eller kjøre kode, og den gjennomgås sammen med spillet i full QA. For spill som allerede finnes på `main`, står oppsettet i `OPPSETT` i `test/index.html` og endres bare med særskilt kontroll.

**Kjente funn:** Funn som står under «Kjente funn» i standarden, gir «kjent» i stedet for «feil». Når de er rettet, gir de «rettet», som et tegn på at standarden bør oppdateres. Listen står øverst i `test/index.html`.

**Tester som mangler:** En suite som mangler filen den tester, får status «ikke innført» bare hvis filen heller ikke finnes på `main` (`--base`). Finnes filen på `main`, er testen obligatorisk, og kjøringen feiler: «Obligatorisk test mangler». Ingen liste må vedlikeholdes. En test blir obligatorisk når den er slått sammen til `main`.

**Testkvittering:** `kjor.mjs` skriver én linje med bare stabile opplysninger, for eksempel:

```
evn1 commit=<full SHA> tester=<git-hash for test/> arbeidstre=rent statisk=ok royk=ok statistikk=ok ui=varsel
```

Resultatet per suite er `ok`, `feil`, `varsel` (rådgivende), `ikke-innfort` eller `ikke-kjort`. Tidspunkt, nettleser og detaljer er ikke med, så kvitteringen kan sammenlignes mellom PC og Actions.

## Kontroll ved PR til main

To arbeidsflyter gir to separate kontroller. Begge skal kreves i regelen for `main`.

**«Automatiske tester»** (`.github/workflows/kvalitet.yml`) kjører ved hver push og PR:
- Arbeidsflyten kjører PR-ens egen kode med `pull_request`, uten privilegier: bare lesetilgang, ingen hemmeligheter og `persist-credentials: false`.
- `test/kjor.mjs` kjøres på den nøyaktige commiten og lager testkvittering og resultatfil.
- Feiler en obligatorisk test, eller mangler en, blir kontrollen rød. Rådgivende suiter (i dag `ui`) gir bare varsel.

**«QA før publisering»** (`.github/workflows/publisering.yml`) kjører etter testene ved PR til `main`:
- Arbeidsflyten utløses av `workflow_run`. GitHub henter den og skriptet fra `main`, så en PR kan ikke endre kontrollen som gjelder den selv.
- PR-ens kode kjøres aldri her. Commiten leses bare som data med git, og resultatfilen fra testene leses bare som JSON.
- Tokenet kan bare lese innhold og kjøringer og sette status på commiten (`statuses: write`). Det finnes ingen hemmeligheter.
- Kontrollen gjelder bare PR-er fra grener i dette repoet, ikke fra forks.
- Resultatet settes som status «QA før publisering» på PR-ens commit.

`test/publiseringssjekk.mjs` krever:
1. **Uendrede tester:** PR-en endrer ikke `test/` eller `.github/`. Er det endret, er testresultatet ikke betrodd, og sjekken blir rød. Eieren går da gjennom endringen og slår eventuelt sammen med unntak (se regelen under).
2. **Testkjøringen:** resultatfilen gjelder PR-ens commit, har rent arbeidstre, har resultat for hver suite i `test/index.html` på grenen eller på `main`, har bare kjente verdier og har ingen feil.
3. **QA etter siste kodeendring:** en rapport i `qa/rapporter/` der «Grunnlag» har full SHA for siste commit som endrer noe utenfor `qa/`, og samme standardhash og agentversjon som git viser på den commiten.
4. **Full QA for hvert endret spill:** «Nivå: full», hver gjeldende krav-ID gjort rede for, og konklusjon som ikke er NEI. Felles kode regnes som endring i alle spill.
5. **Testkvitteringen i rapporten:** gjelder samme commit, er laget på rent arbeidstre og har samme resultat som Actions i de obligatoriske suitene.
6. **K3:** endrede spill har nytt versjonsnummer på startkortet, og det står i `ENDRINGSLOGG.md`.
7. **Dekning:** Hvert spill på commiten er testet i Actions, og har hver påkrevde kontroll i `statisk` og `royk` (`PAKREVDE_KONTROLLER`) med status ok, kjent eller rettet. Listen over spill leses fra git, ikke fra resultatfilen. Resultatfilen kan ikke utelate et spill eller en kontroll, eller oppgi et spill som ikke finnes.
8. **Testoppsett:** `evn-test.json` er bare lov for spill som ikke finnes på `main`, og må være gyldig. Legger PR-en til, endrer eller sletter filen for et spill på `main`, blir sjekken rød.

**Særskilt kontroll:** Punkt 1 og 8 er grensen mellom å registrere et spill og å endre testene. Å registrere et nytt spill gir ingen rød sjekk. Endringer i testlogikken, publiseringssjekken, GitHub Actions eller testoppsettet for spill på `main` gir fortsatt rød sjekk, og eieren må gå gjennom dem.

**Hvorfor resultatfilen kan brukes:** Punkt 1 sikrer at testskriptene og arbeidsflyten er de samme som på `main`, og resultatfilen må oppgi samme testversjon som `test/` på commiten. Hvilke suiter som er rådgivende, leses fra `main`, ikke fra filen. Testene kjører likevel PR-ens spillkode i samme nettleser. Spillkode som med vilje skrev til testresultatet, kunne i prinsippet påvirke det. Det er en restrisiko så lenge bare eieren og Claude kan pushe grener. Resultatfilen behandles bare som data. Stemmer den ikke med QA-rapportens kvittering, stopper PR-en.

**Ulikt resultat i Actions og lokalt:** Kravene senkes ikke automatisk. PR-en stopper, og forskjellen undersøkes.

## Resultat av prøvekjøringen på GitHub (2. november 2026)

| Gren | Kjøring | Resultat |
|---|---|---|
| `kvalitet/actions-test` (8b3e1c4) | «Automatiske tester» | Grønn. Kvittering med full SHA, `statisk=ok royk=ok`, `statistikk` og `ui` ikke innført |
| `kvalitet/actions-test` | Seks selvtester med manipulert resultat | Alle røde, med riktig grunn |
| `kvalitet/actions-test-feil` (8311bd5) | «Automatiske tester» | Rød: T3 i Fossil Zoo feilet når det kjente funnet var fjernet. `statisk=feil` |
| `kvalitet/actions-test-omgaelse` (dde59b1) | Selvtestene | Alle grønne fordi skriptet var endret til å alltid bestå. **Dette viser svakheten, og er ikke en godkjenning** |

Ingen av kjøringene startet publisering. Alle de 32 publiseringene til `github-pages` er fra `main`, og miljøet `github-pages` tillater bare grenen `main`.

## Beskyttelse av main, tester og arbeidsflyt

**Svakheten som er løst:** Ved `pull_request` kjører GitHub arbeidsflyten og testskriptene fra PR-grenen. En PR som endrer dem, kan gjøre sin egen kontroll grønn. Det viste grenen `-omgaelse`. «QA før publisering» kjører derfor med `workflow_run` fra `main` og feiler når PR-en endrer `test/` eller `.github/`.

**Hvorfor ikke `pull_request_target`:** GitHub fraråder å kjøre eller sjekke ut PR-kode med privilegerte utløsere (`pull_request_target` og `workflow_run`). GitHub anbefaler å kjøre den upålitelige koden med `pull_request` og la `workflow_run` behandle resultatet som data. Det er dette mønsteret som brukes her.

**Enklere alternativ som ble vurdert:** bare `pull_request`, og at eieren selv ser etter endringer i `test/` og `.github/`. Det er enklere, men en endret test kan da gi grønn kontroll uten at noen merker det. Ekstrakostnaden er én liten arbeidsflyt, og den vurderes som verdt det.

**Det som ikke finnes for et personlig repo med én eier:** regler som sperrer bestemte filstier (bare for organisasjoner), og krav om godkjenning fra kodeeier. Eieren kan ikke godkjenne sin egen PR.

**Forslag til regel for `main` (Settings → Rules → Rulesets → New branch ruleset):**
- Navn `main`, Enforcement «Active», Target «Default branch».
- Bypass list: «Repository admin», med «For pull requests only». Unntaket brukes bare for PR-er som endrer `test/` eller `.github/`, etter manuell gjennomgang.
- Restrict deletions: på. Block force pushes: på.
- Require a pull request before merging: på, med 0 godkjenninger. Sammenslåingen er eierens godkjenning.
- Require status checks to pass: på, med «Require branches to be up to date before merging». Obligatoriske kontroller:
  - «Automatiske tester» (fra GitHub Actions)
  - «QA før publisering» (status satt av publiseringssjekken)
- Kontrollene fra testgrenene («Manipulert resultat – …» i «Selvtest av publiseringssjekken») skal **ikke** være obligatoriske. De finnes bare på testgrenene.

**Andre innstillinger:**
- Settings → Actions → General:
  - Workflow permissions: «Read repository contents and packages permissions».
  - «Allow GitHub Actions to create and approve pull requests»: av.
  - Fork pull request workflows: krev godkjenning for alle eksterne bidragsytere.
  - Allowed actions: bare GitHubs egne (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `actions/download-artifact`).
- Settings → Pages: «Deploy from a branch», `main`, `/ (root)`. Uendret.
- Settings → Environments → `github-pages`: bare grenen `main`. Uendret.
- Settings → Collaborators: ingen andre med skrivetilgang.

**Begrensninger og manuell kontroll:**
- Den første PR-en som legger arbeidsflytene på `main`, får ikke «QA før publisering», fordi `workflow_run` bare kjører fra `main`. Den må eieren gå gjennom manuelt og slå sammen med unntak.
- PR-er som endrer `test/` eller `.github/`, krever alltid manuell gjennomgang.
- Et nytt spill krever ikke lenger endring i `test/` og dermed ikke unntak (fra november 2026). Unntaket gjelder bare reelle endringer i testene og arbeidsflyten.
- En PR kan i prinsippet endre `kvalitet.yml` og selv sette en falsk status med samme navn. Den blir likevel rød i «QA før publisering», fordi `.github/` er endret, men statusen som settes sist, gjelder. Derfor må eieren alltid sjekke at en PR ikke endrer `.github/`, før den slås sammen.
- Sjekken viser at testene er kjørt på riktig commit, og at QA-rapporten gjelder samme commit og standard. Den kan ikke bevise at vurderingene i rapporten er riktige. Derfor er Evens test og eierens godkjenning egne lag.
- Krav merket Q, E og V kan ikke testes automatisk.

## Hooks og ekstra sperrer: ikke nå

En hook som sperrer agentens Bash-kommandoer, innføres ikke nå. Grunnene:
- Agenten har ikke Edit eller Write. Den har Bash, som i prinsippet kan skrive filer, så den delen av sperren hviler på instruksen.
- Ingen av de minst seks kontrollene 1.–2. november endret filer i repoet. `git status` var uendret etter hver kontroll.
- Den sterkeste sperren ligger på GitHub: regelen for `main` og skrivebeskyttede Actions. Den gjelder også for Claude, ikke bare for agenten.
- En hook virker bare i mapper som er godkjent som trygge, og må vedlikeholdes.

Dette vurderes på nytt hvis en QA-kontroll noen gang endrer filer.

## Rekkefølge videre

- **Aktivering:** PR-en fra `kvalitet/felles` legger arbeidsflytene i `.github/workflows/`. Når den er godkjent og slått sammen, settes regelen for `main` opp. Testgrenene `kvalitet/actions-test*` kan slettes etterpå.
- Spillgrenene (`feature/statistikk`, `feature/morkeskogen-ui` og `feature/fossil-startkort`) henter `main` etter at kvalitetsgrenene er slått sammen. Da kjører testene også for dem.
- Fossil Zoo v0.7.3 på `main` er gjeldende publisert versjon, og `kvalitet/tester` har hentet den. `feature/statistikk` og `feature/morkeskogen-ui` kan slås sammen med `main` uten konflikt. `feature/fossil-startkort` bruker også versjonsnummeret 0.7.3 og har konflikt i `spill/fossilspillet/index.html`. Den må tilpasses v0.7.3 og få nytt versjonsnummer, med vanlig QA, test hos Even og godkjenning.
