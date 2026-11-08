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
  let robotMal = null, robotMixer = null, robotAktNa = null; const robotAkt = {};
  function spillAnim(navn) { if (robotAktNa === navn || !robotAkt[navn]) return; const ny = robotAkt[navn], gml = robotAkt[robotAktNa]; ny.reset().play(); if (navn === 'Jump') { ny.setLoop(T.LoopOnce); ny.clampWhenFinished = true; } if (gml) ny.crossFadeFrom(gml, 0.15, false); robotAktNa = navn; }
  const robotKlar = new Promise(ok => {
    try {
      const bin = atob(window.EVN_ROBOT_GLB), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      new T.GLTFLoader().parse(u.buffer, '', gl => {
        const m = gl.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material && o.material.name === 'Main') o.material.color.setHex(0xffcc00).convertSRGBToLinear(); } });
        const b = new T.Box3().setFromObject(m), k = 3.0 / (b.max.y - b.min.y); m.scale.setScalar(k); m.position.y = -b.min.y * k;
        robotMal = { m, anim: gl.animations };
        robotMixer = new T.AnimationMixer(m); gl.animations.forEach(a => robotAkt[a.name] = robotMixer.clipAction(a)); if (robotAkt.Idle) { robotAkt.Idle.play(); robotAktNa = 'Idle'; }
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
  const gd = { gruppe: new T.Group(), niva: 3, neste: true, gjennom: false, figurInst: null };
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

  // ---- Én sammenhengende spiralrampe rundt bygningen ----
  // Rampa går langs høyre side (Rampe 1), svinger rundt bakre hjørne og langs baksiden (Rampe 2) og
  // opp langs venstre side og rundt fremre venstre hjørne (Rampe 3). Der den møter en etasje, flater den ut
  // til en repos med gul port inn til etasjen.
  const W = 3.4, HX = BX / 2, HZ = BZ / 2, DEKKE = 0.45, G = 0.25, RC = 3.9, LREP = 3.5;
  const GUL = '#ffcf33';
  const A = HX + G + W / 2, B = HZ + G + W / 2;                       // senterlinjen for rampa
  const KX = A - RC, KZ = B - RC;                                      // sentrum for hjørnebuene
  const VEI = {
    apning: { 1: { side: 'h', fra: -KZ, til: -KZ + LREP }, 2: { side: 'v', fra: -KZ, til: -KZ + LREP }, 3: { side: 'f', fra: -KX, til: -KX + LREP } }
  };
  // Senterlinjen samplet hver 0,25: [x, z, del]. Delene: 0 høyre side, 1 bakre høyre hjørne, 2 baksiden, 3 bakre venstre hjørne, 4 venstre side, 5 fremre venstre hjørne, 6 forsiden
  const SPOR = (() => {
    const p = [], st = 0.25, linje = (x0, z0, x1, z1, del) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / st); for (let i = 0; i < n; i++) p.push([x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n, del]); };
    const bue = (cx, cz, t0, t1, del) => { const n = Math.ceil(Math.abs(t1 - t0) * RC / st); for (let i = 0; i < n; i++) { const t = t0 + (t1 - t0) * i / n; p.push([cx + RC * Math.cos(t), cz + RC * Math.sin(t), del]); } };
    linje(A, HZ + 5.5, A, -KZ, 0); bue(KX, -KZ, 0, -Math.PI / 2, 1); linje(KX, -B, -KX, -B, 2); bue(-KX, -KZ, -Math.PI / 2, -Math.PI, 3);
    linje(-A, -KZ, -A, KZ, 4); bue(-KX, KZ, Math.PI, Math.PI / 2, 5); linje(-KX, B, -KX + LREP, B, 6); p.push([-KX + LREP, B, 6]);
    let d = 0; p.forEach((q, i) => { if (i) d += Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]); q[3] = d; });
    // Høydeprofil: rampe → repos (flat) → rampe → repos → rampe → repos (topp)
    const dAt = f => p.find(f)[3], L = p[p.length - 1][3];
    const l1s = dAt(q => q[2] === 0 && q[1] <= -KZ + LREP), l1e = dAt(q => q[2] === 1);
    const l2s = dAt(q => q[2] === 4), l2e = dAt(q => q[2] === 4 && q[1] >= -KZ + LREP);
    const l3s = dAt(q => q[2] === 6);
    const h1 = EH + DEKKE, h2 = 2 * EH + DEKKE, h3 = 3 * EH + DEKKE;
    const prof = [[0, 0.05], [l1s, h1], [l1e, h1], [l2s, h2], [l2e, h2], [l3s, h3], [L, h3]];
    const hoyde = d => { for (let i = 1; i < prof.length; i++) if (d <= prof[i][0]) { const [d0, y0] = prof[i - 1], [d1, y1] = prof[i]; return d1 > d0 ? y0 + (y1 - y0) * (d - d0) / (d1 - d0) : y1; } return h3; };
    p.forEach(q => q[4] = hoyde(q[3]));
    return { p, del: { 1: [0, l1e], 2: [l1e, l2e], 3: [l2e, L] }, repos: { 1: [l1s, l1e], 2: [l2s, l2e], 3: [l3s, L] } };
  })();
  function rekkverk(e, x0, z0, x1, z1, y = 0) {
    const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.3) return; const n = Math.max(1, Math.round(L / 1.6));
    for (let i = 0; i <= n; i++) { const t = i / n; boks(e, 0.14, 1.0, 0.14, x0 + (x1 - x0) * t, y + 0.95, z0 + (z1 - z0) * t, HVIT); }
    const r = boks(e, L, 0.12, 0.12, (x0 + x1) / 2, y + 1.45, (z0 + z1) / 2, HVIT); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  }
  function sideMedApning(e, side, ap) {
    const [x0, z0, x1, z1, ak] = { f: [-HX, HZ, HX, HZ, 'x'], b: [-HX, -HZ, HX, -HZ, 'x'], v: [-HX, -HZ, -HX, HZ, 'z'], h: [HX, -HZ, HX, HZ, 'z'] }[side];
    if (!ap || ap.side !== side) return rekkverk(e, x0, z0, x1, z1);
    if (ak === 'x') { rekkverk(e, x0, z0, ap.fra, z0); rekkverk(e, ap.til, z0, x1, z1); } else { rekkverk(e, x0, z0, x0, ap.fra); rekkverk(e, x0, ap.til, x1, z1); }
    // Gul port rundt åpningen
    const [px0, pz0, px1, pz1] = ak === 'x' ? [ap.fra, z0, ap.til, z0] : [x0, ap.fra, x0, ap.til];
    for (const [x, z] of [[px0, pz0], [px1, pz1]]) boks(e, 0.25, 2.6, 0.25, x, 1.3, z, GUL);
    const l = boks(e, Math.hypot(px1 - px0, pz1 - pz0) + 0.25, 0.25, 0.25, (px0 + px1) / 2, 2.6, (pz0 + pz1) / 2, GUL); l.rotation.y = ak === 'x' ? 0 : Math.PI / 2;
  }
  function etasje(g, nr) {
    const y = nr * EH, e = new T.Group(); e.position.y = y; e.userData.etasje = nr; g.add(e);
    boks(e, BX, DEKKE, BZ, 0, DEKKE / 2, 0, plankeMat);
    // Gul kant rundt dekket
    boks(e, BX + 0.3, 0.3, 0.3, 0, DEKKE - 0.1, HZ, GUL); boks(e, BX + 0.3, 0.3, 0.3, 0, DEKKE - 0.1, -HZ, GUL);
    boks(e, 0.3, 0.3, BZ, HX, DEKKE - 0.1, 0, GUL); boks(e, 0.3, 0.3, BZ, -HX, DEKKE - 0.1, 0, GUL);
    if (nr > 0) {
      for (const sx of [-1, -1 / 3, 1 / 3, 1]) for (const sz of [-1, 1]) boks(e, 0.6, EH - DEKKE, 0.6, sx * (HX - 0.35), -(EH - DEKKE) / 2, sz * (HZ - 0.35), ROD);
      const ap = VEI.apning[nr];
      for (const side of ['f', 'b', 'v', 'h']) sideMedApning(e, side, ap);
    }
    return e;
  }
  // Skilt med én eller to linjer på to stolper
  function skilt(g, linjer, x, y, z, roty, farge = '#f6f1e6', tekstfarge = '#3a2210') {
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 140; const c = cv.getContext('2d');
    c.fillStyle = '#7a4a22'; c.fillRect(0, 0, 320, 140); c.fillStyle = farge; c.fillRect(8, 8, 304, 124);
    c.fillStyle = tekstfarge; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold 44px system-ui, sans-serif'; c.fillText(linjer[0], 160, linjer[1] ? 48 : 70);
    if (linjer[1]) { c.font = 'bold 28px system-ui, sans-serif'; c.fillText(linjer[1], 160, 100); }
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding;
    const s = new T.Group(); s.position.set(x, y, z); s.rotation.y = roty; g.add(s);
    for (const dx of [-0.8, 0.8]) s.add(mesh(new T.CylinderGeometry(0.08, 0.08, 2.4, 8), M('#7a4a22', 0.8), dx, 1.2, 0));
    const tavle = new T.Mesh(new T.PlaneGeometry(2.3, 1.0), new T.MeshStandardMaterial({ map: t, roughness: 0.8, side: T.DoubleSide })); tavle.position.y = 2.3; s.add(tavle);
    return s;
  }
  const pilGeo = (() => { const sh = new T.Shape(); sh.moveTo(0, 0.6); sh.lineTo(0.5, 0); sh.lineTo(0.18, 0); sh.lineTo(0.18, -0.6); sh.lineTo(-0.18, -0.6); sh.lineTo(-0.18, 0); sh.lineTo(-0.5, 0); sh.closePath(); const gg = new T.ShapeGeometry(sh); gg.scale(1.6, 1.6, 1); gg.rotateX(-Math.PI / 2); return gg; })();
  // Bygger én del av spiralrampa: dekke som bånd, gule kanter, hvitt rekkverk, røde stolper og piler
  function rampedel(g, nr) {
    const [d0, d1] = SPOR.del[nr], pts = SPOR.p.filter(q => q[3] >= d0 - 0.01 && q[3] <= d1 + 0.01), rr = new T.Group(); g.add(rr);
    const [r0, r1] = SPOR.repos[nr], erRepos = d => d >= r0 - 0.01 && d <= r1 + 0.01;
    const kant = [], tan = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const v = new T.Vector2(b[0] - a[0], b[1] - a[1]).normalize(); return v; };
    const pos = [], uv = [], idx = [];
    pts.forEach((q, i) => {
      const t = tan(i), n = new T.Vector2(-t.y, t.x);                 // normal (venstre for fartsretningen = mot bygningen)
      const ix = q[0] + n.x * W / 2, iz = q[1] + n.y * W / 2, ox = q[0] - n.x * W / 2, oz = q[1] - n.y * W / 2;
      kant.push({ q, ix, iz, ox, oz, t, n });
      pos.push(ix, q[4], iz, ox, q[4], oz, ix, q[4] - 0.3, iz, ox, q[4] - 0.3, oz);
      uv.push(0, q[3] / 3.2, 1, q[3] / 3.2, 0, q[3] / 3.2, 1, q[3] / 3.2);
      if (i) { const a = (i - 1) * 4, b = i * 4; idx.push(a, b, a + 1, a + 1, b, b + 1, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2, a, a + 2, b, a + 2, b + 2, b, a + 1, b + 1, a + 3, a + 3, b + 1, b + 3); }
    });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const dekke = new T.Mesh(geo, rampeMat); dekke.castShadow = dekke.receiveShadow = true; rr.add(dekke);
    // Gule kanter og hvitt toppekkverk som rør langs kantene
    const ror = (punkter, r, farge) => { if (punkter.length < 2) return; const k = new T.CatmullRomCurve3(punkter); rr.add(mesh(new T.TubeGeometry(k, Math.max(8, punkter.length), r, 6, false), M(farge, 0.45))); };
    const indreUtenRepos = []; let gruppe = [];
    kant.forEach(k => { if (erRepos(k.q[3])) { if (gruppe.length) indreUtenRepos.push(gruppe); gruppe = []; } else gruppe.push(k); }); if (gruppe.length) indreUtenRepos.push(gruppe);
    ror(kant.map(k => new T.Vector3(k.ox, k.q[4] - 0.05, k.oz)), 0.16, GUL);
    ror(kant.map(k => new T.Vector3(k.ix, k.q[4] - 0.05, k.iz)), 0.16, GUL);
    ror(kant.map(k => new T.Vector3(k.ox, k.q[4] + 1.35, k.oz)), 0.07, HVIT);
    indreUtenRepos.forEach(gr => ror(gr.map(k => new T.Vector3(k.ix, k.q[4] + 1.35, k.iz)), 0.07, HVIT));
    // Stolper: rekkverk hver 1,6, røde bærestolper hver 3,2
    let neste = 0, nesteB = 0;
    kant.forEach(k => {
      const d = k.q[3], y = k.q[4];
      if (d >= neste) { neste = d + 1.6; boks(rr, 0.12, 1.3, 0.12, k.ox, y + 0.7, k.oz, HVIT); if (!erRepos(d)) boks(rr, 0.12, 1.3, 0.12, k.ix, y + 0.7, k.iz, HVIT); }
      if (d >= nesteB && y > 0.8) { nesteB = d + 3.2; for (const [x, z] of [[k.ox, k.oz], [k.ix, k.iz]]) boks(rr, 0.4, y - 0.3, 0.4, x, (y - 0.3) / 2, z, ROD); }
    });
    // Gule piler oppover rampa (ikke på reposene)
    let nesteP = d0 + 2;
    kant.forEach(k => { if (k.q[3] >= nesteP && !erRepos(k.q[3])) { nesteP = k.q[3] + 4.5; const p = new T.Mesh(pilGeo, M(GUL, 0.4, { emissive: LC(GUL), emissiveIntensity: 0.15 })); p.position.set(k.q[0], k.q[4] + 0.02, k.q[1]); p.rotation.y = Math.atan2(k.t.x, k.t.y); p.receiveShadow = true; rr.add(p); } });
    return { rr, kant };
  }
  const rampeMat = (() => { const m = plankeMat.clone(); m.map = plankeMat.map.clone(); m.map.needsUpdate = true; m.map.repeat.set(1, 1); m.side = T.DoubleSide; return m; })();
  function spiral(g, nr) {
    const { rr, kant } = rampedel(g, nr), k0 = kant[0], [r0, r1] = SPOR.repos[nr], km = kant.find(k => k.q[3] >= (r0 + r1) / 2);
    const vend = k => Math.atan2(k.t.x, k.t.y) + Math.PI;
    if (nr === 1) skilt(rr, ['📍 Repos 1', 'Inn til 2. etasje'], km.ox - km.n.x * 1.2, km.q[4], km.oz - km.n.y * 1.2, -Math.PI / 2, '#ffe9a8');
    if (nr === 2) { const kk = kant[6]; skilt(rr, ['↗ Rampe 2', '2. → 3. etasje'], kk.ox - kk.n.x * 1.1, kk.q[4] - 0.2, kk.oz - kk.n.y * 1.1, -Math.PI / 2 + 0.6); skilt(rr, ['📍 Repos 2', 'Inn til 3. etasje'], km.ox - km.n.x * 1.2, km.q[4], km.oz - km.n.y * 1.2, Math.PI / 2, '#ffe9a8'); }
    if (nr === 3) { const kk = kant[6]; skilt(rr, ['↗ Rampe 3', '3. etasje → topp'], kk.ox - kk.n.x * 1.1, kk.q[4] - 0.2, kk.oz - kk.n.y * 1.1, Math.PI / 2 - 0.4); }
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
    lave(g, n >= 5, -BX / 2 - 12.5, -6); silo(g, n >= 4 ? 11 : 7, -BX / 2 - 8.5, 6.5);
    skal(4, gg => honsehus(gg, BX / 2 + 7, 10));
    skal(5, gg => { gd.molle = molle(gg, BX / 2 + 9, -9); });
    skal(7, gg => drivhus(gg, -6, 15));
    skal(8, gg => taarn(gg, -BX / 2 - 15, 14));
    // Selve gårdsbygningen
    etasje(g, 0);
    skal(3, gg => { etasje(gg, 1); spiral(gg, 1); });
    skal(6, gg => { etasje(gg, 2); spiral(gg, 2); });
    skal(9, gg => { etasje(gg, 3); spiral(gg, 3); skilt(gg, ['🏁 Topp', 'Takterrasse (mål)'], 0, 3 * EH + DEKKE, -HZ + 0.6, 0, '#ffd23f'); flagg(gg, HX - 0.5, 3 * EH + DEKKE, -HZ + 0.5, '#2f80ed'); });
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
    const r = lagRobot(); r.g.userData.ikkeFlett = true; r.g.position.set(A - 2.4, 0, HZ + 6.6); r.g.rotation.y = Math.PI * 0.85; g.add(r.g); gd.robot = r.g;   // ved foten av rampe 1
    // Etasjer over roboten gjøres gjennomsiktige
    if (gd.gjennom) g.traverse(o => { if (!o.isMesh) return; let p = o; while (p && p.userData.etasje === undefined) p = p.parent; const e = p ? p.userData.etasje : 0; if (e >= 1 && !(o.material.opacity < 0.3)) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.45; o.material.depthWrite = false; } });
    visKortGard(aapne, plasser.length);
  }
  function visKortGard(aapne, alle) {
    const n = gd.niva, neste = NIVA[n + 1];
    $('kort').innerHTML = '<h1>Gårdsnivå ' + n + (n === 10 ? ' (maks)' : '') + '</h1><div>' + NIVA[n].nytt + '.</div><div>🐮 ' + aapne + ' matdyrplasser' + (alle > aapne ? ' (' + (alle - aapne) + ' grå kan kjøpes senere)' : '') + '</div>' +
      (n >= 3 ? '<div class="rute"><b>Ruten opp</b><br>▶ Start (bakken)<br>Rampe 1 → Repos 1, inn til 2. etasje' + (n >= 6 ? '<br>Rampe 2 → Repos 2, inn til 3. etasje' : '') + (n >= 9 ? '<br>Rampe 3 → 🏁 Takterrassen' : '') + '</div>' : '') +
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
  // =====================================================================
  // ======================  FANE 3: SPILL (styring)  =====================
  // =====================================================================
  // Gå, hopp, spiralrampe og etasjer med kollisjon. Ingen lagring.
  const sp = { niva: 9, vy: 0, paaBakken: true, inn: { x: 0, z: 0 }, taster: {}, hopp: false, etasje: -1, joy: null };
  const HOPP_V = 10.5, TYNGDE = 28, FART = 8.5, STEG = 0.75;
  const bygdeEtasjer = () => sp.niva >= 9 ? 3 : sp.niva >= 6 ? 2 : sp.niva >= 3 ? 1 : 0;
  // Høyeste gangbare flate under (eller litt over) roboten
  function flateVed(x, z, y) {
    let best = 0; const kand = h => { if (h <= y + STEG && h > best) best = h; };
    if (Math.abs(x) <= HX && Math.abs(z) <= HZ) for (let e = 0; e <= bygdeEtasjer(); e++) kand(e * EH + DEKKE);
    const h = rampeHoyde(x, z); if (h !== null) kand(h);
    return best;
  }
  // Høyden på rampa rett over/under punktet, eller null utenfor rampa
  function rampeHoyde(x, z) {
    const maxD = SPOR.del[bygdeEtasjer()] ? SPOR.del[bygdeEtasjer()][1] : -1; if (maxD <= 0) return null;
    let bd = 1e9, bq = null; for (const q of SPOR.p) { if (q[3] > maxD + 0.01) break; const d2 = (q[0] - x) ** 2 + (q[1] - z) ** 2; if (d2 < bd) { bd = d2; bq = q; } }
    return bq && bd <= (W / 2) ** 2 ? bq[4] : null;
  }
  // Vegger: rekkverk på etasjene (med åpninger) og på begge sider av rampa (innsiden er åpen på reposene)
  let vegger = [];
  function byggVegger() {
    vegger = []; const leg = (x0, z0, x1, z1, y) => vegger.push({ x0, z0, x1, z1, y0: y - 0.2, y1: y + 3.2 })   // høyere enn et hopp, så man ikke hopper over rekkverket;
    for (let e = 1; e <= bygdeEtasjer(); e++) {
      const y = e * EH + DEKKE, ap = VEI.apning[e];
      for (const side of ['f', 'b', 'v', 'h']) {
        const [x0, z0, x1, z1, ak] = { f: [-HX, HZ, HX, HZ, 'x'], b: [-HX, -HZ, HX, -HZ, 'x'], v: [-HX, -HZ, -HX, HZ, 'z'], h: [HX, -HZ, HX, HZ, 'z'] }[side];
        if (!ap || ap.side !== side) leg(x0, z0, x1, z1, y);
        else if (ak === 'x') { leg(x0, z0, ap.fra, z0, y); leg(ap.til, z0, x1, z1, y); } else { leg(x0, z0, x0, ap.fra, y); leg(x0, ap.til, x1, z1, y); }
      }
    }
    const maxD = SPOR.del[bygdeEtasjer()] ? SPOR.del[bygdeEtasjer()][1] : -1; let forrige = null;
    for (const q of SPOR.p) {
      if (q[3] > maxD + 0.01) break;
      if (forrige) {
        const tx = q[0] - forrige[0], tz = q[1] - forrige[1], l = Math.hypot(tx, tz) || 1, nx = tz / l, nz = -tx / l, y = Math.min(q[4], forrige[4]);
        leg(forrige[0] - nx * W / 2, forrige[1] - nz * W / 2, q[0] - nx * W / 2, q[1] - nz * W / 2, y);        // ytterkant
        const paaRepos = Object.values(SPOR.repos).some(([a, b]) => q[3] >= a - 0.3 && q[3] <= b + 0.3);
        if (!paaRepos && y > 0.6) leg(forrige[0] + nx * W / 2, forrige[1] + nz * W / 2, q[0] + nx * W / 2, q[1] + nz * W / 2, y);   // innerkant
      }
      forrige = q;
    }
  }
  const krysser = (ax, az, bx, bz, cx, cz, dx, dz) => { const d = (bx - ax) * (dz - cz) - (bz - az) * (dx - cx); if (Math.abs(d) < 1e-9) return false; const t = ((cx - ax) * (dz - cz) - (cz - az) * (dx - cx)) / d, u = ((cx - ax) * (bz - az) - (cz - az) * (bx - ax)) / d; return t >= 0 && t <= 1 && u >= 0 && u <= 1; };
  function blokkert(x0, z0, x1, z1, y) {
    const l = Math.hypot(x1 - x0, z1 - z0) || 1, ex = x1 + (x1 - x0) / l * 0.45, ez = z1 + (z1 - z0) / l * 0.45;   // robotens radius
    return vegger.some(v => y >= v.y0 && y < v.y1 && krysser(x0, z0, ex, ez, v.x0, v.z0, v.x1, v.z1));
  }
  function etasjeNavn(y) { return y < EH * 0.6 ? '1. etasje (bakken)' : y < EH * 1.6 ? '2. etasje' : y < EH * 2.6 ? '3. etasje' : 'Takterrassen 🏁'; }
  function steg(dt) {
    const r = gd.robot; if (!r) return;
    let ix = (sp.taster.d || sp.taster.arrowright ? 1 : 0) - (sp.taster.a || sp.taster.arrowleft ? 1 : 0) + sp.inn.x;
    let iz = (sp.taster.w || sp.taster.arrowup ? 1 : 0) - (sp.taster.s || sp.taster.arrowdown ? 1 : 0) + sp.inn.z;
    const m = Math.hypot(ix, iz); if (m > 1) { ix /= m; iz /= m; }
    const fx = -Math.sin(bane.teta), fz = -Math.cos(bane.teta), rx = Math.cos(bane.teta), rz = -Math.sin(bane.teta);
    const vx = (fx * iz + rx * ix) * FART, vz = (fz * iz + rz * ix) * FART, p = r.position;
    const gaar = m > 0.1;
    if (gaar) {
      const nx = p.x + vx * dt, nz = p.z + vz * dt, y = p.y;
      const ok = (x, z) => { const rh = rampeHoyde(x, z); return !(rh !== null && rh > y + STEG && rh < y + 2.6) && !blokkert(p.x, p.z, x, z, y) && flateVed(x, z, y) <= y + STEG && (x / 31) ** 2 + (z / 23) ** 2 < 1; };
      if (ok(nx, nz)) { p.x = nx; p.z = nz; } else if (ok(nx, p.z)) p.x = nx; else if (ok(p.x, nz)) p.z = nz;
      const mal = Math.atan2(vx, vz); let d = mal - r.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); r.rotation.y += d * Math.min(1, dt * 12);
    }
    const bunn = flateVed(p.x, p.z, p.y);
    if (sp.hopp && sp.paaBakken) { sp.vy = HOPP_V; sp.paaBakken = false; spillAnim('Jump'); }
    sp.hopp = false;
    if (!sp.paaBakken || p.y > bunn + 0.02) { sp.vy -= TYNGDE * dt; p.y += sp.vy * dt; sp.paaBakken = false; if (p.y <= bunn) { p.y = bunn; sp.vy = 0; sp.paaBakken = true; } }
    else p.y = bunn;   // følg rampa og trapp opp små kanter
    if (sp.paaBakken) spillAnim(gaar ? 'Running' : 'Idle');
    // Kamera følger roboten
    bane.mal.set(p.x, p.y + 2.2, p.z);
    // Etasjer over roboten blir gjennomsiktige
    const e = p.y < EH * 0.6 ? 0 : p.y < EH * 1.6 ? 1 : p.y < EH * 2.6 ? 2 : 3;
    if (e !== sp.etasje) { sp.etasje = e; settGjennom(e); $('spillStatus').textContent = '📍 ' + etasjeNavn(p.y); }
  }
  let etasjeMesher = [];
  function forberedGjennom() {
    etasjeMesher = [];
    gd.gruppe.traverse(o => { if (!o.isMesh || o.isInstancedMesh && false) return; let q = o; while (q && q.userData.etasje === undefined) q = q.parent; if (!q || !q.userData.etasje) return; o.userData.orig = o.material; o.userData.glass = (() => { const m = o.material.clone(); m.transparent = true; m.opacity = 0.3; m.depthWrite = false; return m; })(); etasjeMesher.push([o, q.userData.etasje]); });
  }
  function settGjennom(e) { etasjeMesher.forEach(([o, et]) => { o.material = et > e ? o.userData.glass : o.userData.orig; }); }
  function startSpill() {
    gd.niva = sp.niva; gd.neste = false; gd.gjennom = false; byggGard(); byggVegger(); forberedGjennom();
    const r = gd.robot; r.position.set(A, 0, HZ + 7); r.rotation.y = Math.PI; sp.vy = 0; sp.paaBakken = true; sp.etasje = -1;
    Object.assign(bane, { teta: 0, fi: 1.12, r: innerWidth < 640 ? 18 : 15, rMin: 6, rMax: 40, auto: false });
    $('kort').innerHTML = '<h1>Prøv rampa</h1><div>Gå opp spiralrampa og inn i etasjene. Prøv å hoppe.</div><div class="liten">' + (TOUCH ? 'Styrespak nede til venstre, hopp nede til høyre. Dra på skjermen for å snu kameraet.' : 'WASD eller piltaster: gå · Mellomrom: hopp · Dra med musa: kamera · Hjul: zoom') + '</div><div id="spillStatus" class="rute">📍 1. etasje (bakken)</div>';
  }
  function byggPanelSpill() {
    const p = $('panel'); p.textContent = ''; const r1 = document.createElement('div'); r1.className = 'rad';
    const smal = innerWidth < 640; [3, 6, 9].forEach(n => { const t = (smal ? 'Nivå ' : 'Gårdsnivå ') + n; r1.appendChild(knapp(t, sp.niva === n, () => { sp.niva = n; startSpill(); byggPanelSpill(); })); });
    r1.appendChild(knapp(smal ? '↺ Start' : '↺ Til start', false, () => { startSpill(); }));
    p.append(r1);
  }
  addEventListener('keydown', e => { if (fane !== 'spill') return; const k = e.key.toLowerCase(); if (k === ' ') { sp.hopp = true; e.preventDefault(); } sp.taster[k] = true; if (k.startsWith('arrow')) e.preventDefault(); });
  addEventListener('keyup', e => { sp.taster[e.key.toLowerCase()] = false; });
  addEventListener('blur', () => { sp.taster = {}; sp.inn = { x: 0, z: 0 }; });
  // Mobil: styrespak og hoppknapp
  const joy = $('joy'), knott = $('knott');
  joy.addEventListener('pointerdown', e => { e.stopPropagation(); sp.joy = e.pointerId; joy.setPointerCapture(e.pointerId); flyttJoy(e); });
  joy.addEventListener('pointermove', e => { if (e.pointerId === sp.joy) flyttJoy(e); });
  const slippJoy = e => { if (e.pointerId === sp.joy) { sp.joy = null; sp.inn = { x: 0, z: 0 }; knott.style.transform = ''; } };
  joy.addEventListener('pointerup', slippJoy); joy.addEventListener('pointercancel', slippJoy);
  function flyttJoy(e) { const b = joy.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), R = b.width / 2 - 20; if (m > R) { dx *= R / m; dy *= R / m; } knott.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; sp.inn = { x: dx / R, z: -dy / R }; }
  $('hopp').addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); sp.hopp = true; });

  function velgFane(f) {
    fane = f; $('fMatdyr').setAttribute('aria-pressed', String(f === 'matdyr')); $('fGard').setAttribute('aria-pressed', String(f === 'gard')); $('fSpill').setAttribute('aria-pressed', String(f === 'spill'));
    md.gruppe.visible = f === 'matdyr'; gd.gruppe.visible = f !== 'matdyr';
    document.body.classList.toggle('spiller', f === 'spill');
    if (f === 'matdyr') { scene.fog.near = 80; visMatdyr(); byggPanelMatdyr(); }
    else if (f === 'gard') { holder.classList.remove('ramme'); storrelse(); scene.fog.near = 120; byggGard(); settKameraGard(); byggPanelGard(); }
    else { holder.classList.remove('ramme'); storrelse(); scene.fog.near = 120; startSpill(); byggPanelSpill(); }
  }
  $('fSpill').addEventListener('click', () => velgFane('spill'));
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
    if (fane === 'spill') steg(dt);
    if (robotMixer) robotMixer.update(dt);
    if (gd.molle && gd.molle.userData.vinge && !REDUSERT) gd.molle.userData.vinge.rotation.z += dt * 0.8;
    renderer.render(scene, camera);
    fpsN++; fpsT += ekteDt; if (fpsT > 0.5) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; const i = renderer.info.render; $('maal').textContent = fps + ' FPS · ' + i.calls + ' tegnekall · ' + Math.round(i.triangles / 1000) + 'k trekanter'; window.EVNMaal = { fps, kall: i.calls, trekanter: i.triangles }; }
    requestAnimationFrame(loop);
  }
  storrelse();
  robotKlar.then(() => { velgFane('matdyr'); requestAnimationFrame(loop); window.EVNKlar = true; });
  // For automatiske skjermbilder: ?fane=gard&niva=6 eller ?figur=burgersau&vis=spill
  window.EVNSpill = sp; window.EVNRobot = () => gd.robot; window.EVNSteg = steg; window.EVNSpor = SPOR; window.EVNGeo = { HX, HZ, EH, DEKKE, W, KX, KZ, A, B, LREP }; window.EVNBane = bane; window.EVNVegger = () => vegger;
  window.EVNVis = (o) => { if (o.fane === 'spill') { if (o.niva) sp.niva = o.niva; velgFane('spill'); return; } if (o.fane === 'gard') { if (o.niva) gd.niva = o.niva; if (o.neste !== undefined) gd.neste = o.neste; velgFane('gard'); if (o.teta !== undefined) { bane.teta = o.teta; oppdaterKamera(); } } else { if (o.figur) md.valgt = o.figur; if (o.vis) md.visning = o.vis; if (o.mobil) holder.classList.add('ramme'); storrelse(); velgFane('matdyr'); if (o.teta !== undefined) bane.teta = o.teta; } };
})();
