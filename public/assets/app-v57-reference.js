(()=>{
'use strict';
function apply(){
 const mark=document.querySelector('.mr-buildmark');
 if(mark)mark.textContent='MR057';
 document.querySelectorAll('#cycle-visual .v54-svg,#cycle-visual .v56w-svg').forEach(svg=>{
   svg.setAttribute('preserveAspectRatio','xMidYMid meet');
   svg.dataset.v57Reference='1';
 });
}
apply();
const mo=new MutationObserver(apply);
mo.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',()=>{apply();setTimeout(apply,500);setTimeout(apply,1800)});
})();
