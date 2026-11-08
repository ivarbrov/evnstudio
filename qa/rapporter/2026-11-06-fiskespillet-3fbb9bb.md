# EVN Game QA: Fiskespillet 0.7.0
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 3fbb9bb0f90c44e7ed2ac845a1f609a6e521c351
Testkvittering: evn1 commit=3fbb9bb0f90c44e7ed2ac845a1f609a6e521c351 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: høy. Endringen gjelder spillmekanikk og økonomi (store dyr, turbo, eventkraft) og hva som regnes som lagring ved nullstilling (`harLagring` i EVN-NULLSTILL). Lagringsformatet er uendret, men jeg testet likevel lagring fra 0.6.1. Nivået er ikke fullt, fordi versjonen ikke foreslås publisert nå. Det må tas full kontroll før publisering. `kjor.mjs` ga ingen FEIL og ingen VARSEL. Eneste KJENT er Fossil Zoo T3, som ikke gjelder dette spillet.
Testet:
- **Server:** egen `python3 -m http.server` på 127.0.0.1:8821, med rot i `/tmp/qa-fisk070/root` (`git archive` av 3fbb9bb). 0.6.1 (a1b3bb7) lå under `/spill/fiskespillet-v061/` på samme opprinnelse til lagringstesten.
- **Nettleser:** headless Chrome via Playwright med SwiftShader, omtrent 4–8 bilder/s. Spilltiden går derfor omtrent 7 ganger saktere enn ekte tid.
- **1280×800:** ekte tastetrykk (W, Shift, T, E, mellomrom, Enter, P, M, Esc, Tab) og ekte musklikk på 🚀.
- **375×812, 740×360, 320×568 og 568×320:** emulert berøring (`touchscreen.tap`), styrespak via CDP-berøring og DPR 2.
- **Klokke:** fredag 00:05 CET, så eventet var ikke aktivt med ekte klokke. Eventet er testet med `eventTvang`.
- **Hjelpemidler:** Båten er flyttet til dyrene med `__spill.spiller.pos`. Jeg har altså ikke kjørt dit med ekte styring. `neste` er satt til 0 for at dyrene skulle komme fram fort. Ledig tid er simulert ved å forskyve `performance.now` med 200 s.
- **Økonomi:** 30 000 trekk per kombinasjon med `__spill.nyFisk` i både 0.6.1 og 0.7.0.
- **Statistikk:** testet som på evnstudio.no med avskjærte forespørsler og en stubb for `count.js`.
- **Opprydding:** localStorage er tømt før og etter hver økt. Serveren er stoppet (pid 3910, porten svarer ikke), og `git status` er tom.
- **Skript:** ligger i `/tmp/qa-fisk070/skript/`, og skjermbildene i `/tmp/qa-fisk070/`.

## Oppfylte krav
- **Turbo:**
  - Knappen er skjult på startkortet og vises etter Start. Den er 56×56 px.
  - Med flåten ga W 11,3 i fart, Shift+W 19,3 og T+W 19,4. Taket er 21,6, altså 1,8 × 12, og farten var fortsatt på vei opp. Med styrespak og 🚀 var farten 20,0–21,0 i alle fire mobilstørrelser.
  - T, musklikk og trykk slår turbo av og på. `aria-pressed` og klassen `pa` følger med, og meldingen «🚀 Turbo på!» vises.
  - Mellomrom med fokus på 🚀 gjør handlingen og endrer ikke turbo.
  - T virker ikke i pause. Pausen og fangstkortet dekker knappen.
  - Knappen overlapper ikke handlingsknappen, heller ikke med den lengste teksten «🦈 Fisk hammerhaien» eller med «📦 Båten er full». Den overlapper heller ikke `#hjelp`, `#hoyre` eller HUD i noen av de fem størrelsene. Det er ingen sideveis rulling.
- **Store dyr:**
  - I Dyphavet er det to haier, én hammerhai og to hvaler. De ligger 391–520 fra sentrum og minst 69 fra hverandre. Kraken har minst 72 i avstand, så handlingene for Kraken og dyrene kan ikke komme i konflikt (kodelest).
  - Skilt og ikoner vises på kartet. Forklaringen under kartet har «🦈 Hai · 🐋 Hval».
  - Knappene heter «🦈 Fisk haien», «🦈 Fisk hammerhaien» og «🐋 Fisk hvalen». Fangsten blir riktig art og en vanlig variant, for eksempel «Glødende hai» til 240 og «Liten blå hval med stjerner» til 168. Teller og last øker med 1.
  - Etter fangst er dyret skjult, og `neste` er 189–214. Det ligger innenfor 150–240.
  - Nedtellingen står stille i pause, med kartet åpent og etter mer enn 3 min uten aktivitet. Den fortsetter etter et tastetrykk. Dyrene svømmer ikke mens kartet er åpent.
  - Kjører du bort mens du fisker, blir fisket avbrutt, og dyret blir værende. Med full båt står det «📦 Båten er full», og ingen fisking starter.
  - I 30 000 tilfeldige trekk i Dyphavet ble det 0 % hai, hammerhai og hval. I 0.6.1 var det 3–10 % hver.
- **Rettinger etter 100ddd8:**
  - **Eventet:** Snittverdien med event er nå 1,09–1,36 × (før 1,35–2,30 × i samme måling).
  - **Sjømonsteret:** `neste` står stille når ingen har rørt spillet på over 3 min (623,58 → 623,58), og teller igjen etter et tastetrykk.
  - **Etter eventet:** `neste` går fra 5,7 til 736, altså ikke lenger 45 s.
  - **Nullstilling:** «Start helt på nytt» vises når bare `venner` er 1 eller bare `kraken` er sann. For en ny spiller vises den ikke.
- **F1:** Start, kjøring, fisking, pause og fortsett virker i fem størrelser, og Kraken-kampen starter. Røyktesten er OK.
- **F2:** Esc i nullstillingen beholder lagringen. «Ja» sletter den, og etterpå er knappen borte.
- **F3:**
  - En ekte 0.6.1-lagring leses uendret i 0.7.0 uten `-kopi`.
  - En 0.7.0-lagring med hval i lasten leses i 0.6.1 uten feil.
  - Nøklene i lagringen er like.
  - Ugyldig JSON, `v:2` og `[]` gir startverdier og en `-kopi`.
- **U1:** Startkortet viser «Versjon 0.7.0», og Start er synlig i alle størrelser.
- **T1 (emulert):** 🚀 er 56×56 px.
- **T2:**
  - Under spill går Tab gjennom 📖, 🔊, kart, pause og Avslutt, deretter handlingsknappen og til slutt 🚀.
  - Pausen holder fokus.
  - Går fokus ut av siden, pauses spillet, slik det også gjorde i 0.6.1.
- **K1:** Ingen sidefeil, konsollfeil, HTTP-svar på 400 eller høyere eller eksterne forespørsler. Eneste varsel kom fra den ødelagte JSON-en jeg la inn med vilje.
- **K3:** «0.7.0» står i tittelen, på startkortet og i `VERSJON`. Endringsloggen stemmer med målingene: 2,5–4 min, 1,15 og samme verdi per fisk.
- **S1:** CSP er uendret, og den statiske kontrollen er OK. Det er ingen nye domener.
- **S2 og S3:** Ingen nye data, ingen fritekst og ingen kjøp.
- **ST3, ST5 og ST6:** Lokalt sendes ingenting, `document.cookie` er tom, og det finnes ingen ID-er.
- **B2:** Kartet viser dyrene, og både dyrene og nedtellingen står stille mens kartet er åpent.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **U2, «🎉 Torsdag!» vises alltid (verifisert feil, finnes siden 0.6.0):**
  - Pillen vises i HUD også fredag 00:05 og med `eventTvang=false`. Se `/tmp/qa-fisk070/hval-1280.png` og `kamp-375x812.png`.
  - Årsak: `#pEvent` får `hidden=true`, men `.pille { display:flex }` overstyrer `[hidden]`. Målt verdi er `getComputedStyle(...).display === 'flex'`, og det er likt i 0.6.1.
  - Barnet får dermed beskjed om event hver dag.
  - Gjenskaping: start spillet utenfor torsdag kl. 17.00–18.30 og se på HUD.
  - Forrige rapport (100ddd8) sa at pillen ble skjult. Det var feil, fordi bare `hidden`-attributtet ble kontrollert. Mest sannsynlig blir funnet om at meldingen dekker 📖 ved 320×568 da gjeldende hele tiden, ikke bare under eventet. Det er ikke testet på nytt.
- **ST2 og ST4, kjent forbehold (ikke en del av denne endringen):** `statistikk.js` på denne grenen avviker fra `origin/main` med en lytter på `evn-start`. Den lytteren fantes allerede før a1b3bb7.
  - Med stubb ble `start-fiskespillet` sendt én gang.
  - `spilletid-fiskespillet-01min` ble sendt etter 66 s i pause.
  - Ingen feilhendelse ble sendt.
  - På publiseringsgrenen er fila lik `main`, slik at bare sidevisning sendes (forbeholdet Ivar har godkjent).
  - Gjenskaping: `/tmp/qa-fisk070/skript/st.mjs`.

## Anbefalte forbedringer
**Økonomi (måling, beslutning for en voksen):**

Snittverdi per tilfeldig fangst i Dyphavet, 0.6.1 → 0.7.0:

| Agn/stang | Tilfeldig fangst | Synlig hai | Synlig hammerhai / hval |
|---|---|---|---|
| 0/0 | 52 → 46 | 61 | 143 |
| 1/1 | 180 → 148 | 179 | 420 |
| 2/2 | 731 → 635 | 673 | 1550 |
| 3/3 | 2185 → 1917 | 1811 | 4200 |

Tilfeldige fangster gir altså 12–18 % mindre enn før. Til gjengjeld gir hammerhai og hval 2–3 ganger snittet. Per full båt (forenklet: maks 5 store dyr per tur, resten tilfeldig):

| Båtplasser | Agn/stang | 0.6.1 | 0.7.0 med alle 5 dyr | 0.7.0 uten store dyr |
|---|---|---|---|---|
| 5 | 0/0 | 262 | 551 (+110 %) | 228 (−13 %) |
| 10 | 1/1 | 1802 | 2357 (+31 %) | 1481 (−18 %) |
| 20 | 2/2 | 14 620 | 15 528 (+6 %) | 12 704 (−13 %) |
| 25 | 3/3 | 54 630 | 54 571 (0 %) | 47 928 (−12 %) |

- Endringen gir mest til nye spillere. En flåte kan kjøre rett til Dyphavet, for ingenting stenger veien. Endringsloggen sier bare «samme verdi», og den bør også nevne hvordan inntekten endres.
- **Omlasting nullstiller dyrenes nedtelling (verifisert):** `neste` var 190 og 195 før omlasting og 4–20 etter. Det kan brukes til å fylle båten med bare store dyr, som gir omtrent 81 000 per tur på toppnivå (+49 %). Vurder å lagre nedtellingen.
- **Turbo gjør båtkjøp mindre verdt:** Flåte med turbo (21,6) er nesten like rask som Motorbåt (24). Turbo koster ingenting, og det er ingen grunn til å slå den av.
- **Kampen mot Kraken dekker 🚀 ved 375×812 og 320×568 (verifisert):** Overlappet er 2329 og 2502 px², og i midten av knappen ligger «⏱ 60». Turbo har ingen funksjon i kampen, så knappen kan skjules mens kampen pågår.
- **Knappen kan bytte tekst under fingeren (mulig problem):** Dyret svømmer i en sirkel, og handlingen gjelder innenfor 16 enheter. I én kjøring ved 740×360 ga trykket vanlig fiske (blekksprut) i stedet for hammerhaien. Gjenskapt kjøring viste avstand 12 og riktig fangst. Det må testes med ekte styring for å avgjøre om dette skjer i vanlig spill.
- **Turbo med Shift har ingen visuell markering.** Med 🚀 eller T vises tilstanden bare med farge etter at meldingen er borte (T4).
- **Startkortet for berøring nevner ikke 🚀.** Hjelpen i pausen gjør det.
- **Står fortsatt fra før:** «vises … på kartet» i endringsloggen for 0.6.0. Fiskespillet mangler fortsatt i standardens oversikt per spill, og jeg har brukt B1–B4.

## Kontroller som ikke kunne utføres
- **F1 «Avslutt» og Kraken fanget helt:** Ikke kjørt ved denne kontrollen. Koden er uendret siden 100ddd8, der begge er testet.
- **Y1 (E):** SwiftShader sier ingenting om ytelsen på en ekte mobil.
- **Y2:** Turbo bruker `dt` (kodelest). Det er ikke målt ved 60 og 120 Hz.
- **T1, T3 og B1 (E):** Ekte berøring, klypezoom og lyd er ikke testet. Styrespaken er bare emulert.
- **U2, U3 og B4 (V):** Even må vurdere om det er morsomt og forståelig å finne og fiske haiene og hvalen, og om turbo føles riktig.
- **Lange økter:** At dyrene kommer tilbake etter 2,5–4 min ekte tid, er bare testet i forkortet form. Økter på 15–60 min er ikke kjørt.
- **Eventet med ekte klokke:** Ikke testet, fordi klokka viste fredag. Eventet er testet med `eventTvang`.
- **ST1, ST7 og ST8:** `test/statistikk/` finnes ikke. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging sjekke.
- **B3, K2, S4, T3 og T4:** Ikke kjørt på nytt. De påvirkes ikke av endringen (kodelest diff).
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. Turbo, de synlige dyrene og rettingene etter forrige kontroll virker i alle fem størrelser, og lagringen er bakoverkompatibel. Før publisering bør pillen «🎉 Torsdag!» rettes (den vises alle dager), og en voksen bør ta stilling til økonomieffekten og til at omlasting nullstiller dyrenes nedtelling.
