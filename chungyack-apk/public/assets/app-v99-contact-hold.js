// v0.9.9 live: contact-only result handling.
// Individual SMS/email/phone notification results stay in HOLD after announcement.
// They auto-move to rejected only after BOTH: 7 days from result announcement and document window ended.
const CY_V99_VERSION='0.9.9-live';

function cyV99Milestone(x){
  try{return typeof cyV94Milestone==='function'?cyV94Milestone(x):null}catch{return null}
}
function cyV99Verification(x){
  try{return typeof cyV94Verification==='function'?cyV94Verification(x):null}catch{return null}
}
function cyV99ContactBased(m){
  const check=String(m?.check||'');
  if(!check)return false;
  // Public-list-first notices (e.g. LH) should be decided from the official list, not inbox silence.
  if(/LH청약플러스|서류제출대상자\s*명단|명단을\s*우선\s*확인/.test(check))return false;
  return /(개별\s*연락|문자|전화|이메일|등록한?\s*연락처|신청\s*시\s*등록한\s*연락처|사업자\s*안내)/.test(check);
}
function cyV99ResultAt(m){
  const t=Date.parse(m?.result?.at||'');return Number.isFinite(t)?t:0;
}
function cyV99DocumentEnd(m){
  const text=String(m?.documents?.text||'');
  const dates=[...text.matchAll(/(20\d{2})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2}))?/g)];
  if(!dates.length)return 0;
  const d=dates[dates.length-1];
  const year=Number(d[1]),month=Number(d[2])-1,day=Number(d[3]);
  const hour=d[4]===undefined?23:Number(d[4]);
  const minute=d[5]===undefined?59:Number(d[5]);
  return Date.UTC(year,month,day,hour-9,minute,d[4]===undefined?59:0);
}
function cyV99AutoRejectAt(m){
  const result=cyV99ResultAt(m);if(!result)return 0;
  const week=result+7*24*60*60*1000;
  const docs=cyV99DocumentEnd(m);
  return Math.max(week,docs||0);
}
function cyV99FmtDate(ms){
  if(!ms)return '';
  try{return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(ms))}catch{return new Date(ms).toLocaleString('ko-KR')}
}
function cyV99ManualResult(x){
  if(x?.resultOverride==='selected'||/당첨|예비/.test(String(x?.status||'')))return 'selected';
  if(x?.resultOverride==='rejected'||/탈락|부적격|미선정/.test(`${x?.status||''} ${x?.detail||''}`))return 'rejected';
  if(x?.resultOverride==='check')return 'check';
  return null;
}

if(typeof cyV94Category==='function'){
  const _cyV99BaseCategory=cyV94Category;
  cyV94Category=function(x){
    const manual=cyV99ManualResult(x);if(manual)return manual;
    const v=cyV99Verification(x);
    if(v?.state==='found'&&v?.stage==='final')return 'selected';
    if(v?.state==='not_found'&&v?.final===true)return 'rejected';
    if(v?.state==='found'&&['documents','screening'].includes(v?.stage))return 'active';
    const m=cyV99Milestone(x),resultAt=cyV99ResultAt(m),now=Date.now();
    if(cyV99ContactBased(m)&&resultAt&&now>=resultAt){
      const rejectAt=cyV99AutoRejectAt(m);
      if(rejectAt&&now>=rejectAt)return 'rejected';
      return 'hold';
    }
    if(x?.resultOverride==='hold'||String(x?.status||'')==='보류')return 'hold';
    return _cyV99BaseCategory(x);
  };
}

if(typeof cyV94Meta==='function'){
  const _cyV99BaseMeta=cyV94Meta;
  cyV94Meta=function(cat){if(cat==='hold')return ['⏸','보류'];return _cyV99BaseMeta(cat)};
}
if(typeof cyV94ResultNote==='function'){
  const _cyV99BaseNote=cyV94ResultNote;
  cyV94ResultNote=function(x,cat){
    if(cat==='hold'){
      const m=cyV99Milestone(x),rejectAt=cyV99AutoRejectAt(m);
      return `문자·이메일·전화 개별통보 대기${rejectAt?` · ${cyV99FmtDate(rejectAt)}까지 연락 없으면 탈락 처리`:''}`;
    }
    return _cyV99BaseNote(x,cat);
  };
}

if(typeof cyV95SetResult==='function'){
  const _cyV99BaseSetResult=cyV95SetResult;
  cyV95SetResult=function(id,state){
    if(state!=='hold')return _cyV99BaseSetResult(id,state);
    const x=(Array.isArray(TRACKING)?TRACKING:[]).find(v=>String(v.id)===String(id));if(!x)return;
    x.resultOverride='hold';x.status='보류';x.statusIcon='⏸';x.resultOverrideAt=new Date().toISOString();
    if(typeof saveTracking==='function')saveTracking();
    try{if(typeof renderTracking==='function')renderTracking()}catch{}
    try{if(typeof cyV94RenderResults==='function')cyV94RenderResults()}catch{}
    try{if(typeof cyV94RenderApplications==='function')cyV94RenderApplications()}catch{}
    try{if(typeof renderHero==='function')renderHero()}catch{}
    if(typeof cyToast==='function')cyToast('보류로 이동했습니다.');
  };
}
if(typeof cyV95ActionsHtml==='function'){
  cyV95ActionsHtml=function(x){
    const url=typeof cyV95OfficialUrl==='function'?cyV95OfficialUrl(x):'';
    const status=String(x?.status||'');
    return `<div class="cy-v95-result-actions">
      ${url?`<a class="cy-v95-official" href="${cyV94Esc(url)}" target="_blank" rel="noopener">공식 확인 ↗</a>`:'<span class="cy-v95-no-link">공식 링크 없음</span>'}
      <div class="cy-v95-move-row cy-v99-move-row">
        <button type="button" data-cy-v95-state="check" data-id="${cyV94Esc(x.id)}" class="${x?.resultOverride==='check'?'on':''}">확인</button>
        <button type="button" data-cy-v95-state="hold" data-id="${cyV94Esc(x.id)}" class="hold ${x?.resultOverride==='hold'||status==='보류'?'on':''}">보류</button>
        <button type="button" data-cy-v95-state="pass" data-id="${cyV94Esc(x.id)}" class="${status==='당첨'?'on':''}">합격</button>
        <button type="button" data-cy-v95-state="wait" data-id="${cyV94Esc(x.id)}" class="${status==='예비'?'on':''}">예비</button>
        <button type="button" data-cy-v95-state="reject" data-id="${cyV94Esc(x.id)}" class="danger ${x?.resultOverride==='rejected'||status==='탈락'?'on':''}">탈락</button>
      </div>
    </div>`;
  };
}

function cyV99ResultCounts(){
  const out={check:0,hold:0,selected:0,rejected:0};
  (Array.isArray(TRACKING)?TRACKING:[]).forEach(x=>{const c=cyV94Category(x);if(out[c]!==undefined)out[c]++});
  return out;
}
function cyV99RenderResults(){
  const page=document.querySelector('.page[data-page="recommend"]');if(!page)return;
  const counts=cyV99ResultCounts();
  if(!['check','hold','selected','rejected'].includes(CY_V94_RESULT_FILTER))CY_V94_RESULT_FILTER='check';
  const rows=(Array.isArray(TRACKING)?TRACKING:[]).filter(x=>cyV94Category(x)===CY_V94_RESULT_FILTER);
  const defs=[['check','확인 필요'],['hold','보류'],['selected','합격·예비'],['rejected','탈락']];
  page.innerHTML=`
    <div class="section-head cy-v94-result-head"><h2>결과 확인</h2><small>발표·개별통보 결과 정리</small></div>
    <div class="cy-v94-result-tabs cy-v99-result-tabs">${defs.map(([id,label])=>`<button type="button" data-cy-v94-result="${id}" class="${CY_V94_RESULT_FILTER===id?'on':''}"><span>${label}</span><b>${counts[id]}</b></button>`).join('')}</div>
    <div class="cy-v94-result-summary">개별 문자·이메일·전화형은 발표 후 보류. 7일이 지나고 서류제출 기간도 끝났는데 연락이 없으면 자동 탈락으로 정리합니다.</div>
    <div class="cy-v94-result-list">${rows.length?rows.map(cyV94ResultCard).join(''):`<div class="empty">${CY_V94_RESULT_FILTER==='check'?'지금 직접 확인할 결과가 없습니다.':CY_V94_RESULT_FILTER==='hold'?'현재 연락 대기 중인 결과가 없습니다.':'이 분류에 들어간 결과가 없습니다.'}</div>`}</div>`;
  page.querySelectorAll('[data-cy-v94-result]').forEach(btn=>btn.addEventListener('click',()=>{
    CY_V94_RESULT_FILTER=btn.dataset.cyV94Result;
    localStorage.setItem(CY_V94_RESULT_FILTER_KEY,CY_V94_RESULT_FILTER);
    cyV99RenderResults();
  }));
  try{if(typeof cyV95Wire==='function')cyV95Wire()}catch{}
  cyV99Stamp();
}
if(typeof cyV94RenderResults==='function')cyV94RenderResults=cyV99RenderResults;

function cyV99Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V99_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V99_VERSION;
}
function cyV99Refresh(){
  try{cyV99RenderResults()}catch(e){console.warn('[ChungYack] v0.9.9 result refresh failed',e)}
  cyV99Stamp();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>{setTimeout(cyV99Refresh,100)},{once:true});else setTimeout(cyV99Refresh,100);
setInterval(()=>{try{cyV99Refresh()}catch{}},5*60*1000);
