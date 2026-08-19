(()=>{
'use strict';
const MAP={"60":"60","D":"1D","W":"1W","M":"1M","1D":"1D","1W":"1W","1M":"1M"};
function updateChart(btn){
  const frame=document.getElementById('modalChart');
  if(!frame)return;
  const raw=btn?.dataset?.int;
  const interval=MAP[raw]||raw||'1D';
  try{
    const u=new URL(frame.src,location.href);
    u.searchParams.set('interval',interval);
    u.searchParams.set('_mr',Date.now().toString());
    frame.src=u.toString();
  }catch(_){
    const src=String(frame.src||'');
    const sep=src.includes('?')?'&':'?';
    frame.src=src+sep+'interval='+encodeURIComponent(interval)+'&_mr='+Date.now();
  }
  const scope=btn.closest('.chart-toolbar')||document;
  scope.querySelectorAll('[data-int]').forEach(x=>x.classList.toggle('active',x===btn));
  const label=scope.querySelector('.mr-interval-state')||document.createElement('strong');
  if(!label.classList.contains('mr-interval-state')){
    label.className='mr-interval-state';
    scope.appendChild(label);
  }
  label.textContent=({'60':'1시간','1D':'일봉','1W':'주봉','1M':'월봉'})[interval]||interval;
}
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-int]');
  if(!btn)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  updateChart(btn);
},true);
new MutationObserver(()=>{
  document.querySelectorAll('[data-int]').forEach(btn=>{
    const v=MAP[btn.dataset.int];
    if(v)btn.dataset.tvInterval=v;
  });
}).observe(document.body,{childList:true,subtree:true});
const st=document.createElement('style');
st.textContent='.mr-interval-state{display:inline-flex;padding:5px 9px;border-radius:999px;background:#0d2a3d;border:1px solid #3b82f6;color:#bfdbfe;font-size:11px}.chart-toolbar [data-int]{position:relative;z-index:2}';
document.head.appendChild(st);
})();
