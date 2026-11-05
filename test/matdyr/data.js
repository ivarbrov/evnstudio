const ANIMALS=[["🐷","gris"],["🐸","frosk"],["🦈","hai"],["🐙","blekksprut"],["🐒","ape"],["🐄","ku"],["🐭","mus"],["🐧","pingvin"],["🐘","elefant"],["🐋","hval"],["🐱","katt"],["🐶","hund"],["🐰","kanin"],["🦊","rev"],["🐻","bjørn"],["🐼","panda"],["🦁","løve"],["🐯","tiger"],["🐴","hest"],["🦄","enhjørning"],["🐑","sau"],["🐐","geit"],["🐔","høne"],["🦆","and"],["🦉","ugle"],["🦜","papegøye"],["🦩","flamingo"],["🐊","krokodille"],["🐢","skilpadde"],["🐍","slange"],["🦖","dinosaur"],["🦒","sjiraff"],["🦓","sebra"],["🐫","kamel"],["🦛","flodhest"],["🦏","neshorn"],["🐨","koala"],["🦥","dovendyr"],["🐌","snegle"],["🦀","krabbe"]];
const FOODS=[["🍕","Pizza"],["🌮","Taco"],["🍩","Smultring"],["🥞","Pannekake"],["🍝","Spagetti"],["🍌","Banan"],["🌭","Pølse"],["🧀","Oste"],["🍔","Burger"],["🍦","Is"],["🍫","Sjoko"],["🍪","Kjeks"],["🧇","Vaffel"],["🍿","Popcorn"],["🍣","Sushi"],["🥕","Gulrot"],["🥦","Brokkoli"],["🍓","Jordbær"],["🥒","Agurk"],["🍉","Melon"],["🥛","Melke"],["☕","Kakao"],["🥤","Brus"],["🧃","Juice"],["🧋","Milkshake"]];
const R=[
 {n:"Common",   c:"#9aa0a6",w:30, price:25,      inc:1},
 {n:"Rare",     c:"#34c759",w:26, price:500,     inc:10},
 {n:"Epic",     c:"#2f80ed",w:20, price:5000,    inc:60},
 {n:"Legendary",c:"#a855f7",w:13, price:25000,   inc:250},
 {n:"Mythic",   c:"#ef4444",w:8,  price:150000,  inc:1000},
 {n:"Food God", c:"#f5b700",w:1.2,price:1000000, inc:5000},
 {n:"Secret",   c:"#b46cff",w:0.3,price:25000000,inc:75000}];
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const COMBOS=[];
ANIMALS.forEach((a,ai)=>FOODS.forEach((f,fi)=>COMBOS.push({a:a[0],f:f[0],name:f[1]+a[1],r:0})));
(function assign(){
  const rand=rng(42),idx=COMBOS.map((_,i)=>i);
  for(let i=idx.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
  const counts=[430,290,160,80,40];let k=0;COMBOS.forEach(c=>c.m=1+Math.floor(rand()*7)*0.25);
  counts.forEach((n,r)=>{for(let i=0;i<n;i++)COMBOS[idx[k++]].r=r});
  const S=(an,fo,name,r,hun)=>{const ai=ANIMALS.findIndex(x=>x[1]===an),fi=FOODS.findIndex(x=>x[1]===fo);const c=COMBOS[ai*FOODS.length+fi];if(name){c.special=name;c.hun=!!hun}c.r=r};
  S("gris","Smultring",null,0);
  S("mus","Oste",null,0);
  S("frosk","Pizza",null,1);
  S("ape","Banan",null,1);
  S("ku","Melke",null,1);
  S("pingvin","Pølse",null,2);
  S("frosk","Kakao",null,2);
  S("hai","Taco",null,3);
  S("blekksprut","Spagetti",null,4);
  S("hval","Burger","Óðinn",5);
  S("dinosaur","Sjoko","Loki",6);
  COMBOS.forEach(c=>{if(c.r>=5)c.m=1});
  // Islandske navn: fornavn + «-son»/«-dóttir» etter maten (Evens valg 4.11.2026)
  const HAN=["Jón","Sigurður","Guðmundur","Gunnar","Ólafur","Einar","Kristján","Magnús","Stefán","Jóhann","Björn","Árni","Helgi","Þór","Ragnar","Haukur","Ari","Egill","Hrafn","Kári","Leifur","Snorri","Ásgeir","Baldur","Bjarki","Fannar","Grettir","Hallur","Ívar","Orri"];
  const HUN=["Guðrún","Anna","Sigríður","Kristín","Margrét","Helga","Sigrún","Ingibjörg","María","Jóhanna","Katrín","Elín","Ásta","Hildur","Birna","Freyja","Hekla","Saga","Sól","Embla","Eyja","Dís","Björk","Rósa","Lilja","Unnur","Vigdís","Þóra","Hrefna","Ragnheiður"];
  const FAR=["Pítsu","Takó","Kleinuhrings","Pönnuköku","Spagettí","Banana","Pylsu","Osts","Borgara","Íss","Súkkulaði","Kex","Vöfflu","Poppkorns","Sushi","Gulrótar","Spergilkáls","Jarðarberja","Gúrku","Melónu","Mjólkur","Kakó","Gos","Djús","Mjólkurhristings"];
  const nr=rng(354);
  const used=new Set();COMBOS.forEach(c=>{if(c.special)used.add(c.special+"|"+COMBOS.indexOf(c)%FOODS.length)});
  COMBOS.forEach((c,i)=>{const fi=i%FOODS.length;if(c.special){c.name=c.special+" "+FAR[fi]+(c.hun?"dóttir":"son");return}
    let hun,fn,k=0;do{hun=nr()<.5;fn=hun?HUN[Math.floor(nr()*HUN.length)]:HAN[Math.floor(nr()*HAN.length)];k++}while(used.has(fn+"|"+fi)&&k<200);
    used.add(fn+"|"+fi);c.name=fn+" "+FAR[fi]+(hun?"dóttir":"son")});
})();
const POOLS=R.map((_,r)=>COMBOS.map((c,i)=>c.r===r?i:-1).filter(i=>i>=0));
const PRICE=ci=>Math.round(R[COMBOS[ci].r].price*COMBOS[ci].m);
const INC=ci=>Math.round(R[COMBOS[ci].r].inc*COMBOS[ci].m);
const plotsFor=l=>4+2*l, MAX_LEVEL=10, MAX_PLOTS=plotsFor(MAX_LEVEL);
const upCost=l=>Math.round(250*Math.pow(3,l)/50)*50;
module.exports={R,COMBOS,POOLS,PRICE,INC,plotsFor,upCost,MAX_LEVEL,ANIMALS,FOODS};
