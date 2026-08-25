(()=>{
'use strict';
function apply(root=document){
 const mark=document.querySelector('.mr-buildmark');
 if(mark&&mark.textContent!=='MR057')mark.textContent='MR057';
 root.querySelectorAll?.('#cycle-visual .v54-svg,#cycle-visual .v56w-svg,#cycle-visual .v56f-svg').forEach(svg=>{
   if(svg.getAttribute('preserveAspectRatio')!=='xMidYMid meet')svg.setAttribute('preserveAspectRatio','xMidYMid meet');
   if(svg.dataset.v57Reference!=='1')svg.dataset.v57Reference='1';
 });
}
apply();
const mo=new MutationObserver(ms=>{
 let needs=false;
 for(const m of ms){if(m.addedNodes?.length){needs=true;break}}
 if(needs)apply();
});
mo.observe(document.body||document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>{apply();setTimeout(apply,500);setTimeout(()=>{apply();mo.disconnect()},3500)});
})();
