#!/usr/bin/env python3
"""Lager en isolert forhåndsvisning av et EVN-spill til en privat testside (artefakt).

Bruk: python3 lag-forhandsvisning.py <repo> <spillmappe> <utmappe>

Spillfila kopieres fra repoet og endres bare på disse punktene (pakking, ikke spill):
  1. three.js r128 lastes fra cdn.jsdelivr.net (npm three@0.128.0) med SRI-sjekk i stedet for vendor/.
  2. Skrifter lastes fra Google Fonts i stedet for fonter/.
  3. statistikk.js fjernes. Produksjonsstatistikk er av.
  4. CSP i spillet tillater bare disse kildene, og ingen GoatCounter.
  5. favicon fjernes.
Alt annet er byte-likt. Skriptet stopper hvis et punkt ikke finnes nøyaktig én gang.
"""
import os, shutil, sys

THREE = ('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js" '
         'integrity="sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu" '
         'crossorigin="anonymous"></script>')
FONTER = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One'
          '&family=Nunito:wght@500;600;700;800&family=Rubik:wght@600;800;900&display=swap">')
CSP = ('<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; '
       'script-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net; '
       'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; '
       'img-src \'self\' data: blob:; connect-src \'self\'; media-src \'self\' data: blob:; worker-src \'self\'; '
       'object-src \'none\'; base-uri \'self\'; form-action \'none\'">')


def bytt(s, gammel, ny, hva):
    n = s.count(gammel)
    if n != 1:
        sys.exit(f'Stopp: «{hva}» finnes {n} ganger, ikke én.')
    return s.replace(gammel, ny)


def main(repo, spill, ut):
    kilde = os.path.join(repo, 'spill', spill, 'index.html')
    s = open(kilde, encoding='utf8').read()
    start = s.index('<meta http-equiv="Content-Security-Policy"')
    slutt = s.index('>', start) + 1
    s = s[:start] + CSP + s[slutt:]
    s = bytt(s, '<script src="../../vendor/three-r128.min.js"></script>', THREE, 'three.js')
    s = bytt(s, '<link rel="stylesheet" href="../../fonter/fonter.css">', FONTER, 'skrifter')
    s = bytt(s, '<link rel="icon" href="../../favicon.png">\n', '', 'favicon')
    i = s.index('<script src="../../statistikk.js"')
    j = s.index('</script>', i) + len('</script>')
    s = s[:i] + '<!-- Forhåndsvisning: statistikk er av -->' + s[j:]
    for ord_ in ('goatcounter', 'gc.zgo.at', 'statistikk.js', 'vendor/three', 'fonter/'):
        if ord_ in s:
            sys.exit(f'Stopp: «{ord_}» finnes fortsatt i spillfila.')
    os.makedirs(os.path.join(ut, 'spill', spill), exist_ok=True)
    open(os.path.join(ut, 'spill', spill, 'index.html'), 'w', encoding='utf8').write(s)
    for f in ('ecoins/ecoins.js', 'ecoins/tilbehor-3d.js', 'bilder/robot-start-vink-130.webp', 'bilder/robot-start-vink-260.webp'):
        os.makedirs(os.path.join(ut, os.path.dirname(f)), exist_ok=True)
        shutil.copyfile(os.path.join(repo, f), os.path.join(ut, f))
    print('ok', kilde, '→', ut)


if __name__ == '__main__':
    main(*sys.argv[1:4])
