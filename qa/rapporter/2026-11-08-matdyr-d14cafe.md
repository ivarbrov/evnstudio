# EVN Game QA: Matdyr-regn 0.10.3
Grunnlag: agent 2.2 (utkast), standard 1.1 (gjeldende; fila er utkast 1.2) (119ac87f3b1a36769c7e1339cc640fe3c895880f), commit d14cafe7c9a203a886fb85a4d18494a5546fe88f
Testkvittering: evn1 commit=d14cafe7c9a203a886fb85a4d18494a5546fe88f tester=399958fdfc5c arbeidstre=rent statisk=ok royk=ok statistikk=ikke-innfort ui=ikke-innfort ecoins=ok
Nivå: full – nytt spill som foreslås publisert ved PR #59. Main er flettet inn, og `statistikk.js` (felles kode) teller nå `evn-start`. Alle kontrollene under er kjørt på nytt mot d14cafe; ingenting er overført fra tidligere commiter. `spill/matdyr/` er byte-lik med bd5ac13. `statistikk.js` er lik origin/main (1f32ee0), og den lytter på `evn-start`.
Testet: `node test/kjor.mjs` ga 86 OK, 0 FEIL, 0 VARSEL og 2 IKKE INNFØRT (statistikk og ui); røyktesten viser 0.10.3 for Matdyr og de nye patch-versjonene for de fire andre spillene. `publiseringssjekk.mjs` ga 3 FEIL og 2 VARSEL (FEIL: PR-en endrer `test/index.html` med én linje, som er dokumentert; FEIL ×2: rapporten for d14cafe er ikke lagret ennå; VARSEL: Matdyr står ikke i standardens oversikt over betingede krav; VARSEL: testkvitteringen er bare kontrollert på formen ved lokal kjøring). Egen `python3 -m http.server` på 127.0.0.1:8931 fra repoets rot. Headless Chromium med Playwright og SwiftShader; tidsavhengig spillogikk kjørt med `step(dt)`. PC 1280×800 med ekte tastetrykk og musklikk. Mobil 375×812, 740×360, 320×568 og 568×320 med emulert berøring (`tap` og CDP touch). Statistikk som på evnstudio.no: forespørsler rutet til lokale filer, `gc.zgo.at/count.js` byttet ut med en stubb som registrerer `goatcounter.count`; spilletid målt i ekte tid (01min), og milepælene målt med forkortet minutt (bare `statistikk.js` sitt 5000 ms-intervall satt til 20 ms). Hver kjøring fikk en ny kontekst, og localStorage ble tømt. Serveren er stoppet (svarer 000), det er ingen nettleserprosesser igjen, og `git status` er tom. Skript: /tmp/qa-mat/ (t1–t13.py, med resultater i ut-*).

## Oppfylte krav
- ST1: `statistikk.js` med `data-spill="matdyr"` ligger i `<head>` før spillets skript. Spillet sender `evn-start` én gang ved start (Enter, klikk og tap). Det er ingen egen statistikk i spillet (ingen `fetch`, `sendBeacon` eller goatcounter-kall).
- ST3: Lokalt gikk det 0 eksterne forespørsler. Skriptet returnerer før GoatCounter lastes når vertsnavnet ikke er evnstudio.no (kodelest og kjørt).
- ST5: Før start kom det bare sidevisning, også etter 70 s med synlig side og musebevegelse. `start-matdyr` («Spillstart: matdyr», event:true) ble sendt én gang etter klikk, Enter og tap. Ingen dobbel telling etter to ekstra `evn-start`, pause og fortsett, kart åpnet og lukket, eller Avslutt fulgt av «Nei». Omlasting gir ny sidevisning uten start, og ny start gir én `start-matdyr`. `spilletid-matdyr-01min` kom etter cirka 60 s i ekte tid. Med forkortet minutt kom 01, 05, 15, 30 og 60min én gang hver, og alle navnene var unike. Ingen fritekst og ingen basenavn i hendelsene.
- ST6: `document.cookie` er tom. Ingen ID-er og ingen nye domener (bare `gc.zgo.at` og `evnstudio.goatcounter.com`).
- F1: Start med Tab og Enter, og `evn-start` ble sendt én gang. D flytter roboten (−38 → −27,5). E tar med et Common, og det betales i basen (60 → 10). P og Esc gir pause og fortsett. Avslutt: «Nei» og Esc fortsetter, «Ja, avslutt» går til forsiden, og Avslutt fra pausen virker også. Fangst av Legendary: bom koster 0, den blir sliten etter 2,4 s jag, og den ble fanget. Bytt med svakeste, «Velg en annen plass» og Avbryt; slipp uten refusjon; salg med bekreftelse; fangstnivå under ⚙️ lagres; Matdyrboka åpnes med I og 📖.
- F2: Penger, basen, Matdyrboka og matdyret roboten bærer overlever omlasting. «Start helt på nytt»: Esc og «Nei» beholder alt; «Ja» sletter bare spillets nøkler, mens gfx, fangst, spilletid og andre spill står igjen.
- F3: Ugyldig JSON gir startverdier og `-kopi`. Ødelagt ny nøkkel med gyldig `evn_matdyr_proto_v1`: den gamle lagringen leses (777, 6 plasser), og den ødelagte legges i `-kopi`. Den gamle nøkkelen migreres og beholdes. Søppelverdier renses bort, og `v:2`, `null`, tall og array gir startverdier, uten sidefeil.
- U1: Startkortet har merke, tittel, mål, styring for PC og berøring, Start, «← Tilbake» og «Versjon 0.10.3».
- U2: Intro-hint med pil vises. 💤-meldingen vises når spilleren er inaktiv, og inntekten stopper (+0). Styringshjelpen i pausekortet finnes i PC- og berøringsvariant.
- U3: Tekstene er korte og vennlige, og bom og «ikke råd» straffer ikke spilleren.
- T1 (emulert): Alle synlige trykkflater er minst 44×44 px i fire størrelser og seks tilstander. Ingen sideveis rulling.
- T2: I spillet går Tab gjennom 📖, ⚙️, 🗺️, ⏸, Avslutt, ＋ og －. Tab går rundt i pausekortet, kartet, Avslutt-spørsmålet, Matdyrboka, bytt-dialogen (begge retninger) og feilkortet. Unntak: se avvik.
- T3: Zoom er ikke sperret (`kjor.mjs`). `prefers-reduced-motion` gir `animation:none`, og `RM` er true.
- T4: Hvit tekst på handlingsknappene har kontrast fra 4,14:1 til 6,6:1 (grønn); rød 5,17:1, oransje 4,38:1. Informasjon har tekst eller ikon, ikke bare farge.
- K1: `kjor.mjs` er OK. 0 sidefeil utenom de utløste, 0 svar på 400 eller høyere og 0 CSP-brudd, også som på evnstudio.no.
- K2: Feil og `unhandledrejection` gir feilkortet med fokus på «Last inn på nytt». Fanebytte etter feilen åpner ikke pausen, og et ekte klikk laster siden på nytt. Pause før feilen laster også på nytt.
- K3: 0.10.3 står i tittel, startkort og `VERSJON`. ENDRINGSLOGG-raden for 0.10.3 sier at start og spilletid telles, og det stemmer med testen.
- S1: CSP er OK (`kjor.mjs`).
- S2: Ingen konto, chat, reklame eller kjøp med ekte penger.
- S3: `<img src=x onerror=…>` som basenavn vises som tekst og kjøres ikke. Lengden kuttes til 20 tegn. Navnet sendes ikke ut.
- S4: Personvernsiden nevner basenavnet i Matdyr-regn.
- B2: M og 🗺️ åpner kartet med 🔺 for spilleren. Spillet og EVN-spilletiden står stille, og Tab blir i kartet.
- B3: Uten WebGL vises en vennlig melding, Start er skjult og «Tilbake» er synlig. Tapt kontekst gir «3D-grafikken stoppet 😕». Grafikken kan byttes mellom «Rask» og «Fin».
- B7: `maxlength=20` og `slice(0,20)`. Tomt navn avvises. Basenavnet er omtalt på personvernsiden.
- Forsiden: Matdyr-kortet har «Nytt», og Matdyr-regn er øverste nyhet. Bildet laster, og det er 0 feil.

## Kritiske feil som må rettes
Ingen funnet i det som er testet.

## Andre avvik fra felles standard
- ST2 – verifisert, kjent avvik (som for de andre spillene, uendret av denne PR-en): spilletid i `statistikk.js` teller også når spillet står stille. Testet med forkortet minutt: med pausen åpen, med kartet åpent og uten aktivitet ble `spilletid-matdyr-01/05/15min` likevel sendt. Skjult fane telte ikke. ENDRINGSLOGG nevner pause; kart og inaktivitet har samme årsak, men er ikke nevnt.
- ST4 og versjon (ST7) – verifisert, kjent avvik: Etter en feil kommer ingen `feil-matdyr-…`, og det sendes aldri `versjon-matdyr-0.10.3`. Begge står i ENDRINGSLOGG.
- T2 – verifisert, mulig brudd (uendret): I «Start helt på nytt» går Tab «Nei» → «Ja» → BODY (nettleseren) → «Nei». Årsak: tastaturlytteren i EVN-NULLSTILL kaller `stopImmediatePropagation` før Tab-fella i EVN-PAUSE. Ingenting bak dialogen får fokus. ENDRINGSLOGG sier at Tab blir i dialogen; det stemmer ikke helt. Koden er felles og byte-lik med Fiskespillet.
- U1 (synlig Start), verifisert, liten (uendret): I 568×320 må startkortet rulles for å nå Start (y 287–352). «← Tilbake» ligger under kanten i 740×360, 320×568 og 568×320.

## Anbefalte forbedringer
- Liggende mobil (740×360 og 568×320): I basen dekker «⬆️ Flere plasser» knappen «－». UI7 er ikke gjeldende for spillet.
- Pausekortet i 568×320: «🚪 Avslutt» ligger under kanten og nås bare ved å rulle i kortet.
- Fokus etter kartet: Når kartet lukkes med Esc, går fokus til BODY og ikke tilbake til 🗺️.
- Bak feilkortet: Spillet går videre (`paused` false) mens feilkortet vises.
- Lagring med ukjent format: `v:2`, `null` og array gir startverdier uten `-kopi`, så originalen overskrives ved første lagring.
- Standarden: Matdyr-regn mangler i oversikten per spill. Jeg har brukt B2, B3 og B7; B1 gjelder ikke, fordi spillet ikke har lyd.

## Kontroller som ikke kunne utføres
- ST8: `test/statistikk/` finnes ikke (IKKE INNFØRT). Statistikken er i stedet kontrollert med egne skript (t11–t13). Milepælene 05–60min er bare testet med forkortet minutt. Om hendelsene faktisk kommer fram i GoatCounter, må en voksen med innlogging sjekke.
- Y1 (E): Ikke valgt referansemobil. Ikke testet.
- Y2: Delvis kjørt, ellers kun kodelest. Fanebytte og blur gir pause (syntetisk visibilitychange). `dt` er begrenset til 0,05, så spillet går saktere under 20 FPS. 60 og 120 Hz er ikke målt.
- T1, T3, B3 (E): Ekte berøring, klypezoom og svake enheter er ikke testet.
- U2, U3 (V): Even må vurdere om spillet er forståelig og morsomt. ENDRINGSLOGG sier at han godkjente spillopplevelsen 7.11; det er ikke kontrollert her.
- Ikke kjørt: lange økter (15–60 min) i ekte tid.
- B1, B4, B5, B6: Gjelder ikke spillet.
- UI1–UI10 (UI8a–c inkludert): Godkjent hovedløsning, men ikke tatt i bruk for spillet. Ikke målt.

## Klar for testing hos Even?
JA MED FORBEHOLD – F1–F3 og K2 virker på d14cafe, og jeg fant ingen kritiske feil. Statistikken teller nå `start-matdyr` én gang per sidebesøk, ingenting før start og spilletid uten dobbel telling, men spilletiden teller også i pause, i kartet og uten aktivitet (kjent ST2). `feil-` og `versjon-` mangler, Tab går ut av «Start helt på nytt», og Y1, ekte berøring og GoatCounter er ikke testet.
