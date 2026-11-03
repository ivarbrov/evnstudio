"""E-coins økonomimodell v0.1 – EVN Studio.
Milepæler bygger på kartlagt kode (main 4474df5, morkeskogen-2.0 2b43319).
Tidsanslag (min) er ANTAKELSER til kalibrering med Evens testing.
Kjør: python3 modell.py  -> skriver modell-ut.json og tabeller til stdout.
"""
import json, random, statistics as st

# ---------- Milepæler: (id, beskrivelse, E-coins, ca. minutter fra forrige milepæl) ----------
# Rekkefølgen er progresjonsrekkefølgen i spillet (spillere tar dem i denne rekkefølgen).
M = {}

era_epoker = ['Steinalderen','Oldtiden','Monsterskogen','Piratskipet','Robotfabrikken','Romstasjonen','Tidsvirvelen']
M['era'] = []
for n, navn in enumerate(era_epoker, 1):
    M['era'].append((f'era.boss.{n}', f'Første boss slått i {navn} (bølge 5)', 15, 12))
    if n < 7:
        M['era'].append((f'era.epoke.{n}', f'{navn} fullført – portalen åpnes (bølge 10)', 40, 12))
M['era'].append(('era.seier', 'Tidsherren (sluttbossen) er slått', 150, 20))

fossil = [  # (epoke, dyr-id, navn, deler)
    (0,'dimetrodon','Dimetrodon',5),(0,'oyenstikker','Kjempeøyenstikker',3),(0,'panserfisk','Panserfisk',3),(0,'trilobitt','Trilobitt',3),
    (1,'flygeogle','Flygeøgle',4),(1,'trex','T-rex',5),(1,'langhals','Langhals',5),(1,'ammonitt','Ammonitt',3),
    (2,'ulv','Ulv',4),(2,'love','Løve',4),(2,'elefant','Elefant',5),(2,'mammut','Mammut',5),(2,'hval','Hval',5)]
fos_epoke_bonus = {0: 40, 1: 40, 2: 100}
fos_epoke_navn = {0: 'Jordas oldtid', 1: 'Jordas mellomalder', 2: 'Jordas nytid'}
M['fossil'] = []
for ep in range(3):
    for e, did, navn, d in fossil:
        if e == ep:
            M['fossil'].append((f'fossil.dyr.{did}', f'{navn} vekket til live ({d} deler)', 15, 2.5 * d))
    M['fossil'].append((f'fossil.epoke.{ep+1}', f'Alle dyr i {fos_epoke_navn[ep]} vekket', fos_epoke_bonus[ep], 0))

dyre_verdener = ['Gata','Byen','Kjøpesenteret','Snøverdenen','Lavaverdenen','Godterilandet','Jungelen','Gården',
                 'Lekelandet','Under havet','Ørkenen','Sumpen','Skogen','Gruva','Eventyrlandet']
M['dyrepatruljen'] = [(f'dyrepatruljen.verden.{i+1}', f'Alle 10 dyr reddet i {v}', 25, 12) for i, v in enumerate(dyre_verdener)]
M['dyrepatruljen'].append(('dyrepatruljen.alle', 'Alle 150 dyr i alle 15 verdener reddet', 100, 0))

egg_arter = [  # (id, navn, sjeldenhet)
    ('boblefrosk','Boblefrosk',0),('glitterkanin','Glitterkanin',0),('bladrev','Bladrev',0),('blomsterbie','Blomsterbie',0),
    ('snopingvin','Snøpingvin',0),('perleoter','Perleoter',0),('lynkatt','Lynkatt',1),('flammehest','Flammehest',1),
    ('vannskilpadde','Vannskilpadde',1),('regnbuesebra','Regnbuesebra',1),('lavaogle','Lavaøgle',1),
    ('stjerneugle','Stjerneugle',2),('isdrage','Isdrage',2),('maaneenhjorning','Måneenhjørning',2),('ilddrev','Ilddrev',3)]
egg_e = {0: 8, 1: 12, 2: 20, 3: 40}
egg_t = {0: 4, 1: 10, 2: 15, 3: 30}
M['magiske-egg'] = []
park = {2: 'egg.park.2', 3: 'egg.park.3', 4: 'egg.park.4', 5: 'egg.park.5', 6: 'egg.park.6'}
# Omtrentlig progresjon: vanlige arter først, parknivå underveis, sjeldne til slutt
rekke = [('a',a) for a in egg_arter[:3]] + [('p',2)] + [('a',a) for a in egg_arter[3:6]] + [('p',3)] + \
        [('a',a) for a in egg_arter[6:9]] + [('p',4)] + [('a',a) for a in egg_arter[9:12]] + [('p',5)] + \
        [('a',a) for a in egg_arter[12:14]] + [('p',6)] + [('a',egg_arter[14])]
for typ, x in rekke:
    if typ == 'a':
        aid, navn, s = x
        M['magiske-egg'].append((f'egg.art.{aid}', f'Første {navn} klekket', egg_e[s], egg_t[s]))
    else:
        M['magiske-egg'].append((park[x], f'Parknivå {x} nådd', 20, 8))
M['magiske-egg'].append(('egg.alle', 'Alle 15 arter i samleboka', 60, 0))

mork_q = [('natt1','Overlev første natt',15),('jeger','Jeger-oppdraget',20),('seng','Bygg en seng',10),('sovet','Sov i senga',10),
          ('skjelett','Skjelett-oppdraget',15),('fisker','Fisker-oppdraget',15),('troll','Troll-oppdraget',20),
          ('stasjon','Stasjon-oppdraget',15),('cowboy','Cowboy-oppdraget',15),('vulkan','Vulkan-oppdraget',20),
          ('sheriff','Sheriff-oppdraget (3 deler)',25),('lasso','Lasso-oppdraget (5 deler)',25),('haidammen','Haidammen',20),
          ('dinoverden','Dinoverdenen',25),('heksa','Heksa',40),('overlevaren','Overlevaren (5 netter)',40),
          ('dinoslott','Beinslottet – Skjelett-T-rex-kongen',50)]
M['morkeskogen-2'] = []
for i, (q, navn, e) in enumerate(mork_q):
    M['morkeskogen-2'].append((f'mork.oppdrag.{q}', navn, e, 15))
    if q == 'cowboy': M['morkeskogen-2'].append(('mork.niva.5', 'Heltenivå 5', 20, 0))
M['morkeskogen-2'].append(('mork.niva.10', 'Heltenivå 10 (maks)', 40, 0))

SPILLNAVN = {'era':'Era Defenders','fossil':'Fossil Zoo','dyrepatruljen':'Dyrepatruljen','magiske-egg':'Magiske egg','morkeskogen-2':'Mørkeskogen 2.0'}
PUBLISERT = ['era','fossil','dyrepatruljen','magiske-egg']   # Mørkeskogen 2.0 er ikke publisert

# ---------- Butikk: (id, navn, plass, pris, kilde) ----------
# kilde: 'era' = finnes i felles/robot/tilbehor.js; 'ny' = ny modell; 'reserve' = holdes til Mørkeskogen 2.0
VARER = [
    ('vernehjelm',     'Vernehjelm',      'hode', 40,  'era'),
    ('steinhette',     'Steinalderhette', 'hode', 40,  'era'),
    ('ryggsekk',       'Ryggsekk',        'rygg', 40,  'ny'),
    ('pirathatt',      'Pirathatt',       'hode', 75, 'era'),
    ('vikinghjelm',    'Vikinghjelm',     'hode', 75, 'ny'),
    ('rod_kappe',      'Rød kappe',       'rygg', 75, 'era'),
    ('svart_kappe',    'Svart kappe',     'rygg', 75, 'era'),
    ('verktoybelte',   'Verktøybelte',    'rygg', 75, 'era'),
    ('ridderhjelm',    'Ridderhjelm',     'hode', 120, 'era'),
    ('faraokrone',     'Faraokrone',      'hode', 120, 'era'),
    ('romhjelm',       'Romhjelm',        'hode', 120, 'era'),
    ('oksygentank',    'Oksygentank',     'rygg', 120, 'era'),
    ('trollmannshatt', 'Trollmannshatt',  'hode', 180, 'era'),
    ('stjernekappe',   'Stjernekappe',    'rygg', 180, 'era'),
    ('gullkrone',      'Gullkrone',       'hode', 250, 'ny'),
    # Reserve – legges i butikken samtidig som Mørkeskogen 2.0 publiseres:
    ('cowboyhatt',     'Cowboyhatt',      'hode', 75, 'reserve'),
    ('sheriffkappe',   'Sheriffkappe',    'rygg', 120, 'reserve'),
    ('beinkrone',      'Beinkrone',       'hode', 180, 'reserve'),
]

def tot(spill): return sum(m[2] for m in M[spill])
def varer(med_reserve):
    return [v for v in VARER if med_reserve or v[4] != 'reserve']

# ---------- Spillertyper: andel av progresjonen i hvert spill ----------
TYPER = {
    'Ny spiller':        {'dyrepatruljen': .14, 'fossil': .15},
    'Vanlig spiller':    {'dyrepatruljen': .45, 'fossil': .6, 'era': .4, 'magiske-egg': .5},
    'Svært aktiv spiller': {'dyrepatruljen': 1, 'fossil': 1, 'era': 1, 'magiske-egg': 1},
}

def opptjent(profil, spillsett):
    e, n, minutter, detaljer = 0, 0, 0, []
    for s in spillsett:
        andel = profil.get(s, 0)
        liste = M[s]; k = round(andel * len(liste))
        e += sum(m[2] for m in liste[:k]); n += k; minutter += sum(m[3] for m in liste[:k])
        detaljer.append((s, k, len(liste), sum(m[2] for m in liste[:k])))
    return e, n, minutter, detaljer

def tid_til_forste(spill, pris):
    e = t = 0
    for m in M[spill]:
        e += m[2]; t += m[3]
        if e >= pris: return t, e
    return None, e

def kjop_sim(budsjett, vareliste, runder=2000, seed=1):
    """Barnet kjøper i tilfeldig ønskerekkefølge så snart det har råd (ingen sparing utover neste ønske)."""
    rng = random.Random(seed); ant, rest = [], []
    for _ in range(runder):
        onsker = vareliste[:]; rng.shuffle(onsker)
        # 60 % prøver å spare til favoritten (første i lista), ellers kjøper de det de har råd til
        b, eid = budsjett, 0
        if rng.random() < .6:
            for v in onsker:
                if v[3] <= b: b -= v[3]; eid += 1
                else: break
        else:
            for v in sorted(onsker, key=lambda v: v[3]):
                if v[3] <= b: b -= v[3]; eid += 1
        ant.append(eid); rest.append(b)
    return st.mean(ant), st.mean(rest), min(rest), max(rest)

ut = {'spill': {}, 'typer': {}, 'scenario': {}}
print('== Maksimal opptjening per spill ==')
for s in M:
    ut['spill'][s] = {'navn': SPILLNAVN[s], 'milepaeler': len(M[s]), 'maks': tot(s), 'publisert': s in PUBLISERT,
                      'timer_anslag': round(sum(m[3] for m in M[s]) / 60, 1)}
    print(f"{SPILLNAVN[s]:18} {len(M[s]):3} milepæler  maks {tot(s):5} E   ~{sum(m[3] for m in M[s])/60:4.1f} t")

for navn, spillsett, res in [('Lansering (4 publiserte spill)', PUBLISERT, False),
                              ('Med Mørkeskogen 2.0', list(M), True)]:
    E = sum(tot(s) for s in spillsett); V = sum(v[3] for v in varer(res))
    ut['scenario'][navn] = {'E_maks': E, 'butikkverdi': V, 'forhold_E_V': round(E / V, 2),
                            'antall_varer': len(varer(res)), 'overskudd_ved_alt_kjopt': E - V}
    print(f"\n== {navn} ==\nMaks E-coins {E}, butikkverdi {V} ({len(varer(res))} varer), E/V = {E/V:.2f}, overskudd når alt er kjøpt: {E-V}")

print('\n== Tid til første vare (40 E) ==')
for s in PUBLISERT + ['morkeskogen-2']:
    t, e = tid_til_forste(s, 40)
    print(f"{SPILLNAVN[s]:18} ~{t} min (har da {e} E)")
    ut['spill'][s]['min_til_forste_40'] = t

print('\n== Spillertyper (lansering, 4 spill) ==')
vl = varer(False); V = sum(v[3] for v in vl)
for navn, profil in TYPER.items():
    e, n, minutter, det = opptjent(profil, PUBLISERT)
    snitt_ant, snitt_rest, mn, mx = kjop_sim(e, vl)
    ut['typer'][navn] = {'opptjent': e, 'milepaeler': n, 'timer_anslag': round(minutter / 60, 1),
                         'snitt_varer_kjopt': round(snitt_ant, 1), 'snitt_saldo_igjen': round(snitt_rest),
                         'saldo_igjen_min_maks': [mn, mx], 'andel_brukt': round(1 - snitt_rest / e, 2) if e else 0,
                         'varer_igjen_aa_onske_seg': round(len(vl) - snitt_ant, 1),
                         'detaljer': [{'spill': SPILLNAVN[s], 'tatt': k, 'av': a, 'E': x} for s, k, a, x in det]}
    print(f"{navn:20} {n:3} milepæler  {e:5} E  ~{minutter/60:4.1f} t  kjøper ~{snitt_ant:4.1f} av {len(vl)}  "
          f"saldo igjen ~{snitt_rest:4.0f} (min {mn}, maks {mx})  brukt {100*(1-snitt_rest/e):.0f} %")

print('\n== Utvidelse: Mørkeskogen 2.0 publiseres for svært aktiv spiller ==')
e_for = sum(tot(s) for s in PUBLISERT); V_for = sum(v[3] for v in varer(False))
e_etter = e_for + tot('morkeskogen-2'); V_etter = sum(v[3] for v in varer(True))
print(f"Før: {e_for} E mot {V_for} E i varer. Etter: {e_etter} E mot {V_etter} E. "
      f"Nye varer trengs for å holde E/V ≈ 1,1: {tot('morkeskogen-2')/1.1:.0f} E")
ut['utvidelse'] = {'mork_E': tot('morkeskogen-2'), 'reserve_verdi': V_etter - V_for,
                   'regel': 'Ny butikkverdi ≈ ny E-coins / 1,1'}

ut['milepaeler'] = {s: [{'id': m[0], 'tekst': m[1], 'E': m[2], 'min': m[3]} for m in M[s]] for s in M}
ut['varer'] = [{'id': v[0], 'navn': v[1], 'plass': v[2], 'pris': v[3], 'kilde': v[4]} for v in VARER]
json.dump(ut, open('modell-ut.json', 'w'), ensure_ascii=False, indent=1)
