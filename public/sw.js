const CACHE='market-radar-v12-boot-recovery';
const STATIC=['./','./index.html','./manifest.webmanifest','./assets/report.css','./assets/report.js','./assets/mobile-fixes.css','./assets/report-enhancements.js','./assets/report-safe-v11.css','./assets/report-safe-v11.js','./assets/report-safe-v11-hotfix.js','./assets/report-boot-guard.js','./reports/latest.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
async function networkFirst(req){
  try{
    const r=await fetch(req,{cache:'no-store'});
    if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}
    return r;
  }catch(err){
    const cached=await caches.match(req,{ignoreSearch:true});
    if(cached)return cached;
    throw err;
  }
}
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const dynamic=u.pathname.endsWith('/data/latest.json')||u.pathname.endsWith('/data/live/intraday.json')||u.pathname.endsWith('/reports/latest.html')||u.pathname.includes('/assets/report')||u.pathname.endsWith('/assets/mobile-fixes.css');
  if(dynamic){e.respondWith(networkFirst(e.request));return}
  if(e.request.mode==='navigate'){
    e.respondWith(networkFirst(e.request).catch(()=>caches.match('./index.html')));return
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});