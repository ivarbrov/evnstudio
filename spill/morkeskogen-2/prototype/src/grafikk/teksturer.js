// Teksturer laget i kode (ingen lisensspørsmål): bakke, skogbunn, sti og stein.
// Sømløse (periodisk støy), med normalkart beregnet fra en høydefunksjon.
import * as THREE from 'three';

function perStoy(N, P, frø) {          // periodisk verdistøy på et P×P-rutenett
  const g = new Float32Array(P * P); let s = frø;
  for (let i = 0; i < g.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; g[i] = s / 0x7fffffff; }
  const out = new Float32Array(N * N), k = P / N, sm = t => t * t * (3 - 2 * t);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const fx = x * k, fy = y * k, xi = Math.floor(fx), yi = Math.floor(fy), u = sm(fx - xi), v = sm(fy - yi);
    const x1 = (xi + 1) % P, y1 = (yi + 1) % P;
    const a = g[yi * P + xi], b = g[yi * P + x1], c = g[y1 * P + xi], d = g[y1 * P + x1];
    out[y * N + x] = a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  return out;
}
function fbmMap(N, frø, oktaver) {     // oktaver: [[periode, vekt], ...]
  const out = new Float32Array(N * N); let sum = 0;
  oktaver.forEach(([P, w], i) => { const m = perStoy(N, P, frø + i * 977); for (let j = 0; j < out.length; j++) out[j] += m[j] * w; sum += w; });
  for (let j = 0; j < out.length; j++) out[j] /= sum;
  return out;
}

function tilTekstur(N, rgb, srgb) {
  const t = new THREE.DataTexture(rgb, N, N, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true; t.anisotropy = 4; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
}
function normalFra(N, h, styrke) {
  const d = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x, l = h[y * N + (x + N - 1) % N], r = h[y * N + (x + 1) % N], u = h[((y + N - 1) % N) * N + x], dn = h[((y + 1) % N) * N + x];
    let nx = (l - r) * styrke, ny = (u - dn) * styrke, nz = 1; const L = Math.hypot(nx, ny, nz); nx /= L; ny /= L; nz /= L;
    d[i * 4] = (nx * .5 + .5) * 255; d[i * 4 + 1] = (ny * .5 + .5) * 255; d[i * 4 + 2] = (nz * .5 + .5) * 255; d[i * 4 + 3] = 255;
  }
  return tilTekstur(N, d, false);
}
const mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Lager ett bakkesett (farge + normal) for et underlag. palett: [mørk, lys, flekk]
function underlag(N, frø, palett, detalj, normStyrke, flekker) {
  const grov = fbmMap(N, frø, [[4, 1], [8, .6], [16, .35]]), fin = fbmMap(N, frø + 50, [[32, 1], [64, .8], [128, .6]]);
  const fl = fbmMap(N, frø + 90, [[16, 1], [32, .7]]);
  const rgb = new Uint8Array(N * N * 4), h = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    let c = mixC(palett[0], palett[1], Math.min(1, Math.max(0, grov[i] * 1.6 - .3 + (fin[i] - .5) * detalj)));
    const f = Math.max(0, (fl[i] - (1 - flekker)) / flekker); c = mixC(c, palett[2], Math.min(1, f * 2.2));
    rgb[i * 4] = c[0]; rgb[i * 4 + 1] = c[1]; rgb[i * 4 + 2] = c[2]; rgb[i * 4 + 3] = 255;
    h[i] = grov[i] * .4 + fin[i];
  }
  return { farge: tilTekstur(N, rgb, true), normal: normalFra(N, h, normStyrke) };
}

export function lagBakkeTeksturer(stil, N = 512) {
  if (stil === 1) {   // stilisert eventyr: rene, myke flater med lite støy
    return {
      gress: underlag(N, 11, [[70, 128, 44], [104, 160, 60], [128, 170, 66]], .25, 1.5, .25),
      skogbunn: underlag(N, 21, [[66, 104, 48], [96, 128, 56], [132, 104, 60]], .3, 2, .3),
      sti: underlag(N, 31, [[150, 112, 72], [186, 148, 98], [120, 96, 70]], .3, 2, .2),
      stein: underlag(N, 41, [[118, 120, 128], [160, 162, 168], [96, 112, 92]], .4, 3, .25),
    };
  }
  return {            // stilisert naturalisme: mer detalj, variasjon og relieff
    gress: underlag(N, 12, [[48, 74, 30], [80, 104, 44], [104, 100, 52]], .9, 6, .35),
    skogbunn: underlag(N, 22, [[56, 50, 32], [92, 82, 50], [62, 86, 40]], 1.0, 8, .45),
    sti: underlag(N, 32, [[100, 82, 60], [140, 118, 88], [84, 76, 64]], 1.0, 9, .3),
    stein: underlag(N, 42, [[92, 94, 98], [148, 146, 140], [78, 96, 62]], 1.1, 10, .3),
  };
}
