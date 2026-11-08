/* Matdyr-regn – visuell prototype (fase 2, trinn 2). Ingen lagring, ingen statistikk, ingen E-coins. */
(function () {
  'use strict';
  const T = THREE, H = window.EVNHybrider, $ = id => document.getElementById(id);
  const LC = H.LC, M = H.M, mesh = H.mesh;
  const RAR = [['Common', '#9aa0a6'], ['Rare', '#34c759'], ['Epic', '#2f80ed'], ['Legendary', '#a855f7'], ['Mythic', '#ef4444']];
  const TOUCH = matchMedia('(pointer: coarse)').matches;
  const REDUSERT = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Renderer, scene og lys ----------
  const holder = $('scene');
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(TOUCH ? 1.5 : 2, devicePixelRatio || 1));
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  holder.appendChild(renderer.domElement);
  const scene = new T.Scene(); scene.background = LC('#bfe3f7'); scene.fog = new T.Fog(LC('#cfe9f7'), 80, 220);
  const camera = new T.PerspectiveCamera(42, 1, 0.05, 500);
  scene.add(new T.HemisphereLight(LC('#e8f6ff'), LC('#7fae5a'), 0.75));
  const sol = new T.DirectionalLight(LC('#fff2d8'), 1.25); sol.position.set(12, 22, 10); sol.castShadow = true;
  sol.shadow.mapSize.set(TOUCH ? 1024 : 2048, TOUCH ? 1024 : 2048); sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.03;
  Object.assign(sol.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 });
  scene.add(sol, sol.target);
  const fyll = new T.DirectionalLight(LC('#c9e2ff'), 0.35); fyll.position.set(-10, 8, -12); scene.add(fyll);

  // Bakke med gress
  const bakke = new T.Mesh(new T.CircleGeometry(160, 64), new T.MeshStandardMaterial({ color: LC('#7cc95a'), roughness: 0.95 }));
  bakke.rotation.x = -Math.PI / 2; bakke.receiveShadow = true; scene.add(bakke);

  // ---------- Sammenslåing: én mesh per materiale (færre tegnekall på mobil) ----------
  function slaSammen(rot) {
    rot.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(rot.matrixWorld).invert(), grupper = new Map();
    rot.traverse(o => {
      if (!o.isMesh) return;
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      if (!grupper.has(o.material)) grupper.set(o.material, []);
      grupper.get(o.material).push(g);
    });
    const ut = [];
    for (const [mat, geos] of grupper) {
      const n = geos.reduce((s, g) => s + g.attributes.position.count, 0), harUv = geos.every(g => g.attributes.uv);
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = harUv ? new Float32Array(n * 2) : null; let k = 0;
      for (const g of geos) { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (uv) uv.set(g.attributes.uv.array, k * 2); k += g.attributes.position.count; }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
      geo.computeBoundingSphere(); ut.push({ geo, mat });
    }
    return ut;
  }

  // ---------- Kamera som kan dras og zoomes ----------
  const bane = { mal: new T.Vector3(0, 1, 0), teta: 0.6, fi: 1.15, r: 7, rMin: 1.5, rMax: 60, auto: false };
  function oppdaterKamera() {
    bane.fi = Math.max(0.15, Math.min(1.5, bane.fi)); bane.r = Math.max(bane.rMin, Math.min(bane.rMax, bane.r));
    camera.position.set(bane.mal.x + bane.r * Math.sin(bane.fi) * Math.sin(bane.teta), bane.mal.y + bane.r * Math.cos(bane.fi), bane.mal.z + bane.r * Math.sin(bane.fi) * Math.cos(bane.teta));
    camera.lookAt(bane.mal);
  }
  const fingre = new Map(); let knip0 = 0, r0 = 0;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { fingre.set(e.pointerId, [e.clientX, e.clientY]); el.setPointerCapture(e.pointerId); if (fingre.size === 2) { const [a, b] = [...fingre.values()]; knip0 = Math.hypot(a[0] - b[0], a[1] - b[1]); r0 = bane.r; } bane.auto = false; synkKnapper(); });
  el.addEventListener('pointermove', e => {
    if (!fingre.has(e.pointerId)) return; const forrige = fingre.get(e.pointerId); fingre.set(e.pointerId, [e.clientX, e.clientY]);
    if (fingre.size === 1) { bane.teta -= (e.clientX - forrige[0]) * 0.008; bane.fi -= (e.clientY - forrige[1]) * 0.006; }
    else if (fingre.size === 2) { const [a, b] = [...fingre.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (knip0 > 0) bane.r = r0 * knip0 / Math.max(20, d); }
  });
  const slipp = e => { fingre.delete(e.pointerId); if (fingre.size < 2) knip0 = 0; };
  el.addEventListener('pointerup', slipp); el.addEventListener('pointercancel', slipp);
  el.addEventListener('wheel', e => { e.preventDefault(); bane.r *= 1 + Math.sign(e.deltaY) * 0.1; }, { passive: false });

  // ---------- EVN-roboten v2 (samme som i spillet, 3,0 høy) ----------
  let robotMal = null, robotMixer = null;
  const robotKlar = new Promise(ok => {
    try {
      const bin = atob(window.EVN_ROBOT_GLB), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      new T.GLTFLoader().parse(u.buffer, '', gl => {
        const m = gl.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material && o.material.name === 'Main') o.material.color.setHex(0xffcc00).convertSRGBToLinear(); } });
        const b = new T.Box3().setFromObject(m), k = 3.0 / (b.max.y - b.min.y); m.scale.setScalar(k); m.position.y = -b.min.y * k;
        robotMal = { m, anim: gl.animations };
        robotMixer = new T.AnimationMixer(m); const idle = gl.animations.find(a => a.name === 'Idle'); if (idle) robotMixer.clipAction(idle).play();
        ok();
      }, () => ok());
    } catch (e) { ok(); }
  });
  function lagRobot() {
    if (!robotMal) { const g = new T.Group(); g.add(mesh(new T.BoxGeometry(1.2, 2.4, 0.9), M('#ffcc00', 0.5), 0, 1.5, 0)); return { g, mixer: null }; }
    // Animert modell kan ikke klones trygt i r128-kjernen. Bare én robot vises om gangen, så den samme flyttes mellom visningene.
    const g = new T.Group(); g.add(robotMal.m); return { g, mixer: robotMixer };
  }

  // ---------- Felles: plassplate som i spillet ----------
  const plateGeo = new T.BoxGeometry(1, 1, 1);
  function plate(farge = '#c99a5b', kant = null) {
    const g = new T.Group();
    g.add(mesh(plateGeo, M('#8b5a2b', 0.85), 0, 0.15, 0, 3.3, 0.3, 3.3));
    g.add(mesh(plateGeo, M(farge, 0.8), 0, 0.31, 0, 3.0, 0.04, 3.0));
    if (kant) for (const [x, z, sx, sz] of [[0, 1.52, 3.1, 0.12], [0, -1.52, 3.1, 0.12], [1.52, 0, 0.12, 3.1], [-1.52, 0, 0.12, 3.1]]) g.add(mesh(plateGeo, M(kant, 0.4, { emissive: LC(kant), emissiveIntensity: 0.25 }), x, 0.36, z, sx, 0.06, sz));
    return g;
  }

  // =====================================================================
  // ======================  FANE 1: MATDYR  ==============================
  // =====================================================================
  const NOKLER = ['donutku', 'burgersau', 'pizzaskilpadde', 'croissantrev', 'iskatt'];
  const INFO = {
    donutku: 'Kroppen er en donut. Rosa glasur renner nedover, med strøssel på toppen. Kuhode, horn, bjelle og hale.',
    burgersau: 'Kroppen er en burger i lag: brød, ost, salat, tomat og kjøtt. Kanten på brødet er sauens ull.',
    pizzaskilpadde: 'Skallet er en pizza: ost som renner over skorpa, pepperoni, basilikum og skivestreker.',
    croissantrev: 'Halen er en croissant med buede ledd, og ryggen har samme striper. Stilprøve: croissant finnes ikke blant de 25 matvarene i spillet.',
    iskatt: 'Kroppen er iskuler: mint med sjokobiter, et vaniljehode med sjokolade som renner, kirsebær og en vaffelhale.'
  };
  const md = { gruppe: new T.Group(), valgt: 'donutku', fig: null, visning: 'forfra', gaar: false, alle: [] };
  scene.add(md.gruppe);
  let robotIMd = null, plateIMd = null;

  function byggFigur(nokkel) {
    const f = H.lag[nokkel](); f.nokkel = nokkel; return f;
  }
  function visMatdyr() {
    md.gruppe.clear(); md.alle = [];
    const spill = md.visning === 'spill', alle = md.visning === 'alle';
    if (alle) {
      NOKLER.forEach((n, i) => { const f = byggFigur(n), s = H.spillSkala(f); f.g.scale.setScalar(s); const holderG = new T.Group(); holderG.add(f.g); holderG.position.set((i - 2) * 4.2, 0, 0); md.gruppe.add(holderG); md.alle.push(f); });
      const r = lagRobot(); r.g.position.set(-12.5, 0, 0); r.g.rotation.y = 0.5; md.gruppe.add(r.g);
    } else {
      const f = byggFigur(md.valgt); md.fig = f; md.alle.push(f);
      if (spill) {
        const p = plate('#d3b07a', RAR[f.sj][1]); md.gruppe.add(p);
        f.g.scale.setScalar(H.spillSkala(f)); f.g.position.y = 0.33; md.gruppe.add(f.g);
        // Nabo-plass og roboten ved siden av, slik det ser ut i basen
        const p2 = plate('#d3b07a'); p2.position.x = 4; md.gruppe.add(p2);
        const r = lagRobot(); r.g.position.set(-3.2, 0, 1.2); r.g.rotation.y = 0.6; md.gruppe.add(r.g);
      } else {
        md.gruppe.add(f.g);
      }
    }
    settKameraMatdyr();
    visKortMatdyr();
  }
  function settKameraMatdyr() {
    const v = md.visning;
    bane.mal.set(0, 0.55, 0); bane.rMin = 1.2; bane.rMax = 60;
    if (v === 'forfra') Object.assign(bane, { teta: 0.35, fi: 1.22, r: 5.8 });
    if (v === 'siden') Object.assign(bane, { teta: Math.PI / 2, fi: 1.3, r: 5.4 });
    if (v === 'bak') Object.assign(bane, { teta: Math.PI - 0.5, fi: 1.2, r: 5.4 });
    if (v === 'oppe') Object.assign(bane, { teta: 0.2, fi: 0.3, r: 5.2 });
    if (v === 'naert') { const h = md.fig && md.fig.hode; const p = new T.Vector3(); if (h) h.getWorldPosition(p); bane.mal.copy(p); Object.assign(bane, { teta: 0.25, fi: 1.35, r: 1.8 }); }
    if (v === 'spill') { // samme vinkel og avstand som spillets kamera (bak og over, 0/13/15 liggende, 0/19/18 stående)
      const hoy = holder.classList.contains('ramme') || innerHeight > innerWidth;
      bane.mal.set(-1, 1.2, 0); const off = hoy ? new T.Vector3(0, 19, 18) : new T.Vector3(0, 13, 15);
      Object.assign(bane, { teta: 0, fi: Math.atan2(off.z, off.y), r: off.length() });
    }
    if (v === 'alle') { bane.mal.set(-1.5, 1.2, 0); Object.assign(bane, { teta: 0.15, fi: 1.2, r: 20 }); }
    // Stående skjerm: lenger unna, så hele figuren får plass over knappene
    if (v !== 'spill' && camera.aspect < 1) { bane.r *= 1.0 + 0.9 * (1 - camera.aspect); bane.mal.y -= 0.35; }
    oppdaterKamera();
  }
  function visKortMatdyr() {
    if (md.visning === 'alle') { $('kort').innerHTML = '<h1>Alle fem</h1>I spillstørrelse ved siden av EVN-roboten. Størrelsen følger sjeldenheten, som i spillet.<div class="liten">Dra for å snu. Hjul eller to fingre for å zoome.</div>'; return; }
    const f = md.fig, [rn, rc] = RAR[f.sj];
    $('kort').innerHTML = '<h1>' + f.navn + '</h1><div><span class="sj" style="color:' + rc + '">' + rn + '</span> · ' + f.mat + ' + ' + f.dyr + (f.ci != null ? ' · ID ' + f.ci : '') + '</div><div>' + INFO[f.nokkel] + '</div><div class="liten">Dra for å snu. Hjul eller to fingre for å zoome.</div>';
  }

  // =====================================================================
  // ======================  FANE 2: GÅRDEN  ==============================
  // =====================================================================
  const NIVA = [null,
    { tak: 8, nytt: 'Startgård: én etasje og enkel låve' },
    { tak: 12, nytt: 'Større grunnflate og gjerde rundt tunet' },
    { tak: 16, nytt: 'Etasje 2 med bred rampe' },
    { tak: 20, nytt: 'Hønsehus og høyere silo' },
    { tak: 24, nytt: 'Større låve og vindmølle' },
    { tak: 28, nytt: 'Etasje 3 med ny rampe' },
    { tak: 32, nytt: 'Drivhus og frukthage' },
    { tak: 36, nytt: 'Utsiktstårn og lykter i låven' },
    { tak: 40, nytt: 'Takterrasse med 4 gullplasser og flagg' },
    { tak: 40, nytt: 'Storgård: gullkanter og vimpler' }];
  const gd = { gruppe: new T.Group(), niva: 3, neste: true, gjennom: true, figurInst: null };
  scene.add(gd.gruppe);
  const DX = 4.2, DZ = 4.4, EH = 5.6;                       // avstand mellom plasser, etasjehøyde
  const BX = 4 * DX + 1.2, BZ = 3 * DZ + 1.2;               // gulvflate per etasje (4 × 3 plasser)
  function planker() {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const x = cv.getContext('2d');
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#b07a45' : '#a46d3b'; x.fillRect(0, i * 32, 256, 32); x.fillStyle = 'rgba(70,40,15,.35)'; x.fillRect(0, i * 32, 256, 2); x.fillRect((i * 97) % 256, i * 32, 2, 32); }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 3); t.encoding = T.sRGBEncoding; return t;
  }
  const plankeMat = new T.MeshStandardMaterial({ map: planker(), roughness: 0.85 });
  const ROD = '#b8382f', HVIT = '#f6f1e6';
  function boks(g, w, h, d, x, y, z, mat) { const m = mesh(plateGeo, typeof mat === 'string' ? M(mat, 0.75) : mat, x, y, z, w, h, d); g.add(m); return m; }

  // ---- Én sammenhengende vei opp: ramper rundt bygningen med reposer ved hjørnene ----
  // Rampe 1 langs høyre side (bakken → etasje 2), rampe 2 langs baksiden (→ etasje 3) og rampe 3 langs venstre side
  // (→ takterrassen). Hver rampe ender på en repos. Neste rampe starter fra samme repos, og reposen har en åpning
  // i rekkverket inn til etasjen.
  const W = 3.4, HX = BX / 2, HZ = BZ / 2, DEKKE = 0.45;
  const VEI = {
    // etasje nr: åpning i rekkverket (side og intervall langs siden)
    apning: { 1: { side: 'h', fra: -HZ, til: -HZ + W }, 2: { side: 'v', fra: -HZ, til: -HZ + W }, 3: { side: 'f', fra: -HX, til: -HX + W } },
    // reposer: [xmin, xmax, zmin, zmax, etasje]
    repos: { 1: [HX, HX + W, -HZ - W, -HZ + W, 1], 2: [-HX - W, -HX, -HZ - W, -HZ + W, 2], 3: [-HX - W, -HX + W, HZ, HZ + W, 3] },
    // ramper: fra (x, z, etasje) til (x, z, etasje), bredde W, langs akse
    rampe: {
      1: { akse: 'z', x: HX + W / 2, fra: HZ + 2.6, til: -HZ + W, e0: 0, e1: 1, ytre: 1 },
      2: { akse: 'x', z: -HZ - W / 2, fra: HX, til: -HX, e0: 1, e1: 2, ytre: -1 },
      3: { akse: 'z', x: -HX - W / 2, fra: -HZ + W, til: HZ, e0: 2, e1: 3, ytre: -1 }
    }
  };
  function rekkverk(e, x0, z0, x1, z1, y = 0) {
    const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.3) return; const n = Math.max(1, Math.round(L / 1.6));
    for (let i = 0; i <= n; i++) { const t = i / n; boks(e, 0.14, 1.0, 0.14, x0 + (x1 - x0) * t, y + 0.95, z0 + (z1 - z0) * t, HVIT); }
    const r = boks(e, L, 0.12, 0.12, (x0 + x1) / 2, y + 1.45, (z0 + z1) / 2, HVIT); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  }
  // Rekkverk langs en side, med en eventuell åpning [fra, til] langs siden
  function sideMedApning(e, side, ap) {
    const linje = { f: [-HX, HZ, HX, HZ, 'x'], b: [-HX, -HZ, HX, -HZ, 'x'], v: [-HX, -HZ, -HX, HZ, 'z'], h: [HX, -HZ, HX, HZ, 'z'] }[side];
    const [x0, z0, x1, z1, ak] = linje;
    if (!ap || ap.side !== side) return rekkverk(e, x0, z0, x1, z1);
    if (ak === 'x') { rekkverk(e, x0, z0, ap.fra, z0); rekkverk(e, ap.til, z0, x1, z1); }
    else { rekkverk(e, x0, z0, x0, ap.fra); rekkverk(e, x0, ap.til, x1, z1); }
  }
  function etasje(g, nr) {
    const y = nr * EH, e = new T.Group(); e.position.y = y; e.userData.etasje = nr; g.add(e);
    boks(e, BX, DEKKE, BZ, 0, DEKKE / 2, 0, plankeMat);
    if (nr > 0) {
      for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) boks(e, 0.5, EH - DEKKE, 0.5, sx * (HX - 0.25), -(EH - DEKKE) / 2, sz * (HZ - 0.25), ROD);
      for (const sx of [-1, 1]) for (const d of [-1, 1]) { const k = boks(e, 0.18, Math.hypot(BZ, EH) * 0.92, 0.18, sx * (HX - 0.1), -EH / 2 + 0.2, 0, HVIT); k.rotation.x = d * Math.atan2(BZ, EH); }
      boks(e, BX + 0.2, 0.35, 0.35, 0, -0.05, HZ, HVIT); boks(e, BX + 0.2, 0.35, 0.35, 0, -0.05, -HZ, HVIT);
      const ap = VEI.apning[nr];
      for (const side of ['f', 'b', 'v', 'h']) sideMedApning(e, side, ap);
    }
    return e;
  }
  // Skilt med tekst (lerret) på en stolpe
  function skilt(g, tekst, x, y, z, roty) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const c = cv.getContext('2d');
    c.fillStyle = '#7a4a22'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#f6f1e6'; c.fillRect(6, 6, 244, 84);
    c.fillStyle = '#3a2210'; c.font = 'bold 40px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tekst, 128, 50);
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding;
    const s = new T.Group(); s.position.set(x, y, z); s.rotation.y = roty; g.add(s);
    s.add(mesh(new T.CylinderGeometry(0.08, 0.08, 2.2, 8), M('#7a4a22', 0.8), 0, 1.1, 0));
    const tavle = new T.Mesh(new T.PlaneGeometry(1.9, 0.72), new T.MeshStandardMaterial({ map: t, roughness: 0.8, side: T.DoubleSide })); tavle.position.y = 2.1; s.add(tavle);
  }
  function repos(g, nr) {
    const [x0, x1, z0, z1, e] = VEI.repos[nr], y = e * EH, r = new T.Group(); r.userData.etasje = e; g.add(r);
    boks(r, x1 - x0, DEKKE, z1 - z0, (x0 + x1) / 2, y + DEKKE / 2, (z0 + z1) / 2, plankeMat);
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) boks(r, 0.35, y, 0.35, x + (x === x0 ? 0.2 : -0.2), y / 2, z + (z === z0 ? 0.2 : -0.2), ROD);
    // Rekkverk på de ytterste kantene (bort fra bygningen)
    const ytreX = Math.abs(x0) > Math.abs(x1) ? x0 : x1, ytreZ = Math.abs(z0) > Math.abs(z1) ? z0 : z1;
    rekkverk(r, ytreX, z0, ytreX, z1, y); rekkverk(r, x0, ytreZ, x1, ytreZ, y);
    return r;
  }
  function rampe(g, nr) {
    const R = VEI.rampe[nr], y0 = R.e0 * EH + (R.e0 ? DEKKE : 0.05), y1 = R.e1 * EH + DEKKE, L = Math.abs(R.til - R.fra), rr = new T.Group(); g.add(rr);
    const helning = Math.atan2(y1 - y0, L), lengde = Math.hypot(L, y1 - y0), midt = (R.fra + R.til) / 2, ym = (y0 + y1) / 2 - 0.12;
    const d = R.akse === 'z' ? boks(rr, W, 0.25, lengde, R.x, ym, midt, plankeMat) : boks(rr, lengde, 0.25, W, midt, ym, R.z, plankeMat);
    if (R.akse === 'z') d.rotation.x = Math.sign(R.fra - R.til) * helning; else d.rotation.z = Math.sign(R.til - R.fra) * helning;
    // Tverrlister så rampa ser gripevennlig ut
    const n = Math.round(L / 0.9);
    for (let i = 1; i < n; i++) { const t = i / n, p = R.fra + (R.til - R.fra) * t, yy = y0 + (y1 - y0) * t + 0.03; if (R.akse === 'z') boks(rr, W - 0.2, 0.06, 0.12, R.x, yy, p, '#8b5a2b'); else boks(rr, 0.12, 0.06, W - 0.2, p, yy, R.z, '#8b5a2b'); }
    // Stolper og rekkverk på yttersiden, stolper også på innsiden
    const ytre = R.akse === 'z' ? R.x + R.ytre * (W / 2 - 0.1) : R.z + R.ytre * (W / 2 - 0.1);
    const indre = R.akse === 'z' ? R.x - R.ytre * (W / 2 - 0.1) : R.z - R.ytre * (W / 2 - 0.1);
    const m = Math.max(3, Math.round(L / 2.6));
    for (let i = 0; i <= m; i++) {
      const t = i / m, p = R.fra + (R.til - R.fra) * t, yy = y0 + (y1 - y0) * t;
      for (const q of [ytre, indre]) if (yy > 0.5) { const [x, z] = R.akse === 'z' ? [q, p] : [p, q]; boks(rr, 0.3, yy - 0.1, 0.3, x, (yy - 0.1) / 2, z, ROD); }
      const [x, z] = R.akse === 'z' ? [ytre, p] : [p, ytre]; boks(rr, 0.12, 1.0, 0.12, x, yy + 0.6, z, HVIT);
    }
    const rail = R.akse === 'z' ? boks(rr, 0.12, 0.12, lengde, ytre, ym + 1.2, midt, HVIT) : boks(rr, lengde, 0.12, 0.12, midt, ym + 1.2, ytre, HVIT);
    if (R.akse === 'z') rail.rotation.x = d.rotation.x; else rail.rotation.z = d.rotation.z;
    // Skilt ved foten av rampa
    const navn = { 1: 'Etasje 2 ⬆', 2: 'Etasje 3 ⬆', 3: 'Takterrasse ⬆' }[nr];
    const [sx, sz] = R.akse === 'z' ? [R.x + R.ytre * (W / 2 + 0.6), R.fra + Math.sign(R.til - R.fra) * 0.6] : [R.fra + Math.sign(R.til - R.fra) * 0.8, R.z + R.ytre * (W / 2 + 0.6)];
    skilt(rr, navn, sx, R.e0 * EH + (R.e0 ? DEKKE : 0), sz, R.akse === 'z' ? (R.fra > R.til ? 0 : Math.PI) : (R.fra > R.til ? Math.PI / 2 : -Math.PI / 2));
    return rr;
  }
  // Bygg på tunet
  function silo(g, hoy, x, z) { const s = new T.Group(); s.position.set(x, 0, z); g.add(s); s.add(mesh(new T.CylinderGeometry(1.6, 1.6, hoy, 24), M('#d9d4c7', 0.6), 0, hoy / 2, 0)); s.add(mesh(new T.SphereGeometry(1.65, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(ROD, 0.5), 0, hoy, 0)); for (let i = 1; i < hoy / 2; i++) s.add(mesh(new T.TorusGeometry(1.62, 0.05, 6, 32).rotateX(Math.PI / 2), M('#9a9488', 0.6), 0, i * 2, 0)); }
  function lave(g, stor, x, z) { const l = new T.Group(); l.position.set(x, 0, z); g.add(l); const w = stor ? 9 : 6, h = stor ? 6 : 4.2, d = stor ? 7 : 5; boks(l, w, h, d, 0, h / 2, 0, ROD); const tak = new T.CylinderGeometry(0.01, w * 0.62, h * 0.55, 4, 1); const t = mesh(tak, M('#5a3a2e', 0.7), 0, h + h * 0.27, 0, 1, 1, d / w * 1.25); t.rotation.y = Math.PI / 4; l.add(t); boks(l, w * 0.42, h * 0.62, 0.1, 0, h * 0.31, d / 2 + 0.05, HVIT); boks(l, w * 0.34, h * 0.52, 0.12, 0, h * 0.27, d / 2 + 0.08, '#7a2a24'); }
  function honsehus(g, x, z) { const l = new T.Group(); l.position.set(x, 0, z); g.add(l); boks(l, 3.2, 2.2, 2.6, 0, 1.1, 0, '#e7c879'); const t = mesh(new T.ConeGeometry(2.5, 1.4, 4), M(ROD, 0.6), 0, 2.9, 0); t.rotation.y = Math.PI / 4; l.add(t); boks(l, 0.8, 1.0, 0.1, 0, 0.6, 1.32, '#5a3a2e'); }
  function molle(g, x, z, t0) { const m = new T.Group(); m.position.set(x, 0, z); g.add(m); m.add(mesh(new T.CylinderGeometry(1.0, 1.7, 7, 8), M(HVIT, 0.7), 0, 3.5, 0)); m.add(mesh(new T.ConeGeometry(1.4, 1.6, 8), M(ROD, 0.6), 0, 7.8, 0)); const v = new T.Group(); v.position.set(0, 6.4, 1.2); m.add(v); for (let i = 0; i < 4; i++) { const b = boks(v, 0.45, 4.6, 0.08, 0, 0, 0, '#d9c49b'); b.geometry = plateGeo; b.rotation.z = i * Math.PI / 2; b.translateY(2.3); } m.userData.vinge = v; m.userData.ikkeFlett = true; return m; }
  function drivhus(g, x, z) { const d = new T.Group(); d.position.set(x, 0, z); g.add(d); boks(d, 5, 0.4, 3.4, 0, 0.2, 0, '#8b5a2b'); const glass = new T.MeshStandardMaterial({ color: LC('#cfefff'), roughness: 0.1, transparent: true, opacity: 0.35 }); boks(d, 5, 2.4, 3.4, 0, 1.6, 0, glass); for (let i = 0; i < 5; i++) d.add(mesh(new T.SphereGeometry(0.35, 10, 8), M(['#ff6b6b', '#ffd23f', '#7ad66b'][i % 3], 0.6), -2 + i, 0.9, 0)); }
  function taarn(g, x, z) { const t = new T.Group(); t.position.set(x, 0, z); g.add(t); for (const sx of [-1, 1]) for (const sz of [-1, 1]) boks(t, 0.3, 9, 0.3, sx * 1.1, 4.5, sz * 1.1, '#8b5a2b'); boks(t, 3, 0.3, 3, 0, 9, 0, plankeMat); const tk = mesh(new T.ConeGeometry(2.3, 1.8, 4), M(ROD, 0.6), 0, 10.8, 0); tk.rotation.y = Math.PI / 4; t.add(tk); }
  function gjerde(g, w, d) { const n = 34; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const x = Math.cos(a) * w, z = Math.sin(a) * d; boks(g, 0.2, 1.1, 0.2, x, 0.55, z, HVIT); } const kurve = new T.CatmullRomCurve3(Array.from({ length: 48 }, (_, i) => { const a = i / 48 * Math.PI * 2; return new T.Vector3(Math.cos(a) * w, 0.95, Math.sin(a) * d); }), true); const ring = new T.Mesh(new T.TubeGeometry(kurve, 160, 0.07, 6, true), M(HVIT, 0.7)); ring.castShadow = true; g.add(ring); }
  function flagg(g, x, y, z, farge) { g.add(mesh(new T.CylinderGeometry(0.07, 0.07, 4, 8), M('#dddddd', 0.4), x, y + 2, z)); const f = mesh(new T.PlaneGeometry(1.8, 1.1), M(farge, 0.6, { side: T.DoubleSide }), x + 0.95, y + 3.4, z); g.add(f); return f; }

  // Plasser: indeks i = etasje floor(i/12), rad og kolonne innenfor etasjen (samme indeks som `base` i lagringen)
  function plassPos(i) { const e = Math.floor(i / 12), j = i % 12, kol = j % 4, rad = Math.floor(j / 4); return new T.Vector3((kol - 1.5) * DX, e * EH + 0.45, (rad - 1) * DZ); }
  function takPlass(k) { return new T.Vector3((k - 1.5) * DX, 3 * EH + 0.45, 0); }

  // Matdyr på plassene: instansert per figur og materiale, så 40 dyr koster få tegnekall
  let figurDeler = null;
  function lagFigurDeler() {
 H.DET.v = 0.5;
    figurDeler = NOKLER.map(n => { const f = H.lag[n](); const s = H.spillSkala(f); f.g.scale.setScalar(s); const rot = new T.Group(); rot.add(f.g); return { deler: slaSammen(rot), sj: f.sj }; });
    H.DET.v = 1;
  }
  function byggGard() {
    gd.gruppe.clear(); const g = gd.gruppe, n = gd.niva, ghost = new T.Group(); g.add(ghost);
    const skal = (nv, fn) => { if (n >= nv) fn(g); else if (gd.neste && nv === n + 1) { fn(ghost); } };
    // Tunet
    gjerde(g, n >= 2 ? 30 : 22, n >= 2 ? 22 : 16);
    lave(g, n >= 5, -BX / 2 - 9, -6); silo(g, n >= 4 ? 11 : 7, -BX / 2 - 9, 5);
    skal(4, gg => honsehus(gg, BX / 2 + 7, 10));
    skal(5, gg => { gd.molle = molle(gg, BX / 2 + 9, -9); });
    skal(7, gg => drivhus(gg, -6, 15));
    skal(8, gg => taarn(gg, -BX / 2 - 15, 14));
    // Selve gårdsbygningen
    etasje(g, 0);
    skal(3, gg => { etasje(gg, 1); rampe(gg, 1); repos(gg, 1); });
    skal(6, gg => { etasje(gg, 2); rampe(gg, 2); repos(gg, 2); });
    skal(9, gg => { etasje(gg, 3); rampe(gg, 3); repos(gg, 3); flagg(gg, HX - 0.5, 3 * EH + DEKKE, -HZ + 0.5, '#2f80ed'); });
    if (n >= 10) { for (let e = 1; e <= 3; e++) boks(g, BX + 0.6, 0.25, BZ + 0.6, 0, e * EH + 0.05, 0, M('#ffd23f', 0.3, { metalness: 0.5 })); for (let i = 0; i < 8; i++) flagg(g, (i - 3.5) * 2.2, 3 * EH + 1.2, BZ / 2 + 0.3, ['#ff5e5e', '#ffd23f', '#54c7ff', '#7ad66b'][i % 4]).scale.set(0.4, 0.6, 1); }
    // Faste deler slås sammen per materiale (etasje for etasje), så hele gården koster få tegnekall
    const flett = forelder => [...forelder.children].forEach(c => {
      if (!c.isGroup || c === ghost || c.userData.ikkeFlett) return;
      const ny = new T.Group(); ny.position.copy(c.position); ny.rotation.copy(c.rotation); ny.userData = c.userData;
      c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.updateMatrixWorld(true);
      const tmp = new T.Group(); tmp.add(c); for (const { geo, mat } of slaSammen(tmp)) { const m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; ny.add(m); }
      forelder.add(ny);
    });
    flett(g); flett(ghost);
    // Gjennomsiktige deler for neste nivå
    ghost.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.28; o.material.depthWrite = false; o.castShadow = false; } });
    // Plasser og matdyr
    const tak = NIVA[n].tak, etasjer = n >= 9 ? 3 : n >= 6 ? 3 : n >= 3 ? 2 : 1, antPlasser = Math.min(etasjer * 12, n >= 9 ? 36 : etasjer * 12);
    const plassMatAapen = M('#d3b07a', 0.8), plassMatLaast = M('#7d7d7d', 0.9);
    const plasser = []; for (let i = 0; i < antPlasser; i++) plasser.push(plassPos(i)); if (n >= 9) for (let k = 0; k < 4; k++) plasser.push(takPlass(k));
    const aapne = Math.min(tak, plasser.length);
    const plateInst = new T.InstancedMesh(plateGeo, plassMatAapen, aapne), laastInst = new T.InstancedMesh(plateGeo, plassMatLaast, Math.max(0, plasser.length - aapne));
    const m4 = new T.Matrix4(), q = new T.Quaternion(), sk = new T.Vector3(3.2, 0.2, 3.2);
    plasser.forEach((p, i) => { m4.compose(new T.Vector3(p.x, p.y + 0.1, p.z), q, sk); if (i < aapne) plateInst.setMatrixAt(i, m4); else laastInst.setMatrixAt(i - aapne, m4); });
    plateInst.receiveShadow = laastInst.receiveShadow = true; g.add(plateInst, laastInst);
    // Fyll de åpne plassene med matdyr (de fem figurene om hverandre)
    if (!figurDeler) lagFigurDeler();
    const per = NOKLER.map(() => []); for (let i = 0; i < aapne; i++) per[i % 5].push(i);
    figurDeler.forEach((fd, k) => {
      const ids = per[k]; if (!ids.length) return;
      for (const { geo, mat } of fd.deler) {
        const inst = new T.InstancedMesh(geo, mat, ids.length);
        ids.forEach((pi, j) => { const p = plasser[pi]; m4.compose(new T.Vector3(p.x, p.y + 0.2, p.z), new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), ((pi * 37) % 7 - 3) * 0.18), new T.Vector3(1, 1, 1)); inst.setMatrixAt(j, m4); });
        inst.castShadow = true; inst.receiveShadow = true; inst.userData.etasje = Math.floor(ids[0] / 12); g.add(inst);
      }
    });
    // Roboten på bakkeplanet ved rampa
    const r = lagRobot(); r.g.userData.ikkeFlett = true; r.g.position.set(HX + W / 2, 0, HZ + 4.6); r.g.rotation.y = Math.PI; g.add(r.g);   // ved foten av rampe 1
    // Etasjer over roboten gjøres gjennomsiktige
    if (gd.gjennom) g.traverse(o => { if (!o.isMesh) return; let p = o; while (p && p.userData.etasje === undefined) p = p.parent; const e = p ? p.userData.etasje : 0; if (e >= 1 && !(o.material.opacity < 0.3)) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.45; o.material.depthWrite = false; } });
    visKortGard(aapne, plasser.length);
  }
  function visKortGard(aapne, alle) {
    const n = gd.niva, neste = NIVA[n + 1];
    $('kort').innerHTML = '<h1>Gårdsnivå ' + n + (n === 10 ? ' (maks)' : '') + '</h1><div>' + NIVA[n].nytt + '.</div><div>🐮 ' + aapne + ' matdyrplasser' + (alle > aapne ? ' (' + (alle - aapne) + ' grå kan kjøpes senere)' : '') + '</div>' +
      (neste && gd.neste ? '<div class="liten">Gjennomsiktig: neste nivå, ' + neste.nytt.toLowerCase() + '.</div>' : '') + '<div class="liten">Dra for å snu. Hjul eller to fingre for å zoome.</div>';
  }
  function settKameraGard() { bane.mal.set(0, 4, 0); bane.rMin = 8; bane.rMax = 140; Object.assign(bane, { teta: 0.75, fi: 1.05, r: (gd.niva >= 6 ? 62 : 52) * (camera.aspect < 1 ? 1.7 : 1) }); oppdaterKamera(); }

  // =====================================================================
  // ======================  Knapper og fanevalg  =========================
  // =====================================================================
  let fane = 'matdyr';
  function knapp(tekst, trykket, fn, tittel) { const b = document.createElement('button'); b.type = 'button'; b.textContent = tekst; b.setAttribute('aria-pressed', String(!!trykket)); if (tittel) { b.title = tittel; b.setAttribute('aria-label', tittel); } b.addEventListener('click', fn); return b; }
  function synkKnapper() { if (fane === 'matdyr') byggPanelMatdyr(); }
  function byggPanelMatdyr() {
    const p = $('panel'); p.textContent = '';
    const r1 = document.createElement('div'); r1.className = 'rad';
    const smal = innerWidth < 640;
    const navn = { donutku: ['🍩', 'Donutku'], burgersau: ['🍔', 'Burgersau'], pizzaskilpadde: ['🍕', 'Pizzaskilpadde'], croissantrev: ['🥐', 'Croissantrev'], iskatt: ['🍦', 'Iskatt'] };
    NOKLER.forEach(n => { const b = knapp(smal ? navn[n][0] : navn[n].join(' '), md.visning !== 'alle' && md.valgt === n, () => { md.valgt = n; if (md.visning === 'alle') md.visning = 'forfra'; visMatdyr(); byggPanelMatdyr(); }); b.setAttribute('aria-label', navn[n][1]); if (smal) b.style.fontSize = '22px'; r1.appendChild(b); });
    r1.appendChild(knapp('👥 Alle', md.visning === 'alle', () => { md.visning = 'alle'; visMatdyr(); byggPanelMatdyr(); }));
    const r2 = document.createElement('div'); r2.className = 'rad';
    [['forfra', 'Forfra', 'Forfra'], ['siden', 'Siden', 'Side'], ['bak', 'Bakfra', 'Bak'], ['oppe', 'Ovenfra', 'Topp'], ['naert', '🔍 Nært', '🔍'], ['spill', '🤖 I spillet', '🤖']].forEach(([v, t, k]) => r2.appendChild(knapp(smal ? k : t, md.visning === v, () => { if (md.visning === 'alle') md.visning = v, visMatdyr(); else { const bytt = (v === 'spill') !== (md.visning === 'spill'); md.visning = v; bytt ? visMatdyr() : settKameraMatdyr(); } byggPanelMatdyr(); }, t.replace(/^\S+ /u, '').trim() || t)));
    r2.appendChild(knapp(smal ? '🔄' : '🔄 Snurr', bane.auto, () => { bane.auto = !bane.auto; byggPanelMatdyr(); }, 'Snurr'));
    r2.appendChild(knapp(smal ? '🚶' : '🚶 Gå', md.gaar, () => { md.gaar = !md.gaar; byggPanelMatdyr(); }, 'Gå'));
    if (!TOUCH) r2.appendChild(knapp('📱 Mobil', holder.classList.contains('ramme'), () => { holder.classList.toggle('ramme'); storrelse(); settKameraMatdyr(); byggPanelMatdyr(); }, 'Vis som på en mobilskjerm'));
    p.append(r1, r2);
  }
  function byggPanelGard() {
    const p = $('panel'); p.textContent = '';
    const r1 = document.createElement('div'); r1.className = 'rad';
    for (let n = 1; n <= 10; n++) r1.appendChild(knapp(String(n), gd.niva === n, () => { gd.niva = n; byggGard(); settKameraGard(); byggPanelGard(); }, 'Gårdsnivå ' + n));
    const r2 = document.createElement('div'); r2.className = 'rad';
    r2.appendChild(knapp('👻 Neste nivå', gd.neste, () => { gd.neste = !gd.neste; byggGard(); byggPanelGard(); }));
    r2.appendChild(knapp('🪟 Etasjer over roboten', gd.gjennom, () => { gd.gjennom = !gd.gjennom; byggGard(); byggPanelGard(); }));
    r2.appendChild(knapp('🔄 Snurr', bane.auto, () => { bane.auto = !bane.auto; byggPanelGard(); }));
    p.append(r1, r2);
  }
  function velgFane(f) {
    fane = f; $('fMatdyr').setAttribute('aria-pressed', String(f === 'matdyr')); $('fGard').setAttribute('aria-pressed', String(f === 'gard'));
    md.gruppe.visible = f === 'matdyr'; gd.gruppe.visible = f === 'gard';
    if (f === 'matdyr') { scene.fog.near = 80; visMatdyr(); byggPanelMatdyr(); } else { holder.classList.remove('ramme'); storrelse(); scene.fog.near = 120; byggGard(); settKameraGard(); byggPanelGard(); }
  }
  $('fMatdyr').addEventListener('click', () => velgFane('matdyr'));
  $('fGard').addEventListener('click', () => velgFane('gard'));

  // ---------- Størrelse, løkke og målinger ----------
  function storrelse() { const w = holder.clientWidth || innerWidth, h = holder.clientHeight || innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', () => { storrelse(); if (fane === 'matdyr') { if (md.visning === 'spill') settKameraMatdyr(); byggPanelMatdyr(); } });
  let sist = performance.now(), fpsT = 0, fpsN = 0, fps = 0;
  function loop(na) {
    const ekteDt = (na - sist) / 1000, dt = Math.min(0.05, ekteDt); sist = na; const t = na / 1000;
    if (bane.auto && !REDUSERT) bane.teta += dt * 0.35;
    oppdaterKamera();
    if (fane === 'matdyr') md.alle.forEach(f => H.animer(f, t, md.gaar && !REDUSERT));
    if (robotMixer) robotMixer.update(dt);
    if (gd.molle && gd.molle.userData.vinge && !REDUSERT) gd.molle.userData.vinge.rotation.z += dt * 0.8;
    renderer.render(scene, camera);
    fpsN++; fpsT += ekteDt; if (fpsT > 0.5) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; const i = renderer.info.render; $('maal').textContent = fps + ' FPS · ' + i.calls + ' tegnekall · ' + Math.round(i.triangles / 1000) + 'k trekanter'; window.EVNMaal = { fps, kall: i.calls, trekanter: i.triangles }; }
    requestAnimationFrame(loop);
  }
  storrelse();
  robotKlar.then(() => { velgFane('matdyr'); requestAnimationFrame(loop); window.EVNKlar = true; });
  // For automatiske skjermbilder: ?fane=gard&niva=6 eller ?figur=burgersau&vis=spill
  window.EVNVis = (o) => { if (o.fane === 'gard') { if (o.niva) gd.niva = o.niva; if (o.neste !== undefined) gd.neste = o.neste; velgFane('gard'); if (o.teta !== undefined) { bane.teta = o.teta; oppdaterKamera(); } } else { if (o.figur) md.valgt = o.figur; if (o.vis) md.visning = o.vis; if (o.mobil) holder.classList.add('ramme'); storrelse(); velgFane('matdyr'); if (o.teta !== undefined) bane.teta = o.teta; } };
})();
