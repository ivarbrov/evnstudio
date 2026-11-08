/* Testvisning av de nye hybridfigurene (GLB fra Blender). ?vinkel=34|fram|side|topp|bak, ?figur=navn */
(function () {
  const T = THREE, q = new URLSearchParams(location.search), NAVN = ['donutku', 'burgersau', 'pizzaskilpadde', 'shakeand', 'spagettipingvin'];
  const VIS = { donutku: 'Donutku', burgersau: 'Burgersau', pizzaskilpadde: 'Pizzaskilpadde', shakeand: 'Shakeand', spagettipingvin: 'Spagettipingvin' };
  const valgt = q.get('figur') ? [q.get('figur')] : NAVN, vinkel = q.get('vinkel') || '34';
  const r = new T.WebGLRenderer({ antialias: true }); r.setPixelRatio(Math.min(2, devicePixelRatio)); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  document.getElementById('v').appendChild(r.domElement);
  const s = new T.Scene(); s.background = new T.Color('#bfe3f7').convertSRGBToLinear();
  s.add(new T.HemisphereLight(new T.Color('#eaf6ff').convertSRGBToLinear(), new T.Color('#86b866').convertSRGBToLinear(), 0.8));
  const sol = new T.DirectionalLight(0xfff1dc, 1.3); sol.position.set(4, 8, 6); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); sol.shadow.bias = -0.0004; s.add(sol);
  const fyll = new T.DirectionalLight(0xcfe4ff, 0.4); fyll.position.set(-5, 3, -4); s.add(fyll);
  const bakke = new T.Mesh(new T.CircleGeometry(30, 48), new T.MeshStandardMaterial({ color: new T.Color('#8fd16c').convertSRGBToLinear(), roughness: 1 })); bakke.rotation.x = -Math.PI / 2; bakke.receiveShadow = true; s.add(bakke);
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 100);
  const loader = new T.GLTFLoader(), figurer = [];
  const avstand = 2.3;
  Promise.all(valgt.map((n, i) => new Promise(ok => loader.load('modeller/' + n + (q.get('lav') === '1' ? '_lav' : '') + '.glb', g => {
    const m = g.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material.transparent) o.material.depthWrite = false; } });
    m.position.x = (i - (valgt.length - 1) / 2) * avstand; s.add(m); figurer[i] = m; ok();
  }, undefined, e => { console.error(e); ok(); })))).then(() => {
    document.getElementById('etikett').innerHTML = valgt.map(n => '<span>' + VIS[n] + '</span>').join('');
    if (q.get('etikett') === '0') document.getElementById('etikett').hidden = true;
    // Én visning per figur: hver figur står for seg selv og får sitt eget kamera (rutenett: kolonner = figurer, rader = vinkler)
    const vinkler = (q.get('vinkler') || vinkel).split(',');
    figurer.forEach((f, i) => { f.position.set(i * 12, 0, 0); });
    const cams = [];
    vinkler.forEach((vk, rad) => figurer.forEach((f, i) => {
      const b = new T.Box3().setFromObject(f), c = b.getCenter(new T.Vector3()), st = b.getSize(new T.Vector3()).length();
      const V = { '34': [0.75, 0.32], fram: [0, 0.12], side: [Math.PI / 2, 0.1], topp: [0.3, 1.2], bak: [Math.PI + 0.6, 0.3], spill: [0.3, 0.75] }[vk] || [0.75, 0.32];
      const k = new T.PerspectiveCamera(vk === 'spill' ? 40 : 28, 1, 0.05, 200), d = st * (vk === 'spill' ? 4.5 : 1.75);
      k.position.set(c.x + Math.sin(V[0]) * Math.cos(V[1]) * d, c.y + Math.sin(V[1]) * d, c.z + Math.cos(V[0]) * Math.cos(V[1]) * d); k.lookAt(c);
      cams.push({ k, i, rad });
    }));
    const kol = figurer.length, rader = vinkler.length;
    document.getElementById('etikett').style.display = rader > 1 ? 'none' : '';
    const res = () => { r.setSize(innerWidth, innerHeight); }; res(); addEventListener('resize', res);
    r.setScissorTest(true);
    const loop = t => {
      const W = innerWidth, H = innerHeight, cw = W / kol, ch = H / rader;
      for (const { k, i, rad } of cams) { k.aspect = cw / ch; k.updateProjectionMatrix(); r.setViewport(i * cw, H - (rad + 1) * ch, cw, ch); r.setScissor(i * cw, H - (rad + 1) * ch, cw, ch); r.render(s, k); }
      requestAnimationFrame(loop);
    }; requestAnimationFrame(loop);
    window.KLAR = true;
  });
})();
