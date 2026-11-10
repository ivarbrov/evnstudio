/* Toppsett: felles særpreg for Food God og Secret (alternativ C, prototype bak ?fordeling=c).
   Ingen egne modeller per figur. Settet legges oppå hvilken som helst hybridfigur (eller kulefiguren) mens spillet kjører:
   - matdelene får nytt materiale (dyrets egne farger beholdes, så arten er lett å kjenne igjen)
   - felles tilbehør: krone, glorie, ring på bakken, gnister, matbiter i bane
   Tre varianter av hvert sett, så Even kan velge. Valget lagres i 'evn-matdyr-toppsett' (bare prototypen). */
(function () {
  'use strict';
  const T = THREE;
  // Materialnavn som hører til dyret (fra modellene i modeller/). Alt annet regnes som mat.
  const DYRMAT = /^(gris_rosa|grisklov|snute|nesebor|oye|oyehvit|oyelys|kinn|munn|munnlys|ku_hvit|ku_sort|klov|mule|horn|hov|and_gul|and_lys|nebb|pingvin_mork|buk|hval_bla|hval_buk|skilpadde|sauansikt|ansikt|oreinn|bjelle|rem|skall_inn)$/;
  const OYE = /^(oye|oyelys)$/;
  const VARIANTER = {
    gud: { A: 'Gullglasur og krone', B: 'Glorie og varmt lys', C: 'Gullkant og stjerner' },
    hemmelig: { A: 'Stjernehimmel', B: 'Regnbueskimmer', C: 'Skyggevesen' }
  };
  const lest = (() => { try { return JSON.parse(localStorage.getItem('evn-matdyr-toppsett') || 'null'); } catch (e) { return null; } })();
  const q = new URLSearchParams(location.search).get('toppsett');   // f.eks. ?toppsett=BA (gud B, hemmelig A)
  const valgt = {
    gud: q && VARIANTER.gud[q[0]] ? q[0] : lest && VARIANTER.gud[lest.gud] ? lest.gud : 'A',
    hemmelig: q && VARIANTER.hemmelig[q[1]] ? q[1] : lest && VARIANTER.hemmelig[lest.hemmelig] ? lest.hemmelig : 'A'
  };
  function velg(type, v) { if (!VARIANTER[type][v]) return; valgt[type] = v; try { localStorage.setItem('evn-matdyr-toppsett', JSON.stringify(valgt)); } catch (e) {} }

  const GULL = new T.Color('#f6c445').convertSRGBToLinear(), LILLA = new T.Color('#7b45ff').convertSRGBToLinear();
  const lin = h => new T.Color(h).convertSRGBToLinear();
  // Delte ressurser (lages én gang)
  let delt = null;
  function ressurser() {
    if (delt) return delt;
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, '#2a1060'); gr.addColorStop(1, '#0d0730'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    let sd = 7; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 140; i++) { const a = rn(); x.fillStyle = a > 0.85 ? '#ffe9a8' : a > 0.6 ? '#c9b6ff' : '#ffffff'; x.globalAlpha = 0.5 + rn() * 0.5; x.beginPath(); x.arc(rn() * 256, rn() * 256, 0.6 + rn() * (a > 0.9 ? 2.2 : 1.1), 0, 7); x.fill(); }
    x.globalAlpha = 1; const stjerner = new T.CanvasTexture(cv); stjerner.wrapS = stjerner.wrapT = T.RepeatWrapping; stjerner.encoding = T.sRGBEncoding;
    const glod = (farge) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, farge); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; };
    const ring = new T.RingGeometry(0.86, 1, 48); ring.rotateX(-Math.PI / 2);
    delt = {
      stjerner, glodGull: glod('rgba(255,214,90,0.9)'), glodLilla: glod('rgba(170,110,255,0.9)'), glodHvit: glod('rgba(255,255,255,1)'),
      ring, torus: new T.TorusGeometry(1, 0.08, 8, 40), kule: new T.SphereGeometry(1, 12, 10), kjegle: new T.ConeGeometry(0.22, 0.5, 6), sylinder: new T.CylinderGeometry(1, 1, 0.45, 20, 1, true)
    };
    return delt;
  }
  const add = (farge, opa = 1) => new T.MeshBasicMaterial({ color: farge, transparent: true, opacity: opa, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });

  function krone(H) {
    const R = ressurser(), g = new T.Group(), mat = new T.MeshStandardMaterial({ color: GULL, metalness: 0.9, roughness: 0.25, emissive: GULL, emissiveIntensity: 0.25 });
    const b = new T.Mesh(R.sylinder, mat); b.scale.set(0.5, 0.6, 0.5); g.add(b);
    for (let i = 0; i < 5; i++) { const k = new T.Mesh(R.kjegle, mat), a = i / 5 * Math.PI * 2; k.position.set(Math.sin(a) * 0.42, 0.33, Math.cos(a) * 0.42); g.add(k);
      const p = new T.Mesh(R.kule, new T.MeshStandardMaterial({ color: lin(i % 2 ? '#ff4d6d' : '#4dd2ff'), roughness: 0.2, emissive: lin(i % 2 ? '#ff4d6d' : '#4dd2ff'), emissiveIntensity: 0.4 })); p.scale.setScalar(0.07); p.position.set(Math.sin(a) * 0.5, 0.05, Math.cos(a) * 0.5); g.add(p); }
    g.scale.setScalar(H * 0.26); return g;
  }
  function gnister(antall, farge, H, Rr) {
    const R = ressurser(), g = new T.Group(), m = new T.SpriteMaterial({ map: R.glodHvit, color: farge, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    for (let i = 0; i < antall; i++) { const s = new T.Sprite(m); s.userData = { a: Math.random() * 7, f: 0.3 + Math.random() * 0.5, r: Rr * (0.5 + Math.random() * 0.6), o: Math.random() }; s.scale.setScalar(H * 0.07); g.add(s); }
    g.userData.oppdater = t => { for (const s of g.children) { const u = s.userData, k = (t * u.f + u.o) % 1; s.position.set(Math.sin(u.a + t * 0.5) * u.r, k * H * 1.2, Math.cos(u.a + t * 0.5) * u.r); s.material.opacity = Math.sin(k * Math.PI); } };
    return g;
  }
  function bakkering(farge, Rr) { const R = ressurser(), m = new T.Mesh(R.ring, new T.MeshBasicMaterial({ color: farge, transparent: true, opacity: 0.75, depthWrite: false, side: T.DoubleSide })); m.scale.setScalar(Rr * 1.05); m.position.y = 0.04; m.renderOrder = 3; return m; }
  function glodSprite(tex, H, y) { const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.55 })); s.scale.setScalar(H * 1.6); s.position.y = y; s.renderOrder = 2; return s; }
  function matbiter(farger, H, Rr) {
    const R = ressurser(), g = new T.Group();
    farger.slice(0, 3).forEach((c, i) => { const m = new T.Mesh(R.kule, new T.MeshStandardMaterial({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: 0.35 })); m.scale.setScalar(H * 0.07); m.userData.a = i / 3 * Math.PI * 2; g.add(m); });
    g.userData.oppdater = t => { g.children.forEach((m, i) => { const a = m.userData.a + t * 1.4; m.position.set(Math.sin(a) * Rr * 1.15, H * (0.55 + Math.sin(t * 2 + i) * 0.08), Math.cos(a) * Rr * 1.15); m.rotation.y = t * 3; }); };
    return g;
  }
  // Skall rundt matdelene (bakside, litt større): gir en lysende kant
  function skall(mesh, farge, tykk) {
    const s = new T.Mesh(mesh.geometry, new T.MeshBasicMaterial({ color: farge, side: T.BackSide, transparent: true, opacity: 0.9 }));
    mesh.geometry.computeBoundingBox(); const c = mesh.geometry.boundingBox.getCenter(new T.Vector3()), st = mesh.geometry.boundingBox.getSize(new T.Vector3()), k = 1 + tykk / Math.max(0.05, Math.max(st.x, st.y, st.z));
    s.scale.setScalar(k); s.position.copy(c).multiplyScalar(1 - k); s.userData.toppSkall = true; mesh.add(s); return s;
  }

  // Legger settet på figuren g (en Group med modellen). r: 5 = Food God, 6 = Secret. Returnerer et objekt med oppdater(t).
  function bruk(g, r, variant) {
    if (r < 5 || !g) return null;
    const type = r === 5 ? 'gud' : 'hemmelig', v = variant || valgt[type];
    g.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(g), st = box.getSize(new T.Vector3()), H = Math.max(0.5, st.y), Rr = Math.max(st.x, st.z) * 0.5;
    const matFarger = [], deler = [];
    g.traverse(o => { if (!o.isMesh || o.userData.toppSkall) return; const mats = Array.isArray(o.material) ? o.material : [o.material]; const nye = mats.map(m => {
      if (!m || !m.isMaterial) return m; const erDyr = DYRMAT.test(m.name || ''), erOye = OYE.test(m.name || '');
      const n = m.clone(); n.userData.orig = m;
      if (!erDyr && n.color) matFarger.push(n.color.clone());
      if (type === 'gud' && !erDyr && n.isMeshStandardMaterial) {
        if (v === 'A') { n.color.lerp(GULL, 0.62); n.metalness = 0.85; n.roughness = 0.28; n.emissive = GULL.clone(); n.emissiveIntensity = 0.12; }
        else if (v === 'B') { n.emissive = n.color.clone().lerp(GULL, 0.5); n.emissiveIntensity = 0.45; n.userData.puls = true; }
        else { n.roughness = Math.min(n.roughness, 0.35); deler.push(o); }
      } else if (type === 'hemmelig') {
        if (erOye) { n.emissive = lin('#d6b8ff'); n.emissiveIntensity = 1.6; }
        else if (v === 'A' && !erDyr) { n.color = lin('#3a1c7a'); n.map = ressurser().stjerner; n.emissive = LILLA.clone(); n.emissiveIntensity = 0.28; n.metalness = 0.35; n.roughness = 0.35; }
        else if (v === 'B' && !erDyr) { n.emissive = n.color.clone(); n.emissiveIntensity = 0.5; n.userData.regnbue = true; n.metalness = 0.5; n.roughness = 0.25; }
        else if (v === 'C') { n.color = lin(erDyr ? '#1a1033' : '#241444'); n.transparent = true; n.opacity = 0.88; n.depthWrite = true; n.emissive = LILLA.clone(); n.emissiveIntensity = erDyr ? 0.08 : 0.22; if (!erDyr) deler.push(o); }
      }
      n.needsUpdate = true; return n; });
      o.material = Array.isArray(o.material) ? nye : nye[0]; });
    const ekstra = new T.Group(); ekstra.name = 'toppsett'; g.add(ekstra);
    const oppd = [];
    if (type === 'gud') {
      ekstra.add(bakkering(GULL, Rr));
      if (v === 'A') { const k = krone(H); k.position.y = H + H * 0.05; ekstra.add(k); oppd.push(t => { k.position.y = H * 1.05 + Math.sin(t * 2) * H * 0.03; k.rotation.y = t * 0.6; }); const sp = gnister(10, GULL, H, Rr); ekstra.add(sp); oppd.push(sp.userData.oppdater); }
      if (v === 'B') { const R = ressurser(), gl = new T.Mesh(R.torus, new T.MeshStandardMaterial({ color: GULL, emissive: GULL, emissiveIntensity: 1.2, metalness: 0.6, roughness: 0.3 })); gl.rotation.x = Math.PI / 2; gl.scale.setScalar(Rr * 0.45); gl.position.y = H * 1.12; ekstra.add(gl);
        const gs = glodSprite(ressurser().glodGull, H, H * 0.5); ekstra.add(gs);
        oppd.push(t => { gl.position.y = H * 1.12 + Math.sin(t * 1.5) * H * 0.03; gs.material.opacity = 0.4 + Math.sin(t * 2) * 0.12; }); }
      if (v === 'C') { deler.forEach(o => skall(o, GULL, 0.06)); const k = krone(H * 0.8); k.position.y = H * 1.02; ekstra.add(k); const sp = gnister(16, lin('#fff3b0'), H, Rr * 1.2); ekstra.add(sp); oppd.push(sp.userData.oppdater, t => { k.rotation.y = t * 0.6; }); }
    } else {
      ekstra.add(bakkering(LILLA, Rr));
      if (v === 'A' || v === 'B') { const mb = matbiter(matFarger.length ? matFarger : [lin('#ffcf5a'), lin('#ff7aa8'), lin('#7fd6ff')], H, Rr); ekstra.add(mb); oppd.push(mb.userData.oppdater); }
      if (v === 'A') { const gs = glodSprite(ressurser().glodLilla, H, H * 0.5); ekstra.add(gs); oppd.push(t => { gs.material.opacity = 0.35 + Math.sin(t * 1.7) * 0.1; }); }
      if (v === 'B') { const sp = gnister(14, lin('#ffffff'), H, Rr); ekstra.add(sp); oppd.push(sp.userData.oppdater); }
      if (v === 'C') { deler.forEach(o => skall(o, lin('#b98cff'), 0.05)); const gs = glodSprite(ressurser().glodLilla, H, H * 0.45); gs.material.opacity = 0.7; ekstra.add(gs); oppd.push(t => { gs.material.opacity = 0.55 + Math.sin(t * 3) * 0.15; }); }
    }
    // Animerte materialer
    const anim = []; g.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && (m.userData.puls || m.userData.regnbue)) anim.push(m); }); });
    const hsl = { h: 0, s: 0, l: 0 };
    const tp = { type, variant: v, ekstra, oppdater(t) { for (const f of oppd) f(t); for (const m of anim) { if (m.userData.puls) m.emissiveIntensity = 0.35 + Math.sin(t * 2.4) * 0.15; else { m.emissive.setHSL((t * 0.15 + m.id * 0.1) % 1, 0.8, 0.45); m.emissiveIntensity = 0.55; } } if (type === 'hemmelig' && v === 'A') { const tex = ressurser().stjerner; tex.offset.set(t * 0.01, t * 0.006); } } };
    g.userData.topp = tp; return tp;
  }
  // Bare tilbehøret (krone/glorie, ring, gnister): for plassene i gården, der figurene er slått sammen og materialene deles
  function pynt(r, H, Rr, variant) {
    if (r < 5) return null; const g = new T.Group(), dummy = new T.Group(), b = new T.Mesh(new T.BoxGeometry(Rr * 2, H, Rr * 2), new T.MeshBasicMaterial({ visible: false })); b.position.y = H / 2; dummy.add(b);
    const tp = bruk(dummy, r, variant); g.add(tp.ekstra); g.userData.topp = tp; return g;
  }
  window.EVNToppsett = { VARIANTER, valgt, velg, bruk, pynt, DYRMAT };
})();
