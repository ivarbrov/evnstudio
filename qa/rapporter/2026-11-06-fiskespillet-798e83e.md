# EVN Game QA: Fiskespillet 0.9.2
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 798e83e24350f594b77004d49a91aa147c1fc865
Testkvittering: evn1 commit=798e83e24350f594b77004d49a91aa147c1fc865 tester=38fef252df52 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert som oppdatering av publisert 0.6.1. `kjor.mjs` ga 73 OK, 0 FEIL, 0 VARSEL og 2 IKKE INNFØRT (statistikk og ui). Siden 0b78d98 er bare startkortets CSS og tekst, `varIHavna` ved Start og «Gå om bord», versjonen og ENDRINGSLOGG endret (`git diff 0b78d98 798e83e`). Alle kontroller under er kjørt på nytt mot 798e83e.
Testet:
- **Server:** egen `python3 -m http.server` på 127.0.0.1:8832, med rot `/tmp/qa-fisk092/root` (`git archive HEAD`). Til sammenligning lå 0.6.1 (origin/main), 0.7.0 (3fbb9bb) og 0.9.1 (0b78d98) i egne mapper.
- **Nettleser:** headless Chrome via Playwright med SwiftShader. Bildefrekvensen er lav, så spilltiden går omtrent 3 ganger saktere enn ekte tid.
- **1280×800:** ekte tastetrykk (W, G, E, T, Shift, P, M, L, Esc, Tab, Enter) og ekte musklikk.
- **Mobil:** 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`touchscreen.tap`, styrespaken med CDP, DPR 2). Startkortet er i tillegg målt i 844×390 og 667×375.
- **Meldinger:** logget med en MutationObserver på `#melding`.
- **Hjelpemidler:** `__spill` ble brukt til å flytte båten eller roboten. Kjøring og gange ble deretter gjort med ekte taster. Torsdag-eventet ble tvunget i mobilskriptet.
- **Opprydding:** localStorage ble tømt før og etter hver økt. Serveren er stoppet (porten svarer ikke), og `git status` er tom.
- **Skript og skjermbilder:** `/tmp/qa-fisk092/skript/` og `/tmp/qa-fisk092/bilder/`.

## Oppfylte krav
- **F1:**
  - Start med ekte klikk.
  - Kjøring med W.
  - Vanlig fiske («Lilla flyndre») og stort dyr («Rosa hai med striper»).
  - Kraken vunnet: premien er 10 000, fangstkortet vises, og Kraken flyttes til akvariet (−3; 5,8; 40). Den står der fortsatt etter omlasting.
  - P pauser, og roboten flytter seg 0,00 i pause. Esc fortsetter.
  - «Ja, avslutt» går til forsiden, og lagringen beholdes.
  - Spillet hang ikke i noen kjøring.
- **F2:**
  - Det lagres automatisk, og lagringen overlever omlasting.
  - Nullstilling: Esc og Nei beholder lagringen, og Ja sletter den. Ny spiller ser ikke «Start helt på nytt».
- **F3:**
  - Lagring fra 0.6.1 og 0.7.0 leses i 0.9.2 uten tap og uten `-kopi`. Nøklene er de samme.
  - En 0.9.2-lagring leses feilfritt i 0.6.1 og 0.7.0, så det går an å rulle tilbake.
  - Ugyldig JSON, `v:2`, `[]`, `null` og søppelverdier gir startverdier, og spillet starter uten sidefeil.
  - Omlasting mens roboten står på land gir start i båten, uten tap.
- **U1 (rettet fra 0b78d98):** Start er helt synlig uten rulling i alle størrelser, og `elementFromPoint` midt på knappen treffer `startBtn`.

  | Størrelse | 0.9.1 | 0.9.2 | 0.6.1 |
  |---|---|---|---|
  | 320×568 | 566–634 | 410–478 | 388–456 |
  | 568×320 | 317–387 | 234–302 | 244–312 |
  | 740×360 | 317–387 | 233–303 | 243–313 |

  - Havnelinja vises i 375×812 og 1280×800 og er skjult under 640 px høyde.
  - Mål, oppdrag, styring og «Versjon 0.9.2» står på kortet.
  - Ingen sideveis rulling.
- **U2 (rettet fra 0b78d98):**
  - Ny spiller: «Kjør ut på havet og trykk på 🎣 Fisk! … Oppdrag: Fang Kraken 🐙» er den eneste meldingen de første 10 s.
  - Med lagring: «Velkommen tilbake, kaptein! ⚓» er den eneste meldingen.
  - Etter G i land og G om bord, to ganger: bare «⛵ Du er om bord igjen.».
  - Havnehjelpen brukes ikke opp av starten eller av turer på land. Ved innkjøring 1–3 vises den store hjelpen, og ved 4–5 vises «⚓ Havna». Det gjelder både ny spiller og spiller med lagring.
- **U3:** Tekstene er korte og vennlige, og Kraken-kampen er uten straff.
- **T1 (emulert):** Alle synlige knapper er minst 44×44 px med minst 8 px mellomrom. Gjelder fire mobilstørrelser i tilstandene havna, land, butikk, butikkort, sjø, event og kamp.
- **T2:**
  - Tab går gjennom 📖, 🔊, kart, pause, Avslutt, handling og 🚶.
  - Pausekortet holder fokus.
  - Butikkortet fra land holder fokus (25 av 25 Tab).
  - Avslutt-dialogen gir fokus til `evnBli`.
- **T3:** Viewport sperrer ikke zoom (`kjor.mjs`).
- **K1:** Ingen sidefeil, konsollfeil, HTTP-svar på 400 eller høyere eller eksterne forespørsler i noen kjøring (`kjor.mjs` og egne skript).
- **K2:** En kastet feil under spill viser feilkortet. Testet som på evnstudio.no med avskjærte forespørsler.
- **K3:**
  - «0.9.2» står i tittel, startkort og `VERSJON`.
  - ENDRINGSLOGG-raden beskriver nå 0.9.2, rettingene og at 0.9.2 får ny full QA. Teksten stemmer med det som er testet.
  - Det mulige problemet fra 0b78d98 (raden skrevet før QA) er dermed løst.
- **S1:** CSP er OK (`kjor.mjs`), og det er ingen nye domener.
- **S2, S3:** Ingen eksterne forespørsler lokalt, `document.cookie` er tom, og det finnes ingen fritekst og ingen kjøp med ekte penger.
- **S4:** `personvern/index.html` (localStorage, ingen informasjonskapsler, bare GoatCounter) stemmer med det som ble observert. Observerte nøkler: `evn-fiskespillet-v1`, `evn-fiskespillet-lyd` og `evn-spilletid-fiskespillet`.
- **ST3, ST5, ST6:**
  - Lokalt sendes ingenting (0 forespørsler, `goatcounter` er udefinert).
  - Som på evnstudio.no ble bare én sidevisning sendt, og ingen ukjente hendelser.
  - Ingen informasjonskapsler og ingen ID-er.
- **B1:** L slår av lyden, og 🔇 huskes etter ny lasting.
- **B2:** Kartet åpnes med M (også på land), og spillet står stille.
- **B4:** Kraken-kampen er snill, med «Prøv igjen».
- **Regresjon på land:**
  - 🚶 og G virker bare i havna. G langt fra kaia gjør ingenting.
  - T og fiske virker ikke på land.
  - Handlingsknappen gir 🛒 og 🐠 på riktig sted, og ⛵ Gå om bord.
  - Styrespaken flytter roboten 9,4–13 enheter på 6 s.
  - Fiskebåten kommer etter salg (inn, laster, ut) og ikke uten salg.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST1, ST2, ST4, ST7 og ST8, kjent forbehold (uendret):**
  - `statistikk.js` er lik main og har ingen oppdager for Fiskespillet.
  - Som på evnstudio.no ble bare sidevisningen sendt. Det kom ingen `start-`, `versjon-` eller `spilletid-`, verken etter 70 s spill eller etter en kastet feil.
  - Spillet har `data-spill="fiskespillet"` og sender `evn-start`.
  - Dette er samme forbehold som for 0.6.1, og ENDRINGSLOGG sier at Ivar har godkjent det.

## Anbefalte forbedringer
- **Melding over knapper (bedre enn i 0.9.1):**
  - Ved 568×320 dekker startmeldingen 655 px² av 🚶 Gå i land (1311 px² i 0.9.1). Ved 320×568 er overlappen borte.
  - «Dra fingeren»-hjelpen dekker 672 px² av ⚓ Havna ved 320×568, som før.
  - Begge har `pointer-events:none`, så trykket virker.
  - Under eventet dekker meldingen 📖 ved 320×568 (595 px²). Dette er kjent fra før.
- **Ny spiller på lav skjerm:** Havnelinja er skjult på startkortet, og havnehjelpen vises ikke ved start. Barnet får derfor havneforklaringen først neste gang båten kommer inn i havna. Even bør se om det er forståelig.
- **Tilbake og versjon på startkortet:** Ved 568×320 og 740×360 ligger «← Tilbake» delvis under kanten og «Versjon» under kanten. De nås ved rulling. Det er likt eller litt bedre enn i 0.6.1, så det er ikke en regresjon.
- **T4, turbo:** Når turbo slås på, vises en tekstmelding og `aria-pressed` settes. Ellers vises tilstanden bare med farge.
- **Fra 0b78d98, ikke endret i 0.9.2 (ikke målt på nytt):**
  - Roboten går gjennom lyktestolper, tønner og fiskekasser.
  - På land viser kartet båten, ikke roboten.
  - Det er omtrent dobbelt så mange trekanter som i 0.6.1, mest fra terrenget.
  - `stang:99` gir Superstang.
- **Standarden:** Fiskespillet mangler i oversikten per spill. Jeg har brukt B1–B4.

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt. SwiftShader sier ingenting om ekte mobil, og økningen i trekanter er ikke målt i bildefrekvens.
- **Y2:** At blur pauser spillet er testet. 60 og 120 Hz er ikke målt, og ytelse er ikke målt på nytt.
- **T1, T3 og B1 (E):** Ekte berøring, klypezoom og ekte lyd er ikke testet. `prefers-reduced-motion` er bare kodelest.
- **B3 (E):** Tapt WebGL-kontekst og svake enheter er ikke kjørt. Koden er uendret siden 0b78d98 og bare kodelest.
- **T4:** Kontrasten er ikke målt.
- **U2, U3 og B4 (V):** Even må vurdere om startbeskjeden, havnehjelpen og landmodus er forståelige og morsomme.
- **ST1, ST2, ST4, ST7 og ST8:** `test/statistikk/` finnes ikke (IKKE INNFØRT). Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging sjekke.
- **Ikke kjørt i denne runden:** Torsdag-eventet med ekte klokke (tvunget i stedet), lange økter (15–60 min), at store dyr kommer tilbake, og de 120 tilfeldige landvandringene. Landkoden er uendret siden 0b78d98.
- **B5, B6 og B7:** Gjelder ikke spillet.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for spillet. UI8a–c er ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – Begge funnene fra 0b78d98 er rettet: startbeskjeden står, og Start synes uten rulling. Jeg fant ingen kritiske feil, og F1–F3 virker, også med lagring fra 0.6.1 og 0.7.0. Ytelsen på ekte mobil (Y1) og ekte berøring er ikke testet, og statistikkforbeholdet fra 0.6.1 gjelder fortsatt.
