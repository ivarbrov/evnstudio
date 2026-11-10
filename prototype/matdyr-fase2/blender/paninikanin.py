"""Paninikanin, videreutviklet fra forslag C «Halvpanini» (Evens valg 10.11.2026). Detaljnivå C (B6).
Ekte hybrid: kroppen ER en halv panini skåret på skrå, og kaninens former er bakt inn i brødet:
  - brødsidene er puffet opp der kaninen har lår, og de store bakføttene er skorpe med lyse brødsåler
  - snittflaten foran er kaninens mage og viser lagene (brød, ost, skinke, tomat, basilikum, ost, brød)
  - ørene er tynne paninistrimler med grillstripe og en ostekant
  - hodet er en myk brødbolle med lys snute, og osten har rent ned over panna
  - armene er brødskorpe, og ostetråder strekker seg fra armene til kroppen
  - halen er en mozzarellakule med et basilikumblad
Ingen ID- eller kategoribytte (Ivar 10.11.2026). Ørene er egne noder (ore_v, ore_h), klare for øreanimasjon.
Kjør: python3 paninikanin.py <utmappe>   Budsjett: full ≤ 25 000 og lav ≤ 7 000 trekanter.
"""
import bpy, bmesh, math, os, sys, random
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
from matdyr_hybrider import mat, prim, kurve, slaa_sammen, pivot, forelder, glatt, rot_node, MATS
from paninikanin_forslag import farger, kaninhode, drypp

rnd = random.Random(23)
R0, ZC = 0.43, 0.66                       # trekantens «radius» og senterhøyde
APEX, BASE, HALV = ZC + R0, ZC - 0.5 * R0, 0.866 * R0

def inni(y, z, marg):
    """Er (y, z) inne i trekanten (spiss opp), med margin?"""
    if z < BASE + marg or z > APEX - marg: return False
    t = (z - BASE) / (APEX - BASE)
    return abs(y) < HALV * (1 - t) - marg * 1.5

def striper_side(navn, x, m, n=5, vinkel=0.62, marg=0.06):
    deler = []
    for i in range(n):
        off = BASE + 0.08 + i * 0.11
        pts = []
        for k in range(40):
            y = -HALV + k * (2 * HALV / 39); z = off + (y + HALV) * math.tan(vinkel) * 0.55
            if inni(y, z, marg): pts.append((x, y, z))
        if len(pts) >= 3: deler.append(kurve('%s%d' % (navn, i), [pts[0], pts[len(pts) // 2], pts[-1]], 0.012, m, rund=2, opp=3))
    return deler

def paninikanin():
    H.nullstill(); MATS.clear(); F = farger()
    F['skorpe_mork'] = mat('skorpe_mork', '#a9622a', 0.55)
    lag = [('brod', 0.115), ('brod_lys', 0.028), ('ost', 0.034), ('skinke', 0.03), ('tomat', 0.03), ('basilikum', 0.018), ('ost', 0.03), ('brod_lys', 0.028), ('brod', 0.115)]
    tot = sum(t for _, t in lag); x = -tot / 2; deler = []; ost_x = []
    for i, (m, t) in enumerate(lag):
        rr = R0 if m.startswith('brod') else R0 + 0.014
        o = prim('syl', 'lag%d' % i, F[m], (0, 0, 0), (rr, rr, t / 2), vertices=3)
        o.data.transform(Matrix.Rotation(math.radians(60), 4, 'Z')); o.data.transform(Matrix.Rotation(math.radians(90), 4, 'Y'))
        if m == 'brod':
            bev = o.modifiers.new('bev', 'BEVEL'); bev.width = 0.05; bev.segments = 5; H.bruk_mod(o)
            # Puff: den flate sida buler litt ut, som en presset panini
            utside = 1 if i else -1
            for v in o.data.vertices:
                if v.co.x * utside > t / 2 - 0.002:
                    yy, zz = v.co.y, v.co.z
                    d = max(0.0, 1 - (yy / HALV) ** 2 - ((zz - 0.1) / (R0 * 1.1)) ** 2)
                    v.co.x += utside * 0.035 * d
            # Skorpe på kantene, lys gyllen på flatene
            o.data.materials.append(F['skorpe_mork'])
            for p in o.data.polygons:
                if abs(p.normal.x) < 0.75: p.material_index = 1
        elif m == 'brod_lys':
            bev = o.modifiers.new('bev', 'BEVEL'); bev.width = 0.01; bev.segments = 2; H.bruk_mod(o)
        elif m == 'ost':
            # Osten bølger litt ut over kanten
            sub = o.modifiers.new('ss', 'SUBSURF'); sub.levels = 2; H.bruk_mod(o)
            for v in o.data.vertices:
                a = math.atan2(v.co.z, v.co.y); v.co.y *= 1 + 0.03 * math.sin(a * 9 + i); v.co.z *= 1 + 0.03 * math.sin(a * 9 + i)
        o.data.transform(Matrix.Translation((x + t / 2, 0, ZC))); glatt(o); deler.append(o)
        if m == 'ost': ost_x.append(x + t / 2)
        x += t
    # Grillstriper på begge brødsidene (følger puffen)
    for k in (-1, 1): deler += striper_side('grill%d' % k, k * (tot / 2 + 0.03), F['grill'])
    # Ost som renner fra snittet foran (den skrå framsida) og fra bunnen
    fram = []
    for xx in ost_x:
        for t, l in [(0.18, 0.07), (0.45, 0.1), (0.7, 0.06)]:
            y = -HALV * (1 - t) - 0.012; z = BASE + t * (APEX - BASE) * 0.98
            fram.append((xx, y + 0.01, z, l))
        fram.append((xx, -0.12, BASE - 0.005, 0.08)); fram.append((xx, 0.15, BASE - 0.005, 0.06))
    dr = drypp('ostedrypp', F['ost'], fram, r=0.02)
    # Basilikumblad og tomatskiver som titter ut av snittet
    blad = []
    for i, (t, s) in enumerate([(0.3, 1), (0.55, -1), (0.8, 1)]):
        y = -HALV * (1 - t) - 0.02; z = BASE + t * (APEX - BASE)
        b = prim('kule', 'basil%d' % i, F['basilikum'], (0, 0, 0), (0.012, 0.06, 0.035), segments=12, ring_count=8)
        b.data.transform(Matrix.Rotation(0.6 * s, 4, 'X')); b.data.transform(Matrix.Translation((0.005 * s, y - 0.025, z))); blad.append(b)
    tx = [xx for (m, _), xx in zip(lag, [sum(t for _, t in lag[:i]) - tot / 2 + lag[i][1] / 2 for i in range(len(lag))]) if m == 'tomat'][0]
    for i, t in enumerate((0.25, 0.62)):
        y = -HALV * (1 - t) - 0.005; z = BASE + t * (APEX - BASE)
        blad.append(prim('syl', 'tomatskive%d' % i, F['tomat'], (tx, y - 0.02, z), (0.05, 0.05, 0.012), (0, math.pi / 2, 0), vertices=16))
    # Lår: brødet buler ut nederst på sidene, der kaninen sitter
    laar = []
    for s in (-1, 1):
        l = prim('kule', 'laar%d' % s, F['brod'], (s * (tot / 2 + 0.035), 0.06, BASE + 0.13), (0.07, 0.2, 0.16), segments=28, ring_count=16)
        laar.append(l)
        laar += [kurve('laargrill%d%d' % (s, j), [(s * (tot / 2 + 0.1), 0.0 + j * 0.07, BASE + 0.06), (s * (tot / 2 + 0.105), 0.03 + j * 0.07, BASE + 0.15), (s * (tot / 2 + 0.1), 0.06 + j * 0.07, BASE + 0.24)], 0.01, F['grill'], rund=2, opp=3) for j in range(2)]
    # Halsen: en smeltet ostekrage rundt spissen, så hodet sitter fast i paninien
    krage = [prim('kule', 'ostekrage', F['ost'], (0, -0.02, APEX - 0.1), (tot / 2 + 0.05, 0.13, 0.07), segments=28, ring_count=14)]
    krage += drypp('kragedrypp', F['ost'], [(-0.08, -0.13, APEX - 0.12, 0.06), (0.05, -0.14, APEX - 0.13, 0.09), (0.14, -0.08, APEX - 0.12, 0.05)], r=0.018)
    kropp = slaa_sammen('kropp', deler + dr + blad + laar + krage)

    # Hodet: myk brødbolle med lys snute (brødsmule), ost som har rent over panna. Spissen av paninien forsvinner bak hodet.
    hp = (0, -0.05, APEX + 0.06)
    hd = kaninhode('h', hp, 0.98, F['brod'], F['brod'], F['brod_lys'], bred_mule=F['brod_lys'], orer=False)
    hd.append(prim('kule', 'pannebrød', F['skorpe'], (hp[0], hp[1] + 0.02, hp[2] + 0.12), (0.2, 0.18, 0.1), segments=28, ring_count=14))
    lugg = prim('kule', 'panneost', F['ost'], (hp[0], hp[1] - 0.05, hp[2] + 0.17), (0.17, 0.15, 0.05), segments=28, ring_count=12)
    hd.append(lugg)
    hd += drypp('panneostd', F['ost'], [(-0.09, hp[1] - 0.17, hp[2] + 0.13, 0.05), (0.06, hp[1] - 0.19, hp[2] + 0.12, 0.07)], r=0.018)
    hode = pivot(slaa_sammen('hode', hd), (0, -0.02, APEX - 0.08))
    # Ører: tynne paninistrimler (skorpe ute, lys brødsmule inne, ostekant og én grillstripe). Egne noder for øreanimasjon.
    orer = []
    for s, navn in [(-1, 'ore_v'), (1, 'ore_h')]:
        L = 0.56; bx, bz = hp[0] + s * 0.1, hp[2] + 0.17
        d = [prim('kule', navn + '_ut', F['brod'], (0, 0, L / 2), (0.085, 0.045, L / 2), segments=24, ring_count=16),
             prim('kule', navn + '_inn', F['brod_lys'], (0, -0.03, L / 2), (0.055, 0.02, L * 0.4), segments=20, ring_count=12),
             prim('kule', navn + '_ost', F['ost'], (s * 0.07, -0.005, L * 0.48), (0.018, 0.04, L * 0.38), segments=12, ring_count=10),
             kurve(navn + '_grill', [(0, 0.045, L * 0.25), (0, 0.047, L * 0.5), (0, 0.042, L * 0.75)], 0.009, F['grill'], rund=2, opp=3)]
        for o in d:
            o.data.transform(Matrix.Rotation(s * 0.24, 4, 'Y')); o.data.transform(Matrix.Rotation(-0.12, 4, 'X')); o.data.transform(Matrix.Translation((bx, hp[1] + 0.02, bz)))
        orer.append(pivot(slaa_sammen(navn, d), (bx, hp[1] + 0.02, bz)))
    # Hale: mozzarellakule med basilikumblad
    hale = pivot(slaa_sammen('hale', [prim('kule', 'mozzarella', F['mozza'], (0, HALV * 0.2 + 0.2, BASE + 0.06), (0.1, 0.1, 0.1), segments=20, ring_count=12),
                                      prim('kule', 'halebasil', F['basilikum'], (0.03, HALV * 0.2 + 0.25, BASE + 0.15), (0.04, 0.022, 0.01), (0.5, 0, 0.4), segments=12, ring_count=6)]), (0, 0.24, BASE + 0.06))
    # Store bakføtter av skorpe med lyse brødsåler
    bein = []
    for i, s in enumerate((-1, 1)):
        b = [prim('kule', 'fot%d' % i, F['brod'], (s * 0.15, -0.12, 0.06), (0.105, 0.23, 0.065), segments=24, ring_count=12),
             prim('kule', 'saale%d' % i, F['brod_lys'], (s * 0.15, -0.14, 0.018), (0.07, 0.17, 0.02), segments=16, ring_count=6),
             prim('syl', 'legg%d' % i, F['brod'], (s * 0.15, -0.01, (BASE + 0.08) / 2 + 0.03), (0.075, 0.075, (BASE - 0.02) / 2), vertices=16, ss=1)]
        for j in (-1, 0, 1):   # tær
            b.append(prim('kule', 'tå%d%d' % (i, j), F['brod'], (s * 0.15 + j * 0.045, -0.34, 0.055), (0.035, 0.04, 0.035), segments=12, ring_count=8))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], b), (s * 0.15, 0, BASE + 0.04)))
    # Armer av skorpe, med ostetråder som strekker seg inn mot kroppen
    armer = []
    for i, s in enumerate((-1, 1)):
        sx = s * (tot / 2 + 0.02)
        a = [kurve('arm%d' % i, [(sx, -0.08, ZC + 0.12), (sx + s * 0.1, -0.16, ZC), (sx + s * 0.06, -0.24, ZC - 0.1)], 0.05, F['brod'], avsmal=lambda t: 1 - 0.15 * t),
             prim('kule', 'labb%d' % i, F['brod_lys'], (sx + s * 0.06, -0.26, ZC - 0.13), (0.065, 0.06, 0.06), segments=16, ring_count=8),
             kurve('ostetråd%d' % i, [(sx + s * 0.05, -0.2, ZC - 0.06), (sx + s * 0.005, -0.2, ZC - 0.12), (s * (tot / 2 - 0.01), -0.17, ZC - 0.1)], 0.008, F['ost'], rund=2, opp=6)]
        armer.append(pivot(slaa_sammen(['vinge_v', 'vinge_h'][i], a), (sx, -0.08, ZC + 0.12)))
    rot = rot_node('Paninikanin'); forelder([kropp, hode, hale] + orer + bein + armer, rot)
    H.eksporter(rot, 'paninikanin')

if __name__ == '__main__':
    paninikanin()
