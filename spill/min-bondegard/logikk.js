/* Min Bondegård – spillregler uten grafikk.
   Rene funksjoner over én tilstand. Ingen three.js og ingen DOM, så reglene kan testes i Node (test/min-bondegard/logikk.test.mjs).
   Tid: alle jobber har en fast slutt-tid i millisekunder (Date.now()). En jobb er ferdig når klokka har passert slutt-tiden,
   også mens spillet er lukket (planens beslutning B1). Ferdige ting ligger og venter til spilleren henter dem, og forsvinner fra tilstanden når de hentes.
   Derfor kan ingenting bli ferdig eller hentet to ganger, uansett hvor ofte spillet lastes på nytt.
   Går klokka bakover, kortes ventetiden ned til jobbens egen lengde (normaliserTid), så ingenting blir stående fast. */
(function (rot) {
  'use strict';
  var D = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : rot.MB_DATA;
  var VERSJON = 1;

  function ny(naa) {
    var s = {
      v: VERSJON, seq: 0, opprettet: naa, sist: naa,
      nivaa: 1, xp: 0, mynter: D.startMynter,
      lager: {}, akre: [], dyr: {}, bygg: {}, plasser: {},
      oppl: { steg: 0 }, stat: { hostet: 0, egg: 0, laget: 0, solgt: 0, levert: 0, kunder: 0 },
      best: { nr: 0, fro: (Math.floor(naa) % 2147483646) + 1, liste: [] }
    };
    for (var k in D.startLager) s.lager[k] = D.startLager[k];
    giNivaa(s, 1, naa);
    return s;
  }

  // Det som følger med et nivå (også nivå 1 ved start). Returnerer det som er nytt, til feiringen.
  function giNivaa(s, n, naa) {
    var nytt = { nivaa: n, mynter: 0, avlinger: [], dyr: [], bygg: [], oppskrifter: [], akre: 0 };
    if (n > 1) { var m = D.nivaaMynter(n); s.mynter += m; nytt.mynter = m; }
    var antall = D.ved(D.akre, n);
    while (s.akre.length < antall) { s.akre.push({ id: 'a' + (s.akre.length + 1), x: null, z: null, avling: null, start: 0, slutt: 0 }); nytt.akre++; }
    for (var a in D.avlinger) if (D.avlinger[a].nivaa === n) { nytt.avlinger.push(a); if (n > 1) s.lager[a] = (s.lager[a] || 0) + D.nyAvlingFro; }
    for (var d in D.dyr) if (D.dyr[d].nivaa === n && !s.dyr[d]) {
      s.dyr[d] = []; for (var i = 0; i < D.dyr[d].start; i++) s.dyr[d].push({ slutt: null });
      nytt.dyr.push(d);
    }
    for (var b in D.bygg) if (D.bygg[b].nivaa === n && !s.bygg[b]) {
      s.bygg[b] = { eid: D.bygg[b].pris === 0, x: null, z: null, r: 0, ko: [] };
      nytt.bygg.push(b);
    }
    for (var o in D.oppskrifter) if (D.oppskrifter[o].nivaa === n) nytt.oppskrifter.push(o);
    nytt.tavle = n === D.bestillinger.nivaa; nytt.bestillinger = fyllBestillinger(s, naa);
    return nytt;
  }

  function giXP(s, xp, naa) {
    var nye = [];
    s.xp += xp;
    while (s.nivaa < D.maksNivaa && s.xp >= D.xpNeste[s.nivaa]) {
      s.xp -= D.xpNeste[s.nivaa];
      s.nivaa++;
      nye.push(giNivaa(s, s.nivaa, naa));
    }
    return nye;
  }

  // ---------- Lager ----------
  function lagerType(v) { return D.avlinger[v] ? 'silo' : 'lave'; }
  function kapasitet(s, type) { return D.ved(type === 'silo' ? D.silo : D.lave, s.nivaa); }
  function bruk(s, type) { var n = 0; for (var v in s.lager) if (lagerType(v) === type) n += s.lager[v]; return n; }
  function plass(s, type) { return kapasitet(s, type) - bruk(s, type); }
  function har(s, inn) { for (var v in inn) if ((s.lager[v] || 0) < inn[v]) return false; return true; }
  function ta(s, inn) { for (var v in inn) { s.lager[v] -= inn[v]; if (!s.lager[v]) delete s.lager[v]; } }
  function legg(s, v, n) { s.lager[v] = (s.lager[v] || 0) + n; }

  // ---------- Åkre ----------
  function akerStatus(f, naa) { return !f.avling ? 'tom' : naa >= f.slutt ? 'moden' : 'vokser'; }
  function kanPlante(s, i, avling) {
    var f = s.akre[i], A = D.avlinger[avling];
    if (!f || !A) return 'ukjent';
    if (f.avling) return 'opptatt';
    if (A.nivaa > s.nivaa) return 'laast';
    if ((s.lager[avling] || 0) > 0) return null;
    if (A.gratis) return null;
    if (!s.akre.some(function (a) { return a.avling === avling; })) return null;   // Progresjonsregel F2: 0 i silo og ingen på åkrene gir gratis frø
    return 'ingen-fro';
  }
  function plant(s, i, avling, naa) {
    var g = kanPlante(s, i, avling); if (g) return { ok: false, grunn: g };
    var f = s.akre[i], gratis = !(s.lager[avling] > 0);
    if (!gratis) ta(s, mk(avling, 1));
    f.avling = avling; f.start = naa; f.slutt = naa + D.avlinger[avling].tid * 1000;
    return { ok: true, gratis: gratis };
  }
  function host(s, i, naa) {
    var f = s.akre[i];
    if (!f || akerStatus(f, naa) !== 'moden') return { ok: false, grunn: 'ikke-moden' };
    if (plass(s, 'silo') < 2) return { ok: false, grunn: 'silo-full' };
    var a = f.avling, A = D.avlinger[a];
    legg(s, a, 2); f.avling = null; f.start = 0; f.slutt = 0; s.stat.hostet++;
    return { ok: true, vare: a, antall: 2, xp: A.xp, nye: giXP(s, A.xp, naa) };
  }

  // ---------- Dyr ----------
  function dyrStatus(d, naa) { return d.slutt === null ? 'sulten' : naa >= d.slutt ? 'klar' : 'spiser'; }
  function mat(s, art, naa) {
    var A = D.dyr[art], liste = s.dyr[art] || [], n = 0;
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].slutt !== null) continue;
      if (!(s.lager[A.spiser] > 0)) break;
      ta(s, mk(A.spiser, 1)); liste[i].slutt = naa + A.tid * 1000; n++;
    }
    var sultne = liste.filter(function (d) { return d.slutt === null; }).length;
    return { ok: n > 0, antall: n, grunn: n ? null : (sultne ? 'mangler-for' : 'ingen-sultne') };
  }
  function samleDyr(s, art, naa) {
    var A = D.dyr[art], liste = s.dyr[art] || [], n = 0, full = false, nye = [];
    for (var i = 0; i < liste.length; i++) {
      if (dyrStatus(liste[i], naa) !== 'klar') continue;
      if (plass(s, 'lave') < 1) { full = true; break; }
      legg(s, A.produkt, 1); liste[i].slutt = null; n++;
    }
    if (n) { if (art === 'hone') s.stat.egg += n; nye = giXP(s, A.xp * n, naa); }
    return { ok: n > 0, antall: n, vare: A.produkt, xp: A.xp * n, nye: nye, grunn: n ? null : full ? 'lave-full' : 'ingen-klare' };
  }

  // ---------- Produksjon ----------
  function uferdige(b, naa) { return b.ko.filter(function (j) { return naa < j.slutt; }); }
  function kanProdusere(s, bygg, vare, naa) {
    var b = s.bygg[bygg], o = D.oppskrifter[vare];
    if (!b || !o || o.bygg !== bygg) return 'ukjent';
    if (!b.eid) return 'ikke-bygd';
    if (o.nivaa > s.nivaa) return 'laast';
    if (uferdige(b, naa).length >= D.koPlasser) return 'ko-full';
    if (!har(s, o.inn)) return 'mangler';
    return null;
  }
  function produser(s, bygg, vare, naa) {
    var g = kanProdusere(s, bygg, vare, naa); if (g) return { ok: false, grunn: g };
    var b = s.bygg[bygg], o = D.oppskrifter[vare], u = uferdige(b, naa);
    var start = u.length ? u[u.length - 1].slutt : naa;     // jobbene går etter hverandre
    ta(s, o.inn);
    b.ko.push({ vare: vare, start: start, slutt: start + o.tid * 1000 });
    return { ok: true };
  }
  function hentProdukter(s, bygg, naa) {
    var b = s.bygg[bygg], n = 0, xp = 0, varer = {}, full = false;
    if (!b) return { ok: false, grunn: 'ukjent' };
    for (var i = 0; i < b.ko.length;) {
      var j = b.ko[i];
      if (naa < j.slutt) { i++; continue; }
      var ut = D.oppskrifter[j.vare].ut;
      if (plass(s, 'lave') < ut) { full = true; i++; continue; }
      legg(s, j.vare, ut); b.ko.splice(i, 1); n += ut; xp += D.produktXP(j.vare); varer[j.vare] = (varer[j.vare] || 0) + ut; s.stat.laget += ut;
    }
    return { ok: n > 0, antall: n, varer: varer, xp: xp, nye: n ? giXP(s, xp, naa) : [], grunn: n ? null : full ? 'lave-full' : 'ingen-klare' };
  }
  function kjopBygg(s, bygg) {
    var b = s.bygg[bygg], B = D.bygg[bygg];
    if (!b || !B) return { ok: false, grunn: 'laast' };
    if (b.eid) return { ok: false, grunn: 'eid' };
    if (s.mynter < B.pris) return { ok: false, grunn: 'mynter' };
    s.mynter -= B.pris; b.eid = true;
    return { ok: true };
  }

  // ---------- Markedsbua (progresjonsregel F3) ----------
  function kanSelge(v) { return !D.erFor(v); }
  function selg(s, v, n) {
    if (!kanSelge(v)) return { ok: false, grunn: 'for' };
    n = Math.min(n, s.lager[v] || 0);
    if (n <= 0) return { ok: false, grunn: 'tom' };
    ta(s, mk(v, n)); var m = D.pris(v) * n; s.mynter += m; s.stat.solgt += n;
    return { ok: true, antall: n, mynter: m };
  }

  // ---------- Bestillinger (progresjonsregel F5) ----------
  // Tilfeldige valg bruker et frø som ligger i tilstanden. Da gir samme tilstand samme bestilling, og reglene kan testes.
  function tilf(s) { s.best.fro = (Math.imul(s.best.fro, 1103515245) + 12345) & 0x7fffffff; return s.best.fro / 2147483648; }   // Math.imul: heltall uten tap av presisjon (QA 10.11)
  // Kan spilleren lage varen nå? Avling: låst opp. Dyreprodukt: har dyret. Produkt: har bygget (eller har snart råd til det) og kan lage alle råvarene.
  function kanLage(s, v, dybde) {
    if ((dybde || 0) > 6 || D.nivaaFor(v) > s.nivaa || D.nivaaFor(v) > D.innholdTil) return false;
    if (D.avlinger[v]) return true;
    for (var d in D.dyr) if (D.dyr[d].produkt === v) return !!s.dyr[d] && kanLage(s, D.dyr[d].spiser, (dybde || 0) + 1);
    var o = D.oppskrifter[v]; if (!o) return false;
    var b = s.bygg[o.bygg]; if (!b || (!b.eid && D.bygg[o.bygg].pris > s.mynter + 300)) return false;
    for (var k in o.inn) if (!kanLage(s, k, (dybde || 0) + 1)) return false;
    return true;
  }
  function bestPool(s) {
    var alle = Object.keys(D.avlinger).concat(Object.keys(D.varer));
    return alle.filter(function (v) { return !D.erFor(v) && kanLage(s, v) && D.kjedeTid(v) <= D.bestillinger.maksKjede; });
  }
  function bestVerdi(varer) { var v = 0; for (var k in varer) v += D.verdi(k) * varer[k]; return v; }
  function nyBestilling(s, naa) {
    var pool = bestPool(s); if (!pool.length) return null;
    var vekt = pool.map(function (v) { return 1 + D.nivaaFor(v) / 3; }), sum = vekt.reduce(function (a, b) { return a + b; }, 0);
    var trekk = function () { var x = tilf(s) * sum; for (var i = 0; i < pool.length; i++) { x -= vekt[i]; if (x <= 0) return pool[i]; } return pool[pool.length - 1]; };
    var valg = s.nivaa >= 7 ? [1, 1, 2, 2, 3] : [1, 2], k = valg[Math.floor(tilf(s) * valg.length)], varer = {};
    for (var j = 0; j < k; j++) { var v = trekk(), q = D.avlinger[v] ? 2 + Math.floor(tilf(s) * 4) : 1 + Math.floor(tilf(s) * 3); varer[v] = Math.min(12, (varer[v] || 0) + q); }
    var verdi = bestVerdi(varer);
    return { id: 'b' + (++s.best.nr), varer: varer, mynter: D.bestillingMynter(verdi), xp: D.bestillingXP(verdi), siden: naa };
  }
  function bestPlasser(s) { return s.nivaa >= D.bestillinger.nivaa ? D.ved(D.bestillinger.plasser, s.nivaa) : 0; }
  function fyllBestillinger(s, naa) {
    var n = 0, maks = bestPlasser(s);
    while (s.best.liste.length < maks) { var o = nyBestilling(s, naa); if (!o) break; s.best.liste.push(o); n++; }
    return n;
  }
  function kanLevere(s, i) { var o = s.best.liste[i]; return !!o && har(s, o.varer); }
  // Leverer bestillingen: varene tas fra lageret, mynter og XP gis, og en ny bestilling tar plassen. Kan ikke leveres to ganger, for den gamle er borte.
  function lever(s, i, naa) {
    var o = s.best.liste[i]; if (!o) return { ok: false, grunn: 'ukjent' };
    if (!har(s, o.varer)) return { ok: false, grunn: 'mangler' };
    ta(s, o.varer); s.mynter += o.mynter; s.stat.levert++;
    var ny = nyBestilling(s, naa); if (ny) s.best.liste[i] = ny; else s.best.liste.splice(i, 1);
    return { ok: true, mynter: o.mynter, xp: o.xp, varer: o.varer, nye: giXP(s, o.xp, naa) };
  }
  // Bytte er alltid gratis (F5)
  function byttBestilling(s, i, naa) {
    if (!s.best.liste[i]) return { ok: false, grunn: 'ukjent' };
    var gml = JSON.stringify(s.best.liste[i].varer), ny = null;
    for (var f = 0; f < 5; f++) { ny = nyBestilling(s, naa); if (!ny || JSON.stringify(ny.varer) !== gml) break; }   // helst ikke den samme om igjen
    if (!ny) return { ok: false, grunn: 'ingen' };
    s.best.liste[i] = ny; return { ok: true };
  }
  function boerByttes(s, i, naa) { var o = s.best.liste[i]; return !!o && !har(s, o.varer) && naa - o.siden >= D.bestillinger.bytteForslag * 1000; }

  // ---------- Kunder ved markedsbua (Even 11.11) ----------
  // En kunde ber om én vare spilleren kan lage. Ønsket lagres ikke: kjører kunden videre, skjer det ingenting.
  function kundePris(v, n) { return Math.round(D.pris(v) * n * D.kunder.faktor); }
  function nyKunde(s) {
    var pool = bestPool(s); if (!pool.length) return null;
    var v = pool[Math.floor(tilf(s) * pool.length)], n = D.avlinger[v] ? 2 + Math.floor(tilf(s) * 3) : 1 + Math.floor(tilf(s) * 2);
    return { vare: v, antall: n, mynter: kundePris(v, n) };
  }
  // Prisen regnes ut her, ikke fra ønsket, så den alltid følger reglene.
  function selgTilKunde(s, k) {
    if (!k || !(D.avlinger[k.vare] || D.varer[k.vare]) || D.erFor(k.vare)) return { ok: false, grunn: 'ukjent' };
    var n = Math.max(1, Math.min(6, Math.floor(k.antall) || 1)), harN = s.lager[k.vare] || 0;
    if (harN < n) return { ok: false, grunn: 'mangler', mangler: n - harN };
    ta(s, mk(k.vare, n)); var m = kundePris(k.vare, n); s.mynter += m; s.stat.kunder++;
    return { ok: true, antall: n, mynter: m };
  }

  // ---------- Tid ----------
  // Ingen ventetid kan bli lengre enn jobben selv. Det hindrer at en klokke som har gått bakover, låser spillet.
  function normaliserTid(s, naa) {
    s.akre.forEach(function (f) { if (f.avling) { var t = D.avlinger[f.avling].tid * 1000; if (f.slutt - naa > t) { f.slutt = naa + t; f.start = naa; } } });
    for (var art in s.dyr) { var t = D.dyr[art].tid * 1000; s.dyr[art].forEach(function (d) { if (d.slutt !== null && d.slutt - naa > t) d.slutt = naa + t; }); }
    for (var b in s.bygg) {
      var forrige = naa;
      s.bygg[b].ko.forEach(function (j) { var t = D.oppskrifter[j.vare].tid * 1000; if (j.slutt - Math.max(forrige, naa) > t) { j.slutt = Math.max(forrige, naa) + t; j.start = j.slutt - t; } forrige = j.slutt; });
    }
    s.best.liste.forEach(function (o) { if (o.siden > naa) o.siden = naa; });
    if (naa > s.sist) s.sist = naa;
  }

  // ---------- Lagring ----------
  var tall = function (x, d) { return typeof x === 'number' && isFinite(x) ? x : d; };
  // Godtar bare kjente felt og gyldige verdier. Returnerer null hvis lagringen ikke kan brukes (da startes et nytt spill, og den gamle beholdes som kopi).
  function valider(r, naa) {
    if (!r || typeof r !== 'object' || typeof r.v !== 'number') return null;
    if (r.v > VERSJON) return null;           // lagret av en nyere versjon: ikke rør den
    var s = ny(naa);
    s.nivaa = Math.max(1, Math.min(D.maksNivaa, Math.floor(tall(r.nivaa, 1))));
    // gi alt som følger med nivåene opp til lagret nivå (åkre, dyr, bygg), uten mynter og frø
    for (var n = 2; n <= s.nivaa; n++) { var m = s.mynter; var l = JSON.stringify(s.lager); giNivaa(s, n, naa); s.mynter = m; s.lager = JSON.parse(l); }
    s.xp = Math.max(0, tall(r.xp, 0)); s.mynter = Math.max(0, Math.floor(tall(r.mynter, D.startMynter)));
    s.seq = Math.max(0, Math.floor(tall(r.seq, 0))); s.opprettet = tall(r.opprettet, naa); s.sist = tall(r.sist, naa);
    s.lager = {};
    if (r.lager && typeof r.lager === 'object') for (var v in r.lager) if ((D.avlinger[v] || D.varer[v]) && tall(r.lager[v], 0) > 0) s.lager[v] = Math.min(9999, Math.floor(r.lager[v]));   // urimelige tall kuttes (QA 9.11)
    if (Array.isArray(r.akre)) r.akre.forEach(function (f, i) {
      if (!f || i >= s.akre.length) return; var a = s.akre[i];
      a.x = typeof f.x === 'number' && isFinite(f.x) ? f.x : null; a.z = typeof f.z === 'number' && isFinite(f.z) ? f.z : null;
      if (D.avlinger[f.avling]) { a.avling = f.avling; a.start = tall(f.start, naa); a.slutt = tall(f.slutt, naa); }
    });
    if (r.dyr && typeof r.dyr === 'object') for (var art in s.dyr) if (Array.isArray(r.dyr[art])) r.dyr[art].forEach(function (d, i) {
      if (i >= s.dyr[art].length) s.dyr[art].push({ slutt: null });
      s.dyr[art][i].slutt = d && typeof d.slutt === 'number' && isFinite(d.slutt) ? d.slutt : null;
    });
    if (r.bygg && typeof r.bygg === 'object') for (var b in s.bygg) { var rb = r.bygg[b]; if (!rb || typeof rb !== 'object') continue;
      var sb = s.bygg[b]; sb.eid = sb.eid || rb.eid === true;
      sb.x = typeof rb.x === 'number' && isFinite(rb.x) ? rb.x : null; sb.z = typeof rb.z === 'number' && isFinite(rb.z) ? rb.z : null; sb.r = tall(rb.r, 0);
      if (Array.isArray(rb.ko)) rb.ko.slice(0, 6).forEach(function (j) { if (j && D.oppskrifter[j.vare] && D.oppskrifter[j.vare].bygg === b) sb.ko.push({ vare: j.vare, start: tall(j.start, naa), slutt: tall(j.slutt, naa) }); });
    }
    if (r.plasser && typeof r.plasser === 'object') for (var p in r.plasser) { var q = r.plasser[p]; if (q && typeof q.x === 'number' && typeof q.z === 'number' && isFinite(q.x) && isFinite(q.z)) s.plasser[p] = { x: q.x, z: q.z, r: tall(q.r, 0) }; }
    // Bestillinger: bare kjente varer og rimelige antall. Mynter og XP regnes ut på nytt, så lagringen kan ikke gi mer enn reglene.
    if (r.best && typeof r.best === 'object') {
      s.best.nr = Math.min(1e9, Math.max(0, Math.floor(tall(r.best.nr, 0)))); var fro = Math.floor(tall(r.best.fro, 1)); s.best.fro = fro >= 1 && fro < 2147483648 ? fro : 1;
      s.best.liste = [];
      if (Array.isArray(r.best.liste)) r.best.liste.slice(0, bestPlasser(s)).forEach(function (o) {
        if (!o || typeof o.varer !== 'object' || !o.varer) return; var varer = {}, n = 0;
        for (var v in o.varer) { var q = Math.floor(tall(o.varer[v], 0)); if ((D.avlinger[v] || D.varer[v]) && !D.erFor(v) && D.nivaaFor(v) <= D.innholdTil && q >= 1 && q <= 12 && n < 3) { varer[v] = q; n++; } }
        if (!n) return; var verdi = bestVerdi(varer);
        var id = typeof o.id === 'string' ? o.id.slice(0, 12) : ''; if (!id || s.best.liste.some(function (x) { return x.id === id; })) id = 'b' + (++s.best.nr);
        s.best.liste.push({ id: id, varer: varer, mynter: D.bestillingMynter(verdi), xp: D.bestillingXP(verdi), siden: tall(o.siden, naa) });
      });
    } else s.best.liste = [];
    fyllBestillinger(s, naa);
    if (r.oppl && typeof r.oppl === 'object') s.oppl.steg = Math.max(0, Math.floor(tall(r.oppl.steg, 0)));
    if (r.stat && typeof r.stat === 'object') for (var st in s.stat) s.stat[st] = Math.max(0, Math.floor(tall(r.stat[st], 0)));
    ['silo', 'lave'].forEach(function (type) {   // mer enn plassen i lageret kuttes (QA 9.11)
      var over = bruk(s, type) - kapasitet(s, type);
      Object.keys(s.lager).sort(function (a, b) { return s.lager[b] - s.lager[a]; }).forEach(function (v) {
        if (over <= 0 || lagerType(v) !== type) return; var n = Math.min(over, s.lager[v]); s.lager[v] -= n; over -= n; if (!s.lager[v]) delete s.lager[v]; });
    });
    normaliserTid(s, naa);
    return s;
  }

  function mk(v, n) { var o = {}; o[v] = n; return o; }

  var L = {
    VERSJON: VERSJON, D: D, ny: ny, giXP: giXP, giNivaa: giNivaa,
    lagerType: lagerType, kapasitet: kapasitet, bruk: bruk, plass: plass, har: har,
    akerStatus: akerStatus, kanPlante: kanPlante, plant: plant, host: host,
    dyrStatus: dyrStatus, mat: mat, samleDyr: samleDyr,
    uferdige: uferdige, kanProdusere: kanProdusere, produser: produser, hentProdukter: hentProdukter, kjopBygg: kjopBygg,
    kanLage: kanLage, bestPool: bestPool, nyBestilling: nyBestilling, bestPlasser: bestPlasser, fyllBestillinger: fyllBestillinger, kanLevere: kanLevere, lever: lever, byttBestilling: byttBestilling, boerByttes: boerByttes,
    nyKunde: nyKunde, selgTilKunde: selgTilKunde, kundePris: kundePris,
    kanSelge: kanSelge, selg: selg, normaliserTid: normaliserTid, valider: valider
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = L; else rot.MBLogikk = L;
})(typeof window !== 'undefined' ? window : globalThis);
