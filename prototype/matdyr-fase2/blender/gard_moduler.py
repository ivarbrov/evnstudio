"""Matdyr-regn fase 2: moduler til gårdsbygningen (låvepreg) og tunet, eksportert som gard.glb.

Spillet setter modulene sammen langs den faste geometrien (etasjer, plasser og spiralrampe), så spillfunksjonene er uendret.
Alle moduler står i origo og har faste mål:
- stolpe_fot   steinfot 0,9 × 0,9, høyde 0,5 (toppen ved y = 0,5)
- stolpe_skaft rød stolpe 0,5 × 0,5, høyde 1 (skaleres i høyden), bunn i y = 0
- knebaand     rødt skråbånd fra (0, 0) til (1, 1) i XY-planet (x ut, y opp)
- bjelke       rød bjelke langs X med lengde 1 (skaleres), 0,36 høy, 0,3 dyp, hvit list nederst
- rekkverk     hvitt rekkverk langs X med lengde 2, høyde 1,15, med stolpe i x = 0
- rekk_stolpe  én rekkverksstolpe med topp
- bue          fjøsbue langs X med bredde 1 (skaleres), fra y = 0 til 1,6, med hvit kant rundt buen
- lykt         lykt på arm; festet i origo, lykta henger ut langs +Z
- blomsterkasse lengde 1,4 langs X, åpen mot +Y med blomster
- portbue      treport med skilt, innvendig bredde 3,5 og fri høyde 4,0, åpning langs X
- heller       klynge flate steiner på 2 × 2 m
- kjerre, tonne, hoyball_firk, vaerhane
Kjør: python3 gard_moduler.py <utmappe>
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix, Euler, noise
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
import miljo_ressurser as MR

UT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else '/tmp/matdyr_glb'
mat, prim, kurve, slaa, pivot, glatt, sett_mat, bruk_mod, ny_obj = H.mat, H.prim, H.kurve, H.slaa_sammen, H.pivot, H.glatt, H.sett_mat, H.bruk_mod, H.ny_obj
kasse = MR.kasse
r = random.Random(21)
ROD, ROD_M, HVIT, STEIN, STEIN_M, TRE, SMI = '#c63c31', '#9c2b24', '#fbf6ec', '#a9a49b', '#8b867e', '#a8723f', '#2e2b2f'

def stein_klump(navn, m, c, st, frø):
    k = prim('iko', navn, m, c, st, subdivisions=2)
    for v in k.data.vertices: v.co += (v.co - Vector(c)).normalized() * 0.04 * noise.noise(v.co * 6 + Vector((frø, 0, 0)))
    glatt(k); return k

def stolpe_fot():
    s, s2 = mat('stein', STEIN, 0.9), mat('stein_mork', STEIN_M, 0.9)
    d = [kasse('fotkjerne', s2, (0, 0, 0.2), (0.78, 0.78, 0.4), 0.05)]
    i = 0
    for z, n in [(0.1, 4), (0.32, 4)]:
        for k in range(n):
            a = k * math.pi / 2 + (0.4 if z > 0.2 else 0)
            for t in (-0.22, 0.22):
                x = math.cos(a) * 0.4 + -math.sin(a) * t; y = math.sin(a) * 0.4 + math.cos(a) * t
                d.append(stein_klump('fs%d' % i, s if i % 3 else s2, (x * 0.98, y * 0.98, z), (0.17, 0.16, 0.12), i)); i += 1
    d.append(kasse('fottopp', s, (0, 0, 0.47), (0.86, 0.86, 0.08), 0.03))
    return H.slaa_sammen('stolpe_fot', d)

def stolpe_skaft():
    rod = mat('rod_maling', ROD, 0.62)
    o = kasse('stolpe_skaft', rod, (0, 0, 0.5), (0.5, 0.5, 1.0), 0.06)
    return o

def knebaand():
    rod = mat('rod_maling', ROD, 0.62)
    o = kasse('knebaand', rod, (0, 0, 0), (1.45, 0.22, 0.22), 0.03)
    o.data.transform(Matrix.Rotation(math.radians(-45), 4, 'Y')); o.data.transform(Matrix.Translation((0.5, 0, 0.5)))
    # Blender Z er opp; modulen skal ha y opp i three: X ut, Z opp her blir X ut, Y opp etter eksport
    return o

def bjelke():
    rod, hvit = mat('rod_maling', ROD, 0.62), mat('hvit_maling', HVIT, 0.55)
    return slaa('bjelke', [kasse('bj', rod, (0.5, 0, 0.0), (1.0, 0.3, 0.36), 0.03), kasse('bjlist', hvit, (0.5, -0.155, -0.15), (1.0, 0.05, 0.07), 0.01)])

def rekkverk():
    hvit = mat('hvit_maling', HVIT, 0.55)
    d = [kasse('rs', hvit, (0, 0, 0.55), (0.16, 0.16, 1.1), 0.03), prim('kule', 'rsk', hvit, (0, 0, 1.16), (0.11, 0.11, 0.07), segments=10, ring_count=6)]
    d.append(kasse('topplist', hvit, (1.0, 0, 1.05), (2.0, 0.2, 0.09), 0.03))
    d.append(kasse('midtlist', hvit, (1.0, 0, 0.62), (2.0, 0.08, 0.1), 0.0))
    d.append(kasse('bunnlist', hvit, (1.0, 0, 0.18), (2.0, 0.08, 0.1), 0.0))
    for x in (0.5, 1.0, 1.5): d.append(kasse('sprosse', hvit, (x, 0, 0.62), (0.06, 0.06, 0.86), 0.0))
    return slaa('rekkverk', d)

def rekk_list():
    """Bare håndløper og mellomlist (lengde 2 langs X), uten stolper. Brukes langs rampa, der stolpene står loddrett for seg."""
    hvit = mat('hvit_maling', HVIT, 0.55)
    return slaa('rekk_list', [kasse('rl_topp', hvit, (1.0, 0, 1.05), (2.0, 0.2, 0.09), 0.03), kasse('rl_midt', hvit, (1.0, 0, 0.6), (2.0, 0.08, 0.1), 0.0)])

def rekkverk_enkel():
    """Roligere rekkverk for de øverste nivåene: stolpe, håndløper og én mellomlist."""
    hvit = mat('hvit_maling', HVIT, 0.55)
    return slaa('rekkverk_enkel', [kasse('re_s', hvit, (0, 0, 0.55), (0.14, 0.14, 1.1), 0.02), kasse('re_t', hvit, (1.0, 0, 1.05), (2.0, 0.16, 0.08), 0.02), kasse('re_m', hvit, (1.0, 0, 0.6), (2.0, 0.07, 0.08), 0.0)])

def rekk_stolpe():
    hvit = mat('hvit_maling', HVIT, 0.55)
    return slaa('rekk_stolpe', [kasse('rs2', hvit, (0, 0, 0.55), (0.16, 0.16, 1.1), 0.03), prim('kule', 'rsk2', hvit, (0, 0, 1.16), (0.11, 0.11, 0.07), segments=10, ring_count=6)])

def bue():
    """Fjøsbue: rødt plankefelt med rund åpning nedover og hvit kant langs buen. Bredde 1 langs X, høyde 1,6."""
    rod, hvit = mat('rod_planke', ROD, 0.7), mat('hvit_maling', HVIT, 0.55)
    me = bpy.data.meshes.new('bue'); bm = bmesh.new()
    n = 16; hbue = 1.0   # buens høyde (fra bunnen av feltet)
    ytre = [(0.0, 0.0), (0.0, 1.6), (1.0, 1.6), (1.0, 0.0)]
    bue_pts = [(0.5 - 0.5 * math.cos(math.pi * i / n), 0.15 + hbue * math.sin(math.pi * i / n) ** 0.8) for i in range(n + 1)]
    # Felt mellom buen og toppen: lag firkanter fra buen opp til toppkanten
    for i in range(n):
        (x0, y0), (x1, y1) = bue_pts[i], bue_pts[i + 1]
        vs = [bm.verts.new((x0, -0.08, y0)), bm.verts.new((x1, -0.08, y1)), bm.verts.new((x1, -0.08, 1.6)), bm.verts.new((x0, -0.08, 1.6))]
        bm.faces.new(vs)
        vb = [bm.verts.new((x0, 0.08, y0)), bm.verts.new((x1, 0.08, y1)), bm.verts.new((x1, 0.08, 1.6)), bm.verts.new((x0, 0.08, 1.6))]
        bm.faces.new(vb[::-1])
        bm.faces.new([bm.verts.new((x0, -0.08, y0)), bm.verts.new((x0, 0.08, y0)), bm.verts.new((x1, 0.08, y1)), bm.verts.new((x1, -0.08, y1))])
    bm.to_mesh(me); bm.free(); o = ny_obj('buefelt', me); sett_mat(o, rod)
    # Stående plankefuger i feltet
    d = [o]
    for x in [0.08, 0.25, 0.42, 0.58, 0.75, 0.92]:
        top = 1.6; bunn = 0.15 + hbue * math.sin(math.pi * x) ** 0.8 if 0 < x < 1 else 0.15
        if top - bunn > 0.06: d.append(kasse('fuge', mat('rod_mork', ROD_M, 0.75), (x, -0.085, (top + bunn) / 2), (0.02, 0.01, top - bunn), 0.0))
    d.append(kurve('buekant', [(bx, -0.1, by) for bx, by in bue_pts[::2]] + [(bue_pts[-1][0], -0.1, bue_pts[-1][1])], 0.045, hvit, rund=6, opp=3))
    d.append(kasse('buetopp', hvit, (0.5, -0.1, 1.55), (1.02, 0.06, 0.1), 0.02))
    return slaa('bue', d)

def lykt():
    smi, glass = mat('smijern', SMI, 0.4, met=0.5), mat('lykt_lys', '#ffd27a', 0.3, emit=2.5)
    d = [kasse('arm', smi, (0, 0.22, 0), (0.06, 0.44, 0.06), 0.01), kasse('krok', smi, (0, 0.44, -0.08), (0.04, 0.04, 0.18), 0.0)]
    d.append(kasse('lyktglass', glass, (0, 0.44, -0.32), (0.2, 0.2, 0.26), 0.02))
    for sx in (-1, 1):
        for sy in (-1, 1): d.append(kasse('ramme', smi, (sx * 0.105, 0.44 + sy * 0.105, -0.32), (0.03, 0.03, 0.3), 0.0))
    d.append(prim('kjegle', 'lykttak', smi, (0, 0.44, -0.14), (0.17, 0.17, 0.08), vertices=4, depth=2))
    d.append(kasse('lyktbunn', smi, (0, 0.44, -0.47), (0.24, 0.24, 0.04), 0.01))
    o = slaa('lykt', d)
    o.data.transform(Matrix.Rotation(math.pi, 4, 'Z'))   # armen peker ut langs -Y i Blender → +Z i three
    return o

def blomsterkasse():
    tre, jord = mat('kasse_tre', '#b37a45', 0.8), mat('jord_m', '#5b3e27', 0.95)
    d = [kasse('bk', tre, (0, 0, 0.15), (1.4, 0.35, 0.3), 0.03), kasse('bkj', jord, (0, 0, 0.29), (1.3, 0.27, 0.04), 0.0)]
    lov = mat('blomst_lov', '#4f9e3a', 0.7)
    farger = ['#ff5f8a', '#ffd43b', '#ffffff', '#ff8a3d', '#c77dff']
    for i in range(9):
        x = -0.58 + i * 0.145; z = 0.33 + r.uniform(0, 0.08)
        d.append(prim('iko', 'bl%d' % i, lov, (x, r.uniform(-0.05, 0.05), z), (0.1, 0.09, 0.08), subdivisions=1))
        if i % 2 == 0 or r.random() < 0.5:
            f = mat('blomst_' + farger[i % 5], farger[i % 5], 0.5)
            d.append(prim('iko', 'bh%d' % i, f, (x + 0.03, r.uniform(-0.08, 0.02), z + 0.1), (0.06, 0.06, 0.045), subdivisions=1))
    for i in range(4):   # litt som henger over kanten
        d.append(prim('iko', 'heng%d' % i, lov, (-0.45 + i * 0.3, -0.19, 0.2), (0.07, 0.05, 0.1), subdivisions=1))
    return slaa('blomsterkasse', d)

def portbue():
    tre, tre_m, gul, hvit = mat('port_tre', '#b07a45', 0.75), mat('port_tre_m', '#8a5a33', 0.8), mat('skilt_gul', '#ffcf33', 0.45), mat('hvit_maling', HVIT, 0.55)
    B, Hf = 3.5, 4.0
    d = []
    for s in (-1, 1):
        d.append(kasse('portstolpe', tre_m, (s * (B / 2 + 0.15), 0, (Hf + 0.5) / 2), (0.3, 0.3, Hf + 0.5), 0.04))
        d.append(prim('kule', 'stolpeknott', gul, (s * (B / 2 + 0.15), 0, Hf + 0.62), (0.13,) * 3, segments=12, ring_count=8))
    # Buet overligger av to lag tre
    pts = [((i / 12 - 0.5) * (B + 0.6), 0, Hf + 0.15 + 0.35 * math.sin(math.pi * i / 12)) for i in range(13)]
    d.append(kurve('overligger', pts, 0.13, tre, rund=6, opp=3))
    d.append(kasse('skilt', gul, (0, -0.1, Hf + 0.15), (1.4, 0.08, 0.42), 0.03))
    d.append(kasse('skiltkant', hvit, (0, -0.06, Hf + 0.15), (1.52, 0.06, 0.54), 0.03))
    for s in (-1, 1):
        d.append(prim('iko', 'ranke%d' % s, mat('blomst_lov', '#4f9e3a', 0.7), (s * (B / 2 + 0.15), -0.12, Hf - 0.3), (0.22, 0.12, 0.3), subdivisions=2))
        d.append(prim('iko', 'rankeblomst%d' % s, mat('blomst_#ff5f8a', '#ff5f8a', 0.5), (s * (B / 2 + 0.1), -0.25, Hf - 0.2), (0.07,) * 3, subdivisions=1))
    return slaa('portbue', d)

def heller():
    s, s2 = mat('helle', '#a39c90', 0.85), mat('helle_m', '#8a8378', 0.85)
    d = []
    for i in range(7):
        x, y = r.uniform(-0.75, 0.75), r.uniform(-0.75, 0.75)
        k = prim('kule', 'h%d' % i, s if i % 3 else s2, (x, y, 0.03), (r.uniform(0.28, 0.42), r.uniform(0.24, 0.36), 0.05), (0, 0, r.uniform(0, 3)), segments=10, ring_count=4)
        for v in k.data.vertices:
            if v.co.z < 0.03: v.co.z = 0.0
        d.append(k)
    return slaa('heller', d)

def kjerre():
    tre, tre_m, gul = mat('kjerre_tre', '#b37a45', 0.8), mat('kjerre_m', '#7a4e2c', 0.8), mat('gulrot', '#ff8a2a', 0.5)
    d = [kasse('kasse', tre, (0, 0, 0.75), (1.6, 1.0, 0.45), 0.04), kasse('bunn', tre_m, (0, 0, 0.52), (1.7, 1.06, 0.06), 0.02)]
    for s in (-1, 1):
        d.append(prim('torus', 'hjul%d' % s, tre_m, (0.1, s * 0.6, 0.45), (1, 1, 1), (math.pi / 2, 0, 0), major_radius=0.4, minor_radius=0.06, major_segments=20, minor_segments=6))
        for k in range(4):
            e = kasse('eike', tre_m, (0.1, s * 0.6, 0.45), (0.8, 0.04, 0.04), 0.0); e.data.transform(Matrix.Translation((-0.1, -s * 0.6, -0.45))); e.data.transform(Matrix.Rotation(k * math.pi / 4, 4, 'Y')); e.data.transform(Matrix.Translation((0.1, s * 0.6, 0.45))); d.append(e)
        d.append(kasse('handtak%d' % s, tre_m, (-1.3, s * 0.35, 0.75), (1.2, 0.08, 0.08), 0.02, rot=(0, -0.25, 0)))
    for i in range(9):
        g = prim('kjegle', 'gulrot%d' % i, gul, (r.uniform(-0.55, 0.55), r.uniform(-0.3, 0.3), 1.0), (0.07, 0.07, 0.22), (r.uniform(1.2, 1.9), 0, r.uniform(0, 6)), vertices=8, depth=2)
        d.append(g); d.append(prim('iko', 'gulrotlov%d' % i, mat('blomst_lov', '#4f9e3a', 0.7), tuple(Vector(g.data.vertices[0].co)), (0.06, 0.06, 0.06), subdivisions=1))
    return slaa('kjerre', d)

def tonne():
    tre, jern = mat('tonne_tre', '#a86b3a', 0.75), mat('jern_m', '#5b5f66', 0.5, met=0.5)
    t = prim('syl', 'tonne', tre, (0, 0, 0.5), (0.38, 0.38, 0.5), vertices=20)
    for v in t.data.vertices: f = 1 + 0.12 * math.sin(math.pi * max(0, min(1, v.co.z))); v.co.x *= f; v.co.y *= f
    glatt(t)
    return slaa('tonne', [t] + [prim('torus', 'b%d' % k, jern, (0, 0, z), (1, 1, 1), major_radius=0.4 + 0.04 * math.sin(math.pi * z), minor_radius=0.02, major_segments=24, minor_segments=4) for k, z in enumerate((0.18, 0.82))])

def hoyball_firk():
    hoy, band = mat('hoy_f', '#efcf6b', 0.9), mat('hoyband', '#b8862f', 0.8)
    b = kasse('ball', hoy, (0, 0, 0.35), (1.1, 0.7, 0.7), 0.08)
    for v in b.data.vertices: v.co += v.normal * 0.02 * noise.noise(v.co * 8)
    d = [b] + [kasse('band', band, (x, 0, 0.35), (0.04, 0.72, 0.72), 0.02) for x in (-0.3, 0.3)]
    for i in range(10):
        d.append(kurve('straa%d' % i, [(r.uniform(-0.5, 0.5), -0.36, r.uniform(0.1, 0.65)), (r.uniform(-0.5, 0.5), -0.42, r.uniform(0.1, 0.7))], 0.012, hoy, rund=3, opp=1))
    return slaa('hoyball_firk', d)

def vaerhane():
    smi, gul = mat('smijern', SMI, 0.4, met=0.5), mat('hane_gull', '#e8b13a', 0.35, met=0.6)
    d = [kasse('stang', smi, (0, 0, 0.6), (0.05, 0.05, 1.2), 0.0)]
    for a in range(4): d.append(kasse('pil%d' % a, smi, (0, 0, 0.55), (0.9 if a % 2 == 0 else 0.03, 0.03 if a % 2 == 0 else 0.9, 0.03), 0.0))
    d.append(prim('kule', 'hanekropp', gul, (0, 0, 1.35), (0.28, 0.06, 0.16), segments=12, ring_count=8))
    d.append(prim('kule', 'hanehode', gul, (0.2, 0, 1.5), (0.08, 0.05, 0.09), segments=10, ring_count=6))
    d.append(prim('kjegle', 'hanehale', gul, (-0.25, 0, 1.45), (0.12, 0.04, 0.16), (0, 0.6, 0), vertices=6, depth=2))
    return slaa('vaerhane', d)

if __name__ == '__main__':
    H.nullstill(); H.MATS.clear()
    alle = [stolpe_fot(), stolpe_skaft(), knebaand(), bjelke(), rekkverk(), rekk_list(), rekkverk_enkel(), rekk_stolpe(), bue(), lykt(), blomsterkasse(), portbue(), heller(), kjerre(), tonne(), hoyball_firk(), vaerhane()]
    sti = os.path.join(UT, 'gard.glb')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=sti, export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_texcoords=False, export_normals=True, export_materials='EXPORT', export_animations=False)
    n = 0
    for o in bpy.context.scene.objects:
        if o.type == 'MESH': o.data.calc_loop_triangles(); n += len(o.data.loop_triangles); print('  ', o.name, len(o.data.loop_triangles))
    print('EKSPORT gard trekanter', n, 'fil', os.path.getsize(sti))
