// Leirbålet: steinring, vedkubber, flammer, gnister, røyk og et flakkende lys som kaster skygger.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { lagSteinGeo } from './traer-geo.js';
import { lastTekstur } from './materialer.js';

export const BAL_LYSRADIUS = 260;   // monstre holder seg utenfor lyset (som i 5.6.2)

export function lagBal(scene, stil, kval, tex) {
  const G = new THREE.Group(); scene.add(G);
  // Steinring
  const st = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, g = lagSteinGeo(stil, i % 2).clone(); g.scale(.42, .5, .42); g.rotateY(a * 2.3); g.translate(Math.cos(a) * 30, 1, Math.sin(a) * 30); st.push(g); }
  const ring = new THREE.Mesh(mergeGeometries(st.map(g => { g.deleteAttribute('uv'); return g; })), new THREE.MeshStandardMaterial({ color: stil === 1 ? 0x9aa0aa : 0x86837c, roughness: .9, flatShading: stil === 1 }));
  ring.castShadow = ring.receiveShadow = true; ring.layers.enable(1); G.add(ring);
  // Vedkubber i kryss
  const ved = [];
  for (let i = 0; i < 5; i++) { const g = new THREE.CylinderGeometry(3.6, 4.2, 40, 8); g.rotateZ(Math.PI / 2 - .35); g.translate(8, 8, 0); g.rotateY(i / 5 * 6.283); ved.push(g); }
  const vedMat = stil === 1 ? new THREE.MeshStandardMaterial({ color: 0x7a5236, roughness: .9 }) : new THREE.MeshStandardMaterial({ map: lastTekstur('teksturer/oak_color_1k.jpg'), normalMap: lastTekstur('teksturer/oak_normal_1k.jpg', false), roughness: .95 });
  const vedM = new THREE.Mesh(mergeGeometries(ved), vedMat); vedM.castShadow = vedM.receiveShadow = true; vedM.layers.enable(1); G.add(vedM);
  // Glør i bunnen
  const glør = new THREE.Mesh(new THREE.CircleGeometry(18, 20).rotateX(-Math.PI / 2).translate(0, 2, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.5, 1.1, .25) }));
  G.add(glør);
  // Flammer: kryssede plan med en flamme-shader
  const FU = { uTid: { value: 0 }, uStil: { value: stil }, uMork: { value: 0 } };
  const flMat = new THREE.ShaderMaterial({
    uniforms: FU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTid, uStil, uMork; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main(){ vec2 p = vUv; float n = n2(vec2(p.x * 4.0, p.y * 3.0 - uTid * 3.2)) * 0.6 + n2(vec2(p.x * 9.0, p.y * 7.0 - uTid * 5.5)) * 0.4;
        float w = (1.0 - p.y) * 0.55 + 0.05; float form = smoothstep(w, w * 0.4, abs(p.x - 0.5 + (n - 0.5) * 0.25 * p.y)) * smoothstep(1.0, 0.25, p.y + n * 0.35);
        float k = form * smoothstep(0.0, 0.08, p.y);
        vec3 c = mix(vec3(1.0, 0.25, 0.04), vec3(1.0, 0.85, 0.35), smoothstep(0.2, 0.9, k)) * (uStil > 1.5 ? 1.6 : 2.0) * (0.7 + uMork * 0.6);
        gl_FragColor = vec4(c * k, k); }`,
  });
  for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(46, 70), flMat); p.position.y = 36; p.rotation.y = i / 3 * Math.PI; G.add(p); }
  // Gnister og røyk
  const NG = 40, gp = new Float32Array(NG * 3), gf = new Float32Array(NG);
  for (let i = 0; i < NG; i++) gf[i] = Math.random();
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('aF', new THREE.BufferAttribute(gf, 1));
  const gnist = new THREE.Points(gg, new THREE.ShaderMaterial({
    uniforms: FU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `attribute float aF; uniform float uTid; varying float vA; void main(){ float t = fract(uTid * 0.35 + aF); vec3 p = vec3(sin(aF * 40.0 + t * 6.0) * 14.0 * t, 15.0 + t * 160.0, cos(aF * 31.0 + t * 5.0) * 14.0 * t);
      vA = (1.0 - t) * step(0.3, fract(aF * 7.3)); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = 600.0 / -mv.z; }`,
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(3.0, 1.2, 0.3) * smoothstep(0.5, 0.0, d) * vA, 1.0); }',
  }));
  gnist.frustumCulled = false; G.add(gnist);
  const røyk = new THREE.Points(gg, new THREE.ShaderMaterial({
    uniforms: FU, transparent: true, depthWrite: false,
    vertexShader: `attribute float aF; uniform float uTid; varying float vA; void main(){ float t = fract(uTid * 0.08 + aF); vec3 p = vec3(sin(aF * 20.0) * 10.0 + t * 40.0, 60.0 + t * 260.0, cos(aF * 17.0) * 10.0 + t * 15.0);
      vA = sin(t * 3.14) * 0.22; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (40.0 + t * 140.0) * 300.0 / -mv.z; }`,
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.55, 0.55, 0.58), smoothstep(0.5, 0.1, d) * vA); }',
  }));
  røyk.frustumCulled = false; G.add(røyk);
  // Lys
  const lys = new THREE.PointLight(0xff9a4a, 1, 1100, 1.6); lys.position.set(0, 42, 0);
  lys.castShadow = kval.balSkygge; lys.shadow.mapSize.set(512, 512); lys.shadow.camera.near = 8; lys.shadow.camera.far = 420; lys.shadow.camera.layers.set(1);   // bare ting på lag 1 kaster bålskygge (helt, monstre, ved, steiner, hytte) lys.shadow.bias = -0.004; lys.shadow.normalBias = 1;
  G.add(lys);
  // Varm lysflekk på bakken (billig falsk refleks)
  const flekk = new THREE.Mesh(new THREE.CircleGeometry(BAL_LYSRADIUS, 32).rotateX(-Math.PI / 2).translate(0, 2.5, 0), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uS: { value: 0 } }, fog: false,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uS; varying vec2 vP; void main(){ float d = length(vP) / ${BAL_LYSRADIUS.toFixed(1)}; gl_FragColor = vec4(vec3(1.0, 0.45, 0.12) * pow(1.0 - d, 2.5) * uS, 1.0); }`,
  }));
  G.add(flekk);

  return {
    gruppe: G,
    oppdater(t, mork) {
      FU.uTid.value = t; FU.uMork.value = mork;
      const fl = 1 + Math.sin(t * 13) * .06 + Math.sin(t * 23.7) * .05 + Math.sin(t * 7.1) * .07;
      lys.intensity = (350 + 3200 * mork) * fl;     // fysiske lysenheter i three.js r155+ (avstandsdemping 1,6)
      lys.position.x = Math.sin(t * 9) * 2; lys.position.z = Math.cos(t * 11) * 2;
      flekk.material.uniforms.uS.value = (.02 + .4 * mork) * fl;
    },
  };
}
