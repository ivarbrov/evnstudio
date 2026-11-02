// Skjermbilder av Mørkeskogen 5.6.2 (original, r128) og 2.0 fra samme faste punkter, og et mål på hvor ulike de er.
// Brukes for å kontrollere at overgangsversjonen ikke endrer utseendet utilsiktet, og senere for å vise forbedringene.
// Krever at repoet serveres på :8765. Bruk: node tester/spill-skudd.js [utmappe]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const UT = process.argv[2] || 'tester/resultater/skudd';
const BASE = 'http://localhost:8765/';
const SIDER = { original: 'spill/morkeskogen/index.html', '2.0': 'spill/morkeskogen-2/spill/index.html' };

// Fast klokke og fast tilfeldighet, slik at begge sider får samme verden
const INIT = `(() => {
  let t = 1000; const nå = () => t; performance.now = nå; Date.now = () => 1.7e12 + t;
  const kø = []; window.requestAnimationFrame = f => { kø.push(f); return kø.length; }; window.cancelAnimationFrame = () => {};
  window.__steg = n => { for (let i = 0; i < n; i++) { t += 1000 / 60; const f = kø.splice(0); f.forEach(x => x(t)); } };
  let a = 424242; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  try { localStorage.clear(); localStorage.setItem('mork3d.verden', JSON.stringify({ v: 1, seed: 166771183, buildings: [] })); } catch (e) {}
})();`;
const KROK = 'window.__tv = { g: () => g, hero: () => hero, R3: () => R3, F: () => [FX, FY] };\n';

const PUNKTER = [
  { navn: 'dag-baal', tid: 40, opp: () => {} },
  { navn: 'kveld', tid: 125, opp: () => {} },
  { navn: 'natt', tid: 160, opp: () => {} },
  { navn: 'ovenfra', tid: 40, opp: () => { const R = __tv.R3(); R.camMode = 'far'; } },
];

async function side(browser, hvilken) {
  const ctx = await browser.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.feil = [];
  p.on('pageerror', e => p.feil.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') p.feil.push(m.type() + ': ' + m.text()); });
  await p.addInitScript(INIT);
  await p.route('**/statistikk.js', r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  const krok = (s, start) => s.replace(start, start + KROK);
  await p.route('**/' + SIDER.original, async r => r.fulfill({ body: krok(fs.readFileSync(SIDER.original, 'utf8'), '<script>\n(() => {\nconst WS = 1.6').replace('(() => {\nconst WS = 1.6' + KROK, '(() => {\n' + KROK + 'const WS = 1.6'), contentType: 'text/html; charset=utf-8' }));
  await p.route('**/spill/morkeskogen-2/spill/spill.js', async r => r.fulfill({ body: fs.readFileSync('spill/morkeskogen-2/spill/spill.js', 'utf8').replace('(() => {\n', '(() => {\n' + KROK), contentType: 'text/javascript; charset=utf-8' }));
  await p.goto(BASE + SIDER[hvilken], { waitUntil: 'domcontentloaded', timeout: 300000 });
  try { await p.waitForFunction(() => window.__tv && window.__tv.g, null, { timeout: 300000 }); } catch (e) { console.error(hvilken, 'lastet ikke:', p.feil.slice(0, 5)); throw e; }
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => __steg(10));
  return p;
}

(async () => {
  fs.mkdirSync(UT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const P = {}; for (const k of Object.keys(SIDER)) P[k] = await side(browser, k);
  const rapport = { dato: new Date().toISOString(), punkter: {} };
  for (const pk of PUNKTER) {
    const bilder = {};
    for (const [k, p] of Object.entries(P)) {
      await p.evaluate(([tid, opp]) => { const g = __tv.g(); g.time = tid; const [FX, FY] = __tv.F(); g.p.x = FX + 120; g.p.y = FY + 160; eval('(' + opp + ')')(); }, [pk.tid, pk.opp.toString()]);
      await p.evaluate(() => __steg(5));
      // Siste bilde tegnes og leses i samme oppgave, så WebGL-bufferen fortsatt er gyldig (ingen venting på skjermoppdatering)
      const url = await p.evaluate(() => { __steg(1); return document.getElementById('game').toDataURL('image/png'); });
      const fil = path.join(UT, `${pk.navn}-${k}.png`);
      fs.writeFileSync(fil, Buffer.from(url.split(',')[1], 'base64')); bilder[k] = fil;
    }
    // Forskjell regnes i nettleseren (ingen ekstra pakker)
    const diff = await P.original.evaluate(async ([a, b]) => {
      const last = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
      const [ia, ib] = await Promise.all([last(a), last(b)]);
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data; x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
      let sum = 0, store = 0; for (let i = 0; i < da.length; i += 4) { const d = (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3; sum += d; if (d > 24) store++; }
      return { snittAvvik: +(sum / (da.length / 4)).toFixed(2), andelStoreAvvik: +(store / (da.length / 4)).toFixed(4) };
    }, ['data:image/png;base64,' + fs.readFileSync(bilder.original).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(bilder['2.0']).toString('base64')]);
    rapport.punkter[pk.navn] = { ...diff, bilder };
    console.log(pk.navn, JSON.stringify(diff));
  }
  rapport.konsoll = Object.fromEntries(Object.entries(P).map(([k, p]) => [k, p.feil]));
  fs.writeFileSync(path.join(UT, 'rapport.json'), JSON.stringify(rapport, null, 1));
  console.log('konsoll:', JSON.stringify(rapport.konsoll).slice(0, 600));
  await browser.close();
})();
