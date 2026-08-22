(()=>{
'use strict';
const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?[...r.querySelectorAll(s)]:[];
function text(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function apply(root=document){
  $$('.v51c-svg,.v51c-pair-svg',root).forEach(svg=>{
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.style.height='auto';
    svg.style.minHeight='0';
    svg.dataset.v52RatioFix='1';
  });
  $$('.v51c-cycle',root).forEach(cycle=>{
    const zoom=$('.v51c-zoom',cycle);
    if(!zoom||$('.v52-chart-note',cycle))return;
    const state=$$('.v51c-state>div',cycle);
    const elapsed=state.find(x=>text(x).includes('경과'))||state[1];
    const prior=state.find(x=>text(x).includes('직전'))||state[2];
    const match=state.find(x=>text(x).includes('닮은'))||state[3];
    const note=document.createElement('div');
    note.className='v52-chart-note';
    const item=(label,src,fallback)=>`<span><small>${label}</small><b>${src?text(src.querySelector('b')):fallback}</b><em>${src?text(src.querySelector('span')):''}</em></span>`;
    note.innerHTML=item('현재 진행',elapsed,'현재 구간 확인 중')+item('직전 파동',prior,'직전 구간 확인 중')+item('비교 기준',match,'과거 유사 구간 확인 중');
    zoom.insertAdjacentElement('afterend',note);
  });
  const mark=document.querySelector('.mr-buildmark');
  if(mark)mark.textContent='MR052';
}
apply();
const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1)apply(n)}});
mo.observe(document.body,{childList:true,subtree:true});
console.info('[MR052] proportional cycle charts enabled');
})();
