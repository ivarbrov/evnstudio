#!/usr/bin/env node
/*
 * EVN Testsuite – kjører test/index.html i Chrome eller Edge uten skjerm.
 * Ingen avhengigheter: bare Node 22+ og en nettleser som allerede er installert.
 *
 *   node test/kjor.mjs [--base origin/main] [--suiter statisk,royk] [--json fil.json] [--nettleser sti]
 *
 * Spillene finnes automatisk: hver mappe spill/<id>/ med index.html testes (se test/spilloppsett.mjs).
 * Testsiden får listen fra /__evn/spill.json, som bare denne serveren lager.
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
import { lesOppsett, OPPSETTFIL, SPILL_ID } from './spilloppsett.mjs';

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

// ---- Spillene i repoet: hver mappe spill/<id>/ med index.html, med eventuelt eget oppsett ----
function finnSpill() {
  const spill = [], feil = [];
  const mappe = path.join(ROT, 'spill');
  const mapper = fs.existsSync(mappe) ? fs.readdirSync(mappe, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort() : [];
  for (const id of mapper) {
    if (!fs.existsSync(path.join(mappe, id, 'index.html'))) continue;
    if (!SPILL_ID.test(id)) { feil.push({ id, info: `Mappenavnet spill/${id}/ er ikke gyldig (små bokstaver, tall og -)` }); continue; }
    const fil = path.join(mappe, id, OPPSETTFIL);
    if (!fs.existsSync(fil)) { spill.push({ id, oppsett: null }); continue; }
    const { oppsett, feil: f } = lesOppsett(fs.readFileSync(fil, 'utf8'));
    if (f.length) feil.push({ id, info: `spill/${id}/${OPPSETTFIL}: ${f.join('; ')}` });
    spill.push({ id, oppsett, ugyldig: f.length > 0 });
  }
  return { spill, feil };
}

// ---- Statisk server for repoet (som GitHub Pages: mappe gir index.html) ----
function server(funnet) {
  return new Promise(r => {
    const s = http.createServer((req, res) => {
      if (funnet && new URL(req.url, 'http://x').pathname === '/__evn/spill.json') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(funnet));
      }
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
  return { send, lytt: l => { lyttere.push(l); return () => { const i = lyttere.indexOf(l); if (i >= 0) lyttere.splice(i, 1); }; }, lukk };
}

// ---- Røyktest: start, pause, fortsett, manglende filer og feil (F1, K1, U1) ----
// Hvert spill kjøres i en egen fane på en egen port (egen opprinnelse, også forskjellig fra de andre spillene),
// aldri inne i testsiden. Kontrollene kjøres i en isolert verden: spillkoden deler DOM med dem, men ser ikke
// variablene deres og kan ikke nå testsiden eller resultatet. Feil, CSP-brudd og manglende filer leses av
// nettleseren (CDP). Ufangede feil fanges også av debuggeren, så spillet ikke kan skjule dem med preventDefault().
const ROYK_HJELP = `globalThis.__evn = {
  synlig(e) {
    if (!e || !e.isConnected) return false;
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden]');
  }
}; true`;
async function roykSpill(nl, opprinnelse, sp) {
  const vent = ms => new Promise(r => setTimeout(r, ms));
  const rader = [], legg = (id, krav, navn, ok, info = '') => rader.push({ suite: 'royk', spill: sp.id, id, krav, navn, ok, info });
  const { targetId } = await nl.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await nl.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => nl.send(m, p, sessionId);
  const unntak = new Set(), logg = [], mangler = [], kort = u => (u || '').replace(/^https?:\/\/[^/]+/, '');
  let lastet = false;
  const av = nl.lytt(d => {
    if (d.sessionId !== sessionId) return;
    const p = d.params;
    if (d.method === 'Page.loadEventFired') lastet = true;
    if (d.method === 'Runtime.exceptionThrown') { const e = p.exceptionDetails; unntak.add(((e.exception && e.exception.description) || e.text).split('\n')[0]); }
    // Debuggeren stopper på alle ufangede unntak og avviste løfter, også når spillet kaller preventDefault(). Fortsett straks.
    if (d.method === 'Debugger.paused') {
      if (p.reason === 'exception' || p.reason === 'promiseRejection') unntak.add(String((p.data && (p.data.description || p.data.value)) || p.reason).split('\n')[0]);
      s('Debugger.resume').catch(() => {});
    }
    if (d.method === 'Log.entryAdded' && p.entry.level === 'error' && p.entry.source !== 'network') logg.push('Logg: ' + p.entry.text + (p.entry.url ? ' (' + kort(p.entry.url) + ')' : ''));
    // /favicon.ico i roten hentes av nettleseren selv når en fane åpnes (ikke i en ramme, som før). Den regnes ikke med.
    if (d.method === 'Network.responseReceived' && p.response.status >= 400 && p.response.url !== opprinnelse + '/favicon.ico') mangler.push(p.response.status + ' ' + kort(p.response.url));
    if (d.method === 'Network.loadingFailed' && p.blockedReason) logg.push('Blokkert (' + p.blockedReason + ')');
  });
  try {
    await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable', 'Debugger.enable'].map(m => s(m)));
    await s('Debugger.setPauseOnExceptions', { state: 'uncaught' });
    await s('Emulation.setDeviceMetricsOverride', { width: 1024, height: 700, deviceScaleFactor: 1, mobile: false });
    await s('Storage.clearDataForOrigin', { origin: opprinnelse, storageTypes: 'all' });
    const { frameId } = await s('Page.navigate', { url: `${opprinnelse}/spill/${sp.id}/` });
    for (let i = 0; i < 200 && !lastet; i++) await vent(100);
    await vent(1000);
    const { executionContextId } = await s('Page.createIsolatedWorld', { frameId, worldName: 'evn-royk' });
    const ev = async uttrykk => {
      const r = await s('Runtime.evaluate', { expression: uttrykk, contextId: executionContextId, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text);
      return r.result.value;
    };
    await ev(ROYK_HJELP);
    const J = JSON.stringify;
    const ver = await ev(`(() => { const v = document.querySelector('.evn-ver'), m = v && /Versjon\\s+(\\d+(?:\\.\\d+){1,3})/.exec(v.textContent); return m ? m[1] : null; })()`);
    legg('U1-versjon', 'U1, K3', 'Startkortet viser «Versjon x.y.z»', !!ver, ver || 'fant ikke .evn-ver med versjon');
    const knapp = await ev(`(() => { const k = document.getElementById(${J(sp.start)}); return { fantes: !!k, synlig: __evn.synlig(k) }; })()`);
    legg('F1-startknapp', 'F1', 'Startknappen finnes og er synlig', knapp.synlig, knapp.fantes ? '' : 'fant ikke #' + sp.start);
    if (knapp.fantes) await ev(`document.getElementById(${J(sp.start)}).click(); true`);
    await vent(500);
    if (sp.etterStart && sp.etterStart.klikk) await ev(`(() => { const e = document.querySelector(${J(sp.etterStart.klikk)}); if (e) e.click(); return true; })()`);
    await vent(1500);
    const borte = await ev(`!__evn.synlig(document.getElementById(${J(sp.start)}))`);
    legg('F1-start', 'F1', 'Spillet starter: startknappen forsvinner', knapp.fantes && borte, knapp.fantes ? '' : 'startknappen fantes ikke');
    const harPause = await ev(`!!(document.getElementById('evnPauseKnapp') && document.getElementById('evnPause'))`);
    if (!harPause) legg('F1-pause', 'F1', 'Pause åpner pausekortet', false, 'fant ikke felles pause (#evnPauseKnapp)');
    else {
      // Spillet kan ha pauset seg selv fordi vinduet mangler fokus
      await ev(`(() => { if (document.getElementById('evnPause').classList.contains('vis')) { const f = document.getElementById('evnPauseFortsett'); if (f) f.click(); } return true; })()`);
      await vent(300);
      await ev(`document.getElementById('evnPauseKnapp').click(); true`);
      await vent(400);
      const pauset = await ev(`document.getElementById('evnPause').classList.contains('vis')`);
      legg('F1-pause', 'F1', 'Pause åpner pausekortet', pauset);
      await ev(`(() => { const f = document.getElementById('evnPauseFortsett'); if (f) f.click(); return true; })()`);
      await vent(400);
      const lukket = await ev(`!document.getElementById('evnPause').classList.contains('vis')`);
      legg('F1-fortsett', 'F1', 'Fortsett lukker pausekortet', pauset && lukket, pauset ? '' : 'pausekortet åpnet seg ikke');
    }
  } catch (e) {
    legg('F1-royk', 'F1', 'Røyktesten kunne fullføres', false, String(e && e.message || e));
  } finally {
    av();
    try { await nl.send('Target.closeTarget', { targetId }); } catch {}
  }
  legg('K1-404', 'K1', 'Ingen filer mangler (status 400 eller høyere)', mangler.length === 0, [...new Set(mangler)].slice(0, 5).join(', '));
  legg('K1-feil', 'K1', 'Ingen ufangede feil fra innlasting til etter pause', unntak.size === 0, [...unntak].slice(0, 5).join(' | '));
  const alle = [...[...unntak].map(x => 'Feil: ' + x), ...logg, ...mangler];
  legg('K1-nettleser', 'K1', 'Ingen feil, CSP-brudd eller manglende filer sett av nettleseren', alle.length === 0, [...new Set(alle)].slice(0, 5).join(' | ').slice(0, 900));
  return rader;
}

async function main() {
  if (typeof WebSocket === 'undefined') { console.error('Krever Node 22 eller nyere (innebygd WebSocket).'); process.exit(2); }
  const bin = finnNettleser();
  if (!bin) { console.error('Fant ingen Chrome eller Edge. Oppgi --nettleser eller CHROME_PATH.'); process.exit(2); }
  const funnet = finnSpill();
  const srv = await server(funnet);
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
  await s('Page.navigate', { url: `http://127.0.0.1:${port}/test/?auto${SUITER ? '&suiter=' + SUITER : ''}` });

  let res = null; const t0 = Date.now();
  while (!res && Date.now() - t0 < MAKS_MS) {
    await new Promise(r => setTimeout(r, 1000));
    try { const v = await s('Runtime.evaluate', { expression: 'JSON.stringify(window.EVNTestResultat || null)', returnByValue: true }); res = JSON.parse(v.result.value); } catch {}
  }
  if (!res) { await nl.lukk(); srv.close(); console.error('Testsiden ble ikke ferdig innen ' + MAKS_MS / 60000 + ' minutter.'); process.exit(2); }

  const tester = res.tester;
  // Røyktesten kjøres her, ikke i testsiden, så spillkoden aldri deler opprinnelse med testsiden eller resultatet.
  const roykTestet = new Set();
  if (res.suiter.royk) for (const sp of res.spillOppsett) {
    // Egen server og port for hvert spill: et spill kan ikke påvirke de andre (for eksempel med en service worker)
    const spillSrv = await server(null);
    const rader = await roykSpill(nl, 'http://127.0.0.1:' + spillSrv.address().port, sp);
    spillSrv.close();
    for (const r of rader) {
      let status = r.ok ? 'ok' : (res.ikkeGjeldende.royk ? 'varsel' : 'feil'), info = r.info;
      const kjent = (res.kjente || {})[r.spill + '/' + r.id];
      if (kjent) { status = r.ok ? 'rettet' : 'kjent'; info = (info ? info + '. ' : '') + kjent; }
      tester.push({ suite: r.suite, spill: r.spill, id: r.id, krav: r.krav, navn: r.navn, status, info });
    }
    roykTestet.add(sp.id);
  }
  await nl.lukk(); srv.close();
  // Feil i prototypen som bare nettleseren ser (suiten ui)
  for (const [spill, liste] of Object.entries(nettleserfeil)) {
    const suite = spill === 'prototype' ? 'ui' : 'statisk';
    tester.push({ suite, spill, id: 'K1-nettleser', krav: 'K1', navn: 'Ingen feil, CSP-brudd eller manglende filer sett av nettleseren', status: res.ikkeGjeldende[suite] ? 'varsel' : 'feil', info: [...new Set(liste)].slice(0, 5).join(' | ') });
  }

  // Suiter som mangler: «ikke innført» hvis filen heller ikke finnes på base, ellers feil.
  const harBase = git('rev-parse', '--verify', '--quiet', BASE + '^{commit}') !== null;
  for (const x of tester.filter(t => t.status === 'mangler')) {
    const fil = res.suiter[x.suite].fil;
    if (!harBase) { x.status = 'feil'; x.info = `${fil} mangler, og basen ${BASE} finnes ikke, så det kan ikke avgjøres om testen er obligatorisk. Oppgi riktig --base.`; }
    else if (git('cat-file', '-e', BASE + ':' + fil) !== null) { x.status = 'feil'; x.info = `Obligatorisk test mangler: ${fil} finnes på ${BASE}, men ikke her`; }
    else { x.status = 'ikke innført'; x.info = `${fil} finnes verken her eller på ${BASE}`; }
  }
  // Ugyldig oppsett eller mappenavn, og spill som ikke ble testet. Gjelder alle spill uansett hvilke suiter som kjøres.
  for (const f of funnet.feil) tester.push({ suite: 'statisk', spill: f.id, id: 'F1-oppsett', krav: 'F1', navn: 'Spillets testoppsett er gyldig', status: 'feil', info: f.info });
  for (const sp of funnet.spill)
    if (res.suiter.royk && !roykTestet.has(sp.id)) tester.push({ suite: 'royk', spill: sp.id, id: 'F1-dekning', krav: 'F1', navn: 'Spillet har røyktest', status: 'feil', info: `spill/${sp.id}/ ble ikke testet` });
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
  if (json) fs.writeFileSync(json, JSON.stringify({ format: 'evn1', commit, testversjon, arbeidstre: endret ? 'endret' : 'rent', suiter, spill: res.spill, radgivende: Object.keys(res.ikkeGjeldende || {}),
    base: harBase ? BASE : null, nettleser: path.basename(bin), kvittering, tester }, null, 2));
  process.exit(feil ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
