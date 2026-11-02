// Kameratest for Mørkeskogen 2.0 (gjennomsiktige trær i stedet for at nært kamera trekkes inn).
// Kjører spillets egen draw() med fast 60 Hz-klokke og ekte tastetrykk (uten tegning, unntatt målebildene).
// For hver scene, per bilde: hvilke trær som er tonet ned, og hvor mye. Kontrollerer:
//  - jevn toning: ingen endring større enn GRENSE i ett bilde, og ingen «blinking» (tre som tones ned og opp igjen
//    mer enn én gang i løpet av ett sekund)
//  - bare trær i sikten: et tonet tre har stått i veien (mellom hodet og kameraet, eller ved kameraet) siste 0,35 s
//  - kameraavstanden: nært kamera trekkes ikke inn av trær, men fortsatt av hytter og bygninger
//  - tegnekall og trekanter med og uten toning (#kamera=original), samme scene
// Scener: tett skog (går og løper, snur kameraet), ved hytte og bygning, nattkamp, kamera ovenfra.
// Krever server på :8765. Bruk: node tester/kamera.js
const { chromium } = require('playwright'); const fs = require('fs');
const UT = 'tester/resultater/kamera'; const GRENSE = 0.15;

const INIT = `(() => {
  let t = 1000; performance.now = () => t; Date.now = () => 1.7e12 + t;
  const kø = []; window.requestAnimationFrame = f => { kø.push(f); return 1; };
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; kø.splice(0).forEach(f => f(t)); } };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {}
})();`;

async function side(b, original) {
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); p.konsoll = [];
  p.on('pageerror', e => p.konsoll.push(e.message)); p.on('console', m => { if (m.type() === 'error') p.konsoll.push(m.text()); });
  await p.addInitScript(INIT);
  await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY, groundH, treeWK, treeHK });\n'), contentType: 'text/javascript' }));
  await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html' + (original ? '#kamera=original' : ''), { timeout: 200000 });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __steg(10); });
  await p.waitForFunction(() => window.__R3() && __R3().player && __R3().player.robot, null, { timeout: 300000, polling: 500 });
  await p.evaluate(() => { const r = __R3().renderer; window.__render0 = r.render; r.render = () => {}; });
  return p;
}

// Én scene: plassering + handlinger, logger per bilde
const SCENE = async (p, navn) => p.evaluate(([navn, GRENSE]) => {
  const HOLD = window.__kamHold || 0.6;
  const R3 = __R3(), g = __g(), F = __F(), p = g.p;
  const tast = (c, ned) => window.dispatchEvent(new KeyboardEvent(ned ? 'keydown' : 'keyup', { code: c }));
  const tett = () => { let best = null; for (let i = 0; i < 400; i++) { const a = i * 2.39996, r = 400 + i * 6, qx = F.FX + Math.cos(a) * r, qz = F.FY + Math.sin(a) * r;
    const n = g.trees.filter(t => t.alive && !t.giant && Math.hypot(t.x - qx, t.y - qz) < 160).length, fri = !g.trees.some(t => t.alive && Math.hypot(t.x - qx, t.y - qz) < 30);
    if (fri && (!best || n > best.n)) best = { n, qx, qz }; } return best; };
  const plasser = (x, z, modus = 'near') => { p.x = x; p.y = z; p.vx = p.vy = 0; R3.camMode = modus; R3.camYaw = 0; R3.camPitch = 0; R3.camZoom = 1; R3.camT.set(x, 0, z); R3.camE = modus === 'near' ? 1 : 0; R3.camK = 1; g.time = 40; __steg(40); };
  const logg = { bilder: 0, maksPerBilde: 0, sumTonet: 0, store: [], blink: [], camK: [], ikkeISikt: 0 };
  const hist = new Map();
  const start = () => { hist.clear(); for (const t of g.trees) if (t._m && t._m.fade2 !== undefined) hist.set(t, { v: t._m.fade2, sist: [], retn: 0 }); };   // utgangspunkt: toningen slik den er når scenen starter
  const bilde = (n, før) => { for (let i = 0; i < n; i++) { if (før) før(i); __steg(1); logg.bilder++;
    let tonet = 0;
    for (const t of g.trees) { const m = t._m; if (!m || m.fade2 === undefined) continue;
      const h = hist.get(t) || { v: 1, sist: [], retn: 0 }; const d = m.fade2 - h.v;
      if (Math.abs(d) > GRENSE) logg.store.push({ bilde: logg.bilder, d: +d.toFixed(2) });
      const r = Math.abs(d) < 1e-4 || !m.grp.visible ? 0 : Math.sign(d);
      if (r && h.retn && r !== h.retn) { h.sist.push(logg.bilder); h.sist = h.sist.filter(b => logg.bilder - b < 60); if (h.sist.length > 1) logg.blink.push({ bilde: logg.bilder, tre: t.kind }); }
      if (r) h.retn = r; h.v = m.fade2; hist.set(t, h);
      if (m.fade2 < 0.97 && m.grp.visible) { tonet++; if (m.okk === undefined || R3.kamTid - m.okk > HOLD + 1.4) logg.ikkeISikt++; }   // HOLD + 1,4 s: holdetid pluss tiden det tar å tone helt opp igjen
    }
    logg.maksPerBilde = Math.max(logg.maksPerBilde, tonet); logg.sumTonet += tonet; logg.camK.push(+R3.camK.toFixed(2));
  } };
  if (navn === 'tett-skog') {
    const b = tett(); plasser(b.qx, b.qz); start();
    tast('KeyW', true); bilde(120); tast('ShiftLeft', true); bilde(120); tast('ShiftLeft', false); tast('KeyW', false); bilde(40);
    bilde(120, () => { R3.camYaw += 0.02; });            // snur kameraet en halv runde
    tast('KeyD', true); bilde(90); tast('KeyD', false); bilde(60);
  } else if (navn === 'hytte') {
    const c = g.cabins.slice().sort((a, b) => Math.hypot(a.x - F.FX, a.y - F.FY) - Math.hypot(b.x - F.FX, b.y - F.FY))[0];
    plasser(c.x, c.y - 90); R3.camYaw = Math.PI; __steg(30); start();      // kameraet bak helten, hytta mellom: kameraet skal fortsatt trekkes inn
    bilde(90); tast('KeyA', true); bilde(60); tast('KeyA', false); bilde(30);
  } else if (navn === 'kamp-natt') {
    const b = tett(); plasser(b.qx, b.qz); g.time = 165; __steg(120);
    for (let k = 0; k < 4; k++) { const m = g.monsters[k]; if (m) { m.x = p.x + 30 * k; m.y = p.y - 70; } }
    start();
    for (let k = 0; k < 6; k++) { tast('KeyE', true); bilde(4); tast('KeyE', false); bilde(26); }
  } else if (navn === 'ovenfra') {
    const b = tett(); plasser(b.qx, b.qz, 'far'); start(); tast('KeyW', true); bilde(150); tast('KeyW', false); bilde(60);
  }
  const k = logg.camK; logg.camKMin = Math.min(...k); logg.camKSnitt = +(k.reduce((a, b) => a + b, 0) / k.length).toFixed(2); delete logg.camK;
  logg.snittTonet = +(logg.sumTonet / logg.bilder).toFixed(1); delete logg.sumTonet;
  logg.store = logg.store.slice(0, 5); logg.antallBlink = logg.blink.length; logg.blink = logg.blink.slice(0, 5);
  // Tegnekall og trekanter i siste bilde (tegnes én gang)
  R3.renderer.render = window.__render0; R3.renderer.info.reset(); R3.renderer.info.autoReset = false; R3.renderer.render(R3.scene, R3.camera);
  logg.tegnekall = R3.renderer.info.render.calls; logg.trekanter = R3.renderer.info.render.triangles; R3.renderer.info.autoReset = true;
  logg.bildeUrl = R3.renderer.domElement.toDataURL('image/png'); R3.renderer.render = () => {};
  return logg;
}, [navn, GRENSE]);

(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const rapport = { scener: {} }; const feil = [];
  for (const original of [false, true]) {
    const p = await side(b, original), v = original ? 'original' : 'ny';
    for (const navn of (process.env.SCENER || 'tett-skog,hytte,kamp-natt,ovenfra').split(',')) {
      const r = await SCENE(p, navn);
      fs.writeFileSync(`${UT}/${navn}-${v}.png`, Buffer.from(r.bildeUrl.split(',')[1], 'base64')); delete r.bildeUrl;
      (rapport.scener[navn] = rapport.scener[navn] || {})[v] = r;
      if (!original) { if (r.store.length) feil.push(`${navn}: hopp i toningen`); if (r.antallBlink) feil.push(`${navn}: ${r.antallBlink} blink`); if (r.ikkeISikt) feil.push(`${navn}: ${r.ikkeISikt} tonede trær som ikke stod i veien`); }
    }
    if (p.konsoll.length) feil.push(`${v}: konsoll: ${p.konsoll.slice(0, 3).join(' | ')}`);
    await p.close();
  }
  rapport.status = feil.length ? 'IKKE BESTÅTT' : 'BESTÅTT'; rapport.feil = feil;
  fs.writeFileSync(`${UT}/rapport.json`, JSON.stringify(rapport, null, 1));
  console.log(JSON.stringify(rapport, null, 1));
  await b.close(); process.exit(feil.length ? 1 : 0);
})();
