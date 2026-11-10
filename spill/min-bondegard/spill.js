/* Min Bondegård – spillet (0.8.0)
   Bygger på den grafiske testscenen 0.7.4 (samme verden, modeller og dyr). Spillreglene ligger i logikk.js, tallene i data.js.
   Denne fila kobler reglene til verden: åkre og bygg som kan flyttes, robotens jobber, grensesnittet, lagring og opplæringen. */
'use strict';
const L = window.MBLogikk, D = window.MB_DATA;
const SPILLVERSJON = window.MB_VERSJON;
const TESTMODUS = new URLSearchParams(location.search).has('test');
if (TESTMODUS) document.body.classList.add('test');
const LAGRING = TESTMODUS ? 'evn-min-bondegard-test' : 'evn-min-bondegard-v1';
const $ = id => document.getElementById(id);
const naa = () => Date.now();
const fmtTid = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : s + ' s'; };
const navn = v => D.info(v).navn, ikon = v => D.info(v).ikon;
if (matchMedia('(pointer:coarse)').matches) document.documentElement.classList.add('touch');
addEventListener('pointerdown', e => document.documentElement.classList.toggle('touch', e.pointerType === 'touch'), {passive: true, capture: true});

// Det som er laget i denne versjonen. Resten av nivå 1–10 ligger i data.js og kommer i fase 2–4.
const I_SPILLET = {avlinger: ['hvete', 'mais'], bygg: ['forkvern', 'bakeri'], dyr: ['hone']};

/* ======================= Lagring (F2, F3) ======================= */
let s = null, lagringFeilet = false;
function lesLagring() {
  let raw = null;
  try { raw = localStorage.getItem(LAGRING); } catch (e) {}
  if (raw === null) return {s: L.ny(naa()), ny: true};
  let obj = null; try { obj = JSON.parse(raw); } catch (e) {}
  const v = L.valider(obj, naa());
  if (v) return {s: v, ny: false, sist: obj && typeof obj.sist === 'number' ? obj.sist : v.sist};
  try { const gml = localStorage.getItem(LAGRING + '-kopi'); if (gml !== null && gml !== raw) localStorage.setItem(LAGRING + '-kopi2', gml); localStorage.setItem(LAGRING + '-kopi', raw); } catch (e) {}   /* to siste uleselige lagringer tas vare på (QA 9.11) */   // ødelagt eller for ny lagring tas vare på, også når det finnes en eldre kopi (QA 9.11, F3)
  return {s: L.ny(naa()), ny: true, reddet: true};
}
function lagre() {
  if (!s) return;
  s.seq++; s.sist = Math.max(s.sist, naa());
  try { localStorage.setItem(LAGRING, JSON.stringify(s)); lagringFeilet = false; } catch (e) { lagringFeilet = true; }
}
// Har en annen fane lagret nyere fremgang, brukes den. Da kan ingenting hentes to ganger i to faner.
function sjekkAnnenFane() {
  try { const r = JSON.parse(localStorage.getItem(LAGRING)); if (r && typeof r.seq === 'number' && r.seq > s.seq) { const v = L.valider(r, naa()); if (v) { s = v; plasserAlt(); synk(true); lukkHandling(); } } } catch (e) {}
}
addEventListener('storage', e => { if (e.key === LAGRING) sjekkAnnenFane(); });
const forste = lesLagring(); s = forste.s;
const sistSett = forste.sist || s.sist;

/* ======================= Hjelpere for 3D ======================= */
const ikonTex = new Map();
function ikonTekstur(tegn, bakgrunn = '#fffaf0') {
  const k = tegn + bakgrunn; if (ikonTex.has(k)) return ikonTex.get(k);
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.arc(64, 68, 56, 0, 7); x.fill();
  x.fillStyle = bakgrunn; x.beginPath(); x.arc(64, 62, 56, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = '#e9b949'; x.stroke();
  x.font = '68px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tegn, 64, 66);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; ikonTex.set(k, t); return t;
}
function lagIkon(hoydeY) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: ikonTekstur('❔'), depthTest: false, transparent: true})); sp.scale.setScalar(1.25); sp.renderOrder = 10; sp.visible = false; sp.userData.y0 = hoydeY; return sp; }
function settIkon(sp, tegn) { if (!tegn) { sp.visible = false; return; } sp.visible = true; const t = ikonTekstur(tegn); if (sp.material.map !== t) { sp.material.map = t; sp.material.needsUpdate = true; } }
const pilTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#ffd23f'; x.strokeStyle = '#8a4b00'; x.lineWidth = 8;
  x.beginPath(); x.moveTo(40, 8); x.lineTo(88, 8); x.lineTo(88, 62); x.lineTo(114, 62); x.lineTo(64, 120); x.lineTo(14, 62); x.lineTo(40, 62); x.closePath(); x.fill(); x.stroke(); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; })();
let pil = null;
function eierAv(g) { g.traverse(o => { if (o.isMesh) o.userData.eier = g; }); }

/* ======================= Åkre i spillet ======================= */
// Én gruppe per åker, så åkrene kan flyttes (planens beslutning B3). Plantene er ferdige geometrier per avling og stadium, delt mellom alle åkrene.
const STR = 3.05, AKER_FOT = 3.4;
const PROTO = {};
let MAT_PLANTE = null, JORD_GEO = null, RAMME_GEO = null;
function lagAkerProto() {
  MAT_PLANTE = std({vertexColors: true, roughness: 0.7, side: THREE.DoubleSide});
  const g = new THREE.PlaneGeometry(STR - 0.25, STR - 0.25, 24, 24); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let k = 0; k < p.count; k++) { const lx = p.getX(k), lz = p.getZ(k); const kant = Math.min(1, (STR / 2 - 0.12 - Math.max(Math.abs(lx), Math.abs(lz))) * 5);
    p.setY(k, (0.08 + Math.cos(lz / (STR - 0.25) * Math.PI * 2 * 5) * 0.07) * Math.max(0, kant) + 0.18 + (hash(lx * 9, lz * 9, 3) - 0.5) * 0.03); }
  g.computeVertexNormals(); teksturUV(g, 1.3, 1.3); JORD_GEO = g;
  const ramme = []; [[0, STR / 2, 0], [0, -STR / 2, 0], [STR / 2, 0, 1], [-STR / 2, 0, 1]].forEach(([dx, dz, rot]) => ramme.push({geo: avrundetBoks(STR + 0.25, 0.28, 0.24, 0.1, 2), m: M4(dx, 0.16, dz, 0, rot ? Math.PI / 2 : 0, 0), farge: 0x9a6a3c}));
  RAMME_GEO = samle(ramme);
  const fure = fn => { for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) fn(-STR / 2 + 0.36 + k * 0.385 + (r % 2) * 0.09, -STR / 2 + 0.33 + r * 0.6, r, k); };
  const GRONN = 0x74c443, MODEN = 0xe3bb4b, AKS = 0xf2cb5c, MAISGR = 0x5fae3a;
  // frø og spirer (felles for alle avlinger)
  const haug = new THREE.SphereGeometry(0.1, 8, 4); const d0 = []; fure((x, z) => d0.push({geo: haug, m: M4(x, 0.27, z, 0, 0, 0, 1.4, 0.45, 1.4), farge: 0x5d3d24})); PROTO.fro = samle(d0);
  const spireG = new THREE.SphereGeometry(0.1, 10, 6); spireG.scale(1.1, 0.22, 0.5); spireG.translate(0.09, 0, 0);
  const d1 = []; fure((x, z, r, k) => [0, 2.1, 4.2].forEach(a => d1.push({geo: spireG, m: M4(x, 0.36, z, 0, a + k, 0.45), farge: GRONN}))); PROTO.spire = samle(d1);
  // hvete: grønn og moden
  const straG = new THREE.ConeGeometry(0.028, 1, 4); straG.translate(0, 0.5, 0);
  const bladG = new THREE.ConeGeometry(0.05, 0.6, 3); bladG.translate(0, 0.3, 0); bladG.scale(1, 1, 0.25);
  const aksG = new THREE.SphereGeometry(0.055, 6, 4); aksG.scale(1, 2.8, 1);
  [false, true].forEach(moden => { const d = []; fure((x, z) => { for (let s2 = 0; s2 < 7; s2++) { const a = s2 / 7 * 6.28 + hash(x, z, s2), lean = 0.06 + hash(z, x, s2) * 0.2, hh = (moden ? 1.05 : 0.7) * (0.85 + hash(x, s2, z) * 0.3);
      const e = new THREE.Euler(Math.sin(a) * lean, 0, Math.cos(a) * lean); const bx = x + Math.cos(a) * 0.05, bz = z + Math.sin(a) * 0.05;
      d.push({geo: straG, m: M4(bx, 0.26, bz, e.x, 0, e.z, 1, hh, 1), farge: moden ? MODEN : GRONN});
      if (!moden && s2 % 2 === 0) d.push({geo: bladG, m: M4(bx, 0.26, bz, e.x * 3, a, e.z * 3, 1, 0.8, 1), farge: GRONN});
      if (moden) { const top = new THREE.Vector3(0, hh, 0).applyEuler(e); d.push({geo: aksG, m: M4(bx + top.x, 0.26 + top.y, bz + top.z, e.x, 0, e.z), farge: AKS}); } } });
    PROTO[moden ? 'hvete3' : 'hvete2'] = samle(d); });
  // mais: grønn og moden
  const stengG = new THREE.CylinderGeometry(0.03, 0.055, 1, 6); stengG.translate(0, 0.5, 0);
  const maisBlad = new THREE.BufferGeometry(); maisBlad.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, 0.35,0.06,0.08, 0.35,0.06,-0.08, 0.35,0.06,0.08, 0.72,-0.02,0, 0.35,0.06,-0.08], 3)); maisBlad.computeVertexNormals();
  const kolbeG = new THREE.SphereGeometry(0.09, 8, 6); kolbeG.scale(1, 2.5, 1); const duskG = new THREE.ConeGeometry(0.1, 0.25, 6);
  [false, true].forEach(moden => { const d = []; for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
    const px = -STR / 2 + 0.45 + k * 0.72 + hash(r, k, 4) * 0.1, pz = -STR / 2 + 0.45 + r * 0.72, hh = (moden ? 1.75 : 1.05) * (0.9 + hash(k, r, 5) * 0.2);
    d.push({geo: stengG, m: M4(px, 0.26, pz, 0, 0, 0, 1, hh, 1), farge: MAISGR});
    for (let b = 0; b < 5; b++) d.push({geo: maisBlad, m: M4(px, 0.38 + b * hh * 0.19, pz, 0, b * 2.3 + k + r, -0.25 - b * 0.08 - hash(b, k, r) * 0.2, moden ? 1 : 0.8), farge: MAISGR});
    if (moden) { d.push({geo: kolbeG, m: M4(px + 0.08, 0.26 + hh * 0.55, pz, 0, k, 0.35), farge: 0xf6cd3d}, {geo: kolbeG, m: M4(px - 0.08, 0.26 + hh * 0.42, pz + 0.04, 0, k + 3, -0.4), farge: 0xf6cd3d}, {geo: duskG, m: M4(px, 0.26 + hh + 0.08, pz), farge: 0xd9b764}); }
  } PROTO[moden ? 'mais3' : 'mais2'] = samle(d); });
}
function lagAkerGruppe(f) {
  const g = new THREE.Group(); scene.add(g);
  const jord = new THREE.Mesh(JORD_GEO, MAT.jord); jord.receiveShadow = true; g.add(jord);
  const ramme = new THREE.Mesh(RAMME_GEO, MAT.vertex); ramme.castShadow = true; ramme.receiveShadow = true; g.add(ramme);
  const plante = new THREE.Mesh(PROTO.fro, MAT_PLANTE); plante.castShadow = true; plante.visible = false; g.add(plante);
  const treff = new THREE.Mesh(new THREE.BoxGeometry(AKER_FOT, 0.7, AKER_FOT), new THREE.MeshBasicMaterial({visible: false})); treff.position.y = 0.35; g.add(treff);
  eierAv(g); klikkbar(g);
  return {type: 'aker', id: f.id, gruppe: g, plante, stadie: '', fot: [AKER_FOT, AKER_FOT], hoyde: 2.4};
}
function akerStadie(f, t) {
  if (!f.avling) return '';
  const p = (t - f.start) / Math.max(1, f.slutt - f.start);
  return p >= 1 ? f.avling + '3' : p >= 0.6 ? f.avling + '2' : p >= 0.25 ? 'spire' : 'fro';
}

/* ======================= Nye bygg: fôrkvern, bakeri og silo ======================= */
// Samme stil som låven og hønsehuset: røde planker, hvite kanter, avrundede former. Enkle modeller, slått sammen per materiale.
function tak(g, w, d, y, hoydeTak, mat = MAT.tak) {
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, hoydeTak); sh.lineTo(-w / 2, 0);
  const gv = new THREE.ExtrudeGeometry(sh, {depth: d, bevelEnabled: false}); gv.translate(0, 0, -d / 2); teksturUV(gv, 0.4, 0.4); mesh(gv, MAT.rodPlank, 0, y, 0, g);
  const len = Math.hypot(w / 2 + 0.3, hoydeTak + 0.1); [-1, 1].forEach(sd => { const m = mesh(teksturUV(new THREE.BoxGeometry(len, 0.14, d + 0.5), len / 1.3, (d + 0.5) / 1.3), mat, sd * (w / 4 + 0.05), y + hoydeTak / 2 + 0.08, 0, g); m.rotation.z = -sd * Math.atan2(hoydeTak, w / 2); });
  mesh(new THREE.CylinderGeometry(0.09, 0.09, d + 0.5, 8), MAT.mork || fm(0x4a3426), 0, y + hoydeTak + 0.12, 0, g).rotation.x = Math.PI / 2;
}
function skiltTekst(tekst, w = 1.6) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#f3e2bd'; x.fillRect(0, 0, 320, 96); x.strokeStyle = '#9a6a3c'; x.lineWidth = 10; x.strokeRect(5, 5, 310, 86);
  x.fillStyle = '#5a3416'; x.font = 'bold 50px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tekst, 160, 52);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.3, 0.06), [MAT.lysPlank, MAT.lysPlank, MAT.lysPlank, MAT.lysPlank, std({map: t}), MAT.lysPlank]);
}
function lagForkvern() {
  const g = new THREE.Group();
  mesh(teksturUV(new THREE.BoxGeometry(2.3, 1.7, 2.0), 1, 0.8), MAT.rodPlank, 0, 0.95, 0, g);
  mesh(avrundetBoks(2.5, 0.2, 2.2, 0.05, 1), MAT.brunPlank, 0, 0.1, 0, g);
  tak(g, 2.5, 2.0, 1.8, 0.9);
  [[-1.18, 1], [1.18, 1]].forEach(([x]) => mesh(avrundetBoks(0.12, 1.75, 0.12, 0.02, 1), MAT.hvitTrim, x, 0.95, 1.03, g));
  mesh(teksturUV(new THREE.BoxGeometry(0.8, 1.2, 0.08), 0.35, 0.5), MAT.lysPlank, 0.35, 0.75, 1.02, g);
  // kvernstein på siden og trakt på taket
  const stein = fm(0xb8b2a6, 0.9); const k = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.26, 24), stein, -1.35, 0.68, 0.35, g); k.rotation.z = Math.PI / 2; k.rotation.y = 0.1;
  mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 10), fm(0x6b5a48), -1.5, 0.68, 0.35, g).rotation.z = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.42, 0.18, 0.55, 12), MAT.brunPlank, 0.6, 2.95, -0.3, g);
  // kornsekk
  const sekk = mesh(new THREE.SphereGeometry(0.32, 12, 10), fm(0xd9c29a, 0.95), -0.65, 0.42, 1.25, g); sekk.scale.set(1, 1.2, 0.85);
  const sk = skiltTekst('Fôrkvern', 1.4); sk.position.set(0, 2.15, 1.05); g.add(sk);
  bake(g); return g;
}
function lagBakeri() {
  const g = new THREE.Group();
  mesh(teksturUV(new THREE.BoxGeometry(3.2, 2.0, 2.6), 1.4, 0.9), MAT.rodPlank, 0, 1.1, 0, g);
  mesh(avrundetBoks(3.4, 0.2, 2.8, 0.05, 1), fm(0xb9b0a2, 0.9), 0, 0.1, 0, g);
  tak(g, 3.4, 2.6, 2.1, 1.15, MAT.tak2);
  [[-1.6], [1.6]].forEach(([x]) => mesh(avrundetBoks(0.12, 2.0, 0.12, 0.02, 1), MAT.hvitTrim, x, 1.1, 1.33, g));
  mesh(teksturUV(new THREE.BoxGeometry(0.8, 1.35, 0.08), 0.35, 0.5), MAT.lysPlank, -0.7, 0.8, 1.32, g);
  mesh(new THREE.BoxGeometry(0.9, 0.7, 0.06), MAT.glass, 0.75, 1.25, 1.32, g);
  [[1.0, 0.1, 0.75, 1.62], [1.0, 0.1, 0.75, 0.88], [0.1, 0.8, 0.27, 1.25], [0.1, 0.8, 1.23, 1.25]].forEach(([w, h, x, y]) => mesh(new THREE.BoxGeometry(w, h, 0.1), MAT.hvitTrim, x, y, 1.36, g));
  // pipe av murstein og en markise over vinduet
  mesh(avrundetBoks(0.5, 1.3, 0.5, 0.05, 1), fm(0xb5553a, 0.9), 0.9, 3.0, -0.4, g); mesh(avrundetBoks(0.62, 0.14, 0.62, 0.04, 1), fm(0x8f3f2b, 0.9), 0.9, 3.68, -0.4, g);
  for (let i = 0; i < 5; i++) { const m = mesh(new THREE.BoxGeometry(0.24, 0.05, 0.55), fm(i % 2 ? 0xffffff : 0xe2493a, 0.8), 0.33 + i * 0.21, 1.86, 1.55, g); m.rotation.x = 0.45; }
  const sk = skiltTekst('Bakeri', 1.5); sk.position.set(0, 2.45, 1.33); g.add(sk);
  bake(g); return g;
}
function lagSilo() {
  const g = new THREE.Group();
  mesh(teksturUV(new THREE.CylinderGeometry(1.15, 1.2, 4.6, 24, 1, true), 3, 2.6), MAT.rodPlank, 0, 2.3, 0, g);
  [0.5, 2.3, 4.1].forEach(y => mesh(new THREE.TorusGeometry(1.19, 0.07, 6, 28), MAT.hvitTrim, 0, y, 0, g).rotation.x = Math.PI / 2);
  const kuppel = new THREE.SphereGeometry(1.22, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2); mesh(kuppel, fm(0x9fb0b8, 0.35), 0, 4.6, 0, g);
  mesh(new THREE.ConeGeometry(0.18, 0.3, 10), fm(0x9fb0b8, 0.35), 0, 5.95, 0, g);
  for (let i = 0; i < 9; i++) mesh(new THREE.BoxGeometry(0.42, 0.05, 0.05), MAT.hvitTrim, 0, 0.5 + i * 0.45, 1.23, g);
  [-0.21, 0.21].forEach(x => mesh(new THREE.BoxGeometry(0.05, 4.2, 0.05), MAT.hvitTrim, x, 2.4, 1.23, g));
  mesh(avrundetBoks(2.6, 0.18, 2.6, 0.06, 1), fm(0xb9b0a2, 0.9), 0, 0.09, 0, g);
  bake(g); return g;
}
function lagByggeplass(tekst) {
  const g = new THREE.Group();
  const jg = new THREE.PlaneGeometry(3.2, 2.8); jg.rotateX(-Math.PI / 2); teksturUV(jg, 1.2, 1.2); const j = mesh(jg, MAT.jord, 0, 0.04, 0, g, false); j.receiveShadow = true;
  [[-1.4, -1.2], [1.4, -1.2], [-1.4, 1.2], [1.4, 1.2]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), MAT.lysPlank, x, 0.35, z, g));
  for (let i = 0; i < 4; i++) mesh(avrundetBoks(1.8, 0.12, 0.25, 0.03, 1), MAT.lysPlank, -0.5, 0.08 + i * 0.13, 0.4 + (i % 2) * 0.05, g).rotation.y = (i % 2) * 0.12;
  const st = new THREE.Group(); st.position.set(0.8, 0, 0.9); g.add(st); mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), MAT.brunPlank, 0, 0.6, 0, st);
  const sk = skiltTekst(tekst, 1.3); sk.position.set(0, 1.2, 0.06); st.add(sk);
  bake(g); return g;
}

/* ======================= Ting på gården ======================= */
// Alt spilleren kan trykke på. Åkre, fôrkvern, bakeri og silo kan flyttes. Låven, hønsehuset, beitet og markedsbua står fast i denne versjonen.
const ting = new Map();
const FOT = {forkvern: [3.0, 2.8], bakeri: [3.8, 3.4], silo: [3.0, 3.0]};
const STANDARD = {
  akre: [[1.5, 1.55], [4.95, 1.55], [8.4, 1.55], [1.5, 5.0], [4.95, 5.0], [8.4, 5.0], [1.5, 8.45], [4.95, 8.45], [8.4, 8.45], [11.85, 1.55], [11.85, 5.0], [11.85, 8.45]],
  forkvern: [0.7, -5.4], bakeri: [-11.5, 2.5], silo: [1.0, -8.4]   /* siloen der fôrkverna sto, ved låven og hønsehuset (Ivar 10.11) */
};
const GARD = {x0: -15.55, x1: 13.6, z0: -11.55, z1: 10.2};
let hinder = [];   // faste hindringer: [x0, x1, z0, z1]
function finnHinder() {
  hinder = [];
  const b = new THREE.Box3();
  scene.children.forEach(o => { if (!['laave', 'honsehus', 'dyr', 'markedsbod'].includes(o.userData.kat) || o.userData.art2 || o.isInstancedMesh || o.isSprite) return;
    b.setFromObject(o); if (b.isEmpty() || b.max.x - b.min.x > 20) return; const benk = b.min.x < -9.6 && b.max.x > -9.6 && b.min.z < -0.55 && b.max.z > -0.55;   /* roboten setter seg på benken */
    hinder.push(benk ? [b.min.x, b.max.x, b.min.z, b.max.z, 'vei'] : [b.min.x, b.max.x, b.min.z, b.max.z]); });
  // gårdsveien, benken og småting fra testscenen
  hinder.push([-6.95, -4.05, -1.5, 12, 'vei'], [-10.75, -8.45, -1.0, 0.3, 'vei'], [-11.4, -10.7, -0.85, -0.15], [3.0, 3.8, -6.8, -6.0], [-2.0, -0.6, -3.9, -2.5], [-2.7, -2.1, -2.3, -1.6], [-9.9, -8.9, 6.4, 7.4], [-9.3, -8.1, 8.4, 9.4], [-13.0, -8.0, 8.7, 10.2]);
}
function fotRekt(t, x, z, r) { const [w, d] = t.fot; const [a, b] = (r || 0) % 2 ? [d, w] : [w, d]; return [x - a / 2, x + a / 2, z - b / 2, z + b / 2]; }
const overlapp = (p, q) => p[0] < q[1] - 0.02 && p[1] > q[0] + 0.02 && p[2] < q[3] - 0.02 && p[3] > q[2] + 0.02;
function erLedig(t, x, z, r) {
  const p = fotRekt(t, x, z, r);
  if (p[0] < GARD.x0 || p[1] > GARD.x1 || p[2] < GARD.z0 || p[3] > GARD.z1) return false;
  if (hinder.some(h => overlapp(p, h))) return false;
  for (const [id, u] of ting) if (u !== t && u.fot && u.plassert && overlapp(p, fotRekt(u, u.x, u.z, u.r))) return false;
  return true;
}
function finnLedigPlass(t, nx, nz) {
  if (erLedig(t, nx, nz, t.r)) return [nx, nz];
  let best = null, bd = 1e9;
  for (let x = GARD.x0; x <= GARD.x1; x += 0.25) for (let z = GARD.z0; z <= GARD.z1; z += 0.25) { const d = (x - nx) ** 2 + (z - nz) ** 2; if (d < bd && erLedig(t, x, z, t.r)) { bd = d; best = [x, z]; } }
  return best;
}
function plasser(t, x, z, r) { t.x = x; t.z = z; t.r = r || 0; t.plassert = true; t.gruppe.position.set(x, 0, z); t.gruppe.rotation.y = t.r * Math.PI / 2; t.gruppe.updateMatrixWorld(true); }
// Leser plasseringen fra lagringen. Har en ting ingen plass ennå (ny åker, nytt bygg), får den standardplassen eller nærmeste ledige plass.
function plasserAlt() {
  s.akre.forEach((f, i) => {
    let t = ting.get(f.id); if (!t) { t = lagAkerGruppe(f); ting.set(f.id, t); }
    if (f.x === null) { const [sx, sz] = STANDARD.akre[i] || [0, 0]; const p = finnLedigPlass(t, sx, sz) || [sx, sz]; f.x = p[0]; f.z = p[1]; }
    plasser(t, f.x, f.z, 0);
  });
  const GML = {forkvern: [1.0, -9.7], bakeri: [0.7, -5.4]};   /* bygg som står på gammel standardplass (0.8.0–0.8.6), får ny */
  const stdV = s.plasser.std ? s.plasser.std.x : 0;   /* hvilken standardplassering lagringen har sett (engangsflagg, QA 10.11) */
  for (const b in GML) { const sb = s.bygg[b]; if (stdV < 3 && sb && sb.x === GML[b][0] && sb.z === GML[b][1] && !ting.has(b)) { sb.x = null; sb.z = null; } }
  for (const b of I_SPILLET.bygg) { const sb = s.bygg[b]; if (!sb) continue; let t = ting.get(b);
    const modell = sb.eid ? 'bygd' : 'plass';
    if (t && t.modell !== modell) { scene.remove(t.gruppe); const i = klikkbare.indexOf(t.gruppe); if (i >= 0) klikkbare.splice(i, 1); ting.delete(b); t = null; }
    if (!t) { const g = sb.eid ? (b === 'forkvern' ? lagForkvern() : lagBakeri()) : lagByggeplass(D.bygg[b].navn.replace(/et$|a$/, '')); scene.add(g); eierAv(g); klikkbar(g);
      t = {type: 'bygg', id: b, gruppe: g, fot: FOT[b], hoyde: b === 'bakeri' ? 4.2 : 3.6, modell}; t.ikon = lagIkon(t.hoyde); g.add(t.ikon); ting.set(b, t); }
    if (sb.x === null) { const [sx, sz] = STANDARD[b]; const p = finnLedigPlass(t, sx, sz) || [sx, sz]; sb.x = p[0]; sb.z = p[1]; }
    plasser(t, sb.x, sb.z, sb.r);
  }
  let si = ting.get('silo'); if (!si) { const g = lagSilo(); scene.add(g); eierAv(g); klikkbar(g); si = {type: 'silo', id: 'silo', gruppe: g, fot: FOT.silo, hoyde: 6.6}; si.ikon = lagIkon(si.hoyde); g.add(si.ikon); ting.set('silo', si); }
  if (stdV < 3 && s.plasser.silo && ((s.plasser.silo.x === 11.95 && s.plasser.silo.z === -2.4) || (s.plasser.silo.x === -13.6 && s.plasser.silo.z === -1.75) || (s.plasser.silo.x === 1 && s.plasser.silo.z === -9.7))) delete s.plasser.silo;   /* gamle standardplasser flyttes til ny */
  const ps = s.plasser.silo || (() => { const p = finnLedigPlass(si, ...STANDARD.silo) || STANDARD.silo; return (s.plasser.silo = {x: p[0], z: p[1], r: 0}); })();
  plasser(si, ps.x, ps.z, ps.r);
  s.plasser.std = {x: 3, z: 0, r: 0};
}
// Faste ting fra testscenen
let hus = null, lave = null, bod = null;
function finnFasteTing() {
  for (const o of klikkbare) { const k = o.userData.kat; if (k === 'honsehus' && o.isGroup && !o.userData.art && !hus) hus = o; if (k === 'laave' && o.isGroup && !lave) lave = o; if (k === 'markedsbod' && !bod) bod = o; }
  if (hus) { const t = {type: 'honsehus', id: 'honsehus', gruppe: hus, hoyde: 5.2, robotRekt: [BINGER.hone.x0, BINGER.hone.x1, BINGER.hone.z0, BINGER.hone.z1]};   /* roboten stiller seg ved løpegården */ t.ikon = lagIkon(t.hoyde); hus.add(t.ikon); ting.set('honsehus', t); }
  if (lave) ting.set('laave', {type: 'laave', id: 'laave', gruppe: lave, hoyde: 9});
  if (bod) { const t = {type: 'marked', id: 'marked', gruppe: bod, hoyde: 4.2}; t.ikon = lagIkon(t.hoyde); bod.add(t.ikon); ting.set('marked', t); }
}
// Egg ved hønsehuset: ett egg per høne som er ferdig
const eggMesh = [];
function lagEgg() { const g = new THREE.SphereGeometry(0.17, 12, 10); g.scale(1, 1.3, 1); const m = fm(0xfff1d6, 0.45);
  [[4.6, -4.25], [5.5, -4.35], [6.4, -4.25], [7.3, -4.35], [8.2, -4.25], [4.2, -3.6], [9.6, -3.2], [3.4, -3.0], [3.4, -2.0]].forEach(([x, z]) => { const e = mesh(g, m, x, 0.22, z); e.visible = false; eggMesh.push(e); }); }

/* ======================= Synk: tilstand → verden ======================= */
function synk(alt) {
  const t = naa();
  for (const f of s.akre) { const u = ting.get(f.id); if (!u) continue; const st = akerStadie(f, t); if (st !== u.stadie || alt) { u.stadie = st; u.plante.visible = !!st; if (st) u.plante.geometry = PROTO[st]; } }
  const honer = s.dyr.hone || []; let klare = 0, sultne = 0;
  honer.forEach((d, i) => { const st = L.dyrStatus(d, t); if (st === 'klar') klare++; if (st === 'sulten') sultne++; if (eggMesh[i]) eggMesh[i].visible = st === 'klar'; });
  const h = ting.get('honsehus'); if (h) settIkon(h.ikon, klare ? '🥚' : sultne ? '🍽️' : null);
  for (const b of I_SPILLET.bygg) { const u = ting.get(b), sb = s.bygg[b]; if (!u || !sb) continue;
    if (!sb.eid) { settIkon(u.ikon, s.mynter >= D.bygg[b].pris ? '🔨' : null); continue; }
    const klar = sb.ko.find(j => t >= j.slutt); settIkon(u.ikon, klar ? ikon(klar.vare) : sb.ko.length ? '⏳' : null); }
  const si = ting.get('silo'); if (si) settIkon(si.ikon, L.plass(s, 'silo') < 4 ? '⚠️' : null);
  const m = ting.get('marked'); if (m) settIkon(m.ikon, L.plass(s, 'silo') < 4 || L.plass(s, 'lave') < 4 ? '🪙' : null);
  oppdaterHud();
}
const ikonListe = () => [...ting.values()].filter(u => u.ikon && u.ikon.visible);

/* ======================= HUD ======================= */
let visteMynter = null;
function oppdaterHud() {
  $('nivaa').textContent = s.nivaa;
  const maks = s.nivaa >= D.maksNivaa, beh = maks ? 1 : D.xpNeste[s.nivaa];
  $('xpFyll').style.width = (maks ? 100 : Math.min(100, s.xp / beh * 100)) + '%';
  $('xpTekst').textContent = maks ? 'Maks nivå i denne versjonen' : `${Math.floor(s.xp)}/${beh} XP`;
  $('xpBar').setAttribute('aria-valuemax', beh); $('xpBar').setAttribute('aria-valuenow', Math.floor(s.xp));
  if (visteMynter !== null && visteMynter !== s.mynter) { const p = $('pMynter'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
  visteMynter = s.mynter; $('mynter').textContent = s.mynter;
}
function melding(tekst, ms = 2600) { const m = $('melding'); m.textContent = tekst; m.classList.add('vis'); clearTimeout(melding.t); melding.t = setTimeout(() => m.classList.remove('vis'), ms); }
const _p = new THREE.Vector3();
function flyt(tekst, pos, forsink = 0) {
  if (!pos) return;   /* QA 10.11 (K1): uten posisjon vises ingen flytetekst */
  setTimeout(() => { _p.copy(pos).project(camera); if (_p.z > 1) return; const d = document.createElement('div'); d.className = 'flyt'; d.textContent = tekst;
    d.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; d.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1500); }, forsink);
}
function midtAv(u, y = 2) { return new THREE.Vector3(u.gruppe.position.x, y, u.gruppe.position.z); }

/* ======================= Roboten gjør jobben ======================= */
// Reglene venter ikke på roboten: det spilleren gjør, skjer med en gang. Roboten går dit og viser det (høyst 5 jobber i kø).
// Veifinning (Even 9.11: «roboten går gjennom gjerde på hønsegården»): rutenett på 0,5 m over gården. Bygg, gjerder og binger er
// stengt, åkrene kan roboten gå over. Korteste vei finnes med Dijkstra (8 retninger) og rettes ut der roboten ser fram.
const RUTENETT = 0.5, ROBOT_R = 0.4, NX = Math.round((GARD.x1 - GARD.x0) / RUTENETT) + 1, NZ = Math.round((GARD.z1 - GARD.z0) / RUTENETT) + 1;
const boksCache = new Map();
function tingRekt(u) {
  if (u.fot) return fotRekt(u, u.x, u.z, u.r);
  if (!boksCache.has(u)) { const b = new THREE.Box3().setFromObject(u.gruppe); boksCache.set(u, [b.min.x, b.max.x, b.min.z, b.max.z]); }
  return boksCache.get(u);
}
function stengtKart() {
  const stengt = new Uint8Array(NX * NZ), rekt = hinder.filter(h => h[4] !== 'vei');
  for (const u of ting.values()) if (u.fot && u.plassert && u.type !== 'aker') rekt.push(fotRekt(u, u.x, u.z, u.r));
  for (const [a, b, c, d] of rekt) {
    const i0 = Math.max(0, Math.floor((a - ROBOT_R - GARD.x0) / RUTENETT)), i1 = Math.min(NX - 1, Math.ceil((b + ROBOT_R - GARD.x0) / RUTENETT));
    const j0 = Math.max(0, Math.floor((c - ROBOT_R - GARD.z0) / RUTENETT)), j1 = Math.min(NZ - 1, Math.ceil((d + ROBOT_R - GARD.z0) / RUTENETT));
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const x = GARD.x0 + i * RUTENETT, z = GARD.z0 + j * RUTENETT;
      if (x > a - ROBOT_R && x < b + ROBOT_R && z > c - ROBOT_R && z < d + ROBOT_R) stengt[i * NZ + j] = 1; }
  }
  return stengt;
}
const avstRekt = (x, z, r) => Math.hypot(Math.max(r[0] - x, 0, x - r[1]), Math.max(r[2] - z, 0, z - r[3]));
function finnVei(fra, maal, naer) {   // maal: [x0, x1, z0, z1]. Ferdig når roboten er nærmere enn «naer» meter
  const stengt = stengtKart(), cx = i => GARD.x0 + i * RUTENETT, cz = j => GARD.z0 + j * RUTENETT;
  let si = Math.round((fra.x - GARD.x0) / RUTENETT), sj = Math.round((fra.z - GARD.z0) / RUTENETT);
  si = Math.max(0, Math.min(NX - 1, si)); sj = Math.max(0, Math.min(NZ - 1, sj));
  if (stengt[si * NZ + sj]) { let best = -1, bd = 1e9; for (let k = 0; k < NX * NZ; k++) if (!stengt[k]) { const d = (cx(Math.floor(k / NZ)) - fra.x) ** 2 + (cz(k % NZ) - fra.z) ** 2; if (d < bd) { bd = d; best = k; } } if (best < 0) return null; si = Math.floor(best / NZ); sj = best % NZ; }
  const kost = new Float32Array(NX * NZ).fill(1e9), forrige = new Int32Array(NX * NZ).fill(-1), ferdig = new Uint8Array(NX * NZ);
  const start = si * NZ + sj; kost[start] = 0; const ko = [start]; let mal = -1;
  while (ko.length) {
    let bi = 0; for (let k = 1; k < ko.length; k++) if (kost[ko[k]] < kost[ko[bi]]) bi = k;
    const c = ko[bi]; ko[bi] = ko[ko.length - 1]; ko.pop(); if (ferdig[c]) continue; ferdig[c] = 1;
    const i = Math.floor(c / NZ), j = c % NZ;
    if (avstRekt(cx(i), cz(j), maal) <= naer) { mal = c; break; }
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ) continue; const n = ni * NZ + nj; if (stengt[n] || ferdig[n]) continue;
      if (di && dj && (stengt[(i + di) * NZ + j] || stengt[i * NZ + j + dj])) continue;   // ikke skjær hjørner
      const k2 = kost[c] + (di && dj ? 1.414 : 1); if (k2 < kost[n]) { kost[n] = k2; forrige[n] = c; ko.push(n); } }
  }
  if (mal < 0) return null;
  const celler = []; for (let c = mal; c >= 0; c = forrige[c]) celler.unshift(c);
  const pkt = celler.map(c => new THREE.Vector3(cx(Math.floor(c / NZ)), 0, cz(c % NZ)));
  const fri = (a, b) => { const n = Math.ceil(a.distanceTo(b) / (RUTENETT / 3)); for (let k = 1; k < n; k++) { const x = a.x + (b.x - a.x) * k / n, z = a.z + (b.z - a.z) * k / n;
    const i = Math.round((x - GARD.x0) / RUTENETT), j = Math.round((z - GARD.z0) / RUTENETT); if (stengt[i * NZ + j]) return false; } return true; };
  const ut = []; let a = new THREE.Vector3(fra.x, 0, fra.z), k = 0;
  while (k < pkt.length - 1) { let m = pkt.length - 1; while (m > k + 1 && !fri(a, pkt[m])) m--; ut.push(pkt[m]); a = pkt[m]; k = m; }
  if (!ut.length) ut.push(pkt[pkt.length - 1]);
  return ut;
}
// Brukes også av testscenens ventetur (benken, beitet osv.), så roboten aldri går gjennom gjerder på vei dit
window.punktFritt = p => { const rekt = hinder.filter(h => h[4] !== 'vei'); for (const u of ting.values()) if (u.fot && u.plassert && u.type !== 'aker') rekt.push(fotRekt(u, u.x, u.z, u.r));
  return !rekt.some(h => p.x > h[0] - ROBOT_R && p.x < h[1] + ROBOT_R && p.z > h[2] - ROBOT_R && p.z < h[3] + ROBOT_R); };
window.ruteTil = (fra, p) => finnVei(fra, [p.x, p.x, p.z, p.z], 0.5) || [];
const jobber = []; let jobbTimer = 0;
function robotJobb(u) { if (!robot || !u) return; jobber.push(u); while (jobber.length > 5) jobber.shift(); if (modus !== 'jobb') nesteJobb(); }
function nesteJobb() {
  clearTimeout(jobbTimer); if (!robot) return;
  if (modus === 'dans') { jobbTimer = setTimeout(nesteJobb, 600); return; }
  const u = jobber.shift();
  if (!u) { if (modus === 'jobb') { modus = 'vent'; ventTimer = 2.5; ventSteg = 0; spill('Idle'); } return; }
  modus = 'jobb'; snuTil = null; robot.position.y = 0;
  let fra = robot.position; const vei = [];
  (utVei || []).forEach(q => { vei.push(...window.ruteTil(fra, q), q); fra = q; }); utVei = null;   /* også veien ut fra benken går rundt hindringer */
  const r = u.robotRekt || tingRekt(u); vei.push(...(finnVei(fra, r, u.type === 'aker' ? 0.6 : 1.0) || []));
  const p = u.gruppe.position;
  const ferdig = () => { snuTil = {r: Math.atan2(p.x - robot.position.x, p.z - robot.position.z), ferdig: () => { spill('Yes', false); jobbTimer = setTimeout(nesteJobb, 1000); }}; spill('Idle', true, 0.15); };
  if (vei.length) gaaTil(vei, ferdig); else ferdig();
}

/* ======================= Nytt nivå ======================= */
const nivaaKo = []; let nivaaVises = false, nivaaTimer = 0;
function feirNivaa(nye) { if (!nye || !nye.length) return; nivaaKo.push(...nye); if (!nivaaVises) visNesteNivaa(); }
function nyttTekst(n) {
  const nytt = [], senere = [];
  n.avlinger.forEach(a => (I_SPILLET.avlinger.includes(a) ? nytt : senere).push(ikon(a) + ' ' + navn(a)));
  n.bygg.forEach(b => (I_SPILLET.bygg.includes(b) ? nytt : senere).push(D.bygg[b].ikon + ' ' + D.bygg[b].navn.replace(/^./, c => c.toLowerCase())));
  n.dyr.forEach(d => (I_SPILLET.dyr.includes(d) ? nytt : senere).push(D.dyr[d].ikon + ' ' + D.dyr[d].flertall.toLowerCase()));
  if (n.akre) nytt.push('🟫 ' + n.akre + ' nye åkre');
  if (n.nivaa === 4) senere.push('📋 bestillinger og lastebil');
  let t = '+' + n.mynter + ' 🪙'; if (nytt.length) t += ' · Nytt: ' + nytt.join(', ');
  if (senere.length) t += '<br><span style="font-size:15px;opacity:.8">Kommer i neste versjon: ' + senere.join(', ') + '</span>';
  return t;
}
function visNesteNivaa() {
  const n = nivaaKo.shift(); if (!n) { nivaaVises = false; $('nivaaOpp').classList.remove('vis'); return; }
  nivaaVises = true; $('nivaaTittel').textContent = `Nivå ${n.nivaa}! ⭐`; $('nivaaTekst').innerHTML = nyttTekst(n); $('nivaaOpp').classList.add('vis');
  if (robot && !matchMedia('(prefers-reduced-motion: reduce)').matches) { jobber.length = 0; clearTimeout(jobbTimer); nyttNivaa(); jobbTimer = setTimeout(nesteJobb, 4300); }
  clearTimeout(nivaaTimer); nivaaTimer = setTimeout(visNesteNivaa, 4000);
}
$('nivaaOpp').addEventListener('click', () => { clearTimeout(nivaaTimer); visNesteNivaa(); });

/* ======================= Handlinger ======================= */
function gi(res, pos) {   // felles etter en handling: XP, nye nivåer, lagring
  if (res && res.xp) flyt('+' + res.xp + ' XP ⭐', pos, 250);
  if (res && res.nye && res.nye.length) { plasserAlt(); feirNivaa(res.nye); }   /* nye åkre og bygg får plass med en gang */
  lagre(); synk(true); fremOppl();
}
function lagerFullt(type) {
  aapneHandling(null, type === 'silo' ? '🌾 Siloen er full' : '📦 Låven er full', () =>
    `<p>${type === 'silo' ? 'Det er ikke plass til flere avlinger.' : 'Det er ikke plass til flere varer.'} Selg noe i markedsbua, eller bruk det i fôrkverna eller bakeriet.</p>
     <div class="knapper"><button class="knapp" data-g="marked">🏪 Til markedsbua</button><button class="knapp lys" data-g="lager">📦 Se lageret</button></div>`);
}
function hostAlt(u0) {
  const t = naa(); let n = 0, xp = 0, nye = [], full = false, varer = {};
  s.akre.forEach((f, i) => { if (L.akerStatus(f, t) !== 'moden') return; const r = L.host(s, i, t);
    if (r.ok) { n++; xp += r.xp; nye.push(...r.nye); varer[r.vare] = (varer[r.vare] || 0) + 2; const u = ting.get(f.id); flyt('+2 ' + ikon(r.vare), midtAv(u, 1.6), n * 60); sprett.push({o: u.gruppe, t: 0}); } else if (r.grunn === 'silo-full') full = true; });
  if (n) { robotJobb(u0); gi({xp, nye}, midtAv(u0, 2.2)); }
  if (full) lagerFullt('silo');
  return n;
}
function plantPaa(i, avling) {
  const r = L.plant(s, i, avling, naa()); if (!r.ok) return false;
  const u = ting.get(s.akre[i].id); sprett.push({o: u.gruppe, t: 0}); robotJobb(u); return true;
}
function mat(u) {
  const r = L.mat(s, 'hone', naa());
  if (r.ok) { flyt('🍽️ ×' + r.antall, midtAv(u, 3)); robotJobb(u); hoener.forEach((h, i) => setTimeout(() => { h.userData.hopp = 0.5; visHjerte(h.position.clone().add(new THREE.Vector3(0, 1.8, 0))); }, 300 + i * 200)); gi(null); }
  else if (r.grunn === 'mangler-for') melding('Du har ikke mer hønsefôr. Lag fôr av hvete i fôrkverna. ⚙️');
  return r;
}
function samleEgg(u) {
  const r = L.samleDyr(s, 'hone', naa());
  if (r.ok) { flyt('+' + r.antall + ' 🥚', midtAv(u, 3)); robotJobb(u); gi(r, midtAv(u, 3)); }
  else if (r.grunn === 'lave-full') lagerFullt('lave');
  return r;
}
function hent(b) {
  const u = ting.get(b), r = L.hentProdukter(s, b, naa());
  if (r.ok) { let k = 0; for (const v in r.varer) flyt('+' + r.varer[v] + ' ' + ikon(v), midtAv(u, 3), 120 * k++); robotJobb(u); gi(r, midtAv(u, 3)); }
  else if (r.grunn === 'lave-full') lagerFullt('lave');
  return r;
}

/* ======================= Dra over åkrene (Even 10.11, etter bilder fra Hay Day) ======================= */
// Plante: dra frøet fra handlingskortet over tomme åkre. Høste: trykk på en moden åker og dra over de andre.
// Et vanlig trykk på en moden åker høster alt som er modent, som før.
let draModus = null, undertrykkTrykk = false;
const _draRay = new THREE.Raycaster(), _draNdc = new THREE.Vector2(), _bakke = new THREE.Vector3();
function akerVed(x, y) {
  _draNdc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); _draRay.setFromCamera(_draNdc, camera);
  if (!_draRay.ray.intersectPlane(bakkePlan, _bakke)) return -1;
  return s.akre.findIndex(f => { const u = ting.get(f.id); if (!u) return false; const r = fotRekt(u, u.x, u.z, 0); return _bakke.x > r[0] && _bakke.x < r[1] && _bakke.z > r[2] && _bakke.z < r[3]; });
}
function draIkon(tegn, x, y) { const d = $('draIkon'); if (!tegn) { d.style.display = 'none'; return; } d.textContent = tegn; d.style.display = 'block'; d.style.left = x + 'px'; d.style.top = y + 'px'; }
function draOver(x, y) {
  const m = draModus; if (!m || pauset) return;
  if (m.type === 'plant' && !m.dratt) { if (Math.hypot(x - m.x0, y - m.y0) < 12) return;   /* et lite skjelv er fortsatt et trykk (QA 10.11) */
    m.dratt = true; lukkHandling(); m.px = x; m.py = y;
    if (m.valgt >= 0) draPlant(m, m.valgt); }   /* QA 10.11: den valgte åkeren plantes først */
  if (m.type === 'plant' && !m.ute) { const k = m.kort; if (x > k[0] && x < k[1] && y > k[2] && y < k[3]) { draIkon(m.ikon, x, y); m.px = x; m.py = y; return; } m.ute = true; }   /* åkre som lå skjult bak kortet, plantes ikke før fingeren har vært utenfor */   /* kortet lukkes med en gang draget begynner, så ingen åker plantes i skjul bak det */
  draIkon(m.ikon, x, y);
  // raske sveip: sjekk også punktene mellom forrige og denne posisjonen
  if (m.px !== undefined) { const d = Math.hypot(x - m.px, y - m.py), n = Math.floor(d / 18); for (let k = 1; k < n; k++) draEn(m, m.px + (x - m.px) * k / n, m.py + (y - m.py) * k / n); }
  m.px = x; m.py = y; draEn(m, x, y);
}
function draEn(m, x, y) {
  const i = akerVed(x, y); if (i < 0 || m.ferdige.has(i)) return;
  if (m.type === 'host' && i === m.start && !m.flyttet) return;
  if (!m.flyttet && m.type === 'plant') lukkHandling();   /* kortet skal ikke dekke åkrene */
  if (!m.flyttet && m.type === 'host') { m.flyttet = true; draHost(m, m.start); }   /* den første åkeren høstes også */
  if (m.type === 'plant') draPlant(m, i); else { m.flyttet = true; m.ferdige.add(i); draHost(m, i); }
  synk();
}
function draPlant(m, i) {
  m.flyttet = true; m.ferdige.add(i); const f = s.akre[i], u = ting.get(f.id);
  if (!f.avling && plantPaa(i, m.avling)) { m.n++; flyt(ikon(m.avling), midtAv(u, 1.4)); }
  synk();
}
function draHost(m, i) {
  m.ferdige.add(i); const f = s.akre[i], u = ting.get(f.id), t = naa();
  if (L.akerStatus(f, t) === 'moden') { const r = L.host(s, i, t);
    if (r.ok) { m.n++; m.xp += r.xp; m.nye.push(...r.nye); flyt('+2 ' + ikon(r.vare), midtAv(u, 1.6)); sprett.push({o: u.gruppe, t: 0}); if (m.n === 1) robotJobb(u); }
    else if (r.grunn === 'silo-full') m.full = true; }
}
function sluttDra() {
  const m = draModus; if (!m) return; draModus = null; draIkon(null);
  if (!m.flyttet) { if (m.type === 'host') hostAlt(ting.get(s.akre[m.start].id)); else if (m.dratt) { undertrykkTrykk = true; setTimeout(() => { undertrykkTrykk = false; }, 50); } return; }    // vanlig trykk: høst alt, eller «Plant» på knappen
  undertrykkTrykk = true; setTimeout(() => { undertrykkTrykk = false; }, 50);
  if (m.n) gi(m.type === 'host' ? {xp: m.xp, nye: m.nye} : null, m.n ? midtAv(ting.get(s.akre[[...m.ferdige][0]].id), 2.2) : null);
  if (m.full) lagerFullt('silo');
}
addEventListener('pointermove', e => { if (draModus) { e.preventDefault(); draOver(e.clientX, e.clientY); } }, {passive: false});
addEventListener('pointerup', sluttDra); addEventListener('pointercancel', sluttDra);
window.spillDraStart = (x, y) => {
  if (!startet || pauset || flytt || dialogApen()) return false;
  const i = akerVed(x, y); if (i < 0 || L.akerStatus(s.akre[i], naa()) !== 'moden') return false;
  draModus = {type: 'host', ikon: '🧺', start: i, ferdige: new Set(), flyttet: false, n: 0, xp: 0, nye: []};
  return true;
};
// Frøet i handlingskortet kan dras ut på åkrene
$('handlingInnhold').addEventListener('pointerdown', e => {
  const k = e.target.closest('.fro'); if (!k || k.disabled) return; e.preventDefault();
  try { k.releasePointerCapture(e.pointerId); } catch (er) {}
  const kort = $('handling').getBoundingClientRect(), valgt = aktivTing ? s.akre.findIndex(f => f.id === aktivTing.id) : -1;
  draModus = {type: 'plant', avling: k.dataset.a, ikon: ikon(k.dataset.a), ferdige: new Set(), flyttet: false, n: 0, x0: e.clientX, y0: e.clientY, valgt, kort: [kort.left, kort.right, kort.top, kort.bottom], ute: false};
});
// Slippes frøet på selve knappen uten å ha vært ute på gården, er det et vanlig trykk på «Plant»

/* ======================= Handlingskortet (UI4) ======================= */
let aktivTing = null, tegnInnhold = null;
function aapneHandling(u, tittel, tegn) {
  aktivTing = u; tegnInnhold = tegn; $('handlingTittel').textContent = tittel; $('handlingInnhold').innerHTML = tegn();
  $('handling').classList.add('vis');
  if (sisteInput === 'tast') { const b = $('handlingInnhold').querySelector('button:not(:disabled)') || $('handlingLukk'); b.focus({preventScroll: true}); }
}
function tegnPaaNytt() { if (!$('handling').classList.contains('vis') || !tegnInnhold) return; const fokus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.g : null;
  $('handlingInnhold').innerHTML = tegnInnhold(); if (fokus) { const b = $('handlingInnhold').querySelector(`[data-g="${fokus}"]`); if (b && !b.disabled) b.focus({preventScroll: true}); } }
function lukkHandling() { $('handling').classList.remove('vis'); aktivTing = null; tegnInnhold = null; }
$('handlingLukk').addEventListener('click', lukkHandling);
function oppdaterTider() { if (!$('handling').classList.contains('vis')) return; const t = naa();
  $('handlingInnhold').querySelectorAll('[data-slutt]').forEach(e => { const r = +e.dataset.slutt - t; e.textContent = r > 0 ? fmtTid(r) : 'ferdig!'; });
  if ($('handlingInnhold').querySelector('[data-slutt]') && [...$('handlingInnhold').querySelectorAll('[data-slutt]')].some(e => +e.dataset.slutt <= t && !e.dataset.ferdig)) tegnPaaNytt(); }

function visAker(u) {
  const i = s.akre.findIndex(f => f.id === u.id), f = s.akre[i], t = naa(), st = L.akerStatus(f, t);
  if (st === 'moden') { lukkHandling(); hostAlt(u); return; }
  if (st === 'vokser') { aapneHandling(u, ikon(f.avling) + ' ' + navn(f.avling), () => f.avling && naa() < f.slutt
      ? `<p>Vokser. Ferdig om <b data-slutt="${f.slutt}">${fmtTid(f.slutt - naa())}</b>. Da kan du høste 2 ${navn(f.avling).toLowerCase()}.</p><div class="knapper"><button class="knapp lys" data-g="flytt">✋ Flytt åkeren</button></div>`
      : `<p>${f.avling ? 'Moden! 🎉' : 'Høstet.'}</p><div class="knapper">${f.avling ? '<button class="knapp gronn" data-g="host">Høst</button>' : ''}<button class="knapp lys" data-g="flytt">✋ Flytt åkeren</button></div>`); return; }
  aapneHandling(u, '🟫 Tom åker', () => {
    const tomme = s.akre.filter(a => !a.avling).length;
    return '<p>Hva vil du plante? Du planter 1 og høster 2.<br><small>✋ Tips: dra «Plant» ut over de tomme åkrene.</small></p>' + I_SPILLET.avlinger.map(a => { const A = D.avlinger[a];
      if (A.nivaa > s.nivaa) return `<div class="rad"><span class="stort">${A.ikon}</span><span class="midt">${A.navn}<small>Låses opp på nivå ${A.nivaa}</small></span><button class="knapp" disabled>🔒</button></div>`;
      const har = s.lager[a] || 0;
      return `<div class="rad"><span class="stort">${A.ikon}</span><span class="midt">${A.navn}<small>${fmtTid(A.tid * 1000)} · +${A.xp} XP · du har ${har}${har ? '' : ' (gratis frø)'}</small></span><button class="knapp gronn fro" data-g="plant" data-a="${a}" title="Trykk, eller dra frøet over åkrene">${A.ikon} Plant</button>${tomme > 1 ? `<button class="knapp lys" data-g="plantAlle" data-a="${a}" title="Plant på alle tomme åkre">Alle (${tomme})</button>` : ''}</div>`; }).join('') +
      '<div class="knapper"><button class="knapp lys" data-g="flytt">✋ Flytt åkeren</button></div>';
  });
}
function visHus(u) {
  const r = samleEgg(u);
  aapneHandling(u, '🐔 Hønsehuset', () => {
    const t = naa(), h = s.dyr.hone || [], sultne = h.filter(d => d.slutt === null).length, klare = h.filter(d => L.dyrStatus(d, t) === 'klar').length, fr = s.lager.honsefor || 0;
    const spiser = h.filter(d => L.dyrStatus(d, t) === 'spiser').map(d => d.slutt).sort((a, b) => a - b);
    let p = `<p>${h.length} høner. ${sultne ? `${sultne} er sultne.` : 'Alle har fått mat.'}${spiser.length ? ` Neste egg om <b data-slutt="${spiser[0]}">${fmtTid(spiser[0] - t)}</b>.` : ''}</p>`;
    if (klare) p += `<div class="knapper"><button class="knapp" data-g="egg">🥚 Hent ${klare} egg</button></div>`;
    p += `<div class="rad"><span class="stort">🟡</span><span class="midt">Hønsefôr<small class="${fr ? '' : 'mangler'}">Du har ${fr}. Én høne spiser 1 og legger 1 egg (+${D.dyr.hone.xp} XP).</small></span><button class="knapp gronn" data-g="mat" ${sultne && fr ? '' : 'disabled'}>Gi mat</button></div>`;
    if (!fr) p += '<p style="font-size:15px">Lag hønsefôr av hvete i fôrkverna. ⚙️</p>';
    return p;
  });
  return r;
}
function visBygg(u) {
  const b = u.id, sb = s.bygg[b], B = D.bygg[b];
  if (!sb.eid) { aapneHandling(u, B.ikon + ' ' + B.navn, () => `<p>Her kan du bygge ${B.navn.toLowerCase()}. Det koster <b>${B.pris} 🪙</b>.</p><div class="knapper"><button class="knapp gronn" data-g="kjop" ${s.mynter >= B.pris ? '' : 'disabled'}>🔨 Bygg for ${B.pris} 🪙</button><button class="knapp lys" data-g="flytt">✋ Flytt</button></div>${s.mynter >= B.pris ? '' : `<p style="font-size:15px">Du har ${s.mynter} 🪙. Selg noe i markedsbua for å få flere.</p>`}`); return; }
  hent(b);
  aapneHandling(u, B.ikon + ' ' + B.navn, () => {
    const t = naa(), opp = Object.keys(D.oppskrifter).filter(v => D.oppskrifter[v].bygg === b && D.oppskrifter[v].nivaa <= s.nivaa);
    const plasser = []; for (let k = 0; k < D.koPlasser; k++) { const j = L.uferdige(sb, t)[k]; plasser.push(j ? `<div class="plass full">${ikon(j.vare)} <span data-slutt="${j.slutt}">${fmtTid(j.slutt - t)}</span></div>` : '<div class="plass">ledig</div>'); }
    const klare = sb.ko.filter(j => t >= j.slutt);
    let p = `<div class="ko" aria-label="Køen">${plasser.join('')}</div>`;
    if (klare.length) p += `<div class="knapper"><button class="knapp" data-g="hent">Hent ${klare.map(j => ikon(j.vare)).join(' ')}</button></div>`;
    p += opp.map(v => { const o = D.oppskrifter[v], g = L.kanProdusere(s, b, v, t);
      const inn = Object.keys(o.inn).map(k => `${o.inn[k]} ${ikon(k)}`).join(' + '), mangler = Object.keys(o.inn).filter(k => (s.lager[k] || 0) < o.inn[k]);
      return `<div class="rad"><span class="stort">${ikon(v)}</span><span class="midt">${o.ut > 1 ? o.ut + ' ' : ''}${navn(v)} · ${fmtTid(o.tid * 1000)}${D.produktXP(v) ? ' · +' + D.produktXP(v) + ' XP' : ''}<small class="${mangler.length ? 'mangler' : ''}">${inn}${mangler.length ? ' · du mangler ' + mangler.map(k => (o.inn[k] - (s.lager[k] || 0)) + ' ' + navn(k).toLowerCase()).join(', ') : ''}</small></span><button class="knapp gronn" data-g="lag" data-v="${v}" ${g ? 'disabled' : ''}>Lag</button></div>`; }).join('');
    if (L.uferdige(sb, t).length >= D.koPlasser) p += '<p style="font-size:15px">Køen er full. Vent til en jobb er ferdig.</p>';
    return p + '<div class="knapper"><button class="knapp lys" data-g="flytt">✋ Flytt</button></div>';
  });
}
$('handlingInnhold').addEventListener('click', e => {
  const k = e.target.closest('button'); if (!k || k.disabled) return; const g = k.dataset.g, u = aktivTing; const t = naa();
  if ((g === 'plant') && undertrykkTrykk) return;
  if (g === 'plant' || g === 'plantAlle') { const a = k.dataset.a; const i = s.akre.findIndex(f => f.id === u.id);
    let n = plantPaa(i, a) ? 1 : 0; if (g === 'plantAlle') s.akre.forEach((f, j) => { if (!f.avling && plantPaa(j, a)) n++; });
    if (n) { flyt(ikon(a) + (n > 1 ? ' ×' + n : ''), midtAv(u, 1.5)); lukkHandling(); gi(null); } else melding('Du har ikke frø til ' + navn(a).toLowerCase() + '.'); return; }
  if (g === 'host') { lukkHandling(); hostAlt(u); return; }
  if (g === 'egg') { samleEgg(u); tegnPaaNytt(); return; }
  if (g === 'mat') { mat(u); tegnPaaNytt(); return; }
  if (g === 'hent') { hent(u.id); tegnPaaNytt(); return; }
  if (g === 'lag') { const v = k.dataset.v; const r = L.produser(s, u.id, v, t); if (r.ok) { flyt(ikon(v) + ' ⏳', midtAv(u, 3)); robotJobb(u); gi(null); } tegnPaaNytt(); return; }
  if (g === 'kjop') { const r = L.kjopBygg(s, u.id); if (r.ok) { flyt('-' + D.bygg[u.id].pris + ' 🪙', midtAv(u, 3)); lagre(); plasserAlt(); synk(true); robotJobb(ting.get(u.id)); visBygg(ting.get(u.id)); fremOppl(); } return; }
  if (g === 'flytt') { startFlytt(u); return; }
  if (g === 'marked') { lukkHandling(); visMarked(); return; }
  if (g === 'lager') { lukkHandling(); visLager(); return; }
});

/* ======================= Lager og markedsbu ======================= */
const dialoger = ['lager', 'marked', 'byggMeny'];
let forrigeFokus = null;
function aapneDialog(id) { lukkHandling(); forrigeFokus = document.activeElement; $(id).classList.add('vis'); if (window.EVNPauseInert) EVNPauseInert($(id)); const b = $(id).querySelector('.kryss'); if (b) b.focus({preventScroll: true}); }
function lukkDialog(id) { $(id).classList.remove('vis'); if (window.EVNPauseInert) EVNPauseInert(null); try { if (forrigeFokus && forrigeFokus.focus) forrigeFokus.focus({preventScroll: true}); } catch (e) {} }
document.querySelectorAll('[data-lukk]').forEach(b => b.addEventListener('click', () => lukkDialog(b.dataset.lukk)));
dialoger.forEach(id => $(id).addEventListener('click', e => { if (e.target === $(id)) lukkDialog(id); }));
const dialogApen = () => dialoger.some(id => $(id).classList.contains('vis'));
function lagerMaaler(type) { const k = L.kapasitet(s, type), b = L.bruk(s, type), f = Math.round(b / k * 100);
  return `<div><span>${type === 'silo' ? '🌾 Siloen' : '📦 Låven'}</span><b>${b} / ${k}</b><i class="${f >= 85 ? 'nesten' : ''}" style="--f:${f}%"></i><small>${type === 'silo' ? 'avlinger' : 'egg, fôr og mat'}</small></div>`; }
function varerSortert() { return Object.keys(s.lager).filter(v => s.lager[v] > 0).sort((a, b) => (L.lagerType(a) === L.lagerType(b) ? 0 : L.lagerType(a) === 'silo' ? -1 : 1) || navn(a).localeCompare(navn(b), 'nb')); }
function visLager() {
  $('lagerMaaler').innerHTML = lagerMaaler('silo') + lagerMaaler('lave');
  const v = varerSortert();
  $('lagerListe').innerHTML = v.length ? v.map(k => `<div class="rad"><span class="stort">${ikon(k)}</span><span class="midt">${navn(k)}<small>${L.lagerType(k) === 'silo' ? 'i siloen' : 'i låven'}</small></span><b style="font-size:22px">${s.lager[k]}</b></div>`).join('') : '<p>Lageret er tomt.</p>';
  if (!$('lager').classList.contains('vis')) aapneDialog('lager');
}
$('lagerTilMarked').addEventListener('click', () => { lukkDialog('lager'); visMarked(); });
$('lagerKnapp').addEventListener('click', visLager);
function visMarked() {
  $('markedMynter').textContent = s.mynter;
  const v = varerSortert().filter(L.kanSelge);
  $('markedListe').innerHTML = v.length ? v.map(k => `<div class="rad"><span class="stort">${ikon(k)}</span><span class="midt">${navn(k)}<small>Du har ${s.lager[k]} · ${D.pris(k)} 🪙 per stk.</small></span><button class="knapp" data-selg="${k}" data-n="1">Selg 1</button>${s.lager[k] > 1 ? `<button class="knapp lys" data-selg="${k}" data-n="${s.lager[k]}" aria-label="Selg alle ${s.lager[k]}">Alle</button>` : ''}</div>`).join('')
    : '<p>Du har ingenting å selge ennå. Høst, samle egg eller bak brød først.</p>';
  if (!$('marked').classList.contains('vis')) aapneDialog('marked');
}
$('markedListe').addEventListener('click', e => { const k = e.target.closest('[data-selg]'); if (!k) return; const v = k.dataset.selg, r = L.selg(s, v, +k.dataset.n);
  if (r.ok) { const m = ting.get('marked'); if (m) flyt('+' + r.mynter + ' 🪙', midtAv(m, 3.5)); lagre(); synk(); fremOppl('solgt'); const fokus = v; visMarked(); const b = $('markedListe').querySelector(`[data-selg="${fokus}"]`) || $('markedListe').querySelector('button') || $('marked').querySelector('.kryss'); b.focus({preventScroll: true}); } });

/* ======================= Slik får du XP (Even 9.11) ======================= */
function visXP() {
  aapneHandling(null, '⭐ Slik får du XP', () => {
    const r = [];
    for (const a of I_SPILLET.avlinger) { const A = D.avlinger[a]; r.push([A.ikon, 'Høst ' + A.navn.toLowerCase(), A.xp + ' XP per åker', A.nivaa]); }
    r.push(['🥚', 'Hent egg', D.dyr.hone.xp + ' XP per egg', 1]);
    for (const v in D.oppskrifter) { const o = D.oppskrifter[v]; if (!I_SPILLET.bygg.includes(o.bygg) || D.erFor(v)) continue; r.push([ikon(v), 'Hent ' + navn(v).toLowerCase(), D.produktXP(v) + ' XP', o.nivaa]); }
    r.push(['📋', 'Lever bestillinger', 'mest XP av alt', 4]);
    const rader = r.map(([i, h, x, n]) => `<div class="rad"><span class="stort">${i}</span><span class="midt">${h}<small>${n > s.nivaa ? '🔒 Nivå ' + n : x}</small></span><b>${n > s.nivaa ? '' : '+' + x.split(' ')[0]}</b></div>`).join('');
    const neste = s.nivaa >= D.maksNivaa ? '' : `<p>Du har <b>${Math.floor(s.xp)} av ${D.xpNeste[s.nivaa]} XP</b>. Når streken er full, kommer du til nivå ${s.nivaa + 1}.</p>`;
    return neste + rader + '<p style="font-size:15px">Hønsefôr og salg i markedsbua gir ikke XP, men du trenger dem for å få mer.</p>';
  });
}
$('pNivaa').addEventListener('click', visXP);
$('pNivaa').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); visXP(); } });

/* ======================= Byggemenyen ======================= */
// Viser alle bygg og dyrehus for nivå 1–10: bygd, kan bygges nå, eller hvilket nivå de kommer på. Øverst står det som kommer på neste nivå.
// Bingene for kyr og griser er ikke ferdig bygd fra start (Ivar 9.11). De kommer som egne bygg, større enn i testscenen.
const DYREHUS = [
  {navn: 'Hønsehuset', ikon: '🐔', nivaa: 1, bygd: () => true},
  {navn: 'Fjøs og beite til kyrne', ikon: '🐄', nivaa: 6},
  {navn: 'Grisebinge', ikon: '🐖', nivaa: 10, pris: 800}
];
function nesteNivaaTekst() {
  if (s.nivaa >= D.maksNivaa) return 'Du er på høyeste nivå i denne versjonen. 🎉';
  const n = s.nivaa + 1, ting2 = [];
  for (const a in D.avlinger) if (D.avlinger[a].nivaa === n) ting2.push(D.avlinger[a].ikon + ' ' + D.avlinger[a].navn);
  for (const b in D.bygg) if (D.bygg[b].nivaa === n) ting2.push(D.bygg[b].ikon + ' ' + D.bygg[b].navn);
  DYREHUS.forEach(h => { if (h.nivaa === n) ting2.push(h.ikon + ' ' + h.navn); });
  if (D.ved(D.akre, n) > D.ved(D.akre, s.nivaa)) ting2.push('🟫 ' + (D.ved(D.akre, n) - D.ved(D.akre, s.nivaa)) + ' nye åkre');
  if (n === 4) ting2.push('📋 Bestillinger og lastebil');
  return `<b>Nivå ${n}:</b> ` + (ting2.length ? ting2.join(', ') : 'mynter og XP') + ` · ${Math.max(0, D.xpNeste[s.nivaa] - Math.floor(s.xp))} XP igjen`;
}
function visByggMeny() {
  $('byggNeste').innerHTML = nesteNivaaTekst();
  const rad = (ikonT, navnT, under, knapp) => `<div class="rad"><span class="stort">${ikonT}</span><span class="midt">${navnT}<small>${under}</small></span>${knapp}</div>`;
  const rader = Object.keys(D.bygg).map(b => { const B = D.bygg[b], sb = s.bygg[b];
    if (sb && sb.eid) return rad(B.ikon, B.navn, 'Bygd ✅', `<button class="knapp lys" data-vis="${b}">Vis</button>`);
    if (B.nivaa > s.nivaa) return rad(B.ikon, B.navn, `🔒 Nivå ${B.nivaa} · ${B.pris} 🪙`, '');
    if (!I_SPILLET.bygg.includes(b)) return rad(B.ikon, B.navn, `${B.pris} 🪙 · kommer i en senere versjon`, '');
    return rad(B.ikon, B.navn, `${B.pris} 🪙${s.mynter < B.pris ? ' · du har ' + s.mynter : ''}`, `<button class="knapp gronn" data-vis="${b}">Bygg</button>`); });
  DYREHUS.forEach(h => rader.push(h.bygd && h.bygd() ? rad(h.ikon, h.navn, 'Bygd ✅', '<button class="knapp lys" data-vis="honsehus">Vis</button>')
    : rad(h.ikon, h.navn, `🔒 Nivå ${h.nivaa}${h.pris ? ' · ' + h.pris + ' 🪙' : ''}`, '')));
  $('byggListe').innerHTML = rader.join('');
  if (!$('byggMeny').classList.contains('vis')) aapneDialog('byggMeny');
}
$('byggKnapp').addEventListener('click', visByggMeny);
$('byggListe').addEventListener('click', e => { const k = e.target.closest('[data-vis]'); if (!k) return; const u = ting.get(k.dataset.vis); lukkDialog('byggMeny'); if (!u) return;
  kameraMaal = u.gruppe.position.clone(); sprett.push({o: u.gruppe, t: 0}); bruk(u); });

/* ======================= Flytting (planens beslutning B3) ======================= */
let flytt = null, fotMesh = null;
function startFlytt(u) {
  lukkHandling(); if (!u.fot) return;
  if (!fotMesh) { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); fotMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: 0x4cd137, transparent: true, opacity: 0.45, depthWrite: false})); fotMesh.renderOrder = 2; scene.add(fotMesh); }
  flytt = {u, x0: u.x, z0: u.z, r0: u.r, x: u.x, z: u.z, r: u.r};
  $('flyttSnu').hidden = u.type === 'aker' || u.type === 'silo';
  $('flyttLinje').classList.add('vis'); $('flyttTekst').textContent = `Dra, eller trykk der du vil ha ${u.type === 'aker' ? 'åkeren' : u.type === 'silo' ? 'siloen' : D.bygg[u.id].navn.toLowerCase()}. Grønt betyr ledig.`;
  oppdaterFlytt(); $('flyttOk').focus({preventScroll: true});
}
function oppdaterFlytt() { const {u} = flytt; u.gruppe.position.set(flytt.x, 0, flytt.z); u.gruppe.rotation.y = flytt.r * Math.PI / 2;
  const p = fotRekt(u, flytt.x, flytt.z, flytt.r); flytt.ok = erLedig(u, flytt.x, flytt.z, flytt.r);
  fotMesh.visible = true; fotMesh.position.set((p[0] + p[1]) / 2, 0.08, (p[2] + p[3]) / 2); fotMesh.scale.set(p[1] - p[0], 1, p[3] - p[2]); fotMesh.material.color.set(flytt.ok ? 0x4cd137 : 0xe84118);
  $('flyttOk').disabled = !flytt.ok; }
function sluttFlytt(behold) {
  const {u} = flytt;
  if (behold && flytt.ok) { plasser(u, flytt.x, flytt.z, flytt.r);
    if (u.type === 'aker') { const f = s.akre.find(a => a.id === u.id); f.x = u.x; f.z = u.z; } else if (u.type === 'bygg') Object.assign(s.bygg[u.id], {x: u.x, z: u.z, r: u.r}); else if (u.type === 'silo') s.plasser.silo = {x: u.x, z: u.z, r: u.r};
    lagre(); robotJobb(u); melding('Flyttet! ✋'); }
  else plasser(u, flytt.x0, flytt.z0, flytt.r0);
  flytt = null; fotMesh.visible = false; $('flyttLinje').classList.remove('vis');
}
$('flyttOk').addEventListener('click', () => sluttFlytt(true));
$('flyttAvbryt').addEventListener('click', () => sluttFlytt(false));
$('flyttSnu').addEventListener('click', () => { flytt.r = (flytt.r + 1) % 4; oppdaterFlytt(); });
const bakkePlan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), _treff = new THREE.Vector3();
// Dra med finger eller mus flytter tingen (kameraet står stille så lenge flyttingen pågår)
const _dra = new THREE.Raycaster(), _ndc = new THREE.Vector2();
window.spillDra = (x, y) => { if (!flytt) return false; _ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); _dra.setFromCamera(_ndc, camera); flyttTil(_dra); return true; };
function flyttTil(ray) { if (!ray.ray.intersectPlane(bakkePlan, _treff)) return; flytt.x = Math.round(_treff.x * 4) / 4; flytt.z = Math.round(_treff.z * 4) / 4; oppdaterFlytt(); }

/* ======================= Trykk på gården ======================= */
let startet = false, pauset = false, sisteInput = 'mus';
addEventListener('keydown', () => { sisteInput = 'tast'; }, true);
addEventListener('pointerdown', () => { sisteInput = 'mus'; }, true);
function tingFor(o) {
  if (!o) return null;
  for (const u of ting.values()) if (u.gruppe === o) return u;
  if (o.userData.art === 'hone' || o.userData.art === 'kylling' || o.userData.kat === 'honsehus') return ting.get('honsehus');
  if (o.userData.kat === 'laave') return ting.get('laave');
  if (o.userData.kat === 'markedsbod') return ting.get('marked');
  return null;
}
function bruk(u) {
  if (!u) return;
  if (u.gruppe !== hus && u.type !== 'laave') sprett.push({o: u.gruppe, t: 0});
  if (u.type === 'aker') visAker(u);
  else if (u.type === 'honsehus') visHus(u);
  else if (u.type === 'bygg') visBygg(u);
  else if (u.type === 'silo' || u.type === 'laave') visLager();
  else if (u.type === 'marked') { visMarked(); fremOppl('marked'); }
}
window.spillTrykk = (o, t, ray) => {
  if (!startet || pauset || undertrykkTrykk || draModus) return true;   /* et drag håndteres i sluttDra */
  if (flytt) { flyttTil(ray); return true; }
  if (o === rev) { hilsRev(false); visOppl(true); return true; }
  const u = tingFor(o);
  if (u) { if (o && o.userData.art) { o.userData.hopp = 0.4; } bruk(u); return true; }
  lukkHandling();
  return !o || !o.userData.omrade ? !!o : false;   // «Til salgs»-skilt viser fortsatt områdeinfo fra testscenen
};

/* ======================= Tastatur (T2) ======================= */
// Piltastene velger ting på gården (kameraet følger med), Enter bruker den. L åpner lageret.
let valgtI = -1;
function velgbare() { return [...s.akre.map(f => ting.get(f.id)), ...I_SPILLET.bygg.map(b => ting.get(b)), ting.get('honsehus'), ting.get('silo'), ting.get('marked')].filter(Boolean); }
let kameraMaal = null;
addEventListener('keydown', e => {
  if (!startet || pauset || dialogApen() || $('evnPause') && $('evnPause').classList.contains('vis') || $('feil').classList.contains('vis')) return;
  if (nivaaVises && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) { e.preventDefault(); clearTimeout(nivaaTimer); visNesteNivaa(); return; }
  if (flytt) { const st = {ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, -0.5], ArrowDown: [0, 0.5]}[e.key];
    if (st) { e.preventDefault(); const c = Math.cos(cam.yaw), sn = Math.sin(cam.yaw); flytt.x += st[0] * c + st[1] * sn; flytt.z += -st[0] * sn + st[1] * c; flytt.x = Math.round(flytt.x * 4) / 4; flytt.z = Math.round(flytt.z * 4) / 4; oppdaterFlytt(); }
    if (e.key === 'r' || e.key === 'R') { if (!$('flyttSnu').hidden) { flytt.r = (flytt.r + 1) % 4; oppdaterFlytt(); } }
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); sluttFlytt(false); }
    return; }
  if (e.key === 'Escape' && $('handling').classList.contains('vis')) { e.preventDefault(); e.stopImmediatePropagation(); lukkHandling(); return; }
  if (e.key === 'l' || e.key === 'L') { e.preventDefault(); visLager(); return; }
  if (e.key === 'b' || e.key === 'B') { e.preventDefault(); visByggMeny(); return; }
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { if ($('handling').contains(document.activeElement) && document.activeElement.tagName === 'BUTTON' && false) return;
    e.preventDefault(); const v = velgbare(); valgtI = (valgtI + (e.key === 'ArrowRight' ? 1 : v.length - 1)) % v.length; const u = v[valgtI]; kameraMaal = u.gruppe.position.clone(); sprett.push({o: u.gruppe, t: 0}); bruk(u); }
});
dialoger.forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); lukkDialog(id); } }));

/* ======================= Opplæring med Nysgjerrig ======================= */
// Kort og frivillig: fem steg, ett om gangen. Steget går videre når spilleren har gjort det. Kan lukkes og hentes fram ved å trykke på reven.
const OPPL = [
  {tekst: '<b>Hei, nabo!</b> Jeg er Nysgjerrig, og jeg bor i skogkanten. Skal vi gjøre denne lille gården til den fineste i hele Elvedal? Trykk på en åker og <b>plant hvete</b>. 🌾', maal: () => ting.get(s.akre[0].id)},
  {tekst: 'Bra! Mens hveten vokser, kan du trykke på <b>hønsehuset</b> og gi hønene mat. 🐔', maal: () => ting.get('honsehus')},
  {tekst: 'Hønene spiser og legger egg. Når hveten blir <b>gul</b>, trykker du på åkeren for å <b>høste</b>.', maal: () => { const f = s.akre.find(a => a.avling) || s.akre[0]; return ting.get(f.id); }},
  {tekst: 'Supert! Når hønsefôret tar slutt, lager du nytt av hvete i <b>fôrkverna</b>. Prøv nå! ⚙️', maal: () => ting.get('forkvern')},
  {tekst: 'Du kan <b>selge</b> det du ikke trenger i <b>markedsbua</b>. Da får du mynter til nye ting. Lykke til, nabo! 🦊', maal: () => ting.get('marked')}
];
let opplSkjult = false;
function visOppl(tving) {
  const st = s.oppl.steg; if (st >= OPPL.length) { if (tving) { $('revTekst').innerHTML = 'Hei igjen, nabo! Husk å <b>mate hønene</b> og <b>selge</b> det du ikke trenger. Du er flink! 🦊'; $('revTips').classList.add('vis'); clearTimeout(visOppl.t); visOppl.t = setTimeout(() => $('revTips').classList.remove('vis'), 6000); } return; }
  if (tving) opplSkjult = false;
  if (opplSkjult) { $('revTips').classList.remove('vis'); if (pil) pil.visible = false; return; }
  $('revTekst').innerHTML = OPPL[st].tekst; $('revTips').classList.add('vis');
  if (!pil) { pil = new THREE.Sprite(new THREE.SpriteMaterial({map: pilTex, depthTest: false, transparent: true})); pil.scale.setScalar(1.3); pil.renderOrder = 11; scene.add(pil); }
  const u = OPPL[st].maal(); pil.visible = !!u; if (u) pil.userData.u = u;
}
function fremOppl(hva) {
  const st = s.oppl.steg; if (st >= OPPL.length) return;
  const ok = [() => s.akre.some(f => f.avling) || s.stat.hostet > 0, () => (s.dyr.hone || []).some(d => d.slutt !== null) || s.stat.egg > 0, () => s.stat.hostet > 0,
    () => s.bygg.forkvern.ko.length > 0 || s.stat.laget > 0, () => hva === 'marked' || hva === 'solgt' || s.stat.solgt > 0][st]();
  if (ok) { s.oppl.steg++; lagre(); if (s.oppl.steg >= OPPL.length) { $('revTips').classList.remove('vis'); if (pil) pil.visible = false; if (rev) hilsRev(false); return; } opplSkjult = false; visOppl(); }
}
$('revLukk').addEventListener('click', () => { opplSkjult = true; $('revTips').classList.remove('vis'); if (pil) pil.visible = false; });

/* ======================= Hver bildeoppdatering ======================= */
let synkT = 0, lagreT = 0;
window.spillPauset = () => pauset;
window.spillOppdater = (dt, t) => {
  for (const u of ikonListe()) u.ikon.position.y = u.ikon.userData.y0 + Math.sin(t * 3 + u.gruppe.position.x) * 0.12;
  if (pil && pil.visible && pil.userData.u) { const p = pil.userData.u.gruppe.position, h = pil.userData.u.hoyde || 3; pil.position.set(p.x, h + 1.2 + Math.abs(Math.sin(t * 4)) * 0.6, p.z); }
  if (kameraMaal) { cam.target.lerp(_p.set(kameraMaal.x, 0, kameraMaal.z), Math.min(1, dt * 5)); plasserKamera(); if (cam.target.distanceTo(_p) < 0.05) kameraMaal = null; }
  synkT += dt; if (synkT > 0.25) { synkT = 0; synk(); oppdaterTider(); }
  lagreT += dt; if (lagreT > 15 && startet) { lagreT = 0; lagre(); }
};
addEventListener('pagehide', lagre);
document.addEventListener('visibilitychange', () => { if (document.hidden) lagre(); else { sjekkAnnenFane(); L.normaliserTid(s, naa()); synk(true); } });
addEventListener('focus', sjekkAnnenFane);

/* ======================= Start ======================= */
// Verden bygges før startkortet vises. Roboten og reven lastes i bakgrunnen og dukker opp når de er klare.
window.spillKlar = () => {};
$('startBtn').textContent = forste.ny ? '▶ Start' : '▶ Til gården';
$('versjon').textContent = 'Versjon ' + SPILLVERSJON + (TESTMODUS ? ' · testmodus' : '');
function borteTekst() {
  const t = naa(); if (forste.ny || t - sistSett < 60000) return '';
  const deler = [], modne = s.akre.filter(f => L.akerStatus(f, t) === 'moden').length, egg = (s.dyr.hone || []).filter(d => L.dyrStatus(d, t) === 'klar').length;
  let ferdig = 0; for (const b in s.bygg) ferdig += s.bygg[b].ko.filter(j => t >= j.slutt).length;
  if (modne) deler.push(`${modne} ${modne === 1 ? 'åker er moden' : 'åkre er modne'}`); if (egg) deler.push(`${egg} egg er klare`); if (ferdig) deler.push(`${ferdig} ${ferdig === 1 ? 'vare er ferdig' : 'varer er ferdige'}`);
  return deler.length ? 'Mens du var borte: ' + deler.join(', ') + '. 🌞' : '';
}
$('startBtn').addEventListener('click', () => {
  if (startet) return;
  startet = true; $('start').classList.remove('vis'); $('last').style.display = 'none'; $('hud').hidden = false; $('hoyre').hidden = false;
  try { document.dispatchEvent(new Event('evn-start')); } catch (e) {}
  lagre(); synk(true);
  if (forste.reddet) melding('Den gamle lagringen kunne ikke leses. Den er tatt vare på, og du starter en ny gård.', 5000);
  else { const b = borteTekst(); if (b) melding(b, 5000); }
  if (s.oppl.steg < OPPL.length) setTimeout(() => { visOppl(); if (rev && s.oppl.steg === 0) hilsRev(false); }, 600);
  try { renderer.domElement.focus({preventScroll: true}); } catch (e) {}
});

/* ======================= Felles pause, nullstilling og feilkort ======================= */
addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !startet || $('evnPause').classList.contains('vis')) return;
  const d = dialoger.find(id => $(id).classList.contains('vis'));
  if (d) { e.preventDefault(); e.stopImmediatePropagation(); lukkDialog(d); return; }
  if (flytt) { e.preventDefault(); e.stopImmediatePropagation(); sluttFlytt(false); return; }
  if ($('handling').classList.contains('vis')) { e.preventDefault(); e.stopImmediatePropagation(); lukkHandling(); }
}, true);   /* QA 9.11 (T2): Esc lukker det som er åpent i stedet for å åpne pausen over det */
window.__evnP = EVNPause({
  mappe: TESTMODUS ? 'min-bondegard-test' : 'min-bondegard', avsluttId: 'evnAvslutt',
  tema: {panel: 'rgba(31,74,28,.97)', ink: '#fff', hi: '#ffd23f', btn: '#ffd23f', btnInk: '#3b2a00', font: "'Nunito', system-ui, sans-serif", head: "'Lilita One', sans-serif", headW: 400},
  knapp: b => { b.className = 'rund'; b.style.cssText = 'padding:0;font-size:22px'; $('hoyre').insertBefore(b, $('evnAvslutt')); },
  // Pausen legger seg ikke over feilkortet, flyttingen eller feiringen
  kanPause: () => startet && !$('feil').classList.contains('vis'),
  // Aktiv spilletid (ST2): ikke i pause, ikke med lageret eller markedsbua åpen, ikke før spillet er startet
  aktiv: () => startet && !pauset && !dialogApen(),
  pause: () => { pauset = true; if (draModus) { const m = draModus; draModus = null; draIkon(null); undertrykkTrykk = true; if (m.n) gi(m.type === 'host' ? {xp: m.xp, nye: m.nye} : null, midtAv(ting.get(s.akre[[...m.ferdige][0]].id), 2.2)); } lagre(); if (flytt) sluttFlytt(false); dialoger.forEach(id => { if ($(id).classList.contains('vis')) { $(id).classList.remove('vis'); if (window.EVNPauseInert) EVNPauseInert(null); } }); lukkHandling(); },   /* QA 9.11 (T2): pausen legger seg ikke over en åpen dialog */
  fortsett: () => { pauset = false; undertrykkTrykk = false; L.normaliserTid(s, naa()); synk(true); },
  lagre,
  styring: () => document.documentElement.classList.contains('touch')
    ? '👆 Trykk på en åker, et dyr eller et hus<br>✋ Dra med én finger for å flytte deg<br>🤏 Knip med to fingre for å zoome<br>📦 Lageret: knappen øverst til høyre<br>🦊 Trykk på Nysgjerrig for et tips'
    : '🖱️ Klikk på en åker, et dyr eller et hus<br>Dra for å flytte deg, rull for å zoome<br>⬅️➡️ Velg ting · Enter: bruk<br>B: bygg · L: lageret · P eller Esc: pause<br>🦊 Klikk på Nysgjerrig for et tips'
});
EVNNullstill({
  nokler: [LAGRING, LAGRING + '-kopi', LAGRING + '-kopi2'],
  tema: {panel: '#2f6b2a', ink: '#fff', hi: '#ffd23f', btn: '#ffd23f', btnInk: '#3b2a00', font: "'Nunito', system-ui, sans-serif", head: "'Lilita One', sans-serif", headW: 400},
  tekst: 'Hele gården, myntene, nivået og alt i lageret blir borte.',
  harLagring: () => !forste.ny || s.nivaa > 1 || s.stat.hostet > 0,
  plasser: el => $('evnTilbake').after(el),
  vis: () => $('start').classList.contains('vis')
});
let feilVist = false;
function visFeil() { if (feilVist || window.MB_INGEN_WEBGL) return; feilVist = true; try { if (startet) lagre(); } catch (er) {} try { if (window.EVNPauseInert) EVNPauseInert($('feil')); } catch (er) {} $('feil').classList.add('vis'); $('feilLast').focus(); }
addEventListener('error', e => { if (e.error) visFeil(); });
addEventListener('unhandledrejection', visFeil);
$('feilLast').addEventListener('click', () => location.reload());
document.addEventListener('focusin', e => { if ($('feil').classList.contains('vis') && !$('feil').contains(e.target)) $('feilLast').focus(); }, true);
// Trykk på grensesnittet skal ikke flytte kameraet eller trykke på gården bak
['hud', 'hoyre', 'handling', 'revTips', 'flyttLinje', 'nivaaOpp', 'melding'].forEach(id => ['pointerdown', 'wheel'].forEach(ev => $(id).addEventListener(ev, e => e.stopPropagation(), {passive: true})));

/* ======================= Bygg verden og start løkka ======================= */
bygg();
if (innerWidth < innerHeight) { cam.target.set(3.2, 0, -1.2); cam.dist = 74; plasserKamera(); }   /* høykant: hele tunet i bildet */
lagAkerProto(); finnFasteTing(); finnHinder(); plasserAlt(); lagEgg(); synk(true);
loop();
window.__spill = {finnVei, tingRekt, get s() { return s; }, L, D, ting, erLedig, finnLedigPlass, hinder: () => hinder, synk, lagre, bruk, get startet() { return startet; }, robotJobb, plasserAlt};
