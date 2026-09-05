// v0.8.3 live: home hide button + long-press action sheet.
const CY_V83_VERSION='0.8.3-live';
let CY_V83_SHOW_HIDDEN=false;
let CY_V83_LONGPRESS_TIMER=null;
let CY_V83_LONGPRESS_TARGET=null;
let CY_V83_LONGPRESS_START=null;
let CY_V83_SUPPRESS_TARGET=null;
let CY_V83_SUPPRESS_UNTIL=0;

function cyV83HomeKey(itemOrName){
  const name=typeof itemOrName==='string'?itemOrName:(itemOrName?.name||'');
  const opp=cyV82FindOpportunity(name);
  return opp?.id||`home:${cyV82NormName(name)}`;
}
function cyV83IsHomeHidden(itemOrName){
  const key=cyV83HomeKey(itemOrName);
  return !!key&&CY_V7_HIDDEN.has(key);
}
function cyV83SaveHidden(){cyV7SaveSet(CY_V7_HIDDEN_KEY,CY_V7_HIDDEN)}
function cyV83ToggleHomeHidden(name,force){
  const key=cyV83HomeKey(name);if(!key)return;
  const was=CY_V7_HIDDEN.has(key);
  const next=typeof force==='boolean'?force:!was;
  if(next)CY_V7_HIDDEN.add(key);else CY_V7_HIDDEN.delete(key);
  cyV83SaveHidden();
  if(CY_V82_HOURLY_REPORT)renderHourlyReport(CY_V82_HOURLY_REPORT);
  if(CY_OPPORTUNITY_DATA)renderRecommendations();
  if(typeof cyToast==='function')cyToast(next?'공고를 숨겼습니다.':'숨김을 해제했습니다.');
}
function cyV83HiddenHomeCount(report=CY_V82_HOURLY_REPORT){
  const groups=Array.isArray(report?.groups)?report.groups:[];
  return groups.flatMap(g=>Array.isArray(g.items)?g.items:[]).filter(x=>cyV83IsHomeHidden(x)).length;
}
function cyV83RestoreAllHome(){
  const groups=Array.isArray(CY_V82_HOURLY_REPORT?.groups)?CY_V82_HOURLY_REPORT.groups:[];
  groups.flatMap(g=>Array.isArray(g.items)?g.items:[]).forEach(x=>CY_V7_HIDDEN.delete(cyV83HomeKey(x)));
  cyV83SaveHidden();CY_V83_SHOW_HIDDEN=false;
  if(CY_V82_HOURLY_REPORT)renderHourlyReport(CY_V82_HOURLY_REPORT);
  if(CY_OPPORTUNITY_DATA)renderRecommendations();
  if(typeof cyToast==='function')cyToast('홈에서 숨긴 공고를 모두 복원했습니다.');
}

function cyV83EnsureActionSheet(){
  let d=document.getElementById('cyV83ActionSheet');
  if(d)return d;
  d=document.createElement('dialog');
  d.id='cyV83ActionSheet';
  d.className='cy-v83-sheet';
  d.innerHTML='<div class="cy-v83-sheet-panel" id="cyV83SheetPanel"></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{if(e.target===d)d.close()});
  d.addEventListener('close',()=>{CY_V83_LONGPRESS_TARGET=null});
  return d;
}
function cyV83SheetButton(label,cls='',attr=''){
  return `<button type="button" class="cy-v83-sheet-action ${cls}" ${attr}>${label}</button>`;
}
function cyV83OpenActionSheet(ctx){
  const d=cyV83EnsureActionSheet();
  const panel=d.querySelector('#cyV83SheetPanel');
  const isHome=ctx.type==='home';
  const name=isHome?ctx.name:(ctx.item?.name||'');
  const opp=isHome?cyV82FindOpportunity(name):ctx.item;
  const hidden=isHome?cyV83IsHomeHidden(name):(opp?CY_V7_HIDDEN.has(opp.id):false);
  const saved=opp?CY_V7_SAVED.has(opp.id):false;
  const tracked=opp?cyV7IsTracked(opp):false;
  const level=opp?cyV8Level(opp):'action';
  panel.innerHTML=`
    <div class="cy-v83-sheet-grabber"></div>
    <div class="cy-v83-sheet-head"><small>꾹 눌러 빠른 실행</small><strong>${esc(name||'공고')}</strong></div>
    <div class="cy-v83-sheet-actions">
      ${isHome?cyV83SheetButton('상세 보기','primary','data-cy-v83-action="detail"'):''}
      ${opp?cyV83SheetButton(saved?'★ 저장 해제':'☆ 저장','', 'data-cy-v83-action="save"'):''}
      ${cyV83SheetButton(hidden?'↩ 숨김 해제':'🙈 숨기기',hidden?'':'danger','data-cy-v83-action="hide"')}
      ${opp?.source?`<a class="cy-v83-sheet-action" href="${esc(opp.source)}" target="_blank" rel="noopener">▤ 공식 공고 열기</a>`:''}
      ${opp&&level!=='impossible'&&level!=='hold'?cyV83SheetButton(tracked?'✓ 추적 수정':'✓ 신청했음 → 추적','', 'data-cy-v83-action="track"'):''}
      ${cyV83SheetButton('닫기','muted','data-cy-v83-action="close"')}
    </div>`;
  panel.querySelector('[data-cy-v83-action="detail"]')?.addEventListener('click',()=>{d.close();cyV82OpenHomeDetail(name)});
  panel.querySelector('[data-cy-v83-action="save"]')?.addEventListener('click',()=>{d.close();if(opp)cyV7ToggleSaved(opp.id)});
  panel.querySelector('[data-cy-v83-action="hide"]')?.addEventListener('click',()=>{
    d.close();
    if(isHome)cyV83ToggleHomeHidden(name,!hidden);
    else if(opp)cyV7ToggleHidden(opp.id);
  });
  panel.querySelector('[data-cy-v83-action="track"]')?.addEventListener('click',()=>{d.close();if(opp)cyV4AddTracking(opp.id)});
  panel.querySelector('[data-cy-v83-action="close"]')?.addEventListener('click',()=>d.close());
  try{navigator.vibrate?.(28)}catch{}
  d.showModal();
}

function cyV83HomeRow(x){
  const result=cyV82ExtractResultText(x.status);
  const hidden=cyV83IsHomeHidden(x);
  return `<div class="cy-v8-hourly-item cy-v83-home-row${hidden?' is-hidden':''}" data-cy-v83-home-name="${esc(x.name||'')}">
    <button type="button" class="cy-v83-home-main" data-cy-v83-home-open="${esc(x.name||'')}">
      <strong>${esc(x.name||'')}</strong>
      <span>${esc(x.status||'')}</span>
      ${result?`<em class="cy-v82-home-result">🎯 ${esc(result)}</em>`:''}
      <i>상세 보기 ›</i>
    </button>
    <button type="button" class="cy-v83-home-hide" data-cy-v83-home-hide="${esc(x.name||'')}">${hidden?'복원':'숨기기'}</button>
  </div>`;
}

// Override v0.8.2 home renderer: hidden state is persistent and restorable.
renderHourlyReport=function(report){
  CY_V82_HOURLY_REPORT=report;
  const home=document.querySelector('.page[data-page="home"]');if(!home)return;
  let root=document.getElementById('hourlyReport');
  if(!root){root=document.createElement('section');root.id='hourlyReport';home.insertBefore(root,home.firstChild)}
  root.className='hourly-report cy-v8-hourly cy-v82-hourly cy-v83-hourly';
  const raw=(Array.isArray(report?.groups)?report.groups:[]).map(g=>({...g,items:Array.isArray(g.items)?g.items:[]}));
  const groups=raw.map(g=>({...g,items:CY_V83_SHOW_HIDDEN?g.items:g.items.filter(x=>!cyV83IsHomeHidden(x))})).filter(g=>g.items.length);
  const updated=report?.updatedAt?new Date(report.updatedAt).toLocaleString('ko-KR'):'-';
  const hiddenCount=cyV83HiddenHomeCount(report);
  root.innerHTML=`
    <div class="cy-v8-hourly-head"><h2>지금 볼 것</h2><small>${updated}</small></div>
    ${hiddenCount?`<div class="cy-v83-hidden-tools"><button type="button" id="cyV83ToggleHiddenHome">${CY_V83_SHOW_HIDDEN?'숨긴 공고 접기':`숨긴 홈 공고 ${hiddenCount}개 보기`}</button>${CY_V83_SHOW_HIDDEN?'<button type="button" id="cyV83RestoreAllHome">모두 복원</button>':''}</div>`:''}
    ${groups.length?`<div class="cy-v8-groups">${groups.map(g=>`<section class="cy-v8-group ${cyV8GroupTone(g.title)}"><div class="cy-v8-group-head"><span class="dot"></span><b>${esc(g.icon||'')} ${esc(g.title||'')}</b><em>${g.items.length}개</em></div>${g.items.map(cyV83HomeRow).join('')}</section>`).join('')}</div>`:'<div class="empty">현재 바로 확인할 항목이 없습니다.</div>'}`;
  root.querySelectorAll('[data-cy-v83-home-open]').forEach(b=>b.addEventListener('click',()=>cyV82OpenHomeDetail(b.dataset.cyV83HomeOpen)));
  root.querySelectorAll('[data-cy-v83-home-hide]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();cyV83ToggleHomeHidden(b.dataset.cyV83HomeHide)}));
  root.querySelector('#cyV83ToggleHiddenHome')?.addEventListener('click',()=>{CY_V83_SHOW_HIDDEN=!CY_V83_SHOW_HIDDEN;renderHourlyReport(report)});
  root.querySelector('#cyV83RestoreAllHome')?.addEventListener('click',cyV83RestoreAllHome);
  if(CY_OPPORTUNITY_DATA)setTimeout(()=>renderRecommendations(),0);
};

function cyV83LongPressContext(el){
  const homeName=el?.dataset?.cyV83HomeName;
  if(homeName)return {type:'home',name:homeName};
  const id=el?.dataset?.cyV82CardId;
  if(id){const item=CY_OPPORTUNITY_DATA?.items?.find(x=>x.id===id);if(item)return {type:'card',item}}
  return null;
}
function cyV83CancelLongPress(){
  if(CY_V83_LONGPRESS_TIMER)clearTimeout(CY_V83_LONGPRESS_TIMER);
  CY_V83_LONGPRESS_TIMER=null;CY_V83_LONGPRESS_START=null;
}
function cyV83StartLongPress(e){
  const el=e.target.closest?.('[data-cy-v83-home-name],[data-cy-v82-card-id]');
  if(!el)return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  if(e.target.closest('.cy-v83-home-hide,.cy-v8-actions,.cy-v8-hide,a,input,select,textarea'))return;
  cyV83CancelLongPress();
  CY_V83_LONGPRESS_TARGET=el;
  CY_V83_LONGPRESS_START={x:e.clientX,y:e.clientY};
  CY_V83_LONGPRESS_TIMER=setTimeout(()=>{
    const ctx=cyV83LongPressContext(el);if(!ctx)return;
    CY_V83_SUPPRESS_TARGET=el;CY_V83_SUPPRESS_UNTIL=Date.now()+700;
    cyV83OpenActionSheet(ctx);CY_V83_LONGPRESS_TIMER=null;
  },560);
}
function cyV83MoveLongPress(e){
  if(!CY_V83_LONGPRESS_START||!CY_V83_LONGPRESS_TIMER)return;
  if(Math.hypot(e.clientX-CY_V83_LONGPRESS_START.x,e.clientY-CY_V83_LONGPRESS_START.y)>12)cyV83CancelLongPress();
}
function cyV83ContextMenu(e){
  const el=e.target.closest?.('[data-cy-v83-home-name],[data-cy-v82-card-id]');if(!el)return;
  if(e.target.closest('.cy-v83-home-hide,.cy-v8-actions,.cy-v8-hide,a,input,select,textarea'))return;
  e.preventDefault();cyV83CancelLongPress();
  const ctx=cyV83LongPressContext(el);if(ctx){CY_V83_SUPPRESS_TARGET=el;CY_V83_SUPPRESS_UNTIL=Date.now()+700;cyV83OpenActionSheet(ctx)}
}

document.addEventListener('pointerdown',cyV83StartLongPress,{passive:true});
document.addEventListener('pointermove',cyV83MoveLongPress,{passive:true});
document.addEventListener('pointerup',cyV83CancelLongPress,{passive:true});
document.addEventListener('pointercancel',cyV83CancelLongPress,{passive:true});
document.addEventListener('contextmenu',cyV83ContextMenu);
document.addEventListener('click',e=>{
  if(CY_V83_SUPPRESS_TARGET&&Date.now()<CY_V83_SUPPRESS_UNTIL&&CY_V83_SUPPRESS_TARGET.contains(e.target)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
    CY_V83_SUPPRESS_TARGET=null;CY_V83_SUPPRESS_UNTIL=0;
  }
},true);

const _cyV83RenderHero=renderHero;
renderHero=function(){_cyV83RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V83_VERSION};
const _cyV83RenderSettings=renderSettings;
renderSettings=function(){_cyV83RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V83_VERSION};

window.addEventListener('DOMContentLoaded',()=>{
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V83_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V83_VERSION;
});
