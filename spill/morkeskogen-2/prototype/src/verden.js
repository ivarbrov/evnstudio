// Spillogikkens verden for prototypen: terrenghøyde, plassering av trær, busker, steiner, bål og hytte.
// Ingen three.js her. Samme frø gir samme verden i begge stilene, så de kan sammenlignes direkte.
// Måleenheter og tall er de samme som i Mørkeskogen 5.6.2 (helten er ca. 90–100 enheter høy, fart 170/s).

export function lagRng(frø) {
  let s = frø >>> 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Enkel, deterministisk verdistøy
function hash2(x, y) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
const glatt = t => t * t * (3 - 2 * t);
export function stoy(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = glatt(xf), v = glatt(yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, okt = 4) { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < okt; i++) { s += a * stoy(x * f, y * f); n += a; a *= 0.5; f *= 2.03; } return s / n; }
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export const VERDEN = {
  halv: 1800,          // terrenget går fra -1800 til 1800 (synlig til tåka)
  spillHalv: 1450,     // helten holdes innenfor dette
  bal: { x: 0, z: 0 },
  start: { x: 70, z: 40 },   // som i 5.6.2: 70 og 40 enheter fra bålet
  hytte: { x: 300, z: -330, rot: -0.6 },
};

// Sti fra bålet forbi hytta og videre ut
const STI = [[0, 0], [150, -160], [300, -260], [520, -420], [900, -560], [1500, -700]];
export function stiAvstand(x, z) {
  let best = 1e9;
  for (let i = 0; i < STI.length - 1; i++) {
    const [ax, az] = STI[i], [bx, bz] = STI[i + 1], dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return best;
}

export function bakkeH(x, z) {
  const r = Math.hypot(x, z);
  let h = 46 * (fbm(x / 900 + 3.1, z / 900 + 7.7, 3) - 0.5) + 14 * (fbm(x / 230, z / 230, 3) - 0.5);
  h *= sstep(160, 460, r);                                   // flatt rundt bålet
  const H = VERDEN.hytte, hr = Math.hypot(x - H.x, z - H.z);
  h = h + (bakkeHRaw(H.x, H.z) - h) * (1 - sstep(70, 150, hr)); // flat tomt under hytta
  return h;
}
function bakkeHRaw(x, z) { const r = Math.hypot(x, z); return (46 * (fbm(x / 900 + 3.1, z / 900 + 7.7, 3) - 0.5) + 14 * (fbm(x / 230, z / 230, 3) - 0.5)) * sstep(160, 460, r); }

export function skogTetthet(x, z) { return sstep(0.33, 0.62, fbm(x / 520 + 11, z / 520 - 4, 3)); }

// Plassering som i 5.6.2: gran i tett skog, furu på høyder, løvtrær lavt og fuktig, bjørk i kanter
export function lagVerden(frø = 424242) {
  const R = lagRng(frø), rand = (a, b) => a + (b - a) * R();
  const traer = [], busker = [], steiner = [];
  const nær = (liste, x, z, d) => liste.some(o => (o.x - x) ** 2 + (o.z - z) ** 2 < d * d);
  const H = VERDEN.hytte, M = VERDEN.halv - 60;
  let forsok = 0;
  // Tetthet tilpasset 5.6.2: ca. 124 trær i 1 500 × 1 500 rundt bålet
  while (traer.length < 690 && forsok++ < 120000) {
    const x = rand(-M, M), z = rand(-M, M), dens = skogTetthet(x, z);
    if (R() > 0.12 + dens * 0.88) continue;
    if (Math.hypot(x, z) < 220 || Math.hypot(x - H.x, z - H.z) < 140 || stiAvstand(x, z) < 45) continue;
    if (nær(traer, x, z, 38 + (1 - dens) * 22)) continue;
    const h = bakkeH(x, z), fukt = fbm(x / 400 - 9, z / 400 + 2, 2);
    const w = { gran: .25 + dens * 1.1, furu: .12 + sstep(5, 22, h) * 1.1 + (1 - fukt) * .25, lov: .08 + fukt * 1.0 + (h < -5 ? .3 : 0), bjork: .12 + (1 - dens) * .9 };
    let r = R() * (w.gran + w.furu + w.lov + w.bjork), art = 'gran';
    for (const k in w) { r -= w[k]; if (r <= 0) { art = k; break; } }
    traer.push({ id: traer.length, x, z, art, s: rand(0.85, 1.2), rot: R() * Math.PI * 2, var: R() < 0.5 ? 0 : 1, hp: 6, maks: 6, levende: true, rist: 0, fall: 0 });
  }
  forsok = 0;
  while (busker.length < 60 && forsok++ < 20000) {
    const x = rand(-M, M), z = rand(-M, M);
    if (Math.hypot(x, z) < 150 || Math.hypot(x - H.x, z - H.z) < 120 || stiAvstand(x, z) < 40 || nær(traer, x, z, 40) || nær(busker, x, z, 80)) continue;
    busker.push({ x, z, s: rand(0.8, 1.2), rot: R() * 6.28 });
  }
  forsok = 0;
  while (steiner.length < 75 && forsok++ < 20000) {
    const x = rand(-M, M), z = rand(-M, M);
    if (Math.hypot(x, z) < 120 || Math.hypot(x - H.x, z - H.z) < 110 || stiAvstand(x, z) < 30 || nær(traer, x, z, 30) || nær(steiner, x, z, 60)) continue;
    steiner.push({ x, z, s: rand(0.6, 1.5), rot: R() * 6.28, var: R() < 0.5 ? 0 : 1 });
  }
  return { traer, busker, steiner };
}

// Kollisjon helt mot trær, hytte og bål (sirkler og en rotert boks)
export function skyvUt(p, verden, r = 14) {
  for (const t of verden.traer) {
    if (!t.levende) continue;
    const dx = p.x - t.x, dz = p.z - t.z, rr = r + 11 * t.s;
    if (Math.abs(dx) < rr && Math.abs(dz) < rr) { const d = Math.hypot(dx, dz); if (d < rr && d > 1e-3) { p.x = t.x + dx / d * rr; p.z = t.z + dz / d * rr; } }
  }
  const H = VERDEN.hytte, c = Math.cos(-H.rot), s = Math.sin(-H.rot);
  let lx = (p.x - H.x) * c - (p.z - H.z) * s, lz = (p.x - H.x) * s + (p.z - H.z) * c;
  const hx = 50 + r, hz = 40 + r;
  if (Math.abs(lx) < hx && Math.abs(lz) < hz) {
    if (hx - Math.abs(lx) < hz - Math.abs(lz)) lx = Math.sign(lx) * hx; else lz = Math.sign(lz) * hz;
    p.x = H.x + lx * c + lz * s; p.z = H.z - lx * s + lz * c;
  }
  const db = Math.hypot(p.x, p.z), rb = 30 + r;                // ikke gå inn i bålet
  if (db < rb && db > 1e-3) { p.x = p.x / db * rb; p.z = p.z / db * rb; }
  const L = VERDEN.spillHalv; p.x = Math.max(-L, Math.min(L, p.x)); p.z = Math.max(-L, Math.min(L, p.z));
}
