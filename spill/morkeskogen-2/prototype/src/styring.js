// Styring som i 5.6.2: WASD/piltaster, mellomrom = hopp, klikk/E = hugg, C = kamera, mus = se rundt, musehjul = zoom.
// Mobil: styrespak til venstre, knapper til høyre, dra på høyre side for å snu kameraet.
export function lagStyring(lerret, K, hendelser) {
  const taster = {}, S = { dx: 0, dy: 0, mengde: 1, hopp: false, slag: false };
  const JOY = { id: null, x0: 0, y0: 0, dx: 0, dy: 0, mag: 0 }, SNU = { id: null, x: 0, y: 0 };
  let museLåst = false, museSlag = false;
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    taster[e.code] = true;
    if (!e.repeat) {
      if (e.code === 'KeyC') hendelser.kamera();
      if (e.code === 'KeyT') hendelser.tid();
      if (e.code === 'KeyG') hendelser.stil();
      if (e.code === 'KeyQ') hendelser.kvalitet();
    }
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', e => { taster[e.code] = false; });
  addEventListener('blur', () => { for (const k in taster) taster[k] = false; });
  lerret.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (!museLåst && !hendelser.erBerøring()) { try { const r = lerret.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (_) {} }
    museSlag = true;
  });
  addEventListener('mouseup', () => { museSlag = false; });
  document.addEventListener('pointerlockchange', () => { museLåst = document.pointerLockElement === lerret; });
  addEventListener('mousemove', e => {
    if (!museLåst) return;
    K.yaw -= e.movementX * 0.0035; K.pitch = Math.max(-0.35, Math.min(0.6, K.pitch + e.movementY * 0.002));
  });
  lerret.addEventListener('wheel', e => { K.zoom = Math.max(0.6, Math.min(1.6, K.zoom * (e.deltaY > 0 ? 1.08 : 1 / 1.08))); e.preventDefault(); }, { passive: false });
  // Berøring
  lerret.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth * .5 && JOY.id === null) { JOY.id = t.identifier; JOY.x0 = t.clientX; JOY.y0 = t.clientY; JOY.dx = JOY.dy = JOY.mag = 0; hendelser.joy(true, t.clientX, t.clientY, 0, 0); }
      else if (SNU.id === null) { SNU.id = t.identifier; SNU.x = t.clientX; SNU.y = t.clientY; }
    }
    e.preventDefault();
  }, { passive: false });
  lerret.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === JOY.id) { let dx = t.clientX - JOY.x0, dy = t.clientY - JOY.y0; const l = Math.hypot(dx, dy), R = 55; if (l > R) { dx *= R / l; dy *= R / l; } JOY.dx = dx / R; JOY.dy = dy / R; JOY.mag = Math.min(1, l / R); hendelser.joy(true, JOY.x0, JOY.y0, dx, dy); }
      if (t.identifier === SNU.id) { K.yaw -= (t.clientX - SNU.x) * 0.006; K.pitch = Math.max(-0.35, Math.min(0.6, K.pitch + (t.clientY - SNU.y) * 0.003)); SNU.x = t.clientX; SNU.y = t.clientY; }
    }
    e.preventDefault();
  }, { passive: false });
  const slutt = e => { for (const t of e.changedTouches) { if (t.identifier === JOY.id) { JOY.id = null; JOY.mag = 0; hendelser.joy(false); } if (t.identifier === SNU.id) SNU.id = null; } };
  lerret.addEventListener('touchend', slutt); lerret.addEventListener('touchcancel', slutt);
  const knapper = { hopp: false, slag: false };
  function knapp(el, navn) {
    el.addEventListener('pointerdown', e => { knapper[navn] = true; e.preventDefault(); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, () => { knapper[navn] = false; });
  }
  return {
    knapp,
    les() {
      let dx = 0, dy = 0;
      if (taster.KeyA || taster.ArrowLeft) dx--; if (taster.KeyD || taster.ArrowRight) dx++;
      if (taster.KeyW || taster.ArrowUp) dy--; if (taster.KeyS || taster.ArrowDown) dy++;
      S.mengde = 1;
      if (JOY.mag > 0.12) { dx = JOY.dx; dy = JOY.dy; S.mengde = Math.min(1, (JOY.mag - 0.12) / 0.8); }   // som 5.6.2: lite dytt = gå sakte
      S.dx = dx; S.dy = dy;
      S.hopp = !!taster.Space || knapper.hopp;
      S.slag = !!taster.KeyE || museSlag || knapper.slag;
      return S;
    },
    museLåst: () => museLåst,
  };
}
