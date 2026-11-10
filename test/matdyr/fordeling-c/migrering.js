// Forslag til lagringsmigrering for alternativ C (bestefarsregel). IKKE KOBLET TIL SPILLET.
// Gjelder begge lagringsformatene:
//   produksjon  (spill/matdyr, nøkkel evn-matdyr-v1):          {v:1, money, level, base, disc, name, carry, cb, intro}
//   prototype   (prototype/matdyr-fase2, evn-matdyr-gard-proto): {v:1, penger, gard:{niva}, plassNiva, base, disc, bestilling}
// Prinsipp:
//  - Ingen felt endres eller fjernes. Vi legger bare til  fordeling:"c"  og  arv  (arvet sjeldenhet per eid dyr).
//  - v forblir 1. Eldre kode leser lagringen som før og ignorerer de nye feltene (trygg tilbakerulling).
//  - arv lagres bare der den arvede kategorien avviker fra den nye tabellen. Tomt arv = ingen avvik.
//  - Modus "beste": eid dyr får max(gammel, ny). Bare dyr som ville gått NED, får arv.
//    Modus "streng": eid dyr beholder nøyaktig gammel kategori. Alle dyr som endres, får arv.
const N_ID = 1000;
const gyldigCi = v => Number.isInteger(v) && v >= 0 && v < N_ID;
const gyldigR = v => Number.isInteger(v) && v >= 0 && v <= 6;

function arvFor(ci, GML, NY, modus) {
  const g = GML[ci], n = NY[ci];
  const eff = modus === 'streng' ? g : Math.max(g, n);
  return eff === n ? null : eff;
}

// Returnerer {lagring, endret, feil}. Kaster aldri. Ved ugyldig inndata returneres lagring:null og feil satt,
// slik at kallet IKKE skal overskrive det som ligger lagret (kjent svakhet i dag: korrupt lagring overskrives).
function migrer(s, GML, NY, modus = 'beste') {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return { lagring: null, endret: false, feil: 'ikke et objekt' };
  if (s.v !== 1) return { lagring: null, endret: false, feil: 'ukjent versjon' };
  if (s.fordeling === 'c') return { lagring: normaliserArv(s), endret: false, feil: null };   // allerede migrert
  const o = JSON.parse(JSON.stringify(s));
  const base = Array.isArray(o.base) ? o.base : [];
  const arv = {};
  base.forEach((ci, i) => { if (gyldigCi(ci)) { const a = arvFor(ci, GML, NY, modus); if (a !== null) arv[i] = a; } });
  if (gyldigCi(o.carry)) { const a = arvFor(o.carry, GML, NY, modus); if (a !== null) arv.bar = a; }
  o.fordeling = 'c'; o.arvModus = modus; o.arv = arv;
  o.discC = [];   // funn gjort etter overgangen. Gullramme på Food God/Secret i boka krever funn her.
  return { lagring: o, endret: true, feil: null };
}
function normaliserArv(s) {
  const o = JSON.parse(JSON.stringify(s)); const arv = {};
  const a = o.arv && typeof o.arv === 'object' ? o.arv : {};
  const base = Array.isArray(o.base) ? o.base : [];
  for (const [k, r] of Object.entries(a)) {
    if (!gyldigR(r)) continue;
    if (k === 'bar' && gyldigCi(o.carry)) arv.bar = r;
    else if (/^\d+$/.test(k) && gyldigCi(base[+k])) arv[k] = r;
  }
  o.arv = arv;
  o.discC = (Array.isArray(o.discC) ? o.discC : []).filter(gyldigCi);
  return o;
}
// Effektiv kategori for et dyr i en plass ('bar' = dyret roboten bærer)
function effR(s, plass, NY) {
  const ci = plass === 'bar' ? s.carry : s.base[plass];
  if (!gyldigCi(ci)) return -1;
  const a = s.arv && s.arv[plass];
  return gyldigR(a) ? a : NY[ci];
}
// Når et dyr flyttes, selges, leveres eller byttes, følger eller fjernes arven (alle steder spillet endrer base/carry)
const flytt = (s, fra, til) => { if (!s.arv) return; if (s.arv[fra] !== undefined) s.arv[til] = s.arv[fra]; else delete s.arv[til]; delete s.arv[fra]; };
const fjern = (s, plass) => { if (s.arv) delete s.arv[plass]; };
// Gårdsnivå-krav: [art, antall, min]. Bruker effektiv kategori.
function passerKrav(s, plass, kr, NY, ART_AV) { const ci = s.base[plass]; return gyldigCi(ci) && (kr[0] === null || ART_AV(ci) === kr[0]) && effR(s, plass, NY) >= kr[2]; }
// Matdyrboka: figurens kategori i boka er alltid den nye. Eide arvede eksemplarer vises i tillegg.
function bokVisning(s, ci, NY) {
  const funnet = Array.isArray(s.disc) && s.disc.includes(ci);
  const eide = []; (s.base || []).forEach((c, i) => { if (c === ci) eide.push(effR(s, i, NY)); }); if (s.carry === ci) eide.push(effR(s, 'bar', NY));
  const nyttFunn = Array.isArray(s.discC) && s.discC.includes(ci);
  // Food God og Secret får gullramme bare når figuren er funnet i ny utgave. Ellers vises «eldre utgave funnet».
  return { funnet, kategori: NY[ci], arvet: [...new Set(eide.filter(r => r !== NY[ci]))], gullramme: NY[ci] >= 5 ? nyttFunn : funnet, eldreUtgave: funnet && NY[ci] >= 5 && !nyttFunn };
}
module.exports = { migrer, effR, flytt, fjern, passerKrav, bokVisning, arvFor };
