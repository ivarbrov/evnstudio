// Kameraet fra 5.6.2: «nær» (bak helten) og «langt» (ovenfra), med samme avstander, mus/zoom og kollisjon mot trær og hytta.
import * as THREE from 'three';
import { bakkeH, VERDEN } from './verden.js';

export function lagKamera() {
  const kamera = new THREE.PerspectiveCamera(50, 1, 5, 12000);
  const K = { modus: 'near', e: 1, yaw: 0, pitch: 0, zoom: 1, k: 1, lift: 0, mål: new THREE.Vector3(VERDEN.start.x, 0, VERDEN.start.z), rist: 0 };
  function oppdater(dt, p, verden, smal) {
    K.mål.lerp(new THREE.Vector3(p.x, 0, p.z), Math.min(1, dt * 6));
    K.e += ((K.modus === 'near' ? 1 : 0) - K.e) * Math.min(1, dt * 4);
    const hopp = p.iLufta ? p.h - bakkeH(p.x, p.z) : 0;
    K.lift += (hopp * .45 - K.lift) * Math.min(1, dt * 7);
    const e2 = K.e, back = smal ? 1.3 : 1, ct = K.mål, ch = bakkeH(ct.x, ct.z) + K.lift;
    const pk = 1 + K.pitch, zm = K.zoom, cy = (330 + (120 - 330) * e2) * back * pk * zm, cz = (290 + (220 - 290) * e2) * back * (1 - K.pitch * .35) * zm;
    const ly = 10 + 30 * e2, lz = -10 - 150 * e2, FWX = -Math.sin(K.yaw), FWZ = -Math.cos(K.yaw);
    const bx = ct.x - FWX * cz, bz = ct.z - FWZ * cz, camY = Math.max(ch + cy, bakkeH(bx, bz) + 35);
    // Kollisjon: trekk kameraet inn foran trær og hytta (som i 5.6.2)
    const hx = ct.x, hy = ch + 45, hz = ct.z, ex = bx - hx, ey = camY - hy, ez = bz - hz;
    const x0 = Math.min(hx, bx) - 60, x1 = Math.max(hx, bx) + 60, z0 = Math.min(hz, bz) - 60, z1 = Math.max(hz, bz) + 60;
    const tr = verden.traer.filter(t => t.levende && t.x > x0 && t.x < x1 && t.z > z0 && t.z < z1), H = VERDEN.hytte;
    let k = 1;
    for (let i = 2; i <= 14 && k === 1; i++) {
      const f = i / 14, x = hx + ex * f, y = hy + ey * f, z = hz + ez * f, gy = bakkeH(x, z);
      let hit = y < gy + 12;
      if (!hit) for (const t of tr) { const r = 15 * t.s, h = 160 * t.s; if (Math.hypot(t.x - x, t.z - z) < r && y < (t.h0 ?? gy) + h) { hit = true; break; } }
      if (!hit && Math.hypot(x - H.x, z - H.z) < 50 && y < gy + 85) hit = true;
      if (hit) k = Math.max(0.16, (i - 1.5) / 14);
    }
    K.k += (k - K.k) * Math.min(1, dt * (k < K.k ? 18 : 2.5));
    kamera.position.set(hx + ex * K.k, hy + ey * K.k, hz + ez * K.k);
    kamera.lookAt(ct.x - FWX * lz, ch + ly, ct.z - FWZ * lz);
    if (K.rist > 0) { K.rist = Math.max(0, K.rist - dt * 2); kamera.position.x += (Math.random() - .5) * K.rist * 30; kamera.position.y += (Math.random() - .5) * K.rist * 30; }
  }
  return { kamera, K, oppdater };
}
