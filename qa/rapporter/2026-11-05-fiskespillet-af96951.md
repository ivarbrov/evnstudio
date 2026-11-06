# EVN Game QA: Fiskespillet 0.6.1 med forsidekort
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit af9695177757383dea238d15e51596be609cbeb4
Testkvittering: evn1 commit=af9695177757383dea238d15e51596be609cbeb4 tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – Versjonen foreslås publisert, spillet er nytt på `main`, og forsiden er endret.
- Siden 100ddd8 er bare `index.html`, de to bildene, ENDRINGSLOGG og `test/index.html` endret. Røyktesten fikk én linje i c4346ff, og den linja kom tilbake i af96951.
- `spill/`, `statistikk.js`, `vendor/`, `ecoins/` og `fonter/` er uendret siden 100ddd8, fordi diffen er tom.
- Forsidens CSP og `<head>` er ikke rørt.
- `node test/kjor.mjs` ga ingen FEIL og ingen VARSEL. Eneste KJENT er T3 i Fossil Zoo, som ikke gjelder dette spillet. Røyktesten for Fiskespillet er OK.

Testet:
- **Server:** egen `python -m http.server` på 127.0.0.1:8823. Rota var en `git archive` av commiten, utenfor repoet.
- **Nettleser:** installert Chrome i headless-modus, styrt med egne CDP-skript. Nettleserpanelet var skjult, så jeg brukte det ikke til målinger.
- **Metode:** ekte tastetrykk (`Input.dispatchKeyEvent`), musklikk (`dispatchMouseEvent`) og emulert berøring (`dispatchTouchEvent`, DPR 2).
- **Forsiden:** 1280×800, 1440×900, 1100×800, 1024×768, 768×1024, 375×812, 812×375, 320×568 og 568×320.
- **Spillet:** 1280×800, 375×812, 812×375 og 320×568.
- **Statistikk:** testet som på evnstudio.no. Forespørslene ble avskåret, filene servert lokalt, og `count.js` var en stubb.
- **Testtilstand:** satt med JavaScript, nemlig `__spill.tilstand.penger` og ødelagte lagringer.
- **Opprydding:**
  - localStorage er tømt.
  - Testserveren og nettleserpanelet er stoppet, og porten svarer ikke.
  - `git status` er tom.
  - 12 midlertidige Chrome-profiler fra testene ligger igjen i systemets temp-mappe, utenfor repoet. Jeg fikk ikke lov til å slette dem.

## Oppfylte krav
- **Forsidekortet:**
  - **Lenker:** Disse tre veiene førte til `/spill/fiskespillet/` («Fiskespillet 0.6.1 – EVN Studio»):
    - Tab til kortet og Enter.
    - Musklikk midt på bildet.
    - Trykk på «Spill nå» ved 375×812.
  - **Bilder:** `fiskespillet.jpg` er 800×500 og `-1200.jpg` er 1200×750. Begge ga svar 200 og har ingen EXIF eller XMP. `srcset` valgte 800w på PC og 1200w ved 568×320 med DPR 2.
  - **Alt-tekst:** Den stemmer med bildet: roboten i båt med fiskestang foran øya, med Havna, Akvariet og fyrtårnet.
  - **«Nytt»-merket:** Det står bare på Fiskespillet og overlapper verken tittel eller stikkord.
  - **Oppsett:** Ingen sideveis rulling i noen av de ni størrelsene.
    - Over 1180 px vises kortene 3 + 3, mellom 681 og 1180 px 2 + 2 + 2, og ellers i én kolonne. Det stemmer med CSS-kommentaren.
    - Tittel og tekst klippes ikke.
- **Nyhetene:**
  - Rekkefølgen er «Nytt spill: Fiskespillet!» (5.11.), deretter Magiske egg og «Hei, EVN!». Nyheten om Dyrepatruljen er tatt ut, men spillkortet står fortsatt.
  - Både Enter og klikk på brødteksten fører til spillet. `::after` gjør hele kortet klikkbart.
  - Oppsettet er riktig både på PC og mobil.
- **T1 (emulert):**
  - «Spill nå» er 52–61 px høy, og hele kortet er én lenke.
  - Nyhetslenkene er 24 px høye som tekst, men treffflaten er hele nyhetskortet.
  - Lenkene «personvern» og «sikkerhet» er uendret og står inne i teksten.
- **T2:**
  - **Forsiden:** Tab går gjennom menyen, de seks kortene i rekkefølge, de tre nyhetene og bunnmenyen. Kortet viser en hvit fokusramme på 3 px (`:focus-visible`), og nyhetskortet har ramme med `:focus-within`.
  - **Spillet:**
    - Tab blir i pausekortet, som har 4 knapper. Det kjente funnet om Tab ut av pausen skjer ikke her.
    - I «Vil du avslutte?» står fokus på «Nei, spill videre», og Tab går bare mellom de to knappene.
    - I nullstillingen står fokus på «Nei».
- **T3:** Viewport sperrer ikke zoom, verken på forsiden eller i spillet. Med «reduser bevegelse» er kortet og nyheten synlige (opacity 1) uten overgang (0 s).
- **T4:** «Nytt» vises som tekst, ikke bare med farge.
- **F1:**
  - Tab til Start og Enter starter spillet. W i 2,5 s flyttet båten 23,6 enheter.
  - Esc åpner pausen, og spillet står stille i pause. Esc lukker pausen, og P og klikk på Fortsett virker.
  - «Avslutt», så «Ja, avslutt», fører til forsiden med det nye kortet.
  - Ved 375×812, 812×375 og 320×568 er Start synlig, det er ingen sideveis rulling, og spillet starter med emulert trykk.
- **F2:** Pengene (4321) ble lagret ved avslutning og var der etter omlasting. I nullstillingen beholder Esc lagringen, og «Ja» sletter `evn-fiskespillet-v1`.
- **F3:**
  - Ugyldig JSON, `v:2` og `[]` gir startverdier og en `-kopi`, uten feilkort.
  - Rare verdier i `v:1` gir 0, og spillet starter.
  - Lagring fra 0.5.8 er verifisert ved 100ddd8, og spillfila er byte for byte uendret.
- **U1:** «Versjon 0.6.1» står på startkortet og i tittelen, og det er en vei tilbake til forsiden.
- **K1:**
  - Forsiden ga ingen feil, CSP-brudd eller svar på 400 eller høyere i noen størrelse.
  - I spillet kom bare varselet fra den ødelagte JSON-en jeg la inn med vilje.
  - `kjor.mjs` er OK for alle seks spill.
- **K3:** ENDRINGSLOGG har en ny rad for forsiden som stemmer med diffen. Raden for 0.6.1 viser til den nye raden.
- **S1:** Forsidens CSP er uendret mot `main`, og den statiske kontrollen av spillet er OK.
  - Lokalt gikk det ingen forespørsler ut.
  - Som på evnstudio.no gikk det bare forespørsler til `gc.zgo.at/count.js` og `evnstudio.goatcounter.com`. Ingen andre domener.
- **S2 og S3:** Det nye kortet og nyheten har ingen skjema, konto, kjøp eller fritekst.
- **S4 (Q):** Personvern- og sikkerhetssidene er generelle og stemmer med det forsiden gjør.
- **ST3:** Lokalt sendes ingenting ut.
- **ST5:** Bare én sidevisning for `/` og én for `/spill/fiskespillet/`.
- **ST6:** `document.cookie` er tom, og forsiden lagrer ingenting i localStorage eller sessionStorage.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST1, ST2, ST4 og ST7 – verifisert feil (kjent forbehold, godkjent av en voksen, uendret):**
  - Slik gjenskapes det: Simuler evnstudio.no og gå fra forsidekortet til spillet. Trykk Start og vent 4 s. Bare de to sidevisningene sendes, ikke `start-`, `versjon-`, spilletid eller feil.
  - Årsak: `statistikk.js` har ingen oppdager for `fiskespillet`.

## Anbefalte forbedringer
- **ENDRINGSLOGG:** I raden for forsiden står det «Flere spillstarter i Fiskespillet» i kolonnen «Kan påvirke». Spillstarter telles ikke for dette spillet (ST1). Det som kan øke, er sidevisninger av `/spill/fiskespillet/`.
- **`loading="lazy"`:** Bare Fiskespillet-kortet har det. Ved 1280×800 er kortet delvis synlig ved første visning, med toppen ved 613 px. Bildet lastet i alle testene, men det kan komme litt senere enn bildene på de andre kortene.
- **Standarden:** Fiskespillet mangler fortsatt i oversikten per spill. Jeg har brukt B1–B4 som før.
- **Fra forrige rapport:** Forslagene om eventets snittverdi, Sjømonsteret etter 18.30, monstertiden uten aktivitet, HUD ved 320×568, `harLagring` og `venner` står fortsatt. Spillfila er uendret, og de er ikke testet på nytt.

## Kontroller som ikke kunne utføres
- **ST8:** `test/statistikk/` finnes ikke (ikke innført). Om hendelsene faktisk kommer fram i GoatCounter, kan bare en voksen med innlogging kontrollere. Statistikken ble testet med en stubb, ikke med den ekte `count.js`.
- **Y1 (E):** Ingen referansemobil er valgt.
- **Y2:** Fanebytte og 60/120 Hz er ikke kjørt.
- **T1 og T3 (E):** Ekte berøring, klypezoom, iPhone/Safari og Android er ikke testet. Forsiden er bare testet i emulering.
- **Ikke kjørt på nytt** (spillfila er byte for byte lik 100ddd8, der de er verifisert):
  - K2 (feilkort), B1 (lydbryter), B2 (kart), B3 (melding uten WebGL) og B4 (Q).
  - Torsdags-eventet, Sjømonsteret og Kraken-flyten.
  - Lagring fra 0.5.8.
- **B1 og B3 (E):** Lyd og lavere grafikk på svake enheter krever en faktisk enhet.
- **U2, U3 og B4 (V):** Even må vurdere om kortbildet, teksten og nyheten er forståelige og fristende for målgruppen.
- **Lange økter:** 15–60 min er ikke kjørt.
- **B5–B7:** Gjelder ikke.
- **UI1–UI10:** Godkjent hovedløsning, men ikke tatt i bruk for spillet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Forsidekortet, nyheten, lenkene, bildene, tastaturet og oppsettet virker i ni størrelser, og F1–F3 er kjørt på nytt uten feil. Statistikken gir fortsatt bare sidevisninger (kjent forbehold), og ytelse, lyd og berøring på ekte enhet er ikke testet.
