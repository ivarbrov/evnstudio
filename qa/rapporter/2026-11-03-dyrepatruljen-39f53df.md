# EVN Game QA: Dyrepatruljen 0.11.1 (ny kontroll etter retting)
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1, og S2 etter 1.2a) (55d5794116fb74ae842b6d60fed4e7b160157472), commit 39f53df4f97abe6a69e153ffb28fa80ce409df54 (HEAD er b81b6b2, som bare legger til QA-rapporten i `qa/rapporter/`, kontrollert med `git diff 39f53df HEAD --stat`)
Testkvittering: evn1 commit=39f53df4f97abe6a69e153ffb28fa80ce409df54 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert, og dette er en ny kontroll etter retting. Rettingen endrer når ferdigkortet vises og fokusregelen i `visLag`.
Testet: Testsuiten ble ikke kjørt på nytt. Resultatet er hentet fra `/home/claude/kvitt/test-dyre.txt`: 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3) og 2 ikke innført. Alle nettlesertestene er kjørt på nytt mot koden i 39f53df, og ingen resultater fra eb62180 er brukt.
- **Miljø:** Linux-container med 2 kjerner og last mellom 2 og 5. Bildefrekvensen var lav, så W flyttet helten 0,28–0,55 enheter.
- **Nettleser:** Playwright 1.63 med Chromium headless shell 1243 og SwiftShader-WebGL, `reducedMotion: 'reduce'`.
- **Server:** En egen Node-server på 127.0.0.1:8721 serverte repoets rot, 0.11.0 fra `main` på samme origin (`/gammel/`, byte for byte lik `git show main:…`) og en sti utenfor `/spill/` (`/annen/dyre/`). Serveren ble startet på nytt etter omstarten og er stoppet. Porten svarer ikke.
- **PC:** 1280×800 med ekte tastetrykk og musklikk.
- **Mobil:** Bare emulert, i 375×812, 812×375, 740×360, 320×568 og 568×320. Knapper ble trykket med `tap` og `touchscreen.tap`, og styrespaken ble testet med CDP-berøring.
- **Safe area:** Simulert med CDP `Emulation.setSafeAreaInsetsOverride` (0/47/47/21 og 47/0/0/34).
- **Statistikk:** evnstudio.no ble rutet lokalt, og gc.zgo.at ble stubbet. Ingen tellinger ble sendt.
- **Testoppsett:** Testkroken `__dyrespill.fang`. Det tiende dyret i F1 ble fanget med et ekte mellomrom.

Skript og utskrifter ligger i `/tmp/qa-dyre/`. Repoet er ikke endret (`git status` er tom).

## Oppfylte krav
- **Rettet: pausen var umulig å trykke når ferdigkortet kom (eb62180).**
  - **PC:** P rett etter det tiende dyret og 2,5 s venting ga ikke ferdigkort. Pausen var aktiv med fokus på Fortsett, og ferdigkortet lå blant de `inert` elementene. Et ekte musklikk på Fortsett lukket pausen. Deretter kom ferdigkortet med fokus på «Til dyreparken», Tab gikk rundt mellom de to knappene, og 11 elementer var `inert`. Esc gikk til verdensvalget, og etterpå var 0 elementer `inert`.
  - **Esc i stedet for Fortsett:** Gir samme resultat.
  - **Mobil 375×812:** Blur ga pause, og 2,2 s senere var det ikke kommet noe ferdigkort. Et trykk på Fortsett traff `evnPauseFortsett` og lukket pausen. Deretter kom ferdigkortet, og «Velg verden» gikk til verdensvalget uten `inert` elementer.
  - **Kartet (M):** Ferdigkortet venter til kartet er lukket. Da får det fokus, og 11 elementer er `inert`.
- **Rettet: Tab gikk ut av ferdigkortet når dyreboka var åpen.** B rett etter det tiende dyret og 2,5 s venting: dyreboka står åpen, og Tab går rundt i den. Esc lukker boka, og ferdigkortet kommer med fokus på «Til dyreparken». Tab og Shift+Tab holder seg mellom de to knappene, og 11 elementer er `inert`. Esc går til verdensvalget.
- **Rettet: Esc holdt nede.** Esc med to gjentak på ferdigkortet går bare til verdensvalget. Et nytt Esc med gjentak går bare ett steg videre, til startkortet.
- **Rettet: `#beskjed` og safe area.** I 375×812 med 47 px innfelling ligger meldingen på y 171–209, under den andre HUD-raden (🗺️ ⏸ ✕, y 113–161). Før lå den på y 124–162. Uten innfelling er plasseringen som før (124).
- **Rettet: «← Tilbake» og «🚪 Avslutt» øverst.** Knappene ligger over verdenene og innenfor skjermen uten rulling i alle seks størrelsene, på y 149–197 (i 320×568 ligger Avslutt på y 221–269). På PC ligger de på y 231–279, og den første verdenen starter på y 301. Tab-rekkefølgen er Tilbake → Avslutt → Gata → Dyreparken → Dyreboka.
- **Rettet: presiseringen i endringsloggen.** Raden sier «Avslutt bare på nettstedet, som de andre Avslutt-knappene» og nevner ventingen på dialoger og meldingene. Påstanden om at ferdigkortet holder fokus og Tab inne, holder ikke etter «Vil du avslutte?» → Nei, se avvik.
- **Resten av endringene virker fortsatt:**
  - **Tilbake og Esc i verdensvalget:** Går til startkortet med fokus på Start.
  - **Avslutt fra verdensvalget:** Spørsmålet åpnes med fokus på Nei, og Tab går rundt i det. Esc og Nei beholder verdensvalget uten `inert` elementer, og Ja går til `/`.
  - **Utenfor `/spill/`:** Bare Tilbake vises.
  - **Startkortet og pausen:** Startkortet nevner C, B og P, og C slår Snik av og på. Pausehjelpen er riktig.
  - **Safe area:** HUD, styrespak, Håv/Snik, PC-knapper, tips og overlegg flytter seg med innfellingen. Ingen trykkflate ligger utenfor det trygge området, og det er ingen sideveis rulling.
- **F1:**
  - **Start og bevegelse:** Start → verdensvalget → Gata virker, og W flytter helten.
  - **Fangst:** Et ekte mellomrom fanget det tiende dyret.
  - **Fullføring:** Ferdigkortet virker på vanlig vei, og Byen låses opp.
  - **Pause:** P, Esc, ⏸ og blur åpner pausen, og P, Esc og Fortsett lukker den.
  - **Dyreparken:** Virker med P.
  - **Avslutning:** Virker.
  - **Mobil:** Alt dette virker i alle fem mobilstørrelsene.
  - **Røyktesten:** OK.
  - **Ferdigkortet kommer bare litt senere:** Etter det tiende dyret uten åpen dialog kom kortet etter 5,3 s, målt i veggklokke på en belastet maskin. Koden venter 1,3 s og sjekker deretter hvert 300. ms.
- **F2:** Fremgangen er lik etter omlasting. Nullstillingen starter med fokus på Nei, og Esc beholder alt. Ja sletter `evn-dyrespillet-v1` og beholder lydvalget og spilletiden.
- **F3 (del):**
  - **Fra 0.11.0:** Lagring med 3 dyr leses uendret, det er 7 dyr igjen, og ny fangst legges til. Gata fullført i 0.11.0 gir 2 åpne verdener.
  - **Ødelagt lagring som virker:** Ugyldig JSON, `null`, `[]`, `{"v":1}` og `v:2`.
- **U1:** Startkortet har EVN-merke, mål, styring, Start, vei tilbake og «Versjon 0.11.1».
- **U2 og U3 (Q-delen):** Styringen står på startkortet og i pausen. Veien ut av verdensvalget er nå det første barnet ser.
- **T1 (A-delen, emulert):** Ingen knapp i verdensvalget er under 44×44 i noen av de fem størrelsene. Tilbake er 117×48 og Avslutt 120×48, med 16–24 px mellomrom. Ferdigknappene er 254×58 og 158×48.
- **T3:** Den statiske testen gir OK (`viewport-fit=cover`, zoom er ikke sperret). Med `reduce` var Start stabil.
- **K1:** 0 ufangede feil, 0 konsollfeil, 0 svar ≥ 400 og 0 eksterne forespørsler under normal bruk.
- **K3:** «Versjon 0.11.1» står på startkortet og `VERSJON = 'v0.11.1'` i koden. Endringsloggen har én rad for versjonen.
- **S1:** Den statiske testen gir OK. CSP er uendret, og det er ingen nye domener.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. Ingen informasjonskapsler.
- **S3:** Spillet har ingen fritekst.
- **S4:** Personvernsiden er uendret og stemmer.
- **B1:** L gir 🔇 og lagrer «av». Valget huskes fra 0.11.0.
- **B2:** M viser «🔴 Du er her · 🏙️ Gata». Helten står stille med kartet åpent.
- **B3 (oppstartsdelen):** Uten WebGL kommer en melding med `role="alert"`, Start er slått av, og det er 0 sidefeil.
- **ST3:** Ingen forespørsler gikk ut fra 127.0.0.1.
- **ST5:** Det ble ingen hendelse før Start. Etter Start → Esc → Start → Tilbake → Start ble det nøyaktig én `start-dyrepatruljen`.
- **ST6:** Ingen informasjonskapsler, og ingen ID i koden.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **T2, verifisert feil (ny i rettingen): ferdigkortet holder ikke fokus etter «Vil du avslutte?» → Nei.**
  - **Gjenskap:** Fang det tiende dyret, trykk P og velg Avslutt i pausen. Vent til ferdigkortet skulle ha kommet (ferdigkortet venter som det skal). Klikk «Nei, spill videre», eller trykk Enter på Nei.
  - **Resultat (4 av 4 forsøk):** Ferdigkortet kommer, men `tilstand` er `spill`, 0 elementer er `inert`, og W flytter helten bak kortet (0,28). Esc åpner pausen i stedet for å gå til verdensvalget.
  - **Esc på Nei er riktig:** `tilstand` er `pause`, 11 elementer er `inert`, og Esc går til verdensvalget.
  - **Sannsynlig årsak (kodelest):** Klikk-handleren på `#evnBli` skjuler spørsmålet med en gang, mens pausens `nei()` kjører i `setTimeout(…, 0)`. Ferdigkortet rekker å vises i mellomtiden. Deretter setter `nei()` `settInert(null)` og `tilstand = evnFra`.
  - **Hvorfor ikke kritisk:** Spillet henger ikke. Ferdigkortets knapper virker, og pausen virker.
- **F3, verifisert feil (kjent, uendret):** `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget kan ikke brukes. `{"gata":5}` gir «reddet.includes is not a function», og verdenen starter ikke. Gjenskap: legg verdien i `evn-dyrespillet-v1`, last på nytt, trykk Start og så Gata.
- **K2, verifisert feil (kjent funn for alle spill):** En feil kastet under spilling gir ingen melding og ingen «Last inn på nytt».
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke.
- **ST1, avvik (kjent, uendret):** `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start`, og starten telles ved klikk på `#startBtn`.
- **ST2, avvik (kjent, uendret):** `EVNAktivTid` finnes ikke. Den gamle tidtakingen teller synlig tid, også på startkortet og i verdensvalget.
- **ST4, avvik (kjent, uendret):** Det finnes ingen hendelser `feil-dyrepatruljen-oppstart` eller `feil-dyrepatruljen-spill`.
- **ST7, avvik (kjent, uendret):** Spillet har ikke godkjent statistikk etter 1.1. Det mangler også `versjon-dyrepatruljen-0.11.1`, verifisert.
- **ST8, kjent:** `test/statistikk/` finnes verken på grenen eller på `main` (`statistikk=ikke-innfort`).
- **Standardens oversikt, mulig problem (kjent):** Dyrepatruljen står ikke i «Hvilke krav gjelder for hvert spill».

## Anbefalte forbedringer
- **Rett Nei-banen:** La ferdigkortet vente til pausen har fullført `nei()`, for eksempel ved å sjekke pausens egen tilstand. Eller la `visLag('ferdig')` kjøre etter `cfg.fortsett`.
- **Fokus etter «Vil du avslutte?» (ikke rettet):** Når spørsmålet lukkes med Esc eller Nei i verdensvalget, havner fokus fortsatt på BODY. Sett fokus tilbake på «🚪 Avslutt».
- **Ferdigkortet i lave vinduer (ikke rettet):** «Velg verden» slutter på y = 363 i 568×320 og 740×360, altså under bretten.
- **Disse forslagene fra før gjelder fortsatt:**
  - Validering i `lastInn()` (F3) og en global feilfanger (K2).
  - Håndtering av `webglcontextlost`.
  - Overlapp mellom styrespak og Snik i 320×568 (fortsatt målt overlapp).

## Kontroller som ikke kunne utføres
- **Y1 (E):** Referansemobil er ikke valgt, og jeg har ingen ekte enhet. SwiftShader på en belastet maskin sier ingenting om bildefrekvens.
- **Y2:** Fanebytte er bare simulert med blur. At hastigheten er uavhengig av skjermfrekvensen, er bare kodelest.
- **T1, T3, B1 og B3 (E):**
  - **Berøring:** Ingen ekte mobil. Emulering og CDP-berøring er ikke ekte berøring.
  - **Safe area:** Bare simulert, ikke testet på en iPhone med hakk eller hjemlinje.
  - **Lyd:** Lyden er ikke hørt.
  - **Grafikk:** Lavere grafikk på svake enheter er ikke målt.
- **T3, `prefers-reduced-motion` uten reduce:** Ikke testet denne gangen.
- **T4:** Kontrasten er ikke målt (kun kodelest). Ingen fargeendringer i diffen.
- **U2 og U3 (V):** Om barnet finner og forstår «← Tilbake», «🚪 Avslutt» og «🌍 Velg verden», og om ventingen på ferdigkortet føles naturlig, må Even vurdere.
- **ST2 og milepæler:** Ikke testet, fordi `test/statistikk/` ikke finnes.
- **ST1–ST8 etter publisering:** Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **B4, B5, B6 og B7:** Gjelder ikke. Spillet har ikke kamp eller skrekk, ikke læringsinnhold med fakta, ingen app-installasjon og ingen fritekst. B1, B2 og B3 gjelder etter koden. Dette må en voksen bekrefte i oversikten.
- **UI1–UI10 og UI8a–c:** Status er godkjent hovedløsning, og kravene er ikke tatt i bruk for Dyrepatruljen. De er ikke kontrollert.
- **Klarspråk:** Status er forslag, så det er ikke kontrollert.
- **«EVN UI-standard 1.0» (KS4, KS7, KS12 i koden):** Dokumentet finnes ikke i `.claude/` i arbeidstreet, og jeg har ikke kontrollert mot det.
- **Mobil-varianten av Nei-banen:** Ikke testet. Funnet er gjenskapt på PC med klikk og Enter.
- **Lange økter og 150 dyr i dyreparken på svake telefoner:** Ikke testet.
- **Testservere:** Serveren min på 127.0.0.1:8721 ble startet og stoppet i hvert skript. Ingen av prosessene mine kjører.

## Klar for testing hos Even?
JA MED FORBEHOLD – Begge regresjonene fra eb62180 er rettet: pausen kan trykkes, og ferdigkortet holder fokus når dyreboka eller kartet var åpent. Esc-gjentak, safe area for meldingen og knappene øverst i verdensvalget er også rettet, og resten av spillet virker som før. Forbehold: én ny bane (Avslutt → Nei med klikk eller Enter) gir ferdigkort uten fokusfelle mens spillet går bak kortet, men spillet henger ikke. I tillegg er det ikke testet på ekte mobil, og de kjente avvikene F3, K2, B3 og ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne.
