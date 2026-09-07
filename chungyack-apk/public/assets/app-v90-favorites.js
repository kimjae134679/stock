// v0.9.0 live: Favorites-first navigation and compact status actions.
const CY_V90_VERSION='0.9.0-live';

function cyV90Esc(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cyV90Tracked(item){return typeof cyV7IsTracked==='function'&&cyV7IsTracked(item)}
function cyV90Saved(item){return !!(item&&typeof CY_V7_SAVED!=='undefined'&&CY_V7_SAVED.has(item.id))}
function cyV90Hidden(item){return !!(item&&typeof CY_V7_HIDDEN!=='undefined'&&CY_V7_HIDDEN.has(item.id))}
function cyV90Priority(item){return (cyV90Tracked(item)?4:0)+(cyV90Saved(item)?2:0)}

function cyV90RenameStaticText(root=document){
  const brand=root.querySelector?.('.brand p');if(brand)brand.textContent='관심 공고 찜 · 신청 표시 · 자동 동기화';
  const recHead=root.querySelector?.('.page[data-page="recommend"] .section-head small');if(recHead)recHead.textContent='찜 · 추적 · 숨기기';
  const homeNotice=root.querySelector?.('.page[data-page="home"] .notice');if(homeNotice)homeNotice.textContent=homeNotice.textContent.replace(/저장/g,'찜');
  const schedule=root.querySelector?.('.page[data-page="schedule"]');
  if(schedule){
    const h=schedule.querySelector('.section-head h2');if(h)h.textContent='찜한 공고';
    const s=schedule.querySelector('.section-head small');if(s)s.textContent='찜한 공고 · 추적 중 우선';
  }
  const nav=root.querySelector?.('.nav-btn[data-page="schedule"]');if(nav)nav.innerHTML='<b>♥</b>찜';
  root.querySelectorAll?.('.settings-list .setting').forEach(box=>{
    const b=box.querySelector('b'),p=box.querySelector('p');
    if(b?.textContent.trim()==='공고 저장')b.textContent='공고 찜';
    if(p){
      p.textContent=p.textContent
        .replace(/저장한 공고/g,'찜한 공고')
        .replace(/별표로 저장/g,'하트로 찜')
        .replace(/저장 상태/g,'찜 상태')
        .replace(/저장·숨김·추적/g,'찜·숨김·추적')
        .replace(/필터·저장·숨김/g,'필터·찜·숨김');
    }
  });
  root.querySelectorAll?.('button,a,small,strong,span').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(t==='★ 저장')el.textContent='♥ 찜';
    else if(t==='☆ 저장')el.textContent='♡ 찜';
    else if(t==='★ 저장됨')el.textContent='♥ 찜';
    else if(t==='저장 해제')el.textContent='찜 해제';
    else if(t==='저장')el.textContent='찜';
    else if(t==='저장한 공고')el.textContent='찜한 공고';
  });
}

function cyV90Finance(item){
  try{return typeof cyV84Finance==='function'?cyV84Finance(item):null}catch{return null}
}
function cyV90FavoriteCard(item){
  const tracked=cyV90Tracked(item),hidden=cyV90Hidden(item),f=cyV90Finance(item);
  const result=typeof cyV82ResultSchedule==='function'?cyV82ResultSchedule(item):'';
  return `<article class="cy-v90-fav-card${tracked?' is-tracked':''}${hidden?' is-hidden':''}" data-cy-v90-fav="${cyV90Esc(item.id)}">
    <button type="button" class="cy-v90-fav-main" data-cy-v90-open="${cyV90Esc(item.id)}">
      <div class="cy-v90-fav-top">
        <div class="cy-v90-fav-flags"><span class="cy-v90-flag heart">♥ 찜</span>${tracked?'<span class="cy-v90-flag track">✓ 추적</span>':''}${hidden?'<span class="cy-v90-flag hidden">◌ 숨김</span>':''}</div>
        <span class="cy-v90-chevron">›</span>
      </div>
      <h3>${cyV90Esc(item.name||'')}</h3>
      <p class="cy-v90-fav-meta">${cyV90Esc([item.region,item.agency,item.category].filter(Boolean).join(' · '))}</p>
      <div class="cy-v90-fav-facts">
        <span><small>접수</small><b>${cyV90Esc(item.period||'-')}</b></span>
        <span><small>모집</small><b>${cyV90Esc(item.units||'-')}</b></span>
      </div>
      ${f?.summary?`<div class="cy-v90-fav-line">₩ ${cyV90Esc(f.summary)}</div>`:''}
      ${result?`<div class="cy-v90-fav-line result">◎ ${cyV90Esc(result)}</div>`:''}
    </button>
    <div class="cy-v90-fav-actions">
      <button type="button" class="cy-v90-icon-action heart on" data-cy-v90-unfavorite="${cyV90Esc(item.id)}" aria-label="찜 해제" title="찜 해제"><b>♥</b><small>찜</small></button>
      <button type="button" class="cy-v90-icon-action track${tracked?' on':''}" data-cy-v90-track="${cyV90Esc(item.id)}" aria-label="${tracked?'추적 수정':'추적 추가'}" title="${tracked?'추적 수정':'추적 추가'}"><b>${tracked?'✓':'＋'}</b><small>추적</small></button>
      ${item.source?`<a class="cy-v90-icon-action official" href="${cyV90Esc(item.source)}" target="_blank" rel="noopener" aria-label="공식 공고" title="공식 공고"><b>▤</b><small>공고</small></a>`:''}
      <button type="button" class="cy-v90-icon-action hide${hidden?' on':''}" data-cy-v90-hide="${cyV90Esc(item.id)}" aria-label="${hidden?'복구':'숨기기'}" title="${hidden?'복구':'숨기기'}"><b>${hidden?'↩':'◌'}</b><small>${hidden?'복구':'숨김'}</small></button>
    </div>
  </article>`;
}
function cyV90RenderFavorites(){
  const list=document.getElementById('scheduleList');if(!list)return;
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  const rows=items.filter(cyV90Saved).map((item,index)=>({item,index,p:cyV90Priority(item)})).sort((a,b)=>b.p-a.p||a.index-b.index).map(x=>x.item);
  list.className='cy-v90-favorites';
  list.innerHTML=rows.length?rows.map(cyV90FavoriteCard).join(''):'<div class="cy-v90-empty"><b>♡ 아직 찜한 공고가 없어</b><span>공고에서 하트를 누르면 여기에 모여.</span></div>';
  list.querySelectorAll('[data-cy-v90-open]').forEach(b=>b.addEventListener('click',()=>{
    const item=items.find(x=>x.id===b.dataset.cyV90Open);if(item&&typeof cyV82OpenOpportunityCard==='function')cyV82OpenOpportunityCard(item);
  }));
  list.querySelectorAll('[data-cy-v90-unfavorite]').forEach(b=>b.addEventListener('click',()=>cyV7ToggleSaved(b.dataset.cyV90Unfavorite)));
  list.querySelectorAll('[data-cy-v90-track]').forEach(b=>b.addEventListener('click',()=>typeof cyV4AddTracking==='function'&&cyV4AddTracking(b.dataset.cyV90Track)));
  list.querySelectorAll('[data-cy-v90-hide]').forEach(b=>b.addEventListener('click',()=>cyV7ToggleHidden(b.dataset.cyV90Hide)));
}

function cyV90HomeRow(x){
  const opp=typeof cyV82FindOpportunity==='function'?cyV82FindOpportunity(x?.name||''):null;
  const saved=opp?cyV90Saved(opp):false,tracked=opp?cyV90Tracked(opp):false;
  const f=cyV90Finance(opp);
  const result=typeof cyV82ExtractResultText==='function'?cyV82ExtractResultText(x?.status||'',opp?.next,opp?.eligibility?.reason):'';
  const id=opp?.id||'';
  return `<div class="cy-v86-home-row cy-v90-home-row" data-cy-v83-home-name="${cyV90Esc(x?.name||'')}">
    <button type="button" class="cy-v86-home-open" data-cy-v83-home-open="${cyV90Esc(x?.name||'')}">
      <div class="cy-v86-home-title"><span class="cy-v86-dot">●</span><strong>${cyV90Esc(x?.name||'')}</strong><i>상세 ›</i></div>
      <div class="cy-v86-home-status">${cyV90Esc(x?.status||'')}</div>
      ${f?.summary?`<div class="cy-v86-home-finance">₩ ${cyV90Esc(f.summary)}</div>`:'<div class="cy-v86-home-finance muted">₩ 임대료 공고문 확인 필요</div>'}
      ${result?`<div class="cy-v86-home-result">◎ ${cyV90Esc(result)}</div>`:''}
    </button>
    <div class="cy-v86-home-actions cy-v90-home-actions">
      ${opp?`<button type="button" class="cy-v90-mini-action heart ${saved?'on':''}" data-cy-v86-save="${cyV90Esc(id)}" title="${saved?'찜 해제':'찜'}"><b>${saved?'♥':'♡'}</b><small>찜</small></button>`:'<span></span>'}
      ${opp?`<button type="button" class="cy-v90-mini-action track ${tracked?'on':''}" data-cy-v86-track="${cyV90Esc(id)}" title="${tracked?'추적 수정':'추적'}"><b>${tracked?'✓':'＋'}</b><small>추적</small></button>`:'<span></span>'}
      <button type="button" class="cy-v90-mini-action hide" data-cy-v83-home-hide="${cyV90Esc(x?.name||'')}" title="숨기기"><b>◌</b><small>숨김</small></button>
    </div>
  </div>`;
}

function cyV90PolishRecommendation(root=document.getElementById('recommendList')){
  if(!root)return;
  root.querySelectorAll('.cy-v8-save,.cy-v7-save').forEach(b=>{
    const on=b.classList.contains('on');b.innerHTML=`<b>${on?'♥':'♡'}</b><small>찜</small>`;b.setAttribute('aria-label',on?'찜 해제':'찜');
  });
  root.querySelectorAll('.cy-v8-track,.cy-v7-track').forEach(b=>{
    const on=b.classList.contains('on')||/추적중|신청함/.test(b.textContent||'');b.innerHTML=`<b>${on?'✓':'＋'}</b><small>추적</small>`;
  });
  root.querySelectorAll('.cy-v8-actions a.btn,.cy-v7-actions a.btn').forEach(a=>{if(/공식/.test(a.textContent||''))a.innerHTML='<b>▤</b><small>공고</small>'});
  root.querySelectorAll('[data-cy-v8-view],[data-cy-v7-view]').forEach(b=>{
    b.innerHTML=(b.innerHTML||'').replace(/★\s*저장/g,'♥ 찜').replace(/저장한 공고/g,'찜한 공고');
  });
}

if(typeof cyV7Items==='function'){
  const _cyV90BaseItems=cyV7Items;
  cyV7Items=function(){
    const rows=_cyV90BaseItems();
    return rows.map((item,index)=>({item,index,p:cyV90Priority(item)})).sort((a,b)=>b.p-a.p||a.index-b.index).map(x=>x.item);
  };
}

if(typeof cyV8Card==='function'){
  const _cyV90BaseCard=cyV8Card;
  cyV8Card=function(item){
    return _cyV90BaseCard(item)
      .replace(/★ 저장됨/g,'♥ 찜')
      .replace(/☆ 저장/g,'♡ 찜')
      .replace(/✓ 신청함 · 추적중/g,'✓ 추적')
      .replace(/✓ 신청했음 → 추적/g,'＋ 추적');
  };
}
if(typeof cyV8Toolbar==='function'){
  const _cyV90BaseToolbar=cyV8Toolbar;
  cyV8Toolbar=function(rows){return _cyV90BaseToolbar(rows).replace(/★\s*저장/g,'♥ 찜').replace(/저장한 공고/g,'찜한 공고')};
}
if(typeof cyV83OpenActionSheet==='function'){
  const _cyV90BaseSheet=cyV83OpenActionSheet;
  cyV83OpenActionSheet=function(ctx){
    _cyV90BaseSheet(ctx);
    const panel=document.querySelector('#cyV83ActionSheet #cyV83SheetPanel');if(!panel)return;
    panel.querySelectorAll('.save').forEach(el=>{const b=el.querySelector('b'),s=el.querySelector('span');if(b)b.textContent=/해제|저장됨/.test(el.textContent)?'♥':'♡';if(s)s.textContent=/해제/.test(el.textContent)?'찜 해제':'찜'});
  };
}
if(typeof cyV83HomeRow==='function')cyV83HomeRow=cyV90HomeRow;

if(typeof renderRecommendations==='function'){
  const _cyV90RenderRecommendations=renderRecommendations;
  renderRecommendations=function(){_cyV90RenderRecommendations();cyV90PolishRecommendation();cyV90RenameStaticText();};
}
if(typeof renderHourlyReport==='function'){
  const _cyV90RenderHourly=renderHourlyReport;
  renderHourlyReport=function(report){_cyV90RenderHourly(report);cyV90RenameStaticText();};
}
renderSchedule=cyV90RenderFavorites;

if(typeof cyV7ToggleSaved==='function'){
  const _cyV90ToggleSaved=cyV7ToggleSaved;
  cyV7ToggleSaved=function(id){_cyV90ToggleSaved(id);cyV90RenderFavorites();cyV90PolishRecommendation();cyV90RenameStaticText();};
}
if(typeof cyV7ToggleHidden==='function'){
  const _cyV90ToggleHidden=cyV7ToggleHidden;
  cyV7ToggleHidden=function(id){_cyV90ToggleHidden(id);cyV90RenderFavorites();};
}
if(typeof saveTracking==='function'){
  const _cyV90SaveTracking=saveTracking;
  saveTracking=function(){_cyV90SaveTracking();cyV90RenderFavorites();};
}
if(typeof renderSettings==='function'){
  const _cyV90RenderSettings=renderSettings;
  renderSettings=function(){_cyV90RenderSettings();cyV90RenameStaticText();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V90_VERSION;};
}
if(typeof renderHero==='function'){
  const _cyV90RenderHero=renderHero;
  renderHero=function(){_cyV90RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V90_VERSION;};
}

function cyV90Boot(){
  cyV90RenameStaticText();
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V90_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V90_VERSION;
  try{if(typeof CY_OPPORTUNITY_DATA!=='undefined'&&CY_OPPORTUNITY_DATA)renderRecommendations()}catch{}
  try{if(typeof CY_V82_HOURLY_REPORT!=='undefined'&&CY_V82_HOURLY_REPORT)renderHourlyReport(CY_V82_HOURLY_REPORT)}catch{}
  try{cyV90RenderFavorites()}catch{}
  setTimeout(()=>{try{cyV90RenameStaticText();cyV90RenderFavorites();cyV90PolishRecommendation()}catch{}},800);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV90Boot,{once:true});else setTimeout(cyV90Boot,0);
