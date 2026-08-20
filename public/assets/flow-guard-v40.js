(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const KNOWN=['market','segmentPhaseNow','themes','action','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
let busy=false,timer=null;
function css(){if($('#mrFlow40Css'))return;const s=document.createElement('style');s.id='mrFlow40Css';s.textContent=`
#app{display:block!important;position:relative!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;gap:0!important}
#app>#segmentPhaseNow,#app>.sec,#app>.fold-panel{position:relative!important;inset:auto!important;top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;float:none!important;clear:none!important;transform:none!important;translate:none!important;margin-top:24px!important;margin-bottom:0!important;height:auto!important;min-height:0!important;max-height:none!important;visibility:visible!important;opacity:1!important}
#app>#segmentPhaseNow{margin-top:16px!important;padding-bottom:14px!important}
#app>.fold-panel>.fold-body{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
#app>.fold-panel.is-folded>.fold-body{display:none!important}
#app>.fold-panel.is-folded{height:auto!important;min-height:0!important;max-height:none!important}
.mr-flow-spacer-killed{height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}
`;document.head.appendChild(s)}
function isVisible(el){if(!el)return false;const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)>0}
function killUnknownSpacers(app){[...app.children].forEach(el=>{if(KNOWN.includes(el.id))return;if(el.matches('.endmark,.footer'))return;const useful=el.querySelector('button,iframe,svg,canvas,.card,.fold-head,.phase-now-grid');const text=(el.textContent||'').trim();const h=el.getBoundingClientRect().height;if(!useful&&text.length<3&&h>80)el.classList.add('mr-flow-spacer-killed')})}
function normalizeKnown(app){KNOWN.forEach(id=>{const el=document.getElementById(id);if(!el||el===document.getElementById('market'))return;for(const p of ['height','min-height','max-height','margin-top','margin-bottom','top','bottom','transform','translate','position'])el.style.removeProperty(p);el.style.setProperty('position','relative','important');el.style.setProperty('top','auto','important');el.style.setProperty('bottom','auto','important');el.style.setProperty('transform','none','important');el.style.setProperty('margin-top',id==='segmentPhaseNow'?'16px':'24px','important');el.style.setProperty('margin-bottom','0','important');el.style.setProperty('height','auto','important');el.style.setProperty('min-height','0','important');el.style.setProperty('max-height','none','important');})}
function collapseBlankTail(sec){if(!sec||!isVisible(sec))return;const body=sec.classList.contains('fold-panel')?sec.querySelector('.fold-body'):sec;if(!body||sec.classList.contains('is-folded'))return;const kids=[...body.children].filter(isVisible);if(!kids.length)return;const r=body.getBoundingClientRect();const bottom=Math.max(...kids.map(k=>k.getBoundingClientRect().bottom));if(r.bottom-bottom>180){body.style.setProperty('height','auto','important');body.style.setProperty('min-height','0','important');body.style.setProperty('max-height','none','important');body.style.setProperty('padding-bottom','0','important')}}
function repairGaps(app){const visible=[...app.children].filter(el=>isVisible(el)&&!el.classList.contains('mr-flow-spacer-killed'));
 for(let i=1;i<visible.length;i++){
  const a=visible[i-1],b=visible[i];
  if(!(KNOWN.includes(a.id)||KNOWN.includes(b.id)))continue;
  const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),gap=br.top-ar.bottom;
  if(gap>120){b.style.setProperty('margin-top','24px','important');requestAnimationFrame(()=>{const ar2=a.getBoundingClientRect(),br2=b.getBoundingClientRect(),g2=br2.top-ar2.bottom;if(g2>120){const pull=Math.min(g2-24,1200);b.style.setProperty('transform',`translateY(-${pull}px)`,'important');b.dataset.mrPulled=String(Math.round(pull));console.warn('[MR040 flow] collapsed abnormal gap',a.id,'->',b.id,Math.round(g2))}})}
 }
}
function run(){if(busy)return;busy=true;try{css();const app=$('#app');if(!app)return;killUnknownSpacers(app);normalizeKnown(app);KNOWN.forEach(id=>collapseBlankTail(document.getElementById(id)));repairGaps(app);app.dataset.mrFlow='ok'}finally{busy=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(run,80)}
window.__MR_FLOW40__=run;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
setInterval(run,1200);
})();
