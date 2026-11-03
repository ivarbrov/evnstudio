// Test av ny HUD i Mørkeskogen 2.0, på PC (1280 × 720), mobil (844 × 390) og liten mobil (667 × 375), liggende.
// For hver situasjon: synlige HUD-elementer, overlapp mellom dem, størrelse på berøringsflater, antall ressurser og hint,
// og et skjermbilde. Ekte rAF (spillet kjører som vanlig). Situasjonene settes opp med verdier en spiller kunne hatt.
// Krever server på :8765. Bruk: node tester/hud-test.js [utmappe]   (BARE=pc|mobil|liten for én skjerm)
const { chromium } = require('playwright'); const fs = require('fs');
const UT = process.argv[2] || 'tester/resultater/hud-test';
const SKJERM = { pc: { viewport: { width: 1280, height: 720 } }, mobil: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }, liten: { viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true } };
const MIN_BERØRING = 44;
// Elementer som ikke skal overlappe hverandre (når de er synlige)
const SJEKK = ['#hud > .panel:first-child', '#h2Dag', '#evnPauseKnapp', '#evnKartKnapp', '#h2Hjelp', '#hotbar', '#h2Vapen', '#h2Hint', '#toast', '#jumpBtn', '#act', '#useBtn', '#eatBtn', '#buildBtn', '#camBtn'];

(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const rapport = {}; const feil = [];
  for (const [navn, o] of Object.entries(SKJERM).filter(([k]) => !process.env.BARE || process.env.BARE.split(',').includes(k))) {
    const ctx = await b.newContext({ ...o, deviceScaleFactor: 1 }), p = await ctx.newPage(), konsoll = [];
    p.on('pageerror', e => konsoll.push(e.message)); p.on('console', m => { if (m.type() === 'error') konsoll.push(m.text()); });
    await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {} });
    await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__F = () => ({ FX, FY }); window.__st = () => state;\n'), contentType: 'text/javascript' }));
    await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000 });
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.waitForFunction(() => window.__R3() && __R3().player && __R3().player.robot, null, { timeout: 300000, polling: 1000 });
    await p.evaluate(() => { __R3().renderer.setPixelRatio(.5); });   // raskere tegning i testmiljøet (HUD-en påvirkes ikke)
    const SIT = [
      ['ved-baalet', () => { const g = __g(), { FX, FY } = __F(); g.p.x = FX + 40; g.p.y = FY + 70; g.time = 40; g.wood = 5; g.stone = 2; }],
      ['ressurser-endres', () => { const g = __g(); g.wood += 1; g.stone += 1; g.raw += 1; g.skin += 1; }],
      ['fullt-lager', () => { window.__vent = () => /^15\//.test(document.getElementById('wood').textContent); const g = __g(), { FX, FY } = __F(); g.p.x = FX + 400; g.p.y = FY + 300; g.wood = 15; g.stone = 15; }],
      ['natt-kamp', () => { const g = __g(); g.time = 165; for (let k = 0; k < 3; k++) { const m = g.monsters[k]; if (m) { m.x = g.p.x + 30 * k; m.y = g.p.y - 60; } } }],
      ['byggemodus', () => { const g = __g(); g.time = 40; g.wood = 20; g.stone = 10; g.build = 'hytte'; }],
      ['ryggsekk-meny', () => { const g = __g(); g.build = null; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyI' })); }],
      ['hjelp-pause', () => { const x = document.getElementById('menuClose') || document.getElementById('menuX'); if (x) x.click(); setTimeout(() => document.getElementById('h2Hjelp').click(), 300); }],
    ];
    rapport[navn] = {};
    for (const [sit, f] of SIT) {
      await p.evaluate(() => { window.__vent = null; }); await p.evaluate(f); await p.waitForTimeout(2500);
      await p.waitForFunction(() => !window.__vent || window.__vent(), null, { timeout: 120000, polling: 500 }).catch(() => {}); await p.waitForTimeout(800);
      const r = await p.evaluate(({ SJEKK, MIN }) => {
        const synlig = el => { if (!el) return false; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; const b = el.getBoundingClientRect(); if (b.width < 2 || b.height < 2) return false; for (let x = el; x; x = x.parentElement) if (x.hidden) return false; return true; };
        const rekt = SJEKK.map(s => [s, document.querySelector(s)]).filter(([, el]) => synlig(el)).map(([s, el]) => { const b = el.getBoundingClientRect(); return { s, x: b.left, y: b.top, w: b.width, h: b.height }; });
        const overlapp = [];
        for (let i = 0; i < rekt.length; i++) for (let j = i + 1; j < rekt.length; j++) { const a = rekt[i], c = rekt[j]; const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y); if (ox > 1 && oy > 1) overlapp.push(`${a.s} × ${c.s}`); }
        const utenfor = rekt.filter(a => a.x < 0 || a.y < 0 || a.x + a.w > innerWidth + 1 || a.y + a.h > innerHeight + 1).map(a => a.s);
        const touch = document.body.classList.contains('touchui');
        const små = touch ? [...document.querySelectorAll('#touch button, #hotbar button, #evnPauseKnapp, #evnKartKnapp, #h2Hjelp')].filter(synlig).map(el => { const b = el.getBoundingClientRect(); return { id: el.id || el.dataset.w || el.textContent.trim(), w: Math.round(b.width), h: Math.round(b.height) }; }).filter(x => x.w < MIN || x.h < MIN) : [];
        const res = document.querySelectorAll('#h2Res .c').length, full = document.querySelectorAll('#h2Res .c.full').length;
        const pr = document.getElementById('h2Hint'); const pos = {}; for (const id of ['jumpBtn', 'act', 'useBtn', 'eatBtn', 'buildBtn', 'camBtn']) { const el = document.getElementById(id); if (el) { const b = el.getBoundingClientRect(); pos[id] = [Math.round(b.left), Math.round(b.top)]; } }
        return { synlige: rekt.map(a => a.s), overlapp, utenfor, små, ressurser: res, fulle: full, hint: synlig(pr) ? pr.textContent.trim() : null, avsluttSynlig: synlig(document.getElementById('evnAvslutt')),
          meny: synlig(document.getElementById('menu')), avsluttIPause: synlig(document.getElementById('evnPauseAvslutt')), lukk: (() => { const x = document.getElementById('h2Lukk'); if (!synlig(x)) return null; const b = x.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })(), vapen: synlig(document.getElementById('h2Vapen')) ? document.getElementById('h2Vapen').textContent.trim() : null, pause: synlig(document.getElementById('evnPause')), styrÅpen: synlig(document.getElementById('evnPauseStyr')), netter: (document.getElementById('h2Netter') || {}).textContent || null, tilstand: __st(), pos };
      }, { SJEKK, MIN: MIN_BERØRING });
      rapport[navn][sit] = r;
      await p.screenshot({ path: `${UT}/${navn}-${sit}.png`, timeout: 120000 }).catch(e => { r.skjermbilde = 'feilet: ' + e.message.slice(0, 60); });
      const pre = `${navn}/${sit}`;
      if (r.overlapp.length) feil.push(`${pre}: overlapp ${r.overlapp.join(', ')}`);
      if (r.utenfor.length) feil.push(`${pre}: utenfor skjermen ${r.utenfor.join(', ')}`);
      if (r.små.length) feil.push(`${pre}: for små berøringsflater ${r.små.map(x => `${x.id} ${x.w}×${x.h}`).join(', ')}`);
      if (r.ressurser > 3) feil.push(`${pre}: ${r.ressurser} ressurser (maks 3)`);
      if (r.avsluttSynlig) feil.push(`${pre}: Avslutt synlig i spill-HUD`);
    }
    { const sit = Object.values(rapport[navn]).filter(r => r.pos && r.tilstand === 'play'), f = sit[0];
      if (f) for (const id of Object.keys(f.pos)) if (sit.some(r => r.pos[id] && (r.pos[id][0] !== f.pos[id][0] || r.pos[id][1] !== f.pos[id][1]))) feil.push(`${navn}: ${id} flytter seg mellom situasjoner`); }
    if (rapport[navn]['fullt-lager'].fulle < 1) feil.push(`${navn}: fullt lager vises ikke`);
    if (!rapport[navn]['hjelp-pause'].avsluttIPause) feil.push(`${navn}: Avslutt mangler i pausemenyen`);
    { const l = rapport[navn]['hjelp-pause'].lukk; if (!l || l[0] > 60 || l[0] < 44) feil.push(`${navn}: lukkeknappen i pausen er ${l ? l.join('×') : 'borte'}`); }
    if (!rapport[navn]['ved-baalet'].vapen || !/Nivå/.test(rapport[navn]['ved-baalet'].vapen)) feil.push(`${navn}: våpen og nivå vises ikke`);
    if (!rapport[navn]['hjelp-pause'].styrÅpen) feil.push(`${navn}: hjelp åpner ikke «Slik styrer du»`);
    if (konsoll.length) feil.push(`${navn}: konsoll: ${konsoll.slice(0, 3).join(' | ')}`);
    rapport[navn].konsoll = konsoll;
    await ctx.close();
  }
  rapport.status = feil.length ? 'IKKE BESTÅTT' : 'BESTÅTT'; rapport.feil = feil;
  fs.writeFileSync(`${UT}/rapport.json`, JSON.stringify(rapport, null, 1));
  console.log(JSON.stringify({ status: rapport.status, feil }, null, 1));
  await b.close(); process.exit(feil.length ? 1 : 0);
})();
