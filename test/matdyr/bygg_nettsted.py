import subprocess,shutil,os
subprocess.run(["python3","/tmp/assemble.py","../../vendor/three-r128.min.js"],check=True)
s=open('/home/claude/matdyr/index.html').read()
csp='''<!-- EVN-SIKKERHET start: gjelder bare evnstudio.no (se /sikkerhet/). Tas ut i Claude-artefaktene. -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://gc.zgo.at; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://evnstudio.goatcounter.com; connect-src 'self' https://evnstudio.goatcounter.com; media-src 'self' data: blob:; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin">
<!-- EVN-SIKKERHET slutt -->'''
def rep(a,b):
    global s; assert a in s,a; s=s.replace(a,b,1)
rep('<meta charset="utf-8">','<meta charset="utf-8">\n'+csp)
rep('<script src="gltfloader-r128.js"','<script src="../../ecoins/gltfloader-r128.js"')
rep('<link rel="icon" href="data:,">','<link rel="icon" href="../../favicon.png">')
import re
m=re.search(r'<script>\n/\* EVN-statistikk \(ST1\).*?</script>\n',s,re.S);assert m
s=s[:m.start()]+'<script src="../../statistikk.js" data-spill="matdyr" defer></script>\n'+s[m.end():]
d='/home/claude/evnstudio/spill/matdyr';os.makedirs(d,exist_ok=True)
open(d+'/index.html','w').write(s)
for f in ['helt-robot.js','blender-dyr.js']: shutil.copy('/home/claude/matdyr/'+f,d+'/'+f)
subprocess.run(["python3","/tmp/assemble.py"],check=True)  # artefaktvarianten tilbake
print("ok")
