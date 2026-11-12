// Min Bondegård – simulering på de ekte spillreglene (logikk.js + data.js).
// Dekker det som er spillbart i versjonen: nivå 1–5 med bestillinger og erter (0.9.0). Kjør: node test/min-bondegard/sim.mjs [antall=100] [målnivå=6]
// Måler tid til hvert nivå, fastlåsing, lengste periode uten noe nyttig å gjøre og hvor lenge en bestilling blir stående.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../../spill/min-bondegard/logikk.js'), D = L.D;
const N = +(process.argv[2] || 100), MAAL = +(process.argv[3] || 6), S = 1000;

// råvarer (avlinger) som trengs for å lage n av en vare, lagt i «behov»
function trenger(v, n, behov) {
  if (D.avlinger[v]) { behov[v] = (behov[v] || 0) + n; return; }
  for (const d in D.dyr) if (D.dyr[d].produkt === v) { trenger(D.dyr[d].spiser, n, behov); return; }
  const o = D.oppskrifter[v]; if (!o) return; const ganger = Math.ceil(n / o.ut);
  for (const k in o.inn) trenger(k, o.inn[k] * ganger, behov);
}
function kjor(profil, frø) {
  let rnd = frø; const r = () => ((rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648);
  const steg = profil === 'aktiv' ? 5 : 20, støy = profil === 'aktiv' ? 0 : 0.3;
  let naa = 1e12 + frø * 977; const t0 = naa; const s = L.ny(naa); const nivaaTid = {1: 0}; let ledig = 0, maksLedig = 0, fast = false, lengstBest = 0, levert = 0, byttet = 0;
  const notér = nye => nye.forEach(n => nivaaTid[n.nivaa] = (naa - t0) / 60000);
  while (s.nivaa < MAAL && naa - t0 < 4 * 3600 * S) {
    let gjort = false; const g = x => { if (x && x.ok) { gjort = true; if (x.nye) notér(x.nye); } return x; };
    s.akre.forEach((f, i) => g(L.host(s, i, naa)));
    g(L.samleDyr(s, 'hone', naa)); g(L.samleDyr(s, 'ku', naa));
    for (const b in s.bygg) g(L.hentProdukter(s, b, naa));
    // bestillinger: lever det som kan leveres, bytt det som har stått lenge
    for (let i = 0; i < s.best.liste.length; i++) { const o = s.best.liste[i], alder = naa - o.siden;
      if (L.kanLevere(s, i)) { lengstBest = Math.max(lengstBest, alder / S); g(L.lever(s, i, naa)); levert++; }
      else if (L.boerByttes(s, i, naa) || (alder > 300 * S && r() < 0.1)) { g(L.byttBestilling(s, i, naa)); byttet++; } }
    // hva bestillingene trenger av varer og råvarer
    const vil = {}, raa = {}; s.best.liste.forEach(o => { for (const v in o.varer) { vil[v] = (vil[v] || 0) + o.varer[v]; trenger(v, o.varer[v], raa); } });
    g(L.mat(s, 'hone', naa)); g(L.mat(s, 'ku', naa));
    // 0.9.8: Enga, fjøs og meieri kjøpes så snart det er råd, kufôr lages når kyrne trenger det, meieriet lager det bestillingene vil ha
    if (s.nivaa >= 5 && !s.omrader.enga && s.mynter >= 300 + (s.nivaa >= 6 ? 0 : 100)) g(L.kjopOmrade(s, 'enga'));
    for (const b of ['fjos', 'meieri']) if (s.omrader.enga && s.bygg[b] && !s.bygg[b].eid && s.mynter >= D.bygg[b].pris) g(L.kjopBygg(s, b));
    if (s.dyr.ku && (s.lager.kufor || 0) < 2) g(L.produser(s, 'forkvern', 'kufor', naa));
    if (s.bygg.meieri && s.bygg.meieri.eid) for (const v of ['smor', 'flote']) if ((vil[v] || 0) > (s.lager[v] || 0)) g(L.produser(s, 'meieri', v, naa));
    if (s.bygg.bakeri && !s.bygg.bakeri.eid && s.mynter >= D.bygg.bakeri.pris) g(L.kjopBygg(s, 'bakeri'));
    if ((s.lager.honsefor || 0) < 4) g(L.produser(s, 'forkvern', 'honsefor', naa));
    const brodMaal = Math.max(vil.brod || 0, s.nivaa < 4 ? 1 : 0), brodIKo = s.bygg.bakeri ? s.bygg.bakeri.ko.filter(j => j.vare === 'brod').length : 0;
    if (s.bygg.bakeri && s.bygg.bakeri.eid && (s.lager.brod || 0) + brodIKo < brodMaal + (s.nivaa < 4 ? 1 : 0) && (s.lager.hvete || 0) >= 5) g(L.produser(s, 'bakeri', 'brod', naa));
    // plant det bestillingene mangler mest av; ellers en blanding
    s.akre.forEach((f, i) => { if (f.avling) return;
      const mangel = a => (raa[a] || 0) + (a === 'hvete' ? 6 : 0) - (s.lager[a] || 0) - 2 * s.akre.filter(x => x.avling === a).length;
      let valg = I.filter(a => D.avlinger[a].nivaa <= s.nivaa && L.kanPlante(s, i, a) === null).sort((a, b) => mangel(b) - mangel(a))[0];
      if (r() < støy || mangel(valg) <= 0) valg = s.nivaa >= 5 && L.kanPlante(s, i, 'erter') === null && r() < 0.3 ? 'erter' : s.nivaa >= 2 && r() < 0.4 ? 'mais' : 'hvete';
      g(L.plant(s, i, valg, naa)); });
    // selg overskudd som bestillingene ikke trenger
    for (const v of ['mais', 'egg', 'brod', 'erter', 'hvete', 'melk']) { const behold = (vil[v] || 0) + (raa[v] || 0) + (v === 'hvete' ? 8 : v === 'erter' ? 3 : 2); if ((s.lager[v] || 0) > behold + (s.nivaa >= 4 ? 4 : 0)) g(L.selg(s, v, s.lager[v] - behold)); }
    if (L.plass(s, 'silo') < 6) g(L.selg(s, 'hvete', 6));
    if (L.plass(s, 'lave') < 4 && (s.lager.egg || 0) > 2) g(L.selg(s, 'egg', 3));
    if (gjort) ledig = 0; else { ledig += steg; maksLedig = Math.max(maksLedig, ledig); if (ledig > 900) { fast = true; break; } }
    naa += steg * S;
  }
  return { nivaaTid, maksLedig, fast, lengstBest, levert, byttet };
}
const I = ['hvete', 'mais', 'erter'];   // avlingene som finnes i spillet
const med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : NaN; };
for (const profil of ['aktiv', 'barn']) {
  const res = Array.from({length: N}, (_, i) => kjor(profil, i + 1));
  const ut = []; for (let n = 2; n <= MAAL; n++) { const ts = res.map(x => x.nivaaTid[n]).filter(x => x !== undefined); ut.push(`nivå ${n}: ${ts.length ? med(ts).toFixed(1) : '–'} min (${ts.length}/${N})`); }
  console.log(`${profil}: ${ut.join(' · ')} · fastlåst ${res.filter(x => x.fast).length} · lengste venting ${Math.max(...res.map(x => x.maksLedig))} s · bestillinger levert (median) ${med(res.map(x => x.levert))}, byttet ${med(res.map(x => x.byttet))}, lengste ventetid på en levert bestilling ${Math.round(Math.max(...res.map(x => x.lengstBest)))} s`);
}
