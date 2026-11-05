import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const UT='/home/claude/era2/bilder', URL='file:///home/claude/evnstudio/spill/era-defenders-2/index.html';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const feil=[];const r={};
async function side(w,h,touch){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch});const p=await c.newPage();p.on('pageerror',e=>feil.push(w+'x'+h+': '+e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')feil.push(w+'x'+h+' '+m.type()+': '+m.text())});await p.goto(URL,{timeout:90000});await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>window.__spill&&__spill.helt.sverd,null,{timeout:30000});return p}
let p=await side(1280,800,false);
await p.click('#startBtn',{force:true});await p.waitForTimeout(300);
r.utenBase=await p.evaluate(()=>!('g' in __spill.basen));
r.nedtelling=await p.evaluate(()=>{const S=__spill;const f0=S.fase;S.steg(11);return f0+'→'+S.fase});
r.sverd=await p.evaluate(()=>{const S=__spill;S.steg(6);const mo=S.monstre[0];if(!mo)return 'ingen monstre';S.helt.x=mo.x-1.5;S.helt.z=mo.z;const hp=mo.hp;S.kamp.sverdCd=0;S.sverdHugg();return hp+'→'+(S.monstre.includes(mo)?mo.hp:'død')});
r.magi=await p.evaluate(()=>{const S=__spill;S.kamp.magiCd=0;const m0=S.kamp.mana;S.skytMagi([1,0]);return Math.round(m0)+'→'+Math.round(S.kamp.mana)});
await p.waitForTimeout(700);const fm=await p.evaluate(()=>{__spill.kamp.magiCd=0;return __spill.kamp.mana});r.dbg=await p.evaluate(()=>({paused:__spill.paused,el:document.elementFromPoint(900,300).id||document.elementFromPoint(900,300).className,cd:__spill.kamp.magiCd,nede:__spill.helt.nede,fase:__spill.fase}));await p.mouse.click(900,300);r.musMagi=await p.evaluate(m=>Math.round(m)+'→'+Math.round(__spill.kamp.mana),fm);
await p.waitForTimeout(800);await p.screenshot({path:UT+'/10-kamp-pc.png'});
r.ingenNesteKnapp=await p.evaluate(()=>!document.getElementById('nesteKnapp'));
r.knapperSkjultPaaPC=await p.evaluate(()=>getComputedStyle(document.getElementById('kSverd')).display==='none'||getComputedStyle(document.getElementById('kamp')).display==='none');
await p.context().close();
for(const [w,h,n] of [[844,390,'11-mobil-ligg'],[390,844,'12-mobil-staa']]){const q=await side(w,h,true);await q.tap('#startBtn',{force:true});await q.waitForTimeout(500);await q.screenshot({path:UT+'/'+n+'.png'});
  const rect=id=>q.evaluate(i=>{const e=document.getElementById(i).getBoundingClientRect();return[e.left,e.top,e.right,e.bottom].map(Math.round)},id);
  const ids=['hud','hoyre','bunn','joy','kSverd','kMagi','kPistol'];const R={};for(const i of ids)R[i]=await rect(i);
  const over=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=R[ids[i]],c=R[ids[j]];if(a[2]>c[0]&&c[2]>a[0]&&a[3]>c[1]&&c[3]>a[1])over.push(ids[i]+'/'+ids[j])}
  await q.tap('#byggKnapp');await q.waitForTimeout(300);await q.screenshot({path:UT+'/'+n+'-bygg.png'});
  const bl=await rect('byggLinje'),bu=await rect('bunn');const ob=bl[2]>bu[0]&&bu[2]>bl[0]&&bl[3]>bu[1]&&bu[3]>bl[1];
  r[n]={overlapp:over,byggLinjeOverBygg:ob};await q.context().close()}
console.log(JSON.stringify(r,null,1));console.log('FEIL',feil);await b.close();
