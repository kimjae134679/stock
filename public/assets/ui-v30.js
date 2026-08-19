(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function normalizeChart(frame){
  if(!frame||frame.dataset.v30==='1')return;
  try{
    const u=new URL(frame.src,location.href);
    if(u.hostname.includes('tradingview.com')){
      u.searchParams.set('interval','1D');
      frame.src=u.toString();
    }
  }catch(_){ }
  frame.dataset.v30='1';
}
function cleanToolbar(root=document){
  $$('.chart-toolbar',root).forEach(tb=>{
    $$('[data-int],button',tb).forEach(b=>b.remove());
    let label=$('span',tb);
    if(!label){label=document.createElement('span');tb.appendChild(label)}
    label.textContent='일봉 기준 · 넓게 표시';
  });
  $$('.big-tv iframe',root).forEach(normalizeChart);
}
function hardenModal(){
  const modal=$('#modal');
  if(!modal)return;
  cleanToolbar(modal);
  new MutationObserver(()=>cleanToolbar(modal)).observe(modal,{childList:true,subtree:true});
}
function fixButtons(){
  const selectors=['#mr-famous button[data-ticker]','#mr-universe button[data-ticker]','#expanded button[data-ticker]','.ticker-chip','.fold-btn','.v28-rank-row'];
  selectors.forEach(sel=>$$(sel).forEach(b=>{b.type='button';b.classList.add('v30-button-ready')}));
}
function run(){cleanToolbar();hardenModal();fixButtons();new MutationObserver(()=>{cleanToolbar();fixButtons()}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
