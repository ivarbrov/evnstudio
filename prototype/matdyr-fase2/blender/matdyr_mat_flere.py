"""De 15 matkroppene som manglet (Even 17.11.2026: «du må lage ferdig dyrene»): pannekake, pølse, ost, kjeks, vaffel, popcorn, sushi,
gulrot, brokkoli, agurk, melon, melke, kakao, brus og juice. Samme regel som matdyr_modul.py: maten fyller kroppen (midtpunkt C, halvakser A)
og returnerer festepunktene fra M.ankre. Bare modus 'staa' (dyr på to bein) er laget; de andre modusene får samme form.
"""
import math, random
from mathutils import Vector as V, Matrix
import matdyr_modul as M
from matdyr_hybrider import mat, prim, kurve

def _ut(deler, C, A, modus): return {'deler': deler, **M.ankre(C, A, modus)}

def mat_pannekake(C, A, modus):
    deig = mat('pannekake', '#f2c27a', 0.6); kant = mat('pannekake_kant', '#c98a45', 0.6); sirup = mat('sirup', '#b8621c', 0.2); smor = mat('smor', '#fff1a8', 0.4)
    n = 5; h = 2 * A.z / n; d = []
    for i in range(n):
        z = C.z - A.z + h * (i + 0.5); r = 1 - 0.08 * abs(i - 2)
        d.append(prim('syl', 'pk%d' % i, deig, (C.x, C.y, z), (A.x * r, A.y * r, h * 0.48), vertices=40, ss=1))
        d.append(prim('torus', 'pkkant%d' % i, kant, (C.x, C.y, z), (A.x * r, A.y * r, 1), major_radius=1.0, minor_radius=0.03, major_segments=40, minor_segments=8))
    d.append(prim('kule', 'sirup', sirup, (C.x, C.y, C.z + A.z - 0.01), (A.x * 0.85, A.y * 0.85, 0.04), segments=32, ring_count=12))
    for i, a in enumerate((0.3, 1.9, 3.6, 5.0)):
        d.append(prim('kule', 'drypp%d' % i, sirup, (C.x + math.cos(a) * A.x * 0.93, C.y + math.sin(a) * A.y * 0.93, C.z + A.z - 0.12), (0.035, 0.035, 0.1), segments=12, ring_count=8))
    d.append(prim('kube', 'smor', smor, (C.x, C.y, C.z + A.z + 0.04), (0.07, 0.07, 0.04), ss=1))
    return _ut(d, C, A, modus)

def mat_polse(C, A, modus):
    brod = mat('polsebrod', '#e8b06a', 0.6); polse = mat('polse', '#c4523a', 0.45); ketchup = mat('ketchup', '#e0301e', 0.3); sennep = mat('sennep', '#ffd23f', 0.3)
    d = [M.ellipsoide('brod', brod, C + V((0, 0.04, 0)), V((A.x, A.y * 0.85, A.z)))]
    d.append(prim('kule', 'polse', polse, (C.x, C.y - A.y * 0.6, C.z), (A.x * 0.45, A.y * 0.45, A.z * 1.08), segments=32, ring_count=16))
    for nm, m_, dx in (('ketchup', ketchup, -0.05), ('sennep', sennep, 0.05)):
        pts = [(C.x + dx + 0.06 * math.sin(i * 1.3), C.y - A.y * 1.02, C.z - A.z * 0.8 + i * A.z * 0.2) for i in range(9)]
        d.append(kurve(nm, pts, 0.022, m_))
    return _ut(d, C, A, modus)

def mat_ost(C, A, modus):
    ost = mat('ost_kloss', '#ffd23f', 0.45); hull = mat('ost_hull', '#e0a91c', 0.5)
    d = [prim('kube', 'ostekloss', ost, tuple(C), tuple(A * 0.95), ss=0)]
    rr = random.Random(3)
    for i in range(9):
        side = rr.choice([(0, -1), (1, 0), (-1, 0)]); u, w = rr.uniform(-0.7, 0.7), rr.uniform(-0.7, 0.7)
        if side == (0, -1): p = (C.x + u * A.x * 0.8, C.y - A.y * 0.97, C.z + w * A.z * 0.8)
        else: p = (C.x + side[0] * A.x * 0.95, C.y + u * A.y * 0.8, C.z + w * A.z * 0.8)
        r = rr.uniform(0.04, 0.08); d.append(prim('kule', 'hull%d' % i, hull, p, (r, r * 0.35, r) if side == (0, -1) else (r * 0.35, r, r), segments=14, ring_count=8))   # flate hull i flaten
    return _ut(d, C, A, modus)

def mat_kjeks(C, A, modus):
    deig = mat('kjeks', '#d9a05b', 0.7); sjoko = mat('kjeks_sjoko', '#5a3220', 0.5)
    d = [M.ellipsoide('kjekskropp', deig, C, V((A.x, A.y * 0.75, A.z)))]
    rr = random.Random(5)
    for i in range(12):
        a, rad = rr.uniform(0, 6.28), math.sqrt(rr.uniform(0.05, 0.8))
        p = V((C.x + math.cos(a) * rad * A.x * 0.85, C.y - A.y * 0.7 * math.sqrt(max(0.05, 1 - rad * rad)), C.z + math.sin(a) * rad * A.z * 0.85))
        d.append(prim('kule', 'chip%d' % i, sjoko, tuple(p), (0.045, 0.03, 0.04), segments=10, ring_count=6))
    return _ut(d, C, A, modus)

def mat_vaffel(C, A, modus):
    vm = M.vaffel_mat(); kant = mat('vaffel_kant', '#c98a45', 0.6); jord = mat('vaffel_jordbaer', '#e8364b', 0.4); krem = mat('vaffel_krem', '#fffaf0', 0.5)
    d = [M.ellipsoide('vaffel', vm, C, V((A.x, A.y * 0.7, A.z)))]
    d.append(prim('kule', 'krem', krem, (C.x, C.y - A.y * 0.6, C.z + A.z * 0.35), (0.12, 0.08, 0.09), segments=20, ring_count=12))
    d.append(prim('kule', 'jordbaer', jord, (C.x, C.y - A.y * 0.72, C.z + A.z * 0.42), (0.06, 0.05, 0.07), segments=16, ring_count=10))
    return _ut(d, C, A, modus)

def mat_popcorn(C, A, modus):
    rod = mat('popcorn_rod', '#e8402e', 0.5); hvit = mat('popcorn_hvit', '#fbf7f0', 0.5); korn = mat('popcorn', '#fff3c4', 0.7); smor = mat('popcorn_smor', '#ffd76a', 0.6)
    d = []
    n = 12
    for i in range(n):
        a = i * 2 * math.pi / n; m_ = rod if i % 2 == 0 else hvit
        o = prim('kube', 'stripe%d' % i, m_, (0, 0, 0), (A.x * 0.27, 0.02, A.z * 0.95), ss=0)
        o.data.transform(Matrix.Rotation(-0.08, 4, 'X')); o.data.transform(Matrix.Rotation(a + math.pi / 2, 4, 'Z'))
        o.data.transform(Matrix.Translation((C.x + math.cos(a) * A.x * 0.9, C.y + math.sin(a) * A.y * 0.9, C.z - 0.04))); d.append(o)
    d.append(prim('syl', 'beger', hvit, (C.x, C.y, C.z - 0.04), (A.x * 0.88, A.y * 0.88, A.z * 0.95), vertices=24, ss=0))
    rr = random.Random(9)
    for i in range(18):
        a, rad = rr.uniform(0, 6.28), rr.uniform(0, 0.85)
        d.append(prim('kule', 'korn%d' % i, korn if i % 4 else smor, (C.x + math.cos(a) * rad * A.x, C.y + math.sin(a) * rad * A.y, C.z + A.z * 0.85 + rr.uniform(0, 0.12)), (0.07, 0.07, 0.06), segments=10, ring_count=6))
    return _ut(d, C, A, modus)

def mat_sushi(C, A, modus):
    ris = mat('ris', '#fbfaf6', 0.7); nori = mat('nori', '#1f3a2a', 0.6); laks = mat('laks', '#ff8a5c', 0.4); laksstripe = mat('laks_stripe', '#ffd2b8', 0.5)
    d = [prim('syl', 'risrull', ris, tuple(C), (A.x * 0.95, A.y * 0.95, A.z * 0.9), vertices=36, ss=0),
         prim('syl', 'noriband', nori, (C.x, C.y, C.z - A.z * 0.2), (A.x * 0.99, A.y * 0.99, A.z * 0.35), vertices=36, ss=0)]
    d.append(prim('kule', 'laks', laks, (C.x, C.y, C.z + A.z * 0.88), (A.x * 0.95, A.y * 0.95, 0.07), segments=32, ring_count=12))
    for i in range(3): d.append(prim('kube', 'laksstripe%d' % i, laksstripe, (C.x - 0.15 + i * 0.15, C.y, C.z + A.z * 0.93), (0.012, A.y * 0.8, 0.012)))
    return _ut(d, C, A, modus)

def mat_gulrot(C, A, modus):
    oransje = mat('gulrot', '#ff8a1c', 0.55); strek = mat('gulrot_strek', '#e06a10', 0.6); blad = mat('gulrot_blad', '#4caf50', 0.5)
    g = prim('kjegle', 'gulrot', oransje, (0, 0, 0), (A.x, A.y, A.z * 1.1), vertices=32, ss=2); g.data.transform(Matrix.Rotation(math.pi, 4, 'X')); g.data.transform(Matrix.Translation(C))
    d = [g]
    for i, z in enumerate((-0.3, 0.0, 0.3)):
        d.append(prim('torus', 'strek%d' % i, strek, (C.x, C.y, C.z + z * A.z), (1, 1, 1), major_radius=A.x * (0.5 - z * 0.45), minor_radius=0.012, major_segments=28, minor_segments=6))
    for i, a in enumerate((-0.6, 0.0, 0.6)):
        d.append(kurve('blad%d' % i, [(C.x + A.x * 0.7 * math.cos(a + 1.5), C.y + 0.1, C.z + A.z * 0.8), (C.x + A.x * 1.0 * math.cos(a + 1.5), C.y + 0.2, C.z + A.z * 1.2)], 0.03, blad))
    return _ut(d, C, A, modus)

def mat_brokkoli(C, A, modus):
    gronn = mat('brokkoli', '#3f9b3a', 0.7); lys = mat('brokkoli_stilk', '#9bd16a', 0.6)
    d = [prim('syl', 'stilk', lys, (C.x, C.y, C.z - A.z * 0.4), (A.x * 0.5, A.y * 0.5, A.z * 0.6), vertices=24, ss=1)]
    rr = random.Random(11)
    for i in range(14):
        a, rad = rr.uniform(0, 6.28), rr.uniform(0, 0.75)
        d.append(prim('kule', 'tue%d' % i, gronn, (C.x + math.cos(a) * rad * A.x * 0.8, C.y + math.sin(a) * rad * A.y * 0.8, C.z + A.z * (0.2 + 0.45 * (1 - rad))), (A.x * 0.42, A.y * 0.42, A.z * 0.36), segments=14, ring_count=8))
    return _ut(d, C, A, modus)

def mat_agurk(C, A, modus):
    gronn = mat('agurk', '#3f8f3a', 0.5); prikk = mat('agurk_prikk', '#a8d68a', 0.6)
    d = [M.ellipsoide('agurk', gronn, C, V((A.x * 0.85, A.y * 0.85, A.z * 1.05)))]
    rr = random.Random(13)
    for i in range(16):
        a, z = rr.uniform(-2.5, 2.5) - math.pi / 2, rr.uniform(-0.8, 0.8)
        f = math.sqrt(max(0, 1 - z * z))
        d.append(prim('kule', 'prikk%d' % i, prikk, (C.x + math.cos(a) * A.x * 0.86 * f, C.y + math.sin(a) * A.y * 0.86 * f, C.z + z * A.z * 1.05), (0.02, 0.02, 0.02), segments=8, ring_count=6))
    return _ut(d, C, A, modus)

def mat_melon(C, A, modus):
    gronn = mat('melon', '#3fa34d', 0.5); mork = mat('melon_stripe', '#1f6b2a', 0.5); rod = mat('melon_rod', '#ff4d5e', 0.5); kjerne = mat('melon_kjerne', '#2b2630', 0.4)
    d = [M.ellipsoide('melon', gronn, C, A)]
    for i in range(8):
        a = i * math.pi / 4
        d.append(prim('kule', 'stripe%d' % i, mork, (C.x + math.cos(a) * A.x * 0.9, C.y + math.sin(a) * A.y * 0.9, C.z), (0.04, 0.04, A.z * 0.97), (0, 0, a), segments=12, ring_count=16))
    d.append(prim('kule', 'skive', rod, (C.x, C.y - A.y * 0.9, C.z), (A.x * 0.7, 0.04, A.z * 0.7), segments=32, ring_count=16))
    for i, (dx, dz) in enumerate(((-0.1, 0.1), (0.1, 0.12), (0, -0.05), (-0.14, -0.12), (0.13, -0.1))):
        d.append(prim('kule', 'kjerne%d' % i, kjerne, (C.x + dx, C.y - A.y * 0.93, C.z + dz), (0.015, 0.01, 0.025), segments=8, ring_count=6))
    return _ut(d, C, A, modus)

def _kartong(C, A, farge, panel, navn):
    d = [prim('kube', navn, farge, tuple(C), (A.x * 0.85, A.y * 0.8, A.z * 0.92), ss=0)]
    d.append(prim('kube', navn + '_panel', panel, (C.x, C.y - A.y * 0.8 - 0.006, C.z - A.z * 0.1), (A.x * 0.7, 0.012, A.z * 0.5)))
    return d

def mat_melke(C, A, modus):
    hvit = mat('melk_kartong', '#fbfaf6', 0.5); bla = mat('melk_bla', '#5ab4ff', 0.45); svart = mat('melk_flekk', '#2b2630', 0.5)
    d = _kartong(C, A, hvit, bla, 'kartong')
    tak = prim('kjegle', 'kartongtak', hvit, (0, 0, 0), (A.x * 0.85 * 1.41, A.y * 0.8 * 1.41, 0.12), vertices=4, ss=0)
    tak.data.transform(Matrix.Rotation(math.pi / 4, 4, 'Z')); tak.data.transform(Matrix.Translation((C.x, C.y, C.z + A.z * 0.92 + 0.06))); d.append(tak)
    for i, (dx, dz) in enumerate(((-0.2, 0.25), (0.22, -0.3))):
        d.append(prim('kule', 'flekk%d' % i, svart, (C.x + dx, C.y - A.y * 0.81, C.z + dz), (0.06, 0.01, 0.05), segments=12, ring_count=6))
    return _ut(d, C, A, modus)

def mat_kakao(C, A, modus):
    kopp = mat('kopp', '#5ab4ff', 0.4); kakao = mat('kakao', '#7a4a2a', 0.3); marsh = mat('marshmallow', '#fff4f8', 0.6)
    d = [prim('syl', 'kopp', kopp, tuple(C), (A.x * 0.9, A.y * 0.9, A.z * 0.95), vertices=36, ss=0),
         prim('syl', 'kakao', kakao, (C.x, C.y, C.z + A.z * 0.9), (A.x * 0.82, A.y * 0.82, 0.03), vertices=36, ss=0)]
    for i, (dx, dy) in enumerate(((-0.1, 0), (0.08, 0.05), (0.02, -0.1))): d.append(prim('kube', 'marsh%d' % i, marsh, (C.x + dx, C.y + dy, C.z + A.z * 0.98), (0.05, 0.05, 0.04), ss=1))
    return _ut(d, C, A, modus)

def mat_brus(C, A, modus):
    rod = mat('brus', '#e8402e', 0.3, met=0.3); hvit = mat('brus_hvit', '#fbfaf6', 0.4); solv = mat('brus_lokk', '#c9ccd2', 0.3, met=0.6)
    d = [prim('syl', 'boks', rod, tuple(C), (A.x * 0.82, A.y * 0.82, A.z * 0.95), vertices=36, ss=0),
         prim('syl', 'band', hvit, (C.x, C.y, C.z), (A.x * 0.84, A.y * 0.84, 0.06), vertices=36, ss=0),
         prim('syl', 'lokk', solv, (C.x, C.y, C.z + A.z * 0.95), (A.x * 0.7, A.y * 0.7, 0.03), vertices=36, ss=0)]
    return _ut(d, C, A, modus)

def mat_juice(C, A, modus):
    oransje = mat('juice', '#ff9a1c', 0.5); gul = mat('juice_panel', '#ffe14d', 0.45); hvit = mat('juice_rør', '#fbfaf6', 0.4)
    d = _kartong(C, A, oransje, gul, 'juicekartong')
    d.append(prim('kule', 'appelsin', mat('appelsin', '#ff8a1c', 0.5), (C.x, C.y - A.y * 0.82, C.z - A.z * 0.1), (0.1, 0.02, 0.1), segments=20, ring_count=10))
    d.append(kurve('sugeror', [(C.x + 0.12, C.y, C.z + A.z * 0.9), (C.x + 0.12, C.y, C.z + A.z * 1.25), (C.x + 0.2, C.y, C.z + A.z * 1.35)], 0.02, hvit))
    return _ut(d, C, A, modus)

MAT = {'pannekake': mat_pannekake, 'polse': mat_polse, 'ost': mat_ost, 'kjeks': mat_kjeks, 'vaffel': mat_vaffel, 'popcorn': mat_popcorn, 'sushi': mat_sushi,
       'gulrot': mat_gulrot, 'brokkoli': mat_brokkoli, 'agurk': mat_agurk, 'melon': mat_melon, 'melke': mat_melke, 'kakao': mat_kakao, 'brus': mat_brus, 'juice': mat_juice}
