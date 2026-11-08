/*
 * EVN Spilloppsett – hvilke spill testene skal dekke, og hvordan hvert spill startes i røyktesten.
 * Brukes av test/kjor.mjs (finner spillene) og test/publiseringssjekk.mjs (kontrollerer PR-en med koden fra main).
 *
 * Spillene finnes automatisk: hver mappe spill/<id>/ med index.html er et spill og skal testes.
 * Et nytt spill trenger ingen endring i test/. Røyktesten trykker på #startBtn.
 *
 * Et nytt spill kan ha en annen startknapp i spill/<id>/evn-test.json, for eksempel:
 *   { "start": "menyStart", "etterStart": { "klikk": ".verden.aapen" } }
 * Filen er bare data. Den kan ikke slå av kontroller, merke funn som kjente eller kjøre kode.
 * Den gjennomgås sammen med spillet i full EVN Game QA.
 *
 * Spill som finnes på main, har sitt oppsett i test/index.html (OPPSETT). Det kan bare endres med særskilt kontroll.
 * Publiseringssjekken avviser derfor en PR som legger til, endrer eller sletter evn-test.json for et spill som finnes på main.
 */

export const STANDARD = Object.freeze({ start: 'startBtn' });
export const OPPSETTFIL = 'evn-test.json';
export const SPILL_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;
const ELEMENT_ID = /^[A-Za-z][\w-]{0,63}$/;
// Enkle CSS-selektorer: klasser, id, elementnavn og attributter. Ingen parenteser, krøllparenteser eller semikolon.
const SELEKTOR = /^[A-Za-z0-9_\-.#\[\]=" :>]{1,100}$/;
const MAKS_BYTE = 1024;

// Kontrollene som må finnes for hvert spill i et fullt testresultat. Publiseringssjekken krever dem.
export const PAKREVDE_KONTROLLER = Object.freeze({
  statisk: ['S1-csp', 'S1-domener', 'S1-eksterne-filer', 'S1-eval', 'T3-zoom'],
  royk: ['U1-versjon', 'F1-startknapp', 'F1-start', 'F1-pause', 'F1-fortsett', 'K1-404', 'K1-feil', 'K1-nettleser']
});

// Leser og kontrollerer innholdet i evn-test.json. Gir { oppsett, feil }. Ved feil er oppsett null.
export function lesOppsett(tekst) {
  const feil = [];
  if (typeof tekst !== 'string') return { oppsett: null, feil: ['filen kunne ikke leses'] };
  if (Buffer.byteLength(tekst, 'utf8') > MAKS_BYTE) return { oppsett: null, feil: [`filen er større enn ${MAKS_BYTE} byte`] };
  let d;
  try { d = JSON.parse(tekst); } catch { return { oppsett: null, feil: ['filen er ikke gyldig JSON'] }; }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { oppsett: null, feil: ['filen må inneholde ett JSON-objekt'] };
  for (const k of Object.keys(d)) if (k !== 'start' && k !== 'etterStart') feil.push(`ukjent nøkkel «${k}» (bare «start» og «etterStart» er lov)`);
  const oppsett = { start: STANDARD.start };
  if ('start' in d) {
    if (typeof d.start !== 'string' || !ELEMENT_ID.test(d.start)) feil.push('«start» må være id-en til et element (bokstaver, tall, - og _)');
    else oppsett.start = d.start;
  }
  if ('etterStart' in d) {
    const e = d.etterStart;
    if (!e || typeof e !== 'object' || Array.isArray(e)) feil.push('«etterStart» må være et objekt');
    else {
      for (const k of Object.keys(e)) if (k !== 'klikk') feil.push(`ukjent nøkkel «etterStart.${k}» (bare «klikk» er lov)`);
      if (typeof e.klikk !== 'string' || !SELEKTOR.test(e.klikk)) feil.push('«etterStart.klikk» må være en enkel CSS-selektor (høyst 100 tegn)');
      else oppsett.etterStart = { klikk: e.klikk };
    }
  }
  return feil.length ? { oppsett: null, feil } : { oppsett, feil };
}
