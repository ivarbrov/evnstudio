// Kontroll: tar ulven skade av øksa, og hvor fort skader den helten? Samme oppsett i 5.6.2 og 2.0 (fast klokke, uten tegning).
// Krever server på :8765. Bruk: node tester/ulv-skade.js
const { chromium } = require('playwright'); const fs = require('fs');
const INIT = `(() => { let t = 1000; performance.now = () => t; Date.now = () => 1.7e12 + t; const kø = []; window.requestAnimationFrame = f => { kø.push(f); return 1; };
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; kø.splice(0).forEach(f => f(t)); } };
  let a = 4242; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {} })();`;
const KROK = 'window.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY });\n';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const ut = {};
  for (const [navn, url] of [['5.6.2', 'spill/morkeskogen/index.html'], ['2.0', 'spill/morkeskogen-2/spill/index.html']]) {
    const p = await b.newPage({ viewport: { width: 480, height: 300 } }); await p.addInitScript(INIT);
    await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.route('**/spill/morkeskogen/index.html', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen/index.html', 'utf8').replace('<script>\n(() => {\nconst WS = 1.6', '<script>\n(() => {\n' + KROK + 'const WS = 1.6'), contentType: 'text/html; charset=utf-8' }));
    await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\n' + KROK), contentType: 'text/javascript' }));
    await p.goto('http://localhost:8765/' + url, { timeout: 200000 });
    await p.evaluate(() => { document.getElementById('startBtn').click(); __steg(10); });
    await p.waitForFunction(() => window.__R3() && __R3().player, null, { timeout: 300000, polling: 500 });
    ut[navn] = await p.evaluate(() => {
      const R3 = __R3(), g = __g(), { FX, FY } = __F(); R3.renderer.render = () => {};
      g.p.x = FX + 300; g.p.y = FY + 300; g.time = 40; __steg(5);
      const u = g.animals.find(a => (a.kind || a.type) === 'ulv') || g.animals[0]; const art = u.kind || u.type;
      const tast = (c, ned) => window.dispatchEvent(new KeyboardEvent(ned ? 'keydown' : 'keyup', { code: c }));
      // ulven 40 enheter rett foran helten (helten ser «opp» = −y)
      u.x = g.p.x; u.y = g.p.y - 40; tast('KeyW', true); __steg(2); tast('KeyW', false);
      const hp0 = g.hp, logg = []; let slag = 0, døde = null;
      for (let i = 0; i < 20 && !u.dead && g.hp > 0; i++) {
        u.x = g.p.x; u.y = g.p.y - 40;                                  // holdes foran helten (ulven løper ellers rundt)
        tast('KeyE', true); __steg(3); tast('KeyE', false); __steg(30); slag++;
        logg.push({ slag, ulvHp: u.hp, heltHp: Math.round(g.hp) });
      }
      return { art, maksHp: u.max || null, slag, ulvDød: !!u.dead, heltHpFør: Math.round(hp0), heltHpEtter: Math.round(g.hp), logg: logg.slice(0, 8) };
    });
    await p.close();
  }
  fs.writeFileSync('tester/resultater/ulv-skade.json', JSON.stringify(ut, null, 1)); console.log(JSON.stringify(ut, null, 1)); await b.close();
})();
