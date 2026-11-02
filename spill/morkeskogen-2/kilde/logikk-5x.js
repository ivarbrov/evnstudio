// Mørkeskogen 2.0 – logikk fra 5.6.2 (ordrett). IKKE rediger blokkene i fase 0: bygg-spill.mjs kontrollerer at de er uendret.
//#blokk 0000 WS,W,H,FX,FY
const WS = 1.6, W = Math.round(7000 * WS), H = W, FX = W / 2, FY = H / 2;
//#slutt
//#blokk 0001 WA
   // stor verden med fem biomer (WS = hvor mye større enn den første 7000 × 7000-verdenen)
const WA = WS * WS * 0.85;
//#slutt
//#blokk 0002 AXES
                                                     // flere trær, steiner, dyr og hytter i den større verdenen
const AXES = [
  { n: 'Vanlig øks', p: 1, c: '#9aa0a6' },
  { n: 'Steinøks',   p: 2, c: '#8d8478' },
  { n: 'Jernøks',    p: 3, c: '#dfe7ea' },
  { n: 'Gulløks',    p: 6, c: '#ffd54a' },
  { n: 'Motorsag',   p: 10, c: '#e8562a', saw: true }      // sager gjennom trær på ett eller to drag
];
//#slutt
//#blokk 0003 ANIMALS

// Dyrene i skogen: liv, fart, hva de gir, og om de angriper
const ANIMALS = {
  hjort:    { hp: 3,  sp: 55, run: 150, meat: 2, skin: 1, hostile: false, body: '#8a5a32', leg: '#5e3c20', size: 1.1 },
  rev:      { hp: 2,  sp: 60, run: 180, meat: 1, skin: 1, hostile: false, body: '#d9732b', leg: '#7a3d14', size: 0.75 },
  villsvin: { hp: 5,  sp: 45, run: 140, meat: 2, skin: 1, hostile: true, aggro: 150, dmg: 20, body: '#5a463a', leg: '#2e231c', size: 0.95 },
  ulv:      { hp: 6,  sp: 55, run: 120, meat: 1, skin: 1, hostile: true, aggro: 220, dmg: 15, body: '#80868c', leg: '#4c5156', size: 1 },
  bjorn:    { hp: 12, sp: 35, run: 85,  meat: 4, skin: 2, hostile: true, aggro: 170, dmg: 30, body: '#4a2f1d', leg: '#2b1a0f', size: 1.5 },
  isbjorn:  { hp: 14, sp: 35, run: 90,  meat: 5, skin: 3, hostile: true, aggro: 180, dmg: 32, body: '#eeeae0', leg: '#d6d0c2', size: 1.6 },
  tiger:    { hp: 8,  sp: 50, run: 135, meat: 2, skin: 2, hostile: true, aggro: 200, dmg: 22, body: '#e08a2c', leg: '#b86a1c', size: 1.15 },
  ape:      { hp: 3,  sp: 50, run: 160, meat: 1, skin: 1, hostile: false, body: '#6b4a2e', leg: '#4a3220', size: 0.8 },
  elg:      { hp: 14, sp: 40, run: 120, meat: 6, skin: 3, hostile: false, body: '#4a3626', leg: '#7a6a58', size: 1.7 },
  rein:     { hp: 5,  sp: 50, run: 150, meat: 3, skin: 2, hostile: false, body: '#8a8478', leg: '#5a544c', size: 1.15 },
  hare:     { hp: 1,  sp: 60, run: 200, meat: 1, skin: 1, hostile: false, body: '#8a6e50', leg: '#6e5640', size: 0.55 },
  snohare:  { hp: 1,  sp: 60, run: 200, meat: 1, skin: 1, hostile: false, body: '#f2f2ee', leg: '#dcdcd6', size: 0.55 },
  gaupe:    { hp: 6,  sp: 50, run: 140, meat: 1, skin: 2, hostile: true, aggro: 160, dmg: 12, body: '#b89a6a', leg: '#9a7e54', size: 0.9 },
  kamel:    { hp: 10, sp: 38, run: 115, meat: 4, skin: 2, hostile: false, body: '#c79b5d', leg: '#a77d45', size: 1.5 },
  orkenrev: { hp: 2,  sp: 60, run: 190, meat: 1, skin: 1, hostile: false, body: '#e2b878', leg: '#b88a4e', size: 0.7 },
  grevling: { hp: 3,  sp: 40, run: 120, meat: 1, skin: 1, hostile: false, body: '#5a5a5e', leg: '#26262a', size: 0.7 },
  villhest: { hp: 9,  sp: 50, run: 190, meat: 4, skin: 2, hostile: false, body: '#7a5234', leg: '#3e2a1a', size: 1.45 },
  moskus:   { hp: 16, sp: 32, run: 95,  meat: 6, skin: 4, hostile: true, aggro: 110, dmg: 26, body: '#3e2e22', leg: '#2a2018', size: 1.45 },
  polarrev: { hp: 2,  sp: 60, run: 185, meat: 1, skin: 2, hostile: false, body: '#f4f4f0', leg: '#e0e0da', size: 0.72 },
  elefant:  { hp: 30, sp: 30, run: 80,  meat: 10, skin: 5, hostile: false, body: '#8e8c8a', leg: '#7a7876', size: 2.4 },
  krokodille: { hp: 12, sp: 28, run: 105, meat: 3, skin: 3, hostile: true, aggro: 140, dmg: 28, body: '#4e6a34', leg: '#3a5226', size: 1.3 },
  panter:   { hp: 9,  sp: 52, run: 145, meat: 2, skin: 2, hostile: true, aggro: 210, dmg: 24, body: '#1e1e22', leg: '#141416', size: 1.1 },
  gasell:   { hp: 3,  sp: 60, run: 210, meat: 2, skin: 1, hostile: false, body: '#c9965a', leg: '#a07040', size: 0.95 }
};
//#slutt
//#blokk 0004 ANIMAL_MIX

const ANIMAL_MIX = ['hjort', 'hjort', 'hjort', 'rev', 'rev', 'villsvin', 'villsvin', 'ulv', 'ulv', 'bjorn'];
//#slutt
//#blokk 0005 ANIMAL_COUNT

const ANIMAL_COUNT = Math.round(92 * WA);
//#slutt
//#blokk 0006 MIXES

const MIXES = { skog: ANIMAL_MIX.concat(['elg', 'elg', 'hare', 'hare', 'hare', 'gaupe', 'grevling', 'grevling', 'villhest', 'villhest']), sno: ['ulv', 'ulv', 'isbjorn', 'rein', 'rein', 'rein', 'snohare', 'snohare', 'moskus', 'polarrev', 'polarrev'], jungel: ['ape', 'ape', 'ape', 'tiger', 'villsvin', 'rev', 'elefant', 'krokodille', 'panter'], orken: ['kamel', 'kamel', 'kamel', 'orkenrev', 'orkenrev', 'gasell', 'gasell'] };
//#slutt
//#blokk 0007 BUILDINGS

// Ting du kan bygge i landsbyen din
const BUILDINGS = {
  hytte:    { n: 'Hytte', art: 'en', icon: '🛖', cost: { wood: 15, stone: 6 }, light: 170, r: 42, desc: 'Lyser opp et trygt område. Du får liv fortere når du er ved hytta.' },
  lykt:     { n: 'Lyktestolpe', art: 'en', icon: '🏮', cost: { wood: 4, stone: 2, iron: 1 }, light: 140, r: 12, desc: 'En jernlykt som lyser hele natten. Monstrene tør ikke komme nær.' },
  verksted: { n: 'Verksted', art: 'et', icon: '🔨', cost: { wood: 10, stone: 4 }, light: 0, r: 38, desc: 'Her lager du sekker av skinn og bedre økser.' },
  seng:     { n: 'Halmseng', art: 'en', icon: '🛏️', cost: { wood: 8, skin: 2 }, light: 0, r: 28, desc: 'Sov gjennom natten (trykk E ved senga når det er mørkt). Senga blir stående neste gang du spiller.' }
};
//#slutt
//#blokk 0008 SACKS

const SACKS = [{ n: 'Ingen sekk', cap: 15 }, { n: 'Skinnsekk', cap: 30, cost: { skin: 3 } }, { n: 'Stor sekk', cap: 50, cost: { skin: 6, wood: 4 } }, { n: 'Eventyrsekk', cap: 80, cost: { skin: 8, iron: 4 } }];
//#slutt
//#blokk 0009 RES

const RES = { wood: '🪵', stone: '🪨', iron: '🔩', skin: '🟫' };
//#slutt
//#blokk 0010 WEAPONS

// ---------- Våpen: én definisjon per våpen. Nye våpen legges til her (og i WEAPON_SLOTS + makeWeapons) ----------
// kind: melee = nærkamp (treff i en bue foran helten), bow = trekkes og skytes, cast = skyter magi. arc i radianer, reach/range i spillenheter.
const WEAPONS = {
  oks:    { n: 'Øks', icon: '🪓', kind: 'melee', anim: 'chop', dmg: 1, cd: 0.5, impact: 0.22, reach: 95, arc: 1.3, max: 1, tool: true, lvl: 1, snd: 'swish',
            how: 'Du har den fra start. Bedre økser finner du i kister eller lager i verkstedet.' },
  sverd:  { n: 'Sverd', icon: '🗡️', kind: 'melee', anim: 'slash', dmg: 2, cd: 0.32, impact: 0.12, reach: 85, arc: 1.9, max: 2, lvl: 1, snd: 'sword',
            how: 'Ligger i skattekisten i et skjelettslott.' },
  spyd:   { n: 'Spyd', icon: '🔱', kind: 'melee', anim: 'thrust', dmg: 3, cd: 0.6, impact: 0.2, reach: 150, arc: 0.6, max: 2, lvl: 2, snd: 'spear',
            how: 'Lag det i verkstedet (krever nivå 2).', cost: { wood: 6, stone: 4, iron: 2 } },
  bue:    { n: 'Pil og bue', icon: '🏹', kind: 'bow', dmg: 3, cd: 0.25, draw: 0.6, speed: 950, range: 700, lvl: 1, snd: 'bow',
            how: 'Belønning for oppdraget «Jegeren».' },
  stav:   { n: 'Magisk stav', icon: '🪄', kind: 'cast', anim: 'cast', dmg: 3, cd: 0.55, impact: 0.16, speed: 620, range: 720, lvl: 3, banish: true, snd: 'magic',
            how: 'Ligger i en kiste ved vulkanen (bruk krever nivå 3).' },
  hammer: { n: 'Flammehammer', icon: '🔨', kind: 'melee', anim: 'smash', dmg: 7, cd: 1.0, impact: 0.38, reach: 105, arc: 6.3, aoe: 95, max: 99, lvl: 5, banish: true, rare: true, snd: 'boom',
            how: 'Sjelden! Ligger i skattekisten foran pyramiden i ørkenen, eller som belønning for «Overlevaren». Bruk krever nivå 5.' }
};
//#slutt
//#blokk 0011 ExpressionStatement

WEAPONS.stang = { n: 'Fiskestang', icon: '🎣', kind: 'rod', dmg: 0, cd: 0.3, lvl: 1, how: 'Lag den i ryggsekken (I): 3 ved og 1 skinn.', cost: { wood: 3, skin: 1 } };
//#slutt
//#blokk 0012 ExpressionStatement

WEAPONS.heksestav = { n: 'Heksas tryllestav', icon: '🧙', kind: 'cast', anim: 'cast', dmg: 4, cd: 0.42, impact: 0.14, speed: 700, range: 680, lvl: 1, banish: true, snd: 'magic', witch: true,
  how: 'Heksa vokter den i spøkelseshuset nordvest for bålet. Snik deg inn og ta den!' };
//#slutt
//#blokk 0013 ExpressionStatement

WEAPONS.lasso = { n: 'Cowboy-lasso', icon: '🪢', kind: 'lasso', anim: 'cast', dmg: 0, cd: 0.9, impact: 0.25, range: 380, lvl: 1, snd: 'swish',
  how: 'Lasso-Lars bak husene i Kaktusbyen lager den til deg hvis du finner fem deler – én i hver verden.' };
//#slutt
//#blokk 0014 ExpressionStatement

WEAPONS.beinbue = { n: 'Skjelettbue', icon: '💀', kind: 'bow', dmg: 6, cd: 0.22, draw: 0.45, speed: 1150, range: 850, lvl: 1, snd: 'bow',
  how: 'Belønning når du har beseiret alle fiendene i Beinslottet i Dinoverdenen.' };
//#slutt
//#blokk 0015 WEAPON_SLOTS

const WEAPON_SLOTS = ['oks', 'sverd', 'spyd', 'bue', 'stav', 'hammer', 'stang', 'heksestav', 'lasso', 'beinbue'];
//#slutt
//#blokk 0016 slotKey
        // hurtiglinja: tast 1–9 og 0
const slotKey = id => (WEAPON_SLOTS.indexOf(id) + 1) % 10;
//#slutt
//#blokk 0017 WUP_MAX,wupCost

const WUP_MAX = 3, wupCost = L => ({ iron: 2 + L * 2, stone: 2 * L });
//#slutt
//#blokk 0018 SAVE_KEY,HERO_NEW
           // oppgradering fra nivå L til L + 1
// Heltprofil: våpen, valgt våpen, oppgraderinger, XP og oppdrag. Lagres i nettleseren og følger helten fra spill til spill.
const SAVE_KEY = 'mork3d.helt', HERO_NEW = () => ({ v: 1, owned: ['oks'], sel: 'oks', wlvl: {}, xp: 0, qdone: [], qprog: {} });
//#slutt
//#blokk 0019 hero

let hero = (() => { try { const h = JSON.parse(localStorage.getItem(SAVE_KEY)); if (h && h.v === 1 && Array.isArray(h.owned)) return Object.assign(HERO_NEW(), h); } catch (e) {} return HERO_NEW(); })();
//#slutt
//#blokk 0020 ExpressionStatement

hero.owned = hero.owned.filter(id => WEAPONS[id]);
//#slutt
//#blokk 0021 IfStatement
 if (!hero.owned.includes('oks')) hero.owned.unshift('oks');
//#slutt
//#blokk 0022 saveHero

function saveHero() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(hero)); } catch (e) {} }
//#slutt
//#blokk 0023 LEVEL_MAX,xpNeed

// Nivå: 100 XP til nivå 2, deretter 50 mer for hvert nivå. Maks nivå 10.
const LEVEL_MAX = 10, xpNeed = L => 100 + 50 * (L - 1);
//#slutt
//#blokk 0024 heroLevel

function heroLevel() { let L = 1, x = hero.xp; while (L < LEVEL_MAX && x >= xpNeed(L)) { x -= xpNeed(L); L++; } return { L, x, need: L < LEVEL_MAX ? xpNeed(L) : 0 }; }
//#slutt
//#blokk 0025 canUse

const canUse = id => hero.owned.includes(id) && heroLevel().L >= WEAPONS[id].lvl;
//#slutt
//#blokk 0026 IfStatement

if (!canUse(hero.sel)) hero.sel = 'oks';
//#slutt
//#blokk 0027 curW

const curW = () => hero.sel;
//#slutt
//#blokk 0028 wLvl

const wLvl = id => hero.wlvl[id] || 1;
//#slutt
//#blokk 0029 weaponDmg

const weaponDmg = id => id === 'oks' ? AXES[g.axe].p : (WEAPONS[id].dmg || 0) * (1 + 0.35 * (wLvl(id) - 1));
//#slutt
//#blokk 0030 hotbarKey

let hotbarKey = '';
//#slutt
//#blokk 0031 XP_BASE

// XP for fiender: samme type samme dag gir 100 %, 75 %, 50 %, 25 % og så ingenting. Fredelige dyr gir ingen XP.
const XP_BASE = { shark: 50, dskel: 10, dtri: 70, dboss: 500, moskus: 30, krokodille: 26, panter: 24, trex: 150, villsvin: 12, ulv: 15, gaupe: 14, tiger: 22, bjorn: 30, isbjorn: 32, villain: 20, troll: 45, goat: 90, monster: 6 };
//#slutt
//#blokk 0032 addXP

function addXP(n, x, y) {
  n = Math.round(n); if (n <= 0) return 0;
  const before = heroLevel().L; hero.xp += n; saveHero();
  if (x !== undefined) floatText(x, y - 50, `+${n} XP ⭐`);
  const after = heroLevel().L;
  if (after > before) {
    const un = WEAPON_SLOTS.filter(id => WEAPONS[id].lvl === after && hero.owned.includes(id)).map(id => WEAPONS[id].icon + ' ' + WEAPONS[id].n);
    toast(`⭐ Du nådde nivå ${after}!` + (un.length ? ` Nå kan du bruke ${un.join(' og ')}.` : '')); sfx('levelup');
  }
  return after > before ? after : 0;
}
//#slutt
//#blokk 0033 enemyXP

function enemyXP(type, x, y) {
  const base = XP_BASE[type]; if (!base) return;
  if (g.xpDay !== g.nights) { g.xpDay = g.nights; g.xpKills = {}; }
  const n = g.xpKills[type] = (g.xpKills[type] || 0) + 1, mult = Math.max(0, 1 - (n - 1) * 0.25);
  const gap = Math.max(0, heroLevel().L - (XP_LVL[type] || 1) - 3);           // mye svakere fiender enn deg gir mindre
  addXP(base * mult * Math.pow(0.6, gap), x, y);
}
//#slutt
//#blokk 0034 XP_LVL

const XP_LVL = { shark: 5, dskel: 3, dtri: 7, dboss: 10, moskus: 4, krokodille: 3, panter: 3, trex: 7, villsvin: 1, ulv: 2, gaupe: 2, tiger: 3, bjorn: 4, isbjorn: 4, villain: 3, troll: 5, goat: 6, monster: 2 };
//#slutt
//#blokk 0035 QUESTS

// Oppdrag: fremdriften følger helten. Belønningen er XP og noen ganger et våpen.
const QUESTS = [
  { id: 'natt1', n: 'Første natt', d: 'Overlev én natt.', goal: 1, xp: 40 },
  { id: 'jeger', n: 'Jegeren', d: 'Samle 3 skinn.', goal: 3, xp: 50, reward: 'bue' },
  { id: 'skjelett', n: 'Skjelettknuser', d: 'Knus 5 skjeletter.', goal: 5, xp: 80 },
  { id: 'troll', n: 'Trolltemmer', d: 'Send et troll i bekken.', goal: 1, xp: 60 },
  { id: 'vulkan', n: 'Vulkanens hemmelighet', d: 'Åpne en kiste ved vulkanen.', goal: 1, xp: 50 },
  { id: 'fisker', n: 'Fiskeren', d: 'Fang 3 fisk.', goal: 3, xp: 60 },
  { id: 'seng', n: 'Halmsenga', d: 'Lag din første halmseng (bygg-menyen, B).', goal: 1, xp: 40 },
  { id: 'sovet', n: 'God natt!', d: 'Sov gjennom en natt i halmsenga.', goal: 1, xp: 40 },
  { id: 'stasjon', n: 'Togstasjonen', d: 'Finn Mørkeskogen stasjon sørøst for bålet.', goal: 1, xp: 30 },
  { id: 'cowboy', n: 'Ville vesten', d: 'Ta toget til Kaktusbyen.', goal: 1, xp: 50 },
  { id: 'sheriff', n: 'Hjelp sheriffen', d: 'Snakk med sheriffen i Kaktusbyen og fang de tre skurkene.', goal: 3, xp: 120 },
  { id: 'lasso', n: 'Lasso-Lars', d: 'Finn de 5 lassodelene (én i hver verden) og ta dem med til Lasso-Lars bak husene i Kaktusbyen.', goal: 5, xp: 150 },
  { id: 'haidammen', n: 'Haidammen', d: 'Finn den store dammen med haien i jungelen.', goal: 1, xp: 40 },
  { id: 'dinoverden', n: 'Dinoverdenen', d: 'Finn Dinoverdenen øst i jungelen (følg stien fra bålet).', goal: 1, xp: 40 },
  { id: 'dinoslott', n: 'Beinslottet', d: 'Beseir Skjelett-T-rex-kongen øverst i Beinslottet.', goal: 1, xp: 300 },
  { id: 'heksa', n: 'Heksas tryllestav', d: 'Ta tryllestaven fra heksa i spøkelseshuset.', goal: 1, xp: 80 },
  { id: 'overlevaren', n: 'Overlevaren', d: 'Overlev 5 netter (til sammen).', goal: 5, xp: 150, reward: 'hammer' }
];
//#slutt
//#blokk 0036 questAdd

function questAdd(id, n = 1) {
  if (hero.qdone.includes(id)) return;
  const q = QUESTS.find(o => o.id === id); if (!q) return;
  hero.qprog[id] = Math.min(q.goal, (hero.qprog[id] || 0) + n);
  if (hero.qprog[id] >= q.goal) {
    hero.qdone.push(id);
    const W = q.reward && WEAPONS[q.reward], got = W && giveWeapon(q.reward, true);
    const lv = addXP(q.xp, g.p.x, g.p.y);
    toast(`📜 Oppdrag fullført: ${q.n}!` + (got ? ` Du fikk ${W.icon} ${W.n}! (tast ${WEAPON_SLOTS.indexOf(q.reward) + 1})` : '') + (lv ? ` ⭐ Nivå ${lv}!` : ''));
    sfx('levelup');
  }
  saveHero();
}
//#slutt
//#blokk 0037 giveWeapon

function giveWeapon(id, silent) {
  if (hero.owned.includes(id)) return false;
  hero.owned.push(id); saveHero();
  const W = WEAPONS[id];
  if (!silent) { toast(`Du fikk ${W.icon} ${W.n}! Trykk ${slotKey(id)} for å bruke ${heroLevel().L < W.lvl ? `(fra nivå ${W.lvl})` : 'det'}.`); sfx('levelup'); }
  return true;
}
//#slutt
//#blokk 0038 selectWeapon

function selectWeapon(id) {
  const W = WEAPONS[id]; if (!W || !g) return;
  if (!hero.owned.includes(id)) { toast(`${W.icon} ${W.n}: ikke funnet ennå. ${W.how}`); return; }
  if (heroLevel().L < W.lvl) { toast(`${W.icon} ${W.n} krever nivå ${W.lvl}. Du er nivå ${heroLevel().L}.`); return; }
  if (hero.sel === id) return;
  hero.sel = id; const p = g.p; p.draw = 0; p.swing = 0; p.impact = null; p.cool = Math.max(p.cool, 0.15);
  saveHero(); sfx('select');
}
//#slutt
//#blokk 0039 wheelT,wheelAcc

let wheelT = 0, wheelAcc = 0;
//#slutt
//#blokk 0040 cycleWeapon

function cycleWeapon(dir) {
  const list = WEAPON_SLOTS.filter(canUse); if (list.length < 2) return;
  const i = list.indexOf(curW()); selectWeapon(list[(i + dir + list.length) % list.length]);
}
//#slutt
//#blokk 0041 FISH

// ---------- Fisking ----------
// Fiskearter: hvor de lever (elv/innsjø, og eventuelt bare i ett biom), hvor vanlige de er, og hvor store de kan bli.
const FISH = {
  orret:  { n: 'Ørret',  icon: '🐟', water: 'elv',    w: 6,  cm: [22, 48],  xp: 8 },
  laks:   { n: 'Laks',   icon: '🐟', water: 'elv',    w: 2,  cm: [45, 92],  xp: 18, notBiome: 'jungel' },
  roye:   { n: 'Røye',   icon: '🐟', water: 'elv',    w: 5,  cm: [20, 46],  xp: 12, biome: 'sno' },
  piraja: { n: 'Piraja', icon: '🐠', water: 'elv',    w: 4,  cm: [14, 30],  xp: 14, biome: 'jungel' },
  abbor:  { n: 'Abbor',  icon: '🐠', water: 'innsjø', w: 7,  cm: [12, 36],  xp: 8 },
  gjedde: { n: 'Gjedde', icon: '🐊', water: 'innsjø', w: 2,  cm: [45, 105], xp: 20 },
  tropefisk: { n: 'Tropefisk', icon: '🐠', water: 'dam', w: 6, cm: [10, 28], xp: 10 },
  karpe:  { n: 'Kjempekarpe', icon: '🐟', water: 'dam', w: 3, cm: [40, 95], xp: 22 }
};
//#slutt
//#blokk 0042 fishKg

const fishKg = cm => Math.round(0.0105 * Math.pow(cm / 10, 3) * 100) / 100;
//#slutt
//#blokk 0043 fishCap
              // omtrent som ekte fisk av samme lengde
const fishCap = () => [2, 6, 12, 20][g.packDown ? 0 : g.sack];
//#slutt
//#blokk 0044 fishWaterAt
                             // lommene har plass til 2 fisk
function fishWaterAt(x, y) {
  if (dist(x, y, LAKE_X, LAKE_Y) < LAKE_R - 12) return 'innsjø';
  if (pondOn && dist(x, y, POND_X, POND_Y) < POND_R - 12) return 'dam';
  if (riverDist(x, y) < 20 && biomeW(x, y).lava < 0.4 && !onBridge(x, y)) return 'elv';
  return null;
}
//#slutt
//#blokk 0045 pickFish

function pickFish(water, b) {
  const list = Object.entries(FISH).filter(([, f]) => f.water === water && (!f.biome || f.biome === b) && f.notBiome !== b);
  let r = Math.random() * list.reduce((s, [, f]) => s + f.w, 0);
  for (const [id, f] of list) { r -= f.w; if (r <= 0) return id; }
  return list[0][0];
}
//#slutt
//#blokk 0046 castRod

function castRod() {
  const p = g.p, a = aimAngle({ kind: 'rod', range: 200 }, null);
  for (let d = 40; d <= 200; d += 6) {
    const x = p.x + Math.sin(a) * d, y = p.y + Math.cos(a) * d, w = fishWaterAt(x, y);
    if (w) {
      const d2 = Math.min(210, d + 18), tx = p.x + Math.sin(a) * d2, ty = p.y + Math.cos(a) * d2;
      p.fish = { st: 'cast', k: 0, x: fishWaterAt(tx, ty) ? tx : x, y: fishWaterAt(tx, ty) ? ty : y, water: w, b: biomeAt(x, y), t: 0 };
      p.aim = a; p.castT = 0.55; sfx('swish'); return;
    }
  }
  if (!(p.hintT > 0)) { toast('Gå nærmere vannet og kast mot det 🎣'); p.hintT = 2; }
}
//#slutt
//#blokk 0047 endFish

function endFish(msg) { const p = g.p; p.fish = null; p.castT = 0; if (msg) toast(msg); }
//#slutt
//#blokk 0048 landFish

function landFish() {
  const p = g.p, F = p.fish, f = FISH[F.fish], cm = Math.round(f.cm[0] + (f.cm[1] - f.cm[0]) * Math.pow(Math.random(), 1.7)), kg = fishKg(cm);
  F.st = 'land'; F.t = 1.7; F.cm = cm; F.kg = kg;
  const book = hero.fishBook || (hero.fishBook = {}), isNew = !book[F.fish], record = !isNew && cm > book[F.fish];
  book[F.fish] = Math.max(book[F.fish] || 0, cm);
  let where;
  if (g.fish.length < fishCap()) { g.fish.push({ t: F.fish, cm, kg }); where = g.sack > 0 && !g.packDown ? 'Lagt i ryggsekken 🎒' : 'Lagt i lomma'; questAdd('fisker'); }
  else where = g.sack > 0 && !g.packDown ? 'Ryggsekken er full! Fisken svømte tilbake.' : 'Lommene er fulle! Lag en ryggsekk 🎒 – fisken svømte tilbake.';
  addXP(f.xp + (isNew ? 15 : 0), p.x, p.y); saveHero(); sfx('levelup');
  showFishCard(`${f.icon} ${f.n}`, `${cm} cm · ${String(kg).replace('.', ',')} kg${isNew ? ' · ⭐ Ny art!' : record ? ' · 🏆 Ny rekord!' : ''}`, where);
}
//#slutt
//#blokk 0049 showFishCard

function showFishCard(title, sub, note) { const c = $('fishCard'); c.innerHTML = `<b>${title}</b><span>${sub}</span><small>${note}</small>`; c.hidden = false; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); clearTimeout(showFishCard.t); showFishCard.t = setTimeout(() => c.hidden = true, 3200); }
//#slutt
//#blokk 0050 updateFishing

function updateFishing(dt) {
  const p = g.p, hold = !!(keys.attack || MOUSE.down || (keys.act && !useTargetNoWater())), press = hold && !p.rodPrev; p.rodPrev = hold;
  p.castT = Math.max(0, (p.castT || 0) - dt);
  if (curW() !== 'stang') { if (p.fish) endFish(); return; }
  const F = p.fish;
  if (!F) { if (press && p.z <= 0 && p.cool <= 0) castRod(); return; }
  if ((p.spd > 45 || p.z > 0) && F.st !== 'land') { endFish('Du gikk fra fiskeplassen 🎣'); return; }
  F.t -= dt;
  if (F.st === 'cast') { F.k += dt / 0.55; if (F.k >= 1) { F.st = 'wait'; F.t = rand(2.5, 6); F.splash = 0.5; sfx('thunk'); } }
  else if (F.st === 'wait') { if (press) { endFish(); toast('Du sveivet inn snøret.'); p.cool = 0.3; } else if (F.t <= 0) { F.st = 'bite'; F.t = 1.4; F.fish = pickFish(F.water, F.b); F.splash = 0.5; sfx('splash'); floatText(F.x, F.y - 30, 'NAPP! Trykk nå! ❗'); } }
  else if (F.st === 'bite') {
    if (press) { F.st = 'reel'; F.prog = 0; F.ten = 0; F.fight = 0; F.ft = rand(.5, 1.2); sfx('hook'); }
    else if (F.t <= 0) { F.st = 'wait'; F.t = rand(2, 4.5); toast('Fisken slapp agnet – vent på neste napp 🐟'); }
  } else if (F.st === 'reel') {
    const f = FISH[F.fish], str = 0.6 + (f.cm[1] / 110);                                  // store fisk drar hardere
    F.ft -= dt; if (F.ft <= 0) { F.fight = F.fight ? 0 : 1; F.ft = F.fight ? rand(.5, 1.0) * str : rand(.9, 1.7); if (F.fight) F.splash = 0.4; }
    if (hold) { F.prog += dt * (F.fight ? 0.06 : 0.34) / str; F.ten += dt * (F.fight ? 0.85 : 0.08); }
    else { F.ten -= dt * 0.9; F.prog -= dt * (F.fight ? 0.05 : 0); }
    F.ten = clamp(F.ten, 0, 1); F.prog = clamp(F.prog, 0, 1);
    if (F.ten >= 1) { F.prog = Math.max(0, F.prog - 0.2); F.ten = 0.35; toast('For hardt! Slipp når fisken drar 💦'); sfx('thunk'); }
    if (F.prog >= 1) landFish();
  } else if (F.st === 'land' && F.t <= 0) { p.fish = null; p.cool = 0.3; }
}
//#slutt
//#blokk 0051 THIRST

const THIRST = false;
//#slutt
//#blokk 0052 useTargetNoWater
                                    // av: du blir ikke tørst lenger
const useTargetNoWater = () => { const u = useTarget(); return u && !(u.k === 'water' && curW() === 'stang') ? u : null; };
//#slutt
//#blokk 0053 axeCost

const axeCost = lvl => lvl >= 4 ? { wood: 10, stone: 15, iron: 15 } : lvl >= 2 ? { wood: lvl * 5, stone: lvl * 5, iron: (lvl - 1) * 3 } : { wood: lvl * 5, stone: lvl * 5 };
//#slutt
//#blokk 0054 RIVER_Y,RIVER

// Bekken som renner gjennom skogen
const RIVER_Y = FY - 900 * WS, RIVER = [];
//#slutt
//#blokk 0055 ForStatement

for (let x = -80; x <= W + 80; x += 40) RIVER.push([x, RIVER_Y + Math.sin(x / 260) * 90 + Math.sin(x / 97) * 25]);
//#slutt
//#blokk 0056 LAKE_X,LAKE_Y,LAKE_R

// Innsjøen i skogen sørvest for bålet (abbor og gjedde)
const LAKE_X = FX - 950 * WS, LAKE_Y = FY + 700 * WS, LAKE_R = 230;
//#slutt
//#blokk 0057 lakeDist

const lakeDist = (x, y) => Math.max(0, Math.hypot(x - LAKE_X, y - LAKE_Y) - LAKE_R);
//#slutt
//#blokk 0058 POND_X,POND_Y,POND_R,POND_W,POND_DEEP

// ================== Haidammen i jungelen (v4.9) ==================
// En stor dam i jungelen. Det er dypt i midten, og der svømmer en hai! Ryggfinnen stikker opp av vannet, og av og til hopper den.
// Går du ut i vannet, kommer haien. Fra brygga kan du trygt se på den (og fiske).
const POND_X = FX + Math.cos(0.45) * 3300, POND_Y = FY + Math.sin(0.45) * 3300, POND_R = 420, POND_W = 1, POND_DEEP = 60;
//#slutt
//#blokk 0059 pondOn

let pondOn = true;
//#slutt
//#blokk 0060 pondDist
                                      // av mens verden lages (så trærne blir de samme som før), på ellers
const pondDist = (x, y) => pondOn ? Math.max(0, Math.hypot(x - POND_X, y - POND_Y) - POND_R) : 1e9;
//#slutt
//#blokk 0061 pondBowl

const pondBowl = (x, y) => { if (!pondOn) return 0; const d = Math.hypot(x - POND_X, y - POND_Y); return d < POND_R ? POND_DEEP * (1 - sstep(POND_R * 0.45, POND_R - 8, d)) : 0; };
//#slutt
//#blokk 0062 PIER_U,PIER_A,PIER_B,PIER_HW

// Brygga går ut i vannet fra den siden som vender mot bålet
const PIER_U = (() => { const dx = FX - POND_X, dy = FY - POND_Y, l = Math.hypot(dx, dy); return [dx / l, dy / l]; })(), PIER_A = POND_R - 190, PIER_B = POND_R + 30, PIER_HW = 24;
//#slutt
//#blokk 0063 pierH

function pierH(x, y) {
  const dx = x - POND_X, dy = y - POND_Y, along = dx * PIER_U[0] + dy * PIER_U[1], side = dx * PIER_U[1] - dy * PIER_U[0];
  return along > PIER_A && along < PIER_B && Math.abs(side) < PIER_HW ? POND_W + 9 : -1e9;
}
//#slutt
//#blokk 0064 pondSwimH

// I det dype vannet svømmer du (med hodet over vannet)
const pondSwimH = (x, y) => pondOn && Math.abs(x - POND_X) < POND_R && Math.abs(y - POND_Y) < POND_R && pondDist(x, y) === 0 ? POND_W - 30 : -1e9;
//#slutt
//#blokk 0065 pondSurf

const pondSurf = (x, y) => Math.abs(x - POND_X) < POND_R + 60 && Math.abs(y - POND_Y) < POND_R + 60 ? Math.max(pierH(x, y), pondSwimH(x, y)) : -1e9;
//#slutt
//#blokk 0066 inPondWater

const inPondWater = (x, y) => pondDist(x, y) === 0 && pierH(x, y) < -1e8;
//#slutt
//#blokk 0067 pondPush

// Dyr går ikke ut i dammen
function pondPush(o, rad = 10) {
  const dx = o.x - POND_X, dy = o.y - POND_Y, d = Math.hypot(dx, dy), R0 = POND_R + rad;
  if (d < R0 && d > 0.01) { o.x = POND_X + dx / d * R0; o.y = POND_Y + dy / d * R0; }
}
//#slutt
//#blokk 0068 pondSetup

function pondSetup() {                                   // kjøres i newGame: rydder dammen og bredden
  const off = (o, r) => Math.hypot(o.x - POND_X, o.y - POND_Y) > POND_R + r;
  const pierClear = o => { const dx = o.x - POND_X, dy = o.y - POND_Y, along = dx * PIER_U[0] + dy * PIER_U[1], side = dx * PIER_U[1] - dy * PIER_U[0]; return !(along > PIER_A && along < PIER_B + 120 && Math.abs(side) < 70); };
  g.trees = g.trees.filter(t => off(t, 50) && pierClear(t)); g.rocks = g.rocks.filter(r => off(r, 20)); g.bushes = g.bushes.filter(b => off(b, 25)); g.tufts = g.tufts.filter(t => off(t, 10));
  g.chests = g.chests.filter(c => off(c, 60)); g.cabins = g.cabins.filter(c => off(c, 200));
  const keep = g.bases.map(B => off(B, 700));
  if (keep.includes(false)) { const map = []; let n = 0; keep.forEach((k, i) => { map[i] = k ? n++ : -1; }); g.bases = g.bases.filter((B, i) => keep[i]); g.villains = g.villains.filter(v => keep[v.base]); g.villains.forEach(v => { v.base = map[v.base]; }); }
  g.shark = { x: POND_X + 150, y: POND_Y, a: 0, ang: 0, st: 'swim', t: 0, jumpT: 6, hp: 40, max: 40, hit: 0, hitP: false, gone: 0, wob: 0, found: false };
}
//#slutt
//#blokk 0069 updatePond

function updatePond(dt) {
  const p = g.p, S = g.shark; if (!S) return;
  if (!S.found && Math.hypot(p.x - POND_X, p.y - POND_Y) < POND_R + 380) { S.found = true; questAdd('haidammen'); toast('🦈 Du fant Haidammen! Ser du ryggfinnen? Det er en HAI der ute. Gå ut på brygga for å se den trygt!'); sfx('sparkle'); }
  if (Math.hypot(p.x - POND_X, p.y - POND_Y) > POND_R + 1600) return;
  S.hit = Math.max(0, S.hit - dt); S.t -= dt;
  if (S.st === 'gone') { if ((S.gone -= dt) <= 0) { Object.assign(S, { st: 'swim', hp: S.max, x: POND_X, y: POND_Y }); } return; }
  const inW = inPondWater(p.x, p.y) && p.z < 20 && !g.ride, dp = dist(S.x, S.y, p.x, p.y);
  let tx, ty, sp;
  if (S.st === 'jump') {                                                 // hopper ut av vannet i en bue
    sp = 150; tx = S.x + Math.sin(S.ang) * 100; ty = S.y + Math.cos(S.ang) * 100;
    if (S.t <= 0) { S.st = 'swim'; S.jumpT = rand(9, 15); for (let i = 0; i < 16; i++) g.parts.push({ x: S.x + rand(-20, 20), y: S.y, vx: rand(-80, 80), vy: rand(-160, -60), t: 0.7, c: '#dff3fb' }); sfx('fall'); }
  } else if (S.st === 'bite') { sp = 0; tx = S.x; ty = S.y; if (S.t <= 0) { S.st = 'full'; S.t = 1.8; } }
  else if (inW && dp < 520 && S.st !== 'full') {                        // du er i vannet: haien kommer!
    if (S.st !== 'chase') { S.st = 'chase'; floatText(S.x, S.y - 60, '🦈 !!!'); }
    tx = p.x; ty = p.y; sp = 150;
    if (dp < 46) {
      S.st = 'bite'; S.t = 0.45;
      const kx = p.x - POND_X, ky = p.y - POND_Y, kl = Math.hypot(kx, ky) || 1;            // dyttes inn mot land
      g.hp -= 18; p.hurt = 1; g.cause = 'shark'; g.flash = 0.4; g.shake = 0.3; p.vx = kx / kl * 330; p.vy = ky / kl * 330;
      for (let i = 0; i < 14; i++) g.parts.push({ x: p.x + rand(-15, 15), y: p.y, vx: rand(-90, 90), vy: rand(-170, -60), t: 0.6, c: '#dff3fb' });
      floatText(p.x, p.y - 90, 'CHOMP! Kom deg opp av vannet! 🦈'); sfx('animal');
    }
  } else {                                                               // svømmer rundt i det dype vannet
    if (S.st === 'full' && S.t <= 0) S.st = 'swim'; if (S.st === 'chase') S.st = 'swim';
    S.a += dt * 0.32; S.wob += dt;
    const r = POND_R * (0.42 + 0.12 * Math.sin(S.wob * 0.37));
    tx = POND_X + Math.cos(S.a) * r; ty = POND_Y + Math.sin(S.a) * r; sp = 95;
    if ((S.jumpT -= dt) <= 0 && S.st === 'swim') { S.st = 'jump'; S.t = 1.3; for (let i = 0; i < 16; i++) g.parts.push({ x: S.x + rand(-20, 20), y: S.y, vx: rand(-80, 80), vy: rand(-170, -70), t: 0.7, c: '#dff3fb' }); if (dist(p.x, p.y, S.x, S.y) < 900) { floatText(S.x, S.y - 120, 'Splæsj! 🦈'); sfx('fall'); } }
  }
  const dx = tx - S.x, dy = ty - S.y, l = Math.hypot(dx, dy);
  if (l > 2 && sp > 0) { const mv = Math.min(l, sp * dt); S.x += dx / l * mv; S.y += dy / l * mv; S.ang = turn(S.ang, Math.atan2(dx, dy), Math.min(1, dt * 4)); }
  { const ox = S.x - POND_X, oy = S.y - POND_Y, d = Math.hypot(ox, oy), R0 = POND_R - 70; if (d > R0) { S.x = POND_X + ox / d * R0; S.y = POND_Y + oy / d * R0; } }   // holder seg i det dype vannet
}
//#slutt
//#blokk 0070 sharkDamage

function sharkDamage(S, dmg, src) {
  if (S.st === 'gone') return;
  S.hp -= dmg; S.hit = 0.25; for (let i = 0; i < 6; i++) g.parts.push({ x: S.x + rand(-10, 10), y: S.y, vx: rand(-60, 60), vy: rand(-120, -40), t: 0.5, c: '#dff3fb' });
  if (S.hp <= 0) {
    S.st = "gone"; S.gone = 150; g.raw += 4; enemyXP('shark', S.x, S.y);
    floatText(S.x, S.y - 80, '+4 🥩'); toast('🦈 Haien ga seg og dukket ned i dypet! Den kommer tilbake om en stund …'); sfx('fall');
  }
}
//#slutt
//#blokk 0074 waterDist

const waterDist = (x, y) => Math.min(riverDist(x, y), lakeDist(x, y), pondDist(x, y));
//#slutt
//#blokk 0075 BIOMES
   // avstand til nærmeste vann (elv eller innsjø)
// ---------- Biomer: skogen i midten, snø i nord, jungel i øst, lava i vest ----------
const BIOMES = { skog: { n: 'Skogen', icon: '🌲' }, sno: { n: 'Snøverdenen', icon: '❄️' }, jungel: { n: 'Jungelen', icon: '🌴' }, lava: { n: 'Lavaverdenen', icon: '🌋' }, orken: { n: 'Ørkenen', icon: '🏜️' } };
//#slutt
//#blokk 0076 SECT

const SECT = [-Math.PI / 2, Math.PI / 6, Math.PI * 5 / 6];
//#slutt
//#blokk 0077 biomeW
   // retning til snø, jungel og lava
function biomeW(x, y) {
  const d = Math.hypot(x - FX, y - FY), r = Math.max(0, Math.min(1, (d - 1750 * WS) / (350 * WS))), a = Math.atan2(y - FY, x - FX);
  const w = SECT.map(c => Math.max(0, Math.min(1, (Math.cos(a - c) - 0.5) / 0.3 + 0.5)));
  const sum = (w[0] + w[1] + w[2]) || 1;
  const wd = Math.max(0, Math.min(1, (Math.cos(a - Math.PI / 2) - 0.8) / 0.12 + 0.5)), o = 1 - wd;   // ørkenen i sør, mellom jungelen og lavaen
  return { skog: 1 - r, sno: r * w[0] / sum * o, jungel: r * w[1] / sum * o, lava: r * w[2] / sum * o, orken: r * wd };
}
//#slutt
//#blokk 0078 biomeAt

function biomeAt(x, y) { const w = biomeW(x, y); let b = 'skog'; for (const k in w) if (w[k] > w[b]) b = k; return b; }
//#slutt
//#blokk 0079 PYX,PYY,PYR

// ---------- Vulkanen midt i lavaverdenen ----------
// Pyramiden midt i ørkenen og T-rexens hjem midt i jungelen
const PYX = FX, PYY = FY + 2650 * WS, PYR = 150;
//#slutt
//#blokk 0080 TRX,TRY

const TRX = FX + Math.cos(Math.PI / 6) * 2650 * WS, TRY = FY + Math.sin(Math.PI / 6) * 2650 * WS;
//#slutt
//#blokk 0081 pyrPush

function pyrPush(o) {                                    // du kan ikke gå gjennom pyramiden
  const lx = o.x - PYX, ly = o.y - PYY, px = PYR - Math.abs(lx), py = PYR - Math.abs(ly);
  if (px > 0 && py > 0) { if (px < py) o.x = PYX + Math.sign(lx || 1) * PYR; else o.y = PYY + Math.sign(ly || 1) * PYR; }
}
//#slutt
//#blokk 0082 VX,VY,VR,VTOP

const VX = FX + Math.cos(Math.PI * 5 / 6) * 2700 * WS, VY = FY + Math.sin(Math.PI * 5 / 6) * 2700 * WS, VR = 470, VTOP = 420;
//#slutt
//#blokk 0083 VRIM

const VRIM = VTOP * Math.pow(1 - 95 / VR, 1.5);
//#slutt
//#blokk 0084 volcanoH

function volcanoH(x, z) {
  const d = Math.hypot(x - VX, z - VY); if (d >= VR) return 0;
  if (d < 95) return VRIM - Math.min(95 - d, 45) * 1.8;                                   // krateret
  return VTOP * Math.pow(1 - d / VR, 1.5) * (1 + 0.05 * Math.sin(Math.atan2(z - VY, x - VX) * 7));
}
//#slutt
//#blokk 0085 inLava

function inLava(x, y) {
  if (!g) return false;
  return g.lavaPools.some(l => dist(x, y, l.x, l.y) < l.r - 4) || (riverDist(x, y) < 26 && biomeW(x, y).lava > 0.5) || Math.hypot(x - VX, y - VY) < 54;
}
//#slutt
//#blokk 0086 riverDist

function riverDist(x, y) {
  if (Math.abs(y - RIVER_Y) > 260) return 1e9;
  let best = 1e9;
  for (let i = 0; i < RIVER.length - 1; i++) {
    const [ax, ay] = RIVER[i], [bx, by] = RIVER[i + 1], dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (d < best) best = d;
  }
  return best;
}
//#slutt
//#blokk 0087 DAY,DUSK,NIGHT,DAWN,CYCLE

// Døgnet (sekunder): dag, skumring, natt, soloppgang
const DAY = 130, DUSK = 12, NIGHT = 45, DAWN = 8, CYCLE = DAY + DUSK + NIGHT + DAWN;
//#slutt
//#blokk 0088 PLAYER_SPEED

const PLAYER_SPEED = 170;
//#slutt
//#blokk 0089 LEG_L

// ---------- Gangart (v4.5): gå og løp blandes etter faktisk fart ----------
// Skrittlengden øker med farten. Hoftevinkelen regnes ut fra skrittlengden og beinlengden, så foten står stille mot bakken
// mens kroppen går over den (ingen «skøyting»). Løpefaktoren r blander inn løpestil: mer knebøy, armpumping og foroverlent kropp.
const LEG_L = 33;
//#slutt
//#blokk 0090 gaitRun

const gaitRun = spd => Math.max(0, Math.min(1, (spd - 85) / 75));
//#slutt
//#blokk 0091 gaitStride

const gaitStride = spd => 24 + 30 * Math.max(0, Math.min(1, (spd - 30) / 140));
//#slutt
//#blokk 0092 JUMP_V,GRAVITY,COYOTE,JUMP_BUFFER

// Hopp som i Roblox: rask og tydelig. Høyde ≈ JUMP_V² / (2·GRAVITY) ≈ 59, tid i lufta ≈ 0,56 s.
const JUMP_V = 420, GRAVITY = 1500, COYOTE = 0.1, JUMP_BUFFER = 0.12;
//#slutt
//#blokk 0093 cv


const cv = document.getElementById('game');
//#slutt
//#blokk 0094 ov,octx

const ov = document.getElementById('ov'), octx = ov.getContext('2d');
//#slutt
//#blokk 0095 $

const $ = id => document.getElementById(id);
//#slutt
//#blokk 0096 VW,VH,DPR,R3

let VW = 0, VH = 0, DPR = 1, R3 = null;
//#slutt
//#blokk 0097 keys

const keys = {};
//#slutt
//#blokk 0098 g,state,last

let g = null, state = 'start', last = 0;
//#slutt
//#blokk 0099 isTouch

const isTouch = matchMedia('(pointer: coarse)').matches;
//#slutt
//#blokk 0100 QUAL

// Grafikkvalitet: styrer oppløsning, skyggekart, antall lys og partikler (ingen spillmekanikk)
const QUAL = {
  lav:     { n: 'Lav',     dpr: 1,   shadow: 1024, lights: 4, flames: 2, embers: 60,  lavaP: 90,  smoke: 45, riverMist: 5 },
  middels: { n: 'Middels', dpr: 1.5, shadow: 2048, lights: 6, flames: 3, embers: 130, lavaP: 200, smoke: 70, riverMist: 9 },
  hoy:     { n: 'Høy',     dpr: 2,   shadow: 2048, lights: 8, flames: 4, embers: 240, lavaP: 360, smoke: 90, riverMist: 14 } };
//#slutt
//#blokk 0101 qKey

let qKey = (() => { try { return localStorage.getItem('mork3d.q'); } catch (e) { return null; } })();
//#slutt
//#blokk 0102 IfStatement

if (!QUAL[qKey]) qKey = isTouch ? 'middels' : 'hoy';
//#slutt
//#blokk 0103 Q

let Q = QUAL[qKey];
//#slutt
//#blokk 0104 WIND_X

const WIND_X = 14;
//#slutt
//#blokk 0105 fireFlick
                                                     // svak vind mot øst: røyk og glør driver litt
const fireFlick = t => 1 + Math.sin(t * 8.3) * .07 + Math.sin(t * 13.7 + 1.3) * .05 + Math.sin(t * 23.1 + .4) * .03;
//#slutt
//#blokk 0106 riverYAt
   // samme flakking for flammer og lys
const riverYAt = x => { const i = Math.max(0, Math.min(RIVER.length - 2, Math.floor((x + 80) / 40))), [x0, y0] = RIVER[i], [x1, y1] = RIVER[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); };
//#slutt
//#blokk 0107 FOGU

// Tåke for alle vanlige materialer: myk avstandståke + dalståke (tettere lavt i terrenget, aldri tett rett ved spilleren) + sollys i disen
const FOGU = { fogSunDir: { value: null }, fogSunCol: { value: null }, fogH: { value: null } };
//#slutt
//#blokk 0108 FOG_HOOK

function FOG_HOOK(sh) { if (sh.fragmentShader.includes('#include <fog_fragment>')) Object.assign(sh.uniforms, FOGU); }
//#slutt
//#blokk 0110 rand


const rand = (a, b) => a + Math.random() * (b - a);
//#slutt
//#blokk 0111 dist

const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
//#slutt
//#blokk 0112 clamp

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
//#slutt
//#blokk 0113 resize


function resize() {
  DPR = Math.min(Q.dpr, window.devicePixelRatio || 1);
  VW = window.innerWidth; VH = window.innerHeight;
  ov.width = Math.round(VW * DPR); ov.height = Math.round(VH * DPR);
  if (R3) {
    R3.renderer.setPixelRatio(DPR); R3.renderer.setSize(VW, VH, false);
    R3.camera.aspect = VW / VH; R3.camera.updateProjectionMatrix();
  }
}
//#slutt
//#blokk 0114 ExpressionStatement

window.addEventListener('resize', resize);
//#slutt
//#blokk 0115 ExpressionStatement
 resize();
//#slutt
//#blokk 0116 TOWNX,TOWNY


// ================== Toget og cowboylandsbyen (v4.2) ==================
// En jernbane går fra Mørkeskogen stasjon (sørøst for bålet) gjennom skogen og ut i ørkenen til cowboylandsbyen Kaktusbyen.
// Et damplokomotiv med kullvogn og en åpen passasjervogn kjører fram og tilbake. Du går om bord på perrongen og ser landskapet fra vogna.
const TOWNX = FX + Math.cos(1.22) * 3500, TOWNY = FY + Math.sin(1.22) * 3500;
//#slutt
//#blokk 0117 TRACK_CTRL
             // Kaktusbyen i ørkenen
const TRACK_CTRL = [[FX + 560, FY + 380], [FX + 600, FY + 820], [FX + 760, FY + 1500], [FX + 1020, FY + 2200], [FX + 1180, FY + 2700], [TOWNX, TOWNY - 470]];
//#slutt
//#blokk 0118 TRACK

const TRACK = [];
//#slutt
//#blokk 0119 ExpressionStatement
                                                                           // punkter langs sporet: [x, y, s]
(() => {
  const C = TRACK_CTRL, P = (i) => C[Math.max(0, Math.min(C.length - 1, i))];
  for (let i = 0; i < C.length - 1; i++) for (let k = 0; k < 24; k++) {                     // glatt kurve (Catmull–Rom)
    const t = k / 24, p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), t2 = t * t, t3 = t2 * t;
    const f = j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
    TRACK.push([f(0), f(1), 0]);
  }
  TRACK.push([...C[C.length - 1], 0]);
  for (let i = 1; i < TRACK.length; i++) TRACK[i][2] = TRACK[i - 1][2] + Math.hypot(TRACK[i][0] - TRACK[i - 1][0], TRACK[i][1] - TRACK[i - 1][1]);
})();
//#slutt
//#blokk 0120 TRACK_LEN,ST_A,ST_B

const TRACK_LEN = TRACK[TRACK.length - 1][2], ST_A = 150, ST_B = TRACK_LEN - 150;
//#slutt
//#blokk 0121 TRAIN_K,CAR_TENDER,CAR_COACH

// Toget og stasjonene er laget i dobbel størrelse (v4.8), så Even-figuren får plass i vogna
const TRAIN_K = 2, CAR_TENDER = 78 * TRAIN_K, CAR_COACH = 175 * TRAIN_K;
//#slutt
//#blokk 0122 platformH

// Perrongen er et gulv du kan gå på
function platformH(x, y) {
  for (const s of [ST_A, ST_B]) { const q = trackPos(s), dx = x - q.x, dy = y - q.y, along = dx * q.tx + dy * q.ty, side = dx * q.ty - dy * q.tx;
    if (Math.abs(along) < 110 * TRAIN_K && side > 21 * TRAIN_K && side < 55 * TRAIN_K) return q.h + 8 * TRAIN_K; }
  return -1e9;
}
//#slutt
//#blokk 0123 TGRID,TGC
          // der toget stopper ved de to perrongene
// Rutenett med sporbiter, så det går raskt å finne nærmeste spor
const TGRID = new Map(), TGC = 200;
//#slutt
//#blokk 0124 ExpressionStatement

TRACK.forEach((p, i) => { if (i === TRACK.length - 1) return; const q = TRACK[i + 1];
  for (let cx = Math.floor((Math.min(p[0], q[0]) - 120) / TGC); cx <= Math.floor((Math.max(p[0], q[0]) + 120) / TGC); cx++)
    for (let cy = Math.floor((Math.min(p[1], q[1]) - 120) / TGC); cy <= Math.floor((Math.max(p[1], q[1]) + 120) / TGC); cy++) { const k = cx * 1000 + cy; if (!TGRID.has(k)) TGRID.set(k, []); TGRID.get(k).push(i); } });
//#slutt
//#blokk 0125 trackNear

function trackNear(x, y) {                                                                 // {d: avstand, s: hvor langt langs sporet, i}
  const L = TGRID.get(Math.floor(x / TGC) * 1000 + Math.floor(y / TGC)); if (!L) return null;
  let best = null;
  for (const i of L) { const a = TRACK[i], b = TRACK[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)), d = Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
    if (!best || d < best.d) best = { d, s: a[2] + (b[2] - a[2]) * t, i }; }
  return best;
}
//#slutt
//#blokk 0126 trackDist

const trackDist = (x, y) => { const n = trackNear(x, y); return n ? n.d : 1e9; };
//#slutt
//#blokk 0127 TOWN_K,TOWN_OY,tX,tY

// Kaktusbyen er bygd i 2,4 ganger størrelse (v5.0), så husene passer til figurene. Byens sentrum er flyttet litt sørover, bort fra stasjonen.
const TOWN_K = 2.4, TOWN_OY = 230, tX = x => TOWNX + x * TOWN_K, tY = y => TOWNY + y * TOWN_K + TOWN_OY;
//#slutt
//#blokk 0128 townBig

let townBig = true;
//#slutt
//#blokk 0129 townNear
                                      // av mens verden lages (så verden blir lik som før), på ellers
const townNear = (x, y, r) => townBig ? Math.hypot(x - TOWNX, y - TOWNY - TOWN_OY) < r * 1.8 : Math.hypot(x - TOWNX, y - TOWNY) < r;
//#slutt
//#blokk 0130 TOWN_H0

let TOWN_H0;
//#slutt
//#blokk 0131 townH0

const townH0 = () => TOWN_H0 === undefined ? (TOWN_H0 = terrainH(TOWNX, TOWNY + TOWN_OY, false)) : TOWN_H0;
//#slutt
//#blokk 0132 townFlat

const townFlat = (x, z, h) => { const d = Math.hypot(x - TOWNX, z - TOWNY - TOWN_OY); return d < 1120 ? h + (townH0() - h) * (1 - sstep(920, 1120, d)) : h; };
//#slutt
//#blokk 0133 TRACK_H

// Sporets høyde: jevnet ut langs sporet (fyllinger og skjæringer), så toget går mykt
let TRACK_H = null;
//#slutt
//#blokk 0134 trackHAt

function trackHAt(s) {
  if (!TRACK_H) {
    const raw = TRACK.map(p => townFlat(p[0], p[1], terrainH(p[0], p[1], false)));
    TRACK_H = raw.map((_, i) => { let sum = 0, n = 0; for (let j = -10; j <= 10; j++) { const k = i + j; if (k >= 0 && k < raw.length) { sum += raw[k]; n++; } } return sum / n + 2; });
  }
  const i = trackIndex(s), a = TRACK[i], b = TRACK[Math.min(TRACK.length - 1, i + 1)], t = b[2] > a[2] ? (s - a[2]) / (b[2] - a[2]) : 0;
  return TRACK_H[i] + (TRACK_H[Math.min(TRACK.length - 1, i + 1)] - TRACK_H[i]) * t;
}
//#slutt
//#blokk 0135 trackIndex

function trackIndex(s) { let lo = 0, hi = TRACK.length - 2; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (TRACK[m][2] <= s) lo = m; else hi = m - 1; } return lo; }
//#slutt
//#blokk 0136 trackPos

function trackPos(s) {                                                                     // punkt og retning på sporet
  s = Math.max(0, Math.min(TRACK_LEN, s));
  const i = trackIndex(s), a = TRACK[i], b = TRACK[i + 1], t = (s - a[2]) / (b[2] - a[2] || 1), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return { x: a[0] + dx * t, y: a[1] + dy * t, h: trackHAt(s), tx: dx / l, ty: dy / l, ang: Math.atan2(dx, dy) };
}
//#slutt
//#blokk 0137 railFlat

// Bakken flates ut under sporet og i landsbyen (brukes av groundH)
function railFlat(x, z, h) {
  h = townFlat(x, z, h);
  const n = trackNear(x, z); if (n && n.d < 150) h += (trackHAt(n.s) - 2 - h) * (1 - sstep(60, 150, n.d));
  return h;
}
//#slutt
//#blokk 0138 TOWN_HOUSES

// ---------- Kaktusbyen: hus langs hovedgata (gata går nord–sør, stasjonen i nord) ----------
const TOWN_HOUSES = [   // [x, y, bredde, dybde, høyde, type, side] i byens system; side −1 = vest (fasaden mot øst), 1 = øst
  [-130, -150, 110, 90, 78, 'saloon', -1], [-130, -10, 90, 80, 58, 'butikk', -1], [-130, 120, 80, 70, 50, 'hus', -1], [-130, 240, 76, 70, 48, 'hus', -1],
  [130, -150, 96, 80, 62, 'sheriff', 1], [130, 0, 120, 100, 64, 'stall', 1], [130, 140, 80, 70, 50, 'hus', 1], [130, 250, 76, 70, 48, 'hus', 1]
];
//#slutt
//#blokk 0139 townPush

function townPush(o, rad = 12) {
  const K = TOWN_K, lx = (o.x - TOWNX) / K, ly = (o.y - TOWNY - TOWN_OY) / K, r = rad / K; if (Math.abs(lx) > 300 || Math.abs(ly) > 360) return;
  for (const [hx, hy, w, d] of TOWN_HOUSES) {
    const px = w / 2 + r - Math.abs(lx - hx), py = d / 2 + r - Math.abs(ly - hy);
    if (px > 0 && py > 0) { if (px < py) o.x = tX(hx + Math.sign(lx - hx || 1) * (w / 2 + r)); else o.y = tY(hy + Math.sign(ly - hy || 1) * (d / 2 + r)); }
  }
}
//#slutt
//#blokk 0140 TOWN_NPCS

// ---------- Figurer i byen: sheriffen, cowboyer og skurker ----------
const TOWN_NPCS = [
  { id: 'sheriff', n: 'Sheriff Sølvstjerne', x: 60, y: -120, col: '#7a5a3a', hat: '#3a2a1a', star: true,
    lines: ['Hei, partner! Velkommen til Kaktusbyen. 🤠', 'Tre skurker gjemmer seg rundt byen og stjeler kaktussaft.', 'Kan du hjelpe meg å fange dem? Slå dem til de gir seg!'] },
  { id: 'saloon', n: 'Bartender Berit', x: -62, y: -150, col: '#7a2a3a', hat: '#c9a24a',
    lines: ['Velkommen inn i saloonen! Vil du ha en kald kaktussaft? 🥤', 'Toget kommer fra Mørkeskogen. Du må ha reist langt!'] },
  { id: 'butikk', n: 'Butikk-Bjarne', x: -62, y: -10, col: '#3a5a7a', hat: '#8a6a4a',
    lines: ['Her har vi tau, spiker og bønner i boks! 🥫', 'Snart får jeg inn flere varer med toget.'] },
  { id: 'cowboy', n: 'Cowboy Kalle', x: 62, y: 70, col: '#a83a2a', hat: '#5a3a22',
    lines: ['Hestene i stallen er de raskeste i hele ørkenen! 🐎', 'Har du sett skattekisten bak husene? Psst …'] },
  { id: 'lasso', n: 'Lasso-Lars', x: -232, y: 40, col: '#4a6a3a', hat: '#d8c8a0', vest: '#6a4a2a',
    lines: ['Hei der! Jeg er Lasso-Lars, den beste lassokasteren i hele Ville Vesten! 🪢', 'Jeg kan lage en cowboy-lasso til deg – med den kan du fange dyr!', 'Men jeg trenger fem deler, én fra hver verden: skogen, jungelen, ørkenen, snøverdenen og lavaverdenen.', 'Se etter lysstrålene! Kom tilbake til meg når du har funnet alle fem. Lykke til, partner! 🤠'] }
];
//#slutt
//#blokk 0141 newTown

function newTown() {
  return { found: false, visited: false, sheriffTalked: false, sheriffDone: hero.qdone.includes('sheriff'), talkI: {},
    bandits: [[-250, -40], [260, 120], [-60, 360]].map(([x, y], i) => ({ x: tX(x), y: tY(y), hx: tX(x), hy: tY(y), hp: 6, max: 6, hit: 0, gone: false, active: false, walk: 0, ang: 0, i, said: 0 })),
    train: { s: ST_A, v: 0, st: 'wait', at: 'A', t: 0, dir: 1, called: false, chug: 0 } };
}
//#slutt
//#blokk 0142 updateTrainTown

// ---------- Logikk ----------
function updateTrainTown(dt) {
  const p = g.p, T = g.town || (g.town = newTown()), tr = T.train;
  // finn stasjonen og byen
  const stA = trackPos(ST_A), stB = trackPos(ST_B);
  if (!hero.qdone.includes('stasjon') && dist(p.x, p.y, stA.x, stA.y) < 260) { questAdd('stasjon'); toast('🚉 Du fant Mørkeskogen stasjon! Gå om bord når toget står ved perrongen.'); }
  if (!T.found && townNear(p.x, p.y, 700)) { T.found = true; if (!g.ride) toast('🤠 Du fant Kaktusbyen! Snakk med sheriffen.'); }
  // toget: vent ved stasjonen, kjør mykt fram til den andre, brems og stopp ved perrongen
  const target = tr.at === 'A' ? ST_B : ST_A;
  if (tr.st === 'wait') {
    tr.t += dt;
    const other = tr.at === 'A' ? stB : stA;
    if (!g.ride && dist(p.x, p.y, other.x, other.y) < 230 && !tr.called) { tr.called = true; tr.t = 0; toast('🚂 Toget er på vei til denne perrongen! Vent litt …'); }
    if (tr.called && tr.t > 1.5 && !g.ride) { tr.st = 'go'; tr.called = false; sfx('whistle'); }
    if (g.ride && g.ride.boardT !== undefined && (g.ride.boardT += dt) > 1.6) { tr.st = 'go'; g.ride.boardT = undefined; sfx('whistle'); toast('🚂 Tøff tøff! Toget går!'); }
  } else if (tr.st === 'go') {
    const dir = target > tr.s ? 1 : -1, left = Math.abs(target - tr.s), vmax = 300;
    const vStop = Math.sqrt(2 * 90 * left);                                                 // bremselengde
    tr.v = Math.min(vmax, tr.v + 70 * dt, vStop + 8);
    tr.s += dir * Math.min(left, tr.v * dt);
    tr.chug -= dt * (0.6 + tr.v / 90); if (tr.chug <= 0) { tr.chug = 1; sfx('chug'); }
    if (left < 0.5) {                                                                        // fram!
      tr.s = target; tr.v = 0; tr.st = 'wait'; tr.at = tr.at === 'A' ? 'B' : 'A'; tr.t = 0; sfx('whistle');
      if (g.ride) {                                                                           // gå av på perrongen
        const st = trackPos(tr.s); g.ride = null;
        p.x = st.x + st.ty * 40 * TRAIN_K; p.y = st.y - st.tx * 40 * TRAIN_K; p.h = undefined; p.z = 0;
        if (tr.at === 'B') { questAdd('cowboy'); toast('🤠 Velkommen til Kaktusbyen! Sheriffen trenger hjelp – snakk med ham.'); T.visited = true; }
        else toast('🌲 Tilbake i Mørkeskogen!');
      }
    }
  }
  if (g.ride) {                                                                             // du sitter i vogna
    const c = trackPos(tr.s - CAR_COACH + 2), sg = g.ride.seat ? 1 : -1;
    p.x = c.x + c.ty * 7.5 * TRAIN_K * sg; p.y = c.y - c.tx * 7.5 * TRAIN_K * sg;
    p.h = c.h + 19 * TRAIN_K - 32; p.z = 0; p.vx = p.vy = p.vz = 0; p.swing = 0; p.draw = 0; p.rideAng = c.ang;
  }
  // skurkene: gjemmer seg til sheriffen har bedt om hjelp, så kommer de fram og slåss
  for (const b of T.bandits) {
    if (b.gone) continue;
    b.hit = Math.max(0, b.hit - dt); b.said -= dt;
    if (!T.sheriffTalked) continue;
    b.active = true;
    const dp = dist(b.x, b.y, p.x, p.y);
    let tx = b.hx, ty = b.hy, sp = 60;
    if (dp < 260 && !g.ride) { tx = p.x; ty = p.y; sp = 105; if (b.said <= 0) { b.said = 5; floatText(b.x, b.y - 80, ['Du tar meg aldri! 😈', 'Hehe, kaktussaften er min!', 'Kom an, cowboy!'][b.i]); } }
    const dx = tx - b.x, dy = ty - b.y, l = Math.hypot(dx, dy) || 1;
    if (l > 26) { b.x += dx / l * sp * dt; b.y += dy / l * sp * dt; b.walk += sp * dt * 0.09; b.ang = Math.atan2(dx, dy); }
    const o = { x: b.x, y: b.y }; townPush(o, 10); b.x = o.x; b.y = o.y;
    if (dp < 30 && p.z < 25 && !g.ride) { g.hp -= 8 * dt; p.hurt = 1; g.cause = 'bandit'; g.flash = 0.2; }
  }
}
//#slutt
//#blokk 0143 startRide

function startRide() {
  const T = g.town, tr = T.train; if (tr.st !== 'wait') return;
  g.ride = { boardT: 0, seat: Math.random() < .5 ? 0 : 1 }; toast('🎟️ Du satte deg i vogna. Toget går snart!'); sfx('select');
}
//#slutt
//#blokk 0144 talkNpc

function talkNpc(n) {
  if (n.id === 'lasso') { talkLars(n); return; }
  const T = g.town, i = T.talkI[n.id] || 0;
  if (n.id === 'sheriff') {
    if (T.sheriffDone || hero.qdone.includes('sheriff')) { floatText(tX(n.x), tY(n.y) - 90, 'Takk igjen, partner! Byen er trygg nå. ⭐'); return; }
    const left = T.bandits.filter(b => !b.gone).length;
    if (T.sheriffTalked) { floatText(tX(n.x), tY(n.y) - 90, left ? `Det er ${left} skurk${left > 1 ? 'er' : ''} igjen der ute! 🤠` : 'Du klarte det! ⭐'); return; }
  }
  const line = n.lines[i % n.lines.length]; T.talkI[n.id] = i + 1;
  floatText(tX(n.x), tY(n.y) - 90, line); toast(`💬 ${n.n}: ${line}`);
  if (n.id === 'sheriff' && i + 1 >= n.lines.length) { T.sheriffTalked = true; toast('📜 Nytt oppdrag: Hjelp sheriffen! Fang de tre skurkene rundt Kaktusbyen.'); sfx('levelup'); }
}
//#slutt
//#blokk 0145 banditHit

function banditHit(b, dmg, src) {
  if (b.gone) return;
  b.hp -= dmg; b.hit = 0.2; const kx = b.x - src.x, ky = b.y - src.y, kl = Math.hypot(kx, ky) || 1; b.x += kx / kl * 14; b.y += ky / kl * 14; burst(b.x, b.y - 30, '#ffffff', 5);
  if (b.hp <= 0) {
    b.gone = true; burst(b.x, b.y - 30, '#ffd54a', 16); floatText(b.x, b.y - 80, 'Jeg gir meg! 🙌 Jeg skal være snill!'); sfx('hit');
    questAdd('sheriff'); addXP(15, b.x, b.y);
    if (g.town.bandits.every(q => q.gone)) { g.town.sheriffDone = true; toast('⭐ Alle skurkene er fanget! Sheriffen gjør deg til visesheriff – og Kaktusbyen er trygg igjen!'); }
  }
}
//#slutt
//#blokk 0156 LPARTS


// ================== Lasso-Lars og de fem lassodelene (v5.0) ==================
// Bak husene i Kaktusbyen bor Lasso-Lars. Han lager en cowboy-lasso til deg hvis du finner fem deler – én i hver verden.
// Med lassoen kan du fange dyr. Et fanget dyr blir tamt og følger etter deg (maks 4 om gangen).
const LPARTS = [
  { id: 'skog', n: 'Sterkt tau', icon: '🧶', where: 'Skogen', a: 2.3, d: 1300, col: 0x9ad06a },
  { id: 'jungel', n: 'Lange lianer', icon: '🌿', where: 'Jungelen', a: 0.15, d: 3600, col: 0x5aff8a },
  { id: 'orken', n: 'Messingring', icon: '💍', where: 'Ørkenen', a: 1.85, d: 3300, col: 0xffd24a },
  { id: 'sno', n: 'Isbjørnlær', icon: '🧤', where: 'Snøverdenen', a: -1.75, d: 3500, col: 0x9fe6ff },
  { id: 'lava', n: 'Glødende spenne', icon: '🔥', where: 'Lavaverdenen', a: 2.9, d: 3500, col: 0xff7a2a }
];
//#slutt
//#blokk 0157 PET_MAX

const PET_MAX = 4;
//#slutt
//#blokk 0158 ANIMAL_NAVN

const ANIMAL_NAVN = { hjort: 'en hjort', rev: 'en rev', villsvin: 'et villsvin', ulv: 'en ulv', bjorn: 'en bjørn', isbjorn: 'en isbjørn', tiger: 'en tiger', elg: 'en elg', rein: 'et reinsdyr', kamel: 'en kamel', orkenrev: 'en ørkenrev', hare: 'en hare', snohare: 'en snøhare', gaupe: 'en gaupe', ape: 'en ape', grevling: 'en grevling', villhest: 'en villhest', moskus: 'en moskus', polarrev: 'en polarrev', elefant: 'en elefant', krokodille: 'en krokodille', panter: 'en panter', gasell: 'en gasell' };
//#slutt
//#blokk 0159 lassoHas

const lassoHas = id => (hero.lassoParts || []).includes(id);
//#slutt
//#blokk 0160 lassoSetup

function lassoSetup() {                                   // kjøres i newGame: finn en trygg plass til hver del og rydd rundt den
  g.lparts = LPARTS.map(L => {
    let x = FX + Math.cos(L.a) * L.d, y = FY + Math.sin(L.a) * L.d;
    for (let k = 0; k < 60; k++) {
      const ok = !inLava(x, y) && waterDist(x, y) > 90 && trackDist(x, y) > 140 && !dcFoot(x, y, 200) && !g.bases.some(B => dist(x, y, B.x, B.y) < 320) && dist(x, y, VX, VY) > VR + 120;
      if (ok) break;
      const a = k * 2.4, r = 60 + k * 25; x = FX + Math.cos(L.a) * L.d + Math.cos(a) * r; y = FY + Math.sin(L.a) * L.d + Math.sin(a) * r;
    }
    return { id: L.id, x, y };
  });
  for (const P of g.lparts) { g.trees = g.trees.filter(t => dist(t.x, t.y, P.x, P.y) > 70); g.rocks = g.rocks.filter(r => dist(r.x, r.y, P.x, P.y) > 40); g.bushes = g.bushes.filter(b => dist(b.x, b.y, P.x, P.y) > 40); }
  g.pets = [];
}
//#slutt
//#blokk 0161 updateLassoParts

function updateLassoParts(dt) {
  const p = g.p; if (!g.lparts || g.ride) return;
  for (const P of g.lparts) {
    if (lassoHas(P.id) || dist(p.x, p.y, P.x, P.y) > 55) continue;
    const L = LPARTS.find(q => q.id === P.id);
    (hero.lassoParts = hero.lassoParts || []).push(P.id); saveHero(); questAdd('lasso');
    const n = hero.lassoParts.length; burst(P.x, P.y - 30, '#ffd36b', 26); sfx(n === 5 ? 'levelup' : 'sparkle');
    toast(`${L.icon} Du fant ${L.n}! (${n} av 5 lassodeler)` + (n === 5 ? ' Gå tilbake til Lasso-Lars bak husene i Kaktusbyen! 🤠' : hero.lassoTalk ? '' : ' Kanskje noen i Kaktusbyen trenger den?'));
  }
}
//#slutt
//#blokk 0162 talkLars

function talkLars(n) {
  const T = g.town, wx = tX(n.x), wy = tY(n.y), have = (hero.lassoParts || []).length;
  const say = s => { floatText(wx, wy - 90, s); toast(`💬 ${n.n}: ${s}`); };
  if (hero.owned.includes('lasso')) { say('Hvordan går det med lassoen, partner? Kast den på et dyr – så blir det tamt og følger deg! 🪢'); return; }
  if (!hero.lassoTalk) {
    const i = T.talkI[n.id] || 0; say(n.lines[i % n.lines.length]); T.talkI[n.id] = i + 1;
    if (i + 1 >= n.lines.length) { hero.lassoTalk = true; saveHero(); toast('📜 Nytt oppdrag: Finn de 5 lassodelene! Se etter lysstrålene – én i hver verden. De står også på kartet.'); sfx('levelup'); }
    return;
  }
  if (have < 5) { const miss = LPARTS.filter(L => !lassoHas(L.id)).map(L => `${L.icon} ${L.where}`).join(', '); say(`Du har funnet ${have} av 5 deler. Jeg mangler fortsatt: ${miss}.`); return; }
  giveWeapon('lasso', true); hero.sel = 'lasso'; saveHero(); g.p.cool = 0.4;
  say('Yeehaw! Her er din helt egen cowboy-lasso! 🪢'); burst(wx, wy - 40, '#ffd36b', 30);
  toast(`🪢 Du fikk COWBOY-LASSOEN! Trykk ${WEAPON_SLOTS.indexOf('lasso') + 1} og angrip for å kaste den på et dyr. Dyret blir tamt og følger deg!`); sfx('levelup');
}
//#slutt
//#blokk 0163 throwLasso

// Kast lassoen mot dyret foran deg
function throwLasso() {
  const p = g.p, W = WEAPONS.lasso, ang = Math.atan2(p.ix, p.iy);
  let best = null, bs = 1e9;
  for (const a of g.animals) {
    if (a.tame) continue;
    const d = dist(p.x, p.y, a.x, a.y); if (d > W.range) continue;
    const da = Math.abs(angDiff(Math.atan2(a.x - p.x, a.y - p.y), ang)); if (da > 0.8 && d > 90) continue;
    const s = d + da * 140; if (s < bs) { bs = s; best = a; }
  }
  p.aim = best ? Math.atan2(best.x - p.x, best.y - p.y) : ang;
  p.wid = 'lasso'; p.swing = W.cd; p.swingDur = W.cd; p.cool = W.cd; sfx('swish');
  const tx = best ? best.x : p.x + Math.sin(p.aim) * 240, ty = best ? best.y : p.y + Math.cos(p.aim) * 240;
  g.lassoFx = { t: 0, dur: 0.25 + dist(p.x, p.y, tx, ty) / 1100, tx, ty, a: best, done: false };
}
//#slutt
//#blokk 0164 updateLasso

function updateLasso(dt) {
  const F = g.lassoFx; if (!F) return;
  F.t += dt; if (F.a && g.animals.includes(F.a)) { F.tx = F.a.x; F.ty = F.a.y; }
  if (!F.done && F.t >= F.dur) {
    F.done = true; const a = F.a;
    if (a && g.animals.includes(a) && dist(g.p.x, g.p.y, a.x, a.y) < WEAPONS.lasso.range + 80) {
      const A = ANIMALS[a.type]; a.tame = true; a.flee = 0; a.hp = A.hp; a.heartT = 0;
      g.pets = (g.pets || []).filter(q => g.animals.includes(q) && q.tame); g.pets.push(a);
      if (g.pets.length > PET_MAX) { const old = g.pets.shift(); old.tame = false; old.flee = 2; floatText(old.x, old.y - 40, 'Ha det! 👋'); }
      burst(a.x, a.y - 20, '#ff7aa8', 16); floatText(a.x, a.y - 50, `❤️ Du fanget ${ANIMAL_NAVN[a.type] || a.type}!`); sfx('sparkle');
      if (!g.toldPet) { g.toldPet = true; toast(`🪢 Fanget! Dyret er tamt nå og følger etter deg. Du kan ha ${PET_MAX} dyr med deg om gangen.`); }
    } else floatText(F.tx, F.ty - 30, 'Bom! 🪢');
  }
  if (F.t > F.dur + 0.35) g.lassoFx = null;
}
//#slutt
//#blokk 0165 petFollow

// Et tamt dyr følger etter deg (oppstilt bak deg), og angriper ikke
function petFollow(a, A, dt) {
  const p = g.p, k = Math.max(0, (g.pets || []).indexOf(a)), back = 75 + (k >> 1) * 45, side = (k % 2 ? 1 : -1) * 34;
  const tx = p.x - p.ix * back + p.iy * side, ty = p.y - p.iy * back - p.ix * side;
  const dx = tx - a.x, dy = ty - a.y, l = Math.hypot(dx, dy);
  if (l > 700) { a.x = tx; a.y = ty; return; }                                        // hopper etter deg hvis du er langt unna (f.eks. med toget)
  const sp = l > 160 ? A.run * 1.15 : l > 25 ? Math.max(A.sp, Math.min(A.run, l * 1.8)) : 0;
  if (sp > 0) { const mv = Math.min(l, sp * dt); a.x += dx / l * mv; a.y += dy / l * mv; if (Math.abs(dx) > 0.01) a.face = Math.sign(dx); a.walk += dt * sp / 8; }
  if ((a.heartT = (a.heartT || 0) - dt) <= 0) { a.heartT = rand(6, 12); if (l < 200) floatText(a.x, a.y - 40, '❤️'); }
}
//#slutt
//#blokk 0169 WORLD_KEY

// ---------- Lagret verden ----------
// Verden lages fra et fast «frø», så den blir lik hver gang. Det du bygger (hytter, lykter, verksted, senger) lagres og står der neste gang.
const WORLD_KEY = 'mork3d.verden';
//#slutt
//#blokk 0170 world

let world = (() => { try { const w = JSON.parse(localStorage.getItem(WORLD_KEY)); if (w && w.v === 1) return w; } catch (e) {} return null; })();
//#slutt
//#blokk 0171 IfStatement

if (!world) world = { v: 1, seed: (Math.random() * 1e9) | 0, buildings: [] };
//#slutt
//#blokk 0172 saveWorld

function saveWorld() { try { world.buildings = g.buildings.map(b => ({ type: b.type, x: Math.round(b.x), y: Math.round(b.y) })); localStorage.setItem(WORLD_KEY, JSON.stringify(world)); } catch (e) {} }
//#slutt
//#blokk 0173 newGame

function newGame() {
  const r0 = Math.random; Math.random = treeRng(world.seed);                     // samme frø → samme verden
  pondOn = false; townBig = false;                                               // verden lages uten dammen og den store byen, så alt annet blir som før
  try { newGameGen(); } finally { Math.random = r0; pondOn = true; townBig = true; }
  g.chests.push({ x: tX(-210), y: tY(300), open: false }, { x: tX(220), y: tY(-160), open: false });   // skattekister i Kaktusbyen
  g.buildings = (world.buildings || []).filter(b => BUILDINGS[b.type]).map(b => ({ type: b.type, x: b.x, y: b.y }));
  for (const b of g.buildings) { const r = BUILDINGS[b.type].r + 10; g.trees = g.trees.filter(t => Math.hypot(t.x - b.x, t.y - b.y) >= r); }   // ingen trær inni bygningene dine (fjernes helt, så de ikke vokser opp igjen)
  dcSetup();                                                                       // Dinoverdenen og Beinslottet
  pondSetup();                                                                     // Haidammen
  { const off = o => !townNear(o.x, o.y, 520); g.trees = g.trees.filter(off); g.rocks = g.rocks.filter(off); g.bushes = g.bushes.filter(off); g.tufts = g.tufts.filter(off); }   // plass til den store byen
  lassoSetup();                                                                    // lassodelene
  { const off = (o, r) => trackDist(o.x, o.y) > r; g.trees = g.trees.filter(t => off(t, 105)); g.rocks = g.rocks.filter(r => off(r, 70)); g.bushes = g.bushes.filter(b => off(b, 70)); g.tufts = g.tufts.filter(t => off(t, 60)); }   // plass til det store toget
}
//#slutt
//#blokk 0174 newGameGen

function newGameGen() {
  const trees = [], bushes = [], chests = [], tufts = [], rocks = [], patches = [], lavaPools = [];
  const farFrom = (x, y, list, d) => list.every(o => dist(x, y, o.x, o.y) > d);
  const inPool = (x, y, pad = 0) => lavaPools.some(l => dist(x, y, l.x, l.y) < l.r + pad);
  // Rutenett gjør det raskt å sjekke om det er plass til et nytt tre
  const tGrid = new Map(), CELL = 120, gk = (cx, cy) => cx * 100000 + cy;
  const addT = t => { const k = gk(Math.floor(t.x / CELL), Math.floor(t.y / CELL)); if (!tGrid.has(k)) tGrid.set(k, []); tGrid.get(k).push(t); };
  const treesNear = (x, y, d) => {
    const out = [], r = Math.ceil(d / CELL), cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) { const a = tGrid.get(gk(cx + i, cy + j)); if (a) out.push(...a); }
    return out;
  };
  const treeFree = (x, y, d) => treesNear(x, y, d).every(o => dist(x, y, o.x, o.y) > d);
  let tries = 0;
  while (lavaPools.length < Math.round(50 * WA) && tries++ < 15000 * WA) {
    const x = rand(150, W - 150), y = rand(150, H - 150);
    if (biomeW(x, y).lava > 0.9 && riverDist(x, y) > 120 && dist(x, y, VX, VY) > VR + 220 && lavaPools.every(l => dist(x, y, l.x, l.y) > l.r + 170)) lavaPools.push({ x, y, r: rand(35, 80) });
  }
  // Skurkebaser på tilfeldige steder
  const bases = [];
  tries = 0;
  while (bases.length < Math.round(8 * WA) && tries++ < 10000 * WA) {
    const x = rand(500, W - 500), y = rand(500, H - 500);
    if (dist(x, y, FX, FY) > 1300 && !ghNear(x, y, 900) && !townNear(x, y, 1100) && trackDist(x, y) > 300 && waterDist(x, y) > 260 && dist(x, y, VX, VY) > VR + 500 && !inPool(x, y, 260) && bases.every(b => dist(x, y, b.x, b.y) > 1300))
      bases.push({ x, y, b: biomeAt(x, y), known: false, cleared: false, looted: false });
  }
  const nearBase = (x, y, d = 250) => bases.some(b => dist(x, y, b.x, b.y) < d) || ghNear(x, y, d + 140) || trackDist(x, y) < 75 || townNear(x, y, d + 380);
  // Broer: en der bekken renner, og steinbro over lavaelva
  const bridges = [];
  for (const bx of [FX, FX - 1300 * WS, FX + 1300 * WS, FX - 2500 * WS, FX + 2600 * WS]) {
    let i = 0; while (i < RIVER.length - 2 && RIVER[i + 1][0] < bx) i++;
    const [x0, y0] = RIVER[i], [x1, y1] = RIVER[i + 1], k = (bx - x0) / (x1 - x0), by = y0 + (y1 - y0) * k;
    const tl = Math.hypot(x1 - x0, y1 - y0), tx = (x1 - x0) / tl, ty = (y1 - y0) * 1 / tl;
    const Bd = { x: bx, y: by, tx, ty, nx: -ty, ny: tx, lava: biomeW(bx, by).lava > 0.5, trollT: 0 };
    Bd.hx = bx + Bd.nx * 70 + tx * 30; Bd.hy = by + Bd.ny * 70 + ty * 30;     // trollets plass ved brofoten
    bridges.push(Bd);
  }
  // Gamle hytter i skogen og snøverdenen
  const cabins = [];
  tries = 0;
  while (cabins.length < Math.round(10 * WA) && tries++ < 10000 * WA) {
    const x = rand(300, W - 300), y = rand(300, H - 300), b = biomeAt(x, y);
    if ((b === 'skog' || b === 'sno') && dist(x, y, FX, FY) > 600 && waterDist(x, y) > 160 && !inPool(x, y, 200) && !nearBase(x, y, 450)
        && bridges.every(B => dist(x, y, B.x, B.y) > 260) && cabins.every(c => dist(x, y, c.x, c.y) > 700))
      cabins.push({ x, y, b, looted: false, known: false, smokeT: 0 });
  }
  // Skogsstier: slynger seg (deterministisk ut fra endepunktene) fra bålet til broene og hyttene
  const makePath = (ax, ay, bx, by) => {
    const L = dist(ax, ay, bx, by), n = Math.max(3, Math.round(L / 30)), nx = -(by - ay) / L, ny = (bx - ax) / L, sd = (ax * .013 + by * .007) % 6.28, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, w2 = Math.sin(t * Math.PI) * (Math.sin(t * 7.3 + sd) * 45 + Math.sin(t * 2.3 + sd * 2) * 90 + Math.sin(t * 17 + sd) * 8); pts.push([ax + (bx - ax) * t + nx * w2, ay + (by - ay) * t + ny * w2]); }
    return pts;
  };
  const paths = [], riverY = x => { let i = 0; while (i < RIVER.length - 2 && RIVER[i + 1][0] < x) i++; const [x0, y0] = RIVER[i], [x1, y1] = RIVER[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); };
  const fireSide = y => y > riverY(FX);
  for (const B of bridges) if (!B.lava) {
    const sgn = Math.sign((FX - B.x) * B.nx + (FY - B.y) * B.ny) || 1;
    const near1 = [B.x + B.nx * 75 * sgn, B.y + B.ny * 75 * sgn], far1 = [B.x - B.nx * 75 * sgn, B.y - B.ny * 75 * sgn];
    paths.push(makePath(FX, FY + 60, near1[0], near1[1]));
    paths.push(makePath(FX - 40, FY - 20, GHX + 10, GHY + GH_HY + 120));                   // sti til spøkelseshuset
    const across = cabins.filter(c => fireSide(c.y) !== fireSide(FY)).sort((a, b) => dist(a.x, a.y, far1[0], far1[1]) - dist(b.x, b.y, far1[0], far1[1]))[0];
    if (across && dist(across.x, across.y, far1[0], far1[1]) < 2600) paths.push(makePath(far1[0], far1[1], across.x - 8, across.y + 45));
  }
  for (const c of cabins) if (fireSide(c.y) === fireSide(FY) && dist(c.x, c.y, FX, FY) < 3200 * WS) paths.push(makePath(FX, FY + 60, c.x - 8, c.y + 45));
  for (const P of paths) P.box = [Math.min(...P.map(q => q[0])), Math.max(...P.map(q => q[0])), Math.min(...P.map(q => q[1])), Math.max(...P.map(q => q[1]))];
  const pathNear = (x, y, d) => paths.some(P => { if (x < P.box[0] - d || x > P.box[1] + d || y < P.box[2] - d || y > P.box[3] + d) return false; for (let i = 0; i < P.length - 1; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); if (Math.hypot(x - ax - dx * t, y - ay - dy * t) < d) return true; } return false; });
  const nearBridge = (x, y, d = 110) => bridges.some(B => dist(x, y, B.x, B.y) < d) || cabins.some(c => dist(x, y, c.x, c.y) < 120) || dist(x, y, VX, VY) < VR + 90 || pathNear(x, y, 26);
  const villains = [];
  bases.forEach((B, i) => {
    const n = 3 + Math.floor(Math.random() * 2) + (B.b === 'lava' ? 1 : 0);
    for (let k = 0; k < n; k++) { const a = k / n * 6.28; villains.push({ base: i, x: B.x + Math.cos(a) * 70, y: B.y + Math.sin(a) * 70, hp: 8, max: 8, hit: 0, walk: 0, spd: 0, t: rand(0, 3), wx: B.x, wy: B.y, atk: 0 }); }
  });
  tries = 0;
  const quota = { skog: Math.round(640 * WA), sno: Math.round(200 * WA), jungel: Math.round(260 * WA), lava: Math.round(100 * WA), orken: Math.round(90 * WA) }, count = { skog: 0, sno: 0, jungel: 0, lava: 0, orken: 0 };   // egen kvote per biom
  while (trees.length < Math.round(1320 * WA) && tries++ < 200000 * WA) {
    const giant = trees.length < 30;   // de første blir kjempegraner
    const x = rand(80, W - 80), y = rand(80, H - 80), b = biomeAt(x, y);
    if (giant && (b === 'lava' || b === 'jungel' || b === 'orken')) continue;
    if (b === 'orken' && Math.max(Math.abs(x - PYX), Math.abs(y - PYY)) < PYR + 120) continue;
    if (!giant && count[b] >= quota[b]) continue;
    const dens = b === 'jungel' ? .45 + forestDensity(x, y) * .55 : b === 'lava' ? .3 : b === 'orken' ? .35 : forestDensity(x, y);
    if (Math.random() > dens * (b === 'sno' ? .85 : 1)) continue;                          // skogområder, åpne landskap og lysninger
    if (dist(x, y, FX, FY) < (giant ? 320 : 220) || waterDist(x, y) < (giant ? 90 : 50) || inPool(x, y, 40) || nearBase(x, y) || nearBridge(x, y)) continue;
    const h = terrainH(x, y, false), sl = slopeAt(x, y), moist = moistAt(x, y);
    if (Math.random() < sstep(.28, .6, sl) * .85 + sstep(60, 95, h) * .6) continue;       // glissent i bratte og høye partier
    if (!treesNear(x, y, 170).every(o => dist(x, y, o.x, o.y) > (giant || o.giant ? 105 : 38 + (1 - dens) * 22))) continue;
    let kind;
    if (b === 'sno') kind = Math.random() < .8 ? 'snogran' : 'furu';
    else if (b === 'jungel') kind = moist > .4 && Math.random() < .7 ? 'palme' : Math.random() < .6 ? 'jungeltre' : 'palme';
    else if (b === 'lava') kind = 'dodtre';
    else if (b === 'orken') kind = 'kaktus';
    else {                                                                                 // gran i tett, fuktig skog; furu på tørre åser og skrenter; løvtrær ved vann; bjørk i kanter og lysninger
      const wts = { gran: .25 + dens * 1.1 + (h < 40 ? .3 : 0), furu: .12 + sstep(25, 65, h) * 1.1 + sstep(.12, .35, sl) * .9 + (1 - moist) * .25, lov: .08 + moist * 1.3 + (h < 25 ? .3 : 0), bjork: .12 + (1 - dens) * .9 };
      let r = Math.random() * (wts.gran + wts.furu + wts.lov + wts.bjork); kind = 'gran';
      for (const k in wts) { r -= wts[k]; if (r <= 0) { kind = k; break; } }
    }
    const t = giant
      ? { x, y, hp: 20, max: 20, alive: true, regrow: 0, shake: 0, s: rand(2.3, 3), kind: b === 'sno' ? 'snogran' : 'gran', giant: true, sx: 1, sy: 1, tint: 0 }
      : { x, y, hp: 6, max: 6, alive: true, regrow: 0, shake: 0, s: rand(.8, 1.2) * (1 - sstep(60, 95, h) * .3), kind, sx: rand(.82, 1.22), sy: rand(.85, 1.2), tint: Math.random() < .08 ? 3 : Math.floor(Math.random() * 3) };
    trees.push(t); addT(t); if (!giant) count[b]++;
  }
  tries = 0;
  while (bushes.length < Math.round(200 * WA) && tries++ < 25000 * WA) {
    const x = rand(60, W - 60), y = rand(60, H - 60), b = biomeAt(x, y);
    if ((b === 'skog' || b === 'jungel') && dist(x, y, FX, FY) > 150 && waterDist(x, y) > 45 && !nearBase(x, y) && !nearBridge(x, y) && farFrom(x, y, bushes, 80) && treeFree(x, y, 40))
      bushes.push({ x, y, berries: 3, t: 0, fruit: b === 'jungel' });
  }
  tries = 0;
  while (chests.length < Math.round(22 * WA) && tries++ < 20000 * WA) {
    const x = rand(120, W - 120), y = rand(120, H - 120);
    if (dist(x, y, FX, FY) > 480 && waterDist(x, y) > 60 && !inPool(x, y, 40) && !nearBase(x, y) && dist(x, y, VX, VY) > VR + 150 && farFrom(x, y, chests, 900) && treeFree(x, y, 45))
      chests.push({ x, y, open: false });
  }
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 + 0.35; chests.push({ x: VX + Math.cos(a) * (VR + 70), y: VY + Math.sin(a) * (VR + 70), open: false, volcano: true }); }   // fem vulkankister
  chests.push({ x: PYX, y: PYY - PYR - 40, open: false, desert: true });                    // skattekisten foran pyramiden
  for (let i = 0; i < 9000 * WA; i++) {
    const x = rand(0, W), y = rand(0, H), b = biomeAt(x, y);
    if ((b === 'skog' || b === 'jungel') && waterDist(x, y) > 32 && Math.random() > forestDensity(x, y) * .55) tufts.push({ x, y, k: Math.random() < .85 ? 0 : 1, s: rand(.6, 1.3), j: b === 'jungel' });
  }
  tries = 0;
  while (rocks.length < Math.round(520 * WA) && tries++ < 30000 * WA) {
    const x = rand(40, W - 40), y = rand(40, H - 40), b = biomeAt(x, y);
    if (dist(x, y, FX, FY) > 130 && waterDist(x, y) > 34 && !inPool(x, y, 20) && !nearBase(x, y) && !nearBridge(x, y) && treeFree(x, y, 30)) {
      const ore = Math.random() < (b === 'lava' ? 0.45 : b === 'sno' ? 0.15 : 0.1);   // mest jern i lavaverdenen
      rocks.push({ x, y, s: ore ? rand(1, 1.5) : rand(.7, 1.6), hp: ore ? 6 : 3, max: ore ? 6 : 3, ore, alive: true, regrow: 0, b });
    }
  }
  for (let i = 0; i < 1200 * WA && patches.length < 500 * WA; i++) { const x = rand(0, W), y = rand(0, H); if (biomeW(x, y).skog > 0.5) patches.push({ x, y, r: rand(60, 170), c: Math.random() < .5 ? 'rgba(20,40,16,.28)' : 'rgba(90,120,60,.16)' }); }
  g = {
    trees, bushes, chests, tufts, rocks, patches, lavaPools, bases, villains, bridges, cabins, paths, trolls: [], mapImg: null, monsters: [], parts: [], fx: [], animals: [],
    p: { x: FX + 70, y: FY + 40, impact: null, aim: 0, draw: 0, wid: 'oks', swingDur: 0.5, bowT: 0, hintT: 0, wantDraw: false, face: 1, view: 'down', vx: 0, vy: 0, spd: 0, z: 0, vz: 0, ix: 0, iy: 1, air: 0, swing: 0, cool: 0, hurt: 0, walk: 0 },
    projs: [], rings: [], fish: [], packDown: null, skinSeen: 0, xpDay: 0, xpKills: {}, hp: 100, food: 100, water: 100, fuel: 100, fireLvl: 1, wood: 0, stone: 0, iron: 0, toldIron: false, sack: 0, buildings: [], build: null, axe: 0, raw: 0, cooked: 0, skin: 0, smokeT: 0, toldMeat: false, aspawn: 0,
    biome: 'skog', seen: { skog: true }, toldLava: false, shake: 0,
    time: 20, lastPhase: 20, nights: 0, spawn: 0, cause: '', flash: 0
  };
  g.trolls = g.bridges.map((B, i) => makeTrollFor(i));
  g.trex = { x: TRX, y: TRY, hp: 90, max: 90, state: 'roam', t: 2, wa: 0, hit: 0, walk: 0, spd: 0, alive: true, seen: false, hitP: false, respawn: 0 };
  g.goat = { x: VX + VR + 170, y: VY, hp: 60, max: 60, state: 'roam', t: 2, wa: 0, hit: 0, walk: 0, spd: 0, dx: 0, dy: 0, alive: true, seen: false, hitP: false };
  g.eruptT = 5; g.vsmokeT = 0;
  for (let i = 0; i < ANIMAL_COUNT; i++) spawnAnimal(350);
}
//#slutt
//#blokk 0175 spawnAnimal


function spawnAnimal(minPlayer) {
  for (let i = 0; i < 60; i++) {
    const x = rand(80, W - 80), y = rand(80, H - 80), b = biomeAt(x, y);
    if (b !== 'lava' && dist(x, y, FX, FY) > 340 && waterDist(x, y) > 50 && !g.bases.some(B => dist(x, y, B.x, B.y) < 400) && !dcNear(x, y, 800) && pondDist(x, y) > 80 && dist(x, y, g.p.x, g.p.y) > minPlayer) {
      const mix = MIXES[b], type = mix[Math.floor(Math.random() * mix.length)];
      g.animals.push({ type, x, y, hp: ANIMALS[type].hp, dir: rand(0, 6.28), turn: rand(1, 3), idle: false, flee: 0, face: 1, hit: 0, walk: 0 });
      return;
    }
  }
}
//#slutt
//#blokk 0176 CASTLE,WALL_T


// Slottsmurene: dytter deg ut av muren. Porten i sør er åpen.
const CASTLE = 140, WALL_T = 12;
//#slutt
//#blokk 0177 castlePush

function castlePush(o) {
  for (const B of g.bases) {
    const lx = o.x - B.x, ly = o.y - B.y;
    if (Math.abs(lx) > CASTLE + WALL_T || Math.abs(ly) > CASTLE + WALL_T) continue;
    for (const wy of [-CASTLE, CASTLE]) if (Math.abs(ly - wy) < WALL_T && !(wy > 0 && Math.abs(lx) < 26)) o.y = B.y + wy + (ly < wy ? -WALL_T : WALL_T);
    for (const wx of [-CASTLE, CASTLE]) if (Math.abs(lx - wx) < WALL_T) o.x = B.x + wx + (lx < wx ? -WALL_T : WALL_T);
  }
}
//#slutt
//#blokk 0178 bridgeLocal

// ---------- Broer over bekken ----------
function bridgeLocal(B, x, y) { const dx = x - B.x, dy = y - B.y; return { a: dx * B.nx + dy * B.ny, c: dx * B.tx + dy * B.ty }; }
//#slutt
//#blokk 0179 onBridge

function onBridge(x, y) {
  if (!g || !g.bridges) return null;
  for (const B of g.bridges) { const l = bridgeLocal(B, x, y); if (Math.abs(l.c) < 17 && Math.abs(l.a) < 62) return { B, a: l.a }; }
  return null;
}
//#slutt
//#blokk 0180 deckH

const deckH = a => 3 + 10 * Math.cos(Math.min(1, Math.abs(a) / 62) * Math.PI / 2);
//#slutt
//#blokk 0181 surfaceH
   // broen bueer seg
const surfaceH = (x, y) => { const ob = onBridge(x, y); return Math.max(groundH(x, y), ob ? deckH(ob.a) : -1e9, Math.abs(x - TOWNX) < 4000 ? platformH(x, y) : -1e9, pondSurf(x, y)); };
//#slutt
//#blokk 0183 hutPush

function hutPush(o) {   // du kan ikke gå gjennom veggene på hytter
  const rects = g.cabins.map(c => [c.x, c.y]).concat(g.buildings.filter(b => b.type === 'hytte').map(b => [b.x, b.y]));
  for (const [cx, cy] of rects) {
    const lx = o.x - cx, ly = o.y - cy, px = 44 - Math.abs(lx), py = 34 - Math.abs(ly);
    if (px > 0 && py > 0) { if (px < py) o.x = cx + Math.sign(lx || 1) * 44; else o.y = cy + Math.sign(ly || 1) * 34; }
  }
}
//#slutt
//#blokk 0184 lights

function lights() {
  const L = [], R = lightR();
  if (R > 0) L.push({ x: FX, y: FY, r: R, fire: true });
  for (const b of g.buildings) { const B = BUILDINGS[b.type]; if (B.light) L.push({ x: b.x, y: b.y - 20, r: B.light }); }
  for (const c of g.cabins) L.push({ x: c.x, y: c.y + 10, r: 165 });
  return L;
}
//#slutt
//#blokk 0185 inAnyLight

const inAnyLight = (x, y, L, pad = 0) => L.find(l => dist(x, y, l.x, l.y) < l.r + pad);
//#slutt
//#blokk 0186 cap

const cap = () => SACKS[g.packDown ? 0 : g.sack].cap;
//#slutt
//#blokk 0187 addRes
              // sekken satt fra seg = bare lommeplass
function addRes(kind, n) {
  const before = g[kind]; g[kind] = Math.min(cap(), g[kind] + n);
  if (g[kind] - before < n) toast('Sekken din er full! Lag en sekk i verkstedet 🎒');
  return g[kind] - before;
}
//#slutt
//#blokk 0188 afford

const afford = c => Object.keys(c).every(k => g[k] >= c[k]);
//#slutt
//#blokk 0189 pay

const pay = c => { for (const k in c) g[k] -= c[k]; };
//#slutt
//#blokk 0190 costText

const costText = c => Object.keys(c).map(k => `<span class="${g[k] >= c[k] ? '' : 'short'}">${RES[k]} ${c[k]}</span>`).join(' ');
//#slutt
//#blokk 0191 ghostPos


function ghostPos() {
  const p = g.p;
  if (p.view === 'side') return { x: p.x + p.face * 75, y: p.y };
  return p.view === 'down' ? { x: p.x, y: p.y + 75 } : { x: p.x, y: p.y - 55 };
}
//#slutt
//#blokk 0192 canPlace

function canPlace(type, x, y) {
  const r = BUILDINGS[type].r;
  if (x < 50 || x > W - 50 || y < 70 || y > H - 30) return false;
  if (dist(x, y, FX, FY) < 75 * fireScale() + r || waterDist(x, y) < 40 + r) return false;
  if (g.lavaPools.some(l => dist(x, y, l.x, l.y) < l.r + r + 10)) return false;
  if (g.bases.some(b => dist(x, y, b.x, b.y) < 230 + r)) return false;
  if (g.bridges.some(B => dist(x, y, B.x, B.y) < 80 + r) || g.cabins.some(c => dist(x, y, c.x, c.y) < 90 + r)) return false;
  const near = (list, pad, f = () => true) => list.some(o => f(o) && dist(x, y, o.x, o.y) < r + pad);
  if (g.trees.some(t => t.alive && dist(x, y, t.x, t.y) < r + 14 * (t.giant ? 2.5 : 1)) || near(g.rocks, 12, o => o.alive) || near(g.bushes, 16) || near(g.chests, 20)) return false;
  return !g.buildings.some(b => dist(x, y, b.x, b.y) < r + BUILDINGS[b.type].r + 6);
}
//#slutt
//#blokk 0193 placeBuilding

function placeBuilding() {
  const p = g.p, gp = ghostPos(), B = BUILDINGS[g.build];
  if (!canPlace(g.build, gp.x, gp.y)) { toast('Det er ikke plass her. Finn et åpent sted! 🌲'); p.cool = 0.6; return; }
  if (!afford(B.cost)) { toast('Du har ikke nok materialer.'); g.build = null; return; }
  pay(B.cost);
  g.buildings.push({ type: g.build, x: gp.x, y: gp.y }); saveWorld(); if (g.build === 'seng') questAdd('seng');
  burst(gp.x, gp.y - 10, '#c9b48f', 20);
  toast(`Du bygde ${B.art} ${B.n.toLowerCase()}! ${B.icon}`);
  g.build = null; p.cool = 0.5;
}
//#slutt
//#blokk 0194 menuKind


/* ---------- Bygge- og verkstedmeny ---------- */
let menuKind = null;
//#slutt
//#blokk 0195 openMenu

function openMenu(kind) {
  menuKind = kind; state = 'menu';
  resetPointers();                                         // ingen finger, tast eller museknapp «henger» igjen
  renderMenu(); $('menu').hidden = false; $('prompt').hidden = true;
}
//#slutt
//#blokk 0196 closeMenu

function closeMenu() { $('menu').hidden = true; menuKind = null; state = 'play'; resetPointers(); if (g) g.p.cool = Math.max(g.p.cool, 0.3); }
//#slutt
//#blokk 0197 craftRows
   // ingen utilsiktet angrep rett etter at menyen lukkes
// Ting du kan lage med hendene (i ryggsekken og i verkstedet): ryggsekker og fiskestang
function craftRows() {
  const rows = [];
  if (g.sack < SACKS.length - 1) { const S = SACKS[g.sack + 1]; rows.push({ icon: '🎒', n: `Lag ${S.n.toLowerCase()}`, desc: `Bær ${S.cap} av hver ting og ${[2, 6, 12, 20][g.sack + 1]} fisk. Sekken vises på ryggen.`, cost: S.cost, btn: 'Lag', act: 'sack', ok: afford(S.cost) }); }
  if (!hero.owned.includes('stang')) rows.push({ icon: '🎣', n: 'Lag fiskestang', desc: 'Fisk i elva og i innsjøen. Velg den med tast 7.', cost: WEAPONS.stang.cost, btn: 'Lag', act: 'w:stang', ok: afford(WEAPONS.stang.cost) });
  return rows;
}
//#slutt
//#blokk 0198 invGrid

function invGrid() {                                       // oversikt med ikoner: ressurser, fisk og utstyr
  const c = cap(), slot = (ic, n, max, lbl) => `<div class="islot" title="${lbl}"><span class="ii">${ic}</span><b>${n}</b>${max ? `<i style="width:${Math.min(100, n / max * 100)}%"></i>` : ''}</div>`;
  let h = `<div class="invh">${g.sack ? SACKS[g.sack].n : 'Lommene'}${g.packDown ? ' (satt fra deg – hent den!)' : ''} · plass til ${c} av hver ting</div><div class="igrid">`;
  h += slot('🪵', g.wood, c, 'Ved') + slot('🪨', g.stone, c, 'Stein') + slot('🔩', g.iron, c, 'Jern') + slot('🥩', g.raw, 0, 'Rått kjøtt') + slot('🍗', g.cooked, 0, 'Stekt mat') + slot('🟫', g.skin, 0, 'Skinn');
  h += `</div><div class="invh">Fisk ${g.fish.length} / ${fishCap()} <small>(stek fisk på bålet med F)</small></div><div class="igrid">`;
  for (let i = 0; i < fishCap(); i++) { const f = g.fish[i]; h += f ? `<div class="islot fish" title="${FISH[f.t].n}"><span class="ii">${FISH[f.t].icon}</span><b>${FISH[f.t].n}</b><small>${f.cm} cm · ${String(f.kg).replace('.', ',')} kg</small></div>` : '<div class="islot empty"></div>'; }
  h += '</div><div class="invh">Utstyr og våpen</div><div class="igrid">' + WEAPON_SLOTS.filter(id => hero.owned.includes(id)).map(id => `<div class="islot"><span class="ii">${WEAPONS[id].icon}</span><b>${WEAPONS[id].n}</b></div>`).join('') + '</div>';
  return h;
}
//#slutt
//#blokk 0200 menuAction

function menuAction(act) {
  if (act.startsWith('build:')) {
    g.build = act.slice(6); closeMenu();
    toast(isTouch ? 'Gå dit du vil bygge og trykk 🪓' : 'Gå dit du vil bygge og trykk E');
  } else if (act === 'fire') {
    pay(fireCost(g.fireLvl)); g.fireLvl++;
    burst(FX, FY - 20, '#ffb347', 30);
    toast(g.fireLvl === FIRE_MAX ? 'Bålet er på maks nivå 10! 🔥🔥🔥' : `Bålet er nå nivå ${g.fireLvl}! 🔥`); renderMenu();
  } else if (act === 'sack') {
    const S = SACKS[g.sack + 1]; pay(S.cost); g.sack++; g.packDown = null;
    toast(`Du laget en ${S.n.toLowerCase()}! Den sitter på ryggen 🎒`); renderMenu();
  } else if (act === 'packoff') {
    g.packDown = { x: g.p.x - Math.sin(g.p.aim || 0) * 10, y: g.p.y - Math.cos(g.p.aim || 0) * 10 }; toast('Du satte fra deg sekken 🎒 Trykk E ved den for å ta den på igjen.'); renderMenu();
  } else if (act === 'axe') {
    pay(axeCost(g.axe + 1)); g.axe++;
    toast(`Du laget en ${AXES[g.axe].n}! 🪓`); renderMenu();
  } else if (act.startsWith('w:')) {
    const id = act.slice(2); pay(WEAPONS[id].cost); giveWeapon(id); renderMenu();
  } else if (act.startsWith('wup:')) {
    const id = act.slice(4); pay(wupCost(wLvl(id))); hero.wlvl[id] = wLvl(id) + 1; saveHero();
    toast(`${WEAPONS[id].icon} ${WEAPONS[id].n} er nå nivå ${hero.wlvl[id]}!`); renderMenu();
  } else if (act.startsWith('sel:')) { selectWeapon(act.slice(4)); renderMenu(); }
  else if (act === 'cap') { hero.cap = hero.cap === false; saveHero(); if (R3 && R3.player && R3.player.head.userData.cap) setCap(R3.player.head); toast(hero.cap !== false ? '🧢 Capsen er på!' : 'Du tok av capsen.'); renderMenu(); }
  else if (act === 'newworld' && !(g._nyVerden && performance.now() - g._nyVerden < 6000)) { g._nyVerden = performance.now(); toast('⚠️ Det du har bygd blir borte! Trykk «Ny verden» en gang til for å bekrefte.'); }
  else if (act === 'newworld') { world = { v: 1, seed: (Math.random() * 1e9) | 0, buildings: [] }; try { localStorage.setItem(WORLD_KEY, JSON.stringify(world)); } catch (e) {} toast('🌍 Neste gang du starter et nytt spill, får du en helt ny verden!'); renderMenu(); }
}
//#slutt
//#blokk 0201 eat


function eat() {
  const p = g.p;
  if (dist(p.x, p.y, FX, FY) < 95 * fireScale() && g.raw > 0) {
    if (g.fuel <= 0) { toast('Bålet er slukket. Legg på ved først! 🪵'); return; }
    g.raw--; g.cooked++;
    burst(FX, FY - 14, '#ffcf8a', 12); floatText(FX, FY - 55, 'Stekt! 🍗');
    return;
  }
  if (dist(p.x, p.y, FX, FY) < 95 * fireScale() && g.fish.length && g.fuel > 0) {         // grill fisk på bålet
    const f = g.fish.shift(); g.cooked += f.kg > 2 ? 2 : 1; burst(FX, FY - 14, '#ffcf8a', 12); floatText(FX, FY - 55, `Grillet ${FISH[f.t].n.toLowerCase()}! 🍗`); return;
  }
  if (g.food >= 98) { toast('Du er mett! 😋'); return; }
  if (g.cooked > 0) { g.cooked--; g.food = Math.min(100, g.food + 35); floatText(p.x, p.y - 55, 'Nam! 🍗'); return; }
  if (g.raw > 0) {
    g.raw--; g.food = Math.min(100, g.food + 10); g.hp -= 10; p.hurt = 0.5; g.cause = 'raw';
    toast('Æsj, rått kjøtt! 🤢 Stek det på bålet.'); return;
  }
  toast(g.fish.length ? 'Gå til bålet og trykk F for å grille fisken 🐟🔥' : 'Du har ikke noe kjøtt. Jakt på dyr eller fisk! 🦌🎣');
}
//#slutt
//#blokk 0202 phaseInfo


function phaseInfo(t) {
  const p = t % CYCLE; let dark;
  if (p < DAY) dark = 0;
  else if (p < DAY + DUSK) dark = (p - DAY) / DUSK;
  else if (p < DAY + DUSK + NIGHT) dark = 1;
  else dark = 1 - (p - DAY - DUSK - NIGHT) / DAWN;
  return { p, dark, night: p >= DAY + DUSK * 0.5 && p < DAY + DUSK + NIGHT };
}
//#slutt
//#blokk 0203 SKY

// Sol og måne fra SAMME klokke som fasene over (g.time). Som kartet: nord = −z (fremover for kameraet), øst = +x, sør = +z, vest = −x.
// Breddegrad og dag i året styrer banen (80 = vårjevndøgn, 172 = sommer, 266 = høst, 355 = vinter).
const SKY = { lat: 60 * Math.PI / 180, dayOfYear: 110 };
//#slutt
//#blokk 0204 SUNRISE_P,SUNSET_P

const SUNRISE_P = -DAWN * 0.25, SUNSET_P = DAY + DUSK * 0.25;
//#slutt
//#blokk 0205 skyClock
          // sola krysser horisonten midt i soloppgang/skumring
function skyClock(t, out = {}) {
  const p = ((t % CYCLE) + CYCLE) % CYCLE, lat = SKY.lat;
  const decl = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (SKY.dayOfYear - 81) / 365);
  const H0 = Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat) * Math.tan(decl))));   // timevinkel ved soloppgang
  const dayLen = SUNSET_P - SUNRISE_P; let q = p - SUNRISE_P; if (q < 0) q += CYCLE;
  // dag (p fra soloppgang til solnedgang) → timevinkel −H0..H0; natt (resten) → H0..2π−H0. Kontinuerlig rundt hele døgnet.
  const H = q < dayLen ? -H0 + 2 * H0 * q / dayLen : H0 + (2 * Math.PI - 2 * H0) * (q - dayLen) / (CYCLE - dayLen);
  const dir = (h, d) => [-Math.cos(d) * Math.sin(h), Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(h), -(Math.cos(lat) * Math.sin(d) - Math.sin(lat) * Math.cos(d) * Math.cos(h))];
  out.p = p; out.H = H; out.sun = dir(H, decl); out.moon = dir(H + Math.PI - 0.5, -decl * 0.6 - 0.12);  // månen står omtrent motsatt av sola
  out.hour = ((12 + H * 12 / Math.PI) % 24 + 24) % 24;
  return out;
}
//#slutt
//#blokk 0206 skipTime

// Hopp frem i tid på den felles klokka (brukes av utviklerverktøyet, og kan brukes til søvn senere)
function skipTime(toP) {
  const p = phaseInfo(g.time).p; g.time += ((toP - p) % CYCLE + CYCLE) % CYCLE; g.lastPhase = phaseInfo(g.time).p;
  if (!phaseInfo(g.time).night) g.monsters.forEach(m => m.leave = true);
}
//#slutt
//#blokk 0207 DEV_TOOLS

const DEV_TOOLS = false;
//#slutt
//#blokk 0208 DEV
                                   // false = utviklerverktøyet er helt borte
const DEV = { on: false, scale: 1 };
//#slutt
//#blokk 0209 DEV_TIMES

const DEV_TIMES = { morgen: SUNRISE_P + 14, middag: (SUNRISE_P + SUNSET_P) / 2, kveld: SUNSET_P - 9, natt: DAY + DUSK + NIGHT * 0.5 };
//#slutt
//#blokk 0210 FIRE_MAX

// Bålnivå 1–10: høyere nivå gir større lys og lengre brenntid
const FIRE_MAX = 10;
//#slutt
//#blokk 0211 fireScale

const fireScale = () => 1 + (g.fireLvl - 1) * 0.07;
//#slutt
//#blokk 0212 fireCost

const fireCost = L => ({ wood: 3 * L + 2, stone: 2 * L });
//#slutt
//#blokk 0213 lightR

const lightR = () => g.fuel > 0 ? (70 + g.fuel * 2.5) * (1 + (g.fireLvl - 1) * 0.09) : 0;
//#slutt
//#blokk 0214 toastTimer


let toastTimer = 0;
//#slutt
//#blokk 0215 toast

function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); toastTimer = 2.6; }
//#slutt
//#blokk 0216 floatText

function floatText(x, y, txt) { g.fx.push({ x, y, txt, t: 1.2 }); }
//#slutt
//#blokk 0217 burst

function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) g.parts.push({ x, y, vx: rand(-60, 60), vy: rand(-110, -20), t: rand(.4, .8), c: color });
}
//#slutt
//#blokk 0218 target


function target() {
  const p = g.p;
  let best = null, bd = 60;
  for (const v of g.villains) { const d = dist(p.x, p.y, v.x, v.y - 10); if (d < bd + 8) { bd = d; best = { k: 'villain', o: v }; } }
  for (const c of g.cabins) {
    const db = dist(p.x, p.y, c.x + 50, c.y + 16); if (THIRST && db < 42 && db < bd + 10) { bd = db; best = { k: 'barrel', o: c }; }
    const dd = dist(p.x, p.y, c.x - 8, c.y + 38); if (!c.looted && dd < 40 && dd < bd + 10) { bd = dd; best = { k: 'cabin', o: c }; }
  }
  if (g.goat && g.goat.alive) { const d = dist(p.x, p.y, g.goat.x, g.goat.y) - 22; if (d < bd + 8) { bd = d; best = { k: 'goat', o: g.goat }; } }
  if (g.trex && g.trex.alive) { const d = dist(p.x, p.y, g.trex.x, g.trex.y) - 42; if (d < bd + 8) { bd = d; best = { k: 'trex', o: g.trex }; } }
  for (const tr of g.trolls) { const d = dist(p.x, p.y, tr.x, tr.y) - 18; if (d < bd + 8) { bd = d; best = { k: 'troll', o: tr }; } }
  if (g.shark && g.shark.st !== 'gone') { const d = dist(p.x, p.y, g.shark.x, g.shark.y) - 30; if (d < bd + 8) { bd = d; best = { k: 'shark', o: g.shark }; } }
  if (g.dc && g.dc.pf >= 0) for (const e of enemiesNear(p.x, p.y, 220)) if (e.k[0] === 'd') { const d = dist(p.x, p.y, e.o.x, e.o.y) - e.r + 13; if (d < bd + 8) { bd = d; best = { k: e.k, o: e.o }; } }
  for (const a of g.animals) {
    if (a.tame) continue;
    const d = dist(p.x, p.y, a.x, a.y - 10 * ANIMALS[a.type].size);
    if (d < bd + 10 * ANIMALS[a.type].size) { bd = d; best = { k: 'animal', o: a }; }
  }
  if (best) return best;
  if (g.packDown && dist(p.x, p.y, g.packDown.x, g.packDown.y) < 45) return { k: 'pack' };
  if (g.gh && !g.gh.wand && dist(p.x, p.y, GHX + GH_PED.x, GHY + GH_PED.y) < 48) return { k: 'wand' };
  if (g.dc && g.dc.pf === 2) for (const c of g.dc.chests) if (c.show && !c.open && dist(p.x, p.y, c.x, c.y) < 60) return { k: 'dchest', o: c };
  if (g.town && !g.ride) {
    const tr = g.town.train, c = trackPos(tr.s - CAR_COACH);
    if (tr.st === 'wait' && dist(p.x, p.y, c.x, c.y) < 140) return { k: 'board' };
    for (const n of TOWN_NPCS) if (dist(p.x, p.y, tX(n.x), tY(n.y)) < 75) return { k: 'npc', o: n };
  }
  if (dist(p.x, p.y, FX, FY) < 95 * fireScale()) return { k: 'fire' };
  best = null;
  bd = 62;
  for (const t of g.trees) if (t.alive) { const d = dist(p.x, p.y, t.x, t.y - 6) - (t.giant ? 14 : 0); if (d < bd) { bd = d; best = { k: 'tree', o: t }; } }
  for (const b of g.bushes) if (b.berries > 0) { const d = dist(p.x, p.y, b.x, b.y); if (d < bd) { bd = d; best = { k: 'bush', o: b }; } }
  for (const r of g.rocks) if (r.alive) { const d = dist(p.x, p.y, r.x, r.y - 6); if (d < bd) { bd = d; best = { k: 'rock', o: r }; } }
  for (const b of g.buildings) if (b.type === 'seng') { const d = dist(p.x, p.y, b.x, b.y); if (d < 58 && d < bd + 20) { bd = d; best = { k: 'bed', o: b }; } }
  for (const b of g.buildings) if (b.type === 'verksted') { const d = dist(p.x, p.y, b.x, b.y - 10); if (d < 75 && d < bd + 20) { bd = d; best = { k: 'workshop', o: b }; } }
  for (const c of g.chests) if (!c.open) { const d = dist(p.x, p.y, c.x, c.y - 8); if (d < bd) { bd = d; best = { k: 'chest', o: c }; } }
  for (const B of g.bases) if (!B.looted) { const d = dist(p.x, p.y, B.x, B.y); if (d < bd + 10) { bd = d; best = { k: 'basechest', o: B }; } }
  if (THIRST && !best && waterDist(p.x, p.y) < 42 && biomeW(p.x, p.y).lava < 0.5 && !onBridge(p.x, p.y)) return { k: 'water' };
  return best;
}
//#slutt
//#blokk 0219 SWING,IMPACT


// Hugg: øksa løftes, og treffet skjer først når øksa kommer ned (IMPACT sekunder etter at du trykker)
const SWING = 0.5, IMPACT = 0.22;
//#slutt
//#blokk 0220 AC

let AC = null;
//#slutt
//#blokk 0221 sfx

function sfx(kind) {   // enkle lyder laget med Web Audio, ingen lydfiler
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    const tone = (f1, f2, dur, type = 'sine', gain = .2, delay = 0) => {
      const t = AC.currentTime + delay, o = AC.createOscillator(), og = AC.createGain(); o.type = type;
      o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      og.gain.setValueAtTime(gain, t); og.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(og); og.connect(AC.destination); o.start(t); o.stop(t + dur + .02);
    };
    if (kind === 'levelup') { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .25, 'triangle', .15, i * .09)); return; }
    if (kind === 'select') { tone(900, 1200, .06, 'square', .05); return; }
    if (kind === 'jump') { tone(260, 520, .12, 'sine', .06); return; }
    if (kind === 'roar') { tone(110, 55, 1.0, 'sawtooth', .22); tone(165, 70, .9, 'square', .06, .05); }
    if (kind === 'magic') { tone(500, 1500, .3, 'sine', .14); tone(750, 2200, .25, 'triangle', .06, .03); return; }
    if (kind === 'sparkle') { tone(1800, 2600, .15, 'sine', .08); tone(2400, 3200, .12, 'sine', .05, .04); return; }
    if (kind === 'draw') { tone(140, 220, .45, 'sawtooth', .025); return; }
    if (kind === 'bow') { tone(330, 180, .18, 'triangle', .2); }
    if (kind === 'whistle') { tone(620, 640, .5, 'triangle', .12); tone(780, 800, .5, 'triangle', .08); tone(620, 600, .35, 'triangle', .1, .55); return; }
    if (kind === 'chug') { tone(70, 50, .14, 'sawtooth', .05); return; }
    if (kind === 'saw') { tone(95, 120, .45, 'sawtooth', .1); tone(190, 240, .45, 'square', .035); tone(140, 90, .3, 'sawtooth', .06, .35); return; }
    const t0 = AC.currentTime, len = kind === 'roar' ? 1.0 : kind === 'fall' || kind === 'boom' ? 0.7 : kind === 'crack' ? 0.35 : 0.18;
    const buf = AC.createBuffer(1, Math.floor(AC.sampleRate * len), AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, kind === 'fall' ? 2 : 4);
    const src = AC.createBufferSource(); src.buffer = buf;
    const f = AC.createBiquadFilter(); f.type = kind === 'rock' ? 'bandpass' : 'lowpass';
    f.frequency.value = { roar: 260, tree: 900, rock: 2600, animal: 420, villain: 1500, fall: 280, crack: 1300, swish: 3200, sword: 4800, spear: 2300, bow: 3000, thunk: 650, boom: 200, hit: 1300 }[kind] || 800;
    const gn = AC.createGain(); gn.gain.value = { roar: .9, tree: .5, rock: .35, animal: .5, villain: .4, fall: .7, crack: .35, swish: .1, sword: .14, spear: .12, bow: .08, thunk: .4, boom: .8, hit: .35 }[kind] || .3;
    src.connect(f); f.connect(gn); gn.connect(AC.destination); src.start(t0);
    const tn = { tree: 170, rock: 1800, villain: 900, fall: 70, boom: 55 }[kind];
    if (tn) {
      const o = AC.createOscillator(), og = AC.createGain(); o.frequency.value = tn;
      og.gain.setValueAtTime(kind === 'rock' ? .12 : .3, t0); og.gain.exponentialRampToValueAtTime(.001, t0 + (kind === 'fall' || kind === 'boom' ? .5 : .2));
      o.connect(og); og.connect(AC.destination); o.start(t0); o.stop(t0 + .5);
    }
  } catch (e) {}
}
//#slutt
//#blokk 0222 USE_K

// Bruk (E / ✋): gjør noe med det du står ved. Er det ingenting å bruke, angriper E (så tastaturet alene fortsatt holder).
const USE_K = { dchest: 1, board: 1, npc: 1, bed: 1, wand: 1, pack: 1, fire: 1, water: 1, barrel: 1, cabin: 1, basechest: 1, chest: 1, bush: 1, workshop: 1 };
//#slutt
//#blokk 0223 useTarget

function useTarget() { const t = target(); return t && USE_K[t.k] ? t : null; }
//#slutt
//#blokk 0224 act

function act() {
  const p = g.p;
  if (p.cool > 0 || p.z > 0 || p.impact) return;
  if (g.build) { placeBuilding(); return; }
  const u = useTarget(); if (u && !(u.k === 'water' && curW() === 'stang')) { actNow(u); return; }   // med fiskestang betyr E ved vannet «fisk»
  attack();
}
//#slutt
//#blokk 0225 attack

// Angrep (venstre musknapp / angrepsknappen): bruker valgt våpen. Hugger trær og stein med øksa.
function attack() {
  const p = g.p;
  if (p.cool > 0 || p.z > 0 || p.impact) return;
  if (g.build) { placeBuilding(); return; }
  const id = curW(), Wp = WEAPONS[id];
  if (Wp.kind === 'rod') return;                                   // fiskestanga styres av updateFishing
  if (Wp.kind === 'lasso') { throwLasso(); return; }
  const t = target();
  const fight = t && ENEMY_K[t.k], res = t && (t.k === 'tree' || t.k === 'rock') && Wp.kind === 'melee';      // bue og stav skyter forbi trær og steiner
  const foe = !fight && !res ? nearestEnemyInCone(p.x, p.y, Math.atan2(p.ix, p.iy), 0.7, Wp.range || Wp.reach + 20) : null, danger = !!foe;
  if (res && !Wp.tool && Wp.kind === 'melee') { if (!(p.hintT > 0)) { toast('Bytt til øksa (tast 1) for å hugge 🪓'); p.hintT = 2.5; } p.cool = 0.3; return; }
  if (Wp.kind === 'bow') { p.wantDraw = true; return; }            // buen trekkes så lenge du holder inne (se update)
  p.aim = aimAngle(Wp, fight || res ? t.o : danger ? foe.o : null);
  p.wid = id; p.swing = Wp.cd; p.swingDur = Wp.cd; p.cool = Wp.cd; p.impact = { t: Wp.impact, tg: t, w: id };
  sfx(Wp.snd);
}
//#slutt
//#blokk 0226 ENEMY_K

// Felles skade for alle fiender (brukes av alle våpen). src = hvor slaget kom fra, push = tilbakeslag, banish = lys-magi
const ENEMY_K = { bandit: 1, animal: 1, villain: 1, troll: 1, goat: 1, trex: 1, dskel: 1, dtri: 1, dboss: 1, shark: 1 };
//#slutt
//#blokk 0227 damageEnemy

function damageEnemy(k, o, dmg, src) {
  if (k === 'bandit') { banditHit(o, dmg, src); return; }
  if (k === 'dskel' || k === 'dtri' || k === 'dboss') { dcDamage(k, o, dmg, src); return; }
  if (k === 'shark') { sharkDamage(o, dmg, src); return; }
  const push = (len) => { const kx = o.x - src.x, ky = o.y - src.y, kl = Math.hypot(kx, ky) || 1; o.x += kx / kl * len; o.y += ky / kl * len; };
  if (k === 'villain') {
    const v = o; if (!g.villains.includes(v)) return;
    v.hp -= dmg; v.hit = 0.2; push(src.push || 16); burst(v.x, v.y - 20, '#ffffff', 5);
    if (v.hp <= 0) {
      g.villains = g.villains.filter(q => q !== v);
      burst(v.x, v.y - 15, '#ece6d2', 22); floatText(v.x, v.y - 40, 'Skjelettet falt sammen! 💀');
      if (!g.villains.some(q => q.base === v.base)) { g.bases[v.base].cleared = true; toast('🏳️ Du tok over slottet! Åpne skattekisten!'); }
      enemyXP('villain', v.x, v.y); questAdd('skjelett');
    }
  } else if (k === 'goat') {
    const gt = o; if (!gt.alive) return; const tired = gt.state === 'tired';
    gt.hp -= dmg * (tired ? 2 : 1); gt.hit = 0.2; burst(gt.x, gt.y - 30, '#ffffff', 6);
    if (tired) floatText(gt.x, gt.y - 70, 'Dobbel skade! 💥');
    if (gt.hp <= 0) {
      gt.alive = false; addRes('iron', 8); g.skin += 4; g.cooked += 3; burst(gt.x, gt.y - 20, '#f3ead6', 30);
      toast('🐐 Den slemme geita ga seg og løp hjem til fjellet! Du fikk 🔩 jern, 🟫 skinn og 🍗 mat.');
      enemyXP('goat', gt.x, gt.y);
    }
  } else if (k === 'trex') {
    const tx = o; if (!tx.alive) return; const tired = tx.state === 'tired';
    tx.hp -= dmg * (tired ? 2 : 1); tx.hit = 0.2; burst(tx.x, tx.y - 60, '#ffffff', 8);
    if (tired) floatText(tx.x, tx.y - 130, 'Dobbel skade! 💥');
    if (tx.state === 'roam') { tx.state = 'roar'; tx.t = 0.6; sfx('roar'); }
    if (tx.hp <= 0) {
      tx.alive = false; tx.respawn = 240; g.raw += 8; g.skin += 5; g.shake = 0.4;
      burst(tx.x, tx.y - 40, '#cfe0a0', 36);
      toast('🦖 T-rexen ga seg og stampet av gårde inn i jungelen! Du fikk 🥩 +8 og 🟫 +5 skinn. (Den kommer tilbake senere…)');
      enemyXP('trex', tx.x, tx.y);
    }
  } else if (k === 'troll') {
    const tr = o; if (!g.trolls.includes(tr)) return; const B = g.bridges[tr.bridge];
    tr.hp -= dmg; tr.hit = 0.2; tr.awake = true; push(src.push ? src.push * 0.6 : 8);
    burst(tr.x, tr.y - 30, '#ffffff', 6);
    if (tr.hp <= 0) {
      g.trolls = g.trolls.filter(q => q !== tr); B.trollT = 300;
      burst(B.x, B.y, B.lava ? '#ff8a3a' : '#bfe6f7', 30); g.shake = 0.3;
      addRes('iron', 4); addRes('stone', 6); g.skin += 2;
      floatText(tr.x, tr.y - 60, '+4 🔩  +6 🪨  +2 skinn');
      toast(B.lava ? 'Trollet plumpet i lavaen og ble borte! 🔥' : 'Trollet plumpet i bekken og ble borte! 💦');
      enemyXP('troll', tr.x, tr.y); questAdd('troll');
    }
  } else if (k === 'animal') {
    const a = o; if (!g.animals.includes(a)) return; const A = ANIMALS[a.type];
    a.hp -= dmg; a.hit = 0.2; if (!A.hostile) a.flee = 3;
    push(src.push || 14); burst(a.x, a.y - 14, '#ffffff', 5);
    if (a.hp <= 0) {
      g.animals = g.animals.filter(q => q !== a);
      g.raw += A.meat; g.skin += A.skin;
      burst(a.x, a.y - 10, '#cfc6b8', 14);
      floatText(a.x, a.y - 34, `+${A.meat} 🥩  +${A.skin} skinn`);
      if (!g.toldMeat) { g.toldMeat = true; toast(isTouch ? 'Gå til bålet og trykk 🍖 for å steke kjøttet!' : 'Gå til bålet og trykk F for å steke kjøttet! 🔥'); }
      if (A.hostile) enemyXP(a.type, a.x, a.y);
    }
  } else if (k === 'monster') {                           // monstrene er udødelige: de dyttes unna og flykter, og lys-magi jager dem bort
    const m = o; if (m.leave) return;
    m.hit = 0.25; m.flee = 1.4; push(src.push ? src.push * 2.5 : 40); burst(m.x, m.y - 30, '#b9a6ff', 6);
    if (src.banish) { m.leave = true; m.a = Math.min(m.a, 0.8); floatText(m.x, m.y - 60, 'Puff! Monsteret forsvant ✨'); burst(m.x, m.y - 30, '#fff3b0', 16); enemyXP('monster', m.x, m.y); }
  }
}
//#slutt
//#blokk 0228 enemiesNear

// Alt som kan angripes nær (x, y): treffradius r og høyde h brukes av nærkamp og prosjektiler
function enemiesNear(x, y, R) {
  const out = [], inB = o => Math.abs(o.x - x) < R && Math.abs(o.y - y) < R;
  for (const a of g.animals) if (inB(a) && !a.tame) { const s = ANIMALS[a.type].size; out.push({ k: 'animal', o: a, r: 14 * s + 4, h: 32 * s + 10 }); }
  for (const v of g.villains) if (inB(v)) out.push({ k: 'villain', o: v, r: 13, h: 60 });
  if (g.town && g.town.sheriffTalked) for (const b of g.town.bandits) if (!b.gone && inB(b)) out.push({ k: 'bandit', o: b, r: 14, h: 70 });
  for (const tr of g.trolls) if (inB(tr)) out.push({ k: 'troll', o: tr, r: 24, h: 85 });
  if (g.goat && g.goat.alive && inB(g.goat)) out.push({ k: 'goat', o: g.goat, r: 26, h: 50 });
  if (g.trex && g.trex.alive && inB(g.trex)) out.push({ k: 'trex', o: g.trex, r: 44, h: 140 });
  for (const m of g.monsters) if (!m.leave && m.a > 0.3 && inB(m)) out.push({ k: 'monster', o: m, r: 18, h: 60 });
  if (g.shark && g.shark.st !== 'gone' && inB(g.shark)) out.push({ k: 'shark', o: g.shark, r: 34, h: 45 });
  const D = g.dc;                                                       // i Beinslottet: bare fiendene i etasjen du er i
  if (D && D.pf === 0) for (const s of D.sk) if (inB(s)) out.push({ k: 'dskel', o: s, r: 13, h: 60 });
  if (D && D.pf === 1) for (const t of D.tri) if (inB(t)) out.push({ k: 'dtri', o: t, r: 46, h: 110 });
  if (D && D.pf === 2 && D.boss.alive && inB(D.boss)) out.push({ k: 'dboss', o: D.boss, r: 80, h: 260 });
  return out;
}
//#slutt
//#blokk 0229 angDiff

const angDiff = (a, b) => { const d = a - b; return Math.atan2(Math.sin(d), Math.cos(d)); };
//#slutt
//#blokk 0230 nearestEnemyInCone

function nearestEnemyInCone(x, y, ang, half, range) {
  let best = null, bd = 1e9;
  for (const e of enemiesNear(x, y, range)) {
    const d = dist(x, y, e.o.x, e.o.y); if (d > range || Math.abs(angDiff(Math.atan2(e.o.x - x, e.o.y - y), ang)) > half) continue;
    const sc = d * (e.k === 'animal' && !ANIMALS[e.o.type].hostile ? 1.6 : 1);          // farlige fiender først
    if (sc < bd) { bd = sc; best = e; }
  }
  return best;
}
//#slutt
//#blokk 0231 MOUSE

// Siktet: musa (PC) eller hjelp til å treffe nærmeste fiende i retningen du ser
const MOUSE = { on: false, down: false, sx: 0, sy: 0, wx: null, wy: null };
//#slutt
//#blokk 0232 MLOOK

// Musestyring som i et skytespill (v5.3, PC): klikk i spillet, så styrer musa hvilken vei du ser. Esc gir pause (v5.6).
const MLOOK = { fail: false, forced: false, told: false, sens: 0.35 };
//#slutt
//#blokk 0233 PLOCK

const PLOCK = () => MLOOK.forced || (!!document.pointerLockElement && document.pointerLockElement === cv);
//#slutt
//#blokk 0234 camAim

const camAim = () => (R3 ? R3.camYaw : 0) + Math.PI;
//#slutt
//#blokk 0235 aimAngle
                  // retningen kameraet ser (i spillets vinkel)
function aimAngle(W, o) {
  const p = g.p;
  if (PLOCK()) {                                                       // sikt dit du ser – med litt hjelp mot en fiende rett foran trådkorset
    const a = camAim(); if (o && Math.abs(angDiff(Math.atan2(o.x - p.x, o.y - p.y), a)) < 0.45) return Math.atan2(o.x - p.x, o.y - p.y);
    const tg = nearestEnemyInCone(p.x, p.y, a, 0.22, W.range || W.reach + 50); return tg ? Math.atan2(tg.o.x - p.x, tg.o.y - p.y) : a;
  }
  if (MOUSE.on && MOUSE.wx !== null && (W.kind !== 'melee' || MOUSE.down)) return Math.atan2(MOUSE.wx - p.x, MOUSE.wy - p.y);
  if (o) return Math.atan2(o.x - p.x, o.y - p.y);
  const base = Math.atan2(p.ix, p.iy), tg = nearestEnemyInCone(p.x, p.y, base, 0.7, W.range || W.reach + 50);
  return tg ? Math.atan2(tg.o.x - p.x, tg.o.y - p.y) : base;
}
//#slutt
//#blokk 0236 meleeHit

function meleeHit(id, pref) {
  const p = g.p, W = WEAPONS[id], dmg = weaponDmg(id);
  const cx = W.aoe ? p.x + Math.sin(p.aim) * 50 : p.x, cy = W.aoe ? p.y + Math.cos(p.aim) * 50 : p.y;
  const list = enemiesNear(cx, cy, (W.aoe || W.reach) + 40).map(e => Object.assign(e, { d: dist(cx, cy, e.o.x, e.o.y), da: angDiff(Math.atan2(e.o.x - p.x, e.o.y - p.y), p.aim) }))
    .filter(e => W.aoe ? e.d - e.r < W.aoe : e.d - e.r < W.reach && Math.abs(e.da) < W.arc / 2 + Math.atan2(e.r, Math.max(1, e.d)))
    .sort((a, b) => (a.o === pref ? -1 : b.o === pref ? 1 : a.d - b.d)).slice(0, W.max);
  for (const e of list) damageEnemy(e.k, e.o, dmg, { x: p.x, y: p.y, banish: W.banish, push: W.aoe ? 30 : id === 'spyd' ? 22 : 14 });
  if (W.aoe) flameRing(cx, cy);
  if (list.length) sfx(list[0].k === 'villain' ? 'villain' : 'hit');
  return list.length;
}
//#slutt
//#blokk 0237 flameRing

function flameRing(x, y) {
  (g.rings = g.rings || []).push({ x, y, t: 0.55 }); g.shake = Math.max(g.shake, 0.3);
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; g.parts.push({ x: x + Math.cos(a) * 20, y: y + Math.sin(a) * 20, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160 - 60, t: rand(.35, .6), c: i % 2 ? '#ff7a2a' : '#ffd36b' }); }
}
//#slutt
//#blokk 0238 shootProj

// Prosjektiler: piler (faller litt, setter seg fast) og magi (rett frem, søker svakt mot fiender). Maks 40 samtidig.
function shootProj(id, power = 1) {
  const p = g.p, W = WEAPONS[id], a = p.aim, sp = W.speed * (0.6 + 0.4 * power);
  g.projs = g.projs || []; if (g.projs.length >= 40) g.projs.shift();
  const isBow = W.kind === 'bow';
  g.projs.push({ kind: isBow ? 'arrow' : 'magic', x: p.x + Math.sin(a) * 16, y: p.y + Math.cos(a) * 16, z: 40 + p.z, vx: Math.sin(a) * sp, vy: Math.cos(a) * sp,
    vz: isBow ? 75 * power : 0, dmg: weaponDmg(id) * (isBow ? 0.5 + 0.5 * power : 1), life: W.range / sp, banish: !!W.banish, homing: id === 'stav' || id === 'heksestav', witch: !!W.witch, stuck: 0, done: false });
  sfx(W.snd);
}
//#slutt
//#blokk 0239 projBlocked

function projBlocked(q) {
  for (const t of g.trees) if (t.alive && Math.abs(t.x - q.x) < 16 && Math.abs(t.y - q.y) < 16 && dist(t.x, t.y, q.x, q.y) < (t.giant ? 14 : 7) * treeWK(t) && q.z < (t.giant ? 300 : 120) * treeHK(t)) return true;
  for (const r of g.rocks) if (r.alive && Math.abs(r.x - q.x) < 20 && Math.abs(r.y - q.y) < 20 && dist(r.x, r.y, q.x, q.y) < 9 * r.s && q.z < 14 * r.s) return true;
  if (q.z < 200) { const o = { x: q.x, y: q.y }; if (q.z < 90) { castlePush(o); hutPush(o); } pyrPush(o); if (o.x !== q.x || o.y !== q.y) return true; }
  if (dcFoot(q.x, q.y, 14) && !dcFoot(q.x, q.y, -12) && !(Math.abs(q.x - DCX) < DC_GATE - 8 && q.y > DCY && !(g.dc && g.dc.pf > 0))) return true;   // slottsmurene
  return false;
}
//#slutt
//#blokk 0240 projFx

function projFx(q, hitEnemy) {
  if (q.kind === 'arrow') { burst(q.x, q.y - q.z * 0.5, hitEnemy ? '#ffffff' : '#c9a77a', 5); sfx('thunk'); }
  else { burst(q.x, q.y - q.z * 0.5, q.witch ? '#9dff7a' : '#c9a6ff', 8); burst(q.x, q.y - q.z * 0.5, q.witch ? '#d08bff' : '#9ff3ff', 6); sfx('sparkle'); }
}
//#slutt
//#blokk 0241 updateProjs

function updateProjs(dt) {
  if (g.rings) { for (const r of g.rings) r.t -= dt; g.rings = g.rings.filter(r => r.t > 0); }
  if (!g.projs || !g.projs.length) return;
  for (const q of g.projs) {
    if (q.stuck > 0) { if ((q.stuck -= dt) <= 0) q.done = true; continue; }
    if (q.homing) {                                              // magien bøyer svakt mot nærmeste fiende foran seg
      const tg = nearestEnemyInCone(q.x, q.y, Math.atan2(q.vx, q.vy), 0.45, 260);
      if (tg) { const sp = Math.hypot(q.vx, q.vy), a0 = Math.atan2(q.vx, q.vy), a1 = a0 + clamp(angDiff(Math.atan2(tg.o.x - q.x, tg.o.y - q.y), a0), -2.5 * dt, 2.5 * dt); q.vx = Math.sin(a1) * sp; q.vy = Math.cos(a1) * sp; }
    }
    const N = 3, h = dt / N;                                     // små steg, så raske piler ikke hopper over fiender
    for (let s2 = 0; s2 < N && !q.done && !(q.stuck > 0); s2++) {
      q.x += q.vx * h; q.y += q.vy * h; if (q.kind === 'arrow') q.vz -= 260 * h; q.z += q.vz * h; q.life -= h;
      for (const e of enemiesNear(q.x, q.y, 50)) if (dist(q.x, q.y, e.o.x, e.o.y) < e.r && q.z < e.h + 10) {
        damageEnemy(e.k, e.o, q.dmg, { x: q.x - q.vx * 0.05, y: q.y - q.vy * 0.05, banish: q.banish, push: 12 }); projFx(q, true); q.done = true; break;
      }
      if (q.done) break;
      if (q.z <= 0 || q.life <= 0 || q.x < 0 || q.y < 0 || q.x > W || q.y > H) { if (q.kind === 'arrow' && q.z <= 0) { q.z = 0; q.stuck = 3; projFx(q); } else { if (q.kind === 'magic') projFx(q); q.done = true; } break; }
      if (projBlocked(q)) { projFx(q); if (q.kind === 'arrow') q.stuck = 3; else q.done = true; break; }
    }
  }
  g.projs = g.projs.filter(q => !q.done);
}
//#slutt
//#blokk 0242 hitFx

function hitFx(t) {
  const o = t.o;
  if (curW() === 'oks' && AXES[g.axe].saw && (t.k === 'tree' || t.k === 'rock')) sfx('saw');
  if (t.k === 'tree') { burst(o.x, o.y - 12, '#d9b07a', 8); burst(o.x, o.y - 40, '#5f9e45', 6); sfx('tree'); }
  else if (t.k === 'rock') { burst(o.x, o.y - 10, o.ore ? '#e08a4a' : '#d6d9d4', 8); burst(o.x, o.y - 12, '#fff6c0', 4); g.shake = Math.max(g.shake, 0.05); sfx('rock'); }
  else sfx(t.k === 'troll' || t.k === 'goat' ? 'animal' : t.k);
}
//#slutt
//#blokk 0243 actNow

function actNow(t) {
  const p = g.p;
  p.cool = Math.max(p.cool, 0.28);
  if (t.k === 'fire') {
    if (g.wood <= 0) { toast('Du har ingen ved. Hugg et tre! 🌲'); p.cool = 0.8; return; }
    if (g.fuel >= 99) { toast('Bålet brenner for fullt! 🔥'); p.cool = 0.8; return; }
    g.wood--; g.fuel = Math.min(100, g.fuel + 20);
    burst(FX, FY - 10, '#ffb347', 10);
  } else if (t.k === 'water') {
    if (g.water >= 98) { toast('Du er ikke tørst. 💧'); p.cool = 0.8; return; }
    g.water = Math.min(100, g.water + 25); p.cool = 0.35;
    burst(p.x + p.face * 14, p.y - 6, '#9fd3ef', 8); floatText(p.x, p.y - 55, '+💧');
  } else if (t.k === 'villain' || t.k === 'goat' || t.k === 'troll') {
    damageEnemy(t.k, t.o, AXES[g.axe].p, { x: p.x, y: p.y });
  } else if (t.k === 'barrel') {
    if (g.water >= 98) { toast('Du er ikke tørst. 💧'); p.cool = 0.8; return; }
    g.water = Math.min(100, g.water + 35); p.cool = 0.4;
    burst(t.o.x + 50, t.o.y + 10, '#9fd3ef', 8); floatText(p.x, p.y - 55, '+💧');
  } else if (t.k === 'cabin') {
    const c = t.o; c.looted = true;
    const wood = addRes('wood', 6); g.cooked += 2; let msg = `Du fant forsyninger i hytta! 🍗 +2  🪵 +${wood}`;
    if (Math.random() < 0.5) { const n = addRes('iron', 2); msg += `  🔩 +${n}`; }
    burst(c.x - 8, c.y + 30, '#ffd54a', 14); toast(msg);
  } else if (t.k === 'basechest') {
    const B = t.o;
    if (!B.cleared) { toast('Kisten er låst! 🔒 Knus alle skjelettene først.'); p.cool = 0.8; return; }
    B.looted = true; addRes('iron', 6); g.cooked += 2; g.skin += 3;
    g.bases.forEach(b => b.known = true);
    burst(B.x, B.y - 14, '#ffd54a', 26);
    const sw = giveWeapon('sverd', true);
    toast('Skatt! 🔩 Jern, 🍗 mat, 🟫 skinn og et kart over alle slottene! 🗺️' + (sw ? ' Og et 🗡️ SVERD! (tast 2)' : '')); addXP(20, B.x, B.y);
  } else if (t.k === 'animal') {
    damageEnemy('animal', t.o, AXES[g.axe].p, { x: p.x, y: p.y });
  } else if (t.k === 'tree') {
    const o = t.o; p.face = o.x >= p.x ? 1 : -1;
    o.hp -= AXES[g.axe].p; o.shake = 0.2; p.view = 'side';
    burst(o.x, o.y - 8, '#c08a55', 4);
    if (o.hp <= 0) { o.alive = false; o.regrow = o.giant ? TREE_REGROW * 2 : TREE_REGROW; const n = addRes('wood', o.giant ? 10 : 3); if (n) floatText(o.x, o.y - 30, `+${n} 🪵`); if (o.giant) toast('Tømmer! Kjempegrana falt! 🌲'); }
  } else if (t.k === 'rock') {
    const o = t.o; p.face = o.x >= p.x ? 1 : -1; p.view = 'side';
    o.hp -= AXES[g.axe].p; burst(o.x, o.y - 8, '#a9ada6', 5);
    if (o.hp <= 0) {
      o.alive = false; o.regrow = o.ore ? 200 : 120;
      if (o.ore) {
        const n = addRes('iron', 2); if (n) floatText(o.x, o.y - 26, `+${n} 🔩`);
        if (!g.toldIron) { g.toldIron = true; toast('Du fant jern! 🔩 Bruk det i verkstedet.'); }
      } else { const n = addRes('stone', 3); if (n) floatText(o.x, o.y - 26, `+${n} 🪨`); }
    }
  } else if (t.k === 'board') {
    startRide();
  } else if (t.k === 'npc') {
    talkNpc(t.o);
  } else if (t.k === 'bed') {
    goSleep(t.o);
  } else if (t.k === 'wand') {
    takeWand();
  } else if (t.k === 'dchest') {
    dcOpenChest(t.o);
  } else if (t.k === 'pack') {
    g.packDown = null; toast('Sekken er på ryggen igjen 🎒');
  } else if (t.k === 'workshop') {
    openMenu('craft');
  } else if (t.k === 'bush') {
    const o = t.o; o.berries--; o.t = 0;
    g.food = Math.min(100, g.food + 18);
    floatText(o.x, o.y - 24, '+🍓');
  } else if (t.k === 'chest' && t.o.desert) {
    const o = t.o; o.open = true; burst(o.x, o.y - 14, '#ffb347', 30); g.shake = 0.2;
    const got = giveWeapon('hammer', true), ni = addRes('iron', 6);
    toast(got ? `🏜️ Pyramideskatten! Du fant 🔨 FLAMMEHAMMEREN! (tast 6${heroLevel().L < 5 ? ', kan brukes fra nivå 5' : ''})  🔩 +${ni}` : `🏜️ Pyramideskatt! 🔩 +${ni} jern`);
    addXP(40, o.x, o.y);
  } else if (t.k === 'chest' && t.o.volcano) {
    const o = t.o; o.open = true;
    burst(o.x, o.y - 14, '#ff9a3c', 20);
    const ni = addRes('iron', 5), ns = addRes('stone', 5); g.cooked += 1;
    const st = giveWeapon('stav', true);
    toast(`Vulkanskatt! 🌋  🔩 +${ni}  🪨 +${ns}  🍗 +1` + (st ? ` Og en 🪄 MAGISK STAV! (tast 5${heroLevel().L < 3 ? ', fra nivå 3' : ''})` : '')); questAdd('vulkan');
  } else if (t.k === 'chest') {
    const o = t.o; o.open = true;
    burst(o.x, o.y - 14, '#ffd54a', 16);
    addXP(5, o.x, o.y); openLootChest(o);
  }
}
//#slutt
//#blokk 0244 LOOT



// ---------- Tilfeldige skatter i kistene ----------
// Hver kiste trekker én ting fra lista. Noen ting er bedre enn det du har, andre dårligere (da gjør du dem om til noe nyttig).
const LOOT = [
  { w: 22, f: () => { const n = addRes('wood', 4 + (Math.random() * 7 | 0)), m = addRes('stone', 3 + (Math.random() * 5 | 0)); return ['🪵 Ved og stein', `🪵 +${n}  🪨 +${m}`, 'Vanlig']; } },
  { w: 13, f: () => { const n = addRes('iron', 2 + (Math.random() * 5 | 0)); return ['🔩 Jern', `🔩 +${n}`, 'Uvanlig']; } },
  { w: 11, f: () => { const n = 1 + (Math.random() * 3 | 0); g.cooked += n; return ['🍗 Mat', `🍗 +${n} stekt kjøtt`, 'Vanlig']; } },
  { w: 9, f: () => { const n = 1 + (Math.random() * 3 | 0); g.skin += n; return ['🟫 Skinn', `🟫 +${n} skinn`, 'Vanlig']; } },
  { w: 9, f: () => { const n = 15 + (Math.random() * 30 | 0); addXP(n, g.p.x, g.p.y); return ['⭐ Gammel skattebok', `+${n} XP`, 'Uvanlig']; } },
  { w: 26, f: () => {                                                         // en øks – kan være bedre eller dårligere enn din
      const W8 = [22, 30, 25, 15, 8]; let r = Math.random() * W8.reduce((a, b) => a + b), tier = 0; for (; tier < W8.length - 1; tier++) { r -= W8[tier]; if (r <= 0) break; }
      const A = AXES[tier], rar = ['Vanlig', 'Vanlig', 'Uvanlig', 'Sjelden', 'Episk'][tier], ic = A.saw ? '🪚' : '🪓';
      if (tier > g.axe) { g.axe = tier; return [`${ic} ${A.n}!`, `Bedre enn den gamle – du bruker den nå! (skade ${A.p})`, rar]; }
      if (tier === g.axe) { const n = addRes('wood', 4); return [`${ic} ${A.n}`, `Den samme som du har. Du hugget den opp til ved: 🪵 +${n}`, rar]; }
      const n = addRes('stone', 2 + tier * 2), m = tier >= 2 ? addRes('iron', tier) : 0;
      return [`${ic} ${A.n}`, `Dårligere enn din ${AXES[g.axe].n}. Du gjorde den om til 🪨 +${n}${m ? `  🔩 +${m}` : ''}`, rar]; } },
  { w: 6, f: () => {                                                          // oppgradering av et våpen du har
      const list = hero.owned.filter(id => id !== 'oks' && WEAPONS[id].kind !== 'rod' && wLvl(id) < WUP_MAX);
      if (!list.length) { const n = addRes('iron', 4); return ['🔩 Jern', `🔩 +${n}`, 'Uvanlig']; }
      const id = list[(Math.random() * list.length) | 0]; hero.wlvl[id] = wLvl(id) + 1; saveHero();
      return [`${WEAPONS[id].icon} Slipestein`, `${WEAPONS[id].n} ble nivå ${wLvl(id)}!`, 'Sjelden']; } },
  { w: 8, f: () => { const j = [['🧦 Et par gamle sokker', 'De lukter rart … ingen nytte.'], ['🥄 En rusten skje', 'Helt ubrukelig. Kanskje den var en heks sin?'], ['🪨 En stein med fjes', 'Den ser på deg. Du la den tilbake.'], ['🦴 Et hundebein', 'Kanskje et dyr vil ha det?'], ['🍂 En haug med blader', 'Noen har lurt deg!']][(Math.random() * 5) | 0];
      return [j[0], j[1], 'Søppel']; } }
];
//#slutt
//#blokk 0245 RAR_COL

const RAR_COL = { 'Søppel': '#9a9a9a', 'Vanlig': '#e8e0c8', 'Uvanlig': '#7fd36b', 'Sjelden': '#5aa8ff', 'Episk': '#c77dff' };
//#slutt
//#blokk 0246 openLootChest

function openLootChest(o) {
  let r = Math.random() * LOOT.reduce((a, L) => a + L.w, 0), pick = LOOT[0];
  for (const L of LOOT) { r -= L.w; if (r <= 0) { pick = L; break; } }
  const [title, sub0, rar] = pick.f(), sub = sub0.replace(/\+0\b/g, '0 (sekken er full 🎒)');
  showFishCard(title, sub, `<span style="color:${RAR_COL[rar]};font-weight:700">${rar}</span>`);
  sfx(rar === 'Episk' || rar === 'Sjelden' ? 'levelup' : rar === 'Søppel' ? 'thunk' : 'sparkle');
}
//#slutt
//#blokk 0247 goSleep


// ---------- Søvn ----------
// Om kvelden og natten kan du sove i halmsenga. Natten går da fort (rundt 30 sekunder for en hel natt), og ingen kan skade deg.
function goSleep(b) {
  const ph = phaseInfo(g.time), endNight = DAY + DUSK + NIGHT;
  if (ph.p < DAY - 15) { toast('Du er ikke trøtt ennå 🙂 Kom tilbake når det blir kveld 🌙'); g.p.cool = 0.8; return; }
  const left = endNight + 3 - ph.p, dur = 6 + 24 * left / (DUSK + NIGHT);
  g.sleep = { b, k: left / dur, t: 0, z: 0 }; g.monsters.forEach(m => m.leave = true);
  toast('😴 God natt … Zzz'); sfx('select');
}
//#slutt
//#blokk 0248 updateSleep

function updateSleep(dt) {
  const S = g.sleep; if (!S) return 0;
  S.t += dt; S.z -= dt; if (S.z <= 0) { S.z = 1.2; floatText(S.b.x + 10, S.b.y - 40, 'Z z z 💤'); }
  const p = g.p; p.x = S.b.x; p.y = S.b.y; p.vx = p.vy = p.vz = 0; p.z = 0; p.swing = 0; p.draw = 0;
  const ph = phaseInfo(g.time), endNight = DAY + DUSK + NIGHT;
  if (ph.p >= endNight + 2 && ph.p < endNight + 40) {                         // morgen: stå opp ved siden av senga
    g.sleep = null; p.x = S.b.x + 38; p.y = S.b.y + 10; p.h = undefined; g.hp = Math.min(100, g.hp + 30);
    toast('☀️ God morgen! Du sov godt og fikk igjen krefter.'); questAdd('sovet'); sfx('levelup'); return 0;
  }
  return dt * (S.k - 1);                                                       // ekstra tid som går mens du sover
}
//#slutt
//#blokk 0249 spawnMonster

function spawnMonster() {
  const p = g.p, L = lights();
  for (let i = 0; i < 20; i++) {
    const a = rand(0, Math.PI * 2), d = rand(520, 700);
    const x = clamp(p.x + Math.cos(a) * d, 30, W - 30), y = clamp(p.y + Math.sin(a) * d, 30, H - 30);
    if (!inAnyLight(x, y, L, 80) && dist(x, y, p.x, p.y) > 400) {
      g.monsters.push({ x, y, sp: rand(70, 95), t: rand(0, 6), a: 0, leave: false, scared: 0 });
      return;
    }
  }
}
//#slutt
//#blokk 0250 update


function update(dt) {
  const p = g.p, hp0 = g.hp, sleeping = !!g.sleep;
  let dx = 0, dy = 0;
  if (keys.left) dx--; if (keys.right) dx++; if (keys.up) dy--; if (keys.down) dy++;
  let mAmt = 1;
  if (JOY.mag > 0.12) { dx = JOY.dx; dy = JOY.dy; mAmt = Math.min(1, (JOY.mag - 0.12) / 0.8); }      // styrespak: lite dytt = gå sakte
  if (sleeping || g.ride) { dx = dy = 0; keys.attack = keys.jump = false; if (sleeping) keys.act = false; }
  if ((dx || dy) && R3 && R3.camYaw) {                     // «opp» betyr alltid bort fra kameraet
    const c = Math.cos(R3.camYaw), s2 = Math.sin(R3.camYaw); [dx, dy] = [dx * c + dy * s2, -dx * s2 + dy * c];
  }
  // Gåing: rask start og stopp, mykere styring i lufta
  const onGround = p.z <= 0;
  const inWater = onGround && waterDist(p.x, p.y) < 24 && !onBridge(p.x, p.y) && pierH(p.x, p.y) < -1e8;
  let top = PLAYER_SPEED * (inWater ? 0.55 : 1) * (p.draw > 0 ? 0.6 : 1);           // tregere når buen er trukket
  if (onGround && (p.vx || p.vy)) {
    const sp0 = Math.hypot(p.vx, p.vy), ux = p.vx / sp0, uy = p.vy / sp0;
    const rise = (groundH(p.x + ux * 12, p.y + uy * 12) - groundH(p.x, p.y)) / 12;           // stigning foran helten
    top *= Math.max(0.6, Math.min(1.1, 1 - rise * 1.3));
  }
  if (dx || dy) { const il = Math.hypot(dx, dy); p.ix = dx / il; p.iy = dy / il; }
  let tvx = 0, tvy = 0;
  if (dx || dy) {
    const l = Math.hypot(dx, dy); tvx = dx / l * top * mAmt; tvy = dy / l * top * mAmt;
    if (Math.abs(dx) > 0.01 && Math.abs(dx) >= Math.abs(dy)) { p.view = 'side'; p.face = Math.sign(dx); }
    else if (dy) p.view = dy < 0 ? 'up' : 'down';
  }
  const acc = Math.min(1, dt * (!onGround ? 10 : (dx || dy) ? 16 : 18));                // god styring i lufta, men farten bevares
  p.vx += (tvx - p.vx) * acc; p.vy += (tvy - p.vy) * acc;
  p.x += p.vx * dt; p.y += p.vy * dt;
  p.spd = Math.hypot(p.vx, p.vy);
  // Hopp og fall: p.h er høyden i verden. Tyngdekraften virker på p.vz; p.z = høyden over bakken eller broen under deg.
  const gH = dcFoot(p.x, p.y) && !g.ride ? dcSurf(p.x, p.y, p.h) : surfaceH(p.x, p.y);   // inne i Beinslottet: gulvet i etasjen du er i
  if (p.h === undefined || !isFinite(p.h)) p.h = gH;
  if (keys.jump && !p.jumpPrev) p.jumpBuf = JUMP_BUFFER;                        // trykk litt før landing teller også
  p.jumpPrev = !!keys.jump; p.jumpBuf = (p.jumpBuf || 0) - dt;
  const snap = p.air > 0 ? 0.01 : 4 + p.spd * dt * 1.6;                         // på bakken følger du skrått terreng; en ordentlig kant gir fall
  const inAir = p.vz > 0 || p.h - gH > snap;
  if (!inAir) p.coyote = COYOTE; else p.coyote = (p.coyote || 0) - dt;
  if ((keys.jump || p.jumpBuf > 0) && p.coyote > 0 && p.vz <= 0) {             // hold inne = hopper igjen straks du lander
    p.vz = JUMP_V; p.h = Math.max(p.h, gH); p.coyote = 0; p.jumpBuf = 0; p.takeT = 0.14; p.air = 0.001; sfx('jump');
  }
  if (p.vz > 0 || p.h - gH > snap) {
    p.vz -= GRAVITY * dt; p.h += p.vz * dt; p.air += dt;
    if (p.h <= gH) {                                                             // landing
      const hit = -p.vz; p.h = gH; p.vz = 0; p.air = 0; p.landT = Math.min(0.2, 0.08 + hit / 4000);
      if (hit > 250) {
        const wet = waterDist(p.x, p.y) < 24;
        for (let i = 0; i < 8; i++) g.parts.push({ x: p.x + rand(-8, 8), y: p.y + 1, vx: rand(-40, 40), vy: rand(-50, -15), t: 0.4, c: wet ? '#bfe6f7' : '#8a7458' });
      }
    }
  } else { p.h = gH; p.vz = 0; p.air = 0; }
  p.z = Math.max(0, p.h - gH);
  p.takeT = Math.max(0, (p.takeT || 0) - dt); p.landT = Math.max(0, (p.landT || 0) - dt);
  if (p.spd > 5 && p.z <= 0) {
    const before = p.walk; p.walk += dt * p.spd * Math.PI / gaitStride(p.spd);   // én halv syklus (π) = ett skritt
    if (Math.floor(before / Math.PI) !== Math.floor(p.walk / Math.PI))   // et skritt!
      for (let i = 0; i < (inWater ? 4 : 2); i++)
        g.parts.push({ x: p.x + rand(-5, 5), y: p.y + 1, vx: rand(-18, 18), vy: rand(-30, -10), t: 0.35, c: inWater ? '#bfe6f7' : '#8a7458' });
  }
  p.x = clamp(p.x, 20, W - 20); p.y = clamp(p.y, 20, H - 20);
  if (p.z < 40 && !g.ride) { castlePush(p); hutPush(p); ghPush(p); townPush(p); }
  if (!g.ride) dcPush(p, 12, (p.h === undefined ? dcH0() : p.h) - dcH0());
  pyrPush(p);
  p.swing = Math.max(0, p.swing - dt); p.cool -= dt; p.hurt -= dt; g.shake = Math.max(0, g.shake - dt);
  p.hintT = (p.hintT || 0) - dt; p.bowT = Math.max(0, (p.bowT || 0) - dt);
  if (p.impact && (p.impact.t -= dt) <= 0) {          // våpenet treffer nå!
    const imp = p.impact, tg = imp.tg; p.impact = null;
    if (tg && (tg.k === 'tree' || tg.k === 'rock')) { if (tg.o.alive && dist(p.x, p.y, tg.o.x, tg.o.y) < 95) { actNow(tg); hitFx(tg); } }
    else if (WEAPONS[imp.w].kind === 'cast') shootProj(imp.w);
    else meleeHit(imp.w, tg && tg.o);
  }
  p.wantDraw = false;
  if (keys.attack || MOUSE.down) attack();
  if (keys.act) act();
  { const Wb = WEAPONS[curW()];                       // buen: hold for å trekke, slipp for å skyte
    if (Wb.kind === 'bow') {
      if (p.wantDraw && p.cool <= 0) { if (!(p.draw > 0)) { p.draw = 0.001; sfx('draw'); } p.draw = Math.min(1, p.draw + dt / Wb.draw); p.aim = aimAngle(Wb, null); }
      else if (p.draw > 0) { if (p.draw >= 0.25) { shootProj(curW(), p.draw); p.cool = Wb.cd; p.bowT = 0.2; } p.draw = 0; }
    } else p.draw = 0; }
  updateProjs(dt);
  updateFishing(dt);
  updateGhostHouse(dt);
  updateTrainTown(dt);
  updateDino(dt);
  updatePond(dt);
  updateLassoParts(dt); updateLasso(dt);
  // Lava brenner! Og en melding når du kommer til en ny verden
  if (p.z <= 0 && inLava(p.x, p.y) && !onBridge(p.x, p.y)) {
    g.hp -= 30 * dt; p.hurt = 1; g.cause = 'lava'; g.flash = 0.25;
    if (!g.toldLava) { g.toldLava = true; toast('Au! Lava er glødende varmt! 🔥 Gå ut av den!'); }
  }
  const bNow = biomeAt(p.x, p.y);
  if (bNow !== g.biome) {
    g.biome = bNow; const B = BIOMES[bNow];
    toast(g.seen[bNow] ? `${B.icon} ${B.n}` : `${B.icon} Du har funnet ${B.n.toLowerCase()}!`); g.seen[bNow] = true;
  }

  // Dag og natt
  g.time += dt * DEV.scale + updateSleep(dt);              // én felles klokke for fase, sol, måne og himmel (går fortere når du sover)
  const ph = phaseInfo(g.time), prev = g.lastPhase, endNight = DAY + DUSK + NIGHT;
  if (prev < DAY && ph.p >= DAY) toast('🌙 Det blir mørkt! Hold bålet i gang!');
  if (prev < endNight && ph.p >= endNight) {
    g.nights++; toast(`☀️ Du overlevde natt ${g.nights}!`); addXP(25, p.x, p.y); questAdd('natt1'); questAdd('overlevaren');
    g.monsters.forEach(m => m.leave = true);
  }
  g.lastPhase = ph.p;
  if (g.skin > g.skinSeen) questAdd('jeger', g.skin - g.skinSeen); g.skinSeen = g.skin;          // skinn teller til oppdraget «Jegeren»

  // Mat, liv og bål
  g.food = Math.max(0, g.food - 0.3 * dt);
  if (g.food <= 0) { g.hp -= 4 * dt; g.cause = 'food'; }
  // Tørst er slått av (v5.2): sett THIRST = true for å slå den på igjen
  if (THIRST) { g.water = Math.max(0, g.water - 0.4 * dt); if (g.water <= 0) { g.hp -= 4 * dt; g.cause = 'water'; } } else g.water = 100;
  if (g.food > 40 && g.water > 30 && p.hurt <= 0) {
    const atHut = g.buildings.some(b => b.type === 'hytte' && dist(p.x, p.y, b.x, b.y) < 80) || g.cabins.some(c => dist(p.x, p.y, c.x, c.y) < 90);
    g.hp = Math.min(100, g.hp + (atHut ? 5 : 1.5) * dt);
  }
  g.fuel = Math.max(0, g.fuel - 0.3 * (1 - (g.fireLvl - 1) * 0.05) * dt);
  if (g.fuel > 0 && (g.smokeT -= dt) <= 0) {
    g.smokeT = 0.25;
    g.parts.push({ x: FX + rand(-6, 6), y: FY - 30, vx: rand(-6, 10), vy: rand(-30, -20), t: 2.6, smoke: true });
  }

  // Trær og busker vokser tilbake (trær: tidligst etter TREE_REGROW sekunder, og bare når du ikke ser det)
  for (const t of g.trees) {
    t.shake = Math.max(0, t.shake - dt);
    if (!t.alive && (t.regrow -= dt) <= 0 && Math.hypot(t.x - g.p.x, t.y - g.p.y) > 1400) { t.alive = true; t.hp = t.max; }   // vokser bare opp igjen når du er langt unna
  }
  for (const r of g.rocks) if (!r.alive && (r.regrow -= dt) <= 0) { r.alive = true; r.hp = r.max; }
  for (const b of g.bushes) if (b.berries < 3 && (b.t += dt) > 25) { b.berries++; b.t = 0; }

  const L = lights();
  // Dyr
  const playerSafe = !!inAnyLight(p.x, p.y, L);
  for (const a of g.animals) {
    const A = ANIMALS[a.type];
    a.hit = Math.max(0, a.hit - dt); a.flee = Math.max(0, a.flee - dt);
    if (a.tame) { petFollow(a, A, dt); ghPush(a, 10); townPush(a, 14); dcSolid(a, 16); pondPush(a, 12); continue; }   // tamt dyr: følger deg
    const dp = dist(a.x, a.y, p.x, p.y), lit = inAnyLight(a.x, a.y, L, 10);
    let vx = 0, vy = 0, sp = 0;
    if (lit) { vx = a.x - lit.x; vy = a.y - lit.y; sp = A.run * 0.8; }          // dyr er redde for lys
    else if (A.hostile && dp < A.aggro && !playerSafe) { vx = p.x - a.x; vy = p.y - a.y; sp = A.run; } // angriper
    else if (a.flee > 0 || (!A.hostile && dp < 140)) { vx = a.x - p.x; vy = a.y - p.y; sp = A.run; } // flykter
    else {
      a.turn -= dt;
      if (a.turn <= 0) { a.dir = rand(0, 6.28); a.turn = rand(1.5, 4); a.idle = Math.random() < 0.4; }
      if (!a.idle) { vx = Math.cos(a.dir); vy = Math.sin(a.dir); sp = A.sp; }
    }
    if (sp > 0) {
      const l = Math.hypot(vx, vy) || 1;
      a.x += vx / l * sp * dt; a.y += vy / l * sp * dt;
      if (Math.abs(vx) > 0.01) a.face = Math.sign(vx);
      a.walk += dt * sp / 8;
    }
    ghPush(a, 10); townPush(a, 14); dcSolid(a, 16); pondPush(a, 12);
    if (a.x < 30 || a.x > W - 30 || a.y < 30 || a.y > H - 30) { a.dir += Math.PI; a.x = clamp(a.x, 30, W - 30); a.y = clamp(a.y, 30, H - 30); }
    if (A.hostile && dp < 22 * A.size + 10 && p.z < 25) { g.hp -= A.dmg * dt; p.hurt = 1; g.cause = 'animal'; g.flash = 0.25; }
  }
  if (g.animals.length < ANIMAL_COUNT && (g.aspawn -= dt) <= 0) { spawnAnimal(600); g.aspawn = 12; }

  // Skurkene passer på basene sine
  for (const B of g.bases) if (!B.known && dist(p.x, p.y, B.x, B.y) < 650) { B.known = true; toast('🏰 Du har funnet et slott fullt av skjeletter! 💀'); }
  for (const v of g.villains) {
    const B = g.bases[v.base];
    v.hit = Math.max(0, v.hit - dt); v.atk = Math.max(0, v.atk - dt);
    const dp = dist(v.x, v.y, p.x, p.y), pHome = dist(p.x, p.y, B.x, B.y), dHome = dist(v.x, v.y, B.x, B.y);
    let tx, ty, sp;
    if ((dp < 280 || pHome < 330) && pHome < 700) {                                         // jager deg
      const inV = Math.abs(v.x - B.x) < CASTLE && Math.abs(v.y - B.y) < CASTLE, inP = Math.abs(p.x - B.x) < CASTLE && Math.abs(p.y - B.y) < CASTLE;
      if (inV !== inP && (Math.abs(v.x - B.x) > 22 || Math.abs(v.y - (B.y + CASTLE)) > 18)) { tx = B.x; ty = B.y + CASTLE; } else { tx = p.x; ty = p.y; }   // gå via porten
      sp = 112;
    }
    else if (dHome > 140) { tx = B.x; ty = B.y; sp = 80; }                                  // går hjem til basen
    else {                                                                                   // vandrer rundt i basen
      if ((v.t -= dt) <= 0) { v.wx = B.x + rand(-110, 110); v.wy = B.y + rand(-110, 110); v.t = rand(2, 5); }
      tx = v.wx; ty = v.wy; sp = 40;
    }
    const dx = tx - v.x, dy = ty - v.y, l = Math.hypot(dx, dy);
    if (l > 8 && dp > 22) { v.x += dx / l * sp * dt; v.y += dy / l * sp * dt; v.spd = sp; v.walk += dt * sp / 14; } else v.spd = 0;
    castlePush(v);
    if (dp < 30 && p.z < 25) { g.hp -= 12 * dt; p.hurt = 1; g.cause = 'villain'; g.flash = 0.25; if (v.atk <= 0) v.atk = 0.5; }
  }
  // Hyttene: røyk fra pipa og oppdaget på kartet
  for (const c of g.cabins) {
    const d = dist(p.x, p.y, c.x, c.y);
    if (!c.known && d < 600) { c.known = true; toast('🛖 Du fant en gammel hytte! Her er det trygt om natten.'); }
    if (d < 900 && (c.smokeT -= dt) <= 0) { c.smokeT = 0.45; g.parts.push({ x: c.x + 20 + rand(-2, 2), y: c.y - 35, vx: rand(-4, 8), vy: rand(-28, -18), t: 2.6, smoke: true }); }
  }
  // Den slemme geita ved vulkanen
  const gt = g.goat;
  if (gt && gt.alive) {
    gt.hit = Math.max(0, gt.hit - dt); gt.t -= dt;
    const dp = dist(gt.x, gt.y, p.x, p.y), home = dist(gt.x, gt.y, VX, VY);
    let sp = 0, tx = gt.x, ty = gt.y;
    if (gt.state === 'roam') {                                   // vandrer rundt foten av vulkanen
      if (gt.t <= 0) { gt.wa += rand(-1, 1); gt.t = rand(2, 4); }
      tx = VX + Math.cos(gt.wa) * (VR + 170); ty = VY + Math.sin(gt.wa) * (VR + 170); sp = 55;
      if (dp < 330 && p.z < 60) { gt.state = 'wind'; gt.t = 0.75; if (!gt.seen) { gt.seen = true; toast('🐐💢 Den slemme geita har sett deg! Pass deg for hornene!'); } }
    } else if (gt.state === 'wind') {                            // skraper med foten
      if (gt.t <= 0) { const l = Math.hypot(p.x - gt.x, p.y - gt.y) || 1; gt.dx = (p.x - gt.x) / l; gt.dy = (p.y - gt.y) / l; gt.state = 'charge'; gt.t = 0.85; gt.hitP = false; sfx('swish'); }
    } else if (gt.state === 'charge') {                          // stanger!
      gt.x += gt.dx * 330 * dt; gt.y += gt.dy * 330 * dt; gt.spd = 330; gt.walk += dt * 18;
      if (!gt.hitP && dp < 44 && p.z < 30) {
        gt.hitP = true; g.hp -= 20; p.hurt = 1; g.cause = 'goat'; g.flash = 0.4; g.shake = 0.3;
        p.x += gt.dx * 110; p.y += gt.dy * 110; p.vx = gt.dx * 200; p.vy = gt.dy * 200; sfx('animal');
      }
      if (gt.t <= 0) { gt.state = 'tired'; gt.t = 1.8; }
    } else if (gt.state === 'tired') {                           // sliten: nå tåler den mindre!
      if (gt.t <= 0) { gt.state = dp < 420 && home < VR + 700 ? 'wind' : 'roam'; gt.t = 0.75; }
    }
    if (home > VR + 750 && gt.state !== 'charge') gt.state = 'roam';
    if (sp > 0) {
      const dx = tx - gt.x, dy = ty - gt.y, l = Math.hypot(dx, dy);
      if (l > 5) { gt.x += dx / l * sp * dt; gt.y += dy / l * sp * dt; gt.walk += dt * sp / 12; }
      gt.spd = sp;
    } else if (gt.state !== 'charge') gt.spd = 0;
  }
  // T-rexen i jungelen: brøler, jager deg, biter – og er sliten en liten stund etter hvert bitt
  const tx = g.trex;
  if (tx && !tx.alive) { if ((tx.respawn -= dt) <= 0) Object.assign(tx, { alive: true, hp: tx.max, x: TRX, y: TRY, state: 'roam' }); }
  else if (tx) {
    tx.hit = Math.max(0, tx.hit - dt); tx.t -= dt;
    const dp = dist(tx.x, tx.y, p.x, p.y), home = dist(tx.x, tx.y, TRX, TRY), lit = inAnyLight(tx.x, tx.y, L, 40);
    let sp = 0, gx = tx.x, gy = tx.y;
    if (lit && tx.state !== 'bite') { gx = tx.x + (tx.x - lit.x); gy = tx.y + (tx.y - lit.y); sp = 120; tx.state = 'home'; }      // redd for bålet og lykter
    else if (tx.state === 'roam') {
      if (tx.t <= 0) { tx.wa += rand(-1.2, 1.2); tx.t = rand(2, 4); }
      gx = TRX + Math.cos(tx.wa) * 300; gy = TRY + Math.sin(tx.wa) * 300; sp = 45;
      if (dp < 430 && p.z < 90 && home < 1100) {
        tx.state = 'roar'; tx.t = 1.0; sfx('roar'); g.shake = Math.max(g.shake, 0.3);
        if (!tx.seen) { tx.seen = true; toast('🦖 GRRROOAAR! En sint T-rex har sett deg! Løp – eller slå den når den er sliten etter et bitt!'); }
      }
    } else if (tx.state === 'roar') { if (tx.t <= 0) tx.state = 'chase'; }
    else if (tx.state === 'chase') {
      gx = p.x; gy = p.y; sp = 145;                       // litt tregere enn deg, så du kan løpe fra den
      if (dp < 80) { tx.state = 'bite'; tx.t = 0.5; tx.hitP = false; }
      if (dp > 750 || home > 1350) tx.state = 'home';
    } else if (tx.state === 'bite') {
      if (tx.t <= 0.18 && !tx.hitP) {
        tx.hitP = true;
        if (dp < 95 && p.z < 60) { const kx = (p.x - tx.x) / (dp || 1), ky = (p.y - tx.y) / (dp || 1); g.hp -= 22; p.hurt = 1; g.cause = 'trex'; g.flash = 0.4; g.shake = 0.35; p.vx = kx * 260; p.vy = ky * 260; sfx('animal'); }
      }
      if (tx.t <= 0) { tx.state = 'tired'; tx.t = 1.5; }
    } else if (tx.state === 'tired') { if (tx.t <= 0) tx.state = dp < 520 ? 'chase' : 'home'; }
    else if (tx.state === 'home') { gx = TRX; gy = TRY; sp = 95; if (home < 220) { tx.state = 'roam'; tx.t = 0; } }
    const mx = gx - tx.x, my = gy - tx.y, ml = Math.hypot(mx, my);
    if (sp > 0 && ml > 5) { tx.x += mx / ml * sp * dt; tx.y += my / ml * sp * dt; tx.walk += dt * sp / 22; tx.spd = sp; } else tx.spd = 0;
    castlePush(tx);
  }
  // Vulkanen ryker og får utbrudd
  const dV = dist(p.x, p.y, VX, VY);
  if (dV < 2200 && (g.vsmokeT -= dt) <= 0) { g.vsmokeT = 0.3; g.parts.push({ x: VX + rand(-20, 20), y: VY - 30, vx: rand(-8, 8), vy: rand(-70, -50), t: 2.6, smoke: true, big: true }); }
  if (dV < 1800 && (g.eruptT -= dt) <= 0) {
    g.eruptT = rand(7, 12);
    for (let i = 0; i < 40; i++) g.parts.push({ x: VX + rand(-15, 15), y: VY, vx: rand(-90, 90), vy: rand(-260, -120), t: rand(1, 1.6), c: Math.random() < .5 ? '#ff7a2a' : '#ffd36b' });
    if (dV < 900) g.shake = 0.25; sfx('fall');
  }
  // Troll ved broene
  for (let i = 0; i < g.bridges.length; i++) {
    const B = g.bridges[i];
    if (B.trollT > 0 && (B.trollT -= dt) <= 0 && !g.trolls.some(t => t.bridge === i)) g.trolls.push(makeTrollFor(i));
  }
  for (const tr of g.trolls) {
    const B = g.bridges[tr.bridge];
    tr.hit = Math.max(0, tr.hit - dt); tr.atk = Math.max(0, tr.atk - dt);
    const dp = dist(tr.x, tr.y, p.x, p.y), pB = dist(p.x, p.y, B.x, B.y), dHome = dist(tr.x, tr.y, B.hx, B.hy);
    if (!tr.awake && pB < 130) {
      tr.awake = true;
      if (!tr.said) { tr.said = true; toast('Trollet: «Hvem er det som tramper på min bro?» 😠'); }
    }
    if (tr.awake && pB > 480) tr.awake = false;             // trollet går hjem igjen
    let tx = B.hx, ty = B.hy, sp = 50;
    if (tr.awake) { tx = p.x; ty = p.y; sp = 85; }
    const dx = tx - tr.x, dy = ty - tr.y, l = Math.hypot(dx, dy);
    if (l > 10 && dp > 30) { tr.x += dx / l * sp * dt; tr.y += dy / l * sp * dt; tr.spd = sp; tr.walk += dt * sp / 20; } else tr.spd = 0;
    if (!tr.awake && dHome < 12) tr.said = false;
    if (dp < 38 && p.z < 35) { g.hp -= 22 * dt; p.hurt = 1; g.cause = 'troll'; g.flash = 0.3; if (tr.atk <= 0) tr.atk = 0.7; }
  }

  // Monstre
  if (ph.night) {
    g.spawn -= dt;
    const active = g.monsters.filter(m => !m.leave).length;
    if (g.spawn <= 0 && active < Math.min(14, 3 + g.nights * 2)) { spawnMonster(); g.spawn = rand(2.5, 4.5); }
  }
  for (const m of g.monsters) {
    m.t += dt; m.scared = Math.max(0, m.scared - dt);
    if (m.leave) {
      const vx = m.x - p.x, vy = m.y - p.y, l = Math.hypot(vx, vy) || 1;
      m.x += vx / l * 60 * dt; m.y += vy / l * 60 * dt; m.a -= dt * 0.6; continue;
    }
    m.a = Math.min(1, m.a + dt);
    const lit = inAnyLight(m.x, m.y, L, 15);
    let vx, vy, sp;
    m.hit = Math.max(0, (m.hit || 0) - dt); m.flee = Math.max(0, (m.flee || 0) - dt);
    if (lit) { vx = m.x - lit.x; vy = m.y - lit.y; sp = 120; m.scared = 0.6; }
    else if (m.flee > 0) { vx = m.x - p.x; vy = m.y - p.y; sp = 115; m.scared = 0.6; }     // truffet: flykter litt
    else { vx = p.x - m.x; vy = p.y - m.y; sp = m.sp; }
    const l = Math.hypot(vx, vy) || 1;
    let nx = m.x + vx / l * sp * dt, ny = m.y + vy / l * sp * dt;
    const blk = !lit && inAnyLight(nx, ny, L, 15);
    if (blk) {
      // Monsteret tør ikke inn i lyset: det sniker seg rundt kanten i stedet
      const tx = -(m.y - blk.y), ty = m.x - blk.x, tl = Math.hypot(tx, ty) || 1;
      const sgn = (tx * (p.x - m.x) + ty * (p.y - m.y)) > 0 ? 1 : -1;
      nx = m.x + tx / tl * sgn * sp * 0.4 * dt; ny = m.y + ty / tl * sgn * sp * 0.4 * dt;
    }
    m.x = nx; m.y = ny;
    if (m.flee <= 0 && dist(m.x, m.y, p.x, p.y) < 30 && p.z < 30) { g.hp -= 28 * dt; p.hurt = 1; g.cause = 'monster'; g.flash = 0.3; }
  }
  g.monsters = g.monsters.filter(m => m.a > 0 || !m.leave);
  g.flash = Math.max(0, g.flash - dt);

  for (const q of g.parts) { q.x += q.vx * dt; q.y += q.vy * dt; if (!q.smoke) q.vy += 200 * dt; else q.vx += (WIND_X - q.vx * .3) * dt; q.t -= dt; }   // røyken driver med vinden
  g.parts = g.parts.filter(q => q.t > 0);
  for (const f of g.fx) { f.y -= 30 * dt; f.t -= dt; }
  g.fx = g.fx.filter(f => f.t > 0);

  if (toastTimer > 0 && (toastTimer -= dt) <= 0) $('toast').classList.remove('show');
  if (sleeping) g.hp = Math.min(100, Math.max(g.hp, hp0) + 2 * dt);          // ingen kan skade deg mens du sover
  else if (g.ride) g.hp = Math.max(g.hp, hp0);                                 // eller mens du sitter på toget
  if (g.hp <= 0 && !dcRescue()) gameOver();
}
//#slutt
//#blokk 0251 GEO,M


/* ---------- 3D-tegning (Three.js) ---------- */
// Spillet regner fortsatt i 2D (x og y på bakken). Her blir x til X og y til Z i 3D-verdenen.
const GEO = {}, M = {};
//#slutt
//#blokk 0256 hash2

// Høyden på bakken: bakker og daler, men flatt rundt bålet og nede ved bekken
// ---------- Terreng (deterministisk: samme verden hver gang, uavhengig av Math.random) ----------
function hash2(x, z) { let h = Math.imul(x, 374761393) + Math.imul(z, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
//#slutt
//#blokk 0257 vnoise

function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;                         // 0..1
}
//#slutt
//#blokk 0258 fbm

function fbm(x, z, oct) { let s2 = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { s2 += a * vnoise(x * f + i * 17.1, z * f - i * 9.7); f *= 2.03; a *= .5; } return s2; }
//#slutt
//#blokk 0259 sstep

const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
//#slutt
//#blokk 0260 terrainH

function terrainH(x, z, pools = true) {
  const w = biomeW(x, z);
  const hills = (fbm(x / 560, z / 560, 4) - .47) * 80;                                        // lave, bølgende åser og daler
  const mask = sstep(.55, .8, vnoise(x / 1100 + 3.3, z / 1100 - 1.7));                        // bare noen steder får bratte rygger
  const ridge = Math.pow(1 - Math.abs(vnoise(x / 240 + 7.3, z / 240 - 3.1) * 2 - 1), 3) * 38 * mask;
  const detail = (vnoise(x / 70, z / 70) - .5) * 5;                                           // små ujevnheter
  let h = (16 + hills + ridge + detail) * (w.skog + w.sno * 2 + w.jungel * 1.25 + w.lava * .7 + w.orken * .45)
          + w.sno * (Math.sin(x / 170) * Math.cos(z / 190) + 1) * 26                          // fjell i snøverdenen
          + w.orken * (Math.pow(Math.sin(x / 95 + Math.sin(z / 230) * 2.2) * .5 + .5, 2) * 24 + fbm(x / 300, z / 300, 2) * 14);   // sanddyner
  const fireF = sstep(130, 380, dist(x, z, FX, FY));
  const valley = sstep(40, 220, waterDist(x, z));                                             // bekken renner i en dal
  h *= fireF * valley;
  h -= pondBowl(x, z);                                                                        // haidammen er dyp i midten
  if (g && pools) for (const l of g.lavaPools) {                                              // lavasjøene ligger i en grop
    const d = dist(x, z, l.x, l.y);
    if (d < l.r + 60) { const t = Math.max(0, (d - l.r) / 60); h = h * t - 3 * (1 - t); }
  }
  const pf = sstep(PYR + 60, PYR + 230, Math.max(Math.abs(x - PYX), Math.abs(z - PYY)));   // flatt rundt pyramiden
  h = h * pf + 20 * (1 - pf);
  return h + volcanoH(x, z);
}
//#slutt
//#blokk 0261 groundH

function groundH(x, z) {
  let h = terrainH(x, z);
  if (g) {                                                                                     // flatt under slott og hytter
    for (const B of g.bases) { const d = Math.abs(x - B.x) + Math.abs(z - B.y); if (d < 420) { if (B.h0 === undefined) B.h0 = terrainH(B.x, B.y); h += (B.h0 - h) * (1 - sstep(200, 320, Math.max(Math.abs(x - B.x), Math.abs(z - B.y)))); } }
    { const d = Math.hypot(x - GHX, z - GHY); if (d < 340) h += (ghH0() - h) * (1 - sstep(230, 340, d)); }   // flatt rundt spøkelseshuset
    { const d = Math.max(Math.abs(x - DCX), Math.abs(z - DCY)); if (d < 820) h += (dcH0() - h) * (1 - sstep(580, 820, d)); }   // flatt rundt Beinslottet
    for (const c of g.cabins) { const d = Math.hypot(x - c.x, z - c.y); if (d < 150) { if (c.h0 === undefined) c.h0 = terrainH(c.x, c.y); h += (c.h0 - h) * (1 - sstep(70, 150, d)); } }
  }
  return railFlat(x, z, h);                                                                   // jernbanen og Kaktusbyen ligger på flat grunn
}
//#slutt
//#blokk 0262 forestDensity

// ---------- Økologi: hvor det vokser skog, og hva slags ----------
function forestDensity(x, y) {                                                               // 0 = åpent landskap / lysning, 1 = tett skog
  const n = fbm(x / 700 + 11, y / 700 - 4, 3);
  const glade = sstep(.33, .22, vnoise(x / 280 + 5.5, y / 280 + 9.1));                       // små skoglysninger
  return sstep(.36, .6, n) * (1 - glade * .95);
}
//#slutt
//#blokk 0263 slopeAt

function slopeAt(x, y) { const e = 10; return Math.hypot(terrainH(x + e, y, false) - terrainH(x - e, y, false), terrainH(x, y + e, false) - terrainH(x, y - e, false)) / (2 * e); }
//#slutt
//#blokk 0264 moistAt

const moistAt = (x, y) => 1 - sstep(50, 450, waterDist(x, y));
//#slutt
//#blokk 0265 baseH
                             // 1 = nær vann
function baseH(x, z, r) { return Math.min(groundH(x, z), groundH(x + r, z), groundH(x - r, z), groundH(x, z + r), groundH(x, z - r)); }
//#slutt
//#blokk 0266 groundN
   // laveste punkt under en fot
function groundN(x, z, out) { const e = 6; out.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); return out; }
//#slutt
//#blokk 0267 turn

const turn = (cur, want, k) => { let d = want - cur; d = Math.atan2(Math.sin(d), Math.cos(d)); return cur + d * k; };
//#slutt
//#blokk 0268 SKYK


// Himmelfarger etter solhøyde (grader): zenit, horisont, solbånd, rosa bånd, glorie, sollysfarge, sollysstyrke, himmellysstyrke
const SKYK = [
  [-18, [.008, .012, .035], [.03, .045, .08], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, .4, .2], 0, .17],
  [-9, [.03, .06, .16], [.12, .14, .26], [.10, .04, .05], [.05, .03, .06], [.05, .02, .02], [1, .4, .2], 0, .24],
  [-3, [.10, .17, .36], [.46, .34, .40], [.55, .22, .06], [.20, .08, .14], [.5, .22, .08], [1, .42, .2], 0, .40],
  [2, [.20, .34, .60], [.78, .60, .50], [.42, .20, .05], [.12, .05, .08], [.7, .42, .18], [1, .58, .32], .45, .55],
  [8, [.27, .47, .75], [.78, .76, .72], [.16, .08, .02], [.03, .01, .02], [.6, .5, .3], [1, .8, .6], .8, .7],
  [20, [.33, .55, .84], [.74, .84, .90], [0, 0, 0], [0, 0, 0], [.5, .48, .4], [1, .94, .86], .9, .8],
  [50, [.30, .53, .86], [.72, .84, .93], [0, 0, 0], [0, 0, 0], [.45, .45, .4], [1, .98, .95], .95, .82]];
//#slutt
//#blokk 0269 skyKeys

function skyKeys(e, K) {
  let i = 0; while (i < SKYK.length - 2 && e > SKYK[i + 1][0]) i++;
  const A = SKYK[i], B = SKYK[i + 1], t = clamp((e - A[0]) / (B[0] - A[0]), 0, 1), L = (k, c) => c.setRGB(A[k][0] + (B[k][0] - A[k][0]) * t, A[k][1] + (B[k][1] - A[k][1]) * t, A[k][2] + (B[k][2] - A[k][2]) * t);
  L(1, K.zen); L(2, K.hor); L(3, K.band); L(4, K.pink); L(5, K.glow); L(6, K.sunC);
  K.sunI = A[7] + (B[7] - A[7]) * t; K.hemiI = A[8] + (B[8] - A[8]) * t; return K;
}
//#slutt
//#blokk 0270 skyAt

// Samme formel som himmelkuppelens shader – gir fargen i retning (dx,dy,dz)
function skyAt(dx, dy, dz, U, out) {
  const sD = U.sunDir.value, mD = U.moonDir.value, h = clamp(dy * 2.2 + .04, 0, 1);
  out.copy(U.hor.value).lerp(U.zen.value, Math.pow(h, .6));
  const hz = 1 - clamp(dy * 3, 0, 1), side = (dx * sD.x + dz * sD.z) / ((Math.hypot(dx, dz) + 1e-5) * (Math.hypot(sD.x, sD.z) + 1e-5)) * .5 + .5;
  const pk = Math.exp(-Math.pow((dy - .1) / .12, 2)), s = Math.max(0, dx * sD.x + dy * sD.y + dz * sD.z), m = Math.max(0, dx * mD.x + dy * mD.y + dz * mD.z);
  const kb = hz * hz * side * side, kp = pk * (1 - side) * (1 - side), kg = Math.pow(s, 8) * .35 + Math.pow(s, 64) * .6, km = Math.pow(m, 24);
  const B = U.band.value, Pk = U.pink.value, G2 = U.glow.value, Mc = U.moonC.value;
  out.r += B.r * kb + Pk.r * kp + G2.r * kg + Mc.r * km; out.g += B.g * kb + Pk.g * kp + G2.g * kg + Mc.g * km; out.b += B.b * kb + Pk.b * kp + G2.b * kg + Mc.b * km;
  return out;
}
//#slutt
//#blokk 0276 TREE_VARIANTS


// ================== Trær v3.7: realistiske, prosedyrebygde trær ==================
// Hvert tre er to mesh: stamme/greiner (bark) og løv/barnåler (kort med gjennomsiktig tekstur, som i moderne spill).
// Formene bygges i koden (greiner som rør langs kurver, barnål- og bladkvister som bøyde kort), og det lages
// fire varianter per treslag som gjenbrukes med ulik størrelse og rotasjon. Teksturene tegnes på lerret (canvas).
const TREE_VARIANTS = 4;
//#slutt
//#blokk 0277 treeRng

function treeRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
//#slutt
//#blokk 0278 LEAF_CELL

// Løv-atlas: 4 × 2 ruter (256 × 512). Kortets rot er nederst i ruta, tuppen øverst. Gråtoner – fargen kommer fra hjørnefargene.
const LEAF_CELL = { gran: 0, sno: 1, furu: 2, lov: 3, bjork: 4, palme: 5, jungel: 6, slyng: 7 };
//#slutt
//#blokk 0280 LEAF_SOLID

const LEAF_SOLID = [7 / 4 * 256 / 1024 + 0.003, 1 - 0.003];
//#slutt
//#blokk 0281 cellUV
   // uv i den tette flekken (indre volum)
function cellUV(k, u, v) { return [((k % 4) + u) / 4, 1 - (Math.floor(k / 4) + 1 - v) / 2]; }
//#slutt
//#blokk 0285 jit

const jit = (c, R, a) => [c[0] * (1 + (R() - .5) * a), c[1] * (1 + (R() - .5) * a), c[2] * (1 + (R() - .5) * a)];
//#slutt
//#blokk 0286 mixC

const mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
//#slutt
//#blokk 0287 branchPts

// En gren som bøyer seg: punkter fra p0 i retning dir, med tyngdekraft og litt tilfeldig krok
function branchPts(p0, dir, L, n, R, droop = 0, curl = 0.15) {
  const pts = [p0.clone()], d = dir.clone().normalize(), p = p0.clone();
  for (let i = 1; i <= n; i++) { d.x += (R() - .5) * curl; d.z += (R() - .5) * curl; d.y += (R() - .5) * curl * .5 - droop; d.normalize(); p.addScaledVector(d, L / n); pts.push(p.clone()); }
  return pts;
}
//#slutt
//#blokk 0289 treeVariant

function treeVariant(kind, i) {
  const key = 'tree_' + kind + '_' + i;
  return GEO[key] || (GEO[key] = buildTreeKind(kind, i + 1));
}
//#slutt
//#blokk 0290 TREE_REGROW


// Trestørrelse i forhold til helten (v4.7): vanlige trær er nå ca. 3 ganger så høye som Even-figuren
const TREE_REGROW = 600;
//#slutt
//#blokk 0291 TREE_H,TREE_W,GIANT_H,GIANT_W
                                // sekunder før et hugget tre kan vokse opp igjen (10 minutter)
const TREE_H = 1.9, TREE_W = 1.5, GIANT_H = 1.3, GIANT_W = 1.2;
//#slutt
//#blokk 0292 treeHK,treeWK

const treeHK = t => t.giant ? GIANT_H : TREE_H, treeWK = t => t.giant ? GIANT_W : TREE_W;
//#slutt
//#blokk 0299 villainOpts

const villainOpts = () => ({ villain: true, jacket: lam('#4a2f5e'), jacketDark: lam('#2e1f3c'), pants: lam('#2b2b33'), hair: M.black });
//#slutt
//#blokk 0301 HERO_RIM

// ================== Helten (Even): semi-realistisk modell bygget i koden ==================
// Spillet bruker three.js uten 3D-filer eller bildefiler. Derfor lages alle former her av dreide profiler (lathe),
// formede kuler og ekstruderte flater, og hud, hår, bomull, denim og gummi får teksturer som tegnes på et lerret (canvas).
const HERO_RIM = { value: null };
//#slutt
//#blokk 0303 grain

function grain(x, w, h, n, a, s1 = 1, s2 = 2) {
  for (let i = 0; i < n; i++) { const v = Math.random() * a, s = s1 + Math.random() * (s2 - s1); x.fillStyle = Math.random() < .5 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${v})`; x.fillRect(Math.random() * w, Math.random() * h, s, s); }
}
//#slutt
//#blokk 0308 HEAD_C,HEAD_R


// ---------- Hode og ansikt ----------
// Én kule formes punkt for punkt: smalere kjeve og hake, kinnbein, øyehuler, pannebein, nese og lepper i samme sammenhengende flate.
const HEAD_C = 10.3, HEAD_R = [7.3, 9.3, 7.8];
//#slutt
//#blokk 0309 headShape

function headShape(x, y, z) {                 // enhetskule (x,y,z) → punkt på hodet (hodets egne koordinater)
  const front = sstep(0.15, 0.75, z), jaw = sstep(0.05, -0.85, y);
  const gs = (cu, cw, su, sw) => Math.exp(-((x - cu) ** 2) / (2 * su * su) - ((y - cw) ** 2) / (2 * sw * sw));
  let X = x * HEAD_R[0] * (1 - 0.2 * jaw * (1 - 0.25 * front)), Y = y * HEAD_R[1], Z = z * HEAD_R[2] * (1 - 0.06 * jaw);   // barnefjes: rundere kinn, mykere hake
  if (z < 0) Z *= 1.04;
  let d = 0;
  for (const sx of [-1, 1]) { d -= 0.42 * gs(sx * 0.37, 0.07, 0.13, 0.09); d += 0.28 * gs(sx * 0.37, 0.25, 0.17, 0.05); d += 0.55 * gs(sx * 0.46, -0.2, 0.16, 0.13); }
  d += 1.15 * gs(0, -0.07, 0.065, 0.17) + 0.5 * gs(0, -0.24, 0.085, 0.06);                 // nese
  d += 0.22 * gs(0, -0.445, 0.19, 0.035) + 0.28 * gs(0, -0.535, 0.15, 0.04);                // lepper
  d += 0.32 * gs(0, -0.8, 0.18, 0.08);                                                      // hake
  d *= front;
  const l = Math.hypot(X / HEAD_R[0], Y / HEAD_R[1], Z / HEAD_R[2]) || 1, nx = X / HEAD_R[0] / l, ny = Y / HEAD_R[1] / l, nz = Z / HEAD_R[2] / l;
  return [X + nx * d, Y + ny * d + HEAD_C, Z + nz * d];
}
//#slutt
//#blokk 0317 faceUV

// UV for et punkt på hodet (hodets eget system): samme kuleprojeksjon som kroppsmeshet bruker for ansiktet
function faceUV(x, y, z) {
  let nx = x / 7.15, ny = (y - 11.3) / 8.3, nz = (z + 0.75) / 7.7; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
  let u = Math.atan2(nz, -nx) / (2 * Math.PI); if (u < 0) u += 1;
  return [u, Math.acos(Math.max(-1, Math.min(1, ny))) / Math.PI];
}
//#slutt
//#blokk 0326 PACKS

// ---------- Ryggsekk, fiskestang og fisk i 3D ----------
// Ryggsekken: avrundet hoveddel (ekstrudert med fas), frontlomme, lokk med remmer og spenner, sidelommer og liggeunderlag på de største.
const PACKS = [null, { w: 11, h: 13, d: 5.2, col: '#8a5a36', trim: '#5e3b22' }, { w: 12.5, h: 15.5, d: 6.2, col: '#6f4a2c', trim: '#4a3020', roll: true, side: true }, { w: 13.5, h: 17.5, d: 7, col: '#4f6a3a', trim: '#5a3b24', roll: true, side: true, lamp: true }];
//#slutt
//#blokk 0327 packMats

function packMats(col, trim) {
  const key = 'pk' + col; if (M[key]) return M[key];
  const t = cTex(128, 128, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 3) { x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(i, 0, 1, h); x.fillRect(0, i, w, 1); } grain(x, w, h, 900, .07); }, [2, 2]);
  return (M[key] = { cloth: heroMat({ map: t, bumpMap: t, bumpScale: .02, roughness: .9 }), trim: heroMat({ color: trim, roughness: .7 }), metal: heroMat({ color: '#b9b2a2', roughness: .35, metalness: .7 }), roll: heroMat({ color: '#9b3d2e', map: t, roughness: .9 }) });
}
//#slutt
//#blokk 0331 FISHLOOK

// Fisk: formet kropp med artstegning (flekker, striper, sølvglans), halefinne, ryggfinne, brystfinner og øyne. Lengde i spillenheter.
const FISHLOOK = {
  orret:  { back: '#5d6a3a', side: '#c9b46a', belly: '#f2ead6', fin: '#8a7a4a', spots: ['#1e1a14', '#c0392b'] },
  laks:   { back: '#4c6474', side: '#c9d2d8', belly: '#f4f6f6', fin: '#6f8592', spots: ['#1e2328'] },
  roye:   { back: '#3e5a46', side: '#8aa07a', belly: '#e0603a', fin: '#d0603e', spots: ['#e8e2b8'] },
  piraja: { back: '#5d6a72', side: '#a8b2b8', belly: '#d8402e', fin: '#7a4a40', spots: [], deep: true },
  abbor:  { back: '#4f6a2e', side: '#b9b25a', belly: '#efe8c8', fin: '#e0602a', bars: true },
  gjedde: { back: '#3e5a2e', side: '#7f9a4e', belly: '#e8e2c0', fin: '#7a7a3a', spots: ['#e2dc9a'], long: true },
  tropefisk: { back: '#1e6ad8', side: '#f6d32a', belly: '#fff2b0', fin: '#1e4aa8', bars: true, deep: true },
  karpe:  { back: '#6a5a2e', side: '#c9a24a', belly: '#f0e2b0', fin: '#a0703a', spots: [] }
};
//#slutt
//#blokk 0334 SHAPE

// Form på hvert dyr: kropp, bein, hals, hode og snute (før størrelsen i ANIMALS ganges inn)
const SHAPE = {
  hjort:    { bw: 8,   bh: 9,   bl: 18, leg: 20, lr: 1.8, nl: 14, na: .55, nr: 3,   hr: 4.5, sl: 7, sr: 2.4, belly: '#d8b48a', foot: '#2a1d14' },
  rev:      { bw: 6,   bh: 6,   bl: 15, leg: 9,  lr: 1.6, nl: 5,  na: .9,  nr: 3,   hr: 5,   sl: 8, sr: 2.2, belly: '#f3ead6', foot: '#2a1a10' },
  villsvin: { bw: 10,  bh: 10,  bl: 18, leg: 8,  lr: 2.4, nl: 3,  na: 1.2, nr: 6,   hr: 7,   sl: 7, sr: 3.6, belly: '#6e5a4c', foot: '#1a1410', hump: true },
  ulv:      { bw: 7.5, bh: 8,   bl: 18, leg: 15, lr: 2,   nl: 8,  na: .9,  nr: 4,   hr: 5.5, sl: 8, sr: 2.6, belly: '#c8ccd0', foot: '#3a3e42' },
  bjorn:    { bw: 11,  bh: 11,  bl: 19, leg: 11, lr: 3.6, nl: 6,  na: 1.0, nr: 6,   hr: 7.5, sl: 5, sr: 3.4, belly: '#5e3e28', foot: '#1a100a', hump: true },
  isbjorn:  { bw: 11,  bh: 10.5, bl: 20, leg: 12, lr: 3.6, nl: 9, na: .9,  nr: 6,   hr: 7,   sl: 6, sr: 3.4, belly: '#e0dccf', foot: '#3a3530', hump: true },
  tiger:    { bw: 8,   bh: 8.5, bl: 21, leg: 13, lr: 2.6, nl: 6,  na: 1.0, nr: 5,   hr: 6.5, sl: 4, sr: 3.2, belly: '#f3ead6', foot: '#d07a24' },
  elg:      { bw: 10,  bh: 11,  bl: 21, leg: 27, lr: 2.4, nl: 12, na: .9,  nr: 4.5, hr: 5.5, sl: 11, sr: 3.6, belly: '#3a2a1e', foot: '#1e1610', hump: true },
  rein:     { bw: 8,   bh: 8.5, bl: 17, leg: 18, lr: 1.9, nl: 11, na: .6,  nr: 3.4, hr: 4.6, sl: 7, sr: 2.6, belly: '#eae6dc', foot: '#2a241e' },
  kamel:    { bw: 9,   bh: 10,  bl: 20, leg: 32, lr: 2.2, nl: 17, na: .75, nr: 3.4, hr: 4.6, sl: 9, sr: 3, belly: '#dcb47c', foot: '#6a5034', hump: true },
  orkenrev: { bw: 5.5, bh: 5.5, bl: 14, leg: 9,  lr: 1.4, nl: 5,  na: .9,  nr: 2.8, hr: 4.6, sl: 7, sr: 2,   belly: '#f5e6c8', foot: '#7a5530' },
  hare:     { bw: 5,   bh: 5.5, bl: 8,  leg: 5,  lr: 1.3, nl: 2,  na: .6,  nr: 2.5, hr: 3.8, sl: 2.2, sr: 2.2, belly: '#e6dccb', foot: '#5a4632' },
  snohare:  { bw: 5,   bh: 5.5, bl: 8,  leg: 5,  lr: 1.3, nl: 2,  na: .6,  nr: 2.5, hr: 3.8, sl: 2.2, sr: 2.2, belly: '#ffffff', foot: '#d0d0c8' },
  gaupe:    { bw: 6.5, bh: 7,   bl: 14, leg: 12, lr: 2,   nl: 4,  na: .9,  nr: 3.4, hr: 5,   sl: 2.6, sr: 2.8, belly: '#e8dcc4', foot: '#8a7050' },
  ape:      { bw: 7,   bh: 8,   bl: 10, leg: 10, lr: 1.8, nl: 2,  na: .2,  nr: 3,   hr: 6,   sl: 2.5, sr: 3.6, belly: '#c9a07a', foot: '#3a2a1a', arm: 1.6, tilt: -0.55 },
  grevling: { bw: 7,   bh: 5.5, bl: 13, leg: 4,  lr: 1.6, nl: 2,  na: 1.2, nr: 3.2, hr: 4.2, sl: 5, sr: 1.8, belly: '#2a2a2e', foot: '#1a1a1c' },
  villhest: { bw: 8,   bh: 9.5, bl: 20, leg: 25, lr: 2,   nl: 13, na: .5,  nr: 3.4, hr: 4.2, sl: 10, sr: 2.8, belly: '#8a6244', foot: '#1e1610' },
  moskus:   { bw: 11,  bh: 11,  bl: 18, leg: 11, lr: 2.6, nl: 4,  na: 1.2, nr: 6,   hr: 6,   sl: 5, sr: 3.6, belly: '#2a2018', foot: '#3a3226', hump: true },
  polarrev: { bw: 6,   bh: 6,   bl: 15, leg: 9,  lr: 1.6, nl: 5,  na: .9,  nr: 3,   hr: 5,   sl: 7, sr: 2.2, belly: '#ffffff', foot: '#cfcfca' },
  elefant:  { bw: 12,  bh: 13,  bl: 20, leg: 18, lr: 4,   nl: 2,  na: 1.3, nr: 7,   hr: 8,   sl: 4, sr: 3.6, belly: '#7e7c7a', foot: '#5e5c5a' },
  krokodille: { bw: 7, bh: 4.5, bl: 22, leg: 4,  lr: 1.8, nl: 3,  na: 1.5, nr: 3.6, hr: 4,   sl: 13, sr: 2.6, belly: '#c8c890', foot: '#3a5226' },
  panter:   { bw: 7.5, bh: 8,   bl: 20, leg: 13, lr: 2.4, nl: 6,  na: 1.0, nr: 4.6, hr: 6,   sl: 4, sr: 3,   belly: '#26262a', foot: '#101012' },
  gasell:   { bw: 6,   bh: 7,   bl: 15, leg: 19, lr: 1.4, nl: 11, na: .5,  nr: 2.6, hr: 3.8, sl: 6, sr: 2,   belly: '#f4ead6', foot: '#2a1e14' }
};
//#slutt
//#blokk 0337 DCX,DCY

// ================== Dinoverdenen og Beinslottet (v4.6) ==================
// Øst i jungelen ligger Dinoverdenen. Midt i den står Beinslottet: et kjempestort slott med tre etasjer.
//   1. etasje: 25 skjeletter.
//   2. etasje: 3 skjelett-triceratopser – hver av dem er like sterk som T-rexen (90 liv).
//   3. etasje (taket): Skjelett-T-rex-kongen – 10 ganger så sterk som en triceratops (900 liv).
// Bein-porten opp til neste etasje åpner seg når alle fiendene i etasjen er beseiret.
// Slottets eget system: lx = øst/vest, ly = nord/sør (porten er i sør, +ly), høyde = over slottsgulvet.
const DCX = FX + Math.cos(-0.08) * 4300, DCY = FY + Math.sin(-0.08) * 4300;
//#slutt
//#blokk 0338 DC_HX,DC_WT,DC_GATE,DC_FT,DC_F

const DC_HX = 400, DC_WT = 18, DC_GATE = 60, DC_FT = 230, DC_F = [1.5, 230, 460];
//#slutt
//#blokk 0339 DC_R1
   // halv bredde, veggtykkelse, halv portåpning, etasjehøyde, gulvhøydene
const DC_R1 = { x0: 300, x1: 386, yb: 300, yt: -160, f: 0 };
//#slutt
//#blokk 0340 DC_R2
      // trapp 1 → 2. etasje, langs østveggen (går nordover)
const DC_R2 = { x0: -386, x1: -300, yb: -300, yt: 160, f: 1 };
//#slutt
//#blokk 0341 DC_PIL,DC_PILR
    // trapp 2 → 3. etasje, langs vestveggen (går sørover)
const DC_PIL = [[-160, -150], [160, -150], [-160, 150], [160, 150]], DC_PILR = 26;
//#slutt
//#blokk 0342 DC_TOW,DC_TOWR

const DC_TOW = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => [sx * (DC_HX + 45), sy * (DC_HX + 45)]), DC_TOWR = 62;
//#slutt
//#blokk 0343 DC_HP,DC_DMG

// Hvor sterke fiendene er. Prøv å endre tallene! (liv = hvor mange slag de tåler, skade = hvor mye de tar av livet ditt)
const DC_HP = { sk: 8, tri: 90, boss: 900 }, DC_DMG = { sk: 4, tri: 22, boss: 30, stomp: 15 };
//#slutt
//#blokk 0344 DC_WALLS

// Veggene: o='x' er en vegg som går øst–vest (stopper deg i nord–sør), o='y' går nord–sør. z0–z1 = høyden veggen gjelder for.
const DC_WALLS = [
  { o: 'x', c: -DC_HX, a0: -DC_HX - 18, a1: DC_HX + 18, z0: -50, z1: 3000 },
  { o: 'x', c: DC_HX, a0: -DC_HX - 18, a1: -DC_GATE, z0: -50, z1: 3000 },
  { o: 'x', c: DC_HX, a0: DC_GATE, a1: DC_HX + 18, z0: -50, z1: 3000 },
  { o: 'x', c: DC_HX, a0: -DC_GATE, a1: DC_GATE, z0: 170, z1: 3000 },
  { o: 'y', c: -DC_HX, a0: -DC_HX - 18, a1: DC_HX + 18, z0: -50, z1: 3000 },
  { o: 'y', c: DC_HX, a0: -DC_HX - 18, a1: DC_HX + 18, z0: -50, z1: 3000 },
  { o: 'y', c: DC_R1.x0, a0: DC_R1.yt, a1: DC_R1.yb, z0: -50, z1: 300 },        // rekkverk langs trapp 1
  { o: 'x', c: DC_R1.yt, a0: DC_R1.x0, a1: DC_HX, z0: -50, z1: 190 },           // under toppen av trapp 1
  { o: 'x', c: DC_R1.yb, a0: DC_R1.x0, a1: DC_HX, z0: 190, z1: 300 },           // rekkverk rundt trappehullet i 2. etasje
  { o: 'x', c: DC_R1.yb, a0: DC_R1.x0, a1: DC_HX, z0: -50, z1: 190, lock: 1 },  // bein-port 1
  { o: 'y', c: DC_R2.x1, a0: DC_R2.yb, a1: DC_R2.yt, z0: 200, z1: 530 },        // rekkverk langs trapp 2
  { o: 'x', c: DC_R2.yt, a0: -DC_HX, a1: DC_R2.x1, z0: 200, z1: 420 },          // under toppen av trapp 2
  { o: 'x', c: DC_R2.yb, a0: -DC_HX, a1: DC_R2.x1, z0: 420, z1: 530 },          // rekkverk rundt trappehullet på taket
  { o: 'x', c: DC_R2.yb, a0: -DC_HX, a1: DC_R2.x1, z0: 200, z1: 420, lock: 2 }  // bein-port 2
];
//#slutt
//#blokk 0345 DC_H0

let DC_H0;
//#slutt
//#blokk 0346 dcH0

const dcH0 = () => DC_H0 === undefined ? (DC_H0 = terrainH(DCX, DCY)) : DC_H0;
//#slutt
//#blokk 0347 dcFoot

const dcFoot = (x, y, m = 0) => Math.abs(x - DCX) < DC_HX + m && Math.abs(y - DCY) < DC_HX + m;
//#slutt
//#blokk 0348 dcNear

const dcNear = (x, y, r) => Math.hypot(x - DCX, y - DCY) < r;
//#slutt
//#blokk 0349 dcRampIn

const dcRampIn = (R, lx, ly) => lx > R.x0 && lx < R.x1 && ly > Math.min(R.yb, R.yt) && ly < Math.max(R.yb, R.yt);
//#slutt
//#blokk 0350 dcRampH

const dcRampH = (R, ly) => DC_F[R.f] + (DC_F[R.f + 1] - DC_F[R.f]) * clamp((ly - R.yb) / (R.yt - R.yb), 0, 1);
//#slutt
//#blokk 0351 dcFloorOf

const dcFloorOf = rel => rel > 440 ? 2 : rel > 210 ? 1 : 0;
//#slutt
//#blokk 0352 dcSurfRel

// Gulvet under deg inne i slottet: det høyeste gulvet (eller trappetrinnet) som ikke er over hodet ditt
function dcSurfRel(lx, ly, rel) {
  let best = DC_F[0];
  const c = h => { if (h <= rel + 40 && h > best) best = h; };
  const in1 = dcRampIn(DC_R1, lx, ly), in2 = dcRampIn(DC_R2, lx, ly);
  if (!in1) c(DC_F[1]); else c(dcRampH(DC_R1, ly));
  if (!in2) c(DC_F[2]); else c(dcRampH(DC_R2, ly));
  return best;
}
//#slutt
//#blokk 0353 dcSurf

function dcSurf(x, y, h) { const H0 = dcH0(); return H0 + dcSurfRel(x - DCX, y - DCY, (h === undefined ? H0 : h) - H0); }
//#slutt
//#blokk 0354 dcPush

// Vegger, rekkverk, søyler og tårn stopper deg (rel = høyden føttene dine er på, målt fra slottsgulvet)
function dcPush(o, rad = 12, rel = 0) {
  if (Math.abs(o.x - DCX) > DC_HX + 140 || Math.abs(o.y - DCY) > DC_HX + 140) return;
  const T = DC_WT / 2 + rad, D = g.dc;
  for (const w of DC_WALLS) {
    if (rel < w.z0 || rel >= w.z1) continue;
    if (w.lock && !(D && (w.lock === 1 ? D.lock1 : D.lock2))) continue;
    const lx = o.x - DCX, ly = o.y - DCY;
    if (w.o === 'x') { if (Math.abs(ly - w.c) < T && lx > w.a0 - rad && lx < w.a1 + rad) o.y = DCY + w.c + (ly < w.c ? -T : T); }
    else if (Math.abs(lx - w.c) < T && ly > w.a0 - rad && ly < w.a1 + rad) o.x = DCX + w.c + (lx < w.c ? -T : T);
  }
  const circ = (cx, cy, r) => { const dx = o.x - cx, dy = o.y - cy, d = Math.hypot(dx, dy), R0 = r + rad; if (d < R0 && d > 0.01) { o.x = cx + dx / d * R0; o.y = cy + dy / d * R0; } };
  if (rel < 440) for (const [px, py] of DC_PIL) circ(DCX + px, DCY + py, DC_PILR);
  for (const [tx, ty] of DC_TOW) circ(DCX + tx, DCY + ty, DC_TOWR);
  if (rel >= 440) { circ(DCX, DCY - 330, 78); circ(DCX + 220, DCY - 300, 40); }   // tronen og reiret på taket
}
//#slutt
//#blokk 0355 dcSolid

// Dyr og andre som ikke hører hjemme i slottet holdes utenfor hele slottet
function dcSolid(o, rad = 14) {
  const lx = o.x - DCX, ly = o.y - DCY, E = DC_HX + DC_WT / 2 + rad;
  if (Math.abs(lx) > E || Math.abs(ly) > E) { dcPush(o, rad, 0); return; }
  const px = E - Math.abs(lx), py = E - Math.abs(ly);
  if (px < py) o.x = DCX + Math.sign(lx || 1) * E; else o.y = DCY + Math.sign(ly || 1) * E;
}
//#slutt
//#blokk 0356 dcKeepIn

// Hver fiende holder seg i sin egen etasje
function dcKeepIn(o, f, m) {
  let lx = o.x - DCX, ly = o.y - DCY; const lx0 = lx, ly0 = ly, lim = DC_HX - DC_WT / 2 - m;
  ly = clamp(ly, -lim, lim);
  if (f === 0) { lx = clamp(lx, -lim, lim); if (lx > DC_R1.x0 - m && ly < DC_R1.yb + m) lx = DC_R1.x0 - m; }
  else if (f === 1) lx = clamp(lx, DC_R2.x1 + m, DC_R1.x0 - m);
  else lx = clamp(lx, DC_R2.x1 + m, lim);
  o.x = DCX + lx; o.y = DCY + ly;
  return lx !== lx0 || ly !== ly0;
}
//#slutt
//#blokk 0357 fxH

// Høyden effekter (gnister, piler, tall over hodet) tegnes i: gulvet du står på når du er inne i slottet
function fxH(x, z) {
  const D = g.dc;
  if (D && D.pf >= 0 && dcFoot(x, z, 30)) { const p = g.p; return Math.abs(x - p.x) < 70 && Math.abs(z - p.y) < 70 && p.h !== undefined ? p.h - p.z : dcH0() + DC_F[D.pf]; }
  if (pondDist(x, z) === 0) return Math.max(POND_W, groundH(x, z));                     // på vannflaten i haidammen
  return groundH(x, z);
}
//#slutt
//#blokk 0359 dcPath

function dcPath(ax, ay, bx, by) {      // samme slags slyngete sti som stiene fra bålet
  const L = dist(ax, ay, bx, by), n = Math.max(3, Math.round(L / 30)), nx = -(by - ay) / L, ny = (bx - ax) / L, sd = (ax * .013 + by * .007) % 6.28, pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, w2 = Math.sin(t * Math.PI) * (Math.sin(t * 7.3 + sd) * 45 + Math.sin(t * 2.3 + sd * 2) * 90 + Math.sin(t * 17 + sd) * 8); pts.push([ax + (bx - ax) * t + nx * w2, ay + (by - ay) * t + ny * w2]); }
  pts.push([bx, by - 40]);
  return pts;
}
//#slutt
//#blokk 0360 dcSaveProg

// ---------- Logikk ----------
function dcSaveProg(k, v) { hero.dcSave = hero.dcSave || {}; hero.dcSave[k] = v; saveHero(); }
//#slutt
//#blokk 0361 newDino

function newDino() {
  const sk = [];
  for (let i = 0; i < 25; i++) {                                    // 25 skjeletter står oppstilt som en hær, med front mot porten
    const c = i % 5, r = (i / 5) | 0, x = DCX - 190 + c * 72 + (r % 2) * 22, y = DCY - 210 + r * 62;
    sk.push({ x, y, hx: x, hy: y, hp: DC_HP.sk, max: DC_HP.sk, hit: 0, walk: 0, spd: 0, atk: 0, cd: rand(0, 1), awake: false, wake: rand(0.1, 1.6) });
  }
  const tri = [[-150, -40], [150, -40], [0, -230]].map(([x, y]) => ({ x: DCX + x, y: DCY + y, hx: DCX + x, hy: DCY + y, hp: DC_HP.tri, max: DC_HP.tri, st: 'idle', t: rand(.3, 1.2), dx: 0, dy: 1, hit: 0, walk: 0, spd: 0, hitP: false, ang: 0 }));
  // Lagret fremgang (v5.3): etasjer du har ryddet og kongen du har beseiret, er fortsatt ryddet neste gang – også etter at du har dødd
  const S = hero.dcSave || {};
  if (S.f1) sk.length = 0; if (S.f2) tri.length = 0;
  const D0 = { found: false, pf: -1, told: [false, false, false], sk, tri, lock1: !S.f1, lock2: !S.f2, waves: [],
    boss: { x: DCX, y: DCY - 200, hp: DC_HP.boss, max: DC_HP.boss, st: 'sleep', t: 0, hit: 0, walk: 0, spd: 0, alive: true, seen: false, hitP: false, stompT: 6, fall: 0 },
    chests: [-120, 0, 120].map(x => ({ x: DCX + x, y: DCY - 205 - Math.abs(x) * .1, show: false, open: false })) };
  if (S.boss) { D0.boss.alive = false; D0.boss.hp = 0; D0.boss.fall = 1; D0.chests.forEach((c, i) => { c.show = true; c.open = !!(S.chests && S.chests[i]); }); }
  return D0;
}
//#slutt
//#blokk 0362 dcSetup

// Kjøres i newGame: rydder plass til slottet og legger en sti fra bålet dit
function dcSetup() {
  const far = (o, r) => Math.max(Math.abs(o.x - DCX), Math.abs(o.y - DCY)) > r;
  const P = dcPath(FX + 150, FY + 30, DCX, DCY + DC_HX + 80);
  P.box = [Math.min(...P.map(q => q[0])), Math.max(...P.map(q => q[0])), Math.min(...P.map(q => q[1])), Math.max(...P.map(q => q[1]))];
  g.paths.push(P); g.dcPath = P;
  const nearP = (x, y, d) => { if (x < P.box[0] - d || x > P.box[1] + d || y < P.box[2] - d || y > P.box[3] + d) return false;
    for (let i = 0; i < P.length - 1; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / l2, 0, 1); if (Math.hypot(x - ax - dx * t, y - ay - dy * t) < d) return true; } return false; };
  g.trees = g.trees.filter(t => far(t, 640) && !nearP(t.x, t.y, 30));
  g.rocks = g.rocks.filter(r => far(r, 620) && !nearP(r.x, r.y, 24));
  g.bushes = g.bushes.filter(b => far(b, 620) && !nearP(b.x, b.y, 24));
  g.tufts = g.tufts.filter(t => far(t, 560));
  g.chests = g.chests.filter(c => far(c, 660));
  g.cabins = g.cabins.filter(c => dist(c.x, c.y, DCX, DCY) > 950);
  const keep = g.bases.map(B => dist(B.x, B.y, DCX, DCY) > 1300);      // skurkeslott som står for nær, fjernes
  if (keep.includes(false)) {
    const map = []; let n = 0; keep.forEach((k, i) => { map[i] = k ? n++ : -1; });
    g.bases = g.bases.filter((B, i) => keep[i]); g.villains = g.villains.filter(v => keep[v.base]); g.villains.forEach(v => { v.base = map[v.base]; });
  }
  g.dc = newDino();
}
//#slutt
//#blokk 0363 dcHurt

function dcHurt(dmg, from, kb = 0) {
  const p = g.p; if (g.sleep || g.ride) return;
  g.hp -= dmg; p.hurt = 1; g.cause = 'dino'; g.flash = Math.max(g.flash, 0.35); g.shake = Math.max(g.shake, dmg > 20 ? 0.35 : 0.12);
  if (kb && from) { const dx = p.x - from.x, dy = p.y - from.y, l = Math.hypot(dx, dy) || 1; p.vx = dx / l * kb; p.vy = dy / l * kb; }
  sfx('animal');
}
//#slutt
//#blokk 0364 dcRescue

// Blir livet ditt tomt inne i slottet, kaster monstrene deg ut (det du har beseiret, er fortsatt borte)
function dcRescue() {
  const D = g.dc, p = g.p; if (!D || !dcFoot(p.x, p.y, 60)) return false;
  g.hp = 40; p.x = DCX + rand(-30, 30); p.y = DCY + DC_HX + 150; p.h = undefined; p.z = 0; p.vx = 0; p.vy = 120; p.vz = 260;
  for (const s of D.sk) { s.awake = false; s.wake = rand(0.3, 1.6); s.x = s.hx; s.y = s.hy; }
  for (const t of D.tri) { t.st = 'idle'; t.x = t.hx; t.y = t.hy; t.t = 1; }
  if (D.boss.alive) { D.boss.st = 'sleep'; D.boss.x = DCX; D.boss.y = DCY - 200; } D.waves = [];
  g.flash = 0.5; g.shake = 0.3; burst(p.x, p.y - 30, '#ece6d2', 20);
  toast('💀 Uff! Monstrene i Beinslottet kastet deg ut. De du har beseiret, er fortsatt borte – spis litt og prøv igjen!'); sfx('boom');
  return true;
}
//#slutt
//#blokk 0365 updateDino

function updateDino(dt) {
  const p = g.p, D = g.dc; if (!D) return;
  const H0 = dcH0(), inside = dcFoot(p.x, p.y, -4) && !g.ride, rel = (p.h === undefined ? H0 : p.h - p.z) - H0;
  D.pf = inside ? dcFloorOf(rel) : -1; D.rel = rel;
  if (!D.found && dcNear(p.x, p.y, 1500)) { D.found = true; questAdd('dinoverden'); toast('🦖 Du har kommet til Dinoverdenen! Det kjempestore Beinslottet står midt i den. Tør du gå inn porten?'); sfx('roar'); }
  if (D.pf >= 0 && !D.told[D.pf]) {
    D.told[D.pf] = true;
    toast(['💀 1. etasje: 25 skjeletter vokter slottet! Knus alle, så åpner bein-porten ved trappa i hjørnet.',
           '🦕 2. etasje: Tre skjelett-triceratopser! De stanger. Lur dem til å løpe inn i en søyle – da blir de svimle og tar dobbel skade.',
           '🦖 Taket: Skjelett-T-rex-kongen! Han er 10 ganger så sterk som en triceratops. Hopp over sjokkbølgene når han stamper!'][D.pf]);
  }
  if (!dcNear(p.x, p.y, 1600)) return;                                 // fiendene står stille når du er langt unna
  const sameF = (f) => D.pf === f && Math.abs(rel - DC_F[f]) < 60;
  // --- 1. etasje: skjelettene ---
  const s0 = sameF(0); D.skT = (D.skT || 0) - dt;
  for (const s of D.sk) {
    s.hit = Math.max(0, s.hit - dt); s.atk = Math.max(0, s.atk - dt); s.cd -= dt;
    const dp = dist(s.x, s.y, p.x, p.y);
    if (!s.awake && s0 && (dp < 300 || s.hit > 0)) { s.wake -= dt; if (s.wake <= 0 || s.hit > 0) { s.awake = true; if (Math.random() < .25) floatText(s.x, s.y - 70, 'Klapre-klapre! 💀'); } }
    let tx = s.hx, ty = s.hy, sp = 55;
    if (s.awake && s0) { tx = p.x; ty = p.y; sp = 102; }
    else if (s.awake && dist(s.x, s.y, s.hx, s.hy) < 15) s.awake = false;
    const dx = tx - s.x, dy = ty - s.y, l = Math.hypot(dx, dy);
    if (l > 10 && !(s.awake && s0 && dp < 26)) { s.x += dx / l * sp * dt; s.y += dy / l * sp * dt; s.spd = sp; s.walk += dt * sp / 14; } else s.spd = 0;
    s.face = s.awake && s0 && dp < 160 ? Math.atan2(p.x - s.x, p.y - s.y) : (s.spd > 0 ? Math.atan2(dx, dy) : 0);
    if (s0 && s.awake && dp < 36 && s.cd <= 0 && D.skT <= 0) { s.cd = 1.4; s.atk = 0.5; s.hitP = false; D.skT = 0.45; }   // bare ett skjelett slår om gangen
    if (s.atk > 0 && s.atk < 0.3 && !s.hitP) { s.hitP = true; if (s0 && dp < 42) dcHurt(DC_DMG.sk, s, 50); }
  }
  for (let i = 0; i < D.sk.length; i++) for (let j = i + 1; j < D.sk.length; j++) {           // de dytter litt på hverandre, så de ikke står oppå hverandre
    const a = D.sk[i], b = D.sk[j], ex = a.x - b.x, ey = a.y - b.y, e2 = ex * ex + ey * ey;
    if (e2 < 576 && e2 > 0.01) { const e = Math.sqrt(e2), k = (24 - e) * .5; a.x += ex / e * k; a.y += ey / e * k; b.x -= ex / e * k; b.y -= ey / e * k; }
  }
  for (const s of D.sk) { dcPush(s, 11, DC_F[0]); dcKeepIn(s, 0, 12); }
  if (D.lock1 && !D.sk.length) { D.lock1 = false; dcSaveProg('f1', true); toast('🔓 Alle 25 skjelettene er knust! Bein-porten ved trappa er åpen – gå opp til 2. etasje! 💾 Lagret: 1. etasje er ryddet.'); sfx('levelup'); }
  // --- 2. etasje: triceratopsene stanger ---
  const s1 = sameF(1);
  for (const t of D.tri) {
    t.hit = Math.max(0, t.hit - dt); t.t -= dt;
    const dp = dist(t.x, t.y, p.x, p.y); let sp = 0, gx = t.x, gy = t.y;
    if (!s1 && t.st !== 'idle') { t.st = 'home'; }
    if (t.st === 'idle') { if (s1 && dp < 560) { t.st = 'aim'; t.t = 1.0; sfx('roar'); } }
    else if (t.st === 'home') { gx = t.hx; gy = t.hy; sp = 70; if (dist(t.x, t.y, t.hx, t.hy) < 20) t.st = 'idle'; if (s1) { t.st = 'aim'; t.t = 0.8; } }
    else if (t.st === 'aim') {                                         // skraper med foten og sikter
      const l = dp || 1; t.dx = (p.x - t.x) / l; t.dy = (p.y - t.y) / l;
      if (t.t <= 0) { t.st = 'charge'; t.t = 1.7; t.hitP = false; sfx('fall'); }
    } else if (t.st === 'charge') {
      t.x += t.dx * 300 * dt; t.y += t.dy * 300 * dt; t.spd = 300; t.walk += dt * 300 / 26;
      if (!t.hitP && dp < 72 && p.z < 40) { t.hitP = true; dcHurt(DC_DMG.tri, t, 420); t.st = 'tired'; t.t = 1.4; }
      else if (t.t <= 0) { t.st = 'aim'; t.t = 0.9; }
    } else if (t.st === 'tired' || t.st === 'stun') { if (t.t <= 0) { t.st = 'aim'; t.t = 0.7; } }
    if (sp > 0) { const mx = gx - t.x, my = gy - t.y, ml = Math.hypot(mx, my); if (ml > 4) { t.x += mx / ml * sp * dt; t.y += my / ml * sp * dt; t.walk += dt * sp / 26; t.dx = mx / ml; t.dy = my / ml; } t.spd = sp; }
    else if (t.st !== 'charge') t.spd = 0;
    const o = { x: t.x, y: t.y }; dcPush(o, 38, DC_F[1]); const hitWall = dcKeepIn(o, 1, 40) || Math.hypot(o.x - t.x, o.y - t.y) > 1;
    t.x = o.x; t.y = o.y;
    if (t.st === 'charge' && hitWall) { t.st = 'stun'; t.t = 2.4; g.shake = Math.max(g.shake, 0.3); burst(t.x, t.y - 50, '#ece6d2', 14); floatText(t.x, t.y - 150, 'BONK! Svimmel 💫'); sfx('boom'); }
  }
  for (let i = 0; i < D.tri.length; i++) for (let j = i + 1; j < D.tri.length; j++) { const a = D.tri[i], b = D.tri[j], ex = a.x - b.x, ey = a.y - b.y, e = Math.hypot(ex, ey); if (e < 90 && e > .01) { const k = (90 - e) * .5; a.x += ex / e * k; a.y += ey / e * k; b.x -= ex / e * k; b.y -= ey / e * k; } }
  if (D.lock2 && !D.tri.length) { D.lock2 = false; dcSaveProg('f2', true); toast('🔓 Alle triceratopsene er beseiret! Porten til taket er åpen. Kongen venter der oppe … 👑 💾 Lagret: 2. etasje er ryddet.'); sfx('levelup'); }
  // --- Taket: Skjelett-T-rex-kongen ---
  const B = D.boss, s2 = sameF(2);
  if (B.alive) {
    B.hit = Math.max(0, B.hit - dt); B.t -= dt;
    const dp = dist(B.x, B.y, p.x, p.y), rage = B.hp < B.max / 2; let sp = 0, gx = B.x, gy = B.y;
    if (!s2 && B.st !== 'sleep') B.st = 'home';
    if (B.st === 'sleep') { if (s2 && dp < 720) { B.st = 'wake'; B.t = 1.8; sfx('roar'); g.shake = 0.5; if (!B.seen) { B.seen = true; toast('👑🦖 GRRRAAAOOOR! Skjelett-T-rex-kongen har våknet! Slå ham når han er sliten etter et bitt.'); } } }
    else if (B.st === 'wake') { if (B.t <= 0) B.st = 'chase'; }
    else if (B.st === 'home') { gx = DCX; gy = DCY - 200; sp = 90; if (dist(B.x, B.y, gx, gy) < 30) B.st = 'sleep'; if (s2) B.st = 'chase'; }
    else if (B.st === 'chase') {
      gx = p.x; gy = p.y; sp = rage ? 150 : 122; B.stompT -= dt;
      if (dp < 140) { B.st = 'bite'; B.t = 0.6; B.hitP = false; }
      else if (B.stompT <= 0) { B.st = 'stomp'; B.t = 1.0; B.hitP = false; B.stompT = rage ? 5 : 7; }
    } else if (B.st === 'bite') {
      if (B.t <= 0.25 && !B.hitP) { B.hitP = true; if (dp < 165 && p.z < 70) dcHurt(DC_DMG.boss, B, 380); }
      if (B.t <= 0) { B.st = 'tired'; B.t = rage ? 1.4 : 1.9; }
    } else if (B.st === 'stomp') {                                     // hopper opp og stamper: en sjokkbølge ruller utover gulvet
      if (B.t <= 0.3 && !B.hitP) { B.hitP = true; D.waves.push({ x: B.x, y: B.y, r: 60, hit: false }); g.shake = 0.6; sfx('boom'); burst(B.x, B.y, '#cfc3a4', 24); }
      if (B.t <= 0) B.st = 'chase';
    } else if (B.st === 'tired') { if (B.t <= 0) B.st = 'chase'; }
    if (sp > 0) { const mx = gx - B.x, my = gy - B.y, ml = Math.hypot(mx, my); if (ml > 5) { B.x += mx / ml * sp * dt; B.y += my / ml * sp * dt; B.walk += dt * sp / 40; } B.spd = sp; } else B.spd = 0;
    const o = { x: B.x, y: B.y }; dcPush(o, 70, DC_F[2]); dcKeepIn(o, 2, 72); B.x = o.x; B.y = o.y;
  } else B.fall = Math.min(1, B.fall + dt * 0.8);
  for (const w of D.waves) {
    w.r += 430 * dt;
    if (!w.hit && s2 && p.z < 14 && Math.abs(dist(w.x, w.y, p.x, p.y) - w.r) < 26) { w.hit = true; dcHurt(DC_DMG.stomp, w, 260); floatText(p.x, p.y - 80, 'Hopp over bølgene! ⬆️'); }
  }
  D.waves = D.waves.filter(w => w.r < 620);
}
//#slutt
//#blokk 0366 dcDamage

function dcDamage(k, o, dmg, src) {
  const D = g.dc; if (!D) return;
  const push = (len) => { const kx = o.x - src.x, ky = o.y - src.y, kl = Math.hypot(kx, ky) || 1; o.x += kx / kl * len; o.y += ky / kl * len; };
  if (k === 'dskel') {
    if (!D.sk.includes(o)) return;
    o.hp -= dmg; o.hit = 0.25; o.awake = true; push(src.push || 16); burst(o.x, o.y - 20, '#ffffff', 5);
    if (o.hp <= 0) {
      D.sk = D.sk.filter(q => q !== o); burst(o.x, o.y - 15, '#ece6d2', 22); floatText(o.x, o.y - 40, `💀 ${D.sk.length} igjen`);
      enemyXP('dskel', o.x, o.y); questAdd('skjelett');
    }
  } else if (k === 'dtri') {
    if (!D.tri.includes(o)) return; const weak = o.st === 'stun' || o.st === 'tired';
    o.hp -= dmg * (weak ? 2 : 1); o.hit = 0.2; burst(o.x, o.y - 50, '#ffffff', 7);
    if (weak) floatText(o.x, o.y - 130, 'Dobbel skade! 💥'); else push((src.push || 14) * 0.3);
    if (o.st === 'idle') { o.st = 'aim'; o.t = 0.6; }
    if (o.hp <= 0) {
      D.tri = D.tri.filter(q => q !== o); g.shake = 0.35; burst(o.x, o.y - 40, '#ece6d2', 36);
      floatText(o.x, o.y - 120, 'Triceratopsen falt sammen! 🦴'); addRes('iron', 3); enemyXP('dtri', o.x, o.y);
    }
  } else if (k === 'dboss') {
    const B = o; if (!B.alive) return; const weak = B.st === 'tired';
    B.hp -= dmg * (weak ? 2 : 1); B.hit = 0.2; burst(B.x, B.y - 120, '#ffffff', 9);
    if (weak) floatText(B.x, B.y - 260, 'Dobbel skade! 💥');
    if (B.st === 'sleep') { B.st = 'wake'; B.t = 1.2; sfx('roar'); }
    if (B.hp <= B.max / 2 && !B.raged) { B.raged = true; floatText(B.x, B.y - 280, 'Kongen blir rasende! 😡'); sfx('roar'); g.shake = 0.5; }
    if (B.hp <= 0) {
      B.alive = false; B.hp = 0; D.waves = []; g.shake = 0.8; burst(B.x, B.y - 80, '#ece6d2', 60); burst(B.x, B.y - 80, '#ffd36b', 30);
      D.chests.forEach(c => c.show = true); sfx('fall'); dcSaveProg('boss', true);
      const newBow = giveWeapon('beinbue', true);
      toast(`🏆 DU KLARTE DET! Du beseiret hele Beinslottet!` + (newBow ? ` Du fikk 💀 SKJELETTBUEN (tast ${slotKey('beinbue')})!` : '') + ' Og se – tre skjelettkister foran tronen! 💀📦');
      if (newBow) burst(g.p.x, g.p.y - 40, '#ece6d2', 30);
      enemyXP('dboss', B.x, B.y); questAdd('dinoslott');
    }
  }
}
//#slutt
//#blokk 0367 dcOpenChest

function dcOpenChest(C) {
  if (!C || !C.show || C.open) return;
  C.open = true; dcSaveProg('chests', g.dc.chests.map(c => c.open)); burst(C.x, C.y - 20, '#ece6d2', 30); burst(C.x, C.y - 20, '#ffd36b', 20); g.shake = 0.2;
  const a = addRes('iron', 4), b = addRes('stone', 4); g.cooked += 2; addXP(50, C.x, C.y);
  openLootChest();
  const left = g.dc.chests.filter(c => !c.open).length;
  toast(`💀📦 Skjelettkiste: 🔩 +${a}  🪨 +${b}  🍗 +2  ⭐ +50 XP – og en skatt!` + (left ? ` (${left} kiste${left > 1 ? 'r' : ''} igjen)` : ''));
}
//#slutt
//#blokk 0375 drawDinoHud

// Livsmåleren til kongen øverst på skjermen, og små målere over triceratopsene
function drawDinoHud() {
  const D = g.dc; if (!D || D.pf < 0) return;
  if (D.pf === 1) for (const t of D.tri) if (t.hp < t.max) bar(t.x, 150, t.y, t.hp / t.max, t.st === 'stun' || t.st === 'tired' ? '#ffd166' : '#ff6b5b');
  const B = D.boss;
  if (D.pf === 2 && B.alive && B.st !== 'sleep') {
    const w = Math.min(440, VW * 0.7), x = (VW - w) / 2, y = 54;
    octx.fillStyle = 'rgba(0,0,0,.6)'; octx.fillRect(x - 4, y - 4, w + 8, 22);
    octx.fillStyle = B.st === 'tired' ? '#ffd166' : '#e5484d'; octx.fillRect(x, y, w * B.hp / B.max, 14);
    octx.font = 'bold 14px system-ui'; octx.textAlign = 'center'; octx.fillStyle = '#000'; octx.fillText(`💀 Skjelett-T-rex-kongen  ${Math.ceil(B.hp)} / ${B.max}`, VW / 2 + 1, y - 9);
    octx.fillStyle = '#fff'; octx.fillText(`💀 Skjelett-T-rex-kongen  ${Math.ceil(B.hp)} / ${B.max}`, VW / 2, y - 10);
  }
}
//#slutt
//#blokk 0376 GHX,GHY

// ================== Spøkelseshuset (v3.9) ==================
// Et gammelt hus i skogen nordvest for bålet. Inne vokter heksa tryllestaven sin. Tar hun deg, kaster hun deg ut!
// Spøkelsene inne er skumle, men snille: de sier bare «Bø!».
const GHX = FX + Math.cos(-2.62) * 1500, GHY = FY + Math.sin(-2.62) * 1500;
//#slutt
//#blokk 0377 GH_HX,GH_HY,GH_WT,GH_DOOR,GH_WH
   // nordvest for bålet, i skogen
const GH_HX = 150, GH_HY = 115, GH_WT = 10, GH_DOOR = 30, GH_WH = 105;
//#slutt
//#blokk 0378 GH_PED,GH_CAUL,GH_TABLE
           // halv bredde/dybde, veggtykkelse, halv døråpning, vegghøyde
const GH_PED = { x: 0, y: -78 }, GH_CAUL = { x: -88, y: -18 }, GH_TABLE = { x: 82, y: -10 };
//#slutt
//#blokk 0379 GH_H0
   // sokkel med staven, gryte og bord (husets system, +y = fram)
let GH_H0;
//#slutt
//#blokk 0380 ghH0

const ghH0 = () => GH_H0 === undefined ? (GH_H0 = terrainH(GHX, GHY)) : GH_H0;
//#slutt
//#blokk 0381 ghLocal

const ghLocal = (x, y) => ({ lx: x - GHX, ly: y - GHY });
//#slutt
//#blokk 0382 inGH

function inGH(x, y, m = 0) { const l = ghLocal(x, y); return Math.abs(l.lx) < GH_HX - m && Math.abs(l.ly) < GH_HY - m; }
//#slutt
//#blokk 0383 ghPush

// Veggene: du kommer bare inn og ut gjennom døra foran. Gryta, sokkelen og bordet står i veien.
function ghPush(o, rad = 12) {
  const lx = o.x - GHX, ly = o.y - GHY;
  if (Math.abs(lx) > GH_HX + GH_WT + rad || Math.abs(ly) > GH_HY + GH_WT + rad) return;
  const T = GH_WT / 2 + rad;
  for (const wy of [-GH_HY, GH_HY]) if (Math.abs(ly - wy) < T && Math.abs(lx) < GH_HX + T && !(wy > 0 && Math.abs(lx) < GH_DOOR - 4)) o.y = GHY + wy + (ly < wy ? -T : T);
  for (const wx of [-GH_HX, GH_HX]) if (Math.abs(lx - wx) < T && Math.abs(ly) < GH_HY + T) o.x = GHX + wx + (lx < wx ? -T : T);
  for (const [c, r] of [[GH_CAUL, 24], [GH_PED, 20], [GH_TABLE, 30]]) {
    const dx = o.x - (GHX + c.x), dy = o.y - (GHY + c.y), d = Math.hypot(dx, dy), R0 = r + rad * .6;
    if (d < R0 && d > 0.01) { o.x = GHX + c.x + dx / d * R0; o.y = GHY + c.y + dy / d * R0; }
  }
}
//#slutt
//#blokk 0384 ghNear

const ghNear = (x, y, r) => Math.hypot(x - GHX, y - GHY) < r;
//#slutt
//#blokk 0385 newGhostHouse

// ---------- Logikk: heksa, spøkelsene og tryllestaven ----------
function newGhostHouse() {
  const wp = [[-110, -80], [110, -80], [110, 70], [-20, 75], [-115, 60]];
  return { found: false, wand: hero.owned.includes('heksestav'), wp, laugh: 0,
    witch: { x: GHX + wp[0][0], y: GHY + wp[0][1], i: 1, st: 'patrol', t: 0, ang: 0, walk: 0, spd: 0, cool: 0, cast: 0 },
    ghosts: [0, 1, 2].map(i => ({ a: i * 2.1, r: 50 + i * 18, h: 40 + i * 12, sp: 0.35 + i * 0.12, boo: 0, x: GHX, y: GHY })) };
}
//#slutt
//#blokk 0386 updateGhostHouse

function updateGhostHouse(dt) {
  const p = g.p, G = g.gh || (g.gh = newGhostHouse()), w = G.witch;
  if (!G.found && ghNear(p.x, p.y, 520)) { G.found = true; toast('👻 Du fant spøkelseshuset! Heksa vokter tryllestaven sin der inne. Snik deg inn – men ikke la henne ta deg!'); sfx('magic'); }
  const inside = inGH(p.x, p.y, 4) && p.z < 40;
  w.cool = Math.max(0, w.cool - dt); w.cast = Math.max(0, w.cast - dt); G.laugh = Math.max(0, G.laugh - dt);
  const dp = dist(w.x, w.y, p.x, p.y);
  // Heksa ser deg når du er inne og nær nok (lengre unna hvis du har tatt staven hennes, eller hvis du løper)
  const seeR = G.wand ? 320 : (p.spd > 130 ? 210 : 150);
  if (w.st === 'patrol' && inside && dp < seeR && w.cool <= 0) { w.st = 'chase'; floatText(w.x, w.y - 110, G.wand ? 'Gi meg staven min! 😠' : 'Hvem er det som sniker? 🧹'); sfx('villain'); }
  if (w.st === 'chase' && (!inside || w.cool > 0)) { w.st = 'patrol'; floatText(w.x, w.y - 110, 'Hmpf! Kom aldri tilbake! 🧹'); }
  let tx, ty, sp;
  if (w.st === 'chase') { tx = p.x; ty = p.y; sp = G.wand ? 150 : 132; }
  else { const q = G.wp[w.i]; tx = GHX + q[0]; ty = GHY + q[1]; sp = 62; if (dist(w.x, w.y, tx, ty) < 12) w.i = (w.i + 1) % G.wp.length; }
  const dx = tx - w.x, dy = ty - w.y, l = Math.hypot(dx, dy) || 1, mv = Math.min(l, sp * dt);
  w.x += dx / l * mv; w.y += dy / l * mv; w.spd = mv / Math.max(dt, 1e-3); w.walk += mv * 0.09; if (l > 1) w.ang = Math.atan2(dx, dy);
  const o = { x: w.x, y: w.y }; ghPush(o, 14); w.x = clamp(o.x, GHX - GH_HX + 20, GHX + GH_HX - 20); w.y = clamp(o.y, GHY - GH_HY + 20, GHY + GH_HY - 22);   // heksa blir inne i huset
  // Tar hun deg, kaster hun deg ut gjennom døra!
  if (w.st === 'chase' && dp < 30 && inside) {
    w.st = 'patrol'; w.cool = 2.5; w.cast = 0.6; G.laugh = 1.5;
    p.x = GHX + rand(-20, 20); p.y = GHY + GH_HY + 95; p.vx = 0; p.vy = 160; p.vz = 330; p.z = Math.max(p.z, 1); p.h = undefined;
    g.flash = 0.2; g.shake = 0.25; burst(p.x, p.y - 30, '#b07bff', 20); burst(p.x, p.y - 30, '#7dff6a', 12);
    floatText(w.x, w.y - 110, 'Hehehe! Ut med deg! 🧹'); toast('🧹💨 Heksa tok deg og kastet deg ut av huset! Prøv å snike deg inn igjen.'); sfx('boom');
  }
  // Spøkelsene svever rundt inne i huset og sier «Bø!»
  for (const s of G.ghosts) {
    s.a += dt * s.sp; s.boo = Math.max(0, s.boo - dt);
    s.x = GHX + Math.cos(s.a) * (s.r + 30 * Math.sin(s.a * 0.7)); s.y = GHY + Math.sin(s.a * 1.3) * 60;
    if (inside && s.boo <= 0 && dist(s.x, s.y, p.x, p.y) < 60) { s.boo = 6; floatText(s.x, s.y - 90, 'Bø! 👻'); sfx('sparkle'); }
  }
}
//#slutt
//#blokk 0387 takeWand

// Hent tryllestaven fra sokkelen
function takeWand() {
  const G = g.gh; if (!G || G.wand) return;
  G.wand = true; giveWeapon('heksestav', true); if (canUse('heksestav')) selectWeapon('heksestav');
  questAdd('heksa'); burst(GHX + GH_PED.x, GHY + GH_PED.y - 40, '#7dff6a', 24); burst(GHX + GH_PED.x, GHY + GH_PED.y - 40, '#c58bff', 18);
  toast(`🪄✨ Du tok heksas tryllestav! Trykk ${WEAPON_SLOTS.indexOf('heksestav') + 1} for å bruke den. Løp ut før heksa tar deg!`); sfx('levelup');
  G.witch.st = 'chase'; G.witch.cool = 0; floatText(G.witch.x, G.witch.y - 110, 'STAVEN MIN! 😱');
}
//#slutt
//#blokk 0404 _v


const _v = { x: 0, y: 0 };
//#slutt
//#blokk 0405 toScreen

function toScreen(x, h, z) {
  const v = R3.tmp.set(x, h + fxH(x, z), z).project(R3.camera);
  if (v.z > 1) return null;
  _v.x = (v.x + 1) / 2 * VW; _v.y = (1 - v.y) / 2 * VH; return _v;
}
//#slutt
//#blokk 0406 bar

function bar(x, h, z, frac, color) {
  const s = toScreen(x, h, z); if (!s) return;
  octx.fillStyle = 'rgba(0,0,0,.55)'; octx.fillRect(s.x - 17, s.y, 34, 6);
  octx.fillStyle = color; octx.fillRect(s.x - 17, s.y, 34 * frac, 6);
}
//#slutt
//#blokk 0408 mapT


let mapT = 0;
//#slutt
//#blokk 0409 initMapUi

function initMapUi() {
  const mm = $('minimap'), stop = e => { e.stopPropagation(); };
  for (const ev of ['touchstart', 'mousedown', 'click']) mm.addEventListener(ev, stop, { passive: true });
  // v5.5.1: åpne/lukke på pointerup (ett trykk holder, også når spillet er travelt), ikke på click
  let mmNed = false, bmNed = false;
  mm.addEventListener('pointerdown', e => { e.stopPropagation(); mmNed = true; }, { passive: true });
  mm.addEventListener('pointerup', e => { e.stopPropagation(); if (mmNed) { mmNed = false; openMap(); } });
  mm.addEventListener('pointercancel', () => { mmNed = false; });
  const bm = $('bigMap'); for (const ev of ['touchstart', 'mousedown', 'click']) bm.addEventListener(ev, stop, { passive: true });
  bm.addEventListener('pointerdown', e => { e.stopPropagation(); bmNed = true; }, { passive: true });
  bm.addEventListener('pointerup', e => { e.stopPropagation(); if (bmNed) { bmNed = false; closeMap(); } });
  bm.addEventListener('pointercancel', () => { bmNed = false; });
}
//#slutt
//#blokk 0410 ExpressionStatement

setTimeout(initMapUi, 0);
//#slutt
//#blokk 0411 FOG_N,FOG_C,FOG_R,FOG_KEY

// ---------- Kartet (v5.3): du ser bare de områdene du har utforsket. Trykk på kartet (eller M) for å se det stort. ----------
const FOG_N = 112, FOG_C = W / FOG_N, FOG_R = 650, FOG_KEY = 'mork3d.kart';
//#slutt
//#blokk 0412 fog
   // rutenett 112 × 112 (100 × 100 per rute), du ser 650 rundt deg
let fog = null;
//#slutt
//#blokk 0413 fogLoad

function fogLoad() {
  fog = { seed: world.seed, a: new Uint8Array(FOG_N * FOG_N), dirty: false, saveT: 0, cv: document.createElement('canvas') };
  fog.cv.width = fog.cv.height = FOG_N;
  try { const s2 = JSON.parse(localStorage.getItem(FOG_KEY)); if (s2 && s2.seed === world.seed) { const b = atob(s2.d); for (let i = 0; i < b.length && i < fog.a.length; i++) fog.a[i] = b.charCodeAt(i); } } catch (e) {}
  const x = fog.cv.getContext('2d'); x.fillStyle = '#fff';
  for (let i = 0; i < fog.a.length; i++) if (fog.a[i]) x.fillRect(i % FOG_N, (i / FOG_N) | 0, 1, 1);
}
//#slutt
//#blokk 0414 fogSave

function fogSave() { try { let b = ''; for (let i = 0; i < fog.a.length; i++) b += String.fromCharCode(fog.a[i]); localStorage.setItem(FOG_KEY, JSON.stringify({ seed: fog.seed, d: btoa(b) })); fog.dirty = false; } catch (e) {} }
//#slutt
//#blokk 0415 fogSeen

const fogSeen = (x, y) => { if (!fog) return true; const i = clamp(Math.floor(x / FOG_C), 0, FOG_N - 1), j = clamp(Math.floor(y / FOG_C), 0, FOG_N - 1); return fog.a[j * FOG_N + i] > 0; };
//#slutt
//#blokk 0416 fogReveal

function fogReveal(dt) {
  if (!fog || fog.seed !== world.seed) fogLoad();
  const p = g.p, r = FOG_R / FOG_C, ci = p.x / FOG_C, cj = p.y / FOG_C, x = fog.cv.getContext('2d'); x.fillStyle = '#fff';
  for (let j = Math.max(0, Math.floor(cj - r)); j <= Math.min(FOG_N - 1, Math.ceil(cj + r)); j++)
    for (let i = Math.max(0, Math.floor(ci - r)); i <= Math.min(FOG_N - 1, Math.ceil(ci + r)); i++) {
      const k2 = j * FOG_N + i; if (fog.a[k2] || Math.hypot(i + .5 - ci, j + .5 - cj) > r) continue;
      fog.a[k2] = 1; fog.dirty = true; x.fillRect(i, j, 1, 1);
    }
  if (fog.dirty && (fog.saveT -= dt) <= 0) { fog.saveT = 4; fogSave(); }
}
//#slutt
//#blokk 0417 mapBase

// Selve kartbildet (biomer, elv, innsjø, jernbane, vulkan) i ønsket størrelse
function mapBase(S) {
  g.mapImgs = g.mapImgs || {}; if (g.mapImgs[S]) return g.mapImgs[S];
  const k = S / W, im = document.createElement('canvas'); im.width = im.height = S;
  const x = im.getContext('2d'), R0 = Math.min(S, 280), d = x.createImageData(R0, R0);
  const COL = { skog: [58, 92, 48], sno: [225, 233, 240], jungel: [34, 110, 40], lava: [70, 40, 34], orken: [222, 192, 130] };
  for (let j = 0; j < R0; j++) for (let i = 0; i < R0; i++) {
    const w = biomeW((i + .5) / R0 * W, (j + .5) / R0 * H), o = (j * R0 + i) * 4;
    for (let ch = 0; ch < 3; ch++) d.data[o + ch] = COL.skog[ch] * w.skog + COL.sno[ch] * w.sno + COL.jungel[ch] * w.jungel + COL.lava[ch] * w.lava + COL.orken[ch] * w.orken;
    d.data[o + 3] = 255;
  }
  { const t = document.createElement('canvas'); t.width = t.height = R0; t.getContext('2d').putImageData(d, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(t, 0, 0, S, S); }
  const L = S / 140;
  x.lineWidth = 2 * L; x.lineCap = 'round';
  for (let i = 0; i < RIVER.length - 1; i++) {
    x.strokeStyle = biomeW(RIVER[i][0], RIVER[i][1]).lava > .5 ? '#ff6a1a' : '#4aa3d8';
    x.beginPath(); x.moveTo(RIVER[i][0] * k, RIVER[i][1] * k); x.lineTo(RIVER[i + 1][0] * k, RIVER[i + 1][1] * k); x.stroke();
  }
  x.fillStyle = '#4aa3d8'; x.beginPath(); x.arc(LAKE_X * k, LAKE_Y * k, LAKE_R * k, 0, 7); x.fill(); x.beginPath(); x.arc(POND_X * k, POND_Y * k, POND_R * k, 0, 7); x.fill();
  if (S > 200) { x.strokeStyle = 'rgba(120,90,60,.8)'; x.lineWidth = 1.2 * L * .6; for (const P of g.paths) { x.beginPath(); P.forEach((q, i) => i ? x.lineTo(q[0] * k, q[1] * k) : x.moveTo(q[0] * k, q[1] * k)); x.stroke(); } }   // stiene på det store kartet
  x.strokeStyle = '#5a4030'; x.lineWidth = 1.5 * L; x.beginPath(); TRACK.forEach((q, i) => i ? x.lineTo(q[0] * k, q[1] * k) : x.moveTo(q[0] * k, q[1] * k)); x.stroke();   // jernbanen
  x.fillStyle = '#b8864a'; x.fillRect(TOWNX * k - 4 * L, (TOWNY + TOWN_OY) * k - 5 * L, 8 * L, 10 * L);
  x.fillStyle = '#2a1e1c'; x.beginPath(); x.arc(VX * k, VY * k, VR * k, 0, 7); x.fill(); x.fillStyle = '#ff8a2a'; x.beginPath(); x.arc(VX * k, VY * k, 2.5 * L, 0, 7); x.fill();
  x.fillStyle = '#ff6a1a'; for (const l of g.lavaPools) { x.beginPath(); x.arc(l.x * k, l.y * k, Math.max(1, l.r * k), 0, 7); x.fill(); }
  x.fillStyle = '#6a6460'; x.fillRect((DCX - DC_HX) * k, (DCY - DC_HX) * k, DC_HX * 2 * k, DC_HX * 2 * k);   // Beinslottet
  return (g.mapImgs[S] = im);
}
//#slutt
//#blokk 0418 drawMapView

// Tegner kartet med tåke over det du ikke har utforsket. big = det store kartet.
function drawMapView(cv2, S, big) {
  const c = cv2.getContext('2d'), k = S / W, L = S / 140, seen = fogSeen;
  if (!fog || fog.seed !== world.seed) fogLoad();
  const tmp = drawMapView.tmp || (drawMapView.tmp = document.createElement('canvas')); if (tmp.width !== S) { tmp.width = tmp.height = S; }
  const t = tmp.getContext('2d'); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, S, S); t.drawImage(mapBase(S), 0, 0);
  t.globalCompositeOperation = 'destination-in'; t.imageSmoothingEnabled = true; t.filter = big ? 'blur(3px)' : 'none'; t.drawImage(fog.cv, 0, 0, S, S); t.filter = 'none'; t.globalCompositeOperation = 'source-over';
  c.fillStyle = '#16130f'; c.fillRect(0, 0, S, S);                                           // tåke: mørkt, ukjent land
  c.strokeStyle = 'rgba(243,234,214,.06)'; c.lineWidth = 1; for (let a = 0; a <= S; a += S / 8) { c.beginPath(); c.moveTo(a, 0); c.lineTo(a, S); c.moveTo(0, a); c.lineTo(S, a); c.stroke(); }
  c.drawImage(tmp, 0, 0);
  c.fillStyle = '#ffb347'; c.beginPath(); c.arc(FX * k, FY * k, 3.5 * L, 0, 7); c.fill();
  for (const b of g.buildings) { c.fillStyle = '#f3ead6'; c.fillRect(b.x * k - L, b.y * k - L, 2 * L, 2 * L); }
  c.fillStyle = '#f3ead6'; for (const cb of g.cabins) if (cb.known) c.fillRect(cb.x * k - 2.5 * L, cb.y * k - 2.5 * L, 5 * L, 5 * L);
  c.fillStyle = '#c8a070'; for (const Bd of g.bridges) if (seen(Bd.x, Bd.y)) { c.save(); c.translate(Bd.x * k, Bd.y * k); c.rotate(Math.atan2(Bd.ny, Bd.nx)); c.fillRect(-4 * L, -1.5 * L, 8 * L, 3 * L); c.restore(); }
  for (const B of g.bases) if (B.known) { c.fillStyle = B.cleared ? '#5aa8ff' : '#e5484d'; c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.arc(B.x * k, B.y * k, 4.5 * L * (big ? .6 : 1), 0, 7); c.fill(); c.stroke(); }
  c.font = `${Math.round(11 * (big ? L * .55 : 1))}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const icon = (ic, x, y, name) => { if (!seen(x, y)) return; c.fillText(ic, x * k, y * k); if (big && name) { c.save(); c.font = `bold ${Math.round(11 * L * .32)}px system-ui`; c.fillStyle = '#000'; c.fillText(name, x * k + 1, y * k + 15 * L * .32 * 1.6 + 1); c.fillStyle = '#f3ead6'; c.fillText(name, x * k, y * k + 15 * L * .32 * 1.6); c.restore(); } };
  icon('👻', GHX, GHY, 'Spøkelseshuset'); icon('🦖', DCX, DCY, 'Beinslottet'); icon('🦈', POND_X, POND_Y, 'Haidammen'); icon('🤠', TOWNX, TOWNY + TOWN_OY, 'Kaktusbyen');
  { const sa = trackPos(ST_A); icon('🚉', sa.x, sa.y, 'Stasjonen'); } icon('🌋', VX, VY, 'Vulkanen'); icon('🔺', PYX, PYY, 'Pyramiden');
  if (hero.lassoTalk && g.lparts) for (const P of g.lparts) if (!lassoHas(P.id)) c.fillText(LPARTS.find(q => q.id === P.id).icon, P.x * k, P.y * k);   // oppdragsmerker vises alltid
  // deg selv: en pil som peker dit du går
  const px = g.p.x * k, py = g.p.y * k, a = Math.atan2(g.p.ix, g.p.iy), r = (big ? 9 : 8) * (big ? L * .45 : 1);
  if (!big) { c.save(); c.strokeStyle = '#ffd34d'; c.lineWidth = 3; c.beginPath(); c.arc(px, py, r * 1.9, 0, 7); c.stroke(); c.restore(); }   // v5.5.1: gul ring rundt deg på det lille kartet
  c.save(); c.translate(px, py); c.rotate(-a); c.fillStyle = '#ffffff'; c.strokeStyle = '#000'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(0, r * 1.5); c.lineTo(r, -r); c.lineTo(0, -r * .4); c.lineTo(-r, -r); c.closePath(); c.fill(); c.stroke(); c.restore();
}
//#slutt
//#blokk 0419 drawMinimap

function drawMinimap() { drawMapView($('minimap'), 140, false); }
//#slutt
//#blokk 0420 openMap

function openMap() {
  if (state !== 'play' || !g) return;
  state = 'map'; resetPointers(); $('bigMap').hidden = false; $('prompt').hidden = true;
  const cv2 = $('bigMapCv'); drawMapView(cv2, cv2.width, true);
  const n = fog ? fog.a.reduce((s2, v) => s2 + v, 0) : 0; $('bigMapPct').textContent = `Du har utforsket ${Math.round(n / fog.a.length * 100)} % av verden`;
}
//#slutt
//#blokk 0421 closeMap

function closeMap() { if (state !== 'map') return; $('bigMap').hidden = true; state = 'play'; resetPointers(); if (g) g.p.cool = Math.max(g.p.cool, 0.3); }
//#slutt
//#blokk 0422 fishHud

function fishHud() {
  const F = g.p.fish, ui = $('fishUI');
  if (!F || curW() !== 'stang' || F.st === 'land') { if (!ui.hidden) ui.hidden = true; return; }
  ui.hidden = false;
  const key = isTouch ? '🎣-knappen' : 'museknappen eller E';
  $('fishTxt').textContent = F.st === 'cast' ? 'Kaster…' : F.st === 'wait' ? 'Vent på napp… 🐟' : F.st === 'bite' ? `NAPP! Trykk ${key} nå! ❗` : F.fight ? 'Fisken drar! Slipp litt! 💦' : `Hold inne ${key} for å sveive inn!`;
  $('fishProg').style.width = (F.st === 'reel' ? F.prog * 100 : 0) + '%'; $('fishTen').style.width = (F.st === 'reel' ? F.ten * 100 : 0) + '%';
  ui.querySelectorAll('.fb').forEach(b => b.style.display = F.st === 'reel' ? '' : 'none');
}
//#slutt
//#blokk 0423 updateHud

function updateHud() {
  fishHud();
  if (performance.now() - mapT > 200) { fogReveal((performance.now() - mapT) / 1000); mapT = performance.now(); }
  $('bHp').style.width = Math.max(0, g.hp) + '%';
  $('bFood').style.width = g.food + '%';
  $('bFire').style.width = g.fuel + '%';
  $('fireLvl').textContent = g.fireLvl;
  $('wood').textContent = `${g.wood}/${cap()}`;
  $('stone').textContent = `${g.stone}/${cap()}`;
  $('iron').textContent = `${g.iron}/${cap()}`;
  { const B = BIOMES[g.biome]; const t = `${B.icon} ${B.n}`; if ($('biome').textContent !== t) $('biome').textContent = t; }
  { const id = curW(), W = WEAPONS[id], lv = heroLevel();
    $('axe').textContent = id === 'oks' ? AXES[g.axe].n : W.n + (wLvl(id) > 1 ? ` ${wLvl(id)}` : ''); $('wIcon').textContent = W.icon; $('lvl').textContent = lv.L;
    if (isTouch && $('act').textContent !== W.icon) $('act').textContent = W.icon;
    const key = [hero.sel, hero.owned.join(), lv.L].join('|');
    if (key !== hotbarKey) {                                   // hurtiglinja tegnes bare på nytt når noe er endret
      hotbarKey = key;
      $('hotbar').innerHTML = WEAPON_SLOTS.map((wid, i) => { if (!hero.owned.includes(wid)) return ''; const Wv = WEAPONS[wid], own = hero.owned.includes(wid), ok = own && lv.L >= Wv.lvl;
        return `<button data-w="${wid}" class="${!own ? 'no' : !ok ? 'lock' : ''} ${hero.sel === wid ? 'on' : ''}" title="${i + 1}: ${Wv.n}${own ? (ok ? '' : ` (nivå ${Wv.lvl})`) : ' (ikke funnet)'}"><span class="k">${(i + 1) % 10}</span>${Wv.icon}${own && !ok ? '<span class="lk">🔒</span>' : ''}</button>`; }).join('')
        + '<button id="invBtn" title="Våpenlager (I)">🎒</button>';
    } }
  $('nights').textContent = g.nights;
  { const on = !!g.sleep; if ($('sleepFx').classList.contains('on') !== on) $('sleepFx').classList.toggle('on', on); }
  $('raw').textContent = g.raw;
  $('cooked').textContent = g.cooked;
  $('bWater').style.width = g.water + '%';
  $('skin').textContent = g.skin;
  devClock();
  const ph = phaseInfo(g.time);
  $('phase').textContent = ph.dark > 0.5 ? `🌙 Natt ${g.nights + 1}` : `☀️ Dag ${g.nights + 1}`;
  const pr = $('prompt');
  if (g.build) {
    const B = BUILDINGS[g.build];
    const html = `<kbd>${isTouch ? WEAPONS[curW()].icon : 'E'}</kbd>Bygg ${B.n.toLowerCase()} &nbsp; <kbd>${isTouch ? '🔨' : 'Esc'}</kbd>Avbryt`;
    if (pr.innerHTML !== html) pr.innerHTML = html;
    pr.hidden = false; return;
  }
  const t = g.sleep ? null : target(), useT = t && USE_K[t.k];
  if (isTouch) { const ub = $('useBtn'), want = !!useT; if (ub.hidden === want) ub.hidden = !want; }   // Bruk-knappen vises bare når det er noe å bruke
  const labels = {
    animal: 'Angrip dyret', water: 'Drikk vann',
    fire: g.fuel >= 99 ? 'Bålet brenner for fullt 🔥' : g.wood > 0 ? 'Legg ved på bålet' : 'Hent ved – bålet trenger mer',
    tree: 'Hugg treet', villain: 'Angrip skjelettet', troll: 'Angrip trollet', goat: 'Angrip geita', trex: 'Angrip T-rexen', dskel: 'Angrip skjelettet', dtri: 'Angrip triceratopsen', dboss: 'Angrip T-rex-kongen', shark: 'Angrip haien', dchest: 'Åpne skjelettkisten 💀📦', barrel: 'Drikk fra vanntønna', cabin: 'Let i hytta', pack: 'Ta på sekken', board: 'Gå om bord på toget 🚂', npc: 'Snakk', bed: 'Sov i halmsenga 😴', wand: 'Ta heksas tryllestav 🪄', bush: 'Plukk bær', chest: 'Åpne kisten', rock: 'Hent stein', workshop: 'Bruk verkstedet'
  };
  if (t) {
    const key = isTouch ? (useT ? '✋' : WEAPONS[curW()].icon) : (useT ? 'E' : '🖱️/E');
    let html = `<kbd>${key}</kbd>${t.k === 'rock' && t.o.ore ? 'Hent jern' : t.k === 'basechest' ? (t.o.cleared ? 'Åpne skattekisten' : 'Låst skattekiste 🔒') : t.k === 'npc' ? `Snakk med ${t.o.n} 💬` : labels[t.k]}`;
    if (t.k === 'fire' && g.raw > 0) html += ` &nbsp; <kbd>${isTouch ? '🍖' : 'F'}</kbd>Stek kjøtt`;
    if (pr.innerHTML !== html) pr.innerHTML = html;
    pr.hidden = false;
  } else pr.hidden = true;
}
//#slutt
//#blokk 0424 FPS_AUTO


// Går spillet tregt (under ca. 24 bilder i sekundet i 6 sekunder), senkes grafikken ett trinn – bare hvis spilleren ikke har valgt grafikk selv
const FPS_AUTO = { t: 0, n: 0, valgt: (() => { try { return !!localStorage.getItem('mork3d.q'); } catch (e) { return false; } })() };
//#slutt
//#blokk 0425 fpsWatch

function fpsWatch(rawDt) {
  if (FPS_AUTO.valgt || qKey === 'lav' || document.hidden) return;
  FPS_AUTO.t += rawDt; FPS_AUTO.n++;
  if (FPS_AUTO.t < 6) return;
  const fps = FPS_AUTO.n / FPS_AUTO.t; FPS_AUTO.t = 0; FPS_AUTO.n = 0;
  if (fps < 24) { qKey = qKey === 'hoy' ? 'middels' : 'lav'; Q = QUAL[qKey]; applyQuality(); toast(`🐢 Spillet gikk tregt, så grafikken er satt til «${Q.n}». Du kan endre den på startskjermen.`); }
}
//#slutt
//#blokk 0426 loop

function loop(ts) {
  const raw = (ts - last) / 1000 || 0, dt = Math.min(0.05, raw); last = ts;
  if (state === 'play') { update(dt); updateHud(); if (raw > 0 && raw < 2.5) fpsWatch(raw); }
  if (g) draw(ts / 1000);
  requestAnimationFrame(loop);
}
//#slutt
//#blokk 0427 bakgrunnFersk


let bakgrunnFersk = false;
//#slutt
//#blokk 0428 start

function start() {
  if (bakgrunnFersk) bakgrunnFersk = false; else newGame();
  state = 'play'; nullstillZoom();
  $('startScreen').hidden = true; $('overScreen').hidden = true; $('hud').hidden = false;
  $('touch').hidden = !isTouch; $('joy').hidden = !isTouch; resetPointers(); joyIdle(); $('hotbar').hidden = false; document.body.classList.toggle('touchui', isTouch); hotbarKey = '';
  toast('Samle ved og bær før natten kommer!');
}
//#slutt
//#blokk 0429 gameOver

function gameOver() {
  state = 'over';
  $('prompt').hidden = true; $('touch').hidden = true; $('hotbar').hidden = true; $('joy').hidden = true; $('fishUI').hidden = true; resetPointers();
  $('overReason').textContent = g.cause === 'monster' ? 'Monstrene fikk tak i deg i mørket.' : g.cause === 'animal' ? 'Et vilt dyr ble for sterkt for deg.' : g.cause === 'water' ? 'Du ble for tørst. Husk å drikke fra bekken!' : g.cause === 'raw' ? 'Det rå kjøttet gjorde deg syk. Stek det på bålet!' : g.cause === 'lava' ? 'Du gikk i lavaen! Pass deg for det som gløder.' : g.cause === 'goat' ? 'Den slemme geita stanget deg! Slå den når den er sliten.' : g.cause === 'trex' ? 'T-rexen bet deg! Løp unna, og slå den når den er sliten etter et bitt.' : g.cause === 'troll' ? 'Trollet var for sterkt! Lag en bedre øks og prøv igjen.' : g.cause === 'villain' ? 'Skjelettene tok deg! Prøv å lokke dem ut av slottet én og én.' : 'Du ble for sulten. Husk å plukke bær eller spise kjøtt!';
  $('overScore').textContent = g.nights === 1 ? 'Du overlevde 1 natt.' : `Du overlevde ${g.nights} netter.`;
  $('overScreen').hidden = false;
  $('againBtn').focus();
}
//#slutt
//#blokk 0430 KEYMAP


const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', KeyE: 'act' };
//#slutt
//#blokk 0431 ExpressionStatement
   // venstre musknapp = angrep
window.addEventListener('keydown', e => {
  if (DEV_TOOLS && (e.code === 'F9' || e.code === 'Backquote') && !e.repeat) { e.preventDefault(); devToggle(); return; }   // utviklerverktøy: lys-test
  const k = KEYMAP[e.code];
  if (state === 'map') { if (e.code === 'Escape' || e.code === 'KeyM') { closeMap(); e.preventDefault(); } return; }
  if (state === 'play' && e.code === 'KeyM' && !e.repeat) { openMap(); e.preventDefault(); return; }
  if (state === 'menu') { if (e.code === 'Escape' || e.code === 'KeyB' || (menuKind === 'weapons' && (e.code === 'KeyI' || e.code === 'Tab'))) { closeMenu(); e.preventDefault(); } return; }
  if (state === 'play' && e.code === 'KeyC' && !e.repeat && R3) { R3.camMode = R3.camMode === 'near' ? 'far' : 'near'; toast(R3.camMode === 'near' ? '🎥 Kamera bak helten' : '🎥 Kamera ovenfra'); e.preventDefault(); return; }
  if (state === 'play' && (e.code === 'KeyB' || e.code === 'Escape')) {
    if (!e.repeat) { if (g.build) g.build = null; else if (e.code === 'KeyB') openMenu('build'); }
    e.preventDefault(); return;
  }
  if (state === 'play' && /^(Digit|Numpad)[0-9]$/.test(e.code)) { if (!e.repeat) selectWeapon(WEAPON_SLOTS[(+e.code.slice(-1) + 9) % 10]); e.preventDefault(); return; }
  if (state === 'play' && (e.code === 'KeyI' || e.code === 'Tab')) { if (!e.repeat) openMenu('weapons'); e.preventDefault(); return; }
  if ((e.code === 'KeyF' || e.code === 'KeyQ') && state === 'play') { if (!e.repeat) eat(); e.preventDefault(); return; }
  if (k && state === 'play') { keys[k] = true; e.preventDefault(); }
  else if ((e.code === 'Enter' || e.code === 'Space') && (state === 'start' || state === 'over') && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); start(); }
});
//#slutt
//#blokk 0432 ExpressionStatement

window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
//#slutt
//#blokk 0433 ExpressionStatement

window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
//#slutt
//#blokk 0434 ExpressionStatement

$('camBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'play' && R3) R3.camMode = R3.camMode === 'near' ? 'far' : 'near'; });
//#slutt
//#blokk 0435 ExpressionStatement

$('buildBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (state !== 'play') return; if (g.build) g.build = null; else openMenu('build'); });
//#slutt
//#blokk 0436 ExpressionStatement

$('menuClose').addEventListener('click', closeMenu);
//#slutt
//#blokk 0437 ExpressionStatement
 $('menuX').addEventListener('click', closeMenu);
//#slutt
//#blokk 0438 ExpressionStatement

$('menuList').addEventListener('click', e => { const b = e.target.closest('button[data-act]'); if (b && !b.disabled && b.dataset.act) menuAction(b.dataset.act); });
//#slutt
//#blokk 0439 ExpressionStatement

$('eatBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'play') eat(); });
//#slutt
//#blokk 0440 ExpressionStatement

document.querySelectorAll('#touch button[data-k]').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); keys[k] = true; b.classList.add('press'); try { b.setPointerCapture(e.pointerId); } catch (er) {} });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => { keys[k] = false; b.classList.remove('press'); });
});
//#slutt
//#blokk 0441 ExpressionStatement

$('startBtn').addEventListener('click', start);
//#slutt
//#blokk 0442 ExpressionStatement

$('hotbar').addEventListener('pointerdown', e => { const b = e.target.closest('button'); if (!b || state !== 'play') return; e.preventDefault(); e.stopPropagation();
  if (b.id === 'invBtn') openMenu('weapons'); else selectWeapon(b.dataset.w); });
//#slutt
//#blokk 0443 JOY,CAMT,CAMDRAG

// Styring som i Roblox. Hver finger følges med sin egen pointerId:
//  • en finger som lander i styrespak-feltet (nede til venstre) blir styrespaken
//  • andre fingre på ledig skjerm roterer kameraet; to slike fingre klyper for å zoome
//  • knapper, hurtiglinje og menyer er egne elementer og når aldri hit (kameraet rører seg ikke når du trykker på dem)
const JOY = { id: null, x0: 0, y0: 0, dx: 0, dy: 0, mag: 0 }, CAMT = new Map(), CAMDRAG = { id: null, x: 0, y: 0 };
//#slutt
//#blokk 0444 pinch0

let pinch0 = 0;
//#slutt
//#blokk 0445 JOY_R

const JOY_R = 55;
//#slutt
//#blokk 0446 inJoyZone

const inJoyZone = (x, y) => x < VW * (VW > VH ? 0.4 : 0.5) && y > VH * (VW > VH ? 0.35 : 0.55);
//#slutt
//#blokk 0447 joyShow

function joyShow(x, y, on) { const j = $('joy'); j.style.transform = `translate(${x}px,${y}px)`; j.classList.toggle('on', on); }
//#slutt
//#blokk 0448 joyIdle

function joyIdle() { joyShow(Math.max(84, VW * 0.13), VH - (VW > VH ? 110 : 130), false); $('joyKnob').style.transform = ''; }
//#slutt
//#blokk 0449 joyRelease

function joyRelease() { JOY.id = null; JOY.dx = JOY.dy = JOY.mag = 0; joyIdle(); }
//#slutt
//#blokk 0450 camRotate

function camRotate(dx, dy) { if (!R3) return; R3.camYaw -= dx * 0.0085; R3.camPitch = clamp(R3.camPitch + dy * 0.004, -0.35, 0.45); }
//#slutt
//#blokk 0451 camZoom

function camZoom(f) { if (R3) R3.camZoom = clamp(R3.camZoom * f, 0.55, 1.7); }
//#slutt
//#blokk 0452 resetPointers

function resetPointers() { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); joyRelease(); CAMT.clear(); CAMDRAG.id = null; MOUSE.down = false; for (const k in keys) keys[k] = false; }
//#slutt
//#blokk 0453 ExpressionStatement

cv.addEventListener('pointerdown', e => {
  if (state !== 'play') return;
  if (e.pointerType === 'mouse') { if (e.button === 2) { CAMDRAG.id = e.pointerId; CAMDRAG.x = e.clientX; CAMDRAG.y = e.clientY; } return; }
  if (JOY.id === null && inJoyZone(e.clientX, e.clientY)) { JOY.id = e.pointerId; JOY.x0 = e.clientX; JOY.y0 = e.clientY; JOY.dx = JOY.dy = JOY.mag = 0; joyShow(JOY.x0, JOY.y0, true); }
  else { CAMT.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (CAMT.size === 2) { const [a, b] = [...CAMT.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); } }
  try { cv.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault();
});
//#slutt
//#blokk 0454 ExpressionStatement

cv.addEventListener('pointermove', e => {
  if (e.pointerId === JOY.id) {
    let dx = e.clientX - JOY.x0, dy = e.clientY - JOY.y0; const l = Math.hypot(dx, dy);
    if (l > JOY_R) { JOY.x0 += dx / l * (l - JOY_R); JOY.y0 += dy / l * (l - JOY_R); dx = dx / l * JOY_R; dy = dy / l * JOY_R; }   // spaken følger tommelen
    JOY.dx = dx / JOY_R; JOY.dy = dy / JOY_R; JOY.mag = Math.min(1, l / JOY_R);
    joyShow(JOY.x0, JOY.y0, true); $('joyKnob').style.transform = `translate(${dx}px,${dy}px)`;
  } else if (CAMT.has(e.pointerId)) {
    const c = CAMT.get(e.pointerId);
    if (CAMT.size === 1) camRotate(e.clientX - c.x, e.clientY - c.y);
    c.x = e.clientX; c.y = e.clientY;
    if (CAMT.size === 2) { const [a, b] = [...CAMT.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0 > 20 && d > 20) camZoom(pinch0 / d); pinch0 = d; }   // klyp: zoom inn og ut
  } else if (e.pointerId === CAMDRAG.id) { camRotate(e.clientX - CAMDRAG.x, e.clientY - CAMDRAG.y); CAMDRAG.x = e.clientX; CAMDRAG.y = e.clientY; }   // høyre musknapp (PC)
});
//#slutt
//#blokk 0455 joyEnd

const joyEnd = e => { if (e.pointerId === JOY.id) joyRelease(); CAMT.delete(e.pointerId); if (e.pointerId === CAMDRAG.id) CAMDRAG.id = null; };
//#slutt
//#blokk 0456 ExpressionStatement

cv.addEventListener('pointerup', joyEnd);
//#slutt
//#blokk 0457 ExpressionStatement
 cv.addEventListener('pointercancel', joyEnd);
//#slutt
//#blokk 0458 ExpressionStatement
 cv.addEventListener('lostpointercapture', joyEnd);
//#slutt
//#blokk 0459 ExpressionStatement

// v5.5.1: sikkerhetsnett – slippes fingeren et annet sted, eller er ingen fingre igjen på skjermen, slipper vi alt (ellers kan helten «gå av seg selv»)
window.addEventListener('pointerup', joyEnd, true);
//#slutt
//#blokk 0460 ExpressionStatement
 window.addEventListener('pointercancel', joyEnd, true);
//#slutt
//#blokk 0461 ExpressionStatement

window.addEventListener('touchend', e => { if (e.touches.length === 0 && (state === 'play' || state === 'map')) resetPointers(); }, { passive: true, capture: true });
//#slutt
//#blokk 0462 ExpressionStatement

window.addEventListener('touchcancel', e => { if (e.touches.length === 0) resetPointers(); }, { passive: true, capture: true });
//#slutt
//#blokk 0463 nullstillZoom

// v5.5.1: har siden blitt zoomet inn (f.eks. i en meny), zoomes den ut igjen når du rører spillflaten
function nullstillZoom() {
  const v = window.visualViewport, m = document.querySelector('meta[name=viewport]');
  if (!v || !m || v.scale <= 1.01) return;
  const o = m.getAttribute('content'); m.setAttribute('content', o + ', maximum-scale=1.0'); setTimeout(() => m.setAttribute('content', o), 400);
}
//#slutt
//#blokk 0464 ExpressionStatement

cv.addEventListener('pointerdown', nullstillZoom, true);
//#slutt
//#blokk 0465 iSpill

// v5.5.1: to tomler samtidig (styrespak + knapp) tolkes av iPhone som knip-zoom. Under spilling sperres knip
// når siden ikke er zoomet; i menyer og på startskjermen kan man fortsatt zoome.
const iSpill = () => state === 'play' || state === 'map';
//#slutt
//#blokk 0466 erZoomet

const erZoomet = () => !!(window.visualViewport && visualViewport.scale > 1.01);
//#slutt
//#blokk 0467 ExpressionStatement

['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => { if (iSpill() && !erZoomet()) e.preventDefault(); }, { passive: false }));
//#slutt
//#blokk 0468 ExpressionStatement

document.addEventListener('touchmove', e => { if (e.touches.length > 1 && iSpill() && !erZoomet()) e.preventDefault(); }, { passive: false });
//#slutt
//#blokk 0469 ExpressionStatement

window.addEventListener('touchend', () => { if (iSpill() && erZoomet()) nullstillZoom(); }, { passive: true });
//#slutt
//#blokk 0470 IfStatement

// v5.5.1: er siden zoomet inn, kan du knipe deg ut igjen på spillflaten (ellers sperrer spillflaten knip)
if (window.visualViewport) visualViewport.addEventListener('resize', () => { cv.style.touchAction = visualViewport.scale > 1.01 ? 'manipulation' : ''; });
//#slutt
//#blokk 0471 ExpressionStatement

cv.addEventListener('contextmenu', e => e.preventDefault());
//#slutt
//#blokk 0472 ExpressionStatement

window.addEventListener('blur', resetPointers);
//#slutt
//#blokk 0473 ExpressionStatement
 document.addEventListener('visibilitychange', () => { if (document.hidden) resetPointers(); });
//#slutt
//#blokk 0474 ExpressionStatement

// Mus på PC: venstre knapp = angrip/gjør (som E), musehjulet bytter våpen, pekeren sikter med bue og stav
cv.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || PLOCK()) return; MOUSE.on = true; MOUSE.sx = e.clientX; MOUSE.sy = e.clientY; });
//#slutt
//#blokk 0475 ExpressionStatement

cv.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || e.button !== 0 || state !== 'play') return;
  if (!PLOCK() && !MLOOK.fail && cv.requestPointerLock) {             // første klikk: musa begynner å styre retningen (ikke et slag)
    try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => { MLOOK.fail = true; }); } catch (er) { MLOOK.fail = true; }
    return;
  }
  MOUSE.on = !PLOCK(); MOUSE.down = true; MOUSE.sx = e.clientX; MOUSE.sy = e.clientY; });
//#slutt
//#blokk 0476 ExpressionStatement

document.addEventListener('pointerlockerror', () => { MLOOK.fail = true; toast('Musestyring er ikke tillatt her. Hold inne høyre musknapp og dra for å snu kameraet.'); });
//#slutt
//#blokk 0477 ExpressionStatement

document.addEventListener('pointerlockchange', () => {
  const on = PLOCK(); $('cross').hidden = !on; MOUSE.down = false;
  if (on) { MOUSE.on = false; MOUSE.wx = null; if (R3) R3.camMode = 'near'; if (!MLOOK.told) { MLOOK.told = true; toast('🖱️ Nå styrer musa hvilken vei du ser! Venstre knapp = angrip. Esc = pause.'); } }
});
//#slutt
//#blokk 0478 ExpressionStatement

document.addEventListener('mousemove', e => { if (PLOCK() && state === 'play') camRotate(e.movementX * MLOOK.sens, e.movementY * MLOOK.sens); });
//#slutt
//#blokk 0479 ExpressionStatement

window.addEventListener('mouseup', e => { if (PLOCK() && e.button === 0) MOUSE.down = false; });
//#slutt
//#blokk 0480 ExpressionStatement

window.addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0) MOUSE.down = false; if (e.pointerType === 'mouse' && e.pointerId === CAMDRAG.id && e.button === 2) CAMDRAG.id = null; });
//#slutt
//#blokk 0481 ExpressionStatement

cv.addEventListener('pointerleave', () => { MOUSE.on = false; MOUSE.wx = null; });
//#slutt
//#blokk 0482 ExpressionStatement

window.addEventListener('wheel', e => { if (state === 'play') camZoom(Math.exp(clamp(e.deltaY, -120, 120) * 0.0015)); }, { passive: true });
//#slutt
//#blokk 0483 applyQuality
   // musehjulet zoomer
function applyQuality() {
  document.querySelectorAll('#qrow button').forEach(b => b.classList.toggle('on', b.dataset.q === qKey));
  if (!R3) return;
  resize();
  const sh = R3.sun.shadow; if (sh.mapSize.x !== Q.shadow) { sh.mapSize.set(Q.shadow, Q.shadow); if (sh.map) { sh.map.dispose(); sh.map = null; } }
  R3.pool.forEach((l, i) => { l.visible = i < Q.lights; });                                // færre lyskilder på lav kvalitet
}
//#slutt
//#blokk 0484 ExpressionStatement

$('qrow').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; FPS_AUTO.valgt = true;
  qKey = b.dataset.q; Q = QUAL[qKey]; try { localStorage.setItem('mork3d.q', qKey); } catch (er) {} applyQuality(); b.blur(); });
//#slutt
//#blokk 0485 devToggle

function devToggle() { DEV.on = !DEV.on; $('devSky').hidden = !DEV.on; if (!DEV.on) DEV.scale = 1; devBtns(); }
//#slutt
//#blokk 0486 devBtns

function devBtns() { $('devPause').classList.toggle('on', DEV.scale === 0); $('devFast').classList.toggle('on', DEV.scale === 20); }
//#slutt
//#blokk 0487 ExpressionStatement

$('devSky').addEventListener('pointerdown', e => {
  const b = e.target.closest('button'); if (!b || !g) return; e.preventDefault(); e.stopPropagation();
  if (b.dataset.t) skipTime(DEV_TIMES[b.dataset.t]);
  else if (b.id === 'devPause') DEV.scale = DEV.scale === 0 ? 1 : 0;
  else if (b.id === 'devFast') DEV.scale = DEV.scale === 20 ? 1 : 20;
  devBtns(); devClock();
});
//#slutt
//#blokk 0488 devClock

function devClock() {
  if (!DEV.on || !g) return;
  const c = skyClock(g.time), e = Math.asin(c.sun[1]) * 57.3, az = (Math.atan2(c.sun[0], -c.sun[2]) * 57.3 + 360) % 360;
  const cmp = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'][Math.round(az / 45) % 8], hh = Math.floor(c.hour), mm = Math.floor((c.hour - hh) * 60);
  $('devClk').textContent = `kl. ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} · sol ${e.toFixed(0)}° ${cmp} · ${phaseInfo(g.time).night ? 'natt' : 'dag'}${DEV.scale !== 1 ? ' · ×' + DEV.scale : ''}`;
}
//#slutt
//#blokk 0489 ExpressionStatement

$('againBtn').addEventListener('click', start);
//#slutt
//#blokk 0490 IfStatement


if (!window.THREE) $('no3d').hidden = false;
//#slutt
//#blokk 0491 ExpressionStatement

// «Start helt på nytt» på startskjermen (felles for alle EVN-spill). Grafikkvalget (mork3d.q) beholdes.
EVNNullstill({
  nokler: [SAVE_KEY, WORLD_KEY, FOG_KEY],
  tema: { panel: 'rgba(10,18,14,.97)', ink: '#f3ead6', hi: '#ff9a3c', btn: '#ff9a3c', btnInk: '#2a1606', font: "'Nunito',system-ui,sans-serif", head: "'Lilita One',system-ui,sans-serif", headW: 400 },
  tekst: 'Våpen, XP, oppdrag, slottet, kartet og alt du har bygget blir borte.',
  plasser: el => document.getElementById('evnTilbake').after(el),
  vis: () => state === 'start'
});
//#slutt
//#blokk 0492 TryStatement

// Høyden på hurtiglinja (én eller to rader) brukes til å plassere «Hent ved …»-teksten over den
try { new ResizeObserver(() => { const h = $('hotbar').offsetHeight; if (h) document.documentElement.style.setProperty('--hbH', h + 'px'); }).observe($('hotbar')); } catch (er) {}
//#slutt
//#blokk 0493 laastFoer

// Felles pause med spilletid (⏸ / P / Esc). Spilletid lagres i 'evn-spilletid-morkeskogen'.
// Esc gir pause (nettleseren slipper musa på Esc uansett). B åpner byggemenyen. Fortsett fanger musa igjen hvis den var fanget.
let laastFoer = false;
//#slutt
//#blokk 0494 EVNP

const EVNP = EVNPause({
  mappe: 'morkeskogen', avsluttId: 'evnAvslutt',
  tema: { panel: 'rgba(10,18,14,.95)', ink: '#f3ead6', hi: '#ff9a3c', btn: '#ff9a3c', btnInk: '#2a1606', font: "'Nunito',system-ui,sans-serif", head: "'Lilita One',system-ui,sans-serif", headW: 400 },
  knapp: (b, k) => { const rad = document.createElement('div'); rad.id = 'evnRad'; rad.append(b, k); document.querySelector('#hud .clock').appendChild(rad); },
  kart: {
    forhold: 1,
    info: () => { if (!fog) return ''; const n = fog.a.reduce((s2, v) => s2 + v, 0); return `Du har utforsket ${Math.round(n / fog.a.length * 100)} % · det mørke er ukjent land`; },
    tegn: (c, w, h, cv) => drawMapView(cv, cv.width, true)
  },
  escPause: () => !(g && g.build),                          // i byggemodus betyr Esc fortsatt «avbryt»
  kanPause: () => state === 'play',
  aktiv: () => state === 'play' || state === 'menu' || state === 'map',
  pause: () => { laastFoer = laastFoer || PLOCK(); state = 'pause'; resetPointers(); $('prompt').hidden = true; },
  fortsett: klikk => {
    if (state !== 'pause') return;
    state = 'play'; resetPointers(); last = performance.now(); if (g) g.p.cool = Math.max(g.p.cool, 0.3);
    if (klikk && laastFoer && !isTouch && !MLOOK.fail && !MLOOK.forced) { try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (er) {} }
    laastFoer = false;
  },
  styring: () => isTouch ? '👆 Gå: dra med fingeren<br>🪓 Hugg: trykk øksa · ✋ Bruk: trykk hånda<br>🔨 Bygg · 🎥 Kamera · 🗺️ Kart: trykk kartet'
    : '⌨️ Gå: <b>W A S D</b> eller pilene · Hopp: <b>mellomrom</b><br>🪓 Hugg: <b>klikk</b> · Gjør ting: <b>E</b> · Spis: <b>F</b><br>🖱️ Se rundt: flytt musa · Zoom: musehjulet<br>🔨 Bygg: <b>B</b> · 🎒 Sekk: <b>I</b> · 🗺️ Kart: <b>M</b> · 🎥 Kamera: <b>C</b><br>⏸ Pause: <b>P</b> eller <b>Esc</b>'
});
//#slutt
//#blokk 0495 ExpressionStatement

document.addEventListener('pointerlockchange', () => {
  if (PLOCK() || state !== 'play') return;
  if (g && g.build) { g.build = null; return; }             // Esc i byggemodus: avbryt byggingen
  laastFoer = true; EVNP.apne('Pause. Trykk Fortsett for å styre med musa igjen.');
});
//#slutt
//#blokk 0496 ExpressionStatement

newGame();
//#slutt
//#blokk 0497 ExpressionStatement
 bakgrunnFersk = true;
//#slutt
//#blokk 0498 ExpressionStatement
 // bakgrunn bak startskjermen (v5.5.1: brukes direkte ved første Start, så verden ikke bygges to ganger)
requestAnimationFrame(loop);
//#slutt
