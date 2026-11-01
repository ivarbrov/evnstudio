// Tømmerhytte med torvtak (samme størrelse som hytta i 5.6.2: ca. 72 × 52 enheter grunnflate).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { VERDEN, bakkeH } from '../verden.js';
import { lastTekstur } from './materialer.js';

export function lagHytte(scene, stil, tex) {
  const H = VERDEN.hytte, G = new THREE.Group(); G.position.set(H.x, bakkeH(H.x, H.z) - 1, H.z); G.rotation.y = H.rot; scene.add(G);
  const L = 76, B = 56, r = 3.6, lag = 9, logs = [];
  for (let i = 0; i < lag; i++) {
    const y = 4 + i * r * 1.8;
    for (const s of [-1, 1]) {
      const a = new THREE.CylinderGeometry(r, r, L + 14, 10); a.rotateZ(Math.PI / 2); a.translate(0, y, s * B / 2); logs.push(a);
      const b = new THREE.CylinderGeometry(r, r, B + 14, 10); b.rotateX(Math.PI / 2); b.translate(s * L / 2, y + r * .9, 0); logs.push(b);
    }
  }
  const veggH = 4 + lag * r * 1.8, gavl = 26;
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {          // gavler av liggende tømmer, kortere oppover
    const t = i / 6, len = (B + 6) * (1 - t), y = veggH + i * (gavl / 6);
    const g = new THREE.CylinderGeometry(r * .9, r * .9, len, 8); g.rotateX(Math.PI / 2); g.translate(s * L / 2, y, 0); logs.push(g);
  }
  const treMat = stil === 1 ? new THREE.MeshStandardMaterial({ color: 0x9a6a42, roughness: .85 }) : new THREE.MeshStandardMaterial({ map: lastTekstur('teksturer/oak_color_1k.jpg'), normalMap: lastTekstur('teksturer/oak_normal_1k.jpg', false), color: 0xc8a888, roughness: .9 });
  const tre = new THREE.Mesh(mergeGeometries(logs), treMat); tre.castShadow = tre.receiveShadow = true; tre.layers.enable(1); G.add(tre);
  // Torvtak
  const ang = Math.atan2(gavl, B / 2 + 4), lenT = Math.hypot(gavl, B / 2 + 4) + 10, tak = [];
  for (const s of [-1, 1]) { const g = new THREE.BoxGeometry(L + 26, 5, lenT); g.translate(0, 0, s * lenT / 2); g.rotateX(s * ang); g.translate(0, veggH + gavl + 3, 0); tak.push(g); }
  const takGeo = mergeGeometries(tak), p = takGeo.attributes.position, uv = takGeo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 60, p.getZ(i) / 60);
  const torv = new THREE.MeshStandardMaterial({ map: tex.gress.farge, normalMap: tex.gress.normal, color: stil === 1 ? 0xb8e090 : 0xa8b888, roughness: .95 });
  const takM = new THREE.Mesh(takGeo, torv); takM.castShadow = takM.receiveShadow = true; G.add(takM);
  // Dør, vindu og karmer
  const karm = [], dg = new THREE.BoxGeometry(18, 32, 2); dg.translate(-12, 18, B / 2 + 3.6);
  const vk = new THREE.BoxGeometry(18, 2.5, 3); vk.translate(16, 30, B / 2 + 3.4); karm.push(vk.clone(), vk.clone().translate(0, -14, 0));
  const vs = new THREE.BoxGeometry(2.5, 14, 3); vs.translate(7, 23, B / 2 + 3.4); karm.push(vs, vs.clone().translate(18, 0, 0));
  const dørMat = new THREE.MeshStandardMaterial({ color: stil === 1 ? 0x5a3a26 : 0x4a3424, roughness: .8 });
  const dør = new THREE.Mesh(mergeGeometries([dg, ...karm]), dørMat); dør.castShadow = true; G.add(dør);
  const vindu = new THREE.Mesh(new THREE.PlaneGeometry(16, 12).translate(16, 23, B / 2 + 3.2), new THREE.MeshStandardMaterial({ color: 0x223040, emissive: 0xffa040, emissiveIntensity: 0, roughness: .3 }));
  G.add(vindu);
  const varme = new THREE.PointLight(0xffa040, 0, 320, 1.4); varme.position.set(16, 24, B / 2 + 30); G.add(varme);
  return { oppdater(mork) { vindu.material.emissiveIntensity = .3 + mork * 4; varme.intensity = mork * 500; } };
}
