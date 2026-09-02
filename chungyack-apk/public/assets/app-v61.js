// v0.6.1: SH 2026년 2차 행복주택 청년 현재회차 검증자료 표시.
const CY_V61_VERSION='0.6.1';
let CY_V61_HAPPY=null;

function cyV61Manwon(v,digits=0){
  if(v===null||v===undefined||!Number.isFinite(Number(v)))return '-';
  const n=Number(v)/10000;
  return n.toLocaleString('ko-KR',{minimumFractionDigits:digits,maximumFractionDigits:digits})+'만';
}
function cyV61Count(v,label){return v===null||v===undefined?`${label} 확인중`:`${label} ${Number(v).toLocaleString('ko-KR')}`}
function cyV61RowMap(){return new Map((CY_V61_HAPPY?.rows||[]).map(x=>[x.key,x]))}
function cyV61VerificationLabel(row){
  if(!row)return '⚠️ 현재회차 청년 공급행 확인 대기';
  if(row.verification==='C_SUPPLY_ONLY_PRICE_CONFLICT')return '🟠 청년 공급수 파싱 확인 · 가격 공식표 대조 대기';
  return '🟠 현재회차 파싱 확인(C) · SH 공식표 최종대조 대기';
}
function cyV61ParsedRowHtml(row,{compact=false}={}){
  if(!row)return '';
  const supply=cyV61Count(row.supply,'공급');
  const reserve=cyV61Count(row.reserve,'예비');
  const split=(row.priority!==null&&row.priority!==undefined)||(row.general!==null&&row.general!==undefined)
    ? `<span>우선 ${row.priority??'-'} · 일반 ${row.general??'-'}</span>`:'';
  const price=row.incomeYes
    ? `<div class="cy-v61-price"><div><small>소득 있음</small><b>보증금 ${cyV61Manwon(row.incomeYes.deposit)}</b><span>월 ${cyV61Manwon(row.incomeYes.rent,1)}</span></div>${row.incomeNo?`<div><small>소득 없음</small><b>보증금 ${cyV61Manwon(row.incomeNo.deposit)}</b><span>월 ${cyV61Manwon(row.incomeNo.rent,1)}</span></div>`:''}</div>`
    : '<div class="cy-v61-price-pending">임대조건은 출처간 충돌/미확정 → 공식표 대조 전 표시 보류</div>';
  return `<div class="cy-v61-row ${compact?'compact':''}">
    <div class="cy-v61-row-head"><b>${esc(row.name||'')}</b><span>${esc(row.district||'')} · ${esc(row.type||'')}㎡</span></div>
    <div class="cy-v61-counts"><strong>${supply}</strong><strong>${reserve}</strong>${split}</div>
    ${price}
    ${row.referenceAddress?`<div class="cy-v61-address">참고주소: ${esc(row.referenceAddress)} <small>· 공식주소 대조 전 지도핀 미사용</small></div>`:''}
    ${row.note?`<div class="cy-v61-note">${esc(row.note)}</div>`:''}
    <div class="cy-v61-verification">${cyV61VerificationLabel(row)}</div>
  </div>`;
}
function cyV61ScreenCandidateHtml(x,rowMap){
  const row=x.rowKey?rowMap.get(x.rowKey):null;
  const status=row?cyV61VerificationLabel(row):'⚠️ 사용자 화면 후보 · 이번 회차 청년 공급수 확인 대기';
  return `<div class="cy-v61-screen-item">
    <div class="cy-v61-row-head"><b>${esc(x.displayName||'')}</b><span>${esc(x.district||'')} · ${esc(x.areaPyeong||'')}</span></div>
    <div class="cy-v61-screen-values"><span>화면 월세표시 <b>${esc(x.screenRent||'-')}</b></span><span>화면 준비금표시 <b>${esc(x.screenReady||'-')}</b></span></div>
    ${row?`<div class="cy-v61-screen-match"><b>현재회차 청년</b> · ${cyV61Count(row.supply,'공급')} · ${cyV61Count(row.reserve,'예비')}${row.priority!==null&&row.priority!==undefined?` · 우선 ${row.priority} / 일반 ${row.general}`:''}</div>${row.incomeYes?`<div class="cy-v61-screen-match">소득있음 기준: 보증금 ${cyV61Manwon(row.incomeYes.deposit)} / 월 ${cyV61Manwon(row.incomeYes.rent,1)}</div>`:''}`:''}
    <div class="cy-v61-verification">${status}</div>
  </div>`;
}
function cyV61HappyHtml(){
  if(!CY_V61_HAPPY)return '<div class="cy-v61-loading">행복주택 청년 검증자료 불러오는 중…</div>';
  const map=cyV61RowMap();
  const screens=Array.isArray(CY_V61_HAPPY.screenCandidates)?CY_V61_HAPPY.screenCandidates:[];
  const screenKeys=new Set(screens.map(x=>x.rowKey).filter(Boolean));
  const extras=(CY_V61_HAPPY.rows||[]).filter(x=>!screenKeys.has(x.key)).sort((a,b)=>(b.supply||0)-(a.supply||0)||(b.reserve||0)-(a.reserve||0));
  const matched=screens.filter(x=>x.rowKey&&map.has(x.rowKey)).length;
  const finalState=CY_V61_HAPPY.officialFinal===true?'✅ SH 공식 공급표 대조 완료':'🟠 SH 공식 PDF/공급표 최종대조 전';
  return `<div class="cy-v61-happy">
    <div class="cy-v61-warning"><b>📊 현재회차 청년 검증 진행</b><span>${finalState} · 사용자 화면 8곳 중 ${matched}곳 청년행 연결 · 추가 청년 후보 ${extras.length}곳 수집</span><small>${esc(CY_V61_HAPPY.warning||'')}</small></div>
    <details class="cy-v61-details" open><summary>사용자 화면 8곳 · 실제 청년 물량 대조</summary><div class="cy-v61-screen-list">${screens.map(x=>cyV61ScreenCandidateHtml(x,map)).join('')}</div></details>
    <details class="cy-v61-details"><summary>추가로 찾은 현재회차 청년 후보 ${extras.length}곳</summary><div class="cy-v61-extra-list">${extras.map(x=>cyV61ParsedRowHtml(x,{compact:true})).join('')}</div></details>
    <div class="cy-v61-final-warning">⚠️ 위 숫자는 현재 공고 파싱·교차확인 C단계입니다. SH 공식 PDF/공급표 대조가 끝나기 전에는 확정값으로 신청 판단하지 않습니다.</div>
  </div>`;
}

const _cyV61OpportunityCard=cyV4OpportunityCard;
cyV4OpportunityCard=function(item){
  let html=_cyV61OpportunityCard(item);
  if(item?.id!=='sh-happy-2026-2')return html;
  return html.replace('<div class="cy-v4-next">',cyV61HappyHtml()+'<div class="cy-v4-next">');
};

const _cyV61RenderRecommendations=renderRecommendations;
renderRecommendations=function(){
  _cyV61RenderRecommendations();
  const a=document.getElementById('appVersion');if(a)a.textContent='v'+CY_V61_VERSION;
  const b=document.getElementById('settingsVersion');if(b)b.textContent=CY_V61_VERSION;
};

async function cyV61LoadHappy(){
  try{
    const res=await fetch('data/sh-happy-2026-2-youth.json?ts='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    CY_V61_HAPPY=await res.json();
    renderRecommendations();
  }catch(e){console.warn('SH happy youth verification data load failed',e);}
}
window.addEventListener('DOMContentLoaded',()=>{
  const a=document.getElementById('appVersion');if(a)a.textContent='v'+CY_V61_VERSION;
  const b=document.getElementById('settingsVersion');if(b)b.textContent=CY_V61_VERSION;
  cyV61LoadHappy();
});
