/* ByteBuddy '98 V0.21 — optional developer simulator, only when ?dev=1.
   Separate save key: no interference with a player's real companion. */
(()=>{
"use strict";
if(!window.ByteBuddyDevMode){window.ByteBuddyDevV21={active:false,setup(){},refresh(){}};return;}
const $=id=>document.getElementById(id);
const life=window.ByteBuddyLifeV20,DAY=86400000;
const style=document.createElement("style");
style.textContent="\n.bb-dev{font:900 11px/1.55 monospace;color:#33583d}.bb-dev .dev-intro,.bb-dev .dev-status{padding:9px;margin:9px 0;background:#dbeac4;border:2px solid #8daa80}.bb-dev .dev-status{background:#c7dfae;min-height:38px}.bb-dev .dev-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:9px 0}.bb-dev button{min-height:37px;padding:6px 5px;background:#3e6848;color:#edf6dd;border:2px solid #789976;border-radius:5px;font:900 10px/1.2 monospace}.bb-dev button.secondary{background:#e4efd2;color:#33563a}.bb-dev button:disabled{opacity:.38;cursor:not-allowed}.bb-dev .dev-pills{display:flex;gap:6px;flex-wrap:wrap;margin:11px 0}.bb-dev .dev-pills span{padding:5px 7px;border:2px solid #8fa884;background:#e1edce}.bb-dev .dev-check{display:flex;align-items:center;gap:9px;background:#e6f0d6;padding:9px;border:2px solid #8ca784}.bb-dev .dev-check input{accent-color:#3d6544;width:18px;height:18px;flex:none}.bb-dev .dev-progress{height:13px;border:2px solid #71926b;background:#e7efd6;margin:7px 0}.bb-dev .dev-progress > span{display:block;height:100%;width:0;background:#466d4d}.bb-dev .dev-subtitle{display:block;margin:13px 0 5px;font-size:11px}.bb-dev .dev-warning{font-size:9px;color:#4a684e;line-height:1.5;margin-top:12px}\n";
document.head.appendChild(style);
const panel=document.createElement("section");
panel.className="panel";panel.id="bbDevPanel";panel.hidden=true;
panel.innerHTML="\n<div class=\"panel-header\"><h2>13 / LABO DE TEST</h2><span class=\"section-number\">DEV V0.21</span></div>\n<div class=\"bb-dev\">\n <div class=\"dev-intro\">SIMULATION ISOLÉE • MÊME CONSOLE ET MÊMES CRÉATURES QUE LE JEU. LA PARTIE NORMALE N'EST PAS MODIFIÉE.</div>\n <div class=\"dev-pills\"><span id=\"devDay\">JOUR 0</span><span id=\"devPhase\">ŒUF</span><span id=\"devLife\">45 JOURS</span></div>\n <div class=\"dev-progress\"><span id=\"devBar\"></span></div>\n <div class=\"dev-status\" id=\"devStatus\" role=\"status\" aria-live=\"polite\">PRÊT À TESTER.</div>\n <label class=\"dev-check\" for=\"devIdeal\"><input type=\"checkbox\" id=\"devIdeal\" checked>SIMULER DES SOINS EXEMPLAIRES + CONDITIONS D'ÉVOLUTION (UNIQUEMENT DANS LE TEST)</label>\n <b class=\"dev-subtitle\">ACCÉLÉRER LE TEMPS</b>\n <div class=\"dev-grid\">\n  <button id=\"devHatch\" type=\"button\">FAIRE ÉCLORE</button>\n  <button id=\"devOne\" type=\"button\">+ 1 JOUR</button>\n  <button id=\"devSeven\" type=\"button\">+ 7 JOURS</button>\n  <button id=\"devThirty\" type=\"button\">+ 30 JOURS</button>\n  <button id=\"devAuto\" type=\"button\">LECTURE AUTO • 4 J/S</button>\n  <button id=\"devPause\" class=\"secondary\" type=\"button\">PAUSE</button>\n </div>\n <b class=\"dev-subtitle\">JALONS DE VIE</b>\n <div class=\"dev-grid\">\n  <button data-dev-day=\"3\" type=\"button\" class=\"secondary\">JOUR 3 · ENFANT</button>\n  <button data-dev-day=\"16\" type=\"button\" class=\"secondary\">JOUR 16 · ADULTE</button>\n  <button data-dev-day=\"36\" type=\"button\" class=\"secondary\">JOUR 36 · SENIOR</button>\n  <button data-dev-day=\"45\" type=\"button\" class=\"secondary\">JOUR 45 · FIN STANDARD</button>\n  <button data-dev-day=\"60\" type=\"button\" class=\"secondary\">JOUR 60 · MAXIMUM</button>\n  <button id=\"devNext\" type=\"button\" class=\"secondary\">NOUVELLE GÉNÉRATION</button>\n </div>\n <button id=\"devReset\" type=\"button\" class=\"secondary\" style=\"width:100%;margin-top:7px\">RÉINITIALISER UNIQUEMENT LA PARTIE TEST</button>\n <p class=\"dev-warning\">LE TEMPS SIMULÉ EST CONVERTI EN ÂGE VIRTUEL : LE TEMPS DU TÉLÉPHONE NE CHANGE PAS. LES PROGRÈS ET SOUVENIRS RESTENT DANS UN ESPACE TEST LOCAL. CE MODE N'EST PAS UN CONTRÔLE D'ACCÈS SÉCURISÉ.</p>\n</div>";
document.querySelector(".right").appendChild(panel);
const item=document.createElement("button");
item.type="button";item.dataset.view="dev";
item.innerHTML='<span><svg class="px-icon" aria-hidden="true"><use href="#px-clock"/></svg></span>LABO TEST';
$("lcdMenu").querySelector(".lcd-menu-grid").appendChild(item);
let bridge=null,timer=null,last="MODE TEST PRÊT · 0 JOUR SIMULÉ.";
function running(){return timer!==null;}
function notice(v){last=v;$("devStatus").textContent=v;}
function stop(){if(timer!==null){clearInterval(timer);timer=null;}refresh();}
function current(){return bridge?.state()||null;}
function refresh(){
 if(!bridge)return;
 const st=current(),d=life.ageDays(st),lim=life.longevity(st);
 $("devDay").textContent=st.stage>0?"JOUR "+d:"JOUR 0";
 $("devPhase").textContent=life.phase(st);
 $("devLife").textContent=st.stage>0?"VIE "+lim+" J":"CYCLE TERMINÉ / ŒUF";
 $("devBar").style.width=(st.stage>0?Math.min(100,d/lim*100):0)+"%";
 $("devStatus").textContent=last;
 $("devHatch").disabled=st.stage!==0||!!st.lifeOutcome;
 for(const id of ["devOne","devSeven","devThirty","devAuto"])
  $(id).disabled=st.stage===0||!!st.lifeOutcome||(id==="devAuto"&&running());
 for(const button of panel.querySelectorAll("[data-dev-day]"))
  button.disabled=st.stage===0||!!st.lifeOutcome||d>=Number(button.dataset.devDay);
 $("devPause").disabled=!running();
 $("devNext").disabled=st.stage===0&&!st.lifeOutcome;
}
function step(n){
 if(!bridge)return;
 const st=current();
 if(st.stage===0||st.lifeOutcome){stop();notice("DÉMARRE UN NOUVEAU CYCLE OU FAIS ÉCLORE TON ŒUF.");return;}
 const age=life.ageDays(st),days=Math.max(0,Math.min(65-age,Math.floor(Number(n)||0)));
 if(!days)return;
 const ideal=$("devIdeal").checked;
 let lived=0,lifeEnd=null;
 for(let d=age+1;d<=age+days;d++){
  if(ideal){
   // Ideal care and objective shortcuts exist only in this disposable developer save.
   if(d%2===1)st.lifeData.goodDays=Math.min(30,(st.lifeData.goodDays||0)+1);
   st.care=Math.max(24,st.care||0);
   st.wins=Math.max(3,st.wins||0);
   st.train=Math.max(1,st.train||0);
   st.diet={...st.diet,fruits:Math.max(1,st.diet?.fruits||0),legumes:Math.max(1,st.diet?.legumes||0)};
   st.health=100;st.fullness=90;st.hygiene=90;st.energy=90;st.joy=90;st.sleeping=false;
  }
  st.lifeData.birthAt=Date.now()-d*DAY-1500;
  st.age=d*86400;
  if(st.stage===1)st.babyBornAt=Date.now()-Math.max(21*60000,d*DAY);
  bridge.evolve();bridge.evolve();
  lived++;
  // Let the real game renderer perform the death and trigger the same farewell animation.
  if(life.ageDays(st)>=life.longevity(st)){lifeEnd=d;stop();break;}
 }
 bridge.save();bridge.render();
 if(lifeEnd!==null){stop();notice("FIN DE VIE NATURELLE AU JOUR "+lifeEnd+" · RETROUVE SES SOUVENIRS DANS LE MÉMORIAL.");}
 else notice("+"+lived+" JOUR(S) • "+life.phase(st)+" • "+(ideal?"SOINS EXEMPLAIRES":"VIEILLISSEMENT SEUL")+".");
 refresh();
}
function goTo(day){const st=current();if(st)step(Number(day)-life.ageDays(st));}
$("devHatch").addEventListener("click",()=>{stop();bridge?.hatch();notice("CRÉATURE NÉE. LA SIMULATION PEUT COMMENCER.");refresh();});
$("devOne").addEventListener("click",()=>step(1));
$("devSeven").addEventListener("click",()=>step(7));
$("devThirty").addEventListener("click",()=>step(30));
panel.querySelectorAll("[data-dev-day]").forEach(el=>el.addEventListener("click",()=>goTo(el.dataset.devDay)));
$("devAuto").addEventListener("click",()=>{
 if(running()||!bridge)return;
 timer=setInterval(()=>{const st=current();if(!st||st.stage===0||st.lifeOutcome){stop();return;}step(1);},250);
 notice("LECTURE AUTOMATIQUE : 4 JOURS VIRTUELS PAR SECONDE.");refresh();
});
$("devPause").addEventListener("click",()=>{stop();notice("SIMULATION EN PAUSE.");});
$("devIdeal").addEventListener("change",()=>notice($("devIdeal").checked?"SOINS EXEMPLAIRES ACTIVÉS.":"SIMULATION SANS SOINS AJOUTÉS."));
$("devNext").addEventListener("click",()=>{stop();bridge?.newGame();refresh();});
$("devReset").addEventListener("click",()=>{
 stop();
 if(window.confirm("Effacer exclusivement la simulation de développement ? La sauvegarde de jeu normale restera intacte."))bridge?.reset();
});
window.addEventListener("pagehide",stop);
window.ByteBuddyDevV21={active:true,setup(x){bridge=x;refresh();},refresh,stop};
})();