"""Flere matdyr på to bein (Even 17.11.2026: «du må lage ferdig dyrene»). Pulje 2: katt, hund, kanin, rev og panda.
Samme byggemåte og navn som matdyr_tobein.py: hode (pivot ved halsen), armene vinge_v/vinge_h, beina bein_vf/bein_hf og hale.
Dyrene lages uten mat og settes sammen med matkroppen i spillet (matdyr_tobein_deler.py).
Felles hjelpere (hode, armer, bein) gjør det raskt å legge til nye dyr: hvert dyr beskriver bare det som er særpreget (ører, snute, hale, farger).
"""
import math
from mathutils import Vector as V, Matrix
import matdyr_modul as M
from matdyr_hybrider import mat, prim, kurve, slaa_sammen, pivot, oye, kinn, smil

C_STD, A_STD = V((0, 0.02, 0.72)), V((0.4, 0.34, 0.42))

def _hodekule(farge, hx, hy, hz, r=(0.27, 0.24, 0.25)):
    return prim('kule', 'hodekule', farge, (hx, hy, hz), r, segments=40, ring_count=24)

def _ansikt(hx, hy, hz, oyeavstand=0.11, oyehoyde=0.08, kinnfarge=True):
    d = []
    for s in (-1, 1):
        d += oye('oye%d' % s, (hx + s * oyeavstand, hy - 0.2, hz + oyehoyde), 0.058)
        if kinnfarge: d.append(kinn('kinn%d' % s, (hx + s * 0.19, hy - 0.15, hz - 0.06), 0.045))
    return d

def _spisse_orer(hx, hy, hz, ytre, indre, hoyde=0.14, bredde=0.09, ut=0.15, tupp=None):
    d = []
    for s in (-1, 1):
        for nm, m_, sk, dy in (('ore', ytre, (bredde, 0.035, hoyde), 0.02), ('oreinn', indre, (bredde * 0.6, 0.015, hoyde * 0.65), -0.01)):
            o = prim('kjegle', '%s%d' % (nm, s), m_, (0, 0, 0), sk, vertices=16, ss=1)
            o.data.transform(Matrix.Rotation(s * -0.3, 4, 'Y')); o.data.transform(Matrix.Translation((hx + s * ut, hy + dy, hz + 0.2 + hoyde * 0.5))); d.append(o)
        if tupp is not None:
            t = prim('kjegle', 'oretupp%d' % s, tupp, (0, 0, 0), (bredde * 0.45, 0.04, hoyde * 0.35), vertices=12, ss=1)
            t.data.transform(Matrix.Rotation(s * -0.3, 4, 'Y')); t.data.transform(Matrix.Translation((hx + s * (ut + 0.035 * s * s), hy + 0.02, hz + 0.2 + hoyde * 1.05))); d.append(t)
    return d

def _runde_orer(hx, hy, hz, ytre, indre, r=0.085, ut=0.19, opp=0.19):
    d = []
    for s in (-1, 1):
        d.append(prim('kule', 'ore%d' % s, ytre, (hx + s * ut, hy + 0.02, hz + opp), (r, 0.05, r), segments=20, ring_count=12))
        if indre is not None: d.append(prim('kule', 'oreinn%d' % s, indre, (hx + s * ut, hy - 0.02, hz + opp), (r * 0.6, 0.02, r * 0.6), segments=16, ring_count=10))
    return d

def _hals_og_hode(hd, farge, hx, hy, hz):
    hd.append(prim('syl', 'hals', farge, (hx, hy + 0.02, hz - 0.22), (0.14, 0.14, 0.1), vertices=24, ss=1))
    return pivot(slaa_sammen('hode', hd), (hx, hy, hz - 0.2))

def _armer(C, A, farge, pote, tykk=0.07):
    armer = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        sx, sy, sz = A.x + 0.02, C.y - 0.02, C.z + 0.14
        a = [kurve(navn + '_arm', [(s * (sx - 0.04), sy, sz), (s * (sx + 0.06), sy - 0.04, sz - 0.15), (s * (sx + 0.04), sy - 0.1, sz - 0.3)], tykk, farge, avsmal=lambda u: 1 - 0.15 * u),
             prim('kule', navn + '_pote', pote, (s * (sx + 0.04), sy - 0.11, sz - 0.36), (0.07, 0.065, 0.065), segments=18, ring_count=10)]
        armer.append(pivot(slaa_sammen(navn, a), (s * (sx - 0.04), sy, sz)))
    return armer

def _bein(under, farge, fot, fotlengde=0.15):
    bein = []
    for i, s in enumerate((-1, 1)):
        bx = s * 0.17
        b = [prim('kule', 'bein%d' % i, farge, (bx, 0.0, (under + 0.08) / 2 + 0.04), (0.095, 0.095, (under + 0.08) / 2 + 0.02), segments=24, ring_count=16),
             prim('kule', 'fot%d' % i, fot, (bx, -0.04, 0.06), (0.11, fotlengde, 0.07), segments=22, ring_count=12)]
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (bx, 0, under + 0.06)))
    return bein

def _start(matkropp):
    C, A = C_STD.copy(), A_STD.copy()
    k = M.MAT[matkropp](C, A, 'staa'); t = k['topp']
    return C, A, k, t.x, t.y - 0.06, t.z + 0.23, max(0.16, k['under'])

def katt_tobein(matkropp):
    pels = mat('katt', '#f4a65a', 0.6); stripe = mat('katt_stripe', '#d97b2e', 0.6); rosa = mat('katt_rosa', '#ffb3c1', 0.5); hvit = mat('katt_hvit', '#fff6ea', 0.6)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(pels, hx, hy, hz), prim('kule', 'mule', hvit, (hx, hy - 0.17, hz - 0.08), (0.15, 0.1, 0.09), segments=28, ring_count=14),
          prim('kule', 'nese', rosa, (hx, hy - 0.27, hz - 0.04), (0.035, 0.022, 0.025), segments=14, ring_count=8)]
    for i, dx in enumerate((-0.08, 0, 0.08)):
        hd.append(prim('kule', 'stripe%d' % i, stripe, (hx + dx, hy - 0.06, hz + 0.21), (0.022, 0.08, 0.04), segments=10, ring_count=6))
    for s in (-1, 1):
        for j, dz in enumerate((-0.02, -0.06)):
            o = prim('syl', 'bart%d%d' % (s, j), mat('bart', '#5b4636', 0.5), (0, 0, 0), (0.006, 0.006, 0.14), vertices=6, ss=1)
            o.data.transform(Matrix.Rotation(math.pi / 2, 4, 'Y')); o.data.transform(Matrix.Rotation(s * (0.15 + j * 0.2), 4, 'Y'))
            o.data.transform(Matrix.Translation((hx + s * 0.2, hy - 0.24, hz + dz - 0.04))); hd.append(o)
    hd += _ansikt(hx, hy, hz) + _spisse_orer(hx, hy, hz, pels, rosa) + [smil('smil', (hx, hy - 0.26, hz - 0.12), 0.04)]
    hode = _hals_og_hode(hd, pels, hx, hy, hz)
    bk = k['bak']
    hale = pivot(slaa_sammen('hale', [kurve('halestrå', [tuple(bk), tuple(bk + V((0.05, 0.16, -0.05))), tuple(bk + V((0.08, 0.24, 0.18))), tuple(bk + V((0.02, 0.22, 0.36)))], 0.035, pels),
                                     prim('kule', 'haletupp', stripe, tuple(bk + V((0.02, 0.22, 0.38))), (0.04, 0.04, 0.05), segments=12, ring_count=8)]), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, pels, hvit) + _bein(under, pels, hvit) + [hale]

def hund_tobein(matkropp):
    pels = mat('hund', '#c98c55', 0.6); lys = mat('hund_lys', '#f3dcc0', 0.6); mork = mat('hund_mork', '#7a4e2c', 0.6); svart = mat('hund_nese', '#2b2630', 0.4)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(pels, hx, hy, hz), prim('kule', 'snute', lys, (hx, hy - 0.2, hz - 0.08), (0.15, 0.13, 0.1), segments=28, ring_count=14),
          prim('kule', 'nese', svart, (hx, hy - 0.32, hz - 0.03), (0.055, 0.035, 0.04), segments=16, ring_count=10),
          prim('kule', 'tunge', mat('tunge', '#ff7a8a', 0.5), (hx + 0.03, hy - 0.27, hz - 0.17), (0.04, 0.025, 0.05), segments=12, ring_count=8),
          prim('kule', 'flekk', mork, (hx - 0.12, hy - 0.14, hz + 0.1), (0.08, 0.06, 0.08), segments=16, ring_count=10)]
    for s in (-1, 1):
        o = prim('kule', 'ore%d' % s, mork, (0, 0, 0), (0.07, 0.04, 0.16), segments=20, ring_count=12)
        o.data.transform(Matrix.Rotation(s * 0.35, 4, 'Y')); o.data.transform(Matrix.Translation((hx + s * 0.25, hy + 0.02, hz + 0.02))); hd.append(o)
    hd += _ansikt(hx, hy, hz, kinnfarge=False) + [smil('smil', (hx, hy - 0.3, hz - 0.12), 0.05)]
    hode = _hals_og_hode(hd, pels, hx, hy, hz)
    bk = k['bak']
    hale = pivot(slaa_sammen('hale', [kurve('halestrå', [tuple(bk), tuple(bk + V((0, 0.12, 0.06))), tuple(bk + V((0, 0.16, 0.2)))], 0.04, pels, avsmal=lambda u: 1 - 0.5 * u)]), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, pels, lys) + _bein(under, pels, lys) + [hale]

def kanin_tobein(matkropp):
    pels = mat('kanin', '#f2eee9', 0.6); rosa = mat('kanin_rosa', '#ffb3c1', 0.5); gra = mat('kanin_gra', '#d9d2ca', 0.6)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(pels, hx, hy, hz), prim('kule', 'mule', pels, (hx, hy - 0.17, hz - 0.08), (0.13, 0.1, 0.08), segments=28, ring_count=14),
          prim('kule', 'nese', rosa, (hx, hy - 0.27, hz - 0.04), (0.03, 0.02, 0.022), segments=14, ring_count=8)]
    for s in (-1, 1):
        hd.append(prim('kube', 'tann%d' % s, mat('tann', '#ffffff', 0.3), (hx + s * 0.018, hy - 0.25, hz - 0.13), (0.016, 0.006, 0.026)))
        for nm, m_, sk, dy in (('ore', pels, (0.07, 0.04, 0.24), 0.02), ('oreinn', rosa, (0.04, 0.015, 0.18), -0.02)):
            o = prim('kule', '%s%d' % (nm, s), m_, (0, 0, 0), sk, segments=20, ring_count=12)
            o.data.transform(Matrix.Rotation(s * -0.18, 4, 'Y')); o.data.transform(Matrix.Translation((hx + s * 0.1, hy + dy, hz + 0.42))); hd.append(o)
    hd += _ansikt(hx, hy, hz) + [smil('smil', (hx, hy - 0.26, hz - 0.1), 0.035)]
    hode = _hals_og_hode(hd, pels, hx, hy, hz)
    bk = k['bak']
    hale = pivot(slaa_sammen('hale', [prim('kule', 'dusk', mat('kanin_dusk', '#ffffff', 0.7), tuple(bk + V((0, 0.06, 0))), (0.09, 0.09, 0.09), segments=20, ring_count=12)]), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, pels, gra) + _bein(under, pels, gra, 0.19) + [hale]

def rev_tobein(matkropp):
    pels = mat('rev', '#f07a2a', 0.6); hvit = mat('rev_hvit', '#fff6ea', 0.6); svart = mat('rev_svart', '#2b2630', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    snute = prim('kjegle', 'snute', hvit, (0, 0, 0), (0.12, 0.1, 0.16), vertices=24, ss=1)
    snute.data.transform(Matrix.Rotation(math.pi / 2, 4, 'X')); snute.data.transform(Matrix.Translation((hx, hy - 0.24, hz - 0.06)))
    hd = [_hodekule(pels, hx, hy, hz), snute, prim('kule', 'nese', svart, (hx, hy - 0.34, hz - 0.05), (0.035, 0.025, 0.03), segments=14, ring_count=8)]
    for s in (-1, 1): hd.append(prim('kule', 'kinnhvit%d' % s, hvit, (hx + s * 0.15, hy - 0.12, hz - 0.08), (0.1, 0.07, 0.08), segments=18, ring_count=10))
    hd += _ansikt(hx, hy, hz, kinnfarge=False) + _spisse_orer(hx, hy, hz, pels, svart, hoyde=0.17, bredde=0.1, tupp=svart)
    hode = _hals_og_hode(hd, pels, hx, hy, hz)
    bk = k['bak']
    hale = pivot(slaa_sammen('hale', [prim('kule', 'halebusk', pels, tuple(bk + V((0.04, 0.2, -0.1))), (0.1, 0.22, 0.11), (0.6, 0, 0), segments=24, ring_count=14),
                                     prim('kule', 'haletupp', hvit, tuple(bk + V((0.05, 0.36, -0.22))), (0.07, 0.08, 0.07), segments=16, ring_count=10)]), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, pels, svart) + _bein(under, svart, svart) + [hale]

def panda_tobein(matkropp):
    hvit = mat('panda_hvit', '#f7f5f0', 0.6); svart = mat('panda_svart', '#2b2630', 0.55)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(hvit, hx, hy, hz, (0.29, 0.25, 0.26)), prim('kule', 'mule', hvit, (hx, hy - 0.18, hz - 0.08), (0.14, 0.1, 0.08), segments=28, ring_count=14),
          prim('kule', 'nese', svart, (hx, hy - 0.27, hz - 0.04), (0.045, 0.028, 0.03), segments=14, ring_count=8)]
    for s in (-1, 1):
        o = prim('kule', 'oyeflekk%d' % s, svart, (0, 0, 0), (0.075, 0.03, 0.095), segments=18, ring_count=10)
        o.data.transform(Matrix.Rotation(s * 0.5, 4, 'Y')); o.data.transform(Matrix.Translation((hx + s * 0.11, hy - 0.2, hz + 0.06))); hd.append(o)
    hd += _ansikt(hx, hy, hz) + _runde_orer(hx, hy, hz, svart, None) + [smil('smil', (hx, hy - 0.26, hz - 0.12), 0.04)]
    hode = _hals_og_hode(hd, hvit, hx, hy, hz)
    bk = k['bak']
    hale = pivot(slaa_sammen('hale', [prim('kule', 'dusk', hvit, tuple(bk + V((0, 0.05, 0))), (0.07, 0.07, 0.07), segments=16, ring_count=10)]), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, svart, svart, 0.08) + _bein(under, svart, svart) + [hale]

def _snute_nese(hd, hx, hy, hz, snutefarge, nesefarge, bred=0.14, ut=0.18):
    hd.append(prim('kule', 'snute', snutefarge, (hx, hy - ut, hz - 0.08), (bred, 0.1, 0.09), segments=28, ring_count=14))
    hd.append(prim('kule', 'nese', nesefarge, (hx, hy - ut - 0.1, hz - 0.04), (0.045, 0.028, 0.032), segments=14, ring_count=8))

def _halekurve(bk, farge, pkt, tykk=0.03, tupp=None, tuppr=0.05):
    d = [kurve('halestrå', [tuple(bk + V(p)) for p in [(0, 0, 0)] + pkt], tykk, farge, avsmal=lambda u: 1 - 0.3 * u)]
    if tupp is not None: d.append(prim('kule', 'haletupp', tupp, tuple(bk + V(pkt[-1])), (tuppr, tuppr, tuppr * 1.2), segments=16, ring_count=10))
    return pivot(slaa_sammen('hale', d), tuple(bk))

def mus_tobein(matkropp):
    gra = mat('mus', '#b9b3c9', 0.6); rosa = mat('mus_rosa', '#ffb3c1', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(gra, hx, hy, hz, (0.25, 0.23, 0.23))]
    snute = prim('kjegle', 'snute', gra, (0, 0, 0), (0.11, 0.1, 0.14), vertices=24, ss=1)
    snute.data.transform(Matrix.Rotation(math.pi / 2, 4, 'X')); snute.data.transform(Matrix.Translation((hx, hy - 0.22, hz - 0.06))); hd.append(snute)
    hd.append(prim('kule', 'nese', rosa, (hx, hy - 0.31, hz - 0.06), (0.035, 0.025, 0.03), segments=14, ring_count=8))
    hd += _ansikt(hx, hy, hz) + _runde_orer(hx, hy, hz, gra, rosa, r=0.13, ut=0.21, opp=0.2)
    hode = _hals_og_hode(hd, gra, hx, hy, hz)
    hale = _halekurve(k['bak'], rosa, [(0.04, 0.14, -0.1), (0.1, 0.26, 0.0), (0.06, 0.34, 0.16)], 0.018)
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, gra, rosa, 0.06) + _bein(under, gra, rosa) + [hale]

def bjorn_tobein(matkropp):
    brun = mat('bjorn', '#8a5a3c', 0.65); lys = mat('bjorn_lys', '#d9b08c', 0.6); svart = mat('bjorn_nese', '#2b2630', 0.4)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(brun, hx, hy, hz, (0.29, 0.25, 0.26))]
    _snute_nese(hd, hx, hy, hz, lys, svart)
    hd += _ansikt(hx, hy, hz, kinnfarge=False) + _runde_orer(hx, hy, hz, brun, lys) + [smil('smil', (hx, hy - 0.27, hz - 0.13), 0.04)]
    hode = _hals_og_hode(hd, brun, hx, hy, hz)
    hale = pivot(slaa_sammen('hale', [prim('kule', 'dusk', brun, tuple(k['bak'] + V((0, 0.05, 0))), (0.06, 0.06, 0.06), segments=14, ring_count=8)]), tuple(k['bak']))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, brun, lys, 0.085) + _bein(under, brun, lys) + [hale]

def love_tobein(matkropp):
    gul = mat('love', '#e9b44c', 0.6); manke = mat('love_manke', '#b8622a', 0.7); lys = mat('love_lys', '#fbe6b8', 0.6); svart = mat('love_nese', '#5b3a2a', 0.4)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [prim('kule', 'manke%d' % i, manke, (hx + 0.25 * math.cos(a), hy + 0.05, hz + 0.02 + 0.25 * math.sin(a)), (0.11, 0.08, 0.11), segments=16, ring_count=10)
          for i, a in enumerate([j * 2 * math.pi / 12 for j in range(12)])]
    hd.append(prim('kule', 'mankebak', manke, (hx, hy + 0.07, hz + 0.02), (0.3, 0.08, 0.3), segments=32, ring_count=16))
    hd.append(_hodekule(gul, hx, hy, hz, (0.24, 0.22, 0.23)))
    _snute_nese(hd, hx, hy, hz, lys, svart, 0.12, 0.17)
    hd += _ansikt(hx, hy, hz, 0.1) + _runde_orer(hx, hy, hz, gul, lys, r=0.06, ut=0.17, opp=0.2) + [smil('smil', (hx, hy - 0.26, hz - 0.12), 0.04)]
    hode = _hals_og_hode(hd, gul, hx, hy, hz)
    hale = _halekurve(k['bak'], gul, [(0.03, 0.14, -0.12), (0.06, 0.3, -0.04), (0.04, 0.36, 0.12)], 0.025, manke, 0.06)
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, gul, lys) + _bein(under, gul, lys) + [hale]

def tiger_tobein(matkropp):
    oransje = mat('tiger', '#f08a2c', 0.6); stripe = mat('tiger_stripe', '#2b2630', 0.6); hvit = mat('tiger_hvit', '#fff6ea', 0.6); rosa = mat('tiger_nese', '#e8737d', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(oransje, hx, hy, hz)]
    _snute_nese(hd, hx, hy, hz, hvit, rosa, 0.13, 0.17)
    for i, dx in enumerate((-0.09, 0, 0.09)):
        hd.append(prim('kule', 'stripe%d' % i, stripe, (hx + dx, hy - 0.05, hz + 0.22), (0.02, 0.09, 0.045), segments=10, ring_count=6))
    for s in (-1, 1):
        for j, dz in enumerate((0.02, -0.06)):
            hd.append(prim('kule', 'kinnstripe%d%d' % (s, j), stripe, (hx + s * 0.24, hy - 0.06, hz + dz), (0.015, 0.06, 0.02), segments=8, ring_count=6))
    hd += _ansikt(hx, hy, hz, kinnfarge=False) + _runde_orer(hx, hy, hz, oransje, hvit, r=0.07, ut=0.19, opp=0.2) + [smil('smil', (hx, hy - 0.26, hz - 0.12), 0.04)]
    hode = _hals_og_hode(hd, oransje, hx, hy, hz)
    pkt = [(0.03, 0.14, -0.1), (0.07, 0.28, 0.0), (0.05, 0.34, 0.16)]
    hale = _halekurve(k['bak'], oransje, pkt, 0.03, stripe, 0.035)
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, oransje, hvit) + _bein(under, oransje, hvit) + [hale]

def ape_tobein(matkropp):
    brun = mat('ape', '#8d5b3a', 0.65); hud = mat('ape_hud', '#f1c9a0', 0.55); mork = mat('ape_mork', '#5b3a2a', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(brun, hx, hy, hz), prim('kule', 'ansikt', hud, (hx, hy - 0.14, hz - 0.01), (0.2, 0.13, 0.19), segments=32, ring_count=16),
          prim('kule', 'mule', hud, (hx, hy - 0.22, hz - 0.1), (0.13, 0.09, 0.08), segments=24, ring_count=12)]
    for s in (-1, 1): hd.append(prim('kule', 'nesebor%d' % s, mork, (hx + s * 0.03, hy - 0.31, hz - 0.07), (0.015, 0.01, 0.012), segments=8, ring_count=6))
    hd += _ansikt(hx, hy, hz, 0.08, 0.06) + _runde_orer(hx, hy, hz, brun, hud, r=0.08, ut=0.27, opp=0.02) + [smil('smil', (hx, hy - 0.3, hz - 0.13), 0.05)]
    hode = _hals_og_hode(hd, brun, hx, hy, hz)
    hale = _halekurve(k['bak'], brun, [(0.05, 0.16, -0.12), (0.12, 0.3, 0.0), (0.06, 0.36, 0.2), (-0.04, 0.3, 0.26)], 0.028)
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, brun, hud, 0.065) + _bein(under, brun, hud) + [hale]

def _nebb(hd, hx, hy, hz, farge, lengde=0.14, bred=0.08, ned=0.06):
    o = prim('kjegle', 'nebb', farge, (0, 0, 0), (bred, bred * 0.7, lengde), vertices=20, ss=1)
    o.data.transform(Matrix.Rotation(math.pi / 2, 4, 'X')); o.data.transform(Matrix.Translation((hx, hy - 0.22 - lengde * 0.3, hz - ned))); hd.append(o)

def _vingearmer(C, A, farge, spiss=None):
    """Vinger i stedet for armer (fugler). Navnene er de samme, så de svinger i takt med beina."""
    armer = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        sx, sy, sz = A.x + 0.0, C.y, C.z + 0.14
        v = prim('kule', navn + '_vinge', farge, (0, 0, 0), (0.06, 0.14, 0.24), segments=20, ring_count=12)
        v.data.transform(Matrix.Rotation(s * 0.12, 4, 'Y')); v.data.transform(Matrix.Translation((s * (sx - 0.01), sy, sz - 0.16)))   # vingen ligger inntil kroppen (Even 17.11.2026)
        d = [v]
        if spiss is not None: d.append(prim('kule', navn + '_spiss', spiss, (s * (sx + 0.01), sy, sz - 0.36), (0.04, 0.09, 0.07), segments=12, ring_count=8))
        armer.append(pivot(slaa_sammen(navn, d), (s * sx, sy, sz)))
    return armer

def _fuglebein(under, farge):
    bein = []
    for i, s in enumerate((-1, 1)):
        bx = s * 0.15
        b = [prim('syl', 'legg%d' % i, farge, (bx, 0, (under + 0.08) / 2 + 0.03), (0.035, 0.035, (under + 0.08) / 2), vertices=12, ss=1)]
        for j, a in enumerate((-0.5, 0, 0.5)):
            t = prim('kule', 'to%d%d' % (i, j), farge, (0, 0, 0), (0.025, 0.09, 0.022), segments=10, ring_count=6)
            t.data.transform(Matrix.Rotation(a, 4, 'Z')); t.data.transform(Matrix.Translation((bx + math.sin(a) * 0.06, -0.06, 0.025))); b.append(t)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (bx, 0, under + 0.06)))
    return bein

def frosk_tobein(matkropp):
    gronn = mat('frosk', '#6cc24a', 0.55); lys = mat('frosk_lys', '#d9f2a0', 0.6); rosa = mat('frosk_munn', '#ff8fa3', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(gronn, hx, hy, hz - 0.03, (0.3, 0.24, 0.2)), prim('kule', 'hake', lys, (hx, hy - 0.12, hz - 0.1), (0.24, 0.15, 0.09), segments=28, ring_count=14)]
    for s in (-1, 1):
        hd.append(prim('kule', 'oyekule%d' % s, gronn, (hx + s * 0.13, hy - 0.08, hz + 0.15), (0.1, 0.1, 0.1), segments=24, ring_count=14))
        hd += oye('oye%d' % s, (hx + s * 0.13, hy - 0.16, hz + 0.17), 0.065)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.2, hy - 0.17, hz - 0.04), 0.045))
    hd.append(kurve('munn', [(hx - 0.14, hy - 0.22, hz - 0.06), (hx, hy - 0.25, hz - 0.1), (hx + 0.14, hy - 0.22, hz - 0.06)], 0.012, rosa))
    hode = _hals_og_hode(hd, gronn, hx, hy, hz)
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, gronn, lys, 0.06) + _bein(under, gronn, lys, 0.2)

def pingvin_tobein(matkropp):
    svart = mat('pingvin', '#2f3542', 0.5); hvit = mat('pingvin_hvit', '#fbfaf6', 0.6); gul = mat('pingvin_nebb', '#ffb02e', 0.45)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(svart, hx, hy, hz), prim('kule', 'ansikt', hvit, (hx, hy - 0.12, hz - 0.02), (0.2, 0.14, 0.18), segments=32, ring_count=16)]
    _nebb(hd, hx, hy, hz, gul, 0.12, 0.07, 0.04)
    hd += _ansikt(hx, hy, hz, 0.09, 0.07)
    hode = _hals_og_hode(hd, svart, hx, hy, hz)
    return slaa_sammen('kropp', k['deler']), hode, _vingearmer(C, A, svart) + _bein(under, svart, gul, 0.18)

def elefant_tobein(matkropp):
    gra = mat('elefant', '#a7b1c2', 0.6); rosa = mat('elefant_ore', '#f5b8c4', 0.55); hvit = mat('elefant_tann', '#fffaf0', 0.35)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(gra, hx, hy, hz, (0.28, 0.25, 0.26))]
    hd.append(kurve('snabel', [(hx, hy - 0.2, hz - 0.02), (hx, hy - 0.3, hz - 0.14), (hx, hy - 0.34, hz - 0.3), (hx, hy - 0.42, hz - 0.36)], 0.06, gra, avsmal=lambda u: 1 - 0.35 * u))
    for s in (-1, 1):
        hd.append(prim('kule', 'ore%d' % s, gra, (hx + s * 0.3, hy + 0.04, hz), (0.05, 0.2, 0.22), (0, 0, s * 0.5), segments=24, ring_count=12))
        hd.append(prim('kule', 'oreinn%d' % s, rosa, (hx + s * 0.29, hy, hz), (0.03, 0.14, 0.16), (0, 0, s * 0.5), segments=20, ring_count=10))
        o = prim('kjegle', 'tann%d' % s, hvit, (0, 0, 0), (0.03, 0.03, 0.09), vertices=12, ss=1)
        o.data.transform(Matrix.Rotation(2.4, 4, 'X')); o.data.transform(Matrix.Translation((hx + s * 0.08, hy - 0.24, hz - 0.15))); hd.append(o)
    hd += _ansikt(hx, hy, hz, 0.12, 0.07)
    hode = _hals_og_hode(hd, gra, hx, hy, hz)
    hale = _halekurve(k['bak'], gra, [(0, 0.1, -0.12), (0, 0.14, -0.26)], 0.02, mat('dusk', '#5b5f6b', 0.6), 0.04)
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, gra, gra, 0.085) + _bein(under, gra, mat('elefant_negl', '#e9e4da', 0.5)) + [hale]

def _manke_hest(hd, hx, hy, hz, farge):
    for i in range(6):
        u = i / 5
        hd.append(prim('kule', 'manke%d' % i, farge, (hx, hy + 0.12 + 0.04 * u, hz + 0.24 - 0.42 * u), (0.05, 0.08, 0.08), segments=14, ring_count=8))

def hest_tobein(matkropp, enhjorning=False):
    farge = mat('enhjorning' if enhjorning else 'hest', '#fbf7ff' if enhjorning else '#b47a4c', 0.55)
    lys = mat('hest_mule', '#f2d6c4' if enhjorning else '#e7c3a0', 0.55); hov = mat('hov', '#c9a0ff' if enhjorning else '#4a3529', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(farge, hx, hy, hz + 0.02, (0.22, 0.24, 0.26)), prim('kule', 'mule', lys, (hx, hy - 0.23, hz - 0.1), (0.15, 0.13, 0.12), segments=28, ring_count=14)]
    for s in (-1, 1): hd.append(prim('kule', 'nesebor%d' % s, mat('nesebor_h', '#7a5446', 0.5), (hx + s * 0.05, hy - 0.35, hz - 0.08), (0.02, 0.012, 0.025), segments=10, ring_count=6))
    hd += _ansikt(hx, hy, hz, 0.12, 0.07) + _spisse_orer(hx, hy, hz, farge, lys, 0.12, 0.06, 0.1)
    if enhjorning:
        regn = [mat('regn%d' % i, c, 0.5) for i, c in enumerate(['#ff6b8b', '#ffb02e', '#ffe14d', '#6cd36c', '#5ab4ff', '#b18cff'])]
        for i in range(6):
            u = i / 5; hd.append(prim('kule', 'manke%d' % i, regn[i], (hx, hy + 0.12 + 0.04 * u, hz + 0.24 - 0.42 * u), (0.055, 0.08, 0.08), segments=14, ring_count=8))
        h = prim('kjegle', 'horn', mat('horn_gull', '#ffd23f', 0.3, met=0.4), (0, 0, 0), (0.045, 0.045, 0.2), vertices=16, ss=1)
        h.data.transform(Matrix.Rotation(-0.35, 4, 'X')); h.data.transform(Matrix.Translation((hx, hy - 0.1, hz + 0.33))); hd.append(h)
    else:
        _manke_hest(hd, hx, hy, hz, mat('hest_manke', '#5b3a2a', 0.65))
    hode = _hals_og_hode(hd, farge, hx, hy, hz)
    halef = regn[2] if enhjorning else mat('hest_manke', '#5b3a2a', 0.65)
    hale = pivot(slaa_sammen('hale', [kurve('halestrå%d' % i, [tuple(k['bak']), tuple(k['bak'] + V((dx, 0.14, -0.1))), tuple(k['bak'] + V((dx * 2, 0.2, -0.32)))], 0.035, regn[i * 2] if enhjorning else halef) for i, dx in enumerate((-0.03, 0, 0.03))]), tuple(k['bak']))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, farge, hov) + _bein(under, farge, hov) + [hale]

def enhjorning_tobein(matkropp): return hest_tobein(matkropp, True)

def geit_tobein(matkropp):
    hvit = mat('geit', '#f4efe6', 0.6); horn = mat('geit_horn', '#a89070', 0.5); rosa = mat('geit_rosa', '#f2c4c4', 0.5); hov = mat('geit_hov', '#4a3529', 0.5)
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(hvit, hx, hy, hz, (0.22, 0.24, 0.25)), prim('kule', 'mule', hvit, (hx, hy - 0.2, hz - 0.1), (0.13, 0.13, 0.1), segments=24, ring_count=12),
          prim('kule', 'nese', rosa, (hx, hy - 0.31, hz - 0.07), (0.05, 0.025, 0.03), segments=14, ring_count=8),
          prim('kjegle', 'skjegg', hvit, (hx, hy - 0.2, hz - 0.28), (0.05, 0.04, 0.09), (math.pi, 0, 0), vertices=12, ss=1)]
    for s in (-1, 1):
        hd.append(kurve('horn%d' % s, [(hx + s * 0.08, hy + 0.02, hz + 0.2), (hx + s * 0.12, hy + 0.12, hz + 0.32), (hx + s * 0.16, hy + 0.24, hz + 0.3)], 0.04, horn, avsmal=lambda u: 1 - 0.6 * u))
        o = prim('kule', 'ore%d' % s, hvit, (hx + s * 0.25, hy, hz + 0.04), (0.11, 0.04, 0.05), (0, s * 0.4, 0), segments=16, ring_count=10); hd.append(o)
    hd += _ansikt(hx, hy, hz, 0.11, 0.07)
    hode = _hals_og_hode(hd, hvit, hx, hy, hz)
    hale = pivot(slaa_sammen('hale', [prim('kjegle', 'hale', hvit, tuple(k['bak'] + V((0, 0.06, 0.04))), (0.04, 0.04, 0.08), (-0.6, 0, 0), vertices=12, ss=1)]), tuple(k['bak']))
    return slaa_sammen('kropp', k['deler']), hode, _armer(C, A, hvit, hov) + _bein(under, hvit, hov) + [hale]

def _fugl(matkropp, farge, nebbfarge, beinfarge, vinge=None, topp=None, ekstra=None, nebb=(0.12, 0.07, 0.04), hode_r=(0.25, 0.23, 0.24)):
    C, A, k, hx, hy, hz, under = _start(matkropp)
    hd = [_hodekule(farge, hx, hy, hz, hode_r)]
    _nebb(hd, hx, hy, hz, nebbfarge, *nebb)
    hd += _ansikt(hx, hy, hz, 0.1, 0.07)
    if topp: hd += topp(hx, hy, hz)
    if ekstra: hd += ekstra(hx, hy, hz)
    hode = _hals_og_hode(hd, farge, hx, hy, hz)
    bk = k['bak']
    fjr = [prim('kule', 'halefjar%d' % i, vinge or farge, tuple(bk + V((dx, 0.12, 0.06))), (0.05, 0.14, 0.04), (0.7, 0, dx * 3), segments=14, ring_count=8) for i, dx in enumerate((-0.06, 0, 0.06))]
    hale = pivot(slaa_sammen('hale', fjr), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, _vingearmer(C, A, vinge or farge) + _fuglebein(under, beinfarge) + [hale]

def hone_tobein(matkropp):
    rod = mat('kam', '#e8402e', 0.5)
    def kam(hx, hy, hz): return [prim('kule', 'kam%d' % i, rod, (hx, hy + dy, hz + 0.24 + h), (0.035, 0.05, 0.06), segments=12, ring_count=8) for i, (dy, h) in enumerate(((-0.08, 0.0), (0, 0.03), (0.08, 0.0)))] + \
                         [prim('kule', 'hakelapp', rod, (hx, hy - 0.22, hz - 0.13), (0.035, 0.03, 0.06), segments=12, ring_count=8)]
    return _fugl(matkropp, mat('hone', '#fbf7f0', 0.6), mat('hone_nebb', '#ffb02e', 0.45), mat('hone_bein', '#ffb02e', 0.5), topp=kam)

def and_tobein(matkropp):
    return _fugl(matkropp, mat('and', '#ffe14d', 0.55), mat('and_nebb', '#ff8c1a', 0.45), mat('and_bein', '#ff8c1a', 0.5), nebb=(0.1, 0.1, 0.05))

def ugle_tobein(matkropp):
    brun = mat('ugle', '#9c6b45', 0.6); lys = mat('ugle_lys', '#f3dcc0', 0.6)
    def ansikt(hx, hy, hz):
        d = []
        for s in (-1, 1):
            d.append(prim('kule', 'oyering%d' % s, lys, (hx + s * 0.1, hy - 0.17, hz + 0.07), (0.1, 0.04, 0.1), segments=20, ring_count=10))
            o = prim('kjegle', 'fjardusk%d' % s, brun, (0, 0, 0), (0.06, 0.04, 0.1), vertices=12, ss=1); o.data.transform(Matrix.Rotation(s * -0.4, 4, 'Y')); o.data.transform(Matrix.Translation((hx + s * 0.17, hy, hz + 0.26))); d.append(o)
        return d
    return _fugl(matkropp, brun, mat('ugle_nebb', '#f2a93b', 0.45), mat('ugle_bein', '#f2a93b', 0.5), vinge=mat('ugle_vinge', '#7a4e2c', 0.6), ekstra=ansikt, nebb=(0.07, 0.05, 0.05), hode_r=(0.27, 0.23, 0.25))

def papegoye_tobein(matkropp):
    gronn = mat('papegoye', '#3cc35a', 0.5); rod = mat('papegoye_rod', '#e8402e', 0.5); gul = mat('papegoye_gul', '#ffd23f', 0.5)
    def topp(hx, hy, hz): return [prim('kule', 'topp%d' % i, rod, (hx, hy + 0.04 * i, hz + 0.24 + 0.03 * i), (0.04, 0.06, 0.07), (-0.5, 0, 0), segments=12, ring_count=8) for i in range(3)]
    def kinn(hx, hy, hz): return [prim('kule', 'gulkinn%d' % s, gul, (hx + s * 0.16, hy - 0.12, hz - 0.03), (0.07, 0.05, 0.07), segments=14, ring_count=8) for s in (-1, 1)]
    return _fugl(matkropp, gronn, mat('papegoye_nebb', '#f7f2e6', 0.4), mat('papegoye_bein', '#7a7f8a', 0.5), vinge=rod, topp=topp, ekstra=kinn, nebb=(0.13, 0.08, 0.08))

DYR = {'katt': katt_tobein, 'hund': hund_tobein, 'kanin': kanin_tobein, 'rev': rev_tobein, 'panda': panda_tobein, 'mus': mus_tobein, 'bjørn': bjorn_tobein, 'løve': love_tobein, 'tiger': tiger_tobein, 'ape': ape_tobein, 'frosk': frosk_tobein, 'pingvin': pingvin_tobein, 'elefant': elefant_tobein, 'hest': hest_tobein, 'enhjørning': enhjorning_tobein, 'geit': geit_tobein, 'høne': hone_tobein, 'and': and_tobein, 'ugle': ugle_tobein, 'papegøye': papegoye_tobein}
MAAL = {d: (tuple(C_STD), tuple(A_STD), 0.0, (0, 0, 0)) for d in DYR}
