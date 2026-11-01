(()=>{
"use strict";
const V=window.ByteBuddyV10,$=id=>document.getElementById(id);
if(!V)throw Error("V0.10 rules missing");
const st=document.createElement("style");st.textContent=".v10-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:11px 0}.v10-stat{display:flex;justify-content:space-between;padding:7px;background:#dcecc0;border:1px solid #819c75;border-radius:5px;font:900 10px monospace;color:#36553c}.v10-stat b{font-size:13px}.v10-growth{font:10px/1.5 monospace;color:#39563b;border:1px dashed #7b9870;border-radius:4px;padding:9px}.v10-food{position:absolute;inset:0;background:#d4e5bc;color:#35553b;z-index:90;padding:13px;overflow-y:auto}.v10-food[hidden]{display:none}.v10-food h3{font:900 14px monospace;margin:0 0 6px}.v10-food p{font:10px/1.5 monospace;margin:6px 0 11px}.v10-foodgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v10-foodgrid button{padding:10px 5px;border:2px solid #759872;border-radius:5px;background:#ebf4d5;color:#365a3e;min-height:57px;font:900 11px monospace}.v10-foodgrid button small{display:block;margin-top:5px;font:9px/1.3 monospace}.v10-close{width:100%;padding:10px 5px;margin-top:10px;border:0;border-radius:5px;background:#385d43;color:#f7ffe7;font:900 11px monospace}.v10-vs{color:#38543d;font:10px/1.5 monospace}.v10-vs .v10-notice{border:1px dashed #829e7d;padding:7px;border-radius:5px;margin:8px 0}.v10-vs textarea{width:100%;min-height:76px;background:#eef8db;color:#38543d;border:2px solid #8fab84;padding:7px;font:10px monospace;resize:vertical}.v10-vsbuttons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}.v10-vsbuttons button{padding:9px 4px;min-height:38px;border:1px solid #789a75;background:#416346;color:#f1f9de;font:900 10px monospace;border-radius:5px}#miniSelection{overflow-y:auto;justify-content:flex-start;gap:6px}#miniSelection button{min-height:39px;padding:7px 8px;display:flex;align-items:center;justify-content:flex-start;gap:9px;text-align:left;line-height:1.3}#miniSelection button>.px-icon{display:block;width:20px;height:20px;flex:0 0 20px}#miniSelection button>.training-label{flex:1;min-width:0}#miniSelection button:focus-visible{outline:2px solid #f6f0ce;outline-offset:-4px}";document.head.appendChild(st);
const attrs=document.createElement("div");attrs.className="v10-stats";attrs.id="v10Attributes";
const growth=document.createElement("div");growth.className="v10-growth";growth.id="v10Growth";
$("statList").after(attrs,growth);
// Keep all six training buttons visually consistent with the 12x12 LCD sprite.
const modes={
 precision:{icon:"target",label:"PRÉCISION — FRAPPER AU BON MOMENT",id:"miniPrecision"},
 dodge:{icon:"dodge",label:"ESQUIVE — ÉVITER LES OBSTACLES",id:"miniDodge"},
 force:{icon:"force",label:"FORCE — COUPS PUISSANTS"},
 endurance:{icon:"endurance",label:"ENDURANCE — COURSE LONGUE"},
 defense:{icon:"defense",label:"DÉFENSE — PROTECTION"},
 esprit:{icon:"esprit",label:"ESPRIT — CONCENTRATION"}
};
for(const [mode,{icon,label,id}] of Object.entries(modes)){
 let b=id?$(id):null;
 if(!b){b=document.createElement("button");b.type="button";b.id="mini-"+mode;b.dataset.v10mode=mode;$("miniSelection").appendChild(b);}
 // Fixed icon IDs and fixed labels; do not interpolate player-supplied content.
 b.innerHTML='<svg class="px-icon" aria-hidden="true" focusable="false"><use href="#px-'+icon+'"/></svg><span class="training-label">'+label+'</span>';
 b.setAttribute("aria-label",label);
}
const food=document.createElement("section");food.className="v10-food";food.id="v10Food";food.hidden=true;
food.innerHTML='<h3>CHOISIS SON REPAS</h3><p>Chaque aliment fait progresser une statistique différente.</p><div id="v10FoodGrid" class="v10-foodgrid"></div><p id="v10FoodNote">Une alimentation variée encourage la croissance.</p><button type="button" class="v10-close" id="v10FoodClose">RETOUR</button>';
$("lcdScreen").appendChild(food);
const vs=document.createElement("section");vs.className="panel v10-vs";vs.id="v10VsPanel";
vs.innerHTML='<div class="panel-header"><h2>10 / FICHES DE DRESSEURS</h2><span class="section-number">PRÉ-VS</span></div><p class="v10-notice">Partage une fiche de monstre pour un duel simulé local. Le VS en ligne en temps réel et les classements nécessitent un serveur sécurisé : ils ne sont pas encore activés.</p><div class="v10-vsbuttons"><button id="v10ExportVS" type="button">MA FICHE</button><button id="v10LoadVS" type="button">IMPORTER</button></div><textarea id="v10VSCode" placeholder="Colle un code BBVS1 de ton ami" spellcheck="false" aria-label="Code de défi"></textarea><div class="v10-vsbuttons"><button id="v10SparVS" type="button">DUEL SIMULÉ</button><button id="v10ClearVS" type="button">EFFACER</button></div><p id="v10VSStatus">Le résultat simulé ne donne ni récompenses ni classement.</p>';
document.querySelector(".right").appendChild(vs);
const menuButton=document.createElement("button");menuButton.type="button";menuButton.dataset.view="vs";menuButton.innerHTML="<span>VS</span>DUELS";
$("lcdMenu").querySelector(".lcd-menu-grid").appendChild(menuButton);
let bridge=null,foodOpen=false,opponent=null;
function closeFood(){foodOpen=false;food.hidden=true;}
function openFood(){
 if(!bridge||foodOpen)return;
 foodOpen=true;food.hidden=false;
 $("v10FoodNote").textContent="DIVERSITÉ : "+V.diversity(bridge.state())+"/6 · Bonus stats toutes les 90 s.";
}
for(const [key,item] of Object.entries(V.FOOD)){
 const btn=document.createElement("button");btn.type="button";
 btn.innerHTML=item.name+"<small>"+item.detail+"</small>";
 btn.addEventListener("click",()=>{if(!foodOpen||!bridge)return;closeFood();bridge.feed(key)});
 $("v10FoodGrid").appendChild(btn);
}
$("v10FoodClose").addEventListener("click",closeFood);
function render(state){
 V.initialize(state);
 attrs.innerHTML=V.keys.map(key=>'<div class="v10-stat"><span>'+V.labels[key]+'</span><b>'+state.attributes[key]+"</b></div>").join("");
 const b=V.babyStatus(state);
 growth.textContent=state.stage===1?"CROISSANCE : "+(b.ready?"PRÊT À ÉVOLUER":b.missing.join(" · "))+" · ÂGE "+b.ageMinutes+" min":
  state.stage===0?"FAIS ÉCLORE TON ŒUF":"LES STATS ET LES ALIMENTS GUIDENT LES ÉVOLUTIONS.";
}
function encode(state){return "BBVS1."+btoa(JSON.stringify(V.snapshot(state))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");}
function decode(code){
 const val=String(code||"").trim();
 if(!/^BBVS1\.[A-Za-z0-9_-]{40,900}$/.test(val))throw Error("Code incorrect");
 const str=val.slice(6).replace(/-/g,"+").replace(/_/g,"/");
 return V.validateSnapshot(JSON.parse(atob(str+"=".repeat((4-str.length%4)%4))));
}
$("v10ExportVS").addEventListener("click",async()=>{
 if(!bridge||bridge.state().stage===0){$("v10VSStatus").textContent="Fais éclore ton monstre pour créer une fiche.";return}
 const code=encode(bridge.state());$("v10VSCode").value=code;
 try{await navigator.clipboard.writeText(code);$("v10VSStatus").textContent="Fiche copiée. Transmets le code à un autre dresseur."}
 catch(_){$("v10VSStatus").textContent="Fiche créée. Copie le texte manuellement."}
});
$("v10LoadVS").addEventListener("click",()=>{
 try{opponent=decode($("v10VSCode").value);$("v10VSStatus").textContent="Fiche chargée : "+opponent.form.toUpperCase()+". Duel simulé disponible."}
 catch(e){opponent=null;$("v10VSStatus").textContent="Erreur : "+e.message}
});
$("v10SparVS").addEventListener("click",()=>{
 if(!bridge||bridge.state().stage===0){$("v10VSStatus").textContent="Fais éclore ton monstre.";return}
 if(!opponent){$("v10VSStatus").textContent="Importe d'abord la fiche d'un adversaire.";return}
 const me=V.snapshot(bridge.state());
 const weight=c=>c.attributes.force*1.2+c.attributes.defense*1.1+c.attributes.vitesse*1.1+
 c.attributes.precision+c.attributes.endurance+c.attributes.esprit+c.attributes.vitalite*1.2+c.level*2;
 const chance=Math.max(.12,Math.min(.88,.5+(weight(me)-weight(opponent))/220));
 $("v10VSStatus").textContent="DUEL SIMULÉ : "+(Math.random()<chance?"VICTOIRE":"DÉFAITE")+
  " · puissance "+Math.round(weight(me))+" contre "+Math.round(weight(opponent))+
  ". Aucun résultat multijoueur officiel.";
});
$("v10ClearVS").addEventListener("click",()=>{$("v10VSCode").value="";opponent=null;$("v10VSStatus").textContent="Code effacé."});
window.ByteBuddyV10UI={setup(api){bridge=api;render(api.state());},render,openFood,closeFood,isFoodOpen:()=>foodOpen};
})();