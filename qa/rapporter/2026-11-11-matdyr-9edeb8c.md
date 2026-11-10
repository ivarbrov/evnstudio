# EVN Game QA: Matdyr-regn, prototype fase 2 (`prototype/matdyr-fase2`, `?tobein=1`)
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 9edeb8c7a5285177e735e886c3640232c3bfd7b0
Testkvittering: evn1 commit=9edeb8c7a5285177e735e886c3640232c3bfd7b0 tester=c7f2096f3650 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels. Endringen gjelder bare én prototype, bak et flagg. Den legger til én linje i `TOBEIN_ID` i `visning.js` og 8 nye modellfiler. Lagring, felles kode og `spill/` er ikke endret. Jeg valgte middels og ikke liten fordi nye ressurser og nye ID-er i oppslaget kan stoppe innlastingen eller gi feil figur.
Testet: Linux, headless Chromium og google-chrome med SwiftShader (programvaregrafikk), én Chrome om gangen.
- **Server:** 8790 svarte ikke. Jeg startet min egen server på 8798 fra kopien `/home/claude/matdyr-proto`.
- **Kopien er lik commiten:** Alle kodefilene som serveres, er like med `cmp`. Alle 8 `pilot_gris2_*.glb` i kopien er like filene i commiten, og alle 8 `.glb.js` ble dekodet og er byte for byte like.
- **Kjøringer:**
  - `test/kjor.mjs`: 98 ok, 0 feil, 0 varsel, 1 kjent, 2 ikke innført
  - `spilltest-c.mjs`: 32/32 OK
  - `spilltest.mjs`: 12/12 OK
  - `migrering.test.js`: 20/20
  - eget CDP-skript med ekte museklikk på «Spill» i 1280×800 og i 375×812 (emulert mobil)
- **Testtilstand:** Den ble satt med `EVNProto.sett`. `localStorage` ble tømt før og etter.

## Oppfylte krav
Alt gjelder prototypen.
- **Riktige figurer for riktige ID-er:** ID 2, 0, 9 og 8 er Donut-, Pizza-, Is- og Burgergris i `COMBOS`, og art er gris. `pilot_gris2_*` er knyttet til de samme ID-ene som de firbeinte `pilot_gris_*`.
- **Flaggene:**
  - `?tobein=1`, `?tobein=1&amp;fordeling=c` og `?tobein=1&amp;pilot=1` gir `pilot_gris2_*` for ID 2, 0, 9 og 8 og fortsatt `pilot_ku2_*` for 127, 125, 134 og 133. Alle 16 filene lastes.
  - Når begge flaggene er satt, vinner `tobein`. Grunnen er at `nyNavnFor` velger første treff, og TOBEIN står først.
  - Bare `?pilot=1` gir de firbeinte `pilot_gris_*` og `pilot_ku_*` som før.
  - Uten flagg, med `?fordeling=c` og med `?tobein=0` blir resultatet null for grisene og `donutku` for 127, som før. Ingen `*2_*`-filer lastes.
  - Med `?grafikk=gammel` brukes ingen nye figurer.
- **Trekanter:** Jeg telte dem i glTF og i three.js, og tallene er like. Budsjettet er 25 000 for full versjon og 7 000 for lav.

  | Modell | Full | Lav |
  |---|---|---|
  | Donutgris | 24 368 | 6 992 |
  | Pizzagris | 24 000 | 6 996 |
  | Isgris | 21 162 | 6 992 |
  | Burgergris | 24 000 | 6 995 |

  Dette stemmer med README.
- **Gange på to bein:**
  - Alle fire har nodene `hode`, `hale`, `bein_vf`, `bein_hf`, `vinge_v` og `vinge_h`, og ingen `bein_vb`. Det gir `fire=false`.
  - `animerNy` endrer alle seks nodene.
  - Detaljnivået `plass` bygges uten feil.
  - `minY` er mellom −0,09 og −0,12, på samme nivå som kuene.
  - I skjermbildet (`gaa.png`) står og går de fire grisene hele og riktige ved siden av roboten. Kontaktarket viser ingen synlige hull eller feil.
- **F1 (oppstart):** Et ekte klikk på «Spill» med `?tobein=1&amp;fordeling=c` starter spillet i både 1280×800 og 375×812 (`aria-pressed=true`, fanen er «spill»). Siden ruller ikke sideveis.
- **F2 og F3:**
  - spilltest-c, spilltest og migreringstestene er OK.
  - En base med ID 2, 0, 9 og 8 overlever omlasting med flagget.
  - Uten flagget brukes den samme lagringen ([2,0,9,8]), og grisene vises med de gamle figurene.
- **Bare utseendet er endret:** Navn, ID, art, mat og sjeldenhet kommer fra `COMBOS` og er uendret.
- **K1:** Jeg så ingen ufangede feil. Den eneste 404-feilen er `favicon.ico`.
- **S1:** Nettleseren sendte ingen forespørsler til eksterne domener, og CSP-kontrollen i `test/kjor.mjs` er OK. Innholdet passer for målgruppen.
- **Arbeidstreet er rent.**

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Disse er kjent fra før, ikke testet på nytt, og koden er uendret:
1. **Kjent funn 2:** I standardmodus løfter garantien fortsatt sjeldenheten helt opp til Food God.
2. **Kjent funn 3:** Matdyr mangler fortsatt i standardens oversikt «Hvilke krav gjelder for hvert spill». Hashen er uendret.
3. **Kjent funn 4:** I standardmodus blir en ødelagt lagring overskrevet.

## Anbefalte forbedringer
- **Isgris:** Iskula er rosa, som grisen. Dermed går den nesten i ett med hodet og armene, både i kontaktarket og i spillet. En annen iskulefarge eller en tydelig kant mot halsen vil gjøre maten lettere å kjenne igjen. Dette er et forslag om utseende, og Even bestemmer.
- **Forenklingen i `matdyr_tobein.py` (kjent fra før):** Skriptet forenkler delen med flest trekanter og kan forenkle helt ned til 30 %. Donutgris endte på 24 368 trekanter. Det er innenfor budsjettet, men over målet på 24 000 som kommentaren nevner. Kontroller utseendet hver gang skriptet brukes på nye figurer.
- **Kopien:** `.glb.js` var oppdatert også denne gangen. Det bør fortsatt være et fast steg hver gang `.glb` endres.
- **Synlighet i basen (kjent):** En figur i basen kan bli skjult bak infopanelet i 1280×800. Det gjelder ikke denne endringen.

## Kontroller som ikke kunne utføres
- **Prototypen mangler disse delene:** pausekort og avslutt (pausedelen av F1), U1, K3, K2 og B1.
- **ST1–ST8:** Prototypen har ingen statistikk, med vilje, og `test/statistikk/` er ikke innført. Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **UI1–UI10:** Kravene er ikke tatt i bruk for Matdyr.
- **Y1 og Y2:** Bildefrekvensen kan ikke måles med programvaregrafikk. Med flagget lastes 8 modeller til, rundt 6,4 MB i `.glb`. Hvordan det påvirker lastetid og minne på mobil, er ikke målt.
- **B3:** Tapt 3D-kontekst og lav grafikk er ikke testet.
- **Ikke kjørt:** Jeg så ikke grisene falle ned og gå ut gjennom porten i vanlig regn. Gangen ble kontrollert med figurer som ble satt inn i scenen.
- **Krever faktisk enhet (E):** ekte berøring og hvordan grisene ser ut og går på mobil.
- **Krever Even (V):**
  - om grisene på to bein ser riktige og morsomme ut
  - om Isgris er lett å kjenne igjen
  - om «bare dyr på to bein» skal gjelde videre. Hva som gjelder for hval, hai og skilpadde, er ikke avklart i README.

## Klar for testing hos Even?
JA MED FORBEHOLD. Grisene på to bein vises og går riktig bak `?tobein=1`, holder trekantbudsjettet og endrer verken ID-er, verdier eller lagring. Uten flagget er alt som før, og jeg fant ingen kritiske feil. Forbeholdet er at ytelse på mobil og ekte berøring ikke er testet.

---
- **Midlertidige filer:** `/tmp/qa-matdyr5/`: `cdp.mjs`, `kontroll.mjs`, `glb.py`, `ut.json`, `kjor.txt`, `spc.txt`, `sp.txt`, skjermbildene `gaa.png`, `base.png`, `base-uten.png`, `spill-1280.png`, `spill-375.png` og `matdyrfane.png`, og Chrome-profiler i `/tmp/qa-matdyr5/prof-*`, `/tmp/rute-*` og `/tmp/rute-c-*`.
- **Skjermbildet `base-uten.png`:** Det viser Matdyr-fanen, ikke basen. Derfor bygger «grisene vises med de gamle figurene» uten flagg (under F2 og F3) på oppslaget `nyNavnFor` (null for ID 2, 0, 9 og 8), ikke på bildet.
- **Opprydding:** Serveren min på 8798 (PID 899) er stoppet, og ingen Chrome kjører lenger. Jeg har ikke endret noen filer i repoet.
