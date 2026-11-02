/* ByteBuddy '98 V0.25 — Firebase trainer with offline-first safety.
   The global bridge is available synchronously. Firebase loads only when configured. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),cfg=window.BYTEBUDDY_FIREBASE_CONFIG||{};
const configured=["apiKey","authDomain","projectId","appId"].every(k=>typeof cfg[k]==="string"&&cfg[k].length>3);
const SDK="https://www.gstatic.com/firebasejs/12.17.1/";
const BACKUP="bytebuddy98-save-backup-before-cloud-v025";
const style=document.createElement("style");
style.textContent=[
".bb-trainer{font:10px/1.5 monospace;color:#38583b;display:flex;flex-direction:column;gap:9px}",
".bb-trainer input{display:block;width:100%;min-height:40px;padding:9px;margin:3px 0 8px;background:#ecf5d6;color:#355439;border:2px solid #819d76;border-radius:4px;font:11px monospace}",
".bb-trainer label{display:block;font-weight:900}",
".bb-trainer button{background:#396145;border:2px solid #759475;border-radius:5px;padding:9px 5px;min-height:43px;color:#f2fade;font:900 10px monospace}",
".bb-trainer button:disabled{opacity:.43}",
".bb-trainer-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}",
".bb-trainer-status{border:2px solid #91aa83;padding:9px;min-height:42px;border-radius:5px;color:#2e5036;background:#d6e6b9}",
".bb-trainer-info{padding:8px;background:#dceac2;border:1px solid #819875;border-radius:4px}",
".bb-trainer p{margin:0 0 6px}",
".bb-trainer [hidden]{display:none!important}"
].join("\n");
document.head.appendChild(style);
const nav=document.createElement("button");
nav.type="button";nav.dataset.view="trainer";
nav.innerHTML='<span><svg class="px-icon" aria-hidden="true"><use href="#px-home"/></svg></span>DRESSEUR';
$("lcdMenu").querySelector(".lcd-menu-grid").appendChild(nav);
const section=document.createElement("section");
section.className="panel";section.id="trainerPanel";
section.innerHTML=[
'<div class="panel-header"><h2>11 / COMPTE DRESSEUR</h2><span class="section-number">FIREBASE / V0.25</span></div>',
'<div class="bb-trainer"><p>Ta partie reste sur cet appareil. Les transferts cloud sont volontaires.</p>',
'<div class="bb-trainer-status" id="trainerStatus" role="status" aria-live="polite">Configuration cloud...</div>',
'<button id="trainerLocalExport" type="button">EXPORTER MA PARTIE (JSON)</button>',
'<div id="trainerGuest"><label for="trainerEmail">EMAIL</label><input id="trainerEmail" type="email" autocomplete="email" maxlength="254">',
'<label for="trainerPassword">MOT DE PASSE</label><input id="trainerPassword" type="password" autocomplete="current-password" minlength="8" maxlength="128">',
'<label for="trainerHandle">PSEUDO</label><input id="trainerHandle" autocomplete="nickname" minlength="3" maxlength="20">',
'<div class="bb-trainer-actions"><button id="trainerSignup" type="button">S INSCRIRE</button><button id="trainerSignin" type="button">SE CONNECTER</button></div>',
'<button id="trainerReset" type="button" style="width:100%;margin-top:8px">MOT DE PASSE OUBLIÉ</button></div>',
'<div id="trainerLoggedIn" hidden><div class="bb-trainer-info"><strong id="trainerIdentity">DRESSEUR</strong><p id="trainerEmailDisplay"></p></div>',
'<div id="trainerUnverified" hidden><p>Confirme ton email pour sécuriser ton compte.</p>',
'<div class="bb-trainer-actions"><button id="trainerVerify" type="button">RENVOYER EMAIL</button><button id="trainerRefresh" type="button">J AI CONFIRMÉ</button></div></div>',
'<div id="trainerNeedHandle" hidden><p>Choisis ton pseudo de dresseur.</p>',
'<label for="trainerNewHandle">PSEUDO</label><input id="trainerNewHandle" autocomplete="nickname" minlength="3" maxlength="20">',
'<button id="trainerClaim" type="button">VALIDER MON PSEUDO</button></div>',
'<div id="trainerCloud" hidden><p id="trainerCloudInfo">Aucune sauvegarde cloud.</p>',
'<div class="bb-trainer-actions"><button id="trainerUpload" type="button">ENVOYER MA PARTIE</button><button id="trainerDownload" type="button">RÉCUPÉRER MA PARTIE</button></div>',
'<p>Une copie de sécurité locale est faite avant toute récupération.</p>',
'<button id="trainerUndoCloud" type="button" style="width:100%">RESTAURER COPIE DE SÉCURITÉ</button></div>',
'<button id="trainerLogout" type="button" style="width:100%">SE DÉCONNECTER</button></div></div>'
].join("");
document.querySelector(".right").appendChild(section);

let bridge=null,auth=null,db=null,A=null,F=null,user=null,profile=null,revision=null,cloudDate=null,busy=false;
const validHandle=s=>/^[a-z][a-z0-9_]{2,19}$/.test(String(s||"").trim().toLowerCase());
const validEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").trim())&&String(s||"").trim().length<=254;
const message=s=>{$("trainerStatus").textContent=String(s||"").slice(0,340);};
const online=()=>!!auth&&!!db,verified=()=>!!user?.emailVerified;
const path=()=>F.doc(db,"trainerSaves",user.uid);
function refresh(){
 const signed=!!user,enabled=online()&&!busy;
 $("trainerGuest").hidden=signed;$("trainerLoggedIn").hidden=!signed;
 $("trainerUnverified").hidden=!signed||verified();
 $("trainerNeedHandle").hidden=!signed||!verified()||!!profile;
 $("trainerCloud").hidden=!signed||!verified()||!profile;
 $("trainerIdentity").textContent=profile?"DRESSEUR : "+profile.handle.toUpperCase():"COMPTE FIREBASE";
 $("trainerEmailDisplay").textContent=user?.email||"";
 for(const id of ["trainerSignup","trainerSignin","trainerReset"])$(id).disabled=!enabled;
 for(const id of ["trainerLogout","trainerVerify","trainerRefresh","trainerClaim"])$(id).disabled=!enabled;
 $("trainerUpload").disabled=!enabled||!verified()||!profile;
 $("trainerDownload").disabled=!enabled||!verified()||!profile||revision===null;
 $("trainerUndoCloud").disabled=busy;
}
function hint(e){
 const code=String(e?.code||"");
 if(code==="auth/email-already-in-use")return "Cette adresse est déjà enregistrée.";
 if(code==="auth/invalid-credential")return "Email ou mot de passe invalide.";
 if(code==="auth/unauthorized-domain")return "Autorise mebirii.github.io dans Firebase Authentication.";
 if(code==="permission-denied")return "Accès refusé : vérifie les règles Firestore et ton email.";
 return String(e?.message||"Erreur temporaire").slice(0,180);
}
function label(){
 $("trainerCloudInfo").textContent=revision===null?
  "Aucune partie Firebase. Tu peux y envoyer celle de cet appareil.":
  "CLOUD FIREBASE · REV. "+revision+(cloudDate?" · "+new Date(cloudDate).toLocaleString("fr-FR"):"");
}
async function loadAccount(){
 if(!online()||!user){profile=null;revision=null;cloudDate=null;refresh();return;}
 profile=null;revision=null;cloudDate=null;
 if(!verified()){message("Confirme ton email pour activer les sauvegardes Firebase.");refresh();return;}
 const uid=user.uid;
 const [p,s]=await Promise.all([
  F.getDoc(F.doc(db,"trainerProfiles",uid)),
  F.getDoc(F.doc(db,"trainerSaves",uid))
 ]);
 if(user?.uid!==uid)return;
 profile=p.exists()?p.data():null;
 revision=s.exists()?s.data().revision:null;
 cloudDate=s.exists()?s.data().updatedAt?.toDate?.():null;
 if(!profile){
  let pending="";try{pending=sessionStorage.getItem("bytebuddy98-firebase-handle")||""}catch(_){}
  if(validHandle(pending))$("trainerNewHandle").value=pending;
 }
 label();message(profile?"Connecté : "+profile.handle:"Choisis ton pseudo pour activer le cloud.");
 refresh();
}
async function signup(){
 const email=$("trainerEmail").value.trim(),pass=$("trainerPassword").value,handle=$("trainerHandle").value.trim().toLowerCase();
 if(!validEmail(email)||pass.length<8||!validHandle(handle)){message("Email, mot de passe (8 caractères) ou pseudo (3 à 20 caractères) invalide.");return;}
 busy=true;refresh();
 try{
  try{sessionStorage.setItem("bytebuddy98-firebase-handle",handle)}catch(_){}
  const result=await A.createUserWithEmailAndPassword(auth,email,pass);
  await A.sendEmailVerification(result.user,{url:location.origin+location.pathname});
  message("Compte créé. Confirme ton email pour utiliser Firebase.");
 }catch(e){message("Inscription : "+hint(e));}
 finally{$("trainerPassword").value="";busy=false;refresh();}
}
async function signin(){
 const email=$("trainerEmail").value.trim(),password=$("trainerPassword").value;
 if(!validEmail(email)||!password){message("Email et mot de passe requis.");return;}
 busy=true;refresh();
 try{await A.signInWithEmailAndPassword(auth,email,password);message("Connexion en cours...");}
 catch(e){message("Connexion : "+hint(e));}
 finally{$("trainerPassword").value="";busy=false;refresh();}
}
async function logout(){
 busy=true;refresh();
 try{await A.signOut(auth);message("Déconnecté. Partie locale inchangée.");}
 catch(e){message("Déconnexion : "+hint(e));}
 finally{busy=false;refresh();}
}
async function reset(){
 const email=$("trainerEmail").value.trim();
 if(!validEmail(email)){message("Renseigne ton email.");return;}
 try{await A.sendPasswordResetEmail(auth,email);message("Si ce compte existe, un email de réinitialisation a été envoyé.");}
 catch(e){message("Réinitialisation : "+hint(e));}
}
async function verify(){
 try{await A.sendEmailVerification(user,{url:location.origin+location.pathname});message("Email de confirmation renvoyé.");}
 catch(e){message("Email : "+hint(e));}
}
async function refreshVerification(){
 try{await A.reload(user);user=auth.currentUser;await loadAccount();}
 catch(e){message("Confirmation : "+hint(e));}
}
async function claim(){
 if(!online()||!user||!verified()||profile)return;
 const handle=$("trainerNewHandle").value.trim().toLowerCase();
 if(!validHandle(handle)){message("Pseudo invalide (3 à 20 lettres/chiffres/_).");return;}
 busy=true;refresh();
 try{
  await F.setDoc(F.doc(db,"trainerProfiles",user.uid),{handle,displayName:handle,createdAt:F.serverTimestamp()});
  try{sessionStorage.removeItem("bytebuddy98-firebase-handle")}catch(_){}
  await loadAccount();
 }catch(e){message("Pseudo : "+hint(e));}
 finally{busy=false;refresh();}
}
async function upload(){
 if(!bridge||!verified()||!profile)return;
 let dataJson;
 try{
  const snap=bridge.snapshot();
  if(!snap||![1,2,3,4].includes(snap.version))throw Error("Partie incompatible.");
  dataJson=JSON.stringify(snap);
  if(new TextEncoder().encode(dataJson).length>175000)throw Error("Partie trop volumineuse. Exporte un fichier JSON.");
 }catch(e){message(hint(e));return;}
 busy=true;refresh();
 try{
  const ref=path(),existing=await F.getDoc(ref);
  if(existing.exists()&&!window.confirm("Remplacer la sauvegarde Firebase par ta partie actuelle ?"))return;
  const expected=revision;
  const next=await F.runTransaction(db,async tx=>{
   const item=await tx.get(ref);
   const current=item.exists()?item.data().revision:null;
   if(current!==expected)throw Error("Conflit : une autre session a modifié le cloud. Récupère sa partie avant tout envoi.");
   const number=(current||0)+1;
   tx.set(ref,{dataJson,revision:number,updatedAt:F.serverTimestamp()});
   return number;
  });
  revision=next;cloudDate=new Date();label();message("Partie sauvegardée sur Firebase · révision "+revision);
 }catch(e){message("Sauvegarde : "+hint(e));}
 finally{busy=false;refresh();}
}
async function download(){
 if(!bridge||!verified()||!profile)return;
 busy=true;refresh();
 try{
  const remote=await F.getDoc(path());
  if(!remote.exists()){revision=null;message("Pas encore de partie Firebase.");return;}
  const raw=remote.data();
  const validated=bridge.validate(JSON.parse(raw.dataJson));
  if(!window.confirm("Remplacer la partie locale par la sauvegarde Firebase ? Une copie sera conservée."))return;
  try{localStorage.setItem(BACKUP,JSON.stringify(bridge.snapshot()));}
  catch(_){throw Error("Impossible de préserver ta sauvegarde locale. Transfert annulé.");}
  revision=raw.revision;bridge.restore(validated);
 }catch(e){message("Récupération : "+hint(e));}
 finally{busy=false;refresh();}
}
function undo(){
 if(!bridge)return;
 try{
  const previous=localStorage.getItem(BACKUP);
  if(!previous){message("Aucune copie locale disponible.");return;}
  const valid=bridge.validate(JSON.parse(previous));
  if(!window.confirm("Restaurer la sauvegarde locale précédant la récupération Firebase ?"))return;
  localStorage.setItem("bytebuddy98-save-backup-before-recovery-v025",JSON.stringify(bridge.snapshot()));
  bridge.restore(valid);
 }catch(e){message("Restauration : "+hint(e));}
}
$("trainerLocalExport").addEventListener("click",()=>{$("exportBtn")?.click();});
for(const [id,action] of [
 ["trainerSignup",signup],["trainerSignin",signin],["trainerLogout",logout],
 ["trainerReset",reset],["trainerVerify",verify],["trainerRefresh",refreshVerification],
 ["trainerClaim",claim],["trainerUpload",upload],["trainerDownload",download],["trainerUndoCloud",undo]
])$(id).addEventListener("click",()=>{if(busy||(!online()&&id!=="trainerUndoCloud"))return;void action();});
window.ByteBuddyTrainerV13={
 setup(b){bridge=b;},isReady(){return online();},
 status(){return {connected:!!user,handle:profile?.handle||null,cloudRevision:revision}},
 provider:"firebase"
};
if(configured&&!window.ByteBuddyDevMode){
 message("Chargement Firebase...");
 Promise.all([
  import(SDK+"firebase-app.js"),
  import(SDK+"firebase-auth.js"),
  import(SDK+"firebase-firestore.js")
 ]).then(([appMod,authMod,fireMod])=>{
  const app=appMod.initializeApp(cfg);A=authMod;F=fireMod;
  auth=authMod.getAuth(app);db=fireMod.getFirestore(app);
  authMod.onAuthStateChanged(auth,async nextUser=>{
   user=nextUser;
   try{await loadAccount()}catch(e){message("Cloud Firebase : "+hint(e));refresh();}
  });
  message("Firebase prêt. Recherche de session...");refresh();
 }).catch(e=>{message("Firebase indisponible : "+hint(e)+". Sauvegarde locale conservée.");refresh();});
}else{
 message(window.ByteBuddyDevMode?
  "Mode test : cloud désactivé. Ta vraie sauvegarde reste isolée.":
  "Firebase n'est pas encore connecté. Partie locale intacte ; export JSON disponible.");
}
refresh();
})();