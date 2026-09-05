const CACHE='chungyack-live-v0.8.3-r1';
const ASSETS=['./','./index.html','./assets/app.css','./assets/app-v2.css','./assets/app-v3.css','./assets/app-v4.css','./assets/app-v5.css','./assets/app-v6.css','./assets/app-v61.css','./assets/app-v7.css','./assets/app-v8-ui.css','./assets/app-v82-ui.css','./assets/app-v83-ui.css','./assets/app.js','./assets/app-v2-fixes.js','./assets/app-v3.js','./assets/app-v4.js','./assets/app-v5.js','./assets/app-v6.js','./assets/app-v61.js','./assets/app-v7.js','./assets/app-v8-ui.js','./assets/app-v82-ui.js','./assets/app-v83-ui.js','./assets/app-icon.svg','./data/app.json','./data/hourly-report.json','./data/current-opportunities.json','./data/discovery-extra.json','./data/sh-happy-2026-2-youth.json','./data/sh-2026.csv','./manifest.webmanifest'];

async function putFresh(request,response){
  if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}
  return response;
}
async function networkFirst(request){
  try{return await putFresh(request,await fetch(request,{cache:'no-store'}))}
  catch(error){return (await caches.match(request))||(request.mode==='navigate'?await caches.match('./index.html'):Promise.reject(error))}
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  event.respondWith(networkFirst(event.request));
});
