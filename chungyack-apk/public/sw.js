const CACHE='chungyack-radar-v0.5.0';
const ASSETS=['./','./index.html','./assets/app.css','./assets/app-v2.css','./assets/app-v3.css','./assets/app-v4.css','./assets/app-v4-ui.css','./assets/app-v5.css','./assets/app.js','./assets/app-v2-fixes.js','./assets/app-v3.js','./assets/app-v4.js','./assets/app-v4-remote.js','./assets/app-v4-ui.js','./assets/app-v5.js','./assets/app-icon.svg','./data/app.json','./data/hourly-report.json','./data/report-overrides.json','./data/sh-2026.csv','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(u.pathname.endsWith('/data/app.json')||u.pathname.endsWith('/data/hourly-report.json')||u.pathname.endsWith('/data/report-overrides.json')||u.pathname.endsWith('/data/sh-2026.csv')){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp})));
});
