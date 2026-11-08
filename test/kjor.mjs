#!/usr/bin/env node
/*
 * EVN Testsuite – kjører testene i Chrome eller Edge uten skjerm.
 * Ingen avhengigheter: bare Node 22+ og en nettleser som allerede er installert.
 *
 *   node test/kjor.mjs [--base origin/main] [--suiter statisk,royk] [--json fil.json] [--nettleser sti]
 *
 * --base     grenen som avgjør hvilke tester som er obligatoriske. En test er obligatorisk når
 *            filen den tester, finnes på base. Mangler filen her, feiler kjøringen.
 * --spillrot mappen spillene ligger i (standard spill). Brukes bare av de negative testene i test/sikkerhet/.
 * Nettleser: --nettleser, CHROME_PATH, eller Chrome/Edge på vanlige steder.
 *
 * Spillene finnes automatisk: alle mapper i spill/ med index.html testes (se test/spillregister.mjs).
 *
 * Isolering (spillkode kan ikke påvirke testresultatet):
 * - Suitene på testsiden (statisk, statistikk, ui, ecoins) kjører hver i sin egen fane på http://127.0.0.1:<port>/test/.
 *   Navigerer fanen bort fra testsiden, avvises resultatet. Resultatet hentes direkte av nettleseren (returnByValue).
 * - Røyktesten kjører hvert spill i sin egen fane med eget opphav, http://<id>.localhost:<port>/spill/<id>/.
 *   Spillet deler ikke opphav med testsiden eller andre spill. Målingene gjøres fra en isolert JS-verden
 *   (Page.createIsolatedWorld), så spillet kan ikke endre funksjonene som måler. Feil, manglende filer og
 *   navigasjon bort fra spillet registreres av nettleseren (CDP), ikke av spillet selv.
 * - Suiten «sikkerhet» kjører test/sikkerhet/manipulering.test.mjs: negative tester for publiseringssjekken og et
 *   juksespill som skal bli avvist.
 *
 * Avslutter med kode 1 hvis en kontroll feiler eller en obligatorisk test mangler.
 * Skriver en testkvittering (commit, testversjon og resultat per suite) som EVN Game QA tar med i rapporten,
 * og som publiseringssjekken sammenligner med kjøringen i GitHub Actions.
 */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SPILL_ID, FILNAVN, lesRegistrering } from './spillregister.mjs';

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const BASE = arg('base', process.env.EVN_BASE || 'origin/main');
const SUITER = arg('suiter', '');
const SPILLROT = arg('spillrot', 'spill');
if (!/^[a-z0-9_-]+(\/[a-z0-9_-]+)*$/.test(SPILLROT)) { console.error('Ugyldig --spillrot.'); process.exit(2); }
const MAKS_MS = 15 * 60 * 1000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.wav': 'audio/wav', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8' };

const git = (...a) => { try { return execFileSync('git', ['-c', 'core.quotePath=false', ...a], { cwd: ROT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const vent = ms => new Promise(r => setTimeout(r, ms));

// ---- Statisk server for repoet (som GitHub Pages: mappe gir index.html) ----
function server() {
  return new Promise(r => {
    const s = http.createServer((req, res) => {
      let f = path.join(ROT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!f.startsWith(ROT)) { res.writeHead(403); return res.end(); }
      try {
        if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
        const data = fs.readFileSync(f);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
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
    // Hvert spill får eget opphav (<id>.localhost). Alle slike navn går til den lokale serveren.
    '--host-resolver-rules=MAP *.localhost 127.0.0.1',
    // GitHubs Linux-maskiner tillater ikke Chromes egen sandkasse. Maskinen er engangs og uten hemmeligheter.
    ...(process.env.CI === 'true' && process.platform === 'linux' ? ['--no-sandbox'] : []), 'about:blank'],
    { stdio: 'ignore' });
  const fil = path.join(profil, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(fil); i++) await vent(200);
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
    for (let i = 0; i < 20; i++) { try { fs.rmSync(profil, { recursive: true, force: true }); return; } catch { await vent(250); } }
  };
  // Ny fane med egen økt. lytt(fn) får bare hendelser fra denne fanen.
  const fane = async () => {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    const egne = [];
    lyttere.push(d => { if (d.sessionId === sessionId) egne.forEach(l => l(d.method, d.params)); });
    await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(m => s(m)));
    return { s, lytt: l => egne.push(l), lukk: () => send('Target.closeTarget', { targetId }).catch(() => {}) };
  };
  return { fane, lukk };
}

const kortUrl = u => (u || '').replace(/^https?:\/\/[^/]+/, '');
// Et spill som henger (for eksempel en uendelig løkke), skal gi feil, ikke stoppe hele kjøringen.
const medFrist = (p, ms, tekst) => Promise.race([p, new Promise((_, a) => setTimeout(() => a(new Error(tekst)), ms))]);

// ---- En suite på testsiden, i egen fane ----
async function kjorTestside(nl, port, suite, spill) {
  const f = await nl.fane();
  // Feil som siden selv ikke ser, fra prototypen (ui). Statistikktesten lager feil med vilje, så de telles ikke.
  let hovedramme = null, loader = null, bort = null, iPrototype = false;
  const rammer = new Set(), kontekster = new Map(), prototypefeil = [];
  const noter = t => { if (iPrototype) prototypefeil.push(t.slice(0, 300)); };
  f.lytt((m, p) => {
    if (m === 'Page.frameNavigated') {
      if (!p.frame.parentId) { hovedramme = p.frame.id; if (loader && p.frame.loaderId !== loader) bort = p.frame.url; }
      else if (p.frame.parentId === hovedramme) { iPrototype = new URL(p.frame.url, 'http://x').pathname.startsWith('/prototype/ui/'); rammer.clear(); if (iPrototype) rammer.add(p.frame.id); }
    }
    if (m === 'Page.frameAttached' && rammer.has(p.parentFrameId)) rammer.add(p.frameId);
    if (m === 'Runtime.executionContextCreated') kontekster.set(p.context.id, p.context.auxData && p.context.auxData.frameId);
    if (m === 'Runtime.exceptionThrown' && rammer.has(kontekster.get(p.exceptionDetails.executionContextId))) { const e = p.exceptionDetails; noter('Feil: ' + ((e.exception && e.exception.description) || e.text).split('\n')[0]); }
    if (m === 'Log.entryAdded' && p.entry.level === 'error' && p.entry.source !== 'network') noter('Logg: ' + p.entry.text + (p.entry.url ? ' (' + kortUrl(p.entry.url) + ')' : ''));
    if (m === 'Network.responseReceived' && p.response.status >= 400 && rammer.has(p.frameId)) noter(p.response.status + ' ' + kortUrl(p.response.url));
  });
  const nav = await f.s('Page.navigate', { url: `http://127.0.0.1:${port}/test/?auto&suiter=${suite}&spill=${spill.join(',')}&spillrot=${SPILLROT}` });
  loader = nav.loaderId;
  let res = null; const t0 = Date.now();
  while (!res && !bort && Date.now() - t0 < MAKS_MS) {
    await vent(500);
    // Verdien hentes direkte av nettleseren (returnByValue), ikke via sidens egen JSON.
    try { const v = await f.s('Runtime.evaluate', { expression: 'location.pathname === "/test/" ? window.EVNTestResultat : null', returnByValue: true }); res = v.result.value || null; } catch {}
  }
  if (bort) res = null;
  await f.lukk();
  return { res, bort, tidsavbrudd: !res && !bort, prototypefeil };
}

// ---- Røyktest av ett spill: egen fane, eget opphav, målinger fra en isolert JS-verden ----
const ISOLERT = `(() => {
  const synlig = e => { if (!e || !e.isConnected) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden]'); };
  const id = x => document.getElementById(x);
  return { synlig, id };
})()`;
async function royk(nl, port, spillId, konfig) {
  const rader = [];
  const legg = (id, krav, navn, ok, info) => rader.push({ suite: 'royk', spill: spillId, id, krav, navn, status: ok ? 'ok' : 'feil', info: info || '' });
  const f = await nl.fane();
  const unntak = [], logg = [], mangler = [];
  let hovedramme = null, loader = null, bort = null, lastet = false;
  f.lytt((m, p) => {
    if (m === 'Page.frameNavigated' && !p.frame.parentId) { hovedramme = p.frame.id; if (loader && p.frame.loaderId !== loader) bort = p.frame.url; }
    if (m === 'Page.loadEventFired') lastet = true;
    if (m === 'Runtime.exceptionThrown') { const e = p.exceptionDetails; unntak.push(((e.exception && e.exception.description) || e.text).split('\n')[0].slice(0, 200) + (e.url ? ' (' + kortUrl(e.url) + ')' : '')); }
    if (m === 'Log.entryAdded' && p.entry.level === 'error' && p.entry.source !== 'network') logg.push(('Logg: ' + p.entry.text + (p.entry.url ? ' (' + kortUrl(p.entry.url) + ')' : '')).slice(0, 300));
    // Nettleseren ber selv om /favicon.ico for en fane. Det er ikke en fil spillet mangler.
    const auto = p && p.response && p.type === 'Other' && new URL(p.response.url).pathname === '/favicon.ico';
    if (m === 'Network.responseReceived' && p.response.status >= 400 && !auto) mangler.push(p.response.status + ' ' + kortUrl(p.response.url));
  });
  try {
    await f.s('Emulation.setDeviceMetricsOverride', { width: 1024, height: 700, deviceScaleFactor: 1, mobile: false });
    await f.s('Emulation.setFocusEmulationEnabled', { enabled: true });
    const nav = await medFrist(f.s('Page.navigate', { url: `http://${spillId}.localhost:${port}/${SPILLROT}/${spillId}/` }), 30000, 'spillet lastet ikke innen 30 sekunder');
    if (nav.errorText) throw new Error('kunne ikke åpne spillet: ' + nav.errorText);
    loader = nav.loaderId;
    for (let i = 0; i < 100 && !lastet; i++) await vent(200);
    await vent(1000);
    const sjekkBort = () => { if (bort) throw new Error('spillet navigerte bort fra ' + SPILLROT + '/' + spillId + '/ under testen (til ' + kortUrl(bort) + ')'); };
    sjekkBort();
    const { frameTree } = await f.s('Page.getFrameTree');
    const { executionContextId } = await f.s('Page.createIsolatedWorld', { frameId: frameTree.frame.id, worldName: 'evn-royk' });
    const ev = async uttrykk => {
      sjekkBort();
      const r = await medFrist(f.s('Runtime.evaluate', { expression: `(() => { const h = ${ISOLERT}; return (${uttrykk})(h); })()`, contextId: executionContextId, returnByValue: true, awaitPromise: true }), 20000, 'spillet svarte ikke innen 20 sekunder');
      if (r.exceptionDetails) throw new Error('måling feilet: ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
      return r.result.value;
    };
    const versjon = await ev(`() => { const v = document.querySelector('.evn-ver'), m = v && /Versjon\\s+(\\d+(?:\\.\\d+){1,3})/.exec(v.textContent); return m ? m[1] : null; }`);
    legg('U1-versjon', 'U1, K3', 'Startkortet viser «Versjon x.y.z»', !!versjon, versjon || 'fant ikke .evn-ver med versjon');
    const start = JSON.stringify(konfig.start);
    const knapp = await ev(`h => ({ finnes: !!h.id(${start}), synlig: h.synlig(h.id(${start})) })`);
    legg('F1-startknapp', 'F1', 'Startknappen finnes og er synlig', knapp.synlig, knapp.finnes ? '' : 'fant ikke #' + konfig.start);
    if (knapp.finnes) await ev(`h => { h.id(${start}).click(); }`);
    await vent(500);
    for (const steg of konfig.etterStart) { await ev(`() => { const e = document.querySelector(${JSON.stringify(steg.klikk)}); if (e) e.click(); }`); await vent(300); }
    await vent(1500);
    legg('F1-start', 'F1', 'Spillet starter: startknappen forsvinner', knapp.finnes && !(await ev(`h => h.synlig(h.id(${start}))`)), knapp.finnes ? '' : 'startknappen fantes ikke');
    const harPause = await ev(`h => !!(h.id('evnPauseKnapp') && h.id('evnPause'))`);
    if (!harPause) { legg('F1-pause', 'F1', 'Pause åpner pausekortet', false, 'fant ikke felles pause (#evnPauseKnapp)'); legg('F1-fortsett', 'F1', 'Fortsett lukker pausekortet', false, 'fant ikke felles pause'); }
    else {
      // Spillet kan ha pauset seg selv fordi vinduet mangler fokus
      await ev(`h => { if (h.id('evnPause').classList.contains('vis') && h.id('evnPauseFortsett')) h.id('evnPauseFortsett').click(); }`);
      await vent(300);
      await ev(`h => { h.id('evnPauseKnapp').click(); }`);
      await vent(400);
      const pauset = await ev(`h => h.id('evnPause').classList.contains('vis')`);
      legg('F1-pause', 'F1', 'Pause åpner pausekortet', pauset);
      await ev(`h => { if (h.id('evnPauseFortsett')) h.id('evnPauseFortsett').click(); }`);
      await vent(400);
      legg('F1-fortsett', 'F1', 'Fortsett lukker pausekortet', pauset && !(await ev(`h => h.id('evnPause').classList.contains('vis')`)), pauset ? '' : 'pausekortet åpnet seg ikke');
    }
    sjekkBort();
  } catch (e) {
    legg('F1-royk', 'F1', 'Røyktesten kunne fullføres', false, String(e && e.message || e));
  }
  await f.lukk();
  legg('K1-404', 'K1', 'Ingen filer mangler (status 400 eller høyere)', mangler.length === 0, [...new Set(mangler)].slice(0, 5).join(', '));
  legg('K1-feil', 'K1', 'Ingen ufangede feil etter innlasting og under start og pause', unntak.length === 0, [...new Set(unntak)].slice(0, 5).join(' | '));
  const alle = [...unntak.map(x => 'Feil: ' + x), ...logg, ...mangler];
  legg('K1-nettleser', 'K1', 'Ingen feil, CSP-brudd eller manglende filer sett av nettleseren', alle.length === 0, [...new Set(alle)].slice(0, 5).join(' | '));
  return rader;
}

async function main() {
  if (typeof WebSocket === 'undefined') { console.error('Krever Node 22 eller nyere (innebygd WebSocket).'); process.exit(2); }
  const bin = finnNettleser();
  if (!bin) { console.error('Fant ingen Chrome eller Edge. Oppgi --nettleser eller CHROME_PATH.'); process.exit(2); }
  const harBase = git('rev-parse', '--verify', '--quiet', BASE + '^{commit}') !== null;
  const tester = [], suiter = {};
  let ikkeGjeldende = {};

  // Suitene står i test/index.html. royk kjøres her, sikkerhet i Node; resten på testsiden.
  const testside = fs.readFileSync(path.join(ROT, 'test', 'index.html'), 'utf8');
  const sideSuiter = [...testside.matchAll(/\{ navn: '([a-z]+)', fil: (?:null|'([^']+)')/g)].map(m => ({ navn: m[1], fil: m[2] || null }));
  const alleSuiter = [...sideSuiter.map(s => s.navn), 'sikkerhet'];
  const valgte = SUITER.split(',').filter(Boolean);
  const valgt = n => !valgte.length || valgte.includes(n);

  // Spillene: alle mapper i spillroten med index.html. Mappenavn og registrering kontrolleres her (Node), ikke av spillet.
  const spillmappe = path.join(ROT, SPILLROT);
  const mapper = fs.readdirSync(spillmappe, { withFileTypes: true }).filter(d => d.isDirectory() && fs.existsSync(path.join(spillmappe, d.name, 'index.html'))).map(d => d.name).sort();
  const spill = [];
  for (const m of mapper) {
    if (!SPILL_ID.test(m)) { tester.push({ suite: 'royk', spill: m, id: 'F1-dekning', krav: 'F1', navn: 'Spillet har røyktest', status: 'feil', info: `ugyldig mappenavn ${SPILLROT}/${m}/ (små bokstaver, tall og -)` }); continue; }
    const regfil = path.join(spillmappe, m, FILNAVN);
    const r = lesRegistrering(fs.existsSync(regfil) ? fs.readFileSync(regfil, 'utf8') : null);
    if (!r.ok) { tester.push({ suite: 'royk', spill: m, id: 'F1-registrering', krav: 'F1', navn: `Registreringen i ${FILNAVN} er gyldig`, status: 'feil', info: r.feil.join('; ') }); continue; }
    spill.push({ id: m, konfig: r.konfig });
  }
  const spillIder = spill.map(x => x.id);

  const srv = await server();
  const port = srv.address().port;
  const nl = await startNettleser(bin);
  try {
    for (const su of sideSuiter) {
      if (!valgt(su.navn)) continue;
      if (su.navn === 'royk') {
        suiter.royk = { status: 'kjort', fil: null };
        for (const x of spill) tester.push(...await royk(nl, port, x.id, x.konfig));
        continue;
      }
      const r = await kjorTestside(nl, port, su.navn, spillIder);
      if (!r.res) {
        suiter[su.navn] = { status: 'kjort', fil: su.fil };
        tester.push({ suite: su.navn, spill: '–', id: su.navn + '-side', krav: '', navn: 'Testsiden ble ferdig uten å bli navigert bort', status: 'feil', info: r.bort ? 'fanen ble navigert til ' + kortUrl(r.bort) + ', så resultatet er avvist' : 'tidsavbrudd' });
        continue;
      }
      ikkeGjeldende = r.res.ikkeGjeldende || ikkeGjeldende;
      Object.assign(suiter, r.res.suiter);
      tester.push(...r.res.tester.filter(t => t.suite === su.navn));
      if (su.navn === 'ui' && r.res.suiter.ui && r.res.suiter.ui.status === 'kjort')
        tester.push({ suite: 'ui', spill: 'prototype', id: 'K1-nettleser', krav: 'K1', navn: 'Ingen feil, CSP-brudd eller manglende filer sett av nettleseren', status: !r.prototypefeil.length ? 'ok' : ikkeGjeldende.ui ? 'varsel' : 'feil', info: [...new Set(r.prototypefeil)].slice(0, 5).join(' | ') });
    }
  } finally { await nl.lukk(); srv.close(); }

  // Suiter som mangler: «ikke innført» hvis filen heller ikke finnes på base, ellers feil.
  for (const x of tester.filter(t => t.status === 'mangler')) {
    const fil = suiter[x.suite].fil;
    if (!harBase) { x.status = 'feil'; x.info = `${fil} mangler, og basen ${BASE} finnes ikke, så det kan ikke avgjøres om testen er obligatorisk. Oppgi riktig --base.`; }
    else if (git('cat-file', '-e', BASE + ':' + fil) !== null) { x.status = 'feil'; x.info = `Obligatorisk test mangler: ${fil} finnes på ${BASE}, men ikke her`; }
    else { x.status = 'ikke innført'; x.info = `${fil} finnes verken her eller på ${BASE}`; }
  }

  // Suiten «sikkerhet»: negative tester for publiseringssjekken og testoppsettet. Kjøres i Node.
  const SIKKERHET = 'test/sikkerhet/manipulering.test.mjs';
  if (valgt('sikkerhet')) {
    if (!fs.existsSync(path.join(ROT, SIKKERHET))) {
      suiter.sikkerhet = { status: 'mangler', fil: SIKKERHET };
      const paBase = harBase && git('cat-file', '-e', BASE + ':' + SIKKERHET) !== null;
      tester.push({ suite: 'sikkerhet', spill: '–', id: 'suite', krav: '', navn: 'Suiten kunne ikke kjøres', status: paBase || !harBase ? 'feil' : 'ikke innført', info: paBase ? `Obligatorisk test mangler: ${SIKKERHET} finnes på ${BASE}, men ikke her` : `${SIKKERHET} finnes ikke her` });
    } else {
      suiter.sikkerhet = { status: 'kjort', fil: SIKKERHET };
      const extra = arg('nettleser') ? ['--nettleser', arg('nettleser')] : [];
      const k = spawnSync(process.execPath, [path.join(ROT, SIKKERHET), '--json', ...extra], { cwd: ROT, encoding: 'utf8', maxBuffer: 16 << 20, timeout: 15 * 60 * 1000 });
      let r = null; try { r = JSON.parse(k.stdout); } catch {}
      if (!r || !Array.isArray(r.tester) || !r.tester.length) tester.push({ suite: 'sikkerhet', spill: '–', id: 'sikkerhet-kjoring', krav: '', navn: 'De negative testene ble ferdige', status: 'feil', info: ((k.stderr || '') + (k.error ? ' ' + k.error.message : '')).trim().slice(0, 300) });
      else for (const x of r.tester) tester.push({ suite: 'sikkerhet', spill: '–', id: x.id, krav: '', navn: x.navn, status: x.ok ? 'ok' : 'feil', info: x.info || '' });
    }
  }
  const delvis = alleSuiter.filter(n => !suiter[n]);

  // Testkvittering: bare stabile opplysninger, så den kan sammenlignes mellom PC og Actions.
  // commit = full SHA, tester = git-hash for test/ på commiten, arbeidstre = rent eller endret, og resultatet per suite.
  const commit = git('rev-parse', 'HEAD') || 'ukjent';
  const endret = git('status', '--porcelain');
  const testversjon = (git('rev-parse', 'HEAD:test') || 'ukjent').slice(0, 12);
  const status = {};
  for (const n of alleSuiter) {
    const rader = tester.filter(t => t.suite === n), har = st => rader.some(t => t.status === st);
    status[n] = !suiter[n] ? 'ikke-kjort' : har('feil') ? 'feil' : har('ikke innført') ? 'ikke-innfort' : har('varsel') ? 'varsel' : 'ok';
  }
  const kvittering = ['evn1', 'commit=' + commit, 'tester=' + testversjon, 'arbeidstre=' + (endret ? 'endret' : 'rent'), ...alleSuiter.map(n => n + '=' + status[n])].join(' ');

  const telle = st => tester.filter(t => t.status === st).length;
  const feil = telle('feil');
  const ut = [`# EVN Testsuite`, '', `Commit: ${commit}${endret ? ' (med endringer som ikke er committet)' : ''}  `, `Base for obligatoriske tester: ${harBase ? BASE : 'ikke funnet'}  `, `Nettleser: ${path.basename(bin)}  `,
    ...(SPILLROT !== 'spill' ? [`Spillrot: ${SPILLROT} (bare for negative tester)  `] : []),
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
  if (json) fs.writeFileSync(json, JSON.stringify({ format: 'evn1', commit, testversjon, arbeidstre: endret ? 'endret' : 'rent', suiter: status, spill: suiter.royk ? spillIder : [], radgivende: Object.keys(ikkeGjeldende),
    base: harBase ? BASE : null, nettleser: path.basename(bin), kvittering, tester }, null, 2));
  process.exit(feil ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
