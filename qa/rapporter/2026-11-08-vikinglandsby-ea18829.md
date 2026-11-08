# EVN Game QA: Vikinglandsby 0.2.0
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast; gjeldende 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit ea1882955bb3342ed4130b035c4f641bc857a5fa
Testkvittering: evn1 commit=ea1882955bb3342ed4130b035c4f641bc857a5fa tester=7d3c0337901d arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels, utvidet – grafikkmigrering i ett spill (G9). Fletting med main tar inn `statistikk.js`, men fila er lik main (0 linjer diff) og er kontrollert der (PR #53). Lagringsformatet er ikke endret. Ved tvil gikk jeg likevel gjennom alle gjeldende krav for spillet. Dette er ikke en publiseringskontroll.
Testet: Chrome headless (Playwright, swiftshader, `reducedMotion: 'reduce'`). Alle kjøretidstester er gjort mot en `git archive` av ea18829 i /tmp/qa2/ea18829, servert på 127.0.0.1:8768. Grunnen er at grenen flyttet seg under kontrollen, først til e0c23af (0.3.0) og så til 6dc8217, og arbeidstreet ble endret kl. 21:59. Resultater fra det endrede treet er forkastet. PC 1280×800 med ekte tastetrykk og mus. Berøring er emulert (isMobile/hasTouch, DPR 2) i 375×812, 740×360, 320×568 og 568×320, med `tap` og CDP-berøring for styrespaken. En ekte 0.1.1-lagring er laget i 0.1.1 (a1a1f1b, eksportert og servert på :8767). Testtilstand er satt med `window.__spill` og `#test`. `localStorage` er tømt før og etter. Skript og skjermbilder ligger i /tmp/qa2.

Regresjon (G9): blokkene med innstillinger, hus og ønsker, `lagre`/`lastInn`, styringen og CSP er byte for byte like i 0.1.1 og 0.2.0 (md5 av kodeblokkene).

## Oppfylte krav
- **F1** PC: Tab til Start og Enter, gå med piltaster, hogg, hakk, plukk og fisk med E og med E holdt inne. Bygg langhus med mus, og tømmerhytte (snudd med R), steinbrudd og fiskebrygge med tastatur. Gi jobb med E (hytte og brudd). Pause med P og Esc, kart med M. Avslutt → «Ja, avslutt» går til forsiden. Ønskene 0→6 er spilt, og 8→10 er kjørt fra 0.1.1-lagringen med API (sluttkortet «Du er en ekte vikinghøvding!» vises). Med berøring i alle fire størrelser: start, styrespak, handlingsknapp, 🔨 → Langhus → trykk på bakken → ↻ Snu → ✔ Bygg her, jubelkort, pause og kart. Ingen heng.
- **F2** Ressurser, ønske, hus, vikinger og jobber er like etter omlasting. Lagringen finnes etter Avslutt. «Start helt på nytt»: Esc og «Nei» beholder, «Ja» sletter.
- **F3** En 0.1.1-lagring (5 hus, 4 vikinger, 3 jobber, ønske 8) lastes riktig. Arbeiderne står på plass og produserer (tre, stein og mat økte), og den nye lagringen har samme format. Sju ødelagte lagringer krasjer ikke. Ugyldig JSON, feil type og ukjent versjon gir kopi i `-kopi`. Rettingen i 0.1.1 for ukjent versjon er bekreftet.
- **U1** Startkortet har merke, mål, styring, ▶ Start, vei tilbake og «Versjon 0.2.0».
- **U2 (Q-delen)** Det tidligere avviket er rettet: hjelpeteksten i byggemodus ligger over panelet i alle fire mobilstørrelser (8 px avstand, ingen overlapp).
- **U3 (Q-delen)** Tekstene er uendret, enkle og vennlige.
- **T1 (emulert)** Ingen synlige knapper under 44×44 px i start, spill, handling, bygg, jubel og pause, i fem størrelser.
- **T2** Hele spillet kan brukes med tastatur. Fokusfellen i ønskelista virker. Pausen: se kjent funn.
- **T3 (zoom)** `viewport` sperrer ikke zoom (statisk test).
- **K1** Ingen ufangede feil og ingen 404 fra spillet (testsuiten og egne kjøringer). Den eneste 404 var `favicon.ico` på testens nøytrale side.
- **K2** Kastet feil under spilling gir «Oi, noe gikk galt» med fokus på «🔄 Last på nytt».
- **S1** CSP er uendret og bestod den statiske testen.
- **ST1** `statistikk.js` ligger i `<head>` før spillets skript, med `data-spill="vikinglandsby"`. `evn-start` ble sendt nøyaktig én gang (målt gjennom start, pause og kart). Den egne oppdageren er fjernet, og spillet lager ingen egen statistikk.
- **ST3** Lokalt lastes ikke GoatCounter (målt), og det sjekkes på vertsnavn i koden.
- **ST6** Ingen informasjonskapsler (0 målt). `localStorage` inneholder bare lagring, lydvalg og spilletid.
- **ST7** Spillet bruker felles statistikk (med forbeholdet under).
- **B1** Lyd av med L, og valget huskes etter omlasting (🔇).
- **B2** Kartet tegnes fra terrenget og viser pil, vikinger, hus og ressurser. Forklaringen stemmer nå med symbolene. Roboten står stille med kartet åpent (0 forflytning).
- **B3** Tapt WebGL-kontekst gir feilmeldingen. Mobilnivået er målt: pikselforhold 1,5 og kvalitetsnivå «mobil».
- **ST2 (spillets egen tid)** Spilletiden i EVN-PAUSE v2 står stille med ønskelista åpen (0 ms) og teller i vanlig spill. Avviket fra 0.1.0 er rettet.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
1. **ST2, ST4, ST5 – kjent og uendret, felles kode (ikke innført av denne commiten):** `statistikk.js` (lik main) teller spilletid så lenge fanen er synlig, også i pause. Den bruker ikke EVN-PAUSE v3 eller `EVNAktivTid` og sender ikke `versjon-…` eller `feil-…`. Ingen spill på main kan oppfylle disse kravene fullt ut før felles kode er endret. Gjenskapes ved å lese `startTidtaking()` i `statistikk.js`.
2. **T2 – kjent funn (uendret):** Tab går ut av pausekortet (Fortsett → Styring → Lyd → Avslutt → `BODY` → 📜 → 🔊). Gjelder felles EVN-PAUSE.

**Mulige problemer**
- **Y1/Y2:** Grafikken er tyngre. I samme swiftshader-miljø ble det målt omtrent 2,0 bilder/s i 1280×800, mot 3,5 for 0.1.0, og 2,2–2,8 bilder/s med emulert mobil. Skygger er nå også på for mobil (de var av i 0.1.x). Fordi `dt` er begrenset til 0,05 s, går spillet i sakte film under 20 bilder/s. Må avgjøres med måling på en ekte, svak mobil.
- **B2 (kjent fra 0.1.0, uendret):** I 568×320 er kartkortet 339 px høyt i et 320 px vindu.
- **U2 (uendret):** Dagens ønske kuttes i HUD på 375 og 320 («Hogg 5 t…»), og velkomstmeldingen ligger delvis over ønskepillen i 375×812.
- **Landskap (uendret):** Byggepanelet dekker 50 % (740×360) og 56 % (568×320) av høyden. I 568×320 havnet det beregnede trykkpunktet for huset under panelet, så det var bare en smal stripe øverst å trykke på. Må prøves på enhet.

## Anbefalte forbedringer
- **Verifisert visuell regresjon:** Vannspruten ved fisking vises ikke lenger. `oppdaterEffekter` fjerner partikler med `y < 0`, men spruten starter nå på `VANN_Y + 0.3 = -0.6`. Alle 8 partiklene ble fjernet i første bilde (antall barn i scenen 66 → 75 → 67), mens spruten fra treet ble stående. Fjern partikkelen etter levetid eller under `bakkeY`.
- Treffpunktet for mus og trykk (`bakkePlan`) er flatt på y = 0, men terrenget har nå høyde. Nær midten var det ingen målbar feil (klikk på (12, −12) ga (12, −12)). Vurder å treffe terrenget nær kanten og fjorden.
- Sjekk om skygger på mobil er ønsket, eller om de bør være av som før, når Y1 er målt.
- Fortsatt åpent fra 0.1.0: en manipulert lagring kan gi høvdinghall med 2 vikinger. Halvveis innlesing (feil type på `vikinger`) gir en delvis landsby, men kopien finnes. Start-knappen ligger under kanten i 568×320. Kameraet går sakte rundt bak startkortet selv med redusert bevegelse.
- Legg Vikinglandsby inn i standardens oversikt (B1, B2, B3) og i `ENDRINGSLOGG.md` før publisering (K3).

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og swiftshader gir ikke meningsfull bildefrekvens.
- **Y2:** Ekte fanebytte er ikke testet. Bare syntetisk `blur` er testet (gir pause med riktig tekst).
- **T1, B1, B3 (E):** Ekte berøring, lyd på enhet og grafikknivå på svake enheter. Bare emulert.
- **B3 (uten WebGL):** Ikke kjørt denne gangen. Koden er uendret fra 0.1.x (kun kodelest).
- **T3 (redusert bevegelse):** Kun kodelest, CSS-regelen er uendret.
- **T4:** Kontrasten er ikke målt.
- **K3:** Gjelder ved publisering. Spillet står ikke i `ENDRINGSLOGG.md`.
- **S2, S3, S4:** Kun kodelest. Ingen konto, chat, fritekst eller kjøp med ekte penger. E-coins brukes bare til robotens antrekk.
- **ST4, ST5, ST8:** `test/statistikk/` finnes ikke (suiten er «ikke innført»). Om hendelsene kommer fram i GoatCounter, krever en voksen med innlogging.
- **U2, U3, opplevd grafikk og flyt (V):** Om Even liker den nye grafikken, om han finner trær og steiner fra startpunktet, og tempoet.
- Lange økter, iPhone og Android er ikke testet. UI1–UI10 og UI8a–c er ikke kontrollert, fordi de ikke er tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil. F1, F2 og F3 (også 0.1.1-lagring) er testet, og funnene fra 0.1.0 er rettet. Ytelse på ekte mobil (Y1) og ekte berøring er ikke testet. Grafikken er målbart tyngre, og rapporten gjelder bare ea18829, ikke de nyere commitene på grenen.
