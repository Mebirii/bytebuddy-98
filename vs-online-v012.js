(()=>{
"use strict";
const E=window.ByteBuddyV11,R=window.ByteBuddyV10,$=id=>document.getElementById(id);
if(!E||!R)throw Error("Modules VS indisponibles");
const style=document.createElement("style");style.textContent="\n.bb-online{margin-top:12px;border-top:2px solid #8fa57e;padding-top:11px;color:#345838;font:10px/1.4 monospace}\n.bb-online strong{font-size:12px}.bb-online input{display:block;width:100%;margin:8px 0;background:#edf4d6;color:#35533c;border:2px solid #829977;border-radius:4px;padding:9px;font:11px monospace}\n.bb-online-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0}\n.bb-online button,.bb-online-stage button{font:900 10px monospace;background:#3b6247;color:#f5ffe3;border:2px solid #759673;border-radius:5px;padding:9px 5px;min-height:40px}\n.bb-online-state{border:1px dashed #819d77;margin:7px 0;padding:9px;font:10px/1.5 monospace}\n.bb-online-stage{position:absolute;inset:0;z-index:94;background:#d6e6bc;color:#38543e;display:none;flex-direction:column;font:900 11px monospace}\n.bb-online-stage.active{display:flex}.bb-online-stage [hidden]{display:none!important}\n.bb-online-top{flex-shrink:0;display:flex;justify-content:space-between;align-items:center;background:#e8efd0;padding:8px;border-bottom:3px solid #8ca17e}\n.bb-online-fighters{flex-shrink:0;display:grid;grid-template-columns:1fr 24px 1fr;gap:4px;align-items:center;padding:8px;background:#c6dcb1;border-bottom:2px solid #91a786}\n.bb-online-fighter{min-width:0;text-align:center;font-size:10px}\n.bb-online-fighter b{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.bb-online-fighter canvas{display:block;width:65px;height:65px;margin:auto;image-rendering:pixelated}\n.bb-online-hp{height:9px;border:2px solid #647f5b;background:#f1f5e1;margin:4px 0}.bb-online-hp span{display:block;width:100%;height:100%;background:#466948}\n.bb-online-fighter small{font:9px monospace}\n.bb-online-body{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;padding:9px}\n.bb-online-body strong{font-size:12px;text-align:center}\n.bb-online-body p{font:10px/1.5 monospace;text-align:center;margin:0}\n.bb-online-moves{display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%}\n.bb-online-moves button{min-height:45px}\n.bb-online-moves button:disabled{opacity:.32}\n.bb-online-go{width:100%;min-height:43px}\n.bb-online-foot{font:9px/1.3 monospace;text-align:center;padding:7px;border-top:2px solid #90a584;background:#e8efd0}\n";document.head.appendChild(style);
const pane=document.createElement("div");pane.className="bb-online";
pane.innerHTML='<strong>VS EN LIGNE — BÊTA P2P</strong><p>Deux téléphones ou PC, salon privé. Les deux jeux doivent rester ouverts.</p><div class="bb-online-actions"><button type="button" id="onlineCreate">CRÉER UN SALON</button><button type="button" id="onlineJoin">REJOINDRE</button></div><input id="onlineCode" aria-label="Code ou lien du salon" autocomplete="off" spellcheck="false" placeholder="CODE DU SALON OU LIEN"><div class="bb-online-actions"><button type="button" id="onlineCopy">COPIER LE LIEN</button><button type="button" id="onlineLeave">FERMER LE SALON</button></div><div class="bb-online-state" id="onlineStatus" role="status" aria-live="polite">Crée un salon pour inviter un ami.</div><p>Matchs amicaux uniquement. Connexion directe via un service tiers, disponibilité selon le réseau.</p>';
$("v10VsPanel").appendChild(pane);
const overlay=document.createElement("section");overlay.className="bb-online-stage";overlay.id="onlineStage";
overlay.setAttribute("aria-label","Arène de duel à distance");overlay.innerHTML="\n<div class=\"bb-online-top\"><b id=\"onlineRound\">SALON EN LIGNE</b><button type=\"button\" id=\"onlineExit\">QUITTER</button></div>\n<div class=\"bb-online-fighters\">\n <div class=\"bb-online-fighter\"><b id=\"onlineName0\">HÔTE</b><canvas id=\"onlineSprite0\" width=\"88\" height=\"88\"></canvas><div class=\"bb-online-hp\"><span id=\"onlineHP0\"></span></div><small id=\"onlineVitals0\">PV --</small></div>\n <b style=\"text-align:center\">VS</b>\n <div class=\"bb-online-fighter\"><b id=\"onlineName1\">INVITÉ</b><canvas id=\"onlineSprite1\" width=\"88\" height=\"88\"></canvas><div class=\"bb-online-hp\"><span id=\"onlineHP1\"></span></div><small id=\"onlineVitals1\">PV --</small></div>\n</div>\n<div class=\"bb-online-body\"><strong id=\"onlineHeading\">EN ATTENTE</strong><p id=\"onlineMessage\">Invite un autre joueur.</p>\n <button type=\"button\" id=\"onlineShare\" hidden>COPIER L'INVITATION</button>\n <div class=\"bb-online-moves\" id=\"onlineMoves\" hidden><button type=\"button\" data-online-move=\"attack\">FRAPPER</button><button type=\"button\" data-online-move=\"guard\">PARER</button><button type=\"button\" data-online-move=\"focus\">CANALISER</button><button type=\"button\" data-online-move=\"special\">POUVOIR</button></div>\n <button type=\"button\" id=\"onlineContinue\" class=\"bb-online-go\" hidden>CONTINUER</button>\n</div>\n<div class=\"bb-online-foot\" id=\"onlineFoot\">AMICAL · PAS DE CLASSEMENT</div>";
$("lcdScreen").appendChild(overlay);
let api=null, peer=null, conn=null, role=null, room=null, code="", phase="idle", myChoice=false, seen=[false,false], resultLines=[], intentional=false, timeoutId=null, roomReady=false;
const status=m=>$("onlineStatus").textContent=m;
const index=()=>role==="host"?0:1;
const roomNames={baby:"BIBI",ember:"EMBERIX",verd:"VERDIX",volt:"ZAPPIX",aqua:"AQUARI",shade:"OMBRO",ember2:"INFERIX",verd2:"FLORION",volt2:"VOLTAR",aqua2:"MARÉON",shade2:"NOCTURON",lumia:"LUMIAR",nebula:"NÉBULIX",prism:"PRISMOR",auror:"AURORIX",...Object.fromEntries(Object.entries(window.ByteBuddyBestiaryV18?.species||{}).map(([id,info])=>[id,info.name]))};
const protocol="bb98-p2p-v012";
function newCode(){const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",a=crypto.getRandomValues(new Uint8Array(14));return "BB98-"+Array.from(a,x=>chars[x%chars.length]).join("");}
function parseCode(raw){
 let s=String(raw||"").trim();
 if(/^https:\/\//.test(s)){
  const u=new URL(s);
  if(u.host!==location.host)throw Error("Ce lien ne correspond pas au jeu.");
  s=u.searchParams.get("vs")||"";
 }
 s=s.toUpperCase();
 if(!/^BB98-[A-HJ-NP-Z2-9]{14}$/.test(s))throw Error("Code d'invitation incorrect.");
 return s;
}
function inviteLink(){
 const u=new URL(location.href);u.searchParams.set("vs",code);u.searchParams.set("v","015");return u.toString();
}
function send(kind,data={}){
 if(!conn?.open)return false;
 try{conn.send({protocol,kind,...data});return true;}catch(_){return false;}
}
function safeState(r){
 if(!r)return null;
 return {round:r.round,phase:r.phase,winner:r.winner,
  players:r.players.map(p=>({form:p.form,hp:p.hp,maxHp:p.maxHp,energy:p.energy,maxEnergy:p.maxEnergy}))};
}
function render(){
 if(!role)return;overlay.classList.add("active");
 $("onlineRound").textContent=room?"MANCHE "+room.round+" · CONNECTÉ":"SALON "+code;
 if(room?.players){
  room.players.forEach((p,i)=>{
   $("onlineName"+i).textContent="J"+(i+1)+" "+(roomNames[p.form]||p.form)+" · "+(p.type||"NEUTRE").toUpperCase()+(p.secondaryType?" / "+p.secondaryType.toUpperCase():"");
   $("onlineVitals"+i).textContent=p.hp+"/"+p.maxHp+" PV · EN "+p.energy;
   $("onlineHP"+i).style.width=Math.min(100,Math.max(0,p.hp/p.maxHp*100))+"%";
   api?.draw($("onlineSprite"+i),p.form);
  });
 }
 const waiting=!room, finished=room?.phase==="ended", result=phase==="result";
 $("onlineShare").hidden=!(waiting&&role==="host");
 $("onlineMoves").hidden=waiting||result||finished||myChoice;
 $("onlineContinue").hidden=waiting||!result||finished||seen[index()];
 if(waiting){$("onlineHeading").textContent="EN ATTENTE D'UN DRESSEUR";$("onlineMessage").textContent=role==="host"?"Partage ton code et attends ton adversaire.":"Connexion au salon...";}
 else if(finished){
  $("onlineHeading").textContent=room.winner==="draw"?"ÉGALITÉ":room.winner===index()?"VICTOIRE":"DÉFAITE";
  $("onlineMessage").textContent=resultLines.join(" · ")||"Combat terminé.";
 }else if(result){
  $("onlineHeading").textContent="RÉSULTAT DE LA MANCHE";
  $("onlineMessage").textContent=resultLines.join(" · ");
  $("onlineContinue").textContent="MANCHE SUIVANTE";
 }else{
  $("onlineHeading").textContent=myChoice?"ACTION ENREGISTRÉE":"CHOISIS TON ACTION";
  $("onlineMessage").textContent=myChoice?"Attente du choix de l'autre joueur.":"Choisis secrètement une action.";
  const player=room.players[index()];
  overlay.querySelectorAll("[data-online-move]").forEach(b=>{b.disabled=b.dataset.onlineMove==="special"&&player.energy<14;});
 }
 $("onlineFoot").textContent="J"+(index()+1)+" · "+(role==="host"?"HÔTE":"INVITÉ")+" · AMICAL";
 window.ByteBuddyQR?.update();
}
function snapshotData(nextPhase,lines=[]){
 return {game:safeState(room),phase:nextPhase,
  picked:[!!room?.choices?.[0],!!room?.choices?.[1]],lines};
}
function publish(nextPhase,lines=[]){send("snapshot",snapshotData(nextPhase,lines));}
function finishRound(){
 if(!room||room.phase!=="choice"||!room.choices.every(Boolean))return;
 const result=E.resolve(room);
 phase="result";seen=[false,false];myChoice=false;resultLines=result.messages;
 publish("result",result.messages);render();
}
function chooseHost(move){
 if(phase!=="choosing"||!room||myChoice)return;
 try{E.choose(room,0,move);myChoice=true;if(room.choices.every(Boolean))finishRound();else{publish("choosing");render();}}
 catch(e){status(e.message);}
}
function chooseGuest(move){
 if(phase!=="choosing"||!room||myChoice)return;
 if(move==="special"&&room.players[1].energy<14)return;
 if(send("move",{round:room.round,move})){myChoice=true;render();}
 else status("Connexion interrompue. Action non envoyée.");
}
function close(notify=true,message="Salon fermé."){
 intentional=true;roomReady=false;if(notify)send("leave");
 clearTimeout(timeoutId);
 const oldConn=conn,oldPeer=peer;
 conn=null;peer=null;role=null;room=null;phase="idle";myChoice=false;seen=[false,false];resultLines=[];code="";
 try{oldConn?.close();}catch(_){}
 try{oldPeer?.destroy();}catch(_){}
 overlay.classList.remove("active");status(message);intentional=false;window.ByteBuddyQR?.stop();window.ByteBuddyQR?.update();
}
function onMessage(msg){
 if(!msg||msg.protocol!==protocol||typeof msg.kind!=="string")return;
 if(msg.kind==="leave"){close(false,"Ton adversaire a quitté le salon.");return;}
 if(role==="host"){
  if(msg.kind==="hello"&&!room){
   try{const second=R.validateSnapshot(msg.profile);
    room=E.create(R.snapshot(api.state()),second,crypto.getRandomValues(new Uint32Array(1))[0]);
    phase="choosing";status("Adversaire connecté !");publish("choosing");render();
   }catch(_){send("error",{message:"Fiche de combattant invalide."});}
  }else if(msg.kind==="move"&&room&&phase==="choosing"){
   if(msg.round!==room.round||!E.ACTIONS.includes(msg.move)||room.choices[1])return;
   try{E.choose(room,1,msg.move);if(room.choices.every(Boolean))finishRound();else publish("choosing");}
   catch(_){send("error",{message:"Action refusée."});}
  }else if(msg.kind==="next"&&room&&phase==="result"&&room.phase!=="ended"){
   seen[1]=true;if(seen.every(Boolean)){phase="choosing";seen=[false,false];myChoice=false;publish("choosing");}render();
  }
 }else{
  if(msg.kind==="snapshot"&&msg.game?.players?.length===2){
   if(!Number.isInteger(msg.game.round)||msg.game.round<1||msg.game.round>25)return;
   room=msg.game;phase=msg.phase==="result"?"result":"choosing";
   if(phase==="choosing"){myChoice=!!msg.picked?.[1];seen=[false,false];resultLines=[];}
   if(Array.isArray(msg.lines))resultLines=msg.lines.filter(x=>typeof x==="string").slice(0,5);
   render();
  }else if(msg.kind==="error")status(String(msg.message||"Erreur de duel").slice(0,160));
 }
}
function attach(c){
 if(conn&&conn.open){c.close();return;}
 conn=c;
 c.on("open",()=>{
  if(c!==conn)return;
  clearTimeout(timeoutId);
  if(role==="guest"){send("hello",{profile:R.snapshot(api.state())});status("Connecté ! Attente du début du duel...");}
  else status("Invité connecté, vérification...");
  timeoutId=setTimeout(()=>{if(role&&!room)close(false,"Le duel n'a pas démarré. Recrée le salon.");},25000);
 });
 c.on("data",data=>{if(c===conn)onMessage(data);});
 c.on("close",()=>{if(c===conn&&!intentional)close(false,"Connexion perdue. Relance un salon.");});
 c.on("error",e=>{if(c===conn)status("Erreur réseau : "+(e?.message||"échec de connexion"));});
}
function eligible(){
 if(role){status("Ferme le salon précédent.");return false;}
 if(!api||typeof window.Peer!=="function"){status("Le service P2P est indisponible. Recharge la page.");return false;}
 const p=api.state();
 if(p.stage===0||p.sleeping){status(p.stage===0?"Fais éclore ton œuf.":"Réveille ton compagnon.");return false;}
 if(!window.isSecureContext){status("Une connexion HTTPS est nécessaire.");return false;}
 return true;
}
function create(){
 if(!eligible())return;
 roomReady=false;role="host";code=newCode();phase="waiting";$("onlineCode").value=code;render();status("Création du salon...");
 try{
  peer=new window.Peer(code,{debug:0});
  peer.on("open",id=>{if(role!=="host")return;code=id;roomReady=true;$("onlineCode").value=id;render();status("Salon créé : "+id+". Scanne le QR ou copie l'invitation.");});
  peer.on("connection",c=>{if(role==="host"&&!conn)attach(c);else c.close();});
  peer.on("error",e=>{if(role==="host")close(false,"Salon inaccessible : "+(e?.message||"erreur"));});
 }catch(e){close(false,"Création impossible : "+e.message);}
}
function join(){
 if(!eligible())return;
 try{code=parseCode($("onlineCode").value);}
 catch(e){status(e.message);return;}
 role="guest";phase="waiting";render();status("Connexion au salon...");
 try{
  peer=new window.Peer(undefined,{debug:0});
  peer.on("open",()=>{
   if(role!=="guest")return;
   attach(peer.connect(code,{reliable:true,serialization:"json",label:"bytebuddy-v012"}));
  });
  peer.on("error",e=>{if(role==="guest")close(false,"Connexion impossible : "+(e?.message||"erreur"));});
 }catch(e){close(false,"Connexion impossible : "+e.message);}
}
function next(){
 if(!room||phase!=="result"||room.phase==="ended"||seen[index()])return;
 seen[index()]=true;
 if(role==="host"){
  if(seen.every(Boolean)){phase="choosing";seen=[false,false];myChoice=false;publish("choosing");}
 }else send("next",{round:room.round-1});
 render();
}
$("onlineCreate").addEventListener("click",create);
$("onlineJoin").addEventListener("click",join);
$("onlineLeave").addEventListener("click",()=>close());
$("onlineExit").addEventListener("click",()=>close());
$("onlineContinue").addEventListener("click",next);
$("onlineShare").addEventListener("click",async()=>{
 if(!code)return;
 try{await navigator.clipboard.writeText(inviteLink());$("onlineMessage").textContent="Lien copié ! Envoie-le à ton ami.";}
 catch(_){$("onlineMessage").textContent="Partage ce code : "+code;}
});
$("onlineCopy").addEventListener("click",async()=>{
 if(!code){status("Crée un salon pour obtenir un lien.");return;}
 const url=new URL(location.href);url.searchParams.set("vs",code);url.searchParams.set("v","015");
 try{await navigator.clipboard.writeText(url.toString());status("Lien d'invitation copié.");}
 catch(_){status("Partage le code : "+code);}
});
overlay.querySelectorAll("[data-online-move]").forEach(b=>b.addEventListener("click",()=>{
 if(role==="host")chooseHost(b.dataset.onlineMove);else chooseGuest(b.dataset.onlineMove);
}));
document.addEventListener("keydown",e=>{
 if(!role||!overlay.classList.contains("active")||e.altKey||e.metaKey||e.ctrlKey)return;
 if(!["Escape","Enter","1","2","3","4"].includes(e.key))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.key==="Escape")close();
 else if(e.key==="Enter"&&phase==="result")next();
 else if(phase==="choosing"&&/^[1-4]$/.test(e.key)){
  const action=E.ACTIONS[Number(e.key)-1];if(role==="host")chooseHost(action);else chooseGuest(action);
 }
},true);
try{
 const supplied=new URL(location.href).searchParams.get("vs");
 if(supplied){$("onlineCode").value=parseCode(supplied);status("Invitation QR reçue. Ouverture du salon...");}
}catch(_){}
const scannedInvitation=(()=>{try{const raw=new URL(location.href).searchParams.get("vs");return raw?parseCode(raw):null;}catch(_){return null;}})();
window.ByteBuddyV12UI={
 setup(x){
   api=x;
   if(scannedInvitation){
     $("onlineCode").value=scannedInvitation;
     x.openDuel?.();
     if(x.state()?.stage>0 && !x.state()?.sleeping && !role)join();
     else status("Invitation reçue. Fais éclore ou réveille ta créature, puis sélectionne REJOINDRE.");
   }
 },
 active:()=>!!role,stop:close,
 getInvite:()=>role==="host"&&roomReady&&!room?inviteLink():null,
 joinInvite:value=>{
   if(role){status("Quitte ton salon avant de rejoindre une nouvelle invitation.");return false;}
   try{$("onlineCode").value=parseCode(value);}catch(e){status(e.message);return false;}
   join();return !!role;
 }
};
})();