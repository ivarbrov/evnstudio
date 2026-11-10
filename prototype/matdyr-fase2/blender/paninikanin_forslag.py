"""Paninikanin: tre designforslag for Even (10.11.2026). Ekte hybrider mellom kanin og panini, ikke en kanin med et smørbrød.
Ingen ID- eller kategoribytte er gjort: forslagene er bare modeller til sammenligning. Even velger utseende og om den blir Food God eller Secret.

A  Paninikropp   – kroppen ER en grillet panini (to brødskiver med ost som renner ut), kaninhode, ører av brødskorpe
B  Brødkanin     – hele kaninen er bakt av grillet ciabatta, og fyllet går som et belte rundt magen
C  Halvpanini    – kaninen står oppreist; kroppen er en halv panini skåret på skrå, med lagene synlige foran

Kjør: python3 paninikanin_forslag.py <utmappe>   (FIGURER=a,b,c)
Samme nodenavn som de andre figurene (kropp, hode, hale, bein_*), figuren vender mot -Y.
"""
import bpy, math, os, sys, random
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
from matdyr_hybrider import mat, prim, kurve, slaa_sammen, pivot, forelder, oye, kinn, smil, glatt, subsurf, rot_node, MATS

rnd = random.Random(11)

def farger():
    return dict(
        brod=mat('brod', '#e2a95a', 0.7), brod_lys=mat('brod_lys', '#f6dca6', 0.8), skorpe=mat('skorpe', '#b8742f', 0.6),
        grill=mat('grillstripe', '#5a2f14', 0.55), ost=mat('ost', '#ffcf3d', 0.35), tomat=mat('tomat', '#e8402f', 0.4),
        basilikum=mat('basilikum', '#3f9a3a', 0.5), skinke=mat('skinke', '#f2a0a8', 0.55), mozza=mat('mozzarella', '#fbf8f0', 0.45),
        pels=mat('kanin_pels', '#f4ead9', 0.7), pels_inn=mat('oreinn', '#ffc2cf', 0.6), snute=mat('snute', '#ff8fa6', 0.45),
        tann=mat('tann', '#ffffff', 0.3), pute=mat('pute', '#ffb3c1', 0.6))

def grillstriper(navn, C, A, n, m, vinkel=0.55, lengde=0.9, tykk=0.016, z_min=0.55):
    """Mørke grillstriper som følger toppen av en ellipsoide (senter C, radier A)."""
    cx, cy, cz = C; a, b, c = A; deler = []
    for i in range(n):
        off = (i - (n - 1) / 2) * (2 * a / (n + 0.6))
        d = Vector((math.sin(vinkel), math.cos(vinkel), 0))
        pts = []
        for k in range(14):
            t = (k / 13 - 0.5) * 2 * b * lengde
            x, y = cx + off * math.cos(vinkel) + d.x * t, cy - off * math.sin(vinkel) + d.y * t
            u = 1 - ((x - cx) / a) ** 2 - ((y - cy) / b) ** 2
            if u < z_min ** 2: continue
            pts.append((x, y, cz + c * math.sqrt(u) + tykk * 0.4))
        if len(pts) >= 3: deler.append(kurve('%s%d' % (navn, i), pts, tykk, m, rund=2, opp=4))
    return deler

def kaninhode(navn, P, s, hud, ore_ut, ore_inn, ore_lengde=0.62, ore_vinkel=0.22, bred_mule=None):
    """Kaninhode i EVN-stil. P = hodets senter, s = skala. Ørene får egne materialer (pels eller brød)."""
    hx, hy, hz = P; d = []
    d.append(prim('kule', navn + '_kule', hud, (hx, hy, hz), (0.27 * s, 0.25 * s, 0.25 * s), segments=40, ring_count=24))
    mule = bred_mule or hud
    for k in (-1, 1):
        d.append(prim('kule', navn + '_kjake%d' % k, mule, (hx + k * 0.075 * s, hy - 0.2 * s, hz - 0.07 * s), (0.095 * s, 0.08 * s, 0.075 * s), segments=24, ring_count=14))
        d += oye(navn + '_oye%d' % k, (hx + k * 0.11 * s, hy - 0.2 * s, hz + 0.06 * s), 0.06 * s)
        d.append(kinn(navn + '_kinn%d' % k, (hx + k * 0.19 * s, hy - 0.17 * s, hz - 0.04 * s), 0.045 * s))
        # Ører: lange, litt utoverbøyde, med lys innside
        bx, bz = hx + k * 0.1 * s, hz + 0.17 * s
        ut = prim('kule', navn + '_ore%d' % k, ore_ut, (0, 0, ore_lengde * 0.5 * s), (0.085 * s, 0.045 * s, ore_lengde * 0.5 * s), segments=24, ring_count=16)
        inn = prim('kule', navn + '_oreinn%d' % k, ore_inn, (0, -0.03 * s, ore_lengde * 0.5 * s), (0.055 * s, 0.02 * s, ore_lengde * 0.4 * s), segments=20, ring_count=12)
        for o in (ut, inn):
            o.data.transform(Matrix.Rotation(k * ore_vinkel, 4, 'Y')); o.data.transform(Matrix.Rotation(-0.12, 4, 'X')); o.data.transform(Matrix.Translation((bx, hy + 0.02 * s, bz)))
        d += [ut, inn]
    d.append(prim('kule', navn + '_nese', mat('nesebor', '#ff6f91', 0.4), (hx, hy - 0.285 * s, hz - 0.02 * s), (0.04 * s, 0.025 * s, 0.03 * s), segments=16, ring_count=10))
    d.append(smil(navn + '_smil', (hx, hy - 0.27 * s, hz - 0.1 * s), 0.035 * s, tykk=0.009 * s))
    for k in (-1, 1):   # to fortenner
        d.append(prim('kube', navn + '_tann%d' % k, mat('tann', '#ffffff', 0.3), (hx + k * 0.018 * s, hy - 0.265 * s, hz - 0.135 * s), (0.016 * s, 0.008 * s, 0.026 * s)))
        for j in (-1, 1):   # værhår
            d.append(kurve(navn + '_hår%d%d' % (k, j), [(hx + k * 0.12 * s, hy - 0.25 * s, hz - 0.06 * s + j * 0.02 * s), (hx + k * 0.22 * s, hy - 0.27 * s, hz - 0.05 * s + j * 0.04 * s), (hx + k * 0.3 * s, hy - 0.26 * s, hz - 0.03 * s + j * 0.06 * s)], 0.004 * s, mat('munn', '#3a1f24', 0.6), rund=2, opp=3))
    return d

def drypp(navn, m, punkter, r=0.035):
    """Ost som renner: små dråper som henger ned fra kanten."""
    ut = []
    for i, (x, y, z, l) in enumerate(punkter):
        ut.append(kurve('%s%d' % (navn, i), [(x, y, z), (x * 1.02, y, z - l * 0.5), (x * 1.03, y, z - l)], r, m, rund=4, opp=4, avsmal=lambda t: 1 - 0.25 * t))
        ut.append(prim('kule', '%sd%d' % (navn, i), m, (x * 1.03, y, z - l), (r * 1.15, r * 1.15, r * 1.3), segments=12, ring_count=8))
    return ut

def bein_firbeint(F, H_kropp, pels, pute, bak_lang=True, mat_bein=None):
    mb = mat_bein or pels; bein = []
    plasser = [(-0.2, -0.36, False), (0.2, -0.36, False), (-0.24, 0.34, True), (0.24, 0.34, True)]
    for i, (bx, by, bak) in enumerate(plasser):
        b = [prim('syl', 'bein%d' % i, mb, (bx, by, 0.2), (0.08, 0.08, 0.19), vertices=18, ss=1)]
        fl = 0.17 if (bak and bak_lang) else 0.1
        b.append(prim('kule', 'pote%d' % i, mb, (bx, by - fl * 0.45, 0.055), (0.095, fl, 0.06), segments=20, ring_count=10))
        b.append(prim('kule', 'pute%d' % i, pute, (bx, by - fl * 0.45, 0.02), (0.06, fl * 0.7, 0.02), segments=16, ring_count=8))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], b), (bx, by, H_kropp)))
    return bein

# ---------------------------------------------------------------- A Paninikropp
def paninikanin_a():
    H.nullstill(); MATS.clear(); F = farger()
    C = (0, 0.04, 0.55)
    under = prim('kule', 'brod_under', F['brod'], (C[0], C[1], C[2] - 0.08), (0.4, 0.58, 0.13), segments=48, ring_count=24)
    over = prim('kule', 'brod_over', F['brod'], (C[0], C[1], C[2] + 0.1), (0.42, 0.6, 0.15), segments=48, ring_count=24)
    # Lys, luftig brød i snittet (kanten mellom skivene)
    snitt = [prim('kule', 'snitt_o', F['brod_lys'], (C[0], C[1], C[2] + 0.025), (0.43, 0.61, 0.045), segments=48, ring_count=16),
             prim('kule', 'snitt_u', F['brod_lys'], (C[0], C[1], C[2] - 0.035), (0.41, 0.59, 0.04), segments=48, ring_count=16)]
    ost = prim('kule', 'ostelag', F['ost'], (C[0], C[1], C[2] - 0.005), (0.445, 0.625, 0.035), segments=48, ring_count=12)
    fyll = [ost]
    for i, a in enumerate([0.3, 1.25, 2.1, 3.4, 4.4, 5.3]):   # tomat og basilikum som titter ut
        x, y = math.sin(a) * 0.43, math.cos(a) * 0.6
        fyll.append(prim('syl', 'tomat%d' % i, F['tomat'], (x * 1.02, y * 1.02, C[2] + 0.005), (0.07, 0.07, 0.014), (0.15, 0.2, a), vertices=20))
        if i % 2: fyll.append(prim('kule', 'basil%d' % i, F['basilikum'], (x * 1.06, y * 1.04, C[2] + 0.02), (0.05, 0.025, 0.012), (0.3, 0, a), segments=12, ring_count=6))
    dr = drypp('ostedrypp', F['ost'], [(math.sin(a) * 0.44, C[1] + math.cos(a) * 0.62, C[2] - 0.01, l) for a, l in [(0.9, 0.09), (1.6, 0.13), (2.6, 0.07), (4.0, 0.11), (4.9, 0.08), (5.7, 0.12)]])
    striper = grillstriper('grill', (C[0], C[1], C[2] + 0.1), (0.42, 0.6, 0.15), 5, F['grill'], vinkel=0.5)
    # Basilikumblad og et lite ostefall på toppen, så toppen også leses som mat
    topp = [prim('kule', 'toppbasil', F['basilikum'], (0.12, 0.2, C[2] + 0.255), (0.07, 0.04, 0.012), (0.1, 0, 0.6), segments=14, ring_count=6)]
    kropp = slaa_sammen('kropp', [under, over, ost] + snitt + fyll[1:] + dr + striper + topp)
    # Hodet: ekte kaninhode i lys pels, ørene er sprø brødskorpe med lys innside
    hp = (0, -0.62, 0.78)
    hode = pivot(slaa_sammen('hode', kaninhode('h', hp, 1.0, F['pels'], F['skorpe'], F['brod_lys'], 0.6)), (0, -0.5, 0.66))
    hale = pivot(slaa_sammen('hale', [prim('kule', 'mozzarella', F['mozza'], (0, 0.7, 0.58), (0.12, 0.11, 0.11), segments=24, ring_count=14),
                                      prim('kule', 'halebasil', F['basilikum'], (0.03, 0.74, 0.69), (0.045, 0.025, 0.01), (0.4, 0, 0.3), segments=12, ring_count=6)]), (0, 0.62, 0.58))
    bein = bein_firbeint(F, 0.42, F['pels'], F['pute'])
    rot = rot_node('Paninikanin A'); forelder([kropp, hode, hale] + bein, rot)
    H.eksporter(rot, 'paninikanin_a')

# ---------------------------------------------------------------- B Brødkanin
def paninikanin_b():
    H.nullstill(); MATS.clear(); F = farger()
    C, A = (0, 0.08, 0.6), (0.36, 0.44, 0.4)
    # Kroppen er en bakt ciabatta formet som en sittende kanin. Fyllet går som et belte rundt magen.
    over = prim('kule', 'brod_over', F['brod'], (C[0], C[1], C[2] + 0.05), (A[0], A[1], A[2] * 0.62), segments=48, ring_count=24)
    under = prim('kule', 'brod_under', F['brod'], (C[0], C[1], C[2] - 0.17), (A[0] * 0.96, A[1] * 0.96, A[2] * 0.42), segments=48, ring_count=24)
    belte = [prim('torus', 'ostebelte', F['ost'], (C[0], C[1], C[2] - 0.08), (A[0] * 2.65, A[1] * 2.65, 1), major_radius=0.37, minor_radius=0.045, major_segments=56, minor_segments=12),
             prim('torus', 'skinkebelte', F['skinke'], (C[0], C[1], C[2] - 0.035), (A[0] * 2.62, A[1] * 2.62, 1), major_radius=0.37, minor_radius=0.03, major_segments=56, minor_segments=10)]
    for i in range(9):
        a = i / 9 * 2 * math.pi + 0.2; x, y = math.sin(a) * A[0] * 1.0, C[1] + math.cos(a) * A[1] * 1.0
        belte.append(prim('syl', 'tomat%d' % i, F['tomat'], (x, y, C[2] - 0.06), (0.065, 0.065, 0.013), (math.cos(a) * 1.2, math.sin(a) * 1.2, 0), vertices=18))
        if i % 3 == 1: belte.append(prim('kule', 'basil%d' % i, F['basilikum'], (x * 1.07, C[1] + (y - C[1]) * 1.07, C[2] - 0.05), (0.05, 0.026, 0.012), (0.2, 0, a), segments=12, ring_count=6))
    dr = drypp('ostedrypp', F['ost'], [(math.sin(a) * A[0] * 1.02, C[1] + math.cos(a) * A[1] * 1.02, C[2] - 0.11, l) for a, l in [(0.6, 0.08), (1.8, 0.11), (3.3, 0.07), (4.6, 0.1)]])
    striper = grillstriper('grill', (C[0], C[1], C[2] + 0.05), (A[0], A[1], A[2] * 0.62), 4, F['grill'], vinkel=0.45, z_min=0.35)
    mel = [prim('kule', 'mel%d' % i, F['brod_lys'], (rnd.uniform(-0.2, 0.2), C[1] + rnd.uniform(-0.25, 0.3), C[2] + 0.29), (0.02, 0.02, 0.005), segments=8, ring_count=4) for i in range(10)]
    kropp = slaa_sammen('kropp', [over, under] + belte + dr + striper + mel)
    # Hodet er også bakt: brødfarget med lys snute, ører av grillet brød
    hp = (0, -0.34, 1.06)
    hd = kaninhode('h', hp, 1.05, F['brod'], F['brod'], F['brod_lys'], 0.62, bred_mule=F['brod_lys'])
    hd += grillstriper('hodegrill', hp, (0.27 * 1.05, 0.25 * 1.05, 0.25 * 1.05), 3, F['grill'], vinkel=1.57, lengde=0.6, tykk=0.012, z_min=0.6)
    hode = pivot(slaa_sammen('hode', hd), (0, -0.25, 0.92))
    hale = pivot(slaa_sammen('hale', [prim('kule', 'mozzarella', F['mozza'], (0, 0.56, 0.42), (0.13, 0.12, 0.12), segments=24, ring_count=14)]), (0, 0.48, 0.45))
    # Forbeina er små brødpoter foran magen, bakbeina store flate brødføtter
    bein = []
    for i, (bx, by, bak) in enumerate([(-0.15, -0.36, False), (0.15, -0.36, False), (-0.24, 0.05, True), (0.24, 0.05, True)]):
        if bak: b = [prim('kule', 'lår%d' % i, F['brod'], (bx * 1.15, by + 0.05, 0.22), (0.15, 0.22, 0.17), segments=24, ring_count=14), prim('kule', 'fot%d' % i, F['brod'], (bx * 1.2, by - 0.18, 0.05), (0.1, 0.22, 0.06), segments=20, ring_count=10), prim('kule', 'pute%d' % i, F['brod_lys'], (bx * 1.2, by - 0.2, 0.015), (0.065, 0.16, 0.02), segments=14, ring_count=6)]
        else: b = [prim('syl', 'arm%d' % i, F['brod'], (bx, by + 0.03, 0.3), (0.065, 0.065, 0.18), vertices=16, ss=1), prim('kule', 'pote%d' % i, F['brod_lys'], (bx, by - 0.01, 0.12), (0.08, 0.09, 0.06), segments=16, ring_count=8)]
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], b), (bx, by, 0.42 if not bak else 0.3)))
    rot = rot_node('Paninikanin B'); forelder([kropp, hode, hale] + bein, rot)
    H.eksporter(rot, 'paninikanin_b')

# ---------------------------------------------------------------- C Halvpanini
def paninikanin_c():
    H.nullstill(); MATS.clear(); F = farger()
    # Kaninen står oppreist. Kroppen er en halv panini skåret på skrå, stående med spissen opp.
    # Lagene går fra venstre til høyre, så forfra ser man brød | ost | skinke | tomat | basilikum | ost | brød.
    lag = [('brod', 0.11), ('brod_lys', 0.03), ('ost', 0.035), ('skinke', 0.03), ('tomat', 0.03), ('basilikum', 0.02), ('ost', 0.03), ('brod_lys', 0.03), ('brod', 0.11)]
    tot = sum(t for _, t in lag); x = -tot / 2; deler = []; ost_x = []
    for i, (m, t) in enumerate(lag):
        rr = 0.43 if m.startswith('brod') else 0.445
        o = prim('syl', 'lag%d' % i, F[m], (0, 0, 0), (rr, rr, t / 2), vertices=3)
        o.data.transform(Matrix.Rotation(math.radians(60), 4, 'Z')); o.data.transform(Matrix.Rotation(math.radians(90), 4, 'Y'))
        if m.startswith('brod'):
            bev = o.modifiers.new('bev', 'BEVEL'); bev.width = 0.045; bev.segments = 4; H.bruk_mod(o)
        o.data.transform(Matrix.Translation((x + t / 2, 0, 0.64))); glatt(o); deler.append(o)
        if m == 'ost': ost_x.append(x + t / 2)
        x += t
    # Grillstriper på begge brødsidene
    for k in (-1, 1):
        for j in range(4):
            deler.append(prim('kube', 'grill%d%d' % (k, j), F['grill'], (k * (tot / 2 + 0.004), -0.12 + j * 0.09, 0.5 + j * 0.07), (0.006, 0.17 - j * 0.03, 0.011), (0.9, 0, 0)))
    dr = drypp('ostedrypp', F['ost'], [(xx, y, 0.43, l) for xx in ost_x for y, l in [(-0.2, 0.08), (0.05, 0.11), (0.25, 0.06)]], r=0.022)
    kropp = slaa_sammen('kropp', deler + dr)
    # Hodet: rundt brødhode (bolle) på toppen av trekanten, ører som to tynne paninistriper med ost i midten
    hp = (0, -0.04, 1.2)
    hd = kaninhode('h', hp, 0.95, F['brod'], F['brod'], F['ost'], 0.6, bred_mule=F['brod_lys'])
    hd += grillstriper('hodegrill', hp, (0.27 * 0.95, 0.25 * 0.95, 0.25 * 0.95), 3, F['grill'], vinkel=1.57, lengde=0.6, tykk=0.011, z_min=0.6)
    hode = pivot(slaa_sammen('hode', hd), (0, -0.02, 1.02))
    hale = pivot(slaa_sammen('hale', [prim('kule', 'mozzarella', F['mozza'], (0, 0.36, 0.44), (0.1, 0.1, 0.1), segments=20, ring_count=12)]), (0, 0.3, 0.44))
    bein = []
    for i, s in enumerate((-1, 1)):
        b = [prim('kule', 'fot%d' % i, F['brod'], (s * 0.14, -0.1, 0.05), (0.1, 0.22, 0.06), segments=20, ring_count=10),
             prim('kule', 'pute%d' % i, F['brod_lys'], (s * 0.14, -0.12, 0.015), (0.065, 0.16, 0.02), segments=14, ring_count=6),
             prim('syl', 'legg%d' % i, F['brod'], (s * 0.14, 0.0, 0.25), (0.07, 0.07, 0.2), vertices=16, ss=1)]
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (s * 0.14, 0, 0.44)))
    armer = []
    for i, s in enumerate((-1, 1)):
        a = [kurve('arm%d' % i, [(s * 0.2, -0.05, 0.74), (s * 0.32, -0.12, 0.64), (s * 0.3, -0.2, 0.54)], 0.05, F['brod'], avsmal=lambda t: 1 - 0.2 * t),
             prim('kule', 'labb%d' % i, F['brod_lys'], (s * 0.3, -0.22, 0.51), (0.065, 0.06, 0.06), segments=16, ring_count=8)]
        armer.append(pivot(slaa_sammen(['vinge_v', 'vinge_h'][i], a), (s * 0.2, -0.05, 0.74)))
    rot = rot_node('Paninikanin C'); forelder([kropp, hode, hale] + bein + armer, rot)
    H.eksporter(rot, 'paninikanin_c')

if __name__ == '__main__':
    for h in os.environ.get('FIGURER', 'a,b,c').split(','): globals()['paninikanin_' + h]()
