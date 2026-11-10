// Spilltest for alternativ C bak ?fordeling=c: flagg, migrering av gamle lagringer, arvet kategori, salg, bytte,
// innlevering til Gårdsnivå, bestillingsregn og garanti, Óðinn-kallet og Matdyrboka.
// Bruk: python3 -m http.server 8790 i prototypemappen, så node spilltest-c.mjs [adresse uten spørrestreng]
import { spawn } from 'node:child_process'; import fs from 'node:fs';
const BASE = process.argv[2] || 'http://127.0.0.1:8790/index.html';
const prof = fs.mkdtempSync('/tmp/rute-c-'); const p = spawn('/usr/bin/google-chrome', ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + prof, '--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
for (const sg of ['SIGTERM', 'SIGINT']) process.on(sg, () => { try { p.kill('SIGKILL'); } catch {} process.exit(1); });
while (!fs.existsSync(prof + '/DevToolsActivePort')) await new Promise(r => setTimeout(r, 100));
const [port, sti] = fs.readFileSync(prof + '/DevToolsActivePort', 'utf8').split('\n'); const ws = new WebSocket('ws://127.0.0.1:' + port + sti); await new Promise(r => ws.onopen = r);
let id = 0; const v = new Map(), feil = []; ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && v.has(d.id)) { v.get(d.id)(d); v.delete(d.id); } else if (d.method === 'Runtime.exceptionThrown') feil.push(d.params.exceptionDetails.exception?.description); };
const send = (method, params = {}, sessionId) => new Promise(r => { const n = ++id; v.set(n, r); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' }); const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const s = (m, pp) => send(m, pp, sessionId); await s('Page.enable'); await s('Runtime.enable');
const ev = async x => { const r = await s('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (!r.result) throw new Error('CDP ' + JSON.stringify(r.error)); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600)); return r.result.result.value; };
async function gaaTil(q) { await s('Page.navigate', { url: BASE + q }); await new Promise(r => setTimeout(r, 300)); for (let i = 0; i < 150 && !(await ev('!!window.EVNKlar').catch(() => false)); i++) await new Promise(r => setTimeout(r, 200)); await ev(`(async () => { EVNVis({ fane: 'spill' }); await new Promise(r => setTimeout(r, 300)); })()`); }
// Lagringer settes fra en side på samme opphav som ikke er spillet, så spillets lagring ved pagehide ikke overskriver dem
async function paaNoytral(js) { await s('Page.navigate', { url: new URL('modeller/', BASE).href }); await new Promise(r => setTimeout(r, 500)); return ev(js); }
const ok = (navn, b, info) => { console.log((b ? 'OK   ' : 'FEIL ') + navn + (b || info === undefined ? '' : '  ' + JSON.stringify(info).slice(0, 400))); if (!b) process.exitCode = 1; };
const STD = 'evn-matdyr-gard-proto', CK = 'evn-matdyr-gard-proto-c';

// 1. Uten flagg: dagens fordeling og nøkkel
await gaaTil('');
const a = await ev(`({ n: EVNMatdyrData.POOLS.map(p => p.length).join('/'), f: EVNMatdyrData.FORDELING, k: EVNProto.NOKKEL, erc: EVNProto.ERC })`);
ok('uten flagg: dagens fordeling (428/291/158/80/41/1/1) og standardnøkkel', a.n === '428/291/158/80/41/1/1' && a.f === 'standard' && a.k === STD && !a.erc, a);

// Lag en gammel standardlagring (gammel fordeling) med dyr som går opp, ett som går ned, to like, en hval som blir Mythic
const g = await ev(`(() => { const D = EVNMatdyrData, ids = D.COMBOS.map((c, i) => i);
  const opp = ids.filter(i => D.NY_R[i] > D.GML_R[i]), ned = ids.filter(i => D.NY_R[i] < D.GML_R[i]), lik = ids.filter(i => D.NY_R[i] === D.GML_R[i]);
  const hval = ids.filter(i => D.COMBOS[i].art === 'hval' && D.GML_R[i] < 4 && D.NY_R[i] >= 4)[0];
  const pap = ids.filter(i => D.COMBOS[i].art === 'papegøye' && D.GML_R[i] < 3 && D.NY_R[i] >= 3)[0];
  const base = [opp[0], opp[1], ned[0], lik[3], lik[3], hval, pap, opp[50], -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
  const s = { v: 1, penger: 1234567, gard: { niva: 6 }, plassNiva: 12, base, disc: [...new Set([...base.filter(c => c >= 0), ...D.POOLS[5].slice(0, 1)])], bestilling: 10 };
  const inc = base.reduce((t, ci) => t + (ci >= 0 ? D.INC(ci) : 0), 0);
  return { s, inc, opp, ned, hval, pap }; })()`);
g.raw = await paaNoytral(`localStorage.setItem('${STD}', ${JSON.stringify(JSON.stringify(g.s))}); localStorage.removeItem('${CK}'); localStorage.getItem('${STD}')`);

// 2. Med flagg: første start migrerer standardlagringen
await gaaTil('?fordeling=c');
const b = await ev(`(() => { const P = EVNProto, D = EVNMatdyrData, S = P.S();
  return { n: D.POOLS.map(p => p.length).join('/'), k: P.NOKKEL, S: JSON.parse(JSON.stringify(S)), std: localStorage.getItem('${STD}'), c: JSON.parse(localStorage.getItem('${CK}') || 'null'),
    inc: S.base.reduce((t, ci, i) => t + P.incB(i), 0), r: S.base.map((ci, i) => P.rB(i)), gml: S.base.map(ci => ci >= 0 ? D.GML_R[ci] : -1), ny: S.base.map(ci => ci >= 0 ? D.COMBOS[ci].r : -1),
    hud: document.getElementById('hNiva') && document.getElementById('hNiva').textContent }; })()`);
ok('med flagg: fordeling C (240/200/200/160/120/40/40) og egen nøkkel', b.n === '240/200/200/160/120/40/40' && b.k === CK, b.n);
ok('gammel lagring: penger, gårdsnivå, plasser, bestilling og base uendret', b.S.penger >= g.s.penger && Math.abs(b.S.penger - g.s.penger) < g.inc * 30 && b.S.gard.niva === 6 && b.S.plassNiva === 12 && b.S.bestilling === 10 && JSON.stringify(b.S.base) === JSON.stringify(g.s.base));
ok('gammel lagring: alle funn (disc) beholdes', JSON.stringify(b.S.disc) === JSON.stringify(g.s.disc));
ok('streng bestefarsregel: hvert eid dyr har gammel kategori', JSON.stringify(b.r) === JSON.stringify(b.gml), { r: b.r, gml: b.gml });
ok('arv lagres bare der gammel og ny kategori er ulike', Object.keys(b.S.arv).length === b.gml.filter((r, i) => r >= 0 && r !== b.ny[i]).length && b.S.arv[3] === undefined && b.S.arv[4] === undefined);
ok('inntekt etter migrering er lik inntekten før', b.inc === g.inc, { før: g.inc, etter: b.inc });
ok('standardlagringen er urørt (byte for byte)', b.std === g.raw);
ok('migrert lagring er skrevet til testnøkkelen', b.c && b.c.fordeling === 'c' && b.c.migrert && JSON.stringify(b.c.arv) === JSON.stringify(b.S.arv));
ok('HUD viser «Fordeling C»', /Fordeling C/.test(b.hud || ''));

// 3. Ny start: leser testlagringen, importerer ikke på nytt
await paaNoytral(`localStorage.setItem('${STD}', JSON.stringify({ v: 1, penger: 5, gard: { niva: 1 }, plassNiva: 0, base: [], disc: [] }))`);
await gaaTil('?fordeling=c');
const c = await ev(`(() => { const S = EVNProto.S(); return { penger: Math.floor(S.penger), arv: S.arv }; })()`);
ok('ny start: testlagringen brukes, standardlagringen importeres ikke igjen', c.penger >= g.s.penger && JSON.stringify(c.arv) === JSON.stringify(b.S.arv), c);

// 4. Salg av dyr med arv: halv gammel pris, arven fjernes
const d = await ev(`(async () => { const P = EVNProto, D = EVNMatdyrData, S = P.S(), i = 0, ci = S.base[i], ut = {};
  ut.prisB = P.prisB(i); ut.gml = D.PRICEr(ci, D.GML_R[ci]); ut.ny = D.PRICE(ci); const før = S.penger;
  EVNIntern.krok.fane('spill'); const R = EVNRobot(); const q = EVNIntern.plassPos(i); R.position.set(q.x + 0.4, q.y + 0.45, q.z); EVNIntern.krok.steg(1/30, 0);
  const h = P.finnHandling(); ut.h = h && h.t; P.gjorHandling(); await new Promise(r => setTimeout(r, 50));
  ut.tekst = document.getElementById('dialogInnhold').innerText; const førKlikk = P.S().penger; document.getElementById('dJa').click();
  ut.diff = Math.round(P.S().penger - førKlikk); ut.base = P.S().base[i]; ut.arv = P.S().arv[i]; ut.lagret = JSON.parse(localStorage.getItem(P.NOKKEL)).arv[i];
  return ut; })()`);
ok('salg av dyr med arvet kategori gir halv GAMMEL pris', d.h === 'selg' && d.prisB === d.gml && d.ny !== d.gml && d.diff === Math.floor(d.gml / 2), d);
ok('salgsvinduet viser «eldre utgave»', /eldre utgave/.test(d.tekst), d.tekst);
ok('etter salg: plassen er tom og arven er borte (også i lagringen)', d.base === -1 && d.arv === undefined && d.lagret === undefined);

// 5. Gårdsnivå 6 → 7 (2 papegøye Legendary+, 1 neshorn Legendary+): papegøye med arv teller ikke, ny utgave teller
const e = await ev(`(async () => { const P = EVNProto, D = EVNMatdyrData, ut = {};
  const pap = ${g.pap}, papNy = D.COMBOS.findIndex((c, i) => c.art === 'papegøye' && c.r === 3 && i !== pap), nes = D.COMBOS.findIndex(c => c.art === 'neshorn' && c.r === 3);
  const base = [pap, papNy, nes, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
  P.sett({ v: 1, fordeling: 'c', penger: 2e7, gard: { niva: 6 }, plassNiva: 12, base, disc: [pap, papNy, nes], arv: { 0: D.GML_R[pap] }, bestilling: 15 });
  ut.arv0 = P.rB(0); P.apneGardsniva(); ut.auto = P.valg().map(v => v.slice()); ut.videre = !document.getElementById('dVidere').disabled;
  ut.tekst = document.getElementById('dialogInnhold').innerText;
  const chips = [...document.querySelectorAll('.brikke')].map(b => +b.dataset.i); ut.papChip = chips.includes(0);
  // tving inn papegøyen med arv i valget: kontrollen skal avvise
  P.valg()[0] = [0, 1]; P.valg()[1] = [2]; ut.kontroll = P.kontroller(7);
  // legg inn en ny papegøye (uten arv) og lever
  P.S().base[3] = D.COMBOS.findIndex((c, i) => c.art === 'papegøye' && c.r === 4); P.S().disc.push(P.S().base[3]);
  P.apneGardsniva(); ut.auto2 = P.valg().map(v => v.slice());
  P.valg()[0] = [1, 3]; P.valg()[1] = [2]; ut.ok2 = P.oppgrader();   // den nye Mythic-papegøyen velges ikke automatisk (sjeldnere enn kravet), så den velges for hånd
  ut.etter = { niva: P.S().gard.niva, base: P.S().base.slice(0, 4), arv: P.S().arv, lagretArv: JSON.parse(localStorage.getItem(P.NOKKEL)).arv };
  return ut; })()`);
ok('Gårdsnivå: papegøye med arvet lav kategori tilbys ikke og teller ikke', e.arv0 < 3 && !e.papChip && !e.videre && e.auto[0].length === 1, e);
ok('Gårdsnivå: kontrollen avviser et dyr med for lav arvet kategori', /passer ikke/.test(e.kontroll || ''), e.kontroll);
ok('Gårdsnivå: innlevering med ny utgave virker; dyret med arv blir igjen med arven', e.ok2 === true && e.etter.niva === 7 && e.etter.base[1] === -1 && e.etter.base[2] === -1 && e.etter.base[3] === -1 && e.etter.arv[0] !== undefined && JSON.stringify(e.etter.lagretArv) === JSON.stringify(e.etter.arv), e);

// 6. Innlevering av et dyr med arvet HØY kategori (Donutkatt var Rare, er Common): teller som Rare
const f = await ev(`(async () => { const P = EVNProto, D = EVNMatdyrData, ut = {};
  const ned = ${JSON.stringify(g.ned)}; const sau = D.COMBOS.findIndex(c => c.art === 'sau' && c.r === 1), sk = D.COMBOS.findIndex(c => c.art === 'skilpadde' && c.r === 0);
  // nivå 2 → 3 krever 2 sau Rare+ og 1 skilpadde. Lag et krav med katt for testen: bruk nivå 3 → 4 (1 katt Epic+, 2 høne Rare+)
  const hon = D.COMBOS.map((c, i) => i).filter(i => D.COMBOS[i].art === 'høne' && D.COMBOS[i].r === 1);
  P.sett({ v: 1, fordeling: 'c', penger: 1e6, gard: { niva: 3 }, plassNiva: 8, base: [ned[0], hon[0], hon[1], D.COMBOS.findIndex(c => c.art === 'katt' && c.r === 2), D.COMBOS.findIndex(c => c.art === 'ku' && c.r === 0), -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], disc: [], arv: { 0: D.GML_R[ned[0]] }, bestilling: 15 });
  ut.r0 = P.rB(0); ut.ny0 = D.COMBOS[ned[0]].r; ut.inc0 = P.incB(0); ut.incNy = D.INC(ned[0]); ut.svakeste = P.svakeste();
  return ut; })()`);
ok('dyr som gikk ned i ny tabell beholder høyere arvet kategori og inntekt', f.r0 === 1 && f.ny0 === 0 && f.inc0 > f.incNy, f);
ok('«svakeste» bruker arvet inntekt (en Common-ku er svakere enn Donutkatt med arvet Rare)', f.svakeste === 4, f);

// 7. Bestilling 0 % = ingen styring (heller ikke garanti). Garanti på, nivå 1 → 2 (ku og gris)
const h = await ev(`(() => { const P = EVNProto, D = EVNMatdyrData, ut = {};
  P.sett({ v: 1, fordeling: 'c', penger: 60, gard: { niva: 1 }, plassNiva: 0, base: [-1, -1, -1, -1], disc: [], arv: {}, bestilling: 0 }); P.garanti(true);
  let n = 0; const N = 4000; for (let k = 0; k < N; k++) { const ci = P.trekk(); if (['ku', 'gris'].includes(D.COMBOS[ci].art)) n++; } ut.andel0 = n / N;
  P.S().bestilling = 15; n = 0; for (let k = 0; k < N; k++) { const ci = P.trekk(); if (['ku', 'gris'].includes(D.COMBOS[ci].art)) n++; } ut.andel15 = n / N;
  return ut; })()`);
ok('bestilling 0 %: ingen styring, heller ikke garanti (ku+gris ≈ 2/40 = 5 %)', h.andel0 < 0.075, h);
ok('bestilling 15 % med garanti styrer fortsatt', h.andel15 > 0.15, h);

// 8. Garantien løfter aldri over Legendary: nivå 7 → 8 trenger frosk Mythic
const i8 = await ev(`(() => { const P = EVNProto, D = EVNMatdyrData, ut = {};
  P.sett({ v: 1, fordeling: 'c', penger: 1e8, gard: { niva: 7 }, plassNiva: 14, base: new Array(32).fill(-1), disc: [], arv: {}, bestilling: 15 }); P.garanti(true);
  const N = 6000, t = new Array(7).fill(0); let froskM = 0; for (let k = 0; k < N; k++) { const ci = P.trekk(); t[D.COMBOS[ci].r]++; if (D.COMBOS[ci].art === 'frosk' && D.COMBOS[ci].r >= 4) froskM++; }
  ut.mythicPluss = (t[4] + t[5] + t[6]) / N; ut.froskM = froskM; return ut; })()`);
ok('garanti: andelen Mythic+ følger vektene (≈ 9,6 %), ingen løfting', i8.mythicPluss < 0.12 && i8.froskM > 0, i8);

// 9. Óðinn-kallet
const j = await ev(`(async () => { const P = EVNProto, D = EVNMatdyrData, ut = {}; const fg = D.POOLS[5].filter(ci => ci !== P.ODIN);
  const sett = disc => P.sett({ v: 1, fordeling: 'c', penger: 2e8, gard: { niva: 9 }, plassNiva: 18, base: new Array(40).fill(-1), disc, arv: {}, bestilling: 0 });
  sett(fg.slice(0, 2)); ut.aktiv2 = P.kallAktiv(); ut.klart2 = P.kallKlart();
  let odin = 0, fgN = 0; for (let k = 0; k < 20000; k++) { const ci = P.trekk(); if (D.COMBOS[ci].r === 5) { fgN++; if (ci === P.ODIN) odin++; } } ut.odin2 = odin; ut.fg2 = fgN;
  sett(fg.slice(0, 3)); ut.klart3 = P.kallKlart(); odin = 0; fgN = 0; for (let k = 0; k < 20000; k++) { const ci = P.trekk(); if (D.COMBOS[ci].r === 5) { fgN++; if (ci === P.ODIN) odin++; } } ut.odin3 = odin; ut.fg3 = fgN;
  P.apneGardsniva(); ut.tekst = document.getElementById('dialogInnhold').innerText; document.getElementById('dLukk').click();
  // når Óðinn er i gården, er kallet ikke aktivt lenger
  P.S().base[0] = P.ODIN; ut.aktivMedOdin = P.kallAktiv();
  sett(fg.slice(0, 3)); P.S().gard.niva = 8; ut.aktivNiva8 = P.kallAktiv();
  return ut; })()`);
ok('Óðinn-kall: med 2 Food God funnet er kallet ikke klart, og Óðinn er sjelden', j.aktiv2 && !j.klart2 && j.odin2 < j.fg2 * 0.2, j);
ok('Óðinn-kall: med 3 Food God funnet blir hver Food God som faller, Óðinn', j.klart3 && j.odin3 === j.fg3 && j.fg3 > 100, j);
ok('Óðinn-kall vises i Gårdsnivå-vinduet', /Óðinn-kallet: 3\/3/.test(j.tekst), j.tekst.slice(0, 300));
ok('Óðinn-kall er bare aktivt på vei til nivå 10 og når Óðinn mangler', !j.aktivMedOdin && !j.aktivNiva8, j);

// 10. Matdyrboka for ku: 25 ruter i 7 rader, funn og eldre utgave
const k = await ev(`(async () => { const P = EVNProto, D = EVNMatdyrData, ut = {};
  const ku = D.COMBOS.map((c, i) => i).filter(i => D.COMBOS[i].art === 'ku'), opp = ku.find(i => D.GML_R[i] < D.NY_R[i]);
  const fg = ku.find(i => D.COMBOS[i].r === 5), se = ku.find(i => D.COMBOS[i].r === 6);
  const vanlig = ku.find(i => D.COMBOS[i].r === 0 && i !== opp);
  P.sett({ v: 1, fordeling: 'c', penger: 1, gard: { niva: 3 }, plassNiva: 4, base: [opp, -1, -1, -1], disc: [opp, fg, vanlig], arv: { 0: D.GML_R[opp] }, bestilling: 15 });
  P.apneBok('ku'); await new Promise(r => setTimeout(r, 30)); const d = document.getElementById('dialogInnhold');
  ut.ruter = d.querySelectorAll('.bokrute').length; ut.rader = d.querySelectorAll('.bokrad').length; ut.funnet = d.querySelectorAll('.bokrute:not(.ukjent)').length;
  ut.gud = d.querySelectorAll('.bokrute.gud').length; ut.skjult = d.querySelectorAll('.bokrute.skjult').length; ut.arv = d.querySelectorAll('.arvmerke').length;
  ut.tekst = d.innerText.slice(0, 200); ut.radTekst = [...d.querySelectorAll('.bokrad')].map(x => x.innerText.replace(/\\s+/g, ' ')); document.getElementById('dLukk').click();
  return ut; })()`);
ok('Matdyrboka: 25 ruter i 7 kategorirader (6/5/5/4/3/1/1)', k.ruter === 25 && k.rader === 7 && /\/6/.test(k.radTekst[0]) && /\/1/.test(k.radTekst[6]), k);
ok('Matdyrboka: tidligere funn teller, Food God får gullramme, Secret er skjult', k.funnet === 3 && k.gud === 1 && k.skjult === 1, k);
ok('Matdyrboka: eid eldre utgave vises med ⏳', k.arv === 1, k);

// 11. Ødelagt testlagring: tas vare på, og standardlagringen migreres
await paaNoytral(`localStorage.setItem('${CK}', '{ødelagt'); localStorage.setItem('${STD}', ${JSON.stringify(JSON.stringify(g.s))})`);
await gaaTil('?fordeling=c');
const l = await ev(`({ kopi: localStorage.getItem('${CK}-ugyldig'), niva: EVNProto.S().gard.niva, arv: Object.keys(EVNProto.S().arv).length })`);
ok('ødelagt testlagring tas vare på (-ugyldig), og standardlagringen migreres', l.kopi === '{ødelagt' && l.niva === 6 && l.arv > 0, l);

// 12. Uten flagg igjen: standardlagringen og spillet er som før
await gaaTil('');
const m = await ev(`({ n: EVNMatdyrData.POOLS.map(p => p.length).join('/'), niva: EVNProto.S().gard.niva, arv: EVNProto.S().arv })`);
ok('uten flagg etterpå: dagens fordeling, standardlagringen brukes, ingen arv', m.n === '428/291/158/80/41/1/1' && m.niva === 6 && m.arv === undefined, m);

console.log(feil.length ? 'Konsollfeil:\n' + feil.slice(0, 6).join('\n') : 'Ingen konsollfeil');
if (feil.length) process.exitCode = 1;
ws.close(); p.kill(); process.exit(process.exitCode || 0);
