// v0.9.8 live: runtime safety for the v0.9.4 moved-home layout + desktop/APK consistency.
const CY_V98_VERSION='0.9.8-live';

function cyV98Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V98_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V98_VERSION;
}

function cyV98EnsureCompatHosts(){
  let root=document.getElementById('cyV98CompatHosts');
  if(!root){
    root=document.createElement('div');
    root.id='cyV98CompatHosts';
    root.hidden=true;
    document.body.appendChild(root);
  }
  const ids=['trackingGrid','historyBars'];
  ids.forEach(id=>{
    if(document.getElementById(id))return;
    const el=document.createElement('div');el.id=id;root.appendChild(el);
  });
  return root;
}

// The old base renderAll assumes home-only nodes still exist. v0.9.4 moves the
// opportunity DOM into Home and removes those legacy nodes, so later reloads could
// throw "Cannot set properties of null (setting 'innerHTML')". Keep renderAll safe.
renderAll=function(){
  cyV98EnsureCompatHosts();
  try{typeof renderHero==='function'&&renderHero()}catch(e){console.warn('[ChungYack] renderHero',e)}
  try{typeof renderRecommendations==='function'&&renderRecommendations()}catch(e){console.warn('[ChungYack] renderRecommendations',e)}
  try{document.getElementById('historyBars')&&typeof renderHistory==='function'&&renderHistory()}catch(e){console.warn('[ChungYack] renderHistory',e)}
  try{document.getElementById('sourceList')&&typeof renderSources==='function'&&renderSources()}catch(e){console.warn('[ChungYack] renderSources',e)}
  try{document.getElementById('scheduleList')&&typeof renderSchedule==='function'&&renderSchedule()}catch(e){console.warn('[ChungYack] renderSchedule',e)}
  try{typeof renderSettings==='function'&&renderSettings()}catch(e){console.warn('[ChungYack] renderSettings',e)}
  try{
    if(document.getElementById('trackingGrid')&&document.getElementById('trackingGridMirror')&&typeof renderTracking==='function')renderTracking();
    else if(typeof cyV94RenderApplications==='function')cyV94RenderApplications();
  }catch(e){console.warn('[ChungYack] renderApplications',e)}
  try{typeof cyV94Refresh==='function'&&cyV94Refresh()}catch(e){console.warn('[ChungYack] v94 refresh',e)}
  cyV98Stamp();
};

// Also make direct legacy renderer calls harmless after the Home DOM has moved.
function cyV98GuardLegacy(name,requiredIds){
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV98Guarded)return;
  const wrapped=function(){
    cyV98EnsureCompatHosts();
    for(const id of requiredIds){if(!document.getElementById(id))return}
    try{return fn.apply(this,arguments)}catch(e){console.warn(`[ChungYack] ${name} skipped`,e)}finally{cyV98Stamp()}
  };
  wrapped.__cyV98Guarded=true;window[name]=wrapped;
}
cyV98GuardLegacy('renderHistory',['historyBars']);
cyV98GuardLegacy('renderTracking',['trackingGrid','trackingGridMirror']);
cyV98GuardLegacy('renderSchedule',['scheduleList']);
cyV98GuardLegacy('renderSources',['sourceList']);

function cyV98DesktopSessionNote(){
  if(!/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)){
    const stat=document.querySelector('.hero-stat:nth-child(2) span');
    if(stat&&Number(document.getElementById('trackingCount')?.textContent||0)===0)stat.title='PC 브라우저는 APK와 다른 익명 Supabase 세션일 수 있습니다.';
    const sync=document.querySelector('.cy-v88-sync-pill,.sync-pill,[data-cy-sync]');
    if(sync)sync.title='개인 신청·찜은 로그인 없는 익명 계정 특성상 기기별 세션이 다를 수 있습니다.';
  }
}

function cyV98Boot(){
  cyV98EnsureCompatHosts();
  cyV98Stamp();
  const err=document.getElementById('loadError');
  if(err&&/Cannot set properties of null|HTTP\s+200\/404/.test(err.textContent||''))err.hidden=true;
  try{typeof cyV94Refresh==='function'&&cyV94Refresh()}catch{}
  cyV98DesktopSessionNote();
  setTimeout(()=>{cyV98Stamp();cyV98DesktopSessionNote();const e=document.getElementById('loadError');if(e&&/Cannot set properties of null/.test(e.textContent||''))e.hidden=true},900);
}

['renderHero','renderSettings','renderRecommendations','cyV94RenderResults','cyV94Static','cyV94Refresh'].forEach(name=>{
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV98Wrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);cyV98Stamp();return out};
  wrapped.__cyV98Wrapped=true;window[name]=wrapped;
});

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV98Boot,{once:true});else cyV98Boot();
