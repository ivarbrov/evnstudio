// Kontroll av robot-helten i 2.0-spillet (ekte draw(), fast 60 Hz-klokke):
//  1. Overganger mellom klipp: står → går/løper (W) → stopper → hopper (mellomrom) → slår (E) → står.
//     For hvert bilde: aktivt klipp og vekter. Feil hvis vektene ikke summerer til ca. 1 (robot i grunnstilling),
//     hvis et ledd hopper mer enn GRENSE radianer mellom to bilder (rykk), eller hvis et klipp mangler i sekvensen.
//  2. Øksa i hånda: avstand fra håndleddet til øksas grep og øksas retning i forhold til hånda, i ro og gjennom hele slaget.
//  3. Nærbilder fra siden (i ro og midt i slaget) til visuell kontroll.
// Krever server på :8765. Bruk: node tester/robot-animasjon.js [utmappe]
const { chromium } = require('playwright'); const fs = require('fs');
const UT = process.argv[2] || 'tester/resultater/robot-animasjon';
const GRENSE = 0.5;   // rad per bilde (60 Hz) – mer enn dette regnes som rykk

const INIT = `(() => {
  let t = 1000; performance.now = () => t; Date.now = () => 1.7e12 + t;
  const kø = []; window.requestAnimationFrame = f => { kø.push(f); return 1; };
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; kø.splice(0).forEach(f => f(t)); } };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {}
})();`;

(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 480, height: 300 } }); const konsoll = [];
  p.on('pageerror', e => konsoll.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') konsoll.push(m.text()); });
  await p.addInitScript(INIT);
  await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY });\n'), contentType: 'text/javascript' }));
  await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000 });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __steg(10); });
  await p.waitForFunction(() => window.__R3() && __R3().player && __R3().player.robot, null, { timeout: 120000, polling: 500 });

  // Sekvens med ekte tastetrykk. Helten står på åpen mark nær bålet.
  const r = await p.evaluate(({ GRENSE }) => {
    const g = __g(), { FX, FY } = __F(), P = __R3().player, R = P.robot, K = R.klipp;
    g.time = 40; g.p.x = FX + 200; g.p.y = FY + 220; __steg(30);
    const tast = (code, ned) => window.dispatchEvent(new KeyboardEvent(ned ? 'keydown' : 'keyup', { code }));
    const navn = new Map(Object.entries(K).map(([k, a]) => [a, k]));
    const ledd = []; R.modell.traverse(o => { if (o.isBone && /^(Hips|Torso|Abdomen|Neck|Head|UpperArm\.[LR]|LowerArm\.[LR]|UpperLeg\.[LR]|LowerLeg\.[LR])$/.test(o.name)) ledd.push(o); });
    const forrige = new Map(ledd.map(o => [o, o.quaternion.clone()]));
    const logg = [], rykk = [], nullvekt = [], sett = new Set();
    let bilde = 0;
    const steg = (n, hva) => { for (let i = 0; i < n; i++) { __steg(1); bilde++;
      const vekter = Object.entries(K).map(([k, a]) => [k, a.isRunning() ? a.getEffectiveWeight() : 0]).filter(x => x[1] > 0.001);
      const sum = vekter.reduce((s, x) => s + x[1], 0);
      if (sum < 0.6 || sum > 1.4) nullvekt.push({ bilde, hva, sum: +sum.toFixed(2), vekter });
      for (const o of ledd) { const q = forrige.get(o), v = q.angleTo(o.quaternion); if (v > GRENSE) rykk.push({ bilde, hva, ledd: o.name, rad: +v.toFixed(2), aktiv: navn.get(R.aktiv) }); q.copy(o.quaternion); }
      sett.add(navn.get(R.aktiv));
      if (i % 6 === 0 || i === n - 1) logg.push({ bilde, hva, aktiv: navn.get(R.aktiv), spd: Math.round(g.p.spd || 0), z: Math.round(g.p.z || 0), sving: +(g.p.swing || 0).toFixed(2), vekter: vekter.map(([k, w]) => `${k}:${w.toFixed(2)}`).join(' ') });
    } };
    steg(30, 'står');
    tast('KeyW', true); steg(8, 'starter å gå'); steg(60, 'løper'); tast('KeyW', false); steg(40, 'stopper');
    tast('Space', true); steg(3, 'hopp'); tast('Space', false); steg(50, 'i lufta og lander');
    tast('KeyE', true); steg(3, 'slag'); tast('KeyE', false); steg(45, 'slaget');
    steg(40, 'står igjen');
    return { logg, rykk, nullvekt, klippBrukt: [...sett], antallKlipp: Object.keys(K).length };
  }, { GRENSE });

  // Øksa: grepets avstand til håndleddet og vinkelen mellom øksa og hånda, gjennom et helt slag
  const øks = await p.evaluate(() => {
    const P = __R3().player, R = P.robot, øks = P.wpn && P.wpn.oks, v = new THREE.Vector3(), h = new THREE.Vector3();
    if (!øks) return { feil: 'fant ikke øksa' };
    const q0 = new THREE.Quaternion(), qh = new THREE.Quaternion(), qø = new THREE.Quaternion();
    const prøv = () => { R.hånd.getWorldPosition(h); øks.getWorldPosition(v); R.hånd.getWorldQuaternion(qh); øks.getWorldQuaternion(qø);
      return { avstand: +v.distanceTo(h).toFixed(2), relVinkel: +q0.copy(qh).invert().multiply(qø).angleTo(new THREE.Quaternion()).toFixed(3), synlig: (() => { let o = øks; while (o) { if (!o.visible) return false; o = o.parent; } return true; })(), forelder: øks.parent && øks.parent.name };
    };
    const ut = [prøv()];
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })); __steg(2); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' }));
    for (let i = 0; i < 30; i++) { __steg(1); if (i % 5 === 0) ut.push(prøv()); }
    return { målinger: ut };
  });

  // Nærbilder fra siden: i ro, og midt i slaget
  const nærbilde = async (navn, slag) => {
    const url = await p.evaluate(slag => {
      const R3 = __R3(), P = R3.player, R = P.robot;
      if (slag) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })); __steg(2); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' })); __steg(8); } else __steg(40);
      const c = new THREE.Vector3(); R.modell.getWorldPosition(c); const ret = P.grp.getWorldDirection(new THREE.Vector3());
      const side = new THREE.Vector3(ret.z, 0, -ret.x).normalize();
      R3.camera.position.copy(c).addScaledVector(side, 120).add(new THREE.Vector3(0, 55, 0)).addScaledVector(ret, 30); R3.camera.lookAt(c.x, c.y + 45, c.z);
      R3.renderer.render(R3.scene, R3.camera); return R3.renderer.domElement.toDataURL('image/png');
    }, slag);
    fs.writeFileSync(`${UT}/${navn}.png`, Buffer.from(url.split(',')[1], 'base64'));
  };
  await nærbilde('oks-i-ro', false); await nærbilde('oks-slag', true);

  const feil = [];
  for (const k of ['Idle', 'Running', 'Jump', 'Punch']) if (!r.klippBrukt.includes(k)) feil.push(`klippet ${k} ble ikke brukt i sekvensen`);
  if (r.rykk.length) feil.push(`${r.rykk.length} rykk (ledd > ${GRENSE} rad mellom to bilder)`);
  if (r.nullvekt.length) feil.push(`${r.nullvekt.length} bilder med feil sum av klippvekter`);
  if (øks.feil) feil.push(øks.feil);
  else {
    const m = øks.målinger, d = m.map(x => x.avstand), a = m.map(x => x.relVinkel);
    if (Math.max(...d) - Math.min(...d) > 0.01 || Math.max(...a) - Math.min(...a) > 0.001) feil.push('øksa beveger seg i forhold til hånda');
    if (m.some(x => !x.synlig)) feil.push('øksa er ikke synlig');
  }
  if (konsoll.length) feil.push('konsollmeldinger: ' + konsoll.slice(0, 3).join(' | '));
  const rapport = { status: feil.length ? 'IKKE BESTÅTT' : 'BESTÅTT', feil, ...r, øks, konsoll };
  fs.writeFileSync(`${UT}/rapport.json`, JSON.stringify(rapport, null, 1));
  console.log(JSON.stringify({ status: rapport.status, feil, klippBrukt: r.klippBrukt, rykk: r.rykk.slice(0, 5), nullvekt: r.nullvekt.slice(0, 3), øks: øks.målinger && øks.målinger.slice(0, 3) }, null, 1));
  await b.close(); process.exit(feil.length ? 1 : 0);
})();
