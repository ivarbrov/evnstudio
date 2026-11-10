/* Sammenligning for Even: Food God-settet og Secret-settet i tre varianter, side om side med figuren uten sett.
   ?figur=gud,hemmelig (GLB-navn i modeller/). Standard: donutku (Food God) og pilot_ku_spagetti (Secret). */
(function () {
  const T = THREE, q = new URLSearchParams(location.search), [fGud, fHem] = (q.get('figur') || 'donutku,pilot_ku_spagetti').split(',');
  const r = new T.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio)); r.shadowMap.enabled = true; document.getElementById('v').appendChild(r.domElement);
  const s = new T.Scene(); const L = EVNMiljo.lys(s, r, 'hoy'); s.background = new T.Color('#cfe6f2').convertSRGBToLinear(); s.fog = null;
  L.sol.position.set(-26, 40, 22).normalize().multiplyScalar(10); Object.assign(L.sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 40 });
  const bakke = new T.Mesh(new T.CircleGeometry(400, 64), new T.MeshStandardMaterial({ color: new T.Color('#5eaa2f').convertSRGBToLinear(), roughness: 1 })); bakke.rotation.x = -Math.PI / 2; bakke.receiveShadow = true; s.add(bakke);
  const V = EVNToppsett.VARIANTER, kol = ['', 'A', 'B', 'C'], celler = [];
  Promise.all([fGud, fHem].map(n => EVNMiljo.lastGLB('modeller/' + n + '.glb'))).then(([gg, gh]) => {
    [[gg, 5, 'gud', 'Food God'], [gh, 6, 'hemmelig', 'Secret']].forEach(([glb, rr, type, tittel], rad) => kol.forEach((v, k) => {
      const g = new T.Group(), m = glb.scene.clone(true); m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); g.add(m);
      const b = new T.Box3().setFromObject(m), st = b.getSize(new T.Vector3()); m.scale.setScalar(2.6 / Math.max(st.x, st.y, st.z * 0.85));
      g.position.set(k * 12, 0, rad * 12); s.add(g); const tp = v ? EVNToppsett.bruk(g, rr, v) : null;
      celler.push({ g, tp, rad, k, navn: v ? v + ': ' + V[type][v] : 'Vanlig (uten sett)', tittel });
    }));
    const lab = (c, W, H) => { const e = document.createElement('div'); e.className = 'e'; e.innerHTML = c.navn + '<small>' + c.tittel + '</small>'; Object.assign(e.style, { left: c.k * 25 + '%', width: '25%', top: ((c.rad + 1) * 50) + '%', transform: 'translateY(-3.2em)' }); document.body.append(e); };
    celler.forEach(c => lab(c));
    const res = () => r.setSize(innerWidth, innerHeight); res(); addEventListener('resize', res); r.setScissorTest(true);
    const k = new T.PerspectiveCamera(30, 1, 0.1, 200), t0 = performance.now();
    const loop = () => { const t = q.get('t') ? +q.get('t') : (performance.now() - t0) / 1000, W = innerWidth, H = innerHeight, cw = W / 4, ch = H / 2;
      for (const c of celler) { celler.forEach(d => d.g.visible = d === c); if (c.tp) c.tp.oppdater(t); c.g.rotation.y = q.get('snu') === '0' ? 0.5 : 0.5 + Math.sin(t * 0.5) * 0.4;
        const ce = new T.Vector3(c.g.position.x, 1.5, c.g.position.z); k.position.set(ce.x + 3.2, ce.y + 2.2, ce.z + 6.6); k.lookAt(ce); k.aspect = cw / ch; k.updateProjectionMatrix();
        r.setViewport(c.k * cw, H - (c.rad + 1) * ch, cw, ch); r.setScissor(c.k * cw, H - (c.rad + 1) * ch, cw, ch); r.render(s, k); }
      requestAnimationFrame(loop); }; requestAnimationFrame(loop); window.KLAR = true;
  });
})();
