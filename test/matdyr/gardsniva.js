// Gårdsnivå for Matdyr-regn: simulering av et forslag (fase 1). SIMULERING, IKKE SPILLTEST.
// Samme modell og forenklinger som okonomi.js: spilleren er aktiv hele tiden, én tur tar fast tid,
// spilleren ser et tilfeldig utvalg matdyr etter sjeldenhetsvektene, og fangst og gangtid er ikke modellert.
// Nytt: plassnivået («Flere plasser») har et tak per gårdsnivå. Gårdsnivå krever bestemte dyrearter
// med minste sjeldenhet og et pengebeløp. Spilleren mister bare de dyrene som leveres inn.
const D=require("./data.js");const {R,COMBOS,POOLS,PRICE,INC,ANIMALS,FOODS}=D;
// Plasspris: som i dag til 24 plasser (nivå 0–9). Etter det dobles prisen per steg fra 10 mill.
const upCost=l=>l<10?D.upCost(l):1e7*Math.pow(2,l-10);
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ART=n=>ANIMALS.findIndex(a=>a[1]===n);
// krav: [art, antall, minste sjeldenhet (0 Common … 5 Food God)]; tak = antall plasser på dette nivået
const NIVA=[
  {tak:8},
  {tak:12, krav:[["ku",2,0],["gris",1,0]], penger:1000},
  {tak:16, krav:[["sau",2,1],["skilpadde",1,0]], penger:10000},
  {tak:20, krav:[["katt",1,2],["høne",2,1]], penger:60000},
  {tak:24, krav:[["rev",2,2],["hest",1,1]], penger:250000},
  {tak:28, krav:[["elefant",1,3],["panda",2,2]], penger:2e6},
  {tak:32, krav:[["løve",1,3],["sjiraff",2,3]], penger:10e6},
  {tak:36, krav:[["enhjørning",1,4],["pingvin",2,3]], penger:50e6},
  {tak:40, krav:[["blekksprut",1,4],["krokodille",1,4],["tiger",1,4]], penger:300e6},
  {tak:40, krav:[["hval",1,5],["dinosaur",1,4]], penger:1e9}
];
const BOOST=+(process.env.BOOST||0.15);
const plassTak=g=>NIVA[g].tak, plasserFor=l=>4+2*l;
const PROFILER={
  "Ny spiller":       {tur:45,syn:4, velg:"tilfeldig",opp:.5,bytt:.4,krav:.6},
  "Vanlig barn":      {tur:25,syn:7, velg:"best",     opp:1, bytt:.9,krav:.9},
  "Effektiv spiller": {tur:14,syn:12,velg:"best",     opp:1, bytt:1, krav:1}};
function kjor(p,seed,min){
  const r=rng(seed),tot=R.reduce((s,x)=>s+x.w,0);
  const pick=()=>{let x=r()*tot;for(let i=0;i<R.length;i++){x-=R[i].w;if(x<=0)return i}return 0};
  let money=60,level=0,g=0,base=[-1,-1,-1,-1],t=0,neste=p.tur;const naadd={},logg={};
  const inc=()=>base.reduce((s,c)=>s+(c>=0?INC(c):0),0);
  const ai=c=>Math.floor(c/FOODS.length);
  // Hvilke dyr i basen kan leveres for neste nivå (de svakeste som oppfyller kravet)
  function leveranse(){const n=NIVA[g+1];if(!n)return null;const brukt=new Set(),valgt=[];
    for(const [art,ant,min] of n.krav){const kand=base.map((c,i)=>[c,i]).filter(([c,i])=>c>=0&&!brukt.has(i)&&ai(c)===ART(art)&&COMBOS[c].r>=min).sort((a,b)=>INC(a[0])-INC(b[0]));
      if(kand.length<ant)return null;kand.slice(0,ant).forEach(([c,i])=>{brukt.add(i);valgt.push(i)})}
    return valgt}
  const mangler=c=>{const n=NIVA[g+1];if(!n)return false;const a=ai(c);
    return n.krav.some(([art,ant,min])=>ART(art)===a&&COMBOS[c].r>=min&&base.filter(b=>b>=0&&ai(b)===a&&COMBOS[b].r>=min).length<ant)};
  const reservert=i=>{const n=NIVA[g+1];if(!n)return false;const c=base[i];return c>=0&&n.krav.some(([art,ant,min])=>ART(art)===ai(c)&&COMBOS[c].r>=min)};
  while(t<min*60){
    t+=1;money+=inc();
    if(base.every(c=>c<0)&&money<R[0].price)money=R[0].price;
    if(t%600===0)logg[t/60]={g,inc:inc(),plasser:base.length,money};
    if(t<neste)continue;neste=t+p.tur*(0.7+r()*0.6);
    // Oppgrader gården når kravene er oppfylt
    const lev=leveranse();
    if(lev&&money>=NIVA[g+1].penger&&r()<p.krav){money-=NIVA[g+1].penger;lev.forEach(i=>base[i]=-1);g++;naadd[g]=t;continue}
    // Flere plasser innenfor taket
    if(plasserFor(level)<plassTak(g)&&money>=upCost(level)&&base.indexOf(-1)<0&&r()<p.opp){money-=upCost(level);level++;while(base.length<Math.min(plasserFor(level),plassTak(g)))base.push(-1)}
    while(base.length<Math.min(plasserFor(level),plassTak(g)))base.push(-1);
    // Se matdyr på enga og kjøp
    // Bestillingsregn: sjeldenheten trekkes som før. Med sannsynlighet BOOST trekkes arten blant dem det er bestilling på.
    const arter=NIVA[g+1]?NIVA[g+1].krav.map(k=>ART(k[0])):[];
    const syn=[];for(let i=0;i<p.syn;i++){const k=pick(),pool=POOLS[k];let ut=pool;
      if(arter.length&&r()<BOOST){const b=pool.filter(c=>arter.includes(ai(c)));if(b.length)ut=b}
      syn.push(ut[Math.floor(r()*ut.length)])}
    const kan=syn.filter(c=>PRICE(c)<=money);if(!kan.length)continue;
    const trengs=kan.filter(mangler);
    const ci=trengs.length&&r()<p.krav?trengs[0]:(p.velg==="best"?kan.sort((a,b)=>INC(b)-INC(a))[0]:kan[Math.floor(r()*kan.length)]);
    const fri=base.indexOf(-1);
    if(fri<0){let w=-1;base.forEach((c,i)=>{if(reservert(i))return;if(w<0||INC(c)<INC(base[w]))w=i});
      if(w<0)continue;if(!mangler(ci)&&(INC(ci)<=INC(base[w])||r()>p.bytt))continue;
      money-=PRICE(ci);money+=Math.floor(PRICE(base[w])/2);base[w]=ci}
    else{money-=PRICE(ci);base[fri]=ci}
  }
  return {naadd,logg};
}
const N=300,q=(a,f)=>{a=a.slice().sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(f*a.length))]};
const MIN=+(process.env.MIN||480);
let md="| Gårdsnivå | Krav | "+Object.keys(PROFILER).map(n=>n+" (median, andel innen "+MIN/60+" t)").join(" | ")+" |\n|---|---|"+Object.keys(PROFILER).map(()=>"---").join("|")+"|\n";
const res={};for(const [navn,p] of Object.entries(PROFILER)){res[navn]=[];for(let s=1;s<=N;s++)res[navn].push(kjor(p,s*7919,MIN))}
const kort=k=>k.map(([a,n,m])=>`${n} ${ANIMALS[ART(a)][0]} ${a} (${R[m].n}+)`).join(", ");
const fmtI=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":String(n);
const fmt=n=>n>=1e6?(n/1e6)+" mill":n>=1e3?(n/1e3)+"k":String(n);
for(let g=1;g<NIVA.length;g++){
  md+=`| ${g+1} | ${kort(NIVA[g].krav)}, 💰 ${fmt(NIVA[g].penger)} |`;
  for(const navn in PROFILER){const a=res[navn].map(k=>k.naadd[g]).filter(x=>x!==undefined);md+=a.length?` ${Math.round(q(a,.5)/60)} min (${Math.round(100*a.length/N)} %) |`:" ikke nådd |"}
  md+="\n"}
md+="\nGårdsnivå (median) etter 10, 30, 60, 120, 240 og 480 minutter:\n\n| Profil | 10 | 30 | 60 | 120 | 240 | 480 |\n|---|---|---|---|---|---|---|\n";
for(const navn in PROFILER)md+=`| ${navn} | ${[10,30,60,120,240,480].map(m=>q(res[navn].map(k=>k.logg[m].g+1),.5)+" ("+fmtI(q(res[navn].map(k=>k.logg[m].inc),.5))+"/s, "+q(res[navn].map(k=>k.logg[m].plasser),.5)+" pl.)").join(" | ")} |\n`;
console.log(md);
