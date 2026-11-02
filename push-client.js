/* ByteBuddy cloud push: opt-in, per-device subscription, no account required. */
(() => {
  "use strict";
  if(window.ByteBuddyDevMode)return; // Never read or sync production push state in the developer sandbox.
  const API = String(window.BYTEBUDDY_PUSH_API || "").replace(/\/+$/, "");
  const KEY = "bytebuddy98-push-device-v1";
  const ENABLED = "bytebuddy98-push-enabled-v1";
  const SAVE = "bytebuddy98-save-v1";
  const $ = id => document.getElementById(id);
  const enable = $("enableCloudPush"), test = $("testCloudPush"), status = $("cloudPushStatus");
  if (!enable || !test || !status) return;
  const supported = () => window.isSecureContext && "Notification" in window &&
    "serviceWorker" in navigator && "PushManager" in window;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const installed = () => window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true;
  let credentials = null, lastSynced = 0, syncing = false;
  try { credentials = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (_) {}
  function snapshot() {
    let save = {};
    try { save = JSON.parse(localStorage.getItem(SAVE) || "{}"); } catch (_) {}
    return { stage:save.stage, sleeping:save.sleeping, fullness:save.fullness,
      hygiene:save.hygiene, energy:save.energy, health:save.health, joy:save.joy,
      name:$("homeName")?.textContent || "Ton compagnon" };
  }
  function makeCredentials() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const random = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
    return {deviceId:crypto.randomUUID(),deviceSecret:random};
  }
  function decodeBase64Url(str) {
    const value = String(str).replace(/-/g,"+").replace(/_/g,"/");
    const raw = atob(value + "=".repeat((4-value.length%4)%4));
    return Uint8Array.from(raw,c=>c.charCodeAt(0));
  }
  async function request(route,body,verb="POST") {
    const res=await fetch(API+"/"+route,{
      method:verb,mode:"cors",cache:"no-store",
      headers:{"Content-Type":"application/json"},
      body:verb==="GET"?undefined:JSON.stringify(body)
    });
    const json=await res.json().catch(()=>({}));
    if(!res.ok) throw Error(json.error || "Service temporairement indisponible");
    return json;
  }
  const active = () => localStorage.getItem(ENABLED)==="yes";
  function refresh(message="") {
    if(!API) {
      enable.disabled=true;test.disabled=true;enable.textContent="SERVEUR EN PRÉPARATION";
      status.textContent="Le serveur push dédié n'est pas encore configuré. Les alertes locales restent disponibles.";
      return;
    }
    if(!supported()) {
      enable.disabled=true;test.disabled=true;
      status.textContent="Les notifications push ne sont pas prises en charge sur cet appareil ou ce navigateur.";
      return;
    }
    if(isIos && !installed()) {
      enable.disabled=true;test.disabled=true;enable.textContent="INSTALLER SUR L'ÉCRAN D'ACCUEIL";
      status.textContent="Sur iPhone : ouvre le site dans Safari, Partager → Sur l'écran d'accueil, puis lance ByteBuddy depuis son icône.";
      return;
    }
    enable.disabled=false;
    enable.textContent=active()?"DÉSACTIVER LES PUSH":"ACTIVER LES PUSH";
    test.disabled=!active();
    status.textContent=message || (active()?
      "Notifications push activées, y compris quand le jeu est fermé. Maximum 3 alertes par jour, silence de 22 h à 8 h.":
      "Aucune notification n'est envoyée sans ton accord. L'activation concerne uniquement cet appareil.");
  }
  async function subscribe() {
    if(!supported() || !API) return;
    // Permission prompt is directly tied to this tap, including for iOS Home Screen apps.
    const permission = Notification.permission==="default" ?
      await Notification.requestPermission() : Notification.permission;
    if(permission!=="granted") { refresh("Autorisation refusée. Modifie les réglages de notifications pour continuer.");return; }
    enable.disabled=true;status.textContent="Inscription de cet appareil...";
    try {
      const config=await request("public-key",null,"GET");
      if(!config.ready || !config.publicKey)throw Error("Service push non configuré");
      const reg=await navigator.serviceWorker.ready;
      let sub=await reg.pushManager.getSubscription();
      if(sub) {
        // Subscriptions made with another public key cannot be reused.
        const existing=sub.options?.applicationServerKey;
        const wanted=decodeBase64Url(config.publicKey);
        if(existing && (new Uint8Array(existing).length!==wanted.length ||
          new Uint8Array(existing).some((n,i)=>n!==wanted[i]))) {
          await sub.unsubscribe();sub=null;
        }
      }
      if(!sub) sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:decodeBase64Url(config.publicKey)
      });
      if(!credentials?.deviceId || !credentials?.deviceSecret) credentials=makeCredentials();
      await request("subscribe",{
        ...credentials,subscription:sub.toJSON(),snapshot:snapshot()
      });
      localStorage.setItem(KEY,JSON.stringify(credentials));
      localStorage.setItem(ENABLED,"yes");
      window.ByteBuddyCloudPushEnabled = true;
      lastSynced=Date.now();
      refresh("Alertes push activées sur cet appareil !");
    } catch(err) {
      localStorage.removeItem(ENABLED);
      window.ByteBuddyCloudPushEnabled = false;
      refresh("Échec d'activation : "+(err?.message||"réessaie plus tard"));
    }
  }
  async function unsubscribe() {
    enable.disabled=true;
    try {
      if(credentials) await request("unsubscribe",{...credentials});
      const reg=await navigator.serviceWorker.ready;
      const sub=await reg.pushManager.getSubscription();
      if(sub)await sub.unsubscribe();
      localStorage.removeItem(ENABLED);
      window.ByteBuddyCloudPushEnabled=false;
      refresh("Notifications push désactivées et abonnement supprimé.");
    } catch(err) {
      refresh("Impossible de désactiver le service distant : "+(err?.message||"réessaie"));
    }
  }
  async function sync() {
    if(!API||!active()||!credentials||syncing||!supported())return;
    if(Date.now()-lastSynced<60000)return;
    syncing=true;
    try {
      await request("sync",{...credentials,snapshot:snapshot()});
      lastSynced=Date.now();
    } catch(e) { console.warn("ByteBuddy push sync unavailable",e); }
    finally {syncing=false;}
  }
  enable.addEventListener("click",()=>{
    if(active())void unsubscribe();else void subscribe();
  });
  test.addEventListener("click",async()=>{
    if(!active() || !credentials)return;
    test.disabled=true;
    try {
      await request("test",{...credentials});
      refresh("Notification de test envoyée à ton appareil.");
    }catch(e){refresh("Envoi de test impossible : "+(e?.message||"erreur"));}
    finally {test.disabled=false;}
  });
  window.ByteBuddyCloudPushEnabled = active() && !!API;
  refresh();
  setInterval(()=>void sync(),60000);
  window.addEventListener("focus",()=>void sync());
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")void sync();});
})();
