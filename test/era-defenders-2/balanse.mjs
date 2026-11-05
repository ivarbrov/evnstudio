import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
for(const strategi of ['ingenting','bare-laser','blandet']){
const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/evnstudio/spill/era-defenders-2/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{localStorage.clear()});await p.reload();await p.waitForTimeout(1500);
await p.click('#startBtn',{force:true});
const res=await p.evaluate(async(strategi)=>{const S=__spill,log=[];let tid=0;window.__autoKamp=true;
  const plasser=[[6,0],[-6,0],[0,6],[0,-6],[5,5],[-5,-5],[5,-5],[-5,5],[9,0],[-9,0],[0,9],[0,-9]];
  for(let w=0;w<10;w++){
    if(strategi!=='ingenting'){let i=0;
      // kjøp: laser til det er 6, så oppgrader, (blandet: murer, skjold, base)
      for(let runde=0;runde<30;runde++){
        if(strategi==='blandet'&&S.skjold.niv===0&&S.mynter>=150){S.velg('skjold');continue}
        if(strategi==='blandet'&&S.basen.niv<2&&S.mynter>=200&&w>=3){S.velg('basen');continue}
        const lasere=S.bygg.filter(b=>b.t==='laser');
        if(lasere.length<6&&S.mynter>=100){const pl=plasser.find(([x,z])=>S.kanPlassere('laser',x,z));if(pl){S.avbrytPlassering();S.velg('laser');S.plasser(pl[0],pl[1]);continue}}
        const opp=lasere.find(b=>b.niv<3&&S.BYGG[0].niv[b.niv].pris<=S.mynter);
        if(opp){S.mynter-=S.BYGG[0].niv[opp.niv].pris;opp.brukt+=S.BYGG[0].niv[opp.niv].pris;opp.niv++;continue}
        if(strategi==='blandet'&&lasere.length>=6&&S.mynter>=25){const a=Math.random()*6.28,r=9;S.avbrytPlassering();S.velg('mur');S.plasser(Math.cos(a)*r,Math.sin(a)*r);S.avbrytPlassering();continue}
        break}}
    const før=S.bolge;S.startBolge();let t=0;while(S.fase==='kamp'&&t<400){S.steg(1);t++}tid+=t;
    log.push({b:før,fase:S.fase,sek:t,base:Math.round(S.helt.hp),mynter:S.mynter,bygg:S.bygg.length});
    if(S.fase!=='bygg')break}
  return {log,tid};},strategi);
console.log(strategi, JSON.stringify(res.log.map(l=>`${l.b}:${l.fase} ${l.sek}s robot${l.base} 🪙${l.mynter} b${l.bygg}`)), 'tid', Math.round(res.tid/60),'min');
await p.close()}
await b.close();
