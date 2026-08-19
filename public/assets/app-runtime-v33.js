(()=>{
'use strict';
const RELEASE='0.3.3';
function q(s,r=document){return r.querySelector(s)}
function openLayer(){return q('#modal.open,dialog[open],[aria-modal="true"].open,.modal.open')}
function unlock(){try{document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';document.body.style.overflow='';document.documentElement.style.overflow=''}catch(_){}}
function closeLayer(){const m=openLayer();if(!m)return false;const b=m.querySelector('#modalClose,.close,[data-close],button[aria-label="닫기"]');if(b){try{b.click()}catch(_){}}if(m.matches('dialog[open]')&&typeof m.close==='function'){try{m.close()}catch(_){}}m.classList.remove('open');unlock();return true}
window.__MR_HANDLE_NATIVE_BACK__=()=>closeLayer();
window.addEventListener('popstate',()=>{if(openLayer())closeLayer()});
function sections(){return document.querySelectorAll('#app .sec,#app .fold-panel').length}
function full(){const app=q('#app');return !!app&&sections()>=8&&app.scrollHeight>window.innerHeight*2}
function state(t,cls){const e=q('#loadState');if(!e)return;e.textContent=t;if(cls)e.className='statusline '+cls}
async function verifyData(){for(const u of ['../data/latest.json','../data/live/intraday.json']){try{const r=await fetch(u+'?v33='+Date.now(),{cache:'no-store'});if(!r.ok)return false;await r.json()}catch(_){return false}}return true}
async function watchdog(){await new Promise(r=>setTimeout(r,5000));if(full()){state('정상 · v0.3.3 전체 대시보드 로드 완료','good');return}const dataOk=await verifyData();const u=new URL(location.href);if(dataOk&&!u.searchParams.has('recovery33')){state('전체 화면이 덜 그려져 1회 복구 재로딩합니다','warn');u.searchParams.set('recovery33',Date.now());location.replace(u.toString());return}if(full()){state('정상 · v0.3.3 전체 대시보드 로드 완료','good');return}state(dataOk?'오류 · 전체 렌더링 실패. 이 화면을 정상본으로 사용하지 마세요':'오류 · 내장 시장 데이터 로드 실패','warn')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchdog,{once:true});else watchdog();
})();
