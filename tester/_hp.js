const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1320, height: 800 } }); const k = [];
  p.on('pageerror', e => k.push(e.message));
  await p.goto('http://localhost:8765/spill/morkeskogen-2/testvisning/hud-prototype.html');
  await p.screenshot({ path: '/tmp/hp-pc.png', clip: { x: 0, y: 190, width: 1320, height: 610 } });
  await p.click('[data-v="mobil"]'); await p.screenshot({ path: '/tmp/hp-mob.png', clip: { x: 0, y: 190, width: 900, height: 400 } });
  await p.click('[data-s="prompt"]'); await p.click('[data-s="full"]'); await p.screenshot({ path: '/tmp/hp-mob2.png', clip: { x: 0, y: 190, width: 900, height: 400 } });
  console.log(JSON.stringify(k)); await b.close(); })();
