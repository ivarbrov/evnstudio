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
    // Avslutt ytterst til høyre (EVN UI-standard KS5)
    const avs = $('evnAvslutt'); if (avs && avs.parentNode === rad) rad.appendChild(avs);
    // Riktig hjelpetekst: kjøres etter EVN-PAUSE sin egen lytter på samme knapp
    const sk = $('evnPauseStyrKnapp'); if (sk && !sk.dataset.h2Styr) { sk.dataset.h2Styr = '1'; sk.addEventListener('click', skrivStyring); }
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
  // Tab flytter bare fokus (EVN UI-standard KS8, T2). Spillet får ikke Tab, så Tab åpner ikke lenger ryggsekken (I og 🎒 gjør det).
  // Står fokus på body eller en skjult knapp (for eksempel Start etter oppstart), flyttes det til første synlige knapp i toppraden.
  // Ellers går Tab ut av siden, og spillet settes på pause (Chrome husker den skjulte Start-knappen som startpunkt).
  window.addEventListener('keydown', e => { if (e.key !== 'Tab' && e.code !== 'Tab') return; e.stopImmediatePropagation();
    const a = document.activeElement;
    if (!a || a === document.body || !a.getClientRects().length) {
      const f = [...document.querySelectorAll('#evnRad button, #evnRad a, #hotbar button')].find(el => el.getClientRects().length && !el.disabled);
      if (f) { e.preventDefault(); f.focus(); }
    } }, true);
  // «Slik styrer du» i pausen: riktig tekst for musa (første klikk låser), kartknappen, spis og hjelp. Teksten i spill.js er uendret.
  const STYR_PC = '⌨️ Gå: <b>W A S D</b> eller pilene · Hopp: <b>mellomrom</b><br>🖱️ Første klikk: musa styrer kameraet · Hugg: <b>venstre musknapp</b><br>Se rundt uten å låse musa: <b>høyre musknapp</b> og dra · Zoom: musehjulet<br>Gjør ting: <b>E</b> · Spis: <b>F</b> eller <b>Q</b> · Våpen: <b>1–0</b><br>🔨 Bygg: <b>B</b> · 🎒 Sekk: <b>I</b> · 🗺️ Kart: <b>M</b> · 🎥 Kamera: <b>C</b><br>⏸ Pause: <b>P</b> eller <b>Esc</b> · ❓ Hjelp: <b>H</b>';
  const STYR_TOUCH = '👆 Gå: dra med fingeren · Se rundt: dra med en annen finger · Zoom: knip<br>🪓 Hugg: trykk øksa · ⤴️ Hopp · ✋ Bruk: trykk hånda<br>🔨 Bygg · 🍖 Spis · 🎥 Kamera · 🗺️ Kart: trykk 🗺️ øverst<br>⏸ Pause · ❓ Hjelp';
  // Lytteren legges på selve knappen (i knapper()), fordi EVN-PAUSE stopper klikk fra å boble opp fra pausekortet.
  const skrivStyring = () => { const s = $('evnPauseStyr'); if (s && !s.hidden) s.innerHTML = document.body.classList.contains('touchui') ? STYR_TOUCH : STYR_PC; };
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
    const t = $('toast'), st = document.querySelector('#hud > .panel'), dg = $('h2Dag'), v = $('h2Vapen');
    const touch = document.body.classList.contains('touchui'), høykant = touch && innerHeight > innerWidth;
    // Mobil på høykant: våpenlinja under statusfeltet (ellers over hurtiglinja, se under)
    if (v) { if (høykant && st) { v.style.bottom = 'auto'; v.style.top = (st.getBoundingClientRect().bottom + 6) + 'px'; } else v.style.top = ''; }
    const vUnder = høykant && v && !v.hidden ? v.getBoundingClientRect().bottom : 0;
    if (t && st) t.style.top = (Math.max(st.getBoundingClientRect().bottom, dg ? dg.getBoundingClientRect().bottom : 0, vUnder) + 10) + 'px';
    if (!touch) { h.style.maxWidth = ''; return; }
    const acts = document.querySelector('#touch .acts'), hb = $('hotbar'); if (!acts) return;
    if (høykant) {   // høykant: hintet rett over roboten, i hele bredden. Hurtiglinja og knappene ligger nederst (hud2.css).
      // Bredden holder seg unna verktøykolonnen til høyre (symmetrisk rundt midten). Lange hint brytes over flere linjer (hud2.css).
      const kol = acts.querySelector('.small'), midt = innerWidth / 2, kant = kol ? kol.getBoundingClientRect().left - 8 : innerWidth - 16;
      h.style.maxWidth = (2 * Math.max(70, Math.min(midt - 16, kant - midt))) + 'px';
      // Hintet står på 48 % av høyden, men flyttes ned når en melding (#toast) ellers ville blitt dekket
      let bunn = Math.round(innerHeight * 0.48);
      if (t && t.classList.contains('show')) bunn = Math.min(bunn, Math.round(innerHeight - t.getBoundingClientRect().bottom - 6 - h.offsetHeight));
      h.style.bottom = bunn + 'px'; return; }
    const midt = innerWidth / 2, høyre = acts.getBoundingClientRect().left - 8, venstre = Math.max(16, innerWidth - høyre);   // symmetrisk rundt midten
    h.style.maxWidth = Math.max(140, 2 * Math.min(midt - venstre, høyre - midt)) + 'px';
    if (hb && !hb.hidden) { const top = hb.getBoundingClientRect().top; if (v) v.style.bottom = (innerHeight - top + 4) + 'px';
      h.style.bottom = (innerHeight - (v && !v.hidden ? v.getBoundingClientRect().top : top) + 6) + 'px'; }
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

  function verdi(id) { const t = ($(id) || {}).textContent || '0'; const m = t.match(/(\d+)(?:\s*\/\s*(\d+))?/); return m ? { n: +m[1], maks: m[2] ? +m[2] : null } : { n: 0, maks: null }; }
  function oppdater() {
    if (!oppsett()) return; knapper();
    const nå = performance.now(), hud = $('hud'), spiller = !!hud && !hud.hidden;
    document.body.classList.toggle('h2-spiller', spiller);
    if (!spiller) return;   // startskjerm, slutt: ingenting å oppdatere
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
