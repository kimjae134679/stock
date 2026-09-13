// v0.10.0 live: home hides only expired opportunities that are unrelated to the user.
// Favorited or applied/tracked items stay visible on Home even after the reception period ends.
const CY_V100_VERSION='0.10.0-live';

function cyV100IsExpired(item){
  try{return typeof cyV96Expired==='function'?cyV96Expired(item):false}catch{return false}
}
function cyV100Protected(item){
  try{
    if(typeof cyV96Protected==='function')return cyV96Protected(item);
    const saved=!!(item&&typeof CY_V7_SAVED!=='undefined'&&CY_V7_SAVED.has(item.id));
    const tracked=!!(item&&typeof cyV7IsTracked==='function'&&cyV7IsTracked(item));
    return saved||tracked;
  }catch{return false}
}

if(typeof cyV7Items==='function'&&!cyV7Items.__cyV100Wrapped){
  const base=cyV7Items;
  const wrapped=function(){
    const rows=base.apply(this,arguments)||[];
    return rows.filter(item=>cyV100Protected(item)||!cyV100IsExpired(item));
  };
  wrapped.__cyV100Wrapped=true;
  cyV7Items=wrapped;
}

function cyV100Stamp(){
  const version=window.CY_LATEST_VERSION||CY_V100_VERSION;
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+version;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=version;
}
function cyV100Refresh(){
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(e){console.warn('[ChungYack] home current-only refresh failed',e)}
  try{if(typeof cyV94MoveOpportunitiesHome==='function')cyV94MoveOpportunitiesHome()}catch{}
  cyV100Stamp();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(cyV100Refresh,180),{once:true});else setTimeout(cyV100Refresh,180);
