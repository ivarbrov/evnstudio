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
  // Ny grafikk (fase 2): EVN 3D-miljø med kvalitetsnivå. ?grafikk=gammel viser den forrige versjonen til sammenligning.
  const NY = new URLSearchParams(location.search).get('grafikk') !== 'gammel' && !!window.EVNMiljo && !!T.GLTFLoader;
  const KV = NY ? EVNMiljo.velgKvalitet() : null;
  const renderer = new T.WebGLRenderer({ antialias: NY ? EVNMiljo.NIVAER[KV].antialias : true });
  holder.appendChild(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(42, 1, 0.05, 500);
  let sol, bakke, LYS = null;
  // Delt skjerm for å sammenligne tonemapping på samme skjerm: venstre ACES, høyre uten (?tonemap=sammenlign)
  const SAMMENLIGN = NY && new URLSearchParams(location.search).get('tonemap') === 'sammenlign' && EVNMiljo.PROFIL !== 'mb';
  if (NY) {
    LYS = EVNMiljo.lys(scene, renderer, KV); sol = LYS.sol;
  } else {
    renderer.setPixelRatio(Math.min(TOUCH ? 1.5 : 2, devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    scene.background = LC('#bfe3f7'); scene.fog = new T.Fog(LC('#cfe9f7'), 80, 220);
    scene.add(new T.HemisphereLight(LC('#e8f6ff'), LC('#7fae5a'), 0.75));
    sol = new T.DirectionalLight(LC('#fff2d8'), 1.25); sol.position.set(12, 22, 10); sol.castShadow = true;
    sol.shadow.mapSize.set(TOUCH ? 1024 : 2048, TOUCH ? 1024 : 2048); sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.03;
    Object.assign(sol.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 });
    scene.add(sol, sol.target);
    const fyll = new T.DirectionalLight(LC('#c9e2ff'), 0.35); fyll.position.set(-10, 8, -12); scene.add(fyll);
  }
  // Bakke: enkel sirkel (gammel), eller terreng med fargevariasjon og åser utenfor spilleområdet (ny)
  bakke = new T.Mesh(new T.CircleGeometry(160, 64), new T.MeshStandardMaterial({ color: LC('#7cc95a'), roughness: 0.95 }));
  bakke.rotation.x = -Math.PI / 2; bakke.receiveShadow = true; scene.add(bakke);
  // Ressurser fra Blender (lastes parallelt med roboten; spillet virker uten dem)
  const NYE_FIGURER = ['donutku', 'burgersau', 'pizzaskilpadde', 'shakeand', 'spagettipingvin'];
  // ?pilot=1: figurpiloten (MS5) – 16 modulære figurer, 4 arter × 4 matvarer. De går foran de håndlagde med samme ID.
  const PILOT_ID = { pilot_ku_pizza: 125, pilot_ku_smultring: 127, pilot_ku_banan: 130, pilot_ku_is: 134, pilot_pingvin_pizza: 175, pilot_pingvin_smultring: 177, pilot_pingvin_banan: 180, pilot_pingvin_is: 184,
    pilot_hval_pizza: 225, pilot_hval_smultring: 227, pilot_hval_banan: 230, pilot_hval_is: 234, pilot_skilpadde_pizza: 700, pilot_skilpadde_smultring: 702, pilot_skilpadde_banan: 705, pilot_skilpadde_is: 709,
    // Figurbolk 1 (9.11.2026): ku og gris med lanseringssettets 10 matsorter. ID-ene er hentet fra COMBOS (navn = mat + art).
    pilot_ku_burger: 133, pilot_ku_spagetti: 129, pilot_ku_taco: 126, pilot_ku_sjoko: 135, pilot_ku_jordbaer: 142, pilot_ku_milkshake: 149,
    pilot_gris_pizza: 0, pilot_gris_smultring: 2, pilot_gris_burger: 8, pilot_gris_is: 9, pilot_gris_spagetti: 4, pilot_gris_banan: 5,
    pilot_gris_taco: 1, pilot_gris_sjoko: 10, pilot_gris_jordbaer: 17, pilot_gris_milkshake: 24 };
  const PILOT = new URLSearchParams(location.search).get('pilot') === '1' ? Object.keys(PILOT_ID) : [];
  const NY_ID = { ...Object.fromEntries(PILOT.map(n => [n, PILOT_ID[n]])), donutku: 127, burgersau: 508, pizzaskilpadde: 700, shakeand: 599, spagettipingvin: 179 };
  // ?laave=a|b|c: tre låvevarianter til vurdering (Ivar 8.11.2026). Uten flagget brukes den vanlige låven.
  const LAAVE = ['a', 'b', 'c'].includes(new URLSearchParams(location.search).get('laave')) ? new URLSearchParams(location.search).get('laave') : null;
  const res = { miljo: null, gard: null, fig: {}, laaver: null };
  const ressurserKlar = !NY ? Promise.resolve() : Promise.all([
    EVNMiljo.lastGLB('modeller/miljo.glb').then(g => { res.miljo = g; }),
    EVNMiljo.lastGLB('modeller/gard.glb').then(g => { res.gard = g; }),
    LAAVE ? EVNMiljo.lastGLB('modeller/laaver.glb').then(g => { res.laaver = g; }) : null,
    ...NYE_FIGURER.concat(PILOT).map(n => Promise.all([EVNMiljo.lastGLB('modeller/' + n + '.glb'), EVNMiljo.lastGLB('modeller/' + n + '_lav.glb')]).then(([full, lav]) => { if (full) res.fig[n] = { full, lav: lav || full }; }))
  ]);

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
      const n = geos.reduce((s, g) => s + g.attributes.position.count, 0), harUv = geos.every(g => g.attributes.uv), harF = geos.every(g => g.attributes.color);
      const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = harUv ? new Float32Array(n * 2) : null, col = harF ? new Float32Array(n * 3) : null; let k = 0;
      for (const g of geos) { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (uv) uv.set(g.attributes.uv.array, k * 2); if (col) col.set(g.attributes.color.array, k * 3); k += g.attributes.position.count; }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); if (col) geo.setAttribute('color', new T.BufferAttribute(col, 3));
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

  // ---------- Nye figurer fra Blender (GLB): adapter med animerbare noder ----------
  const DATA = window.EVNMatdyrData;
  const NY_INFO = {
    donutku: 'Kroppen ER en donut: deigring med lys midtstripe og glasur med kumønster som renner over kanten. Hodet, hornene, beina og halen er kuas.',
    burgersau: 'Kroppen ER en burger: brød, kjøtt, ost som henger ned, tomat, salat og et høyt sesambrød. Sauen titter fram mellom lagene, med majones som ull.',
    pizzaskilpadde: 'Skjoldet ER en hel pizza: skorpa er skjoldkanten, osten renner over, og pepperonien sitter som skjoldplater.',
    shakeand: 'Kroppen ER et milkshakeglass med rosa shake. Kremen er andas rygg, sugerøret er halen, og hodet, nebbet og vingene er andas.',
    spagettipingvin: 'Magen ER et nøste av spagetti, og vingene er bunter av spagetti. Tomatsaus renner fra hodet, med kjøttbolle og basilikum på toppen.'
  };
  const nyNavnFor = ci => NY ? Object.keys(NY_ID).find(n => NY_ID[n] === ci && res.fig[n]) || null : null;
  function nyFigur(n, detalj = 'full') {
    const kopi = res.fig[n][detalj === 'lav' ? 'lav' : 'full'].scene.clone(true), g = new T.Group(); g.add(kopi);
    kopi.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material.transparent) o.material.depthWrite = false; } });
    const nd = {}; ['hode', 'hale', 'bein_vf', 'bein_hf', 'bein_vb', 'bein_hb', 'vinge_v', 'vinge_h'].forEach(k => { const o = kopi.getObjectByName(k); if (o) nd[k] = { o, r: o.rotation.clone() }; });
    const c = DATA.COMBOS[NY_ID[n]];
    return { g, kopi, nd, ny: true, nokkel: n, navn: c.navn, ci: NY_ID[n], sj: c.r, mat: c.mat, dyr: c.art, hode: nd.hode && nd.hode.o, legs: [] };
  }
  // Bevegelse som passer kroppen: firbeinte går i kryss, tobeinte vagger, vinger og hale lever sitt eget liv
  // Porten ut av åkeren: halv bredde (m). Bred nok til at to matdyr kan gå ut side om side.
  const PORT_HALV = 3.4;
  // Busker i landskapet øst for åkerporten (porten står ved x = 31,6, z = 40)
  const UTBUSKER = [[41.5, 33], [42.5, 47.5], [45, 37.5], [46, 43.5], [47.5, 30.5], [48.5, 50], [50, 35.5], [51, 45], [44, 27.5], [44.5, 53], [53.5, 40], [54, 30], [55, 49]].map(([x, z], i) => ({ x, z, ry: i * 1.3, s: 1.4 + (i % 3) * 0.25 }));
  // Gangfart for matdyrene på åkeren: 1 = vanlig (ca. 30–50 s over åkeren). Kan prøves som 0.7 eller 1.4 via ⚙️ i spilltest (?gangfart=).
  const GANGFART = [0.7, 1, 1.4].includes(+new URLSearchParams(location.search).get('gangfart')) ? +new URLSearchParams(location.search).get('gangfart') : 1;
  // fase (valgfri): tilbakelagt gangdistanse i meter. Da følger bein, vugging og vinger farten: ett skritt ≈ 0,9 m for firbeinte og 0,7 m for tobeinte.
  // Uten fase brukes tiden som før (fast takt, f.eks. i Matdyr-fanen). Hode og hvilebevegelser følger alltid tiden.
  function animerNy(f, t, gaar, fase) {
    const nd = f.nd, fire = !!nd.bein_vb, k = f.kopi;
    const w = fase === undefined ? t * (fire ? 9 : 7) : fase * 2 * Math.PI / (fire ? 0.9 : 0.7);   // gangvinkel
    const sett = (n, x, y, z) => { const d = nd[n]; if (d) d.o.rotation.set(d.r.x + x, d.r.y + y, d.r.z + z); };
    if (fire) { const a = gaar ? Math.sin(w) * 0.45 : 0; sett('bein_vf', a, 0, 0); sett('bein_hb', a, 0, 0); sett('bein_hf', -a, 0, 0); sett('bein_vb', -a, 0, 0); k.position.y = gaar ? Math.abs(Math.sin(w)) * 0.04 : Math.sin(t * 2.2) * 0.01; k.rotation.z = 0; }
    else { const a = gaar ? Math.sin(w) : 0; sett('bein_vf', a * 0.5, 0, 0); sett('bein_hf', -a * 0.5, 0, 0); k.rotation.z = gaar ? a * 0.09 : Math.sin(t * 1.6) * 0.025; k.position.y = gaar ? Math.abs(a) * 0.03 : 0; }
    sett('hode', Math.sin(t * 1.3) * 0.07, Math.sin(t * 0.7) * 0.12, Math.sin(t * 0.9) * 0.05);
    sett('hale', 0, gaar ? Math.sin(w * 0.9) * 0.35 : Math.sin(t * 3) * 0.35, 0);
    const v = gaar ? Math.max(0, Math.sin(w * 0.9)) * 0.5 : (Math.sin(t * 1.8) * 0.5 + 0.5) * 0.12;
    sett('vinge_v', 0, 0, -v); sett('vinge_h', 0, 0, v);
  }
  const nySkalaC = {};
  const nySkala = n => nySkalaC[n] || (nySkalaC[n] = (() => { const f = nyFigur(n, 'full'), b = new T.Box3().setFromObject(f.kopi), st = b.getSize(new T.Vector3()); return 2.6 * (1 + 0.1 * f.sj) / Math.max(st.x, st.y, st.z * 0.85); })());
  const nyDelCache = {};
  // 'plass': lav detalj der alt uten tekstur går inn i to felles materialer, så alle figurene på en etasje kan slås sammen til få tegnekall
  function nyFigurDeler(n, detalj) { const k = n + detalj; if (!nyDelCache[k]) nyDelCache[k] = EVNMiljo.deler(res.fig[n][detalj === 'full' ? 'full' : 'lav'].scene, nySkala(n), detalj === 'plass' ? { vf: true, alt: true } : {}); return nyDelCache[k]; }

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
    if (res.fig[nokkel]) return nyFigur(nokkel, 'full');
    const f = H.lag[nokkel](); f.nokkel = nokkel; return f;
  }
  const visNokler = () => NY && NYE_FIGURER.every(n => res.fig[n]) ? NYE_FIGURER : NOKLER;
  function visMatdyr() {
    md.gruppe.clear(); md.alle = [];
    const spill = md.visning === 'spill', alle = md.visning === 'alle';
    if (alle) {
      visNokler().forEach((n, i) => { const f = byggFigur(n), s = H.spillSkala(f); f.g.scale.setScalar(s); const holderG = new T.Group(); holderG.add(f.g); holderG.position.set((i - 2) * 4.2, 0, 0); md.gruppe.add(holderG); md.alle.push(f); });
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
    $('kort').innerHTML = '<h1>' + f.navn + '</h1><div><span class="sj" style="color:' + rc + '">' + rn + '</span> · ' + f.mat + ' + ' + f.dyr + (f.ci != null ? ' · ID ' + f.ci : '') + '</div><div>' + (NY_INFO[f.nokkel] || INFO[f.nokkel] || (PILOT_ID[f.nokkel] ? 'Figurpilot: laget med det modulære systemet (dyresett + matkropp).' : '')) + '</div><div class="liten">Dra for å snu. Hjul eller to fingre for å zoome.</div>';
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
  const gd = { gruppe: new T.Group(), niva: 3, neste: true, gjennom: false, figurInst: null, aapne: null, tegnDyr: null };
  const krok = {};   // spillkjerne.js kobler seg på her (start, panel, steg, fane)
  scene.add(gd.gruppe);
  const DX = 4.2, DZ = 4.4, EH = 5.6;                       // avstand mellom plasser, etasjehøyde
  const BX = 4 * DX + 1.2, BZ = 3 * DZ + 1.2;               // gulvflate per etasje (4 × 3 plasser)
  function planker() {
    if (NY && EVNMiljo.PROFIL === 'mb') {
      // Samme planketekstur som Min Bondegård 0.4 (brune bord: årer, kvister, lys kant, mørk fuge)
      const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x = cv.getContext('2d'); let fr = 7; const rnd = () => (fr = (fr * 16807) % 2147483647) / 2147483647, rr = (a, b) => a + rnd() * (b - a);
      const n = 8, bw = 512 / n;
      for (let i = 0; i < n; i++) {
        const c = new T.Color('#a7774a'); c.offsetHSL((rnd() - 0.5) * 0.015, (rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.07); x.fillStyle = '#' + c.getHexString(); x.fillRect(i * bw, 0, bw, 512);
        x.globalAlpha = 0.13; x.strokeStyle = '#000';
        for (let k = 0; k < 9; k++) { x.lineWidth = rr(0.6, 1.6); x.beginPath(); const x0 = i * bw + rr(4, bw - 4); x.moveTo(x0, 0); for (let y = 0; y <= 512; y += 16) x.lineTo(x0 + Math.sin(y * 0.02 + k) * 2.5, y); x.stroke(); }
        x.globalAlpha = 0.18; x.fillStyle = '#fff'; x.fillRect(i * bw + 2, 0, 3, 512);
        x.globalAlpha = 0.5; x.fillStyle = '#000'; [24, 488].forEach(y => { x.beginPath(); x.arc(i * bw + bw / 2, y, 2.2, 0, 7); x.fill(); });
        if (rnd() < 0.4) { x.globalAlpha = 0.22; x.beginPath(); x.ellipse(i * bw + rr(12, bw - 12), rr(60, 452), 5, 9, 0, 0, 7); x.fill(); }
        x.globalAlpha = 1; x.fillStyle = '#4a3020'; x.fillRect(i * bw, 0, 3, 512);
      }
      const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(8, 6); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    }
    if (NY) {
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; const x = cv.getContext('2d'), F = ['#c08a52', '#b7804a', '#c8945c', '#ad7743'];
      for (let i = 0; i < 8; i++) {
        x.fillStyle = F[i % 4]; x.fillRect(0, i * 64, 512, 64);
        for (let k = 0; k < 14; k++) { x.strokeStyle = 'rgba(90,52,22,' + (0.08 + (k % 3) * 0.04) + ')'; x.lineWidth = 1 + (k % 2); x.beginPath(); const y0 = i * 64 + 6 + k * 4.2; x.moveTo(0, y0); for (let u = 0; u <= 512; u += 32) x.lineTo(u, y0 + Math.sin(u * 0.02 + k + i) * 2.2); x.stroke(); }
        x.fillStyle = 'rgba(60,32,12,.55)'; x.fillRect(0, i * 64, 512, 3); const sk = (i * 173) % 512; x.fillRect(sk, i * 64, 3, 64);
        x.fillStyle = 'rgba(255,240,210,.18)'; x.fillRect(0, i * 64 + 3, 512, 3);
        x.fillStyle = 'rgba(70,60,55,.7)'; for (const u of [sk - 14, sk + 16]) { x.beginPath(); x.arc((u + 512) % 512, i * 64 + 32, 2.5, 0, 7); x.fill(); }
      }
      const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 3); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    }
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const x = cv.getContext('2d');
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#b07a45' : '#a46d3b'; x.fillRect(0, i * 32, 256, 32); x.fillStyle = 'rgba(70,40,15,.35)'; x.fillRect(0, i * 32, 256, 2); x.fillRect((i * 97) % 256, i * 32, 2, 32); }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 3); t.encoding = T.sRGBEncoding; return t;
  }
  const plankeMat = (() => { const t = planker(); if (!(NY && EVNMiljo.PROFIL === 'mb')) return new T.MeshStandardMaterial({ map: t, roughness: 0.85 });
    const b = t.clone(); b.encoding = T.LinearEncoding; b.needsUpdate = true; return new T.MeshStandardMaterial({ map: t, bumpMap: b, bumpScale: 0.025, roughness: 0.85 }); })();
  const ROD = '#b8382f', HVIT = '#f6f1e6';
  // Stolpe med avrundede kanter (deles av alle stolper; skaleres til riktig mål)
  const rundStolpeGeo = (() => { const sh = new T.Shape(), r = 0.18, a = 0.5; sh.moveTo(-a + r, -a); sh.lineTo(a - r, -a); sh.quadraticCurveTo(a, -a, a, -a + r); sh.lineTo(a, a - r); sh.quadraticCurveTo(a, a, a - r, a); sh.lineTo(-a + r, a); sh.quadraticCurveTo(-a, a, -a, a - r); sh.lineTo(-a, -a + r); sh.quadraticCurveTo(-a, -a, -a + r, -a);
    const g = new T.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 3 }); g.rotateX(-Math.PI / 2); g.translate(0, -0.5, 0); g.computeVertexNormals(); return g; })();
  const stolpeMat = M('#c23b30', 0.6);
  function stolpe(g, w, h, d, x, y, z) { if (!NY) return boks(g, w, h, d, x, y, z, ROD); const m = mesh(rundStolpeGeo, stolpeMat, x, y, z, w, h, d); g.add(m); return m; }
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
  // ---------- Ny grafikk: gårdsbygningen settes sammen av moduler fra gard.glb (låvepreg) ----------
  // Modulene følger den faste geometrien, så etasjer, plasser, ramper og kollisjon er uendret.
  const gmCache = {};
  const NYGARD = () => NY && !!res.gard;
  function gm(navn) { if (gmCache[navn] !== undefined) return gmCache[navn]; const n = res.gard && res.gard.scene.getObjectByName(navn); return (gmCache[navn] = n ? EVNMiljo.deler(n, 1, { vf: true }) : null); }
  function modul(g, navn, x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rz = 0) {
    const d = gm(navn); if (!d) return null;
    const o = new T.Group(); o.position.set(x, y, z); o.rotation.set(0, ry, rz, 'YZX'); o.scale.set(sx, sy, sz);
    for (const { geo, mat } of d) { const m = new T.Mesh(geo, mat); m.castShadow = !mat.transparent; m.receiveShadow = true; o.add(m); }
    g.add(o); return o;
  }
  // Modul langs et linjestykke fra a til b (3D), med lokal X langs linjen; utsiden (lokal +Z) mot «ut» når den er gitt
  function langs(g, navn, a, b, lengde, yOff = 0, ut = null, sy = 1) {
    let p = a, q = b; const dx = q.x - p.x, dz = q.z - p.z;
    if (ut && (Math.sin(-Math.atan2(dz, dx)) * ut.x + Math.cos(-Math.atan2(dz, dx)) * ut.z) < 0) { p = b; q = a; }
    const ex = q.x - p.x, ey = q.y - p.y, ez = q.z - p.z, h = Math.hypot(ex, ez), L = Math.hypot(h, ey);
    return modul(g, navn, p.x, p.y + yOff, p.z, -Math.atan2(ez, ex), L / lengde, sy, 1, Math.atan2(ey, h));
  }
  // Tre sider av en etasje: start, retning (ry), lengde og utoverretning
  const SIDER = () => [{ x: -HX, z: HZ, ry: 0, L: BX, ut: [0, 1] }, { x: HX, z: -HZ, ry: Math.PI, L: BX, ut: [0, -1] }, { x: -HX, z: -HZ, ry: -Math.PI / 2, L: BZ, ut: [-1, 0] }, { x: HX, z: HZ, ry: Math.PI / 2, L: BZ, ut: [1, 0] }];
  function nyStolpe(e, x, bunn, topp, z, fot) {
    if (fot) modul(e, 'stolpe_fot', x, bunn, z);
    const b0 = fot ? bunn + 0.5 : bunn; modul(e, 'stolpe_skaft', x, b0, z, 0, 1, topp - b0, 1);
  }
  let rekkNiva = 1;   // de øverste etasjene får et roligere rekkverk
  function rekkverk(e, x0, z0, x1, z1, y = 0) {
    if (NYGARD()) { const rv = rekkNiva >= 2 ? 'rekkverk_enkel' : 'rekkverk';
      const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.3) return; const n = Math.max(1, Math.round(L / 2)), ry = -Math.atan2(z1 - z0, x1 - x0);
      for (let i = 0; i < n; i++) modul(e, rv, x0 + (x1 - x0) * i / n, y + DEKKE - 0.05, z0 + (z1 - z0) * i / n, ry, L / n / 2);
      modul(e, 'rekk_stolpe', x1, y + DEKKE - 0.05, z1); return;
    }
    const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.3) return; const n = Math.max(1, Math.round(L / 1.6));
    for (let i = 0; i <= n; i++) { const t = i / n; boks(e, 0.14, 1.0, 0.14, x0 + (x1 - x0) * t, y + 0.95, z0 + (z1 - z0) * t, HVIT); }
    const r = boks(e, L, 0.12, 0.12, (x0 + x1) / 2, y + 1.45, (z0 + z1) / 2, HVIT); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  }
  function sideMedApning(e, side, ap) {
    const [x0, z0, x1, z1, ak] = { f: [-HX, HZ, HX, HZ, 'x'], b: [-HX, -HZ, HX, -HZ, 'x'], v: [-HX, -HZ, -HX, HZ, 'z'], h: [HX, -HZ, HX, HZ, 'z'] }[side];
    if (!ap || ap.side !== side) return rekkverk(e, x0, z0, x1, z1);
    if (ak === 'x') { rekkverk(e, x0, z0, ap.fra, z0); rekkverk(e, ap.til, z0, x1, z1); } else { rekkverk(e, x0, z0, x0, ap.fra); rekkverk(e, x0, ap.til, x1, z1); }
    if (NYGARD()) { const c = (ap.fra + ap.til) / 2; if (ak === 'x') modul(e, 'portbue', c, DEKKE, z0, side === 'f' ? 0 : Math.PI); else modul(e, 'portbue', x0, DEKKE, c, side === 'h' ? Math.PI / 2 : -Math.PI / 2); return; }
    // Gul port rundt åpningen
    const [px0, pz0, px1, pz1] = ak === 'x' ? [ap.fra, z0, ap.til, z0] : [x0, ap.fra, x0, ap.til];
    const PH = 4.0;   // fri høyde over dekket; roboten er ca. 3,0
    for (const [x, z] of [[px0, pz0], [px1, pz1]]) boks(e, 0.25, PH, 0.25, x, DEKKE + PH / 2, z, GUL);
    const l = boks(e, Math.hypot(px1 - px0, pz1 - pz0) + 0.25, 0.25, 0.25, (px0 + px1) / 2, DEKKE + PH + 0.12, (pz0 + pz1) / 2, GUL); l.rotation.y = ak === 'x' ? 0 : Math.PI / 2;
  }
  function etasje(g, nr) {
    const y = nr * EH, e = new T.Group(); e.position.y = y; e.userData.etasje = nr; g.add(e);
    boks(e, BX, DEKKE, BZ, 0, DEKKE / 2, 0, plankeMat);
    if (NYGARD()) {
      // Rød bjelke med hvit list rundt dekket
      for (const sd of SIDER()) modul(e, 'bjelke', sd.x + sd.ut[0] * 0.15, DEKKE - 0.2, sd.z + sd.ut[1] * 0.15, sd.ry, sd.L + 0.3);
      if (nr > 0) {
        const xs = [-1, -1 / 3, 1 / 3, 1].map(s => s * (HX - 0.35)), zs = [-1, 1].map(s => s * (HZ - 0.35)), bunn = -(EH - DEKKE), topp = -0.38;
        const stolper = []; xs.forEach(x => zs.forEach(z => stolper.push([x, z])));
        if (nr === 1) { stolper.push([-(HX - 0.35), 0], [HX - 0.35, 0]); }          // midtstolper på sidene i fjøset
        stolper.forEach(([x, z]) => nyStolpe(e, x, bunn, topp, z, nr === 1));
        // Knebånd øverst på hver stolpe mot naboene langs kanten
        stolper.forEach(([x, z]) => {
          const ret = [];
          if (Math.abs(Math.abs(z) - (HZ - 0.35)) < 0.01) { if (x > -(HX - 0.4)) ret.push(Math.PI); if (x < HX - 0.4) ret.push(0); }
          if (Math.abs(Math.abs(x) - (HX - 0.35)) < 0.01) { if (z > -(HZ - 0.4)) ret.push(Math.PI / 2); if (z < HZ - 0.4) ret.push(-Math.PI / 2); }
          ret.forEach(ry => modul(e, 'knebaand', x + Math.cos(ry) * 0.25, topp - 1.0, z - Math.sin(ry) * 0.25, ry, 0.95, 0.95, 0.95));
        });
        // Fjøsbuer i første etasje: røde felt med hvit buekant mellom stolpene, åpne nedenfor (matdyrene og veien vises)
        if (nr === 1) {
          const bue = (ax, az, bx, bz, ut) => { const L = Math.hypot(bx - ax, bz - az) - 0.5; const dx = (bx - ax) / (L + 0.5), dz = (bz - az) / (L + 0.5); langs(e, 'bue', { x: ax + dx * 0.25 + ut[0] * 0.02, y: topp - 2.0, z: az + dz * 0.25 + ut[1] * 0.02 }, { x: bx - dx * 0.25 + ut[0] * 0.02, y: topp - 2.0, z: bz - dz * 0.25 + ut[1] * 0.02 }, 1, 0, { x: ut[0], z: ut[1] }, 1.25); };
          for (let i = 0; i < 3; i++) { bue(xs[i], zs[1], xs[i + 1], zs[1], [0, 1]); bue(xs[i], zs[0], xs[i + 1], zs[0], [0, -1]); }
          for (const sx of [-1, 1]) { const x = sx * (HX - 0.35); bue(x, zs[0], x, 0, [sx, 0]); bue(x, 0, x, zs[1], [sx, 0]); }
          // Høyballer og tønner i hjørnene inne i fjøset, der det ikke står plasser
          modul(e, 'hoyball_firk', -HX + 1.0, bunn, -HZ + 0.9, 0.2); modul(e, 'tonne', HX - 0.9, bunn, HZ - 0.9); modul(e, 'tonne', HX - 0.9, bunn, -HZ + 0.9);
        }
        // Lykter på hjørnestolpene og blomsterkasser: bare i nederste åpne etasje, så de øverste nivåene er rolige
        if (nr === 1) for (const [x, z] of [[xs[0], zs[1]], [xs[3], zs[1]], [xs[0], zs[0]], [xs[3], zs[0]]]) modul(e, 'lykt', x, topp - 1.15, z + Math.sign(z) * 0.27, z > 0 ? 0 : Math.PI);
        // Blomsterkasser utenpå rekkverket foran og bak
        if (nr === 1) for (const x of [-HX * 0.55, HX * 0.55]) { modul(e, 'blomsterkasse', x, DEKKE + 0.25, HZ + 0.32, 0); modul(e, 'blomsterkasse', -x, DEKKE + 0.25, -HZ - 0.32, Math.PI); }
        rekkNiva = nr;
        const ap = VEI.apning[nr];
        for (const side of ['f', 'b', 'v', 'h']) sideMedApning(e, side, ap);
      }
      return e;
    }
    // Gul kant rundt dekket
    boks(e, BX + 0.3, 0.3, 0.3, 0, DEKKE - 0.1, HZ, GUL); boks(e, BX + 0.3, 0.3, 0.3, 0, DEKKE - 0.1, -HZ, GUL);
    boks(e, 0.3, 0.3, BZ, HX, DEKKE - 0.1, 0, GUL); boks(e, 0.3, 0.3, BZ, -HX, DEKKE - 0.1, 0, GUL);
    if (nr > 0) {
      for (const sx of [-1, -1 / 3, 1 / 3, 1]) for (const sz of [-1, 1]) stolpe(e, 0.6, EH - DEKKE, 0.6, sx * (HX - 0.35), -(EH - DEKKE) / 2, sz * (HZ - 0.35));
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
    for (const dx of [-0.8, 0.8]) s.add(mesh(new T.CylinderGeometry(0.08, 0.08, 4.4, 8), M('#7a4a22', 0.8), dx, 2.2, 0));
    const tavle = new T.Mesh(new T.PlaneGeometry(2.3, 1.0), new T.MeshStandardMaterial({ map: t, roughness: 0.8, side: T.DoubleSide })); tavle.position.y = 3.9; s.add(tavle);
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
      const t = tan(i), n = new T.Vector2(-t.y, t.x);                 // normal: i = ytterkanten (bort fra låven), o = innerkanten (mot låven)
      const ix = q[0] + n.x * W / 2, iz = q[1] + n.y * W / 2, ox = q[0] - n.x * W / 2, oz = q[1] - n.y * W / 2;
      kant.push({ q, ix, iz, ox, oz, t, n });
      pos.push(ix, q[4], iz, ox, q[4], oz, ix, q[4] - 0.3, iz, ox, q[4] - 0.3, oz);
      uv.push(0, q[3] / 3.2, 1, q[3] / 3.2, 0, q[3] / 3.2, 1, q[3] / 3.2);
      if (i) { const a = (i - 1) * 4, b = i * 4; idx.push(a, b, a + 1, a + 1, b, b + 1, a + 2, a + 3, b + 2, a + 3, b + 3, b + 2, a, a + 2, b, a + 2, b + 2, b, a + 1, b + 1, a + 3, a + 3, b + 1, b + 3); }
    });
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const dekke = new T.Mesh(geo, rampeMat); dekke.castShadow = dekke.receiveShadow = true; rr.add(dekke);
    if (NYGARD()) {
      const V3 = (x, y, z) => ({ x, y, z });
      const ut = k => ({ x: k.n.x, z: k.n.y });
      // Røde sidebjelker hver ~1 m (følger svingen), med hvit list
      for (let i = 0; i + 4 < kant.length; i += 4) {
        const a = kant[i], b = kant[i + 4];
        langs(rr, 'bjelke', V3(a.ix, a.q[4] - 0.2, a.iz), V3(b.ix, b.q[4] - 0.2, b.iz), 1, 0, ut(a));
        langs(rr, 'bjelke', V3(a.ox, a.q[4] - 0.2, a.oz), V3(b.ox, b.q[4] - 0.2, b.oz), 1, 0, { x: -a.n.x, z: -a.n.y });
      }
      // Hvitt rekkverk hver ~2 m på yttersiden, og på innersiden unntatt reposen
      for (let i = 0; i + 8 < kant.length; i += 8) {
        const a = kant[i], b = kant[i + 8];
        // Stolpene står loddrett; bare håndløperen følger helningen
        langs(rr, 'rekk_list', V3(a.ix, a.q[4], a.iz), V3(b.ix, b.q[4], b.iz), 2, 0, ut(a)); modul(rr, 'rekk_stolpe', a.ix, a.q[4], a.iz);
        if (!erRepos(a.q[3]) && !erRepos(b.q[3])) { langs(rr, 'rekk_list', V3(a.ox, a.q[4], a.oz), V3(b.ox, b.q[4], b.oz), 2, 0, { x: -a.n.x, z: -a.n.y }); modul(rr, 'rekk_stolpe', a.ox, a.q[4], a.oz); if (erRepos(kant[Math.min(kant.length - 1, i + 16)].q[3])) modul(rr, 'rekk_stolpe', b.ox, b.q[4], b.oz); }
      }
      const sist = kant[kant.length - 1]; modul(rr, 'rekk_stolpe', sist.ix, sist.q[4], sist.iz);
      // Bærestolper med steinfot
      let nesteB = 0;
      kant.forEach(k => { const d = k.q[3], y = k.q[4]; if (d >= nesteB && y > 1.2) { nesteB = d + 3.2; for (const [x, z] of [[k.ox, k.oz], [k.ix, k.iz]]) nyStolpe(rr, x, 0, y - 0.38, z, true); } });
      // Lyktestolper der rampa starter
      if (nr === 1) { const k0 = kant[0]; for (const [x, z, s] of [[k0.ix, k0.iz, 1], [k0.ox, k0.oz, -1]]) { modul(rr, 'stolpe_fot', x, 0, z, 0, 0.6, 0.6, 0.6); modul(rr, 'stolpe_skaft', x, 0.3, z, 0, 0.55, 2.3, 0.55); modul(rr, 'lykt', x, 2.4, z, Math.atan2(k0.n.x * s, k0.n.y * s)); } }
    } else {
    // Gule kanter og hvitt toppekkverk som rør langs kantene
    const ror = (punkter, r, farge) => { if (punkter.length < 2) return; const k = new T.CatmullRomCurve3(punkter); rr.add(mesh(new T.TubeGeometry(k, Math.max(8, punkter.length), r, 6, false), M(farge, 0.45))); };
    const indreUtenRepos = []; let gruppe = [];
    kant.forEach(k => { if (erRepos(k.q[3])) { if (gruppe.length) indreUtenRepos.push(gruppe); gruppe = []; } else gruppe.push(k); }); if (gruppe.length) indreUtenRepos.push(gruppe);
    ror(kant.map(k => new T.Vector3(k.ox, k.q[4] - 0.05, k.oz)), 0.16, GUL);
    ror(kant.map(k => new T.Vector3(k.ix, k.q[4] - 0.05, k.iz)), 0.16, GUL);
    ror(kant.map(k => new T.Vector3(k.ix, k.q[4] + 1.35, k.iz)), 0.07, HVIT);                                   // ytterkant: sammenhengende rekkverk
    indreUtenRepos.forEach(gr => ror(gr.map(k => new T.Vector3(k.ox, k.q[4] + 1.35, k.oz)), 0.07, HVIT));   // innerkant: åpen ved porten på reposen
    // Stolper: rekkverk hver 1,6, røde bærestolper hver 3,2
    let neste = 0, nesteB = 0;
    kant.forEach(k => {
      const d = k.q[3], y = k.q[4];
      if (d >= neste) { neste = d + 1.6; boks(rr, 0.12, 1.3, 0.12, k.ix, y + 0.7, k.iz, HVIT); if (!erRepos(d)) boks(rr, 0.12, 1.3, 0.12, k.ox, y + 0.7, k.oz, HVIT); }
      if (d >= nesteB && y > 0.8) { nesteB = d + 3.2; for (const [x, z] of [[k.ox, k.oz], [k.ix, k.iz]]) stolpe(rr, 0.4, y - 0.3, 0.4, x, (y - 0.3) / 2, z); }
    });
    }
    // Gule piler oppover rampa (ikke på reposene)
    let nesteP = d0 + 2;
    kant.forEach(k => { if (k.q[3] >= nesteP && !erRepos(k.q[3])) { nesteP = k.q[3] + 4.5; const p = new T.Mesh(pilGeo, M(GUL, 0.4, { emissive: LC(GUL), emissiveIntensity: 0.15 })); p.position.set(k.q[0], k.q[4] + 0.02, k.q[1]); p.rotation.y = Math.atan2(k.t.x, k.t.y); p.receiveShadow = true; rr.add(p); } });
    return { rr, kant };
  }
  const rampeMat = (() => { const m = plankeMat.clone(); m.map = plankeMat.map.clone(); m.map.needsUpdate = true; m.map.repeat.set(1, 1); m.side = T.DoubleSide; return m; })();
  function spiral(g, nr) {
    const { rr, kant } = rampedel(g, nr), k0 = kant[0], [r0, r1] = SPOR.repos[nr], km = kant.find(k => k.q[3] >= (r0 + r1) / 2);
    const vend = k => Math.atan2(k.t.x, k.t.y) + Math.PI;
    // Reposskiltene står inne på etasjen, ved siden av porten, og vender mot den som kommer opp rampa
    if (nr === 1) skilt(rr, ['📍 Repos 1', 'Inn til 2. etasje'], HX - 0.6, km.q[4], -KZ + LREP + 1.4, Math.PI / 2, '#ffe9a8');
    if (nr === 2) { const kk = kant[6]; skilt(rr, ['↗ Rampe 2', '2. → 3. etasje'], kk.ox - kk.n.x * 1.1, kk.q[4] - 0.2, kk.oz - kk.n.y * 1.1, -Math.PI / 2 + 0.6 + Math.PI); skilt(rr, ['📍 Repos 2', 'Inn til 3. etasje'], -HX + 0.6, km.q[4], -KZ - 1.4, -Math.PI / 2, '#ffe9a8'); }
    if (nr === 3) { const kk = kant[6]; skilt(rr, ['↗ Rampe 3', '3. etasje → topp'], kk.ox - kk.n.x * 1.1, kk.q[4] - 0.2, kk.oz - kk.n.y * 1.1, Math.PI / 2 - 0.4 + Math.PI); }
    return rr;
  }
  // Bygg på tunet
  function silo(g, hoy, x, z) { const s = new T.Group(); s.position.set(x, 0, z); g.add(s); s.add(mesh(new T.CylinderGeometry(1.6, 1.6, hoy, 24), M('#d9d4c7', 0.6), 0, hoy / 2, 0)); s.add(mesh(new T.SphereGeometry(1.65, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(ROD, 0.5), 0, hoy, 0)); for (let i = 1; i < hoy / 2; i++) s.add(mesh(new T.TorusGeometry(1.62, 0.05, 6, 32).rotateX(Math.PI / 2), M('#9a9488', 0.6), 0, i * 2, 0)); }
  function lave(g, stor, x, z) { const l = new T.Group(); l.position.set(x, 0, z); g.add(l); const w = stor ? 9 : 6, h = stor ? 6 : 4.2, d = stor ? 7 : 5; boks(l, w, h, d, 0, h / 2, 0, ROD); const tak = new T.CylinderGeometry(0.01, w * 0.62, h * 0.55, 4, 1); const t = mesh(tak, M('#5a3a2e', 0.7), 0, h + h * 0.27, 0, 1, 1, d / w * 1.25); t.rotation.y = Math.PI / 4; l.add(t); boks(l, w * 0.42, h * 0.62, 0.1, 0, h * 0.31, d / 2 + 0.05, HVIT); boks(l, w * 0.34, h * 0.52, 0.12, 0, h * 0.27, d / 2 + 0.08, '#7a2a24'); }
  function honsehus(g, x, z) { const l = new T.Group(); l.position.set(x, 0, z); g.add(l); boks(l, 3.2, 2.2, 2.6, 0, 1.1, 0, '#e7c879'); const t = mesh(new T.ConeGeometry(2.5, 1.4, 4), M(ROD, 0.6), 0, 2.9, 0); t.rotation.y = Math.PI / 4; l.add(t); boks(l, 0.8, 1.0, 0.1, 0, 0.6, 1.32, '#5a3a2e'); }
  function molle(g, x, z, t0) { const m = new T.Group(); m.position.set(x, 0, z); g.add(m); m.add(mesh(new T.CylinderGeometry(1.0, 1.7, 7, 8), M(HVIT, 0.7), 0, 3.5, 0)); m.add(mesh(new T.ConeGeometry(1.4, 1.6, 8), M(ROD, 0.6), 0, 7.8, 0)); const v = new T.Group(); v.position.set(0, 6.4, 1.2); m.add(v); for (let i = 0; i < 4; i++) { const b = boks(v, 0.45, 4.6, 0.08, 0, 0, 0, '#d9c49b'); b.geometry = plateGeo; b.rotation.z = i * Math.PI / 2; b.translateY(2.3); } m.userData.vinge = v; m.userData.ikkeFlett = true; return m; }
  function drivhus(g, x, z) { const d = new T.Group(); d.position.set(x, 0, z); g.add(d); boks(d, 5, 0.4, 3.4, 0, 0.2, 0, '#8b5a2b'); const glass = new T.MeshStandardMaterial({ color: LC('#cfefff'), roughness: 0.1, transparent: true, opacity: 0.35 }); boks(d, 5, 2.4, 3.4, 0, 1.6, 0, glass); for (let i = 0; i < 5; i++) d.add(mesh(new T.SphereGeometry(0.35, 10, 8), M(['#ff6b6b', '#ffd23f', '#7ad66b'][i % 3], 0.6), -2 + i, 0.9, 0)); }
  function taarn(g, x, z) { const t = new T.Group(); t.position.set(x, 0, z); g.add(t); for (const sx of [-1, 1]) for (const sz of [-1, 1]) boks(t, 0.3, 9, 0.3, sx * 1.1, 4.5, sz * 1.1, '#8b5a2b'); boks(t, 3, 0.3, 3, 0, 9, 0, plankeMat); const tk = mesh(new T.ConeGeometry(2.3, 1.8, 4), M(ROD, 0.6), 0, 10.8, 0); tk.rotation.y = Math.PI / 4; t.add(tk); }
  // Gjerde rundt en ellipse. Med port (+1 = forsiden, -1 = baksiden) blir det en åpning på 7 m midt på den siden.
  function gjerde(g, w, d, cx = 0, cz = 0, port = 0) {
    const gap = port ? Math.asin(Math.min(1, 3.5 / w)) : 0, a0 = port > 0 ? Math.PI / 2 : -Math.PI / 2, n = 34;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (port && Math.abs(Math.atan2(Math.sin(a - a0), Math.cos(a - a0))) < gap) continue; boks(g, 0.2, 1.1, 0.2, cx + Math.cos(a) * w, 0.55, cz + Math.sin(a) * d, HVIT); }
    const fra = port ? a0 + gap : 0, spenn = port ? Math.PI * 2 - 2 * gap : Math.PI * 2;
    const kurve = new T.CatmullRomCurve3(Array.from({ length: 49 }, (_, i) => { const a = fra + spenn * i / 48; return new T.Vector3(cx + Math.cos(a) * w, 0.95, cz + Math.sin(a) * d); }), !port);
    const ring = new T.Mesh(new T.TubeGeometry(kurve, 160, 0.07, 6, !port), M(HVIT, 0.7)); ring.castShadow = true; g.add(ring);
    if (port) for (const sx of [-1, 1]) boks(g, 0.35, 2.0, 0.35, cx + sx * 3.6, 1.0, cz + port * d * Math.cos(Math.asin(Math.min(1, 3.6 / w))), GUL);
  }
  function flagg(g, x, y, z, farge) { g.add(mesh(new T.CylinderGeometry(0.07, 0.07, 4, 8), M('#dddddd', 0.4), x, y + 2, z)); const f = mesh(new T.PlaneGeometry(1.8, 1.1), M(farge, 0.6, { side: T.DoubleSide }), x + 0.95, y + 3.4, z); g.add(f); return f; }

  // Plasser: indeks i = etasje floor(i/12), rad og kolonne innenfor etasjen (samme indeks som `base` i lagringen)
  function plassPos(i) { const e = Math.floor(i / 12), j = i % 12, kol = j % 4, rad = Math.floor(j / 4); return new T.Vector3((kol - 1.5) * DX, e * EH + 0.45, (rad - 1) * DZ); }
  function takPlass(k) { return new T.Vector3((k - 1.5) * DX, 3 * EH + 0.45, 0); }

  // Matdyr på plassene: instansert per figur og materiale, så 40 dyr koster få tegnekall
  let figurDeler = null;
  let gamleDeler = null;
  function gamleFigurDeler() { if (!gamleDeler) { H.DET.v = 0.5; gamleDeler = NOKLER.map(n => { const f = H.lag[n](); const s = H.spillSkala(f); f.g.scale.setScalar(s); const rot = new T.Group(); rot.add(f.g); return { deler: slaSammen(rot), sj: f.sj }; }); H.DET.v = 1; } return gamleDeler; }
  function lagFigurDeler() {
    if (visNokler() === NYE_FIGURER) { figurDeler = NYE_FIGURER.map(n => ({ deler: nyFigurDeler(n, 'lav'), sj: DATA.COMBOS[NY_ID[n]].r })); return; }
 H.DET.v = 0.5;
    figurDeler = NOKLER.map(n => { const f = H.lag[n](); const s = H.spillSkala(f); f.g.scale.setScalar(s); const rot = new T.Group(); rot.add(f.g); return { deler: slaSammen(rot), sj: f.sj }; });
    H.DET.v = 1;
  }
  // Matdyrplassene: en høyseng med hvit kant (åpen) eller et dempet tredekke med hengelås (låst)
  const plassMatC = {};
  function plassTekstur(aapen) {
    const k = aapen ? 'a' : 'l'; if (plassMatC[k]) return plassMatC[k];
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    if (aapen) {
      x.fillStyle = '#f6da84'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1100; i++) { const px = Math.random() * 256, py = Math.random() * 256, a = Math.random() * 6.28, l = 6 + Math.random() * 14; x.strokeStyle = ['#fff0b8', '#e2b452', '#cf9a35', '#fde59a'][i % 4]; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
      x.strokeStyle = '#ffffff'; x.lineWidth = 18; x.strokeRect(9, 9, 238, 238); x.strokeStyle = 'rgba(150,90,30,.5)'; x.lineWidth = 3; x.strokeRect(19, 19, 218, 218);
    } else {
      // Låst: mørk, kald skifer med diagonale striper og stor hengelås
      x.fillStyle = '#5d6670'; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 10; for (let i = -256; i < 512; i += 34) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, 256); x.stroke(); }
      x.strokeStyle = '#47505a'; x.lineWidth = 12; x.strokeRect(6, 6, 244, 244);
      x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(98, 118, 60, 46); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 9; x.beginPath(); x.arc(128, 116, 19, Math.PI, 0); x.stroke();
    }
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    return (plassMatC[k] = new T.MeshStandardMaterial({ map: t, roughness: 0.9 }));
  }
  // ---------- Ny grafikk: ressurser fra miljo.glb ----------
  const miljoCache = {};
  function mdel(navn) {
    if (miljoCache[navn] !== undefined) return miljoCache[navn];
    const n = res.miljo && res.miljo.scene.getObjectByName(navn);
    return (miljoCache[navn] = n ? EVNMiljo.deler(n, 1, { vf: true }) : null);
  }
  // Bygg på tunet: nye modeller når de finnes, ellers de gamle
  function byggPaaTun(navn, g, x, z, ry = 0, s = 1) { const d = mdel(navn); if (!d) return false; g.add(EVNMiljo.kopi(d, x, 0, z, ry, s)); return true; }
  function nyMolle(g, x, z) {
    const kropp = mdel('molle_kropp'), vn = res.miljo && res.miljo.scene.getObjectByName('vinge'); if (!kropp || !vn) return false;
    const m = new T.Group(); m.position.set(x, 0, z); m.rotation.y = -0.5; m.userData.ikkeFlett = true; g.add(m);
    m.add(EVNMiljo.kopi(kropp, 0, 0, 0));
    const v = EVNMiljo.kopi(miljoCache.vinge || (miljoCache.vinge = EVNMiljo.deler(vn, 1, { vf: true })), vn.position.x, vn.position.y, vn.position.z); m.add(v); m.userData.vinge = v;
    gd.molle = m; return true;
  }
  // Åker: brun jord med furer og små grønne spirer i rader
  function aakerTekstur(w, d) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#a97a4c'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) { const y = i * 32; const gr = x.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, '#8e6238'); gr.addColorStop(0.45, '#b5865a'); gr.addColorStop(1, '#8a5e36'); x.fillStyle = gr; x.fillRect(0, y, 256, 32);
      for (let k = 0; k < 10; k++) { const px = k * 25.6 + (i % 2) * 12; x.fillStyle = '#6fbf4a'; x.beginPath(); x.ellipse(px + 4, y + 15, 4, 2.4, -0.5, 0, 7); x.ellipse(px + 9, y + 15, 4, 2.4, 0.5, 0, 7); x.fill(); } }
    for (let i = 0; i < 500; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(70,40,15,.25)' : 'rgba(230,200,150,.2)'; x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(w / 8, d / 8); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  // Rektangulært gjerde med port midt på siden nærmest gården
  function rektGjerde(g, x0, x1, z0, z1, ostPort = 0) {
    const st = NY && mdel('gjerde_stolpe'), le = NY && mdel('gjerde_ledd'), stolper = [], ledd = [];
    const side = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.4)); for (let i = 0; i < n; i++) { const p = { x: ax + (bx - ax) * i / n, z: az + (bz - az) * i / n }, q = { x: ax + (bx - ax) * (i + 1) / n, z: az + (bz - az) * (i + 1) / n }; stolper.push(p); ledd.push({ x: p.x, z: p.z, ry: -Math.atan2(q.z - p.z, q.x - p.x), sx: Math.hypot(q.x - p.x, q.z - p.z) / 2.4 }); } };
    side(x0, z0, -3.6, z0); side(3.6, z0, x1, z0); if (ostPort) { const pz = (z0 + z1) / 2; side(x1, z0, x1, pz - ostPort); side(x1, pz + ostPort, x1, z1); stolper.push({ x: x1, z: pz - ostPort }); } else side(x1, z0, x1, z1); side(x1, z1, x0, z1); side(x0, z1, x0, z0); stolper.push({ x: -3.6, z: z0 });
    if (st && le) { const gs = EVNMiljo.instanser(st, stolper), gl = EVNMiljo.instanser(le, ledd); gs.userData.ikkeFlett = gl.userData.ikkeFlett = true; g.add(gs, gl); }
    else { stolper.forEach(p => boks(g, 0.2, 1.1, 0.2, p.x, 0.55, p.z, HVIT)); ledd.forEach(l => { const b = boks(g, l.sx * 2.4, 0.12, 0.08, l.x + Math.cos(-l.ry) * l.sx * 1.2, 0.95, l.z + Math.sin(-l.ry) * l.sx * 1.2, HVIT); b.rotation.y = l.ry; }); }
    for (const sx of [-1, 1]) boks(g, 0.35, 2.0, 0.35, sx * 3.6, 1.0, z0, GUL);
  }
  // Tregjerde langs en ellipse: stolper og ledd instansert. Port (+1 forsiden, -1 baksiden) gir en åpning på 7 m.
  function nyttGjerde(g, w, d, cx = 0, cz = 0, port = 0) {
    const st = mdel('gjerde_stolpe'), le = mdel('gjerde_ledd'); if (!st || !le) return false;
    const n = Math.round(2 * Math.PI * Math.sqrt((w * w + d * d) / 2) / 2.4), pkt = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pkt.push({ x: cx + Math.cos(a) * w, z: cz + Math.sin(a) * d, a }); }
    const i_port = p => port && Math.abs(p.x - cx) < 3.5 && Math.sign(p.z - cz) === port;
    const stolper = pkt.filter(p => !i_port(p)), ledd = [];
    pkt.forEach((p, i) => { const q = pkt[(i + 1) % n]; if (i_port(p) || i_port(q)) return; const dx = q.x - p.x, dz = q.z - p.z; ledd.push({ x: p.x, z: p.z, ry: -Math.atan2(dz, dx), sx: Math.hypot(dx, dz) / 2.4 }); });
    const gs = EVNMiljo.instanser(st, stolper.map(p => ({ x: p.x, z: p.z, ry: p.a }))), gl = EVNMiljo.instanser(le, ledd); gs.userData.ikkeFlett = gl.userData.ikkeFlett = true; g.add(gs, gl);
    if (port) for (const sx of [-1, 1]) boks(g, 0.35, 2.0, 0.35, cx + sx * 3.6, 1.0, cz + port * d * Math.cos(Math.asin(Math.min(1, 3.6 / w))), GUL);
    return true;
  }
  // Verden rundt gården bygges én gang: terreng, sti, trær, busker, steiner, blomster og gress
  const verden = new T.Group(); scene.add(verden);
  function byggVerden() {
    const q = EVNMiljo.NIVAER[KV], ell = (x, z, rx, rz, cz = 0) => (x / rx) ** 2 + ((z - cz) / rz) ** 2;
    const AK = { x0: -31.5, x1: 31.5, z0: 23.5, z1: 56.5 }, iAker = (x, z, m = 0) => x > AK.x0 - m && x < AK.x1 + m && z > AK.z0 - m && z < AK.z1 + m;
    const sti = (x, z) => (Math.abs(x) < 3.2 && z > 15 && z < 24 ? 1 : 0);
    // Matdyr-regns bakke: rolig gress, grus på tunet, jordstier, skogbunn under trærne. Store flater får lite støy,
    // så matdyrene er det som trekker blikket.
    const S = EVNMiljo.stoy, LCc = EVNMiljo.LC, glatt = (a, b, v) => Math.max(0, Math.min(1, (v - a) / (b - a)));
    const MB = EVNMiljo.PROFIL === 'mb';
    // Min Bondegård-profilen: samme gressgrønne som 0.4 (kalibrert mot skjermbilde) og et mindre grustun, så gresset dominerer rundt gården
    const GR = LCc(MB ? '#5eaa2f' : '#7bc457'), GR_L = LCc(MB ? '#66b235' : '#88cc62'), GR_M = LCc(MB ? '#56a02b' : '#6eb54e'), GRUS = LCc('#cdb993'), GRUS_M = LCc('#a8977a'), JORD = LCc('#b58a5c'), SKOG = LCc('#5f9442'), SKOG_B = LCc('#7d7148');
    const grus = (x, z) => { const kant = 0.06 * S(x * 0.9, z * 0.9);
      return Math.max(MB ? 0 : 1 - glatt(0.9, 1.0, ell(x, z, 19, 16) + kant),   // Min Bondegård-profilen: gress helt inn til gården, steinhellene er stien
       1 - glatt(0.85, 1.0, ell(x + 19, z - 0.5, 7, 10) + kant)); };
    const seg = (x, z, x0, z0, x1, z1, b) => { const dx = x1 - x0, dz = z1 - z0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < b ? 1 : 0; };
    const jord = (x, z) => Math.max(sti(x, z), seg(x, z, -10, -6, -16, -6, 1.6), seg(x, z, -10, 2, -15, 6.5, 1.4), seg(x, z, 0, 9, 10.9, 12, 1.4) * 0.9, seg(x, z, 10, 8, 14, 9.2, 1.3) * 0.8);
    const skog = (x, z) => glatt(1.0, 1.35, ell(x, z, 40, 32)) * (iAker(x, z, 4) ? 0 : 1);
    const farge = (x, z, c) => {
      c.copy(GR).lerp(S(x * 0.35, z * 0.35) > 0 ? GR_L : GR_M, Math.min(1, Math.abs(S(x * 0.35, z * 0.35)) * 0.6));   // store, rolige gressflater
      const sk = skog(x, z); if (sk > 0) c.lerp(SKOG, sk * 0.75).lerp(SKOG_B, sk * Math.max(0, S(x * 1.3, z * 1.3)) * 0.45);
      const gu = grus(x, z); if (gu > 0) c.lerp(GRUS, gu).lerp(GRUS_M, gu * Math.max(0, S(x * 2, z * 2)) * 0.4);
      const jo = jord(x, z); if (jo > 0) c.lerp(JORD, Math.min(1, jo));
    };
    const t = EVNMiljo.terreng({ storrelse: 360, ruter: 180, flat: (x, z) => ell(x, z, 95, 80, 8) < 1, hoyde: (x, z) => { const d = Math.sqrt(ell(x, z, 95, 80, 8)); return (d - 1) * 38 * (0.7 + 0.3 * EVNMiljo.stoy(x, z)); }, farge });
    scene.remove(bakke); bakke = t; scene.add(t);
    // Utgangen fra åkeren (øst for porten) holdes fri for spredte trær, busker og steiner. Der går matdyrene, og bare UTBUSKER står der.
    const utgang = (x, z) => x > 29 && x < 62 && Math.abs(z - 40) < 18;
    const fri = (x, z) => ell(x, z, 33, 25) > 1 && !iAker(x, z, 2.5) && !(Math.abs(x) < 5 && z > 10 && z < 25) && !utgang(x, z);
    const D = n => mdel(n), vis = (n, pl, o) => { const d = D(n); if (d && pl.length) verden.add(EVNMiljo.instanser(d, pl, o)); };
    // Trær i en ring rundt gården og enga, tettere lenger ute
    const traer = EVNMiljo.spred(Math.round(90 * q.traer), { fra: [-110, -95], til: [110, 110], avstand: 5.5, frø: 3, skala: [0.85, 1.35], lov: (x, z) => fri(x, z) && ell(x, z, 40, 32) > 1 && !iAker(x, z, 6) && ell(x, z, 110, 95, 8) < 1 });
    vis('tre_eik', traer.filter((_, i) => i % 3 === 0)); vis('tre_gran', traer.filter((_, i) => i % 3 === 1)); vis('tre_eple', traer.filter((_, i) => i % 3 === 2));
    vis('tre_gran', EVNMiljo.spred(Math.round(70 * q.traer), { fra: [-170, -170], til: [170, 170], avstand: 7, frø: 9, skala: [1.2, 2.0], lov: (x, z) => { const d = ell(x, z, 110, 95, 8); return d > 1 && d < 2.4; } }).map(p => ({ ...p, y: (Math.sqrt(ell(p.x, p.z, 95, 80, 8)) - 1) * 38 * (0.7 + 0.3 * EVNMiljo.stoy(p.x, p.z)) - 0.3 })));
    // Busker langs utsiden av gjerdet og enga
    const busker = EVNMiljo.spred(Math.round(26 * q.traer), { fra: [-45, -35], til: [45, 60], avstand: 2.6, frø: 5, skala: [0.8, 1.5], lov: (x, z) => fri(x, z) && (ell(x, z, 37, 28) < 1 || iAker(x, z, 4.5)) });
    vis('busk_1', busker.filter((_, i) => i % 2)); vis('busk_2', busker.filter((_, i) => !(i % 2)));
    const steiner = EVNMiljo.spred(Math.round(10 * q.traer), { fra: [-80, -70], til: [80, 85], avstand: 6, frø: 7, skala: [1.2, 2.2], lov: (x, z) => fri(x, z) && ell(x, z, 42, 34) > 1 });   // få, store steiner i skogkanten
    vis('stein_1', steiner.filter((_, i) => i % 2)); vis('stein_2', steiner.filter((_, i) => !(i % 2)));
    // Blomster i klynger på enga og i gresset
    const blomster = EVNMiljo.spred(Math.round(110 * q.blomst), { fra: [-60, -45], til: [60, 70], frø: 11, skala: [0.9, 1.4], lov: (x, z) => grus(x, z) < 0.05 && !iAker(x, z, 1) && jord(x, z) === 0 && Math.abs(Math.sqrt(ell(x, z, 30, 22)) - 1) < 0.08 && EVNMiljo.stoy(x * 1.5, z * 1.5) > 0.35 });   // klynger ved gjerdet
    vis('blomst_rod', blomster.filter((_, i) => i % 3 === 0), { skygge: false }); vis('blomst_gul', blomster.filter((_, i) => i % 3 === 1), { skygge: false }); vis('blomst_hvit', blomster.filter((_, i) => i % 3 === 2), { skygge: false });
    // Gresstuster overalt der det ikke står noe
    vis('gress', EVNMiljo.spred(Math.round(1100 * q.gress), { fra: [-75, -60], til: [75, 75], frø: 13, skala: [1.0, 2.0], lov: (x, z) => sti(x, z) === 0 && !iAker(x, z, 0.8) && grus(x, z) < 0.1 && ell(x, z, 75, 65, 8) < 1 && (Math.abs(Math.sqrt(ell(x, z, 30, 22)) - 1) < 0.05 || (iAker(x, z, 2) && !iAker(x, z, 0.8))) && EVNMiljo.stoy(x * 1.6, z * 1.6) > 0.1 }), { skygge: false });   // bare langs gjerdet og åkerkanten
    // Min Bondegård-profilen: spredte gresstuster i grupper over hele gressflaten (som i 0.4), men ikke under gården og på stiene
    if (MB) vis('gress', EVNMiljo.spred(Math.round(900 * q.gress), { fra: [-70, -60], til: [70, 70], frø: 17, skala: [1.6, 2.6], lov: (x, z) => sti(x, z) === 0 && jord(x, z) === 0 && !iAker(x, z, 1) && ell(x, z, 15.5, 13) > 1 && ell(x, z, 70, 60, 8) < 1 && EVNMiljo.stoy(x * 0.9 + 3, z * 0.9) > 0.25 }), { skygge: false });
    // Pynt på tunet og enga
    vis('hoyball', [{ x: -14, z: 14, ry: 0.4 }, { x: -12.4, z: 15.2, ry: 1.1 }, { x: 14, z: -13, ry: 2 }, { x: 35, z: 30, ry: 0.3 }, { x: 34.5, z: 32, ry: 1.3 }]);
    vis('kasse', [{ x: 5.2, z: 18, ry: 0.2 }, { x: -35, z: 40, ry: 0.9 }]);
    // Fjell og en innsjø i det fjerne gir dybde (få trekanter, myke farger som går i tåken)
    const fjellMat = new T.MeshStandardMaterial({ color: LC('#7fa98a'), roughness: 1, flatShading: true }), snoMat = new T.MeshStandardMaterial({ color: LC('#eef4f6'), roughness: 1, flatShading: true });
    [[-0.9, 300, 95, 110], [-0.45, 330, 120, 140], [0.0, 310, 80, 120], [0.5, 340, 130, 150], [1.0, 300, 90, 110], [2.6, 320, 110, 130], [3.3, 300, 85, 120], [4.2, 330, 120, 140], [5.0, 310, 95, 115]].forEach(([a, d, h, r]) => {
      const x = Math.sin(a) * d, z = -Math.cos(a) * d, f = new T.Mesh(new T.ConeGeometry(r, h, 7, 2), fjellMat); f.position.set(x, h / 2 - 8, z); f.rotation.y = a * 3; verden.add(f);
      if (h > 110) { const t = new T.Mesh(new T.ConeGeometry(r * 0.28, h * 0.28, 7), snoMat); t.position.set(x, h - 8 - h * 0.14, z); t.rotation.y = a * 3; verden.add(t); }
    });
    const sjo = new T.Mesh(new T.CircleGeometry(1, 40), new T.MeshStandardMaterial({ color: LC('#5fb3d9'), roughness: 0.2, metalness: 0.1 })); sjo.rotation.x = -Math.PI / 2; sjo.scale.set(55, 22, 1); sjo.position.set(70, 0.3, -140); verden.add(sjo);
    scene.fog.far = 520;
    verden.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  }

  function byggGard() {
    gd.gruppe.clear(); const g = gd.gruppe, n = gd.niva, ghost = new T.Group(); g.add(ghost);
    const skal = (nv, fn) => { if (n >= nv) fn(g); else if (gd.neste && nv === n + 1) { fn(ghost); } };
    // Tunet
    gd.gjerdeD = n >= 2 ? 22 : 16;   // gårdsgjerdets z-radius (porten mot åkeren); brukes av leveringsfeltet
    if (!(NY && nyttGjerde(g, n >= 2 ? 30 : 22, n >= 2 ? 22 : 16, 0, 0, gd.eng ? 1 : 0))) gjerde(g, n >= 2 ? 30 : 22, n >= 2 ? 22 : 16, 0, 0, gd.eng ? 1 : 0);
    // Enga foran gården: her regner matdyrene ned (bare i spillet)
    // Tredekke: plankegang fra porten inn til gårdsbygningen
    if (NY && gd.eng) { const fra = HZ + 0.3, til = (n >= 2 ? 22 : 16) - 0.3, dm = plankeMat.clone(); dm.map = plankeMat.map.clone(); dm.map.needsUpdate = true; dm.map.repeat.set(0.85, (til - fra) / 4); const dekke = new T.Mesh(new T.BoxGeometry(3.4, 0.1, til - fra), dm); dekke.position.set(0, 0.05, (fra + til) / 2); dekke.receiveShadow = true; g.add(dekke);
      for (const sx of [-1, 1]) boks(g, 0.14, 0.14, til - fra, sx * 1.75, 0.09, (fra + til) / 2, GUL); }
    // Åkeren rett foran gården: her regner matdyrene ned (bare i spillet)
    if (gd.eng) {
      const e = gd.eng, eg = new T.Group(); eg.userData.ikkeFlett = true; g.add(eg);
      const w = e.x1 - e.x0, d = e.z1 - e.z0, cx = (e.x0 + e.x1) / 2, cz = (e.z0 + e.z1) / 2;
      const jord = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshStandardMaterial({ map: aakerTekstur(w, d), roughness: 0.97 })); jord.rotation.x = -Math.PI / 2; jord.position.set(cx, 0.03, cz); jord.receiveShadow = true; eg.add(jord);
      rektGjerde(eg, e.x0 - 0.6, e.x1 + 0.6, e.z0 - 0.6, e.z1 + 0.6, PORT_HALV);
      // Porten ut av åkeren i øst: to gule stolper, en sti ut og en hekk der matdyrene går videre ut i verden
      const pz = (e.z0 + e.z1) / 2, px = e.x1 + 0.6;
      for (const s2 of [-1, 1]) boks(eg, 0.35, 2.0, 0.35, px, 1.0, pz + s2 * PORT_HALV, GUL);
      const utsti = new T.Mesh(new T.PlaneGeometry(9, PORT_HALV * 2 - 0.6), M('#c9a06a', 0.95)); utsti.rotation.x = -Math.PI / 2; utsti.position.set(px + 4.3, 0.04, pz); utsti.receiveShadow = true; eg.add(utsti);
      skilt(eg, ['👋 Ut av åkeren'], px + 1.2, 0, pz - PORT_HALV - 1.2, -Math.PI / 2, '#ffe9a8');
      // Buskene ute i landskapet øst for porten. Matdyrene går mellom dem og tones bort der. Samme liste brukes som hindringer i navigasjonen.
      if (NY && mdel('busk')) { const hg = EVNMiljo.instanser(mdel('busk'), UTBUSKER); hg.userData.ikkeFlett = true; eg.add(hg); }
      else UTBUSKER.forEach(h => { const b = new T.Mesh(new T.SphereGeometry(1.1 * h.s, 12, 8), M('#4f9a3a', 0.9)); b.position.set(h.x, 0.8, h.z); eg.add(b); });
      const fra = n >= 2 ? 21.5 : 15.5, til = e.z0 - 0.4; const sti = new T.Mesh(new T.PlaneGeometry(6, til - fra + 1), M('#c9a06a', 0.95)); sti.rotation.x = -Math.PI / 2; sti.position.set(0, 0.04, (fra + til) / 2); sti.receiveShadow = true; eg.add(sti);
      skilt(eg, ['🌧️ Åkeren', 'Her regner matdyrene'], 5.4, 0, e.z0 - 1.6, Math.PI, '#ffe9a8');
    }
    // Låvevariantene står med fronten mot tunet (+z), slik at port, høyluke og vinduer synes fra gården og stien
    const LVX = -BX / 2 - 11.5, LVZ = -5.5;   // litt nærmere tunet enn den gamle låven, så bakhjørnet holder seg innenfor gjerdet
    const lvNode = NY && LAAVE && res.laaver && res.laaver.scene.getObjectByName('laave_' + LAAVE);
    if (lvNode) { const d = miljoCache['lv' + LAAVE] || (miljoCache['lv' + LAAVE] = EVNMiljo.deler(lvNode, 1, { vf: true })); g.add(EVNMiljo.kopi(d, LVX, 0, LVZ, 0, n >= 5 ? 1.25 : 1)); }
    else if (!(NY && byggPaaTun('laave', g, -BX / 2 - 12.5, -6, Math.PI / 2, n >= 5 ? 1.25 : 1))) lave(g, n >= 5, -BX / 2 - 12.5, -6);
    // Tunet: steinlagte stier mellom porten, fjøset, rampa, låven og byggene, og litt gårdsliv
    if (NYGARD()) {
      const d = n >= 2 ? 22 : 16, stier = [[[0, d - 0.8], [0, HZ + 1.2]], [[0, HZ + 3.2], [A, HZ + 4.8]], (lvNode ? [[-HX - 1.2, -1], [LVX, LVZ + (n >= 5 ? 6.6 : 5.4)]] : [[-HX - 1.2, -6], [-BX / 2 - 12.5 + (n >= 5 ? 5 : 4) * 1.0 + 0.6, -6]]), (lvNode ? [[-HX - 1.2, -9], [LVX + (n >= 5 ? 7.2 : 5.9) + 2.2, LVZ - 3.5]] : [[-HX - 1.2, 2], [-BX / 2 - 8.5 + 2.2, 6.5]])];
      if (n >= 4) stier.push([[HX + 1.2, 8], [BX / 2 + 5.2, 9.2]]);
      if (n >= 5) stier.push([[HX + 1.2, -7], [BX / 2 + 7.4, -8.4]]);
      let frø = 3; const rnd = () => (frø = (frø * 9301 + 49297) % 233280) / 233280;
      for (const [[x0, z0], [x1, z1]] of stier) { const L = Math.hypot(x1 - x0, z1 - z0), k = Math.max(1, Math.round(L / 1.7)); for (let i = 0; i <= k; i++) modul(g, 'heller', x0 + (x1 - x0) * i / k + (rnd() - 0.5) * 0.25, 0.005, z0 + (z1 - z0) * i / k + (rnd() - 0.5) * 0.25, rnd() * 6.28, 1.25, 1, 1.25); }
      modul(g, 'kjerre', -BX / 2 - 7.2, 0, -12.5, 0.6); modul(g, 'hoyball_firk', -BX / 2 - 6.5, 0, 1.2, 0.3); modul(g, 'hoyball_firk', -BX / 2 - 6.1, 0, 2.4, -0.2); modul(g, 'hoyball_firk', -BX / 2 - 6.3, 0.7, 1.8, 0.1);
      modul(g, 'tonne', HX + 1.4, 0, -HZ - 1.2); modul(g, 'tonne', HX + 2.2, 0, -HZ - 0.9);
      if (!lvNode) modul(g, 'vaerhane', -BX / 2 - 12.5, 7.15 * (n >= 5 ? 1.25 : 1), -6, 0.5);
    }
    // Med en låvevariant står siloen inntil låvens østside, bak på tunet, så låvefronten er fri og låve og silo leses som ett tun
    const siloX = lvNode ? LVX + (n >= 5 ? 7.2 : 5.9) : -BX / 2 - 8.5, siloZ = lvNode ? LVZ - 4 : 6.5;
    if (!(NY && byggPaaTun('silo', g, siloX, siloZ, 0, n >= 4 ? 1.35 : 0.9))) silo(g, n >= 4 ? 11 : 7, siloX, siloZ);
    skal(4, gg => { if (!(NY && byggPaaTun('honsehus', gg, BX / 2 + 7, 10, -0.6))) honsehus(gg, BX / 2 + 7, 10); });
    skal(5, gg => { if (!(NY && nyMolle(gg, BX / 2 + 9, -9))) gd.molle = molle(gg, BX / 2 + 9, -9); });
    skal(7, gg => { if (!(NY && byggPaaTun('drivhus', gg, -6, 15, 0))) drivhus(gg, -6, 15); });
    skal(8, gg => { if (!(NY && byggPaaTun('taarn', gg, -BX / 2 - 15, 14, 0.3))) taarn(gg, -BX / 2 - 15, 14); });
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
    const plassMatAapen = NY ? plassTekstur(true) : M('#d3b07a', 0.8), plassMatLaast = NY ? plassTekstur(false) : M('#7d7d7d', 0.9);
    const plasser = []; for (let i = 0; i < antPlasser; i++) plasser.push(plassPos(i)); if (n >= 9) for (let k = 0; k < 4; k++) plasser.push(takPlass(k));
    const aapne = gd.aapne != null ? Math.min(gd.aapne, plasser.length) : Math.min(tak, plasser.length);
    const plateInst = new T.InstancedMesh(plateGeo, plassMatAapen, aapne), laastInst = new T.InstancedMesh(plateGeo, plassMatLaast, Math.max(0, plasser.length - aapne));
    const m4 = new T.Matrix4(), q = new T.Quaternion(), sk = new T.Vector3(3.2, 0.2, 3.2);
    plasser.forEach((p, i) => { m4.compose(new T.Vector3(p.x, p.y + 0.1, p.z), q, sk); if (i < aapne) plateInst.setMatrixAt(i, m4); else laastInst.setMatrixAt(i - aapne, m4); });
    plateInst.receiveShadow = laastInst.receiveShadow = true; g.add(plateInst, laastInst);
    // Fyll de åpne plassene med matdyr: i spillet fra lagringen, ellers de fem figurene om hverandre
    if (gd.tegnDyr) gd.tegnDyr(g, plasser, aapne);
    else {
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
    }
    // Roboten på bakkeplanet ved rampa
    const r = lagRobot(); r.g.userData.ikkeFlett = true; r.g.position.set(A - 2.4, 0, HZ + 6.6); r.g.rotation.y = Math.PI * 0.85; g.add(r.g); gd.robot = r.g;   // ved foten av rampe 1
    // Etasjer over roboten gjøres gjennomsiktige
    if (gd.gjennom) g.traverse(o => { if (!o.isMesh) return; let p = o; while (p && p.userData.etasje === undefined) p = p.parent; const e = p ? p.userData.etasje : 0; if (e >= 1 && !(o.material.opacity < 0.3)) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.45; o.material.depthWrite = false; } });
    if (fane === 'gard') visKortGard(aapne, plasser.length);
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
    const navn = { donutku: ['🍩', 'Donutku'], burgersau: ['🍔', 'Burgersau'], pizzaskilpadde: ['🍕', 'Pizzaskilpadde'], croissantrev: ['🥐', 'Croissantrev'], iskatt: ['🍦', 'Iskatt'], shakeand: ['🥤', 'Shakeand'], spagettipingvin: ['🍝', 'Spagettipingvin'] };
    visNokler().forEach(n => { const b = knapp(smal ? navn[n][0] : navn[n].join(' '), md.visning !== 'alle' && md.valgt === n, () => { md.valgt = n; if (md.visning === 'alle') md.visning = 'forfra'; visMatdyr(); byggPanelMatdyr(); }); b.setAttribute('aria-label', navn[n][1]); if (smal) b.style.fontSize = '22px'; r1.appendChild(b); });
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
  const bygdeEtasjer = () => gd.niva >= 9 ? 3 : gd.niva >= 6 ? 2 : gd.niva >= 3 ? 1 : 0;
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
    const r = gd.robot; if (!r || sp.pause) return;
    let ix = (sp.taster.d || sp.taster.arrowright ? 1 : 0) - (sp.taster.a || sp.taster.arrowleft ? 1 : 0) + sp.inn.x;
    let iz = (sp.taster.w || sp.taster.arrowup ? 1 : 0) - (sp.taster.s || sp.taster.arrowdown ? 1 : 0) + sp.inn.z;
    const m = Math.hypot(ix, iz); if (m > 1) { ix /= m; iz /= m; }
    const fx = -Math.sin(bane.teta), fz = -Math.cos(bane.teta), rx = Math.cos(bane.teta), rz = -Math.sin(bane.teta);
    const vx = (fx * iz + rx * ix) * FART, vz = (fz * iz + rz * ix) * FART, p = r.position;
    const gaar = m > 0.1;
    if (gaar) {
      const nx = p.x + vx * dt, nz = p.z + vz * dt, y = p.y;
      const ok = (x, z) => { const rh = rampeHoyde(x, z); return !(rh !== null && rh > y + STEG && rh < y + 2.6) && !blokkert(p.x, p.z, x, z, y) && flateVed(x, z, y) <= y + STEG && ((x / 31) ** 2 + (z / 23) ** 2 < 1 || (gd.eng && x > gd.eng.x0 && x < gd.eng.x1 && z > gd.eng.z0 && z < gd.eng.z1) || (gd.eng && Math.abs(x) < 3 && z > 0 && z < gd.eng.z0 + 1)); };
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
  // Ett glassmateriale per originalmateriale (gjenbrukes, så det ikke lages nye kopier ved hver oppdatering)
  const glassCache = new WeakMap();
  function glassFor(m0) { let m = glassCache.get(m0); if (!m) { m = m0.clone(); m.transparent = true; m.opacity = 0.3; m.depthWrite = false; glassCache.set(m0, m); } return m; }
  function forberedGjennom() {
    etasjeMesher = [];
    gd.gruppe.traverse(o => { if (!o.isMesh || o.isInstancedMesh && false) return; let q = o; while (q && q.userData.etasje === undefined) q = q.parent; if (!q || !q.userData.etasje) return; o.userData.orig = o.material; o.userData.glass = glassFor(o.material); etasjeMesher.push([o, q.userData.etasje]); });
  }
  function settGjennom(e) { etasjeMesher.forEach(([o, et]) => { o.material = et > e ? o.userData.glass : o.userData.orig; }); }
  function startSpill() {
    if (krok.start) return krok.start();
    gd.aapne = null; gd.tegnDyr = null; gd.eng = null; gd.niva = sp.niva; gd.neste = false; gd.gjennom = false; byggGard(); byggVegger(); forberedGjennom();
    const r = gd.robot; r.position.set(A, 0, HZ + 7); r.rotation.y = Math.PI; sp.vy = 0; sp.paaBakken = true; sp.etasje = -1;
    Object.assign(bane, { teta: 0, fi: 1.12, r: innerWidth < 640 ? 18 : 15, rMin: 6, rMax: 40, auto: false });
    $('kort').innerHTML = '<h1>Prøv rampa</h1><div>Gå opp spiralrampa og inn i etasjene. Prøv å hoppe.</div><div class="liten">' + (TOUCH ? 'Styrespak nede til venstre, hopp nede til høyre. Dra på skjermen for å snu kameraet.' : 'WASD eller piltaster: gå · Mellomrom: hopp · Dra med musa: kamera · Hjul: zoom') + '</div><div id="spillStatus" class="rute">📍 1. etasje (bakken)</div>';
  }
  function byggPanelSpill() {
    if (krok.panel) return krok.panel();
    const p = $('panel'); p.textContent = ''; const r1 = document.createElement('div'); r1.className = 'rad';
    const smal = innerWidth < 640; [3, 6, 9].forEach(n => { const t = (smal ? 'Nivå ' : 'Gårdsnivå ') + n; r1.appendChild(knapp(t, sp.niva === n, () => { sp.niva = n; startSpill(); byggPanelSpill(); })); });
    r1.appendChild(knapp(smal ? '↺ Start' : '↺ Til start', false, () => { startSpill(); }));
    p.append(r1);
  }
  addEventListener('keydown', e => { if (fane !== 'spill' || sp.pause) return; const k = e.key.toLowerCase(); if (k === ' ') { sp.hopp = true; e.preventDefault(); } sp.taster[k] = true; if (k.startsWith('arrow')) e.preventDefault(); });
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
    else if (f === 'gard') { holder.classList.remove('ramme'); storrelse(); scene.fog.near = 120; gd.aapne = null; gd.tegnDyr = null; gd.eng = null; byggGard(); settKameraGard(); byggPanelGard(); }
    else { holder.classList.remove('ramme'); storrelse(); scene.fog.near = 120; startSpill(); byggPanelSpill(); }
    if (krok.fane) krok.fane(f);
  }
  $('fGrafikk').addEventListener('click', () => apneGrafikk());
  $('fSpill').addEventListener('click', () => velgFane('spill'));
  $('fMatdyr').addEventListener('click', () => velgFane('matdyr'));
  $('fGard').addEventListener('click', () => velgFane('gard'));

  // ---------- Størrelse, løkke og målinger ----------
  function storrelse() { const w = holder.clientWidth || innerWidth, h = holder.clientHeight || innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', () => { storrelse(); if (fane === 'matdyr') { if (md.visning === 'spill') settKameraMatdyr(); byggPanelMatdyr(); } });
  let sist = performance.now(), fpsT = 0, fpsN = 0, fps = 0;
  // ---------- Grafikk og ytelse: kvalitetsvalg og måling på ekte enhet ----------
  const maaler = NY ? EVNMiljo.maaler(renderer) : null;
  const adaptivSteg = NY ? EVNMiljo.adaptiv(renderer, KV, () => storrelse()) : null;
  function apneGrafikk() {
    let d = $('grafikk'); if (!d) { d = document.createElement('div'); d.id = 'grafikk'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Grafikk og ytelse'); document.body.appendChild(d); }
    const i = renderer.info.render, nv = NY ? EVNMiljo.NIVAER[KV] : null;
    d.innerHTML = '<h2>⚙️ Grafikk og ytelse</h2>' + (NY ? '<div class="rad">' + Object.keys(EVNMiljo.NIVAER).map(k => '<button type="button" data-k="' + k + '" aria-pressed="' + (k === KV) + '">' + EVNMiljo.NIVAER[k].navn + '</button>').join('') + '</div>' : '<p>Gammel grafikk (sammenligning).</p>') +
      '<p class="liten">' + (maaler ? maaler.gpu : '') + '<br>Skjerm ' + innerWidth + '×' + innerHeight + ' · piksler ×' + renderer.getPixelRatio() + ' · ' + i.calls + ' tegnekall · ' + Math.round(i.triangles / 1000) + 'k trekanter</p>' +
      (NY ? '<div class="rad"><button type="button" id="profilBytt">' + (EVNMiljo.PROFIL === 'mb' ? '↩ Vanlig grafikkprofil' : '🎨 Prøv Min Bondegård-profilen') + '</button></div>' : '') +
      '<p class="liten">Gangfart på åkeren (spilltest)</p><div class="rad">' + [['0.7', '🐢 Rolig'], ['1', '🚶 Vanlig'], ['1.4', '🐇 Rask']].map(([v, n]) => '<button type="button" data-gang="' + v + '" aria-pressed="' + (String(GANGFART) === v) + '">' + n + '</button>').join('') + '</div>' +
      (NY ? '<div class="rad"><button type="button" id="pilotBytt">' + (PILOT.length ? '↩ Uten figurpiloten' : '🧪 Figurpiloten i spillet') + '</button><button type="button" id="pilotVis">🖼️ Figurpiloten (16)</button></div>' : '') + (NY && EVNMiljo.PROFIL !== 'mb' ? '<div class="rad"><button type="button" id="tmBytt">' + (SAMMENLIGN ? '◻ Vanlig visning' : '◧ Sammenlign tonemapping (delt skjerm)') + '</button></div>' : '') + '<p id="maalRes" class="liten">Trykk «Mål» og la spillet stå i 10 sekunder.</p><div class="rad"><button type="button" id="maalStart">📊 Mål i 10 s</button><button type="button" id="maalBytt">' + (NY ? '↔ Vis gammel grafikk' : '↔ Vis ny grafikk') + '</button><button type="button" id="maalLukk">Lukk</button></div>';
    d.hidden = false;
    d.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { EVNMiljo.lagreKvalitet(b.dataset.k); const u = new URL(location.href); u.searchParams.set('kvalitet', b.dataset.k); location.href = u; });
    $('maalLukk').onclick = () => { d.hidden = true; };
    d.querySelectorAll('[data-gang]').forEach(b => b.onclick = () => { const u = new URL(location.href); if (b.dataset.gang === '1') u.searchParams.delete('gangfart'); else u.searchParams.set('gangfart', b.dataset.gang); location.href = u; });
    if ($('pilotBytt')) $('pilotBytt').onclick = () => { const u = new URL(location.href); if (PILOT.length) u.searchParams.delete('pilot'); else u.searchParams.set('pilot', '1'); location.href = u; };
    if ($('pilotVis')) $('pilotVis').onclick = () => { location.href = 'nyefigurer.html?profil=mb&vinkler=34&figur=' + Object.keys(PILOT_ID).join(','); };
    if ($('profilBytt')) $('profilBytt').onclick = () => { const u = new URL(location.href); if (EVNMiljo.PROFIL === 'mb') u.searchParams.delete('profil'); else { u.searchParams.set('profil', 'mb'); u.searchParams.delete('tonemap'); } location.href = u; };
    if ($('tmBytt')) $('tmBytt').onclick = () => { const u = new URL(location.href); if (SAMMENLIGN) u.searchParams.delete('tonemap'); else u.searchParams.set('tonemap', 'sammenlign'); location.href = u; };
    $('maalBytt').onclick = () => { const u = new URL(location.href); if (NY) u.searchParams.set('grafikk', 'gammel'); else u.searchParams.delete('grafikk'); location.href = u; };
    $('maalStart').onclick = () => { $('maalRes').textContent = 'Måler …'; const t0 = performance.now(); setTimeout(() => {
      const r = maaler ? maaler.rapport(10) : { fps, ms: +(1000 / Math.max(1, fps)).toFixed(1), p95: '?' }, ii = renderer.info.render;
      const tekst = 'Matdyr-regn prototype · ' + (NY ? 'ny grafikk' + (EVNMiljo.PROFIL === 'mb' ? ' (profil mb)' : '') + ', ' + nv.navn : 'gammel grafikk') + ' · ' + r.fps + ' FPS (snitt ' + r.ms + ' ms, 95 % under ' + r.p95 + ' ms) · ' + ii.calls + ' tegnekall · ' + Math.round(ii.triangles / 1000) + 'k trekanter · ' + innerWidth + '×' + innerHeight + '@' + renderer.getPixelRatio() + ' · ' + (maaler ? maaler.gpu : '');
      $('maalRes').innerHTML = '<b>' + r.fps + ' FPS</b><br><span style="user-select:all">' + tekst + '</span>'; window.EVNMaaling = tekst; }, 10000); };
  }
  const SOLRET = EVNMiljo.PROFIL === 'mb' ? [-18.2, 28, 15.4] : [12, 22, 10];
  function loop(na) {
    const ekteDt = (na - sist) / 1000, dt = Math.min(0.05, ekteDt); sist = na; const t = na / 1000;
    if (bane.auto && !REDUSERT) bane.teta += dt * 0.35;
    oppdaterKamera();
    if (fane === 'matdyr') md.alle.forEach(f => f.ny ? (!REDUSERT && animerNy(f, t, md.gaar)) : H.animer(f, t, md.gaar && !REDUSERT));
    if (fane === 'spill') { steg(dt); if (krok.steg) krok.steg(dt, t); if (gd.robot) { const p = gd.robot.position; sol.position.set(p.x + SOLRET[0], p.y + SOLRET[1], p.z + SOLRET[2]); sol.target.position.set(p.x, p.y, p.z); } }
    else if (sol.target.position.lengthSq()) { sol.position.set(...SOLRET); sol.target.position.set(0, 0, 0); }
    if (robotMixer) robotMixer.update(dt);
    if (maaler) maaler.ramme();
    if (adaptivSteg && !/adaptiv=0/.test(location.search)) adaptivSteg();
    if (gd.molle && gd.molle.userData.vinge && !REDUSERT) gd.molle.userData.vinge.rotation.z += dt * 0.8;
    if (SAMMENLIGN && LYS) {
      const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight; renderer.setScissorTest(true);
      for (const [x, aces] of [[0, true], [w / 2, false]]) {
        renderer.toneMapping = aces ? T.ACESFilmicToneMapping : T.NoToneMapping;
        LYS.himmel.intensity = aces ? 0.7 : 0.48; LYS.sol.intensity = aces ? 1.45 : 0.82; LYS.fyll.intensity = aces ? 0.35 : 0.16;
        renderer.setViewport(0, 0, w, h); renderer.setScissor(x, 0, w / 2, h); renderer.render(scene, camera);
      }
      renderer.setScissorTest(false);
    } else renderer.render(scene, camera);
    fpsN++; fpsT += ekteDt; if (fpsT > 0.5) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; const i = renderer.info.render; $('maal').textContent = fps + ' FPS · ' + i.calls + ' tegnekall · ' + Math.round(i.triangles / 1000) + 'k trekanter'; window.EVNMaal = { fps, kall: i.calls, trekanter: i.triangles }; }
    requestAnimationFrame(loop);
  }
  storrelse();
  if (SAMMENLIGN) { const e = document.createElement('div'); e.id = 'tmEtikett'; e.innerHTML = '<span>ACES</span><span>Uten tonemapping</span>'; document.body.appendChild(e); }
  // Start først når alle skriptene er lastet (spillkjerne.js kobler seg på etter denne filen)
  const sideKlar = new Promise(ok => document.readyState === 'loading' ? addEventListener('DOMContentLoaded', ok) : ok());
  Promise.all([robotKlar, sideKlar, ressurserKlar]).then(() => { if (NY) byggVerden(); velgFane('matdyr'); requestAnimationFrame(loop); window.EVNKlar = true; });
  // For automatiske skjermbilder: ?fane=gard&niva=6 eller ?figur=burgersau&vis=spill
  window.EVNIntern = { UTBUSKER, PORT_HALV, GANGFART, T, scene, sol, renderer, camera, apneGrafikk, gd, sp, bane, krok, NIVA, EH, HX, HZ, A, BX, BZ, DEKKE, byggGard, byggVegger, forberedGjennom, settGjennom, plassPos, takPlass, knapp, spillAnim, oppdaterKamera, etasjeNavn, TOUCH, REDUSERT, robot: () => gd.robot, fane: () => fane, NOKLER, NY, KV, nyNavnFor, nyFigur, nySkala, nyFigurDeler, animerNy, verden: () => verden, gamleFigurDeler, figurDelerFor: () => { if (!figurDeler) lagFigurDeler(); return figurDeler; } };
  window.EVNSpill = sp; window.EVNRobot = () => gd.robot; window.EVNSteg = steg; window.EVNSpor = SPOR; window.EVNGeo = { HX, HZ, EH, DEKKE, W, KX, KZ, A, B, LREP }; window.EVNBane = bane; window.EVNVegger = () => vegger;
  window.EVNVis = (o) => { if (o.fane === 'spill') { if (o.niva) sp.niva = sp.testNiva = o.niva; velgFane('spill'); return; } if (o.fane === 'gard') { if (o.niva) gd.niva = o.niva; if (o.neste !== undefined) gd.neste = o.neste; velgFane('gard'); if (o.teta !== undefined) { bane.teta = o.teta; oppdaterKamera(); } } else { if (o.figur) md.valgt = o.figur; if (o.vis) md.visning = o.vis; if (o.mobil) holder.classList.add('ramme'); storrelse(); velgFane('matdyr'); if (o.teta !== undefined) bane.teta = o.teta; } };
})();
