// v0.9.7 compatibility shell: canonical PC/APK entry + latest runtime loaders.
// v0.10.5 boot change: load all compatibility layers immediately and keep one visible latest version.
window.CY_LATEST_VERSION='0.10.5-live';
const CY_V97_VERSION=window.CY_LATEST_VERSION;

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
  const version=window.CY_LATEST_VERSION||CY_V97_VERSION;
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+version;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=version;
}
function cyV97Wrap(name){
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV97Wrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);cyV97Stamp();return out};
  wrapped.__cyV97Wrapped=true;window[name]=wrapped;
}
['renderHero','renderSettings','renderRecommendations','renderTracking','cyV94RenderResults','cyV94Static','cyV94Refresh'].forEach(cyV97Wrap);

function cyV97Css(id,href){
  if(document.getElementById(id))return;
  const css=document.createElement('link');css.id=id;css.rel='stylesheet';css.href=href;document.head.appendChild(css);
}
function cyV97Js(id,src){
  if(document.getElementById(id))return;
  const js=document.createElement('script');js.id=id;js.src=src;js.async=false;document.body.appendChild(js);
}
function cyV97LoadV98(){cyV97Css('cyV98DesktopFixCss','assets/app-v98-desktop-fix.css?v=1050');cyV97Js('cyV98RuntimeFixScript','assets/app-v98-runtime-fix.js?v=1050')}
function cyV97LoadV99(){cyV97Css('cyV99ContactHoldCss','assets/app-v99-contact-hold.css?v=1050');cyV97Js('cyV99ContactHoldScript','assets/app-v99-contact-hold.js?v=1050')}
function cyV97LoadV100(){cyV97Js('cyV100HomeCurrentScript','assets/app-v100-home-current.js?v=1050')}
function cyV97LoadV101(){cyV97Css('cyV101MapFullResultCss','assets/app-v101-map-fullresult.css?v=1050');cyV97Js('cyV101MapFullResultScript','assets/app-v101-map-fullresult.js?v=1050')}
function cyV97LoadV102(){cyV97Js('cyV102FinanceRangesScript','assets/app-v102-finance-ranges.js?v=1050')}
function cyV97LoadV103(){cyV97Css('cyV103SortCss','assets/app-v103-sort.css?v=1050');cyV97Js('cyV103SortScript','assets/app-v103-sort.js?v=1050')}
function cyV97LoadV104(){cyV97Css('cyV104PcMobileCss','assets/app-v104-pc-mobile.css?v=1050');cyV97Js('cyV104PcMobileScript','assets/app-v104-pc-mobile.js?v=1050')}
function cyV97LoadV105(){cyV97Css('cyV105PcWideCss','assets/app-v105-pc-wide.css?v=1050');cyV97Js('cyV105PcWideScript','assets/app-v105-pc-wide.js?v=1050')}

function cyV97Boot(){
  cyV97Stamp();
  const err=document.getElementById('loadError');
  if(err&&/HTTP\s+200\/404/.test(err.textContent||''))err.hidden=true;
  // No staged delays: request all current compatibility layers immediately.
  cyV97LoadV98();
  cyV97LoadV99();
  cyV97LoadV100();
  cyV97LoadV101();
  cyV97LoadV102();
  cyV97LoadV103();
  cyV97LoadV104();
  cyV97LoadV105();
  cyV97Stamp();
}
// This script is already at the end of <body>, so boot now instead of waiting for DOMContentLoaded.
cyV97Boot();
