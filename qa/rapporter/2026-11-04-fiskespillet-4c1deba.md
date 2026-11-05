# EVN Game QA: Fiskespillet 0.2.0
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit 4c1deba335194266e03e9d90729818385e54869f
Testkvittering: evn1 commit=4c1deba335194266e03e9d90729818385e54869f tester=ae16fbc5a7fc arbeidstre=rent statisk=ok royk=ok statistikk=feil ui=feil ecoins=ok
Nivå: full – nytt spill. Testkvitteringen: `statistikk=feil` og `ui=feil` kommer av at `test/statistikk/` og `prototype/ui/` ikke finnes på grenen. `origin/main` finnes ikke i den grunne klonen, så skriptet kunne ikke avgjøre om testene er obligatoriske. Alle 12 kontroller for fiskespillet i `statisk` og `royk` er OK.
Testet: lokal `python3 -m http.server` (127.0.0.1:8765, er stoppet) og `test/kjor.mjs` (egen server). Headless Google Chrome for Testing 153 med puppeteer-core, WebGL via SwiftShader med 1–4 bilder/s, så spillet går med ca. 20 % fart (dt-tak 0,05 s). Størrelser: 1280×800 (mus og tastatur), 375×812 og 740×360 (emulert berøring, DPR 2). Ekte mus- og tastetrykk og emulert berøring via CDP. For å sette opp tilstand brukte jeg `#test`, egne lagringer i localStorage og teleportering via `window.__spill`. localStorage var tom før og etter hver økt. Klonen er urørt (`git status` er tom).

## Oppfylte krav
- **F1:** Start (musklikk og berøring), kjøring (piltaster og styrespak), fisking i åpent vann og ved fiskested, full båt, levering, akvarium, salg, «Selg alle», kjøp av alle varetyper, pause og fortsett (P, Esc og knapp), kart (M og knapp), fiskebok (I og knapp) og Avslutt (Nei og Ja) virker uten heng. Røyktesten er også OK. Penger stemmer ved hvert kjøp og salg (for eksempel 20 027 → 19 877 for Karbonstang 150).
- **F2:** Penger, utstyr, Kraken-status og lydvalg er der etter omlasting. Lagring skjer ved pause, hvert 5. sekund og ved `pagehide`. «Start helt på nytt» vises bare når det finnes fremgang og åpner en bekreftelsesboks: «Nei» beholder alt, «Ja» sletter `evn-fiskespillet-v1`. Lydvalget og spilletiden beholdes.
- **F3 (delvis, se avvik):** Ugyldig JSON krasjer ikke. En kopi lagres i `evn-fiskespillet-v1-kopi`, og spillet starter på nytt. `null`, `[]`, `"tekst"` og en lagring med feil typer i alle felt gir ingen feil og ingen NaN. Det finnes ingen eldre versjon å ta vare på (første versjon).
- **Kraken:** Kampen starter og fyller linjen. Uten trykk slipper Kraken unna etter ca. 20 s (redusert fart), med meldingen «Kraken slapp unna! Prøv igjen» og et tips. Med raske trykk fanges den (PC: 22 trykk på E, mobil: 43 trykk på «Dra!»), og man får 💰 10 000 første gang. Holdt E teller én gang: 10 automatiske gjentakelser ga 0 ekstra. Ett trykk på mellomrom, Enter eller E gir +3,5, uten dobbel telling. Ett trykk på mobil gir ett drag.
- **U1:** Startkortet har EVN STUDIO, tittel, mål og oppdrag, styring for PC og berøring hver for seg, ▶ Start, «← Tilbake til EVN Studio» og «Versjon 0.2.0». Alt er synlig uten sideveis rulling i alle tre størrelser.
- **U2 (Q):** Handlingsknappen viser alltid hva som kan gjøres («🎣 Fisk», «⚓ Havna», «📦 Båten er full», «🐙 Trenger Superstang»). Det kommer en melding ved ny sone og ved full båt, og en pil viser veien hjem. Pausen har «Slik styrer du».
- **U3 (Q):** Tekstene er korte og på enkel norsk. Tap er mildt: Kraken svømmer bort, du kan prøve igjen, og ingenting går tapt.
- **T1:** Alle synlige knapper og lenker er minst 44×44 px i 1280×800, 375×812 og 740×360. Minste mål var 44 px (Fiskeboka, Tilbake, Start helt på nytt). Statuspillene er ikke knapper.
- **T4 (Q):** Sjeldenhet vises med navn og stjerner i tillegg til farge, og full båt med «5/5» og tekst. Teksten er hvit eller mørk på mørke eller gule flater.
- **K1:** Ingen konsollfeil, ingen ufangede feil og ingen 404 under normal bruk i noen økt. Det gjelder også `test/kjor.mjs`.
- **K2:** En uventet feil under spilling, både i et skript og i spill-løkka, viser «Oi, noe gikk galt 🐙» med knappen «🔄 Last på nytt», og fokus står på knappen.
- **S1:** CSP med `object-src 'none'`, uten `unsafe-eval` og bare med de godkjente domenene for GoatCounter (`statisk` OK). Ved kjøring var det ingen CSP-brudd og ingen forespørsler utenfor 127.0.0.1.
- **S2 (Q):** Ingen konto, chat, reklame eller ekte kjøp. «Penger» og butikken er bare i spillet. Robotens antrekk leses fra E-coins: med lagret antrekk (pirathatt og ryggsekk) vises 8 ekstra deler, og det kom ingen feil.
- **S3:** Ingen fritekst (ingen input- eller textarea-felt).
- **S4:** Personvernsiden sier generelt at fremgang lagres lokalt og ikke sendes ut. Det stemmer med det spillet gjør.
- **ST3 (kodelest, kjørt):** `statistikk.js` avslutter utenfor `evnstudio.no`. Lokalt ble det ikke lastet noe fra gc.zgo.at.
- **ST6:** Ingen informasjonskapsler eller ID-er. Spillet lager ikke egen statistikk.
- **B1:** 🔊 og L slår lyden av og på. Valget lagres i `evn-fiskespillet-lyd` og huskes etter omlasting.
- **B2:** Kartet viser spilleren (🔺), havna, fiskesteder og Kraken. Båten står stille mens kartet er åpent, også med piltasten holdt.
- **B3 (melding):** Uten WebGL viser startkortet «3D virker ikke her» med forklaring, og Start er slått av.
- **B4 (Q):** Kraken er tegneserieaktig (lilla tentakler) og valgfri. Det er ingen skremmende tap.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- **ST1, ST2, ST4, ST7 – verifisert feil (koden er entydig, ikke kjørt på evnstudio.no):** `statistikk.js` på denne committen er den gamle versjonen. Den har ingen oppdager for `fiskespillet` og lytter ikke på `evn-start`. Spillet sender `evn-start` én gang ved Start (målt) og har `data-spill="fiskespillet"` i `<head>`, men på evnstudio.no blir det bare registrert sidevisning, ikke `start-fiskespillet`, `versjon-…` eller `feil-…`. Spillet bruker EVN-PAUSE v2 uten `window.EVNAktivTid`. Spilletiden i `statistikk.js` teller synlig fane, også i pause. Det samme gjelder alle spill på grenen. Grenen må få statistikkoppdateringen fra `feature/statistikk`/`main` før publisering. Slik gjenskaper du feilen: les `statistikk.js` linje 51–88 (`oppdagere`).
- **T2 – kjent funn, fortsatt til stede og også i flere dialoger:** Tab går ut av pausekortet til BODY, 📖, 🔊 og Avslutt. Det samme skjer i kartet, i «Vil du avslutte?» og i «Starte helt på nytt?». Alt dette er felles kode (EVN-PAUSE v2, EVN-NULLSTILL v1 og Avslutt-boksen) uten rettingen Dyrepatruljen 0.10.13/14 har. Slik gjenskaper du feilen: åpne pausen med P og trykk Tab 3 ganger. Spillets egne dialoger (Havna, Fiskeboka, Stor fangst) holder fokus riktig. Tab og Shift+Tab går rundt.
- **T3 – verifisert feil (liten):** Kameraet rister i Kraken-kampen (`oppdaterKamp`, `camera.position.x += random`), også når `prefers-reduced-motion: reduce` er satt. CSS-animasjonene skrus av riktig (målt `animation-name: none`).
- **T3 – mulig problem:** `gesturestart` blir stoppet så lenge `spillTilstand === 'spill'`. Det gjelder også når Havna, Fiskeboka eller Stor fangst er åpen, så klypezoom i disse dialogene kan være sperret på iPhone/Safari. Pausen er ikke berørt. Dette må avgjøres på en ekte iPhone.
- **F3 – verifisert feil (bare med manipulert lagring, ikke kritisk):** Lagring med `plass` eller `akvPlass` som ikke går opp i 5 (for eksempel 7) gir prisen «💰 NaN» i butikken. Kjøpet går gjennom, og pengene blir `NaN` (HUD viser «NaN»). Ved lagring blir de `null`, som leses som 0. Slik gjenskaper du feilen: lagre `{"v":1,…,"baat":2,"plass":7,"akvPlass":8}`, åpne Havna og velg Butikk. Vanlig spill gir alltid tall som går opp i 5.

## Anbefalte forbedringer
- Ta med Fiskespillet i standardens oversikt «Hvilke krav gjelder for hvert spill». Jeg har brukt B1, B2, B3 og B4. B5 gjelder ikke fordi spillet ikke har læringsfakta (klovnefisk i «Kystvannet» er fantasi), og B6–B7 gjelder ikke.
- Lagring med en annen `v` (for eksempel en fremtidig v2) blir overskrevet uten kopi ved første pause eller kart (målt). Ta en kopi som ved ugyldig JSON. «Start helt på nytt» sletter ikke `evn-fiskespillet-v1-kopi`.
- Avrund `plass` og `akvPlass` ned til nærmeste trinn på 5 i `lastInn` (retter F3-funnet).
- Fokus etter Start havner på BODY fordi `#handling` er skjult når `focus()` kjøres.
- På startkortet overlapper «Tilbake til EVN Studio» og «Start helt på nytt» hverandre med 8 px (felles `margin:-8px`), i alle tre størrelser.
- Mobil: Havna og Fiskeboka kan bare lukkes med «Lukk» nederst. Fiskeboka er 1163 px høy på 375×812, og i 740×360 må man rulle for å finne Lukk. Vurder ✕ øverst eller trykk utenfor. I 740×360 er kartkortet 369 px høyt og blir kuttet med 21 px.
- Mobil 375×812: meldingen (y 110–218) dekker en del av 📖-pillen, og «📖 5/5 000» kan leses som «5/5». Vurder for eksempel «5 av 5000».
- `webglcontextlost` håndteres ikke (samme mulige problem som kjent i Mørkeskogen). Uten WebGL sendes feilen videre som en ufanget feil i konsollen (`throw e`).
- Lavere grafikk på svake enheter er bare et tak på DPR (1,5 på berøring), uten automatisk nedskalering.
- Fart under 20 bilder/s: dt-taket gjør at spillet går saktere, og Kraken-kampen blir lettere fordi trykk teller i sanntid. Dette betyr ikke noe på normal maskinvare.

## Kontroller som ikke kunne utføres
- **ST5, ST8:** `test/statistikk/` finnes ikke på grenen, så statistikktestsiden kunne ikke kjøres. Om hendelsene kommer frem i GoatCounter, krever en voksen med innlogging etter publisering.
- **Y1:** Ingen referansemobil er valgt, og det er ikke målt på ekte enhet. Headless SwiftShader viser 1–4 bilder/s, som ikke sier noe om ekte maskinvare.
- **Y2:** Fanebytte og fokustap åpner pausen («Pause fordi du gikk ut av spillet»), og spillet fortsetter bare med Fortsett. At farten er uavhengig av skjermfrekvens, er bare kodelest (dt-basert, tak 0,05 s). 60/120 Hz kunne ikke kjøres.
- **K3:** Versjonen vises (0.2.0 i tittel og startkort), men `ENDRINGSLOGG.md` har ingen rad for Fiskespillet ennå. Den må med ved publisering, og spillet er ikke publisert.
- **T1, T3 og B1 (E), UI-likt oppsett:** Ekte berøring, zoom på iPhone og Android og faktisk lyd er ikke testet. Mobil er emulert.
- **B3 (E):** Ytelse og grafikknivå på svake enheter.
- **U2, U3 og B4 (V):** Om Even og 7-åringer forstår spillet, og om Kraken-kampen er lett nok og morsom (balansen på ekte maskinvare: slipp 5,4–13,8 per s mot +3,5 per trykk), må Even teste.
- **UI1–UI10:** Ikke kontrollert. Det er godkjent hovedløsning, men ikke tatt i bruk for dette spillet.
- Akvarieinntekten er bare kontrollert kort (25 → 717 på ca. 1 s med 25 legendariske fisker, 15 028 per min). Ekte økter på 15–60 minutter er ikke testet.

## Klar for testing hos Even?
JA MED FORBEHOLD – Ingen kritiske feil, og F1 er testet med ekte tastetrykk og klikk. Ytelse på ekte enheter (Y1), berøring, lyd og spillopplevelsen er ikke testet. Statistikken (ST1/ST2) og fokusfellen i de felles dialogene (T2) må rettes før publisering.
