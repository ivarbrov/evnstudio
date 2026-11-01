// Kjører den innebygde ytelsestesten og kontrollerer at resultatkortet kommer (FPS i testnettleseren er ikke meningsfull).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 400 }, reducedMotion: 'reduce' });
  const feil = []; p.on('pageerror', e => feil.push(e.message)); p.on('console', m => { if (m.type() === 'error') feil.push(m.text()); });
  await p.goto('http://localhost:8765/spill/morkeskogen-2/prototype/index.html#lav');
  await p.waitForFunction(() => window.__proto?.klar(), null, { timeout: 120000 });
  await p.evaluate(() => document.getElementById('bTest').click());
  await p.waitForFunction(() => !document.getElementById('testkort').hidden, null, { timeout: 300000 });
  const r = await p.evaluate(() => JSON.parse(document.getElementById('testTekst').value));
  console.log(JSON.stringify({ scener: r.resultater.map(x => [x.scene, x.bilder, x.tegnekall]), stil: r.stil, kvalitet: r.kvalitet, gpu: r.enhet.gpu, feil }, null, 1));
  await b.close();
})();
