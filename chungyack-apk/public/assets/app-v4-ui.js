// v0.4.1 Android/WebView UI isolation and overflow QA.
const CY41_APP_VERSION='0.4.1';
function cy41SetPageState(name){
  const pages=$$('.page');
  const valid=pages.some(p=>p.dataset.page===name)?name:'home';
  pages.forEach(p=>{
    const on=p.dataset.page===valid;
    p.classList.toggle('active',on);
    p.hidden=!on;
    p.setAttribute('aria-hidden',on?'false':'true');
    try{p.inert=!on}catch{}
    if(on)p.style.removeProperty('display');else p.style.display='none';
  });
  $$('.nav-btn').forEach(b=>{const on=b.dataset.page===valid;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
  document.documentElement.scrollLeft=0;document.body.scrollLeft=0;
  window.scrollTo(0,0);
  requestAnimationFrame(()=>{document.documentElement.scrollLeft=0;document.body.scrollLeft=0;void document.body.offsetHeight;cy41CheckOverflow(valid)});
  return valid;
}
openPage=function(name){return cy41SetPageState(name)};
function cy41CheckOverflow(pageName){
  const page=document.querySelector(`.page[data-page="${pageName}"]:not([hidden])`);if(!page)return;
  const offenders=[];
  page.querySelectorAll('*').forEach(el=>{
    const cs=getComputedStyle(el);if(cs.position==='fixed')return;
    if(el.scrollWidth>el.clientWidth+3&&cs.overflowX==='visible')offenders.push(el);
  });
  if(offenders.length)console.warn('[CY mobile QA] horizontal overflow guarded:',offenders.slice(0,8));
}
const cy41Hero=renderHero;renderHero=function(){cy41Hero();const v=$('#appVersion');if(v)v.textContent='v'+CY41_APP_VERSION};
const cy41Settings=renderSettings;renderSettings=function(){cy41Settings();const v=$('#settingsVersion');if(v)v.textContent=CY41_APP_VERSION};
function cy41Wire(){
  cy41SetPageState('home');
  window.addEventListener('resize',()=>{const active=document.querySelector('.page.active:not([hidden])')?.dataset.page||'home';document.documentElement.scrollLeft=0;document.body.scrollLeft=0;cy41CheckOverflow(active)},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){const active=document.querySelector('.page.active:not([hidden])')?.dataset.page||'home';cy41SetPageState(active)}});
}
window.addEventListener('DOMContentLoaded',cy41Wire);
