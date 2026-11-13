/* Matdyr-regn fase 2, trinn 3: spillbar prototype.
   Matdyr regner ned, roboten tar dem med og setter dem på plassene i gården, plassene gir inntekt,
   og Gårdsnivå-menyen leverer inn matdyr og bygger gården ut.
   Egen lagring (evn-matdyr-gard-proto). Produksjonslagringen leses ikke. Ingen E-coins og ingen statistikk. */
(function () {
  'use strict';
  const I = window.EVNIntern, D = window.EVNMatdyrData, T = THREE, $ = id => document.getElementById(id);
  const { R, COMBOS, POOLS, PRICE, INC, GARDSNIVA, plassPris, ARTEMOJI, FORDELING, GML_R, PRICEr, INCr, ANIMALS, FOODS } = D;
  // ?fordeling=c (alternativ C): egen testlagring. Standardlagringen leses bare én gang for å migreres, og skrives aldri.
  const ERC = FORDELING === 'c', NOKKEL_STD = 'evn-matdyr-gard-proto';
  const NOKKEL = ERC ? 'evn-matdyr-gard-proto-c' : NOKKEL_STD, MAKS = 10;
  // Matdyr som har ferdig 3D-figur (ID → indeks i I.NOKLER). Croissantrev er bare en stiltest uten ID.
  const FIGUR = { 127: 0, 508: 1, 700: 2, 259: 4 };
  const fmt = n => { n = Math.floor(n); return n >= 1e9 ? +(n / 1e9).toFixed(1) + ' mrd' : n >= 1e6 ? +(n / 1e6).toFixed(1) + ' mill' : n.toLocaleString('nb-NO'); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const navn = ci => COMBOS[ci].navn;

  // =================== Tilstand og lagring ===================
  const ny = () => Object.assign({ v: 1, penger: 60, gard: { niva: 1 }, plassNiva: 0, base: [], disc: [], bestilling: 15 }, ERC ? { fordeling: 'c', arv: {} } : {});
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
    if (Number.isFinite(s.kasse) && s.kasse > 0) o.kasse = Math.min(s.kasse, 1e15);   // penger som venter i innsamlingssonen
    if (ERC) {   // arvet kategori per plass (streng bestefarsregel). Bare gyldige avvik fra den nye tabellen beholdes.
      const a = s.arv && typeof s.arv === 'object' && !Array.isArray(s.arv) ? s.arv : {};
      for (const [k, r] of Object.entries(a)) { const i = +k, ci = o.base[i]; if (/^\d+$/.test(k) && ci >= 0 && Number.isInteger(r) && r >= 0 && r < R.length && r !== COMBOS[ci].r) o.arv[i] = r; }
      if (typeof s.migrert === 'string') o.migrert = s.migrert;
    }
    return o;
  }
  // Migrering fra standardlagringen (gammel fordeling) til alternativ C. Eide dyr beholder gammel kategori, pris og inntekt.
  // Penger, gårdsnivå, plasser og alle funn (disc) beholdes uendret. Kilden endres ikke.
  function migrerStd(s) {
    if (!s || s.fordeling === 'c') return null;
    const o = rens(Object.assign({}, s, { arv: {} })); if (!o) return null;
    o.base.forEach((ci, i) => { if (ci >= 0 && GML_R[ci] !== COMBOS[ci].r) o.arv[i] = GML_R[ci]; });
    o.migrert = 'standard ' + new Date().toISOString().slice(0, 10); return o;
  }
  function lesLagret() {
    let raw = null; try { raw = localStorage.getItem(NOKKEL); } catch (e) { return null; }
    let o = null; try { o = rens(JSON.parse(raw || 'null')); } catch (e) {}
    // Fordeling C: en ødelagt testlagring tas vare på før den kan bli overskrevet
    if (ERC && raw && !o) try { localStorage.setItem(NOKKEL + '-ugyldig', raw); } catch (e) {}
    return o;
  }
  function lagre(s = S) { try { const t = JSON.stringify(s); localStorage.setItem(NOKKEL, t); return localStorage.getItem(NOKKEL) === t; } catch (e) { return false; } }
  function fyllBase(s = S) { while (s.base.length < plasserApne(s)) s.base.push(-1); }
  function hentStandard() { try { return migrerStd(JSON.parse(localStorage.getItem(NOKKEL_STD) || 'null')); } catch (e) { return null; } }
  { let l = lesLagret(); if (!l && ERC) { l = hentStandard(); if (l) lagre(l); } if (l) S = l; fyllBase(); }
  // Effektiv kategori, inntekt og pris for dyret på plass i (arvet kategori går foran den nye tabellen)
  const arvet = i => ERC && S.arv && Number.isInteger(S.arv[i]);
  const rB = i => { const ci = S.base[i]; return ci >= 0 ? (arvet(i) ? S.arv[i] : COMBOS[ci].r) : -1; };
  const incB = i => { const ci = S.base[i]; return ci >= 0 ? INCr(ci, rB(i)) : 0; };
  const prisB = i => { const ci = S.base[i]; return ci >= 0 ? PRICEr(ci, rB(i)) : 0; };
  const ryddArv = (i, s = S) => { if (s.arv) delete s.arv[i]; };
  const eldre = i => arvet(i) ? ' ⏳ eldre utgave' : '';

  // =================== Figurer ===================
  const kuleGeo = new T.SphereGeometry(0.85, 20, 14), kuleMat = {};
  const rMat = r => kuleMat[r] || (kuleMat[r] = new T.MeshStandardMaterial({ color: new T.Color(R[r].c).convertSRGBToLinear(), roughness: 0.45 }));
  const teksturer = {};
  function tekstur(nokkel, b, h, tegn) { if (teksturer[nokkel]) return teksturer[nokkel]; const cv = document.createElement('canvas'); cv.width = b; cv.height = h; tegn(cv.getContext('2d')); const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; return (teksturer[nokkel] = t); }
  const EMOJIFONT = 'system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  // Matdyr uten ferdig figur vises som en kule i sjeldenhetsfargen med dyr og mat over
  function plassholder(ci, r) {
    const g = new T.Group(), c = COMBOS[ci];
    const k = new T.Mesh(kuleGeo, rMat(r ?? c.r)); k.position.y = 0.85; k.castShadow = true; g.add(k);
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
    for (const i of enkle) { const eg = new T.Group(); eg.userData.etasje = etasjeAv(i); const ph = plassholder(S.base[i], rB(i)), p = plasserNa[i]; ph.position.set(p.x, p.y + 0.2, p.z); eg.add(ph); dyrG.add(eg); }
    // Fordeling C: Food God og Secret i gården får tilbehøret fra toppsettet (krone/glorie, ring, gnister). Figurene selv er slått sammen.
    basePynt = [];
    if (ERC && window.EVNToppsett) for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) { const r = rB(i); if (r < 5) continue;
      const eg = new T.Group(); eg.userData.etasje = etasjeAv(i); const pg = EVNToppsett.pynt(r, 2.6, 1.1), p = plasserNa[i]; pg.position.set(p.x, p.y + 0.2, p.z); eg.add(pg); dyrG.add(eg); basePynt.push(pg.userData.topp); }
  }
  let basePynt = [];
  // Fordeling C: særpreg på Food God og Secret som faller og bæres
  const toppsett = (m, ci) => ERC && window.EVNToppsett && COMBOS[ci].r >= 5 ? EVNToppsett.bruk(m, COMBOS[ci].r) : null;
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
  // Når de tobeinte modellene er lastet etter oppstart, tegnes gården på nytt med dem.
  document.addEventListener('evn-tobein-klar', () => { if (dyrG) oppdaterDyr(); });
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
  // Matdyrene lander i starten av åkeren (vest) og vandrer fritt rundt. Når tiden deres er ute, søker de gradvis mot porten i øst,
  // hver langs sin egen rute og gjennom sitt eget punkt i portåpningen. Utenfor går de et stykke ut mellom buskene og tones bort der.
  const port = () => { const e = eng(); return { x: e.x1, z: (e.z0 + e.z1) / 2, halv: I.PORT_HALV || 3.4 }; };
  // Landingspunkt i vest, helst med god avstand til matdyr som allerede står der (så de ikke lander oppå hverandre)
  function tilfeldigPunkt() {
    const e = eng(); let best = null, bd = -1;
    for (let i = 0; i < 24; i++) {
      const x = e.x0 + 2 + Math.random() * 16, z = e.z0 + 2.5 + Math.random() * (e.z1 - e.z0 - 5);
      const d = felt.reduce((m, a) => Math.min(m, Math.hypot(a.g.position.x - x, a.g.position.z - z)), 99);
      if (d > bd) { bd = d; best = [x, z]; } if (d > 3.2) break;
    }
    return best;
  }
  // Sjeldenheten trekkes med de vanlige vektene. Med bestillingsregn trekkes matdyret deretter blant artene neste gårdsnivå krever.
  // Bestillingsgaranti (spilltest, Ivar 9.11.2026): har 6 matdyr i rad falt uten et som neste gårdsnivå fortsatt trenger,
  // blir det neste et slikt (riktig art og minst riktig sjeldenhet). Kan slås av under 🧪. Lagres ikke.
  let garanti = true, utenKrav = 0;
  const trengs = () => { const k = GARDSNIVA[S.gard.niva + 1]; return k && k.krav ? k.krav.filter(kr => kr[0] && passer(kr).length < kr[1]) : []; };
  const passerKrav = (ci, kr) => COMBOS[ci].art === kr[0] && COMBOS[ci].r >= kr[2];
  // Fordeling C:
  //  - Bestillingsregn 0 % betyr ingen styring i det hele tatt, heller ikke garanti.
  //  - Garantien gjelder bare krav opp til Legendary, og løfter aldri over det. Krav om Mythic, Food God eller Secret får ingen garanti
  //    (ellers ble hver Food God på vei til nivå 10 styrt til Óðinn, og Óðinn-kallet ville vært uten betydning; QA 5045c62 funn 1).
  //  - Óðinn-kallet (synlig regel i Gårdsnivå-vinduet): på vei til nivå 10, med 3 ulike Food God funnet, blir neste Food God som faller, Óðinn.
  const ODIN = COMBOS.findIndex(c => c.special === 'Óðinn'), KALL = 3;
  const kallFunnet = () => new Set(S.disc.filter(ci => COMBOS[ci].r === 5 && ci !== ODIN)).size;
  const kallAktiv = () => ERC && S.gard.niva === MAKS - 1 && trengs().some(kr => kr[0] === COMBOS[ODIN].art && kr[2] === 5);
  const kallKlart = () => kallAktiv() && kallFunnet() >= KALL;
  function trekk() {
    const tot = R.reduce((s, r) => s + r.w, 0); let x = Math.random() * tot, r = 0;
    for (; r < R.length - 1; r++) { x -= R[r].w; if (x <= 0) break; }
    let pool = POOLS[r], styrt = false; const k = GARDSNIVA[S.gard.niva + 1], mangler = trengs(), styring = !ERC || S.bestilling > 0;
    if (ERC && r === 5 && kallKlart()) { pool = [ODIN]; styrt = true; }
    const garKrav = ERC ? mangler.filter(kr => kr[2] <= 3) : mangler;
    if (!styrt && garanti && styring && garKrav.length && utenKrav >= 6) {
      const kr = garKrav[Math.floor(Math.random() * garKrav.length)]; if (!ERC) styrt = true;   // standard: som før (garanti eller bestilling, aldri begge)
        for (let rr = Math.max(r, kr[2]); rr < POOLS.length; rr++) { const p2 = POOLS[rr].filter(ci => COMBOS[ci].art === kr[0]); if (p2.length) { pool = p2; styrt = true; break; } }
    }
    if (!styrt && k && Math.random() * 100 < S.bestilling) { const arter = k.krav.filter(([a, , min]) => a && r >= min).map(kr => kr[0]); const p2 = pool.filter(ci => arter.includes(COMBOS[ci].art)); if (p2.length) pool = p2; }
    const ci = pool[Math.floor(Math.random() * pool.length)];
    utenKrav = mangler.some(kr => passerKrav(ci, kr)) ? 0 : utenKrav + 1;
    return ci;
  }
  function slippNed(ci, xz) {
    const [x, z] = xz || tilfeldigPunkt(), g = new T.Group(); g.position.set(x, xz ? 0 : 26, z);
    const m = modell(ci), lab = navneskilt(ci), topp = toppsett(m, ci); lab.position.y = 3.9 + COMBOS[ci].r * 0.15; lab.material.transparent = true; g.add(m, lab); feltG.add(g);
    if (topp && !xz) melding(COMBOS[ci].r === 6 ? '🌌 Noe hemmelig faller fra himmelen …' : '⭐ En Food God faller fra himmelen!', 4);
    felt.push({ ci, g, m, lab, topp, tilstand: xz ? 'gaa' : 'fall', retning: Math.random() * Math.PI * 2, fart: (1.2 + Math.random() * 0.8) * (I.GANGFART || 1),
      tid: 10 + Math.random() * 9,            // så lenge matdyret vandrer fritt før det begynner å søke mot porten (s)
      side: Math.random() < 0.5 ? -1 : 1,      // foretrukket side å gå rundt hindringer på, så to matdyr ikke speiler hverandre
      alder: 0, fase: Math.random(), v: 0, vx: 0, vz: 0, labA: 1, beite: 0, fast: 0, robotFast: 0 });
  }
  function fjern(a) { feltG.remove(a.g); felt.splice(felt.indexOf(a), 1); }

  // ---------- Navigasjon ----------
  // Lovlige områder (sentrum av matdyret): inne på åkeren, i portåpningen og ute i landskapet øst for porten.
  // Områdene henger bare sammen gjennom porten, og et steg er mye kortere enn avstanden over gjerdet, så ingen kan gå gjennom gjerdet.
  const RADIUS = 1.05, LANG = 120;
  function lovlig(x, z, inne) {
    const e = eng(), po = port(), dz = Math.abs(z - po.z);
    if (x > e.x0 + 1.2 && x < e.x1 - 1.2 && z > e.z0 + 1.2 && z < e.z1 - 1.2) return true;
    if (inne) return false;   // et matdyr som fortsatt vandrer, holder seg inne på åkeren
    if (x >= e.x1 - 1.6 && x <= e.x1 + 2.6 && dz < po.halv - 1.25) return true;
    return x >= e.x1 + 1.6 && x < e.x1 + 26 && dz < 15;
  }
  // Faste hindringer utenfor åkeren: portstolpene og buskene i landskapet (samme liste som visningen tegner)
  const fasteHindre = () => { const po = port(); return [{ x: po.x + 0.6, z: po.z - po.halv, r: 0.25 }, { x: po.x + 0.6, z: po.z + po.halv, r: 0.25 }, ...(I.UTBUSKER || []).map(b => ({ x: b.x, z: b.z, r: 0.9 * b.s }))]; };
  function nyttVandremaal(a) {
    const e = eng(), p = a.g.position;
    a.mal = { x: Math.max(e.x0 + 3, Math.min(e.x1 - 4, p.x - 10 + Math.random() * 24)), z: e.z0 + 3 + Math.random() * (e.z1 - e.z0 - 6) };
  }
  // Personlig rute ut: et mellompunkt et stykke vest for porten og et eget punkt i portåpningen, og et mål ute i landskapet
  function nyUtrute(a) {
    const e = eng(), po = port(), p = a.g.position;
    a.via = p.x < e.x1 - 10 ? { x: e.x1 - 6 - Math.random() * 7, z: Math.max(e.z0 + 3, Math.min(e.z1 - 3, po.z + (Math.random() * 2 - 1) * 9)) } : null;
    a.portZ = po.z + (Math.random() * 2 - 1) * (po.halv - 1.4);
    a.ute = I.GROFT ? { x: I.GROFT_X1 + 1.2, z: I.GROFT_Z + (Math.random() * 2 - 1) * 1.6 } : { x: e.x1 + 13 + Math.random() * 7, z: po.z + (Math.random() * 2 - 1) * 10 };
  }
  // Prøvebasert styring: matdyret prøver noen få retninger rundt den ønskede og velger den som gir minst kollisjon,
  // med litt straff for å vike av. Andre matdyr regnes med der de vil være om et øyeblikk (fart × tid).
  const AVVIK = [0, 0.4, -0.4, 0.8, -0.8, 1.25, -1.25, 1.8, -1.8, 2.4, -2.4];
  function styr(a, onsket, hindre) {
    const p = a.g.position; let best = null;
    for (const o0 of AVVIK) {
      const o = o0 * a.side, h = onsket + o, sx = Math.sin(h), sz = Math.cos(h); let k = Math.abs(o) * 0.9, treff = null, naer = 0;
      for (const tau of [0.4, 0.9, 1.6]) {
        const qx = p.x + sx * a.fart * tau, qz = p.z + sz * a.fart * tau, vekt = 1.6 / (0.6 + tau);
        if (!lovlig(qx, qz, a.inneL)) { k += 5 * vekt; if (tau < 0.5) naer = 9; continue; }
        for (const b of hindre) {
          const bx = b.x + (b.vx || 0) * tau, bz = b.z + (b.vz || 0) * tau, min = RADIUS + b.r, d = Math.hypot(qx - bx, qz - bz);
          if (d < min) { const pen = (min - d) / min * 4 * vekt; k += pen; if (tau < 0.5) naer = Math.max(naer, pen); if (!treff || pen > treff.pen) treff = { b, pen }; }
        }
      }
      if (!best || k < best.k) best = { h, k, naer, treff, o };
      if (o0 === 0) a.forsteTreff = treff && treff.b;
    }
    return best;
  }
  // Landingssted bak roboten: lovlig hele veien (gjerdet krysses aldri) og med plass til matdyret. Uten ledig sted venter matdyret.
  function planleggHopp(a, rp, hindre) {
    const p = a.g.position, dx = rp.x - p.x, dz = rp.z - p.z, d = Math.hypot(dx, dz) || 1, L = d + 2.3;
    for (const v of [0, 0.35, -0.35, 0.7, -0.7]) {
      const r = Math.atan2(dx, dz) + v * a.side, x1 = p.x + Math.sin(r) * L, z1 = p.z + Math.cos(r) * L;
      let ok = lovlig(x1 + 0.3, z1, a.inneL) && lovlig(x1 - 0.3, z1, a.inneL) && lovlig(x1, z1 + 0.3, a.inneL) && lovlig(x1, z1 - 0.3, a.inneL);   // landingsstedet har litt margin
      for (let k = 1; k <= 6 && ok; k++) ok = lovlig(p.x + (x1 - p.x) * k / 6, p.z + (z1 - p.z) * k / 6, a.inneL);
      if (!ok || Math.hypot(rp.x - x1, rp.z - z1) < 2.0 || hindre.some(h => h.vx !== undefined && Math.hypot(h.x - x1, h.z - z1) < 2 * RADIUS + 0.2)) continue;
      return { fase: 'sats', t: 0, x0: p.x, z0: p.z, x1, z1, h: 2.4, T: 0.55 + L * 0.06 };
    }
    return null;
  }
  let dyttMelding = 0;
  function oppdaterFelt(dt, t) {
    // Høyst 14 matdyr på åkeren. De som er på vei bort i landskapet, teller ikke.
    if ((nesteRegn -= dt) <= 0 && felt.filter(a => a.tilstand === 'gaa' || a.tilstand === 'fall').length < 14) { slippNed(trekk()); nesteRegn = 1.2 + Math.random() * 0.8; }
    dyttMelding -= dt;
    const e = eng(), po = port(), r = I.robot && I.robot(), rp = r && r.position.y < 1 ? r.position : null, faste = fasteHindre();
    for (const a of [...felt]) {
      a.alder += dt; const p = a.g.position; if (a.topp) a.topp.oppdater(t);
      if (a.tilstand === 'fall') { p.y -= dt * 16; if (p.y <= 0) { p.y = 0; a.tilstand = 'gaa'; } continue; }
      // Et matdyr som er sluppet på tunet (utenfor åkeren) blir stående. Etter 4 minutter krymper det bort der.
      if (a.tilstand === 'gaa' && !a.hopp && !lovlig(p.x, p.z)) { a.vFaktisk = 0; if (a.alder > 240) a.tilstand = 'krymp'; else { animer(a, t, false); continue; } }
      if (a.tilstand === 'krymp') { a.krymp = (a.krymp ?? 1) - dt * 0.8; if (a.krymp <= 0) fjern(a); else a.g.scale.setScalar(a.krymp); continue; }
      // Tonas bort ute i landskapet: krymper rolig mens det fortsatt går
      if (a.tilstand === 'borte') { a.krymp = (a.krymp ?? 1) - dt * 0.5; if (a.krymp <= 0) { fjern(a); continue; } a.g.scale.setScalar(Math.max(0.01, a.krymp)); }
      // ---- Ønsket retning ----
      const lyst = a.tilstand === 'gaa' ? Math.max(0, Math.min(1, (a.alder - a.tid) / 8)) : 1;   // 0 = vandrer fritt, 1 = vil ut
      if ((lyst > 0 || a.tilstand !== 'gaa') && !a.ute) nyUtrute(a);
      a.inneL = lyst === 0 && iFeltet(p.x, p.z);
      let fart = a.fart, onsket;
      if (a.tilstand !== 'gaa') onsket = Math.atan2(a.ute.x - p.x, a.ute.z - p.z);
      else {
        if (!a.mal || Math.hypot(a.mal.x - p.x, a.mal.z - p.z) < 1.5) { if (lyst === 0 && Math.random() < 0.35 && a.mal) a.beite = 1.2 + Math.random() * 2; nyttVandremaal(a); }
        const vandre = Math.atan2(a.mal.x - p.x, a.mal.z - p.z);
        let ut = vandre;
        if (lyst > 0) {
          if (a.via && (p.x > a.via.x - 1 || Math.hypot(a.via.x - p.x, a.via.z - p.z) < 2.5)) a.via = null;
          const mx = a.via ? a.via.x : e.x1 + 2, mz = a.via ? a.via.z : a.portZ;
          // nær porten: gå først sidelengs til sitt eget punkt i åpningen, så rett ut
          ut = !a.via && p.x > e.x1 - 4 && Math.abs(p.z - mz) > 0.6 ? Math.atan2(0.35, mz - p.z) : Math.atan2(mx - p.x, mz - p.z);
        }
        const vx = (1 - lyst) * Math.sin(vandre) + lyst * Math.sin(ut), vz = (1 - lyst) * Math.cos(vandre) + lyst * Math.cos(ut);
        onsket = Math.atan2(vx, vz);
        if (lyst === 0 && a.beite > 0) { a.beite -= dt; fart = 0; }   // står og beiter litt
        if (a.alder > LANG) fart *= 1.15;
      }
      // ---- Hindringer: andre matdyr, roboten og faste hindringer ----
      const hindre = faste.slice();
      for (const b of felt) if (b !== a && b.tilstand !== 'fall' && b.tilstand !== 'krymp') { const d = Math.abs(b.g.position.x - p.x) + Math.abs(b.g.position.z - p.z); if (d < 9) hindre.push({ x: b.g.position.x, z: b.g.position.z, vx: b.vx, vz: b.vz, r: RADIUS * (b.tilstand === 'borte' ? Math.max(0.2, b.krymp ?? 1) : 1) }); }
      // Hopp over roboten i tre faser: sats (sammenkrøket), sprang i en bue til et ledig landingssted, og landing (sammentrykket).
      if (a.hopp) {
        const H = a.hopp; H.t += dt;
        if (H.fase === 'sats') { const u = Math.min(1, H.t / 0.2); a.g.scale.set(1 + 0.12 * u, 1 - 0.2 * u, 1 + 0.12 * u); a.m.rotation.x = -0.08 * u; if (H.t >= 0.2) { H.fase = 'luft'; H.t = 0; } }
        else if (H.fase === 'luft') {
          const u = Math.min(1, H.t / H.T); p.x = H.x0 + (H.x1 - H.x0) * u; p.z = H.z0 + (H.z1 - H.z0) * u; p.y = 4 * H.h * u * (1 - u);
          const k = 1 + 0.1 * Math.sin(Math.PI * u); a.g.scale.set(1 / Math.sqrt(k), k, 1 / Math.sqrt(k)); a.m.rotation.x = -0.35 * Math.cos(Math.PI * u);   // nesa opp, så ned
          if (u >= 1) { H.fase = 'land'; H.t = 0; p.y = 0; }
        } else { const u = Math.min(1, H.t / 0.22), q = Math.sin(Math.PI * u); a.g.scale.set(1 + 0.14 * q, 1 - 0.22 * q, 1 + 0.14 * q); a.m.rotation.x = 0.15 * (1 - u); if (u >= 1) { a.hopp = null; a.g.scale.set(1, 1, 1); a.m.rotation.x = 0; } }
      }
      if (rp && a.tilstand === 'gaa' && !a.hopp) hindre.push({ x: rp.x, z: rp.z, r: 0.75, rob: true });
      let valgt = a.hopp ? a.retning : onsket;
      if (fart > 0 && !a.hopp) {
        const s2 = styr(a, onsket, hindre); valgt = s2.h;
        if (s2.naer > 2.5) fart = 0; else if (s2.naer > 0.8) fart *= 0.4;
        // Står roboten i veien for et matdyr som vil ut, hopper matdyret over roboten (gjerdene gjelder fortsatt)
        const rob = s2.treff && s2.treff.b.rob || (a.forsteTreff && a.forsteTreff.rob && Math.abs(s2.o) > 0.7);
        a.robotFast = rob && lyst > 0.5 ? a.robotFast + dt : Math.max(0, a.robotFast - dt);
        if (a.robotFast > 1.2 && !a.hopp && rp && Math.hypot(rp.x - p.x, rp.z - p.z) < 3.2) {
          const plan = planleggHopp(a, rp, hindre);
          if (plan) {
            a.hopp = plan; a.robotFast = 0; a.retning = valgt = Math.atan2(plan.x1 - p.x, plan.z1 - p.z); fart = 0;
            if (dyttMelding <= 0) { dyttMelding = 8; melding('🐾 ' + navn(a.ci) + ' hoppet over roboten for å komme seg ut.'); }
          }
        }
      }
      const diff = Math.atan2(Math.sin(valgt - a.retning), Math.cos(valgt - a.retning));
      a.retning += Math.max(-dt * 3, Math.min(dt * 3, diff * Math.min(1, dt * 4)));
      // Myk start og stopp, og saktere i skarpe svinger
      const maalFart = fart * (Math.abs(diff) > 1.2 ? 0.35 : 1);
      a.v += (maalFart - a.v) * Math.min(1, dt * 3);
      if (a.hopp) a.v = 0;
      let nx = p.x + Math.sin(a.retning) * a.v * dt, nz = p.z + Math.cos(a.retning) * a.v * dt;
      // Overlapp rettes ved å skyve matdyret fra naboer og roboten, men bare til lovlige steder
      // Skyvet begrenses til 3,5 m/s, så et matdyr som har landet tett inntil noe glir mykt bort i stedet for å hoppe
      let sx = 0, sz = 0;
      if (!a.hopp) for (const h of hindre) {
        const dx = nx - h.x, dz = nz - h.z, d = Math.hypot(dx, dz), min = RADIUS + h.r - 0.1;
        if (d < min && d > 1e-4) { const k = (min - d) * (h.vx === undefined || h.rob ? 1 : 0.5); sx += dx / d * k; sz += dz / d * k; }
      }
      const sl = Math.hypot(sx, sz), maks = 3.5 * dt;
      if (sl > maks) { sx *= maks / sl; sz *= maks / sl; }
      if (sl > 0) {   // ved gjerdet eller i porten: skyv i den retningen som er lovlig
        for (const [ux, uz] of [[sx, sz], [sx, 0], [0, sz], [-sx * 0.5, sz], [sx, -sz * 0.5]]) if (lovlig(nx + ux, nz + uz, a.inneL)) { nx += ux; nz += uz; break; }
      }
      const L = (x, z) => lovlig(x, z, a.inneL);
      if (L(nx, nz)) { p.x = nx; p.z = nz; }
      else if (L(nx, p.z)) p.x = nx;   // glir langs gjerdet
      else if (L(p.x, nz)) p.z = nz;
      const flytt = a.forrX === undefined ? 0 : Math.hypot(p.x - a.forrX, p.z - a.forrZ);
      a.vx = a.forrX === undefined ? 0 : (p.x - a.forrX) / Math.max(dt, 1e-3); a.vz = a.forrZ === undefined ? 0 : (p.z - a.forrZ) / Math.max(dt, 1e-3);
      a.forrX = p.x; a.forrZ = p.z; a.vFaktisk = flytt / Math.max(dt, 1e-3); a.fase += flytt;
      // Står fast mens det vil gå: velg nytt vandremål eller en ny vei gjennom porten
      a.fast = fart > 0 && a.vFaktisk < 0.15 ? a.fast + dt : 0;
      if (a.fast > 2) { a.fast = 0; a.side = -a.side; if (lyst > 0) nyUtrute(a); else nyttVandremaal(a); }
      if (a.tilstand === 'gaa' && p.x > e.x1 + 1.0) a.tilstand = 'ut';
      if (a.tilstand === 'ut' && (I.GROFT ? p.x > I.GROFT_X1 - 1 : (p.x > e.x1 + 9 || Math.hypot(a.ute.x - p.x, a.ute.z - p.z) < 2))) a.tilstand = 'borte';
      if (I.GROFT && (a.tilstand === 'ut' || a.tilstand === 'borte')) a.g.position.y = I.groft(p.x, p.z);   // går ned hulveien
      a.m.rotation.order = 'YXZ'; a.m.rotation.y = a.retning;
      animer(a, t, !a.hopp && a.vFaktisk > 0.15);
    }
    ryddSkilt();
  }
  function animer(a, t, gaar) {
    if (a.m.userData.fig) { if (!I.REDUSERT) I.animerNy(a.m.userData.fig, t + a.alder, gaar, a.fase); }
    else a.m.position.y = I.REDUSERT || !gaar ? 0 : Math.abs(Math.sin(a.fase * Math.PI / 0.8)) * 0.12;
  }
  // Navneskilt: aldri større på skjermen enn et skilt ca. 16 m unna (22 m på smal skjerm), tones ut helt inntil kameraet,
  // og skilt som ville dekke et viktigere skilt, tones ut. Viktigst er matdyret nærmest roboten, deretter nærmest kameraet.
  const _v = new T.Vector3();
  function ryddSkilt() {
    const cam = I.camera, r = I.robot && I.robot(), H = innerHeight, W = innerWidth, f = 1 / Math.tan(cam.fov * Math.PI / 360);
    const liste = felt.filter(a => a.lab && a.tilstand !== 'fall').map(a => {
      const d = cam.position.distanceTo(a.g.position), D0 = cam.aspect < 1 ? 22 : 16, k = Math.min(1, d / D0) * (a.g.scale.x || 1);
      a.lab.scale.set(4.2 * k, 1.23 * k, 1);
      a.lab.getWorldPosition(_v); _v.project(cam);
      const h = 1.23 * k * f / Math.max(d, 0.1) * H / 2, w = h * 4.2 / 1.23;
      return { a, d, x: (_v.x + 1) * W / 2, y: (1 - _v.y) * H / 2, w, h, foran: _v.z < 1, rob: r ? Math.hypot(a.g.position.x - r.position.x, a.g.position.z - r.position.z) : 0 };
    }).sort((u, v) => (u.rob < 4 ? -1 : 0) - (v.rob < 4 ? -1 : 0) || u.d - v.d);
    const plassert = [];
    for (const s of liste) {
      let mal = Math.max(0, Math.min(1, (s.d - 3) / 4));
      if (s.foran && mal > 0) { for (const q of plassert) { const ox = Math.min(s.x + s.w / 2, q.x + q.w / 2) - Math.max(s.x - s.w / 2, q.x - q.w / 2), oy = Math.min(s.y + s.h / 2, q.y + q.h / 2) - Math.max(s.y - s.h / 2, q.y - q.h / 2); if (ox > 0 && oy > 0 && ox * oy > 0.2 * s.w * s.h) { mal = 0; break; } } if (mal > 0) plassert.push(s); }
      s.a.labA += (mal - s.a.labA) * 0.2; s.a.lab.material.opacity = s.a.labA; s.a.lab.visible = s.a.labA > 0.02;
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
  // Bytte når gården er full (som i Matdyr-regn 0.10.3): et matdyr kan tas med hvis det tjener mer enn det svakeste i gården.
  // Ved levering spør spillet alltid først. Det gamle selges for halv pris. Ingenting byttes automatisk.
  function svakeste() { let w = -1; for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) { const ci = S.base[i]; if (ci >= 0 && (w < 0 || incB(i) < incB(w))) w = i; } return w; }
  const harPlass = ci => harLedig() || (svakeste() >= 0 && INC(ci) > incB(svakeste()));
  function finnHandling() {
    const p = I.robot().position;
    if (bar) {
      if (bar.flyr) return null; const i = naerPlass(p, true); if (i >= 0) return { t: 'sett', i };
      if (bar.velgBytt) { const j = naerPlass(p, false, 2.6); if (j >= 0) return { t: 'bytt', i: j }; if (iBasen()) return { t: 'velgHjelp' }; }
      if (iBasen()) { const f = forsteLedige(); if (f >= 0) return { t: 'forste', i: f }; if (svakeste() >= 0) return { t: 'bytteValg' }; }
      return { t: 'slipp' };
    }
    let best = null, bd = 3.2; for (const a of felt) { if (a.tilstand !== 'gaa' || p.y > 1) continue; const d = Math.hypot(a.g.position.x - p.x, a.g.position.z - p.z); if (d < bd) { bd = d; best = a; } }
    if (best) return { t: 'ta', a: best };
    const i = naerPlass(p, false, 1.8); return i >= 0 ? { t: 'selg', i } : null;
  }
  function visHandling() {
    const b = $('handling'), h = handling; let t = '', lav = false;
    if (h && h.t === 'ta') { const ci = h.a.ci, pr = PRICE(ci); if (S.penger < pr) { t = '🔒 Mangler 💰 ' + fmt(pr - S.penger); lav = true; } else if (!harPlass(ci)) { t = '🔒 Ikke bedre enn det svakeste'; lav = true; } else t = '🫳 Ta med ' + navn(ci) + ' (💰 ' + fmt(pr) + ')'; }
    else if (h && h.t === 'sett') t = '🏠 Sett inn ' + navn(bar.ci);
    else if (h && h.t === 'forste') t = '🏠 Første ledige plass';
    else if (h && h.t === 'bytteValg') t = '🔁 Bytt ut et matdyr';
    else if (h && h.t === 'velgHjelp') t = '✖ Avbryt bytte';
    else if (h && h.t === 'bytt') t = '🔁 Bytt med ' + navn(S.base[h.i]);
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
      if (!harPlass(ci)) return melding('🏠 Gården er full. Selg et matdyr først, eller finn et som er bedre enn det svakeste.');
      fjern(h.a); bar = { ci, m: modell(ci) }; bar.topp = toppsett(bar.m, ci); bar.m.scale.setScalar(0.7); I.scene.add(bar.m);
      melding(harLedig() ? 'Gå til det gule feltet «Lever her», eller trykk på en grønn ＋ på gården.' : 'Gården er full. Bær ' + navn(ci) + ' hjem og bytt med et svakere matdyr. Du betaler når det flytter inn.', 4);
    } else if (h.t === 'sett') settInn(h.i);
    else if (h.t === 'forste') velgPlass(h.i);
    else if (h.t === 'bytteValg') apneBytte();
    else if (h.t === 'velgHjelp') { bar.velgBytt = false; visMerker(); melding('Greit! Valget er avbrutt. Du har ikke betalt noe.'); }
    else if (h.t === 'bytt') byttMed(h.i);
    else if (h.t === 'slipp') { const ci = bar.ci; slippBar(); slippNed(ci); melding('⬇️ ' + navn(ci) + ' løp tilbake til enga.'); }
    else if (h.t === 'selg') apneSalg(h.i);
    handlingTekst = '';
  }
  function slippBar() { if (bar) { I.scene.remove(bar.m); bar = null; } visMerker(); }
  function settInn(i) {
    if (!bar || S.base[i] !== -1) return; const ci = bar.ci, pr = PRICE(ci);
    if (S.penger < pr) { slippBar(); slippNed(ci); return melding('💰 Du har ikke råd lenger, så matdyret løp tilbake til enga.'); }
    S.penger -= pr; S.base[i] = ci; ryddArv(i); const forst = !S.disc.includes(ci); if (forst) S.disc.push(ci); slippBar();
    I.spillAnim('Idle'); oppdaterDyr(); lagre();
    melding((forst ? '✨ Ny i Matdyrboka: ' : '🏠 ') + navn(ci) + ' flyttet inn i ' + I.etasjeNavn(plassPos(i).y).replace(' (bakken)', '') + '. Du betalte 💰 ' + fmt(pr) + '.');
  }

  // =================== Plassering i basen ===================
  // Bærer roboten et matdyr og er ute av åkeren (på tunet, ved inngangen eller i en etasje), vises en grønn ＋ over hver ledig plass
  // i alle etasjer. Spilleren trykker på plassen, eller velger «Plasser på første ledige plass». Matdyret flyr da i en kort bue til plassen.
  // Andre matdyr flyttes aldri. Gå roboten rett bort på en ledig plass, settes matdyret inn der som før.
  const iBasen = () => { const r = I.robot(), e = eng(); return !!r && (r.position.y > 1 || r.position.z < e.z0 - 0.3); };
  const ledige = () => { const l = []; for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) if (S.base[i] === -1) l.push(i); return l; };
  // Første ledige: på robotens etasje først, ellers laveste plassnummer
  function forsteLedige() { const l = ledige(), y = I.robot().position.y; return l.find(i => Math.abs(plassPos(i).y - y) < 1.0) ?? (l.length ? l[0] : -1); }
  const merkG = new T.Group(); merkG.renderOrder = 20; I.scene.add(merkG); let merkNokkel = '';
  const etasjeKort = i => i >= 36 ? 'T' : String(etasjeAv(i) + 1);
  function merkeTekstur(et, bytt) {
    return tekstur('merke' + et + (bytt ? 'b' : ''), 128, 160, x => {
      x.fillStyle = bytt ? 'rgba(230,120,20,.94)' : 'rgba(30,140,60,.92)'; x.strokeStyle = '#fff'; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#fff'; x.font = 'bold 76px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; if (bytt) { x.font = 'bold 56px system-ui,sans-serif'; x.fillText('🔁', 64, 66); } else x.fillText('+', 64, 68);
      x.fillStyle = 'rgba(20,26,48,.85)'; x.beginPath(); x.roundRect ? x.roundRect(34, 122, 60, 34, 10) : x.rect(34, 122, 60, 34); x.fill();
      x.fillStyle = '#fff'; x.font = 'bold 24px system-ui,sans-serif'; x.fillText(et === 'T' ? 'Tak' : et + '. et', 64, 140);
    });
  }
  function visMerker() {
    const vis = !!bar && !bar.flyr && I.fane() === 'spill' && iBasen(), bytt = vis && !!bar.velgBytt;
    const l = !vis ? [] : bytt ? S.base.map((ci, i) => i).filter(i => i < aapneNa && S.base[i] >= 0) : ledige(), n = vis + ':' + bytt + ':' + l.join(',');
    if (n === merkNokkel) return; merkNokkel = n;
    if (vis && l.length) { $('melding').hidden = true; meldingTid = 0; }   // meldingen skal ikke dekke merkene
    merkG.children.slice().forEach(c => { merkG.remove(c); c.material.dispose(); });
    for (const i of l) { const q = plassPos(i), sp = new T.Sprite(new T.SpriteMaterial({ map: merkeTekstur(etasjeKort(i), bytt), depthTest: false, depthWrite: false, transparent: true })); sp.position.set(q.x, q.y + 1.6, q.z); sp.scale.set(1.5, 1.875, 1); sp.renderOrder = 20; sp.userData.plass = i; sp.userData.bytt = bytt; merkG.add(sp); }
  }
  function oppdaterMerker(t) {
    visMerker(); if (!merkG.children.length) return; const y = I.robot().position.y;
    // Merket er aldri lavere enn 56 px på skjermen (bredde 45 px), uansett zoom og skjermstørrelse
    const cam = I.camera, f = 2 * Math.tan(cam.fov * Math.PI / 360) / innerHeight;
    for (const sp of merkG.children) {
      const egen = Math.abs(plassPos(sp.userData.plass).y - y) < 1.0, k = (egen ? 1 : 0.8) * (1 + Math.sin(t * 4 + sp.userData.plass) * 0.06);
      const hMin = 56 * f * cam.position.distanceTo(sp.position), h = Math.max(1.875 * k, hMin * (1 + Math.sin(t * 4 + sp.userData.plass) * 0.06));
      sp.scale.set(h * 0.8, h, 1); sp.material.opacity = egen ? 1 : 0.8;
    }
  }
  // ---------- Innsamlingssonen (Even 12.11.2026: «Collect zone» foran gården) ----------
  // Inntekten samles i en kasse. Går roboten inn i sonen til høyre for gangen foran gården, går pengene over til lommeboka.
  // Én sone for hele gården, ikke en knapp per plass. ?samle=0 gir automatisk inntekt som før.
  const SAMLE = new URLSearchParams(location.search).get('samle') !== '0';
  const samleG = new T.Group(); I.scene.add(samleG); let samleNokkel = '', samleSkilt = null, samleSist = -1, paaSamle = false, samleTid = -9, samleSum = 0;
  function samleOmr() { const g = window.EVNGeo, d = I.gd.gjerdeD || 22; if (!g) return null; const z0 = g.HZ + 1.4, z1 = Math.min(d - 1.6, g.HZ + 7.4);
    return { x0: 2.4, x1: 7.4, z0, z1: Math.max(z1, z0 + 2.5) }; }
  function byggSamle() {
    const o = SAMLE ? samleOmr() : null, n = o ? [o.z0, o.z1].join(':') : ''; if (n === samleNokkel) return; samleNokkel = n;
    samleG.children.slice().forEach(c => { samleG.remove(c); c.geometry && c.geometry.dispose(); c.material && c.material.dispose(); }); samleSkilt = null; samleSist = -1;
    if (!o) return;
    const w = o.x1 - o.x0, d = o.z1 - o.z0, tex = tekstur('samlefelt', 256, 256, x => {
      x.fillStyle = 'rgba(122,214,107,.9)'; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 240, 30) : x.rect(8, 8, 240, 240); x.fill();
      x.strokeStyle = '#fff'; x.lineWidth = 9; x.setLineDash([20, 12]); x.stroke();
      x.fillStyle = '#1f4d16'; x.font = 'bold 40px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('💰 Hent', 128, 104); x.fillText('pengene', 128, 152);
    });
    const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((o.x0 + o.x1) / 2, 0.24, (o.z0 + o.z1) / 2); m.renderOrder = 2; samleG.add(m);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const st = new T.CanvasTexture(cv); st.encoding = T.sRGBEncoding;
    samleSkilt = new T.Sprite(new T.SpriteMaterial({ map: st, transparent: true, depthWrite: false })); samleSkilt.scale.set(4.4, 1.1, 1); samleSkilt.position.set((o.x0 + o.x1) / 2, 2.4, (o.z0 + o.z1) / 2); samleSkilt.userData.cv = cv; samleG.add(samleSkilt);
  }
  function tegnSamleSkilt() {
    if (!samleSkilt) return; const v = Math.floor(S.kasse || 0); if (v === samleSist) return; samleSist = v;
    const cv = samleSkilt.userData.cv, x = cv.getContext('2d'); x.clearRect(0, 0, 512, 128);
    x.fillStyle = 'rgba(31,77,22,.85)'; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 496, 112, 40) : x.rect(8, 8, 496, 112); x.fill();
    x.fillStyle = '#fff'; x.font = 'bold 60px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('💰 ' + fmt(v), 256, 66);
    samleSkilt.material.map.needsUpdate = true;
  }
  const iSamle = p => { const o = SAMLE ? samleOmr() : null; return !!o && p.y < 1.5 && p.x > o.x0 && p.x < o.x1 && p.z > o.z0 && p.z < o.z1; };
  function sjekkSamle(t, dt = 0) {
    byggSamle(); const r = I.robot(); if (!r || !samleG.children[0]) return;
    samleG.children[0].material.opacity = (S.kasse || 0) >= 1 ? 0.8 + Math.sin(t * 4) * 0.2 : 0.6;
    if (samleSkilt) samleSkilt.position.y = 2.4 + Math.sin(t * 2) * 0.12;
    const inne = iSamle(r.position);
    // Henter når roboten kommer inn, og fortsetter å hente mens den står i sonen (QA 41034b3)
    if (inne && (S.kasse || 0) >= 1 && (!paaSamle || samleTid <= 0)) { const v = Math.floor(S.kasse); S.penger += v; S.kasse -= v; samleSum = paaSamle ? samleSum + v : v; samleTid = 1; if (!paaSamle) { melding('💰 Du hentet ' + fmt(v) + ' penger!', 3); lagre(); } }   // mens roboten står der, vises bare skiltet, så andre meldinger ikke blir skjult (QA be0615d)
    samleTid -= dt; paaSamle = inne; tegnSamleSkilt();
  }

  // ---------- Leveringsfeltet ----------
  // Et gult felt i passasjen mellom gården og åkeren. Går roboten inn på feltet med et matdyr, flyr matdyret til første ledige plass
  // (1. etasje først), uten at spilleren trykker på noe. Å velge plass selv med en ＋ virker fortsatt.
  const levG = new T.Group(); I.scene.add(levG); let levNokkel = '', paaLev = false, levBesok = 0;
  function levOmr() { const e = eng(); if (!e) return null; const d = I.gd.gjerdeD || 22, z0 = d + 0.3, z1 = Math.min(d + 3.6, e.z0 - 0.3);
    return { x0: -3.3, x1: 3.3, z0, z1: Math.max(z1, z0 + 1.6) }; }   // rett utenfor porten i gårdsgjerdet, så nær basen som mulig   // hele passasjen (roboten når |x| ≈ 3,05)
  function byggLevFelt() {
    const o = levOmr(), n = o ? o.z0 + ':' + o.z1 : ''; if (n === levNokkel) return; levNokkel = n;
    levG.children.slice().forEach(c => { levG.remove(c); c.geometry && c.geometry.dispose(); c.material && c.material.dispose(); });
    if (!o) return;
    const w = o.x1 - o.x0, d = o.z1 - o.z0, tex = tekstur('levfelt', 256, 128, x => {
      x.fillStyle = 'rgba(255,214,64,.92)'; x.beginPath(); x.roundRect ? x.roundRect(6, 6, 244, 116, 28) : x.rect(6, 6, 244, 116); x.fill();
      x.strokeStyle = '#fff'; x.lineWidth = 8; x.setLineDash([18, 12]); x.stroke();
      x.fillStyle = '#5a3b12'; x.font = 'bold 44px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🏠 Lever her', 128, 66);
    });
    const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set((o.x0 + o.x1) / 2, 0.24, (o.z0 + o.z1) / 2); m.renderOrder = 2; levG.add(m);
  }
  const iLevFelt = p => { const o = levOmr(); return !!o && p.y < 1.5 && p.x > o.x0 && p.x < o.x1 && p.z > o.z0 && p.z < o.z1; };
  function sjekkLevFelt(t) {
    byggLevFelt(); const r = I.robot(); if (!r || !levG.children[0]) return;
    const inne = iLevFelt(r.position), m = levG.children[0];
    m.material.opacity = bar && !bar.flyr ? 0.85 + Math.sin(t * 5) * 0.15 : 0.75;
    if (inne && !paaLev) levBesok++;
    // Hvert matdyr som bæres, prøves levert én gang per besøk på feltet (også om roboten tok det mens den sto der)
    if (inne && bar && !bar.flyr && bar.levForsok !== levBesok) {
      bar.levForsok = levBesok; const i = forsteLedige();
      if (i < 0 && svakeste() >= 0 && !bar.velgBytt) apneBytte();
      else if (i < 0 && !bar.velgBytt) melding('Ingen ledige plasser. Utvid gården eller selg et matdyr.');
      else velgPlass(i);
    }
    paaLev = inne;
  }

  function apneBytte() {
    if (!bar || bar.flyr) return; const w = svakeste(); if (w < 0) return; const nc = bar.ci, oc = S.base[w], diff = INC(nc) - incB(w), halv = Math.floor(prisB(w) / 2);
    const lin = (ikon, ci, ord, r = COMBOS[ci].r, inn = INC(ci), ekstra = '') => '<p class="byttlinje">' + ikon + ' ' + ord + ': <b>' + esc(navn(ci)) + '</b> (' + R[r].n + esc(ekstra) + ') · 💵 +' + fmt(inn) + '/s</p>';
    const info = 'Du betaler 💰 ' + fmt(PRICE(nc)) + ' for det nye. ' + (diff > 0 ? 'Bytter du, tjener gården 💵 +' + fmt(diff) + ' mer per sekund. ' : diff === 0 ? 'De tjener like mye. ' : '⚠️ Det nye tjener mindre enn det svakeste. ') + 'Du får 💰 ' + fmt(halv) + ' for det gamle.';
    apneDialog('<h2>🏠 Gården er full</h2>' + lin('🆕', nc, 'Nytt') + lin('⬇️', oc, 'Svakest på gården', rB(w), incB(w), eldre(w)) + '<p class="byttinfo">' + esc(info) + '</p><div class="knapper"><button type="button" id="dNei">Avbryt</button><button type="button" id="dVelg">👉 Velg en annen</button><button type="button" id="dJa">🔁 Bytt med svakeste</button></div>', 'dJa');
    $('dNei').onclick = () => { lukkDialog(); if (bar) bar.velgBytt = false; visMerker(); melding('Greit! Du kan slippe matdyret på åkeren. Du har ikke betalt noe.'); };
    $('dVelg').onclick = () => { lukkDialog(); if (bar) { bar.velgBytt = true; visMerker(); } };   // hjelpeteksten står på handlingsknappen, ikke i en melding som kan dekke merkene
    $('dJa').onclick = () => { lukkDialog(); byttMed(svakeste()); };
  }
  function byttMed(i) {
    if (!bar || bar.flyr || !(i >= 0) || S.base[i] < 0) return false;
    const oc = S.base[i], halv = Math.floor(prisB(i) / 2), pr = PRICE(bar.ci);
    if (S.penger + halv < pr) { melding('💰 Du mangler ' + fmt(pr - S.penger - halv) + ' for å bytte.'); return false; }
    S.penger += halv; S.base[i] = -1; ryddArv(i); oppdaterDyr(); bar.velgBytt = false;
    melding('🔁 Du solgte ' + navn(oc) + ' for 💰 ' + fmt(halv) + '.'); return velgPlass(i);
  }

  function velgPlass(i) {
    if (!bar || bar.flyr || S.base[i] !== -1 || !(i < aapneNa)) return false;
    const pr = PRICE(bar.ci); if (S.penger < pr) { melding('💰 Du mangler ' + fmt(pr - S.penger) + '.'); return false; }
    const q = plassPos(i), til = new T.Vector3(q.x, q.y + 0.2, q.z), fra = bar.m.position.clone(), L = fra.distanceTo(til);
    bar.flyr = { i, t: 0, fra, til, tid: 0.6 + L / 30, bue: 2.2 + L * 0.12 }; visMerker(); return true;
  }
  function flyBar(dt) {
    const f = bar.flyr; f.t = Math.min(1, f.t + dt / (f.tid || 0.7)); const u = f.t * f.t * (3 - 2 * f.t);
    bar.m.position.lerpVectors(f.fra, f.til, u); bar.m.position.y += Math.sin(Math.PI * f.t) * (f.bue || 2.2);
    bar.m.scale.setScalar(0.7 + 0.3 * u); bar.m.rotation.y += dt * 4;
    if (f.t >= 1) { const i = f.i; bar.flyr = null; if (S.base[i] === -1) settInn(i); else { melding('Plassen ble tatt. Velg en annen.'); } }
  }
  // Trykk/klikk på en ＋ (skilt fra kameradraging: kort trykk med lite bevegelse)
  { const el = I.renderer.domElement; let ned = null;
    // Treff avgjøres på skjermen: nærmeste merke innenfor halve merkehøyden, men minst 26 px (trykkflate ≥ 52 px)
    const v = new T.Vector3();
    el.addEventListener('pointerdown', e => { ned = { x: e.clientX, y: e.clientY, t: e.timeStamp }; });
    el.addEventListener('pointerup', e => {
      if (!ned || !merkG.children.length) return; const d = Math.hypot(e.clientX - ned.x, e.clientY - ned.y), tid = e.timeStamp - ned.t; ned = null;
      if (d > 14 || tid > 800) return; const b = el.getBoundingClientRect(), cam = I.camera, f = 2 * Math.tan(cam.fov * Math.PI / 360);
      let best = null, bd = 1e9;
      for (const sp of merkG.children) {
        v.copy(sp.position).project(cam); if (v.z > 1) continue;
        const sx = b.left + (v.x + 1) / 2 * b.width, sy = b.top + (1 - v.y) / 2 * b.height, hpx = sp.scale.y / (f * cam.position.distanceTo(sp.position)) * b.height;
        const avst = Math.hypot(e.clientX - sx, e.clientY - sy); if (avst < Math.max(26, hpx / 2) && avst < bd) { bd = avst; best = sp; }
      }
      if (best) { if (best.userData.bytt) byttMed(best.userData.plass); else velgPlass(best.userData.plass); }
    }); }

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
    if (!$('dialog').hidden) {
      if (e.key === 'Escape') { lukkDialog(); e.preventDefault(); }
      else if (e.key === 'Tab') {   // fokusfelle: Tab og Shift+Tab går rundt blant knappene i dialogen
        const k = [...$('dialog').querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
        if (k.length) { const i = k.indexOf(document.activeElement), n = e.shiftKey ? (i <= 0 ? k.length - 1 : i - 1) : (i < 0 || i >= k.length - 1 ? 0 : i + 1); k[n].focus(); e.preventDefault(); }
      }
      return;
    }
    if (e.key.toLowerCase() === 'e' && !e.repeat) gjorHandling();
  });
  function apneSalg(i) {
    const ci = S.base[i]; if (ci < 0) return;
    const halv = Math.floor(prisB(i) / 2);
    apneDialog('<h2>Selge ' + esc(navn(ci)) + '?</h2><p>' + esc(navn(ci)) + ' (' + R[rB(i)].n + esc(eldre(i)) + ') tjener 💵 ' + fmt(incB(i)) + ' per sekund.</p><p>Du får 💰 ' + fmt(halv) + '.</p><div class="knapper"><button type="button" id="dNei">Nei, behold</button><button type="button" id="dJa" class="fare">💸 Selg</button></div>', 'dNei');
    $('dNei').onclick = lukkDialog;
    $('dJa').onclick = () => { if (S.base[i] === ci) { S.penger += halv; S.base[i] = -1; ryddArv(i); oppdaterDyr(); lagre(); melding('💸 Du solgte ' + navn(ci) + '.'); } lukkDialog(); };
  }

  // =================== Gårdsnivå ===================
  let valg = [], laast = false, gnStatus = '';
  const passer = kr => S.base.map((ci, i) => i).filter(i => { const ci = S.base[i]; return i < aapneNa && ci >= 0 && rB(i) >= kr[2] && (kr[0] === null || COMBOS[ci].art === kr[0]); }).sort((a, b) => incB(a) - incB(b));
  const kravTekst = ([art, n, min]) => n + ' ' + (art ? ARTEMOJI[art] + ' ' + art : 'matdyr av valgfri art') + ' (' + R[min].n + (min >= 5 ? ')' : ' eller bedre)');
  // Forslag: de svakeste som passer. Bestemte arter fordeles før «valgfri art». Et matdyr som er sjeldnere enn kravet, velges aldri automatisk.
  function autoVelg() {
    const k = GARDSNIVA[S.gard.niva + 1]; valg = k.krav.map(() => []); const brukt = new Set();
    const ordre = k.krav.map((_, j) => j).sort((a, b) => (k.krav[a][0] === null) - (k.krav[b][0] === null));
    for (const j of ordre) { const kr = k.krav[j]; for (const i of passer(kr)) { if (valg[j].length >= kr[1]) break; if (!brukt.has(i) && rB(i) === kr[2]) { valg[j].push(i); brukt.add(i); } } }
  }
  // Kontroll rett før oppgraderingen. Returnerer en feilmelding, eller null når alt stemmer.
  function kontroller(mal) {
    const k = GARDSNIVA[mal]; if (!k || S.gard.niva !== mal - 1) return 'Gårdsnivået er allerede endret.';
    const l = lesLagret(); if (l && l.gard.niva !== S.gard.niva) return 'Spillet er endret i en annen fane. Last siden på nytt.';
    const brukt = new Set();
    for (let j = 0; j < k.krav.length; j++) {
      const kr = k.krav[j], v = valg[j] || []; if (v.length !== kr[1]) return 'Velg ' + kravTekst(kr) + '.';
      for (const i of v) { const ci = S.base[i]; if (brukt.has(i) || !(i < aapneNa) || !(ci >= 0) || rB(i) < kr[2] || (kr[0] && COMBOS[ci].art !== kr[0])) return 'Et valgt matdyr passer ikke lenger. Velg på nytt.'; brukt.add(i); }
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
      h += '<div class="krav' + (ok ? ' ok' : '') + '"><div class="kravtopp"><span>' + (ok ? '✅' : '⬜') + ' ' + esc(kravTekst(kr)) + '</span><span>' + v.length + '/' + kr[1] + ' valgt</span></div><div class="brikker">';
      if (!kand.length) h += '<span class="liten">Ingen i gården ennå. Se etter dem i regnet.</span>';
      // Sjeldnere matdyr enn kravet teller, men velges ikke automatisk (så ingen sjeldne leveres ved et uhell). Si det tydelig.
      const ledigeKand = kand.filter(i => !v.includes(i) && !valg.some((vv, jj) => jj !== j && vv.includes(i)));
      if (!ok && ledigeKand.length) h += '<p class="hint">👆 Du har ' + ledigeKand.length + ' som passer' + (ledigeKand.some(i => rB(i) > kr[2]) ? ' (sjeldnere enn nødvendig, derfor ikke valgt for deg)' : '') + '. Trykk på ' + (ledigeKand.length > 1 ? 'dem' : 'den') + ' for å levere.</p>';
      kand.forEach(i => { const ci = S.base[i], annen = valg.some((vv, jj) => jj !== j && vv.includes(i)); h += '<button type="button" class="brikke" data-j="' + j + '" data-i="' + i + '" aria-pressed="' + v.includes(i) + '"' + (annen ? ' disabled title="Valgt til et annet krav"' : '') + '>' + esc(navn(ci)) + ' <span class="sjb" style="background:' + R[rB(i)].c + '">' + R[rB(i)].n + '</span>' + (rB(i) > kr[2] ? ' ⭐' : '') + (arvet(i) ? ' ⏳' : '') + ' · ' + esc(I.etasjeNavn(plassPos(i).y).replace(' (bakken)', '')) + '</button>'; });
      h += '</div></div>';
    });
    if (kallAktiv()) { const f = Math.min(KALL, kallFunnet()); h += '<div class="kall"><b>🔔 Óðinn-kallet: ' + f + '/' + KALL + ' ulike Food God funnet</b><p class="liten">' + (f >= KALL ? 'Óðinn har hørt kallet! Neste Food God som faller fra himmelen, er Óðinn.' : 'Finn ' + (KALL - f) + ' Food God til. Da blir neste Food God som faller, Óðinn.' + (S.bestilling > 0 ? ' Med bestillingsregn kan Óðinn også komme før.' : '')) + '</p></div>'; }
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
    let h = '<h2>Oppgrader gården?</h2><div class="del"><b>Du leverer inn</b><ul>' + inn.map(i => '<li>' + esc(navn(S.base[i])) + ' (' + R[rB(i)].n + esc(eldre(i)) + ')</li>').join('') + '<li>💰 ' + fmt(k.penger) + '</li></ul></div>';
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
    valg.flat().forEach(i => { ny2.base[i] = -1; ryddArv(i, ny2); }); ny2.penger -= k.penger; ny2.gard.niva = mal;
    if (!lagre(ny2)) { laast = false; gnStatus = 'Spillet kunne ikke lagres, så ingenting er endret. Prøv igjen.'; visGardsniva(); return false; }
    S = ny2; fyllBase(); lukkDialog(); laast = true; byggSpillGard(true); oppdaterPanel(); laast = false;
    melding('🎉 Gårdsnivå ' + mal + '! ' + I.NIVA[mal].nytt + '.', 6); I.spillAnim('Idle');
    return true;
  }

  // =================== Matdyrboka (fordeling C, prototype for én art om gangen) ===================
  // Alle tidligere funn teller som funnet. ⏳ viser at du eier en eldre utgave med lavere kategori.
  let bokArt = 'ku';
  function apneBok(art = bokArt) {
    bokArt = art; const ai = ANIMALS.findIndex(a => a[1] === art); if (ai < 0) return;
    const ids = FOODS.map((_, fi) => ai * FOODS.length + fi), funnet = ci => S.disc.includes(ci);
    const eldreEid = ci => [...new Set(S.base.map((c, i) => c === ci && arvet(i) ? S.arv[i] : -1).filter(r => r >= 0))];
    const totalt = ids.filter(funnet).length;
    let h = '<div class="bokhode"><h2>📖 Matdyrboka: ' + ANIMALS[ai][0] + ' ' + esc(art) + '</h2><label class="liten">Art <select id="bokArt">' + ANIMALS.map(a => '<option value="' + esc(a[1]) + '"' + (a[1] === art ? ' selected' : '') + '>' + a[0] + ' ' + esc(a[1]) + '</option>').join('') + '</select></label></div>';
    h += '<p class="liten">' + totalt + ' av 25 funnet' + (totalt === 25 ? ' · 🏆 Hele arten!' : '') + '</p>';
    for (let r = 0; r < R.length; r++) {
      const rad = ids.filter(ci => COMBOS[ci].r === r); if (!rad.length) continue; const f = rad.filter(funnet).length;
      h += '<div class="bokrad"><span class="sjb" style="background:' + R[r].c + '">' + R[r].n + '</span><span>' + f + '/' + rad.length + '</span>' + (f === rad.length ? '<span class="merke">🏅</span>' : '') + '</div><div class="bokruter">';
      for (const ci of rad) {
        const c = COMBOS[ci], fu = funnet(ci), el = eldreEid(ci);
        const kl = 'bokrute' + (fu ? (r === 5 ? ' gud' : r === 6 ? ' hemmelig' : '') : r === 6 ? ' ukjent skjult' : ' ukjent');
        const innhold = fu ? '<span class="emo">' + c.f + c.a + '</span><span class="bn">' + esc(c.navn) + '</span>'
          : r === 6 ? '<span class="emo">❓</span><span class="bn">???</span>' : '<span class="emo">' + c.f + '❔</span><span class="bn">' + esc(c.mat) + '-' + esc(art) + '?</span>';
        h += '<div class="' + kl + '" style="border-color:' + (fu ? R[r].c : '') + '" title="' + (fu ? esc(c.navn + ' · ' + R[r].n) : 'Ikke funnet ennå') + '">' + innhold + el.map(er => '<span class="arvmerke">⏳ Din: ' + R[er].n + '</span>').join('') + '</div>';
      }
      h += '</div>';
    }
    const fg = COMBOS.filter((c, i) => c.r === 5 && funnet(i)).length, se = COMBOS.filter((c, i) => c.r === 6 && funnet(i)).length;
    h += '<p class="liten">Hele samlingen: ⭐ Food God ' + fg + '/' + POOLS[5].length + ' · 🌌 Secret ' + se + '/' + POOLS[6].length + ' · totalt ' + S.disc.length + '/' + COMBOS.length + '</p>';
    h += '<p class="liten">Alle matdyr du har funnet før, teller med. ⏳ betyr at du eier en eldre utgave med lavere kategori.</p>';
    h += '<div class="knapper"><button type="button" id="dLukk">Lukk</button></div>';
    apneDialog(h, 'dLukk'); $('dLukk').onclick = lukkDialog; $('bokArt').onchange = e => { apneBok(e.target.value); $('bokArt').focus(); };
  }
  // Test: lager en typisk gammel lagring (gammel fordeling) og migrerer den slik spillet gjør ved første start med ?fordeling=c.
  // Standardlagringen røres ikke.
  function gammelTestlagring() {
    const kuId = f => ANIMALS.findIndex(a => a[1] === 'ku') * FOODS.length + FOODS.findIndex(x => x[1] === f);
    const opp = COMBOS.map((c, i) => i).filter(i => GML_R[i] < COMBOS[i].r), ned = COMBOS.map((c, i) => i).filter(i => GML_R[i] > COMBOS[i].r);
    const hval = COMBOS.map((c, i) => i).filter(i => COMBOS[i].art === 'hval' && GML_R[i] < 4 && COMBOS[i].r >= 4);
    const base = [opp[0], opp[1], ned[0], kuId('Pizza'), kuId('Pizza'), hval[0], opp[40], opp[200], ...opp.slice(300, 304)];
    const gml = { v: 1, penger: 2.5e6, gard: { niva: 6 }, plassNiva: 12, base, disc: [...new Set([...base, ...COMBOS.map((c, i) => i).filter(i => COMBOS[i].art === 'ku' && i % 2 === 0), ...POOLS[5].slice(0, 2)])], bestilling: 15 };
    const m = migrerStd(gml); if (!m) return melding('Kunne ikke lage testlagring.');
    S = m; fyllBase(); lagre(); byggSpillGard(true); oppdaterKort(); oppdaterPanel();
    melding('🕰️ Gammel testlagring migrert: ' + Object.keys(S.arv).length + ' dyr har arvet kategori.', 6);
  }
  function hentStandardPaaNytt() {
    const m = hentStandard(); if (!m) return melding('Fant ingen standardlagring å hente.');
    S = m; fyllBase(); lagre(); byggSpillGard(true); oppdaterKort(); oppdaterPanel(); melding('📥 Standardlagringen er hentet og migrert. ' + Object.keys(S.arv).length + ' dyr har arvet kategori.', 6);
  }

  // =================== Skjerm: kort, panel og meldinger ===================
  let meldingTid = 0;
  function melding(t, sek = 4) { const m = $('melding'); m.textContent = t; m.hidden = false; meldingTid = sek; }
  const inntekt = () => { let s = 0; for (let i = 0; i < Math.min(aapneNa, S.base.length); i++) s += incB(i); return s; };
  function visKort() {
    $('kort').innerHTML = '<div class="hud"><b id="hPenger"></b> <span id="hInnt" class="liten2"></span></div><div class="hud2"><span id="hNiva"></span> · <span id="hPlass"></span></div>' +
      '<div class="liten">' + (I.TOUCH ? 'Styrespak: gå · Hopp nede til høyre · Handling ved siden av · Dra for kamera.' : 'WASD: gå · Mellomrom: hopp · E: handling · Dra med musa: kamera · Hjul: zoom') + '</div><div id="spillStatus" class="rute">📍 1. etasje (bakken)</div>';
    oppdaterKort();
  }
  function oppdaterKort() {
    if (!$('hPenger')) return;
    $('hPenger').textContent = '💰 ' + fmt(S.penger); $('hInnt').textContent = '+' + fmt(inntekt()) + '/s' + (SAMLE ? ' · i kassa ' + fmt(Math.floor(S.kasse || 0)) : '');
    $('hNiva').textContent = '🏡 Gårdsnivå ' + S.gard.niva + (I.sp.testNiva ? ' (viser ' + I.sp.testNiva + ')' : '') + (ERC ? ' · 🧪 Fordeling C' : '');
    $('hPlass').textContent = '🐮 ' + S.base.slice(0, aapneNa).filter(c => c >= 0).length + '/' + plasserApne() + ' plasser';
  }
  let visTest = false;
  function byggPanel() {
    const p = $('panel'); p.textContent = ''; const r1 = document.createElement('div'); r1.className = 'rad';
    const smal = innerWidth < 640; r1.append(I.knapp(smal ? '🏡 Nivå' : '🏡 Gårdsnivå', false, apneGardsniva, 'Gårdsnivå'), Object.assign(I.knapp('', false, kjopPlass), { id: 'bPlass' }), I.knapp('🧪', visTest, () => { visTest = !visTest; byggPanel(); }, 'Testvalg for prototypen'));
    if (ERC) r1.insertBefore(I.knapp(smal ? '📖' : '📖 Matdyrboka', false, () => apneBok(), 'Matdyrboka'), r1.lastChild);
    p.append(r1);
    if (visTest) {
      const r2 = document.createElement('div'); r2.className = 'rad test';
      [0, 10, 15].forEach(v => r2.append(I.knapp('Bestilling ' + v + ' %', S.bestilling === v, () => { S.bestilling = v; lagre(); byggPanel(); }, 'Bestillingsregn ' + v + ' prosent')));
      r2.append(I.knapp(ERC && S.bestilling === 0 ? '🎯 Garanti (av ved 0 %)' : garanti ? '🎯 Garanti på' : '🎯 Garanti av', garanti, () => { garanti = !garanti; byggPanel(); }, 'Bestillingsgaranti'));
      if (ERC) r2.append(I.knapp('🕰️ Gammel testlagring', false, gammelTestlagring), I.knapp('📥 Hent standardlagring', false, hentStandardPaaNytt));
      if (ERC && window.EVNToppsett) {
        const TS = EVNToppsett, slipp = r => { const rp = I.robot().position, ci = POOLS[r][Math.floor(Math.random() * POOLS[r].length)]; slippNed(ci, null); melding((r === 6 ? '🌌 ' : '⭐ ') + navn(ci) + ' faller ned på åkeren.'); };
        const neste = type => { const k = Object.keys(TS.VARIANTER[type]); TS.velg(type, k[(k.indexOf(TS.valgt[type]) + 1) % k.length]); byggSpillGard(true); byggPanel(); };
        r2.append(I.knapp('⭐ Slipp Food God', false, () => slipp(5)), I.knapp('🌌 Slipp Secret', false, () => slipp(6)),
          I.knapp('✨ Food God: ' + TS.valgt.gud, false, () => neste('gud'), 'Bytt utseende for Food God: ' + TS.VARIANTER.gud[TS.valgt.gud]),
          I.knapp('✨ Secret: ' + TS.valgt.hemmelig, false, () => neste('hemmelig'), 'Bytt utseende for Secret: ' + TS.VARIANTER.hemmelig[TS.valgt.hemmelig]));
      }
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
      const ci = COMBOS.findIndex((c, x) => c.r === min && (!art || c.art === art) && !S.base.includes(x)); if (ci >= 0) { S.base[i] = ci; ryddArv(i); lagt++; }
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
  I.krok.fane = f => { feltG.visible = levG.visible = samleG.visible = f === 'spill'; if (f !== 'spill') { slippBar(); $('handling').hidden = true; handlingTekst = ''; $('melding').hidden = true; lagre(); if (!$('dialog').hidden) lukkDialog(); } };
  I.krok.steg = (dt, t) => {
    if (I.sp.pause) return;
    oppdaterFelt(dt, t);
    if (SAMLE) S.kasse = (S.kasse || 0) + inntekt() * dt; else { if (S.kasse) { S.penger += S.kasse; S.kasse = 0; } S.penger += inntekt() * dt; }   // ?samle=0: penger i kassa går til lommeboka
    const r = I.robot();
    if (bar && bar.topp) bar.topp.oppdater(t); for (const tp of basePynt) tp.oppdater(t);
    if (bar && bar.flyr) flyBar(dt);
    else if (bar && r) { bar.m.position.set(r.position.x, r.position.y + 3.3, r.position.z); bar.m.rotation.y = r.rotation.y; if (bar.m.userData.fig && !I.REDUSERT) I.animerNy(bar.m.userData.fig, t, false); const i = naerPlass(r.position, true, 1.4); if (i >= 0) settInn(i); }
    handling = r ? finnHandling() : null; visHandling(); if (r) { oppdaterMerker(t); sjekkLevFelt(t); sjekkSamle(t, dt); }
    if ((kortTid -= dt) <= 0) { kortTid = 0.25; oppdaterKort(); oppdaterPanel(); }
    if ((lagreTid -= dt) <= 0) { lagreTid = 5; lagre(); }
    if (meldingTid > 0 && (meldingTid -= dt) <= 0) $('melding').hidden = true;
  };
  $('handling').addEventListener('click', gjorHandling);
  $('dialog').addEventListener('click', e => { if (e.target.id === 'dialog') lukkDialog(); });
  addEventListener('pagehide', () => lagre());
  document.addEventListener('visibilitychange', () => { if (document.hidden) lagre(); });

  // For automatiske tester (lagring, oppgradering, dobbelttrykk og flere faner)
  window.EVNProto = { SAMLE, samleOmr, iSamle, ERC, rB, incB, prisB, arvet, migrerStd, hentStandard, apneBok, gammelTestlagring, kallAktiv, kallKlart, kallFunnet, trekk, ODIN, garanti: v => (v !== undefined ? (garanti = v) : garanti), INC, PRICE, svakeste, harPlass, byttMed, apneBytte, iLevFelt, levOmr, velgPlass, ledige, forsteLedige, merker: () => merkG.children.map(c => c.userData.plass), iBasen, NOKKEL, S: () => S, sett: s => { S = rens(s) || ny(); fyllBase(); byggSpillGard(true); oppdaterKort(); oppdaterPanel(); }, lagre, lesLagret, kontroller, apneGardsniva, oppgrader, autoVelg, valg: () => valg, felt: () => felt, slippNed, bar: () => bar, finnHandling, gjorHandling, rens, plasserApne };
})();
