// Bruk: start en lokal server i denne mappen (python3 -m http.server 8790) og kjør node spilltest.mjs [adresse]
// Automatisk test: roboten følger spiralrampa fra Start til takterrassen, går inn i hver etasje, og prøver å hoppe ut over rekkverket.
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const prof = fs.mkdtempSync('/tmp/rute-'); const p = spawn('/usr/bin/google-chrome', ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + prof, '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
while (!fs.existsSync(prof + '/DevToolsActivePort')) await new Promise(r => setTimeout(r, 100));
const [port, sti] = fs.readFileSync(prof + '/DevToolsActivePort', 'utf8').split('\n'); const ws = new WebSocket('ws://127.0.0.1:' + port + sti); await new Promise(r => ws.onopen = r);
let id = 0; const v = new Map(), feil = []; ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && v.has(d.id)) { v.get(d.id)(d); v.delete(d.id); } else if (d.method === 'Runtime.exceptionThrown') feil.push(d.params.exceptionDetails.exception?.description); };
const send = (method, params = {}, sessionId) => new Promise(r => { const n = ++id; v.set(n, r); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' }); const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const s = (m, pp) => send(m, pp, sessionId); await s('Page.enable'); await s('Runtime.enable');
const ev = async x => { const r = await s("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600)); return r.result.result.value; };
await s('Page.navigate', { url: process.argv[2] || 'http://127.0.0.1:8790/index.html' }); for (let i = 0; i < 100 && !(await ev('!!window.EVNKlar')); i++) await new Promise(r => setTimeout(r, 200));


// Spilltest for prototypen: ta med og sett inn, Gårdsnivå med lagringsfeil, annen fane og dobbelttrykk, og nivå 1 → 10.
const ok = (navn, v) => { console.log((v ? 'OK   ' : 'FEIL ') + navn); if (!v) process.exitCode = 1; };
const a = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 300));
  const P = EVNProto, S = P.S(), R = EVNRobot(), sp = EVNSpill, ut = {};
  ut.start = { penger: S.penger, niva: S.gard.niva, plasser: P.plasserApne(), base: S.base };
  // Slipp Burgersau (Common, 63) rett ved roboten og ta den med
  P.S().penger = 1000; P.slippNed(508, [R.position.x + 1, R.position.z]);
  for (let i = 0; i < 3; i++) EVNSteg(1/30); EVNIntern.krok.steg(1/30, 0);
  ut.handling = P.finnHandling(); ut.handling = ut.handling && ut.handling.t; P.gjorHandling(); ut.bar = P.bar() && P.bar().ci;
  // Gå inn på plass 0 i etasje 1
  const p0 = EVNIntern.plassPos(0); R.position.set(p0.x, 0.45, p0.z); sp.paaBakken = true; EVNSteg(1/30); EVNIntern.krok.steg(1/30, 0);
  ut.etter = { base0: P.S().base[0], penger: Math.round(P.S().penger), bar: P.bar() };
  ut.lagret = JSON.parse(localStorage.getItem(P.NOKKEL)).base[0];
  return ut; })()
`);
ok('ta med Burgersau og sett den inn på plass 0', a.handling === 'ta' && a.etter.base0 === 508 && a.etter.bar === null && a.lagret === 508 && a.etter.penger >= 937 && a.etter.penger < 945);
const b = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 300));
  const P = EVNProto, D = EVNMatdyrData, ut = {};
  const finn = (art, r, skip = []) => D.COMBOS.findIndex((c, i) => c.art === art && c.r === r && !skip.includes(i));
  const ku1 = finn('ku', 0), ku2 = finn('ku', 0, [ku1]), gris = finn('gris', 0), kuRare = finn('ku', 1);
  P.sett({ v: 1, penger: 5000, gard: { niva: 1 }, plassNiva: 2, base: [kuRare, ku1, gris, ku2, -1, -1, -1, -1], disc: [] });
  P.apneGardsniva();
  ut.autoValg = P.valg().map(v => v.map(i => D.COMBOS[P.S().base[i]].navn + ' ' + D.R[D.COMBOS[P.S().base[i]].r].n));
  ut.videreAktiv = !document.getElementById('dVidere').disabled;
  // Lagringsfeil: ingenting endres
  const orig = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('full'); };
  ut.lagringsfeil = P.oppgrader(); Storage.prototype.setItem = orig;
  ut.etterFeil = { niva: P.S().gard.niva, penger: P.S().penger, status: (document.querySelector('.status') || {}).textContent };
  // Annen fane har endret nivået
  localStorage.setItem(P.NOKKEL, JSON.stringify(Object.assign({}, P.S(), { gard: { niva: 2 } })));
  ut.annenFane = P.oppgrader(); ut.annenFaneStatus = (document.querySelector('.status') || {}).textContent;
  P.lagre();
  // Dobbelttrykk: to klikk rett etter hverandre gir bare ett nivå
  P.apneGardsniva(); document.getElementById('dVidere').click(); const ja = document.getElementById('dJa'); ja.click(); ja.click(); P.oppgrader(); 
  ut.etterOpp = { niva: P.S().gard.niva, penger: P.S().penger, base: P.S().base.map(c => c < 0 ? '-' : D.COMBOS[c].navn), lagretNiva: JSON.parse(localStorage.getItem(P.NOKKEL)).gard.niva };
  ut.dialogLukket = document.getElementById('dialog').hidden;
  return ut; })()
`);
ok('forslag velger aldri sjeldnere enn kravet', b.autoValg.flat().every(s => s.endsWith('Common')));
ok('lagringsfeil endrer ingenting', b.lagringsfeil === false && b.etterFeil.niva === 1 && b.etterFeil.penger === 5000);
ok('endring i annen fane stopper oppgraderingen', b.annenFane === false && /annen fane/.test(b.annenFaneStatus));
ok('dobbelttrykk gir bare ett nivå', b.etterOpp.niva === 2 && b.etterOpp.penger === 4000 && b.etterOpp.lagretNiva === 2);
ok('bare innleverte matdyr forsvinner', b.etterOpp.base.filter(x => x !== '-').length === 1);
const c = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 200));
  const P = EVNProto, ut = [];
  P.sett({ v: 1, penger: 1e9, gard: { niva: 1 }, plassNiva: 0, base: [], disc: [] });
  for (let n = 1; n < 10; n++) {
    const S = P.S(); while (P.plasserApne() < EVNMatdyrData.GARDSNIVA[S.gard.niva].tak) { S.plassNiva++; }
    P.sett(S); [...document.querySelectorAll('#panel button')].find(b => b.textContent === '🧪').click();
    [...document.querySelectorAll('#panel button')].find(b => b.textContent.includes('Dyr til neste')).click();
    [...document.querySelectorAll('#panel button')].find(b => b.textContent === '🧪').click();
    P.apneGardsniva(); const ok = P.oppgrader(); ut.push([n, ok, P.S().gard.niva, P.plasserApne(), EVNMaal && EVNMaal.kall]);
  }
  return ut; })()
`);
ok('gårdsnivå 1 → 10 i rekkefølge', c.length === 9 && c.every((r, i) => r[1] === true && r[2] === i + 2));
console.log(feil.length ? feil : 'ingen feil i konsollen'); if (feil.length) process.exitCode = 1;
ws.close(); p.kill();
