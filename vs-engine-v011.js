/* ByteBuddy '98 V0.11 - deterministic, standalone turn-based VS rules.
   Friendly matches are local and cannot award online rankings or currency. */
(()=>{
"use strict";
const TYPES={ember:"flamme",ember2:"flamme",verd:"nature",verd2:"nature",
 volt:"foudre",volt2:"foudre",aqua:"eau",aqua2:"eau",
 shade:"ombre",shade2:"ombre",lumia:"lumière",nebula:"lumière",
 prism:"lumière",auror:"foudre",baby:"neutre"};
const ADVANTAGES={flamme:"nature",nature:"eau",eau:"flamme",foudre:"eau",ombre:"lumière",lumière:"ombre"};
const ACTIONS=["attack","guard","focus","special"];
const ACTION_LABELS={attack:"FRAPPER",guard:"PARER",focus:"CANALISER",special:"POUVOIR"};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function hashSeed(seed){let h=2166136261>>>0;for(const ch of String(seed)){h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0}return h||123456789;}
function roll(room){let x=room.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;room.rng=x>>>0;return room.rng/4294967296;}
function normalize(s){
 const V=window.ByteBuddyV10;
 if(!V)throw Error("Statistiques du jeu indisponibles");
 const v=V.validateSnapshot(s);
 const stats={...v.attributes},combat=V.fighter({attributes:stats});
 return {form:v.form,type:TYPES[v.form]||"neutre",level:v.level,stage:v.stage,stats,
   maxHp:combat.maxPV,hp:combat.maxPV,maxEnergy:Math.min(100,48+Math.round(stats.endurance*.55)),
   energy:Math.min(100,48+Math.round(stats.endurance*.55)),focus:0,guard:false};
}
function create(first,second,seed=Date.now()){
 return {version:"v011",round:1,phase:"choice",players:[normalize(first),normalize(second)],
   choices:[null,null],logs:[],history:[],rng:hashSeed(seed),seed:String(seed),winner:null,turnLimit:24};
}
function canUse(room,player,action){
 const p=room.players[player];return ACTIONS.includes(action) && !(action==="special"&&p.energy<14);
}
function choose(room,index,action){
 if(room.phase!=="choice")throw Error("Duel terminé ou manche en cours");
 if(index!==0&&index!==1)throw Error("Joueur invalide");
 if(room.choices[index])throw Error("Action déjà sélectionnée");
 if(!canUse(room,index,action))throw Error("Énergie insuffisante");
 room.choices[index]=action;
 return {ready:room.choices.every(Boolean),player:index};
}
function chanceType(at,def){
 if(ADVANTAGES[at]===def)return 1.25;
 if(ADVANTAGES[def]===at)return .86;
 return 1;
}
function resolve(room){
 if(room.phase!=="choice"||!room.choices.every(Boolean))throw Error("Actions manquantes");
 const P=room.players,C=room.choices;const messages=[];
 const before=P.map(p=>({hp:p.hp,energy:p.energy,focus:p.focus}));
 // Guard and concentration apply simultaneously; speed only affects strikes.
 for(let i=0;i<2;i++){
   const p=P[i],action=C[i];p.guard=action==="guard";
   if(action==="guard"){p.energy=clamp(p.energy+4,0,p.maxEnergy);p.focus=Math.min(3,p.focus+1);messages.push("J"+(i+1)+" adopte une garde défensive.");}
   if(action==="focus"){p.energy=clamp(p.energy+14,0,p.maxEnergy);p.focus=Math.min(3,p.focus+1);messages.push("J"+(i+1)+" canalise son énergie.");}
 }
 // Higher speed acts first; a seeded coin toss resolves ties.
 const order=[0,1].sort((i,j)=>P[j].stats.vitesse-P[i].stats.vitesse||(roll(room)<.5?-1:1));
 for(const i of order){
   const atk=P[i],def=P[1-i],action=C[i];
   if(atk.hp<=0||def.hp<=0)continue;
   if(action!=="attack"&&action!=="special")continue;
   if(action==="special"){
     atk.energy=Math.max(0,atk.energy-14);
   }else{
     atk.focus=Math.min(3,atk.focus+1);
   }
   const hit=clamp(.79+atk.stats.precision*.0023-def.stats.vitesse*.0011,.64,.96);
   if(roll(room)>hit){messages.push("J"+(i+1)+" manque sa cible.");continue;}
   const critical=roll(room)<clamp(.035+atk.stats.precision*.0017,.04,.22);
   const power=action==="special"?(11+atk.stats.esprit*.44+atk.level*.5):(8+atk.stats.force*.4+atk.level*.38);
   const resist=Math.max(.52,1-def.stats.defense*.0045);
   const element=chanceType(atk.type,def.type);
   let dmg=Math.max(1,Math.round((power+roll(room)*4)*resist*element*(critical?1.45:1)));
   if(def.guard)dmg=Math.max(1,Math.round(dmg*(action==="special"?.62:.32)));
   def.hp=Math.max(0,def.hp-dmg);
   messages.push("J"+(i+1)+" "+(action==="special"?"POUVOIR":"FRAPPE")+
     " : "+dmg+" PV"+(critical?" CRITIQUE":"")+(element>1?" EFFICACE":"")+
     (def.guard?" / GARDE":"")+".");
 }
 const result={round:room.round,actions:[...C],before,after:P.map(p=>({hp:p.hp,energy:p.energy,focus:p.focus})),messages};
 room.history.push(result);room.logs=messages;
 const alive=P.map(p=>p.hp>0);
 if(!alive[0]&&!alive[1])room.winner="draw";
 else if(!alive[0])room.winner=1;
 else if(!alive[1])room.winner=0;
 else if(room.round>=room.turnLimit){
   const a=P[0].hp/P[0].maxHp,b=P[1].hp/P[1].maxHp;
   room.winner=Math.abs(a-b)<.01?"draw":a>b?0:1;
 }
 if(room.winner!==null)room.phase="ended";
 else{room.round++;room.phase="choice"}
 room.choices=[null,null];
 return result;
}
function botChoice(room){
 const p=room.players[1],opp=room.players[0];
 if(p.energy<14 && p.energy<p.maxEnergy-9)return "focus";
 if(p.hp/p.maxHp<.35 && opp.focus>=1)return "guard";
 if(p.energy>=14 && (p.focus>=1 || opp.guard) && room.round%3!==0)return "special";
 if(p.energy<p.maxEnergy-16 && room.round%5===0)return "focus";
 return room.round%6===0?"guard":"attack";
}
function replay(room){
 return {ruleset:"v011",seed:room.seed,players:room.players.map(p=>({
  form:p.form,level:p.level,stage:p.stage,attributes:{...p.stats}
 })),rounds:room.history.map(h=>({actions:h.actions})),winner:room.winner};
}
function verifyReplay(rep){
 if(!rep||rep.ruleset!=="v011"||!Array.isArray(rep.players)||rep.players.length!==2||!Array.isArray(rep.rounds)||rep.rounds.length>24)throw Error("Replay invalide");
 const room=create(...rep.players,rep.seed);
 for(const row of rep.rounds){
  if(room.phase==="ended")throw Error("Replay trop long");
  if(!Array.isArray(row.actions)||row.actions.length!==2)throw Error("Actions invalides");
  choose(room,0,row.actions[0]);choose(room,1,row.actions[1]);resolve(room);
 }
 if(rep.winner!==room.winner)throw Error("Replay incohérent");
 return room;
}
window.ByteBuddyV11=Object.freeze({create,choose,resolve,canUse,botChoice,replay,verifyReplay,normalize,ACTIONS,ACTION_LABELS,TYPES});
})();