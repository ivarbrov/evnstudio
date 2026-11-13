// Bruk: start en lokal server i prototype/matdyr-fase2 (f.eks. python3 -m http.server 8790) og kjør node rutetest.mjs [adresse]
// Automatisk test: roboten følger spiralrampa fra Start til takterrassen, går inn i hver etasje, og prøver å hoppe ut over rekkverket.
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const prof = fs.mkdtempSync('/tmp/rute-'); const p = spawn('/usr/bin/google-chrome', ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + prof, '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
for (const sg of ['SIGTERM', 'SIGINT']) process.on(sg, () => { try { p.kill('SIGKILL'); } catch {} process.exit(1); });
process.on('exit', () => { try { p.kill('SIGKILL'); } catch {} });   // Chrome lukkes også ved feil og tidsavbrudd (QA 81c2fb8)
while (!fs.existsSync(prof + '/DevToolsActivePort')) await new Promise(r => setTimeout(r, 100));
const [port, sti] = fs.readFileSync(prof + '/DevToolsActivePort', 'utf8').split('\n'); const ws = new WebSocket('ws://127.0.0.1:' + port + sti); await new Promise(r => ws.onopen = r);
let id = 0; const v = new Map(), feil = []; ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && v.has(d.id)) { v.get(d.id)(d); v.delete(d.id); } else if (d.method === 'Runtime.exceptionThrown') feil.push(d.params.exceptionDetails.exception?.description); };
const send = (method, params = {}, sessionId) => new Promise(r => { const n = ++id; v.set(n, r); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' }); const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const s = (m, pp) => send(m, pp, sessionId); await s('Page.enable'); await s('Runtime.enable');
const ev = async x => { const r = await s('Runtime.evaluate', { expression: x, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600)); return r.result.result.value; };
await s('Page.navigate', { url: process.argv[2] || 'http://127.0.0.1:8790/index.html' }); for (let i = 0; i < 100 && !(await ev('!!window.EVNKlar')); i++) await new Promise(r => setTimeout(r, 200));
await ev('EVNVis({fane:"spill", niva:9})');
const res = await ev(`(() => {
  const S = EVNSpor, g = EVNGeo, sp = EVNSpill, b = EVNBane, R = EVNRobot(), ut = [];
  b.teta = 0;
  function gaaMot(x, z, n = 600) { for (let i = 0; i < n; i++) { const dx = x - R.position.x, dz = z - R.position.z, m = Math.hypot(dx, dz); if (m < 0.35) break;
      const fx = -Math.sin(b.teta), fz = -Math.cos(b.teta), rx = Math.cos(b.teta), rz = -Math.sin(b.teta);
      sp.inn = { x: (dx * rx + dz * rz) / m, z: (dx * fx + dz * fz) / m }; EVNSteg(1 / 30); }
    sp.inn = { x: 0, z: 0 }; for (let i = 0; i < 20; i++) EVNSteg(1 / 30); return Math.hypot(x - R.position.x, z - R.position.z) < 0.6; }
  const pos = () => [R.position.x, R.position.y, R.position.z].map(v => +v.toFixed(2));
  // Følg senterlinjen til slutten av hver del og registrer høyden
  function folg(d0, d1) { for (const q of S.p) { if (q[3] < d0 || q[3] > d1) continue; if (Math.round(q[3] * 4) % 6) continue; if (!gaaMot(q[0], q[1], 200)) return { stoppet: pos(), ved: q.slice(0, 5).map(v => +(+v).toFixed(2)) }; } return null; }
  const etasje = () => document.getElementById('spillStatus').textContent;
  let stopp;
  // Rampe 1 til repos 1, inn i 2. etasje
  stopp = folg(0, S.repos[1][0] + 1); ut.push(['rampe1', stopp, pos()]);
  const rep1 = S.p.find(q => q[3] >= (S.repos[1][0] + S.repos[1][1]) / 2);
  gaaMot(rep1[0], rep1[1]); const inn1 = gaaMot(g.HX - 3, rep1[1]); ut.push(['inn i 2. etasje', inn1, pos(), etasje()]);
  // Prøv å hoppe over rekkverket på forsiden av 2. etasje
  gaaMot(0, g.HZ - 1.5); sp.hopp = true; for (let i = 0; i < 6; i++) { sp.inn = { x: 0, z: -1 }; EVNSteg(1 / 30); } for (let i = 0; i < 60; i++) { sp.inn = { x: 0, z: -1 }; EVNSteg(1 / 30); } sp.inn = { x: 0, z: 0 }; for (let i = 0; i < 30; i++) EVNSteg(1 / 30);
  ut.push(['hopp mot rekkverket', pos(), etasje()]);
  // Tilbake ut på repos 1, videre Rampe 2
  gaaMot(g.HX - 3, rep1[1]); gaaMot(rep1[0], rep1[1]);
  stopp = folg(S.repos[1][1] - 0.5, S.repos[2][0] + 1); ut.push(['rampe2', stopp, pos()]);
  const rep2 = S.p.find(q => q[3] >= (S.repos[2][0] + S.repos[2][1]) / 2);
  gaaMot(rep2[0], rep2[1]); const inn2 = gaaMot(-g.HX + 3, rep2[1]); ut.push(['inn i 3. etasje', inn2, pos(), etasje()]);
  gaaMot(rep2[0], rep2[1]);
  stopp = folg(S.repos[2][1] - 0.5, S.repos[3][0] + 1); ut.push(['rampe3', stopp, pos()]);
  const rep3 = S.p.find(q => q[3] >= (S.repos[3][0] + S.repos[3][1]) / 2);
  gaaMot(rep3[0], rep3[1]); const inn3 = gaaMot(rep3[0], g.HZ - 3); ut.push(['inn på takterrassen', inn3, pos(), etasje()]);
  // Gå bort fra kanten av takterrassen? Prøv å gå ut over bakkanten
  gaaMot(0, -g.HZ - 3, 120); ut.push(['mot bakkanten av takterrassen', pos(), etasje()]);
  return ut;
})()`);
console.log(JSON.stringify(res, null, 1)); console.log(feil.length ? feil : 'ingen feil');
// Rampeenden (QA c1ff190): gå mot enden av den øverste rampa rett fram og på skrå, med og uten hopp. Roboten skal aldri falle ned.
const evP = async x => { const r = await s('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600)); return r.result.result.value; };
const hj = await evP(`(async () => { const ut = [];
  for (const niva of [3, 6, 9]) for (const [hopp, grad, fart] of [[false, 0, 1], [false, 5, 1], [false, 10, 1], [false, 17, 1], [false, 31, 1], [false, -31, 1], [true, 5, 1], [true, 17, 1], [true, 31, 1], [false, 60, 0.5], [false, 80, 0.5], [false, 60, 0.25], [false, 70, 0.25], [false, 5, 0.25]]) {
    const vink = Math.tan(grad * Math.PI / 180);   // grader inn mot huset, også små vinkler og lav joystickfart (QA ef91746)
    EVNVis({ fane: 'spill', niva }); await new Promise(r => setTimeout(r, 200));
    const S = EVNSpor, sp = EVNSpill, R = EVNRobot(), b = EVNBane, E = niva >= 9 ? 3 : niva >= 6 ? 2 : 1; b.teta = 0;
    const pts = S.p.filter(q => q[3] <= S.del[E][1] + 0.01), q = pts[pts.length - 1], a = pts[pts.length - 6];
    const tx = q[0] - a[0], tz = q[1] - a[1], l = Math.hypot(tx, tz), ux = tx / l, uz = tz / l;
    R.position.set(a[0], a[4], a[1]); sp.paaBakken = true; for (let i = 0; i < 20; i++) EVNSteg(1 / 30);
    const fx = -Math.sin(b.teta), fz = -Math.cos(b.teta), rx = Math.cos(b.teta), rz = -Math.sin(b.teta);
    let dx = ux + uz * vink, dz = uz - ux * vink; const m = Math.hypot(dx, dz); dx /= m; dz /= m; let miny = 99;
    for (let i = 0; i < 150 / fart; i++) { sp.inn = { x: (dx * rx + dz * rz) * fart, z: (dx * fx + dz * fz) * fart }; if (hopp && i % 20 === 0) sp.hopp = true; EVNSteg(1 / 30); miny = Math.min(miny, R.position.y); }
    sp.inn = { x: 0, z: 0 }; for (let i = 0; i < 60; i++) EVNSteg(1 / 30);
    ut.push({ niva, hopp, grad, fart, miny: +miny.toFixed(2), fall: miny < q[4] - 1 });
  }
  // Langs husveggen innvendig forbi døråpningen øverst: ingen usynlig vegg skal stoppe roboten (QA ef91746)
  for (const niva of [3, 6, 9]) { EVNVis({ fane: 'spill', niva }); await new Promise(r => setTimeout(r, 200));
    const sp = EVNSpill, R = EVNRobot(), b = EVNBane, g = EVNGeo, E = niva >= 9 ? 3 : niva >= 6 ? 2 : 1, ap = EVNVei.apning[E], y = E * g.EH + g.DEKKE; b.teta = 0;
    for (const avst of [0.15, 0.3, 0.6]) {   // 0,1–0,3 m fra husveggen fanger usynlige veggstumper (QA be0615d)
    const langsX = ap.side === 'f' || ap.side === 'b', fast = { h: g.HX - avst, v: -g.HX + avst, f: g.HZ - avst, b: -g.HZ + avst }[ap.side];
    const fra = Math.min(ap.fra, ap.til) - 0.9, mal = Math.max(ap.fra, ap.til) + 0.9;   // ikke helt inn i hjørnet, der rampas innerkant går rundt husets hjørne
    if (langsX) R.position.set(fra, y, fast); else R.position.set(fast, y, fra); sp.paaBakken = true; for (let i = 0; i < 20; i++) EVNSteg(1 / 30);
    const fx = -Math.sin(b.teta), fz = -Math.cos(b.teta), rx = Math.cos(b.teta), rz = -Math.sin(b.teta), dx = langsX ? 1 : 0, dz = langsX ? 0 : 1;
    const pos = () => langsX ? R.position.x : R.position.z;
    for (let i = 0; i < 300 && mal - pos() > 0.3; i++) { sp.inn = { x: dx * rx + dz * rz, z: dx * fx + dz * fz }; EVNSteg(1 / 30); }
    sp.inn = { x: 0, z: 0 }; ut.push({ niva, innvendig: ap.side, avst, kom: mal - pos() <= 0.5, til: +pos().toFixed(2), fall: R.position.y < y - 1 });
    }
  }
  // Bakken ved foten av rampe 1: gå på tvers like bak starten. Ingen usynlig stump skal stoppe roboten (QA be0615d)
  { EVNVis({ fane: 'spill', niva: 3 }); await new Promise(r => setTimeout(r, 200)); const S = EVNSpor, sp = EVNSpill, R = EVNRobot(), b = EVNBane; b.teta = 0;
    const a = S.p[0], q = S.p[1], tx = q[0] - a[0], tz = q[1] - a[1], l = Math.hypot(tx, tz) || 1, nx = tz / l, nz = -tx / l, fx = -Math.sin(b.teta), fz = -Math.cos(b.teta), rx = Math.cos(b.teta), rz = -Math.sin(b.teta);
    for (const bak of [0.1, 0.3]) { const sx = a[0] - tx / l * bak - nx * 4, sz = a[1] - tz / l * bak - nz * 4; R.position.set(sx, 0, sz); sp.paaBakken = true;
      for (let i = 0; i < 120; i++) { sp.inn = { x: nx * rx + nz * rz, z: nx * fx + nz * fz }; EVNSteg(1 / 30); } sp.inn = { x: 0, z: 0 };
      ut.push({ rampefot: bak, kom: Math.hypot(R.position.x - sx, R.position.z - sz) > 6 }); } }
  // Vinkelrett ut mot ytterrekkverket fra sporpunkter i svingene, og nedover inne i glipen ved reposene (QA 41034b3)
  for (const niva of [6, 9]) { EVNVis({ fane: 'spill', niva }); await new Promise(r => setTimeout(r, 200));
    const S = EVNSpor, sp = EVNSpill, R = EVNRobot(), b = EVNBane, g = EVNGeo, E = niva >= 9 ? 3 : 2; b.teta = 0;
    const pts = S.p.filter(q => q[3] <= S.del[E][1] + 0.01), fx = -Math.sin(b.teta), fz = -Math.cos(b.teta), rx = Math.cos(b.teta), rz = -Math.sin(b.teta);
    const gaa = (x, y, z, dx, dz, fart, n, dt = 1 / 30) => { R.position.set(x, y, z); sp.paaBakken = true; let miny = 99; for (let i = 0; i < n; i++) { sp.inn = { x: (dx * rx + dz * rz) * fart, z: (dx * fx + dz * fz) * fart }; EVNSteg(dt); miny = Math.min(miny, R.position.y); } sp.inn = { x: 0, z: 0 }; return miny; };
    let fallUt = 0, n = 0;
    for (let i = 1; i < pts.length; i += 2) { const a = pts[i - 1], q = pts[i]; if (q[4] < 1.5) continue; const tx = q[0] - a[0], tz = q[1] - a[1], l = Math.hypot(tx, tz) || 1, nx = tz / l, nz = -tx / l;
      for (const fart of [0.15, 1]) { n++; if (gaa(q[0], q[4], q[1], -nx, -nz, fart, fart < 0.5 ? 120 : 45) < q[4] - 1) fallUt++; } }
    ut.push({ niva, ytterkant: n, fall: fallUt > 0, fallUt });
    let fallGlip = 0, ng = 0;
    for (const [ra, rb] of Object.values(S.repos)) { if (rb > S.del[E][1] + 0.01) continue;
      const i = pts.findIndex(q => q[3] >= ra + 0.5), a = pts[i - 1], q = pts[i], tx = q[0] - a[0], tz = q[1] - a[1], l = Math.hypot(tx, tz) || 1, nx = tz / l, nz = -tx / l;
      for (const inn of [0.05, 0.15, 0.3]) for (const fart of [0.25, 1]) for (const ret of [-1, 1]) for (const dt of [1 / 30, 1 / 20]) { ng++; if (gaa(q[0] + nx * (g.W / 2 + inn), q[4], q[1] + nz * (g.W / 2 + inn), ret * tx / l, ret * tz / l, fart, Math.round(3 / dt), dt) < q[4] - 1) fallGlip++; } }   // nedover og oppover i glipen, også når spillet går tregt (QA be0615d)
    ut.push({ niva, glip: ng, fall: fallGlip > 0, fallGlip });
  }
  return ut; })()`);
const falt = hj.filter(h => h.fall || h.kom === false);
console.log((falt.length ? 'FEIL ' : 'OK   ') + 'rampeenden og døråpningen: roboten faller ikke ned og stoppes ikke innvendig (' + hj.length + ' forsøk' + (falt.length ? ', fall: ' + JSON.stringify(falt) : '') + ')'); if (falt.length) process.exitCode = 1;
ws.close(); p.kill(); process.exit(process.exitCode || 0);
