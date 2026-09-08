// v0.9.4 live: home = opportunity list, former opportunity tab = result hub.
// Keeps all existing localStorage/Supabase keys untouched.
const CY_V94_VERSION='0.9.4-live';
const CY_V94_RESULT_FILTER_KEY='chungyack.result.category.v1';
let CY_V94_RESULT_FILTER=localStorage.getItem(CY_V94_RESULT_FILTER_KEY)||'check';
let CY_V94_RECOMMEND_NODES=null;

function cyV94Esc(v){return typeof cyV93Esc==='function'?cyV93Esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cyV94Category(x){try{return typeof cyV93Category==='function'?cyV93Category(x):'active'}catch{return 'active'}}
function cyV94Meta(cat){return ({check:['🔎','확인 필요'],selected:['✅','합격·예비'],rejected:['⛔','탈락']}[cat]||['•','결과'])}
function cyV94Milestone(x){try{return typeof cyV93Milestone==='function'?cyV93Milestone(x):null}catch{return null}}
function cyV94Verification(x){try{return typeof cyV93Verification==='function'?cyV93Verification(x):null}catch{return null}}

function cyV94CaptureRecommendationPage(){
  if(CY_V94_RECOMMEND_NODES)return;
  const recommend=document.querySelector('.page[data-page="recommend"]');
  if(!recommend)return;
  CY_V94_RECOMMEND_NODES=[...recommend.childNodes];
}

function cyV94MoveOpportunitiesHome(){
  const home=document.querySelector('.page[data-page="home"]');
  const recommend=document.querySelector('.page[data-page="recommend"]');
  if(!home||!recommend)return;
  cyV94CaptureRecommendationPage();
  home.replaceChildren(...CY_V94_RECOMMEND_NODES);
  home.dataset.cyV94='opportunities';

  const head=home.querySelector('.section-head h2');if(head)head.textContent='공고';
  const sub=home.querySelector('.section-head small');if(sub)sub.textContent='찜 · 신청 · 숨김으로 빠르게 정리';
}

function cyV94ResultCounts(){
  const out={check:0,selected:0,rejected:0};
  (Array.isArray(TRACKING)?TRACKING:[]).forEach(x=>{const c=cyV94Category(x);if(out[c]!==undefined)out[c]++});
  return out;
}

function cyV94ResultNote(x,cat){
  const v=cyV94Verification(x),m=cyV94Milestone(x);
  if(v?.state==='found')return v.note||'공식 결과에서 확인됨';
  if(v?.state==='not_found'&&v?.final===true)return v.note||'최종 결과에서 확인되지 않음';
  if(v?.state==='not_found')return v.note||'명단에서 찾지 못했지만 최종 탈락으로 확정하지 않음';
  if(v?.state==='unavailable')return v.note||'공개 명단 조회가 없어 직접 확인 필요';
  if(cat==='check'&&m?.result?.label)return `${m.result.label} 확인 필요`;
  if(cat==='selected')return '합격 또는 예비 상태';
  if(cat==='rejected')return '탈락 또는 부적격으로 확인됨';
  return '';
}

function cyV94ResultCard(x){
  const cat=cyV94Category(x),meta=cyV94Meta(cat),m=cyV94Milestone(x),v=cyV94Verification(x);
  let resultAt='';
  if(m?.result?.at){
    try{resultAt=typeof cyV87FmtAt==='function'?cyV87FmtAt(m.result.at):String(m.result.at)}catch{resultAt=String(m.result.at)}
  }
  const checked=v?.checkedAt?String(v.checkedAt).replace('T',' ').slice(0,16):'';
  const note=cyV94ResultNote(x,cat);
  return `<article class="cy-v94-result-card ${cat}">
    <div class="cy-v94-result-top"><span class="cy-v94-result-state ${cat}">${meta[0]} ${meta[1]}</span>${checked?`<small>확인 ${cyV94Esc(checked)}</small>`:''}</div>
    <strong>${cyV94Esc(x?.name||'')}</strong>
    ${resultAt?`<div class="cy-v94-result-row"><small>${cyV94Esc(m?.result?.label||'결과 발표')}</small><b>${cyV94Esc(resultAt)}</b></div>`:''}
    ${note?`<p>${cyV94Esc(note)}</p>`:''}
    ${cat==='check'?'<div class="cy-v94-result-hint">공개 명단·문자·이메일·공식 발표를 확인하기 전에는 탈락으로 보내지 않습니다.</div>':''}
  </article>`;
}

function cyV94RenderResults(){
  const page=document.querySelector('.page[data-page="recommend"]');if(!page)return;
  const counts=cyV94ResultCounts();
  if(!['check','selected','rejected'].includes(CY_V94_RESULT_FILTER))CY_V94_RESULT_FILTER='check';
  const rows=(Array.isArray(TRACKING)?TRACKING:[]).filter(x=>cyV94Category(x)===CY_V94_RESULT_FILTER);
  const defs=[['check','확인 필요'],['selected','합격·예비'],['rejected','탈락']];
  page.innerHTML=`
    <div class="section-head cy-v94-result-head"><h2>결과 확인</h2><small>신청 결과만 따로 모아보기</small></div>
    <div class="cy-v94-result-tabs">${defs.map(([id,label])=>`<button type="button" data-cy-v94-result="${id}" class="${CY_V94_RESULT_FILTER===id?'on':''}"><span>${label}</span><b>${counts[id]}</b></button>`).join('')}</div>
    <div class="cy-v94-result-summary">결과 발표가 지났거나 결과가 확인된 신청만 이 화면에 모입니다.</div>
    <div class="cy-v94-result-list">${rows.length?rows.map(cyV94ResultCard).join(''):`<div class="empty">${CY_V94_RESULT_FILTER==='check'?'지금 확인할 결과가 없습니다.':'이 분류에 들어간 결과가 없습니다.'}</div>`}</div>`;
  page.querySelectorAll('[data-cy-v94-result]').forEach(btn=>btn.addEventListener('click',()=>{
    CY_V94_RESULT_FILTER=btn.dataset.cyV94Result;
    localStorage.setItem(CY_V94_RESULT_FILTER_KEY,CY_V94_RESULT_FILTER);
    cyV94RenderResults();
  }));
}

function cyV94RenderApplications(){
  const page=document.querySelector('.page[data-page="tracking"]');
  const grid=document.getElementById('trackingGridMirror');
  if(!page||!grid)return;
  document.getElementById('cyV93TrackTabs')?.remove();
  const head=page.querySelector('.section-head h2');if(head)head.textContent='내 신청';
  const sub=page.querySelector('.section-head small');if(sub)sub.textContent='접수 이후 서류 · 계약 · 입주 진행 관리';
  const rows=(Array.isArray(TRACKING)?TRACKING:[]).filter(x=>cyV94Category(x)==='active');
  if(typeof cyV93TrackCard==='function')grid.innerHTML=rows.length?rows.map(cyV93TrackCard).join(''):'<div class="empty">진행 중인 신청이 없습니다.<br>결과가 나온 신청은 결과 탭에서 확인하세요.</div>';
}

function cyV94Static(){
  const homeNav=document.querySelector('.nav-btn[data-page="home"]');if(homeNav)homeNav.innerHTML='<b>⌂</b>홈';
  const resultNav=document.querySelector('.nav-btn[data-page="recommend"]');if(resultNav)resultNav.innerHTML='<b>◎</b>결과';
  const applyNav=document.querySelector('.nav-btn[data-page="tracking"]');if(applyNav)applyNav.innerHTML='<b>✓</b>신청';
  const favNav=document.querySelector('.nav-btn[data-page="schedule"]');if(favNav)favNav.innerHTML='<b>♥</b>찜';
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V94_VERSION;
  const sv=document.getElementById('settingsVersion');if(sv)sv.textContent=CY_V94_VERSION;
  const hero=document.querySelector('.brand p');if(hero)hero.textContent='공고 확인 · 신청 결과 · 찜 관리';
}

function cyV94Refresh(){
  cyV94MoveOpportunitiesHome();
  cyV94RenderResults();
  cyV94RenderApplications();
  cyV94Static();
}

// Stop the old "지금 볼 것" renderer from rebuilding a separate home feed.
if(typeof renderHourlyReport==='function'){
  renderHourlyReport=function(report){
    try{CY_V82_HOURLY_REPORT=report}catch{}
    try{if(typeof renderRecommendations==='function'&&typeof CY_OPPORTUNITY_DATA!=='undefined'&&CY_OPPORTUNITY_DATA)renderRecommendations()}catch(e){console.warn('[ChungYack] opportunity refresh failed',e)}
    cyV94Refresh();
  };
}

if(typeof renderTracking==='function'&&!renderTracking.__cyV94Wrapped){
  const base=renderTracking;
  const wrapped=function(){const out=base.apply(this,arguments);setTimeout(()=>{cyV94RenderApplications();cyV94RenderResults();cyV94Static()},0);return out};
  wrapped.__cyV94Wrapped=true;renderTracking=wrapped;
}
if(typeof renderRecommendations==='function'&&!renderRecommendations.__cyV94Wrapped){
  const base=renderRecommendations;
  const wrapped=function(){const out=base.apply(this,arguments);cyV94MoveOpportunitiesHome();cyV94Static();return out};
  wrapped.__cyV94Wrapped=true;renderRecommendations=wrapped;
}
if(typeof renderHero==='function'&&!renderHero.__cyV94Wrapped){const base=renderHero;const wrapped=function(){const out=base.apply(this,arguments);cyV94Static();return out};wrapped.__cyV94Wrapped=true;renderHero=wrapped}
if(typeof renderSettings==='function'&&!renderSettings.__cyV94Wrapped){const base=renderSettings;const wrapped=function(){const out=base.apply(this,arguments);cyV94Static();return out};wrapped.__cyV94Wrapped=true;renderSettings=wrapped}
if(typeof saveTracking==='function'&&!saveTracking.__cyV94Wrapped){const base=saveTracking;const wrapped=function(){const out=base.apply(this,arguments);setTimeout(cyV94Refresh,0);return out};wrapped.__cyV94Wrapped=true;saveTracking=wrapped}

function cyV94Boot(){
  cyV94CaptureRecommendationPage();
  cyV94Refresh();
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(e){console.warn('[ChungYack] home opportunity render failed',e)}
  setTimeout(cyV94Refresh,700);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV94Boot,{once:true});else setTimeout(cyV94Boot,0);
