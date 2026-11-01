// Enhetstest av ytelsestesten med simulerte bildetider (ingen nettleser). Kjør: npm test
import { lagYtelsestest } from '../src/ytelsestest.js';
const lyttere = {}; let skjult = false, klokke = 0;
globalThis.document = { get hidden() { return skjult; }, addEventListener: (t, f) => (lyttere[t] = f), removeEventListener: () => {} };
globalThis.addEventListener = (t, f) => (lyttere[t] = f); globalThis.removeEventListener = () => {};
globalThis.matchMedia = () => ({ matches: true });            // «mobil» → mål 30 FPS
globalThis.performance = { now: () => klokke };
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'test' }, configurable: true });
Object.assign(globalThis, { innerWidth: 393, innerHeight: 723, devicePixelRatio: 3, screen: { width: 393, height: 852 }, window: globalThis });
globalThis.self = globalThis; globalThis.top = globalThis;
function kjørTest(varme, bilder, hendelse, arbeid = 2) {
  let rapport = null;
  const yt = lagYtelsestest({ renderer: { getContext: () => null, getPixelRatio: () => 1.5 }, versjon: 'test', stil: () => 2, kvalitet: () => 'Middels', forbered() {}, status() {}, vis: r => (rapport = r) });
  return yt.kjør(varme).then(() => { let n = 0; for (const dt of bilder()) { klokke += dt; if (hendelse) hendelse(n, yt); yt.steg(dt, arbeid); n++; if (rapport) break; } return rapport; });
}
const gjenta = function* (dt, sek) { for (let t = 0; t < sek * 1000; t += dt) yield dt; };
const tilfeller = {
  '10 min stabilt 60 FPS → BESTÅTT': [true, () => gjenta(1000 / 60, 610), null, r => r.status === 'BESTÅTT' && r.aktivTestTidS >= 600 && r.resultater[0].minutter.filter(m => m.helt).length === 10],
  'Evens iPhone-mønster: 163 s, så 840 s pause → UGYLDIG, ingen null-minutter': [true, function* () { yield* gjenta(1000 / 60, 163); yield 840000; yield* gjenta(1000 / 60, 10); }, null,
    r => r.status === 'UGYLDIG TEST' && r.aktivTestTidS < 170 && r.gyldigeMålinger === 0 && !JSON.stringify(r.resultater).includes('null') && r.resultater[0].fps > 59],
  'Skjult side (visibilitychange) → UGYLDIG': [true, () => gjenta(1000 / 60, 100), (n) => { if (n === 3000) { skjult = true; lyttere.visibilitychange(); skjult = false; } }, r => r.status === 'UGYLDIG TEST' && /skjult/i.test(r.begrunnelse)],
  'Ekte lav FPS (25) i 10 min → IKKE BESTÅTT, ikke ugyldig': [true, () => gjenta(40, 610), null, r => r.status === 'IKKE BESTÅTT' && Math.abs(r.resultater[0].fps - 25) < .5],
  'Hakk på 300 ms teller som tregt bilde, ikke avbrudd': [false, function* () { for (let i = 0; i < 4600; i++) yield i % 500 === 0 ? 300 : 1000 / 60; }, null, r => r.status === 'BESTÅTT' && r.resultater.every(x => x.hakk > 0)],
  'iOS-struping før stopp (frametid 250–2000 ms) → UGYLDIG': [true, function* () { yield* gjenta(1000 / 60, 180); for (let i = 0; i < 20; i++) yield 250 + i * 90; yield 840000; }, null, r => r.status === 'UGYLDIG TEST'],
  'Gammel v1-feil gjentas ikke: aldri «10 min» uten 600 s aktiv tid': [true, function* () { yield* gjenta(1000 / 60, 300); yield 400; yield* gjenta(1000 / 60, 320); }, null, r => r.status === 'BESTÅTT' && r.aktivTestTidS >= 600 && r.resultater[0].hakk === 1],
  'Svært treg, men ekte tegning (600 ms bilder med 550 ms arbeid) → IKKE BESTÅTT, ikke UGYLDIG': [false, () => gjenta(600, 140), null, r => r.status === 'IKKE BESTÅTT', 550],
  'Skjermkortbundet treghet (700 ms bilder, lite JS-arbeid, vedvarende) → IKKE BESTÅTT': [false, () => gjenta(700, 170), null, r => r.status === 'IKKE BESTÅTT', 5],
  'Ett langt bilde etter normale bilder uten arbeid (stopp) → UGYLDIG': [false, function* () { yield* gjenta(1000 / 60, 20); yield 1500; yield* gjenta(1000 / 60, 60); }, null, r => r.status === 'UGYLDIG TEST', 2],
  '1-minutt-test med 30 FPS på mobil → BESTÅTT': [false, () => gjenta(1000 / 30.5, 80), null, r => r.status === 'BESTÅTT' && r.merknader.some(m => /30 FPS/.test(m))],
};
let feil = 0;
for (const [navn, [varme, bilder, h, ok, arbeid]] of Object.entries(tilfeller)) {
  const r = await kjørTest(varme, bilder, h, arbeid);
  const bestått = r && ok(r);
  if (!bestått) feil++;
  console.log((bestått ? '✔' : '✘') + ' ' + navn + (r ? `  [${r.status}, aktiv ${r.aktivTestTidS} s, fps ${r.resultater.map(x => x.fps).join('/')}]` : '  [ingen rapport]'));
}
process.exit(feil ? 1 : 0);
