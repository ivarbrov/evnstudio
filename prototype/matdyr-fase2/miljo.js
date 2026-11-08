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

  // ---------- Grafisk profil ----------
  // ?profil=mb prøver Min Bondegård 0.4 sin profil i Matdyr: lys uten tonemapping, kalibrerte farger, gradert himmel,
  // og teksturerte materialer (planker, maling, stein, tak, høy) med svakt relieff. Ikke standard ennå.
  const PROFIL = new URLSearchParams(location.search).get('profil') === 'mb' ? 'mb' : 'standard';
  function himmelTekstur(topp, hor) { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, topp); g.addColorStop(1, hor); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; }
  function lysMB(scene, renderer, q) {
    // Verdiene er de samme som dagsoppsettet i Min Bondegård 0.4 (TIDER.dag), men solretningen er skalert til større scene
    renderer.toneMapping = T.NoToneMapping; renderer.toneMappingExposure = 0.93;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = q.skyggeType;
    scene.background = himmelTekstur('#7fc0ec', '#d3ebf7'); scene.fog = new T.Fog(LC('#d3ebf7'), 120, 420);
    const himmel = new T.HemisphereLight(LC('#d6ecff'), 0x41602a, 0.55);
    const sol = new T.DirectionalLight(LC('#ffe8c4'), 1.55); sol.position.set(-26, 40, 22).multiplyScalar(0.7); sol.castShadow = true;
    sol.shadow.mapSize.set(q.skygge, q.skygge); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03; sol.shadow.radius = 3;
    Object.assign(sol.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 100 });
    const fyll = new T.DirectionalLight(0xbfdcff, 0.22); fyll.position.set(30, 20, -20);
    scene.add(himmel, sol, sol.target, fyll);
    return { himmel, sol, fyll, profil: 'mb' };
  }

  // ---------- Lys ----------
  function lys(scene, renderer, k) {
    const q = NIVAER[k];
    if (PROFIL === 'mb') { renderer.setPixelRatio(Math.min(q.pr, devicePixelRatio || 1)); renderer.outputEncoding = T.sRGBEncoding; return lysMB(scene, renderer, q); }
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
  // vf = true: alle enkle fargematerialer (uten tekstur, gjennomsiktighet eller glød) slås sammen til ett felles
  // materiale med vertexfarger. Det gir langt færre tegnekall (samme grep som i Min Bondegård 0.3).
  let vfMat = null;
  const fellesVF = () => vfMat || (vfMat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, metalness: 0 }));
  // Materialkategorier (Min Bondegård-profilen): materialnavnet fra Blender bestemmer overflaten.
  // Fargen kommer fortsatt fra vertexfargene, så mange deler deler samme materiale (få tegnekall).
  const KATEGORI = [
    [/^(laave_rod|rod_planke|port_tre|kasse_tre|kjerre_tre|kjerre_m|tonne_tre|honse_tre|gjerde_tre|drivhus_tre|taarn_tre|planke_lys|vinge_tre)/, 'planke'],
    [/^(rod_maling|rod_mork|hvit_maling|laave_hvit|laave_mork|molle_hvit|silo_vegg|dor_mork)/, 'maling'],
    [/^(stein|helle|sokkel|dsokkel)/, 'stein'], [/^(laave_tak|silo_tak)/, 'tak'], [/^(hoy_f|hoy$|hoy\.)/, 'hoy']];
  const kategori = navn => { if (PROFIL !== 'mb' || !navn) return null; for (const [re, k] of KATEGORI) if (re.test(navn)) return k; return null; };
  const DETALJ = {};
  function detaljTekstur(k) {
    if (DETALJ[k]) return DETALJ[k];
    const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N; const x = cv.getContext('2d'), r = tilfeldig({ planke: 21, maling: 22, stein: 23, tak: 24, hoy: 25 }[k]);
    const rr = (a, b) => a + r() * (b - a), grå = v => { const g = Math.round(v * 255); return 'rgb(' + g + ',' + g + ',' + g + ')'; };
    x.fillStyle = grå(0.78); x.fillRect(0, 0, N, N);
    if (k === 'planke' || k === 'maling') {
      // Loddrette bord (som veggene i Min Bondegård): årer, kvister, lys kant og mørk fuge. Maling får svakere årer og ingen fuger
      const n = 8, bw = N / n, st = k === 'planke' ? 1 : 0.45;
      for (let i = 0; i < n; i++) {
        x.fillStyle = grå(0.78 + rr(-0.05, 0.05) * st); x.fillRect(i * bw, 0, bw, N);
        x.globalAlpha = 0.16 * st; x.strokeStyle = '#000';
        for (let j = 0; j < 9; j++) { x.lineWidth = rr(0.6, 1.6); x.beginPath(); const x0 = i * bw + rr(4, bw - 4); x.moveTo(x0, 0); for (let y = 0; y <= N; y += 16) x.lineTo(x0 + Math.sin(y * 0.02 + j) * 2.5, y); x.stroke(); }
        if (k === 'planke') { x.globalAlpha = 0.2; x.fillStyle = '#fff'; x.fillRect(i * bw + 3, 0, 3, N);
          x.globalAlpha = 0.5; x.fillStyle = '#000'; [24, N - 24].forEach(y => { x.beginPath(); x.arc(i * bw + bw / 2, y, 2.2, 0, 7); x.fill(); });
          if (r() < 0.4) { x.globalAlpha = 0.22; x.beginPath(); x.ellipse(i * bw + rr(12, bw - 12), rr(60, N - 60), 5, 9, 0, 0, 7); x.fill(); }
          x.globalAlpha = 1; x.fillStyle = grå(0.32); x.fillRect(i * bw, 0, 3, N); }
        x.globalAlpha = 1;
      }
    } else if (k === 'stein') {
      for (let i = 0; i < 160; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1), l = r() < 0.5; g.addColorStop(0, l ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.save(); x.translate(rr(0, N), rr(0, N)); x.scale(rr(14, 60), rr(14, 60)); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); }
      for (let i = 0; i < 5000; i++) { x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.14)'; const z = rr(1, 3); x.fillRect(rr(0, N), rr(0, N), z, z); }
    } else if (k === 'tak') {
      const rader = 8, sw = N / 8, sh = N / rader; x.fillStyle = grå(0.25); x.fillRect(0, 0, N, N);
      for (let ra = 0; ra < rader; ra++) for (let i = -1; i < 9; i++) { const ox = i * sw + (ra % 2 ? sw / 2 : 0), oy = ra * sh, v = 0.8 + rr(-0.06, 0.06);
        const g = x.createLinearGradient(0, oy, 0, oy + sh * 1.15); g.addColorStop(0, grå(v * 0.62)); g.addColorStop(0.75, grå(v)); g.addColorStop(1, grå(Math.min(1, v + 0.06)));
        x.fillStyle = g; x.beginPath(); x.moveTo(ox + 2, oy); x.lineTo(ox + sw - 2, oy); x.lineTo(ox + sw - 2, oy + sh * 0.85); x.quadraticCurveTo(ox + sw / 2, oy + sh * 1.25, ox + 2, oy + sh * 0.85); x.closePath(); x.fill(); }
    } else if (k === 'hoy') {
      for (let i = 0; i < 1400; i++) { x.strokeStyle = r() < 0.5 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.3)'; x.lineWidth = rr(0.8, 2); const px = rr(0, N), py = rr(0, N), a = rr(-0.4, 0.4); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 30, py + Math.sin(a) * 30); x.stroke(); }
    }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return (DETALJ[k] = t);
  }
  // Triplanar detalj i verdensrommet: virker på moduler som er skalert ulikt i hver retning (bjelker, rekkverk, buer),
  // uten at teksturen strekkes. Teksturen ganges med vertexfargen og gir svakt relieff (bump) fra lysheten.
  const katMat = {};
  function kategoriMaterial(k) {
    if (katMat[k]) return katMat[k];
    const P = { planke: { flis: 2.2, bump: 0.6, ru: 0.82 }, maling: { flis: 2.2, bump: 0.25, ru: 0.7 }, stein: { flis: 1.4, bump: 0.8, ru: 0.92 }, tak: { flis: 1.6, bump: 0.9, ru: 0.8 }, hoy: { flis: 1.2, bump: 0.5, ru: 1 } }[k];
    const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: P.ru, metalness: 0 }); m.name = 'kat_' + k;
    m.extensions = { derivatives: true };
    m.onBeforeCompile = sh => {
      sh.uniforms.tpKart = { value: detaljTekstur(k) }; sh.uniforms.tpFlis = { value: 1 / P.flis }; sh.uniforms.tpBump = { value: P.bump };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTpPos; varying vec3 vTpNor;')
        .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
          vec4 tpW = vec4(transformed, 1.0); vec3 tpN = objectNormal;
          #ifdef USE_INSTANCING
            tpW = instanceMatrix * tpW; tpN = mat3(instanceMatrix) * tpN;
          #endif
          vTpPos = (modelMatrix * tpW).xyz; vTpNor = normalize(mat3(modelMatrix) * tpN);`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
          varying vec3 vTpPos; varying vec3 vTpNor; uniform sampler2D tpKart; uniform float tpFlis; uniform float tpBump; float tpH = 0.78;`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          { vec3 w = pow(abs(normalize(vTpNor)), vec3(4.0)); w /= (w.x + w.y + w.z);
            vec3 p = vTpPos * tpFlis;
            float hx = texture2D(tpKart, p.zy).r, hy = texture2D(tpKart, p.xz).r, hz = texture2D(tpKart, p.xy).r;
            tpH = hx * w.x + hy * w.y + hz * w.z; diffuseColor.rgb *= tpH / 0.78; }`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          { vec3 sp = -vViewPosition; vec3 sx = dFdx(sp), sy = dFdy(sp); vec2 dh = vec2(dFdx(tpH), dFdy(tpH)) * tpBump * 0.06;
            vec3 r1 = cross(sy, normal), r2 = cross(normal, sx); float det = dot(sx, r1) * (gl_FrontFacing ? 1.0 : -1.0);
            vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2); normal = normalize(abs(det) * normal - grad); }`);
    };
    m.customProgramCacheKey = () => 'tp_' + k;
    return (katMat[k] = m);
  }
  function deler(node, skala = 1, { vf = false } = {}) {
    node.updateMatrixWorld(true);
    const inv = new T.Matrix4().copy(node.matrixWorld).invert(), per = new Map();
    node.traverse(o => {
      if (!o.isMesh) return;
      const m0 = o.material, enkel = vf && !m0.map && !m0.transparent && !(m0.emissive && m0.emissive.getHex() && m0.emissiveIntensity > 0);
      const kat = enkel ? kategori(m0.name) : null, m = kat ? kategoriMaterial(kat) : enkel ? fellesVF() : delMat(m0), g = o.geometry.clone();
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
      if (skala !== 1) g.scale(skala, skala, skala);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute('uv', new T.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      const ng = g.index ? g.toNonIndexed() : g;
      if (enkel) { const n = ng.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { c[i * 3] = m0.color.r; c[i * 3 + 1] = m0.color.g; c[i * 3 + 2] = m0.color.b; } ng.setAttribute('color', new T.BufferAttribute(c, 3)); }
      if (!per.has(m)) per.set(m, []); per.get(m).push(ng);
    });
    const ut = [];
    for (const [mat, geos] of per) ut.push({ geo: flett(geos), mat });
    return ut;
  }
  function flett(geos) {
    let n = 0; geos.forEach(g => n += g.attributes.position.count);
    const farge = geos.every(g => g.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = farge ? new Float32Array(n * 3) : null; let o = 0;
    geos.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2); if (col) col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); if (col) g.setAttribute('color', new T.BufferAttribute(col, 3));
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
  // Spillet bestemmer fargen per punkt med farge(x, z, c) (gress, jord, grus, skogbunn ...). Komponenten eier bare geometri,
  // åser og en rolig detaljtekstur med lav kontrast, slik at store flater ikke ser gjentakende ut.
  function terreng({ storrelse = 340, ruter = 120, flat = () => true, hoyde = (x, z) => 0, farge = null } = {}) {
    const g = new T.PlaneGeometry(storrelse, storrelse, ruter, ruter); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, fa = new Float32Array(p.count * 3), c = new T.Color(), gr = LC('#7cc95a');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, flat(x, z) ? 0 : hoyde(x, z));
      c.copy(gr); if (farge) farge(x, z, c);
      fa[i * 3] = c.r; fa[i * 3 + 1] = c.g; fa[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new T.BufferAttribute(fa, 3)); g.computeVertexNormals();
    // Detaljtekstur: myke, lyse og mørke flekker i flere størrelser og svak korning. Lav kontrast og stor flis (14 m)
    const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x = cv.getContext('2d'), r = tilfeldig(4);
    x.fillStyle = '#e6e6e6'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 260; i++) {
      const px = r() * 512, py = r() * 512, rad = 30 + r() * 90, lys = r() > 0.5, a = (0.02 + r() * 0.025) * (PROFIL === 'mb' ? 0.4 : 1);
      for (const [dx, dy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
        const gg = x.createRadialGradient(px + dx, py + dy, 0, px + dx, py + dy, rad); gg.addColorStop(0, lys ? 'rgba(255,255,255,' + a + ')' : 'rgba(40,50,30,' + a + ')'); gg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = gg; x.fillRect(px + dx - rad, py + dy - rad, rad * 2, rad * 2);
      }
    }
    for (let i = 0; i < 9000; i++) { x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(30,40,20,0.03)'; x.fillRect(r() * 512, r() * 512, 1.5, 1.5); }
    // Min Bondegård-profilen: korte gresstrå i to toner (som gressteksturen i 0.4), fortsatt lav kontrast
    if (PROFIL === 'mb') for (let i = 0; i < 9000; i++) { x.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(20,45,10,0.14)'; x.lineWidth = 1; const px = r() * 512, py = r() * 512; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 4, py - 2 - r() * 4); x.stroke(); }
    const tx = new T.CanvasTexture(cv); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(storrelse / (PROFIL === 'mb' ? 5 : 14), storrelse / (PROFIL === 'mb' ? 5 : 14)); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, map: tx, color: PROFIL === 'mb' ? new T.Color(1.22, 1.22, 1.22) : new T.Color(1.08, 1.08, 1.08) })); m.receiveShadow = true;
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
  window.EVNMiljo = { PROFIL, kategoriMaterial, detaljTekstur, NIVAER, velgKvalitet, lagreKvalitet, lys, lastGLB, deler, instanser, kopi, terreng, spred, maaler, adaptiv, LC, stoy };
})();
