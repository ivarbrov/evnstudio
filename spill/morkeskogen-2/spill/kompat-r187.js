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
