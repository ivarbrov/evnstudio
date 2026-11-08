/* Matdyr-regn – testfigurer for ekte mathybrider (fase 2, trinn 2). Prototype, ikke spillkode.
 * Hver figur er én skapning der maten er en del av kroppen: Donutku, Burgersau, Pizzaskilpadde, Bananrev og Iskatt.
 * Alle figurer er laget i kode med three.js r128. Fronten peker mot +z, og føttene står på y = 0.
 */
(function () {
  'use strict';
  const T = THREE, V2 = (x, y) => new T.Vector2(x, y);
  const LC = c => new T.Color(c).convertSRGBToLinear();
  const matCache = new Map();
  // Felles materialer: få og gjenbrukte, så figurene blir billige på mobil
  function M(farge, ru = 0.6, ekstra = {}) {
    const k = farge + '|' + ru + '|' + JSON.stringify(ekstra);
    if (!matCache.has(k)) matCache.set(k, new T.MeshStandardMaterial(Object.assign({ color: LC(farge), roughness: ru, metalness: 0 }, ekstra)));
    return matCache.get(k);
  }
  function mesh(geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m;
  }
  // Detaljnivå: 1 i nærbilde, lavere når mange figurer står på gården samtidig
  const DET = { v: 1 }, D = n => Math.max(5, Math.round(n * DET.v));
  const kule = (r = 1, w = 24, h = 16, ...rest) => new T.SphereGeometry(r, D(w), D(h), ...rest);
  // Kapsel (r128 har ikke CapsuleGeometry): halvkuler og sylinder som dreieflate
  function kapsel(r, len, seg = 8, rundt = 16) {
    seg = Math.max(2, Math.round(seg * DET.v)); rundt = D(rundt);
    const p = [];
    for (let i = 0; i <= seg; i++) { const a = -Math.PI / 2 + (i / seg) * Math.PI / 2; p.push(V2(Math.cos(a) * r, Math.sin(a) * r - len / 2)); }
    for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI / 2; p.push(V2(Math.cos(a) * r, Math.sin(a) * r + len / 2)); }
    return new T.LatheGeometry(p, rundt);
  }
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);

  // ---- Felles ansikt: store øyne med glans, rosa kinn og smil ----
  function ansikt(g, { x = 0, y, z, avst = 0.2, str = 0.12, kinn = true, smil = true, munnY = -0.13, vend = 0 }) {
    const f = new T.Group(); f.position.set(x, y, z); f.rotation.y = vend;
    for (const s of [-1, 1]) {
      const hvit = mesh(kule(str, 20, 14), M('#ffffff', 0.3), s * avst, 0, 0, 1, 1.12, 0.7);
      const pupill = mesh(kule(str * 0.68, 18, 12), M('#1b1b2a', 0.25), s * avst, -str * 0.08, str * 0.42, 1, 1.15, 0.6);
      const glans = mesh(kule(str * 0.24, 10, 8), M('#ffffff', 0.1, { emissive: LC('#ffffff'), emissiveIntensity: 0.6 }), s * avst + str * 0.22, str * 0.25, str * 0.78);
      f.add(hvit, pupill, glans);
      if (kinn) f.add(mesh(kule(str * 0.55, 14, 10), M('#ff8fb1', 0.8, { transparent: true, opacity: 0.75 }), s * (avst + str * 0.9), -str * 1.1, -str * 0.1, 1, 0.6, 0.35));
    }
    if (smil) { const m = mesh(new T.TorusGeometry(str * 0.55, str * 0.12, 8, 16, Math.PI), M('#4a1f1f', 0.5), 0, munnY, str * 0.2); m.rotation.z = Math.PI; f.add(m); }
    g.add(f); return f;
  }
  function bein(g, liste, { len, r, farge, klov = null, klovH = 0.12 }) {
    const out = [];
    for (const [x, z] of liste) {
      const b = new T.Group(); b.position.set(x, len, z);
      b.add(mesh(kapsel(r, len - r * 2), M(farge, 0.7), 0, -len / 2, 0));
      if (klov) b.add(mesh(new T.CylinderGeometry(r * 1.05, r * 1.15, klovH, 14), M(klov, 0.5), 0, -len + klovH / 2, 0));
      g.add(b); out.push(b);
    }
    return out;
  }
  // Små pynt på en overflate: plasseres langs en funksjon som gir punkt og normal
  function strossel(g, n, punkt, farger, { len = 0.12, r = 0.022 } = {}) {
    const geo = kapsel(r, len, 2, 6);
    for (let i = 0; i < n; i++) {
      const { p, nrm } = punkt(rnd(), rnd()); if (!p) continue;
      const m = mesh(geo, M(farger[i % farger.length], 0.35), p.x, p.y, p.z);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(nrm).normalize());
      m.castShadow = false; g.add(m);
    }
  }

  // ================= Donutku (ku + smultring) =================
  // Kroppen ER en donut: deigring med rosa glasur som renner, strøssel, og kuhode, horn, bjelle og hale.
  function donutku() {
    const g = new T.Group(), R = 0.72, r = 0.4, y0 = 0.95;
    const deig = new T.TorusGeometry(R, r, 28, 56); deig.rotateX(Math.PI / 2);
    g.add(mesh(deig, M('#e2a35c', 0.75), 0, y0, 0));
    // Glasur: litt større ring. Punkter under en bølgete «drypplinje» trekkes inn i deigen
    const gl = new T.TorusGeometry(R, r * 1.06, 28, 72); gl.rotateX(Math.PI / 2);
    const pos = gl.attributes.position, v = new T.Vector3(), c = new T.Vector3();
    const grense = a => -0.06 + 0.1 * Math.sin(a * 5) + 0.06 * Math.sin(a * 13 + 1) + 0.05 * Math.sin(a * 23);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i); const a = Math.atan2(v.z, v.x); c.set(Math.cos(a) * R, 0, Math.sin(a) * R);
      if (v.y < grense(a)) { v.sub(c).multiplyScalar(0.86).add(c); pos.setXYZ(i, v.x, v.y, v.z); }
    }
    gl.computeVertexNormals();
    g.add(mesh(gl, M('#ff7fb8', 0.22), 0, y0, 0));
    strossel(g, 70, (u, w) => {
      const a = u * Math.PI * 2, b = 0.25 + w * 2.6; // vinkel rundt røret, mest på toppen
      const cc = new T.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R), ut = cc.clone().normalize();
      const nrm = ut.clone().multiplyScalar(Math.cos(b)).add(new T.Vector3(0, Math.sin(b), 0)).normalize();
      const p = cc.clone().add(nrm.clone().multiplyScalar(r * 1.07)); p.y += y0;
      if (p.y - y0 < grense(a) + 0.12) return {};
      return { p, nrm };
    }, ['#ffffff', '#54c7ff', '#ffe14d', '#7ad66b', '#b07cff', '#ff5e5e']);
    // Kuhode foran, festet på ringen
    const hode = new T.Group(); hode.position.set(0, y0 + 0.42, R + 0.28); g.add(hode);
    hode.add(mesh(kule(0.44, 28, 20), M('#ffffff', 0.6), 0, 0, 0, 1, 0.92, 0.95));
    hode.add(mesh(kule(0.2, 16, 12), M('#2d2a32', 0.6), -0.22, 0.17, 0.12, 1.2, 0.9, 0.6));   // flekk
    hode.add(mesh(kule(0.13, 16, 12), M('#2d2a32', 0.6), 0.27, 0.05, 0.18, 1, 1.2, 0.6));
    hode.add(mesh(kule(0.27, 24, 16), M('#ffb3c7', 0.5), 0, -0.17, 0.3, 1.15, 0.78, 0.8));   // mule
    for (const s of [-1, 1]) {
      hode.add(mesh(kule(0.045, 10, 8), M('#8a3a52', 0.5), s * 0.1, -0.15, 0.51));          // nesebor
      const horn = mesh(new T.ConeGeometry(0.07, 0.26, 12), M('#fff1c9', 0.35), s * 0.24, 0.42, -0.02); horn.rotation.z = -s * 0.5; hode.add(horn);
      const ore = mesh(kule(0.13, 14, 10), M('#ffffff', 0.6), s * 0.44, 0.17, -0.06, 1.4, 0.55, 0.8); ore.rotation.z = s * 0.35; hode.add(ore);
      hode.add(mesh(kule(0.09, 12, 8), M('#ffb3c7', 0.6), s * 0.47, 0.17, -0.0, 1.3, 0.45, 0.5));
    }
    hode.add(mesh(kule(0.09, 12, 10), M('#e2a35c', 0.75), 0, 0.42, 0.06, 1.3, 0.7, 1)); // liten deigtopp i panna
    ansikt(hode, { y: 0.1, z: 0.34, avst: 0.17, str: 0.1, munnY: -0.31 });
    // Bjelle under hodet
    g.add(mesh(kule(0.09, 14, 10), M('#ffd23f', 0.25, { metalness: 0.6 }), 0, y0 + 0.02, R + 0.38));
    const legs = bein(g, [[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]], { len: y0 - 0.15, r: 0.12, farge: '#ffffff', klov: '#4a3a40' });
    // Hale med dusk
    const hale = new T.Group(); hale.position.set(0, y0 + 0.1, -R - 0.35); g.add(hale);
    const hl = mesh(kapsel(0.035, 0.45, 4), M('#ffffff', 0.6), 0, -0.2, -0.05); hl.rotation.x = 0.4; hale.add(hl);
    hale.add(mesh(kule(0.09, 12, 10), M('#2d2a32', 0.8), 0, -0.45, -0.16));
    return { g, legs, hode, hale, navn: 'Donutku', ci: 127, sj: 2, mat: 'Smultring', dyr: 'ku' };
  }

  // ================= Burgersau (sau + burger) =================
  // Kroppen ER en burger: brød, ost, salat og kjøtt i lag. Ullen er brødkanten. Saueansikt og svarte bein.
  function burgersau() {
    const g = new T.Group(), y0 = 0.62;
    // Underbrød
    const under = new T.LatheGeometry([V2(0, 0), V2(0.62, 0.02), V2(0.82, 0.12), V2(0.86, 0.24), V2(0.8, 0.3), V2(0, 0.3)], 40);
    g.add(mesh(under, M('#d9974a', 0.6), 0, y0, 0));
    // Kjøtt med ujevn overflate
    const kj = new T.CylinderGeometry(0.88, 0.88, 0.24, 48, 3); const p = kj.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z); if (d > 0.5) { const k = 1 + 0.03 * Math.sin(Math.atan2(z, x) * 9) + 0.02 * Math.sin(Math.atan2(z, x) * 23); p.setX(i, x * k); p.setZ(i, z * k); } }
    kj.computeVertexNormals(); g.add(mesh(kj, M('#6e3a1f', 0.85), 0, y0 + 0.42, 0));
    // Ost: firkant med fire hjørner som henger ned
    const ost = mesh(new T.BoxGeometry(1.5, 0.04, 1.5), M('#ffc928', 0.35), 0, y0 + 0.56, 0); ost.rotation.y = Math.PI / 4; g.add(ost);
    for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2 + Math.PI / 4, d = 1.18; const dr = mesh(kapsel(0.07, 0.16, 6), M('#ffc928', 0.35), Math.cos(a) * 1.02, y0 + 0.47, Math.sin(a) * 1.02); g.add(dr); }
    // Salat: bølgete grønn krage
    const sal = new T.RingGeometry(0.6, 1.0, 72, 2); const sp = sal.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i), d = Math.hypot(x, y), a = Math.atan2(y, x); sp.setZ(i, (d - 0.6) * (0.22 * Math.sin(a * 14) + 0.06)); }
    sal.rotateX(-Math.PI / 2); sal.computeVertexNormals(); g.add(mesh(sal, M('#6cc04a', 0.55, { side: T.DoubleSide }), 0, y0 + 0.62, 0));
    // Tomat
    for (const a of [0.6, 2.4, 4.2]) g.add(mesh(new T.CylinderGeometry(0.3, 0.3, 0.07, 24), M('#e8433a', 0.4), Math.cos(a) * 0.55, y0 + 0.66, Math.sin(a) * 0.55));
    // Overbrød med sesamfrø
    const top = new T.Group(); top.position.y = y0 + 0.7; g.add(top);
    top.add(mesh(kule(0.86, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), M('#e6a04a', 0.38), 0, 0, 0, 1, 0.72, 1.02));
    for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, h = 0.25 + rnd() * 1.1; const n = new T.Vector3(Math.cos(a) * Math.sin(h), Math.cos(h), Math.sin(a) * Math.sin(h)); const s = mesh(kule(0.045, 8, 6), M('#fff3d1', 0.5), n.x * 0.86, n.y * 0.86 * 0.72 + 0.01, n.z * 0.86 * 1.02, 1, 1.7, 0.45); s.lookAt(n.clone().multiplyScalar(3)); s.castShadow = false; top.add(s); }
    // Ullkant: brødkanten er laget av ulldotter
    for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; top.add(mesh(kule(0.17, 14, 10), M('#fff8ee', 0.95), Math.cos(a) * 0.86, 0.02 + (i % 2) * 0.04, Math.sin(a) * 0.86 * 1.02)); }
    // Sauehode
    const hode = new T.Group(); hode.position.set(0, y0 + 0.72, 0.98); g.add(hode);
    hode.add(mesh(kule(0.34, 26, 18), M('#3a3340', 0.7), 0, 0, 0, 0.95, 1.05, 0.95));
    hode.add(mesh(kule(0.22, 20, 14), M('#4a4250', 0.7), 0, -0.14, 0.2, 1, 0.8, 0.8));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; hode.add(mesh(kule(0.12, 12, 10), M('#fff8ee', 0.95), Math.cos(a) * 0.14, 0.32 + Math.sin(a) * 0.05, -0.04 + Math.sin(a) * 0.08)); }
    for (const s of [-1, 1]) { const o = mesh(kule(0.13, 14, 10), M('#3a3340', 0.7), s * 0.38, 0.06, -0.05, 1.6, 0.5, 0.8); o.rotation.z = -s * 0.3; hode.add(o); hode.add(mesh(kule(0.08, 10, 8), M('#ffb3c7', 0.6), s * 0.42, 0.05, 0.0, 1.5, 0.4, 0.5)); }
    ansikt(hode, { y: 0.05, z: 0.27, avst: 0.14, str: 0.1, munnY: -0.27 });
    hode.add(mesh(kule(0.04, 10, 8), M('#ffb3c7', 0.5), 0, -0.13, 0.37, 1.4, 1, 1));
    const legs = bein(g, [[-0.42, 0.38], [0.42, 0.38], [-0.42, -0.38], [0.42, -0.38]], { len: y0 + 0.05, r: 0.08, farge: '#3a3340', klov: '#23202a', klovH: 0.08 });
    const hale = new T.Group(); hale.position.set(0, y0 + 0.75, -0.95); g.add(hale);
    hale.add(mesh(kule(0.16, 14, 10), M('#fff8ee', 0.95)));
    return { g, legs, hode, hale, navn: 'Burgersau', ci: 508, sj: 0, mat: 'Burger', dyr: 'sau' };
  }

  // ================= Pizzaskilpadde (skilpadde + pizza) =================
  // Skallet ER en pizza: ost som renner over skorpa, pepperoni, basilikum og skivestreker.
  function pizzaskilpadde() {
    const g = new T.Group(), y0 = 0.42;
    g.add(mesh(new T.CylinderGeometry(0.95, 0.9, 0.12, 40), M('#e8d79a', 0.7), 0, y0, 0)); // buk
    const kuppel = new T.LatheGeometry([V2(0.98, 0), V2(0.98, 0.04), V2(0.88, 0.2), V2(0.65, 0.39), V2(0.35, 0.49), V2(0.001, 0.52)], 48);
    g.add(mesh(kuppel, M('#ffc13a', 0.35), 0, y0, 0));                              // ost
    g.add(mesh(new T.TorusGeometry(0.98, 0.13, 14, 48).rotateX(Math.PI / 2), M('#d98f3d', 0.75), 0, y0 + 0.04, 0)); // skorpe
    // Tomatsaus som kant mellom ost og skorpe
    g.add(mesh(new T.TorusGeometry(0.9, 0.045, 8, 48).rotateX(Math.PI / 2), M('#d8452b', 0.5), 0, y0 + 0.12, 0));
    // Ost som renner over skorpa
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3; g.add(mesh(kapsel(0.06, 0.12 + rnd() * 0.08, 6), M('#ffd34d', 0.4), Math.cos(a) * 1.06, y0 + 0.02, Math.sin(a) * 1.06)); }
    // Pepperoni og basilikum på kuppelen
    const pPaa = (a, d) => { const y = 0.52 * (1 - Math.pow(d / 0.98, 2.2)); return new T.Vector3(Math.cos(a) * d, y0 + y + 0.035, Math.sin(a) * d); };
    for (const [a, d] of [[0.3, 0.55], [1.5, 0.62], [2.7, 0.5], [3.9, 0.62], [5.1, 0.55], [0, 0], [2.1, 0.25], [4.6, 0.3]]) {
      const pt = pPaa(a, d), pep = mesh(new T.CylinderGeometry(0.13, 0.13, 0.035, 20), M('#b8262c', 0.45), pt.x, pt.y, pt.z);
      pep.lookAt(pt.clone().add(new T.Vector3(pt.x * 0.6, 0.5, pt.z * 0.6))); pep.rotateX(Math.PI / 2); g.add(pep);
    }
    for (const [a, d] of [[1.0, 0.38], [3.3, 0.72], [5.6, 0.75]]) { const pt = pPaa(a, d); const b = mesh(kule(0.09, 10, 8), M('#3f9a3a', 0.5), pt.x, pt.y + 0.01, pt.z, 1.6, 0.25, 0.8); b.rotation.y = a; g.add(b); }
    // Hode på hals
    const hode = new T.Group(); hode.position.set(0, y0 + 0.28, 1.12); g.add(hode);
    hode.add(mesh(kapsel(0.14, 0.22, 6), M('#7fc96b', 0.6), 0, -0.12, -0.15, 1, 1, 1).rotateX(0.9));
    hode.add(mesh(kule(0.3, 24, 18), M('#86d16f', 0.55), 0, 0.05, 0.05, 1.05, 0.92, 1.05));
    hode.add(mesh(kule(0.05, 10, 8), M('#d8452b', 0.4), 0.16, -0.12, 0.26, 1.4, 0.6, 0.6)); // litt tomatsaus på munnviken
    ansikt(hode, { y: 0.12, z: 0.25, avst: 0.13, str: 0.1, munnY: -0.22 });
    const legs = bein(g, [[-0.62, 0.55], [0.62, 0.55], [-0.62, -0.55], [0.62, -0.55]], { len: y0 + 0.02, r: 0.13, farge: '#7fc96b' });
    // Smeltet ost i bobler oppå kuppelen
    for (let i = 0; i < 9; i++) { const pt = pPaa(rnd() * 6.28, 0.15 + rnd() * 0.7); g.add(mesh(kule(0.06, 10, 8), M('#ffd96b', 0.3), pt.x, pt.y - 0.02, pt.z, 1.4, 0.45, 1.4)); }
    legs.forEach((b, i) => { b.scale.set(1.1, 1, 1.25); b.rotation.z = (i % 2 ? -1 : 1) * 0.25; });
    const hale = new T.Group(); hale.position.set(0, y0 + 0.05, -1.02); g.add(hale);
    const ht = mesh(new T.ConeGeometry(0.07, 0.22, 10), M('#7fc96b', 0.6), 0, 0, -0.08); ht.rotation.x = -Math.PI / 2; hale.add(ht);
    return { g, legs, hode, hale, navn: 'Pizzaskilpadde', ci: 700, sj: 1, mat: 'Pizza', dyr: 'skilpadde' };
  }

  // ================= Croissantrev (rev + croissant) =================
  // Stilprøve: croissant finnes ikke blant de 25 matvarene i spillet. Halen ER en croissant med buede, flakete ledd,
  // og ryggen har de samme lagdelte stripene.
  function croissantrev() {
    const g = new T.Group(), y0 = 0.62;
    g.add(mesh(kule(0.5, 28, 20), M('#f08a2c', 0.65), 0, y0 + 0.28, 0, 0.82, 0.78, 1.25));
    g.add(mesh(kule(0.34, 20, 14), M('#fff4e2', 0.75), 0, y0 + 0.2, 0.3, 0.8, 0.85, 0.7));          // hvitt bryst
    // Croissantstriper over ryggen: halvringer i bakt farge
    // Halvringer som følger kroppens tverrsnitt (ellipsoide med radier 0,41 / 0,39 / 0,625)
    for (let i = 0; i < 4; i++) { const z = -0.33 + i * 0.2, k = Math.sqrt(1 - Math.pow(z / 0.625, 2)); const st = mesh(new T.TorusGeometry(1, 0.11, 8, 24, Math.PI), M(i % 2 ? '#c9712a' : '#e7a24d', 0.5), 0, y0 + 0.28, z, 0.41 * k + 0.015, 0.39 * k + 0.015, 0.45); g.add(st); }
    // Croissant-hale: ledd langs en bue, tykkest på midten og spiss i begge ender
    const kurve = new T.CatmullRomCurve3([new T.Vector3(0, y0 + 0.32, -0.55), new T.Vector3(0.05, y0 + 0.45, -1.0), new T.Vector3(0.12, y0 + 0.95, -1.25), new T.Vector3(0.12, y0 + 1.45, -1.05), new T.Vector3(0.05, y0 + 1.6, -0.62)]);
    const N = 9;
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N, pt = kurve.getPointAt(t), tan = kurve.getTangentAt(t), k = Math.sin(Math.PI * t);
      const ledd = mesh(kule(0.27, 22, 14), M(i % 2 ? '#d98a35' : '#eaa54d', 0.5), pt.x, pt.y, pt.z, 0.55 + 0.75 * k, 0.5 + 0.5 * k, 0.55 + 0.75 * k);
      ledd.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), tan); g.add(ledd);
      if (i > 0 && i < N - 1) { const fure = mesh(new T.TorusGeometry(0.2 * (0.5 + 0.7 * k), 0.022, 6, 24), M('#9c5520', 0.6), pt.x, pt.y, pt.z); fure.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), tan); fure.translateZ(-0.06); g.add(fure); }
    }
    // Glans som smør og et lite drys av perlesukker
    for (let i = 0; i < 10; i++) { const pt = kurve.getPointAt(0.15 + rnd() * 0.7); g.add(mesh(kule(0.025, 6, 5), M('#fffaf0', 0.3), pt.x + (rnd() - 0.5) * 0.25, pt.y + 0.18, pt.z + (rnd() - 0.5) * 0.25)); }
    // Revehode
    const hode = new T.Group(); hode.position.set(0, y0 + 0.78, 0.5); g.add(hode);
    hode.add(mesh(kule(0.36, 26, 18), M('#f08a2c', 0.65), 0, 0, 0, 1.05, 0.95, 1));
    hode.add(mesh(new T.ConeGeometry(0.2, 0.36, 18), M('#fff4e2', 0.75), 0, -0.1, 0.33, 1, 1, 0.75).rotateX(Math.PI / 2));
    hode.add(mesh(kule(0.06, 12, 10), M('#2a1b17', 0.3), 0, -0.1, 0.52));
    for (const s of [-1, 1]) {
      hode.add(mesh(kule(0.16, 16, 12), M('#fff4e2', 0.75), s * 0.17, -0.12, 0.18, 1, 0.8, 0.9));
      const ore = mesh(new T.ConeGeometry(0.13, 0.36, 14), M('#f08a2c', 0.65), s * 0.2, 0.38, -0.02); ore.rotation.z = -s * 0.32; ore.rotation.x = -0.15; hode.add(ore);
      const indre = mesh(new T.ConeGeometry(0.08, 0.24, 12), M('#fff4e2', 0.6), s * 0.2, 0.36, 0.03); indre.rotation.z = -s * 0.32; indre.rotation.x = -0.15; hode.add(indre);
      hode.add(mesh(new T.ConeGeometry(0.05, 0.1, 10), M('#3b2a22', 0.6), s * 0.27, 0.56, -0.04).rotateZ(-s * 0.32));
    }
    ansikt(hode, { y: 0.06, z: 0.27, avst: 0.14, str: 0.095, munnY: -0.27 });
    const legs = bein(g, [[-0.22, 0.32], [0.22, 0.32], [-0.22, -0.32], [0.22, -0.32]], { len: y0, r: 0.09, farge: '#f08a2c', klov: '#3b2a22', klovH: 0.16 });
    return { g, legs, hode, hale: null, navn: 'Croissantrev', ci: null, sj: 1, mat: 'Croissant (stilprøve)', dyr: 'rev' };
  }

  // ================= Iskatt (katt + is) =================
  // Kroppen ER iskuler: mintkule med sjokobiter, vaniljehode med katteører, sjokolade som renner, og en kjeksvaffel-hale.
  function vaffelTekstur() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
    x.fillStyle = '#d99a4b'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#a8692c'; x.lineWidth = 6;
    for (let i = -128; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke(); }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 2); t.encoding = T.sRGBEncoding; return t;
  }
  function iskatt() {
    const g = new T.Group(), y0 = 0.5;
    // Kropp: mintkule med litt ujevn iskant nederst
    const kropp = new T.SphereGeometry(0.62, 36, 26); const kp = kropp.attributes.position;
    for (let i = 0; i < kp.count; i++) { const y = kp.getY(i); if (y < -0.25) { const a = Math.atan2(kp.getZ(i), kp.getX(i)), k = 1 + 0.07 * Math.sin(a * 9); kp.setX(i, kp.getX(i) * k); kp.setZ(i, kp.getZ(i) * k); } }
    kropp.computeVertexNormals(); g.add(mesh(kropp, M('#9ee6c6', 0.5), 0, y0 + 0.5, 0, 1, 0.9, 1.1));
    for (let i = 0; i < 18; i++) { const a = rnd() * 6.28, h = 0.4 + rnd() * 1.9; const n = new T.Vector3(Math.cos(a) * Math.sin(h), Math.cos(h) * 0.9, Math.sin(a) * Math.sin(h) * 1.1); g.add(mesh(new T.BoxGeometry(0.07, 0.05, 0.06), M('#4a2a1c', 0.6), n.x * 0.62, y0 + 0.5 + n.y * 0.62, n.z * 0.62)); }
    // Hode: vaniljekule med sjokolade som renner
    const hode = new T.Group(); hode.position.set(0, y0 + 1.18, 0.28); g.add(hode);
    hode.add(mesh(kule(0.42, 32, 22), M('#fff3d6', 0.45), 0, 0, 0, 1.05, 0.95, 1));
    const sjoko = new T.SphereGeometry(0.435, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.42); const sk = sjoko.attributes.position;
    for (let i = 0; i < sk.count; i++) { const a = Math.atan2(sk.getZ(i), sk.getX(i)); const y = sk.getY(i); if (y < 0.2) { const ned = 0.12 * Math.max(0, Math.sin(a * 6)) + 0.08 * Math.max(0, Math.sin(a * 11 + 2)); sk.setY(i, y - ned); } }
    sjoko.computeVertexNormals(); hode.add(mesh(sjoko, M('#5a321e', 0.25), 0, 0.01, 0, 1.06, 0.96, 1.02));
    hode.add(mesh(kule(0.09, 16, 12), M('#e3263a', 0.2), 0, 0.5, 0)); // kirsebær
    hode.add(mesh(new T.CylinderGeometry(0.012, 0.012, 0.18, 6), M('#3c7a2a', 0.6), 0.03, 0.62, -0.02).rotateZ(-0.3));
    for (const s of [-1, 1]) {
      const ore = mesh(new T.ConeGeometry(0.15, 0.3, 4), M('#fff3d6', 0.45), s * 0.26, 0.38, -0.02); ore.rotation.z = -s * 0.35; hode.add(ore);
      const indre = mesh(new T.ConeGeometry(0.08, 0.18, 4), M('#ffb3c7', 0.5), s * 0.26, 0.37, 0.04); indre.rotation.z = -s * 0.35; hode.add(indre);
      for (const dy of [-0.02, 0.05]) { const sh = mesh(new T.CylinderGeometry(0.008, 0.008, 0.36, 4), M('#5a321e', 0.4), s * 0.36, -0.1 + dy, 0.3); sh.rotation.z = Math.PI / 2 + s * dy * 3; hode.add(sh); } // værhår
    }
    hode.add(mesh(new T.ConeGeometry(0.05, 0.06, 3), M('#ff7fa0', 0.4), 0, -0.07, 0.42).rotateX(Math.PI));
    ansikt(hode, { y: 0.02, z: 0.33, avst: 0.15, str: 0.11, munnY: -0.22 });
    // Vaffelhale: kjegle med vaffelmønster og en liten iskule i tuppen
    const hale = new T.Group(); hale.position.set(0, y0 + 0.45, -0.6); g.add(hale);
    const kj = mesh(new T.ConeGeometry(0.16, 0.9, 20, 1, true), new T.MeshStandardMaterial({ map: vaffelTekstur(), roughness: 0.8, side: T.DoubleSide }), 0, 0.4, -0.12); kj.rotation.x = -0.5 + Math.PI; hale.add(kj);
    hale.add(mesh(kule(0.17, 18, 12), M('#ff9cc3', 0.45), 0, 0.82, -0.36));
    const legs = bein(g, [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]], { len: y0 + 0.08, r: 0.1, farge: '#fff3d6', klov: '#9ee6c6', klovH: 0.1 });
    return { g, legs, hode, hale, navn: 'Iskatt', ci: 259, sj: 3, mat: 'Is', dyr: 'katt' };
  }

  // ---- Felles bevegelse: pust, hodevipp, hale og bein ----
  function animer(f, t, gaar) {
    const s = 1 + Math.sin(t * 2.2) * 0.015;
    f.g.children[0] && (f.g.scale.y = s);
    if (f.hode) f.hode.rotation.z = Math.sin(t * 1.3) * 0.06, f.hode.rotation.x = Math.sin(t * 0.9) * 0.05;
    if (f.hale) f.hale.rotation.y = Math.sin(t * 3) * 0.35;
    f.legs.forEach((b, i) => { b.rotation.x = gaar ? Math.sin(t * 9 + (i % 2 === (i < 2 ? 0 : 1) ? 0 : Math.PI)) * 0.5 : 0; });
    f.g.position.y = gaar ? Math.abs(Math.sin(t * 9)) * 0.05 : 0;
  }
  // Skaler som i spillet: største mål = 2,6 × (1 + 0,1 × sjeldenhet)
  function spillSkala(f) { const b = new T.Box3().setFromObject(f.g), s = new T.Vector3(); b.getSize(s); return 2.6 * (1 + 0.1 * f.sj) / Math.max(s.x, s.y, s.z * 0.85); }

  window.EVNHybrider = { DET, lag: { donutku, burgersau, pizzaskilpadde, croissantrev, iskatt }, animer, spillSkala, M, mesh, kule, kapsel, LC };
})();
