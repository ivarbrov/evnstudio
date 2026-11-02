// Gressforsøket A/B (prototypen): bilder fra samme tette gress når roboten står, går, løper og like etter at den har stoppet.
// Samme sted, kamera, tid, kvalitet og bevegelse for A og B. Krever server på :8765.
// Bruk: node tester/gress-ab.js [kvalitet=middels] [utmappe]
const { chromium } = require('playwright'); const fs = require('fs');
const [kval = 'middels', ut = 'tester/resultater/gress-ab'] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(ut, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 800, height: 450 } }); const feil = [];
  p.on('pageerror', e => feil.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') feil.push(m.text()); });
  await p.goto(`http://localhost:8765/spill/morkeskogen-2/prototype/index.html?kvalitet=${kval}&maal=1`, { timeout: 200000 });
  await p.waitForFunction(() => window.__proto && window.__proto.klar(), null, { timeout: 200000, polling: 500 });
  await p.evaluate(() => window.__proto.start());
  const vent = n => p.waitForFunction(m => window.__proto.bilder >= m, null, { timeout: 300000, polling: 200 }).then(() => 0);
  const bilder = async n => { const s = await p.evaluate(() => window.__proto.bilder); await p.waitForFunction(m => window.__proto.bilder >= m, s + n, { timeout: 300000, polling: 200 }); };
  const res = {};
  for (const g of ['A', 'B']) {
    for (const [navn, modus, yaw] of [['bak', 'near', 0]]) {
      await p.evaluate(([g, modus, yaw]) => { window.__proto.settGress(g); window.__proto.settTid('dag'); window.__proto.plasser(-120, 380, yaw, modus); window.__proto.inp = null; }, [g, modus, yaw]);
      await bilder(20);
      await p.screenshot({ path: `${ut}/${g}-${navn}-1-staar.png`, timeout: 180000 });
      await p.evaluate(() => { window.__proto.inp = { dx: 1, dy: 0, mengde: 1 }; }); await bilder(30);           // løper ca. 1,5 s sidelengs gjennom gresset
      await p.screenshot({ path: `${ut}/${g}-${navn}-2-loper.png`, timeout: 180000 });
      await p.evaluate(() => { window.__proto.inp = null; }); await bilder(6);                                          // har nettopp stoppet (ca. 0,3 s)
      await p.screenshot({ path: `${ut}/${g}-${navn}-3-stoppet.png`, timeout: 180000 });
      await bilder(20);                                                                                                // ca. 1 s senere (testmiljøet tegner ca. 20 bilder/s, dt maks 0,05 s)
      await p.screenshot({ path: `${ut}/${g}-${navn}-4-etterpaa.png`, timeout: 180000 });
    }
    res[g] = await p.evaluate(() => window.__maal);
  }
  fs.writeFileSync(`${ut}/maal.json`, JSON.stringify({ kval, res, feil }, null, 1));
  console.log(JSON.stringify({ kval, tegnekall: { A: res.A && res.A.tegnekall, B: res.B && res.B.tegnekall }, feil: feil.slice(0, 5) }));
  await b.close();
})();
