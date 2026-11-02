// Gress som følger helten: ett tegnekall, plassert i shaderen fra et høydekart.
// Gresstustene ligger fast i verden (samme sted hver gang), boyer seg i vinden og unna helten.
// A = gresset i proto.3. B (gressforsøk 2.11.2026) = tre tusttyper med ulik høyde og stivhet, mykere vind,
// og et spor bak helten: gresset bøyes bort og retter seg gradvis opp igjen. Sporet er SPOR_N punkter
// (posisjon, alder, kraft) i en uniform-array – ingen ekstra tegnekall og ingen CPU-arbeid per gresstrå.
import * as THREE from 'three';
import { FELLES } from './materialer.js';
import { VERDEN } from '../verden.js';

function tustGeo(stil) {
  const bl = stil === 1 ? 3 : 4, seg = 3, pos = [], col = [], nor = [], at = [], idx = [];
  const bunn = stil === 1 ? [.035, .13, .02] : [.025, .055, .012], topp = stil === 1 ? [.2, .48, .07] : [.15, .25, .055];   // lineære farger
  for (let b = 0; b < bl; b++) {
    const a = b / bl * Math.PI * 2 + b * .7, r = b ? 3.2 : 0, cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    const H = (stil === 1 ? 10 : 13) * (.75 + ((b * 37) % 10) / 22), W = stil === 1 ? 3.0 : 1.5, lean = .25 + ((b * 13) % 7) / 20;
    const dx = Math.cos(a + 1.3), dz = Math.sin(a + 1.3), base = pos.length / 3;
    for (let s = 0; s <= seg; s++) {
      const t = s / seg, w = W * (1 - t * (stil === 1 ? .85 : .95)), ox = cx + Math.cos(a) * lean * H * t * t, oz = cz + Math.sin(a) * lean * H * t * t;
      pos.push(ox - dx * w, H * t, oz - dz * w, ox + dx * w, H * t, oz + dz * w);
      const c = [bunn[0] + (topp[0] - bunn[0]) * t, bunn[1] + (topp[1] - bunn[1]) * t, bunn[2] + (topp[2] - bunn[2]) * t];
      col.push(...c, ...c); nor.push(Math.cos(a) * .3, 1, Math.sin(a) * .3, Math.cos(a) * .3, 1, Math.sin(a) * .3); at.push(t, t);
      if (s < seg) { const k = base + s * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('aT', new THREE.Float32BufferAttribute(at, 1)); g.setIndex(idx);
  return g;
}

export const SPOR_N = 12;
export function lagGress(scene, hoydekart, stil, kval, modus = 'A') {
  const N = kval.gress, R = kval.gressRadius, G = Math.ceil(Math.sqrt(N)), c = 2 * R / G;
  const geo = tustGeo(stil), off = new Float32Array(G * G * 2);
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { off[(i * G + j) * 2] = i * c; off[(i * G + j) * 2 + 1] = j * c; }
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 2)); geo.instanceCount = G * G;
  const U = { uHelt: { value: new THREE.Vector3() }, uR: { value: R }, uC: { value: c }, uHK: { value: hoydekart }, uHalv: { value: VERDEN.halv }, uTett: { value: stil === 1 ? .8 : 1 },
    uSpor: { value: Array.from({ length: SPOR_N }, () => new THREE.Vector4(1e6, 1e6, 99, 0)) }, uRetur: { value: 1.6 }, uSporR: { value: 260 } };
  const lagMat = modus => {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85, side: THREE.DoubleSide });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, FELLES, U);
    sh.vertexShader = (modus === 'B' ? '#define GRESS_B\n' : '') + `attribute vec2 aOff; attribute float aT; uniform vec3 uHelt; uniform float uR, uC, uHalv, uTett, uTid, uVind; uniform sampler2D uHK; varying float vFade;
      uniform vec4 uSpor[${SPOR_N}]; uniform float uRetur, uSporR;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec4 hk(vec2 w){ vec2 n = vec2(textureSize(uHK, 0)); vec2 f = (w + uHalv) / (2.0 * uHalv) * n - 0.5; vec2 i = floor(f); f -= i;
        ivec2 a = ivec2(clamp(i, vec2(0.0), n - 1.0)), b = ivec2(clamp(i + 1.0, vec2(0.0), n - 1.0));
        return mix(mix(texelFetch(uHK, a, 0), texelFetch(uHK, ivec2(b.x, a.y), 0), f.x), mix(texelFetch(uHK, ivec2(a.x, b.y), 0), texelFetch(uHK, b, 0), f.x), f.y); }
      ` + sh.vertexShader
      .replace('#include <begin_vertex>', `
        vec2 rep = aOff + 2.0 * uR * floor((uHelt.xz - aOff) / (2.0 * uR) + 0.5);
        vec2 jit = (vec2(h21(rep), h21(rep + 7.3)) - 0.5) * uC * 0.95;
        vec2 wp = rep + jit;
        vec4 H = hk(wp);
        float dist = length(wp - uHelt.xz);
        float tett = H.g * (1.0 - H.b * 0.55) * uTett;
        float sk = step(h21(rep + 3.1), tett) * (1.0 - smoothstep(uR * 0.35, uR * 0.98, dist)) * (0.7 + 0.6 * h21(rep + 1.7));
        vFade = sk;
        float rot = h21(rep + 9.9) * 6.283;
        vec3 transformed = vec3(position.x * cos(rot) - position.z * sin(rot), position.y, position.x * sin(rot) + position.z * cos(rot)) * sk;
        float fas = wp.x * 0.02 + wp.y * 0.015;
      #ifndef GRESS_B
        vec2 boy = vec2(sin(uTid * 1.6 + fas) * 0.6 + sin(uTid * 3.7 + fas * 2.1) * 0.25, cos(uTid * 1.3 + fas) * 0.4) * uVind * 4.0;
        vec2 bort = wp - uHelt.xz; float bd = length(bort); boy += bd < 30.0 ? bort / max(bd, 1.0) * (30.0 - bd) * 0.35 : vec2(0.0);
        transformed.xz += boy * aT * aT;
        transformed.y -= length(boy) * aT * aT * 0.25;
      #else
        // Tre tusttyper: kort og stiv, middels, høy og myk
        float ty = floor(h21(rep + 5.5) * 3.0);
        float hoyde = ty < 0.5 ? 0.7 : ty < 1.5 ? 1.0 : 1.45, myk = ty < 0.5 ? 0.6 : ty < 1.5 ? 1.0 : 1.5;
        transformed.y *= hoyde;
        // Vind: vindkast som rulles over enga (lav frekvens) + små skjelvinger, mer på høye og myke tuster
        float kast = 0.55 + 0.45 * sin(uTid * 0.45 + wp.x * 0.004 - wp.y * 0.003);
        vec2 boy = vec2(sin(uTid * 1.6 + fas + ty) * 0.6 + sin(uTid * 4.1 + fas * 2.3) * 0.18, cos(uTid * 1.25 + fas) * 0.35) * uVind * 3.2 * kast * myk;
        // Spor: bøy bort fra heltens siste posisjoner; eldre punkt = svakere (retter seg gradvis opp)
        vec2 kontakt = vec2(0.0);
        if (length(wp - uHelt.xz) < uSporR) for (int i = 0; i < ${SPOR_N}; i++) {   // tuster langt fra helten hopper over sporet
          vec4 sp = uSpor[i]; vec2 d = wp - sp.xy; float l = length(d), r = 20.0 + 14.0 * sp.w;
          float k = (1.0 - smoothstep(r * 0.35, r, l)) * exp(-sp.z * uRetur) * sp.w;
          kontakt += (l > 0.5 ? d / l : vec2(0.7, 0.0)) * k;
        }
        float kl = length(kontakt); if (kl > 1.0) kontakt /= kl;
        boy += kontakt * 13.0 * hoyde * (0.7 + 0.3 * myk);
        float bl = length(boy * aT * aT);
        transformed.xz += boy * aT * aT;
        transformed.y -= bl * bl / max(position.y * hoyde * 2.0, 4.0);                 // omtrent samme strålengde når det bøyes
      #endif
        transformed.xz += wp; transformed.y += H.r - 0.5;
        vColor.rgb *= mix(vec3(0.85, 0.95, 0.8), vec3(1.15, 1.05, 0.85), h21(floor(rep / 90.0)));`);
    sh.fragmentShader = 'varying float vFade;\n' + sh.fragmentShader;
  };
  mat.customProgramCacheKey = () => 'gress' + stil + modus;
  return mat; };
  const mats = { A: lagMat('A'), B: lagMat('B') };   // A/B-test: samme geometri, to shadere
  const m = new THREE.Mesh(geo, mats[modus]); m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false;
  scene.add(m);
  // Sporet: et nytt punkt hvert 0,1 s (eller når helten har flyttet seg 12 enheter). Det nyeste punktet følger helten.
  // Kraften øker med farten; står helten stille, bøyer bare gresset rett under den seg (kraft 0,5).
  let sistPunkt = 0, nyeste = 0;
  const api = {
    modus,
    settModus(x) { api.modus = modus = x; m.material = mats[x]; for (const v of U.uSpor.value) v.set(1e6, 1e6, 99, 0); },
    oppdater(helt, dt = 1 / 60) {
      U.uHelt.value.set(helt.x, 0, helt.z);
      if (modus !== 'B') return;
      const S = U.uSpor.value; for (const v of S) v.z += dt;
      const kraft = 0.5 + 0.5 * Math.min(1, (helt.spd || 0) / 170), n = S[nyeste];
      sistPunkt += dt;
      if (sistPunkt > 0.1 || Math.hypot(n.x - helt.x, n.y - helt.z) > 12) { sistPunkt = 0; nyeste = (nyeste + 1) % S.length; }
      S[nyeste].set(helt.x, helt.z, 0, helt.iLufta ? 0 : kraft);
    },
    tri: () => (geo.index.count / 3) * geo.instanceCount,
  };
  return api;
}
