"""Matdyr på to bein (Even, 10.11.2026: «Kan vi ha gående ku på to bein»). Prøve: ku.
Samme modulære system som matdyr_modul.py: matkroppen står oppreist (modus 'staa', som pingvinen), og kuas hode, armer og bein festes på.
Armene heter vinge_v og vinge_h, og beina bein_vf og bein_hf, så spillets tobeinte gange (vagging, armsving) virker uten ny kode.
Bare et utseende: art, sjeldenhet, pris, inntekt og ID-er er uendret.
Kjør: DYR=ku|gris|hval|hai FIGURER=smultring,pizza,is,burger python3 matdyr_tobein.py <utmappe>   → pilot_<dyr>2_<mat>.glb
"""
import bpy, os, sys, math
from mathutils import Vector as V, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
import matdyr_modul as M
from matdyr_hybrider import mat, prim, kurve, slaa_sammen, pivot, forelder, oye, kinn, smil, rot_node

def ku_tobein(matkropp):
    hvit = mat('ku_hvit', '#fbf7f2', 0.55); mule = mat('mule', '#ffb3c1', 0.5); klov = mat('klov', '#4a3529', 0.5)
    horn = mat('horn', '#f6e3b4', 0.45); sort = mat('ku_sort', '#2b2630', 0.55)
    C, A = V((0, 0.02, 0.74)), V((0.38, 0.34, 0.44))
    k = M.MAT[matkropp](C, A, 'staa')
    t = k['topp']; hx, hy, hz = t.x, t.y - 0.06, t.z + 0.24
    # Hodet: samme kuhode som på firbeint ku, men rett over kroppen og med mulen fram
    hd = [prim('kule', 'hodekule', hvit, (hx, hy, hz), (0.27, 0.24, 0.25), segments=40, ring_count=24)]
    hd.append(prim('kule', 'hodeflekk', sort, (hx + 0.12, hy - 0.12, hz + 0.12), (0.12, 0.09, 0.1), segments=24, ring_count=14))
    hd.append(prim('kule', 'mule', mule, (hx, hy - 0.19, hz - 0.1), (0.22, 0.13, 0.14), segments=40, ring_count=20))
    for s in (-1, 1):
        hd.append(prim('kule', 'nese%d' % s, mat('nesebor', '#c25b78', 0.5), (hx + s * 0.075, hy - 0.315, hz - 0.08), (0.03, 0.018, 0.04), segments=12, ring_count=8))
        hd += oye('oye%d' % s, (hx + s * 0.11, hy - 0.19, hz + 0.08), 0.058)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.2, hy - 0.14, hz - 0.05), 0.045))
        hd.append(kurve('horn%d' % s, [(hx + s * 0.12, hy, hz + 0.17), (hx + s * 0.22, hy, hz + 0.25), (hx + s * 0.26, hy - 0.02, hz + 0.36)], 0.055, horn, avsmal=lambda u: 1 - 0.7 * u))
        hd.append(prim('kule', 'ore%d' % s, hvit, (hx + s * 0.27, hy + 0.04, hz + 0.06), (0.12, 0.05, 0.065), (0, s * -0.3, s * 0.35), segments=20, ring_count=12))
        hd.append(prim('kule', 'oreinn%d' % s, mule, (hx + s * 0.28, hy + 0.005, hz + 0.06), (0.08, 0.02, 0.04), (0, s * -0.3, s * 0.35), segments=16, ring_count=10))
    hd.append(smil('smil', (hx, hy - 0.315, hz - 0.16), 0.05))
    hd.append(prim('syl', 'hals', hvit, (hx, hy + 0.02, hz - 0.22), (0.14, 0.14, 0.1), vertices=24, ss=1))
    hd.append(prim('torus', 'bjellerem', mat('rem', '#d8402e', 0.5), (hx, hy + 0.02, hz - 0.25), (1, 1, 1), (0.25, 0, 0), major_radius=0.15, minor_radius=0.025, major_segments=32, minor_segments=8))
    hd.append(prim('kule', 'bjelle', mat('bjelle', '#ffd23f', 0.25, met=0.6), (hx, hy - 0.14, hz - 0.31), (0.06, 0.06, 0.07), segments=20, ring_count=12))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy, hz - 0.2))
    # Armer: korte, runde kuarmer med mørk klov som «hånd», festet på sidene av maten
    armer = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        if matkropp == 'smultring':
            # Even 12.11.2026: «du må fikse armene til donutkua». Armene kommer ut fra siden av ringen, er tykkere og bøyer seg fram, så de syns forfra.
            sx, sy, sz = 0.42, C.y - 0.1, C.z + 0.12
            a = [kurve(navn + '_arm', [(s * (sx - 0.06), sy, sz), (s * (sx + 0.1), sy - 0.06, sz - 0.08), (s * (sx + 0.13), sy - 0.16, sz - 0.26)], 0.085, hvit, avsmal=lambda u: 1 - 0.12 * u),
                 prim('kule', navn + '_klov', klov, (s * (sx + 0.13), sy - 0.18, sz - 0.33), (0.08, 0.08, 0.075), segments=18, ring_count=10)]
        else:
            sx = A.x + 0.02
            sy, sz = C.y - 0.02, C.z + 0.16
            a = [kurve(navn + '_arm', [(s * (sx - 0.04), sy, sz), (s * (sx + 0.06), sy - 0.04, sz - 0.16), (s * (sx + 0.04), sy - 0.1, sz - 0.32)], 0.07, hvit, avsmal=lambda u: 1 - 0.15 * u),
                 prim('kule', navn + '_klov', klov, (s * (sx + 0.04), sy - 0.11, sz - 0.38), (0.075, 0.07, 0.07), segments=18, ring_count=10)]
        if s < 0: a.append(prim('kule', navn + '_flekk', sort, (s * (sx + 0.06), sy - 0.02, sz - 0.12), (0.035, 0.05, 0.05), segments=12, ring_count=8))
        armer.append(pivot(slaa_sammen(navn, a), (s * (sx - 0.04), sy, sz)))
    # Bein: kraftige kubein med klover og en flekk, fra undersiden av maten til bakken
    under = max(0.16, k['under']); bein = []
    for i, s in enumerate((-1, 1)):
        bx = s * 0.17
        b = [prim('kule', 'bein%d' % i, hvit, (bx, 0.0, (under + 0.08) / 2 + 0.04), (0.1, 0.1, (under + 0.08) / 2 + 0.02), segments=24, ring_count=16),
             prim('kule', 'klov%d' % i, klov, (bx, -0.03, 0.065), (0.12, 0.15, 0.075), segments=22, ring_count=12),
             prim('kule', 'klovspalte%d' % i, sort, (bx, -0.17, 0.06), (0.012, 0.02, 0.05), segments=8, ring_count=6)]
        if i == 1: b.append(prim('kule', 'flekkbein%d' % i, sort, (bx + 0.05, -0.06, under * 0.6), (0.05, 0.035, 0.06), segments=12, ring_count=8))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (bx, 0, under + 0.06)))
    bk = k['bak']
    hale = [kurve('halestrå', [tuple(bk), tuple(bk + V((0, 0.12, -0.1))), tuple(bk + V((0.03, 0.16, -0.32)))], 0.022, hvit)]
    hale.append(prim('kule', 'haledusk', sort, tuple(bk + V((0.03, 0.17, -0.38))), (0.06, 0.06, 0.09), segments=16, ring_count=10))
    hale = pivot(slaa_sammen('hale', hale), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, armer + bein + [hale]

def gris_tobein(matkropp):
    """Gris på to bein (Even 10.11.2026: «Kun dyre med to bein»). Samme grishode, krøllhale og klover som den firbeinte grisen."""
    rosa = mat('gris_rosa', '#ffb3c6', 0.55); snute = mat('snute', '#ff8fae', 0.5); nese = mat('nesebor', '#c25b78', 0.5); klov = mat('grisklov', '#9c5466', 0.5)
    C, A = V((0, 0.02, 0.72)), V((0.4, 0.34, 0.42))
    k = M.MAT[matkropp](C, A, 'staa')
    t = k['topp']; hx, hy, hz = t.x, t.y - 0.06, t.z + 0.23
    hd = [prim('kule', 'hodekule', rosa, (hx, hy, hz), (0.28, 0.25, 0.25), segments=40, ring_count=24)]
    hd.append(prim('syl', 'snute', snute, (hx, hy - 0.24, hz - 0.07), (0.13, 0.13, 0.05), (math.pi / 2, 0, 0), vertices=32, ss=1))
    for s in (-1, 1):
        hd.append(prim('kule', 'nese%d' % s, nese, (hx + s * 0.05, hy - 0.29, hz - 0.07), (0.024, 0.012, 0.04), segments=12, ring_count=8))
        hd += oye('oye%d' % s, (hx + s * 0.12, hy - 0.19, hz + 0.08), 0.058)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.2, hy - 0.14, hz - 0.08), 0.05))
        for nm, m_, sc, dy in (('ore', rosa, (0.09, 0.035, 0.12), 0.03), ('oreinn', snute, (0.055, 0.015, 0.08), -0.005)):
            o = prim('kjegle', '%s%d' % (nm, s), m_, (0, 0, 0), sc, vertices=16, ss=1)
            o.data.transform(Matrix.Rotation(-0.55, 4, 'X')); o.data.transform(Matrix.Rotation(s * -0.4, 4, 'Y'))
            o.data.transform(Matrix.Translation((hx + s * 0.17, hy + dy, hz + 0.24 - (0.01 if nm == 'oreinn' else 0)))); hd.append(o)
    hd.append(smil('smil', (hx, hy - 0.24, hz - 0.17), 0.06))
    hd.append(prim('syl', 'hals', rosa, (hx, hy + 0.02, hz - 0.22), (0.15, 0.15, 0.1), vertices=24, ss=1))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy, hz - 0.2))
    armer = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        sx = A.x + 0.02 if matkropp != 'smultring' else 0.52
        sy, sz = C.y - 0.02, C.z + 0.14
        a = [kurve(navn + '_arm', [(s * (sx - 0.04), sy, sz), (s * (sx + 0.06), sy - 0.04, sz - 0.15), (s * (sx + 0.04), sy - 0.1, sz - 0.3)], 0.07, rosa, avsmal=lambda u: 1 - 0.15 * u),
             prim('kule', navn + '_klov', klov, (s * (sx + 0.04), sy - 0.11, sz - 0.36), (0.07, 0.065, 0.065), segments=18, ring_count=10)]
        armer.append(pivot(slaa_sammen(navn, a), (s * (sx - 0.04), sy, sz)))
    under = max(0.16, k['under']); bein = []
    for i, s in enumerate((-1, 1)):
        bx = s * 0.17
        b = [prim('kule', 'bein%d' % i, rosa, (bx, 0.0, (under + 0.08) / 2 + 0.04), (0.1, 0.1, (under + 0.08) / 2 + 0.02), segments=24, ring_count=16),
             prim('kule', 'klov%d' % i, klov, (bx, -0.03, 0.06), (0.11, 0.14, 0.07), segments=22, ring_count=12),
             prim('kule', 'klovspalte%d' % i, nese, (bx, -0.16, 0.055), (0.012, 0.02, 0.045), segments=8, ring_count=6)]
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (bx, 0, under + 0.06)))
    bk = k['bak']; pts = []
    for j in range(14):
        u = j / 13; a = u * 2.6 * math.pi
        pts.append(tuple(bk + V((0.06 * math.sin(a) * (0.4 + 0.6 * u), 0.04 + 0.12 * u + 0.05 * (1 - math.cos(a)) * 0.6, -0.1 + 0.07 * math.cos(a) * (0.4 + 0.6 * u) + 0.08 * u))))
    hale = pivot(slaa_sammen('hale', [kurve('krollhale', pts, 0.025, rosa, rund=6, opp=4, avsmal=lambda u: 1 - 0.5 * u)]), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, armer + bein + [hale]

def hval_tobein(matkropp):
    """Hval på to bein med flodhestbein (Evens valg B, 11.11.2026). Inspirert av urhvaler som gikk på land, og av flodhesten,
    som er hvalens nærmeste levende slektning: korte, tjukke bein med tær. Luffene blir armer, og blåsehullet spruter."""
    bla = mat('hval_bla', '#4f8fe0', 0.45); buk = mat('hval_buk', '#dfeeff', 0.5); vann = mat('vannsprut', '#bfe8ff', 0.15, emit=0.15)
    morkbla = mat('hval_mork', '#3f74bf', 0.5); linje = mat('linje', '#b9d2f0', 0.6)
    C, A = V((0, 0.02, 0.62)), V((0.42, 0.36, 0.4))
    k = M.MAT[matkropp](C, A, 'staa')
    t = k['topp']; hx, hy, hz = t.x, t.y - 0.04, t.z + 0.26
    # Stort, rundt hvalhode med lys strupe og bredt smil
    hd = [prim('kule', 'hvalhode', bla, (hx, hy, hz), (0.4, 0.34, 0.33), segments=48, ring_count=28)]
    hd.append(prim('kule', 'hvalbuk', buk, (hx, hy - 0.1, hz - 0.12), (0.33, 0.25, 0.2), segments=40, ring_count=22))
    for i in range(5):
        x = hx - 0.18 + i * 0.09
        hd.append(kurve('buklinje%d' % i, [(x, hy - 0.3, hz - 0.1), (x, hy - 0.26, hz - 0.22), (x, hy - 0.12, hz - 0.3)], 0.007, linje, rund=4, opp=4))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.17, hy - 0.27, hz + 0.08), 0.06)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.26, hy - 0.2, hz - 0.03), 0.045))
    hd.append(smil('smil', (hx, hy - 0.33, hz - 0.06), 0.12, tykk=0.014))
    for j, (dx, dz, r) in enumerate([(0, 0.0, 0.05), (0, 0.12, 0.045), (-0.06, 0.2, 0.04), (0.06, 0.2, 0.04), (-0.11, 0.24, 0.035), (0.11, 0.24, 0.035)]):
        hd.append(prim('kule', 'sprut%d' % j, vann, (hx + dx, hy + 0.06, hz + 0.34 + dz), (r,) * 3, segments=14, ring_count=8))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy, hz - 0.22))
    # Luffer som armer
    armer = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        sx = A.x + 0.02 if matkropp != 'smultring' else 0.52
        sy, sz = C.y - 0.02, C.z + 0.18
        w = prim('kule', navn + '_luffe', bla, (0, 0, 0), (0.08, 0.04, 0.22), (0.15, s * 0.5, 0), segments=24, ring_count=12)
        w.data.transform(Matrix.Translation((s * (sx + 0.08), sy - 0.03, sz - 0.14)))
        armer.append(pivot(slaa_sammen(navn, [w]), (s * sx, sy, sz)))
    # Flodhestbein: korte, tjukke og litt utover, med tre tær og lys såle
    under = max(0.14, k['under']); bein = []
    for i, s in enumerate((-1, 1)):
        bx = s * 0.19; h = under + 0.06
        b = [prim('kule', 'legg%d' % i, morkbla, (bx, 0.0, h / 2 + 0.02), (0.13, 0.13, h / 2 + 0.03), segments=28, ring_count=16),
             prim('kule', 'fot%d' % i, morkbla, (bx, -0.04, 0.06), (0.15, 0.16, 0.07), segments=26, ring_count=12),
             prim('kule', 'saale%d' % i, buk, (bx, -0.04, 0.015), (0.12, 0.13, 0.02), segments=20, ring_count=8)]
        for j in (-1, 0, 1):
            b.append(prim('kule', 'taa%d%d' % (i, j), buk, (bx + j * 0.065, -0.19, 0.045), (0.04, 0.035, 0.035), segments=12, ring_count=8))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (bx, 0, under + 0.06)))
    # Halefinne bak, nede ved bakken
    bk = k['bak']; rot = V((0, bk.y, max(0.25, C.z - 0.25)))
    hv = [kurve('halerot', [tuple(rot), tuple(rot + V((0, 0.16, -0.06))), tuple(rot + V((0, 0.3, -0.04)))], 0.08, bla, rund=10, opp=4, avsmal=lambda u: 1 - 0.5 * u)]
    for s in (-1, 1):
        fl = prim('kule', 'flak%d' % s, bla, (0, 0, 0), (0.18, 0.08, 0.03), (0.0, s * 0.25, s * 0.35), segments=24, ring_count=12)
        fl.data.transform(Matrix.Translation(rot + V((s * 0.14, 0.34, 0.0)))); hv.append(fl)
    hale = pivot(slaa_sammen('hale', hv), tuple(rot))
    return slaa_sammen('kropp', k['deler']), hode, armer + bein + [hale]

def hai_tobein(matkropp):
    """Hai på to finnebein (Evens valg A, 11.11.2026). Inspirert av epaulett-haien, som kan «gå» på finnene sine.
    Bukfinnene blir korte bein med brede, flate finneføtter, brystfinnene blir armer. Ingen sko og ingen tre bein (ikke en kopi av meme-haien)."""
    gra = mat('hai_gra', '#7d9ec4', 0.45); buk = mat('hai_buk', '#eef3f9', 0.5); mork = mat('hai_mork', '#5f82ad', 0.5)
    tann = mat('tann', '#ffffff', 0.3); munn = mat('munn', '#3a2430', 0.6); gjelle = mat('gjelle', '#5a7aa3', 0.55)
    C, A = V((0, 0.02, 0.66)), V((0.4, 0.34, 0.42))
    k = M.MAT[matkropp](C, A, 'staa')
    t = k['topp']; hx, hy, hz = t.x, t.y - 0.05, t.z + 0.27
    # Hodet: avrundet haihode med spiss snute, lys strupe og et vennlig smil med små tenner
    hd = [prim('kule', 'haihode', gra, (hx, hy, hz), (0.33, 0.36, 0.3), segments=48, ring_count=28)]
    hd.append(prim('kule', 'snute', gra, (hx, hy - 0.27, hz + 0.02), (0.2, 0.16, 0.15), segments=32, ring_count=18))
    hd.append(prim('kule', 'strupe', buk, (hx, hy - 0.18, hz - 0.12), (0.27, 0.2, 0.15), segments=40, ring_count=20))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.16, hy - 0.27, hz + 0.09), 0.058)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.25, hy - 0.2, hz - 0.04), 0.04))
        for g in range(3):   # gjeller
            hd.append(kurve('gjelle%d%d' % (s, g), [(hx + s * 0.29, hy - 0.05 + g * 0.06, hz + 0.02), (hx + s * 0.31, hy - 0.05 + g * 0.06, hz - 0.06), (hx + s * 0.29, hy - 0.05 + g * 0.06, hz - 0.13)], 0.009, gjelle, rund=3, opp=3))
    hd.append(kurve('smil', [(hx - 0.13, hy - 0.33, hz - 0.08), (hx, hy - 0.39, hz - 0.13), (hx + 0.13, hy - 0.33, hz - 0.08)], 0.016, munn, rund=4, opp=6))
    for j in range(-2, 3):   # små, runde tenner som ikke er skumle
        hd.append(prim('kjegle', 'tann%d' % j, tann, (hx + j * 0.045, hy - 0.37 + abs(j) * 0.012, hz - 0.115 + abs(j) * 0.012), (0.018, 0.012, 0.025), (math.pi, 0, 0), vertices=10, ss=1))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy, hz - 0.2))
    # Brystfinner som armer
    armer = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        sx = A.x + 0.02 if matkropp != 'smultring' else 0.52
        sy, sz = C.y - 0.02, C.z + 0.16
        w = prim('kule', navn + '_finne', gra, (0, 0, 0), (0.07, 0.04, 0.22), (0.25, s * 0.55, 0), segments=24, ring_count=12)
        w.data.transform(Matrix.Translation((s * (sx + 0.09), sy - 0.04, sz - 0.14)))
        armer.append(pivot(slaa_sammen(navn, [w]), (s * sx, sy, sz)))
    # Finnebein: korte bein med brede, flate finneføtter som peker fram og litt ut
    under = max(0.15, k['under']); bein = []
    for i, s in enumerate((-1, 1)):
        bx = s * 0.17; h = under + 0.06
        b = [prim('kule', 'legg%d' % i, gra, (bx, 0.0, h / 2 + 0.04), (0.09, 0.09, h / 2 + 0.02), segments=24, ring_count=14)]
        f = prim('kule', 'finnefot%d' % i, mork, (0, 0, 0), (0.12, 0.22, 0.035), segments=28, ring_count=12)
        f.data.transform(Matrix.Rotation(s * -0.25, 4, 'Z')); f.data.transform(Matrix.Translation((bx + s * 0.03, -0.08, 0.04))); b.append(f)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (bx, 0, under + 0.06)))
    # Ingen hale (Even 11.11.2026: «Du må fjerne halen»). Spillet tåler at noden 'hale' mangler.
    # Ryggfinne (Even 11.11.2026: «Det må være en haifine på ryggen»): stor, spiss og bøyd bakover, midt på ryggen
    bk2 = k['bak']; fz = max(C.z + 0.08, bk2.z + 0.08); fy = max(bk2.y, C.y + A.y * 0.85)   # donuten har halefestet nede på ringen, så finnen plasseres etter kroppsdybden
    rf = prim('kjegle', 'ryggfinne', mork, (0, 0, 0), (0.06, 0.24, 0.46), vertices=24, ss=1)
    rf.data.transform(Matrix.Rotation(-0.32, 4, 'X')); rf.data.transform(Matrix.Translation((0, fy + 0.02, fz + 0.32)))
    return slaa_sammen('kropp', k['deler'] + [rf]), hode, armer + bein

DYR = {'ku': ku_tobein, 'gris': gris_tobein, 'hval': hval_tobein, 'hai': hai_tobein}
NAVN = {'ku': 'ku', 'gris': 'gris', 'hval': 'hval', 'hai': 'hai'}

def lag(matkropp, dyr='ku'):
    H.nullstill(); H.MATS.clear(); M._VAFFEL.clear(); H.rnd.seed(7)
    kropp, hode, rest = DYR[dyr](matkropp)
    rot = rot_node(M.MATNAVN[matkropp] + NAVN[dyr]); forelder([kropp, hode] + rest, rot)
    # Budsjett for full versjon: ≤ 25 000 trekanter. Delen med flest trekanter forenkles (ofte maten). Kontroller utseendet for hver ny figur.
    def tell(o): o.data.calc_loop_triangles(); return len(o.data.loop_triangles)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']; tot = sum(tell(o) for o in meshes)
    if tot > 24500:
        st = max(meshes, key=tell); over = tot - 24000
        d = st.modifiers.new('budsjett', 'DECIMATE'); d.ratio = max(0.3, 1 - over / tell(st)); H.bruk_mod(st)
    H.eksporter(rot, 'pilot_%s2_%s' % (dyr, matkropp))

if __name__ == '__main__':
    dyr = os.environ.get('DYR', 'ku')
    for m in os.environ.get('FIGURER', 'smultring,pizza,is,burger').split(','): lag(m, dyr)
