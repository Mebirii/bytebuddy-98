/* Notifications locales pendant une session ouverte ; les push après fermeture exigent un serveur. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 const url=e.notification.data?.url||new URL('./',self.registration.scope).href;
 e.waitUntil((async()=>{const windows=await clients.matchAll({type:'window',includeUncontrolled:true});for(const w of windows){if(w.url.startsWith(self.registration.scope)){await w.focus();return;}}await clients.openWindow(url)})());
});
self.addEventListener('push',e=>{
 let payload={};try{payload=e.data?.json()||{}}catch(_){}
 e.waitUntil(self.registration.showNotification(payload.title||"ByteBuddy ’98",{body:payload.body||'Ton compagnon a besoin de toi !',tag:'bytebuddy-push',icon:'./icon.svg',data:{url:new URL('./',self.registration.scope).href}}));
});