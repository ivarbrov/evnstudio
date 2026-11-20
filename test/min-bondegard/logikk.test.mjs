// Min Bondegård – tester for spillreglene (logikk.js) og tallene (data.js). Kjør: node test/min-bondegard/logikk.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../../spill/min-bondegard/logikk.js');
const D = L.D;
let feil = 0, ok = 0;
const t = (navn, sant, info = '') => { if (sant) ok++; else { feil++; console.log('FEIL:', navn, info); } };
const S = 1000, T0 = 1_800_000_000_000;

// --- Data ---
const tider = f => [...Object.values(D.avlinger).filter(f).map(a => a.tid), ...Object.values(D.dyr).filter(f).map(a => a.tid), ...Object.values(D.oppskrifter).filter(f).map(o => o.tid)];
t('Ingen jobb over 4 min på nivå 1–10 (B1)', Math.max(...tider(x => x.nivaa <= 10)) <= D.maksVentetid, Math.max(...tider(x => x.nivaa <= 10)));
t('Ingen jobb over 6 min på nivå 11–20 (progresjonsplanen kap. 3)', Math.max(...tider(x => x.nivaa > 10)) <= 360, Math.max(...tider(x => x.nivaa > 10)));
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
t('Maks nivå 22 (0.33.0), med 15 åkre og 4 høner', (() => { const x = L.ny(T0); L.giXP(x, 99999, T0); return x.nivaa === 22 && D.maksNivaa === 22 && x.akre.length === 15 && x.dyr.hone.length === 4; })());
{ const x = L.ny(T0); while (x.nivaa < 16) L.giXP(x, 5, T0); x.mynter = 20000;
  t('Nivå 14–16: paibakeri og sauefjøs kan bygges, gresskar kan plantes', x.bygg.paibakeri && x.bygg.sauefjos && !x.dyr.sau && L.kanPlante(x, 0, 'gresskar', T0) === null && x.lager.gresskar === D.nyAvlingFro);
  L.kjopBygg(x, 'paibakeri'); L.kjopBygg(x, 'sauefjos'); x.lager.gulrot = 3; x.lager.egg = 1; x.lager.hvete = 5; x.lager.erter = 1;
  t('Sauene kommer med sauefjøset, og gulrotpai og sauefor kan lages', x.dyr.sau.length === 2 && L.produser(x, 'paibakeri', 'gulrotpai', T0).ok && L.produser(x, 'forkvern', 'sauefor', T0).ok);
  x.lager.sauefor = 2; const m = L.mat(x, 'sau', T0), u = L.samleDyr(x, 'sau', T0 + 301 * S);
  t('Sauer gir ull etter 5 min', m.ok && u.ok && x.lager.ull === 2);
  t('Låve 125 fra nivå 14, silo 100 og 6 bestillinger fra nivå 15', L.kapasitet(x, 'lave') === 125 && L.kapasitet(x, 'silo') === 100 && D.ved(D.bestillinger.plasser, 16) === 6);
  const v = L.valider(JSON.parse(JSON.stringify(x)), T0); t('Nivå 16 overlever lagring', v.nivaa === 16 && v.bygg.paibakeri.eid && v.dyr.sau.length === 2);
  L.kjopOmrade(x, 'enga'); L.kjopOmrade(x, 'skogkanten'); L.kjopBygg(x, 'grisebinge'); while (x.nivaa < 20) L.giXP(x, 5, T0); x.mynter = 20000; L.kjopBygg(x, 'vevstol'); L.kjopBygg(x, 'bakeri'); x.lager.ull = 3; x.lager.gresskar = 1; x.lager.hvete = 2; x.lager.egg = 1;
  t('Nivå 17–20: vevstol lager lue og genser, bakeriet gresskarbrød', x.nivaa === 20 && L.produser(x, 'vevstol', 'lue', T0).ok && L.produser(x, 'vevstol', 'genser', T0).ok && L.produser(x, 'bakeri', 'gresskarbrod', T0).ok);
  t('Nivå 18 gir en gris til og låve 150, nivå 19 en sau til og silo 125', x.dyr.gris.length === 3 && x.dyr.sau.length === 3 && L.kapasitet(x, 'lave') === 150 && L.kapasitet(x, 'silo') === 125);
  t('Syltetøy kommer på nivå 20, og hundehuset kan lagres', D.hund.nivaa === 20 && L.valider(Object.assign(JSON.parse(JSON.stringify(x)), { plasser: { hundehus: { x: 1, z: 2, r: 0 } } }), T0).plasser.hundehus.x === 1);
  t('Genser er verdt mer enn to ull', D.verdi('genser') > 2 * D.verdi('ull') && D.verdi('lue') > D.verdi('ull')); }
{ const x = L.ny(T0); while (x.nivaa < 10) L.giXP(x, 5, T0); const h10 = x.dyr.hone.length; x.mynter = 5000; L.kjopOmrade(x, 'enga'); L.kjopBygg(x, 'fjos'); const k10 = x.dyr.ku.length;
  let n11 = null, n13 = null; while (x.nivaa < 13) { const nye = L.giXP(x, 5, T0); nye.forEach(n => { if (n.nivaa === 11) n11 = n; if (n.nivaa === 13) n13 = n; }); }
  t('Nivå 11 gir en høne til og sirup, nivå 13 en ku til, smørpopkorn og 3 åkre', h10 === 3 && k10 === 2 && x.dyr.hone.length === 4 && x.dyr.ku.length === 3 && n11.flereDyr[0].art === 'hone' && n11.oppskrifter.includes('sirup') && n13.flereDyr[0].art === 'ku' && n13.oppskrifter.includes('smorpopkorn') && n13.akre === 3);
  const v = L.valider(JSON.parse(JSON.stringify(x)), T0); t('Nivå 13 overlever lagring', v.nivaa === 13 && v.dyr.hone.length === 4 && v.dyr.ku.length === 3 && v.akre.length === 15);
  const gml = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 12 }), T0); t('Eldre lagring på nivå 12 får den fjerde høna', gml.dyr.hone.length === 4);
  t('Bakjordet (nivå 13, 2500) krever Jordet', L.kanKjopeOmrade(x, 'bakjordet') === 'krever' && L.kjopOmrade(x, 'jordet').ok && L.kjopOmrade(x, 'bakjordet').ok);
  t('Verdier: sirup, omelett og smørpopkorn er verdt mer enn råvarene', D.verdi('sirup') > 24 && D.verdi('omelett') > 38 && D.verdi('smorpopkorn') > D.verdi('popkorn') + D.verdi('smor')); }

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
  t('Ivar 15.11: bestillinger gir 1,6 × verdien (tilbake fra 2,0), Popkornmaskinen koster 750', D.bestillinger.myntFaktor === 1.6 && D.bygg.popkorn.pris === 750);
  t('Belønning følger formelen', o.mynter === Math.round(verdi * D.bestillinger.myntFaktor) && o.xp === Math.max(3, Math.round(0.6 * Math.pow(verdi, 0.85)))); }
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
  const k = L.valider(rar, T0); t('Lagret bestilling kan ikke gi mer enn reglene', k.best.liste.length === 3 && k.best.liste[0].mynter === D.bestillingMynter(2 * D.pris('hvete')) && k.best.liste[0].xp === 3 && k.best.liste.every(o => Object.keys(o.varer).every(v => !D.erFor(v) && o.varer[v] <= 12))); }
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

// --- Enga, fjøs, kyr og meieri (0.9.8, Ivar 12.11) ---
s = L.ny(T0); L.giXP(s, 20 + 35 + 50 + 70, T0); s.mynter = 1000;
t('Nivå 5: Enga kan kjøpes, fjøset ikke ennå', L.kanKjopeOmrade(s, 'enga') === null && !s.bygg.fjos);
r = L.kjopOmrade(s, 'enga'); t('Enga koster 300 og kan bare kjøpes én gang', r.ok && s.mynter === 700 && s.omrader.enga === true && L.kjopOmrade(s, 'enga').grunn === 'eid');
t('Skogkanten er låst til nivå 10', L.kanKjopeOmrade(s, 'skogkanten') === 'laast');
L.giXP(s, 95, T0);
t('Nivå 6 gir fjøs og meieri som kan bygges, men ingen kyr før fjøset er kjøpt', s.nivaa === 6 && s.bygg.fjos && !s.bygg.fjos.eid && s.bygg.meieri && !s.dyr.ku);
r = L.kjopBygg(s, 'fjos'); t('Fjøset koster 300 og gir 2 kyr', r.ok && r.dyr === 2 && s.mynter === 400 + D.nivaaMynter(6) && s.dyr.ku.length === 2);
s.lager.kufor = 1; r = L.mat(s, 'ku', T0); t('En ku spiser kufôr', r.ok && r.antall === 1 && !s.lager.kufor);
r = L.samleDyr(s, 'ku', T0 + 120 * S); t('Kua gir melk etter 2 minutter', r.ok && s.lager.melk === 1);
{ s.mynter = 600; t('Meieriet kan kjøpes og lager fløte av melk', L.kjopBygg(s, 'meieri').ok && L.produser(s, 'meieri', 'flote', T0).ok && !s.lager.melk); }
{ const k = L.valider(JSON.parse(JSON.stringify(s)), T0); t('Enga, fjøs og kyr overlever lagring', k.omrader.enga === true && k.bygg.fjos.eid && k.dyr.ku.length === 2); }
{ const x = L.valider({ v: 1, nivaa: 4, mynter: 100, lager: {}, omrader: { enga: true } }, T0); t('Enga lagret under nivå 5 godtas ikke', !x.omrader.enga); }
{ const x = L.valider({ v: 1, nivaa: 6, mynter: 100, lager: {}, dyr: { ku: [{ slutt: null }] } }, T0); t('Kyr uten fjøs fjernes', !x.dyr.ku); }

// --- Rebus' gåter (0.11.0, Even 13.11) ---
s = L.ny(T0); t('Ingen gåte på nivå 1', L.harGate(s, T0) === null);
L.giXP(s, 20, T0); { const g = L.harGate(s, T0); t('Nivå 2: gåten handler om noe spilleren kan lage nå', ['hvete', 'mais', 'egg', 'honsefor'].includes(g) && D.gater[g]); }
{ const g = s.rebus.gate, feil = g === 'mais' ? 'hvete' : 'mais'; s.lager[feil] = 1; s.lager[g] = 1; const m0 = s.mynter;
  t('Feil svar koster ingenting', L.svarGate(s, feil, T0).grunn === 'feil' && s.lager[feil] === 1 && s.mynter === m0);
  const r2 = L.svarGate(s, g, T0); t('Riktig svar gir mynter og XP og tar ingen vare', r2.ok && s.lager[g] === 1 && s.mynter === m0 + r2.mynter && r2.mynter === D.pris(g) + 10 && s.rebus.loste === 1);
  t('Ny gåte først etter 3 minutter', L.harGate(s, T0 + 179 * S) === null && !!L.harGate(s, T0 + 180 * S)); }
{ const g = s.rebus.gate, n = L.byttGate(s, T0 + 181 * S); t('En annen gåte gir en ny', !!n && n !== g); }
{ const k = L.valider(JSON.parse(JSON.stringify(s)), T0 + 200 * S); t('Gåten overlever lagring', k.rebus.gate === s.rebus.gate && k.rebus.loste === 1); }
{ const g = s.rebus.gate; s.lager[g] = 0; const r3 = L.svarGate(s, g, T0 + 201 * S); t('Riktig svar teller selv om du ikke har varen (Even 15.11)', r3.ok && s.lager[g] === 0 && s.rebus.loste === 2); }

// --- Gaveesker (0.12.0, Even 14.11, godkjent av Ivar 14.11) ---
s = L.ny(T0);
t('Én dagsgave per dato', L.giDagsgave(s, '2026-11-14') && !L.giDagsgave(s, '2026-11-14') && L.giDagsgave(s, '2026-11-15') && s.gaver.uaapnet.length === 2);
t('Dagsgaven kan ikke åpnes før den er levert', L.klareGaver(s) === 0 && L.aapneGave(s, T0).grunn === 'ingen' && L.leverGaver(s) === 2 && L.klareGaver(s) === 2);
L.giXP(s, 20, T0); t('Nytt nivå gir en levert gaveeske', s.gaver.uaapnet.length === 3 && s.gaver.uaapnet[2].kilde === 'nivaa' && s.gaver.uaapnet[2].levert);
{ const c = {}; const s2 = L.ny(T0); L.giXP(s2, 300, T0); for (let i = 0; i < 20000; i++) { s2.gaver.uaapnet.push({ kilde: 'dag', levert: true }); const r2 = L.aapneGave(s2, T0); c[r2.premie] = (c[r2.premie] || 0) + 1; }
  t('Sjansene stemmer omtrent (50 % mynter, 25 % XP, 5 % maskin)', Math.abs(c.mynter / 20000 - 0.5) < 0.02 && Math.abs(c.xp / 20000 - 0.25) < 0.02 && Math.abs(c.maskin / 20000 - 0.05) < 0.01 && c.gullgard > 0);
  t('Maskin gir gratis bygg til alt er bygd, så mynter', Object.keys(s2.bygg).every(b => s2.bygg[b].eid || D.bygg[b].nivaa > Math.min(s2.nivaa, D.innholdTil)));
  t('Premier etter at alt er vunnet gir hele mynter', Number.isInteger(s2.mynter) && D.gave.maskinMynter === 300 && D.gave.superrarMynter === 200);
  t('Gullgården og all gullpynt kan vinnes', s2.gaver.gullgard && Object.keys(s2.gaver.pynt).length === D.gave.pynt.length); }
{ const s3 = L.ny(T0); for (let i = 0; i < 2000; i++) { s3.gaver.uaapnet.push({ kilde: 'nivaa', levert: true }); if (L.aapneGave(s3, T0).premie === 'mynter') { t('Nivågaven gir aldri bare mynter', false); break; } } t('Nivågaven gir aldri bare mynter', true); }
{ const s4 = L.ny(T0); s4.gaver.bonus = T0 + 7 * 86400000; s4.lager.hvete = 2;
  t('Gratis i 7 dager: planting bruker ikke frø', L.plant(s4, 0, 'hvete', T0).ok && s4.lager.hvete === 2);
  t('Gratis i 7 dager: fôrkvernen trenger ingen varer', L.produser(s4, 'forkvern', 'honsefor', T0).ok && s4.lager.hvete === 2);
  delete s4.lager.hvete; t('Etter 7 dager koster det igjen', L.kanProdusere(s4, 'forkvern', 'honsefor', T0 + 8 * 86400000) === 'mangler' && L.kanProdusere(s4, 'forkvern', 'honsefor', T0) !== 'mangler'); }
{ const k = L.valider(JSON.parse(JSON.stringify(s)), T0); t('Gavene overlever lagring', k.gaver.uaapnet.length === 3 && k.gaver.dag === '2026-11-15'); }

// --- Nivå 10: Skogkanten og griser (0.13.0) ---
{ const s5 = L.ny(T0); while (s5.nivaa < 10) L.giXP(s5, 5, T0); s5.mynter = 3000;
  t('Nivå 10: grisebinge kan bygges, men ingen griser før den er kjøpt', s5.nivaa === 10 && s5.bygg.grisebinge && !s5.bygg.grisebinge.eid && !s5.dyr.gris);
  t('Skogkanten koster 1500', L.kjopOmrade(s5, 'skogkanten').ok && s5.mynter === 1500);
  const r5 = L.kjopBygg(s5, 'grisebinge'); t('Grisebingen koster 800 og gir 2 griser', r5.ok && r5.dyr === 2 && s5.dyr.gris.length === 2 && s5.mynter === 700);
  s5.lager.gulrot = 2; s5.lager.erter = 1; t('Grisefôr lages av gulrot og erter', L.produser(s5, 'forkvern', 'grisefor', T0).ok);
  s5.lager.grisefor = 1; L.mat(s5, 'gris', T0); t('Grisen gir trøfler etter 4 minutter', L.samleDyr(s5, 'gris', T0 + 240 * S).ok && s5.lager.troffel === 1);
  const k5 = L.valider(JSON.parse(JSON.stringify(s5)), T0); t('Skogkanten og griser overlever lagring', k5.omrader.skogkanten && k5.dyr.gris.length === 2); }


// --- Årstidsfester (0.16.0) ---
{ const A = D.arr.bursdag, k = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 3 }), T0);
  t('Festen er stengt under nivå 3 og utenfor november', L.arrId(L.ny(T0), 11) === null && L.arrId(k, 11) === 'bursdag' && L.arrId(k, 12) === null);
  t('Festbordet følger ikke med nivået', !L.valider(JSON.parse(JSON.stringify(Object.assign(L.ny(T0), { nivaa: 5 }))), T0).bygg.festbord);
  L.arrStart(k, 'bursdag');
  t('Festen gir en byggeplass for Festbordet', k.bygg.festbord && k.bygg.festbord.eid === false && k.arr.bursdag.levert === 0);
  t('Uten hatter kan ingenting sendes', L.arrLever(k, 'bursdag', 11, T0).grunn === 'mangler');
  k.lager.festhatt = 5; const m0 = k.mynter;
  t('Utenfor november kan hatter ikke sendes, og de blir liggende', L.arrLever(k, 'bursdag', 12, T0).grunn === 'stengt' && k.lager.festhatt === 5);
  const r1 = L.arrLever(k, 'bursdag', 11, T0);
  t('5 hatter gir første premie, mynter og XP', r1.ok && r1.antall === 5 && !k.lager.festhatt && k.mynter === m0 + 5 * D.pris('festhatt') && r1.xp === 5 * A.xp && r1.premier.length === 1 && r1.premier[0].premie === 'hatter' && L.arrHar(k, 'bursdag', 'hatter'));
  k.bygg.bakeri.eid = true; k.lager.hvete = 4; k.lager.egg = 4;
  t('Bursdagskaka er låst før trinn 2', L.kanProdusere(k, 'bakeri', 'bursdagskake', T0) === 'laast' && !L.kanLage(k, 'bursdagskake'));
  k.lager.festhatt = 25; const r2 = L.arrLever(k, 'bursdag', 11, T0);
  t('30 hatter gir oppskrift og bursdagsbilen i samme sending', r2.premier.map(x => x.premie).join() === 'oppskrift,skinn' && k.skinn.eid.bursdag && k.skinn.valgt === 'bursdag' && L.kanProdusere(k, 'bakeri', 'bursdagskake', T0) === null);
  k.lager.festhatt = 20; const r3 = L.arrLever(k, 'bursdag', 11, T0);
  t('50 hatter gir pynten, og ingenting gis to ganger', r3.premier.length === 1 && k.gaver.pynt.bursdagspynt && L.arrTrinn(k, 'bursdag') === 4 && (k.lager.festhatt = 3, L.arrLever(k, 'bursdag', 11, T0).premier.length === 0));
  t('Skinn kan byttes, men bare til et som er eid', L.velgSkinn(k, null) && k.skinn.valgt === null && !L.velgSkinn(k, 'jul') && L.velgSkinn(k, 'bursdag'));
  t('Festhatter kan ikke selges eller bestilles', !L.kanSelge('festhatt') && !L.bestPool(k).includes('festhatt') && L.bestPool(k).includes('bursdagskake'));
  k.bygg.festbord.eid = true; k.bygg.festbord.x = 2; k.bygg.festbord.z = 3; k.gaver.pynt.bursdagspynt.x = 1;
  const v = L.valider(JSON.parse(JSON.stringify(k)), T0);
  t('Lagring og lasting beholder festen', v.arr.bursdag.levert === 53 && v.bygg.festbord.eid && v.bygg.festbord.x === 2 && v.skinn.valgt === 'bursdag' && v.skinn.eid.bursdag && v.gaver.pynt.bursdagspynt.x === 1);
  const juks = JSON.parse(JSON.stringify(L.ny(T0))); juks.nivaa = 5; juks.skinn = { eid: { bursdag: true }, valgt: 'bursdag' }; juks.gaver.pynt = { bursdagspynt: { x: 1, z: 1, r: 0 } }; juks.arr = { bursdag: { levert: 4 } };
  const vj = L.valider(juks, T0);
  t('Lagringen kan ikke gi premier som ikke er tjent', !vj.skinn.eid.bursdag && vj.skinn.valgt === null && !vj.gaver.pynt.bursdagspynt && vj.arr.bursdag.levert === 4);
  t('Feil typer i festen tåles', L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 4, arr: { bursdag: { levert: 'x' } }, skinn: 7 }), T0).arr.bursdag.levert === 0);
  { const j = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 8, mynter: 1000 }), T0), j7 = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 7, mynter: 5000 }), T0);
    t('Jordet kan kjøpes på nivå 8 for 1000 og lagres', L.kanKjopeOmrade(j7, 'jordet') === 'laast' && L.kjopOmrade(j, 'jordet').ok && j.mynter === 0 && L.valider(JSON.parse(JSON.stringify(j)), T0).omrader.jordet === true); }
  { const o = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 10, mynter: 5000 }), T0);
    t('Østjordet er låst på nivå 10 (kommer på nivå 16)', L.kanKjopeOmrade(o, 'ostjordet') === 'laast' && D.omrader.ostjordet.nivaa === 16 && D.omrader.ostjordet.krever === 'jordet');
    o.nivaa = 16;
    t('Østjordet (nivå 16, 4000) krever Jordet først', L.kanKjopeOmrade(o, 'ostjordet') === 'krever' && L.kjopOmrade(o, 'jordet').ok && L.kjopOmrade(o, 'ostjordet').ok && o.mynter === 0); }   /* lagring over nivåtaket (10) prøves når taket heves */
  { const f = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 3, mynter: 500 }), T0); L.arrStart(f, 'bursdag'); f.bygg.festbord.eid = true; f.lager.hvete = 10; f.lager.mais = 10;
    L.settManed(12); const des = L.kanProdusere(f, 'festbord', 'festhatt', T0), brod = L.kanProdusere(f, 'bakeri', 'brod', T0);
    L.settManed(11); const nov = L.kanProdusere(f, 'festbord', 'festhatt', T0); L.settManed(null);
    t('Festbordet lager hatter i november, men er stengt i desember (QA 17.11)', des === 'stengt' && nov !== 'stengt' && brod !== 'stengt'); }
  { const f = L.valider(JSON.parse(JSON.stringify(L.ny(T0))), T0); f.lager.hvete = 0;
    const uten = L.kanProdusere(f, 'forkvern', 'honsefor', T0); L.settGratis(true); const med = L.kanProdusere(f, 'forkvern', 'honsefor', T0), r = L.produser(f, 'forkvern', 'honsefor', T0); L.settGratis(false);
    t('Lage uten råvarer er av som standard og virker bare når admin slår det på', uten === 'mangler' && med === null && r.ok && f.lager.hvete === 0 && L.kanProdusere(f, 'forkvern', 'honsefor', T0) === 'mangler'); }
  { const x = L.valider(Object.assign(JSON.parse(JSON.stringify(L.ny(T0))), { nivaa: 2, mynter: 100 }), T0), n1 = L.ny(T0);
    const laast = L.kanKjopePynt(n1, 'lykt'), k = L.kjopPynt(x, 'lykt'), k2 = L.kjopPynt(x, 'blomsterbed'), raad = L.kanKjopePynt(x, 'fontene');
    t('Pyntebutikken: åpner på nivå 2, lykt 40 og blomsterbed 30, ikke råd til fontene', laast === 'laast' && k.ok && k2.ok && x.mynter === 30 && x.pynt.length === 2 && raad === 'mynter');
    x.pynt[0].x = 3; x.pynt[0].z = 4; const v = L.valider(JSON.parse(JSON.stringify(x)), T0);
    t('Kjøpt pynt overlever lagring med plass', v.pynt.length === 2 && v.pynt[0].t === 'lykt' && v.pynt[0].x === 3 && v.pynt[1].x === null);
    const sg = L.selgPynt(x, x.pynt[0].id); t('Pynt selges tilbake for halv pris', sg.ok && sg.mynter === 20 && x.mynter === 50 && x.pynt.length === 1);
    t('Ugyldig pynt i lagringen fjernes', L.valider(Object.assign(JSON.parse(JSON.stringify(x)), { pynt: [{ t: 'tull' }, null, { t: 'benk', x: 'a' }] }), T0).pynt.length === 1); }
  { const x = L.ny(T0); while (x.nivaa < 18) L.giXP(x, 5, T0); x.mynter = 6000; const for1 = L.kast(x, T0), kj = L.kjopOmrade(x, 'elvebredden'), k1 = L.kast(x, T0), k2 = L.kast(x, T0), tidlig = L.halInn(x, T0 + 30 * S);
    t('Fiskebrygga: krever Elvebredden (nivå 18, 6000), ett snøre om gangen, 90 s', for1.grunn === 'ikke-kjopt' && kj.ok && x.mynter === 0 && k1.ok && k2.grunn === 'ute' && tidlig.grunn === 'venter' && !L.fiskKlar(x, T0 + 89 * S) && L.fiskKlar(x, T0 + 90 * S));
    const v = L.valider(JSON.parse(JSON.stringify(x)), T0 + 10 * S); t('Snøret overlever lagring', v.omrader.elvebredden === true && v.fiske.slutt === T0 + 90 * S);
    const h = L.halInn(x, T0 + 600 * S); t('Fisken venter til du haler inn, og gir 1 fisk og 3 XP', h.ok && ['abbor', 'orret', 'gjedde'].includes(h.vare) && x.lager[h.vare] === 1 && h.xp === 3 && x.fiske.slutt === null);
    const tell = { abbor: 0, orret: 0, gjedde: 0 }; for (let i = 0; i < 600; i++) { x.lager = {}; L.kast(x, T0); tell[L.halInn(x, T0 + 100 * S).vare]++; }
    t('Fordeling ca. 60/30/10 over 600 fisk', tell.abbor > 300 && tell.abbor < 420 && tell.orret > 130 && tell.orret < 230 && tell.gjedde > 30 && tell.gjedde < 95, JSON.stringify(tell));
    t('Fisk kan selges, men kommer ikke i bestillinger', L.kanSelge('gjedde') && !L.bestPool(x).includes('abbor')); }
  { const paPlan = D.bygg.geitefjos.nivaa === 26 && D.dyr.geit.nivaa === 26 && D.oppskrifter.geitefor.nivaa === 26;
    D.bygg.geitefjos.nivaa = D.dyr.geit.nivaa = D.oppskrifter.geitefor.nivaa = D.maksNivaa;   /* slik admin har det i testversjonen */
    const x = L.ny(T0); L.giXP(x, 99999, T0); x.mynter = 8000; const k = L.kjopBygg(x, 'geitefjos'); D.bygg.geitefjos.nivaa = D.dyr.geit.nivaa = D.oppskrifter.geitefor.nivaa = 26;
    t('Geiter (0.31.0, nivå 26 fra 0.32.0): geitefjøset koster 8000 og gir 2 geiter', paPlan && k.ok && x.mynter === 0 && x.dyr.geit.length === 2 && D.dyr.geit.produkt === 'geitemelk');
    t('Geitefor lages i forkvernen av mais og gulrot, og geitemelk kan selges', D.oppskrifter.geitefor.bygg === 'forkvern' && D.erFor('geitefor') && L.kanSelge('geitemelk') && !L.kanSelge('geitefor') && !!D.gater.geitemelk); }
  { const x = L.ny(T0); L.giXP(x, 99999, T0); x.mynter = 3000; const f0 = L.selvStart(x, T0), k = L.kjopBygg(x, 'epletre'), f1 = L.selvStart(x, T0), f2 = L.selvStart(x, T0 + 10 * S);
    t('Epletreet (0.32.0): nivå 21, 3000 mynter, og starter selv når det er kjøpt', D.bygg.epletre.nivaa === 21 && f0 === 0 && k.ok && x.mynter === 0 && f1 === 1 && f2 === 0 && x.bygg.epletre.ko.length === 1);
    t('Epletreet kan ikke startes for hånd', L.kanProdusere(x, 'epletre', 'eple', T0) === 'selv');
    const tidlig = L.hentProdukter(x, 'epletre', T0 + 299 * S), h = L.hentProdukter(x, 'epletre', T0 + 3600 * S);
    t('Eplene venter på treet, og 2 epler plukkes etter 300 s', !tidlig.ok && h.ok && x.lager.eple === 2 && x.bygg.epletre.ko.length === 0);
    t('Etter plukking starter en ny runde, og epler kan selges', L.selvStart(x, T0 + 3600 * S) === 1 && x.bygg.epletre.ko[0].slutt === T0 + 3900 * S && L.kanSelge('eple') && !!D.gater.eple); }
  { const x = L.ny(T0); L.giXP(x, 99999, T0); x.mynter = 4000; const k = L.kjopBygg(x, 'bikube'); L.selvStart(x, T0); const h = L.hentProdukter(x, 'bikube', T0 + 360 * S);
    t('Bikuben (0.33.0): nivå 22, 4000 mynter, og gir 1 honning etter 360 s', D.bygg.bikube.nivaa === 22 && k.ok && x.mynter === 0 && h.ok && x.lager.honning === 1 && D.pris('honning') === 30 && L.kanSelge('honning') && !!D.gater.honning); }
  { const x = L.ny(T0), tidlig = L.nyNabo(x, 'bleep'); while (x.nivaa < 6) L.giXP(x, 10, T0);
    let ok = true, antall = {1: 0, 2: 0, 3: 0}; for (let i = 0; i < 300; i++) { const o = L.nyNabo(x, 'bleep'); antall[o.liste.length]++; const varer = o.liste.map(l => l.vare);
      if (o.hvem !== 'bleep' || new Set(varer).size !== varer.length || varer.some(v => D.erFor(v) || !L.bestPool(x).includes(v)) || o.mynter !== o.liste.reduce((m, l) => m + D.pris(l.vare) * l.antall, 0)) ok = false; }
    t('Naboer (0.34.0): Bleep kommer fra nivå 4 og ber om én, to eller tre ulike varer spilleren kan lage', tidlig === null && ok && antall[1] > 40 && antall[2] > 40 && antall[3] > 40 && L.nyNabo(x, 'ukjent') === null, JSON.stringify(antall));
    const o = { hvem: 'bleep', liste: [{ vare: 'hvete', antall: 3 }, { vare: 'egg', antall: 2 }] }; x.lager = { hvete: 3, egg: 1 }; const m0 = x.mynter, mangler = L.selgTilNabo(x, o);
    t('Naboen får ingenting før alt er der, og sier hva som mangler', !mangler.ok && mangler.grunn === 'mangler' && mangler.mangler.length === 1 && mangler.mangler[0].vare === 'egg' && mangler.mangler[0].antall === 1 && x.lager.hvete === 3 && x.mynter === m0);
    x.lager.egg = 2; const r = L.selgTilNabo(x, o);
    t('Naboen betaler vanlig pris for alt på lista', r.ok && r.mynter === D.pris('hvete') * 3 + D.pris('egg') * 2 && x.mynter === m0 + r.mynter && !x.lager.hvete && !x.lager.egg);
    t('Naboen tar ikke imot juks: for, samme vare to ganger eller for lang liste', !L.selgTilNabo(x, { hvem: 'bleep', liste: [{ vare: 'honsefor', antall: 1 }] }).ok && !L.selgTilNabo(x, { hvem: 'bleep', liste: [{ vare: 'hvete', antall: 1 }, { vare: 'hvete', antall: 1 }] }).ok && !L.selgTilNabo(x, { hvem: 'bleep', liste: [1, 2, 3, 4].map(() => ({ vare: 'hvete', antall: 1 })) }).ok);
    t('Blomst har ingen tidsfrist (Even 19.11)', D.kunder.venter === 0);
    t('Fem naboer (0.35.0): Bleep, Gnist, Dråpe, Bolt og Spire', Object.keys(D.naboer.liste).join() === 'bleep,gnist,drape,bolt,spire' && ['Bleep', 'Gnist', 'Dråpe', 'Bolt', 'Spire'].every((n, i) => Object.values(D.naboer.liste)[i].navn === n));
    while (x.nivaa < 10) L.giXP(x, 50, T0); const sett = {}; for (let i = 0; i < 400; i++) sett[L.nesteNabo(x)] = 1;
    t('Alle fem kan komme', Object.keys(sett).length === 5);
    t('Favoritter: Gnist liker bakeriet, Dråpe melk og meieri, Spire avlinger', L.naboLiker('gnist', 'brod') && !L.naboLiker('gnist', 'hvete') && L.naboLiker('drape', 'melk') && L.naboLiker('drape', 'smor') && !L.naboLiker('drape', 'brod') && L.naboLiker('spire', 'hvete') && !L.naboLiker('spire', 'egg') && !L.naboLiker('bleep', 'hvete') && !L.naboLiker('bolt', 'hvete'));
    t('Bolt liker ting fra dyrene (0.35.1): egg, melk, ull og honning', ['egg', 'melk', 'ull', 'honning', 'geitemelk'].every(v => L.naboLiker('bolt', v)) && !L.naboLiker('bolt', 'brod') && !L.naboLiker('bolt', 'smor'));
    let fav = 0, alle = 0; for (let i = 0; i < 400; i++) L.nyNabo(x, 'spire').liste.forEach(l => { alle++; if (D.avlinger[l.vare]) fav++; });
    t('Spire ber oftest om avlinger, men ikke bare', fav / alle > 0.6 && fav / alle < 0.98, (fav / alle).toFixed(2));
    let dobbel = false; for (let i = 0; i < 300; i++) { const v = L.nyNabo(x, 'gnist').liste.map(l => l.vare); if (new Set(v).size !== v.length) dobbel = true; } t('Favoritter gir aldri samme vare to ganger', !dobbel); }
  t('Ivar må godkjenne tallene: 5, 15, 30, 50 hatter og Festbordet 150', A.trinn.map(x => x.n).join() === '5,15,30,50' && D.bygg.festbord.pris === 150 && A.maned === 11);
}
console.log(`Min Bondegård logikk: ${ok} ok, ${feil} feil`);
process.exit(feil ? 1 : 0);
