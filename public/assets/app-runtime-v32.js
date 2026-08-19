(()=>{
'use strict';

const CACHE_KEYS=['mr:last-good:v025','mr:last-good:v024','mr:last-good'];
try{CACHE_KEYS.forEach(k=>localStorage.removeItem(k));}catch(_){ }

function modalOpen(){
  return document.querySelector('#modal.open, dialog[open], [aria-modal="true"].open, .modal.open');
}
function forceUnlock(){
  try{
    document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';document.body.style.overflow='';
    document.documentElement.style.overflow='';
  }catch(_){ }
}
function closeVisibleLayer(){
  const m=modalOpen();
  if(!m)return false;
  const close=m.querySelector('#modalClose,.close,[data-close],button[aria-label="닫기"]');
  if(close){try{close.click();}catch(_){ }}
  if(m.matches('dialog[open]')&&typeof m.close==='function'){try{m.close();}catch(_){ }}
  m.classList.remove('open');
  forceUnlock();
  return true;
}
window.__MR_HANDLE_NATIVE_BACK__=function(){
  if(closeVisibleLayer())return true;
  try{
    const st=history.state||{};
    if(st.mrModal||st.mrDetail){history.back();return true;}
  }catch(_){ }
  return false;
};

function sectionCount(){return document.querySelectorAll('#app .sec,#app .fold-panel').length;}
function fullEnough(){
  const app=document.getElementById('app');
  if(!app)return false;
  return sectionCount()>=8 && app.scrollHeight>window.innerHeight*2;
}
function setLoadText(t){const el=document.getElementById('loadState');if(el)el.textContent=t;}

async function probeData(){
  const urls=['../data/latest.json','../data/live/intraday.json'];
  for(const u of urls){
    try{
      const r=await fetch(u+'?v32='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error(String(r.status));
      await r.json();
    }catch(e){return false;}
  }
  return true;
}
async function watchdog(){
  await new Promise(r=>setTimeout(r,3500));
  if(fullEnough()){setLoadText('정상 · 전체 대시보드 로드 완료');return;}
  setLoadText('전체 화면 재확인 중…');
  const ok=await probeData();
  const u=new URL(location.href);
  const alreadyRecovered=u.searchParams.has('recover');
  if(ok&&!alreadyRecovered){
    u.searchParams.set('recover','32-'+Date.now());
    location.replace(u.toString());
    return;
  }
  setLoadText(ok?'일부 화면만 로드됨 · 앱을 다시 열어 주세요':'내장 데이터 로드 실패 · APK 재설치 필요');
}

window.addEventListener('popstate',()=>{ if(modalOpen())closeVisibleLayer(); });
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchdog,{once:true});
else watchdog();
})();
