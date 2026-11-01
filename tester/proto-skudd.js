// Skjermbilder og målinger av grafikkprototypen. Bruk: node tester/proto-skudd.js [stil] [kvalitet] [bredde] [høyde] [utmappe]
const { chromium } = require('playwright');
const [stil = '1', kval = 'hoy', W = '1280', Hh = '720', ut = '/tmp/proto'] = process.argv.slice(2);
(async () => {
  require('fs').mkdirSync(ut, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +Hh }, reducedMotion: 'reduce' });
  const feil = []; p.on('pageerror', e => feil.push('SIDE: ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') feil.push(m.type() + ': ' + m.text()); });
  await p.goto(`http://localhost:8765/spill/morkeskogen-2/prototype/index.html?stil=${stil}&kvalitet=${kval}&maal=1`);
  await p.waitForFunction(() => window.__proto && window.__proto.klar(), null, { timeout: 120000 });
  await p.evaluate(() => window.__proto.start());
  const POS = { A: [70, 40, 0, 'near'], B: [-120, 380, 2.6, 'near'], C: [70, 40, 0.8, 'far'] };
  const res = {};
  for (const tid of (process.env.TIDER || 'dag,kveld,natt').split(',')) for (const k of (process.env.POS || 'A,B,C').split(',')) {
    await p.evaluate(([pos, tid]) => { window.__proto.plasser(...pos); window.__proto.settTid(tid); if (tid === 'natt') { window.__proto.monster(pos[0] + 120, pos[1] - 160); } }, [POS[k], tid]);
    await p.waitForTimeout(+(process.env.VENT || 6000));
    await p.screenshot({ path: `${ut}/stil${stil}-${kval}-${tid}-${k}.png`, timeout: 180000 });
    res[tid + k] = await p.evaluate(() => window.__maal);
  }
  console.log(JSON.stringify({ stil, kval, res, feil: [...new Set(feil)].slice(0, 20) }, null, 1));
  await b.close();
})();
