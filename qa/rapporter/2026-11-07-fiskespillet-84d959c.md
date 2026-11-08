# EVN Game QA: Fiskespillet 0.9.2
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 84d959cd56d7480819b126b6dc6ae2885c138281
Testkvittering: evn1 commit=84d959cd56d7480819b126b6dc6ae2885c138281 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om fullt nivå, og endringen er i felles kode (`statistikk.js`), noe som gir minst høyt nivå. `kjor.mjs`: 73 OK, 0 FEIL, 0 VARSEL, 2 IKKE INNFØRT (statistikk, ui), kjørt tre ganger: første kjøring ble fullført med samme resultat, men kvitteringslinja ble kuttet bort i utskriften; andre nådde grensen på 15 minutter fordi maskinen var svært belastet (load 18 på 2 kjerner) av kontrollene som kjørte samtidig; kvitteringen er fra tredje kjøring. Endring mot origin/main (43aa7b9): bare `statistikk.js`, med 7 nye linjer; `spill/` er byte-likt med main (`git diff --stat` er tom). Bare Fiskespillet sender `evn-start` (grep i `spill/` og `prototype/`), så de andre spillene får ingen ny oppførsel.
Testet: Egen `python3 -m http.server` på 127.0.0.1:8941 med rot `/tmp/qa-fisk-84d/root` (laget med `git archive 84d959c`); 0.6.2 (6c64cf8) i `/tmp/qa-fisk-84d/v062`. Playwright Chromium headless med SwiftShader (svært lav bildefrekvens på grunn av lasten). 1280×800 med ekte tastetrykk (W, P, M, L, E, Esc, Tab) og ekte musklikk på koordinater (startknappen pulserer, så Playwright regner den ikke som stabil nok til `click()`). Mobil 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`touchscreen.tap`). Statistikk: evnstudio.no etterlignet med `route`, filene servert fra testroten, `gc.zgo.at/count.js` byttet ut med en stubb som registrerer `goatcounter.count`, `evnstudio.goatcounter.com` avbrutt; ingenting sendt til GoatCounter. `__spill` brukt til å flytte båten til en fiskeplass og sette penger. Ny nettleserkontekst per kjøring, localStorage tømt før og etter; serveren er stoppet (porten svarer 000), og `git status` er tom. Skript: `/tmp/qa-fisk-84d/skript/`.

## Oppfylte krav
- ST1 (ny oppførsel, sjekket i kjøring): Som på evnstudio.no kom bare sidevisningen før Start. Etter ekte klikk på Start kom `start-fiskespillet` én gang. To ekstra `evn-start` etterpå ga ingen ny start (ingen dobbel telling). `statistikk.js` med `data-spill="fiskespillet"` står i `<head>` (`defer`). ST1 er likevel ikke helt oppfylt, se ST7 under.
- ST3: Lokalt er `goatcounter` udefinert, og det gikk 0 forespørsler til eksterne domener. I koden kommer `return` før all telling når vertsnavnet ikke er evnstudio.no.
- ST6: `document.cookie` er tom. Koden har ingen ID-er eller lagring.
- F1: Start med ekte klikk. W flytter båten (115,0 → 117,1). Ett E-trykk ved en fiskeplass ga fasene kast, vent og napp, og en fisk havnet i lasten (88 s ved lav bildefrekvens). P pauser, og W flytter båten 0,00 i pause; Esc fortsetter. M åpner kartet, og båten står stille mens kartet er åpent. Avslutt, Esc og «Ja, avslutt» går til forsiden, og lagringen beholdes (under lasten tok navigeringen 15–29 s, også med direkte `location.href` uten spilling; regnet som testartefakt).
- F2: Penger (4321) og fisk i lasten er der etter omlasting og `pagehide`. «Start helt på nytt» vises ikke for en ny spiller. Esc og Nei beholder lagringen, og Ja sletter den.
- F3: Lagring fra 0.6.2 (777 penger) leses i 0.9.2 uten tap og uten `-kopi`. Ugyldig JSON, `v:2` og `[]` gir startverdier, og det lages `-kopi`. `null`, `"tekst"` og søppelverdier gir startverdier. Ingen av disse gir feilkort eller sidefeil.
- U1: Startkortet viser «Versjon 0.9.2». Start er synlig uten rulling i alle fire mobilstørrelsene, og det er ingen sideveis rulling (scrollWidth = bredden).
- T1 (emulert): Ingen synlige knapper under 44×44 px under spilling i de fire mobilstørrelsene.
- T2: Tab i pausen går i ring gjennom Styring, Avslutt, E-coins og Fortsett (12 av 12 inne i pausekortet). Avslutt-dialogen gir fokus til `evnBli`, og Esc lukker den.
- K1: `kjor.mjs` er OK. Ingen sidefeil, konsollfeil eller svar på 400 eller høyere i noen av kjøringene.
- K2: En kastet feil under spilling viser feilkortet («Last på nytt»).
- K3: «0.9.2» står i tittel og startkort. ENDRINGSLOGG har raden for 0.9.2. Endringen i `statistikk.js` er ikke ført i ENDRINGSLOGG, se Anbefalte forbedringer.
- S1: `kjor.mjs` er OK. CSP-domenene er bare `gc.zgo.at` og `evnstudio.goatcounter.com`, altså ingen nye.
- S2, S3: Ingen konto, chat, fritekst eller kjøp med ekte penger.
- S4: Personvernsiden nevner spillstarter og spilletid og sier at «Spilletiden … kan også telle pauser». Det stemmer med det som skjer.
- B1: L slår av lyden, og 🔇 huskes etter omlasting (`evn-fiskespillet-lyd=av`).
- B2: Kartet åpnes med M og lukkes med Esc. Spillet står stille mens kartet er åpent.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- ST2, verifisert feil (kjent fra før, men kommer nå til syne i produksjon): Gjenskapes ved å lage et miljø som evnstudio.no, trykke Start, trykke P straks og vente 67 s med pausekortet åpent; da sendes `spilletid-fiskespillet-01min`. Tidtakingen bruker `visibilityState`, ikke `window.EVNAktivTid`. Spillet har EVN-PAUSE v2, som ikke har `EVNAktivTid`. Før denne commiten sendte Fiskespillet ingen start- eller spilletidshendelser på evnstudio.no; nå sendes de, og spilletiden teller også pause og kart. Forbeholdet går dermed fra «ingen data» til «data som også teller pause». Personvernsiden sier det samme.
- ST4, verifisert feil (kjent, uendret): En kastet feil under spilling gir feilkortet, men ingen `feil-fiskespillet-spill`.
- ST7, verifisert feil (kjent, uendret): `versjon-fiskespillet-0.9.2` sendes ikke. Feilhendelser og aktiv tid mangler også, så statistikken er fortsatt ikke den godkjente ST1–ST8. Commiten retter den delen av det kjente forbeholdet som gjelder `start-`. Forbeholdet ble godkjent av Ivar for 0.6.x og 0.9.2, ifølge ENDRINGSLOGG.

## Anbefalte forbedringer
- ENDRINGSLOGG: Endringen i `statistikk.js` har ingen rad. Det bør stå en, fordi `start-fiskespillet` og `spilletid-fiskespillet-*` nå kommer for første gang i GoatCounter, og fordi spilletiden også teller pauser.
- Kjent fra før, uendret (ikke kjørt på nytt her): meldinger ligger over knapper på lave skjermer; Turbo vises bare med farge; roboten går gjennom noen gjenstander på land; kartet viser båten når roboten er på land; løpeanimasjonen brukes ikke; `stang:99` gir Superstang (sett på nytt her: stang 3).
- Standarden: Fiskespillet mangler fortsatt i oversikten per spill. Jeg har brukt B1–B4. Oversikten nevner også `spill/fossilspillet` og `spill/magiske-egg`, som ikke finnes på denne commiten.

## Kontroller som ikke kunne utføres
- ST5 og ST8: `test/statistikk/` finnes verken her eller på origin/main (IKKE INNFØRT). Hendelsesnavnene er bare sjekket med stubben: bare godkjente navn kom, hvert én gang. Milepælene 5, 15, 30 og 60 min er ikke kjørt. Om hendelsene faktisk kommer frem i GoatCounter, må en voksen med innlogging sjekke etter publisering.
- Y1 (E): Referansemobil er ikke valgt. SwiftShader på en maskin med høy last sier ingenting om ytelsen.
- Y2: 60 og 120 Hz er ikke målt. Fanebytte er ikke testet i denne kontrollen. Farten var lav og varierte med lasten (0,3–2,1 enheter på 4 s) og kan ikke vurderes her.
- T1, T3 og B1 (E): Ekte berøring, klypezoom og ekte lyd er ikke testet. `prefers-reduced-motion` er bare kodelest. At zoom ikke er sperret, er sjekket av `kjor.mjs`.
- T4: Kontrasten er ikke målt.
- B3 (E): Tapt WebGL-kontekst og svake enheter er bare kodelest (`webglcontextlost` er håndtert).
- B4 (Q, V): Kraken-kampen er ikke kjørt i denne kontrollen. Koden er byte-lik med 22ac8c5.
- U2, U3 (V): Even må vurdere om hjelpen og tekstene er forståelige. Jeg kjørte bare startbeskjeden og fiske-handlingen («🎣 Fisk(E)»).
- Ikke kjørt i denne kontrollen: gå på land og Kraken, butikk og akvarium, torsdag-eventet og lange økter.
- B5, B6 og B7: Gjelder ikke spillet.
- UI1–UI10 (UI8a–c inkludert): Godkjent hovedløsning, men ikke tatt i bruk for spillet. Ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 virker på 84d959c, og jeg fant ingen kritiske feil. Endringen gjør at `start-fiskespillet` telles én gang, uten dobbel telling. Statistikken er fortsatt ikke den godkjente (spilletid i pause, ingen `versjon-` og ingen `feil-`), og Y1, ekte berøring og `test/statistikk/` er ikke testet.
