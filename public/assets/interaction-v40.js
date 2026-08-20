(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const FOLD='mr:fold:v040:';
function applyFold(section,folded){if(!section)return;section.classList.toggle('is-folded',folded);section.style.setProperty('height','auto','important');section.style.setProperty('min-height','0','important');section.style.setProperty('max-height','none','important');const body=section.querySelector('.fold-body');if(body){body.style.removeProperty('height');body.style.removeProperty('min-height');body.style.removeProperty('max-height');body.style.setProperty('display',folded?'none':'block','important')}const b=section.querySelector(':scope>.fold-head [data-fold]');if(b)b.textContent=folded?'펼치기':'접기'}
function bindFolds(){$$('[data-fold]').forEach(b=>{if(b.dataset.mr40Bound==='1')return;b.dataset.mr40Bound='1';b.onclick=null;const id=b.dataset.fold,s=document.getElementById(id);let folded=s?.classList.contains('is-folded')??true;try{const v=localStorage.getItem(FOLD+id);if(v==='1')folded=true;if(v==='0')folded=false}catch(_){}applyFold(s,folded);b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const now=!s.classList.contains('is-folded');applyFold(s,now);try{localStorage.setItem(FOLD+id,now?'1':'0')}catch(_){}})})}
function bindNav(){$$('[data-go]').forEach(b=>{if(b.dataset.mr40Nav==='1')return;b.dataset.mr40Nav='1';b.onclick=null;b.addEventListener('click',e=>{e.preventDefault();document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth',block:'start'})})})}
function closeModal(){const m=$('#modal');if(!m?.classList.contains('open'))return false;m.classList.remove('open');document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';return true}
function bindModal(){const m=$('#modal'),c=$('#modalClose');if(c&&c.dataset.mr40!=='1'){c.dataset.mr40='1';c.addEventListener('click',e=>{e.preventDefault();closeModal()})}if(m&&m.dataset.mr40!=='1'){m.dataset.mr40='1';m.addEventListener('click',e=>{if(e.target===m)closeModal()})}window.__MR_HANDLE_NATIVE_BACK__=()=>closeModal()}
function css(){if($('#mrInteraction40Css'))return;const s=document.createElement('style');s.id='mrInteraction40Css';s.textContent=`
.fold-panel{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
.fold-panel>.fold-body{height:auto!important;min-height:0!important;max-height:none!important}
.fold-panel.is-folded{height:auto!important;min-height:0!important;max-height:none!important;padding-bottom:12px!important}
.fold-panel.is-folded>.fold-body{display:none!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
.fold-panel.is-folded>.fold-head{margin-bottom:0!important;padding-bottom:0!important;border-bottom:0!important}
#app{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
`;document.head.appendChild(s)}
function run(){css();bindFolds();bindNav();bindModal()}
window.__MR_INTERACTION40__=run;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let t=null;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,60)}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();
