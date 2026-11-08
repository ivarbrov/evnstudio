/* Matdyr-regn fase 2, trinn 3: spillbar prototype.
   Matdyr regner ned, roboten tar dem med og setter dem på plassene i gården, plassene gir inntekt,
   og Gårdsnivå-menyen leverer inn matdyr og bygger gården ut.
   Egen lagring (evn-matdyr-gard-proto). Produksjonslagringen leses ikke. Ingen E-coins og ingen statistikk. */
(function () {
  'use strict';
  const I = window.EVNIntern, D = window.EVNMatdyrData, T = THREE, $ = id => document.getElementById(id);
  const { R, COMBOS, POOLS, PRICE, INC, GARDSNIVA, plassPris, ARTEMOJI } = D;
  const NOKKEL = 'evn-matdyr-gard-proto', MAKS = 10;
  // Matdyr som har ferdig 3D-figur (ID → indeks i I.NOKLER). Croissantrev er bare en stiltest uten ID.
  const FIGUR = { 127: 0, 508: 1, 700: 2, 259: 4 };
  const fmt = n => { n = Math.floor(n); return n >= 1e9 ? +(n / 1e9).toFixed(1) + ' mrd' : n >= 1e6 ? +(n / 1e6).toFixed(1) + ' mill' : n.toLocaleString('nb-NO'); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const navn = ci => COMBOS[ci].navn;

  // =================== Tilstand og lagring ===================
  const ny = () => ({ v: 1, penger: 60, gard: { niva: 1 }, plassNiva: 0, base: [], disc: [], bestilling: 15 });
  let S = ny();
  const tak = s => GARDSNIVA[s.gard.niva].tak;
  const plasserApne = (s = S) => Math.min(4 + 2 * s.plassNiva, tak(s));
  function rens(s) {
    if (!s || s.v !== 1 || !s.gard) return null;
    const niva = s.gard.niva; if (!Number.isInteger(niva) || niva < 1 || niva > MAKS) return null;
    const o = ny(); o.gard.niva = niva;
    o.penger = Number.isFinite(s.penger) && s.penger >= 0 ? s.penger : 0;
    o.plassNiva = Number.isInteger(s.plassNiva) && s.plassNiva >= 0 && s.plassNiva <= 18 ? s.plassNiva : 0;
    o.base = (Array.isArray(s.base) ? s.base : []).slice(0, plasserApne(o)).map(v => Number.isInteger(v) && v >= 0 && v < COMBOS.length ? v : -1);
    o.disc = (Array.isArray(s.disc) ? s.disc : []).filter(v => Number.isInteger(v) && v >= 0 && v < COMBOS.length);
    o.bestilling = [0, 10, 15].includes(s.bestilling) ? s.bestilling : 15;
    return o;
  }
  function lesLagret() { try { return rens(JSON.parse(localStorage.getItem(NOKKEL) || 'null')); } catch (e) { return null; } }
  function lagre(s = S) { try { const t = JSON.stringify(s); localStorage.setItem(NOKKEL, t); return localStorage.getItem(NOKKEL) === t; } catch (e) { return false; } }
  function fyllBase(s = S) { while (s.base.length < plasserApne(s)) s.base.push(-1); }
  { const l = lesLagret(); if (l) S = l; fyllBase(); }

  // =================== Figurer ===================
  const kuleGeo = new T.SphereGeometry(0.85, 20, 14), kuleMat = {};
  const rMat = r => kuleMat[r] || (kuleMat[r] = new T.MeshStandardMaterial({ color: new T.Color(R[r].c).convertSRGBToLinear(), roughness: 0.45 }));
  const teksturer = {};
  function tekstur(nokkel, b, h, tegn) { if (teksturer[nokkel]) return teksturer[nokkel]; const cv = document.createElement('canvas'); cv.width = b; cv.height = h; tegn(cv.getContext('2d')); const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; return (teksturer[nokkel] = t); }
  const EMOJIFONT = 'system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  // Matdyr uten ferdig figur vises som en kule i sjeldenhetsfargen med dyr og mat over
  function plassholder(ci) {
    const g = new T.Group(), c = COMBOS[ci];
    const k = new T.Mesh(kuleGeo, rMat(c.r)); k.position.y = 0.85; k.castShadow = true; g.add(k);
    const s = new T.Sprite(new T.SpriteMaterial({ map: tekstur('e' + ci, 256, 128, x => { x.font = '92px ' + EMOJIFONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(c.a + c.f, 128, 68); }) }));
    s.scale.set(2.2, 1.1, 1); s.position.y = 2.2; g.add(s); return g;
  }
  // Nye figurer fra Blender (GLB) brukes når de er lastet; de animeres etter kroppen sin
  const nyDetalj = () => I.NY ? EVNMiljo.NIVAER[I.KV].figurDetalj : 'full';
  function modell(ci) {
    const nn = I.nyNavnFor && I.nyNavnFor(ci);
    if (nn) { const f = I.nyFigur(nn, nyDetalj()); f.kopi.scale.setScalar(I.nySkala(nn)); f.g.userData.fig = f; return f.g; }
    const fi = FIGUR[ci]; if (fi === undefined) return plassholder(ci);
    const g = new T.Group(); for (const { geo, mat } of I.gamleFigurDeler()[fi].deler) { const m = new T.Mesh(geo, mat); m.castShadow = true; g.add(m); } return g;
  }
  function navneskilt(ci) {
    const c = COMBOS[ci], s = new T.Sprite(new T.SpriteMaterial({ depthWrite: false, map: tekstur('n' + ci, 512, 150, x => {
      x.fillStyle = 'rgba(20,26,48,.78)'; x.beginPath(); x.roundRect ? x.roundRect(6, 6, 500, 138, 28) : x.rect(6, 6, 500, 138); x.fill();
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.font = 'bold 50px system-ui,sans-serif'; x.fillText(c.navn, 256, 52);
      x.fillStyle = R[c.r].c; x.font = 'bold 36px system-ui,sans-serif'; x.fillText(R[c.r].n + ' · 💰 ' + fmt(PRICE(ci)) + ' · +' + fmt(INC(ci)) + '/s', 256, 108);
    }) }));
    s.scale.set(4.2, 1.23, 1); return s;
  }

  // =================== Gården ===================
  const visNiva = () => I.sp.testNiva || S.gard.niva;
  const plassPos = i => i < 36 ? I.plassPos(i) : I.takPlass(i - 36);
  const etasjeAv = i => Math.min(3, Math.floor(i / 12));
  let dyrG = null, plasserNa = [], aapneNa = 0;
  function fyllDyr() {
    if (!dyrG) return;
    // Sammenslåtte geometrier eies av plassvisningen og må frigjøres før de bygges på nytt (ellers lekker minne ved hvert salg)
    dyrG.traverse(o => { if (o.userData.egenGeo) o.geometry.dispose(); if (o.isInstancedMesh) o.dispose(); }); dyrG.clear();
    const deler = I.gamleFigurDeler(), m4 = new T.Matrix4(), V = T.Vector3, grupper = {}, enkle = [];
    for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) { const ci = S.base[i]; if (ci < 0) continue; const nn = I.nyNavnFor && I.nyNavnFor(ci), fi = nn ? 'n:' + nn : FIGUR[ci]; if (fi === undefined) enkle.push(i); else (grupper[etasjeAv(i) + '|' + fi] = grupper[etasjeAv(i) + '|' + fi] || []).push(i); }
    // Plassene viser alltid lav detalj. Delene uten tekstur (felles vertexfarge-materialer) slås sammen per etasje til én mesh per materiale,
    // så antall tegnekall ikke vokser med antall ulike matdyr. Teksturerte deler (glasur, vaffel, pasta) instanseres per figur.
    const felles = {};
    for (const [k, ids] of Object.entries(grupper)) {
      const [es, fi] = k.split('|'), e = +es; let eg = dyrG.children.find(c => c.userData.etasje === e && c.userData.figur === fi);
      if (!eg) { eg = new T.Group(); eg.userData.etasje = e; eg.userData.figur = fi; dyrG.add(eg); }
      const dd = fi.startsWith('n:') ? I.nyFigurDeler(fi.slice(2), 'plass') : deler[+fi].deler;
      const matr = ids.map(pi => { const p = plasserNa[pi]; return new T.Matrix4().compose(new V(p.x, p.y + 0.2, p.z), new T.Quaternion().setFromAxisAngle(new V(0, 1, 0), ((pi * 37) % 7 - 3) * 0.18), new V(1, 1, 1)); });
      for (const { geo, mat } of dd) {
        if (mat.userData && mat.userData.felles) { const nk = e + '|' + mat.uuid; (felles[nk] = felles[nk] || { e, mat, geos: [] }).geos.push(...matr.map(m => geo.clone().applyMatrix4(m))); continue; }
        const inst = new T.InstancedMesh(geo, mat, ids.length);
        matr.forEach((m, j) => inst.setMatrixAt(j, m));
        inst.castShadow = true; eg.add(inst);
      }
    }
    for (const { e, mat, geos } of Object.values(felles)) {
      const eg = new T.Group(); eg.userData.etasje = e; dyrG.add(eg);
      const m = new T.Mesh(EVNMiljo.flett(geos), mat); m.castShadow = true; m.userData.egenGeo = true; eg.add(m); geos.forEach(g => g.dispose());
    }
    // Ledige plasser får en lysegrønn ramme med pluss, så de skiller seg tydelig fra opptatte og låste plasser
    const ledige = []; for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) if (S.base[i] < 0) ledige.push(i);
    const perE = {}; ledige.forEach(i => (perE[etasjeAv(i)] = perE[etasjeAv(i)] || []).push(i));
    for (const [e, ids] of Object.entries(perE)) {
      const eg = new T.Group(); eg.userData.etasje = +e; dyrG.add(eg); const im = new T.InstancedMesh(ledigGeo(), ledigMat(), ids.length);
      ids.forEach((pi, j) => { const p = plasserNa[pi]; m4.makeTranslation(p.x, p.y + 0.21, p.z); im.setMatrixAt(j, m4); }); eg.add(im);
    }
    for (const i of enkle) { const eg = new T.Group(); eg.userData.etasje = etasjeAv(i); const ph = plassholder(S.base[i]), p = plasserNa[i]; ph.position.set(p.x, p.y + 0.2, p.z); eg.add(ph); dyrG.add(eg); }
  }
  let lgeo = null, lmat = null;
  function ledigGeo() {
    if (lgeo) return lgeo; const deler = [], b = (w, d, x, z) => { const g = new T.BoxGeometry(w, 0.06, d); g.translate(x, 0, z); deler.push(g.toNonIndexed()); };
    b(3.0, 0.2, 0, 1.4); b(3.0, 0.2, 0, -1.4); b(0.2, 2.6, 1.4, 0); b(0.2, 2.6, -1.4, 0); b(0.9, 0.22, 0, 0); b(0.22, 0.9, 0, 0);
    let n = 0; deler.forEach(g => n += g.attributes.position.count); const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    deler.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
    lgeo = new T.BufferGeometry(); lgeo.setAttribute('position', new T.BufferAttribute(pos, 3)); lgeo.setAttribute('normal', new T.BufferAttribute(nor, 3)); return lgeo;
  }
  const ledigMat = () => lmat || (lmat = new T.MeshStandardMaterial({ color: new T.Color('#62e08c').convertSRGBToLinear(), emissive: new T.Color('#2fae5c').convertSRGBToLinear(), emissiveIntensity: 0.55, roughness: 0.5 }));
  // Bare matdyrene tegnes på nytt når noe settes inn eller selges
  function oppdaterDyr() { I.settGjennom(99); fyllDyr(); I.forberedGjennom(); I.settGjennom(Math.max(0, I.sp.etasje)); }
  function byggSpillGard(beholdRobot) {
    const r0 = I.robot(), pos = beholdRobot && r0 ? r0.position.clone() : null, rot = r0 ? r0.rotation.y : 0, gd = I.gd;
    gd.niva = visNiva(); gd.neste = false; gd.gjennom = false; gd.aapne = plasserApne(); gd.eng = eng();
    gd.tegnDyr = (g, pl, ap) => { dyrG = new T.Group(); g.add(dyrG); plasserNa = pl; aapneNa = ap; fyllDyr(); };
    I.byggGard(); I.byggVegger(); I.forberedGjennom(); I.sp.etasje = -1;
    if (pos) { I.robot().position.copy(pos); I.robot().rotation.y = rot; }
  }

  // =================== Matdyrregnet ===================
  const feltG = new T.Group(); I.scene.add(feltG); feltG.visible = false;
  const felt = []; let nesteRegn = 1;
  // Matdyrene regner ned på enga foran gården, aldri inne på tunet
  // Åkeren ligger rett foran gården, fast plass og størrelse (60 × 32 m)
  const eng = () => ({ x0: -31, x1: 31, z0: 24, z1: 56 });
  function iFeltet(x, z) { const e = eng(); return x > e.x0 + 1.2 && x < e.x1 - 1.2 && z > e.z0 + 1.2 && z < e.z1 - 1.2; }
  function tilfeldigPunkt() { const e = eng(); return [e.x0 + 1.5 + Math.random() * (e.x1 - e.x0 - 3), e.z0 + 1.5 + Math.random() * (e.z1 - e.z0 - 3)]; }
  // Sjeldenheten trekkes med de vanlige vektene. Med bestillingsregn trekkes matdyret deretter blant artene neste gårdsnivå krever.
  function trekk() {
    const tot = R.reduce((s, r) => s + r.w, 0); let x = Math.random() * tot, r = 0;
    for (; r < R.length - 1; r++) { x -= R[r].w; if (x <= 0) break; }
    let pool = POOLS[r]; const k = GARDSNIVA[S.gard.niva + 1];
    if (k && Math.random() * 100 < S.bestilling) { const arter = k.krav.filter(([a, , min]) => a && r >= min).map(kr => kr[0]); const p2 = pool.filter(ci => arter.includes(COMBOS[ci].art)); if (p2.length) pool = p2; }
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function slippNed(ci, xz) {
    const [x, z] = xz || tilfeldigPunkt(), g = new T.Group(); g.position.set(x, xz ? 0 : 26, z);
    const m = modell(ci), lab = navneskilt(ci); lab.position.y = 3.9 + COMBOS[ci].r * 0.15; g.add(m, lab); feltG.add(g);
    felt.push({ ci, g, m, tilstand: xz ? 'gaa' : 'fall', retning: Math.random() * Math.PI * 2, fart: 1.2 + Math.random() * 0.8, snu: 2 + Math.random() * 3, alder: 0 });
  }
  function fjern(a) { feltG.remove(a.g); felt.splice(felt.indexOf(a), 1); }
  function oppdaterFelt(dt, t) {
    if ((nesteRegn -= dt) <= 0 && felt.length < 14) { slippNed(trekk()); nesteRegn = 1.2 + Math.random() * 0.8; }
    for (const a of [...felt]) {
      a.alder += dt; const p = a.g.position;
      if (a.tilstand === 'fall') { p.y -= dt * 16; if (p.y <= 0) { p.y = 0; a.tilstand = 'gaa'; } continue; }
      if (a.alder > 70) { fjern(a); continue; }
      if ((a.snu -= dt) <= 0) { a.retning += (Math.random() - 0.5) * 2.4; a.snu = 2 + Math.random() * 3; }
      const nx = p.x + Math.sin(a.retning) * a.fart * dt, nz = p.z + Math.cos(a.retning) * a.fart * dt;
      if (iFeltet(nx, nz)) { p.x = nx; p.z = nz; } else a.retning += Math.PI * (0.7 + Math.random() * 0.6);
      a.m.rotation.y = a.retning;
      if (a.m.userData.fig) { if (!I.REDUSERT) I.animerNy(a.m.userData.fig, t + a.alder, true); } else a.m.position.y = I.REDUSERT ? 0 : Math.abs(Math.sin(t * 7 + a.alder)) * 0.12;
    }
  }

  // =================== Handlinger: ta med, sett inn, selg, slipp ===================
  let bar = null, handling = null, handlingTekst = '';
  function naerPlass(p, tom, maks = 2.1) {
    let best = -1, bd = maks;
    for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) {
      if (tom !== (S.base[i] < 0)) continue; const q = plassPos(i);
      if (Math.abs(p.y - q.y) > 1.0) continue; const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  const harLedig = () => S.base.slice(0, aapneNa).includes(-1);
  function finnHandling() {
    const p = I.robot().position;
    if (bar) { const i = naerPlass(p, true); return i >= 0 ? { t: 'sett', i } : { t: 'slipp' }; }
    let best = null, bd = 3.2; for (const a of felt) { if (a.tilstand !== 'gaa' || p.y > 1) continue; const d = Math.hypot(a.g.position.x - p.x, a.g.position.z - p.z); if (d < bd) { bd = d; best = a; } }
    if (best) return { t: 'ta', a: best };
    const i = naerPlass(p, false, 1.8); return i >= 0 ? { t: 'selg', i } : null;
  }
  function visHandling() {
    const b = $('handling'), h = handling; let t = '', lav = false;
    if (h && h.t === 'ta') { const ci = h.a.ci, pr = PRICE(ci); if (S.penger < pr) { t = '🔒 Mangler 💰 ' + fmt(pr - S.penger); lav = true; } else if (!harLedig()) { t = '🔒 Ingen ledig plass'; lav = true; } else t = '🫳 Ta med ' + navn(ci) + ' (💰 ' + fmt(pr) + ')'; }
    else if (h && h.t === 'sett') t = '🏠 Sett inn ' + navn(bar.ci);
    else if (h && h.t === 'slipp') t = '⬇️ Slipp ' + navn(bar.ci);
    else if (h && h.t === 'selg') t = '💸 Selg ' + navn(S.base[h.i]);
    const full = t ? t + (I.TOUCH ? '' : ' (E)') + (lav ? '|lav' : '') : '';
    if (full === handlingTekst) return; handlingTekst = full;
    b.hidden = !t; b.textContent = t + (t && !I.TOUCH ? ' (E)' : ''); b.classList.toggle('lav', lav);
  }
  function gjorHandling() {
    const h = handling; if (!h || I.sp.pause) return;
    if (h.t === 'ta') {
      const ci = h.a.ci, pr = PRICE(ci);
      if (S.penger < pr) return melding('💰 Du mangler ' + fmt(pr - S.penger) + ' for å ta med ' + navn(ci) + '.');
      if (!harLedig()) return melding('🏠 Alle plassene er fulle. Selg et matdyr, eller kjøp flere plasser.');
      fjern(h.a); bar = { ci, m: modell(ci) }; bar.m.scale.setScalar(0.7); I.scene.add(bar.m);
      melding('Bær ' + navn(ci) + ' til en ledig plass i gården. Du betaler når du setter den inn.');
    } else if (h.t === 'sett') settInn(h.i);
    else if (h.t === 'slipp') { const ci = bar.ci; slippBar(); slippNed(ci); melding('⬇️ ' + navn(ci) + ' løp tilbake til enga.'); }
    else if (h.t === 'selg') apneSalg(h.i);
    handlingTekst = '';
  }
  function slippBar() { if (bar) { I.scene.remove(bar.m); bar = null; } }
  function settInn(i) {
    if (!bar || S.base[i] !== -1) return; const ci = bar.ci, pr = PRICE(ci);
    if (S.penger < pr) { slippBar(); slippNed(ci); return melding('💰 Du har ikke råd lenger, så matdyret løp tilbake til enga.'); }
    S.penger -= pr; S.base[i] = ci; const forst = !S.disc.includes(ci); if (forst) S.disc.push(ci); slippBar();
    I.spillAnim('Idle'); oppdaterDyr(); lagre();
    melding((forst ? '✨ Ny i Matdyrboka: ' : '🏠 ') + navn(ci) + ' flyttet inn i ' + I.etasjeNavn(plassPos(i).y).replace(' (bakken)', '') + '. Du betalte 💰 ' + fmt(pr) + '.');
  }

  // =================== Dialoger ===================
  let dialogForrige = null;
  function apneDialog(html, fokus) {
    const d = $('dialog'); $('dialogInnhold').innerHTML = html; d.hidden = false; document.body.classList.add('dialog');
    I.sp.pause = true; I.sp.taster = {}; I.sp.inn = { x: 0, z: 0 };
    if (!dialogForrige) dialogForrige = document.activeElement;
    const f = fokus && $(fokus) || d.querySelector('button'); if (f) f.focus();
  }
  function lukkDialog() { $('dialog').hidden = true; document.body.classList.remove('dialog'); I.sp.pause = false; laast = false; if (dialogForrige && dialogForrige.focus) dialogForrige.focus(); dialogForrige = null; }
  addEventListener('keydown', e => {
    if (I.fane() !== 'spill') return;
    if (!$('dialog').hidden) { if (e.key === 'Escape') { lukkDialog(); e.preventDefault(); } return; }
    if (e.key.toLowerCase() === 'e' && !e.repeat) gjorHandling();
  });
  function apneSalg(i) {
    const ci = S.base[i]; if (ci < 0) return;
    apneDialog('<h2>Selge ' + esc(navn(ci)) + '?</h2><p>' + esc(navn(ci)) + ' (' + R[COMBOS[ci].r].n + ') tjener 💵 ' + fmt(INC(ci)) + ' per sekund.</p><p>Du får 💰 ' + fmt(PRICE(ci) / 2) + '.</p><div class="knapper"><button type="button" id="dNei">Nei, behold</button><button type="button" id="dJa" class="fare">💸 Selg</button></div>', 'dNei');
    $('dNei').onclick = lukkDialog;
    $('dJa').onclick = () => { if (S.base[i] === ci) { S.penger += Math.floor(PRICE(ci) / 2); S.base[i] = -1; oppdaterDyr(); lagre(); melding('💸 Du solgte ' + navn(ci) + '.'); } lukkDialog(); };
  }

  // =================== Gårdsnivå ===================
  let valg = [], laast = false, gnStatus = '';
  const passer = kr => S.base.map((ci, i) => i).filter(i => { const ci = S.base[i]; return i < aapneNa && ci >= 0 && COMBOS[ci].r >= kr[2] && (kr[0] === null || COMBOS[ci].art === kr[0]); }).sort((a, b) => INC(S.base[a]) - INC(S.base[b]));
  const kravTekst = ([art, n, min]) => n + ' ' + (art ? ARTEMOJI[art] + ' ' + art : 'matdyr av valgfri art') + ' (' + R[min].n + (min >= 5 ? ')' : ' eller bedre)');
  // Forslag: de svakeste som passer. Bestemte arter fordeles før «valgfri art». Et matdyr som er sjeldnere enn kravet, velges aldri automatisk.
  function autoVelg() {
    const k = GARDSNIVA[S.gard.niva + 1]; valg = k.krav.map(() => []); const brukt = new Set();
    const ordre = k.krav.map((_, j) => j).sort((a, b) => (k.krav[a][0] === null) - (k.krav[b][0] === null));
    for (const j of ordre) { const kr = k.krav[j]; for (const i of passer(kr)) { if (valg[j].length >= kr[1]) break; if (!brukt.has(i) && COMBOS[S.base[i]].r === kr[2]) { valg[j].push(i); brukt.add(i); } } }
  }
  // Kontroll rett før oppgraderingen. Returnerer en feilmelding, eller null når alt stemmer.
  function kontroller(mal) {
    const k = GARDSNIVA[mal]; if (!k || S.gard.niva !== mal - 1) return 'Gårdsnivået er allerede endret.';
    const l = lesLagret(); if (l && l.gard.niva !== S.gard.niva) return 'Spillet er endret i en annen fane. Last siden på nytt.';
    const brukt = new Set();
    for (let j = 0; j < k.krav.length; j++) {
      const kr = k.krav[j], v = valg[j] || []; if (v.length !== kr[1]) return 'Velg ' + kravTekst(kr) + '.';
      for (const i of v) { const ci = S.base[i]; if (brukt.has(i) || !(i < aapneNa) || !(ci >= 0) || COMBOS[ci].r < kr[2] || (kr[0] && COMBOS[ci].art !== kr[0])) return 'Et valgt matdyr passer ikke lenger. Velg på nytt.'; brukt.add(i); }
    }
    if (S.penger < k.penger) return 'Du mangler 💰 ' + fmt(k.penger - S.penger) + '.';
    return null;
  }
  function apneGardsniva() { oppdaterKort(); oppdaterPanel(); gnStatus = ''; if (S.gard.niva < MAKS) autoVelg(); visGardsniva(); }
  function visGardsniva() {
    const n = S.gard.niva;
    if (n >= MAKS) { apneDialog('<h2>🏡 Gårdsnivå ' + n + '</h2><p>Du har maks gårdsnivå! 🎉 ' + esc(I.NIVA[n].nytt) + '.</p><div class="knapper"><button type="button" id="dLukk">Lukk</button></div>'); $('dLukk').onclick = lukkDialog; return; }
    const k = GARDSNIVA[n + 1], alleOk = !kontroller(n + 1);
    let h = '<h2>🏡 Gårdsnivå ' + n + ' → ' + (n + 1) + '</h2><p class="liten">Du får: ' + esc(I.NIVA[n + 1].nytt) + '. Plass-taket blir ' + k.tak + (k.tak > tak(S) ? ' (i dag ' + tak(S) + ')' : '') + '.</p><p class="liten">Lever inn disse matdyrene fra gården. Trykk for å bytte.</p>';
    k.krav.forEach((kr, j) => {
      const kand = passer(kr), v = valg[j], ok = v.length === kr[1];
      h += '<div class="krav' + (ok ? ' ok' : '') + '"><div class="kravtopp"><span>' + (ok ? '✅' : '⬜') + ' ' + esc(kravTekst(kr)) + '</span><span>' + v.length + '/' + kr[1] + '</span></div><div class="brikker">';
      if (!kand.length) h += '<span class="liten">Ingen i gården ennå. Se etter dem i regnet.</span>';
      kand.forEach(i => { const ci = S.base[i], annen = valg.some((vv, jj) => jj !== j && vv.includes(i)); h += '<button type="button" class="brikke" data-j="' + j + '" data-i="' + i + '" aria-pressed="' + v.includes(i) + '"' + (annen ? ' disabled title="Valgt til et annet krav"' : '') + '>' + esc(navn(ci)) + ' <span class="sjb" style="background:' + R[COMBOS[ci].r].c + '">' + R[COMBOS[ci].r].n + '</span> · ' + esc(I.etasjeNavn(plassPos(i).y).replace(' (bakken)', '')) + '</button>'; });
      h += '</div></div>';
    });
    const pengerOk = S.penger >= k.penger;
    h += '<div class="krav' + (pengerOk ? ' ok' : '') + '"><div class="kravtopp"><span>' + (pengerOk ? '✅' : '⬜') + ' 💰 ' + fmt(k.penger) + '</span><span>Du har 💰 ' + fmt(S.penger) + '</span></div></div>';
    if (gnStatus) h += '<p class="status" role="alert">' + esc(gnStatus) + '</p>';
    h += '<div class="knapper"><button type="button" id="dLukk">Lukk</button><button type="button" id="dVidere" class="hoved"' + (alleOk ? '' : ' disabled') + '>Gå videre</button></div>';
    apneDialog(h, 'dLukk');
    $('dLukk').onclick = lukkDialog; $('dVidere').onclick = visBekreft;
    document.querySelectorAll('.brikke').forEach(b => b.onclick = () => {
      const j = +b.dataset.j, i = +b.dataset.i, kr = k.krav[j], v = valg[j];
      if (v.includes(i)) v.splice(v.indexOf(i), 1); else if (v.length < kr[1]) v.push(i); else { gnStatus = 'Du har valgt nok til dette kravet. Trykk på et valgt matdyr for å fjerne det.'; return visGardsniva(); }
      gnStatus = ''; visGardsniva(); const ny = document.querySelector('.brikke[data-j="' + j + '"][data-i="' + i + '"]'); if (ny) ny.focus();
    });
  }
  function visBekreft() {
    const n = S.gard.niva, k = GARDSNIVA[n + 1], inn = valg.flat(), igjen = S.base.slice(0, aapneNa).filter((ci, i) => ci >= 0 && !inn.includes(i)).length;
    let h = '<h2>Oppgrader gården?</h2><div class="del"><b>Du leverer inn</b><ul>' + inn.map(i => '<li>' + esc(navn(S.base[i])) + ' (' + R[COMBOS[S.base[i]].r].n + ')</li>').join('') + '<li>💰 ' + fmt(k.penger) + '</li></ul></div>';
    h += '<div class="del"><b>Du får</b><ul><li>Gårdsnivå ' + (n + 1) + '</li><li>' + esc(I.NIVA[n + 1].nytt) + '</li><li>Plass-tak ' + k.tak + '</li></ul></div>';
    h += '<div class="del"><b>Du beholder</b><ul><li>' + igjen + ' matdyr i gården</li><li>💰 ' + fmt(S.penger - k.penger) + '</li></ul></div>';
    h += '<div class="knapper"><button type="button" id="dTilbake">Tilbake</button><button type="button" id="dJa" class="hoved">✅ Oppgrader gården</button></div>';
    apneDialog(h, 'dTilbake'); $('dTilbake').onclick = () => visGardsniva(); $('dJa').onclick = e => oppgrader(e.currentTarget);
  }
  // Sikker oppgradering: knappen låses, alt kontrolleres på nytt, ny tilstand lagres først og tas i bruk bare hvis lagringen lyktes
  function oppgrader(knappEl) {
    if (laast) return false; laast = true; if (knappEl) knappEl.disabled = true;
    const mal = S.gard.niva + 1, feil = kontroller(mal);
    if (feil) { laast = false; gnStatus = feil; visGardsniva(); return false; }
    const k = GARDSNIVA[mal], ny2 = JSON.parse(JSON.stringify(S));
    valg.flat().forEach(i => { ny2.base[i] = -1; }); ny2.penger -= k.penger; ny2.gard.niva = mal;
    if (!lagre(ny2)) { laast = false; gnStatus = 'Spillet kunne ikke lagres, så ingenting er endret. Prøv igjen.'; visGardsniva(); return false; }
    S = ny2; fyllBase(); lukkDialog(); laast = true; byggSpillGard(true); oppdaterPanel(); laast = false;
    melding('🎉 Gårdsnivå ' + mal + '! ' + I.NIVA[mal].nytt + '.', 6); I.spillAnim('Idle');
    return true;
  }

  // =================== Skjerm: kort, panel og meldinger ===================
  let meldingTid = 0;
  function melding(t, sek = 4) { const m = $('melding'); m.textContent = t; m.hidden = false; meldingTid = sek; }
  const inntekt = () => S.base.slice(0, aapneNa).reduce((s, ci) => s + (ci >= 0 ? INC(ci) : 0), 0);
  function visKort() {
    $('kort').innerHTML = '<div class="hud"><b id="hPenger"></b> <span id="hInnt" class="liten2"></span></div><div class="hud2"><span id="hNiva"></span> · <span id="hPlass"></span></div>' +
      '<div class="liten">' + (I.TOUCH ? 'Styrespak: gå · Hopp nede til høyre · Handling ved siden av · Dra for kamera.' : 'WASD: gå · Mellomrom: hopp · E: handling · Dra med musa: kamera · Hjul: zoom') + '</div><div id="spillStatus" class="rute">📍 1. etasje (bakken)</div>';
    oppdaterKort();
  }
  function oppdaterKort() {
    if (!$('hPenger')) return;
    $('hPenger').textContent = '💰 ' + fmt(S.penger); $('hInnt').textContent = '+' + fmt(inntekt()) + '/s';
    $('hNiva').textContent = '🏡 Gårdsnivå ' + S.gard.niva + (I.sp.testNiva ? ' (viser ' + I.sp.testNiva + ')' : '');
    $('hPlass').textContent = '🐮 ' + S.base.slice(0, aapneNa).filter(c => c >= 0).length + '/' + plasserApne() + ' plasser';
  }
  let visTest = false;
  function byggPanel() {
    const p = $('panel'); p.textContent = ''; const r1 = document.createElement('div'); r1.className = 'rad';
    const smal = innerWidth < 640; r1.append(I.knapp(smal ? '🏡 Nivå' : '🏡 Gårdsnivå', false, apneGardsniva, 'Gårdsnivå'), Object.assign(I.knapp('', false, kjopPlass), { id: 'bPlass' }), I.knapp('🧪', visTest, () => { visTest = !visTest; byggPanel(); }, 'Testvalg for prototypen'));
    p.append(r1);
    if (visTest) {
      const r2 = document.createElement('div'); r2.className = 'rad test';
      [0, 10, 15].forEach(v => r2.append(I.knapp('Bestilling ' + v + ' %', S.bestilling === v, () => { S.bestilling = v; lagre(); byggPanel(); }, 'Bestillingsregn ' + v + ' prosent')));
      r2.append(I.knapp('+💰 100 000', false, () => { S.penger += 1e5; lagre(); }), I.knapp('+💰 100 mill', false, () => { S.penger += 1e8; lagre(); }),
        I.knapp('🎁 Dyr til neste nivå', false, giKravdyr), I.knapp('↺ Nullstill', false, nullstill));
      p.append(r2);
    }
    oppdaterPanel();
  }
  function oppdaterPanel() {
    const b = $('bPlass'); if (!b) return; const l = S.plassNiva, full = plasserApne() >= tak(S), pr = plassPris(l);
    const ord = innerWidth < 640 ? 'Plasser' : 'Flere plasser';
    const t = full ? (S.gard.niva >= MAKS ? '🐮 Alle åpne' : '🔒 ' + ord + ': øk nivået') : (S.penger >= pr ? '⬆️ ' + ord + ' 💰 ' + fmt(pr) : '🔒 ' + ord + ' 💰 ' + fmt(pr));
    if (b.textContent !== t) b.textContent = t;
  }
  function kjopPlass() {
    if (plasserApne() >= tak(S)) return melding(S.gard.niva >= MAKS ? 'Alle plassene er åpne.' : '🏡 Gården er full. Øk gårdsnivået for å få plass til flere.');
    const pr = plassPris(S.plassNiva); if (S.penger < pr) return melding('💰 Du mangler ' + fmt(pr - S.penger) + ' for flere plasser.');
    S.penger -= pr; S.plassNiva++; fyllBase(); lagre(); byggSpillGard(true); oppdaterPanel(); melding('🎉 Gården har nå ' + plasserApne() + ' plasser!');
  }
  // Test: setter matdyr som passer kravene til neste nivå inn på ledige plasser
  function giKravdyr() {
    const k = GARDSNIVA[S.gard.niva + 1]; if (!k) return melding('Du har maks gårdsnivå.');
    let lagt = 0;
    for (const [art, n, min] of k.krav) for (let m = 0; m < n; m++) {
      const i = S.base.indexOf(-1); if (i < 0) break;
      const ci = COMBOS.findIndex((c, x) => c.r === min && (!art || c.art === art) && !S.base.includes(x)); if (ci >= 0) { S.base[i] = ci; lagt++; }
    }
    oppdaterDyr(); lagre(); melding(lagt ? '🎁 La inn ' + lagt + ' testdyr.' : 'Ingen ledige plasser. Kjøp flere plasser eller selg et matdyr.');
  }
  function nullstill() {
    apneDialog('<h2>Nullstille prototypen?</h2><p>Penger, matdyr og gårdsnivå i prototypen slettes. Det ekte spillet berøres ikke.</p><div class="knapper"><button type="button" id="dNei">Avbryt</button><button type="button" id="dJa" class="fare">Nullstill</button></div>', 'dNei');
    $('dNei').onclick = lukkDialog;
    $('dJa').onclick = () => { S = ny(); fyllBase(); lagre(); slippBar(); [...felt].forEach(fjern); lukkDialog(); I.sp.testNiva = 0; startSpill(); byggPanel(); };
  }

  // =================== Kobling til visningen ===================
  function startSpill() {
    byggSpillGard(false);
    const r = I.robot(); if (visNiva() >= 3) r.position.set(I.A, 0, I.HZ + 7); else r.position.set(6, 0, I.HZ + 4.5);   // på nivå 1–2 står gjerdet nærmere r.rotation.y = Math.PI; I.sp.vy = 0; I.sp.paaBakken = true; I.sp.etasje = -1;
    Object.assign(I.bane, { teta: 0, fi: 1.12, r: innerWidth < 640 ? 18 : 15, rMin: 6, rMax: 40, auto: false });
    visKort();
  }
  let lagreTid = 0, kortTid = 0;
  I.krok.start = startSpill;
  I.krok.panel = byggPanel;
  I.krok.fane = f => { feltG.visible = f === 'spill'; if (f !== 'spill') { slippBar(); $('handling').hidden = true; handlingTekst = ''; $('melding').hidden = true; lagre(); if (!$('dialog').hidden) lukkDialog(); } };
  I.krok.steg = (dt, t) => {
    if (I.sp.pause) return;
    oppdaterFelt(dt, t);
    S.penger += inntekt() * dt;
    const r = I.robot();
    if (bar && r) { bar.m.position.set(r.position.x, r.position.y + 3.3, r.position.z); bar.m.rotation.y = r.rotation.y; if (bar.m.userData.fig && !I.REDUSERT) I.animerNy(bar.m.userData.fig, t, false); const i = naerPlass(r.position, true, 1.4); if (i >= 0) settInn(i); }
    handling = r ? finnHandling() : null; visHandling();
    if ((kortTid -= dt) <= 0) { kortTid = 0.25; oppdaterKort(); oppdaterPanel(); }
    if ((lagreTid -= dt) <= 0) { lagreTid = 5; lagre(); }
    if (meldingTid > 0 && (meldingTid -= dt) <= 0) $('melding').hidden = true;
  };
  $('handling').addEventListener('click', gjorHandling);
  $('dialog').addEventListener('click', e => { if (e.target.id === 'dialog') lukkDialog(); });
  addEventListener('pagehide', () => lagre());
  document.addEventListener('visibilitychange', () => { if (document.hidden) lagre(); });

  // For automatiske tester (lagring, oppgradering, dobbelttrykk og flere faner)
  window.EVNProto = { NOKKEL, S: () => S, sett: s => { S = rens(s) || ny(); fyllBase(); byggSpillGard(true); oppdaterKort(); oppdaterPanel(); }, lagre, lesLagret, kontroller, apneGardsniva, oppgrader, autoVelg, valg: () => valg, felt: () => felt, slippNed, bar: () => bar, finnHandling, gjorHandling, rens, plasserApne };
})();
