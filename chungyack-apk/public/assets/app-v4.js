// v0.4 current-opportunity layer.
// SH 국민임대 카탈로그를 기본 공고 화면에서 내리고, 최신 검토 공고/자격판정 중심으로 전환한다.
let CY_OPPORTUNITY_DATA=null;
let CY_OPPORTUNITY_FILTER={level:'action',agency:'',search:''};

function cyV4MapUrl(address){return 'https://map.naver.com/p/search/'+encodeURIComponent(address||'')}
function cyV4Level(item){
  const level=item?.eligibility?.level||'review';
  if(level==='impossible')return 'impossible';
  if((item?.eligibility?.title||'').includes('보류'))return 'hold';
  if(level==='conditional')return 'conditional';
  return 'action';
}
function cyV4EligibilityHtml(item){
  const x=item?.eligibility;
  if(!x)return '';
  const level=cyV4Level(item);
  return `<div class="cy-v4-eligibility cy-v4-${level}"><b>${esc(x.title||'⚠️ 내 조건 판정')}</b>${x.reason?`<div class="cy-v4-reason">${esc(x.reason)}</div>`:''}${x.check?`<div class="cy-v4-check"><b>다시 볼 조건:</b> ${esc(x.check)}</div>`:''}</div>`;
}
function cyV4AddressesHtml(item){
  const list=Array.isArray(item?.addresses)?item.addresses.filter(Boolean):[];
  if(!list.length)return '<div class="cy-v4-no-map">정확한 공급주택 주소 확인 전 · 추정 지도핀 없음</div>';
  if(list.length===1)return `<div class="cy-v4-address">${esc(list[0])} <a href="${cyV4MapUrl(list[0])}" target="_blank" rel="noopener">지도</a></div>`;
  return `<details class="cy-v4-addresses"><summary>정확주소 ${list.length}곳</summary>${list.map(a=>`<div>${esc(a)} <a href="${cyV4MapUrl(a)}" target="_blank" rel="noopener">지도</a></div>`).join('')}</details>`;
}
function cyV4OpportunityCard(item){
  const level=cyV4Level(item);
  const canTrack=level!=='impossible'&&level!=='hold';
  return `<article class="cy-v4-card ${level}">
    <div class="cy-v4-head"><div class="cy-v4-status">${esc(item.status||'')}</div><div><div class="cy-v4-agency">${esc(item.agency||'')}</div><div class="cy-v4-name">${esc(item.name||'')}</div><div class="cy-v4-sub">${esc(item.category||'')} · ${esc(item.region||'')}</div></div></div>
    <div class="cy-v4-metrics"><div><span>접수</span><b>${esc(item.period||'-')}</b></div><div><span>모집</span><b>${esc(item.units||'-')}</b></div></div>
    ${cyV4EligibilityHtml(item)}
    <div class="cy-v4-next"><b>다음 확인</b><div>${esc(item.next||'-')}</div></div>
    ${cyV4AddressesHtml(item)}
    <div class="cy-v4-actions"><a class="btn" href="${esc(item.source||'#')}" target="_blank" rel="noopener">공식 공고</a>${canTrack?`<button class="btn primary-lite cy-v4-track" data-opportunity-id="${esc(item.id)}">신청했음 → 추적 추가</button>`:''}</div>
  </article>`;
}
function cyV4FilteredItems(){
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  const q=CY_OPPORTUNITY_FILTER.search.trim().toLowerCase();
  return items.filter(item=>{
    const level=cyV4Level(item);
    if(CY_OPPORTUNITY_FILTER.level!=='all'&&level!==CY_OPPORTUNITY_FILTER.level)return false;
    if(CY_OPPORTUNITY_FILTER.agency&&item.agency!==CY_OPPORTUNITY_FILTER.agency)return false;
    if(q&&!`${item.name} ${item.region} ${item.category} ${item.agency}`.toLowerCase().includes(q))return false;
    return true;
  });
}
function cyV4ToolbarHtml(){
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  const agencies=[...new Set(items.map(x=>x.agency).filter(Boolean))];
  return `<div class="cy-v4-toolbar">
    <div class="cy-v4-filter-buttons">
      <button data-cy-level="action" class="${CY_OPPORTUNITY_FILTER.level==='action'?'on':''}">검토 후보</button>
      <button data-cy-level="conditional" class="${CY_OPPORTUNITY_FILTER.level==='conditional'?'on':''}">조건부</button>
      <button data-cy-level="hold" class="${CY_OPPORTUNITY_FILTER.level==='hold'?'on':''}">보류</button>
      <button data-cy-level="impossible" class="${CY_OPPORTUNITY_FILTER.level==='impossible'?'on':''}">절대 불가</button>
      <button data-cy-level="all" class="${CY_OPPORTUNITY_FILTER.level==='all'?'on':''}">전체</button>
    </div>
    <div class="cy-v4-controls"><select id="cyV4Agency"><option value="">기관 전체</option>${agencies.map(a=>`<option ${CY_OPPORTUNITY_FILTER.agency===a?'selected':''}>${esc(a)}</option>`).join('')}</select><input id="cyV4Search" value="${esc(CY_OPPORTUNITY_FILTER.search)}" placeholder="공고·지역 검색"></div>
  </div>`;
}
function cyV4PassHtml(){
  const passes=Array.isArray(CY_OPPORTUNITY_DATA?.passes)?CY_OPPORTUNITY_DATA.passes:[];
  if(!passes.length)return '';
  return `<div class="cy-v4-pass-list">${passes.map(x=>`<div>❌ <b>${esc(x.name)}</b> — ${esc(x.period||'')} — ${esc(x.reason||'사용자 판단으로 패스')}</div>`).join('')}</div>`;
}
function renderRecommendations(){
  const list=document.getElementById('recommendList');
  if(!list)return;
  if(!CY_OPPORTUNITY_DATA){list.innerHTML='<div class="empty">현재 공고 데이터 불러오는 중…</div>';return;}
  const rows=cyV4FilteredItems();
  list.innerHTML=`${cyV4ToolbarHtml()}<div class="cy-v4-summary"><div>현재 표시 <b>${rows.length}</b></div><div>검토 후보 <b>${CY_OPPORTUNITY_DATA.items.filter(x=>cyV4Level(x)==='action').length}</b></div><div>조건부 <b>${CY_OPPORTUNITY_DATA.items.filter(x=>cyV4Level(x)==='conditional').length}</b></div></div>${CY_OPPORTUNITY_DATA.notice?`<div class="cy-v4-notice">${esc(CY_OPPORTUNITY_DATA.notice)}</div>`:''}<div class="cy-v4-list">${rows.length?rows.map(cyV4OpportunityCard).join(''):'<div class="empty">현재 필터에 맞는 공고가 없습니다.</div>'}</div>${cyV4PassHtml()}`;
  if(document.getElementById('recommendCount'))document.getElementById('recommendCount').textContent=rows.length;
  document.querySelectorAll('[data-cy-level]').forEach(b=>b.addEventListener('click',()=>{CY_OPPORTUNITY_FILTER.level=b.dataset.cyLevel;renderRecommendations()}));
  const agency=document.getElementById('cyV4Agency');if(agency)agency.addEventListener('change',()=>{CY_OPPORTUNITY_FILTER.agency=agency.value;renderRecommendations()});
  const search=document.getElementById('cyV4Search');if(search)search.addEventListener('input',()=>{CY_OPPORTUNITY_FILTER.search=search.value;renderRecommendations()});
  document.querySelectorAll('.cy-v4-track').forEach(b=>b.addEventListener('click',()=>cyV4AddTracking(b.dataset.opportunityId)));
}
function cyV4AddTracking(id){
  const item=CY_OPPORTUNITY_DATA?.items?.find(x=>x.id===id);if(!item)return;
  const stableId=`opportunity-${id}`;
  const existing=TRACKING.find(x=>x.id===stableId);if(existing){openTrackEditor(existing);return;}
  openTrackEditor({id:stableId,name:item.name,type:item.category||'',appliedAt:new Date().toISOString().slice(0,10),status:'신청완료',next:item.next||'',detail:`${item.units||''} · ${item.period||''}`,address:(item.addresses||[])[0]||''});
}
function cyV4SetupPage(){
  const page=document.querySelector('.page[data-page="recommend"]');
  if(page){
    const head=page.querySelector('.section-head h2');if(head)head.textContent='현재 검토 공고';
    const small=page.querySelector('.section-head small');if(small)small.textContent='내 조건 판정 · 일정 · 공식링크';
    page.querySelector('.filter-card')?.classList.add('cy-v4-legacy-hidden');
    page.querySelector('.summary')?.classList.add('cy-v4-legacy-hidden');
  }
  const home=document.querySelector('.page[data-page="home"]');
  if(home){
    const heads=[...home.querySelectorAll('.section-head')];
    const old=heads.find(x=>x.textContent.includes('과거 SH 국민임대 평균 경쟁률'));
    if(old){old.classList.add('cy-v4-legacy-hidden');old.nextElementSibling?.classList.add('cy-v4-legacy-hidden')}
  }
}
async function cyV4LoadOpportunities(){
  try{
    const res=await fetch('data/current-opportunities.json?ts='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    CY_OPPORTUNITY_DATA=await res.json();
    renderRecommendations();
  }catch(e){
    console.error('current opportunities load failed',e);
    const list=document.getElementById('recommendList');if(list)list.innerHTML=`<div class="empty">현재 공고 데이터를 불러오지 못했습니다. ${esc(e.message)}</div>`;
  }
}
window.addEventListener('DOMContentLoaded',()=>{cyV4SetupPage();cyV4LoadOpportunities()});
