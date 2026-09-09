// v0.10.0 live: home only shows currently actionable opportunities.
// Expired opportunities are removed from Home regardless of applied/favorited state.
// Applied items continue to live in 신청/결과, and favorites remain in 찜.
const CY_V100_VERSION='0.10.0-live';

function cyV100IsExpired(item){
  try{return typeof cyV96Expired==='function'?cyV96Expired(item):false}catch{return false}
}

if(typeof cyV7Items==='function'&&!cyV7Items.__cyV100Wrapped){
  const base=cyV7Items;
  const wrapped=function(){
    const rows=base.apply(this,arguments)||[];
    return rows.filter(item=>!cyV100IsExpired(item));
  };
  wrapped.__cyV100Wrapped=true;
  cyV7Items=wrapped;
}

function cyV100Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V100_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V100_VERSION;
}
function cyV100Refresh(){
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(e){console.warn('[ChungYack] home current-only refresh failed',e)}
  try{if(typeof cyV94MoveOpportunitiesHome==='function')cyV94MoveOpportunitiesHome()}catch{}
  cyV100Stamp();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(cyV100Refresh,180),{once:true});else setTimeout(cyV100Refresh,180);
