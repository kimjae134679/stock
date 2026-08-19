(()=>{
'use strict';
const RELEASE='0.3.6',q=(s,r=document)=>r.querySelector(s);
function openLayer(){return q('#modal.open,dialog[open],[aria-modal="true"].open,.modal.open')}
function unlock(){try{document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';document.body.style.overflow='';document.documentElement.style.overflow=''}catch(_){}}
function closeLayer(){const m=openLayer();if(!m)return false;const b=m.querySelector('#modalClose,.close,[data-close],button[aria-label="닫기"]');if(b){try{b.click()}catch(_){}}if(m.matches('dialog[open]')&&typeof m.close==='function'){try{m.close()}catch(_){}}m.classList.remove('open');unlock();return true}
window.__MR_HANDLE_NATIVE_BACK__=()=>closeLayer();
function sectionCount(){return document.querySelectorAll('#app .sec,#app .fold-panel').length}
function fullEnough(){const app=q('#app');return !!app&&sectionCount()>=8&&app.scrollHeight>Math.max(1200,window.innerHeight*1.7)}
async function monitor(){const started=Date.now();while(Date.now()-started<9000){const n=sectionCount();if(typeof window.__MR_PROGRESS__==='function')window.__MR_PROGRESS__(Math.min(99.7,96+n*.42),`최종 화면 확인 중 · ${n}개 섹션`,`v${RELEASE} 실제 DOM 검사`);if(fullEnough()){if(typeof window.__MR_LOAD_DONE__==='function')window.__MR_LOAD_DONE__();return}await new Promise(r=>setTimeout(r,220))}const msg=`전체 렌더링 미완료 · 현재 ${sectionCount()}개 섹션`;if(typeof window.__MR_LOAD_FAIL__==='function')window.__MR_LOAD_FAIL__(msg)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',monitor,{once:true});else monitor();
})();
