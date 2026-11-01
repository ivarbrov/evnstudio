// Innebygd ytelsestest: tre faste scener à 20 s (etter 3 s oppvarming), eller en varmetest på 10 min.
// Helten går i en fast sirkel, så LOD, utsortering og skygger oppdateres som i vanlig spill.
const SCENER = [
  { navn: 'Dag ved bålet, kamera bak', tid: 'dag', modus: 'near', x: 70, z: 40, monstre: 0 },
  { navn: 'Natt ved bålet, 3 monstre', tid: 'natt', modus: 'near', x: 70, z: 40, monstre: 3 },
  { navn: 'Dag i skogen, kamera ovenfra', tid: 'dag', modus: 'far', x: -120, z: 380, monstre: 0 },
];

export function lagYtelsestest(api) {
  let aktiv = null;
  const enhet = () => {
    let gpu = 'ukjent';
    try { const gl = api.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (_) {}
    return { nettleser: navigator.userAgent, skjerm: `${screen.width}×${screen.height}`, vindu: `${innerWidth}×${innerHeight}`, dpr: devicePixelRatio, gpu };
  };
  function kjør(varme = false) {
    if (aktiv) return;
    const plan = varme ? [{ ...SCENER[0], navn: 'Varmetest 10 min (dag ved bålet)', lengde: 600 }] : SCENER.map(s => ({ ...s, lengde: 20 }));
    aktiv = { plan, i: -1, t: 0, bilder: [], res: [], per: [], start: performance.now() };
    neste();
  }
  function neste() {
    const A = aktiv; A.i++;
    if (A.i >= A.plan.length) return ferdig();
    const S = A.plan[A.i]; A.t = -3; A.bilder = []; A.per = []; A.vinkel = 0;
    api.forbered(S);
    api.status(`📊 ${A.i + 1}/${A.plan.length}: ${S.navn} …`);
  }
  // Kalles hver frame med ekte frametid (ms). Returnerer styring for helten mens testen pågår.
  function steg(dtMs) {
    const A = aktiv; if (!A) return null;
    const S = A.plan[A.i], dt = dtMs / 1000;
    A.t += dt; A.vinkel += dt * 0.35;
    if (A.t > 0) {
      A.bilder.push(dtMs);
      if (S.lengde > 60) { const min = Math.floor(A.t / 60); (A.per[min] || (A.per[min] = [])).push(dtMs); }
      if (A.t >= S.lengde) {
        const m = window.__maal || {};
        A.res.push(Object.assign({ scene: S.navn }, stat(A.bilder), { tegnekall: m.tegnekallTotalt, trekanter: m.trekanter, skyggeTrekanter: m.trekanterSkygge }, S.lengde > 60 ? { perMinutt: A.per.map(f => stat(f).fps) } : {}));
        neste(); return aktiv ? { dx: 0, dy: 0 } : null;
      }
      if (Math.floor(A.t) !== Math.floor(A.t - dt)) api.status(`📊 ${A.i + 1}/${A.plan.length}: ${S.navn} – ${Math.ceil(S.lengde - A.t)} s igjen`);
    }
    return { dx: Math.cos(A.vinkel), dy: Math.sin(A.vinkel), mengde: .6 };   // går rolig i sirkel
  }
  function stat(f) {
    const s = [...f].sort((a, b) => b - a), snitt = f.reduce((a, b) => a + b, 0) / f.length;
    return { fps: +(1000 / snitt).toFixed(1), fps1lav: +(1000 / s[Math.floor(s.length * .01)]).toFixed(1), tregeBilder: f.filter(x => x > 50).length, bilder: f.length };
  }
  function ferdig() {
    const A = aktiv; aktiv = null;
    const rapport = { prototype: api.versjon, dato: new Date().toISOString(), stil: api.stil(), kvalitet: api.kvalitet(), dprBrukt: api.renderer.getPixelRatio(), enhet: enhet(), resultater: A.res };
    api.status(''); api.vis(rapport);
  }
  return { kjør, steg, aktiv: () => !!aktiv };
}
