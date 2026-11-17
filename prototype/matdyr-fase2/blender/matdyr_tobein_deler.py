"""Matdyr på to bein som deler (Even 16.–17.11.2026: «du må lage ferdig dyrene»).
I stedet for én modell per kombinasjon (40 dyr × 25 mat = 1000 modeller) lages
  - én fil per dyr:  tb_dyr_<dyr>.glb  med hode, armer, bein, hale og eventuelle faste kroppsdeler (ryggfinne, skilpaddekropp), uten mat
  - én fil per mat:  tb_mat_<mat>.glb  med matkroppen stående (modus 'staa') ved referansemålene C_REF og A_REF
Spillet setter dem sammen: matkroppen skaleres til dyrets mål (A / A_REF) og flyttes til dyrets midtpunkt C.
Dyrets mål og eventuell snuing av maten (skilpadden bærer maten som skjold) skrives til tb_deler.json.
Bare utseendet: art, sjeldenhet, pris, inntekt og ID-er er uendret.
Kjør: python3 matdyr_tobein_deler.py <utmappe>
"""
import bpy, os, sys, json, math, bmesh
from mathutils import Vector as V
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
import matdyr_modul as M
import matdyr_tobein as T

UT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else '/tmp/tb_deler'
os.makedirs(UT, exist_ok=True)
C_REF, A_REF = V((0, 0.02, 0.72)), V((0.4, 0.34, 0.43))

# Tom «mat»: bare en liten plassholder (fjernes etterpå), men med de samme festepunktene som ekte mat
def mat_tom(C, A, modus):
    p = H.prim('kule', 'TOM_plass', H.mat('TOM', '#ff00ff'), tuple(C), (0.01, 0.01, 0.01), segments=6, ring_count=4)
    return {'deler': [p], **M.ankre(C, A, modus)}
M.MAT['tom'] = mat_tom

def fjern_tom(o):
    """Fjerner plassholderen fra et sammenslått objekt. Returnerer False hvis objektet bare var plassholder."""
    if o is None or o.type != 'MESH': return True
    idx = [i for i, m in enumerate(o.data.materials) if m and m.name.startswith('TOM')]
    if not idx: return True
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in idx], context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    tom = len(bm.verts) == 0; bm.to_mesh(o.data); bm.free()
    if tom: bpy.data.objects.remove(o, do_unlink=True); return False
    return True

# Dyrets midtpunkt C og mål A (samme tall som i matdyr_tobein.py), og om maten snus og flyttes
MAAL = {
    'ku': ((0, 0.02, 0.74), (0.38, 0.34, 0.44), 0.0, (0, 0, 0)),
    'gris': ((0, 0.02, 0.72), (0.4, 0.34, 0.42), 0.0, (0, 0, 0)),
    'hval': ((0, 0.02, 0.62), (0.42, 0.36, 0.4), 0.0, (0, 0, 0)),
    'hai': ((0, 0.02, 0.66), (0.4, 0.34, 0.42), 0.0, (0, 0, 0)),
    'sau': ((0, 0.02, 0.72), (0.4, 0.36, 0.42), 0.0, (0, 0, 0)),
    'skilpadde': ((0, 0.02, 0.72), (0.4, 0.34, 0.44), math.pi, (0, 0.12, 0)),
}

def eksporter(rot, navn, lav=7000):
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects: o.select_set(True)
    tri = 0
    for o in bpy.context.scene.objects:
        if o.type == 'MESH': o.data.calc_loop_triangles(); tri += len(o.data.loop_triangles)
    if tri > lav:
        for o in bpy.context.scene.objects:
            if o.type == 'MESH':
                d = o.modifiers.new('lav', 'DECIMATE'); d.ratio = max(0.1, lav / tri); H.bruk_mod(o)
    bpy.ops.export_scene.gltf(filepath=os.path.join(UT, navn + '.glb'), export_format='GLB', use_selection=True, export_apply=True,
                              export_yup=True, export_texcoords=True, export_normals=True, export_materials='EXPORT', export_animations=False)
    print('EKSPORT', navn, 'trekanter', tri, '->', min(tri, lav))

def lag_dyr(dyr):
    H.nullstill(); H.MATS.clear(); M._VAFFEL.clear(); H.rnd.seed(7)
    kropp, hode, rest = T.DYR[dyr]('tom')
    beholdt = [o for o in [kropp] if fjern_tom(o)]   # faste kroppsdeler (ryggfinne, skilpaddekropp) blir igjen som 'kropp'
    rot = H.rot_node('tb_' + dyr); H.forelder(beholdt + [hode] + rest, rot)
    eksporter(rot, 'tb_dyr_' + dyr, 5000)

def lag_mat(m):
    H.nullstill(); H.MATS.clear(); M._VAFFEL.clear(); H.rnd.seed(7)
    k = M.MAT[m](C_REF.copy(), A_REF.copy(), 'staa')
    kropp = H.slaa_sammen('matkropp', k['deler'])
    rot = H.rot_node('tb_mat_' + m); H.forelder([kropp], rot)
    eksporter(rot, 'tb_mat_' + m, 4000)

if __name__ == '__main__':
    dyr = [d for d in os.environ.get('DYR', ','.join(T.DYR)).split(',') if d]
    mater = [m for m in os.environ.get('MAT', ','.join(k for k in M.MAT if k != 'tom')).split(',') if m]
    for d in dyr: lag_dyr(d)
    for m in mater: lag_mat(m)
    meta = {'C_REF': list(C_REF), 'A_REF': list(A_REF),
            'dyr': {d: {'C': list(MAAL[d][0]), 'A': list(MAAL[d][1]), 'matRot': MAAL[d][2], 'matFlytt': list(MAAL[d][3])} for d in dyr if d in MAAL},
            'mat': mater}
    sti = os.path.join(UT, 'tb_deler.json')
    if os.path.exists(sti):
        gml = json.load(open(sti)); gml['dyr'].update(meta['dyr']); meta['dyr'] = gml['dyr']; meta['mat'] = sorted(set(gml['mat']) | set(mater))
    json.dump(meta, open(sti, 'w'), indent=1, ensure_ascii=False)
    print('SKREV', sti)
