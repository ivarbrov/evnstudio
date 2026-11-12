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
        # Even 12.11.2026: «det mangler hull i donuten». Større ring og tynnere deig gir et tydelig hull; ringen gjøres dypere så den ikke blir flat.
        R, r = (A.x + A.z) / 2 * 0.8, A.y * 0.52; ak = 'Y'; opp = V((0, -1, 0.25)).normalized()
    else:
        R, r = (A.x + A.y) / 2 * 0.95, A.z * (0.62 if modus == 'kuppel' else 0.85); ak = 'Z'; opp = V((0, 0, 1))
    Cz = C.copy()
    if modus == 'kuppel': Cz.z = 0.06 + r * 0.92
    rotm = Matrix.Rotation(math.pi / 2, 4, 'X') if ak == 'Y' else Matrix.Identity(4)
    ky = (A.y / A.x) if ak == 'Z' else 1.0
    kropp = prim('torus', 'deig', deig, (0, 0, 0), (1, 1, 1), major_radius=R, minor_radius=r, major_segments=44, minor_segments=18, ss=1)
    dyp = 1.4 if modus == 'staa' else 0.92
    kropp.data.transform(Matrix.Diagonal((1, ky, dyp, 1))); kropp.data.transform(rotm); kropp.data.transform(Matrix.Translation(Cz))
    # lys stripe rundt utsiden (stekekanten)
    kropp.data.materials.append(deig_lys)
    for p in kropp.data.polygons:
        q = p.center - Cz; h = q.dot(opp)
        if abs(h) < 0.035 and (q - opp * h).length > R + r * 0.7: p.material_index = 1
    # Glasur oppå med drypp ned på utsiden
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r + 0.028, major_segments=44, minor_segments=16)
    gl = bpy.context.active_object; gl.name = 'glasur'
    gl.data.transform(Matrix.Diagonal((1, ky, dyp, 1)))
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
        foran = Cz + V((0, -r * dyp, 0)); topp = Cz + V((0, 0, R + r * 0.85)); bak = Cz + V((0, r * dyp * 0.9, -R * 0.85))   # halen festes nede på ringen, ikke i hullet
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

# ---------------------------------------------------------------- bolk 1 (ku og gris): burger, spagetti, taco, sjoko, jordbær, milkshake
def kutt(o, f):
    """Sletter hjørnene der f(co) er sann."""
    bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if f(v.co)], context='VERTS'); bm.to_mesh(o.data); bm.free(); return o

def bulk(o, C, styrke, frekv=9.0, seed=0):
    """Myke ujevnheter langs overflaten (kjøtt, deig)."""
    r = random.Random(seed); a, b, c = (r.uniform(0, 6) for _ in range(3))
    for v in o.data.vertices:
        d = (v.co - C); n = d.normalized() if d.length > 1e-6 else V((0, 0, 1))
        v.co += n * styrke * (math.sin(v.co.x * frekv + a) * math.sin(v.co.y * frekv + b) + 0.5 * math.sin(v.co.z * frekv * 1.7 + c))
    return o

def opp_retning(modus):
    return V((0, -1, 0.35)).normalized() if modus == 'staa' else V((0, 0, 1))

def mat_burger(C, A, modus):
    brod = mat('burgerbrod', '#e8a24c', 0.55); brod_lys = mat('burgerbrod_lys', '#f6d39a', 0.65); kjott = mat('burgerkjott', '#6e3b22', 0.7)
    ost = mat('burgerost', '#ffc93c', 0.35); salat = mat('salat', '#5cc24a', 0.5); tomat = mat('tomat', '#e8402f', 0.4); sesam = mat('sesam', '#fff3d6', 0.5)
    lag = lambda t: C + V((0, 0, A.z * t))
    # Bunnbrød (flat underside), kjøtt, ost med drypp, salatkant, tomat og et høyt toppbrød med sesamfrø
    bunn = kutt(ellipsoide('bunnbrod', brod, lag(-0.5), V((A.x * 0.98, A.y * 0.98, A.z * 0.5)), 48, 24), lambda co: co.z > C.z - A.z * 0.42)
    bunnlokk = ellipsoide('bunnkutt', brod_lys, lag(-0.42), V((A.x * 0.96, A.y * 0.96, 0.02)), 40, 8)
    Ck = lag(-0.22); Ak = V((A.x * 1.06, A.y * 1.06, A.z * 0.2))
    patty = bulk(ellipsoide('kjott', kjott, Ck, Ak, 48, 20), Ck, 0.012, 22, 4); glatt(patty)
    ostlag = lag_kappe('ost', ost, Ck, Ak, V((0, 0, 1)), 0.35, 0.018, 0.0, drypp=[(a, 0.75, 0.16) for a in (0.2, 1.3, 2.4, 3.6, 4.8, 5.7)], skala=1.03)
    sal = []
    for i in range(2):
        pts = [tuple(p + V((0, 0, 0.018 * math.sin(k * 0.9 + i * 2)))) for k, p in enumerate(ring_paa(lag(-0.02 + i * 0.03), V((A.x * (1.08 - i * 0.04), A.y * (1.08 - i * 0.04), 0.001)), V((0, 0, 1)), 0.0, 64, 1.0))]
        sal.append(kurve('salat%d' % i, pts, 0.035, salat, rund=6, lukket=True, opp=2))
    tom = []
    for i, a in enumerate((0.6, 2.2, 3.9, 5.3)):
        p = lag(0.06) + V((math.cos(a) * A.x * 0.9, math.sin(a) * A.y * 0.9, 0))
        tom.append(prim('syl', 'tomat%d' % i, tomat, tuple(p), (0.13, 0.13, 0.025), vertices=24, ss=1))
    Ct = lag(0.18); At = V((A.x * 1.02, A.y * 1.02, A.z * 0.95))
    topp = kutt(ellipsoide('toppbrod', brod, Ct, At, 56, 30), lambda co: co.z < Ct.z - 0.01)
    deler = [bunn, bunnlokk, patty, ostlag] + sal + tom + [topp]
    seeds = []
    for i, u in enumerate(fibo(26, V((0, 0, 1)), 0.25, 0.97, 11)):
        pp = paa_flate(Ct, At * 1.005, u); n = retning(Ct, At, pp)
        o = prim('kule', 'sesam%d' % i, sesam, (0, 0, 0), (0.028, 0.016, 0.01), (0, 0, i * 1.3), segments=8, ring_count=5)
        o.data.transform(n.to_track_quat('Z', 'Y').to_matrix().to_4x4()); o.data.transform(Matrix.Translation(pp)); seeds.append(o)
    deler.append(slaa_sammen('sesamfro', seeds))
    return {'deler': deler, 'foran': C + V((0, -A.y * 0.9, A.z * 0.35)), 'topp': Ct + V((0, 0, At.z)), 'bak': C + V((0, A.y * 0.95, 0.02)), 'under': C.z - A.z}

def pastastreng(C, A, r, start, lengde=14, steg=0.22, ut=1.04):
    """En slynget pastastreng som vandrer over ellipsoiden i skiftende retning."""
    u = start.normalized(); e1, e2, _ = basis(u); t = (e1 * math.cos(r.uniform(0, 6.28)) + e2 * math.sin(r.uniform(0, 6.28))).normalized(); pts = []
    for k in range(lengde):
        pts.append(tuple(paa_flate(C, A * ut, u) + retning(C, A, paa_flate(C, A, u)) * (0.012 * math.sin(k * 1.7))))
        sving = r.uniform(-0.9, 0.9); n = u; b = n.cross(t).normalized()
        t = (t * math.cos(sving) + b * math.sin(sving)).normalized()
        u = (u + t * steg).normalized(); t = (t - u * t.dot(u)).normalized()
    return pts

def mat_spagetti(C, A, modus):
    pasta = mat('pasta', '#f6d58b', 0.5); pasta_m = mat('pasta_mork', '#e9bd62', 0.5); saus = mat('tomatsaus', '#d23a26', 0.4)
    kjb = mat('kjottboller', '#7a3e24', 0.7); pers = mat('persille', '#3e9c3a', 0.5); parm = mat('parmesan', '#fffbe8', 0.6)
    d = opp_retning(modus); r = random.Random(17); deler = []
    # Kroppen er en haug med spagetti: en myk kjerne med mange slyngede, kryssende strenger rundt (ikke parallelle ringer)
    kjerne = ellipsoide('pastakjerne', pasta_m, C, A * 0.98, 40, 24); deler.append(kjerne)
    for i, u in enumerate(fibo(34, d, -0.85, 0.98, 21)):
        deler.append(kurve('streng%d' % i, pastastreng(C, A, r, u, lengde=12 + i % 5, steg=0.2 + 0.05 * (i % 3)), 0.026, pasta if i % 3 else pasta_m, rund=4, opp=3))
    # Noen løse strenger som henger ned fra sausen
    for i in range(5):
        a = i / 5 * 6.28 + 0.4; p0 = paa_flate(C, A * 1.04, (d * 0.3 + V((math.cos(a), math.sin(a), 0)) * 0.95).normalized())
        deler.append(kurve('los%d' % i, [tuple(p0), tuple(p0 + V((math.cos(a) * 0.06, math.sin(a) * 0.06, -0.12))), tuple(p0 + V((math.cos(a) * 0.05, math.sin(a) * 0.05, -0.24)))], 0.022, pasta, rund=4, opp=4))
    sauslag = lag_kappe('saus', saus, C, A, d, 0.42, 0.026, 0.06, drypp=[(0.5, 0.25, 0.2), (1.9, 0.3, 0.16), (3.3, 0.22, 0.2), (4.6, 0.32, 0.18), (5.7, 0.2, 0.15)], skala=1.06)
    deler.append(sauslag)
    for i, u in enumerate(fibo(3, d, 0.72, 0.97, 4)):
        pp = paa_flate(C, A * 1.1, u); deler.append(bulk(prim('kule', 'kjottbolle%d' % i, kjb, tuple(pp), (0.105,) * 3, segments=20, ring_count=12), pp, 0.006, 40, i))
    for i, u in enumerate(fibo(10, d, 0.55, 0.98, 8)):
        pp = paa_flate(C, A * 1.08, u); deler.append(blad('persille%d' % i, pers, pp, retning(C, A, pp), 0.03, i))
    for i, u in enumerate(fibo(14, d, 0.5, 0.98, 12)):
        pp = paa_flate(C, A * 1.07, u); deler.append(prim('kube', 'parm%d' % i, parm, tuple(pp), (0.014, 0.01, 0.006), (i, i * 2, 0), ss=0))
    return {'deler': deler, **ankre(C, A, modus)}

def mat_taco(C, A, modus):
    skall = mat('tacoskall', '#f2c14e', 0.6); skall_m = mat('tacoskall_mork', '#d9932f', 0.6); kjott = mat('tacokjott', '#7b3f22', 0.75)
    salat = mat('salat', '#5cc24a', 0.5); tomat = mat('tomat', '#e8402f', 0.4); ost = mat('tacoost', '#ffd23f', 0.4); romme = mat('romme', '#fffaf2', 0.35)
    # Tacoskallet er et brettet skall (U-form sett forfra, halvmåne sett fra siden) som bærer fyllet oppå
    As = V((A.x * 0.92, A.y * 1.08, A.z * 1.2)); topp_z = C.z + As.z * 0.45
    sk = kutt(ellipsoide('skall', skall, C, As, 56, 32), lambda co: co.z > topp_z)
    so = sk.modifiers.new('t', 'SOLIDIFY'); so.thickness = 0.04; so.offset = 1; bruk_mod(sk); glatt(sk)
    sk.data.materials.append(skall_m)
    rr = random.Random(5)
    flekker = [V((rr.uniform(-1, 1), rr.uniform(-1, 1), rr.uniform(-1, 0.3))).normalized() for _ in range(18)]
    for p_ in sk.data.polygons:
        u = retning(C, As, p_.center)
        if any(u.dot(f) > 0.985 for f in flekker): p_.material_index = 1
    rim = kurve('skallkant', [tuple(p) for p in ring_paa(C, As, V((0, 0, 1)), 0.45, 56, 1.01)], 0.035, skall, rund=6, lukket=True, opp=3)
    Cf = V((C.x, C.y, topp_z - 0.02)); Af = V((As.x * 0.86, As.y * 0.88, A.z * 0.42))
    fyll = bulk(kutt(ellipsoide('kjott', kjott, Cf, Af, 44, 22), lambda co: co.z < Cf.z - 0.02), Cf, 0.018, 26, 2); glatt(fyll)
    deler = [sk, rim, fyll]
    for s in (-1, 1):   # salatfrynser langs begge kantene
        pts = [tuple(V((p.x, p.y, p.z)) + V((s * 0.02, 0, 0.03 + 0.02 * math.sin(k * 1.4)))) for k, p in enumerate(ring_paa(C, As, V((0, 0, 1)), 0.45, 64, 1.0)) if p.x * s > 0]
        if len(pts) > 3: deler.append(kurve('salat%d' % s, pts, 0.045, salat, rund=6, opp=2))
    for i, u in enumerate(fibo(8, V((0, 0, 1)), 0.55, 0.97, 7)):
        pp = paa_flate(Cf, Af * 1.02, u); deler.append(prim('kube', 'tomat%d' % i, tomat, tuple(pp), (0.04, 0.04, 0.035), (i, i * 0.7, 0), ss=0))
    for i, u in enumerate(fibo(18, V((0, 0, 1)), 0.45, 0.98, 9)):
        pp = paa_flate(Cf, Af * 1.06, u); deler.append(prim('syl', 'ostrevet%d' % i, ost, tuple(pp), (0.012, 0.012, 0.05), (1.4, 0, i * 0.9), vertices=6, ss=0))
    deler.append(prim('kule', 'romme', romme, tuple(Cf + V((0, -0.05, Af.z * 0.9))), (0.12, 0.16, 0.05), segments=24, ring_count=12))
    return {'deler': deler, 'foran': C + V((0, -As.y * 0.95, A.z * 0.25)), 'topp': Cf + V((0, 0, Af.z)), 'bak': C + V((0, As.y * 0.95, 0.05)), 'under': C.z - As.z}

def mat_sjoko(C, A, modus):
    sjok = mat('sjokolade', '#5b3121', 0.35); sjok_l = mat('sjokolade_lys', '#7a4630', 0.35); papir = mat('sjokopapir', '#e2332f', 0.45)
    folie = mat('gullfolie', '#ffd24a', 0.25, met=0.7); hvit = mat('sjokopapir_tekst', '#fff4e6', 0.5)
    # Kroppen er en tykk sjokoladeplate med ruter. Den bakre delen er fortsatt i rødt papir med gullfolie som stikker fram.
    B = V((A.x * 1.9, A.y * 1.95, A.z * 1.25))
    plate = prim('kube', 'plate', sjok, tuple(C), (B.x / 2, B.y / 2, B.z / 2), ss=0)
    bv = plate.modifiers.new('b', 'BEVEL'); bv.width = 0.07; bv.segments = 4; bruk_mod(plate); glatt(plate)
    deler = [plate]
    nx, ny = 3, 4
    for i in range(nx):
        for j in range(2, ny):   # rutene foran (der papiret er tatt av)
            x = C.x - B.x / 2 + (i + 0.5) * B.x / nx; y = C.y - B.y / 2 + (ny - 1 - j + 0.5) * B.y / ny
            r_ = prim('kube', 'rute%d%d' % (i, j), sjok_l, (x, y, C.z + B.z / 2 + 0.02), (B.x / nx / 2 - 0.035, B.y / ny / 2 - 0.035, 0.035), ss=0)
            bv = r_.modifiers.new('b', 'BEVEL'); bv.width = 0.025; bv.segments = 2; bruk_mod(r_); deler.append(r_)
    # Papir rundt bakre halvdel, og gullfolie som titter fram ved kanten
    yb = C.y + B.y * 0.08
    pap = prim('kube', 'papir', papir, (C.x, (yb + C.y + B.y / 2 + 0.03) / 2, C.z), (B.x / 2 + 0.035, (C.y + B.y / 2 + 0.03 - yb) / 2, B.z / 2 + 0.035), ss=0)
    bv = pap.modifiers.new('b', 'BEVEL'); bv.width = 0.05; bv.segments = 3; bruk_mod(pap); glatt(pap); deler.append(pap)
    fol = prim('kube', 'folie', folie, (C.x, yb - 0.035, C.z), (B.x / 2 + 0.02, 0.04, B.z / 2 + 0.02), ss=0)
    for v in fol.data.vertices: v.co.y += 0.02 * math.sin(v.co.x * 40) * (1 if v.co.y < 0 else 0)
    deler.append(fol)
    deler.append(prim('kube', 'stripe', hvit, (C.x, (yb + C.y + B.y / 2) / 2, C.z + B.z / 2 + 0.037), (B.x / 2 - 0.05, 0.06, 0.004), ss=0))
    deler.append(prim('kube', 'stripe2', folie, (C.x, (yb + C.y + B.y / 2) / 2 + 0.12, C.z + B.z / 2 + 0.037), (B.x / 2 - 0.05, 0.025, 0.004), ss=0))
    # En liten bit er tatt av fremre hjørne, med smuler
    bit = prim('kule', 'bitt', sjok_l, (C.x + B.x / 2 - 0.05, C.y - B.y / 2 + 0.06, C.z + B.z / 2), (0.12, 0.1, 0.08), segments=16, ring_count=8)
    deler.append(bit)
    return {'deler': deler, 'foran': C + V((0, -B.y / 2, B.z * 0.15)), 'topp': C + V((0, 0, B.z / 2)), 'bak': C + V((0, B.y / 2, 0.0)), 'under': C.z - B.z / 2}

def mat_jordbaer(C, A, modus):
    rod = mat('jordbaer', '#ef2b45', 0.3); fro = mat('jordbaerfro', '#ffe27a', 0.4); grn = mat('jordbaerblad', '#3fa34d', 0.5); stilk = mat('stilk', '#5b8a2f', 0.6)
    rodl = mat('jordbaer_lys', '#ff6a7d', 0.3)
    # Kroppen er et stort jordbær som ligger: bredt bak ved bladkransen og smalt foran ved hodet
    o = ellipsoide('jordbaer', rod, C, V((A.x * 1.02, A.y * 1.12, A.z * 1.1)), 56, 32)
    for v in o.data.vertices:
        t = (v.co.y - C.y) / (A.y * 1.12)               # -1 foran … 1 bak
        k = 0.72 + 0.34 * (t + 1) / 2 - 0.12 * max(0, t) ** 3
        v.co.x = C.x + (v.co.x - C.x) * k; v.co.z = C.z + (v.co.z - C.z) * k
    glatt(o); deler = [o]
    # frø i små groper, jevnt fordelt
    for i, u in enumerate(fibo(46, V((0, -1, 0)), -0.75, 0.99, 13)):
        pp = None
        # finn punktet på den deformerte kroppen langs retningen u ved å skalere som over
        t = u.y; k = 0.72 + 0.34 * (t + 1) / 2 - 0.12 * max(0, t) ** 3
        pp = C + V((u.x * A.x * 1.02 * k, u.y * A.y * 1.12, u.z * A.z * 1.1 * k))
        n = (pp - C); n = V((n.x / (A.x * k + 1e-6), n.y / A.y, n.z / (A.z * k + 1e-6))).normalized()
        s = prim('kule', 'fro%d' % i, fro, (0, 0, 0), (0.016, 0.016, 0.024), segments=8, ring_count=6)
        s.data.transform(n.to_track_quat('Z', 'Y').to_matrix().to_4x4()); s.data.transform(Matrix.Translation(pp + n * 0.004)); deler.append(s)
    deler.append(prim('kule', 'glans', rodl, tuple(C + V((-A.x * 0.35, -A.y * 0.2, A.z * 0.75))), (0.12, 0.2, 0.05), (0.2, 0.3, 0), segments=16, ring_count=10))
    # bladkrans bak
    pb = C + V((0, A.y * 1.12 * 0.98, 0.02))
    for i in range(7):
        a = i / 7 * 2 * math.pi
        rett = V((math.cos(a), 0.25, math.sin(a))).normalized()
        b = prim('kule', 'blad%d' % i, grn, (0, 0, 0), (0.07, 0.17, 0.015), segments=16, ring_count=8)
        for v in b.data.vertices: v.co.z += 0.05 * (v.co.y / 0.17) ** 2
        b.data.transform(Matrix.Translation((0, 0.14, 0)))
        b.data.transform(rett.to_track_quat('Y', 'Z').to_matrix().to_4x4()); b.data.transform(Matrix.Translation(pb - V((0, 0.05, 0)))); deler.append(b)
    deler.append(kurve('stilk', [tuple(pb), tuple(pb + V((0, 0.08, 0.05))), tuple(pb + V((0.02, 0.12, 0.13)))], 0.025, stilk, rund=4, opp=4))
    return {'deler': deler, 'foran': C + V((0, -A.y * 1.0, A.z * 0.15)), 'topp': C + V((0, 0, A.z * 1.0)), 'bak': pb + V((0, 0.05, 0.0)), 'under': C.z - A.z * 0.95}

def mat_milkshake(C, A, modus):
    beger = mat('beger', '#fffaf4', 0.4); stripe = mat('begerstripe', '#ff7fae', 0.45); shake = mat('shake_rosa', '#ffb3d1', 0.4)
    krem = mat('krem', '#fffaf4', 0.3); kirs = mat('kirsebaer', '#e0213c', 0.15); sugeror = mat('sugeror', '#ff4f6d', 0.4)
    sugeror_h = mat('sugeror_hvit', '#ffffff', 0.4); sjok = mat('sjokosaus', '#6b3a22', 0.3)
    # Kroppen er et milkshakebeger med stripete papir nederst og rosa shake som bobler over kanten
    kant_z = C.z + A.z * 0.15
    bg = kutt(ellipsoide('beger', beger, C, V((A.x * 0.98, A.y * 0.98, A.z * 1.02)), 56, 28), lambda co: co.z > kant_z)
    bg.data.materials.append(stripe)
    for p_ in bg.data.polygons:
        a = math.atan2(p_.center.y - C.y, p_.center.x - C.x)
        if math.sin(a * 9) > 0.35: p_.material_index = 1
    kant = kurve('begerkant', [tuple(p) for p in ring_paa(C, A * 0.98, V((0, 0, 1)), 0.15 / 1.02, 56, 1.02)], 0.04, beger, rund=6, lukket=True, opp=3)
    Cs = V((C.x, C.y, kant_z)); As = V((A.x * 0.95, A.y * 0.95, A.z * 0.62))
    sh = kutt(ellipsoide('shake', shake, Cs, As, 48, 24), lambda co: co.z < Cs.z - 0.02)
    drypp = lag_kappe('shakedrypp', shake, C, A * 0.98, V((0, 0, 1)), 0.05, 0.03, 0.0, drypp=[(a, 0.32, 0.14) for a in (0.3, 1.4, 2.6, 3.7, 4.9, 5.8)], skala=1.03)
    drypp = kutt(drypp, lambda co: co.z > kant_z + 0.03)
    deler = [bg, kant, sh, drypp]
    # kremtopp som en spiral av ringer, sjokosaus, kirsebær og sugerør
    tz = Cs.z + As.z * 0.8
    for i, (rr, h) in enumerate([(0.2, 0.0), (0.15, 0.08), (0.1, 0.15), (0.05, 0.2)]):
        deler.append(prim('torus', 'krem%d' % i, krem, (C.x, C.y + 0.05, tz + h), (1, 1, 1), (0, 0, i * 0.7), major_radius=rr, minor_radius=0.06 - i * 0.008, major_segments=28, minor_segments=10))
    deler.append(prim('kule', 'kirsebaer', kirs, (C.x, C.y + 0.05, tz + 0.29), (0.075,) * 3, segments=24, ring_count=14))
    deler.append(kurve('stilk', [(C.x, C.y + 0.05, tz + 0.35), (C.x + 0.02, C.y + 0.08, tz + 0.41), (C.x + 0.06, C.y + 0.1, tz + 0.44)], 0.01, mat('stilk', '#5b8a2f', 0.6)))
    sp = [V((C.x + 0.12, C.y + 0.18, tz - 0.05)), V((C.x + 0.2, C.y + 0.3, tz + 0.3)), V((C.x + 0.24, C.y + 0.36, tz + 0.45)), V((C.x + 0.24, C.y + 0.46, tz + 0.5))]
    sr = kurve('sugeror', [tuple(p) for p in sp], 0.03, sugeror, rund=6, opp=6); sr.data.materials.append(sugeror_h)
    for p_ in sr.data.polygons:
        if math.sin(p_.center.z * 55) > 0: p_.material_index = 1
    deler.append(sr)
    deler += strossel('stro', [(paa_flate(Cs, As * 1.03, u), u) for u in fibo(18, V((0, 0, 1)), 0.25, 0.75)], ['#ffd23f', '#7fd6ff', '#ffffff', '#7a4cff'], 0.06, 0.01)
    deler.append(lag_kappe('sjokotopp', sjok, Cs, As, V((0, 0, 1)), 0.7, 0.02, 0.05, skala=1.035))
    return {'deler': deler, 'foran': C + V((0, -A.y * 0.92, A.z * 0.3)), 'topp': V((C.x, C.y, tz + 0.3)), 'bak': C + V((0, A.y * 0.95, 0.05)), 'under': C.z - A.z}

def ankre(C, A, modus):
    if modus == 'staa': return {'foran': C + V((0, -A.y, 0)), 'topp': C + V((0, 0, A.z)), 'bak': C + V((0, A.y, 0)), 'under': C.z - A.z}
    if modus == 'kuppel': return {'foran': C + V((0, -A.y, 0.1)), 'topp': C + V((0, 0, A.z)), 'bak': C + V((0, A.y, 0.05)), 'under': C.z - 0.1}
    return {'foran': C + V((0, -A.y * 0.92, A.z * 0.35)), 'topp': C + V((0, 0, A.z)), 'bak': C + V((0, A.y * 0.95, 0.05)), 'under': C.z - A.z}

MAT = {'pizza': mat_pizza, 'smultring': mat_smultring, 'is': mat_is, 'banan': mat_banan, 'burger': mat_burger, 'spagetti': mat_spagetti, 'taco': mat_taco,
       'sjoko': mat_sjoko, 'jordbaer': mat_jordbaer, 'milkshake': mat_milkshake}
MATNAVN = {'pizza': 'Pizza', 'smultring': 'Donut', 'is': 'Is', 'banan': 'Banan', 'burger': 'Burger', 'spagetti': 'Spagetti', 'taco': 'Taco',
           'sjoko': 'Sjoko', 'jordbaer': 'Jordbær', 'milkshake': 'Shake'}

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

def gris(matkropp):
    rosa = mat('gris_rosa', '#ffb3c6', 0.55); snute = mat('snute', '#ff8fae', 0.5); nese = mat('nesebor', '#c25b78', 0.5); klov = mat('grisklov', '#9c5466', 0.5)
    C, A = V((0, 0, 0.5)), V((0.46, 0.5, 0.31))
    k = MAT[matkropp](C, A, 'ligg')
    f = k['foran']; hx, hy, hz = f.x, f.y - 0.04, f.z + 0.04
    hd = [prim('kule', 'hodekule', rosa, (hx, hy - 0.08, hz + 0.02), (0.28, 0.25, 0.25), segments=40, ring_count=24)]
    # flat, rund snute med to nesebor
    hd.append(prim('syl', 'snute', snute, (hx, hy - 0.32, hz - 0.05), (0.13, 0.13, 0.05), (math.pi / 2, 0, 0), vertices=32, ss=1))
    for s in (-1, 1):
        hd.append(prim('kule', 'nese%d' % s, nese, (hx + s * 0.05, hy - 0.37, hz - 0.05), (0.024, 0.012, 0.04), segments=12, ring_count=8))
        hd += oye('oye%d' % s, (hx + s * 0.12, hy - 0.27, hz + 0.1), 0.058)
        hd.append(kinn('kinn%d' % s, (hx + s * 0.2, hy - 0.22, hz - 0.06), 0.05))
        # små trekantede ører som vipper litt fram
        o = prim('kjegle', 'ore%d' % s, rosa, (0, 0, 0), (0.09, 0.035, 0.12), vertices=16, ss=1)
        o.data.transform(Matrix.Rotation(-0.55, 4, 'X')); o.data.transform(Matrix.Rotation(s * -0.4, 4, 'Y'))
        o.data.transform(Matrix.Translation((hx + s * 0.17, hy - 0.05, hz + 0.26))); hd.append(o)
        oi = prim('kjegle', 'oreinn%d' % s, snute, (0, 0, 0), (0.055, 0.015, 0.08), vertices=12, ss=1)
        oi.data.transform(Matrix.Rotation(-0.55, 4, 'X')); oi.data.transform(Matrix.Rotation(s * -0.4, 4, 'Y'))
        oi.data.transform(Matrix.Translation((hx + s * 0.17, hy - 0.085, hz + 0.25))); hd.append(oi)
    hd.append(smil('smil', (hx, hy - 0.32, hz - 0.15), 0.06))
    hd.append(prim('syl', 'hals', rosa, (hx, hy + 0.1, hz - 0.07), (0.16, 0.16, 0.12), (1.3, 0, 0), vertices=24, ss=1))
    hode = pivot(slaa_sammen('hode', hd), (hx, hy + 0.1, hz - 0.05))
    under = k['under']; bein = []
    for i, (bx, by) in enumerate([(-0.27, -0.28), (0.27, -0.28), (-0.27, 0.3), (0.27, 0.3)]):
        topp = under + 0.08; lengde = topp - 0.02
        b = [prim('kule', 'bein%d' % i, rosa, (bx, by, lengde / 2 + 0.05), (0.1, 0.1, lengde / 2 + 0.04), segments=24, ring_count=16)]
        b.append(prim('kule', 'klov%d' % i, klov, (bx, by - 0.01, 0.05), (0.1, 0.1, 0.06), segments=20, ring_count=10))
        bein.append(pivot(slaa_sammen(['bein_vf', 'bein_hf', 'bein_vb', 'bein_hb'][i], b), (bx, by, topp)))
    # krøllhale som en liten spiral
    bk = k['bak']; pts = []
    for j in range(14):
        t = j / 13; a = t * 2.6 * math.pi
        pts.append(tuple(bk + V((0.06 * math.sin(a) * (0.4 + 0.6 * t), 0.04 + 0.12 * t + 0.05 * (1 - math.cos(a)) * 0.6, 0.07 * math.cos(a) * (0.4 + 0.6 * t) + 0.08 * t))))
    hale = pivot(slaa_sammen('hale', [kurve('krollhale', pts, 0.025, rosa, rund=6, opp=4, avsmal=lambda t: 1 - 0.5 * t)]), tuple(bk))
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

DYR = {'ku': ku, 'gris': gris, 'pingvin': pingvin, 'skilpadde': skilpadde, 'hval': hval}
DYRNAVN = {'ku': 'ku', 'gris': 'gris', 'pingvin': 'pingvin', 'skilpadde': 'skilpadde', 'hval': 'hval'}

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
