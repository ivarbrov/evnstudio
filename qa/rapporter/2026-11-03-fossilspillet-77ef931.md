# EVN Game QA: Fossil Zoo 0.8.1
Grunnlag: agent 2.2 (utkast), standard 1.2 utkast / gjeldende 1.1 (55d5794116fb74ae842b6d60fed4e7b160157472), commit 77ef931514d8968aaac3c3a8a353b28e7b35b2bf
Testkvittering: evn1 commit=77ef931514d8968aaac3c3a8a353b28e7b35b2bf tester=2c1a60c04b81 arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – versjonen skal foreslås publisert. Selve endringen er liten: viewport, zoomsperrer, safe area i CSS og versjonsnummer (28 linjer i spill/fossilspillet/index.html og 1 rad i ENDRINGSLOGG.md).
Testet: Arbeidstreet /home/claude/wt/ui-fossilspillet-trinn2 (gren ui/fossilspillet-trinn2, `git status` rent). Testsuiten ble ikke kjørt på nytt, slik oppdraget sa. Kvitteringen og resultatet er hentet fra /home/claude/kvitt/ui-fossilspillet-trinn2.txt. Der står det «85 ok, 0 feil, 0 varsel, 0 kjent, 1 rettet, 2 ikke innført». Oppdraget sa «1 kjent». Forskjellen er at T3 nå er merket RETTET. Egne Playwright-skript i /tmp/qa-fossil kjørte i Chromium 1243 headless med swiftshader. 0.8.1 ble servert med python http.server fra repoets rot på 127.0.0.1:8714, og 0.8.0 (main, eksportert med `git archive` til /tmp/qa-fossil/main) på 127.0.0.1:8715. Begge serverne er stoppet. Alt nettverk utenfor 127.0.0.1 ble sperret og logget, og ingenting ble forsøkt. Størrelser: 1280×800 og emulert mobil med berøring i 375×812, 812×375, 740×360, 320×568 og 568×320. Safe area ble satt med CDP `Emulation.setSafeAreaInsetsOverride`, med {47,0,0,34} på høykant og {0,47,47,21} liggende. Tastatur (Tab, Enter, piltaster, P, M, Esc, Ctrl+hjul, Ctrl+=) var ekte input fra Playwright. Knappetrykk var syntetiske `element.click()`. To fingre ble sendt med CDP `Input.dispatchTouchEvent`. Med JS satte jeg bare opp testtilstander: ødelagt lagring, og melding og faktaboks vist for å måle dem. localStorage ble tømt før og etter hver test.

## Oppfylte krav
- **T3, zoom-delen (kjent funn «`user-scalable=no` sperrer zoom»): RETTET i viewport og i JS.** Viewport er nå `width=device-width,initial-scale=1,viewport-fit=cover`. Jeg målte `defaultPrevented` i en lytter etter spillets egen. I 0.8.1 blir Ctrl+hjul og Ctrl+= ikke sperret på startkortet, i tidsepokene, i pausen, i kartet eller i dyreparken. De blir sperret i spill (true). To fingre (touchmove) blir ikke sperret på startkortet, i tidsepokene eller i pausen, men blir sperret i spill. Dette gjelder både 375×812 og 812×375. I 0.8.0 var alt sperret i alle tilstander. `iSpill()` stemmer med beskrivelsen: `paused` er true i tidsepokene, dyreparken, feiringen, pausen, kartet og «Vil du avslutte?». Se også mulig problem under T3.
- **Safe area:** Beregnede verdier stemmer med beskrivelsen. På høykant med topp 47 er `#hud` top 53 px (6 + 47, media-regelen), `#msg` 111 px og `#fakta` 117 px. Liggende med 47/47/21 er `#hud` left og right 55 px, `#pad` right 59 px og bottom 35 px, og `#help` left 59 px og bottom 33 px. Uten innsett er verdiene som før, for eksempel hud 8/8/8 og pad 12/14. Ingen HUD-knapp, pilknapp, melding eller faktaboks ligger i innsettene i noen av de målte tilstandene.
- **F1:** Spillet startet bare med tastaturet: Tab til Start, Enter, tidsepoker og Enter på «Grav videre her». Piltastene gravde. P åpner pausen med fokus på Fortsett, og Esc lukker den. M åpner kartet, og Esc lukker det. Avslutt åpner «Vil du avslutte?» med fokus på «Nei, spill videre», og Esc lukker den. Spillet hang ikke i noen av størrelsene.
- **F2:** Etter omlasting står det «Fortsett!», tunnelen er den samme og posisjonen den samme (py 20 → 20). «Start helt på nytt» åpner en bekreftelse med fokus på «Nei, behold alt». Esc beholder lagringen.
- **F3:** Jeg lagde en lagring ved å spille 0.8.0 (main). Den hadde nøklene `evn-fossilspillet-v04` og `evn-spilletid-fossilspillet`, v:5, 283 gravde ruter og posisjon 20,16. I 0.8.1 ble den lastet med «Fortsett!», samme tunnel og samme posisjon, og det gikk an å grave videre (287 ruter). Ødelagt JSON i v04 gir «Start!» uten feil, og spillet kan spilles. Lagringsnøkler og -format er uendret i diffen.
- **T1 (emulert):** Jeg målte synlige knapper og lenker som ligger øverst i midtpunktet sitt. Det var 8 tilstander (startkort, tidsepoker, i spill, melding og fakta, pause, kart, dyrepark, «Vil du avslutte?») i 5 størrelser. Ingen er under 44×44 px, og ingen gir sideveis rulling. **Kjent funn T1 (29 px) er fortsatt rettet** (rettet i 0.7.5).
- **U1:** Startkortet har merket, navnet, målet, fire styringslinjer, Start, «← Tilbake til EVN Studio» (synlig under /spill/) og «Versjon 0.8.1».
- **U2 (Q-delen):** Hjelpelinjen finnes. «🎮 Slik styrer du» i pausen kan nås med Tab.
- **U3 (Q-delen):** Teksten i spillet er uendret.
- **K1:** kjor.mjs viser OK. Egne kjøringer ga 0 ufangede feil, 0 svar med status 400 eller høyere og 0 eksterne forespørsler. Se merknaden om touchend under anbefalte forbedringer.
- **K3:** Tittelen er «Fossil Zoo v0.8.1 – EVN Studio», startkortet viser «Versjon 0.8.1», og ENDRINGSLOGG.md har en rad datert 2026-11-03. Innholdet i raden stemmer med diffen.
- **S1:** Den statiske suiten er OK, og CSP er uendret i diffen. Ingen eval.
- **S2:** Ingen konto, chat, kjøp med ekte penger eller reklame. E-coins er lokale. Ingen forespørsler utenfor 127.0.0.1.
- **S3:** Ingen fritekstfelt (0 treff på input, textarea og prompt).
- **B2, kartdelen:** M og 🗺️ åpner kartet med «🔴 Du er her · Karbontiden», og Esc lukker det.
- **ST3:** statistikk.js avslutter når siden ikke ligger på evnstudio.no. Ingen forespørsler fra localhost. statistikk.js er uendret mot main.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
Alle avvikene under finnes også i 0.8.0 på main. Ingen av dem kommer fra denne endringen.
- **T3, mulig problem (zoom på ekte mobil):** `html,body{touch-action:none}` (linje 20) står fortsatt. I Chromium og WebKit må alle forfedre opp til roten tillate pinch-zoom før siden kan knipes. Derfor kan knip fortsatt være sperret på startkortet og i menyene på Android og iPhone, selv om viewport og JS nå tillater det. `visualViewport`-handleren fjerner sperren først når siden allerede er zoomet. Jeg fikk ikke testet dette: knip med CDP zoomet ikke en gang på en kontrollside uten sperrer i headless Chromium. For å avgjøre det: åpne startkortet på en Android-telefon og en iPhone og prøv å knipe.
- **T3, resten av kravet (kjent avvik, uendret):** `prefers-reduced-motion` gjelder bare pulsen på startknappen. Skjermristing ved fall (`shake`) og overgangene på `#fade`, `#msg` og `#fakta` er ikke dempet (kodelest).
- **T2, kjent avvik (uendret):** Med pausen åpen går Tab fra evnPauseStyrKnapp til evnPauseAvslutt, så til body, og så videre til ropeBtn og lvlBtn bak kortet. På startkortet kommer ropeBtn, lvlBtn, parkBtn, evnAvslutt og den usynlige fClose før Start. Gjenskap: start spillet, trykk P og trykk Tab tre ganger.
- **K2, kjent avvik (uendret):** Spillet har ingen global feilfanger. Det eneste `onerror` i filen er på maskotbildet.
- **B1, kjent avvik (uendret):** Spillet bruker lyd (`sound()`), men har ingen lydbryter (kodelest).
- **B2 og ST2, kjent funn «spilletid teller med kartet åpent»: IKKE RETTET, verifisert på denne commiten.** `evn-spilletid-fossilspillet.totalt` økte fra 7 144 til 16 392 ms på omtrent 12,6 s med kartet åpent. I pausen sto den stille (7 144 → 7 144 på 6 s). Spillet bruker EVN-PAUSE v2 uten `window.EVNAktivTid`. Gjenskap: start spillet, trykk M og les nøkkelen etter 12 s.
- **ST1, avvik (statisk, uendret):** statistikk.js lastes nederst i `<body>` med `defer`, ikke i `<head>`. Spillet sender ikke `evn-start` og dermed ingen `versjon-fossilspillet-0.8.1`. Start blir oppdaget ved klikk på `#startBtn` i den gamle statistikk.js.
- **ST4, avvik (statisk, uendret):** Ingen `feil-fossilspillet-oppstart` eller `feil-fossilspillet-spill`.
- **ST7, avvik:** Følger av ST1, ST2 og ST4.

## Anbefalte forbedringer
- **Konsollmelding ved berøring:** Når to fingre ikke lenger blir sperret i menyene, gir den eksisterende sperren mot dobbelttrykk (`touchend` med `preventDefault`) Chromium-meldingen «Ignored attempt to cancel a touchend event with cancelable=false» på feilnivå, 9 ganger i den emulerte testen. Den kom ikke i 0.8.0. Den er ufarlig og er ikke en ufanget feil, men den roter til K1-kontrollen. Forslag: sjekk `e.cancelable` før `preventDefault()`.
- **Faktaboksen:** `#fakta` (for eksempel «Velkommen til …» i 9 s) vises mens man spiller. Da er zoom sperret. Hvis faktaboksen regnes som en dialog etter T3, bør en voksen avklare det.
- **Safe area i overlagene (UI7 er ikke tatt i bruk, så dette er bare forslag):** Liggende 812×375 med innsett 47 går bildet i dyreparken (`#field`) fra x=16 til 796, altså inn under hakket på begge sider. I pausen ligger «🚪 Avslutt» (y 323–371) delvis under hjemlinja (354) og under kortets synlige høyde (359), så man må rulle i kortet. `.overlay` har bare `padding:20px` uten `env(safe-area-inset-*)`.
- **Kartet i lave liggende vinduer (EVN-PAUSE, felles kode, også i 0.8.0):** Kartkortet er 407 px høyt både i 812×375 og 568×320, med `overflow:visible`. Den nederste delen av kartet blir derfor kuttet (skjermbilde: /tmp/qa-fossil/kart-8714-568-i.png). Er spilleren dypt nede, kan «Du er her» havne utenfor skjermen.
- Fra før: Flytt statistikk.js til `<head>`, bruk EVN-PAUSE v3 og hold Tab inne i pausen og i «Vil du avslutte?».

## Kontroller som ikke kunne utføres
- **T3 (E):** Knip på ekte Android og iPhone, både på startkortet og i menyene (se mulig problem), og i spill.
- **T1 (E):** Testet bare med emulering, ikke på faktisk berøringsenhet.
- **Safe area (E):** Bare simulert med CDP. Ikke kontrollert på iPhone med hakk eller Dynamic Island.
- **Y1 (E):** Ingen referansemobil er valgt, og bildefrekvensen er ikke målt.
- **Y2:** Kun kodelest. `dt` er begrenset til 0,05 s, og det blir pause ved `visibilitychange`. Fanebytte og ulik skjermfrekvens er ikke kjørt.
- **T4:** Kun kodelest. Farger og tekst er uendret mot main.
- **S4:** Kun kodelest. Personvernsiden omtaler localStorage og GoatCounter. Ingen nye data.
- **B5:** Kun kodelest. Faktainnholdet er uendret i diffen.
- **B1 (E):** Lyd er ikke testet med høyttaler.
- **B2, stillstand med kartet åpent:** Kun kodelest (`cfg.pause()` og `stopImmediatePropagation` på taster). Posisjonen ble ikke sammenlignet før og etter.
- **ST5, ST6:** Kun kodelest. Navnene er godkjente, og det er ingen informasjonskapsler eller ID-er. Skriptet kjører ikke lokalt.
- **ST8:** `test/statistikk/` finnes verken på grenen eller på main (kjent). Om hendelsene kommer fram i GoatCounter, må en voksen med innlogging kontrollere.
- **Ctrl+= i pausen og i kartet:** Kun kodelest. Spillets lytter sperrer ikke når `iSpill()` er usann, og EVN-PAUSE stopper tasten uten `preventDefault`. Om nettleseren faktisk zoomer, kan ikke måles i headless.
- **V:** U2, U3 og hvordan det oppleves at menyene kan zoomes og at kantene har ny avstand. Dette vurderer Even.
- Spillet er ikke fullført, og ingen dyr er vekket. Feiringen er ikke vist.
- UI1–UI10 er ikke tatt i bruk for Fossil Zoo, og klarspråk har status forslag. Ingen av dem er kontrollert.

## Klar for testing hos Even?
JA MED FORBEHOLD – Viewport- og zoomendringen virker i JS som beskrevet, safe area gir riktige avstander, og F1–F3 er testet uten feil, også med lagring fra 0.8.0. Det er ikke testet om knip faktisk virker i menyene på ekte mobil. `touch-action:none` på html og body kan fortsatt hindre det. De kjente avvikene T2, K2, B1, B2/spilletid, ST1, ST2 og ST4 gjelder fortsatt.
