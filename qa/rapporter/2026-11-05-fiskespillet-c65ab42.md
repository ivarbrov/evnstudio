# EVN Game QA: Fiskespillet 0.5.4
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c65ab42b53ab657ee7fe7d1c3c3132bdbf23fda9
Testkvittering: evn1 commit=c65ab42b53ab657ee7fe7d1c3c3132bdbf23fda9 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Kontrollen skal gjøres før versjonen foreslås publisert. 0.5.3 legger til ny spillogikk (Kraken-animasjonen og når det lagres), og 0.5.4 endrer fokus, feilhåndtering, nullstilling og testmodus. `test/kjor.mjs` ga 98 OK, 0 FEIL, 0 VARSEL og 1 KJENT (Fossil Zoo T3, gjelder ikke dette spillet). To suiter er ikke innført (`test/statistikk/`, `prototype/ui/`). Oppdraget oppga ikke versjon av standarden. Jeg har brukt gjeldende 1.1, og B1–B4 som i forrige kontroll.
Testet: Egen `python3 -m http.server` på 127.0.0.1:8791 med rot i `/tmp/qa-fisk054/root`. Der lå `git archive` av c65ab42 (byte for byte lik arbeidstreet), 1882d20 (0.5.2), 25c192e (0.4.0) og 4c1deba (0.2.0), alle på samme opprinnelse. Port 8765 (pid 195) er ikke min. Jeg har bare sjekket at den svarte, og ikke rørt den. Min server er stoppet, og det er 0 Chrome-prosesser igjen. Nettleser: headless /usr/bin/google-chrome via Playwright med SwiftShader (3 bilder/s). Størrelser: 1280×800 med mus og tastatur, og 375×812, 740×360, 320×568 og 568×320 med emulert berøring og DPR 2. Jeg brukte ekte tastetrykk, musklikk og `touchscreen.tap`. Feil ble kastet med `setTimeout(throw)`, og tapt WebGL ble laget med `WEBGL_lose_context`. Fanebytte og `blur` er syntetiske hendelser. Testtilstand ble satt opp med `window.__spill`. Statistikk som på evnstudio.no ble testet ved avskjæring (`ctx.route`) med en stubb for `count.js`, så ingenting gikk ut på nett. Hver økt hadde egen profil, og localStorage ble tømt etterpå. `git status` er tom.

## Oppfylte krav
- **0.5.3 Kraken i båten** (PC med tastatur og 375×812 med emulert trykk):
  - Lagringen skrives med en gang Kraken er fanget (`kraken:true`, penger 500 → 10 500) og står fortsatt etter omlasting.
  - Under animasjonen gir W 0,000 i forflytning. Knappen viser «🐙 Wow!» og er slått av, og E/mellomrom starter ikke fisking.
  - I pausen står animasjonen stille (t 0,12 → 0,12). Etterpå kommer «🏆 OPPDRAGET ER KLART! 🏆» med fokus på «Så kult!», og Enter eller trykk lukker kortet.
  - Kraken sitter i båten (skjermbilde ved 375×812), og meldingen har hvit tekst (`viktig`).
- **0.5.4-rettingene:**
  - Fokus etter Start går til `CANVAS`. Tab går deretter til 📖, 🔊, kart, pause, Avslutt og handling.
  - #test bruker egne nøkler (`evn-fiskespillet-test`, `-test-lyd`, `evn-spilletid-fiskespillet-test`). De ekte nøklene sto uendret («EKTE»).
  - HUD: overlappet 📖×🔊 ved 740×360 og 💰×🔊 og 📖×melding ved 320×568 og 375×812 er borte. Det er målt mot 0.5.2 med samme skript.
- **F1:**
  - Start, kjøring (W 3,2 enheter), pause og fortsett med P og Esc, og kart med M (båten står stille, Esc lukker) virker.
  - Kraken ble fanget med tastatur og med trykk.
  - Avslutt: Esc svarer Nei, og «Ja, avslutt» går til forsiden med lagringen i behold.
- **F2:** Kraken-fremgangen overlever omlasting. Nullstilling: Esc og Nei beholder alt. Ja sletter `-v1` og `-kopi`, mens lyd, spilletid og E-coins blir stående.
- **F3:**
  - Ekte lagringer fra 0.2.0, 0.4.0 og 0.5.2 ble lest uten avvik felt for felt (også `funnet`). Det kom ingen `-kopi` og ingen NaN.
  - 0.5.2 leser lagringen fra 0.5.4.
  - Ugyldig JSON, `v:2` og `[]` gir kopi. `null`, `"tekst"` og rare verdier gir 0 feil, ingen NaN og ingen feilkort.
- **U1:** Startkortet viser «Versjon 0.5.4», mål, oppdrag, styring og vei tilbake. Det er ingen sideveis rulling, og Start er synlig i alle fem størrelsene.
- **U2 og U3 (Q):** Styringshjelpen i pausen stemmer med tastene. Kraken-teksten er mild og vennlig.
- **T1 (emulert):** Alle synlige knapper er minst 44×44 px i alle fem størrelsene, også i Fiskeboka.
- **T2 (kjent avvik, nå rettet):** Feilen ble kastet med pause, kart eller Avslutt-spørsmålet åpent, og uten noe åpent. Etter Esc ble fokus på `feilLast` ved alle 5 Tab og 3 Shift+Tab. P åpner ikke pausen over feilkortet, og klikk på 📖 treffer feilkortet.
- **T3:** `prefers-reduced-motion` gir `animation:none` på Start. Viewport sperrer ikke zoom.
- **T4 (Q):** Uendret fra 0.5.2. Sjeldenhet og fremdrift vises også med tekst.
- **K1:** Det var 0 ufangede feil i alle økter. Den eneste 404 er `/favicon.ico` fra min nøytrale katalogside, ikke fra spillet.
- **K2:** Feilkortet vises over pause og kart og blir stående etter Esc. Tapt WebGL under spilling gir også feilkortet, med fokus på det.
- **K3:** 0.5.4 står i tittel, startkort og `VERSJON`. `ENDRINGSLOGG.md` har rader for 0.5.3 og 0.5.4, og de stemmer med det jeg målte. Lagringsformatet er uendret (`lagre()` er ikke endret).
- **S1:** CSP er uendret (`test/kjor.mjs` OK), og det er ingen nye domener. Det var 0 eksterne forespørsler fra spillet.
- **S2 og S3:** Ingen konto, chat, kjøp eller fritekst.
- **S4 (Q):** Ingen endring som berører personvernsiden.
- **ST1:** `statistikk.js` med `data-spill="fiskespillet"` ligger i `<head>`. `start-fiskespillet` kommer én gang, også når `evn-start` sendes en gang til, og ingen hendelse kommer før Start.
- **ST3:** Testmodusens `mappe` påvirker bare navnet på lagringsnøkkelen, ikke hendelsene.
- **ST5:** Bare godkjente navn ble sendt.
- **ST6:** Ingen informasjonskapsler.
- **B1:** Lyden slås av med L, og 🔇 vises etter omlasting.
- **B2:** Kartet åpnes med M, og båten står stille mens det er åpent.
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her», og Start er slått av. «Error creating WebGL context» kommer også i 0.5.2.
- **B4 (Q):** Kraken er valgfri og vennlig (krone og store øyne).
- **Y2 (delvis):** Pausen åpnes ved `blur` og skjult fane («Pause fordi du byttet fane eller app.»).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **B3/K2 – verifisert feil (ny, ikke kritisk):** Tapt WebGL på startkortet håndteres ikke.
  - Slik gjenskapes den: last siden, kjør `__spill.renderer.getContext().getExtension('WEBGL_lose_context').loseContext()` og trykk Start.
  - Resultat: hvit verden, HUD og «Havna» vises, og det kommer ikke noe feilkort.
  - Årsak: `if (spillTilstand === 'start' …) return` i `webglcontextlost`-lytteren.
  - Lagringen tapes ikke, og omlasting løser det.
- **ST2 – verifisert feil (kjent):** `spilletid-fiskespillet-01min` ble sendt etter 66 s med pausen åpen.
- **ST4 – verifisert feil (kjent):** En feil under spilling gir ingen `feil-fiskespillet-spill`.
- **ST7 – verifisert feil (kjent):** `versjon-fiskespillet-0.5.4` og feilhendelsene mangler. Den godkjente statistikken er ikke tatt inn.
- **B4/U3 – mulig problem (kjent, står fortsatt):** Tidsgrensen for Kraken (cirka 3 trykk/s i 60 s) må prøves av Even, og helst av en 7-åring, på ekte telefon.

## Anbefalte forbedringer
- **HUD 568×320 (verifisert):** En stor melding, for eksempel «🐙 Du fikk Kraken! …», dekker 📖-pillen med 79×38 px i opptil 3 s. Meldingen har `pointer-events:none`, så 📖 kan fortsatt trykkes. Regelen for 420 px tar bare stående format.
- **HUD 320×568 (verifisert):** Teksten «0 av 5000» går ut over kanten på 📖-pillen (`nowrap`). «Havna» og styringshjelpen overlapper med 14×48 px til hjelpen forsvinner etter 15 s. Det overlappet fantes også i 0.5.2.
- **Kraken-animasjonen (verifisert):** Siden `dt` er begrenset til 0,05, tar de 7 sekundene lengre tid når bildefrekvensen er under 20 bilder/s. Ved 3 bilder/s tok den 31,6 s, og styringen er låst hele tiden. Med fast tid ville den vart like lenge på svake mobiler. I skjermbildet står Kraken delvis oppå roboten. Even bør vurdere dette (V).
- **Testmodus (verifisert):** `#test` på evnstudio.no sender fortsatt `start-fiskespillet` som vanlig trafikk. Det er ikke brudd på ST3, men prosjektinstruksen sier at testtrafikk ikke skal telles.
- **T2-vakten** ligger i spillet. Kilden er `settInert(null)` i felles EVN-PAUSE, og den bør rettes der for alle spill.
- **Standardens oversikt:** Fiskespillet mangler fortsatt i oversikten over hvilke krav som gjelder per spill. Jeg har brukt B1–B4.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes ikke. Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging kontrollere. Milepælene etter 5, 15, 30 og 60 minutter er ikke testet.
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader med 3 bilder/s sier ingenting om ekte maskinvare.
- **Y2 – kun kodelest (delvis):** Båtfart ved 60/120 Hz og ekte fanebytte er ikke kjørt.
- **T1, T3, B1 og Kraken med trykk (E):** Ekte berøring på iPhone og Android, klypezoom og faktisk lyd er ikke testet. Emulert trykk viser ikke at knappene kan trykkes i praksis.
- **B3 (E):** Lavere grafikk på svake enheter og ekte tap av WebGL (her bare simulert) er ikke testet.
- **U2, U3 og B4 (V):** Om Kraken-animasjonen, lengden på den og tidsgrensen er morsom og forståelig, må Even teste.
- **B5–B7:** Gjelder ikke.
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for spillet.
- Lange økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil, og F1 er testet. Det kjente T2-avviket og de fleste funnene fra 1882d20 er rettet, og lagring fra 0.2.0–0.5.2 virker. Før publisering må statistikken (ST2, ST4, ST7) på plass. Tapt WebGL på startkortet bør håndteres, og Even må prøve Kraken-animasjonen og tidsgrensen på ekte enhet.

Skjermbildene ligger i `/tmp/qa-fisk054/`, blant annet `kraken-i-baaten-375.png`, `webgl-tapt-start.png` og `spill-50000+melding-568x320.png`. Testskriptene ligger i `/tmp/qa-fisk054/skript/`.
