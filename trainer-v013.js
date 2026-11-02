/* ByteBuddy V0.13: account login and opt-in conflict-safe save transfers. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),cfg=window.BYTEBUDDY_ACCOUNT_CONFIG||{};
const endpoint=String(cfg.url||"").trim().replace(/\/$/,""),key=String(cfg.publishableKey||"").trim();
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(endpoint)&&key.length>30;
const usable=!window.ByteBuddyDevMode&&configured&&!!window.supabase?.createClient;
const style=document.createElement("style");style.textContent="\n.bb-trainer{font:10px/1.5 monospace;color:#38583b;display:flex;flex-direction:column;gap:8px}\n.bb-trainer h3{font:900 13px monospace;margin:5px 0}\n.bb-trainer label{font:900 10px monospace;display:block}\n.bb-trainer input{width:100%;display:block;margin:3px 0 8px;padding:9px;background:#ecf5d6;color:#355439;border:2px solid #819d76;border-radius:4px;font:11px monospace}\n.bb-trainer button{background:#396145;border:2px solid #759475;border-radius:5px;padding:9px 5px;min-height:43px;color:#f2fade;font:900 10px monospace}\n.bb-trainer button:disabled{opacity:.4}\n.bb-trainer-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}\n.bb-trainer-status{border:1px dashed #809b73;padding:8px;min-height:42px;border-radius:5px;font:10px/1.5 monospace}\n.bb-trainer-info{padding:8px;background:#dceac2;border:1px solid #819875;border-radius:4px}\n.bb-trainer p{font:10px/1.6 monospace;margin:0 0 6px}\n.bb-trainer [hidden]{display:none!important}\n";document.head.appendChild(style);
const nav=document.createElement("button");nav.type="button";nav.dataset.view="trainer";nav.innerHTML='<span><svg class="px-icon" aria-hidden="true"><use href="#px-home"/></svg></span>DRESSEUR';
$("lcdMenu").querySelector(".lcd-menu-grid").appendChild(nav);
const section=document.createElement("section");section.className="panel";section.id="trainerPanel";
section.innerHTML="\n<div class=\"panel-header\"><h2>11 / COMPTE DRESSEUR</h2><span class=\"section-number\">CLOUD V0.13</span></div>\n<div class=\"bb-trainer\">\n <p>Retrouve ton compagnon sur un autre appareil avec un compte personnel. Transferts volontaires.</p>\n <div class=\"bb-trainer-status\" id=\"trainerStatus\" role=\"status\" aria-live=\"polite\">Configuration en cours...</div>\n <div id=\"trainerGuest\">\n  <label for=\"trainerEmail\">EMAIL</label><input id=\"trainerEmail\" type=\"email\" autocomplete=\"email\" maxlength=\"254\" placeholder=\"adresse@email.fr\">\n  <label for=\"trainerPassword\">MOT DE PASSE</label><input id=\"trainerPassword\" type=\"password\" autocomplete=\"current-password\" minlength=\"8\" maxlength=\"128\" placeholder=\"8 caractères minimum\">\n  <label for=\"trainerHandle\">PSEUDO (POUR L'INSCRIPTION)</label><input id=\"trainerHandle\" autocomplete=\"nickname\" spellcheck=\"false\" minlength=\"3\" maxlength=\"20\" placeholder=\"pixel_tamer\">\n  <div class=\"bb-trainer-actions\"><button id=\"trainerSignup\" type=\"button\">S'INSCRIRE</button><button id=\"trainerSignin\" type=\"button\">SE CONNECTER</button></div>\n  <button id=\"trainerReset\" type=\"button\" style=\"width:100%;margin-top:8px\">MOT DE PASSE OUBLIÉ</button>\n </div>\n <div id=\"trainerLoggedIn\" hidden>\n  <div class=\"bb-trainer-info\"><strong id=\"trainerIdentity\">DRESSEUR</strong><p id=\"trainerEmailDisplay\"></p></div>\n  <div id=\"trainerNeedHandle\" hidden><p>Choisis ton pseudo de dresseur.</p>\n   <label for=\"trainerNewHandle\">PSEUDO UNIQUE</label><input id=\"trainerNewHandle\" autocomplete=\"nickname\" minlength=\"3\" maxlength=\"20\" placeholder=\"pixel_tamer\">\n   <button id=\"trainerClaim\" type=\"button\">VALIDER MON PSEUDO</button>\n  </div>\n  <div id=\"trainerCloud\" hidden><p id=\"trainerCloudInfo\">Recherche de sauvegarde cloud...</p>\n   <div class=\"bb-trainer-actions\"><button id=\"trainerUpload\" type=\"button\">ENVOYER MA PARTIE</button><button id=\"trainerDownload\" type=\"button\">RÉCUPÉRER MA PARTIE</button></div>\n   <p>Le cloud ne remplace jamais automatiquement ta partie locale. Une sauvegarde de sécurité est conservée avant récupération.</p>\n  </div>\n  <button id=\"trainerLogout\" type=\"button\" style=\"width:100%\">SE DÉCONNECTER</button>\n </div>\n <div id=\"trainerRecovery\" hidden>\n  <label for=\"trainerNewPassword\">NOUVEAU MOT DE PASSE</label><input id=\"trainerNewPassword\" type=\"password\" autocomplete=\"new-password\" minlength=\"8\" maxlength=\"128\">\n  <button id=\"trainerUpdatePassword\" type=\"button\">METTRE À JOUR</button>\n </div>\n</div>\n";document.querySelector(".right").appendChild(section);
const undo=document.createElement("button");undo.id="trainerUndoCloud";undo.type="button";undo.textContent="RESTAURER MA COPIE DE SÉCURITÉ";undo.style.width="100%";$("trainerCloud").appendChild(undo);
const BACKUP="bytebuddy98-save-backup-before-cloud-v013",PENDING="bytebuddy98-pending-handle";
let client=null,bridge=null,user=null,profile=null,revision=null,cloudDate=null,busy=false,recovery=false;
const info=message=>$("trainerStatus").textContent=String(message||"").slice(0,350);
const handleOf=x=>String(x||"").trim().toLowerCase();
const validHandle=x=>/^[a-z][a-z0-9_]{2,19}$/.test(handleOf(x));
const validEmail=x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x||"").trim())&&x.length<=254;
function refresh(){
 const inAccount=!!user;
 $("trainerGuest").hidden=inAccount;$("trainerLoggedIn").hidden=!inAccount;
 $("trainerRecovery").hidden=!recovery;
 $("trainerNeedHandle").hidden=!inAccount||!!profile;
 $("trainerCloud").hidden=!inAccount||!profile;
 $("trainerIdentity").textContent=profile?"DRESSEUR : "+profile.handle.toUpperCase():"PROFIL À CRÉER";
 $("trainerEmailDisplay").textContent=user?.email||"";
 $("trainerUpload").disabled=!inAccount||!profile||busy;
 $("trainerDownload").disabled=!inAccount||!profile||revision===null||busy;
}
function cloudLabel(){
 $("trainerCloudInfo").textContent=revision===null?
  "Pas de sauvegarde cloud. Tu peux envoyer celle de cet appareil.":
  "Cloud : version "+revision+" · "+new Date(cloudDate).toLocaleString("fr-FR");
}
async function fetchAccount(){
 if(!client||!user)return;
 const {data:found,error}=await client.from("trainer_profiles").select("handle,display_name").eq("user_id",user.id).maybeSingle();
 if(error)throw error;profile=found||null;
 if(!profile){
  let pending="";try{pending=sessionStorage.getItem(PENDING)||""}catch(_){}
  if(validHandle(pending))$("trainerNewHandle").value=pending;
  revision=null;cloudDate=null;
  info("Compte connecté. Choisis ton pseudo pour activer le cloud.");
 }else{
  try{sessionStorage.removeItem(PENDING)}catch(_){}
  const {data:save,error:err}=await client.from("trainer_saves").select("revision,updated_at").eq("user_id",user.id).maybeSingle();
  if(err)throw err;
  revision=save?.revision??null;cloudDate=save?.updated_at??null;
  cloudLabel();info("Bienvenue, "+profile.handle+" !");
 }
 refresh();
}
async function updateAuth(){
 if(!client)return;
 const {data,error}=await client.auth.getUser();
 if(error&&!/session missing/i.test(error.message||""))throw error;
 user=data?.user||null;
 if(user)await fetchAccount();
 else{profile=null;revision=null;cloudDate=null;refresh();}
}
async function signup(){
 if(!client||busy)return;
 const email=$("trainerEmail").value.trim(),password=$("trainerPassword").value,handle=handleOf($("trainerHandle").value);
 if(!validEmail(email)){info("Adresse email invalide.");return;}
 if(password.length<8){info("Mot de passe : 8 caractères minimum.");return;}
 if(!validHandle(handle)){info("Pseudo : 3 à 20 caractères, commencer par une lettre, lettres/chiffres/_ uniquement.");return;}
 busy=true;
 try{
  try{sessionStorage.setItem(PENDING,handle)}catch(_){}
  const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
  $("trainerPassword").value="";if(error)throw error;
  if(data?.session){await updateAuth();info("Compte créé. Termine ton pseudo si nécessaire.");}
  else info("Vérifie ton email pour confirmer ton compte, puis reconnecte-toi.");
 }catch(e){info("Inscription : "+(e.message||"échec"));}
 finally{busy=false;}
}
async function signin(){
 if(!client||busy)return;
 const email=$("trainerEmail").value.trim(),password=$("trainerPassword").value;
 if(!validEmail(email)||!password){info("Indique ton email et ton mot de passe.");return;}
 busy=true;
 try{const {error}=await client.auth.signInWithPassword({email,password});
  $("trainerPassword").value="";if(error)throw error;
  await updateAuth();
 }catch(e){$("trainerPassword").value="";info("Connexion : "+(e.message||"échec"));}
 finally{busy=false;}
}
async function claim(){
 if(!client||!user||profile||busy)return;
 const handle=handleOf($("trainerNewHandle").value);
 if(!validHandle(handle)){info("Pseudo invalide. Exemple : pixel_tamer");return;}
 busy=true;
 try{
  const {error}=await client.from("trainer_profiles").insert({user_id:user.id,handle,display_name:handle});
  if(error)throw Error(error.code==="23505"?"Ce pseudo est déjà utilisé.":error.message);
  await fetchAccount();
 }catch(e){info("Pseudo : "+(e.message||"échec"))}
 finally{busy=false;refresh()}
}
async function logout(){
 if(!client||!user||busy)return;
 try{const {error}=await client.auth.signOut();if(error)throw error;
  user=null;profile=null;revision=null;cloudDate=null;$("trainerPassword").value="";
  refresh();info("Déconnecté. Ta partie reste sur cet appareil.");
 }catch(e){info("Déconnexion : "+(e.message||"échec"))}
}
async function reset(){
 if(!client)return;
 const email=$("trainerEmail").value.trim();
 if(!validEmail(email)){info("Indique ton email pour récupérer le compte.");return;}
 try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  if(error)throw error;info("Si ce compte existe, un email a été envoyé.");
 }catch(e){info("Récupération : "+(e.message||"échec"))}
}
async function updatePassword(){
 if(!client||!user||!recovery)return;
 const password=$("trainerNewPassword").value;
 if(password.length<8){info("8 caractères minimum.");return;}
 try{const {error}=await client.auth.updateUser({password});if(error)throw error;
  recovery=false;$("trainerNewPassword").value="";refresh();info("Mot de passe mis à jour.");
 }catch(e){info("Mot de passe : "+(e.message||"échec"))}
}
async function upload(){
 if(!client||!user||!profile||!bridge||busy)return;
 busy=true;refresh();
 try{
  const snapshot=bridge.snapshot();
  if(!snapshot||![1,2,3,4].includes(snapshot.version))throw Error("Partie locale incompatible.");
  const {data:existing,error:readError}=await client.from("trainer_saves")
   .select("revision,updated_at").eq("user_id",user.id).maybeSingle();
  if(readError)throw readError;
  if(existing&&revision!==null&&existing.revision!==revision)
   throw Error("Conflit : une sauvegarde plus récente existe. Récupère-la avant d'envoyer.");
  if(existing&&!window.confirm("Remplacer la sauvegarde cloud par la partie de cet appareil ?"))return;
  let saved;
  if(existing){
   const {data,error}=await client.from("trainer_saves")
    .update({data:snapshot,revision:existing.revision+1}).eq("user_id",user.id).eq("revision",existing.revision)
    .select("revision,updated_at").maybeSingle();
   if(error)throw error;
   if(!data)throw Error("Conflit entre deux appareils. Le cloud n'a pas été modifié.");
   saved=data;
  }else{
   const {data,error}=await client.from("trainer_saves")
    .insert({user_id:user.id,data:snapshot,revision:1}).select("revision,updated_at").single();
   if(error)throw error;saved=data;
  }
  revision=saved.revision;cloudDate=saved.updated_at;cloudLabel();
  info("Partie envoyée dans le cloud. Elle est accessible depuis ton compte.");
 }catch(e){info("Sauvegarde : "+(e.message||"échec"))}
 finally{busy=false;refresh()}
}
async function undoCloud(){
 if(!bridge||busy)return;
 let backup;
 try{backup=localStorage.getItem(BACKUP)}
 catch(_){info("Impossible de lire les sauvegardes locales.");return}
 if(!backup){info("Aucune copie avant récupération cloud n'est disponible.");return}
 try{
  const validated=bridge.validate(JSON.parse(backup));
  if(!window.confirm("Restaurer la partie locale sauvegardée avant la récupération cloud ? Cela remplace la partie actuelle et recharge le jeu."))return;
  const current=bridge.snapshot();
  try{localStorage.setItem("bytebuddy98-save-backup-before-recovery-v013",JSON.stringify(current))}
  catch(_){throw Error("Impossible de protéger ta partie actuelle. Annulation.");}
  bridge.restore(validated);info("Copie locale restaurée.");
 }catch(e){info("Restauration : "+(e.message||"échec"));}
}
async function download(){
 if(!client||!user||!profile||!bridge||busy)return;
 busy=true;refresh();
 try{
  const {data,error}=await client.from("trainer_saves")
   .select("data,revision,updated_at").eq("user_id",user.id).maybeSingle();
  if(error)throw error;
  if(!data){revision=null;info("Pas encore de partie cloud.");return;}
  const validated=bridge.validate(data.data);
  if(!window.confirm("Récupérer le cloud et remplacer la partie locale ? Une copie de sécurité locale sera conservée."))return;
  const previous=bridge.snapshot();
  try{localStorage.setItem(BACKUP,JSON.stringify(previous))}
  catch(_){throw Error("Sauvegarde de sécurité impossible. Transfert annulé.");}
  revision=data.revision;cloudDate=data.updated_at;bridge.restore(validated);
  info("Partie récupérée. Rechargement...");
 }catch(e){info("Récupération : "+(e.message||"échec"))}
 finally{busy=false;refresh()}
}
for(const [id,fn] of [
 ["trainerSignup",signup],["trainerSignin",signin],["trainerClaim",claim],["trainerLogout",logout],
 ["trainerReset",reset],["trainerUpdatePassword",updatePassword],
 ["trainerUpload",upload],["trainerDownload",download],["trainerUndoCloud",undoCloud]
])$(id).addEventListener("click",fn);
if(usable){
 client=window.supabase.createClient(endpoint,key,{auth:{persistSession:true,autoRefreshToken:true,
  detectSessionInUrl:true,storageKey:"bytebuddy98-trainer-session"}});
 client.auth.onAuthStateChange(event=>{
  if(event==="PASSWORD_RECOVERY"){recovery=true;refresh();info("Choisis ton nouveau mot de passe.");}
  if(["SIGNED_IN","SIGNED_OUT","TOKEN_REFRESHED"].includes(event))
   setTimeout(()=>updateAuth().catch(e=>info("Session : "+(e.message||"erreur"))),0);
 });
 info("Inscris-toi ou connecte-toi.");
 updateAuth().catch(e=>info("Session : "+(e.message||"erreur")));
}else{
 info(window.ByteBuddyDevMode?"Mode test : comptes et transferts cloud désactivés.":configured?"Module de connexion temporairement inaccessible. Recharge la page.":
   "Serveur ByteBuddy dédié non activé. Le jeu et les sauvegardes locales restent disponibles.");
 for(const id of ["trainerSignup","trainerSignin","trainerReset"])$(id).disabled=true;
}
refresh();
window.ByteBuddyTrainerV13={
 setup(b){bridge=b;},isReady(){return !!client;},
 status(){return {connected:!!user,handle:profile?.handle||null,cloudRevision:revision}}
};
})();