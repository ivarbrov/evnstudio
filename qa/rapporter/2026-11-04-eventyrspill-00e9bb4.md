# EVN Game QA: Era Defenders 0.21.2
Grunnlag: agent 2.2, standard 1.2 utkast, gjeldende 1.1 (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 00e9bb45f9b1fd4ea9ba2522629c3761071e9342
Testkvittering: evn1 commit=00e9bb45f9b1fd4ea9ba2522629c3761071e9342 tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – oppdraget ber om fullt nivå, og versjonen er kandidat til publisering. Endringen mot origin/main (ff61022) er et nytt merke og en melding i HUD, tittel og versjon, sw-cache og én rad i ENDRINGSLOGG. Kontrollen er gjort mot de gjeldende kravene i 1.1 (F, U, T, Y, K, S, ST og B2, B4, B6, B7). UI1–UI10 er ikke tatt i bruk i spillet og er ikke kontrollert. Oppdraget oppga ikke standardversjon.
Testet: Lokal `python3 -m http.server` på 127.0.0.1:8861 (denne commiten) og 8862 (`git archive origin/main` i /home/claude/qa-tmp-era/main). Google Chrome headless via Playwright. Jeg brukte ekte tastetrykk (Enter, B, Esc, P, M, Tab, D), museklikk med `force` på Start fordi knappen pulserer, og `tap`/`touchscreen.tap` i emulert mobil. Størrelser: 1280×800, og emulert mobil med berøring i 375×812, 320×568, 740×360 og 568×320. Testtilstand (penger, nivå, epoke, vanskelighet, bygg) ble satt i testnettleseren, og lagringer ble lagt inn med `addInitScript` før sidens skript. Ny localStorage-kontekst i hver test. `node test/kjor.mjs --base origin/main`: 85 ok, 0 feil, 0 varsel, 1 kjent (Fossil Zoo T3), 2 ikke innført. Begge testserverne er stoppet. Skript og skjermbilder ligger i /home/claude/qa-tmp-era/.

## Oppfylte krav
**Oppdragets krav: tallet stemmer med knappene i basen.**
- *Logikk:* I 5000 tilfeldige tilstander (nivå 1–30, epoke 1–7, Lett/Normal/Vanskelig, tilfeldige byggnivåer, saldo 0–4000) ga `kjopbareBygg().length` nøyaktig samme tall som antall aktive «Bygg/Oppgrader»-knapper i `visBase()`. Det var 0 avvik, og tallene gikk fra 0 til 18.
- *Visning:* Etter minst 32 oppdateringer viste `#baseRad` riktig tall i 120 av 120 tilfeller. Med en fast ventetid på 400 ms var det 3 avvik av 200. Alle de tre hadde fått bare 8–12 oppdateringer på grunn av last på maskinen. Merket oppdateres hver 15. oppdatering (omtrent 0,25 s), så dette er forventet forsinkelse og ikke en feil.
- *Lagringer:* Med en lagring fra før epokene (nivå 6, epoke 5, flyttet til 6) viste merket ⬆ 13, og 13 knapper var aktive. Med en lagring i 0.21.0-format (nivå 9, Vanskelig) viste det ⬆ 8, og 8 knapper var aktive.
- *Hva som ikke telles:* Reparer, Alkymist (drikker) og pynt telles ikke. Ved 9999 penger på nivå 1 viser merket ⬆ 3 (Smie, Brønn, Mur).
- *Ekte flyt:* B åpnet basen, ett kjøp ble gjort med klikk, og B lukket den. Tallet ble oppdatert etter kjøpet.

**Oppdragets krav: merket pulserer ikke hele tiden.** `animationstart` kom én gang da tallet økte. Etter 3 s var det ingen aktive animasjoner (`getAnimations()` = 0). Når tallet økte igjen, kom én ny animasjon, og ingen kom når tallet sto stille.

**Oppdragets krav: meldingen gjentas ikke.**
- Meldingen kom én gang. Den kom ikke igjen etter 0 → 30 penger, etter at spilleren ble slått ut og trykket «Prøv igjen», eller i løpet av 150 tilstandsbytter.
- Ble basen åpnet før spilleren hadde råd, kom ingen melding.
- Etter omlasting kommer meldingen én gang til. Det er ny økt, slik endringsloggen sier.

**Oppdragets krav: priser og bygg-effekter er identiske med main.**
- `BYGNINGER` og `VANSKELIGHET` er like i begge versjoner.
- Jeg kjøpte alt i alle tre vanskelighetsgrader, med samme tilfeldighetsfrø. Pris, saldo, sverd, liv, magi, mana, fart, drikker, mur, tårn og `bygget` ble like i alle 246 kjøpene.
- Fire lagringer (gammel, 0.21.0, ødelagt og feil type) ga samme tilstand og samme knappetekster i begge versjoner.
- Diffen endrer ikke `bygg`, `byggePris`, `lagre` eller `hentLagring`.

**Oppdragets krav: ingen overlapp i HUD.**
- Merket ligger inne i `#baseKnapp`, og ingen andre DOM-elementer overlapper knappen.
- Knappen er 195×45 px på PC (før 137×45), 168×45 px i 740×360 og 154×44 px på mobil (før 98×44).
- I skjermbildene i alle fem størrelsene overlapper knappen verken statuslinjene, Avslutt, kart, pause eller handlingsknappene.
- Ingen sideveis rulling: `scrollWidth` er lik bredden i alle størrelser.
- Unntak er E-coins-meldingen, som er kortvarig og overlapper på samme måte på main. Se under forbedringer.

**Krav:**
- **F1** Oppfylt: Start med Enter og med klikk. Gange med D (x endret seg), pause med P (`tid` står stille, og pausekortet vises), fortsett med Esc (`tid` går). Basen åpnes og lukkes med B og Esc. Avslutt går tilbake til spillet uten å forlate siden. På mobil åpner et trykk på selve merket basen (`elementFromPoint` = `baseRad`, og `tilstand` blir `base`). Røyktesten er OK.
- **F2** Oppfylt: 123 penger var beholdt etter omlasting. «Start helt på nytt» gir fokus på «Nei». Nei beholder lagringen, og Ja sletter bare `evn-eventyrspill-v1`.
- **F3** Oppfylt: `{ikke json` og `{"niva":"x","bygget":5}` gir ny start uten feil. Lagringer fra før epokene og fra 0.21.0 lastes riktig og likt med main.
- **U1** Oppfylt: Startkortet viser «Versjon 0.21.2 · 7 tidsepoker», mål, styring, vanskelighetsgrad, Start og vei tilbake. Røyktesten er OK.
- **U2** Oppfylt for Q-delen: Merket viser hva spilleren har råd til. Styringslinja og pausen er uendret.
- **U3** Oppfylt for Q-delen: Ny tekst: «💰 Du har råd til ⚒️ Smie! Trykk på Basen 🏰». Den er enkel og positiv.
- **T1** Oppfylt for DOM-knapper: `#baseKnapp` er minst 44 px høy i alle mobilstørrelser. Merket er en del av knappen og ingen egen trykkflate.
- **T3** Oppfylt: Viewport sperrer ikke zoom (statisk test OK). Med `reducedMotion: 'reduce'` var `animationName` `none`, og det kom 0 animasjoner.
- **T4** Oppfylt for det nye merket: Kontrasten mellom #3d2a17 og #ffd54a er beregnet til 9,6:1. Tallet vises som tekst, ikke bare med farge, og knappen får et tilgjengelig navn («Basen. Du har råd til 3 ting.»).
- **K1** Oppfylt: Ingen pageerror, konsollfeil eller svar ≥ 400 i noen kjøring. Røyktesten (med CSP-brudd) er OK.
- **K3** Oppfylt: 0.21.2 står i `&lt;title&gt;` og på startkortet. sw-cache er v0.34, og ENDRINGSLOGG har en ny rad merket «ikke publisert».
- **S1** Oppfylt (A): CSP er uendret mot main, og alle statiske S1-kontroller er OK. Siden sendte ingen forespørsler utenfor 127.0.0.1. Chromes egne bakgrunnsforbindelser til google-domener kommer fra nettleseren, ikke fra siden.
- **S2** Oppfylt (statisk): Ingen konto, chat, kjøp med ekte penger eller reklame i diffen. Kjøpene i basen bruker penger fra spillet.
- **S3** Oppfylt for denne endringen: Basenavnet er uendret mot main og ligger bare i localStorage.
- **B2** Oppfylt: M åpner kartet, og `tid` står stille.
- **B4** Oppfylt for Q-delen: Kamp og vanskelighetsgrader er uendret, og Lett finnes.
- **ST3** Oppfylt (kodekontroll og kjøring): `statistikk.js` er uendret og avslutter når vertsnavnet ikke er evnstudio.no. Ingen forespørsler ut ved lokal kjøring.
- **ST6** Oppfylt (kodekontroll): Ingen informasjonskapsler, ID-er eller fingeravtrykk i `statistikk.js` eller i diffen.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
**Nytt i denne endringen:**
- **Meldingen «Du har råd til …» skjules på små og liggende skjermer.** Verifisert feil mot oppdragets beskrivelse, ikke brudd på en bestemt krav-ID. U2 er fortsatt oppfylt gjennom merket.
  - Meldingen tegnes på canvas 185 verdensenheter over helten. Den er 11 px på mobil (18 px × zoom 0,6–0,625) og vises i 60 oppdateringer (omtrent 1 s).
  - I 320×568 ligger den bak Basen-knappen, og bare «… Trykk på Basen 🏰» synes.
  - I 740×360 ligger den nesten helt bak Basen-knappen.
  - I 568×320 ligger den oppå Liv- og Kraft-linjene.
  - Den er lesbar i 1280×800 og 375×812.
  - Fordi meldingen vises bare én gang per økt, får spilleren på disse skjermene den i praksis ikke.
  - Slik gjenskapes feilen: tom lagring, emulert mobil 740×360 eller 320×568, trykk Start og gi `helt.penger` en verdi spilleren har råd til noe med. Ta skjermbilde mens `tekster` inneholder meldingen. Se /home/claude/qa-tmp-era/ren-740x360.png, ren-320x568.png og ren-568x320.png.

**Kjente avvik og avvik som også finnes på origin/main (ikke fra denne endringen, uendret):**
- **T2** Verifisert feil, kjent funn: Tab går ut av pausekortet. Gjenskapes slik: start, trykk P og trykk Tab fem ganger. Fokus går `evnPauseStyrKnapp` → `evnPauseAvslutt` → BODY → `baseKnapp` → `avsluttKnapp`.
- **K2** Verifisert feil, kjent funn: Ingen global feilfanger (`window.onerror` er null).
- **S4 / B7** Kjent mulig problem: Personvernsiden nevner ikke basenavnet. Siden er ikke kontrollert på nytt, og diffen endrer ikke basenavnet.
- **ST1** Avvik (kodelest, uendret mot main): `statistikk.js` lastes nederst i `&lt;body&gt;` med `defer`, ikke i `&lt;head&gt;`. Spillet sender ikke `evn-start` og ingen `versjon-eventyrspill-&lt;versjon&gt;`.
- **ST2** Avvik (kodelest, uendret mot main): Spilletiden kommer ikke fra `window.EVNAktivTid`. Den telles med eget `setInterval` som bare sjekker om fanen er synlig.
- **ST4** Avvik (kodelest, uendret mot main): `feil-eventyrspill-oppstart` og `feil-eventyrspill-spill` sendes aldri.
- **ST7** Avvik: følger av ST1, ST2 og ST4. Testsuiten melder `statistikk=ikke-innfort`.

## Anbefalte forbedringer
- Gjør meldingen lesbar på små skjermer. Den kan for eksempel plasseres under helten, i skjermkoordinater, eller ved Basen-knappen, og vises lenger enn 1 s. En annen mulighet er å vise den først når den faktisk kan sees. Even bør prøve meldingen på mobil.
- Versjonen hopper fra 0.21.0 til 0.21.2 og sw-cachen fra v0.32 til v0.34. Grunnen er at 0.21.1 og v0.33 finnes på den ikke-sammenslåtte grenen `origin/ui/eventyrspill-trinn2`. Slås begge grenene sammen, blir det konflikter i `&lt;title&gt;`, startkortet, sw.js og ENDRINGSLOGG, og rekkefølgen må avklares.
- E-coins-meldingen (`evnEcoinMelding`, ved avstemming av eksisterende lagring) dekker Basen-knappen og merket øverst på midten i 1280×800 og 740×360 så lenge den vises. Det gjør den også på main.
- Kodelest, mulig problem: Klassen `.ny` blir liggende på merket. Når `#baseKnapp` går fra `display:none` til `block` (etter «Prøv igjen», ny runde eller «Fortsett» etter seier), kan animasjonen spilles én gang til. Det er ikke pulsering hele tiden, men den kan fjernes med `animationend`.
- `aria-label` erstatter den synlige teksten «(B)» i det tilgjengelige navnet. Vurder «Basen (B). Du har råd til N ting.».

## Kontroller som ikke kunne utføres
- **ST8** Ikke testet: `test/statistikk/` finnes ikke, verken her eller på main (`statistikk=ikke-innfort`). Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging.
- **ST5** Kun kodelest: Bare `start-` og `spilletid-` brukes, og hver sendes én gang. Uendret mot main.
- **Y1** Ikke testet: Referansemobil er ikke valgt (E). `oppdaterBaseRad` kjører hver 15. oppdatering og filtrerer 25 bygg. Det ga ingen målbar endring på utviklingsmaskinen (52–59 oppdateringer/s headless), men det sier ikke noe om mobil.
- **Y2** Kun kodelest: Merket og meldingen styres av `tid` (fast tidssteg), ikke av klokketid. Fanebytte er ikke testet i headless.
- **T4** Kontrasten i resten av grensesnittet er ikke målt. Den er uendret.
- **B6** Kun kodelest: sw-cache v0.34, og `FILER` er uendret. Oppdatering og frakoblet bruk på installert app krever enhet (E).
- **S4** Ikke testet på nytt. Se kjent funn over.
- **E**: T1, T3, Y1 og B6 på faktisk mobil. Ekte berøring på iPhone og Android er ikke testet, bare emulert. Lesbarheten til merket og meldingen på ekte skjerm er heller ikke testet.
- **V**: U2, U3 og B4. Even må vurdere om merket «⬆ N» er forståelig, om spretten når tallet øker er passe, om meldingen hjelper, og om han faktisk bruker basen tidligere. Det siste er endringens formål fra Game Design Review 1, tiltak 3. Lyd er ikke berørt og ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 er testet ved kjøring på 00e9bb4 uten feil, og tallet stemmer med kjøpsknappene i alle 5000 tilstandene. Priser, bygg-effekter og lagring er like med main. Forbeholdet er at meldingen skjules på små og liggende skjermer, de kjente avvikene som også finnes på main (T2, K2, S4/B7, ST1/ST2/ST4/ST7), at ST8 ikke kunne kjøres, og at Y1 og ekte mobil ikke er testet.
