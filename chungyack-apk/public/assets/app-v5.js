// v0.5.0: sortable public notices, reversible skip/collapse, verified-time overrides, optional private GitHub state sync.
const CY5_APP_VERSION='0.5.0';
const CY5_DECISIONS_KEY='chungyack.notice-decisions.v1';
const CY5_SORT_KEY='chungyack.notice-sort.v1';
const CY5_TRACK_SYNC_KEY='chungyack.tracking-sync-meta.v1';
const CY5_REMOTE_OVERRIDES='https://raw.githubusercontent.com/kimjae134679/stock/main/chungyack-apk/public/data/report-overrides.json';
const CY5_SYNC_TARGET={owner:'kimjae134679',repo:'ChungYack',path:'data/app_user_state.json',branch:'main'};
let CY5_OVERRIDES=null;
let CY5_SYNC_CONFIGURED=false;
let CY5_SYNC_READY=false;
let CY5_SYNC_TIMER=null;
let CY5_APPLYING_REMOTE=false;

function cy5Now(){return new Date().toISOString()}
function cy5Json(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}}
function cy5Decisions(){const v=cy5Json(CY5_DECISIONS_KEY,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
function cy5SortState(){const v=cy5Json(CY5_SORT_KEY,null);return v&&['time','recommend'].includes(v.mode)?v:{mode:'time',updatedAt:'1970-01-01T00:00:00.000Z'}}
function cy5Location(x){return x.address||x.station||x.region||x.institution||'위치 확인 필요'}
function cy5TimeText(x){
  if(x.timeLabel)return String(x.timeLabel);
  if(x.startAt&&x.endAt)return `${cy4FmtDate(x.startAt)} ~ ${cy4FmtDate(x.endAt)}`;
  if(x.startAt)return `${cy4FmtDate(x.startAt)} 시작`;
  if(x.endAt)return `${cy4FmtDate(x.endAt)} 마감`;
  return x.status||'시간 확인 필요';
}
function cy5State(x){
  if(x.timePrecision==='open-ended')return{cls:'active',text:x.timeLabel||'접수 가능 · 종료시각 미기재'};
  if(x.timePrecision==='unknown')return{cls:'',text:x.timeLabel||'마감시각 재확인 필요'};
  return cy4State(x);
}
function cy5Decision(x){return cy5Decisions()[x.id]||null}
function cy5SaveDecision(x,skipped){
  const all=cy5Decisions();
  all[x.id]={skipped:!!skipped,updatedAt:cy5Now(),name:x.name,time:cy5TimeText(x),location:cy5Location(x),officialUrl:x.officialUrl||'',applyUrl:x.applyUrl||''};
  localStorage.setItem(CY5_DECISIONS_KEY,JSON.stringify(all));
  cy5RenderPublicViews();
  cy5ScheduleSync();
}
function cy5SetSort(mode){
  if(!['time','recommend'].includes(mode))return;
  localStorage.setItem(CY5_SORT_KEY,JSON.stringify({mode,updatedAt:cy5Now()}));
  cy5RenderPublicViews();
  cy5ScheduleSync();
}
function cy5PriorityScore(x){
  if(Number.isFinite(Number(x.recommendScore)))return Number(x.recommendScore);
  return({hot:100,review:75,normal:50,hold:30,ineligible:5}[x.priority]??45)+(x.address?4:0)+(x.endAt?3:0)+(x.applyUrl?2:0);
}
function cy5TimeKey(x){
  const now=Date.now();
  const start=x.startAt?new Date(x.startAt).getTime():NaN;
  const end=x.endAt?new Date(x.endAt).getTime():NaN;
  if(Number.isFinite(end)&&end>=now)return end;
  if(Number.isFinite(start)&&start>=now)return start;
  if(x.timePrecision==='open-ended')return Number.MAX_SAFE_INTEGER-1000;
  if(x.timePrecision==='unknown')return Number.MAX_SAFE_INTEGER-500;
  return Number.MAX_SAFE_INTEGER;
}
function cy5SortItems(items){
  const a=[...(items||[])];
  const mode=cy5SortState().mode;
  if(mode==='recommend')a.sort((p,q)=>cy5PriorityScore(q)-cy5PriorityScore(p)||cy5TimeKey(p)-cy5TimeKey(q)||String(p.name).localeCompare(String(q.name),'ko'));
  else a.sort((p,q)=>cy5TimeKey(p)-cy5TimeKey(q)||cy5PriorityScore(q)-cy5PriorityScore(p)||String(p.name).localeCompare(String(q.name),'ko'));
  return a;
}
function cy5AllNormalItems(){return (CY4_REPORT?.groups||[]).flatMap(g=>(g.items||[]).filter(x=>x.kind==='normal'))}
function cy5SkippedCount(){const d=cy5Decisions();return cy5AllNormalItems().filter(x=>d[x.id]?.skipped).length}
function cy5RenderSortBars(){
  const mode=cy5SortState().mode,count=cy5SkippedCount();
  document.querySelectorAll('[data-cy5-sort]').forEach(b=>{const on=b.dataset.cy5Sort===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  document.querySelectorAll('.cy5-skip-count').forEach(x=>x.textContent=`넘김 ${count}건`);
}
function cy5PassControl(x,skipped){return `<label class="pass-toggle"><input type="checkbox" class="cy5-pass" data-id="${esc(x.id)}" ${skipped?'checked':''}><span>${skipped?'넘김 취소':'넘김'}</span></label>`}
function cy5Subaddresses(x){
  const list=Array.isArray(x.subaddresses)?x.subaddresses:[];
  if(!list.length)return'';
  return `<details class="live-address-list"><summary>확인된 주소 ${list.length}곳</summary>${list.map(a=>`<div><b>${esc(a.name||'주택')}</b><br>${esc(a.address)} <a target="_blank" rel="noopener" href="${cy4MapUrl(a.address)}">지도</a></div>`).join('')}</details>`;
}
function cy5Links(x){
  const links=[];
  if(x.officialUrl)links.push(`<a class="primary-link" target="_blank" rel="noopener" href="${esc(x.officialUrl)}">${esc(x.sourceLabel||'공식 공고')}</a>`);
  if(x.pdfUrl)links.push(`<a target="_blank" rel="noopener" href="${esc(x.pdfUrl)}">공고 PDF</a>`);
  if(x.houseUrl)links.push(`<a target="_blank" rel="noopener" href="${esc(x.houseUrl)}">주택 상세</a>`);
  if(x.applyUrl)links.push(`<a target="_blank" rel="noopener" href="${esc(x.applyUrl)}">신청하기</a>`);
  if(x.address)links.push(`<a target="_blank" rel="noopener" href="${cy4MapUrl(x.address)}">지도</a>`);
  return links.join('');
}
function cy5Verification(x){
  if(!x.verifiedAt&&!x.verificationNote)return'';
  const t=x.verifiedAt?new Date(x.verifiedAt).toLocaleString('ko-KR'):'';
  return `<div class="verification-line"><b>시간·링크 확인</b> · ${esc(t)}${x.verificationNote?` · ${esc(x.verificationNote)}`:''}</div>`;
}
function cy5LiveCard(x){
  const d=cy5Decision(x),skipped=!!d?.skipped,s=cy5State(x),priority=x.priority||'normal',where=cy5Location(x),time=cy5TimeText(x);
  if(skipped)return `<article class="live-card skipped-collapsed ${priority}" data-notice-id="${esc(x.id)}"><div class="skip-compact-row"><div class="skip-compact-main"><div class="live-name">${esc(x.name)}</div><div class="skip-compact-meta"><span>◷ ${esc(time)}</span><span>📍 ${esc(where)}</span></div></div>${cy5PassControl(x,true)}</div></article>`;
  return `<article class="live-card ${priority}" data-notice-id="${esc(x.id)}"><div class="notice-card-tools">${cy5PassControl(x,false)}</div><div class="live-top"><div><div class="live-name">${esc(x.name)}</div><div class="live-inst">${esc(x.institution||'')}</div></div><span class="live-state ${s.cls}">${esc(s.text)}</span></div><div class="live-tags">${x.supply?`<span class="live-tag supply">${esc(x.supply)}</span>`:''}${x.type?`<span class="live-tag">${esc(x.type)}</span>`:''}${x.deposit?`<span class="live-tag price">보증금 ${esc(x.deposit)}</span>`:''}${x.rent?`<span class="live-tag price">${esc(x.rent)}</span>`:''}</div><div class="time-box"><b>접수 시간</b><br>${esc(time)}</div>${x.address?`<div class="live-address"><b>정확 주소</b><br>${esc(x.address)}${x.station?`<br><span>${esc(x.station)}</span>`:''}</div>`:(x.station?`<div class="live-address"><b>위치</b><br>${esc(x.station)}</div>`:'')}${cy5Subaddresses(x)}${x.note?`<div class="live-note">${esc(x.note)}</div>`:''}${cy5Verification(x)}<details class="live-details"><summary>상세 일정·자격 보기</summary><div class="detail-lines">${x.startAt?`<div class="detail-line"><b>접수 시작</b> · ${esc(cy4FmtDate(x.startAt))}</div>`:''}${x.endAt?`<div class="detail-line"><b>접수 마감</b> · ${esc(cy4FmtDate(x.endAt))}</div>`:''}${x.eligibility?`<div class="detail-line"><b>자격</b> · ${esc(x.eligibility)}</div>`:''}${cy4Events(x)}</div></details><div class="live-actions">${cy5Links(x)}</div></article>`;
}
cy4LiveCard=cy5LiveCard;

function cy5MapStrip(items){
  const pins=[];
  (items||[]).forEach(x=>{
    if(x.address)pins.push({name:x.name,address:x.address});
    (Array.isArray(x.subaddresses)?x.subaddresses:[]).forEach(a=>a?.address&&pins.push({name:`${x.name} · ${a.name||''}`,address:a.address}));
  });
  const seen=new Set(),unique=pins.filter(p=>{const k=p.address.trim();if(!k||seen.has(k))return false;seen.add(k);return true});
  if(!unique.length)return'<div class="map-strip"><strong>지도</strong><div class="sub">공식·운영기관 자료에서 정확주소가 확인된 후보가 아직 없습니다.</div></div>';
  return `<div class="map-strip"><strong>확인된 정확주소 지도</strong><div class="map-links">${unique.map(p=>`<a target="_blank" rel="noopener" href="${cy4MapUrl(p.address)}">📍 ${esc(p.name)}</a>`).join('')}</div></div>`;
}
cy4MapStrip=cy5MapStrip;

function cy5Group(group,normalOnly=true){
  let items=(group.items||[]).filter(x=>normalOnly?x.kind==='normal':true);
  if(!items.length)return'';
  items=cy5SortItems(items);
  return `<section class="schedule-group"><div class="schedule-title"><h3>${esc(group.icon||'')} ${esc(group.title)}</h3><span>${items.length}건</span></div>${cy5MapStrip(items)}<div class="live-grid">${items.map(cy5LiveCard).join('')}</div></section>`;
}
cy4Group=cy5Group;

cy4Home=function(){
  const box=$('#homeLiveReport');if(!box||!CY4_REPORT)return;
  const groups=CY4_REPORT.groups||[],today=groups.find(g=>g.id==='today-tomorrow');
  let upcoming=groups.filter(g=>g.id!=='today-tomorrow').flatMap(g=>(g.items||[]).filter(x=>x.kind==='normal'));
  upcoming=cy5SortItems(upcoming).slice(0,5);
  box.innerHTML=`<div class="priority-row"><span class="priority-pill">🔥 입지·가격 검토</span><span class="priority-pill">🔴⏰ 마감/시작 임박</span><span class="priority-pill">🟠⚠️ 며칠 내 일정</span></div>${today?cy5Group(today,true):'<div class="empty-soft">오늘·내일 일반 공고 없음</div>'}${upcoming.length?`<div class="section-head"><h2>곧 볼 공고</h2><small>${cy5SortState().mode==='recommend'?'추천순':'시간순'}</small></div><div class="live-grid">${upcoming.map(cy5LiveCard).join('')}</div>`:''}`;
  cy4MegaTeaser();cy5RenderSortBars();
};
cy4PublicSchedule=function(){
  const box=$('#publicScheduleGroups');if(!box)return;
  if(!CY4_REPORT){box.innerHTML='<div class="empty-soft">최신 공고 일정을 불러오는 중…</div>';return}
  box.innerHTML=(CY4_REPORT.groups||[]).map(g=>cy5Group(g,true)).join('')||'<div class="empty-soft">일반 공고 일정 없음</div>';
  cy4MegaUpcoming();cy5RenderSortBars();
};
function cy5RenderPublicViews(){if(CY4_REPORT){cy4Home();cy4PublicSchedule();renderHero();renderSettings()}}

function cy5ApplyOverrides(report,ov){
  if(!report||!ov)return report;
  const r=JSON.parse(JSON.stringify(report));
  const defs=ov.groups||{};
  Object.entries(defs).forEach(([id,g])=>{if(!r.groups.some(x=>x.id===id))r.groups.push({id,title:g.title||id,icon:g.icon||'',items:[]})});
  const removals=new Set(ov.removeIds||[]),patches=ov.patches||{},moves=ov.moves||{};
  const moved=[];
  r.groups.forEach(g=>{g.items=(g.items||[]).filter(x=>{if(removals.has(x.id))return false;if(moves[x.id]){moved.push({...x,...(patches[x.id]||{}),__moveTo:moves[x.id]});return false}return true}).map(x=>patches[x.id]?{...x,...patches[x.id]}:x)});
  moved.forEach(x=>{const target=r.groups.find(g=>g.id===x.__moveTo);delete x.__moveTo;if(target)target.items.push(x)});
  (ov.additions||[]).forEach(a=>{const g=r.groups.find(x=>x.id===a.groupId);if(g&&a.item&&!g.items.some(x=>x.id===a.item.id))g.items.push(a.item)});
  r.verificationUpdatedAt=ov.updatedAt||null;
  return r;
}
async function cy5ReadOverrides(){
  let ov=null;
  try{ov=await cy4ReadJson(CY5_REMOTE_OVERRIDES)}catch(e){console.warn('remote overrides fallback',e)}
  try{if(!ov)ov=await cy4ReadJson('data/report-overrides.json')}catch(e){console.warn('bundled overrides',e)}
  return ov;
}
cy4LoadReport=async function(){
  let report=null;
  try{const remote=await cy4ReadJson(CY4_REMOTE_REPORT);if(Array.isArray(remote?.groups)&&remote.groups.length&&Array.isArray(remote?.megaNotices))report=remote}catch(e){console.warn('remote report fallback',e)}
  try{if(!report)report=await cy4ReadJson('data/hourly-report.json')}catch(e){console.error('bundled report',e)}
  if(!report){const b=$('#homeLiveReport');if(b)b.innerHTML='<div class="error">최신 공고 일정 데이터를 불러오지 못했습니다.</div>';return}
  CY5_OVERRIDES=await cy5ReadOverrides();
  CY4_REPORT=cy5ApplyOverrides(report,CY5_OVERRIDES);
  cy4Home();cy4PublicSchedule();cy4MegaSummary();renderHero();renderSettings();cy5RenderSortBars();
};

const cy5PrevHero=renderHero;
renderHero=function(){cy5PrevHero();const v=$('#appVersion');if(v)v.textContent='v'+CY5_APP_VERSION};
const cy5PrevSettings=renderSettings;
renderSettings=function(){
  cy5PrevSettings();
  const v=$('#settingsVersion');if(v)v.textContent=CY5_APP_VERSION;
  const ru=$('#reportUpdated');if(ru&&CY4_REPORT)ru.textContent=new Date(CY4_REPORT.updatedAt).toLocaleString('ko-KR')+(CY4_REPORT.verificationUpdatedAt?` · 링크/시간 확인 ${new Date(CY4_REPORT.verificationUpdatedAt).toLocaleString('ko-KR')}`:'');
};

const cy5BaseSaveTracking=saveTracking;
saveTracking=function(){
  cy5BaseSaveTracking();
  if(!CY5_APPLYING_REMOTE){localStorage.setItem(CY5_TRACK_SYNC_KEY,cy5Now());cy5ScheduleSync()}
};
function cy5Snapshot(){return{schema:'chungyack-user-state-v1',updatedAt:cy5Now(),appVersion:CY5_APP_VERSION,reportUpdatedAt:CY4_REPORT?.updatedAt||null,noticeSort:cy5SortState(),noticeDecisions:cy5Decisions(),trackingUpdatedAt:localStorage.getItem(CY5_TRACK_SYNC_KEY)||'1970-01-01T00:00:00.000Z',tracking:Array.isArray(TRACKING)?TRACKING:[]}}
function cy5Plugin(){return window.Capacitor?.Plugins?.GitHubSync||null}
function cy5SyncStatus(text,cls=''){const el=$('#githubSyncStatus');if(el){el.textContent=text;el.className='sync-status '+cls}}
async function cy5PushState(){
  if(!CY5_SYNC_CONFIGURED||!CY5_SYNC_READY)return;
  const p=cy5Plugin();if(!p)return;
  try{cy5SyncStatus('GitHub 저장 중…');const r=await p.pushState({json:JSON.stringify(cy5Snapshot())});cy5SyncStatus(`GitHub 저장 완료 · ${new Date().toLocaleTimeString('ko-KR')}`,'ok');return r}catch(e){console.error('github push',e);cy5SyncStatus('GitHub 저장 실패 · 연결/권한 확인','bad')}
}
function cy5ScheduleSync(){clearTimeout(CY5_SYNC_TIMER);CY5_SYNC_TIMER=setTimeout(cy5PushState,1200)}
function cy5Newer(a,b){return String(a||'')>String(b||'')}
function cy5MergeRemote(remote){
  if(!remote||remote.schema!=='chungyack-user-state-v1')return false;
  let changed=false;
  const localD=cy5Decisions(),remoteD=remote.noticeDecisions||{},merged={...localD};
  Object.entries(remoteD).forEach(([id,v])=>{if(!merged[id]||cy5Newer(v.updatedAt,merged[id].updatedAt)){merged[id]=v;changed=true}});
  if(JSON.stringify(merged)!==JSON.stringify(localD)){localStorage.setItem(CY5_DECISIONS_KEY,JSON.stringify(merged));changed=true}
  const localSort=cy5SortState();if(remote.noticeSort&&cy5Newer(remote.noticeSort.updatedAt,localSort.updatedAt)){localStorage.setItem(CY5_SORT_KEY,JSON.stringify(remote.noticeSort));changed=true}
  const localTrackAt=localStorage.getItem(CY5_TRACK_SYNC_KEY)||'1970-01-01T00:00:00.000Z';
  if(Array.isArray(remote.tracking)&&cy5Newer(remote.trackingUpdatedAt,localTrackAt)){
    CY5_APPLYING_REMOTE=true;TRACKING=remote.tracking;cy5BaseSaveTracking();CY5_APPLYING_REMOTE=false;
    localStorage.setItem(CY5_TRACK_SYNC_KEY,remote.trackingUpdatedAt||cy5Now());
    renderTracking();renderSchedule();renderHero();changed=true;
  }
  if(changed)cy5RenderPublicViews();
  return changed;
}
async function cy5PullAndMerge(){
  const p=cy5Plugin();if(!p||!CY5_SYNC_CONFIGURED)return;
  try{cy5SyncStatus('GitHub 상태 불러오는 중…');const r=await p.pullState();if(r?.exists&&r.json){cy5MergeRemote(JSON.parse(r.json))}cy5SyncStatus('GitHub 동기화 연결됨','ok')}catch(e){console.error('github pull',e);cy5SyncStatus('GitHub 불러오기 실패 · 권한 확인','bad')}
}
async function cy5ConfigureSync(){
  const token=$('#githubToken')?.value.trim();if(!token){cy5SyncStatus('Fine-grained token을 입력하세요.','bad');return}
  const p=cy5Plugin();if(!p){cy5SyncStatus('Android APK에서만 GitHub 동기화를 연결할 수 있습니다.','bad');return}
  try{
    cy5SyncStatus('GitHub 연결 중…');
    await p.configure({token,...CY5_SYNC_TARGET});
    if($('#githubToken'))$('#githubToken').value='';
    CY5_SYNC_CONFIGURED=true;CY5_SYNC_READY=false;
    await cy5PullAndMerge();CY5_SYNC_READY=true;await cy5PushState();cy5RenderSyncButtons();
  }catch(e){console.error('configure sync',e);cy5SyncStatus('연결 실패 · 토큰 권한/저장소 접근 확인','bad')}
}
async function cy5DisconnectSync(){
  const p=cy5Plugin();if(!p)return;
  if(!confirm('이 기기의 GitHub 동기화 연결을 해제할까요?\n앱 로컬 데이터와 GitHub에 이미 저장된 상태 파일은 삭제하지 않습니다.'))return;
  try{await p.clearConfig();CY5_SYNC_CONFIGURED=false;CY5_SYNC_READY=false;cy5SyncStatus('GitHub 동기화 미연결');cy5RenderSyncButtons()}catch(e){cy5SyncStatus('연결 해제 실패','bad')}
}
function cy5RenderSyncButtons(){
  const connect=$('#githubConnectBtn'),now=$('#githubSyncNowBtn'),disconnect=$('#githubDisconnectBtn');
  if(connect)connect.hidden=CY5_SYNC_CONFIGURED;if(now)now.hidden=!CY5_SYNC_CONFIGURED;if(disconnect)disconnect.hidden=!CY5_SYNC_CONFIGURED;
}
async function cy5InitSync(){
  const p=cy5Plugin();
  if(!p){cy5SyncStatus('이 브라우저에서는 로컬 저장만 사용합니다. APK에서 GitHub 동기화를 연결할 수 있습니다.');cy5RenderSyncButtons();return}
  try{const s=await p.status();CY5_SYNC_CONFIGURED=!!s?.configured;cy5RenderSyncButtons();if(CY5_SYNC_CONFIGURED){await cy5PullAndMerge();CY5_SYNC_READY=true;cy5SyncStatus('GitHub 동기화 연결됨','ok')}else{CY5_SYNC_READY=true;cy5SyncStatus('GitHub 동기화 미연결')}}catch(e){CY5_SYNC_READY=true;cy5SyncStatus('GitHub 동기화 상태 확인 실패','bad')}
}

function cy5Wire(){
  document.addEventListener('change',e=>{const c=e.target.closest?.('.cy5-pass');if(!c)return;const item=cy5AllNormalItems().find(x=>x.id===c.dataset.id);if(item)cy5SaveDecision(item,c.checked)});
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cy5-sort]');if(b){cy5SetSort(b.dataset.cy5Sort);return}});
  $('#githubConnectBtn')?.addEventListener('click',cy5ConfigureSync);
  $('#githubSyncNowBtn')?.addEventListener('click',async()=>{await cy5PullAndMerge();await cy5PushState()});
  $('#githubDisconnectBtn')?.addEventListener('click',cy5DisconnectSync);
  cy5RenderSortBars();cy5InitSync();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&CY5_SYNC_CONFIGURED&&CY5_SYNC_READY)cy5PullAndMerge()});
}
window.addEventListener('DOMContentLoaded',cy5Wire);
