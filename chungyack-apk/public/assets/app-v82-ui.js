// v0.8.2 live: clickable home notices + explicit result/document announcement schedule.
const CY_V82_VERSION='0.8.2-live';
let CY_V82_HOURLY_REPORT=null;

function cyV82NormName(value){
  return String(value||'')
    .replace(/\[[^\]]+\]/g,' ')
    .replace(/정정공고|청년안심주택|청년주택|예비입주자\s*모집|입주자\s*모집|추가\s*모집/g,' ')
    .replace(/[\s·ㆍ_\-–—()[\]{}]/g,'')
    .toLowerCase();
}
function cyV82FindOpportunity(name){
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  const target=cyV82NormName(name);
  if(!target)return null;
  let best=null,bestScore=0;
  items.forEach(item=>{
    const n=cyV82NormName(item.name);
    if(!n)return;
    let score=0;
    if(n===target)score=1000;
    else if(n.includes(target)||target.includes(n))score=800+Math.min(n.length,target.length);
    else{
      let common=0;
      const short=n.length<target.length?n:target;
      const long=n.length<target.length?target:n;
      for(let i=0;i<short.length-1;i++)if(long.includes(short.slice(i,i+2)))common++;
      score=common;
    }
    if(score>bestScore){bestScore=score;best=item}
  });
  return bestScore>=6?best:null;
}
function cyV82HourlyItemFor(name){
  const groups=Array.isArray(CY_V82_HOURLY_REPORT?.groups)?CY_V82_HOURLY_REPORT.groups:[];
  const all=groups.flatMap(g=>(Array.isArray(g.items)?g.items:[]).map(x=>({...x,__group:g.title||''})));
  const exact=all.find(x=>cyV82NormName(x.name)===cyV82NormName(name));
  if(exact)return exact;
  const opp=cyV82FindOpportunity(name);
  if(!opp)return null;
  return all.find(x=>cyV82FindOpportunity(x.name)?.id===opp.id)||null;
}
function cyV82ExtractResultText(...values){
  const out=[];
  values.filter(Boolean).forEach(value=>{
    String(value).split(/\s*·\s*/).forEach(seg=>{
      const s=seg.trim();
      if(!s)return;
      if(/서류심사\s*대상자\s*발표|서류제출대상자\s*발표|서류제출\s*대상자\s*발표|예비입주자\s*발표|당첨자\s*발표|최종\s*발표|결과\s*발표|선정(?:자|결과)?\s*발표|대상자\s*발표/.test(s))out.push(s);
    });
  });
  return [...new Set(out)].slice(0,2).join(' · ');
}
function cyV82ResultSchedule(item){
  const hourly=cyV82HourlyItemFor(item?.name||'');
  return cyV82ExtractResultText(
    item?.resultSchedule,
    hourly?.status,
    item?.next,
    item?.eligibility?.reason
  );
}
function cyV82ResultRow(item){
  const result=cyV82ResultSchedule(item);
  return `<div class="cy-v82-result-row"><span class="cy-v82-result-icon">🎯</span><div><small>결과 · 서류 발표</small><strong>${esc(result||'공고문에서 발표 일정 확인 필요')}</strong></div></div>`;
}

// Extend the approved v8 card without changing saved/hidden/tracking state.
const _cyV82BaseCard=cyV8Card;
cyV8Card=function(item){
  let html=_cyV82BaseCard(item);
  html=html.replace('<article class="cy-v8-card ',`<article data-cy-v82-card-id="${esc(item.id)}" class="cy-v8-card `);
  const row=cyV82ResultRow(item);
  const deadline='<div class="cy-v8-detail-row deadline">';
  if(html.includes(deadline))html=html.replace(deadline,row+deadline);
  else html=html.replace('<div class="cy-v8-actions">',row+'<div class="cy-v8-actions">');
  return html;
};

function cyV82EnsureDialog(){
  let d=document.getElementById('cyV82NoticeDialog');
  if(d)return d;
  d=document.createElement('dialog');
  d.id='cyV82NoticeDialog';
  d.className='cy-v82-dialog';
  d.innerHTML='<div id="cyV82DialogBody"></div>';
  document.body.appendChild(d);
  d.addEventListener('click',e=>{if(e.target===d)d.close()});
  return d;
}
function cyV82OpenOpportunityCard(item){
  if(!item)return;
  CY_V7_VIEW=CY_V7_HIDDEN.has(item.id)?'hidden':'active';
  localStorage.setItem(CY_V7_VIEW_KEY,CY_V7_VIEW);
  CY_V7_LEVEL='all';
  CY_V7_SEARCH='';
  openPage('recommend');
  renderRecommendations();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const card=document.querySelector(`[data-cy-v82-card-id="${CSS.escape(item.id)}"]`);
    if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('cy-v82-focus');setTimeout(()=>card.classList.remove('cy-v82-focus'),1800)}
  }));
}
function cyV82OpenHomeDetail(name){
  const x=cyV82HourlyItemFor(name);
  if(!x)return;
  const opp=cyV82FindOpportunity(x.name);
  const result=cyV82ExtractResultText(x.status,opp?.next,opp?.eligibility?.reason);
  const d=cyV82EnsureDialog();
  const body=d.querySelector('#cyV82DialogBody');
  const official=opp?.source?`<a class="cy-v82-dialog-btn primary" href="${esc(opp.source)}" target="_blank" rel="noopener">공식 공고 열기</a>`:'';
  const inApp=opp?'<button type="button" class="cy-v82-dialog-btn" id="cyV82OpenInApp">공고 화면에서 보기</button>':'';
  const map=x.address?`<a class="cy-v82-dialog-btn" href="${hourlyMapUrl(x.address)}" target="_blank" rel="noopener">지도 보기</a>`:'';
  body.innerHTML=`
    <div class="cy-v82-dialog-head"><div><small>${esc(x.__group||'홈 공고')}</small><h3>${esc(x.name||'')}</h3></div><button type="button" class="cy-v82-dialog-close" id="cyV82DialogClose">×</button></div>
    <div class="cy-v82-dialog-grid">
      ${opp?.period?`<div><small>접수 기간</small><strong>${esc(opp.period)}</strong></div>`:''}
      ${opp?.units?`<div><small>모집</small><strong>${esc(opp.units)}</strong></div>`:''}
    </div>
    <div class="cy-v82-dialog-result"><small>🎯 결과 · 서류 발표</small><strong>${esc(result||'공고문에서 발표 일정 확인 필요')}</strong></div>
    <div class="cy-v82-dialog-status"><small>현재 요약</small><p>${esc(x.status||'')}</p></div>
    ${x.address?`<div class="cy-v82-dialog-address">⌖ ${esc(x.address)}</div>`:''}
    <div class="cy-v82-dialog-actions">${official}${inApp}${map}<button type="button" class="cy-v82-dialog-btn" id="cyV82DialogDone">닫기</button></div>`;
  body.querySelector('#cyV82DialogClose')?.addEventListener('click',()=>d.close());
  body.querySelector('#cyV82DialogDone')?.addEventListener('click',()=>d.close());
  body.querySelector('#cyV82OpenInApp')?.addEventListener('click',()=>{d.close();cyV82OpenOpportunityCard(opp)});
  d.showModal();
}

// Home rows are now tappable. Result/document announcement is visible without opening the card.
renderHourlyReport=function(report){
  CY_V82_HOURLY_REPORT=report;
  const home=document.querySelector('.page[data-page="home"]');if(!home)return;
  let root=document.getElementById('hourlyReport');
  if(!root){root=document.createElement('section');root.id='hourlyReport';home.insertBefore(root,home.firstChild)}
  root.className='hourly-report cy-v8-hourly cy-v82-hourly';
  const groups=(Array.isArray(report?.groups)?report.groups:[]).map(g=>({...g,items:Array.isArray(g.items)?g.items:[]})).filter(g=>g.items.length);
  const updated=report?.updatedAt?new Date(report.updatedAt).toLocaleString('ko-KR'):'-';
  root.innerHTML=`<div class="cy-v8-hourly-head"><h2>지금 볼 것</h2><small>${updated}</small></div>${groups.length?`<div class="cy-v8-groups">${groups.map(g=>`<section class="cy-v8-group ${cyV8GroupTone(g.title)}"><div class="cy-v8-group-head"><span class="dot"></span><b>${esc(g.icon||'')} ${esc(g.title||'')}</b><em>${g.items.length}개</em></div>${g.items.map(x=>{const result=cyV82ExtractResultText(x.status);return `<button type="button" class="cy-v8-hourly-item cy-v82-hourly-open" data-cy-v82-home-name="${esc(x.name||'')}"><strong>${esc(x.name||'')}</strong><span>${esc(x.status||'')}</span>${result?`<em class="cy-v82-home-result">🎯 ${esc(result)}</em>`:''}<i>상세 보기 ›</i></button>`}).join('')}</section>`).join('')}</div>`:'<div class="empty">현재 바로 확인할 항목이 없습니다.</div>'}`;
  root.querySelectorAll('[data-cy-v82-home-name]').forEach(b=>b.addEventListener('click',()=>cyV82OpenHomeDetail(b.dataset.cyV82HomeName)));
  if(CY_OPPORTUNITY_DATA)setTimeout(()=>renderRecommendations(),0);
};

const _cyV82RenderHero=renderHero;
renderHero=function(){_cyV82RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V82_VERSION};
const _cyV82RenderSettings=renderSettings;
renderSettings=function(){_cyV82RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V82_VERSION};

window.addEventListener('DOMContentLoaded',()=>{
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V82_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V82_VERSION;
});
