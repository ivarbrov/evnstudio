// Trær, busker og steiner tegnet med instansing.
// Videreført fra trinn 1: ting langt inne i tåka tegnes ikke (1a), små og fjerne ting kaster ikke skygge (1b/1c),
// og vi sorterer ut trær utenfor synsfeltet selv før vi fyller instansene (gir få tegnekall uansett antall trær).
import * as THREE from 'three';
import { ARTER, lagTreGeo, lagBuskGeo, lagSteinGeo, EZ_TEKSTURER } from './traer-geo.js';
import { medVind, lastTekstur } from './materialer.js';
import { bakkeH } from '../verden.js';

export function lagSkog(scene, verden, stil, kval, tex) {
  const T = 'teksturer/';   // relativt til index.html
  // Materialer per art (stamme og krone)
  const mat = {}, gjennom = {};
  for (const art of ARTER) {
    if (stil === 1) {
      gjennom[art] = {
        stamme: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, transparent: true, opacity: .3, depthWrite: false })),
        krone: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, transparent: true, opacity: .25, depthWrite: false }), { gjennomlys: .35, kantlys: .5 }),
      };
      mat[art] = {
        stamme: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 })),
        krone: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }), { gjennomlys: .35, kantlys: .5 }),
      };
    } else {
      const [bark, blad] = EZ_TEKSTURER[art];
      const map = lastTekstur(T + bark + '_color_1k.jpg'), nm = lastTekstur(T + bark + '_normal_1k.jpg', false);
      map.repeat.set(1, art === 'bjork' ? .5 : 1); nm.repeat.copy(map.repeat);
      const bm = lastTekstur(T + blad + '_color_512.png', true, false);
      gjennom[art] = {
        stamme: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, map, normalMap: nm, roughness: .95, transparent: true, opacity: .3, depthWrite: false })),
        krone: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, map: bm, alphaTest: .45, side: THREE.DoubleSide, roughness: .75, transparent: true, opacity: .25, depthWrite: false }), { gjennomlys: .6, kantlys: .15 }),
      };
      mat[art] = {
        stamme: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, map, normalMap: nm, roughness: .95 })),
        krone: medVind(new THREE.MeshStandardMaterial({ vertexColors: true, map: bm, alphaTest: .45, side: THREE.DoubleSide, roughness: .75 }), { gjennomlys: .6, kantlys: .15 }),
      };
    }
  }
  // Geometri og instanssett: [art][variant][lod] = { stamme, krone }
  const antall = {}; for (const t of verden.traer) antall[t.art + t.var] = (antall[t.art + t.var] || 0) + 1;
  const sett = {}, geoer = {}; let triNær = 0, triLangt = 0;
  for (const art of ARTER) for (const v of [0, 1]) for (const lod of [0, 1]) {
    const g = lagTreGeo(stil, art, v, lod), n = antall[art + v] || 1;
    geoer[art + v + lod] = g;
    const tri = (g.stamme.index ? g.stamme.index.count : g.stamme.attributes.position.count) / 3 + (g.krone.index ? g.krone.index.count : g.krone.attributes.position.count) / 3;
    if (lod) triLangt = Math.max(triLangt, tri); else triNær = Math.max(triNær, tri);
    const s = { h: g.h };
    for (const del of ['stamme', 'krone']) {
      const m = new THREE.InstancedMesh(g[del], mat[art][del], n);
      m.count = 0; m.frustumCulled = false; m.castShadow = lod === 0; m.receiveShadow = true;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); s[del] = m;
    }
    sett[art + v + lod] = s;
  }
  // Gjennomsiktige trær: trær mellom kameraet og helten tegnes svakt (helten skjules ikke bak trær, som i 5.6.2)
  const fade = {};
  for (const art of ARTER) for (const v of [0, 1]) {
    const g = geoer[art + v + '0'], f = {};
    for (const del of ['stamme', 'krone']) { const m = new THREE.InstancedMesh(g[del], gjennom[art][del], 8); m.count = 0; m.frustumCulled = false; m.renderOrder = 2; scene.add(m); f[del] = m; }
    fade[art + v] = f;
  }
  // Busker og steiner: sorteres som trærne (synsfelt + tåke), og bare de nære kaster skygge
  const småSett = [];
  function lagSmåSett(liste, deler, maksAvst, skyggeAvst, y0) {
    const ms = deler.map(([geo, m]) => { const im = new THREE.InstancedMesh(geo, m, Math.max(1, liste.length)); im.count = 0; im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(im); return im; });
    const mats = liste.map(o => { const e2 = new THREE.Euler(0, o.rot, 0), m4 = new THREE.Matrix4(); m4.compose(new THREE.Vector3(o.x, bakkeH(o.x, o.z) + y0 * o.s, o.z), new THREE.Quaternion().setFromEuler(e2), new THREE.Vector3(o.s, o.s, o.s)); return m4; });
    småSett.push({ liste, ms, mats, maksAvst, skyggeAvst });
  }
  for (const v of [0, 1]) {
    const bg = lagBuskGeo(stil, v), liste = verden.busker.filter((_, i) => i % 2 === v);
    lagSmåSett(liste, stil === 1 ? [[bg.krone, mat.lov.krone]] : [[bg.stamme, mat.lov.stamme], [bg.krone, mat.lov.krone]], 900, 0, -2);
    const sg = lagSteinGeo(stil, v), sl = verden.steiner.filter(o => o.var === v);
    const sm = new THREE.MeshStandardMaterial({ map: tex.stein.farge, normalMap: tex.stein.normal, roughness: stil === 1 ? .85 : .9, flatShading: stil === 1, color: stil === 1 ? 0xd8dce4 : 0xffffff });
    lagSmåSett(sl, [[sg, sm]], 1100, 0, -3);
  }
  // Stubber
  const stubbGeo = new THREE.CylinderGeometry(6, 7.5, 8, 9); stubbGeo.translate(0, 3, 0);
  const stubbTopp = new THREE.MeshStandardMaterial({ color: stil === 1 ? 0xcaa070 : 0xb89468, roughness: .9 });
  const stubber = new THREE.InstancedMesh(stubbGeo, stubbTopp, 64); stubber.count = 0; stubber.castShadow = true; stubber.receiveShadow = true; scene.add(stubber);

  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), skal = new THREE.Vector3();
  function stubbe(t) { if (stubber.count >= 64) return; M.compose(new THREE.Vector3(t.x, bakkeH(t.x, t.z) - 1, t.z), q.setFromEuler(e.set(0, t.rot, 0)), new THREE.Vector3(t.s, t.s, t.s)); stubber.setMatrixAt(stubber.count++, M); stubber.instanceMatrix.needsUpdate = true; stubber.computeBoundingSphere(); }
  verden.traer.filter(t => !t.levende).forEach(stubbe);      // stubber blir stående når stil eller kvalitet byttes
  const frustum = new THREE.Frustum(), PV = new THREE.Matrix4(), kule = new THREE.Sphere(), proj = new THREE.Vector3();
  const fallende = [];
  let tegnetNær = 0, tegnetLangt = 0;

  function oppdater(dt, kamera, helt, taakeFjern) {
    PV.multiplyMatrices(kamera.projectionMatrix, kamera.matrixWorldInverse); frustum.setFromProjectionMatrix(PV);
    for (const k in sett) { sett[k].stamme.count = 0; sett[k].krone.count = 0; }
    for (const k in fade) { fade[k].stamme.count = 0; fade[k].krone.count = 0; }
    const heltAvst = Math.hypot(helt.x - kamera.position.x, helt.z - kamera.position.z);
    const lodD = kval.lodAvstand, maks = taakeFjern + 120, cx = kamera.position.x, cz = kamera.position.z;
    tegnetNær = tegnetLangt = 0;
    for (const t of verden.traer) {
      if (!t.levende) continue;
      const dk = Math.hypot(t.x - cx, t.z - cz); if (dk > maks) continue;           // 1a: helt i tåka
      const h = t.h0 ?? (t.h0 = bakkeH(t.x, t.z)), H = 160 * t.s, dh = Math.hypot(t.x - helt.x, t.z - helt.z);
      kule.center.set(t.x, h + H * .5, t.z); kule.radius = H * .65;
      if (!frustum.intersectsSphere(kule) && dh > 260) continue;                   // utenfor synsfeltet (men nære trær gir fortsatt skygge)
      // Står treet mellom kameraet og helten (eller helt inntil kameraet)?
      let iVeien = false;
      if (dk < heltAvst - 25) {                                   // nærmere kameraet enn helten: dekker kronen midten av bildet?
        for (const k of [.2, .45, .7]) {                           // stamme, midt og krone
          proj.set(t.x, h + H * k, t.z).project(kamera);
          if (Math.abs(proj.x) < .55 && proj.y > -.95 && proj.y < .8 && proj.z < 1) { iVeien = true; break; }
        }
      }
      const f = fade[t.art + t.var];
      const lod = dk < lodD ? 0 : 1, s = iVeien && f.krone.count < 8 ? null : sett[t.art + t.var + lod];
      if (t.rist > 0) t.rist = Math.max(0, t.rist - dt * 3);
      const r = t.rist * .06 * Math.sin(t.rist * 30);
      e.set(r, t.rot, r * .6); q.setFromEuler(e); pos.set(t.x, h - 1.5, t.z); skal.set(t.s, t.s, t.s);
      M.compose(pos, q, skal);
      if (!s) { f.stamme.setMatrixAt(f.stamme.count++, M); f.krone.setMatrixAt(f.krone.count++, M); tegnetNær++; continue; }
      s.stamme.setMatrixAt(s.stamme.count++, M); s.krone.setMatrixAt(s.krone.count++, M);
      if (lod) tegnetLangt++; else tegnetNær++;
    }
    for (const k in sett) { const s = sett[k]; if (s.stamme.count) s.stamme.instanceMatrix.needsUpdate = true; if (s.krone.count) s.krone.instanceMatrix.needsUpdate = true; }
    for (const k in fade) { const f = fade[k]; if (f.krone.count) { f.stamme.instanceMatrix.needsUpdate = true; f.krone.instanceMatrix.needsUpdate = true; } }
    for (const S of småSett) {                                      // busker og steiner
      for (const im of S.ms) im.count = 0;
      const maksS = Math.min(S.maksAvst, maks);
      S.liste.forEach((o, i) => {
        const dk = Math.hypot(o.x - cx, o.z - cz); if (dk > maksS) return;
        kule.center.set(o.x, bakkeH(o.x, o.z) + 15, o.z); kule.radius = 40 * o.s;
        if (!frustum.intersectsSphere(kule) && Math.hypot(o.x - helt.x, o.z - helt.z) > 200) return;
        for (const im of S.ms) im.setMatrixAt(im.count++, S.mats[i]);
      });
      for (const im of S.ms) if (im.count) im.instanceMatrix.needsUpdate = true;
    }
    // Trær som faller
    for (let i = fallende.length - 1; i >= 0; i--) {
      const f = fallende[i]; f.t += dt;
      f.v += dt * 2.6 * Math.max(.2, Math.sin(f.a) + .15); f.a = Math.min(Math.PI / 2 - .05, f.a + f.v * dt);
      if (f.a >= Math.PI / 2 - .05 && !f.landet) { f.landet = true; f.landetT = f.t; }
      f.g.quaternion.setFromAxisAngle(f.akse, f.a).multiply(f.q0);
      if (f.landet) { const k = Math.min(1, (f.t - f.landetT - 1.2) / .8); if (k > 0) { f.g.position.y = f.y0 - k * 40 * f.s; f.g.scale.setScalar(f.s * (1 - k * .6)); } if (k >= 1) { scene.remove(f.g); fallende.splice(i, 1); } }
    }
  }

  function felle(t, fraX, fraZ) {
    t.levende = false;
    const g0 = geoer[t.art + t.var + '0'], g = new THREE.Group();
    const ms = new THREE.Mesh(g0.stamme, mat[t.art].stamme), mk = new THREE.Mesh(g0.krone, mat[t.art].krone);
    ms.castShadow = mk.castShadow = true; g.add(ms, mk);
    const y0 = bakkeH(t.x, t.z) + 4; g.position.set(t.x, y0, t.z); g.scale.setScalar(t.s);
    const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, t.rot, 0)); g.quaternion.copy(q0);
    const dx = t.x - fraX, dz = t.z - fraZ, d = Math.hypot(dx, dz) || 1;          // faller bort fra helten
    const akse = new THREE.Vector3(dz / d, 0, -dx / d);
    scene.add(g); fallende.push({ g, akse, q0, a: 0, v: 0, t: 0, y0, s: t.s, landet: false });
    stubbe(t);
  }

  return { oppdater, felle, info: () => ({ triNær, triLangt, tegnetNær, tegnetLangt }) };
}
