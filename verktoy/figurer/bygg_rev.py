# EVN-reven «Nysgjerrig» i Blender: skjelett, bøyelige mesher per materiale og egne animasjoner.
# Formene kommer fra godkjenningsmodellen (hent-rev.cjs). Leddnavn som roboten der de finnes (Hips, Torso, Neck, Head,
# UpperArm.*, Palm2.*, UpperLeg.*, LowerLeg.*), pluss Tail1-3 og Ear.L/R. Klippnavn som roboten (Idle, Walking, Running, Jump,
# Punch, Wave) pluss Sneak.
# Kjøres: blender --background --factory-startup --python bygg_rev.py -- <rev-former.json> <ut.glb> <ut.blend> [v1|v2] [vinkel] [bredde]
# v2 (standard): deler som følger samme ledd, smeltes sammen (boolsk union), deretter samme forbedring som roboten v2:
# avfasede kanter og skjøter med hardede normaler, myk skyggelegging, mer levende overflate.
# v1: fasettert uten avfasing (som godkjenningsmodellen), brukes som «før» i sammenligningen.
import bpy, bmesh, sys, json, math
from mathutils import Vector

a = sys.argv[sys.argv.index('--') + 1:]
d = json.load(open(a[0], encoding='utf-8'))
UT, BLEND = a[1], a[2]
VERSJON = a[3] if len(a) > 3 else 'v2'
VINKEL = math.radians(float(a[4]) if len(a) > 4 else 50)   # 50°: samme utseende som 40°, færre trekanter
BREDDE = float(a[5]) if len(a) > 5 else 0.006    # andel av robotens høyde (1)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = 30

def b(v): return Vector((v[0], -v[2], v[1]))           # three.js (Y opp) -> Blender (Z opp)

# ---------- skjelett: alle ledd peker opp, rull 0, så lokale akser = three.js-akser ----------
arm_data = bpy.data.armatures.new('Rev'); arm = bpy.data.objects.new('Rev', arm_data); sc.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
eb = {}
for l in d['ledd']:
    e = arm_data.edit_bones.new(l['navn']); e.head = b(l['pos']); e.tail = e.head + Vector((0, 0, 0.04)); e.roll = 0; eb[l['navn']] = e
for l in d['ledd']:
    if l['forelder']: eb[l['navn']].parent = eb[l['forelder']]
bpy.ops.object.mode_set(mode='OBJECT')

# ---------- materialer: tre farger + gult kjennetegn ----------
def lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]
MAT = { 'Pels': ('#f39a3c', .75, 0), 'Lys': ('#f6eee0', .7, 0), 'Mork': ('#2a1f1b', .45, 0), 'Gul': ('#ffcc00', .5, .1) }
if VERSJON == 'v2':   # som roboten v2: pels litt silkemyk, øyne og nese blanke, halsbåndet som lakkert metall
    MAT = { 'Pels': ('#f39a3c', .6, 0), 'Lys': ('#f6eee0', .65, 0), 'Mork': ('#2a1f1b', .32, 0), 'Gul': ('#ffcc00', .4, .25) }
FARGE_TIL = { '#f39a3c': 'Pels', '#f6eee0': 'Lys', '#fefefe': 'Lys', '#2a1f1b': 'Mork', '#fecc00': 'Gul', '#ffcc00': 'Gul' }
mats = {}
for n, (h, r, m) in MAT.items():
    mt = bpy.data.materials.new(n); mt.use_nodes = True
    p = mt.node_tree.nodes['Principled BSDF']; p.inputs['Base Color'].default_value = lin(h); p.inputs['Roughness'].default_value = r; p.inputs['Metallic'].default_value = m
    mats[n] = mt

# ---------- mesher: én per materiale, pluss hodet («Head_3», som garderoben bruker for å måle hodet) ----------
grupper = {}
for del_ in d['deler']:
    mat = FARGE_TIL.get(del_['farge'])
    if del_.get('gjennomsiktig') or mat is None: continue          # håven o.l. hører ikke til figuren
    nokkel = 'Head_3' if del_['navn'] == 'Head_3' else mat
    grupper.setdefault(nokkel, []).append(del_)
objekter = []
for navn, dl in grupper.items():
    me = bpy.data.meshes.new(navn); o = bpy.data.objects.new(navn, me); sc.collection.objects.link(o)
    bm = bmesh.new(); vg_lag = bm.verts.layers.deform.verify()
    leddnavn = sorted({x['ledd'] for x in dl}); gi = {n: i for i, n in enumerate(leddnavn)}
    for x in dl:
        p = x['pos']; nye = []
        for k in range(0, len(p), 3):
            v = bm.verts.new(b(p[k:k + 3])); v[vg_lag][gi[x['ledd']]] = 1.0; nye.append(v)
        for k in range(0, len(nye), 3):
            try: bm.faces.new(nye[k:k + 3])
            except ValueError: pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=1e-7)  # polene på kulene gir flater uten areal
    bm.to_mesh(me); bm.free()
    for n in leddnavn: o.vertex_groups.new(name=n)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    if VERSJON == 'v2' and navn != 'Head_3':
        # Smelt sammen delene som er satt sammen og følger samme ledd (for eksempel lår + hofteledd, overarm + skulderledd,
        # hale-ledd, øre), til én sammenhengende overflate. Mellom ulike ledd brukes kuleledd som sitter i kroppen:
        # å smelte på tvers av ledd ga strekk i overflaten når armer og bein beveger seg (prøvd 5.11.2026).
        biter = []
        for gi_ in range(len(o.vertex_groups)):            # én kopi per ledd med bare det leddets deler
            k = o.copy(); k.data = o.data.copy(); sc.collection.objects.link(k)
            bpy.ops.object.select_all(action='DESELECT'); k.select_set(True); bpy.context.view_layer.objects.active = k
            bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
            k.vertex_groups.active_index = gi_; bpy.ops.object.vertex_group_deselect()
            bpy.ops.mesh.delete(type='VERT')
            bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.mesh.intersect_boolean(operation='UNION', use_self=True, use_swap=False, solver='EXACT')
            bpy.ops.object.mode_set(mode='OBJECT')
            # Sammensmeltingen lager nye hjørner uten ledd. Kopien gjelder bare ett ledd, så de nye hjørnene får det.
            uten = [v.index for v in k.data.vertices if not any(g.weight > 0 for g in v.groups)]
            if uten: k.vertex_groups[gi_].add(uten, 1.0, 'REPLACE')
            biter.append(k)
        bpy.ops.object.select_all(action='DESELECT')
        for k in biter: k.select_set(True)
        bpy.context.view_layer.objects.active = biter[0]; bpy.ops.object.join()
        gammel, gammel_me = o, o.data; o = biter[0]; me = o.data
        bpy.data.objects.remove(gammel); bpy.data.meshes.remove(gammel_me); o.name = navn; me.name = navn
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    if VERSJON == 'v2':                                            # merk skarpe kanter (også nye skjøter) for avfasing
        bm = bmesh.new(); bm.from_mesh(me)
        lag = bm.edges.layers.float.get('bevel_weight_edge') or bm.edges.layers.float.new('bevel_weight_edge')
        for e in bm.edges:
            if len(e.link_faces) == 2 and e.calc_face_angle(0) > VINKEL: e[lag] = 1.0
        bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = VERSJON == 'v2'           # v2: myk mellom små fasetter, skarpe kanter avfases
    if VERSJON == 'v2':
        mod = o.modifiers.new('EVN-avfasing', 'BEVEL'); mod.limit_method = 'WEIGHT'; mod.width = BREDDE; mod.segments = 1
        mod.harden_normals = True; mod.miter_outer = 'MITER_ARC'
        bpy.ops.object.modifier_apply(modifier=mod.name)          # vektene følger med til de nye hjørnene
    me.materials.append(mats['Pels' if navn == 'Head_3' else navn])
    o.parent = arm; md = o.modifiers.new('Skjelett', 'ARMATURE'); md.object = arm
    objekter.append(o)

# ---------- animasjoner (30 bilder/s). Verdier er endring fra hvilestillingen, i radianer ----------
arm.animation_data_create()
for pb in arm.pose.bones: pb.rotation_mode = 'XYZ'
def klipp(navn, lengde, fn, sloyfe=True):
    act = bpy.data.actions.new(navn); act.use_fake_user = True; arm.animation_data.action = act
    prove = [fn(i / 10) for i in range(11)]
    brukt = sorted({k for p in prove for k in p}); flytt = {k for p in prove for k, v in p.items() if 'l' in v}
    for f in range(0, lengde + 1, 2):
        t = f / lengde
        for pb in arm.pose.bones: pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
        for ledd, verdi in fn(t).items():
            pb = arm.pose.bones[ledd]
            if 'r' in verdi: pb.rotation_euler = verdi['r']
            if 'l' in verdi: pb.location = verdi['l']
        for ledd in brukt:
            pb = arm.pose.bones[ledd]; pb.keyframe_insert('rotation_euler', frame=f)
            if ledd in flytt: pb.keyframe_insert('location', frame=f)
    return act
S, C, PI = math.sin, math.cos, math.pi
def gange(amp, kne, arm_amp, lent=0.0, hopp=0.012, lav=0.0, ore=0.0):
    def fn(t):
        p = 2 * PI * t
        return {
            'UpperLeg.L': {'r': (amp * S(p) - lav, 0, 0)}, 'UpperLeg.R': {'r': (-amp * S(p) - lav, 0, 0)},
            'LowerLeg.L': {'r': (kne * max(0, -S(p)) + lav * 1.6, 0, 0)}, 'LowerLeg.R': {'r': (kne * max(0, S(p)) + lav * 1.6, 0, 0)},
            'UpperArm.L': {'r': (-arm_amp * S(p) - lav * 1.5, 0, 0)}, 'UpperArm.R': {'r': (arm_amp * S(p) - lav * 1.5, 0, 0)},
            'Hips': {'l': (0, hopp * abs(C(p)) - lav * 0.08, 0)}, 'Torso': {'r': (lent, 0, 0.04 * S(p))},
            'Head': {'r': (-lent * 0.6, 0, -0.04 * S(p))}, 'Tail1': {'r': (lav * 0.8, 0, 0.22 * S(p))}, 'Tail2': {'r': (0, 0, 0.15 * S(p - 0.6))},
            'Ear.L': {'r': (-ore, 0, 0)}, 'Ear.R': {'r': (-ore, 0, 0)},
        }
    return fn
klipp('Idle', 60, lambda t: {
    'Torso': {'r': (0.03 * S(2 * PI * t), 0, 0)}, 'Head': {'r': (0, 0, 0.05 * S(2 * PI * t))},
    'Tail1': {'r': (0, 0, 0.28 * S(2 * PI * t))}, 'Tail2': {'r': (0, 0, 0.2 * S(2 * PI * t - 0.8))},
    'Ear.R': {'r': (0, 0, -0.25 if 0.62 < t < 0.7 else 0)},
    'UpperArm.L': {'r': (0, 0, -0.03 * S(2 * PI * t))}, 'UpperArm.R': {'r': (0, 0, 0.03 * S(2 * PI * t))}})
klipp('Walking', 32, gange(0.5, 0.6, 0.45))
klipp('Running', 20, gange(0.9, 1.1, 0.85, lent=0.22, hopp=0.03))
klipp('Sneak', 40, gange(0.3, 0.4, 0.15, lent=0.25, hopp=0.004, lav=0.25, ore=0.5))
def hopp(t):
    if t < 0.25: k = t / 0.25; y, ben, armer = -0.05 * k, k, 0.3 * k
    elif t < 0.6: k = (t - 0.25) / 0.35; y, ben, armer = -0.05 + 0.25 * S(PI * k) + 0.05 * k, 1 - 0.4 * S(PI * k), 0.3 + 0.9 * S(PI * k)
    else: k = (t - 0.6) / 0.4; y, ben, armer = -0.03 * S(PI * k), 0.6 * (1 - k) + 0.4 * S(PI * k) * 0.5, 0.3 * (1 - k)
    return {'Hips': {'l': (0, y, 0)}, 'UpperLeg.L': {'r': (-0.6 * ben, 0, 0)}, 'UpperLeg.R': {'r': (-0.6 * ben, 0, 0)},
            'LowerLeg.L': {'r': (1.0 * ben, 0, 0)}, 'LowerLeg.R': {'r': (1.0 * ben, 0, 0)},
            'UpperArm.L': {'r': (0, 0, -armer)}, 'UpperArm.R': {'r': (0, 0, armer)}, 'Ear.L': {'r': (-0.4 * armer, 0, 0)}, 'Ear.R': {'r': (-0.4 * armer, 0, 0)},
            'Tail1': {'r': (-0.4 * armer, 0, 0)}}
klipp('Jump', 24, hopp)
klipp('Wave', 36, lambda t: {'UpperArm.R': {'r': (0, 0, min(1, t * 5) * 2.2 + 0.25 * S(4 * PI * t) * min(1, t * 5))},
    'Head': {'r': (0, 0, 0.12 * min(1, t * 5))}, 'Tail1': {'r': (0, 0, 0.35 * S(4 * PI * t))}, 'Ear.L': {'r': (0, 0, 0.1)}})
klipp('Punch', 15, lambda t: {'UpperArm.R': {'r': (-1.5 * S(PI * min(1, t * 1.6)), 0, -0.2 * S(PI * t))}, 'Torso': {'r': (0, 0.25 * S(PI * t), 0)}})
arm.animation_data.action = bpy.data.actions['Idle']

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.export_scene.gltf(filepath=UT, export_format='GLB', export_animation_mode='ACTIONS', export_skins=True, export_morph=False,
    export_force_sampling=False, export_optimize_animation_size=True, export_extras=False, export_apply=False, export_yup=True)
print('EVN: ferdig', UT, {o.name: len(o.data.polygons) for o in objekter})
