(()=>{
'use strict';
const setMark=()=>{
  const mark=document.querySelector('.mr-buildmark');
  if(mark&&mark.textContent!=='MR055') mark.textContent='MR055';
};
function apply(root=document){
  const cycles=[];
  if(root.matches?.('.v51c-cycle')) cycles.push(root);
  root.querySelectorAll?.('.v51c-cycle').forEach(x=>cycles.push(x));
  for(const cycle of cycles){
    if(!cycle.classList.contains('v54-ready')) continue;
    const ref=cycle.querySelector(':scope > .v54-ref');
    const zoom=cycle.querySelector(':scope > .v51c-zoom');
    if(ref){
      const title=ref.querySelector('.v54-ref-head b');
      if(title&&title.textContent!=='실제 사이클 비교 · 캔들 기준') title.textContent='실제 사이클 비교 · 캔들 기준';
    }
    if(zoom && !cycle.querySelector(':scope > .v55-overlay-head')){
      zoom.insertAdjacentHTML('beforebegin','<div class="v55-overlay-head"><b>과거 사이클 겹쳐 비교</b><span>색 선 = 서로 다른 실제 과거 경로 · 굵은 연두선 = 현재 경로</span></div>');
    }
    const pairTitle=cycle.querySelector(':scope > .v51c-pair-title');
    if(pairTitle&&pairTitle.textContent!=='현재 vs 과거 1대1 비교') pairTitle.textContent='현재 vs 과거 1대1 비교';
    cycle.dataset.v55Compare='restored';
  }
  setMark();
}
apply();
const mo=new MutationObserver(ms=>{
  setMark();
  for(const m of ms){
    if(m.target?.closest?.('.v51c-cycle')) apply(m.target.closest('.v51c-cycle'));
    for(const n of m.addedNodes){if(n.nodeType===1)apply(n)}
  }
});
mo.observe(document.body,{childList:true,subtree:true,characterData:true});
/* Legacy v53/v54 observers may rewrite the tiny build mark after late DOM updates. Keep v55 authoritative. */
setInterval(()=>{setMark();apply()},250);
console.info('[MR055] previous overlay comparisons restored beside reference candle chart');
})();
