// Terreng i biter (videreført fra trinn 1 d: bakken er delt opp så bare synlige biter tegnes),
// med teksturblanding per underlag: gress, skogbunn, sti og stein.
import * as THREE from 'three';
import { VERDEN, bakkeH, skogTetthet, stiAvstand, sstep } from '../verden.js';

const BIT = 600, SEG = 40, SKALA = 1 / 230;

export function lagBakke(scene, tex, stil) {
  const mat = new THREE.MeshStandardMaterial({ map: tex.gress.farge, normalMap: tex.gress.normal, roughness: 0.95, metalness: 0 });
  mat.normalScale.set(stil === 1 ? 0.35 : 1.0, stil === 1 ? 0.35 : 1.0);
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, {
      tF: { value: tex.skogbunn.farge }, tS: { value: tex.sti.farge }, tR: { value: tex.stein.farge },
      nF: { value: tex.skogbunn.normal }, nS: { value: tex.sti.normal }, nR: { value: tex.stein.normal },
    });
    sh.vertexShader = 'attribute vec4 aW;\nvarying vec4 vW;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvW = aW;');
    sh.fragmentShader = 'uniform sampler2D tF, tS, tR, nF, nS, nR;\nvarying vec4 vW;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', `
        vec2 uvB = vMapUv;
        vec2 uv2 = uvB * 0.37 + vec2(0.31, 0.17);   // to skalaer mot synlig gjentakelse
        vec4 cG = mix(texture2D(map, uvB), texture2D(map, uv2), 0.35);
        vec4 cF = mix(texture2D(tF, uvB), texture2D(tF, uv2), 0.35);
        vec4 cS = texture2D(tS, uvB), cR = texture2D(tR, uvB * 0.6);
        vec4 w = vW / max(0.001, vW.x + vW.y + vW.z + vW.w);
        diffuseColor *= cG * w.x + cF * w.y + cS * w.z + cR * w.w;`)
      .replace('vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;', `
        vec4 ww = vW / max(0.001, vW.x + vW.y + vW.z + vW.w);
        vec3 mapN = (texture2D(normalMap, vNormalMapUv).xyz * ww.x + texture2D(nF, vNormalMapUv).xyz * ww.y + texture2D(nS, vNormalMapUv).xyz * ww.z + texture2D(nR, vNormalMapUv * 0.6).xyz * ww.w) * 2.0 - 1.0;`);
  };
  const H = VERDEN.halv, n = Math.ceil(2 * H / BIT), biter = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x0 = -H + i * BIT, z0 = -H + j * BIT, geo = new THREE.PlaneGeometry(BIT, BIT, SEG, SEG);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv, w = new Float32Array(pos.count * 4);
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k) + x0 + BIT / 2, z = pos.getZ(k) + z0 + BIT / 2;
      pos.setXYZ(k, x, bakkeH(x, z), z); uv.setXY(k, x * SKALA, z * SKALA);
      const e = 6, sl = Math.hypot(bakkeH(x + e, z) - bakkeH(x - e, z), bakkeH(x, z + e) - bakkeH(x, z - e)) / (2 * e);
      const sti = Math.max(1 - sstep(22, 48, stiAvstand(x, z)), 1 - sstep(70, 120, Math.hypot(x, z)));
      const stein = sstep(0.28, 0.5, sl), skog = skogTetthet(x, z) * (1 - sti);
      w[k * 4] = Math.max(0, 1 - skog * 1.1 - sti - stein); w[k * 4 + 1] = skog; w[k * 4 + 2] = sti; w[k * 4 + 3] = stein;
    }
    geo.setAttribute('aW', new THREE.BufferAttribute(w, 4));
    geo.computeVertexNormals(); geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = false;
    scene.add(m); biter.push(m);
  }
  return { mat, biter };
}

// Høydekart for gress og andre ting som plasseres i shaderen: r = høyde, g = gressmaske, b = skogtetthet
export function lagHoydekart(N = 256) {
  const H = VERDEN.halv, d = new Float32Array(N * N * 4);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = -H + (i + .5) / N * 2 * H, z = -H + (j + .5) / N * 2 * H, k = (j * N + i) * 4;
    const Hy = VERDEN.hytte;
    d[k] = bakkeH(x, z);
    d[k + 1] = sstep(26, 50, stiAvstand(x, z)) * sstep(95, 140, Math.hypot(x, z)) * sstep(75, 105, Math.hypot(x - Hy.x, z - Hy.z));
    d[k + 2] = skogTetthet(x, z); d[k + 3] = 1;
  }
  const t = new THREE.DataTexture(d, N, N, THREE.RGBAFormat, THREE.FloatType);
  t.magFilter = t.minFilter = THREE.NearestFilter;        // Float + Linear krever en utvidelse mobilen ikke alltid har; vi filtrerer i shaderen
  t.needsUpdate = true;
  return t;
}
