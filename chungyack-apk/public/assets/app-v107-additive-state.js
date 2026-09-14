// v0.10.7 live: 찜/신청/결과는 서로 배타적인 '이동'이 아니라 중첩되는 상태입니다.
const CY_V107_VERSION='0.10.7-live';
window.CY_LATEST_VERSION=CY_V107_VERSION;

function cyV107Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V107_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V107_VERSION;
}
function cyV107ApplicationRows(){
  return (Array.isArray(TRACKING)?TRACKING:[]).filter(x=>x?.status!=='취소/추적중단');
}
function cyV107RenderApplications(){
  const page=document.querySelector('.page[data-page="tracking"]');
  const grid=document.getElementById('trackingGridMirror');
  if(!page||!grid)return;
  document.getElementById('cyV93TrackTabs')?.remove();
  const head=page.querySelector('.section-head h2');if(head)head.textContent='내 신청';
  const sub=page.querySelector('.section-head small');if(sub)sub.textContent='신청 기록은 결과가 나와도 여기서 계속 유지';
  const rows=cyV107ApplicationRows();
  if(typeof cyV93TrackCard==='function')grid.innerHTML=rows.length?rows.map(cyV93TrackCard).join(''):'<div class="empty">신청 기록이 없습니다.</div>';
  cyV107Stamp();
}

// 결과 탭은 신청 기록의 추가 분류 화면일 뿐, 신청 탭에서 항목을 제거하지 않습니다.
window.cyV94RenderApplications=cyV107RenderApplications;

// 찜은 별도 복사 보기입니다. 찜 여부는 현재 접수중인 공고의 홈 표시 여부를 바꾸지 않습니다.
// 홈 제외 조건은 명시적 숨김 또는 접수기간 만료뿐이며, v0.10.6 필터가 이를 담당합니다.

function cyV107Refresh(){
  try{cyV107RenderApplications()}catch(e){console.warn('[ChungYack] additive application refresh failed',e)}
  try{if(typeof cyV90RenderFavorites==='function')cyV90RenderFavorites()}catch{}
  try{if(typeof cyV94RenderResults==='function')cyV94RenderResults()}catch{}
  cyV107Stamp();
}

['renderTracking','saveTracking'].forEach(name=>{
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV107Wrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);setTimeout(cyV107Refresh,0);return out};
  wrapped.__cyV107Wrapped=true;window[name]=wrapped;
});
if(typeof cyV7ToggleSaved==='function'&&!cyV7ToggleSaved.__cyV107Wrapped){
  const base=cyV7ToggleSaved;
  const wrapped=function(){const view=typeof CY_V7_VIEW!=='undefined'?CY_V7_VIEW:null;const out=base.apply(this,arguments);if(view!==null&&typeof CY_V7_VIEW!=='undefined')CY_V7_VIEW=view;setTimeout(()=>{try{if(typeof renderRecommendations==='function')renderRecommendations()}catch{}try{if(typeof cyV90RenderFavorites==='function')cyV90RenderFavorites()}catch{}cyV107Stamp()},0);return out};
  wrapped.__cyV107Wrapped=true;cyV7ToggleSaved=wrapped;
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(cyV107Refresh,0),{once:true});else setTimeout(cyV107Refresh,0);
