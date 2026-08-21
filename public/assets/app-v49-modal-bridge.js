(()=>{
'use strict';
const $=(s,r=document)=>r?.querySelector?.(s)||null;
function bridge(){
  const modal=$('#modal');
  if(!modal?.classList.contains('open')) return false;
  const slot=$('#modal .cycle-slot[data-cycle-target]');
  if(!slot || slot.dataset.v49Done==='1') return false;
  if($(':scope>.v48-shell',slot)) return true;
  const primary=$(':scope>.v48-modal-primary',slot);
  if(!primary) return false;
  const shell=document.createElement('div');
  shell.className='v48-shell v49-modal-bridge-shell';
  slot.insertBefore(shell,primary);
  shell.appendChild(primary);
  return true;
}
function arm(){
  const modal=$('#modal'),body=$('#modalBody');
  if(body)new MutationObserver(()=>{if(bridge())console.info('[MR049 bridge] modal v48 shell normalized')}).observe(body,{childList:true,subtree:true});
  if(modal)new MutationObserver(()=>{if(modal.classList.contains('open')){bridge();setTimeout(bridge,80);setTimeout(bridge,220)}}).observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('click',e=>{if(e.target.closest('[data-ticker],[data-theme]')){setTimeout(bridge,80);setTimeout(bridge,220);setTimeout(bridge,500)}},false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arm,{once:true});else arm();
})();
