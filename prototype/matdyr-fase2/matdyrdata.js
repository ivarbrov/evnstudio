/* Matdyr-regn fase 2: matdyrdata for prototypen.
   Samme ID-er, sjeldenheter, priser og inntekter som produksjonsspillet (kopiert fra test/matdyr/data.js, som speiler spill/matdyr/index.html).
   Nytt: korte navn (Evens valg B5) og Gårdsnivå-tabellen (claude/matdyr-gardsniva-fase1.md § 3). */
(function () {
'use strict';
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
  COMBOS.forEach(c => { if (c.r >= 5) c.m = 1; });
})();
// ---- Alternativ C bak flagget ?fordeling=c (godkjent som prototype 10.11.2026; B3 gjelder fortsatt produksjonsspillet) ----
// Lik stige per art: 6 Common, 5 Rare, 5 Epic, 4 Legendary, 3 Mythic, 1 Food God, 1 Secret. Vektene er uendret.
// Samme regel som test/matdyr/fordeling-c/stige.js: faste figurer beholder kategorien, resten av arten får stigen i rekkefølge
// etter dagens kategori, multiplikator og mat-indeks. Uten flagget er alt som før.
const FORDELING=(typeof location!=='undefined'&&/[?&]fordeling=c(&|$)/.test(location.search))?'c':'standard';
const GML_R=COMBOS.map(c=>c.r), M0=COMBOS.map(c=>c.m);
const STIGE=[0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,4,4,4,5,6];
const FASTE=[['gris','Smultring',0],['mus','Oste',0],['frosk','Pizza',1],['ape','Banan',1],['ku','Melke',1],['pingvin','Pølse',2],['frosk','Kakao',2],['hai','Taco',3],['blekksprut','Spagetti',4],['hval','Burger',5],['dinosaur','Sjoko',6]];
function byggStige(){
  const fast=new Map(FASTE.map(([a,m,r])=>[ANIMALS.findIndex(x=>x[1]===a)*FOODS.length+FOODS.findIndex(x=>x[1]===m),r])), ny=new Array(COMBOS.length);
  for(let ai=0;ai<ANIMALS.length;ai++){
    const ids=FOODS.map((_,fi)=>ai*FOODS.length+fi), rest=STIGE.slice();
    for(const ci of ids)if(fast.has(ci)){const r=fast.get(ci);rest.splice(rest.indexOf(r),1);ny[ci]=r}
    ids.filter(ci=>!fast.has(ci)).sort((a,b)=>GML_R[a]-GML_R[b]||M0[a]-M0[b]||a-b).forEach((ci,k)=>{ny[ci]=rest[k]});
  }
  return ny;
}
const NY_R=byggStige();
if(FORDELING==='c')COMBOS.forEach((c,i)=>{c.r=NY_R[i];if(c.r>=5)c.m=1});
// Verdi for en bestemt kategori (brukes for eide dyr med arvet kategori, streng bestefarsregel)
const PRICEr=(ci,r)=>Math.round(R[r].price*(r>=5?1:M0[ci]));
const INCr=(ci,r)=>Math.round(R[r].inc*(r>=5?1:M0[ci]));
const POOLS=R.map((_,r)=>COMBOS.map((c,i)=>c.r===r?i:-1).filter(i=>i>=0));
const PRICE=ci=>Math.round(R[COMBOS[ci].r].price*COMBOS[ci].m);
const INC=ci=>Math.round(R[COMBOS[ci].r].inc*COMBOS[ci].m);
const plotsFor=l=>4+2*l, MAX_LEVEL=10, MAX_PLOTS=plotsFor(MAX_LEVEL);
const upCost=l=>Math.round(250*Math.pow(3,l)/50)*50;
// Korte navn: mat + dyr (B5). Bare visningsnavnet endres; ID-ene er de samme.
const KORT_MAT = { Smultring: 'Donut', Oste: 'Ost', Milkshake: 'Shake' };
COMBOS.forEach((c, i) => {
  const ai = Math.floor(i / FOODS.length), fi = i % FOODS.length;
  c.art = ANIMALS[ai][1]; c.mat = FOODS[fi][1];
  c.navn = c.special || ((KORT_MAT[c.mat] || c.mat) + c.art);
});
// Gårdsnivå 1–10: krav [art (null = valgfri art), antall, minste sjeldenhet], pengebeløp og tak (antall plasser)
const GARDSNIVA = [null,
  { tak: 8 },
  { tak: 12, krav: [['ku', 2, 0], ['gris', 1, 0]], penger: 1000 },
  { tak: 16, krav: [['sau', 2, 1], ['skilpadde', 1, 0]], penger: 10000 },
  { tak: 20, krav: [['katt', 1, 2], ['høne', 2, 1]], penger: 60000 },
  { tak: 24, krav: [['rev', 2, 2], ['hest', 1, 1]], penger: 250000 },
  { tak: 28, krav: [['hund', 1, 3], ['panda', 2, 2]], penger: 2e6 },
  { tak: 32, krav: [['papegøye', 2, 3], ['neshorn', 1, 3]], penger: 10e6 },
  { tak: 36, krav: [['frosk', 1, 4], ['pingvin', 2, 3]], penger: 50e6 },
  { tak: 40, krav: [[null, 2, 4], ['hest', 1, 4]], penger: 150e6 },
  { tak: 40, krav: [['hval', 1, 5], [null, 2, 4]], penger: 500e6 }];
// «Flere plasser»: som i dag til 24 plasser, deretter dobling per steg fra 10 mill.
const plassPris = l => l < 10 ? upCost(l) : 1e7 * Math.pow(2, l - 10);
const ARTEMOJI = Object.fromEntries(ANIMALS.map(a => [a[1], a[0]]));
window.EVNMatdyrData = { R, COMBOS, POOLS, PRICE, INC, plotsFor, plassPris, GARDSNIVA, ANIMALS, FOODS, ARTEMOJI, FORDELING, GML_R, NY_R, PRICEr, INCr, STIGE };
})();
