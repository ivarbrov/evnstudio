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

console.log(`Min Bondegård logikk: ${ok} ok, ${feil} feil`);
process.exit(feil ? 1 : 0);
