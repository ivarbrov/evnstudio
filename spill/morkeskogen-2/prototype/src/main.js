// Mørkeskogen 2.0 – grafikkprototype. Isolert testscene ved bålet med to grafiske stiler.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { lagVerden, VERDEN } from './verden.js';
import { lagBakkeTeksturer } from './grafikk/teksturer.js';
import { lagBakke, lagHoydekart } from './grafikk/bakke.js';
import { lagSkog } from './grafikk/traer.js';
import { lagGress } from './grafikk/gress.js';
import { lagLys, TIDER, DOGN_LENGDE } from './grafikk/lys.js';
import { lagBal } from './grafikk/bal.js';
import { lagHytte } from './grafikk/hytte.js';
import { lagMonstre } from './grafikk/monster.js';
import { FELLES } from './grafikk/materialer.js';
import { lagHeltLogikk, oppdaterHelt, lagHeltFigur, OKS } from './helt.js';
import { lagKamera } from './kamera.js';
import { lagStyring } from './styring.js';
import { lagMaaling } from './maal.js';

export const VERSJON = '2.0-proto.1';
const $ = id => document.getElementById(id);
const q = new URLSearchParams(location.search), hash = location.hash.slice(1);
const berøring = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const KVAL = {
  lav: { navn: 'Lav', dpr: 1, skygge: 1024, skyggeBoks: 420, balSkygge: false, bloom: false, gress: 5000, gressRadius: 220, lodAvstand: 300, partikler: 60 },
  middels: { navn: 'Middels', dpr: 1.5, skygge: berøring ? 1024 : 2048, skyggeBoks: 500, balSkygge: false, bloom: false, gress: 10000, gressRadius: 300, lodAvstand: 450, partikler: 120 },
  hoy: { navn: 'Høy', dpr: 2, skygge: 2048, skyggeBoks: 600, balSkygge: true, bloom: true, gress: 28000, gressRadius: 400, lodAvstand: 700, partikler: 200 },
};
const KV_REKKE = ['lav', 'middels', 'hoy'];
const valg = {
  stil: +(q.get('stil') || (/stil2/.test(hash) ? 2 : /stil1/.test(hash) ? 1 : 1)),
  kval: q.get('kvalitet') || (berøring ? 'middels' : 'hoy'),
  maal: q.get('maal') === '1' || /maal/.test(hash),
  tid: q.get('tid') || 'dag', autoTid: q.get('auto') === '1',
  frø: +(q.get('fro') || 424242),
};

const lerret = $('lerret');
const renderer = new THREE.WebGLRenderer({ canvas: lerret, antialias: true, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;   // PCFSoftShadowMap finnes ikke lenger i r187
renderer.outputColorSpace = THREE.SRGBColorSpace;
const maaling = lagMaaling(renderer, valg.maal);
const { kamera, K, oppdater: oppdaterKamera } = lagKamera();
const verden = lagVerden(valg.frø);
const helt = lagHeltLogikk();
let tid = TIDER[valg.tid] ?? +valg.tid ?? TIDER.dag, autoTid = valg.autoTid, klokke = 0;
let V = null, composer = null, bygger = false;

function kvalitet() { return KVAL[valg.kval]; }
function settStorrelse() {
  const kv = kvalitet(), w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(Math.min(kv.dpr, devicePixelRatio || 1)); renderer.setSize(w, h, false);
  kamera.aspect = w / h; kamera.updateProjectionMatrix();
  if (composer) composer.setSize(w, h);
}
function rydd(scene) {
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) { for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); }
  });
}

async function bygg() {
  bygger = true; $('laster').hidden = false;
  await new Promise(r => setTimeout(r, 30));
  const t0 = performance.now(), stil = valg.stil, kv = kvalitet();
  if (V) { rydd(V.scene); V = null; }
  const scene = new THREE.Scene();
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const tex = lagBakkeTeksturer(stil);
  const bakke = lagBakke(scene, tex, stil);
  const hk = lagHoydekart();
  const skog = lagSkog(scene, verden, stil, kv, tex);
  const gress = lagGress(scene, hk, stil, kv);
  const lys = lagLys(scene, renderer, stil, kv);
  const bal = lagBal(scene, stil, kv, tex);
  const hytte = lagHytte(scene, stil, tex);
  const monstre = lagMonstre(scene, stil);
  const figur = await lagHeltFigur(scene, stil);
  scene.add(kamera);
  composer = null;
  if (kv.bloom) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, kamera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .3, .45, 1.0); composer.addPass(bloom); composer.bloom = bloom;
    composer.addPass(new OutputPass());
    composer.passes.slice(1).forEach(pass => { const r = pass.render.bind(pass); pass.render = (...a) => { maaling.etter(true); try { r(...a); } finally { maaling.etter(false); } }; });
  }
  V = { scene, skog, gress, lys, bal, hytte, monstre, figur, bakke, byggMs: Math.round(performance.now() - t0) };
  settStorrelse(); oppdaterHud();
  $('laster').hidden = true; bygger = false;
}

// ---------- HUD ----------
const TIDNAVN = [['dag', '☀️ Dag'], ['kveld', '🌅 Kveld'], ['natt', '🌙 Natt'], ['auto', '⏱️ Tiden går']];
let tidValg = valg.autoTid ? 3 : Math.max(0, TIDNAVN.findIndex(x => x[0] === valg.tid));
function oppdaterHud() {
  $('bStil').textContent = '🎨 Stil ' + valg.stil;
  $('bTid').textContent = TIDNAVN[tidValg][1];
  $('bKval').textContent = '⚙️ ' + kvalitet().navn;
  $('bKam').textContent = K.modus === 'near' ? '🎥 Bak helten' : '🎥 Ovenfra';
}
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('vis'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('vis'), 1800); }
const H = {
  kamera() { K.modus = K.modus === 'near' ? 'far' : 'near'; oppdaterHud(); },
  tid() { tidValg = (tidValg + 1) % TIDNAVN.length; const n = TIDNAVN[tidValg][0]; autoTid = n === 'auto'; if (!autoTid) tid = TIDER[n]; oppdaterHud(); },
  stil() { if (bygger) return; valg.stil = valg.stil === 1 ? 2 : 1; bygg(); },
  kvalitet() { if (bygger) return; valg.kval = KV_REKKE[(KV_REKKE.indexOf(valg.kval) + 1) % 3]; bygg(); },
  erBerøring: () => berøring,
  joy(på, x, y, dx, dy) { const j = $('joy'); j.hidden = !på; if (på) { j.style.left = x + 'px'; j.style.top = y + 'px'; $('knott').style.transform = `translate(${dx}px, ${dy}px)`; } },
};
const styr = lagStyring(lerret, K, H);
$('bStil').onclick = H.stil; $('bTid').onclick = H.tid; $('bKval').onclick = H.kvalitet; $('bKam').onclick = H.kamera;
styr.knapp($('mHugg'), 'slag'); styr.knapp($('mHopp'), 'hopp'); $('mKam').addEventListener('pointerdown', e => { e.preventDefault(); H.kamera(); });
if (berøring) document.body.classList.add('touch');

// ---------- Spill-løkka ----------
let sist = performance.now(), startet = false;
const dir = new THREE.Vector2();
function slagTreff() {
  const rx = Math.sin(helt.retning), rz = Math.cos(helt.retning);
  if (V.monstre.slå(helt.x, helt.z, rx, rz, OKS.reach, 1.0)) { toast('💥 Pang!'); return; }
  let best = null, bd = 1e9;
  for (const t of verden.traer) {
    if (!t.levende) continue;
    const dx = t.x - helt.x, dz = t.z - helt.z, d = Math.hypot(dx, dz);
    if (d > OKS.reach + 11 * t.s || d > bd) continue;
    if ((dx * rx + dz * rz) / (d || 1) < Math.cos(0.9)) continue;
    best = t; bd = d;
  }
  if (best) { best.hp -= OKS.dmg; best.rist = 1; if (best.hp <= 0) { V.skog.felle(best, helt.x, helt.z); toast('🌲 Tømmer!'); } }
}
function loop(nå) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (nå - sist) / 1000); sist = nå;
  if (!V || bygger) return;
  klokke += dt; if (autoTid) tid = (tid + dt) % DOGN_LENGDE;
  if (startet) oppdaterHelt(helt, styr.les(), dt, verden, K.yaw);
  if (helt.slagT >= OKS.impact && !helt.slagTruffet) { helt.slagTruffet = true; slagTreff(); }
  oppdaterKamera(dt, helt, verden, innerWidth < 600);
  kamera.updateMatrixWorld();
  FELLES.uTid.value = klokke;
  const L = V.lys.oppdater(tid, kamera, helt, K.e); V.lys.settTid(klokke);
  V.skog.oppdater(dt, kamera, helt, V.scene.fog.far);
  V.gress.oppdater(helt);
  V.bal.oppdater(klokke, L.mork); V.hytte.oppdater(L.mork);
  V.monstre.oppdater(dt, klokke, L.mork, helt, (m, dx, dz) => { helt.vx += dx * 300; helt.vz += dz * 300; K.rist = .5; toast('😱 Uff! Monsteret skremte deg'); });
  V.figur.oppdater(helt, dt);
  if (composer && composer.bloom) composer.bloom.strength = (valg.stil === 1 ? .18 : .12) + L.mork * (valg.stil === 1 ? .45 : .35);
  maaling.startBilde();
  if (composer) { composer.render(dt); } else renderer.render(V.scene, kamera);
  maaling.sluttBilde(() => ({ stil: valg.stil, kvalitet: kvalitet().navn, dpr: renderer.getPixelRatio(), traerNaer: V.skog.info().tegnetNær, traerLangt: V.skog.info().tegnetLangt, treTriNaer: V.skog.info().triNær, treTriLangt: V.skog.info().triLangt, gressTri: V.gress.tri(), byggMs: V.byggMs, mork: +L.mork.toFixed(2), versjon: VERSJON }));
}
addEventListener('resize', settStorrelse);

// Testgrensesnitt for automatiske tester og faste kameraposisjoner
window.__proto = {
  versjon: VERSJON, verden, helt, K,
  klar: () => !!V && !bygger,
  async settStil(s) { valg.stil = s; await bygg(); },
  async settKvalitet(k) { valg.kval = k; await bygg(); },
  settTid(n) { autoTid = false; tid = TIDER[n] ?? n; },
  plasser(x, z, yaw = 0, modus = 'near', pitch = 0) { helt.x = x; helt.z = z; helt.vx = helt.vz = 0; K.yaw = yaw; K.modus = modus; K.e = modus === 'near' ? 1 : 0; K.pitch = pitch; K.mål.set(x, 0, z); K.k = 1; startet = true; },
  start() { startet = true; $('startkort').hidden = true; },
  monster(x, z) { return V.monstre.nytt(x, z); },
  // Kjører spillogikken med fast tidssteg uten å tegne (for tester i nettlesere uten skjermkort)
  simuler(sek, inp = {}) {
    const I = Object.assign({ dx: 0, dy: 0, mengde: 1, hopp: false, slag: false }, inp), dt = 1 / 60;
    for (let i = 0; i < sek * 60; i++) {
      oppdaterHelt(helt, I, dt, verden, K.yaw);
      if (helt.slagT >= OKS.impact && !helt.slagTruffet) { helt.slagTruffet = true; slagTreff(); }
      V.monstre.oppdater(dt, klokke += dt, 1, helt, () => {});
    }
  },
};

$('versjon').textContent = 'v' + VERSJON;
document.querySelectorAll('[data-stil]').forEach(b => b.onclick = async () => { document.querySelectorAll('[data-stil]').forEach(x => x.classList.toggle('valgt', x === b)); if (+b.dataset.stil !== valg.stil) { valg.stil = +b.dataset.stil; await bygg(); } });
document.querySelector(`[data-stil="${valg.stil}"]`)?.classList.add('valgt');
$('startBtn').onclick = () => { startet = true; $('startkort').hidden = true; };
bygg().then(() => requestAnimationFrame(loop));
