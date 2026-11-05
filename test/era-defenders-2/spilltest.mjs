// Era Defenders 2 – spilltest (v0.5.0): våpen, verdener, hindre, lava, lagring og mobiloppsett.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const UT='/home/claude/era2/bilder', URL='file:///home/claude/evnstudio/spill/era-defenders-2/index.html';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const feil=[];const r={};
async function side(w,h,touch,lagring){const c=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch});const p=await c.newPage();p.on('pageerror',e=>feil.push(w+'x'+h+': '+e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')feil.push(w+'x'+h+' '+m.type()+': '+m.text())});if(lagring)await c.addInitScript(l=>{if(!sessionStorage.getItem('satt')){localStorage.clear();localStorage.setItem('evn-era-defenders-2-v1',l);sessionStorage.setItem('satt','1')}},lagring);await p.goto(URL,{timeout:90000});if(!lagring){await p.evaluate(()=>localStorage.clear());await p.reload()}await p.waitForFunction(()=>window.__spill&&!document.getElementById('startBtn').disabled&&__spill.helt.pistol,null,{timeout:40000});return p}
let p=await side(1280,800,false);
await p.click('#startBtn',{force:true});await p.waitForTimeout(300);
r.start=await p.evaluate(()=>({verden:__spill.VERDENER[__spill.verden].navn,hinder:__spill.hinder.length,fase:__spill.fase}));
r.nedtelling=await p.evaluate(()=>{const S=__spill;const f0=S.fase;S.steg(11);return f0+'→'+S.fase});
r.pistol=await p.evaluate(()=>{const S=__spill;S.drepAlle();S.helt.x=0;S.helt.z=0;const mo=S.lagMonster('kamp',5,0,1);const hp=mo.hp;S.kamp.pistolCd=0;S.skytPistol([1,0]);S.steg(0.4);return hp+'→'+mo.hp});
r.pistolHold=await p.evaluate(()=>{const S=__spill;S.drepAlle();const mo=S.lagMonster('tank',6,0,1);mo.hp=1000;window.__t=1;return 1});
await p.keyboard.down('Space');await p.evaluate(()=>__spill.steg(1));await p.keyboard.up('Space');r.pistolHold=await p.evaluate(()=>1000-__spill.monstre[0].hp+' skade på 1 s');
r.kraftdytt=await p.evaluate(()=>{const S=__spill;S.drepAlle();S.helt.x=0;S.helt.z=0;const mo=S.lagMonster('kamp',3,0,1);S.kamp.magiCd=0;S.kamp.mana=100;S.skytMagi([1,0]);return 'x 3→'+mo.x.toFixed(1)});
r.granat=await p.evaluate(()=>{const S=__spill;S.drepAlle();const a=S.lagMonster('tank',6,0.5,1),c=S.lagMonster('tank',6,-0.5,1);const h=a.hp;S.kamp.granatCd=0;S.kastGranat();S.steg(1);return 'to tankboter: '+h+'→'+a.hp+' og '+c.hp});
r.hinderStopperSkudd=await p.evaluate(()=>{const S=__spill;S.drepAlle();const h=S.hinder.find(h=>h.s==='sirkel');S.helt.x=h.x-h.r-1.2;S.helt.z=h.z;const mo=S.lagMonster('tank',h.x+h.r+2,h.z,1);mo.hp=500;const f=mo.hp;S.kamp.pistolCd=0;S.skytPistol([1,0]);S.steg(0.5);S.drepAlle();return f===500?'ja':'?'});
r.lava=await p.evaluate(()=>{const S=__spill;S.settHoyeste(3);S.byttVerden(3);S.drepAlle();const f=S.farer[0];S.helt.x=f.x;S.helt.z=f.z;S.helt.hp=150;S.helt.nede=0;S.steg(1);return 'liv etter 1 s i lava: '+Math.round(S.helt.hp)});
r.verdenLagret=await p.evaluate(()=>{const s=__spill.lesLagring();return s.verden+' / høyeste '+s.hoyeste});
r.vinnVerden=await p.evaluate(()=>{const S=__spill;S.byttVerden(0);S.hopp(10);S.startBolge();S.steg(0.1);while(S.monstre.length||S.fase==='kamp'){S.drepAlle();S.steg(2);if(S.fase!=='kamp')break}const s=S.lesLagring();return 'fase '+S.fase+', lagret verden '+s.verden+', kort: '+document.getElementById('sluttIgjen').textContent});
await p.click('#sluttIgjen');r.nesteVerden=await p.evaluate(()=>__spill.VERDENER[__spill.verden].navn+' bølge '+__spill.bolge);
r.draMur=await p.evaluate(()=>{const S=__spill;S.drepAlle();S.byttVerden(0);S.mynter=1000;S.velg('mur');const f=S.bygg.length;S.draTest(-20,14,-8,2);const m=S.bygg.filter(b=>b.t==='mur');S.avbrytPlassering();return (m.length-f)+' murer på skrå, rotasjon '+(m[0]&&m[0].rot.toFixed(2))+', mynter igjen '+S.mynter});
r.draIkkeNokPenger=await p.evaluate(()=>{const S=__spill;S.mynter=60;S.velg('mur');const f=S.bygg.length;S.draTest(-20,-14,10,-14);S.avbrytPlassering();return (S.bygg.length-f)+' murer for 60 mynter'});
r.ingenNesteKnapp=await p.evaluate(()=>!document.getElementById('nesteKnapp'));
r.knapperSkjultPaaPC=await p.evaluate(()=>getComputedStyle(document.getElementById('kamp')).display==='none');
await p.context().close();
// Gammel lagring (v1, Framtiden) gjøres om
const v1=JSON.stringify({v:1,verden:1,bolge:4,mynter:300,baseNiv:2,skjoldNiv:1,seier:false,bygg:[{t:'laser',x:6,z:0,niv:1,brukt:100}]});
p=await side(1000,700,false,v1);r.v1lagring=await p.evaluate(()=>{const s=__spill.lesLagring();return 'verden '+__spill.verden+', mynter '+__spill.mynter+', robotnivå '+__spill.basen.niv+', bygg '+__spill.bygg.length});await p.context().close();
for(const [w,h,n] of [[844,390,'31-mobil-ligg'],[390,844,'32-mobil-staa']]){const q=await side(w,h,true);await q.tap('#startBtn',{force:true});await q.waitForTimeout(500);await q.screenshot({path:UT+'/'+n+'.png'});
  const rect=id=>q.evaluate(i=>{const e=document.getElementById(i).getBoundingClientRect();return[e.left,e.top,e.right,e.bottom].map(Math.round)},id);
  const ids=['hud','hoyre','bunn','joy','kSverd','kMagi','kPistol'];const R={};for(const i of ids)R[i]=await rect(i);
  const over=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=R[ids[i]],c=R[ids[j]];if(a[2]>c[0]&&c[2]>a[0]&&a[3]>c[1]&&c[3]>a[1])over.push(ids[i]+'/'+ids[j])}
  r[n]={overlapp:over};await q.context().close()}
console.log(JSON.stringify(r,null,1));console.log('FEIL',feil);await b.close();
