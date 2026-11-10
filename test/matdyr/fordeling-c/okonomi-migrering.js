// Inntekt før og etter migrering for simulerte lagringer (dagens fordeling, 30/120/480 min). SIMULERING.
const D = require('../data.js'); const { NY } = require('./stige.js'); const M = require('./migrering.js');
const GML = D.COMBOS.map(c => c.r); const inc = (ci, r) => Math.round(D.R[r].inc * (r >= 5 ? 1 : D.COMBOS[ci].m));
const L = JSON.parse(require('fs').readFileSync('lagringer.json'));
const q = (a, f) => { a = a.slice().sort((x, y) => x - y); return a[Math.floor(f * (a.length - 1))] };
for (const navn in L) for (const t of [30, 120, 480]) {
  const f = L[navn].map(k => { const s = { v: 1, money: 0, level: 0, base: k[t].base, disc: [] };
    const fo = s.base.reduce((x, ci) => x + (ci >= 0 ? inc(ci, GML[ci]) : 0), 0);
    const b = M.migrer(s, GML, NY, 'beste').lagring; const e = b.base.reduce((x, ci, i) => x + (ci >= 0 ? inc(ci, M.effR(b, i, NY)) : 0), 0);
    return e / Math.max(1, fo) });
  console.log(navn.padEnd(17), String(t).padStart(3) + ' min', 'beste/før: median ×' + q(f, .5).toFixed(2), 'p90 ×' + q(f, .9).toFixed(2), 'maks ×' + Math.max(...f).toFixed(2));
}
