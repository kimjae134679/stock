// v0.10.4 compatibility layer: desktop/mobile parity marker.
const CY_V104_VERSION=window.CY_LATEST_VERSION||'0.10.4-live';
function cyV104Stamp(){
  const version=window.CY_LATEST_VERSION||CY_V104_VERSION;
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+version;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=version;
  document.documentElement.dataset.chungyackVersion=version;
}
function cyV104Boot(){
  cyV104Stamp();
  setTimeout(cyV104Stamp,250);
  setTimeout(cyV104Stamp,900);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV104Boot,{once:true});else cyV104Boot();
