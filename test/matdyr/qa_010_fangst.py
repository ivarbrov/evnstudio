from playwright.sync_api import sync_playwright
import json,atexit
R=[]
def ok(name,cond,info=""): R.append(("OK " if cond else "FEIL")+" "+name+(" — "+str(info) if info else ""))
atexit.register(lambda: print("\n".join(R)))
URL="http://localhost:8765/index.html"
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]
def ny(b,init="",vp={"width":1280,"height":800}):
    c=b.new_context(viewport=vp);c.add_init_script("try{localStorage.setItem('evn_matdyr_gfx','rask')}catch(e){}"+init)
    p=c.new_page();e=[];p.on("pageerror",lambda x:e.append(str(x)));p.on("console",lambda m:e.append(m.text[:140]) if m.type=="error" else None)
    return c,p,e
def start(p):
    p.goto(URL,timeout=120000);p.wait_for_timeout(1200);p.click("#startBtn",force=True);p.wait_for_timeout(2500)
with sync_playwright() as pw:
    b=pw.chromium.launch(args=ARGS)
    c,p,e=ny(b);p.goto(URL);p.evaluate("()=>localStorage.clear()");start(p)
    leg=p.evaluate("()=>__spill.COMBOS.findIndex(c=>c.r===3)");com=p.evaluate("()=>__spill.COMBOS.findIndex(c=>c.r===0)")
    nm=p.evaluate(f"()=>__spill.COMBOS[{com}].name");ok("Lesbarhet: emoji for dyret foran navnet",nm.startswith(p.evaluate(f"()=>__spill.COMBOS[{com}].a")+" "),nm)
    # flukt (simulert tid med step(), headless gir 1–2 FPS)
    p.evaluate(f"()=>{{__spill.money=1e7;window.__a=__spill.spawn({leg},10,0);__a.state='walk';__a.g.position.y=0;__a.sp=0;__spill.robot.position.set(6,0,0)}}")
    d=p.evaluate("()=>{const d0=Math.hypot(__a.g.position.x-__spill.robot.position.x,__a.g.position.z-__spill.robot.position.z);for(let i=0;i<20;i++)step(0.05);return [d0,Math.hypot(__a.g.position.x-__spill.robot.position.x,__a.g.position.z-__spill.robot.position.z)]}")
    ok("Fangst: Legendary løper unna når roboten kommer nær",d[1]>d[0]+2,d)
    p.evaluate("()=>{__spill.robot.position.set(__a.g.position.x-1.2,0,__a.g.position.z);__a.sl=0;__a.st=2}")
    m0=p.evaluate("()=>__spill.money");p.evaluate("()=>{step(0.001);__spill.doAction()}");p.wait_for_timeout(300)
    st=p.evaluate("()=>({c:__spill.carry,m:__spill.money,msg:document.getElementById('melding').textContent,lev:__spill.animals.includes(__a)})")
    ok("Fangst: bom (ikke sliten) koster ingenting og matdyret blir på enga",st["c"] is None and st["m"]==m0 and st["lev"] and "hoppet unna" in st["msg"],st)
    t=p.evaluate("()=>{__spill.robot.position.set(__a.g.position.x+30,0,__a.g.position.z);__a.st=0.01;__spill.robot.position.set(__a.g.position.x-2,0,__a.g.position.z);for(let i=0;i<6;i++)step(0.05);return __a.sl}")
    ok("Fangst: matdyret blir sliten 💦 etter en stund",t>0 and p.evaluate("()=>!!(__a.svett&&__a.svett.visible)"),t)
    p.evaluate("()=>{__spill.robot.position.set(__a.g.position.x-1.2,0,__a.g.position.z);__a.sl=5}");p.wait_for_timeout(700)
    at=p.text_content("#act");ok("Fangst: knappen sier «Fang nå!» når den er sliten","Fang nå" in at,at)
    p.keyboard.press("e");p.wait_for_timeout(500)
    st=p.evaluate("()=>({c:__spill.carry&&__spill.carry.ci,m:__spill.money})")
    ok("Fangst: sliten = fanget, ingen betaling før basen",st["c"]==leg and st["m"]==m0,(st,m0))
    p.evaluate("()=>{__spill.robot.position.set(-40,0.6,0)}");p.wait_for_timeout(1500)
    st=p.evaluate(f"()=>({{b:__spill.base.slice(),m:__spill.money,p:__spill.PRICE({leg})}})")
    ok("Betaling i basen: prisen trekkes ved levering",leg in st["b"] and m0-st["m"]>=st["p"]-1 and m0-st["m"]<=st["p"]+1,(m0-st["m"],st["p"]))
    # slipp gir ingen refusjon fordi ingenting er betalt
    p.evaluate(f"()=>{{const a=__spill.spawn({com},10,4);a.state='walk';a.g.position.y=0;a.sp=0;__spill.robot.position.set(9,0,4)}}");p.wait_for_timeout(1200);p.keyboard.press("e");p.wait_for_timeout(400)
    m1=p.evaluate("()=>__spill.money");p.keyboard.press("e");p.wait_for_timeout(400)
    ok("Slipp: ingen penger tilbake (ingenting var betalt)",p.evaluate("()=>__spill.carry")is None and p.evaluate("()=>__spill.money")==m1)
    # råd og plass
    p.evaluate(f"()=>{{__spill.money=0;const a=__spill.spawn({leg},12,-4);a.state='walk';a.g.position.y=0;a.sp=0;a.sl=60;__spill.robot.position.set(11,0,-4)}}");p.wait_for_timeout(1200)
    at=p.text_content("#act");p.keyboard.press("e");p.wait_for_timeout(300)
    ok("Krav: uten nok penger kan du ikke ta med (knappen viser «Mangler»)","Mangler" in at and p.evaluate("()=>__spill.carry") is None,at)
    p.evaluate(f"()=>{{__spill.money=1e9;const b=__spill.base;for(let i=0;i<b.length;i++)b[i]={leg};__spill.refreshBase();const a=__spill.spawn({com},12,6);a.state='walk';a.g.position.y=0;a.sp=0;__spill.robot.position.set(11,0,6)}}");p.wait_for_timeout(1200)
    at=p.text_content("#act");p.keyboard.press("e");p.wait_for_timeout(300)
    ok("Krav: full base og ikke bedre enn det svakeste gir «Ingen plass»","Ingen plass" in at and p.evaluate("()=>__spill.carry") is None,at)
    # varsler
    p.evaluate(f"()=>{{__spill.money=0;document.getElementById('melding').textContent=''}}")
    v=p.evaluate("()=>{const out=[];for(let i=0;i<40;i++){__spill.spawn();out.push(document.getElementById('melding').textContent)}return out.filter(t=>t.includes('har landet')).length}")
    ok("Varsel: ingen sjelden-varsler når du ikke har råd",v==0,v)
    # vanskelighet
    p.keyboard.press("Escape")
    p.evaluate("()=>document.getElementById('fangBtn').click()");ok("Innstilling: fangstnivå kan endres og lagres",p.evaluate("()=>localStorage.getItem('evn_matdyr_fangst')")=="vanskelig",p.text_content("#fangBtn"))
    ok("K1 ingen konsollfeil (fangst)",not e,e[:3])
    c.close()
    # 0.9.0-lagring med betalt bæring: skal ikke betales på nytt
    old=json.dumps({"v":1,"money":1000,"level":0,"base":[-1,-1,-1,-1],"disc":[],"name":"x","carry":3,"intro":3})
    c,p,e=ny(b,init=f"if(!sessionStorage.getItem('x')){{sessionStorage.setItem('x','1');localStorage.setItem('evn-matdyr-v1',{json.dumps(old)})}}")
    p.goto(URL,timeout=120000);p.wait_for_timeout(1500);p.click("#startBtn",force=True);p.wait_for_timeout(2500)
    st=p.evaluate("()=>({b:__spill.base.slice(),m:__spill.money})")
    ok("Lagring fra 0.9.0 (betalt bæring) leveres uten ny betaling",st["b"][0]==3 and st["m"]>=1000,st)
    c.close();b.close()
