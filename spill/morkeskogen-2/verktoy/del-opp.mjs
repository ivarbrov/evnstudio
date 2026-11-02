// Fase 0: deler hovedskriptet i Mørkeskogen 5.6.2 i logikk og grafikk, ORDRETT.
// Hver toppnivå-setning i hoved-IIFE-en blir en nummerert blokk (med kommentarene foran).
// Byggesteget (bygg-spill.mjs) setter blokkene sammen i opprinnelig rekkefølge, og kontrollerer at resultatet
// er tegn for tegn likt originalen. Da er det bevist at flyttingen ikke har endret spillogikken.
//
// Bruk (fra repo-roten): node spill/morkeskogen-2/verktoy/del-opp.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const acorn = require('../prototype/node_modules/acorn');

const KILDE = 'spill/morkeskogen/index.html', UT = 'spill/morkeskogen-2/kilde';
const html = readFileSync(KILDE, 'utf8');
const START = '<script>\n(() => {\nconst WS = 1.6', SLUTT = '\n})();\n</script>\n\n<!-- EVN Studio: avslutt-knapp';
const a = html.indexOf(START), b = html.indexOf(SLUTT);
if (a < 0 || b < 0) throw new Error('Fant ikke hovedskriptet');
const kroppStart = a + '<script>\n(() => {\n'.length, kropp = html.slice(kroppStart, b + 1);  // med siste linjeskift
const ast = acorn.parse('(() => {\n' + kropp + '})();', { ecmaVersion: 'latest', sourceType: 'script' });
const setninger = ast.body[0].expression.callee.body.body, off = '(() => {\n'.length;

// Klassifisering: grafikk = bruker THREE/R3 og er ikke en kjent logikkfunksjon. Alt annet er logikk (inkl. grensesnitt).
const LOGIKK_NAVN = /^(update\w*|newGame\w*|start|gameOver|menuAction|resize|applyQuality|nearestEnemyInCone|toScreen|nullstillZoom|loop|fpsWatch|saveHero|saveWorld|camAim|camRotate|camZoom|VW)$/;   // styring, kameratilstand og felles tilstand er logikk (koblingspunkter)
const GRAFIKK_NAVN = /^(HERO_MESH|draw|render\w*|make\w*|build\w*|initR3|hero(Mats|BodyMats|Head)|buildHair|treeMats|leafAtlas|groundTexture|setCap|cTex|mk|cone|lam|.*Tex|.*Mat|.*Geo)$/;
function navnPå(s) {
  if (s.type === 'FunctionDeclaration') return s.id.name;
  if (s.type === 'VariableDeclaration') return s.declarations.map(d => d.id.name || '(mønster)').join(',');
  return null;
}
function tellRef(s) { const t = kropp.slice(s.start - off, s.end - off); return (t.match(/\bTHREE\./g) || []).length + (t.match(/\bR3\b/g) || []).length; }
let forrige = 0;
const blokker = setninger.map((s, i) => {
  const slutt = s.end - off, tekst = kropp.slice(forrige, slutt); forrige = slutt;
  const navn = navnPå(s), ref = tellRef(s);
  let del = 'logikk';
  if (navn && GRAFIKK_NAVN.test(navn.split(',')[0])) del = 'grafikk';
  else if (s.type === 'ExpressionStatement') del = 'logikk';                       // hendelser og oppstart (styring/grensesnitt)
  else if (ref > 0 && !(navn && LOGIKK_NAVN.test(navn.split(',')[0]))) del = 'grafikk';
  return { nr: i, navn: navn || s.type, del, ref, tekst, linjer: tekst.split('\n').length - 1 };
});
const rest = kropp.slice(forrige);   // avsluttende linjeskift/kommentarer
mkdirSync(UT, { recursive: true });
for (const del of ['logikk', 'grafikk']) {
  const deler = blokker.filter(x => x.del === del).map(x => `//#blokk ${String(x.nr).padStart(4, '0')} ${x.navn}\n` + x.tekst + '\n//#slutt\n');
  writeFileSync(`${UT}/${del}-5x.js`, `// Mørkeskogen 2.0 – ${del} fra 5.6.2 (ordrett). IKKE rediger blokkene i fase 0: bygg-spill.mjs kontrollerer at de er uendret.\n` + deler.join(''));
}
writeFileSync(`${UT}/rest.txt`, rest);
const sha = createHash('sha256').update(kropp).digest('hex');
const sum = d => blokker.filter(x => x.del === d);
const rapport = {
  kilde: KILDE, sha256Hovedskript: sha, blokker: blokker.length,
  logikk: { blokker: sum('logikk').length, linjer: sum('logikk').reduce((a, x) => a + x.linjer, 0) },
  grafikk: { blokker: sum('grafikk').length, linjer: sum('grafikk').reduce((a, x) => a + x.linjer, 0) },
  koblingspunkter: blokker.filter(x => x.del === 'logikk' && x.ref > 0).map(x => ({ nr: x.nr, navn: x.navn, ref: x.ref })),
};
writeFileSync(`${UT}/oppdeling.json`, JSON.stringify(rapport, null, 1));
console.log(JSON.stringify(rapport, null, 1));
