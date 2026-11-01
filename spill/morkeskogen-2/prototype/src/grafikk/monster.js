// Nattmonsteret fra 5.6.2 (lilla skikkelse med lysende øyne), med ny modell og animasjon.
// Logikken er forenklet for prototypen: kommer om natta, holder seg unna lyset fra bålet og hytta, jager helten,
// og forsvinner når det blir lyst eller når det blir slått (2 slag).
import * as THREE from 'three';
import { kantlys } from './materialer.js';
import { BAL_LYSRADIUS } from './bal.js';
import { VERDEN, bakkeH } from '../verden.js';

export function lagMonstre(scene, stil) {
  const prof = [[0, 0], [21, 0], [20, 6], [17.5, 14], [17, 24], [16, 34], [12.5, 44], [7, 51], [0, 54]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 28);
  const U = { uTid: { value: 0 } };
  function kroppMat() {
    const m = new THREE.MeshStandardMaterial({ color: stil === 1 ? 0x3a1f55 : 0x231530, roughness: stil === 1 ? .5 : .65, transparent: true, opacity: 0 });
    kantlys(m, stil === 1 ? 1.6 : 1.0, new THREE.Color(stil === 1 ? 0x9a60ff : 0x6a48a8));
    const før = m.onBeforeCompile;
    m.onBeforeCompile = sh => { før(sh); sh.uniforms.uTid = U.uTid; sh.vertexShader = 'uniform float uTid;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float a = atan(position.z, position.x); float hem = 1.0 - smoothstep(0.0, 12.0, position.y);
      transformed.y += sin(a * 7.0 + uTid * 5.0) * 2.4 * hem; transformed.xz *= 1.0 + sin(a * 5.0 - uTid * 3.0) * 0.06 * hem;`); };
    m.customProgramCacheKey = () => 'monster' + stil; return m;
  }
  const øyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.0, .6), transparent: true, opacity: 0 });
  const øyeGeo = new THREE.SphereGeometry(3.6, 12, 8);
  const liste = [];
  function nytt(x, z) {
    const g = new THREE.Group(), mat = kroppMat(), kropp = new THREE.Mesh(geo, mat); kropp.castShadow = true; kropp.layers.enable(1);
    const ø1 = new THREE.Mesh(øyeGeo, øyeMat), ø2 = ø1.clone(); ø1.position.set(-7, 38, 13.5); ø2.position.set(7, 38, 13.5); ø1.scale.set(1, 1.2, .6); ø2.scale.copy(ø1.scale);
    g.add(kropp, ø1, ø2); scene.add(g);
    const m = { g, kropp, mat, øyne: [ø1, ø2], x, z, vx: 0, vz: 0, hp: 2, synlig: 0, borte: false, slag: 0, t: Math.random() * 10, blunk: 2 + Math.random() * 3 };
    liste.push(m); return m;
  }
  let fraTimer = 0;
  function oppdater(dt, t, mork, helt, onTreff) {
    U.uTid.value = t;
    fraTimer -= dt;
    if (mork > .65 && liste.filter(m => !m.borte).length < 4 && fraTimer <= 0) {     // nye monstre i mørket
      fraTimer = 2.5;
      const a = Math.random() * 6.283, d = 420 + Math.random() * 250; let x = helt.x + Math.cos(a) * d, z = helt.z + Math.sin(a) * d;
      const L = VERDEN.spillHalv; x = Math.max(-L, Math.min(L, x)); z = Math.max(-L, Math.min(L, z));
      if (Math.hypot(x, z) > BAL_LYSRADIUS + 60) nytt(x, z);
    }
    let maks = 0;
    for (let i = liste.length - 1; i >= 0; i--) {
      const m = liste[i]; m.t += dt;
      const mål = m.borte || mork < .35 ? 0 : 1;
      m.synlig += (mål - m.synlig) * Math.min(1, dt * (mål ? 1.2 : 2.5));
      if (m.borte && m.synlig < .02) { scene.remove(m.g); m.mat.dispose(); liste.splice(i, 1); continue; }
      if (!m.borte && mork < .35 && m.synlig < .05) m.borte = true;
      // Bevegelse: mot helten, men aldri inn i lyset
      const dx = helt.x - m.x, dz = helt.z - m.z, d = Math.hypot(dx, dz) || 1, fart = m.borte ? 0 : 75;
      let tx = dx / d * fart, tz = dz / d * fart;
      const db = Math.hypot(m.x, m.z), rLys = BAL_LYSRADIUS * (.6 + .4 * mork) + 20;
      if (db < rLys + 40) { const k = (rLys + 40 - db) / 40; tx += m.x / db * 160 * k; tz += m.z / db * 160 * k; }
      const H = VERDEN.hytte, dh = Math.hypot(m.x - H.x, m.z - H.z);
      if (dh < 170) { tx += (m.x - H.x) / dh * 140; tz += (m.z - H.z) / dh * 140; }
      m.vx += (tx - m.vx) * Math.min(1, dt * 2); m.vz += (tz - m.vz) * Math.min(1, dt * 2);
      if (m.slag > 0) { m.slag -= dt; }
      m.x += m.vx * dt; m.z += m.vz * dt;
      if (d < 38 && !m.borte && m.synlig > .6) { onTreff(m, dx / d, dz / d); m.vx = -dx / d * 260; m.vz = -dz / d * 260; }
      // Visning: svev, pust, len i fartsretningen, blunk
      const y = bakkeH(m.x, m.z) + 4 + Math.sin(m.t * 2.2) * 3;
      m.g.position.set(m.x, y, m.z);
      m.g.rotation.y = Math.atan2(dx, dz);
      const sp = Math.hypot(m.vx, m.vz);
      m.g.rotation.x = Math.min(.25, sp / 600);
      const pust = 1 + Math.sin(m.t * 3.1) * .04, rist = m.slag > 0 ? Math.sin(m.slag * 60) * .12 : 0;
      m.g.scale.set(pust + rist, 1 / pust - rist, pust + rist);
      m.blunk -= dt; const lukk = m.blunk < .12 ? .1 : 1; if (m.blunk < 0) m.blunk = 2 + Math.random() * 4;
      m.øyne.forEach(ø => (ø.scale.y = 1.2 * lukk));
      m.mat.opacity = Math.min(1, m.synlig * 1.15); m.mat.transparent = m.synlig < .98; m.mat.depthWrite = m.synlig > .5;
      maks = Math.max(maks, m.synlig);
    }
    øyeMat.opacity = Math.min(1, maks * 1.2);
  }
  function slå(x, z, retX, retZ, rekkevidde, bue) {   // returnerer true hvis et monster ble truffet
    for (const m of liste) {
      if (m.borte || m.synlig < .4) continue;
      const dx = m.x - x, dz = m.z - z, d = Math.hypot(dx, dz); if (d > rekkevidde + 18) continue;
      if (Math.acos(Math.max(-1, Math.min(1, (dx * retX + dz * retZ) / (d || 1)))) > bue) continue;
      m.hp--; m.slag = .3; m.vx = dx / d * 380; m.vz = dz / d * 380;
      if (m.hp <= 0) m.borte = true;
      return true;
    }
    return false;
  }
  return { oppdater, slå, liste, nytt };
}
