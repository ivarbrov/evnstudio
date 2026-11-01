// Døgn, himmel, sol, måne, tåke og atmosfære. Tidene er de samme som i 5.6.2:
// daggry 8 s, dag 130 s, skumring 12 s, natt 45 s (ett døgn = 195 s).
import * as THREE from 'three';
import { FELLES } from './materialer.js';

export const DOGN = { daggry: 8, dag: 130, skumring: 12, natt: 45 };
export const DOGN_LENGDE = 195;
export const TIDER = { dag: 45, kveld: 143, natt: 172 };

const C = h => new THREE.Color(h);
// Paletter per stil: dag, gyllen (lav sol) og natt
const PAL = {
  1: {
    dag: { zen: C('#3f8be0'), hor: C('#bfe3f5'), sol: C('#fff1d6'), solI: 3.2, hSky: C('#cfe6ff'), hBak: C('#6c8a48'), hI: 1.35, eksp: 1.0 },
    gull: { zen: C('#4a5fa8'), hor: C('#ffb36b'), sol: C('#ffb070'), solI: 2.6, hSky: C('#ffd0b0'), hBak: C('#6a5a40'), hI: 1.15, eksp: 1.15 },
    natt: { zen: C('#0b1430'), hor: C('#24305a'), sol: C('#9fb4ff'), solI: .65, hSky: C('#3a4e8a'), hBak: C('#141a24'), hI: .6, eksp: 1.3 },
  },
  2: {
    dag: { zen: C('#4f82c0'), hor: C('#b8cfdf'), sol: C('#fff2dc'), solI: 3.8, hSky: C('#b4c8dc'), hBak: C('#4a5034'), hI: 1.0, eksp: 1.0 },
    gull: { zen: C('#3c4c78'), hor: C('#e8a070'), sol: C('#ff9a58'), solI: 2.8, hSky: C('#e8b898'), hBak: C('#4a3a2a'), hI: .95, eksp: 1.2 },
    natt: { zen: C('#08101f'), hor: C('#1c2640'), sol: C('#8ea4e0'), solI: .6, hSky: C('#2c3a5a'), hBak: C('#0c0f14'), hI: .5, eksp: 1.35 },
  },
};

const HIMMEL_V = `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const HIMMEL_F = `
uniform vec3 uZen, uHor, uSolDir, uSolF, uMaaneDir; uniform float uMork, uSkyStil, uTid;
varying vec3 vDir;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n2(p); p *= 2.03; a *= 0.5; } return s; }
void main(){
  vec3 d = normalize(vDir); float y = max(d.y, 0.0);
  vec3 c = mix(uHor, uZen, pow(y, 0.55));
  c = mix(c, uHor * 0.6, smoothstep(0.0, -0.25, d.y));
  float sd = max(dot(d, uSolDir), 0.0);
  c += uSolF * (pow(sd, 8.0) * 0.35 + pow(sd, 64.0) * 0.6) * (1.0 - uMork);
  c += uSolF * smoothstep(0.9993, 0.9997, sd) * 6.0 * (1.0 - uMork);
  // skyer
  vec2 sp = d.xz / max(d.y + 0.12, 0.05);
  float sk = uSkyStil > 0.5 ? smoothstep(0.52, 0.62, fbm(sp * 0.9 + uTid * 0.006)) : smoothstep(0.45, 0.8, fbm(sp * 1.6 + vec2(uTid * 0.01, 0.0)));
  sk *= smoothstep(0.02, 0.2, d.y);
  vec3 skyF = mix(vec3(1.0), uSolF, 0.35) * (1.0 - uMork * 0.85) + uHor * 0.25;
  c = mix(c, skyF, sk * (uSkyStil > 0.5 ? 0.85 : 0.55));
  // stjerner og måne
  vec2 st = floor(d.xz / max(d.y, 0.08) * 220.0); float sj = step(0.9975, h(st)) * smoothstep(0.05, 0.3, d.y) * (1.0 - sk);
  c += vec3(sj) * uMork * (0.6 + 0.4 * sin(uTid * 3.0 + h(st + 1.0) * 30.0));
  float md = dot(d, uMaaneDir);
  c += vec3(0.9, 0.93, 1.0) * smoothstep(0.9988, 0.9992, md) * 1.6 * uMork + vec3(0.25, 0.3, 0.5) * pow(max(md, 0.0), 40.0) * uMork * 0.5;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function lagLys(scene, renderer, stil, kval) {
  const pal = PAL[stil];
  const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 1); scene.add(hemi);
  const sol = new THREE.DirectionalLight(0xffffff, 3);
  sol.castShadow = true; sol.shadow.mapSize.set(kval.skygge, kval.skygge);
  const S = kval.skyggeBoks; Object.assign(sol.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 10, far: 4000 });
  sol.shadow.bias = -0.0006; sol.shadow.normalBias = 1.6; sol.shadow.radius = 2;
  scene.add(sol, sol.target);

  const U = { uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSolDir: { value: new THREE.Vector3() }, uSolF: { value: new THREE.Color() }, uMaaneDir: { value: new THREE.Vector3() }, uMork: { value: 0 }, uSkyStil: { value: stil === 1 ? 1 : 0 }, uTid: { value: 0 } };
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(9000, 32, 16), new THREE.ShaderMaterial({ uniforms: U, vertexShader: HIMMEL_V, fragmentShader: HIMMEL_F, side: THREE.BackSide, depthWrite: false, fog: false }));
  himmel.renderOrder = -1; himmel.frustumCulled = false; scene.add(himmel);
  scene.fog = new THREE.Fog(0xffffff, 600, 1300);

  // Atmosfære: støv i sollyset om dagen, ildfluer om natta
  const NA = kval.partikler, pa = new Float32Array(NA * 3), fa = new Float32Array(NA);
  for (let i = 0; i < NA; i++) { pa[i * 3] = Math.random() * 600 - 300; pa[i * 3 + 1] = Math.random() * 90 + 5; pa[i * 3 + 2] = Math.random() * 600 - 300; fa[i] = Math.random() * 100; }
  const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.BufferAttribute(pa, 3)); ag.setAttribute('aF', new THREE.BufferAttribute(fa, 1));
  const AU = { uHelt: { value: new THREE.Vector3() }, uMork: U.uMork, uTid: U.uTid, uPx: { value: renderer.getPixelRatio() } };
  const atm = new THREE.Points(ag, new THREE.ShaderMaterial({
    uniforms: AU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `attribute float aF; uniform vec3 uHelt; uniform float uTid, uMork, uPx; varying float vA; varying float vN;
      void main(){ vec3 p = position; p.xz = mod(p.xz - uHelt.xz + 300.0, 600.0) - 300.0 + uHelt.xz;
        p += vec3(sin(uTid * 0.3 + aF), sin(uTid * 0.5 + aF * 1.3) * 0.6, cos(uTid * 0.27 + aF)) * 18.0;
        p.y += uHelt.y; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        float blink = 0.5 + 0.5 * sin(uTid * 2.0 + aF * 7.0);
        vN = uMork; vA = mix(0.18, blink, uMork) * smoothstep(900.0, 200.0, -mv.z);
        gl_PointSize = mix(2.5, 6.0, uMork) * uPx * 300.0 / -mv.z; }`,
    fragmentShader: `varying float vA; varying float vN; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA;
      vec3 c = mix(vec3(1.0, 0.95, 0.8), vec3(0.75, 1.0, 0.35) * 3.0, vN); gl_FragColor = vec4(c * a, a); }`,
  }));
  atm.frustumCulled = false; scene.add(atm);

  const tmp = new THREE.Color(), solDir = new THREE.Vector3(), maaneDir = new THREE.Vector3(), lysDir = new THREE.Vector3();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let mork = 0;

  const blandT = (k, wD, wG, wN) => pal.dag[k] * wD + pal.gull[k] * wG + pal.natt[k] * wN;

  function oppdater(t, kamera, helt, kamE) {
    t = ((t % DOGN_LENGDE) + DOGN_LENGDE) % DOGN_LENGDE;
    const lys = DOGN.daggry + DOGN.dag + DOGN.skumring;                     // sola er oppe 0–150 s
    const su = Math.min(1, t / lys), sunEl = t < lys ? Math.sin(Math.PI * su) * 0.95 - 0.05 : -0.3;
    const sAz = -1.2 + su * 2.6;
    solDir.set(Math.cos(sAz) * Math.cos(Math.asin(Math.max(-1, sunEl))), sunEl, Math.sin(sAz) * Math.cos(Math.asin(Math.max(-1, sunEl)))).normalize();
    const mu = t >= lys ? (t - lys) / DOGN.natt : -1, mEl = mu >= 0 ? Math.sin(Math.PI * Math.min(1, mu)) * .7 + .1 : -0.2;
    maaneDir.set(-Math.cos(0.4 + mu * 2), mEl, -Math.sin(0.4 + mu * 2) * .6 - .4).normalize();
    // mørke: 0 om dagen, 1 om natta, myke overganger i skumring og daggry
    const m = t < DOGN.daggry ? 1 - t / DOGN.daggry : t < DOGN.daggry + DOGN.dag ? 0 : t < lys ? (t - DOGN.daggry - DOGN.dag) / DOGN.skumring : 1;
    mork = m * m * (3 - 2 * m);
    const wN = mork, wG = (1 - mork) * (1 - THREE.MathUtils.smoothstep(sunEl, 0.05, 0.35)), wD = 1 - wN - wG;
    U.uZen.value.copy(pal.dag.zen).multiplyScalar(wD).add(tmp.copy(pal.gull.zen).multiplyScalar(wG)).add(tmp.clone().copy(pal.natt.zen).multiplyScalar(wN));
    U.uHor.value.copy(pal.dag.hor).multiplyScalar(wD).add(tmp.copy(pal.gull.hor).multiplyScalar(wG)).add(tmp.clone().copy(pal.natt.hor).multiplyScalar(wN));
    const solF = new THREE.Color().copy(pal.dag.sol).multiplyScalar(wD).add(tmp.copy(pal.gull.sol).multiplyScalar(wG)).add(tmp.clone().copy(pal.natt.sol).multiplyScalar(wN));
    U.uSolF.value.copy(solF); U.uSolDir.value.copy(solDir); U.uMaaneDir.value.copy(maaneDir); U.uMork.value = mork;
    hemi.color.copy(pal.dag.hSky).multiplyScalar(wD).add(tmp.copy(pal.gull.hSky).multiplyScalar(wG)).add(tmp.clone().copy(pal.natt.hSky).multiplyScalar(wN));
    hemi.groundColor.copy(pal.dag.hBak).multiplyScalar(wD).add(tmp.copy(pal.gull.hBak).multiplyScalar(wG)).add(tmp.clone().copy(pal.natt.hBak).multiplyScalar(wN));
    hemi.intensity = blandT('hI', wD, wG, wN);
    renderer.toneMappingExposure = blandT('eksp', wD, wG, wN);
    // Hovedlyset følger sola om dagen og månen om natta (som i 5.6.2)
    const solOppe = sunEl > -0.02 && mork < 0.95;
    lysDir.copy(solOppe ? solDir : maaneDir);
    sol.color.copy(solF);
    sol.intensity = solOppe ? blandT('solI', wD, wG, 0) / Math.max(.01, wD + wG) * THREE.MathUtils.smoothstep(sunEl, -0.02, 0.06) * (1 - mork) : pal.natt.solI * THREE.MathUtils.smoothstep(mork, .7, 1);
    // Skyggekart: sentrert foran helten og festet til tekselrutenettet (som i 5.6.2) så kantene ikke flimrer
    const Sb = sol.shadow.camera.right, tx = 2 * Sb / sol.shadow.mapSize.x;
    a.set(0, 1, 0).cross(lysDir).normalize(); b.crossVectors(lysDir, a);
    const fw = kamera.getWorldDirection(c).setY(0).normalize();
    const C0 = new THREE.Vector3(helt.x + fw.x * 150 * kamE, helt.y, helt.z + fw.z * 150 * kamE);
    const pa1 = C0.dot(a), pb1 = C0.dot(b); C0.addScaledVector(a, Math.round(pa1 / tx) * tx - pa1).addScaledVector(b, Math.round(pb1 / tx) * tx - pb1);
    sol.target.position.copy(C0); sol.position.copy(C0).addScaledVector(lysDir, 1800);
    // Tåke som i 5.6.2 (kortere sikt om natta, litt lenger med kameraet bak helten)
    scene.fog.color.copy(U.uHor.value).lerp(U.uZen.value, .15);
    scene.fog.near = (600 - 330 * mork) + 80 * kamE; scene.fog.far = (1300 - 450 * mork) + 420 * kamE;
    himmel.position.copy(kamera.position);
    // Felles: lysretning i kamerarommet for gjennomlys og kantlys
    FELLES.uSolV.value.copy(lysDir).transformDirection(kamera.matrixWorldInverse);
    FELLES.uSolFarge.value.copy(sol.color).multiplyScalar(sol.intensity / 3);
    AU.uHelt.value.set(helt.x, helt.y, helt.z); AU.uPx.value = renderer.getPixelRatio();
    return { mork, solEl: sunEl };
  }
  return { oppdater, sol, hemi, U, mork: () => mork, settTid: x => (U.uTid.value = x) };
}
