// v0.10.4 live: desktop/mobile visual parity marker + final version stamp.
const CY_V104_VERSION='0.10.4-live';
function cyV104Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V104_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V104_VERSION;
  document.documentElement.dataset.chungyackVersion=CY_V104_VERSION;
}
function cyV104Boot(){
  cyV104Stamp();
  setTimeout(cyV104Stamp,250);
  setTimeout(cyV104Stamp,900);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV104Boot,{once:true});else cyV104Boot();
