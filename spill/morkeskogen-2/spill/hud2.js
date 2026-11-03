// Mørkeskogen 2.0 – ny HUD (fase 1). Endrer ikke spillogikken: den leser bare det spillet allerede skriver i HUD-elementene,
// flytter noen elementer (samme id-er) og viser ressurser ved behov. Kjøres etter spill.js og EVN-PAUSE.
(() => {
  const $ = id => document.getElementById(id);
  const RES = [['wood', '🪵', true], ['stone', '🪨', true], ['iron', '🔩', true], ['raw', '🥩'], ['cooked', '🍗'], ['skin', '🟫']];   // fast rekkefølge; true = har lagergrense
  const VIS_MS = 4000, MAKS = 3;
  const sist = {}, endret = {};

  function oppsett() {
    const hud = $('hud'), status = hud && hud.querySelector('.panel'), klokke = hud && hud.querySelector('.clock');
    if (!status || !klokke || $('h2Res')) return !!$('h2Res');
    // Ressurser under statusfeltet
    const res = document.createElement('div'); res.id = 'h2Res'; status.appendChild(res);
    // Dag og område i ett felt; knappene pause, kart og hjelp ved siden av
    const dag = document.createElement('div'); dag.id = 'h2Dag'; dag.append($('phase'), $('biome')); klokke.prepend(dag);
    // Våpennavn og nivå over hurtiglinja (samme elementer som før)
    const v = document.createElement('div'); v.id = 'h2Vapen'; v.hidden = true;
    v.append($('wIcon'), ' ', $('axe'), Object.assign(document.createElement('span'), { className: 'n', textContent: ' · ⭐ Nivå ' }));
    v.lastChild.append($('lvl')); document.body.appendChild(v);
    // Klarspråk: «Nivå» ved bålet het det samme som heltens nivå. Merket heter nå «Bål N» (tallet skrives fortsatt av spillet i #fireLvl).
    const fl = $('fireLvl'); if (fl && fl.previousSibling && fl.previousSibling.nodeType === 3) fl.previousSibling.textContent = 'Bål ';
    const hn = document.createElement('div'); hn.id = 'h2Hint'; hn.hidden = true; hn.setAttribute('role', 'status'); document.body.appendChild(hn);
    return true;
  }
  // Faner i ryggsekken: husk valgt fane og tegn menyen på nytt (renderMenu leser EVN2_MENYFANE)
  document.addEventListener('click', e => { const f = e.target.closest && e.target.closest('#menuList [data-fane]'); if (!f) return;
    e.stopPropagation(); window.EVN2_MENYFANE = f.dataset.fane; if (typeof window.EVN2_visMeny === 'function') window.EVN2_visMeny(); const l = $('menuList'); if (l) l.scrollTop = 0; }, true);
  function knapper() {   // EVN-PAUSE lager knappene litt etter oppstart
    const rad = $('evnRad'); if (!rad || $('h2Hjelp')) return;
    const h = document.createElement('button'); h.id = 'h2Hjelp'; h.type = 'button'; h.textContent = '❓'; h.title = 'Hjelp (H)'; h.setAttribute('aria-label', 'Hjelp');
    ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => h.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
    h.addEventListener('click', e => { e.stopPropagation(); hjelp(); });
    const kart = $('evnKartKnapp'); rad.insertBefore(h, kart ? kart.nextSibling : null);
    // Netter overlevd: i pausemenyen
    const kort = document.querySelector('#evnPause .kort'), n = $('nights');
    // Lukkeknapp i pausekortet (samme som «Fortsett»; Esc og P virker som før)
    if (kort && !$('h2Lukk')) { const x = document.createElement('button'); x.id = 'h2Lukk'; x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', 'Lukk og spill videre');
      x.addEventListener('click', e => { e.stopPropagation(); const f = $('evnPauseFortsett'); if (f) f.click(); }); kort.prepend(x); }
    // «Lag en helt ny verden» er flyttet fra ryggsekken til pausen. Samme handling som før (to trykk for å bekrefte).
    const av = $('evnPauseAvslutt');
    if (kort && av && !$('h2NyVerden') && typeof window.EVN2_menyHandling === 'function') {
      const b = document.createElement('button'); b.id = 'h2NyVerden'; b.type = 'button'; b.className = 'liten'; b.textContent = '🌍 Lag en helt ny verden';
      let t0 = 0;
      b.addEventListener('click', e => { e.stopPropagation();         const andre = performance.now() - t0 < 6000; t0 = performance.now();
        window.EVN2_menyHandling('newworld');
        b.textContent = andre ? '✅ Ny verden neste gang du starter et spill' : '⚠️ Trykk igjen – det du har bygd blir borte';
        if (andre) t0 = 0; });
      kort.insertBefore(b, av);
    }
    if (kort && n && !$('h2Netter')) { const p = document.createElement('p'); p.id = 'h2Netter'; p.append('🌙 Netter overlevd: ', n); kort.insertBefore(p, $('evnPauseFortsett')); }
  }
  // Hjelp = pausemenyen med «Slik styrer du» åpen (spillet står stille mens den vises)
  function hjelp() {
    const åpneStyr = () => { const s = $('evnPauseStyrKnapp'); if (s && s.getAttribute('aria-expanded') !== 'true') s.click(); };
    const pause = $('evnPause'); if (pause && pause.classList.contains('vis')) { åpneStyr(); return; }   // pausen er allerede åpen
    const pk = $('evnPauseKnapp'); if (!pk || pk.hidden) return;
    pk.click(); setTimeout(åpneStyr, 30);
  }
  // Handlingshint: spillet kan vise to handlinger samtidig (f.eks. «E Bålet brenner for fullt · F Stek kjøtt»).
  // Vi viser bare én: den første som faktisk er en handling (ikke bare en melding om bålet).
  const INFO = /brenner for fullt|trenger mer|^\s*Hent ved/i;
  let sistBredde = 0;
  function hintBredde() {
    if (performance.now() - sistBredde < 500) return; sistBredde = performance.now();   // layoutmåling to ganger i sekundet holder
    const h = $('h2Hint'); if (!h) return;
    // Meldinger (#toast) under statusfeltet og topp-raden, så de aldri dekker dem (statusfeltet blir høyere når ressurser vises)
    const t = $('toast'), st = document.querySelector('#hud > .panel'), dg = $('h2Dag');
    if (t && st) t.style.top = (Math.max(st.getBoundingClientRect().bottom, dg ? dg.getBoundingClientRect().bottom : 0) + 10) + 'px';
    if (!document.body.classList.contains('touchui')) { h.style.maxWidth = ''; return; }
    const acts = document.querySelector('#touch .acts'), hb = $('hotbar'); if (!acts) return;
    if (innerHeight > innerWidth) { h.style.maxWidth = (innerWidth - 32) + 'px';   // høykant: over knappene til høyre, så hintet aldri dekker dem
      if (document.body.classList.contains('h2-hoy')) { h.style.bottom = (innerHeight - acts.getBoundingClientRect().top + 10) + 'px'; return; } } else {   // høykant: knappene ligger under hintet, så hele bredden kan brukes
    const midt = innerWidth / 2, høyre = acts.getBoundingClientRect().left - 8, venstre = Math.max(16, innerWidth - høyre);   // symmetrisk rundt midten
    h.style.maxWidth = Math.max(140, 2 * Math.min(midt - venstre, høyre - midt)) + 'px'; }
    const v = $('h2Vapen');
    if (hb && !hb.hidden && hb.offsetHeight && !document.body.classList.contains('h2-hoy')) { const top = hb.getBoundingClientRect().top; if (v) v.style.bottom = (innerHeight - top + 4) + 'px';
      h.style.bottom = (innerHeight - (v && !v.hidden ? v.getBoundingClientRect().top : top) + 6) + 'px'; } else h.style.bottom = '';
  }
  function hint() {
    const pr = $('prompt'), h = $('h2Hint'); if (!pr || !h) return;
    if (pr.hidden) { if (!h.hidden) h.hidden = true; return; }
    const par = []; let cur = null;
    for (const n of pr.childNodes) {
      if (n.nodeName === 'KBD') { cur = { k: n.textContent, t: '' }; par.push(cur); }
      else { const t = n.textContent.replace(/\u00a0/g, ' '); if (cur) cur.t += t; else if (t.trim()) par.push(cur = { k: '', t }); }
    }
    for (const x of par) x.t = x.t.trim();
    const esc = t => t.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const del = x => (x.k ? `<kbd>${x.k}</kbd>` : '') + esc(x.t);
    let html, info = false;
    if (par.length > 1 && /Avbryt/.test(par[par.length - 1].t)) html = par.map(del).join('<span class="og">·</span>');   // byggemodus: «Bygg …» og «Avbryt» hører sammen
    else {
      const valgt = par.find(x => x.t && !INFO.test(x.t));
      if (valgt) html = del(valgt);
      else if (par[0]) { html = esc(par.map(x => x.t).join(' ')); info = true; }   // bare en melding (f.eks. «Bålet brenner for fullt»): uten knapp
      else html = '';
    }
    if (h.innerHTML !== html) h.innerHTML = html;
    h.classList.toggle('info', info); h.hidden = !html;
  }
  addEventListener('keydown', e => { if (e.code === 'KeyH' && !e.repeat && !e.ctrlKey && !e.metaKey && document.body.classList.contains('h2-spiller')) hjelp(); });


  // ---------- Mobil på høykant: ryddig skjerm (3.11.2026, Ivars tilbakemelding) ----------
  // Under spilling vises bare status, dag, ☰, styrespak og knappene Hugg, Hopp og våpen. Resten ligger i ☰-menyen
  // eller vises bare når det kan brukes. Selve knappene er de samme som før (samme id-er og samme handlinger i spillet).
  const HØY = matchMedia('(pointer:coarse) and (orientation:portrait)');
  const trykkPå = el => { if (!el) return; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); };
  function lukkMeny() { const m = $('h2Ark'); if (m) m.hidden = true; const k = $('h2MenyKnapp'); if (k) k.setAttribute('aria-expanded', 'false'); }
  function høykant() {
    const rad = $('evnRad'); if (!rad || $('h2MenyKnapp')) return;
    const k = document.createElement('button'); k.id = 'h2MenyKnapp'; k.type = 'button'; k.textContent = '☰'; k.setAttribute('aria-label', 'Meny'); k.setAttribute('aria-expanded', 'false');
    const ark = document.createElement('div'); ark.id = 'h2Ark'; ark.hidden = true; ark.setAttribute('role', 'menu');
    const valg = [
      ['⏸', 'Pause', () => $('evnPauseKnapp') && $('evnPauseKnapp').click()],
      ['🎒', 'Ryggsekk', () => { const b = $('invBtn'); if (b) trykkPå(b); }],
      ['🗺️', 'Kart', () => $('evnKartKnapp') && $('evnKartKnapp').click()],
      ['🔨', 'Bygg', () => trykkPå($('buildBtn'))],
      ['🎥', 'Kamera', () => trykkPå($('camBtn'))],
      ['❓', 'Hjelp', () => hjelp()],
    ];
    for (const [ik, t, f] of valg) { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.innerHTML = `<span>${ik}</span>${t}`;
      b.addEventListener('click', e => { e.stopPropagation(); lukkMeny(); f(); }); ark.appendChild(b); }
    k.addEventListener('click', e => { e.stopPropagation(); ark.hidden = !ark.hidden; k.setAttribute('aria-expanded', String(!ark.hidden)); });
    [k, ark].forEach(el => ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation(), { passive: true })));
    rad.appendChild(k); document.body.appendChild(ark);
    document.addEventListener('pointerdown', e => { if (!ark.hidden && !ark.contains(e.target) && e.target !== k) lukkMeny(); }, true);
    // Våpenknapp ved handlingsknappene: viser valgt våpen, trykk åpner våpenvalget (hurtiglinja som eget vindu)
    const vk = document.createElement('button'); vk.id = 'h2VapenKnapp'; vk.type = 'button'; vk.setAttribute('aria-label', 'Velg våpen');
    vk.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); document.body.classList.toggle('h2-velg'); });
    const big = document.querySelector('#touch .acts .big'); if (big) big.appendChild(vk);
    const hb = $('hotbar'); if (hb) hb.addEventListener('pointerdown', () => setTimeout(() => document.body.classList.remove('h2-velg'), 120));
    document.addEventListener('pointerdown', e => { if (document.body.classList.contains('h2-velg') && !e.target.closest('#hotbar') && e.target !== vk) document.body.classList.remove('h2-velg'); }, true);
  }
  function høykantOppdater() {
    const p = HØY.matches; document.body.classList.toggle('h2-hoy', p);
    if (!p) { document.body.classList.remove('h2-velg'); lukkMeny(); return; }
    const vk = $('h2VapenKnapp'), ik = ($('wIcon') || {}).textContent || '🪓'; if (vk && vk.textContent !== ik) vk.textContent = ik;
    // Spis og Bygg bare når de kan brukes
    const pr = $('prompt'), ptxt = pr && !pr.hidden ? pr.textContent : '';
    const mat = verdi('raw').n > 0 || verdi('cooked').n > 0 || /stek|fisk|spis/i.test(ptxt);
    const e = $('eatBtn'); if (e) e.classList.toggle('h2-av', !mat);
    const b = $('buildBtn'); if (b) b.classList.toggle('h2-av', !/bål|bygg/i.test(ptxt));
  }
  function verdi(id) { const t = ($(id) || {}).textContent || '0'; const m = t.match(/(\d+)(?:\s*\/\s*(\d+))?/); return m ? { n: +m[1], maks: m[2] ? +m[2] : null } : { n: 0, maks: null }; }
  function oppdater() {
    if (!oppsett()) return; knapper(); høykant();
    const nå = performance.now(), hud = $('hud'), spiller = !!hud && !hud.hidden;
    document.body.classList.toggle('h2-spiller', spiller);
    if (!spiller) { document.body.classList.remove('h2-velg'); lukkMeny(); return; }   // startskjerm, slutt: ingenting å oppdatere
    høykantOppdater();
    // Våpenlinja over hurtiglinja følger hurtiglinja
    const hb = $('hotbar'), v = $('h2Vapen'); if (v && hb) v.hidden = hb.hidden;
    // Ressurser: endret siste 4 s, fullt lager, eller ved (når hintet handler om bålet)
    const pr = $('prompt'), bål = pr && !pr.hidden && /bål/i.test(pr.textContent);
    const kand = [];
    for (const [id, ik, grense] of RES) {
      const x = verdi(id);
      if (sist[id] !== undefined && x.n !== sist[id]) endret[id] = nå;
      sist[id] = x.n;
      const full = grense && x.maks && x.n >= x.maks, nylig = endret[id] && nå - endret[id] < VIS_MS;
      if (full || nylig || (bål && id === 'wood')) kand.push({ id, ik, x, full, nylig, pri: full ? 0 : nylig ? 1 : 2, t: endret[id] || 0 });
    }
    kand.sort((a, b) => a.pri - b.pri || b.t - a.t);
    const vis = kand.slice(0, MAKS).sort((a, b) => RES.findIndex(r => r[0] === a.id) - RES.findIndex(r => r[0] === b.id));
    const html = vis.map(c => `<span class="c${c.full ? ' full' : c.nylig ? ' ny' : ''}">${c.ik} ${c.x.n}${c.x.maks ? `<small>/${c.x.maks}</small>` : ''}${c.full ? ' <b class="f">FULLT</b>' : ''}</span>`).join('');
    const r = $('h2Res'); if (r.innerHTML !== html) r.innerHTML = html;
    hint(); hintBredde();
  }
  setInterval(oppdater, 150);
  if (document.readyState !== 'loading') oppdater(); else addEventListener('DOMContentLoaded', oppdater);
})();
