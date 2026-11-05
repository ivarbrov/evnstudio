// Økonomisimulering for Matdyr-regn 0.9.0 — SIMULERING, IKKE SPILLTEST.
// Bruker spillets egne tall (R, COMBOS, PRICE, INC, plotsFor, upCost) hentet fra index.html.
// Forenklinger: aktiv spiller hele tiden (ingen 3-min-stopp), én kjøpstur tar fast tid,
// spilleren ser et utvalg matdyr fra sjeldenhetsvektene, ingen «Slipp».
const D=require("./data.js");const {R,COMBOS,POOLS,PRICE,INC,plotsFor,upCost,MAX_LEVEL,FOODS}=D;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const PROFILER={
  "Ny spiller":     {tur:45,syn:4, velg:"tilfeldig",oppgrader:0.5,bytt:0.4},
  "Vanlig barn":    {tur:25,syn:7, velg:"best",     oppgrader:1.0,bytt:0.9},
  "Effektiv spiller":{tur:14,syn:12,velg:"best",    oppgrader:1.0,bytt:1.0}};
function kjor(p,seed,min){
  const r=rng(seed),tot=R.reduce((s,x)=>s+x.w,0);
  const pick=()=>{let x=r()*tot;for(let i=0;i<R.length;i++){x-=R[i].w;if(x<=0)return i}return 0};
  let money=60,level=0,base=[-1,-1,-1,-1],disc=new Set(),t=0,neste=p.tur;const forste={},logg={};
  const inc=()=>base.reduce((s,c)=>s+(c>=0?INC(c):0),0);
  while(t<min*60){
    t+=1;money+=inc();
    if(base.every(c=>c<0)&&money<R[0].price)money=R[0].price; // «Roboten fant noen mynter»
    if([10,30,60].includes(t/60))logg[t/60]={money,inc:inc(),plasser:base.length,arter:new Set([...disc].map(c=>Math.floor(c/FOODS.length))).size,funnet:disc.size,best:Math.max(-1,...base.map(c=>c>=0?COMBOS[c].r:-1))};
    if(t<neste)continue;neste=t+p.tur*(0.7+r()*0.6);
    // oppgrader i basen
    if(level<MAX_LEVEL&&money>=upCost(level)&&base.indexOf(-1)<0&&r()<p.oppgrader){money-=upCost(level);level++;while(base.length<plotsFor(level))base.push(-1)}
    // se matdyr på enga
    const syn=[];for(let i=0;i<p.syn;i++){const k=pick(),pool=POOLS[k];syn.push(pool[Math.floor(r()*pool.length)])}
    const kan=syn.filter(c=>PRICE(c)<=money);if(!kan.length)continue;
    const ci=p.velg==="best"?kan.sort((a,b)=>INC(b)-INC(a))[0]:kan[Math.floor(r()*kan.length)];
    const fri=base.indexOf(-1);
    if(fri<0){let w=0;base.forEach((c,i)=>{if(INC(c)<INC(base[w]))w=i});if(INC(ci)<=INC(base[w])||r()>p.bytt)continue;
      money-=PRICE(ci);money+=Math.floor(PRICE(base[w])/2);base[w]=ci}
    else{money-=PRICE(ci);base[fri]=ci}
    if(!disc.has(ci)){disc.add(ci);const rr=COMBOS[ci].r;if(forste[rr]===undefined)forste[rr]=t}
  }
  return {logg,forste};
}
const N=300,q=(a,f)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(f*a.length))]};
const fmt=n=>n>=1e9?(n/1e9).toFixed(1)+" mrd":n>=1e6?(n/1e6).toFixed(1)+" mill":n>=1e3?(n/1e3).toFixed(1)+"k":String(Math.round(n));
const ut={};let md="| Profil | Min | Inntekt/s (median, p10–p90) | Plasser | Dyrearter | Matdyr funnet | Beste i basen (median) |\n|---|---|---|---|---|---|---|\n";
for(const [navn,p] of Object.entries(PROFILER)){
  const kj=[];for(let s=1;s<=N;s++)kj.push(kjor(p,s*7919,60));ut[navn]={};
  for(const m of [10,30,60]){const L=kj.map(k=>k.logg[m]);
    const v=k=>L.map(x=>x[k]);ut[navn][m]={inc:[q(v("inc"),.5),q(v("inc"),.1),q(v("inc"),.9)],plasser:q(v("plasser"),.5),arter:q(v("arter"),.5),funnet:q(v("funnet"),.5),best:R[q(v("best"),.5)]?R[q(v("best"),.5)].n:"-"};
    const u=ut[navn][m];md+=`| ${navn} | ${m} | ${fmt(u.inc[0])} (${fmt(u.inc[1])}–${fmt(u.inc[2])}) | ${u.plasser} | ${u.arter}/40 | ${u.funnet}/1000 | ${u.best} |\n`}
  const f=r=>{const a=kj.map(k=>k.forste[r]).filter(x=>x!==undefined);return a.length?`${Math.round(q(a,.5)/60)} min (${Math.round(100*a.length/N)} %)`:"ikke innen 60 min"};
  ut[navn].forste=R.map((x,i)=>x.n+": "+f(i));
}
let md2="\n**Første gang en sjeldenhet kjøpes (median tid, andel kjøringer som når den innen 60 min):**\n\n";
for(const n in ut)md2+=`- ${n}: ${ut[n].forste.slice(2).join(" · ")}\n`;
console.log(md+md2);
