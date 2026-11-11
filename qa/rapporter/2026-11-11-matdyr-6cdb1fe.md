# EVN Game QA: Matdyr-regn, prototype fase 2 (`prototype/matdyr-fase2`), ny kontroll etter retting
Grunnlag: agent 2.2 (utkast), standard 1.2 (utkast, ikke godkjent; gjeldende er 1.1) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 6cdb1fe3d307445d003fac00d3839cb6bdf1dbf2
Testkvittering: evn1 commit=6cdb1fe3d307445d003fac00d3839cb6bdf1dbf2 tester=c7f2096f3650 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: middels. Endringen gjelder kameraet i én prototype. `git diff 6d388ab 6cdb1fe` endrer tre filer i `prototype/matdyr-fase2/` (`visning.js`, `spilltest.mjs`, `README.md`) og legger til forrige QA-rapport. Felles kode, `spill/matdyr`, `test/` og `.claude/` er ikke endret.
Testet: Linux, headless Chrome (`/usr/bin/google-chrome`) med SwiftShader. Bare én Chrome kjørte om gangen, og ingen kjørte da jeg var ferdig.
- **Server:** Den svarte allerede på 8790 (PID 4126). Jeg startet den ikke og har latt den gå. Alle kjørbare filer i den serverte kopien er like med repoet (sjekket med `cmp`). Det er bare 15 PNG-filer og 2 Blender-skript som ikke finnes i kopien, og ingen av dem lastes av siden.
- **Kjøringer:**
  - `test/kjor.mjs`: 98 ok, 0 feil, 0 varsel, 1 kjent (fossilspillet T3), 2 ikke innført.
  - `spilltest.mjs`: 13/13 OK uten flagg og 13/13 OK med `?tobein=0`. Kameraprøven ga `kamera:[true,true,true]`.
  - `spilltest-c.mjs`: 32/32 OK.
  - `rutetest.mjs`: ingen feil.
- **Eget CDP-skript** (`/tmp/qa-matdyr12/skript/kamera.mjs`):
  - Alle 32 forespørsler etter `pilot_*2_*` ble holdt igjen med `Fetch`.
  - Figur og visning ble valgt med ekte museklikk. Kameraet ble flyttet med ekte musedrag og musehjul, nå også i «Nært».
  - Så ble modellene sluppet, og jeg sammenlignet kameraet og scenegruppene før og etter `evn-tobein-klar`.
  - Fasit: Jeg trykket «Nært» på nytt med et ekte klikk etter lastingen.
  - Testet i 1280×800, 375×812 og 740×360 (emulert). `localStorage` ble tømt før og etter.
- **Forrige rapport:** Ingen resultater fra 6d388ab er brukt som bevis.

## Oppfylte krav
Alt gjelder prototypen.
- **Funnet fra 6d388ab er rettet:** Hodet i «Nært» med Donutku havner ikke lenger utenfor bildet.

  | Tilfelle | Størrelse | `teta`, `fi`, `r` beholdt | `mal` etter lasting | Tegnet på nytt |
  |---|---|---|---|---|
  | Donutku, Nært | 1280×800 | ja | [0; 0,76; 0,60] → [0; 1,263; 0,04] = nytt hode | ja |
  | Donutku, Nært | 375×812 | ja | → [0; 0,913; 0,04] = nytt hode −0,35 (stående skjerm) | ja |
  | Donutku, Nært | 740×360 | ja | → [0; 1,263; 0,04] | ja |
  | Burgersau, Nært | 1280×800 og 375×812 | ja | uendret | nei |
  | Burgersau, Bakfra / I spillet | 1280×800 (Bakfra også 375×812) | ja | uendret | nei |
  | Donutku, Bakfra | 1280×800 og 375×812 | ja | uendret | ja |
  | Alle | 1280×800 | ja | uendret | ja |

  - `mal` blir det samme som et nytt trykk på «Nært» gir. Det eneste avviket er x på 0,01–0,03, og det kommer av at hodet beveger seg i tomgangsanimasjonen.
  - I 1280×800 er hodet midt i bildet etter lastingen (`kam-donutku-naert-1280-etter.png`). Vinkelen og avstanden spilleren hadde valgt, er beholdt.
- **`spilltest.mjs`:** Kameraprøven sjekker nå `teta`, `fi`, `r` og `mal`. Den sjekker også om Burgersau eller Donutku tegnes på nytt, og den har en egen prøve for «Nært».
  - Prøven ville ha feilet med koden fra 6d388ab, fordi `mal` da ble satt tilbake til testverdien.
  - Hendelsen sendes fortsatt etter at modellene er lastet. Tilfellet der modellene holdes igjen, er derfor bare dekket av mitt eget skript.
- **README** stemmer med koden.
- **F1 (oppstart):** Spillet startet i alle kjøringene. Startkoden er ikke endret, og jeg testet ikke ekte klikk på «Spill» på nytt.
- **F2 og F3:** Lagring, migrering, byttedialog og nivå 1–10 er OK i `spilltest.mjs` og `spilltest-c.mjs`.
- **K1:** Ingen ufangede feil, advarsler eller manglende filer i noen kjøring.
- **S1:** Siden sendte ingen forespørsler til eksterne domener, og CSP-kontrollen i `kjor.mjs` er OK. Proxyen avviste forespørsler til `accounts.google.com`, `www.google.com`, `android.clients.google.com` og `redirector.gvt1.com`. De kom fra Chromes egne bakgrunnstjenester, ikke fra siden.
- **Produksjonsspillet:** `spill/matdyr` er ikke endret, og arbeidstreet er rent.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Ingen nye.

Disse er kjent fra tidligere Matdyr-rapporter. Koden er ikke endret, og jeg har ikke testet dem på nytt:
1. I standardmodus løfter garantien sjeldenheten helt opp til Food God.
2. Matdyr mangler fortsatt i standardens oversikt over krav for hvert spill. Hashen er uendret.
3. I standardmodus blir en ødelagt lagring overskrevet.

## Anbefalte forbedringer
- **I «Nært» på stående mobil ligger toppen av hodet til den tobeinte Donutku bak infokortet.** Dette er verifisert i 375×812.
  - Det skjer både etter lastingen og etter et helt nytt trykk på «Nært» (`kam-donutku-naert-375-nytttrykk.png`). Det kommer altså av den faste justeringen `mal.y -= 0.35` i `settKameraMatdyr`, ikke av denne rettingen.
  - Det er mest merkbart for høye figurer. Forslag: juster stående «Nært» etter figurens høyde.
- **Fra tidligere rapporter og fortsatt aktuelt:** Mens lastingen pågår, vises 15 av 16 ID-er som kuler med emoji. Dette er beskrevet i README.

## Kontroller som ikke kunne utføres
- **Prototypen mangler disse delene:** pausekort og avslutt (pausedelen av F1), U1, K3, K2 og B1.
- **ST1–ST8:** Prototypen har ingen statistikk, med vilje, og `test/statistikk/` er ikke innført. Om hendelsene kommer frem i GoatCounter, kan bare en voksen med innlogging kontrollere.
- **UI1–UI10:** Kravene er ikke tatt i bruk for Matdyr.
- **Y1 og Y2:**
  - Bildefrekvensen kan ikke måles med programvaregrafikk (1–2 FPS).
  - Lastetid og minne på en ekte mobil er ikke målt.
- **B3:** Tapt 3D-kontekst er ikke testet.
- **`?grafikk=gammel`:** Dette er bare kodelest, og det er uendret.
- **Berøring:** Kameradrag med ekte berøring er ikke testet.
  - I 740×360 (emulert mobil) flyttet ikke musedraget kameraet. Der viser testen bare at standardkameraet beholdes, ikke et kamera spilleren har flyttet.
- **Krever faktisk enhet (E):** ekte berøring, og hvor lenge den gamle figuren vises over mobilnett.
- **Krever Even (V):** om det er greit at figuren bytter like etter start, og om de tobeinte dyrene ser riktige ut.

## Klar for testing hos Even?
JA MED FORBEHOLD. Funnet fra 6d388ab er rettet: i «Nært» havner målpunktet på hodet til den nye figuren mens vinkel og avstand beholdes, og det er verifisert med modellene holdt igjen i tre skjermstørrelser. Alle tester er OK. Forbeholdet er at ingenting er målt på en ekte mobil eller med ekte berøring.

---
- **Midlertidige filer:** `/tmp/qa-matdyr12/` inneholder `kjor.txt`, `sp.txt`, `sp0.txt`, `spc.txt`, `rute.txt`, `kamera*.txt`, skjermbildene `kam-*.png`, `skript/` og Chrome-profiler i `prof-*`.
- **Opprydding:** Serveren på port 8790 (PID 4126) kjørte før jeg begynte, og jeg har latt den gå. Ingen Chrome kjører, og jeg har ikke endret noen filer i repoet.
