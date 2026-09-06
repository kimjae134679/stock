// v0.8.6 live: visible home quick actions + compact long-press panel + '복구' wording.
const CY_V86_VERSION='0.8.6-live';

function cyV86OppForHome(name){return typeof cyV82FindOpportunity==='function'?cyV82FindOpportunity(name):null}
function cyV86HomeRow(x){
  const opp=cyV86OppForHome(x?.name||'');
  const saved=opp?CY_V7_SAVED.has(opp.id):false;
  const tracked=opp?cyV7IsTracked(opp):false;
  const f=typeof cyV84Finance==='function'?cyV84Finance(opp):{summary:''};
  const result=typeof cyV82ExtractResultText==='function'?cyV82ExtractResultText(x?.status||'',opp?.next,opp?.eligibility?.reason):'';
  const id=opp?.id||'';
  return `<div class="cy-v86-home-row" data-cy-v83-home-name="${esc(x?.name||'')}">
    <button type="button" class="cy-v86-home-open" data-cy-v83-home-open="${esc(x?.name||'')}">
      <div class="cy-v86-home-title"><span class="cy-v86-dot">●</span><strong>${esc(x?.name||'')}</strong><i>상세 ›</i></div>
      <div class="cy-v86-home-status">${esc(x?.status||'')}</div>
      ${f.summary?`<div class="cy-v86-home-finance">💰 ${esc(f.summary)}</div>`:'<div class="cy-v86-home-finance muted">💰 임대료 공고문 확인 필요</div>'}
      ${result?`<div class="cy-v86-home-result">🎯 ${esc(result)}</div>`:''}
    </button>
    <div class="cy-v86-home-actions">
      ${opp?`<button type="button" class="${saved?'on':''}" data-cy-v86-save="${esc(id)}">${saved?'★ 저장됨':'☆ 저장'}</button>`:'<span></span>'}
      ${opp?`<button type="button" class="track ${tracked?'on':''}" data-cy-v86-track="${esc(id)}">${tracked?'✓ 추적중':'✓ 추적'}</button>`:'<span></span>'}
      <button type="button" class="hide" data-cy-v83-home-hide="${esc(x?.name||'')}">숨기기</button>
    </div>
  </div>`;
}

// v85 calls cyV83HomeRow for visible items; replace it with the clearer v86 row.
cyV83HomeRow=cyV86HomeRow;

function cyV86RefreshHome(){if(CY_V82_HOURLY_REPORT)renderHourlyReport(CY_V82_HOURLY_REPORT)}
function cyV86WireHomeActions(root=document){
  root.querySelectorAll('[data-cy-v86-save]').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();cyV7ToggleSaved(b.dataset.cyV86Save);cyV86RefreshHome();
  }));
  root.querySelectorAll('[data-cy-v86-track]').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();cyV4AddTracking(b.dataset.cyV86Track);cyV86RefreshHome();
  }));
}
const _cyV86RenderHourly=renderHourlyReport;
renderHourlyReport=function(report){
  _cyV86RenderHourly(report);
  const root=document.getElementById('hourlyReport');if(root)cyV86WireHomeActions(root);
};

// Rename restore wording everywhere after each render.
function cyV86RenameRestore(root=document){
  root.querySelectorAll('[data-cy-v85-restore],[data-cy-v85-home-restore]').forEach(b=>{b.textContent='복구'});
  root.querySelectorAll('button').forEach(b=>{
    if(b.textContent.trim()==='복원')b.textContent='복구';
    if(b.textContent.trim()==='모두 복원')b.textContent='모두 복구';
  });
}
const _cyV86RenderRecommendations=renderRecommendations;
renderRecommendations=function(){_cyV86RenderRecommendations();cyV86RenameRestore(document.getElementById('recommendList')||document)};
const _cyV86Hourly2=renderHourlyReport;
renderHourlyReport=function(report){_cyV86Hourly2(report);cyV86RenameRestore(document.getElementById('hourlyReport')||document)};

// Replace the tall long-press action list with a compact icon grid.
const _cyV86OpenActionSheet=cyV83OpenActionSheet;
cyV83OpenActionSheet=function(ctx){
  _cyV86OpenActionSheet(ctx);
  const panel=document.querySelector('#cyV83ActionSheet #cyV83SheetPanel');if(!panel)return;
  panel.classList.add('cy-v86-compact-sheet');
  const actions=panel.querySelector('.cy-v83-sheet-actions');
  if(actions)actions.classList.add('cy-v86-action-grid');
  const head=panel.querySelector('.cy-v83-sheet-head');
  if(head&&!head.querySelector('.cy-v86-sheet-close')){
    const close=document.createElement('button');
    close.type='button';close.className='cy-v86-sheet-close';close.textContent='×';
    close.addEventListener('click',()=>document.getElementById('cyV83ActionSheet')?.close());
    head.appendChild(close);
  }
  panel.querySelectorAll('.cy-v83-sheet-action').forEach(el=>{
    const t=el.textContent.trim();
    if(/상세/.test(t)){el.innerHTML='<b>⌕</b><span>상세</span>';el.classList.add('detail')}
    else if(/저장/.test(t)){el.innerHTML=`<b>${/해제|저장됨/.test(t)?'★':'☆'}</b><span>${/해제/.test(t)?'저장 해제':'저장'}</span>`;el.classList.add('save')}
    else if(/숨김 해제|복원|복구/.test(t)){el.innerHTML='<b>↩</b><span>복구</span>';el.classList.add('restore')}
    else if(/숨기기/.test(t)){el.innerHTML='<b>◌</b><span>숨기기</span>';el.classList.add('hide')}
    else if(/공식 공고/.test(t)){el.innerHTML='<b>▤</b><span>공식 공고</span>';el.classList.add('official')}
    else if(/추적/.test(t)){el.innerHTML=`<b>✓</b><span>${/이미/.test(t)?'추적중':'추적'}</span>`;el.classList.add('track')}
    else if(t==='닫기'){el.remove()}
  });
  const hint=panel.querySelector('.cy-v83-sheet-head small');if(hint)hint.textContent='빠른 실행';
};

const _cyV86RenderHero=renderHero;
renderHero=function(){_cyV86RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V86_VERSION};
const _cyV86RenderSettings=renderSettings;
renderSettings=function(){_cyV86RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V86_VERSION};
window.addEventListener('DOMContentLoaded',()=>{
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V86_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V86_VERSION;
  cyV86RenameRestore();
});
