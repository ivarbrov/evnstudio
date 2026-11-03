/*
 * EVN Studio – E-coins: felles lommebok, belønninger, butikk og garderobe for alle EVN-spill.
 * Versjon 1.0 (regler 1). Beslutningsgrunnlag: prototype/ecoins/E-COINS-PLAN.md. Godkjent av voksen 3.11.2026 (V1–V5).
 *
 * Bruk i et spill (etter at spillet har lest sin egen lagring):
 *   <script src="../../ecoins/ecoins.js" defer></script>
 *   window.EVNEcoins && EVNEcoins.belonn('dyrepatruljen.verden.3');          // når milepælen skjer
 *   window.EVNEcoins && EVNEcoins.avstem(['dyrepatruljen.verden.1', …]);     // ved oppstart: det lagringen viser er klart
 *
 * Regler:
 *  - Hver milepæl gir E-coins én gang. Beløpet står bare her, og låses i lagringen ved utdeling.
 *  - Saldoen lagres aldri. Den er summen av «tjent» minus summen av «kjopt». Et kjøp er én skriving.
 *  - Feil her skal aldri stoppe spillet. Alt er pakket i try/catch, og spillene kaller via window.EVNEcoins.
 *  - Ingen nettverk, ingen persondata, ingen statistikk. Alt ligger i localStorage på enheten.
 */
(function () {
  'use strict';
  if (window.EVNEcoins) return;
  var NOKKEL = 'evn-ecoins-v1', REGLER = 1;
  var SPILL = [
   {"id": "dyrepatruljen", "navn": "Dyrepatruljen", "kommer": false, "m": [["dyrepatruljen.verden.1", 25, "Alle 10 dyr reddet i Gata"],
    ["dyrepatruljen.verden.2", 25, "Alle 10 dyr reddet i Byen"],
    ["dyrepatruljen.verden.3", 25, "Alle 10 dyr reddet i Kjøpesenteret"],
    ["dyrepatruljen.verden.4", 25, "Alle 10 dyr reddet i Snøverdenen"],
    ["dyrepatruljen.verden.5", 25, "Alle 10 dyr reddet i Lavaverdenen"],
    ["dyrepatruljen.verden.6", 25, "Alle 10 dyr reddet i Godterilandet"],
    ["dyrepatruljen.verden.7", 25, "Alle 10 dyr reddet i Jungelen"],
    ["dyrepatruljen.verden.8", 25, "Alle 10 dyr reddet i Gården"],
    ["dyrepatruljen.verden.9", 25, "Alle 10 dyr reddet i Lekelandet"],
    ["dyrepatruljen.verden.10", 25, "Alle 10 dyr reddet i Under havet"],
    ["dyrepatruljen.verden.11", 25, "Alle 10 dyr reddet i Ørkenen"],
    ["dyrepatruljen.verden.12", 25, "Alle 10 dyr reddet i Sumpen"],
    ["dyrepatruljen.verden.13", 25, "Alle 10 dyr reddet i Skogen"],
    ["dyrepatruljen.verden.14", 25, "Alle 10 dyr reddet i Gruva"],
    ["dyrepatruljen.verden.15", 25, "Alle 10 dyr reddet i Eventyrlandet"],
    ["dyrepatruljen.alle", 100, "Alle 150 dyr i alle 15 verdener reddet"]]}, 
   {"id": "fossil", "navn": "Fossil Zoo", "kommer": false, "m": [["fossil.dyr.dimetrodon", 15, "Dimetrodon vekket til live (5 deler)"],
    ["fossil.dyr.meganeura", 15, "Kjempeøyenstikker vekket til live (3 deler)"],
    ["fossil.dyr.dunkle", 15, "Panserfisk vekket til live (3 deler)"],
    ["fossil.dyr.trilobitt", 15, "Trilobitt vekket til live (3 deler)"],
    ["fossil.epoke.1", 40, "Alle dyr i Jordas oldtid vekket"],
    ["fossil.dyr.flyg", 15, "Flygeøgle vekket til live (4 deler)"],
    ["fossil.dyr.trex", 15, "T-rex vekket til live (5 deler)"],
    ["fossil.dyr.langhals", 15, "Langhals vekket til live (5 deler)"],
    ["fossil.dyr.ammonitt", 15, "Ammonitt vekket til live (3 deler)"],
    ["fossil.epoke.2", 40, "Alle dyr i Jordas mellomalder vekket"],
    ["fossil.dyr.ulv", 15, "Ulv vekket til live (4 deler)"],
    ["fossil.dyr.love", 15, "Løve vekket til live (4 deler)"],
    ["fossil.dyr.elefant", 15, "Elefant vekket til live (5 deler)"],
    ["fossil.dyr.mammut", 15, "Mammut vekket til live (5 deler)"],
    ["fossil.dyr.hval", 15, "Hval vekket til live (5 deler)"],
    ["fossil.epoke.3", 100, "Alle dyr i Jordas nytid vekket"]]}, 
   {"id": "era", "navn": "Era Defenders", "kommer": false, "m": [["era.boss.1", 15, "Første boss slått i Steinalderen (bølge 5)"],
    ["era.epoke.1", 40, "Steinalderen fullført – portalen åpnes (bølge 10)"],
    ["era.boss.2", 15, "Første boss slått i Oldtiden (bølge 5)"],
    ["era.epoke.2", 40, "Oldtiden fullført – portalen åpnes (bølge 10)"],
    ["era.boss.3", 15, "Første boss slått i Monsterskogen (bølge 5)"],
    ["era.epoke.3", 40, "Monsterskogen fullført – portalen åpnes (bølge 10)"],
    ["era.boss.4", 15, "Første boss slått i Piratskipet (bølge 5)"],
    ["era.epoke.4", 40, "Piratskipet fullført – portalen åpnes (bølge 10)"],
    ["era.boss.5", 15, "Første boss slått i Robotfabrikken (bølge 5)"],
    ["era.epoke.5", 40, "Robotfabrikken fullført – portalen åpnes (bølge 10)"],
    ["era.boss.6", 15, "Første boss slått i Romstasjonen (bølge 5)"],
    ["era.epoke.6", 40, "Romstasjonen fullført – portalen åpnes (bølge 10)"],
    ["era.boss.7", 15, "Første boss slått i Tidsvirvelen (bølge 5)"],
    ["era.seier", 150, "Tidsherren (sluttbossen) er slått"]]}, 
   {"id": "magiske-egg", "navn": "Magiske egg", "kommer": false, "m": [["egg.art.boblefrosk", 8, "Første Boblefrosk klekket"],
    ["egg.art.glitterkanin", 8, "Første Glitterkanin klekket"],
    ["egg.art.bladrev", 8, "Første Bladrev klekket"],
    ["egg.park.2", 20, "Parknivå 2 nådd"],
    ["egg.art.blomsterbie", 8, "Første Blomsterbie klekket"],
    ["egg.art.snopingvin", 8, "Første Snøpingvin klekket"],
    ["egg.art.perleoter", 8, "Første Perleoter klekket"],
    ["egg.park.3", 20, "Parknivå 3 nådd"],
    ["egg.art.lynkatt", 12, "Første Lynkatt klekket"],
    ["egg.art.flammehest", 12, "Første Flammehest klekket"],
    ["egg.art.vannskilpadde", 12, "Første Vannskilpadde klekket"],
    ["egg.park.4", 20, "Parknivå 4 nådd"],
    ["egg.art.regnbuesebra", 12, "Første Regnbuesebra klekket"],
    ["egg.art.lavaogle", 12, "Første Lavaøgle klekket"],
    ["egg.art.stjerneugle", 20, "Første Stjerneugle klekket"],
    ["egg.park.5", 20, "Parknivå 5 nådd"],
    ["egg.art.isdrage", 20, "Første Isdrage klekket"],
    ["egg.art.maaneenhjorning", 20, "Første Måneenhjørning klekket"],
    ["egg.park.6", 20, "Parknivå 6 nådd"],
    ["egg.art.ilddrev", 40, "Første Ilddrev klekket"],
    ["egg.alle", 60, "Alle 15 arter i samleboka"]]}, 
   {"id": "morkeskogen-2", "navn": "Mørkeskogen 2.0", "kommer": true, "m": [["mork.oppdrag.natt1", 15, "Overlev første natt"],
    ["mork.oppdrag.jeger", 20, "Jeger-oppdraget"],
    ["mork.oppdrag.seng", 10, "Bygg en seng"],
    ["mork.oppdrag.sovet", 10, "Sov i senga"],
    ["mork.oppdrag.skjelett", 15, "Skjelett-oppdraget"],
    ["mork.oppdrag.fisker", 15, "Fisker-oppdraget"],
    ["mork.oppdrag.troll", 20, "Troll-oppdraget"],
    ["mork.oppdrag.stasjon", 15, "Stasjon-oppdraget"],
    ["mork.oppdrag.cowboy", 15, "Cowboy-oppdraget"],
    ["mork.niva.5", 20, "Heltenivå 5"],
    ["mork.oppdrag.vulkan", 20, "Vulkan-oppdraget"],
    ["mork.oppdrag.sheriff", 25, "Sheriff-oppdraget (3 deler)"],
    ["mork.oppdrag.lasso", 25, "Lasso-oppdraget (5 deler)"],
    ["mork.oppdrag.haidammen", 20, "Haidammen"],
    ["mork.oppdrag.dinoverden", 25, "Dinoverdenen"],
    ["mork.oppdrag.heksa", 40, "Heksa"],
    ["mork.oppdrag.overlevaren", 40, "Overlevaren (5 netter)"],
    ["mork.oppdrag.dinoslott", 50, "Beinslottet – Skjelett-T-rex-kongen"],
    ["mork.niva.10", 40, "Heltenivå 10 (maks)"]]}];
  var VARER = [{"id": "vernehjelm", "navn": "Vernehjelm", "plass": "hode", "pris": 40},
    {"id": "steinhette", "navn": "Steinalderhette", "plass": "hode", "pris": 40},
    {"id": "ryggsekk", "navn": "Ryggsekk", "plass": "rygg", "pris": 40},
    {"id": "pirathatt", "navn": "Pirathatt", "plass": "hode", "pris": 75},
    {"id": "vikinghjelm", "navn": "Vikinghjelm", "plass": "hode", "pris": 75},
    {"id": "rod_kappe", "navn": "Rød kappe", "plass": "rygg", "pris": 75},
    {"id": "svart_kappe", "navn": "Svart kappe", "plass": "rygg", "pris": 75},
    {"id": "verktoybelte", "navn": "Verktøybelte", "plass": "rygg", "pris": 75},
    {"id": "ridderhjelm", "navn": "Ridderhjelm", "plass": "hode", "pris": 120},
    {"id": "faraokrone", "navn": "Faraokrone", "plass": "hode", "pris": 120},
    {"id": "romhjelm", "navn": "Romhjelm", "plass": "hode", "pris": 120},
    {"id": "oksygentank", "navn": "Oksygentank", "plass": "rygg", "pris": 120},
    {"id": "trollmannshatt", "navn": "Trollmannshatt", "plass": "hode", "pris": 180},
    {"id": "stjernekappe", "navn": "Stjernekappe", "plass": "rygg", "pris": 180},
    {"id": "gullkrone", "navn": "Gullkrone", "plass": "hode", "pris": 250}];
  var MILEPAEL = {};
  SPILL.forEach(function (s) { s.m.forEach(function (m) { MILEPAEL[m[0]] = { id: m[0], e: m[1], tekst: m[2], spill: s.id }; }); });
  var VARE = {}; VARER.forEach(function (v) { VARE[v.id] = v; });

  // ---------- Lagring ----------
  var minne = null;   // brukes hvis localStorage ikke virker (privat modus o.l.): virker, men huskes ikke
  function tom() { return { v: 1, regler: REGLER, tjent: {}, kjopt: {}, antrekk: { hode: null, rygg: null } }; }
  function gyldig(d) { return d && d.v === 1 && typeof d.tjent === 'object' && d.tjent && typeof d.kjopt === 'object' && d.kjopt && typeof d.antrekk === 'object' && d.antrekk; }
  function les() {
    if (minne) return JSON.parse(JSON.stringify(minne));
    var r;
    try { r = localStorage.getItem(NOKKEL); } catch (e) { minne = tom(); return les(); }
    if (r == null) return tom();
    try {
      var d = JSON.parse(r);
      if (gyldig(d)) {
        // vask: bare kjente felt og tall
        var ut = tom(); ut.regler = d.regler || REGLER;
        for (var k in d.tjent) { var t = d.tjent[k]; if (t && typeof t.e === 'number' && isFinite(t.e) && t.e >= 0) ut.tjent[k] = { e: t.e, t: +t.t || 0 }; }
        for (var j in d.kjopt) { var p = d.kjopt[j]; if (p && typeof p.pris === 'number' && isFinite(p.pris) && p.pris >= 0) ut.kjopt[j] = { pris: p.pris, t: +p.t || 0 }; }
        ['hode', 'rygg'].forEach(function (pl) { var id = d.antrekk[pl]; ut.antrekk[pl] = (id && VARE[id] && VARE[id].plass === pl && ut.kjopt[id]) ? id : null; });
        return ut;
      }
    } catch (e) {}
    // Ødelagt: ta vare på originalen og start på nytt (avstemmingen i spillene gir tilbake det som er tjent)
    try { if (localStorage.getItem(NOKKEL + '-kopi') == null) localStorage.setItem(NOKKEL + '-kopi', r); } catch (e) {}
    return tom();
  }
  function skriv(d) {
    if (minne) { minne = d; return true; }
    try { localStorage.setItem(NOKKEL, JSON.stringify(d)); return true; }
    catch (e) { return false; }
  }
  // Leser alltid på nytt rett før endring, så en annen fane ikke blir overskrevet med gamle data.
  function endre(fn) { var d = les(), r = fn(d); if (r && r.ok) { if (!skriv(d)) return { ok: false, grunn: 'lagring' }; varsle(); } return r; }

  function sum(o, f) { var s = 0; for (var k in o) s += o[k][f]; return s; }
  function saldoAv(d) { return sum(d.tjent, 'e') - sum(d.kjopt, 'pris'); }

  // ---------- Hendelser ----------
  var lyttere = [];
  function varsle() { var d = les(); lyttere.slice().forEach(function (f) { try { f(d); } catch (e) {} }); oppdaterPause(d); }
  window.addEventListener('storage', function (e) { if (e.key === NOKKEL || e.key === null) varsle(); });

  // ---------- Melding ----------
  var IKON = '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" style="flex:none"><defs><linearGradient id="evnEcoinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#19c3ff"/><stop offset=".5" stop-color="#2f6bff"/><stop offset="1" stop-color="#8a3dff"/></linearGradient></defs><path d="M16 1.5 28.6 8.75v14.5L16 30.5 3.4 23.25V8.75Z" fill="url(#evnEcoinG)" stroke="#dfe8ff" stroke-width="1.6"/><path d="M11.5 9h9.5v3h-6v2.6h5.2v2.8H15V20h6.2v3h-9.7z" fill="#fff"/></svg>';
  var boks = null, ko = [], viser = false;
  function lagBoks() {
    if (boks || !document.body) return boks;
    var css = document.createElement('style');
    css.textContent = '#evnEcoinMelding{position:fixed;left:50%;top:max(12px,env(safe-area-inset-top));z-index:99995;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);' +
      'padding:8px 16px 8px 10px;border-radius:999px;background:#0e1430;color:#f1f4ff;border:2px solid #19c3ff;box-shadow:0 6px 24px rgba(0,0,0,.45);' +
      'font:800 17px/1.2 Nunito,system-ui,sans-serif;pointer-events:none;opacity:0;transform:translate(-50%,-16px);transition:opacity .25s,transform .25s}' +
      '#evnEcoinMelding.vis{opacity:1;transform:translate(-50%,0)}#evnEcoinMelding small{display:block;font-weight:700;font-size:13px;color:#a3add3}' +
      '@media (prefers-reduced-motion:reduce){#evnEcoinMelding{transition:none}}' +
      '#evnPause .evnEcoins{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0 0;padding:6px 10px;border-radius:12px;background:rgba(127,127,127,.15);font-weight:800;font-size:16px;color:inherit;text-decoration:none;min-height:44px}' +
      '#evnPause .evnEcoins svg{width:24px;height:24px}';
    document.head.appendChild(css);
    boks = document.createElement('div'); boks.id = 'evnEcoinMelding'; boks.setAttribute('role', 'status'); boks.setAttribute('aria-live', 'polite');
    document.body.appendChild(boks);
    return boks;
  }
  // Meldinger vises først når siden er ferdig lastet, så barnet rekker å se dem (store spill laster lenge)
  var lastet = document.readyState === 'complete';
  if (!lastet) window.addEventListener('load', function () { setTimeout(function () { lastet = true; if (!viser) nesteMelding(); }, 600); });
  function melding(tekst, liten) {
    ko.push([tekst, liten]); if (!viser && lastet) nesteMelding();
  }
  function nesteMelding() {
    var m = ko.shift(); if (!m) { viser = false; return; }
    if (!lagBoks()) { viser = false; return; }
    viser = true;
    boks.innerHTML = IKON + '<span></span>';
    var sp = boks.lastChild; sp.textContent = m[0];
    if (m[1]) { var s = document.createElement('small'); s.textContent = m[1]; sp.appendChild(s); }
    boks.classList.add('vis');
    setTimeout(function () { boks.classList.remove('vis'); setTimeout(nesteMelding, 350); }, 2600);
  }

  // ---------- Pausemenyen i spillene: saldo og vei til E-shop ----------
  var BUTIKK = (function () { var s = document.currentScript && document.currentScript.src; try { return s ? new URL('../butikk/', s).href : '/butikk/'; } catch (e) { return '/butikk/'; } })();
  function oppdaterPause(d) {
    try {
      var kort = document.querySelector('#evnPause .kort'); if (!kort) return;
      var el = document.getElementById('evnPauseEcoins');
      if (!el) {
        el = document.createElement('a'); el.id = 'evnPauseEcoins'; el.className = 'evnEcoins'; el.href = BUTIKK;
        var tider = kort.querySelector('.tider'); kort.insertBefore(el, tider ? tider.nextSibling : kort.children[1] || null);
      }
      var s = saldoAv(d || les());
      el.innerHTML = IKON + '<span></span>';
      el.lastChild.textContent = s + ' E-coins · E-shop';
      el.setAttribute('aria-label', 'Du har ' + s + ' E-coins. Åpne E-shop');
    } catch (e) {}
  }
  function startPause() {
    oppdaterPause();
    try {
      var p = document.getElementById('evnPause');
      if (p && window.MutationObserver) new MutationObserver(function () { if (p.classList.contains('vis')) oppdaterPause(); }).observe(p, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPause); else startPause();

  // ---------- Offentlig grensesnitt ----------
  var api = {
    versjon: '1.0',
    nokkel: NOKKEL,
    spill: SPILL, varer: VARER, milepael: function (id) { return MILEPAEL[id] || null; }, vare: function (id) { return VARE[id] || null; },
    data: les,
    saldo: function () { return saldoAv(les()); },
    tjent: function () { return sum(les().tjent, 'e'); },
    brukt: function () { return sum(les().kjopt, 'pris'); },
    harTjent: function (id) { return !!les().tjent[id]; },
    eier: function (id) { return !!les().kjopt[id]; },
    antrekk: function () { var a = les().antrekk; return { hode: a.hode, rygg: a.rygg }; },
    lagrerPaEnheten: function () { les(); return !minne; },

    // Engangsutdeling. stille: ingen melding (brukes av avstem).
    belonn: function (id, stille) {
      try {
        var m = MILEPAEL[id]; if (!m) return { ok: false, grunn: 'ukjent' };
        var r = endre(function (d) {
          if (d.tjent[id]) return { ok: false, grunn: 'allerede' };
          d.tjent[id] = { e: m.e, t: Date.now() }; return { ok: true, e: m.e };
        });
        if (r.ok && !stille) melding('Du fikk ' + m.e + ' E-coins!', m.tekst);
        return r;
      } catch (e) { return { ok: false, grunn: 'feil' }; }
    },
    // Gir det som mangler av milepælene lagringen viser er nådd, med én samlet melding.
    avstem: function (ider, tekst) {
      try {
        var sumE = 0, n = 0, sisteTekst = '';
        endre(function (d) {
          (ider || []).forEach(function (id) { var m = MILEPAEL[id]; if (m && !d.tjent[id]) { d.tjent[id] = { e: m.e, t: Date.now() }; sumE += m.e; n++; sisteTekst = m.tekst; } });
          return { ok: n > 0 };
        });
        if (n === 1) melding('Du fikk ' + sumE + ' E-coins!', tekst || sisteTekst);
        else if (n > 1) melding('Du har allerede klart mye – du får ' + sumE + ' E-coins!', tekst || n + ' ting du har klart');
        return { ok: true, e: sumE, antall: n };
      } catch (e) { return { ok: false, grunn: 'feil' }; }
    },
    kjop: function (id) {
      try {
        var v = VARE[id]; if (!v) return { ok: false, grunn: 'ukjent' };
        return endre(function (d) {
          if (d.kjopt[id]) return { ok: false, grunn: 'eid' };
          if (saldoAv(d) < v.pris) return { ok: false, grunn: 'rad' };
          d.kjopt[id] = { pris: v.pris, t: Date.now() }; return { ok: true };
        });
      } catch (e) { return { ok: false, grunn: 'feil' }; }
    },
    taPa: function (plass, id) {
      try {
        if (plass !== 'hode' && plass !== 'rygg') return { ok: false, grunn: 'ukjent' };
        return endre(function (d) {
          if (id && (!VARE[id] || VARE[id].plass !== plass || !d.kjopt[id])) return { ok: false, grunn: 'ikke-eid' };
          if (d.antrekk[plass] === (id || null)) return { ok: false, grunn: 'uendret' };
          d.antrekk[plass] = id || null; return { ok: true };
        });
      } catch (e) { return { ok: false, grunn: 'feil' }; }
    },
    nullstill: function () { try { if (minne) minne = tom(); else localStorage.removeItem(NOKKEL); varsle(); return { ok: true }; } catch (e) { return { ok: false }; } },
    pa: function (fn) { if (typeof fn === 'function') lyttere.push(fn); return function () { lyttere = lyttere.filter(function (f) { return f !== fn; }); }; },
    melding: melding
  };
  window.EVNEcoins = api;
  try { document.dispatchEvent(new Event('evn-ecoins-klar')); } catch (e) {}
})();
