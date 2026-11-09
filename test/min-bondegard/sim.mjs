// Min Bondegård – simulering på de ekte spillreglene (logikk.js + data.js).
// Dekker det som er spillbart i versjonen (uten bestillinger). Kjør: node test/min-bondegard/sim.mjs [antall=100]
// Måler tid til nivå 2–4, fastlåsing og lengste periode uten noe nyttig å gjøre.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../../spill/min-bondegard/logikk.js'), D = L.D;
const N = +(process.argv[2] || 100), S = 1000;

function kjor(profil, frø) {
  let rnd = frø; const r = () => ((rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648);
  const steg = profil === 'aktiv' ? 5 : 20, støy = profil === 'aktiv' ? 0 : 0.3;
  let naa = 1e12; const t0 = naa; const s = L.ny(naa); const nivaaTid = {1: 0}; let ledig = 0, maksLedig = 0, fast = false;
  const notér = nye => nye.forEach(n => nivaaTid[n.nivaa] = (naa - t0) / 60000);
  while (s.nivaa < 4 && naa - t0 < 3 * 3600 * S) {
    let gjort = false; const g = x => { if (x && x.ok) { gjort = true; if (x.nye) notér(x.nye); } };
    s.akre.forEach((f, i) => g(L.host(s, i, naa)));
    g(L.samleDyr(s, 'hone', naa));
    for (const b in s.bygg) g(L.hentProdukter(s, b, naa));
    g(L.mat(s, 'hone', naa));
    if (s.bygg.bakeri && !s.bygg.bakeri.eid && s.mynter >= D.bygg.bakeri.pris) g(L.kjopBygg(s, 'bakeri'));
    if ((s.lager.honsefor || 0) < 4) g(L.produser(s, 'forkvern', 'honsefor', naa));
    if (s.bygg.bakeri && s.bygg.bakeri.eid && (s.lager.hvete || 0) >= 5) g(L.produser(s, 'bakeri', 'brod', naa));
    s.akre.forEach((f, i) => { if (!f.avling) { const valg = s.nivaa >= 2 && (r() < 0.3 + støy) ? 'mais' : 'hvete'; g(L.plant(s, i, valg, naa)); } });
    // selg overskudd når lageret nærmer seg fullt, og alltid litt mais, egg og brød (det er pengene før bestillingene kommer)
    for (const v of ['mais', 'egg', 'brod']) if ((s.lager[v] || 0) > 2) g(L.selg(s, v, s.lager[v] - 2));
    if (L.plass(s, 'silo') < 6) g(L.selg(s, 'hvete', 6));
    if (gjort) ledig = 0; else { ledig += steg; maksLedig = Math.max(maksLedig, ledig); if (ledig > 900) { fast = true; break; } }
    naa += steg * S;
  }
  return { nivaaTid, maksLedig, fast };
}
for (const profil of ['aktiv', 'barn']) {
  const res = Array.from({length: N}, (_, i) => kjor(profil, i + 1));
  const med = a => { a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const ut = [2, 3, 4].map(n => { const ts = res.map(x => x.nivaaTid[n]).filter(x => x !== undefined); return `nivå ${n}: ${ts.length ? med(ts).toFixed(1) : '–'} min (${ts.length}/${N})`; });
  console.log(`${profil}: ${ut.join(' · ')} · fastlåst ${res.filter(x => x.fast).length} · lengste venting ${Math.max(...res.map(x => x.maksLedig))} s`);
}
