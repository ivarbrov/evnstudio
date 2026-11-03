// Tilbehør til EVN-roboten i Era Defenders: hatt/hjelm og kappe/utstyr per tidsepoke (Evens alternativ C som utgangspunkt).
// Enkle former festet til hode- og overkroppsleddet, så de følger animasjonen. Grunnmodellen og fargen endres ikke.
// Kall lagTilbehor når roboten står i hvilestilling (Idle, tid 0).
export const EPOKER = ['stein', 'oldtid', 'ridder', 'pirat', 'fabrikk', 'rom', 'tid'];   // samme rekkefølge som verdenene i Era

export function lagTilbehor(THREE, scene, modell, epoke, hva = 'begge') {
  let hodeBein, kroppBein, hodeMesh;
  modell.traverse(o => { if (o.isBone && o.name === 'Head') hodeBein = o; if (o.isBone && o.name === 'Torso_1') kroppBein = o; if (o.isMesh && o.name === 'Head_3') hodeMesh = o; });
  modell.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(modell), H = box.max.y - box.min.y;
  const hb = new THREE.Box3().setFromObject(hodeMesh), hMidt = hb.getCenter(new THREE.Vector3());
  const w = hb.max.x - hb.min.x, T = hb.max.y, cx = hMidt.x, cz = hMidt.z, by = box.min.y;
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .8, ...o });
  const M = (g, m, p = [0, 0, 0], rr = [0, 0, 0], s = [1, 1, 1]) => { const x = new THREE.Mesh(g, m); x.position.set(...p); x.rotation.set(...rr); x.scale.set(...s); return x; };
  const fest = (bein, obj) => { scene.add(obj); obj.updateMatrixWorld(true); bein.attach(obj); return obj; };

  const HATT = {
    stein: () => { const g = new THREE.Group();
      g.add(M(new THREE.SphereGeometry(w * .42, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x6d4c41), [cx, T - w * .06, cz], [0, 0, 0], [1, .55, 1]));
      const b = mat(0xf3eadb); g.add(M(new THREE.CylinderGeometry(w * .045, w * .045, w * .62, 6), b, [cx, T + w * .16, cz + w * .05], [0, 0, Math.PI / 2]));
      for (const s of [-1, 1]) g.add(M(new THREE.SphereGeometry(w * .07, 6, 4), b, [cx + s * w * .32, T + w * .16, cz + w * .05]));
      return g; },
    oldtid: () => { const g = new THREE.Group();
      g.add(M(new THREE.CylinderGeometry(w * .5, w * .52, w * .1, 12), mat(0xd4a04a, { metalness: .5, roughness: .4 }), [cx, T - w * .1, cz]));
      g.add(M(new THREE.BoxGeometry(w * .1, w * .3, w * .8), mat(0xc62828), [cx, T + w * .08, cz])); return g; },
    ridder: () => { const g = new THREE.Group();
      g.add(M(new THREE.CylinderGeometry(w * .5, w * .52, w * .1, 12), mat(0xb0bec5, { metalness: .6, roughness: .35 }), [cx, T - w * .1, cz]));
      g.add(M(new THREE.ConeGeometry(w * .1, w * .5, 6), mat(0xb3261e), [cx + w * .12, T + w * .14, cz - w * .1], [-.5, 0, -.25])); return g; },
    pirat: () => { const g = new THREE.Group(), s = mat(0x1d1d24);
      g.add(M(new THREE.CylinderGeometry(w * .62, w * .62, w * .05, 3), s, [cx, T - w * .03, cz], [0, Math.PI / 6, 0]));
      g.add(M(new THREE.CylinderGeometry(w * .28, w * .36, w * .28, 10), s, [cx, T + w * .1, cz]));
      g.add(M(new THREE.SphereGeometry(w * .07, 6, 4), mat(0xffffff), [cx, T + w * .12, cz + w * .33])); return g; },
    fabrikk: () => { const g = new THREE.Group(), o = mat(0xff6d00);
      g.add(M(new THREE.SphereGeometry(w * .4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), o, [cx, T - w * .05, cz], [0, 0, 0], [1, .6, 1]));
      g.add(M(new THREE.CylinderGeometry(w * .5, w * .5, w * .04, 14), o, [cx, T - w * .05, cz + w * .05])); return g; },
    rom: () => { const g = new THREE.Group();
      g.add(M(new THREE.SphereGeometry(w * .72, 18, 12), mat(0x9fd8ff, { transparent: true, opacity: .28, roughness: .1, metalness: .2, flatShading: false, depthWrite: false }), [cx, hMidt.y + w * .04, cz]));
      g.add(M(new THREE.CylinderGeometry(w * .73, w * .73, w * .08, 18), mat(0xeceff1), [cx, hb.min.y - w * .02, cz])); return g; },
    tid: () => { const g = new THREE.Group(), l = mat(0x5e35b1);
      g.add(M(new THREE.CylinderGeometry(w * .55, w * .55, w * .04, 14), l, [cx, T - w * .04, cz]));
      g.add(M(new THREE.ConeGeometry(w * .32, w * .75, 10), l, [cx, T + w * .33, cz], [-.15, 0, .12]));
      for (const [a, b] of [[.15, .2], [-.1, .45], [.05, .65]]) g.add(M(new THREE.OctahedronGeometry(w * .05), mat(0xffd54a, { emissive: 0x6b5200 }), [cx + a * w, T + b * w, cz + w * .22 - b * w * .18]));
      return g; },
  };
  // Kappe eller utstyr bak overkroppen (modellen ser mot +z, ryggen er mot −z)
  const kappe = (farge, prikker) => () => { const g = new THREE.Group(), m = mat(farge, { side: THREE.DoubleSide });
    g.add(M(new THREE.CylinderGeometry(H * .2, H * .3, H * .4, 10, 1, true, Math.PI * .6, Math.PI * .8), m, [0, by + H * .27, -H * .015]));
    if (prikker) for (const [x, y] of [[-.1, .3], [.08, .22], [-.02, .15], [.12, .36]]) g.add(M(new THREE.OctahedronGeometry(H * .018), mat(prikker, { emissive: 0x6b5200 }), [x * H, by + y * H, -H * .27 - .02]));
    return g; };
  const RYGG = {
    stein: kappe(0x6d4c41), oldtid: kappe(0xc62828), ridder: kappe(0xb3261e), pirat: kappe(0x263238),
    fabrikk: () => { const g = new THREE.Group();   // verktøybelte
      g.add(M(new THREE.TorusGeometry(H * .1, H * .022, 5, 14), mat(0x5d4037), [0, by + H * .33, 0], [Math.PI / 2, 0, 0], [1.05, 1, .8]));
      g.add(M(new THREE.BoxGeometry(H * .05, H * .07, H * .03), mat(0x9e9e9e), [H * .09, by + H * .3, H * .06])); return g; },
    rom: () => { const g = new THREE.Group();       // oksygentank
      g.add(M(new THREE.BoxGeometry(H * .2, H * .2, H * .09), mat(0xb0bec5), [0, by + H * .45, -H * .15]));
      g.add(M(new THREE.SphereGeometry(H * .02, 6, 4), mat(0x76ff03, { emissive: 0x2e7d00 }), [0, by + H * .52, -H * .2])); return g; },
    tid: kappe(0x4527a0, 0xffd54a),
  };
  const lagt = [];
  if (hva === 'hatt' || hva === 'begge') lagt.push(fest(hodeBein, HATT[epoke]()));
  if (hva === 'kappe' || hva === 'begge') lagt.push(fest(kroppBein, RYGG[epoke]()));
  for (const o of lagt) o.traverse(x => { if (x.isMesh) x.renderOrder = 1; });
  return lagt;
}
