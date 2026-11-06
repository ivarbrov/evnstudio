// EVN-roboten v2, steg 2: setter den nye geometrien fra Blender (robot_geometri.py) inn i originalens skjelett.
// Ledd, leddnavn, hvilestilling og alle 14 animasjoner kopieres uendret fra originalen.
// Hodet beholdes som egen del på hodeleddet med morfmålene og samme rekkefølge på materialene (Head_1..3 som før).
// Resten (12 stive deler + to hender) slås sammen til én bøyelig mesh med to materialer: 19 tegnekall blir 5.
// Bruk: node bygg-robot-v2.mjs <original.glb> <geometri.json> <ut.glb>
import fs from 'fs';
const [INN, GEO, UT] = process.argv.slice(2);

// ---------- les original ----------
const buf = fs.readFileSync(INN);
const jl = buf.readUInt32LE(12), J = JSON.parse(buf.slice(20, 20 + jl).toString());
const binStart = 20 + jl + 8, BIN = buf.slice(binStart, binStart + buf.readUInt32LE(20 + jl));
const geo = JSON.parse(fs.readFileSync(GEO, 'utf8'));
const KOMP = { 5126: 4, 5123: 2, 5121: 1, 5125: 4, 5122: 2, 5120: 1 }, ANT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function lesAcc(i) {
  const a = J.accessors[i], bv = J.bufferViews[a.bufferView], s = KOMP[a.componentType], n = ANT[a.type];
  const stride = bv.byteStride || s * n, ut = [];
  for (let k = 0; k < a.count; k++) { const o = (bv.byteOffset || 0) + (a.byteOffset || 0) + k * stride, r = [];
    for (let c = 0; c < n; c++) r.push(a.componentType === 5126 ? BIN.readFloatLE(o + c * 4) : a.componentType === 5123 ? BIN.readUInt16LE(o + c * 2) : BIN.readUInt8(o + c));
    ut.push(r); }
  return ut;
}

// ---------- matriser (kolonnevis som glTF) ----------
const I4 = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
const mul = (a, b) => { const r = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 4; k++) r[c * 4 + rr] += a[k * 4 + rr] * b[c * 4 + k]; return r; };
const trs = n => { if (n.matrix) return n.matrix.slice(); const [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1], t = n.translation || [0, 0, 0];
  return [(1 - 2 * (y * y + z * z)) * sx, (2 * (x * y + z * w)) * sx, (2 * (x * z - y * w)) * sx, 0, (2 * (x * y - z * w)) * sy, (1 - 2 * (x * x + z * z)) * sy, (2 * (y * z + x * w)) * sy, 0, (2 * (x * z + y * w)) * sz, (2 * (y * z - x * w)) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, t[0], t[1], t[2], 1]; };
function inv(m) { // generell 4x4-invers
  const a = m, r = new Array(16);
  const [a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33] = a;
  const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
  const d = 1 / (b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);
  r[0]=(a11*b11-a12*b10+a13*b09)*d; r[1]=(a02*b10-a01*b11-a03*b09)*d; r[2]=(a31*b05-a32*b04+a33*b03)*d; r[3]=(a22*b04-a21*b05-a23*b03)*d;
  r[4]=(a12*b08-a10*b11-a13*b07)*d; r[5]=(a00*b11-a02*b08+a03*b07)*d; r[6]=(a32*b02-a30*b05-a33*b01)*d; r[7]=(a20*b05-a22*b02+a23*b01)*d;
  r[8]=(a10*b10-a11*b08+a13*b06)*d; r[9]=(a01*b08-a00*b10-a03*b06)*d; r[10]=(a30*b04-a31*b02+a33*b00)*d; r[11]=(a21*b02-a20*b04-a23*b00)*d;
  r[12]=(a11*b07-a10*b09-a12*b06)*d; r[13]=(a00*b09-a01*b07+a02*b06)*d; r[14]=(a31*b01-a30*b03-a32*b00)*d; r[15]=(a20*b03-a21*b01+a22*b00)*d;
  return r;
}
const pkt = (m, v) => [0, 1, 2].map(r => m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r]);
const ret = (m, v) => { const r = [0, 1, 2].map(i => m[i] * v[0] + m[4 + i] * v[1] + m[8 + i] * v[2]), l = Math.hypot(...r) || 1; return r.map(x => x / l); };

const forelder = {}; J.nodes.forEach((n, i) => (n.children || []).forEach(c => forelder[c] = i));
const W = {}; const verden = i => W[i] || (W[i] = forelder[i] == null ? trs(J.nodes[i]) : mul(verden(forelder[i]), trs(J.nodes[i])));
J.nodes.forEach((_, i) => verden(i));
const nodeAvNavn = {}; J.nodes.forEach((n, i) => { if (!(n.name in nodeAvNavn)) nodeAvNavn[n.name] = i; });

// ---------- ny skin over de samme 43 leddene ----------
const ledd = J.skins[0].joints.slice();
const leddIndeks = {}; ledd.forEach((ni, k) => leddIndeks[ni] = k);
const nyIBM = ledd.map(ni => inv(W[ni]));
const gamleIBM = J.skins.map(s => lesAcc(s.inverseBindMatrices));

// ---------- bygg kroppen (alt unntatt hodet) i verdensrom ----------
const kropp = {};   // materiale -> hjørner
let hodeNode = null;
J.nodes.forEach((n, ni) => {
  if (n.mesh == null) return;
  const navn = J.meshes[n.mesh].name, g = geo[navn];
  if (!g) throw new Error('mangler geometri for ' + navn);
  if (navn === 'Head') { hodeNode = ni; return; }
  for (const [mat, p, nrm, vekter] of g.hjorner) {
    let pos, nor, jn, wt;
    if (n.skin == null) {                         // stiv del: følger forelderleddet
      const bein = forelder[ni];
      if (!(bein in leddIndeks)) throw new Error(navn + ': forelderen er ikke et ledd');
      pos = pkt(W[ni], p); nor = ret(W[ni], nrm); jn = [leddIndeks[bein], 0, 0, 0]; wt = [1, 0, 0, 0];
    } else {                                      // hendene: bøyelige i originalen. Hvilestilling etter glTF-regelen (nodens egen matrise brukes ikke)
      const skin = J.skins[n.skin]; const vp = p, vn = nrm;
      pos = [0, 0, 0]; let nn = [0, 0, 0]; const tot = vekter.reduce((s, x) => s + x[1], 0) || 1;
      jn = [0, 0, 0, 0]; wt = [0, 0, 0, 0];
      vekter.forEach(([bn, w], k) => {
        const ni2 = nodeAvNavn[bn]; const kj = skin.joints.indexOf(ni2); if (kj < 0) throw new Error('ukjent ledd ' + bn);
        const BM = mul(W[ni2], gamleIBM[n.skin][kj]);
        const q = pkt(BM, vp), r = ret(BM, vn);
        for (let c = 0; c < 3; c++) { pos[c] += q[c] * w / tot; nn[c] += r[c] * w / tot; }
        jn[k] = leddIndeks[ni2]; wt[k] = w / tot;
      });
      const l = Math.hypot(...nn) || 1; nor = nn.map(x => x / l);
    }
    (kropp[mat] = kropp[mat] || []).push({ pos, nor, jn, wt });
  }
});

// ---------- ny binær ----------
const deler = []; let lengde = 0; const nyeVisninger = [], nyeAcc = [];
function leggTil(bytes, target) { const pad = (4 - lengde % 4) % 4; if (pad) { deler.push(Buffer.alloc(pad)); lengde += pad; }
  const v = { buffer: 0, byteOffset: lengde, byteLength: bytes.length }; if (target) v.target = target; deler.push(bytes); lengde += bytes.length; nyeVisninger.push(v); return nyeVisninger.length - 1; }
function acc(arr, type, ct, target, minmax) {
  const n = ANT[type], s = KOMP[ct], b = Buffer.alloc(arr.length * n * s);
  arr.forEach((r, k) => r.forEach((x, c) => { const o = (k * n + c) * s; if (ct === 5126) b.writeFloatLE(x, o); else if (ct === 5123) b.writeUInt16LE(x, o); else if (ct === 5125) b.writeUInt32LE(x, o); else b.writeUInt8(x, o); }));
  const a = { bufferView: leggTil(b, target), componentType: ct, count: arr.length, type };
  if (minmax) { a.min = [0, 1, 2].map(c => Math.min(...arr.map(r => r[c]))); a.max = [0, 1, 2].map(c => Math.max(...arr.map(r => r[c]))); }
  nyeAcc.push(a); return nyeAcc.length - 1;
}
function kopierAcc(i) { const a = J.accessors[i], data = lesAcc(i); const ny = acc(data, a.type, a.componentType, null, false); if (a.min) { nyeAcc[ny].min = a.min; nyeAcc[ny].max = a.max; } return ny; }

// samle like hjørner til indeksert geometri
function indekser(hj, nokkel) {
  const kart = new Map(), unike = [], idx = [];
  for (const h of hj) { const k = nokkel(h); let i = kart.get(k); if (i == null) { i = unike.length; kart.set(k, i); unike.push(h); } idx.push(i); }
  return { unike, idx };
}
const r6 = x => Math.round(x * 1e6);
const primitiv = (unike, idx, attrs) => ({ attributes: attrs, indices: acc(idx.map(i => [i]), 'SCALAR', unike.length < 65536 ? 5123 : 5125, 34963) });

// kroppen
const matIndeks = {}; J.materials.forEach((m, i) => matIndeks[m.name] = i);
const kroppPrim = [];
for (const mat of ['Main', 'Grey', 'Black']) {
  const hj = kropp[mat]; if (!hj) continue;
  const { unike, idx } = indekser(hj, h => [...h.pos, ...h.nor].map(r6).join(',') + '|' + h.jn.join(',') + '|' + h.wt.map(r6).join(','));
  const p = primitiv(unike, idx, {
    POSITION: acc(unike.map(h => h.pos), 'VEC3', 5126, 34962, true),
    NORMAL: acc(unike.map(h => h.nor), 'VEC3', 5126, 34962),
    JOINTS_0: acc(unike.map(h => h.jn), 'VEC4', 5121, 34962),
    WEIGHTS_0: acc(unike.map(h => h.wt), 'VEC4', 5126, 34962) });
  p.material = matIndeks[mat]; kroppPrim.push(p);
}
// hodet: lokale koordinater på samme node, materialene i samme rekkefølge som før, morfmål beholdt
const hodeMeshGammel = J.meshes[J.nodes[hodeNode].mesh], hg = geo.Head;
const formNavn = hodeMeshGammel.extras && hodeMeshGammel.extras.targetNames || Object.keys(hg.former);
const hodePrim = [];
for (const gp of hodeMeshGammel.primitives) {
  const mat = J.materials[gp.material].name;
  const hj = hg.hjorner.map((h, k) => ({ pos: h[1], nor: h[2], d: formNavn.map(f => hg.former[f][k]), mat: h[0] })).filter(h => h.mat === mat);
  const { unike, idx } = indekser(hj, h => [...h.pos, ...h.nor, ...h.d.flat()].map(r6).join(','));
  const p = primitiv(unike, idx, { POSITION: acc(unike.map(h => h.pos), 'VEC3', 5126, 34962, true), NORMAL: acc(unike.map(h => h.nor), 'VEC3', 5126, 34962) });
  p.targets = formNavn.map((f, fi) => ({ POSITION: acc(unike.map(h => h.d[fi]), 'VEC3', 5126, 34962, true) }));
  p.material = gp.material; hodePrim.push(p);
}

// ---------- ny JSON ----------
const ny = JSON.parse(JSON.stringify(J));
ny.asset = { version: '2.0', generator: 'EVN Studio bygg-robot-v2 (Blender 4.5 + originalens skjelett)' };
// animasjonene kopieres uendret (samme verdier, samme ledd)
for (const a of ny.animations) for (const s of a.samplers) { s.input = kopierAcc(s.input); s.output = kopierAcc(s.output); }
ny.meshes = [
  { name: 'Head', primitives: hodePrim, extras: hodeMeshGammel.extras, weights: hodeMeshGammel.weights },
  { name: 'Robotkropp', primitives: kroppPrim },
];
if (!hodeMeshGammel.weights) delete ny.meshes[0].weights;
ny.skins = [{ name: 'Robot', joints: ledd, skeleton: J.skins[0].skeleton, inverseBindMatrices: acc(nyIBM, 'MAT4', 5126, null, false) }];
ny.nodes.forEach((n, i) => { if (i === hodeNode) { n.mesh = 0; delete n.skin; } else { delete n.mesh; delete n.skin; } });
const rot = ny.scenes[ny.scene || 0].nodes[0];
ny.nodes.push({ name: 'Robotkropp', mesh: 1, skin: 0 }); (ny.nodes[rot].children = ny.nodes[rot].children || []).push(ny.nodes.length - 1);
// overflate: samme farger, litt mer liv (metall, ruhet). Ingen teksturer.
const FINISH = { Main: [0.1, 0.55], Grey: [0.55, 0.42], Black: [0.05, 0.28] };
for (const m of ny.materials) { if (FINISH[m.name]) { m.pbrMetallicRoughness.metallicFactor = FINISH[m.name][0]; m.pbrMetallicRoughness.roughnessFactor = FINISH[m.name][1]; } delete m.extras; }
ny.accessors = nyeAcc; ny.bufferViews = nyeVisninger;
const bin = Buffer.concat(deler); const binPad = Buffer.concat([bin, Buffer.alloc((4 - bin.length % 4) % 4)]);
ny.buffers = [{ byteLength: binPad.length }];
let js = Buffer.from(JSON.stringify(ny)); js = Buffer.concat([js, Buffer.alloc((4 - js.length % 4) % 4, 0x20)]);
const hode = Buffer.alloc(12); hode.write('glTF', 0); hode.writeUInt32LE(2, 4); hode.writeUInt32LE(12 + 8 + js.length + 8 + binPad.length, 8);
const c1 = Buffer.alloc(8); c1.writeUInt32LE(js.length, 0); c1.write('JSON', 4);
const c2 = Buffer.alloc(8); c2.writeUInt32LE(binPad.length, 0); c2.writeUInt32LE(0x004E4942, 4);
fs.writeFileSync(UT, Buffer.concat([hode, c1, js, c2, binPad]));
console.log('skrev', UT, 'byte', 12 + 8 + js.length + 8 + binPad.length);
