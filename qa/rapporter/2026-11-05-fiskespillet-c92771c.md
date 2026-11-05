# EVN Game QA: Fiskespillet 0.5.4 og forsiden
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit c92771c38f02b37b2896bee02c05d32b13e3d559
Testkvittering: evn1 commit=c92771c38f02b37b2896bee02c05d32b13e3d559 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Versjonen skal publiseres, og spillet er nytt. Felles statistikk.js, forsiden og test/index.html er endret. 0.5.3 (Kraken-sekvensen) og 0.5.4 (rettinger) er ikke kontrollert før. test/kjor.mjs: 98 OK, 0 FEIL, 0 VARSEL, 1 KJENT (Fossil Zoo T3, gjelder ikke dette spillet). Suitene statistikk og ui er ikke innført.
Testet: Lokal python3 http.server på 127.0.0.1:8791. Rot: git archive av c92771c i /home/claude/qa-tmp5/root, med 1882d20 (0.5.2) og 5581f2e (0.3.0) under undermapper på samme opprinnelse. Headless /usr/bin/google-chrome via puppeteer-core, WebGL via SwiftShader (1,5 bilder/s ved Kraken). Spillet er testet i 1280×800 med mus og tastatur. 375×812, 740×360, 320×568 og 568×320 er testet med emulert berøring og DPR 2. Forsiden er testet i 1280×800, 1000×800, 375×812 og 320×568. Metode: ekte tastetrykk og musklikk, touchscreen.tap og fingerdrag via CDP. Fanebytte er gjort ved å bytte til en annen fane. Blur og visibilitychange er syntetiske. Testtilstand er satt med window.__spill og localStorage fra en nøytral side på samme opprinnelse. Statistikk som på evnstudio.no: forespørslene er avskjært og servert fra disk, count.js er byttet med en stubb, og 5-sekundersintervallet er forkortet til 25–50 ms. Hver økt hadde egen profil. Serveren er stoppet, og Chrome er lukket (0 prosesser). git status er tom. Ingen resultater fra tidligere commits er brukt som bevis.

## Oppfylte krav
- **0.5.3 Kraken i båten:**
  - Premien (+10 000) og kraken=true lagres med en gang.
  - Meldingen «Du fikk Kraken! Se, den kommer opp i båten!» har hvit tekst (klassen viktig). Mørk tekst er rettet.
  - Kraken stiger opp, hopper i båten og dykker ned. Sett på skjermbilder.
  - Feiringskortet kommer etterpå med fokus på «Så kult!».
  - Under sekvensen gir piltaster og E ingen bevegelse og ingen ny fisking. Knappen viser «🐙 Wow!» og er slått av.
  - Sekvensen står stille i pause, med kartet åpent og ved fanebytte.
  - Andre gang: «Du fanget Kraken igjen!», uten ny premie.
  - Omlasting midt i sekvensen: fremgang og penger er beholdt, og det kom ingen feil.
- **0.5.4 rettinger:**
  - Fokus etter Start går til lerretet (#c), ikke BODY.
  - Feilkortet holder fokus (Tab og Shift+Tab) etter pause, kart og Avslutt, også når disse lukkes med Esc eller M etter feilen.
  - HUD-knappene overlapper ikke statuspillene i noen av de fem størrelsene. 📖 er 91–95 % synlig, og 🔊 er dekket bare av sin egen beholder.
  - Meldingen legges under statuslinja ved 375 og 320 px bredde.
  - «Start helt på nytt» sletter evn-fiskespillet-v1 og -kopi. Lyd og spilletid blir stående.
  - Testmodus bruker egne nøkler for lyd og spilletid og endrer aldri evn-fiskespillet-v1.
  - Tapt WebGL under spilling gir feilkortet, og «Last på nytt» virker. Se også avviket under.
- **F1:**
  - På PC: kjøring med W og piler, fisking til full båt (5/5 på 38 s), Havna (selg, akvarium, kjøp) og fiskeboka virker.
  - Pause med P, Esc, knapp og Fortsett virker. Båten står stille i pause og med kartet åpent.
  - Avslutt: Nei, Esc og Ja (går til forsiden, lagringen er beholdt).
  - Kraken: fanget med 24–25 trykk. Uten trykk slipper den unna med en melding.
  - På mobil, i fire størrelser: start, styrespak (20–27 enheter flyttet), Havna, bok, kart, pause og Avslutt med Nei virker.
- **F2:** Tilstanden er lik etter omlasting. Nullstilling krever bekreftelse, og Nei og Esc beholder lagringen.
- **F3:**
  - Ekte lagringer fra 0.3.0 og 0.5.2 ble lest uten endring og uten kopi.
  - Ugyldig JSON, v:2 og [] gir kopi. null, tekst, feil typer, 1e400 og båt 1 med for stor plass gir 0 feil og ingen NaN.
- **U1:** Startkortet viser «Versjon 0.5.4», mål, styring og «Tilbake til EVN Studio». Start er synlig og det er ingen sideveis rulling i fem størrelser.
- **U2 og U3 (Q):** Styringshjelpen stemmer for PC og berøring. Kraken-sekvensen er vennlig, og tap er mildt.
- **T1 (emulert):** Ingen knapper under 44×44 i start, spill, Havna, bok, kart, pause, Avslutt, nullstilling og Kraken-kamp (375×812).
- **T2:** Tab holder seg i start, nullstilling, pause, kart, Avslutt, bok og Havna (0 ut). Enter virker på fanene. Unntaket står under avvik.
- **T3:** Viewporten sperrer ikke zoom. Med prefers-reduced-motion er kameraristen 0 (0,054 uten).
- **T4:** Sjeldenheten vises med tekst («Havets konge» og stjerner). Meldingen har hvit tekst på mørk bakgrunn.
- **K1:** 0 sidefeil og 0 svar på 400 eller høyere under vanlig spilling. test/kjor.mjs K1 er OK for alle seks spill.
- **K3:** 0.5.4 står i tittel, startkort og VERSJON. ENDRINGSLOGG.md har rader for 0.5.3, 0.5.4 og publiseringen.
- **S1:** CSP er OK (statisk test). På «evnstudio.no» var count.js den eneste eksterne forespørselen, og det var 0 CSP-brudd på spillet og forsiden.
- **S2 og S3:** Ingen konto, chat, kjøp med ekte penger eller fritekst.
- **S4 (Q):** Personvernsiden er generell og stemmer. Den sier også at spilletiden kan telle pauser.
- **ST1:** statistikk.js lastes i head med data-spill="fiskespillet" før spillets skript. start-fiskespillet kommer én gang, også med en ekstra evn-start.
- **ST1 for de andre spillene:** Med den nye statistikk.js teller Era Defenders, Mørkeskogen, Dyrepatruljen, Magiske egg og Fossil Zoo start én gang hver, også med en ekstra evn-start. Ingen hendelser kom før start.
- **ST3, ST5 og ST6:** Lokalt lastes ingenting fra gc.zgo.at. Bare godkjente navn ble sendt, hvert én gang. document.cookie er tom på alle sider.
- **B1:** L slår av lyden, og 🔇 vises etter omlasting.
- **B2:** Kartet viser deg, havna, fiskesteder og Kraken. Spillet står stille mens kartet er åpent.
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her», og Start er slått av.
- **B4 (Q):** Kraken er valgfri og ser vennlig ut, og tap er mildt.
- **Y2 (delvis):** Ekte fanebytte og blur åpner pausen («Pause fordi du gikk ut av spillet»). Kraken-kampen går i ekte tid.
- **Forsiden:**
  - Seks kort i 3+3 (1280), 2+2+2 (1000) og én kolonne (375, 320). Ingen sideveis rulling.
  - «Nytt» står bare på Fiskespillet.
  - Alle bilder er lastet, og alle har alt-tekst. Fiskespillet bruker 800w ved 1×. Begge filene finnes (800×500 og 1200×750).
  - Alle 13 interne lenker svarer 200. Klikk og trykk på kortet åpner «Fiskespillet 0.5.4».
  - 0 sidefeil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **K2/T2 – verifisert feil (ny i 0.5.4):** Feilkortet kan ikke brukes hvis WebGL mistes mens pausen er åpen.
  - **Gjenskape:** Start, åpne pausen (P, eller bytt fane), og kall `loseContext()`. Kortet vises, men det er inert. Klikk og trykk på «Last på nytt» treffer pausen bak (på mobil fikk evnPauseStyrKnapp fokus), og Tab er sperret av vakten.
  - **Hvem rammes:** Bare Esc på PC fører videre. På mobil står barnet fast til siden lastes på nytt i nettleseren. Fremgangen er lagret.
  - **Hva er galt:** Behandleren for `webglcontextlost` kaller ikke `EVNPauseInert($('feil'))`, slik feilfangeren gjør.
  - **Hvorfor ikke kritisk:** Før 0.5.4 ga tapt WebGL svart skjerm uten melding.
- **ST2 – verifisert feil (kjent, akseptert):** spilletid-fiskespillet-01min og -05min ble sendt mens pausen var åpen.
- **ST4 – verifisert feil (kjent, akseptert):** En feil under spilling gir ingen feil-fiskespillet-spill.
- **ST7 – verifisert feil (kjent, akseptert):** versjon-fiskespillet-0.5.4 og feilhendelsene mangler. Den godkjente statistikken er ikke tatt inn i noe spill.
- **B4/U3 – mulig problem (kjent, står fortsatt):** Kraken krever cirka 3 trykk/s i 60 s. Om det er for vanskelig for 7-åringer, må avgjøres på ekte telefon.

## Anbefalte forbedringer
- **Publiseringssjekken (verifisert, stopper PR-en):** `node test/publiseringssjekk.mjs` gir exit 1 med disse FEIL:
  - PR-en endrer test/index.html. Testresultatet regnes da ikke som betrodd, og eieren må slå sammen med unntak.
  - Det finnes ingen QA-rapport for c92771c.
  - Fordi statistikk.js er felles kode, regnes alle seks spill som endret. Hvert spill mangler en full rapport for c92771c.
  - **Kodelest:** Selv med full rapport per spill vil K3-sjekken feile for de fem andre spillene, fordi versjonen deres er uendret mot origin/main. Uten unntak må alle seks spill ha en full rapport på c92771c og ny versjon i ENDRINGSLOGG.md.
  - **Hva skriptet krever:**
    - Rapportene ligger i qa/rapporter/.
    - «Grunnlag» har full SHA for siste kodeendring utenfor qa/, standardens hash og agentversjon 2.2.
    - «Nivå: full» står i rapporten, og spillnavnet står i tittelen.
    - Alle gjeldende ID-er er nevnt (F1–S4 og ST1–ST8).
    - Konklusjonen er ikke NEI.
    - Testkvitteringen gjelder samme commit, er laget på rent arbeidstre og har alle suiter kjørt.
    - I Actions sammenlignes kvitteringen i tillegg med Actions sin egen kjøring.
  - **VARSEL:** Fiskespillet står ikke i standardens oversikt over betingede krav. Jeg har brukt B1–B4.
- **Kraken i båten (V):** Det store skiltet «🐙 Krakens dyp» midt på skjermen dekker delvis Kraken mens den sitter i båten. Ved feiring etter omlasting midt i sekvensen kommer kortet «Oppdraget er klart!» aldri.
- **Y2 (kodelest):** dt er begrenset til 0,05 s. Under 20 bilder/s går derfor sekvensen og båten saktere. Ved 1,5 bilder/s tok 7 s spilltid 46 s. Ved 60/120 Hz har det ingen betydning.
- **HUD ved 320×568:** Med nowrap fra 0.5.4 går teksten «4 av 5000» ut over kanten på 📖-pillen. Ved 568×320 dekker meldingen 📖 (79×38 px) i 3 s. Meldingen kan ikke trykkes.
- **T3 (forslag):** Kraken-sekvensen tar ikke hensyn til «reduser bevegelse». Kameraristen gjør det.
- **Forsiden:** «Siste nytt» nevner ikke Fiskespillet ennå.
- **Felles EVN-PAUSE:** settInert(null) bør vite om feilkortet, så vakten i Fiskespillet ikke trengs.

## Kontroller som ikke kunne utføres
- **ST8:** test/statistikk/ finnes ikke. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging. Milepælene er testet bare med forkortet tid (01–30 min).
- **Y1 (E):** Ingen referansemobil er valgt. SwiftShader sier ingenting om ekte maskinvare.
- **Y2 – kun kodelest:** Hastighet ved 60/120 Hz er ikke målt.
- **T1, T3, B1 og styrespaken (E):** Ekte berøring på iPhone og Android, klypezoom og hørbar lyd er ikke testet.
- **B3 (E):** Lavere grafikk på svake enheter og tapt WebGL på ekte mobil i bakgrunnen er ikke testet.
- **U2, U3, B4 (V):** Om Kraken-sekvensen, tidsgrensen og styringen er forståelige og passe vanskelige, må Even teste. Kraken på mobil (22 emulerte trykk på 60 s, ikke fanget) sier ikke noe sikkert fordi verktøyet trykker sakte.
- **T4:** Kontrasten er ikke målt på nytt for uendrede elementer.
- **B5–B7:** Gjelder ikke.
- **UI1–UI10:** Ikke kontrollert. Kravene er godkjent hovedløsning, men ikke tatt i bruk for spillet.
- Lange økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil, og F1 er testet på PC og emulert mobil. Kraken-sekvensen og rettingene i 0.5.4 virker, og forsiden og statistikken i alle seks spill er i orden. Avviket med tapt WebGL i pausen og de kjente avvikene ST2, ST4 og ST7 står fortsatt. Publiseringssjekken stopper PR-en til den har rapporter for alle seks spill eller en voksen slår sammen med unntak.
