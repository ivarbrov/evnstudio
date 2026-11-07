# EVN Game QA: Dyrepatruljen 0.11.6
Grunnlag: agent 2.3 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 2472c0c2c2bc98a80859794afc4510b9c3e06b4e
Testkvittering: evn1 commit=2472c0c2c2bc98a80859794afc4510b9c3e06b4e tester=95301167375e arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: full – versjonen skal foreslås publisert, og diffen mot `main` bygger om felles kode (EVN-PAUSE v2 er nå en merket kopi, og EVN-MENY 1.0 er ny).
Testet:
- **Grunnlaget avviker fra repoet, og det er ikke rettet siden forrige kontroll.** Den testede committen har agentdefinisjon 2.2 (`/home/claude/pilot/.claude/agents/evn-game-qa.md`). Jeg brukte 2.3 fra `/home/claude/evnstudio` (gren `kvalitet/ui-standard`, 69d52f8), fordi bare den beskriver KM1–KM13 og suiten `meny`. Standardfila har samme hash begge steder. `evn-ui-standard.md` (1.1, forslag) finnes ikke i piloten, så den er lest fra `/home/claude/evnstudio`. CLAUDE.md sier at «Grunnlag» skal vise agenten fra repoet. En voksen må derfor avgjøre om kontrollen kan godtas.
- **Testsuite:** `node test/kjor.mjs --base 43aa7b9` (lik `origin/main`) med google-chrome ga 174 ok, 0 feil, 0 varsel og 2 ikke innført (statistikk, ui). Utskriften ligger i `/tmp/qa-2472c-kjor.txt`.
- **Egne tester på denne committen:** headless Chrome via CDP, skript i `/tmp/qa-2472c/` (t1–t6).
  - Tastene er ekte CDP-tastetrykk. Enter er sendt med `\r`.
  - På PC er det brukt CDP-museklikk og på mobil CDP-berøring.
  - `localStorage` ble tømt før og etter hver test.
- **Størrelser:** 1280×800 på PC. 375×812, 320×568, 740×360, 568×320 og 812×375 er emulert mobil.
- **Statistikk:** evnstudio.no ble avskåret og sendt til den lokale serveren, og GoatCounter ble byttet ut med en stubb. Det gikk ingen ekte trafikk.
- **Etter testene:** Testserveren på 127.0.0.1:8770 er stoppet, testnettleserne er lukket, og `git status` er tom.

## Oppfylte krav
**Spillet:**
- **F1:** Hele løpet virker uten å henge:
  - Start → verdensvalg → verden, og W flytter helten.
  - Menyen åpnes og lukkes med P, Esc, ☰, ✕ og Fortsett.
  - Kartet med M og 🗺️, dyreboka med 📖, I og B.
  - Meny › Velg verden → ny verden.
  - Meny › Avslutt › Ja går til `/`.

  I menyen står tilstanden på `pause`, og W flytter ikke helten.
- **F2:** Etter omlasting var `{"v":1,"reddet":{"gata":["katt1","katt2"]}}` beholdt. Nullstilling spør først med fokus på Nei. Esc beholder lagringen, og Ja sletter den.
- **U1:** Startkortet viser mål, styring (Meny, Dyreboka, Kart, Lyd), «Versjon 0.11.6» og «← Tilbake til EVN Studio».
- **B1:** L veksler `evn-dyrepatruljen-lyd` mellom `paa` og `av`. Lydruta finnes i menyen.
- **B2:** Med kartet åpent sto den lokale spilletiden stille (19129 ms), og helten sto i ro selv om W ble holdt inne. Kartet viser «Du er her».

**Tilgjengelighet:**
- **T1 (emulert):**
  - ☰ er 96×48 px, og 48×48 px når skjermen er smalere enn 400 px.
  - 🗺️ og 📖 er 48×48 px, Snik 66 px og Håv 92 px.
  - Menyrutene er 60–64 px.
  - Ingen knapper overlapper, og ingen side ruller sidelengs.
- **T2:**
  - Med ekte Tab går fokus Fortsett → 8 ruter → saldo → ✕ → Fortsett. Shift+Tab fra Fortsett går til ✕.
  - Fokus blir i menyen, og i Avslutt-dialogen står det på Nei.
  - Fokus går tilbake til det som åpnet: ☰, 🗺️, 📖 og Avslutt i verdensvalget.
- **T3:** Zoom er ikke sperret (viewport uten `user-scalable=no`, med `viewport-fit=cover`). `prefers-reduced-motion` er bare kodelest, se «Kontroller som ikke kunne utføres».

**Teknisk og sikkerhet:**
- **K1:** Røyktesten er OK for alle fire spill. Egne kjøringer ga 0 konsollfeil, 0 svar på 400 eller høyere og 0 eksterne forespørsler, unntatt i F3-tilfellet under.
- **K3:** «Versjon 0.11.6» og `VERSJON='v0.11.6'` stemmer. ENDRINGSLOGG har en rad for 0.11.6. Se også forbedringene.
- **S1:** Den statiske suiten er OK (CSP, ingen `eval`, bare godkjente domener). Diffen legger ikke til nye domener.
- **S2:** Diffen legger ikke til konto, kjøp med ekte penger, reklame eller innsamling. E-shop og Garderobe lenker til samme nettsted.
- **S3:** Diffen legger ikke til fritekst.

**Statistikk:**
- **ST3:** Skriptet stopper utenfor `evnstudio.no` (linje 22). Lokalt ble ingenting sendt.
- **ST6:** `document.cookie` er tom, og ingen ID-er lagres. Bekreftet i koden og ved kjøring.

**Meny og styring (rådgivende):**
- **KM12 (kopikontroll):**
  - Begge kopiene er like kilden tegn for tegn: EVN-PAUSE v2 fra linje 186 og EVN-MENY 1.0 fra linje 383. Både suiten og min egen sammenligning viser det.
  - Innholdet i v2-kopien finnes ordrett i Dyrepatruljen 0.11.5 på `main`.
  - Pausen står foran menyen. Den nye kontrollen KM12-pause er OK.
- **KM1, KM2, KM4, KM5:**
  - ☰ står på 10,10, 🗺️ og 📖 står oppe til høyre, og status står i midten. Status overlapper ikke i noen størrelse (minst 10 px avstand i 320×568).
  - HUD-Avslutt er skjult (1×1 px, `hidden`). Avslutt står i menyen og i verdensvalget.
- **KM3, KM9:** Rutene står i fast rekkefølge. Fortsett er synlig uten rulling i 568×320 (y 97–145), og menykortet ruller ikke.
- **KM6:** Styrespaken står nede til venstre og Håv nede til høyre (92 px).
- **KM8:** P, Esc, M, L, I og H virker, og B virker fortsatt.
- **KM11:** Diffen legger ikke til chat, byttehandel eller rebirth.
- **KM13:** Alle rader i suiten er OK i fire størrelser. Mine egne kjøringer viser det samme.

**Uendret spill:** Mot 43aa7b9 er lagringsnøklene, `statistikk.js`, `ecoins/` og personvernsidene uendret. Spillfila og `felles/ui/` er uendret siden 4d627da.

**Eierens krav om testene (diff mot `main`):** Ingen svekkelse funnet.
- I `test/` er bare `test/index.html` endret. `kjor.mjs` og `publiseringssjekk.mjs` er uendret.
- Endringene er tillegg:
  - `meny` er lagt til i `SUITER`.
  - `IKKE_GJELDENDE` har fått en ny nøkkel for `meny`, mens nøkkelen for `ui` er uendret.
  - Funksjonene `meny` og `menySpill` er nye.
- Ingen eksisterende kontroll i `statisk`, `royk`, `statistikk`, `ui` eller `ecoins` er fjernet eller myket opp.
- Rådgivende status gjelder bare den nye suiten.
- **Mutasjonstest i en kopi utenfor repoet:** Med et ødelagt startmerke for EVN-PAUSE v2 ga KM12-pause VARSEL med riktig tekst.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle punktene er kjente fra forrige rapport (4d627da) og fra `main`. Ingen er blitt verre.
- **F3, verifisert feil:** Lagringen `{"v":1,"reddet":{"gata":null}}` gir «TypeError: Cannot read properties of null (reading 'length')» når en verden velges, og spillet blir stående i verdensvalget.
  - **Gjenskap:** sett nøkkelen `evn-dyrespillet-v1` til verdien over, last siden, trykk Start og velg Gata.
  - Lagring fra 0.11.5 og andre ødelagte lagringer virker: ikke-JSON, `null`, `{}`, `{"reddet":[]}` og `{"gata":"x"}`.
- **K2, verifisert ved kodelesing:** Spillet har ingen global feilfanger med vennlig melding. Den eneste fangeren gjelder 3D. Dette er kjent fra standarden («alle spill»).
- **ST1, verifisert:**
  - `statistikk.js` lastes nederst med `defer` (linje 7058), ikke i `<head>`.
  - Spillet sender ikke `evn-start`. Starten telles ved klikk på Start, altså før en verden er valgt.
  - `versjon-dyrepatruljen-0.11.6` ble ikke sendt.
- **ST2, verifisert ved kodelesing:** `EVNAktivTid` finnes ikke. Spilletidsmilepælene i `statistikk.js` teller hvert 5. sekund så lenge fanen er synlig, også i pause, med menyen eller kartet åpent og i verdensvalget. Den lokale spilletiden (EVN-PAUSE v2) står derimot stille, og det er målt.
- **ST4, verifisert ved kodelesing:** `statistikk.js` teller ikke `feil-dyrepatruljen-oppstart` eller `feil-dyrepatruljen-spill`.
- **ST5, delvis:** Det som er observert, er i orden. Ingen hendelse kom før start, og `start-dyrepatruljen` kom én gang, også etter bytte av verden. Navnene er godkjente og uten fritekst. Versjonshendelsen mangler (se ST1), og milepælene er ikke observert.
- **ST7:** Følger av ST1, ST2 og ST4. Spillet har ikke godkjent statistikk.
- **ST8:** `test/statistikk/` finnes ikke, så kontrollen kan ikke utføres.

## Anbefalte forbedringer
- **ENDRINGSLOGG (K3):**
  - Raden sier at «Even har testet og godkjent piloten, og Ivar har godkjent publisering». Det kan jeg ikke bekrefte, og denne rapporten er ingen godkjenning.
  - Kolonnen «Kan påvirke» nevner at «Startknappen» har fått ny plassering. `#startBtn` og CSS-en for den er uendret i diffen. Trolig menes ☰. Rett ordlyden.
  - «Statistikk er uendret» stemmer, men ST-avvikene over følger med uendret.
- **`kjor.mjs`:** Kvitteringen viser `arbeidstre=rent` og `commit=ukjent` når den kjøres utenfor et git-repo (sett i mutasjonskopien). Det er ikke nytt (fila er uendret mot `main`), men «rent» bør bli «ukjent».
- **Fra forrige rapport, uendret:**
  - B → Esc gir fokus på BODY.
  - Meny › Velg verden gir fokus på BODY, og Esc går til startkortet.
  - Lukk nederst i dyreboka (y≈3259) må rulles inn i bildet.
  - Start er under bretten i liggende format (y 401–461) og i 320×568 (y 642–700).
  - Kommentaren i `evn-meny-1.0.js` sier fortsatt «KM1–KM12». I `test/index.html` er den rettet til KM1–KM13.

## Kontroller som ikke kunne utføres
- **T1, KM1, KM5, KM6, KS13 (E):** Ekte berøring, nettbrett og safe area på telefon med hakk er ikke testet. Målene er bare fra emulering.
- **T3 (E):** `prefers-reduced-motion` er bare kodelest (`animation:none` for Start og menykort), ikke emulert.
- **T4:** Kontrast er ikke målt. Informasjonen formidles med tekst og ikon, ikke bare farge, men det er bare vurdert ut fra skjermbilder.
- **U2, U3, KM3, KM5, KM10 (V):** Even må selv vise at han forstår menyen, styringshjelpen og Velg verden.
- **Y1:** Det er ikke valgt referansemobil, og bildefrekvensen kan ikke måles med SwiftShader.
- **Y2:** Pause ved fanebytte er bare kodelest (uendret v2-kode).
- **B1 (E):** Om lyden faktisk høres, er ikke kontrollert.
- **B3:**
  - Testet uten WebGL: meldingen «Dette spillet trenger 3D …» vises, og knappen viser «3D virker ikke her». Det ga ingen konsollfeil.
  - Lavere grafikk på svake enheter krever test på enhet (E), så kravet er ikke fullt kontrollert.
- **S4:** Personvernsiden er ikke gjennomgått. Den er uendret, og diffen endrer ikke hva som samles inn.
- **ST4, ST5 og ST8 (milepæler):** Uten `test/statistikk/` er milepælene og feilhendelsene ikke kjørt. Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **UI1–UI10, UI8a–c:** Ikke kontrollert. Kravene er godkjent hovedløsning og ikke tatt i bruk for Dyrepatruljen.
- **B4–B7:** Gjelder ikke for spillet.
- **Grunnlag:** Agentversjonen avviker fra repoet, se «Testet».

## Klar for testing hos Even?
JA MED FORBEHOLD – Jeg fant ingen kritiske feil. F1, fokus og meny er kjørt på denne committen med ekte taster, og testendringene svekker ingen eksisterende kontroll. Forbeholdene:
- Grunnlaget avviker fra repoet: agent 2.3 fra `/home/claude/evnstudio`, mens piloten har 2.2.
- Ingenting er testet på ekte enhet.
- De kjente avvikene F3, K2 og ST1/ST2/ST4/ST7/ST8 er fortsatt åpne og bør avklares av en voksen før publisering.

Filer: `/tmp/qa-2472c-kjor.txt` (utskrift fra testsuiten), `/tmp/qa-2472c/` (skript t1–t6 og `skjerm/`), `/home/claude/pilot/qa/rapporter/2026-11-07-dyrepatruljen-4d627da.md` (forrige rapport).
