// v0.8.7 live: enrich personal tracking cards with public result/document/contract milestones.
const CY_V87_VERSION='0.8.7-live';
let CY_V87_MILESTONES=[];

function cyV87OppIdFromTrack(x){
  const id=String(x?.id||'');
  return id.startsWith('opportunity-')?id.slice('opportunity-'.length):'';
}
function cyV87Norm(s){return String(s||'').replace(/\s+/g,'').replace(/[\[\]()★🔥✅]/g,'').toLowerCase()}
function cyV87MilestoneForTrack(x){
  const oid=cyV87OppIdFromTrack(x);
  if(oid){const m=CY_V87_MILESTONES.find(v=>v.id===oid);if(m)return m}
  const n=cyV87Norm(x?.name||'');
  return CY_V87_MILESTONES.find(v=>n&&cyV87Norm(v.name).includes(n.replace(/추가모집/g,'')))||CY_V87_MILESTONES.find(v=>n&&n.includes(cyV87Norm(v.name).replace(/추가모집/g,'')))||null;
}
function cyV87FmtAt(iso){
  if(!iso)return '-';
  const d=new Date(iso);if(Number.isNaN(d.getTime()))return iso;
  return `${d.getMonth()+1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function cyV87MilestoneHtml(m){
  if(!m)return '';
  return `<div class="cy-v87-milestones">
    ${m.result?`<div class="cy-v87-mile"><span>🎯</span><div><small>${esc(m.result.label||'결과 발표')}</small><b>${esc(cyV87FmtAt(m.result.at))}</b></div></div>`:''}
    ${m.documents?`<div class="cy-v87-mile"><span>📄</span><div><small>${esc(m.documents.label||'서류 제출')}</small><b>${esc(m.documents.text||'-')}</b></div></div>`:''}
    ${m.contract?`<div class="cy-v87-mile"><span>🏠</span><div><small>${esc(m.contract.label||'계약')}</small><b>${esc(m.contract.text||'-')}</b></div></div>`:''}
    ${m.check?`<div class="cy-v87-check"><b>확인 방법</b><br>${esc(m.check)}</div>`:''}
    ${m.warning?`<div class="cy-v87-warning">⚠️ ${esc(m.warning)}</div>`:''}
    ${m.source?`<a class="cy-v87-source" href="${esc(m.source)}" target="_blank" rel="noopener">공식 공고에서 확인</a>`:''}
  </div>`;
}

const _cyV87TrackingCard=trackingCard;
trackingCard=function(x){
  let html=_cyV87TrackingCard(x);
  const m=cyV87MilestoneForTrack(x);
  if(!m)return html;
  const block=cyV87MilestoneHtml(m);
  return html.replace('<div class="track-actions">',block+'<div class="track-actions">');
};

renderSchedule=function(){
  const root=document.getElementById('scheduleList');if(!root)return;
  const rows=(Array.isArray(TRACKING)?TRACKING:[]).filter(x=>x.status!=='취소/추적중단');
  root.innerHTML=`<div class="cy-v87-private-note"><strong>내 추적 기준 일정</strong><br>발표·서류·계약 날짜는 공고에서 가져오고, 저장/추적 여부 자체는 현재 이 기기에만 저장됩니다.</div>${rows.length?rows.map(x=>{
    const m=cyV87MilestoneForTrack(x);
    if(!m)return `<article class="card cy-v87-schedule-card"><div class="cy-v87-schedule-head"><span>◷</span><div><strong>${esc(x.name||'')}</strong><small>${esc(x.status||'')}</small></div></div>${x.next?`<div class="cy-v87-next-result"><small>다음 일정</small><b>${esc(x.next)}</b></div>`:''}<button class="mini edit-track" data-id="${esc(x.id)}">수정</button></article>`;
    return `<article class="card cy-v87-schedule-card">
      <div class="cy-v87-schedule-head"><span>✅</span><div><strong>${esc(x.name||'')}</strong><small>${esc(x.status||'신청완료')}</small></div></div>
      ${m.result?`<div class="cy-v87-next-result"><small>${esc(m.result.label||'서류심사 대상자 발표')}</small><b>${esc(cyV87FmtAt(m.result.at))}</b></div>`:''}
      <div class="cy-v87-schedule-meta">${m.documents?`<div>📄 <b>${esc(m.documents.label||'서류')}</b> · ${esc(m.documents.text||'-')}</div>`:''}${m.contract?`<div>🏠 <b>${esc(m.contract.label||'계약')}</b> · ${esc(m.contract.text||'-')}</div>`:''}${m.check?`<div>🔎 <b>확인</b> · ${esc(m.check)}</div>`:''}</div>
      ${m.warning?`<div class="cy-v87-warning">⚠️ ${esc(m.warning)}</div>`:''}
      ${m.source?`<a class="cy-v87-source" href="${esc(m.source)}" target="_blank" rel="noopener">공식 공고</a>`:''}
      <button class="mini edit-track" data-id="${esc(x.id)}">수정</button>
    </article>`;
  }).join(''):'<div class="empty">등록된 추적 공고가 없습니다.</div>'}`;
};

async function cyV87LoadMilestones(){
  try{
    const r=await fetch('data/tracking-milestones.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const j=await r.json();CY_V87_MILESTONES=Array.isArray(j?.items)?j.items:[];
    if(typeof renderTracking==='function')renderTracking();
    if(typeof renderSchedule==='function')renderSchedule();
  }catch(e){console.warn('tracking milestones load failed',e)}
}

const _cyV87RenderHero=renderHero;
renderHero=function(){_cyV87RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V87_VERSION};
const _cyV87RenderSettings=renderSettings;
renderSettings=function(){_cyV87RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V87_VERSION};
window.addEventListener('DOMContentLoaded',()=>{
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V87_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V87_VERSION;
  cyV87LoadMilestones();
});
