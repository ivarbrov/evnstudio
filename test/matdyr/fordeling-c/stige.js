// Alternativ C (vurdering, ikke i spillet): lik sjeldenhetsstige per art.
// Hver art: 6 Common, 5 Rare, 5 Epic, 4 Legendary, 3 Mythic, 1 Food God, 1 Secret.
// Alle 1 000 ID-er beholdes. Bare kategorien (r) per ID beregnes på nytt.
// Fordelingsregel (minst mulig endring): faste figurer beholder kategorien. De øvrige matrettene i arten
// sorteres etter dagens kategori, så dagens multiplikator, så mat-indeks, og får resten av stigen i samme rekkefølge.
// Rekkefølgen innen arten blir altså bevart: et dyr som var sjeldnere enn et annet i samme art, er det fortsatt.
const D = require('../data.js');
const { COMBOS, FOODS, ANIMALS } = D;
const STIGE = [0,0,0,0,0,0, 1,1,1,1,1, 2,2,2,2,2, 3,3,3,3, 4,4,4, 5, 6];
// Faste figurer [art, mat, kategori]. Samme som de faste figurene i data.js, i tillegg til Óðinn og Loki.
const FASTE = [
  ['gris','Smultring',0], ['mus','Oste',0], ['frosk','Pizza',1], ['ape','Banan',1], ['ku','Melke',1],
  ['pingvin','Pølse',2], ['frosk','Kakao',2], ['hai','Taco',3], ['blekksprut','Spagetti',4],
  ['hval','Burger',5], ['dinosaur','Sjoko',6]];
const id = (art, mat) => ANIMALS.findIndex(a => a[1] === art) * FOODS.length + FOODS.findIndex(f => f[1] === mat);
function byggC() {
  const ny = new Array(COMBOS.length).fill(-1);
  const fast = new Map(FASTE.map(([a, m, r]) => [id(a, m), r]));
  for (let ai = 0; ai < ANIMALS.length; ai++) {
    const ids = [...Array(FOODS.length)].map((_, fi) => ai * FOODS.length + fi);
    const rest = STIGE.slice();
    for (const ci of ids) if (fast.has(ci)) { const r = fast.get(ci); rest.splice(rest.indexOf(r), 1); ny[ci] = r; }
    const fri = ids.filter(ci => !fast.has(ci)).sort((a, b) => COMBOS[a].r - COMBOS[b].r || COMBOS[a].m - COMBOS[b].m || a - b);
    fri.forEach((ci, k) => { ny[ci] = rest[k]; });
  }
  return ny;
}
const NY = byggC();
module.exports = { STIGE, FASTE, NY, id };
if (require.main === module) {
  const N = ['Common','Rare','Epic','Legendary','Mythic','Food God','Secret'];
  const tell = a => N.map((_, r) => a.filter(x => x === r).length);
  const gml = COMBOS.map(c => c.r);
  console.log('I dag :', tell(gml).join(' / '));
  console.log('Alt C :', tell(NY).join(' / '));
  let opp = 0, ned = 0, lik = 0; const flytt = {};
  NY.forEach((r, i) => { const g = gml[i]; if (r > g) opp++; else if (r < g) ned++; else lik++; const k = N[g] + ' → ' + N[r]; flytt[k] = (flytt[k] || 0) + 1; });
  console.log('Uendret', lik, 'Opp', opp, 'Ned', ned);
  console.log(Object.entries(flytt).filter(([k]) => !k.startsWith(k.split(' → ')[1] + ' →')).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ': ' + v).join('\n'));
  // kontroll: hver art har nøyaktig stigen
  for (let ai = 0; ai < 40; ai++) { const s = NY.slice(ai * 25, ai * 25 + 25).sort((a, b) => a - b).join(); if (s !== STIGE.join()) throw new Error('feil stige ' + ANIMALS[ai][1]); }
  console.log('Alle 40 arter har stigen 6/5/5/4/3/1/1. Óðinn:', N[NY[id('hval','Burger')]], 'Loki:', N[NY[id('dinosaur','Sjoko')]], 'ID 307', COMBOS[307].name, N[gml[307]], '→', N[NY[307]]);
}
