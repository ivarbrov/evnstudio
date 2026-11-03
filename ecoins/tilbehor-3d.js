/*
 * EVN Studio – tilbehør til EVN-roboten i 3D (E-coins-garderoben).
 * Én kilde for utseendet til hver vare. Brukes av 3D-spillene, E-shop og bildeverkstedet som lager 2D-overleggene.
 * Formene for 12 av varene er hentet uendret fra felles/robot/tilbehor.js (Era Defenders). Nye: vikinghjelm, gullkrone, ryggsekk.
 * Bare pynt: festes til hode- og overkroppsbeinet, påvirker ikke kollisjon, fart eller animasjon. Ingen teksturer.
 *
 *   var t = EVNTilbehor.lag(THREE, modell);   // modell = gltf.scene i hvilestilling (Idle, tid 0)
 *   t.vis({hode:'pirathatt', rygg:null});     // viser valgt antrekk, skjuler resten
 *
 * Virker med three.js r128 (Dyrepatruljen, Magiske egg, E-shop) og r187 (Mørkeskogen 2.0, bildeverkstedet).
 */
(function () {
  'use strict';
  function lag(THREE, modell) {
    // Bygg i modellens eget koordinatsystem, uansett hvor den står i verden
    var forelder = modell.parent, pos = modell.position.clone(), rot = modell.quaternion.clone(), skala = modell.scale.clone();
    if (forelder) forelder.remove(modell);
    modell.position.set(0, 0, 0); modell.quaternion.set(0, 0, 0, 1); modell.scale.set(1, 1, 1);
    modell.updateMatrixWorld(true);

    var hodeBein = null, kroppBein = null, hodeMesh = null;
    modell.traverse(function (o) {
      if (o.isBone && !hodeBein && /^Head(_\d+)?$/.test(o.name)) hodeBein = o;
      if (o.isBone && !kroppBein && /^Torso(_\d+)?$/.test(o.name)) kroppBein = o;
      if (o.isMesh && o.name === 'Head_3') hodeMesh = o;
    });
    var ting = {};
    if (hodeBein && kroppBein && hodeMesh) {
      var box = new THREE.Box3().setFromObject(modell), H = box.max.y - box.min.y;
      var hb = new THREE.Box3().setFromObject(hodeMesh), hMidt = hb.getCenter(new THREE.Vector3());
      var w = hb.max.x - hb.min.x, T = hb.max.y, cx = hMidt.x, cz = hMidt.z, by = box.min.y;
      var lineaer = !(THREE.ColorManagement && THREE.ColorManagement.enabled);   // r128: regn hex om fra sRGB selv
      var farge = function (hex) { var c = new THREE.Color(hex); return lineaer && c.convertSRGBToLinear ? c.convertSRGBToLinear() : c; };
      var mat = function (c, o) {
        o = o || {}; var e = o.emissive; var opt = { color: farge(c), flatShading: true, roughness: 0.8 };
        for (var k in o) if (k !== 'emissive') opt[k] = o[k];
        var m = new THREE.MeshStandardMaterial(opt); if (e) m.emissive = farge(e); return m;
      };
      var M = function (g, m, p, r, s) {
        var x = new THREE.Mesh(g, m); p = p || [0, 0, 0]; r = r || [0, 0, 0]; s = s || [1, 1, 1];
        x.position.set(p[0], p[1], p[2]); x.rotation.set(r[0], r[1], r[2]); x.scale.set(s[0], s[1], s[2]); return x;
      };
      var G = function () { var g = new THREE.Group(); for (var i = 0; i < arguments.length; i++) g.add(arguments[i]); return g; };
      var PI = Math.PI;

      var HODE = {
        steinhette: function () { var b = mat(0xf3eadb); return G(
          M(new THREE.SphereGeometry(w * .42, 9, 6, 0, PI * 2, 0, PI / 2), mat(0x6d4c41), [cx, T - w * .06, cz], 0, [1, .55, 1]),
          M(new THREE.CylinderGeometry(w * .045, w * .045, w * .62, 6), b, [cx, T + w * .16, cz + w * .05], [0, 0, PI / 2]),
          M(new THREE.SphereGeometry(w * .07, 6, 4), b, [cx - w * .32, T + w * .16, cz + w * .05]),
          M(new THREE.SphereGeometry(w * .07, 6, 4), b, [cx + w * .32, T + w * .16, cz + w * .05])); },
        faraokrone: function () { return G(
          M(new THREE.CylinderGeometry(w * .5, w * .52, w * .1, 12), mat(0xd4a04a, { metalness: .5, roughness: .4 }), [cx, T - w * .1, cz]),
          M(new THREE.BoxGeometry(w * .1, w * .3, w * .8), mat(0xc62828), [cx, T + w * .08, cz])); },
        ridderhjelm: function () { return G(
          M(new THREE.CylinderGeometry(w * .5, w * .52, w * .1, 12), mat(0xb0bec5, { metalness: .6, roughness: .35 }), [cx, T - w * .1, cz]),
          M(new THREE.ConeGeometry(w * .1, w * .5, 6), mat(0xb3261e), [cx + w * .12, T + w * .14, cz - w * .1], [-.5, 0, -.25])); },
        pirathatt: function () { var s = mat(0x1d1d24); return G(
          M(new THREE.CylinderGeometry(w * .62, w * .62, w * .05, 3), s, [cx, T - w * .03, cz], [0, PI / 6, 0]),
          M(new THREE.CylinderGeometry(w * .28, w * .36, w * .28, 10), s, [cx, T + w * .1, cz]),
          M(new THREE.SphereGeometry(w * .07, 6, 4), mat(0xffffff), [cx, T + w * .12, cz + w * .33])); },
        vernehjelm: function () { var o = mat(0xff6d00); return G(
          M(new THREE.SphereGeometry(w * .4, 10, 6, 0, PI * 2, 0, PI / 2), o, [cx, T - w * .05, cz], 0, [1, .6, 1]),
          M(new THREE.CylinderGeometry(w * .5, w * .5, w * .04, 14), o, [cx, T - w * .05, cz + w * .05])); },
        romhjelm: function () { return G(
          M(new THREE.SphereGeometry(w * .72, 18, 12), mat(0x9fd8ff, { transparent: true, opacity: .28, roughness: .1, metalness: .2, flatShading: false, depthWrite: false }), [cx, hMidt.y + w * .04, cz]),
          M(new THREE.CylinderGeometry(w * .73, w * .73, w * .08, 18), mat(0xeceff1), [cx, hb.min.y - w * .02, cz])); },
        trollmannshatt: function () { var l = mat(0x5e35b1), g = G(
          M(new THREE.CylinderGeometry(w * .55, w * .55, w * .04, 14), l, [cx, T - w * .04, cz]),
          M(new THREE.ConeGeometry(w * .32, w * .75, 10), l, [cx, T + w * .33, cz], [-.15, 0, .12]));
          [[.15, .2], [-.1, .45], [.05, .65]].forEach(function (p) { g.add(M(new THREE.OctahedronGeometry(w * .05), mat(0xffd54a, { emissive: 0x6b5200 }), [cx + p[0] * w, T + p[1] * w, cz + w * .22 - p[1] * w * .18])); });
          return g; },
        vikinghjelm: function () { var j = mat(0x90a4ae, { metalness: .55, roughness: .4 }), h = mat(0xf3eadb); return G(
          M(new THREE.SphereGeometry(w * .44, 12, 7, 0, PI * 2, 0, PI / 2), j, [cx, T - w * .07, cz], 0, [1, .62, 1]),
          M(new THREE.CylinderGeometry(w * .46, w * .46, w * .07, 14), mat(0x8d6e63), [cx, T - w * .07, cz]),
          M(new THREE.ConeGeometry(w * .07, w * .42, 7), h, [cx - w * .47, T + w * .12, cz], [0, 0, .75]),
          M(new THREE.ConeGeometry(w * .07, w * .42, 7), h, [cx + w * .47, T + w * .12, cz], [0, 0, -.75])); },
        gullkrone: function () { var gull = mat(0xffc107, { metalness: .7, roughness: .3 });
          var g = G(M(new THREE.CylinderGeometry(w * .38, w * .36, w * .14, 16, 1, true), mat(0xffc107, { metalness: .7, roughness: .3, side: THREE.DoubleSide }), [cx, T, cz]));
          for (var i = 0; i < 6; i++) { var a = i / 6 * PI * 2;
            g.add(M(new THREE.ConeGeometry(w * .07, w * .2, 5), gull, [cx + Math.sin(a) * w * .37, T + w * .16, cz + Math.cos(a) * w * .37]));
            g.add(M(new THREE.OctahedronGeometry(w * .045), mat(i % 2 ? 0x2f6bff : 0xe53935, { roughness: .2, metalness: .1, emissive: i % 2 ? 0x0a1a55 : 0x4a0000 }), [cx + Math.sin(a) * w * .39, T, cz + Math.cos(a) * w * .39])); }
          return g; }
      };
      var kappe = function (f, prikker) { return function () { var g = G(M(new THREE.CylinderGeometry(H * .2, H * .3, H * .4, 10, 1, true, PI * .6, PI * .8), mat(f, { side: THREE.DoubleSide }), [0, by + H * .27, -H * .015]));
        if (prikker) [[-.1, .3], [.08, .22], [-.02, .15], [.12, .36]].forEach(function (p) { g.add(M(new THREE.OctahedronGeometry(H * .018), mat(prikker, { emissive: 0x6b5200 }), [p[0] * H, by + p[1] * H, -H * .27 - .02])); });
        return g; }; };
      var RYGG = {
        rod_kappe: kappe(0xc62828), svart_kappe: kappe(0x263238), stjernekappe: kappe(0x4527a0, 0xffd54a),
        verktoybelte: function () { return G(
          M(new THREE.TorusGeometry(H * .1, H * .022, 5, 14), mat(0x5d4037), [0, by + H * .33, 0], [PI / 2, 0, 0], [1.05, 1, .8]),
          M(new THREE.BoxGeometry(H * .05, H * .07, H * .03), mat(0x9e9e9e), [H * .09, by + H * .3, H * .06])); },
        oksygentank: function () { return G(
          M(new THREE.BoxGeometry(H * .2, H * .2, H * .09), mat(0xb0bec5), [0, by + H * .45, -H * .15]),
          M(new THREE.SphereGeometry(H * .02, 6, 4), mat(0x76ff03, { emissive: 0x2e7d00 }), [0, by + H * .52, -H * .2])); },
        ryggsekk: function () { var s = mat(0x2e7d32), l = mat(0x1b5e20), r = mat(0x5d4037); return G(
          M(new THREE.BoxGeometry(H * .17, H * .19, H * .08), s, [0, by + H * .45, -H * .15]),
          M(new THREE.BoxGeometry(H * .175, H * .07, H * .085), l, [0, by + H * .53, -H * .152]),
          M(new THREE.BoxGeometry(H * .11, H * .06, H * .03), l, [0, by + H * .41, -H * .2]),
          M(new THREE.BoxGeometry(H * .02, H * .2, H * .02), r, [-H * .06, by + H * .46, -H * .1]),
          M(new THREE.BoxGeometry(H * .02, H * .2, H * .02), r, [H * .06, by + H * .46, -H * .1])); }
      };
      var fest = function (bein, id, lagFn, plass) {
        var obj = lagFn(); obj.name = 'evn-tilbehor-' + id; obj.visible = false;
        obj.updateMatrixWorld(true); bein.attach(obj);   // uten forelder tolkes posisjonen som verdenskoordinater
        obj.traverse(function (x) { if (x.isMesh) { x.renderOrder = 1; x.castShadow = false; x.frustumCulled = false; } });
        ting[id] = { obj: obj, plass: plass };
      };
      for (var h in HODE) fest(hodeBein, h, HODE[h], 'hode');
      for (var r in RYGG) fest(kroppBein, r, RYGG[r], 'rygg');
    }
    // Sett modellen tilbake der den sto
    modell.position.copy(pos); modell.quaternion.copy(rot); modell.scale.copy(skala);
    if (forelder) forelder.add(modell);
    modell.updateMatrixWorld(true);

    return {
      finnes: function (id) { return !!ting[id]; },
      objekt: function (id) { return ting[id] ? ting[id].obj : null; },
      vis: function (antrekk) {
        antrekk = antrekk || {};
        for (var id in ting) ting[id].obj.visible = (antrekk[ting[id].plass] === id);
      }
    };
  }
  window.EVNTilbehor = { lag: lag, versjon: 1 };
})();
