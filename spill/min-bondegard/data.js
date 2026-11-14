/* Min Bondegård – alle tall for nivå 1–10 på ett sted.
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
      gulrot:    { navn: 'Gulrot',    ikon: '🥕', nivaa: 9, tid: 90,  verdi: 5, xp: 2 }
    },
    // Dyr: ett fôr gir ett produkt etter «tid» sekunder. Et dyr uten fôr slutter bare å produsere (progresjonsregel F6).
    dyr: {
      hone: { navn: 'Høne', flertall: 'Høner', ikon: '🐔', nivaa: 1,  spiser: 'honsefor', produkt: 'egg',    tid: 60,  xp: 1, start: 3 },
      ku:   { navn: 'Ku',   flertall: 'Kyr',   ikon: '🐄', nivaa: 6,  spiser: 'kufor',    produkt: 'melk',   tid: 120, xp: 2, start: 2, hus: 'fjos' },   // kyrne kommer når fjøset er kjøpt (Ivar 9.11 og 12.11)
      gris: { navn: 'Gris', flertall: 'Griser', ikon: '🐖', nivaa: 10, spiser: 'grisefor', produkt: 'troffel', tid: 240, xp: 3, start: 2 }
    },
    // Varer som ikke er avlinger. Verdien til produserte varer regnes ut nedenfor (formelen i progresjonsplanen kap. 6).
    varer: {
      egg:      { navn: 'Egg',      ikon: '🥚', verdi: 8 },
      melk:     { navn: 'Melk',     ikon: '🥛', verdi: 14 },
      troffel:  { navn: 'Trøfler',  ikon: '🍄', verdi: 25 },
      honsefor: { navn: 'Hønsefôr', ikon: '🟡', erFor: true },
      kufor:    { navn: 'Kufôr',    ikon: '🟤', erFor: true },
      grisefor: { navn: 'Grisefôr', ikon: '🟠', erFor: true },
      brod:     { navn: 'Brød',     ikon: '🍞' },
      maisbrod: { navn: 'Maisbrød', ikon: '🥖' },
      flote:    { navn: 'Fløte',    ikon: '🍶' },
      smor:     { navn: 'Smør',     ikon: '🧈' },
      ost:      { navn: 'Ost',      ikon: '🧀' },
      sukker:   { navn: 'Sukker',   ikon: '🧂' },
      popkorn:  { navn: 'Popkorn',  ikon: '🍿' },
      pannekaker: { navn: 'Pannekaker', ikon: '🥞' }
    },
    // Oppskrifter: bygg, nivå, råvarer, tid (s), antall ut
    oppskrifter: {
      honsefor:   { bygg: 'forkvern',   nivaa: 1,  inn: { hvete: 2 },                     tid: 30,  ut: 3 },
      kufor:      { bygg: 'forkvern',   nivaa: 6,  inn: { erter: 2, mais: 1 },            tid: 60,  ut: 3 },
      grisefor:   { bygg: 'forkvern',   nivaa: 10, inn: { gulrot: 2, erter: 1 },          tid: 60,  ut: 3 },
      brod:       { bygg: 'bakeri',     nivaa: 2,  inn: { hvete: 3 },                     tid: 60,  ut: 1 },
      maisbrod:   { bygg: 'bakeri',     nivaa: 7,  inn: { mais: 2, egg: 2 },              tid: 120, ut: 1 },
      flote:      { bygg: 'meieri',     nivaa: 6,  inn: { melk: 1 },                      tid: 60,  ut: 1 },
      smor:       { bygg: 'meieri',     nivaa: 6,  inn: { melk: 2 },                      tid: 90,  ut: 1 },
      ost:        { bygg: 'meieri',     nivaa: 9,  inn: { melk: 3 },                      tid: 150, ut: 1 },
      sukker:     { bygg: 'sukkerverk', nivaa: 7,  inn: { sukkerror: 1 },                 tid: 60,  ut: 1 },
      popkorn:    { bygg: 'popkorn',    nivaa: 8,  inn: { mais: 2 },                      tid: 60,  ut: 1 },
      pannekaker: { bygg: 'kjokken',    nivaa: 9,  inn: { egg: 2, melk: 1, sukker: 1 },   tid: 120, ut: 1 }
    },
    // Bygg: nivå og pris. Produksjonsbygg har 2 køplasser. «dyr»: bygget er et dyrehus, og dyrene kommer når det er kjøpt.
    bygg: {
      forkvern:   { navn: 'Fôrkverna',      ikon: '⚙️', nivaa: 1,  pris: 0 },
      bakeri:     { navn: 'Bakeriet',       ikon: '🍞', nivaa: 2,  pris: 50 },
      meieri:     { navn: 'Meieriet',       ikon: '🥛', nivaa: 6,  pris: 600 },
      sukkerverk: { navn: 'Sukkerverket',   ikon: '🧂', nivaa: 7,  pris: 900 },
      popkorn:    { navn: 'Popkornmaskina', ikon: '🍿', nivaa: 8,  pris: 1200 },
      kjokken:    { navn: 'Gårdskjøkkenet', ikon: '🥞', nivaa: 9,  pris: 800 },
      fjos:       { navn: 'Fjøs og beite',  ikon: '🐄', nivaa: 6,  pris: 300, dyr: 'ku' }   // Ivar 12.11: 300 mynter, spilleren plasserer det selv
    },
    koPlasser: 2,
    xpNeste: [null, 20, 35, 50, 70, 95, 140, 180, 225, 275, 325],
    maksNivaa: 10,
    akre: { 1: 6, 3: 9, 5: 12 },        // antall åkre fra nivå
    silo: { 1: 50, 9: 75 },             // plass til avlinger
    lave: { 1: 50, 6: 75, 10: 100 },    // plass til alt annet
    startMynter: 50,
    startLager: { honsefor: 6, hvete: 4 },
    nyAvlingFro: 3,                     // en ny avling gir 3 frø når den låses opp
    // Bestillinger (progresjonsplanen kap. 4 F5 og kap. 6). Tavla kommer på nivå 4. Antall bestillinger øker med nivået.
    bestillinger: { nivaa: 4, plasser: { 4: 3, 7: 4, 10: 5 }, bytteForslag: 900, maksKjede: 600, myntFaktor: 1.6, xpFaktor: 0.6, xpPot: 0.85, minXP: 3 },
    // Kunder som kjører innom markedsbua (Even 11.11): ber om én vare og betaler markedspris (Ivar 11.11). Ingen straff om spilleren ikke har varen.
    kunder: { faktor: 1, pause: [70, 120], venter: 60 },
    // Områder spilleren kan kjøpe (Ivar 12.11: Enga på nivå 5 for 300). Skogkanten er med i fase 4.
    omrader: {
      enga:       { navn: 'Enga',       nivaa: 5,  pris: 300 },
      skogkanten: { navn: 'Skogkanten', nivaa: 10, pris: 1500 }
    },
    innholdTil: 9,
    // Rebus' gåter (Even 13.11): svaret er varen. Spilleren gir Rebus varen. Lønn: pris × 2 + 10 mynter, 4 XP + nivået til varen. Ny gåte 3 minutter etter riktig svar
    // Gaveesker (Even 14.11, godkjent av Ivar 14.11): gratis, kan aldri kjøpes, sjansene vises åpent. Prosent per sjeldenhet.
    gave: { sjanser: [['vanlig', 60], ['uvanlig', 28], ['sjelden', 10], ['superrar', 2]], vanlig: [20, 40], uvanlig: 60, sjelden: 120, superrarMynter: 200,
      pynt: ['gullhone', 'gullegg', 'gullgulrot', 'gullstjerne'], pyntNavn: { gullhone: 'Gullhøne', gullegg: 'Gullegg', gullgulrot: 'Gullgulrot', gullstjerne: 'Gullstjerne' } },
    rebus: { nivaa: 2, pause: 180, myntFaktor: 2, myntPluss: 10, xp: 4 },
    gater: {
      hvete: 'Jeg er gul og står i lange rader på åkeren. Blir jeg malt, blir jeg til mel og brød. Hva er jeg?',
      mais: 'Jeg har gule korn på en kolbe og grønne blader rundt meg. Hva er jeg?',
      erter: 'Jeg bor i en grønn belg sammen med søsknene mine. Vi er små, runde og grønne. Hva er jeg?',
      egg: 'Jeg har skall, men jeg er ikke en snegle. Høna legger meg i reiret. Hva er jeg?',
      honsefor: 'Hønene blir glade når de får meg. Jeg lages av hvete i fôrkverna. Hva er jeg?',
      brod: 'Jeg kommer varm og god ut av ovnen, og du kan smøre smør på meg. Hva er jeg?',
      kufor: 'Kyrne spiser meg. Jeg lages av erter og mais i fôrkverna. Hva er jeg?',
      melk: 'Jeg er hvit, kommer fra kua og er god i et glass. Hva er jeg?',
      flote: 'Jeg er tykk og hvit og lages av melk. Pisker du meg, blir jeg til krem. Hva er jeg?',
      smor: 'Jeg er gul og myk og lages av melk. Du smører meg på brødskiva. Hva er jeg?',
      sukkerror: 'Jeg er høy og grønn med ledd, nesten som bambus. Inni meg er det søtt. Hva er jeg?',
      sukker: 'Jeg er hvit og søt, og jeg lages av sukkerrør. Hva er jeg?',
      maisbrod: 'Jeg er et brød, men jeg er gult. Jeg lages av mais. Hva er jeg?',
      popkorn: 'Jeg spretter i varmen og sier POP! Mange spiser meg på kino. Hva er jeg?',
      gulrot: 'Jeg er oransje og vokser med hodet ned i jorda. Kaniner elsker meg. Hva er jeg?',
      pannekaker: 'Vi er runde og flate, og vi ligger i en høy stabel på tallerkenen. Hva er vi?',
      ost: 'Jeg lages av melk og har noen ganger hull i meg. Du legger meg på brødskiva. Hva er jeg?'
    },                      // nivået innholdet er bygget til i denne versjonen. Bestillinger ber aldri om noe over dette
    maksVentetid: 240                   // ingen jobb tar mer enn 4 minutter (planens beslutning B1, progresjonsplanen kap. 3)
  };
  D.nivaaMynter = function (n) { return 20 + 15 * n; };

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
  // XP når en ferdig vare hentes: fôr gir 0, ellers verdi ÷ 6, minst 2
  D.produktXP = function (v) { return D.varer[v] && D.varer[v].erFor ? 0 : Math.max(2, Math.round(D.verdi(v) / 6)); };
  D.erFor = function (v) { return !!(D.varer[v] && D.varer[v].erFor); };
  D.ved = function (tabell, nivaa) { var b = null; for (var k in tabell) if (+k <= nivaa && (b === null || +k > b)) b = +k; return b === null ? 0 : tabell[b]; };
  D.info = function (v) { return D.avlinger[v] || D.varer[v] || { navn: v, ikon: '❔' }; };
  // Tiden det tar å lage én vare helt fra frø (s): avling, fôr og dyr, eller råvarer og produksjon. Brukes til å holde bestillingene korte (F5).
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
