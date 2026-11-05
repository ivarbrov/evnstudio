# EVN Game QA: Dyrepatruljen 0.11.1 (ny kontroll etter retting, runde 3)
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1, og S2 etter 1.2a) (55d5794116fb74ae842b6d60fed4e7b160157472), commit 6dd390869baafeb7ba32c0187f9f8c567ad06ddb (HEAD er 65af705, som bare legger til QA-rapporten i `qa/rapporter/`, kontrollert med `git diff 6dd3908 HEAD --stat`)
Testkvittering: evn1 commit=6dd390869baafeb7ba32c0187f9f8c567ad06ddb tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert, og dette er en ny kontroll etter retting. Rettingen endrer når ferdigkortet vises: koden venter nå til ingen dialog har vært åpen i to sjekker på rad, med 150 ms mellom dem.
Testet: Testsuiten ble ikke kjørt på nytt. Resultatet er hentet fra `/home/claude/kvitt/test-dyre-3.txt`: 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3) og 2 ikke innført. Alle nettlesertestene er kjørt på nytt mot koden i 6dd3908, og ingen resultater fra 39f53df eller eb62180 er brukt.
- **Miljø:** Linux-container med 2 kjerner og last mellom 7 og 8. Bildefrekvensen var lav.
- **Nettleser:** Playwright 1.63 med Chromium headless shell 1243 og SwiftShader-WebGL, `reducedMotion: 'reduce'`.
- **Server:** En egen Node-server på 127.0.0.1:8721 serverte repoets rot, 0.11.0 fra `main` på samme origin (`/gammel/`) og en sti utenfor `/spill/`. Serveren er stoppet, og porten svarer ikke.
- **PC:** 1280×800 med ekte tastetrykk og musklikk.
- **Mobil:** Bare emulert, i 375×812, 812×375, 740×360, 320×568 og 568×320. Knapper ble trykket med `tap`, og styrespaken ble testet med CDP-berøring.
- **Safe area:** Simulert med CDP `Emulation.setSafeAreaInsetsOverride`.
- **Statistikk:** evnstudio.no ble rutet lokalt, og gc.zgo.at ble stubbet. Ingen tellinger ble sendt.
- **Testoppsett:** Testkroken `__dyrespill.fang`. I mobiltesten av Nei-banen ble ⏸ åpnet med `click()` i samme skrittet som fangsten, fordi den belastede maskinen ellers rakk å vise ferdigkortet først. Avslutt og Nei ble trykket med ekte `tap`.

Skript og utskrifter ligger i `/tmp/qa-dyre/` (`r3-*.out`). Repoet er ikke endret (`git status` er tom).

## Oppfylte krav
- **Rettet: Nei-banen.** Fang det tiende dyret, åpne pausen, velg Avslutt og vent 2 s. Ferdigkortet vises ikke mens spørsmålet er åpent. Etter Nei kommer ferdigkortet med `tilstand = 'pause'`, 11 elementer `inert` og fokus på «Til dyreparken».
  - **PC, klikk (5 av 5):** W flytter ikke helten (0,00), og Esc går til verdensvalget uten at pausen åpnes.
  - **PC, Enter på Nei (2 av 2):** Samme resultat.
  - **PC, Esc på Nei (1 av 1):** Samme resultat.
  - **Mobil, `tap` på Nei (375×812, 812×375, 320×568):** Samme resultat. ⏸ er skjult, og styrespaken flytter ikke helten (0,00). «Velg verden» går til verdensvalget, og etterpå er 0 elementer `inert`.
  - **Den samme banen fra verdensvalget:** Også OK. «Vil du avslutte?» lukkes med Esc og Nei, og verdensvalget står igjen uten `inert` elementer.
- **Rettingene fra forrige runde holder fortsatt:**
  - **Pausen åpen når ferdigkortet skal komme:** Ferdigkortet venter i 2,5 s. Et ekte musklikk på Fortsett lukker pausen. Deretter kommer ferdigkortet med fokus, og Tab går rundt i kortet. Esc fra pausen virker på samme måte.
  - **Mobil med blur:** Et trykk på Fortsett treffer `evnPauseFortsett`, og ferdigkortet kommer etterpå.
  - **Dyreboka åpen:** Ferdigkortet venter til boka er lukket. Da kommer det med 11 elementer `inert`, og Tab og Shift+Tab holder seg i kortet.
  - **Kartet (M) åpent:** Ferdigkortet venter til kartet er lukket.
  - **Esc holdt nede:** Esc med gjentak går bare ett steg om gangen: fra ferdigkortet til verdensvalget, og derfra til startkortet.
  - **`#beskjed` og safe area:** I 375×812 med innfelling ligger meldingen på y 171–209, under HUD-raden.
  - **Tilbake og Avslutt i verdensvalget:** Knappene ligger over verdenene og innenfor skjermen i alle seks størrelsene (y 149–197, på PC 231–279). Tab-rekkefølgen er Tilbake → Avslutt → Gata.
- **Endringene fra eb62180 virker fortsatt:**
  - **Tilbake og Esc:** Går til startkortet med fokus på Start.
  - **Avslutt i verdensvalget:** Spørsmålet åpnes med fokus på Nei, og Tab går rundt mellom Nei og Ja. Ja går til `/`.
  - **Utenfor `/spill/`:** Bare Tilbake vises.
  - **Ferdigkortet, vanlig vei:** Fokus og Tab holder seg i kortet, P åpner ikke pausen, og Esc og «Velg verden» går til verdensvalget. Byen låses opp.
  - **Startkortet:** Det nevner C, B og P.
  - **Safe area:** HUD, styrespak og knapper ligger innenfor det trygge området.
- **F1:**
  - **Start og bevegelse:** Start → Gata virker, og W flytter helten (0,55).
  - **Fangst:** Et ekte mellomrom fanget det tiende dyret.
  - **Pause:** P, Esc, ⏸ og blur åpner pausen, og P, Esc og Fortsett lukker den.
  - **Dyreparken:** Virker, også pausen der.
  - **Avslutning:** Virker.
  - **Mobil:** Start, Tilbake, Avslutt/Nei, Gata, styrespak, fullføring og «Velg verden» virker i alle fem mobilstørrelsene.
  - **Røyktesten:** OK.
  - **Tid til ferdigkortet:** Ferdigkortet kom etter 6,4 s, målt i veggklokke på en maskin med last 8. Koden venter 1,3 s og deretter minst 150 ms.
- **F2:** Fremgangen er lik etter omlasting (4 dyr). Nullstillingen starter med fokus på Nei, og Esc beholder alt. Ja sletter `evn-dyrespillet-v1` og beholder lydvalget og spilletiden.
- **F3 (del):**
  - **Fra 0.11.0:** Lagring med 3 dyr leses uendret, og ny fangst legges til. Gata fullført i 0.11.0 gir 2 åpne verdener.
  - **Ødelagt lagring som virker:** Ugyldig JSON, `null`, `[]`, `{"v":1}` og `v:2`.
- **U1:** Startkortet har EVN-merke, mål, styring, Start, vei tilbake og «Versjon 0.11.1».
- **U2 og U3 (Q-delen):** Styringen står på startkortet og i pausen, og veien ut står øverst i verdensvalget.
- **T1 (A-delen, emulert):** Ingen knapp i verdensvalget er under 44×44. Tilbake er 117×48 og Avslutt 120×48, og ferdigknappene er 254×58 og 158×48.
- **T2:** Ferdigkortet holder fokus i alle banene som er testet: vanlig vei, pause, dyrebok, kart og Avslutt → Nei. Det samme gjelder pausen, dyreboka, «Vil du avslutte?» og nullstillingen. Etter lukking er ingenting `inert`.
- **T3:** Den statiske testen gir OK. Med `reduce` var Start stabil.
- **K1:** 0 ufangede feil, 0 konsollfeil, 0 svar ≥ 400 og 0 eksterne forespørsler under normal bruk.
- **K3:** «Versjon 0.11.1» står på startkortet og `VERSJON = 'v0.11.1'` i koden. Endringsloggen har én rad, og den stemmer nå med det som er målt.
- **S1:** Den statiske testen gir OK. CSP er uendret, og det er ingen nye domener.
- **S2:** Ingen konto, chat, reklame eller kjøp med ekte penger. Ingen informasjonskapsler.
- **S3:** Spillet har ingen fritekst.
- **S4:** Personvernsiden er uendret og stemmer.
- **B1:** L gir 🔇 og lagrer «av». Valget huskes fra 0.11.0.
- **B2:** M viser «🔴 Du er her · 🏙️ Gata», og helten står stille (0,000) med kartet åpent.
- **B3 (oppstartsdelen):** Uten WebGL kommer en melding med `role="alert"`, Start er slått av, og det er 0 sidefeil.
- **ST3:** Ingen forespørsler gikk ut fra 127.0.0.1.
- **ST5:** Det ble ingen hendelse før Start. Etter Start → Esc → Start → Tilbake → Start ble det nøyaktig én `start-dyrepatruljen`.
- **ST6:** `document.cookie` er tom, og koden har ingen ID.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **F3, verifisert feil (kjent, uendret):** `{"v":1,"reddet":{"gata":null}}` gir «Cannot read properties of null (reading 'length')», og verdensvalget kan ikke brukes. `{"gata":5}` gir «reddet.includes is not a function», og verdenen starter ikke. Gjenskap: legg verdien i `evn-dyrespillet-v1`, last på nytt, trykk Start og så Gata.
- **K2, verifisert feil (kjent funn for alle spill):** En feil kastet under spilling gir ingen melding og ingen «Last inn på nytt».
- **B3, mulig problem (kjent):** `webglcontextlost` håndteres ikke.
- **ST1, avvik (kjent, uendret):** `statistikk.js` lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start`.
- **ST2, avvik (kjent, uendret):** `EVNAktivTid` finnes ikke. Den gamle tidtakingen teller synlig tid, også utenfor spilling.
- **ST4, avvik (kjent, uendret):** Det finnes ingen hendelser `feil-dyrepatruljen-oppstart` eller `feil-dyrepatruljen-spill`.
- **ST7, avvik (kjent, uendret):** Spillet har ikke godkjent statistikk etter 1.1. Det mangler også `versjon-dyrepatruljen-0.11.1`, verifisert.
- **ST8, kjent:** `test/statistikk/` finnes verken på grenen eller på `main` (`statistikk=ikke-innfort`).
- **Standardens oversikt, mulig problem (kjent):** Dyrepatruljen står ikke i «Hvilke krav gjelder for hvert spill».

## Anbefalte forbedringer
- **Robusthet i rettingen (kodelest):** Rettingen bygger på at pausens `nei()` (`setTimeout` 0) kjører før neste sjekk 150 ms senere. Det holdt i alle 11 forsøkene på en belastet maskin, og timerne kjøres etter forfallstid, så rekkefølgen er sikker. En sjekk av pausens egen tilstand ville likevel gjøre det mindre avhengig av tid.
- **Fokus etter «Vil du avslutte?» (ikke rettet):** Når spørsmålet lukkes med Esc eller Nei i verdensvalget, havner fokus fortsatt på BODY.
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
- **U2 og U3 (V):** Om barnet finner og forstår veien ut, og om ventingen på ferdigkortet føles naturlig, må Even vurdere.
- **ST2 og milepæler:** Ikke testet, fordi `test/statistikk/` ikke finnes.
- **ST1–ST8 etter publisering:** Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **B4, B5, B6 og B7:** Gjelder ikke. Spillet har ikke kamp eller skrekk, ikke læringsinnhold med fakta, ingen app-installasjon og ingen fritekst. B1, B2 og B3 gjelder etter koden. Dette må en voksen bekrefte i oversikten.
- **UI1–UI10 og UI8a–c:** Status er godkjent hovedløsning, og kravene er ikke tatt i bruk for Dyrepatruljen. De er ikke kontrollert.
- **Klarspråk:** Status er forslag, så det er ikke kontrollert.
- **«EVN UI-standard 1.0» (KS4, KS7, KS12 i koden):** Dokumentet finnes ikke i `.claude/` i arbeidstreet, og jeg har ikke kontrollert mot det.
- **Lange økter og 150 dyr i dyreparken på svake telefoner:** Ikke testet.
- **Testservere:** Serveren min på 127.0.0.1:8721 ble startet og stoppet i hvert skript. Ingen av prosessene mine kjører.

## Klar for testing hos Even?
JA MED FORBEHOLD – Nei-banen er rettet på PC (klikk, Enter og Esc) og på emulert mobil (`tap`), og alle rettingene fra forrige runde holder. F1, F2, T2 og det som er endret i 0.11.1, virker uten konsollfeil. Forbehold: det er ikke testet på ekte mobil, og de kjente avvikene F3, K2, B3 og ST1, ST2, ST4, ST7 og ST8 er fortsatt åpne. En voksen må ta stilling til dem før publisering.
