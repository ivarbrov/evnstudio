// Ytelsestest v2 (2.0-proto.3). Erstatter v1, som regnet pauser i nettleseren som testtid.
//
// Prinsipper:
// - Bare AKTIV tid teller. Et bilde med frametid > 500 ms (under 2 FPS), eller en periode der siden er skjult
//   (visibilitychange/pagehide/blur), er et AVBRUDD: nettleseren tegnet ikke. Det er ikke lav FPS.
// - Et avbrudd gjør testen UGYLDIG. Testen stopper, og delresultatet vises merket som ufullstendig.
// - FPS = antall bilder / aktiv tid (tidsvektet). «1 % lav» = 99-persentilen av frametidene.
// - Minuttverdiene gjelder hele minutter med aktiv tid. Et påbegynt minutt vises som delvis.
// - Status: BESTÅTT / IKKE BESTÅTT / UGYLDIG TEST.
const AVBRUDD_MS = 500, ALLTID_AVBRUDD_MS = 5000, HAKK_MS = 100, OPPVARMING_S = 3;
const SCENER = [
  { navn: 'Dag ved bålet, kamera bak', tid: 'dag', modus: 'near', x: 70, z: 40, monstre: 0 },
  { navn: 'Natt ved bålet, 3 monstre', tid: 'natt', modus: 'near', x: 70, z: 40, monstre: 3 },
  { navn: 'Dag i skogen, kamera ovenfra', tid: 'dag', modus: 'far', x: -120, z: 380, monstre: 0 },
];

export function lagYtelsestest(api) {
  let A = null, wakeLock = null;
  const logg = (type, tekst) => { if (A) A.hendelser.push({ type, tekst, aktivTid: +A.aktiv.toFixed(1), klokke: +((performance.now() - A.start) / 1000).toFixed(1) }); };
  const påVis = () => { if (A && document.hidden) avbryt('Siden ble skjult (skjermlås, appbytte eller annen fane)'); };
  const påSkjul = () => avbryt('Siden ble lagt bort (pagehide)');
  const påBlur = () => logg('fokus', 'Vinduet mistet fokus');
  const påResize = () => logg('størrelse', `Vindu ${innerWidth}×${innerHeight}`);

  function enhet() {
    let gpu = 'ukjent';
    try { const gl = api.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (_) {}
    let ramme = 'ukjent'; try { ramme = window.self !== window.top ? 'iframe (f.eks. Claude-artefakt)' : 'egen side'; } catch (_) { ramme = 'iframe (annet domene)'; }
    return { nettleser: navigator.userAgent, skjerm: `${screen.width}×${screen.height}`, vindu: `${innerWidth}×${innerHeight}`, dpr: devicePixelRatio, gpu, ramme, berøring: matchMedia('(pointer: coarse)').matches };
  }
  async function holdSkjermPå() {
    try { if ('wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); return 'aktiv'; } return 'ikke støttet'; }
    catch (e) { return 'avvist (' + (e.name || 'feil') + ')'; }
  }
  async function kjør(varme = false) {
    if (A) return;
    const mål = matchMedia('(pointer: coarse)').matches ? 30 : 60;
    const plan = varme ? [{ ...SCENER[0], navn: 'Varmetest 10 min (dag ved bålet)', lengde: 600 }] : SCENER.map(s => ({ ...s, lengde: 20 }));
    const skjermlås = await holdSkjermPå();                      // før testen starter, så ingen bilder måles under ventingen
    A = { plan, i: -1, mål, varme, start: performance.now(), aktiv: 0, hendelser: [], res: [], ugyldig: null, skjermlås, siste: [] };
    logg('start', `Skjermlås-hindring: ${A.skjermlås}`);
    document.addEventListener('visibilitychange', påVis); addEventListener('pagehide', påSkjul); addEventListener('blur', påBlur); addEventListener('resize', påResize);
    neste();
  }
  function neste() {
    A.i++;
    if (A.i >= A.plan.length) return ferdig();
    const S = A.plan[A.i];
    A.s = { t: -OPPVARMING_S, bilder: [], minutter: [], hakk: 0, verste: 0 };
    api.forbered(S);
    api.status(`📊 ${A.i + 1}/${A.plan.length}: ${S.navn}. Hold skjermen på, og ikke bytt app.`);
  }
  // Kalles hver frame med frametid i ms. Returnerer styring for helten mens testen pågår.
  // arbeidMs = hvor lenge forrige bilde brukte på JS og innsending av tegning. Lang frametid med lite arbeid = nettleseren ventet (avbrudd).
  function steg(dtMs, arbeidMs = 0) {
    if (!A || A.ugyldig) return null;
    const S = A.plan[A.i], s = A.s, dt = dtMs / 1000;
    const sist30 = [...A.siste].sort((a, b) => a - b), median = sist30.length ? sist30[sist30.length >> 1] : 16;
    A.siste.push(dtMs); if (A.siste.length > 30) A.siste.shift();          // gjelder også oppvarmingen
    if (s.t <= 0 && dtMs > AVBRUDD_MS && dtMs <= ALLTID_AVBRUDD_MS) { logg('oppvarming', `Langt bilde (${Math.round(dtMs)} ms) under oppvarming, ikke målt`); s.t += Math.min(dt, .1); return { dx: 0, dy: 0 }; }   // scenebytte kan gi ett langt bilde
    // Stopp i tegningen: ett langt bilde etter normale bilder, uten at spillet selv jobbet (typisk skjermlås/appbytte),
    // eller et bilde over 5 s. Vedvarende trege bilder (også når skjermkortet er flaskehals) er ekte treghet.
    if (dtMs > ALLTID_AVBRUDD_MS || (dtMs > AVBRUDD_MS && arbeidMs < dtMs * .5 && median < HAKK_MS)) { avbryt(`Ingen bilder på ${(dtMs / 1000).toFixed(1)} s, og spillet selv brukte bare ${Math.round(arbeidMs)} ms (nettleseren tegnet ikke)`); return null; }
    if (dtMs > AVBRUDD_MS) logg('tregt', `Svært tregt bilde: ${Math.round(dtMs)} ms, hvorav ${Math.round(arbeidMs)} ms arbeid (reell treghet)`);
    s.t += dt;
    if (s.t > 0) {
      A.aktiv += dt;
      s.bilder.push(dtMs);
      if (dtMs > HAKK_MS) s.hakk++;
      s.verste = Math.max(s.verste, dtMs);
      const m = Math.floor(s.t / 60); (s.minutter[m] || (s.minutter[m] = [])).push(dtMs);
      if (s.t >= S.lengde) {
        const m4 = window.__maal || {};
        A.res.push(Object.assign({ scene: S.navn, mål: S.lengde }, stat(s.bilder), {
          hakk: s.hakk, versteBildeMs: Math.round(s.verste), tegnekall: m4.tegnekallTotalt, trekanter: m4.trekanter, skyggeTrekanter: m4.trekanterSkygge,
          minutter: S.lengde > 60 ? s.minutter.map((f, i) => ({ minutt: i + 1, ...stat(f), helt: stat(f).sekunder >= 59.5 })) : undefined,
        }));
        neste(); return A ? { dx: 0, dy: 0 } : null;
      }
      if (Math.floor(s.t) !== Math.floor(s.t - dt)) {
        const sist = s.bilder.slice(-60), fps = sist.length / (sist.reduce((a, b) => a + b, 0) / 1000);
        api.status(`📊 ${A.i + 1}/${A.plan.length}: ${S.navn} · ${Math.ceil(S.lengde - s.t)} s igjen · ${fps.toFixed(0)} FPS nå`);
      }
    }
    s.vinkel = (s.vinkel || 0) + dt * 0.35;
    return { dx: Math.cos(s.vinkel), dy: Math.sin(s.vinkel), mengde: .6 };   // går rolig i sirkel
  }
  function stat(f) {
    if (!f || !f.length) return { bilder: 0, sekunder: 0, fps: null, fps1lav: null };
    const sum = f.reduce((a, b) => a + b, 0), s = [...f].sort((a, b) => a - b), p99 = s[Math.min(s.length - 1, Math.floor(s.length * .99))];
    return { bilder: f.length, sekunder: +(sum / 1000).toFixed(1), fps: +(f.length / (sum / 1000)).toFixed(1), fps1lav: +(1000 / p99).toFixed(1) };
  }
  function avbryt(grunn) {
    if (!A || A.ugyldig) return;
    A.ugyldig = grunn; logg('avbrudd', grunn);
    const S = A.plan[A.i], s = A.s;
    if (s && s.bilder.length) A.res.push(Object.assign({ scene: S.navn + ' (UFULLSTENDIG)', mål: S.lengde }, stat(s.bilder), { hakk: s.hakk, versteBildeMs: Math.round(s.verste),
      minutter: S.lengde > 60 ? s.minutter.map((f, i) => ({ minutt: i + 1, ...stat(f), helt: stat(f).sekunder >= 59.5 })) : undefined }));
    ferdig();
  }
  function ferdig() {
    const R = A; A = null;
    document.removeEventListener('visibilitychange', påVis); removeEventListener('pagehide', påSkjul); removeEventListener('blur', påBlur); removeEventListener('resize', påResize);
    try { wakeLock && wakeLock.release(); } catch (_) {} wakeLock = null;
    const planlagt = R.plan.reduce((a, s) => a + s.lengde, 0), aktiv = +R.aktiv.toFixed(1);
    let status, begrunnelse;
    if (R.ugyldig) { status = 'UGYLDIG TEST'; begrunnelse = R.ugyldig + `. Bare ${aktiv} av ${planlagt} s aktiv testtid ble målt.`; }
    else if (aktiv < planlagt - 1) { status = 'UGYLDIG TEST'; begrunnelse = `For kort aktiv testtid (${aktiv} av ${planlagt} s).`; }
    else {
      const svake = R.res.flatMap(r => [r, ...(r.minutter || []).filter(m => m.helt)]).filter(x => x.fps < R.mål);
      status = svake.length ? 'IKKE BESTÅTT' : 'BESTÅTT';
      begrunnelse = svake.length ? `${svake.length} måling(er) under målet på ${R.mål} FPS.` : `Alle scener${R.varme ? ' og alle hele minutter' : ''} holdt minst ${R.mål} FPS.`;
    }
    const alleFps = R.res.map(r => r.fps).filter(Boolean);
    const merknader = [];
    if (alleFps.length && alleFps.every(f => f > 57 && f < 61)) merknader.push('Bildefrekvensen ligger på skjermens tak (ca. 60 Hz). Hvor mye reserve det er, kan ikke måles slik.');
    if (alleFps.length && alleFps.every(f => f > 28 && f < 31.5)) merknader.push('Stabilt ca. 30 FPS kan bety strømsparingsmodus (iOS begrenser da til 30 Hz) eller struping i iframe.');
    if (R.skjermlås !== 'aktiv') merknader.push(`Kunne ikke hindre skjermlås (${R.skjermlås}). Sett «Autolås» til «Aldri» under testen.`);
    const rapport = { testversjon: 2, prototype: api.versjon, dato: new Date().toISOString(), status, begrunnelse, mål: R.mål,
      planlagtTestTidS: planlagt, aktivTestTidS: aktiv, gyldigeMålinger: R.ugyldig ? 0 : R.res.length, avbrudd: R.hendelser.filter(h => h.type === 'avbrudd').length,
      stil: api.stil(), kvalitet: api.kvalitet(), dprBrukt: api.renderer.getPixelRatio(), skjermlås: R.skjermlås, enhet: enhet(), resultater: R.res, hendelser: R.hendelser, merknader };
    api.status(''); api.vis(rapport);
  }
  return { kjør, steg, aktiv: () => !!A, _stat: stat };
}
