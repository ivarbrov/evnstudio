# EVN Game QA: Fiskespillet 0.5.6 og forsiden
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 7df7df8bba438236a69e361af0aa0e31fc213fca
Testkvittering: evn1 commit=7df7df8bba438236a69e361af0aa0e31fc213fca tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Versjonen skal publiseres og spillet er nytt. Felles `statistikk.js`, forsiden og `test/index.html` er endret. `test/kjor.mjs` ga 98 OK, 0 FEIL, 0 VARSEL og 1 KJENT (Fossil Zoo T3, gjelder ikke dette spillet). Suitene statistikk og ui er ikke innført. Fiskespillets `index.html` på HEAD er byte for byte lik 6b5edde. Diffen c548231..HEAD i `spill`, `index.html` og `statistikk.js` er bare endringene i 0.5.5 og 0.5.6.
Testet: Egen `python3 -m http.server` på 127.0.0.1:8796. Rota var en `git archive` av 7df7df8 i `/home/claude/qa-tmp6/root`, med 5581f2e (0.3.0), 1882d20 (0.5.2) og c548231 (0.5.4) i undermapper på samme opprinnelse, så lagringer fra eldre versjoner kunne lages.
- **Nettleser:** headless /usr/bin/google-chrome via puppeteer-core, med WebGL via SwiftShader. Bildefrekvensen var 1,5–8,6 bilder/s.
- **Spillet:** 1280×800 med mus og tastatur. 375×812, 740×360, 320×568 og 568×320 med emulert berøring og DPR 2.
- **Forsiden:** 1280×800, 1000×800, 375×812 og 320×568.
- **Metode:** Ekte tastetrykk og musklikk, `touchscreen.tap` og fingerdrag via CDP. Fanebytte er gjort med en ekte annen fane. Blur er syntetisk.
- **Testtilstand:** satt med `window.__spill`, og lagring lagt inn fra en nøytral side. Kraken-funksjonene er pakket inn for telling. Tapt WebGL er laget med `WEBGL_lose_context`.
- **Statistikk som på evnstudio.no:** forespørslene er avskjært og servert fra disk, count.js er byttet med en stubb, og 5-sekundersintervallet er forkortet.
- **Rydding:** Hver økt hadde egen profil, og localStorage er tømt. Serveren er stoppet, det kjører 0 Chrome-prosesser, og `git status` er tom. Ingen resultater fra tidligere commits er brukt som bevis.

## Oppfylte krav
- **F1:**
  - **PC:** Start virker, og fokus går til lerretet. W og piler gir kjøring (9,8 enheter på 4 s). Fisking fyller båten (5/5 på 28 s). I Havna virker selg, akvarium og kjøp, uten NaN. Havna lukkes med Esc, ✕, knapp og trykk utenfor. Fiskeboka virker.
  - **Pause og kart:** Pause virker med P, Esc og knapp, og spillet står stille. Kartet virker med M og Esc og står stille.
  - **Avslutt:** Nei og Esc gir «spill». Ja går til forsiden, og lagringen er beholdt.
  - **Kraken:** fanget med 24–25 trykk (+10 000). Uten trykk slipper den unna med en vennlig melding.
  - **Mobil, i fire størrelser:** styrespak (20–28 enheter), Havna, bok, kart, pause, styringshjelp og Avslutt→Nei virker.
  - **Kraken-sekvensen (0.5.3–0.5.6):**
    - kraken=true lagres med en gang, og meldingen har hvit tekst.
    - Styring og E er låst under sekvensen («🐙 Wow!»).
    - Sekvensen står stille i pause, med kartet åpent og ved fanebytte (t 4,47 → 4,47).
    - Feiringskortet «🏆 OPPDRAGET ER KLART! 🏆» får fokus på «Så kult!», og Enter lukker det.
    - Andre gang står det «Du fanget Kraken igjen!», uten ny premie.
    - Ved omlasting midt i sekvensen er fremgangen beholdt, og det kom ingen feil.
    - Landing og dans ble talt én gang per fangst (2 av 2 fangster ved 1,5 bilder/s). Med deterministisk hopp forbi landings- og plaskvinduet ble `landet` og `plasket` likevel true, og dansen kom én gang.
- **F2:** Tilstanden er lik etter omlasting. Nullstilling krever bekreftelse: Nei og Esc beholder lagringen. Ja sletter `-v1` og `-kopi`, mens lyd og spilletid blir stående.
- **F3:**
  - Ekte lagringer fra 0.3.0 og 0.5.4 ble lest uendret, uten kopi.
  - Ugyldig JSON, v:2 og [] gir kopi og ren start.
  - null, tekst, feil typer, 1e400 og ugyldig plass gir 0 feil og ingen NaN.
  - Testmodus endrer aldri `evn-fiskespillet-v1`.
- **U1:** Startkortet har mål, styring, «Versjon 0.5.6» og «Tilbake til EVN Studio». Start er synlig, og det er ingen sideveis rulling i fem størrelser.
- **U2 og U3 (Q):** Styringshjelpen stemmer for PC og berøring. Meldingene er vennlige, og tap er mildt.
- **T1 (emulert):** Ingen knapper under 44×44 i start, nullstilling, spill, Havna, bok, kart, pause, Avslutt og Kraken-kampen (375×812).
- **T2:** Tab holder seg i dialogene start, nullstilling, pause, kart, Avslutt (fra pause og 🚪), bok og Havna, med 0 ut. Feilkortet holder fokus i 14 scenarier. Unntaket står under avvik.
- **T3:** Viewporten sperrer ikke zoom. Med «reduser bevegelse» er kameraristen 0 (0,052 uten).
- **T4 (Q):** Sjeldenhet vises med tekst, og meldingene har hvit tekst på mørk bakgrunn.
- **K1:** 0 sidefeil og 0 svar på 400 eller høyere i spillet under normal bruk. Det eneste 404-svaret var favicon.ico på den nøytrale testsiden. Etter tapt WebGL var det 0 shaderfeil i 4 av 4 kjøringer. `royk` K1 er OK for alle seks spill.
- **K2:** Feil under spilling, også etter pause, kart, Havna eller Avslutt, gir feilkortet. «Last på nytt» virker, og lagringen er skrevet (4321).
- **K2/B3:** Tapt WebGL under spilling og på startkortet gir feilkortet (1280 og 375). På startkortet står det «Trykk på knappen for å starte spillet på nytt.» Start kan ikke trykkes bak kortet, og spillet starter etter omlasting.
- **K3:** 0.5.6 står i tittel, startkort og `VERSJON`. ENDRINGSLOGG har rader for 0.5.0–0.5.6 og publiseringen.
- **S1:** CSP er OK (statisk test). count.js var den eneste eksterne forespørselen, og det var 0 CSP-brudd på spillet og forsiden.
- **S2 og S3:** Ingen konto, chat, kjøp med ekte penger eller fritekst.
- **S4 (Q):** Personvernsiden er generell og sier at spilletiden kan telle pauser. Det stemmer med det spillet gjør (se ST2).
- **ST1:** `statistikk.js` ligger i `<head>` med `data-spill="fiskespillet"`, før spillets skript. `evn-start` sendes én gang. `start-fiskespillet` kommer én gang, også med en ekstra `evn-start`.
- **ST1 for de andre spillene:** Med den nye `statistikk.js` teller Era Defenders, Mørkeskogen, Dyrepatruljen, Magiske egg og Fossil Zoo start én gang hver, også med en ekstra `evn-start`. Det kom ingen hendelser før start. Forsiden gir bare sidevisning.
- **ST3:** Lokalt lastes ingenting fra gc.zgo.at (`gcSkript:false`). I koden sjekkes vertsnavnet mot evnstudio.no.
- **ST5:** Bare godkjente navn ble sendt, hvert én gang.
- **ST6:** `document.cookie` er tom på alle sider, og det finnes ingen ID-er i koden.
- **B1:** L og 🔊 slår av lyden, og 🔇 vises etter omlasting.
- **B2:** Kartet viser deg, havna, fiskesteder og Kraken. Spillet står stille mens kartet er åpent.
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her», og Start er slått av.
- **B4 (Q):** Kraken er valgfri og vennlig, og tap er mildt.
- **Forsiden:**
  - Seks kort: 3+3 i 1280, 2+2+2 i 1000 og én kolonne i 375 og 320. Ingen sideveis rulling.
  - «Nytt» står bare på Fiskespillet.
  - Alle bilder er lastet og har alt-tekst.
  - Alle 13 interne lenker svarer 200.
  - Klikk (1280) og trykk (375, 320) på Fiskespillet-kortet åpner «Fiskespillet 0.5.6».
  - 0 sidefeil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **K2/T2 – verifisert feil (kjent fra c92771c, ikke rettet i 0.5.5 og 0.5.6):** Feilkortet kan ikke brukes hvis WebGL mistes mens pausen er åpen.
  - **Gjenskape:** Start, åpne pausen (P, eller ekte fanebytte), og kall `loseContext()`.
  - **Resultat:** Kortet vises, men er inert. Midt på «Last på nytt» ligger `evnPause`, og fokus står på `evnPauseFortsett`. To klikk eller trykk laster ikke siden på nytt.
  - **Hvem rammes:** På PC fører bare Esc videre. På mobil står barnet fast til siden lastes på nytt i nettleseren. Fremgangen er lagret.
  - **Hva er galt:** Behandleren for `webglcontextlost` (linje 1953) kaller ikke `EVNPauseInert($('feil'))`, slik feilfangeren på linje 1944 gjør.
  - **Hvorfor ikke kritisk:** Fremgang går ikke tapt, og feilen krever tap av grafikkonteksten mens pausen er åpen.
- **ST2 – verifisert feil (kjent, akseptert):** `spilletid-fiskespillet-01min` og `-05min` ble sendt mens pausen var åpen.
- **ST4 – verifisert feil (kjent, akseptert):** En feil under spilling gir ingen `feil-fiskespillet-spill`.
- **ST7 – verifisert feil (kjent, akseptert):** `versjon-fiskespillet-0.5.6` og feilhendelsene mangler. Den godkjente statistikken er ikke tatt inn i noe spill.
- **B4/U3 – mulig problem (kjent, står fortsatt):** Kraken krever cirka 3 trykk/s. Med emulerte trykk på mobil ble den ikke fanget (28 trykk på 60 s, verktøyet trykker sakte). Det må avgjøres på ekte telefon.

## Anbefalte forbedringer
- **Publiseringssjekken (verifisert):** `test/publiseringssjekk.mjs` gir FEIL fordi PR-en endrer `test/index.html`, og fordi det mangler QA-rapporter på fullt nivå for 7df7df8 for alle seks spill (felles `statistikk.js` er endret). Den gir også VARSEL om at Fiskespillet mangler i standardens oversikt (jeg har brukt B1–B4). ENDRINGSLOGG sier at sjekken omgås med eiers godkjenning.
- **ENDRINGSLOGG:** Raden «publisert ved PR #36 … etter full EVN Game QA på siste commit uten kritiske feil» er skrevet før publisering og før denne kontrollen. Teksten må stemme med det som faktisk skjer.
- **Tidligere forbedringsforslag:**
  - Ved 568×320 dekker meldingen 📖 (79×38 px) i noen sekunder.
  - I Havna ved 568×320 overlapper ✕ «💰 Selg» med 22×7 px når kortet er rullet.
  - Under 20 bilder/s går båten saktere, fordi dt er begrenset til 0,05 s.
  - Kraken-sekvensen tar ikke hensyn til «reduser bevegelse».
  - `#test` teller som vanlig trafikk på nettstedet.
  - Vakten for feilkortet bør flyttes til felles EVN-PAUSE.
  - «Siste nytt» nevner ikke Fiskespillet.
- **Uten WebGL:** Spillet kaster «Error creating WebGL context» videre som en ufanget feil, etter at den vennlige meldingen er vist. Det er bevisst stopp av skriptet, og barnet merker det ikke.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes ikke (suiten er ikke innført). Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging. Milepælene er testet bare i forkortet tid (01–30 min).
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader sier ingenting om ekte maskinvare.
- **Y2:**
  - Testet: ekte fanebytte og blur åpner pausen («Pause fordi du gikk ut av spillet.»).
  - Kun kodelest: hastighet ved 60/120 Hz er ikke målt.
- **T1, T3 og B1 (E):** Ekte berøring på iPhone og Android, klypezoom og hørbar lyd er ikke testet. At myntlyden spilles, er bare kodelest (`landKraken` kaller `lydMynt`).
- **B3 (E):** Lavere grafikk på svake enheter og ekte tap av WebGL når mobilen legger appen i bakgrunnen er ikke testet.
- **U2, U3 og B4 (V):** Even må vurdere om Kraken-sekvensen, tidsgrensen, feilkortet og styringen er forståelige og passe vanskelige.
- **T4:** Kontrasten er ikke målt med verktøy, bare vurdert.
- **B5–B7:** Gjelder ikke (ingen læringsfakta, app-installasjon eller fritekst).
- **UI1–UI10:** Ikke kontrollert. Kravene er godkjent hovedløsning, men ikke tatt i bruk for spillet.
- Lange økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. F1 er testet på PC og emulert mobil, og Kraken-rettingene i 0.5.5 og 0.5.6, forsiden og start-tellingen i alle seks spill virker. Avviket med tapt WebGL i pausen (K2/T2) er fortsatt ikke rettet, de kjente statistikkavvikene ST2, ST4 og ST7 står, og ekte enhet, lyd og GoatCounter er ikke testet.
