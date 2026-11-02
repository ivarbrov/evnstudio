// LOGIKKTVILLING (fase 0, Mørkeskogen 2.0)
// Kjører original 5.6.2 (spill/morkeskogen/index.html) og 2.0 (spill/morkeskogen-2/spill/) side om side med
// samme frø, samme klokke og samme tastetrykk, og sammenligner spilltilstanden bilde for bilde.
//
// - Klokke og bildeløkke styres av testen (fast 60 Hz), Math.random har frø.
//   Grafikken får sin EGEN tallrekke (kall fra draw/render/make/build...), så ny grafikk i fase 1
//   ikke kan forskyve spillogikkens tilfeldige tall.
// - Tegningen i WebGL er slått av (render = tom), resten av grafikkoden kjører som vanlig.
// - Testkrok legges inn ved servering. Filene på disk endres ikke (sha256 kontrolleres).
// - Lagring: hver kjøring har sin egen, tomme nettleserprofil. Lagringstester bruker KOPIER av lagringer.
//
// Bruk: node tester/tvilling.js [kandidat=2.0|original|mutant|mutant2] [scener=alle]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROT = process.env.ROT || path.resolve(__dirname, '..');
const BASE = process.env.BASE || 'http://localhost:8765';
const KANDIDAT = process.argv[2] || '2.0';
const VALGTE = (process.argv[3] || 'alle').split(',');

const INIT = `(() => {
  // Fast klokke og bildeløkke
  let T = 1000; const t0 = 1767225600000;
  performance.now = () => T; Date.now = () => t0 + T;
  let kø = [], id = 0;
  window.requestAnimationFrame = cb => { kø.push(cb); return ++id; };
  window.cancelAnimationFrame = () => {};
  window.__steg = n => { for (let i = 0; i < n; i++) { T += 1000 / 60; const k = kø; kø = []; for (const cb of k) cb(T); } return T; };
  // To tallrekker med frø: spillogikk og grafikk
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const logikk = rng(424242), grafikk = rng(777);
  const GRAFIKK = /\\bat (draw|render\\w*|make\\w*|build\\w*|initR3|syncList|hero\\w*|tree\\w*|leafAtlas|groundTexture|instanced|ribbon|waterRibbon|cTex|attach\\w*|setCap|dc\\w*Mats|dcBuilder|dcMergeRig|gh\\w*|train\\w*|V3|mk|cone|lam|basic|facePt|capsuleGeo|hm|roundRect|TreeGB\\.\\w+|\\w+Geo)\\b/;
  window.__rngTeller = { logikk: 0, grafikk: 0 };
  // I draw() (merket av testkroken) går alt til grafikkrekka. Utenfor draw avgjør kallstakken (få kall, så det er billig).
  window.__iGrafikk = false;
  // Grafikkens inngangspunkter (draw, buildWorld, initR3) merkes ved servering; ingen kallstakk-sjekk (den var for treg).
  Math.random = () => { if (window.__iGrafikk) { __rngTeller.grafikk++; return grafikk(); } __rngTeller.logikk++; return logikk(); };
  try { const s = sessionStorage.getItem('__tvillingLagring'); if (s) { const o = JSON.parse(s); for (const k in o) localStorage.setItem(k, o[k]); sessionStorage.removeItem('__tvillingLagring'); } } catch (e) {}
})();`;
// Testkrok: lesetilgang og noen rene hjelpefunksjoner (for å finne plasser i verden). Brukes likt på begge sider.
const KROK = `window.__tv = { g: () => g, hero: () => hero, world: () => world, state: () => state,
  f: () => ({ target, canPlace, ghostPos, phaseInfo, trackPos, curW, LAKE_X, LAKE_Y, LAKE_R, DCX, DCY, FX, FY, DAY, DUSK, NIGHT, CAR_COACH }) };\n`;
const DRAW_FRA = 'if (g) draw(ts / 1000);', DRAW_TIL = 'if (g) { window.__iGrafikk = true; try { draw(ts / 1000); } finally { window.__iGrafikk = false; } }';
const MERK = t => ['buildWorld', 'initR3'].reduce((x, f) => x.replace(`function ${f}() {`, `function ${f}() { const __f = window.__iGrafikk; window.__iGrafikk = true; try { return ${f}__o.apply(this, arguments); } finally { window.__iGrafikk = __f; } }\nfunction ${f}__o() {`), t.replace(DRAW_FRA, DRAW_TIL));
// r128 legger render() på selve objektet i konstruktøren, så vi pakker inn konstruktøren
const SLÅ_AV_WEBGL = `<script>if (window.THREE) { const O = THREE.WebGLRenderer; THREE.WebGLRenderer = function (...a) { const r = new O(...a); r.render = function () {}; return r; }; THREE.WebGLRenderer.prototype = O.prototype; }</script>`;

function sha(f) { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); }
async function side(browser, hvilken) {
  const ctx = await browser.newContext({ viewport: { width: 480, height: 300 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.feil = []; p.on('pageerror', e => p.feil.push(e.message)); p.on('console', m => { if (m.type() === 'error') p.feil.push(m.text()); });
  await p.addInitScript(INIT);
  // Krok og avslått WebGL legges inn ved servering (identisk for begge)
  await p.route('**/spill/morkeskogen/index.html', async r => {
    let h = fs.readFileSync(path.join(ROT, 'spill/morkeskogen/index.html'), 'utf8');
    if (hvilken === 'mutant') h = h.replace('const PLAYER_SPEED = 170;', 'const PLAYER_SPEED = 171;');   // bevisst feil: testen MÅ oppdage den
    if (hvilken === 'mutant2') {                                                // bevisste feil i tog og ny verden
      const før = h;
      h = h.replace('left = Math.abs(target - tr.s), vmax = 300;', 'left = Math.abs(target - tr.s), vmax = 301;')
           .replace('world = { v: 1, seed: (Math.random() * 1e9) | 0, buildings: [] };', 'world = { v: 1, seed: ((Math.random() * 1e9) | 0) + 1, buildings: [] };');
      if (h === før) throw new Error('mutant2 traff ikke koden');
    }
    h = h.replace('<script>\n(() => {\nconst WS = 1.6', '<script>\n(() => {\n' + KROK + 'const WS = 1.6'); h = MERK(h);
    h = h.replace('<script src="../../vendor/three-r128.min.js"></script>', '<script src="../../vendor/three-r128.min.js"></script>' + SLÅ_AV_WEBGL);
    r.fulfill({ body: h, contentType: 'text/html; charset=utf-8' });
  });
  await p.route('**/spill/morkeskogen-2/spill/index.html', async r => {
    let h = fs.readFileSync(path.join(ROT, 'spill/morkeskogen-2/spill/index.html'), 'utf8');
    h = h.replace('<script src="../../../vendor/three-r128.min.js"></script>', '<script src="../../../vendor/three-r128.min.js"></script>' + SLÅ_AV_WEBGL);
    r.fulfill({ body: h, contentType: 'text/html; charset=utf-8' });
  });
  await p.route('**/spill/morkeskogen-2/spill/spill.js', async r => {
    const s = fs.readFileSync(path.join(ROT, 'spill/morkeskogen-2/spill/spill.js'), 'utf8').replace('(() => {\n', '(() => {\n' + KROK); const s2 = MERK(s);
    r.fulfill({ body: s2, contentType: 'text/javascript; charset=utf-8' });
  });
  await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  p.url_ = hvilken === '2.0' ? `${BASE}/spill/morkeskogen-2/spill/index.html` : `${BASE}/spill/morkeskogen/index.html`;
  return p;
}
async function last(p, lagring) {
  if (lagring) { await p.goto(BASE + '/favicon.png'); await p.evaluate(s => sessionStorage.setItem('__tvillingLagring', JSON.stringify(s)), lagring); }
  await p.goto(p.url_);
  await p.waitForFunction(() => window.__tv && window.__tv.g(), null, { timeout: 120000 });
}
const SNAP = () => {
  const sett = new WeakSet();
  const rep = (k, v) => {
    if (typeof k === 'string' && k[0] === '_') return undefined;                       // grafikkobjekter (t._m o.l.)
    if (typeof v === 'function') return undefined;
    if (v && typeof v === 'object') {
      if (v.isObject3D || v.isMaterial || v.isTexture || v.isBufferGeometry || (typeof Node !== 'undefined' && v instanceof Node) || v instanceof ImageData || (typeof ImageBitmap !== 'undefined' && v instanceof ImageBitmap)) return undefined;
      if (sett.has(v)) return '[samme objekt]'; sett.add(v);
    }
    if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
    return v;
  };
  const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('mork3d')) ls[k] = localStorage.getItem(k); }   // evn-spilletid skrives av en sanntidstimer (EVN-PAUSE), ikke av spillogikken, og sammenlignes ikke
  return JSON.stringify({ g: __tv.g(), hero: __tv.hero(), world: __tv.world(), state: __tv.state(), lagring: ls, rng: window.__rngTeller.logikk }, rep);
};
const HASH = `(() => { const s = (${SNAP.toString()})(); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) + ':' + s.length; })()`;
function forskjeller(a, b, sti = '', ut = []) {
  if (ut.length >= 15) return ut;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null)) { ut.push({ sti, a: kort(a), b: kort(b) }); return ut; }
  if (a && typeof a === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) forskjeller(a[k], b[k], sti + (Array.isArray(a) ? `[${k}]` : '.' + k), ut); return ut; }
  if (a !== b) ut.push({ sti, a: kort(a), b: kort(b) });
  return ut;
}
const kort = v => { const s = JSON.stringify(v); return s && s.length > 120 ? s.slice(0, 117) + '…' : s; };
function kategori(sti) {
  if (/^\.lagring/.test(sti)) return 'lagringsdata';
  if (/^\.hero\.(qdone|qp|quests?)/.test(sti)) return 'oppdrag';
  if (/^\.hero\.(owned|sel|wlvl)/.test(sti) || /\.p\.wid/.test(sti)) return 'våpen';
  if (/^\.hero\.xp|xpDay|xpKills/.test(sti)) return 'progresjon';
  if (/\.p\.(x|y|z|vx|vy|vz)$/.test(sti) || /\.(x|y)$/.test(sti)) return 'posisjon/kollisjon';
  if (/^\.rng/.test(sti)) return 'tilfeldighet (antall trekk)';
  return 'spilltilstand';
}

// ---------- Scener: samme handlinger sendes til begge sider ----------
const begge = (A, B, f) => Promise.all([f(A), f(B)]);
const steg = (A, B, n) => begge(A, B, p => p.evaluate(n => __steg(n), n));
const tast = async (A, B, kode, ned) => begge(A, B, p => ned ? p.keyboard.down(kode) : p.keyboard.up(kode));
async function hold(A, B, kode, bilder, sjekk) { await tast(A, B, kode, true); await sjekk(bilder); await tast(A, B, kode, false); }
const kjør = (A, B, js, arg) => begge(A, B, p => p.evaluate(js, arg));

const SCENER = {
  async start_og_gange(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click());
    await sjekk(30);
    await hold(A, B, 'KeyW', 150, sjekk); await hold(A, B, 'KeyD', 90, sjekk);
    await hold(A, B, 'KeyA', 60, sjekk); await tast(A, B, 'KeyS', true); await tast(A, B, 'Space', true); await sjekk(10); await tast(A, B, 'Space', false); await sjekk(50); await tast(A, B, 'KeyS', false);
    await kjør(A, B, () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyC' }))); await sjekk(60);
    await hold(A, B, 'KeyW', 120, sjekk);
  },
  async hugging_og_baal(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    // Gå til nærmeste tre (samme oppsett på begge sider) og hugg
    await kjør(A, B, () => { const g = __tv.g(), t = g.trees.filter(t => t.alive && !t.giant).sort((a, b) => Math.hypot(a.x - g.p.x, a.y - g.p.y) - Math.hypot(b.x - g.p.x, b.y - g.p.y))[0]; g.p.x = t.x; g.p.y = t.y + 40; window.__tre = t; });
    await sjekk(10);
    for (let i = 0; i < 10; i++) { await hold(A, B, 'KeyE', 6, sjekk); await sjekk(30); }
    await hold(A, B, 'KeyW', 60, sjekk);
    // Til bålet og legg på ved
    await kjør(A, B, () => { const g = __tv.g(); g.p.x = g.p.x * 0 + 5600 + 50; g.p.y = 5600 + 10; g.wood = Math.max(g.wood, 3); });
    await sjekk(10); await hold(A, B, 'KeyE', 6, sjekk); await sjekk(60);
  },
  async natt_og_monstre(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const g = __tv.g(); g.time = 138; g.p.x = 5600 + 600; g.p.y = 5600 + 300; });
    for (let i = 0; i < 6; i++) { await hold(A, B, i % 2 ? 'KeyA' : 'KeyD', 60, sjekk); await hold(A, B, 'KeyE', 6, sjekk); await sjekk(120); }
  },
  async bygging_og_sovn(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const g = __tv.g(); g.wood = 40; g.stone = 30; g.iron = 10; g.skin = 10; g.p.x = 5600 + 200; g.p.y = 5600 + 200; });
    await sjekk(10);
    for (const id of ['fire', 'build:hytte', 'build:seng']) {
      await kjør(A, B, () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }))); await sjekk(5);
      await kjør(A, B, id => { const b = document.querySelector(`button[data-act="${id}"]`); if (b && !b.disabled) b.click(); }, id); await sjekk(10);
      await hold(A, B, 'KeyE', 6, sjekk); await sjekk(30); await hold(A, B, 'KeyD', 40, sjekk);
    }
    await kjør(A, B, () => { __tv.g().time = 160; }); await sjekk(30); await hold(A, B, 'KeyE', 6, sjekk); await sjekk(240);
  },
  async hugging_felling(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const g = __tv.g(), t = g.trees.filter(t => t.alive && !t.giant).sort((a, b) => Math.hypot(a.x - g.p.x, a.y - g.p.y) - Math.hypot(b.x - g.p.x, b.y - g.p.y))[0]; g.p.x = t.x; g.p.y = t.y + 30; window.__tre = t; });
    await hold(A, B, 'KeyW', 3, sjekk);                                         // se mot treet
    for (let i = 0; i < 16; i++) { if (!(await A.evaluate(() => __tre.alive))) break; await hold(A, B, 'KeyE', 4, sjekk); await sjekk(32); }
    await sjekk(120);                                                           // treet faller, ved samles
  },
  async hytte_seng_sovn(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    // Finn en ledig tomt (søket gjøres på originalen; samme plass brukes på begge sider)
    const plass = await A.evaluate(() => { const g = __tv.g(), F = __tv.f(); for (let r = 300; r < 1400; r += 60) for (let a = 0; a < 6.28; a += .3) { const x = F.FX + Math.cos(a) * r, y = F.FY + Math.sin(a) * r; if (F.canPlace('hytte', x, y - 55) && F.canPlace('seng', x + 160, y - 55) && F.canPlace('hytte', x, y - 100)) return [x, y]; } return null; });
    if (!plass) throw new Error('Fant ingen ledig tomt');
    await kjør(A, B, pl => { const g = __tv.g(); g.wood = 60; g.stone = 40; g.iron = 10; g.skin = 10; g.p.x = pl[0]; g.p.y = pl[1]; }, plass);
    await hold(A, B, 'KeyW', 3, sjekk);
    for (const [id, dx] of [['build:hytte', 0], ['build:seng', 160]]) {
      await kjør(A, B, dx => { const g = __tv.g(); g.p.x += dx; }, dx); await hold(A, B, 'KeyW', 2, sjekk);
      await kjør(A, B, () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }))); await sjekk(5);
      await kjør(A, B, id => { const b = document.querySelector(`button[data-act="${id}"]`); if (b && !b.disabled) b.click(); }, id); await sjekk(10);
      await sjekk(50);
      for (let i = 0; i < 4 && (await A.evaluate(() => !!__tv.g().build)); i++) { await hold(A, B, 'KeyE', 4, sjekk); await sjekk(45); }
    }
    // Kveld, gå til senga og sov
    await kjør(A, B, () => { const g = __tv.g(), F = __tv.f(), b = g.buildings.find(b => b.type === 'seng'); g.time = F.DAY - 5; if (b) { g.p.x = b.x; g.p.y = b.y + 45; } });
    await hold(A, B, 'KeyW', 2, sjekk); await sjekk(20);
    await sjekk(50);
    for (let i = 0; i < 4 && !(await A.evaluate(() => !!__tv.g().sleep)); i++) { await hold(A, B, 'KeyE', 4, sjekk); await sjekk(50); }
    await A.evaluate(() => { (window.__obs = window.__obs || {}).sovnStartet = !!__tv.g().sleep; });
    await sjekk(570);
  },
  async fiske(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const h = __tv.hero(), g = __tv.g(), F = __tv.f(); if (!h.owned.includes('stang')) h.owned.push('stang'); h.sel = 'stang'; g.p.x = F.LAKE_X; g.p.y = F.LAKE_Y + F.LAKE_R + 30; });
    await hold(A, B, 'KeyW', 3, sjekk); await sjekk(10);
    for (let forsøk = 0; forsøk < 3; forsøk++) {
      await hold(A, B, 'KeyE', 4, sjekk);                                       // kast
      for (let i = 0; i < 60; i++) {                                            // vent på napp (inntil 20 s)
        const st = await A.evaluate(() => __tv.g().p.fish && __tv.g().p.fish.st);
        if (!st) break;
        if (st === 'bite') { await hold(A, B, 'KeyE', 4, sjekk); } else if (st === 'reel') { await hold(A, B, 'KeyE', 40, sjekk); await sjekk(8); } else await sjekk(20);
      }
      await sjekk(60);
    }
  },
  async lasso(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const h = __tv.hero(), g = __tv.g(); h.xp = 99999; if (!h.owned.includes('lasso')) h.owned.push('lasso'); h.sel = 'lasso';
      const a = g.animals.filter(a => !a.dead).sort((a, b) => Math.hypot(a.x - g.p.x, a.y - g.p.y) - Math.hypot(b.x - g.p.x, b.y - g.p.y))[0]; window.__dyr = a; g.p.x = a.x; g.p.y = a.y + 110; });
    for (let i = 0; i < 6; i++) { await kjør(A, B, () => { const g = __tv.g(), a = __dyr; g.p.x = a.x; g.p.y = a.y + 110; }); await hold(A, B, 'KeyW', 2, sjekk); await hold(A, B, 'KeyE', 4, sjekk); await sjekk(60); }
    await hold(A, B, 'KeyS', 90, sjekk); await sjekk(60);                       // tamme dyr følger etter
  },
  async beinslottet(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const h = __tv.hero(), g = __tv.g(); h.xp = 99999; for (const id of ['sverd', 'bue']) if (!h.owned.includes(id)) h.owned.push(id); const P = g.dcPath; const e = P[P.length - 1]; g.p.x = e[0] !== undefined ? e[0] : e.x; g.p.y = e[1] !== undefined ? e[1] : e.y; });
    await sjekk(30);
    for (const k of ['KeyD', 'KeyW', 'KeyW', 'KeyA', 'KeyW']) { await hold(A, B, k, 90, sjekk); await hold(A, B, 'KeyE', 4, sjekk); await sjekk(20); }
  },
  async tog(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    let pos = null;
    for (let i = 0; i < 30 && !pos; i++) {
      pos = await A.evaluate(() => { const g = __tv.g(), F = __tv.f(), tr = g.town && g.town.train; if (!tr) throw new Error('Fant ikke toget'); if (tr.st !== 'wait') return null; const c = F.trackPos(tr.s - F.CAR_COACH); return [c.x, c.y]; });
      if (!pos) await sjekk(120);
    }
    if (!pos) throw new Error('Toget ble aldri klart');
    await A.evaluate(() => { (window.__obs = window.__obs || {}).togFra = __tv.g().town.train.at; });
    for (let i = 0; i < 6 && !(await A.evaluate(() => !!__tv.g().ride)); i++) {
      await kjør(A, B, t => { const g = __tv.g(); g.p.x = t[0] + 30; g.p.y = t[1] + 30; }, pos); await sjekk(30);
      await hold(A, B, 'KeyE', 4, sjekk); await sjekk(20);
    }
    await A.evaluate(() => { window.__obs.påToget = !!__tv.g().ride; });
    await sjekk(1500);                                                          // turen
    await A.evaluate(() => { window.__obs.togTil = __tv.g().town.train.at; window.__obs.ferdigRidd = !__tv.g().ride; });
  },
  async ny_verden(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const g = __tv.g(); g.wood = 40; g.stone = 30; g.iron = 10; g.skin = 10; });
    for (const k of ['KeyI', 'KeyB']) {
      await kjør(A, B, k => window.dispatchEvent(new KeyboardEvent('keydown', { code: k })), k); await sjekk(5);
      const fant = await A.evaluate(() => !!document.querySelector('button[data-act="newworld"]'));
      if (fant) { for (let i = 0; i < 2; i++) { await kjør(A, B, () => document.querySelector('button[data-act="newworld"]')?.click()); await sjekk(30); } break; }
      await kjør(A, B, () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }))); await sjekk(5);
    }
    await sjekk(60);
  },
  async vaapen(A, B, sjekk) {
    await kjør(A, B, () => document.getElementById('startBtn').click()); await sjekk(10);
    await kjør(A, B, () => { const h = __tv.hero(); h.xp = 99999; for (const id of ['sverd', 'spyd', 'bue', 'stav', 'hammer', 'heksestav', 'lasso', 'beinbue']) if (!h.owned.includes(id)) h.owned.push(id); });
    await sjekk(5);
    for (const k of ['Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit8', 'Digit0', 'Digit1']) {
      await kjør(A, B, k => window.dispatchEvent(new KeyboardEvent('keydown', { code: k })), k); await sjekk(5);
      await hold(A, B, 'KeyE', 30, sjekk); await sjekk(40); await hold(A, B, 'KeyW', 20, sjekk);
    }
  },
};

(async () => {
  const filer = { original: sha(path.join(ROT, 'spill/morkeskogen/index.html')) };
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const rapport = { kandidat: KANDIDAT, dato: new Date().toISOString(), filer, scener: {} };
  for (const [navn, scene] of Object.entries(SCENER)) {
    if (!VALGTE.includes('alle') && !VALGTE.includes(navn)) continue;
    const A = await side(browser, 'original'), B = await side(browser, KANDIDAT);
    await Promise.all([last(A), last(B)]);
    let bilder = 0, første = null, sjekker = 0;
    const sjekk = async n => {
      // steg i biter på 30 bilder og sammenlign etter hver bit
      while (n > 0) { const k = Math.min(30, n); await steg(A, B, k); n -= k; bilder += k; sjekker++;
        if (første) continue;
        const [ha, hb] = await Promise.all([A.evaluate(HASH), B.evaluate(HASH)]);
        if (ha === hb) continue;
        const [sa, sb] = await Promise.all([A.evaluate(SNAP), B.evaluate(SNAP)]);
        if (sa !== sb) { const d = forskjeller(JSON.parse(sa), JSON.parse(sb)); første = { bilde: bilder, sekunder: +(bilder / 60).toFixed(2), antall: d.length, forskjeller: d.map(x => ({ ...x, kategori: kategori(x.sti) })) }; }
      }
    };
    await scene(A, B, sjekk);
    const dekning = await A.evaluate(() => { const g = __tv.g(), h = __tv.hero(); return { observert: window.__obs || null, verdensfrø: __tv.world().seed, fisk: (g.p.fish && g.p.fish.st) || null, fiskebok: Object.keys(h.fishBook || {}).length, tammeDyr: (g.pets || []).length, rir: !!g.ride, togStatus: g.town && g.town.train ? g.town.train.st : null, slottEtasje: g.dc ? g.dc.pf : null, treFelt: window.__tre ? !window.__tre.alive : null, monstre: g.monsters.length, bygninger: g.buildings.map(b => b.type), bålnivå: g.fireLvl, ved: g.wood, nattTeller: g.nights, sover: !!g.sleep, eideVåpen: h.owned.length, valgtVåpen: h.sel, xp: h.xp, oppdragFerdig: (h.qdone || []).length, hp: Math.round(g.hp), prosjektiler: g.projs.length }; });
    // Lagring: last siden på nytt med KOPI av lagringen fra hver side, og sammenlign igjen
    const [la, lb] = await Promise.all([A.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; }), B.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; })]);
    const A2 = await side(browser, 'original'), B2 = await side(browser, KANDIDAT);
    await Promise.all([last(A2, la), last(B2, la)]);   // begge laster SAMME kopi (fra originalen)
    await kjør(A2, B2, () => document.getElementById('startBtn').click()); await steg(A2, B2, 60);
    const [ra, rb] = await Promise.all([A2.evaluate(SNAP), B2.evaluate(SNAP)]);
    const lagringLik = JSON.stringify(la) === JSON.stringify(lb), lastLik = ra === rb;
    rapport.scener[navn] = {
      dekning, bilder, sekunder: +(bilder / 60).toFixed(1), sammenligninger: sjekker, likTilstand: !første, førsteAvvik: første,
      lagringEtterScene: { nøkler: Object.keys(la).filter(k => k.startsWith('mork3d') || k.startsWith('evn-')), likMellomSidene: lagringLik },
      lastetPåNytt: { likTilstand: lastLik, avvik: lastLik ? null : forskjeller(JSON.parse(ra), JSON.parse(rb)).map(x => ({ ...x, kategori: kategori(x.sti) })) },
      rngTrekk: await A.evaluate(() => __rngTeller), feil: [...A.feil, ...B.feil, ...A2.feil, ...B2.feil].slice(0, 5),
    };
    console.error(navn, rapport.scener[navn].likTilstand ? 'LIK' : 'AVVIK', bilder, 'bilder');
    for (const p of [A, B, A2, B2]) await p.context().close();
  }
  filer.etter = sha(path.join(ROT, 'spill/morkeskogen/index.html'));
  rapport.originalUendret = filer.original === filer.etter;
  console.log(JSON.stringify(rapport, null, 1));
  if (process.env.UT) fs.writeFileSync(process.env.UT, JSON.stringify(rapport, null, 1));
  await browser.close();
})();
