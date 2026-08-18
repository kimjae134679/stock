/* Automatically reveal an alternate chart when an embedded primary chart does not load in time. */
(function(){
  const TIMEOUT=8000;
  function internalFallback(box,ticker){
    if(box.querySelector('.internal-chart-fallback'))return;
    const d=document.createElement('div');d.className='internal-chart-fallback detailblock';
    try{
      const vals=typeof intradayVals==='function'?intradayVals(ticker):[];
      d.innerHTML=`<h4>앱 내부 시간그래프</h4>${typeof lineSvg==='function'?lineSvg(vals,ticker+' 오늘 가격','#7dd3fc'):'<div class="emptychart">내부 시간 데이터 준비 중</div>'}`;
    }catch(_){d.innerHTML='<div class="emptychart">내부 시간 데이터 준비 중</div>'}
    box.appendChild(d);
  }
  function attach(box){
    if(!box||box.dataset.autoFallback==='1')return;box.dataset.autoFallback='1';
    const iframe=box.querySelector('.primary-chart iframe'),alt=box.querySelector('.alt-chart'),ticker=box.dataset.chart||'';
    if(!iframe||!alt)return;
    let loaded=false;
    const ok=()=>{loaded=true;box.classList.add('primary-loaded')};
    iframe.addEventListener('load',ok,{once:true});
    iframe.addEventListener('error',()=>{loaded=false},{once:true});
    setTimeout(()=>{
      if(loaded)return;
      alt.open=true;box.classList.add('primary-timeout');
      let n=box.querySelector('.chart-fallback-notice');
      if(!n){n=document.createElement('div');n.className='chart-fallback-notice';n.textContent='기본 차트 응답이 늦어서 대체 차트를 먼저 열었습니다.';alt.insertAdjacentElement('afterbegin',n)}
      internalFallback(alt,ticker);
    },TIMEOUT);
    const img=alt.querySelector('.finviz-fallback');
    if(img)img.addEventListener('error',()=>internalFallback(alt,ticker),{once:true});
  }
  function scan(){document.querySelectorAll('.multi-chart').forEach(attach)}
  const mo=new MutationObserver(scan);mo.observe(document.documentElement,{childList:true,subtree:true});scan();
})();