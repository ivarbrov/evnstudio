"""Matdyr-regn: modulært figursystem (pilot, MS5).

Et matdyr = dyresett (hode, bein, hale, vinger og plass til kroppen) + matkropp (maten ER kroppen).
Dyresettet bestemmer hvor kroppen sitter (et «rom» med senter og radier) og hvordan den står:
  ligg   – liggende kropp langs Y (firbeinte, hval)
  staa   – stående kropp langs Z (fugler)
  kuppel – lav kuppel (skilpadde)
Matkroppen fyller rommet og melder tilbake festepunkter (foran, topp, bak), så hodet og halen alltid sitter på maten.

Kjør: FIGURER=ku:pizza,pingvin:smultring python3 matdyr_modul.py <utmappe>   (uten FIGURER: hele piloten 4 × 4)
Samme nodenavn som de håndlagde figurene: kropp, hode, hale, bein_*, vinge_*. Figuren vender mot -Y, høyde ~1,4–1,6.
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import matdyr_hybrider as H
from matdyr_hybrider import mat, prim, kurve, slaa_sammen, pivot, forelder, oye, kinn, smil, glatt, subsurf, bruk_mod, sett_mat, strossel, overflatepunkter, rot_node

V = Vector

# ================================================================ felles verktøy
def ellipsoide(navn, m, C, A, seg=40, ring=24):
    return prim('kule', navn, m, tuple(C), tuple(A), segments=seg, ring_count=ring)

def retning(C, A, p):
    """Punktets retning på enhetskula når ellipsoiden (C, A) skaleres til en kule."""
    d = p - C
    return V((d.x / A.x, d.y / A.y, d.z / A.z)).normalized()

def basis(d):
    d = d.normalized(); e1 = (V((0, 0, 1)) if abs(d.z) < 0.9 else V((1, 0, 0))).cross(d).normalized(); e2 = d.cross(e1)
    return e1, e2, d

def lag_kappe(navn, m, C, A, d, terskel, tykk=0.02, boelge=0.0, drypp=None, skala=1.02, seg=48, ring=28, kutt_under=None):
    """Et lag som dekker den delen av ellipsoiden som vender mot d (glasur, ost, saus).
    terskel: hvor langt ned laget går (−1…1). drypp: liste av (vinkel, dybde, bredde) som renner ned."""
    o = ellipsoide(navn, m, C, V((A.x * skala, A.y * skala, A.z * skala)), seg, ring)
    e1, e2, dd = basis(d)
    bm = bmesh.new(); bm.from_mesh(o.data); slett = []
    for v in bm.verts:
        u = retning(C, A * skala, v.co); a = math.atan2(u.dot(e2), u.dot(e1)); g = terskel + boelge * math.sin(a * 7) * (0.6 + 0.4 * math.sin(a * 3 + 1))
        if drypp:
            for a0, dyp, br in drypp:
                da = math.atan2(math.sin(a - a0), math.cos(a - a0)); g -= dyp * math.exp(-(da / br) ** 2)
        if u.dot(dd) < g or (kutt_under is not None and v.co.z < kutt_under): slett.append(v)
    bmesh.ops.delete(bm, geom=slett, context='VERTS'); bm.to_mesh(o.data); bm.free()
    so = o.modifiers.new('t', 'SOLIDIFY'); so.thickness = tykk; so.offset = 1; bruk_mod(o); glatt(o)
    return o

def ring_paa(C, A, d, nivaa, n=40, ut=1.0):
    """Punkter rundt ellipsoiden der retningen mot d er lik nivaa."""
    e1, e2, dd = basis(d); s = math.sqrt(max(0, 1 - nivaa * nivaa)); pts = []
    for i in range(n):
        a = i / n * 2 * math.pi; u = dd * nivaa + (e1 * math.cos(a) + e2 * math.sin(a)) * s
        pts.append(C + V((u.x * A.x, u.y * A.y, u.z * A.z)) * ut)
    return pts

def paa_flate(C, A, u, utenfor=0.0):
    return C + V((u.x * A.x, u.y * A.y, u.z * A.z)) + retning(C, A, C + V((u.x * A.x, u.y * A.y, u.z * A.z))) * utenfor

def skive(navn, m, p, n, r, tykk=0.018):
    o = prim('syl', navn, m, (0, 0, 0), (r, r, tykk), vertices=28, ss=1)
    o.data.transform(n.to_track_quat('Z', 'Y').to_matrix().to_4x4()); o.data.transform(Matrix.Translation(p)); return o

def blad(navn, m, p, n, s=0.07, rot=0.0):
    o = prim('kule', navn, m, (0, 0, 0), (s, s * 0.5, 0.012), (0, 0, rot), segments=16, ring_count=8)
    o.data.transform(n.to_track_quat('Z', 'Y').to_matrix().to_4x4()); o.data.transform(Matrix.Translation(p)); return o

def fibo(n, d, min_dot, max_dot, seed=3):
    """Jevnt fordelte retninger innenfor et belte rundt d."""
    e1, e2, dd = basis(d); r = random.Random(seed); ut = []
    for i in range(n):
        t = (i + 0.5) / n; c = min_dot + (max_dot - min_dot) * t; s = math.sqrt(1 - c * c); a = i * 2.39996 + r.uniform(-0.2, 0.2)
        ut.append((dd * c + (e1 * math.cos(a) + e2 * math.sin(a)) * s).normalized())
    return ut

_VAFFEL = {}
def vaffel_mat():
    if 'm' in _VAFFEL: return _VAFFEL['m']
    import numpy as np
    B = 512; u = (np.arange(B) + 0.5) / B; U, Vv = np.meshgrid(u, u)
    k = 14
    a = np.abs(((U + Vv) * k) % 1 - 0.5); b = np.abs(((U - Vv) * k) % 1 - 0.5)
    rille = np.clip((0.09 - np.minimum(a, b)) / 0.05, 0, 1)
    lys = np.array([0.93, 0.69, 0.36]); mork = np.array([0.66, 0.4, 0.17])
    f = lys[None, None, :] * (1 - rille[..., None]) + mork[None, None, :] * rille[..., None]
    f = np.where(f <= 0.04045, f / 12.92, ((f + 0.055) / 1.055) ** 2.4)
    img = bpy.data.images.new('vaffel', B, B, alpha=False)
    img.pixels.foreach_set(np.concatenate([f, np.ones((B, B, 1))], axis=2).astype(np.float32).ravel()); img.file_format = 'PNG'; img.pack()
    m = bpy.data.materials.new('vaffel'); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes.get('Principled BSDF')
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; nt.links.new(t.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.7
    _VAFFEL['m'] = m; return m

# ================================================================ matkropper
# Hver matkropp får (C, A, modus) og returnerer {'deler': [...], 'foran': V, 'topp': V, 'bak': V, 'under': z}

def mat_pizza(C, A, modus):
    skorpe = mat('skorpe', '#e2a45a', 0.65); saus = mat('saus', '#d8402e', 0.45); ost = mat('ost', '#ffd76a', 0.35)
    pepp = mat('pepperoni', '#c23a2b', 0.4); pepp_m = mat('pepperoni_mork', '#8e2219', 0.5); basil = mat('basilikum', '#3fa34d', 0.5)
    d = V((0, -1, 0.35)).normalized() if modus == 'staa' else V((0, 0, 1))
    kutt = C.z + 0.02 if modus == 'kuppel' else None
    base = ellipsoide('pizzabunn', skorpe, C, A, 56, 32)
    if kutt is not None:
        bm = bmesh.new(); bm.from_mesh(base.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < kutt], context='VERTS'); bm.to_mesh(base.data); bm.free()
    terskel = 0.25 if modus == 'kuppel' else (-0.05 if modus == 'staa' else 0.05)
    sauslag = lag_kappe('saus', saus, C, A, d, terskel, 0.018, 0.0, skala=1.01, kutt_under=kutt)
    ostlag = lag_kappe('ost', ost, C, A, d, terskel + 0.12, 0.02, 0.05, drypp=[(0.6, 0.18, 0.18), (2.4, 0.12, 0.15), (4.1, 0.2, 0.2), (5.4, 0.1, 0.14)], skala=1.025, kutt_under=kutt)
    # Skorpekanten følger grensen for sausen, som kanten på en pizza
    kant = kurve('skorpekant', [tuple(p) for p in ring_paa(C, A, d, terskel - 0.02, 56, 1.03)], 0.075, skorpe, rund=10, lukket=True, opp=3)
    for v in kant.data.vertices: v.co += (v.co - C).normalized() * 0.008 * math.sin(math.atan2(v.co.y - C.y, v.co.x - C.x) * 23)
    deler = [base, sauslag, ostlag, kant]
    for i, u in enumerate(fibo(7, d, terskel + 0.35, 0.97, 5)):
        p = paa_flate(C, A * 1.04, u); n = retning(C, A, p)
        deler.append(skive('pepp%d' % i, pepp, p + n * 0.012, n, 0.1 if i else 0.12))
        for k in range(2):
            e1, e2, _ = basis(n); a = k * 2.6 + i
            deler.append(prim('kule', 'ppm%d%d' % (i, k), pepp_m, tuple(p + n * 0.032 + (e1 * math.cos(a) + e2 * math.sin(a)) * 0.045), (0.016, 0.016, 0.006), segments=8, ring_count=5))
    for i, u in enumerate(fibo(3, d, terskel + 0.3, 0.8, 9)):
        p = paa_flate(C, A * 1.05, u); deler.append(blad('basil%d' % i, basil, p, retning(C, A, p), 0.075, i * 1.7))
    if modus == 'kuppel':
        deler.append(prim('kule', 'buk', mat('buk', '#f4e7a8', 0.6), (C.x, C.y, C.z - 0.02), (A.x * 0.9, A.y * 0.9, 0.08), segments=40, ring_count=16))
    return {'deler': deler, **ankre(C, A, modus)}

def mat_smultring(C, A, modus):
    deig = mat('deig', '#d99a52', 0.65); deig_lys = mat('deig_lys', '#f3cf92', 0.7); glasur = mat('glasur_rosa', '#ff9cc7', 0.28)
    if modus == 'staa':      # ringen står og hullet ser fram
        R, r = (A.x + A.z) / 2 * 0.6, A.y * 0.82; ak = 'Y'; opp = V((0, -1, 0.25)).normalized()
    else:
        R, r = (A.x + A.y) / 2 * 0.95, A.z * (0.62 if modus == 'kuppel' else 0.85); ak = 'Z'; opp = V((0, 0, 1))
    Cz = C.copy()
    if modus == 'kuppel': Cz.z = 0.06 + r * 0.92
    rotm = Matrix.Rotation(math.pi / 2, 4, 'X') if ak == 'Y' else Matrix.Identity(4)
    ky = (A.y / A.x) if ak == 'Z' else 1.0
    kropp = prim('torus', 'deig', deig, (0, 0, 0), (1, 1, 1), major_radius=R, minor_radius=r, major_segments=44, minor_segments=18, ss=1)
    kropp.data.transform(Matrix.Diagonal((1, ky, 0.92, 1))); kropp.data.transform(rotm); kropp.data.transform(Matrix.Translation(Cz))
    # lys stripe rundt utsiden (stekekanten)
    kropp.data.materials.append(deig_lys)
    for p in kropp.data.polygons:
        q = p.center - Cz; h = q.dot(opp)
        if abs(h) < 0.035 and (q - opp * h).length > R + r * 0.7: p.material_index = 1
    # Glasur oppå med drypp ned på utsiden
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r + 0.028, major_segments=44, minor_segments=16)
    gl = bpy.context.active_object; gl.name = 'glasur'
    gl.data.transform(Matrix.Diagonal((1, ky, 0.92, 1)))
    rr = random.Random(int(R * 1000)); drypp = [(rr.uniform(0, 6.28), rr.uniform(0.05, 0.14), rr.uniform(0.12, 0.22)) for _ in range(12)]
    bm = bmesh.new(); bm.from_mesh(gl.data); slett = []
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x); ute = V((v.co.x, v.co.y)).length > R; g = (0.02 if ute else 0.05)
        for a0, dyp, br in drypp:
            da = math.atan2(math.sin(a - a0), math.cos(a - a0))
            if ute: g -= dyp * math.exp(-(da / br * 3) ** 2)
        if v.co.z < g + 0.012 * math.sin(a * 9): slett.append(v)
    bmesh.ops.delete(bm, geom=slett, context='VERTS'); bm.to_mesh(gl.data); bm.free()
    gl.data.transform(rotm if ak == 'Y' else Matrix.Identity(4))
    if ak == 'Y': gl.data.transform(Matrix.Rotation(-0.25, 4, 'X'))
    gl.data.transform(Matrix.Translation(Cz))
    so = gl.modifiers.new('t', 'SOLIDIFY'); so.thickness = 0.022; so.offset = 1; bruk_mod(gl); subsurf(gl, 1); glatt(gl); sett_mat(gl, glasur)
    pk = overflatepunkter(gl, 30, lambda p, n: n.dot(opp) > 0.7)
    stro = strossel('stro', pk, ['#ffffff', '#ffd23f', '#7fd6ff', '#7a4cff'], 0.065, 0.011)
    if ak == 'Z':
        foran = Cz + V((0, -(R + r * (0.55 if modus == 'ligg' else 0.9)) * ky, 0.18)); topp = Cz + V((0, 0, r)); bak = Cz + V((0, (R + r * 0.8) * ky, 0.05))
    else:
        foran = Cz + V((0, -r, 0)); topp = Cz + V((0, 0, R + r * 0.85)); bak = Cz + V((0, r, 0))
    return {'deler': [kropp, gl] + stro, 'foran': foran, 'topp': topp, 'bak': bak, 'under': Cz.z - (r if ak == 'Z' else R + r)}

def mat_is(C, A, modus):
    vaf = vaffel_mat(); is_r = mat('is_jordbaer', '#ffb3c8', 0.42); is_v = mat('is_vanilje', '#fff1d6', 0.42); kirs = mat('kirsebaer', '#e0213c', 0.15)
    krem = mat('krem', '#fffaf4', 0.3); sjok = mat('sjokosaus', '#6b3a22', 0.3)
    deler = []
    if modus == 'staa':
        # Vaffelkjeks som kropp nederst og en stor iskule over, med saus som renner ned på kjeksen
        topp_k = C.z + A.z * 0.1
        kj = prim('kjegle', 'kjeks', vaf, (C.x, C.y, (0.1 + topp_k) / 2), (A.x * 0.95, A.y * 0.95, (topp_k - 0.1) / 2), (math.pi, 0, 0), vertices=40, ss=0)
        kant = prim('torus', 'kjekskant', vaf, (C.x, C.y, topp_k), (1, A.y / A.x, 1), major_radius=A.x * 0.95, minor_radius=0.05, major_segments=48, minor_segments=12)
        Ck = V((C.x, C.y, topp_k + A.x * 0.72)); Ak = V((A.x * 1.02, A.y * 1.02, A.x * 0.92))
        kule = ellipsoide('iskule', is_r, Ck, Ak)
        drypp = lag_kappe('isdrypp', is_r, Ck, Ak, V((0, 0, 1)), -0.55, 0.03, 0.0, drypp=[(a, 0.25, 0.18) for a in (0.4, 1.6, 2.9, 4.0, 5.3)], skala=1.01)
        sausk = lag_kappe('sjokosaus', sjok, Ck, Ak, V((0, 0, 1)), 0.45, 0.02, 0.06, drypp=[(1.0, 0.25, 0.15), (3.2, 0.3, 0.18), (5.0, 0.2, 0.14)], skala=1.03)
        deler += [kj, kant, kule, drypp, sausk]
        topp = Ck + V((0, 0, Ak.z * 0.9)); foran = Ck + V((0, -Ak.y, 0)); bak = Ck + V((0, Ak.y, 0)); under = 0.08
        stro = strossel('stro', [(paa_flate(Ck, Ak * 1.04, u), u) for u in fibo(22, V((0, 0, 1)), 0.55, 0.98)], ['#ffd23f', '#7fd6ff', '#ffffff'], 0.06, 0.01)
        deler += stro
        return {'deler': deler, 'foran': foran, 'topp': topp, 'bak': bak, 'under': under}
    # ligg og kuppel: iskuler i en vaffelskål
    kutt = C.z - (0.0 if modus == 'kuppel' else A.z * 0.15)
    skaal = ellipsoide('vaffelskaal', vaf, C, A * 1.03, 56, 32)
    bm = bmesh.new(); bm.from_mesh(skaal.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > kutt], context='VERTS'); bm.to_mesh(skaal.data); bm.free()
    so = skaal.modifiers.new('t', 'SOLIDIFY'); so.thickness = 0.03; bruk_mod(skaal); glatt(skaal)
    kant = kurve('vaffelkant', [tuple(p) for p in ring_paa(C, A, V((0, 0, 1)), (kutt - C.z) / A.z, 56, 1.04)], 0.05, vaf, rund=8, lukket=True, opp=3)
    deler += [skaal, kant]
    if modus == 'kuppel':
        kuler = [(V((0, 0, 0)), V((A.x * 0.98, A.y * 0.98, A.z * 0.95)), is_r)]
    else:
        # to kuler etter hverandre gir en kropp med form (jordbær foran, vanilje bak)
        kuler = [(V((0, -A.y * 0.38, 0.02)), V((A.x * 0.95, A.y * 0.62, A.z * 1.05)), is_r), (V((0, A.y * 0.4, 0.06)), V((A.x * 0.92, A.y * 0.6, A.z * 1.1)), is_v)]
    for i, (off, Ak, m) in enumerate(kuler):
        Ck = C + off; k = ellipsoide('iskule%d' % i, m, Ck, Ak)
        bm = bmesh.new(); bm.from_mesh(k.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < kutt - 0.02], context='VERTS'); bm.to_mesh(k.data); bm.free()
        dr = lag_kappe('drypp%d' % i, m, Ck, Ak, V((0, 0, 1)), (kutt - Ck.z) / Ak.z + 0.12, 0.03, 0.0, drypp=[(a + i, 0.22, 0.2) for a in (0.3, 1.5, 2.7, 3.9, 5.1)], skala=1.012)
        deler += [k, dr]
    Ct = C + kuler[0][0]; At = kuler[0][1]
    sausk = lag_kappe('sjokosaus', sjok, Ct, At, V((0, 0, 1)), 0.55, 0.02, 0.06, drypp=[(1.0, 0.22, 0.15), (3.2, 0.25, 0.18), (5.0, 0.18, 0.14)], skala=1.03)
    deler.append(sausk)
    toppunkt = C + kuler[-1][0] + V((0, 0, kuler[-1][1].z)) if modus != 'kuppel' else C + V((0, 0, A.z * 0.95))
    deler.append(prim('kule', 'krem', krem, tuple(toppunkt + V((0, 0, 0.04))), (0.11, 0.11, 0.07), segments=24, ring_count=12, ss=0))
    deler.append(prim('kule', 'kirsebaer', kirs, tuple(toppunkt + V((0, 0, 0.14))), (0.075,) * 3, segments=24, ring_count=14))
    deler.append(kurve('stilk', [tuple(toppunkt + V((0, 0, 0.2))), tuple(toppunkt + V((0.02, 0.03, 0.27))), tuple(toppunkt + V((0.06, 0.05, 0.3)))], 0.01, mat('stilk', '#5b8a2f', 0.6)))
    deler += strossel('stro', [(paa_flate(Ct, At * 1.04, u), u) for u in fibo(20, V((0, 0, 1)), 0.5, 0.95)], ['#ffd23f', '#7fd6ff', '#ffffff'], 0.06, 0.01)
    return {'deler': deler, **ankre(C, A, modus)}

def mat_banan(C, A, modus):
    skall = mat('bananskall', '#ffd84a', 0.5); skall_inn = mat('skall_inn', '#fff4c9', 0.6); kjott = mat('banankjott', '#fff0b8', 0.55)
    brun = mat('bananbrun', '#6b4a22', 0.6)
    deler = []
    if modus == 'kuppel':
        # Skjoldet er en banan som er skrelt opp: lys banan i midten og fem skallflik som legger seg ut over ryggen
        Ck = C.copy()
        dome = ellipsoide('kjott', kjott, Ck, V((A.x * 0.62, A.y * 0.62, A.z * 1.05)))
        bm = bmesh.new(); bm.from_mesh(dome.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < C.z], context='VERTS'); bm.to_mesh(dome.data); bm.free()
        deler.append(dome)
        for i in range(5):
            a = i / 5 * 2 * math.pi + 0.3; pts = []
            for k in range(7):
                t = k / 6; vv = 0.05 + t * 1.45
                n = V((math.cos(a) * math.sin(vv), math.sin(a) * math.sin(vv), math.cos(vv)))
                pts.append(tuple(C + V((n.x * A.x * (0.75 + 0.3 * t), n.y * A.y * (0.75 + 0.3 * t), max(-0.02, n.z) * A.z * 1.05))))
            fl = kurve('flik%d' % i, pts, 0.13, skall, rund=10, opp=4, avsmal=lambda t: 0.45 + 0.75 * math.sin(math.pi * min(1, t * 1.05)) ** 0.6)
            fl.data.transform(Matrix.Translation(-C)); fl.data.transform(Matrix.Diagonal((1, 1, 0.75, 1))); fl.data.transform(Matrix.Translation(C))
            deler.append(fl)
        deler.append(prim('syl', 'stilk', brun, tuple(C + V((0, 0, A.z * 1.08))), (0.05, 0.05, 0.06), vertices=12, ss=1))
        deler.append(prim('kule', 'buk', mat('buk', '#f4e7a8', 0.6), (C.x, C.y, C.z - 0.02), (A.x * 0.9, A.y * 0.9, 0.08), segments=40, ring_count=16))
        return {'deler': deler, **ankre(C, A, modus)}
    # ligg og staa: en buet banan med brun stilk i den ene enden og skrelt opp i den andre (som 🍌).
    # Liggende: stilken er foran ved hodet, og den skrelte enden er bak. Stående: skrelt opp på toppen, og hodet sitter på bananen.
    langs = V((0, 0, 1)) if modus == 'staa' else V((0, 1, 0)); bue = V((0, 1, 0)) if modus == 'staa' else V((0, 0, 1))
    L = (A.z if modus == 'staa' else A.y) * 1.2; tyk = (A.x if modus == 'staa' else A.z) * 0.95
    def punkt(t):   # t: -1 (stilk) … 1 (skrelt ende)
        return C + langs * (t * L) + bue * ((0.3 * L * (t * t) - 0.1 * L) if modus == 'ligg' else -0.18 * L * (t * t))
    def radius(u):  # u: 0 (stilk) … 1
        return tyk * (0.16 + 0.84 * math.sin(math.pi * min(1.0, u * 0.62 + 0.02)) ** 0.5)
    tsk = [i / 10 * 1.6 - 1 for i in range(11)]            # skallet: fra stilken til 60 % mot den skrelte enden
    deler.append(kurve('skall', [tuple(punkt(t)) for t in tsk], tyk, skall, rund=12, opp=6, avsmal=lambda u: radius(u) / tyk))
    tk = [0.35 + i * 0.07 for i in range(10)]
    deler.append(kurve('kjott', [tuple(punkt(t)) for t in tk], tyk * 0.8, kjott, rund=12, opp=6, avsmal=lambda u: 1 - 0.5 * u ** 2))
    stilk = punkt(-1.0); deler.append(prim('kule', 'stilk', brun, tuple(stilk), (tyk * 0.2,) * 3, segments=16, ring_count=10))
    # Kantene på skallet: fem tynne linjer langs bananen
    kantm = mat('bananlinje', '#e3b42a', 0.5)
    for j in range(5):
        a = j / 5 * 2 * math.pi + 0.3; pts = []
        for i, t in enumerate(tsk):
            tan = (punkt(min(1, t + 0.05)) - punkt(max(-1, t - 0.05))).normalized(); e1, e2, _ = basis(tan)
            pts.append(tuple(punkt(t) + (e1 * math.cos(a) + e2 * math.sin(a)) * radius(i / (len(tsk) - 1)) * 1.01))
        deler.append(kurve('kant%d' % j, pts, 0.012, kantm, rund=4, opp=4))
    # Fire myke skallflik som er skrelt tilbake og henger ned
    p0 = punkt(0.6); fram = (punkt(0.7) - punkt(0.5)).normalized(); e1, e2, _ = basis(fram)
    for i in range(4):
        a = i / 4 * 2 * math.pi + math.pi / 4; ut = (e1 * math.cos(a) + e2 * math.sin(a))
        z = (ut * 0.75 - fram * 0.55 + V((0, 0, -0.35))).normalized()
        y = (ut - z * ut.dot(z)).normalized(); x = y.cross(z)
        lang = 0.26
        fl = prim('kule', 'flik%d' % i, skall, (0, 0, 0), (tyk * 0.55, 0.03, lang), segments=24, ring_count=12)
        for v in fl.data.vertices: v.co.y += 0.07 * ((v.co.z / lang + 1) / 2) ** 2      # bøyer seg utover mot tuppen
        fl.data.materials.append(skall_inn)
        for p_ in fl.data.polygons:
            if p_.normal.y < -0.2: p_.material_index = 1
        fl.data.transform(Matrix.Translation((0, 0, lang * 0.85)))
        fl.data.transform(Matrix((x, y, z)).transposed().to_4x4()); fl.data.transform(Matrix.Translation(p0 + ut * radius(0.95) * 0.9))
        deler.append(fl)
    if modus == 'ligg':
        foran, bak, topp = punkt(-0.92), punkt(1.0), punkt(0.0) + V((0, 0, tyk))
    else:
        foran, bak, topp = punkt(0.2) + V((0, -tyk, 0)), punkt(0.2) + V((0, tyk, 0)), punkt(1.0) + V((0, 0, -0.04))
    return {'deler': deler, 'foran': foran, 'topp': topp, 'bak': bak, 'under': min(punkt(t).z for t in tsk) - tyk * 0.9}

def ankre(C, A, modus):
    if modus == 'staa': return {'foran': C + V((0, -A.y, 0)), 'topp': C + V((0, 0, A.z)), 'bak': C + V((0, A.y, 0)), 'under': C.z - A.z}
    if modus == 'kuppel': return {'foran': C + V((0, -A.y, 0.1)), 'topp': C + V((0, 0, A.z)), 'bak': C + V((0, A.y, 0.05)), 'under': C.z - 0.1}
    return {'foran': C + V((0, -A.y * 0.92, A.z * 0.35)), 'topp': C + V((0, 0, A.z)), 'bak': C + V((0, A.y * 0.95, 0.05)), 'under': C.z - A.z}

MAT = {'pizza': mat_pizza, 'smultring': mat_smultring, 'is': mat_is, 'banan': mat_banan}
MATNAVN = {'pizza': 'Pizza', 'smultring': 'Donut', 'is': 'Is', 'banan': 'Banan'}

# ================================================================ dyresett
def ku(matkropp):
    hvit = mat('ku_hvit', '#fbf7f2', 0.55); mule = mat('mule', '#ffb3c1', 0.5); klov = mat('klov', '#4a3529', 0.5)
    horn = mat('horn', '#f6e3b4', 0.45); sort = mat('ku_sort', '#2b2630', 0.55)
    C, A = V((0, 0, 0.6)), V((0.44, 0.52, 0.3))
    k = MAT[matkropp](C, A, 'ligg')
    f = k['foran']; hx, hy, hz = f.x, f.y - 0.05, f.z + 0.05
    hd = [prim('kule', 'hodekule', hvit, (hx, hy - 0.08, hz + 0.04), (0.27, 0.24, 0.25), segments=40, ring_count=24)]
    hd.append(prim('kule', 'hodeflekk', sort, (hx + 0.12, hy - 0.2, hz + 0.13), (0.12, 0.09, 0.1), segments=24, ring_count=14))
    hd.append(prim('kule', 'mule', mule, (hx, hy - 0.27, hz - 0.08), (0.22, 0.13, 0.14), segments=40, ring_count=20))
    for s in (-1, 1):
        hd.append(prim('kule', 'nese%d' % s, mat('nesebor', '#c25b78', 0.5), (hx + s * 0.075, hy - 0.395, hz - 0.06), (0.03, 0.018, 0.04), segments=12, ring_count=8))
        hd += oye('oye%d' % s, (hx + s * 0.11, hy - 0.27, hz + 0.1), 0.058)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.2, hy - 0.22, hz - 0.03), 0.045))
        hd.append(kurve('horn%d' % s, [(hx + s * 0.12, hy - 0.08, hz + 0.17), (hx + s * 0.22, hy - 0.08, hz + 0.25), (hx + s * 0.26, hy - 0.1, hz + 0.36)], 0.055, horn, avsmal=lambda t: 1 - 0.7 * t))
        hd.append(prim('kule', 'ore%d' % s, hvit, (hx + s * 0.27, hy - 0.04, hz + 0.08), (0.12, 0.05, 0.065), (0, s * -0.3, s * 0.35), segments=20, ring_count=12))
        hd.append(prim('kule', 'oreinn%d' % s, mule, (hx + s * 0.28, hy - 0.075, hz + 0.08), (0.08, 0.02, 0.04), (0, s * -0.3, s * 0.35), segments=16, ring_count=10))
    hd.append(smil('smil', (hx, hy - 0.395, hz - 0.14), 0.05))
    hd.append(prim('syl', 'hals', hvit, (hx, hy + 0.1, hz - 0.08), (0.15, 0.15, 0.12), (1.3, 0, 0), vertices=24, ss=1))
    hd.append(prim('torus', 'bjellerem', mat('rem', '#d8402e', 0.5), (hx, hy + 0.04, hz - 0.17), (1, 1, 1), (1.2, 0, 0), major_radius=0.15, minor_radius=0.025, major_segments=32, minor_segments=8))
    hd.append(prim('kule', 'bjelle', mat('bjelle', '#ffd23f', 0.25, met=0.6), (hx, hy - 0.12, hz - 0.27), (0.06, 0.06, 0.07), segments=20, ring_count=12))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.1, hz - 0.05))
    under = k['under']; bein = []
    for i, (bx, by) in enumerate([(-0.28, -0.3), (0.28, -0.3), (-0.28, 0.3), (0.28, 0.3)]):
        topp = under + 0.08; lengde = topp - 0.02
        b = [prim('kule', 'bein%d' % i, hvit, (bx, by, lengde / 2 + 0.06), (0.09, 0.09, lengde / 2 + 0.04), segments=24, ring_count=16)]
        b.append(prim('kule', 'flekkbein%d' % i, sort, (bx + 0.02, by - 0.06, lengde * 0.6), (0.05, 0.03, 0.06), segments=12, ring_count=8)) if i % 2 == 0 else None
        b.append(prim('kule', 'klov%d' % i, klov, (bx, by - 0.01, 0.06), (0.1, 0.1, 0.07), segments=20, ring_count=10))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], [x for x in b if x]), (bx, by, topp)))
    bk = k['bak']
    hale = [kurve('halestrå', [tuple(bk), tuple(bk + V((0, 0.12, -0.05))), tuple(bk + V((0.03, 0.18, -0.24)))], 0.022, hvit)]
    hale.append(prim('kule', 'haledusk', sort, tuple(bk + V((0.03, 0.2, -0.3))), (0.06, 0.06, 0.09), segments=16, ring_count=10))
    hale = pivot(slaa_sammen('hale', hale), tuple(bk))
    return slaa_sammen('kropp', k['deler']), hode, [hale] + bein

def pingvin(matkropp):
    blekk = mat('pingvin_mork', '#2c3446', 0.5); hvit = mat('ansikt', '#f4f1ea', 0.55); nebb = mat('nebb', '#ff9a2e', 0.4)
    C, A = V((0, 0.02, 0.62)), V((0.4, 0.36, 0.5))
    k = MAT[matkropp](C, A, 'staa')
    t = k['topp']; hx, hy, hz = t.x, t.y - 0.04, t.z + 0.2
    hd = [prim('kule', 'hodekule', blekk, (hx, hy, hz), (0.25, 0.23, 0.24), segments=40, ring_count=24)]
    hd.append(prim('kule', 'maske', hvit, (hx, hy - 0.11, hz - 0.03), (0.21, 0.13, 0.17), segments=40, ring_count=24))
    hd.append(prim('kjegle', 'nebb', nebb, (hx, hy - 0.27, hz - 0.05), (0.07, 0.05, 0.11), (math.pi / 2 + 0.15, 0, 0), vertices=20, ss=1))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.09, hy - 0.22, hz + 0.04), 0.05)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.15, hy - 0.2, hz - 0.06), 0.035))
    hd.append(prim('syl', 'hals', blekk, (hx, hy + 0.02, hz - 0.2), (0.15, 0.15, 0.1), vertices=24, ss=1))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy, hz - 0.18))
    # Myke luffer som vokser ut fra sidene
    vinger = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        w = prim('kule', navn + '_f', blekk, (0, 0, 0), (0.07, 0.12, 0.25), segments=32, ring_count=20)
        for vt in w.data.vertices:
            tt = (vt.co.z + 0.25) / 0.5; vt.co.y *= 0.75 + 0.35 * tt; vt.co.x *= 0.7 + 0.3 * tt; vt.co.x += s * 0.05 * (1 - tt) ** 2
        sx = (A.x + 0.04) if matkropp != 'smultring' else 0.5
        w.data.transform(Matrix.Rotation(-s * 0.35, 4, 'Y')); w.data.transform(Matrix.Translation((s * sx, C.y + 0.02, C.z + 0.08)))
        vinger.append(pivot(slaa_sammen(navn, [w]), (s * (sx - 0.04), C.y + 0.02, C.z + 0.28)))
    bein = []
    for i, s in enumerate((-1, 1)):
        f = prim('kule', 'fot%d' % i, nebb, (s * 0.15, -0.16, 0.04), (0.1, 0.14, 0.035), (0, 0, s * 0.25), segments=24, ring_count=12)
        legg = prim('syl', 'legg%d' % i, nebb, (s * 0.15, -0.06, (0.06 + max(0.1, k['under'])) / 2 + 0.02), (0.035, 0.035, max(0.03, (k['under'] - 0.06) / 2 + 0.03)), vertices=12)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf'][i], [f, legg]), (s * 0.15, -0.04, max(0.12, k['under']))))
    return slaa_sammen('kropp', k['deler']), hode, vinger + bein

def skilpadde(matkropp):
    hud = mat('skilpadde', '#86cf6a', 0.55)
    C, A = V((0, 0, 0.28)), V((0.62, 0.68, 0.42))
    k = MAT[matkropp](C, A, 'kuppel')
    hx, hy, hz = 0, min(-A.y - 0.1, k['foran'].y - 0.12), C.z + 0.14
    hd = [prim('kule', 'hode', hud, (hx, hy, hz), (0.22, 0.23, 0.21), segments=40, ring_count=24)]
    hd.append(prim('syl', 'hals', hud, (hx, hy + 0.15, hz - 0.06), (0.12, 0.12, 0.13), (1.2, 0, 0), vertices=24, ss=1))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.1, hy - 0.16, hz + 0.08), 0.06)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.16, hy - 0.15, hz - 0.03), 0.04))
    hd.append(smil('smil', (hx, hy - 0.225, hz - 0.04), 0.07))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.2, hz - 0.08))
    bein = []
    for i, (bx, by, rz) in enumerate([(-0.45, -0.42, 0.5), (0.45, -0.42, -0.5), (-0.45, 0.42, -0.4), (0.45, 0.42, 0.4)]):
        f = prim('kule', 'fot%d' % i, hud, (bx * 1.05, by * 1.05, 0.13), (0.15, 0.17, 0.11), (0, 0, rz), segments=24, ring_count=14)
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], [f]), (bx * 0.8, by * 0.8, C.z)))
    hale = pivot(slaa_sammen('hale', [prim('kjegle', 'hale', hud, (0, A.y + 0.1, 0.18), (0.07, 0.07, 0.14), (-1.4, 0, 0), vertices=16, ss=1)]), (0, A.y - 0.02, 0.2))
    return slaa_sammen('kropp', k['deler']), hode, [hale] + bein

def hval(matkropp):
    bla = mat('hval_bla', '#4f8fe0', 0.45); buk = mat('hval_buk', '#dfeeff', 0.5); vann = mat('vannsprut', '#bfe8ff', 0.15, emit=0.15)
    C, A = V((0, 0.12, 0.48)), V((0.46, 0.5, 0.38))
    k = MAT[matkropp](C, A, 'ligg')
    f = k['foran']; hx, hy, hz = 0, f.y - 0.12, C.z + 0.02
    # Stort, rundt hvalhode foran maten, med lys buk og bredt smil
    hd = [prim('kule', 'hvalhode', bla, (hx, hy, hz), (0.44, 0.36, 0.4), segments=48, ring_count=28)]
    hd.append(prim('kule', 'hvalbuk', buk, (hx, hy - 0.07, hz - 0.15), (0.38, 0.3, 0.26), segments=40, ring_count=24))
    for i in range(5):
        hd.append(kurve('buklinje%d' % i, [(hx - 0.22 + i * 0.11, hy - 0.3, hz - 0.12), (hx - 0.22 + i * 0.11, hy - 0.2, hz - 0.33), (hx - 0.22 + i * 0.11, hy + 0.0, hz - 0.37)], 0.008, mat('linje', '#b9d2f0', 0.6), rund=4, opp=4))
    for s in (-1, 1):
        hd += oye('oye%d' % s, (hx + s * 0.2, hy - 0.27, hz + 0.08), 0.06)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.28, hy - 0.22, hz - 0.04), 0.045))
    hd.append(smil('smil', (hx, hy - 0.355, hz - 0.08), 0.13, tykk=0.015))
    # Vannsprut fra blåsehullet
    for j, (dx, dz, r) in enumerate([(0, 0.0, 0.05), (0, 0.12, 0.045), (-0.06, 0.2, 0.04), (0.06, 0.2, 0.04), (-0.11, 0.24, 0.035), (0.11, 0.24, 0.035)]):
        hd.append(prim('kule', 'sprut%d' % j, vann, (hx + dx, hy + 0.05, hz + 0.42 + dz), (r,) * 3, segments=14, ring_count=8))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.2, hz))
    # Halefinne bak og to sideluffer
    bk = k['bak']
    hv = [kurve('halerot', [tuple(bk + V((0, -0.05, 0))), tuple(bk + V((0, 0.18, 0.08))), tuple(bk + V((0, 0.32, 0.2)))], 0.11, bla, rund=10, opp=4, avsmal=lambda t: 1 - 0.5 * t)]
    for s in (-1, 1):
        fl = prim('kule', 'flak%d' % s, bla, (0, 0, 0), (0.22, 0.1, 0.035), (0.0, s * 0.25, s * 0.35), segments=24, ring_count=12)
        fl.data.transform(Matrix.Translation(bk + V((s * 0.17, 0.38, 0.28)))); hv.append(fl)
    hale = pivot(slaa_sammen('hale', hv), tuple(bk))
    vinger = []
    for s, navn in [(-1, 'vinge_v'), (1, 'vinge_h')]:
        w = prim('kule', navn + '_f', bla, (0, 0, 0), (0.2, 0.09, 0.035), (0.0, -s * 0.5, s * 0.5), segments=24, ring_count=12)
        w.data.transform(Matrix.Translation((s * 0.42, hy + 0.12, hz - 0.22))); vinger.append(pivot(slaa_sammen(navn, [w]), (s * 0.3, hy + 0.12, hz - 0.2)))
    return slaa_sammen('kropp', k['deler']), hode, [hale] + vinger

DYR = {'ku': ku, 'pingvin': pingvin, 'skilpadde': skilpadde, 'hval': hval}
DYRNAVN = {'ku': 'ku', 'pingvin': 'pingvin', 'skilpadde': 'skilpadde', 'hval': 'hval'}

def lag(dyr, matkropp):
    H.nullstill(); H.MATS.clear(); _VAFFEL.clear(); H.rnd.seed(7)
    kropp, hode, rest = DYR[dyr](matkropp)
    navn = MATNAVN[matkropp] + DYRNAVN[dyr]
    rot = rot_node(navn); forelder([kropp, hode] + rest, rot)
    H.eksporter(rot, 'pilot_%s_%s' % (dyr, matkropp))

if __name__ == '__main__':
    liste = os.environ.get('FIGURER')
    par = [p.split(':') for p in liste.split(',')] if liste else [(d, m) for d in DYR for m in MAT]
    for d, m in par: lag(d, m)
