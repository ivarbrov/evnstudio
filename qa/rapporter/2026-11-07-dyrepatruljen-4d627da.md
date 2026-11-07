# EVN Game QA: Dyrepatruljen 0.11.6 (pilot, EVN-MENY 1.0 + EVN-PAUSE v2)
Grunnlag: agent 2.3 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 4d627da6ef9979a2ea491959fed2af0e5dce2790
Testkvittering: evn1 commit=4d627da6ef9979a2ea491959fed2af0e5dce2790 tester=22b928d7c547 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: full – felles kode er bygget om. `evn-pause-v3.js` er fjernet, og to nye kildefiler er limt inn i spillet som merkede kopier. Bare Dyrepatruljen bruker EVN-MENY 1.0, så bare Dyrepatruljen er kontrollert. For de andre spillene viser `meny`-suiten «ikke innført».
Testet:
- **Grunnlaget avviker fra repoet:** Agentdefinisjonen i den testede committen (`/home/claude/pilot/.claude/agents/evn-game-qa.md`) er 2.2. Jeg brukte 2.3 fra `/home/claude/evnstudio` (gren `kvalitet/ui-standard`, 69d52f8), fordi bare den beskriver EVN-MENY 1.0 og KM13. Standardfila har samme hash begge steder. `evn-ui-standard.md` finnes ikke i piloten, så den er lest fra `/home/claude/evnstudio`. CLAUDE.md sier at «Grunnlag» skal vise agenten fra repoet, så en voksen må avgjøre om kontrollen kan godtas.
- **Testsuite:** `node test/kjor.mjs` med google-chrome ga 173 ok, 0 feil, 0 varsel og 2 ikke innført.
- **Testserver:** egen server på 127.0.0.1:8769. Den er stoppet, testnettleserne er lukket, og `git status` er tom.
- **Nettleser:** headless Chrome med CDP-skript i /tmp/qa-4d627/.
  - Tastene er ekte CDP-tastetrykk. Enter er sendt med `text:"\r"`.
  - På PC er det brukt CDP-museklikk og på mobil CDP-berøring.
  - `localStorage` ble tømt før og etter hver test.
- **Størrelser:** 1280×800 på PC. 375×812, 320×568, 740×360, 568×320 og 812×375 er emulert mobil med berøring.
- **Statistikk:** evnstudio.no ble avskåret og sendt til den lokale serveren, og GoatCounter ble byttet ut med en lokal stubb. Det gikk ingen ekte trafikk og ble ingen tellinger.

## Oppfylte krav
**Spillet:**
- **F1:** Hele løpet virker uten å henge:
  - Start → verdensvalg → verden → gå med W.
  - Menyen åpnet med P, Esc og ☰, og lukket med Fortsett, ✕ og P.
  - Kartet med M og 🗺️, dyreboka med 📖, I og B.
  - Meny › Velg verden → ny verden.
  - Meny › Avslutt › Ja går til `/`.

  Lukk-knappen nederst i dyreboka (y≈3259) må rulles inn i bildet før den kan trykkes. Etter rulling virker den: tilstanden går tilbake til `spill`, og fokus står på ☰.
- **F2:** Etter at to dyr var fanget og siden lastet på nytt, var lagringen `{"v":1,"reddet":{"gata":["katt1","katt2"]}}` beholdt. «Start helt på nytt» spør først, med fokus på Nei. Esc beholder lagringen, og «Ja, slett alt» sletter den.
- **U1:** Startkortet viser «Versjon 0.11.6», styring (med ☰, I og M) og «← Tilbake til EVN Studio».
- **B1:** L veksler `evn-dyrepatruljen-lyd` mellom `paa` og `av` under spilling, i menyen og med kartet åpent.
- **B2:** Med kartet åpent sto spilletiden stille (19069 ms), og helten flyttet seg ikke selv om W ble holdt inne. Kartet viser «🔴 Du er her».

**Tilgjengelighet:**
- **T1, UI7 (emulert):**
  - ☰ er 96×48 px, og 48×48 px når skjermen er smalere enn 400 px. Snarveiene er 48×48 px, Snik 66 px og Håv 92 px.
  - Ingen knapper overlapper i noen av de fem mobilstørrelsene.
  - Status overlapper ikke ☰ eller snarveiene. I 320×568 er avstanden 10 px.
- **T2, KS12:**
  - Med ekte Tab i 1280×800 går fokus Fortsett → 8 ruter → saldo → ✕ → Fortsett. Shift+Tab fra Fortsett går til ✕.
  - Suiten bekrefter at Tab følger det man ser, også i 740×360 og 568×320, der saldo og ✕ kommer først.
  - W flytter ikke helten mens menyen er åpen.
- **T3 (statisk):** Zoom er ikke sperret, og `viewport-fit=cover` er satt.

**Teknisk og sikkerhet:**
- **K1:** Alle lokale kjøringer ga 0 konsollfeil, 0 svar på 400 eller høyere og 0 eksterne forespørsler. Røyktesten er OK for alle fire spill.
- **K3:** Versjonen er 0.11.6 på startkortet og i `VERSJON`. ENDRINGSLOGG er oppdatert og stemmer med koden.
- **S1:** Den statiske CSP-testen er OK, og ingen nye domener er lagt til.
- **S2:** Diffen legger ikke til konto, kjøp eller innsamling. E-shop og Garderobe lenker til `/butikk/` på samme nettsted.
- **S3:** Diffen legger ikke til fritekst. Kontrollert ved kodelesing.

**Statistikk:**
- **ST3:** Lokalt ble ingenting sendt. Skriptet stopper utenfor `evnstudio.no`, både i koden og ved kjøring.
- **ST6:** `document.cookie` er tom, og ingen ID-er lagres.
- **ST5 (bare det som er observert):** På avskåret evnstudio.no kom ingen hendelse før start. `start-dyrepatruljen` kom én gang og ble ikke sendt på nytt da jeg byttet verden.

**Meny og styring (UI-standard 1.1):**
- **Kopikontroll (KM12):**
  - Begge merkede kopier er like kilden tegn for tegn: EVN-MENY 1.0 på linje 383–588 og EVN-PAUSE v2 på linje 186–382. Både suiten og min egen sammenligning viser det.
  - `felles/ui/evn-pause-v2.js` er lik v2 i Dyrepatruljen 0.11.5 og Fiskespillet på `main` (43aa7b9), bortsett fra merkene. Pauselogikken er altså den godkjente.
  - Menyen har ingen egen pause- eller spilletidslogikk. Den pakker bare inn `cfg.pause` og `cfg.fortsett`.
- **UI10 (eierens vedtak 7.11), KS1, KS7:**
  - ☰ åpner menyen og skjules mens den er åpen. ✕, Fortsett, P og Esc lukker den.
  - Esc åpner menyen når ingenting annet er åpent.
  - H åpner hjelpen. Første Esc lukker bare hjelpen, og fokus går til «Slik styrer du».
  - Spillet står stille mens menyen er åpen: tilstanden er `pause`, posisjonen er uendret, og spilletiden sto på 9944 ms i 3 sekunder.
- **KM1, KM2, KM4, KM5 (alle seks størrelser):**
  - ☰ står på 10,10, 🗺️ og 📖 står oppe til høyre, og status står i midten.
  - Avslutt i HUD har klassen `evnAvsluttSkjult` (1×1 px, `visibility:hidden`).
  - 🚪 Avslutt står i menyen og i verdensvalget.
- **KM3, KM9:**
  - Menyrutene står i fast rekkefølge.
  - I 568×320 er Fortsett synlig uten rulling (y 97–145).
  - Menykortet ruller ikke i noen størrelse.
  - Rutene er 60 px høye i lave vinduer og 64 px i høye.
  - Saldoen vises: «0 E-coins · E-shop».
- **KM13, slik oppdraget beskriver det:**
  - ☰ → Esc, ✕, Fortsett eller P gir fokus på ☰.
  - 🗺️ → Esc gir fokus på 🗺️.
  - 📖 → Esc eller ✕ gir fokus på 📖. I → Esc gir også fokus på 📖.
  - Meny › Kart (ruta og M) gir fokus på ☰.
  - Meny › Dyreboka gir fokus på ☰, uansett om boka er åpnet med ruta eller I, og om den lukkes med Esc, ✕ eller Lukk.
  - Meny › Avslutt › Nei gir fokus på ☰.
  - Meny › Velg verden → valgt verden gir fokus på ☰.
  - I verdensvalget gir Avslutt › Esc, › Nei (klikk) og › Nei (Enter) fokus på Avslutt.
- **KM8:** P, Esc, M, L, I og H virker, og B virker fortsatt.

**Uendret spill og tester:**
- **Uendret spill (mot 43aa7b9):** Utenfor menyblokkene endrer diffen bare HUD, CSS, styringstekst, versjon og menyoppsettet. Lagringsnøklene (`evn-dyrespillet-v1`, `evn-dyrepatruljen-lyd` og `evn-spilletid-dyrepatruljen`), `statistikk.js`, `ecoins/` og spillmekanikken er uendret.
- **Testendringene (eierens krav 7.11):** Ingen svekkelse funnet.
  - **Mot 9388cac:** Ingen kontroller er fjernet.
    - Kopikontrollen dekker nå begge komponentene og feiler hvis kildefila mangler (`r.ok`).
    - Det er fire nye KM13-tester per skjermstørrelse.
    - Ventetiden før Avslutt-kontrollen er økt fra 250 til 350 ms. Det svekker ikke testen.
  - **Mot `main`:** Bare to linjer er endret. Én legger `meny` til i `SUITER`. Den andre gjør `meny` rådgivende i `IKKE_GJELDENDE`. Det gjelder bare den nye suiten.
  - `test/kjor.mjs` og `test/publiseringssjekk.mjs` er uendret. Nettleserfeil i spillrammene telles fortsatt som FEIL i `royk`, også feil som oppstår under menytesten.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle punktene er kjente fra før og uendret:
- **F3, verifisert feil:** Lagringen `{"v":1,"reddet":{"gata":null}}` gir «TypeError: Cannot read properties of null (reading 'length')» når en verden velges, og spillet blir stående i verdensvalget.
  - **Gjenskap:** sett nøkkelen `evn-dyrespillet-v1` til verdien over, last siden, trykk Start og velg Gata.
  - Lagring fra 0.11.5 og andre ødelagte lagringer virker: ikke-JSON, `null`, `{}`, `{"reddet":[]}` og `"x"`.
- **K2, verifisert ved kodelesing:** Spillet har ingen global feilfanger.
- **ST1, ST2, ST4, ST7, ST8:**
  - `statistikk.js` lastes nederst med `defer`, ikke i `<head>`.
  - Spillet sender ikke `evn-start`.
  - Hendelsen `versjon-dyrepatruljen-0.11.6` kom ikke.
  - Spillet har ingen `EVNAktivTid`.
  - `test/statistikk/` finnes ikke.
- **B3:** Fortsatt åpent, ikke testet på nytt.

## Anbefalte forbedringer
- **Kopikontrollen sier ingenting når pausekopien mangler.** Har et spill EVN-MENY 1.0, men ikke en merket kopi av EVN-PAUSE v2 (eller merkene er ødelagt), gir suiten ingen rad. KM12 krever begge kopiene, så dette bør gi «varsel». Hullet er i den nye kontrollen og er ikke en svekkelse mot før.
- **B → Esc:** Fokus havner på BODY, fordi tasten B ikke registrerer hva som åpnet boka. I → Esc gir fokus på 📖. Dette er utenfor KM13, fordi boka ikke er åpnet fra en knapp.
- **Meny › Velg verden:** Mens verdensvalget vises, står fokus på BODY. Esc går til startkortet, ikke tilbake til spillet. Det er samme oppførsel som 🌍 hadde i 0.11.5. Even bør prøve det.
- **Kommentarer:** Toppkommentaren i `evn-meny-1.0.js` og i `test/index.html` sier fortsatt «KM1–KM12». En endring i kilden krever nytt versjonsnummer, så rettingen kan vente til neste versjon.
- **Fra før, uendret:**
  - Start er under bretten i liggende format (y 402–460 i 740×360, 568×320 og 812×375) og i 320×568 (y 642–700).
  - Statuslinja i 320×568 bryter slik at «·» havner først på andre linje.
  - Sniker i 568×320 med safe area.
  - Tastehjelp på mobil (KS3).

## Kontroller som ikke kunne utføres
- **T1, UI7, KM1, KM5, KM6, KS13 (E):** Ekte berøring, nettbrett og safe area på telefon med hakk er ikke testet. Målene er bare fra emulering.
- **B1, KS9 (E):** Om lyden faktisk høres, er ikke kontrollert. Bare den lagrede verdien og lydruta er sjekket.
- **U2, U3, KM3, KM10, KM13 (V):** Even må selv prøve om han forstår menyen, finner Velg verden og forstår hva Esc gjør i verdensvalget.
- **T3, `prefers-reduced-motion`:** Kun kodelest (`animation:none`), ikke emulert.
- **T4:** Kontrast er ikke målt. Skjermbildene viser mørk tekst på lys bakgrunn.
- **Y1, Y2:** Bildefrekvensen kan ikke måles med SwiftShader, og det er ikke valgt referansemobil. Pause ved fanebytte (`blur` og `visibilitychange`) er bare kodelest. Den koden er uendret fra v2.
- **S4:** Personvernsiden er ikke gjennomgått. Diffen endrer ikke hva som samles inn.
- **ST4 og spilletidsmilepæler:** `test/statistikk/` finnes ikke. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **UI8a–c:** Ikke målt. UI1–UI10 er ikke tatt i bruk for spillet.
- **Grunnlag:** Agentversjonen avviker fra repoet, se «Testet».

## Klar for testing hos Even?
JA MED FORBEHOLD – jeg fant ingen kritiske feil eller konsollfeil. F1 og alle fokusrettingene er bekreftet med ekte taster og klikk, begge kopiene er like kilden, og testendringene svekker ingen eksisterende kontroll. Forbeholdene:
- Rapporten bygger på agent 2.3 fra `/home/claude/evnstudio`, mens piloten har 2.2.
- Ingenting er testet på ekte mobil.
- De kjente avvikene F3, K2 og ST er fortsatt åpne.

Testskript og skjermbilder ligger i /tmp/qa-4d627/ (`t1.mjs`–`t5.mjs` og `skjerm/`), utenfor repoet. Utskriften fra testsuiten ligger i /tmp/qa-4d627-kjor.txt.
