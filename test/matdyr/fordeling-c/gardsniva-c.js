// Gårdsnivå 1–10 med dagens fordeling og alternativ C. SIMULERING, IKKE SPILLTEST.
// Bygger på ../gardsniva.js (samme spillerprofiler, turmodell og forenklinger), med to tillegg:
//  - bestillingsgarantien fra prototypen (8f4c0c9) er modellert per matdyr spilleren ser
//  - nivå 10 kan simuleres med ulike krav
// Bruk: FORDELING=idag|c GARANTI=av|proto|tak K10=hval|valgfri MIN=960 node gardsniva-c.js
const D = require('../data.js'); const { NY } = require('./stige.js');
const { R, ANIMALS, FOODS } = D;
const FORD = process.env.FORDELING || 'c', GAR = process.env.GARANTI || 'proto', K10 = process.env.K10 || 'hval';
const COMBOS = D.COMBOS.map((c, i) => ({ ...c, r: FORD === 'c' ? NY[i] : c.r, m: (FORD === 'c' ? NY[i] : c.r) >= 5 ? 1 : c.m }));
const POOLS = R.map((_, r) => COMBOS.map((c, i) => c.r === r ? i : -1).filter(i => i >= 0));
const PRICE = ci => Math.round(R[COMBOS[ci].r].price * COMBOS[ci].m), INC = ci => Math.round(R[COMBOS[ci].r].inc * COMBOS[ci].m);
const upCost = l => l < 10 ? D.upCost(l) : 1e7 * Math.pow(2, l - 10);
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ART = n => n === null ? -1 : ANIMALS.findIndex(a => a[1] === n);
const artOk = (n, c) => n === null || Math.floor(c / FOODS.length) === ART(n);
const KRAV10 = {
  hval:    [['hval', 1, 5], [null, 2, 4]],                    // dagens: hvalens Food God (Óðinn) eller bedre
  valgfri: [[null, 1, 5], ['hval', 1, 4], [null, 1, 4]],      // én Food God av hvilken som helst art + hval Mythic+
  kall:    [['hval', 1, 5], [null, 2, 4]],                    // som hval, med Óðinn-kall (se trekk)
};
const NIVA = [
  {tak:8},
  {tak:12, krav:[["ku",2,0],["gris",1,0]], penger:1000},
  {tak:16, krav:[["sau",2,1],["skilpadde",1,0]], penger:10000},
  {tak:20, krav:[["katt",1,2],["høne",2,1]], penger:60000},
  {tak:24, krav:[["rev",2,2],["hest",1,1]], penger:250000},
  {tak:28, krav:[["hund",1,3],["panda",2,2]], penger:2e6},
  {tak:32, krav:[["papegøye",2,3],["neshorn",1,3]], penger:10e6},
  {tak:36, krav:[["frosk",1,4],["pingvin",2,3]], penger:50e6},
  {tak:40, krav:[[null,2,4],["hest",1,4]], penger:150e6},
  {tak:40, krav:KRAV10[K10], penger:500e6}];
const BOOST = +(process.env.BOOST ?? 0.15), KALL = +(process.env.KALL || 3);
const ODIN = ANIMALS.findIndex(a => a[1] === 'hval') * FOODS.length + FOODS.findIndex(f => f[1] === 'Burger');
const plasserFor = l => 4 + 2 * l;
const PROFILER = {
  "Ny spiller":       {tur:45,syn:4, velg:"tilfeldig",opp:.5,bytt:.4,krav:.6},
  "Vanlig barn":      {tur:25,syn:7, velg:"best",     opp:1, bytt:.9,krav:.9},
  "Effektiv spiller": {tur:14,syn:12,velg:"best",     opp:1, bytt:1, krav:1}};
function kjor(p, seed, min) {
  const r = rng(seed), tot = R.reduce((s, x) => s + x.w, 0);
  const pick = () => { let x = r() * tot; for (let i = 0; i < R.length; i++) { x -= R[i].w; if (x <= 0) return i } return 0 };
  let money = 60, level = 0, g = 0, base = [-1,-1,-1,-1], t = 0, neste = p.tur, uten = 0; const naadd = {}, logg = {}, odin = {};
  const inc = () => base.reduce((s, c) => s + (c >= 0 ? INC(c) : 0), 0);
  const ai = c => Math.floor(c / FOODS.length);
  const tell = (art, min) => base.filter(b => b >= 0 && artOk(art, b) && COMBOS[b].r >= min).length;
  function leveranse() { const n = NIVA[g + 1]; if (!n) return null; const brukt = new Set(), valgt = [];
    for (const [art, ant, min] of [...n.krav].sort((x, y) => (x[0] === null) - (y[0] === null) || y[2] - x[2])) {
      const kand = base.map((c, i) => [c, i]).filter(([c, i]) => c >= 0 && !brukt.has(i) && artOk(art, c) && COMBOS[c].r >= min).sort((a, b) => INC(a[0]) - INC(b[0]));
      if (kand.length < ant) return null; kand.slice(0, ant).forEach(([c, i]) => { brukt.add(i); valgt.push(i) }) }
    return valgt }
  const mangler = c => { const n = NIVA[g + 1]; if (!n) return false; return n.krav.some(([art, ant, min]) => artOk(art, c) && COMBOS[c].r >= min && tell(art, min) < ant) };
  // Reserverer bare så mange som kravet trenger (de svakeste som passer). ../gardsniva.js reserverte alle som passet,
  // noe som låste en full base når mange dyr er Mythic+ (som i alternativ C), og spilleren kunne ikke bytte inn Óðinn.
  const reservert = i => { const n = NIVA[g + 1]; if (!n) return false; const brukt = new Set();
    for (const [art, ant, min] of [...n.krav].sort((x, y) => (x[0] === null) - (y[0] === null) || y[2] - x[2])) {
      base.map((c, j) => [c, j]).filter(([c, j]) => c >= 0 && !brukt.has(j) && artOk(art, c) && COMBOS[c].r >= min).sort((a, b) => INC(a[0]) - INC(b[0])).slice(0, ant).forEach(([, j]) => brukt.add(j)) }
    return brukt.has(i) };
  // Krav på bestemt art som fortsatt mangler (samme som trengs() i spillkjerne.js)
  const trengs = () => { const n = NIVA[g + 1]; return n && n.krav ? n.krav.filter(([a, ant, min]) => a && tell(a, min) < ant) : [] };
  function trekk() {
    let k = pick(), pool = POOLS[k]; const n = NIVA[g + 1], m = trengs();
    let tvunget = false;
    if (GAR !== 'av' && m.length && uten >= 6) {
      const kr = m[Math.floor(r() * m.length)];
      if (GAR === 'proto') { for (let rr = Math.max(k, kr[2]); rr < POOLS.length; rr++) { const p2 = POOLS[rr].filter(ci => ai(ci) === ART(kr[0])); if (p2.length) { pool = p2; tvunget = true; break } } }
      else if (GAR === 'tak') { // løfter høyst til Legendary; over det styres bare arten når kategorien allerede er høy nok
        if (kr[2] <= 3 || k >= kr[2]) { for (let rr = Math.max(k, kr[2]); rr < POOLS.length; rr++) { const p2 = POOLS[rr].filter(ci => ai(ci) === ART(kr[0])); if (p2.length) { pool = p2; tvunget = true; break } } } }
    }
    // Óðinn-kall (forslag): når spilleren jobber mot nivå 10 og har 3 ulike Food God i gården, blir neste Food God Óðinn.
    // Synlig spillregel, uavhengig av bestillingsregnet.
    if (K10 === 'kall' && g === 8 && k === 5 && !tvunget) { const fg = new Set(base.filter(b => b >= 0 && COMBOS[b].r === 5 && b !== ODIN)); if (fg.size >= KALL) { pool = [ODIN]; tvunget = true } }
    if (!tvunget && n && r() < BOOST) { const arter = n.krav.filter(([a, , min]) => a && k >= min).map(kr => ART(kr[0])); const p2 = pool.filter(ci => arter.includes(ai(ci))); if (p2.length) pool = p2 }
    const ci = pool[Math.floor(r() * pool.length)];
    uten = m.some(([a, , min]) => ai(ci) === ART(a) && COMBOS[ci].r >= min) ? 0 : uten + 1;
    return ci }
  while (t < min * 60) {
    t += 1; money += inc();
    if (base.every(c => c < 0) && money < R[0].price) money = R[0].price;
    if (t % 600 === 0) logg[t / 60] = { g, inc: inc(), plasser: base.length, money, base: process.env.DUMP ? base.slice() : undefined };
    if (t < neste) continue; neste = t + p.tur * (0.7 + r() * 0.6);
    const lev = leveranse();
    if (lev && money >= NIVA[g + 1].penger && r() < p.krav) { money -= NIVA[g + 1].penger; lev.forEach(i => base[i] = -1); g++; naadd[g] = t; continue }
    if (plasserFor(level) < NIVA[g].tak && money >= upCost(level) && base.indexOf(-1) < 0 && r() < p.opp) { money -= upCost(level); level++ }
    while (base.length < Math.min(plasserFor(level), NIVA[g].tak)) base.push(-1);
    const syn = []; for (let i = 0; i < p.syn; i++) syn.push(trekk());
    const kan = syn.filter(c => PRICE(c) <= money); if (!kan.length) continue;
    const trg = kan.filter(mangler);
    const ci = trg.length && r() < p.krav ? trg[0] : (p.velg === "best" ? kan.sort((a, b) => INC(b) - INC(a))[0] : kan[Math.floor(r() * kan.length)]);
    const fri = base.indexOf(-1);
    if (fri < 0) { let w = -1; base.forEach((c, i) => { if (reservert(i)) return; if (w < 0 || INC(c) < INC(base[w])) w = i });
      if (w < 0) continue; if (!mangler(ci) && (INC(ci) <= INC(base[w]) || r() > p.bytt)) continue;
      money -= PRICE(ci); money += Math.floor(PRICE(base[w]) / 2); base[w] = ci }
    else { money -= PRICE(ci); base[fri] = ci }
  }
  return { naadd, logg };
}
const N = +(process.env.N || 200), q = (a, f) => { a = a.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(f * a.length))] };
const MIN = +(process.env.MIN || 960);
const res = {}; for (const [navn, p] of Object.entries(PROFILER)) { res[navn] = []; for (let s = 1; s <= N; s++) res[navn].push(kjor(p, s * 7919, MIN)) }
const ut = { FORD, GAR, K10, MIN, niva: {} };
for (let g = 1; g < NIVA.length; g++) { ut.niva[g + 1] = {};
  for (const navn in PROFILER) { const a = res[navn].map(k => k.naadd[g]).filter(x => x !== undefined);
    const alle = res[navn].map(k => k.naadd[g] === undefined ? Infinity : k.naadd[g]);
    const fmtA = x => x === Infinity ? '>' + MIN : Math.round(x / 60);
    ut.niva[g + 1][navn + ' alle'] = { median: fmtA(q(alle, .5)), p90: fmtA(q(alle, .9)) };
    ut.niva[g + 1][navn] = a.length ? { median: Math.round(q(a, .5) / 60), p90: a.length / N >= .9 ? Math.round(q(a, .9) / 60) : null, andel: Math.round(100 * a.length / N) } : { median: null, andel: 0 } } }
if (process.env.DUMP) { const d = {}; for (const navn in PROFILER) d[navn] = res[navn].map(k => ({ 30: k.logg[30], 120: k.logg[120], 480: k.logg[480] })); require('fs').writeFileSync(process.env.DUMP, JSON.stringify(d)); }
console.log(JSON.stringify(ut));
