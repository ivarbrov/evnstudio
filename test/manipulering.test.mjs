#!/usr/bin/env node
/*
 * Test av at spillkode ikke kan forfalske testresultatet. Krever Node 22+ og Chrome eller Edge, som test/kjor.mjs.
 *
 *   node test/manipulering.test.mjs
 *
 * Lager en midlertidig kopi av testene med to spill og kjører test/kjor.mjs (statisk og royk) på kopien:
 * - «god»: et lite, riktig spill som skal bestå alle kontroller.
 * - «fiende»: et spill der Start ikke virker, og som prøver å skjule det. Det setter et forfalsket testresultat
 *   (alle spill ok og et oppdiktet spill), låser det, og endrer DOM-funksjonene på siden så startknappen ser borte ut.
 * Testen krever at «fiende» får FEIL på F1-start og F1-pause, at «god» består, og at det oppdiktede spillet ikke finnes i resultatet.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST = path.dirname(fileURLToPath(import.meta.url));
const ROT = fs.mkdtempSync(path.join(os.tmpdir(), 'evn-manipulering-'));
process.on('exit', () => fs.rmSync(ROT, { recursive: true, force: true }));
const skriv = (fil, tekst) => { const f = path.join(ROT, fil); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, tekst); };

for (const f of ['index.html', 'kjor.mjs', 'spilloppsett.mjs']) skriv('test/' + f, fs.readFileSync(path.join(TEST, f), 'utf8'));
const hode = (tittel, csp) => `<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${csp ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; object-src 'none'">` : ''}<link rel="icon" href="ikon.svg"><title>${tittel}</title></head>`;
const ikon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>';

// Et riktig spill: versjon, Start som skjuler startkortet, og felles pause.
skriv('spill/god/index.html', hode('God', true) + `<body><div id="kort"><p class="evn-ver">Versjon 1.0.0</p><button id="startBtn">Start</button></div>
<button id="evnPauseKnapp">Pause</button><div id="evnPause" hidden><button id="evnPauseFortsett">Fortsett</button></div><script src="spill.js"></script></body></html>\n`);
skriv('spill/god/spill.js', `const $ = id => document.getElementById(id);
$('startBtn').addEventListener('click', () => { $('kort').hidden = true; });
$('evnPauseKnapp').addEventListener('click', () => { $('evnPause').classList.add('vis'); $('evnPause').hidden = false; });
$('evnPauseFortsett').addEventListener('click', () => { $('evnPause').classList.remove('vis'); $('evnPause').hidden = true; });\n`);
skriv('spill/god/ikon.svg', ikon);

// Et fiendtlig spill: Start gjør ingenting, og det finnes ingen pause. Skriptet prøver å skjule det.
skriv('spill/fiende/index.html', hode('Fiende', true) + `<body><p class="evn-ver">Versjon 1.0.0</p><button id="startBtn">Start</button><script src="spill.js"></script></body></html>\n`);
skriv('spill/fiende/spill.js', `(function () {
  const rader = [];
  for (const spill of ['god', 'fiende', 'falsk']) for (const id of ['U1-versjon', 'F1-startknapp', 'F1-start', 'F1-pause', 'F1-fortsett', 'K1-404', 'K1-feil', 'K1-nettleser'])
    rader.push({ suite: 'royk', spill, id, krav: 'F1', navn: id, status: 'ok', info: '' });
  const falskt = { ferdig: true, feil: 0, suiter: { statisk: { status: 'kjort' }, royk: { status: 'kjort' } }, tester: rader, ikkeGjeldende: {}, kjente: {},
    spill: ['god', 'fiende', 'falsk'], spillOppsett: [], alleSuiter: ['statisk', 'royk', 'statistikk', 'ui', 'ecoins'] };
  // 1. Forfalsk og lås resultatet i alle vinduer spillet kan nå.
  for (const w of [window, window.parent, window.top, window.opener].filter(Boolean)) {
    try { Object.defineProperty(w, 'EVNTestResultat', { value: falskt, writable: false, configurable: false }); } catch (e) {}
  }
  // 2. Få startknappen til å se borte ut for kode i samme verden som spillet.
  try { Element.prototype.getBoundingClientRect = () => ({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }); } catch (e) {}
  try { window.getComputedStyle = () => ({ visibility: 'hidden', display: 'none' }); } catch (e) {}
  try { const orig = Document.prototype.getElementById; Document.prototype.getElementById = function (id) { return id === 'startBtn' ? null : orig.call(this, id); }; } catch (e) {}
  // 3. Prøv å nå testsiden gjennom delt lagring og meldinger.
  try { localStorage.setItem('EVNTestResultat', JSON.stringify(falskt)); } catch (e) {}
  try { new BroadcastChannel('evn').postMessage(falskt); } catch (e) {}
  try { window.parent.postMessage(falskt, '*'); } catch (e) {}
})();\n`);
skriv('spill/fiende/ikon.svg', ikon);

const resultat = path.join(ROT, 'resultat.json');
const p = spawnSync(process.execPath, [path.join(ROT, 'test', 'kjor.mjs'), '--suiter', 'statisk,royk', '--json', resultat], { cwd: ROT, encoding: 'utf8', timeout: 10 * 60 * 1000 });
let r = null;
try { r = JSON.parse(fs.readFileSync(resultat, 'utf8')); } catch {}
const rad = (spill, id) => r && r.tester.find(t => t.spill === spill && t.id === id);
const krav = [
  ['kjor.mjs avslutter med feil (kode 1)', p.status === 1],
  ['resultatet er skrevet av kjor.mjs', !!r],
  ['spillisten er god og fiende, uten det oppdiktede spillet', r && JSON.stringify(r.spill) === JSON.stringify(['fiende', 'god'])],
  ['fiende: F1-start er FEIL', rad('fiende', 'F1-start') && rad('fiende', 'F1-start').status === 'feil'],
  ['fiende: F1-pause er FEIL', rad('fiende', 'F1-pause') && rad('fiende', 'F1-pause').status === 'feil'],
  ['fiende: F1-startknapp er OK (knappen er synlig, selv om spillet skjuler den for egen kode)', rad('fiende', 'F1-startknapp') && rad('fiende', 'F1-startknapp').status === 'ok'],
  ['god: alle kontroller i royk og statisk er OK', r && r.tester.filter(t => t.spill === 'god').length >= 13 && r.tester.filter(t => t.spill === 'god').every(t => t.status === 'ok')],
  ['ingen rader for det oppdiktede spillet', r && !r.tester.some(t => t.spill === 'falsk')],
  ['suiten royk er feil', r && r.suiter.royk === 'feil']
];
let feil = 0;
for (const [navn, ok] of krav) { if (!ok) feil++; console.log(`${ok ? 'OK  ' : 'FEIL'} ${navn}`); }
if (feil) console.log('\n' + (p.stdout || '') + (p.stderr || ''));
console.log(`\n${krav.length - feil} av ${krav.length} ga forventet utfall.`);
process.exit(feil ? 1 : 0);
