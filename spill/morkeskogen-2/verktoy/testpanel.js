// Testpanel for iPhone-testen av Mørkeskogen 2.0 (bare i testkopien). Leser bare tellere; endrer ikke spillet.
(() => {
  const orig = /kamera[=-]original/.test(location.hash) || (() => { try { return sessionStorage.getItem('evnKamera') === 'original'; } catch (e) { return false; } })();
  const p = document.createElement('div');
  p.style.cssText = 'position:fixed;left:50%;top:4px;transform:translateX(-50%);z-index:99999;background:rgba(0,0,0,.65);color:#fff;font:12px/1.3 system-ui;padding:4px 8px;border-radius:8px;display:flex;gap:6px;align-items:center;pointer-events:auto';
  p.innerHTML = `<b>TEST</b><span id="tpK">Kamera: ${orig ? 'som 5.6.2' : 'nytt'}</span><button id="tpB">Bytt kamera</button><button id="tpM">Mål 60 s</button><span id="tpF"></span>`;
  for (const b of p.querySelectorAll('button')) b.style.cssText = 'font:12px system-ui;padding:3px 6px;border-radius:6px;border:0';
  document.body.appendChild(p);
  p.querySelector('#tpB').onclick = () => { try { sessionStorage.setItem('evnKamera', orig ? 'ny' : 'original'); } catch (e) {} location.hash = orig ? '' : 'kamera-original'; location.reload(); };
  // Bildetider: rAF-tidsstempler (uavhengig av spillets egen løkke)
  const tider = []; let sist = 0, måling = null;
  const f = document.getElementById('tpF');
  (function løkke(t) {
    if (sist) { const d = t - sist; tider.push(d); if (tider.length > 600) tider.shift(); if (måling && !document.hidden) måling.d.push(d); }
    sist = t; requestAnimationFrame(løkke);
  })(performance.now());
  setInterval(() => {
    const s = tider.slice(-60), fps = s.length ? 1000 / (s.reduce((a, b) => a + b, 0) / s.length) : 0;
    const R3 = window.__testR3 && window.__testR3(), info = R3 && R3.renderer.info.render;
    const G = window.__testG && window.__testG(); let tonet = 0; if (G && G.trees) for (const t of G.trees) if (t._m && t._m.fade2 < .97 && t._m.grp.visible) tonet++;
    f.textContent = `${fps.toFixed(0)} FPS · ${info ? info.calls : '?'} kall${orig ? '' : ' · tonet: ' + tonet}`;
  }, 1000);
  document.addEventListener('visibilitychange', () => { if (document.hidden && måling) { måling.avbrudd++; } });
  p.querySelector('#tpM').onclick = () => {
    if (måling) return; måling = { d: [], avbrudd: 0, start: performance.now() }; const knapp = p.querySelector('#tpM'); knapp.textContent = 'Måler …';
    setTimeout(() => {
      const d = måling.d.slice().sort((a, b) => b - a), sum = måling.d.reduce((a, b) => a + b, 0), n = måling.d.length;
      const p99 = d[Math.floor(n * .01)] || 0, R3 = window.__testR3 && window.__testR3();
      const r = { kamera: orig ? 'som 5.6.2' : 'nytt', sekunder: +(sum / 1000).toFixed(1), bilder: n, fps: +(n / (sum / 1000)).toFixed(1), fps1lav: p99 ? +(1000 / p99).toFixed(1) : 0,
        verstMs: +(d[0] || 0).toFixed(1), hakkOver100ms: måling.d.filter(x => x > 100).length, avbrudd: måling.avbrudd, dpr: R3 ? R3.renderer.getPixelRatio() : null,
        tegnekall: R3 ? R3.renderer.info.render.calls : null, trekanter: R3 ? R3.renderer.info.render.triangles : null, skjerm: [innerWidth, innerHeight], enhet: navigator.userAgent.slice(0, 90), tid: new Date().toISOString() };
      r.status = r.avbrudd ? 'UGYLDIG (appen var i bakgrunnen)' : 'GYLDIG';
      måling = null; knapp.textContent = 'Mål 60 s';
      const txt = JSON.stringify(r, null, 1), boks = document.createElement('textarea');
      boks.value = txt; boks.readOnly = true; boks.style.cssText = 'position:fixed;left:5%;top:15%;width:90%;height:60%;z-index:100000;font:12px monospace';
      boks.onclick = () => { boks.select(); try { navigator.clipboard.writeText(txt); } catch (e) {} };
      const lukk = document.createElement('button'); lukk.textContent = 'Lukk (resultatet er kopiert når du trykker i feltet)'; lukk.style.cssText = 'position:fixed;left:5%;top:calc(75% + 8px);z-index:100000;padding:8px';
      lukk.onclick = () => { boks.remove(); lukk.remove(); };
      document.body.append(boks, lukk);
    }, 60000);
  };
})();
