// v0.8.5 compatibility layer; v0.8.6 is loaded at the end of this file.
const CY_V85_VERSION='0.8.5-live';

function cyV85MatchesSearch(item){
  const q=String(CY_V7_SEARCH||'').trim().toLowerCase();
  if(!q)return true;
  return `${item?.name||''} ${item?.region||''} ${item?.category||''} ${item?.agency||''}`.toLowerCase().includes(q);
}

cyV7Items=function(){
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  return items.filter(item=>{
    const hidden=CY_V7_HIDDEN.has(item.id);
    if(CY_V7_VIEW==='hidden'&&!hidden)return false;
    if(CY_V7_VIEW==='saved'&&!CY_V7_SAVED.has(item.id))return false;
    if(CY_V7_VIEW==='tracked'&&!cyV7IsTracked(item))return false;
    const level=cyV4Level(item);
    if(CY_V7_VIEW==='active'&&CY_V7_LEVEL!=='all'&&level!==CY_V7_LEVEL)return false;
    return cyV85MatchesSearch(item);
  });
};

function cyV85CollapsedCard(item){
  const saved=CY_V7_SAVED.has(item.id);
  const tracked=cyV7IsTracked(item);
  const f=typeof cyV84Finance==='function'?cyV84Finance(item):{summary:''};
  return `<article data-cy-v82-card-id="${esc(item.id)}" class="cy-v85-collapsed-card ${saved?'is-saved':''}">
    <div class="cy-v85-collapsed-main">
      <div class="cy-v85-collapsed-top"><span>🙈 숨김됨</span>${tracked?'<em>✓ 추적중</em>':''}</div>
      <strong>${esc(item.name||'')}</strong>
      <small>${esc(item.region||'')}${item.agency?` · ${esc(item.agency)}`:''}${f.summary?` · ${esc(f.summary)}`:''}</small>
    </div>
    <button type="button" class="cy-v85-restore" data-cy-v85-restore="${esc(item.id)}">복구</button>
  </article>`;
}

const _cyV85ExpandedCard=cyV8Card;
cyV8Card=function(item){
  if(CY_V7_HIDDEN.has(item.id))return cyV85CollapsedCard(item);
  return _cyV85ExpandedCard(item);
};

function cyV85WireRestoreButtons(){
  document.querySelectorAll('[data-cy-v85-restore]').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    const id=b.dataset.cyV85Restore;
    if(CY_V7_HIDDEN.has(id))CY_V7_HIDDEN.delete(id);
    cyV7SaveSet(CY_V7_HIDDEN_KEY,CY_V7_HIDDEN);
    renderRecommendations();
    if(CY_V82_HOURLY_REPORT)renderHourlyReport(CY_V82_HOURLY_REPORT);
    if(typeof cyToast==='function')cyToast('숨긴 공고를 복구했습니다.');
  }));
}

const _cyV85RenderRecommendations=renderRecommendations;
renderRecommendations=function(){_cyV85RenderRecommendations();cyV85WireRestoreButtons();};

function cyV85HomeRow(x){
  const hidden=cyV83IsHomeHidden(x);
  if(!hidden)return cyV83HomeRow(x);
  const opp=cyV82FindOpportunity(x.name||'');
  const f=typeof cyV84Finance==='function'?cyV84Finance(opp):{summary:''};
  return `<div class="cy-v85-home-collapsed" data-cy-v83-home-name="${esc(x.name||'')}">
    <div><span>🙈 숨김됨</span><strong>${esc(x.name||'')}</strong><small>${f.summary?esc(f.summary):'접어서 보관 중'}</small></div>
    <button type="button" data-cy-v85-home-restore="${esc(x.name||'')}">복구</button>
  </div>`;
}

renderHourlyReport=function(report){
  CY_V82_HOURLY_REPORT=report;
  const home=document.querySelector('.page[data-page="home"]');if(!home)return;
  let root=document.getElementById('hourlyReport');
  if(!root){root=document.createElement('section');root.id='hourlyReport';home.insertBefore(root,home.firstChild)}
  root.className='hourly-report cy-v8-hourly cy-v82-hourly cy-v83-hourly cy-v85-hourly';
  const groups=(Array.isArray(report?.groups)?report.groups:[]).map(g=>({...g,items:Array.isArray(g.items)?g.items:[]})).filter(g=>g.items.length);
  const updated=report?.updatedAt?new Date(report.updatedAt).toLocaleString('ko-KR'):'-';
  const hiddenCount=cyV83HiddenHomeCount(report);
  root.innerHTML=`
    <div class="cy-v8-hourly-head"><h2>지금 볼 것</h2><small>${updated}</small></div>
    ${hiddenCount?`<div class="cy-v85-hidden-note">🙈 숨긴 공고 ${hiddenCount}개는 아래에 작게 접어두었습니다.</div>`:''}
    ${groups.length?`<div class="cy-v8-groups">${groups.map(g=>`<section class="cy-v8-group ${cyV8GroupTone(g.title)}"><div class="cy-v8-group-head"><span class="dot"></span><b>${esc(g.icon||'')} ${esc(g.title||'')}</b><em>${g.items.length}개</em></div>${g.items.map(cyV85HomeRow).join('')}</section>`).join('')}</div>`:'<div class="empty">현재 바로 확인할 항목이 없습니다.</div>'}`;
  root.querySelectorAll('[data-cy-v83-home-open]').forEach(b=>b.addEventListener('click',()=>cyV82OpenHomeDetail(b.dataset.cyV83HomeOpen)));
  root.querySelectorAll('[data-cy-v83-home-hide]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();cyV83ToggleHomeHidden(b.dataset.cyV83HomeHide)}));
  root.querySelectorAll('[data-cy-v85-home-restore]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();cyV83ToggleHomeHidden(b.dataset.cyV85HomeRestore,false)}));
  if(CY_OPPORTUNITY_DATA)setTimeout(()=>renderRecommendations(),0);
};

cyV4AddTracking=function(id){
  const item=CY_OPPORTUNITY_DATA?.items?.find(x=>x.id===id);if(!item)return;
  const stableId=`opportunity-${id}`;
  const existingIndex=TRACKING.findIndex(x=>x.id===stableId);
  if(existingIndex>=0){
    const existing=TRACKING[existingIndex];
    if(existing.status==='취소/추적중단'){
      TRACKING[existingIndex]={...existing,status:'신청완료',statusIcon:'✅'};
      saveTracking();renderTracking();renderSchedule();renderHero();renderRecommendations();
      if(typeof cyToast==='function')cyToast('다시 추적을 시작했습니다.');
    }else if(typeof cyToast==='function')cyToast('이미 추적 중인 공고입니다.');
    return;
  }
  const f=typeof cyV84Finance==='function'?cyV84Finance(item):{summary:''};
  TRACKING.unshift({id:stableId,name:item.name||'',type:item.category||'',appliedAt:new Date().toISOString().slice(0,10),status:'신청완료',statusIcon:'✅',next:item.next||'',detail:[item.units||'',item.period||'',f.summary||''].filter(Boolean).join(' · '),address:(item.addresses||[])[0]||''});
  saveTracking();renderTracking();renderSchedule();renderHero();renderRecommendations();
  if(typeof cyToast==='function')cyToast('추적에 바로 추가했습니다.');
};

const _cyV85OpenActionSheet=cyV83OpenActionSheet;
cyV83OpenActionSheet=function(ctx){
  _cyV85OpenActionSheet(ctx);
  const panel=document.querySelector('#cyV83ActionSheet #cyV83SheetPanel');
  const track=panel?.querySelector('[data-cy-v83-action="track"]');
  if(track){const opp=ctx?.type==='home'?cyV82FindOpportunity(ctx.name):ctx?.item;track.textContent=opp&&cyV7IsTracked(opp)?'✓ 이미 추적중':'✓ 바로 추적하기'}
};

const _cyV85RenderHero=renderHero;
renderHero=function(){_cyV85RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V85_VERSION};
const _cyV85RenderSettings=renderSettings;
renderSettings=function(){_cyV85RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V85_VERSION};

// Load the v0.8.6 interaction/design layer without requiring a new APK or index rewrite.
(function cyV86Load(){
  if(!document.querySelector('link[data-cy-v86]')){const l=document.createElement('link');l.rel='stylesheet';l.href='assets/app-v86-ui.css?v=086';l.dataset.cyV86='1';document.head.appendChild(l)}
  if(!document.querySelector('script[data-cy-v86]')){const s=document.createElement('script');s.src='assets/app-v86-ui.js?v=086';s.dataset.cyV86='1';s.onload=()=>{try{if(CY_V82_HOURLY_REPORT)renderHourlyReport(CY_V82_HOURLY_REPORT);if(CY_OPPORTUNITY_DATA)renderRecommendations();renderHero();renderSettings()}catch(e){console.error('v0.8.6 refresh failed',e)}};document.body.appendChild(s)}
})();
