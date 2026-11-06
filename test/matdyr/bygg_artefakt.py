import base64,re
src=open('/home/claude/matdyr/matdyr-3d-v0.7.html').read()
head=open('/home/claude/matdyr/ui_head.html').read()
felles=open('/tmp/evn_felles.html').read()
ui=open('/home/claude/matdyr/ui_js.js').read()
init=open('/home/claude/matdyr/ui_init.js').read()
tail=open('/home/claude/matdyr/ui_tail.html').read()
a=src.index('<script>\n"use strict";')+len('<script>\n')
b=src.index('// ================= Styring')
c=src.index('// ================= Oppdatering')
d=src.index('</script>\n</body>')
main=src[a:b]; rest=src[c:d]
def rep(s,x,y):
    assert x in s,("MISSING",x[:80]);return s.replace(x,y,1)
main=rep(main,'document.body.appendChild(renderer.domElement);','renderer.domElement.id="c";document.body.insertBefore(renderer.domElement,document.body.firstChild);')
main=rep(main,'"use strict";','"use strict";\nconst VERSJON="0.8.0";\nfunction ingen3d(){window.__ingen3d=true;$("noGL").classList.remove("hidden");$("startBtn").hidden=true}')
for a,b2 in [('w:55,','w:30,'),('w:25,','w:26,'),('w:12,','w:20,'),('w:5,  ','w:13, '),('w:2.5,','w:8,  '),('w:0.4,','w:1.2,'),('w:0.1,','w:0.3,')]:
    main=rep(main,a,b2)
main=main.replace('const VERSJON="0.8.0"','const VERSJON="0.10.1"')
main=rep(main,'const SAVE_KEY="evn_matdyr_proto_v1";','const SAVE_KEY="evn-matdyr-v1",SAVE_KEY_OLD="evn_matdyr_proto_v1";')
main=rep(main,'disc:[...disc],name:baseName}','disc:[...disc],name:baseName,carry:carry?carry.ci:-1,cb:carry&&carry.betalt?1:2,intro:window.introSteg?introSteg():undefined}')
main=rep(main,'function save(){try{','function save(){if(!window.__klar)return;try{')
main=rep(main,'c.name=fn+" "+FAR[fi]+(hun?"dóttir":"son")});','c.name=fn+" "+FAR[fi]+(hun?"dóttir":"son")});\nCOMBOS.forEach(c=>{c.name=c.a+" "+c.name}); // 0.10: emoji for dyret foran navnet')
main=rep(main,'return[[r.n,r.c,46],[isHidden(ci)','return[[r.n+(c.r>=3?" · 🏃 fang":""),r.c,46],[isHidden(ci)')
main=rep(main,'if(r>=3&&!drop)showMsg("😮 En "+R[r].n+" faller ned!");','if(r>=3&&!drop&&window.sjeldenVarsel)sjeldenVarsel(r,ci);')
main=rep(main,'["💰 Pris "+fmt(p),money>=p?"#ffe27a":"#ff9a9a",46]]','money>=p?["💰 Pris "+fmt(p)+" ✅","#ffe27a",46]:["🔒 Pris "+fmt(p)+" · mangler "+fmt(p-money),"#ff9a9a",40]]')
main=rep(main,'["💰 Pris "+fmt(p)+" ✅","#ffe27a",46]:["🔒 Pris "+fmt(p)+" · mangler "+fmt(p-money),"#ff9a9a",40]]','["💰 Pris "+kr(p)+" ✅","#ffe27a",46]:["🔒 Mangler "+kr(p-money),"#ff9a9a",46]]')
main=rep(main,'BL[BL_AI[k]]={','BL[BL_AI[k]!==undefined?BL_AI[k]:+k]={')
main=rep(main,'const BL_AI={gris:0,frosk:1,hund:11};','const BL_AI={};')
main=main.replace('$("noGL").classList.remove("hidden");throw','ingen3d();throw')
main,n2=re.subn(r'function updateHud\(\)\{.*?\n\}\n','function updateHud(){$("money").textContent=fmt(money);$("inc").textContent=fmt(income());$("disc").textContent=disc.size+"/"+COMBOS.length}\n',main,count=1,flags=re.S);assert n2==1
main,n=re.subn(r'let msgT=0;function showMsg\(t\)\{.*?\}\n','let msgT=0;function showMsg(t){const m=$("melding");m.textContent=t;m.classList.add("vis");clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove("vis"),2600)}\n',main,count=1,flags=re.S);assert n==1
main=rep(main,'function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");','function load(){let raw=null;try{raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(SAVE_KEY_OLD);try{JSON.parse(raw||"null")}catch(e1){const o=localStorage.getItem(SAVE_KEY_OLD);try{if(o&&JSON.parse(o)){localStorage.setItem(SAVE_KEY+"-kopi",raw);raw=o}}catch(e2){}}}catch(e){}try{const s=JSON.parse(raw||"null");')
main=rep(main,'base=s.base.map(v=>v<0?-1:v);disc=new Set(s.disc);if(typeof s.name==="string"&&s.name.trim())baseName=s.name.slice(0,20)}}catch(e){}',
 'if(!Number.isFinite(money)||money<0)money=60;if(!Number.isInteger(level)||level<0||level>MAX_LEVEL)level=0;base=(Array.isArray(s.base)?s.base:[]).map(v=>Number.isInteger(v)&&v>=0&&v<COMBOS.length?v:-1).slice(0,plotsFor(level));disc=new Set((Array.isArray(s.disc)?s.disc:[]).filter(v=>Number.isInteger(v)&&v>=0&&v<COMBOS.length));if(typeof s.name==="string"&&s.name.trim())baseName=s.name.slice(0,20)}}catch(e){money=60;level=0;base=[];disc=new Set();try{if(raw)localStorage.setItem(SAVE_KEY+"-kopi",raw)}catch(e2){}console.warn("Lagringen kunne ikke leses. En kopi ligger i "+SAVE_KEY+"-kopi.")}')
pass
main=rep(main,'if(!Number.isFinite(money)','window.__savedCarryBetalt=s.cb!==2;window.__savedCarry=Number.isInteger(s.carry)&&s.carry>=0&&s.carry<COMBOS.length?s.carry:-1;window.__savedIntro=Number.isInteger(s.intro)&&s.intro>=0&&s.intro<=6?s.intro:undefined;if(!Number.isFinite(money)')
main=rep(main,'const HQ=GFX==="fin";','const HQ=GFX==="fin";const RM=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);')
rest=src[c:d]
rest=rep(rest,'''    else{\n      a.next-=dt;''','''    else if(window.fangSteg&&fangSteg(a,dt,gp)){animModel(a.spr,time,a.fl>0);gp.y=0;a.blob.visible=false}\n    else{\n      a.next-=dt;''')
rest=rep(rest,'money+=income();','money+=(window.aktivNaa&&!aktivNaa())?0:income();')
rest=rep(rest,'''    else{\n      a.next-=dt;''','''    else if(window.fangSteg&&fangSteg(a,dt,gp)){animModel(a.spr,time,a.fl>0);gp.y=0;a.blob.visible=false}\n    else{\n      a.next-=dt;''')
rest=rep(rest,'windU.value=now/1000;','windU.value=RM?0:now/1000;')
img=base64.b64encode(open('/home/claude/ivarbrov/evnstudio/bilder/robot-start-jubel-260.webp','rb').read()).decode()
init=init.replace('__ROBOTIMG__',img)+'\n'+open('/home/claude/matdyr/ui_090.js').read()
import sys
head=head.replace('__THREE__',sys.argv[1] if len(sys.argv)>1 else 'three-r128.min.js')
head=head.replace("window.addEventListener('error', function (e) { if (e","window.addEventListener('error', function (e) { if (window.__ingen3d) return; if (e")
open('/home/claude/matdyr/index.html','w').write(head+felles+'\n<script>\n'+main+ui+'\n'+rest+init+tail)
print("assembled")
