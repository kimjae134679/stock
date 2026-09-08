// v0.9.7 live: canonical PC/APK compatibility guard.
// Keeps modern opportunity JSON working even when the legacy SH CSV is unavailable.
const CY_V97_VERSION='0.9.7-live';

// app.js historically required both app.json and sh-2026.csv. The modern UI uses
// current-opportunities.json, so a missing legacy CSV must not block the whole app.
if(typeof loadData==='function'){
  loadData=async function(){
    try{
      const ts=Date.now();
      const meta=await fetch('data/app.json?ts='+ts,{cache:'no-store'});
      if(!meta.ok)throw new Error(`HTTP ${meta.status}`);
      DATA=await meta.json();

      try{
        const csv=await fetch('data/sh-2026.csv?ts='+ts,{cache:'no-store'});
        CATALOG=csv.ok?normalizeCatalog(parseCsv(await csv.text())):[];
      }catch{CATALOG=[]}

      if(!localStorage.getItem(TRACK_KEY))loadTracking();
      else TRACKING=JSON.parse(localStorage.getItem(TRACK_KEY)||'[]');
      initialFilters();
      try{syncFilterControls()}catch{}
      renderAll();
      const err=document.getElementById('loadError');if(err)err.hidden=true;
    }catch(e){
      console.error(e);
      const err=document.getElementById('loadError');
      if(err){err.hidden=false;err.textContent='데이터를 불러오지 못했습니다. '+e.message}
    }
  };
}

function cyV97Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V97_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V97_VERSION;
}
function cyV97Wrap(name){
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV97Wrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);cyV97Stamp();return out};
  wrapped.__cyV97Wrapped=true;window[name]=wrapped;
}
['renderHero','renderSettings','renderRecommendations','renderTracking','cyV94RenderResults','cyV94Static','cyV94Refresh'].forEach(cyV97Wrap);

function cyV97Boot(){
  cyV97Stamp();
  const err=document.getElementById('loadError');
  if(err&&/HTTP\s+200\/404/.test(err.textContent||''))err.hidden=true;
  setTimeout(cyV97Stamp,250);
  setTimeout(cyV97Stamp,1200);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV97Boot,{once:true});else cyV97Boot();
