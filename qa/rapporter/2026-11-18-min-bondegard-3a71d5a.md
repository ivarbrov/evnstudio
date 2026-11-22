# EVN Game QA: Min Bondegård (min-bondegard) 0.21.2
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 3a71d5a1830c27986c6dfc0dbee252f7e0a5ccab
Testkvittering: evn1 commit=3a71d5a1830c27986c6dfc0dbee252f7e0a5ccab tester=5b8e9eee5fa3 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels – ny spillogikk i ett spill (`arrRydd`), uten endring i lagringsformat, felles kode eller CSP. Dette er ikke en full kontroll, og den holder ikke alene som grunnlag for publisering av 0.21.2.
Testet: Lokalt på 127.0.0.1:8841 i Chrome headless (SwiftShader), styrt over DevTools-protokollen, med egne midlertidige profiler.
- **Metode:** Museklikk, tastetrykk og berøring var syntetiske hendelser. Testtilstand ble satt opp med `window.__spill`.
- **Størrelser:** 1280×800 (mus) og 375×812, 568×320 og 320×568 (emulert berøring).
- **Desember i vanlig modus:** Nettleserens `Date` ble flyttet 20 dager fram (8.12.2026). I testmodus brukte jeg `?test&maned=12`.
- **Testlagring:** Nivå 5, 340 mynter, 7 hatter sendt, 40 hatter i låven, og én ferdig og én uferdig hatt i køen på Festbordet.
- **Automatiske tester:** `test/kjor.mjs` ga 99 ok, 0 feil, 0 varsel og 2 ikke innført (exit 0). `logikk.test.mjs` ga 134 ok og 0 feil.
- **Bildefrekvens:** Testnettleseren ga ca. 11 bilder på 19 s, så tidspunkter i sekunder er ikke målt.
- **Standardversjon:** Oppdraget oppga ingen. Fila er 1.2 (utkast), og jeg har bare brukt krav med status gjeldende.

## Oppfylte krav
- **Rettingen fra forrige QA (F1, hatter i låven etter festen):**
  - **Desember, testmodus og vanlig modus:** Etter Start kom «🚚 Festen er over. Bilen hentet 42 festhatter som var til overs. Du fikk 672 mynter.» Mynter gikk fra 340 til 1012 (42 × 16), og låven fra 10 til 50 ledige plasser.
  - **Køen:** Festbordet har to ledige plasser etterpå, «Lag» er av, og kortet sier at festen er over for i år.
  - **Ingen XP og ingen framgang:** XP var 0 og sendte hatter 7 både før og etter.
  - **Full låve (50 hatter og 2 i kø):** 52 hatter hentet, 832 mynter, 50 ledige plasser.
  - **Entall:** Én hatt gir «1 festhatt» og 16 mynter.
  - **November:** Med `?test&maned=11` og med ekte dato 18.11 ble ingenting hentet (40 hatter, 2 i kø, 340 mynter).
- **F1:** Tab og Enter starter spillet (fokus på Start, «▶ Til gården»). P åpner pausen, og Esc lukker den.
- **F2:** Lagringen var oppdatert rett etter henting (1012 mynter, 0 hatter, tom kø). Etter omlasting og ny Start kom ingen ny utbetaling og ingen melding.
- **F3:** Lagring fra 0.15.11 på nivå 10 (uttrekket fra forrige kontroll) startet i desember med uendret nivå, mynter og lager, uten melding og uten kopi-nøkkel.
- **U1:** Startkortet viser «Versjon 0.21.2». Tittel og `MB_VERSJON` viser det samme.
- **T1 (emulert, delvis):** I de tre mobilstørrelsene lå meldingen innenfor skjermen, uten klipping og uten sideveis rulling. Start virket med berøring.
- **K1:** Røyktesten er OK. Ingen konsollfeil, 404 eller eksterne forespørsler i mine ti kjøringer.
- **K3:** `ENDRINGSLOGG.md` og README har fått med 0.21.1 og 0.21.2, og teksten stemmer med koden. Avviket fra forrige rapport er rettet.
- **S1 og S2:** Den statiske suiten og E-coins-suiten er OK. Mynter fra hattene gir ikke E-coins, fordi E-coins følger nivå (kodelest).

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST5 og ST7, kjent fra forrige QA, ikke rettet og ikke kontrollert på nytt:** `statistikk.js` er uendret siden e100ddb, så funnet om at versjonshendelsen ikke sendes, står trolig fortsatt.

## Anbefalte forbedringer
- **Meldingen kan gå tapt i pausen.** Med P rett etter Start ble hattene hentet mens pausekortet var oppe, og meldingen lå uskarp bak kortet. Den vises i 6 s og kommer ikke igjen, så barnet kan miste forklaringen på hvor hattene ble av.
- **To meldinger sier ulike ting.** «Mens du var borte: 2 varer er ferdige» teller hattene i køen, og blir så byttet ut med meldingen om at bilen hentet dem (kodelest: `borteTekst` kjører før `arrRydd`).
- **Henting skjer bare ved Start.** Står spillet åpent over månedsskiftet, blir hattene liggende til neste gang spillet startes (kodelest).
- **Uferdige hatter gir full pris.** Det er dokumentert i koden og README, og gir ingen fordel, fordi sending i festen gir samme pris pluss XP.
- **Voksen må godkjenne tallet:** 16 mynter per hatt som er til overs. README sier selv at prisen er et forslag.
- **Smal melding på små skjermer.** I 320×568 er den 160 px bred over seks linjer. Det gjelder alle meldinger og er ikke nytt.
- **E-coins-varselet dekker toppfeltet.** «Du fikk 20 E-coins!» lå over mynttelleren i 568×320 og over knappene i 320×568 mens det ble vist. Det er ikke del av denne endringen.
- **Ingen automatisk nettlesertest** for hentingen. De tre nye testene dekker bare `L.arrRydd`, ikke kallet ved Start.

## Kontroller som ikke kunne utføres
- **Meldingen på 1280×800:** Den er bare sett uskarp bak pausekortet. Skjermbildet uten pause ble tatt etter at den var borte. Teksten og at den ble satt synlig, er lest fra siden.
- **De 2,5 sekundene:** Ikke målt på grunn av lav bildefrekvens. Etter 0,9 s var ingenting hentet.
- **Ekte månedsskifte:** Desember er etterlignet med flyttet `Date` og med `?test&maned=12`, ikke med ekte systemklokke.
- **Resten av spillet:** Ikke kontrollert på nytt på 3a71d5a: festen med klikk, premiene, bilknappen i november, Jordet, Rebus, admin, nullstilling og ødelagt lagring. Endringen rører ikke den koden, men resultatene fra e100ddb er ikke bevis for denne committen.
- **F3 med lagring fra 0.21.1:** Testlagringen ble laget i 0.21.2. Lagringsformatet er uendret i diffen.
- **ST1–ST8:** Ikke testet. `test/statistikk/` finnes ikke (kvittering: «ikke-innfort»), og `evn-start` er bare lest i koden. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **Y1 og Y2:** Ikke testet. Ingen referansemobil, og testnettleseren er for treg.
- **T1 og T3 (E):** Ekte berøring og knip med to fingre på faktisk enhet.
- **T2 og T4:** Ikke testet i denne runden utover Tab til Start. Ingen kontrastberegning av meldingen.
- **U2 og U3 (V):** Om barn forstår hvorfor hattene er borte og hva de fikk, må Even teste.
- **K2, S3, S4 og B3:** Ikke kontrollert på nytt. Koden bak er uendret siden e100ddb.
- **UI1–UI10 og klarspråk:** Ikke tatt i bruk for spillet. Ikke kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – rettingen virker i desember i både testmodus og vanlig modus, F1, F2 og F3 med lagring fra 0.15.11 er testet uten kritiske feil, og endringsloggen er rettet. Forbeholdet er at dette er en middels kontroll: resten av spillet, statistikk, ytelse og ekte berøring er ikke kontrollert på 3a71d5a, og en full kontroll må til før versjonen foreslås publisert.

Testserveren på 8841 er stoppet, og ingen av mine prosesser eller profilmapper ligger igjen. Jeg har ikke endret repoet, og arbeidstreet er rent på 3a71d5a. Skript, utdata og skjermbilder ligger i `/tmp/qa-mb212/` (`t1.mjs`, `t2.mjs`, `t1.ut`, `bilder/`), og utskriften fra `test/kjor.mjs` i `/tmp/qa-mb212-kjor.ut`. Jeg gjenbrukte hjelpeskriptene og 0.15.11-lagringen fra `/tmp/qa-mb211/`. Ingenting i rapporten bygger på lagret minne.
