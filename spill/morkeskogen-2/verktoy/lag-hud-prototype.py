# Setter skjermbildene inn i HUD-prototypen (som JPEG data-URI-er, så siden er én selvstendig fil).
# Bruk (fra repo-roten): python3 spill/morkeskogen-2/verktoy/lag-hud-prototype.py
import base64, io
from PIL import Image
M = 'spill/morkeskogen-2/testvisning/hud-prototype.mal.html'; U = 'spill/morkeskogen-2/testvisning/hud-prototype.html'; B = 'tester/resultater/hud/'
def uri(f):
    im = Image.open(B + f).convert('RGB'); buf = io.BytesIO(); im.save(buf, 'JPEG', quality=84)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
s = open(M, encoding='utf-8').read()
for k, f in {'PC_DAG': 'pc-ren.png', 'PC_NATT': 'pc-ren-natt.png', 'MOBIL_DAG': 'mobil-ren.png', 'MOBIL_NATT': 'mobil-ren-natt.png', 'PC_FOR': 'pc-for.png', 'MOBIL_FOR': 'mobil-for.png'}.items():
    s = s.replace('{{' + k + '}}', uri(f))
open(U, 'w', encoding='utf-8').write(s); print(U, len(s) // 1024, 'KB')
