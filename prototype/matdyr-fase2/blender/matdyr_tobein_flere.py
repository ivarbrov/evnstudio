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

DYR = {'katt': katt_tobein, 'hund': hund_tobein, 'kanin': kanin_tobein, 'rev': rev_tobein, 'panda': panda_tobein}
MAAL = {d: (tuple(C_STD), tuple(A_STD), 0.0, (0, 0, 0)) for d in DYR}
