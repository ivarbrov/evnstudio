# EVN Game QA: Dyrepatruljen 0.11.4
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1, og S2 etter 1.2a) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit b801a24ba10966388e2dc7622d54622961b91610
Testkvittering: evn1 commit=b801a24ba10966388e2dc7622d54622961b91610 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert. Endringene er UI-trinn 2 (verdensvalg, ferdigkort, safe area og hjelpetekst) og sammenslåingen med 0.11.3. Mot 6dd3908 (forrige kontroll av grenen) endrer sammenslåingen i spillet bare versjonsnummeret og én linje i `sjekkFangst` fra 0.11.3. Kontrollert med `git diff 6dd3908 HEAD`.
Testet: Dette er en ny kjøring mot b801a24, og ingen resultater fra tidligere commits er brukt.
- **Testsuite:** `node test/kjor.mjs --base origin/main` med /usr/bin/google-chrome ga 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3) og 2 ikke innført. Ingen kontroller med FEIL eller VARSEL.
- **Nettleser:** Playwright for Node med Chrome, SwiftShader-WebGL og `reducedMotion: 'reduce'`. evnstudio.no ble rutet til repoet, og gc.zgo.at og goatcounter.com ble stubbet. Ingen tellinger ble sendt, og jeg startet ingen testserver.
- **Base 0.11.3:** Hentet fra `origin/main` med `git show` og servert på samme origin (`/gammel/`).
- **PC:** 1280×800 med ekte tastetrykk og musklikk.
- **Mobil:** Bare emulert (`isMobile`, `hasTouch`, DPR 2) i 375×812, 812×375, 740×360, 320×568 og 568×320. Knapper ble trykket med `touchscreen.tap` og styrespaken med CDP-berøring. Safe area er simulert med `Emulation.setSafeAreaInsetsOverride` (47/34 px, og 47 px på sidene i liggende format).
- **Testoppsett:** `__dyrespill.fang` og direkte plassering av helten.
- **Metode:** `page.click` på Start hang i noen kjøringer, selv om klikket gikk gjennom (tilstanden ble «kart"). Da brukte jeg ekte museklikk på knappens koordinater.

Skript og utskrifter ligger i /tmp/qa-0114/. `git status` er tom.

## Oppfylte krav
- **Endringene i 0.11.4:**
  - **Tilbake og Avslutt i verdensvalget:**
    - **Tab-rekkefølge:** Tilbake → Avslutt → Gata → Dyreparken.
    - **Esc og ← Tilbake:** Går til startkortet med fokus på Start.
    - **Avslutt:** «Vil du avslutte?» åpnes med fokus på Nei, og Tab går rundt mellom de to knappene. Esc og Nei går tilbake, og «Ja, avslutt» går til `/`.
    - **Mobil:** Alt dette virker med `tap` i alle fem størrelsene.
  - **Ferdigkortet:**
    - **Vanlig vei:** Fokus starter på «Til dyreparken», og 11 elementer er `inert`. Tab og Shift+Tab holder seg i kortet, og P åpner ikke pausen.
    - **Esc og «🌍 Velg verden»:** Går til verdensvalget, og etterpå er 0 elementer `inert`.
    - **Når en annen dialog er åpen:** Med pausen, dyreboka eller kartet (M) åpent vises ikke ferdigkortet (kontrollert etter 3 s). Det kommer med fokus når dialogen er lukket.
    - **Avslutt → Nei:** Ferdigkortet kommer etter Nei med `tilstand = 'pause'`, og W flytter ikke helten (0,000).
    - **Esc holdt nede:** Går bare ett steg, til verdensvalget.
  - **Safe area:** Med simulert innfelling lå ingen knapper eller styrespak utenfor det trygge området i noen av de fem størrelsene. `hudNavn` starter på y 57.
  - **Hjelpetekst:** Startkortet nevner C (snik), B (dyreboka) og P (pause). Pausens styringshjelp viser det samme, pluss kartet.
  - **Fangsten fra 0.11.3 er med:** Linja i `sjekkFangst` måler høyden over bakken.
- **F1:**
  - **Start:** Tab gir fokus på Start, Enter åpner verdensvalget, og Gata starter.
  - **Bevegelse og fangst:** W flytter helten (1,38). Ekte mellomrom fanget 3 av 3 dyr, og fangstene ble lagret.
  - **Pause:** P, ⏸, blur og simulert `visibilitychange` åpner pausen. Med pausen åpen flytter helten seg 0,0000. Esc, P og Fortsett lukker den.
  - **Fullføring og dyreparken:** Gata kan fullføres, og Byen åpnes. Dyreparken virker (10 dyr), også pausen der.
  - **Avslutning:** Virker fra verdensvalget.
  - **Mobil:** Start, Tilbake, Avslutt/Nei, Gata, styrespak (2,8–3,8), Håv-tap (fangst), ⏸/Fortsett og «Velg verden» virker i alle fem størrelsene.
  - **Røyktest:** OK.
- **F2:**
  - Lagringen er lik etter omlasting (10 dyr i Gata), og lydvalget huskes.
  - «Start helt på nytt» starter med fokus på Nei, og Tab går rundt mellom knappene. Esc beholder lagringen.
  - Ja sletter `evn-dyrespillet-v1` og beholder lydvalget og `evn-ecoins-v1`.
- **F3 (del, se avvik):**
  - **Lagring fra 0.11.3:** Lagring laget i 0.11.3 (12 dyr) leses uendret av 0.11.4, og en ny fangst legges til.
  - **Ødelagt lagring som virker:** Ugyldig JSON, `null`, `[]`, `"tekst"`, `{"v":1}` og `v:2` gir start og fangst uten feil.
- **U1:** Startkortet har mål, styring (6 linjer), Start, vei tilbake og «Versjon 0.11.4».
- **U2 og U3 (Q-delen):** Styringshjelpen står på startkortet og i pausen, og veien ut står øverst i verdensvalget. Tekstene er korte og på enkel norsk.
- **T1 (A-delen, emulert):** Ingen synlige trykkflater under 44×44 i noen av de fem størrelsene. Tilbake er 117×48, Avslutt 120×48, og ferdigknappene er 254×58 og 158×48. Ingen sideveis rulling (`scrollWidth` er lik bredden).
- **T2:** Fokus holder seg i pausen, dyreboka, kartet, «Vil du avslutte?», nullstillingen og ferdigkortet. Etter lukking er 0 elementer `inert`.
- **T3:** Den statiske testen gir OK (`viewport-fit=cover`, zoom ikke sperret). Med `reduce` er Start-animasjonen `none`, og uten er den `puls`.
- **K1:**
  - **Nettleserkjøringene:** 0 sidefeil, 0 konsollfeil, 0 svar med status 400 eller høyere og 0 eksterne forespørsler, unntatt de bevisste feilene i F3- og K2-testene.
  - **Røyktesten:** OK.
- **K3:** «Versjon 0.11.4» står på startkortet og `VERSJON = 'v0.11.4'` i koden. ENDRINGSLOGG har en ny rad for 0.11.4, og innholdet stemmer med det som er målt.
- **S1:** Den statiske testen gir OK. CSP er uendret, uten `eval` og uten nye domener.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. `document.cookie` er tom.
- **S3:** Spillet har ingen fritekst (0 `input`, `textarea` eller `prompt`).
- **S4:** Personvernsiden er uendret og stemmer: fremgangen lagres bare lokalt.
- **B1 (A-delen):** L gir 🔇, `aria-pressed="true"` og lagrer `av`. Valget huskes etter omlasting og fra 0.11.3.
- **B2:** M viser «🔴 Du er her · 🏙️ Gata», og helten står stille (0,0000) med kartet åpent. Esc lukker kartet.
- **B3 (oppstartsdelen):** Uten WebGL er Start slått av og viser «3D virker ikke her». Det kommer en `role="alert"`-melding på enkel norsk, tilbakelenken vises, og det er 0 sidefeil.
- **ST3:** Kodelest (`statistikk.js` sender bare fra evnstudio.no). Ingen forespørsler gikk ut under testene.
- **ST5 (det som er kjørt):** Det ble ingen hendelse før Start. Etter Start → Esc → Start → Tilbake → Start → Gata kom nøyaktig én `start-dyrepatruljen`.
- **ST6:** `document.cookie` er tom, og koden har ingen ID.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle avvikene er kjente fra før og er uendret. Ingen er nye, og ingen er blitt verre.
- **F3, verifisert feil (kjent):** Lagring med feil type krasjer spillet.
  - `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget kan ikke brukes.
  - `{"gata":5}` gir «reddet.includes is not a function».
  - `"reddet":"x"` og `{"gata":"katt1"}` feiler ved fangst.

  Gjenskap: legg en av verdiene i `evn-dyrespillet-v1`, last siden på nytt og trykk Start og deretter Gata. Spillet lager ikke slike verdier selv.
- **K2, verifisert feil (kjent, alle spill):** `setTimeout(() =&gt; { throw … })` under spilling gir ingen vennlig melding og ingen «Last inn på nytt».
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke. Ikke kontrollert på nytt.
- **ST1, avvik (kjent):** `statistikk.js` lastes nederst i `&lt;body&gt;` med `defer`, og spillet sender ikke `evn-start`. Starten telles ved klikk på `#startBtn`. Nytt i 0.11.4: Den nye veien ut fra verdensvalget gjør det mulig å telles som start uten å ha spilt (Start → Tilbake eller Avslutt).
- **ST2, avvik (kjent):** `EVNAktivTid` finnes ikke (0 treff i spillet og i `statistikk.js`).
- **ST4, avvik (kjent):** Det sendes ingen `feil-dyrepatruljen-oppstart` eller `feil-dyrepatruljen-spill`.
- **ST7, avvik (kjent):** Spillet har ikke godkjent statistikk etter 1.1, og `versjon-dyrepatruljen-0.11.4` sendes ikke.
- **ST8, avvik (kjent):** `test/statistikk/` finnes verken på grenen eller på `main` (`statistikk=ikke-innfort`).

## Anbefalte forbedringer
- **Fokus etter «Vil du avslutte?» i verdensvalget (fra før):** Etter Esc eller Nei havner fokus på BODY. Bør gå tilbake til 🚪 Avslutt.
- **Lave vinduer (fra før):**
  - Start ligger under bretten i 812×375, 740×360, 320×568 og 568×320.
  - «🌍 Velg verden» på ferdigkortet slutter på y 363 i 568×320 og 740×360.
  - Begge kan nås ved å rulle.
- **320×568 (fra før):** Styrespaken (130 px, x 18–148) og Snik (66 px, x 132–198) overlapper. Avstanden mellom sentrene er 84 px mot en radiussum på 98 px, så de overlapper også som sirkler.
- **ENDRINGSLOGG:** Raden ber om at endringene overføres til `kilde.html`. Den fila finnes ikke i repoet og er ikke kontrollert.
- **Fra før:** validering i `lastInn()` (F3), en global feilfanger (K2) og håndtering av `webglcontextlost`.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og jeg har ingen ekte enhet. SwiftShader sier ingenting om bildefrekvens.
- **Y2:** Fanebytte er bare simulert med blur og `visibilitychange`, og begge åpner pausen. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest (`dt = Math.min(0.05, …)`). Status: delvis, ikke oppfylt.
- **T1, T3, B1 og B3 (E):**
  - **Berøring:** Emulering og CDP-berøring er ikke ekte berøring.
  - **Safe area:** Bare simulert, ikke testet på en iPhone med hakk eller hjemlinje.
  - **Andre deler:** Knipe-zoom, hørbar lyd, tapt WebGL-kontekst og lavere grafikk på svake enheter er ikke testet.
- **T4:** Delvis målt, så status er «Ikke testet» som helhet.
  - **Startkortet:** versjon 5,5:1, styring 14,0:1, Start 4,7:1 (stor fet tekst) og Tilbake 5,3:1.
  - **Verdensvalget:** Tilbake og Avslutt 5,7:1, låste kort 4,8:1 og låst navn 5,8:1. «Låst» vises også med 🔒 og tekst, ikke bare med farge.
  - **Ikke målt:** Åpne kort har gradientbakgrunn som metoden ikke leser (kodelest: mørk tekst på lys gul). HUD-en er ikke målt.
- **U2 og U3 (V):** Om barnet finner veien ut, og om ventingen på ferdigkortet føles naturlig, må Even vurdere.
- **ST2, ST4 og milepæler:** Ikke testet, fordi `test/statistikk/` ikke finnes. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **B4, B5, B6 og B7:** Gjelder ikke, etter oversikten i standarden (1.2b).
- **UI1–UI10 og UI8a–c:** Status er godkjent hovedløsning, og kravene er ikke tatt i bruk for Dyrepatruljen. De er ikke kontrollert som krav. Klarspråk har status forslag og er ikke kontrollert.
- **Automatiske tester (A) som mangler:** F2, F3, T2 fokus, T4, Y2, K2, B1, B2, B3, S2, S3 og ST2–ST8.
- **Hele verdener med ekte håvsving i bakkete verdener:** Ikke kjørt på nytt. Bare enkeltfangster i Gata er gjort med ekte tastetrykk og `tap`.
- **Testserver:** Ingen er startet. All servering gikk gjennom Playwright-ruter.

## Klar for testing hos Even?
JA MED FORBEHOLD – Alle endringene i UI-trinn 2 og fangstrettingen fra 0.11.3 virker på PC og på emulert mobil, og F1, F2, T2 og lagring fra 0.11.3 virker uten konsollfeil. Forbehold: Det er ikke testet på ekte mobil (Y1, E), og de kjente avvikene F3, K2, B3 og ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne. En voksen må ta stilling til dem før publisering.
