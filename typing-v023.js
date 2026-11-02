/* ByteBuddy '98 V0.23 — elementary lineage and rare dual typing.
   A starter egg fixes one primary type for life. Secondary types unlock
   only with earned ultimate evolutions. Existing saves are migrated safely. */
(()=>{
"use strict";
const EGGS=Object.freeze({flame:"flamme",leaf:"nature",wave:"eau",bolt:"foudre"});
const PRIMARY=Object.freeze(["flamme","nature","eau","foudre"]);
const ELEMENTS=Object.freeze([...PRIMARY,"ombre","lumière","neutre"]);
const FORMS=Object.freeze({
 ember:"flamme",ember2:"flamme",cindr:"flamme",cindr2:"flamme",
 verd:"nature",verd2:"nature",bramble:"nature",bramble2:"nature",
 aqua:"eau",aqua2:"eau",tide:"eau",tide2:"eau",
 volt:"foudre",volt2:"foudre",surge:"foudre",surge2:"foudre",
 shade:"ombre",shade2:"ombre",lumia:"lumière",nebula:"lumière",
 prism:"lumière",auror:"foudre",baby:"neutre",egg:"neutre"
});
const BASE=Object.freeze({flamme:"ember",nature:"verd",eau:"aqua",foudre:"volt"});
const SPECIAL=Object.freeze({flamme:"cindr",nature:"bramble",eau:"tide",foudre:"surge"});
const SECOND=Object.freeze({flamme:"ombre",nature:"lumière",eau:"foudre",foudre:"ombre"});
const ADVANTAGE=Object.freeze({flamme:"nature",nature:"eau",eau:"flamme",foudre:"eau",ombre:"lumière",lumière:"ombre"});
const TYPES=new Set(ELEMENTS);
const nativeType=form=>FORMS[form]||"neutre";
const validPrimary=t=>PRIMARY.includes(t)||t==="ombre"||t==="lumière"; // Legacy pets may carry these.
const validSecondary=(primary,secondary)=>secondary===null||secondary===undefined||secondary===""||
 (TYPES.has(secondary)&&secondary!=="neutre"&&secondary!==primary);
function lineage(st){
 if(!st||typeof st!=="object")return null;
 if(validPrimary(st.primaryType))return st.primaryType;
 const affinity=st.genetics?.affinity;
 if(validPrimary(affinity))return affinity;
 const egg=EGGS[st.starterEgg];
 if(egg)return egg;
 const form=nativeType(st.form);
 if(validPrimary(form))return form;
 return null;
}
function resolveSecondary(st){
 const primary=lineage(st);
 if(!primary||!st||st.stage<3)return null;
 if(st.secondaryType&&validSecondary(primary,st.secondaryType))return st.secondaryType;
 if(st.secondaryType)return null;
 // Legacy rare forms preserve their bonus as a second element where distinct.
 const inherited={lumia:"lumière",nebula:"lumière",prism:"lumière",auror:"foudre"}[st.form];
 return inherited&&inherited!==primary?inherited:null;
}
function normalize(st){
 if(!st||typeof st!=="object")return;
 const primary=lineage(st);
 st.primaryType=primary;
 if(primary&&!validPrimary(st.genetics?.affinity)){
  st.genetics={...st.genetics,affinity:primary,
   talent:st.genetics?.talent||({flamme:"force",nature:"garde",eau:"esprit",foudre:"force"})[primary],
   mutation:st.genetics?.mutation||null,parent:st.genetics?.parent||"baby",partner:st.genetics?.partner||"baby"};
 }
 if(st.stage<3)st.secondaryType=null;
 else st.secondaryType=resolveSecondary(st);
}
function specialRookie(st){
 const primary=lineage(st),s=st.attributes||{},d=st.diet||{};
 if(primary==="flamme")return s.force>=20&&s.precision>=16&&(d.viande||0)>=2?SPECIAL[primary]:BASE[primary];
 if(primary==="nature")return s.defense>=20&&(d.legumes||0)>=2?SPECIAL[primary]:BASE[primary];
 if(primary==="eau")return s.esprit>=18&&(d.poisson||0)>=2?SPECIAL[primary]:BASE[primary];
 if(primary==="foudre")return s.vitesse>=20&&s.endurance>=16?SPECIAL[primary]:BASE[primary];
 if(primary==="ombre")return "shade";
 return null;
}
function rareSecondary(st,form){
 const primary=lineage(st),s=st.attributes||{},d=st.diet||{};
 if(!primary)return null;
 const visible={prism:"lumière",auror:"foudre",lumia:"lumière",nebula:"lumière"}[form];
 if(visible&&visible!==primary)return visible;
 const wins=st.wins||0;
 if(primary==="flamme"&&wins>=5&&s.force>=25&&s.esprit>=24&&(d.baies||0)>=2)return "ombre";
 if(primary==="nature"&&wins>=5&&s.defense>=25&&st.health>=75&&(st.mistakes||0)<=2&&(st.lifeData?.goodDays||0)>=7)return "lumière";
 if(primary==="eau"&&wins>=5&&s.vitesse>=24&&s.precision>=25&&(d.poisson||0)>=2)return "foudre";
 if(primary==="foudre"&&wins>=6&&s.vitesse>=28&&s.esprit>=25&&(d.baies||0)>=2)return "ombre";
 return null;
}
function profile(st){
 const primary=lineage(st)||nativeType(st?.form);
 return {primary,secondary:resolveSecondary(st)};
}
function ratio(attack,defenders){
 const def=Array.isArray(defenders)?defenders:[defenders];
 let factor=1;
 for(const type of def.filter(Boolean).slice(0,2)){
  if(ADVANTAGE[attack]===type)factor*=1.3;
  else if(ADVANTAGE[type]===attack)factor*=.83;
 }
 // Two defensive elements can compound strengths and vulnerabilities,
 // but the maximum swing stays moderate for friendly PvP.
 return Math.min(1.4,Math.max(.72,Math.round(factor*1000)/1000));
}
function attackType(st,action="attack"){
 const p=profile(st);
 return action==="special"&&p.secondary?p.secondary:p.primary;
}
function typeLabel(st){
 const p=profile(st);
 return p.primary.toUpperCase()+(p.secondary?" / "+p.secondary.toUpperCase():"");
}
window.ByteBuddyTypingV23=Object.freeze({EGGS,PRIMARY,ELEMENTS,FORMS,BASE,SPECIAL,SECOND,ADVANTAGE,nativeType,lineage,normalize,profile,specialRookie,rareSecondary,ratio,attackType,typeLabel,validPrimary,validSecondary});
})();