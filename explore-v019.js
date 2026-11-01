/* ByteBuddy '98 V0.19 — opt-in foreground GPS walks and collectible discoveries.
 * Never stores or transmits precise coordinates. Not a hardware step counter.
 * Walking rewards are client-side casual rewards, not ranked/trusted currency.
 */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const style=document.createElement("style");style.textContent="\n.bb-exp{color:#36573c;font:900 10px/1.55 monospace}\n.bb-exp [hidden]{display:none!important}\n.bb-exp-intro{padding:9px;background:#e2edcb;border-left:3px solid #789674;margin:10px 0}\n.bb-exp-counters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:9px 0}\n.bb-exp-counter{background:#e4edcc;border:2px solid #8fa880;border-radius:4px;padding:8px 3px;text-align:center;min-height:60px}\n.bb-exp-counter strong{display:block;font-size:17px}\n.bb-exp-counter small{display:block;font-size:9px}\n.bb-exp-map{position:relative;border:3px solid #759271;background:#cbdeaf;height:118px;margin:9px 0;overflow:hidden;display:flex;align-items:center;justify-content:center}\n.bb-exp-map:before{content:\"\";position:absolute;inset:0;background-image:linear-gradient(#81a17a55 1px,transparent 1px),linear-gradient(90deg,#81a17a55 1px,transparent 1px);background-size:19px 19px;opacity:.9}\n.bb-exp-map:after{content:\"\";position:absolute;left:50%;top:50%;width:64px;height:64px;border:2px dashed #5e8057;border-radius:50%;transform:translate(-50%,-50%)}\n.bb-exp-pet{z-index:1;font-size:10px;background:#e9f3d5;border:2px solid #46694a;padding:7px 12px;text-align:center}\n.bb-exp-live{font-size:10px;border:2px solid #8da580;background:#e4efce;padding:8px;margin:7px 0}\n.bb-exp-track{width:100%;height:13px;border:2px solid #789575;background:#e7efd5;overflow:hidden}\n.bb-exp-track span{display:block;height:100%;width:0;background:#436b47;transition:width .18s}\n.bb-exp-steps{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}\n.bb-exp button{background:#3c6346;color:#f3fce4;border:2px solid #789776;padding:9px;border-radius:5px;min-height:42px;font:900 10px monospace}\n.bb-exp button.secondary{color:#36563d;background:#e0eaca}\n.bb-exp button:disabled{opacity:.4}\n.bb-exp-items{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}\n.bb-exp-items button{font-size:9px;min-height:49px;text-align:left;padding:7px}\n.bb-exp-items b{font-size:11px}\n.bb-exp-foot{font-size:9px;opacity:.9}\n.bb-exp .px-icon{width:15px;height:15px;vertical-align:-3px;fill:currentColor}\n";document.head.appendChild(style);
const view=document.createElement("section");view.id="bbExpPanel";view.className="panel";view.hidden=true;
view.innerHTML="\n<div class=\"panel-header\"><h2>12 / EXPLORATION</h2><span class=\"section-number\">GPS VOLONTAIRE</span></div>\n<div class=\"bb-exp\">\n <div class=\"bb-exp-intro\">PROMÈNE-TOI AVEC TON COMPAGNON. TOUS LES 300 MÈTRES VALIDÉS, TROUVE UN COFFRE. À 1 200 MÈTRES, UN ŒUF PEUT REJOINDRE L'INCUBATEUR.</div>\n <div class=\"bb-exp-counters\"><div class=\"bb-exp-counter\"><strong id=\"bbExpMetres\">0 m</strong><small>AUJOURD'HUI</small></div><div class=\"bb-exp-counter\"><strong id=\"bbExpChestCount\">0 / 6</strong><small>COFFRES / JOUR</small></div><div class=\"bb-exp-counter\"><strong id=\"bbExpEggCount\">0 / 1</strong><small>ŒUF / JOUR</small></div></div>\n <div class=\"bb-exp-map\" role=\"img\" aria-label=\"Radar fictif pixel art, sans carte ni coordonnées\"><div class=\"bb-exp-pet\"><svg class=\"px-icon\" aria-hidden=\"true\"><use href=\"#px-home\"/></svg> <span id=\"bbExpPet\">EXPLORATEUR</span></div></div>\n <div class=\"bb-exp-live\" id=\"bbExpStatus\" role=\"status\" aria-live=\"polite\">GPS INACTIF. APPUIE SUR DÉMARRER POUR AUTORISER.</div>\n <div class=\"bb-exp-track\" aria-label=\"Progression vers le prochain coffre\"><span id=\"bbExpBar\"></span></div>\n <p id=\"bbExpNext\">PROCHAIN COFFRE : 300 M</p>\n <div class=\"bb-exp-steps\"><button id=\"bbExpStart\" type=\"button\">DÉMARRER LE GPS</button><button id=\"bbExpStop\" class=\"secondary\" type=\"button\" disabled>ARRÊTER</button></div>\n <p class=\"bb-exp-foot\">UNIQUEMENT QUAND BYTEBUDDY EST OUVERT ET VISIBLE. PAS DE TRACKING EN ARRIÈRE-PLAN. AUCUNE COORDONNÉE ENREGISTRÉE OU TRANSMISE. LA MARCHE EST ESTIMÉE À PARTIR DU GPS.</p>\n <h3>INVENTAIRE DE DÉCOUVERTE</h3>\n <div id=\"bbExpItems\" class=\"bb-exp-items\"></div>\n <p class=\"bb-exp-foot\" id=\"bbExpInventoryInfo\">LES OBJETS TROUVÉS SONT CONSERVÉS AVEC TA PARTIE. LES ŒUFS SONT PLACÉS DANS LE LABORATOIRE (3 MAXIMUM).</p>\n</div>";
document.querySelector(".right").appendChild(view);
const menu=document.createElement("button");menu.type="button";menu.dataset.view="explore";
menu.innerHTML='<span><svg class="px-icon" aria-hidden="true"><use href="#px-target"/></svg></span>EXPLORER';
$("lcdMenu").querySelector(".lcd-menu-grid").appendChild(menu);
const ITEMS={
 berry:{label:"BAIES JOYEUSES",apply:s=>{s.joy=Math.min(100,s.joy+18);return "MORAL +18";}},
 kit:{label:"KIT DE SOINS",apply:s=>{s.health=Math.min(100,s.health+20);return "SANTÉ +20";}},
 snack:{label:"FRUITS D'ÉNERGIE",apply:s=>{s.energy=Math.min(100,s.energy+18);return "ÉNERGIE +18";}},
 coins:{label:"FRAGMENTS PIXEL",apply:s=>{s.bits+=8;return "+8 BITS";}}
};
const day=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
function normalize(x){
 const raw=x&&typeof x==="object"?x:{};
 const items={};for(const name of Object.keys(ITEMS))items[name]=Math.max(0,Math.min(99,Math.trunc(Number(raw.items?.[name])||0)));
 return {totalMeters:Math.max(0,Math.min(1000000,Math.trunc(Number(raw.totalMeters)||0))),
  boxes:Math.max(0,Math.min(99999,Math.trunc(Number(raw.boxes)||0))),
  eggsFound:Math.max(0,Math.min(9999,Math.trunc(Number(raw.eggsFound)||0))),
  items,
  daily:{date:typeof raw.daily?.date==="string"?raw.daily.date:day(),
   meters:Math.max(0,Math.min(10000,Math.trunc(Number(raw.daily?.meters)||0))),
   chests:Math.max(0,Math.min(6,Math.trunc(Number(raw.daily?.chests)||0))),
   egg:raw.daily?.egg===true}
 };
}
let api=null,watch=null,enabled=false,lastFix=null,status="GPS INACTIF",requestId=0;
function state(){return api?.state()}
function ensure(){const st=state();if(!st)return null;st.exploration=normalize(st.exploration);
 if(st.exploration.daily.date!==day())st.exploration.daily={date:day(),meters:0,chests:0,egg:false};
 return st.exploration;
}
function update(message){
 if(message!==undefined)status=message;
 const e=ensure();if(!e)return;
 const m=e.daily.meters,pending=e.daily.chests<6?Math.max(0,(e.daily.chests+1)*300-m):0;
 $("bbExpMetres").textContent=m+" m";
 $("bbExpChestCount").textContent=e.daily.chests+" / 6";
 $("bbExpEggCount").textContent=(e.daily.egg?1:0)+" / 1";
 $("bbExpStatus").textContent=status;
 $("bbExpPet").textContent=(state().petName||"COMPAGNON").slice(0,18).toUpperCase();
 $("bbExpNext").textContent=e.daily.chests===6?"TOUS LES COFFRES QUOTIDIENS TROUVÉS": "PROCHAIN COFFRE : "+pending+" M";
 $("bbExpBar").style.width=(e.daily.chests===6?100:Math.min(100,Math.max(0,(m%300)/300*100)))+"%";
 $("bbExpStart").disabled=enabled||state().stage===0||state().sleeping;
 $("bbExpStop").disabled=!enabled;
 const buttons=$("bbExpItems");buttons.replaceChildren();
 for(const [id,item] of Object.entries(ITEMS)){
  const count=e.items[id]||0,button=document.createElement("button");
  button.type="button";button.dataset.item=id;button.disabled=count===0||state().stage===0;
  button.textContent=item.label+" ("+count+")";
  button.setAttribute("aria-label","Utiliser "+item.label+", quantité "+count);
  button.addEventListener("click",()=>use(id));buttons.appendChild(button);
 }
}
function rewardChest(e){
 if(e.daily.chests>=6)return;
 e.daily.chests++;e.boxes++;
 // Simple, finite, non-competitive collectibles; full inventory converts to Bits.
 const choices=Object.keys(ITEMS),key=choices[Math.floor(Math.random()*choices.length)];
 let message;
 if(e.items[key]>=20){state().bits+=8;message="INVENTAIRE PLEIN : +8 BITS";}
 else{e.items[key]++;message="COFFRE "+e.daily.chests+" : "+ITEMS[key].label;}
 api.log?.("EXPLORATION · "+message);
 api.notify?.(message);
}
function rewardEgg(e){
 if(e.daily.egg||e.daily.meters<1200)return;
 e.daily.egg=true; // Each day can produce at most one exploration egg.
 const st=state();
 if(st.eggs.length>=3){
  e.items.berry=Math.min(20,e.items.berry+1);
  api.notify?.("INCUBATEUR PLEIN : BAIES BONUS À LA PLACE DE L'ŒUF.");
  return;
 }
 const affinity=["flamme","nature","eau","foudre"][Math.floor(Math.random()*4)];
 const talent=affinity==="flamme"?"force":affinity==="eau"?"esprit":"garde";
 const id=Date.now()*10+Math.floor(Math.random()*10);
 st.eggs.push({id,genetics:{affinity,talent,mutation:null,parent:st.form,partner:"baby"},generation:Math.min(999,st.generation+1)});
 e.eggsFound++;
 api.log?.("EXPLORATION · Un œuf "+affinity.toUpperCase()+" rejoint l'incubateur !");
 api.notify?.("ŒUF TROUVÉ ! RETROUVE-LE DANS LE LABORATOIRE.");
}
function commit(){api.save();api.render();update();}
function acceptPosition(position){
 if(!enabled||document.hidden)return;
 if(state()?.stage===0){stop('EXPLORATION ARRÊTÉE : LA CRÉATURE ATTEND SON ÉCLOSION.');return;}
 const c=position?.coords||{},now=Number(position.timestamp);
 const lat=Number(c.latitude),lon=Number(c.longitude),acc=Number(c.accuracy);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||
    !Number.isFinite(acc)||acc<=0||acc>35||!Number.isFinite(now)||Math.abs(Date.now()-now)>20000){
  update("SIGNAL GPS IMPRÉCIS. MARCHE DANS UN ENDROIT DÉGAGÉ.");return;
 }
 if(Number.isFinite(c.speed)&&c.speed>3.2){lastFix=null;update("TRAJET TROP RAPIDE : DISTANCE NON COMPTÉE.");return;}
 if(!lastFix){lastFix={lat,lon,acc,at:now};update("GPS CONNECTÉ · MARCHE EN GARDANT LE JEU OUVERT.");return;}
 const sec=(now-lastFix.at)/1000;
 if(sec<=0||sec>120){lastFix={lat,lon,acc,at:now};update("NOUVEAU POINT GPS ACQUIS.");return;}
 const rad=Math.PI/180,dLat=(lat-lastFix.lat)*rad,dLon=(lon-lastFix.lon)*rad;
 const a=Math.sin(dLat/2)**2+Math.cos(lat*rad)*Math.cos(lastFix.lat*rad)*Math.sin(dLon/2)**2;
 const distance=6371000*2*Math.asin(Math.min(1,Math.sqrt(Math.max(0,a))));
 const minimum=Math.max(12,acc*.7,lastFix.acc*.7);
 if(distance<minimum)return;
 if(distance/sec>3.2){update("SAUT GPS OU VITESSE EXCESSIVE : MÈTRES IGNORÉS.");lastFix=null;return;}
 // Conservative uncertainty deduction. Geolocation is not proof of walking.
 const reliable=Math.max(0,Math.floor(distance-Math.max(3,(acc+lastFix.acc)*.15)));
 lastFix={lat,lon,acc,at:now};
 if(reliable<5)return;
 const e=ensure();if(!e)return;
 const old=e.daily.meters;
 e.daily.meters=Math.min(10000,old+reliable);
 e.totalMeters=Math.min(1000000,e.totalMeters+reliable);
 while(e.daily.chests<6&&e.daily.meters>=(e.daily.chests+1)*300)rewardChest(e);
 rewardEgg(e);
 commit();status="MARCHE VALIDÉE : +"+reliable+" M · "+e.daily.meters+" M AUJOURD'HUI";
 update(status);
}
function errorPosition(err){
 if(!enabled)return;
 let msg=err?.code===1?"AUTORISATION GPS REFUSÉE. ACTIVE-LA DANS TON NAVIGATEUR.":
  err?.code===2?"SIGNAL GPS INDISPONIBLE.":"DÉLAI GPS DÉPASSÉ. RESSAIE À L'EXTÉRIEUR.";
 stop(msg);
}
function stop(reason="EXPLORATION ARRÊTÉE. AUCUN SUIVI EN COURS."){
 requestId++;enabled=false;lastFix=null;
 if(watch!==null&&navigator.geolocation?.clearWatch)navigator.geolocation.clearWatch(watch);
 watch=null;update(reason);
}
function start(){
 if(enabled)return;
 if(!api||state()?.stage===0||state()?.sleeping){update("IL FAUT UNE CRÉATURE ÉVEILLÉE POUR EXPLORER.");return;}
 if(!window.isSecureContext||!navigator.geolocation?.watchPosition){update("GPS NON PRIS EN CHARGE. UTILISE HTTPS ET UN TÉLÉPHONE.");return;}
 if(document.hidden){update("OUVRE LE JEU AU PREMIER PLAN.");return;}
 enabled=true;lastFix=null;const own=++requestId;
 update("DEMANDE D'AUTORISATION GPS...");
 try{
  const id=navigator.geolocation.watchPosition(
   pos=>{if(own===requestId)acceptPosition(pos)},
   err=>{if(own===requestId)errorPosition(err)},
   {enableHighAccuracy:true,maximumAge:0,timeout:18000});
  if(enabled&&own===requestId)watch=id;else navigator.geolocation.clearWatch(id);
 }catch(_){stop("IMPOSSIBLE DE DÉMARRER LE GPS.");}
}
function use(id){
 const item=ITEMS[id],e=ensure();if(!item||!e||e.items[id]<=0||state().stage===0)return;
 if(id==="kit"&&state().health>=100||id==="berry"&&state().joy>=100||id==="snack"&&state().energy>=100){
  api.notify?.("CETTE JAUGE EST DÉJÀ PLEINE.");return;
 }
 e.items[id]--;
 const result=item.apply(state());
 api.log?.("OBJET EXPLORATION · "+item.label+" · "+result);
 api.notify?.(result);commit();
}
$("bbExpStart").addEventListener("click",start);
$("bbExpStop").addEventListener("click",()=>stop());
document.addEventListener("visibilitychange",()=>{if(document.hidden&&enabled)stop("GPS MIS EN PAUSE : JEU MASQUÉ. RELANCE LA PROMENADE.");});
window.addEventListener("pagehide",()=>{if(enabled)stop("GPS ARRÊTÉ : PAGE QUITTÉE.");});
window.ByteBuddyExploreV19={setup(x){api=x;ensure();update();},start,stop,active:()=>enabled,refresh:()=>update()};
})();