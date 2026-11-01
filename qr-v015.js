/* ByteBuddy V0.15 — local QR invitations and camera scan, no offsite QR API. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),duel=window.ByteBuddyV12UI;
if(!duel)throw Error("VS invitations unavailable");
const style=document.createElement("style");style.textContent="\n.bb-qr-host{background:#e8f1d1;border:2px solid #829d78;border-radius:6px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:7px;width:min(100%,205px)}\n.bb-qr-host[hidden]{display:none!important}\n.bb-qr-host canvas{display:block;max-width:100%;height:auto;image-rendering:pixelated;border:1px solid #82997d}\n.bb-qr-host strong{font:900 12px monospace;letter-spacing:1px;color:#304f37}\n.bb-qr-host small{font:9px/1.4 monospace;text-align:center}\n.bb-qr-control{width:100%;margin:9px 0 5px}\n.bb-qr-scanner{position:absolute;inset:0;z-index:101;background:#d8e7c0;color:#365640;display:none;flex-direction:column;align-items:center;justify-content:space-around;gap:6px;padding:10px;text-align:center;font:900 11px monospace}\n.bb-qr-scanner.active{display:flex}.bb-qr-scanner strong{font-size:12px}\n.bb-qr-scanner p{font:10px/1.4 monospace;margin:3px 0}\n.bb-qr-scanner video{width:100%;height:175px;min-height:110px;object-fit:cover;background:#203828;border:4px solid #547453;border-radius:5px}\n.bb-qr-scanner button{width:100%;min-height:38px;padding:8px;border:2px solid #769573;border-radius:5px;background:#395e45;color:#f3fce0;font:900 10px monospace}\n";document.head.appendChild(style);
const scanButton=document.createElement("button");
scanButton.id="onlineQrScan";scanButton.type="button";scanButton.className="bb-qr-control";
scanButton.textContent="SCANNER UN QR CODE";
$("v10VsPanel").appendChild(scanButton);
const panel=document.createElement("div");panel.id="onlineQrHost";panel.className="bb-qr-host";panel.hidden=true;
const title=document.createElement("strong");title.textContent="INVITE UN DRESSEUR";
const canvas=document.createElement("canvas");canvas.id="onlineQrCanvas";canvas.width=188;canvas.height=188;
canvas.setAttribute("role","img");canvas.setAttribute("aria-label","QR code d'invitation à un combat");
const label=document.createElement("strong");label.id="onlineQrShortCode";
const hint=document.createElement("small");hint.textContent="SCANNE AVEC LA CAMÉRA DU TÉLÉPHONE";
panel.append(title,canvas,label,hint);$("onlineMessage").after(panel);
const dialog=document.createElement("section");dialog.id="onlineQrReader";dialog.className="bb-qr-scanner";
dialog.setAttribute("role","dialog");dialog.setAttribute("aria-label","Scanner une invitation de dresseur");
const heading=document.createElement("strong");heading.textContent="SCANNER UN COMBAT VS";
const help=document.createElement("p");help.textContent="PLACE LE QR CODE DE TON AMI DANS LE CADRE";
const video=document.createElement("video");video.id="onlineQrVideo";video.autoplay=true;video.muted=true;video.playsInline=true;
const feedback=document.createElement("p");feedback.id="onlineQrStatus";feedback.setAttribute("role","status");feedback.textContent="CAMÉRA NON DÉMARRÉE";
const close=document.createElement("button");close.id="onlineQrClose";close.type="button";close.textContent="FERMER LA CAMÉRA";
dialog.append(heading,help,video,feedback,close);$("lcdScreen").appendChild(dialog);
const buffer=document.createElement("canvas");buffer.width=320;buffer.height=240;
let lastInvite="",stream=null,scanning=false,frameId=0,detector=null;
function update(){
 const invite=duel.getInvite();panel.hidden=!invite;
 if(!invite||invite===lastInvite)return;
 const url=new URL(invite);label.textContent=url.searchParams.get("vs")||"";
 hint.textContent="SCANNE AVEC LA CAMÉRA DU TÉLÉPHONE";
 if(typeof window.qrcode!=="function"){
  canvas.hidden=true;hint.textContent="QR INDISPONIBLE : UTILISE COPIER LE LIEN";return;
 }
 try{
  const qr=window.qrcode(0,"M");qr.addData(invite);qr.make();
  const n=qr.getModuleCount(),cell=Math.max(3,Math.floor(188/(n+8)));
  canvas.width=(n+8)*cell;canvas.height=canvas.width;
  const ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=false;
  ctx.fillStyle="#fafff0";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#15351f";
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)
   if(qr.isDark(y,x))ctx.fillRect((x+4)*cell,(y+4)*cell,cell,cell);
  canvas.hidden=false;lastInvite=invite;
 }catch(_){canvas.hidden=true;hint.textContent="QR INDISPONIBLE : PARTAGE LE CODE";}
}
function stop(){
 scanning=false;
 if(frameId){cancelAnimationFrame(frameId);frameId=0;}
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
 video.pause();video.srcObject=null;dialog.classList.remove("active");
}
function validCode(raw){
 let v=String(raw||"").trim();
 if(v.startsWith("https://")){
  const url=new URL(v);
  if(url.host!==location.host||url.pathname!==location.pathname)throw Error("Invitation provenant d'un autre site.");
  v=url.searchParams.get("vs")||"";
 }
 v=v.toUpperCase();
 if(!/^BB98-[A-HJ-NP-Z2-9]{14}$/.test(v))throw Error("Ce QR code n'est pas une invitation ByteBuddy.");
 return v;
}
function accept(raw){
 let token;
 try{token=validCode(raw)}catch(e){feedback.textContent=e.message;return false;}
 stop();$("onlineCode").value=token;
 const joined=duel.joinInvite(token);
 if(!joined)feedback.textContent="Connexion impossible. Utilise le code manuellement.";
 return joined;
}
async function readFrame(){
 if(!scanning)return;frameId=0;
 if(video.readyState>=2&&video.videoWidth>32){
  try{
   let result=null;
   if(detector){const matches=await detector.detect(video);result=matches?.find(x=>typeof x.rawValue==="string")?.rawValue||null;}
   else if(typeof window.jsQR==="function"){
    const w=320,h=Math.min(480,Math.max(120,Math.round(video.videoHeight*320/video.videoWidth)));
    buffer.width=w;buffer.height=h;
    const context=buffer.getContext("2d",{willReadFrequently:true});
    context.drawImage(video,0,0,w,h);
    const pixels=context.getImageData(0,0,w,h);
    result=window.jsQR(pixels.data,w,h,{inversionAttempts:"attemptBoth"})?.data||null;
   }
   if(result&&scanning&&accept(result))return;
  }catch(_){}
 }
 if(scanning)frameId=requestAnimationFrame(readFrame);
}
async function start(){
 if(scanning)return;
 if(duel.active()){$("onlineStatus").textContent="Quitte d'abord le salon actuel.";return;}
 if(!navigator.mediaDevices?.getUserMedia||!window.isSecureContext){
  $("onlineStatus").textContent="Caméra indisponible. Utilise l'appareil photo ou copie le lien.";return;
 }
 scanning=true;dialog.classList.add("active");feedback.textContent="AUTORISE L'ACCÈS À LA CAMÉRA";
 try{
  detector=null;
  if(typeof window.BarcodeDetector==="function"){
   try{const formats=await window.BarcodeDetector.getSupportedFormats();
       if(formats.includes("qr_code"))detector=new window.BarcodeDetector({formats:["qr_code"]});}catch(_){}
  }
  if(!detector&&typeof window.jsQR!=="function")throw Error("Lecteur QR indisponible. Utilise la caméra du téléphone.");
  const camera=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:640},height:{ideal:480}}});
  if(!scanning){camera.getTracks().forEach(t=>t.stop());return;}
  stream=camera;video.srcObject=camera;await video.play();
  feedback.textContent="PLACE LE QR DANS LE CADRE";
  frameId=requestAnimationFrame(readFrame);
 }catch(e){
  feedback.textContent=String(e.message||"Caméra refusée").slice(0,120);
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
  scanning=false;
 }
}
scanButton.addEventListener("click",start);
close.addEventListener("click",stop);
document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
window.ByteBuddyQR={update,stop,open:start,readInvite:accept,isScanning:()=>scanning};
})();