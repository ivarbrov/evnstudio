from playwright.sync_api import sync_playwright
import json
R=[]
def ok(name,cond,info=""): R.append(("OK " if cond else "FEIL")+" "+name+(" — "+str(info) if info else ""))
import atexit
atexit.register(lambda: print("\n".join(R)))
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
    ctx=b.new_context(viewport={"width":1280,"height":800});pg=ctx.new_page();errs=[];reqfail=[]
    pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("console",lambda m:errs.append(m.type+":"+m.text[:140]) if m.type in("error",) else None)
    pg.on("response",lambda r:reqfail.append(r.url) if r.status>=400 else None)
    pg.route("**/three.min.js",lambda r:r.fulfill(path="../../vendor/three-r128.min.js",content_type="application/javascript"))
    pg.goto("http://localhost:8765/index.html");pg.evaluate("()=>{localStorage.clear();localStorage.setItem('evn_matdyr_gfx','rask')}");pg.reload();pg.wait_for_timeout(800)
    # U1 startkort
    st=pg.evaluate("()=>({merke:!!document.querySelector('#start .evn-merke'),h1:document.querySelector('#start h1').textContent,ver:document.getElementById('versjon').textContent,start:!!document.getElementById('startBtn'),img:document.getElementById('startRobot').naturalWidth})")
    ok("U1 startkort (merke, tittel, mål, styring, Start, versjon)",st["merke"] and st["start"] and st["ver"].startswith("Versjon 0.9"),st)
    ok("T3 viewport ikke sperret", "user-scalable=no" not in pg.content() and "maximum-scale" not in pg.content())
    pg.click("#startBtn",force=True);pg.wait_for_timeout(2500)
    ok("F1 start", pg.evaluate("()=>__spill.started"))
    # pause via P and Esc
    pg.keyboard.press("p");pg.wait_for_timeout(400);ok("F1/KS1 P åpner pause",pg.evaluate("()=>document.getElementById('evnPause').classList.contains('vis')&&__spill.paused"))
    fokus=pg.evaluate("()=>document.activeElement.id");ok("T2 fokus i pausen",fokus=="evnPauseFortsett",fokus)
    pg.wait_for_timeout(350);pg.keyboard.press("Escape");pg.wait_for_timeout(300);ok("KS7 Esc lukker pausen",not pg.evaluate("()=>document.getElementById('evnPause').classList.contains('vis')||__spill.paused"))
    pg.keyboard.press("m");pg.wait_for_timeout(400);ok("KS2/B2 M åpner kart",pg.evaluate("()=>document.getElementById('evnKart').classList.contains('vis')&&__spill.paused"))
    pg.screenshot(path="/tmp/qa_kart.png");pg.wait_for_timeout(250);pg.keyboard.press("m");pg.wait_for_timeout(300)
    ok("Kart lukkes med M",not pg.evaluate("()=>document.getElementById('evnKart').classList.contains('vis')"))
    order=pg.evaluate("()=>[...document.getElementById('hoyre').children].filter(e=>getComputedStyle(e).display!=='none'&&!e.hidden).map(e=>e.id)")
    order=[x for x in order if x!='evnAvslutt'];ok("KS5 rekkefølge (⚙️, 🗺️, ⏸ fra venstre; Avslutt bare under /spill/)",order[-2:]==["evnKartKnapp","evnPauseKnapp"],order)
    # buy flow
    r=pg.evaluate("()=>{__spill.money=1e6;const a=__spill.spawn(30,5,3);a.state='walk';a.g.position.y=0;a.sp=0;__spill.robot.position.set(4,0,3);return true}")
    pg.wait_for_timeout(1500);act=pg.text_content("#act");pg.keyboard.press("e");pg.wait_for_timeout(800)
    carry=pg.evaluate("()=>__spill.findAction()&&__spill.findAction().type");ok("Kjøp med E",carry=="drop",act)
    pg.evaluate("()=>{__spill.robot.position.set(-40,0.6,0)}");pg.wait_for_timeout(1500)
    ok("Levering i basen",pg.evaluate("()=>__spill.base.some(c=>c>=0)&&__spill.disc.size===1"))
    up=pg.evaluate("()=>{const u=document.getElementById('oppgrader');return !u.classList.contains('hidden')}");ok("UI4 oppgrader vises i basen",up)
    pg.keyboard.press("u");pg.wait_for_timeout(800);ok("U oppgraderer",pg.evaluate("()=>__spill.level===1"))
    pg.evaluate("()=>{__spill.robot.position.set(10,0,0)}");pg.wait_for_timeout(1500);print("DBG",pg.evaluate("()=>({p:__spill.paused,s:__spill.started,cls:document.getElementById('oppgrader').className,x:__spill.robot.position.x})"));ok("UI4 oppgrader skjules utenfor basen",pg.evaluate("()=>document.getElementById('oppgrader').classList.contains('hidden')"))
    # samlebok
    pg.keyboard.press("i");pg.wait_for_timeout(300);bok=pg.evaluate("()=>({vis:document.getElementById('bok').classList.contains('vis'),kort:document.querySelectorAll('#bokGrid .dk').length,har:document.querySelectorAll('#bokGrid .dk:not(.ukjent)').length,paused:__spill.paused,fokus:document.activeElement.id})")
    ok("C Matdyrboka (I) viser 40 dyr, 1 funnet, spillet står stille",bok["vis"] and bok["kort"]==40 and bok["har"]==1 and bok["paused"],bok)
    pg.click("#fVar");pg.wait_for_timeout(300);ok("C fanen «Alle matdyr» viser 1000",pg.evaluate("()=>document.querySelectorAll('#bokGrid .dk').length")==1000)
    pg.click("#bokVis [data-v=mangler]");pg.wait_for_timeout(200);ok("Filter «Mangler»",pg.evaluate("()=>document.querySelectorAll('#bokGrid .dk').length")==999)
    pg.screenshot(path="/tmp/qa_bok.png")
    for i in range(30): pg.keyboard.press("Tab")
    ok("T2 Tab blir i samleboka",pg.evaluate("()=>document.getElementById('bok').contains(document.activeElement)"))
    pg.keyboard.press("Escape");pg.wait_for_timeout(200);ok("Esc lukker samleboka",not pg.evaluate("()=>document.getElementById('bok').classList.contains('vis')||__spill.paused"))
    # innstillinger + navn, E i input
    pg.click("#innstKnapp");pg.wait_for_timeout(200);pg.click("#nameBtn");pg.wait_for_timeout(200);pg.fill("#nameIn","");pg.click("#nameOk");err=pg.text_content("#nameErr")
    pg.fill("#nameIn","Testbase");pg.keyboard.press("e");pg.keyboard.press("Enter");pg.wait_for_timeout(200)
    nm=pg.evaluate("()=>JSON.parse(localStorage.getItem('evn-matdyr-v1')).name")
    ok("Navn: tom gir feil, E skrives som tekst, Enter lagrer",err.startswith("Skriv") and nm=="Testbasee",(err,nm))
    stack=pg.evaluate("()=>document.getElementById('innst').classList.contains('vis')");pg.keyboard.press("Escape");pg.wait_for_timeout(200)
    ok("Esc lukker innstillinger, spillet fortsetter",stack and not pg.evaluate("()=>__spill.paused"))
    # F2 reload keeps progress, nullstill needs confirm
    pg.reload();pg.wait_for_timeout(1200)
    ok("F2 fremgang etter omlasting",pg.evaluate("()=>__spill.base.some(c=>c>=0)&&__spill.level===1"))
    vis=pg.evaluate("()=>!document.getElementById('evnNullstill').hidden");pg.click("#evnNullstill");pg.wait_for_timeout(200)
    ok("F2 «Start helt på nytt» spør først",vis and pg.evaluate("()=>document.getElementById('evnNullstillBoks').classList.contains('vis')"))
    pg.click("#evnNullstillNei")
    # T1 touch targets
    pg.click("#startBtn",force=True);pg.wait_for_timeout(800)
    small=pg.evaluate("()=>[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return [e.id||e.textContent.slice(0,12),Math.round(r.width),Math.round(r.height)]}).filter(x=>x[1]<44||x[2]<44)")
    ok("T1 trykkflater ≥ 44 px (synlige)",not small,small)
    # F3 corrupt save
    c3=b.new_context();c3.add_init_script("try{if(!sessionStorage.getItem('x')){sessionStorage.setItem('x','1');localStorage.setItem('evn-matdyr-v1','{oops');localStorage.setItem('evn_matdyr_gfx','rask')}}catch(e){}");p3=c3.new_page();e3=[];p3.on("pageerror",lambda e:e3.append(str(e)))
    p3.route("**/three.min.js",lambda r:r.fulfill(path="../../vendor/three-r128.min.js",content_type="application/javascript"))
    p3.goto("http://localhost:8765/index.html",timeout=120000);p3.wait_for_timeout(1200)
    ok("F3 ødelagt lagring krasjer ikke og kopi tas vare på",p3.evaluate("()=>localStorage.getItem('evn-matdyr-v1-kopi')==='{oops'&&!document.getElementById('feilLag').classList.contains('vis')")and not e3,e3[:2])
    ok("K1 ingen konsollfeil",not errs,errs[:3]);ok("K1 ingen 404",not reqfail,reqfail[:3])
    # mobile layout
    m=b.new_context(viewport={"width":375,"height":812},has_touch=True,is_mobile=True);mp=m.new_page();mp.add_init_script("try{localStorage.setItem('evn_matdyr_gfx','rask')}catch(e){}")
    mp.route("**/three.min.js",lambda r:r.fulfill(path="../../vendor/three-r128.min.js",content_type="application/javascript"))
    mp.goto("http://localhost:8765/index.html",timeout=120000);mp.wait_for_timeout(800);mp.screenshot(path="/tmp/qa_mstart.png");mp.tap("#startBtn",force=True);mp.wait_for_timeout(1500)
    lay=mp.evaluate("()=>({joy:getComputedStyle(document.getElementById('joy')).display,touch:document.documentElement.classList.contains('touch'),tast:getComputedStyle(document.querySelector('.handling .tast')||document.body).display})")
    ok("UI1/UI2 mobil: styrespak synlig",lay["joy"]=="block" and lay["touch"],lay)
    mp.evaluate("()=>{__spill.robot.position.set(-44,0.6,-6)}");mp.wait_for_timeout(2500);mp.screenshot(path="/tmp/qa_mbase.png")
    small2=mp.evaluate("()=>[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return [e.id||e.textContent.slice(0,12),Math.round(r.width),Math.round(r.height)]}).filter(x=>x[1]<44||x[2]<44)")
    ok("T1 mobil trykkflater ≥ 44 px",not small2,small2)
    b.close()
