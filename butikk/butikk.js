/*
 * E-shop på evnstudio.no: butikk, garderobe og lommebok for E-coins.
 * All lagring går gjennom den felles modulen ecoins/ecoins.js (window.EVNEcoins). Ingen nettverk, ingen persondata.
 * Roboten og tilbehøret tegnes med ecoins/tilbehor-3d.js, den samme koden som 3D-spillene bruker.
 */
(function () {
  'use strict';
  var E = window.EVNEcoins;
  var $ = function (id) { return document.getElementById(id); };
  if (!E) { $('sceneTekst').textContent = 'E-shop kunne ikke lastes. Prøv å laste siden på nytt.'; return; }

  var VARER = E.varer, VARE = {}; VARER.forEach(function (v) { VARE[v.id] = v; });
  var redusert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ikon = '<svg class="ecoin" aria-hidden="true"><use href="#ecoin"/></svg>';
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var filter = 'alle', prover = null, bilder = {};
  if (!E.lagrerPaEnheten()) $('lagerInfo').hidden = false;

  /* ====================== 3D ====================== */
  var lerret = $('scene'), renderer, scene, kamera, mix, klipp = {}, omdreier, tilbehor, sokkel, ring;
  var snu = -0.35, snuMal = -0.35, dra = false, dx0 = 0, snu0 = 0, hodeMidt = null;

  function farge(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function visAntrekk() {
    if (!tilbehor) return;
    var a = E.antrekk();
    if (prover) a[VARE[prover].plass] = prover;
    tilbehor.vis(a);
  }
  function start3d() {
    renderer = new THREE.WebGLRenderer({ canvas: lerret, antialias: true, alpha: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new THREE.Scene();
    kamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2350, 0.55));
    var sol = new THREE.DirectionalLight(0xfff2d6, 1.15); sol.position.set(3, 6, 5); scene.add(sol);
    var kant = new THREE.DirectionalLight(0x8a9dff, 0.45); kant.position.set(-4, 3, -5); scene.add(kant);
    sokkel = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.12, 40), new THREE.MeshStandardMaterial({ color: farge(0x1a2350), roughness: 0.6 }));
    sokkel.position.y = -0.06; scene.add(sokkel);
    ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.02, 8, 60), new THREE.MeshBasicMaterial({ color: 0x19c3ff }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.002; scene.add(ring);

    fetch('../ecoins/helt-robot-v2.glb').then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (buf) {
      new THREE.GLTFLoader().parse(buf, '', function (gltf) {
        var robot = gltf.scene;
        robot.traverse(function (o) { if (o.isMesh) { o.frustumCulled = false; if (o.material && o.material.name === 'Main') o.material.color.setHex(0xffcc00).convertSRGBToLinear(); } });
        mix = new THREE.AnimationMixer(robot);
        gltf.animations.forEach(function (a) { klipp[a.name] = mix.clipAction(a); });
        klipp.Idle.play(); mix.update(0);
        tilbehor = EVNTilbehor.lag(THREE, robot);
        var box = new THREE.Box3().setFromObject(robot), k = 2 / (box.max.y - box.min.y);
        var hode = null; robot.traverse(function (o) { if (o.isMesh && o.name === 'Head_3') hode = o; });
        omdreier = new THREE.Group(); scene.add(omdreier);
        robot.scale.setScalar(k); robot.position.y = -box.min.y * k; omdreier.add(robot);
        omdreier.updateMatrixWorld(true);
        hodeMidt = hode ? new THREE.Box3().setFromObject(hode).getCenter(new THREE.Vector3()) : new THREE.Vector3(0, 1.6, 0);
        lagBilder();
        visAntrekk(); tegnAlt();
        storrelse(); requestAnimationFrame(loop);
      }, feil3d);
    }).catch(feil3d);
  }
  function feil3d() { $('sceneTekst').textContent = 'Roboten kunne ikke vises på denne enheten. Butikken virker likevel.'; lerret.hidden = true; tegnAlt(); }

  function lagBilder() {
    // Ett bilde per vare: roboten med bare denne tingen
    var r;
    try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return; }
    r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.setPixelRatio(1); r.setSize(256, 256);
    var k = new THREE.PerspectiveCamera(30, 1, 0.1, 100), hm = hodeMidt;
    sokkel.visible = ring.visible = false;
    VARER.forEach(function (v) {
      var a = {}; a[v.plass] = v.id; tilbehor.vis(a);
      if (v.plass === 'hode') { omdreier.rotation.y = -0.45; k.position.set(hm.x + 0.6, hm.y + 0.6, hm.z + 2.35); k.lookAt(hm.x, hm.y + 0.14, hm.z); }
      else { omdreier.rotation.y = Math.PI * 0.82; k.position.set(0.45, 1.3, 2.7); k.lookAt(0, 0.92, 0); }
      omdreier.updateMatrixWorld(true);
      r.render(scene, k); bilder[v.id] = r.domElement.toDataURL('image/png');
    });
    r.dispose(); try { r.forceContextLoss(); } catch (e) {}
    omdreier.rotation.y = snu; sokkel.visible = ring.visible = true;
  }
  function storrelse() {
    if (!renderer) return;
    var b = lerret.clientWidth, h = lerret.clientHeight; if (!b || !h) return;
    renderer.setSize(b, h, false); kamera.aspect = b / h;
    kamera.fov = b / h < 0.9 ? 38 : 30; kamera.updateProjectionMatrix();
    kamera.position.set(0, 2.0, b / h < 0.9 ? 5.9 : 5.0); kamera.lookAt(0, 0.92, 0);
  }
  window.addEventListener('resize', storrelse);
  var forrige = performance.now();
  function loop(n) {
    var dt = Math.min(0.05, (n - forrige) / 1000); forrige = n;
    if (!document.hidden) {
      if (mix) mix.update(dt);
      if (!dra) snu += (snuMal - snu) * Math.min(1, dt * 6);
      if (omdreier) omdreier.rotation.y = snu;
      renderer.render(scene, kamera);
    }
    requestAnimationFrame(loop);
  }
  lerret.addEventListener('pointerdown', function (e) { dra = true; dx0 = e.clientX; snu0 = snu; try { lerret.setPointerCapture(e.pointerId); } catch (x) {} lerret.style.cursor = 'grabbing'; });
  lerret.addEventListener('pointermove', function (e) { if (dra) { snu = snu0 + (e.clientX - dx0) * 0.012; snuMal = snu; } });
  ['pointerup', 'pointercancel'].forEach(function (t) { lerret.addEventListener(t, function () { dra = false; lerret.style.cursor = 'grab'; }); });
  function visRygg(ja) { snuMal = ja ? Math.PI * 0.8 : -0.35; }
  function jubel() {
    if (redusert || !klipp.Wave || !klipp.Idle) return;
    var w = klipp.Wave; w.reset(); w.setLoop(THREE.LoopOnce, 1); w.crossFadeFrom(klipp.Idle, 0.2, false).play();
    setTimeout(function () { klipp.Idle.reset().play(); klipp.Idle.crossFadeFrom(w, 0.3, false); }, 1700);
  }

  /* ====================== Grensesnitt ====================== */
  function tegnSaldo(dunk) {
    var s = E.saldo();
    $('saldo').textContent = s; $('saldoKnapp').setAttribute('aria-label', 'Du har ' + s + ' E-coins. Åpne lommeboka');
    if (dunk) { var k = $('saldoKnapp'); k.classList.remove('dunk'); void k.offsetWidth; k.classList.add('dunk'); }
  }
  function bildeHtml(id) { return bilder[id] ? '<img src="' + bilder[id] + '" alt="">' : ''; }
  function tegnVarer() {
    var rot = $('varer'); rot.innerHTML = '';
    var saldo = E.saldo(), a = E.antrekk();
    $('tomLomme').hidden = saldo > 0;
    VARER.forEach(function (v) {
      if (filter !== 'alle' && v.plass !== filter) return;
      var eid = E.eier(v.id), rad = saldo >= v.pris, paa = a[v.plass] === v.id;
      var el = document.createElement('article'); el.className = 'vare' + (prover === v.id ? ' valgt' : '');
      el.innerHTML =
        '<button class="bilde" aria-label="Prøv ' + esc(v.navn) + ' på roboten">' + bildeHtml(v.id) + '</button>' +
        (paa ? '<span class="merke">På nå</span>' : '') +
        '<h3>' + esc(v.navn) + '</h3>' +
        (eid ? '<span class="eid">✓ Du eier denne</span>' : '<span class="pris">' + ikon + v.pris + ' <span class="sr">E-coins</span></span>') +
        '<div class="mangler">' + (!eid && !rad ? 'Du trenger ' + (v.pris - saldo) + ' til' : '') + '</div>' +
        '<div class="knapper"><button class="knapp" data-prov>' + (prover === v.id ? 'Ta av' : 'Prøv') + '</button>' +
        (eid ? '<button class="knapp gronn" data-paa' + (paa ? ' disabled' : '') + '>' + (paa ? 'På ✓' : 'Ta på') + '</button>'
             : '<button class="knapp hoved" data-kjop' + (rad ? '' : ' disabled') + '>Kjøp</button>') + '</div>';
      el.querySelector('.bilde').onclick = el.querySelector('[data-prov]').onclick = function () { prov(prover === v.id ? null : v.id); };
      var k = el.querySelector('[data-kjop]'); if (k) k.onclick = function () { sporKjop(v.id); };
      var p = el.querySelector('[data-paa]'); if (p) p.onclick = function () { taPa(v.plass, v.id); };
      rot.appendChild(el);
    });
  }
  function prov(id) {
    prover = id || null;
    var v = prover && VARE[prover];
    $('sceneTekst').innerHTML = v ? 'Du prøver <b>' + esc(v.navn) + '</b>.' : 'Dra i roboten for å snu den.';
    $('tilbakestill').hidden = !v;
    visRygg(!!(v && v.plass === 'rygg')); visAntrekk(); tegnVarer();
    if (v) { var r = lerret.getBoundingClientRect(); if (r.bottom < 80 || r.top > innerHeight - 80) document.querySelector('.scene-kort').scrollIntoView({ behavior: redusert ? 'auto' : 'smooth', block: 'start' }); }
  }
  $('tilbakestill').onclick = function () { prov(null); };
  function taPa(plass, id) {
    var r = E.taPa(plass, id);
    prov(null); visRygg(plass === 'rygg' && !!id); if (id && r.ok) jubel();
    $('lagret').textContent = r.ok || r.grunn === 'uendret' ? '✓ Lagret. Roboten har dette på i alle spillene.' : 'Det gikk ikke å lagre. Prøv igjen.';
  }
  function tegnGarderobe() {
    var a = E.antrekk();
    ['hode', 'rygg'].forEach(function (plass) {
      var rad = $('rad-' + plass); rad.innerHTML = '';
      var eide = VARER.filter(function (v) { return v.plass === plass && E.eier(v.id); });
      [{ id: null, navn: 'Ingen' }].concat(eide).forEach(function (v) {
        var b = document.createElement('button'); b.setAttribute('aria-pressed', String(a[plass] === v.id));
        b.innerHTML = v.id ? bildeHtml(v.id) + esc(v.navn) : '<span class="ingen" aria-hidden="true">∅</span>Ingen';
        b.onclick = function () { taPa(plass, v.id); };
        rad.appendChild(b);
      });
      if (!eide.length) { var p = document.createElement('p'); p.className = 'tom'; p.textContent = plass === 'hode' ? 'Du har ingen hatter ennå. Se i butikken!' : 'Du har ingenting til ryggen ennå.'; rad.appendChild(p); }
    });
  }
  function tegnLomme() {
    var d = E.data();
    $('l-saldo').textContent = E.saldo(); $('l-tjent').textContent = E.tjent(); $('l-brukt').textContent = E.brukt();
    var rot = $('spilliste'), apne = {};
    rot.querySelectorAll('details[open]').forEach(function (x) { apne[x.dataset.s] = 1; });
    rot.innerHTML = '';
    E.spill.forEach(function (s) {
      if (s.kommer) return;
      var gjort = s.m.filter(function (m) { return d.tjent[m[0]]; });
      var igjen = s.m.reduce(function (sum, m) { return sum + (d.tjent[m[0]] ? 0 : m[1]); }, 0);
      var el = document.createElement('details'); el.className = 'spill'; el.dataset.s = s.id; if (apne[s.id]) el.open = true;
      el.innerHTML = '<summary><span class="navn">' + esc(s.navn) + '</span><span class="igjen">' + gjort.length + ' av ' + s.m.length + ' klart<br>' + igjen + ' E-coins igjen å tjene</span></summary>' +
        '<div class="mal" aria-hidden="true"><i style="width:' + (100 * gjort.length / s.m.length) + '%"></i></div>' +
        '<ul>' + s.m.map(function (m) { var ok = !!d.tjent[m[0]]; return '<li class="' + (ok ? 'gjort' : '') + '"><span class="ok" aria-label="' + (ok ? 'Klart' : 'Ikke klart ennå') + '">' + (ok ? '✅' : '⬜') + '</span><span class="t">' + esc(m[2]) + '</span><b>' + m[1] + '</b></li>'; }).join('') + '</ul>';
      rot.appendChild(el);
    });
  }
  function tegnAlt() { tegnSaldo(); tegnVarer(); tegnGarderobe(); tegnLomme(); }

  /* ---- Dialog ---- */
  var fokusFor = null;
  function dialog(o) {
    fokusFor = document.activeElement;
    $('d-bilde').src = o.bilde || ''; $('d-bilde').hidden = !o.bilde;
    $('d-tittel').textContent = o.tittel; $('d-tekst').innerHTML = o.tekst;
    var k = $('d-knapper'); k.innerHTML = '';
    o.knapper.forEach(function (b) { var el = document.createElement('button'); el.className = 'knapp ' + (b.klasse || ''); el.textContent = b.tekst; el.onclick = function () { lukk(); if (b.gjor) b.gjor(); }; k.appendChild(el); });
    $('slor').hidden = false; k.firstElementChild.focus();   // tryggeste valg først: Enter to ganger kjøper eller sletter ikke
  }
  function lukk() { $('slor').hidden = true; if (fokusFor && fokusFor.focus && document.contains(fokusFor)) fokusFor.focus(); }
  $('slor').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') lukk();
    if (e.key === 'Tab') { var f = [].slice.call($('d-knapper').children), i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });
  $('slor').addEventListener('click', function (e) { if (e.target === $('slor')) lukk(); });

  function sporKjop(id) {
    var v = VARE[id], s = E.saldo();
    if (E.eier(id) || s < v.pris) return;
    dialog({ bilde: bilder[id], tittel: 'Kjøpe ' + v.navn + '?',
      tekst: '<p>Den koster <b>' + v.pris + ' E-coins</b>.</p><p>Du har ' + s + '. Etterpå har du <b>' + (s - v.pris) + '</b>.</p>',
      knapper: [{ tekst: 'Nei' }, { tekst: 'Ja, kjøp', klasse: 'hoved', gjor: function () { kjop(id); } }] });
  }
  function kjop(id) {
    var v = VARE[id], r = E.kjop(id);
    if (r.ok) {
      tegnSaldo(true);
      dialog({ bilde: bilder[id], tittel: 'Du kjøpte ' + v.navn + '! 🎉', tekst: '<p>Vil du ta den på nå?</p>',
        knapper: [{ tekst: 'Senere' }, { tekst: 'Ta på', klasse: 'gronn', gjor: function () { taPa(v.plass, id); } }] });
    } else {
      var t = { eid: 'Du eier den allerede.', rad: 'Du har ikke nok E-coins.', lagring: 'Det gikk ikke å lagre. Ingen E-coins ble trukket.' }[r.grunn] || 'Noe gikk galt. Ingen E-coins ble trukket.';
      dialog({ tittel: 'Kjøpet ble ikke gjort', tekst: '<p>' + t + '</p>', knapper: [{ tekst: 'OK', klasse: 'hoved' }] });
    }
  }
  $('nullstill').onclick = function () {
    dialog({ tittel: 'Slette alle E-coins?', tekst: '<p>Alle E-coins og klær på denne enheten blir borte. Spillene beholder fremgangen sin, og neste gang du åpner et spill, får du E-coins igjen for det du har klart der.</p><p>Klærne må kjøpes på nytt.</p>',
      knapper: [{ tekst: 'Nei' }, { tekst: 'Ja, slett', klasse: 'hoved', gjor: function () { E.nullstill(); prov(null); } }] });
  };

  /* ---- Faner ---- */
  var faner = [].slice.call(document.querySelectorAll('[role=tab]'));
  function velgFane(f) {
    faner.forEach(function (t) { var s = t === f; t.setAttribute('aria-selected', s); t.tabIndex = s ? 0 : -1; $(t.getAttribute('aria-controls')).hidden = !s; });
    if (f.id !== 'fane-butikk' && prover) prov(null);
    if (location.hash !== '#' + f.id.slice(5)) history.replaceState(null, '', '#' + f.id.slice(5));
  }
  faner.forEach(function (t, i) {
    t.onclick = function () { velgFane(t); };
    t.onkeydown = function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { var n = faner[(i + d + faner.length) % faner.length]; n.focus(); velgFane(n); } };
  });
  $('saldoKnapp').onclick = function () { velgFane($('fane-lomme')); };
  $('visTjen').onclick = function () { velgFane($('fane-lomme')); $('fane-lomme').focus(); };
  document.querySelectorAll('.filter button').forEach(function (b) {
    b.onclick = function () { filter = b.dataset.f; document.querySelectorAll('.filter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); tegnVarer(); };
  });
  var start = { '#garderobe': 'fane-garderobe', '#lomme': 'fane-lomme' }[location.hash];
  if (start) velgFane($(start));

  // Endringer (også fra et spill i en annen fane) tegnes på nytt
  E.pa(function () { visAntrekk(); tegnAlt(); });

  tegnAlt();
  try { start3d(); } catch (e) { feil3d(); }
  window.__eshop = { prov: prov };
})();
