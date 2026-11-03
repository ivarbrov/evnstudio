// Funksjonstest av Mørkeskogen 2.0 før publisering: gammel 5.6.2-lagring (kopi, testdata), ryggsekk med faner,
// valg av våpen, pause med «Ny verden», lukkeknapp, kart, Avslutt og «Start helt på nytt». PC og mobil på høykant.
// Krever server på :8765. Bruk: node tester/funksjonstest.js [utmappe]
const { chromium } = require('playwright'); const fs = require('fs');
const UT = process.argv[2] || 'tester/resultater/funksjonstest';
const SKJERM = { pc: { viewport: { width: 1280, height: 720 } }, hoykant: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } };
const HELT = { v: 1, owned: ['oks', 'sverd', 'stang'], sel: 'sverd', wlvl: { sverd: 2 }, xp: 150, qdone: [], qprog: {}, fishBook: { orret: 31 }, cap: false };
const VERDEN = { v: 1, seed: 166771183, buildings: [] };

(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const rapport = {}, feil = [];
  for (const [navn, o] of Object.entries(SKJERM)) {
    const ctx = await b.newContext({ ...o, deviceScaleFactor: 1 }), konsoll = []; let p = await ctx.newPage();
    const sjekk = (ok, tekst) => { console.log(navn, ok ? 'OK ' : 'FEIL', tekst); (rapport[navn] = rapport[navn] || {})[tekst] = !!ok; if (!ok) feil.push(`${navn}: ${tekst}`); };
    p.on('pageerror', e => konsoll.push(e.message)); p.on('console', m => { if (m.type() === 'error') konsoll.push(m.text()); });
    await ctx.addInitScript(({ H, V }) => { if (sessionStorage.getItem('__lagt')) return; sessionStorage.setItem('__lagt', 1); localStorage.clear(); localStorage.setItem('mork3d.helt', JSON.stringify(H)); localStorage.setItem('mork3d.verden', JSON.stringify(V)); }, { H: HELT, V: VERDEN });
    await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.route('**/spill/morkeskogen-2/spill/spill.js', r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\nwindow.__R3 = () => R3; window.__g = () => g; window.__h = () => hero; window.__st = () => state;\n'), contentType: 'text/javascript' }));
    await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000 });
    const vis = sel => p.evaluate(s => { const el = document.querySelector(s); if (!el) return false; for (let x = el; x; x = x.parentElement) { if (x.hidden) return false; const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; } const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; }, sel);
    // Klikk via DOM (SwiftShader sulter rAF, så Playwrights stabilitetssjekk henger). Sjekker først at ingenting dekker knappen.
    const trykk = async sel => { const r = await p.evaluate(s => { const el = document.querySelector(s); if (!el) return 'mangler'; const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); if (!t || !(el === t || el.contains(t))) return 'dekket av ' + (t ? (t.id || t.className || t.tagName) : 'ingenting'); el.click(); return 'ok'; }, sel); if (r !== 'ok') feil.push(`${navn}: ${sel} ${r}`); };
    sjekk(await vis('#evnNullstill'), 'startskjerm viser «Start helt på nytt» når det finnes lagring');
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.waitForFunction(() => window.__R3 && __R3() && __R3().player && __R3().player.robot && __st() === 'play', null, { timeout: 300000, polling: 1000 });
    await p.evaluate(() => { const r = __R3().renderer; r.__tegn = r.render; r.render = () => {}; });   // uten 3D-tegning: testen gjelder funksjoner, og SwiftShader er tregt
    const h = await p.evaluate(() => JSON.parse(JSON.stringify(__h())));
    sjekk(['oks', 'sverd', 'stang'].every(x => h.owned.includes(x)) && h.sel === 'sverd' && h.xp === 150 && h.fishBook.orret === 31 && h.wlvl.sverd === 2, 'gammel lagring lastet uendret (våpen, valgt våpen, XP, fiskebok, våpennivå)');
    // Ryggsekken
    await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyI' }))); await p.waitForTimeout(600);
    const m1 = await p.evaluate(() => ({ tittel: document.getElementById('menuTitle').textContent, faner: [...document.querySelectorAll('#menuList [data-fane]')].map(x => [x.dataset.fane, x.getAttribute('aria-selected'), Math.round(x.getBoundingClientRect().height), Math.round(x.getBoundingClientRect().right)]), grid: !!document.querySelector('#menuList .igrid'), tekst: document.getElementById('menuList').textContent, st: __st() }));
    rapport[navn].sekk = m1;
    sjekk(m1.st === 'menu' && m1.faner.length === 3 && m1.faner[0][1] === 'true', 'ryggsekken åpner med tre faner, «Sekk» valgt');
    sjekk(m1.faner.every(f => f[2] >= 44 && f[3] <= o.viewport.width), 'fanene er minst 44 px høye og innenfor skjermen');
    sjekk(m1.grid && /Fiskeboka: 1 av/.test(m1.tekst), 'Sekk-fanen viser lommer og fiskebok');
    sjekk(!/Capsen|Ny verden|Lag en helt ny verden/.test(m1.tekst), 'capsen og «Ny verden» er ikke i ryggsekken');
    await trykk('#menuList [data-fane="vapen"]'); await p.waitForTimeout(300);
    const m2 = await p.evaluate(() => ({ tekst: document.getElementById('menuList').textContent, valgt: document.querySelector('#menuList [data-fane="vapen"]').getAttribute('aria-selected'), grid: !!document.querySelector('#menuList .igrid') }));
    sjekk(m2.valgt === 'true' && /Nivå/.test(m2.tekst) && /Sverd/.test(m2.tekst) && !m2.grid, 'Våpen-fanen viser nivå og våpen');
    await trykk('#menuList button[data-act="sel:oks"]'); await p.waitForTimeout(300);
    const sel = await p.evaluate(() => [__h().sel, JSON.parse(localStorage.getItem('mork3d.helt')).sel, !!document.querySelector('#menuList [data-fane="vapen"].on')]);
    sjekk(sel[0] === 'oks' && sel[1] === 'oks' && sel[2], 'velge øks i Våpen-fanen virker, lagres og fanen blir stående');
    await trykk('#menuList [data-fane="lag"]'); await p.waitForTimeout(300);
    const m3 = await p.evaluate(() => document.querySelectorAll('#menuList .mrow').length);
    sjekk(m3 >= 1, 'Lag-fanen viser minst én rad');
    await p.evaluate(() => { const r = __R3().renderer; r.render = r.__tegn; }); await p.waitForTimeout(1500); await p.screenshot({ path: `${UT}/${navn}-sekk-lag.png`, timeout: 120000 }).catch(() => {}); await p.evaluate(() => { __R3().renderer.render = () => {}; });
    await trykk('#menuX'); await p.waitForTimeout(400);
    sjekk(await p.evaluate(() => __st() === 'play'), 'menyen lukkes med ✕');
    // Pausen
    await trykk('#evnPauseKnapp'); await p.waitForTimeout(500);
    sjekk(await vis('#evnPause') && await vis('#evnPauseAvslutt') && await vis('#h2NyVerden') && await vis('#h2Lukk'), 'pausen viser Avslutt, «Lag en helt ny verden» og lukkeknapp');
    await trykk('#h2NyVerden'); await p.waitForTimeout(200);
    const t1 = await p.evaluate(() => [document.getElementById('h2NyVerden').textContent, JSON.parse(localStorage.getItem('mork3d.verden')).seed]);
    sjekk(/Trykk igjen/.test(t1[0]) && t1[1] === VERDEN.seed, 'første trykk på «Ny verden» spør bare (verden uendret)');
    await trykk('#h2NyVerden'); await p.waitForTimeout(200);
    const t2 = await p.evaluate(() => [document.getElementById('h2NyVerden').textContent, JSON.parse(localStorage.getItem('mork3d.verden'))]);
    sjekk(/neste gang/.test(t2[0]) && t2[1].seed !== VERDEN.seed && t2[1].buildings.length === 0, 'andre trykk lager ny verden (samme handling som før)');
    await p.screenshot({ path: `${UT}/${navn}-pause.png`, timeout: 120000 }).catch(() => {});
    await trykk('#h2Lukk'); await p.waitForTimeout(500);
    sjekk(!(await vis('#evnPause')) && await p.evaluate(() => __st() === 'play'), 'lukkeknappen lukker pausen');
    // Kart
    await trykk('#evnKartKnapp'); await p.waitForTimeout(600);
    sjekk(await vis('#evnKart'), 'kartet åpnes'); await trykk('#evnKartLukk'); await p.waitForTimeout(400);
    sjekk(!(await vis('#evnKart')), 'kartet lukkes');
    // Start helt på nytt
    // Ny fane i samme profil (samme localStorage); navigering bort fra en tung 3D-side henger i SwiftShader
    await p.close(); p = await ctx.newPage(); p.on('pageerror', e => konsoll.push(e.message));
    await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
    await p.goto('http://localhost:8765/spill/morkeskogen-2/spill/index.html', { timeout: 200000, waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000);
    await trykk('#evnNullstill'); await p.waitForTimeout(300); await trykk('#evnNullstillJa');
    await p.waitForTimeout(6000);
    const igjen = await p.evaluate(() => ['mork3d.helt', 'mork3d.verden', 'mork3d.q'].map(k => localStorage.getItem(k)));
    sjekk(igjen.every(x => x === null) && !(await vis('#evnNullstill')), '«Start helt på nytt» sletter lagringen');
    if (konsoll.length) feil.push(`${navn}: konsoll: ${konsoll.slice(0, 3).join(' | ')}`);
    rapport[navn].konsoll = konsoll;
    await ctx.close();
  }
  rapport.status = feil.length ? 'IKKE BESTÅTT' : 'BESTÅTT'; rapport.feil = feil;
  fs.writeFileSync(`${UT}/rapport.json`, JSON.stringify(rapport, null, 1));
  console.log(JSON.stringify({ status: rapport.status, feil }, null, 1));
  await b.close(); process.exit(feil.length ? 1 : 0);
})();
