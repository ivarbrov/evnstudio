# EVN-roboten v2, steg 1 (Blender i bakgrunnen): ny geometri per del, i originalens egne koordinater.
# Skjelett, ledd og animasjoner hentes ikke herfra. De beholdes byte for byte fra originalen i steg 2 (bygg-robot-v2.mjs).
# Kjøres: blender --background --factory-startup --python robot_geometri.py -- <original.glb> <ut.json> [vinkel] [bredde] [segmenter] [kontroll]
import bpy, bmesh, sys, math, json
from mathutils import Vector

a = sys.argv[sys.argv.index('--') + 1:]
INN, UT = a[0], a[1]
VINKEL = math.radians(float(a[2]) if len(a) > 2 else 40)
BREDDE = float(a[3]) if len(a) > 3 else 0.006
SEG = int(a[4]) if len(a) > 4 else 1
KONTROLL = len(a) > 5 and a[5] == 'kontroll'      # bare sammenslåing, ingen avfasing (for å kontrollere koordinatene)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=INN)
mesher = [o for o in bpy.data.objects if o.type == 'MESH']
for o in bpy.data.objects:
    if o.type == 'ARMATURE': o.data.pose_position = 'REST'
bpy.context.view_layer.update()

# Robotens høyde i Blenders verden, for å regne avfasingen som andel av høyden
mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
for o in mesher:
    for c in o.bound_box:
        v = o.matrix_world @ Vector(c); mn = Vector(map(min, mn, v)); mx = Vector(map(max, mx, v))
H = mx.z - mn.z

def til_gltf(v): return [v.x, v.z, -v.y]       # Blender (Z opp) -> glTF (Y opp)

ut = {}
for o in mesher:
    me = o.data
    skala = sum(o.matrix_world.to_scale()) / 3
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5 * H / skala)
    lag = bm.edges.layers.float.get('bevel_weight_edge') or bm.edges.layers.float.new('bevel_weight_edge')
    n = 0
    for e in bm.edges:
        if not KONTROLL and len(e.link_faces) == 2 and e.calc_face_angle(0) > VINKEL: e[lag] = 1.0; n += 1
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    for m in list(o.modifiers):
        if m.type == 'ARMATURE': m.show_viewport = False
    if not KONTROLL:
        mod = o.modifiers.new('EVN-avfasing', 'BEVEL')
        mod.limit_method = 'WEIGHT'; mod.width = BREDDE * H / skala; mod.segments = SEG
        mod.harden_normals = True; mod.miter_outer = 'MITER_ARC'
    nokler = list(me.shape_keys.key_blocks) if me.shape_keys else []
    def evaluer(aktiv):
        for i, k in enumerate(nokler): k.value = 1.0 if i == aktiv else 0.0
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        return bpy.data.meshes.new_from_object(o.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
    grunn = evaluer(-1)
    grunn.calc_loop_triangles()
    gruppe = {g.index: g.name for g in o.vertex_groups}
    hjorner = []                               # én rad per trekanthjørne: [materiale, pos, normal, vekter]
    for t in grunn.loop_triangles:
        mat = o.material_slots[t.material_index].material.name if o.material_slots else ''
        for li, vi in zip(t.loops, t.vertices):
            v = grunn.vertices[vi]
            vekter = sorted(((gruppe[g.group], g.weight) for g in v.groups if g.group in gruppe and g.weight > 0), key=lambda x: -x[1])[:4]
            hjorner.append([mat, til_gltf(v.co), til_gltf(Vector(t.split_normals[list(t.loops).index(li)])), vekter, vi])
    former = {}
    for i, k in enumerate(nokler):
        if i == 0: continue
        fm = evaluer(i)
        if len(fm.vertices) != len(grunn.vertices): print('EVN: ADVARSEL ulik topologi', o.name, k.name); continue
        former[k.name] = [til_gltf(fm.vertices[h[4]].co - grunn.vertices[h[4]].co) for h in hjorner]
        bpy.data.meshes.remove(fm)
    ut[o.name] = { 'kanter': n, 'hjorner': [h[:4] for h in hjorner], 'former': former }
    print('EVN:', o.name, 'avfasede kanter', n, 'hjørner', len(hjorner), 'former', list(former))

with open(UT, 'w', encoding='utf-8') as f: json.dump(ut, f)
print('EVN: ferdig', UT)
