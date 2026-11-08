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
window.EVNMatdyrData = { R, COMBOS, POOLS, PRICE, INC, plotsFor, plassPris, GARDSNIVA, ANIMALS, FOODS, ARTEMOJI };
})();
