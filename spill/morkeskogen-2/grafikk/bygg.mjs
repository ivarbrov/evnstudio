// Bygger grafikkjernen til spill/morkeskogen-2/spill/grafikk2.js. 'three' hentes fra den globale THREE (vendor/three-r187.global.js).
// Bruk (fra repo-roten): node spill/morkeskogen-2/grafikk/bygg.mjs
import { build } from '../prototype/node_modules/esbuild/lib/main.js';
const globalThree = {
  name: 'global-three',
  setup(b) {
    b.onResolve({ filter: /^three$/ }, () => ({ path: 'three', namespace: 'global-three' }));
    b.onLoad({ filter: /.*/, namespace: 'global-three' }, () => ({ contents: 'module.exports = window.THREE;', loader: 'js' }));
  },
};
await build({
  entryPoints: ['spill/morkeskogen-2/grafikk/index.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',
  outfile: 'spill/morkeskogen-2/spill/grafikk2.js', plugins: [globalThree], legalComments: 'external',
  nodePaths: ['spill/morkeskogen-2/prototype/node_modules'],
});
console.log('grafikk2.js bygget');
