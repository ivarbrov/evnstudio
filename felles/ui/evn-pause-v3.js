/* EVN-PAUSE v3 start */
/* EVN-PAUSE v3: felles ☰ Meny, pause, hjelp, lyd, kart, snarveier og spilletid (samme kode i alle EVN-spill).
   Kilde: felles/ui/evn-pause-v3.js. Kopien i et spill rettes aldri på stedet. Endringer gir v4 (EVN UI-standard 1.1).
   Bakoverkompatibel med v2: samme cfg (mappe, avsluttId, tema, kart, kanPause, aktiv, pause, fortsett, lagre, styring, escPause)
   og samme ID-er (#evnPauseKnapp, #evnPause .kort, #evnPauseFortsett, #evnKart, #evnKartKnapp), så ecoins.js og testene virker som før.
   Nytt i v3 (alle valgfrie):
     lyd:     { pa: () => bool, sett: bool => void }            → 🔊/🔇 Lyd i menyen og tasten L. Spillet lagrer valget i sin egen nøkkel.
     sekk:    { apne: fn, ikon: '🎒', navn: 'Sekk', tast: 'KeyI', snarvei: true }  → i menyen, tasten I, snarvei oppe til høyre.
     kart.snarvei (standard true): 🗺️ som snarvei oppe til høyre. Høyst to snarveier (UI3, vedtak 7.11.2026).
     egne:    [{ id, ikon, navn, gjor: fn }]                   → spillets egne ruter, mellom kartet og E-shop.
     innstillinger: fn                                          → ⚙️ Innstillinger åpner spillets eget panel.
     butikk:  true                                              → 🛒 E-shop og 👕 Garderobe (lagrer først, går til /butikk/).
     plassering: { meny: el => void, snarveier: el => void }   → spillet setter knappene inn i sin egen HUD. Ellers festes de i hjørnene.
   Taster: P og Esc (meny), M (kart), L (lyd), I (sekk). Esc lukker det øverste som er åpent. Tab blir i den åpne dialogen.
   Spilletid lagres i localStorage 'evn-spilletid-<mappe>' = {dag, iDag, totalt} (millisekunder), som i v2. */
window.EVNPause = function (cfg) {
  var VERSJON = 3, NOKKEL = 'evn-spilletid-' + cfg.mappe, LEDIG = 180000, t = cfg.tema || {};
  var font = t.font || 'system-ui,sans-serif', head = t.head || font, hi = t.hi || '#ffd54a';
  var idag = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var tid = { dag: idag(), iDag: 0, totalt: 0 };
  try { var l = JSON.parse(localStorage.getItem(NOKKEL)); if (l && typeof l.totalt === 'number') tid = l; } catch (e) {}
  function lagreTid() { try { localStorage.setItem(NOKKEL, JSON.stringify(tid)); } catch (e) {} }
  function fmt(ms) { var m = Math.floor(ms / 60000), h = Math.floor(m / 60); return ms < 60000 ? 'under 1 min' : h ? h + ' t ' + (m % 60) + ' min' : m + ' min'; }
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var BUTIKK = (function () { try { return new URL('../../butikk/', location.href).href; } catch (e) { return '/butikk/'; } })();

  // ---------- Utseende: felles former, spillets farger ----------
  var knappStil = 'min-width:48px;min-height:48px;border-radius:14px;border:0;background:' + (t.hud || 'rgba(255,255,255,.92)') + ';color:' + (t.hudInk || '#1d2440') +
    ';font:800 18px ' + font + ';cursor:pointer;touch-action:manipulation;pointer-events:auto;box-shadow:0 3px 10px rgba(0,0,0,.18);display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px';
  var css = document.createElement('style');
  css.textContent =
    '.evnHjorne{position:fixed;z-index:15;display:flex;gap:8px;pointer-events:none;top:calc(10px + env(safe-area-inset-top))}' +
    '#evnHjorneV{left:calc(10px + env(safe-area-inset-left))}#evnHjorneH{right:calc(10px + env(safe-area-inset-right))}' +
    '#evnPauseKnapp,#evnKartKnapp,#evnSekkKnapp{' + knappStil + '}' +
    '#evnKartKnapp,#evnSekkKnapp{width:48px;padding:0;font-size:22px}' +
    '#evnPauseKnapp .ikon{font-size:22px;line-height:1}' +
    '#evnPauseKnapp[hidden],#evnKartKnapp[hidden],#evnSekkKnapp[hidden]{display:none!important}' +
    '#evnPauseKnapp:focus-visible,#evnKartKnapp:focus-visible,#evnSekkKnapp:focus-visible{outline:3px solid ' + hi + ';outline-offset:2px}' +
    '#evnKart,#evnPause{position:fixed;inset:0;z-index:99990;display:none;place-items:center;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));background:rgba(0,0,0,.45);touch-action:manipulation}' +
    '#evnKart.vis,#evnPause.vis{display:grid}' +
    '#evnPause{-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
    '#evnKart .kort,#evnPause .kort{background:' + (t.panel || 'rgba(16,24,15,.95)') + ';color:' + (t.ink || '#fff') + ';border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.5);font-family:' + font + ';max-width:100%;max-height:100%;overflow:auto;animation:evnInn .16s ease-out}' +
    '@keyframes evnInn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#evnKart .kort,#evnPause .kort{animation:none}}' +
    '#evnKart .kort{padding:12px}' +
    '#evnKart .topp,#evnPause .topp{display:flex;align-items:center;gap:10px;margin:0 0 8px}' +
    '#evnKart h2,#evnPause h2{flex:1;text-align:left;font-family:' + head + ';font-weight:' + (t.headW || 900) + ';font-size:28px;line-height:1;margin:0;color:' + hi + '}' +
    '#evnKart .info{flex:2;font-size:14px;font-weight:700;opacity:.85;line-height:1.3}' +
    '#evnKart .lukk,#evnPause .lukk{width:48px;height:48px;flex:none;border-radius:14px;border:0;background:rgba(127,127,127,.28);color:inherit;font:800 22px ' + font + ';cursor:pointer}' +
    '#evnKart canvas{display:block;border-radius:10px;image-rendering:pixelated}' +
    '#evnPause .kort{padding:16px 18px;width:min(420px,100%);text-align:center;display:flex;flex-direction:column}' +
    '#evnPause .topp{order:0}#evnPause .tider{order:1}#evnPause .fortsett{order:2}#evnPause .ruter{order:3}#evnPause .styr{order:4}#evnPause .kort>a{order:5}#evnPause .tips{order:6}' +
    '#evnPause .tider{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 8px}' +
    '#evnPause .tid{border-radius:12px;padding:6px;background:rgba(127,127,127,.18)}' +
    '#evnPause .tid b{display:block;font-size:20px;line-height:1.15}#evnPause .tid small{font-size:13px;font-weight:700;opacity:.85}' +
    '#evnPause button,#evnPause a.rute{font-family:' + font + ';cursor:pointer;touch-action:manipulation}' +
    '#evnPause .fortsett{display:block;width:100%;min-height:56px;margin:8px 0 0;border-radius:14px;border:0;background:' + (t.btn || '#ffd54a') + ';color:' + (t.btnInk || '#2b1d00') + ';font-size:22px;font-weight:800' + (t.head ? ';font-family:' + t.head + ';font-weight:' + (t.headW || 800) : '') + '}' +
    '#evnPause .ruter{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;margin:8px 0 0}' +
    '#evnPause .rute{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:72px;padding:8px 6px;border-radius:14px;border:0;background:rgba(127,127,127,.22);color:inherit;font-size:15px;font-weight:800;line-height:1.15;text-decoration:none}' +
    '#evnPause .rute .ikon{font-size:26px;line-height:1}' +
    '#evnPause .rute .tast{position:absolute;top:4px;right:6px;font-size:11px;border:2px solid currentColor;border-radius:6px;padding:0 4px;opacity:.7}' +
    '#evnPause[data-inndata=touch] .tast{display:none}' +
    '#evnPause .rute.avslutt{background:rgba(127,127,127,.12)}' +
    '#evnPause .styr{text-align:left;font-size:15px;line-height:1.45;margin:8px 0 0;padding:10px 12px;border-radius:12px;background:rgba(127,127,127,.15)}' +
    '#evnPause .tips{font-size:14px;opacity:.85;margin:8px 0 0}' +
    '#evnPause button:focus-visible,#evnPause a:focus-visible,#evnKart button:focus-visible{outline:3px solid ' + hi + ';outline-offset:2px}' +
    // Smal skjerm: bare ☰ (48 px). Lav skjerm (liggende mobil): bredere kort, fire ruter i bredden og uten spilletid, så Fortsett og rutene får plass.
    '@media (max-width:400px){#evnPauseKnapp .tekst{display:none}#evnPauseKnapp{width:48px;padding:0}#evnPause .kort{padding:12px}#evnPause .ruter{grid-template-columns:repeat(3,1fr);gap:6px}#evnPause .rute{min-height:64px;font-size:13px;padding:6px 2px}}' +
    '@media (max-height:500px){#evnPause .kort{width:min(640px,100%);padding:10px 14px;display:grid;grid-template-columns:1fr auto auto;column-gap:8px;align-items:center}#evnPause .tider,#evnPause .tips{display:none}' +
    '#evnPause .topp{display:contents}#evnPause h2{font-size:22px;grid-column:1}#evnPause .kort>a{grid-column:2;grid-row:1;margin:0}#evnPause .lukk{grid-column:3;grid-row:1}' +
    '#evnPause .fortsett,#evnPause .ruter,#evnPause .styr{grid-column:1/-1}#evnPause .fortsett{min-height:48px;margin-top:6px}#evnPause .ruter{grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}#evnPause .rute{min-height:56px;padding:4px}}';
  document.head.appendChild(css);

  // ---------- ☰ Meny-knappen og snarveiene ----------
  var knapp = document.createElement('button');
  knapp.id = 'evnPauseKnapp'; knapp.type = 'button'; knapp.className = 'evnMenyKnapp'; knapp.hidden = true;
  knapp.innerHTML = '<span class="ikon" aria-hidden="true">☰</span><span class="tekst">Meny</span>';
  knapp.title = 'Meny (P eller Esc)'; knapp.setAttribute('aria-label', 'Meny'); knapp.setAttribute('aria-haspopup', 'dialog');
  var snarveier = [];
  var kartKnapp = null, sekkKnapp = null;
  if (cfg.kart) {
    kartKnapp = document.createElement('button');
    kartKnapp.id = 'evnKartKnapp'; kartKnapp.type = 'button'; kartKnapp.textContent = '🗺️'; kartKnapp.title = 'Kart (M)'; kartKnapp.setAttribute('aria-label', 'Kart'); kartKnapp.hidden = true;
    if (cfg.kart.snarvei !== false) snarveier.push(kartKnapp);
  }
  if (cfg.sekk) {
    sekkKnapp = document.createElement('button');
    sekkKnapp.id = 'evnSekkKnapp'; sekkKnapp.type = 'button'; sekkKnapp.textContent = cfg.sekk.ikon || '🎒';
    sekkKnapp.title = (cfg.sekk.navn || 'Sekk') + (cfg.sekk.tast !== false ? ' (I)' : ''); sekkKnapp.setAttribute('aria-label', cfg.sekk.navn || 'Sekk'); sekkKnapp.hidden = true;
    if (cfg.sekk.snarvei !== false) snarveier.push(sekkKnapp);
  }
  if (snarveier.length > 2) snarveier.length = 2;   // høyst to snarveier
  var plass = cfg.plassering || {};
  if (cfg.knapp) cfg.knapp(knapp, kartKnapp);   // v2-plassering: spillet bestemmer selv
  else {
    if (plass.meny) plass.meny(knapp); else { var v = document.createElement('div'); v.id = 'evnHjorneV'; v.className = 'evnHjorne'; v.appendChild(knapp); document.body.appendChild(v); }
    if (snarveier.length) {
      if (plass.snarveier) snarveier.forEach(function (s) { plass.snarveier(s); });
      else { var h = document.createElement('div'); h.id = 'evnHjorneH'; h.className = 'evnHjorne'; snarveier.forEach(function (s) { h.appendChild(s); }); document.body.appendChild(h); }
    }
  }

  // ---------- Menyen ----------
  var bak = document.createElement('div');
  bak.id = 'evnPause'; bak.setAttribute('role', 'dialog'); bak.setAttribute('aria-modal', 'true'); bak.setAttribute('aria-labelledby', 'evnPauseTittel');
  var rute = function (id, ikon, navn, tast, ekstra) {
    return '<button class="rute' + (ekstra || '') + '" id="' + id + '" type="button"><span class="ikon" aria-hidden="true">' + ikon + '</span><span class="navn">' + esc(navn) + '</span>' +
      (tast ? '<span class="tast" aria-hidden="true">' + tast + '</span>' : '') + '</button>';
  };
  // Fast rekkefølge i alle spill: Hjelp, Lyd, Kart, Sekk, spillets egne, Innstillinger, E-shop, Garderobe, Avslutt
  var ruter = rute('evnPauseStyrKnapp', '🎮', 'Slik styrer du', 'H');
  if (cfg.lyd) ruter += rute('evnPauseLyd', '🔊', 'Lyd på', 'L');
  if (cfg.kart) ruter += rute('evnPauseKart', '🗺️', 'Kart', 'M');
  if (cfg.sekk) ruter += rute('evnPauseSekk', cfg.sekk.ikon || '🎒', cfg.sekk.navn || 'Sekk', cfg.sekk.tast !== false ? 'I' : '');
  (cfg.egne || []).forEach(function (e, i) { ruter += rute('evnPauseEgen' + i, e.ikon, e.navn, e.tast || ''); });
  if (cfg.innstillinger) ruter += rute('evnPauseInnst', '⚙️', 'Innstillinger');
  if (cfg.butikk) ruter += '<a class="rute" id="evnPauseShop" href="' + BUTIKK + '"><span class="ikon" aria-hidden="true">🛒</span><span>E-shop</span></a>' +
    '<a class="rute" id="evnPauseGarderobe" href="' + BUTIKK + '#garderobe"><span class="ikon" aria-hidden="true">👕</span><span>Garderobe</span></a>';
  ruter += rute('evnPauseAvslutt', '🚪', 'Avslutt', '', ' avslutt');
  bak.innerHTML = '<div class="kort"><div class="topp"><h2 id="evnPauseTittel">Meny</h2>' +
    '<button class="lukk" id="evnPauseLukk" type="button" aria-label="Lukk menyen">✕</button></div>' +
    '<div class="tider"><div class="tid"><small>I dag</small><b id="evnPauseIdag"></b></div><div class="tid"><small>Totalt</small><b id="evnPauseTot"></b></div></div>' +
    '<button class="fortsett" id="evnPauseFortsett" type="button">▶ Fortsett</button>' +
    '<div class="ruter">' + ruter + '</div>' +
    '<div class="styr" id="evnPauseStyr" hidden></div>' +
    '<p class="tips" id="evnPauseTips"></p></div>';
  document.body.appendChild(bak);
  var kartBak = null;
  if (cfg.kart) {
    kartBak = document.createElement('div');
    kartBak.id = 'evnKart'; kartBak.setAttribute('role', 'dialog'); kartBak.setAttribute('aria-modal', 'true'); kartBak.setAttribute('aria-labelledby', 'evnKartTittel');
    kartBak.innerHTML = '<div class="kort"><div class="topp"><h2 id="evnKartTittel">🗺️ Kart</h2><span class="info" id="evnKartInfo"></span>' +
      '<button type="button" class="lukk" id="evnKartLukk" aria-label="Lukk kartet">✕</button></div><canvas id="evnKartCv" role="img" aria-label="Kart over spillverdenen"></canvas></div>';
    document.body.appendChild(kartBak);
  }
  [bak, knapp, kartBak, kartKnapp, sekkKnapp].forEach(function (el) {
    if (el) ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
  });

  // Siste inndata (UI1/KS14): hurtigtaster vises bare når spilleren bruker tastatur eller mus
  var inndata = (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 'touch' : 'mus';
  function settInndata(n) { if (n !== inndata) { inndata = n; bak.setAttribute('data-inndata', n); } }
  bak.setAttribute('data-inndata', inndata);
  window.addEventListener('pointerdown', function (e) { settInndata(e.pointerType === 'touch' || e.pointerType === 'pen' ? 'touch' : 'mus'); }, { passive: true, capture: true });
  window.addEventListener('keydown', function () { settInndata('mus'); }, { passive: true, capture: true });

  var apen = false, apnetTid = 0, venterAvslutt = false, kartApen = false;
  // KS12: mens en dialog er åpen, kan ingenting bak den få fokus eller trykk (inert), og Tab blir i dialogen. Fokus settes tilbake ved lukking.
  var inertListe = [], aktivDialog = null, fokusFor = null;
  function settInert(dlg) {
    inertListe.forEach(function (el) { el.inert = false; }); inertListe = [];
    aktivDialog = dlg || null;
    if (!dlg) return;
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== dlg && !el.contains(dlg) && !el.inert && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') { el.inert = true; inertListe.push(el); }
    });
  }
  window.EVNPauseInert = settInert;
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !aktivDialog) return;
    var f = Array.prototype.filter.call(aktivDialog.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'), function (el) { return !el.disabled && !el.hidden && el.getClientRects().length > 0; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  }, true);
  function huskFokus() { var a = document.activeElement; fokusFor = a && a !== document.body ? a : null; }
  function fokusTilbake() { var a = fokusFor; fokusFor = null; if (a && a.isConnected && !a.hidden && a.getClientRects().length) try { a.focus({ preventScroll: true }); } catch (e) {} }
  // Avslutt: lenken i spillet aktiveres av spillets egen kode (inline display ≠ none) og kan være skjult i HUD (vedtak 7.11.2026)
  var avsluttLenke = function () { var a = $(cfg.avsluttId); return a && a.style.display !== 'none' ? a : null; };
  var sporsmal = function () { return $('evnSporsmal'); };
  var sporsmalApent = function () { var s = sporsmal(); return !!s && s.style.display === 'grid'; };
  function kan() { return !apen && !kartApen && !venterAvslutt && !sporsmalApent() && cfg.kanPause(); }
  function skrivefelt(e) { var el = e.target; return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable); }

  // ---------- Kart ----------
  function tegnKart() {
    if (!kartApen) return;
    var K = cfg.kart, cv = $('evnKartCv'), f = K.forhold || 1;
    var maksB = Math.min(innerWidth - 48, 900), maksH = innerHeight - 110;
    var b = Math.max(120, Math.min(maksB, maksH * f)), h = b / f;
    var d = Math.min(2, window.devicePixelRatio || 1);
    cv.style.width = Math.round(b) + 'px'; cv.style.height = Math.round(h) + 'px';
    cv.width = Math.round(b * d); cv.height = Math.round(h * d);
    kartBak.querySelector('.kort').style.width = Math.round(b + 24) + 'px';
    var c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    try { K.tegn(c, cv.width, cv.height, cv); } catch (e) {}
    $('evnKartInfo').textContent = K.info ? K.info() : '';
  }
  function apneKart() {
    if (!cfg.kart || !kan()) return;
    huskFokus(); cfg.pause(); kartApen = true; apnetTid = performance.now();
    kartBak.classList.add('vis'); synlighet(); settInert(kartBak);
    tegnKart();
    try { $('evnKartLukk').focus({ preventScroll: true }); } catch (e) {}
  }
  function lukkKart(fraKlikk) {
    if (!kartApen) return;
    kartApen = false; kartBak.classList.remove('vis'); settInert(null);
    cfg.fortsett(!!fraKlikk); synlighet(); fokusTilbake();
  }
  if (cfg.kart) {
    kartKnapp.addEventListener('click', function () { apneKart(); });
    $('evnKartLukk').addEventListener('click', function () { lukkKart(true); });
    kartBak.addEventListener('click', function (e) { if (e.target === kartBak) lukkKart(true); });
    window.addEventListener('resize', tegnKart);
  }

  // ---------- Lyd ----------
  function visLyd() {
    if (!cfg.lyd) return;
    var pa = true; try { pa = !!cfg.lyd.pa(); } catch (e) {}
    var b = $('evnPauseLyd');
    b.querySelector('.ikon').textContent = pa ? '🔊' : '🔇';
    b.querySelector('.navn').textContent = pa ? 'Lyd på' : 'Lyd av';
    b.setAttribute('aria-pressed', String(!pa)); b.setAttribute('aria-label', pa ? 'Lyd på. Trykk for å slå av (L)' : 'Lyd av. Trykk for å slå på (L)');
  }
  function byttLyd() { if (!cfg.lyd) return; var pa = true; try { pa = !!cfg.lyd.pa(); } catch (e) {} try { cfg.lyd.sett(!pa); } catch (e) {} visLyd(); }
  if (cfg.lyd) { $('evnPauseLyd').addEventListener('click', byttLyd); visLyd(); }

  // ---------- Menyen åpnes og lukkes ----------
  function apne(grunn) {
    if (!kan()) return;
    huskFokus(); cfg.pause();
    apen = true; apnetTid = performance.now();
    $('evnPauseIdag').textContent = fmt(tid.iDag); $('evnPauseTot').textContent = fmt(tid.totalt);
    $('evnPauseTips').textContent = grunn || 'Spillet står stille. Ingenting er borte.';
    $('evnPauseStyr').hidden = true; $('evnPauseStyrKnapp').setAttribute('aria-expanded', 'false');
    $('evnPauseAvslutt').hidden = !avsluttLenke() || !sporsmal();
    visLyd();
    bak.classList.add('vis'); synlighet(); lagreTid(); settInert(bak);
    try { $('evnPauseFortsett').focus({ preventScroll: true }); } catch (e) {}
  }
  function lukk(fraKlikk) {
    if (!apen) return;
    apen = false; bak.classList.remove('vis'); settInert(null);
    cfg.fortsett(!!fraKlikk); synlighet(); fokusTilbake();
  }
  // Lukker menyen uten å fortsette og gir videre til en handling som åpner noe annet (kart, sekk, spillets egne)
  function videre(fn) { return function () { apen = false; bak.classList.remove('vis'); settInert(null); fokusFor = null; cfg.fortsett(false); synlighet(); try { fn(); } catch (e) {} }; }
  knapp.addEventListener('click', function () { apne(); });
  $('evnPauseFortsett').addEventListener('click', function () { lukk(true); });
  $('evnPauseLukk').addEventListener('click', function () { lukk(true); });
  bak.addEventListener('click', function (e) { if (e.target === bak) lukk(true); });
  function visHjelp() {
    var s = $('evnPauseStyr'), b = $('evnPauseStyrKnapp');
    if (s.hidden) s.innerHTML = cfg.styring(); s.hidden = !s.hidden; b.setAttribute('aria-expanded', String(!s.hidden));
    if (!s.hidden) try { s.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }
  $('evnPauseStyrKnapp').addEventListener('click', visHjelp);
  if (cfg.kart) $('evnPauseKart').addEventListener('click', videre(apneKart));
  function apneSekk() { if (cfg.sekk && kan()) cfg.sekk.apne(); }
  if (cfg.sekk) { $('evnPauseSekk').addEventListener('click', videre(apneSekk)); sekkKnapp.addEventListener('click', function (e) { e.currentTarget.blur(); apneSekk(); }); }
  (cfg.egne || []).forEach(function (e, i) { $('evnPauseEgen' + i).addEventListener('click', videre(e.gjor)); });
  if (cfg.innstillinger) $('evnPauseInnst').addEventListener('click', videre(cfg.innstillinger));
  // Alle lenker i menyen (E-shop, Garderobe og saldoen fra ecoins.js) lagrer før spillet forlates
  bak.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a && bak.contains(a)) { if (cfg.lagre) try { cfg.lagre(); } catch (x) {} lagreTid(); } }, true);

  // KS10: Avslutt bekreftes i den felles dialogen. Spillet står stille mens spørsmålet vises. «Nei» = fortsett.
  function visSporsmal() { venterAvslutt = true; var s = sporsmal(); s.style.display = 'grid'; settInert(s); var b = $('evnBli'); if (b) b.focus(); synlighet(); }
  $('evnPauseAvslutt').addEventListener('click', function () { apen = false; bak.classList.remove('vis'); if (cfg.lagre) cfg.lagre(); lagreTid(); visSporsmal(); });
  document.addEventListener('click', function (e) {
    var a = avsluttLenke(); if (!a || !a.contains(e.target) || venterAvslutt || apen || !cfg.kanPause()) return;
    cfg.pause(); venterAvslutt = true;
  }, true);
  function nei() { if (!venterAvslutt) return; venterAvslutt = false; var s = sporsmal(); if (s) s.style.display = 'none'; settInert(null); cfg.fortsett(false); synlighet(); if (!knapp.hidden) try { knapp.focus({ preventScroll: true }); } catch (e) {} }
  document.addEventListener('click', function (e) { var b = $('evnBli'); if (b && b.contains(e.target)) setTimeout(nei, 0); }, true);

  // ---------- Taster (KS1, KS2, KS7, KS8, KS9) ----------
  window.addEventListener('keydown', function (e) {
    var k = e.code || e.key;
    if (venterAvslutt && sporsmalApent()) { if (k === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); nei(); } return; }
    if (kartApen) {
      e.stopImmediatePropagation();
      if ((k === 'Escape' || k === 'KeyM') && !e.repeat && performance.now() - apnetTid > 200) { e.preventDefault(); lukkKart(false); }
      return;
    }
    if (apen) {
      e.stopImmediatePropagation();                                  // spillet får ingen taster mens menyen er åpen
      if (e.repeat) return;
      if (k === 'Escape' && !$('evnPauseStyr').hidden) { e.preventDefault(); visHjelp(); $('evnPauseStyrKnapp').focus(); return; }   // Esc lukker det øverste
      if ((k === 'Escape' || k === 'KeyP') && performance.now() - apnetTid > 300) { e.preventDefault(); lukk(k === 'KeyP'); }
      else if (k === 'KeyL' && cfg.lyd) { e.preventDefault(); byttLyd(); }
      else if (k === 'KeyH') { e.preventDefault(); visHjelp(); }
      else if (k === 'KeyM' && cfg.kart) { e.preventDefault(); videre(apneKart)(); }
      else if (k === 'KeyI' && cfg.sekk && cfg.sekk.tast !== false) { e.preventDefault(); videre(apneSekk)(); }
      return;
    }
    if (e.repeat || skrivefelt(e)) return;
    if (k === 'KeyL' && cfg.lyd && !sporsmalApent()) { e.preventDefault(); e.stopImmediatePropagation(); byttLyd(); return; }
    if (!kan()) return;
    if (k === 'KeyM' && cfg.kart) { e.preventDefault(); e.stopImmediatePropagation(); apneKart(); return; }
    if (k === 'KeyI' && cfg.sekk && cfg.sekk.tast !== false) { e.preventDefault(); e.stopImmediatePropagation(); apneSekk(); return; }
    if (k === 'KeyP' || (k === 'Escape' && (typeof cfg.escPause === 'function' ? cfg.escPause() : cfg.escPause !== false))) { e.preventDefault(); e.stopImmediatePropagation(); apne(); }
  }, true);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { apne('Pause fordi du byttet fane eller app.'); lagreTid(); } });
  window.addEventListener('blur', function () { apne('Pause fordi du gikk ut av spillet.'); });
  window.addEventListener('pagehide', lagreTid);

  // ---------- Synlighet og spilletid ----------
  function synlighet() {
    var skjul = apen || kartApen || venterAvslutt || !cfg.kanPause();
    knapp.hidden = skjul;
    if (kartKnapp) kartKnapp.hidden = skjul;
    if (sekkKnapp) sekkKnapp.hidden = skjul;
  }
  var sistRort = performance.now(), sist = performance.now(), sistLagret = 0;
  ['keydown', 'pointerdown', 'pointermove', 'touchstart', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function () { sistRort = performance.now(); }, { passive: true, capture: true }); });
  setInterval(function () {
    var naa = performance.now(), dt = Math.min(2000, naa - sist); sist = naa;
    synlighet();
    var dag = idag(); if (tid.dag !== dag) { tid.dag = dag; tid.iDag = 0; }
    if (!apen && !kartApen && !venterAvslutt && !document.hidden && naa - sistRort < LEDIG && cfg.aktiv()) { tid.iDag += dt; tid.totalt += dt; }
    if (naa - sistLagret > 15000) { sistLagret = naa; lagreTid(); }
  }, 250);
  return { versjon: VERSJON, apne: apne, lukk: lukk, apneKart: apneKart, lukkKart: lukkKart, oppdaterLyd: visLyd,
    erApen: function () { return apen || kartApen; }, tid: function () { return tid; } };
};
/* EVN-PAUSE v3 slutt */
