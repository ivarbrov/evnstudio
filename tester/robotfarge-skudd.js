// Bilder av testvisningen for robotens gulfarge (A, B, C) i dag- og nattlys. Krever server på :8765.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const UT = process.argv[2] || 'tester/resultater/robotfarge'; fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 960, height: 420 } }); const feil = [];
  p.on('pageerror', e => feil.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') feil.push(m.text()); });
  await p.goto('http://localhost:8765/spill/morkeskogen-2/testvisning/robotfarge.html', { timeout: 200000 });
  await p.waitForFunction(() => window.__klar, null, { timeout: 120000, polling: 500 });
  for (const m of ['dag', 'natt']) {
    await p.evaluate(m => window.__visModus(m), m); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${UT}/robotfarge-${m}.png`, timeout: 120000 });
  }
  console.log('konsoll:', JSON.stringify(feil)); await b.close();
})();
