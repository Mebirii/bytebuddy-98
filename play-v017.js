/* ByteBuddy 0.17 — Pixel Catch: interactive local, touchscreen and handheld game. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),total=12,lanes=[45,120,195];
const pal=["#304e35","#587953","#91ad80","#dceac0"];
const style=document.createElement("style");style.textContent=".bb-play{position:absolute;inset:0;z-index:96;background:#d1e0b5;color:#304f35;display:none;flex-direction:column;overflow:hidden;font:900 11px monospace}.bb-play.open{display:flex}.bb-play [hidden]{display:none!important}.bb-play-header{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#e6edc8;border-bottom:3px solid #7e9a72;padding:8px;min-height:40px}.bb-play button{background:#365f44;color:#f5fbe1;border:2px solid #789776;border-radius:5px;font:900 10px monospace;padding:8px 5px;min-height:38px}.bb-play-progress{display:flex;justify-content:space-between;gap:5px;padding:7px;background:#e4edc9;border-bottom:2px solid #829e75;font-size:10px}.bb-play canvas.bb-play-scene{width:100%;height:100%;min-height:0;flex:1;image-rendering:pixelated;touch-action:manipulation}.bb-play-controls{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:6px;padding:8px;background:#e0ebc3;border-top:3px solid #8ca47d}.bb-play-controls button:disabled{opacity:.4}.bb-play-note{text-align:center;background:#e4edcb;padding:6px;font:9px monospace}.bb-play-result{position:absolute;inset:41px 0 0;background:#d5e5b8;display:none;flex-direction:column;gap:13px;justify-content:center;align-items:center;padding:13px;text-align:center}.bb-play-result.show{display:flex}.bb-play-result strong{font-size:17px}.bb-play-result p{font:11px/1.5 monospace}.bb-play-result button{width:100%}.bb-play .px-icon{width:14px;height:14px;vertical-align:-2px}";document.head.appendChild(style);
const overlay=document.createElement("section");overlay.id="bbPlay";overlay.className="bb-play";
overlay.setAttribute("aria-label","Jeu interactif du compagnon");
overlay.innerHTML="<div class=\"bb-play-header\"><b>PIXEL CATCH / JOUER</b><button type=\"button\" id=\"bbPlayExit\">QUITTER</button></div><div class=\"bb-play-progress\"><span id=\"bbPlayScore\">POINTS 0 / 12</span><span id=\"bbPlayRound\">1 / 12</span><span id=\"bbPlayStatus\">BOUCLIER PRÊT</span></div><canvas class=\"bb-play-scene\" id=\"bbPlayCanvas\" width=\"240\" height=\"180\" aria-label=\"Attrape les étoiles et évite les bugs\"></canvas><div class=\"bb-play-controls\"><button id=\"bbPlayLeft\" type=\"button\"><svg class=\"px-icon\" aria-hidden=\"true\"><use href=\"#px-left\"/></svg> GAUCHE</button><button id=\"bbPlayRight\" type=\"button\">DROITE <svg class=\"px-icon\" aria-hidden=\"true\"><use href=\"#px-right\"/></svg></button><button id=\"bbPlayShield\" type=\"button\">BOUCLIER</button></div><div class=\"bb-play-note\">ÉTOILES : ATTRAPE / BUGS : ÉVITE</div><div class=\"bb-play-result\" id=\"bbPlayResults\"><strong id=\"bbPlayTitle\">BRAVO !</strong><p id=\"bbPlayDetails\"></p><button id=\"bbPlayReturn\" type=\"button\">RETOUR AU COMPAGNON</button><button id=\"bbPlayAgain\" type=\"button\">REJOUER</button></div>";$("lcdScreen").appendChild(overlay);
const canvas=$("bbPlayCanvas"),ctx=canvas.getContext("2d");
const sprite=document.createElement("canvas");sprite.width=100;sprite.height=100;
let api=null,game=null,raf=0,last=0;
function box(x,y,w,h,ink=pal[0]){ctx.fillStyle=ink;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function text(t,x,y,size=10){ctx.fillStyle=pal[0];ctx.font="900 "+size+"px monospace";ctx.textAlign="center";ctx.fillText(t,x,y);ctx.textAlign="left"}
function drawStar(x,y){
 const rows=["..##..",".####.","######","######",".####.","..##.."];
 for(let iy=0;iy<6;iy++)for(let ix=0;ix<6;ix++)if(rows[iy][ix]==="#")box(x-12+ix*4,y-12+iy*4,4,4);
 box(x-4,y-4,8,8,pal[3]);
}
function drawBug(x,y){
 box(x-12,y-9,24,18);box(x-8,y-5,16,10,pal[1]);
 box(x-6,y-3,4,4,pal[3]);box(x+3,y-3,4,4,pal[3]);
 box(x-9,y+9,5,5);box(x+4,y+9,5,5);
}
function paint(){
 if(!game)return;
 const g=game;box(0,0,240,180,pal[3]);
 for(let i=0;i<3;i++){
  box(i*80+2,0,2,180,pal[2]);box(i*80+78,0,2,180,pal[2]);
  for(let y=15;y<135;y+=19)box(lanes[i]-1,y,2,8,pal[2]);
 }
 box(0,151,240,4,pal[1]);box(0,155,240,25,pal[2]);
 if(g.item){
  const x=lanes[g.item.lane],y=24+Math.min(1,g.progress)*116;
  if(g.item.bug)drawBug(x,y);else drawStar(x,y);
 }
 api.draw(sprite,g.form);
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(sprite,0,0,100,100,lanes[g.lane]-35,95,70,59);
 if(g.elapsed<g.shieldUntil){
  box(lanes[g.lane]-30,91,60,3);box(lanes[g.lane]-30,153,60,3);
  box(lanes[g.lane]-30,91,3,65);box(lanes[g.lane]+27,91,3,65);
 }else box(lanes[g.lane]-20,154,40,3);
 if(g.round<3)text("GAUCHE / DROITE / BOUCLIER",120,12,9);
}
function begin(){
 if(!api?.canPlay())return false;
 close();
 game={lane:1,round:0,score:0,stars:0,avoids:0,hits:0,item:null,progress:0,delay:240,elapsed:0,shieldUntil:0,shieldReady:0,form:api.state().form,done:false};
 $("bbPlayResults").classList.remove("show");overlay.classList.add("open");
 $("bbPlayScore").textContent="POINTS 0 / 12";$("bbPlayRound").textContent="1 / 12";
 last=0;raf=requestAnimationFrame(frame);return true;
}
function close(){
 if(raf){cancelAnimationFrame(raf);raf=0;}
 game=null;last=0;overlay.classList.remove("open");$("bbPlayResults").classList.remove("show");
}
function spawn(){
 const g=game;
 if(!g||g.round>=total)return;
 g.item={lane:Math.floor(Math.random()*3),bug:g.round>=2&&g.round%4===3};
 g.progress=0;$("bbPlayRound").textContent=(g.round+1)+" / "+total;
}
function finished(){
 const g=game;if(!g||g.done)return;
 g.done=true;g.item=null;
 if(raf)cancelAnimationFrame(raf);raf=0;
 const good=g.score>=7;
 $("bbPlayTitle").textContent=g.score>=11?"PIXEL MASTER !":good?"BRAVO !":"BIEN JOUÉ !";
 $("bbPlayDetails").textContent="SCORE "+g.score+"/"+total+" - ÉTOILES "+g.stars+" - BUGS "+g.hits;
 $("bbPlayAgain").hidden=api.state().energy<16;
 $("bbPlayResults").classList.add("show");
 api.finish({score:g.score,total,stars:g.stars,avoids:g.avoids,hits:g.hits});
}
function resolve(){
 const g=game;if(!g||!g.item)return;
 const item=g.item;
 if(item.bug){
  if(item.lane!==g.lane||g.elapsed<g.shieldUntil){g.score++;g.avoids++;}
  else{g.hits++;api.sound?.("defeat");}
 }else if(item.lane===g.lane){g.score++;g.stars++;api.sound?.("hit");}
 g.round++;g.item=null;g.delay=280;g.progress=0;
 $("bbPlayScore").textContent="POINTS "+g.score+" / "+total;
 if(g.round>=total)finished();
}
function frame(now){
 raf=0;const g=game;if(!g||g.done||!overlay.classList.contains("open"))return;
 if(document.hidden){last=0;raf=requestAnimationFrame(frame);return;}
 const delta=last?Math.min(80,Math.max(0,now-last)):0;last=now;g.elapsed+=delta;
 if(!g.item)spawn();
 if(g.delay>0)g.delay=Math.max(0,g.delay-delta);
 else{g.progress+=delta/Math.max(730,1130-g.round*18);if(g.progress>=1)resolve();}
 $("bbPlayStatus").textContent=g.elapsed<g.shieldUntil?"BOUCLIER ACTIF":
 g.round>=g.shieldReady?"BOUCLIER PRÊT":"BOUCLIER "+(g.shieldReady-g.round)+" OBJ.";
 $("bbPlayShield").disabled=g.round<g.shieldReady;
 if(!g.done){paint();raf=requestAnimationFrame(frame);}
}
function move(delta){if(!game||game.done)return;game.lane=Math.max(0,Math.min(2,game.lane+delta));}
function shield(){
 if(!game||game.done||game.round<game.shieldReady)return;
 game.shieldUntil=game.elapsed+580;game.shieldReady=game.round+3;
}
function hardware(key){
 if(!game)return false;
 if(game.done){if(key==="middle")close();return true;}
 if(key==="left")move(-1);
 else if(key==="right")move(1);
 else if(key==="middle")shield();
 return true;
}
$("bbPlayExit").addEventListener("click",close);
$("bbPlayReturn").addEventListener("click",close);
$("bbPlayAgain").addEventListener("click",begin);
$("bbPlayLeft").addEventListener("click",()=>move(-1));
$("bbPlayRight").addEventListener("click",()=>move(1));
$("bbPlayShield").addEventListener("click",shield);
canvas.addEventListener("pointerdown",event=>{
 if(!game||game.done)return;
 const rect=canvas.getBoundingClientRect();
 const fraction=(event.clientX-rect.left)/Math.max(1,rect.width);
 if(fraction<1/3)move(-1);else if(fraction>2/3)move(1);else shield();
});
document.addEventListener("keydown",event=>{
 if(!game||event.altKey||event.ctrlKey||event.metaKey)return;
 if(!["ArrowLeft","ArrowRight","a","d","A","D"," ","Enter","Escape"].includes(event.key))return;
 event.preventDefault();event.stopImmediatePropagation();
 if(event.key==="Escape")close();
 else if(game.done){if(event.key==="Enter"||event.key===" ")close();}
 else if(event.key==="ArrowLeft"||event.key.toLowerCase()==="a")move(-1);
 else if(event.key==="ArrowRight"||event.key.toLowerCase()==="d")move(1);
 else if(event.key==="Enter"||event.key===" ")shield();
},true);
document.addEventListener("visibilitychange",()=>{last=0;});
window.ByteBuddyPlayV17={setup(x){api=x;},open:begin,active:()=>!!game,hardware,stop:close};
})();