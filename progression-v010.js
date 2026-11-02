/* ByteBuddy V0.10 — progression rules, kept separate from the LCD UI.
   No remote multiplayer claims: shared fighter codes are for local sparring only. */
(()=>{
'use strict';
const clamp=(x,min=0,max=100)=>Math.min(max,Math.max(min,Number.isFinite(+x)?+x:min));
const keys=['vitalite','force','defense','vitesse','precision','endurance','esprit'];
const labels={vitalite:'PV MAX',force:'FORCE',defense:'DÉFENSE',vitesse:'VITESSE',precision:'PRÉCISION',endurance:'ENDURANCE',esprit:'ESPRIT'};
const FOOD={
 viande:{name:'VIANDE',fullness:32,joy:1,health:0,hygiene:-4,stat:'force',gain:2,detail:'Protéines : Force +2'},
 fruits:{name:'FRUITS',fullness:22,joy:7,health:1,hygiene:0,stat:'vitesse',gain:2,detail:'Vitamines : Vitesse +2'},
 legumes:{name:'LÉGUMES',fullness:23,joy:2,health:3,hygiene:0,stat:'defense',gain:2,detail:'Fibres : Défense +2'},
 poisson:{name:'POISSON',fullness:29,joy:1,health:2,hygiene:-2,stat:'precision',gain:2,detail:'Oméga : Précision +2'},
 cereales:{name:'CÉRÉALES',fullness:30,joy:2,health:1,hygiene:0,stat:'endurance',gain:2,detail:'Énergie : Endurance +2'},
 baies:{name:'BAIES',fullness:19,joy:5,health:2,hygiene:0,stat:'esprit',gain:2,detail:'Éveil : Esprit +2'}
};
const BASE={vitalite:12,force:10,defense:10,vitesse:10,precision:10,endurance:10,esprit:10};
function initialize(state){
 if(!state||typeof state!=='object')return;
 if(!state.attributes || typeof state.attributes!=='object'){
  const lv=Math.max(1,Number(state.level)||1);
  state.attributes={...BASE,force:clamp(10+Math.min(15,(state.train||0)*.5)+lv-1,1,99),
    vitesse:clamp(10+Math.min(10,(state.play||0)*.5),1,99),
    defense:clamp(10+Math.min(10,(state.clean||0)*.5),1,99)};
 }
 for(const key of keys)state.attributes[key]=Math.round(clamp(state.attributes[key]??BASE[key],1,99));
 if(!state.diet || typeof state.diet!=='object')state.diet={};
 for(const key of Object.keys(FOOD))state.diet[key]=Math.max(0,Math.min(999,Math.floor(Number(state.diet[key])||0)));
 state.nutritionTime=Math.max(0,Number(state.nutritionTime)||0);
 if(!Number.isFinite(Number(state.babyBornAt))||Number(state.babyBornAt)<=0)
  state.babyBornAt=state.stage===1?Date.now()-Math.min(20*60,Math.max(0,Number(state.age)||0))*1000:0;
}
const diversity=state=>Object.values(state.diet||{}).filter(n=>n>0).length;
function meal(state,id,now=Date.now()){
 initialize(state);
 const f=FOOD[id];if(!f)throw Error('Repas inconnu');
 state.fullness=clamp(state.fullness+f.fullness);
 state.joy=clamp(state.joy+f.joy);
 state.health=clamp(state.health+f.health);
 state.hygiene=clamp(state.hygiene+f.hygiene);
 state.diet[id]=Math.min(999,(state.diet[id]||0)+1);
 // No stat farming through repeated, instantaneous feeding.
 const trained=now-state.nutritionTime>=90000;
 if(trained){state.attributes[f.stat]=Math.round(clamp(state.attributes[f.stat]+f.gain,1,99));state.nutritionTime=now;}
 return {food:f,trained,stat:f.stat,diversity:diversity(state)};
}
const TRAINING={
 precision:{stat:'precision',minor:'esprit',name:'PRÉCISION'},
 dodge:{stat:'vitesse',minor:'defense',name:'ESQUIVE'},
 force:{stat:'force',minor:'endurance',name:'FORCE'},
 endurance:{stat:'endurance',minor:'vitalite',name:'ENDURANCE'},
 defense:{stat:'defense',minor:'vitalite',name:'DÉFENSE'},
 esprit:{stat:'esprit',minor:'precision',name:'ESPRIT'}
};
function workout(state,mode,score,total){
 initialize(state);const spec=TRAINING[mode];if(!spec)return {main:null,gain:0};
 const gain=Math.max(0,Math.min(5,Math.ceil((Number(score)||0)/Math.max(1,total)*5)));
 const minor=gain>=3?1:0;
 state.attributes[spec.stat]=Math.round(clamp(state.attributes[spec.stat]+gain,1,99));
 if(minor)state.attributes[spec.minor]=Math.round(clamp(state.attributes[spec.minor]+minor,1,99));
 return {main:spec.stat,gain,secondary:spec.minor,minor};
}
function babyStatus(state,now=Date.now()){
 initialize(state);
 const age=state.stage===1 ? Math.max(0,now-state.babyBornAt) : 20*60*1000;
 const minutes=Math.floor(Math.max(0,(20*60*1000-age)/60000));
 const missing=[];
 if(age<20*60*1000)missing.push('TEMPS '+Math.ceil((20*60*1000-age)/60000)+' MIN');
 if((state.care||0)<12)missing.push('SOINS '+(state.care||0)+'/12');
 if(diversity(state)<2)missing.push('ALIMENTS '+diversity(state)+'/2');
 if((state.train||0)<1)missing.push('ENTRAÎNEMENT 0/1');
 return {ready:missing.length===0,missing,ageMinutes:Math.floor(age/60000),remainingMinutes:minutes};
}
function rookie(state){
 initialize(state);
 const typing=window.ByteBuddyTypingV23;
 const family=typing?.specialRookie(state);
 if(family)return family;
 const type=typing?.nativeType(state.form);
 return typing?.BASE[type]||"ember";
}
function adult(state){
 initialize(state);
 const s=state.attributes,typing=window.ByteBuddyTypingV23;
 const primary=typing?.lineage(state);
 if(state.genetics?.mutation==="prisme"&&state.wins>=5&&s.esprit>=25)return "prism";
 if(state.genetics?.mutation==="aurore"&&primary!=="foudre"&&state.wins>=5&&s.vitesse>=25)return "auror";
 if(primary==="nature"&&state.wins>=5&&s.defense>=25&&s.esprit>=25&&state.health>=75&&(state.mistakes||0)<=2&&(state.lifeData?.goodDays||0)>=7)return "lumia";
 if(primary==="foudre"&&state.wins>=7&&s.vitesse>=28&&s.precision>=25)return "nebula";
 // On older saves, a mismatched Rookie joins its original egg family at Ultimate.
 if(primary&&typing?.BASE[primary]&&typing.nativeType(state.form)!==primary)return typing.BASE[primary]+"2";
 return state.form+"2";
}
function fighter(state){
 initialize(state);const s=state.attributes;
 const trait=window.ByteBuddyBestiaryV18?.trait(state.form)||null;
 return {maxPV:Math.round(86+s.vitalite*1.9+s.endurance*.65),
  attack:1+(s.force-10)*.025,
  defense:1/(1+Math.max(0,s.defense-10)*.021)*(trait==='defense'?.91:1),
  crit:Math.min(.28,.065+s.precision*.003+(trait==='precision'?.025:0)),
  precision:Math.min(1,.82+s.precision*.004+(trait==='precision'?.04:0)),
  priority:s.vitesse+(trait==='vitesse'?5:0),
  special:(1+(s.esprit-10)*.025)*(trait==='esprit'?1.1:1),
  attributes:{...s},trait};
}
function snapshot(state){
 initialize(state);
 const p=window.ByteBuddyTypingV23?.profile(state)||{};
 return {kind:'bytebuddy-vs-preview',ruleset:'v010',form:String(state.form),
  stage:Math.min(3,Math.max(0,Number(state.stage)||0)),
  level:Math.min(99,Math.max(1,Number(state.level)||1)),
  type:'pixel-monster',primaryType:p.primary||null,secondaryType:p.secondary||null,
  attributes:{...state.attributes}};
}
function validateSnapshot(raw){
 if(!raw||raw.kind!=='bytebuddy-vs-preview'||raw.ruleset!=='v010')throw Error('Code VS incompatible');
 if(!['baby','ember','verd','volt','aqua','shade','ember2','verd2','volt2','aqua2','shade2','lumia','nebula','prism','auror','cindr','cindr2','bramble','bramble2','tide','tide2','surge','surge2'].includes(raw.form))throw Error('Créature invalide');
 if(!Number.isInteger(raw.stage)||raw.stage<1||raw.stage>3 || !Number.isInteger(raw.level)||raw.level<1||raw.level>99)throw Error('Fiche invalide');
 if(!raw.attributes||keys.some(k=>!Number.isInteger(raw.attributes[k])||raw.attributes[k]<1||raw.attributes[k]>99))throw Error('Statistiques invalides');
 const typing=window.ByteBuddyTypingV23;
 if(raw.primaryType!=null&&!typing?.validPrimary(raw.primaryType))throw Error('Type principal invalide');
 if(raw.secondaryType!=null&&!typing?.validSecondary(raw.primaryType||typing.nativeType(raw.form),raw.secondaryType))throw Error('Double type invalide');
 if(raw.secondaryType&&raw.stage!==3)throw Error('Double type réservé aux formes ultimes');
 return raw;
}
window.ByteBuddyV10=Object.freeze({keys,labels,FOOD,TRAINING,initialize,diversity,meal,workout,babyStatus,rookie,adult,fighter,snapshot,validateSnapshot});
})();