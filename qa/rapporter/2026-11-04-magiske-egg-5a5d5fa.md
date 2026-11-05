# EVN Game QA: Magiske egg 0.9.2
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1, med 1.2a/S2 og 1.2b-oversikten) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 5a5d5fa896e77224b193c8643054d63fe57fe463
Testkvittering: evn1 commit=5a5d5fa896e77224b193c8643054d63fe57fe463 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full. Oppdraget ber om fullt nivå. Endringen gjelder spillogikk (trekning, butikk, skogegg og pris) og en versjon som skal foreslås publisert.
Testet: lokalt på Linux med Google Chrome headless via Playwright (Node) og SwiftShader. Testserveren var `python3 -m http.server` på 127.0.0.1:8832. En kopi av `origin/main` (ff61022, laget med `git archive` i `/home/claude/qa-tmp-egg/mainroot`) ble servert på 8833 for sammenligning. Spillet går med omtrent 1,3 bilder per sekund i SwiftShader. Derfor ble `renderer.render` byttet ut med en tom funksjon i testnettleseren etter Start i logikktestene. Spillogikken ble kjørt som den er. Klekking ble drevet med `oppdaterRedet(0/3)` og skogegg med `oppdaterSjeldent(500)`. Testlagringene ble satt med `context.addInitScript` før første innlasting. Spilleren ble flyttet med `spiller.pos`. Jeg brukte ekte tastetrykk (Enter, piler, E, P, Esc, M, Tab), ekte klikk på kjøpsknappene og tap på mobil. Størrelser: 1280×800 og 240×160 (logikk), og 375×812, 740×360, 320×568 og 568×320 med emulert berøring. Hver test fikk en ny nettleserprofil. `node test/kjor.mjs --base origin/main` ble kjørt fra repoets rot.

## Oppfylte krav
- **Endringen, samleboka med full park (hovedkontrollen):** Lagringene ble lastet uten sidefeil, og alle fullførte samleboka uten duplikater. Hver klekking ga en ny art:
  - **30 dyr** (6 arter, nivå 1): 9 klekkinger ga 15/15. Det var 8 lilla egg og 1 skogegg. Ilddrev kom fra skogegget, fordi gullegg er låst til nivå 6.
  - **41 dyr** (9 arter, nivå 2): 6 klekkinger ga 15/15. Det var 3 gullegg og 3 lilla egg.
  - **64 dyr** (12 arter): 3 klekkinger ga 15/15.

  Etter at samleboka var full:
  - Butikken viser «Parken er full! 🏞️» (`type: full`).
  - Det kom ikke flere skogegg.
  - Fremgangen var den samme etter omlasting.
  - E-coins fikk `egg.alle`.
  - Mens et egg venter, viser alle knappene «Vent på egget» og er av (0 aktive).
- **Kant-tilfeller med full park (kjørt):**
  - Bare en vanlig art mangler: Vanlig og Blått er åpne, Lilla og Gull viser «Ingen nye dyr». Det kom ikke skogegg, og kjøpet ga den manglende arten (boblefrosk).
  - 29 dyr og 1 egg i kø: knappene viser «Vent på egget», og det kommer ikke skogegg. Egget i køen klekkes med vanlig trekning (`trekkDyr` 1 kall, 29 + 0 er under taket). Deretter åpner butikken seg og skogegg kan komme.
  - Spilleren bærer et skogegg: knappene viser «Vent på egget».
  - Kjøpsvakten: jeg fjernet `disabled` på knappene i DOM og klikket. Kjøpet ble avvist både med egg i kø, med båret egg og når typen ikke kan gi en ny art (0 mynter trukket, køen uendret).
- **Under 30 dyr er uendret mot main (sammenlignet ved kjøring):** For 0, 0+1, 10, 10+1 og 29 dyr var disse like mellom main og grenen:
  - `finnHandling`
  - prisene for alle fire eggtypene
  - HTML-en i `byggEggbutikk`
  - om skogegg kan komme
  - kjøp med ekte klikk

  Ved 29+1 (= 30, full park) er det forventede forskjeller. `trekkDyr` er uendret i diffen. Med 10 dyr og 18 egg i kø (alle typer) kalte `klekk` `trekkDyr` i 18 av 18 klekkinger. Priskapselen `Math.min(maksDyr, …)` gjør ingen forskjell under 30, og prisene ved 30, 41, 64 og 80 dyr er like (12117 / 36351 / 121169 / 484676).
- **E-coins urørt:** Diffen har ingen linjer med `EVNEcoins` eller `ecoins`. E-coins-suiten ga OK (20 kontroller). `egg.art.*` og `egg.alle` ble tjent i alle tre lagringene.
- **Lagringsformat uendret:** Diffen har ingen endringer i `lagre`, `lastInn` eller `LAGRING` (`evn-magiske-egg-v1`).
- **F1:** Røyktesten ga OK. Ved kjøring på 1280×800:
  - Enter startet spillet, og piltastene flyttet spilleren.
  - E åpnet eggbutikken. Kjøpet (25 → 10 mynter) klekket Blomsterbie, og Enter lukket kortet.
  - P satte på pause, Esc fortsatte, og M åpnet kartet (spillet sto på pause).
- **F2:** Etter omlasting var 1 dyr, 10 mynter og samleboka der fortsatt. «🗑️ Start helt på nytt» spør først. «Nei, behold alt» beholder lagringen, og «Ja, slett alt» sletter den.
- **F3:** Spillet krasjet ikke med disse lagringene: ugyldig JSON, `v:2`, `dyr:[null]` med `funnet:[]`, `eggKo` med ugyldige verdier og 80 dyr med `mynter:1e308`. Alle kunne startes, og butikken virket. Lagringer med 30, 41 og 64 dyr i 0.9.0-format ble lastet som før.
- **U1:** Startkortet viser «Versjon 0.9.2» (røyktest og egen kjøring), med mål, styring og vei tilbake (uendret).
- **U3 (QA-delen):** De nye tekstene er korte og bruker enkle ord: «Ingen nye dyr», «Vent på egget» og «🏞️ Parken er full. Nå gir eggene bare dyr du ikke har i samleboka!».
- **T1 (emulert):** Knappene i eggbutikken er minst 84×48 px, Lukk er 143×66 og handlingsknappen 220×72, målt i alle fem størrelser. Ingen sideveis rulling. Butikken er høyere enn skjermen på 375×812, 320×568, 740×360 og 568×320, men `.lag` har `overflow:auto`, og Lukk ble rullet frem med Tab (se skjermbildet i 740×360).
- **T3 (statisk):** Viewport sperrer ikke zoom, og den statiske testen ga OK.
- **K1:** Røyktesten og nettleserkontrollen ga OK. Ingen sidefeil og ingen 404 i noen av mine kjøringer. Konsollen viste bare SwiftShaders «GPU stall due to ReadPixels» (fra testmiljøet).
- **K3:** «0.9.2» står i `&lt;title&gt;`, i `VERSJON` og på startkortet. `ENDRINGSLOGG.md` har en ny rad, og innholdet stemmer med koden og testene over.
- **S1:** CSP er uendret, og den statiske suiten ga OK (ingen nye domener og ingen `eval`).
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. Kjøp skjer bare med mynter i spillet, og E-coins er uendret.
- **S3:** Spillet har ingen fritekst.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **T2, verifisert feil (kjent og uendret):** Tab går ut av eggbutikken. I alle størrelser var rekkefølgen `BODY → bokKnapp → evnAvslutt → bla → lilla → lukkEggbutikk → BODY`. Slik gjenskapes den: åpne butikken med E og trykk Tab. Det samme gjelder det kjente felles T2-funnet.
2. **K2 (kjent, «alle spill», uendret):** Spillet har ingen global feilfanger.
3. **B1 (kjent fra forrige rapport, uendret):** Spillet lager lyd med WebAudio, men har ingen lydbryter. Bare kodelest.
4. **ST2, ST4, ST7 og ST8, verifisert ved kodelesing (felles og uendret):** `statistikk.js` er ikke endret i denne committen.
   - Den sender ikke `versjon-…` eller `feil-…`.
   - Spilletiden følger ikke pause, kart eller inaktivitet. Den telles bare mens fanen er synlig.
   - `EVNAktivTid` finnes ikke.
   - `test/statistikk/` er ikke innført.
5. **B3, mulig problem (kjent, uendret):** `webglcontextlost` blir ikke håndtert. Det må testes på en svak enhet.

## Anbefalte forbedringer
- **Prisen med full park (mulig problem for spillopplevelsen, må vurderes av Even og en voksen):** Litt sjeldne arter kan bare komme fra Blått egg (36 351 🪙) eller Lilla egg (121 169 🪙). Med 30 vanlige dyr på nivå 1 tjener man omtrent 3 🪙 i sekundet. Da tar ett blått egg omtrent 3,4 timer og ett lilla egg omtrent 11 timer (med alle dyr på nivå 5 omtrent en tredjedel). Prisnivået er det samme som på main ved 29 dyr, så det er ikke blitt verre. Men «samleboka kan alltid fullføres» gjelder i praksis bare med mye spilletid. Det er et designvalg, for eksempel en lavere pris på egg når parken er full.
- **Ilddrev med full park:** Arten trekkes jevnt blant de manglende. Hvis Ilddrev er én av fire manglende arter i skogegget, blir sjansen 25 % i stedet for `ilddrevSjanse` 5 %. Det følger av vedtaket om at «et egg gir alltid en art du mangler», men det bør nevnes for Even.
- **Små kant-tilfeller (bare kodelest, gir duplikat, men stopper ikke fremgangen):**
  - Et skogegg kan ligge i skogen fra før, og spilleren kan kjøpe et butikkegg samtidig, fordi kjøpsvakten ikke sjekker `sjeldentEgg`. Det andre egget kan da gi en art som finnes fra før.
  - Et skogegg som allerede ligger ute når skogpoolen blir fullført, gir et duplikat.
  - Ved 29 dyr og 1 egg i kø trekkes dyr nummer 30 på vanlig måte og kan bli et duplikat. Det stemmer med «under 30 er uendret».
- **Fra forrige rapport, uendret:**
  - Lagring som er ugyldig JSON eller har `v` ulik 1, forkastes uten kopi i `-kopi` (bekreftet igjen, `kopi:false`).
  - `-kopi`-nøkkelen slettes ikke ved nullstilling (ikke testet på nytt).
- Versjonen går fra 0.9.0 til 0.9.2, og 0.9.1 finnes ikke i endringsloggen. Det er ikke et krav, men det kan avklares.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Ingen referansemobil er valgt, og SwiftShader ga omtrent 1,3 bilder per sekund.
- **Y2:** Bare kodelest (`dt` har et tak). Ikke målt.
- **T4:** Bare kodelest, og visuelt på butikken (hvit tekst på mørk lilla, priser på gul). Det finnes ingen automatisk test.
- **B2:** Kartet åpnes med M og spillet står på pause (kjørt). At spilletiden ikke teller mens kartet er åpent, er ikke målt. Status: delvis.
- **T1, T3, B1 og B3 på enhet (E):** Ekte berøring, knipe-zoom, lyd og svake enheter.
- **U2, U3 og opplevd økonomi (V):** Om Even forstår «Ingen nye dyr» og «Vent på egget», og om prisene med full park føles rettferdige.
- **ST1:** `statistikk.js` med `data-spill="magiske-egg"` står i `&lt;head&gt;`, og `evn-start` sendes (kodelest).
- **ST3, ST5 og ST6:** Bare kodelest: hendelser bare fra evnstudio.no, bare `start-` og `spilletid-`, og ingen informasjonskapsler eller ID. Testsiden `test/statistikk/` mangler. Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging se.
- **S4:** Personvernsiden er ikke lest på nytt. Committen endrer ikke datahåndteringen.
- **UI1–UI10 og UI8a–c:** Godkjent hovedløsning, men ikke tatt i bruk for spillet. UI-suiten er ikke innført.
- **B4, B5, B6 og B7:** Gjelder ikke for spillet (se 1.2b).
- **Begrensninger i metoden:**
  - Logikktestene gikk uten rendering og med hurtigere klekking og skogegg-timer, som sier ingenting om bildefrekvens.
  - Samme trekning med fast `Math.random` kunne ikke brukes til å sammenligne main og grenen, fordi rekkefølgen varierte mellom to kjøringer av samme versjon. Bevis for at trekningen er uendret er derfor at `trekkDyr` er urørt i diffen og at kallene ble talt.
- **Automatiske tester (A) som mangler:** F2, F3, T2 fokus, T4, Y2, K2, B1, B2, B3, S2, S3, og regelen om full park og samleboka.
- **Testservere og filer:** Mine servere på 8832 og 8833 er stoppet. De på 8811 og 8812 var ikke mine og er ikke rørt. Arbeidstreet er rent (`git status` tom). Midlertidige filer ligger i `/home/claude/qa-tmp-egg/`.

## Klar for testing hos Even?
JA MED FORBEHOLD. F1 er testet, og rettingen virker: lagringer med 30, 41 og 64 dyr når 15/15 uten duplikater, og alt under 30 dyr er som på main. Ingen kritiske feil ble funnet. Forbeholdene er de kjente felles avvikene (T2, K2, B1 og statistikken), tester på enhet og om prisene med full park føles rimelige for Even.
