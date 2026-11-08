"""Matdyr-regn fase 2: fem mat- og dyrehybrider modellert i Blender (bpy), eksportert som GLB.

Designprinsipp (Ivar 8.11.2026): maten ER kroppen. Matvaren bestemmer kroppens form, proporsjoner og silhuett,
og dyret kjennes igjen på hode, ansikt, bein, hale og andre kjennetegn.

Kjør: python3 matdyr_hybrider.py <utmappe>
Hver figur får egne noder for delene som animeres i spillet (hode, bein_*, hale, vinge_*), med pivot i leddet.
Figuren vender mot -Y i Blender, som blir +Z i glTF/three.js. Høyden er cirka 1,6 enheter.
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix, Euler

UT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else '/tmp/matdyr_glb'
os.makedirs(UT, exist_ok=True)

# ---------------------------------------------------------------- hjelpere
def nullstill():
    bpy.ops.wm.read_factory_settings(use_empty=True)

MATS = {}
def mat(navn, farge, ru=0.6, met=0.0, alfa=1.0, emit=None):
    if navn in MATS: return MATS[navn]
    m = bpy.data.materials.new(navn)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    r, g, bl = (int(farge[i:i + 2], 16) / 255 for i in (1, 3, 5))
    srgb = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    b.inputs['Base Color'].default_value = (srgb(r), srgb(g), srgb(bl), 1)
    b.inputs['Roughness'].default_value = ru
    b.inputs['Metallic'].default_value = met
    if alfa < 1:
        b.inputs['Alpha'].default_value = alfa
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
        if hasattr(m, 'blend_method'): m.blend_method = 'BLEND'
    if emit:
        b.inputs['Emission Color'].default_value = (srgb(r), srgb(g), srgb(bl), 1)
        b.inputs['Emission Strength'].default_value = emit
    MATS[navn] = m
    return m

def ny_obj(navn, me):
    o = bpy.data.objects.new(navn, me)
    bpy.context.scene.collection.objects.link(o)
    return o

def glatt(o):
    for p in o.data.polygons: p.use_smooth = True
    return o

def bruk_mod(o):
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    o.modifiers.clear(); o.data = me
    return o

def subsurf(o, niva=1):
    m = o.modifiers.new('ss', 'SUBSURF'); m.levels = niva; m.render_levels = niva
    return bruk_mod(o)

def sett_mat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
    return o

def prim(kind, navn, m, loc=(0, 0, 0), skala=(1, 1, 1), rot=(0, 0, 0), ss=0, **kw):
    fn = {'kule': bpy.ops.mesh.primitive_uv_sphere_add, 'iko': bpy.ops.mesh.primitive_ico_sphere_add,
          'syl': bpy.ops.mesh.primitive_cylinder_add, 'kjegle': bpy.ops.mesh.primitive_cone_add,
          'torus': bpy.ops.mesh.primitive_torus_add, 'kube': bpy.ops.mesh.primitive_cube_add}[kind]
    fn(**kw)
    o = bpy.context.active_object; o.name = navn
    o.data.transform(Matrix.Diagonal((*skala, 1)))
    o.data.transform(Euler(rot).to_matrix().to_4x4())
    o.data.transform(Matrix.Translation(loc))
    o.location = (0, 0, 0)
    if ss: subsurf(o, ss)
    glatt(o); sett_mat(o, m)
    return o

def kurve(navn, punkter, tykk, m, rund=6, lukket=False, opp=8, avsmal=None):
    cu = bpy.data.curves.new(navn, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = tykk; cu.bevel_resolution = max(1, rund // 2); cu.resolution_u = opp; cu.use_fill_caps = True
    sp = cu.splines.new('NURBS'); sp.points.add(len(punkter) - 1)
    for i, p in enumerate(punkter): sp.points[i].co = (*p, 1)
    sp.use_endpoint_u = True; sp.order_u = min(4, len(punkter)); sp.use_cyclic_u = lukket
    if avsmal:
        for i, pt in enumerate(sp.points): pt.radius = avsmal(i / max(1, len(punkter) - 1))
    o = ny_obj(navn + '_k', cu)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    bpy.data.objects.remove(o)
    o = ny_obj(navn, me); glatt(o); sett_mat(o, m)
    return o

def slaa_sammen(navn, deler):
    deler = [d for d in deler if d]
    if not deler: return None
    bpy.ops.object.select_all(action='DESELECT')
    for d in deler: d.select_set(True)
    bpy.context.view_layer.objects.active = deler[0]
    bpy.ops.object.join()
    o = bpy.context.active_object; o.name = navn
    return o

def pivot(o, punkt):
    """Flytter objektets origo til punkt (leddet) uten å flytte geometrien."""
    o.data.transform(Matrix.Translation(-Vector(punkt)))
    o.location = Vector(punkt)
    return o

def forelder(barn, rot):
    for b in barn:
        if b is None: continue
        mw = b.matrix_world.copy(); b.parent = rot; b.matrix_world = mw

# Felles ansikt i EVN-stil: store blanke øyne med to lyspunkter, rosa kinn og et lite smil
SVART = None
def oye(navn, pos, r, retning=Vector((0, -1, 0)), hvitt=False):
    deler = []
    if hvitt:
        deler.append(prim('kule', navn + '_hvit', mat('oyehvit', '#ffffff', 0.25), pos, (r * 1.18,) * 3, segments=24, ring_count=16))
    sentrum = Vector(pos) + retning * (r * 0.22 if hvitt else 0)
    deler.append(prim('kule', navn + '_pupill', mat('oye', '#1b1726', 0.08), sentrum, (r, r, r), segments=24, ring_count=16))
    lys = sentrum + retning * r * 0.82 + Vector((r * 0.3, 0, r * 0.38))
    deler.append(prim('kule', navn + '_lys1', mat('oyelys', '#ffffff', 0.2, emit=0.6), lys, (r * 0.32,) * 3, segments=12, ring_count=8))
    deler.append(prim('kule', navn + '_lys2', mat('oyelys', '#ffffff', 0.2, emit=0.6), sentrum + retning * r * 0.85 + Vector((-r * 0.28, 0, -r * 0.3)), (r * 0.15,) * 3, segments=10, ring_count=6))
    return deler

def kinn(navn, pos, r, rot=(0, 0, 0)):
    return prim('kule', navn, mat('kinn', '#ff8fa6', 0.7), pos, (r, r * 0.35, r * 0.7), rot, segments=16, ring_count=10)

def smil(navn, senter, bredde, m=None, tykk=0.012):
    x, y, z = senter
    pts = [(x - bredde, y, z + bredde * 0.25), (x - bredde * 0.5, y - 0.005, z - bredde * 0.18), (x, y - 0.008, z - bredde * 0.28), (x + bredde * 0.5, y - 0.005, z - bredde * 0.18), (x + bredde, y, z + bredde * 0.25)]
    return kurve(navn, pts, tykk, m or mat('munn', '#3a1f24', 0.6), rund=4, opp=6)

rnd = random.Random(7)

def strossel(navn, punkter, farger, lengde=0.06, r=0.012):
    """Små avrundede staver som legger seg langs overflaten."""
    per = {f: [] for f in farger}
    for i, (p, n) in enumerate(punkter):
        f = farger[i % len(farger)]
        t = n.orthogonal().normalized(); t.rotate(Matrix.Rotation(rnd.uniform(0, math.pi), 3, n))
        a, b = p - t * lengde / 2 + n * r, p + t * lengde / 2 + n * r
        per[f].append(kurve(navn + str(i), [tuple(a), tuple((a + b) / 2), tuple(b)], r, mat('str_' + f, f, 0.35), rund=4, opp=2))
    return [slaa_sammen(navn + f, l) for f, l in per.items() if l]

def overflatepunkter(o, n, filt):
    """Tilfeldige punkter (og normaler) på flatene til o som oppfyller filt(p, normal)."""
    me = o.data; mw = o.matrix_world
    flater = [p for p in me.polygons if filt(mw @ p.center, (mw.to_3x3() @ p.normal).normalized())]
    ut = []
    for _ in range(n):
        if not flater: break
        p = rnd.choice(flater)
        ut.append((mw @ p.center, (mw.to_3x3() @ p.normal).normalized()))
    return ut

def eksporter(rot, navn):
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects: o.select_set(True)
    sti = os.path.join(UT, navn + '.glb')
    bpy.ops.export_scene.gltf(filepath=sti, export_format='GLB', use_selection=True, export_apply=True,
                              export_yup=True, export_texcoords=True, export_normals=True, export_materials='EXPORT',
                              export_animations=False)
    def tell():
        n = 0
        for o in bpy.context.scene.objects:
            if o.type == 'MESH': o.data.calc_loop_triangles(); n += len(o.data.loop_triangles)
        return n
    tri = tell()
    print('EKSPORT', navn, 'trekanter', tri, 'objekter', len([o for o in bpy.context.scene.objects if o.type == 'MESH']))
    # Lav detaljversjon (mobil og mange figurer samtidig): samme noder og materialer, færre trekanter
    maal = 7000
    if tri > maal:
        for o in bpy.context.scene.objects:
            if o.type != 'MESH': continue
            d = o.modifiers.new('lav', 'DECIMATE'); d.ratio = max(0.08, maal / tri); bruk_mod(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(UT, navn + '_lav.glb'), export_format='GLB', use_selection=True, export_apply=True,
                              export_yup=True, export_texcoords=True, export_normals=True, export_materials='EXPORT', export_animations=False)
    print('EKSPORT', navn + '_lav', 'trekanter', tell())

def rot_node(navn):
    r = bpy.data.objects.new(navn, None); bpy.context.scene.collection.objects.link(r)
    return r

def kuglasur_tekstur():
    import numpy as np
    B, Hh = 1024, 512
    u = (np.arange(B) + 0.5) / B; v = (np.arange(Hh) + 0.5) / Hh
    U, V = np.meshgrid(u, v)
    lys = np.array([1.0, 0.975, 0.95]); mork = np.array([0.17, 0.15, 0.19])
    maske = np.zeros((Hh, B))
    rr = random.Random(11)
    # u går rundt ringen (lengde 2π·0,5), v rundt røret (2π·0,3): skaleres så flekkene blir runde på figuren
    asp = (2 * math.pi * 0.5) / (2 * math.pi * 0.3)
    for _ in range(11):
        cu, cv, rad = rr.random(), rr.uniform(0.62, 0.95), rr.uniform(0.035, 0.07)
        for du in (-1, 0, 1):
            d = np.sqrt(((U - cu - du) * asp) ** 2 + (V - cv) ** 2)
            # litt ujevn kant, som ekte kuflekker
            vink = np.arctan2(V - cv, (U - cu - du) * asp)
            kant = rad * (1 + 0.18 * np.sin(vink * 3 + cu * 20) + 0.08 * np.sin(vink * 7))
            maske = np.maximum(maske, np.clip((kant - d) / 0.004, 0, 1))
    farge = lys[None, None, :] * (1 - maske[..., None]) + mork[None, None, :] * maske[..., None]
    img = bpy.data.images.new('kuglasur', B, Hh, alpha=False)
    srgb2lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    px = np.concatenate([farge, np.ones((Hh, B, 1))], axis=2).astype(np.float32)
    img.pixels.foreach_set(px.ravel())
    img.file_format = 'PNG'; img.pack()
    m = bpy.data.materials.new('kuglasur'); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes.get('Principled BSDF'); t = nt.nodes.new('ShaderNodeTexImage'); t.image = img
    nt.links.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.28
    return m

# ---------------------------------------------------------------- 1 Donutku
def donutku():
    nullstill(); MATS.clear()
    deig = mat('deig', '#d99a52', 0.65); deig_lys = mat('deig_lys', '#f3cf92', 0.7)
    glasur = mat('glasur', '#fffaf3', 0.28); flekk = mat('glasur_flekk', '#2b2630', 0.3)
    hvit = mat('ku_hvit', '#fbf7f2', 0.55); mule = mat('mule', '#ffb3c1', 0.5); klov = mat('klov', '#4a3529', 0.5)
    horn = mat('horn', '#f6e3b4', 0.45); sort = mat('ku_sort', '#2b2630', 0.55)
    R, r, H = 0.5, 0.27, 0.62   # donutens radius, tykkelse, høyde over bakken
    # Kroppen ER en donut: liggende ring med lys midtstripe, sett ovenfra er hullet tydelig
    kropp = prim('torus', 'deig', deig, (0, 0, H), (1, 1, 0.92), major_radius=R, minor_radius=r, major_segments=56, minor_segments=24, ss=1)
    for p in kropp.data.polygons:
        if abs(p.center.z - H) < 0.05 and (Vector((p.center.x, p.center.y)).length > R + r * 0.75): p.material_index = 1
    kropp.data.materials.append(deig_lys)
    # Glasur med kumønster som renner ned over kanten
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r + 0.028, major_segments=56, minor_segments=22)
    gl = bpy.context.active_object; gl.name = 'glasur'
    gl.data.transform(Matrix.Diagonal((1, 1, 0.92, 1))); gl.data.transform(Matrix.Translation((0, 0, H)))
    bm = bmesh.new(); bm.from_mesh(gl.data)
    drypp = [(rnd.uniform(0, 2 * math.pi), rnd.uniform(0.05, 0.16), rnd.uniform(0.12, 0.22)) for _ in range(14)]
    def grense(v):
        a = math.atan2(v.co.y, v.co.x); d = Vector((v.co.x, v.co.y)).length
        ute = d > R
        g = H + (0.02 if ute else 0.05)
        for (a0, dyp, bredde) in drypp:
            da = math.atan2(math.sin(a - a0), math.cos(a - a0))
            if ute: g -= dyp * math.exp(-(da / bredde * 3) ** 2)
        g += 0.012 * math.sin(a * 9)
        return g
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < grense(v)], context='VERTS')
    bm.to_mesh(gl.data); bm.free()
    so = gl.modifiers.new('tykk', 'SOLIDIFY'); so.thickness = 0.022; so.offset = 1
    bruk_mod(gl); subsurf(gl, 1); glatt(gl)
    # Kumønsteret er en tekstur i glasurens UV-rom, så kantene blir skarpe og runde uansett detaljnivå
    sett_mat(gl, kuglasur_tekstur())
    # Strøssel bare oppå glasuren (rosa og gult, så kumønsteret fortsatt leses)
    pk = overflatepunkter(gl, 34, lambda p, n: n.z > 0.75 and p.z > H + 0.2)
    stro = strossel('stro', pk, ['#ff6fa8', '#ffd23f', '#7fd6ff'], 0.07, 0.011)
    # Hodet sitter foran på ringen, mulen er bred og rosa
    hx, hy, hz = 0, -(R + r * 0.55), H + 0.18
    hode = [prim('kule', 'hodekule', hvit, (hx, hy - 0.08, hz + 0.04), (0.27, 0.24, 0.25), segments=40, ring_count=24, ss=0)]
    hode.append(prim('kule', 'hodeflekk', sort, (hx + 0.12, hy - 0.2, hz + 0.13), (0.12, 0.09, 0.1), segments=24, ring_count=14))
    hode.append(prim('kule', 'mule', mule, (hx, hy - 0.27, hz - 0.08), (0.22, 0.13, 0.14), segments=40, ring_count=20))
    for s in (-1, 1):
        hode.append(prim('kule', 'nese%d' % s, mat('nesebor', '#c25b78', 0.5), (hx + s * 0.075, hy - 0.395, hz - 0.06), (0.03, 0.018, 0.04), segments=12, ring_count=8))
        hode += oye('oye%d' % s, (hx + s * 0.11, hy - 0.27, hz + 0.1), 0.058)
        hode.append(kinn('kinn%d' % s, (hx + s * 0.2, hy - 0.22, hz - 0.03), 0.045))
        # Små horn som bøyer seg oppover, ører som står ut
        hode.append(kurve('horn%d' % s, [(hx + s * 0.12, hy - 0.08, hz + 0.17), (hx + s * 0.22, hy - 0.08, hz + 0.25), (hx + s * 0.26, hy - 0.1, hz + 0.36)], 0.055, horn, avsmal=lambda t: 1 - 0.7 * t))
        ore = prim('kule', 'ore%d' % s, hvit, (hx + s * 0.27, hy - 0.04, hz + 0.08), (0.12, 0.05, 0.065), (0, s * -0.3, s * 0.35), segments=20, ring_count=12)
        hode.append(ore)
        hode.append(prim('kule', 'oreinn%d' % s, mule, (hx + s * 0.28, hy - 0.075, hz + 0.08), (0.08, 0.02, 0.04), (0, s * -0.3, s * 0.35), segments=16, ring_count=10))
    hode.append(smil('smil', (hx, hy - 0.395, hz - 0.14), 0.05))
    # Glasurdråpe på panna knytter hodet til kroppen
    hode.append(prim('kule', 'luggglasur', glasur, (hx, hy - 0.12, hz + 0.22), (0.12, 0.1, 0.06), segments=24, ring_count=12))
    hode = pivot(slaa_sammen('hode', hode), (hx, hy + 0.05, hz - 0.05))
    # Bein: korte og runde, hvite med brune klover
    bein = []
    for i, (bx, by) in enumerate([(-0.3, -0.32), (0.3, -0.32), (-0.3, 0.32), (0.3, 0.32)]):
        b = [prim('syl', 'bein%d' % i, hvit, (bx, by, 0.24), (0.085, 0.085, 0.2), vertices=20, ss=1)]
        b.append(prim('kule', 'klov%d' % i, klov, (bx, by - 0.01, 0.06), (0.1, 0.1, 0.07), segments=20, ring_count=10))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], b), (bx, by, H - 0.12)))
    # Hale med svart dusk bak på ringen
    hale = [kurve('halestrå', [(0, R + r * 0.8, H + 0.05), (0, R + r * 1.2, H + 0.0), (0.03, R + r * 1.35, H - 0.18)], 0.022, hvit)]
    hale.append(prim('kule', 'haledusk', sort, (0.03, R + r * 1.38, H - 0.24), (0.06, 0.06, 0.09), segments=16, ring_count=10))
    hale = pivot(slaa_sammen('hale', hale), (0, R + r * 0.8, H + 0.05))
    kropp_all = slaa_sammen('kropp', [kropp, gl] + stro)
    rot = rot_node('Donutku'); forelder([kropp_all, hode, hale] + bein, rot)
    eksporter(rot, 'donutku')

# ---------------------------------------------------------------- 2 Burgersau
def burgersau():
    nullstill(); MATS.clear()
    brod = mat('brod', '#e39a45', 0.55); brod_lys = mat('brod_lys', '#f7d9a3', 0.7); burger = mat('burger', '#6e3a20', 0.75)
    ost = mat('ost', '#ffc531', 0.4); salat = mat('salat', '#79cf43', 0.6); tomat = mat('tomat', '#e8463a', 0.45)
    sesam = mat('sesam', '#fff3d6', 0.5); ansikt = mat('sauansikt', '#3b3442', 0.6); majo = mat('majones', '#fffdf6', 0.3)
    H0 = 0.32
    # Kroppen ER burgeren: underbrød, burger, ost, tomat, salat og et høyt overbrød. Dyret er like bredt som burgeren.
    deler = [prim('kule', 'underbrod', brod, (0, 0, H0 + 0.06), (0.52, 0.48, 0.15), segments=48, ring_count=24)]
    bm = bmesh.new(); bm.from_mesh(deler[0].data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < H0 - 0.02], context='VERTS'); bm.to_mesh(deler[0].data); bm.free()
    deler.append(prim('kule', 'underbrod_bunn', brod_lys, (0, 0, H0 - 0.0), (0.5, 0.46, 0.03), segments=48, ring_count=12))
    # Burgeren: litt ujevn kant
    b = prim('torus', 'burger', burger, (0, 0, H0 + 0.25), (1, 0.93, 1.25), major_radius=0.42, minor_radius=0.1, major_segments=64, minor_segments=20)
    for v in b.data.vertices: v.co += v.normal * 0.012 * math.sin(v.co.x * 41) * math.cos(v.co.y * 37)
    deler.append(b); deler.append(prim('syl', 'burgerfyll', burger, (0, 0, H0 + 0.25), (0.44, 0.41, 0.1), vertices=48))
    # Tomatskiver og salat med bølgekant
    deler.append(prim('syl', 'tomat', tomat, (0.14, -0.08, H0 + 0.37), (0.45, 0.42, 0.03), vertices=48, ss=1))
    sal = prim('torus', 'salat', salat, (0, 0, H0 + 0.41), (1, 0.94, 0.35), major_radius=0.46, minor_radius=0.075, major_segments=96, minor_segments=12)
    for v in sal.data.vertices:
        a = math.atan2(v.co.y, v.co.x); d = Vector((v.co.x, v.co.y)).length
        if d > 0.46: v.co.z -= 0.05 * (0.5 + 0.5 * math.sin(a * 13)); v.co.x *= 1.04; v.co.y *= 1.04
    deler.append(sal)
    # Ost som henger ned i fire hjørner
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=34, y_subdivisions=34, size=1.25)
    o = bpy.context.active_object; o.name = 'ost'
    for v in o.data.vertices:
        x, y = v.co.x * 0.98, v.co.y * 0.98; rr = math.hypot(x, y)
        # avrundede hjørner: superellipse, og et mykt heng som blir brattere utover
        sup = (abs(x / 0.55) ** 5 + abs(y / 0.55) ** 5) ** 0.2
        if sup > 1: x, y = x / sup, y / sup; rr = math.hypot(x, y)
        h = max(0, rr - 0.44); v.co.z = -(h * 1.8) ** 1.4 * 0.9
        k = 1 - min(0.25, h * 0.6); v.co.x, v.co.y = x * k, y * k
    o.data.transform(Matrix.Rotation(0.4, 4, 'Z')); o.data.transform(Matrix.Translation((0, 0, H0 + 0.36)))
    so = o.modifiers.new('t', 'SOLIDIFY'); so.thickness = 0.022; bruk_mod(o); subsurf(o, 1); glatt(o); sett_mat(o, ost); deler.append(o)
    # Overbrødet er høyt og rundt som en sauekropp
    topp = prim('kule', 'overbrod', brod, (0, 0.02, H0 + 0.46), (0.53, 0.5, 0.36), segments=56, ring_count=28)
    bm = bmesh.new(); bm.from_mesh(topp.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < H0 + 0.44], context='VERTS'); bm.to_mesh(topp.data); bm.free()
    # Brødet strekkes fram og legger seg som en lue over sauehodet
    strekk = lambda y: 0.08 * max(0.0, -(y - 0.02) / 0.52) ** 1.5
    for v in topp.data.vertices: f = strekk(v.co.y); v.co.y -= f; v.co.z -= f * 0.35
    deler.append(topp)
    # Kanten på brødet er ull: en ring av små, lyse brødtotter rundt hele luen
    for i in range(34):
        a = i * 2 * math.pi / 34; x, y = 0.53 * math.cos(a), 0.5 * math.sin(a) + 0.02; f = strekk(y)
        deler.append(prim('kule', 'ulltott%d' % i, brod_lys, (x * 1.0, y - f, H0 + 0.455 - f * 0.35), (0.075, 0.075, 0.06), segments=14, ring_count=8))
    # Sesamfrø følger kuppelen
    sesamer = []
    for i in range(46):
        u, v2 = rnd.uniform(0, 2 * math.pi), rnd.uniform(0.15, 1.15)
        n = Vector((math.cos(u) * math.sin(v2), math.sin(u) * math.sin(v2), math.cos(v2)))
        p = Vector((n.x * 0.53, n.y * 0.5 + 0.02, H0 + 0.46 + n.z * 0.36))
        f = 0.08 * max(0.0, -(p.y - 0.02) / 0.52) ** 1.5; p.y -= f; p.z -= f * 0.35
        s = prim('kule', 'sesam%d' % i, sesam, (0, 0, 0), (0.028, 0.014, 0.012), segments=8, ring_count=6)
        s.data.transform(Matrix.Rotation(rnd.uniform(0, 3), 4, 'Z')); s.data.transform(n.to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Rotation(math.pi / 2, 4, 'X') if False else Matrix())
        s.data.transform(Matrix.Translation(p)); sesamer.append(s)
    deler.append(slaa_sammen('sesamer', sesamer))
    kropp = slaa_sammen('kropp', deler)
    # Hodet stikker fram mellom brødene, med en majonesklatt som ull på toppen
    # Hodet sitter inne i burgeren, under brødluen og over salaten, så overgangen er dekket av mat
    hx, hy, hz = 0, -0.55, H0 + 0.33
    hd = [prim('kule', 'sauhode', ansikt, (hx, hy, hz), (0.2, 0.19, 0.19), segments=40, ring_count=24)]
    hd.append(prim('kule', 'snute', mat('snute', '#4a4252', 0.6), (hx, hy - 0.15, hz - 0.08), (0.13, 0.1, 0.1), segments=28, ring_count=14))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.085, hy - 0.16, hz + 0.05), 0.05, hvitt=True)
        hd.append(prim('kule', 'ore%d' % s, ansikt, (hx + s * 0.24, hy + 0.0, hz + 0.05), (0.12, 0.045, 0.055), (0, s * 0.2, s * -0.25), segments=18, ring_count=10))
        hd.append(prim('kule', 'oreinn%d' % s, mat('oreinn', '#ff9db4', 0.6), (hx + s * 0.25, hy - 0.02, hz + 0.05), (0.075, 0.015, 0.03), (0, s * 0.2, s * -0.25), segments=14, ring_count=8))
        hd.append(kinn('kinn%d' % s, (hx + s * 0.13, hy - 0.16, hz - 0.05), 0.035))
    hd.append(smil('smil', (hx, hy - 0.245, hz - 0.1), 0.035, mat('munnlys', '#ffd5dd', 0.6)))
    # Majones-ull: en myk spiral oppå hodet
    spir = [(hx + 0.12 * math.cos(t) * (1 - t / 14), hy + 0.02 + 0.12 * math.sin(t) * (1 - t / 14), hz + 0.18 + t * 0.012) for t in [i * 0.5 for i in range(24)]]
    spir = [(hx + 0.17 * math.cos(t) * (1 - t / 13), hy + 0.03 + 0.15 * math.sin(t) * (1 - t / 13), hz + 0.16 + t * 0.014) for t in [i * 0.45 for i in range(28)]]
    # Salatkrage rundt halsen knytter hodet til burgerlagene
    krage = prim('torus', 'salatkrage', salat, (hx, hy + 0.05, hz - 0.12), (1, 0.8, 0.6), (0.35, 0, 0), major_radius=0.17, minor_radius=0.05, major_segments=40, minor_segments=10)
    for v in krage.data.vertices: v.co += v.normal * 0.02 * math.sin(math.atan2(v.co.y - hy, v.co.x - hx) * 9)
    hd.append(krage)
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.15, hz - 0.05))
    bein = []
    for i, (bx, by) in enumerate([(-0.24, -0.26), (0.24, -0.26), (-0.24, 0.26), (0.24, 0.26)]):
        b = [prim('syl', 'bein%d' % i, ansikt, (bx, by, 0.16), (0.055, 0.055, 0.16), vertices=16, ss=1)]
        b.append(prim('kule', 'hov%d' % i, mat('hov', '#241f29', 0.5), (bx, by - 0.01, 0.04), (0.07, 0.075, 0.05), segments=16, ring_count=8))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], b), (bx, by, H0 + 0.02)))
    # Halen er en liten majonesklatt bak
    hale = pivot(slaa_sammen('hale', [kurve('halemajo', [(0.08 * math.cos(t), 0.55 + 0.08 * math.sin(t), H0 + 0.55 + t * 0.01) for t in [i * 0.6 for i in range(14)]], 0.035, majo, avsmal=lambda t: 1 - 0.5 * t)]), (0, 0.5, H0 + 0.5))
    rot = rot_node('Burgersau'); forelder([kropp, hode, hale] + bein, rot)
    eksporter(rot, 'burgersau')

# ---------------------------------------------------------------- 3 Pizzaskilpadde
def pizzaskilpadde():
    nullstill(); MATS.clear()
    skorpe = mat('skorpe', '#e2a45a', 0.65); saus = mat('saus', '#d8402e', 0.45); ost = mat('ost', '#ffd76a', 0.35)
    pepp = mat('pepperoni', '#c23a2b', 0.4); pepp_m = mat('pepperoni_mork', '#8e2219', 0.5); basilikum = mat('basilikum', '#3fa34d', 0.5)
    hud = mat('skilpadde', '#86cf6a', 0.55); buk = mat('buk', '#f4e7a8', 0.6)
    H = 0.28
    # Skjoldet ER en hel pizza bøyd over ryggen: skorpekanten blir skjoldkanten, delt i seks pizzastykker
    sk = prim('kule', 'skjoldbunn', saus, (0, 0, H), (0.62, 0.68, 0.42), segments=64, ring_count=32)
    bm = bmesh.new(); bm.from_mesh(sk.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < H + 0.02], context='VERTS'); bm.to_mesh(sk.data); bm.free()
    ostlag = prim('kule', 'ostlag', ost, (0, 0, H), (0.635, 0.695, 0.445), segments=72, ring_count=36)
    bm = bmesh.new(); bm.from_mesh(ostlag.data)
    def ost_grense(v):
        a = math.atan2(v.co.y, v.co.x)
        return H + 0.07 + 0.035 * math.sin(a * 7) * (0.5 + 0.5 * math.sin(a * 3 + 1)) - 0.07 * max(0, math.sin(a * 5 + 0.5)) ** 8
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < ost_grense(v)], context='VERTS')
    # Skjæringslinjer mellom stykkene: smale riller i osten
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x); k = abs(math.sin(a * 3))
        if k < 0.09 and v.co.z < H + 0.41: v.co -= Vector((v.co.x, v.co.y, 0.6 * (v.co.z - H))).normalized() * 0.035 * (1 - k / 0.09)
    bm.to_mesh(ostlag.data); bm.free(); subsurf(ostlag, 1); glatt(ostlag)
    kant = prim('torus', 'skorpekant', skorpe, (0, 0, H + 0.03), (1.0, 1.09, 1.0), major_radius=0.62, minor_radius=0.085, major_segments=96, minor_segments=20)
    for v in kant.data.vertices: v.co += v.normal * 0.01 * math.sin(math.atan2(v.co.y, v.co.x) * 23)
    # Pepperoni som skjoldplater, bøyd etter kuppelen
    pp = []
    plass = [(0, 0), (0.0, 0.62), (1.05, 0.55), (2.1, 0.62), (3.15, 0.55), (4.2, 0.62), (5.25, 0.55)]
    for i, (a, v2) in enumerate(plass):
        n = Vector((math.cos(a) * math.sin(v2), math.sin(a) * math.sin(v2), math.cos(v2)))
        p = Vector((n.x * 0.6, n.y * 0.66, H + n.z * 0.43))
        rr = 0.13 if i == 0 else 0.11
        d = prim('syl', 'pepp%d' % i, pepp, (0, 0, 0), (rr, rr, 0.018), vertices=32, ss=1)
        q = n.to_track_quat('Z', 'Y'); d.data.transform(q.to_matrix().to_4x4()); p = Vector((n.x * 0.635, n.y * 0.695, H + n.z * 0.445)); d.data.transform(Matrix.Translation(p + n * 0.012)); pp.append(d)
        for k in range(3):
            u = rnd.uniform(0, 6.28); off = (q @ Vector((math.cos(u) * rr * 0.5, math.sin(u) * rr * 0.5, 0)))
            pp.append(prim('kule', 'pp_m%d_%d' % (i, k), pepp_m, tuple(p + n * 0.03 + off), (0.018, 0.018, 0.006), segments=10, ring_count=6))
    bl = []
    for i, a in enumerate([0.5, 2.6, 4.7]):
        n = Vector((math.cos(a) * math.sin(0.85), math.sin(a) * math.sin(0.85), math.cos(0.85))); p = Vector((n.x * 0.6, n.y * 0.66, H + n.z * 0.43)) + n * 0.03
        b = prim('kule', 'basil%d' % i, basilikum, (0, 0, 0), (0.07, 0.035, 0.01), (0, 0, a), segments=16, ring_count=8)
        b.data.transform(n.to_track_quat('Z', 'Y').to_matrix().to_4x4()); b.data.transform(Matrix.Translation(p)); bl.append(b)
    bukplate = prim('kule', 'buk', buk, (0, 0, H - 0.02), (0.55, 0.6, 0.08), segments=40, ring_count=16)
    kropp = slaa_sammen('kropp', [sk, ostlag, kant, bukplate] + pp + bl)
    # Hode med stor munn og glad mine
    hx, hy, hz = 0, -0.78, H + 0.14
    hd = [prim('kule', 'hode', hud, (hx, hy, hz), (0.22, 0.23, 0.21), segments=40, ring_count=24)]
    hd.append(prim('syl', 'hals', hud, (hx, hy + 0.15, hz - 0.06), (0.12, 0.12, 0.13), (1.2, 0, 0), vertices=24, ss=1))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.1, hy - 0.16, hz + 0.08), 0.06)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.16, hy - 0.15, hz - 0.03), 0.04))
    hd.append(smil('smil', (hx, hy - 0.225, hz - 0.04), 0.07))
    # Liten ostetråd fra munnviken – maten er med i ansiktet også
    hd.append(kurve('osttraad', [(hx + 0.06, hy - 0.22, hz - 0.06), (hx + 0.09, hy - 0.24, hz - 0.12), (hx + 0.08, hy - 0.22, hz - 0.18)], 0.012, ost))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.2, hz - 0.08))
    bein = []
    for i, (bx, by, rz) in enumerate([(-0.45, -0.42, 0.5), (0.45, -0.42, -0.5), (-0.45, 0.42, -0.4), (0.45, 0.42, 0.4)]):
        f = prim('kule', 'fot%d' % i, hud, (bx, by, 0.13), (0.15, 0.17, 0.11), (0, 0, rz), segments=24, ring_count=14)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], [f]), (bx * 0.8, by * 0.8, H)))
    hale = pivot(slaa_sammen('hale', [prim('kjegle', 'hale', hud, (0, 0.78, 0.18), (0.07, 0.07, 0.14), (-1.4, 0, 0), vertices=16, ss=1)]), (0, 0.66, 0.2))
    rot = rot_node('Pizzaskilpadde'); forelder([kropp, hode, hale] + bein, rot)
    eksporter(rot, 'pizzaskilpadde')

# ---------------------------------------------------------------- 4 Shakeand
def shakeand():
    """Kroppen er et andeformet sundae-glass: rund bryst foran, glasskanten løfter seg til en hale bak.
    Shaken fyller kroppen, kremen er ryggen, halsen og vingene, og hodet vokser opp av kremen."""
    nullstill(); MATS.clear()
    glass = mat('glass', '#e8f7ff', 0.05, alfa=0.3); shake = mat('shake', '#ff79b0', 0.32); krem = mat('krem', '#fffaf4', 0.3)
    kirsebaer = mat('kirsebaer', '#e0213c', 0.15); sug_r = mat('sugeroer_rod', '#ff4d5e', 0.4); sug_h = mat('sugeroer_hvit', '#ffffff', 0.4)
    and_gul = mat('and_gul', '#ffd84a', 0.55); nebb = mat('nebb', '#ff9a2e', 0.4)
    H = 0.62   # midt i kroppen
    def andeform(o, sx, sy, sz, kutt):
        """Ellipsoide som får andekropp: bredere bryst foran, smalere og løftet bak, åpen over kutt."""
        for v in o.data.vertices:
            x, y, z = v.co.x / sx, v.co.y / sy, (v.co.z - H) / sz
            bryst = 1 + 0.12 * max(0, -y)          # fyldigere foran
            v.co.x = x * sx * bryst * (1 - 0.18 * max(0, y))
            v.co.z = H + z * sz + 0.22 * max(0, y) ** 2.2 * (0.6 + 0.4 * z)   # bakkroppen løfter seg mot halen
        bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > kutt(v.co.y)], context='VERTS'); bm.to_mesh(o.data); bm.free()
        return o
    kant = lambda y: H + 0.17 + 0.28 * max(0, y) ** 1.6          # glasskanten stiger mot halen
    g = andeform(prim('kule', 'glasskropp', glass, (0, 0, H), (0.48, 0.6, 0.4), segments=56, ring_count=32), 0.48, 0.6, 0.4, kant)
    so = g.modifiers.new('t', 'SOLIDIFY'); so.thickness = 0.02; bruk_mod(g); glatt(g)
    sh = andeform(prim('kule', 'shake', shake, (0, 0, H), (0.45, 0.57, 0.37), segments=48, ring_count=28), 0.45, 0.57, 0.37, lambda y: kant(y) - 0.05)
    # Glassfot under kroppen, som et sundae-glass
    fot = [prim('syl', 'stett', glass, (0, 0.02, 0.14), (0.07, 0.07, 0.1), vertices=24), prim('syl', 'fotplate', glass, (0, 0.02, 0.04), (0.26, 0.22, 0.03), vertices=32, ss=1)]
    # Krem: et fyldig lag over hele åpningen som stiger opp i en hals foran
    krembiter = []
    for i in range(46):
        t = i / 45; a = t * 5.5 * math.pi; rr = 0.42 * (1 - t * 0.55)
        krembiter.append((rr * math.cos(a) * 0.95, rr * math.sin(a) * 1.15 + 0.06, kant(rr * math.sin(a) * 1.15 + 0.06) - 0.02 + t * 0.26))
    krem_o = kurve('kremlag', krembiter, 0.09, krem, rund=10, opp=4, avsmal=lambda t: 1.1 - 0.35 * t)
    hals = kurve('kremhals', [(0, -0.26, H + 0.22), (0, -0.36, H + 0.32), (0, -0.38, H + 0.42)], 0.16, krem, rund=10, opp=6, avsmal=lambda t: 1.2 - 0.3 * t)
    kirs = [prim('kule', 'kirsebaer', kirsebaer, (0.0, 0.14, H + 0.5), (0.08,) * 3, segments=28, ring_count=16),
            kurve('stilk', [(0.0, 0.14, H + 0.56), (0.02, 0.17, H + 0.63), (0.06, 0.2, H + 0.66)], 0.01, mat('stilk', '#5b8a2f', 0.6))]
    stro = []
    for i in range(26):
        x, y = rnd.uniform(-0.3, 0.3), rnd.uniform(-0.25, 0.4); z = kant(y) + 0.09
        stro.append(kurve('s%d' % i, [(x - 0.022, y, z), (x, y + 0.01, z + 0.006), (x + 0.022, y, z)], 0.01, mat('str_' + str(i % 3), ['#7a4cff', '#ffd23f', '#4fd1ff'][i % 3], 0.35), rund=4, opp=2))
    # Halen: glasskanten løfter seg, og sugerøret stikker opp som en halefjær
    sug = []
    p0, p1 = Vector((0.0, 0.42, H + 0.2)), Vector((0.0, 0.78, H + 0.72))
    for k in range(9):
        a_, b_ = p0.lerp(p1, k / 9), p0.lerp(p1, (k + 1) / 9)
        sug.append(kurve('sug%d' % k, [tuple(a_), tuple((a_ + b_) / 2), tuple(b_)], 0.034, sug_r if k % 2 else sug_h, rund=8, opp=2))
    kropp = slaa_sammen('kropp', [g, sh, krem_o, hals] + fot + kirs + stro + sug)
    # Andehodet vokser opp av kremhalsen
    hx, hy, hz = 0, -0.38, H + 0.6
    hd = [prim('kule', 'andehode', and_gul, (hx, hy, hz), (0.21, 0.2, 0.2), segments=40, ring_count=24)]
    hd.append(prim('kule', 'kremlugg', krem, (hx, hy + 0.02, hz + 0.17), (0.11, 0.1, 0.07), segments=24, ring_count=12))
    hd.append(prim('kule', 'nebb_overst', nebb, (hx, hy - 0.2, hz - 0.05), (0.13, 0.11, 0.045), (0.15, 0, 0), segments=32, ring_count=14))
    hd.append(prim('kule', 'nebb_nederst', nebb, (hx, hy - 0.17, hz - 0.095), (0.1, 0.08, 0.03), (-0.1, 0, 0), segments=24, ring_count=10))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.095, hy - 0.14, hz + 0.05), 0.052)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.15, hy - 0.12, hz - 0.04), 0.035))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.06, hz - 0.16))
    # Vinger av sprøytet krem: tre fjær-dusker langs hver side av glasset
    vinger = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        v = []
        for k in range(3):
            y0 = -0.12 + k * 0.16; z0 = H + 0.12 - k * 0.04
            pts = [(s * 0.46, y0, z0), (s * 0.53, y0 + 0.08, z0 - 0.03), (s * 0.55, y0 + 0.18, z0 - 0.02), (s * 0.52, y0 + 0.27, z0 + 0.03)]
            v.append(kurve('fjaer%d%d' % (s, k), pts, 0.07 - k * 0.01, and_gul if k == 0 else krem, rund=8, opp=4, avsmal=lambda t: 1.2 - 0.9 * t))
        vinger.append(pivot(slaa_sammen(navn, v), (s * 0.46, -0.12, H + 0.12)))
    bein = []
    for i, s in enumerate((-1, 1)):
        f = prim('kule', 'fot%d' % i, nebb, (s * 0.13, -0.16, 0.03), (0.11, 0.15, 0.03), (0, 0, s * 0.2), segments=24, ring_count=10)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], [f, prim('syl', 'legg%d' % i, nebb, (s * 0.13, -0.08, 0.1), (0.028, 0.028, 0.09), vertices=12)]), (s * 0.13, -0.08, 0.18)))
    rot = rot_node('Shakeand'); forelder([kropp, hode] + vinger + bein, rot)
    eksporter(rot, 'shakeand')

# ---------------------------------------------------------------- 5 Spagettipingvin
def spagettipingvin():
    """Hele kroppen er viklet av spagetti: svart blekksprutpasta på ryggen og vanlig spagetti på magen.
    Løse nudler henger ned i kanten, vingene er bunter av nudler, og sausen renner fra hodet."""
    nullstill(); MATS.clear()
    svart = mat('blekksprutpasta', '#232838', 0.45); pasta = mat('spagetti', '#f6d77a', 0.45); saus = mat('tomatsaus', '#d8432f', 0.35)
    kjott = mat('kjottbolle', '#7a3d25', 0.75); nebb = mat('nebb', '#ff9a2e', 0.4); parm = mat('parmesan', '#fff6dc', 0.6); basil = mat('basilikum', '#3fa34d', 0.5)
    C, AX = Vector((0, 0.02, 0.62)), Vector((0.42, 0.38, 0.6))
    def flate(a, z):   # punkt på eggformen (vinkel a rundt, høyde z i [-1, 1])
        r = math.sqrt(max(0.0, 1 - z * z)) * (1 + 0.12 * (1 - z) * 0.5)   # litt tyngre nederst
        return C + Vector((math.cos(a) * r * AX.x, math.sin(a) * r * AX.y, z * AX.z))
    kjerne_s = prim('kule', 'kjerne_bak', svart, tuple(C), tuple(AX * 0.97), segments=40, ring_count=24)
    kjerne_p = prim('kule', 'kjerne_foran', pasta, tuple(C + Vector((0, -0.04, -0.04))), (AX.x * 0.92, AX.y * 0.9, AX.z * 0.86), segments=40, ring_count=24)
    nudler = []
    r = random.Random(17)
    for k in range(46):
        z0 = -0.85 + 1.62 * k / 45 + r.uniform(-0.03, 0.03); a0 = r.uniform(0, 2 * math.pi); spenn = r.uniform(1.4, 2.2); dz = r.uniform(-0.08, 0.08)
        pts = []
        for i in range(16):
            t = i / 15; a = a0 + spenn * t; z = max(-0.95, min(0.92, z0 + dz * t + 0.04 * math.sin(t * 9 + k)))
            pts.append(tuple(C + (flate(a, z) - C) * (1.04 + 0.015 * math.sin(t * 13 + k))))
        # Del nudelen der den krysser fra mage til rygg, så magen blir en tydelig lys flate foran
        mage = lambda a, z: math.sin(a) < -0.45 and z < 0.5
        bit, forrige = [], None
        for i, pt in enumerate(pts):
            a = a0 + spenn * i / 15; f = mage(a, z0)
            if forrige is not None and f != forrige and len(bit) >= 2:
                nudler.append(kurve('n%d_%d' % (k, i), bit, 0.026, pasta if forrige else svart, rund=6, opp=3)); bit = [bit[-1]]
            bit.append(pt); forrige = f
        if len(bit) >= 2: nudler.append(kurve('n%d_s' % k, bit, 0.026, pasta if forrige else svart, rund=6, opp=3))
    # Løse nudler henger ned rundt kanten nederst og gir en levende silhuett
    for k in range(6):
        a = [0.2, 0.6, 2.5, 2.95, 1.2, 1.95][k]; p0 = flate(a, -0.45); ut = Vector((math.cos(a), math.sin(a), 0))
        pts = [tuple(p0), tuple(p0 + ut * 0.06 + Vector((0, 0, -0.06))), tuple(p0 + ut * 0.05 + Vector((0.02 * math.sin(k), 0, -0.12))), tuple(p0 + ut * 0.02 + Vector((0, 0, -0.1)))]
        nudler.append(kurve('heng%d' % k, pts, 0.022, pasta if math.sin(a) < -0.3 else svart, rund=6, opp=3))
    pasta_n = slaa_sammen('nudler', nudler)
    # Saus som renner fra toppen, med kjøttbolle, parmesan og basilikum
    sau = prim('kule', 'saus', saus, (0, 0.02, 1.13), (0.3, 0.28, 0.12), segments=40, ring_count=20)
    bm = bmesh.new(); bm.from_mesh(sau.data)
    for v in bm.verts:
        a = math.atan2(v.co.y - 0.02, v.co.x)
        if v.co.z < 1.1:
            for a0, d in [(0.3, 0.12), (1.3, 0.08), (2.2, 0.15), (3.4, 0.1), (4.4, 0.13), (5.4, 0.09)]:
                da = math.atan2(math.sin(a - a0), math.cos(a - a0)); v.co.z -= d * math.exp(-(da * 4) ** 2)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 0.86], context='VERTS'); bm.to_mesh(sau.data); bm.free()
    kb = prim('kule', 'kjottbolle', kjott, (0.02, 0.06, 1.27), (0.12, 0.12, 0.11), segments=28, ring_count=16)
    for v in kb.data.vertices: v.co += (v.co - Vector((0.02, 0.06, 1.27))).normalized() * 0.008 * math.sin(v.co.x * 90) * math.sin(v.co.z * 80)
    ost = [prim('kule', 'parm%d' % i, parm, (r.uniform(-0.2, 0.2), r.uniform(-0.18, 0.22), 1.21 + r.uniform(-0.01, 0.03)), (0.02, 0.018, 0.01), segments=8, ring_count=5) for i in range(14)]
    bb = prim('kule', 'basilblad', basil, (0.1, 0.04, 1.38), (0.07, 0.035, 0.012), (0.3, 0.2, 0.6), segments=16, ring_count=8)
    kropp = slaa_sammen('kropp', [kjerne_s, kjerne_p, pasta_n, sau, kb, bb] + ost)
    # Ansiktet: hvit maske, oransje nebb og store øyne
    hx, hy, hz = 0, -0.33, 0.98
    hd = [prim('kule', 'ansikt', mat('ansikt', '#f4f1ea', 0.55), (hx, hy + 0.04, hz), (0.28, 0.11, 0.18), segments=36, ring_count=20)]
    hd.append(prim('kjegle', 'nebb', nebb, (hx, hy - 0.08, hz - 0.03), (0.07, 0.05, 0.12), (math.pi / 2 + 0.15, 0, 0), vertices=20, ss=1))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.1, hy - 0.04, hz + 0.05), 0.052)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.17, hy - 0.02, hz - 0.05), 0.035))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.15, hz - 0.1))
    # Vinger: tette bunter av spagetti med saus på tuppen, formet som pingvinvinger
    vinger = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        v = []
        for k in range(8):
            o = (k - 3.5) * 0.022
            pts = [(s * 0.4, o, 0.86), (s * (0.5 + 0.01 * k), -0.01 + o, 0.72), (s * (0.53 + 0.015 * math.sin(k)), 0.02 + o, 0.55), (s * (0.5 + 0.02 * math.cos(k)), 0.04 + o * 1.3, 0.38 + 0.012 * k)]
            v.append(kurve('vingenudel%d%d' % (s, k), pts, 0.024, svart if k < 3 else pasta, rund=6, opp=3))
        v.append(prim('kule', 'sausdrape%d' % s, saus, (s * 0.5, 0.03, 0.4), (0.05, 0.07, 0.04), segments=14, ring_count=8))
        vinger.append(pivot(slaa_sammen(navn, v), (s * 0.4, 0.0, 0.86)))
    bein = []
    for i, s in enumerate((-1, 1)):
        f = prim('kule', 'fot%d' % i, nebb, (s * 0.15, -0.14, 0.03), (0.1, 0.14, 0.03), (0, 0, s * 0.25), segments=24, ring_count=10)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], [f]), (s * 0.15, 0, 0.1)))
    rot = rot_node('Spagettipingvin'); forelder([kropp, hode] + vinger + bein, rot)
    eksporter(rot, 'spagettipingvin')

if __name__ == '__main__':
    hvilke = os.environ.get('FIGURER', 'donutku,burgersau,pizzaskilpadde,shakeand,spagettipingvin').split(',')
    for h in hvilke: globals()[h]()
