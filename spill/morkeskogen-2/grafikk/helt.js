// Mørkeskogen 2.0 – robot-helten (fase 1).
// Modell: RobotExpressive (CC0, se spill/LISENSER.md). Modellen er uendret. Hovedfargen er gul (Evens valg 2.11.2026).
// Den gamle figuren (P) beholdes usynlig som «rigg»: draw() styrer den som før, og vi leser bevegelsen derfra.
// Roboten får fem klipp: Idle, Walking, Running, Jump og Punch (slag). Våpnene flyttes til robotens høyre hånd.
// Våpenstillinger (bue, stang, lasso) kommer i fase 3.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Hovedfargen (materialet «Main»), sRGB. Even valgte gul 2.11.2026; tre varianter til endelig valg.
export const FARGER = { A: 0xffe135, B: 0xffcc00, C: 0xf6d35b, gammel: 0xf2c84b };
export const GUL = FARGER.B;                 // Evens valg 2.11.2026 kl. 11:05: B «klassisk robotgul»
// Evens valg 2.11.2026 kl. 20:31: roboten skal være 90 % av størrelsen i 2.0-prototypen (målt robothøyde 80 → ca. 72).
export const STORRELSE = 0.9;
export const HOYDE = 86;                 // målt: toppen havner på ca. 80, som toppen av hodet til helten i 5.6.2 (modellboksen er litt høyere enn figuren)

function lesGLB(sti = 'modeller/helt-robot.glb') {
  const laster = new GLTFLoader();
  if (window.EVN_HELT_B64) {             // artefakt-kopien: modellen ligger innebygd (ingen nettverkskall)
    const bin = atob(window.EVN_HELT_B64), buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return laster.parseAsync(buf.buffer, '');
  }
  return laster.loadAsync(sti);
}

// Lager roboten og kobler den til den gamle figuren P. Returnerer et løfte; draw() bruker roboten når den er klar.
export function lagRobot(P) {
  return lesGLB().then(gltf => {
    const modell = gltf.scene, rot = new THREE.Group();
    modell.traverse(o => { o.userData.evn2 = true; if (o.material) o.material.userData.evn2 = true; });   // ny grafikk: ikke fargekonverter
    const box = new THREE.Box3().setFromObject(modell), k = HOYDE * STORRELSE / (box.max.y - box.min.y);
    modell.scale.setScalar(k); modell.position.y = -box.min.y * k; rot.add(modell);   // føttene på bakken: modellens laveste punkt på y = 0
    modell.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
    // Even (2.11.2026): «jeg vil at karakteren skal være gul». Hovedfargen (Main) er gul; grått og svart er som før.
    settFarge(modell, GUL);
    // Grepet: håndflatebeinet Palm2.R (GLTFLoader fjerner punktum i navn: «Palm2R»). «Hand.R» i fila er et mesh, ikke et ledd.
    let hånd = null; modell.traverse(o => { if (o.isBone && o.name.replace(/[^a-z0-9]/gi, '') === 'Palm2R') hånd = o; });
    if (!hånd) console.warn('Mørkeskogen 2.0: fant ikke robotens høyre hånd (Palm2.R); våpnene blir ikke vist');
    const mix = new THREE.AnimationMixer(modell), klipp = {};
    for (const a of gltf.animations) klipp[a.name] = mix.clipAction(a);
    for (const n of ['Punch', 'Jump']) { klipp[n].setLoop(THREE.LoopOnce, 1); klipp[n].clampWhenFinished = true; }
    const R = { rot, modell, hånd, mix, klipp, aktiv: klipp.Idle, fart: 1 / .3, sistSving: 0, vis: 0 };
    for (const a of Object.values(klipp)) { a.enabled = true; a.setEffectiveWeight(0); }
    R.aktiv.setEffectiveWeight(1).play();
    P.grp.add(rot);
    flyttVåpen(P, R);                                      // først: våpnene skal ikke skjules sammen med den gamle figuren
    skjulGammelFigur(P, R);
    P.robot = R;
    return R;
  });
}

// Setter hovedfargen. sRGB-hex -> lineær (THREE.ColorManagement er av i overgangen, så omregningen gjøres her).
// Materialet deles av alle delene av roboten, så dette er én endring, ikke én per del eller per bilde.
export function settFarge(modell, hex) {
  const sett = new Set(); modell.traverse(o => { if (o.isMesh && o.material && o.material.name === 'Main') sett.add(o.material); });
  for (const m of sett) m.color.setHex(hex).convertSRGBToLinear();
  return sett.size;
}

// Testvisning: egen robot med egen farge (lastes for seg, så hver robot har sine egne tre materialer)
export function lagRobotVisning(hex, sti) {
  return lesGLB(sti).then(gltf => {                         // egen lasting per robot: ingen deling med spillets robot
    const modell = gltf.scene, rot = new THREE.Group();
    modell.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    modell.traverse(o => { o.userData.evn2 = true; if (o.material) o.material.userData.evn2 = true; });
    const box = new THREE.Box3().setFromObject(modell), k = HOYDE / (box.max.y - box.min.y);
    modell.scale.setScalar(k); modell.position.y = -box.min.y * k; rot.add(modell);
    settFarge(modell, hex);
    const mix = new THREE.AnimationMixer(modell);
    for (const a of gltf.animations) if (a.name === 'Idle') mix.clipAction(a).play();
    return { rot, modell, mix, klipp: gltf.animations.map(a => a.name) };
  });
}

// Den gamle figuren skjules, men leddene beholdes (draw() regner fortsatt på dem, og logikken leser P.head)
function skjulGammelFigur(P, R) {
  for (const c of P.grp.children) if (c !== P.body && c !== R.rot) c.userData.evn2Skjult = true;
  P.body.traverse(o => { if (o !== P.body && (o.isMesh || o.isSprite || o.isPoints || o.isLine)) o.userData.evn2Skjult = true; });
}

// Våpnene (og øksa) ligger på den gamle høyre hånda. De flyttes til robotens hånd, med samme form og størrelse.
function flyttVåpen(P, R) {
  if (!R.hånd || !P.wpn) return;
  R.modell.updateMatrixWorld(true);
  const ws = new THREE.Vector3(); R.hånd.getWorldScale(ws);
  const feste = new THREE.Group(); feste.name = 'evn2-vapenfeste';
  feste.scale.setScalar(1 / ws.x);                       // hånda er skalert sammen med modellen
  // Gammel hånd: underarmen peker langs −y og skaftet langs +z (gjennom neven). Robothånda peker langs +y.
  // En halv vending om z gjør −y til +y og lar +z stå.
  feste.rotation.set(0, 0, Math.PI);
  R.hånd.add(feste); R.feste = feste;
  const hånd = P.arms[1].el;
  for (const o of [...hånd.children]) {                   // alle våpen i høyre hånd (bue og skjold i venstre hånd: fase 3)
    const pos = o.position; feste.add(o); o.position.set(pos.x, pos.y + 12.5, pos.z);   // de satt 12,5 under albuen = i hånda
  }
}

// Kalles i draw() etter at den gamle figuren har fått stillingen sin.
// p = g.p (logikk), dt = sekunder. Velger klipp ut fra fart, hopp og slag.
export function robotRamme(P, p, dt) {
  const R = P.robot; if (!R) return;
  // Den gamle figuren har en del helning og hopp i kroppen; roboten følger gruppa (posisjon og retning), ikke leddene
  for (const c of P.grp.children) if (c.userData.evn2Skjult) c.visible = false;
  P.body.traverse(o => { if (o.userData.evn2Skjult) o.visible = false; });
  const K = R.klipp, spd = p.spd || 0, iLufta = (p.z || 0) > 2, slår = (p.swing || 0) > 0;
  // Bytte av klipp: det nye klippet tones inn og alle andre tones ut, fra vekten de har akkurat nå.
  // (three.js sine fadeIn/fadeOut starter alltid fra 1 og 0; ved raske bytter, f.eks. står → går → løper,
  // ble summen av vektene opptil 1,7 og stillingen overdrevet. Målt av tester/robot-animasjon.js.)
  const bytt = (ny, tid = .2) => { if (ny !== R.aktiv) { if (!ny.isScheduled() || ny.getEffectiveWeight() < .01) ny.reset().setEffectiveWeight(0).play(); R.aktiv = ny; } R.fart = 1 / tid; };
  if (slår && R.sistSving <= 0) { K.Punch.reset(); K.Punch.timeScale = 1.6; bytt(K.Punch, .08); }
  else if (slår && R.aktiv === K.Punch) { /* slaget spilles ferdig */ }
  else if (iLufta) bytt(K.Jump, .1);
  else if (spd > 115) { bytt(K.Running); K.Running.timeScale = spd / 170; }
  else if (spd > 12) { bytt(K.Walking); K.Walking.timeScale = Math.max(.6, spd / 95); }
  else bytt(K.Idle, .3);
  R.sistSving = p.swing || 0;
  // Vektene går mot mål (aktivt klipp 1, resten 0) og normaliseres, så summen alltid er 1
  let sum = 0; const steg = Math.min(1, dt * R.fart);
  for (const a of Object.values(K)) {
    if (!a.isScheduled() && a !== R.aktiv) continue;              // isScheduled: også klipp som står stille på siste bilde (hopp, slag)
    const w0 = a.getEffectiveWeight(), w = a === R.aktiv ? w0 + (1 - w0) * steg : w0 * (1 - steg);
    if (a !== R.aktiv && w < .005) { a.stop(); continue; }
    a.setEffectiveWeight(w); sum += w;
  }
  if (sum > 0) for (const a of Object.values(K)) if (a.isScheduled()) a.setEffectiveWeight(a.getEffectiveWeight() / sum);
  R.mix.update(dt);
}

// Verdensposisjonen til robotens høyre hånd (fiskesnøre og lasso starter her)
export function håndPos(P, ut) {
  const R = P.robot; if (!R || !R.hånd) return null;
  return R.hånd.getWorldPosition(ut);
}
