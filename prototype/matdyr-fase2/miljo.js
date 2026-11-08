/* EVN 3D-miljø (kandidat til felles EVN-komponent, ikke godkjent ennå).
   Lys, kvalitetsnivå, terreng, vegetasjon og instansering av GLB-ressurser for three.js r128.
   Spillspesifikt innhold (hvor ting står) bestemmes av spillet. Komponenten eier bare «hvordan»:
   - kvalitetsnivå (lav / middels / høy) med oppløsning, skygger og tetthet
   - felles lysoppsett (himmel, sol, fyll) og tåke
   - GLB-ressurser hentet etter navn, slått sammen per materiale og instansert
   - terreng med fargevariasjon og myke åser utenfor spilleområdet
   - spredning av gress, blomster, busker, steiner og trær med forbudte soner
   Feil i komponenten skal ikke stoppe spillet: ressurser som ikke lastes, hoppes over. */
(function () {
  'use strict';
  const T = THREE;
  const LC = h => new T.Color(h).convertSRGBToLinear();

  // ---------- Kvalitetsnivå ----------
  const NIVAER = {
    lav: { navn: 'Lav', pr: 1, skygge: 1024, skyggeType: T.PCFShadowMap, gress: 0.25, blomst: 0.4, traer: 0.5, antialias: false, figurDetalj: 'lav' },
    middels: { navn: 'Middels', pr: 1.5, skygge: 2048, skyggeType: T.PCFSoftShadowMap, gress: 0.6, blomst: 0.7, traer: 0.8, antialias: true, figurDetalj: 'lav' },
    hoy: { navn: 'Høy', pr: 2, skygge: 2048, skyggeType: T.PCFSoftShadowMap, gress: 1, blomst: 1, traer: 1, antialias: true, figurDetalj: 'full' }
  };
  function velgKvalitet() {
    const q = new URLSearchParams(location.search).get('kvalitet');
    if (q && NIVAER[q]) return q;
    try { const l = localStorage.getItem('evn-grafikk-kvalitet'); if (l && NIVAER[l]) return l; } catch (e) { }
    const touch = matchMedia('(pointer: coarse)').matches, minne = navigator.deviceMemory || 4, kjerner = navigator.hardwareConcurrency || 4;
    if (touch && (minne <= 3 || kjerner <= 4)) return 'lav';
    return touch ? 'middels' : 'hoy';
  }
  function lagreKvalitet(k) { try { localStorage.setItem('evn-grafikk-kvalitet', k); } catch (e) { } }

  // ---------- Lys ----------
  function lys(scene, renderer, k) {
    const q = NIVAER[k];
    renderer.setPixelRatio(Math.min(q.pr, devicePixelRatio || 1));
    renderer.outputEncoding = T.sRGBEncoding;
    // ACES er beholdt her: i denne scenen ga den mettere farger enn lys uten tonemapping (Min Bondegård 0.3 fant det motsatte).
    // ?tonemap=ingen viser alternativet, så valget kan avgjøres på ekte skjerm.
    const TM = new URLSearchParams(location.search).get('tonemap'); renderer.toneMapping = TM === 'ingen' ? T.NoToneMapping : T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = q.skyggeType;
    scene.background = LC('#8fcff3'); scene.fog = new T.Fog(LC('#bfe2f5'), 95, 260);
    const aces = renderer.toneMapping === T.ACESFilmicToneMapping;
    const himmel = new T.HemisphereLight(LC('#e9f6ff'), LC('#5f8a40'), aces ? 0.7 : 0.48);
    const sol = new T.DirectionalLight(LC('#fff0d6'), aces ? 1.45 : 0.82); sol.position.set(14, 26, 12); sol.castShadow = true;
    sol.shadow.mapSize.set(q.skygge, q.skygge); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.035; sol.shadow.radius = 3;
    Object.assign(sol.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 90 });
    const fyll = new T.DirectionalLight(LC('#bcd8ff'), aces ? 0.35 : 0.16); fyll.position.set(-12, 9, -14);
    scene.add(himmel, sol, sol.target, fyll);
    return { himmel, sol, fyll };
  }

  // ---------- Ressurser ----------
  // Laster en GLB. Først prøves en innpakket kopi (<url>.js med base64, for verter som ikke serverer .glb),
  // deretter selve filen. Mangler begge, gis null, og spillet bruker de gamle figurene.
  function lastGLB(url) {
    const parse = buf => new Promise(ok => { try { new T.GLTFLoader().parse(buf, '', g => ok(g), e => { console.warn('Kunne ikke lese', url, e); ok(null); }); } catch (e) { ok(null); } });
    const fraFil = () => new Promise(ok => { try { new T.GLTFLoader().load(url, g => ok(g), undefined, () => ok(null)); } catch (e) { ok(null); } });
    return new Promise(ok => {
      const s = document.createElement('script'); s.src = url + '.js'; s.async = true;
      s.onload = () => { const b64 = window.EVN_GLB && window.EVN_GLB[url]; if (!b64) return fraFil().then(ok); const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); delete window.EVN_GLB[url]; parse(u.buffer).then(ok); };
      s.onerror = () => fraFil().then(ok);
      document.head.appendChild(s);
    });
  }
  // Slår sammen alle mesher under en node per materiale, med nodenes transformasjoner bakt inn.
  // Gir [{ geo, mat }] som kan brukes i Mesh eller InstancedMesh. Materialer deles mellom kopier.
  const matCache = {};
  function delMat(m) {
    const n = m.name || m.uuid; if (matCache[n]) return matCache[n];
    m.envMapIntensity = 0; if (m.transparent) m.depthWrite = false;
    m.roughness = Math.max(0.25, m.roughness); return (matCache[n] = m);
  }
  function deler(node, skala = 1) {
    node.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(node.matrixWorld).invert(), per = new Map();
    node.traverse(o => {
      if (!o.isMesh) return;
      const m = delMat(o.material), g = o.geometry.clone();
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      if (skala !== 1) g.scale(skala, skala, skala);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute('uv', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!per.has(m)) per.set(m, []); per.get(m).push(g.index ? g.toNonIndexed() : g);
    });
    const ut = [];
    for (const [mat, geos] of per) ut.push({ geo: flett(geos), mat });
    return ut;
  }
  function flett(geos) {
    let n = 0; geos.forEach(g => n += g.attributes.position.count);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    geos.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    g.computeBoundingSphere(); return g;
  }
  // Instanserer delene på en liste med plasseringer [{x, y, z, ry, s}] (én InstancedMesh per materiale)
  function instanser(del, plasser, { skygge = true, motta = true } = {}) {
    const gr = new T.Group(); if (!plasser.length) return gr;
    const m4 = new T.Matrix4(), q = new T.Quaternion(), V = T.Vector3, Y = new V(0, 1, 0);
    for (const { geo, mat } of del) {
      const im = new T.InstancedMesh(geo, mat, plasser.length);
      plasser.forEach((p, i) => { q.setFromAxisAngle(Y, p.ry || 0); const s = p.s || 1; m4.compose(new V(p.x, p.y || 0, p.z), q, new V(s * (p.sx || 1), s * (p.sy || 1), s)); im.setMatrixAt(i, m4); });
      im.castShadow = skygge && !mat.transparent; im.receiveShadow = motta; gr.add(im);
    }
    return gr;
  }
  // Én enkelt kopi som vanlige mesher (for bygninger og ting som står én gang)
  function kopi(del, x, y, z, ry = 0, s = 1) {
    const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s);
    for (const { geo, mat } of del) { const m = new T.Mesh(geo, mat); m.castShadow = !mat.transparent; m.receiveShadow = true; g.add(m); }
    return g;
  }

  // ---------- Terreng ----------
  function stoy(x, z) { return Math.sin(x * 0.11 + Math.sin(z * 0.07)) * 0.5 + Math.sin(z * 0.13 + x * 0.05) * 0.35 + Math.sin((x + z) * 0.31) * 0.15; }
  // Flatt der spillet foregår (flat(x, z) = true), myke åser lenger ute. Fargen varierer i flekker.
  function terreng({ storrelse = 340, ruter = 120, flat = () => true, hoyde = (x, z) => 0, sti = () => 0 } = {}) {
    const g = new T.PlaneGeometry(storrelse, storrelse, ruter, ruter); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, farge = new Float32Array(p.count * 3);
    const gr1 = LC('#7cc95a'), gr2 = LC('#69b84b'), gr3 = LC('#93d46a'), jord = LC('#c9a26d'), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const y = flat(x, z) ? 0 : hoyde(x, z); p.setY(i, y);
      const n = stoy(x * 1.7, z * 1.7);
      c.copy(gr1).lerp(n > 0 ? gr3 : gr2, Math.min(1, Math.abs(n) * 0.9));
      const s = sti(x, z); if (s > 0) c.lerp(jord, Math.min(1, s));
      farge[i * 3] = c.r; farge[i * 3 + 1] = c.g; farge[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(farge, 3)); g.computeVertexNormals();
    // Detaljtekstur: små lyse og mørke strå som gjentas, ganget med fargene over
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'), r = tilfeldig(4);
    x.fillStyle = '#d9d9d9'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { const px = r() * 256, py = r() * 256, l = 3 + r() * 6, v = r(); x.strokeStyle = v > 0.5 ? 'rgba(255,255,255,' + (0.25 + r() * 0.3) + ')' : 'rgba(90,110,70,' + (0.18 + r() * 0.25) + ')'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 2.5, py - l); x.stroke(); }
    const tx = new T.CanvasTexture(cv); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(storrelse / 5, storrelse / 5); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, map: tx, color: new T.Color(1.12, 1.12, 1.12) })); m.receiveShadow = true;
    return m;
  }

  // ---------- Spredning ----------
  function tilfeldig(frø) { let s = frø >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  // Sprer n punkter i et område (fn område(x, z) = true der det er lov), med minste avstand
  function spred(n, { fra = [-100, -100], til = [100, 100], lov = () => true, avstand = 0, frø = 1, skala = [0.8, 1.2] } = {}) {
    const r = tilfeldig(frø), ut = [];
    for (let k = 0; k < n * 12 && ut.length < n; k++) {
      const x = fra[0] + r() * (til[0] - fra[0]), z = fra[1] + r() * (til[1] - fra[1]);
      if (!lov(x, z)) continue;
      if (avstand && ut.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < avstand * avstand)) continue;
      ut.push({ x, z, ry: r() * Math.PI * 2, s: skala[0] + r() * (skala[1] - skala[0]) });
    }
    return ut;
  }

  // ---------- Ytelsesmåling (for test på ekte PC og mobil) ----------
  function maaler(renderer) {
    const ramme = [], gl = renderer.getContext(); let sist = performance.now();
    const gpu = (() => { try { const d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { return '?'; } })();
    return {
      gpu,
      ramme() { const n = performance.now(); ramme.push(n - sist); sist = n; if (ramme.length > 600) ramme.shift(); },
      rapport(sek = 10) {
        const siste = ramme.slice(-Math.round(sek * 60)).slice(1); if (!siste.length) return null;
        const s = [...siste].sort((a, b) => a - b), snitt = siste.reduce((a, b) => a + b, 0) / siste.length;
        return { fps: Math.round(1000 / snitt), ms: +snitt.toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), rammer: siste.length };
      }
    };
  }

  // Adaptiv oppløsning (som i Min Bondegård 0.3): ned 0,25 når FPS < 50, opp igjen over 58, aldri under 0,75
  function adaptiv(renderer, k, settStorrelse) {
    const maks = Math.min(NIVAER[k].pr, devicePixelRatio || 1); let n = 0, sum = 0, vent = 0, sist = performance.now();
    return () => { const t = performance.now(), dt = t - sist; sist = t; if (dt > 250) return; sum += dt; n++; if (vent > 0) { vent--; return; }
      if (n >= 60) { const fps = 1000 / (sum / n); n = 0; sum = 0; const pr = renderer.getPixelRatio();
        if (fps < 50 && pr > 0.75) { renderer.setPixelRatio(Math.max(0.75, pr - 0.25)); settStorrelse(); vent = 120; }
        else if (fps > 58 && pr < maks) { renderer.setPixelRatio(Math.min(maks, pr + 0.25)); settStorrelse(); vent = 120; } } };
  }
  window.EVNMiljo = { NIVAER, velgKvalitet, lagreKvalitet, lys, lastGLB, deler, instanser, kopi, terreng, spred, maaler, adaptiv, LC, stoy };
})();
