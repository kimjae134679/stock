// v0.8.1 live visual layer — approved mockup-inspired list/card hierarchy.
const CY_V8_VERSION='0.8.1-live';

function cyV8Level(item){return typeof cyV4Level==='function'?cyV4Level(item):'action'}
function cyV8LevelLabel(level){return {action:'검토',conditional:'조건부',hold:'보류',impossible:'불가'}[level]||'검토'}
function cyV8StateText(item){
  const raw=(item?.eligibility?.title||item?.status||cyV8LevelLabel(cyV8Level(item))).replace(/^[\s🔥🟢🟠⚠️🔵🔴⏰✅🎯📄🏠⏸❌]+/u,'').trim();
  return raw||cyV8LevelLabel(cyV8Level(item));
}
function cyV8GroupTone(title=''){
  const s=String(title);
  if(/오늘|마감|24/.test(s))return 'tone-red';
  if(/2\s*~\s*3|2~3|2-3/.test(s))return 'tone-orange';
  if(/4\s*~\s*7|4~7|4-7/.test(s))return 'tone-blue';
  if(/이후|예정|신청/.test(s))return 'tone-green';
  return '';
}
function cyV8AgencyChip(item){
  const agency=String(item?.agency||'').trim();
  if(!agency)return '';
  const cls=/LH|SH|서울/.test(agency)?'blue':'';
  return `<span class="cy-v8-chip ${cls}">${esc(agency)}</span>`;
}
function cyV8CategoryChip(item){
  const c=String(item?.category||'').trim();
  if(!c)return '';
  const cls=/청년|행복/.test(c)?'green':'';
  return `<span class="cy-v8-chip ${cls}">${esc(c)}</span>`;
}
function cyV8Address(item){
  const arr=Array.isArray(item?.addresses)?item.addresses.filter(Boolean):[];
  if(!arr.length)return '';
  const extra=arr.length>1?` 외 ${arr.length-1}곳`:'';
  return `<div class="cy-v8-detail-row"><span class="cy-v8-detail-icon">⌖</span><span class="cy-v8-address">${esc(arr[0])}${esc(extra)}</span></div>`;
}
function cyV8Card(item){
  const level=cyV8Level(item);
  const saved=CY_V7_SAVED.has(item.id);
  const hidden=CY_V7_HIDDEN.has(item.id);
  const tracked=cyV7IsTracked(item);
  const canTrack=level!=='impossible'&&level!=='hold';
  const reason=item?.eligibility?.reason||'';
  const stateTitle=cyV8StateText(item);
  return `<article class="cy-v8-card ${level}${saved?' is-saved':''}${hidden?' is-hidden':''}">
    <div class="cy-v8-card-head">
      <div class="cy-v8-card-main">
        <div class="cy-v8-chip-row"><span class="cy-v8-chip state ${level}">● ${esc(stateTitle)}</span>${cyV8AgencyChip(item)}${cyV8CategoryChip(item)}</div>
        <h3 class="cy-v8-title">${esc(item.name||'')}</h3>
        <div class="cy-v8-meta">${esc(item.region||'')}${item.agency?` · ${esc(item.agency)}`:''}${item.category?` · ${esc(item.category)}`:''}</div>
      </div>
      <button class="cy-v8-hide" data-cy-v8-hide="${esc(item.id)}">${hidden?'복원':'숨기기'}</button>
    </div>
    <div class="cy-v8-facts">
      <div class="cy-v8-fact"><span>▣ 접수 기간</span><b>${esc(item.period||'-')}</b></div>
      <div class="cy-v8-fact"><span>♟ 모집</span><b>${esc(item.units||'-')}</b></div>
    </div>
    ${item?.eligibility?`<div class="cy-v8-statebox ${level}"><div class="cy-v8-state-title">${esc(item.eligibility.title||'내 조건 확인')}</div>${reason?`<p>${esc(reason)}</p>`:''}</div>`:''}
    ${item.next?`<div class="cy-v8-detail-row deadline"><span class="cy-v8-detail-icon">◷</span><span>다음 <strong>${esc(item.next)}</strong></span></div>`:''}
    ${cyV8Address(item)}
    <div class="cy-v8-actions">
      <button class="btn cy-v8-save${saved?' on':''}" data-cy-v8-save="${esc(item.id)}">${saved?'★ 저장됨':'☆ 저장'}</button>
      ${item.source?`<a class="btn" href="${esc(item.source)}" target="_blank" rel="noopener">▤ 공식 공고</a>`:'<span></span>'}
      ${canTrack?`<button class="btn cy-v8-track${tracked?' on':''}" data-opportunity-id="${esc(item.id)}">${tracked?'✓ 신청함 · 추적중':'✓ 신청했음 → 추적'}</button>`:'<span></span>'}
    </div>
  </article>`;
}
function cyV8Toolbar(rows){
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  const savedCount=items.filter(x=>CY_V7_SAVED.has(x.id)&&!CY_V7_HIDDEN.has(x.id)).length;
  const trackedCount=items.filter(x=>cyV7IsTracked(x)&&!CY_V7_HIDDEN.has(x.id)).length;
  const hiddenCount=items.filter(x=>CY_V7_HIDDEN.has(x.id)).length;
  const labels={active:'현재 표시',saved:'저장한 공고',tracked:'신청 추적중',hidden:'숨긴 공고'};
  return `<div class="cy-v8-toolbar">
    <div class="cy-v8-view-row">
      <button class="cy-v8-view ${CY_V7_VIEW==='active'?'active':''}" data-cy-v8-view="active">전체 공고 ${items.filter(x=>!CY_V7_HIDDEN.has(x.id)).length}</button>
      <button class="cy-v8-view ${CY_V7_VIEW==='saved'?'active':''}" data-cy-v8-view="saved">★ 저장 ${savedCount}</button>
      <button class="cy-v8-view ${CY_V7_VIEW==='tracked'?'active':''}" data-cy-v8-view="tracked">✓ 추적중 ${trackedCount}</button>
      <button class="cy-v8-view ${CY_V7_VIEW==='hidden'?'active':''}" data-cy-v8-view="hidden">◉ 숨김 ${hiddenCount}</button>
    </div>
    ${CY_V7_VIEW==='active'?`<div class="cy-v8-level-row">
      <button class="cy-v8-level ${CY_V7_LEVEL==='action'?'on':''}" data-cy-v8-level="action">검토</button>
      <button class="cy-v8-level ${CY_V7_LEVEL==='conditional'?'on':''}" data-cy-v8-level="conditional">조건부</button>
      <button class="cy-v8-level ${CY_V7_LEVEL==='hold'?'on':''}" data-cy-v8-level="hold">보류</button>
      <button class="cy-v8-level ${CY_V7_LEVEL==='impossible'?'on':''}" data-cy-v8-level="impossible">불가</button>
      <button class="cy-v8-level ${CY_V7_LEVEL==='all'?'on':''}" data-cy-v8-level="all">전체</button>
    </div>`:''}
    <div class="cy-v8-search-wrap"><div class="cy-v8-search"><input id="cyV8Search" value="${esc(CY_V7_SEARCH)}" placeholder="공고명, 지역, 기관명으로 검색"></div>${CY_V7_VIEW==='hidden'?`<button class="cy-v8-clear" ${hiddenCount?'':'disabled'}>모두 복원</button>`:''}</div>
    <div class="cy-v8-result">${labels[CY_V7_VIEW]} <b>${rows.length}</b>개</div>
  </div>`;
}

renderRecommendations=function(){
  const list=document.getElementById('recommendList');if(!list)return;
  if(!CY_OPPORTUNITY_DATA){list.innerHTML='<div class="empty">현재 공고 데이터 불러오는 중…</div>';return;}
  const rows=cyV7Items();
  list.innerHTML=`${cyV8Toolbar(rows)}<div class="cy-v8-list">${rows.length?rows.map(cyV8Card).join(''):'<div class="empty">표시할 공고가 없습니다.</div>'}</div>`;
  const count=document.getElementById('recommendCount');if(count)count.textContent=rows.length;
  document.querySelectorAll('[data-cy-v8-level]').forEach(b=>b.addEventListener('click',()=>{CY_V7_LEVEL=b.dataset.cyV8Level||'action';renderRecommendations()}));
  document.querySelectorAll('[data-cy-v8-view]').forEach(b=>b.addEventListener('click',()=>cyV7SetView(b.dataset.cyV8View)));
  document.querySelectorAll('[data-cy-v8-save]').forEach(b=>b.addEventListener('click',()=>cyV7ToggleSaved(b.dataset.cyV8Save)));
  document.querySelectorAll('[data-cy-v8-hide]').forEach(b=>b.addEventListener('click',()=>cyV7ToggleHidden(b.dataset.cyV8Hide)));
  document.querySelectorAll('.cy-v8-track').forEach(b=>b.addEventListener('click',()=>cyV4AddTracking(b.dataset.opportunityId)));
  const q=document.getElementById('cyV8Search');if(q)q.addEventListener('input',()=>{
    const value=q.value;CY_V7_SEARCH=value;renderRecommendations();
    const fresh=document.getElementById('cyV8Search');if(fresh){fresh.focus({preventScroll:true});fresh.setSelectionRange(value.length,value.length)}
  });
  const clear=document.querySelector('.cy-v8-clear');if(clear)clear.addEventListener('click',cyV7ClearHidden);
};

renderHourlyReport=function(report){
  const home=document.querySelector('.page[data-page="home"]');if(!home)return;
  let root=document.getElementById('hourlyReport');
  if(!root){root=document.createElement('section');root.id='hourlyReport';root.className='hourly-report cy-v8-hourly';home.insertBefore(root,home.firstChild)}
  root.className='hourly-report cy-v8-hourly';
  const groups=(Array.isArray(report?.groups)?report.groups:[]).map(g=>({...g,items:Array.isArray(g.items)?g.items:[]})).filter(g=>g.items.length);
  const updated=report?.updatedAt?new Date(report.updatedAt).toLocaleString('ko-KR'):'-';
  root.innerHTML=`<div class="cy-v8-hourly-head"><h2>지금 볼 것</h2><small>${updated}</small></div>${groups.length?`<div class="cy-v8-groups">${groups.map(g=>`<section class="cy-v8-group ${cyV8GroupTone(g.title)}"><div class="cy-v8-group-head"><span class="dot"></span><b>${esc(g.icon||'')} ${esc(g.title||'')}</b><em>${g.items.length}개</em></div>${g.items.map(x=>`<div class="cy-v8-hourly-item"><strong>${esc(x.name||'')}</strong><span>${esc(x.status||'')}</span></div>`).join('')}</section>`).join('')}</div>`:'<div class="empty">현재 바로 확인할 항목이 없습니다.</div>'}`;
};

const _cyV8RenderHero=renderHero;
renderHero=function(){_cyV8RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V8_VERSION};
const _cyV8RenderSettings=renderSettings;
renderSettings=function(){_cyV8RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V8_VERSION};

if(document.readyState!=='loading'){
  try{if(typeof CY_OPPORTUNITY_DATA!=='undefined'&&CY_OPPORTUNITY_DATA)renderRecommendations()}catch{}
}
