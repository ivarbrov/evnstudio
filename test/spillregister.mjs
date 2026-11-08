/*
 * EVN Spillregister – felles regler for hvordan spill blir med i de automatiske testene.
 * Brukes av test/kjor.mjs, test/index.html (i nettleseren) og test/publiseringssjekk.mjs.
 *
 * Et spill blir med automatisk når mappen spill/<id>/ har en index.html.
 * Spillet kan ha en registreringsfil, spill/<id>/evn-test.json, som bare er data:
 *
 *   { "start": "startBtn", "etterStart": [ { "klikk": ".verden.aapen" } ] }
 *
 *   start       id til startknappen (standard: "startBtn")
 *   etterStart  inntil 3 klikk etter Start, for eksempel valg av verden (standard: ingen)
 *
 * Andre felt er ikke lov. Filen kan ikke slå av, hoppe over eller svekke noen kontroll.
 * Kontrollene som kreves for hvert spill, står i PAKREVDE_KONTROLLER under og endres bare i test/.
 */

export const STANDARD = Object.freeze({ start: 'startBtn', etterStart: [] });
export const FILNAVN = 'evn-test.json';
export const SPILL_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;
const ELEMENT_ID = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/;
// Enkle CSS-velgere: klasser, id, attributter og :not(). Ingen tegn som kan bryte ut av en streng eller lage HTML.
const VELGER = /^[A-Za-z0-9_.#\-[\]="' :>(),]{1,80}$/;
const MAKS_KLIKK = 3;
const MAKS_BYTE = 1024;

// Hver kontroll må finnes for hvert spill i testresultatet, med status ok, kjent eller rettet.
export const PAKREVDE_KONTROLLER = Object.freeze({
  statisk: ['S1-csp', 'S1-domener', 'S1-eksterne-filer', 'S1-eval', 'T3-zoom'],
  royk: ['U1-versjon', 'F1-startknapp', 'F1-start', 'F1-pause', 'F1-fortsett', 'K1-feil', 'K1-nettleser']
});
export const GODKJENT_STATUS = Object.freeze(['ok', 'kjent', 'rettet']);

/** Leser og kontrollerer en registreringsfil. tekst = null betyr at filen ikke finnes (standard brukes). */
export function lesRegistrering(tekst) {
  if (tekst === null || tekst === undefined) return { ok: true, konfig: STANDARD, feil: [] };
  const feil = [];
  if (typeof tekst !== 'string' || tekst.length > MAKS_BYTE) return { ok: false, konfig: null, feil: [`${FILNAVN} er større enn ${MAKS_BYTE} byte`] };
  let d;
  try { d = JSON.parse(tekst); } catch { return { ok: false, konfig: null, feil: [`${FILNAVN} er ikke gyldig JSON`] }; }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { ok: false, konfig: null, feil: [`${FILNAVN} må være et objekt`] };
  for (const k of Object.keys(d)) if (k !== 'start' && k !== 'etterStart') feil.push(`ukjent felt «${String(k).slice(0, 40)}» i ${FILNAVN} (bare start og etterStart er lov)`);
  const start = d.start === undefined ? STANDARD.start : d.start;
  if (typeof start !== 'string' || !ELEMENT_ID.test(start)) feil.push('start må være en element-id med bokstaver, tall, - og _ (maks 40 tegn)');
  const etter = d.etterStart === undefined ? [] : d.etterStart;
  if (!Array.isArray(etter) || etter.length > MAKS_KLIKK) feil.push(`etterStart må være en liste med inntil ${MAKS_KLIKK} klikk`);
  else etter.forEach((s, i) => {
    if (!s || typeof s !== 'object' || Array.isArray(s) || Object.keys(s).length !== 1 || typeof s.klikk !== 'string') feil.push(`etterStart[${i}] må være { "klikk": "<CSS-velger>" }`);
    else if (!VELGER.test(s.klikk)) feil.push(`etterStart[${i}].klikk har tegn som ikke er lov, eller er for lang`);
  });
  if (feil.length) return { ok: false, konfig: null, feil };
  return { ok: true, konfig: Object.freeze({ start, etterStart: etter.map(s => Object.freeze({ klikk: s.klikk })) }), feil: [] };
}

/** Sammenligner to gyldige konfigurasjoner (etter standardverdier). */
export const likKonfig = (a, b) => JSON.stringify(a) === JSON.stringify(b);
