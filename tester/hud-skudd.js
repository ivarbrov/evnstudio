// Skjermbilder til HUD-prototypen: dagens HUD (før) og ren spillgrafikk (uten HUD) på PC og mobil (liggende).
// Ekte rAF (ikke fast klokke), så HUD-en oppdateres som i spillet. Krever server på :8765.
const { chromium } = require('playwright'); const fs = require('fs');
const UT = process.argv[2] || 'tester/resultater/hud';
const OPPSETT = { pc: { viewport: { width: 1280, height: 720 } }, mobil: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } };
(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [navn, o] of Object.entries(OPPSETT).filter(([k]) => !process.env.BARE || k === process.env.BARE)) {
    const ctx = await b.newContext({ ...o, deviceScaleFactor: 1 }), p = await ctx.newPage();
    await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {} });
    await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY });\n'), contentType: 'text/javascript' }));
    await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000 });
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.waitForFunction(() => window.__R3() && __R3().player && __R3().player.robot, null, { timeout: 300000, polling: 1000 });
    // Typisk spillsituasjon: dag 2, litt ved og stein, nær bålet. Bare visning: verdiene settes som en spiller kunne hatt dem.
    await p.evaluate(() => { const g = __g(), { FX, FY } = __F(); g.p.x = FX + 60; g.p.y = FY + 150; g.time = 50; g.wood = 7; g.stone = 3; g.raw = 2; g.food = 72; g.hp = 85; });
    await p.waitForTimeout(8000);
    await p.screenshot({ path: `${UT}/${navn}-for.png`, timeout: 180000 });
    await p.addStyleTag({ content: '#hud,#touch,#joy,#hotbar,#prompt,#toast,#cross,#devSky,#evnPauseKnapp,.evn-pause-knapp,[id^="evn"]{display:none!important} #ov{opacity:0}' });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${UT}/${navn}-ren.png`, timeout: 180000 });
    // Natt ved bålet (ren)
    await p.evaluate(() => { __g().time = 160; }); await p.waitForTimeout(5000);
    await p.screenshot({ path: `${UT}/${navn}-ren-natt.png`, timeout: 180000 });
    await ctx.close();
  }
  await b.close(); console.log('ferdig');
})();
