(()=>{
'use strict';
const apply=(root=document)=>{
  root.querySelectorAll?.('.v51c-svg,.v51c-pair-svg').forEach(svg=>{
    svg.setAttribute('preserveAspectRatio','none');
    svg.dataset.v51dLarge='1';
  });
  const mark=document.querySelector('.mr-buildmark');
  if(mark)mark.textContent='MR051D';
};
apply();
const mo=new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.('.v51c-svg,.v51c-pair-svg')||n.querySelector?.('.v51c-svg,.v51c-pair-svg'))apply(n)}}});
mo.observe(document.body,{childList:true,subtree:true});
console.info('[MR051D] large cycle charts enabled');
})();
