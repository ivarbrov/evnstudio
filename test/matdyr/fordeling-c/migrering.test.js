// Migreringstester for alternativ C (bestefarsregel). Kjøres: node --test migrering.test.js
// Tester et FORSLAG (migrering.js). Ingenting her er koblet til spillet.
const test = require('node:test'); const assert = require('node:assert/strict');
const D = require('../data.js'); const { NY, id } = require('./stige.js');
const M = require('./migrering.js');
const { R, COMBOS, FOODS, ANIMALS } = D;
const GML = COMBOS.map(c => c.r);
const art = ci => ANIMALS[Math.floor(ci / FOODS.length)][1];
const inc = (ci, r) => Math.round(R[r].inc * (r >= 5 ? 1 : COMBOS[ci].m));
const pris = (ci, r) => Math.round(R[r].price * (r >= 5 ? 1 : COMBOS[ci].m));
const OPP = [...Array(1000).keys()].filter(i => NY[i] > GML[i]);
const NED = [...Array(1000).keys()].filter(i => NY[i] < GML[i]);
const LIK = [...Array(1000).keys()].filter(i => NY[i] === GML[i]);
const prod = (base, extra = {}) => ({ v: 1, money: 123456, level: 7, base, disc: [...new Set(base.filter(c => c >= 0))], name: 'Evens gård', carry: -1, cb: 2, intro: 6, ...extra });
const proto = (base, extra = {}) => ({ v: 1, penger: 987654, gard: { niva: 6 }, plassNiva: 9, base, disc: [...new Set(base.filter(c => c >= 0))], bestilling: 15, ...extra });
const effInc = s => s.base.reduce((sum, ci, i) => sum + (ci >= 0 ? inc(ci, M.effR(s, i, NY)) : 0), 0);
const gmlInc = s => s.base.reduce((sum, ci) => sum + (ci >= 0 ? inc(ci, GML[ci]) : 0), 0);

test('datagrunnlag: 1000 ID-er, stige per art, Óðinn og Loki uendret', () => {
  assert.equal(NY.length, 1000);
  assert.equal(NY[id('hval', 'Burger')], 5); assert.equal(NY[id('dinosaur', 'Sjoko')], 6);
  assert.equal(NED.length, 2, 'bare to ID-er går ned i kategori');
});

for (const [navn, lag] of [['produksjon', prod], ['prototype', proto]]) {
  test(`${navn}: ingen eksisterende felt endres, v forblir 1`, () => {
    const s = lag([OPP[0], NED[0], LIK[0], -1, OPP[5]]); const før = JSON.parse(JSON.stringify(s));
    const { lagring: m, endret, feil } = M.migrer(s, GML, NY, 'beste');
    assert.equal(feil, null); assert.equal(endret, true); assert.equal(m.v, 1); assert.equal(m.fordeling, 'c');
    for (const k of Object.keys(før)) assert.deepEqual(m[k], før[k], 'feltet ' + k);
    assert.deepEqual(s, før, 'inndata er ikke endret');
  });
  test(`${navn}: migrering to ganger gir samme resultat`, () => {
    const a = M.migrer(lag([NED[0], OPP[1]]), GML, NY, 'streng').lagring, b = M.migrer(a, GML, NY, 'streng');
    assert.equal(b.endret, false); assert.deepEqual(b.lagring, a);
  });
}

test('streng: hvert eide dyr beholder nøyaktig gammel kategori, pris og inntekt (alle 1000 ID-er)', () => {
  for (let ci = 0; ci < 1000; ci++) {
    const s = M.migrer(prod([ci]), GML, NY, 'streng').lagring;
    assert.equal(M.effR(s, 0, NY), GML[ci], 'ID ' + ci);
    assert.equal(inc(ci, M.effR(s, 0, NY)), inc(ci, GML[ci])); assert.equal(pris(ci, M.effR(s, 0, NY)), pris(ci, GML[ci]));
  }
});
test('beste: intet eid dyr går ned i kategori, pris eller inntekt (alle 1000 ID-er)', () => {
  for (let ci = 0; ci < 1000; ci++) {
    const s = M.migrer(prod([ci]), GML, NY, 'beste').lagring, r = M.effR(s, 0, NY);
    assert.equal(r, Math.max(GML[ci], NY[ci]), 'ID ' + ci);
    assert.ok(inc(ci, r) >= inc(ci, GML[ci])); assert.ok(pris(ci, r) >= pris(ci, GML[ci]));
  }
});
test('beste: arv lagres bare for de to ID-ene som ellers ville gått ned', () => {
  const s = M.migrer(prod([...NED, ...OPP.slice(0, 30), ...LIK.slice(0, 8)]), GML, NY, 'beste').lagring;
  assert.deepEqual(Object.keys(s.arv), ['0', '1']);
});
test('dyret roboten bærer (carry) får også arv', () => {
  const s = M.migrer(prod([-1], { carry: NED[0], cb: 1 }), GML, NY, 'beste').lagring;
  assert.equal(M.effR(s, 'bar', NY), GML[NED[0]]);
  const t = M.migrer(prod([-1], { carry: OPP[0], cb: 1 }), GML, NY, 'streng').lagring;
  assert.equal(M.effR(t, 'bar', NY), GML[OPP[0]]);
});
test('samme ID to ganger: arvet eksemplar og nytt eksemplar lever side om side', () => {
  const ci = OPP[0];
  const s = M.migrer(prod([ci, -1]), GML, NY, 'streng').lagring;
  s.base[1] = ci; M.fjern(s, 1);                       // spilleren kjøper samme figur etter migreringen
  assert.equal(M.effR(s, 0, NY), GML[ci]); assert.equal(M.effR(s, 1, NY), NY[ci]);
  const bok = M.bokVisning(s, ci, NY);
  assert.equal(bok.kategori, NY[ci]); assert.deepEqual(bok.arvet, [GML[ci]]); assert.equal(bok.funnet, true);
});
test('flytting, salg og bytte: arven følger dyret og forsvinner når dyret går ut', () => {
  const s = M.migrer(prod([NED[0], -1, -1]), GML, NY, 'beste').lagring;
  s.base[2] = s.base[0]; s.base[0] = -1; M.flytt(s, 0, 2);
  assert.equal(M.effR(s, 2, NY), GML[NED[0]]); assert.equal(s.arv[0], undefined);
  const salg = Math.floor(pris(s.base[2], M.effR(s, 2, NY)) / 2);
  assert.equal(salg, Math.floor(pris(NED[0], GML[NED[0]]) / 2), 'salgsverdi følger arvet kategori');
  s.base[2] = OPP[3]; M.fjern(s, 2);                   // byttet ut med et nytt dyr
  assert.equal(M.effR(s, 2, NY), NY[OPP[3]]); assert.deepEqual(s.arv, {});
});
test('Gårdsnivå: krav kontrolleres med effektiv kategori', () => {
  const hval = [...Array(25).keys()].map(f => id('hval', FOODS[f][1])).find(ci => GML[ci] < 4 && NY[ci] >= 4);
  assert.ok(hval !== undefined, 'fant hval som blir Mythic');
  const kr = ['hval', 1, 4];
  const streng = M.migrer(proto([hval]), GML, NY, 'streng').lagring, beste = M.migrer(proto([hval]), GML, NY, 'beste').lagring;
  assert.equal(M.passerKrav(streng, 0, kr, NY, art), false, 'streng: gammel kategori teller');
  assert.equal(M.passerKrav(beste, 0, kr, NY, art), true, 'beste: ny kategori teller');
  assert.equal(beste.gard.niva, 6, 'oppnådd gårdsnivå beholdes');
});
test('Matdyrboka: funne figurer forblir funnet, og boka viser alltid ny kategori', () => {
  const disc = [...Array(1000).keys()].filter(i => i % 3 === 0);
  const s = M.migrer(proto([OPP[0]], { disc }), GML, NY, 'streng').lagring;
  assert.deepEqual(s.disc, disc);
  for (const ci of disc.slice(0, 50)) assert.equal(M.bokVisning(s, ci, NY).kategori, NY[ci]);
});
test('penger og pengeverdi er uendret i begge modi', () => {
  for (const modus of ['streng', 'beste']) { const s = M.migrer(prod(OPP.slice(0, 20)), GML, NY, modus).lagring; assert.equal(s.money, 123456); }
});
test('ugyldig lagring gir feil og ingen ny lagring (skal ikke overskrive)', () => {
  for (const x of [null, 'tull', [], 42, { v: 2 }, { base: [1] }]) { const r = M.migrer(x, GML, NY); assert.equal(r.lagring, null); assert.ok(r.feil); }
});
test('ødelagt arv i en allerede migrert lagring ryddes uten å kaste', () => {
  const s = { ...prod([NED[0], -1, 5000, 'x']), fordeling: 'c', arv: { 0: 3, 1: 4, 2: 9, 3: 2, bar: 1, foo: 2, 7: -1 } };
  const r = M.migrer(s, GML, NY); assert.equal(r.feil, null);
  assert.deepEqual(r.lagring.arv, { 0: 3 });
});
test('tilbakerulling: gammel innlesing (spill/matdyr load) godtar migrert lagring', () => {
  const s = M.migrer(prod([NED[0], OPP[0], -1]), GML, NY, 'streng').lagring;
  // Samme sjekker som load() i spill/matdyr/index.html
  assert.equal(s.v, 1); assert.ok(Number.isFinite(s.money)); assert.ok(Number.isInteger(s.level));
  assert.ok(s.base.every(v => Number.isInteger(v) && v >= -1 && v < 1000)); assert.ok(Array.isArray(s.disc));
});
test('økonomi ved migrering av typiske lagringer: streng = uendret, beste = aldri lavere', () => {
  const rng = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)(7);
  for (let k = 0; k < 200; k++) {
    const base = [...Array(4 + Math.floor(rng() * 37))].map(() => rng() < .1 ? -1 : Math.floor(rng() * 1000));
    const st = M.migrer(prod(base), GML, NY, 'streng').lagring, be = M.migrer(prod(base), GML, NY, 'beste').lagring;
    assert.equal(effInc(st), gmlInc(st)); assert.ok(effInc(be) >= gmlInc(be));
  }
});

test('Matdyrboka: toppfigur funnet før overgangen får gullramme med en gang (ingen ny jakt)', () => {
  const ci = NY.findIndex((r, i) => r === 5 && GML[i] < 5);
  const s = M.migrer(proto([-1], { disc: [ci] }), GML, NY, 'streng').lagring;
  const b = M.bokVisning(s, ci, NY); assert.equal(b.funnet, true); assert.equal(b.gullramme, true);
});
test('Matdyrboka: eid eldre utgave av en toppfigur vises med arvet kategori, men boka viser ny', () => {
  const ci = NY.findIndex((r, i) => r === 5 && GML[i] < 5);
  const s = M.migrer(proto([ci], { disc: [ci] }), GML, NY, 'streng').lagring;
  const b = M.bokVisning(s, ci, NY); assert.equal(b.kategori, 5); assert.deepEqual(b.arvet, [GML[ci]]); assert.equal(b.gullramme, true);
});
