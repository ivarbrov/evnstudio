# EVN Game QA: Fiskespillet 0.5.8
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 9e0d2c7b146973eee672f2a21ac274fd8d79e3c2
Testkvittering: evn1 commit=9e0d2c7b146973eee672f2a21ac274fd8d79e3c2 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels – Endringen er to linjer i hvordan Kraken plasseres og snus (`krakenTankPos()` og rotasjonen i tilstanden `tank`), pluss versjon og ENDRINGSLOGG. Diffen 9f68623..9e0d2c7 rører bare `spill/fiskespillet/index.html`, ENDRINGSLOGG og forrige QA-rapport. Felles kode, lagring, CSP, start og statistikk er ikke endret. Det er grensetilfelle mot liten, men jeg valgte middels fordi koden gjelder posisjon og tilstand og ikke bare tekst. `test/kjor.mjs` ga ingen FEIL og ingen VARSEL. Den eneste KJENT er Fossil Zoo T3, som ikke gjelder dette spillet.
Testet:
- **Server og testrot:** egen `python3 -m http.server` på 127.0.0.1:8795. Rota var `/tmp/qa-fisk058/root`, en `git archive` av 9e0d2c7.
- **Nettleser:** headless /usr/bin/google-chrome via Playwright med SwiftShader.
- **Størrelser:** 1280×800 med tastatur og mus. 375×812 og 740×360 med emulert berøring (`touchscreen.tap`) og DPR 2.
- **Skript:** Skriptene fra forrige kontroll ble kopiert til `/tmp/qa-fisk058/skript/` og kjørt på nytt mot den nye committen. Det nye skriptet `m58.mjs`/`m58b.mjs` måler Kraken i akvariet over 22 s (178–180 bilder): verdensboks for alle synlige mesher og vinkelen mellom Krakens +z (øynene) og retningen til HAVN.
- **Skjermbilder:** tatt med testkamera, der `renderer.render` ble overstyrt bare i testnettleseren.
- **Lagring:** localStorage ble tømt før og etter hver kjøring.
- **Opprydding:** serveren er stoppet (porten svarer ikke), ingen Playwright-Chrome kjører, og `git status` er tom.

## Oppfylte krav
- **Endring 2 (Kraken ser mot brygga): rettet.**
  - Vinkelen mellom blikket og retningen til havna var 3–26° over 22 s. Ved 0.5.7 så Kraken bort fra havna.
  - Skjermbildene fra brygga-siden viser ansikt og øyne, ikke bakhodet: `/tmp/qa-fisk058/v-tank-front-1280.png` og `/tmp/qa-fisk058/v-tank-lav-1280.png`.
- **Endring 1 (høyere i akvariet): delvis.**
  - Kraken ligger nå på y 3,4–10,8. Glasset går fra y 4 til 12, og toppen av sanden er på y 4,5.
  - Toppen er godt innenfor glasset, og x/z holder seg innenfor tanken (x −6,0..0,1 og z 9,05..15,0 mot −7,5..1,5 og 7,5..16,5).
  - Armene går fortsatt ned i sanden, se avvikene under.
- **Regresjon i Kraken-flyten (k57.mjs, 1280×800 og 375×812):**
  - `show` → `baat` tok 5,3–5,5 s. Laveste y etter hoppet var 0,91–1,00, altså over vannet.
  - Kortet viser «🏆 OPPDRAGET ER KLART! 🏆», og pengene går fra 500 til 10 500.
  - Kraken følger båten på plassen (0; 0,82; 1,95) i båtens ramme.
  - Armene stikker ikke ut av båten på noe båtnivå (0–3). Største overheng var 0,00.
  - Kraken flytter ikke inn mens pausen er åpen. Etter pausen går den `flytter` → `tank` og viser meldingen.
  - Etter omlasting er tilstanden `tank` og `kraken:true`.
- **Andre fangst og nullstilling (t57.mjs):**
  - Kortet sier «Du fanget Kraken igjen!», og pengene står stille på 777.
  - Ved innkjøring med ekte W-tastetrykk går Kraken `baat` → `flytter` → `tank`, og havna-dialogen virker.
  - «Start helt på nytt» gir `skjult`, `kraken:false` og 0 penger.
- **Vanlig fiske med Kraken i båten (n57.mjs):** lasten går fra 0 til 3 fisk, og Kraken blir i båten.
- **F1:** Testet ved 1280×800, 375×812 og 740×360, tre ganger hver. Start, kjøring med W (2,4–5,2 enheter), pause, kart, «Ja, avslutt» og tilbake til forsiden virker.
- **F2:** Lagringen overlever avslutning og ny lasting (2468 → 2468).
- **U1:** Ingen sideveis rulling, og Start er synlig i alle tre størrelsene.
- **K1:** Ingen sidefeil, konsollfeil, HTTP ≥ 400 eller eksterne forespørsler fra siden i noen økt. Proxy-loggen viste bare Chromes egne bakgrunnskall til Google, ikke kall fra siden.
- **K3 (versjon):** «0.5.8» står i tittelen, på startkortet og i `VERSJON`, og ENDRINGSLOGG har en ny rad.
- **S1:** Statisk kontroll er OK, og ingen nye domener er lagt til.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **K3 (innholdet i endringsloggen) – verifisert feil, ikke kritisk:**
  - Raden for 0.5.8 sier at Kraken «flyter litt høyere så armene ikke går ned i sanden». Målingen viser at det ikke stemmer.
  - I alle 178 bildene var laveste punkt under toppen av sanden (y 4,5). I 115 av dem (65 %) var det også under bunnen av glasset (y 4,0). Laveste verdi var 3,4, mot ca. 2,1 i 0.5.7.
  - Hevingen på 1,3 enheter er altså for liten til å holde armtuppene over sanden. Armene vifter ±0,28 rad og Kraken duver ±0,4.
  - Slik gjenskapes det: last en lagring med `kraken:true`, start spillet og kjør `/tmp/qa-fisk058/skript/m58b.mjs`.
  - Synlig sett ser armtuppene ut som de står i sanden (`v-tank-lav-1280.png`). Det er kosmetisk, men raden bør rettes, eller hevingen økes, avhengig av hva Even vil ha.
- **ST2, ST4 og ST7 – verifisert feil (kjent fra c65ab42, ikke rettet):** Statistikken er ikke rørt i diffen.
- **B4/U3 – mulig problem (kjent):** Tidsgrensen i Kraken-kampen må prøves på ekte telefon.
- **Fokus etter feiringskortet ved 375×812 – mulig problem, ikke fra denne diffen:** Med emulert berøring rapporterte skriptet at fokus sto på «🐙 Fang Kraken(E)» og ikke på kortets knapp. Ved 1280×800 sto fokus på «Så kult! 🎉». Den koden er ikke endret siden 9f68623. Det må undersøkes om dette bare kommer av emulert berøring, ved å sammenligne med samme skript på 9f68623 og med en ekte enhet.

## Anbefalte forbedringer
- **Armtuppene i sanden:** Øk hevingen til omtrent `KTANK.y + 3.8`. Laveste punkt ligger da rundt sandtoppen, mens toppen fortsatt er under taket (10,8 + 1,2 = 12,0, så det blir trangt). Et alternativ er å krølle armene litt i akvariet. La Even vurdere.
- **Står fortsatt fra forrige kontroll:**
  - Startkortet viser «Oppdrag: Fang Kraken!» etter at Kraken er fanget.
  - Kraken i båten lagres ikke før havna.
  - Shaderfeilen i bildet mellom `loseContext()` og hendelsen `webglcontextlost`.
  - HUD ved 568×320 og 320×568.
  - `#test` teller som vanlig trafikk.
  - T2-vakten bør flyttes til felles EVN-PAUSE.
  - Fiskespillet mangler i standardens oversikt.

## Kontroller som ikke kunne utføres
- **Y1 (E) og Y2:** Jeg har ikke ekte maskinvare. SwiftShader sier ingenting om en referansemobil.
- **T1, T3 og B1 (E):** Ekte berøring og lyd er ikke testet.
- **U2, U3 og B4 (V):** Even må se om Kraken nå ser riktig ut i akvariet: blikket mot brygga, høyden og armene i sanden.
- **B3 (E):** Ekte tap av WebGL er ikke testet. Koden er uendret.
- **F3:** Lagringer fra 0.2.0–0.5.2 er ikke kjørt på nytt. Lagringskoden er uendret.
- **ST1–ST8:** Ikke kjørt, fordi start, pause og statistikk ikke er rørt. `test/statistikk/` er ikke innført, og GoatCounter krever en voksen med innlogging.
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Kraken ser nå mot brygga, F1 og Kraken-flyten virker som før, og jeg fant ingen kritiske feil. Armtuppene går likevel fortsatt ned i sanden, i motsetning til det endringsloggen sier. ST2, ST4 og ST7 står fortsatt før publisering, og lyd, ekte berøring og ytelse på enhet er ikke testet.

Filer: skriptene ligger i `/tmp/qa-fisk058/skript/`. `m58.mjs` og `m58b.mjs` er nye og måler Kraken i akvariet. Hele utdataene fra `kjor.mjs` ligger i `/tmp/qa-fisk058-kjor.txt`, og skjermbildene i `/tmp/qa-fisk058/*.png`.
