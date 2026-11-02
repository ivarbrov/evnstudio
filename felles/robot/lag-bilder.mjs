// Lager alle 2D-bilder av EVN-roboten fra den felles 3D-modellen.
// Kjør: npm install && node lag-bilder.mjs [utmappe]
// Gir: fossil-ark.webp (Fossil Zoo), era-ark.webp (Era Defenders), og PNG-råbilder til nettsiden (beskjæres av lag-web.py).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { startServer } from './server.mjs';

const dir = path.dirname(new URL(import.meta.url).pathname);
const ut = path.resolve(process.argv[2] || path.join(dir, 'ut'));
fs.mkdirSync(ut, { recursive: true });

// Jevnt fordelte tidspunkt i et klipp (løkke: siste bilde = første, så det tas ikke med)
const tider = (n, varighet, lokke = true) => Array.from({ length: n }, (_, i) => (lokke ? i / n : i / (n - 1)) * varighet);

const srv = await startServer(dir);
const nett = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const side = await nett.newPage();
side.on('pageerror', e => { console.error('feil i tegn.html:', e.message); process.exitCode = 1; });
await side.goto(`http://127.0.0.1:${srv.address().port}/tegn.html`);
await side.waitForFunction(() => window.klar, null, { timeout: 60000 });
const K = await side.evaluate(() => window.klippNavn);
const lagre = (navn, url) => { fs.writeFileSync(path.join(ut, navn), Buffer.from(url.split(',')[1], 'base64')); console.log('laget', navn); };

// ---- Fossil Zoo: 26 bilder à 128 px, samme rekkefølge som før (idle 0–5, walk 6–13, punch 14–19, jump 20–25) ----
{
  const R = 1.15, rammer = [];
  for (const t of tider(6, K.Idle)) rammer.push({ klipp: 'Idle', t, retning: R });
  for (const t of tider(8, K.Walking)) rammer.push({ klipp: 'Walking', t, retning: R });
  for (const t of tider(6, K.Punch, false)) rammer.push({ klipp: 'Punch', t, retning: R });
  for (const t of tider(6, K.Jump, false)) rammer.push({ klipp: 'Jump', t, retning: R });
  lagre('fossil-ark.webp', await side.evaluate(s => window.tegnArk(s),
    { F: 128, kol: 26, hoyde: 14, synlig: 1.255, fot: 0.965, rammer, kvalitet: 0.85 }));
}

// ---- Era Defenders: ovenfra og skrått (50°), 5 retninger × 12 bilder à 96 px ----
// Rad 0–4 = sør, sørøst, øst, nordøst, nord (sett på skjermen). Vest-retningene speiles i spillet.
// Kolonner: 0–1 står (Idle), 2–7 går (Walking), 8–11 slår (Punch).
{
  const retninger = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI], rammer = [];
  for (const r of retninger) {
    for (const t of tider(2, K.Idle)) rammer.push({ klipp: 'Idle', t, retning: r });
    for (const t of tider(6, K.Walking)) rammer.push({ klipp: 'Walking', t, retning: r });
    for (const t of tider(4, K.Punch * 0.7, false)) rammer.push({ klipp: 'Punch', t, retning: r });
  }
  lagre('era-ark.webp', await side.evaluate(s => window.tegnArk(s),
    { F: 96, kol: 12, hoyde: 35, synlig: 1.4, fot: 0.9, rammer, kvalitet: 0.82 }));
}

// ---- Nettsiden: råbilder i PNG (beskjæres og gjøres om til WebP i lag-web.py) ----
const bilde = (navn, s) => side.evaluate(s => window.tegnBilde(s), s).then(u => lagre(navn, u));
await bilde('web-staende.png', { B: 1300, Hpx: 1400, klipp: 'Idle', t: 0, retning: 0.15, hoyde: 8, avstand: 3.2, mal: 0.5 });
await bilde('web-hode.png', { B: 900, Hpx: 900, klipp: 'Idle', t: 0, retning: 0.15, hoyde: 6, avstand: 1.25, mal: 0.8 });
for (const [i, t] of tider(8, K.Wave).entries())
  await bilde(`web-vink-${i}.png`, { B: 1300, Hpx: 1400, klipp: 'Wave', t, retning: 0.15, hoyde: 8, avstand: 3.2, mal: 0.5 });

await nett.close(); srv.close();
