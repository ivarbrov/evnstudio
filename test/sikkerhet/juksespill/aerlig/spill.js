// Ærlig kontrollspill: Start skjules, og pause og fortsett virker.
document.getElementById('startBtn').addEventListener('click', function () { this.hidden = true; });
document.getElementById('evnPauseKnapp').addEventListener('click', function () { document.getElementById('evnPause').classList.add('vis'); });
document.getElementById('evnPauseFortsett').addEventListener('click', function () { document.getElementById('evnPause').classList.remove('vis'); });
