(()=>{
'use strict';
const FOLD='mr:fold:v041:';
const $=(s,r=document)=>r.querySelector(s);
function setFold(section,folded){
  if(!section)return;
  section.classList.toggle('is-folded',folded);
  section.style.height='auto';
  section.style.minHeight='0';
  section.style.maxHeight='none';
  section.style.transform='none';
  const body=section.querySelector(':scope > .fold-body');
  if(body){
    body.style.height='auto';
    body.style.minHeight='0';
    body.style.maxHeight='none';
    body.style.transform='none';
    body.style.display=folded?'none':'';
  }
  const btn=section.querySelector(':scope > .fold-head [data-fold]');
  if(btn)btn.textContent=folded?'펼치기':'접기';
}
function restoreFolds(){
  document.querySelectorAll('.fold-panel[id]').forEach(section=>{
    let folded=section.classList.contains('is-folded');
    try{
      const v=localStorage.getItem(FOLD+section.id);
      if(v==='1')folded=true;
      if(v==='0')folded=false;
    }catch(_){ }
    setFold(section,folded);
  });
}
function closeModal(){
  const m=$('#modal');
  if(!m?.classList.contains('open'))return false;
  m.classList.remove('open');
  document.documentElement.style.overflow='';
  document.body.style.overflow='';
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.left='';
  document.body.style.right='';
  document.body.style.width='';
  return true;
}
function clickHandler(e){
  const fold=e.target.closest('[data-fold]');
  if(fold){
    e.preventDefault();
    e.stopPropagation();
    const section=document.getElementById(fold.dataset.fold);
    const next=!section?.classList.contains('is-folded');
    setFold(section,next);
    try{localStorage.setItem(FOLD+fold.dataset.fold,next?'1':'0')}catch(_){ }
    return;
  }
  const nav=e.target.closest('[data-go]');
  if(nav){
    e.preventDefault();
    const target=document.getElementById(nav.dataset.go);
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  if(e.target.closest('#modalClose')){
    e.preventDefault();
    closeModal();
    return;
  }
  const modal=$('#modal');
  if(modal?.classList.contains('open')&&e.target===modal){
    e.preventDefault();
    closeModal();
  }
}
function installCss(){
  if($('#mr41css'))return;
  const s=document.createElement('style');
  s.id='mr41css';
  s.textContent=`
    #app{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
    #app>.sec,#app>.fold-panel,#app>#segmentPhaseNow{position:relative!important;inset:auto!important;transform:none!important;translate:none!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
    .fold-panel>.fold-body{height:auto!important;min-height:0!important;max-height:none!important;transform:none!important;overflow:visible!important}
    .fold-panel.is-folded>.fold-body{display:none!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
    .fold-panel.is-folded{height:auto!important;min-height:0!important;max-height:none!important}
  `;
  document.head.appendChild(s);
}
function init(){
  installCss();
  restoreFolds();
  if(document.documentElement.dataset.mr41Bound!=='1'){
    document.documentElement.dataset.mr41Bound='1';
    document.addEventListener('click',clickHandler,true);
  }
  window.__MR_HANDLE_NATIVE_BACK__=()=>closeModal();
  window.__MR_INTERACTION41_READY__=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.__MR_INTERACTION41__=init;
})();
