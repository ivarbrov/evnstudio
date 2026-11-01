// Helten: bevegelse og hopp med de samme tallene som i 5.6.2, og en animert GLB-figur (midlertidig CC0-robot).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { bakkeH, skyvUt, VERDEN } from './verden.js';
import { kantlys } from './grafikk/materialer.js';

export const PLAYER_SPEED = 170, JUMP_V = 420, GRAVITY = 1500, COYOTE = 0.1, JUMP_BUFFER = 0.12;   // fra 5.6.2
export const OKS = { cd: 0.5, impact: 0.22, reach: 95, dmg: 1 };                                      // WEAPONS.oks i 5.6.2
const HOYDE = 92;

export function lagHeltLogikk() {
  return { x: VERDEN.start.x, z: VERDEN.start.z, y: 0, h: 0, vx: 0, vz: 0, vy: 0, iLufta: false, coyote: 0, hoppBuf: 0, hoppForrige: false, spd: 0, retning: Math.PI, slagT: 0, slagCd: 0, slagTruffet: false, dytt: 0 };
}

export function oppdaterHelt(p, inp, dt, verden, kamYaw) {
  let dx = inp.dx, dy = inp.dy, mAmt = inp.mengde;
  if (dx || dy) { const c = Math.cos(kamYaw), s = Math.sin(kamYaw); [dx, dy] = [dx * c + dy * s, -dx * s + dy * c]; }   // «opp» = bort fra kameraet
  const påBakken = !p.iLufta;
  let topp = PLAYER_SPEED;
  if (påBakken && (p.vx || p.vz)) {
    const sp0 = Math.hypot(p.vx, p.vz), ux = p.vx / sp0, uz = p.vz / sp0;
    const stig = (bakkeH(p.x + ux * 12, p.z + uz * 12) - bakkeH(p.x, p.z)) / 12;
    topp *= Math.max(0.6, Math.min(1.1, 1 - stig * 1.3));
  }
  let tvx = 0, tvz = 0;
  if (dx || dy) { const l = Math.hypot(dx, dy); tvx = dx / l * topp * mAmt; tvz = dy / l * topp * mAmt; }
  const acc = Math.min(1, dt * (!påBakken ? 10 : (dx || dy) ? 16 : 18));
  p.vx += (tvx - p.vx) * acc; p.vz += (tvz - p.vz) * acc;
  if (p.dytt > 0) p.dytt -= dt;
  p.x += p.vx * dt; p.z += p.vz * dt;
  skyvUt(p, verden);
  p.spd = Math.hypot(p.vx, p.vz);
  if (p.spd > 12) p.retning = Math.atan2(p.vx, p.vz);
  // Hopp som i 5.6.2: buffer og «coyote time»
  const gH = bakkeH(p.x, p.z);
  if (inp.hopp && !p.hoppForrige) p.hoppBuf = JUMP_BUFFER;
  p.hoppForrige = inp.hopp; p.hoppBuf -= dt;
  if (!p.iLufta) p.coyote = COYOTE; else p.coyote -= dt;
  if (p.hoppBuf > 0 && p.coyote > 0) { p.vy = JUMP_V; p.iLufta = true; p.coyote = 0; p.hoppBuf = 0; p.h = Math.max(p.h, gH); }
  if (p.iLufta) { p.vy -= GRAVITY * dt; p.h += p.vy * dt; if (p.h <= gH) { p.h = gH; p.vy = 0; p.iLufta = false; } }
  else { if (gH < p.h - 18) { p.iLufta = true; p.vy = 0; } else p.h = gH; }
  p.y = p.h;
  // Slag med øks: start, treff ved «impact», nedkjøling
  p.slagCd -= dt;
  if (inp.slag && p.slagCd <= 0) { p.slagCd = OKS.cd; p.slagT = 0.0001; p.slagTruffet = false; }
  if (p.slagT > 0) p.slagT += dt;
  if (p.slagT > 0.6) p.slagT = 0;
}

export async function lagHeltFigur(scene, stil) {
  const gltf = await new GLTFLoader().loadAsync('modeller/helt-robot.glb');
  const rot = new THREE.Group(), modell = gltf.scene;
  const box = new THREE.Box3().setFromObject(modell), k = HOYDE / (box.max.y - box.min.y);
  modell.scale.setScalar(k); modell.position.y = -box.min.y * k; rot.add(modell); scene.add(rot);
  const fargePar = stil === 1 ? { Main: 0xf2c84b, Grey: 0x8a93a3, Black: 0x2a2c34 } : { Main: 0xc9a05a, Grey: 0x6d6a66, Black: 0x24262b };
  modell.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true; o.receiveShadow = true; o.layers.enable(1);
      const m = o.material; m.roughness = stil === 1 ? .5 : .7; m.metalness = stil === 1 ? .1 : .25;
      if (fargePar[m.name]) m.color.setHex(fargePar[m.name]);
      kantlys(m, stil === 1 ? .9 : .45, new THREE.Color(stil === 1 ? 0xfff0d0 : 0xd8e0ff));
    }
  });
  // Øks i høyre hånd (våpen festes til et navngitt ledd, slik alle våpen må gjøres i 2.0)
  let hånd = null; modell.traverse(o => { if (o.isBone && /hand/i.test(o.name) && /r$/i.test(o.name.replace(/[^a-z]/gi, ''))) hånd = o; });
  if (hånd) {
    const øks = new THREE.Group();
    const skaft = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 34, 8), new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: .8 }));
    const blad = new THREE.Mesh(new THREE.BoxGeometry(2, 9, 12), new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: .35, metalness: .8 }));
    blad.position.set(0, 13, 5); skaft.castShadow = blad.castShadow = true; øks.add(skaft, blad);
    modell.updateMatrixWorld(true); const ws = new THREE.Vector3(); hånd.getWorldScale(ws);
    øks.scale.setScalar(1 / ws.x); øks.rotation.set(Math.PI / 2, 0, 0); øks.position.set(0, 0, 0);
    hånd.add(øks);
  }
  const mix = new THREE.AnimationMixer(modell), klipp = {};
  for (const a of gltf.animations) klipp[a.name] = mix.clipAction(a);
  const slag = klipp.Punch; slag.setLoop(THREE.LoopOnce, 1); slag.clampWhenFinished = true;
  const hopp = klipp.Jump; hopp.setLoop(THREE.LoopOnce, 1); hopp.clampWhenFinished = true;
  let aktiv = klipp.Idle; aktiv.play();
  function bytt(ny, tid = .2) { if (ny === aktiv) return; ny.reset().setEffectiveWeight(1).fadeIn(tid).play(); aktiv.fadeOut(tid); aktiv = ny; }
  let vis = Math.PI;
  return {
    rot,
    oppdater(p, dt) {
      rot.position.set(p.x, p.y, p.z);
      let d = p.retning - vis; d = Math.atan2(Math.sin(d), Math.cos(d)); vis += d * Math.min(1, dt * 12); rot.rotation.y = vis;
      if (p.slagT > 0 && p.slagT < .05) { slag.reset(); slag.timeScale = 1.6; bytt(slag, .08); }
      else if (p.slagT > 0) { /* slaget spilles ferdig */ }
      else if (p.iLufta) bytt(hopp, .1);
      else if (p.spd > 115) { bytt(klipp.Running); klipp.Running.timeScale = p.spd / 170 * 1.0; }
      else if (p.spd > 12) { bytt(klipp.Walking); klipp.Walking.timeScale = Math.max(.6, p.spd / 95); }
      else bytt(klipp.Idle, .3);
      mix.update(dt);
    },
  };
}
