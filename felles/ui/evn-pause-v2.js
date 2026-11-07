/* EVN-PAUSE v2 start */
/* EVN-PAUSE v2: felles pause med spilletid og felles kart (samme kode i alle EVN-spill).
   Kart (v2): 🗺️-knapp ved siden av ⏸ og tasten M åpner et stort kart. Spillet står stille mens kartet er åpent.
   Spilletid lagres i localStorage 'evn-spilletid-<mappe>' = {dag, iDag, totalt} (millisekunder).
   Tiden telles bare når spillet er aktivt, fanen synes, pausen ikke er åpen og noen har rørt tast/mus/skjerm siste 3 min. */
window.EVNPause = function (cfg) {
  var NOKKEL = 'evn-spilletid-' + cfg.mappe, LEDIG = 180000, t = cfg.tema || {};
  var idag = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var tid = { dag: idag(), iDag: 0, totalt: 0 };
  try { var l = JSON.parse(localStorage.getItem(NOKKEL)); if (l && typeof l.totalt === 'number') tid = l; } catch (e) {}
  function lagreTid() { try { localStorage.setItem(NOKKEL, JSON.stringify(tid)); } catch (e) {} }
  function fmt(ms) { var m = Math.floor(ms / 60000), h = Math.floor(m / 60); return ms < 60000 ? 'under 1 min' : h ? h + ' t ' + (m % 60) + ' min' : m + ' min'; }

  var css = document.createElement('style');
  css.textContent =
    '#evnPauseKnapp,#evnKartKnapp{min-width:48px;min-height:48px;border-radius:12px;border:2px solid rgba(255,255,255,.4);background:rgba(0,0,0,.6);color:#fff;font:700 20px system-ui,sans-serif;cursor:pointer;touch-action:manipulation;pointer-events:auto;padding:0 10px}' +
    '#evnPauseKnapp[hidden],#evnKartKnapp[hidden]{display:none!important}' +
    '#evnKart{position:fixed;inset:0;z-index:99990;display:none;place-items:center;padding:12px;background:rgba(0,0,0,.55);touch-action:manipulation}' +
    '#evnKart.vis{display:grid}' +
    '#evnKart .kort{background:' + (t.panel || 'rgba(16,24,15,.95)') + ';color:' + (t.ink || '#fff') + ';border-radius:18px;padding:12px;max-width:100%;max-height:100%;box-shadow:0 10px 40px rgba(0,0,0,.5);font-family:' + (t.font || 'system-ui,sans-serif') + '}' +
    '#evnKart .topp{display:flex;align-items:center;gap:10px;margin:0 0 8px}' +
    '#evnKart h2{font-family:' + (t.head || t.font || 'system-ui,sans-serif') + ';font-weight:' + (t.headW || 900) + ';font-size:26px;line-height:1;margin:0;color:' + (t.hi || '#ffd54a') + '}' +
    '#evnKart .info{flex:1;font-size:14px;font-weight:700;opacity:.85;line-height:1.3}' +
    '#evnKart button{width:44px;height:44px;flex:none;border-radius:12px;border:0;background:rgba(127,127,127,.28);color:inherit;font:800 20px system-ui,sans-serif;cursor:pointer}' +
    '#evnKart canvas{display:block;border-radius:10px;image-rendering:pixelated}' +
    '#evnKart button:focus-visible,#evnKartKnapp:focus-visible{outline:3px solid ' + (t.hi || '#fff') + ';outline-offset:2px}' +
    '#evnPause{position:fixed;inset:0;z-index:99990;display:none;place-items:center;padding:16px;background:rgba(0,0,0,.45);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);touch-action:manipulation}' +
    '#evnPause.vis{display:grid}' +
    '#evnPause .kort{background:' + (t.panel || 'rgba(16,24,15,.95)') + ';color:' + (t.ink || '#fff') + ';border-radius:18px;padding:18px 20px;width:min(320px,100%);max-height:100%;overflow:auto;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5);font-family:' + (t.font || 'system-ui,sans-serif') + '}' +
    '#evnPause h2{font-family:' + (t.head || t.font || 'system-ui,sans-serif') + ';font-weight:' + (t.headW || 900) + ';font-size:38px;line-height:1;margin:0 0 6px;color:' + (t.hi || '#ffd54a') + '}' +
    '#evnPause .tider{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 6px}' +
    '#evnPause .tid{border-radius:12px;padding:8px 6px;background:rgba(127,127,127,.18)}' +
    '#evnPause .tid b{display:block;font-size:22px;line-height:1.15}#evnPause .tid small{font-size:13px;font-weight:700;opacity:.85}' +
    '#evnPause button{display:block;width:100%;min-height:48px;margin:8px 0 0;border-radius:12px;border:0;font:800 18px ' + (t.font || 'system-ui,sans-serif') + ';cursor:pointer}' +
    '#evnPause .fortsett{background:' + (t.btn || '#ffd54a') + ';color:' + (t.btnInk || '#2b1d00') + ';font-size:22px;min-height:56px' + (t.head ? ';font-family:' + t.head + ';font-weight:' + (t.headW || 800) : '') + '}' +
    '#evnPause .liten{background:rgba(127,127,127,.25);color:inherit}' +
    '#evnPause .styr{text-align:left;font-size:15px;line-height:1.45;margin:10px 0 0;padding:10px 12px;border-radius:12px;background:rgba(127,127,127,.15)}' +
    '#evnPause .tips{font-size:14px;opacity:.85;margin:10px 0 0}' +
    '#evnPause button:focus-visible,#evnPauseKnapp:focus-visible{outline:3px solid ' + (t.hi || '#fff') + ';outline-offset:2px}';
  document.head.appendChild(css);

  var knapp = document.createElement('button');
  knapp.id = 'evnPauseKnapp'; knapp.type = 'button'; knapp.textContent = '⏸'; knapp.title = 'Pause (P)'; knapp.setAttribute('aria-label', 'Pause'); knapp.hidden = true;
  var kartKnapp = null;
  if (cfg.kart) {
    kartKnapp = document.createElement('button');
    kartKnapp.id = 'evnKartKnapp'; kartKnapp.type = 'button'; kartKnapp.textContent = '🗺️'; kartKnapp.title = 'Kart (M)'; kartKnapp.setAttribute('aria-label', 'Kart'); kartKnapp.hidden = true;
  }
  if (cfg.knapp) cfg.knapp(knapp, kartKnapp); else { if (kartKnapp) document.body.appendChild(kartKnapp); document.body.appendChild(knapp); }

  var bak = document.createElement('div');
  bak.id = 'evnPause'; bak.setAttribute('role', 'dialog'); bak.setAttribute('aria-modal', 'true'); bak.setAttribute('aria-labelledby', 'evnPauseTittel');
  bak.innerHTML = '<div class="kort"><h2 id="evnPauseTittel">Pause</h2>' +
    '<div class="tider"><div class="tid"><small>I dag</small><b id="evnPauseIdag"></b></div><div class="tid"><small>Totalt</small><b id="evnPauseTot"></b></div></div>' +
    '<button class="fortsett" id="evnPauseFortsett" type="button">▶ Fortsett</button>' +
    '<button class="liten" id="evnPauseStyrKnapp" type="button" aria-expanded="false">🎮 Slik styrer du</button>' +
    '<div class="styr" id="evnPauseStyr" hidden></div>' +
    '<button class="liten" id="evnPauseAvslutt" type="button">🚪 Avslutt</button>' +
    '<p class="tips" id="evnPauseTips"></p></div>';
  document.body.appendChild(bak);
  var $ = function (id) { return document.getElementById(id); };
  var kartBak = null;
  if (cfg.kart) {
    kartBak = document.createElement('div');
    kartBak.id = 'evnKart'; kartBak.setAttribute('role', 'dialog'); kartBak.setAttribute('aria-modal', 'true'); kartBak.setAttribute('aria-labelledby', 'evnKartTittel');
    kartBak.innerHTML = '<div class="kort"><div class="topp"><h2 id="evnKartTittel">🗺️ Kart</h2><span class="info" id="evnKartInfo"></span>' +
      '<button type="button" id="evnKartLukk" aria-label="Lukk kartet">✕</button></div><canvas id="evnKartCv" role="img" aria-label="Kart over spillverdenen"></canvas></div>';
    document.body.appendChild(kartBak);
  }
  [bak, knapp, kartBak, kartKnapp].forEach(function (el) {
    if (el) ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
  });

  var apen = false, apnetTid = 0, venterAvslutt = false, kartApen = false;
  // T2: mens en dialog er åpen, kan ingenting bak den få fokus eller trykk (inert), og Tab blir i dialogen.
  var inertListe = [], aktivDialog = null;
  function settInert(dlg) {
    inertListe.forEach(function (el) { el.inert = false; }); inertListe = [];
    aktivDialog = dlg || null;
    if (!dlg) return;
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== dlg && !el.contains(dlg) && !el.inert && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') { el.inert = true; inertListe.push(el); }
    });
  }
  window.EVNPauseInert = settInert;
  // Tab og Shift+Tab går rundt i den åpne dialogen i stedet for ut av siden (på window, før pausens egen tastaturhåndtering)
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !aktivDialog) return;
    var f = Array.prototype.filter.call(aktivDialog.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'), function (el) { return !el.disabled && !el.hidden && el.getClientRects().length > 0; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  }, true);
  var avsluttLenke = function () { var a = $(cfg.avsluttId); return a && getComputedStyle(a).display !== 'none' ? a : null; };
  var sporsmal = function () { return $('evnSporsmal'); };
  var sporsmalApent = function () { var s = sporsmal(); return !!s && s.style.display === 'grid'; };
  function kan() { return !apen && !kartApen && !venterAvslutt && !sporsmalApent() && cfg.kanPause(); }

  // ---------- Kart ----------
  function tegnKart() {
    if (!kartApen) return;
    var K = cfg.kart, cv = $('evnKartCv'), f = K.forhold || 1;
    var maksB = Math.min(innerWidth - 48, 900), maksH = innerHeight - 110;
    var b = Math.max(120, Math.min(maksB, maksH * f)), h = b / f;
    var d = Math.min(2, window.devicePixelRatio || 1);
    cv.style.width = Math.round(b) + 'px'; cv.style.height = Math.round(h) + 'px';
    cv.width = Math.round(b * d); cv.height = Math.round(h * d);
    kartBak.querySelector('.kort').style.width = Math.round(b + 24) + 'px';   // kortet like bredt som kartet
    var c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    try { K.tegn(c, cv.width, cv.height, cv); } catch (e) {}
    $('evnKartInfo').textContent = K.info ? K.info() : '';
  }
  function apneKart() {
    if (!cfg.kart || !kan()) return;
    cfg.pause(); kartApen = true; apnetTid = performance.now();
    kartBak.classList.add('vis'); knapp.hidden = true; kartKnapp.hidden = true; settInert(kartBak);
    tegnKart();
    try { $('evnKartLukk').focus({ preventScroll: true }); } catch (e) {}
  }
  function lukkKart(fraKlikk) {
    if (!kartApen) return;
    kartApen = false; kartBak.classList.remove('vis'); settInert(null);
    cfg.fortsett(!!fraKlikk);
  }
  if (cfg.kart) {
    kartKnapp.addEventListener('click', function () { apneKart(); });
    $('evnKartLukk').addEventListener('click', function () { lukkKart(true); });
    kartBak.addEventListener('click', function (e) { if (e.target === kartBak) lukkKart(true); });   // trykk utenfor kartet lukker
    window.addEventListener('resize', tegnKart);
  }

  function apne(grunn) {
    if (!kan()) return;
    cfg.pause();
    apen = true; apnetTid = performance.now();
    $('evnPauseIdag').textContent = fmt(tid.iDag); $('evnPauseTot').textContent = fmt(tid.totalt);
    $('evnPauseTips').textContent = grunn || 'Spillet står stille. Ingenting er borte.';
    $('evnPauseStyr').hidden = true; $('evnPauseStyrKnapp').setAttribute('aria-expanded', 'false');
    $('evnPauseAvslutt').hidden = !avsluttLenke() || !sporsmal();
    bak.classList.add('vis'); knapp.hidden = true; lagreTid(); settInert(bak);
    try { $('evnPauseFortsett').focus({ preventScroll: true }); } catch (e) {}
  }
  function lukk(fraKlikk) {
    if (!apen) return;
    apen = false; bak.classList.remove('vis'); settInert(null);
    cfg.fortsett(!!fraKlikk);
  }
  knapp.addEventListener('click', function () { apne(); });
  $('evnPauseFortsett').addEventListener('click', function () { lukk(true); });
  $('evnPauseStyrKnapp').addEventListener('click', function () {
    var s = $('evnPauseStyr'); if (s.hidden) s.innerHTML = cfg.styring(); s.hidden = !s.hidden; this.setAttribute('aria-expanded', String(!s.hidden));
  });
  // Avslutt fra pausen: spillet står stille mens «Vil du avslutte?» vises. «Nei, spill videre» = fortsett.
  function visSporsmal() { venterAvslutt = true; var s = sporsmal(); s.style.display = 'grid'; settInert(s); var b = $('evnBli'); if (b) b.focus(); }
  $('evnPauseAvslutt').addEventListener('click', function () { apen = false; bak.classList.remove('vis'); if (cfg.lagre) cfg.lagre(); visSporsmal(); });
  // Avslutt-knappen i spillet: spillet stopper også mens spørsmålet vises
  document.addEventListener('click', function (e) {
    var a = avsluttLenke(); if (!a || !a.contains(e.target) || venterAvslutt || apen || !cfg.kanPause()) return;
    cfg.pause(); venterAvslutt = true;
  }, true);
  function nei() { if (!venterAvslutt) return; venterAvslutt = false; var s = sporsmal(); if (s) s.style.display = 'none'; settInert(null); cfg.fortsett(false); }
  document.addEventListener('click', function (e) { var b = $('evnBli'); if (b && b.contains(e.target)) setTimeout(nei, 0); }, true);

  window.addEventListener('keydown', function (e) {
    var k = e.code || e.key;
    if (venterAvslutt && sporsmalApent()) { if (k === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); nei(); } return; }
    if (kartApen) {
      e.stopImmediatePropagation();                                  // spillet får ingen taster mens kartet er åpent
      if ((k === 'Escape' || k === 'KeyM') && !e.repeat && performance.now() - apnetTid > 200) { e.preventDefault(); lukkKart(false); }
      return;
    }
    if (k === 'KeyM' && cfg.kart && !e.repeat && kan()) { e.preventDefault(); e.stopImmediatePropagation(); apneKart(); return; }
    if (apen) {
      e.stopImmediatePropagation();                                  // spillet får ingen taster mens pausen er åpen
      if ((k === 'Escape' || k === 'KeyP') && !e.repeat && performance.now() - apnetTid > 300) { e.preventDefault(); lukk(k === 'KeyP'); }
      return;
    }
    if ((k === 'KeyP' || (k === 'Escape' && (typeof cfg.escPause === 'function' ? cfg.escPause() : cfg.escPause !== false))) && !e.repeat && kan()) { e.preventDefault(); e.stopImmediatePropagation(); apne(); }
  }, true);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { apne('Pause fordi du byttet fane eller app.'); lagreTid(); } });
  window.addEventListener('blur', function () { apne('Pause fordi du gikk ut av spillet.'); });
  window.addEventListener('pagehide', lagreTid);

  var sistRort = performance.now(), sist = performance.now(), sistLagret = 0;
  ['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function () { sistRort = performance.now(); }, { passive: true, capture: true }); });
  setInterval(function () {
    var naa = performance.now(), dt = Math.min(2000, naa - sist); sist = naa;
    knapp.hidden = apen || kartApen || venterAvslutt || !cfg.kanPause();
    if (kartKnapp) kartKnapp.hidden = knapp.hidden;
    var dag = idag(); if (tid.dag !== dag) { tid.dag = dag; tid.iDag = 0; }
    if (!apen && !venterAvslutt && !document.hidden && naa - sistRort < LEDIG && cfg.aktiv()) { tid.iDag += dt; tid.totalt += dt; }
    if (naa - sistLagret > 15000) { sistLagret = naa; lagreTid(); }
  }, 250);
  return { apne: apne, lukk: lukk, apneKart: apneKart, lukkKart: lukkKart, erApen: function () { return apen || kartApen; }, tid: function () { return tid; } };
};
/* EVN-PAUSE v2 slutt */
