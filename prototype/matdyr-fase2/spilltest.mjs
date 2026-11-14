// Bruk: start en lokal server i denne mappen (python3 -m http.server 8790) og kjør node spilltest.mjs [adresse]
// Automatisk test: roboten følger spiralrampa fra Start til takterrassen, går inn i hver etasje, og prøver å hoppe ut over rekkverket.
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const prof = fs.mkdtempSync('/tmp/rute-'); const p = spawn('/usr/bin/google-chrome', ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + prof, '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
for (const sg of ['SIGTERM', 'SIGINT']) process.on(sg, () => { try { p.kill('SIGKILL'); } catch {} process.exit(1); });
process.on('exit', () => { try { p.kill('SIGKILL'); } catch {} });   // Chrome lukkes også ved feil og tidsavbrudd (QA 81c2fb8)
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
// Minne: gjentatte salg skal ikke øke antall geometrier (plassfigurene slås sammen og må frigjøres)
const d = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 200));
  const P = EVNProto, I = EVNIntern, D = EVNMatdyrData, base = []; for (let i = 0; i < 24; i++) base.push([127, 508, 700, 599, 179][i % 5]);
  P.sett({ v: 1, penger: 1e9, gard: { niva: 5 }, plassNiva: 10, base, disc: [] });
  const g = () => { I.renderer.render(I.scene, I.camera); return I.renderer.info.memory.geometries; }; const ut = [g()];
  for (let k = 0; k < 10; k++) { const i = 1 + k, p = I.plassPos(i), R = EVNRobot(); R.position.set(p.x, p.y + 0.45, p.z); EVNSpill.paaBakken = true; EVNSteg(1/30); I.krok.steg(1/30, 0);
    const h = P.finnHandling(); if (!h || h.t !== 'selg') return 'ingen selg ved ' + i; P.gjorHandling(); document.getElementById('dJa').click(); ut.push(g()); }
  return ut; })()
`);
ok('salg lekker ikke geometrier', Array.isArray(d) && d[d.length - 1] - d[1] <= 1);
// Åkeren: 14 matdyr som vil ut samtidig, med roboten midt i portåpningen, pluss vanlig regn i 3 minutter.
// Ingen skal gå gjennom gjerdet, bli fjernet inne på åkeren eller stå fast i mer enn 5 s. Alle de 14 skal ut innen 60 s.
const f = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 200));
  const I = EVNIntern, P = EVNProto, e = { x0: -31, x1: 31, z0: 30.5, z1: 56 }, pz = 40, dt = 1 / 30, info = new Map(), ut = { inneFjernet: 0, brudd: 0, fast: 0 };
  const R = I.robot(); R.position.set(e.x1 - 1, 0.45, pz); const forste = [];
  for (let i = 0; i < 14; i++) { P.slippNed(i * 7 % 160, [e.x1 - 18 + (i % 4) * 3, e.z0 + 3 + Math.floor(i / 4) * 5.5 + (i % 4)]); const a = P.felt()[P.felt().length - 1]; a.tid = 0; a.alder = 8; forste.push(a); }
  for (let i = 0; i < 180 * 30; i++) {
    R.position.set(e.x1 - 1, 0.45, pz); I.krok.steg(dt, i * dt); const felt = P.felt(), sett = new Set(felt);
    for (const a of felt) { if (a.tilstand === 'fall') continue; const p = a.g.position, d = info.get(a) || { st: 0 }; info.set(a, d);
      const inne = p.x > e.x0 + 1 && p.x < e.x1 - 1 && p.z > e.z0 + 1 && p.z < e.z1 - 1, port = p.x >= e.x1 - 3 && Math.abs(p.z - pz) < 2.5, ute = p.x > e.x1 + 1.3;
      if (inne) d.inne = true; if (d.inne && !inne && !port && !ute) ut.brudd++;
      d.st = a.beite <= 0 && a.vFaktisk < 0.1 ? d.st + dt : 0; ut.fast = Math.max(ut.fast, d.st);
      if (a.tilstand !== 'gaa' && d.ute === undefined) d.ute = i * dt; d.x = p.x; }
    for (const [a, d] of info) if (!sett.has(a) && !d.borte) { d.borte = true; if (d.x < e.x1 + 8) ut.inneFjernet++; } }
  ut.sisteUte = Math.max(...forste.map(a => (info.get(a) || {}).ute ?? 999)); ut.fast = +ut.fast.toFixed(1); return ut; })()
`);
ok('åkeren: 14 matdyr kommer ut forbi roboten i porten, uten gjerdebrudd, fastlåsing eller fjerning inne (' + JSON.stringify(f) + ')', f.sisteUte < 60 && f.brudd === 0 && f.inneFjernet === 0 && f.fast < 5);
// Basen: bær et matdyr inn på gården, trykk på en ledig plass i 2. etasje, og bruk «første ledige» fra bakken.
const g = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 200));
  const I = EVNIntern, P = EVNProto, ut = {}, st = n => { for (let i = 0; i < n; i++) { EVNSteg(1 / 30); I.krok.steg(1 / 30, i / 30); } };
  P.sett({ v: 1, penger: 1e6, gard: { niva: 6 }, plassNiva: 8, base: [], disc: [] }); st(2); const R = I.robot();
  R.position.set(0, 0.45, 34); P.slippNed(508, [1, 34]); st(3); P.gjorHandling(); ut.merkerAaker = P.merker().length;
  R.position.set(0, 0.45, 18); st(3); ut.merker = P.merker().length; ut.ledige = P.ledige().length;
  const i2 = P.ledige().find(i => I.plassPos(i).y > 2), p0 = P.S().penger; ut.valgt = P.velgPlass(i2); st(60);
  ut.etg2 = P.S().base[i2] === 508 && !P.bar() && JSON.parse(localStorage.getItem(P.NOKKEL)).base[i2] === 508; ut.betalt = Math.round(p0 - P.S().penger);
  P.slippNed(508, [1, 34]); R.position.set(0, 0.45, 34); st(3); P.gjorHandling(); R.position.set(0, 0.45, 18); st(3);
  const h = P.finnHandling(); ut.forste = h && h.t; const fi = h && h.i; P.gjorHandling(); st(60); ut.forsteEtg1 = P.S().base[fi] === 508 && I.plassPos(fi).y < 1;
  ut.antall = P.S().base.filter(c => c >= 0).length; return ut; })()
`);
ok('basen: trykk på ledig plass i 2. etasje og «første ledige» (' + JSON.stringify(g) + ')', g.merkerAaker === 0 && g.merker === g.ledige && g.valgt && g.etg2 && g.betalt > 50 && g.forste === 'forste' && g.forsteEtg1 && g.antall === 2);
// Leveringsfeltet: gå inn på feltet med et matdyr, så flyr det til første ledige plass uten trykk. Uten ledig plass skjer ingenting.
const h = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 200));
  const I = EVNIntern, P = EVNProto, ut = {}, st = n => { for (let i = 0; i < n; i++) { EVNSteg(1 / 30); I.krok.steg(1 / 30, i / 30); } };
  P.sett({ v: 1, penger: 1e6, gard: { niva: 6 }, plassNiva: 8, base: [], disc: [] }); st(2); const R = I.robot(), o = P.levOmr();
  R.position.set(0, 0.45, 34); P.slippNed(508, [1, 34]); st(3); P.gjorHandling(); ut.bar = !!P.bar();
  R.position.set(0, 0.45, (o.z0 + o.z1) / 2); st(60); ut.levert = P.S().base[0] === 508 && !P.bar(); ut.lagret = JSON.parse(localStorage.getItem(P.NOKKEL)).base[0] === 508;
  // full gård: ingenting skjer, matdyret bæres videre
  // full gård: ta med et matdyr først, fyll så gården mens det bæres. Feltet skal ikke levere, og matdyret bæres videre.
  R.position.set(0, 0.45, 34); P.slippNed(508, [1, 34]); st(3); P.gjorHandling(); ut.fullFikkBaere = !!P.bar();
  for (let i = 0; i < P.S().base.length; i++) if (P.S().base[i] === -1) P.S().base[i] = 508;
  R.position.set(2.0, 0.45, (o.z0 + o.z1) / 2); st(30); ut.fullBaerer = !!P.bar() && P.S().base.every(c => c === 508);
  ut.fullSpor = !document.getElementById('dialog').hidden; if (document.getElementById('dNei')) document.getElementById('dNei').click(); st(2);
  // står allerede på feltet når matdyret tas med: leveres likevel uten å gå av og på
  P.sett({ v: 1, penger: 1e6, gard: { niva: 6 }, plassNiva: 8, base: [], disc: [] }); st(2); const R3 = I.robot(), o3 = P.levOmr(), mz = (o3.z0 + o3.z1) / 2;   // feltet flytter seg med gjerdet på nivå 6
  R3.position.set(-20, 0.45, mz - 30); st(3); if (P.bar()) P.gjorHandling(); st(3);   // slipp matdyret fra forrige del og gå ut av feltet først
  R3.position.set(0, 0.45, mz); st(5); P.slippNed(508, [1.2, mz]); st(3); P.gjorHandling(); st(90); ut.staarPaaFeltet = P.S().base[0] === 508 && !P.bar();
  return ut; })()
`);
ok('leveringsfeltet setter inn på første ledige plass uten trykk (' + JSON.stringify(h) + ')', h.bar && h.levert && h.lagret && h.fullFikkBaere && h.fullBaerer && h.fullSpor && h.staarPaaFeltet);
// Full gård: et bedre matdyr kan tas med og byttes med det svakeste etter spørsmål; et dårligere kan ikke tas med.
const byt = await ev(`(async () => { localStorage.removeItem('evn-matdyr-gard-proto'); EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 200));
  const I = EVNIntern, P = EVNProto, ut = {}, st = n => { for (let i = 0; i < n; i++) { EVNSteg(1 / 30); I.krok.steg(1 / 30, i / 30); } };
  P.sett({ v: 1, penger: 1e9, gard: { niva: 1 }, plassNiva: 0, base: [], disc: [] }); st(2);
  const n = P.S().base.length, inc = ci => P.INC(ci), alle = [...Array(160).keys()].sort((a, c) => inc(a) - inc(c));
  const svak = alle[0], sterk = alle[159], midt = alle[80];
  const fyll = P.S().base.map((_, i) => i === 0 ? svak : midt); P.sett({ ...P.S(), base: fyll }); st(2); const R = I.robot(), o = P.levOmr();
  // dårligere enn det svakeste: kan ikke tas med
  R.position.set(0, 0.45, 34); P.slippNed(svak, [1, 34]); st(3); P.gjorHandling(); ut.svakAvvist = !P.bar();
  P.felt().slice().forEach(a => a.g.position.x = 999); st(1);
  // bedre: tas med, feltet åpner spørsmålet, «Bytt med svakeste»
  R.position.set(0, 0.45, 34); P.slippNed(sterk, [1, 34]); st(3); P.gjorHandling(); ut.sterkTatt = !!P.bar();
  const p0 = P.S().penger; R.position.set(0, 0.45, (o.z0 + o.z1) / 2); st(3); ut.dialog = !document.getElementById('dialog').hidden && !!document.getElementById('dJa');
  const pS = P.S().penger; document.getElementById('dJa').click(); ut.halvInn = P.S().penger - pS === Math.floor(P.PRICE(svak) / 2);
  let pFor = P.S().penger, n0 = 0; for (; n0 < 120 && P.bar(); n0++) { pFor = P.S().penger; st(1); } ut.trukket = Math.round(pFor - P.S().penger) >= P.PRICE(sterk) - 1 && Math.round(pFor - P.S().penger) <= P.PRICE(sterk) + Math.ceil(P.INC(midt) * (P.S().base.length) / 30) + 1;
  ut.byttet = P.S().base[0] === sterk && !P.bar(); ut.netto = Math.round(P.S().penger - p0); ut.forventet = Math.floor(P.PRICE(svak) / 2) - P.PRICE(sterk);
  ut.andreUrort = P.S().base.slice(1).every(c => c === midt);
  // «Velg en annen»: 🔁 over alle opptatte plasser, trykk på én bytter akkurat den
  R.position.set(0, 0.45, 34); P.slippNed(sterk, [1, 34]); st(3); P.gjorHandling(); R.position.set(0, 0.45, 18); st(3);
  P.apneBytte(); document.getElementById('dVelg').click(); st(3); ut.byttMerker = P.merker().length === n;
  P.apneBytte(); const knapper = [...document.querySelectorAll('#dialog button')]; let utenfor = false;
  for (let k = 0; k < knapper.length + 2; k++) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })); if (!document.getElementById('dialog').contains(document.activeElement)) utenfor = true; }
  ut.fokusfelle = !utenfor; document.getElementById('dNei').click(); st(2); ut.avbrytNullstiller = P.merker().length === 0 && !P.bar().velgBytt;
  P.apneBytte(); document.getElementById('dVelg').click(); st(3);
  P.byttMed(3); st(90); ut.valgtByttet = P.S().base[3] === sterk && P.S().base[0] === sterk && P.S().base.filter(c => c === midt).length === n - 2;
  ut.lagret = JSON.parse(localStorage.getItem(P.NOKKEL)).base[3] === sterk;
  return ut; })()
`);
ok('full gård: bytte med svakeste etter spørsmål, aldri automatisk (' + JSON.stringify(byt) + ')', byt.svakAvvist && byt.sterkTatt && byt.dialog && byt.byttet && byt.halvInn && byt.trukket && byt.andreUrort && byt.byttMerker && byt.fokusfelle && byt.avbrytNullstiller && byt.valgtByttet && byt.lagret);
// Tobeinte matdyr lastes etter oppstart (QA 81c2fb8): gården og Matdyr-fanen bytter til dem når de er klare. ?tobein=0 slår dem av.
const tb = await ev(`(async () => { for (let i = 0; i < 150 && !window.EVNTobeinKlar; i++) await new Promise(r => setTimeout(r, 200));
  const I = EVNIntern, ut = { klar: !!window.EVNTobeinKlar, n508: I.nyNavnFor(508), n700: I.nyNavnFor(700), n127: I.nyNavnFor(127), n52: I.nyNavnFor(52), n2: I.nyNavnFor(2), n227: I.nyNavnFor(227) };
  EVNVis({ fane: 'matdyr' }); await new Promise(r => setTimeout(r, 300)); ut.fane = document.getElementById('kort').textContent.includes('to bein');
  // Kameraet skal ikke hoppe når hendelsen kommer (QA 11a7594): både med en annen figur og med Donutku
  const b = I.bane; ut.kamera = [];
  const lik = (x, y) => Math.abs(x - y) < 1e-6;
  for (const fig of ['shakeand', 'donutku']) { EVNVis({ fane: 'matdyr', figur: fig, vis: 'bak' }); await new Promise(r => setTimeout(r, 200)); b.teta = 1.0; b.fi = 1.1; b.r = 9; b.mal.set(0.3, 0.7, -0.2);
    const forste = I.md.gruppe.children[0];
    document.dispatchEvent(new Event('evn-tobein-klar')); await new Promise(r => setTimeout(r, 200));
    const tegnetPaaNytt = I.md.gruppe.children[0] !== forste;
    ut.kamera.push(lik(b.teta, 1) && lik(b.fi, 1.1) && lik(b.r, 9) && lik(b.mal.x, 0.3) && lik(b.mal.y, 0.7) && lik(b.mal.z, -0.2) && tegnetPaaNytt === (fig === 'donutku')); }
  // «Nært» med Donutku: målpunktet flyttes til hodet på figuren som vises nå, vinkel og avstand beholdes
  EVNVis({ fane: 'matdyr', figur: 'donutku', vis: 'naert' }); await new Promise(r => setTimeout(r, 200));
  const hodeMal = b.mal.clone(); b.teta = 0.9; b.fi = 1.2; b.r = 2.4; b.mal.set(0, 0.1, 0.6);
  document.dispatchEvent(new Event('evn-tobein-klar')); await new Promise(r => setTimeout(r, 200));
  ut.kamera.push(lik(b.teta, 0.9) && lik(b.fi, 1.2) && lik(b.r, 2.4) && b.mal.distanceTo(hodeMal) < 1e-6);
  EVNVis({ fane: 'matdyr', figur: 'donutku', vis: 'forfra' });
  return ut; })()`);
if (/[?&]tobein=0/.test(process.argv[2] || '')) ok('?tobein=0: gamle figurer i spill og Matdyr-fane (' + JSON.stringify(tb) + ')', tb.n127 === 'donutku' && tb.n52 === null && tb.n2 === null && tb.n227 === null && !tb.fane);
else ok('tobeinte lastes etter start og brukes i spill og Matdyr-fane (' + JSON.stringify(tb) + ')', tb.klar && tb.n508 === 'pilot_sau2_burger' && tb.n700 === 'pilot_skilpadde2_pizza' && tb.n127 === 'pilot_ku2_smultring' && tb.n52 === 'pilot_hai2_smultring' && tb.n2 === 'pilot_gris2_smultring' && tb.n227 === 'pilot_hval2_smultring' && tb.fane && tb.kamera.every(Boolean));
// Pengene kommer automatisk (Even 14.11.2026). Den gamle pengesonen fra 12.11 finnes bare med ?samle=1.
const sa = await ev(`(async () => { const P = EVNProto, S0 = JSON.parse(JSON.stringify(P.S())); S0.base = [127, 125]; S0.kasse = 0; P.sett(S0); EVNVis({ fane: 'spill' });
  const R = EVNRobot(), K = EVNIntern.krok; R.position.set(0, 0, 12); const p0 = P.S().penger; for (let i = 0; i < 90; i++) { EVNSteg(1 / 30); K.steg(1 / 30, i / 30); }
  const ut = { samle: P.SAMLE, kasse: P.S().kasse, vokst: +(P.S().penger - p0).toFixed(2) };
  const o = P.samleOmr(); if (o && P.SAMLE) { const k = P.S().kasse; R.position.set((o.x0 + o.x1) / 2, 0, (o.z0 + o.z1) / 2); for (let i = 0; i < 3; i++) { EVNSteg(1 / 30); K.steg(1 / 30, 3 + i / 30); } ut.kasse = k; }
  ut.etter = P.S().penger - p0; ut.kasseEtter = P.S().kasse;
  ut.lagret = (JSON.parse(localStorage.getItem(P.NOKKEL)) || {}).penger === P.S().penger;
  if (o && P.SAMLE) { for (let i = 0; i < 60; i++) { EVNSteg(1 / 30); K.steg(1 / 30, 4 + i / 15); } ut.kasseStaar = +P.S().kasse.toFixed(1); }   // står i sonen: hentes fortsatt
  return ut; })()`);
// Innsamlingssonen ligger helt inntil gårdsgjerdet, er minst 7 m dyp, krysses ikke av åkergjerdet, og roboten kan gå i hele feltet (Even 14.11.2026)
const lz = await ev(`(async () => { const P = EVNProto, I = EVNIntern, K = I.krok, ut = [];
  for (const n of [1, 2, 6, 10]) { P.sett({ v: 1, penger: 0, gard: { niva: n }, base: [], disc: [] }); EVNVis({ fane: 'spill' }); K.steg(1 / 30, 1);
    const o = P.levOmr(), d = I.gd.gjerdeD, e = I.gd.eng, R = I.robot(), sp = EVNSpill, b = EVNBane; let gaa = 0, tot = 0; b.teta = 0;
    // Ekte gange med styrespaken: fra porten i gårdsgjerdet til ni punkter i feltet
    for (const x of [-7.2, 0, 7.2]) for (const z of [o.z0 + 0.6, (o.z0 + o.z1) / 2, o.z1 - 0.6]) { R.position.set(0, 0.45, d - 1); tot++;
      for (const [mx, mz] of [[0, d + 1.2], [x, z]]) for (let i = 0; i < 500; i++) { const dx = mx - R.position.x, dz = mz - R.position.z, m = Math.hypot(dx, dz); if (m < 0.3) break;
        sp.inn = { x: dx / m, z: -dz / m }; EVNSteg(1 / 30); }
      sp.inn = { x: 0, z: 0 }; EVNSteg(1 / 30); if (Math.hypot(R.position.x - x, R.position.z - z) < 0.6) gaa++; }
    ut.push({ n, d, z0: o.z0, z1: o.z1, aaker: e.z0 - 0.6, inntil: Math.abs(o.z0 - d) < 0.5, dyp: o.z1 - o.z0, fri: o.z1 < e.z0 - 0.6, gaa, tot }); }
  return ut; })()`);
// Gårdsgjerdet stopper roboten hele veien rundt og fra begge sider, porten slipper den gjennom, og roboten kan gå helt ut til åkergjerdet (QA 2bd5a5d og 208b671)
const gj = await ev(`(async () => { const P = EVNProto, I = EVNIntern, sp = EVNSpill, ut = [];
  for (const n of [1, 2, 6]) { P.sett({ v: 1, penger: 0, gard: { niva: n }, base: [], disc: [] }); EVNVis({ fane: 'spill' }); I.krok.steg(1 / 30, 1); EVNBane.teta = 0;
    const o = P.levOmr(), e = I.gd.eng, R = I.robot(), kjor = (x, z, iz) => { R.position.set(x, 0.45, z); for (let i = 0; i < 120; i++) { sp.inn = { x: 0, z: iz }; EVNSteg(1 / 30); } sp.inn = { x: 0, z: 0 }; EVNSteg(1 / 30); return +R.position.z.toFixed(2); };
    const G = I.gd.gjerdeR, fz = x => G.z * Math.sqrt(1 - (x / G.x) ** 2);
    // Inne på gården ut mot gjerdet (ved siden av porten og på siden), og utenfra inn mot gjerdet
    const inne = [4.5, 8.5, 12].map(x => +(fz(x) - kjor(x, fz(x) - 2.5, -1)).toFixed(2)), utenfra = [4.5, 7.5].map(x => +(kjor(x, Math.max(o.z0 + 0.6, fz(x) + 2), 1) - fz(x)).toFixed(2));
    ut.push({ n, bak: kjor(6, o.z0 + 0.6, 1), ut: kjor(6, o.z0 + 0.6, -1), port: kjor(0, o.z0 + 0.6, 1), lin: fz(6), aaker: e.z0 - 0.6, inne, utenfra }); }
  return ut; })()`);
ok('gårdsgjerdet stopper roboten fra begge sider, porten slipper gjennom, ingen usynlig stopp før åkergjerdet (' + JSON.stringify(gj) + ')', gj.every(r => r.bak >= r.lin && r.port < r.lin - 1 && r.ut > r.aaker - 0.7 && r.inne.every(d => d > 0.1 && d < 1) && r.utenfra.every(d => d > 0.1 && d < 1)));
ok('innsamlingssonen helt inntil gården, 7 m dyp, uten gjerde gjennom (' + JSON.stringify(lz) + ')', lz.every(r => r.inntil && r.dyp >= 6.9 && r.fri && r.gaa === r.tot));
// Gammel kasse fra pengesonen går til lommeboka i standardmodus, uten tap eller dobling (QA e8102a6)
const ka = await ev(`(async () => { const P = EVNProto, K = EVNIntern.krok; P.sett({ v: 1, penger: 100, kasse: 500.5, gard: { niva: 1 }, base: [], disc: [] }); EVNVis({ fane: 'spill' }); K.steg(1 / 30, 1);
  return { penger: P.S().penger, kasse: P.S().kasse || 0 }; })()`);
if (!/[?&]samle=1/.test(process.argv[2] || '')) ok('standard (Even 14.11.2026): inntekten går rett i lommeboka, og gammel kasse flyttes dit (' + JSON.stringify(sa) + ' ' + JSON.stringify(ka) + ')', !sa.samle && sa.vokst > 0 && ka.kasse === 0 && Math.abs(ka.penger - 600.5) < 1);
else ok('?samle=1: inntekten samles i kassa og hentes i pengesonen (' + JSON.stringify(sa) + ')', sa.samle && sa.kasse > 0 && sa.vokst === 0 && sa.etter >= Math.floor(sa.kasse) && sa.kasseEtter < sa.kasse / 4 && sa.kasseStaar < sa.kasse / 4 && sa.lagret);
// Hulveien (Even 12.11.2026): matdyr som ikke blir tatt, går ned skråningen øst for porten, inn i tunnelen og forsvinner. ?groft=0 gir den gamle utgangen.
const gr = await ev(`(async () => { const P = EVNProto, I = EVNIntern, K = I.krok; EVNVis({ fane: 'spill' }); const R = EVNRobot(); R.position.set(-20, 0, 12);
  for (const ci of [127, 52, 508, 700]) P.slippNed(ci);
  let lavest = 0, sett = 0, borteVedTunnel = 0; const kjent = new Set(P.felt());
  for (let i = 0; i < 4000; i++) { K.steg(1 / 15, i / 15);
    for (const a of P.felt()) { if (a.tilstand === 'ut' || a.tilstand === 'borte') { sett++; lavest = Math.min(lavest, a.g.position.y); if (a.tilstand === 'borte' && a.g.position.x > I.GROFT_X1 - 1.5) borteVedTunnel++; } }
    if (borteVedTunnel > 0 && lavest < -3) break; }
  return { groft: I.GROFT, sett, lavest: +lavest.toFixed(2), borteVedTunnel: borteVedTunnel > 0, bunn: +I.groft(I.GROFT_X1 - 1, I.GROFT_Z).toFixed(2) }; })()`);
if (/[?&]groft=0/.test(process.argv[2] || '')) ok('?groft=0: den gamle utgangen uten hulvei (' + JSON.stringify(gr) + ')', !gr.groft && gr.lavest === 0 && gr.bunn === 0);
else ok('hulveien: matdyrene går ned skråningen og forsvinner i tunnelen (' + JSON.stringify(gr) + ')', gr.groft && gr.sett > 0 && gr.lavest < -3 && gr.borteVedTunnel);
console.log(feil.length ? feil : 'ingen feil i konsollen'); if (feil.length) process.exitCode = 1;
ws.close(); p.kill();
