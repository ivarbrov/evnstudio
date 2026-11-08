"""Matdyr-regn fase 2: miljøressurser modellert i Blender og eksportert som én GLB (miljo.glb).

Hver ressurs er en egen rotnode med et fast navn (tre_eik, tre_eple, tre_gran, busk_1, busk_2, stein_1, stein_2,
blomst_rod, blomst_gul, blomst_hvit, gress, laave, silo, honsehus, molle (med barnet 'vinge'), drivhus, taarn,
gjerde_stolpe, gjerde_ledd, hoyball, kasse). Spillet henter dem etter navn og instanserer det som gjentas.
Stil: myke, avrundede former, tydelige farger og små detaljer (planker, takstein, klinker), uten å kopiere andre spill.
Kjør: python3 miljo_ressurser.py <utmappe>
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix, Euler, noise

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H   # gjenbruker hjelperne (mat, prim, kurve, slaa_sammen, pivot, subsurf ...)

UT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else '/tmp/matdyr_glb'
rnd = random.Random(3)
mat, prim, kurve, slaa, pivot, subsurf, glatt, sett_mat, bruk_mod, ny_obj = H.mat, H.prim, H.kurve, H.slaa_sammen, H.pivot, H.subsurf, H.glatt, H.sett_mat, H.bruk_mod, H.ny_obj

def kasse(navn, m, loc, st, fas=0.04, rot=(0, 0, 0)):
    """Boks med avrundede kanter (bevel), så lyset fanger kantene."""
    o = prim('kube', navn, m, (0, 0, 0), (st[0] / 2, st[1] / 2, st[2] / 2), size=2)
    if fas > 0:
        b = o.modifiers.new('fas', 'BEVEL'); b.width = fas; b.segments = 2; b.limit_method = 'NONE'; bruk_mod(o)
    o.data.transform(Euler(rot).to_matrix().to_4x4()); o.data.transform(Matrix.Translation(loc))
    for p in o.data.polygons: p.use_smooth = False
    return o

def ujevn(o, styrke, skala=2.0, frø=0):
    for v in o.data.vertices:
        v.co += v.normal * styrke * noise.noise(v.co * skala + Vector((frø, frø * 2, frø * 3)))
    return o

def rot(navn, deler, x=0):
    o = slaa(navn, deler)
    return o

# ---------------------------------------------------------------- vegetasjon
def lov(navn, m, sentre, st=1.0, frø=0):
    deler = []
    for i, (c, r) in enumerate(sentre):
        k = prim('iko', navn + str(i), m, c, (r * st, r * st, r * st * 0.92), subdivisions=2)
        ujevn(k, r * 0.12, 1.6 / r, frø + i)
        deler.append(k)
    return deler

def tre_eik():
    stamme = mat('stamme', '#8a5a36', 0.85); lov1 = mat('lov_lys', '#6cc04a', 0.7); lov2 = mat('lov_mork', '#4c9e3a', 0.75)
    s = [kurve('stamme', [(0, 0, 0), (0.05, 0, 1.0), (0, 0.05, 1.9), (0.1, 0, 2.5)], 0.3, stamme, avsmal=lambda t: 1.15 - 0.55 * t)]
    s.append(kurve('gren', [(0.05, 0, 1.6), (0.5, 0.1, 2.2), (0.8, 0.1, 2.6)], 0.12, stamme, avsmal=lambda t: 1 - 0.6 * t))
    s += lov('kronemork', lov2, [((0, 0, 2.9), 1.15), ((0.9, 0.2, 2.7), 0.85), ((-0.8, 0.3, 2.6), 0.8), ((0.1, -0.8, 2.6), 0.8)], frø=1)
    s += lov('kronelys', lov1, [((0.2, 0.1, 3.5), 0.95), ((0.7, -0.3, 3.2), 0.7), ((-0.5, -0.2, 3.3), 0.72), ((-0.2, 0.6, 3.2), 0.7)], frø=5)
    return rot('tre_eik', s)

def tre_eple():
    o = tre_eik(); o.name = 'tre_eple_tmp'
    eple = mat('eple', '#e8343c', 0.35)
    epler = [prim('kule', 'eple%d' % i, eple, p, (0.13,) * 3, segments=12, ring_count=8) for i, p in enumerate([(1.0, -0.6, 2.9), (-0.9, -0.5, 2.8), (0.3, -1.0, 2.5), (-0.4, -0.9, 3.4), (0.9, 0.5, 3.0), (-1.0, 0.4, 2.6), (0.1, 0.9, 3.3)])]
    o = rot('tre_eple', [o] + epler)
    return o

def tre_gran():
    stamme = mat('stamme', '#8a5a36', 0.85); gran = mat('gran', '#3f8f4c', 0.75); gran2 = mat('gran_lys', '#56a85a', 0.75)
    s = [prim('syl', 'granstamme', stamme, (0, 0, 0.5), (0.18, 0.18, 0.5), vertices=10)]
    for i, (z, r, h) in enumerate([(1.0, 1.35, 1.5), (1.9, 1.1, 1.35), (2.7, 0.82, 1.2), (3.4, 0.55, 1.0)]):
        k = prim('kjegle', 'lag%d' % i, gran if i % 2 == 0 else gran2, (0, 0, z + h / 2), (r, r, h / 2), vertices=10, depth=2)
        b = k.modifiers.new('fas', 'BEVEL'); b.width = 0.08; b.segments = 2; b.limit_method = 'NONE'; bruk_mod(k); glatt(k)
        ujevn(k, 0.04, 3, i)
        s.append(k)
    return rot('tre_gran', s)

def busk(navn, farge, blomst=None):
    m = mat('busk' + navn, farge, 0.75)
    s = lov(navn, m, [((0, 0, 0.45), 0.55), ((0.45, 0.1, 0.38), 0.42), ((-0.42, -0.05, 0.36), 0.4), ((0.05, 0.35, 0.4), 0.38)], frø=len(navn))
    if blomst:
        bm = mat('bær' + navn, blomst, 0.4)
        for i in range(10):
            u = rnd.uniform(0, 6.28); v = rnd.uniform(0.2, 1.2)
            p = Vector((math.cos(u) * math.sin(v) * 0.55, math.sin(u) * math.sin(v) * 0.5, 0.45 + math.cos(v) * 0.5))
            s.append(prim('kule', 'b%d' % i, bm, tuple(p), (0.07,) * 3, segments=8, ring_count=6))
    return rot(navn, s)

def stein(navn, st, frø):
    m = mat('stein', '#9aa1a6', 0.85); mose = mat('mose', '#7fb04e', 0.9)
    k = prim('iko', navn + 'k', m, (0, 0, st[2] * 0.35), st, subdivisions=3)
    ujevn(k, 0.12, 1.4, frø)
    for v in k.data.vertices:
        if v.co.z < 0: v.co.z *= 0.3
    deler = [k]
    deler.append(ujevn(prim('iko', navn + 'm', mose, (0.05, 0, st[2] * 0.75), (st[0] * 0.6, st[1] * 0.55, st[2] * 0.22), subdivisions=2), 0.05, 2, frø + 3))
    for p in k.data.polygons: p.use_smooth = True
    return rot(navn, deler)

def blomst(navn, farge):
    stilk = mat('stilk', '#4f9c3a', 0.7); m = mat('kronblad_' + navn, farge, 0.55); midt = mat('blomstmidt', '#ffcc33', 0.5)
    s = [prim('syl', 'stilk', stilk, (0, 0, 0.2), (0.016, 0.016, 0.2), vertices=5)]
    for i in range(5):
        a = i * 2 * math.pi / 5
        s.append(prim('kule', 'blad%d' % i, m, (math.cos(a) * 0.07, math.sin(a) * 0.07, 0.4), (0.07, 0.04, 0.02), (0, 0, a), segments=6, ring_count=4))
    s.append(prim('kule', 'midt', midt, (0, 0, 0.41), (0.04, 0.04, 0.03), segments=6, ring_count=4))
    s.append(prim('kule', 'lov', stilk, (0.06, 0, 0.12), (0.08, 0.03, 0.015), (0, -0.4, 0.3), segments=6, ring_count=4))
    return rot(navn, s)

def gress():
    """Tett, kort gresstust: brede blad som bøyer seg litt utover, i to grønnfarger."""
    m = mat('gress', '#6fc24a', 0.85); m2 = mat('gress_lys', '#95d861', 0.85)
    me = bpy.data.meshes.new('gress'); bm = bmesh.new(); r2 = random.Random(5)
    for i in range(11):
        a = i * 2 * math.pi / 11 + r2.uniform(-0.25, 0.25); d = r2.uniform(0.0, 0.08); h = r2.uniform(0.16, 0.3); w = 0.05
        bx, by = math.cos(a) * d, math.sin(a) * d; lx, ly = -math.sin(a) * w, math.cos(a) * w; ut = r2.uniform(0.25, 0.5)
        mx, my = math.cos(a) * h * ut * 0.5, math.sin(a) * h * ut * 0.5; tx, ty = math.cos(a) * h * ut, math.sin(a) * h * ut
        v1 = bm.verts.new((bx - lx, by - ly, 0)); v2 = bm.verts.new((bx + lx, by + ly, 0))
        v3 = bm.verts.new((bx + mx + lx * 0.6, by + my + ly * 0.6, h * 0.55)); v4 = bm.verts.new((bx + mx - lx * 0.6, by + my - ly * 0.6, h * 0.55)); v5 = bm.verts.new((bx + tx, by + ty, h))
        for f in (bm.faces.new((v1, v2, v3, v4)), bm.faces.new((v4, v3, v5))): f.material_index = i % 2
    bm.to_mesh(me); bm.free(); o = ny_obj('gress', me); o.data.materials.append(m); o.data.materials.append(m2)
    for p in o.data.polygons: p.use_smooth = True
    return o

# ---------------------------------------------------------------- bygninger
ROD, HVIT, TAK = '#c23b30', '#fbf6ec', '#5b4a44'

def planke_vegg(navn, m, bredde, hoyde, x, y, z, rot_z=0, planke=0.32):
    """Vegg av stående planker med små fuger, sett fra -Y."""
    deler = []; n = max(1, int(bredde / planke))
    for i in range(n):
        px = -bredde / 2 + (i + 0.5) * bredde / n
        deler.append(kasse('%s%d' % (navn, i), m, (px, 0, hoyde / 2), (bredde / n - 0.025, 0.1, hoyde), 0.012))
    o = slaa(navn, deler); o.data.transform(Matrix.Rotation(rot_z, 4, 'Z')); o.data.transform(Matrix.Translation((x, y, z)))
    return o

def langs(profil, x):
    """z på en takprofil (liste av (x, z) fra venstre til høyre takfot) ved x."""
    for (x0, z0), (x1, z1) in zip(profil, profil[1:]):
        if min(x0, x1) - 1e-6 <= x <= max(x0, x1) + 1e-6 and abs(x1 - x0) > 1e-6: return z0 + (z1 - z0) * (x - x0) / (x1 - x0)
    return profil[0][1]

def gavl(navn, m, b, h0, h1, y, tykk=0.12, profil=None):
    """Gavl som et flatt stykke. Med profil følger toppen takets underside (8 cm under takflatene), så gavlen aldri stikker
    opp gjennom taket. Uten profil: den gamle mansardformen."""
    me = bpy.data.meshes.new(navn); bm = bmesh.new()
    if profil:
        xs = [b / 2] + sorted([x for x, z in profil if -b / 2 < x < b / 2], reverse=True) + [-b / 2]
        pts = [(-b / 2, h0), (b / 2, h0)] + [(x, max(h0 + 0.01, langs(profil, x) - 0.08)) for x in xs]
    else:
        pts = [(-b / 2, h0), (b / 2, h0), (b / 2 * 0.98, h0 + (h1 - h0) * 0.55), (b * 0.25, h1 - 0.05), (0, h1), (-b * 0.25, h1 - 0.05), (-b / 2 * 0.98, h0 + (h1 - h0) * 0.55)]
    f1 = [bm.verts.new((x, y - tykk / 2, z)) for x, z in pts]; f2 = [bm.verts.new((x, y + tykk / 2, z)) for x, z in pts]
    bm.faces.new(f1[::-1]); bm.faces.new(f2)
    for i in range(len(pts)): j = (i + 1) % len(pts); bm.faces.new((f1[i], f1[j], f2[j], f2[i]))
    bm.to_mesh(me); bm.free(); o = ny_obj(navn, me); sett_mat(o, m); return o

def tak_flate(navn, m, a, b, lengde, rader=6):
    """Takflate fra punkt a til b (x, z) i tverrsnitt, med rader av takstein som små trinn."""
    deler = []
    for i in range(rader):
        t0, t1 = i / rader, (i + 1) / rader
        p0 = Vector(a).lerp(Vector(b), t0); p1 = Vector(a).lerp(Vector(b), t1)
        mid = (p0 + p1) / 2; d = p1 - p0; l = d.length + 0.08; vink = math.atan2(d.y, d.x)
        k = kasse('%s%d' % (navn, i), m, (0, 0, 0), (l, lengde, 0.09), 0.03)
        k.data.transform(Matrix.Rotation(-vink, 4, 'Y')); k.data.transform(Matrix.Translation((mid.x, 0, mid.y + 0.03 * (i % 2))))
        deler.append(k)
    return slaa(navn, deler)

def laave():
    rod = mat('laave_rod', ROD, 0.75); hvit = mat('laave_hvit', HVIT, 0.6); tak = mat('laave_tak', TAK, 0.8); mork = mat('laave_mork', '#7a2620', 0.8)
    hoy = mat('hoy', '#f0cf6a', 0.9)
    B, L, H0, H1 = 7.0, 8.0, 4.2, 7.0
    d = [planke_vegg('vegg_fram', rod, B, H0, 0, -L / 2, 0), planke_vegg('vegg_bak', rod, B, H0, 0, L / 2, 0)]
    d += [planke_vegg('vegg_v', rod, L, H0, -B / 2, 0, 0, math.pi / 2), planke_vegg('vegg_h', rod, L, H0, B / 2, 0, 0, math.pi / 2)]
    dh = H1 - H0
    takprofil = [(-(B / 2 + 0.35), H0 - 0.2), (-B / 2 * 0.965, H0 + 0.545 * dh), (0, H1 + 0.08), (B / 2 * 0.965, H0 + 0.545 * dh), (B / 2 + 0.35, H0 - 0.2)]
    d += [gavl('gavl_f', rod, B, H0, H1, -L / 2, profil=takprofil), gavl('gavl_b', rod, B, H0, H1, L / 2, profil=takprofil)]
    # Tak med knekk på begge sider og møne
    for s in (-1, 1):
        d.append(tak_flate('tak_nedre%d' % s, tak, (s * (B / 2 + 0.35), H0 - 0.2), (s * B / 2 * 0.98 * 0.98, H0 + (H1 - H0) * 0.56), L + 0.6, 3))
        d.append(tak_flate('tak_ovre%d' % s, tak, (s * B / 2 * 0.97, H0 + (H1 - H0) * 0.53), (0, H1 + 0.08), L + 0.6, 5))
    d.append(kasse('mone', hvit, (0, 0, H1 + 0.12), (0.3, L + 0.7, 0.22), 0.06))
    # Hvite hjørnelister og kanter
    for sx in (-1, 1):
        for sy in (-1, 1): d.append(kasse('hjorne', hvit, (sx * B / 2, sy * L / 2, H0 / 2), (0.28, 0.28, H0 + 0.1), 0.05))
    for sy in (-1, 1):
        d.append(kasse('list', hvit, (0, sy * (L / 2 + 0.06), H0 - 0.05), (B + 0.3, 0.14, 0.22), 0.04))
    # Store dører med hvitt kryss, og en høyluke med høy som stikker ut
    for sx in (-1, 1):
        x0 = sx * 1.1
        d.append(kasse('dor', mork, (x0, -L / 2 - 0.08, 1.5), (2.1, 0.1, 3.0), 0.03))
        d.append(kasse('dorramme', hvit, (x0, -L / 2 - 0.13, 1.5), (2.2, 0.06, 0.16), 0.02))
        for zz in (0.08, 2.95): d.append(kasse('dorkant', hvit, (x0, -L / 2 - 0.13, zz), (2.2, 0.08, 0.16), 0.02))
        for xx in (-1.03, 1.03): d.append(kasse('dorside', hvit, (x0 + xx, -L / 2 - 0.13, 1.5), (0.16, 0.08, 3.0), 0.02))
        for s in (-1, 1): d.append(kasse('kryss', hvit, (x0, -L / 2 - 0.14, 1.5), (0.16, 0.06, 3.3), 0.02, rot=(0, s * 0.6, 0)))
    d.append(kasse('luke', mork, (0, -L / 2 - 0.08, 5.1), (1.4, 0.1, 1.3), 0.03))
    d.append(kasse('lukeramme', hvit, (0, -L / 2 - 0.12, 5.1), (1.6, 0.08, 1.5), 0.03))
    for i in range(14):
        a = rnd.uniform(-0.6, 0.6)
        d.append(kurve('hoystraa%d' % i, [(rnd.uniform(-0.55, 0.55), -L / 2 - 0.1, 4.6 + rnd.uniform(0, 0.4)), (rnd.uniform(-0.6, 0.6), -L / 2 - 0.35, 4.55 + rnd.uniform(-0.1, 0.3)), (rnd.uniform(-0.7, 0.7), -L / 2 - 0.55, 4.4 + rnd.uniform(-0.2, 0.2))], 0.03, hoy, rund=4, opp=2))
    d.append(kasse('sokkel', mat('sokkel', '#9a9690', 0.9), (0, 0, 0.12), (B + 0.2, L + 0.2, 0.26), 0.05))
    return rot('laave', d)

def silo():
    vegg = mat('silo_vegg', '#e5e1d6', 0.55); tak = mat('silo_tak', '#c23b30', 0.4, met=0.2); jern = mat('jern', '#8d8f94', 0.45, met=0.6)
    h = 8.0
    s = prim('syl', 'silo', vegg, (0, 0, h / 2), (1.7, 1.7, h / 2), vertices=48)
    bm = bmesh.new(); bm.from_mesh(s.data); bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) > 1], cuts=40)
    bm.to_mesh(s.data); bm.free()
    for v in s.data.vertices:
        if abs(v.co.z) < h - 0.01 and 0.01 < v.co.z: v.co.x *= 1 + 0.012 * math.sin(v.co.z * 7 * math.pi / 2); v.co.y *= 1 + 0.012 * math.sin(v.co.z * 7 * math.pi / 2)
    glatt(s)
    d = [s, prim('kule', 'kuppel', tak, (0, 0, h), (1.78, 1.78, 1.3), segments=40, ring_count=20)]
    bm = bmesh.new(); bm.from_mesh(d[1].data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < h - 0.01], context='VERTS'); bm.to_mesh(d[1].data); bm.free()
    d.append(prim('kule', 'topp', jern, (0, 0, h + 1.35), (0.22, 0.22, 0.18), segments=16, ring_count=8))
    for z in (2, 4, 6): d.append(prim('torus', 'band%d' % z, jern, (0, 0, z), major_radius=1.73, minor_radius=0.05, major_segments=48, minor_segments=6))
    for z in [i * 0.4 + 0.4 for i in range(20)]: d.append(kasse('trinn', jern, (0, -1.82, z), (0.5, 0.05, 0.05), 0.0))
    for x in (-0.25, 0.25): d.append(kasse('stige', jern, (x, -1.82, 4.2), (0.06, 0.06, 8.2), 0.0))
    # Steinfot rundt bunnen
    sm, sm2 = mat('stein', '#a9a49b', 0.9), mat('stein_mork', '#8b867e', 0.9)
    for i in range(22):
        a = i * 2 * math.pi / 22
        for z, off in ((0.22, 0), (0.62, 0.14)):
            k = prim('iko', 'silostein%d_%d' % (i, z * 10), sm if (i + int(z * 10)) % 3 else sm2, (math.cos(a + off) * 1.78, math.sin(a + off) * 1.78, z), (0.32, 0.22, 0.2), subdivisions=2)
            k.data.transform(Matrix.Translation((-math.cos(a + off) * 1.78, -math.sin(a + off) * 1.78, -z))); k.data.transform(Matrix.Rotation(a + off, 4, 'Z')); k.data.transform(Matrix.Translation((math.cos(a + off) * 1.78, math.sin(a + off) * 1.78, z)))
            ujevn(k, 0.03, 5, i); d.append(k)
    return rot('silo', d)

def honsehus():
    tre = mat('honse_tre', '#f2c46d', 0.75); rod = mat('laave_rod', ROD, 0.75); hvit = mat('laave_hvit', HVIT, 0.6); mork = mat('dor_mork', '#6b4630', 0.8)
    d = [planke_vegg('hv_f', tre, 3.0, 2.0, 0, -1.2, 0.6), planke_vegg('hv_b', tre, 3.0, 2.0, 0, 1.2, 0.6), planke_vegg('hv_v', tre, 2.4, 2.0, -1.5, 0, 0.6, math.pi / 2), planke_vegg('hv_h', tre, 2.4, 2.0, 1.5, 0, 0.6, math.pi / 2)]
    for sx in (-1, 1):
        for sy in (-1, 1): d.append(kasse('stolpe', mork, (sx * 1.35, sy * 1.05, 0.3), (0.2, 0.2, 0.7), 0.03))
    d.append(kasse('gulv', mork, (0, 0, 0.62), (3.1, 2.5, 0.12), 0.03))
    for s in (-1, 1): d.append(tak_flate('ht%d' % s, rod, (s * 1.8, 2.5), (0, 3.6), 3.0, 4))
    hp = [(-1.8, 2.5), (0, 3.6), (1.8, 2.5)]   # saltak: gavlen er en trekant som følger taket
    d.append(gavl('hg_f', tre, 3.0, 2.6, 3.6, -1.2, profil=hp)); d.append(gavl('hg_b', tre, 3.0, 2.6, 3.6, 1.2, profil=hp))
    d.append(kasse('hdor', mork, (0, -1.3, 1.25), (0.7, 0.08, 0.9), 0.03))
    d.append(kasse('rampe', mork, (0, -1.8, 0.35), (0.6, 1.2, 0.06), 0.02, rot=(0.45, 0, 0)))
    d.append(kasse('vindu', mat('vindu', '#bfe8ff', 0.15, emit=0.2), (1.0, -1.28, 1.9), (0.6, 0.05, 0.5), 0.02))
    d.append(kasse('vinduramme', hvit, (1.0, -1.25, 1.9), (0.72, 0.04, 0.62), 0.02))
    return rot('honsehus', d)

def molle():
    hvit = mat('molle_hvit', HVIT, 0.6); rod = mat('laave_rod', ROD, 0.75); tre = mat('vinge_tre', '#d8c093', 0.7); mork = mat('dor_mork', '#6b4630', 0.8)
    t = prim('kjegle', 'taarn', hvit, (0, 0, 3.5), (1.0, 1.0, 3.5), vertices=8, radius1=1.7, radius2=1.05, depth=2)
    b = t.modifiers.new('fas', 'BEVEL'); b.width = 0.06; b.segments = 2; b.limit_method = 'ANGLE'; bruk_mod(t)
    d = [t, prim('kjegle', 'hette', rod, (0, 0, 7.8), (1.0, 1.0, 0.9), vertices=8, radius1=1.4, radius2=0.08, depth=2)]
    d.append(kasse('mdor', mork, (0, -1.62, 0.9), (0.9, 0.12, 1.6), 0.04, rot=(-0.1, 0, 0)))
    for z in (2.8, 4.9): d.append(kasse('mvindu', mat('vindu', '#bfe8ff', 0.15, emit=0.2), (0, -1.38 + (z - 2.8) * 0.1, z), (0.5, 0.1, 0.6), 0.03, rot=(-0.1, 0, 0)))
    navgruppe = []
    navgruppe.append(prim('syl', 'nav', mork, (0, -1.35, 0), (0.25, 0.25, 0.25), (math.pi / 2, 0, 0), vertices=16))
    for i in range(4):
        a = i * math.pi / 2
        v = kasse('arm%d' % i, tre, (0, -1.55, 2.3), (0.14, 0.1, 4.4), 0.02)
        v2 = kasse('seil%d' % i, mat('seil', '#f7f1e3', 0.8), (0.32, -1.6, 2.6), (0.5, 0.04, 3.4), 0.01)
        for o in (v, v2): o.data.transform(Matrix.Rotation(a, 4, 'Y'))
        navgruppe += [v, v2]
        for k in range(5):
            l = kasse('sprosse%d%d' % (i, k), tre, (0.32, -1.62, 1.2 + k * 0.7), (0.6, 0.05, 0.05), 0.0)
            l.data.transform(Matrix.Rotation(a, 4, 'Y')); navgruppe.append(l)
    vinge = slaa('vinge', navgruppe); vinge.data.transform(Matrix.Translation((0, 0, 6.6))); pivot(vinge, (0, -1.4, 6.6))
    kropp = slaa('molle_kropp', d)
    r = H.rot_node('molle'); H.forelder([kropp, vinge], r)
    return r

def drivhus():
    tre = mat('drivhus_tre', '#fbf6ec', 0.6); glass = mat('glass_d', '#d9f2ff', 0.05, alfa=0.3); jord = mat('jord', '#6b4a32', 0.95)
    d = [kasse('dbunn', mat('dsokkel', '#9a6b45', 0.8), (0, 0, 0.2), (5.0, 3.4, 0.4), 0.05)]
    for x in (-2.45, -0.8, 0.8, 2.45):
        for y in (-1.65, 1.65): d.append(kasse('dst', tre, (x, y, 1.4), (0.12, 0.12, 2.0), 0.02))
    for y in (-1.65, 1.65): d.append(kasse('dlist', tre, (0, y, 2.4), (5.0, 0.12, 0.12), 0.02))
    for s in (-1, 1):
        g = kasse('dtak%d' % s, glass, (0, s * 0.85, 2.9), (5.0, 1.95, 0.04), 0.0, rot=(s * 0.55, 0, 0)); d.append(g)
    for y in (-1.66, 1.66): d.append(kasse('dvegg', glass, (0, y, 1.4), (4.9, 0.03, 2.0), 0.0))
    for x in (-2.46, 2.46): d.append(kasse('dside', glass, (x, 0, 1.4), (0.03, 3.3, 2.0), 0.0))
    d.append(kasse('bed', jord, (0, 0, 0.55), (4.4, 1.2, 0.3), 0.05))
    plante = mat('plante', '#5fb84a', 0.7); tomat = mat('tomat_d', '#e8463a', 0.4)
    for i in range(6):
        x = -1.9 + i * 0.76
        d += lov('pl%d' % i, plante, [((x, 0, 1.0), 0.32)], frø=i)
        d.append(prim('kule', 'tom%d' % i, tomat, (x + 0.15, -0.2, 1.05), (0.1,) * 3, segments=10, ring_count=8))
    return rot('drivhus', d)

def taarn():
    tre = mat('taarn_tre', '#9a6b45', 0.8); plank = mat('planke_lys', '#c99a63', 0.8); rod = mat('laave_rod', ROD, 0.75)
    d = []
    for sx in (-1, 1):
        for sy in (-1, 1): d.append(kasse('ben', tre, (sx * 1.1, sy * 1.1, 4.5), (0.28, 0.28, 9.0), 0.04, rot=(sy * 0.03, -sx * 0.03, 0)))
    for z in (2.5, 5.5):
        for s in (-1, 1):
            d.append(kasse('kryss', tre, (0, s * 1.1, z), (0.14, 0.14, 3.2), 0.02, rot=(0, 0.75, 0)))
            d.append(kasse('kryss2', tre, (s * 1.1, 0, z), (0.14, 0.14, 3.2), 0.02, rot=(0.75, 0, 0)))
    d.append(kasse('plattform', plank, (0, 0, 9.0), (3.2, 3.2, 0.25), 0.04))
    for s in (-1, 1):
        d.append(kasse('rekk', plank, (0, s * 1.5, 9.6), (3.0, 0.1, 0.1), 0.02)); d.append(kasse('rekk2', plank, (s * 1.5, 0, 9.6), (0.1, 3.0, 0.1), 0.02))
    t = prim('kjegle', 'ttak', rod, (0, 0, 10.9), (1.0, 1.0, 0.8), vertices=4, radius1=2.3, radius2=0.05, depth=2)
    t.data.transform(Matrix.Translation((0, 0, -10.9))); t.data.transform(Matrix.Rotation(math.pi / 4, 4, 'Z')); t.data.transform(Matrix.Translation((0, 0, 10.9)))
    for sx in (-1, 1):
        for sy in (-1, 1): d.append(kasse('tst', tre, (sx * 1.3, sy * 1.3, 9.9), (0.14, 0.14, 1.6), 0.02))
    d.append(t)
    return rot('taarn', d)

def gjerde_deler():
    tre = mat('gjerde_tre', '#fbf6ec', 0.6)
    st = kasse('gjerde_stolpe_k', tre, (0, 0, 0.6), (0.18, 0.18, 1.2), 0.04)
    topp = prim('kjegle', 'stolpetopp', tre, (0, 0, 1.26), (0.13, 0.13, 0.08), vertices=4, depth=2)
    topp.data.transform(Matrix.Translation((0, 0, -1.26))); topp.data.transform(Matrix.Rotation(math.pi / 4, 4, 'Z')); topp.data.transform(Matrix.Translation((0, 0, 1.26)))
    stolpe = rot('gjerde_stolpe', [st, topp])
    ledd = rot('gjerde_ledd', [kasse('lekt1', tre, (1.2, 0, 0.95), (2.4, 0.08, 0.16), 0.03), kasse('lekt2', tre, (1.2, 0, 0.5), (2.4, 0.08, 0.16), 0.03)])
    return stolpe, ledd

def hoyball():
    hoy = mat('hoy', '#f0cf6a', 0.9); band = mat('band', '#c4502f', 0.7)
    s = prim('syl', 'ball', hoy, (0, 0, 0.6), (0.6, 0.6, 0.55), (math.pi / 2, 0, 0), vertices=24, ss=1)
    ujevn(s, 0.025, 6, 2)
    return rot('hoyball', [s, prim('torus', 'b1', band, (0, 0.25, 0.6), (1, 1, 1), (math.pi / 2, 0, 0), major_radius=0.62, minor_radius=0.025, major_segments=32, minor_segments=6),
                            prim('torus', 'b2', band, (0, -0.25, 0.6), (1, 1, 1), (math.pi / 2, 0, 0), major_radius=0.62, minor_radius=0.025, major_segments=32, minor_segments=6)])

def kasse_epler():
    tre = mat('kasse_tre', '#b07a45', 0.8); eple = mat('eple', '#e8343c', 0.35); eple2 = mat('eple_gronn', '#9ad14a', 0.4)
    d = []
    for s in (-1, 1):
        d.append(kasse('ks', tre, (s * 0.5, 0, 0.3), (0.06, 0.7, 0.6), 0.01)); d.append(kasse('kf', tre, (0, s * 0.35, 0.3), (1.0, 0.06, 0.6), 0.01))
    d.append(kasse('kb', tre, (0, 0, 0.04), (1.0, 0.7, 0.06), 0.01))
    for i in range(12): d.append(prim('kule', 'e%d' % i, eple if i % 3 else eple2, ((i % 4 - 1.5) * 0.22, (i // 4 - 1) * 0.2, 0.6), (0.11,) * 3, segments=12, ring_count=8))
    return rot('kasse', d)

if __name__ == '__main__':
    H.nullstill(); H.MATS.clear()
    alle = [tre_eik(), tre_eple(), tre_gran(), busk('busk_1', '#5aae43'), busk('busk_2', '#4f9e3d', '#ff6f9a'), stein('stein_1', (0.9, 0.7, 0.6), 1), stein('stein_2', (0.5, 0.45, 0.4), 4),
            blomst('blomst_rod', '#ff5f6d'), blomst('blomst_gul', '#ffd43b'), blomst('blomst_hvit', '#fbfbff'), gress(), laave(), silo(), honsehus(), molle(), drivhus(), taarn(), *gjerde_deler(), hoyball(), kasse_epler()]
    # Hver ressurs sin egen rotnode, plassert i origo
    for o in list(bpy.context.scene.objects):
        if o.parent is None and o.type == 'MESH' and o.name not in [a.name for a in alle if a]: print('løs del', o.name)
    sti = os.path.join(UT, 'miljo.glb')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=sti, export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_texcoords=False, export_normals=True, export_materials='EXPORT', export_animations=False)
    n = 0
    for o in bpy.context.scene.objects:
        if o.type == 'MESH': o.data.calc_loop_triangles(); n += len(o.data.loop_triangles); print('  ', o.name, len(o.data.loop_triangles))
    print('EKSPORT miljo trekanter', n, 'fil', os.path.getsize(sti))
