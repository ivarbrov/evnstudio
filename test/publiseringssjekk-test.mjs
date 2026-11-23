#!/usr/bin/env node
/*
 * Selvtest av endringsbasert QA i test/publiseringssjekk.mjs. Ingen avhengigheter, bare Node og git.
 *
 *   node test/publiseringssjekk-test.mjs
 *
 * Lager et lite øvingsrepo i en midlertidig mappe (utenfor repoet) for hvert tilfelle, med main, en PR-gren,
 * en QA-rapport og eventuelle endringer etterpå. Kjører publiseringssjekken der og kontrollerer at
 * gyldige rapporter gjenbrukes og at utdaterte eller falske rapporter avvises.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HER = path.dirname(fileURLToPath(import.meta.url));
const SKRIPT = path.join(HER, 'publiseringssjekk.mjs');

const STANDARD = `# EVN Game Standard\n\n## Obligatoriske krav\nStatus: gjeldende\n\n| F1 | Start |\n| K3 | Versjon |\n\n## Hvilke krav gjelder for hvert spill\n`;
const AGENT = `---\nname: evn-game-qa\n---\nAgentdefinisjon versjon 2.2 (utkast).\n`;
const spillside = v => `<!doctype html><html><head><script src="../../statistikk.js"></script></head><body><div class="evn-ver">Versjon ${v}</div></body></html>\n`;

let tilfeller = 0, feilet = 0;
const loggPluss = (r, linje) => fs.appendFileSync(path.join(r.d, 'ENDRINGSLOGG.md'), linje + '\n');

function lagRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'evn-pubsjekk-'));
  const g = (...a) => execFileSync('git', a, { cwd: d, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const skriv = (fil, tekst) => { fs.mkdirSync(path.dirname(path.join(d, fil)), { recursive: true }); fs.writeFileSync(path.join(d, fil), tekst); };
  const commit = melding => { g('add', '-A'); g('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', melding); return g('rev-parse', 'HEAD'); };
  g('init', '-q', '-b', 'main');
  fs.mkdirSync(path.join(d, 'test'), { recursive: true });
  fs.copyFileSync(SKRIPT, path.join(d, 'test', 'publiseringssjekk.mjs'));
  skriv('.claude/evn-game-standard.md', STANDARD);
  skriv('.claude/agents/evn-game-qa.md', AGENT);
  skriv('statistikk.js', '// felles\n');
  skriv('index.html', '<h1>Forside</h1>\n');
  skriv('CLAUDE.md', '# Regler\n');
  skriv('ENDRINGSLOGG.md', 'Endringslogg\n\nNyeste nederst.\n\n\n\n| Dato | Hva |\n|---|---|\n');
  skriv('spill/a/index.html', spillside('1.0.0'));
  skriv('spill/b/index.html', spillside('1.0.0'));
  commit('start');
  return { d, g, skriv, commit, rapport(spillnavn, q, { niva = 'full', konklusjon = 'JA', kvitteringCommit = q, kortSha = false, fil = '' } = {}) {
    let std; try { std = g('rev-parse', q + ':.claude/evn-game-standard.md'); } catch { std = g('rev-parse', 'HEAD:.claude/evn-game-standard.md'); }
    const tekst = `# EVN Game QA: ${spillnavn}\nGrunnlag: agent 2.2, standard 1.1 (${std}), commit ${kortSha ? q.slice(0, 7) : q}\n`
      + `Testkvittering: evn1 commit=${kvitteringCommit} tester=x arbeidstre=rent royk=ok\nNivå: ${niva}\n\nF1 og K3 er kontrollert.\n\n## Klar for testing hos Even?\n${konklusjon}\n`;
    skriv(`qa/rapporter/2026-11-06-${spillnavn.replace(/\W+/g, '-')}-${q.slice(0, 7)}${fil}.md`, tekst);
    return commit('QA-rapport ' + q.slice(0, 7));
  } };
}

function sjekk(r) {
  const p = spawnSync('node', ['test/publiseringssjekk.mjs', '--base', 'main', '--ref', 'HEAD'], { cwd: r.d, encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: '' } });
  return { kode: p.status, ut: p.stdout + p.stderr };
}

function tilfelle(navn, oppsett, forventning) {
  tilfeller++;
  const r = lagRepo();
  let res;
  try { oppsett(r); res = sjekk(r); }
  catch (e) { res = { kode: -1, ut: String(e) }; }
  const feilLinjer = res.ut.split('\n').filter(l => l.startsWith('- FEIL:'));
  const okBestatt = res.kode === 0;
  let bra = forventning.bestatt === okBestatt;
  if (bra && forventning.inneholder) bra = res.ut.includes(forventning.inneholder);
  if (!bra) { feilet++; console.log(`✗ ${navn}\n  forventet ${forventning.bestatt ? 'bestått' : 'feil'}${forventning.inneholder ? ` med «${forventning.inneholder}»` : ''}, fikk kode ${res.kode}\n  ${res.ut.split('\n').filter(l => /FEIL|OK:|gjenbrukes/.test(l)).join('\n  ')}`); }
  else console.log(`✓ ${navn}${feilLinjer.length ? '  (' + feilLinjer[0].slice(8, 110) + ')' : ''}`);
  fs.rmSync(r.d, { recursive: true, force: true });
}

// Felles oppsett: PR-gren som endrer spill a til 1.1.0, med full QA av kodecommiten.
function prMedQA(r) {
  r.g('checkout', '-q', '-b', 'pr');
  r.skriv('spill/a/index.html', spillside('1.1.0'));
  loggPluss(r, '| 6.11 | a 1.1.0 |');
  const q = r.commit('a 1.1.0');
  r.rapport('a', q);
  return q;
}
// main går videre, og main flettes inn i PR-en.
function mainEndrer(r, endring) {
  r.g('checkout', '-q', 'main'); endring(); r.commit('main endres');
  r.g('checkout', '-q', 'pr'); r.g('-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '-q', '--no-edit', 'main');
}

console.log('Gyldige rapporter skal gjenbrukes eller godtas:');
tilfelle('Fersk full QA av siste kodeendring godtas (som i dag)', r => prMedQA(r), { bestatt: true });
tilfelle('Ren oppdatering mot main som bare endrer et annet spill: QA gjenbrukes', r => { prMedQA(r); mainEndrer(r, () => r.skriv('spill/b/index.html', spillside('1.0.1'))); }, { bestatt: true, inneholder: 'gjenbrukes' });
tilfelle('Ren oppdatering mot main som bare endrer forsiden: QA gjenbrukes', r => { prMedQA(r); mainEndrer(r, () => r.skriv('index.html', '<h1>Ny forside</h1>\n')); }, { bestatt: true, inneholder: 'gjenbrukes' });
tilfelle('Ren oppdatering mot main som bare endrer dokumentasjon og endringslogg: QA gjenbrukes', r => { prMedQA(r); mainEndrer(r, () => { r.skriv('CLAUDE.md', '# Regler v2\n'); r.skriv('ENDRINGSLOGG.md', fs.readFileSync(path.join(r.d, 'ENDRINGSLOGG.md'), 'utf8').replace('Endringslogg', 'Endringslogg for EVN')); }); }, { bestatt: true, inneholder: 'gjenbrukes' });
tilfelle('Dokumentasjons-PR: QA gjenbrukes etter oppdatering mot main som endrer et spill', r => {
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('CLAUDE.md', '# Regler, rettet\n'); const q = r.commit('dok'); r.rapport('dokumentasjon', q, { niva: 'liten' });
  mainEndrer(r, () => r.skriv('spill/b/index.html', spillside('1.0.1')));
}, { bestatt: true, inneholder: 'gjenbrukes' });

console.log('\nUtdaterte eller ugyldige rapporter skal avvises:');
tilfelle('Ingen QA-rapport i det hele tatt', r => { r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/a/index.html', spillside('1.1.0')); r.skriv('ENDRINGSLOGG.md', '1.1.0\n'); r.commit('a'); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Spillkoden endres etter QA', r => { prMedQA(r); r.skriv('spill/a/index.html', spillside('1.1.0') + '<!-- endret -->\n'); r.commit('a endret'); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Main endrer det samme spillet (fletting endrer spillkoden)', r => {
  prMedQA(r); r.g('checkout', '-q', 'main'); r.skriv('spill/a/extra.js', '// ny fil i a\n'); r.commit('main endrer a'); r.g('checkout', '-q', 'pr'); r.g('-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '-q', '--no-edit', 'main');
}, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Main endrer felles kode (statistikk.js)', r => { prMedQA(r); mainEndrer(r, () => r.skriv('statistikk.js', '// felles v2\n')); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Main endrer en fil spillet viser til (../../…), selv om den ellers ville vært nettside', r => {
  r.skriv('bilder/robot.webp', 'bilde1'); r.skriv('spill/a/index.html', spillside('1.0.0').replace('<body>', '<body><img src="../../bilder/robot.webp">')); r.commit('a bruker bilde');
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/a/index.html', spillside('1.1.0').replace('<body>', '<body><img src="../../bilder/robot.webp">')); r.skriv('ENDRINGSLOGG.md', '1.1.0\n'); const q = r.commit('a 1.1.0'); r.rapport('a', q);
  mainEndrer(r, () => r.skriv('bilder/robot.webp', 'bilde2'));
}, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Main legger til en ukjent fil i roten (regnes som felles)', r => { prMedQA(r); mainEndrer(r, () => r.skriv('nytt-bibliotek.js', '// ukjent\n')); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Standarden endres etter QA', r => { prMedQA(r); mainEndrer(r, () => r.skriv('.claude/evn-game-standard.md', STANDARD + '\n<!-- ny -->\n')); }, { bestatt: false });
tilfelle('QA-agenten endres etter QA', r => { prMedQA(r); mainEndrer(r, () => r.skriv('.claude/agents/evn-game-qa.md', AGENT + 'Ny regel.\n')); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Testene endres på main etter QA', r => { prMedQA(r); mainEndrer(r, () => r.skriv('test/kjor.mjs', '// ny test\n')); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Rapport som peker på en commit som ikke finnes', r => { prMedQA(r); r.rapport('a', 'f'.repeat(40)); r.skriv('spill/a/index.html', spillside('1.1.0') + '<!-- x -->\n'); r.commit('endret'); }, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Rapport for en commit på main (ikke i PR-en) gjenbrukes ikke', r => {
  const m = r.g('rev-parse', 'HEAD'); r.rapport('a', m);   // rapport for main-commiten, lagt på main
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/b/index.html', spillside('1.0.1')); r.skriv('ENDRINGSLOGG.md', '1.0.1\n'); r.commit('b endres, a urørt');
  r.skriv('spill/a/index.html', spillside('1.1.0')); r.skriv('ENDRINGSLOGG.md', '1.0.1 1.1.0\n'); r.commit('a endres uten QA');
}, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Rapport på nivå liten godtas ikke for et spill', r => {
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/a/index.html', spillside('1.1.0')); r.skriv('ENDRINGSLOGG.md', '1.1.0\n'); const q = r.commit('a'); r.rapport('a', q, { niva: 'liten' });
}, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Rapport med kort SHA brukes ikke', r => {
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/a/index.html', spillside('1.1.0')); r.skriv('ENDRINGSLOGG.md', '1.1.0\n'); const q = r.commit('a'); r.rapport('a', q, { kortSha: true });
}, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Gjenbrukt rapport med testkvittering for en annen commit avvises', r => {
  const q = prMedQA(r); r.rapport('a', q, { kvitteringCommit: 'e'.repeat(40), fil: '-b' });
  // fjern den første (gyldige) rapporten, så bare den med feil kvittering er igjen
  fs.rmSync(path.join(r.d, 'qa/rapporter', fs.readdirSync(path.join(r.d, 'qa/rapporter')).find(f => !f.endsWith('-b.md'))));
  r.commit('bare rapporten med feil kvittering');
  mainEndrer(r, () => r.skriv('spill/b/index.html', spillside('1.0.1')));
}, { bestatt: false, inneholder: 'testkvitteringen gjelder' });
tilfelle('Rapport for et annet spill dekker ikke dette spillet', r => {
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/a/index.html', spillside('1.1.0')); r.skriv('ENDRINGSLOGG.md', '1.1.0\n'); const q = r.commit('a'); r.rapport('b', q);
}, { bestatt: false, inneholder: 'mangler QA-rapport' });
tilfelle('Konklusjon NEI stopper også en gjenbrukt rapport', r => {
  r.g('checkout', '-q', '-b', 'pr'); r.skriv('spill/a/index.html', spillside('1.1.0')); r.skriv('ENDRINGSLOGG.md', '1.1.0\n'); const q = r.commit('a'); r.rapport('a', q, { konklusjon: 'NEI' });
  mainEndrer(r, () => r.skriv('spill/b/index.html', spillside('1.0.1')));
}, { bestatt: false, inneholder: 'konklusjonen er NEI' });

console.log(`\n${tilfeller - feilet} av ${tilfeller} tilfeller som forventet.`);
process.exit(feilet ? 1 : 0);
