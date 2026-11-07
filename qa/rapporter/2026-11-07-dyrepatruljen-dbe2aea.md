# EVN Game QA: Dyrepatruljen 0.11.6
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit dbe2aea8422ad0b9b883b7d491c49c726d31771e
Testkvittering: evn1 commit=dbe2aea8422ad0b9b883b7d491c49c726d31771e tester=95301167375e arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: full – kontroll før publisering. Endringen mot `main` gjelder felles kode (ny EVN-MENY 1.0 oppå EVN-PAUSE v2) og testsuiten.
Testet:
- **Grunnlag:** «Grunnlag» viser agentfila i arbeidstreet, slik oppdraget ber om. Den er versjon 2.2. Økten min kjørte med definisjon 2.3. Forskjellen er bare avsnittet om felles meny (KM), og det har jeg brukt rådgivende. Standarden er den i arbeidstreet. EVN UI-standard 1.1 er lest fra `/home/claude/evnstudio` og bare brukt som rådgivende referanse.
- **Avvik fra oppdraget:** Rapporten `qa/rapporter/2026-11-07-dyrepatruljen-2472c0c.md` finnes ikke, verken i arbeidstreet eller i `/home/claude/evnstudio`. Den siste lagrede rapporten for spillet gjelder 4d627da. Ingen resultater fra tidligere commits er brukt som bevis her. Alt er kjørt på nytt på dbe2aea.
- **Omfang bekreftet:** Fra 4d627da til HEAD er bare `ENDRINGSLOGG.md`, `test/index.html` og én QA-rapport endret. Spillfila, `felles/`, `statistikk.js`, `ecoins/` og `butikk/` er uendret, og `personvern/` og `sikkerhet/` er uendret mot `main`.
- **Testsuite:** `node test/kjor.mjs` i `/home/claude/qa-dbe` med google-chrome ga 174 ok, 0 feil, 0 varsel og 2 ikke innført (`statistikk` og `ui`). Utskriften ligger i `/tmp/qa-dbe-kjor.txt`.
- **Nettleser:** headless Chrome via CDP. Skriptene `t1`–`t7.mjs` og skjermbildene ligger i `/tmp/qa-dbe/`.
  - Tastene er ekte CDP-tastetrykk. På PC er det brukt CDP-museklikk og på mobil CDP-berøring.
  - Størrelser: 1280×800 på PC. 375×812, 320×568, 740×360, 568×320 og 812×375 er emulert mobil med berøring.
  - `localStorage` ble tømt før og etter hver test.
- **Statistikk:** evnstudio.no ble avskåret og sendt til den lokale serveren, og GoatCounter ble byttet ut med en lokal stubb. Det gikk ingen ekte trafikk og ble ingen tellinger.
- **Rydding:** Testserveren på 127.0.0.1:8771 er stoppet, testnettleserne er lukket, og `git status` er tom.

## Oppfylte krav
**Funksjon og brukeropplevelse:**
- **F1:** Hele løpet virker uten å henge og uten konsollfeil:
  - Start → verdensvalg → verden → gå med W.
  - Menyen åpnes med P, Esc og ☰. Den lukkes med P, Esc, ✕ og Fortsett.
  - Kartet åpnes med M og 🗺️, og dyreboka med 📖, I og B.
  - Meny › Velg verden fører til en ny verden.
  - Meny › Avslutt › Ja går til `/`.
  - Under pause sto spilletiden stille (10829 ms i 3 s), og W flyttet ikke helten.
- **F2:** Et fanget dyr (`{"v":1,"reddet":{"gata":["katt1"]}}`) var med etter omlasting. Nullstilling spør først, med fokus på Nei. Esc beholder lagringen, og «Ja, slett alt» sletter den.
- **U1:** Startkortet viser «Versjon 0.11.6», styringshjelp og «← Tilbake til EVN Studio».

**Tilgjengelighet:**
- **T1 (emulert):** ☰ er 96×48 px, eller 48×48 px når skjermen er smalere enn 400 px. 🗺️ og 📖 er 48×48 px, og Snik er 66×66 px. Suiten fant ingen knapper under 44 px og ingen overlapp i fire størrelser.
- **T2:** Med ekte Tab i 1280×800 går fokus Fortsett → 8 ruter → saldo → ✕ → Fortsett. Shift+Tab fra Fortsett går til ✕.
  - Suiten bekrefter Tab i leserekkefølge og at Tab blir i menyen i alle fire størrelser.
  - Avslutt-spørsmålet og nullstillingen setter fokus på Nei. Enter (`\r`) og klikk på Nei gir fokus tilbake på Avslutt.
- **T3:** Zoom er ikke sperret. Med emulert `prefers-reduced-motion: reduce` får Start ▶ `animation: none` (ellers `puls`).

**Teknisk og sikkerhet:**
- **K1:** `royk` er OK for alle fire spill. Mine kjøringer ga 0 feil, 0 svar på 400 eller høyere og 0 eksterne forespørsler.
- **K3:** Versjonen er 0.11.6 på startkortet. ENDRINGSLOGG har en rad for 0.11.6 som stemmer med koden.
- **S1:** Den statiske CSP-testen er OK. CSP har `object-src 'none'` og ingen `unsafe-eval`, og diffen legger ikke til nye domener.
- **S2:** Diffen legger ikke til konto, kjøp med ekte penger eller innsamling. E-shop og Garderobe er på samme nettsted.
- **S3:** Ingen fritekst. Kontrollert ved kodelesing.
- **Y2 (delvis):** En `blur`-hendelse setter spillet på pause og åpner menyen.

**Betingede krav:**
- **B1:** L veksler `evn-dyrepatruljen-lyd` mellom `paa` og `av`, og valget lagres. Suiten bekrefter L i menyen.
- **B2:** Kartet viser «Du er her». Med kartet åpent sto spilletiden stille (19179 ms), og W flyttet ikke helten.

**Statistikk:**
- **ST3:** Ingenting ble sendt lokalt. `statistikk.js` stopper når vertsnavnet ikke er evnstudio.no.
- **ST5 (det som er observert):** Ingen hendelse før start. `start-dyrepatruljen` kom én gang og ble ikke sendt på nytt da jeg byttet verden.
- **ST6:** `document.cookie` er tom. Bare `evn-dyrepatruljen-lyd` og `evn-spilletid-dyrepatruljen` lagres, og ingen av dem er en ID.

**Meny og styring (rådgivende):**
- **Kopikontroll:** Begge merkede kopier er like kilden tegn for tegn: EVN-MENY 1.0 på linje 383–588 og EVN-PAUSE v2 på linje 186–382. Både suiten og min egen sammenligning viser det. Kjernen i pause v2 finnes uendret i 0.11.5 på `main`.
- **KM1–KM5 og KM13:** ☰ står oppe til venstre, status i midten og 🗺️ og 📖 oppe til høyre. Avslutt er skjult i HUD og står i menyen.
  - Fokus går tilbake til knappen som åpnet: ☰, 🗺️ eller 📖.
  - I 568×320 er Fortsett synlig uten rulling (nederste kant y=145, se skjermbildet `m568x320-meny.png`).

**Testendringene (eierens krav 7.11):** Ingen svekkelse funnet.
- Mot `main` er bare `test/index.html` endret, med to endrede linjer og ny kode for suiten:
  - `meny` er lagt til i `SUITER`.
  - `meny` er lagt til i `IKKE_GJELDENDE`. Det gjelder bare den nye suiten.
- `test/kjor.mjs`, `test/publiseringssjekk.mjs` og `test/ecoins/` er uendret.
- Nettleserfeil i spillrammene telles fortsatt som FEIL i `royk`, også når de oppstår under menytesten (`kjor.mjs` linje 143–144).
- Siden 4d627da er det bare kommet én ny rådgivende kontroll (KM12-pause) og en rettet kommentar. Ingen kontroll er fjernet.

**Uendret spill:** Lagringsnøklene, `statistikk.js`, `ecoins/` og spillmekanikken er uendret mot `main`.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle punktene er kjente fra før og uendret:
- **F3, verifisert feil:** Lagringen `{"v":1,"reddet":{"gata":null}}` gir «TypeError: Cannot read properties of null (reading 'length')» når en verden velges, og spillet blir stående i verdensvalget.
  - **Gjenskap:** sett nøkkelen `evn-dyrespillet-v1` til verdien over, last siden, trykk Start og velg Gata.
  - Andre ødelagte lagringer virker: ikke-JSON, `null`, `{}`, `{"reddet":[]}`, `"x"`, `"abc"` og `[null,5]`. Det gjør også lagring i 0.11.5-format.
- **K2, verifisert feil:** En feil som kastes under spilling, gir ingen vennlig melding. Det finnes ingen global feilfanger.
- **ST1, avvik:** `statistikk.js` lastes nederst med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start`, og start registreres ved klikk på `#startBtn`. Hendelsen `versjon-dyrepatruljen-0.11.6` kom ikke.
- **ST2, avvik:** Spillet har ingen `EVNAktivTid` og bruker EVN-PAUSE v2, ikke v3. Spilletiden i `statistikk.js` er bare basert på synlig fane.
- **ST4, avvik:** `statistikk.js` sender ingen `feil-dyrepatruljen-*`.
- **ST7, avvik:** Statistikken følger ikke godkjent ST-løsning, se ST1, ST2 og ST4.
- **ST8, avvik:** `test/statistikk/` finnes ikke, så kontrollen kan ikke kjøres.

## Anbefalte forbedringer
- **Fokus etter I og Esc avhenger av tid (mulig problem, KM13 og KS12).** Trykkes Esc rundt 350 ms etter I, havner fokus på BODY i stedet for 📖 eller ☰. Med lengre pause virker det. Jeg så det i to av fire kjøringer av «blur → I → Esc» og én gang i «P → I → Esc» (de 5 andre gangene gikk det riktig).
  - **Årsaken er trolig** at `settFokus` venter på et intervall.
  - **For å avgjøre det:** gjenta tastene med 300–400 ms mellomrom på en ekte PC.
- **B → Esc:** Fokus havner på BODY, fordi B ikke registrerer hva som åpnet boka. Funnet er kjent fra før.
- **Meny › Velg verden:** Fokus står på BODY i verdensvalget, og Esc går til startkortet. Funnet er kjent fra før.
- **Lukk nederst i dyreboka:** Knappen står på y≈3259 og må rulles inn før den kan trykkes. Etter rulling virker den, og fokus går til ☰.
- **Start under bretten:** Start ligger under bretten i 320×568 (bunn y=700) og i liggende format (bunn y=460 i 740×360, 568×320 og 812×375). Ingen størrelse har sideveis rulling. Funnet er kjent fra før.
- **ENDRINGSLOGG:** Raden sier at Ivar har bekreftet Evens test og godkjent publisering. Det kan ikke QA kontrollere. QA-rapporten er ikke en godkjenning.

## Kontroller som ikke kunne utføres
- **U2, U3 (V):** Even må selv vurdere om han forstår menyen, Velg verden og Esc i verdensvalget.
- **T1, KM6, KM7, KS13 (E):** Ekte berøring, nettbrett og safe area på telefon med hakk er ikke testet. Målene er bare fra emulering.
- **T4:** Kontrast er ikke målt. Skjermbildene viser mørk tekst på lys bakgrunn.
- **Y1 (E):** Det er ikke valgt referansemobil, og SwiftShader kan ikke måle bildefrekvens.
- **Y2:** Hastighet ved ulike skjermfrekvenser er ikke målt. Bare pause ved `blur` er testet.
- **B1 (E):** Om lyden faktisk høres, er ikke kontrollert.
- **B3 (E):** Tapt WebGL-kontekst og lavere grafikk på svake enheter er ikke testet.
- **S4:** Personvernsiden er ikke gjennomgått, men den er uendret mot `main`, og diffen endrer ikke hva som samles inn.
- **ST4 og milepæler for spilletid:** `test/statistikk/` mangler. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **UI1–UI10 og UI8a–c:** Ikke kontrollert. Kravene er ikke tatt i bruk for spillet (godkjent hovedløsning).
- **B4–B7:** Gjelder ikke for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – jeg fant ingen kritiske feil. F1 er testet med ekte taster og klikk, begge kopiene er like kilden, og testendringene svekker ingen eksisterende kontroll. Forbeholdene:
- Ingenting er testet på ekte enhet.
- De kjente avvikene F3, K2 og ST1/ST2/ST4/ST7/ST8 er fortsatt åpne.
- Rapporten for 2472c0c som oppdraget viser til, finnes ikke.
