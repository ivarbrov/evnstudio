// EVN-reven «Nysgjerrig» – godkjenningsmodell bygget av enkle former (three.js r128). Ikke spillmodellen.
// Brukes av modell.html og ../robot-v2/for-etter.html. Krever THREE.
(function () {
'use strict';
const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
const mat = (hex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), flatShading: true, roughness: .8, metalness: 0 }, o));
const FARGE = { main: 0xf39a3c, lys: 0xf6eee0, mork: 0x2a1f1b, gul: 0xffcc00 };
// ---------- Reven «Nysgjerrig» (H = robotens høyde = 1, ansiktet mot +Z) ----------
// uttrykk: glad | nysgjerrig | jubel | snike | lei
// stilling: sta | ga | vink | hopp | hav
function lagRev(uttrykk = 'nysgjerrig', stilling = 'sta') {
  const M = { main: mat(FARGE.main), lys: mat(FARGE.lys), mork: mat(FARGE.mork), gul: mat(FARGE.gul, { roughness: .5 }), hvit: mat(0xffffff, { roughness: .25 }) };
  const kule = (a = 8, b = 6) => new THREE.SphereGeometry(1, a, b);
  const syl = (r1, r2, h, s = 7) => new THREE.CylinderGeometry(r1, r2, h, s);
  const del = (geo, m, forelder, p, s = [1, 1, 1], r = [0, 0, 0], navn) => { const x = new THREE.Mesh(geo, m); x.position.set(...p); x.scale.set(...s); x.rotation.set(...r); if (navn) x.name = navn; forelder.add(x); return x; };
  const ledd = (navn, forelder, p) => { const b = new THREE.Bone(); b.name = navn; b.position.set(...p); forelder.add(b); return b; };

  const rot = new THREE.Group();
  const hofte = ledd('Hips', rot, [0, .3, 0]);
  const kropp = ledd('Torso', hofte, [0, .14, 0]);            // samme navn som robotens ledd, så garderoben finner det
  const lav = stilling === 'snike' || uttrykk === 'snike';
  if (lav) { hofte.position.y = .27; kropp.rotation.x = .22; }
  if (stilling === 'hopp') rot.position.y = .12;

  // Bein med mørke «sokker» og store poter
  for (const sx of [-1, 1]) {
    const lår = ledd(sx < 0 ? 'UpperLeg.L' : 'UpperLeg.R', hofte, [sx * .085, 0, 0]);
    let sving = 0; if (stilling === 'ga') sving = sx * .45; if (stilling === 'hopp') sving = sx < 0 ? -.7 : .25; if (lav) sving = sx * .2 - .35;
    lår.rotation.x = sving;
    del(kule(8, 6), M.main, lår, [0, 0, 0], [.058, .058, .058]);           // hofteledd: låret henger fast i kroppen
    del(syl(.05, .042, .18), M.main, lår, [0, -.06, 0]);                    // låret går litt inn i kroppen
    const legg = ledd(sx < 0 ? 'LowerLeg.L' : 'LowerLeg.R', lår, [0, -.14, 0]);
    if (stilling === 'hopp' && sx < 0) legg.rotation.x = 1.1; if (lav) legg.rotation.x = .55;
    del(kule(7, 5), M.mork, legg, [0, 0, 0], [.05, .05, .05]);              // kne: ingen glipe når beinet bøyes
    del(syl(.048, .052, .13), M.mork, legg, [0, -.07, 0]);
    del(kule(7, 5), M.mork, legg, [0, -.14, .035], [.072, .045, .11]);
    for (const tx of [-1, 0, 1]) del(kule(5, 4), M.mork, legg, [tx * .03, -.15, .12], [.022, .022, .022]);
  }

  // Overkropp: pæreform, lys mage formet som en dråpe
  del(kule(9, 7), M.main, kropp, [0, .02, 0], [.165, .17, .145], [0, 0, 0], 'Torso_1');
  del(kule(8, 6), M.main, hofte, [0, .03, 0], [.13, .085, .115]);          // bekken: binder kroppen og beina sammen
  del(kule(8, 6), M.lys, kropp, [0, .0, .075], [.105, .135, .08]);
  del(new THREE.ConeGeometry(.06, .1, 6), M.lys, kropp, [0, .14, .1], [1, 1, .5], [Math.PI, 0, 0]);

  // Halsbånd med merke i robotgult (EVN-kjennetegnet)
  del(new THREE.TorusGeometry(.115, .024, 5, 12), M.gul, kropp, [0, .15, 0], [1, 1, .92], [Math.PI / 2, 0, 0]);
  del(syl(.042, .042, .016, 10), M.gul, kropp, [0, .1, .128], [1, 1, 1], [Math.PI / 2 - .2, 0, 0]);
  del(syl(.022, .022, .018, 8), M.mork, kropp, [0, .1, .136], [1, 1, 1], [Math.PI / 2 - .2, 0, 0]);

  // Armer: korte, med store votteformede poter og en tommel (kan holde redskaper)
  for (const sx of [-1, 1]) {
    const sk = ledd(sx < 0 ? 'UpperArm.L' : 'UpperArm.R', kropp, [sx * .132, .1, 0]);   // skulderen inne i kroppen
    let rz = sx * .32, rx = 0;
    if (stilling === 'vink' && sx > 0) { rz = 2.5; }
    if (uttrykk === 'jubel') { rz = sx * 2.6; }
    if (stilling === 'ga') rx = -sx * .5;
    if (stilling === 'hav') { rx = -1.0; rz = sx * .15; }
    if (lav) { rx = -.6; rz = sx * .25; }
    sk.rotation.set(rx, 0, rz);
    del(kule(7, 5), M.main, sk, [0, 0, 0], [.048, .048, .048]);            // skulderledd
    del(syl(.036, .031, .21), M.main, sk, [0, -.085, 0]);
    const pote = ledd(sx < 0 ? 'Palm2.L' : 'Palm2.R', sk, [0, -.2, 0]);
    del(kule(7, 5), M.mork, pote, [0, 0, 0], [.058, .064, .055]);
    del(kule(5, 4), M.mork, pote, [-sx * .045, .01, .03], [.022, .03, .022]);
  }
  if (stilling === 'hav') {   // håv i begge poter, skrått foran kroppen (som i Dyrepatruljen)
    const hav = new THREE.Group(); hav.position.set(0, .34, .2); hav.rotation.set(.5, 0, .5); rot.add(hav);
    del(syl(.012, .012, .7, 6), mat(0x8d6e63), hav, [0, 0, 0]);
    del(new THREE.TorusGeometry(.12, .012, 4, 14), mat(0x8d6e63), hav, [0, .44, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    del(new THREE.ConeGeometry(.11, .18, 10, 1, true), mat(0xe9f2f5, { transparent: true, opacity: .6, side: THREE.DoubleSide }), hav, [0, .35, 0], [1, 1, 1], [Math.PI, 0, 0]);
  }

  // Hale: stor og rund (forslag 2), fire ledd, hvit spiss
  const hale = ledd('Tail1', hofte, [0, .02, -.12]);
  hale.rotation.x = uttrykk === 'jubel' ? .2 : lav ? 1.1 : .55; hale.rotation.z = uttrykk === 'jubel' ? .35 : 0;
  del(kule(7, 5), M.main, hale, [0, 0, -.07], [.075, .075, .1]);
  const h2 = ledd('Tail2', hale, [0, .03, -.15]); h2.rotation.x = -.35;
  del(kule(8, 6), M.main, h2, [0, .02, -.05], [.125, .13, .14]);
  const h3 = ledd('Tail3', h2, [0, .08, -.14]); h3.rotation.x = -.45;
  del(kule(8, 6), M.main, h3, [0, .03, -.02], [.115, .12, .12]);
  del(kule(7, 5), M.lys, h3, [0, .09, .01], [.085, .095, .085]);

  // Hode (42 % av høyden, bredt) med hodeleddet «Head» og hodemeshen «Head_3» som garderoben bruker
  const hH = .42, hx = .28, hy = hH / 2, hz = .245;
  const nakke = ledd('Neck', kropp, [0, .16, 0]);
  const hode = ledd('Head', nakke, [0, (1 - hy) - .6, 0]);
  hode.rotation.z = uttrykk === 'nysgjerrig' ? .14 : 0;
  if (lav) hode.rotation.x = -.15;
  del(kule(10, 8), M.main, hode, [0, 0, 0], [hx, hy, hz], [0, 0, 0], 'Head_3');
  // kinn: tre lyse dotter på hver side
  for (const sx of [-1, 1]) {
    del(new THREE.ConeGeometry(.06, .13, 4), M.lys, hode, [sx * hx * .82, -hy * .42, hz * .3], [1, 1, .7], [0, 0, sx * 2.25]);
    del(new THREE.ConeGeometry(.05, .1, 4), M.lys, hode, [sx * hx * .7, -hy * .62, hz * .42], [1, 1, .7], [0, 0, sx * 2.7]);
    del(kule(6, 5), M.lys, hode, [sx * hx * .5, -hy * .55, hz * .62], [.07, .055, .07]);
  }
  // snute: kort og butt, lys underside, nese
  del(kule(8, 6), M.lys, hode, [0, -hy * .47, hz * .98], [.085, .058, .09]);
  del(kule(8, 6), M.main, hode, [0, -hy * .24, hz * 1.0], [.07, .055, .085]);
  del(kule(6, 5), M.mork, hode, [0, -hy * .3, hz * 1.33], [.034, .026, .026]);
  // munn bare ved jubel (åpent spørsmål til Even)
  if (uttrykk === 'jubel') del(new THREE.TorusGeometry(.03, .008, 4, 8, Math.PI), M.mork, hode, [0, -hy * .6, hz * 1.14], [1, 1, 1], [0, 0, Math.PI]);
  // øyne: store, mørke, to glanspunkt
  const ox = .115, oyY = hy * .1;
  const lukket = uttrykk === 'jubel', halv = uttrykk === 'snike';
  for (const sx of [-1, 1]) {
    if (lukket) {
      del(new THREE.TorusGeometry(.05, .013, 4, 8, Math.PI), M.mork, hode, [sx * ox, oyY - .01, hz * .9], [1, 1, 1], [0, sx * .35, 0]);
    } else {
      del(kule(9, 7), M.mork, hode, [sx * ox, oyY, hz * .84], [.088, halv ? .055 : .1, .045], [0, sx * .38, 0]);
      del(kule(5, 4), M.hvit, hode, [sx * ox - .028, oyY + (halv ? .015 : .035), hz * .84 + .04], [.022, .022, .012]);
      del(kule(4, 3), M.hvit, hode, [sx * ox + .022, oyY - .025, hz * .84 + .042], [.01, .01, .008]);
    }
    // bryn
    const L = { glad: [0, 0], nysgjerrig: sx < 0 ? [.02, -.1] : [.06, .3], jubel: [.05, .15], snike: [-.01, -.32], lei: [.02, .35] }[uttrykk] || [0, 0];
    del(new THREE.BoxGeometry(.1, .026, .03), M.mork, hode, [sx * ox, oyY + .125 + L[0], hz * .78], [1, 1, 1], [0, sx * .38, -sx * L[1]]);
  }
  // ører: brede (forslag 2), lys innside, mørk spiss
  const oreH = .21, oreB = .12, oreVinkel = { lei: .9, snike: .65 }[uttrykk] || .26;
  for (const sx of [-1, 1]) {
    const ore = ledd(sx < 0 ? 'Ear.L' : 'Ear.R', hode, [sx * hx * .5, hy * .8, -hz * .12]); ore.rotation.z = -sx * oreVinkel;
    if (uttrykk === 'snike' || uttrykk === 'lei') ore.rotation.x = -.5;
    del(new THREE.ConeGeometry(oreB, oreH, 4), M.main, ore, [0, oreH / 2, 0], [1, 1, .5], [0, Math.PI / 4, 0]);
    del(new THREE.ConeGeometry(oreB * .62, oreH * .68, 4), M.lys, ore, [0, oreH * .4, oreB * .2], [1, 1, .25], [0, Math.PI / 4, 0]);
    del(new THREE.ConeGeometry(oreB * .38, oreH * .34, 4), M.mork, ore, [0, oreH * .85, 0], [1, 1, .55], [0, Math.PI / 4, 0]);
  }
  rot.updateMatrixWorld(true);
  return rot;
}

window.EVNRevSkisse = { lagRev, FARGE };
})();
