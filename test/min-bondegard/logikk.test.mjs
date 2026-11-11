// Min Bondegård – tester for spillreglene (logikk.js) og tallene (data.js). Kjør: node test/min-bondegard/logikk.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../../spill/min-bondegard/logikk.js');
const D = L.D;
let feil = 0, ok = 0;
const t = (navn, sant, info = '') => { if (sant) ok++; else { feil++; console.log('FEIL:', navn, info); } };
const S = 1000, T0 = 1_800_000_000_000;

// --- Data ---
const alleTider = [...Object.values(D.avlinger).map(a => a.tid), ...Object.values(D.dyr).map(a => a.tid), ...Object.values(D.oppskrifter).map(o => o.tid)];
t('Ingen jobb over 4 min (B1)', Math.max(...alleTider) <= D.maksVentetid, Math.max(...alleTider));
t('Brød koster 14 mynter', D.pris('brod') === 14, D.pris('brod'));
t('Hønsefôr er fôr og gir 0 XP', D.erFor('honsefor') && D.produktXP('honsefor') === 0);
t('Alle råvarer i oppskrifter finnes', Object.values(D.oppskrifter).every(o => Object.keys(o.inn).every(v => D.avlinger[v] || D.varer[v])));
t('Hver oppskrift har et bygg', Object.values(D.oppskrifter).every(o => D.bygg[o.bygg]));

// --- Start (F1 i progresjonen) ---
let s = L.ny(T0);
t('Start: nivå 1, 50 mynter', s.nivaa === 1 && s.mynter === 50);
t('Start: 6 åkre, 3 høner, fôrkvern eid', s.akre.length === 6 && s.dyr.hone.length === 3 && s.bygg.forkvern.eid);
t('Start: 6 fôr og 4 hvete', s.lager.honsefor === 6 && s.lager.hvete === 4);
t('Start: ingen bakeri før nivå 2', !s.bygg.bakeri);

// --- Plante og høste (F2) ---
let r = L.plant(s, 0, 'hvete', T0);
t('Plante hvete tar 1 fra siloen', r.ok && s.lager.hvete === 3 && !r.gratis);
t('Mais er låst på nivå 1', L.plant(s, 1, 'mais', T0).grunn === 'laast');
t('Kan ikke høste før moden', L.host(s, 0, T0 + 29 * S).ok === false);
r = L.host(s, 0, T0 + 30 * S);
t('Høste gir 2 hvete og 1 XP', r.ok && s.lager.hvete === 5 && s.xp === 1);
t('Åkeren er tom etterpå', s.akre[0].avling === null);
t('Kan ikke høste samme åker to ganger', L.host(s, 0, T0 + 31 * S).ok === false);
s.lager.hvete = 0; delete s.lager.hvete;
r = L.plant(s, 0, 'hvete', T0);
t('Hvete kan plantes gratis med tom silo', r.ok && r.gratis);

// --- Dyr ---
s = L.ny(T0);
r = L.mat(s, 'hone', T0);
t('Mate 3 høner bruker 3 fôr', r.antall === 3 && s.lager.honsefor === 3);
t('Mette høner spiser ikke mer', L.mat(s, 'hone', T0).grunn === 'ingen-sultne');
t('Egg er ikke klare etter 59 s', L.samleDyr(s, 'hone', T0 + 59 * S).ok === false);
r = L.samleDyr(s, 'hone', T0 + 60 * S);
t('3 egg etter 60 s, 3 XP', r.antall === 3 && s.lager.egg === 3 && s.xp === 3);
t('Eggene hentes bare én gang', L.samleDyr(s, 'hone', T0 + 600 * S).ok === false && s.lager.egg === 3);
s.lager.honsefor = 0; delete s.lager.honsefor;
t('Uten fôr: mangler-fôr, ingenting dør (F6)', L.mat(s, 'hone', T0).grunn === 'mangler-for' && s.dyr.hone.length === 3);

// --- Produksjon ---
s = L.ny(T0); s.lager.hvete = 10;
t('Fôr: 2 hvete', L.produser(s, 'forkvern', 'honsefor', T0).ok && s.lager.hvete === 8);
t('Andre jobb i køen', L.produser(s, 'forkvern', 'honsefor', T0).ok);
t('Køen er full med 2', L.kanProdusere(s, 'forkvern', 'honsefor', T0) === 'ko-full');
t('Jobb 2 starter når jobb 1 er ferdig', s.bygg.forkvern.ko[1].start === T0 + 30 * S && s.bygg.forkvern.ko[1].slutt === T0 + 60 * S);
r = L.hentProdukter(s, 'forkvern', T0 + 45 * S);
t('Etter 45 s: 3 fôr, 0 XP', r.antall === 3 && s.lager.honsefor === 9 && s.xp === 0);
t('Ny plass i køen når jobb 1 er hentet', L.kanProdusere(s, 'forkvern', 'honsefor', T0 + 45 * S) === null);
r = L.hentProdukter(s, 'forkvern', T0 + 10 * 60 * S);
t('Jobb 2 hentes én gang', r.antall === 3 && L.hentProdukter(s, 'forkvern', T0 + 11 * 60 * S).ok === false);

// --- Nivå, mynter, bygg ---
s = L.ny(T0);
let nye = L.giXP(s, 20, T0);
t('20 XP gir nivå 2 og 50 mynter', s.nivaa === 2 && nye.length === 1 && s.mynter === 100 && nye[0].mynter === 50);
t('Nivå 2: mais med 3 frø, bakeri låst opp', s.lager.mais === 3 && s.bygg.bakeri && !s.bygg.bakeri.eid);
t('Bakeriet koster 50', L.kjopBygg(s, 'bakeri').ok && s.mynter === 50 && s.bygg.bakeri.eid);
s.lager.hvete = 3;
t('Brød kan lages', L.produser(s, 'bakeri', 'brod', T0).ok);
r = L.hentProdukter(s, 'bakeri', T0 + 60 * S);
t('Brød gir 2 XP', r.ok && r.xp === 2 && s.lager.brod === 1);
nye = L.giXP(s, 2000, T0);
t('Stor XP gir flere nivåer på en gang', s.nivaa === 10 || nye.length > 1);
t('Nivå 3 og 5 gir åkre', s.akre.length === 12);
t('Maks nivå 10', s.nivaa === 10);

// --- Lager (F4) ---
s = L.ny(T0); s.lager.hvete = 49;
L.plant(s, 0, 'hvete', T0 - 40 * S); s.lager.hvete = 49;
t('Full silo: kan ikke høste', L.host(s, 0, T0).grunn === 'silo-full');
r = L.selg(s, 'hvete', 5);
t('Selg 5 hvete gir 10 mynter', r.ok && r.mynter === 10 && s.mynter === 60);
t('Nå kan åkeren høstes', L.host(s, 0, T0).ok);
t('Fôr kan ikke selges', L.selg(s, 'honsefor', 1).ok === false);

// --- Tid og lagring ---
s = L.ny(T0); L.plant(s, 0, 'hvete', T0);
L.normaliserTid(s, T0 - 3600 * S);
t('Klokke bakover: ventetiden blir aldri lengre enn 30 s', s.akre[0].slutt - (T0 - 3600 * S) <= 30 * S);
s = L.ny(T0); L.plant(s, 0, 'hvete', T0); L.mat(s, 'hone', T0); s.lager.hvete = 10; L.produser(s, 'forkvern', 'honsefor', T0); L.produser(s, 'forkvern', 'honsefor', T0);
const json = JSON.stringify(s);
let s2 = L.valider(JSON.parse(json), T0 + 5 * S);
t('Lagring rundtur', s2 && s2.akre[0].avling === 'hvete' && s2.dyr.hone[0].slutt === T0 + 60 * S && s2.bygg.forkvern.ko.length === 2 && s2.lager.hvete === s.lager.hvete);
s2 = L.valider(JSON.parse(json), T0 + 3600 * S);
r = L.host(s2, 0, T0 + 3600 * S); const r2 = L.samleDyr(s2, 'hone', T0 + 3600 * S), r3 = L.hentProdukter(s2, 'forkvern', T0 + 3600 * S);
t('Produksjon fortsetter mens spillet er lukket (B1)', r.ok && r2.antall === 3 && r3.antall === 6);
const s3 = L.valider(JSON.parse(JSON.stringify(s2)), T0 + 7200 * S);
t('Etter henting og ny lasting: ingenting å hente igjen', !L.host(s3, 0, T0 + 7200 * S).ok && !L.samleDyr(s3, 'hone', T0 + 7200 * S).ok && !L.hentProdukter(s3, 'forkvern', T0 + 7200 * S).ok);
t('Ødelagt lagring gir null', L.valider('tull', T0) === null && L.valider(null, T0) === null && L.valider({}, T0) === null);
t('Nyere lagringsversjon røres ikke', L.valider({ v: 99 }, T0) === null);
s2 = L.valider({ v: 1, nivaa: 'x', mynter: -5, lager: { hvete: 'mye', gull: 99, egg: 2 }, akre: [null, { avling: 'tull' }], dyr: { hone: 'nei' }, bygg: { forkvern: { ko: [{ vare: 'brod' }] } } }, T0);
t('Rar lagring blir trygg', s2 && s2.nivaa === 1 && s2.mynter === 0 && !s2.lager.gull && !s2.lager.hvete && s2.lager.egg === 2 && s2.akre[1].avling === null && s2.dyr.hone.length === 3 && s2.bygg.forkvern.ko.length === 0);
s2 = L.valider({ v: 1, nivaa: 4, mynter: 300, lager: {}, bygg: { bakeri: { eid: true } } }, T0);
t('Nivå 4-lagring gir 9 åkre og eid bakeri', s2.akre.length === 9 && s2.bygg.bakeri.eid && s2.mynter === 300);

// --- Bestillinger (fase 2, progresjonsregel F5) ---
s = L.ny(T0);
t('Ingen bestillinger før nivå 4', s.best.liste.length === 0 && L.bestPlasser(s) === 0);
let nyeN = L.giXP(s, 20 + 35 + 50, T0);
t('Nivå 4 gir tavle og 3 bestillinger', s.nivaa === 4 && s.best.liste.length === 3 && nyeN[nyeN.length - 1].tavle === true);
t('Bestillinger ber bare om varer spilleren kan lage', s.best.liste.every(o => Object.keys(o.varer).every(v => L.kanLage(s, v) && !D.erFor(v) && D.kjedeTid(v) <= 600)));
t('Uten bakeri og uten råd: brød er ikke med', (() => { const x = L.ny(T0); L.giXP(x, 105, T0); x.mynter = 0; x.bygg.bakeri.eid = false; x.mynter = -400; return !L.bestPool(x).includes('brod'); })());
t('Ingenting over innholdsnivået i denne versjonen', (() => { const x = L.ny(T0); L.giXP(x, 5000, T0); return L.bestPool(x).every(v => D.nivaaFor(v) <= D.innholdTil); })());
{ const o = s.best.liste[0], verdi = Object.keys(o.varer).reduce((a, v) => a + D.verdi(v) * o.varer[v], 0);
  t('Belønning følger formelen', o.mynter === Math.round(verdi * 1.6) && o.xp === Math.max(3, Math.round(0.6 * Math.pow(verdi, 0.85)))); }
t('Kan ikke levere uten varene', (() => { s.lager = {}; return L.lever(s, 0, T0).grunn === 'mangler' && !L.kanLevere(s, 0); })());
{ const o = s.best.liste[0]; for (const v in o.varer) s.lager[v] = o.varer[v] + 1; const m0 = s.mynter, id = o.id, lev0 = s.stat.levert;
  r = L.lever(s, 0, T0 + S);
  t('Levering gir mynter og XP og tar varene', r.ok && r.mynter === o.mynter && r.xp === o.xp && s.mynter >= m0 + o.mynter && Object.keys(o.varer).every(v => s.lager[v] === 1) && s.stat.levert === lev0 + 1);
  t('En ny bestilling tar plassen, og den gamle kan ikke leveres igjen', s.best.liste.length === 3 && s.best.liste.every(x => x.id !== id)); }
{ const før = JSON.stringify(s.best.liste[1].varer), m0 = s.mynter; r = L.byttBestilling(s, 1, T0 + 2 * S);
  t('Bytte er gratis og gir en annen bestilling', r.ok && s.mynter === m0 && s.best.liste.length === 3 && JSON.stringify(s.best.liste[1].varer) !== før); }
t('Forslag om bytte først etter 15 minutter', (() => { s.lager = {}; const o = s.best.liste[2]; return !L.boerByttes(s, 2, o.siden + 899 * S) && L.boerByttes(s, 2, o.siden + 900 * S); })());
{ const kopi = L.valider(JSON.parse(JSON.stringify(s)), T0 + 3 * S);
  t('Bestillinger overlever lagring', JSON.stringify(kopi.best.liste) === JSON.stringify(s.best.liste) && kopi.best.fro === s.best.fro && kopi.best.nr === s.best.nr); }
{ const rar = JSON.parse(JSON.stringify(s)); rar.best.liste = [{ varer: { hvete: 2 }, mynter: 99999, xp: 99999 }, { varer: { gull: 5 } }, 'tull', { varer: { honsefor: 3 } }, { varer: { hvete: 500 } }];
  const k = L.valider(rar, T0); t('Lagret bestilling kan ikke gi mer enn reglene', k.best.liste.length === 3 && k.best.liste[0].mynter === 6 && k.best.liste[0].xp === 3 && k.best.liste.every(o => Object.keys(o.varer).every(v => !D.erFor(v) && o.varer[v] <= 12))); }
t('Gammel lagring uten bestillinger får dem på nivå 4', (() => { const k = L.valider({ v: 1, nivaa: 4, mynter: 100, lager: {} }, T0); return k.best.liste.length === 3; })());
t('Samme tilstand gir samme bestilling', (() => { const a = JSON.parse(JSON.stringify(s)), b = JSON.parse(JSON.stringify(s)); return JSON.stringify(L.nyBestilling(a, T0)) === JSON.stringify(L.nyBestilling(b, T0)); })());
// --- Erter (nivå 5) ---
s = L.ny(T0); L.giXP(s, 20 + 35 + 50 + 70, T0);
t('Nivå 5 gir erter med 3 frø og 12 åkre', s.nivaa === 5 && s.lager.erter === 3 && s.akre.length === 12);
t('Erter trenger frø', (() => { L.plant(s, 0, 'erter', T0); L.plant(s, 1, 'erter', T0); L.plant(s, 2, 'erter', T0); return s.lager.erter === undefined && L.kanPlante(s, 3, 'erter') === 'ingen-fro'; })());
t('Erter gir 2 per åker etter 2 min', (() => { const x = L.host(s, 0, T0 + 120 * S); return x.ok && x.antall === 2 && s.lager.erter === 2 && !L.host(s, 1, T0 + 119 * S).ok; })());
t('Uten erter i silo og på åkrene: gratis frø (F2)', (() => { const x = L.ny(T0); L.giXP(x, 175, T0); x.lager = {}; return L.kanPlante(x, 0, 'erter') === null && L.plant(x, 0, 'erter', T0).gratis === true; })());

// --- Kunder ved markedsbua (0.9.4) ---
s = L.ny(T0);
{ const k = L.nyKunde(s); t('Kunden ber om én vare spilleren kan lage', k && L.kanLage(s, k.vare) && !D.erFor(k.vare) && k.antall >= 1 && k.antall <= 4 && k.mynter === D.pris(k.vare) * k.antall);
  s.lager = {}; r = L.selgTilKunde(s, k); t('Uten varen: ingen handel og ingen straff', !r.ok && r.grunn === 'mangler' && r.mangler === k.antall && s.mynter === 50 && s.xp === 0);
  s.lager[k.vare] = k.antall + 2; r = L.selgTilKunde(s, k); t('Salg til kunde gir mynter og tar varene, ikke XP', r.ok && s.mynter === 50 + k.mynter && s.lager[k.vare] === 2 && s.xp === 0 && s.stat.kunder === 1); }
t('Kundens pris regnes ut av reglene, ikke av ønsket', (() => { const x = L.ny(T0); x.lager.egg = 9; const q = L.selgTilKunde(x, { vare: 'egg', antall: 2, mynter: 99999 }); return q.ok && q.mynter === 16 && x.mynter === 66; })());
t('Kunden kan ikke kjøpe fôr eller ukjente varer', !L.selgTilKunde(s, { vare: 'honsefor', antall: 1 }).ok && !L.selgTilKunde(s, { vare: 'gull', antall: 1 }).ok && !L.selgTilKunde(s, null).ok);

console.log(`Min Bondegård logikk: ${ok} ok, ${feil} feil`);
process.exit(feil ? 1 : 0);
