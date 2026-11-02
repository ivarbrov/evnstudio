// Kontroll: alle shader-erstatninger (.replace(...)) i grafikkoden må finne teksten sin i three.js r187. Ellers forsvinner effekten uten feilmelding.
// Bruk (fra repo-roten): node spill/morkeskogen-2/verktoy/sjekk-shader.mjs spill/morkeskogen-2/kilde/grafikk-2.js
import * as THREE from '../prototype/node_modules/three/build/three.module.js';
import { readFileSync } from 'node:fs';
const src = readFileSync(process.argv[2], 'utf8');
const libs = Object.values(THREE.ShaderLib).flatMap(l => [l.vertexShader, l.fragmentShader]).join('\n');
let n = 0; const feil = [];
for (const [i, linje] of src.split('\n').entries()) {
  for (const x of linje.matchAll(/\.replace\(\s*'((?:\\'|[^'])*)'/g)) {
    if (!/#include|gl_|vec[234]|void main|uniform |varying /.test(x[1])) continue;
    const t = x[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\'/g, "'"); n++;
    if (!libs.includes(t)) feil.push(`${i + 1}: ${t.slice(0, 90)}`);
  }
}
console.log('erstatninger sjekket:', n, 'mangler i r' + THREE.REVISION + ':', feil.length); console.log(feil.join('\n'));
if (feil.length) process.exit(1);
