# EVN Game QA: Dyrepatruljen 0.11.6 (pilot, EVN-PAUSE v3), ny kontroll etter retting
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent – gjeldende krav er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 632a7fe039607aa5e9c4e3ae0b0c915b78925f3f
Testkvittering: evn1 commit=632a7fe039607aa5e9c4e3ae0b0c915b78925f3f tester=675e701e13bf arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok meny=ok
Nivå: høy – endringen gjelder felles kode (`felles/ui/evn-pause-v3.js`). Bare Dyrepatruljen bruker v3, så bare den er kontrollert, med lagring fra 0.11.5.

## Oppfylte krav
- Funnene fra ce8bd02 er rettet: Sniker under meldinger (unntak 568×320 med innfelling, se under), fokus etter Avslutt → Nei, saldolinja under rutene, menyen i 568×320 uten rulling og i 320×568 med alle ruter synlige, L med dyreboka åpen.
- Regresjon: F1, F2, F3 (del), T2/KS12, T3, K1, K3, S1, S2, S4, ST6, B2, B3 (oppstart), ST5 (det som er kjørt) og kopikontroll (KM12) er OK. `node test/kjor.mjs`: 151 ok, 0 feil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- L virker ikke når kartet er åpent (verifisert, rådgivende KS9/KM8).
- Menyrutene er 56 px i lave vinduer, mot 60 px i KM9 (verifisert, ny i 8171ad0).
- Sniker kan berøres av meldinger på to–tre linjer i 568×320 med 47 px innfelling (7 px, teksten lesbar). Mulig problem, krever ekte telefon.
- KS12, kjent: fokus havner på BODY etter dyreboka (I og 📖), etter «Velg verden» fra menyen og etter Avslutt → Esc fra verdensvalget.
- Kilden er endret uten nytt versjonsnummer (v3 er upublisert pilot). Navnekollisjonen med ST2 (`EVNAktivTid`) er åpen.
- Kjent og uendret: F3 (`reddet.gata = null`), K2, B3 (`webglcontextlost`), ST1, ST2, ST4, ST7, ST8.

## Anbefalte forbedringer
- Tab-rekkefølgen følger ikke det man ser når saldolinja flyttes med CSS `order`.
- Tipslinja i 320×568 må rulles 13 px.
- L bytter lyd mens «Start helt på nytt?» er åpen, uten synlig tilbakemelding.
- Fra før: status brytes i 320×568, styrespak og Snik overlapper i 320×568, Start under bretten i liggende format, hjelpeteksten viser taster på mobil.

## Kontroller som ikke kunne utføres
Y1, Y2, T1/KM1/KM5/KM6/KS13 (ekte enheter), B1 (hørbar lyd), U2/U3/KM3/KM10 (Even), KS11 (klikklytteren bare kodelest), ST2/ST4 (GoatCounter), UI8a–c (ikke målt på nytt).

## Klar for testing hos Even?
JA MED FORBEHOLD – ingen kritiske feil og ingen regresjon i det som er testet. Forbehold: L med kartet åpent, 56 px i lave vinduer, ikke testet på ekte mobil, kjente avvik F3, K2 og ST.

*(Rapporten er kortet ned av hovedagenten fordi den fulle teksten bare fantes i økta. Funn og konklusjon er uendret.)*
