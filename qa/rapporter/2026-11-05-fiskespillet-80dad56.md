# EVN Game QA: Fiskespillet 0.5.0
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 80dad568b255de7debb32b33a346ecf0206b0bc4
Testkvittering: evn1 commit=80dad568b255de7debb32b33a346ecf0206b0bc4 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Oppdraget ber om full kontroll. Diffen siden 5581f2e endrer båtstyring, kamera, Kraken-kampen, fangsttilbakemelding, Havna og Fiskeboka, altså spillogikk. Versjonen skal også kunne foreslås publisert. `test/kjor.mjs` ga 98 OK, 0 FEIL, 0 VARSEL og 1 KJENT. Det kjente funnet er Fossil Zoo T3 `user-scalable=no`, som står i standarden og ikke gjelder dette spillet. To suiter er ikke innført (`test/statistikk/`, `prototype/ui/`). **Merk:** Grenen fikk en ny commit mens kontrollen pågikk: 3989a25 (0.5.1, «hjelpeprikker»). Den er ikke kontrollert. Jeg forkastet derfor kjøringer som traff arbeidstreet etter endringen, og kjørte alle kontrollene på nytt mot en `git archive` av nøyaktig 80dad56 (sammenlignet byte for byte).
Testet: Lokal `python3 -m http.server` på 127.0.0.1:8790 med rot i `/tmp/qa-fisk/root`. Der lå `v050` (80dad56), og for lagring fra eldre versjoner `v020` (4c1deba), `v030` (5581f2e) og `v040` (25c192e), alle på samme opprinnelse. Serveren er stoppet, og Chrome er lukket (0 prosesser). Port 8765 (pid 474) er ikke min, og jeg har ikke rørt den. Nettleser: headless /usr/bin/google-chrome via Playwright, WebGL via SwiftShader (5,5–6 bilder/s). Størrelser: 1280×800 med mus og tastatur, og 375×812, 740×360, 320×568 og 568×320 med emulert berøring og DPR 2. Jeg brukte ekte tastetrykk og musklikk, `touchscreen.tap` og fingerdrag via CDP `Input.dispatchTouchEvent`. Fanebytte og `blur` er syntetiske hendelser (Playwright skjuler ikke fanen). Testtilstand ble satt opp med `#test` og `window.__spill`: posisjon, stang, akvarie- og båtinnhold, `funnet`-biter og direkte kall til `visFangst`. Ødelagte lagringer ble skrevet fra en annen side på samme opprinnelse. Statistikk som på evnstudio.no ble testet ved avskjæring: `evnstudio.no` ble servert fra 80dad56, `gc.zgo.at/count.js` ble byttet med en stubb, annet eksternt ble stoppet, og `setInterval(…, 5000)` ble kjørt med 50 ms. Skriptene ligger i `/tmp/qa-fisk/skript`. Hver økt hadde egen profil, og localStorage ble tømt etterpå. `git status` er tom. Ingen resultater fra eldre commits er brukt som bevis.

## Oppfylte krav
- **F1:** Start virker med musklikk og med trykk i alle fem størrelser.
  - **Tastatur (ny styring):** ⬆️/W 3 s ga 6,8/5,3 enheter rett frem (0 til siden). ⬇️/S ga 2,1/1,6 bakover med fart −3,8. ⬅️/A gir svingen mot venstre på skjermen (Δretning +1,0/+1,2 på stedet), og ➡️/D gir svingen mot høyre (−1,3). ⬆️+⬅️ gir en venstresving i fart. ⬇️+⬅️ rygger som en bil. Kameraet ligger bak båten (cos = 0,91–1,0), og båten bremser når tasten slippes.
  - **Mus som styrespak:** Å dra opp ga 8,2 enheter rett frem. Å dra og holde til høyre eller venstre i 7 s låste retningen på −1,57/+1,48 rad, og båten kjørte rett. Som sammenligning snurret 0.4.0 −6,48 rad på samme test, så funnet om kjøring i ring er rettet.
  - **Berøring:** Fingerdrag via CDP viser styrespaken og gir samme låste sving (−1,6 rad) i alle fire mobilstørrelser. Spaken skjules når fingeren slippes.
  - **Fisking:** Normal modus ga første fisk etter 19 s. I `#test` ble 12 fisker fanget uten feil.
  - **Havna:** Lever, Akvariet og Butikk virker. Havna lukkes med Esc og ✕.
  - **Pause:** P åpner og Esc lukker.
  - **Kart:** M åpner, båten står stille med ⬆️ holdt inne, og Esc lukker.
  - **Avslutt:** 🚪 gir spørsmålet, og Esc svarer Nei uten `inert` igjen. «Ja, avslutt» ble ikke kjørt i denne kontrollen.
  - **Kraken:** Fanget med 23 trykk (+10 000, `kraken: true`, kortet vises). Ved tidsgrensen: «🐙💤 Kraken ble lei …».
- **0.5.0 punkt 1 (Kraken i ekte tid):** `igjen` sank 1,48 s på cirka 2 s ekte tid ved 5,5 bilder/s, og Kraken sank 3,5 per sekund uten trykk. Før ble spilltiden kappet til 0,05 s per bilde, så kampen gikk langt saktere. Klokka sto stille i pause (5 s), kart (3 s) og fiskebok (3 s). Hele kampen tok 72,9 s ekte tid, og det stemmer med 60 s pluss cirka 11 s i menyer. ⏱ og linja holder seg innenfor kampfeltet og overlapper ikke «Dra!» i noen størrelse.
- **0.5.0 punkt 2 (fangsttilbakemelding):** 12 ekte fangster stemte med regelen.
  - Ny legendarisk ga kort tre av tre ganger.
  - Første nye episke ga kort. Episke innen 60 s ga stor melding.
  - Ny art ga «📖 Ny art i fiskeboka», og ny rekord ga «🏆 Ny rekord!», begge som stor melding uten pause.
  - Andre fangster ga en kort melding.
  - Direkte kall ga kort, melding, melding (45 s) og kort (62 s) for nye episke, så grensen på 60 s holder. Gammel legendarisk ga stor melding uten kort.
- **0.5.0 punkt 3 (Havna):**
  - «⭐ Beste i akvariet» (360×53 px, musklikk) ga akvariet `[3,15,19,155,159]` og +21 i penger. Det er likt min egen utregning. Teksten viste «+💰 73/min», mot utregnet 73,2.
  - «🔄 Bytt», nådd med Tab og trykket med Enter, byttet ut den svakeste (+5 i penger, riktig akvarium og båt).
  - Fisk som er svakere enn akvariet, får teksten «Svakere enn alle i akvariet». Når akvariet ikke er fullt, vises «🐠 Akvariet +25/min», og Akvariet-fanen viser «/min» per fisk.
  - Ingen rad flyter over i noen størrelse. Overlapp som målingen fant, ligger i den rullende lista og er klippet bort. `elementFromPoint` treffer alle synlige knapper.
- **0.5.0 punkt 4 (Fiskeboka):** Tom bok viser «0 av 25», «0 av 5 000», sonene 0/8, 0/12 og 0/10, og «Neste mål: … Kystvannet (8 igjen)». Med sild i 10 farger, torsk og hai viser den «3 av 25», «13 av 5 000», sild «🎨 10/10 farger ✔» med gul ramme, og Kystvannet 2/8 (6 igjen). Med hele Kystvannet funnet går målet videre til Åpent hav (9 igjen). Med alle arter vises «Du har funnet alle 25 artene! 🎉». Mål og arter står i én kolonne ved bredde 420 px eller mindre, og det er ingen sideveis rulling.
- **0.5.0 punkt 5 (låst retning):** Se F1, styrespaken.
- **F2:** Tilstanden var lik felt for felt etter fangst, akvarium, lyd av og omlasting. Testmodus med «Bytt» og «Beste» endret ikke `-v1` (lik tegn for tegn). «Start helt på nytt»: Esc og «Nei, behold alt» beholder lagringen. «Ja, slett alt» sletter bare `-v1`, mens `-lyd` og `evn-spilletid-fiskespillet` blir stående. Lenken skjules etterpå.
- **F3:**
  - **Lagring fra eldre versjoner:** Ekte lagringer fra 0.2.0, 0.3.0 og 0.4.0 (fangst, akvarium, kjøp av stang og båt) ble lest felt for felt uten avvik i 0.5.0. Det kom ingen `-kopi`, ingen NaN og ingen feil, og den nye lagringen er lik den gamle. 0.4.0 leser også lagringen fra 0.5.0.
  - **Ødelagt lagring:** Ugyldig JSON, `v:2` og `[]` gir kopi i `-v1-kopi`. `null`, `"tekst"` og rare verdier gir 0 feil og ingen NaN, undefined eller Infinity i HUD, Havna (alle faner) og bok. Plass 7 og akvarieplass 8 blir 5/5, og båt 1 med plass 13 og 12 blir 10/10.
- **U1:** Startkortet har tittel, mål, oppdrag, ny styringstekst for PC og berøring, ▶ Start, Tilbake, «Start helt på nytt» og «Versjon 0.5.0». Start er synlig, og det er ingen sideveis rulling i noen av de fem størrelsene.
- **U2 (Q):** Hjelpelinja («⬆️ fremover · ⬅️➡️ svinge · ⬇️ bakover») og «Slik styrer du» i pausen stemmer med det jeg målte.
- **U3 (Q):** Tekstene er korte, og tap er mildt («Prøv igjen!»).
- **T1 (emulert):** Alle synlige knapper og lenker er minst 44×44 px i de fem størrelsene: start, spill, Havna (Lever og Akvariet), Fiskeboka og kamp. ⭐-knappen er 234×90 px ved 320×568. Statuspillene på 32 px er ikke knapper.
- **T3:** Med `prefers-reduced-motion` var kameraristen i kampen 0 (0,06 uten), og animasjonen er `none`. Viewport sperrer ikke zoom.
- **T4 (Q):** Sjeldenhet vises med navn og stjerner, og fremdrift vises med tall i tillegg til stolper.
- **K1:** Ingen ufangede feil, ingen konsollfeil og ingen svar med status 400 eller høyere fra spillet. Den eneste 404 er `/favicon.ico` fra hjelpesiden jeg brukte til å skrive lagringer. Røyktesten er OK.
- **K2:** En feil under pause gir feilkortet, og det blir stående etter Esc. Se T2.
- **S1:** CSP er uendret (`test/kjor.mjs` er OK), og det er ingen nye domener. Med produksjonsoppsettet ble bare `gc.zgo.at/count.js` hentet. Lokalt var det 0 eksterne forespørsler.
- **S2 (Q):** Ingen konto, chat, reklame eller kjøp med ekte penger.
- **S3:** Ingen fritekst (0 treff på `input`, `textarea` og `contenteditable`).
- **S4 (Q):** Personvernsiden («grove spilletidsintervaller … kan også telle pauser») stemmer med det jeg målte.
- **ST1:** `start-fiskespillet` kommer én gang, også når `evn-start` sendes en gang til. Den automatiske testen mangler.
- **ST3:** Lokalt sendes ingen forespørsler ut.
- **ST5:** Bare godkjente navn ble sendt, hvert én gang. Den automatiske testen mangler.
- **ST6:** `document.cookie` er tom. localStorage har bare spillets egne nøkler.
- **B1:** L slår lyden av, og 🔇 vises etter omlasting. Valget overlever nullstilling.
- **B2:** Kartet åpnes, og båten står stille mens det er åpent.
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her» med forklaring, og Start er slått av.
- **B4 (Q):** Kraken er valgfri, og tap er mildt. Se mulig problem under.
- **Y2 (delvis):** Pausen åpnes ved syntetisk `visibilitychange` (hidden) og `blur`, og Esc fortsetter spillet. Kraken går nå i ekte tid (målt).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **K3 – verifisert feil (nytt):** `ENDRINGSLOGG.md` i 80dad56 har ingen rad for 0.3.1, 0.4.0 eller 0.5.0 (0 treff). Siste rad er 0.3.0. Slik gjenskaper du det: `git show 80dad56:ENDRINGSLOGG.md`. Raden må på plass før publisering.
- **T2 – verifisert feil (kjent fra QA av 5581f2e, står fortsatt):** Start, trykk P, kast en feil (innebygd `setTimeout(()=>{throw …})`) og trykk Esc. Feilkortet vises fortsatt, men tre Tab gir fokus på HUD, `bokKnapp` og `lydKnapp` bak kortet. Årsaken er `settInert(null)` i felles EVN-PAUSE.
- **ST2 – verifisert feil (kjent):** Med produksjonsoppsettet ble `spilletid-fiskespillet-05min` sendt mens pausen var åpen. `window.EVNAktivTid` mangler (EVN-PAUSE v2).
- **ST4 – verifisert feil (kjent):** En feil under spilling gir ingen `feil-fiskespillet-spill`.
- **ST7 – verifisert feil (kjent):** `versjon-fiskespillet-0.5.0` og feilhendelsene mangler. Den godkjente statistikken er ikke tatt inn.
- **B4/U3 – mulig problem (nytt i 0.5.0):** Med tidsgrensen på 60 s må spilleren trykke cirka 3 ganger i sekundet. Ved 2,6–2,7 trykk/s (375×812, trykk via CDP) slapp Kraken unna på tid, og linja kom aldri over 81–89 %. Ved 3,0–3,1 trykk/s ble den fanget etter 34–40 s. Før 0.5.0 var det ingen tidsgrense, og samme trykktakt ville trolig ha vunnet til slutt. For å avgjøre det må Even og helst en 7-åring prøve på ekte telefon. `krakenTid`, `krakenDra` og `krakenSlipp` ligger i `INNST`.

## Anbefalte forbedringer
- **Havna-tekster (verifisert):**
  - «Svakere enn alle i akvariet» vises også når fisken har samme verdi som den svakeste.
  - ⭐-knappen sier «selg resten … selger for 💰 0» når ingenting selges.
  - Akvariet-fanen viser samlet «💰 2 hvert minutt», mens raden viser «💰 2,5/min». Avrundingen er ulik (`tall` mot `minTekst`).
- **Fiskeboka ved 320×568 (verifisert):** Artsnavn deles midt i ordet («Klovnefi|sk», «Blekksp|rut»). «varianter» er 51 px i en 45 px kolonne, men kan fortsatt leses.
- **HUD (verifisert):** Ved 320×568 og 💰 50 000 ligger pengepillen 3×32 px inn over 🔊. 🔊 ligger øverst og kan trykkes. Overlappen mellom 📖 og 🔊 ved 740×360 (34×44 px) står fortsatt fra før.
- **Styrespaken (V):** Retningen er låst til kameraet slik det sto da fingeren ble satt ned. Vil du snu mer enn til motsatt retning, må du løfte fingeren. Even bør vurdere om det føles naturlig.
- **Kodelest:** En pause eller meny som er kortere enn 1 s, teller med i Kraken-klokka (`gap > 1`). Det har liten betydning. `KAM` brukes ikke lenger.
- **Står fortsatt fra før (kodelest, ikke kjørt på nytt):**
  - Fokus etter Start havner på BODY.
  - `-kopi` slettes ikke ved nullstilling.
  - `webglcontextlost` håndteres ikke (0 treff).
  - Testmodus skriver til felles `evn-spilletid-fiskespillet` og `-lyd`.
  - Fiskespillet mangler i standardens oversikt per spill (jeg har brukt B1–B4).

## Kontroller som ikke kunne utføres
- **0.5.1 (3989a25):** Kom inn på grenen under kontrollen og er ikke kontrollert. Rapporten gjelder bare 80dad56. Publiseringssjekken krever en rapport for siste kodeendring.
- **ST8:** `test/statistikk/` finnes ikke, så `?auto` kunne ikke kjøres. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging. Milepælene etter 15, 30 og 60 minutter er bare testet med forkortet tid.
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader på cirka 5,5 bilder/s sier ingenting om ekte maskinvare.
- **Y2 – kun kodelest (delvis kjørt):** At båtfarten er uavhengig av skjermfrekvensen (dt med tak på 0,05 s), er ikke kjørt ved 60/120 Hz. Ekte fanebytte ble ikke utløst (syntetisk hendelse brukt).
- **T1, T3, B1, styrespaken (E):** Ekte berøring på iPhone og Android, tommelgrep, klypezoom og faktisk lyd er ikke testet. Mobil er emulert.
- **B3 (E):** Lavere grafikk og ytelse på svake enheter er ikke testet.
- **U2, U3, B4 (V):** Om bilstyringen, den låste styrespaken, tidsgrensen for Kraken og fangstmeldingene er forståelige og passe vanskelige, må Even teste.
- **F1 (delvis):** «Ja, avslutt» ble ikke kjørt i denne kontrollen. Felles kode er uendret siden forrige QA.
- **B5–B7:** Gjelder ikke (ingen læringsfakta, app-installasjon eller fritekst).
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for dette spillet.
- Lange økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. F1, den nye styringen og lagring fra 0.2.0–0.4.0 er testet ved kjøring, og 0.5.0-endringene virker som beskrevet. Før publisering må endringsloggen oppdateres (K3) og statistikken (ST2, ST4, ST7) på plass. T2-avviket står fortsatt, og Even bør prøve om tidsgrensen på 60 s for Kraken er for vanskelig for de yngste.
