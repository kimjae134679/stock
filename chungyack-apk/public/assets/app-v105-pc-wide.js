// v0.10.5 live: latest-version lock and PC-width release marker.
window.CY_LATEST_VERSION='0.10.5-live';
const CY_V105_VERSION=window.CY_LATEST_VERSION;
function cyV105Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V105_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V105_VERSION;
  document.documentElement.dataset.chungyackVersion=CY_V105_VERSION;
}
function cyV105Boot(){
  cyV105Stamp();
  requestAnimationFrame(cyV105Stamp);
  setTimeout(cyV105Stamp,250);
  setTimeout(cyV105Stamp,900);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV105Boot,{once:true});else cyV105Boot();
