(()=>{
'use strict';
const apply=(root=document)=>{
  root.querySelectorAll?.('.v51c-svg,.v51c-pair-svg').forEach(svg=>{
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.style.height='auto';
    svg.style.minHeight='0';
    svg.dataset.v53Compact='1';
  });
  root.querySelectorAll?.('.v51c-cycle').forEach(x=>x.dataset.v53Visual='legacy-compact');
  const mark=document.querySelector('.mr-buildmark');
  if(mark)mark.textContent='MR053';
};
apply();
const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1)apply(n)}});
mo.observe(document.body,{childList:true,subtree:true});
console.info('[MR053] compact cycle visual style enabled');
})();
