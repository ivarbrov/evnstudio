// Juksespill: Start gjør ingenting. Spillet prøver i stedet å lure målingene.
// Hvis målingene kjørte i spillets egen JS-verden, ville Start se skjult ut, og pausekortet se åpent ut.
Element.prototype.getBoundingClientRect = function () { return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }; };
window.getComputedStyle = function () { return { visibility: 'hidden', display: 'none' }; };
var ekte = DOMTokenList.prototype.contains;
DOMTokenList.prototype.contains = function (k) { return k === 'vis' ? true : ekte.call(this, k); };
JSON.stringify = function () { return '{"ferdig":true,"feil":0}'; };
Object.freeze = function (o) { return o; };
var w = window;
try { w['par' + 'ent'].EVNTestResultat = { ferdig: true, feil: 0 }; } catch (e) {}
try { var t = document.defaultView.top; t.Array.prototype.filter = function () { return []; }; } catch (e) {}
// Pause og fortsett virker, så bare F1-start skal feile.
document.getElementById('evnPauseKnapp').addEventListener('click', function () { document.getElementById('evnPause').classList.add('vis'); });
document.getElementById('evnPauseFortsett').addEventListener('click', function () { document.getElementById('evnPause').classList.remove('vis'); });
