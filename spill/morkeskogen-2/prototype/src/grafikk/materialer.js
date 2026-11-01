// Felles materialsett. Alt er MeshStandardMaterial (ett lysmodell for hele scenen), med små tillegg:
// vind i vertex-shaderen, gjennomlys i blader og kantlys på figurer.
import * as THREE from 'three';

export const FELLES = {
  uTid: { value: 0 },
  uVind: { value: 1 },
  uSolV: { value: new THREE.Vector3(0, 1, 0) },     // retning mot sola/månen i kamerarommet
  uSolFarge: { value: new THREE.Color(1, 1, 1) },
};

const VIND_V = `
#ifdef USE_INSTANCING
  vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
#else
  vec3 ip = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);
#endif
  float fas = ip.x * 0.013 + ip.z * 0.017;
  float sv = (sin(uTid * 1.1 + fas) * 0.6 + sin(uTid * 2.3 + fas * 1.7) * 0.3) * uVind;
  transformed.x += aWind.x * sv * 5.0;
  transformed.z += aWind.x * sv * 3.5;
  transformed += normal * aWind.y * sin(uTid * 6.0 + aWind.y * 40.0 + fas * 3.0) * 0.9 * uVind;
`;

export function medVind(mat, { gjennomlys = 0, kantlys = 0 } = {}) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, FELLES);
    sh.vertexShader = 'attribute vec2 aWind;\nuniform float uTid, uVind;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VIND_V);
    if (gjennomlys || kantlys) {
      sh.fragmentShader = 'uniform vec3 uSolV, uSolFarge;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
        vec3 vd = normalize(-vViewPosition);   // fra kameraet mot punktet
        float bak = pow(max(0.0, dot(vd, uSolV)), 3.0);
        outgoingLight += diffuseColor.rgb * uSolFarge * bak * ${gjennomlys.toFixed(2)};
        float kant = pow(1.0 - max(0.0, dot(normal, normalize(vViewPosition))), 3.0);
        outgoingLight += uSolFarge * kant * ${kantlys.toFixed(2)} * 0.25;
        #include <opaque_fragment>`);
    }
  };
  mat.customProgramCacheKey = () => 'vind' + gjennomlys + '_' + kantlys;
  return mat;
}

export function kantlys(mat, styrke, farge = null) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, FELLES);
    sh.uniforms.uKant = { value: farge || new THREE.Color(1, 1, 1) };
    sh.fragmentShader = 'uniform vec3 uSolFarge, uKant;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
      float kant = pow(1.0 - max(0.0, dot(normal, normalize(vViewPosition))), 2.5);
      outgoingLight += uKant * (0.35 + 0.65 * length(uSolFarge)) * kant * ${styrke.toFixed(2)};
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'kant' + styrke;
  return mat;
}

const laster = new THREE.TextureLoader();
export function lastTekstur(url, srgb = true, gjenta = true) {
  const t = laster.load(url);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (gjenta) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
