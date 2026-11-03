// Lager en selvstendig testkopi av 2.0-spillet for publisering som artefakt (iPhone-test).
// - ingen statistikk (GoatCounter) – testtrafikk skal ikke telles
// - three.js, overgangslag og grafikkjerne kopieres inn; roboten legges inn som base64 (artefakter kan ikke servere .glb)
// - testpanel: kamera nytt/original, robot-FPS-måling (60 s), tegnekall og antall tonede trær
// - lagring: artefakten har egen nettleserlagring (eget domene), så ekte lagringer på evnstudio.no berøres ikke
// Bruk (fra repo-roten): node spill/morkeskogen-2/verktoy/lag-testkopi.mjs   → spill/morkeskogen-2/testkopi/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const S = 'spill/morkeskogen-2/spill', U = 'spill/morkeskogen-2/testkopi';
mkdirSync(U, { recursive: true });
let h = readFileSync(`${S}/index.html`, 'utf8');
const bytt = (a, b) => { if (!h.includes(a)) throw new Error('fant ikke: ' + a); h = h.split(a).join(b); };
bytt('<script src="../../../statistikk.js" data-spill="morkeskogen" defer></script>', '');
bytt('<script src="../../../vendor/three-r187.global.js"></script>', '<script src="three-r187.global.js"></script>');
bytt('<script src="grafikk2.js"></script>', '<script src="helt-data.js"></script>\n<script src="grafikk2.js"></script>');
bytt('<script src="spill.js"></script>', '<script src="spill.js"></script>\n<script src="testpanel.js"></script>');
h = h.replace(/(href|src|srcset)="\.\.\/\.\.\/\.\.\/[^"]*"/g, (m, a) => a === 'href' && /fonter|favicon/.test(m) ? '' : m.includes('bilder/') ? `${a}=""` : `${a}="#"`).replace(/'\.\.\/\.\.\/\.\.\/'/g, "'#'");
h = h.replace('<title>', '<title>TEST 2.0 – ');
writeFileSync(`${U}/index.html`, h);
// Spillet: samme fil, pluss en lesekrok for testpanelet (bare grafikkobjekter og tellere; endrer ingenting)
writeFileSync(`${U}/spill.js`, readFileSync(`${S}/spill.js`, 'utf8').replace('(() => {\n', '(() => {\nwindow.__testR3 = () => R3; window.__testG = () => g;\n'));
for (const f of ['kompat-r187.js', 'grafikk2.js', 'hud2.css', 'hud2.js']) copyFileSync(`${S}/${f}`, `${U}/${f}`);
copyFileSync('vendor/three-r187.global.js', `${U}/three-r187.global.js`);
writeFileSync(`${U}/helt-data.js`, 'window.EVN_HELT_B64 = "' + readFileSync(`${S}/modeller/helt-robot.glb`).toString('base64') + '";\n');
copyFileSync('spill/morkeskogen-2/verktoy/testpanel.js', `${U}/testpanel.js`);
console.log('testkopi laget i', U);
