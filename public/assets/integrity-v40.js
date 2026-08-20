(()=>{
'use strict';
const IDS=['themes','action','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
let reruns=0,pending=false;
function status(){const missing=IDS.filter(id=>!document.getElementById(id));const d=window.__MR_D||{};const exp=Array.isArray(d.themes)?d.themes.length:0;const got=document.querySelectorAll('#themes .theme[data-theme]').length;const app=document.getElementById('app');return{missing,exp,got,sections:IDS.length-missing.length,height:app?.scrollHeight||0,ok:missing.length===0&&exp>0&&got>=exp}}
function rerender(){if(reruns>=1)return;reruns++;const s=document.createElement('script');s.src='../assets/full-recovery-v22.js?v40repair='+Date.now();s.async=false;s.onload=()=>setTimeout(()=>{window.__MR_FLOW40__?.();window.__MR_REPAIR_CORE__?.()},180);document.body.appendChild(s)}
function repair(){window.__MR_REPAIR_CORE__?.();window.__MR_FLOW40__?.();const st=status();if(!st.ok)rerender();return st}
function schedule(){if(pending)return;pending=true;setTimeout(()=>{pending=false;repair()},120)}
window.__MR_INTEGRITY40__=repair;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair,{once:true});else repair();
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();
