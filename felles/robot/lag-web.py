"""Beskjærer råbildene fra lag-bilder.mjs og lager WebP-filene til nettsiden.
Kjør: python3 lag-web.py <mappe med råbilder> <utmappe for bilder/>"""
import sys
from pathlib import Path
from PIL import Image

inn, ut = Path(sys.argv[1]), Path(sys.argv[2])
ut.mkdir(parents=True, exist_ok=True)


def boks(*bilder, luft=0.03):
    bb = None
    for im in bilder:
        b = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    p = int((bb[3] - bb[1]) * luft)
    w, h = bilder[0].size
    return (max(0, bb[0] - p), max(0, bb[1] - p), min(w, bb[2] + p), min(h, bb[3] + p))


def lagre(im, navn, hoyde):
    k = hoyde / im.height
    im.resize((round(im.width * k), hoyde), Image.LANCZOS).save(ut / navn, 'WEBP', quality=86, method=6)
    print('laget', navn, (round(im.width * k), hoyde), (ut / navn).stat().st_size, 'byte')


staende = Image.open(inn / 'web-staende.png').convert('RGBA')
s = staende.crop(boks(staende))
for h in (260, 520):
    lagre(s, f'robot-staende-{h}.webp', h)

hode = Image.open(inn / 'web-hode.png').convert('RGBA')
b = boks(hode, luft=0.0)
# Kvadrat rundt hodet: øverste del av bildet (hodet), sentrert vannrett
side = b[2] - b[0]
cx = (b[0] + b[2]) // 2
kv = hode.crop((cx - side // 2, b[1] - side // 20, cx + side // 2, b[1] - side // 20 + side))
for h in (96, 192):
    lagre(kv, f'robot-hode-{h}.webp', h)

# Startkort: én positur per spill (robot-start-<navn>-130/260.webp; vises ca. 100–120 px høy)
for p in sorted(inn.glob('start-*.png')):
    im = Image.open(p).convert('RGBA'); c = im.crop(boks(im))
    for h in (130, 260):
        lagre(c, f'robot-{p.stem}-{h}.webp', h)

# Vinkesekvens: 8 bilder i én stripe, felles beskjæring så roboten står stille
vink = [Image.open(inn / f'web-vink-{i}.png').convert('RGBA') for i in range(8)]
fb = boks(*vink)
rammer = [v.crop(fb) for v in vink]
for h in (160,):
    k = h / rammer[0].height
    w = round(rammer[0].width * k)
    stripe = Image.new('RGBA', (w * 8, h), (0, 0, 0, 0))
    for i, r in enumerate(rammer):
        stripe.paste(r.resize((w, h), Image.LANCZOS), (i * w, 0))
    stripe.save(ut / f'robot-vink-{h}.webp', 'WEBP', quality=70, alpha_quality=60, method=6)
    print('laget', f'robot-vink-{h}.webp', (w, h), 'per bilde', (ut / f'robot-vink-{h}.webp').stat().st_size, 'byte')
