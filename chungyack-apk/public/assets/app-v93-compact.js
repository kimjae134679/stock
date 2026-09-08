// v0.9.3 live: compact home cards + application classification.
// Personal identifiers are NEVER stored in public GitHub assets. Result-list matches can arrive later through private trackingPatch.verification.
const CY_V93_VERSION='0.9.3-live';
const CY_V93_FILTER_KEY='chungyack.application.category.v1';
let CY_V93_TRACK_FILTER=localStorage.getItem(CY_V93_FILTER_KEY)||'check';

function cyV93Esc(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cyV93Opp(name){try{return typeof cyV82FindOpportunity==='function'?cyV82FindOpportunity(name||''):null}catch{return null}}
function cyV93Saved(opp){return !!(opp&&typeof CY_V7_SAVED!=='undefined'&&CY_V7_SAVED.has(opp.id))}
function cyV93Applied(opp){try{return !!(opp&&typeof cyV7IsTracked==='function'&&cyV7IsTracked(opp))}catch{return false}}
function cyV93Finance(opp){try{return typeof cyV84Finance==='function'?cyV84Finance(opp):null}catch{return null}}

function cyV93ShortPeriod(period){
  const s=String(period||'').replace(/2026-/g,'').replace(/\s+/g,' ').trim();
  if(!s)return '';
  const parts=s.split('~').map(x=>x.trim());
  const fmt=v=>v.replace(/^(\d{2})-(\d{2})/,(_,m,d)=>`${Number(m)}/${Number(d)}`);
  if(parts.length===1)return fmt(parts[0]);
  return `${fmt(parts[0])} ~ ${fmt(parts[1])}`;
}
function cyV93Units(units){
  const s=String(units||'').trim();if(!s)return '';
  const first=s.match(/(\d[\d,]*)\s*(세대|호)/);
  const people=s.match(/(?:모집인원|예비모집|예비)\s*(\d[\d,]*)\s*명/);
  if(first&&people)return `${first[1]}${first[2]} / ${people[1]}명`;
  if(first)return `${first[1]}${first[2]}`;
  return s.length>24?s.slice(0,24)+'…':s;
}
function cyV93Result(opp){
  if(!opp)return '';
  try{
    const m=(typeof CY_V87_MILESTONES!=='undefined'&&Array.isArray(CY_V87_MILESTONES))?CY_V87_MILESTONES.find(x=>x.id===opp.id):null;
    if(m?.result?.at){const d=new Date(m.result.at);if(!Number.isNaN(d.getTime()))return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
  }catch{}
  const n=String(opp.next||'');
  const m=n.match(/(\d{1,2})월\s*(\d{1,2})일(?:\s*(\d{1,2}:\d{2}))?[^·]{0,20}(?:발표|결과)/);
  return m?`${Number(m[1])}/${Number(m[2])}${m[3]?' '+m[3]:''}`:'';
}
function cyV93StatusKind(x,opp){
  const s=`${x?.status||''} ${opp?.status||''} ${opp?.eligibility?.title||''}`;
  if(/확인 필요|발표시각 경과|대상자 여부/.test(s))return ['check','확인 필요'];
  if(/서류/.test(s)&&!/발표/.test(s))return ['docs','서류'];
  if(/현재 접수|접수 중/.test(s))return ['open','접수중'];
  if(/접수 시작|예정/.test(s))return ['soon','예정'];
  if(/마감/.test(s))return ['closed','마감'];
  return ['neutral','검토'];
}
function cyV93HomeRow(x){
  const opp=cyV93Opp(x?.name||'');
  const saved=cyV93Saved(opp),applied=cyV93Applied(opp),f=cyV93Finance(opp);
  const [kind,label]=cyV93StatusKind(x,opp);
  const period=cyV93ShortPeriod(opp?.period||'');
  const result=cyV93Result(opp);
  const units=cyV93Units(opp?.units||'');
  let finance=String(f?.summary||'').replace(/\s+/g,' ').trim();if(finance.length>34)finance=finance.slice(0,34)+'…';
  const id=opp?.id||'';
  const cells=[];
  if(period)cells.push(`<span><small>접수</small><b>${cyV93Esc(period)}</b></span>`);
  if(result)cells.push(`<span><small>발표</small><b>${cyV93Esc(result)}</b></span>`);
  if(units)cells.push(`<span><small>세대</small><b>${cyV93Esc(units)}</b></span>`);
  if(finance)cells.push(`<span><small>임대료</small><b>${cyV93Esc(finance)}</b></span>`);
  return `<div class="cy-v86-home-row cy-v90-home-row cy-v93-home-row" data-cy-v83-home-name="${cyV93Esc(x?.name||'')}">
    <button type="button" class="cy-v86-home-open cy-v93-home-open" data-cy-v83-home-open="${cyV93Esc(x?.name||'')}">
      <div class="cy-v86-home-title"><span class="cy-v86-dot">●</span><strong>${cyV93Esc(x?.name||'')}</strong><i>상세 ›</i></div>
      <div class="cy-v93-chip-row"><span class="cy-v93-chip ${kind}">${cyV93Esc(label)}</span>${result?`<span class="cy-v93-chip result">발표 ${cyV93Esc(result)}</span>`:''}</div>
      ${cells.length?`<div class="cy-v93-facts">${cells.join('')}</div>`:''}
    </button>
    <div class="cy-v86-home-actions cy-v90-home-actions">
      ${opp?`<button type="button" class="cy-v90-mini-action heart ${saved?'on':''}" data-cy-v86-save="${cyV93Esc(id)}" title="${saved?'찜 해제':'찜'}"><b>${saved?'♥':'♡'}</b><small>찜</small></button>`:'<span></span>'}
      ${opp?`<button type="button" class="cy-v90-mini-action track ${applied?'on':''}" data-cy-v86-track="${cyV93Esc(id)}" title="${applied?'신청 수정':'신청'}"><b>${applied?'✓':'＋'}</b><small>신청</small></button>`:'<span></span>'}
      <button type="button" class="cy-v90-mini-action hide" data-cy-v83-home-hide="${cyV93Esc(x?.name||'')}" title="숨기기"><b>◌</b><small>숨김</small></button>
    </div>
  </div>`;
}

function cyV93Verification(x){return x?.verification||x?.resultCheck||null}
function cyV93Milestone(x){try{return typeof cyV87MilestoneForTrack==='function'?cyV87MilestoneForTrack(x):null}catch{return null}}
function cyV93ResultDue(x){
  const m=cyV93Milestone(x);if(!m?.result?.at)return false;
  const t=Date.parse(m.result.at);return Number.isFinite(t)&&t<=Date.now();
}
function cyV93Category(x){
  const s=`${x?.status||''} ${x?.detail||''}`;
  const v=cyV93Verification(x);
  if(/탈락|부적격|미선정/.test(s)||(v?.state==='not_found'&&v?.final===true))return 'rejected';
  if(/당첨|예비/.test(s)||(v?.state==='found'&&v?.stage==='final'))return 'selected';
  if(/서류|계약|입주/.test(s)||(v?.state==='found'&&['documents','screening'].includes(v?.stage)))return 'active';
  if(/결과확인 필요|확인 필요/.test(s)||v?.state==='pending'||(!v&&cyV93ResultDue(x)))return 'check';
  return 'active';
}
function cyV93CategoryMeta(cat){return ({check:['🔎','확인 필요'],active:['📄','진행중'],selected:['✅','합격·예비'],rejected:['⛔','탈락']}[cat]||['•','진행중'])}
function cyV93VerificationHtml(x){
  const v=cyV93Verification(x);if(!v)return '';
  const when=v.checkedAt?` · ${cyV93Esc(String(v.checkedAt).replace('T',' ').slice(0,16))}`:'';
  if(v.state==='found')return `<div class="cy-v93-verify found"><b>✅ 명단 확인됨</b>${when}${v.note?`<span>${cyV93Esc(v.note)}</span>`:''}</div>`;
  if(v.state==='not_found'&&v.final===true)return `<div class="cy-v93-verify rejected"><b>⛔ 최종 명단 없음 · 탈락</b>${when}${v.note?`<span>${cyV93Esc(v.note)}</span>`:''}</div>`;
  if(v.state==='not_found')return `<div class="cy-v93-verify caution"><b>⚠️ 명단에서 못 찾음 · 확정 아님</b>${when}${v.note?`<span>${cyV93Esc(v.note)}</span>`:''}</div>`;
  if(v.state==='unavailable')return `<div class="cy-v93-verify muted"><b>조회 불가</b>${v.note?`<span>${cyV93Esc(v.note)}</span>`:''}</div>`;
  return `<div class="cy-v93-verify pending"><b>🔎 결과 확인 대기</b>${v.note?`<span>${cyV93Esc(v.note)}</span>`:''}</div>`;
}
function cyV93TrackCard(x){
  const cat=cyV93Category(x),meta=cyV93CategoryMeta(cat),m=cyV93Milestone(x);
  const next=m?.documents?.text||x?.next||'';
  return `<article class="card status-card cy-v93-track-card ${cat}">
    <div class="status-body">
      <div class="cy-v93-track-top"><span class="cy-v93-class-tag ${cat}">${meta[0]} ${meta[1]}</span>${x?.appliedAt?`<small>신청 ${cyV93Esc(x.appliedAt)}</small>`:''}</div>
      <div class="status-name">${cyV93Esc(x?.name||'')}</div>
      <div class="tags"><span class="status-label">${cyV93Esc(x?.status||'신청완료')}</span>${x?.type?`<span class="tag blue">${cyV93Esc(x.type)}</span>`:''}</div>
      ${m?.result?`<div class="cy-v93-next"><small>${cyV93Esc(m.result.label||'결과 발표')}</small><b>${cyV93Esc(typeof cyV87FmtAt==='function'?cyV87FmtAt(m.result.at):m.result.at)}</b></div>`:''}
      ${next?`<div class="cy-v93-next"><small>다음</small><b>${cyV93Esc(next)}</b></div>`:''}
      ${cyV93VerificationHtml(x)}
      <div class="track-actions"><button class="mini edit-track" data-id="${cyV93Esc(x.id)}">수정</button><button class="mini danger remove-track" data-id="${cyV93Esc(x.id)}">신청 목록에서 제거</button></div>
    </div>
  </article>`;
}
function cyV93Counts(){
  const out={check:0,active:0,selected:0,rejected:0};
  (Array.isArray(TRACKING)?TRACKING:[]).forEach(x=>out[cyV93Category(x)]++);return out;
}
function cyV93EnsureTabs(){
  const page=document.querySelector('.page[data-page="tracking"]');if(!page)return null;
  let tabs=document.getElementById('cyV93TrackTabs');
  if(!tabs){tabs=document.createElement('div');tabs.id='cyV93TrackTabs';tabs.className='cy-v93-track-tabs';const toolbar=page.querySelector('.tracking-toolbar');toolbar?.insertAdjacentElement('afterend',tabs)}
  const c=cyV93Counts();
  if(CY_V93_TRACK_FILTER==='check'&&c.check===0)CY_V93_TRACK_FILTER='active';
  const defs=[['check','확인 필요'],['active','진행중'],['selected','합격·예비'],['rejected','탈락']];
  tabs.innerHTML=defs.map(([id,label])=>`<button type="button" data-cy-v93-filter="${id}" class="${CY_V93_TRACK_FILTER===id?'on':''}">${label}<b>${c[id]}</b></button>`).join('');
  tabs.querySelectorAll('[data-cy-v93-filter]').forEach(b=>b.addEventListener('click',()=>{CY_V93_TRACK_FILTER=b.dataset.cyV93Filter;localStorage.setItem(CY_V93_FILTER_KEY,CY_V93_TRACK_FILTER);cyV93RenderApplicationPage()}));
  return tabs;
}
function cyV93RenderApplicationPage(){
  const grid=document.getElementById('trackingGridMirror');if(!grid)return;
  cyV93EnsureTabs();
  const rows=(Array.isArray(TRACKING)?TRACKING:[]).filter(x=>cyV93Category(x)===CY_V93_TRACK_FILTER);
  grid.innerHTML=rows.length?rows.map(cyV93TrackCard).join(''):`<div class="empty cy-v93-empty">${CY_V93_TRACK_FILTER==='check'?'지금 바로 확인할 결과·서류 건이 없어.':'이 분류에 들어간 신청 건이 없어.'}</div>`;
}

function cyV93Static(){
  const nav=document.querySelector('.nav-btn[data-page="recommend"]');if(nav)nav.innerHTML='<b>▤</b>공고';
  const applyNav=document.querySelector('.nav-btn[data-page="tracking"]');if(applyNav)applyNav.innerHTML='<b>✓</b>신청';
  const favNav=document.querySelector('.nav-btn[data-page="schedule"]');if(favNav)favNav.innerHTML='<b>♥</b>찜';
  const h=document.querySelector('.page[data-page="tracking"] .section-head h2');if(h)h.textContent='내 신청';
  const s=document.querySelector('.page[data-page="tracking"] .section-head small');if(s)s.textContent='확인 필요 · 진행 · 합격·예비 · 탈락';
  const sel=document.getElementById('trackStatus');
  if(sel&&![...sel.options].some(o=>o.value==='탈락'||o.textContent==='탈락')){const o=document.createElement('option');o.value='탈락';o.textContent='탈락';sel.appendChild(o)}
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V93_VERSION;
  const sv=document.getElementById('settingsVersion');if(sv)sv.textContent=CY_V93_VERSION;
}

// v85/v86 home rendering calls cyV83HomeRow for every visible report item.
if(typeof cyV83HomeRow==='function')cyV83HomeRow=cyV93HomeRow;
if(typeof cyV86HomeRow==='function')cyV86HomeRow=cyV93HomeRow;

if(typeof renderHourlyReport==='function'&&!renderHourlyReport.__cyV93Wrapped){
  const base=renderHourlyReport;
  const wrapped=function(report){const out=base.call(this,report);cyV93Static();return out};wrapped.__cyV93Wrapped=true;renderHourlyReport=wrapped;
}
if(typeof renderTracking==='function'&&!renderTracking.__cyV93Wrapped){
  const base=renderTracking;
  const wrapped=function(){const out=base.call(this);cyV93RenderApplicationPage();cyV93Static();return out};wrapped.__cyV93Wrapped=true;renderTracking=wrapped;
}
if(typeof renderHero==='function'&&!renderHero.__cyV93Wrapped){const base=renderHero;const wrapped=function(){const out=base.call(this);cyV93Static();return out};wrapped.__cyV93Wrapped=true;renderHero=wrapped}
if(typeof renderSettings==='function'&&!renderSettings.__cyV93Wrapped){const base=renderSettings;const wrapped=function(){const out=base.call(this);cyV93Static();return out};wrapped.__cyV93Wrapped=true;renderSettings=wrapped}
if(typeof saveTracking==='function'&&!saveTracking.__cyV93Wrapped){const base=saveTracking;const wrapped=function(){const out=base.call(this);setTimeout(cyV93RenderApplicationPage,0);return out};wrapped.__cyV93Wrapped=true;saveTracking=wrapped}

function cyV93Boot(){
  cyV93Static();
  try{if(typeof CY_V82_HOURLY_REPORT!=='undefined'&&CY_V82_HOURLY_REPORT&&typeof renderHourlyReport==='function')renderHourlyReport(CY_V82_HOURLY_REPORT)}catch(e){console.warn('[ChungYack] compact home render failed',e)}
  try{cyV93RenderApplicationPage()}catch(e){console.warn('[ChungYack] application classification failed',e)}
  setTimeout(()=>{try{cyV93Static();cyV93RenderApplicationPage()}catch{}},700);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV93Boot,{once:true});else setTimeout(cyV93Boot,0);
