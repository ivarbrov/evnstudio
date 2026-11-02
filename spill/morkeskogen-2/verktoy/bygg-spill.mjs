// Setter sammen Mørkeskogen 2.0 fra kilde/logikk-5x.js og kilde/grafikk-5x.js i opprinnelig rekkefølge.
// Kontrollerer at logikkblokkene er tegn for tegn like originalen (5.6.2) før noe skrives.
// I fase 0 er grafikken også uendret (gamle grafikk-5x.js). I fase 1 byttes grafikkblokkene, og logikkontrollen gjelder fortsatt.
//
// Bruk (fra repo-roten): node spill/morkeskogen-2/verktoy/bygg-spill.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ORIG = 'spill/morkeskogen/index.html', K = 'spill/morkeskogen-2/kilde', UT = 'spill/morkeskogen-2/spill';
const les = f => readFileSync(f, 'utf8');
function blokker(fil) {
  const m = new Map(), re = /\/\/#blokk (\d{4}) [^\n]*\n([\s\S]*?)\n\/\/#slutt\n/g; let x;
  while ((x = re.exec(les(fil)))) m.set(+x[1], x[2]);
  return m;
}
// logikk-5x.js og grafikk-5x.js er låste kopier av 5.6.2. Ny grafikk skrives i grafikk-2.js (samme blokknumre).
const L = blokker(`${K}/logikk-5x.js`), G0 = blokker(`${K}/grafikk-5x.js`), G = blokker(`${K}/grafikk-2.js`), rest = les(`${K}/rest.txt`);
for (const i of G.keys()) if (!G0.has(i)) throw new Error('grafikk-2.js har ukjent blokk ' + i);
const n = Math.max(...L.keys(), ...G.keys()) + 1;
let kropp = '';
for (let i = 0; i < n; i++) { const t = L.has(i) ? L.get(i) : G.get(i); if (t === undefined) throw new Error('Mangler blokk ' + i); kropp += t; }
kropp += rest;

// Kontroll mot originalen
const html = les(ORIG), START = '<script>\n(() => {\n', a = html.indexOf(START + 'const WS = 1.6'), SL = '\n})();\n</script>\n\n<!-- EVN Studio: avslutt-knapp', b = html.indexOf(SL);
const orig = html.slice(a + START.length, b + 1);
const sha = s => createHash('sha256').update(s).digest('hex');
// Logikk: hver logikkblokk skal finnes uendret på samme plass i originalen
let pos = 0, avvik = [];
let orig5x = '';
for (let i = 0; i < n; i++) { const t = L.has(i) ? L.get(i) : G0.get(i); if (L.has(i) && orig.slice(pos, pos + t.length) !== t) avvik.push(i); pos += t.length; orig5x += t; }
orig5x += rest;
const låstLik = orig5x === orig;                       // de låste kopiene er fortsatt nøyaktig 5.6.2
const endredeGrafikkblokker = [...G.keys()].filter(i => G.get(i) !== G0.get(i));
const helt = kropp === orig;
console.log(JSON.stringify({ logikkblokker: L.size, grafikkblokker: G.size, logikkUendret: avvik.length === 0 && låstLik, låsteKopierLikOriginal: låstLik, avvikendeLogikkblokker: avvik, endredeGrafikkblokker, heleSkriptetLikt: helt, sha256Original: sha(orig), sha256Bygd: sha(kropp) }, null, 1));
if (avvik.length || !låstLik) { console.error('STOPP: logikkblokker er endret'); process.exit(1); }

// Shader-erstatninger må treffe i r187
const sj = spawnSync('node', ['spill/morkeskogen-2/verktoy/sjekk-shader.mjs', `${K}/grafikk-2.js`], { encoding: 'utf8' });
console.log(sj.stdout.trim()); if (sj.status) { console.error('STOPP: shader-erstatning treffer ikke'); process.exit(1); }

// Skriv 2.0-utgaven: samme HTML, hovedskriptet som egen fil, stier ett nivå dypere
mkdirSync(UT, { recursive: true });
writeFileSync(`${UT}/spill.js`, '(() => {\n' + kropp + '})();\n');
writeFileSync(`${UT}/kompat-r187.js`, les(`${K}/kompat-r187.js`));
let ny = html.slice(0, a) + '<script src="spill.js"></script>' + html.slice(b + '\n})();\n</script>'.length);
ny = ny.replace(/"\.\.\/\.\.\//g, '"../../../').replace(/'\.\.\/\.\.\//g, "'../../../");
// three.js r187 (egen global build) + overgangslag
const R128 = '<script src="../../../vendor/three-r128.min.js"></script>';
if (!ny.includes(R128)) throw new Error('Fant ikke three-r128-taggen');
ny = ny.replace(R128, '<script src="../../../vendor/three-r187.global.js"></script>\n<script src="kompat-r187.js"></script>\n<script src="grafikk2.js"></script>');
// Grafikkjernen (moduler i grafikk/) pakkes med esbuild
const gb = spawnSync('node', ['spill/morkeskogen-2/grafikk/bygg.mjs'], { encoding: 'utf8' }); if (gb.status) { console.error(gb.stderr); process.exit(1); }
writeFileSync(`${UT}/index.html`, ny);
