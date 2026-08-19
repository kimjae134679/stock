(()=>{
'use strict';
const RELEASE='0.3.4';
const q=(s,r=document)=>r.querySelector(s);
function openLayer(){return q('#modal.open,dialog[open],[aria-modal="true"].open,.modal.open')}
function unlock(){try{document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';document.body.style.overflow='';document.documentElement.style.overflow=''}catch(_){}}
function closeLayer(){const m=openLayer();if(!m)return false;const b=m.querySelector('#modalClose,.close,[data-close],button[aria-label="닫기"]');if(b){try{b.click()}catch(_){}}if(m.matches('dialog[open]')&&typeof m.close==='function'){try{m.close()}catch(_){}}m.classList.remove('open');unlock();return true}
window.__MR_HANDLE_NATIVE_BACK__=()=>closeLayer();
window.addEventListener('popstate',()=>{if(openLayer())closeLayer()});
function sectionCount(){return document.querySelectorAll('#app .sec,#app .fold-panel').length}
function fullEnough(){const app=q('#app');return !!app&&sectionCount()>=8&&app.scrollHeight>Math.max(1200,window.innerHeight*1.8)}
function setState(text,kind=''){const e=q('#loadState');if(!e)return;e.textContent=text;e.className='statusline'+(kind?' '+kind:'')}
async function purgeLegacy(){try{Object.keys(localStorage).filter(k=>k==='mr:last-good'||k.startsWith('mr:last-good:')).forEach(k=>localStorage.removeItem(k))}catch(_){ }
 try{if('caches'in window){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(_){ }
 try{if('serviceWorker'in navigator){const reg=await navigator.serviceWorker.register('../sw.js?v=34',{updateViaCache:'none'});try{await reg.update()}catch(_){}}}catch(_){ }
}
async function watchdog(){await purgeLegacy();await new Promise(r=>setTimeout(r,5500));if(fullEnough()){setState('정상 · v0.3.4 전체 대시보드 로드 완료','good');return}const app=q('#app');if(app&&app.textContent.trim()){setState('오류 · 전체 섹션이 덜 로드됨. 현재 보이는 내용은 유지합니다.','warn');return}if(app){app.innerHTML='<section class="hero" id="market"><div class="muted">v0.3.4 보호 화면</div><h1>대시보드 렌더링 오류</h1><p>화면을 비워두지 않고 오류 상태를 유지합니다. 새 버전 배포를 확인해 주세요.</p></section>'}setState('오류 · 렌더링 실패','warn')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchdog,{once:true});else watchdog();
})();
