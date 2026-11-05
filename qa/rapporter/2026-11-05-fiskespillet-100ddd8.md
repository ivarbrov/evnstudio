# EVN Game QA: Fiskespillet 0.6.1
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 100ddd84eaed373a9d30a56fecd4451389830a5b
Testkvittering: evn1 commit=100ddd84eaed373a9d30a56fecd4451389830a5b tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen foreslås publisert, og spillet er nytt på `main`. `git diff origin/main...HEAD` inneholder hele `spill/fiskespillet/index.html`, én linje i `test/index.html`, ENDRINGSLOGG og QA-rapporter. `statistikk.js` er lik `origin/main` (tom diff). Spillfila er byte for byte lik a1b3bb7. `kjor.mjs` ga ingen FEIL og ingen VARSEL. Eneste KJENT er Fossil Zoo T3, som ikke gjelder dette spillet.
Testet:
- **Server:** egen `python3 -m http.server` på 127.0.0.1:8811, med rot i `/tmp/qa-fisk061/root`, en `git archive` av HEAD. Til lagringstesten lå 0.5.8 (9e0d2c7) på samme opprinnelse under `/spill/fiskespillet-v058/`.
- **Nettleser:** headless Chrome via Playwright med SwiftShader, 8 bilder/s.
- **Størrelser:** 1280×800 med ekte tastetrykk og musklikk. 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`touchscreen.tap`) og DPR 2.
- **Klokke:** enhetens klokke viste torsdag 17:50–18:00 CET, så eventet var faktisk aktivt. Jeg testet også uten event med `__spill.eventTvang = false`.
- **Statistikk:** testet som på evnstudio.no ved å avskjære forespørslene og bruke en stubb for `count.js`.
- **Hjelpemidler:** `__spill`, `visMonster` og `eventTvang` er brukt til å sette opp testtilstand.
- **Opprydding:** localStorage ble tømt før og etter hver økt. Serveren min er stoppet (porten svarer ikke), og `git status` er tom.
- **Prosess som ikke er min:** Port 8796 (pid 9292, startet 17:33) var opptatt av en annen `http.server`, med arbeidsmappe `/tmp/qa-fisk061/root` (slettet). Den er ikke min, og jeg har ikke rørt den. Det samme gjelder 8765 og 8766.
- **Skript:** `/tmp/qa-fisk061/skript/`. `ev.mjs`, `sj.mjs`, `lg.mjs`, `st.mjs`, `tk.mjs` og `ut.mjs` er nye. `f`, `k57`, `t57`, `n57` og `m58b` er kjørt på nytt mot denne committen.

## Oppfylte krav
- **0.6.1 Kraken-armene:** I 181 bilder over 22 s var laveste punkt y 5,57. Toppen av sanden er på 4,5, og bunnen av glasset på 4,0. Ingen bilder gikk under sanden, mot 115 av 178 i 0.5.8. Blikket mot havna var 6–26°.
- **0.6.0 Torsdags-event, testet i alle fem størrelser:**
  - Med ekte klokke var `torsdagsEvent()` sann, `#pEvent` («🎉 Torsdag!») ble vist, og ingen elementer i HUD overlappet hverandre.
  - Sjømonsteret kom etter 8,6–19,3 s ekte tid. Det tilsvarer omtrent 6 s spilltid, fordi spilltiden går saktere med SwiftShader.
  - Kartet viser 🐉, og forklaringen under kartet har «🐉 Sjømonsteret». Knappen heter «🐉 Fisk Sjømonsteret(E)».
  - Fangsten ga kortet «🎉 NY VENN! 🎉», og fokus står på «Så kult! 🎉». Penger, last og `fanget` var uendret, og `venner` ble 1 både i spillet og i lagringen.
  - Etter fangsten er monsteret borte og kommer igjen etter 45 s. Fiskeboka viser «🐉 Sjømonster-venner: N».
  - Kjører du bort mens du fisker, avbrytes fisket, og du får ingen venn. Med `eventTvang=false` skjules pillen, og monsteret svømmer bort når tiden er ute, med meldingen om det.
  - Monstertiden står stille i pause, med kartet åpent og med Fiskeboka åpen (807,7 før og etter alle tre).
  - Uten event var første `neste` 809 s, altså innenfor 8–15 min.
- **«Snill versjon»:** Det er ingen nedtelling i grensesnittet og ingen eksklusive premier. Sjømonsteret gir 0 penger. `fiskVerdi` er lik med og uten event, målt på 5 ID-er.
- **F1:** Testet i alle fem størrelser:
  - Start, kjøring med W (2,7–7,9 enheter), pause, kart, «Ja, avslutt» og tilbake til forsiden virker.
  - Kraken-flyten virker i 1280×800 og 375×812: kamp, visning, båt, akvarium og omlasting. Det samme gjelder andre fangst av Kraken, nullstilling og vanlig fiske (`k57`, `t57`, `n57`).
- **F2:** Lagringen overlever avslutning og ny lasting (2468 → 2468), og `venner` overlever omlasting.
  - Nullstilling: Esc beholder lagringen. «Ja» sletter `-v1` og gir `venner` 0.
- **F3:**
  - En ekte lagring fra 0.5.8 leses i 0.6.1 uten `-kopi` og med `venner` 0. Spillet 0.5.8 leser en 0.6.1-lagring med `venner` uten feil.
  - Rare verdier for `venner` håndteres uten NaN i HUD: `"abc"`, −5, `null`, `[]` og `{}` gir 0, 3,7 gir 3, `"7"` gir 7 og 1e12 gir 1e6.
  - Ugyldig JSON, `v:2` og `[]` gir startverdier og en `-kopi`.
- **U1:** Startkortet viser «Versjon 0.6.1». Det er ingen sideveis rulling, og Start er synlig i de fem størrelsene.
- **U3 (Q):** Sjømonsteret er vennlig, og tekstene er korte og milde.
- **T1 (emulert):** Ingen synlige knapper eller lenker er under 44×44 px ved 375×812. `#pEvent` er 32 px høy på smale skjermer, men den er ikke en knapp.
- **T2:** Tab blir i startkortet, pausen, kartet og monsterkortet. Esc lukker monsterkortet. Feilkortet holder fokus også etter Esc fra pausen. Det kjente funnet i standarden (Tab ut av pausekortet) skjer ikke i dette spillet.
- **T3:** Viewport sperrer ikke zoom. Med «reduser bevegelse» har `animationName` verdien `none` både på Start og på `#pEvent`.
- **T4 (Q):** Eventet vises med tekst («Torsdag!»), ikke bare med farge.
- **K1:** Ingen sidefeil, konsollfeil, HTTP-svar på 400 eller høyere eller eksterne forespørsler fra siden i noen økt. Eneste varsel kom fra den ødelagte JSON-en jeg la inn med vilje. Røyktesten i `kjor.mjs` er OK.
- **K2:** En feil under spilling viser «Oi, noe gikk galt», og kortet blir stående etter Esc.
- **K3:** «0.6.1» står i tittelen, på startkortet og i `VERSJON`. ENDRINGSLOGG har rader for 0.6.0, 0.6.1 og publiseringen, og raden for 0.6.1 stemmer med målingen.
- **S1:** CSP er uendret siden 0.5.8, og statisk kontroll er OK. Det er ingen nye domener.
- **S2 og S3:** Ingen konto, chat, kjøp eller fritekst. `venner` er et tall og lagres bare lokalt.
- **S4 (Q):** Personvernsiden stemmer. Siden lover at spillstarter telles, men for Fiskespillet telles mindre enn det, og det bryter ikke personvernet.
- **ST3:** Lokalt sendes ingenting ut.
- **ST5:** Bare sidevisning ble sendt.
- **ST6:** `document.cookie` er tom, og det finnes ingen ID-er.
- **B1 (emulert):** 🔊 → 🔇, og valget huskes etter omlasting.
- **B2:** Kartet virker, og spillet og monstertiden står stille mens kartet er åpent.
- **B3 (melding):** Uten WebGL vises «3D virker ikke her», og Start er slått av.
- **B4 (Q):** Kraken er valgfri, og Sjømonsteret er vennlig.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST1, ST2, ST4 og ST7 – verifisert feil (kjent forbehold godkjent av Ivar):** Testet som på evnstudio.no med stubb. Det ble sendt sidevisning og ingenting mer, verken før start, etter start, etter en ekstra `evn-start`, etter 70 s i pause eller etter en feil.
  - Årsak: `statistikk.js` på `main` har verken lytter på `evn-start` eller noen oppdager for `fiskespillet`.
  - Versjon, spilletid og feilhendelser mangler derfor helt. Dette er en endring fra 0.5.x, der `05min` ble sendt i pause.
  - Slik gjenskapes det: kjør `/tmp/qa-fisk061/skript/st.mjs` (port 8811).

## Anbefalte forbedringer
- **Eventet gir i praksis 1,3–2,0 ganger så mye i snitt per fangst (verifisert, 30 000 trekk per kombinasjon). Dette er en beslutning for en voksen:**
  - Prisen per fisk er lik, men fiskene blir sjeldnere og dermed mer verdifulle.
  - Snittverdien per fangst var 10 → 13 i kystvann med agn 0, 102 → 203 i kystvann med agn 3, og 1034 → 1484 i dyphavet med agn 3.
  - ENDRINGSLOGG sier «Litt flere sjeldne fisker». Ivar bør vurdere om dette fortsatt er «ingen dobbel premie» (prosjektinstruks kap. 23 om tidsbegrensede mekanikker).
- **Etter at eventet slutter (verifisert med `eventTvang=false`):** Da står `neste` på 43–45 s. Sjømonsteret kommer derfor én gang til kort tid etter 18.30, ikke etter 8–15 min.
- **Monstertiden (kodelest):** Den teller også når ingen rører spillet. Den bruker ikke `sistAktiv` slik akvarieinntekten gjør, mens endringsloggen sier «aktiv spilling».
- **HUD ved 320×568 under eventet (verifisert, skjermbilde `/tmp/qa-fisk061/ev-hud-320x568.png`):** Pillen gjør statusstabelen høyere, så den store meldingen dekker deler av 📖-pillen i 4,5 s. Det er `pointer-events:none`, så pillen kan fortsatt trykkes. Feilen ble rettet i 0.5.4, men kommer delvis tilbake under eventet.
- **Nullstilling (verifisert):** En lagring der bare `venner` er over 0, viser ikke «Start helt på nytt», fordi `harLagring` ikke sjekker `venner`.
- **Endringsloggen:** «vises i Fiskeboka og på kartet» kan misforstås. Kartet viser monsteret, ikke hvor mange venner du har.
- **Står fortsatt fra før:**
  - `#test` teller som sidevisning på evnstudio.no.
  - Fiskespillet mangler i standardens oversikt per spill. Jeg har brukt B1–B4.
  - Spillet har ikke forsidekort, og det står i endringsloggen at det er med vilje.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes ikke (ikke innført). Om hendelser kommer fram i GoatCounter, krever en voksen med innlogging.
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader (8 bilder/s) sier ingenting om ekte maskinvare.
- **Y2:** Ikke testet ved denne kontrollen. Ekte fanebytte og 60/120 Hz er ikke kjørt. At pause, kart og bok stopper monstertiden, er verifisert.
- **T1, T3, B1 og B3 (E):** Ekte berøring, klypezoom, lyd og lavere grafikk på svake enheter er ikke testet.
- **U2, U3 og B4 (V):** Even må vurdere om eventet og Sjømonsteret er forståelige og morsomme, og om Kraken-akvariet ser riktig ut. Tidsgrensen i Kraken-kampen på ekte telefon står fortsatt (kjent).
- **Eventet over tid:** Grensene 17.00 og 18.30 med ekte klokke og andre ukedager er bare testet med `eventTvang`. Grensene ble kontrollert ved å lese koden (`getDay() === 4`, `m >= 1020 && m < 1110`).
- **Lange økter:** 15–60 min, også at monsteret kommer etter 8–15 min med ekte tid, er ikke kjørt.
- **B5–B7:** Gjelder ikke.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil, F1–F3 er testet, og eventet, Sjømonsteret og rettingen av Kraken-armene virker i alle fem størrelser. Statistikken gir bare sidevisning (ST1, ST2, ST4, ST7, kjent forbehold), og ytelse, lyd og berøring på ekte enhet er ikke testet. En voksen bør ta stilling til at eventet i praksis gir opptil dobbel snittverdi per fangst.
