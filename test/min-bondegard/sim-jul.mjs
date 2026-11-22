// Min Bondegård – hvor lang tid tar 250 julegaver i Vinter i Elvedal? Kjører på de ekte spillreglene (logikk.js + data.js).
// Kjør: node test/min-bondegard/sim-jul.mjs
// Spilleren er på nivå 5, har bakeriet, begge eventmaskinene og alle åkrene sine fulle av hvete. Hun pakker inn brød.
// Mens hun spiller, holder hun alle køene fulle og legger gavene under treet. Mellom øktene går køene ferdig av seg selv.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../../spill/min-bondegard/logikk.js'), D = L.D;
const S = 1000, MIN = 60 * S, DAG = 24 * 60 * MIN;

function kjor(okter, minutter, nivaa = 5) {
  L.settManed(12); L.settGratis(false);
  let naa = Date.UTC(2026, 11, 1, 8); const s = L.ny(naa);
  while (s.nivaa < nivaa) L.giXP(s, 5, naa);
  L.arrStart(s, 'jul'); s.bygg.bakeri.eid = true; s.bygg.gavepapirmaskin.eid = true; s.bygg.gavemaskin.eid = true;
  s.mynter = 10000;
  const tider = {};
  const steg = () => {
    s.akre.forEach((f, i) => { if (f.avling && naa >= f.slutt) L.host(s, i, naa); if (!f.avling) L.plant(s, i, 'hvete', naa); });
    ['gavepapirmaskin', 'bakeri', 'gavemaskin'].forEach(b => L.hentProdukter(s, b, naa));
    while ((s.lager.gavepapir || 0) < 4 && L.produser(s, 'gavepapirmaskin', 'gavepapir', naa).ok);   // hun lager ikke mer papir enn hun trenger
    while ((s.lager.brod || 0) < 3 && L.produser(s, 'bakeri', 'brod', naa).ok);
    while (L.produser(s, 'gavemaskin', 'julegave', naa, s.lager.brod ? 'brod' : undefined).ok);
    if (s.lager.julegave) L.arrLever(s, 'jul', 12, naa);
    for (const n of [10, 40, 100, 250]) if (!tider[n] && s.arr.jul.levert >= n) tider[n] = naa;
  };
  const start = naa;
  for (let dag = 0; dag < 31 && !tider[250]; dag++) {
    for (let o = 0; o < okter; o++) {
      naa = start + dag * DAG + o * (12 * 60 * MIN / Math.max(1, okter));
      const slutt = naa + minutter * MIN;
      for (; naa < slutt; naa += 10 * S) steg();
    }
  }
  L.settManed(null);
  const dager = n => tider[n] ? Math.ceil((tider[n] - start) / DAG + 1 / 24) : null;
  return { levert: s.arr.jul.levert, d10: dager(10), d40: dager(40), d100: dager(100), d250: dager(250), spilt: okter * minutter };
}

console.log('Vinter i Elvedal: dager i desember til hvert trinn (nivå 5, pakker inn brød)');
console.log('Spilletid per dag        | 10 | 40 | 100 | 250 | gaver da hun stoppet');
for (const [o, m] of [[1, 10], [2, 10], [1, 30], [2, 20], [3, 20]]) {
  const r = kjor(o, m), f = x => x === null ? ' –' : String(x).padStart(2);
  console.log(`${o} økt${o > 1 ? 'er' : '  '} à ${String(m).padStart(2)} min (${String(r.spilt).padStart(2)} min) | ${f(r.d10)} | ${f(r.d40)} | ${String(r.d100 === null ? '–' : r.d100).padStart(3)} | ${String(r.d250 === null ? '–' : r.d250).padStart(3)} | ${r.levert}`);
}
