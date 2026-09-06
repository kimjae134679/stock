// v0.8.8 live: private cloud sync bridge for tracking/saved/hidden/filter state.
// Backend is Supabase with anonymous auth + RLS. LocalStorage remains the offline source of truth.
const CY_V88_VERSION='0.8.8-live';
const CY_V88_LOCAL_STAMP='chungyack.sync.localUpdatedAt.v1';
const CY_V88_LAST_PULL='chungyack.sync.lastPullAt.v1';
const CY_V88_ASSISTANT_CACHE='chungyack.sync.assistantState.v1';
let CY_V88_CLIENT=null;
let CY_V88_USER=null;
let CY_V88_SYNCING=false;
let CY_V88_SUPPRESS=false;
let CY_V88_TIMER=null;
let CY_V88_STATUS='로컬 저장';
let CY_V88_STATUS_DETAIL='클라우드 연결 대기';

function cyV88Config(){return window.CY_CLOUD_SYNC_CONFIG||{enabled:false}}
function cyV88Now(){return new Date().toISOString()}
function cyV88Touch(){if(CY_V88_SUPPRESS)return;localStorage.setItem(CY_V88_LOCAL_STAMP,cyV88Now());cyV88QueuePush()}
function cyV88State(){
  return {
    format:'chungyack-cloud-state-v1',
    appVersion:CY_V88_VERSION,
    updatedAt:localStorage.getItem(CY_V88_LOCAL_STAMP)||cyV88Now(),
    tracking:Array.isArray(TRACKING)?TRACKING:[],
    savedOpportunities:typeof CY_V7_SAVED!=='undefined'?[...CY_V7_SAVED]:[],
    hiddenOpportunities:typeof CY_V7_HIDDEN!=='undefined'?[...CY_V7_HIDDEN]:[],
    filters:typeof FILTERS!=='undefined'?FILTERS:null
  };
}
function cyV88ParseTime(v){const t=Date.parse(v||'');return Number.isFinite(t)?t:0}
function cyV88SetStatus(title,detail=''){
  CY_V88_STATUS=title;CY_V88_STATUS_DETAIL=detail;
  cyV88RenderStatus();
}
function cyV88RenderStatus(){
  const settings=document.querySelector('.page[data-page="settings"] .settings-list');
  if(settings){
    let box=document.getElementById('cyV88SyncStatus');
    if(!box){
      box=document.createElement('div');box.className='setting cy-v88-sync-setting';box.id='cyV88SyncStatus';
      const anchor=document.getElementById('settingsUpdated')?.closest('.setting');
      if(anchor)anchor.insertAdjacentElement('afterend',box);else settings.prepend(box);
    }
    const cfg=cyV88Config();
    box.innerHTML=`<b>개인 클라우드 동기화</b><p><strong>${esc(CY_V88_STATUS)}</strong>${CY_V88_STATUS_DETAIL?` · ${esc(CY_V88_STATUS_DETAIL)}`:''}</p>${cfg.enabled?'<small>추적·저장·숨김·필터는 개인 계정으로 동기화됩니다.</small>':'<small>백엔드 연결 전까지는 이 기기에 안전하게 보관됩니다.</small>'}`;
  }
  const hero=document.querySelector('.hero-top');
  if(hero){
    let badge=document.getElementById('cyV88CloudBadge');
    if(!badge){badge=document.createElement('span');badge.id='cyV88CloudBadge';badge.className='cy-v88-cloud-badge';hero.appendChild(badge)}
    badge.textContent=cyV88Config().enabled?(CY_V88_SYNCING?'☁ 동기화…':'☁ 동기화'):'☁ 로컬';
  }
}

async function cyV88LoadSdk(){
  if(window.supabase?.createClient)return;
  await new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/dist/umd/supabase.min.js';
    s.onload=resolve;s.onerror=()=>reject(new Error('Supabase SDK load failed'));document.head.appendChild(s);
  });
}
async function cyV88Init(){
  const cfg=cyV88Config();
  if(!cfg.enabled||!cfg.url||!cfg.anonKey){cyV88SetStatus('로컬 저장','클라우드 연결 준비 중');return false}
  try{
    cyV88SetStatus('연결 중','개인 동기화 확인');
    await cyV88LoadSdk();
    CY_V88_CLIENT=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    let {data:{session}}=await CY_V88_CLIENT.auth.getSession();
    if(!session){
      const signed=await CY_V88_CLIENT.auth.signInAnonymously();
      if(signed.error)throw signed.error;
      session=signed.data.session;
    }
    CY_V88_USER=session?.user||null;
    if(!CY_V88_USER)throw new Error('cloud user unavailable');
    await cyV88InitialSync();
    if(CY_V88_TIMER)clearInterval(CY_V88_TIMER);
    CY_V88_TIMER=setInterval(()=>cyV88Pull(),30000);
    window.addEventListener('focus',()=>cyV88Pull());
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')cyV88Pull()});
    cyV88SetStatus('동기화됨','개인 클라우드 연결');
    return true;
  }catch(e){
    console.warn('cloud sync init failed',e);
    cyV88SetStatus('로컬 저장 유지','클라우드 연결 실패');
    return false;
  }
}
async function cyV88InitialSync(){
  if(!CY_V88_CLIENT||!CY_V88_USER)return;
  const cfg=cyV88Config();
  const {data,error}=await CY_V88_CLIENT.from(cfg.clientTable).select('state,updated_at').eq('user_id',CY_V88_USER.id).maybeSingle();
  if(error)throw error;
  const localStamp=localStorage.getItem(CY_V88_LOCAL_STAMP)||'';
  const remoteStamp=data?.state?.updatedAt||data?.updated_at||'';
  if(data?.state&&cyV88ParseTime(remoteStamp)>cyV88ParseTime(localStamp))cyV88ApplyClientState(data.state);
  else await cyV88Push();
  await cyV88PullAssistant();
}
function cyV88ApplyClientState(state){
  if(!state||typeof state!=='object')return;
  CY_V88_SUPPRESS=true;
  try{
    if(Array.isArray(state.tracking)){TRACKING=state.tracking;localStorage.setItem(TRACK_KEY,JSON.stringify(TRACKING))}
    if(Array.isArray(state.savedOpportunities)&&typeof CY_V7_SAVED!=='undefined'){
      CY_V7_SAVED=new Set(state.savedOpportunities);localStorage.setItem(CY_V7_SAVED_KEY,JSON.stringify(state.savedOpportunities));
    }
    if(Array.isArray(state.hiddenOpportunities)&&typeof CY_V7_HIDDEN!=='undefined'){
      CY_V7_HIDDEN=new Set(state.hiddenOpportunities);localStorage.setItem(CY_V7_HIDDEN_KEY,JSON.stringify(state.hiddenOpportunities));
    }
    if(state.filters&&typeof FILTERS!=='undefined'){FILTERS=state.filters;localStorage.setItem(FILTER_KEY,JSON.stringify(FILTERS));if(typeof syncFilterControls==='function')syncFilterControls()}
    localStorage.setItem(CY_V88_LOCAL_STAMP,state.updatedAt||cyV88Now());
    if(typeof renderTracking==='function')renderTracking();
    if(typeof renderRecommendations==='function')renderRecommendations();
    if(typeof renderSchedule==='function')renderSchedule();
    if(typeof renderHero==='function')renderHero();
  }finally{CY_V88_SUPPRESS=false}
}
async function cyV88Push(){
  if(CY_V88_SYNCING||!CY_V88_CLIENT||!CY_V88_USER)return;
  const cfg=cyV88Config();CY_V88_SYNCING=true;cyV88RenderStatus();
  try{
    const state=cyV88State();
    const {error}=await CY_V88_CLIENT.from(cfg.clientTable).upsert({user_id:CY_V88_USER.id,state,updated_at:state.updatedAt},{onConflict:'user_id'});
    if(error)throw error;
    cyV88SetStatus('동기화됨','방금 저장');
  }catch(e){console.warn('cloud push failed',e);cyV88SetStatus('로컬 저장 유지','다음 연결 때 재시도')}
  finally{CY_V88_SYNCING=false;cyV88RenderStatus()}
}
let CY_V88_PUSH_WAIT=null;
function cyV88QueuePush(){
  if(!cyV88Config().enabled)return;
  clearTimeout(CY_V88_PUSH_WAIT);CY_V88_PUSH_WAIT=setTimeout(()=>cyV88Push(),650);
}
async function cyV88Pull(){
  if(CY_V88_SYNCING||!CY_V88_CLIENT||!CY_V88_USER)return;
  CY_V88_SYNCING=true;cyV88RenderStatus();
  try{
    const cfg=cyV88Config();
    const {data,error}=await CY_V88_CLIENT.from(cfg.clientTable).select('state,updated_at').eq('user_id',CY_V88_USER.id).maybeSingle();
    if(error)throw error;
    const localStamp=localStorage.getItem(CY_V88_LOCAL_STAMP)||'';
    const remoteStamp=data?.state?.updatedAt||data?.updated_at||'';
    if(data?.state&&cyV88ParseTime(remoteStamp)>cyV88ParseTime(localStamp))cyV88ApplyClientState(data.state);
    await cyV88PullAssistant();
    localStorage.setItem(CY_V88_LAST_PULL,cyV88Now());
    cyV88SetStatus('동기화됨','최신 상태 확인');
  }catch(e){console.warn('cloud pull failed',e);cyV88SetStatus('로컬 저장 유지','클라우드 확인 실패')}
  finally{CY_V88_SYNCING=false;cyV88RenderStatus()}
}
async function cyV88PullAssistant(){
  if(!CY_V88_CLIENT||!CY_V88_USER)return;
  const cfg=cyV88Config();
  const {data,error}=await CY_V88_CLIENT.from(cfg.assistantTable).select('state,updated_at').eq('user_id',CY_V88_USER.id).maybeSingle();
  if(error)throw error;
  if(!data?.state)return;
  localStorage.setItem(CY_V88_ASSISTANT_CACHE,JSON.stringify(data.state));
  cyV88ApplyAssistantState(data.state);
}
function cyV88ApplyAssistantState(state){
  if(!state||typeof state!=='object')return;
  CY_V88_SUPPRESS=true;
  try{
    if(Array.isArray(state.trackingPatch)){
      state.trackingPatch.forEach(p=>{
        let idx=-1;
        if(p.id)idx=TRACKING.findIndex(x=>x.id===p.id);
        if(idx<0&&p.name){const n=String(p.name).replace(/\s+/g,'');idx=TRACKING.findIndex(x=>String(x.name||'').replace(/\s+/g,'').includes(n)||n.includes(String(x.name||'').replace(/\s+/g,'')))}
        if(idx>=0)TRACKING[idx]={...TRACKING[idx],...p};
      });
      localStorage.setItem(TRACK_KEY,JSON.stringify(TRACKING));
    }
    if(Array.isArray(state.milestones)&&typeof CY_V87_MILESTONES!=='undefined')CY_V87_MILESTONES=state.milestones;
    if(typeof renderTracking==='function')renderTracking();
    if(typeof renderSchedule==='function')renderSchedule();
    if(typeof renderHero==='function')renderHero();
  }finally{CY_V88_SUPPRESS=false}
}

// Hook every personal-state write so cloud sync becomes automatic without changing existing UI flows.
const _cyV88SaveTracking=saveTracking;
saveTracking=function(){_cyV88SaveTracking();cyV88Touch()};
const _cyV88SaveFilters=saveFilters;
saveFilters=function(){_cyV88SaveFilters();cyV88Touch()};
if(typeof cyV7SaveSet==='function'){
  const _cyV88SaveSet=cyV7SaveSet;
  cyV7SaveSet=function(key,value){_cyV88SaveSet(key,value);cyV88Touch()};
}

const _cyV88RenderSettings=renderSettings;
renderSettings=function(){_cyV88RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V88_VERSION;cyV88RenderStatus()};
const _cyV88RenderHero=renderHero;
renderHero=function(){_cyV88RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V88_VERSION;cyV88RenderStatus()};

window.CY_CLOUD_SYNC={init:cyV88Init,push:cyV88Push,pull:cyV88Pull,state:cyV88State,status:()=>({title:CY_V88_STATUS,detail:CY_V88_STATUS_DETAIL,userId:CY_V88_USER?.id||null})};
window.addEventListener('DOMContentLoaded',()=>{
  if(!localStorage.getItem(CY_V88_LOCAL_STAMP))localStorage.setItem(CY_V88_LOCAL_STAMP,cyV88Now());
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V88_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V88_VERSION;
  cyV88RenderStatus();
  setTimeout(()=>cyV88Init(),250);
});
