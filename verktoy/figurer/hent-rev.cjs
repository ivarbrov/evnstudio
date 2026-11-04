// Henter revens former og ledd fra godkjenningsmodellen (prototype/figurer/rev/rev-modell.js) til JSON for Blender.
// Bruk: node hent-rev.cjs <three-r128.min.js> <rev-modell.js> <ut.json>
const fs = require('fs');
const [THREEFIL, REVFIL, UT] = process.argv.slice(2);
global.window = global; global.self = global;
global.THREE = require(require('path').resolve(THREEFIL));
eval(fs.readFileSync(REVFIL, 'utf8'));
const rev = window.EVNRevSkisse.lagRev('glad', 'sta');
rev.updateMatrixWorld(true);
const hex = c => '#' + c.clone().convertLinearToSRGB().getHexString();
const ledd = [], deler = [];
rev.traverse(o => {
  if (o.isBone) {
    let f = o.parent; while (f && !f.isBone) f = f.parent;
    const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
    ledd.push({ navn: o.name, forelder: f ? f.name : null, pos: p.toArray() });
  }
  if (o.isMesh) {
    let b = o.parent; while (b && !b.isBone) b = b.parent;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    const m = o.material;
    deler.push({ navn: o.name || '', ledd: b ? b.name : 'Hips', farge: hex(m.color), ruhet: m.roughness, metall: m.metalness,
      gjennomsiktig: !!m.transparent, pos: Array.from(g.attributes.position.array) });
  }
});
fs.writeFileSync(UT, JSON.stringify({ ledd, deler }));
console.log('ledd', ledd.length, 'deler', deler.length, 'trekanter', deler.reduce((s, d) => s + d.pos.length / 9, 0));
