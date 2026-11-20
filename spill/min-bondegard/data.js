/* Min Bondegård – alle tall for nivå 1–20 på ett sted (nivå 11–13 kom i 0.22.0, 14–16 i 0.23.0 og 17–20 i 0.24.0, pakke 1–3 i claude/min-bondegard-niva-11-20-plan.md).
   Spillet (index.html), spillreglene (logikk.js), testene og simuleringen leser denne fila, så tallene ikke kan skli fra hverandre.
   Kilde: claude/min-bondegard-progresjon.md v3 (godkjent grunnlag 8.11.2026). Endrede tall krever ny simulering. */
(function (rot) {
  'use strict';
  var D = {
    // Avlinger: plant 1, høst 2. «gratis»: kan alltid plantes selv om siloen er tom (progresjonsregel F2).
    avlinger: {
      hvete:     { navn: 'Hvete',     ikon: '🌾', nivaa: 1, tid: 30,  verdi: 2, xp: 1, gratis: true },
      mais:      { navn: 'Mais',      ikon: '🌽', nivaa: 2, tid: 60,  verdi: 4, xp: 1, gratis: true },
      erter:     { navn: 'Erter',     ikon: '🫛', nivaa: 5, tid: 120, verdi: 6, xp: 2 },
      sukkerror: { navn: 'Sukkerrør', ikon: '🎋', nivaa: 7, tid: 180, verdi: 8, xp: 2 },
      gulrot:    { navn: 'Gulrot',    ikon: '🥕', nivaa: 9, tid: 90,  verdi: 5, xp: 2 },
      gresskar:  { navn: 'Gresskar',  ikon: '🎃', nivaa: 15, tid: 300, verdi: 15, xp: 4 }   // 0.23.0
    },
    // Dyr: ett for gir ett produkt etter «tid» sekunder. Et dyr uten for slutter bare å produsere (progresjonsregel F6).
    dyr: {
      hone: { navn: 'Høne', flertall: 'Høner', ikon: '🐔', nivaa: 1,  spiser: 'honsefor', produkt: 'egg',    tid: 60,  xp: 1, start: 3, flere: { 11: 4 } },   // «flere»: antall dyr fra nivå (0.22.0)
      ku:   { navn: 'Ku',   flertall: 'Kyr',   ikon: '🐄', nivaa: 6,  spiser: 'kufor',    produkt: 'melk',   tid: 120, xp: 2, start: 2, hus: 'fjos', flere: { 13: 3 } },   // kyrne kommer når fjøset er kjøpt (Ivar 9.11 og 12.11)
      gris: { navn: 'Gris', flertall: 'Griser', ikon: '🐖', nivaa: 10, spiser: 'grisefor', produkt: 'troffel', tid: 240, xp: 3, start: 2, hus: 'grisebinge', flere: { 18: 3 } },
      sau:  { navn: 'Sau',  flertall: 'Sauer', ikon: '🐑', nivaa: 16, spiser: 'sauefor',  produkt: 'ull',    tid: 300, xp: 4, start: 2, hus: 'sauefjos', flere: { 19: 3 } },   // 0.23.0
      geit: { navn: 'Geit', flertall: 'Geiter', ikon: '🐐', nivaa: 26, spiser: 'geitefor', produkt: 'geitemelk', tid: 360, xp: 5, start: 2, hus: 'geitefjos' }   // 0.31.0 (Even 18.11), flyttet til nivå 26 i 0.32.0 som i planen. Admin har dem i testversjonen. Tallene er forslag
    },
    // Varer som ikke er avlinger. Verdien til produserte varer regnes ut nedenfor (formelen i progresjonsplanen kap. 6).
    varer: {
      egg:      { navn: 'Egg',      ikon: '🥚', verdi: 8 },
      melk:     { navn: 'Melk',     ikon: '🥛', verdi: 14 },
      troffel:  { navn: 'Trøfler',  ikon: '🍄', verdi: 25 },
      honsefor: { navn: 'Hønsefor', ikon: '🟡', erFor: true },
      kufor:    { navn: 'Kufor',    ikon: '🟤', erFor: true },
      grisefor: { navn: 'Grisefor', ikon: '🟠', erFor: true },
      sauefor:  { navn: 'Sauefor',  ikon: '🟢', erFor: true },
      geitefor: { navn: 'Geitefor', ikon: '🟤', erFor: true },
      geitemelk: { navn: 'Geitemelk', ikon: '🍼', verdi: 40 },
      eple:     { navn: 'Eple',     ikon: '🍎', verdi: 14, flertall: 'epler' },
      honning:  { navn: 'Honning',  ikon: '🍯', verdi: 30 },
      ull:      { navn: 'Ull',      ikon: '🧶', verdi: 32 },
      gulrotpai: { navn: 'Gulrotpai', ikon: '🥧' },
      kremkake:  { navn: 'Kremkake',  ikon: '🍰' },
      abbor:     { navn: 'Abbor',     ikon: '🐟', verdi: 10, fisk: true },   // 0.27.0: fisk fra brygga. Verdiene er forslag
      orret:     { navn: 'Ørret',     ikon: '🐠', verdi: 18, fisk: true },
      gjedde:    { navn: 'Gjedde',    ikon: '🐡', verdi: 30, fisk: true },
      lue:       { navn: 'Lue',       ikon: '🧢' },
      genser:    { navn: 'Genser',    ikon: '🧥' },
      gresskarbrod: { navn: 'Gresskarbrød', ikon: '🎃🍞' },
      brod:     { navn: 'Brød',     ikon: '🍞' },
      maisbrod: { navn: 'Maisbrød', ikon: '🥖' },
      flote:    { navn: 'Fløte',    ikon: '🍶' },
      smor:     { navn: 'Smør',     ikon: '🧈' },
      ost:      { navn: 'Ost',      ikon: '🧀' },
      sukker:   { navn: 'Sukker',   ikon: '🧂' },
      popkorn:  { navn: 'Popkorn',  ikon: '🍿' },
      pannekaker: { navn: 'Pannekaker', ikon: '🥞' },
      sirup:      { navn: 'Sirup',      ikon: '🍯' },
      omelett:    { navn: 'Omelett',    ikon: '🍳' },
      smorpopkorn: { navn: 'Smørpopkorn', ikon: '🧈🍿' },
      festhatt:   { navn: 'Festhatt', ikon: '🥳', arr: 'bursdag' },   // 0.16.0: lages til Bursdagsfesten og sendes med varebilen. Kan ikke selges eller bestilles
      bursdagskake: { navn: 'Bursdagskake', ikon: '🎂' }
    },
    // Oppskrifter: bygg, nivå, råvarer, tid (s), antall ut
    oppskrifter: {
      honsefor:   { bygg: 'forkvern',   nivaa: 1,  inn: { hvete: 2 },                     tid: 30,  ut: 3 },
      kufor:      { bygg: 'forkvern',   nivaa: 6,  inn: { erter: 2, mais: 1 },            tid: 60,  ut: 3 },
      grisefor:   { bygg: 'forkvern',   nivaa: 10, inn: { gulrot: 2, erter: 1 },          tid: 60,  ut: 3 },
      sauefor:    { bygg: 'forkvern',   nivaa: 16, inn: { hvete: 3, erter: 1 },           tid: 90,  ut: 3 },
      eple:       { bygg: 'epletre',    nivaa: 21, inn: {},                               tid: 300, ut: 2 },
      honning:    { bygg: 'bikube',     nivaa: 22, inn: {},                               tid: 360, ut: 1 },   // 0.33.0: biene lager honningen selv   // 0.32.0: treet lager epler av seg selv
      geitefor:   { bygg: 'forkvern',   nivaa: 26, inn: { mais: 3, gulrot: 1 },           tid: 90,  ut: 3 },
      gulrotpai:  { bygg: 'paibakeri',  nivaa: 14, inn: { gulrot: 3, egg: 1, hvete: 1 },  tid: 180, ut: 1 },
      kremkake:   { bygg: 'paibakeri',  nivaa: 14, inn: { flote: 2, egg: 2, sukker: 1 },  tid: 240, ut: 1 },
      lue:        { bygg: 'vevstol',    nivaa: 17, inn: { ull: 1 },                       tid: 180, ut: 1 },
      genser:     { bygg: 'vevstol',    nivaa: 17, inn: { ull: 2 },                       tid: 300, ut: 1 },
      gresskarbrod: { bygg: 'bakeri',   nivaa: 18, inn: { gresskar: 1, hvete: 2, egg: 1 }, tid: 180, ut: 1 },
      brod:       { bygg: 'bakeri',     nivaa: 2,  inn: { hvete: 3 },                     tid: 60,  ut: 1 },
      maisbrod:   { bygg: 'bakeri',     nivaa: 7,  inn: { mais: 2, egg: 2 },              tid: 120, ut: 1 },
      flote:      { bygg: 'meieri',     nivaa: 6,  inn: { melk: 1 },                      tid: 60,  ut: 1 },
      smor:       { bygg: 'meieri',     nivaa: 6,  inn: { melk: 2 },                      tid: 90,  ut: 1 },
      ost:        { bygg: 'meieri',     nivaa: 9,  inn: { melk: 3 },                      tid: 150, ut: 1 },
      sukker:     { bygg: 'sukkerverk', nivaa: 7,  inn: { sukkerror: 1 },                 tid: 60,  ut: 1 },
      popkorn:    { bygg: 'popkorn',    nivaa: 8,  inn: { mais: 2 },                      tid: 60,  ut: 1 },
      pannekaker: { bygg: 'kjokken',    nivaa: 9,  inn: { egg: 2, melk: 1, sukker: 1 },   tid: 120, ut: 1 },
      sirup:      { bygg: 'sukkerverk', nivaa: 11, inn: { sukkerror: 3 },                 tid: 150, ut: 1 },
      omelett:    { bygg: 'kjokken',    nivaa: 12, inn: { egg: 3, melk: 1 },              tid: 90,  ut: 1 },
      smorpopkorn: { bygg: 'popkorn',   nivaa: 13, inn: { popkorn: 1, smor: 1 },          tid: 120, ut: 1 },
      festhatt:   { bygg: 'festbord',   nivaa: 3,  inn: { hvete: 2, mais: 1 },            tid: 60,  ut: 1 },
      bursdagskake: { bygg: 'bakeri',   nivaa: 3,  inn: { hvete: 2, egg: 2 },             tid: 120, ut: 1, krever: { arr: 'bursdag', trinn: 2 } }   // premie i Bursdagsfesten
    },
    // Bygg: nivå og pris. Produksjonsbygg har 2 køplasser. «dyr»: bygget er et dyrehus, og dyrene kommer når det er kjøpt.
    bygg: {
      forkvern:   { navn: 'Forkvernen',      ikon: '⚙️', nivaa: 1,  pris: 0 },
      bakeri:     { navn: 'Bakeriet',       ikon: '🍞', nivaa: 2,  pris: 50 },
      meieri:     { navn: 'Meieriet',       ikon: '🥛', nivaa: 6,  pris: 600 },
      sukkerverk: { navn: 'Sukkerverket',   ikon: '🧂', nivaa: 7,  pris: 900 },
      popkorn:    { navn: 'Popkornmaskinen', ikon: '🍿', nivaa: 8,  pris: 750 },   // Even 15.11: 750 (var 1200), godkjent av Ivar 15.11
      kjokken:    { navn: 'Gårdskjøkkenet', ikon: '🥞', nivaa: 9,  pris: 800 },
      fjos:       { navn: 'Fjøs og beite',  ikon: '🐄', nivaa: 6,  pris: 300, dyr: 'ku' },   // Ivar 12.11: 300 mynter, spilleren plasserer det selv
      grisebinge: { navn: 'Grisebinge',     ikon: '🐖', nivaa: 10, pris: 800, dyr: 'gris' },
      paibakeri:  { navn: 'Paibakeriet',    ikon: '🥧', nivaa: 14, pris: 3500 },   // 0.23.0. Priser fra progresjonsplanen kap. 6
      sauefjos:   { navn: 'Sauefjøs',       ikon: '🐑', nivaa: 16, pris: 3000, dyr: 'sau' },
      geitefjos:  { navn: 'Geitefjøs',      ikon: '🐐', nivaa: 26, pris: 8000, dyr: 'geit' },   // 0.31.0. Pris er forslag
      bikube:     { navn: 'Bikuben',        ikon: '🐝', nivaa: 22, pris: 4000, selv: 'honning', vent: 'Ny honning er klar om', klar: 'Honningen er klar!' },   // 0.33.0 (Even 18.11): gul bikube av halm. Pris er forslag
      epletre:    { navn: 'Epletreet',      ikon: '🍎', nivaa: 21, pris: 3000, selv: 'eple', vent: 'Nye epler er modne om', klar: 'Eplene er modne!' },   // 0.32.0 (Even 18.11): står for alltid og gir nye epler etter en stund. Pris er forslag
      vevstol:    { navn: 'Vevstolen',      ikon: '🧶', nivaa: 17, pris: 6000 },   // 0.24.0
      festbord:   { navn: 'Festbordet',     ikon: '🎉', nivaa: 3,  pris: 150, arr: 'bursdag' }   // kommer med Bursdagsfesten, ikke med nivået (Even 11.11: første maskin ca. 150)
    },
    koPlasser: 2,
    xpNeste: [null, 20, 35, 50, 70, 95, 140, 180, 225, 275, 325, 395, 460, 530, 605, 685, 770, 855, 950, 1050, 1150, 1260],   // XP fra nivået til det neste. 11–19 fra progresjonsplanen kap. 5
    maksNivaa: 22,
    hund: { nivaa: 20, navn: 'Syltetøy' },   // 0.24.0 (Even 8.11 og 17.11): gårdshunden følger roboten fra nivå 20. Bare til pynt
    akre: { 1: 6, 3: 9, 5: 12, 13: 15 },        // antall åkre fra nivå
    silo: { 1: 50, 9: 75, 15: 100, 19: 125 },             // plass til avlinger
    lave: { 1: 50, 6: 75, 10: 100, 14: 125, 18: 150 },    // plass til alt annet
    startMynter: 50,
    startLager: { honsefor: 6, hvete: 4 },
    nyAvlingFro: 3,                     // en ny avling gir 3 frø når den låses opp
    // Bestillinger (progresjonsplanen kap. 4 F5 og kap. 6). Tavla kommer på nivå 4. Antall bestillinger øker med nivået.
    bestillinger: { nivaa: 4, plasser: { 4: 3, 7: 4, 10: 5, 15: 6 }, bytteForslag: 900, maksKjede: 600, myntFaktor: 1.6, xpFaktor: 0.6, xpPot: 0.85, minXP: 3 },
    // Kunder som kjører innom markedsbua (Even 11.11): ber om én vare og betaler markedspris (Ivar 11.11). Ingen straff om spilleren ikke har varen.
    kunder: { faktor: 1, pause: [70, 120], venter: 0 },   // 0.34.0 (Even 19.11): Blomst blir til hun har fått det hun vil ha. venter: 0 betyr ingen tidsfrist
    /* 0.34.0 Naboer (Even 19.11): roboter i andre farger som kommer på besøk og vil kjøpe én, to eller tre ting. De venter til de har fått det.
       Først ute er tvillingen Bleep, som er lys gul. Gnist (oransje), Dråpe (blå), Bolt (rød) og Spire (grønn) kommer senere. Tallene er forslag */
    naboer: { nivaa: 4, pause: [100, 170], faktor: 1, maksTing: 3, likerSjanse: 0.7,
      /* 0.35.0: alle fem naboene. «liker» er favoritten: bygget varen lages i, eller 'avling'. Sju av ti ønsker er en favoritt når spilleren kan lage en.
         Bleep har ingen favoritt ennå. Bolt skulle først ha for til dyrene, men for kan ikke selges i spillet. Even valgte ting fra dyrene i stedet (20.11) */
      liste: {
        bleep: { navn: 'Bleep', farge: 0xffec86, hjerte: '💛' },
        gnist: { navn: 'Gnist', farge: 0xff8a1f, hjerte: '🧡', liker: ['bakeri', 'paibakeri'] },
        drape: { navn: 'Dråpe', farge: 0x3d8bff, hjerte: '💙', liker: ['meieri', 'ku'] },
        bolt:  { navn: 'Bolt',  farge: 0xe5382e, hjerte: '❤️', liker: ['hone', 'ku', 'sau', 'geit', 'bikube'] },   // 0.35.1 (Even 20.11): ting fra dyrene, som egg, melk, ull og honning
        spire: { navn: 'Spire', farge: 0x3fb54a, hjerte: '💚', liker: ['avling'] } } },
    // Områder spilleren kan kjøpe (Ivar 12.11: Enga på nivå 5 for 300). Skogkanten er med i fase 4.
    omrader: {
      enga:       { navn: 'Enga',       nivaa: 5,  pris: 300 },
      skogkanten: { navn: 'Skogkanten', nivaa: 10, pris: 1500 },
      elvebredden: { navn: 'Elvebredden', nivaa: 18, pris: 6000 },   // 0.27.0: med fiskebrygga (plan 8.11 og 17.11)
      bakjordet:  { navn: 'Bakjordet',  nivaa: 13, pris: 2500, krever: 'jordet' },   // 0.22.0: bakre del av Jordet (plan 16.11). Navn og pris er forslag
      ostjordet:  { navn: 'Østjordet',  nivaa: 16, pris: 4000, krever: 'jordet' },   // 0.20.1 (Ivar 16.11): utvidelsen øst for Jordet, fra nivå 16. Navn og pris er forslag
      jordet:     { navn: 'Jordet',     nivaa: 8,  pris: 1000 }   // 0.17.0 (Even 15.11): jordet på andre siden av veien. Nivå og pris er forslag og må godkjennes av en voksen
    },
    innholdTil: 22,
    /* 0.26.0 Pyntebutikken (Even 17.11): pynt spilleren kjøper for mynter og setter der hun vil. Bare til pynt. Kan selges tilbake for halv pris.
       Prisene og antallet er Claudes forslag og må godkjennes av en voksen. Ingenting koster ekte penger */
    pynt: {
      stakitt:     { navn: 'Hvitt stakitt', ikon: '🤍', pris: 15,  fot: [2.0, 0.5] },
      hekk:        { navn: 'Hekk',          ikon: '🌳', pris: 25,  fot: [1.6, 0.9] },
      blomsterbed: { navn: 'Blomsterbed',   ikon: '🌷', pris: 30,  fot: [1.6, 1.0] },
      lykt:        { navn: 'Lykt',          ikon: '🏮', pris: 40,  fot: [0.7, 0.7] },
      benk:        { navn: 'Benk',          ikon: '🪑', pris: 60,  fot: [1.8, 0.8] },
      flagg:       { navn: 'Flaggstang',    ikon: '🚩', pris: 80,  fot: [0.8, 0.8] },
      fuglebad:    { navn: 'Fuglebad',      ikon: '🐦', pris: 120, fot: [1.0, 1.0] },
      fontene:     { navn: 'Fontene',       ikon: '⛲', pris: 400, fot: [2.2, 2.2] }
    },
    /* 0.27.0 Fiskebrygga (Even og Ivar 17.–18.11): «kast og vent». Roboten kaster snøret, og etter en stund er det fisk på kroken.
       Ingen tidsfrist: fisken venter til du haler inn. Hvilken fisk det blir, er tilfeldig. Tallene er forslag */
    fiske: { tid: 90, xp: 3, fisk: [['abbor', 60], ['orret', 30], ['gjedde', 10]] },
    pyntNivaa: 2, pyntMaks: 40, pyntRetur: 0.5,
    // Rebus' gåter (Even 13.11): svaret er varen. Spilleren gir Rebus varen. Lønn: pris × 2 + 10 mynter, 4 XP + nivået til varen. Ny gåte 3 minutter etter riktig svar
    // Gaveesker (Even 14.11, godkjent av Ivar 14.11): gratis, kan aldri kjøpes, sjansene vises åpent. Prosent per sjeldenhet.
    // Gaveesker (Even 14.11, godkjent av Ivar 14.11). Premier og sjanser fra Even 14.11 (0.12.1): [premie, prosent, mengde, sjeldenhet]
    gave: { premier: [['mynter', 50, [20, 60], 'vanlig'], ['xp', 25, 75, 'uvanlig'], ['frovarer', 13, 0, 'uvanlig'], ['maskin', 5, 0, 'sjelden'], ['superhost', 5, 0, 'sjelden'],
        ['maned', 1, 0, 'superrar'], ['pynt', 0.9, 0, 'superrar'], ['gullgard', 0.1, 0, 'legendarisk']],
      bonusDager: 7, maskinMynter: 300, superrarMynter: 200,   // bonusDager: Ivar 14.11, 7 dager (Even ønsket en måned)
      pynt: ['gullhone', 'gullegg', 'gullgulrot', 'gullstjerne', 'regnbue', 'gullfontene'],
      pyntNavn: { gullhone: 'Gullhøne', gullegg: 'Gullegg', gullgulrot: 'Gullgulrot', gullstjerne: 'Gullstjerne', regnbue: 'Regnbue', gullfontene: 'Gullfontene', bursdagspynt: 'Ballonger og kake' } },
    /* 0.16.0 Årstidsfester (Even 11.11 og 15.11, rammene godkjent av Ivar 12.11 og 15.11). Festen er åpen i sin måned hvert år.
       Det du har sendt, blir med til neste år, og ingenting går tapt. Premiene kommer trinnvis og er bare til pynt, bortsett fra oppskriften.
       Tallene (antall hatter per trinn, pris på Festbordet, mynter og XP per hatt) er Claudes forslag og må godkjennes av en voksen før publisering. */
    arr: {
      bursdag: { navn: 'Bursdagsfesten', ikon: '🎂', maned: 11, nivaa: 3, vare: 'festhatt', bygg: 'festbord', xp: 2,
        trinn: [ { n: 5, premie: 'hatter', tekst: 'Dyrene får festhatter i november' }, { n: 15, premie: 'oppskrift', vare: 'bursdagskake', tekst: 'Ny oppskrift: bursdagskake i bakeriet' },
                 { n: 30, premie: 'skinn', skinn: 'bursdag', tekst: 'Bursdagsbilen: nytt utseende til varebilen' }, { n: 50, premie: 'pynt', pynt: 'bursdagspynt', tekst: 'Pynt til gården: ballonger og kake' } ] }
    },
    skinn: { bursdag: 'Bursdagsbilen' },
    arrPynt: ['bursdagspynt'],
    rebus: { nivaa: 2, pause: 180, myntFaktor: 1, myntPluss: 10, xp: 4 },   /* 0.15.1 (Even 15.11): du trenger ikke ha svaret på lager. Rebus tar ingen vare, så lønna er varens verdi mindre enn før (samme gevinst som før) */
    gater: {
      lue: 'Jeg er strikket av ull og sitter på hodet ditt når det er kaldt. Hva er jeg?',
      genser: 'Jeg har to ermer og er laget av ull. Du tar meg på når du fryser. Hva er jeg?',
      gresskarbrod: 'Jeg er bakt i ovnen, og inni meg er det noe stort og oransje fra åkeren. Hva er jeg?',
      gresskar: 'Jeg er stor, rund og oransje, og jeg vokser på bakken. Om høsten skjærer noen ansikt i meg. Hva er jeg?',
      honning: 'Jeg er gyllen, søt og klissete, og det er biene som lager meg. Hva er jeg?',
      eple: 'Jeg er rund og rød og vokser på et tre. Du kan spise meg rå eller bake meg i en pai. Hva er jeg?',
      geitemelk: 'Jeg er hvit og kommer fra et dyr med skjegg og horn. Av meg kan du lage ost. Hva er jeg?',
      ull: 'Jeg vokser på sauen og er myk og varm. Av meg blir det garn og gensere. Hva er jeg?',
      gulrotpai: 'Jeg er rund og bakt i ovnen, og inni meg er det noe oransje fra åkeren. Hva er jeg?',
      kremkake: 'Jeg er myk og søt, med hvit krem på toppen. Du får meg på fest. Hva er jeg?',
      sirup: 'Jeg er brun, søt og seig, og jeg renner sakte ned fra skjeen. Hva er jeg?',
      omelett: 'Jeg er laget av egg som er pisket og stekt i panna. Jeg er gul og flat. Hva er jeg?',
      smorpopkorn: 'Vi popper i gryta og får noe gult og godt smeltet over oss. Hva er vi?',
      hvete: 'Jeg er gul og står i lange rader på åkeren. Blir jeg malt, blir jeg til mel og brød. Hva er jeg?',
      mais: 'Jeg har gule korn på en kolbe og grønne blader rundt meg. Hva er jeg?',
      erter: 'Jeg bor i en grønn belg sammen med søsknene mine. Vi er små, runde og grønne. Hva er jeg?',
      egg: 'Jeg har skall, men jeg er ikke en snegle. Høna legger meg i reiret. Hva er jeg?',
      honsefor: 'Hønene blir glade når de får meg. Jeg lages av hvete i forkvernen. Hva er jeg?',
      brod: 'Jeg kommer varm og god ut av ovnen, og du kan smøre smør på meg. Hva er jeg?',
      kufor: 'Kyrne spiser meg. Jeg lages av erter og mais i forkvernen. Hva er jeg?',
      melk: 'Jeg er hvit, kommer fra kua og er god i et glass. Hva er jeg?',
      flote: 'Jeg er tykk og hvit og lages av melk. Pisker du meg, blir jeg til krem. Hva er jeg?',
      smor: 'Jeg er gul og myk og lages av melk. Du smører meg på brødskiva. Hva er jeg?',
      sukkerror: 'Jeg er høy og grønn med ledd, nesten som bambus. Inni meg er det søtt. Hva er jeg?',
      sukker: 'Jeg er hvit og søt, og jeg lages av sukkerrør. Hva er jeg?',
      maisbrod: 'Jeg er et brød, men jeg er gult. Jeg lages av mais. Hva er jeg?',
      popkorn: 'Jeg spretter i varmen og sier POP! Mange spiser meg på kino. Hva er jeg?',
      gulrot: 'Jeg er oransje og vokser med hodet ned i jorda. Kaniner elsker meg. Hva er jeg?',
      pannekaker: 'Vi er runde og flate, og vi ligger i en høy stabel på tallerkenen. Hva er vi?',
      troffel: 'Grisene finner meg i jorda med snuten sin. Jeg ser ut som en liten brun sopp. Hva er jeg?',
      grisefor: 'Grisene elsker meg. Jeg lages av gulrot og erter i forkvernen. Hva er jeg?',
      ost: 'Jeg lages av melk og har noen ganger hull i meg. Du legger meg på brødskiva. Hva er jeg?'
    },                      // nivået innholdet er bygget til i denne versjonen. Bestillinger ber aldri om noe over dette
    maksVentetid: 240                   // ingen jobb tar mer enn 4 minutter (planens beslutning B1, progresjonsplanen kap. 3)
  };
  D.nivaaMynter = function (n) { return 20 + 15 * n; };
  // Hvor mange dyr av en art spilleren har på et nivå (0.22.0: en høne til på nivå 11, en ku til på nivå 13)
  D.dyrAntall = function (art, nivaa) { var A = D.dyr[art]; return Math.max(A.start, A.flere ? D.ved(A.flere, nivaa) : 0); };

  // Verdien til en vare: avlinger og dyreprodukter har fast verdi. Produserte varer: råvarer × 1,3 + 1 mynt per 10 s, delt på antall.
  var cache = {};
  D.verdi = function (v) {
    if (cache[v] !== undefined) return cache[v];
    var r;
    if (D.avlinger[v]) r = D.avlinger[v].verdi;
    else if (D.varer[v] && D.varer[v].verdi !== undefined) r = D.varer[v].verdi;
    else if (D.oppskrifter[v]) {
      var o = D.oppskrifter[v], s = 0;
      for (var k in o.inn) s += D.verdi(k) * o.inn[k];
      r = Math.round((s * 1.3 + o.tid / 10) / o.ut * 10) / 10;
    } else r = 0;
    return (cache[v] = r);
  };
  // Pris i markedsbua: hele mynter
  D.pris = function (v) { return Math.max(1, Math.round(D.verdi(v))); };
  // XP når en ferdig vare hentes: for gir 0, ellers verdi ÷ 6, minst 2
  D.produktXP = function (v) { return D.varer[v] && D.varer[v].erFor ? 0 : Math.max(2, Math.round(D.verdi(v) / 6)); };
  D.erFor = function (v) { return !!(D.varer[v] && D.varer[v].erFor); };
  D.ved = function (tabell, nivaa) { var b = null; for (var k in tabell) if (+k <= nivaa && (b === null || +k > b)) b = +k; return b === null ? 0 : tabell[b]; };
  D.info = function (v) { return D.avlinger[v] || D.varer[v] || { navn: v, ikon: '❔' }; };
  // Tiden det tar å lage én vare helt fra frø (s): avling, for og dyr, eller råvarer og produksjon. Brukes til å holde bestillingene korte (F5).
  D.kjedeTid = function (v) {
    if (D.avlinger[v]) return D.avlinger[v].tid;
    for (var d in D.dyr) if (D.dyr[d].produkt === v) return D.dyr[d].tid + D.kjedeTid(D.dyr[d].spiser);
    var o = D.oppskrifter[v]; if (!o) return 0;
    var m = 0; for (var k in o.inn) m = Math.max(m, D.kjedeTid(k));
    return m + o.tid;
  };
  D.bestillingMynter = function (verdi) { return Math.round(verdi * D.bestillinger.myntFaktor); };
  D.bestillingXP = function (verdi) { return Math.max(D.bestillinger.minXP, Math.round(D.bestillinger.xpFaktor * Math.pow(verdi, D.bestillinger.xpPot))); };
  D.nivaaFor = function (v) {
    if (D.avlinger[v]) return D.avlinger[v].nivaa;
    for (var d in D.dyr) if (D.dyr[d].produkt === v) return D.dyr[d].nivaa;
    if (D.oppskrifter[v]) return D.oppskrifter[v].nivaa;
    return 1;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = D; else rot.MB_DATA = D;
})(typeof window !== 'undefined' ? window : globalThis);
