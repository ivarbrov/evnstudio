/* EVN-MENY 1.0 start */
/* EVN-MENY 1.0: felles ☰ Meny, snarveier, lyd og menyruter (EVN UI-standard 1.1, KM1–KM12).
   Kilde: felles/ui/evn-meny-1.0.js. Kopien i et spill rettes aldri på stedet. En endring gir nytt versjonsnummer.
   Bygger på den felles pausen (EVN-PAUSE v2 i dag, v3 senere) og lager ingen egen pause, spilletid eller dialoghåndtering:
   pause, fortsett, kart, spilletid, «Vil du avslutte?», inert og Tab i dialoger kommer fra window.EVNPause.
   Bruk: window.EVNMeny(cfg) i stedet for window.EVNPause(cfg). cfg er pausens oppsett, uten «knapp», pluss (alle valgfrie):
     lyd:     { pa: () => bool, sett: bool => void }       → 🔊/🔇 Lyd i menyen og tasten L. Spillet lagrer valget i sin egen nøkkel.
     sekk:    { apne: fn, ikon: '🎒', navn: 'Sekk', tast: true, snarvei: true }  → rute i menyen, tasten I og snarvei oppe til høyre.
     kart.snarvei (standard true): 🗺️ som snarvei oppe til høyre. Høyst to snarveier (KM2).
     egne:    [{ ikon, navn, gjor: fn }]                  → spillets egne ruter, mellom sekken og innstillingene.
     innstillinger: fn                                     → ⚙️ Innstillinger åpner spillets eget panel.
     butikk:  true                                         → 🛒 E-shop og 👕 Garderobe (lagrer først).
     plassering: { meny: el => void, snarveier: el => void } → spillet setter knappene inn i sin egen HUD. Ellers festes de i hjørnene.
   Avslutt-lenka i HUD (cfg.avsluttId) skjules visuelt under spilling, men virker fortsatt for menyens 🚪 Avslutt (KM4).
   Taster: P og Esc (meny) og M (kart) kommer fra pausen. Menyen legger til L (lyd), I (sekk) og H (hjelp i menyen),
   og Esc lukker først hjelpen. Fokus går tilbake til knappen som åpnet, også etter spillets egne dialoger. */
window.EVNMeny = function (cfg) {
  var VERSJON = '1.0', t = cfg.tema || {};
  var font = t.font || 'system-ui,sans-serif', hi = t.hi || '#ffd54a';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var BUTIKK = (function () { try { return new URL('../../butikk/', location.href).href; } catch (e) { return '/butikk/'; } })();
  var P = null;                                   // pausen (window.EVNPause) når den er laget
  var aapen = function () { return !!P && $('evnPause').classList.contains('vis'); };
  var sporsmalApent = function () { var s = $('evnSporsmal'); return !!s && s.style.display === 'grid'; };
  var skrivefelt = function (e) { var el = e.target; return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable); };

  // ---------- Utseende: felles former og plassering, spillets farger ----------
  var knappStil = 'min-width:48px;min-height:48px;border-radius:14px;border:0;background:' + (t.hud || 'rgba(255,255,255,.92)') + ';color:' + (t.hudInk || '#1d2440') +
    ';font:800 18px ' + font + ';cursor:pointer;touch-action:manipulation;pointer-events:auto;box-shadow:0 3px 10px rgba(0,0,0,.18);display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;margin:0';
  var css = document.createElement('style');
  css.textContent =
    '.evnHjorne{position:fixed;z-index:15;display:flex;gap:8px;pointer-events:none;top:calc(10px + env(safe-area-inset-top))}' +
    '#evnHjorneV{left:calc(10px + env(safe-area-inset-left))}#evnHjorneH{right:calc(10px + env(safe-area-inset-right))}' +
    '#evnPauseKnapp,#evnKartKnapp,#evnSekkKnapp{' + knappStil + '}' +
    '#evnKartKnapp,#evnSekkKnapp{width:48px;padding:0;font-size:22px}' +
    '#evnPauseKnapp .ikon{font-size:22px;line-height:1}' +
    '#evnPauseKnapp[hidden],#evnKartKnapp[hidden],#evnSekkKnapp[hidden]{display:none!important}' +
    '#evnPauseKnapp:focus-visible,#evnKartKnapp:focus-visible,#evnSekkKnapp:focus-visible{outline:3px solid ' + hi + ';outline-offset:2px}' +
    '.evnAvsluttSkjult{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important;visibility:hidden!important;pointer-events:none!important}' +
    '#evnPause,#evnKart{padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}' +
    '#evnPause .kort,#evnKart .kort{border-radius:20px;animation:evnInn .16s ease-out}' +
    '@keyframes evnInn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#evnPause .kort,#evnKart .kort{animation:none}}' +
    '#evnPause .kort{padding:16px 18px;width:min(420px,100%)}' +
    '#evnPause .evnTopp{display:flex;align-items:center;gap:10px;margin:0 0 8px}' +
    '#evnPause .evnTopp h2{flex:1;text-align:left;font-size:28px;margin:0}' +
    '#evnPause .evnTopp .evnEcoins{margin:0;flex:none}' +
    '#evnPause button.evnLukk{width:48px;height:48px;min-height:48px;flex:none;margin:0;border-radius:14px;border:0;background:rgba(127,127,127,.28);color:inherit;font:800 22px ' + font + '}' +
    '#evnPause .tider{margin:0 0 8px}' +
    '#evnPause .fortsett{margin:0}' +
    '#evnPause .evnRuter{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;margin:8px 0 0}' +
    '#evnPause .evnRuter .rute{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:auto;min-height:72px;margin:0;padding:8px 6px;border-radius:14px;border:0;background:rgba(127,127,127,.22);color:inherit;font:800 15px ' + font + ';line-height:1.15;text-decoration:none;cursor:pointer;touch-action:manipulation}' +
    '#evnPause .evnRuter .rute[hidden]{display:none}' +
    '#evnPause .rute .ikon{font-size:26px;line-height:1}' +
    '#evnPause .rute .tast{position:absolute;top:4px;right:6px;font-size:11px;border:2px solid currentColor;border-radius:6px;padding:0 4px;opacity:.7}' +
    '#evnPause[data-inndata=touch] .tast{display:none}' +
    '#evnPause .rute.avslutt{background:rgba(127,127,127,.12)}' +
    '#evnPause .styr{margin:8px 0 0}' +
    '#evnPause a:focus-visible,#evnPause .rute:focus-visible{outline:3px solid ' + hi + ';outline-offset:2px}' +
    // Smal skjerm: bare ☰ (48 px) og tre ruter i bredden. Lav skjerm (liggende mobil): bredere kort, fire ruter, uten spilletid og tips.
    '@media (max-width:400px){#evnPauseKnapp .tekst{display:none}#evnPauseKnapp{width:48px;padding:0}#evnPause .kort{padding:12px}#evnPause .evnRuter{grid-template-columns:repeat(3,1fr);gap:6px}#evnPause .evnRuter .rute{min-height:64px;font-size:13px;padding:6px 2px}}' +
    '@media (max-height:500px){#evnPause .kort{width:min(640px,100%);padding:10px 14px}#evnPause .tider,#evnPause .tips{display:none}#evnPause .evnTopp{margin:0 0 6px}#evnPause .evnTopp h2{font-size:22px}' +
    '#evnPause .fortsett{min-height:48px}#evnPause .evnRuter{grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}#evnPause .evnRuter .rute{min-height:60px;padding:4px}}';

  // ---------- Snarveier ----------
  var knapp = null, kartKnapp = null, sekkKnapp = null, snarveier = [];
  if (cfg.sekk) {
    sekkKnapp = document.createElement('button');
    sekkKnapp.id = 'evnSekkKnapp'; sekkKnapp.type = 'button'; sekkKnapp.textContent = cfg.sekk.ikon || '🎒'; sekkKnapp.hidden = true;
    sekkKnapp.title = (cfg.sekk.navn || 'Sekk') + (cfg.sekk.tast !== false ? ' (I)' : ''); sekkKnapp.setAttribute('aria-label', cfg.sekk.navn || 'Sekk');
  }
  var plass = cfg.plassering || {};
  function plasser(k, kk) {
    knapp = k; kartKnapp = kk;
    knapp.innerHTML = '<span class="ikon" aria-hidden="true">☰</span><span class="tekst">Meny</span>';
    knapp.title = 'Meny (P eller Esc)'; knapp.setAttribute('aria-label', 'Meny'); knapp.setAttribute('aria-haspopup', 'dialog');
    if (kartKnapp && cfg.kart.snarvei !== false) snarveier.push(kartKnapp);
    if (sekkKnapp && cfg.sekk.snarvei !== false) snarveier.push(sekkKnapp);
    snarveier = snarveier.slice(0, 2);                                   // høyst to snarveier (KM2)
    if (plass.meny) plass.meny(knapp); else { var v = document.createElement('div'); v.id = 'evnHjorneV'; v.className = 'evnHjorne'; v.appendChild(knapp); document.body.appendChild(v); }
    if (plass.snarveier) snarveier.forEach(function (s) { plass.snarveier(s); });
    else if (snarveier.length) { var h = document.createElement('div'); h.id = 'evnHjorneH'; h.className = 'evnHjorne'; snarveier.forEach(function (s) { h.appendChild(s); }); document.body.appendChild(h); }
    // Snarveien til sekken vises og skjules sammen med ☰ (pausen styrer ☰ og 🗺️)
    if (sekkKnapp && window.MutationObserver) new MutationObserver(function () { sekkKnapp.hidden = knapp.hidden; }).observe(knapp, { attributes: true, attributeFilter: ['hidden'] });
    [knapp, kartKnapp, sekkKnapp].forEach(function (el) { if (el) ['pointerdown', 'mousedown', 'keydown', 'click'].forEach(function (ev) { el.addEventListener(ev, function () { aapner = el; }, true); }); });
  }

  // ---------- Fokus tilbake (KS12) ----------
  // «aapner» er knappen som åpnet noe. Når spillet går videre og fokus er borte (body), settes fokus tilbake dit, eller på ☰.
  var aapner = null, venter = false;
  function settFokus() {
    if (knapp && cfg.kanPause() && !P.erApen()) { knapp.hidden = false; if (kartKnapp) kartKnapp.hidden = false; if (sekkKnapp) sekkKnapp.hidden = false; }   // pausen viser dem igjen litt senere
    var m = aapner && !aapner.hidden && aapner.getClientRects().length ? aapner : knapp;
    if (m && !m.hidden && m.getClientRects().length) { try { m.focus({ preventScroll: true }); } catch (e) {} return true; }
    return false;
  }
  function fokusErBorte() { var a = document.activeElement; return !a || a === document.body || a.hidden || !a.getClientRects().length; }
  var opp = {};
  for (var k in cfg) opp[k] = cfg[k];
  opp.knapp = plasser;
  opp.pause = function () { venter = true; return cfg.pause.apply(this, arguments); };
  opp.fortsett = function () { var r = cfg.fortsett.apply(this, arguments); setTimeout(function () { if (venter && cfg.kanPause() && fokusErBorte() && settFokus()) venter = false; }, 0); return r; };

  // ---------- Taster som kommer i tillegg til pausens (registreres før pausen, så de virker også når menyen er åpen) ----------
  window.addEventListener('keydown', function (e) {
    if (!P || e.repeat || skrivefelt(e) || sporsmalApent()) return;
    var k = e.code || e.key, hjelp = $('evnPauseStyr');
    if (k === 'KeyL' && cfg.lyd) { e.preventDefault(); e.stopImmediatePropagation(); byttLyd(); return; }
    if (!aapen()) {
      if (k === 'KeyI' && sekkKnapp && cfg.sekk.tast !== false && cfg.kanPause() && !P.erApen()) { e.preventDefault(); e.stopImmediatePropagation(); aapner = sekkKnapp; apneSekk(); }
      return;
    }
    if (k === 'Escape' && hjelp && !hjelp.hidden) { e.preventDefault(); e.stopImmediatePropagation(); $('evnPauseStyrKnapp').click(); $('evnPauseStyrKnapp').focus(); return; }
    if (k === 'KeyH') { e.preventDefault(); e.stopImmediatePropagation(); $('evnPauseStyrKnapp').click(); return; }
    if (k === 'KeyM' && cfg.kart) { e.preventDefault(); e.stopImmediatePropagation(); videre(function () { P.apneKart(); })(); return; }
    if (k === 'KeyI' && sekkKnapp && cfg.sekk.tast !== false) { e.preventDefault(); e.stopImmediatePropagation(); videre(apneSekk)(); }
  }, true);

  // ---------- Pausen lages ----------
  P = window.EVNPause(opp);
  document.head.appendChild(css);                   // etter pausens stil, så menyens former gjelder
  var bak = $('evnPause'), kort = bak.querySelector('.kort');
  var av = $(cfg.avsluttId); if (av) av.classList.add('evnAvsluttSkjult');   // KM4: Avslutt ligger i menyen

  // Topplinje med tittel og ✕
  var h2 = $('evnPauseTittel'); h2.textContent = 'Meny';
  var topp = document.createElement('div'); topp.className = 'evnTopp';
  var lukkB = document.createElement('button'); lukkB.type = 'button'; lukkB.id = 'evnPauseLukk'; lukkB.className = 'evnLukk'; lukkB.setAttribute('aria-label', 'Lukk menyen'); lukkB.textContent = '✕';
  kort.insertBefore(topp, h2); topp.appendChild(h2); topp.appendChild(lukkB);

  // Ruter i fast rekkefølge (KM3): Hjelp, Lyd, Kart, Sekk, spillets egne, Innstillinger, E-shop, Garderobe, Avslutt
  var ruter = document.createElement('div'); ruter.className = 'evnRuter';
  function innhold(el, ikon, navn, tast) {
    el.classList.add('rute');
    el.innerHTML = '<span class="ikon" aria-hidden="true">' + ikon + '</span><span class="navn">' + esc(navn) + '</span>' + (tast ? '<span class="tast" aria-hidden="true">' + tast + '</span>' : '');
    return el;
  }
  function ny(id, ikon, navn, tast) { var b = document.createElement('button'); b.type = 'button'; b.id = id; return innhold(b, ikon, navn, tast); }
  function lenke(id, ikon, navn, href) { var a = document.createElement('a'); a.id = id; a.href = href; return innhold(a, ikon, navn); }
  var styrB = $('evnPauseStyrKnapp'), avsB = $('evnPauseAvslutt');
  styrB.className = ''; ruter.appendChild(innhold(styrB, '🎮', 'Slik styrer du', 'H'));
  if (cfg.lyd) ruter.appendChild(ny('evnPauseLyd', '🔊', 'Lyd på', 'L'));
  if (cfg.kart) ruter.appendChild(ny('evnPauseKart', '🗺️', 'Kart', 'M'));
  if (cfg.sekk) ruter.appendChild(ny('evnPauseSekk', cfg.sekk.ikon || '🎒', cfg.sekk.navn || 'Sekk', cfg.sekk.tast !== false ? 'I' : ''));
  (cfg.egne || []).forEach(function (e, i) { ruter.appendChild(ny('evnPauseEgen' + i, e.ikon, e.navn)); });
  if (cfg.innstillinger) ruter.appendChild(ny('evnPauseInnst', '⚙️', 'Innstillinger'));
  if (cfg.butikk) { ruter.appendChild(lenke('evnPauseShop', '🛒', 'E-shop', BUTIKK)); ruter.appendChild(lenke('evnPauseGarderobe', '👕', 'Garderobe', BUTIKK + '#garderobe')); }
  avsB.className = ''; ruter.appendChild(innhold(avsB, '🚪', 'Avslutt')); avsB.classList.add('avslutt');
  $('evnPauseFortsett').after(ruter);
  ruter.after($('evnPauseStyr'));                   // hjelpen åpnes rett under rutene

  // Saldolenka fra ecoins.js står der den vises, også i Tab-rekkefølgen: i topplinjen på lave skjermer, ellers under hjelpen
  var lav = window.matchMedia ? matchMedia('(max-height:500px)') : { matches: false };
  function plasserSaldo() {
    var s = $('evnPauseEcoins'); if (!s) return;
    if (lav.matches) { if (s.parentNode !== topp) topp.insertBefore(s, lukkB); }
    else if (s.previousElementSibling !== $('evnPauseStyr')) $('evnPauseStyr').after(s);
  }
  if (lav.addEventListener) lav.addEventListener('change', plasserSaldo);

  // Siste inndata (KS14): hurtigtaster vises bare med tastatur og mus
  bak.setAttribute('data-inndata', (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 'touch' : 'mus');
  window.addEventListener('pointerdown', function (e) { bak.setAttribute('data-inndata', e.pointerType === 'touch' || e.pointerType === 'pen' ? 'touch' : 'mus'); }, { passive: true, capture: true });
  window.addEventListener('keydown', function () { bak.setAttribute('data-inndata', 'mus'); }, { passive: true, capture: true });

  // ---------- Handlinger ----------
  function visLyd() {
    if (!cfg.lyd) return;
    var pa = true; try { pa = !!cfg.lyd.pa(); } catch (e) {}
    var b = $('evnPauseLyd');
    b.querySelector('.ikon').textContent = pa ? '🔊' : '🔇';
    b.querySelector('.navn').textContent = pa ? 'Lyd på' : 'Lyd av';
    b.setAttribute('aria-pressed', String(!pa)); b.setAttribute('aria-label', pa ? 'Lyd på. Trykk for å slå av (L)' : 'Lyd av. Trykk for å slå på (L)');
  }
  function byttLyd() { var pa = true; try { pa = !!cfg.lyd.pa(); } catch (e) {} try { cfg.lyd.sett(!pa); } catch (e) {} visLyd(); }
  function apneSekk() { if (cfg.sekk && cfg.kanPause() && !P.erApen()) { venter = true; cfg.sekk.apne(); } }
  // Lukker menyen og går videre til noe annet. Fokus skal tilbake til ☰ når det andre lukkes.
  function videre(fn) { return function () { aapner = knapp; P.lukk(false); venter = true; try { fn(); } catch (e) {} }; }
  if (cfg.lyd) { $('evnPauseLyd').addEventListener('click', byttLyd); visLyd(); }
  if (cfg.kart) $('evnPauseKart').addEventListener('click', videre(function () { P.apneKart(); }));
  if (cfg.sekk) { $('evnPauseSekk').addEventListener('click', videre(apneSekk)); sekkKnapp.addEventListener('click', function () { aapner = sekkKnapp; apneSekk(); }); }
  (cfg.egne || []).forEach(function (e, i) { $('evnPauseEgen' + i).addEventListener('click', videre(e.gjor)); });
  if (cfg.innstillinger) $('evnPauseInnst').addEventListener('click', videre(cfg.innstillinger));
  lukkB.addEventListener('click', function () { aapner = knapp; P.lukk(true); });
  bak.addEventListener('click', function (e) { if (e.target === bak) { aapner = knapp; P.lukk(true); } });
  // Alle lenker i menyen (E-shop, Garderobe og saldoen) lagrer før spillet forlates
  bak.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a && bak.contains(a) && cfg.lagre) try { cfg.lagre(); } catch (x) {} }, true);

  // Når menyen åpnes: oppdater lyd og saldo. Snarveien til sekken følger ☰. Fokus tilbake når spillet går videre.
  var varApen = false, kunne = cfg.kanPause();
  setInterval(function () {
    var a = aapen();
    if (a && !varApen) { visLyd(); plasserSaldo(); }
    varApen = a;
    if (sekkKnapp && knapp) sekkKnapp.hidden = knapp.hidden;
    var kan = cfg.kanPause() && !P.erApen() && !sporsmalApent();
    if (kan && !kunne && venter && fokusErBorte()) settFokus();
    if (kan && !kunne) venter = false;
    kunne = kan;
  }, 100);

  P.versjonMeny = VERSJON; P.oppdaterLyd = visLyd;
  return P;
};
/* EVN-MENY 1.0 slutt */
