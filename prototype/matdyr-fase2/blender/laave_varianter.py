"""Matdyr-regn: tre låvevarianter til vurdering (Ivar 8.11.2026 kl. 21.30). Eksporteres som laaver.glb med rotnodene
laave_a, laave_b og laave_c. Spillet bruker dem bare med ?laave=a|b|c, så den gamle låven er uendret til en variant er valgt.

Felles for alle: én tydelig hovedform, gavlvegg som følger takets underside nøyaktig, hvite vindskier og hjørnebord,
hovedport med hvitt kryss, høyluke over porten, symmetriske vinduer og steinsokkel i samme stein som siloen.
Fronten vender mot -Y i Blender (= +Z i spillet). Materialnavnene følger miljo_ressurser.py, så Min Bondegård-profilen
gir samme bord-, maling-, stein- og taktekstur som resten av gården.

A – Klassisk mansardlåve: tak med knekk, mørkt tak, kuppel med værhane.
B – Norsk låve med saltak: ett bratt saltak, dyp rød farge, stor høyluke i gavlen og et lite gavlvindu.
C – Koselig storlåve: mansardtak med utstikkende høyhette over luka, myke kanter, blomsterkasser og lykt.
Kjør: blender -b -P laave_varianter.py -- <utmappe>
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
import miljo_ressurser as M

UT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else '/tmp/matdyr_glb'
mat, prim, kurve, slaa, ny_obj, sett_mat = H.mat, H.prim, H.kurve, H.slaa_sammen, H.ny_obj, H.sett_mat
kasse = M.kasse
rnd = random.Random(11)


def prisme(navn, m, poly, y0, y1):
    """Flat polygon i XZ-planet (liste av (x, z)), trukket ut langs Y fra y0 til y1."""
    me = bpy.data.meshes.new(navn); bm = bmesh.new()
    a = [bm.verts.new((x, y0, z)) for x, z in poly]; b = [bm.verts.new((x, y1, z)) for x, z in poly]
    bm.faces.new(a[::-1]); bm.faces.new(b)
    for i in range(len(poly)):
        j = (i + 1) % len(poly); bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); o = ny_obj(navn, me); sett_mat(o, m)
    for p in o.data.polygons: p.use_smooth = False
    return o


def linje(navn, m, p0, p1, y, bredde, tykk, utenfor=0.0):
    """Hvit list langs en strek i XZ-planet ved dybde y (vindski, karm osv.)."""
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; L = d.length
    k = kasse(navn, m, (0, 0, 0), (L + bredde * 0.6, tykk, bredde), 0.015)
    k.data.transform(Matrix.Rotation(-math.atan2(d.y, d.x), 4, 'Y'))
    mid = (p0 + p1) / 2; k.data.transform(Matrix.Translation((mid.x, y, mid.y)))
    return k


def under(profil, x):
    """Takets underside (z) ved x, lineært mellom profilpunktene."""
    for (x0, z0), (x1, z1) in zip(profil, profil[1:]):
        if min(x0, x1) - 1e-6 <= x <= max(x0, x1) + 1e-6 and abs(x1 - x0) > 1e-6:
            return z0 + (z1 - z0) * (x - x0) / (x1 - x0)
    return profil[0][1]


def tak_og_gavler(navn, mat_tak, mat_vegg, mat_hvit, B, L, profil, tykk=0.22, oh_gavl=0.45):
    """Tak som én skive langs profilen (venstre takfot → møne → høyre takfot), og to gavlvegger som følger undersiden."""
    topp = [(x, z + tykk) for x, z in profil]
    d = [prisme(navn + '_tak', mat_tak, topp + list(reversed(profil)), -L / 2 - oh_gavl, L / 2 + oh_gavl)]
    # Gavlveggene: rektangel opp til takfoten ved veggen, deretter takets underside mellom veggene
    inne = [p for p in profil if -B / 2 < p[0] < B / 2]
    poly = [(-B / 2, 0), (B / 2, 0), (B / 2, under(profil, B / 2) - 0.02)] + [(x, z - 0.02) for x, z in reversed(inne)] + [(-B / 2, under(profil, -B / 2) - 0.02)]
    poly = [poly[0], poly[1]] + poly[2:]
    # Sørg for at punktene går rundt i én retning (fra høyre takfot tilbake til venstre)
    poly = [(-B / 2, 0), (B / 2, 0), (B / 2, under(profil, B / 2) - 0.02)] + sorted([(x, z - 0.02) for x, z in inne], key=lambda p: -p[0]) + [(-B / 2, under(profil, -B / 2) - 0.02)]
    for s, nv in ((-1, 'f'), (1, 'b')):
        d.append(prisme(navn + '_gavl' + nv, mat_vegg, poly, s * L / 2 - 0.08, s * L / 2 + 0.08))
        # Vindskier: hvite bord langs takkanten på gavlen
        yy = s * (L / 2 + oh_gavl + 0.03)
        for (x0, z0), (x1, z1) in zip(topp, topp[1:]):
            d.append(linje(navn + '_vindski', mat_hvit, (x0, z0 - tykk * 0.45), (x1, z1 - tykk * 0.45), yy, tykk + 0.12, 0.08))
    # Takfotbord langs langsidene og mønekappe
    for i in (0, -1):
        x, z = topp[i]
        d.append(kasse(navn + '_takfot', mat_hvit, (x, 0, z - tykk * 0.55), (0.12, L + 2 * oh_gavl + 0.06, tykk + 0.1), 0.02))
    return d


def sidevegger(navn, m, B, L, H0):
    return [prisme(navn + '_side%d' % s, m, [(s * B / 2 - 0.08, 0), (s * B / 2 + 0.08, 0), (s * B / 2 + 0.08, H0), (s * B / 2 - 0.08, H0)], -L / 2, L / 2) for s in (-1, 1)]


def hjornebord(navn, m, B, L, H0, b=0.26):
    return [kasse(navn + '_hjorne', m, (sx * (B / 2 + 0.02), sy * (L / 2 + 0.02), H0 / 2), (b, b, H0 + 0.02), 0.03) for sx in (-1, 1) for sy in (-1, 1)]


def sokkel(navn, B, L, h=0.45):
    """Steinsokkel med synlige steiner, samme materialer som siloens steinfot."""
    sm, sm2 = mat('stein', '#a9a49b', 0.9), mat('stein_mork', '#8b867e', 0.9)
    d = [kasse(navn + '_sokkel', sm, (0, 0, h / 2 - 0.05), (B + 0.3, L + 0.3, h), 0.06)]
    i = 0
    for s in (-1, 1):
        for x in [-B / 2 + 0.35 + k * 0.7 for k in range(int(B / 0.7))]:
            k2 = prim('iko', navn + '_st%d' % i, sm2 if i % 3 == 0 else sm, (x + rnd.uniform(-0.08, 0.08), s * (L / 2 + 0.16), h * 0.5), (0.3, 0.1, 0.17), subdivisions=1); i += 1; d.append(k2)
        for y in [-L / 2 + 0.35 + k * 0.7 for k in range(int(L / 0.7))]:
            k2 = prim('iko', navn + '_st%d' % i, sm2 if i % 3 == 0 else sm, (s * (B / 2 + 0.16), y + rnd.uniform(-0.08, 0.08), h * 0.5), (0.1, 0.3, 0.17), subdivisions=1); i += 1; d.append(k2)
    return d


def port(navn, mork, hvit, x, y, b, h, z0=0.42, dobbel=True):
    """Hovedport: mørk rød, hvit karm og hvitt kryss på hver fløy."""
    d = [kasse(navn + '_port', mork, (x, y - 0.05, z0 + h / 2), (b, 0.1, h), 0.02)]
    d.append(linje(navn + '_karm_o', hvit, (x - b / 2 - 0.1, z0 + h + 0.08), (x + b / 2 + 0.1, z0 + h + 0.08), y - 0.12, 0.2, 0.08))
    for s in (-1, 1): d.append(linje(navn + '_karm_s', hvit, (x + s * (b / 2 + 0.08), z0), (x + s * (b / 2 + 0.08), z0 + h + 0.1), y - 0.12, 0.18, 0.08))
    floyer = [(x - b / 4, b / 2), (x + b / 4, b / 2)] if dobbel else [(x, b)]
    for fx, fb in floyer:
        for zz in (z0 + 0.1, z0 + h / 2, z0 + h - 0.1): d.append(linje(navn + '_tverr', hvit, (fx - fb / 2 + 0.06, zz), (fx + fb / 2 - 0.06, zz), y - 0.13, 0.14, 0.06))
        for s in (-1, 1): d.append(linje(navn + '_kryss', hvit, (fx - s * (fb / 2 - 0.1), z0 + 0.12), (fx + s * (fb / 2 - 0.1), z0 + h / 2), y - 0.14, 0.13, 0.05))
        for s in (-1, 1): d.append(linje(navn + '_kryss2', hvit, (fx - s * (fb / 2 - 0.1), z0 + h / 2), (fx + s * (fb / 2 - 0.1), z0 + h - 0.12), y - 0.14, 0.13, 0.05))
        for s in (-1, 1): d.append(linje(navn + '_kant', hvit, (fx + s * (fb / 2 - 0.05), z0 + 0.05), (fx + s * (fb / 2 - 0.05), z0 + h - 0.05), y - 0.13, 0.12, 0.06))
    if dobbel: d.append(kasse(navn + '_handtak', mat('jern', '#8d8f94', 0.45, met=0.6), (x, y - 0.2, z0 + h * 0.5), (0.08, 0.06, 0.5), 0.01))
    return d


def vindu(navn, hvit, glass, x, y, z, b, h, normal='y', kryss=True, kasse_blomst=False):
    """Vindu med hvit karm og sprosser. normal='y' for front/bak, 'x' for langsidene (y er da x-posisjonen)."""
    d = []
    if normal == 'y':
        d.append(kasse(navn + '_glass', glass, (x, y - 0.04, z), (b, 0.06, h), 0.01))
        for s in (-1, 1):
            d.append(kasse(navn + '_k1', hvit, (x, y - 0.09, z + s * (h / 2 + 0.06)), (b + 0.3, 0.08, 0.13), 0.015))
            d.append(kasse(navn + '_k2', hvit, (x + s * (b / 2 + 0.06), y - 0.09, z), (0.13, 0.08, h + 0.2), 0.015))
        if kryss: d += [kasse(navn + '_sp1', hvit, (x, y - 0.1, z), (0.06, 0.05, h), 0.0), kasse(navn + '_sp2', hvit, (x, y - 0.1, z), (b, 0.05, 0.06), 0.0)]
        if kasse_blomst: d += blomsterkasse(navn, x, y - 0.25, z - h / 2 - 0.2, b + 0.2)
    else:
        sx = 1 if y > 0 else -1
        d.append(kasse(navn + '_glass', glass, (y + sx * 0.04, x, z), (0.06, b, h), 0.01))
        for s in (-1, 1):
            d.append(kasse(navn + '_k1', hvit, (y + sx * 0.09, x, z + s * (h / 2 + 0.06)), (0.08, b + 0.3, 0.13), 0.015))
            d.append(kasse(navn + '_k2', hvit, (y + sx * 0.09, x + s * (b / 2 + 0.06), z), (0.08, 0.13, h + 0.2), 0.015))
        if kryss: d += [kasse(navn + '_sp1', hvit, (y + sx * 0.1, x, z), (0.05, 0.06, h), 0.0), kasse(navn + '_sp2', hvit, (y + sx * 0.1, x, z), (0.05, b, 0.06), 0.0)]
    return d


def blomsterkasse(navn, x, y, z, b):
    tre = mat('kasse_tre', '#b07a45', 0.8); gronn = mat('blad', '#4c9e3a', 0.7)
    d = [kasse(navn + '_bk', tre, (x, y, z), (b, 0.3, 0.26), 0.02)]
    farger = ['#ff5f6d', '#ffd43b', '#fbfbff', '#ff8fb1']
    for i in range(5):
        px = x - b / 2 + 0.18 + i * (b - 0.36) / 4
        d.append(prim('iko', navn + '_bl%d' % i, gronn, (px, y, z + 0.18), (0.16, 0.12, 0.12), subdivisions=1))
        d.append(prim('iko', navn + '_bf%d' % i, mat('blomst_' + str(i % 4), farger[i % 4], 0.6), (px + 0.04, y - 0.06, z + 0.27), (0.08, 0.08, 0.08), subdivisions=1))
    return d


def hoyluke(navn, mork, hvit, hoy, x, y, z, b, h, aapen=True):
    """Høyluke med hvit karm. Åpen luke viser høy som tyter ut."""
    d = [kasse(navn + '_hl', mork, (x, y - 0.04, z), (b, 0.08, h), 0.02)]
    for s in (-1, 1):
        d.append(linje(navn + '_hk1', hvit, (x - b / 2 - 0.08, z + s * (h / 2 + 0.07)), (x + b / 2 + 0.08, z + s * (h / 2 + 0.07)), y - 0.1, 0.16, 0.08))
        d.append(linje(navn + '_hk2', hvit, (x + s * (b / 2 + 0.07), z - h / 2 - 0.1), (x + s * (b / 2 + 0.07), z + h / 2 + 0.1), y - 0.1, 0.16, 0.08))
    if aapen:
        # Lukedøra slått ut til siden, og høy i åpningen
        d.append(kasse(navn + '_lukedor', mork, (x + b / 2 + 0.05 + b / 4, y - 0.35, z), (b / 2, 0.08, h - 0.05), 0.02, rot=(0, 0, -1.2)))
        d.append(kasse(navn + '_morkt', mat('laave_innside', '#3a1d18', 0.95), (x, y - 0.06, z), (b - 0.08, 0.04, h - 0.08), 0.0))
        haug = prim('kule', navn + '_hoy', hoy, (x, y - 0.12, z - h / 2 + 0.12), (b * 0.46, 0.35, h * 0.32), segments=16, ring_count=8)
        M.ujevn(haug, 0.04, 6, 3); d.append(haug)
        for i in range(10):
            sx = rnd.uniform(-b * 0.4, b * 0.4)
            d.append(kurve(navn + '_straa%d' % i, [(sx, y - 0.1, z - h / 2 + 0.2), (sx + rnd.uniform(-0.2, 0.2), y - 0.4, z - h / 2 + 0.15), (sx + rnd.uniform(-0.3, 0.3), y - 0.6, z - h / 2 - 0.05)], 0.025, hoy, rund=4, opp=2))
    return d


def heisebjelke(navn, tre, jern, x, y, z):
    """Bjelke med trinse over høyluka (klassisk låvedetalj)."""
    return [kasse(navn + '_bjelke', tre, (x, y - 0.5, z), (0.2, 1.1, 0.2), 0.02), prim('torus', navn + '_trinse', jern, (x, y - 0.95, z - 0.22), (1, 1, 1), (0, math.pi / 2, 0), major_radius=0.13, minor_radius=0.035, major_segments=16, minor_segments=6),
            kurve(navn + '_tau', [(x, y - 0.95, z - 0.35), (x, y - 0.95, z - 1.4)], 0.02, mat('tau', '#c9a56a', 0.9), rund=4, opp=1)]


def kuppel(navn, hvit, tak, rod, z, s=1.0):
    """Liten ventilasjonskuppel på mønet, med lameller og værhane."""
    jern = mat('jern', '#8d8f94', 0.45, met=0.6)
    d = [kasse(navn + '_kup', hvit, (0, 0, z + 0.45 * s), (0.9 * s, 0.9 * s, 0.9 * s), 0.03)]
    for i in range(3):
        for sy in (-1, 1): d.append(kasse(navn + '_lam', rod, (0, sy * 0.46 * s, z + (0.25 + i * 0.22) * s), (0.6 * s, 0.03, 0.08 * s), 0.0, rot=(0.5, 0, 0)))
    pyr = prim('kjegle', navn + '_kuptak', tak, (0, 0, z + 1.2 * s), (0.82 * s, 0.82 * s, 0.4 * s), vertices=4, rot=(0, 0, math.pi / 4))
    d.append(pyr)
    d.append(kasse(navn + '_stang', jern, (0, 0, z + 1.9 * s), (0.04, 0.04, 0.8 * s), 0.0))
    d.append(kasse(navn + '_pil', jern, (0, 0, z + 2.05 * s), (0.9 * s, 0.03, 0.06), 0.0))
    d.append(prim('kjegle', navn + '_pilspiss', jern, (0.48 * s, 0, z + 2.05 * s), (0.1, 0.1, 0.12), vertices=4, rot=(0, math.pi / 2, 0)))
    d.append(kasse(navn + '_hale', jern, (-0.45 * s, 0, z + 2.05 * s), (0.04, 0.03, 0.28), 0.0))
    return d


def lykt(navn, x, y, z):
    jern = mat('jern', '#8d8f94', 0.45, met=0.6); lys = mat('lykt_lys', '#ffe08a', 0.4, emit=1.2)
    return [kasse(navn + '_arm', jern, (x, y - 0.2, z + 0.25), (0.05, 0.4, 0.05), 0.0), kasse(navn + '_glass', lys, (x, y - 0.4, z), (0.22, 0.22, 0.3), 0.02),
            prim('kjegle', navn + '_ltak', jern, (x, y - 0.4, z + 0.22), (0.2, 0.2, 0.12), vertices=4, rot=(0, 0, math.pi / 4))]


def variant(navn, B, L, H0, profil, farge_vegg, farge_tak, farge_port, mone_z, ekstra):
    rod = mat('laave_rod', farge_vegg, 0.75); hvit = mat('laave_hvit', M.HVIT, 0.6); tak = mat('laave_tak', farge_tak, 0.8)
    mork = mat('laave_mork', farge_port, 0.8); hoy = mat('hoy', '#f0cf6a', 0.9); glass = mat('vindu_glass', '#4a6878', 0.25)
    d = sokkel(navn, B, L)
    d += sidevegger(navn, rod, B, L, under(profil, B / 2))
    d += tak_og_gavler(navn, tak, rod, hvit, B, L, profil)
    d += hjornebord(navn, hvit, B, L, under(profil, B / 2))
    d += ekstra(dict(rod=rod, hvit=hvit, tak=tak, mork=mork, hoy=hoy, glass=glass, B=B, L=L, H0=H0, mone=mone_z))
    o = slaa(navn, d)
    return o


def laave_a():
    """Klassisk mansardlåve."""
    B, L, H0, K, T = 8.0, 9.0, 3.9, 5.7, 7.3
    profil = [(-B / 2 - 0.45, H0 - 0.35), (-B / 2 * 0.86, K), (0, T), (B / 2 * 0.86, K), (B / 2 + 0.45, H0 - 0.35)]
    def ekstra(m):
        y = -L / 2 - 0.08; d = port('a', m['mork'], m['hvit'], 0, y, 3.4, 3.2)
        d += hoyluke('a', m['mork'], m['hvit'], m['hoy'], 0, y, 5.25, 1.5, 1.2)
        d += heisebjelke('a', mat('laave_planke', '#7a4a2a', 0.8), mat('jern', '#8d8f94', 0.45, met=0.6), 0, y, 6.55)
        for s in (-1, 1): d += vindu('af%d' % s, m['hvit'], m['glass'], s * 2.9, y, 2.4, 0.8, 0.9)
        for s in (-1, 1):
            for x in (-2.4, 2.4): d += vindu('as%d%d' % (s, x), m['hvit'], m['glass'], x, s * (B / 2 + 0.08), 2.3, 0.9, 0.9, normal='x')
        d += kuppel('a', m['hvit'], m['tak'], m['rod'], T + 0.15)
        d.append(kasse('a_mone', m['hvit'], (0, 0, T + 0.24), (0.32, L + 1.0, 0.14), 0.04))
        return d
    return variant('laave_a', B, L, H0, profil, M.ROD, M.TAK, '#7a2620', T, ekstra)


def laave_b():
    """Norsk låve med saltak og stor høyluke i gavlen."""
    B, L, H0, T = 7.6, 9.5, 3.6, 7.6
    profil = [(-B / 2 - 0.5, H0 - 0.4), (0, T), (B / 2 + 0.5, H0 - 0.4)]
    def ekstra(m):
        y = -L / 2 - 0.08; d = port('b', m['mork'], m['hvit'], 0, y, 3.0, 3.0)
        d += hoyluke('b', m['mork'], m['hvit'], m['hoy'], 0, y, 5.0, 1.6, 1.5)
        for s in (-1, 1): d += vindu('bf%d' % s, m['hvit'], m['glass'], s * 2.75, y, 2.3, 0.7, 0.8)
        d += vindu('bg', m['hvit'], m['glass'], 0, y, 6.55, 0.55, 0.45, kryss=False)
        for s in (-1, 1):
            for x in (-3.0, 0, 3.0): d += vindu('bs%d%d' % (s, x), m['hvit'], m['glass'], x, s * (B / 2 + 0.08), 2.2, 0.7, 0.7, normal='x')
        d.append(kasse('b_mone', m['hvit'], (0, 0, T + 0.24), (0.3, L + 1.0, 0.14), 0.04))
        return d
    return variant('laave_b', B, L, H0, profil, '#a8352b', '#4f4a48', '#6e2420', T, ekstra)


def laave_c():
    """Koselig storlåve: mansardtak med høyhette over luka, blomsterkasser og lykt."""
    B, L, H0, K, T = 8.4, 9.0, 4.0, 6.0, 7.8
    profil = [(-B / 2 - 0.55, H0 - 0.3), (-B / 2 * 0.84, K), (0, T), (B / 2 * 0.84, K), (B / 2 + 0.55, H0 - 0.3)]
    def ekstra(m):
        y = -L / 2 - 0.08; d = port('c', m['mork'], m['hvit'], 0, y, 3.6, 3.3)
        d += hoyluke('c', m['mork'], m['hvit'], m['hoy'], 0, y, 5.55, 1.6, 1.3)
        # Høyhette: mønet stikker ut over høyluka som en liten trekant med eget tak
        hp = [(-1.25, 6.75), (0, T + 0.05), (1.25, 6.75)]
        d.append(prisme('c_hette_tak', m['tak'], [(x, z + 0.2) for x, z in hp] + [(x, z) for x, z in reversed(hp)], -L / 2 - 1.5, -L / 2 + 0.2))
        d.append(prisme('c_hette_gavl', m['rod'], [(-1.15, 6.75), (1.15, 6.75), (0, T - 0.05)], -L / 2 - 1.42, -L / 2 - 1.3))
        for (x0, z0), (x1, z1) in zip(hp, hp[1:]): d.append(linje('c_hette_ski', m['hvit'], (x0, z0 + 0.1), (x1, z1 + 0.1), -L / 2 - 1.53, 0.3, 0.08))
        d += heisebjelke('c', mat('laave_planke', '#7a4a2a', 0.8), mat('jern', '#8d8f94', 0.45, met=0.6), 0, -L / 2 - 1.0, 6.6)
        for s in (-1, 1): d += vindu('cf%d' % s, m['hvit'], m['glass'], s * 3.0, y, 2.5, 0.9, 0.95, kasse_blomst=True)
        for s in (-1, 1):
            for x in (-2.5, 2.5): d += vindu('cs%d%d' % (s, x), m['hvit'], m['glass'], x, s * (B / 2 + 0.08), 2.4, 0.9, 0.95, normal='x')
        for s in (-1, 1): d += lykt('c%d' % s, s * 2.05, y, 3.55)
        d += kuppel('c', m['hvit'], m['tak'], m['rod'], T + 0.15, 1.1)
        d.append(kasse('c_mone', m['hvit'], (0, 0, T + 0.24), (0.34, L + 1.2, 0.16), 0.05))
        # Høyballer og en tønne inntil fronten gjør låven levende
        d.append(prim('syl', 'c_ball', m['hoy'], (-3.3, y - 1.1, 0.55), (0.55, 0.55, 0.5), (math.pi / 2, 0, 0.3), vertices=20))
        return d
    return variant('laave_c', B, L, H0, profil, M.ROD, '#6b4a3e', '#7a2620', T, ekstra)


if __name__ == '__main__':
    H.nullstill(); H.MATS.clear()
    alle = [laave_a(), laave_b(), laave_c()]
    for i, o in enumerate(alle): o.location.x = 0
    sti = os.path.join(UT, 'laaver.glb')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=sti, export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_texcoords=False, export_normals=True, export_materials='EXPORT', export_animations=False)
    for o in alle:
        o.data.calc_loop_triangles(); print('  ', o.name, len(o.data.loop_triangles))
    print('EKSPORT laaver fil', os.path.getsize(sti))
