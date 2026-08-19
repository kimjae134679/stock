/* v15 persistent chart guard: TradingView first, Finviz/links fallback if the main chart is missing or slow. */
(function(){
  'use strict';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function tickerFrom(wrap){const f=wrap.querySelector('iframe');const title=f?.getAttribute('title')||'';return (title.match(/^([^ ]+)/)||[])[1]||'QQQ';}
  function add(wrap){
    if(!wrap||wrap.dataset.mrPersistentFallback==='1')return;wrap.dataset.mrPersistentFallback='1';
    const iframe=wrap.querySelector('iframe');if(!iframe)return;const ticker=tickerFrom(wrap);const isKr=/^\d{6}$/.test(ticker);const box=document.createElement('details');box.className='mr-alt-chart';
    const img=isKr?'':`<img class="mr-alt-chart-img" loading="lazy" alt="${esc(ticker)} 대체 가격차트" src="https://charts2.finviz.com/chart.ashx?t=${encodeURIComponent(ticker)}&ty=c&ta=1&p=d&s=l">`;
    const google=isKr?`https://www.google.com/finance/quote/${encodeURIComponent(ticker)}:KRX`:`https://www.google.com/finance/quote/${encodeURIComponent(ticker)}:NASDAQ`;
    box.innerHTML=`<summary>다른 차트</summary><div class="mr-chart-fallback">${img}<div class="mr-chart-links"><a target="_blank" rel="noopener" href="${google}">Google Finance</a><a target="_blank" rel="noopener" href="https://www.tradingview.com/search/?query=${encodeURIComponent(ticker)}">TradingView</a></div><small>기본 차트가 비거나 늦으면 대체차트/외부차트를 사용하세요. 우리 내부 시간그래프도 별도로 유지됩니다.</small></div>`;
    wrap.insertAdjacentElement('afterend',box);
    let loaded=false;iframe.addEventListener('load',()=>{loaded=true},{once:true});iframe.addEventListener('error',()=>{box.open=true},{once:true});setTimeout(()=>{if(!loaded)box.open=true},8000);
    box.querySelector('img')?.addEventListener('error',e=>{e.currentTarget.style.display='none';const n=document.createElement('div');n.className='emptychart';n.textContent='대체 이미지도 차단됨. 아래 Google Finance / TradingView 또는 내부 시간그래프를 사용하세요.';e.currentTarget.insertAdjacentElement('afterend',n)},{once:true});
  }
  function scan(root){(root||document).querySelectorAll('.tvwrap').forEach(add);}
  const app=document.getElementById('app');if(app)new MutationObserver(()=>scan(app)).observe(app,{childList:true,subtree:true});
  const modal=document.getElementById('modalBody');if(modal)new MutationObserver(()=>scan(modal)).observe(modal,{childList:true,subtree:true});
  scan(document);
})();