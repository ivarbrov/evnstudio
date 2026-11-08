# EVN Game QA: Fiskespillet 0.9.3
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c95b3aa1ef934bd26cd472493bd82da54a5921d2
Testkvittering: evn1 commit=c95b3aa1ef934bd26cd472493bd82da54a5921d2 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om fullt nivå, og PR #53 endrer felles kode (`statistikk.js`). `kjor.mjs` ga 73 OK, 0 FEIL, 0 VARSEL og 2 IKKE INNFØRT (statistikk og ui); alle 13 radene for Fiskespillet er OK. Siden 84d959c er `spill/fiskespillet/index.html` endret bare i versjonen (0.9.2 → 0.9.3 i `<title>`, startkort og `VERSJON`), uten rester av 0.9.2; ENDRINGSLOGG har fått én ny rad, og fire QA-rapporter er lagt til. De tre andre spillene har bare fått nytt versjonsnummer. `statistikk.js` og `test/` er uendret. Mot origin/main lytter `statistikk.js` nå på `evn-start` (7 linjer). Alle kontrollene under er kjørt på nytt mot c95b3aa; ingen resultater er overført fra 84d959c.
Testet: Egen `python3 -m http.server` på 127.0.0.1:8941, rot `/tmp/qa-fisk-c95/root` laget med `git archive c95b3aa`; 0.6.2 (6c64cf8) i egen mappe. Playwright Chromium headless med SwiftShader (lav last denne gangen). 1280×800 med ekte tastetrykk (W, P, M, L, E, G, Esc, Tab) og ekte musklikk på koordinater. Mobil 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`touchscreen.tap`). Statistikk: evnstudio.no etterlignet med `route`, `gc.zgo.at/count.js` byttet ut med en stubb som registrerer `goatcounter.count`; ingenting sendt til GoatCounter. `__spill` brukt til å flytte båten (fiskeplass og havn) og sette penger. Lagringen til F3 ble lagt inn fra `/personvern/` på samme opphav, så spillets `pagehide` ikke skrev over den. Ny nettleserkontekst per kjøring, localStorage tømt før og etter; serveren er stoppet (porten svarer 000), andre prosesser er ikke rørt, og `git status` er tom. Skript: `/tmp/qa-fisk-c95/skript/`.

## Oppfylte krav
- F1: Start med ekte klikk. W flytter båten (115,0 → 118,0 på 4 s). Ett E-trykk ved en fiskeplass ga fasene kast, vent og napp, og en fisk havnet i lasten på 26 s. P pauser, og båten flytter seg 0,00 i pause; Esc fortsetter. Avslutt, Esc og «Ja, avslutt» går til forsiden, og lagringen beholdes. Land: G i havna gir land, W flytter roboten 2,3 enheter, og `gaaOmBord` setter roboten tilbake i båten.
- F2: Penger (4321), fisk i lasten og lydvalget er der etter omlasting. «Start helt på nytt» vises ikke for en ny spiller. Esc og Nei beholder lagringen, og Ja sletter den.
- F3: Lagring fra 0.6.2 (777 penger) leses i 0.9.3 uten tap og uten `-kopi`. Ugyldig JSON, `v:2` og `[]` gir startverdier, og det lages `-kopi`. `null`, `"tekst"` og søppelverdier gir startverdier. Ingen av disse gir feilkort eller sidefeil.
- U1: Startkortet viser «Versjon 0.9.3». Start er synlig uten rulling i alle fire mobilstørrelsene, og det er ingen sideveis rulling.
- U2 (Q): «🎣 Fisk(E)» vises ved fiskeplassen, og styringshjelpen finnes i pausekortet.
- U3 (Q): Tekstene som ble vist, er korte og vennlige, og fisket har ingen straff.
- T1 (emulert): Ingen synlige knapper under 44×44 px under spilling i de fire mobilstørrelsene.
- T2: Tab i pausen går i ring gjennom Styring, Avslutt, E-coins og Fortsett (12 av 12 inne i pausekortet). Avslutt-dialogen gir fokus til `evnBli`, og Esc lukker den.
- Y2 (delvis): Blur åpner pausen.
- K1: `kjor.mjs` er OK. Ingen sidefeil, konsollfeil eller svar på 400 eller høyere i noen av kjøringene.
- K2: En kastet feil under spilling viser feilkortet.
- K3: 0.9.3 står i tittel, startkort og `VERSJON`. ENDRINGSLOGG har en rad for endringen i `statistikk.js` og den nye versjonen. Raden stemmer med koden og med det som ble målt: start telles én gang, og ST2, ST4 og ST7 står som kjente avvik.
- S1: `kjor.mjs` er OK. CSP-domenene er bare `gc.zgo.at` og `evnstudio.goatcounter.com`, altså ingen nye.
- S2, S3: Ingen konto, chat, fritekst eller kjøp med ekte penger.
- S4: Personvernsiden nevner spillstarter og spilletid og sier at spilletiden «kan også telle pauser». Det stemmer med det som skjer.
- ST3: Lokalt er `goatcounter` udefinert, og det gikk 0 eksterne forespørsler.
- ST6: `document.cookie` er tom, og koden har ingen ID-er.
- B1: L gir `evn-fiskespillet-lyd=av`, og 🔇 huskes etter omlasting.
- B2: Kartet åpnes med M, også på land, og lukkes med Esc. Båten står stille mens kartet er åpent.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- ST1, delvis oppfylt: Som på evnstudio.no kom bare sidevisningen før Start. Etter klikk på Start kom `start-fiskespillet` én gang, og to ekstra `evn-start` ga ingen ny start. `statistikk.js` med `data-spill` står i `<head>`. Mangelen er `versjon-`, som er beskrevet under ST7.
- ST2, verifisert feil (kjent, står i ENDRINGSLOGG): Gjenskapes ved å lage et miljø som evnstudio.no, trykke Start, trykke P og vente 67 s med pausen åpen; da sendes `spilletid-fiskespillet-01min`. Tidtakingen bruker `visibilityState`, ikke `EVNAktivTid`. Spillet har EVN-PAUSE v2.
- ST4, verifisert feil (kjent): En kastet feil gir feilkortet, men ingen `feil-fiskespillet-spill`.
- ST7, verifisert feil (kjent): `versjon-fiskespillet-0.9.3` sendes ikke. Feilhendelser og aktiv tid mangler også.
- Alle tre avvikene er dokumentert i ENDRINGSLOGG. Ingen av dem er blitt verre siden 84d959c.

## Anbefalte forbedringer
- Kjent fra før, ikke kjørt på nytt: meldinger ligger over knapper på lave skjermer; Turbo vises bare med farge; roboten går gjennom noen gjenstander på land; kartet viser båten når roboten er på land; løpeanimasjonen brukes ikke.
- Sett på nytt: `stang:99` gir Superstang (stang 3).
- Standarden: Fiskespillet mangler i oversikten per spill (jeg har brukt B1–B4). Oversikten nevner `spill/fossilspillet` og `spill/magiske-egg`, som ikke finnes på commiten.

## Kontroller som ikke kunne utføres
- ST5 og ST8: `test/statistikk/` finnes ikke (IKKE INNFØRT). Med stubben kom bare godkjente navn, hvert én gang. Milepælene 5, 15, 30 og 60 min er ikke kjørt. Om hendelsene kommer frem i GoatCounter, må en voksen med innlogging sjekke etter publisering.
- Y1 (E): Referansemobil er ikke valgt, og SwiftShader sier ingenting om ekte mobil.
- Y2: Fanebytte med ekte skjult fane og 60 og 120 Hz er ikke målt.
- T1, T3 og B1 (E): Ekte berøring, klypezoom og ekte lyd er ikke testet. At zoom ikke er sperret, er sjekket av `kjor.mjs`. `prefers-reduced-motion` er bare kodelest.
- T4: Kontrasten er ikke målt.
- B3 (E): Tapt WebGL-kontekst og svake enheter er bare kodelest.
- B4 (Q, V): Kraken-kampen er ikke kjørt i denne kontrollen.
- U2, U3 (V): Even må vurdere om spillet er forståelig og morsomt.
- Ikke kjørt: butikk og akvarium, torsdag-eventet, fiskebåten og lange økter.
- B5, B6 og B7: Gjelder ikke spillet.
- UI1–UI10 (UI8a–c inkludert): Godkjent hovedløsning, men ikke tatt i bruk for spillet. Ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 virker på c95b3aa. `start-fiskespillet` telles nå én gang uten dobbel telling, og jeg fant ingen kritiske feil. ST2, ST4 og ST7 er fortsatt kjente avvik, og Y1, ekte berøring og `test/statistikk/` er ikke testet.
