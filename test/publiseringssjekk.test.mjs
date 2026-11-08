#!/usr/bin/env node
/*
 * Tester for publiseringssjekken og automatisk spillregistrering. Ingen avhengigheter, bare Node og git.
 *
 *   node test/publiseringssjekk.test.mjs
 *
 * Lager et lite midlertidig repo med en main-gren (to spill, standard, agent og testside), og én gren per scenario
 * med QA-rapport og et testresultat som i Actions. Publiseringssjekken kjøres alltid fra main-grenens kopi,
 * slik som i GitHub. Testene viser at et nytt spill godtas uten endring i test/, og at manipulering avvises.
 * Avslutter med kode 1 hvis et scenario gir et annet utfall enn forventet.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lesOppsett, PAKREVDE_KONTROLLER } from './spilloppsett.mjs';

const TEST = path.dirname(fileURLToPath(import.meta.url));
const ROT = fs.mkdtempSync(path.join(os.tmpdir(), 'evn-sjekk-'));
process.on('exit', () => fs.rmSync(ROT, { recursive: true, force: true }));
const REPO = path.join(ROT, 'repo'), MAIN = path.join(ROT, 'main');
const git = (...a) => execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'init.defaultBranch=main', ...a],
  { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const skriv = (fil, tekst) => { const f = path.join(REPO, fil); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, tekst); };
const slett = fil => fs.rmSync(path.join(REPO, fil), { recursive: true, force: true });
const spillside = ver => `<!doctype html><html lang="no"><head><meta charset="utf-8"><title>Spill</title></head><body><p class="evn-ver">Versjon ${ver}</p><button id="startBtn">Start</button></body></html>\n`;
const SUITER = { statisk: 'ok', royk: 'ok', statistikk: 'ikke-innfort', ui: 'ikke-innfort', ecoins: 'ikke-innfort' };

// ---- main: to spill (alfa uten eget oppsett, beta med evn-test.json), standard, agent og testene fra denne grenen ----
fs.mkdirSync(REPO);
git('init', '-q');
skriv('.claude/evn-game-standard.md', '# EVN Game Standard\n\n## Obligatoriske krav\nStatus: gjeldende\n\n| K1 | Ingen feil |\n| F1 | Spillet starter |\n');
skriv('.claude/agents/evn-game-qa.md', '# EVN Game QA\nAgentdefinisjon versjon 2.2\n');
for (const f of ['index.html', 'kjor.mjs', 'publiseringssjekk.mjs', 'spilloppsett.mjs']) skriv('test/' + f, fs.readFileSync(path.join(TEST, f), 'utf8'));
skriv('.github/workflows/publisering.yml', 'name: Publiseringssjekk\n');
skriv('spill/alfa/index.html', spillside('1.0.0'));
skriv('spill/beta/index.html', spillside('2.0.0'));
skriv('spill/beta/evn-test.json', '{ "start": "startBtn" }\n');
skriv('ENDRINGSLOGG.md', '# Endringslogg\n| Dato | Hva |\n|---|---|\n| 2026-11-01 | alfa 1.0.0, beta 2.0.0 |\n');
git('add', '-A'); git('commit', '-qm', 'main');
git('checkout', '-q', '-b', 's'); git('worktree', 'add', '-q', '--detach', MAIN, 'main');

// ---- Ett scenario: endre, committe kode, lagre QA-rapport som egen commit, lage testresultat og kjøre sjekken fra main ----
function kjor({ navn, endre, ci = r => r, forventet, tekst = [] }) {
  git('checkout', '-q', '-B', 's', 'main');
  endre();
  git('add', '-A'); git('commit', '-qm', 'kode', '--allow-empty');
  const kode = git('rev-parse', 'HEAD');
  const testversjon = git('rev-parse', 'HEAD:test').slice(0, 12);
  const standard = git('rev-parse', 'HEAD:.claude/evn-game-standard.md');
  const spill = fs.readdirSync(path.join(REPO, 'spill')).filter(d => fs.existsSync(path.join(REPO, 'spill', d, 'index.html'))).sort();
  const kvittering = ['evn1', 'commit=' + kode, 'tester=' + testversjon, 'arbeidstre=rent', ...Object.entries(SUITER).map(([n, v]) => n + '=' + v)].join(' ');
  for (const id of spill) skriv(`qa/rapporter/2026-11-08-${id}-${kode.slice(0, 7)}.md`,
    `# EVN Game QA: ${id}\n\nGrunnlag: agent 2.2, standard 1.2 (${standard}), commit ${kode}\nNivå: full\nTestkvittering: ${kvittering}\n\nK1 og F1 er kontrollert.\n\n## Klar for testing hos Even?\nJA\n`);
  git('add', '-A'); git('commit', '-qm', 'qa', '--allow-empty');
  const head = git('rev-parse', 'HEAD');
  const tester = spill.flatMap(id => Object.entries(PAKREVDE_KONTROLLER).flatMap(([suite, ider]) => ider.map(k => ({ suite, spill: id, id: k, status: 'ok' }))));
  const resultat = ci({ format: 'evn1', commit: head, testversjon, arbeidstre: 'rent', suiter: { ...SUITER }, spill: [...spill], tester });
  const fil = path.join(ROT, 'resultat.json');
  fs.writeFileSync(fil, JSON.stringify(resultat));
  const env = { ...process.env }; delete env.GITHUB_ACTIONS; delete env.GITHUB_STEP_SUMMARY;
  const p = spawnSync(process.execPath, [path.join(MAIN, 'test', 'publiseringssjekk.mjs'), '--base', 'main', '--ref', head, '--ci-resultat', fil], { cwd: MAIN, encoding: 'utf8', env });
  const ut = p.stdout + p.stderr;
  const mangler = tekst.filter(t => !ut.includes(t));
  const ok = p.status === forventet && !mangler.length;
  console.log(`${ok ? 'OK  ' : 'FEIL'} ${navn} (kode ${p.status}, forventet ${forventet})`);
  if (!ok) { console.log('     mangler i utskriften: ' + (mangler.join(' | ') || '–')); console.log(ut.split('\n').filter(l => /FEIL|VARSEL/.test(l)).map(l => '     ' + l).join('\n')); }
  return ok;
}

const nyttSpill = (id = 'gamma', ver = '0.1.0') => { skriv(`spill/${id}/index.html`, spillside(ver)); fs.appendFileSync(path.join(REPO, 'ENDRINGSLOGG.md'), `| 2026-11-08 | ${id} ${ver} |\n`); };
const okning = (id, ver) => { skriv(`spill/${id}/index.html`, spillside(ver)); fs.appendFileSync(path.join(REPO, 'ENDRINGSLOGG.md'), `| 2026-11-08 | ${id} ${ver} |\n`); };
const uten = (r, id) => ({ ...r, spill: r.spill.filter(x => x !== id), tester: r.tester.filter(t => t.spill !== id) });

const scenarier = [
  // Godtas
  { navn: 'P1 Nytt spill uten endring i test/ godtas', endre: () => nyttSpill(), forventet: 0, tekst: ['Nye spill registrert automatisk: gamma', 'Actions testet alle 3 spill'] },
  { navn: 'P2 Nytt spill med gyldig evn-test.json godtas', endre: () => { nyttSpill('delta'); skriv('spill/delta/evn-test.json', '{ "start": "menyStart", "etterStart": { "klikk": ".verden.aapen" } }'); }, forventet: 0 },
  { navn: 'P3 Endring i spill på main uten endret testoppsett godtas', endre: () => okning('alfa', '1.0.1'), forventet: 0 },
  // Endret testkode eller arbeidsflyt
  { navn: 'N1 Nytt spill + endret test/index.html (KJENTE skjuler feil) avvises', endre: () => { nyttSpill(); skriv('test/index.html', fs.readFileSync(path.join(REPO, 'test/index.html'), 'utf8').replace('var KJENTE = {', "var KJENTE = { 'gamma/F1-start': 'skjult'," )); }, forventet: 1, tekst: ['endrer testene eller arbeidsflyten (test/index.html)'] },
  { navn: 'N2 Endret test/kjor.mjs avvises', endre: () => { nyttSpill(); fs.appendFileSync(path.join(REPO, 'test/kjor.mjs'), '\n// endret\n'); }, forventet: 1, tekst: ['test/kjor.mjs'] },
  { navn: 'N3 PR-ens publiseringssjekk som alltid godkjenner, brukes ikke', endre: () => { nyttSpill(); skriv('test/publiseringssjekk.mjs', 'process.exit(0);\n'); }, forventet: 1, tekst: ['test/publiseringssjekk.mjs'] },
  { navn: 'N4 Endret test/spilloppsett.mjs (færre påkrevde kontroller) avvises', endre: () => { nyttSpill(); skriv('test/spilloppsett.mjs', fs.readFileSync(path.join(REPO, 'test/spilloppsett.mjs'), 'utf8').replace("'F1-start', ", '')); }, forventet: 1, tekst: ['test/spilloppsett.mjs'] },
  { navn: 'N5 Endret GitHub Actions avvises', endre: () => { nyttSpill(); skriv('.github/workflows/publisering.yml', 'name: Publiseringssjekk\n# endret\n'); }, forventet: 1, tekst: ['.github/workflows/publisering.yml'] },
  // Manipulert testresultat
  { navn: 'N6 Testresultat uten det nye spillet avvises', endre: () => nyttSpill(), ci: r => uten(r, 'gamma'), forventet: 1, tekst: ['spillet gamma finnes på', 'ble ikke testet'] },
  { navn: 'N7 Testresultat uten et spill fra main avvises', endre: () => okning('alfa', '1.0.1'), ci: r => uten(r, 'beta'), forventet: 1, tekst: ['spillet beta finnes på'] },
  { navn: 'N8 Testresultat der en påkrevd kontroll mangler, avvises', endre: () => nyttSpill(), ci: r => ({ ...r, tester: r.tester.filter(t => !(t.spill === 'gamma' && t.id === 'F1-start')) }), forventet: 1, tekst: ['kontrollen royk/F1-start mangler for gamma'] },
  { navn: 'N9 Testresultat med feilet kontroll, men suite «ok», avvises', endre: () => nyttSpill(), ci: r => ({ ...r, tester: r.tester.map(t => t.spill === 'gamma' && t.id === 'K1-feil' ? { ...t, status: 'feil' } : t) }), forventet: 1, tekst: ['kontrollen royk/K1-feil for gamma er feil'] },
  { navn: 'N10 Testresultat med oppdiktet spill avvises', endre: () => nyttSpill(), ci: r => ({ ...r, spill: [...r.spill, 'falsk'] }), forventet: 1, tekst: ['oppgir spillet falsk, som ikke finnes'] },
  { navn: 'N11 Testresultat uten spilliste (gammelt format) avvises', endre: () => nyttSpill(), ci: r => { const { spill, ...x } = r; return x; }, forventet: 1, tekst: ['oppgir ikke hvilke spill som ble testet'] },
  { navn: 'N12 Testresultat med falsk testversjon avvises', endre: () => nyttSpill(), ci: r => ({ ...r, testversjon: '000000000000' }), forventet: 1, tekst: ['oppgir testversjon 000000000000'] },
  { navn: 'N13 Testresultat for en annen commit avvises', endre: () => nyttSpill(), ci: r => ({ ...r, commit: '0'.repeat(40) }), forventet: 1, tekst: ['Testkjøringen i Actions gjelder 0000000'] },
  // Manipulert testoppsett i spillmappen
  { navn: 'N14 evn-test.json med ukjent nøkkel (forsøk på å merke funn som kjente) avvises', endre: () => { nyttSpill(); skriv('spill/gamma/evn-test.json', '{ "start": "startBtn", "kjente": { "gamma/K1-feil": "x" } }'); }, forventet: 1, tekst: ['ukjent nøkkel «kjente»'] },
  { navn: 'N15 evn-test.json med kode i startverdien avvises', endre: () => { nyttSpill(); skriv('spill/gamma/evn-test.json', '{ "start": "x\\"><img src=x onerror=alert(1)>" }'); }, forventet: 1, tekst: ['«start» må være id-en til et element'] },
  { navn: 'N16 evn-test.json med kode i selektoren avvises', endre: () => { nyttSpill(); skriv('spill/gamma/evn-test.json', '{ "etterStart": { "klikk": "a{}</script><script>alert(1)" } }'); }, forventet: 1, tekst: ['«etterStart.klikk» må være en enkel CSS-selektor'] },
  { navn: 'N17 Ugyldig JSON i evn-test.json avvises', endre: () => { nyttSpill(); skriv('spill/gamma/evn-test.json', '{ start: startBtn }'); }, forventet: 1, tekst: ['er ikke gyldig JSON'] },
  { navn: 'N18 Nytt evn-test.json for et spill på main avvises', endre: () => { okning('alfa', '1.0.1'); skriv('spill/alfa/evn-test.json', '{ "start": "alltidSkjult" }'); }, forventet: 1, tekst: ['PR-en legger til spill/alfa/evn-test.json'] },
  { navn: 'N19 Endret evn-test.json for et spill på main avvises', endre: () => { okning('beta', '2.0.1'); skriv('spill/beta/evn-test.json', '{ "start": "annenKnapp" }\n'); }, forventet: 1, tekst: ['PR-en endrer spill/beta/evn-test.json'] },
  { navn: 'N20 Slettet evn-test.json for et spill på main avvises', endre: () => { okning('beta', '2.0.1'); slett('spill/beta/evn-test.json'); }, forventet: 1, tekst: ['PR-en sletter spill/beta/evn-test.json'] },
  { navn: 'N21 Ugyldig mappenavn for nytt spill avvises', endre: () => nyttSpill('Gamma Spill'), forventet: 1, tekst: ['Mappenavnet spill/Gamma Spill/ er ikke gyldig'] }
];

// ---- Kontrollen av evn-test.json alene ----
const enhet = [
  ['tomt objekt gir standard start', '{}', o => o && o.start === 'startBtn'],
  ['gyldig start og klikk', '{"start":"menyStart","etterStart":{"klikk":".verden.aapen"}}', o => o && o.etterStart.klikk === '.verden.aapen'],
  ['liste avvises', '[]', o => o === null],
  ['__proto__ avvises', '{"__proto__":{"start":"x"}}', o => o === null],
  ['for stor fil avvises', JSON.stringify({ start: 'a'.repeat(2000) }), o => o === null],
  ['ekstra nøkkel i etterStart avvises', '{"etterStart":{"klikk":".a","kjor":"alert(1)"}}', o => o === null],
  ['tall som start avvises', '{"start":5}', o => o === null]
];

let feil = 0;
try {
  console.log('# Kontroll av evn-test.json');
  for (const [navn, tekst, test] of enhet) { const ok = test(lesOppsett(tekst).oppsett); if (!ok) feil++; console.log(`${ok ? 'OK  ' : 'FEIL'} ${navn}`); }
  console.log('\n# Publiseringssjekken (kjørt fra main)');
  for (const s of scenarier) if (!kjor(s)) feil++;
} finally {
  fs.rmSync(ROT, { recursive: true, force: true });
}
console.log(`\n${enhet.length + scenarier.length - feil} av ${enhet.length + scenarier.length} ga forventet utfall.`);
process.exit(feil ? 1 : 0);
