// Gress som følger helten: ett tegnekall, plassert i shaderen fra et høydekart.
// Gresstustene ligger fast i verden (samme sted hver gang), boyer seg i vinden og unna helten.
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

export function lagGress(scene, hoydekart, stil, kval) {
  const N = kval.gress, R = kval.gressRadius, G = Math.ceil(Math.sqrt(N)), c = 2 * R / G;
  const geo = tustGeo(stil), off = new Float32Array(G * G * 2);
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { off[(i * G + j) * 2] = i * c; off[(i * G + j) * 2 + 1] = j * c; }
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 2)); geo.instanceCount = G * G;
  const U = { uHelt: { value: new THREE.Vector3() }, uR: { value: R }, uC: { value: c }, uHK: { value: hoydekart }, uHalv: { value: VERDEN.halv }, uTett: { value: stil === 1 ? .8 : 1 } };
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85, side: THREE.DoubleSide });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, FELLES, U);
    sh.vertexShader = `attribute vec2 aOff; attribute float aT; uniform vec3 uHelt; uniform float uR, uC, uHalv, uTett, uTid, uVind; uniform sampler2D uHK; varying float vFade;
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
        vec2 boy = vec2(sin(uTid * 1.6 + fas) * 0.6 + sin(uTid * 3.7 + fas * 2.1) * 0.25, cos(uTid * 1.3 + fas) * 0.4) * uVind * 4.0;
        vec2 bort = wp - uHelt.xz; float bd = length(bort); boy += bd < 30.0 ? bort / max(bd, 1.0) * (30.0 - bd) * 0.35 : vec2(0.0);
        transformed.xz += boy * aT * aT;
        transformed.y -= length(boy) * aT * aT * 0.25;
        transformed.xz += wp; transformed.y += H.r - 0.5;
        vColor.rgb *= mix(vec3(0.85, 0.95, 0.8), vec3(1.15, 1.05, 0.85), h21(floor(rep / 90.0)));`);
    sh.fragmentShader = 'varying float vFade;\n' + sh.fragmentShader;
  };
  mat.customProgramCacheKey = () => 'gress' + stil;
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false;
  scene.add(m);
  return { oppdater(helt) { U.uHelt.value.set(helt.x, 0, helt.z); }, tri: () => (geo.index.count / 3) * geo.instanceCount };
}
