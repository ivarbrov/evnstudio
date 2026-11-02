#!/usr/bin/env node
/*
 * EVN Publiseringssjekk – kjøres ved PR til main. Ingen avhengigheter, bare Node og git.
 *
 *   node test/publiseringssjekk.mjs [--base origin/main] [--ci-resultat <JSON fra test/kjor.mjs i Actions>]
 *
 * 1. Testene i Actions: --ci-resultat er resultatet av Actions sin egen kjøring av test/kjor.mjs.
 *    Den må gjelde HEAD, være kjørt på et rent arbeidstre, ha kjørt alle suiter og ikke ha feil.
 *    Rådgivende suiter (krav som ikke er gjeldende ennå) gir bare varsel. I Actions er --ci-resultat påkrevd.
 * 2. QA etter siste kodeendring: en rapport i qa/rapporter/ der «Grunnlag» viser full SHA for siste commit
 *    som endrer noe utenfor qa/, standardfilens hash og agentversjonen på den commiten.
 * 3. Full QA for endrede spill: «Nivå: full», alle gjeldende krav-ID-er for spillet gjort rede for,
 *    konklusjon som ikke er NEI, og en testkvittering fra test/kjor.mjs for samme commit.
 *    Felles kode (statistikk.js, vendor/, fonter/) regnes som endring i alle spill.
 * 4. Testkvitteringen i rapporten sammenlignes med Actions på stabile opplysninger: commit, versjon av test/
 *    og resultat per suite. Ulikt resultat i en obligatorisk suite stopper PR-en og må undersøkes.
 * 5. K3: endrede spill har ny versjon på startkortet, og versjonen står i ENDRINGSLOGG.md.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const BASE = arg('base', process.env.EVN_BASE || 'origin/main');
const CI_RESULTAT = arg('ci-resultat', '');
const I_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
const git = (...a) => { try { return execFileSync('git', ['-c', 'core.quotePath=false', ...a], { cwd: ROT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }).trim(); } catch { return null; } };
const vis = (rev, fil) => git('show', rev + ':' + fil);
const kort = sha => (sha || '–').slice(0, 7);

const feil = [], varsler = [], ok = [];
const mb = git('merge-base', BASE, 'HEAD');
if (!mb) { console.error('Fant ikke felles commit med ' + BASE + '.'); process.exit(2); }
const HEAD = git('rev-parse', 'HEAD');
const endrede = (git('diff', '--name-only', mb, 'HEAD') || '').split('\n').filter(Boolean);
const kode = git('log', '-1', '--format=%H', 'HEAD', '--', '.', ':(exclude)qa');

// ---- Kravene som gjelder, lest fra standarden på den kontrollerte commiten ----
function krav(standard) {
  const obligatorisk = [], betinget = new Set(), perSpill = {}, mapper = {};
  let seksjon = '', gjeldende = false;
  for (const l of standard.split(/\r?\n/)) {
    if (l.startsWith('## ')) { seksjon = l.slice(3).trim(); gjeldende = false; continue; }
    if (/^Status: gjeldende/.test(l)) gjeldende = true;
    const m = /^\| ([A-Z]{1,2}\d+[a-c]?) \|/.exec(l);
    if (m && gjeldende) (seksjon.startsWith('Betingede') ? betinget.add(m[1]) : obligatorisk.push(m[1]));
    if (seksjon.startsWith('Hvilke krav gjelder')) {
      for (const s of l.matchAll(/([A-ZÆØÅ][\wæøåÆØÅ ]*?) = `spill\/([^`]+)`/g)) mapper[s[1].trim()] = s[2];
      const r = /^\| ([^|]+?) \| ([A-Z0-9, ]+) \|/.exec(l);
      if (r && mapper[r[1].trim()]) perSpill[mapper[r[1].trim()]] = r[2].split(',').map(x => x.trim()).filter(x => betinget.has(x));
    }
  }
  return { obligatorisk, perSpill, mapper };
}

// ---- Testkvittering: «evn1 commit=<sha> tester=<hash> arbeidstre=rent <suite>=<resultat> …» ----
function lesKvittering(s) {
  const deler = (s || '').trim().split(/\s+/);
  if (deler[0] !== 'evn1') return null;
  const d = {};
  for (const x of deler.slice(1)) { const i = x.indexOf('='); if (i > 0) d[x.slice(0, i)] = x.slice(i + 1); }
  const { commit, tester, arbeidstre, ...suiter } = d;
  return { commit, tester, arbeidstre, suiter };
}

// ---- 1. Testkjøringen i Actions ----
let ci = null;
if (CI_RESULTAT) {
  try { ci = JSON.parse(fs.readFileSync(CI_RESULTAT, 'utf8')); } catch { feil.push(`Fant ikke testresultatet fra Actions (${CI_RESULTAT}). Testene må ha kjørt i Actions.`); }
} else if (I_ACTIONS) feil.push('Testresultatet fra Actions mangler (--ci-resultat). En lokal testkvittering kan ikke alene oppfylle kravet.');
else varsler.push('Lokal kjøring: testkvitteringen i rapporten er bare kontrollert på formen. Ved PR til main sammenlignes den med Actions sin egen testkjøring.');
const RADGIVENDE = new Set(ci && Array.isArray(ci.radgivende) ? ci.radgivende : ['ui']);
// Suitene som må finnes: alle som står i test/index.html på main eller på denne grenen.
const suiterI = rev => [...(vis(rev, 'test/index.html') || '').matchAll(/\{ navn: '([a-z]+)', fil: (?:null|'([^']+)')/g)].map(m => [m[1], m[2] || null]);
const SUITEFIL = Object.fromEntries([...suiterI(mb), ...suiterI('HEAD')]);
const KREVDE = Object.keys(SUITEFIL);
// «Ikke innført» er bare lov for en suite med testfil, når filen mangler både her og på main.
const kanMangle = n => SUITEFIL[n] && git('cat-file', '-e', 'HEAD:' + SUITEFIL[n]) === null && git('cat-file', '-e', mb + ':' + SUITEFIL[n]) === null;
const GYLDIGE = new Set(['ok', 'varsel', 'ikke-innfort', 'feil', 'ikke-kjort']);
if (ci) {
  const f0 = feil.length;
  if (ci.format !== 'evn1') feil.push('Testresultatet fra Actions har ukjent format.');
  if (!ci.suiter || typeof ci.suiter !== 'object') { feil.push('Testresultatet fra Actions mangler resultat per suite.'); ci.suiter = {}; }
  for (const n of KREVDE) if (!(n in ci.suiter)) feil.push(`Actions: suiten ${n} mangler i testresultatet.`);
  for (const [n, v] of Object.entries(ci.suiter)) if (!GYLDIGE.has(v)) feil.push(`Actions: suiten ${n} har ukjent resultat «${v}».`);
  if (ci.commit !== HEAD) feil.push(`Testkjøringen i Actions gjelder ${kort(ci.commit)}, ikke ${kort(HEAD)}.`);
  if (ci.arbeidstre !== 'rent') feil.push('Testkjøringen i Actions hadde endringer som ikke var committet.');
  for (const [n, v] of Object.entries(ci.suiter || {})) {
    if (v === 'feil' || v === 'ikke-kjort') (RADGIVENDE.has(n) && v === 'feil' ? varsler : feil).push(`Actions: suiten ${n} er ${v}${RADGIVENDE.has(n) ? ' (rådgivende)' : ''}.`);
    else if (v === 'varsel') varsler.push(`Actions: suiten ${n} gir varsel. Den er rådgivende til kravene er gjeldende.`);
    else if (v === 'ikke-innfort' && !kanMangle(n)) feil.push(`Actions: suiten ${n} er oppgitt som ikke innført, men den skal alltid kjøres eller filen den tester, finnes.`);
    else if (v === 'ikke-innfort') varsler.push(`Actions: suiten ${n} er ikke innført ennå (filen den tester, finnes verken her eller på main).`);
  }
  if (feil.length === f0) ok.push(`Actions kjørte testene på ${kort(HEAD)}: ${Object.entries(ci.suiter).map(([n, v]) => n + '=' + v).join(', ')}.`);
}

function kontrollerKvittering(navn, r) {
  const k = lesKvittering(r.kvittering);
  if (!k) { feil.push(`${navn}: rapporten mangler testkvittering i formatet fra test/kjor.mjs («Testkvittering: evn1 …»).`); return; }
  const f0 = feil.length;
  if (k.commit !== kode) feil.push(`${navn}: testkvitteringen gjelder ${kort(k.commit)}, ikke siste kodeendring ${kort(kode)}.`);
  if (k.arbeidstre !== 'rent') feil.push(`${navn}: testkvitteringen er laget med endringer som ikke var committet.`);
  const suiter = [...new Set([...KREVDE, ...(ci ? Object.keys(ci.suiter) : Object.keys(k.suiter))])];
  for (const n of suiter) {
    const v = k.suiter[n];
    if (!v || v === 'ikke-kjort') feil.push(`${navn}: suiten ${n} er ikke kjørt i den lokale testkjøringen.`);
    else if (v === 'feil' && !RADGIVENDE.has(n)) feil.push(`${navn}: suiten ${n} feilet i den lokale testkjøringen.`);
  }
  const v0 = varsler.length;
  if (ci) {
    if (k.tester !== ci.testversjon) feil.push(`${navn}: den lokale testkjøringen brukte en annen versjon av test/ (${k.tester}) enn Actions (${ci.testversjon}).`);
    for (const n of suiter) {
      if (k.suiter[n] && k.suiter[n] !== ci.suiter[n])
        (RADGIVENDE.has(n) ? varsler : feil).push(`${navn}: suiten ${n} ga «${k.suiter[n]}» lokalt og «${ci.suiter[n]}» i Actions. Forskjellen må undersøkes. Kravene er ikke endret.`);
    }
  }
  if (feil.length === f0) ok.push(`${navn}: testkvitteringen gjelder ${kort(kode)}${ci ? (varsler.length === v0 ? ' og stemmer med Actions' : ' og stemmer med Actions i de obligatoriske suitene') : ''}.`);
}

// ---- QA-rapportene som er committet ----
const rapporter = (git('ls-tree', '-r', '--name-only', 'HEAD', 'qa/rapporter/') || '').split('\n').filter(f => f.endsWith('.md')).map(fil => {
  const t = vis('HEAD', fil) || '';
  const g = /^Grunnlag: agent (\d+(?:\.\d+)*)[^,]*,\s*standard (.+?)\s*\(([0-9a-f]{40})\),\s*commit ([0-9a-f]{40})\b/m.exec(t);
  const k = /## Klar for testing hos Even\?\s*\n\s*(JA MED FORBEHOLD|JA|NEI)/.exec(t);
  return { fil, tekst: t, tittel: (/^# EVN Game QA: (.+)$/m.exec(t) || [])[1] || '', grunnlag: g && { agent: g[1], standard: g[2], hash: g[3], commit: g[4] },
    kortSha: !g && /^Grunnlag:.*commit [0-9a-f]{7,39}\b/m.test(t), niva: ((/^Nivå: (\w+)/m.exec(t) || [])[1] || '').toLowerCase(),
    kvittering: (/^Testkvittering: (evn1 .+)$/m.exec(t) || [])[1] || '', konklusjon: k ? k[1] : '' };
});
for (const r of rapporter.filter(r => r.kortSha)) varsler.push(`${r.fil}: «Grunnlag» har kort commit. Full SHA kreves, så rapporten brukes ikke.`);

const standardHash = git('rev-parse', kode + ':.claude/evn-game-standard.md');
const agentVersjon = ((/Agentdefinisjon versjon ([\d.]+)/.exec(vis(kode, '.claude/agents/evn-game-qa.md') || '') || [])[1]) || null;
const kravsett = krav(vis(kode, '.claude/evn-game-standard.md') || '');
const forKode = rapporter.filter(r => r.grunnlag && r.grunnlag.commit === kode);
const riktigGrunnlag = r => r.grunnlag.hash === standardHash && r.grunnlag.agent === agentVersjon;

// ---- Hvilke spill er endret ----
const alleSpill = (git('ls-tree', '--name-only', 'HEAD', 'spill/') || '').split('\n').filter(Boolean).map(f => f.replace(/^spill\//, ''));
const felles = endrede.some(f => f === 'statistikk.js' || f.startsWith('vendor/') || f.startsWith('fonter/'));
const spill = felles ? alleSpill : [...new Set(endrede.map(f => (/^spill\/([^/]+)\//.exec(f) || [])[1]).filter(Boolean))];

console.log(`HEAD: ${HEAD}\nSiste kodeendring: ${kode}\nStandard på den commiten: ${standardHash}\nAgentversjon: ${agentVersjon}\nEndrede spill: ${spill.join(', ') || 'ingen'}${felles ? ' (felles kode er endret)' : ''}\n`);

// ---- 2. QA etter siste kodeendring ----
const gyldige = forKode.filter(riktigGrunnlag);
if (!forKode.length) feil.push(`Ingen QA-rapport i qa/rapporter/ for siste kodeendring ${kort(kode)} (full SHA i «Grunnlag»). Kjør EVN Game QA på nytt og lagre rapporten uendret.`);
else if (!gyldige.length) feil.push(`QA-rapporten for ${kort(kode)} er laget mot en annen standard eller agentversjon enn den som ligger på commiten.`);
else ok.push(`QA-rapport finnes for ${kort(kode)} med riktig standard og agent.`);
if (!spill.length && gyldige.length) kontrollerKvittering('Rapporten', gyldige[0]);

// ---- 3–5. Full QA, testkvittering og K3 per endret spill ----
for (const s of spill) {
  const navn = Object.keys(kravsett.mapper).find(n => kravsett.mapper[n] === s) || s;
  const r = gyldige.find(x => x.niva === 'full' && (x.tittel.includes(navn) || x.tittel.includes(s)));
  if (!r) { feil.push(`${navn}: mangler QA-rapport på fullt nivå for ${kort(kode)}.`); continue; }
  const trengs = [...kravsett.obligatorisk, ...(kravsett.perSpill[s] || [])];
  const mangler = trengs.filter(id => !new RegExp('\\b' + id + '\\b').test(r.tekst));
  if (mangler.length) feil.push(`${navn}: rapporten ${r.fil} gjør ikke rede for ${mangler.join(', ')}.`);
  if (r.konklusjon === 'NEI') feil.push(`${navn}: QA-konklusjonen er NEI.`);
  if (!mangler.length && r.konklusjon !== 'NEI') ok.push(`${navn}: full QA i ${r.fil}, alle ${trengs.length} gjeldende krav er gjort rede for.`);
  kontrollerKvittering(navn, r);

  const ver = rev => ((/class="[^"]*\bevn-ver\b[^"]*"[^>]*>\s*Versjon\s+(\d+(?:\.\d+){1,3})/.exec(vis(rev, `spill/${s}/index.html`) || '') || [])[1]);
  const ny = ver('HEAD'), gammel = ver(mb);
  if (!ny) feil.push(`${navn}: fant ikke «Versjon x.y.z» på startkortet (K3).`);
  else if (ny === gammel) feil.push(`${navn}: versjonen er fortsatt ${ny}. Øk versjonsnummeret (K3).`);
  else if (!(vis('HEAD', 'ENDRINGSLOGG.md') || '').includes(ny)) feil.push(`${navn}: versjon ${ny} står ikke i ENDRINGSLOGG.md (K3).`);
  else ok.push(`${navn}: versjon ${gammel || '–'} → ${ny}, og den står i ENDRINGSLOGG.md.`);
}

const ut = ['# EVN Publiseringssjekk', '', ...feil.map(x => '- FEIL: ' + x), ...varsler.map(x => '- VARSEL: ' + x), ...ok.map(x => '- OK: ' + x)];
console.log(ut.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, ut.join('\n') + '\n');
// Merknader som vises på kontrollen i GitHub
if (I_ACTIONS) { feil.forEach(x => console.log('::error title=Publiseringssjekk::' + x)); varsler.forEach(x => console.log('::warning title=Publiseringssjekk::' + x)); }
process.exit(feil.length ? 1 : 0);
