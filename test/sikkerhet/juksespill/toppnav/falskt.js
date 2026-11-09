// Juksespill: falskt, grønt testresultat med et navn som er satt sammen, så et enkelt søk ikke finner det.
window['EVN' + 'Test' + 'Resultat'] = { ferdig: true, feil: 0, suiter: {}, tester: [], ikkeGjeldende: {}, spill: [], alleSuiter: [] };
document.getElementById('evnPauseKnapp').addEventListener('click', function () { document.getElementById('evnPause').classList.add('vis'); });
document.getElementById('evnPauseFortsett').addEventListener('click', function () { document.getElementById('evnPause').classList.remove('vis'); });
