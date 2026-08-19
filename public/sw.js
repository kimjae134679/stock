// Market Radar v0.3.4 — legacy cache killer only.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}catch(_){ }
    try{await self.registration.unregister()}catch(_){ }
    try{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of clients)c.postMessage({type:'MR_SW_DISABLED',version:'0.3.4'})}catch(_){ }
  })());
});
// Intentionally no fetch handler. Nothing is cached by this worker.
