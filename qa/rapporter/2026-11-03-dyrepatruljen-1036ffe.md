# EVN Game QA: Dyrepatruljen 0.11.1
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, gjeldende versjon er 1.1, S2 etter 1.2a, oversikten per spill etter 1.2b) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 1036ffec9139d1853d2819ff45dec5d722251d1c
Testkvittering: evn1 commit=1036ffec9139d1853d2819ff45dec5d722251d1c tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full. Oppdraget ber om det, og versjonen skal foreslås publisert. Selve kodeendringen er liten: én linje i `sjekkFangst()`, versjonsnummeret og en rad i endringsloggen.
Testet: Linux. `node test/kjor.mjs --base origin/main` med /usr/bin/google-chrome ga ingen FEIL og ingen VARSEL. Én kontroll er KJENT (T3 i Fossil Zoo). Ellers brukte jeg Playwright Chromium med SwiftShader og reducedMotion `reduce`. Repoet ble servert via en rute for https://evnstudio.no/**, og gc.zgo.at var erstattet med en stub som logger `goatcounter.count`. Til ST3 brukte jeg en lokal node-server på 127.0.0.1, som ble stoppet etter testen. Til sammenligning servert jag origin/main (0.11.0) fra en kopi i /tmp/qa-hone2/main. Størrelser: 1280×800 og emulert mobil 375×812, 740×360, 812×375, 320×568 og 568×320. Jeg brukte ekte tastetrykk (W, P, Esc, M, B, L, Tab, Shift+Tab, Mellomrom) og Playwright-klikk. `__dyrespill` ble bare brukt til å plassere roboten og sette opp testtilstand. Alle resultater er fra denne commiten. Ingen er hentet fra rapporten for b1508b6.

Merknad om grunnlaget: Versjonslinja øverst i standarden sier fortsatt «Versjon 1.2 (utkast)». 1.2b står bare i versjonshistorikken («Godkjennes ved sammenslåing»). Innholdet stemmer med oppdraget: Dyrepatruljen har B1, B2 og B3 i oversikten.

## Oppfylte krav
- **Endringen (fangst):** 0.11.1 fanget og lagret alle 150 dyr i de 15 verdenene med ekte Mellomrom. 31 av dem sto høyere enn 1,6 m over havnivå, men høyden over bakken var 0. På 0.11.0 stoppet fangsten på dyr som sto høyt i 8 av de 14 verdenene som ble testet før kjøringen nådde tidsgrensen. Eksempler: reinsdyr1 i Snø (y 2,80), gelebjorn2 i Godteri (y 4,21), elg1 i Skog (y 2,57) og fisk3 i Havet (y 1,74). Alle hadde høyde 0 over bakken. Feilen er gjenskapt på 0.11.0 og rettet i 0.11.1. Ifølge koden settes dyrenes `y` til `bakkeHoyde` hver ramme. Fuglenes sveving ligger på `kropp`, ikke på `mesh`, så ingen fugl blir lettere å fange av endringen.
- **F1:** Start åpner verdenskartet, og Gata kan velges. W flytter roboten. P og Esc åpner pausen, og Fortsett og Esc lukker den. Avslutt viser «Vil du avslutte?». «Nei» går tilbake til spillet, og «Ja» går til https://evnstudio.no/. Spillet står stille (posisjonene er uendret) i pausen, med kartet åpent og mens Avslutt-spørsmålet vises.
- **F2:** En fangst lagres med en gang (`{"v":1,"reddet":{"gata":["katt1"]}}`) og er der etter omlasting. «Start helt på nytt» spør først. Esc avbryter, og lagringen beholdes. «Ja» sletter bare `evn-dyrespillet-v1`. Spilletid og lydvalg beholdes.
- **U1:** Startkortet har tittel, mål, fem linjer om styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.11.1».
- **U2 (Q-delen):** Styringen står på startkortet og under «Slik styrer du» i pausen, sammen med kart og dyrebok. HUD viser «🏙️ Gata · 🐾 0/10».
- **U3 (Q-delen):** Enkel norsk, og tap føles ikke straffende («Du reddet oransje katt! 🐱», «Spillet står stille. Ingenting er borte.»).
- **T1:** Alle trykkflater er minst 44×44 i alle seks størrelser. HUD-knappene er 48×48, styrespaken 130, Snik 66 og Håv 92.
- **T2:** Tab og Shift+Tab blir værende i pausen, kartet, dyreboka, «Vil du avslutte?» og «Starte helt på nytt?». Fokus flyttes til første knapp i hver dialog. Det kjente funnet om Tab ut av pausekortet er fortsatt rettet i dette spillet.
- **T3:** Zoom er ikke sperret (`width=device-width, initial-scale=1`, statisk test OK). Ved reduced motion er animasjonen til Start `none` i alle størrelser.
- **T4 (delvis):** Kontrasten er beregnet fra CSS-fargene, ikke målt på skjermen. Brødtekst 14,6, styring 14,0, Start 4,72, tilbakelenke 5,33, versjon 5,52, verdensknapper 14,6, HUD-merke 15,2 og beskjed 15,2. Tittelen har 3,07, men er 42 px og dermed stor tekst. Låste verdener vises med tekst og tall, ikke bare med farge.
- **Y2 (delvis):** En syntetisk `visibilitychange` åpner pausen med «Pause fordi du byttet fane eller app.».
- **K1:** Røyktesten og alle mine kjøringer ga 0 konsollfeil, 0 manglende filer og 0 CSP-brudd. Ingen sidefeil under fangsten av alle 150 dyr.
- **K3:** «Versjon 0.11.1» på startkortet og `VERSJON = 'v0.11.1'`. Endringsloggen har en ny rad, og innholdet stemmer med diffen.
- **S1:** De statiske CSP-testene er OK. De eneste forespørslene til andre domener gikk til gc.zgo.at, som er godkjent i CSP. På 127.0.0.1 ble det ikke sendt noen.
- **S2:** Ingen konto, chat, kjøp med ekte penger eller reklame (kodelest og kjørt).
- **S3:** Ingen fritekstfelt.
- **S4:** Personvernsiden beskriver lokal lagring, GoatCounter uten informasjonskapsler og grov spilletid som «kan også telle pauser». Det stemmer med det som ble målt (se ST2).
- **B1:** L slår lyden av (🔇, `aria-pressed=true`), og valget huskes etter omlasting.
- **B2:** M åpner kartet med «🔴 Du er her · 🏙️ Gata», og den røde markøren er tegnet. Spillet står stille, og M lukker kartet.
- **ST3:** Med 127.0.0.1 ble det ikke sendt noen forespørsler til GoatCounter.
- **ST6:** 0 informasjonskapsler. Spillet lagrer bare `evn-dyrepatruljen-lyd` og `evn-spilletid-dyrepatruljen` (og `evn-dyrespillet-v1` ved fangst). Ingen ID-er i koden.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F3, verifisert feil som også finnes i publisert 0.11.0:** Lagring fra 0.11.0, laget av main-koden, leses riktig og bygges videre på. Lagring som ikke er gyldig JSON, `null`, `[]`, `v:99` og tom streng krasjer ikke. Gyldig JSON med feil typer stopper derimot spillet. Gjenskapes ved å sette `evn-dyrespillet-v1` og trykke Start:
  - `{"v":1,"reddet":{"gata":null}}`: verdenskartet vises ikke («Cannot read properties of null (reading 'length')»).
  - `{"v":1,"reddet":{"gata":5}}`: Gata starter ikke («reddet.includes is not a function»).
  - `{"v":1,"reddet":"abc"}`: fangst gir TypeError, og ingenting lagres.

  I de to første tilfellene er «Start helt på nytt» skjult, så barnet kommer seg ikke ut av det selv. Jeg regner det ikke som kritisk, fordi spillet selv aldri skriver slike verdier, og feilen er uendret fra 0.11.0.
- **K2, kjent funn, uendret:** Jeg kastet en testfeil, og den ga ingen vennlig melding med mulighet til å laste på nytt.
- **ST1, verifisert avvik:** `statistikk.js` lastes nederst i `&lt;body&gt;` (linje 6823), ikke i `&lt;head&gt;`, og spillet sender ikke `evn-start`. `start-dyrepatruljen` sendes ved klikk på Start, mens tilstanden fortsatt er `kart`.
- **ST2, verifisert feil:** `spilletid-dyrepatruljen-01min` ble sendt etter 66 s på verdenskartet uten at noen verden var startet. Den ble også sendt etter 66 s der pausen var åpen nesten hele tiden. Spillet bruker EVN-PAUSE v2 uten `EVNAktivTid`.
- **ST4, verifisert avvik:** Etter en uventet feil under spilling ble det ikke sendt noen `feil-dyrepatruljen-*`.
- **ST5, verifisert avvik:** `versjon-dyrepatruljen-0.11.1` sendes ikke. Ingen hendelse ble sendt to ganger, og ingen inneholdt fritekst.
- **ST7, avvik:** Følger av ST1, ST2, ST4 og ST5.

ST-avvikene skyldes felles kode. `statistikk.js` er uendret mot origin/main, og de gjelder også publisert 0.11.0. Endringen i 0.11.1 har ikke laget dem.

## Anbefalte forbedringer
- Kontroller typene i `lastInn()` (`reddet` skal være et objekt med lister), eller ta vare på en kopi og start tomt. Det fjerner F3-avviket og gjør «Start helt på nytt» synlig igjen.
- I 320×568 overlapper Snik-knappen styrespaken med 16×66 px (beregnet fra posisjonene). Det kan gi feil trykk på smale telefoner.
- I 740×360, 812×375, 568×320 og 320×568 er Start-knappen under skjermkanten (bunnen på 438 eller 633 px), og startkortet må rulles. Ingen sideveis rulling.
- Grensen på 1,6 m i `sjekkFangst()` slår nå i praksis aldri inn, fordi levende dyr alltid står på bakken. Den kan fjernes eller dokumenteres hvis dyr i lufta ikke er planlagt.
- Versjonslinja øverst i standarden bør nevne 1.2b når den slås sammen.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes verken på grenen eller på origin/main («ikke-innfort» i kvitteringen). ST-kravene er kontrollert med stub og kodelesing i stedet. Om hendelsene faktisk kommer fram i GoatCounter, må en voksen med innlogging sjekke. Milepælene 5 og 15 min ble sendt i den lange fangstkjøringen på 0.11.0, men er ikke kontrollert systematisk. 30 og 60 min er ikke testet.
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen kan ikke måles meningsfullt i SwiftShader.
- **Y2:** Fanebytte er bare testet med syntetisk `visibilitychange`. At farten er uavhengig av skjermfrekvens, er bare kodelest (`dt`-basert, begrenset til 0,05).
- **B3:** Uten WebGL er Start deaktivert («3D virker ikke her»), og meldingen «Dette spillet trenger 3D …» vises. Ingen sidefeil. Lavere grafikk på mobil (færre partikler og lavere pikselforhold) er bare kodelest. Tapt WebGL-kontekst håndteres ikke i koden. Ekte enheter (E) er ikke testet.
- **T1, T3 og B1 (E):** Ekte berøring, knipezoom og lyd på iPhone og Android er ikke testet. Mobil er bare emulert.
- **T4:** Teksten over 3D-scenen (`#tips`: hvit på rgba(0,0,0,.45)) er ikke målt mot selve scenen.
- **U2 og U3 (V):** Om barn forstår spillet og synes det er morsomt, er ikke testet. Det må Even prøve, også at høna i Gården nå kan fanges.
- **Fangst på 0.11.0:** Sammenligningen ble stoppet av tidsgrensen før Eventyr (verden 15). Testen min går videre til neste verden ved første dyr som ikke kan fanges, så tallene for 0.11.0 er ikke en fullstendig opptelling.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk i spillet, så de er ikke kontrollert. Klarspråk har status forslag og er ikke kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD. Rettingen virker: 150 av 150 dyr kan fanges, mens 0.11.0 stopper på dyr høyt i terrenget. F1 er testet uten kritiske feil. Statistikken følger ikke ST1–ST8 (felles kode, også i 0.11.0), F3 feiler ved lagring med feil typer, og Y1 og ekte mobil er ikke testet.

Arbeidstreet er rent, og HEAD er 1036ffe. Testserverne mine og serveren til `kjor.mjs` er stoppet, og ingen nettleserprosesser kjører. Testskript og logger ligger i /tmp/qa-hone2/.
