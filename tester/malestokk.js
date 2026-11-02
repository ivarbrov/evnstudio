// Målestokk-kontroll for robot-helten i Mørkeskogen 2.0 (bare grafikk; spillogikken endres ikke).
//  1. Mål i spillverdenens enheter: robot, gutten fra 5.6.2 (ligger usynlig i 2.0 som rigg), hytte og dør, trær, dyr, bål og annet.
//  2. Skjermhøyde: hvor mange piksler helten tar i nært spillkamera.
//  3. Bilder i identiske scener (hyttedør forfra, hyttedør i spillkamera, bålet, tett skog) med gutten (referanse) og
//     roboten i 100 %, 90 % og 85 %. Størrelsen settes bare på robotens grafikk-gruppe (R.rot.scale) i testen.
// Krever server på :8765. Bruk: node tester/malestokk.js [utmappe]
const { chromium } = require('playwright'); const fs = require('fs');
const UT = process.argv[2] || 'tester/resultater/malestokk';
const VW = 960, VH = 540;

const INIT = `(() => {
  let t = 1000; performance.now = () => t; Date.now = () => 1.7e12 + t;
  const kø = []; window.requestAnimationFrame = f => { kø.push(f); return 1; };
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; kø.splice(0).forEach(f => f(t)); } };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {}
})();`;

(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: VW, height: VH } }); const konsoll = [];
  p.on('pageerror', e => konsoll.push(e.message)); p.on('console', m => { if (m.type() === 'error') konsoll.push(m.text()); });
  await p.addInitScript(INIT);
  await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY, groundH, treeHK, phaseInfo });\n'), contentType: 'text/javascript' }));
  await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000 });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __steg(10); });
  await p.waitForFunction(() => window.__R3() && __R3().player && __R3().player.robot, null, { timeout: 300000, polling: 500 });
  await p.evaluate(() => { const r = __R3().renderer; window.__render0 = r.render; r.render = () => {}; const g = __g(); g.time = 40; __steg(5); });

  // ---------- 1. Mål ----------
  const mål = await p.evaluate(() => {
    const R3 = __R3(), g = __g(), P = R3.player, R = P.robot, F = __F();
    const boks = (o, presis = true) => { o.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o, presis); };
    const h = bx => +(bx.max.y - bx.min.y).toFixed(1), br = bx => +Math.max(bx.max.x - bx.min.x, bx.max.z - bx.min.z).toFixed(1);
    // Roboten i ro (Idle) og stående
    const iFeste = m => { for (let f = m; f; f = f.parent) if (f.name === 'evn2-vapenfeste') return true; return false; };
    const kropp = o => { const bx = new THREE.Box3(); o.traverse(m => { if (m.isMesh && !iFeste(m)) bx.union(boks(m)); }); return bx; };   // bare robotens kropp, ikke våpnene i hånda (også usynlige våpen har mål)
    const rb = kropp(R.modell); const hode = []; R.modell.traverse(o => { if (o.isMesh && /^Head/.test(o.name)) hode.push(boks(o)); });
    const hb = hode.reduce((a, x) => a.union(x), new THREE.Box3());
    // Gutten: den usynlige riggen (skinned mesh + hår), samme stilling som i 5.6.2 når han står
    const gutt = new THREE.Box3(); P.grp.traverse(o => { if ((o.isSkinnedMesh || (o.isMesh && o.userData.evn2Skjult)) && !(R.rot === o || R.rot.getObjectById(o.id))) gutt.union(boks(o)); });
    let guttHode = new THREE.Box3(); P.head.traverse(o => { if (o.isMesh) guttHode.union(boks(o)); }); P.grp.traverse(o => { if (o.isSkinnedMesh) { /* hodet sitter i skinned mesh */ } });
    const hodeLedd = new THREE.Vector3(); P.head.getWorldPosition(hodeLedd);
    const bunn = P.grp.getWorldPosition(new THREE.Vector3()).y;
    // Hytte (verdenshytte), dør og vindu er faste mål i makeBuilding('hytte')
    const c = g.cabins[0], hb2 = c && c._m && c._m.isObject3D ? boks(c._m, false) : null;
    // Trær: målt fra modellene
    const art = {}; for (const t of g.trees) { if (!t._m || !t.alive) continue; const k = t.giant ? 'kjempegran' : t.kind; (art[k] = art[k] || []).push(t); }
    const trær = {}; for (const [k, l] of Object.entries(art)) { const hs = l.slice(0, 40).map(t => t._m.grp || t._m).filter(m => m && m.isObject3D).map(m => h(boks(m, false))).sort((a, b) => a - b); if (!hs.length) continue; trær[k] = { antall: l.length, median: hs[hs.length >> 1], min: hs[0], maks: hs[hs.length - 1] }; }
    // Dyr
    const dyr = {}; for (const a of g.animals || []) { const m = a._m && (a._m.grp || a._m); if (!m || !m.isObject3D || dyr[a.kind || a.type]) continue; dyr[a.kind || a.type] = h(boks(m, false)); }
    const bål = R3.fire && R3.fire.isObject3D ? h(boks(R3.fire, false)) : null;
    return {
      robot: { høyde: h(rb), bredde: br(rb), hodeHøyde: h(hb), hodeBredde: br(hb), hodeAndel: +(h(hb) / h(rb)).toFixed(2), skala: R.modell.scale.x },
      gutt: { høyde: +(gutt.max.y - bunn).toFixed(1), bredde: br(gutt), hodeLeddOverBakken: +(hodeLedd.y - bunn).toFixed(1), hodeHøyde: guttHode.isEmpty() ? null : h(guttHode) },
      hytte: { vegg: 40, dørHøyde: 28, dørBredde: 16, takfot: 41.5, total: hb2 ? h(hb2) : null, bredde: hb2 ? br(hb2) : null, kilde: "makeBuilding('hytte')" },
      trær, dyr, bål,
      kamera: { fov: R3.camera.fov, nærBak: 220, nærOpp: 120, smalSkjermFaktor: 1.3, siktehøyde: '+40 over bakken, 160 foran helten' },
    };
  });

  // ---------- 2 og 3. Scener ----------
  // Varianter: gutten (referanse fra 5.6.2), robot 100 %, 90 %, 85 %
  const VAR = [['gutt', 0], ['100', 1], ['90', 0.9], ['85', 0.85]];
  const settVariant = (navn, f) => p.evaluate(([navn, f]) => {
    const P = __R3().player, R = P.robot;
    const gutt = navn === 'gutt';
    R.rot.visible = !gutt; R.rot.scale.setScalar(gutt ? 1 : f);
    const skjult = []; P.grp.traverse(o => { if (o.userData.evn2Skjult !== undefined) skjult.push(o); });
    for (const o of skjult) { o.userData.evn2Skjult = !gutt; o.visible = gutt; }
  }, [navn, f]);
  // Plassering per scene. Kameraet: spillets nære kamera (camYaw), eller et fast kamera (forfra mot hyttedøra).
  const SCENER = {
    'hyttedor-forfra': { fast: true },
    'hyttedor-spillkamera': {},
    'baal': {},
    'tett-skog': {},
    'tett-skog-fast': { fast: 'skog' },   // spillkameraet trekkes helt inn mot helten mellom trærne; her et fast kamera 260 bak og 90 over
  };
  const plasser = (scene) => p.evaluate(scene => {
    const R3 = __R3(), g = __g(), F = __F(), p = g.p;
    let x, z, yaw = 0;
    const c = g.cabins.slice().sort((a, b) => Math.hypot(a.x - F.FX, a.y - F.FY) - Math.hypot(b.x - F.FX, b.y - F.FY))[0];
    if (scene === 'hyttedor-forfra') { x = c.x - 8 + 26; z = c.y + 34; }
    else if (scene === 'hyttedor-spillkamera') { x = c.x - 8; z = c.y + 70; }
    else if (scene === 'baal') { x = F.FX + 30; z = F.FY + 120; }
    else if (scene === 'tett-skog-fast' && window.__skog) { x = window.__skog[0]; z = window.__skog[1]; }
    else {   // tetteste skog i nærheten av start: flest trær innenfor 160
      let best = null; for (let i = 0; i < 400; i++) { const a = i * 2.39996, r = 400 + i * 6, qx = F.FX + Math.cos(a) * r, qz = F.FY + Math.sin(a) * r;
        const n = g.trees.filter(t => t.alive && !t.giant && Math.hypot(t.x - qx, t.y - qz) < 160).length, fri = !g.trees.some(t => t.alive && Math.hypot(t.x - qx, t.y - qz) < 30);
        if (fri && (!best || n > best.n)) best = { n, qx, qz }; }
      x = best.qx; z = best.qz; window.__tettN = best.n; window.__skog = [x, z];
    }
    p.x = x; p.y = z; p.vx = p.vy = 0; p.spd = 0; R3.camMode = 'near'; R3.camYaw = yaw; R3.camPitch = 0; R3.camZoom = 1;
    R3.camT.set(x, 0, z); R3.camE = 1; R3.camK = 1;
    __steg(45);
    return { c: { x: c.x, z: c.y }, x, z };
  }, scene);
  const bilde = (fast, info) => p.evaluate(([fast, info]) => {
    const R3 = __R3(), F = __F();
    __steg(1);
    if (fast === 'skog') { const p = __g().p, gy = F.groundH(p.x, p.y); R3.camera.position.set(p.x, gy + 90, p.y + 260); R3.camera.lookAt(p.x, gy + 40, p.y); }
    else if (fast) {   // fast kamera rett foran hytta, i øyehøyde
      const gy = F.groundH(info.c.x, info.c.z);
      R3.camera.position.set(info.c.x + 4, gy + 38, info.c.z + 190); R3.camera.lookAt(info.c.x + 4, gy + 32, info.c.z);
    }
    R3.renderer.render = window.__render0; R3.renderer.render(R3.scene, R3.camera); R3.renderer.render = () => {};
    // Heltens høyde på skjermen (piksler), fra topp og bunn av den synlige figuren
    const P = R3.player, R = P.robot, box = new THREE.Box3();
    const iFeste = m => { for (let f = m; f; f = f.parent) if (f.name === 'evn2-vapenfeste') return true; return false; };
    if (R.rot.visible) R.modell.traverse(o => { if (o.isMesh && !iFeste(o)) box.union(new THREE.Box3().setFromObject(o, true)); }); else P.grp.traverse(o => { if (o.isSkinnedMesh) box.union(new THREE.Box3().setFromObject(o, true)); });
    const c = box.getCenter(new THREE.Vector3()), top = new THREE.Vector3(c.x, box.max.y, c.z).project(R3.camera), bot = new THREE.Vector3(c.x, box.min.y, c.z).project(R3.camera);
    const px = Math.round((top.y - bot.y) / 2 * R3.renderer.domElement.height / R3.renderer.getPixelRatio());
    return { url: R3.renderer.domElement.toDataURL('image/png'), px };
  }, [fast, info]);

  const skjerm = {};
  for (const [scene, opt] of Object.entries(SCENER).filter(([k]) => !process.env.SCENE || process.env.SCENE.split(',').includes(k))) {
    const info = await plasser(scene); skjerm[scene] = {};
    for (const [navn, f] of VAR) {
      await settVariant(navn, f); await p.evaluate(() => __steg(2));
      const r = await bilde(opt.fast || false, info);
      fs.writeFileSync(`${UT}/${scene}-${navn}.png`, Buffer.from(r.url.split(',')[1], 'base64'));
      skjerm[scene][navn] = r.px;
    }
  }
  await settVariant('100', 1);
  const tett = await p.evaluate(() => window.__tettN);
  const rapport = { mål, skjermhøydePx: skjerm, viewport: [VW, VH], tetteSkogenTrærInnen160: tett, konsoll };
  fs.writeFileSync(`${UT}/rapport.json`, JSON.stringify(rapport, null, 1));
  console.log(JSON.stringify(rapport, null, 1));
  await b.close();
})();
