(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const IDS=['themes','action','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
let repairLoads=0, timer=null;
function css(){if($('#v39IntegrityCss'))return;const s=document.createElement('style');s.id='v39IntegrityCss';s.textContent=`
#app{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
#app>.sec,#app>.fold-panel{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;align-self:auto!important;overflow:visible!important}
#app>.fold-panel>.fold-body{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
#app>.fold-panel>.fold-body>.grid{height:auto!important;min-height:0!important;max-height:none!important;align-content:start!important}
#themes,#themes .fold-body,#themes .grid{height:auto!important;min-height:0!important;max-height:none!important;align-content:start!important}
#themes .theme[data-theme]{height:auto!important;min-height:0!important;max-height:none!important}
#app>.fold-panel.is-folded{height:auto!important;min-height:0!important}
#app>.fold-panel.is-folded>.fold-body{display:none!important}
.v39-cut-warning{margin:10px 0;padding:10px 12px;border:1px solid #7f1d1d;border-radius:12px;background:#2a0d0d;color:#fecaca;font-weight:800}
`;document.head.appendChild(s)}
function normalizeBox(el){if(!el)return;for(const p of ['height','minHeight','maxHeight'])el.style[p]='';el.style.removeProperty('height');el.style.removeProperty('min-height');el.style.removeProperty('max-height');if(!el.classList.contains('is-folded'))el.style.removeProperty('overflow')}
function normalize(){css();normalizeBox($('#app'));$$('#app>.sec,#app>.fold-panel,#app>.fold-panel>.fold-body,#themes,#themes .fold-body,#themes .grid').forEach(normalizeBox);$$('#themes .theme[data-theme]').forEach(c=>{normalizeBox(c);c.style.display='';c.style.visibility='visible';c.style.opacity='1'});}
function status(){const missing=IDS.filter(id=>!document.getElementById(id));const d=window.__MR_D||{};const expectedThemes=Array.isArray(d.themes)?d.themes.length:0;const actualThemes=$$('#themes .theme[data-theme]').length;return{missing,expectedThemes,actualThemes,ok:missing.length===0&&(!expectedThemes||actualThemes>=expectedThemes)}}
function detectBlankTail(sec){if(!sec||sec.classList.contains('is-folded'))return false;const body=sec.querySelector('.fold-body');if(!body)return false;const kids=[...body.children].filter(x=>{const cs=getComputedStyle(x);return cs.display!=='none'&&cs.visibility!=='hidden'});if(!kids.length)return body.getBoundingClientRect().height>180;let bottom=Math.max(...kids.map(x=>x.getBoundingClientRect().bottom));const r=body.getBoundingClientRect();return r.bottom-bottom>220}
function compactTails(){for(const id of IDS){const sec=document.getElementById(id);if(!sec)continue;if(detectBlankTail(sec)){const body=sec.querySelector('.fold-body');if(body){body.style.setProperty('height','auto','important');body.style.setProperty('min-height','0','important');body.style.setProperty('max-height','none','important');body.style.setProperty('padding-bottom','0','important')}}}}
function rerunRenderer(){if(repairLoads>=2)return;repairLoads++;const s=document.createElement('script');s.src='../assets/full-recovery-v22.js?v39repair='+Date.now();s.async=false;s.onload=()=>setTimeout(()=>{normalize();compactTails();window.__MR_REPAIR_CORE__?.()},120);document.body.appendChild(s)}
function repair(){normalize();window.__MR_REPAIR_CORE__?.();compactTails();const st=status();if(!st.ok)rerunRenderer();return st}
window.__MR_INTEGRITY39__=repair;
function watch(){clearTimeout(timer);timer=setTimeout(()=>{repair()},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{repair()},{once:true});else repair();
new MutationObserver(watch).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
setInterval(()=>{normalize();compactTails()},1500);
})();
