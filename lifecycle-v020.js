/* ByteBuddy '98 V0.20 - one living companion, natural lifespan, sanctuary and generation book.
   Life is based on real days; inactivity does not cause death by neglect. */
(()=>{
"use strict";
const DAY=86400000, MAX_HISTORY=60;
const $=id=>document.getElementById(id);
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v||{},k);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function day(now=Date.now()){const d=new Date(now);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function normalize(st,now=Date.now()){
 if(!st||typeof st!=="object")return;
 if(!st.lifeData||typeof st.lifeData!=="object"){
  // Legacy pets get a fresh lifespan: never retroactively kill a previously saved pet.
  st.lifeData={birthAt:st.stage>0?now:null,goodDays:0,careDay:day(now),actions:[],awarded:false};
 }
 const l=st.lifeData;
 if(st.stage>0&&(!Number.isFinite(l.birthAt)||l.birthAt<=0||l.birthAt>now+DAY))l.birthAt=now;
 if(st.stage===0&&!st.lifeOutcome)l.birthAt=null;
 l.goodDays=clamp(Math.floor(Number(l.goodDays)||0),0,100);
 if(typeof l.careDay!=="string")l.careDay=day(now);
 l.actions=Array.isArray(l.actions)?l.actions.filter(x=>["feed","play","train","clean","heal"].includes(x)).slice(0,5):[];
 l.awarded=l.awarded===true;
 st.lifeOutcome=["natural","sanctuary"].includes(st.lifeOutcome)?st.lifeOutcome:null;
 st.family=Array.isArray(st.family)?st.family.filter(x=>x&&typeof x==="object"&&Number.isFinite(x.generation)).slice(-MAX_HISTORY):[];
 // Deprecated incubator inventory, if present, is refunded exactly once.
 if(!st.legacyEggRefunded){
  const held=Array.isArray(st.eggs)?st.eggs.length:0;
  if(held)st.bits=Math.max(0,Number(st.bits)||0)+40*held;
  st.legacyEggRefunded=true;
 }
 st.eggs=[];
}
function ageDays(st,now=Date.now()){const born=st?.lifeData?.birthAt;return st?.stage>0&&Number.isFinite(born)?Math.max(0,Math.floor((now-born)/DAY)):0;}
function longevity(st){return 45+Math.min(15,Math.floor((st?.lifeData?.goodDays||0)/2));}
function phase(st,now=Date.now()){
 if(st?.lifeOutcome==="natural")return "MÉMORIAL";
 if(st?.lifeOutcome==="sanctuary")return "SANCTUAIRE";
 if(st?.stage===0)return "ŒUF";
 const d=ageDays(st,now);
 return d<3?"BÉBÉ":d<8?"ENFANT":d<16?"ADOLESCENT":d<36?"ADULTE":"SENIOR";
}
function recordCare(st,type,now=Date.now()){
 if(!st||st.stage===0||!["feed","play","train","clean","heal"].includes(type))return false;
 normalize(st,now);
 const l=st.lifeData,t=day(now);
 if(t!==l.careDay){l.careDay=t;l.actions=[];l.awarded=false;}
 if(!l.actions.includes(type))l.actions.push(type);
 if(l.actions.length>=2&&!l.awarded){
  l.awarded=true;l.goodDays=clamp(l.goodDays+1,0,100);
  return true;
 }
 return false;
}
function archive(st,reason,now=Date.now()){
 normalize(st,now);
 if(st.stage===0||st.lifeOutcome)return false;
 const l=st.lifeData;
 const entry={
  generation:st.generation,form:st.form,name:st.petName||"",
  level:st.level||1,wins:st.wins||0,care:st.care||0,
  trait:st.genetics?.talent||null,affinity:st.primaryType||st.genetics?.affinity||null,
  primaryType:st.primaryType||st.genetics?.affinity||null,secondaryType:st.secondaryType||null,
  birthAt:l.birthAt||null,endedAt:now,days:ageDays(st,now),
  goodDays:l.goodDays||0,cause:reason,
  attributes:st.attributes&&typeof st.attributes==="object"
   ?Object.fromEntries(["vitalite","force","defense","vitesse","precision","endurance","esprit"]
     .map(key=>[key,Math.max(0,Math.min(99,Math.round(Number(st.attributes[key])||0)))])):null,
  parents:st.genetics?[st.genetics.parent,st.genetics.partner]:[]
 };
 st.family.push(entry);st.family=st.family.slice(-MAX_HISTORY);
 st.legacyAffinity=entry.affinity;
 st.lifeOutcome=reason;
 st.stage=0;st.form="egg";st.petName="";st.sleeping=false;
 st.babyBornAt=0;
 st.eggs=[];
 return true;
}
function evaluate(st,now=Date.now()){
 normalize(st,now);
 if(st.stage<=0||st.lifeOutcome)return false;
 if(ageDays(st,now)<longevity(st))return false;
 const lastName=st.petName||"Ton compagnon";
 archive(st,"natural",now);
 st.log=Array.isArray(st.log)?st.log:[];
 st.log.unshift(lastName+" a terminé paisiblement son cycle de vie et rejoint le mémorial.");
 st.log=st.log.slice(0,7);
 return true;
}
const STARTERS={
 flamme:{talent:"force",stat:"force",egg:"flame"},
 nature:{talent:"garde",stat:"defense",egg:"leaf"},
 eau:{talent:"esprit",stat:"precision",egg:"wave"},
 foudre:{talent:"force",stat:"vitesse",egg:"bolt"}
};
function newGeneration(old,base,affinity){
 const pick=own(STARTERS,affinity)?affinity:"nature";
 const s=STARTERS[pick];
 const next=base();
 return {...next,
  trainerName:old.trainerName||"",onboarding:{step:"done"},
  generation:Math.max(1,Number(old.generation)||1)+1,
  starterEgg:s.egg,primaryType:pick,secondaryType:null,
  genetics:{affinity:pick,talent:s.talent,mutation:null,parent:"baby",partner:"baby"},
  pendingHeritage:{stat:s.stat,amount:Math.min(2,old.family?.length||0)},
  dex:{...old.dex,egg:true},exploration:old.exploration||null,
  family:Array.isArray(old.family)?old.family.slice(-MAX_HISTORY):[],
  bits:Math.max(0,Number(old.bits)||0)+5,daily:{...old.daily},
  eggs:[],legacyEggRefunded:true,lifeOutcome:null,
  lifeData:{birthAt:null,goodDays:0,careDay:day(),actions:[],awarded:false},
  log:["Génération "+(Math.max(1,Number(old.generation)||1)+1)+" : un unique œuf attend son éclosion !"]
 };
}
function onHatch(st){
 normalize(st);
 st.lifeOutcome=null;
 st.lifeData={birthAt:Date.now(),goodDays:0,careDay:day(),actions:[],awarded:false};
 if(st.pendingHeritage&&own(st.attributes,st.pendingHeritage.stat)){
  const k=st.pendingHeritage.stat;
  st.attributes[k]=clamp((Number(st.attributes[k])||10)+(Number(st.pendingHeritage.amount)||0),1,99);
 }
 delete st.pendingHeritage;
}
function render(st,names){
 const label=$("lifePhase");if(!label)return;
 normalize(st);
 const d=ageDays(st),limit=longevity(st),p=phase(st);
 label.textContent=p;
 $("lifeSummary").textContent=st.lifeOutcome==="natural"
  ?"Ton compagnon a terminé sa vie. Ses souvenirs sont conservés. Lance une nouvelle génération."
  :st.lifeOutcome==="sanctuary"
  ?"Ton compagnon est au sanctuaire. Tu peux commencer un nouvel élevage."
  :st.stage===0
  ?"Un seul compagnon actif : choisis les affinités de la prochaine génération."
  :"ÂGE : JOUR "+d+" · "+p+" · ESPÉRANCE DE VIE "+limit+" JOURS (45 À 60 SELON LES SOINS).";
 $("lifeLongevity").textContent=st.stage>0?"JOUR "+d+" / "+limit+" · "+(st.lifeData.goodDays||0)+" JOUR(S) DE BONS SOINS":"NOUVEAU CYCLE";
 $("lifeAdvice").textContent=st.stage>0
  ?"Deux types de soins différents par jour = une journée de qualité. Deux journées de qualité donnent +1 jour de longévité, jusqu'à 60 jours."
  :"Une créature à la fois. Le Livre des générations conserve les compagnons précédents.";
 $("lifeBar").style.width=(st.stage>0?clamp(d/limit*100,0,100):0)+"%";
 $("lifeBonus").textContent=st.stage>0
  ?"Vieillissement réel, sans mort pour négligence. Le sanctuaire est un choix définitif."
  :"HÉRITAGE : le futur compagnon reçoit jusqu'à +2 dans une statistique de départ. +5 Bits à chaque nouvelle génération.";
 const btn=$("sanctuaryBtn");
 btn.textContent=st.stage>0?"CONFIER AU SANCTUAIRE":"COMMENCER UNE NOUVELLE GÉNÉRATION";
 const tree=$("familyTree");tree.replaceChildren();
 const entries=(st.family||[]).slice(-20).reverse();
 if(st.stage>0){
  const row=document.createElement("div");row.className="family-member current";
  const b=document.createElement("b");b.textContent="GEN "+String(st.generation).padStart(2,"0")+" · "+(st.petName||names[st.form]);
  const note=document.createElement("span");note.textContent=p+" · JOUR "+d+" · EN COURS";
  row.append(b,note);tree.appendChild(row);
 }
 for(const x of entries){
  const row=document.createElement("div");row.className="family-member";
  const title=document.createElement("b");
  title.textContent="GEN "+String(x.generation).padStart(2,"0")+" · "+(x.name||names[x.form]||"COMPAGNON");
  const note=document.createElement("span");
  const cause=x.cause==="natural"?"MÉMORIAL":x.cause==="sanctuary"?"SANCTUAIRE":"ARCHIVES";
  note.textContent=cause+" · J"+(Number.isFinite(x.days)?x.days:"?")+" · LV."+(x.level||1)+" · "+(x.wins||0)+" VICTOIRES";
  row.append(title,note);
  if(window.ByteBuddyFarewellV22?.openRecord){
   row.classList.add("bb-memory-entry");row.setAttribute("role","button");row.tabIndex=0;
   row.setAttribute("aria-label","Voir l'hommage de "+(x.name||names[x.form]||"compagnon"));
   row.addEventListener("click",()=>window.ByteBuddyFarewellV22.openRecord(x));
   row.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" "){event.preventDefault();window.ByteBuddyFarewellV22.openRecord(x);}
   });
  }
  tree.appendChild(row);
 }
 if(!entries.length&&st.stage===0){
  const empty=document.createElement("div");empty.className="empty-nest";
  empty.textContent="Le Livre des générations attend ton premier compagnon.";tree.appendChild(empty);
 }
}
window.ByteBuddyLifeV20={normalize,ageDays,longevity,phase,recordCare,evaluate,archive,newGeneration,onHatch,render};
})();