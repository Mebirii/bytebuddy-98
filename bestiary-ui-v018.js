/* ByteBuddy V0.18 — in-LCD bestiary detail cards with progressive discovery hints. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),catalog=window.ByteBuddyBestiaryV18;
const tips={
 cindr:"FAMILLE FLAMME : développe FORCE 20 et PRÉCISION 16, avec 2 repas de VIANDE, avant l'évolution bébé.",
 cindr2:"FAIS GRANDIR LA NOUVELLE BRANCHE FLAMME : 24 soins et 3 victoires après le stade Rookie.",
 bramble:"FAMILLE NATURE : développe DÉFENSE 20 et offre 2 repas de LÉGUMES. Une haute VITALITÉ aide.",
 bramble2:"FAIS GRANDIR LA NOUVELLE BRANCHE NATURE : 24 soins et 3 victoires après le stade Rookie.",
 tide:"FAMILLE EAU : développe ESPRIT 18 et offre 2 repas de POISSON. Un profil défensif aide.",
 tide2:"FAIS GRANDIR LA NOUVELLE BRANCHE EAU : 24 soins et 3 victoires après le stade Rookie.",
 surge:"FAMILLE FOUDRE : développe VITESSE 20 et ENDURANCE 16 avant l'évolution bébé.",
 surge2:"FAIS GRANDIR LA NOUVELLE BRANCHE FOUDRE : 24 soins et 3 victoires après le stade Rookie."
};
const style=document.createElement("style");style.textContent=".bb-dex-detail{position:absolute;inset:0;z-index:86;background:#d8e8bf;color:#36543c;display:none;flex-direction:column;align-items:center;gap:9px;padding:10px 12px;text-align:center;font:900 11px/1.45 monospace;overflow-y:auto}.bb-dex-detail.open{display:flex}.bb-dex-top{display:flex;justify-content:space-between;align-items:center;width:100%;padding-bottom:6px;border-bottom:3px solid #829d76}.bb-dex-top strong{font:900 13px monospace}.bb-dex-detail button{background:#3b6047;color:#f3ffe1;border:2px solid #73916a;border-radius:5px;padding:8px 12px;font:900 10px monospace;min-height:38px}.bb-dex-detail canvas{width:108px;height:108px;image-rendering:pixelated;background:#c2d9a8;border:3px solid #8aa17c;border-radius:5px}.bb-dex-detail h3{font:900 16px monospace;margin:1px 0}.bb-dex-detail p{font:10px/1.6 monospace;margin:0}.bb-dex-detail .bb-dex-kind{padding:6px 8px;border:1px solid #75936f;background:#e2edcd;font:900 10px monospace}.bb-dex-detail .bb-dex-tip{width:100%;background:#e8f2d2;border-left:3px solid #63866c;padding:10px;text-align:left;font:10px/1.6 monospace}.dex-item{cursor:pointer;touch-action:manipulation}.dex-item:focus-visible{outline:3px solid #a87a46;outline-offset:2px}";document.head.appendChild(style);
const modal=document.createElement("section");modal.id="bbDexDetail";modal.className="bb-dex-detail";
modal.setAttribute("role","dialog");modal.setAttribute("aria-label","Détails du bestiaire");
modal.innerHTML="<div class=\"bb-dex-top\"><strong>FICHE BESTIAIRE</strong><button id=\"bbDexClose\" type=\"button\">FERMER</button></div><canvas id=\"bbDexCanvas\" width=\"120\" height=\"120\" aria-label=\"Portrait pixel de la créature\"></canvas><h3 id=\"bbDexName\">CRÉATURE</h3><div class=\"bb-dex-kind\" id=\"bbDexType\"></div><p id=\"bbDexBio\"></p><div class=\"bb-dex-tip\" id=\"bbDexTip\"></div><button id=\"bbDexReturn\" type=\"button\">RETOUR AU BESTIAIRE</button>";
$("lcdScreen").appendChild(modal);
const canvas=$("bbDexCanvas"),grid=$("dexGrid");let bridge=null,selected=null;
function close(){modal.classList.remove("open");selected=null;}
function isOpen(){return modal.classList.contains("open")}
function open(form){
 const b=bridge;if(!b||!b.order.includes(form))return;
 const state=b.state(),seen=!!state.dex?.[form],creature=catalog?.species[form];
 selected=form;
 $("bbDexName").textContent=seen?b.names[form]:"NON DÉCOUVERTE";
 $("bbDexType").textContent=seen?(b.types[form].toUpperCase()+" / "+(creature?.stage===2?"ROOKIE":creature?.stage===3?"ULTIME":form.endsWith("2")?"ULTIME":form==="egg"?"ŒUF":form==="baby"?"BÉBÉ":"ROOKIE")):"SILHOUETTE MYSTÈRE";
 $("bbDexBio").textContent=seen?(b.desc[form]||"Une forme découverte par ton dresseur."):"Un secret reste à découvrir dans les générations de ByteBuddy.";
 $("bbDexTip").textContent=seen?(creature?"TALENT : "+creature.trait+" · "+creature.detail:
  "DÉCOUVERTE : "+(state.form===form?"TON COMPAGNON ACTUEL":"FORME AJOUTÉE À TON BESTIAIRE")):
  (tips[form]||"Fais évoluer plusieurs générations, soigne ton compagnon et essaie différentes disciplines.");
 const context=canvas.getContext("2d");context.clearRect(0,0,canvas.width,canvas.height);
 if(seen){canvas.hidden=false;b.draw(canvas,form);}
 else canvas.hidden=true;
 modal.classList.add("open");$("bbDexClose").focus({preventScroll:true});
}
grid.addEventListener("click",event=>{
 const card=event.target.closest(".dex-item");if(!card||!grid.contains(card))return;
 open(card.id.slice(4));
});
grid.addEventListener("keydown",event=>{
 if(event.key!=="Enter"&&event.key!==" ")return;
 const card=event.target.closest(".dex-item");if(!card||!grid.contains(card))return;
 event.preventDefault();open(card.id.slice(4));
});
$("bbDexClose").addEventListener("click",close);
$("bbDexReturn").addEventListener("click",close);
document.addEventListener("keydown",event=>{
 if(!isOpen())return;
 if(["Escape","ArrowLeft","ArrowRight","Enter"].includes(event.key)){
  event.preventDefault();event.stopImmediatePropagation();
  if(event.key==="Escape"||event.key==="Enter")close();
 }
},true);
window.ByteBuddyDexV18={setup(x){bridge=x;},active:isOpen,close,open};
})();