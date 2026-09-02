// v0.3.2 targeted safety/UI fixes layered after app.js.
// Keep catalog-derived tracking IDs stable so repeated taps edit the existing item.
STATUS_ICON['취소/추적중단']='⏸';

addCatalogToTracking=function(id){
  const x=CATALOG.find(v=>v.id===id);
  if(!x)return;
  const stableId=`catalog-${id}`;
  const existing=TRACKING.find(t=>t.id===stableId);
  if(existing){openTrackEditor(existing);return;}
  openTrackEditor({
    id:stableId,
    name:`${x.name} ${x.type}㎡`,
    type:`${x.type}㎡`,
    appliedAt:new Date().toISOString().slice(0,10),
    status:'신청완료',
    next:'',
    detail:`모집세대수 ${x.units} · 보증금 ${x.deposit} · 월 ${x.rent}`,
    address:x.address
  });
};

function exportLocalState(){
  const payload={
    schema:'chungyack-local-v1',
    exportedAt:new Date().toISOString(),
    filters:FILTERS,
    tracking:TRACKING
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`chungyack-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

async function importLocalState(file){
  if(!file)return;
  try{
    const parsed=JSON.parse(await file.text());
    if(parsed?.schema!=='chungyack-local-v1')throw new Error('지원하지 않는 백업 형식');
    if(!Array.isArray(parsed.tracking)||!parsed.filters)throw new Error('필수 데이터 누락');
    TRACKING=parsed.tracking;
    FILTERS=parsed.filters;
    saveTracking();
    saveFilters();
    syncFilterControls();
    renderAll();
    alert('백업을 복원했습니다.');
  }catch(e){
    console.error(e);
    alert('백업을 가져오지 못했습니다: '+e.message);
  }
}

function hourlyMapUrl(address){
  return 'https://map.naver.com/p/search/'+encodeURIComponent(address||'');
}

function eligibilityClass(level){
  if(level==='impossible')return 'eligibility-impossible';
  if(level==='conditional')return 'eligibility-conditional';
  if(level==='possible')return 'eligibility-possible';
  return 'eligibility-review';
}

function hourlyEligibilityHtml(item){
  const x=item?.eligibility;
  if(!x)return '';
  const title=x.title||({
    impossible:'❌ 현재 조건상 사실상 신청 불가',
    conditional:'⚠️ 조건에 따라 신청 가능',
    possible:'🟢 현재 조건상 신청 가능성 있음',
    review:'⚠️ 추가 확인 후 판정'
  }[x.level]||'⚠️ 내 조건 판정');
  return `<div class="hourly-item-eligibility ${eligibilityClass(x.level)}"><b>${esc(title)}</b>${x.reason?`<div class="eligibility-reason">${esc(x.reason)}</div>`:''}${x.check?`<div class="eligibility-check"><b>다시 볼 조건:</b> ${esc(x.check)}</div>`:''}</div>`;
}

function ensureHourlyReportStyles(){
  if(document.getElementById('hourlyReportStyles'))return;
  const style=document.createElement('style');
  style.id='hourlyReportStyles';
  style.textContent=`
    .hourly-report{margin:18px 0 22px}.hourly-report-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px}.hourly-report-head h2{margin:0;font-size:20px}.hourly-report-head small{opacity:.68;text-align:right}.hourly-report-meta{padding:12px 14px;border-radius:14px;background:rgba(20,36,92,.07);margin-bottom:12px;font-size:13px;line-height:1.55}.hourly-groups{display:grid;gap:12px}.hourly-group{border-radius:18px;padding:14px;background:var(--card,#fff);box-shadow:0 8px 22px rgba(17,24,39,.06)}.hourly-group-title{font-weight:800;margin-bottom:9px}.hourly-item{padding:10px 0;border-top:1px solid rgba(17,24,39,.08)}.hourly-item:first-of-type{border-top:0}.hourly-item-name{font-weight:750}.hourly-item-status{font-size:13px;line-height:1.5;margin-top:3px;opacity:.82}.hourly-item-address{font-size:12px;line-height:1.45;margin-top:5px;opacity:.68}.hourly-item-address a{margin-left:6px;font-weight:700}.hourly-empty{font-size:13px;opacity:.65;padding:8px 0}
    .hourly-item-eligibility{margin-top:9px;padding:11px 12px;border-radius:13px;border:1px solid;line-height:1.55;font-size:12.5px}.hourly-item-eligibility>b{display:block;font-size:13.5px;margin-bottom:4px}.eligibility-reason{font-weight:700}.eligibility-check{margin-top:5px;font-size:11.5px;opacity:.9}
    .eligibility-impossible{background:#ffe8e6;border-color:#ef8d86;border-left:7px solid #d92d20;color:#781a14;box-shadow:0 4px 14px rgba(217,45,32,.14)}
    .eligibility-impossible>b{font-size:14px;font-weight:900;color:#b42318}.eligibility-impossible .eligibility-reason{font-weight:800;color:#7a1d17}.eligibility-impossible .eligibility-check{color:#8b3a34}
    .eligibility-conditional{background:#fff4df;border-color:#f4bd5f;border-left:6px solid #e38b15;color:#754506}
    .eligibility-possible{background:#eaf8f1;border-color:#91d1b2;border-left:6px solid #1f9d69;color:#176b4a}
    .eligibility-review{background:#f1f5fa;border-color:#bfd0e3;border-left:6px solid #5b7fa8;color:#36536f}
  `;
  document.head.appendChild(style);
}

async function loadHourlyReport(){
  try{
    const res=await fetch('data/hourly-report.json?ts='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const report=await res.json();
    renderHourlyReport(report);
  }catch(e){
    console.error('hourly report load failed',e);
  }
}

function renderHourlyReport(report){
  ensureHourlyReportStyles();
  const home=document.querySelector('.page[data-page="home"]');
  if(!home)return;
  let root=document.getElementById('hourlyReport');
  if(!root){
    root=document.createElement('section');
    root.id='hourlyReport';
    root.className='hourly-report';
    home.insertBefore(root,home.firstChild);
  }
  const updated=report?.updatedAt?new Date(report.updatedAt).toLocaleString('ko-KR'):'-';
  const groups=Array.isArray(report?.groups)?report.groups:[];
  root.innerHTML=`<div class="hourly-report-head"><h2>${esc(report?.title||'청약2 시간별 보고')}</h2><small>최신 갱신 ${esc(updated)}</small></div><div class="hourly-report-meta"><b>${esc(report?.status||'')}</b>${report?.notice?`<br>${esc(report.notice)}`:''}</div><div class="hourly-groups">${groups.map(g=>`<article class="hourly-group"><div class="hourly-group-title">${esc(g.icon||'')} ${esc(g.title||'')}</div>${Array.isArray(g.items)&&g.items.length?g.items.map(x=>`<div class="hourly-item"><div class="hourly-item-name">${esc(x.name||'')}</div><div class="hourly-item-status">${esc(x.status||'')}</div>${hourlyEligibilityHtml(x)}${x.address?`<div class="hourly-item-address">${esc(x.address)} <a href="${hourlyMapUrl(x.address)}" target="_blank" rel="noopener">지도</a></div>`:''}</div>`).join(''):'<div class="hourly-empty">현재 표시할 공고 없음</div>'}</article>`).join('')}</div>`;
}

window.addEventListener('DOMContentLoaded',()=>{
  const exportBtn=document.getElementById('exportLocalBtn');
  const importBtn=document.getElementById('importLocalBtn');
  const importFile=document.getElementById('importLocalFile');
  if(exportBtn)exportBtn.addEventListener('click',exportLocalState);
  if(importBtn&&importFile)importBtn.addEventListener('click',()=>importFile.click());
  if(importFile)importFile.addEventListener('change',()=>{const f=importFile.files?.[0];importLocalState(f);importFile.value='';});
  loadHourlyReport();
});

window.__CY_HANDLE_NATIVE_BACK__=function(){
  const editor=document.getElementById('trackingEditor');
  if(editor?.open){editor.close();return true;}
  const active=document.querySelector('.page.active');
  if(active && active.dataset.page!=='home'){
    openPage('home');
    return true;
  }
  return false;
};