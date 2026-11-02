/* ByteBuddy '98 V0.22 — Pixel-LCD sanctuary farewell and generation memorial.
   Original four-shade LCD palette and same creature sprites; no external assets. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const css=document.createElement("style");
css.textContent="\n.bb-farewell{position:absolute;inset:0;z-index:95;background:#d4e3b6;color:#34543b;display:none;flex-direction:column;overflow:hidden;font:900 11px/1.5 monospace;isolation:isolate}.bb-farewell.open{display:flex}.bb-farewell [hidden]{display:none!important}.bb-farewell-head{background:#e6efd0;border-bottom:3px solid #7a9870;padding:11px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex:none}.bb-farewell-head b{font-size:12px;letter-spacing:.8px}.bb-farewell-head small{font-size:9px;color:#567051}.bb-farewell-scene{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 10px;gap:10px}.bb-farewell-scene canvas{width:100%;height:auto;max-height:75%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;border:3px solid #789273;background:#c7dcaa}.bb-farewell-caption{font-size:10px;text-align:center;letter-spacing:.2px;color:#3b6044}.bb-farewell-bottom{flex:none;min-height:60px;padding:10px 12px;background:#e7efce;border-top:3px solid #799773}.bb-farewell button{font:900 10px/1.35 monospace;min-height:40px;padding:7px;border-radius:5px;border:2px solid #456a4a;background:#385f42;color:#f0f8d8}.bb-farewell button.secondary{background:#e3edce;color:#3c5e43}.bb-farewell-bottom button{width:100%}.bb-farewell-memory{display:none;overflow-y:auto;overscroll-behavior:contain;flex:1;min-height:0;padding:13px 12px 16px;gap:10px}.bb-farewell-memory.show{display:flex;flex-direction:column}.bb-farewell-memory h3{margin:0;text-align:center;font:900 18px/1.25 monospace;color:#345b3f}.bb-farewell-memory p{margin:0;text-align:center;font:10px/1.5 monospace}.bb-farewell-portrait{display:flex;align-items:center;justify-content:center;padding:4px;background:#bfdaa8;border:3px solid #89a77e;min-height:106px}.bb-farewell-portrait canvas{height:96px;width:96px;image-rendering:pixelated}.bb-farewell-badge{padding:8px;text-align:center;border:2px solid #759572;background:#e5efd3;font-size:10px}.bb-farewell-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.bb-farewell-stat{padding:7px;background:#e5efd0;border:2px solid #99b08b;min-width:0}.bb-farewell-stat small{display:block;font-size:9px;color:#5f7a5b}.bb-farewell-stat strong{display:block;font-size:12px;overflow-wrap:anywhere}.bb-farewell-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:2px}.bb-farewell-actions button{min-height:46px}.bb-memory-entry{cursor:pointer;transition:background .14s}.bb-memory-entry:hover,.bb-memory-entry:focus-visible{background:#b5d4a7!important;outline:2px solid #547a52;outline-offset:2px}@media(prefers-reduced-motion:reduce){.bb-memory-entry{transition:none}}\n";
document.head.appendChild(css);
const layer=document.createElement("section");
layer.id="bbFarewell";layer.className="bb-farewell";
layer.setAttribute("role","dialog");layer.setAttribute("aria-modal","true");layer.setAttribute("aria-label","Hommage à ton compagnon");
layer.innerHTML="\n<div class=\"bb-farewell-head\"><b id=\"bbFarewellHeading\">LE SANCTUAIRE</b><small id=\"bbFarewellStep\">SOUVENIR / 01</small></div>\n<div id=\"bbFarewellScene\" class=\"bb-farewell-scene\"><canvas id=\"bbFarewellCanvas\" width=\"240\" height=\"180\" aria-label=\"Animation en pixel art du départ de la créature\"></canvas><div id=\"bbFarewellCaption\" class=\"bb-farewell-caption\" aria-live=\"polite\">UN DERNIER AU REVOIR...</div></div>\n<div id=\"bbFarewellMemory\" class=\"bb-farewell-memory\" hidden>\n<h3 id=\"bbFarewellTitle\">AU REVOIR</h3><p id=\"bbFarewellSubtitle\">UN SOUVENIR DANS LE LIVRE DES GÉNÉRATIONS</p>\n<div class=\"bb-farewell-portrait\"><canvas id=\"bbFarewellPortrait\" width=\"100\" height=\"100\" role=\"img\" aria-label=\"Portrait du compagnon\"></canvas></div>\n<div id=\"bbFarewellBadge\" class=\"bb-farewell-badge\">COMPAGNON FIDÈLE</div>\n<div id=\"bbFarewellStats\" class=\"bb-farewell-stats\"></div><p id=\"bbFarewellMessage\">SON SOUVENIR RESTERA.</p>\n<div class=\"bb-farewell-actions\"><button id=\"bbFarewellBook\" type=\"button\" class=\"secondary\">VOIR LE LIVRE</button><button id=\"bbFarewellNext\" type=\"button\">NOUVELLE GÉNÉRATION</button></div>\n</div>\n<div id=\"bbFarewellBottom\" class=\"bb-farewell-bottom\"><button id=\"bbFarewellSkip\" type=\"button\">CONTINUER L'HOMMAGE</button></div>";
$("lcdScreen").appendChild(layer);
const canvas=$("bbFarewellCanvas"),ctx=canvas.getContext("2d"),sprite=document.createElement("canvas");
sprite.width=100;sprite.height=100;
const labels={vitalite:"VITALITÉ",force:"FORCE",defense:"DÉFENSE",vitesse:"VITESSE",precision:"PRÉCISION",endurance:"ENDURANCE",esprit:"ESPRIT"};
const colors={ink:"#344e39",mid:"#68835c",light:"#92ad79",pale:"#dceac0",ground:"#a8c394",sky:"#cbdcaf"};
const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)");
let bridge=null,current=null,mode=null,startAt=0,frameId=0,previousFocus=null,isMemory=false;
function active(){return layer.classList.contains("open");}
function tile(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function memorialBadge(r){
 if(r.days>=60)return["VIE ACCOMPLIE","UNE VIE LONGUE, ENTOURÉE DE SOINS."];
 if(["lumia","nebula","prism","auror"].includes(r.form)||r.level>=18)return["LÉGENDE PIXEL","UNE HISTOIRE RARE, GRAVÉE DANS LES PIXELS."];
 if(r.wins>=8)return["CHAMPION DE L'ARÈNE","SON COURAGE A MARQUÉ L'ARÈNE."];
 if(r.goodDays>=15)return["GARDIEN EXEMPLAIRE","UN COMPAGNON ÉLEVÉ AVEC ATTENTION."];
 return["COMPAGNON FIDÈLE","CHAQUE INSTANT PARTAGÉ RESTE PRÉCIEUX."];
}
function statLine(label,val){const cell=document.createElement("div"),a=document.createElement("small"),b=document.createElement("strong");cell.className="bb-farewell-stat";a.textContent=label;b.textContent=String(val);cell.append(a,b);return cell;}
function dominant(r){
 const a=r.attributes;if(!a||typeof a!=="object")return "NON RELEVÉE";
 const entries=Object.entries(labels).map(([k,v])=>[v,Number(a[k])||0]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
 return entries.length?entries[0][0]+" "+entries[0][1]:"NON RELEVÉE";
}
function buildMemory(r){
 const name=(r.name||bridge.names?.[r.form]||"COMPAGNON").toUpperCase();
 const departed=mode==="sanctuary";
 $("bbFarewellHeading").textContent=departed?"LE SANCTUAIRE":"LIVRE DES GÉNÉRATIONS";
 $("bbFarewellStep").textContent="SOUVENIR / GEN "+String(r.generation||1).padStart(2,"0");
 $("bbFarewellTitle").textContent=departed?"AU REVOIR, "+name:name+" • À JAMAIS";
 $("bbFarewellSubtitle").textContent=departed?"TON COMPAGNON REJOINT LE SANCTUAIRE":r.cause==="natural"?"SON CYCLE DE VIE EST ACHEVÉ":"UN SOUVENIR DU SANCTUAIRE";
 $("bbFarewellBadge").textContent="DISTINCTION : "+memorialBadge(r)[0];
 $("bbFarewellMessage").textContent=memorialBadge(r)[1]+" SON SOUVENIR RESTERA DANS LE LIVRE DES GÉNÉRATIONS.";
 $("bbFarewellStats").replaceChildren();
 for(const [label,value] of [
  ["ESPÈCE",bridge.names?.[r.form]||r.form||"INCONNUE"],
  ["GÉNÉRATION",String(r.generation||1).padStart(2,"0")],
  ["ÂGE",(Number.isFinite(r.days)?r.days:"?")+" JOURS"],
  ["NIVEAU","LV. "+(r.level||1)],
  ["VICTOIRES",r.wins||0],
  ["SOINS",r.care||0],
  ["JOURS EXEMPLAIRES",r.goodDays||0],
  ["TYPE PRINCIPAL",(r.primaryType||r.affinity||"INCONNU").toUpperCase()],
  ["SECOND TYPE",(r.secondaryType||"AUCUN").toUpperCase()],
  ...(r.secondaryType?[["APPARENCE RARE",window.ByteBuddyDualSpritesV24?.label(r.primaryType||r.affinity,r.secondaryType)||"VARIANTE RARE"]]:[]),
  ["TALENT",(r.trait||"NON DÉFINI").toUpperCase()],
  ["STAT DOMINANTE",dominant(r)]
 ])$("bbFarewellStats").appendChild(statLine(label,value));
 const portrait=$("bbFarewellPortrait");portrait.getContext("2d").clearRect(0,0,100,100);
 if(bridge?.draw)bridge.draw(portrait,r.form,r);
 $("bbFarewellNext").hidden=!bridge?.canNew?.();
}
function drawScene(t){
 if(!active()||!current||isMemory)return;
 const elapsed=Math.max(0,t-startAt),progress=Math.min(1,elapsed/5900),name=(current.name||bridge.names?.[current.form]||"TON COMPAGNON").toUpperCase();
 ctx.imageSmoothingEnabled=false;
 tile(0,0,240,180,colors.sky);tile(0,139,240,41,colors.ground);tile(0,137,240,3,colors.mid);
 // Sanctuary arch built from LCD-like pixel rectangles.
 const arch=[
  [165,43,11,91],[207,43,11,91],[173,34,38,11],
  [178,26,28,9],[183,19,18,8],[178,44,28,76]
 ];
 for(let i=0;i<arch.length;i++){const [x,y,w,h]=arch[i];tile(x,y,w,h,i<5?colors.ink:colors.pale);}
 tile(177,47,32,77,colors.light);tile(180,51,26,70,colors.pale);
 // The garden, all 2/4/8px monochrome shapes.
 for(let i=0;i<8;i++){let x=9+i*31;tile(x,148+(i%3)*5,7,3,colors.mid);tile(x+3,143+(i%3)*5,2,6,colors.ink);}
 tile(15,110,21,4,colors.light);tile(21,103,9,7,colors.light);tile(125,114,17,4,colors.light);
 let x=34+Math.max(0,progress-.21)*205,y=49;
 if(progress<.21){x=34;y=49-Math.abs(Math.sin(t/310))*3;}
 else if(progress<.65){x=34+(progress-.21)/.44*125;y=49+Math.abs(Math.sin(t/225))*3;}
 else{x=159+(progress-.65)/.35*30;y=53+(progress-.65)/.35*22;}
 const fade=progress<.67?1:Math.max(0,1-(progress-.67)/.29);
 if(fade>0&&bridge.draw){bridge.draw(sprite,current.form,current);ctx.save();ctx.globalAlpha=fade;ctx.drawImage(sprite,0,0,100,100,Math.round(x),Math.round(y),94,94);ctx.restore();}
 // Four small ascending pixels, deterministic and not CPU-heavy.
 for(let i=0;i<7;i++){const drift=(elapsed/70+i*19)%80,px=170+(i*13%38),py=118-drift;tile(px,py,3+i%2,3+i%2,i%2?colors.ink:colors.light);}
 const text=progress<.2?(mode==="sanctuary"?"LE SANCTUAIRE T'ACCUEILLE...":"UNE VIE S'ACHÈVE PAISIBLEMENT...")
  :progress<.65?name+" AVANCE EN PAIX...":"SON SOUVENIR RESTERA.";
 $("bbFarewellCaption").textContent=text;
 $("bbFarewellStep").textContent=progress<.2?"01 / 03":progress<.65?"02 / 03":"03 / 03";
 if(progress>=1){showMemory();return;}
 frameId=requestAnimationFrame(drawScene);
}
function showMemory(){
 if(!active()||!current)return;
 cancelAnimationFrame(frameId);frameId=0;isMemory=true;
 $("bbFarewellScene").hidden=true;$("bbFarewellBottom").hidden=true;
 $("bbFarewellMemory").hidden=false;$("bbFarewellMemory").classList.add("show");
 buildMemory(current);layer.scrollTop=0;$("bbFarewellMemory").scrollTop=0;
 $("bbFarewellBook").focus();
}
function open(r,kind,animate){
 if(!r||active())return false;
 current=JSON.parse(JSON.stringify(r));mode=kind||r.cause||"natural";isMemory=false;
 previousFocus=document.activeElement;
 layer.classList.add("open");layer.setAttribute("aria-hidden","false");
 $("bbFarewellMemory").classList.remove("show");$("bbFarewellMemory").hidden=true;
 $("bbFarewellScene").hidden=false;$("bbFarewellBottom").hidden=false;
 $("bbFarewellHeading").textContent=mode==="sanctuary"?"LE SANCTUAIRE":"UN DERNIER HOMMAGE";
 if(animate&&!reduced?.matches){
  startAt=performance.now();drawScene(startAt);$("bbFarewellSkip").focus();
 }else{showMemory();}
 return true;
}
function close(){
 if(!active())return;
 cancelAnimationFrame(frameId);frameId=0;layer.classList.remove("open");layer.setAttribute("aria-hidden","true");
 current=null;isMemory=false;
 previousFocus?.focus?.();previousFocus=null;
}
$("bbFarewellSkip").addEventListener("click",showMemory);
$("bbFarewellBook").addEventListener("click",()=>{close();bridge?.book?.();});
$("bbFarewellNext").addEventListener("click",()=>{if(!bridge?.canNew?.())return;close();bridge?.next?.();});
document.addEventListener("keydown",e=>{
 if(!active())return;
 if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();if(isMemory){close();bridge?.book?.();}else showMemory();}
 if(e.key==="Tab"){
  const buttons=isMemory?[$("bbFarewellBook"),$("bbFarewellNext")].filter(x=>!x.hidden):[$("bbFarewellSkip")];
  if(!buttons.length)return;
  const idx=buttons.indexOf(document.activeElement),next=e.shiftKey?(idx<=0?buttons.length-1:idx-1):(idx<0||idx===buttons.length-1?0:idx+1);
  e.preventDefault();e.stopImmediatePropagation();buttons[next].focus();
 }
},true);
window.ByteBuddyFarewellV22={
 setup(api){bridge=api;},
 active,
 start(record,type){return open(record,type,true);},
 openRecord(record){return open(record,record.cause,false);},
 close
};
})();