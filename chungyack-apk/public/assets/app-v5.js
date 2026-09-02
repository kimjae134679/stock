// v0.5: SH 행복주택 상세후보/근거 표시 + 앱 버전 보정.
const CY_V5_VERSION='0.5.0';

const _cyV5RenderHero=renderHero;
renderHero=function(){
  _cyV5RenderHero();
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V5_VERSION;
};
const _cyV5RenderSettings=renderSettings;
renderSettings=function(){
  _cyV5RenderSettings();
  const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V5_VERSION;
};

const _cyV5EligibilityHtml=cyV4EligibilityHtml;
cyV4EligibilityHtml=function(item){
  const x=item?.eligibility;
  if(x?.level!=='possible')return _cyV5EligibilityHtml(item);
  return `<div class="cy-v4-eligibility cy-v5-possible"><b>${esc(x.title||'🟢 현재 조건상 신청 가능성 있음')}</b>${x.reason?`<div class="cy-v4-reason">${esc(x.reason)}</div>`:''}${x.check?`<div class="cy-v4-check"><b>다시 볼 조건:</b> ${esc(x.check)}</div>`:''}</div>`;
};

function cyV5CandidateHtml(x){
  return `<div class="cy-v5-candidate">
    <div class="cy-v5-candidate-head"><b>${esc(x.name||'')}</b><span>${esc(x.district||'')} · ${esc(x.areaPyeong||'')}</span></div>
    <div class="cy-v5-price"><div><small>민간 화면 월세표시</small><b>${esc(x.displayRent||'-')}</b></div><div><small>민간 화면 준비금표시</small><b>${esc(x.displayReady||'-')}</b></div></div>
    <div class="cy-v5-verify">⚠️ ${esc(x.verification||'공식 공급표 재확인')}</div>
  </div>`;
}
function cyV5IncomeHtml(item){
  const x=item?.incomeEvidence;if(!x)return '';
  return `<div class="cy-v5-income"><b>📄 이번 회차 소득표</b><div>${esc(x.label||'')}</div><strong>${Number(x.onePerson100Adjusted||0).toLocaleString('ko-KR')}원</strong><small>${esc(x.note||'')}</small></div>`;
}
function cyV5DetailsHtml(item){
  const candidates=Array.isArray(item?.candidates)?item.candidates:[];
  const evidence=Array.isArray(item?.evidenceExamples)?item.evidenceExamples:[];
  let html=cyV5IncomeHtml(item);
  if(candidates.length){
    html+=`<details class="cy-v5-candidates" open><summary>🏠 사용자 제공 화면에서 발견한 행복주택 후보 ${candidates.length}곳</summary><div class="cy-v5-candidate-list">${candidates.map(cyV5CandidateHtml).join('')}</div>${item.candidateNote?`<div class="cy-v5-source-note">${esc(item.candidateNote)}</div>`:''}</details>`;
  }
  if(evidence.length){
    html+=`<details class="cy-v5-evidence"><summary>발견 화면 예시 ${evidence.length}건</summary>${evidence.map(x=>`<div>${esc(x)}</div>`).join('')}</details>`;
  }
  return html;
}

const _cyV5OpportunityCard=cyV4OpportunityCard;
cyV4OpportunityCard=function(item){
  let html=_cyV5OpportunityCard(item);
  const extra=`${item.featured?'<div class="cy-v5-featured">🔥 현재 메인 검토</div>':''}${cyV5DetailsHtml(item)}`;
  if(!extra)return html;
  return html.replace('<div class="cy-v4-next">',extra+'<div class="cy-v4-next">');
};

function cyV5DiscoveryHtml(){
  const arr=Array.isArray(CY_OPPORTUNITY_DATA?.discoveryOnly)?CY_OPPORTUNITY_DATA.discoveryOnly:[];
  if(!arr.length)return '';
  return `<details class="cy-v5-discovery"><summary>🔎 후보 발견용 자료 ${arr.length}건</summary>${arr.map(x=>`<div class="cy-v5-discovery-item"><b>${esc(x.name||'')}</b><small>${esc(x.sourceType||'')}</small><p>${esc(x.note||'')}</p></div>`).join('')}</details>`;
}
const _cyV5RenderRecommendations=renderRecommendations;
renderRecommendations=function(){
  _cyV5RenderRecommendations();
  const list=document.getElementById('recommendList');
  if(!list||!CY_OPPORTUNITY_DATA)return;
  const d=cyV5DiscoveryHtml();
  if(d)list.insertAdjacentHTML('beforeend',d);
};

function cyV5MergeDiscoveryExtra(extra){
  if(!CY_OPPORTUNITY_DATA||!Array.isArray(extra?.items))return false;
  if(!Array.isArray(CY_OPPORTUNITY_DATA.discoveryOnly))CY_OPPORTUNITY_DATA.discoveryOnly=[];
  const keys=new Set(CY_OPPORTUNITY_DATA.discoveryOnly.map(x=>x.id||x.name));
  extra.items.forEach(x=>{const k=x.id||x.name;if(k&&!keys.has(k)){CY_OPPORTUNITY_DATA.discoveryOnly.push(x);keys.add(k);}});
  return true;
}
async function cyV5LoadDiscoveryExtra(retry=0){
  try{
    if(!CY_OPPORTUNITY_DATA){if(retry<20)setTimeout(()=>cyV5LoadDiscoveryExtra(retry+1),150);return;}
    const res=await fetch('data/discovery-extra.json?ts='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const extra=await res.json();
    if(cyV5MergeDiscoveryExtra(extra))renderRecommendations();
  }catch(e){console.warn('discovery extra load skipped',e);}
}

function cyV5RefreshVersion(){
  const a=document.getElementById('appVersion');if(a)a.textContent='v'+CY_V5_VERSION;
  const b=document.getElementById('settingsVersion');if(b)b.textContent=CY_V5_VERSION;
}
window.addEventListener('DOMContentLoaded',()=>{cyV5RefreshVersion();cyV5LoadDiscoveryExtra();});
