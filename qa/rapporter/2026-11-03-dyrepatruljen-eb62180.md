# EVN Game QA: Dyrepatruljen 0.11.1
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1, og S2 etter 1.2a) (55d5794116fb74ae842b6d60fed4e7b160157472), commit eb6218097fb4bdb476403b982d5d8f4c4eae814c
Testkvittering: evn1 commit=eb6218097fb4bdb476403b982d5d8f4c4eae814c tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert. Endringen gjelder også fokushåndteringen (`EVNPauseInert`) på ferdigkortet og tastaturbanene i verdensvalget.
Testet: Testsuiten ble ikke kjørt på nytt. Resultatet er hentet fra `/home/claude/kvitt/ui-dyrepatruljen-trinn2.txt`: 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3) og 2 ikke innført. Nettlesertestene startet først da `/home/claude/kvitt/FERDIG` fantes.
- **Miljø:** Linux-container med 2 kjerner. Andre agenter kjørte samtidig, så lasten lå mellom 7 og 12. Bildefrekvensen var derfor svært lav (W flyttet helten 0,28 enheter på 1,5 s).
- **Nettleser:** Playwright 1.63 med Chromium headless shell 1243 og SwiftShader-WebGL, `reducedMotion: 'reduce'`.
- **Server:** En egen Node-server på 127.0.0.1:8711 serverte repoets rot, 0.11.0 fra `main` (`git archive` til `/tmp/qa-dyre/main`, servert under `/gammel/`, samme origin) og en sti utenfor `/spill/` (`/annen/dyre/`). Serveren er stoppet.
- **PC:** 1280×800 med ekte tastetrykk og musklikk fra Playwright.
- **Mobil:** Bare emulert (`isMobile`, `hasTouch`) i 375×812, 812×375, 740×360, 320×568 og 568×320. Knapper ble trykket med `tap`, og styrespaken ble testet med CDP `Input.dispatchTouchEvent`.
- **Safe area:** Simulert med CDP `Emulation.setSafeAreaInsetsOverride` (0/47/47/21 og 47/0/0/34) og sammenlignet med kjøring uten innfelling.
- **Lagring:** Lagring fra forrige versjon ble laget ved å spille 0.11.0. Ødelagt lagring ble testet med 7 varianter.
- **Statistikk:** evnstudio.no ble rutet til arbeidstreet, og gc.zgo.at ble stubbet. Ingen tellinger ble sendt.
- **Testoppsett:** Testkroken `__dyrespill.fang`. Det tiende dyret i F1 ble fanget med et ekte mellomrom.

Skript og utskrifter ligger i `/tmp/qa-dyre/`. Repoet er ikke endret (`git status` er tom).

## Oppfylte krav
- **Endringene som er beskrevet:**
  - **Verdensvalget:** «← Tilbake» og «🚪 Avslutt» vises under `/spill/`. Utenfor `/spill/` vises bare Tilbake.
  - **Esc og Tilbake i verdensvalget:** Begge går til startkortet (`tilstand` = start, fokus på Start). Esc på startkortet gjør ingenting.
  - **Avslutt i verdensvalget:** Avslutt åpner «Vil du avslutte?» med fokus på Nei, og Tab går rundt mellom Nei og Ja. Esc og Nei lukker spørsmålet og lar verdensvalget stå. Ingen elementer blir `inert`, og pausen åpnes ikke. Ja går til `/`.
  - **Ferdigkortet, vanlig vei:** Fokus starter på «Til dyreparken», og Tab og Shift+Tab går rundt mellom de to knappene. Alt annet er `inert`, og P åpner ikke pausen. Esc og «🌍 Velg verden» går til verdensvalget, der Byen er åpen (2 verdener, «10 av 150»). Etterpå er ingenting `inert`.
  - **Startkortet:** Det nevner C, B og P. C slår Snik av og på.
  - **Pausen:** «Slik styrer du» viser B én gang og har M til slutt.
- **Safe area:**
  - **Viewport:** `viewport-fit=cover` er satt, og `env()` gir 47/21 og 47/34 px.
  - **HUD, styrespak og knapper:** HUD-raden (med ⏸, 🗺️ og ✕), styrespaken, Håv og Snik flytter seg nøyaktig med innfellingen i 812×375 og 375×812. På PC 1280×800 gjelder det samme for PC-knappene og tips. Ingen trykkflate ligger utenfor det trygge området.
  - **Overlegg:** Polstringen på `.lag` blir 47/21 (liggende) og 47/34 (stående).
  - **Rulling:** Ingen sideveis rulling.
- **F1:**
  - **Start og verden:** Start → verdensvalget → Gata virker.
  - **Bevegelse og fangst:** W flytter helten. Et ekte mellomrom fanget det tiende dyret, og ferdigkortet kom.
  - **Pause:** P, Esc, ⏸ og blur åpner pausen, og P, Esc og Fortsett lukker den.
  - **Dyreparken:** Virker med P.
  - **Avslutning:** Avslutt fra verdensvalget virker.
  - **Mobil:** I alle fem mobilstørrelsene virker Start, Tilbake, Avslutt/Nei, Gata, styrespaken, fullføring og «Velg verden».
  - **Røyktesten:** OK.
  - Unntaket er F5-banen under avvik.
- **F2:** Fremgangen er lik etter omlasting (4 dyr). «Start helt på nytt» starter med fokus på Nei, og Esc beholder alt. Ja sletter `evn-dyrespillet-v1` og beholder lydvalget og spilletiden.
- **F3 (del):**
  - **Fra 0.11.0:** Lagring med 3 dyr leses uendret, og det er 7 dyr igjen i Gata. Ny fangst legges til, og lydvalget «av» følger med. Gata fullført i 0.11.0 gir Byen åpen i 0.11.1.
  - **Ødelagt lagring som virker:** Ugyldig JSON, `null`, `[]`, `{"v":1}` og `v:2`.
- **U1:** Startkortet har EVN-merke, mål, styring, Start, «← Tilbake til EVN Studio» og «Versjon 0.11.1».
- **U2 og U3 (Q-delen):** Styringen står på startkortet og i pausen. Knappeteksten er nå «🌍 Velg verden», som er tydeligere enn før.
- **T1 (A-delen, emulert):** Alle knapper i verdensvalget er minst 44×44 i alle fem størrelsene (Tilbake er 117×48, Avslutt 120×48, 16–24 px mellomrom). Ferdigknappene er 254×58 og 158×48.
- **T2 (unntatt F4-banen):** Ferdigkortet, «Vil du avslutte?», pausen, dyreboka (fokus på ✕) og nullstillingen holder fokus. Etter lukking er ingenting `inert`.
- **T3:** Den statiske testen gir OK (zoom er ikke sperret). Med `reduce` var Start stabil.
- **K1:** 0 ufangede feil, 0 konsollfeil, 0 svar ≥ 400 og 0 eksterne forespørsler under normal bruk i alle kjøringene.
- **K3:** «Versjon 0.11.1» står på startkortet og `VERSJON = 'v0.11.1'` i koden. ENDRINGSLOGG har én ny rad, og den stemmer med det som er målt, unntatt det som står under F4/F5 og Avslutt-presiseringen under forbedringer.
- **S1:** Den statiske testen gir OK, og CSP er uendret. Ingen nye domener.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. `document.cookie` er tom.
- **S3:** Spillet har ingen fritekst.
- **S4:** Personvernsiden er uendret og stemmer: fremgangen ligger lokalt.
- **B1:** L gir 🔇 og lagrer «av». Valget huskes fra 0.11.0 til 0.11.1.
- **B2:** M viser «🔴 Du er her · 🏙️ Gata». Helten står stille (0,000) med kartet åpent.
- **B3 (oppstartsdelen):** Uten WebGL kommer en melding med `role="alert"`, Start er slått av («3D virker ikke her»), og det er ingen ufangede feil.
- **ST3:** Ingen forespørsler gikk ut fra 127.0.0.1 (`statistikk.js` linje 22).
- **ST5:** Det ble ingen hendelse før Start. Etter Start → Esc → Start → Tilbake → Start ble det nøyaktig én `start-dyrepatruljen`. Den nye veien tilbake til startkortet gir altså ingen doble starter.
- **ST6:** Ingen informasjonskapsler, og ingen ID i koden.

## Kritiske feil som må rettes
Ingen funnet i det som er testet. F5-banen under er nær grensen. Jeg har ikke klassifisert den som kritisk fordi spilleren fortsatt kommer videre, men den bør rettes før publisering.

## Andre avvik fra felles standard
- **F1/T2, verifisert feil (ny i 0.11.1, regresjon fra 0.11.0): pausen virker ikke hvis den er åpen når ferdigkortet kommer.**
  - **Gjenskap:** Fang det tiende dyret og åpne pausen innen 1,3 s med P, ⏸ eller blur/appbytte.
  - **Resultat:** `visLag('ferdig')` gjør pausedialogen `inert`. Fortsett, «Slik styrer du» og Avslutt reagerer ikke på klikk eller trykk. I 375×812 treffer et trykk på Fortsett `#ferdigTekst` bak pausen.
  - **0.11.0 til sammenligning:** Fortsett virker.
  - **Hvorfor ikke kritisk:** Barnet kommer bare videre ved å trykke «blindt» på ferdigknappene bak den uskarpe pausen, eller med Esc/P på PC.
  - **Kjent fra før:** Esc/P gir `tilstand = 'spill'` mens ferdigkortet vises, og helten kan da flyttes bak kortet (0,28). Dette skjer også i 0.11.0.
- **T2, verifisert feil (påstanden i endringsloggen holder ikke i denne banen):** Ferdigkortet holder ikke fokus hvis dyreboka var åpen.
  - **Gjenskap:** Fang det tiende dyret og trykk B innen 1,3 s.
  - **Resultat:** Når ferdigkortet kommer, er ingenting `inert`, og Tab går Velg verden → BODY → 🔊 → 📖 i HUD-en bak kortet. Enter på 📖 åpner dyreboka over ferdigkortet. Lukkes den, ender spillet i verdensvalget med `tilstand = 'pause'`.
  - **Årsak (kodelest):** I `visLag` kjører `EVNPauseInert(null)` for dyreboka etter at ferdigkortet er gjort `inert`.
- **F3, verifisert feil (kjent, uendret):** `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget kan ikke brukes. `{"gata":5}` gir «reddet.includes is not a function», og verdenen starter ikke. Gjenskap: legg verdien i `evn-dyrespillet-v1`, last på nytt, trykk Start og så Gata.
- **K2, verifisert feil (kjent funn for alle spill):** En feil kastet under spilling ga ingen melding og ingen «Last inn på nytt».
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke.
- **ST1, ST2, ST4, ST7 og ST8, avvik (felles, kjent og uendret):**
  - `statistikk.js` lastes nederst i `<body>` med `defer`.
  - Spillet sender ikke `evn-start`, og det kommer ingen `versjon-dyrepatruljen-0.11.1` (verifisert).
  - `EVNAktivTid` og feilhendelser finnes ikke.
  - ST8 er kjent: `test/statistikk/` finnes verken på grenen eller på `main` (`statistikk=ikke-innfort`).
- **Standardens oversikt, mulig problem (kjent):** Dyrepatruljen står ikke i «Hvilke krav gjelder for hvert spill».

## Anbefalte forbedringer
- **Rett de to banene i `visLag`:**
  - Fjern dyrebokas fokusregel før ferdigkortet gjøres `inert`.
  - Vis ikke ferdigkortet mens pausen eller kartet er åpent. Lukk dem først, eller vent til de er lukket.
- **Esc holdt nede:** Esc har ikke `!e.repeat`, så Esc holdt nede på ferdigkortet hopper rett til startkortet (verifisert).
- **Fokus etter «Vil du avslutte?»:** Når spørsmålet lukkes med Esc eller Nei i verdensvalget, havner fokus på BODY. Sett fokus tilbake på «🚪 Avslutt».
- **`#beskjed` og safe area:** `#beskjed` (top: 70px) har ikke fått safe area. I 375×812 med 47 px innfelling overlapper meldingen den andre HUD-raden (🗺️ ⏸ ✕, y 113–161). Uten innfelling overlapper den ikke. Meldingen tar ikke imot trykk, men den dekker knappene visuelt.
- **Tilbake og Avslutt nederst:** I verdensvalget ligger Tilbake og Avslutt under de 15 verdenene. De er under bretten i alle mobilstørrelsene (y = 543 i liggende format, y = 815 i 375×812), så barnet må rulle for å finne veien ut.
- **Ferdigkortet i lave vinduer:** «Velg verden» slutter på y = 363 i 568×320 og 740×360, altså under bretten. Det er ikke sammenlignet med 0.11.0.
- **Presisering i endringsloggen:** Det står at Avslutt bare vises «på evnstudio.no», men koden viser knappen under alle stier med `/spill/`, også lokalt.
- **Disse forslagene fra før gjelder fortsatt:**
  - Validering i `lastInn()` (F3) og en global feilfanger (K2).
  - Håndtering av `webglcontextlost`.
  - Overlapp mellom styrespak og Snik i 320×568 (målt med rektangler, fortsatt overlapp).

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og jeg har ingen ekte enhet. SwiftShader på en maskin med høy last sier ingenting om bildefrekvens.
- **Y2:** Fanebytte er bare simulert med blur, og da åpnes pausen. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest.
- **T1, T3, B1 og B3 (E):**
  - **Berøring:** Ingen ekte mobil. Emulering, `tap` og CDP-berøring er ikke ekte berøring.
  - **Safe area:** Bare simulert med CDP, ikke testet på en iPhone med hakk eller hjemlinje.
  - **Lyd:** Lyden er ikke hørt.
  - **Grafikk:** Lavere grafikk på svake enheter er ikke målt.
- **T3, `prefers-reduced-motion` uten reduce:** Ikke testet denne gangen.
- **T4:** Kontrasten er ikke målt (kun kodelest). Ingen fargeendringer i diffen.
- **U2 og U3 (V):** Om «🌍 Velg verden», «← Tilbake» og «🚪 Avslutt» er lette å forstå for barnet, må Even vurdere.
- **ST2 og milepæler:** Ikke testet, fordi `test/statistikk/` ikke finnes.
- **ST1–ST8 etter publisering:** Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **B4, B5, B6 og B7:** Gjelder ikke. Spillet har ikke kamp eller skrekk, ikke læringsinnhold med fakta, ingen app-installasjon og ingen fritekst. B1, B2 og B3 gjelder etter koden. Dette må en voksen bekrefte i oversikten.
- **UI1–UI10 og UI8a–c:** Status er godkjent hovedløsning, og kravene er ikke tatt i bruk for Dyrepatruljen. De er ikke kontrollert. Safe area er bare kontrollert mot utviklerens beskrivelse.
- **Klarspråk:** Status er forslag, så det er ikke kontrollert.
- **«EVN UI-standard 1.0» (KS4, KS7, KS12 i kodekommentarene):** Dokumentet finnes ikke i `.claude/` i dette arbeidstreet. Jeg har ikke kontrollert mot det, bare mot `.claude/evn-game-standard.md` og utviklerens beskrivelse.
- **Lange økter og 150 dyr i dyreparken på svake telefoner:** Ikke testet.
- **Testservere:** Serveren min på 127.0.0.1:8711 ble startet og stoppet i hvert skript, og porten er lukket. Andre Chromium-prosesser på maskinen tilhører andre agenter og er ikke rørt.

## Klar for testing hos Even?
JA MED FORBEHOLD – De nye veiene ut av verdensvalget, Esc, ferdigkortet på vanlig vei og safe area virker på PC og i emulert mobil. Lagring fra 0.11.0 virker, og det er ingen konsollfeil. Forbehold: to baner bryter med T2/F1 når pausen eller dyreboka er åpen akkurat når ferdigkortet kommer, og pausen kan da ikke trykkes. Disse bør rettes før publisering. I tillegg er det ikke testet på ekte mobil, og de kjente avvikene F3, K2, B3, ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne.
