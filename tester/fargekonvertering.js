// Regresjonstest: fargekonverteringen i overgangslaget (kompat-r187.js, EVN2_OVERGANG).
// Kontrollerer i 2.0-spillet (ekte three.js r187, ekte draw()) at
//  1. ingen farge gjøres om to ganger fra samme verdi (det som gjorde roboten oransje)
//  2. materialer merket som ny grafikk (userData.evn2, f.eks. roboten) aldri gjøres om
//  3. hvert gammelt materiale er gjort om nøyaktig én gang, og har riktig lineær verdi
//  4. robotens farger er som i GLB-fila (grå/svart) og valgt gul (#ffcc00)
// Scenen dekker oppstart, dag, natt med bål og monstre, hugging, bygging og nye objekter som legges til underveis.
// Krever server på :8765. Bruk: node tester/fargekonvertering.js   (avslutter med kode 1 ved feil)
const { chromium } = require('playwright'); const fs = require('fs');

const INIT = `(() => {
  let t = 1000; performance.now = () => t; Date.now = () => 1.7e12 + t;
  const kø = []; window.requestAnimationFrame = f => { kø.push(f); return 1; };
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; kø.splice(0).forEach(f => f(t)); } };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {}
})();`;
// Legges inn rett etter three.js: følger med på hver omregning sRGB -> lineær
const VAKT = `<script>(() => {
  const C = THREE.Color.prototype, f0 = C.convertSRGBToLinear, logg = window.__fargeLogg = { dobbel: [], antall: 0, første: new WeakMap(), siste: new WeakMap(), ganger: new WeakMap() };
  const fast = c => [c.r, c.g, c.b].every(v => v < 0.002 || v > 0.998);          // 0 og 1 er like i sRGB og lineært
  C.convertSRGBToLinear = function () {
    const før = [this.r, this.g, this.b], s = logg.siste.get(this);
    if (s && !fast(this) && før.every((v, i) => Math.abs(v - s[i]) < 1e-7)) logg.dobbel.push({ før, stakk: new Error().stack.split('\\n').slice(2, 5).map(l => l.trim()).join(' < ') });
    if (!logg.første.has(this)) logg.første.set(this, før);
    const r = f0.call(this); logg.siste.set(this, [this.r, this.g, this.b]); logg.ganger.set(this, (logg.ganger.get(this) || 0) + 1); logg.antall++; return r;
  };
})();</script>`;

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 480, height: 300 } }); const konsoll = [];
  p.on('pageerror', e => konsoll.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') konsoll.push(m.text()); });
  await p.addInitScript(INIT);
  await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await p.route('**/spill/morkeskogen-2/spill/index.html', r => {
    const T = '<script src="../../../vendor/three-r187.global.js"></script>';
    r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/index.html', 'utf8').replace(T, T + VAKT), contentType: 'text/html; charset=utf-8' });
  });
  // MUTANT=1: gjeninnfører feilen (objekter gjøres om straks de legges til) – testen skal da feile
  if (process.env.MUTANT) await p.route('**/spill/morkeskogen-2/spill/kompat-r187.js', r => {
    const k = fs.readFileSync('spill/morkeskogen-2/spill/kompat-r187.js', 'utf8'), m = k.replace('if (x && x.isObject3D) kø.push(x);', 'if (x && x.isObject3D) gjennomgå(x);');
    if (m === k) throw new Error('mutanten traff ikke'); r.fulfill({ body: m, contentType: 'text/javascript' });
  });
  await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY });\n'), contentType: 'text/javascript' }));
  await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000 });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __steg(10); });
  await p.waitForFunction(() => window.__R3() && __R3().player && __R3().player.robot, null, { timeout: 120000, polling: 500 });
  // Uten tegning: draw() (og overgangslaget, som kjøres i draw() før tegningen) går som vanlig. Programvaregrafikken her er ellers for treg.
  await p.evaluate(() => { __R3().renderer.render = () => {}; });
  // Dag, natt (bål, monstre), hugging (partikler), bygging (ny bygning legges til), tilbake til dag
  await p.evaluate(() => { __steg(60); __g().time = 160; __steg(240); });
  await p.evaluate(() => { const g = __g(), { FX, FY } = __F(); g.time = 40; g.wood = 60; g.stone = 40; g.p.x = FX + 260; g.p.y = FY - 200; __steg(30); });
  await p.evaluate(() => { const g = __g(); g.build = 'hytte'; const k = new KeyboardEvent('keydown', { code: 'KeyE' }); window.dispatchEvent(k); __steg(5); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' })); __steg(60); });
  const perBilde = await p.evaluate(() => { const a = __fargeLogg.antall; __steg(60); return (__fargeLogg.antall - a) / 60; });
  const r = await p.evaluate(() => {
    const L = window.__fargeLogg, R3 = __R3(), s2l = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    const mats = new Set(); R3.scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); });
    let gamle = 0, nye = 0, ikkeGjortOm = [], nyGjortOm = [], feilVerdi = [], flereGanger = [];
    for (const m of mats) {
      if (m.userData.evn2) { nye++; for (const c of [m.color, m.emissive]) if (c && L.ganger.get(c) > (m.name === 'Main' ? 1 : 0)) nyGjortOm.push(m.name || m.type); continue; }
      if (m.isShaderMaterial) continue;
      gamle++;
      if (!m.userData.__evnLin) { ikkeGjortOm.push(m.type + ' ' + (m.name || '')); continue; }
      // statiske farger: forventet = lineær(første verdi). Farger draw() endrer underveis har flere omregninger (fra ny verdi hver gang)
      for (const c of [m.color, m.emissive]) {
        if (!c || !L.første.has(c)) continue;
        const n = L.ganger.get(c), f = L.første.get(c);
        if (n === 1) { const fv = f.map(s2l); if (fv.some((v, i) => Math.abs(v - [c.r, c.g, c.b][i]) > 1e-5)) feilVerdi.push(m.type + ' ' + m.name); }
        if (n > 1) flereGanger.push(n);
      }
    }
    // Roboten: farger som i GLB-fila (lineære verdier der) og valgt gul
    const robot = {}; R3.player.robot.modell.traverse(o => { if (o.isMesh) robot[o.material.name] = '#' + o.material.color.getHexString(); });
    return { omregninger: L.antall, dobbel: L.dobbel.slice(0, 5), antallDobbel: L.dobbel.length, materialer: mats.size, gamle, nye, ikkeGjortOm: ikkeGjortOm.slice(0, 10), antallIkkeGjortOm: ikkeGjortOm.length,
      nyGjortOm, feilVerdi: feilVerdi.slice(0, 10), dynamiskeFarger: flereGanger.length, robot,
      forventetRobot: { Main: '#' + new THREE.Color().setHex(0xffcc00).convertSRGBToLinear().getHexString(), Grey: '#' + new THREE.Color(0.373757988214493, 0.371300429105759, 0.334965020418167).getHexString(), Black: '#' + new THREE.Color(0.046244353055954, 0.046244353055954, 0.046244353055954).getHexString() } };
  });
  r.konsoll = konsoll; r.omregningerPerBilde = perBilde;
  const feil = [];
  if (r.antallDobbel) feil.push(`${r.antallDobbel} farger gjort om to ganger fra samme verdi`);
  if (r.nyGjortOm.length) feil.push('ny grafikk ble gjort om: ' + r.nyGjortOm.join(', '));
  if (r.feilVerdi.length) feil.push('feil lineær verdi: ' + r.feilVerdi.join(', '));
  if (r.antallIkkeGjortOm) feil.push(`${r.antallIkkeGjortOm} gamle materialer er ikke gjort om`);
  for (const k of Object.keys(r.forventetRobot)) if (r.robot[k] !== r.forventetRobot[k]) feil.push(`robotens ${k}: ${r.robot[k]}, forventet ${r.forventetRobot[k]}`);
  if (konsoll.length) feil.push('konsollmeldinger: ' + konsoll.slice(0, 3).join(' | '));
  r.status = feil.length ? 'IKKE BESTÅTT' : 'BESTÅTT'; r.feil = feil;
  fs.mkdirSync('tester/resultater', { recursive: true }); fs.writeFileSync('tester/resultater/fargekonvertering.json', JSON.stringify(r, null, 1));
  console.log(JSON.stringify({ status: r.status, feil, materialer: r.materialer, gamle: r.gamle, nye: r.nye, omregninger: r.omregninger, perBilde, dynamiskeFarger: r.dynamiskeFarger, robot: r.robot }, null, 1));
  await b.close(); process.exit(feil.length ? 1 : 0);
})();
