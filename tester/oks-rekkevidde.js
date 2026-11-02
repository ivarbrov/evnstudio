// Øksas synlige rekkevidde: lengste avstand fra heltens midtpunkt (bakkeplan) til øksebladet gjennom ett slag,
// i 5.6.2 (gutten, three r128) og i 2.0 (roboten, 90 %). Logikkens rekkevidde (WEAPONS.oks.reach = 95) er lik i begge.
// Krever server på :8765. Bruk: node tester/oks-rekkevidde.js
const { chromium } = require('playwright'); const fs = require('fs');
const INIT = `(() => { let t = 1000; performance.now = () => t; Date.now = () => 1.7e12 + t; const kø = []; window.requestAnimationFrame = f => { kø.push(f); return 1; };
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; kø.splice(0).forEach(f => f(t)); } };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {} })();`;
const KROK = 'window.__R3 = () => R3; window.__g = () => g; window.__W = () => WEAPONS;\n';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ut = {};
  for (const [navn, url] of [['5.6.2 (gutten)', 'spill/morkeskogen/index.html'], ['2.0 (roboten 90 %)', 'spill/morkeskogen-2/spill/index.html']]) {
    const p = await b.newPage({ viewport: { width: 480, height: 300 } });
    await p.addInitScript(INIT);
    await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.route('**/spill/morkeskogen/index.html', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen/index.html', 'utf8').replace('<script>\n(() => {\nconst WS = 1.6', '<script>\n(() => {\n' + KROK + 'const WS = 1.6'), contentType: 'text/html; charset=utf-8' }));
    await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\n' + KROK), contentType: 'text/javascript' }));
    await p.goto('http://localhost:8765/' + url, { timeout: 200000 });
    await p.evaluate(() => { document.getElementById('startBtn').click(); __steg(10); });
    await p.waitForFunction(() => window.__R3() && __R3().player && (!window.EVN2 || __R3().player.robot), null, { timeout: 300000, polling: 500 });
    ut[navn] = await p.evaluate(() => {
      const R3 = __R3(), g = __g(), P = R3.player, øks = P.wpn.oks, v = new THREE.Vector3(); R3.renderer.render = () => {};
      __steg(30); let maks = 0, maksH = 0;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })); __steg(2); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' }));
      for (let i = 0; i < 36; i++) { __steg(1); øks.updateMatrixWorld(true); const c = øks.localToWorld(v.set(0, -4.2, 21)); maks = Math.max(maks, Math.hypot(c.x - g.p.x, c.z - g.p.y)); }
      return { øksebladMaksFraMidten: +maks.toFixed(1), logikkRekkevidde: __W().oks.reach, logikkBue: __W().oks.arc };
    });
    await p.close();
  }
  fs.writeFileSync('tester/resultater/oks-rekkevidde.json', JSON.stringify(ut, null, 1)); console.log(JSON.stringify(ut, null, 1)); await b.close();
})();
