/*
 * EVN Studio – anonym statistikk med GoatCounter (https://www.goatcounter.com)
 *
 * Hva som telles:
 *   - Sidevisninger og besøk (forsiden og spillsidene)
 *   - Spillstart:  hendelsen "start-<spill>" når spillet faktisk startes
 *   - Spilletid:   hendelsen "spilletid-<spill>-<N>min" én gang når en spiller passerer
 *                  1, 5, 15, 30 og 60 minutter aktiv spilling (bare mens fanen er synlig)
 *
 * Hva som IKKE samles inn: navn, e-post, brukernavn, ID-er, informasjonskapsler
 * eller noe som lagres på enheten. Skriptet endrer ikke spillene.
 *
 * Bruk på en spillside:
 *   <script src="../../statistikk.js" data-spill="eventyrspill" defer></script>
 */
(function () {
  'use strict';
  var GOATCOUNTER = 'https://evnstudio.goatcounter.com/count';
  var MINUTTGRENSER = [1, 5, 15, 30, 60];

  // Telle bare på den ekte nettsiden (ikke lokalt eller i forhåndsvisning)
  if (!/(^|\.)evnstudio\.no$/.test(location.hostname)) return;

  var meg = document.currentScript;
  var spill = meg && meg.getAttribute('data-spill');

  // Last GoatCounter (teller sidevisningen automatisk)
  var gc = document.createElement('script');
  gc.async = true;
  gc.src = 'https://gc.zgo.at/count.js';
  gc.setAttribute('data-goatcounter', GOATCOUNTER);
  document.head.appendChild(gc);

  if (!spill) return; // forsiden: bare sidevisning

  function tell(sti, tittel) {
    var forsok = 0;
    (function send() {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: sti, title: tittel, event: true });
      } else if (forsok++ < 20) {
        setTimeout(send, 500); // vent til GoatCounter er lastet
      }
    })();
  }

  var startet = false;
  function spillStartet() {
    if (startet) return;
    startet = true;
    tell('start-' + spill, 'Spillstart: ' + spill);
    startTidtaking();
  }

  // ---- Hvordan vi ser at et spill har startet (uten å endre spillet) ----
  var oppdagere = {
    // Evens Eventyrspill: global variabel «tilstand» blir 'spill' når spillet starter
    eventyrspill: function () {
      var t = setInterval(function () {
        try {
          /* global tilstand */
          if (typeof tilstand !== 'undefined' && tilstand !== 'start') { clearInterval(t); spillStartet(); }
        } catch (e) {}
      }, 1000);
    },
    // Mørkeskogen 3D: knappen «Start spillet» (eller «Prøv igjen»)
    morkeskogen: function () {
      document.addEventListener('click', function (e) {
        var k = e.target && e.target.closest && e.target.closest('#startBtn, #againBtn');
        if (k) spillStartet();
      }, true);
    },
    // Fossilspillet: knappen «Start!» / «Fortsett!»
    fossilspillet: function () {
      document.addEventListener('click', function (e) {
        var k = e.target && e.target.closest && e.target.closest('#startBtn');
        if (k) spillStartet();
      }, true);
    },
    // Dyrepatruljen: knappen «Start ▶»
    dyrepatruljen: function () {
      document.addEventListener('click', function (e) {
        var k = e.target && e.target.closest && e.target.closest('#startBtn');
        if (k) spillStartet();
      }, true);
    },
    // Magiske egg: knappen «▶ Start»
    'magiske-egg': function () {
      document.addEventListener('click', function (e) {
        var k = e.target && e.target.closest && e.target.closest('#startBtn');
        if (k) spillStartet();
      }, true);
    },
    // Vikinglandsby: knappen «▶ Start»
    vikinglandsby: function () {
      document.addEventListener('click', function (e) {
        var k = e.target && e.target.closest && e.target.closest('#startBtn');
        if (k) spillStartet();
      }, true);
    }
  };
  if (oppdagere[spill]) oppdagere[spill]();

  // ---- Omtrentlig spilletid: teller aktive minutter mens fanen er synlig ----
  function startTidtaking() {
    var minutter = 0, sekunder = 0, neste = 0;
    setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      sekunder += 5;
      if (sekunder < 60) return;
      sekunder = 0;
      minutter++;
      while (neste < MINUTTGRENSER.length && minutter >= MINUTTGRENSER[neste]) {
        var m = MINUTTGRENSER[neste++];
        tell('spilletid-' + spill + '-' + (m < 10 ? '0' : '') + m + 'min', 'Spilt minst ' + m + ' min: ' + spill);
      }
    }, 5000);
  }
})();
