/* Small hotfixes for v11 safe layer. Intentionally additive and rollback-friendly. */
(function(){
  'use strict';
  function list(v){return Array.isArray(v)?v:[]}
  function d(){try{return D||{}}catch(_){return {}}}

  function collapseOne(sec){
    if(!sec||sec.dataset.mrCollapse==='1'||sec.id==='market')return;
    const head=sec.querySelector(':scope > .sectionhead')||sec.querySelector(':scope > h2');if(!head)return;
    sec.dataset.mrCollapse='1';
    const body=document.createElement('div');body.className='mr-collapse-body';[...sec.children].filter(x=>x!==head).forEach(x=>body.appendChild(x));sec.appendChild(body);
    const btn=document.createElement('button');btn.type='button';btn.className='mr-collapse-btn';
    const key='mr-collapse-'+(sec.id||'section');const defaultClosed=['expanded','research','history','false-positive-replay','macro','sources'].includes(sec.id);let open=!defaultClosed;
    try{const s=localStorage.getItem(key);if(s!==null)open=s==='1'}catch(_){}
    const apply=()=>{body.hidden=!open;btn.textContent=open?'접기':'펼치기';try{localStorage.setItem(key,open?'1':'0')}catch(_){}};btn.onclick=()=>{open=!open;apply()};
    if(head.classList?.contains('sectionhead'))head.appendChild(btn);else head.insertAdjacentElement('afterend',btn);apply();
  }
  function collapseLate(){document.querySelectorAll('section.sec').forEach(collapseOne)}

  function armBrokenAltImages(root){
    (root||document).querySelectorAll('.mr-alt-chart-img').forEach(img=>{
      if(img.dataset.mrImgGuard==='1')return;img.dataset.mrImgGuard='1';
      img.addEventListener('error',()=>{img.style.display='none';const note=document.createElement('div');note.className='emptychart';note.textContent='대체 이미지도 차단됨. 오늘 내부 시간그래프 또는 아래 외부 차트를 사용하세요.';img.insertAdjacentElement('afterend',note)},{once:true});
    });
  }

  function patchETFOnce(){
    if(typeof openETF!=='function'||openETF.__mrHotfix)return;
    const base=openETF;
    const wrapped=function(kind,id){
      const arr=list(d().etf_lists?.[kind]);const x=arr.find(v=>(v.ticker||v.code)===id);
      const fallback=()=>{
        const name=x?.name||'ETF';let chart='';try{if(kind==='us'&&typeof tvFrame==='function')chart=tvFrame(id)}catch(_){}
        if(typeof showModal==='function')showModal(`${id} — ${name}`,'ETF 상세',`${chart?`<div class="detailblock"><h4>실제 ETF 차트</h4>${chart}</div>`:''}<div class="detailblock"><h4>상태</h4><div>${x?'기본 상세로 표시합니다.':'현재 테마 추적 대상이며 세부 데이터는 다음 자동 갱신에서 보강합니다.'}</div></div>`);
      };
      if(!x){fallback();return}
      const oldTitle=document.getElementById('modalTitle')?.textContent||'';
      try{base(kind,id)}catch(_){fallback();return}
      setTimeout(()=>{const m=document.getElementById('modal');const newTitle=document.getElementById('modalTitle')?.textContent||'';if(!m?.classList.contains('open')||newTitle===oldTitle)fallback()},60);
    };
    wrapped.__mrHotfix=true;
    try{openETF=wrapped}catch(_){try{window.openETF=wrapped}catch(__){}}
  }

  function normalizeTouch(root){
    (root||document).querySelectorAll('.detailhint').forEach(x=>x.textContent='터치');
    (root||document).querySelectorAll('*').forEach(el=>{if(el.children.length)return;const t=(el.textContent||'').trim();if(/^터치\s*(→|->|>)/.test(t))el.textContent='터치'});
  }

  function maintain(){collapseLate();patchETFOnce();armBrokenAltImages(document);normalizeTouch(document)}
  const app=document.getElementById('app');if(app){new MutationObserver(()=>maintain()).observe(app,{childList:true,subtree:true})}
  const modal=document.getElementById('modalBody');if(modal){new MutationObserver(()=>{armBrokenAltImages(modal);normalizeTouch(modal)}).observe(modal,{childList:true,subtree:true})}
  maintain();
})();