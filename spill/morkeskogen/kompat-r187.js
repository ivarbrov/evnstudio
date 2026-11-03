/* Mørkeskogen 2.0 – overgangslag r128 -> r187 for grafikk som ikke er byttet ennå (fase 1–5). Gjør at gammel grafikk ser ut som i 5.6.2:
   - Ingen fargehåndtering og lineær utdata (som r128).
   - «Legacy»-lys: irradians x PI og gammel avstandsdemping (fjernet i r155/r165). */
(function () {
  THREE.ColorManagement.enabled = false;
  const C = THREE.ShaderChunk, rep = (k, a, b) => { if (!C[k].includes(a)) console.warn('EVN 2.0: fant ikke', k, a); C[k] = C[k].replace(a, b); };
  rep('lights_pars_begin', 'vec3 irradiance = ambientLightColor;', 'vec3 irradiance = ambientLightColor * PI;');
  rep('lights_pars_begin', 'light.color = directionalLight.color;', 'light.color = directionalLight.color * PI;');
  rep('lights_pars_begin', 'light.color = pointLight.color;', 'light.color = pointLight.color * PI;');
  rep('lights_pars_begin', 'light.color = spotLight.color * spotAttenuation;', 'light.color = spotLight.color * spotAttenuation * PI;');
  rep('lights_pars_begin', 'vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );', 'vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight ) * PI;');
  C.lights_pars_begin = C.lights_pars_begin.replace(/float getDistanceAttenuation\([^)]*\) \{[\s\S]*?return distanceFalloff;\s*\}/,
    'float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n  if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n  return 1.0;\n}');
  if (!C.lights_pars_begin.includes('- lightDistance / cutoffDistance + 1.0')) console.warn('EVN 2.0: avstandsdemping ikke byttet');
})();

/* Mørkeskogen 2.0 – overgang til ny lysmodell (fase 1, steg 2).
   Gammel grafikk er laget med farger «slik de vises» (5.6.2 hadde ingen fargehåndtering). Ny grafikk regner lys
   i lineære farger, med sRGB-utdata og tonemapping (stil 2). For at gammel og ny grafikk skal kunne stå i samme
   scene, gjøres de gamle fargene om én gang til lineære:
   - materialfarger (color, emissive) og vertex-farger: sRGB -> lineær
   - fargeteksturer: merkes som sRGB (dekodes av skjermkortet)
   - egne ShaderMaterial (himmel, vann, lava, flammer ...): regner fortsatt i «visningsfarger»; resultatet gjøres om
     til lineært rett før tonemapping og sRGB-utdata, så de ser ut som før
   - lys og tåke: fargene som draw() setter hvert bilde, gjøres om etter draw()
   Nye materialer merkes med userData.evn2 = true og røres ikke. */
window.EVN2_OVERGANG = (function () {
  const T = THREE, FERDIG = '__evnLin';
  // Farger som draw() setter: gjøres om bare når draw() faktisk har endret dem (ellers ville de blitt mørkere for hvert bilde)
  const sist = new WeakMap();
  const SLUTT = '\n\tgl_FragColor = sRGBTransferEOTF( gl_FragColor );\n\t#include <tonemapping_fragment>\n\t#include <colorspace_fragment>\n}';
  const tex = t => { if (t && t.isTexture && t.colorSpace !== T.SRGBColorSpace && !t.isDataTexture) { t.colorSpace = T.SRGBColorSpace; t.needsUpdate = true; } };
  function materiale(m) {
    if (!m || m.userData[FERDIG] || m.userData.evn2) return;
    m.userData[FERDIG] = true;
    if (m.isShaderMaterial) {
      if (m.isRawShaderMaterial) return;
      const fs = m.fragmentShader, i = fs.lastIndexOf('}');
      if (i > 0 && !fs.includes('colorspace_fragment')) { m.fragmentShader = fs.slice(0, i) + SLUTT + fs.slice(i + 1); m.needsUpdate = true; }
      return;
    }
    farge(m.color); farge(m.emissive); alle.push(m);   // draw() kan endre fargen senere (f.eks. fjellene om natta)
    tex(m.map); tex(m.emissiveMap);
    m.needsUpdate = true;
  }
  function geometri(g) {
    if (!g || g.userData[FERDIG]) return; g.userData[FERDIG] = true;
    const c = g.attributes && g.attributes.color; if (!c) return;
    const a = c.array, v = new T.Color();
    for (let i = 0; i < c.count; i++) { v.fromBufferAttribute(c, i).convertSRGBToLinear(); c.setXYZ(i, v.r, v.g, v.b); }
    c.needsUpdate = true;
  }
  function gjennomgå(rot) {
    rot.traverse(o => {
      if (o.userData.evn2) return;                       // ny grafikk
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(materiale);
      if (o.geometry && o.material && (Array.isArray(o.material) ? o.material.some(m => m.vertexColors) : o.material.vertexColors)) geometri(o.geometry);
      if (o.isInstancedMesh && o.instanceColor && !o.instanceColor[FERDIG]) {
        o.instanceColor[FERDIG] = true; const c = new T.Color();
        for (let i = 0; i < o.count; i++) { o.getColorAt(i, c); o.setColorAt(i, c.convertSRGBToLinear()); }
        o.instanceColor.needsUpdate = true;
      }
    });
  }
  const alle = [];
  function farge(c) {   // tall i stedet for tekst: kjøres for alle gamle materialer hvert bilde
    if (!c) return; let s = sist.get(c); if (s && s[0] === c.r && s[1] === c.g && s[2] === c.b) return;
    c.convertSRGBToLinear(); if (!s) sist.set(c, s = new Float64Array(3)); s[0] = c.r; s[1] = c.g; s[2] = c.b;
  }
  let n = 0;
  // Objekter som legges til i scenen (også senere i spillet), gjøres om med en gang
  const add0 = T.Object3D.prototype.add;
  // Objektet gjøres om ved neste bilde, ikke med en gang: da rekker ny grafikk (f.eks. GLB-er som bygges med add()
  // mens de lastes) å merke seg med userData.evn2 først. Ellers ble robotens farger gjort om to ganger (for mørke og oransje).
  const kø = [];
  T.Object3D.prototype.add = function (...o) { const r = add0.apply(this, o); for (const x of o) if (x && x.isObject3D) kø.push(x); return r; };
  return {
    ramme(R3) {
      // Bare det som faktisk henger i scenen. Ting som bygges utenfor (f.eks. en GLB under lasting) gjøres om
      // når de senere legges inn i scenen (da står de i køen på nytt via sin forelder).
      while (kø.length) { const x = kø.pop(); let o = x; while (o.parent) o = o.parent; if (o.isScene) gjennomgå(x); }
      if (n++ % 300 === 0) gjennomgå(R3.scene);   // sikkerhetsnett; nye objekter gjøres om allerede når de legges til (se add under)
      for (const m of alle) { farge(m.color); farge(m.emissive); }
      for (const l of [R3.hemi, R3.sun, R3.moon, R3.pLight, ...(R3.pool || [])]) { if (!l) continue; farge(l.color); if (l.groundColor) farge(l.groundColor); }
      if (R3.scene.fog) farge(R3.scene.fog.color);
      if (R3.scene.background && R3.scene.background.isColor) farge(R3.scene.background);
    },
    gjennomgå, materiale,
  };
})();
