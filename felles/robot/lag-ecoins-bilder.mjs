// Lager 2D-overlegg for E-coins-varene (ett per vare og spill) fra ecoins-tilbehor.js.
// Samme rutenett, kamera og lys som robotarkene i Fossil Zoo og Era Defenders, så laget passer rett over roboten.
// Kjør: node lag-ecoins-bilder.mjs <utmappe>   (gir fossil-<vare>.webp og era-<vare>.webp)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from './server.mjs';

const dir = path.dirname(new URL(import.meta.url).pathname);
const ut = path.resolve(process.argv[2] || path.join(dir, 'ut-ecoins'));
fs.mkdirSync(ut, { recursive: true });
const tider = (n, varighet, lokke = true) => Array.from({ length: n }, (_, i) => (lokke ? i / n : i / (n - 1)) * varighet);

const srv = await startServer(dir);
const nett = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const side = await nett.newPage();
side.on('pageerror', e => { console.error('feil i tegn.html:', e.message); process.exitCode = 1; });
await side.goto(`http://127.0.0.1:${srv.address().port}/tegn.html`);
await side.waitForFunction(() => window.klar, null, { timeout: 60000 });
const K = await side.evaluate(() => window.klippNavn);
const VARER = await side.evaluate(() => { const t = []; return t; });
const lagre = (navn, url) => { fs.writeFileSync(path.join(ut, navn), Buffer.from(url.split(',')[1], 'base64')); console.log('laget', navn); };

// Samme rammer som lag-bilder.mjs
const R = 1.15, fossil = [];
for (const t of tider(6, K.Idle)) fossil.push({ klipp: 'Idle', t, retning: R });
for (const t of tider(8, K.Walking)) fossil.push({ klipp: 'Walking', t, retning: R });
for (const t of tider(6, K.Punch, false)) fossil.push({ klipp: 'Punch', t, retning: R });
for (const t of tider(6, K.Jump, false)) fossil.push({ klipp: 'Jump', t, retning: R, juster: 'topp' });
const era = [];
for (const r of [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI]) {
  for (const t of tider(2, K.Idle)) era.push({ klipp: 'Idle', t, retning: r });
  for (const t of tider(6, K.Walking)) era.push({ klipp: 'Walking', t, retning: r });
  for (const t of tider(4, K.Punch * 0.7, false)) era.push({ klipp: 'Punch', t, retning: r });
}
const varer = process.argv.slice(3).length ? process.argv.slice(3) :
  ['vernehjelm','steinhette','ryggsekk','pirathatt','vikinghjelm','rod_kappe','svart_kappe','verktoybelte','ridderhjelm','faraokrone','romhjelm','oksygentank','trollmannshatt','stjernekappe','gullkrone'];
for (const vare of varer) {
  lagre(`fossil-${vare}.webp`, await side.evaluate(s => window.tegnArk(s), { F: 128, kol: 26, hoyde: 14, synlig: 1.218, fot: 0.95, rammer: fossil, kvalitet: 0.85, vare, kunTilbehor: true, ekstraTopp: 32 }));
  lagre(`era-${vare}.webp`, await side.evaluate(s => window.tegnArk(s), { F: 96, kol: 12, hoyde: 35, synlig: 1.4, fot: 0.9, rammer: era, kvalitet: 0.8, vare, kunTilbehor: true, ekstraTopp: 16 }));
}
await nett.close(); srv.close();
