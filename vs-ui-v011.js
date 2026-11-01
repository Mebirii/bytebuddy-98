(()=>{
"use strict";
const Engine=window.ByteBuddyV11,Rules=window.ByteBuddyV10,$=id=>document.getElementById(id);
if(!Engine||!Rules)throw Error("VS dependencies unavailable");
const style=document.createElement("style");style.textContent="\n.v11-overlay{position:absolute;inset:0;z-index:87;display:none;background:#d4e5b8;color:#345438;font:900 10px monospace}\n.v11-overlay.open{display:flex;flex-direction:column}
.v11-overlay [hidden]{display:none!important}\n.v11-top{height:39px;flex:none;border-bottom:3px solid #879e79;background:#e7efce;display:flex;justify-content:space-between;align-items:center;padding:5px 8px}\n.v11-top button{font:900 9px monospace;border:1px solid #657f62;background:#45684a;color:#f2fbdb;padding:6px;border-radius:4px}\n.v11-field{flex:none;display:grid;grid-template-columns:1fr 24px 1fr;align-items:center;padding:7px 9px;background:#c4d9a9;border-bottom:3px solid #839b7a}\n.v11-player{text-align:center;min-width:0}.v11-player b{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.v11-player canvas{display:block;width:65px;height:65px;margin:auto;image-rendering:pixelated}\n.v11-hp{border:2px solid #4d704c;background:#e1ebce;height:11px;margin:3px 0}.v11-hp>span{display:block;background:#45674b;height:100%;width:100%}\n.v11-player small{font-size:9px;white-space:nowrap}.v11-vs{text-align:center;font-size:15px}\n.v11-body{flex:1;min-height:0;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:9px;align-items:center;justify-content:center;background:#dceabe}\n.v11-body strong{text-align:center;font-size:12px}.v11-body p{font:10px/1.45 monospace;margin:0;text-align:center}\n.v11-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;width:100%}\n.v11-actions button,.v11-next{padding:9px 5px;min-height:44px;background:#416346;border:2px solid #6d8b6b;color:#f4ffdf;font:900 11px monospace;border-radius:5px}\n.v11-actions button:disabled{opacity:.36}.v11-next{width:100%}\n.v11-history{width:100%;font:10px/1.5 monospace;border-left:3px solid #8da680;padding-left:6px}\n.v11-foot{height:27px;flex:none;background:#e5eecc;border-top:2px solid #8da680;padding:6px;font-size:9px;text-align:center}\n.v11-launch{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}\n.v11-launch button{min-height:50px;border:2px solid #729572;background:#416346;color:#f3fbe2;font:900 10px monospace;padding:8px 4px;border-radius:5px}\n";document.head.appendChild(style);
const launches=document.createElement("div");launches.className="v11-launch";
launches.innerHTML='<button id="v11CPU" type="button">VS ORDINATEUR</button><button id="v11Local" type="button">VS 2 JOUEURS</button>';
$("v10VsPanel").appendChild(launches);
const note=document.createElement("p");note.textContent="Duels jouables contre le CPU ou à deux sur un seul appareil. Le vrai VS en ligne nécessite un serveur dédié.";note.className="v10-notice";$("v10VsPanel").appendChild(note);
const overlay=document.createElement("section");overlay.className="v11-overlay";overlay.id="v11Overlay";
overlay.setAttribute("aria-label","Combat amical des dresseurs");
overlay.innerHTML="\n<div class=\"v11-top\"><b id=\"v11Round\">MANCHE 01</b><button type=\"button\" id=\"v11Exit\">QUITTER X</button></div>\n<div class=\"v11-field\">\n<div class=\"v11-player\"><b id=\"v11Name0\">DRESSEUR 1</b><canvas width=\"88\" height=\"88\" id=\"v11Sprite0\"></canvas><div class=\"v11-hp\"><span id=\"v11Bar0\"></span></div><small id=\"v11Hp0\">PV</small></div>\n<div class=\"v11-vs\">VS</div>\n<div class=\"v11-player\"><b id=\"v11Name1\">DRESSEUR 2</b><canvas width=\"88\" height=\"88\" id=\"v11Sprite1\"></canvas><div class=\"v11-hp\"><span id=\"v11Bar1\"></span></div><small id=\"v11Hp1\">PV</small></div>\n</div>\n<div class=\"v11-body\"><strong id=\"v11Headline\">COMBAT</strong><div id=\"v11Messages\" class=\"v11-history\">PRÊT !</div>\n<div id=\"v11Actions\" class=\"v11-actions\"><button data-v11move=\"attack\">FRAPPER</button><button data-v11move=\"guard\">PARER</button><button data-v11move=\"focus\">CANALISER</button><button data-v11move=\"special\">POUVOIR</button></div>\n<button type=\"button\" id=\"v11Next\" class=\"v11-next\" hidden>CONTINUER</button>\n<button type=\"button\" id=\"v11Replay\" class=\"v11-next\" hidden>COPIER LE REPLAY</button>\n</div>\n<div class=\"v11-foot\" id=\"v11Footer\">AMICAL · AUCUNE RÉCOMPENSE</div>";$("lcdScreen").appendChild(overlay);
const names={baby:"BIBI",ember:"EMBERIX",verd:"VERDIX",volt:"ZAPPIX",aqua:"AQUARI",shade:"OMBRO",ember2:"INFERIX",verd2:"FLORION",volt2:"VOLTAR",aqua2:"MARÉON",shade2:"NOCTURON",lumia:"LUMIAR",nebula:"NÉBULIX",prism:"PRISMOR",auror:"AURORIX"};
let api=null,room=null,mode="cpu",phase="pick",turnPlayer=0;
function readCode(value){
 const code=String(value||"").trim();
 if(!/^BBVS1\.[A-Za-z0-9_-]{40,1000}$/.test(code))throw Error("Colle la fiche BBVS1 de ton adversaire.");
 const str=code.slice(6).replace(/-/g,"+").replace(/_/g,"/");
 return Rules.validateSnapshot(JSON.parse(atob(str+"=".repeat((4-str.length%4)%4))));
}
function cpuOpponent(user){
 const types=["ember","verd","volt","aqua","shade"];
 const form=types[(Math.max(0,types.indexOf(user.form))+2)%types.length];
 const stats=Object.fromEntries(Object.entries(user.attributes).map(([k,v])=>[k,Math.max(1,Math.min(99,v+(k==="force"||k==="defense"?2:-1)))]));
 return Rules.validateSnapshot({kind:"bytebuddy-vs-preview",ruleset:"v010",form,stage:Math.max(1,Math.min(2,user.stage)),level:user.level,attributes:stats});
}
function start(kind){
 if(!api)return;
 const player=api.state();
 if(player.stage===0){$("v10VSStatus").textContent="Fais éclore ton œuf avant de combattre.";return}
 if(player.sleeping){$("v10VSStatus").textContent="Réveille ton compagnon pour combattre.";return}
 const first=Rules.snapshot(player);let second;
 try{second=kind==="cpu"?cpuOpponent(first):readCode($("v10VSCode").value)}
 catch(err){$("v10VSStatus").textContent=err.message;return}
 const randomSeed=crypto.getRandomValues(new Uint32Array(1))[0];
 room=Engine.create(first,second,randomSeed);mode=kind;phase="pick";turnPlayer=0;
 overlay.classList.add("open");$("v11Replay").hidden=true;render();
}
function exit(){room=null;overlay.classList.remove("open");phase="pick"}
function render(){
 if(!room)return;
 $("v11Round").textContent="MANCHE "+String(Math.min(room.round,24)).padStart(2,"0");
 for(let i=0;i<2;i++){
   const p=room.players[i];
   $("v11Name"+i).textContent="J"+(i+1)+" "+(names[p.form]||p.form);
   $("v11Hp"+i).textContent=p.hp+"/"+p.maxHp+" PV · EN "+p.energy;
   $("v11Bar"+i).style.width=(p.hp/p.maxHp*100)+"%";
   api.draw($("v11Sprite"+i),p.form);
 }
 $("v11Actions").hidden=phase!=="pick";
 $("v11Next").hidden=phase==="pick";
 $("v11Replay").hidden=room.phase!=="ended";
 $("v11Footer").textContent=(mode==="cpu"?"VS CPU":"VS DEUX JOUEURS")+" · AMICAL · NON CLASSÉ";
 if(phase==="pass"){
   $("v11Headline").textContent="PASSE AU JOUEUR 2";
   $("v11Messages").textContent="Le joueur 1 a choisi. Passe la console à l'autre joueur sans lui révéler l'action.";
   $("v11Next").textContent="JOUEUR 2 PRÊT";
 }else if(phase==="results"){
   $("v11Headline").textContent=room.winner===null?"RÉSULTAT DE LA MANCHE":room.winner==="draw"?"ÉGALITÉ":"VICTOIRE JOUEUR "+(room.winner+1);
   $("v11Messages").replaceChildren();
   for(const message of room.logs){const el=document.createElement("p");el.textContent=message;$("v11Messages").appendChild(el)}
   $("v11Next").textContent=room.phase==="ended"?"TERMINER":"MANCHE SUIVANTE";
 }else{
   $("v11Headline").textContent="JOUEUR "+(turnPlayer+1)+" · CHOISIS";
   $("v11Messages").textContent="L'attaque dépend des stats. La parade réduit les dégâts. Canaliser donne de l'énergie.";
   for(const b of overlay.querySelectorAll("[data-v11move]"))b.disabled=!Engine.canUse(room,turnPlayer,b.dataset.v11move);
 }
}
function select(action){
 if(!room||phase!=="pick")return;
 try{
   Engine.choose(room,turnPlayer,action);
   if(turnPlayer===0){
      if(mode==="cpu"){Engine.choose(room,1,Engine.botChoice(room));Engine.resolve(room);phase="results";}
      else phase="pass";
   }else{Engine.resolve(room);phase="results";}
   render();
 }catch(err){$("v11Messages").textContent=err.message}
}
function next(){
 if(!room)return;
 if(phase==="pass"){turnPlayer=1;phase="pick";}
 else if(phase==="results"){if(room.phase==="ended"){exit();return}turnPlayer=0;phase="pick";}
 render();
}
$("v11CPU").addEventListener("click",()=>start("cpu"));
$("v11Local").addEventListener("click",()=>start("local"));
$("v11Exit").addEventListener("click",exit);
$("v11Next").addEventListener("click",next);
overlay.querySelectorAll("[data-v11move]").forEach(btn=>btn.addEventListener("click",()=>select(btn.dataset.v11move)));
$("v11Replay").addEventListener("click",async()=>{
 if(!room||room.phase!=="ended")return;
 try{await navigator.clipboard.writeText(JSON.stringify(Engine.replay(room)));$("v11Footer").textContent="REPLAY COPIÉ. PARTIE AMICALE."}
 catch(_){$("v11Footer").textContent="PRESSE-PAPIERS INDISPONIBLE"}
});
document.addEventListener("keydown",e=>{
 if(!room||!overlay.classList.contains("open")||e.altKey||e.ctrlKey||e.metaKey)return;
 if(!["Escape","Enter","1","2","3","4"].includes(e.key))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.key==="Escape")exit();
 else if(e.key==="Enter"&&phase!=="pick")next();
 else if(phase==="pick"&&/^[1-4]$/.test(e.key))select(Engine.ACTIONS[Number(e.key)-1]);
},true);
window.ByteBuddyV11UI={setup(x){api=x;},isActive(){return !!room;},exit};
})();