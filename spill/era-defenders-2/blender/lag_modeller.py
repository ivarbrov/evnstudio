# Era Defenders 2 – modeller laget med Blender (bpy). Kjør: python3 lag_modeller.py <ut.glb>
# Alle modeller er egne, lavpoly og stiliserte. Origo står på bakken (z=0) midt under modellen.
import bpy, bmesh, math, random, sys
from mathutils import Vector

UT = sys.argv[-1] if sys.argv[-1].endswith('.glb') else '/home/claude/era2/blender/era2-modeller.glb'
random.seed(42)
bpy.ops.wm.read_factory_settings(use_empty=True)

MAT = {}
def mat(navn, farge, rough=0.6, metal=0.0, emis=None, styrke=2.0, alpha=1.0):
    if navn in MAT: return MAT[navn]
    m = bpy.data.materials.new(navn); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*farge, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emis:
        b.inputs['Emission Color'].default_value = (*emis, 1)
        b.inputs['Emission Strength'].default_value = styrke
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        m.surface_render_method = 'BLENDED'
    MAT[navn] = m; return m

def _lin(v):
    v=v/255
    return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
def c(r, g, b): return (_lin(r), _lin(g), _lin(b))  # sRGB -> lineær, slik glTF forventer

def gi(obj, m):
    obj.data.materials.clear(); obj.data.materials.append(m); return obj

def boks(navn, str_, pos, m, bevel=0.0, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=rot)
    o = bpy.context.object; o.name = navn; o.scale = str_
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bevel; md.segments = 2
        bpy.ops.object.modifier_apply(modifier='b')
    return gi(o, m)

def syl(navn, r1, r2, h, pos, m, v=12, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r1, radius2=r2, depth=h, location=pos, rotation=rot)
    o = bpy.context.object; o.name = navn; return gi(o, m)

def kule(navn, r, pos, m, sub=2, skala=(1,1,1), ujevn=0.0):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=pos)
    o = bpy.context.object; o.name = navn; o.scale = skala
    bpy.ops.object.transform_apply(scale=True)
    if ujevn:
        for vx in o.data.vertices:
            vx.co += vx.normal * random.uniform(-ujevn, ujevn)
    return gi(o, m)

def slaa_sammen(navn, deler):
    bpy.ops.object.select_all(action='DESELECT')
    for d in deler: d.select_set(True)
    bpy.context.view_layer.objects.active = deler[0]
    bpy.ops.object.join()
    o = bpy.context.object; o.name = navn
    for p in o.data.polygons: p.use_smooth = False
    # origo på bakken midt under
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    return o

def flytt_side(o, x):
    o.location.x = x

# ---------- Farger ----------
HVIT = mat('Hvit', c(232,236,245), 0.4, 0.3)
GRAA = mat('Graa', c(120,128,145), 0.45, 0.6)
MORK = mat('Mork', c(40,44,58), 0.4, 0.7)
CYAN = mat('CyanGlod', c(80,230,255), 0.3, 0, emis=c(80,230,255), styrke=4)
ROD = mat('RodGlod', c(255,70,60), 0.3, 0, emis=c(255,60,40), styrke=4)
ORANSJE = mat('LavaGlod', c(255,120,30), 0.4, 0, emis=c(255,110,20), styrke=5)
IS = mat('Is', c(170,215,245), 0.15, 0.05)
SNO = mat('Sno', c(245,250,255), 0.85, 0)
BARK = mat('Bark', c(105,72,48), 0.95, 0)
LOV1 = mat('Lov1', c(52,120,62), 0.9, 0)
LOV2 = mat('Lov2', c(74,148,70), 0.9, 0)
TRE = mat('Treverk', c(150,108,66), 0.9, 0)
TAK = mat('Tak', c(92,70,52), 0.95, 0)
BASALT = mat('Basalt', c(46,40,42), 0.9, 0.05)
STEIN = mat('Stein', c(70,62,64), 0.9, 0.05)
METALL = mat('Metall', c(150,158,175), 0.3, 0.85)
OLIVEN = mat('Oliven', c(96,104,86), 0.6, 0.3)
GUL = mat('Gul', c(255,200,60), 0.5, 0.2)

objekter = []

# ---------- 1. Laserpistol (lengde langs +Y, grep ned) ----------
d = [
  boks('p1', (0.16,0.55,0.2), (0,0.05,0.18), HVIT, 0.03),
  boks('p2', (0.13,0.16,0.3), (0,-0.12,0.0), MORK, 0.02, rot=(math.radians(-15),0,0)),
  syl('p3', 0.06,0.05,0.35, (0,0.45,0.2), MORK, 10, rot=(math.radians(90),0,0)),
  syl('p4', 0.045,0.045,0.06, (0,0.64,0.2), CYAN, 10, rot=(math.radians(90),0,0)),
  boks('p5', (0.17,0.3,0.04), (0,0.05,0.3), CYAN),
  boks('p6', (0.05,0.12,0.08), (0,-0.05,0.33), GRAA),
]
objekter.append(slaa_sammen('Laserpistol', d))

# ---------- 2. Isfjell (to varianter) ----------
for i in range(2):
    d = [kule('i1', 1.0, (0,0,0.55), IS, 2, (1.2,1.0,0.9) if i==0 else (0.9,1.3,1.4), 0.18)]
    d.append(kule('i2', 0.55, (0.6,0.3,0.25), IS, 1, (1,1,0.8), 0.1))
    d.append(kule('i3', 0.95, (0,0,1.05 if i==0 else 1.35), SNO, 2, (1.1,0.95,0.35), 0.08))
    o = slaa_sammen('Isfjell%d' % (i+1), d)
    objekter.append(o); flytt_side(o, 3 + i*3)

# ---------- 3. Gåmaskinen (boss på Isplaneten): kropp + ett bein (pivot i hofta) ----------
d = [
  boks('g1', (2.4,3.4,1.5), (0,0,3.6), HVIT, 0.18),
  boks('g2', (1.4,1.6,1.0), (0,2.3,3.9), GRAA, 0.12),
  syl('g3', 0.12,0.12,1.2, (0.35,3.4,3.7), MORK, 8, rot=(math.radians(90),0,0)),
  syl('g4', 0.12,0.12,1.2, (-0.35,3.4,3.7), MORK, 8, rot=(math.radians(90),0,0)),
  boks('g5', (0.9,0.06,0.18), (0,3.11,4.1), ROD),
  boks('g6', (2.5,0.3,0.2), (0,-1.2,4.4), GRAA, 0.05),
  boks('g7', (2.5,0.3,0.2), (0,0.6,4.4), GRAA, 0.05),
]
o = slaa_sammen('GaaKropp', d); objekter.append(o); flytt_side(o, 10)
d = [
  boks('b1', (0.5,0.5,1.7), (0,0,-0.85), GRAA, 0.08),
  boks('b2', (0.4,0.4,1.4), (0,0.15,-2.3), HVIT, 0.08),
  boks('b3', (0.8,1.0,0.25), (0,0.25,-3.05), MORK, 0.06),
  kule('b4', 0.32, (0,0,-1.65), MORK, 1),
]
o = slaa_sammen('GaaBein', d); objekter.append(o); flytt_side(o, 13)

# ---------- 4. Kjempetre og trehytte (Skogmånen) ----------
d = [syl('t1', 1.0, 0.7, 9, (0,0,4.5), BARK, 10)]
for k in range(5):
    a = k/5*math.tau
    d.append(syl('tr%d'%k, 0.45, 0.05, 1.8, (math.cos(a)*0.9, math.sin(a)*0.9, 0.5), BARK, 6, rot=(math.sin(a)*0.9, -math.cos(a)*0.9, 0)))
for k in range(6):
    a = k/6*math.tau
    d.append(kule('l%d'%k, random.uniform(1.6,2.2), (math.cos(a)*1.8, math.sin(a)*1.8, 9.2+random.uniform(-0.6,0.6)), LOV1 if k%2 else LOV2, 1, (1,1,0.75), 0.25))
d.append(kule('lt', 2.4, (0,0,10.6), LOV2, 1, (1,1,0.8), 0.25))
o = slaa_sammen('Kjempetre', d); objekter.append(o); flytt_side(o, 17)
d = [
  syl('h0', 2.0, 2.0, 0.25, (0,0,4.0), TRE, 12),
  boks('h1', (1.6,1.6,1.3), (1.2,0,4.8), TRE, 0.05),
  syl('h2', 1.3, 0.0, 1.0, (1.2,0,5.95), TAK, 4, rot=(0,0,math.radians(45))),
  boks('h3', (0.05,0.5,0.7), (2.01,0,4.7), mat('Vindu', c(255,210,120), 0.5, 0, emis=c(255,190,90), styrke=3)),
]
o = slaa_sammen('Trehytte', d); objekter.append(o); flytt_side(o, 22)

# ---------- 5. Svevesykkel (rask fiende på Skogmånen) ----------
d = [
  boks('s1', (0.6,2.2,0.45), (0,0,0.9), OLIVEN, 0.1),
  boks('s2', (1.4,0.25,0.12), (0,1.25,0.95), MORK, 0.03),
  boks('s3', (0.45,0.6,0.35), (0,-0.3,1.25), MORK, 0.08),
  syl('s4', 0.2,0.25,0.5, (0.25,-1.2,0.9), MORK, 8, rot=(math.radians(90),0,0)),
  syl('s5', 0.2,0.25,0.5, (-0.25,-1.2,0.9), MORK, 8, rot=(math.radians(90),0,0)),
  syl('s6', 0.15,0.15,0.05, (0.25,-1.47,0.9), ROD, 8, rot=(math.radians(90),0,0)),
  syl('s7', 0.15,0.15,0.05, (-0.25,-1.47,0.9), ROD, 8, rot=(math.radians(90),0,0)),
]
o = slaa_sammen('Svevesykkel', d); objekter.append(o); flytt_side(o, 26)

# ---------- 6. Stasjonssøyle (Kampstasjonen) ----------
d = [syl('q1', 0.9,0.9,6, (0,0,3), METALL, 6), syl('q2', 1.15,1.15,0.4, (0,0,0.2), MORK, 6), syl('q3', 1.15,1.15,0.4, (0,0,5.8), MORK, 6)]
for z in (1.6, 3.0, 4.4):
    d.append(syl('qb', 0.93,0.93,0.12, (0,0,z), CYAN, 6))
o = slaa_sammen('Soyle', d); objekter.append(o); flytt_side(o, 30)
# Kontrollpult (pynt i kontrollrommet)
d = [boks('k1', (2.2,0.9,1.0), (0,0,0.5), MORK, 0.08), boks('k2', (2.0,0.7,0.06), (0,0.1,1.05), CYAN, rot=(math.radians(-25),0,0)),
     boks('k3', (0.2,0.2,0.1), (-0.6,-0.2,1.05), ROD), boks('k4', (0.2,0.2,0.1), (0.6,-0.2,1.05), GUL)]
o = slaa_sammen('Kontrollpult', d); objekter.append(o); flytt_side(o, 33)

# ---------- 7. Lavastein og basaltplattform (Lavaplaneten) ----------
d = [kule('v1', 1.1, (0,0,0.6), STEIN, 2, (1.2,1.0,1.0), 0.22)]
for k in range(4):
    a = k/4*math.tau + 0.3
    d.append(boks('vg%d'%k, (0.12,0.9,0.12), (math.cos(a)*0.95, math.sin(a)*0.95, 0.55), ORANSJE, rot=(0, 0.6, a)))
o = slaa_sammen('Lavastein', d); objekter.append(o); flytt_side(o, 37)
d = [syl('pl', 2.2, 2.0, 0.8, (0,0,0.0), BASALT, 6), syl('pk', 2.25, 2.25, 0.12, (0,0,-0.35), ORANSJE, 6)]
o = slaa_sammen('Basaltplattform', d); objekter.append(o); flytt_side(o, 42)

# ---------- 8. Robotmonstre (nye, felles form; farge settes i spillet) ----------
MKROPP = mat('MonsterKropp', c(255,255,255), 0.45, 0.5)
d = [
  boks('m1', (1.1,0.8,1.0), (0,0,1.15), MKROPP, 0.12),
  boks('m2', (0.9,0.75,0.65), (0,0,1.95), MORK, 0.12),
  boks('m3', (0.7,0.06,0.16), (0,-0.38,2.0), CYAN),
  syl('m4', 0.03,0.03,0.5, (0.25,0,2.5), GRAA, 6),
  kule('m5', 0.09, (0.25,0,2.78), ROD, 1),
  boks('m6', (0.25,0.35,0.6), (0.68,0,1.2), GRAA, 0.06),
  boks('m7', (0.25,0.35,0.6), (-0.68,0,1.2), GRAA, 0.06),
]
o = slaa_sammen('MonsterKropp', d); objekter.append(o); flytt_side(o, 46)
o = slaa_sammen('MonsterBein', [boks('mb', (0.32,0.36,0.7), (0,0,-0.35), MORK, 0.06)]); objekter.append(o); flytt_side(o, 49)

# ---------- 9. Skapninger (ikke roboter) – Evens ønske: «alt kan ikke være roboter» ----------
# Front mot -Y (blir +Z i spillet), som robotmonstrene. Materialer med navn som slutter på «Tint» får farge i spillet.
PELS = mat('PelsTint', c(240,244,250), 0.95, 0)
ANSIKT = mat('Ansikt', c(120,170,220), 0.7, 0)
HORN = mat('Horn', c(230,220,190), 0.6, 0)
SVART = mat('Oye', c(15,15,20), 0.2, 0)
OYELYS = mat('OyeLys', c(255,255,255), 0.3, 0, emis=c(255,255,255), styrke=1.5)
# Snøtroll (stor, lodden)
d = [kule('st1', 1.0, (0,0,1.25), PELS, 2, (1.0,0.85,1.1), 0.12),
     kule('st2', 0.55, (0,-0.35,2.25), PELS, 2, (1,1,0.95), 0.08),
     kule('st3', 0.36, (0,-0.72,2.15), ANSIKT, 2, (1,0.6,0.8)),
     kule('st4', 0.07, (-0.14,-0.98,2.28), SVART, 1), kule('st5', 0.07, (0.14,-0.98,2.28), SVART, 1),
     syl('st6', 0.12,0.02,0.45, (-0.38,-0.2,2.7), HORN, 6, rot=(0,-0.5,0)), syl('st7', 0.12,0.02,0.45, (0.38,-0.2,2.7), HORN, 6, rot=(0,0.5,0)),
     syl('st8', 0.25,0.3,1.1, (-0.95,-0.1,1.2), PELS, 8, rot=(0,0.35,0)), syl('st9', 0.25,0.3,1.1, (0.95,-0.1,1.2), PELS, 8, rot=(0,-0.35,0)),
     syl('st10', 0.3,0.32,0.5, (-0.4,0,0.25), PELS, 8), syl('st11', 0.3,0.32,0.5, (0.4,0,0.25), PELS, 8)]
o = slaa_sammen('Snotroll', d); objekter.append(o); flytt_side(o, 52)
# Bille (liten og rask) – skallet farges per verden
SKALL = mat('SkallTint', c(255,255,255), 0.25, 0.3)
d = [kule('b1', 0.5, (0,0.05,0.42), SKALL, 2, (0.85,1.2,0.6)),
     boks('b2', (0.04,1.05,0.05), (0,0.05,0.72), MORK),
     kule('b3', 0.25, (0,-0.6,0.35), MORK, 1),
     kule('b4', 0.06, (-0.1,-0.8,0.42), OYELYS, 1), kule('b5', 0.06, (0.1,-0.8,0.42), OYELYS, 1),
     syl('b6', 0.04,0.01,0.3, (-0.12,-0.85,0.25), MORK, 5, rot=(1.2,0,0.4)), syl('b7', 0.04,0.01,0.3, (0.12,-0.85,0.25), MORK, 5, rot=(1.2,0,-0.4))]
for k,yy in enumerate((-0.3,0.05,0.4)):
    for sd in (-1,1):
        d.append(syl('bl%d%d'%(k,sd), 0.035,0.02,0.6, (sd*0.55,yy,0.2), MORK, 5, rot=(0, sd*1.1, 0)))
o = slaa_sammen('Bille', d); objekter.append(o); flytt_side(o, 55)
# Trollsopp (vandrende sopp)
HATT = mat('HattTint', c(220,60,50), 0.6, 0)
STILK = mat('Stilk', c(245,235,215), 0.8, 0)
d = [syl('so1', 0.35,0.42,1.0, (0,0,0.65), STILK, 10),
     kule('so2', 0.85, (0,0,1.25), HATT, 2, (1,1,0.55)),
     kule('so3', 0.1, (-0.15,-0.37,0.85), SVART, 1), kule('so4', 0.1, (0.15,-0.37,0.85), SVART, 1),
     syl('so5', 0.13,0.15,0.18, (-0.2,-0.05,0.09), STILK, 8), syl('so6', 0.13,0.15,0.18, (0.2,-0.05,0.09), STILK, 8)]
for k in range(7):
    a = k/7*math.tau
    d.append(kule('sp%d'%k, 0.12, (math.cos(a)*0.55, math.sin(a)*0.55, 1.55), STILK, 1, (1,1,0.5)))
o = slaa_sammen('Trollsopp', d); objekter.append(o); flytt_side(o, 58)
# Romvesen (Kampstasjonen)
HUD = mat('HudTint', c(120,210,110), 0.6, 0)
d = [syl('r1', 0.28,0.4,1.0, (0,0,0.75), HUD, 10),
     kule('r2', 0.5, (0,0,1.6), HUD, 2, (1,0.95,1.15)),
     kule('r3', 0.17, (-0.2,-0.4,1.65), SVART, 2, (1,0.6,1.4)), kule('r4', 0.17, (0.2,-0.4,1.65), SVART, 2, (1,0.6,1.4)),
     syl('r5', 0.03,0.03,0.45, (-0.22,0,2.15), HUD, 6, rot=(0,-0.4,0)), syl('r6', 0.03,0.03,0.45, (0.22,0,2.15), HUD, 6, rot=(0,0.4,0)),
     kule('r7', 0.08, (-0.31,0,2.36), OYELYS, 1), kule('r8', 0.08, (0.31,0,2.36), OYELYS, 1),
     syl('r9', 0.07,0.06,0.8, (-0.42,-0.05,0.9), HUD, 6, rot=(0,0.3,0)), syl('r10', 0.07,0.06,0.8, (0.42,-0.05,0.9), HUD, 6, rot=(0,-0.3,0)),
     syl('r11', 0.1,0.12,0.4, (-0.15,0,0.2), HUD, 6), syl('r12', 0.1,0.12,0.4, (0.15,0,0.2), HUD, 6)]
o = slaa_sammen('Romvesen', d); objekter.append(o); flytt_side(o, 61)
# Ildsalamander (Lavaplaneten)
SAL = mat('SalamanderTint', c(230,90,40), 0.6, 0)
d = [kule('sa1', 0.4, (0,0,0.4), SAL, 2, (0.9,2.0,0.7)),
     kule('sa2', 0.32, (0,-0.85,0.45), SAL, 2, (1,1.1,0.8)),
     syl('sa3', 0.2,0.02,1.2, (0,1.3,0.35), SAL, 8, rot=(math.radians(-90),0,0)),
     kule('sa4', 0.07, (-0.15,-1.08,0.55), SVART, 1), kule('sa5', 0.07, (0.15,-1.08,0.55), SVART, 1)]
for k in range(5):
    d.append(kule('sg%d'%k, 0.09, (random.uniform(-0.2,0.2), -0.4+k*0.3, 0.68), ORANSJE, 1))
for sx in (-1,1):
    for sy in (-0.45,0.45):
        d.append(syl('sl', 0.08,0.06,0.45, (sx*0.42, sy, 0.18), SAL, 6, rot=(0, sx*0.7, 0)))
o = slaa_sammen('Salamander', d); objekter.append(o); flytt_side(o, 64)
# Steingolem (Lavaplaneten og Skogmånen – farges per verden)
GSTEIN = mat('GolemTint', c(110,100,100), 0.9, 0.05)
GGLOD = mat('GlodTint', c(255,120,30), 0.4, 0, emis=c(255,110,20), styrke=4)
d = [kule('go1', 1.0, (0,0,1.7), GSTEIN, 1, (1.2,0.9,1.0), 0.15),
     kule('go2', 0.55, (0,-0.3,2.75), GSTEIN, 1, (1,1,0.9), 0.1),
     boks('go3', (0.5,0.08,0.12), (0,-0.82,2.8), GGLOD),
     kule('go4', 0.55, (-1.35,-0.1,1.5), GSTEIN, 1, (1,1,1.3), 0.12), kule('go5', 0.55, (1.35,-0.1,1.5), GSTEIN, 1, (1,1,1.3), 0.12),
     kule('go6', 0.42, (-1.4,-0.2,0.75), GSTEIN, 1, (1,1,1), 0.1), kule('go7', 0.42, (1.4,-0.2,0.75), GSTEIN, 1, (1,1,1), 0.1),
     kule('go8', 0.45, (-0.5,0,0.45), GSTEIN, 1, (1,1,1.1), 0.1), kule('go9', 0.45, (0.5,0,0.45), GSTEIN, 1, (1,1,1.1), 0.1),
     boks('go10', (0.1,0.08,0.7), (0.35,-0.9,1.7), GGLOD, rot=(0,0.3,0)), boks('go11', (0.1,0.08,0.5), (-0.4,-0.88,1.5), GGLOD, rot=(0,-0.5,0))]
o = slaa_sammen('Golem', d); objekter.append(o); flytt_side(o, 68)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=UT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_materials='EXPORT')
tri = sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objekter)
print('OK', UT, len(objekter), 'modeller,', tri, 'trekanter')
