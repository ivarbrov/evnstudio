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
- Nøkkelen kan også pushe endrede filer i `.github/workflows/` på en utviklingsgren. Det er lav risiko så lenge workflows bare har lesetilgang og repoet ikke har hemmeligheter.
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
| `test/index.html` | Testsiden. Kjører alle suitene i en ramme og legger resultatet i `window.EVNTestResultat`. Kan åpnes i en vanlig nettleser med `?auto`. |
| `test/kjor.mjs` | Starter en liten lokal server og Chrome eller Edge uten skjerm, kjører testsiden, fanger feil som bare nettleseren ser, og skriver tabell og testkvittering. Avslutter med kode 1 ved feil. |
| `test/publiseringssjekk.mjs` | Kontrollerer testkjøringen i Actions, QA-rapporten og versjonen ved PR til `main` (se under). |
| `.claude/utkast/kvalitet.yml` | Utkast til GitHub Actions med to kontroller. Ikke aktiv. |

| Suite | Krav | Kontroller | Blokkerer |
|---|---|---|---|
| `statisk` | S1, T3 | CSP, godkjente domener, ingen eksterne filer, ingen `eval` eller `new Function`, zoom ikke sperret | Ja |
| `royk` | F1, K1, U1, K3 | Versjon på startkortet, Start virker, pause og fortsett, ingen manglende filer, ingen ufangede feil (også ved oppstart) | Ja |
| `statistikk` | ST1–ST5 | De 45 kontrollene i `test/statistikk/` (fra `feature/statistikk`) | Ja |
| `ui` | UI7, T1 | `EVNUIMaal()` i fem størrelser: `under44`, `avstandUnder8`, `overlapp` og `panelOverlapp`. Dekket andel vises som informasjon | Bare varsel, til UI-kravene er gjeldende |

**Kjente funn:** Funn som står under «Kjente funn» i standarden, gir «kjent» i stedet for «feil». Når de er rettet, gir de «rettet», som et tegn på at standarden bør oppdateres. Listen står øverst i `test/index.html`.

**Tester som mangler:** En suite som mangler filen den tester, får status «ikke innført» bare hvis filen heller ikke finnes på `main` (`--base`). Finnes filen på `main`, er testen obligatorisk, og kjøringen feiler: «Obligatorisk test mangler». Ingen liste må vedlikeholdes. En test blir obligatorisk når den er slått sammen til `main`.

**Testkvittering:** `kjor.mjs` skriver én linje med bare stabile opplysninger, for eksempel:

```
evn1 commit=<full SHA> tester=<git-hash for test/> arbeidstre=rent statisk=ok royk=ok statistikk=ok ui=varsel
```

Resultatet per suite er `ok`, `feil`, `varsel` (rådgivende), `ikke-innfort` eller `ikke-kjort`. Tidspunkt, nettleser og detaljer er ikke med, så kvitteringen kan sammenlignes mellom PC og Actions.

## Kontroll ved PR til main

Utkastet `.claude/utkast/kvalitet.yml` har to separate kontroller. Begge skal kreves i regelen for `main`.

**«Automatiske tester»** kjører ved hver push og PR:
- Actions kjører `test/kjor.mjs` selv, på den nøyaktige commiten i PR-en, og lager sin egen testkvittering og resultatfil.
- Feiler en obligatorisk test, eller mangler en, blir kontrollen rød. Rådgivende suiter (i dag `ui`) gir bare varsel til kravene er gjeldende.

**«QA før publisering»** kjører bare ved PR til `main`, etter testene. `test/publiseringssjekk.mjs` krever:
1. **Actions sin egen kjøring:** resultatfilen fra jobben over gjelder HEAD, har rent arbeidstre, har resultat for hver suite som finnes i `test/index.html` på grenen eller på `main`, bare kjente resultatverdier, og ingen feil. I Actions er resultatfilen påkrevd. En lokal kvittering kan aldri oppfylle kravet alene.
2. **QA etter siste kodeendring:** en rapport i `qa/rapporter/` der «Grunnlag» har full SHA for siste commit som endrer noe utenfor `qa/`, og samme standardhash og agentversjon som git viser på den commiten. Kort SHA godtas ikke.
3. **Full QA for hvert endret spill:** «Nivå: full», hver gjeldende krav-ID for spillet gjort rede for, og konklusjon som ikke er NEI. Felles kode regnes som endring i alle spill.
4. **Testkvitteringen i rapporten:** må gjelde samme commit, være laget på rent arbeidstre og ha kjørt alle suiter. Den sammenlignes med Actions på versjon av `test/` og resultat per suite. Ulikt resultat i en obligatorisk suite stopper PR-en og må undersøkes. Ulikt resultat i en rådgivende suite gir varsel.
5. **K3:** endrede spill har nytt versjonsnummer på startkortet, og det står i `ENDRINGSLOGG.md`.

Automatiske tester og QA er separate kontroller. Grønne tester godkjenner ikke QA, og QA-rapporten erstatter ikke testene.

**Ulikt resultat i Actions og lokalt:** Kravene senkes ikke automatisk. PR-en stopper, og forskjellen undersøkes. Enten retter man årsaken, eller eieren godkjenner en endring i testen eller standarden.

**Begrensninger:**
- Sjekken viser at Actions har kjørt testene på riktig commit, og at rapporten gjelder samme commit og standard. Den kan ikke bevise at hver vurdering i rapporten er riktig. Derfor er Evens test og eierens godkjenning egne lag.
- En lokal kvittering kan skrives av for hånd. Den er likevel bare et tillegg: beviset for at testene er kjørt, er Actions sin egen kjøring.
- Testene og sjekken ligger i repoet. Endres de i en PR, kjører Actions den endrede versjonen. Endringer i `test/` og `.github/` må derfor vurderes av eieren i PR-en.
- «QA før publisering» kjører også når testene er røde, og stopper da selv. Begge kontrollene må likevel kreves i regelen for `main`.
- Testversjonen leses fra commiten (`HEAD:test`), ikke fra arbeidstreet. Endringer som ikke er committet, gir `arbeidstre=endret`, og da godtas ikke kvitteringen.
- En suite som er «ikke innført» (filen finnes verken på grenen eller på `main`), gir varsel. I dag gjelder det `statistikk` og `ui` til grenene med dem er slått sammen.
- Krav merket Q, E og V kan ikke testes automatisk.

## Resultat av prøvekjøringen på GitHub (2. november 2026)

| Gren | Kjøring | Resultat |
|---|---|---|
| `kvalitet/actions-test` (8b3e1c4) | «Automatiske tester» | Grønn. Kvittering med full SHA, `statisk=ok royk=ok`, `statistikk` og `ui` ikke innført |
| `kvalitet/actions-test` | Seks selvtester med manipulert resultat | Alle røde, med riktig grunn |
| `kvalitet/actions-test-feil` (8311bd5) | «Automatiske tester» | Rød: T3 i Fossil Zoo feilet når det kjente funnet var fjernet. `statisk=feil` |
| `kvalitet/actions-test-omgaelse` (dde59b1) | Selvtestene | Alle grønne fordi skriptet var endret til å alltid bestå. **Dette viser svakheten, og er ikke en godkjenning** |

Ingen av kjøringene startet publisering. Alle de 32 publiseringene til `github-pages` er fra `main`, og miljøet `github-pages` tillater bare grenen `main`.

## Beskyttelse av main, tester og arbeidsflyt

**Svakheten:** Ved `pull_request` kjører GitHub arbeidsflyten og testskriptene fra PR-grenen. En PR som endrer `test/` eller `.github/`, kan derfor gjøre sin egen kontroll grønn. Det viste grenen `-omgaelse`.

**Det som ikke finnes for et personlig repo med én eier:**
- Regel som sperrer endring av bestemte filer (push-regler med filstier). Den finnes bare for organisasjoner.
- Godkjenning fra kodeeier (CODEOWNERS). Eieren kan ikke godkjenne sin egen PR, så det kan ikke kreves.

**Løsningen:** «QA før publisering» kjøres med `pull_request_target`. Da hentes arbeidsflyten og testskriptene fra `main`, ikke fra PR-en. PR-ens filer brukes bare som det som testes.
- Endringer i `test/` og `.github/` tar dermed først effekt etter at eieren har slått dem sammen.
- Sjekken gir varsel når en PR endrer `test/` eller `.github/`, så eieren ser på dem særskilt.
- `pull_request_target` gir ikke hemmeligheter eller skrivetilgang her, fordi arbeidsflyten bare har lesetilgang og repoet ikke har hemmeligheter.
- Kjøringer fra fremmede forks må godkjennes av eieren (innstilling under).
- Den første PR-en som legger arbeidsflyten på `main`, kan ikke beskyttes slik, fordi `main` ikke har arbeidsflyten ennå. Den må eieren gå gjennom manuelt.

**Forslag til regel for `main` (Settings → Rules → Rulesets → New branch ruleset):**
- Navn `main`, Enforcement «Active», Target «Default branch», ingen i Bypass list.
- Restrict deletions: på. Block force pushes: på.
- Require a pull request before merging: på, med 0 godkjenninger, fordi eieren ikke kan godkjenne sin egen PR. Sammenslåingen er eierens godkjenning.
- Require status checks to pass: på, med «Require branches to be up to date before merging». Obligatoriske kontroller:
  - «Automatiske tester»
  - «QA før publisering»
- Kontrollene fra testgrenene («Manipulert resultat – …» i «Selvtest av publiseringssjekken») skal **ikke** være obligatoriske. De finnes bare på testgrenene og skal aldri til `main`.

**Andre innstillinger:**
- Settings → Actions → General:
  - Workflow permissions: «Read repository contents and packages permissions».
  - «Allow GitHub Actions to create and approve pull requests»: av.
  - Fork pull request workflows: krev godkjenning for alle eksterne bidragsytere.
  - Allowed actions: bare GitHubs egne (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `actions/download-artifact`).
- Settings → Pages: «Deploy from a branch», `main`, `/ (root)`. Uendret.
- Settings → Environments → `github-pages`: bare grenen `main`. Uendret.
- Settings → Collaborators: ingen andre med skrivetilgang.

## Hooks og ekstra sperrer: ikke nå

En hook som sperrer agentens Bash-kommandoer, innføres ikke nå. Grunnene:
- Agenten har ikke Edit eller Write. Den har Bash, som i prinsippet kan skrive filer, så den delen av sperren hviler på instruksen.
- Ingen av de minst seks kontrollene 1.–2. november endret filer i repoet. `git status` var uendret etter hver kontroll.
- Den sterkeste sperren ligger på GitHub: regelen for `main` og skrivebeskyttede Actions. Den gjelder også for Claude, ikke bare for agenten.
- En hook virker bare i mapper som er godkjent som trygge, og må vedlikeholdes.

Dette vurderes på nytt hvis en QA-kontroll noen gang endrer filer.

## Rekkefølge videre

- **Aktivering:** Gjøre «QA før publisering» om til `pull_request_target`, flytte `.claude/utkast/kvalitet.yml` til `.github/workflows/` i én PR til `main` og gjøre GitHub-oppsettet over. Det krever eierens godkjenning. Testgrenene `kvalitet/actions-test*` kan slettes etterpå.
- Spillgrenene (`feature/statistikk`, `feature/morkeskogen-ui` og `feature/fossil-startkort`) henter `main` etter at kvalitetsgrenene er slått sammen. Da kjører testene også for dem.
- Fossil Zoo v0.7.3 på `main` er gjeldende publisert versjon, og `kvalitet/tester` har hentet den. `feature/statistikk` og `feature/morkeskogen-ui` kan slås sammen med `main` uten konflikt. `feature/fossil-startkort` bruker også versjonsnummeret 0.7.3 og har konflikt i `spill/fossilspillet/index.html`. Den må tilpasses v0.7.3 og få nytt versjonsnummer, med vanlig QA, test hos Even og godkjenning.
