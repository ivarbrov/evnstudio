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
  const r2 = L.svarGate(s, g, T0); t('Riktig svar tar varen og gir mynter og XP', r2.ok && !s.lager[g] && s.mynter === m0 + r2.mynter && r2.mynter === D.pris(g) * 2 + 10 && s.rebus.loste === 1);
  t('Ny gåte først etter 3 minutter', L.harGate(s, T0 + 179 * S) === null && !!L.harGate(s, T0 + 180 * S)); }
{ const g = s.rebus.gate, n = L.byttGate(s, T0 + 181 * S); t('En annen gåte gir en ny', !!n && n !== g); }
{ const k = L.valider(JSON.parse(JSON.stringify(s)), T0 + 200 * S); t('Gåten overlever lagring', k.rebus.gate === s.rebus.gate && k.rebus.loste === 1); }

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
  t('Gratis i 7 dager: fôrkverna trenger ingen varer', L.produser(s4, 'forkvern', 'honsefor', T0).ok && s4.lager.hvete === 2);
  delete s4.lager.hvete; t('Etter 7 dager koster det igjen', L.kanProdusere(s4, 'forkvern', 'honsefor', T0 + 8 * 86400000) === 'mangler' && L.kanProdusere(s4, 'forkvern', 'honsefor', T0) !== 'mangler'); }
{ const k = L.valider(JSON.parse(JSON.stringify(s)), T0); t('Gavene overlever lagring', k.gaver.uaapnet.length === 3 && k.gaver.dag === '2026-11-15'); }

console.log(`Min Bondegård logikk: ${ok} ok, ${feil} feil`);
process.exit(feil ? 1 : 0);
