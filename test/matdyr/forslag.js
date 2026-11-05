// Ivars tre forslag (2026-11-05) i samme modell som okonomi.js. SIMULERING, IKKE SPILLTEST.
// krukke: inntekt samles i krukker (tak = KRUKKE_S sekunders inntekt per plass), tømmes ved hvert besøk i basen.
// sett: +50 % for hvert matdyr i en gruppe på minst 3 med samme dyr eller samme mat (hvor som helst i basen).
// fang: Legendary og bedre må fanges; feilet fangst = matdyret er borte og turen er brukt.
const D=require("./data.js");const {R,COMBOS,POOLS,PRICE,INC,plotsFor,upCost,MAX_LEVEL,FOODS}=D;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const P={"Ny spiller":{tur:45,syn:4,velg:"tilfeldig",opp:.5,bytt:.4,fang:.35},"Vanlig barn":{tur:25,syn:7,velg:"best",opp:1,bytt:.9,fang:.6},"Effektiv spiller":{tur:14,syn:12,velg:"best",opp:1,bytt:1,fang:.85}};
const KRUKKE_S=120;
const ai=c=>Math.floor(c/FOODS.length),fi=c=>c%FOODS.length;
function basisInc(base,sett){let s=0;const na={},nf={};if(sett)base.forEach(c=>{if(c>=0){na[ai(c)]=(na[ai(c)]||0)+1;nf[fi(c)]=(nf[fi(c)]||0)+1}});
  base.forEach(c=>{if(c<0)return;let k=INC(c);if(sett&&(na[ai(c)]>=3||nf[fi(c)]>=3))k*=1.5;s+=k});return s}
function kjor(p,seed,mode,pauseFra){
  const r=rng(seed),tot=R.reduce((s,x)=>s+x.w,0);const pick=()=>{let x=r()*tot;for(let i=0;i<R.length;i++){x-=R[i].w;if(x<=0)return i}return 0};
  let money=60,level=0,base=[-1,-1,-1,-1],t=0,neste=p.tur,krukke=0;const forste={},logg={};const sett=mode==="sett";
  while(t<3600){t++;
    const ledig=pauseFra&&t>pauseFra&&t<=pauseFra+600; // spilleren går fra spillet i 10 min
    const i=basisInc(base,sett);
    if(mode==="krukke"){krukke=Math.min(krukke+i,KRUKKE_S*i)}
    else if(mode==="basis3min"){if(!(ledig&&t-pauseFra>180))money+=i}
    else money+=i;
    if(base.every(c=>c<0)&&money<R[0].price)money=R[0].price;
    if([600,1800,3600].includes(t))logg[t/60]={inc:basisInc(base,sett),penger:money+krukke,sett:sett?base.filter(c=>c>=0&&(base.filter(d=>d>=0&&ai(d)===ai(c)).length>=3||base.filter(d=>d>=0&&fi(d)===fi(c)).length>=3)).length:0};
    if(ledig||t<neste)continue;neste=t+p.tur*(.7+r()*.6);
    if(mode==="krukke"){money+=krukke;krukke=0}
    if(level<MAX_LEVEL&&money>=upCost(level)&&base.indexOf(-1)<0&&r()<p.opp){money-=upCost(level);level++;while(base.length<plotsFor(level))base.push(-1)}
    const syn=[];for(let k=0;k<p.syn;k++){const q=pick(),pool=POOLS[q];syn.push(pool[Math.floor(r()*pool.length)])}
    const kan=syn.filter(c=>PRICE(c)<=money);if(!kan.length)continue;
    // «best»: størst økning i baseinntekt (tar hensyn til sett når sett er på)
    const fri=base.indexOf(-1);
    const gevinst=c=>{const b=base.slice();let w=fri;if(w<0){w=0;let lav=1e18;b.forEach((d,j)=>{const bb=b.slice();bb[j]=-1;const tap=basisInc(b,sett)-basisInc(bb,sett);if(tap<lav){lav=tap;w=j}})}b[w]=c;return [basisInc(b,sett)-basisInc(base,sett),w]};
    let ci,g;if(p.velg==="best"){let best=-1e18;kan.forEach(c=>{const x=gevinst(c);if(x[0]>best){best=x[0];ci=c;g=x}})}else{ci=kan[Math.floor(r()*kan.length)];g=gevinst(ci)}
    if(mode==="fang"&&COMBOS[ci].r>=3&&r()>p.fang)continue;
    if(fri<0){if(g[0]<=0||r()>p.bytt)continue;money+=Math.floor(PRICE(base[g[1]])/2)}
    money-=PRICE(ci);base[g[1]]=ci;const rr=COMBOS[ci].r;if(forste[rr]===undefined)forste[rr]=t}
  return {logg,forste}}
const N=200,med=a=>{a=a.slice().sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":String(Math.round(n));
const tid=(k,r)=>{const a=k.map(x=>x.forste[r]).filter(x=>x!==undefined);return a.length/N<.5?"–":Math.round(med(a)/60)+" min"};
console.log("| Modus | Profil | Inntekt/s 10/30/60 min | Matdyr i sett (60 min) | Første Mythic | Første Food God |\n|---|---|---|---|---|---|");
for(const mode of ["basis","sett","fang"])for(const [n,p] of Object.entries(P)){const k=[];for(let s=1;s<=N;s++)k.push(kjor(p,s*7919,mode));
  const v=m=>fmt(med(k.map(x=>x.logg[m].inc)));console.log(`| ${mode} | ${n} | ${v(10)} / ${v(30)} / ${v(60)} | ${mode==="sett"?med(k.map(x=>x.logg[60].sett)):"–"} | ${tid(k,4)} | ${tid(k,5)} |`)}
console.log("\nSpilleren går fra spillet i 10 min etter 20 min (vanlig barn): penger tjent mens borte");
for(const mode of ["basis","basis3min","krukke"]){const p=P["Vanlig barn"];const a=[];for(let s=1;s<=N;s++){const r=rng(s);const x=kjor(p,s*7919,mode,1200);a.push(x)}
  // mål: penger ved 30 min minus penger ved 20 min er ikke logget; bruk inntekt × tid som er tjent passivt
  console.log(mode, "inntekt/s ved 30 min:",fmt(med(a.map(x=>x.logg[30].inc))),"penger+krukke ved 30 min:",fmt(med(a.map(x=>x.logg[30].penger))))}
