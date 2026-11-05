#!/usr/bin/env node
/*
 * EVN Testsuite – kjører test/index.html i Chrome eller Edge uten skjerm.
 * Ingen avhengigheter: bare Node 22+ og en nettleser som allerede er installert.
 *
 *   node test/kjor.mjs [--base origin/main] [--suiter statisk,royk] [--json fil.json] [--nettleser sti]
 *
 * --base     grenen som avgjør hvilke tester som er obligatoriske. En test er obligatorisk når
 *            filen den tester, finnes på base. Mangler filen her, feiler kjøringen.
 * Nettleser: --nettleser, CHROME_PATH, eller Chrome/Edge på vanlige steder.
 *
 * Avslutter med kode 1 hvis en kontroll feiler eller en obligatorisk test mangler.
 * Skriver en testkvittering (commit, testversjon og resultat per suite) som EVN Game QA tar med i rapporten,
 * og som publiseringssjekken sammenligner med kjøringen i GitHub Actions.
 */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const BASE = arg('base', process.env.EVN_BASE || 'origin/main');
const SUITER = arg('suiter', '');
const MAKS_MS = 15 * 60 * 1000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.wav': 'audio/wav', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8' };

const git = (...a) => { try { return execFileSync('git', ['-c', 'core.quotePath=false', ...a], { cwd: ROT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };

// ---- Statisk server for repoet (som GitHub Pages: mappe gir index.html) ----
function server() {
  return new Promise(r => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!f.startsWith(ROT)) { res.writeHead(403); return res.end(); }
      try {
        if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
        const data = fs.readFileSync(f);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : data);
      } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404'); }
    });
    s.listen(0, '127.0.0.1', () => r(s));
  });
}

function finnNettleser() {
  const kandidater = [arg('nettleser'), process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  return kandidater.find(k => k && fs.existsSync(k));
}

// ---- Chrome DevTools Protocol over Node sin innebygde WebSocket ----
async function startNettleser(bin) {
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'evn-test-'));
  const p = spawn(bin, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profil, '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking', '--disable-sync', '--window-size=1400,1000', '--autoplay-policy=no-user-gesture-required',
    // GitHubs Linux-maskiner tillater ikke Chromes egen sandkasse. Maskinen er engangs og uten hemmeligheter.
    ...(process.env.CI === 'true' && process.platform === 'linux' ? ['--no-sandbox'] : []), 'about:blank'],
    { stdio: 'ignore' });
  const fil = path.join(profil, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(fil); i++) await new Promise(r => setTimeout(r, 200));
  const [port, sti] = fs.readFileSync(fil, 'utf8').split('\n');
  const ws = new WebSocket('ws://127.0.0.1:' + port.trim() + sti.trim());
  await new Promise((r, a) => { ws.onopen = r; ws.onerror = a; });
  let id = 0; const venter = new Map(), lyttere = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && venter.has(d.id)) { const [r, a] = venter.get(d.id); venter.delete(d.id); d.error ? a(new Error(d.error.message)) : r(d.result); }
    else if (d.method) lyttere.forEach(l => l(d));
  };
  const send = (method, params = {}, sessionId) => new Promise((r, a) => { const n = ++id; venter.set(n, [r, a]); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
  const lukk = async () => {
    try { ws.close(); } catch {}
    try { p.kill(); } catch {}
    for (let i = 0; i < 20; i++) { try { fs.rmSync(profil, { recursive: true, force: true }); return; } catch { await new Promise(r => setTimeout(r, 250)); } }
  };
  return { send, lytt: l => lyttere.push(l), lukk };
}

async function main() {
  if (typeof WebSocket === 'undefined') { console.error('Krever Node 22 eller nyere (innebygd WebSocket).'); process.exit(2); }
  const bin = finnNettleser();
  if (!bin) { console.error('Fant ingen Chrome eller Edge. Oppgi --nettleser eller CHROME_PATH.'); process.exit(2); }
  const srv = await server();
  const port = srv.address().port;
  const nl = await startNettleser(bin);
  const { targetId } = await nl.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await nl.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => nl.send(m, p, sessionId);

  // Feil som siden selv ikke ser (oppstartsfeil, CSP-brudd, manglende filer), fordelt per spill.
  // Statistikktesten lager feil med vilje, så det den laster, telles ikke.
  // Feil knyttes til rammen de kommer fra: testrammen og rammene inni den.
  let hovedramme = null, aktiv = null;
  const rammer = new Set(), kontekster = new Map(), nettleserfeil = {};
  const notér = (tekst) => { if (aktiv) (nettleserfeil[aktiv] ||= []).push(tekst.slice(0, 300)); };
  const kort = u => (u || '').replace(/^https?:\/\/[^/]+/, '');
  nl.lytt(d => {
    if (d.sessionId !== sessionId) return;
    const p = d.params;
    if (d.method === 'Page.frameNavigated') {
      if (!p.frame.parentId) hovedramme = p.frame.id;
      else if (p.frame.parentId === hovedramme) {
        const u = new URL(p.frame.url, 'http://x').pathname;
        const m = /^\/spill\/([^/]+)\//.exec(u);
        aktiv = m ? m[1] : u.startsWith('/prototype/ui/') ? 'prototype' : null;
        rammer.clear(); if (aktiv) rammer.add(p.frame.id);
      }
    }
    if (d.method === 'Page.frameAttached' && rammer.has(p.parentFrameId)) rammer.add(p.frameId);
    if (d.method === 'Runtime.executionContextCreated') kontekster.set(p.context.id, p.context.auxData && p.context.auxData.frameId);
    if (d.method === 'Runtime.exceptionThrown') {
      const e = p.exceptionDetails;
      if (rammer.has(kontekster.get(e.executionContextId))) notér('Feil: ' + ((e.exception && e.exception.description) || e.text).split('\n')[0] + (e.url ? ' (' + kort(e.url) + ')' : ''));
    }
    if (d.method === 'Log.entryAdded' && p.entry.level === 'error' && p.entry.source !== 'network') notér('Logg: ' + p.entry.text + (p.entry.url ? ' (' + kort(p.entry.url) + ')' : ''));
    if (d.method === 'Network.responseReceived' && p.response.status >= 400 && rammer.has(p.frameId)) notér(p.response.status + ' ' + kort(p.response.url));
  });
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(m => s(m)));
  // Alle spillmapper sendes til testsiden. Spill som ikke står i SPILL, røyktestes med standardstarten #startBtn,
  // så et nytt spill får røyktest uten endring i test/. Bare trygge mappenavn sendes.
  const MAPPER = fs.readdirSync(path.join(ROT, 'spill'), { withFileTypes: true })
    .filter(d => d.isDirectory() && /^[a-z0-9-]+$/.test(d.name) && fs.existsSync(path.join(ROT, 'spill', d.name, 'index.html'))).map(d => d.name);
  await s('Page.navigate', { url: `http://127.0.0.1:${port}/test/?auto${SUITER ? '&suiter=' + SUITER : ''}&spill=${MAPPER.join(',')}` });

  let res = null; const t0 = Date.now();
  while (!res && Date.now() - t0 < MAKS_MS) {
    await new Promise(r => setTimeout(r, 1000));
    try { const v = await s('Runtime.evaluate', { expression: 'JSON.stringify(window.EVNTestResultat || null)', returnByValue: true }); res = JSON.parse(v.result.value); } catch {}
  }
  await nl.lukk(); srv.close();
  if (!res) { console.error('Testsiden ble ikke ferdig innen ' + MAKS_MS / 60000 + ' minutter.'); process.exit(2); }

  const tester = res.tester;
  for (const [spill, liste] of Object.entries(nettleserfeil)) {
    const suite = spill === 'prototype' ? 'ui' : 'royk';
    tester.push({ suite, spill, id: 'K1-nettleser', krav: 'K1', navn: 'Ingen feil, CSP-brudd eller manglende filer sett av nettleseren', status: res.ikkeGjeldende[suite] ? 'varsel' : 'feil', info: [...new Set(liste)].slice(0, 5).join(' | ') });
  }
  for (const spill of res.spill) {
    if (res.suiter.royk && !nettleserfeil[spill]) tester.push({ suite: 'royk', spill, id: 'K1-nettleser', krav: 'K1', navn: 'Ingen feil, CSP-brudd eller manglende filer sett av nettleseren', status: 'ok', info: '' });
  }

  // Suiter som mangler: «ikke innført» hvis filen heller ikke finnes på base, ellers feil.
  const harBase = git('rev-parse', '--verify', '--quiet', BASE + '^{commit}') !== null;
  for (const x of tester.filter(t => t.status === 'mangler')) {
    const fil = res.suiter[x.suite].fil;
    if (!harBase) { x.status = 'feil'; x.info = `${fil} mangler, og basen ${BASE} finnes ikke, så det kan ikke avgjøres om testen er obligatorisk. Oppgi riktig --base.`; }
    else if (git('cat-file', '-e', BASE + ':' + fil) !== null) { x.status = 'feil'; x.info = `Obligatorisk test mangler: ${fil} finnes på ${BASE}, men ikke her`; }
    else { x.status = 'ikke innført'; x.info = `${fil} finnes verken her eller på ${BASE}`; }
  }
  // Spillmapper uten røyktest
  if (res.suiter.royk) for (const d of fs.readdirSync(path.join(ROT, 'spill'), { withFileTypes: true }).filter(d => d.isDirectory() && fs.existsSync(path.join(ROT, 'spill', d.name, 'index.html'))))
    if (!res.spill.includes(d.name)) tester.push({ suite: 'royk', spill: d.name, id: 'F1-dekning', krav: 'F1', navn: 'Spillet har røyktest', status: 'feil', info: `spill/${d.name}/ mangler i SPILL i test/index.html` });
  const delvis = res.alleSuiter.filter(n => !res.suiter[n]);

  // Testkvittering: bare stabile opplysninger, så den kan sammenlignes mellom PC og Actions.
  // commit = full SHA, tester = git-hash for test/ på commiten, arbeidstre = rent eller endret, og resultatet per suite.
  const commit = git('rev-parse', 'HEAD') || 'ukjent';
  const endret = git('status', '--porcelain');
  const testversjon = (git('rev-parse', 'HEAD:test') || 'ukjent').slice(0, 12);
  const suiter = {};
  for (const n of res.alleSuiter) {
    const rader = tester.filter(t => t.suite === n), har = st => rader.some(t => t.status === st);
    suiter[n] = !res.suiter[n] ? 'ikke-kjort' : har('feil') ? 'feil' : har('ikke innført') ? 'ikke-innfort' : har('varsel') ? 'varsel' : 'ok';
  }
  const kvittering = ['evn1', 'commit=' + commit, 'tester=' + testversjon, 'arbeidstre=' + (endret ? 'endret' : 'rent'), ...res.alleSuiter.map(n => n + '=' + suiter[n])].join(' ');

  const telle = st => tester.filter(t => t.status === st).length;
  const feil = telle('feil');
  const ut = [`# EVN Testsuite`, '', `Commit: ${commit}${endret ? ' (med endringer som ikke er committet)' : ''}  `, `Base for obligatoriske tester: ${harBase ? BASE : 'ikke funnet'}  `, `Nettleser: ${path.basename(bin)}  `,
    `Testkvittering: ${kvittering}`, ...(delvis.length ? [`(Delkjøring uten ${delvis.join(', ')}. Gjelder ikke for QA.)`] : []), '',
    `Resultat: ${telle('ok')} ok, ${feil} feil, ${telle('varsel')} varsel, ${telle('kjent')} kjent, ${telle('rettet')} rettet, ${telle('ikke innført')} ikke innført`, '',
    '| Suite | Spill | Krav | Kontroll | Resultat | Detaljer |', '|---|---|---|---|---|---|',
    ...tester.map(t => `| ${t.suite} | ${t.spill} | ${t.krav} | ${t.navn} | ${t.status.toUpperCase()} | ${String(t.info).replace(/\|/g, '/').replace(/\n/g, ' ')} |`)];
  console.log(ut.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, ut.join('\n') + '\n');
  // Merknader som vises på kontrollen i GitHub
  if (process.env.GITHUB_ACTIONS === 'true') {
    for (const t of tester.filter(t => t.status === 'feil' || t.status === 'varsel'))
      console.log(`::${t.status === 'feil' ? 'error' : 'warning'} title=${t.suite}/${t.spill}::${t.navn}${t.info ? ' – ' + String(t.info).replace(/\n/g, ' ') : ''}`);
    console.log(`::notice title=Testkvittering::${kvittering}`);
  }
  const json = arg('json');
  if (json) fs.writeFileSync(json, JSON.stringify({ format: 'evn1', commit, testversjon, arbeidstre: endret ? 'endret' : 'rent', suiter, radgivende: Object.keys(res.ikkeGjeldende || {}),
    base: harBase ? BASE : null, nettleser: path.basename(bin), kvittering, tester }, null, 2));
  process.exit(feil ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
