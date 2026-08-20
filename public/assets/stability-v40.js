(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const IDS=['themes','action','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
const FOLD='mr:fold:v040:';
let repairing=false, rerenders=0, debounce=null;
function bindFold(root=document){$$('[data-fold]',root).forEach(b=>{
  const id=b.dataset.fold,s=document.getElementById(id); if(!s)return;
  if(b.dataset.v40Bound==='1')return;
  b.dataset.v40Bound='1';
  try{const v=localStorage.getItem(FOLD+id);if(v==='1'){s.classList.add('is-folded');b.textContent='펼치기'}else if(v==='0'){s.classList.remove('is-folded');b.textContent='접기'}}catch(_){ }
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const folded=s.classList.toggle('is-folded');b.textContent=folded?'펼치기':'접기';try{localStorage.setItem(FOLD+id,folded?'1':'0')}catch(_){}});
});
}
function bindNav(root=document){$$('[data-go]',root).forEach(b=>{if(b.dataset.v40Nav==='1')return;b.dataset.v40Nav='1';b.addEventListener('click',e=>{e.preventDefault();document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth',block:'start'})})})}
function normalize(){const app=$('#app');if(!app)return;app.style.removeProperty('height');app.style.removeProperty('min-height');app.style.removeProperty('max-height');app.style.removeProperty('overflow');$$('#app>.sec,#app>.fold-panel').forEach(sec=>{sec.style.removeProperty('height');sec.style.removeProperty('min-height');sec.style.removeProperty('max-height');sec.style.removeProperty('overflow');const body=$('.fold-body',sec);if(body){body.style.removeProperty('height');body.style.removeProperty('min-height');body.style.removeProperty('max-height');if(!sec.classList.contains('is-folded'))body.style.removeProperty('overflow')}})}
function status(){const missing=IDS.filter(id=>!document.getElementById(id));const d=window.__MR_D||{};const expected=Array.isArray(d.themes)?d.themes.length:0;const actual=$$('#themes .theme[data-theme]').length;return{missing,expected,actual,ok:missing.length===0&&(!expected||actual>=expected)}}
function rerender(){if(repairing||rerenders>=1)return;repairing=true;rerenders++;const s=document.createElement('script');s.src='../assets/full-recovery-v22.js?v40repair='+Date.now();s.onload=()=>setTimeout(()=>{repairing=false;normalize();bindFold();bindNav();window.__MR_REPAIR_CORE__?.()},300);s.onerror=()=>{repairing=false};document.body.appendChild(s)}
function check(){normalize();bindFold();bindNav();const st=status();if(!st.ok&&window.__MR_D)rerender();return st}
window.__MR_STABILITY40__=check;
function schedule(){clearTimeout(debounce);debounce=setTimeout(check,180)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
const app=$('#app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
setTimeout(check,700);setTimeout(check,1800);
})();
