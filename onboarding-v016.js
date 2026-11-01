/* ByteBuddy V0.16 - First-time trainer, egg, hatch and naming onboarding.
   Never opens automatically for accounts with an existing local save. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const DEFAULTS={
 flame:{name:"FLAMME",affinity:"flamme",talent:"force",stat:"force",bonus:"FORCE +3",desc:"Pour les dresseurs offensifs"},
 leaf:{name:"NATURE",affinity:"nature",talent:"garde",stat:"defense",bonus:"DÉFENSE +3",desc:"Pour les gardiens résistants"},
 wave:{name:"OCÉAN",affinity:"eau",talent:"esprit",stat:"precision",bonus:"PRÉCISION +3",desc:"Pour les dresseurs réfléchis"},
 bolt:{name:"FOUDRE",affinity:"foudre",talent:"force",stat:"vitesse",bonus:"VITESSE +3",desc:"Pour les créatures rapides"}
};
const STEPS=["trainer","egg","hatch","name","ready"];
const descriptions={
 trainer:["BIENVENUE, DRESSEUR","Choisis ton identité pour commencer l'aventure."],
 egg:["TON PREMIER ŒUF","Choisis une prédisposition. Tu décideras de sa véritable évolution en jouant."],
 hatch:["L'HEURE DE L'ÉCLOSION","Ton œuf est prêt. Découvre ton premier compagnon !"],
 name:["DONNE-LUI UN NOM","Son nom l'accompagnera tout au long de ses évolutions."],
 ready:["L'AVENTURE COMMENCE","Bienvenue dans le monde des dresseurs."]
};
const style=document.createElement("style");style.textContent="\n.bb-intro{position:absolute;inset:0;z-index:109;background:#d3e4ba;color:#2e5037;display:none;flex-direction:column;padding:13px 12px 12px;gap:9px;overflow-y:auto;overscroll-behavior:contain;font:900 11px/1.5 monospace}\n.bb-intro.open{display:flex}\n.bb-intro [hidden]{display:none!important}\n.bb-intro-top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #799674;padding-bottom:8px;gap:8px}\n.bb-intro-top b{font-size:13px;letter-spacing:.5px}.bb-intro-top small{font-size:9px}\n.bb-intro-track{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}\n.bb-intro-track span{height:5px;background:#9bb791}\n.bb-intro-track span.active{background:#356542}\n.bb-intro h3{font:900 16px/1.2 monospace;margin:4px 0 3px;text-align:center}\n.bb-intro p{font:10px/1.5 monospace;margin:0;text-align:center}\n.bb-intro label{display:block;font:900 11px monospace;margin-top:6px}\n.bb-intro input{width:100%;min-height:41px;padding:9px 8px;background:#f2f8e0;border:2px solid #75966f;color:#2f5336;font:900 13px monospace;border-radius:5px}\n.bb-intro button{font:900 11px monospace;min-height:40px;padding:7px 9px;border:2px solid #729173;border-radius:5px;background:#375d43;color:#f2fbdc}\n.bb-intro button.secondary{background:#e4eed2;color:#355a3d}\n.bb-intro button:disabled{opacity:.45}\n.bb-intro-error{color:#7f3332;min-height:18px;font:900 10px/1.4 monospace}\n.bb-intro-visual{display:flex;align-items:center;justify-content:center;min-height:102px;background:#bfd5a5;border:3px solid #88a47c;border-radius:7px}\n.bb-intro-visual svg{fill:#3c6446;width:80px;height:80px;image-rendering:pixelated}\n.bb-intro-visual canvas{width:100px;height:100px;image-rendering:pixelated}\n.bb-intro-eggs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:3px 0}\n.bb-intro-eggs button{background:#e6f0d1;color:#345841;min-height:99px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:2px solid #8aa57c}\n.bb-intro-eggs button.selected{background:#b6d5aa;border-color:#315f3c;box-shadow:inset 0 0 0 2px #345e3d}\n.bb-intro-eggs .px-icon{width:28px;height:28px}\n.bb-intro-eggs b{font-size:11px}.bb-intro-eggs small{font:9px/1.25 monospace}\n.bb-intro-row{display:flex;gap:8px;margin-top:3px}\n.bb-intro-row button{flex:1;min-width:0}\n.bb-intro-grow{flex:1;min-height:2px}\n.bb-intro-note{padding:8px;background:#e3efd1;border-left:3px solid #7e9a71;font:10px/1.5 monospace}\n";document.head.appendChild(style);
const overlay=document.createElement("section");
overlay.id="introScreen";overlay.className="bb-intro";
overlay.setAttribute("aria-label","Créer son premier dresseur et sa première créature");
overlay.innerHTML="\n<div class=\"bb-intro-top\"><b>BYTEBUDDY '98</b><small id=\"introStepNumber\">ÉTAPE 1 / 4</small></div>\n<div class=\"bb-intro-track\" id=\"introTrack\"><span></span><span></span><span></span><span></span></div>\n<h3 id=\"introTitle\">BIENVENUE, DRESSEUR</h3>\n<p id=\"introDescription\">Commence ton aventure.</p>\n<div id=\"introVisual\" class=\"bb-intro-visual\" hidden><svg class=\"px-icon\" aria-hidden=\"true\"><use href=\"#px-egg\"/></svg></div>\n<div id=\"introTrainer\">\n <label for=\"introHandle\">TON PSEUDO DE DRESSEUR</label>\n <input id=\"introHandle\" name=\"trainer_handle\" maxlength=\"20\" autocapitalize=\"off\" autocomplete=\"nickname\" spellcheck=\"false\" placeholder=\"EX : pixel_tamer\">\n <p class=\"bb-intro-note\">Tu peux jouer tout de suite, sans compte. Pour sauvegarder sur plusieurs appareils, crée ensuite un compte avec ton email.</p>\n <button id=\"introToAccount\" class=\"secondary\" type=\"button\" style=\"width:100%;margin-top:9px\">J'AI UN COMPTE / M'INSCRIRE</button>\n</div>\n<div id=\"introEggs\" class=\"bb-intro-eggs\" hidden></div>\n<div id=\"introHatchInfo\" hidden class=\"bb-intro-note\">Ton premier œuf contient une créature encore mystérieuse. Tes soins, ton alimentation et tes entraînements influenceront ses évolutions.</div>\n<div id=\"introNameBox\" hidden>\n <label for=\"introPetName\">NOM DE TA CRÉATURE</label>\n <input id=\"introPetName\" name=\"creature_name\" maxlength=\"18\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"EX : PIXEL\">\n</div>\n<div id=\"introReady\" class=\"bb-intro-note\" hidden>\n Ton compagnon a besoin de repas, de repos et d'entraînement. Chaque décision compte pour ses statistiques et son évolution.\n</div>\n<div class=\"bb-intro-error\" id=\"introError\" role=\"status\" aria-live=\"polite\"></div>\n<div class=\"bb-intro-grow\"></div>\n<div class=\"bb-intro-row\"><button id=\"introBack\" class=\"secondary\" type=\"button\" hidden>RETOUR</button><button id=\"introNext\" type=\"button\">CONTINUER</button></div>\n";
$("lcdScreen").appendChild(overlay);
const restoreBtn=document.createElement("button");
restoreBtn.id="introResume";restoreBtn.type="button";restoreBtn.className="primary";
restoreBtn.textContent="REPRENDRE LA CRÉATION DE MA CRÉATURE";
restoreBtn.style.width="100%";restoreBtn.style.marginTop="10px";
restoreBtn.hidden=true;
$("trainerPanel").appendChild(restoreBtn);
let bridge=null,paused=false;
const el=$("introEggs");
for(const [id,item] of Object.entries(DEFAULTS)){
 const button=document.createElement("button");button.type="button";button.dataset.egg=id;
 button.innerHTML='<svg class="px-icon" aria-hidden="true"><use href="#px-egg"/></svg><b>'+item.name+'</b><small>'+item.bonus+'</small>';
 button.setAttribute("aria-label",item.name+" : "+item.bonus);
 button.addEventListener("click",()=>{
  const st=bridge?.state();
  if(!st||st.stage!==0||!isActive())return;
  st.starterEgg=id;
  $("introError").textContent=item.desc;
  el.querySelectorAll("[data-egg]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.egg===id));
  bridge.save();
 });
 el.appendChild(button);
}
function isActive(){
 const step=bridge?.state()?.onboarding?.step;
 return STEPS.includes(step);
}
function isShown(){return isActive()&&!paused;}
function setStep(step){
 const st=bridge?.state();
 if(!st?.onboarding||!STEPS.includes(step))return;
 st.onboarding.step=step;
 paused=false;bridge.save();render();
}
function showError(message){$("introError").textContent=message;}
function render(){
 const st=bridge?.state();
 if(!st||!isActive()){overlay.classList.remove("open");restoreBtn.hidden=true;return;}
 if(paused){overlay.classList.remove("open");restoreBtn.hidden=false;return;}
 overlay.classList.add("open");restoreBtn.hidden=false;
 let step=st.onboarding.step;
 // Recover gracefully after reload, including a hatch before the naming step was saved.
 if(st.stage>0&&["trainer","egg","hatch"].includes(step)){st.onboarding.step="name";step="name";bridge.save();}
 if(st.stage===0&&(step==="name"||step==="ready")){st.onboarding.step="hatch";step="hatch";bridge.save();}
 const position=STEPS.indexOf(step);
 $("introStepNumber").textContent="ÉTAPE "+Math.min(4,position+1)+" / 4";
 const title=descriptions[step];$("introTitle").textContent=title[0];$("introDescription").textContent=title[1];
 $("introTrack").querySelectorAll("span").forEach((bar,i)=>bar.classList.toggle("active",i<=Math.min(3,position)));
 for(const [id,active] of [["introTrainer",step==="trainer"],["introEggs",step==="egg"],
  ["introHatchInfo",step==="hatch"],["introNameBox",step==="name"],["introReady",step==="ready"]])
  $(id).hidden=!active;
 $("introVisual").hidden=!["hatch","name","ready"].includes(step);
 if(step==="name"||step==="ready"){
  const canvas=$("introCreatureCanvas")||document.createElement("canvas");
  if(!canvas.id){canvas.id="introCreatureCanvas";canvas.width=100;canvas.height=100;$("introVisual").replaceChildren(canvas);}
  bridge.draw(canvas,"baby");
 }else if(step==="hatch"){
  $("introVisual").innerHTML='<svg class="px-icon" aria-hidden="true"><use href="#px-egg"/></svg>';
 }
 if(step==="trainer")$("introHandle").value=st.trainerName||$("introHandle").value||bridge.accountHandle()||"";
 if(step==="name")$("introPetName").value=st.petName||$("introPetName").value||"";
 if(step==="ready"){
  $("introTitle").textContent="BIENVENUE "+(st.petName||"COMPAGNON").toUpperCase();
  $("introDescription").textContent=(st.trainerName||"DRESSEUR").toUpperCase()+" · TON PREMIER COMPAGNON EST NÉ !";
 }
 $("introBack").hidden=!(step==="egg"||step==="hatch");
 $("introNext").textContent={
  trainer:"CRÉER MON DRESSEUR",egg:"ADOPTER CET ŒUF",hatch:"FAIRE ÉCLORE",
  name:"VALIDER SON NOM",ready:"COMMENCER À JOUER"
 }[step];
 $("introError").textContent="";
 el.querySelectorAll("[data-egg]").forEach(btn=>btn.classList.toggle("selected",btn.dataset.egg===st.starterEgg));
}
function advance(){
 if(!isShown())return;
 const st=bridge.state(),step=st.onboarding.step;
 if(step==="trainer"){
  const name=$("introHandle").value.trim().toLowerCase();
  if(!/^[a-z][a-z0-9_]{2,19}$/.test(name)){
   showError("PSEUDO : 3 À 20 CARACTÈRES, LETTRES, CHIFFRES OU _");return;
  }
  const account=bridge.accountHandle();
  if(account&&account!==name){
    showError("TON COMPTE CONNECTÉ UTILISE LE PSEUDO "+account.toUpperCase()+". UTILISE CE PSEUDO.");return;
  }
  st.trainerName=name;setStep("egg");return;
 }
 if(step==="egg"){
  if(!DEFAULTS[st.starterEgg]){showError("SÉLECTIONNE UN ŒUF POUR CONTINUER.");return;}
  const pick=DEFAULTS[st.starterEgg];
  st.genetics={affinity:pick.affinity,talent:pick.talent,mutation:null,parent:"baby",partner:"baby"};
  st.attributes={vitalite:12,force:10,defense:10,vitesse:10,precision:10,endurance:10,esprit:10};
  st.attributes[pick.stat]+=3;
  setStep("hatch");return;
 }
 if(step==="hatch"){
  if(st.stage!==0){setStep("name");return;}
  bridge.hatch();return;
 }
 if(step==="name"){
  const name=$("introPetName").value.replace(/[^\p{L}\p{N} _'-]/gu,"").replace(/\s+/g," ").trim().slice(0,18);
  if(name.length<2){showError("LE NOM DOIT CONTENIR AU MOINS 2 CARACTÈRES.");return;}
  st.petName=name;setStep("ready");bridge.render();return;
 }
 if(step==="ready"){
  st.onboarding={step:"done",completedAt:Date.now()};
  bridge.save();paused=false;render();
  bridge.render();
  // An invitation scanned before creating a character can continue automatically.
  let invitation=null;
  try{invitation=new URL(location.href).searchParams.get("vs");}catch(_){}
  if(invitation&&window.ByteBuddyV12UI?.joinInvite){
    bridge.showScreen("vs");
    window.ByteBuddyV12UI.joinInvite(invitation);
  }else bridge.showScreen("home");
 }
}
function back(){
 if(!isShown())return;
 const step=bridge.state().onboarding.step;
 if(step==="egg")setStep("trainer");
 else if(step==="hatch")setStep("egg");
}
function openAccount(){
 if(!isShown()||bridge.state().onboarding.step!=="trainer")return;
 paused=true;render();bridge.showScreen("trainer");
}
function resume(){
 paused=false;
 const st=bridge?.state();if(!st||!isActive())return;
 const handle=bridge.accountHandle();
 if(st.onboarding.step==="trainer"&&handle){st.trainerName=handle;bridge.save();}
 render();
}
$("introNext").addEventListener("click",advance);
$("introBack").addEventListener("click",back);
$("introToAccount").addEventListener("click",openAccount);
restoreBtn.addEventListener("click",resume);
$("introHandle").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();advance();}});
$("introPetName").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();advance();}});
document.addEventListener("keydown",e=>{
 if(!isShown())return;
 if(e.key==="Escape"||e.key==="ArrowLeft"||e.key==="ArrowRight"){
  e.preventDefault();e.stopImmediatePropagation();
  if(e.key==="Escape")back();
 }
},true);
window.ByteBuddyIntro={
 setup(x){bridge=x;render();},
 isActive, isShown,
 onHatch(){if(isActive()&&bridge.state().onboarding.step==="hatch")setStep("name");},
 refresh:render
};
})();