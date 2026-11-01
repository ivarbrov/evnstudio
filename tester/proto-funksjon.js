// Funksjonstest av grafikkprototypen: styring, hopp, kamera, hugging, monster, stilbytte, lagring og konsollfeil.
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:8765/spill/morkeskogen-2/prototype/index.html?kvalitet=lav';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 800, height: 500 }, reducedMotion: 'reduce' });
  const feil = []; p.on('pageerror', e => feil.push(e.message)); p.on('console', m => { if (m.type() === 'error') feil.push(m.text()); });
  const r = {}; const ok = (n, v) => { r[n] = v ? 'OK' : 'FEIL'; };
  await p.goto(URL); await p.waitForFunction(() => window.__proto?.klar(), null, { timeout: 120000 });
  ok('startknapp synlig', await p.isVisible('#startBtn'));
  await p.evaluate(() => document.getElementById('startBtn').click());
  ok('startkort lukkes', await p.isHidden('#startkort'));
  const x0 = await p.evaluate(() => [__proto.helt.x, __proto.helt.z]);
  await p.keyboard.down('KeyW'); await p.waitForTimeout(2500); await p.keyboard.up('KeyW');
  const x1 = await p.evaluate(() => [__proto.helt.x, __proto.helt.z]);
  ok('W flytter helten bort fra kameraet', x1[1] < x0[1] - 5);
  await p.keyboard.down('Space'); await p.waitForTimeout(300); const luft = await p.evaluate(() => __proto.helt.iLufta || __proto.helt.h > 1); await p.keyboard.up('Space');
  ok('mellomrom = hopp', luft);
  await p.keyboard.press('KeyC'); ok('C bytter kamera', await p.evaluate(() => __proto.K.modus === 'far'));
  await p.keyboard.press('KeyC'); ok('C tilbake', await p.evaluate(() => __proto.K.modus === 'near'));
  // Hugg et tre: still helten inntil nærmeste tre og slå 6 ganger
  const tre = await p.evaluate(() => { const v = __proto.verden.traer.filter(t => t.levende).sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z))[0]; __proto.plasser(v.x, v.z + 45, 0, 'near'); __proto.helt.retning = Math.PI; return v.id; });
  await p.evaluate(() => { for (let i = 0; i < 5; i++) { __proto.helt.retning = Math.PI; __proto.simuler(0.05, { slag: true }); __proto.simuler(0.55); } });
  ok('treet står etter 5 hugg', await p.evaluate(id => __proto.verden.traer[id].levende, tre));
  await p.evaluate(() => { __proto.helt.retning = Math.PI; __proto.simuler(0.05, { slag: true }); __proto.simuler(0.55); });
  ok('treet felles etter 6 hugg (hp 6, øks 1)', await p.evaluate(id => !__proto.verden.traer[id].levende, tre));
  // Monster om natta: forsvinner etter to slag
  await p.evaluate(() => { __proto.settTid('natt'); __proto.plasser(500, 500, 0, 'near'); });
  const mon = await p.evaluate(() => { const m = __proto.monster(500, 430); m.synlig = 1; window.__m = m; __proto.helt.retning = Math.PI; __proto.simuler(0.05, { slag: true }); __proto.simuler(0.55); const etter1 = !m.borte && m.hp === 1; m.x = 500; m.z = 430; m.vx = m.vz = 0; __proto.helt.retning = Math.PI; __proto.simuler(0.05, { slag: true }); __proto.simuler(0.55); return [etter1, m.borte]; });
  ok('monster tåler ett slag', mon[0]); ok('monster forsvinner etter to slag', mon[1]);
  // Stilbytte beholder felt tre og heltens posisjon
  const før = await p.evaluate(() => [__proto.helt.x, __proto.helt.z]);
  await p.evaluate(() => __proto.settStil(2)); await p.waitForFunction(() => __proto.klar(), null, { timeout: 120000 });
  const etter = await p.evaluate(() => [__proto.helt.x, __proto.helt.z]);
  ok('stilbytte beholder posisjon', Math.hypot(før[0] - etter[0], før[1] - etter[1]) < 30);
  ok('stilbytte beholder felt tre', await p.evaluate(id => !__proto.verden.traer[id].levende, tre));
  ok('ingen lagring i mork3d.* eller annet localStorage', await p.evaluate(() => localStorage.length === 0));
  ok('ingen konsollfeil', feil.length === 0);
  console.log(JSON.stringify({ resultat: r, feil }, null, 1));
  await b.close();
})();
