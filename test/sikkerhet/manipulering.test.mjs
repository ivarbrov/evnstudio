#!/usr/bin/env node
/*
 * EVN Sikkerhetstest – negative tester for publiseringssjekken. Ingen avhengigheter, bare Node og git.
 *
 *   node test/sikkerhet/manipulering.test.mjs [--json]
 *
 * Viser at publiseringssjekken (test/publiseringssjekk.mjs) avviser forsøk på å endre testoppsettet,
 * og at et nytt spill likevel kan registreres uten å endre test/.
 *
 * Slik virker den:
 * - Lager et midlertidig git-repo som deler objektene med dette repoet (endrer ingenting her).
 * - «basis» er HEAD og spiller rollen som main.
 * - Hvert scenario er en commit laget med git-kommandoer (uten utsjekk) og et testresultat slik Actions ville laget det.
 *   Manipulerte scenarier endrer commiten eller testresultatet.
 * - Publiseringssjekken kjøres slik den ligger på disk, med --base basis og --ref <scenario>, og meldingene leses.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAKREVDE_KONTROLLER, SPILL_ID } from '../spillregister.mjs';

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const JSON_UT = process.argv.includes('--json');
const kjor = (cwd, args, opts = {}) => execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 << 20, ...opts }).trim();
const prov = (cwd, args) => { try { return kjor(cwd, args); } catch { return null; } };

// ---- Midlertidig repo som deler objektene med dette ----
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'evn-sikkerhet-'));
const IDX = path.join(TMP, 'indeks');
const ENV = { ...process.env, GIT_INDEX_FILE: IDX, GIT_AUTHOR_NAME: 'EVN sikkerhetstest', GIT_AUTHOR_EMAIL: 'test@evnstudio.invalid',
  GIT_COMMITTER_NAME: 'EVN sikkerhetstest', GIT_COMMITTER_EMAIL: 'test@evnstudio.invalid' };
const BASIS = kjor(ROT, ['rev-parse', 'HEAD']);
kjor(TMP, ['init', '-q']);
fs.writeFileSync(path.join(TMP, '.git', 'objects', 'info', 'alternates'), path.resolve(ROT, kjor(ROT, ['rev-parse', '--git-common-dir']), 'objects') + '\n');
kjor(TMP, ['update-ref', 'refs/heads/basis', BASIS]);
// Kontrollen som testes, slik den ligger på disk (i Actions: samme som commiten).
fs.mkdirSync(path.join(TMP, 'test'));
for (const f of ['publiseringssjekk.mjs', 'spillregister.mjs']) fs.copyFileSync(path.join(ROT, 'test', f), path.join(TMP, 'test', f));

const vis = (rev, fil) => prov(TMP, ['show', rev + ':' + fil]);
const filerI = (rev, mappe) => (prov(TMP, ['ls-tree', '-r', '--name-only', rev, mappe]) || '').split('\n').filter(Boolean);

/** Lager en commit fra basis med endringer: { sti: innhold } eller { sti: null } for å slette. */
function commit(endringer) {
  kjor(TMP, ['read-tree', 'basis'], { env: ENV });
  for (const [fil, innhold] of Object.entries(endringer)) {
    if (innhold === null) kjor(TMP, ['update-index', '--force-remove', fil], { env: ENV });
    else {
      const blob = kjor(TMP, ['hash-object', '-w', '--stdin'], { input: innhold });
      kjor(TMP, ['update-index', '--add', '--cacheinfo', `100644,${blob},${fil}`], { env: ENV });
    }
  }
  const tre = kjor(TMP, ['write-tree'], { env: ENV });
  return kjor(TMP, ['commit-tree', tre, '-p', 'basis', '-m', 'scenario'], { env: ENV });
}

/** Testresultatet Actions ville laget for commiten (alle kontroller ok). */
function arligResultat(sha) {
  const spill = (prov(TMP, ['ls-tree', '-d', '--name-only', sha, 'spill/']) || '').split('\n').filter(Boolean).map(f => f.replace(/^spill\//, ''))
    .filter(id => prov(TMP, ['cat-file', '-e', `${sha}:spill/${id}/index.html`]) !== null && SPILL_ID.test(id)).sort();
  const suiter = {};
  for (const m of (vis(sha, 'test/index.html') || '').matchAll(/\{ navn: '([a-z]+)', fil: (?:null|'([^']+)')/g))
    suiter[m[1]] = m[2] && prov(TMP, ['cat-file', '-e', `${sha}:${m[2]}`]) === null ? 'ikke-innfort' : 'ok';
  suiter.sikkerhet = 'ok';
  const tester = [];
  for (const id of spill) for (const [suite, ider] of Object.entries(PAKREVDE_KONTROLLER)) for (const k of ider) tester.push({ suite, spill: id, id: k, status: 'ok' });
  return { format: 'evn1', commit: sha, testversjon: (prov(TMP, ['rev-parse', sha + ':test']) || '').slice(0, 12), arbeidstre: 'rent', suiter, spill, tester };
}

let nr = 0;
function sjekk(sha, ci) {
  const fil = path.join(TMP, `resultat-${++nr}.json`);
  fs.writeFileSync(fil, JSON.stringify(ci));
  const env = { ...process.env }; delete env.GITHUB_ACTIONS; delete env.GITHUB_STEP_SUMMARY;
  const r = spawnSync(process.execPath, [path.join(TMP, 'test', 'publiseringssjekk.mjs'), '--base', 'basis', '--ref', sha, '--ci-resultat', fil], { cwd: TMP, encoding: 'utf8', env, maxBuffer: 16 << 20 });
  const linjer = (r.stdout || '').split('\n');
  return { kode: r.status, feil: linjer.filter(l => l.startsWith('- FEIL: ')).map(l => l.slice(8)), varsler: linjer.filter(l => l.startsWith('- VARSEL: ')).map(l => l.slice(10)),
    ok: linjer.filter(l => l.startsWith('- OK: ')).map(l => l.slice(6)), stderr: r.stderr || '' };
}

// ---- Scenarier ----
const tester = [];
const TAG = '[testoppsett]';
const nyttSpill = (id, html = '') => `<!doctype html><html lang="no"><head><meta charset="utf-8"><title>${id}</title></head><body><div class="evn-ver">Versjon 0.1.0</div><button id="startBtn">Start</button>${html}</body></html>`;
function forvent(id, navn, sha, ci, { feil = null, varsel = null, ingenFeil = false }) {
  let r, ok, info = '';
  try {
    r = sjekk(sha, ci);
    if (r.kode === 2 || (!r.feil.length && !r.varsler.length && !r.ok.length)) { ok = false; info = 'publiseringssjekken kjørte ikke: ' + r.stderr.slice(0, 200); }
    else if (feil) { const t = r.feil.find(x => feil.test(x)); ok = !!t && r.kode === 1; info = t ? 'Avvist: ' + t.slice(0, 220) : 'Ble IKKE avvist. Feil som kom: ' + r.feil.join(' | ').slice(0, 300); }
    else if (varsel) { const t = r.varsler.find(x => varsel.test(x)); ok = !!t; info = t ? 'Varsel: ' + t.slice(0, 220) : 'Mangler varsel'; }
    if (ingenFeil) { const t = r.feil.filter(x => x.startsWith(TAG)); ok = (ok ?? true) && !t.length; info = (info ? info + '. ' : '') + (t.length ? 'Uventet: ' + t.join(' | ').slice(0, 300) : 'Ingen feil i testoppsettet'); }
  } catch (e) { ok = false; info = String(e && e.message || e).slice(0, 300); }
  tester.push({ id, navn, ok: !!ok, info });
}

try {
  const regFil = id => `spill/${id}/evn-test.json`;
  const standard = vis('basis', '.claude/evn-game-standard.md') || '';
  const eksisterende = (prov(TMP, ['ls-tree', '-d', '--name-only', 'basis', 'spill/']) || '').split('\n').filter(Boolean).map(f => f.replace(/^spill\//, ''));
  const medReg = eksisterende.find(id => vis('basis', regFil(id)) !== null);
  const utenReg = eksisterende.find(id => vis('basis', regFil(id)) === null);

  // Det som skal gå gjennom
  let sha = commit({ 'spill/testspill/index.html': nyttSpill('testspill'), [regFil('testspill')]: '{ "start": "startBtn", "etterStart": [ { "klikk": ".verden.aapen" } ] }\n' });
  forvent('P1', 'Nytt spill med gyldig registrering godtas uten endring i test/', sha, arligResultat(sha), { ingenFeil: true });
  sha = commit({ 'spill/testspill/index.html': nyttSpill('testspill') });
  forvent('P2', 'Nytt spill uten registreringsfil godtas (standard startknapp)', sha, arligResultat(sha), { ingenFeil: true });
  if (utenReg) { sha = commit({ [regFil(utenReg)]: '{ "start": "startBtn" }\n' });
    forvent('P3', 'Registreringsfil som er lik standarden, godtas for et eksisterende spill', sha, arligResultat(sha), { ingenFeil: true }); }
  if (utenReg) { sha = commit(Object.fromEntries(filerI('basis', `spill/${utenReg}/`).map(f => [f, null])));
    forvent('P4', 'Et fjernet spill gir varsel, ikke feil', sha, arligResultat(sha), { varsel: /er fjernet/, ingenFeil: true }); }

  // Endringer i testlogikk, publiseringssjekk og arbeidsflyt krever fortsatt særskilt kontroll
  const endretTest = /^\[testoppsett\] PR-en endrer testene eller arbeidsflyten/;
  for (const [id, fil, endre] of [
    ['N1', 'test/index.html', t => t.replace('var KJENTE = {', "var KJENTE = { 'testspill/F1-start': 'skjult',")],
    ['N2', 'test/kjor.mjs', t => t + '\n// endret\n'],
    ['N3', 'test/publiseringssjekk.mjs', t => t.replace('process.exit(feil.length ? 1 : 0);', 'process.exit(0);')],
    ['N4', 'test/spillregister.mjs', t => t.replace("k !== 'start' && k !== 'etterStart'", 'false')],
    ['N5', '.github/workflows/publisering.yml', t => t.replace('Publiseringssjekk', 'Publiseringssjekk (endret)')]]) {
    const t = vis('basis', fil);
    if (t === null) { tester.push({ id, navn: `Endring i ${fil} avvises`, ok: false, info: `${fil} finnes ikke på basis` }); continue; }
    sha = commit({ [fil]: endre(t), 'spill/testspill/index.html': nyttSpill('testspill') });
    forvent(id, `Endring i ${fil} avvises, også sammen med et nytt spill`, sha, arligResultat(sha), { feil: endretTest });
  }
  sha = commit({ 'test/sikkerhet/manipulering.test.mjs': null });
  forvent('N6', 'Å slette de negative testene avvises', sha, arligResultat(sha), { feil: endretTest });

  // Registreringsfilen er bare data
  for (const [id, navn, innhold, re] of [
    ['N7', 'Ukjent felt som prøver å hoppe over kontroller, avvises', '{ "start": "startBtn", "hoppOver": ["royk"] }', /ukjent felt «hoppOver»/],
    ['N8', 'Felt for kjente funn eller resultat avvises', '{ "kjente": { "F1-start": "ok" }, "status": "ok" }', /ukjent felt/],
    ['N9', 'Startknapp med kode i stedet for id avvises', '{ "start": "x\\"); parent.EVNTestResultat = 1; //" }', /start må være en element-id/],
    ['N10', 'Klikk med HTML eller kode avvises', '{ "etterStart": [ { "klikk": "<img src=x onerror=alert(1)>" } ] }', /tegn som ikke er lov/],
    ['N11', 'Mer enn tre klikk avvises', '{ "etterStart": [ {"klikk":"a"}, {"klikk":"b"}, {"klikk":"c"}, {"klikk":"d"} ] }', /inntil 3 klikk/],
    ['N12', 'Klikk med ekstra felt avvises', '{ "etterStart": [ { "klikk": "a", "vent": 99999 } ] }', /etterStart\[0\] må være/],
    ['N13', 'Ugyldig JSON avvises', '{ start: startBtn }', /ikke gyldig JSON/],
    ['N14', 'Liste i stedet for objekt avvises', '[ "startBtn" ]', /må være et objekt/],
    ['N15', 'For stor registreringsfil avvises', '{ "start": "startBtn", "x": "' + 'a'.repeat(1100) + '" }', /større enn 1024 byte/]]) {
    sha = commit({ 'spill/testspill/index.html': nyttSpill('testspill'), [regFil('testspill')]: innhold });
    forvent(id, navn, sha, arligResultat(sha), { feil: re });
  }
  sha = commit({ 'spill/Nytt_Spill/index.html': nyttSpill('Nytt_Spill') });
  forvent('N16', 'Spillmappe med ugyldig navn avvises', sha, arligResultat(sha), { feil: /ugyldig mappenavn/ });

  // Registreringen til spill som finnes på main, kan ikke endres i samme PR
  if (medReg) { sha = commit({ [regFil(medReg)]: '{ "start": "annenKnapp" }\n' });
    forvent('N17', `Endret registrering for et eksisterende spill (${medReg}) avvises`, sha, arligResultat(sha), { feil: /registreringen til et spill som finnes på main, er endret/ }); }
  if (medReg) { sha = commit({ [regFil(medReg)]: null });
    forvent('N18', `Slettet registrering for et eksisterende spill (${medReg}) avvises`, sha, arligResultat(sha), { feil: /registreringen til et spill som finnes på main, er endret/ }); }
  if (utenReg) { sha = commit({ [regFil(utenReg)]: '{ "start": "tittel" }\n' });
    forvent('N19', `Ny registrering med annen startknapp for et eksisterende spill (${utenReg}) avvises`, sha, arligResultat(sha), { feil: /registreringen til et spill som finnes på main, er endret/ }); }

  // Testresultatet må dekke alle spill og kan ikke byttes ut
  sha = commit({ 'spill/testspill/index.html': nyttSpill('testspill') });
  const ci = arligResultat(sha);
  forvent('N20', 'Resultat der det nye spillet ikke ble testet, avvises', sha, { ...ci, spill: ci.spill.filter(s => s !== 'testspill'), tester: ci.tester.filter(t => t.spill !== 'testspill') }, { feil: /spill\/testspill\/ ble ikke testet/ });
  forvent('N21', 'Resultat der én påkrevd kontroll mangler for det nye spillet, avvises', sha, { ...ci, tester: ci.tester.filter(t => !(t.spill === 'testspill' && t.id === 'F1-pause')) }, { feil: /spill\/testspill\/: kontrollene F1-pause/ });
  forvent('N22', 'Resultat der en kontroll bare er «info» i stedet for ok, avvises', sha, { ...ci, tester: ci.tester.map(t => t.spill === 'testspill' && t.id === 'F1-start' ? { ...t, status: 'info' } : t) }, { feil: /kontrollene F1-start/ });
  forvent('N23', 'Resultat uten liste over testede spill avvises', sha, (({ spill, ...r }) => r)(ci), { feil: /oppgir ikke hvilke spill/ });
  forvent('N24', 'Resultat for en annen commit avvises', sha, { ...ci, commit: BASIS }, { feil: /Testkjøringen i Actions gjelder/ });
  forvent('N25', 'Resultat med falsk testversjon avvises', sha, { ...ci, testversjon: 'aaaaaaaaaaaa' }, { feil: /oppgir testversjon/ });
  forvent('N26', 'Resultat der sikkerhetstestene «ikke er innført», avvises', sha, { ...ci, suiter: { ...ci.suiter, sikkerhet: 'ikke-innfort' } }, { feil: /suiten sikkerhet er oppgitt som ikke innført/ });
  forvent('N27', 'Resultat uten sikkerhetssuiten avvises', sha, { ...ci, suiter: (({ sikkerhet, ...s }) => s)(ci.suiter) }, { feil: /suiten sikkerhet mangler/ });
  forvent('N28', 'Resultat med feil i røyktesten avvises', sha, { ...ci, suiter: { ...ci.suiter, royk: 'feil' } }, { feil: /suiten royk er feil/ });

  // Spillkode som når testsiden fra rammen
  for (const [id, navn, kode] of [
    ['N29', 'Nytt spill som skriver til testresultatet, avvises', '<script>parent.EVNTestResultat = { ferdig: true, feil: 0 };</script>'],
    ['N30', 'Nytt spill som leser testsiden via window.top, avvises', '<script>window.top.document.title = "ok";</script>'],
    ['N31', 'Nytt spill som bruker window["parent"], avvises', "<script>var p = window['parent']; p.x = 1;</script>"],
    ['N32', 'Nytt spill som bruker frameElement, avvises', '<script>frameElement.remove();</script>']]) {
    sha = commit({ 'spill/testspill/index.html': nyttSpill('testspill', kode) });
    forvent(id, navn, sha, arligResultat(sha), { feil: /Ny kode kan nå testsiden/ });
  }
  const etSpill = eksisterende[0];
  sha = commit({ [`spill/${etSpill}/index.html`]: (vis('basis', `spill/${etSpill}/index.html`) || '') + '\n<script>top.EVNTestResultat;</script>\n' });
  forvent('N33', `Eksisterende spill (${etSpill}) som får kode mot testsiden, avvises`, sha, arligResultat(sha), { feil: /Ny kode kan nå testsiden/ });

  // Krav kan ikke svekkes i samme PR
  const f1 = standard.split('\n').find(l => l.startsWith('| F1 |'));
  if (f1) { sha = commit({ '.claude/evn-game-standard.md': standard.replace(f1 + '\n', '') });
    forvent('N34', 'Standard der F1 er fjernet, gir varsel, og F1 kreves fortsatt', sha, arligResultat(sha), { varsel: /fjerner gjeldende krav \(F1/ }); }
  else tester.push({ id: 'N34', navn: 'Standard der F1 er fjernet', ok: false, info: 'fant ikke F1 i standarden' });
} finally {
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {}
}

const feilet = tester.filter(t => !t.ok);
if (JSON_UT) console.log(JSON.stringify({ basis: BASIS, tester }, null, 2));
else {
  console.log(`# EVN Sikkerhetstest (basis ${BASIS.slice(0, 7)})\n`);
  for (const t of tester) console.log(`${t.ok ? 'OK  ' : 'FEIL'} ${t.id.padEnd(4)} ${t.navn}\n       ${t.info}`);
  console.log(`\n${tester.length - feilet.length} ok, ${feilet.length} feil`);
}
process.exit(feilet.length ? 1 : 0);
