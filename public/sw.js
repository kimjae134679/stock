// Market Radar v0.3.3 — legacy cache killer.
// This service worker intentionally stores nothing. Its only job is to remove
// stale Market Radar caches left by older PWA builds, then get out of the way.
self.addEventListener('install',event=>{
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }catch(_){ }
    try{await self.registration.unregister();}catch(_){ }
    try{
      const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
      for(const client of clients){client.postMessage({type:'MR_SW_DISABLED',version:'0.3.3'});}
    }catch(_){ }
  })());
});
self.addEventListener('fetch',()=>{
  // No respondWith: browser/WebView uses the network/default loader directly.
});
