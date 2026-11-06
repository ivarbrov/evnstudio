# EVN Game QA: Fiskespillet 0.9.1
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 0b78d980d8b745c445a91c3f595a9b7748513dda
Testkvittering: evn1 commit=0b78d980d8b745c445a91c3f595a9b7748513dda tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert som oppdatering av et publisert spill (0.6.1 → 0.9.1). Endringene fra 0.7.1 til 0.9.1 er ikke kontrollert før. `kjor.mjs` ga 73 OK, ingen FEIL, ingen VARSEL og 2 IKKE INNFØRT (statistikk og ui).
Testet:
- **Grunnlaget stemmer:**
  - `git diff origin/main...HEAD` inneholder bare spillfila, ENDRINGSLOGG og én QA-rapport.
  - `statistikk.js` og `test/` er like som på main.
  - Spillfila er byte for byte lik ef77bf4.
- **Server:** egen `python3 -m http.server` på 127.0.0.1:8831, med rot i `/tmp/qa-fisk091/root` (`git archive HEAD`). For regresjon og lagring lå 0.6.1 (`origin/main`) og 0.7.0 (3fbb9bb) under egne mapper på samme adresse.
- **Nettleser:** headless Chrome via Playwright med SwiftShader, omtrent 6 bilder/s. Spilltiden går derfor omtrent 3 ganger saktere enn ekte tid.
- **1280×800:** ekte tastetrykk (W, S, Shift, T, G, E, mellomrom, L, P, M, Esc, Tab og Enter) og ekte musklikk.
- **375×812, 740×360, 320×568 og 568×320:** emulert berøring (`touchscreen.tap`), styrespaken med CDP-berøring og DPR 2.
- **Hjelpemidler:** Posisjonen til båten eller roboten ble satt med `__spill` for å komme raskt til et sted. Deretter ble det gått eller kjørt med ekte taster. Torsdag-eventet er tvunget med `eventTvang`, fordi klokka var fredag kl. 07.39.
- **Opprydding:** Hver økt hadde egen nettleserprofil, og localStorage ble tømt før og etter. Serveren er stoppet (porten svarer ikke), og `git status` er tom.
- **Skript og skjermbilder:** skriptene ligger i `/tmp/qa-fisk091/skript/`, og skjermbildene i `/tmp/qa-fisk091/bilder/`.

## Oppfylte krav
- **F1:**
  - Spillet starter med ekte klikk.
  - Båten kjører med W.
  - Vanlig fiske på fiskestedet virker («Grønn makrell»), og et stort dyr kan fiskes («Liten grønn hai med prikker»).
  - Kraken-kampen er vunnet med ekte E: premien er 10 000, Kraken hopper opp i båten, og fangstkortet vises. Etter innkjøring i havna står Kraken i Kraken-akvariet på (−3; 5,8; 40), og det er riktig plass. Etter omlasting står den der fortsatt.
  - P pauser, og verken båten eller roboten flytter seg i pause. Esc fortsetter.
  - Avslutt: Esc lukker dialogen, og «Ja, avslutt» går til forsiden. Lagringen beholdes.
  - Spillet henger aldri i noen av kjøringene.
- **F2:**
  - Det lagres automatisk etter omtrent 5 s spilltid, og lagringen overlever omlasting.
  - Nullstilling: Esc og Nei beholder lagringen, og Ja sletter den. For en ny spiller vises ikke «Start helt på nytt».
- **F3:**
  - Lagring fra 0.6.1 og 0.7.0 leses i 0.9.1 uten endring og uten `-kopi`. Det gjelder penger, venner, Kraken, stang, agn, båt, plass, last, akvarium og fanget.
  - Nøklene er de samme i alle versjonene.
  - En 0.9.1-lagring leses uten feil i både 0.6.1 og 0.7.0, så det går an å rulle tilbake.
  - Ugyldig JSON, `v:2`, `[]`, `null` og felt med søppelverdier gir startverdier eller rensede verdier. Spillet starter uten sidefeil.
  - Omlasting mens roboten er på land gir start i båten, og ingenting går tapt.
- **U1:**
  - Startkortet viser mål, styring for PC og berøring, «Versjon 0.9.1» og «← Tilbake».
  - Teksten om havna, land og turbo er med.
  - Se også avviket om Start under.
- **U3:** Tekstene er korte og vennlige. Kampen mot Kraken sier «Prøv igjen» når du taper.
- **T1 (emulert):** Alle synlige knapper er minst 44×44 px, og det er minst 8 px mellom dem. Det gjelder i fem størrelser og i tilstandene havna, land, butikken, sjø, event og kamp.
- **T2:**
  - Tab går gjennom 📖, 🔊, kart, pause, Avslutt, handlingsknappen og 🚶 Gå i land.
  - Pausekortet holder fokus. Kjent funn T2 ser dermed ut til å være rettet i dette spillet.
  - Når butikkortet åpnes fra land, holder det fokus (25 av 25 Tab).
  - Fokus går til «Nei, spill videre» i Avslutt-dialogen.
- **T3:** Viewport sperrer ikke zoom (`kjor.mjs`).
- **K1:** Ingen sidefeil, konsollfeil, HTTP-svar på 400 eller høyere eller eksterne forespørsler i noen kjøring.
- **K2:** En feil som kastes under spill, viser feilkortet. Det er testet som på evnstudio.no.
- **K3:** «0.9.1» står i tittelen, på startkortet og i `VERSJON`. Endringsloggen har rader for 0.7.0–0.9.1. Se også det mulige problemet under.
- **S1:** CSP er uendret fra 0.6.1, og den statiske kontrollen er OK. Det er ingen nye domener.
- **S2 og S3:** Det er ingen nye data, ingen fritekst og ingen kjøp med ekte penger.
- **S4:** Personvernsiden stemmer fortsatt: data lagres bare i localStorage, og det brukes ingen informasjonskapsler.
- **ST3, ST5 og ST6:**
  - Lokalt sendes ingenting.
  - Som på evnstudio.no (avskjærte forespørsler og en stubb for `count.js`) ble det bare sendt én sidevisning, ingen ukjente hendelser.
  - `document.cookie` er tom, og det finnes ingen ID-er.
- **B1:** L slår av lyden. Valget lagres i `evn-fiskespillet-lyd` og huskes etter ny lasting (🔇).
- **B2:**
  - Kartet åpnes med M, og spillet står stille mens det er åpent.
  - Forklaringen har 🦈 Hai og 🐋 Hval.
- **B4:** Kraken-kampen er snill: du får «Prøv igjen», og ingenting går tapt.
- **Rettinger etter 3fbb9bb:**
  - «🎉 Torsdag!» har `display:none` utenfor eventet og `flex` når eventet er tvunget, i alle fem størrelser.
  - 🚀 er skjult under kampen.
  - Turbo-knappen overlapper ikke kampfeltet.
- **Landmodus:**
  - 🚶 Gå i land, med trykk eller G, virker bare i havna.
  - T og fiske virker ikke på land.
  - Handlingsknappen viser 🛒 Butikken, 🐠 Akvariet og ⛵ Gå om bord. Butikk-fanen og akvarie-fanen åpnes riktig.
  - G langt fra kaia gjør ingenting.
  - Styrespaken flytter roboten 7,7–13 enheter på 6 s i alle fire mobilstørrelser.
  - **Vannkanten:**
    - I 11 retninger stoppet roboten 75,6–77,4 fra sentrum, med y 0,67–0,78.
    - Fra siden av brygga stoppet den ved x −3,2.
    - Ytterst på brygga stoppet den ved z 98.
    - Den gikk aldri i vannet.
  - **Vegger:** Roboten stopper mot butikkveggen (z 56,7), akvarieglasset (x −9,4), Kraken-akvariet (z 45,4), fyrtårnet og palmene.
  - **Fast:** Det ble kjørt 120 tilfeldige vandringer fra 20 startpunkter. Roboten satte seg aldri fast fra et gyldig punkt. De 6 «faste» forsøkene startet med vilje inni en palme, noe som ikke kan skje i vanlig spill.
- **Hjelpeprikkene med den nye øya:**
  - Fra 14 steder, blant annet nord for øya, Dyphavet og Kraken, kom ingen prikk nærmere sentrum enn 90,2. Øya går ut til 78.
  - Prikkene ender 1–9 fra havna. Fra Dyphavet ender de etter 60 prikker, slik det er kodet.
- **Fiskebåten:**
  - Den kommer etter salg når havna lukkes. Fasene var inn (16 s), laster (9 s) og ut (20 s), ekte tid.
  - Den kommer ikke når havna lukkes uten salg.
  - Ruta går klar av øya (92) og brygga (0,85 klaring). Mot skjæret ved (60, 150) er klaringen 0,45, regnet ut.
- **HUD-overlapp:** Ingen overlapp mellom knapper og statuspiller i noen av de fem størrelsene. Meldingen overlapper knapper, se under.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **U2, startmeldingen overskrives (verifisert feil, ny i 0.9.1):**
  - Båten starter i havna (`spiller.pos` = HAVN + 8). I første bilde etter Start erstatter `havnaHjelp()` derfor meldingen «Kjør ut på havet og trykk på 🎣 Fisk! … Oppdrag: Fang Kraken 🐙», og den vises aldri. Det samme skjer med «Velkommen tilbake».
  - En ny spiller med tom båt får i stedet beskjed om å «selge fisken».
  - Gjenskaping: tøm lagringen, trykk Start og les `#melding`. Gjelder både 1280×800 og mobil. Se `bilder/A-havna-*.png`.
- **U1, Start er ikke synlig uten rulling på små skjermer (verifisert regresjon):**

  | Størrelse | Start i 0.9.1 | Start i 0.6.1 |
  |---|---|---|
  | 320×568 | 564–636 av 568 px | 388–456 |
  | 568×320 | 316–388 av 320 px | 243–313 |
  | 740×360 | 316–388 av 360 px | – |

  - Årsaken er den nye teksten om havna og land på startkortet.
  - Kortet kan rulles med berøring (testet med CDP-dra, `scrollTop` 139), og da virker knappen. Men ved 320×568 og 568×320 ser barnet bare 2–4 px av Start.
  - Se `bilder/start-320x568.png` og `bilder/start-740x360.png`.
- **K3, endringsloggen (mulig problem):** Raden for publisering sier «godkjent av Ivar 6.11.2026 etter full QA». Raden ble skrevet før denne kontrollen. En voksen må bekrefte at teksten stemmer før sammenslåing.
- **ST1, ST2, ST4, ST7 og ST8, kjent forbehold (uendret):** `statistikk.js` på main har ingen oppdager for Fiskespillet.
  - Som på evnstudio.no ble bare sidevisningen sendt.
  - Det ble ikke sendt `start-`, `versjon-` eller `spilletid-`, verken etter 70 s spill eller etter en kastet feil.
  - Dette er samme forbehold som for 0.6.1. Endringsloggen sier at Ivar har godkjent det.

## Anbefalte forbedringer
- **Roboten går gjennom pynt (verifisert):**
  - Den går gjennom de fire lyktestolpene, for eksempel z 41 → 44,8 forbi stolpen i (9, 44).
  - Den går gjennom tønnene og fiskekassene foran butikken. Den står inni kassene i `bilder/gjennom-fiskekasser.png`.
  - Ved akvarieglasset går den omtrent 0,2 inn i kanten.
  - Ingen av objektene ligger i `LAND_HINDRE`.
- **Hjelpemeldingen i havna:**
  - Starten teller som én av de «tre første gangene», og det gjør hver gang du kommer tilbake fra land også. Hjelpen er derfor brukt opp etter ett besøk på land.
  - Den overskriver også «⛵ Du er om bord igjen».
  - Telleren nullstilles ved hver sidelasting.
- **Den store hjelpemeldingen dekker 🚶 Gå i land ved 320×568 (1744 px²) og 568×320 (1311 px²):**
  - Det er knappen meldingen forklarer.
  - Trykket virker likevel, fordi meldingen har `pointer-events:none`.
  - Under eventet dekker meldingen 📖 ved 320×568 (595 px²). Dette er det kjente funnet, og det gjelder nå bare under eventet.
- **Ytelse (`renderer.info`, 1280×800, samme kameraplasser):**

  | Sted | 0.6.1 kall / trekanter | 0.9.1 kall / trekanter |
  |---|---|---|
  | Kystvann | 360 / 73 001 | 382 / 122 535 |
  | Dyphavet | 392 / 67 623 | 604 / 136 953 |
  | På land ved kaia | – | 514 / 138 571 |
  | Geometrier i minnet | 80 | 247 |

  - Omtrent 57 800 av de ekstra trekantene kommer fra terrenget på øya (`PlaneGeometry` 170×170), og de tegnes alltid.
  - Færre ledd i terrenget og sammenslåtte palmer og hus vil gi den største gevinsten.
- **Kartet:** På land viser 🔺 båten, ikke roboten.
- **Fiskebåten:** Ved startretningen i havna ser kameraet ut mot havet, så du ser lite av fiskebåten. Spillerens båt kan kjøre gjennom fiskebåten, for den er ikke et hinder.
- **Fra før:**
  - Ødelagt lagring med `stang:99` gir Superstang, fordi verdien klemmes til maks. Det er uendret fra 0.6.1.
  - Fiskespillet mangler fortsatt i standardens oversikt per spill. Jeg har brukt B1–B4.
  - Økonomifunnene fra 3fbb9bb er ikke målt på nytt.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt. SwiftShader sier ingenting om ekte mobil. Tallene fra `renderer.info` over er ikke en måling av bildefrekvens.
- **Y2:** Blur pauser spillet (testet). 60 og 120 Hz er ikke målt. Bevegelsen på land bruker `dt` (kodelest).
- **T1, T3, B1 og B3 (E):** Ekte berøring, klypezoom, lyd og B3 på svake enheter er ikke testet. Styrespaken er bare emulert. Tapt WebGL-kontekst er ikke kjørt på nytt (koden er uendret).
- **T4:** Ikke kontrollert på nytt. Turbo vises fortsatt bare med farge.
- **U2, U3 og B4 (V):** Even må vurdere om landmodus, hjelpemeldingene og fiskebåten er forståelige og morsomme.
- **ST1, ST2, ST4, ST7 og ST8:** `test/statistikk/` finnes ikke (IKKE INNFØRT). Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging sjekke.
- **Torsdag-eventet med ekte klokke:** Ikke testet, fordi klokka viste fredag. Det er testet med `eventTvang`.
- **Lange økter (15–60 min) og at de store dyrene kommer tilbake etter 2,5–4 min:** Ikke kjørt.
- **B5, B6 og B7:** Gjelder ikke spillet (ingen læringsfakta, ingen app-installasjon, ingen fritekst).
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for spillet. UI8a–c er ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. F1–F3 virker, også med lagring fra 0.6.1 og 0.7.0, og landmodus holder roboten på øya uten at den setter seg fast. Før publisering bør startmeldingen som blir overskrevet og den skjulte Start-knappen på små skjermer rettes. Ytelsen på ekte mobil (Y1) er ikke testet, og antall trekanter er omtrent doblet.
