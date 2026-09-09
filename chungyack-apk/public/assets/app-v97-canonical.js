// v0.9.7 compatibility shell: canonical PC/APK entry + latest runtime loaders.
// Keeps modern opportunity JSON working even when the legacy SH CSV is unavailable.
const CY_V97_VERSION='0.9.7-live';

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

function cyV97LoadV98(){
  if(!document.getElementById('cyV98DesktopFixCss')){
    const css=document.createElement('link');css.id='cyV98DesktopFixCss';css.rel='stylesheet';css.href='assets/app-v98-desktop-fix.css?v=0980';document.head.appendChild(css);
  }
  if(!document.getElementById('cyV98RuntimeFixScript')){
    const js=document.createElement('script');js.id='cyV98RuntimeFixScript';js.src='assets/app-v98-runtime-fix.js?v=0980';document.body.appendChild(js);
  }
}
function cyV97LoadV99(){
  if(!document.getElementById('cyV99ContactHoldCss')){
    const css=document.createElement('link');css.id='cyV99ContactHoldCss';css.rel='stylesheet';css.href='assets/app-v99-contact-hold.css?v=0990';document.head.appendChild(css);
  }
  if(!document.getElementById('cyV99ContactHoldScript')){
    const js=document.createElement('script');js.id='cyV99ContactHoldScript';js.src='assets/app-v99-contact-hold.js?v=0990';document.body.appendChild(js);
  }
}
function cyV97LoadV100(){
  if(document.getElementById('cyV100HomeCurrentScript'))return;
  const js=document.createElement('script');js.id='cyV100HomeCurrentScript';js.src='assets/app-v100-home-current.js?v=1000';document.body.appendChild(js);
}

function cyV97Boot(){
  cyV97Stamp();
  const err=document.getElementById('loadError');
  if(err&&/HTTP\s+200\/404/.test(err.textContent||''))err.hidden=true;
  cyV97LoadV98();
  setTimeout(cyV97LoadV99,120);
  setTimeout(cyV97LoadV100,260);
  setTimeout(cyV97Stamp,250);
  setTimeout(()=>{cyV97LoadV98();cyV97LoadV99();cyV97LoadV100()},900);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV97Boot,{once:true});else cyV97Boot();
