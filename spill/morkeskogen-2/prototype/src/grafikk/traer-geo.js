// Tregeometri for de to stilene. Gir { stamme, krone, h } per art, variant og detaljnivå (lod 0 = nær, 1 = langt unna).
// Stil 1 «stilisert eventyr»: egen generator med myke kroneklumper og fargeoverganger.
// Stil 2 «stilisert naturalisme»: EZ-Tree (MIT) for grenstruktur og bladkort, med egne materialer.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Tree } from '../ezlib/index.js';
import { loadPreset } from '../ezlib/presets/index.js';
import { lagRng } from '../verden.js';

export const ARTER = ['gran', 'furu', 'bjork', 'lov'];
// Målhøyde (enheter) før t.s. Litt høyere enn i 5.6.2 (ca. 125) for mer skogfølelse; kollisjon og hugging er uendret.
export const HOYDE = { gran: 165, furu: 155, bjork: 135, lov: 128 };

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function hash3(x, y, z) { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); }

function farge(geo, fn) {                 // fn(posisjon, indeks) -> [r,g,b] (lineære verdier)
  const p = geo.attributes.position, c = new Float32Array(p.count * 3), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = fn(v, i); c[i * 3] = k[0]; c[i * 3 + 1] = k[1]; c[i * 3 + 2] = k[2]; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo;
}
function vind(geo, h, flagre = 0) {       // aWind: hvor mye punktet svaier (0 ved roten)
  const p = geo.attributes.position, w = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const t = Math.max(0, p.getY(i) / h); w[i * 2] = t * t; w[i * 2 + 1] = flagre * hash3(p.getX(i), p.getY(i), p.getZ(i)); }
  geo.setAttribute('aWind', new THREE.BufferAttribute(w, 2)); return geo;
}
function myke(geo, senter, k = 0.75) {     // «kulenormaler» gir myk, sammenhengende kronebelysning
  const p = geo.attributes.position, n = geo.attributes.normal, a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    a.fromBufferAttribute(p, i).sub(senter).normalize(); b.fromBufferAttribute(n, i);
    b.lerp(a, k).normalize(); n.setXYZ(i, b.x, b.y, b.z);
  }
  return geo;
}
const ikkeIndeks = g => (g.index ? g.toNonIndexed() : g);
function slå(geoer) {
  const ut = geoer.map(g => { g = ikkeIndeks(g); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color', 'uv', 'aWind'].includes(k)) g.deleteAttribute(k); if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); return g; });
  return mergeGeometries(ut, false);
}
const lin = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const blandK = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---------- Stil 1: stilisert eventyr ----------
function stammeGeo(R, h, rBunn, rTopp, seg, bøy) {
  const g = new THREE.CylinderGeometry(rTopp, rBunn, h, seg, 6, true); g.translate(0, h / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / h; p.setX(i, p.getX(i) + bøy.x * Math.sin(y * 2.4)); p.setZ(i, p.getZ(i) + bøy.y * Math.sin(y * 2.4)); }
  g.computeVertexNormals(); return g;
}
function glatt(g) { g.deleteAttribute('normal'); g.deleteAttribute('uv'); return mergeVertices(g); }
function klump(R, c, r, sy, detalj) {
  const g = glatt(new THREE.IcosahedronGeometry(1, detalj)), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const d = 1 + (hash3(v.x * 3 + c.x, v.y * 3, v.z * 3 + c.z) - .5) * .35; p.setXYZ(i, v.x * r * d + c.x, v.y * r * sy * d + c.y, v.z * r * d + c.z); }
  g.computeVertexNormals(); return g;
}
function eventyrTre(art, variant, lod) {
  const R = lagRng(1000 + ARTER.indexOf(art) * 31 + variant * 7), rr = (a, b) => a + (b - a) * R();
  const H = HOYDE[art], biter = [], kroner = [];
  const bøy = new THREE.Vector2(rr(-4, 4), rr(-4, 4));
  if (art === 'gran') {
    const st = stammeGeo(R, H * .95, 5.5, 1.2, lod ? 5 : 7, bøy);
    biter.push(farge(st, () => lin('#5b4636')));
    const lag = lod ? 5 : 8, rad = lod ? 7 : 11;
    for (let i = 0; i < lag; i++) {
      const t = i / (lag - 1), y0 = H * (.12 + .72 * t), r = H * .3 * Math.pow(1 - t * .88, 1.05) + 4, hh = H * (.26 - .1 * t);
      const g = new THREE.ConeGeometry(r, hh, rad, 2, true); g.translate(0, y0 + hh / 2, 0); g.rotateY(rr(0, 6.28));
      const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const y = p.getY(k); if (y < y0 + 1) { const ang = Math.atan2(p.getZ(k), p.getX(k)); p.setY(k, y - (Math.sin(ang * rad) * .5 + .5) * hh * .22 - 2); const d = 1 + (hash3(ang, i, variant) - .5) * .18; p.setX(k, p.getX(k) * d); p.setZ(k, p.getZ(k) * d); } }
      g.computeVertexNormals();
      myke(g, V(0, y0 + hh * .2, 0), .55);
      const mørk = lin('#1f4a2a'), lys = lin('#4f8f3e');
      farge(g, v => blandK(mørk, lys, Math.min(1, Math.max(0, (v.y - y0) / hh * .6 + t * .45 + (Math.hypot(v.x, v.z) / r) * .25))));
      kroner.push(g);
    }
  } else {
    const def = {
      furu: { st: '#a35a32', st2: '#c77a45', stH: .78, rB: 5, rT: 1.8, n: lod ? 3 : 5, r: [18, 26], c: ['#2f5a2c', '#6c9a45'], sy: .5, spr: .2 },
      bjork: { st: '#e9e4d8', st2: '#f4f1ea', stH: .7, rB: 3.6, rT: 1.2, n: lod ? 4 : 7, r: [16, 22], c: ['#4f8a34', '#a8cf5c'], sy: .85, spr: .26 },
      lov: { st: '#5a4632', st2: '#6e5640', stH: .55, rB: 6, rT: 2.4, n: lod ? 4 : 8, r: [22, 30], c: ['#3a6b2c', '#86b24c'], sy: .8, spr: .3 },
    }[art];
    const st = stammeGeo(R, H * def.stH, def.rB, def.rT, lod ? 5 : 7, bøy);
    biter.push(farge(st, v => art === 'bjork' && hash3(Math.floor(v.y / 6), 1, variant) > .72 && Math.abs(v.x) + Math.abs(v.z) > 0 ? lin('#2b2622') : blandK(lin(def.st), lin(def.st2), v.y / H)));
    const senter = V(bøy.x * .6, H * (def.stH + (1 - def.stH) * .35), bøy.y * .6);
    for (let i = 0; i < def.n; i++) {
      const a = i / def.n * 6.28 + rr(-.3, .3), d = i === 0 ? 0 : rr(.4, 1) * H * def.spr, y = senter.y + (i === 0 ? H * .08 : rr(-.12, .1) * H);
      const c = V(senter.x + Math.cos(a) * d, y, senter.z + Math.sin(a) * d), r = rr(def.r[0], def.r[1]) * H / 130;
      const g = klump(R, c, r, def.sy, lod ? 1 : 2);
      if (i > 0 && !lod) { const gren = stammeGeo(R, d * 1.05, 1.6, .6, 4, new THREE.Vector2()); gren.rotateZ(-Math.PI / 2 + .5); gren.rotateY(-a); gren.translate(senter.x, y - H * .1, senter.z); biter.push(farge(gren, () => lin(def.st))); }
      kroner.push(g);
    }
    const ytre = H * def.spr + def.r[1];
    for (const g of kroner) { myke(g, senter, .7); farge(g, v => blandK(lin(def.c[0]), lin(def.c[1]), Math.min(1, Math.max(0, (v.y - senter.y) / (H * .35) * .5 + .45 + (Math.hypot(v.x - senter.x, v.z - senter.z) / ytre) * .3)))); }
  }
  return { stamme: vind(slå(biter), H), krone: vind(slå(kroner), H, 1), h: H };
}

// ---------- Stil 2: stilisert naturalisme (EZ-Tree) ----------
const EZ = {   // lod 0 = nær (ca. 4–7 k trekanter), lod 1 = langt unna (ca. 0,7–1,8 k)
  gran: { preset: 'Pine Large', bark: 'pine', blad: 'pine', tilpass(o, lod) { if (lod) { o.branch.levels = 1; o.branch.children[0] = 30; o.leaves.count = 4; o.leaves.size *= 4; } else { o.branch.children[0] = 60; o.leaves.count = 13; o.leaves.size *= 2.3; } } },
  furu: { preset: 'Pine Medium', bark: 'pine', blad: 'pine', tilpass(o, lod) { o.branch.start[1] = .55; o.branch.angle[1] = 80; o.branch.length[1] *= .9; o.bark.tint = 0xffd2b0; if (lod) { o.branch.levels = 1; o.branch.children[0] = 16; o.leaves.count = 5; o.leaves.size *= 4; } else { o.branch.children[0] = 34; o.leaves.count = 14; o.leaves.size *= 2.2; } } },
  bjork: { preset: 'Aspen Medium', bark: 'birch', blad: 'ash', tilpass(o, lod) { o.leaves.tint = 0xd8f0a8; if (lod) { o.branch.levels = Math.min(o.branch.levels, 2); o.branch.children[1] = Math.ceil(o.branch.children[1] * .5); o.leaves.count = Math.ceil(o.leaves.count * .4); o.leaves.size *= 2.4; } else { o.leaves.count = Math.ceil(o.leaves.count * .8); o.leaves.size *= 1.35; } } },
  lov: { preset: 'Oak Medium', bark: 'oak', blad: 'oak', tilpass(o, lod) { if (lod) { o.branch.levels = Math.min(o.branch.levels, 2); o.branch.children[1] = Math.ceil(o.branch.children[1] * .4); o.leaves.count = Math.ceil(o.leaves.count * .35); o.leaves.size *= 2.6; } else { o.leaves.count = Math.ceil(o.leaves.count * .5); o.leaves.size *= 1.6; } } },
};
export const EZ_TEKSTURER = { gran: ['pine', 'pine'], furu: ['pine', 'pine'], bjork: ['birch', 'ash'], lov: ['oak', 'oak'] };

function naturTre(art, variant, lod) {
  const def = EZ[art], t = new Tree(), o = JSON.parse(JSON.stringify(loadPreset(def.preset)));
  o.seed = 4242 + variant * 977 + ARTER.indexOf(art) * 31;
  def.tilpass(o, lod);
  if (lod) {                                   // færre sider og seksjoner langt unna
    for (const k of Object.keys(o.branch.sections)) o.branch.sections[k] = Math.max(3, Math.round(o.branch.sections[k] * .4));
    for (const k of Object.keys(o.branch.segments)) o.branch.segments[k] = 3;
  } else {
    for (const k of Object.keys(o.branch.sections)) o.branch.sections[k] = Math.max(4, Math.round(o.branch.sections[k] * .65));
    for (const k of Object.keys(o.branch.segments)) o.branch.segments[k] = Math.max(3, Math.round(o.branch.segments[k] * .75));
  }
  t.loadFromJson(o);
  let st = t.branchesMesh.geometry, kr = t.leavesMesh.geometry;
  st.computeBoundingBox(); kr.computeBoundingBox();
  const topp = Math.max(st.boundingBox.max.y, kr.boundingBox.max.y), k = HOYDE[art] / topp;
  st.scale(k, k, k); kr.scale(k, k, k);
  kr.computeBoundingBox(); const c = new THREE.Vector3(); kr.boundingBox.getCenter(c); c.y -= (kr.boundingBox.max.y - kr.boundingBox.min.y) * .1;
  myke(kr, c, .65);
  const bark = new THREE.Color(o.bark.tint), blad = new THREE.Color(o.leaves.tint);
  farge(st, () => [bark.r, bark.g, bark.b]); farge(kr, () => [blad.r, blad.g, blad.b]);
  return { stamme: vind(st, HOYDE[art]), krone: vind(kr, HOYDE[art], 1), h: HOYDE[art] };
}

export function lagTreGeo(stil, art, variant, lod) { return stil === 1 ? eventyrTre(art, variant, lod) : naturTre(art, variant, lod); }

export function lagBuskGeo(stil, variant) {
  if (stil === 1) {
    const R = lagRng(77 + variant), kl = [];
    for (let i = 0; i < 4; i++) { const a = i * 1.7, d = i ? 10 : 0; kl.push(klump(R, V(Math.cos(a) * d, 12 + R() * 4, Math.sin(a) * d), 13 + R() * 4, .75, 1)); }
    const g = slå(kl.map(x => myke(x, V(0, 10, 0), .7))); farge(g, v => blandK(lin('#2e6a2c'), lin('#7fae4a'), Math.min(1, v.y / 30)));
    return { stamme: null, krone: vind(g, 30, 1), h: 30 };
  }
  const t = new Tree(), o = JSON.parse(JSON.stringify(loadPreset('Bush 2'))); o.seed = 99 + variant; o.leaves.size *= 1.3; t.loadFromJson(o);
  const st = t.branchesMesh.geometry, kr = t.leavesMesh.geometry; st.computeBoundingBox();
  const k = 34 / Math.max(st.boundingBox.max.y, 1); st.scale(k, k, k); kr.scale(k, k, k); myke(kr, V(0, 14, 0), .7);
  farge(st, () => [1, 1, 1]); farge(kr, () => [.85, 1, .8]);
  return { stamme: vind(st, 34), krone: vind(kr, 34, 1), h: 34 };
}

export function lagSteinGeo(stil, variant) {
  const g = stil === 1 ? new THREE.IcosahedronGeometry(1, 1) : glatt(new THREE.IcosahedronGeometry(1, 3)), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const d = 1 + (hash3(v.x * 2 + variant, v.y * 2, v.z * 2) - .5) * (stil === 1 ? .35 : .5) + (stil === 2 ? (hash3(v.x * 7, v.y * 7, v.z * 7) - .5) * .08 : 0); p.setXYZ(i, v.x * 22 * d, Math.max(-.3, v.y) * 15 * d, v.z * 18 * d); }
  const ut = g; ut.computeVertexNormals();
  const p2 = ut.attributes.position, uv = new Float32Array(p2.count * 2);
  for (let i = 0; i < p2.count; i++) { uv[i * 2] = (p2.getX(i) + p2.getZ(i) * .7) / 60; uv[i * 2 + 1] = p2.getY(i) / 60; }
  ut.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return ut;
}
