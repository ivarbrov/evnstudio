// Måleoverlegg (samme felt som i trinn 1): FPS snitt og laveste 1 % over 30 s, tegnekall og trekanter
// (hovedpass, skyggepass og etterbehandling hver for seg), objekter, første bilde og JS-heap. Tallene ligger i window.__maal.
export function lagMaaling(renderer, vis) {
  const M = { kall: 0, skygge: 0, etter: 0, tri: 0, triSkygge: 0, iSkygge: false, iEtter: false, bilder: [], forste: 0 };
  const orig = renderer.renderBufferDirect.bind(renderer);
  renderer.renderBufferDirect = function (camera, scene, geometry, material, object, group) {
    let n = geometry.index ? geometry.index.count : geometry.attributes.position ? geometry.attributes.position.count : 0;
    n = Math.min(n, geometry.drawRange.count); if (group) n = Math.min(n, group.count);
    const inst = object.isInstancedMesh ? object.count : geometry.isInstancedBufferGeometry ? geometry.instanceCount : 1;
    const tri = object.isMesh ? n / 3 * inst : 0;
    if (M.iSkygge) { M.skygge++; M.triSkygge += tri; } else if (M.iEtter) M.etter++; else { M.kall++; M.tri += tri; }
    return orig(camera, scene, geometry, material, object, group);
  };
  const sm = renderer.shadowMap, origS = sm.render.bind(sm);
  sm.render = function (...a) { M.iSkygge = true; try { return origS(...a); } finally { M.iSkygge = false; } };
  let el = null;
  if (vis) { el = document.createElement('pre'); el.id = 'maal'; document.body.appendChild(el); }
  let sist = performance.now(), sistVis = 0;
  return {
    startBilde() { M.kall = M.skygge = M.etter = M.tri = M.triSkygge = 0; },
    etter(på) { M.iEtter = på; },
    sluttBilde(info) {
      const n = performance.now(), dt = n - sist; sist = n;
      if (!M.forste) M.forste = Math.round(n);
      M.bilder.push([n, dt]); while (M.bilder.length && n - M.bilder[0][0] > 30000) M.bilder.shift();
      if (n - sistVis < 1000) return; sistVis = n;
      const d = M.bilder.map(b => b[1]).sort((a, b) => b - a), snitt = 1000 / (d.reduce((a, b) => a + b, 0) / d.length), lav = 1000 / (d[Math.floor(d.length * .01)] || d[0]);
      window.__maal = Object.assign({ fps: +snitt.toFixed(1), fps1lav: +lav.toFixed(1), tegnekall: M.kall, skyggekall: M.skygge, etterkall: M.etter, tegnekallTotalt: M.kall + M.skygge + M.etter, trekanter: Math.round(M.tri), trekanterSkygge: Math.round(M.triSkygge), forsteBildeMs: M.forste, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, sekunder: Math.round((M.bilder.at(-1)[0] - M.bilder[0][0]) / 1000) }, info());
      if (el) { const m = window.__maal; el.textContent = `Stil ${m.stil} · ${m.kvalitet} · DPR ${m.dpr}\nFPS ${m.fps} (1 % lav ${m.fps1lav}, ${m.sekunder} s)\nTegnekall ${m.tegnekall} + skygge ${m.skyggekall} + etter ${m.etterkall} = ${m.tegnekallTotalt}\nTrekanter ${(m.trekanter / 1e6).toFixed(2)} M (skygge ${(m.trekanterSkygge / 1e6).toFixed(2)} M)\nTrær nær ${m.traerNaer} · langt ${m.traerLangt}\nFørste bilde ${m.forsteBildeMs} ms` + (m.heapMB ? ` · heap ${m.heapMB} MB` : ''); }
    },
  };
}
