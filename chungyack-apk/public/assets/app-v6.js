// v0.6: 관심/북마크/신청추적 상태 + 전용 필터.
const CY_V6_VERSION='0.6.1';
const CY_V6_FLAGS_KEY='chungyack.opportunity.flags.v1';
const CY_V6_VIEW_KEY='chungyack.opportunity.savedview.v1';

function cyV6LoadFlags(){
  try{const x=JSON.parse(localStorage.getItem(CY_V6_FLAGS_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}
}
let CY_V6_FLAGS=cyV6LoadFlags();
let CY_V6_VIEW=localStorage.getItem(CY_V6_VIEW_KEY)||'all';
if(!['all','interest','bookmark','tracked'].includes(CY_V6_VIEW))CY_V6_VIEW='all';

function cyV6SaveFlags(){localStorage.setItem(CY_V6_FLAGS_KEY,JSON.stringify(CY_V6_FLAGS))}
function cyV6FlagsFor(id){return CY_V6_FLAGS[id]||{interest:false,bookmark:false}}
function cyV6IsTracked(item){
  const id=`opportunity-${item?.id||''}`;
  return Array.isArray(TRACKING)&&TRACKING.some(x=>x.id===id&&x.status!=='취소/추적중단');
}
function cyV6ToggleFlag(id,key){
  if(!id||!['interest','bookmark'].includes(key))return;
  const cur=cyV6FlagsFor(id);
  CY_V6_FLAGS[id]={...cur,[key]:!cur[key]};
  if(!CY_V6_FLAGS[id].interest&&!CY_V6_FLAGS[id].bookmark)delete CY_V6_FLAGS[id];
  cyV6SaveFlags();
  renderRecommendations();
  if(typeof cyToast==='function')cyToast(key==='interest'?(cur.interest?'관심에서 해제했습니다.':'관심 공고로 저장했습니다.'):(cur.bookmark?'북마크에서 해제했습니다.':'북마크에 저장했습니다.'));
}
function cyV6Counts(){
  const items=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items:[];
  return {
    interest:items.filter(x=>cyV6FlagsFor(x.id).interest).length,
    bookmark:items.filter(x=>cyV6FlagsFor(x.id).bookmark).length,
    tracked:items.filter(cyV6IsTracked).length
  };
}

// 기존 자격/기관/검색 필터를 유지한 뒤 관심·북마크·추적 필터를 추가 적용.
const _cyV6FilteredItems=cyV4FilteredItems;
cyV4FilteredItems=function(){
  const rows=_cyV6FilteredItems();
  if(CY_V6_VIEW==='interest')return rows.filter(x=>cyV6FlagsFor(x.id).interest);
  if(CY_V6_VIEW==='bookmark')return rows.filter(x=>cyV6FlagsFor(x.id).bookmark);
  if(CY_V6_VIEW==='tracked')return rows.filter(cyV6IsTracked);
  return rows;
};

const _cyV6ToolbarHtml=cyV4ToolbarHtml;
cyV4ToolbarHtml=function(){
  const c=cyV6Counts();
  return `${_cyV6ToolbarHtml()}<div class="cy-v6-saved-toolbar">
    <div class="cy-v6-saved-title">내 저장/신청 상태</div>
    <div class="cy-v6-saved-filters">
      <button data-cy-saved="all" class="${CY_V6_VIEW==='all'?'on':''}">전체</button>
      <button data-cy-saved="interest" class="${CY_V6_VIEW==='interest'?'on':''}">♥ 관심만 <b>${c.interest}</b></button>
      <button data-cy-saved="bookmark" class="${CY_V6_VIEW==='bookmark'?'on':''}">★ 북마크만 <b>${c.bookmark}</b></button>
      <button data-cy-saved="tracked" class="${CY_V6_VIEW==='tracked'?'on':''}">✅ 추적중만 <b>${c.tracked}</b></button>
    </div>
  </div>`;
};

// 공고 카드의 행동 버튼을 명확하게 분리: 관심 / 북마크 / 신청함·추적.
const _cyV6OpportunityCard=cyV4OpportunityCard;
cyV4OpportunityCard=function(item){
  let html=_cyV6OpportunityCard(item);
  const f=cyV6FlagsFor(item.id);
  const tracked=cyV6IsTracked(item);
  const level=cyV4Level(item);
  const actions=`<div class="cy-v4-actions cy-v6-actions">
    <a class="btn cy-v6-official" href="${esc(item.source||'#')}" target="_blank" rel="noopener">공식 공고</a>
    <button class="btn cy-v6-interest ${f.interest?'on':''}" data-cy-interest="${esc(item.id)}">${f.interest?'♥ 관심':'♡ 관심'}</button>
    <button class="btn cy-v6-bookmark ${f.bookmark?'on':''}" data-cy-bookmark="${esc(item.id)}">${f.bookmark?'★ 북마크':'☆ 북마크'}</button>
    ${level!=='impossible'?`<button class="btn primary-lite cy-v4-track cy-v6-track ${tracked?'on':''}" data-opportunity-id="${esc(item.id)}">${tracked?'✅ 신청함 · 추적중':'✅ 신청함 / 추적'}</button>`:''}
  </div>`;
  return html.replace(/<div class="cy-v4-actions">[\s\S]*?<\/div>/,actions);
};

const _cyV6RenderRecommendations=renderRecommendations;
renderRecommendations=function(){
  _cyV6RenderRecommendations();
  document.querySelectorAll('[data-cy-saved]').forEach(b=>b.addEventListener('click',()=>{
    CY_V6_VIEW=b.dataset.cySaved||'all';
    // 관심/북마크/추적 필터는 모든 자격그룹에서 찾아야 하므로 분류 필터를 전체로 연다.
    if(CY_V6_VIEW!=='all')CY_OPPORTUNITY_FILTER.level='all';
    localStorage.setItem(CY_V6_VIEW_KEY,CY_V6_VIEW);
    renderRecommendations();
  }));
  document.querySelectorAll('[data-cy-interest]').forEach(b=>b.addEventListener('click',()=>cyV6ToggleFlag(b.dataset.cyInterest,'interest')));
  document.querySelectorAll('[data-cy-bookmark]').forEach(b=>b.addEventListener('click',()=>cyV6ToggleFlag(b.dataset.cyBookmark,'bookmark')));
};

// 신청 추적을 저장/제거/복원한 직후 공고 카드의 '추적중' 상태와 필터도 즉시 갱신.
const _cyV6SaveTrackFromForm=saveTrackFromForm;
saveTrackFromForm=function(){_cyV6SaveTrackFromForm();setTimeout(()=>renderRecommendations(),0)};
const _cyV6RemoveTracking=removeTracking;
removeTracking=function(id){_cyV6RemoveTracking(id);setTimeout(()=>renderRecommendations(),0)};
if(typeof cyRestoreRemoved==='function'){
  const _cyV6RestoreRemoved=cyRestoreRemoved;
  cyRestoreRemoved=function(id){_cyV6RestoreRemoved(id);setTimeout(()=>renderRecommendations(),0)};
}

// 백업/복원에 관심·북마크 상태와 저장필터도 포함.
const _cyV6BackupObject=cyBackupObject;
cyBackupObject=function(){
  return {..._cyV6BackupObject(),appVersion:CY_V6_VERSION,opportunityFlags:CY_V6_FLAGS,opportunityView:CY_V6_VIEW};
};
cyImportBackup=async function(file){
  if(!file)return;
  let obj;try{obj=JSON.parse(await file.text())}catch{alert('백업 JSON을 읽을 수 없습니다.');return}
  if(obj?.format!=='chungyack-local-backup-v1'||!Array.isArray(obj.tracking)||!obj.filters){alert('청약 레이더 백업 파일 형식이 아닙니다.');return}
  if(!confirm(`백업을 불러올까요?\n추적 ${obj.tracking.length}건과 필터·관심·북마크 설정이 현재 로컬 데이터를 대체합니다.`))return;
  localStorage.setItem(FILTER_KEY,JSON.stringify(obj.filters));
  localStorage.setItem(TRACK_KEY,JSON.stringify(obj.tracking));
  cySaveTrash(Array.isArray(obj.trash)?obj.trash:[]);
  localStorage.setItem(CY_V6_FLAGS_KEY,JSON.stringify(obj.opportunityFlags&&typeof obj.opportunityFlags==='object'?obj.opportunityFlags:{}));
  localStorage.setItem(CY_V6_VIEW_KEY,['all','interest','bookmark','tracked'].includes(obj.opportunityView)?obj.opportunityView:'all');
  location.reload();
};

const _cyV6RenderHero=renderHero;
renderHero=function(){_cyV6RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V6_VERSION};
const _cyV6RenderSettings=renderSettings;
renderSettings=function(){_cyV6RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V6_VERSION};

function cyV6WireReset(){
  const reset=document.getElementById('resetLocalBtn');if(!reset)return;
  const fresh=reset.cloneNode(true);reset.replaceWith(fresh);
  fresh.addEventListener('click',()=>{
    if(!confirm('이 기기의 필터·추적·관심·북마크·최근 제거 기록을 전부 초기화할까요?\n실제 청약 신청에는 영향이 없습니다.'))return;
    localStorage.removeItem(FILTER_KEY);localStorage.removeItem(TRACK_KEY);localStorage.removeItem(CY_TRASH_KEY);
    localStorage.removeItem(CY_V6_FLAGS_KEY);localStorage.removeItem(CY_V6_VIEW_KEY);location.reload();
  });
}
window.addEventListener('DOMContentLoaded',()=>{cyV6WireReset();const a=document.getElementById('appVersion');if(a)a.textContent='v'+CY_V6_VERSION;const b=document.getElementById('settingsVersion');if(b)b.textContent=CY_V6_VERSION;});
