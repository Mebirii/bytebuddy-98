/* ByteBuddy service worker: local notifications and background Web Push. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const path=event.notification.data?.url || new URL("./",self.registration.scope).href;
  const destination=new URL(path,self.registration.scope);
  const safeUrl=destination.href.startsWith(self.registration.scope)
    ?destination.href:new URL("./",self.registration.scope).href;
  event.waitUntil((async()=>{
    const windows=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const windowClient of windows){
      if(windowClient.url.startsWith(self.registration.scope)){
        await windowClient.focus();
        if("navigate" in windowClient)await windowClient.navigate(safeUrl);
        return;
      }
    }
    await clients.openWindow(safeUrl);
  })());
});
self.addEventListener("push",event=>{
  let payload={};
  try {payload=event.data?.json()||{};}catch(_){}
  const message={
    title:String(payload.title||"ByteBuddy ’98").slice(0,80),
    body:String(payload.body||"Ton compagnon a besoin de toi !").slice(0,220)
  };
  const url=typeof payload.url==="string" && payload.url.startsWith(self.registration.scope)
    ?payload.url:new URL("./",self.registration.scope).href;
  event.waitUntil(self.registration.showNotification(message.title,{
    body:message.body,
    icon:"./icon-192.png",
    badge:"./icon-192.png",
    tag:"bytebuddy-needs",
    renotify:false,
    data:{url}
  }));
});
